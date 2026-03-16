// This file contains the database connection logic for the blog application.
// Updated to support multiple images and paragraphs.
// Created by Luis González

import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import {
  DB_USER,
  DB_HOST,
  DB_DATABASE,
  DB_PASSWORD,
  DB_PORT,
} from './config.js';

const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
});

export class BlogConnections {
  constructor() {}

  _parseContentItem(item) {
    if (!item) return { text: '', subtitle: '' };
    
    let text = '';
    let subtitle = '';

    if (typeof item === 'object') {
      text = item.text || '';
      subtitle = (item.subtitle !== undefined && item.subtitle !== null) ? item.subtitle : '';
    } else if (typeof item === 'string') {
      const trimmed = item.trim();
      if (trimmed.startsWith('{')) {
        try {
          const parsed = JSON.parse(trimmed);
          text = parsed.text || '';
          subtitle = (parsed.subtitle !== undefined && parsed.subtitle !== null) ? parsed.subtitle : '';
        } catch (e) {
          text = item;
        }
      } else {
        text = item;
      }
    }
    
    return { text: String(text), subtitle: String(subtitle) };
  }

  async getAllArticles() {
    try {
      // Fetch articles with their first image for preview
      const res = await pool.query(`
        SELECT a.*, i.url as image 
        FROM articles a
        LEFT JOIN LATERAL (
          SELECT url FROM image_article 
          WHERE article_id = a.id 
          LIMIT 1
        ) i ON true
        ORDER BY a.date DESC
      `);
      // Map cathegory to category for compatibility with existing frontend expectations
      return res.rows.map(row => ({
        ...row,
        category: row.cathegory
      }));
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  async getArticleById(id) {
    try {
      const articleRes = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
      if (articleRes.rows.length === 0) return null;
      
      const article = articleRes.rows[0];
      // Compatibility mapping
      article.category = article.cathegory;

      // Fetch all images
      const imagesRes = await pool.query('SELECT url FROM image_article WHERE article_id = $1', [id]);
      article.images = imagesRes.rows.map(r => r.url);
      // For compatibility with single image components
      article.image = article.images[0] || null;
      
      // Fetch all text paragraphs with subtitles
      const textsRes = await pool.query('SELECT content, subtitle FROM text_article WHERE article_id = $1 ORDER BY order_index ASC', [id]);
      article.content = textsRes.rows.map(r => {
        // 1. Try to parse content if it might be JSON
        const parsed = this._parseContentItem(r.content);
        
        // 2. Use column values as primary if they are available or if parsed values are empty
        return {
          text: parsed.text || r.content || '',
          subtitle: r.subtitle || parsed.subtitle || ''
        };
      });
      
      return article;
    } catch (error) {
      console.error('Error fetching article by ID:', error);
      throw error;
    }
  }

  async insertArticle(articleData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const author = articleData.author || articleData.autor || '';
      const articleId = randomUUID();
      
      // Insert into articles table
      const articleRes = await client.query(
        `INSERT INTO articles (id, title, excerpt, cathegory, date, author)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [articleId, articleData.title, articleData.excerpt, articleData.category || articleData.cathegory, articleData.date, author]
      );
      
      const newArticle = articleRes.rows[0];
      
      // Insert images into image_article table
      if (articleData.images && Array.isArray(articleData.images)) {
        for (const url of articleData.images) {
          if (url) await client.query('INSERT INTO image_article (article_id, url) VALUES ($1, $2)', [articleId, url]);
        }
      } else if (articleData.image) {
        await client.query('INSERT INTO image_article (article_id, url) VALUES ($1, $2)', [articleId, articleData.image]);
      }
      
      // Insert paragraphs into text_article table
      if (articleData.content && Array.isArray(articleData.content)) {
        for (let i = 0; i < articleData.content.length; i++) {
          const { text, subtitle } = this._parseContentItem(articleData.content[i]);
          if (text || subtitle) {
            await client.query(
              'INSERT INTO text_article (article_id, content, subtitle, order_index) VALUES ($1, $2, $3, $4)',
              [articleId, text, subtitle, i]
            );
          }
        }
      } else if (articleData.content) {
        const { text, subtitle } = this._parseContentItem(articleData.content);
        await client.query('INSERT INTO text_article (article_id, content, subtitle, order_index) VALUES ($1, $2, $3, $4)', [articleId, text, subtitle, 0]);
      }
      
      await client.query('COMMIT');
      return newArticle;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error inserting article:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateArticle(id, articleData) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Handle articles table update
      const mainFields = {};
      ['title', 'excerpt', 'date', 'author'].forEach(f => {
        if (articleData[f] !== undefined) mainFields[f] = articleData[f];
      });
      if (articleData.category !== undefined) mainFields.cathegory = articleData.category;
      if (articleData.cathegory !== undefined) mainFields.cathegory = articleData.cathegory;
      
      const keys = Object.keys(mainFields);
      if (keys.length > 0) {
        const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
        const values = [id, ...keys.map(k => mainFields[k])];
        const query = `UPDATE articles SET ${sets} WHERE id = $1 RETURNING *`;
        await client.query(query, values);
      }

      // Handle images update (typically replace all)
      if (articleData.images && Array.isArray(articleData.images)) {
        await client.query('DELETE FROM image_article WHERE article_id = $1', [id]);
        for (const url of articleData.images) {
          if (url) await client.query('INSERT INTO image_article (article_id, url) VALUES ($1, $2)', [id, url]);
        }
      } else if (articleData.image !== undefined) {
        await client.query('DELETE FROM image_article WHERE article_id = $1', [id]);
        if (articleData.image) await client.query('INSERT INTO image_article (article_id, url) VALUES ($1, $2)', [id, articleData.image]);
      }

      // Handle paragraphs update (typically replace all)
      if (articleData.content !== undefined) {
        await client.query('DELETE FROM text_article WHERE article_id = $1', [id]);
        if (Array.isArray(articleData.content)) {
          for (let i = 0; i < articleData.content.length; i++) {
            const { text, subtitle } = this._parseContentItem(articleData.content[i]);
            if (text || subtitle) {
              await client.query(
                'INSERT INTO text_article (article_id, content, subtitle, order_index) VALUES ($1, $2, $3, $4)',
                [id, text, subtitle, i]
              );
            }
          }
        } else if (articleData.content) {
          const { text, subtitle } = this._parseContentItem(articleData.content);
          await client.query('INSERT INTO text_article (article_id, content, subtitle, order_index) VALUES ($1, $2, $3, $4)', [id, text, subtitle, 0]);
        }
      }

      await client.query('COMMIT');
      return this.getArticleById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating article:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteArticle(id) {
    try {
      // ON DELETE CASCADE handles related tables
      const res = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);
      return res.rows[0] || null;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  async close() {
    await pool.end();
  }
}
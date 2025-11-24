// This file contains the database connection logic for the blog application.
// Created by Luis González
// Rewritten to use `pg` Pool instead of Supabase

import { Pool } from 'pg';
import { randomUUID } from 'crypto';
import {
  DB_USER,
  DB_HOST,
  DB_DATABASE,
  DB_PASSWORD,
  DB_PORT,
} from './config.js';

// Create a pool using configuration values from config.js (env-loaded)
const pool = new Pool({
  user: DB_USER,
  host: DB_HOST,
  database: DB_DATABASE,
  password: DB_PASSWORD,
  port: DB_PORT,
});

/**
 * BlogConnections provides simple CRUD methods for the `articles` table.
 *
 * Methods:
 * - getAllArticles(): Promise<Array>
 * - getArticleById(id): Promise<Object|null>
 * - insertArticle(articleData): Promise<Object>
 * - updateArticle(id, articleData): Promise<Object|null>
 * - deleteArticle(id): Promise<Object|null>
 *
 * Notes:
 * - articleData is expected to have fields: title, excerpt, image, category, date, author, content
 */
export class BlogConnections {
  constructor() {}

  async getAllArticles() {
    try {
      const res = await pool.query('SELECT * FROM articles ORDER BY date DESC');
      return res.rows;
    } catch (error) {
      console.error('Error fetching articles:', error);
      throw error;
    }
  }

  async getArticleById(id) {
    try {
      const res = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
      return res.rows[0] || null;
    } catch (error) {
      console.error('Error fetching article by ID:', error);
      throw error;
    }
  }

  async insertArticle(articleData) {
    try {
      const res = await pool.query(
        `INSERT INTO articles (id, title, excerpt, image, category, date, author, content)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [randomUUID(), articleData.title, articleData.excerpt, articleData.image, articleData.category, articleData.date, articleData.author, articleData.content]
      );
      return res.rows[0];
    } catch (error) {
      console.error('Error inserting article:', error);
      throw error;
    }
  }

  async updateArticle(id, articleData) {
    try {
      const keys = Object.keys(articleData || {});
      if (keys.length === 0) return null;
      // Build SET clause dynamically and parameterize values
      const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
      const values = [id, ...keys.map(k => articleData[k])];
      const query = `UPDATE articles SET ${sets} WHERE id = $1 RETURNING *`;
      const res = await pool.query(query, values);
      return res.rows[0] || null;
    } catch (error) {
      console.error('Error updating article:', error);
      throw error;
    }
  }

  async deleteArticle(id) {
    try {
      const res = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);
      return res.rows[0] || null;
    } catch (error) {
      console.error('Error deleting article:', error);
      throw error;
    }
  }

  // close connection pool
  async close() {
    await pool.end();
  }
}

/*// this codes is for testing purposes only
const prueba = new BlogConnections();
prueba.insertArticle({
  title: 'Test Article',
  excerpt: 'This is a test article.',
    image: 'test.jpg',
    category: 'Testing',
    date: new Date(),
    author: 'Tester',
    content: 'This is the content of the test article.'
}).then(article => {
  console.log('Inserted article:', article);
}).catch(err => {
  console.error('Error inserting article:', err);
});

// End of testing code
prueba.close()
*/
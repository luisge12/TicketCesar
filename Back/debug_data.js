import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function debugData() {
    try {
        const res = await pool.query(`
            SELECT id, article_id, content, subtitle, order_index
            FROM text_article
            ORDER BY article_id, order_index
        `);
        console.log('All rows in text_article:');
        res.rows.forEach(row => {
            console.log(`ID: ${row.id}, Subtitle: [${row.subtitle}], Content Preview: ${row.content.substring(0, 30)}...`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
debugData();

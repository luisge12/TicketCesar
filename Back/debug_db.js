import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function check() {
    try {
        const res = await pool.query(`
            SELECT a.id, a.title, t.content, t.subtitle, t.order_index
            FROM articles a
            LEFT JOIN text_article t ON a.id = t.article_id
            ORDER BY a.id, t.order_index
        `);
        fs.writeFileSync('debug_paragraphs.json', JSON.stringify(res.rows, null, 2));
        console.log('Results written to debug_paragraphs.json');
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
check();

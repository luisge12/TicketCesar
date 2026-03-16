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

async function checkRecentArticles() {
    try {
        const res = await pool.query(`
            SELECT t.id, t.article_id, t.content, t.subtitle, t.order_index, a.title
            FROM text_article t
            JOIN articles a ON t.article_id = a.id
            ORDER BY a.date DESC, t.order_index ASC
            LIMIT 20
        `);
        console.log('Recent Paragraphs:');
        res.rows.forEach(row => {
            console.log(`Article: ${row.title}`);
            console.log(`  Row ID: ${row.id}`);
            console.log(`  Content: ${JSON.stringify(row.content)}`);
            console.log(`  Subtitle: ${JSON.stringify(row.subtitle)}`);
            console.log('---');
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
checkRecentArticles();

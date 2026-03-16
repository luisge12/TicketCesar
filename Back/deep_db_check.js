import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_DATABASE, password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function deepCheck() {
    try {
        const res = await pool.query(`
            SELECT t.id, t.article_id, t.content, t.subtitle, t.order_index, a.title,
                   pg_typeof(t.content) as content_type,
                   pg_typeof(t.subtitle) as subtitle_type
            FROM text_article t
            JOIN articles a ON t.article_id = a.id
            ORDER BY a.date DESC, t.order_index ASC
            LIMIT 10
        `);
        console.log('--- DB DATA ---');
        res.rows.forEach(row => {
            console.log(`Article: ${row.title} (Order: ${row.order_index})`);
            console.log(`  Content: [${row.content}] (Type: ${row.content_type})`);
            console.log(`  Subtitle: [${row.subtitle}] (Type: ${row.subtitle_type})`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
deepCheck();

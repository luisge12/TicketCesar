import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_DATABASE, password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function checkTeatro() {
    try {
        const res = await pool.query(`
            SELECT t.id, t.subtitle, t.content, a.title
            FROM text_article t
            JOIN articles a ON t.article_id = a.id
            WHERE a.title LIKE '%Teatro%'
            ORDER BY t.order_index
        `);
        console.log('Teatro article paragraphs:');
        res.rows.forEach(row => {
            console.log(`Subtitle: [${row.subtitle}], Content: ${row.content.substring(0, 30)}...`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
checkTeatro();

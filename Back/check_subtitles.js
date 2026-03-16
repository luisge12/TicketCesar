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

async function checkSubtitles() {
    try {
        const res = await pool.query(`
            SELECT id, article_id, content, subtitle, order_index
            FROM text_article
            WHERE subtitle IS NOT NULL AND subtitle != ''
        `);
        console.log('Rows with subtitles populated:');
        console.log(JSON.stringify(res.rows, null, 2));
        
        const allRes = await pool.query('SELECT COUNT(*) FROM text_article');
        console.log(`Total rows in text_article: ${allRes.rows[0].count}`);
        
        const subCountRes = await pool.query("SELECT COUNT(*) FROM text_article WHERE subtitle IS NOT NULL AND subtitle != ''");
        console.log(`Rows with non-empty subtitles: ${subCountRes.rows[0].count}`);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
checkSubtitles();

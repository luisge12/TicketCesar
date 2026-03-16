import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_DATABASE, password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function cleanSubtitles() {
    try {
        const res = await pool.query("UPDATE text_article SET subtitle = '' WHERE subtitle = 'subtitulo 1'");
        console.log(`Updated ${res.rowCount} rows.`);
        
        // Also delete the reproduction test article if it exists
        const delRes = await pool.query("DELETE FROM articles WHERE title = 'Reproduction Test'");
        console.log(`Deleted ${delRes.rowCount} test articles.`);
        
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
cleanSubtitles();

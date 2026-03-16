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

async function checkDefault() {
    try {
        const res = await pool.query(`
            SELECT column_name, column_default
            FROM information_schema.columns 
            WHERE table_name = 'text_article' AND column_name = 'id';
        `);
        console.log('ID default value:');
        console.table(res.rows);
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
checkDefault();

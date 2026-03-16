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

async function checkSchema() {
    try {
        const res = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'text_article'
            ORDER BY ordinal_position;
        `);
        console.log('text_article columns:');
        res.rows.forEach(row => {
            console.log(`${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
        });
    } catch (err) {
        console.error(err);
    } finally {
        await pool.end();
    }
}
checkSchema();

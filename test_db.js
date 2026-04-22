import { Pool } from 'pg';
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from './Back/src/config/index.js';

const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: parseInt(DB_PORT, 10),
});

async function updateActiveStatus() {
    try {
        console.log("Updating is_active status for all events...");
        const res = await pool.query(`
            UPDATE event SET is_active = NOT is_active;
        `);
        console.log(`Updated ${res.rowCount} events.`);
    } catch(err) {
        console.error("DB Error:", err.message);
    } finally {
        await pool.end();
    }
}

updateActiveStatus();

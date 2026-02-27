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

async function fixSchema() {
    try {
        console.log('Checking and fixing verification columns...');

        // Add columns if they don't exist (just in case they were added with wrong names)
        await pool.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
            ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255)
        `);

        // Verify one of the newly created accounts manually for testing
        const res = await pool.query('SELECT * FROM users ORDER BY created_at DESC LIMIT 1');
        const lastUser = res.rows[0];

        if (lastUser && !lastUser.is_verified) {
            console.log(`Setting is_verified to true for latest testing user: ${lastUser.email}`);
            await pool.query('UPDATE users SET is_verified = true WHERE id = $1', [lastUser.id]);
        }

        console.log('Schema fix and test user updated!');
    } catch (error) {
        console.error('Error fixing schema:', error);
    } finally {
        pool.end();
    }
}

fixSchema();

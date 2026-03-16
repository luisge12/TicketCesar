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

async function fix() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        console.log('Fetching all paragraphs to check for corruption...');
        const res = await client.query('SELECT id, content, subtitle FROM text_article');
        
        for (const row of res.rows) {
            if (row.content && row.content.trim().startsWith('{') && row.content.trim().endsWith('}')) {
                try {
                    const parsed = JSON.parse(row.content);
                    if (parsed && typeof parsed === 'object' && (parsed.text !== undefined || parsed.subtitle !== undefined)) {
                        console.log(`Fixing corrupted row ${row.id}`);
                        const newText = parsed.text || '';
                        const newSubtitle = parsed.subtitle || row.subtitle;
                        
                        await client.query(
                            'UPDATE text_article SET content = $1, subtitle = $2 WHERE id = $3',
                            [newText, newSubtitle, row.id]
                        );
                    }
                } catch (e) {
                    // Not valid JSON or not our special format, skip
                }
            }
        }
        
        await client.query('COMMIT');
        console.log('Cleanup successful.');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Cleanup failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

fix();

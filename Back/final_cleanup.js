import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_DATABASE, password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function finalCleanup() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const res = await client.query('SELECT id, content, subtitle FROM text_article');
        let count = 0;
        
        for (const row of res.rows) {
            let content = row.content;
            let subtitle = row.subtitle;
            let dirty = false;

            // Try to parse if it looks like JSON
            if (typeof content === 'string' && content.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(content);
                    if (parsed && typeof parsed === 'object') {
                        content = parsed.text || '';
                        subtitle = parsed.subtitle || subtitle;
                        dirty = true;
                    }
                } catch (e) { }
            }

            if (dirty) {
                console.log(`Fixing row ${row.id}: subtitle -> [${subtitle}]`);
                await client.query(
                    'UPDATE text_article SET content = $1, subtitle = $2 WHERE id = $3',
                    [content, subtitle, row.id]
                );
                count++;
            }
        }
        
        await client.query('COMMIT');
        console.log(`Cleanup finished. Fixed ${count} rows.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}
finalCleanup();

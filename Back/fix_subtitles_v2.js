import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pg;

const pool = new Pool({
    user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_DATABASE, password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

async function fixSubtitles() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const res = await client.query('SELECT id, content, subtitle FROM text_article');
        let fixedCount = 0;
        
        for (const row of res.rows) {
            let content = row.content;
            let subtitle = row.subtitle;
            let needsUpdate = false;

            // Check if content is stringified JSON
            if (typeof content === 'string' && content.trim().startsWith('{')) {
                try {
                    const parsed = JSON.parse(content);
                    if (parsed && typeof parsed === 'object') {
                        console.log(`Found JSON content in row ${row.id}`);
                        content = parsed.text || content;
                        if (parsed.subtitle && !subtitle) {
                            subtitle = parsed.subtitle;
                        }
                        needsUpdate = true;
                    }
                } catch (e) { }
            }

            if (needsUpdate) {
                console.log(`Updating row ${row.id}: subtitle -> ${subtitle}`);
                await client.query(
                    'UPDATE text_article SET content = $1, subtitle = $2 WHERE id = $3',
                    [content, subtitle, row.id]
                );
                fixedCount++;
            }
        }
        
        await client.query('COMMIT');
        console.log(`Fixed ${fixedCount} rows.`);
    } catch (err) {
        await client.query('ROLLBACK');
        console.error(err);
    } finally {
        client.release();
        await pool.end();
    }
}
fixSubtitles();

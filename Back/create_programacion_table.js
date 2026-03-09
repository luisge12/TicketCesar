
import { Pool } from 'pg';
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from './config.js';

const pool = new Pool({
    user: DB_USER,
    host: DB_HOST,
    database: DB_DATABASE,
    password: DB_PASSWORD,
    port: parseInt(DB_PORT, 10),
});

async function createProgramacionTable() {
    const query = `
    CREATE TABLE IF NOT EXISTS programacion_simple (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        compania VARCHAR(255),
        fecha DATE NOT NULL,
        hora TIME NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
    
    try {
        await pool.query(query);
        console.log('Tabla programacion_simple creada exitosamente');
    } catch (error) {
        console.error('Error al crear la tabla:', error);
    } finally {
        await pool.end();
    }
}

createProgramacionTable();


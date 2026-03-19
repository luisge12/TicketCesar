import { Pool } from 'pg';
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from '../config/index.js';

export class EquipoConnections {
    constructor() {
        this.pool = new Pool({
            user: DB_USER,
            host: DB_HOST,
            database: DB_DATABASE,
            password: DB_PASSWORD,
            port: parseInt(DB_PORT, 10),
        });

        this.initTable();
    }

    async initTable() {
        const query = `
        CREATE TABLE IF NOT EXISTS equipo (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            apellido VARCHAR(255) NOT NULL,
            rol VARCHAR(255) NOT NULL,
            descripcion TEXT,
            foto TEXT,
            orden INT DEFAULT 0
        );
        `;
        try {
            await this.pool.query(query);
            
            // Asegurar que la columna orden exista si la tabla ya había sido creada antes
            await this.pool.query('ALTER TABLE equipo ADD COLUMN IF NOT EXISTS orden INT DEFAULT 0;');
            
            // Verificamos si la tabla esta vacia para poblarla
            const checkQuery = 'SELECT COUNT(*) FROM equipo';
            const res = await this.pool.query(checkQuery);
            if (parseInt(res.rows[0].count, 10) === 0) {
                const insertQuery = `
                INSERT INTO equipo (nombre, apellido, rol, descripcion, foto) VALUES 
                ('Carlos', 'Moreno', 'Director', 'Director actual del Teatro César Rengifo. Lidera la visión artística y administrativa del teatro, fortaleciendo el vínculo con la comunidad universitaria y cultural.', 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=CM'),
                ('Igor', 'Martínez', 'Coordinador de Producción', 'Inició el ambicioso proyecto de recuperación del teatro en 2021. Lideró la transformación y restauración del espacio patrimonial.', 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=IM'),
                ('Jony', 'Parra', 'Coordinador de Eventos', 'Continuó la labor de recuperación en 2022, consolidando el modelo de autogestión y logrando la reapertura gradual del teatro.', 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=JP'),
                ('María', 'García', 'Coordinadora de Marketing', 'Encargada de la comunicación y promoción de eventos culturales. Gestiona las redes sociales y estrategias de difusión del teatro.', 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=MG'),
                ('Roberto', 'Méndez', 'Técnico de Sonido', 'Profesional responsable del manejo técnico de audio en todas las presentaciones y eventos del teatro.', 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=RM'),
                ('Ana', 'López', 'Atención al Público', 'Brinda atención cordial a los asistentes y gestiona la venta de tickets y reservas.', 'https://via.placeholder.com/200x200/4a4a4a/ffffff?text=AL');
                `;
                await this.pool.query(insertQuery);
                console.log('Equipo inicial insertado en la base de datos.');
            }
        } catch (error) {
            console.error('Error initializing equipo table:', error);
        }
    }

    async close() {
        await this.pool.end();
    }

    async getAll() {
        try {
            const res = await this.pool.query('SELECT * FROM equipo ORDER BY orden ASC, id ASC');
            return res.rows;
        } catch (error) {
            console.error('Error fetching equipo:', error);
            throw error;
        }
    }

    async create(data) {
        const query = `
        INSERT INTO equipo (nombre, apellido, rol, descripcion, foto, orden) 
        VALUES ($1, $2, $3, $4, $5, $6) RETURNING *
        `;
        const values = [data.nombre, data.apellido, data.rol, data.descripcion || null, data.foto || null, data.orden || 0];
        try {
            const res = await this.pool.query(query, values);
            return res.rows[0];
        } catch (error) {
            console.error('Error creating equipo member:', error);
            throw error;
        }
    }

    async update(id, data) {
        let query;
        let values;
        if (data.foto) {
             query = `
            UPDATE equipo SET nombre = $1, apellido = $2, rol = $3, descripcion = $4, foto = $5, orden = $6 
            WHERE id = $7 RETURNING *
            `;
            values = [data.nombre, data.apellido, data.rol, data.descripcion || null, data.foto, data.orden || 0, id];
        } else {
             query = `
            UPDATE equipo SET nombre = $1, apellido = $2, rol = $3, descripcion = $4, orden = $5 
            WHERE id = $6 RETURNING *
            `;
            values = [data.nombre, data.apellido, data.rol, data.descripcion || null, data.orden || 0, id];
        }

        try {
            const res = await this.pool.query(query, values);
            if (res.rowCount === 0) throw new Error('Member not found');
            return res.rows[0];
        } catch (error) {
            console.error('Error updating equipo member:', error);
            throw error;
        }
    }

    async delete(id) {
        const query = 'DELETE FROM equipo WHERE id = $1 RETURNING *';
        try {
            const res = await this.pool.query(query, [id]);
            if (res.rowCount === 0) throw new Error('Member not found');
            return res.rows[0];
        } catch (error) {
            console.error('Error deleting equipo member:', error);
            throw error;
        }
    }
}

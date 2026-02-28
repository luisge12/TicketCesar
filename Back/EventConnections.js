import crypto from 'crypto';
import { Pool } from 'pg';
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from './config.js';

const PALCO_ROWS = [
    { row: 'A', seats: 15 }, { row: 'B', seats: 15 }, { row: 'C', seats: 15 }, { row: 'D', seats: 15 },
    { row: 'E', seats: 15 }, { row: 'F', seats: 15 }
];

const PLATEA_ROWS = [
    { row: 'A', seats: 10 }, { row: 'C', seats: 11 }, { row: 'E', seats: 10 }, { row: 'G', seats: 10 },
    { row: 'I', seats: 10 }, { row: 'K', seats: 10 }, { row: 'M', seats: 10 }, { row: 'Ñ', seats: 9 },
    { row: 'P', seats: 10 }, { row: 'R', seats: 9 }, { row: 'T', seats: 10 },
    { row: 'B', seats: 10 }, { row: 'D', seats: 11 }, { row: 'F', seats: 10 }, { row: 'H', seats: 10 },
    { row: 'J', seats: 10 }, { row: 'L', seats: 10 }, { row: 'N', seats: 10 }, { row: 'O', seats: 9 },
    { row: 'Q', seats: 10 }, { row: 'S', seats: 9 }, { row: 'U', seats: 10 }
];


export class EventConnections {
    constructor() {
        this.pool = new Pool({
            user: DB_USER,
            host: DB_HOST,
            database: DB_DATABASE,
            password: DB_PASSWORD,
            port: parseInt(DB_PORT, 10),
        });
    }

    async close() {
        await this.pool.end();
    }

    async insertEvent(event_data) {
        const id = crypto.randomUUID();
        const rawExcerpt = typeof event_data.excerpt === 'string'
            ? event_data.excerpt.trim()
            : '';

        if (rawExcerpt && rawExcerpt.length > 240) {
            throw new Error('El excerpt debe tener máximo 240 caracteres');
        }

        const excerpt = rawExcerpt
            ? rawExcerpt
            : (typeof event_data.description === 'string' && event_data.description.trim())
                ? event_data.description.trim().slice(0, 240)
                : null;

        const query = `
        INSERT INTO event (id, name, excerpt, description, date_start, date_end, image, is_active, tickets_sold, attendance, ticket_price, category, hour) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
        `;

        const values = [
            id,
            event_data.name,
            excerpt,
            event_data.description,
            event_data.date_start,
            null,
            event_data.image,
            false,
            0,
            0,
            event_data.ticket_price,
            event_data.category,
            event_data.hour
        ];
        try {
            const res = await this.pool.query(query, values);
            const newEvent = res.rows[0];

            // Generate seats automatically for the new event
            await this.generateSeatsForEvent(newEvent.id);

            return newEvent;
        } catch (error) {
            console.error(error);
            if (error.code === '23505') {
                throw new Error('this event id already exist, try again')
            }
        }
    }

    async updateEvent(id, event_data) {
        let query = '';
        let values = [];

        // Check if excerpt needs to be truncated
        const rawExcerpt = typeof event_data.excerpt === 'string'
            ? event_data.excerpt.trim()
            : '';

        if (rawExcerpt && rawExcerpt.length > 240) {
            throw new Error('El excerpt debe tener máximo 240 caracteres');
        }

        const excerpt = rawExcerpt
            ? rawExcerpt
            : (typeof event_data.description === 'string' && event_data.description.trim())
                ? event_data.description.trim().slice(0, 240)
                : null;

        if (event_data.image) {
            query = `
            UPDATE event 
            SET name = $1, excerpt = $2, description = $3, date_start = $4, image = $5, ticket_price = $6, category = $7, hour = $8
            WHERE id = $9
            RETURNING *
            `;
            values = [
                event_data.name,
                excerpt,
                event_data.description,
                event_data.date_start,
                event_data.image,
                event_data.ticket_price,
                event_data.category,
                event_data.hour,
                id
            ];
        } else {
            query = `
            UPDATE event 
            SET name = $1, excerpt = $2, description = $3, date_start = $4, ticket_price = $5, category = $6, hour = $7
            WHERE id = $8
            RETURNING *
            `;
            values = [
                event_data.name,
                excerpt,
                event_data.description,
                event_data.date_start,
                event_data.ticket_price,
                event_data.category,
                event_data.hour,
                id
            ];
        }

        try {
            const res = await this.pool.query(query, values);
            if (res.rowCount === 0) {
                throw new Error('Event not found');
            }
            return res.rows[0];
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    async generateSeatsForEvent(eventId) {
        // Palco
        for (const group of PALCO_ROWS) {
            for (let i = 1; i <= group.seats; i++) {
                await this.pool.query(
                    'INSERT INTO event_seats (event_id, seat_id, state) VALUES ($1, $2, $3);',
                    [eventId, `Palco-${group.row}-${i}`, 'available']
                );
            }
        }

        // Platea
        for (const group of PLATEA_ROWS) {
            for (let i = 1; i <= group.seats; i++) {
                await this.pool.query(
                    'INSERT INTO event_seats (event_id, seat_id, state) VALUES ($1, $2, $3);',
                    [eventId, `Platea-${group.row}-${i}`, 'available']
                );
            }
        }
    }

    async getEvents() {
        const query = 'SELECT * FROM event'

        try {
            const res = await this.pool.query(query);
            return res.rows;
        } catch (error) {
            console.log(error);
        }
    }

    async getEventsByCategory(category) {
        const query = 'SELECT * FROM event WHERE category = $1';
        try {
            const res = await this.pool.query(query, [category]);
            return res.rows;
        } catch (error) {
            console.error('Error fetching events by category:', error);
            throw error;
        }
    }

    async getEventById(id) {
        const query = 'SELECT * FROM event WHERE id = $1';
        try {
            const res = await this.pool.query(query, [id]);
            return res.rows[0];
        }
        catch (error) {
            console.error('Error fetching event by ID:', error);
            throw error;
        }
    }

    async getStateSeats(eventId) {
        const query = 'SELECT * FROM event_seats WHERE event_id = $1 ORDER BY seat_id';
        try {
            const res = await this.pool.query(query, [eventId]);
            return res.rows;
        } catch (error) {
            console.error('Error fetching seats:', error);
            throw error;
        }
    }

    async getSeatState(eventId, seatId) {
        const query = 'SELECT state FROM event_seats WHERE event_id = $1 AND seat_id = $2';
        try {
            const res = await this.pool.query(query, [eventId, seatId]);
            if (res.rows.length === 0) {
                return { exists: false, state: null };
            }
            return { exists: true, state: res.rows[0].state };
        } catch (error) {
            console.error('Error fetching seat state:', error);
            throw error;
        }
    }

    async updateSeatState(eventId, seatId, newState) {
        const query = 'UPDATE event_seats SET state = $3 WHERE event_id = $1 AND seat_id = $2 RETURNING *';
        try {
            const res = await this.pool.query(query, [eventId, seatId, newState]);
            if (res.rowCount === 0) {
                throw new Error('Seat not found');
            }
            return res.rows[0];
        } catch (error) {
            console.error('Error updating seat state:', error);
            throw error;
        }
    }
}

/*//code for test the class
const eventConnections = new EventConnections();
eventConnections.getEvets().then(events => console.log(events));
*/

import { Pool } from 'pg';
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from '../config/index.js'
import crypto from 'crypto';
import { EventConnections } from './Event.js';


export class ReservationsConnections {
    constructor() {
        this.pool = new Pool({
            user: DB_USER,
            host: DB_HOST,
            database: DB_DATABASE,
            password: DB_PASSWORD,
            port: parseInt(DB_PORT, 10),
        });
        this.eventConnections = new EventConnections();
    }

    async makeBulkReservation(eventId, seatIds, userEmail, payMethod, totalQuantity, totalPrice) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const reservationId = crypto.randomUUID();

            const insertResQuery = `
                INSERT INTO reservations (id, event_id, user_email, pay_method, tickets_quantity, total_price)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(insertResQuery, [reservationId, eventId, userEmail, payMethod, totalQuantity, totalPrice]);

            for (const seatId of seatIds) {
                await client.query('INSERT INTO reservation_seat (reservation_id, seat_id) VALUES ($1, $2)', [reservationId, seatId]);
                await client.query('UPDATE event_seats SET state = $1 WHERE event_id = $2 AND seat_id = $3', ['reserved', eventId, seatId]);
            }

            await client.query('COMMIT');
            return { reservationId };
        } catch (error) {
            await client.query('ROLLBACK');
            console.error('Database error in makeBulkReservation:', error);
            throw error;
        } finally {
            client.release();
        }
    }
}

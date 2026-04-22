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

    async makeBulkReservation(eventId, seatIds, userEmail, payMethod, totalQuantity, totalPrice, seatState = 'reserved') {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            const nonRecorridoSeats = seatIds.filter(id => !id.startsWith('recorrido-general'));
            if (nonRecorridoSeats.length > 0) {
                const checkRes = await client.query(`
                    SELECT seat_id, state 
                    FROM event_seats 
                    WHERE event_id = $1 AND seat_id = ANY($2)
                    FOR UPDATE
                `, [eventId, nonRecorridoSeats]);
                
                const unavailableSeats = checkRes.rows.filter(row => row.state !== 'available');
                if (unavailableSeats.length > 0) {
                    throw new Error('Uno o más asientos acaban de ser ocupados. Por favor, actualiza y vuelve a intentar.');
                }
            }

            const reservationId = crypto.randomUUID();

            const insertResQuery = `
                INSERT INTO reservations (id, event_id, user_email, pay_method, tickets_quantity, total_price)
                VALUES ($1, $2, $3, $4, $5, $6)
            `;
            await client.query(insertResQuery, [reservationId, eventId, userEmail, payMethod, totalQuantity, totalPrice]);

            for (const seatId of seatIds) {
                if (!seatId.startsWith('recorrido-general')) {
                    await client.query(`
                        DELETE FROM reservation_seat 
                        WHERE seat_id = $1 
                        AND reservation_id IN (SELECT id FROM reservations WHERE event_id = $2)
                    `, [seatId, eventId]);
                }
                await client.query('INSERT INTO reservation_seat (reservation_id, seat_id) VALUES ($1, $2)', [reservationId, seatId]);
                await client.query('UPDATE event_seats SET state = $1 WHERE event_id = $2 AND seat_id = $3', [seatState, eventId, seatId]);
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

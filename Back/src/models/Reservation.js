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

    async makeBulkReservation(eventId, seatIds, userEmail, payMethod, totalQuantity, totalPrice, seatState = 'reserved', paymentReference = null) {
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
                INSERT INTO reservations (id, event_id, user_email, pay_method, tickets_quantity, total_price, payment_reference, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
            // Si seatState es 'pending_verification', el estado de la orden es 'pending', sino 'approved'
            const reservationStatus = seatState === 'pending_verification' ? 'pending' : 'approved';
            await client.query(insertResQuery, [reservationId, eventId, userEmail, payMethod, totalQuantity, totalPrice, paymentReference, reservationStatus]);

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

    async getPendingReservations() {
        const query = `
            SELECT r.*, e.name as event_name, 
            COALESCE(json_agg(rs.seat_id) FILTER (WHERE rs.seat_id IS NOT NULL), '[]') as seats
            FROM reservations r
            JOIN event e ON r.event_id = e.id
            LEFT JOIN reservation_seat rs ON r.id = rs.reservation_id
            WHERE r.status = 'pending'
            GROUP BY r.id, e.name
            ORDER BY r.buy_date DESC
        `;
        const { rows } = await this.pool.query(query);
        return rows;
    }

    async approveReservation(reservationId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query(
                "UPDATE reservations SET status = 'approved' WHERE id = $1 AND status = 'pending' RETURNING event_id",
                [reservationId]
            );
            if (res.rows.length === 0) throw new Error("Reserva no encontrada o ya procesada");
            const eventId = res.rows[0].event_id;

            // Cambiar los asientos a occupied (o dejarlos en reserved, depende del flujo. Usualmente paid/occupied)
            const { rows: seats } = await client.query('SELECT seat_id FROM reservation_seat WHERE reservation_id = $1', [reservationId]);
            for(let s of seats) {
                await client.query("UPDATE event_seats SET state = 'occupied' WHERE event_id = $1 AND seat_id = $2", [eventId, s.seat_id]);
            }
            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async rejectReservation(reservationId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const res = await client.query(
                "UPDATE reservations SET status = 'rejected' WHERE id = $1 AND status = 'pending' RETURNING event_id",
                [reservationId]
            );
            if (res.rows.length === 0) throw new Error("Reserva no encontrada o ya procesada");
            const eventId = res.rows[0].event_id;

            // Liberar los asientos
            const { rows: seats } = await client.query('SELECT seat_id FROM reservation_seat WHERE reservation_id = $1', [reservationId]);
            for(let s of seats) {
                await client.query("UPDATE event_seats SET state = 'available' WHERE event_id = $1 AND seat_id = $2", [eventId, s.seat_id]);
            }
            // Borramos la relación de asientos
            await client.query('DELETE FROM reservation_seat WHERE reservation_id = $1', [reservationId]);

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

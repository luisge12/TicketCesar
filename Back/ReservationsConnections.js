import { Pool } from 'pg';
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from './config.js'
import crypto from 'crypto';
import { EventConnections } from './EventConnections.js';


export class ReservationsConnections{
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

    async makeReservation(eventId, seatId, userEmail) {
        // Check if seat is exist and is available
        const seatState = await this.eventConnections.getSeatState(eventId, seatId);
        if (!seatState.exists) {
            throw new Error('Seat does not exist for this event');
        }
        if (seatState.state !== 'available') {
            throw new Error('Seat is not available');
        }
        // Create reservation
        const reservationId = crypto.randomUUID();
        const buyId = crypto.randomUUID();
        const insertQuery = `INSERT INTO reservations (id, event_id, seat_id, user_email, buy_id) VALUES ($1, $2, $3, $4, $5)`;
        await this.pool.query(insertQuery, [reservationId, eventId, seatId, userEmail, buyId]);
        // Update seat state to 'reserved'
        await this.eventConnections.updateSeatState(eventId, seatId, 'reserved');
        return { reservationId, buyId };
    }

    
}
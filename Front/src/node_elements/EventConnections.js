import { Pool } from 'pg';
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from './config.js'


export class EventConnections{
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

    async insertEvent(event_data){
        const id = crypto.randomUUID();
        const query = `
        INSERT INTO event (id, name, description, date_start, date_end, image, is_active, tickets_sold, attendance, ticket_price, category) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
        `;

        const values = [
            id,
            event_data.name,
            event_data.description,
            event_data.date_start,
            null,
            event_data.image,
            false,
            0,
            0,
            event_data.ticket_price,
            event_data.category
        ];
        console.log('Inserting event with values:', values); // Para debug

        try{
            const res = await this.pool.query(query, values);
            return res.rows[0];
        } catch(error){
            console.error(error);
            if (error.code === '23505'){
                throw new Error('this event id already exist, try again')
            }
        }
    }

    async getEvents(){
        const query = 'SELECT * FROM event'

        try{
            const res = await this.pool.query(query);
            return res.rows;
        } catch(error){
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
    
}

/*//code for test the class
const eventConnections = new EventConnections();
eventConnections.getEvets().then(events => console.log(events));
*/

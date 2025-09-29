import { supabase } from './config.js';
import { randomUUID } from 'crypto';

export class EventConnections {
    // No necesitas constructor ni pool con Supabase

    async insertEvent(event_data) {
        const id = randomUUID();
        
        const eventData = {
            id: id,
            name: event_data.name,
            description: event_data.description,
            date_start: event_data.date_start,
            date_end: event_data.date_end || event_data.date_start, // Usa date_end si existe, sino date_start
            image_url: event_data.image, // Cambiado a image_url (URL en lugar de bytes)
            is_active: false,
            tickets_sold: 0,
            attendance: 0,
            ticket_price: event_data.ticket_price,
            category: event_data.category
        };

        //console.log('Inserting event with values:', eventData); // Para debug

        try {
            const { data, error } = await supabase
                .from('events')
                .insert([eventData])
                .select();

            if (error) throw error;
            return data[0];
        } catch(error) {
            console.error('Error inserting event:', error);
            if (error.code === '23505') {
                throw new Error('This event id already exists, try again');
            }
            throw error;
        }
    }

    async getEvents() {
        try {
            const { data, error } = await supabase
                .from('events') 
                .select('*')
                .order('date_start', { ascending: true });

            if (error) throw error;
            return data;
        } catch(error) {
            console.error('Error fetching events:', error);
            throw error;
        }
    }

    async getEventsByCategory(category) {
        try {
            const { data, error } = await supabase
                .from('events') // Cambiado a plural
                .select('*')
                .eq('category', category)
                .order('date_start', { ascending: true });

            if (error) throw error;
            return data;
        } catch(error) {
            console.error('Error fetching events by category:', error);
            throw error;
        }
    }

    async getEventById(id) {
        try {
            const { data, error } = await supabase
                .from('events') // Cambiado a plural
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch(error) {
            console.error('Error fetching event by ID:', error);
            throw error;
        }
    }

    // Método adicional: Obtener solo eventos activos
    async getActiveEvents() {
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('is_active', true)
                .order('date_start', { ascending: true });

            if (error) throw error;
            return data;
        } catch(error) {
            console.error('Error fetching active events:', error);
            throw error;
        }
    }

    // Método adicional: Actualizar evento
    async updateEvent(id, updates) {
        try {
            const { data, error } = await supabase
                .from('events')
                .update(updates)
                .eq('id', id)
                .select();

            if (error) throw error;
            return data[0];
        } catch(error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }

    // No necesitas el método close() con Supabase
}

/*//code for test the class
const eventConnections = new EventConnections();
eventConnections.getEvents().then(events => console.log(events));
*/
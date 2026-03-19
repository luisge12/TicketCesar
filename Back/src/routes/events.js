import express from 'express';
import { validateRequest } from '../middleware/validate.js';
import { eventSchema, programacionSimpleSchema } from '../validators/eventValidator.js';

export default function createEventsRouter({ eventconnect, requireAdmin }) {
  const router = express.Router();

  router.get('/get-events', async (req, res) => {
    try {
      const events = await eventconnect.getEvents();
      res.json(events);
    } catch (error) {
      console.error('Error fetching events:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/create-event', requireAdmin, validateRequest(eventSchema), async (req, res, next) => {
    const eventData = req.body;
    try {
      const newEvent = await eventconnect.insertEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error.message === 'El excerpt debe tener máximo 240 caracteres') {
        return res.status(400).json({ error: error.message });
      }
      next(error);
    }
  });

  router.put('/edit-event/:id', requireAdmin, validateRequest(eventSchema), async (req, res, next) => {
    const { id } = req.params;
    const eventData = req.body;
    try {
      const updatedEvent = await eventconnect.updateEvent(id, eventData);
      res.json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      if (error.message === 'El excerpt debe tener máximo 240 caracteres') {
        return res.status(400).json({ error: error.message });
      }
      if (error.message === 'Event not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  });

  router.get('/events/category/:category', async (req, res) => {
    const { category } = req.params;
    try {
      const events = await eventconnect.getEventsByCategory(category);
      res.json(events);
    } catch (error) {
      console.error('Error fetching events by category:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/event/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const event = await eventconnect.getEventById(id);
      res.json(event);
    } catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/get_state_seat/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const eventSeats = await eventconnect.getStateSeats(id);
      res.json(eventSeats);
    }
    catch (error) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.put('/update_seat_state', requireAdmin, async (req, res) => {
    const { eventId, seatId, newState } = req.body;
    try {
      if (Array.isArray(seatId)) {
        await eventconnect.updateSeatsState(eventId, seatId, newState);
      } else {
        await eventconnect.updateSeatState(eventId, seatId, newState);
      }
      res.json({ message: 'Seat state updated successfully' });
    } catch (error) {
      console.error('Error updating seat state:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/programacion/:mes/:anio', async (req, res) => {
    const { mes, anio } = req.params;
    try {
      const programacion = await eventconnect.getProgramacion(parseInt(mes), parseInt(anio));
      res.json(programacion);
    } catch (error) {
      console.error('Error fetching programacion:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/programacion', requireAdmin, async (req, res) => {
    const { eventId, mes, anio } = req.body;
    try {
      const result = await eventconnect.addToProgramacion(eventId, mes, anio);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error adding to programacion:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.delete('/programacion', requireAdmin, async (req, res) => {
    const { eventId, mes, anio } = req.body;
    try {
      const result = await eventconnect.removeFromProgramacion(eventId, mes, anio);
      res.json(result);
    } catch (error) {
      console.error('Error removing from programacion:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/programacion-simple', async (req, res) => {
    try {
      const programacion = await eventconnect.getAllProgramacionSimple();
      res.json(programacion);
    } catch (error) {
      console.error('Error fetching programacion simple:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.get('/programacion-simple/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const programacion = await eventconnect.getProgramacionSimpleById(id);
      res.json(programacion);
    } catch (error) {
      console.error('Error fetching programacion simple:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  router.post('/programacion-simple', requireAdmin, validateRequest(programacionSimpleSchema), async (req, res, next) => {
    const data = req.body;
    try {
      const result = await eventconnect.insertProgramacionSimple(data);
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating programacion simple:', error);
      next(error);
    }
  });

  router.put('/programacion-simple/:id', requireAdmin, validateRequest(programacionSimpleSchema), async (req, res, next) => {
    const { id } = req.params;
    const data = req.body;
    try {
      const result = await eventconnect.updateProgramacionSimple(id, data);
      res.json(result);
    } catch (error) {
      console.error('Error updating programacion simple:', error);
      if (error.message === 'Programación no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  });

  router.delete('/programacion-simple/:id', requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
      const result = await eventconnect.deleteProgramacionSimple(id);
      res.json(result);
    } catch (error) {
      console.error('Error deleting programacion simple:', error);
      if (error.message === 'Programación no encontrada') {
        return res.status(404).json({ error: error.message });
      }
      res.status(500).json({ error: 'Internal Server Error: ' + error.message });
    }
  });

  return router;
}

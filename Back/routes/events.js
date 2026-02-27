import express from 'express';

export default function createEventsRouter({ eventconnect }) {
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

  router.post('/create-event', async (req, res) => {
    const eventData = req.body;
    try {
      const newEvent = await eventconnect.insertEvent(eventData);
      res.status(201).json(newEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      res.status(500).json({ error: 'Internal Server Error' });
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

  // get aviailable seats for an event
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

    router.put('/update_seat_state', async (req, res) => {
      const { eventId, seatId, newState } = req.body;
        try {
            await eventconnect.updateSeatState(eventId, seatId, newState);
            res.json({ message: 'Seat state updated successfully' });
        } catch (error) {
            console.error('Error updating seat state:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });

  return router;
}

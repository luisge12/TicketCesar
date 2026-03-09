import express from 'express';

export default function createReservationsRouter({ reservationsConnect, requireAuth }) {
  const router = express.Router();

  router.post('/reservations', requireAuth, async (req, res) => {
    const { eventId, seatId, paymentMethod, totalPrice } = req.body;
    const userEmail = req.session.user.email;

    if (!eventId || !seatId) {
      return res.status(400).json({ error: 'Se requieren eventId y seatId' });
    }

    const seatIds = Array.isArray(seatId) ? seatId : [seatId];

    try {
      const result = await reservationsConnect.makeBulkReservation(
        eventId,
        seatIds,
        userEmail,
        paymentMethod,
        seatIds.length,
        totalPrice
      );
      res.status(201).json(result);
    } catch (error) {
      console.error('Error creating reservation:', error);
      res.status(400).json({ error: error.message || 'Error al crear reserva' });
    }
  });

  return router;
}

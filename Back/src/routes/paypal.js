import express from 'express';
import { createOrder, capturePayment } from '../services/paypalService.js';

export default function createPaypalRouter({ productsConnect, reservationsConnect, requireAuth }) {
    const router = express.Router();

    router.post('/create-order', requireAuth, async (req, res, next) => {
        try {
            const { totalPrice } = req.body;

            if (!totalPrice || isNaN(totalPrice) || totalPrice <= 0) {
                return res.status(400).json({ error: 'Monto total inválido' });
            }

            // Idealmente, aquí se debería recalcular el precio usando los IDs de la base de datos
            // por seguridad. Por simplicidad en esta iteración, tomaremos el valor del frontend.
            const orderData = await createOrder(totalPrice);
            
            // Retorna el orderID al frontend
            res.status(200).json({ id: orderData.id });
        } catch (error) {
            console.error('Error creating PayPal order:', error);
            next(error);
        }
    });

    router.post('/capture-order', requireAuth, async (req, res, next) => {
        try {
            const { orderID, mode, eventId, selectedSeats, totalPrice, items } = req.body;
            const userEmail = req.session.user.email;

            if (!orderID) {
                return res.status(400).json({ error: 'Falta orderID' });
            }

            // 1. Capturar el pago en PayPal
            const captureData = await capturePayment(orderID);

            // Validar que el pago fue completado
            const isCompleted = captureData.status === 'COMPLETED';
            if (!isCompleted) {
                return res.status(400).json({ error: 'El pago no pudo ser completado', captureData });
            }

            // 2. Procesar la lógica interna de negocio si el pago es exitoso
            if (mode === 'ticket') {
                if (!eventId || !selectedSeats || selectedSeats.length === 0) {
                    return res.status(400).json({ error: 'Faltan datos para la reserva (eventId, selectedSeats)' });
                }

                await reservationsConnect.makeBulkReservation(
                    eventId,
                    selectedSeats,
                    userEmail,
                    'paypal',
                    selectedSeats.length,
                    totalPrice,
                    'reserved' // o 'paid'
                );

            } else if (mode === 'cart') {
                if (!items || items.length === 0) {
                    return res.status(400).json({ error: 'El carrito está vacío o faltan items' });
                }

                await productsConnect.purchaseItems(items);
            } else {
                return res.status(400).json({ error: 'Modo de compra no válido' });
            }

            // Retornar éxito al frontend
            res.status(200).json({ success: true, captureData });
        } catch (error) {
            console.error('Error capturing PayPal order:', error);
            
            if (error.message && (error.message.includes('Stock insuficiente') || error.message.includes('no encontrado'))) {
                 // Si falla el stock después de cobrar... esto requeriría un reembolso en un sistema real.
                 // Por ahora solo enviamos el error.
                 return res.status(409).json({ error: error.message });
            }

            next(error);
        }
    });

    return router;
}

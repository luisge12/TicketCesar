import express from 'express';

export default function createAdminPaymentsRouter({ reservationsConnect, orderConnections, requireAdmin }) {
    const router = express.Router();

    router.get('/pending', requireAdmin, async (req, res, next) => {
        try {
            const pendingReservations = await reservationsConnect.getPendingReservations();
            const pendingOrders = await orderConnections.getPendingOrders();
            
            res.json({
                reservations: pendingReservations,
                orders: pendingOrders
            });
        } catch (error) {
            next(error);
        }
    });

    router.put('/:type/:id/approve', requireAdmin, async (req, res, next) => {
        try {
            const { type, id } = req.params;
            if (type === 'reservation') {
                await reservationsConnect.approveReservation(id);
            } else if (type === 'order') {
                await orderConnections.approveOrder(id);
            } else {
                return res.status(400).json({ error: 'Tipo inválido' });
            }
            res.json({ success: true, message: 'Pago aprobado correctamente' });
        } catch (error) {
            next(error);
        }
    });

    router.put('/:type/:id/reject', requireAdmin, async (req, res, next) => {
        try {
            const { type, id } = req.params;
            if (type === 'reservation') {
                await reservationsConnect.rejectReservation(id);
            } else if (type === 'order') {
                await orderConnections.rejectOrder(id);
            } else {
                return res.status(400).json({ error: 'Tipo inválido' });
            }
            res.json({ success: true, message: 'Pago rechazado y stock devuelto' });
        } catch (error) {
            next(error);
        }
    });

    return router;
}

import express from 'express';
import { validateRequest } from '../middleware/validate.js';
import { equipoSchema } from '../validators/equipoValidator.js';

export default function createEquipoRouter({ equipoconnect, requireAdmin }) {
  const router = express.Router();

  router.get('/equipo', async (req, res, next) => {
    try {
      const equipo = await equipoconnect.getAll();
      res.json(equipo);
    } catch (error) {
      next(error);
    }
  });

  router.post('/equipo', requireAdmin, validateRequest(equipoSchema), async (req, res, next) => {
    try {
      const result = await equipoconnect.create(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  });

  router.put('/equipo/:id', requireAdmin, validateRequest(equipoSchema), async (req, res, next) => {
    try {
      const result = await equipoconnect.update(req.params.id, req.body);
      res.json(result);
    } catch (error) {
      if (error.message === 'Member not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  });

  router.delete('/equipo/:id', requireAdmin, async (req, res, next) => {
    try {
      const result = await equipoconnect.delete(req.params.id);
      res.json(result);
    } catch (error) {
      if (error.message === 'Member not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  });

  return router;
}

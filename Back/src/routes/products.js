import express from 'express';
import { productSchema } from '../validators/productValidator.js';
import { validateRequest } from '../middleware/validate.js';

export default function createProductsRouter({ productsConnect, requireAdmin }) {
    const router = express.Router();

    // GET / (this will be /api/products)
    router.get('/', async (req, res, next) => {
        try {
            const products = await productsConnect.getAll();
            res.json(products);
        } catch (error) {
            next(error);
        }
    });

    // GET /:id (this will be /api/products/:id)
    router.get('/:id', async (req, res, next) => {
        try {
            const product = await productsConnect.getById(req.params.id);
            if (!product) {
                return res.status(404).json({ error: 'Producto no encontrado' });
            }
            res.json(product);
        } catch (error) {
            next(error);
        }
    });

    // POST /
    router.post('/', requireAdmin, validateRequest(productSchema), async (req, res, next) => {
        try {
            const product = await productsConnect.create(req.body);
            res.status(201).json(product);
        } catch (error) {
            next(error);
        }
    });

    // PUT /:id
    router.put('/:id', requireAdmin, validateRequest(productSchema), async (req, res, next) => {
        try {
            const product = await productsConnect.update(req.params.id, req.body);
            res.json(product);
        } catch (error) {
            next(error);
        }
    });

    // DELETE /:id
    router.delete('/:id', requireAdmin, async (req, res, next) => {
        try {
            await productsConnect.delete(req.params.id);
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    });

    return router;
}

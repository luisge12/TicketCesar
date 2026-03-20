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

    // POST /purchase – descuenta el stock al finalizar una compra del Kiosko
    // El usuario debe estar autenticado (tiene sesión activa)
    router.post('/purchase', async (req, res, next) => {
        try {
            const { items } = req.body;

            if (!Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ error: 'Se requiere un arreglo de items con id y quantity.' });
            }

            // Validar que cada item tenga id y quantity positivos
            for (const item of items) {
                if (!item.id || !Number.isInteger(item.quantity) || item.quantity < 1) {
                    return res.status(400).json({ error: 'Cada item debe tener un id válido y una cantidad entera positiva.' });
                }
            }

            await productsConnect.purchaseItems(items);
            res.json({ success: true, message: 'Compra procesada. Stock actualizado.' });
        } catch (error) {
            if (error.message.includes('Stock insuficiente') || error.message.includes('no encontrado')) {
                return res.status(409).json({ error: error.message });
            }
            next(error);
        }
    });

    return router;
}

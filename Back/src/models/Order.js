import pkg from 'pg';
const { Pool } = pkg;
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from '../config/index.js';

export class OrderConnections {
    constructor() {
        this.pool = new Pool({
            user: DB_USER,
            host: DB_HOST,
            database: DB_DATABASE,
            password: DB_PASSWORD,
            port: DB_PORT,
        });
    }

    async createPendingOrder(userEmail, totalPrice, paymentMethod, paymentReference, items) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Validar y descontar stock preventivamente
            for (const item of items) {
                const { rows } = await client.query(
                    'SELECT cantidad, precio FROM products WHERE id = $1 FOR UPDATE',
                    [item.id]
                );

                if (rows.length === 0) {
                    throw new Error(`Producto con id ${item.id} no encontrado`);
                }

                const stockActual = rows[0].cantidad;
                if (stockActual < item.quantity) {
                    throw new Error(
                        `Stock insuficiente para el producto id ${item.id}. Disponible: ${stockActual}, solicitado: ${item.quantity}`
                    );
                }

                await client.query(
                    'UPDATE products SET cantidad = cantidad - $1 WHERE id = $2',
                    [item.quantity, item.id]
                );
            }

            // 2. Crear la orden en la tabla orders
            const orderRes = await client.query(
                `INSERT INTO orders (user_email, total_price, payment_method, payment_reference, status) 
                 VALUES ($1, $2, $3, $4, 'pending') RETURNING id`,
                [userEmail, totalPrice, paymentMethod, paymentReference]
            );
            const orderId = orderRes.rows[0].id;

            // 3. Crear los order_items
            for (const item of items) {
                // Obtenemos el precio actual del producto (opcional, pero buena práctica)
                const { rows } = await client.query('SELECT precio FROM products WHERE id = $1', [item.id]);
                const currentPrice = rows[0].precio;

                await client.query(
                    `INSERT INTO order_items (order_id, product_id, quantity, price) 
                     VALUES ($1, $2, $3, $4)`,
                    [orderId, item.id, item.quantity, currentPrice]
                );
            }

            await client.query('COMMIT');
            return orderId;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async rejectOrder(orderId) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            // 1. Cambiar estado a rejected
            const updateRes = await client.query(
                "UPDATE orders SET status = 'rejected' WHERE id = $1 AND status = 'pending' RETURNING id",
                [orderId]
            );

            if (updateRes.rows.length === 0) {
                throw new Error('Orden no encontrada o ya procesada.');
            }

            // 2. Devolver el stock a los productos
            const { rows: items } = await client.query(
                'SELECT product_id, quantity FROM order_items WHERE order_id = $1',
                [orderId]
            );

            for (const item of items) {
                await client.query(
                    'UPDATE products SET cantidad = cantidad + $1 WHERE id = $2',
                    [item.quantity, item.product_id]
                );
            }

            await client.query('COMMIT');
            return true;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    async approveOrder(orderId) {
        try {
            // Solo se cambia el status, el stock ya fue descontado al crear la orden pending
            const res = await this.pool.query(
                "UPDATE orders SET status = 'approved' WHERE id = $1 AND status = 'pending' RETURNING id",
                [orderId]
            );
            
            if (res.rows.length === 0) {
                throw new Error('Orden no encontrada o ya procesada.');
            }
            return true;
        } catch (error) {
            throw error;
        }
    }

    async getPendingOrders() {
        const query = `
            SELECT o.*, 
            json_agg(
                json_build_object(
                    'product_id', oi.product_id,
                    'quantity', oi.quantity,
                    'price', oi.price,
                    'product_name', p.nombre
                )
            ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN products p ON oi.product_id = p.id
            WHERE o.status = 'pending'
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        const { rows } = await this.pool.query(query);
        return rows;
    }
}

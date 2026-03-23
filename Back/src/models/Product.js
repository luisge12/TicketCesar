import pkg from 'pg';
const { Pool } = pkg;
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT } from '../config/index.js';

export class ProductConnections {
    constructor() {
        this.pool = new Pool({
            user: DB_USER,
            host: DB_HOST,
            database: DB_DATABASE,
            password: DB_PASSWORD,
            port: DB_PORT,
        });


    }

    async initTable() {
        const queryProducts = `
        CREATE TABLE IF NOT EXISTS products (
            id SERIAL PRIMARY KEY,
            nombre VARCHAR(255) NOT NULL,
            descripcion TEXT,
            precio DECIMAL(10, 2) NOT NULL,
            cantidad INT DEFAULT 0
        );
        `;
        const queryImages = `
        CREATE TABLE IF NOT EXISTS products_image (
            id SERIAL PRIMARY KEY,
            product_id INT REFERENCES products(id) ON DELETE CASCADE,
            foto_url TEXT NOT NULL
        );
        `;

        try {
            await this.pool.query(queryProducts);
            await this.pool.query(queryImages);
        } catch (error) {
            console.error('Error creando tablas Kiosko:', error);
            throw error;
        }
    }

    async getAll() {
        // Obtenemos los productos junto con un arreglo de sus imágenes
        const query = `
            SELECT p.*, 
            COALESCE(
                json_agg(pi.foto_url) FILTER (WHERE pi.foto_url IS NOT NULL), 
                '[]'
            ) AS imagenes
            FROM products p
            LEFT JOIN products_image pi ON p.id = pi.product_id
            GROUP BY p.id
            ORDER BY p.id DESC;
        `;
        const { rows } = await this.pool.query(query);
        return rows;
    }

    async getById(id) {
        const query = `
            SELECT p.*, COALESCE(json_agg(pi.foto_url) FILTER (WHERE pi.foto_url IS NOT NULL), '[]') AS imagenes
            FROM products p
            LEFT JOIN products_image pi ON p.id = pi.product_id
            WHERE p.id = $1
            GROUP BY p.id;
        `;
        const { rows } = await this.pool.query(query, [id]);
        return rows[0] || null;
    }

    async create(data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN'); // Iniciar Transacción

            const insertProductQuery = `
                INSERT INTO products (nombre, descripcion, precio, cantidad)
                VALUES ($1, $2, $3, $4) RETURNING *;
            `;
            const { rows: productRows } = await client.query(insertProductQuery, [
                data.nombre, data.descripcion || '', data.precio, data.cantidad || 0
            ]);
            const newProduct = productRows[0];

            if (data.imagenes && Array.isArray(data.imagenes) && data.imagenes.length > 0) {
                const insertImageQuery = `INSERT INTO products_image (product_id, foto_url) VALUES ($1, $2)`;
                for (const url of data.imagenes) {
                    await client.query(insertImageQuery, [newProduct.id, url]);
                }
            }

            await client.query('COMMIT'); // Guardar cambios relacionales
            return await this.getById(newProduct.id);
        } catch (e) {
            await client.query('ROLLBACK'); // Cancelar todo en caso de fallo
            throw e;
        } finally {
            client.release();
        }
    }

    async update(id, data) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            const updateQuery = `
                UPDATE products SET nombre = $1, descripcion = $2, precio = $3, cantidad = $4
                WHERE id = $5 RETURNING *;
            `;
            const { rowCount } = await client.query(updateQuery, [
                data.nombre, data.descripcion || '', data.precio, data.cantidad || 0, id
            ]);

            if (rowCount === 0) throw new Error("Producto no encontrado");

            if (data.imagenes && Array.isArray(data.imagenes)) {
                // Borrar imágenes viejas y reemplazar con las nuevas editadas
                await client.query(`DELETE FROM products_image WHERE product_id = $1`, [id]);
                const insertImageQuery = `INSERT INTO products_image (product_id, foto_url) VALUES ($1, $2)`;
                for (const url of data.imagenes) {
                    await client.query(insertImageQuery, [id, url]);
                }
            }

            await client.query('COMMIT');
            return await this.getById(id);
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }

    async delete(id) {
        try {
            // Gracias a ON DELETE CASCADE, products_image se elimina automáticamente
            await this.pool.query('DELETE FROM products WHERE id = $1', [id]);
            return true;
        } catch (error) {
            console.error('Error en delete de Product:', error);
            throw error;
        }
    }

    /**
     * Descuenta el stock de varios productos en una sola transacción atómica.
     * @param {Array<{id: number, quantity: number}>} items
     * @throws {Error} si algún producto no tiene stock suficiente
     */
    async purchaseItems(items) {
        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');

            for (const item of items) {
                // Bloqueo de fila para evitar condiciones de carrera
                const { rows } = await client.query(
                    'SELECT cantidad FROM products WHERE id = $1 FOR UPDATE',
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

            await client.query('COMMIT');
            return { success: true };
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }
}

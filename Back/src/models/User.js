import { Pool } from 'pg';
import bcrypt from 'bcrypt';
import { DB_USER, DB_HOST, DB_DATABASE, DB_PASSWORD, DB_PORT, SALT_ROUNDS } from '../config/index.js'


export class UserConnections {
    constructor() {
        this.pool = new Pool({
            user: DB_USER,
            host: DB_HOST,
            database: DB_DATABASE,
            password: DB_PASSWORD,
            port: parseInt(DB_PORT, 10),
        });
    }
    async close() {
        await this.pool.end();
    }

    async createUser(user, verificationToken) {
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

        const query = 'INSERT INTO users (email, name, lastname, birthdate, created_at, password, phone, verification_token, is_verified) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
        const values = [user.email, user.name, user.lastname, user.birthdate, new Date(), hashedPassword, user.phone, verificationToken, false];

        try {
            const res = await this.pool.query(query, values);
            return res.rows[0];
        } catch (err) {
            console.error('Error creating user:', err);
            if (err.code === '23505') {
                throw new Error('User with this email already exists.');
            } else {
                throw err;
            }
        }
    }

    async loginUser(email, password) {
        const query = 'SELECT * FROM users WHERE email = $1';
        const values = [email];
        try {
            const res = await this.pool.query(query, values);
            if (res.rows.length === 0) {
                throw new Error('User not found');
            }
            if (!res.rows[0].is_verified) {
                throw new Error('Por favor verifica tu correo electrónico antes de iniciar sesión.');
            }
            const hashedPassword = res.rows[0].password;
            const match = await bcrypt.compare(password, hashedPassword);
            if (!match) {
                throw new Error('Invalid password');
            }
            return { user: res.rows[0] };
        } catch (err) {
            console.error('Error logging in user:', err);
            throw err;
        }
    }

    async verifyUserToken(token) {
        const query = 'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING *';
        const values = [token];
        try {
            const res = await this.pool.query(query, values);
            return res.rows[0];
        } catch (err) {
            console.error('Error verifying token:', err);
            throw err;
        }
    }

    async savePasswordResetToken(email, token, expires) {
        const query = 'UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE email = $3 RETURNING *';
        const values = [token, expires, email];
        try {
            const res = await this.pool.query(query, values);
            if (res.rowCount === 0) {
                throw new Error('User not found');
            }
            return res.rows[0];
        } catch (err) {
            console.error('Error saving password reset token:', err);
            throw err;
        }
    }

    async resetPassword(token, newPassword) {
        try {
            const checkQuery = 'SELECT * FROM users WHERE reset_password_token = $1 AND reset_password_expires > NOW()';
            const checkRes = await this.pool.query(checkQuery, [token]);

            if (checkRes.rowCount === 0) {
                throw new Error('invalid_token');
            }

            const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
            const updateQuery = 'UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE reset_password_token = $2 RETURNING *';

            const res = await this.pool.query(updateQuery, [hashedPassword, token]);
            return res.rows[0];
        } catch (err) {
            console.error('Error resetting password:', err);
            throw err;
        }
    }
}

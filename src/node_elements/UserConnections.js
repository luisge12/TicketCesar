import { supabase } from './config.js';
import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from './config.js';

export class UserConnections {
    // No necesitas constructor ni pool con Supabase

    async createUser(user) {
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);

        const userData = {
            email: user.email,
            name: user.name,
            lastname: user.lastname,
            birthdate: user.birthdate,
            created_at: new Date().toISOString().split('T')[0], // Formato YYYY-MM-DD
            password: hashedPassword,
            phone: user.phone,
            role: 'user' // Valor por defecto
        };

        try {
            const { data, error } = await supabase
                .from('users')
                .insert([userData])
                .select();

            if (error) {
                console.error('Error creating user:', error);
                
                // Verifica si el error es de duplicidad
                if (error.code === '23505') {
                    throw new Error('User with this email already exists.');
                } else {
                    throw error;
                }
            }
            
            return data[0];
        } catch (err) {
            console.error('Error in createUser:', err);
            throw err;
        }
    }

    async loginUser(email, password) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error) {
                if (error.code === 'PGRST116') { // Código cuando no encuentra registros
                    throw new Error('User not found');
                }
                throw error;
            }

            if (!data) {
                throw new Error('User not found');
            }

            const match = await bcrypt.compare(password, data.password);
            if (!match) {
                throw new Error('Invalid password');
            }

            // Eliminar password del objeto de respuesta por seguridad
            const { password: _, ...userWithoutPassword } = data;
            return { user: userWithoutPassword };
            
        } catch (err) {
            console.error('Error logging in user:', err);
            throw err;
        }
    }

    async getUserByEmail(email) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (error) throw error;
            
            // Eliminar password por seguridad
            if (data) {
                const { password: _, ...userWithoutPassword } = data;
                //console.log(userWithoutPassword);
                return userWithoutPassword;
            }
            return null;
            
        } catch (error) {
            console.error('Error fetching user by email:', error);
            throw error;
        }
    }

    async updateUser(email, updates) {
        try {
            // Asegurarse de no actualizar el password aquí
            const { password, ...safeUpdates } = updates;
            
            const { data, error } = await supabase
                .from('users')
                .update(safeUpdates)
                .eq('email', email)
                .select();

            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async changePassword(email, newPassword) {
        try {
            const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
            
            const { data, error } = await supabase
                .from('users')
                .update({ password: hashedPassword })
                .eq('email', email)
                .select();

            if (error) throw error;
            return data[0];
            
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    }

    // No necesitas el método close() con Supabase
}

/* //CODIGO PARA PROBAR LAS CONEXIONES
const prueba = new UserConnections();
let user;
try {
    user = await prueba.loginUser('luisge1299@gmail.com', '1234');
} catch (error) {
    console.error('Login failed:', error);
}
console.log(user);
*/
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

// Server
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST || 'localhost';

// Security
export const SALT_ROUNDS = 10;
export const JWT_SECRET = process.env.JWT_SECRET;

// Supabase Configuration
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://codyfeguwjnmglolsxir.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
export const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// Cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY || SUPABASE_ANON_KEY);
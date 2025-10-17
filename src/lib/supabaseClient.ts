import { createClient } from '@supabase/supabase-js';

// These environment variables must be prefixed with VITE_ for Vite to access them
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);


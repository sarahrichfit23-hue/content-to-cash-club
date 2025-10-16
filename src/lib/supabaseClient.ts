import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
}

// Reuse the same instance across HMR / StrictMode
declare global {
  // eslint-disable-next-line no-var
  var __supabase_client__: SupabaseClient | undefined;
}

export const supabase: SupabaseClient =
  globalThis.__supabase_client__ ??
  (globalThis.__supabase_client__ = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: 'ctcc-auth', // one consistent key for your app
      persistSession: true,
      autoRefreshToken: true,
    },
  }));


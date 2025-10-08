import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Validate credentials before creating client
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ MISSING SUPABASE CREDENTIALS');
  console.error('Please check your .env file and ensure:');
  console.error('1. VITE_SUPABASE_URL is set');
  console.error('2. VITE_SUPABASE_ANON_KEY is set');
  console.error('3. You have restarted your dev server');
}

if (supabaseUrl && !supabaseUrl.includes('supabase.co')) {
  console.error('❌ INVALID SUPABASE URL:', supabaseUrl);
  console.error('URL should look like: https://your-project.supabase.co');
}

if (supabaseAnonKey && supabaseAnonKey.length < 100) {
  console.error('❌ INVALID SUPABASE KEY - Key appears too short');
  console.error('The anon key should be a long JWT token (200+ characters)');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase-auth',
    flowType: 'pkce',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Test connection on load
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ SUPABASE CONNECTION ERROR:', error.message);
    if (error.message.includes('API key')) {
      console.error('🔧 FIX: Update your .env file with valid Supabase credentials');
      console.error('📍 Get them from: https://supabase.com/dashboard/project/_/settings/api');
    }
  } else {
    console.log('✅ Supabase connected successfully');
// --- Auto-clear stale or invalid Supabase sessions ---
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('🔄 Token refreshed successfully');
  }

  if (event === 'SIGNED_OUT') {
    console.log('👋 User signed out');
    await supabase.auth.signOut();
  }

  // Automatically clear stale sessions that block login
  if (!session) {
    console.warn('🧹 Clearing stale session');
    try {
      localStorage.removeItem('supabase-auth');
      sessionStorage.clear();
    } catch (err) {
      console.error('Failed to clear stale session:', err);
    }
  }
});


  }
});

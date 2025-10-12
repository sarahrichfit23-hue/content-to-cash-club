// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

// ✅ Load env vars
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// ✅ Cross-browser safe storage adapter (Safari compatible)
const safeStorage = {
  getItem: (key: string) => {
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  },
  setItem: (key: string, value: string) => {
    try {
      window.localStorage.setItem(key, value)
    } catch {
      console.warn('⚠️ localStorage not available, falling back to memory.')
    }
  },
  removeItem: (key: string) => {
    try {
      window.localStorage.removeItem(key)
    } catch {}
  },
}

// ✅ Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: safeStorage,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// ✅ Log status for debugging
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('❌ Supabase connection error:', error.message)
  } else {
    console.log('✅ Supabase connected successfully')
    console.log('🌐 Supabase URL:', supabaseUrl)
  }
})

// ✅ Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth event:', event)
  if (event === 'TOKEN_REFRESHED') console.log('🔄 Token refreshed')
  if (event === 'SIGNED_OUT') console.log('👋 User signed out')

  if (session) {
    try {
      safeStorage.setItem('supabase.auth.token', JSON.stringify(session))
    } catch {
      console.warn('⚠️ Could not persist session in Safari.')
    }
  }
})

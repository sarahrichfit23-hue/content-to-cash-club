// src/contexts/AuthProvider.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useNavigate } from 'react-router-dom'

type AuthContextType = {
  session: any
  user: any
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
})

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // ✅ Restore session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    // ✅ Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth event:', event)
        setSession(session)

        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in')
          navigate('/dashboard', { replace: true })
        }

        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
          navigate('/', { replace: true })
        }
      }
    )

    return () => {
      listener.subscription.unsubscribe()
    }
  }, [navigate])

  const signOut = async () => {
    await supabase.auth.signOut()
    setSession(null)
    navigate('/', { replace: true })
  }

  const value = {
    session,
    user: session?.user || null,
    loading,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)




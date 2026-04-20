import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { getSupabase, isSupabaseConfigured } from '@/lib/supabase'
import type { SessionData, WorkerRole } from '@/lib/types'

interface AuthContextType {
  session: SessionData | null
  loading: boolean
  dbError: string | null
  login: (pin: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

const SESSION_KEY = 'fss_session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dbError, setDbError] = useState<string | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setDbError('Supabase no está configurado. Verifica las variables de entorno en el archivo .env')
      setLoading(false)
      return
    }

    const stored = localStorage.getItem(SESSION_KEY)
    if (stored) {
      try {
        setSession(JSON.parse(stored))
      } catch {
        localStorage.removeItem(SESSION_KEY)
      }
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (pin: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const { data, error } = await getSupabase().rpc('verify_pin', { pin_input: pin })

      if (error) return { success: false, error: 'Error de conexión con la base de datos' }
      if (!data || data.length === 0) return { success: false, error: 'PIN incorrecto' }

      const worker = data[0]
      if (!worker.active) return { success: false, error: 'Cuenta desactivada' }

      const newSession: SessionData = {
        workerId: worker.id,
        name: worker.name,
        role: worker.role as WorkerRole,
      }
      setSession(newSession)
      localStorage.setItem(SESSION_KEY, JSON.stringify(newSession))
      return { success: true }
    } catch (err) {
      console.error('Login error:', err)
      return { success: false, error: 'Error de conexión. Verifica tu internet.' }
    }
  }, [])

  const logout = useCallback(() => {
    setSession(null)
    localStorage.removeItem(SESSION_KEY)
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading, dbError, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
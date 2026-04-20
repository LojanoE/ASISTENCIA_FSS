import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Clock } from '@/components/Clock'
import { PinPad } from '@/components/PinPad'
import { LogIn, AlertTriangle } from 'lucide-react'

export function HomePage() {
  const { session, login, dbError } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session) {
    return <Navigate to="/dashboard" replace />
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-red-50 flex flex-col items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-red-200 p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-800 mb-2">Error de Configuración</h1>
          <p className="text-gray-600 text-sm mb-4">{dbError}</p>
          <p className="text-gray-500 text-xs">Verifica que las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén configuradas correctamente en el archivo .env</p>
        </div>
      </div>
    )
  }

  const handleLogin = async (pin: string) => {
    setLoading(true)
    setError(null)
    const result = await login(pin)
    setLoading(false)
    if (!result.success) {
      setError(result.error || 'Error desconocido')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-2">
          <div className="text-6xl mb-3">🌴</div>
          <h1 className="text-2xl font-bold text-gray-800">Finca San Luis</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Asistencia</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-4">
          <div className="mb-6">
            <Clock />
          </div>

          <div className="border-t border-gray-100 pt-5">
            <div className="flex items-center gap-2 mb-4">
              <LogIn className="w-4 h-4 text-primary" />
              <p className="text-sm font-medium text-gray-700">Ingresa tu PIN para registrar asistencia</p>
            </div>
            <PinPad onSubmit={handleLogin} loading={loading} error={error} />
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Finca San Luis Pithaya &middot; Sistema de control de asistencia
        </p>
      </div>
    </div>
  )
}
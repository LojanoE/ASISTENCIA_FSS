import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Clock } from '@/components/Clock'
import { PinPad } from '@/components/PinPad'
import { LogIn } from 'lucide-react'

export function HomePage() {
  const { session, login } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (session) {
    navigate('/dashboard', { replace: true })
    return null
  }

  const handleLogin = async (pin: string) => {
    setLoading(true)
    setError(null)
    const result = await login(pin)
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
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
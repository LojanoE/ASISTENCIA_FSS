import { useState } from 'react'
import { Lock, Delete, Fingerprint } from 'lucide-react'

interface PinPadProps {
  onSubmit: (pin: string) => void
  loading?: boolean
  error?: string | null
}

export function PinPad({ onSubmit, loading, error }: PinPadProps) {
  const [pin, setPin] = useState('')

  const handleDigit = (d: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + d)
    }
  }

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1))
  }

  const handleSubmit = () => {
    if (pin.length >= 4) {
      onSubmit(pin)
      setPin('')
    }
  }

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9']

  return (
    <div className="w-full max-w-xs mx-auto">
      <div className="flex items-center justify-center gap-2 mb-6 h-12">
        <Lock className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full border-2 transition-all ${
                i < pin.length
                  ? 'bg-primary border-primary'
                  : 'border-gray-300 bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {error && (
        <div className="text-center text-red-600 text-sm mb-3 bg-red-50 rounded-lg p-2">
          {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-3">
        {digits.map(d => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            disabled={loading}
            className="h-14 text-2xl font-semibold rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {d}
          </button>
        ))}
        <button
          onClick={handleDelete}
          className="h-14 rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center justify-center"
        >
          <Delete className="w-5 h-5" />
        </button>
        <button
          onClick={() => handleDigit('0')}
          disabled={loading}
          className="h-14 text-2xl font-semibold rounded-xl bg-white border border-gray-200 shadow-sm hover:bg-gray-50 active:bg-gray-100 transition-colors disabled:opacity-50"
        >
          0
        </button>
        <button
          onClick={handleSubmit}
          disabled={pin.length < 4 || loading}
          className="h-14 rounded-xl bg-primary text-white shadow-sm hover:bg-primary-dark active:bg-primary-dark transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Fingerprint className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
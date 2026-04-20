import { useState } from 'react'
import { useSettings } from '@/hooks/useSettings'
import { Save, MapPin, Loader2 } from 'lucide-react'

export function SettingsPage() {
  const { schedule, geofence, updateSetting, loading } = useSettings()
  const [startTime, setStartTime] = useState(schedule.startTime)
  const [endTime, setEndTime] = useState(schedule.endTime)
  const [lat, setLat] = useState(geofence.latitude.toString())
  const [lng, setLng] = useState(geofence.longitude.toString())
  const [radius, setRadius] = useState(geofence.radiusMeters.toString())
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  async function handleSave() {
    setSaving(true)
    setMessage(null)
    try {
      await updateSetting('start_time', startTime)
      await updateSetting('end_time', endTime)
      await updateSetting('geofence_lat', lat)
      await updateSetting('geofence_lng', lng)
      await updateSetting('geofence_radius', radius)
      setMessage({ type: 'success', text: 'Configuración guardada correctamente' })
    } catch {
      setMessage({ type: 'error', text: 'Error al guardar la configuración' })
    } finally {
      setSaving(false)
    }
  }

  function handleGetLocation() {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocalización no disponible' })
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude.toFixed(6))
        setLng(pos.coords.longitude.toFixed(6))
        setMessage({ type: 'success', text: 'Ubicación actual obtenida' })
      },
      () => {
        setMessage({ type: 'error', text: 'No se pudo obtener la ubicación' })
      },
      { enableHighAccuracy: true }
    )
  }

  return (
    <div className="space-y-6 max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800">Configuración</h1>

      {message && (
        <div className={`rounded-xl p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Horario de Trabajo
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Entrada</label>
            <input
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hora de Salida</label>
            <input
              type="time"
              value={endTime}
              onChange={e => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <p className="text-xs text-gray-500">Entradas después de la hora de entrada se marcan como atraso. Salidas después de la hora de salida se marcan como horas extras.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Perímetro de la Finca (Geofence)
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Latitud</label>
            <input
              type="text"
              value={lat}
              onChange={e => setLat(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Longitud</label>
            <input
              type="text"
              value={lng}
              onChange={e => setLng(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Radio (m)</label>
            <input
              type="number"
              value={radius}
              onChange={e => setRadius(e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
        <button
          onClick={handleGetLocation}
          className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
        >
          <MapPin className="w-4 h-4" />
          Usar mi ubicación actual
        </button>
        <p className="text-xs text-gray-500">Los trabajadores deben estar dentro de este radio para registrar su asistencia. Configure las coordenadas del centro de la finca y el radio en metros.</p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
      >
        <Save className="w-5 h-5" />
        {saving ? 'Guardando...' : 'Guardar Configuración'}
      </button>
    </div>
  )
}
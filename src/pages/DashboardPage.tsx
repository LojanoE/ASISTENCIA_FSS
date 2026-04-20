import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useSettings } from '@/hooks/useSettings'
import { getSupabase } from '@/lib/supabase'
import { getCurrentPosition, isWithinGeofence } from '@/lib/geolocation'
import { getCurrentDate, formatTime, getStatusLabel, getDayStatusColor } from '@/lib/utils'
import { Clock } from '@/components/Clock'
import { LogOut, LogIn, MapPin, MapPinOff, AlertTriangle, Loader2 } from 'lucide-react'
import type { AttendanceStatus } from '@/lib/types'

export function DashboardPage() {
  const { session } = useAuth()
  const { schedule, geofence } = useSettings()
  const [todayRecord, setTodayRecord] = useState<AttendanceStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null)
  const [geoStatus, setGeoStatus] = useState<'pending' | 'ok' | 'outside' | 'unavailable'>('pending')

  const today = getCurrentDate()

  useEffect(() => {
    if (session?.workerId) loadTodayRecord()
  }, [session?.workerId])

  async function loadTodayRecord() {
    if (!session) return
    try {
      const { data } = await getSupabase()
        .from('attendance')
        .select('*')
        .eq('worker_id', session.workerId)
        .eq('date', today)
        .single()
      setTodayRecord(data as AttendanceStatus | null)
    } catch (err) {
      console.error('Error loading today record:', err)
    }
  }

  async function handleRegister(type: 'entry' | 'exit') {
    if (!session) return
    setLoading(true)
    setMessage(null)

    let latitude: number | null = null
    let longitude: number | null = null
    let withinGeofence: boolean | null = null

    try {
      const pos = await getCurrentPosition()
      latitude = pos.coords.latitude
      longitude = pos.coords.longitude
      withinGeofence = isWithinGeofence(latitude, longitude, geofence)
      setGeoStatus(withinGeofence ? 'ok' : 'outside')
      if (!withinGeofence) {
        setMessage({ type: 'warning', text: 'Estás fuera del perímetro de la finca. Tu registro será marcado como fuera de ubicación.' })
      }
    } catch {
      setGeoStatus('unavailable')
      setMessage({ type: 'warning', text: 'No se pudo obtener tu ubicación. El registro se guardará sin ubicación.' })
    }

    try {
      const fn = type === 'entry' ? 'register_entry' : 'register_exit'
      const { data, error } = await getSupabase().rpc(fn, {
        p_worker_id: session.workerId,
        p_latitude: latitude,
        p_longitude: longitude,
        p_within_geofence: withinGeofence,
      })

      if (error) {
        setMessage({ type: 'error', text: error.message })
      } else {
        const result = typeof data === 'string' ? JSON.parse(data) : data
        if (result.success) {
          setMessage({ type: 'success', text: type === 'entry' ? 'Entrada registrada correctamente' : 'Salida registrada correctamente' })
          await loadTodayRecord()
        } else {
          setMessage({ type: 'error', text: result.error || 'Error al registrar' })
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión. Verifica tu internet.' })
    } finally {
      setLoading(false)
    }
  }

  const canEntry = !todayRecord?.entry_time
  const canExit = !!todayRecord?.entry_time && !todayRecord?.exit_time

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <Clock />
        <div className="text-center mt-2">
          <span className="text-sm text-gray-400">Jornada: {schedule.startTime} - {schedule.endTime}</span>
        </div>
      </div>

      {message && (
        <div className={`rounded-xl p-4 flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
          message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
          'bg-yellow-50 text-yellow-800 border border-yellow-200'
        }`}>
          {message.type === 'warning' && <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Registrar Asistencia</h2>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => handleRegister('entry')}
            disabled={!canEntry || loading}
            className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-green-200 bg-green-50 text-green-800 hover:bg-green-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogIn className="w-8 h-8" />
            <span className="font-semibold">Entrada</span>
            {todayRecord?.entry_time && (
              <span className="text-xs">{formatTime(todayRecord.entry_time)}</span>
            )}
          </button>

          <button
            onClick={() => handleRegister('exit')}
            disabled={!canExit || loading}
            className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <LogOut className="w-8 h-8" />
            <span className="font-semibold">Salida</span>
            {todayRecord?.exit_time && (
              <span className="text-xs">{formatTime(todayRecord.exit_time)}</span>
            )}
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Procesando...</span>
          </div>
        )}

        {geoStatus !== 'pending' && (
          <div className={`mt-4 flex items-center gap-2 text-sm ${
            geoStatus === 'ok' ? 'text-green-600' :
            geoStatus === 'outside' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {geoStatus === 'ok' && <MapPin className="w-4 h-4" />}
            {geoStatus === 'outside' && <MapPinOff className="w-4 h-4" />}
            {geoStatus === 'ok' && 'Dentro del perímetro'}
            {geoStatus === 'outside' && 'Fuera del perímetro de la finca'}
            {geoStatus === 'unavailable' && 'Ubicación no disponible'}
          </div>
        )}
      </div>

      {todayRecord && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Asistencia de Hoy</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Estado</p>
              <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getDayStatusColor(todayRecord.status)}`}>
                {getStatusLabel(todayRecord.status)}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Horas Extras</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {todayRecord.overtime ? 'Sí' : 'No'}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Entrada</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {formatTime(todayRecord.entry_time)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wider">Salida</p>
              <p className="mt-1 text-sm font-medium text-gray-800">
                {formatTime(todayRecord.exit_time)}
              </p>
            </div>
          </div>
        </div>
      )}

      <HistorySection workerId={session!.workerId} />
    </div>
  )
}

function HistorySection({ workerId }: { workerId: string }) {
  const [records, setRecords] = useState<AttendanceStatus[]>([])

  useEffect(() => {
    loadHistory()
  }, [workerId])

  async function loadHistory() {
    try {
      const { data } = await getSupabase()
        .from('attendance')
        .select('*')
        .eq('worker_id', workerId)
        .order('date', { ascending: false })
        .limit(14)
      setRecords((data as AttendanceStatus[]) || [])
    } catch (err) {
      console.error('Error loading history:', err)
    }
  }

  if (records.length === 0) return null

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">Historial Reciente</h3>
      <div className="divide-y divide-gray-100">
        {records.map(r => (
          <div key={r.id} className="py-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">{r.date}</p>
              <p className="text-xs text-gray-500">
                {formatTime(r.entry_time)} - {formatTime(r.exit_time)}
                {r.overtime && <span className="text-blue-600 ml-1">+HE</span>}
              </p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDayStatusColor(r.status)}`}>
              {getStatusLabel(r.status)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
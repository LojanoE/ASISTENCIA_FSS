import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { formatTime, getStatusLabel, getDayStatusColor, formatDate } from '@/lib/utils'
import { Search, FileCheck, X } from 'lucide-react'
import type { AttendanceStatus, Worker } from '@/lib/types'

export function AttendancePage() {
  const { session } = useAuth()
  const [attendance, setAttendance] = useState<AttendanceStatus[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [workerFilter, setWorkerFilter] = useState('')
  const [showJustify, setShowJustify] = useState<string | null>(null)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadWorkers()
  }, [])

  useEffect(() => {
    loadAttendance()
  }, [dateFilter, workerFilter])

  async function loadWorkers() {
    try {
      const { data } = await getSupabase().from('workers').select('*').eq('active', true).order('name')
      setWorkers((data as Worker[]) || [])
    } catch (err) {
      console.error('Error loading workers:', err)
    }
  }

  async function loadAttendance() {
    setLoading(true)
    try {
      let query = getSupabase()
        .from('attendance')
        .select('*')
        .eq('date', dateFilter)
        .order('entry_time', { ascending: true })

    if (workerFilter) {
      query = query.eq('worker_id', workerFilter)
    }

    const { data } = await query
    const records = (data as AttendanceStatus[]) || []

    const workerMap = new Map(workers.map(w => [w.id, w]))
    const enriched = records.map(r => ({ ...r, worker: workerMap.get(r.worker_id) }))
    setAttendance(enriched as unknown as AttendanceStatus[])
    } catch (err) {
      console.error('Error loading attendance:', err)
    }
    setLoading(false)
  }

  async function justifyAtendance(attendanceId: string) {
    if (!reason.trim() || !session) return
    const { error } = await getSupabase().from('justifications').insert({
      attendance_id: attendanceId,
      reason: reason.trim(),
      authorized_by: session.workerId,
    })
    if (!error) {
      await getSupabase().from('attendance').update({ status: 'justificado' }).eq('id', attendanceId)
      setShowJustify(null)
      setReason('')
      await loadAttendance()
    }
  }

  async function deleteAttendance(id: string) {
    if (!confirm('¿Eliminar este registro de asistencia?')) return
    await getSupabase().from('attendance').delete().eq('id', id)
    await loadAttendance()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Registro de Asistencias</h1>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            value={workerFilter}
            onChange={e => setWorkerFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Todos los trabajadores</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <input
          type="date"
          value={dateFilter}
          onChange={e => setDateFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {showJustify && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Justificar Atraso</h3>
            <button onClick={() => { setShowJustify(null); setReason('') }}>
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Motivo de la justificación..."
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[80px]"
          />
          <button
            onClick={() => justifyAtendance(showJustify)}
            disabled={!reason.trim()}
            className="mt-3 px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            Guardar Justificación
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-500">Trabajador</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Entrada</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Salida</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-500">Ubicación</th>
                <th className="text-right px-4 py-3 font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendance.map(a => {
                const workerName = (a as unknown as { worker?: Worker })?.worker?.name || '—'
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{workerName}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatTime(a.entry_time)}
                      {a.overtime && <span className="text-blue-600 ml-1 text-xs">+HE</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{formatTime(a.exit_time)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDayStatusColor(a.status)}`}>
                        {getStatusLabel(a.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {a.within_geofence_entry === null ? '—' :
                        a.within_geofence_entry ? 'Dentro' : 'Fuera'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {a.status === 'atraso' && (
                          <button
                            onClick={() => { setShowJustify(a.id); setReason('') }}
                            className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Justificar"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => deleteAttendance(a.id)}
                          className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {attendance.length === 0 && !loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    No hay registros para esta fecha
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

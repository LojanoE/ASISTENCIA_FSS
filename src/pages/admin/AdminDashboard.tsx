import { useState, useEffect } from 'react'
import { getSupabase } from '@/lib/supabase'
import { useSettings } from '@/hooks/useSettings'
import { formatTime, getStatusLabel, getDayStatusColor } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { Users, ClipboardList, Clock, AlertTriangle, TrendingUp } from 'lucide-react'
import type { Worker, AttendanceStatus } from '@/lib/types'

export function AdminDashboard() {
  const { schedule } = useSettings()
  const [workerCount, setWorkerCount] = useState(0)
  const [todayPresent, setTodayPresent] = useState(0)
  const [todayLate, setTodayLate] = useState(0)
  const [todayAbsent, setTodayAbsent] = useState(0)
  const [recentAttendance, setRecentAttendance] = useState<(AttendanceStatus & { worker?: Worker })[]>([])
  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    try {
      const { count: wCount } = await getSupabase()
        .from('workers')
        .select('*', { count: 'exact', head: true })
        .eq('active', true)
      setWorkerCount(wCount || 0)

      const { data: todayData } = await getSupabase()
        .from('attendance')
        .select('*, worker:workers(name)')
        .eq('date', today)
        .order('entry_time', { ascending: true })

    const records = (todayData as (AttendanceStatus & { worker?: Worker })[]) || []
    setRecentAttendance(records)
    setTodayPresent(records.filter(r => r.status === 'presente').length)
    setTodayLate(records.filter(r => r.status === 'atraso').length)
    setTodayAbsent((wCount || 0) - records.length)
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }

  const stats = [
    { label: 'Trabajadores', value: workerCount, icon: Users, color: 'bg-blue-50 text-blue-700' },
    { label: 'Presentes', value: todayPresent, icon: TrendingUp, color: 'bg-green-50 text-green-700' },
    { label: 'Atrasos', value: todayLate, icon: AlertTriangle, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Ausentes', value: todayAbsent < 0 ? 0 : todayAbsent, icon: Clock, color: 'bg-red-50 text-red-700' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="text-sm text-gray-500">Jornada: {schedule.startTime} - {schedule.endTime}</p>
        </div>
        <span className="text-sm text-gray-500">{today}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => (
          <div key={s.label} className={`${s.color} rounded-xl p-4 flex flex-col items-center`}>
            <s.icon className="w-6 h-6 mb-1" />
            <span className="text-2xl font-bold">{s.value}</span>
            <span className="text-xs font-medium">{s.label}</span>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/admin/workers" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <span className="font-medium text-gray-800">Gestionar Trabajadores</span>
        </Link>
        <Link to="/admin/attendance" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-secondary" />
          <span className="font-medium text-gray-800">Ver Asistencias</span>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Asistencia de Hoy</h2>
        {recentAttendance.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No hay registros de asistencia hoy</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentAttendance.map(r => (
              <div key={r.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-800">{(r.worker as unknown as { name: string })?.name || '—'}</p>
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
        )}
      </div>
    </div>
  )
}

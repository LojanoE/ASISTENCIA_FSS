import { format, parse } from 'date-fns'
import type { AttendanceStatus, GeofenceConfig, WorkScheduleConfig } from './types'

export function getCurrentDate(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getCurrentTime(): string {
  return format(new Date(), 'HH:mm:ss')
}

export function formatTime(time: string | null): string {
  if (!time) return '—'
  try {
    const parsed = parse(time, 'HH:mm:ss', new Date())
    return format(parsed, 'h:mm a')
  } catch {
    return time
  }
}

export function formatDate(date: string): string {
  try {
    const parsed = new Date(date + 'T12:00:00')
    return format(parsed, "EEEE d 'de' MMMM 'de' yyyy", { locale: undefined })
  } catch {
    return date
  }
}

export function isLate(entryTime: string, schedule: WorkScheduleConfig): boolean {
  return entryTime > schedule.startTime
}

export function isOvertime(exitTime: string, schedule: WorkScheduleConfig): boolean {
  return exitTime > schedule.endTime
}

export function getAttendanceStatus(
  entryTime: string | null,
  schedule: WorkScheduleConfig
): AttendanceStatus['status'] {
  if (!entryTime) return 'ausente'
  if (isLate(entryTime, schedule)) return 'atraso'
  return 'presente'
}

export function formatGeofence(geofence: GeofenceConfig): string {
  return `${geofence.latitude.toFixed(6)}, ${geofence.longitude.toFixed(6)} (${geofence.radiusMeters}m)`
}

export function getDayStatusColor(status: AttendanceStatus['status']): string {
  switch (status) {
    case 'presente': return 'text-green-600 bg-green-50'
    case 'atraso': return 'text-yellow-600 bg-yellow-50'
    case 'justificado': return 'text-blue-600 bg-blue-50'
    case 'ausente': return 'text-red-600 bg-red-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export function getStatusLabel(status: AttendanceStatus['status']): string {
  switch (status) {
    case 'presente': return 'Presente'
    case 'atraso': return 'Atraso'
    case 'justificado': return 'Justificado'
    case 'ausente': return 'Ausente'
    default: return status
  }
}
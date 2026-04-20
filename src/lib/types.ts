export type WorkerRole = 'admin' | 'worker'

export interface Worker {
  id: string
  name: string
  pin_hash: string
  role: WorkerRole
  active: boolean
  created_at: string
}

export interface AttendanceStatus {
  id: string
  worker_id: string
  date: string
  entry_time: string | null
  exit_time: string | null
  status: 'presente' | 'atraso' | 'justificado' | 'ausente'
  overtime: boolean
  entry_latitude: number | null
  entry_longitude: number | null
  exit_latitude: number | null
  exit_longitude: number | null
  within_geofence_entry: boolean | null
  within_geofence_exit: boolean | null
  notes: string | null
  created_at: string
  worker?: Worker
}

export interface Justification {
  id: string
  attendance_id: string
  reason: string
  authorized_by: string
  created_at: string
  attendance?: AttendanceStatus
  authorizer?: Worker
}

export interface AppSettings {
  id: string
  key: string
  value: string
  created_at: string
}

export interface SessionData {
  workerId: string
  name: string
  role: WorkerRole
}

export interface GeofenceConfig {
  latitude: number
  longitude: number
  radiusMeters: number
}

export interface WorkScheduleConfig {
  startTime: string
  endTime: string
}
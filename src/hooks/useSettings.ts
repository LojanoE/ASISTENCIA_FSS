import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { AppSettings, WorkScheduleConfig, GeofenceConfig } from '@/lib/types'

export function useSettings() {
  const [schedule, setSchedule] = useState<WorkScheduleConfig>({ startTime: '07:00', endTime: '17:00' })
  const [geofence, setGeofence] = useState<GeofenceConfig>({ latitude: 0, longitude: 0, radiusMeters: 200 })
  const [loading, setLoading] = useState(true)

  const loadSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('settings').select('*')
      if (error) throw error

      const settings = (data as AppSettings[]).reduce((acc, s) => {
        acc[s.key] = s.value
        return acc
      }, {} as Record<string, string>)

      if (settings.start_time) setSchedule(prev => ({ ...prev, startTime: settings.start_time }))
      if (settings.end_time) setSchedule(prev => ({ ...prev, endTime: settings.end_time }))
      if (settings.geofence_lat) setGeofence(prev => ({ ...prev, latitude: parseFloat(settings.geofence_lat) }))
      if (settings.geofence_lng) setGeofence(prev => ({ ...prev, longitude: parseFloat(settings.geofence_lng) }))
      if (settings.geofence_radius) setGeofence(prev => ({ ...prev, radiusMeters: parseInt(settings.geofence_radius) }))
    } catch (err) {
      console.error('Error loading settings:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadSettings() }, [loadSettings])

  const updateSetting = useCallback(async (key: string, value: string) => {
    const { error } = await supabase
      .from('settings')
      .upsert({ key, value }, { onConflict: 'key' })
    if (error) throw error
    await loadSettings()
  }, [loadSettings])

  return { schedule, geofence, loading, updateSetting, refresh: loadSettings }
}
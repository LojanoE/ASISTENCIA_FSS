import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const isConfigured = supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-project') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  supabaseUrl.startsWith('https://')

export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient)

export function isSupabaseConfigured(): boolean {
  return !!isConfigured
}

export function getSupabase(): SupabaseClient {
  if (!isConfigured) {
    throw new Error('Supabase no está configurado. Verifica las variables de entorno.')
  }
  return supabase
}
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { getSupabase } from '@/lib/supabase'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'
import type { Worker } from '@/lib/types'

export function WorkersPage() {
  const { session } = useAuth()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Worker | null>(null)
  const [formData, setFormData] = useState({ name: '', pin: '', role: 'worker' as 'admin' | 'worker' })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => { loadWorkers() }, [])

  async function loadWorkers() {
    const { data } = await getSupabase().from('workers').select('*').order('name')
    setWorkers((data as Worker[]) || [])
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formData.name.trim()) return
    setLoading(true)
    setMessage(null)

    try {
      if (editing) {
        const updateData: Record<string, unknown> = { name: formData.name, role: formData.role }
        if (formData.pin) {
          const { data: hashResult } = await getSupabase().rpc('hash_pin', { pin_input: formData.pin })
          updateData.pin_hash = hashResult
        }
        const { error } = await getSupabase().from('workers').update(updateData).eq('id', editing.id)
        if (error) throw error
        setMessage({ type: 'success', text: 'Trabajador actualizado' })
      } else {
        if (!formData.pin || formData.pin.length < 4) {
          setMessage({ type: 'error', text: 'El PIN debe tener al menos 4 dígitos' })
          setLoading(false)
          return
        }
        const { data: hashResult } = await getSupabase().rpc('hash_pin', { pin_input: formData.pin })
        const { error } = await getSupabase().from('workers').insert({
          name: formData.name,
          pin_hash: hashResult,
          role: formData.role,
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Trabajador creado' })
      }
      setShowForm(false)
      setEditing(null)
      setFormData({ name: '', pin: '', role: 'worker' })
      await loadWorkers()
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar' })
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(worker: Worker) {
    const { error } = await getSupabase().from('workers').update({ active: !worker.active }).eq('id', worker.id)
    if (!error) await loadWorkers()
  }

  function startEdit(worker: Worker) {
    setEditing(worker)
    setFormData({ name: worker.name, pin: '', role: worker.role as 'admin' | 'worker' })
    setShowForm(true)
  }

  const filtered = workers.filter(w =>
    w.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Trabajadores</h1>
        <button
          onClick={() => { setEditing(null); setFormData({ name: '', pin: '', role: 'worker' }); setShowForm(true) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" /> Nuevo
        </button>
      </div>

      {message && (
        <div className={`rounded-xl p-3 text-sm ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar trabajador..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
      </div>

      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editing ? 'Editar Trabajador' : 'Nuevo Trabajador'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PIN {editing && '(dejar vacío para mantener el actual)'}
              </label>
              <input
                type="password"
                required={!editing}
                value={formData.pin}
                onChange={e => setFormData(p => ({ ...p, pin: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="4-6 dígitos"
                maxLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
              <select
                value={formData.role}
                onChange={e => setFormData(p => ({ ...p, role: e.target.value as 'admin' | 'worker' }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="worker">Trabajador</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {loading ? 'Guardando...' : editing ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); setEditing(null) }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="divide-y divide-gray-100">
          {filtered.map(w => (
            <div key={w.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold ${w.active ? 'bg-primary' : 'bg-gray-400'}`}>
                  {w.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className={`font-medium ${w.active ? 'text-gray-800' : 'text-gray-400 line-through'}`}>
                    {w.name}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${w.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                    {w.role === 'admin' ? 'Admin' : 'Trabajador'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(w)} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => toggleActive(w)} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title={w.active ? 'Desactivar' : 'Activar'}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-4 py-8 text-center text-gray-400 text-sm">No se encontraron trabajadores</div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import AdminLayout from '../../../shared/components/AdminLayout'
import { getToken } from '../../auth/api/authApi'

type Config = {
  id: number
  key: string
  value: string
  type: string
  group: string
  description?: string
  is_public: boolean
  updated_by?: number
  updater?: { name: string }
  updated_at: string
}

const DEFAULT_CONFIGS = [
  { key: 'platform_commission_rate', value: '0.10', type: 'decimal', group: 'settlement', description: 'Komisi platform dari setiap settlement mitra laundry (0–1)', is_public: false },
  { key: 'courier_job_fee_per_delivery', value: '15000', type: 'integer', group: 'logistics', description: 'Upah dasar kurir per pengantaran/penjemputan (IDR)', is_public: false },
  { key: 'weight_variance_auto_threshold', value: '0.10', type: 'decimal', group: 'compliance', description: 'Batas selisih berat otomatis terfinalisasi (e.g. 0.10 = 10%)', is_public: true },
  { key: 'weight_variance_review_threshold', value: '0.30', type: 'decimal', group: 'compliance', description: 'Batas selisih berat yang memicu WEIGHT_REVIEW_REQUIRED (e.g. 0.30 = 30%)', is_public: true },
  { key: 'delivery_fee_default', value: '10000', type: 'integer', group: 'payment', description: 'Biaya pengantaran default per pesanan (IDR)', is_public: true },
  { key: 'platform_fee_default', value: '2000', type: 'integer', group: 'payment', description: 'Biaya layanan platform per pesanan (IDR)', is_public: true },
]

const GROUP_COLORS: Record<string, string> = {
  settlement: 'bg-emerald-100 text-emerald-800',
  logistics: 'bg-sky-100 text-sky-800',
  compliance: 'bg-amber-100 text-amber-800',
  payment: 'bg-purple-100 text-purple-800',
  general: 'bg-slate-100 text-slate-600',
}

export default function PlatformConfigPage() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<Config> | null>(null)
  const [justification, setJustification] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch('/api/v1/admin/configs', { headers })
      const data = await res.json()
      if (res.ok) setConfigs(data.configs || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchConfigs() }, [])

  const handleSeed = async (cfg: typeof DEFAULT_CONFIGS[0]) => {
    setEditing({ key: cfg.key, value: cfg.value, type: cfg.type, group: cfg.group, description: cfg.description, is_public: cfg.is_public })
    setJustification(`Seeding konfigurasi default: ${cfg.key}`)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSubmitting(true); setError(null); setMessage(null)

    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch('/api/v1/admin/configs', {
        method: 'POST',
        headers,
        body: JSON.stringify({ ...editing, justification }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Gagal menyimpan konfigurasi.')

      setMessage(`Konfigurasi '${editing.key}' berhasil diperbarui.`)
      setEditing(null); setJustification('')
      await fetchConfigs()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const isEmpty = configs.length === 0 && !loading

  return (
    <AdminLayout>
      <div className="p-6 max-w-5xl space-y-5">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900">Platform Config — Super Admin</h1>
          <p className="text-xs text-slate-500 mt-0.5">Parameter dinamis platform yang mengontrol logika bisnis. Setiap perubahan tercatat di Audit Trail.</p>
        </div>

        {message && <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl">✓ {message}</div>}
        {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl">⚠️ {error}</div>}

        {/* Quick Seed Section */}
        {isEmpty && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
            <p className="text-xs font-bold text-amber-800">⚠️ Database konfigurasi masih kosong. Klik untuk seed nilai default:</p>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_CONFIGS.map((c) => (
                <button key={c.key} onClick={() => handleSeed(c)} className="text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-800 px-3 py-1.5 rounded-full transition">
                  + {c.key}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Config Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-100 flex justify-between items-center">
            <span className="text-xs font-bold text-slate-700">Konfigurasi Aktif ({configs.length})</span>
            <button onClick={() => setEditing({ key: '', value: '', type: 'string', group: 'general', is_public: false })} className="btn-primary !h-8 text-[11px] px-4">
              + Tambah Config Baru
            </button>
          </div>

          {loading ? (
            <p className="text-xs text-center py-10 text-slate-400">Memuat konfigurasi...</p>
          ) : configs.length === 0 ? (
            <p className="text-xs text-center py-10 text-slate-400">Belum ada konfigurasi. Seed nilai default di atas.</p>
          ) : (
            <div className="divide-y divide-slate-50">
              {configs.map((c) => (
                <div key={c.id} className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50 transition">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase ${GROUP_COLORS[c.group] ?? GROUP_COLORS.general}`}>{c.group}</span>
                      <code className="text-xs font-mono font-bold text-slate-800">{c.key}</code>
                      {c.is_public && <span className="text-[9px] bg-sky-50 text-sky-600 border border-sky-200 px-1.5 py-0.5 rounded font-bold">PUBLIC</span>}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{c.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono font-black text-sm text-[#00667e]">{c.value}</span>
                    <span className="text-[10px] text-slate-400">{c.type}</span>
                    <button onClick={() => { setEditing(c); setJustification('') }} className="text-[11px] font-bold text-sky-600 hover:text-sky-800 transition">Edit</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
              <h3 className="font-display text-lg font-black text-slate-900">
                {editing.id ? `Edit: ${editing.key}` : 'Tambah Konfigurasi Baru'}
              </h3>

              {!editing.id && (
                <div>
                  <label className="label text-xs">Key *</label>
                  <input type="text" placeholder="e.g. platform_commission_rate" value={editing.key ?? ''} onChange={(e) => setEditing({ ...editing, key: e.target.value })} required className="input text-xs font-mono" />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">Nilai *</label>
                  <input type="text" value={editing.value ?? ''} onChange={(e) => setEditing({ ...editing, value: e.target.value })} required className="input text-xs font-mono font-bold" />
                </div>
                <div>
                  <label className="label text-xs">Tipe</label>
                  <select value={editing.type ?? 'string'} onChange={(e) => setEditing({ ...editing, type: e.target.value })} className="input text-xs">
                    {['string', 'integer', 'decimal', 'boolean', 'json'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="label text-xs">Deskripsi</label>
                <input type="text" value={editing.description ?? ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} className="input text-xs" />
              </div>

              <div>
                <label className="label text-xs">Justifikasi Perubahan * <span className="text-slate-400">(wajib untuk audit)</span></label>
                <textarea rows={2} value={justification} onChange={(e) => setJustification(e.target.value)} required minLength={10} placeholder="Jelaskan alasan perubahan konfigurasi ini..." className="input resize-none text-xs" />
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 btn-secondary text-xs !h-11">Batal</button>
                <button type="submit" disabled={submitting} className="flex-1 bg-[#00667e] hover:bg-[#005266] disabled:opacity-50 text-white font-bold text-xs py-2.5 rounded-full shadow transition">
                  {submitting ? 'Menyimpan...' : 'Simpan & Audit →'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

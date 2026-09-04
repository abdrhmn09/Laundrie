import { useEffect, useState } from 'react'
import AdminLayout from '../../../shared/components/AdminLayout'
import { getToken } from '../../auth/api/authApi'

type AuditLog = {
  id: number
  actor_role: string
  action: string
  subject_type?: string
  subject_id?: number
  justification?: string
  before_state?: Record<string, unknown>
  after_state?: Record<string, unknown>
  ip_address?: string
  performed_at: string
  actor?: { name: string; email: string }
}

const ROLE_COLORS: Record<string, string> = {
  SUPER_ADMIN: 'bg-violet-100 text-violet-800',
  FINANCE_ADMIN: 'bg-emerald-100 text-emerald-800',
  OPERATIONS_ADMIN: 'bg-sky-100 text-sky-800',
  MANAGER: 'bg-amber-100 text-amber-800',
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AuditLog | null>(null)
  const [filterAction, setFilterAction] = useState('')
  const [filterRole, setFilterRole] = useState('')

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const params = new URLSearchParams()
      if (filterAction) params.set('action', filterAction)
      if (filterRole) params.set('actor_role', filterRole)

      const res = await fetch(`/api/v1/admin/audit-logs?${params}`, { headers })
      const data = await res.json()
      if (res.ok) setLogs(data.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchLogs() }, [filterAction, filterRole])

  return (
    <AdminLayout>
      <div className="p-6 max-w-6xl space-y-5">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900">Audit Trail — Jejak Immutable</h1>
          <p className="text-xs text-slate-500 mt-0.5">Semua aksi sensitif Admin tercatat permanen dan tidak dapat diubah.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Filter aksi (e.g. complaint.resolved)"
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="input text-xs max-w-xs !h-9"
          />
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="input text-xs !h-9 max-w-[200px]"
          >
            <option value="">Semua Peran</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="FINANCE_ADMIN">Finance Admin</option>
            <option value="OPERATIONS_ADMIN">Operations Admin</option>
          </select>
          <button onClick={fetchLogs} className="btn-secondary !h-9 text-xs px-4">Muat Ulang</button>
        </div>

        <div className="grid lg:grid-cols-[1fr_380px] gap-5">
          {/* Log List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700">Log Aktivitas ({logs.length})</span>
            </div>

            {loading ? (
              <p className="text-xs text-slate-500 text-center py-10">Memuat log audit...</p>
            ) : logs.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-10">Belum ada log aktivitas tercatat.</p>
            ) : (
              <div className="divide-y divide-slate-50 max-h-[640px] overflow-y-auto">
                {logs.map((log) => (
                  <button
                    key={log.id}
                    onClick={() => setSelected(log)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${selected?.id === log.id ? 'bg-slate-50 border-l-2 border-[#00667e]' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wide ${ROLE_COLORS[log.actor_role] ?? 'bg-slate-100 text-slate-600'}`}>
                            {log.actor_role}
                          </span>
                          <code className="text-[10px] font-mono text-slate-700 font-bold">{log.action}</code>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate">
                          {log.actor?.name} · {log.subject_type} #{log.subject_id}
                        </p>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                        {new Date(log.performed_at).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="h-fit">
            {selected ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Detail Log #{selected.id}</p>
                  <h3 className="font-display text-base font-black mt-0.5 text-slate-900">{selected.action}</h3>
                </div>

                <div className="space-y-2 text-xs">
                  {[
                    ['Aktor', `${selected.actor?.name} (${selected.actor?.email})`],
                    ['Peran', selected.actor_role],
                    ['Entitas', `${selected.subject_type} #${selected.subject_id}`],
                    ['IP Address', selected.ip_address ?? '-'],
                    ['Waktu', new Date(selected.performed_at).toLocaleString('id-ID')],
                  ].map(([label, value]) => (
                    <div key={label} className="flex gap-2">
                      <span className="text-slate-400 w-24 shrink-0 font-semibold">{label}:</span>
                      <span className="text-slate-800 font-bold">{value}</span>
                    </div>
                  ))}
                </div>

                {selected.justification && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">Justifikasi Wajib</p>
                    <p className="text-xs text-amber-900 mt-1 leading-relaxed">{selected.justification}</p>
                  </div>
                )}

                {(selected.before_state || selected.after_state) && (
                  <div className="space-y-2">
                    {selected.before_state && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-[9px] font-bold text-red-600 uppercase mb-1">State Sebelum</p>
                        <code className="text-[10px] text-red-800">{JSON.stringify(selected.before_state)}</code>
                      </div>
                    )}
                    {selected.after_state && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <p className="text-[9px] font-bold text-emerald-600 uppercase mb-1">State Sesudah</p>
                        <code className="text-[10px] text-emerald-800">{JSON.stringify(selected.after_state)}</code>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400 space-y-2">
                <div className="text-3xl">🔒</div>
                <p className="font-semibold">Pilih entri log untuk melihat detail lengkap.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

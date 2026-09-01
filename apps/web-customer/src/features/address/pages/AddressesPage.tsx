import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Address = {
  id: number
  label: string | null
  recipient_name: string
  phone: string
  address_line: string
  is_default: boolean
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form
  const [label, setLabel] = useState('Rumah')
  const [recipientName, setRecipientName] = useState('')
  const [phone, setPhone] = useState('')
  const [addressLine, setAddressLine] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/v1/addresses', { headers })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal memuat alamat.')
      setAddresses(data?.data ?? data ?? [])
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void fetchAddresses() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`
      const res = await fetch('/api/v1/addresses', {
        method: 'POST',
        headers,
        body: JSON.stringify({ label, recipient_name: recipientName, phone, address_line: addressLine }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) throw new Error(data?.message ?? 'Gagal tambah alamat.')
      setLabel('Rumah'); setRecipientName(''); setPhone(''); setAddressLine('')
      await fetchAddresses()
    } catch (e: unknown) {
      setError((e as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleSetDefault = async (id: number) => {
    const token = getToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    await fetch(`/api/v1/addresses/${id}/default`, { method: 'POST', headers })
    await fetchAddresses()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus alamat ini?')) return
    const token = getToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`
    await fetch(`/api/v1/addresses/${id}`, { method: 'DELETE', headers })
    await fetchAddresses()
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <Link to="/profile" className="btn-ghost !h-10">Kembali Profil</Link>
        </div>
      </header>
      <main className="container-app py-8 max-w-3xl">
        <h1 className="font-display text-2xl font-extrabold">Kelola Alamat — Customer</h1>
        <p className="text-sm text-on-surface-variant mt-1">Alamat pribadi (Schema §4.10) terpisah dari alamat operasional laundry.</p>

        {error && <div className="mt-4 rounded-[--radius-md] bg-error-container p-3 text-sm text-on-error-container">{error}</div>}

        <form onSubmit={handleAdd} className="mt-6 card p-5 space-y-4">
          <h3 className="font-display font-bold">Tambah Alamat</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Label</label>
              <select value={label} onChange={(e) => setLabel(e.target.value)} className="input">
                <option value="Rumah">Rumah</option>
                <option value="Kantor">Kantor</option>
                <option value="Kos">Kos</option>
              </select>
            </div>
            <div>
              <label className="label">Nama Penerima *</label>
              <input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="Nama" required className="input" />
            </div>
            <div>
              <label className="label">Phone *</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="0812xxxx" required className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Alamat Lengkap *</label>
              <textarea value={addressLine} onChange={(e) => setAddressLine(e.target.value)} placeholder="Jl. Merdeka No. 1" required className="input min-h-[60px]" />
            </div>
          </div>
          <button type="submit" disabled={submitting} className="btn-primary !h-9 !px-4 text-xs">
            {submitting ? 'Menyimpan…' : 'Tambah Alamat'}
          </button>
        </form>

        <div className="mt-8">
          <h3 className="font-display font-bold">Daftar Alamat</h3>
          {loading ? (
            <p className="text-sm text-on-surface-variant mt-2">Memuat…</p>
          ) : addresses.length === 0 ? (
            <p className="text-sm text-on-surface-variant mt-2">Belum ada alamat. Tambah di atas.</p>
          ) : (
            <div className="mt-3 grid gap-3">
              {addresses.map((a) => (
                <div key={a.id} className="card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-display text-sm font-bold">{a.label} {a.is_default && <span className="badge-success">Default</span>}</p>
                    <p className="text-xs text-on-surface-variant">{a.recipient_name} • {a.phone}</p>
                    <p className="text-xs text-on-surface-variant">{a.address_line}</p>
                  </div>
                  <div className="flex gap-2">
                    {!a.is_default && <button onClick={() => handleSetDefault(a.id)} className="btn-secondary !h-8 !px-3 text-xs">Jadikan Default</button>}
                    <button onClick={() => handleDelete(a.id)} className="btn-ghost !h-8 !px-3 text-xs text-error">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

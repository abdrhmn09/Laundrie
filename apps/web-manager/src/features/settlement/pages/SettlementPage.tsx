import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type Settlement = {
  id: number
  settlement_number: string
  gross_amount: number
  platform_commission: number
  net_amount: number
  status: string
  bank_name: string
  account_number: string
  account_holder: string
  created_at: string
}

export default function SettlementPage() {
  const [data, setData] = useState<{
    total_earned: number
    total_withdrawn: number
    available_balance: number
    settlements: Settlement[]
  } | null>(null)

  const [amount, setAmount] = useState('')
  const [bankName, setBankName] = useState('BCA')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountHolder, setAccountHolder] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const fetchSettlements = async () => {
    const token = getToken()
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (token) headers.Authorization = `Bearer ${token}`

    const res = await fetch('/api/v1/laundry/settlements', { headers })
    const json = await res.json()
    if (res.ok) {
      setData(json)
    }
  }

  useEffect(() => {
    void fetchSettlements()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch('/api/v1/laundry/settlements/request', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          amount: parseFloat(amount),
          bank_name: bankName,
          account_number: accountNumber,
          account_holder: accountHolder,
        }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json.message || 'Gagal mengajukan pencairan.')

      setMessage('Pengajuan pencairan saldo berhasil dikirim ke Admin Finance!')
      setAmount('')
      await fetchSettlements()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3 max-w-3xl">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10 text-xs font-semibold">Dashboard</Link>
        </div>
      </header>

      <main className="container-app py-6 max-w-3xl space-y-6">
        <div>
          <h1 className="font-display text-2xl font-black text-slate-900 tracking-tight">
            Settlement & Keuangan Laundry
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pantau akumulasi pendapatan dan ajukan penarikan dana ke rekening bank.
          </p>
        </div>

        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs rounded-xl">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 font-bold text-xs rounded-xl">
            ⚠️ {error}
          </div>
        )}

        {/* Balance Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL PENDAPATAN</span>
            <p className="font-display text-xl font-black text-slate-900">
              Rp {Number(data?.total_earned || 0).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TOTAL DICAIKAN</span>
            <p className="font-display text-xl font-black text-slate-900">
              Rp {Number(data?.total_withdrawn || 0).toLocaleString('id-ID')}
            </p>
          </div>

          <div className="bg-[#00667e] text-white p-5 rounded-2xl shadow-md space-y-1">
            <span className="text-[10px] font-bold text-sky-200 uppercase tracking-wider">SALDO SIAP DICAIRKAN</span>
            <p className="font-display text-2xl font-black">
              Rp {Number(data?.available_balance || 0).toLocaleString('id-ID')}
            </p>
          </div>
        </div>

        {/* Request Settlement Form */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-slate-900">Ajukan Pencairan Dana Baru</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="label text-xs">Nominal Penarikan (Rp) *</label>
                <input
                  type="number"
                  min="10000"
                  placeholder="Contoh: 100000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="input text-xs font-semibold"
                />
              </div>

              <div>
                <label className="label text-xs">Bank Tujuan *</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="input text-xs"
                >
                  <option value="BCA">Bank BCA</option>
                  <option value="Mandiri">Bank Mandiri</option>
                  <option value="BRI">Bank BRI</option>
                  <option value="BNI">Bank BNI</option>
                  <option value="BSI">Bank Syariah Indonesia (BSI)</option>
                </select>
              </div>

              <div>
                <label className="label text-xs">Nomor Rekening *</label>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  className="input text-xs"
                />
              </div>

              <div>
                <label className="label text-xs">Nama Pemilik Rekening *</label>
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  required
                  className="input text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#00667e] hover:bg-[#005266] active:scale-[0.99] text-white font-bold text-xs py-3 px-6 rounded-full shadow transition"
            >
              {submitting ? 'Memproses...' : 'Kirim Pengajuan Pencairan →'}
            </button>
          </form>
        </div>

        {/* Settlement History */}
        <div className="space-y-3">
          <h3 className="font-bold text-base text-slate-900">Riwayat Settlement & Pencairan</h3>

          {data?.settlements.length === 0 ? (
            <div className="bg-white rounded-xl border p-6 text-center text-xs text-slate-500">
              Belum ada riwayat pengajuan pencairan dana.
            </div>
          ) : (
            <div className="space-y-3">
              {data?.settlements.map((s) => (
                <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400">{s.settlement_number}</span>
                    <h4 className="font-bold text-sm text-slate-900">Rp {Number(s.net_amount).toLocaleString('id-ID')}</h4>
                    <p className="text-xs text-slate-500">{s.bank_name} • {s.account_number} (a.n {s.account_holder})</p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap ${
                    s.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {s.status === 'PAID' ? 'LUNAS / CAIR ✅' : 'MENUNGGU APPROVAL'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Brand } from '../../../shared/components/Brand'
import { getToken } from '../../auth/api/authApi'

type InvoiceData = {
  invoice_number: string
  subtotal: number
  delivery_fee: number
  platform_fee: number
  total_amount: number
  status: string
  paid_at?: string
}

type OrderData = {
  id: number
  order_number: string
  status: string
  laundry: { business_name: string; address_line: string; contact_phone: string }
  customer: { name: string; phone: string; email: string }
  items: Array<{ id: number; service: { name: string }; quantity: number; unit_price: number; estimated_amount: number }>
}

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoice = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      const res = await fetch(`/api/v1/orders/${id}/invoice`, { headers })
      const data = await res.json()
      if (res.ok) {
        setOrder(data.order)
        setInvoice(data.invoice)
      } else {
        setError(data.message || 'Gagal memuat invoice.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      void fetchInvoice()
    }
  }, [id])

  const handlePayNow = async () => {
    try {
      setPaying(true)
      setError(null)
      const token = getToken()
      const headers: Record<string, string> = { Accept: 'application/json', 'Content-Type': 'application/json' }
      if (token) headers.Authorization = `Bearer ${token}`

      // 1. Charge payment
      const chargeRes = await fetch(`/api/v1/orders/${id}/payments/charge`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ payment_type: 'qris', provider: 'MIDTRANS' }),
      })
      const chargeData = await chargeRes.json()
      if (!chargeRes.ok) throw new Error(chargeData.message || 'Gagal menginisialisasi pembayaran.')

      const paymentId = chargeData.payment.id

      // 2. Simulate Midtrans payment success
      const simRes = await fetch(`/api/v1/payments/${paymentId}/simulate`, {
        method: 'POST',
        headers,
      })
      const simData = await simRes.json()
      if (!simRes.ok) throw new Error(simData.message || 'Gagal mensimulasikan pembayaran.')

      setPaymentSuccess(true)
      await fetchInvoice()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setPaying(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
        <p className="text-xs font-semibold text-slate-500">Memuat rincian invoice...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16 font-sans">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3 max-w-3xl">
          <Brand size="sm" />
          <Link to="/dashboard" className="btn-ghost !h-10 text-xs font-semibold">Kembali</Link>
        </div>
      </header>

      <main className="container-app py-6 max-w-3xl">
        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {paymentSuccess && (
          <div className="mb-4 rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800">
            🎉 Pembayaran Berhasil! Pesanan #{order?.order_number} telah terkonfirmasi.
          </div>
        )}

        {invoice && order && (
          <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-6 shadow-sm">
            {/* Header */}
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OFFICIAL INVOICE</span>
                <h1 className="font-display text-xl font-black text-slate-900 mt-0.5">{invoice.invoice_number}</h1>
                <p className="text-xs text-slate-500">Order #{order.order_number}</p>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {invoice.status === 'PAID' ? 'LUNAS ✅' : 'BELUM BAYAR'}
              </span>
            </div>

            {/* Merchant & Client Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">MITRA LAUNDRY</p>
                <p className="font-bold text-slate-900 mt-0.5 text-sm">{order.laundry?.business_name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{order.laundry?.address_line}</p>
              </div>
              <div>
                <p className="font-bold text-slate-400 text-[10px] uppercase tracking-wider">PELANGGAN</p>
                <p className="font-bold text-slate-900 mt-0.5 text-sm">{order.customer?.name}</p>
                <p className="text-slate-500 text-xs mt-0.5">{order.customer?.phone}</p>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RINCIAN LAYANAN</span>
              {order.items?.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs py-1 border-b border-slate-50">
                  <div>
                    <p className="font-bold text-slate-800">{item.service?.name}</p>
                    <p className="text-[11px] text-slate-500">{item.quantity} x Rp {Number(item.unit_price).toLocaleString('id-ID')}</p>
                  </div>
                  <p className="font-bold text-slate-900">Rp {Number(item.estimated_amount).toLocaleString('id-ID')}</p>
                </div>
              ))}
            </div>

            {/* Cost Summary */}
            <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Layanan</span>
                <span>Rp {Number(invoice.subtotal).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Pengantaran (Kurir)</span>
                <span>Rp {Number(invoice.delivery_fee).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Biaya Layanan Platform</span>
                <span>Rp {Number(invoice.platform_fee).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-200">
                <span>TOTAL PEMBAYARAN</span>
                <span className="text-[#00667e]">Rp {Number(invoice.total_amount).toLocaleString('id-ID')}</span>
              </div>
            </div>

            {/* Action Buttons */}
            {invoice.status !== 'PAID' ? (
              <button
                onClick={handlePayNow}
                disabled={paying}
                className="w-full bg-[#00667e] hover:bg-[#005266] active:scale-[0.99] text-white font-bold text-sm py-3.5 rounded-full shadow-md transition"
              >
                {paying ? 'Memproses Pembayaran...' : '💳 Bayar Sekarang via Midtrans Snap'}
              </button>
            ) : (
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-2">
                <p className="text-xs font-bold text-emerald-800">✅ Pembayaran Telah Diterima</p>
                <p className="text-[11px] text-emerald-600">Invoice ini dapat dicetak atau disimpan sebagai bukti transaksi sah.</p>
                <button onClick={() => window.print()} className="btn-secondary !h-9 text-xs font-bold">🖨️ Cetak / Simpan Invoice PDF</button>
              </div>
            )}

            {/* Granular Order Navigation Toolbar */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">ALUR & FITUR PESANAN</span>
              <div className="grid grid-cols-3 gap-2">
                <Link to={`/orders/${id}/evidence`} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-center group">
                  <span className="text-lg mb-1 group-hover:scale-110 transition-transform">⚖️</span>
                  <span className="text-[11px] font-bold text-slate-700">Bukti Berat</span>
                </Link>
                <Link to={`/orders/${id}/complaint`} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-center group">
                  <span className="text-lg mb-1 group-hover:scale-110 transition-transform">🚨</span>
                  <span className="text-[11px] font-bold text-slate-700">Komplain</span>
                </Link>
                <Link to={`/orders/${id}/review`} className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-center group">
                  <span className="text-lg mb-1 group-hover:scale-110 transition-transform">⭐</span>
                  <span className="text-[11px] font-bold text-slate-700">Ulasan</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

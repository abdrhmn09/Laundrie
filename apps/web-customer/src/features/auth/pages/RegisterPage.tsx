import { useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import { Field } from '../../../shared/components/Field'
import { FadeIn } from '../../../shared/components/motion'
import { PasswordStrengthMeter } from '../../../shared/components/PasswordStrengthMeter'
import { useAuth } from '../context/AuthContext'
import { getFieldError, type ApiError } from '../api/authApi'

type SelectedRoleCategory = 'customer' | 'courier' | 'outlet' | 'admin'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()

  const [roleCategory, setRoleCategory] = useState<SelectedRoleCategory>('customer')
  
  // Basic Fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')

  // Courier Specific Fields
  const [vehicleType, setVehicleType] = useState('Motorcycle')
  const [licensePlate, setLicensePlate] = useState('')
  const [simNumber, setSimNumber] = useState('')

  // Outlet / Manager Specific Fields
  const [outletName, setOutletName] = useState('')
  const [outletAddress, setOutletAddress] = useState('')

  // Admin Specific Fields
  const [invitationCode, setInvitationCode] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<ApiError | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const errorRef = useRef<HTMLDivElement>(null)

  const nameError = getFieldError(error, 'name')
  const emailError = getFieldError(error, 'email')
  const phoneError = getFieldError(error, 'phone')
  const passwordError = getFieldError(error, 'password')
  const confirmationError = getFieldError(error, 'password_confirmation')

  // Role specific backend error mapping
  const vehicleTypeError = getFieldError(error, 'vehicle_type')
  const licensePlateError = getFieldError(error, 'license_plate')
  const outletNameError = getFieldError(error, 'outlet_name')
  const outletAddressError = getFieldError(error, 'outlet_address')
  const invitationCodeError = getFieldError(error, 'invitation_code')

  const emailFormatError = touched.email && email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? 'Format email tidak valid.'
    : undefined
  const passwordLengthError = touched.password && password && password.length < 8
    ? 'Password minimal 8 karakter.'
    : undefined
  const confirmationMatchError = touched.password_confirmation && passwordConfirmation && passwordConfirmation !== password
    ? 'Konfirmasi password tidak cocok.'
    : undefined

  const handleBlur = (field: string) => {
    setTouched((t) => ({ ...t, [field]: true }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!agreed) {
      setError({ message: 'Anda wajib menyetujui Syarat & Ketentuan.' })
      return
    }

    setTouched({ name: true, email: true, phone: true, password: true, password_confirmation: true })
    setSubmitting(true)
    setError(null)

    let mappedRole = 'customer'
    if (roleCategory === 'courier') mappedRole = 'courier'
    else if (roleCategory === 'outlet') mappedRole = 'manager'
    else if (roleCategory === 'admin') mappedRole = 'operations_admin'

    try {
      const res = await register({
        name,
        email,
        phone,
        password,
        password_confirmation: passwordConfirmation,
        role: mappedRole,
        vehicle_type: roleCategory === 'courier' ? vehicleType : undefined,
        license_plate: roleCategory === 'courier' ? licensePlate : undefined,
        sim_number: roleCategory === 'courier' ? simNumber : undefined,
        outlet_name: roleCategory === 'outlet' ? outletName : undefined,
        outlet_address: roleCategory === 'outlet' ? outletAddress : undefined,
        invitation_code: roleCategory === 'admin' ? invitationCode : undefined,
      })

      if (res.user.status === 'pending_verification') {
        alert(res.message || 'Pendaftaran berhasil. Akun Anda sedang dalam proses peninjauan oleh Tim Operasional Laundrie.')
      }
      navigate('/verify-email')
    } catch (err) {
      setError(err as ApiError)
      requestAnimationFrame(() => errorRef.current?.focus())
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <FadeIn delay={200}>
        <div className="mb-6">
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-on-surface">
            Pendaftaran Akun Laundrie
          </h1>
          <p className="mt-2 text-sm text-on-surface-variant">
            Pilih jenis akun sesuai dengan peran Anda di ekosistem platform Laundrie.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={250}>
        {/* Role Selector Tabs */}
        <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <button
            type="button"
            onClick={() => setRoleCategory('customer')}
            className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
              roleCategory === 'customer'
                ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                : 'border-outline-variant/60 bg-surface hover:bg-surface-variant/50 text-on-surface-variant'
            }`}
          >
            <span className="text-xl">🛍️</span>
            <span className="mt-1 text-xs">Pelanggan</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleCategory('courier')}
            className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
              roleCategory === 'courier'
                ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                : 'border-outline-variant/60 bg-surface hover:bg-surface-variant/50 text-on-surface-variant'
            }`}
          >
            <span className="text-xl">🚚</span>
            <span className="mt-1 text-xs">Mitra Kurir</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleCategory('outlet')}
            className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
              roleCategory === 'outlet'
                ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                : 'border-outline-variant/60 bg-surface hover:bg-surface-variant/50 text-on-surface-variant'
            }`}
          >
            <span className="text-xl">🧺</span>
            <span className="mt-1 text-xs">Mitra Laundry</span>
          </button>

          <button
            type="button"
            onClick={() => setRoleCategory('admin')}
            className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition-all ${
              roleCategory === 'admin'
                ? 'border-primary bg-primary/5 text-primary shadow-sm font-bold'
                : 'border-outline-variant/60 bg-surface hover:bg-surface-variant/50 text-on-surface-variant'
            }`}
          >
            <span className="text-xl">🛡️</span>
            <span className="mt-1 text-xs">Internal Admin</span>
          </button>
        </div>
      </FadeIn>

      <FadeIn delay={300}>
        <form onSubmit={handleSubmit} className="card-lifted space-y-5 p-6 sm:p-8" noValidate>
          {error && (
            <div
              ref={errorRef}
              tabIndex={-1}
              className="space-y-2 rounded-[--radius-md] bg-error-container p-4"
              role="alert"
            >
              <p className="text-sm font-semibold text-on-error-container">{error.message}</p>
            </div>
          )}

          {/* Role Status Note */}
          <div className="rounded-lg bg-surface-bright p-3.5 border border-[#e1eef3] text-xs leading-relaxed text-on-surface-variant">
            {roleCategory === 'customer' && (
              <p>💡 <strong>Akun Pelanggan:</strong> Bebas pesan jasa cuci jemput-antar. Setelah mendaftar, email verifikasi akan dikirimkan.</p>
            )}
            {roleCategory === 'courier' && (
              <p>🚚 <strong>Mitra Kurir:</strong> Memerlukan verifikasi data kendaraan & SIM oleh Tim Operasional Laundrie sebelum akun diaktifkan.</p>
            )}
            {roleCategory === 'outlet' && (
              <p>🧺 <strong>Mitra Laundry:</strong> Memerlukan verifikasi lokasi & nama outlet laundry oleh Admin sebelum dapat menerima pesanan.</p>
            )}
            {roleCategory === 'admin' && (
              <p>🛡️ <strong>Admin Internal:</strong> Memerlukan Kode Undangan Rahasia (Invitation Code) resmi dari SuperAdmin Laundrie.</p>
            )}
          </div>

          <Field id="name" label="Nama Lengkap" error={nameError}>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              className="input"
              placeholder="Nama Lengkap Anda"
              value={name}
              onBlur={() => handleBlur('name')}
              onChange={(e) => setName(e.target.value)}
            />
          </Field>

          <Field id="email" label="Email" error={emailError ?? emailFormatError}>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              className="input"
              placeholder="nama@contoh.com"
              value={email}
              onBlur={() => handleBlur('email')}
              onChange={(e) => setEmail(e.target.value)}
            />
          </Field>

          <Field id="phone" label="Nomor WhatsApp" error={phoneError}>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              className="input"
              placeholder="08xxxxxxxxxx"
              value={phone}
              onBlur={() => handleBlur('phone')}
              onChange={(e) => setPhone(e.target.value)}
            />
          </Field>

          {/* Conditional Role-Based Form Inputs */}
          {roleCategory === 'courier' && (
            <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h4 className="font-display text-xs font-bold text-primary uppercase tracking-wider">Informasi Kendaraan Kurir</h4>
              
              <Field id="vehicle_type" label="Jenis Kendaraan" error={vehicleTypeError}>
                <select
                  id="vehicle_type"
                  className="input"
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                >
                  <option value="Motorcycle">Sepeda Motor</option>
                  <option value="Car">Mobil Box / Pick Up</option>
                  <option value="Bicycle">Sepeda</option>
                </select>
              </Field>

              <Field id="license_plate" label="Nomor Polisi (Plat Nomor)" error={licensePlateError}>
                <input
                  id="license_plate"
                  type="text"
                  required
                  className="input uppercase"
                  placeholder="Contoh: B 1234 ABC"
                  value={licensePlate}
                  onChange={(e) => setLicensePlate(e.target.value)}
                />
              </Field>

              <Field id="sim_number" label="Nomor SIM C/A (Opsional)">
                <input
                  id="sim_number"
                  type="text"
                  className="input"
                  placeholder="Nomor SIM Anda"
                  value={simNumber}
                  onChange={(e) => setSimNumber(e.target.value)}
                />
              </Field>
            </div>
          )}

          {roleCategory === 'outlet' && (
            <div className="space-y-4 rounded-xl border border-primary/20 bg-primary/5 p-4">
              <h4 className="font-display text-xs font-bold text-primary uppercase tracking-wider">Informasi Outlet Laundry</h4>

              <Field id="outlet_name" label="Nama Outlet / Usaha Laundry" error={outletNameError}>
                <input
                  id="outlet_name"
                  type="text"
                  required
                  className="input"
                  placeholder="Contoh: CleanExpress Laundry Cabang 1"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                />
              </Field>

              <Field id="outlet_address" label="Alamat Lengkap Outlet Laundry" error={outletAddressError}>
                <textarea
                  id="outlet_address"
                  required
                  rows={2}
                  className="input"
                  placeholder="Jl. Merdeka No. 45, Bandung"
                  value={outletAddress}
                  onChange={(e) => setOutletAddress(e.target.value)}
                />
              </Field>
            </div>
          )}

          {roleCategory === 'admin' && (
            <div className="space-y-4 rounded-xl border border-rose-200 bg-rose-50/50 p-4">
              <h4 className="font-display text-xs font-bold text-rose-700 uppercase tracking-wider">Otentikasi Internal Admin</h4>

              <Field id="invitation_code" label="Kode Undangan Internal Admin" error={invitationCodeError} hint="Masukkan kode rahasia dari SuperAdmin.">
                <input
                  id="invitation_code"
                  type="password"
                  required
                  className="input font-mono"
                  placeholder="LAUNDRIE-ADMIN-2026"
                  value={invitationCode}
                  onChange={(e) => setInvitationCode(e.target.value)}
                />
              </Field>
            </div>
          )}

          <Field id="password" label="Password" error={passwordError ?? passwordLengthError} hint="Minimal 8 karakter.">
            <div className="input-password-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                className="input"
                placeholder="Minimal 8 karakter"
                value={password}
                onBlur={() => handleBlur('password')}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? 'Sembunyi' : 'Lihat'}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
          </Field>

          <Field id="password_confirmation" label="Konfirmasi Password" error={confirmationError ?? confirmationMatchError}>
            <input
              id="password_confirmation"
              type="password"
              autoComplete="new-password"
              required
              className="input"
              placeholder="Ulangi password Anda"
              value={passwordConfirmation}
              onBlur={() => handleBlur('password_confirmation')}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
            />
          </Field>

          <div className="flex items-start gap-2.5 pt-1">
            <input
              id="tos"
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
            />
            <label htmlFor="tos" className="text-xs text-on-surface-variant leading-relaxed">
              Saya menyetujui <span className="font-semibold text-on-surface">Syarat & Ketentuan</span> serta{' '}
              <span className="font-semibold text-on-surface">Kebijakan Privasi</span> Laundrie.
            </label>
          </div>

          <button type="submit" disabled={submitting || !agreed} className="btn-primary w-full">
            {submitting && <span className="spinner" aria-hidden="true" />}
            {submitting ? 'Memproses Pendaftaran...' : 'Daftar Sekarang'}
          </button>

          <p className="text-center text-sm text-on-surface-variant">
            Sudah punya akun?{' '}
            <Link to="/login" className="font-semibold text-primary hover:underline">
              Masuk di sini
            </Link>
          </p>
        </form>
      </FadeIn>
    </AuthLayout>
  )
}
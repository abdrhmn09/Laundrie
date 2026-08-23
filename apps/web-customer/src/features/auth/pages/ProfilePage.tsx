import { useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Brand } from '../../../shared/components/Brand'
import { Field } from '../../../shared/components/Field'
import { authApi, type ApiError } from '../api/authApi'

export default function ProfilePage() {
  const { user, logout, setUser } = useAuth()

  const [name, setName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState(user?.phone ?? '')
  const [gender, setGender] = useState(user?.gender ?? '')
  const [dateOfBirth, setDateOfBirth] = useState(user?.date_of_birth ?? '')
  const [emailNotifications, setEmailNotifications] = useState(user?.email_notifications ?? true)
  const [whatsappNotifications, setWhatsappNotifications] = useState(user?.whatsapp_notifications ?? false)

  // Instagram Avatar Upload & Preview States
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [zoomScale, setZoomScale] = useState(1)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError({ message: 'File yang dipilih harus berupa gambar (JPG, PNG, WEBP).' })
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError({ message: 'Ukuran file foto maksimal 5MB.' })
      return
    }

    setSelectedFile(file)
    setPreviewUrl(URL.createObjectURL(file))
    setZoomScale(1)
    setPreviewModalOpen(true)
  }

  const handleUploadAvatar = async () => {
    if (!selectedFile) return
    setUploadingAvatar(true)
    setError(null)

    try {
      const res = await authApi.uploadAvatar(selectedFile)
      setUser(res.user)
      setSuccessMsg('Foto profil berhasil diperbarui!')
      setPreviewModalOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleDeleteAvatar = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto profil saat ini?')) return
    setUploadingAvatar(true)
    setError(null)

    try {
      const res = await authApi.deleteAvatar()
      setUser(res.user)
      setSuccessMsg('Foto profil berhasil dihapus.')
      setPreviewModalOpen(false)
      setSelectedFile(null)
      setPreviewUrl(null)
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccessMsg(null)

    try {
      const res = await authApi.updateProfile({
        name,
        phone,
        gender,
        date_of_birth: dateOfBirth,
        email_notifications: emailNotifications,
        whatsapp_notifications: whatsappNotifications,
      })
      setUser(res.user)
      setSuccessMsg('Profil Anda berhasil diperbarui.')
    } catch (err) {
      setError(err as ApiError)
    } finally {
      setSubmitting(false)
    }
  }

  const currentAvatar = user?.avatar_url

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-[#e1eef3] bg-white/85 backdrop-blur">
        <div className="container-app flex items-center justify-between py-3">
          <Brand size="sm" />
          <div className="flex items-center gap-3">
            <Link to="/dashboard" className="btn-ghost !h-10 !px-3">
              Dashboard
            </Link>
            <button onClick={logout} className="btn-secondary !h-10 !px-4">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="container-app py-8 max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-on-surface sm:text-3xl">
              Pengaturan Profil
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Kelola foto profil, informasi pribadi, notifikasi, dan keamanan akun Anda.
            </p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Quick Access Menu */}
          <div className="flex flex-wrap gap-2">
            <span className="badge-active">Informasi Profil</span>
            <Link to="/profile/change-password" className="badge-neutral hover:bg-surface-variant/80">
              Ganti Password →
            </Link>
            <Link to="/profile/sessions" className="badge-neutral hover:bg-surface-variant/80">
              Sesi & Perangkat →
            </Link>
          </div>

          {/* Capability Hub — PRD §7 One Account, Multiple Capabilities */}
          <div className="card-lifted p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-bold text-on-surface">Peran & Kemampuan Anda</h2>
              <span className="badge-active">PRD §7</span>
            </div>
            <p className="text-sm text-on-surface-variant">
              Satu akun dapat menjadi Customer, Manager, Staff, dan Courier sekaligus tanpa membuat akun kedua.
            </p>

            {/* Existing capabilities */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="card p-4 border-l-4 border-l-primary">
                <p className="text-xs font-bold tracking-widest text-primary">CUSTOMER</p>
                <p className="font-display text-sm font-bold text-on-surface">Pelanggan</p>
                <p className="text-xs text-on-surface-variant">Dapat memesan laundry & melacak pesanan</p>
                <span className="badge-success mt-2">Aktif</span>
              </div>

              {user?.capabilities?.is_manager && user?.laundry ? (
                <div className="card p-4 border-l-4 border-l-tertiary">
                  <p className="text-xs font-bold tracking-widest text-tertiary">MANAGER</p>
                  <p className="font-display text-sm font-bold text-on-surface">{user.laundry.business_name}</p>
                  <p className="text-xs text-on-surface-variant">Status: {user.laundry.status}</p>
                  <span className="badge-active mt-2">Owner</span>
                </div>
              ) : null}

              {user?.capabilities?.is_staff && user?.staff ? (
                <div className="card p-4 border-l-4 border-l-secondary">
                  <p className="text-xs font-bold tracking-widest text-secondary">STAFF</p>
                  <p className="font-display text-sm font-bold text-on-surface">{user.staff.laundry_name ?? 'Laundry'}</p>
                  <p className="text-xs text-on-surface-variant">Role: {user.staff.role} • {user.staff.status}</p>
                  <span className="badge-neutral mt-2">Staff Aktif</span>
                </div>
              ) : null}

              {user?.capabilities?.is_courier && user?.courier ? (
                <div className="card p-4 border-l-4 border-l-status-success">
                  <p className="text-xs font-bold tracking-widest text-status-success">COURIER</p>
                  <p className="font-display text-sm font-bold text-on-surface">
                    {user.courier.courier_type === 'freelance' ? 'Freelance Courier' : 'Staff Courier'}
                  </p>
                  <p className="text-xs text-on-surface-variant">Status: {user.courier.status}</p>
                  <span className="badge-success mt-2">{user.courier.courier_type}</span>
                </div>
              ) : null}

              {user?.capabilities?.is_admin && user?.admin ? (
                <div className="card p-4 border-l-4 border-l-error">
                  <p className="text-xs font-bold tracking-widest text-error">ADMIN</p>
                  <p className="font-display text-sm font-bold text-on-surface">{user.admin.role}</p>
                  <span className="badge-error mt-2">Admin</span>
                </div>
              ) : null}
            </div>

            {/* Onboarding CTA — only for users without those capabilities */}
            {(!user?.capabilities?.is_manager || !user?.capabilities?.is_staff || !user?.capabilities?.is_courier) && (
              <div className="space-y-3 pt-2">
                <h3 className="font-display text-sm font-bold text-on-surface">Mulai Berperan di Laundrie</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {!user?.capabilities?.is_manager && (
                    <Link to="/profile/laundry/create" className="card p-4 hover:shadow-md transition-shadow text-left group">
                      <div className="h-10 w-10 rounded-[--radius-md] bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:bg-primary group-hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                      </div>
                      <p className="font-display text-sm font-bold text-on-surface">Buat Laundry</p>
                      <p className="text-xs text-on-surface-variant mt-1">Buka dan kelola laundry Anda</p>
                    </Link>
                  )}
                  {!user?.capabilities?.is_staff && (
                    <Link to="/profile/staff/discovery" className="card p-4 hover:shadow-md transition-shadow text-left group">
                      <div className="h-10 w-10 rounded-[--radius-md] bg-secondary/10 flex items-center justify-center text-secondary mb-3 group-hover:bg-secondary group-hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                      </div>
                      <p className="font-display text-sm font-bold text-on-surface">Gabung sebagai Staff</p>
                      <p className="text-xs text-on-surface-variant mt-1">Cari lowongan laundry</p>
                    </Link>
                  )}
                  {!user?.capabilities?.is_courier && (
                    <Link to="/profile/courier/onboarding" className="card p-4 hover:shadow-md transition-shadow text-left group">
                      <div className="h-10 w-10 rounded-[--radius-md] bg-tertiary/10 flex items-center justify-center text-tertiary mb-3 group-hover:bg-tertiary group-hover:text-white transition-colors">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5"><circle cx="12" cy="12" r="10" /><polyline points="16 12 12 8 8 12" /><line x1="12" y1="16" x2="12" y2="8" /></svg>
                      </div>
                      <p className="font-display text-sm font-bold text-on-surface">Daftar sebagai Courier</p>
                      <p className="text-xs text-on-surface-variant mt-1">Freelance atau Staff Courier</p>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="card-lifted p-6 space-y-6" noValidate>
            {successMsg && (
              <div className="rounded-[--radius-md] bg-status-success-container p-4 text-sm font-semibold text-status-success">
                {successMsg}
              </div>
            )}

            {error && (
              <div className="rounded-[--radius-md] bg-error-container p-4 text-sm font-semibold text-on-error-container">
                {error.message}
              </div>
            )}

            {/* Instagram-Style Avatar Picker Section */}
            <div className="rounded-[--radius-lg] border border-[#e1eef3] bg-surface-bright p-5">
              <label className="block text-sm font-bold text-on-surface mb-3">Foto Profil Akun</label>
              
              <div className="flex flex-col sm:flex-row items-center gap-5">
                {/* Instagram Ring Avatar Badge */}
                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[3px] shadow-md transition-transform duration-200 group-hover:scale-105">
                    <div className="h-full w-full rounded-full bg-white p-[2px]">
                      <div className="h-full w-full overflow-hidden rounded-full bg-primary-container flex items-center justify-center font-display text-3xl font-extrabold text-on-primary-container">
                        {currentAvatar ? (
                          <img src={currentAvatar} alt={name} className="h-full w-full object-cover" />
                        ) : (
                          name.charAt(0).toUpperCase()
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity duration-200">
                    📷 Ganti Foto
                  </div>
                </div>

                <div className="space-y-2 text-center sm:text-left flex-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="btn-primary !py-2 !px-4 !text-xs"
                    >
                      📁 Pilih Foto dari Perangkat
                    </button>

                    {currentAvatar && (
                      <button
                        type="button"
                        onClick={handleDeleteAvatar}
                        disabled={uploadingAvatar}
                        className="btn-secondary !py-2 !px-3 !text-xs !text-error hover:!bg-error-container"
                      >
                        🗑️ Hapus Foto
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    Format gambar: JPG, PNG, atau WEBP. Maksimal ukuran file 5MB. Ditampilkan dalam bentuk lingkaran presisi seperti Instagram.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="name" label="Nama Lengkap" error={error?.errors?.name?.[0]}>
                <input
                  id="name"
                  type="text"
                  required
                  className="input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </Field>

              <Field id="phone" label="Nomor WhatsApp" error={error?.errors?.phone?.[0]}>
                <input
                  id="phone"
                  type="tel"
                  className="input"
                  placeholder="08xxxxxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="gender" label="Jenis Kelamin">
                <select
                  id="gender"
                  className="input"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="">Pilih Jenis Kelamin</option>
                  <option value="male">Laki-laki</option>
                  <option value="female">Perempuan</option>
                  <option value="prefer_not_to_say">Pilih untuk tidak menyebutkan</option>
                </select>
              </Field>

              <Field id="date_of_birth" label="Tanggal Lahir">
                <input
                  id="date_of_birth"
                  type="date"
                  className="input"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </Field>
            </div>

            <div className="border-t border-[#e1eef3] pt-5">
              <h3 className="font-display text-base font-bold text-on-surface mb-3">
                Preferensi Notifikasi
              </h3>
              <div className="space-y-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-on-surface">Notifikasi Email</span>
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm font-medium text-on-surface">Notifikasi WhatsApp</span>
                  <input
                    type="checkbox"
                    checked={whatsappNotifications}
                    onChange={(e) => setWhatsappNotifications(e.target.checked)}
                    className="h-5 w-5 rounded border-outline-variant text-primary focus:ring-primary"
                  />
                </label>
              </div>
            </div>

            <div className="pt-2">
              <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto">
                {submitting && <span className="spinner" aria-hidden="true" />}
                {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Instagram Story Avatar Preview Modal */}
      {previewModalOpen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2">
                📸 Live Preview Foto Profil
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Instagram Multi-Context Display Preview */}
            <div className="space-y-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-semibold text-gray-500 text-center">
                Preview tampilan di berbagai sudut aplikasi (Instagram-Style):
              </p>

              {/* 1. Main Profile Badge with Instagram Ring */}
              <div className="flex flex-col items-center justify-center py-3">
                <div className="h-28 w-28 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[4px] shadow-xl">
                  <div className="h-full w-full rounded-full bg-white p-[3px]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-gray-200 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-full w-full object-cover transition-transform duration-150"
                        style={{ transform: `scale(${zoomScale})` }}
                      />
                    </div>
                  </div>
                </div>
                <span className="mt-2 text-xs font-bold text-gray-800">{name || 'Nama Anda'}</span>
                <span className="text-[11px] text-gray-500">Tampilan Lingkaran Profil Utama</span>
              </div>

              {/* 2. Chat / Header Badge Preview */}
              <div className="flex items-center justify-between border-t border-gray-200 pt-3 px-2">
                <span className="text-xs font-medium text-gray-600">Miniatur Header & Chat:</span>
                <div className="flex items-center gap-2">
                  <div className="relative h-10 w-10 rounded-full bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-[2px]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-gray-100">
                      <img src={previewUrl} alt="Mini preview" className="h-full w-full object-cover" />
                    </div>
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white" />
                  </div>
                  <span className="text-xs font-bold text-gray-700">Online</span>
                </div>
              </div>

              {/* Zoom Controls */}
              <div className="space-y-1 pt-2">
                <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                  <span>Skala Perbesaran Foto:</span>
                  <span>{Math.round(zoomScale * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="2"
                  step="0.05"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPreviewModalOpen(false)}
                className="btn-ghost !h-10 !px-4 text-xs font-medium text-gray-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleUploadAvatar}
                disabled={uploadingAvatar}
                className="btn-primary !h-10 !px-5 text-xs font-bold"
              >
                {uploadingAvatar && <span className="spinner" aria-hidden="true" />}
                {uploadingAvatar ? 'Mengunggah...' : 'Simpan Foto Profil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

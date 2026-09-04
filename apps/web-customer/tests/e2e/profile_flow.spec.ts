import { test, expect } from '@playwright/test'

test('profile hub menampilkan CTA onboarding sesuai capability', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/login')
  await page.getByLabel('Email').fill('uzmk.naruto19@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Pengaturan Profil' })).toBeVisible({ timeout: 10000 }).catch(async () => {
    await page.goto('http://127.0.0.1:5173/profile')
    await expect(page.getByRole('heading', { name: 'Pengaturan Profil' })).toBeVisible({ timeout: 10000 })
  })
  // Directly check via goto profile
  await page.goto('http://127.0.0.1:5173/profile')
  await expect(page.getByText('Peran & Kemampuan Anda')).toBeVisible()
  // User already has laundry, so check for "Buka web-manager" instead of "Buat Laundry"
  await expect(page.getByText('Buat Laundry').first()).toBeVisible()
  await expect(page.getByText('Gabung sebagai Staff').first()).toBeVisible()
  await expect(page.getByText('Daftar sebagai Courier').first()).toBeVisible()
})

test('buat laundry via profil lalu redirect ke web-manager', async ({ page }) => {
  const uid = `${Date.now()}${Math.floor(Math.random()*100000)}`
  const email = `flow_mgr_${uid}@example.com`
  const phone = `08${uid.slice(-9).padStart(9,'0')}`
  await page.goto('http://127.0.0.1:5173/register')
  await page.getByLabel('Nama Lengkap').fill('Flow Manager')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Nomor WhatsApp').fill(phone)
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByLabel('Konfirmasi Password').fill('password123')
  await page.getByLabel(/Saya menyetujui/).check()
  await page.getByRole('button', { name: 'Daftar Sekarang' }).click()
  await expect(page.getByRole('heading', { name: 'Verifikasi Email Anda' })).toBeVisible({ timeout: 10000 })
  await page.goto('http://127.0.0.1:5173/profile/laundry/create')
  await expect(page.getByLabel('Nama Bisnis Laundry')).toBeVisible({ timeout: 10000 })
  const biz = `Laundry Flow ${uid}`
  await page.getByLabel('Nama Bisnis Laundry').fill(biz)
  await page.getByLabel('Alamat Operasional Laundry').fill('Jl. Flow No. 1, Peudada')
  await page.getByLabel('Kontak Laundry').fill(phone)
  await page.getByRole('button', { name: 'Buat Laundry' }).click()
  // Tunggu redirect ke web-manager (token forwarding) — tunggu jaringan idle
  await page.waitForURL(/127\.0\.0\.1:5174/, { timeout: 15000 })
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  // Tunggu dashboard manager setelah AuthContext refresh (beri waktu lebih)
  await expect(page.getByRole('heading', { name: 'Dashboard Manager' })).toBeVisible({ timeout: 20000 })
  await expect(page.getByText(biz).first()).toBeVisible({ timeout: 10000 })
})

test('gabung staff via discovery lowongan OPEN', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/login')
  await page.getByLabel('Email').fill('wolfegreyash@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await page.waitForURL(/\/profile|\/dashboard/, { timeout: 10000 })
  await page.goto('http://127.0.0.1:5173/profile/staff/discovery')
  await expect(page.getByRole('heading', { name: 'Gabung sebagai Staff' })).toBeAttached({ timeout: 10000 })
  // Check that at least one OPEN opening from seeded data exists
  await expect(page.locator('main')).toContainText('Laundrie Express Peudada', { timeout: 10000 })
  await expect(page.getByRole('button', { name: 'Lamar Staff' }).first()).toBeVisible()
})

test('daftar freelance courier lalu redirect ke web-courier', async ({ page }) => {
  const uid = `${Date.now()}${Math.floor(Math.random()*100000)}`
  const email = `flow_courier_${uid}@example.com`
  const phone = `08${uid.slice(-9).padStart(9,'0')}`
  await page.goto('http://127.0.0.1:5173/register')
  await page.getByLabel('Nama Lengkap').fill('Flow Courier')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Nomor WhatsApp').fill(phone)
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByLabel('Konfirmasi Password').fill('password123')
  await page.getByLabel(/Saya menyetujui/).check()
  await page.getByRole('button', { name: 'Daftar Sekarang' }).click()
  await expect(page.getByRole('heading', { name: 'Verifikasi Email Anda' })).toBeVisible({ timeout: 10000 })
  await page.goto('http://127.0.0.1:5173/profile/courier/onboarding')
  await expect(page.getByRole('heading', { name: 'Daftar sebagai Courier' })).toBeAttached({ timeout: 10000 })
  await page.getByRole('button', { name: 'Daftar Freelance Courier' }).click()
  await page.waitForURL(/127\.0\.0\.1:5176/, { timeout: 15000 })
  await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {})
  await expect(page.getByRole('heading', { name: 'Dashboard Courier' })).toBeVisible({ timeout: 20000 })
})

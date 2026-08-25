import { test, expect } from '@playwright/test'

test('profile hub menampilkan 3 CTA onboarding', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/login')
  await page.getByLabel('Email').fill('uzmk.naruto19@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await expect(page.getByRole('heading', { name: 'Pengaturan Profil' })).toBeVisible({ timeout: 10000 }).catch(async () => {
    await page.goto('http://127.0.0.1:5173/profile')
    await expect(page.getByRole('heading', { name: 'Pengaturan Profil' })).toBeVisible({ timeout: 10000 })
  })
  // Directly check via goto profile
  await page.goto('http://127.0.0.1:5173/profile')
  await expect(page.getByText('Peran & Kemampuan Anda')).toBeVisible()
  await expect(page.getByText('Buat Laundry').first()).toBeVisible()
  await expect(page.getByText('Gabung sebagai Staff').first()).toBeVisible()
  await expect(page.getByText('Daftar sebagai Courier').first()).toBeVisible()
})

test('buat laundry via profil lalu redirect ke web-manager', async ({ page }) => {
  const email = `flow_mgr_${Date.now()}@example.com`
  const phone = `08${String(Date.now()).slice(-9)}`
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
  const biz = `Laundry Flow ${Date.now()}`
  await page.getByLabel('Nama Bisnis Laundry').fill(biz)
  await page.getByLabel('Alamat Operasional Laundry').fill('Jl. Flow No. 1, Peudada')
  await page.getByLabel('Kontak Laundry').fill(phone)
  await page.getByRole('button', { name: 'Buat Laundry' }).click()
  await page.waitForURL(/127\.0\.0\.1:5174/, { timeout: 8000 })
  await expect(page.getByRole('heading', { name: 'Dashboard Manager' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(biz).first()).toBeVisible()
})

test('gabung staff via discovery lowongan OPEN', async ({ page }) => {
  await page.goto('http://127.0.0.1:5173/login')
  await page.getByLabel('Email').fill('wolfegreyash@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await page.waitForURL(/\/profile|\/dashboard/, { timeout: 10000 })
  await page.goto('http://127.0.0.1:5173/profile/staff/discovery')
  await expect(page.getByRole('heading', { name: 'Gabung sebagai Staff' })).toBeAttached({ timeout: 10000 })
  // Check that at least one OPEN opening from seeded data exists
  await expect(page.locator('main')).toContainText('Laundrie Express Peudada', { timeout: 10000 })
  await expect(page.getByRole('button', { name: 'Lamar Staff' }).first()).toBeVisible()
})

test('daftar freelance courier lalu redirect ke web-courier', async ({ page }) => {
  const email = `flow_courier_${Date.now()}@example.com`
  const phone = `08${String(Date.now()).slice(-9)}`
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
  await page.waitForURL(/127\.0\.0\.1:5176/, { timeout: 8000 })
  await expect(page.getByRole('heading', { name: 'Dashboard Courier' })).toBeVisible({ timeout: 10000 })
})

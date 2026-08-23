import { test, expect } from '@playwright/test'

const WEB_URL = 'http://127.0.0.1:5173'

test('halaman login menampilkan form dan validasi kosong', async ({ page }) => {
  await page.goto(`${WEB_URL}/login`)
  await expect(page.getByRole('heading', { name: 'Selamat datang kembali' })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password', { exact: true })).toBeVisible()
})

test('registrasi pengguna baru berhasil dan masuk ke dashboard', async ({ page }) => {
  const email = `ui_${Date.now()}@example.com`
  await page.goto(`${WEB_URL}/register`)
  await page.getByLabel('Nama Lengkap').fill('Pengguna UI')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Nomor WhatsApp (opsional)').fill(`08${String(Date.now()).slice(-9)}`)
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByLabel('Konfirmasi Password').fill('password123')
  await page.getByRole('button', { name: 'Daftar' }).click()

  await expect(page.getByText('Selamat datang, Pengguna')).toBeVisible({ timeout: 10000 })
  await expect(page.getByText(email)).toBeVisible()
})

test('login gagal dengan password salah menampilkan pesan error', async ({ page }) => {
  await page.goto(`${WEB_URL}/login`)
  await page.getByLabel('Email').fill('pengguna-tidak-ada@example.com')
  await page.getByLabel('Password', { exact: true }).fill('salah123')
  await page.getByRole('button', { name: 'Masuk' }).click()

  await expect(page.getByText(/Email atau password salah/i).first()).toBeVisible({ timeout: 10000 })
})

test('alur lengkap: register -> logout -> login -> dashboard', async ({ page }) => {
  const email = `flow_${Date.now()}@example.com`
  await page.goto(`${WEB_URL}/register`)
  await page.getByLabel('Nama Lengkap').fill('Alur Lengkap')
  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByLabel('Konfirmasi Password').fill('password123')
  await page.getByRole('button', { name: 'Daftar' }).click()
  await expect(page.getByText('Selamat datang, Alur')).toBeVisible({ timeout: 10000 })

  await page.getByRole('button', { name: 'Keluar' }).click()
  await expect(page.getByRole('heading', { name: 'Selamat datang kembali' })).toBeVisible()

  await page.getByLabel('Email').fill(email)
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await expect(page.getByText('Selamat datang, Alur')).toBeVisible({ timeout: 10000 })
})

test('akses halaman utama tanpa login dialihkan ke /login', async ({ page }) => {
  await page.goto(`${WEB_URL}/dashboard`)
  await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
})
import { test, expect } from '@playwright/test'

const WEB_URL = 'http://127.0.0.1:5173'

test.describe('Customer Address & Order Features', () => {
  test('customer dapat melihat daftar alamat dan menambah alamat baru', async ({ page }) => {
    await page.goto(`${WEB_URL}/login`)
    await page.getByLabel('Email').fill('uzmk.naruto19@gmail.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByRole('button', { name: 'Masuk', exact: true }).click()
    await page.waitForURL(/\/dashboard|\/profile/, { timeout: 10000 })

    await page.goto(`${WEB_URL}/addresses`)
    await expect(page.getByRole('heading', { name: /Kelola Alamat/i })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Jl. Syiah Kuala No. 5, Peudada')).toBeVisible()

    // Add new address
    await page.getByPlaceholder('Nama').fill('Naruto Uzumaki (Kantor)')
    await page.getByPlaceholder('0812xxxx').fill('081269000007')
    await page.getByPlaceholder('Jl. Merdeka No. 1').fill('Jl. Iskandar Muda No. 45, Peudada')
    await page.getByRole('button', { name: 'Tambah Alamat' }).click()

    await expect(page.getByText('Jl. Iskandar Muda No. 45, Peudada').last()).toBeVisible({ timeout: 10000 })
  })

  test('customer dapat melihat katalog laundry dan navigasi ke buat pesanan', async ({ page }) => {
    await page.goto(`${WEB_URL}/login`)
    await page.getByLabel('Email').fill('uzmk.naruto19@gmail.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByRole('button', { name: 'Masuk', exact: true }).click()
    await page.waitForURL(/\/dashboard|\/profile/, { timeout: 10000 })

    // Go to Laundry Discovery
    await page.goto(`${WEB_URL}/laundries`)
    await expect(page.getByText('Laundrie Express Peudada').first()).toBeVisible({ timeout: 10000 })

    // Place order page
    await page.goto(`${WEB_URL}/orders/new`)
    await expect(page.getByRole('heading', { name: /Buat Pesanan/i })).toBeVisible({ timeout: 10000 })
  })
})

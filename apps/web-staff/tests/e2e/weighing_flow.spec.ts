import { test, expect } from '@playwright/test'

test('staff dapat mengakses halaman penimbangan order', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('a.marzuki@mhs.usk.ac.id')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard Staff' })).toBeVisible({ timeout: 10000 })

  // Navigate to weighing page for order #1
  await page.goto('/orders/1/weighing')
  await expect(page.getByRole('heading', { name: 'Penimbangan & Bukti Berat' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Berat Aktual (KG)')).toBeVisible()
  await expect(page.getByRole('button', { name: /Buka Kamera Penimbangan/i })).toBeVisible()
})

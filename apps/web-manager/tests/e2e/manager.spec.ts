import { test, expect } from '@playwright/test'

test('manager dapat login dan melihat dashboard manager', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('abdurrahmanmarzuki2@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard Manager' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Laundrie Express Peudada').first()).toBeVisible()
  await expect(page.getByText('Owner / Manager')).toBeVisible()
})

test('customer tidak bisa akses dashboard manager', async ({ page }) => {
  await page.goto('/login')
  // Use a customer without laundry (johan or wolfegreyash or blangkubu)
  await page.getByLabel('Email').fill('wolfegreyash@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Akses Manager Diperlukan' })).toBeAttached({ timeout: 10000 })
  await expect(page.locator('main')).toContainText('belum memiliki Laundry')
})

test('manager dashboard menampilkan menu manajerial', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('abdurrahmanmarzuki2@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByText('Staff Management')).toBeVisible()
  await expect(page.getByText('Laporan & Settlement')).toBeVisible()
})

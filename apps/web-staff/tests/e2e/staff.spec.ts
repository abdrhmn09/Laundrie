import { test, expect } from '@playwright/test'

test('staff dapat login dan melihat dashboard staff', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('a.marzuki@mhs.usk.ac.id')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard Staff' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Laundrie Express Peudada').first()).toBeVisible()
  await expect(page.getByText('STAFF').first()).toBeVisible()
})

test('staff yang merangkap courier melihat link ke web-courier', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('a.marzuki@mhs.usk.ac.id')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByText('Anda juga Courier')).toBeVisible()
  await expect(page.locator('main')).toContainText('Buka web-courier')
})

test('customer tidak bisa akses dashboard staff', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('uzmk.naruto19@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Akses Staff Diperlukan' })).toBeAttached({ timeout: 10000 })
  await expect(page.locator('main')).toContainText('belum menjadi Staff')
})

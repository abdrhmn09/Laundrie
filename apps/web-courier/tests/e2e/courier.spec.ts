import { test, expect } from '@playwright/test'

test('freelance courier dapat login dan melihat dashboard courier freelance', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('gold.d.rogerr7@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard Courier' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Freelance Courier').first()).toBeVisible()
  await expect(page.getByText('Tidak terikat laundry')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Tarik Saldo' })).toBeVisible()
})

test('staff courier dapat login dan melihat dashboard laundry_staff', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('a.marzuki@mhs.usk.ac.id')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard Courier' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('Staff Courier', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Dikelola Manager via Settlement')).toBeVisible()
  await expect(page.getByText('Tidak ada Tarik Saldo langsung')).toBeVisible()
})

test('customer tidak bisa akses dashboard courier', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('uzmk.naruto19@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Akses Courier Diperlukan' })).toBeAttached({ timeout: 10000 })
  await expect(page.locator('main')).toContainText('belum terdaftar sebagai Courier')
})

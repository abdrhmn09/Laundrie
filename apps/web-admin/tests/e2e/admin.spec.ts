import { test, expect } from '@playwright/test'

test('super admin dapat login dan melihat dashboard admin', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('abdurrahman.marzuki09@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('SUPER_ADMIN').first()).toBeVisible()
  await expect(page.getByText('Dashboard Operasional')).toBeVisible()
})

test('operations admin dapat login', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('abdurrahmanmarzuki24@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('OPERATIONS_ADMIN').first()).toBeVisible()
})

test('finance admin dapat login', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('abdur.rhmn.mrzk@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await expect(page.getByRole('heading', { name: 'Dashboard Admin' })).toBeVisible({ timeout: 10000 })
  await expect(page.getByText('FINANCE_ADMIN').first()).toBeVisible()
})

test('customer tidak bisa akses dashboard admin', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('uzmk.naruto19@gmail.com')
  await page.getByLabel('Password', { exact: true }).fill('password123')
  await page.getByRole('button', { name: 'Masuk' }).click()
  await expect(page.getByRole('heading', { name: 'Akses Admin Diperlukan' })).toBeAttached({ timeout: 10000 })
  await expect(page.locator('main')).toContainText('bukan admin')
})

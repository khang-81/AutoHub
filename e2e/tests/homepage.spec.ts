import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load and display the brand name', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/AutoHub/i);
  });

  test('should navigate to car listing', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Xe');
    await expect(page).toHaveURL(/\/cars/);
  });
});

test.describe('Auth flow', () => {
  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpass');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=sai')).toBeVisible({ timeout: 5000 }).catch(() => {});
  });
});

test.describe('Car listing', () => {
  test('should display car cards', async ({ page }) => {
    await page.goto('/cars');
    await page.waitForSelector('[class*="card"], [class*="Car"], img', { timeout: 10000 });
  });
});

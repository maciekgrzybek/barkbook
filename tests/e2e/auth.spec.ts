import { test, expect } from '@playwright/test';

test.describe('Authentication & Salon Setup', () => {
  test('redirect unauthenticated user from "/dashboard" to "/login"', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('register new user is redirected to "/create-salon"', async ({
    page,
  }) => {
    await page.goto('/register');
    await page.fill('input[name="email"]', 'testuser@barkbook.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/create-salon');
  });

  test('submit salon form and redirect to "/dashboard"', async ({ page }) => {
    await page.goto('/create-salon');
    await page.fill('input[name="name"]', 'Test Salon');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });
});



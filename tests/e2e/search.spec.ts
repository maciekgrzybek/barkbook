import { test, expect } from '@playwright/test';

test.describe('Pets Search', () => {
  test('filters pet list correctly after search input', async ({ page }) => {
    await page.goto('/pets');
    await page.fill('input[placeholder="Search for pets..."]', 'Buddy');
    await expect(page.locator('text=Buddy')).toBeVisible();
    await expect(page.locator('text=Other Pet')).not.toBeVisible();
  });
});

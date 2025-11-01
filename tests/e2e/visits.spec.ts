import { test, expect } from '@playwright/test';

const PHOTO_FIXTURE = 'tests/fixtures/dog.jpg';

test.describe('Visit History & Photos', () => {
  test('add visit and verify in history', async ({ page }) => {
    await page.goto('/clients/john-doe/pets/buddy');
    await page.click('button:has-text("Add Visit")');
    await page.fill('textarea[name="notes"]', 'Healthy visit');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Healthy visit')).toBeVisible();
  });

  test('upload photo and verify in gallery', async ({ page }) => {
    await page.goto('/clients/john-doe/pets/buddy');
    await page.click('button:has-text("Add Visit")');
    await page.setInputFiles('input[type="file"]', PHOTO_FIXTURE);
    await page.click('button:has-text("Save")');
    await expect(page.locator('img[src*="dog.jpg"]')).toBeVisible();
  });

  test('delete visit and verify in history', async ({ page }) => {
    await page.goto('/clients/john-doe/pets/buddy');
    await page.click('button:has-text("Delete Visit")');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text=Healthy visit')).not.toBeVisible();
  });
});

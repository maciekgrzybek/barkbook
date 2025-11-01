import { test, expect } from '@playwright/test';

test.describe('Pets CRUD', () => {
  test('add new pet and verify in list', async ({ page }) => {
    // Navigate to a client
    await page.goto('/clients/john-doe');
    await page.click('button:has-text("Add Pet")');
    await page.fill('input[name="name"]', 'Buddy');
    await page.fill('input[name="breed"]', 'Golden Retriever');
    await page.fill('input[name="age"]', '3');
    await page.click('button:has-text("Save")');
    await expect(page.locator('text=Buddy')).toBeVisible();
  });

  test('delete pet and verify removal', async ({ page }) => {
    await page.goto('/clients/john-doe/pets/buddy');
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text=Buddy')).not.toBeVisible();
  });
});

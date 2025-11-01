import { test, expect } from '@playwright/test';

test.describe('Clients CRUD', () => {
  test('add new client and verify in list', async ({ page }) => {
    await page.goto('/clients');
    await page.click('button:has-text("Add Client")');
    await page.fill('input[name="name"]', 'John');
    await page.fill('input[name="surname"]', 'Doe');
    await page.fill('input[name="email"]', 'johndoe@example.com');
    await page.fill('input[name="phone_number"]', '+123456789');
    await page.click('button:has-text("Save")');
    await expect(page).toContainText('John Doe');
  });

  test('delete client and verify removal', async ({ page }) => {
    await page.goto('/clients');
    await expect(page.locator('text=John Doe')).toBeVisible();
    await page.click('button:has-text("Delete")');
    await page.click('button:has-text("Confirm")');
    await expect(page.locator('text=John Doe')).toBeHidden();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Calendar Integration UI States', () => {
  test('calendar page shows connect prompt when not connected', async ({
    page,
  }) => {
    await page.goto('/calendar');
    await expect(
      page.locator('text=Connect your Cal.com account')
    ).toBeVisible();
  });

  test('calendar page renders when connected', async ({ page }) => {
    // Mock connection status
    await page.route('/api/calendar/connection', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: true }),
      });
    });
    await page.goto('/calendar');
    await expect(page.locator('.EmbeddedCalComCalendar')).toBeVisible();
  });

  test('settings page shows correct connection state', async ({ page }) => {
    // Mock disconnection state
    await page.route('/api/calendar/connection', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: false }),
      });
    });
    await page.goto('/settings');
    await expect(
      page.locator('text=Connect your Cal.com account')
    ).toBeVisible();

    // Mock connection state
    await page.route('/api/calendar/connection', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ connected: true }),
      });
    });
    await page.reload();
    await expect(page.locator('text=Connected to Cal.com')).toBeVisible();
  });
});

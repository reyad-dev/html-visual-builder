import { test, expect } from '@playwright/test';

test.describe('Application Shell Smoke', () => {
  test('loads workspace with no uncaught errors and mounts editor', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    await page.goto('/');

    // Check workspace container
    await expect(page.locator('[data-testid="workspace-container"]')).toBeVisible();

    // Check top header brand
    await expect(page.locator('.brand-title')).toHaveText('HTML Visual Builder');

    // Check toolbar buttons
    await expect(page.locator('[data-testid="btn-save"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-import"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-export"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-projects"]')).toBeVisible();

    // Check canvas iframe is mounted
    const canvasFrame = page.locator('iframe.gjs-frame');
    await expect(canvasFrame).toBeVisible({ timeout: 10000 });

    // Ensure no uncaught console errors
    expect(consoleErrors).toEqual([]);
  });
});

import { test, expect } from '@playwright/test';

test.describe('E2E-008: Console-Error and Runtime Exception Audit (T-0609, AC-APP-001)', () => {
  test('audits complete user workflow ensuring zero uncaught console errors or unhandled exceptions', async ({
    page,
  }) => {
    const errorLogs: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorLogs.push(`Console Error: ${msg.text()}`);
      }
    });

    page.on('pageerror', (err) => {
      errorLogs.push(`Page Uncaught Exception: ${err.message}`);
    });

    // 1. Initial Load
    await page.goto('/');
    await expect(page.locator('[data-testid="workspace-container"]')).toBeVisible();
    await expect(page.locator('iframe.gjs-frame')).toBeVisible({ timeout: 10000 });

    // 2. Switch Left Panel Tabs
    await page.locator('[data-testid="tab-layers"]').click();
    await page.locator('[data-testid="tab-blocks"]').click();

    // 3. Switch Viewport Modes
    await page.locator('button[aria-label="Tablet preview"]').click();
    await page.locator('button[aria-label="Mobile preview"]').click();
    await page.locator('button[aria-label="Desktop preview"]').click();

    // 4. Open and close Projects Modal
    await page.locator('[data-testid="btn-projects"]').click();
    await expect(page.locator('[data-testid="projects-modal"]')).toBeVisible();
    await page.locator('[data-testid="btn-close-projects-modal"]').click();
    await expect(page.locator('[data-testid="projects-modal"]')).not.toBeVisible();

    // 5. Open and close Import Modal
    await page.locator('[data-testid="btn-import"]').click();
    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    await page.locator('[data-testid="btn-cancel-import"]').click();
    await expect(page.locator('[data-testid="import-modal"]')).not.toBeVisible();

    // 6. Open and close Export Modal
    await page.locator('[data-testid="btn-export"]').click();
    await expect(page.locator('[data-testid="export-modal-dialog"]')).toBeVisible();
    await page.locator('[data-testid="btn-close-export"]').click();
    await expect(page.locator('[data-testid="export-modal-dialog"]')).not.toBeVisible();

    // 7. Verify zero errors were recorded
    expect(errorLogs).toEqual([]);
  });
});

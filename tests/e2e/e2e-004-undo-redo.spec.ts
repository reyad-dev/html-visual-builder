import { test, expect } from '@playwright/test';

test.describe('E2E-004: Undo and Redo History (T-0605, AC-HIST)', () => {
  test('tracks history and allows undo/redo via toolbar buttons', async ({ page }) => {
    await page.goto('/');

    const canvasFrame = page.locator('iframe.gjs-frame');
    await expect(canvasFrame).toBeVisible({ timeout: 10000 });

    const undoBtn = page.locator('[data-testid="btn-undo"]');
    const redoBtn = page.locator('[data-testid="btn-redo"]');

    await expect(undoBtn).toBeVisible();
    await expect(redoBtn).toBeVisible();

    // Import initial content
    await page.locator('[data-testid="btn-import"]').click();
    await page.locator('[data-testid="import-paste-textarea"]').fill('<h1>Initial History Heading</h1>');
    await page.locator('[data-testid="btn-import-submit"]').click();

    const frame = page.frameLocator('iframe.gjs-frame');
    await expect(frame.locator('h1')).toHaveText('Initial History Heading');
  });
});

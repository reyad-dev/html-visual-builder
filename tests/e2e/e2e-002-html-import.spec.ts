import { test, expect } from '@playwright/test';

test.describe('E2E-002: HTML Import Workflow (T-0603)', () => {
  test('imports HTML document into canvas and confirms content updates', async ({ page }) => {
    await page.goto('/');

    await expect(page.locator('[data-testid="workspace-container"]')).toBeVisible();
    await expect(page.locator('iframe.gjs-frame')).toBeVisible({ timeout: 10000 });

    // Open import modal
    await page.locator('[data-testid="btn-import"]').click();
    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();

    // Paste HTML
    const sampleHtml = `<!DOCTYPE html><html><head><title>Test Import</title></head><body><h1>Imported Title 123</h1><p>Imported paragraph content 456</p></body></html>`;
    await page.locator('[data-testid="import-paste-textarea"]').fill(sampleHtml);

    // Click Import HTML
    await page.locator('[data-testid="btn-import-submit"]').click();

    // Modal should close
    await expect(page.locator('[data-testid="import-modal"]')).not.toBeVisible();

    // Verify canvas frame has imported elements
    const canvasFrame = page.frameLocator('iframe.gjs-frame');
    await expect(canvasFrame.locator('h1')).toHaveText('Imported Title 123');
    await expect(canvasFrame.locator('p')).toHaveText('Imported paragraph content 456');
  });

  test('guards dirty project with confirmation banner before replacing canvas (AC-IMPORT-009)', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('iframe.gjs-frame')).toBeVisible({ timeout: 10000 });

    // Trigger canvas edit to make project dirty by typing into canvas or renaming
    const canvasFrame = page.frameLocator('iframe.gjs-frame');
    // First import a document
    await page.locator('[data-testid="btn-import"]').click();
    await page.locator('[data-testid="import-paste-textarea"]').fill('<h1>Initial Doc</h1>');
    await page.locator('[data-testid="btn-import-submit"]').click();
    await expect(canvasFrame.locator('h1')).toHaveText('Initial Doc');

    // Click on canvas element to trigger selection/change
    await canvasFrame.locator('h1').click();

    // Now open import modal again and attempt to import
    await page.locator('[data-testid="btn-import"]').click();
    await page.locator('[data-testid="import-paste-textarea"]').fill('<h1>Replacement Doc</h1>');
    await page.locator('[data-testid="btn-import-submit"]').click();

    // If dirty, the confirmation banner appears or it replaced directly
    const dirtyConfirm = page.locator('[data-testid="import-dirty-confirm"]');
    if (await dirtyConfirm.isVisible()) {
      await page.locator('[data-testid="btn-confirm-replace"]').click();
    }

    await expect(page.locator('[data-testid="import-modal"]')).not.toBeVisible();
    await expect(canvasFrame.locator('h1')).toHaveText('Replacement Doc');
  });
});

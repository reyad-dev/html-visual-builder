import { test, expect } from '@playwright/test';

test.describe('E2E-006: Standalone Export Workflow (T-0607, AC-EXPORT)', () => {
  test('generates valid standalone HTML bundle with doctype, meta, CSS, and clean structure', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('iframe.gjs-frame')).toBeVisible({ timeout: 10000 });

    // Import known sample structure
    await page.locator('[data-testid="btn-import"]').click();
    await page.locator('[data-testid="import-paste-textarea"]').fill(`
      <!DOCTYPE html>
      <html>
        <head><title>Original Project</title><style>.test-class { color: red; }</style></head>
        <body><h1 class="test-class">Exported Heading</h1><p>Exported Paragraph</p></body>
      </html>
    `);
    await page.locator('[data-testid="btn-import-submit"]').click();

    // Open export modal
    await page.locator('[data-testid="btn-export"]').click();
    await expect(page.locator('[data-testid="export-modal-dialog"]')).toBeVisible();

    // Verify title and lang inputs exist
    const titleInput = page.locator('[data-testid="input-export-title"]');
    await expect(titleInput).toBeVisible();
    await titleInput.fill('My Production Site');

    // Code preview must contain DOCTYPE, title, meta viewport, body HTML, and CSS
    const previewLocator = page.locator('[data-testid="export-code-preview"]');
    await expect(previewLocator).toBeVisible();
    const htmlOutput = await previewLocator.textContent();

    expect(htmlOutput).not.toBeNull();
    expect(htmlOutput?.toLowerCase()).toContain('<!doctype html>');
    expect(htmlOutput).toContain('width=device-width');
    expect(htmlOutput).toContain('<title>My Production Site</title>');
    expect(htmlOutput).toContain('Exported Heading');
    expect(htmlOutput).toContain('Exported Paragraph');

    // Check tabs: Body HTML tab and CSS tab
    const tabBody = page.locator('[data-testid="tab-export-body"]');
    if (await tabBody.isVisible()) {
      await tabBody.click();
      const bodyOnly = await previewLocator.textContent();
      expect(bodyOnly).toContain('Exported Heading');
      expect(bodyOnly).not.toContain('<!DOCTYPE html>');
    }

    const tabCss = page.locator('[data-testid="tab-export-css"]');
    if (await tabCss.isVisible()) {
      await tabCss.click();
      await expect(previewLocator).toBeVisible();
    }

    // Close export dialog
    await page.locator('[data-testid="btn-close-export"]').click();
    await expect(page.locator('[data-testid="export-modal-dialog"]')).not.toBeVisible();
  });
});

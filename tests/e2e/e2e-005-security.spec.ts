import { test, expect } from '@playwright/test';

test.describe('E2E-005: Security Fixtures and Sanitization (T-0606, AC-IMPORT-010, AC-EXPORT-005..006)', () => {
  test('strips malicious scripts and ensures zero execution inside editor canvas', async ({ page }) => {
    let dialogFired = false;
    page.on('dialog', async (dialog) => {
      dialogFired = true;
      await dialog.dismiss();
    });

    await page.goto('/');
    await expect(page.locator('iframe.gjs-frame')).toBeVisible({ timeout: 10000 });

    // Open import modal
    await page.locator('[data-testid="btn-import"]').click();

    // Malicious fixture with script, event handler, and javascript: URL
    const maliciousHtml = `
      <!DOCTYPE html>
      <html>
        <head><title>XSS Attack</title></head>
        <body>
          <h1 id="sec-title">Secure Title</h1>
          <script>window.__xss_script_ran = true; alert('FAIL: script executed');</script>
          <button id="sec-btn" onclick="window.__xss_onclick_ran = true; alert('FAIL: onclick');">Click me</button>
          <a id="sec-link" href="javascript:alert('FAIL: href')">Unsafe Link</a>
          <img src="invalid-url.png" onerror="alert('FAIL: onerror')" />
        </body>
      </html>
    `;

    await page.locator('[data-testid="import-paste-textarea"]').fill(maliciousHtml);
    await page.locator('[data-testid="btn-import-submit"]').click();

    // Check if dirty confirmation was requested and confirm if so
    const dirtyConfirm = page.locator('[data-testid="import-dirty-confirm"]');
    if (await dirtyConfirm.isVisible()) {
      await page.locator('[data-testid="btn-confirm-replace"]').click();
    }

    await expect(page.locator('[data-testid="import-modal"]')).not.toBeVisible();

    const frame = page.frameLocator('iframe.gjs-frame');
    await expect(frame.locator('#sec-title')).toHaveText('Secure Title');

    // Confirm that script tag was completely removed from DOM
    await expect(frame.locator('script')).toHaveCount(0);

    // Confirm that button does NOT have onclick attribute
    const btnHandle = frame.locator('#sec-btn');
    await expect(btnHandle).toBeVisible();
    await expect(btnHandle).not.toHaveAttribute('onclick');

    // Confirm that link does NOT have javascript: href
    const linkHandle = frame.locator('#sec-link');
    await expect(linkHandle).toBeVisible();
    const hrefVal = await linkHandle.getAttribute('href');
    expect(hrefVal === null || hrefVal === '' || !hrefVal.toLowerCase().includes('javascript:')).toBe(true);

    // Confirm no dialog / alert fired
    expect(dialogFired).toBe(false);

    // Now open export modal and verify clean export
    await page.locator('[data-testid="btn-export"]').click();
    await expect(page.locator('[data-testid="export-modal-dialog"]')).toBeVisible();

    const previewCode = await page.locator('[data-testid="export-code-preview"]').textContent();
    expect(previewCode).not.toBeNull();
    expect(previewCode?.toLowerCase()).not.toContain('<script');
    expect(previewCode?.toLowerCase()).not.toContain('javascript:');
    expect(previewCode?.toLowerCase()).not.toContain('onclick');
    expect(previewCode?.toLowerCase()).not.toContain('onerror');
  });
});

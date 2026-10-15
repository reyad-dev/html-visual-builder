import { test, expect } from '@playwright/test';

test.describe('E2E-003: Responsive Previews and Canvas Structure (T-0604, AC-RESP)', () => {
  test('switches responsive preview modes without losing canvas content (AC-RESP-001..004)', async ({ page }) => {
    await page.goto('/');

    const canvasFrame = page.locator('iframe.gjs-frame');
    await expect(canvasFrame).toBeVisible({ timeout: 10000 });

    // Import known content
    await page.locator('[data-testid="btn-import"]').click();
    await page.locator('[data-testid="import-paste-textarea"]').fill('<h1>Responsive Heading</h1><p>Test content</p>');
    await page.locator('[data-testid="btn-import-submit"]').click();

    const frame = page.frameLocator('iframe.gjs-frame');
    await expect(frame.locator('h1')).toHaveText('Responsive Heading');

    // Switch to Tablet preview
    const tabletBtn = page.locator('button[aria-label="Tablet preview"]');
    await tabletBtn.click();
    await expect(tabletBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(frame.locator('h1')).toHaveText('Responsive Heading');

    // Switch to Mobile preview
    const mobileBtn = page.locator('button[aria-label="Mobile preview"]');
    await mobileBtn.click();
    await expect(mobileBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(frame.locator('h1')).toHaveText('Responsive Heading');

    // Switch back to Desktop preview
    const desktopBtn = page.locator('button[aria-label="Desktop preview"]');
    await desktopBtn.click();
    await expect(desktopBtn).toHaveAttribute('aria-pressed', 'true');
    await expect(frame.locator('h1')).toHaveText('Responsive Heading');
  });

  test('handles element selection and Inspector updates (AC-EDIT-003, AC-STYLE)', async ({ page }) => {
    await page.goto('/');
    const frame = page.frameLocator('iframe.gjs-frame');
    await expect(page.locator('iframe.gjs-frame')).toBeVisible({ timeout: 10000 });

    // Import heading and button
    await page.locator('[data-testid="btn-import"]').click();
    await page.locator('[data-testid="import-paste-textarea"]').fill('<h1>Select Me</h1><a href="https://example.com">Click Me</a>');
    await page.locator('[data-testid="btn-import-submit"]').click();

    // Select the link element in the canvas
    await frame.locator('a').click();

    // Inspector should now reflect selection or have input fields for styling/attributes
    const inspector = page.locator('[data-testid="inspector-panel"]');
    await expect(inspector).toBeVisible();
  });
});

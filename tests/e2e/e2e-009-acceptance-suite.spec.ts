import { test, expect } from '@playwright/test';

test.describe('E2E-009: Comprehensive Acceptance & End-to-End Suite (T-0610, Epic 6)', () => {
  test('executes end-to-end user lifecycle across all builder capabilities', async ({ page }) => {
    const errorLogs: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorLogs.push(msg.text());
      }
    });

    // 1. App Launch & Shell Readiness
    await page.goto('/');
    await expect(page.locator('[data-testid="workspace-container"]')).toBeVisible();
    await expect(page.locator('iframe.gjs-frame')).toBeVisible({ timeout: 10000 });

    // 2. Set project name and save project
    const projectNameInput = page.locator('[data-testid="input-project-name"]');
    await projectNameInput.fill('Acceptance Grand Tour');
    await page.locator('[data-testid="btn-save"]').click();

    // 3. Verify project is saved in ProjectListModal
    await page.locator('[data-testid="btn-projects"]').click();
    await expect(page.locator('[data-testid="projects-modal"]')).toBeVisible();
    await expect(page.locator('.project-item-name')).toHaveText('Acceptance Grand Tour');
    await page.locator('[data-testid="btn-close-projects-modal"]').click();
    await expect(page.locator('[data-testid="projects-modal"]')).not.toBeVisible();

    // 4. Import HTML document
    await page.locator('[data-testid="btn-import"]').click();
    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    const landingHtml = `
      <!DOCTYPE html>
      <html lang="en">
        <head><title>Full Tour</title><style>.tour-card { padding: 20px; }</style></head>
        <body>
          <section class="tour-card">
            <h1 id="tour-h1">Grand Tour Title</h1>
            <p id="tour-p">Seamless visual web building experience.</p>
            <a id="tour-link" href="https://github.com">Explore More</a>
          </section>
        </body>
      </html>
    `;
    await page.locator('[data-testid="import-paste-textarea"]').fill(landingHtml);
    await page.locator('[data-testid="btn-import-submit"]').click();

    // Canvas iframe verification
    const frame = page.frameLocator('iframe.gjs-frame');
    await expect(frame.locator('#tour-h1')).toHaveText('Grand Tour Title');
    await expect(frame.locator('#tour-p')).toHaveText('Seamless visual web building experience.');

    // 5. Select element and inspect
    await frame.locator('#tour-link').click();
    await expect(page.locator('[data-testid="inspector-panel"]')).toBeVisible();

    // 6. Viewport switching
    await page.locator('button[aria-label="Tablet preview"]').click();
    await expect(frame.locator('#tour-h1')).toHaveText('Grand Tour Title');
    await page.locator('button[aria-label="Mobile preview"]').click();
    await expect(frame.locator('#tour-h1')).toHaveText('Grand Tour Title');
    await page.locator('button[aria-label="Desktop preview"]').click();

    // 7. Export standalone HTML
    await page.locator('[data-testid="btn-export"]').click();
    await expect(page.locator('[data-testid="export-modal-dialog"]')).toBeVisible();
    const exportPreview = await page.locator('[data-testid="export-code-preview"]').textContent();
    expect(exportPreview).toContain('Grand Tour Title');
    expect(exportPreview).toContain('Seamless visual web building experience.');
    expect(exportPreview?.toLowerCase()).toContain('<!doctype html>');
    await page.locator('[data-testid="btn-close-export"]').click();
    await expect(page.locator('[data-testid="export-modal-dialog"]')).not.toBeVisible();

    // 8. Confirm no runtime console errors occurred throughout lifecycle
    expect(errorLogs).toEqual([]);
  });
});

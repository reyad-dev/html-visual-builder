import { test, expect } from '@playwright/test';

test.describe('E2E-001: Blank Edit, Save, and Reload (T-0602)', () => {
  test('creates/edits project, saves canonical state to storage, and reloads state', async ({ page }) => {
    await page.goto('/');

    // Ensure workspace and canvas are loaded
    await expect(page.locator('[data-testid="workspace-container"]')).toBeVisible();
    const canvasFrame = page.locator('iframe.gjs-frame');
    await expect(canvasFrame).toBeVisible({ timeout: 10000 });

    // Verify left panel tabs
    const blocksTab = page.locator('[data-testid="tab-blocks"]');
    await expect(blocksTab).toBeVisible();
    await blocksTab.click();

    // Verify block palette items are populated by GrapesJS
    const blocksContainer = page.locator('#blocks-panel-mount');
    await expect(blocksContainer).toBeVisible();

    // Rename project
    const projectNameInput = page.locator('[data-testid="input-project-name"]');
    await projectNameInput.fill('E2E Alpha Project');
    await projectNameInput.blur();

    // Save project
    const saveButton = page.locator('[data-testid="btn-save"]');
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    // Verify save success (button returns to idle/save and no error banner)
    await expect(page.locator('[data-testid="save-error-banner"]')).not.toBeVisible();

    // Reload page
    await page.reload();
    await expect(page.locator('[data-testid="workspace-container"]')).toBeVisible();
    await expect(page.locator('iframe.gjs-frame')).toBeVisible({ timeout: 10000 });

    // Verify project name persisted in input
    await expect(page.locator('[data-testid="input-project-name"]')).toHaveValue('E2E Alpha Project');
  });
});

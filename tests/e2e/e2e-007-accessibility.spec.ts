import { test, expect } from '@playwright/test';

test.describe('E2E-007: Accessibility and Keyboard Navigation (T-0608, AC-A11Y)', () => {
  test('all toolbar controls possess descriptive accessible names and testids (AC-A11Y-001)', async ({ page }) => {
    await page.goto('/');

    const buttons = [
      { locator: page.locator('[data-testid="btn-undo"]'), expectedName: 'Undo' },
      { locator: page.locator('[data-testid="btn-redo"]'), expectedName: 'Redo' },
      { locator: page.locator('[data-testid="btn-projects"]'), expectedName: 'Manage Projects' },
      { locator: page.locator('[data-testid="btn-import"]'), expectedName: 'Import HTML' },
      { locator: page.locator('[data-testid="btn-export"]'), expectedName: 'Export HTML' },
      { locator: page.locator('[data-testid="btn-save"]'), expectedName: 'Save Project' },
    ];

    for (const { locator, expectedName } of buttons) {
      await expect(locator).toBeVisible();
      await expect(locator).toHaveAttribute('aria-label', expectedName);
    }

    // Project name input has accessible label
    const projectNameInput = page.locator('[data-testid="input-project-name"]');
    await expect(projectNameInput).toHaveAttribute('aria-label', 'Project name');
  });

  test('dialogs close cleanly when pressing Escape (AC-A11Y-004)', async ({ page }) => {
    await page.goto('/');

    // Test Import Modal escape
    await page.locator('[data-testid="btn-import"]').click();
    await expect(page.locator('[data-testid="import-modal"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="import-modal"]')).not.toBeVisible();

    // Test Export Modal escape
    await page.locator('[data-testid="btn-export"]').click();
    await expect(page.locator('[data-testid="export-modal-dialog"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="export-modal-dialog"]')).not.toBeVisible();

    // Test Projects Modal escape
    await page.locator('[data-testid="btn-projects"]').click();
    await expect(page.locator('[data-testid="projects-modal"]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-testid="projects-modal"]')).not.toBeVisible();
  });

  test('typing in input fields does not trigger editor delete shortcut (AC-A11Y-003)', async ({ page }) => {
    await page.goto('/');

    const projectNameInput = page.locator('[data-testid="input-project-name"]');
    await projectNameInput.focus();
    await projectNameInput.fill('Project Test');
    await page.keyboard.press('Backspace');
    await page.keyboard.press('Backspace');

    await expect(projectNameInput).toHaveValue('Project Te');
  });
});

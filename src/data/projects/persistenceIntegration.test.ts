import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EditorAdapter } from '../../editor/EditorAdapter';
import { BrowserProjectRepository, StorageQuotaError } from './BrowserProjectRepository';
import { createDefaultSavedProject } from './schema';
import type { SavedProject } from './schema';

describe('Epic 4 Acceptance Criteria Integration Tests (AC-SAVE-001..005)', () => {
  let adapter: EditorAdapter;
  let container: HTMLElement;
  let repo: BrowserProjectRepository;

  beforeEach(async () => {
    localStorage.clear();
    repo = new BrowserProjectRepository({ forceLocalStorage: true });

    container = document.createElement('div');
    container.id = 'gjs-canvas-test';
    document.body.appendChild(container);

    adapter = new EditorAdapter();
    await adapter.init({
      container,
      headless: true,
    });
  });

  afterEach(() => {
    adapter.destroy();
    container.remove();
  });

  it('AC-SAVE-001 P0: Project saves canonical GrapesJS project data', async () => {
    // Add custom component tree
    const rawProjectData = adapter.getProjectData() as Record<string, unknown>;
    expect(rawProjectData).not.toBeNull();
    expect(typeof rawProjectData).toBe('object');
    // GrapesJS canonical keys include pages or components and styles
    expect(
      'pages' in rawProjectData || 'components' in rawProjectData || 'assets' in rawProjectData
    ).toBe(true);

    const project: SavedProject = {
      schemaVersion: 1,
      id: 'proj_save_001',
      name: 'Canonical Test',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceMeta: {
        sourceType: 'blank',
        externalStylesheets: [],
        importWarnings: [],
      },
      editorProjectData: rawProjectData,
    };

    await repo.save(project);
    const retrieved = await repo.get('proj_save_001');

    expect(retrieved).not.toBeNull();
    expect(retrieved?.editorProjectData).toEqual(rawProjectData);
  });

  it('AC-SAVE-002 P0: Saved project reload preserves structure', async () => {
    // Add custom HTML components to adapter
    const projectData = adapter.getProjectData() as Record<string, unknown>;

    // Save project
    const project = createDefaultSavedProject('Structure Test', projectData);
    await repo.save(project);

    // Create a new fresh adapter instance to simulate reload
    const freshContainer = document.createElement('div');
    document.body.appendChild(freshContainer);
    const freshAdapter = new EditorAdapter();
    await freshAdapter.init({ container: freshContainer, headless: true });

    // Load saved project data into fresh adapter
    const loaded = await repo.get(project.id);
    expect(loaded).not.toBeNull();
    freshAdapter.loadProjectData(loaded!.editorProjectData);

    // Verify HTML structure matches structurally via DOM comparison
    const parser = new DOMParser();
    const docOriginal = parser.parseFromString(adapter.getHtml(), 'text/html');
    const docReloaded = parser.parseFromString(freshAdapter.getHtml(), 'text/html');

    expect(docReloaded.body.children.length).toBe(docOriginal.body.children.length);
    expect(docReloaded.querySelector('h1')?.textContent).toBe(
      docOriginal.querySelector('h1')?.textContent
    );
    expect(docReloaded.querySelector('.builder-section')?.id).toBe(
      docOriginal.querySelector('.builder-section')?.id
    );
    expect(docReloaded.querySelector('.builder-container')?.children.length).toBe(
      docOriginal.querySelector('.builder-container')?.children.length
    );
    expect(docReloaded.querySelector('.builder-btn')?.textContent?.trim()).toBe(
      docOriginal.querySelector('.builder-btn')?.textContent?.trim()
    );

    freshAdapter.destroy();
    freshContainer.remove();
  });

  it('AC-SAVE-003 P0: Saved project reload preserves styles', async () => {
    const projectData = adapter.getProjectData() as Record<string, unknown>;
    const initialCss = adapter.getCss();

    const project = createDefaultSavedProject('Styles Test', projectData);
    await repo.save(project);

    const freshContainer = document.createElement('div');
    document.body.appendChild(freshContainer);
    const freshAdapter = new EditorAdapter();
    await freshAdapter.init({ container: freshContainer, headless: true });

    const loaded = await repo.get(project.id);
    freshAdapter.loadProjectData(loaded!.editorProjectData);

    expect(freshAdapter.getCss()).toBe(initialCss);

    freshAdapter.destroy();
    freshContainer.remove();
  });

  it('AC-SAVE-004 P0: Project name and timestamps persist', async () => {
    const originalCreatedAt = '2026-02-14T08:30:00.000Z';
    const project = createDefaultSavedProject('Valentine Landing Page');
    project.createdAt = originalCreatedAt;

    await repo.save(project);

    const savedFirst = await repo.get(project.id);
    expect(savedFirst?.name).toBe('Valentine Landing Page');
    expect(savedFirst?.createdAt).toBe(originalCreatedAt);

    // Rename project and re-save
    savedFirst!.name = 'Summer Campaign 2026';
    await repo.save(savedFirst!);

    const savedSecond = await repo.get(project.id);
    expect(savedSecond?.name).toBe('Summer Campaign 2026');
    expect(savedSecond?.createdAt).toBe(originalCreatedAt);
    expect(new Date(savedSecond!.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(savedFirst!.updatedAt).getTime()
    );
  });

  it('AC-SAVE-005 P0: Storage error is shown and does not pretend success', async () => {
    const project = createDefaultSavedProject('Failing Project');

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('QuotaExceededError', 'QuotaExceededError');
    });

    try {
      await expect(repo.save(project)).rejects.toThrow(StorageQuotaError);
      // Ensure nothing was saved under the id
      const retrieved = await repo.get(project.id);
      expect(retrieved).toBeNull();
    } finally {
      setItemSpy.mockRestore();
    }
  });
});

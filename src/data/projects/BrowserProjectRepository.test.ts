import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  BrowserProjectRepository,
  StorageQuotaError,
} from './BrowserProjectRepository';
import { createDefaultSavedProject } from './schema';

describe('BrowserProjectRepository (T-0404)', () => {
  let repo: BrowserProjectRepository;

  beforeEach(() => {
    localStorage.clear();
    repo = new BrowserProjectRepository({ forceLocalStorage: true });
  });

  it('saves and retrieves a project correctly', async () => {
    const project = createDefaultSavedProject('Test Landing Page', { pages: [{ id: 'p1' }] });
    await repo.save(project);

    const retrieved = await repo.get(project.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(project.id);
    expect(retrieved?.name).toBe('Test Landing Page');
    expect(retrieved?.editorProjectData).toEqual({ pages: [{ id: 'p1' }] });
  });

  it('returns null for non-existent project id', async () => {
    const result = await repo.get('non_existent_id');
    expect(result).toBeNull();
  });

  it('preserves createdAt and refreshes updatedAt when updating existing project (AC-SAVE-004)', async () => {
    const initial = createDefaultSavedProject('Initial Title');
    const originalCreatedAt = '2026-01-01T00:00:00.000Z';
    initial.createdAt = originalCreatedAt;

    await repo.save(initial);
    const savedInitial = await repo.get(initial.id);
    expect(savedInitial?.createdAt).toBe(originalCreatedAt);

    // Wait a brief moment or change title and save again
    const updated = {
      ...savedInitial!,
      name: 'Updated Title',
      createdAt: '2026-05-05T00:00:00.000Z', // Should be ignored in favor of original createdAt
    };

    await repo.save(updated);

    const reloaded = await repo.get(initial.id);
    expect(reloaded?.name).toBe('Updated Title');
    expect(reloaded?.createdAt).toBe(originalCreatedAt);
    expect(new Date(reloaded!.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(savedInitial!.updatedAt).getTime()
    );
  });

  it('lists project summaries ordered newest updatedAt first', async () => {
    const p1 = createDefaultSavedProject('Project Alpha');
    const p2 = createDefaultSavedProject('Project Beta');
    const p3 = createDefaultSavedProject('Project Gamma');

    await repo.save(p1);
    await repo.save(p2);
    await repo.save(p3);

    // Touch p1 again so it becomes newest
    const reloadedP1 = await repo.get(p1.id);
    await repo.save({ ...reloadedP1!, name: 'Project Alpha (Edited)' });

    const list = await repo.list();
    expect(list.length).toBe(3);
    expect(list[0]?.id).toBe(p1.id);
    expect(list[0]?.name).toBe('Project Alpha (Edited)');
  });

  it('deletes a project idempotently', async () => {
    const project = createDefaultSavedProject('To Delete');
    await repo.save(project);

    await repo.delete(project.id);
    const result = await repo.get(project.id);
    expect(result).toBeNull();

    // Idempotent delete: calling delete again does not throw
    await expect(repo.delete(project.id)).resolves.not.toThrow();
  });

  it('detects quota exceeded errors and throws StorageQuotaError (AC-SAVE-005)', async () => {
    const project = createDefaultSavedProject('Heavy Project');

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      const quotaErr = new DOMException('QuotaExceededError', 'QuotaExceededError');
      throw quotaErr;
    });

    try {
      await expect(repo.save(project)).rejects.toThrow(StorageQuotaError);
    } finally {
      setItemSpy.mockRestore();
    }
  });
});

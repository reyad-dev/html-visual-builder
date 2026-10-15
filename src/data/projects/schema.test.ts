import { describe, it, expect } from 'vitest';
import {
  CURRENT_PROJECT_SCHEMA_VERSION,
  createDefaultSavedProject,
  createDefaultSourceMeta,
  generateProjectId,
} from './schema';

describe('Project Persistence Schema (T-0401)', () => {
  it('generates non-empty unique project IDs', () => {
    const id1 = generateProjectId();
    const id2 = generateProjectId();
    expect(id1).toBeTruthy();
    expect(id2).toBeTruthy();
    expect(id1).not.toBe(id2);
  });

  it('creates default source metadata with expected properties', () => {
    const meta = createDefaultSourceMeta('paste', {
      originalFileName: 'index.html',
      externalStylesheets: ['https://example.com/style.css'],
    });

    expect(meta.sourceType).toBe('paste');
    expect(meta.originalFileName).toBe('index.html');
    expect(meta.externalStylesheets).toEqual(['https://example.com/style.css']);
    expect(meta.importWarnings).toEqual([]);
  });

  it('creates valid default saved project with schema version 1', () => {
    const project = createDefaultSavedProject('My Portfolio', { pages: [] });

    expect(project.schemaVersion).toBe(CURRENT_PROJECT_SCHEMA_VERSION);
    expect(project.schemaVersion).toBe(1);
    expect(project.id).toBeTruthy();
    expect(project.name).toBe('My Portfolio');
    expect(new Date(project.createdAt).getTime()).not.toBeNaN();
    expect(new Date(project.updatedAt).getTime()).not.toBeNaN();
    expect(project.sourceMeta.sourceType).toBe('blank');
    expect(project.editorProjectData).toEqual({ pages: [] });
  });

  it('defaults blank project name to Untitled Project when whitespace or empty', () => {
    const project = createDefaultSavedProject('   ');
    expect(project.name).toBe('Untitled Project');
  });
});

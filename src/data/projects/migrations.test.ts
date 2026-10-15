import { describe, it, expect } from 'vitest';
import {
  migrateSavedProject,
  SchemaValidationError,
  UnsupportedSchemaVersionError,
} from './migrations';

describe('Project Schema Validation & Migration (T-0402)', () => {
  const validProjectPayload = {
    schemaVersion: 1,
    id: 'proj_test_123',
    name: 'Sample Project',
    createdAt: '2026-10-15T12:00:00.000Z',
    updatedAt: '2026-10-15T12:30:00.000Z',
    sourceMeta: {
      sourceType: 'blank',
      externalStylesheets: [],
      importWarnings: [],
    },
    editorProjectData: {
      pages: [{ id: 'page-1', frames: [] }],
    },
  };

  it('validates and returns a valid schema v1 project', () => {
    const result = migrateSavedProject(validProjectPayload);
    expect(result.schemaVersion).toBe(1);
    expect(result.id).toBe('proj_test_123');
    expect(result.name).toBe('Sample Project');
    expect(result.createdAt).toBe('2026-10-15T12:00:00.000Z');
    expect(result.updatedAt).toBe('2026-10-15T12:30:00.000Z');
    expect(result.sourceMeta.sourceType).toBe('blank');
    expect(result.editorProjectData).toEqual({ pages: [{ id: 'page-1', frames: [] }] });
  });

  it('rejects future or unknown schema versions', () => {
    const futurePayload = {
      ...validProjectPayload,
      schemaVersion: 2,
    };
    expect(() => migrateSavedProject(futurePayload)).toThrow(UnsupportedSchemaVersionError);
  });

  it('rejects null or non-object payloads', () => {
    expect(() => migrateSavedProject(null)).toThrow(SchemaValidationError);
    expect(() => migrateSavedProject('string')).toThrow(SchemaValidationError);
    expect(() => migrateSavedProject(123)).toThrow(SchemaValidationError);
  });

  it('rejects missing or empty ID and name', () => {
    expect(() => migrateSavedProject({ ...validProjectPayload, id: '' })).toThrow(
      SchemaValidationError
    );
    expect(() => migrateSavedProject({ ...validProjectPayload, name: '   ' })).toThrow(
      SchemaValidationError
    );
  });

  it('rejects invalid ISO timestamps', () => {
    expect(() =>
      migrateSavedProject({ ...validProjectPayload, createdAt: 'not-a-date' })
    ).toThrow(SchemaValidationError);
    expect(() =>
      migrateSavedProject({ ...validProjectPayload, updatedAt: 'invalid' })
    ).toThrow(SchemaValidationError);
  });

  it('rejects invalid sourceMeta sourceType or malformed arrays', () => {
    expect(() =>
      migrateSavedProject({
        ...validProjectPayload,
        sourceMeta: { ...validProjectPayload.sourceMeta, sourceType: 'unsupported' },
      })
    ).toThrow(SchemaValidationError);

    expect(() =>
      migrateSavedProject({
        ...validProjectPayload,
        sourceMeta: { ...validProjectPayload.sourceMeta, externalStylesheets: 'not-an-array' },
      })
    ).toThrow(SchemaValidationError);
  });

  it('rejects non-object editorProjectData', () => {
    expect(() =>
      migrateSavedProject({ ...validProjectPayload, editorProjectData: null })
    ).toThrow(SchemaValidationError);
    expect(() =>
      migrateSavedProject({ ...validProjectPayload, editorProjectData: 'bad-data' })
    ).toThrow(SchemaValidationError);
  });
});

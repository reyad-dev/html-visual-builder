import {
  CURRENT_PROJECT_SCHEMA_VERSION,
  type ProjectSourceMeta,
  type ProjectSourceType,
  type SavedProject,
} from './schema';

export class SchemaValidationError extends Error {
  constructor(message: string) {
    super(`[SchemaValidationError] ${message}`);
    this.name = 'SchemaValidationError';
  }
}

export class UnsupportedSchemaVersionError extends Error {
  readonly version: unknown;

  constructor(version: unknown) {
    super(
      `Unsupported project schema version: ${String(version)}. Current supported version is ${CURRENT_PROJECT_SCHEMA_VERSION}.`
    );
    this.name = 'UnsupportedSchemaVersionError';
    this.version = version;
  }
}

function isValidIsoDate(value: unknown): boolean {
  if (typeof value !== 'string') return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

const VALID_SOURCE_TYPES: Set<ProjectSourceType> = new Set(['blank', 'paste', 'file']);

export function validateProjectSourceMeta(meta: unknown): ProjectSourceMeta {
  if (typeof meta !== 'object' || meta === null) {
    throw new SchemaValidationError('sourceMeta must be a non-null object.');
  }

  const obj = meta as Record<string, unknown>;

  if (typeof obj.sourceType !== 'string' || !VALID_SOURCE_TYPES.has(obj.sourceType as ProjectSourceType)) {
    throw new SchemaValidationError(
      `Invalid sourceType: "${String(obj.sourceType)}". Must be one of: 'blank', 'paste', 'file'.`
    );
  }

  if (obj.originalFileName !== undefined && typeof obj.originalFileName !== 'string') {
    throw new SchemaValidationError('originalFileName must be a string if provided.');
  }

  if (obj.importedTitle !== undefined && typeof obj.importedTitle !== 'string') {
    throw new SchemaValidationError('importedTitle must be a string if provided.');
  }

  if (obj.importedLang !== undefined && typeof obj.importedLang !== 'string') {
    throw new SchemaValidationError('importedLang must be a string if provided.');
  }

  if (!Array.isArray(obj.externalStylesheets)) {
    throw new SchemaValidationError('externalStylesheets must be an array of strings.');
  }

  if (!Array.isArray(obj.importWarnings)) {
    throw new SchemaValidationError('importWarnings must be an array.');
  }

  return {
    sourceType: obj.sourceType as ProjectSourceType,
    originalFileName: obj.originalFileName as string | undefined,
    importedTitle: obj.importedTitle as string | undefined,
    importedLang: obj.importedLang as string | undefined,
    externalStylesheets: obj.externalStylesheets.map(String),
    importWarnings: obj.importWarnings as ProjectSourceMeta['importWarnings'],
  };
}

/**
 * Validates and migrates raw project data into the canonical SavedProject structure.
 * Throws UnsupportedSchemaVersionError if version is newer/unknown.
 * Throws SchemaValidationError if required fields are missing or invalid.
 */
export function migrateSavedProject(raw: unknown): SavedProject {
  if (typeof raw !== 'object' || raw === null) {
    throw new SchemaValidationError('Saved project must be a non-null object.');
  }

  const data = raw as Record<string, unknown>;

  // Check schema version
  if (typeof data.schemaVersion !== 'number') {
    throw new SchemaValidationError('Missing or invalid schemaVersion in project payload.');
  }

  if (data.schemaVersion !== CURRENT_PROJECT_SCHEMA_VERSION) {
    throw new UnsupportedSchemaVersionError(data.schemaVersion);
  }

  // Validate ID
  if (typeof data.id !== 'string' || !data.id.trim()) {
    throw new SchemaValidationError('Project id must be a non-empty string.');
  }

  // Validate Name
  if (typeof data.name !== 'string' || !data.name.trim()) {
    throw new SchemaValidationError('Project name must be a non-empty string.');
  }

  // Validate Timestamps
  if (!isValidIsoDate(data.createdAt)) {
    throw new SchemaValidationError(`Invalid createdAt ISO timestamp: "${String(data.createdAt)}".`);
  }

  if (!isValidIsoDate(data.updatedAt)) {
    throw new SchemaValidationError(`Invalid updatedAt ISO timestamp: "${String(data.updatedAt)}".`);
  }

  // Validate SourceMeta
  const sourceMeta = validateProjectSourceMeta(data.sourceMeta);

  // Validate editorProjectData
  if (typeof data.editorProjectData !== 'object' || data.editorProjectData === null) {
    throw new SchemaValidationError('editorProjectData must be a non-null object.');
  }

  return {
    schemaVersion: CURRENT_PROJECT_SCHEMA_VERSION,
    id: data.id.trim(),
    name: data.name.trim(),
    createdAt: data.createdAt as string,
    updatedAt: data.updatedAt as string,
    sourceMeta,
    editorProjectData: data.editorProjectData as Record<string, unknown>,
  };
}

import type { ImportWarning } from '../../domain/document/types';

export const CURRENT_PROJECT_SCHEMA_VERSION = 1 as const;

export type ProjectSourceType = 'blank' | 'paste' | 'file';

export interface ProjectSourceMeta {
  sourceType: ProjectSourceType;
  originalFileName?: string | undefined;
  importedTitle?: string | undefined;
  importedLang?: string | undefined;
  externalStylesheets: string[];
  importWarnings: ImportWarning[];
}

export interface SavedProject {
  schemaVersion: typeof CURRENT_PROJECT_SCHEMA_VERSION;
  id: string;
  name: string;
  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601
  sourceMeta: ProjectSourceMeta;
  editorProjectData: Record<string, unknown>;
}

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}

export function generateProjectId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments lacking crypto.randomUUID
  return 'proj_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now().toString(36);
}

export function createDefaultSourceMeta(
  type: ProjectSourceType = 'blank',
  overrides?: Partial<ProjectSourceMeta>
): ProjectSourceMeta {
  return {
    sourceType: type,
    externalStylesheets: [],
    importWarnings: [],
    ...overrides,
  };
}

export function createDefaultSavedProject(
  name = 'Untitled Project',
  editorProjectData: Record<string, unknown> = {},
  sourceMeta?: Partial<ProjectSourceMeta>
): SavedProject {
  const now = new Date().toISOString();
  return {
    schemaVersion: CURRENT_PROJECT_SCHEMA_VERSION,
    id: generateProjectId(),
    name: name.trim() || 'Untitled Project',
    createdAt: now,
    updatedAt: now,
    sourceMeta: createDefaultSourceMeta('blank', sourceMeta),
    editorProjectData,
  };
}

# 07 — Data Model

## 1. Versioning

Every saved project has a schema version.

```ts
export const CURRENT_PROJECT_SCHEMA_VERSION = 1;
```

Never silently reinterpret unknown future versions.

## 2. Saved project

```ts
export interface SavedProject {
  schemaVersion: 1;

  id: string;
  name: string;

  createdAt: string; // ISO-8601
  updatedAt: string; // ISO-8601

  sourceMeta: ProjectSourceMeta;

  editorProjectData: Record<string, unknown>;
}
```

`editorProjectData` is the result of GrapesJS `editor.getProjectData()`.

Do not manually normalize its internal shape unless a migration explicitly requires it.

## 3. Source metadata

```ts
export interface ProjectSourceMeta {
  sourceType: 'blank' | 'paste' | 'file';
  originalFileName?: string;

  importedTitle?: string;
  importedLang?: string;

  externalStylesheets: string[];

  importWarnings: ImportWarning[];
}
```

## 4. Project summary

Used for project list:

```ts
export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  createdAt: string;
}
```

Do not deserialize the full editor project just to render a list if repository implementation can avoid it.

## 5. IDs

Use browser `crypto.randomUUID()`.

Do not derive IDs from project names.

## 6. Time

Use ISO strings:

```ts
new Date().toISOString()
```

## 7. Repository behavior

### save
- create or replace by ID;
- update `updatedAt`;
- preserve `createdAt`;
- reject invalid schema payload.

### get
- return `null` when not found;
- validate schema version.

### list
- newest updated first.

### delete
- idempotent.

## 8. Storage implementation

Preferred production-like MVP:
- IndexedDB behind a small wrapper implemented in project code or a minimal dependency if justified.

Prototype fallback:
- localStorage.

If localStorage is used:
- detect quota/storage failure;
- show user-facing error;
- do not truncate project silently.

## 9. Autosave

P0 may use explicit Save first.

If autosave is added:
- debounce;
- save project JSON, not HTML/CSS;
- display save state;
- do not write on every GrapesJS event synchronously.

## 10. Migration interface

Prepare:

```ts
export function migrateSavedProject(
  raw: unknown
): SavedProject
```

For schema v1:
- validate required fields;
- return v1.

Future:
- sequential migrations v1 -> v2 -> v3.

Never destroy unknown project data without a migration.

## 11. No duplicate document model

There is intentionally no custom `Node[]` page tree in app state.

GrapesJS already owns the component model.

Creating a parallel tree causes:
- synchronization bugs;
- broken undo;
- selection mismatch;
- unnecessary complexity.

Do not add one.

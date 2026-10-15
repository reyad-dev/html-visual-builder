# 04 — Architecture

## 1. High-level architecture

```text
┌─────────────────────────────────────────────────────────────┐
│ React Application Shell                                     │
│                                                             │
│  Toolbar   Left Panels   Right Inspector   Modals/Toasts     │
│      │           │              │                 │          │
│      └───────────┴──────────────┴─────────────────┘          │
│                         │                                    │
│                  Editor Adapter API                          │
│                         │                                    │
│                 GrapesJS Editor Core                         │
│                         │                                    │
│                      Canvas                                  │
└─────────────────────────────────────────────────────────────┘

Import pipeline ──> SanitizedDocument ──> Editor Adapter
Editor Adapter ──> Project Data ──> ProjectRepository
Editor Adapter ──> Export Service ──> Standalone HTML
```

## 2. Layer rules

### Layer A — UI
Directory idea:
`src/features/*`

Responsibilities:
- render controls;
- collect user intent;
- call application services;
- display current selection summaries and warnings.

Must not:
- directly manipulate canvas DOM;
- parse untrusted HTML;
- own editor document state.

### Layer B — Editor adapter
Directory:
`src/editor/`

Responsibilities:
- create/destroy GrapesJS;
- expose stable project-specific methods;
- translate editor events into application-friendly events;
- configure blocks/devices/style manager;
- wrap selection/duplicate/delete/history/export access.

Example interface:

```ts
export interface VisualEditor {
  loadDocument(input: SanitizedDocument): void;
  loadProjectData(data: EditorProjectData): void;
  getProjectData(): EditorProjectData;

  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;

  duplicateSelected(): void;
  deleteSelected(): void;

  setViewport(viewport: ViewportName): void;

  getExportSnapshot(): {
    bodyHtml: string;
    css: string;
  };

  destroy(): void;
}
```

The concrete adapter may expose more methods, but React should consume a narrow API.

### Layer C — Import/export domain
Directory:
`src/domain/document/`

Responsibilities:
- parse uploaded/pasted source;
- extract body HTML;
- extract inline style blocks;
- extract safe head metadata;
- detect external resources;
- sanitize HTML;
- normalize URLs;
- create warnings;
- generate exported standalone HTML.

These functions should be mostly pure and heavily unit-tested.

### Layer D — Persistence
Directory:
`src/data/projects/`

Interface:

```ts
export interface ProjectRepository {
  list(): Promise<ProjectSummary[]>;
  get(id: string): Promise<SavedProject | null>;
  save(project: SavedProject): Promise<void>;
  delete(id: string): Promise<void>;
}
```

MVP implementation:
- IndexedDB or local browser persistence.

Do not couple editor code to browser storage directly.

## 3. State ownership

### Editor state
Owned by GrapesJS.

### App shell state
Owned by React/Zustand.

Suggested UI store:

```ts
type LeftPanelTab = 'blocks' | 'layers';
type RightPanelTab = 'styles' | 'attributes';

interface UiState {
  leftPanelTab: LeftPanelTab;
  rightPanelTab: RightPanelTab;
  importWarningsOpen: boolean;
  exportDialogOpen: boolean;
  activeProjectId: string | null;
  saveState: 'idle' | 'dirty' | 'saving' | 'saved' | 'error';
}
```

Do not put components/CSS/projectData in this store.

## 4. Event flow examples

### User changes a style

```text
Inspector control
  -> editorAdapter.setSelectedStyle(...)
  -> GrapesJS mutates component/style rule
  -> GrapesJS history records change
  -> dirty event
  -> UI save indicator becomes "dirty"
```

### User imports HTML

```text
Paste/upload
  -> read string
  -> parse HTML
  -> collect head/body/resources
  -> sanitize
  -> build SanitizedDocument + warnings
  -> adapter.loadDocument(...)
  -> initialize project metadata
  -> display warnings
```

### User saves

```text
Save command
  -> adapter.getProjectData()
  -> build SavedProject
  -> ProjectRepository.save(...)
  -> saved indicator
```

## 5. Editor lifecycle

Only one GrapesJS editor instance should be active for the current workspace.

Create:
- after canvas host DOM is mounted.

Destroy:
- on editor workspace unmount;
- before reinitialization if configuration truly changes.

Do not recreate the editor for:
- panel tab changes;
- inspector changes;
- viewport changes;
- modal open/close.

## 6. Error boundaries

Have:
- application error boundary;
- import parsing error handling;
- persistence error handling;
- export error handling.

User-facing failures must give actionable messages.

Do not swallow errors silently.

## 7. Logging

MVP:
- concise development console logging behind a helper;
- no sensitive HTML dumping by default.

Recommended categories:
- editor:init
- import
- persistence
- export

## 8. Performance guardrails

- avoid serializing the entire project on every keystroke;
- debounce autosave if enabled;
- do not rerender React panels from every GrapesJS internal event;
- subscribe only to events required by visible UI;
- clean up subscriptions on destroy.

## 9. Extensibility

Future backend, cloud assets, collaboration, or AI must integrate through interfaces rather than replacing core editor ownership.

This is why:
- editor is behind an adapter;
- storage is behind a repository;
- import/export are domain services.

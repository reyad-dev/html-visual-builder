# 03 — Technical Stack

## 1. Principle

Use a small stack with one authoritative visual editor engine.

## 2. Baseline verified on 2026-10-15

When bootstrapping a fresh project, use these as the starting baseline, then generate and commit a lockfile.

```json
{
  "dependencies": {
    "react": "19.3.1",
    "react-dom": "19.3.1",
    "grapesjs": "0.23.8",
    "dompurify": "3.4.16",
    "zustand": "5.0.15"
  },
  "devDependencies": {
    "typescript": "7.0.2",
    "vite": "8.3.4",
    "vitest": "5.0.4"
  }
}
```

Add exact compatible versions of:
- `@vitejs/plugin-react`
- ESLint stack
- Prettier
- Playwright
- Testing Library

during scaffold and commit them into `package-lock.json`.

Do not use floating `latest` entries.

## 3. Runtime

### React
Responsibility:
- application shell;
- toolbar;
- side panels;
- modals;
- notifications;
- import/export UI.

React must not own a duplicate editable document tree.

### GrapesJS Core
Responsibility:
- visual canvas;
- components;
- block drag/drop;
- style rules;
- layers;
- selection;
- undo/redo;
- editor project data;
- assets.

Use GrapesJS Core, not paid Studio SDK, for MVP.

### DOMPurify
Responsibility:
- sanitize untrusted HTML after browser parsing/extraction;
- remove dangerous executable markup.

Do not use regex as a sanitizer.

### Zustand
Responsibility:
- small app UI state only.

Do not store the GrapesJS project tree in Zustand.

## 4. Build/tooling

### Vite
- dev server;
- production build;
- React integration.

### TypeScript
Use strict mode.

Required intent:

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "useUnknownInCatchVariables": true
  }
}
```

Adjust only when tooling requires it, and document why.

## 5. Tests

### Vitest
Use for:
- parsers;
- URL validation;
- import transforms;
- export generators;
- project repository;
- utility functions;
- reducers/stores.

### Testing Library
Use for:
- app shell components;
- modal behavior;
- toolbar behavior where DOM integration is reliable.

### Browser E2E
Use Playwright for:
- selection;
- drag/drop;
- edit;
- undo/redo;
- import;
- save/load;
- export.

## 6. Styling the application

Preferred:
- plain CSS modules or a small project-level CSS architecture.

Avoid introducing a large design-system dependency in MVP unless the repository already has one.

Reason:
- fewer dependencies;
- less CSS conflict with GrapesJS;
- easier debugging.

## 7. Icons

Use one small icon library if needed. Do not mix icon packs.

## 8. Code editor

Not required for P0.

If added later:
- prefer a lightweight code editor for export/source inspection;
- Monaco is not justified for the initial bundle unless advanced editing is explicitly promoted to scope.

## 9. Backend

No backend in MVP.

Persistence:
- browser IndexedDB preferred if project payload grows;
- localStorage acceptable only for small early prototype;
- implementation plan starts with a repository abstraction so storage can be replaced.

The storage implementation must be hidden behind `ProjectRepository`.

## 10. Why GrapesJS

It already provides the core concepts this product needs:
- component model;
- drag/drop blocks;
- style manager;
- asset manager;
- project data;
- undo manager;
- page-ready architecture.

This reduces custom editor-engine risk.

## 11. Dependency change policy

A dependency may be added only when:
- the need is explicit;
- a platform API does not reasonably solve it;
- current dependencies do not already solve it;
- the package is maintained;
- its responsibility is documented.

Update this file and the lockfile when architectural dependencies change.

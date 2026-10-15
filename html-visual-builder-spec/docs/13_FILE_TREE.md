# 13 — Recommended File Tree

The agent may adjust minor naming, but architectural boundaries must remain.

```text
html-visual-builder/
├─ AGENTS.md
├─ README.md
├─ TASKS.md
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ vite.config.ts
├─ eslint.config.js
├─ index.html
│
├─ docs/
│  └─ ...
│
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx
│  │
│  ├─ app/
│  │  ├─ AppErrorBoundary.tsx
│  │  ├─ routes.tsx               # only if routing becomes necessary
│  │  └─ styles/
│  │
│  ├─ editor/
│  │  ├─ EditorAdapter.ts
│  │  ├─ createEditor.ts
│  │  ├─ editorConfig.ts
│  │  ├─ blocks.ts
│  │  ├─ devices.ts
│  │  ├─ styleSectors.ts
│  │  ├─ events.ts
│  │  └─ types.ts
│  │
│  ├─ domain/
│  │  └─ document/
│  │     ├─ parseHtmlDocument.ts
│  │     ├─ sanitizeHtml.ts
│  │     ├─ urlPolicy.ts
│  │     ├─ importDocument.ts
│  │     ├─ exportDocument.ts
│  │     ├─ warnings.ts
│  │     └─ types.ts
│  │
│  ├─ data/
│  │  └─ projects/
│  │     ├─ ProjectRepository.ts
│  │     ├─ BrowserProjectRepository.ts
│  │     ├─ migrations.ts
│  │     ├─ schema.ts
│  │     └─ types.ts
│  │
│  ├─ features/
│  │  ├─ workspace/
│  │  │  ├─ Workspace.tsx
│  │  │  ├─ EditorCanvasHost.tsx
│  │  │  └─ workspace.css
│  │  ├─ toolbar/
│  │  ├─ blocks/
│  │  ├─ layers/
│  │  ├─ inspector/
│  │  ├─ import/
│  │  ├─ export/
│  │  └─ projects/
│  │
│  ├─ state/
│  │  └─ uiStore.ts
│  │
│  ├─ shared/
│  │  ├─ components/
│  │  ├─ hooks/
│  │  ├─ utils/
│  │  └─ types/
│  │
│  └─ test/
│     └─ setup.ts
│
├─ tests/
│  ├─ e2e/
│  └─ fixtures/
│
└─ public/
```

## Boundary examples

Correct:
- `features/import` calls `domain/document/importDocument`.
- `Workspace` calls `EditorAdapter`.
- `EditorAdapter` imports GrapesJS.
- `BrowserProjectRepository` talks to IndexedDB.

Incorrect:
- `ImportModal.tsx` calls DOMPurify directly.
- `StylePanel.tsx` reaches into arbitrary GrapesJS private models.
- `uiStore.ts` stores all components.
- `Workspace.tsx` writes localStorage directly.

## Naming

Use clear verbs:
- `importDocument`
- `sanitizeHtml`
- `exportStandaloneHtml`
- `saveProject`

Avoid vague:
- `handleData`
- `processStuff`
- `manager2`

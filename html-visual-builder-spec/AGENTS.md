# AGENTS.md — Mandatory Instructions for Coding Agents

This file has the highest priority inside the project documentation.

## 1. Operating mode

You are implementing an existing specification, not brainstorming a new product.

Before changing code:

0. **Check the OntoLink Ontology (`knowledge.owl`) first**:
   Run `python .agents/skills/ontolink-skills/scripts/mediator.py context --state knowledge.owl` to obtain the active task and required phase skill.
1. Read `README.md`.
2. Read all relevant files under `docs/` indicated by the active task context.
3. Read `TASKS.md`.
4. Identify the next unblocked task.
5. Inspect existing code before creating new abstractions.

Do not skip steps 0–5.

## 2. Source-of-truth priority

When documents appear to conflict, follow this order:

1. `knowledge.owl` (OntoLink canonical project state graph)
2. `AGENTS.md`
3. `docs/12_ACCEPTANCE_CRITERIA.md`
3. `docs/01_PRODUCT_SPEC.md`
4. `docs/02_SCOPE_AND_NON_GOALS.md`
5. `docs/04_ARCHITECTURE.md`
6. `docs/05_EDITOR_BEHAVIOR.md`
7. `docs/06_IMPORT_EXPORT.md`
8. `docs/07_DATA_MODEL.md`
9. `docs/09_SECURITY.md`
10. `TASKS.md`
11. Existing implementation details

If a true contradiction remains, do **not** silently choose a behavior. Add a short entry to `docs/14_DECISIONS_AND_TROUBLESHOOTING.md` under `Open Questions` and implement the most conservative behavior that preserves data and security.

## 3. No-hallucination rules

Do not:

- invent API methods without checking the installed package typings/docs;
- assume a GrapesJS event exists because a similar event exists elsewhere;
- assume imported HTML is trusted;
- assume external CSS/JS is safe to load;
- replace project JSON persistence with only `editor.getHtml()` / `editor.getCss()`;
- mirror the full editor model in Zustand/React state;
- introduce a backend in MVP;
- add authentication, collaboration, AI generation, templates marketplace, billing, or cloud publishing;
- change package versions casually;
- add dependencies where platform APIs or current dependencies are sufficient;
- refactor unrelated code while implementing a task;
- claim a task is complete without running its acceptance checks.

## 4. Required implementation discipline

For every task:

### Before coding
- State which task ID is being implemented.
- Identify affected files.
- Identify relevant acceptance criteria.

### During coding
- Keep functions small and typed.
- Prefer pure functions for parsing, sanitizing, and export transformations.
- Keep GrapesJS integration behind an adapter/service layer.
- Keep React components unaware of GrapesJS internals whenever possible.

### After coding
Run, at minimum:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

For flows touching import/export/editor interaction, also run E2E tests.

## 5. Package policy

Use the versions pinned by the actual `package-lock.json`.

If bootstrapping from these docs, use the baseline in `docs/03_TECH_STACK.md`, create the lockfile, then treat the lockfile as canonical.

Do not use `latest` in `package.json`.

## 6. State ownership

### GrapesJS owns
- page/component tree;
- component attributes;
- CSS rules;
- editor selection;
- undo/redo stack;
- project data;
- editor-level assets.

### React/Zustand owns only application UI state
Examples:
- active left/right tab;
- modal visibility;
- import warning banner;
- app theme;
- current document metadata not represented by GrapesJS;
- save status indicator.

Never maintain a second copy of the editable page tree.

## 7. Security is a feature, not cleanup

All imported HTML is untrusted.

The import pipeline must:

1. parse using browser DOM APIs;
2. extract supported metadata;
3. remove scripts and dangerous executable constructs;
4. sanitize;
5. produce warnings;
6. only then load content into the editor.

Imported scripts must never execute inside the editor.

If sanitization breaks a feature, the secure behavior wins for MVP.

## 8. Editing model

MVP uses normal HTML document flow.

Drag/drop means:
- add blocks;
- move/reorder components;
- nest components only where valid.

It does **not** mean:
- absolute-position every node;
- Figma-like free canvas;
- arbitrary transform handles for every element.

## 9. Persistence rule

Persist this:

```ts
{
  schemaVersion,
  id,
  name,
  createdAt,
  updatedAt,
  sourceMeta,
  editorProjectData
}
```

`editorProjectData` comes from GrapesJS `editor.getProjectData()`.

HTML/CSS is generated for export, not used as the canonical editor save format.

## 10. Git/commit recommendation

Keep commits task-scoped:

```text
feat(import): add sanitized HTML import pipeline
feat(editor): add visual style inspector
test(export): cover standalone HTML export
fix(canvas): preserve selection after duplicate
```

One task may require multiple commits, but unrelated tasks must not be mixed.

## 11. Stop conditions

Stop and document instead of guessing when:

- a library API differs from the spec;
- a browser security restriction blocks a planned behavior;
- sanitization changes imported content in a way that may cause data loss;
- an existing architectural rule would need to be violated;
- a requested feature belongs to Future Roadmap rather than MVP.

## 12. Completion report format

At the end of a task, report:

```text
Task:
Files changed:
Behavior implemented:
Tests run:
Acceptance criteria passed:
Known limitations:
Next unblocked task:
```

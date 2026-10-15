# 10 — Testing Strategy

## 1. Test pyramid

### Unit tests — many
Fast, deterministic domain logic.

### Integration tests — moderate
React shell + adapter boundaries where practical.

### E2E tests — focused
Critical real-browser editor behavior.

## 2. Unit test targets

### Import parser
Cases:
- normal full document;
- body fragment;
- inline styles;
- title/meta;
- scripts;
- event handlers;
- external stylesheets;
- malformed HTML;
- unsafe URLs.

### Export generator
Cases:
- escapes title;
- includes CSS;
- includes body HTML;
- valid doctype/head/body;
- no removed scripts;
- language fallback;
- viewport meta.

### URL policy
Cases:
- http;
- https;
- relative;
- fragment;
- mailto;
- tel;
- javascript rejection;
- case/whitespace bypass attempts.

### Repository
Cases:
- save/get;
- overwrite;
- list order;
- delete;
- invalid schema;
- storage failure.

## 3. Editor adapter tests

Where possible:
- initialization;
- destroy;
- project data round-trip;
- viewport method mapping;
- null selection actions no-op.

Do not over-mock GrapesJS internals. Critical canvas behavior belongs in E2E.

## 4. E2E P0 scenarios

### E2E-001 Blank edit
1. open app;
2. create blank project;
3. add heading block;
4. edit text;
5. save;
6. reload;
7. text remains.

### E2E-002 Import static page
1. import fixture HTML;
2. page renders;
3. select heading;
4. change color;
5. duplicate section;
6. undo;
7. redo.

### E2E-003 Reorder
1. import two sections;
2. drag second before first;
3. export;
4. exported order matches.

### E2E-004 Responsive preview
1. load page;
2. switch desktop/tablet/mobile;
3. canvas width changes;
4. content not destroyed.

### E2E-005 Security
1. import malicious fixture;
2. no script runs;
3. warning visible;
4. export contains no executable payload.

### E2E-006 Save/load project JSON
1. make styles and structure changes;
2. save;
3. reload project;
4. structure/styles remain;
5. undo state after reload is not required to persist.

### E2E-007 Export
1. build simple page;
2. export standalone HTML;
3. open exported result in separate test page/context;
4. visual content and CSS are present.

## 5. Regression fixtures

Create:

```text
tests/fixtures/
  basic-landing.html
  inline-styles.html
  external-stylesheet.html
  malformed.html
  xss-script.html
  xss-event-handler.html
  xss-javascript-url.html
  nested-layout.html
```

Keep fixtures small and purpose-specific.

## 6. Type/lint/build gates

Every PR/task completion:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Before MVP release:

```bash
npm run test:e2e
```

## 7. No flaky-test policy

Do not use arbitrary sleeps.

Prefer:
- visible state assertions;
- editor readiness hooks;
- stable data-testid for app shell;
- waiting for specific canvas/editor condition.

## 8. Manual smoke checklist

- Import modal works.
- Imported content appears.
- Blocks drag.
- Layers select.
- Inspector edits.
- Undo/redo.
- Save/reload.
- Export.
- No console error.
- Malicious fixture does not execute.

## 9. Acceptance mapping

Test names should reference task/acceptance IDs where practical.

Example:

```ts
it('AC-IMPORT-03 removes inline event handlers', ...)
```

This makes agent completion auditable.

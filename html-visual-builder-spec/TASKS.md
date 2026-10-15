# TASKS — Ordered Implementation Backlog

Do tasks in order unless marked parallel-safe.

Legend:
- `[ ]` todo
- `[~]` in progress
- `[x]` done
- `BLOCKED` dependency not ready

## EPIC 0 — Scaffold

- [ ] **T-0001** Create Vite + React + TypeScript project.
  - Acceptance: AC-ENG-001..004.
- [ ] **T-0002** Pin dependencies and commit lockfile.
- [ ] **T-0003** Configure strict TypeScript.
- [ ] **T-0004** Configure ESLint + Prettier.
- [ ] **T-0005** Configure Vitest and test setup.
- [ ] **T-0006** Create base file tree from `docs/13_FILE_TREE.md`.
- [ ] **T-0007** Add AppErrorBoundary.

## EPIC 1 — Visual Editor Core

- [ ] **T-0101** Create typed `EditorAdapter`.
- [ ] **T-0102** Initialize/destroy GrapesJS safely.
- [ ] **T-0103** Configure blank document.
- [ ] **T-0104** Configure viewport devices.
- [ ] **T-0105** Add Structure blocks.
- [ ] **T-0106** Add Content blocks.
- [ ] **T-0107** Integrate Blocks panel.
- [ ] **T-0108** Integrate Layers panel.
- [ ] **T-0109** Add selection bridge to UI.
- [ ] **T-0110** Add duplicate/delete commands.
- [ ] **T-0111** Add Undo/Redo toolbar.
- [ ] **T-0112** Add keyboard focus guards.

Exit:
AC-EDIT, AC-HIST, AC-RESP core items pass.

## EPIC 2 — Inspector

- [ ] **T-0201** Implement Style Manager sectors.
- [ ] **T-0202** Layout controls.
- [ ] **T-0203** Spacing controls.
- [ ] **T-0204** Size controls.
- [ ] **T-0205** Typography controls.
- [ ] **T-0206** Background controls.
- [ ] **T-0207** Border controls.
- [ ] **T-0208** Effects controls.
- [ ] **T-0209** Attributes panel.
- [ ] **T-0210** URL validation on href/src edits.

## EPIC 3 — Secure Import

Parallel-safe unit-level tasks can be split.

- [ ] **T-0301** Define import types/warnings.
- [ ] **T-0302** Implement DOMParser extraction.
- [ ] **T-0303** Extract inline CSS.
- [ ] **T-0304** Detect external stylesheets/resources.
- [ ] **T-0305** Implement DOMPurify sanitizer config.
- [ ] **T-0306** Implement URL policy.
- [ ] **T-0307** Compose `importDocument`.
- [ ] **T-0308** Add malicious fixtures.
- [ ] **T-0309** Unit-test sanitizer/import.
- [ ] **T-0310** Build Import modal.
- [ ] **T-0311** Add Paste flow.
- [ ] **T-0312** Add File upload flow.
- [ ] **T-0313** Add warning banner/details.
- [ ] **T-0314** Protect dirty project from silent replacement.
- [ ] **T-0315** Load SanitizedDocument into editor.

Exit:
AC-IMPORT-001..010 pass.

## EPIC 4 — Persistence

- [ ] **T-0401** Define SavedProject schema.
- [ ] **T-0402** Create migration/validation entry point.
- [ ] **T-0403** Define ProjectRepository interface.
- [ ] **T-0404** Implement browser repository.
- [ ] **T-0405** Save current project data.
- [ ] **T-0406** Project list/open flow.
- [ ] **T-0407** Dirty/saving/saved/error UI.
- [ ] **T-0408** Persistence tests.

Exit:
AC-SAVE-001..005 pass.

## EPIC 5 — Export

- [ ] **T-0501** Implement `exportStandaloneHtml`.
- [ ] **T-0502** Add export unit tests.
- [ ] **T-0503** Build Export dialog.
- [ ] **T-0504** Download `.html`.
- [ ] **T-0505** Copy body HTML.
- [ ] **T-0506** Copy CSS.
- [ ] **T-0507** Show remote-asset warning.

Exit:
AC-EXPORT-001..008 pass.

## EPIC 6 — E2E / Release

- [ ] **T-0601** Configure browser E2E.
- [ ] **T-0602** E2E blank edit/save/reload.
- [ ] **T-0603** E2E HTML import.
- [ ] **T-0604** E2E drag/reorder.
- [ ] **T-0605** E2E undo/redo.
- [ ] **T-0606** E2E security fixture.
- [ ] **T-0607** E2E export.
- [ ] **T-0608** Accessibility smoke.
- [ ] **T-0609** Console-error audit.
- [ ] **T-0610** Run full acceptance checklist.

## Rule for marking `[x]`

A coding agent may mark a task complete only when:
1. implementation exists;
2. relevant tests pass;
3. linked acceptance criteria pass;
4. no known P0 regression is introduced.

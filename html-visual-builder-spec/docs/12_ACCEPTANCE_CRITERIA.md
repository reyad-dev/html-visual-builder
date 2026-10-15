# 12 — Acceptance Criteria

This is the release gate.

`P0` = must pass for MVP.  
`P1` = desirable after P0.

## A. Application shell

- [ ] **AC-APP-001 P0** App loads with no uncaught console exception.
- [ ] **AC-APP-002 P0** Editor instance is created once per workspace mount.
- [ ] **AC-APP-003 P0** Editor instance is destroyed on workspace unmount.
- [ ] **AC-APP-004 P0** Left and right panels scroll independently where needed.

## B. Blank editing

- [ ] **AC-EDIT-001 P0** User can add a Section block.
- [ ] **AC-EDIT-002 P0** User can add Heading/Text/Button/Image.
- [ ] **AC-EDIT-003 P0** User can select an element by mouse.
- [ ] **AC-EDIT-004 P0** User can reorder supported elements by drag/drop.
- [ ] **AC-EDIT-005 P0** User can edit text.
- [ ] **AC-EDIT-006 P0** User can duplicate selected element.
- [ ] **AC-EDIT-007 P0** User can delete selected element.
- [ ] **AC-EDIT-008 P0** Root wrapper cannot be deleted accidentally.
- [ ] **AC-EDIT-009 P0** Null selection operations do not throw.

## C. Styles

- [ ] **AC-STYLE-001 P0** User can change text color.
- [ ] **AC-STYLE-002 P0** User can change font size.
- [ ] **AC-STYLE-003 P0** User can change margin/padding.
- [ ] **AC-STYLE-004 P0** User can change background color.
- [ ] **AC-STYLE-005 P0** User can change width/max-width.
- [ ] **AC-STYLE-006 P0** User can change border/radius.
- [ ] **AC-STYLE-007 P1** User can change box shadow from visual control.

## D. Attributes

- [ ] **AC-ATTR-001 P0** Link href can be edited.
- [ ] **AC-ATTR-002 P0** Image src/alt can be edited.
- [ ] **AC-ATTR-003 P0** `javascript:` href is rejected.
- [ ] **AC-ATTR-004 P0** Arbitrary `on*` handler is not exposed/accepted.

## E. History

- [ ] **AC-HIST-001 P0** Structural add/remove can undo.
- [ ] **AC-HIST-002 P0** Style change can undo.
- [ ] **AC-HIST-003 P0** Redo restores undone change.
- [ ] **AC-HIST-004 P0** Toolbar buttons reflect availability.

## F. Responsive preview

- [ ] **AC-RESP-001 P0** Desktop preset works.
- [ ] **AC-RESP-002 P0** Tablet preset works.
- [ ] **AC-RESP-003 P0** Mobile preset works.
- [ ] **AC-RESP-004 P0** Switching viewport does not delete/change page content.

## G. Import

- [ ] **AC-IMPORT-001 P0** Paste full HTML document imports body.
- [ ] **AC-IMPORT-002 P0** Upload `.html` imports.
- [ ] **AC-IMPORT-003 P0** Inline `<style>` CSS is loaded.
- [ ] **AC-IMPORT-004 P0** `<script>` is removed.
- [ ] **AC-IMPORT-005 P0** inline event handlers are removed.
- [ ] **AC-IMPORT-006 P0** `javascript:` URLs are removed/rejected.
- [ ] **AC-IMPORT-007 P0** external stylesheet is reported as warning when not loaded.
- [ ] **AC-IMPORT-008 P0** failed import does not overwrite current project.
- [ ] **AC-IMPORT-009 P0** dirty project receives replace confirmation before import.
- [ ] **AC-IMPORT-010 P0** malicious security fixtures execute no JavaScript.

## H. Save/load

- [ ] **AC-SAVE-001 P0** Project saves canonical GrapesJS project data.
- [ ] **AC-SAVE-002 P0** Saved project reload preserves structure.
- [ ] **AC-SAVE-003 P0** Saved project reload preserves styles.
- [ ] **AC-SAVE-004 P0** Project name and timestamps persist.
- [ ] **AC-SAVE-005 P0** Storage error is shown and does not pretend success.

## I. Export

- [ ] **AC-EXPORT-001 P0** Standalone HTML download is generated.
- [ ] **AC-EXPORT-002 P0** Export contains current body HTML.
- [ ] **AC-EXPORT-003 P0** Export contains current CSS.
- [ ] **AC-EXPORT-004 P0** Export contains doctype, head, body.
- [ ] **AC-EXPORT-005 P0** Removed scripts are not reintroduced.
- [ ] **AC-EXPORT-006 P0** Unsafe JavaScript URL is not emitted.
- [ ] **AC-EXPORT-007 P0** User can copy body HTML.
- [ ] **AC-EXPORT-008 P0** User can copy CSS.

## J. Keyboard/accessibility

- [ ] **AC-A11Y-001 P0** Toolbar controls have accessible names.
- [ ] **AC-A11Y-002 P0** Visible keyboard focus exists.
- [ ] **AC-A11Y-003 P0** Global delete shortcut does not fire while typing in input/contenteditable.
- [ ] **AC-A11Y-004 P0** Modals can close via Escape and restore reasonable focus.

## K. Engineering quality

- [ ] **AC-ENG-001 P0** `npm run typecheck` passes.
- [ ] **AC-ENG-002 P0** `npm run lint` passes.
- [ ] **AC-ENG-003 P0** `npm run test` passes.
- [ ] **AC-ENG-004 P0** `npm run build` passes.
- [ ] **AC-ENG-005 P0** P0 E2E suite passes in Chromium.
- [ ] **AC-ENG-006 P0** No parallel custom document tree exists outside GrapesJS.
- [ ] **AC-ENG-007 P0** No imported JavaScript execution feature exists.

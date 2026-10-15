# HTML Visual Builder — Project Specification

> **Purpose:** Build a browser-based visual editor that can import static HTML/CSS, let the user edit the design with mouse-driven drag/drop and visual controls, then save/export the result safely.

This repository documentation is written as a **source of truth for a coding agent**.  
The agent must not invent features, architecture, libraries, data contracts, or behavior that conflict with these documents.

## Read order

1. `AGENTS.md`
2. `docs/01_PRODUCT_SPEC.md`
3. `docs/02_SCOPE_AND_NON_GOALS.md`
4. `docs/03_TECH_STACK.md`
5. `docs/04_ARCHITECTURE.md`
6. `docs/05_EDITOR_BEHAVIOR.md`
7. `docs/06_IMPORT_EXPORT.md`
8. `docs/07_DATA_MODEL.md`
9. `docs/08_UI_UX_SPEC.md`
10. `docs/09_SECURITY.md`
11. `docs/10_TESTING.md`
12. `docs/11_IMPLEMENTATION_PLAN.md`
13. `docs/12_ACCEPTANCE_CRITERIA.md`
14. `docs/13_FILE_TREE.md`
15. `docs/14_DECISIONS_AND_TROUBLESHOOTING.md`
16. `docs/15_FUTURE_ROADMAP.md`
17. `TASKS.md`

## Product in one sentence

A **safe static HTML/CSS visual builder** where a user can paste/upload a design, select elements, drag/reorder them, edit text and styles, add common blocks, undo/redo changes, preview responsive widths, save locally, and export clean HTML/CSS.

## MVP principle

The MVP is **not a browser devtools clone** and is **not a full Webflow/Framer replacement**.

It is a focused visual editor for **static HTML/CSS documents**.

## Core technical decision

Use:

- React + TypeScript + Vite for the application shell.
- GrapesJS Core as the visual editing engine.
- DOMPurify for sanitizing untrusted imported HTML.
- GrapesJS Project Data JSON as the canonical persistence format.
- Local browser storage for MVP persistence.
- Vitest + Playwright-style end-to-end coverage for critical flows.

Do not create a custom drag/drop engine in MVP.

## Golden rules

- Never execute imported JavaScript.
- Never persist only exported HTML/CSS as editor state.
- Never duplicate the GrapesJS component tree into React state.
- Never use regex as the primary HTML sanitizer/parser.
- Never fetch or execute remote scripts from imported HTML.
- Never add a feature unless it is listed in the scope or explicitly approved.
- Every implementation phase must pass its tests before moving to the next phase.

## Definition of done

The MVP is done only when a user can:

1. Start with an empty project.
2. Paste or upload an `.html` file.
3. See the sanitized static design in the canvas.
4. Select elements by mouse.
5. Drag/reorder supported elements.
6. Edit text inline.
7. Add common blocks.
8. Edit visual CSS properties.
9. Duplicate/delete elements.
10. Undo/redo changes.
11. Switch desktop/tablet/mobile preview widths.
12. Save and reopen the project locally.
13. Export a standalone HTML file.
14. Receive clear warnings when unsupported JavaScript/external resources were removed or ignored.
15. Complete all critical workflows without uncaught console errors.

See `docs/12_ACCEPTANCE_CRITERIA.md` for the exact acceptance checklist.

# HTML Visual Builder — Release Handoff & Deployment Guide

## 1. Executive Summary & Delivery Scope

**HTML Visual Builder** is a client-side, high-fidelity visual HTML/CSS document editor and website builder. The application enables users to visually compose, customize, import, and export production-ready HTML pages without backend dependencies.

- **Phase:** `deliver` (Phase 6)
- **Artifact Kind:** `handoff`
- **Release Version:** 0.1.0 (MVP)
- **Status:** Release-ready & fully verified

---

## 2. Production Bundle Identity & Assets

The production bundle is generated in the `dist/` directory via Vite & TypeScript compiler:

| Asset | Path | Size | Description |
| :--- | :--- | :--- | :--- |
| **Entry Document** | `dist/index.html` | ~0.90 kB | Semantic HTML5 entry document with viewport metadata & font preconnects |
| **Core JS Bundle** | `dist/assets/index-CNBUgGKr.js` | ~1.44 MB (~393 kB gzip) | React 19, GrapesJS editor core, DOMPurify sanitization, Zustand state store |
| **Styles Bundle** | `dist/assets/index-DEeVTIRl.css` | ~88 kB (~17 kB gzip) | Modern design system, workspace chrome, responsive layouts, modals & panels |

---

## 3. Verified Core Features & Architecture

### A. Visual Canvas & Core Engine
- Single GrapesJS editor adapter lifecycle per workspace mount (`EditorAdapter`).
- Block Palette with Section, Heading, Text, Button, and Image blocks.
- Real-time Layers hierarchy tree with element selection, duplication, and deletion.
- Undo / Redo history engine with keyboard shortcuts (Ctrl+Z, Ctrl+Shift+Z / Ctrl+Y).
- Viewport Device Mode switcher (Desktop: 1200px, Tablet: 768px, Mobile: 375px).

### B. Property Inspector
- **Typography:** Font family, font size, font weight, line height, text align, letter spacing.
- **Colors:** Text color, background color with color-picker and hex inputs.
- **Dimensions & Layout:** Width, max-width, margin, padding, borders, border-radius.
- **Attributes & Security:** Safe `href` and `src`/`alt` editing with strict URL policy rejecting `javascript:` URLs and `on*` event handlers.

### C. Import Engine
- Paste HTML markup or upload `.html` / `.htm` files (up to 5MB).
- Strict DOMPurify sanitization neutralizing `<script>`, inline event handlers, and unsafe URLs.
- Inline styles and `<style>` blocks preserved and parsed.
- Warnings reported for unresolvable external stylesheets.
- Unsaved changes guard modal before replacing canvas content (`AC-IMPORT-009`).

### D. Persistence Engine
- `BrowserProjectRepository` backed by IndexedDB with automatic `localStorage` fallback.
- Project schema v1 with version tracking and migration interface.
- Automatic active project restoration on page reload (`AC-SAVE-002`).
- Saved projects manager (List, Open, Create New Blank, Delete).

### E. Standalone Export Engine
- Valid HTML5 standalone export with `<!doctype html>`, `<head>`, `<meta name="viewport">`, title escaping, CSS `<style>`, and body markup.
- Actions: One-click `.html` file download, Copy Body HTML, Copy CSS, Copy Full HTML.
- Warning alerts for external remote assets.

---

## 4. Quality & Acceptance Verification Results

All acceptance criteria and quality gates defined in `10_TESTING.md` and `12_ACCEPTANCE_CRITERIA.md` are passed:

| Gate / Suite | Tool | Result | Details |
| :--- | :--- | :--- | :--- |
| **Type Check** | `tsc --noEmit` | **PASS (0 errors)** | Full TypeScript strict type compliance |
| **Lint Check** | `eslint .` | **PASS (0 errors)** | Clean ESLint code standards |
| **Unit & Integration** | `vitest` | **PASS (126 / 126)** | 17 test suites covering domain, editor, state, components |
| **Browser E2E** | `playwright` (Chromium) | **PASS (14 / 14)** | Full real-browser flows (Edit, Import, Reorder, Security, Export, A11y, Console) |
| **Console Error Audit**| Real browser listeners | **PASS (0 errors)** | Zero uncaught exceptions or console errors across complete user lifecycle |
| **Production Build** | `vite build` | **PASS** | Optimized production bundle created in `dist/` |

---

## 5. Deployment & Execution Instructions

### Local Static Server
To serve the production bundle locally:
```bash
npx serve dist -p 5000
```
or with Python:
```bash
python -m http.server --directory dist 5000
```

### Static Hosting Platforms
The `dist/` directory is 100% self-contained static assets and can be deployed directly to:
- **Cloudflare Pages:** Build command: `npm run build`, Output directory: `dist`
- **Vercel / Netlify:** Framework preset: `Vite`, Publish directory: `dist`
- **GitHub Pages:** Deploy content of `dist/` directly to `gh-pages` branch
- **Nginx / Apache:** Serve root pointing directly to `dist/`

---

## 6. Known Constraints & Non-Goals

1. **Client-Side Only:** No server-side database; data resides entirely in browser IndexedDB / localStorage.
2. **Single Document Scope:** Multi-page website management and global site navigation are post-MVP features.
3. **No Canvas Script Execution:** To protect users, arbitrary executable JavaScript is stripped on import and not executed in the canvas.

# 14 — Decisions and Troubleshooting

## Architectural Decision Records

### ADR-001 — Use GrapesJS Core
Status: Accepted

Reason:
The project requires component selection, visual drag/drop, blocks, styles, layers, assets, history, and persistence. Building these correctly from scratch would dominate project risk.

Consequence:
The app owns product UX, security, import/export, and shell; GrapesJS owns core editor state.

---

### ADR-002 — Save Project JSON, not HTML/CSS
Status: Accepted

Reason:
Editor engines require structured project state beyond rendered HTML/CSS.

Consequence:
HTML/CSS is an export artifact.

---

### ADR-003 — Static HTML only in MVP
Status: Accepted

Reason:
Running arbitrary imported JS is a security and determinism problem.

Consequence:
Interactive script behavior is removed and warning is shown.

---

### ADR-004 — No auto-fetch of external stylesheets in P0
Status: Accepted

Reason:
CORS, security, tracking, and reproducibility.

Consequence:
Some imported designs using CDN/external CSS will not look exact until a future controlled resource-loading feature is implemented.

---

### ADR-005 — Normal-flow editor, not freeform design canvas
Status: Accepted

Reason:
User goal is editing HTML designs, not replacing Figma.

Consequence:
Drag/drop moves DOM components through valid layout flow.

---

## Troubleshooting playbook

### Problem: GrapesJS appears twice
Check:
- React Strict Mode development lifecycle;
- adapter initialization guard;
- cleanup/destroy;
- effect dependencies.

Fix lifecycle. Do not hide duplicate DOM with CSS.

### Problem: imported CSS changes app toolbar
Cause:
CSS leaked into parent document.

Fix:
Keep styles inside editor canvas/iframe. Do not inject user CSS globally.

### Problem: undo does not include a custom change
Cause:
Change bypassed GrapesJS model/style APIs.

Fix:
Use supported editor/component APIs rather than mutating canvas DOM directly.

### Problem: save reload loses behavior/style
Check:
- Are you saving `editor.getProjectData()`?
- Are you loading `loadProjectData(...)`?
- Did code save only `getHtml/getCss`?

Project JSON is canonical.

### Problem: inspector and selected element disagree
Likely cause:
React keeps duplicated component state.

Fix:
Query/subscribe to selected component through adapter; do not copy tree.

### Problem: imported page looks different
Check:
- external stylesheet warning;
- removed scripts;
- remote fonts;
- unsupported CSS;
- relative asset URLs.

Do not weaken security automatically.

### Problem: remote image not visible
Check:
- invalid URL;
- CORS/resource availability;
- relative URL lacking base URL.

MVP file/paste import has no authoritative live-site base URL unless explicitly stored.

### Problem: delete fires while typing
Global shortcut is not checking focus context.

Guard:
- input
- textarea
- contenteditable
- future code editor

### Problem: CSS value is too advanced for control
Do not overwrite it with a simplified value merely by opening inspector.

Show raw/unsupported state or leave unchanged until user explicitly edits.

---

## Open Questions

Only add entries here when implementation reveals a real unresolved contradiction.

Template:

```text
### OQ-XXX — Short title
Date:
Task:
Observed:
Conflicting spec/API:
Conservative temporary behavior:
Decision needed:
```

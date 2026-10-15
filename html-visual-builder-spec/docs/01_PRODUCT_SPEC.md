# 01 — Product Specification

## 1. Product name

Working name: **HTML Visual Builder**

The name is not a branding decision and may be changed later.

## 2. Problem

Editing an existing HTML landing page often requires manually reading markup and CSS, finding the correct element, changing styles, and repeatedly refreshing the browser.

The product reduces that friction by offering a visual editing surface.

## 3. Target user

Primary user:

- marketer;
- landing-page creator;
- WordPress/CMS implementer;
- front-end beginner/intermediate developer;
- designer who understands basic HTML/CSS but wants faster visual editing.

## 4. Primary job-to-be-done

> “I have an HTML/CSS design. I want to open it visually, click an element, move or style it with the mouse, edit text, then export the updated HTML without rebuilding the page manually.”

## 5. MVP user stories

### Project creation
- As a user, I can start a blank project.
- As a user, I can paste HTML.
- As a user, I can upload an `.html` file.

### Visual editing
- I can click an element to select it.
- I can see its hierarchy in a Layers panel.
- I can drag/reorder supported components.
- I can add common blocks by drag/drop.
- I can edit text inline.
- I can duplicate an element.
- I can delete an element.
- I can change common CSS values through controls.
- I can change element attributes such as `href`, `src`, `alt`, `title`, and `id` where applicable.

### Responsive preview
- I can switch between desktop/tablet/mobile canvas widths.
- The editor does not rewrite my media queries simply because I switch preview width.

### History
- I can undo.
- I can redo.
- Undo/redo includes structural and style changes supported by GrapesJS.

### Save
- I can save the editable project to browser storage.
- I can reopen a saved project.

### Export
- I can export current HTML/CSS as one standalone `.html` file.
- I can copy HTML and CSS separately.
- Export must not include editor UI metadata unless required by the generated markup.
- Export must not reintroduce JavaScript removed by the secure import pipeline.

## 6. Common blocks in MVP

At minimum:

- Section
- Container
- Columns (2-column)
- Heading
- Paragraph/Text
- Button/Link
- Image
- Divider
- Spacer

Optional if trivial after core stability:

- 3-column layout
- Card
- Hero starter block

## 7. Style controls in MVP

### Layout
- display
- flex direction
- justify-content
- align-items
- gap
- position (static/relative only by default)
- overflow

### Spacing
- margin top/right/bottom/left
- padding top/right/bottom/left

### Size
- width
- min-width
- max-width
- height
- min-height
- max-height

### Typography
- font family
- font size
- font weight
- line height
- letter spacing
- text align
- text color
- text decoration

### Background
- background color
- background image URL
- background size
- background position
- background repeat

### Border
- border width
- border style
- border color
- border radius

### Effects
- opacity
- box-shadow

## 8. Attributes inspector

Supported general attributes:
- id
- title
- class display/read-only or class management via selector system
- aria-label

Element-specific:
- `<a>`: href, target, rel
- `<img>`: src, alt, width, height
- `<input>` if supported later: type, name, placeholder

Event handler attributes such as `onclick` are forbidden.

## 9. Import warnings

After import, show warnings for:

- removed `<script>`;
- removed inline event handlers;
- blocked `javascript:` URLs;
- external stylesheet references that were not loaded;
- unsupported embedded content;
- malformed HTML corrected by the browser parser;
- remote assets that may not display due to network/CORS;
- dynamic behavior that cannot be preserved.

Warnings are informational and must not block safe static editing unless there is no editable body content.

## 10. Success metrics for MVP

Technical:
- no uncaught error in primary flows;
- project save/load round-trip preserves editor state;
- import/export tests pass;
- XSS fixtures do not execute;
- 100% of P0 acceptance criteria pass.

Product:
- a user can edit a provided static landing-page HTML file without touching source code for common changes.

## 11. Accessibility baseline

Application shell:
- keyboard-reachable toolbar buttons;
- visible focus states;
- accessible button names;
- modal focus management;
- semantic labels for inspector controls.

The imported user's page content itself is not automatically made accessible, but the editor should not intentionally remove existing ARIA attributes unless they are unsafe.

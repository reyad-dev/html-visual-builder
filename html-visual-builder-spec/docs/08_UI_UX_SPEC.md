# 08 — UI/UX Specification

## 1. Desktop-first layout

```text
┌───────────────────────────────────────────────────────────────────┐
│ Top Toolbar                                                       │
├──────────────┬───────────────────────────────────┬────────────────┤
│ Left Panel   │                                   │ Right Panel    │
│              │              Canvas               │                │
│ Blocks       │                                   │ Styles         │
│ Layers       │                                   │ Attributes     │
│              │                                   │                │
├──────────────┴───────────────────────────────────┴────────────────┤
│ Optional status/breadcrumb area                                  │
└───────────────────────────────────────────────────────────────────┘
```

## 2. Top toolbar

Left:
- app/project name;
- project menu/import.

Center:
- Desktop
- Tablet
- Mobile

Right:
- Undo
- Redo
- Preview
- Save
- Export

Exact visual positions can vary, but grouping must remain clear.

## 3. Left panel

Tabs:
- Blocks
- Layers

Width:
- around 260–320px desktop.

Panel should scroll independently from canvas.

## 4. Right panel

Tabs:
- Styles
- Attributes

Width:
- around 300–360px desktop.

Sections in Styles are collapsible.

## 5. Canvas area

- neutral editor background;
- page/canvas visually distinct;
- centered when narrower than workspace;
- scrollable;
- no app UI CSS should leak into imported page canvas.

## 6. Empty state

When no content:
- clear drop target;
- button to import HTML;
- user can still drag first block.

## 7. Import flow

Import button opens modal with tabs:
- Paste HTML
- Upload HTML file

Paste tab:
- large textarea;
- Import button.

Upload:
- file drop area;
- accepts `.html,.htm`;
- display selected filename.

Before replacing a dirty non-empty project:
- require confirmation or force explicit “New/Import” workflow.
- never silently discard edits.

## 8. Warning presentation

After import:
- non-blocking warning banner/chip with count;
- clicking opens details.

Examples:
- “3 scripts removed”
- “1 external stylesheet was not loaded”
- “2 unsafe event handlers removed”

## 9. Inspector controls

Style section order:
1. Layout
2. Spacing
3. Size
4. Typography
5. Background
6. Border
7. Effects

Use clear labels and inputs.

Four-sided values may start as independent controls; linked controls are optional.

## 10. Selected-element breadcrumb

Useful footer/top-of-inspector string:

```text
body > section.hero > div.container > h1
```

It is informational.

Do not derive behavior from string parsing of this breadcrumb.

## 11. Export dialog

Tabs or sections:
- Download HTML
- Copy HTML
- Copy CSS

Show:
- warning if remote external assets remain;
- success feedback after copy/download.

## 12. Save feedback

States:
- Unsaved changes
- Saving...
- Saved
- Save failed

Do not use a blocking modal for normal successful save.

## 13. Destructive actions

Project delete:
- confirmation required.

Element delete:
- no modal; undo is available.

Import-over-current-project:
- confirmation required if unsaved changes exist.

## 14. Responsive application shell

MVP editor itself is desktop-oriented.

Minimum practical app viewport:
- ~1024px wide.

On smaller screens:
- side panels may collapse;
- but mobile editor usability is not P0.

## 15. Visual design principle

The tool should feel like an editor:
- restrained chrome;
- high canvas focus;
- clear selection;
- compact controls;
- minimal decorative effects.

Do not overdesign before interaction correctness.

# 05 — Editor Behavior Specification

## 1. Canvas behavior

The canvas represents the editable page body.

Initial blank state should contain either:
- one empty section/container starter; or
- a clear “Drag a block here” state.

The wrapper itself must not be accidentally deletable.

## 2. Selection

Single click:
- selects the closest editable GrapesJS component.

Selected element:
- receives canvas outline/selection UI from the editor;
- appears selected in Layers;
- updates Right Inspector.

Clicking empty canvas:
- selects root/wrapper or clears selection based on the most stable GrapesJS behavior.

## 3. Inline text editing

Double-click text:
- enter inline text editing.

Requirements:
- plain text and simple inline formatting supported by GrapesJS RTE;
- no script insertion;
- exiting edit mode commits change to undo history.

## 4. Drag/drop

Supported:
- drag block from Blocks panel into canvas;
- move existing component before/after another valid sibling;
- move into a valid container.

Disallowed:
- dropping children into elements that cannot semantically contain them where the engine rejects it;
- moving root wrapper;
- silently flattening invalid structures.

## 5. Duplicate

Duplicate selected component:
- clone structure, attributes, content, and editor-managed style associations as GrapesJS supports;
- place clone immediately after original when possible;
- select the clone.

Keyboard:
- `Ctrl/Cmd + D`, only when it does not conflict with focused text/code input.

## 6. Delete

Delete selected component:
- ask for no confirmation for ordinary components;
- record action in undo history;
- never delete root/wrapper.

Keyboard:
- `Delete` / `Backspace` only when focus is not in an editable text/input field.

## 7. Undo/redo

Toolbar buttons:
- disabled when operation unavailable.

Shortcuts:
- Undo: `Ctrl/Cmd + Z`
- Redo:
  - `Ctrl/Cmd + Shift + Z`
  - optionally `Ctrl + Y` on Windows

Use GrapesJS UndoManager.

Do not implement a second history stack.

## 8. Layers panel

Shows:
- nested editable component tree;
- meaningful labels.

Suggested label precedence:
1. user-visible custom name if available;
2. element id (`#hero`);
3. primary class (`.pricing-card`);
4. semantic tag/type (`section`, `heading`, `image`);
5. generic `div`.

Actions:
- click layer -> select;
- expand/collapse;
- drag layer reorder if stable;
- visibility/lock are not required in P0.

## 9. Blocks

Block categories:
- Structure
- Basic
- Content

Example:
- Structure: Section, Container, 2 Columns
- Basic: Spacer, Divider
- Content: Heading, Text, Button, Image

Blocks should generate semantic/simple markup.

Avoid giant predesigned sections in MVP.

## 10. Style Inspector

Inspector shows only when a component is selected.

The UI may use GrapesJS custom Style Manager or a thin custom interface over style APIs.

Units:
- common numeric fields allow sensible units;
- default options: `px`, `%`, `rem`, `em`, `vh`, `vw`, `auto` where valid.

Do not coerce existing advanced values into numbers if the editor cannot represent them safely.

## 11. Attributes Inspector

Render controls based on selected component/tag.

Never expose:
- `onclick`;
- `onerror`;
- arbitrary `on*`;
- raw dangerous HTML injection.

For URLs:
- validate allowed schemes before commit.

## 12. Responsive preview

Viewport presets:

```ts
desktop: 1440
tablet: 768
mobile: 375
```

Canvas may fit/scale visually to available center area.

Changing preview:
- changes canvas width/device;
- does not destructively change content;
- does not automatically create media rules.

## 13. Preview mode

Preview mode:
- hide editing outlines/tools;
- allow page visual inspection;
- keep imported scripts disabled.

Exiting preview returns to prior editor state.

## 14. Keyboard focus rules

Global editor shortcuts must not fire when focus is in:
- input;
- textarea;
- contenteditable text editing;
- code editor if later added.

## 15. Dirty state

Any meaningful project change sets application save state to `dirty`.

After successful save:
- `saved`.

On save failure:
- `error`;
- project remains dirty.

## 16. Empty/invalid selection

All inspector actions must safely no-op if there is no selected component.

Never throw because selection is null.

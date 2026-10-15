# 06 — Import and Export Specification

## 1. Import inputs

P0 supports:
- paste HTML string;
- upload one `.html` / `.htm` file.

Encoding:
- read as text using browser File API;
- UTF-8 is expected/default.

## 2. Import pipeline

Required order:

```text
Raw HTML string
  ↓
DOMParser("text/html")
  ↓
Extract source metadata/resources
  ↓
Extract body HTML + inline style blocks
  ↓
Remove/disable explicitly unsupported executable constructs
  ↓
DOMPurify sanitize
  ↓
URL policy normalization/validation
  ↓
SanitizedDocument
  ↓
GrapesJS adapter
```

Do not invert sanitization and script execution. Nothing imported is executed.

## 3. Parsed metadata

Capture when present:
- `<title>`;
- `<meta name="description">`;
- `<html lang>`;
- viewport meta;
- safe non-executable meta tags if useful;
- external stylesheet URLs;
- remote font/style references as warnings/metadata;
- original filename.

Do not preserve:
- script tags;
- executable inline handlers;
- unsafe URL schemes.

## 4. CSS extraction

Extract CSS from:
- `<style>` tags inside `<head>`;
- `<style>` tags found in body if present;
- inline element `style` attributes if sanitizer policy allows them.

Do not automatically fetch CSS from arbitrary external URLs in P0.

Store external stylesheet references in source metadata and show a warning.

## 5. JavaScript removal

Remove:
- `<script>`;
- inline event attributes (`on*`);
- `javascript:` URL schemes;
- executable embedded content prohibited by sanitizer policy.

Warn user:
“Interactive JavaScript behavior is disabled in the visual editor and is not included in safe export.”

## 6. Sanitizer policy

Use DOMPurify with an explicit configuration.

Intent:
- HTML editing profile;
- allow required safe `data-*` / ARIA attributes if necessary;
- forbid scripts and event handlers;
- forbid dangerous embedded content for MVP.

Do not relax sanitizer settings just to make one imported sample appear more accurate.

A security-policy change requires tests.

## 7. URL schemes

Allowed by default:
- `https:`
- `http:` for ordinary external resources in development/imported pages
- `mailto:` for links
- `tel:` for links
- relative URLs
- fragment `#...`
- safe `data:image/...` only if explicitly needed and tested

Forbidden:
- `javascript:`
- dangerous `data:` payloads
- custom executable schemes

## 8. SanitizedDocument contract

```ts
export interface SanitizedDocument {
  title: string;
  lang?: string;
  meta: Array<{
    name?: string;
    property?: string;
    content: string;
  }>;
  bodyHtml: string;
  css: string;
  externalStylesheets: string[];
  warnings: ImportWarning[];
}

export interface ImportWarning {
  code:
    | 'SCRIPT_REMOVED'
    | 'EVENT_HANDLER_REMOVED'
    | 'UNSAFE_URL_REMOVED'
    | 'EXTERNAL_STYLESHEET_NOT_LOADED'
    | 'EMBED_REMOVED'
    | 'MALFORMED_HTML_NORMALIZED'
    | 'REMOTE_ASSET_MAY_FAIL';
  message: string;
  count?: number;
}
```

## 9. Loading into GrapesJS

For a newly imported document:
- initialize/load components from sanitized `bodyHtml`;
- initialize styles from `css`;
- create new project metadata;
- clear irrelevant previous project state/history;
- establish clean save baseline after import.

Do not treat exported HTML as the saved project state.

## 10. Export formats

### A. Standalone HTML
Generate:

```html
<!doctype html>
<html lang="...">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>...</title>
  <style>
    /* editor CSS */
  </style>
</head>
<body>
  <!-- editor HTML -->
</body>
</html>
```

Include safe preserved metadata where appropriate.

### B. Copy HTML
Body HTML only.

### C. Copy CSS
Current generated CSS only.

## 11. Export rules

Export must:
- use current editor HTML/CSS;
- be deterministic enough for tests;
- escape title/meta values safely;
- not include removed scripts;
- not generate `javascript:` URLs;
- not expose internal app state JSON in page markup.

## 12. External asset behavior

If image `src` is a remote URL:
- preserve safe URL;
- export it as-is;
- do not claim the export is offline/self-contained.

If image is imported as local data URL:
- export may contain the data URL.

Future cloud asset storage is outside P0.

## 13. Save vs export

### Save
Stores editable project:
- metadata;
- warnings/source metadata;
- GrapesJS project data.

### Export
Creates delivery artifact:
- HTML/CSS.

Never confuse the two.

## 14. Import failure behavior

If parser/sanitizer fails:
- keep current project untouched;
- show an error;
- do not partially overwrite current project.

Import should behave transactionally from the user's perspective.

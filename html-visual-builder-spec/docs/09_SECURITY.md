# 09 — Security Specification

## 1. Threat model

The user can import arbitrary HTML from an untrusted source.

Assume imported markup may attempt:
- XSS;
- script execution;
- event-handler execution;
- malicious URLs;
- dangerous embeds;
- DOM clobbering;
- unexpected external requests.

## 2. Core rule

**Imported code is content, not trusted application code.**

## 3. Required controls

### HTML sanitization
Use DOMPurify.

Do not:
- build an XSS sanitizer with regex;
- whitelist scripts;
- allow arbitrary `on*` attributes.

### Script policy
Remove all imported:
- `<script>`;
- event handlers;
- JavaScript URLs.

### Canvas isolation
Use GrapesJS canvas isolation/iframe behavior as provided by the engine.

Do not intentionally bridge imported code into parent application execution.

### URL validation
Validate user-edited href/src values.

At minimum reject:
- `javascript:`;
- dangerous non-image `data:` URLs;
- malformed schemes intended to bypass case/whitespace checks.

Parse URLs defensively.

## 4. External stylesheets

P0 does not automatically fetch arbitrary stylesheets.

This avoids:
- unexpected tracking/network requests;
- CORS complexity;
- non-deterministic rendering;
- unsafe CSS dependencies.

## 5. External images

Remote images may make network requests.

This is acceptable when the user imports a page containing safe HTTP(S) image URLs, but:
- show remote-resource caveat;
- do not proxy them in P0.

## 6. CSS security

CSS is generally less executable than JS but still can:
- trigger remote requests;
- break editor visuals if leaked;
- use extreme resource values.

Requirements:
- keep imported CSS scoped to editor canvas, not app shell;
- avoid injecting imported CSS into parent document;
- rely on canvas isolation.

## 7. DOMPurify rule

Sanitize immediately before content becomes editor-loadable.

Do not:
1. sanitize;
2. then append unsanitized extracted fragments afterward.

Any transformation after sanitization that can introduce markup must itself be safe or be sanitized again.

## 8. File upload constraints

HTML upload:
- one file;
- extension `.html` or `.htm`;
- configurable size cap, suggested P0 cap: 5 MB;
- reject obvious binary/non-text content.

Images if local upload is supported:
- validate MIME;
- set reasonable size cap;
- no executable HTML masquerading as image.

## 9. CSP recommendation for deployment

When deploying, use a Content Security Policy suitable for the editor shell.

Exact CSP depends on canvas assets and hosting, but avoid:
- unrestricted `script-src *`;
- `unsafe-eval` unless a verified dependency absolutely requires it.

Document any CSP relaxation.

## 10. Persistence privacy

MVP saves locally in browser storage.

Do not transmit imported HTML to a server because there is no backend.

If telemetry is later added:
- never include full imported document content in events.

## 11. Security tests

Required fixtures:
- `<script>alert(1)</script>`
- `<img src=x onerror=alert(1)>`
- `<a href="javascript:alert(1)">x</a>`
- mixed-case/whitespace JavaScript URL variants
- dangerous iframe/embed
- malformed HTML around dangerous tags
- safe ordinary links/images to prevent over-blocking

Expected:
- no alert/script execution;
- unsafe constructs removed or neutralized;
- safe content remains editable.

## 12. Security regression policy

Any sanitizer or URL-policy change must include:
- regression test for the reason it changed;
- successful full security fixture suite.

Security fixes take priority over pixel-perfect import fidelity.

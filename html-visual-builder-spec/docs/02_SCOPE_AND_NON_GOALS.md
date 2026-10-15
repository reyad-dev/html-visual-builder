# 02 — Scope and Non-Goals

This document exists to stop scope creep.

## 1. MVP scope

The MVP edits **static HTML + CSS**.

Supported inputs:
- pasted HTML;
- local `.html` upload;
- inline `<style>`;
- inline `style=""`;
- normal static element attributes;
- remote images/fonts if the browser can load them and they are safe references.

## 2. Explicit non-goals for MVP

Do not implement:

- arbitrary JavaScript execution;
- React/Vue/Angular source-code round-trip;
- PHP/JSP/Blade/Twig execution;
- WordPress theme/plugin execution;
- server-side rendering;
- Figma-style freeform canvas;
- arbitrary absolute positioning as the default editing model;
- live website scraping by URL;
- CSS framework inference;
- automatic Tailwind source regeneration;
- exact original source formatting preservation;
- collaborative multiplayer editing;
- accounts/authentication;
- cloud database;
- cloud asset storage;
- comments;
- publishing/hosting;
- Git integration;
- AI generation;
- template marketplace;
- billing/subscriptions;
- version branches;
- responsive breakpoint authoring UI beyond preview sizing;
- animation timeline editor;
- JavaScript behavior editor;
- form submission backend.

## 3. Important limitation: source round-trip

The editor preserves visual/document meaning as well as practical, but it does **not** promise byte-for-byte preservation of the original HTML.

Parsing and serializing may change:
- whitespace;
- quote style;
- attribute ordering;
- CSS ordering;
- automatically closed tags;
- equivalent browser-normalized markup.

This is acceptable.

## 4. Dynamic pages

A page depending on scripts for rendering or behavior is outside MVP.

Examples:
- sliders initialized by JS;
- React-rendered apps;
- menu toggles controlled by JS;
- dynamic data fetching;
- script-generated DOM.

The editor may import the static HTML already present, but must remove/disable scripts.

## 5. External CSS

Default MVP policy:

- discover external `<link rel="stylesheet">`;
- record their URLs as source metadata/warnings;
- do not automatically download and inline arbitrary external stylesheets;
- allow the browser/editor canvas to use only explicitly approved safe configuration if a later task adds support.

Reason:
- security;
- CORS;
- deterministic saves;
- offline reproducibility;
- avoiding invisible external dependencies.

## 6. Iframes and embedded content

Default MVP:
- do not execute untrusted embedded documents;
- imported `<iframe>` should be removed or replaced with a non-executable placeholder according to the sanitizer policy.

## 7. SVG

SVG can contain complex attack surface.

MVP recommendation:
- allow ordinary `<img src="...svg">` URLs under normal URL validation;
- do not support arbitrary inline SVG editing in v1 unless the sanitizer policy and tests explicitly cover it.

## 8. CSS limitations

CSS may include unsupported/advanced values. The editor must:
- preserve what GrapesJS can preserve;
- expose common visual properties;
- not pretend every CSS feature is visually editable.

Advanced CSS remains exportable when preserved, but may require code editing in a future release.

## 9. Browser support

Primary:
- current stable Chrome/Chromium;
- current stable Edge.

Secondary:
- current stable Firefox;
- current stable Safari.

Do not spend MVP time on legacy browsers.

## 10. “Not now” rule

If a useful idea is outside MVP:
1. do not implement it;
2. add it to `docs/15_FUTURE_ROADMAP.md` only if it is genuinely relevant;
3. continue the current P0/P1 task.

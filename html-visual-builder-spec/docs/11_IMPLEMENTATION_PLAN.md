# 11 — Implementation Plan

Do not implement all features simultaneously.

## Phase 0 — Scaffold

Goal:
A strict, testable React app builds successfully.

Tasks:
- create Vite React TypeScript app;
- pin dependencies;
- configure ESLint/Prettier;
- strict TypeScript;
- create directory structure;
- configure Vitest;
- add basic app shell;
- add error boundary.

Exit:
- typecheck/lint/test/build pass.

## Phase 1 — GrapesJS minimal integration

Goal:
Visual canvas works with a blank document.

Tasks:
- create `EditorAdapter`;
- initialize one GrapesJS instance;
- disable unwanted default chrome if using custom shell;
- add block panel host;
- add layer panel host/custom bridge;
- configure devices;
- configure style manager;
- cleanup on unmount.

Exit:
- user can add, select, move, and delete a block;
- no duplicate editor instances.

## Phase 2 — Core editor controls

Goal:
Usable mouse-based editing.

Tasks:
- toolbar undo/redo;
- duplicate/delete actions;
- responsive device switch;
- text editing;
- style inspector;
- attributes inspector;
- selection breadcrumb/label.

Exit:
- common visual edits work without source editing.

## Phase 3 — Secure import

Goal:
Static HTML can be imported safely.

Tasks:
- raw string parser;
- metadata extraction;
- CSS extraction;
- unsupported resource detection;
- DOMPurify sanitizer;
- URL policy;
- warnings;
- import modal;
- dirty-project replacement guard;
- fixtures/tests.

Exit:
- basic landing fixture imports;
- malicious fixtures do not execute.

## Phase 4 — Persistence

Goal:
Project survives reload.

Tasks:
- SavedProject schema;
- ProjectRepository;
- IndexedDB/local implementation;
- save command;
- open/list project;
- dirty/saved states;
- validation/migration entry point.

Exit:
- project JSON round-trip passes.

## Phase 5 — Export

Goal:
Edited result is usable outside editor.

Tasks:
- standalone HTML generator;
- HTML copy;
- CSS copy;
- download;
- safe metadata;
- remote asset warning.

Exit:
- exported fixture opens with expected HTML/CSS.

## Phase 6 — E2E and hardening

Goal:
MVP acceptance.

Tasks:
- E2E suite;
- security fixtures;
- null-state fixes;
- shortcut focus guards;
- error states;
- performance cleanup;
- browser smoke tests.

Exit:
- all P0 acceptance criteria pass.

## Phase 7 — UI polish

Only after functional acceptance:
- spacing;
- icon consistency;
- panel resizing if needed;
- better empty states;
- tooltips;
- visual refinement.

Do not move Phase 7 work ahead of broken core behavior.

## Task dependency rule

A phase can start only when previous phase exit criteria pass, except independent documentation/test-fixture preparation.

## Change size

Prefer tasks that can be verified independently.

Avoid a “build entire editor” mega-commit.

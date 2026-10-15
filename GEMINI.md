# GEMINI.md — Instructions for Gemini & Antigravity Agents

## Mandatory Entry Point: OntoLink Knowledge Graph

This workspace is governed by an OWL knowledge mediator (`knowledge.owl`).

Before reading raw markdown documents or executing tasks:
1. Always run:
   ```bash
   python .agents/skills/ontolink-skills/scripts/mediator.py context --state knowledge.owl
   ```
2. Inspect `active_task`, `workflow_skill`, and `completion_gates`.
3. Only open markdown files in `html-visual-builder-spec/` that are listed in the `context` or `usesArtifact` array for the active task.
4. Adhere to the 7 OntoLink phases: `discover` -> `design` -> `plan` -> `build` -> `verify` -> `deliver` -> `monitor`.
5. Apply state changes using `mediator.py record`.

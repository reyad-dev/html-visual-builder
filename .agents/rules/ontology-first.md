# Rule: Ontology-First Workflow (Mandatory for All AI Agents)

## 1. Absolute Priority: Ontology is Canonical Source of Truth

Whenever any AI agent (Antigravity, Cursor, Cline, Copilot, Gemini CLI, Claude, etc.) begins a session or is assigned a task in this repository, **the very first action MUST be to inspect the project ontology (`knowledge.owl`)**.

Do NOT start by reading arbitrary Markdown files in `html-visual-builder-spec/` or editing code files.

---

## 2. Mandatory First Command

Before doing any research or code edits, run:

```bash
python .agents/skills/ontolink-skills/scripts/mediator.py context --state knowledge.owl
```

For inspecting a specific task:
```bash
python .agents/skills/ontolink-skills/scripts/mediator.py context --state knowledge.owl --task <task-id>
```

---

## 3. How to Use the Ontology Context Packet

The JSON packet returned by the mediator command contains the authoritative project state:

1. **`active_task`**: Identifies the single current task eligible for execution (its ID, title, phase, owner, required outcome kind, and linked artifacts).
2. **`workflow_skill`**: Tells the agent which OntoLink skill governs the current work:
   - `ontolink-discovery` (Phase: `discover` -> Outcome: `requirements`)
   - `ontolink-architecture` (Phase: `design` -> Outcome: `contracts`)
   - `ontolink-planning` (Phase: `plan` -> Outcome: `plan`)
   - `ontolink-implementation` (Phase: `build` -> Outcome: `implementation`)
   - `ontolink-verification` (Phase: `verify` -> Outcome: `verification`)
   - `ontolink-delivery` (Phase: `deliver` -> Outcome: `handoff`)
   - `ontolink-monitoring` (Phase: `monitor` -> Outcome: `monitoring`)
3. **`context`**: Contains ONLY the specific artifacts, requirements, and contracts needed for the active task. **Only read the files listed in `context`**, rather than reading the entire specification folder.
4. **`completion_gates`**: Lists the unmet dependencies, missing evidence, or active blockers preventing task closure.

---

## 4. Phase Execution Sequence

Tasks must progress strictly according to the phase sequence:
`discover` -> `design` -> `plan` -> `build` -> `verify` -> `deliver` -> `monitor`.

- Tasks in later phases cannot be marked `READY` or `DONE` until all tasks in earlier phases are marked `DONE`.
- Marking a task `DONE` requires valid `PASS` evidence with exact SHA-256 matching hashes of the target artifact and local proof.

---

## 5. State Modification Guard

- Never edit `knowledge.owl` by hand.
- Use `python .agents/skills/ontolink-skills/scripts/mediator.py record --state knowledge.owl --input <payload.json> --expected-revision <N>` for all state updates.
- If revision conflicts occur, re-read state and apply updates on the latest revision.

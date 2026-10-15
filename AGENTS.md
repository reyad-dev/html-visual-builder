# AGENTS.md — Global Project Instructions

> **MANDATORY RULE:** The canonical source of truth for project state, workflow phase, active tasks, dependencies, and requirements is the **OntoLink Ontology (`knowledge.owl`)**.

---

## 1. Primary Entry Point (Read This First)

Before reading any Markdown specification files or modifying any source code, **every agent MUST query the ontology context**:

```bash
python .agents/skills/ontolink-skills/scripts/mediator.py context --state knowledge.owl
```

### Why?
- The ontology coordinates the project through 7 rigorous phases: `discover` -> `design` -> `plan` -> `build` -> `verify` -> `deliver` -> `monitor`.
- It dynamically provides the **active task**, the required **workflow skill**, and the exact list of **relevant spec files** to read.
- Reading the entire `html-visual-builder-spec/docs/` directory is wasteful and introduces context drift. Only inspect documents referenced in `context` or `active_task.usesArtifact`.

---

## 2. Phase-to-Skill Mapping

| Phase | OntoLink Skill | Required Outcome Kind | Source Spec Mappings |
| :--- | :--- | :--- | :--- |
| **`discover`** | `ontolink-discovery` | `requirements` | `01_PRODUCT_SPEC.md`, `02_SCOPE_AND_NON_GOALS.md`, `07_DATA_MODEL.md`, `08_UI_UX_SPEC.md`, `project-spec.json` |
| **`design`** | `ontolink-architecture` | `contracts` | `03_TECH_STACK.md`, `04_ARCHITECTURE.md`, `05_EDITOR_BEHAVIOR.md`, `06_IMPORT_EXPORT.md`, `09_SECURITY.md`, `13_FILE_TREE.md`, `14_DECISIONS_AND_TROUBLESHOOTING.md` |
| **`plan`** | `ontolink-planning` | `plan` | `11_IMPLEMENTATION_PLAN.md`, `TASKS.md`, `15_FUTURE_ROADMAP.md` |
| **`build`** | `ontolink-implementation` | `implementation` | `TASKS.md` (Epics 0 to 5: T-0001 to T-0507) |
| **`verify`** | `ontolink-verification` | `verification` | `10_TESTING.md`, `12_ACCEPTANCE_CRITERIA.md`, `TASKS.md` (Epic 6: T-0601 to T-0610) |
| **`deliver`** | `ontolink-delivery` | `handoff` | Release packaging, standalone HTML bundle, deployment check |
| **`monitor`** | `ontolink-monitoring` | `monitoring` | Console error audit, runtime security checks, spec regression tracking |

---

## 3. Workflow Rules

1. **Strict Gate Enforcement:** A phase cannot start until all tasks in preceding phases are marked `DONE`.
2. **Evidence-Gated Completion:** A task cannot be marked `DONE` without PASS evidence verifying the SHA-256 hashes of the target artifact and local proof.
3. **State Updates:** Never edit `knowledge.owl` manually. Always use:
   ```bash
   python .agents/skills/ontolink-skills/scripts/mediator.py record --state knowledge.owl --input payload.json --expected-revision <N>
   ```
4. **Specification Details:** For detailed feature requirements, refer to the documents in `html-visual-builder-spec/` as directed by the ontology context packet.

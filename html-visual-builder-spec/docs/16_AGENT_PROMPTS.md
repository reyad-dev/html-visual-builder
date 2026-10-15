# 16 — Agent Execution Prompts

Use these prompts with a coding agent after placing this spec in the project.

## Prompt A — Start project

```text
Read AGENTS.md, README.md, TASKS.md, and all docs before coding.

Implement only EPIC 0 from TASKS.md.
Do not start GrapesJS feature work yet.

For every task:
- state the task ID;
- implement it;
- run required checks;
- mark it complete only if checks pass.

At the end, report:
Task IDs completed
Files changed
Commands/tests run
Failures or deviations
Next unblocked task
```

## Prompt B — Continue one task at a time

```text
Read AGENTS.md and TASKS.md.
Find the first unchecked unblocked task.

Before coding, read the docs relevant to that task.
Implement only that task and any tiny prerequisite required for it.

Do not add features from Future Roadmap.
Do not change architecture.
Do not add dependencies unless justified by docs.

Run the relevant validation and give the completion report required by AGENTS.md.
```

## Prompt C — Audit implementation against spec

```text
Do not add features.

Audit the current repository against:
1. AGENTS.md
2. docs/12_ACCEPTANCE_CRITERIA.md
3. docs/09_SECURITY.md
4. TASKS.md

Return:
- acceptance criteria passing;
- acceptance criteria failing;
- criteria not tested;
- architectural violations;
- security concerns;
- exact files responsible;
- minimum patch plan ordered by severity.

Do not claim a criterion passes without evidence from code or a test.
```

## Prompt D — Fix a bug without scope creep

```text
Bug: <describe bug>

Read AGENTS.md and the relevant spec files.
Identify which acceptance criterion is affected.
Reproduce with a test if practical.
Patch the smallest correct layer.
Do not refactor unrelated code.
Run typecheck, lint, relevant unit tests, and relevant E2E.
Report root cause, patch, and verification.
```

## Prompt E — Security review

```text
Review only the import/edit/export attack surface.

Treat imported HTML as hostile.
Check:
- script removal;
- on* attribute removal;
- javascript: URL handling;
- data: URL policy;
- dangerous embeds;
- sanitizer configuration;
- post-sanitization mutation;
- canvas isolation;
- export reintroduction risks.

For every finding provide:
severity
file
attack path
why current tests do/do not catch it
minimal fix
required regression test
```

## Important

Do not prompt an agent with:
“Build the whole app however you think is best.”

Always anchor the agent to:
- AGENTS.md;
- a task ID;
- acceptance criteria.

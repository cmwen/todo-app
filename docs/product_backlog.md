# Product Backlog

This backlog captures candidate features, priorities, and in-flight work items.

In-flight items

- T001: Initial repository governance setup — owner: Governance Agent
  - Status: in-progress
  - Links: [Vision → Product] `docs/vision.md` , [Design → Execution] `docs/design.md`

Epic: Repository scaffolding and hygiene

- Epic description: Ensure the repository meets foundational hygiene and governance gates so product work can proceed reproducibly.

  - Story T100: Initialize .gitignore and base structure
    - Owner: Repo Maintainer
    - Status: done
    - Acceptance Criteria:
      - A language-appropriate `.gitignore` exists and ignores OS, IDE, build, and dependency artifacts.
      - `src/`, `tests/`, and `docs/` directories exist (or equivalents per stack).
      - README contains quick start and links to key docs.
      - Execution log entry exists for the setup and is referenced from `docs/governance_traceability.md`.

  - Story T101: Add governance docs skeleton
    - Owner: Repo Maintainer
    - Status: done
    - Acceptance Criteria:
      - `docs/product_backlog.md`, `docs/execution_log.md`, `docs/qa_plan.md`, and `docs/governance_traceability.md` exist and reference each other where applicable.

  - Story T102: Add CI smoke test and basic unit test
    - Owner: Repo Maintainer
    - Status: not-started
    - Acceptance Criteria:
      - A CI workflow exists that runs a smoke command or test suite.
      - At least one automated unit test exists and passes in CI.
      - The smoke test command is documented in README.

How to use

- Add backlog items as bullets with an ID (T###), owner, status, and links to design or execution notes.

See also: `docs/governance_traceability.md` for cross-references and gating decisions.

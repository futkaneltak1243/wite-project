# BRAIN_AUTHORING_PROTOCOL.md

## Purpose

This protocol defines how we author and maintain **Brain** docs for this project under `/brain/**`.

Brain docs are **low-level technical implementation explanations** authored primarily for **AI consumption** so future AIs can:
- generate/modify code with minimal guesswork
- keep code aligned with the approved product intent (Seeds + Walkthrough)
- prevent drift by making ownership boundaries explicit (what is canonical where)

This protocol is about **how to write Brain docs**. Product behavior remains defined by:
- `seed/PROJECT_DEFINITION.md` (baseline product spec)
- `walkthrough/02.*` System docs (canonical mechanics/contracts/terms)
- `walkthrough/01.*` Journey docs (canonical user-facing ordering)

---

## Brain -> Code (Core Concept: Read This First)

### Mental model
- **Walkthrough** = *What the product must do* (user journeys + canonical system mechanics; no runnable code).
- **Brain** = *How we will implement it* (architecture, modules, data models, state machines, IO boundaries, error strategy).
- **Code** = *The concrete implementation artifacts* (source files, configs, resources, build files).

Brain exists to bridge the two failure modes that cause drift:
1) Implementing from walkthrough alone -> ambiguous design choices leak into code.
2) Implementing from code alone -> behavior deviates from the walkthrough intent over time.

### How Brain drives code generation (expected workflow)
1) **Create/Update Brain docs first**, until each brain file contains enough detail to implement its owned behaviors without rereading the entire walkthrough.
2) **Generate code by "code ownership"**:
   - each Brain file MUST declare which modules/files it owns (see template)
   - code changes MUST be mapped back to a Brain section (or the Brain updated)
3) **Implement in dependency order** (data/state -> services -> UI), keeping diffs small and reviewable.
4) **Run checks and keep traceability**:
   - when code changes imply behavior changes, update walkthrough first (or mark as TBD), then brain, then code.

### Alignment rule (non-negotiable)
Brain docs MUST NOT introduce new product behavior that contradicts Seeds/Walkthrough. If something is ambiguous:
- prefer a safe inference and label it explicitly as an assumption, OR
- record a single open question with the minimum needed clarification

---

## Precedence and "Source of Truth" Rules

### Product behavior precedence (highest -> lowest)
1) `seed/PROJECT_DEFINITION.md`
2) `walkthrough/02.*` System docs
3) `walkthrough/01.*` Journey docs
4) `/brain/**` (implementation plan)
5) `/app/**` (implementation)

If a conflict is found:
- treat the higher-precedence doc as canonical
- update the lower-precedence layer to match, or mark a clear TBD if unresolved

### Brain canonicalization rule (within brain)
Brain docs are allowed to be canonical for **implementation decisions** that are not specified by the walkthrough (e.g., module layout, dependency injection strategy), but MUST:
- label them as "Implementation decision"
- explain why the decision is compatible with walkthrough intent
- be centralized (one canonical home) to avoid duplication

---

## What Belongs in Brain (Scope Boundaries)

Brain files SHOULD contain:
- architecture choices (modules, layering, ownership)
- domain entities and state (data models + serialization rules)
- state machines and flow steps (preconditions -> actions -> side effects)
- IO boundaries (APIs, filesystem, database, secure storage)
- concurrency model (threading, async patterns, cancellation)
- error taxonomy + user messaging rules
- privacy/security constraints that affect implementation
- test plan and invariants (what must never regress)

Brain files SHOULD NOT contain:
- long narrative user journeys (belongs in walkthrough)
- speculative product features (belongs in walkthrough TBD / parking lot)
- large runnable code dumps (belongs in `/app/**`; brain can include small spec-like snippets)

---

## Naming, Organization, and Linking Rules

### Brain folder
- Brain docs live under `/brain/**` (real folders allowed).
- Prefer a **flat** `/brain` initially; introduce subfolders only when a cluster becomes hard to navigate.

### File naming (recommended; stable sorting)
Use the walkthrough-compatible pattern:
- `DD(.DD)*_UPPER_SNAKE_CASE.md`

Reserved:
- `/brain/00_TRANSLATOR_PLAN.md` -- the mapping and build-order plan (meta; not a feature brain file).

Numbering strategy (pick one; be consistent):
1) **Sequential by authoring build order (recommended)**
   - `01_*`, `02_*`, `03_*`, ... in the order listed in `/brain/00_TRANSLATOR_PLAN.md`
2) **Category ranges (optional; useful when the Brain grows large)**
   - `01.*` Foundation / architecture / glossary
   - `10.*` Domain + state
   - `20.*` Services/runtime
   - `30.*` Integrations (APIs, external services)
   - `40.*` UI/navigation/screens
   - `50.*` Consistency systems (checks, validations)

### Cross-linking and traceability (mandatory)
Every Brain file MUST include a **Sources** section that links to the walkthrough docs it was derived from.
- Use relative links (e.g., `../walkthrough/02.01_SYSTEM_OVERVIEW.md`)
- Prefer listing the most canonical System docs first (02.*), then Journey docs (01.*)

Every Brain file MUST include **Related Brain Docs** links for direct dependencies (3-10; avoid giant maps).

---

## Standard Brain File Template (Required)

Brain files MUST use this top-level structure (H2 headings). Additional detail goes under H3/H4.

```md
# <NN.NN -- Title>

## Purpose

## Scope (In / Out)

## Sources (Walkthrough)
- <links to `walkthrough/*.md`>

## Owned Decisions (Implementation Source of Truth)
- <what is canonical here vs delegated elsewhere>

## Terminology & Invariants
- <terms; link to `walkthrough/02.01_SYSTEM_OVERVIEW.md` for shared glossary>

## Data Model & State
- Entities (data structures, serialization shapes)
- State machines (if any)

## Flows (Step-by-Step)
- Preconditions -> triggers -> steps -> side effects -> persisted state updates

## Error Handling & Recovery
- Error taxonomy, user messaging, retry/rollback semantics

## Concurrency & Performance
- Threading/async patterns, cancellation, backpressure

## Storage & IO Boundaries
- Database, filesystem, secure storage, network clients

## Security & Privacy
- Sensitive data handling, logging redaction, on-device-only constraints

## Code Map
- Modules/packages
- Key classes/interfaces
- Public APIs and ownership boundaries
- Suggested file paths

## Test Plan
- Unit tests, integration tests, and "golden" invariants

## Open Questions / TBD

## Change Log (append-only)
- YYYY-MM-DD: <what changed and why>
```

Notes:
- The **Code Map** section is mandatory; brain without code ownership causes drift.
- "Owned Decisions" must be explicit: either this file is canonical, or it links to the canonical home.

---

## Technology Specificity Rules (How Detailed Brain Must Be)

"Low-level technical" means Brain should specify **implementable** details. The level of detail depends on the tech stack defined in `seed/PROJECT_DEFINITION.md`.

For any technology, Brain docs should specify:
- Component responsibilities and navigation/routing
- State management approach (UI state, events, side effects)
- Data access patterns (APIs, filesystem, database)
- Serialization strategy for data contracts
- Service lifecycle and background processing (if applicable)
- Error models and user-facing messaging rules

When you mention a technology concept, specify its likely artifact in the project's chosen stack.

---

## Translation Discipline (Walkthrough -> Brain)

### Canonical-source discipline
- System docs (02.*) are canonical for mechanics/contracts/terms.
- Journey docs (01.*) are canonical for UX ordering and what the user sees.
- Brain must reconcile both into implementable behavior, without inventing new product meaning.

### Ambiguity handling (mandatory)
If the walkthrough is missing an implementation-critical detail:
- Add a **single** "Assumption" bullet under the relevant Brain section and record it in Change Log, OR
- Add a single question under **Open Questions / TBD** with:
  - the exact missing decision
  - the smallest set of options
  - a recommended default (if safe)

### No-duplication rule
If a concept is shared across multiple brain files, it must have:
- one canonical Brain home, and
- all other Brain files summarize + link back

---

## Quality Checks (Brain Doc DoD)

A Brain file is acceptable when:
- Sources are linked and correct
- Owned Decisions are explicit (no hidden "source of truth")
- Data model/state is concrete enough to implement
- Flows include preconditions and persisted state updates
- Error handling defines user messaging and recovery
- Code Map names the owning modules/files
- Open questions are explicit (no implied behavior)

---

## How Future AIs Should Use This Protocol

When generating or updating code:
1) Read `/brain/00_TRANSLATOR_PLAN.md` to choose the next Brain file to author/update.
2) Author/refresh the Brain file to template compliance and fill in missing implementable detail.
3) Generate code only for the owned scope of that Brain file.
4) If code changes behavior, update Walkthrough first (or add a clear TBD), then Brain, then code.

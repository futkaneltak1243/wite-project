# BRAIN_AUTHORING_PROTOCOL.md

## Purpose

This protocol defines how we author and maintain **Brain** docs for the GhostBuilder project under `/brain/**`.

Brain docs are **low-level technical implementation explanations** authored primarily for **AI consumption** so future AIs can:
- generate/modify Kotlin/Android code with minimal guesswork
- keep code aligned with the approved product intent (Seeds + Walkthrough)
- prevent drift by making ownership boundaries explicit (what is canonical where)

This protocol is about **how to write Brain docs**. Product behavior remains defined by:
- `seed/PROJECT_DEFINITION.md` (baseline product spec)
- `walkthrough/02.*` System docs (canonical mechanics/contracts/terms)
- `walkthrough/01.*` Journey docs (canonical user-facing ordering)

---

## Brain → Code (Core Concept: Read This First)

### Mental model
- **Walkthrough** = *What the product must do* (user journeys + canonical system mechanics; no runnable code).
- **Brain** = *How we will implement it* (architecture, modules, data models, state machines, IO boundaries, error strategy).
- **Code** = *The concrete Kotlin/Android artifacts* (classes, functions, resources, manifests, Gradle).

Brain exists to bridge the two failure modes that cause drift:
1) Implementing from walkthrough alone → ambiguous design choices leak into code.
2) Implementing from code alone → behavior deviates from the walkthrough intent over time.

### How Brain drives code generation (expected workflow)
1) **Create/Update Brain docs first**, until each brain file contains enough detail to implement its owned behaviors without rereading the entire walkthrough.
2) **Generate code by “code ownership”**:
   - each Brain file MUST declare which packages/classes it owns (see template)
   - code changes MUST be mapped back to a Brain section (or the Brain updated)
3) **Implement in dependency order** (data/state → services → UI), keeping diffs small and reviewable.
4) **Run checks and keep traceability**:
   - when code changes imply behavior changes, update walkthrough first (or mark as TBD), then brain, then code.

### Alignment rule (non-negotiable)
Brain docs MUST NOT introduce new product behavior that contradicts Seeds/Walkthrough. If something is ambiguous:
- prefer a safe inference and label it explicitly as an assumption, OR
- record a single open question with the minimum needed clarification

---

## Precedence and “Source of Truth” Rules

### Product behavior precedence (highest → lowest)
1) `seed/PROJECT_DEFINITION.md`
2) `walkthrough/02.*` System docs
3) `walkthrough/01.*` Journey docs
4) `/brain/**` (implementation plan)
5) `/app/**` (implementation)

If a conflict is found:
- treat the higher-precedence doc as canonical
- update the lower-precedence layer to match, or mark a clear TBD if unresolved

### Brain canonicalization rule (within brain)
Brain docs are allowed to be canonical for **implementation decisions** that are not specified by the walkthrough (e.g., package layout, DI strategy), but MUST:
- label them as “Implementation decision”
- explain why the decision is compatible with walkthrough intent
- be centralized (one canonical home) to avoid duplication

---

## What Belongs in Brain (Scope Boundaries)

Brain files SHOULD contain:
- architecture choices (modules/packages, layering, ownership)
- domain/entities and state (Kotlin data models + serialization rules)
- state machines and flow steps (preconditions → actions → side effects)
- IO boundaries (GitHub/network, filesystem workspace, Room DB, secure storage)
- concurrency model (coroutines, flows, dispatchers, cancellation)
- error taxonomy + user messaging rules (dominant reason + primary action, etc.)
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
- `/brain/00_TRANSLATOR_PLAN.md` — the mapping and build-order plan (meta; not a feature brain file).

Numbering strategy (pick one; be consistent):
1) **Sequential by authoring build order (recommended for GhostBuilder v1 Brain)**  
   - `01_*`, `02_*`, `03_*`, … in the order listed in `/brain/00_TRANSLATOR_PLAN.md`
2) **Category ranges (optional; useful when the Brain grows large)**  
   - `01.*` Foundation / architecture / glossary  
   - `10.*` Domain + state (project state, file lifecycle, checks)  
   - `20.*` Services/runtime (session, voice, commands)  
   - `30.*` Integrations (GitHub OAuth/API, AI backend + JSON contracts)  
   - `40.*` UI/navigation/screens  
   - `50.*` Consistency systems (check engine, fix/update plans)

### Cross-linking and traceability (mandatory)
Every Brain file MUST include a **Sources** section that links to the walkthrough docs it was derived from.
- Use relative links (e.g., `../walkthrough/02.21_PIPELINE_STAGE_MANAGER_AND_STAGE_COMPLETION.md`)
- Prefer listing the most canonical System docs first (02.*), then Journey docs (01.*)

Every Brain file MUST include **Related Brain Docs** links for direct dependencies (3–10; avoid giant maps).

---

## Standard Brain File Template (Required)

Brain files MUST use this top-level structure (H2 headings). Additional detail goes under H3/H4.

```md
# <NN.NN — Title>

## Purpose

## Scope (In / Out)

## Sources (Walkthrough)
- <links to `walkthrough/*.md`>

## Owned Decisions (Implementation Source of Truth)
- <what is canonical here vs delegated elsewhere>

## Terminology & Invariants
- <terms; link to `walkthrough/02.01_SYSTEM_OVERVIEW.md` for shared glossary>

## Data Model & State
- Entities (Kotlin data classes; JSON/DB shapes)
- State machines (if any)

## Flows (Step-by-Step)
- Preconditions → triggers → steps → side effects → persisted state updates

## Error Handling & Recovery
- Error taxonomy, user messaging, retry/rollback semantics

## Concurrency & Performance
- Coroutines/Flow usage, dispatchers, cancellation, backpressure

## Storage & IO Boundaries
- Room / DataStore / filesystem workspace / secure storage / network clients

## Security & Privacy
- Sensitive data handling, logging redaction, on-device-only constraints

## Code Map (Android/Kotlin)
- Packages
- Key classes/interfaces
- Public APIs and ownership boundaries
- Suggested file paths

## Test Plan
- Unit tests, integration tests, and “golden” invariants

## Open Questions / TBD

## Change Log (append-only)
- YYYY-MM-DD: <what changed and why>
```

Notes:
- The **Code Map** section is mandatory; brain without code ownership causes drift.
- “Owned Decisions” must be explicit: either this file is canonical, or it links to the canonical home.

---

## Kotlin/Android Specificity Rules (How Detailed Brain Must Be)

“Low-level technical” means Brain should specify **implementable** details such as:
- Compose screen responsibilities + navigation inputs/outputs
- ViewModel state shape (UI state, events, effects)
- repository interfaces + data sources (Room, filesystem, network)
- JSON serialization strategy for `project_state.json` and AI contracts
- foreground service lifecycle hooks, notification actions, and permission gates
- error models (sealed classes) and user-facing messaging rules

When you mention an Android concept, specify its likely artifact:
- “foreground service” → `Service`, notification channel, actions, lifecycle and stop semantics
- “OAuth token storage” → `EncryptedSharedPreferences` or Jetpack `Security` + explicit threat model
- “Room catalog” → `@Entity`, DAO APIs, migrations, and read performance expectations

---

## Translation Discipline (Walkthrough → Brain)

### Canonical-source discipline
- System docs (02.*) are canonical for mechanics/contracts/terms.
- Journey docs (01.*) are canonical for UX ordering and what the user sees.
- Brain must reconcile both into implementable behavior, without inventing new product meaning.

### Ambiguity handling (mandatory)
If the walkthrough is missing an implementation-critical detail:
- Add a **single** “Assumption” bullet under the relevant Brain section and record it in Change Log, OR
- Add a single question under **Open Questions / TBD** with:
  - the exact missing decision
  - the smallest set of options
  - a recommended default (if safe)

### No-duplication rule
If a concept is shared (e.g., `ProjectState`, “Paused”, “Proceed/Approve”), it must have:
- one canonical Brain home, and
- all other Brain files summarize + link back

---

## Quality Checks (Brain Doc DoD)

A Brain file is acceptable when:
- Sources are linked and correct
- Owned Decisions are explicit (no hidden “source of truth”)
- Data model/state is concrete enough to implement
- Flows include preconditions and persisted state updates
- Error handling defines user messaging and recovery
- Code Map names the owning packages/classes
- Open questions are explicit (no implied behavior)

---

## How Future AIs Should Use This Protocol

When generating or updating code:
1) Read `/brain/00_TRANSLATOR_PLAN.md` to choose the next Brain file to author/update.
2) Author/refresh the Brain file to template compliance and fill in missing implementable detail.
3) Generate code only for the owned scope of that Brain file.
4) If code changes behavior, update Walkthrough first (or add a clear TBD), then Brain, then code.

# WALKTHROUGH_AUTHORING_PROTOCOL.md

## Purpose

This protocol defines how we author and maintain GhostBuilder’s documentation set **as flat walkthrough files** while building GhostBuilder itself via a ChatGPT-style conversation.

The walkthrough must be:
- **human-readable**
- **technically precise**
- navigable via **indexes + cross-links**
- written to minimize ambiguity and prevent “guesswork” later when implementing.

---

## Scope and non-scope

### In scope
- How we structure and maintain the walkthrough file set (flat, virtual tree via numbering + indexes).
- How we decide what to author next (one primary file per iteration).
- How we keep vocabulary, cross-links, and templates consistent.
- How we record unknowns without inventing details.

### Out of scope
- Defining new product behavior that contradicts the baseline spec.
- Implementation code (the walkthrough is spec-level; no runnable code).
- Any “seed governance” rules beyond documenting what the product does.

---

## Critical baseline inputs (locked unless explicitly changed)

These are “do not drift” constraints for v1 walkthrough authoring:

- **Platform/stack (LOCKED):**
  - Android v1: Kotlin + Android/Jetpack APIs + Jetpack Compose
  - Desktop later: Compose Multiplatform

- **First-time user flow (v1, LOCKED):**
  1) User opens app → logs in to GitHub via OAuth inside the app.
  2) User creates a new project → **must create a NEW private GitHub repo**.
  3) Seeds setup + verify happens once per new project (must pass gate).
  4) User can open and “Continue building” the project any time later.
  - “Import old project” exists as a separate flow (Import button).

- **Commands usage (LOCKED):**
  - Commands are only usable **inside an active Continue building session**.

Baseline spec source-of-truth:
- `PROJECT_DEFINITION.md` is the baseline product spec.
- The walkthrough files clarify/expand it; they do not silently override it.

---

## Avoiding confusion: chat-authoring vs product behavior

GhostBuilder has two contexts that MUST NOT be mixed:

1) **Authoring the walkthrough in chat (what we are doing now)**
   - This protocol governs that authoring process.

2) **GhostBuilder (the product) building projects in-app**
   - The product’s behavior is specified in `PROJECT_DEFINITION.md` and the walkthrough files.

Rule:
- If a rule is about **how we author docs in chat**, it belongs in this protocol.
- If a rule is about **how the product behaves**, it belongs in Journey/System walkthrough files (and `PROJECT_DEFINITION.md`).

---

## Keyword meanings

- **MUST** = required for compliance.
- **SHOULD** = recommended; deviation requires a clear reason.
- **MAY** = optional.

---

## Walkthrough structure (flat list, virtual tree)

There are **no real folders**. Structure is represented by:
1) numbering prefixes (`01.02`, `02.07`, etc.)
2) index files that act like “virtual folders” (`00_INDEX.md`, `01.00_INDEX.md`, `02.00_INDEX.md`, etc.)

The walkthrough has two top-level views:

1) **Journey view (01.*)**
   - Narrative: what the user does/sees, phase ordering, “what happens next.”

2) **System view (02.*)**
   - Structural: components/contracts/state, mechanics, boundaries, failure modes.

### Canonical-source rule (duplication avoidance)
- **System view is canonical** for terminology, contracts, state/lifecycle mechanics, invariants, edge cases.
- **Journey view is canonical** for narrative ordering and phase framing.

Rule:
- If something is canonical in one view, the other view MUST summarize briefly and link to the canonical file.

---

## Required system anchor (non-optional)

`02.01_SYSTEM_OVERVIEW.md` is REQUIRED.
It is the canonical system map: components, responsibilities, boundaries, and top-level flows.

Maintenance rule:
- When a new component/module is introduced anywhere, `walkthrough/02.01_SYSTEM_OVERVIEW.md` MUST be updated to include it and link to the relevant deep-dive.

---

## File naming and numbering rules (flat file list)

### Required file pattern
Every walkthrough file MUST be named using:

`DD(.DD)*_UPPER_SNAKE_CASE.md`

Where:
- `DD` is a two-digit numeric segment (`00` to `99`)
- additional segments MAY be appended using dots
- after the numeric prefix, use `_UPPER_SNAKE_CASE` in ASCII only
- extension MUST be `.md`

### Index files (locked naming)
The following index filenames are locked and MUST exist:
- `00_INDEX.md` (global index)
- `01.00_INDEX.md` (Journey index root)
- `02.00_INDEX.md` (System index root)

Optional deeper sub-index files MAY exist:
- `DD(.DD)*.00_INDEX.md` (example: `02.01.00_INDEX.md`)

### View partition rule
- Journey files MUST begin with `01`.
- System files MUST begin with `02`.

### No-renumbering rule (strong)
Avoid renumbering once files exist.

**Insertion convention (preferred):**
- If you need to insert “between” existing numbers, create a deeper segment under the previous file.
  - Example: insert between `01.02_*` and `01.03_*` → create `01.02.01_*`
- This preserves existing filenames and keeps numeric sorting valid.

Renumbering MAY happen only if absolutely unavoidable, and then:
- all links MUST be updated
- indexes MUST be updated
- no “tombstone/redirect” files are allowed

---

## Index maintenance rules (navigation truth)

Indexes are navigation truth. Every walkthrough file MUST be linked from the right index.

### When to update indexes
Whenever a walkthrough file is added/renamed/removed, you MUST update relevant index file(s) **in the same iteration output**.

At minimum:
- `00_INDEX.md` for global navigation
- `01.00_INDEX.md` for Journey
- `02.00_INDEX.md` for System
- any relevant sub-indexes (`...00_INDEX.md`) if they exist

### Index entry format (locked)
Index entries MUST be:
- a Markdown link using the exact filename, plus
- a one-line summary

Example:
- `- [02.01_SYSTEM_OVERVIEW.md](02.01_SYSTEM_OVERVIEW.md) — Canonical system map: parts, responsibilities, boundaries, and flows.`

### Ordering
Index entries MUST be sorted by numeric prefix order.

---

## Cross-linking rules (bi-directional)

- Use relative Markdown links with exact filenames.
- Journey docs SHOULD include a **Related System Docs** section.
- System docs SHOULD include **Where the user sees this** pointers back into Journey View.
- Prefer linking to the most specific canonical doc rather than duplicating deep rules.

---

## Document templates (LOCKED)

### Journey doc template (01.*)
Journey docs MUST use these headings, in this order:
1) **Purpose**
2) **Where this fits**
3) **Key responsibilities / rules**
4) **Inputs & outputs**
5) **Edge cases / failure modes**
6) **Open questions / TBD**

### System doc template (02.*)
System docs MUST use these headings, in this order:
1) **Purpose**
2) **Responsibilities (what it owns / does)**
3) **Key Data & State**
4) **Main Flows (high-level)**
5) **Edge Cases / Failure Modes**
6) **Platform Notes**
   - `[ANDROID v1]`
   - `[DESKTOP vNext/TBD]`

---

## Content depth and “no runnable code” rule

- The walkthrough can be technical, but must remain readable and structured.
- Walkthrough docs MUST NOT include runnable implementation code.

Allowed:
- conceptual command grammar strings
- conceptual payload/data-shape blocks
- text-described state/lifecycle diagrams
- spec-like markdown blocks

Rule:
- Examples MUST be clearly conceptual/spec-like and SHOULD avoid being directly executable.

---

## Unknowns and TBD handling (anti-assumption rule)

- Do NOT guess missing details.
- If something is uncertain, explicitly mark it as TBD in **Open questions / TBD** (Journey) or the appropriate section (System).
- Document what is known vs unknown.

---

## Authoring workflow in chat (the iteration loop)

### Read-first rule (mandatory)
Before deciding what to author/update, you MUST read the minimal always-read set:
- `walkthrough/00_CANONICAL_CONTEXT_PACK.md`
- `walkthrough/04_WALKTHROUGH_PLAN.md`

Then read only what the specific change requires:
- the primary target file
- the relevant index root(s) (`walkthrough/00_INDEX.md` plus `walkthrough/01.00_INDEX.md` or `walkthrough/02.00_INDEX.md`)
- the target file’s direct canonical dependencies (follow its explicit “Related … Docs” links)
- `walkthrough/02.01_SYSTEM_OVERVIEW.md` when loaded terms/gates/invariants are involved
- `seed/PROJECT_DEFINITION.md` only when changing/adding product behavior

Do NOT re-read the entire repo by default. Full-repo scans are reserved for:
- changing canonical terms/global invariants, OR
- major information-architecture refactors.

### One primary MAJOR file per iteration (indexes exempt)
Per iteration, we choose **exactly one primary non-index file** for a **MAJOR update**:
- create exactly ONE new non-index file, OR
- improve/refactor exactly ONE existing non-index file

**Indexes are exempt** and may be updated as navigation housekeeping in the same iteration.

### MAJOR vs MINOR
- **MAJOR updates:** substantial rewrite/refactor/restructure of a file.
- **MINOR updates:** typos, wording tweaks, link fixes, tiny consistency updates, small missing sections.

Rule:
- MINOR updates MAY be applied to multiple files in the same iteration (including non-index files), in addition to the one primary MAJOR-update file.

---

## Stability / No-Churn Mode (Freeze-after-DoD)

This section is **authoring governance for the chat workflow**. It is NOT a product feature.

### Definition of Done (DoD) — “finished enough to freeze”
A file is DoD when ALL are true:
1) **Template compliance**
   - Journey files use the locked Journey template headings exactly.
   - System files use the locked System template headings exactly.
   - No extra top-level `##` headings beyond the locked template; any extras are demoted to `###` under the correct template section.
2) **Terminology alignment**
   - Terms match `02.01_SYSTEM_OVERVIEW.md` (Paused vs Blocked, SAFE/UNSAFE, Proceed/Approve/Reject/Fix, etc.).
3) **Navigation correctness**
   - File is linked from the correct index file(s).
   - Minimal cross-links exist (Journey ↔ System where relevant).
4) **No known contradictions**
   - No explicit contradictions with other already-authored/approved docs.

Note:
- In-app checks (if they exist) are ideal, but DoD in docs is allowed as long as content is consistent.

### Freeze rule
- Once a file reaches DoD, mark it internally as **FROZEN** (chat-authoring governance).
- Do NOT propose a FROZEN file again as the primary MAJOR-update file.

FROZEN files MAY still receive MINOR micro-fixes only when strictly necessary:
- navigation/link correctness
- locked-template mechanical compliance
- terminology alignment to `02.01` (mechanical wording only)

### Hard triggers (allowed reasons to unfreeze a file for MAJOR update)
A FROZEN file may become the primary MAJOR-update file ONLY if at least one is true:
1) Template violation remains (or was missed) and materially breaks the locked template rules.
2) A canonical term/rule changed in `02.01` and this file now contradicts it (not just different phrasing).
3) Navigation is broken (missing/wrong index link, wrong filename references) AND it can’t be solved as a MINOR micro-fix.
4) Post-approval check fails (in-app) and the fix requires more than a small patch.
5) User explicitly requests a major rewrite/refactor of that file.

When a HARD TRIGGER is used, the author MUST say explicitly:
- “Unfreezing <FILE> because trigger #X: <short reason>.”

### MINOR template micro-fix sweep (allowed across multiple files)
To prevent small issues from resurfacing:
- While doing an iteration, the author MAY apply MINOR micro-fixes to other files (including frozen files) if they are purely mechanical and low-risk:
  - heading text normalization to match the locked template exactly
  - demote extra top-level `##` to `###` under the correct template section
  - fix broken links / wrong filenames / missing index link
  - tiny wording alignment to match `02.01` terms (no new behavior)
- Micro-fixes MUST NOT introduce new concepts, restructure meaning, or expand scope.
- Always list every micro-fix file explicitly in the iteration output.

### Consistency Sweep Queue (avoid ripple-churn)
If an anchor update (especially `02.01`) implies ripple updates across many files:
- Do NOT immediately rewrite them.
- Instead, output a “Consistency Sweep Queue” list:
  - file name
  - what mismatch exists
  - whether it can be solved as a MINOR micro-fix later

Address items gradually:
- preferably as MINOR micro-fixes alongside future iterations, OR
- in a dedicated cleanup iteration where the ONE primary file is the highest-leverage queued item.

---

## One-question-at-a-time (when needed)
- Ask EXACTLY ONE question per message.
- Before asking, first decide whether it can be safely auto-decided.

### Optional Auto-Decision Rule (aggressive use)
Auto-decisions are allowed when they:
- are simple, UX-improving, non-code-impacting, and add no meaningful complexity, OR
- are already clearly stated in `PROJECT_DEFINITION.md` or approved walkthrough files.

Auto-decision escalation rule:
- If you think you need to ask a question, first attempt to auto-decide.
- If it can be auto-decided safely, do it and continue (no limit).

### Parking lot rule (mandatory)
If requirements/feature ideas come up that do NOT belong in the current file being authored/updated, you MUST add them to:
- `walkthrough/03_PARKING_LOT.md` (inside the walkthrough set)

Entries MUST use the fixed mini-template:
- Request:
- Why it doesn’t belong in the current file:
- Where it should go (existing file or “new file type”):

---

## Default subsystem expansion order (user-touched first)

When expanding System + Journey coverage, prefer this order unless there’s a higher-leverage gap:
- Auth/GitHub OAuth
- Project + Repo creation (new private repo per project)
- Import/Restore old project
- Seeds (editor + verify gate)
- Session lifecycle (audio policy, foreground service, notification controls)
- Commands (routing, per-command prompts/modes)
- AI interaction (selective history, prompts, proceed/fix loops)
- Local storage (workspace vs logs/transcripts rules)
- GitHub sync (push/pull, failure handling)

---

## Output format (when we output files in chat)

At the end of an iteration, output **only** the files created/updated in that iteration:
- the one primary non-index file (MAJOR update)
- any index updates
- any required MINOR consistency fixes

The iteration summary MUST include:
- Primary file (MAJOR): <one non-index file>
- MINOR micro-fixes (optional): <list of files and what changed>
- Consistency Sweep Queue (optional): <list of future micro-fix targets>
- Auto-decisions (reject by number): <numbered list>

For each file:
- print the filename on its own line
- then the full contents in a Markdown code block

---

## Self-check / Acceptance checks (before claiming “done”)

- Continuity: Journey reads in user-first order; no unexplained jumps.
- Coverage: Core journeys match the locked first-time flow, import flow, and “commands only in-session.”
- System Anchor: `02.01_SYSTEM_OVERVIEW.md` exists, defines canonical terms/map, includes Platform Notes, and stays updated.
- Expansion Loop: When subsystems expand, both Journey + System docs remain cross-linked and indexes stay correct.
- Structure: Index files exist and link to all authored files correctly.
- Consistency: No contradictory rules across files; terminology aligns to `02.01_SYSTEM_OVERVIEW.md`.
- Practicality: Android v1 assumptions align with Kotlin + Jetpack Compose; Desktop notes reference Compose Multiplatform where relevant.

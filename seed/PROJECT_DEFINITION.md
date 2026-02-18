# GhostBuilder (Android) — Project Definition (Boss-Friendly)

## Executive Summary

- GhostBuilder is an Android app that lets me build other software projects hands-free while I’m busy (like during long factory shifts).
- It’s voice-first and designed to keep working with the screen off and the phone locked **once a building session has been started**.
- The goal is predictable, auditable output: a deep walkthrough/spec, structured planning (“brain”) files, and then a real codebase — produced through small, controlled approvals.
- The process is stage-based (Seeds → Walkthrough → Brain → Code) and you cannot skip requirements.
- Read-only actions can happen immediately, but **any voice action that changes files, project state, or GitHub** happens only after GhostBuilder reads back what will happen and I confirm with “Proceed.”
- Each project syncs to its own private GitHub repo, and a project can be restored on a new phone by signing into the same GitHub account.
- Privacy is built-in: no audio recordings are kept; transcripts/logs stay on-device and are not uploaded — while the project workspace files sync to private GitHub.

---

## Project Description

GhostBuilder is an Android app that lets me build other software projects while I’m busy (for example during long factory shifts) by using a strict, voice-first collaboration workflow with an AI. The point is not “chatting with an AI,” but turning voice interactions into predictable, auditable project artifacts: a deep walkthrough/spec, structured brain files, and then a real codebase — all generated only through small controlled approvals so the output stays consistent and trustworthy.

The app is designed to work with the phone screen off. I can’t look at the screen during work, so GhostBuilder must read everything aloud and follow strict confirmation rules before it changes anything.  
**Important clarification:** GhostBuilder works with the phone locked **after I start the building session from the UI**.

### Who it’s for

- **Primary user:** me (single-owner only in v1).
- **Possible future use:** share with a few friends, but **sharing/collaboration is explicitly out of scope for v1** (possible v2 idea only).

### High-level idea

Each project inside GhostBuilder has:

1. **Seed files**: predictable “foundation” documents and protocols that define how the AI should behave and how project files should be authored.
2. **Walkthrough files**: a deep, user-journey-based explanation of the target app (the app I’m building).
3. **Brain files**: structured implementation planning that mirrors the walkthrough (requirements, data, flows, APIs, constraints) and is used to generate code.
4. **App codebase (`/app`)**: a real runnable project structure under `/app` (e.g., Next.js, React, Laravel, etc.), generated file-by-file with approvals.  
   **Note:** `/app` is the generated project output, not GhostBuilder’s own Android app code.
5. **State + logs**: a machine-readable state file (pushed to GitHub) plus local-only transcripts/logs for reviewing what happened.

> **Important expectation:** Until the **Code** stage is completed, `/app` may be incomplete and not runnable yet. It becomes runnable once the required code files are approved and the code stage is completed.

### Active project and sessions (how it works during a shift)

- I pick a project from the projects list (UI).
- That project becomes the **active project**.
- When I press **Continue building**, GhostBuilder opens a **focused session screen** and starts the hands-free listening service.
- While that session is active, the app is focused on that one project (you can’t switch projects from the UI until you stop the session).
- The listening service keeps running until I stop it explicitly:
  - **Stop Listening button** exists both **inside the app** and as a **persistent notification button**.
- If the app/service restarts unexpectedly, I must tap **Continue building** again to resume listening.

**Connectivity requirement:** GhostBuilder requires an internet connection during building sessions; if the connection drops, it stops and waits until I’m back online.

---

## Core user flows

### 1) Create a project

- I create a new project by entering a project name.
- GhostBuilder immediately creates a private GitHub repository for the project (under my personal GitHub account) using a sanitized slug derived from the project name:
  - The display name stays exactly what I typed.
  - The repo name is sanitized to meet GitHub rules.
- If the sanitized repo name already exists, GhostBuilder suggests a new unique repo name (e.g., adds “-2”) and asks for approval in an **on-screen confirmation dialog**.
- GhostBuilder makes an initial push with:
  - the empty required folder structure
  - a placeholder README (to be overwritten later once the target app is known)

**Why GitHub is required in v1:** It’s the safety backup and audit trail, and it enables restoring a project on a new phone.

**GitHub reliability rule:** If GitHub repo creation/initial push fails, **project creation is blocked** until GitHub succeeds.

**Projects list behavior:**
- The home screen shows just the list of projects (no stage indicators).
- I open a project to work on it; inside the project I see a **Continue building** button and a **Status** page.

**First-time setup:** On first use, I sign in with GitHub once and grant permission so GhostBuilder can create private repos and push commits on my behalf.  
**Account clarification:** GhostBuilder has **no separate user account system in v1**; it uses my GitHub sign-in as the identity for repo creation and restore.

### 2) Import seed files and verify them

**Built-in default seeds (editable):**
- Every new project starts with a built-in default seed pack already present under `/seed`.
- These default seed files are **editable**, so I can adjust them to fit the project instead of pasting everything from scratch.

**Seed import (initial on-screen setup):**
- If I want to replace or add seeds manually, I can still import seed files into `/seed` using copy-paste:
  - One file at a time: I choose a filename in a “New File” dialog and paste contents.

**Project explanation seed:**
- Seeds also include a “project explanation” file: a brief high-level description of the target app I’m building.
- Unlike other foundation protocol seeds, this file is specific to the project idea.
- It can be updated later using the normal approval workflow (it is not permanently frozen).

**Verify (required gate):**
- After seeds are set (default or manually edited/imported), I must tap “Verify.”
- Verification is required; GhostBuilder blocks progression until seeds are verified.
- Seed verification is per-project (not global).
- Failed verification does not force a reset; I keep existing seed files and fix/add missing ones, then verify again.
- Verification standards are built into the app (with default values) and are editable, but normally I won’t edit them.
- Verify is a **fully automatic checklist run** (no questions asked). It either passes, or it speaks/shows what is wrong.

**Boss-friendly meaning of “Verify seeds” (chosen wording):**
- “Checks the seed pack is complete and follows GhostBuilder’s built-in verification checklist (which you can edit if needed).”

**If seeds change later:**
- If I edit any seed file after verification, seeds stay verified as a historical fact, but:
  - GhostBuilder marks seeds as **unverified** for current progress, and
  - **blocks “Continue building”** until I run Verify again.
- It does **not** roll back the pipeline stage; it simply blocks continuing until seeds are re-verified.

**Verification audit trail:**
- GhostBuilder does not save a separate “verification report” file.
- But `project_state.json` records a timeline entry with a timestamp:
  - “Seeds verified: PASS/FAIL”
  - On FAIL, it includes only short error codes (no long content dumps).

### 3) Continue building (the deterministic pipeline)

After seeds are verified, I progress using the “Continue building” button (UI-only). GhostBuilder always resumes from the last unfinished step automatically.

Pipeline stages (v1):
1. Seeds added
2. Seeds verified
3. Walkthrough/spec drafted
4. Brain files generated
5. Code generated

GhostBuilder does not let me skip stage requirements:
- A stage can only be completed when all files belonging to that stage are Approved and I speak the explicit stage completion phrase.
- Stage completion phrases (v1):
  - “walkthrough complete”
  - “brain complete”
  - “code complete”
- If I say the phrase early, GhostBuilder refuses and tells me which files are still Draft.

---

## Walkthrough/spec authoring (deep project definition)

The walkthrough is not a single file. It is a structured folder tree under `/walkthrough` organized by user journeys/flows.

### Walkthrough structure rules

- `/walkthrough` contains a root index file: `/walkthrough/00_INDEX.md`
- Files and subfolders use dot-outline numbering to show hierarchy and ordering, cross-platform safe:
  - Example: `03.02.01_Core_flow.md`
- Folders can be recursively nested as needed (no hard depth limit).
- Every folder can have an index file:
  - `00_INDEX.md` at root
  - subfolders can use numbering like `03.01.00_INDEX.md` when relevant

**Safe housekeeping exception (explicit):**
- Index/TOC files are the only files that can be auto-updated without a separate “Proceed.”
- They update **only after I approve a related file**, and only for navigation/order (no meaning changes).

### Authoring workflow (walkthrough files, and later brain/code files too)

When I click Continue building, GhostBuilder proposes what to do next:
- create a new file, or continue an unfinished one
- which folder it belongs to
- suggested filename/path if creating new

To start the action, GhostBuilder reads back what it will do and I must confirm with **Proceed** (following the normal voice rules).

Authoring sessions are question-driven and approval-driven:
- The AI asks one question at a time and tries to keep answers simple (Yes/No or A/B/C/D…).
- Every line/section in the file exists because I answered a question and approved the result.
- While drafting, the AI writes short Q/A notes above the generated section to show why it wrote it (these notes are removed when you approve the file). Example:

  > **Q:** …
  >
  > **A:** …

- GhostBuilder reads both the question text and the generated content out loud.
- If I dislike the latest section, I say “Reject” to discard the last drafted section and redo.
  - Factory Mode: “Ghost reject done”
  - Quiet Mode: “Ghost reject”
- When the file is finished, I say “Approve” once (per file). Then GhostBuilder removes the Q/A notes, saves the clean file, and marks it Approved.

Walkthrough completion:
- The AI can say it believes the walkthrough is complete, but the walkthrough only becomes complete when:
  - all walkthrough files are Approved, and
  - I speak “walkthrough complete”
- Then GhostBuilder updates the project state.

---

## Brain files (implementation planning) and how they relate to walkthrough

Brain files are visible and editable Markdown files under `/brain`. Brain mirrors walkthrough flows and uses the same dot-outline numbering so sections match 1:1.

Brain organization:
- Brain uses a “mirrors flows” approach so each flow in the walkthrough has corresponding brain docs.
- Brain does not have a root `/brain/00_INDEX.md`, but subfolders can have index files (e.g., `03.02.00_INDEX.md`) when useful.
- Brain contains both:
  - global/shared brain docs (foundations, shared data rules, shared APIs, shared UI rules)
  - and per-flow mirrored brain docs  
  This prevents repeating global decisions in every flow and reduces contradictions.

Brain authoring uses the same authoring workflow as walkthrough:
- One file at a time, question-driven, with draft Q/A notes, and per-file “Approve” to finalize.

Brain completion:
- “brain complete” only works when all brain files are Approved. Then `project_state.json` is updated.

---

## Code generation under `/app` (real project output)

After brain is done, GhostBuilder generates the actual codebase under `/app`.

- The AI proposes the project stack and architecture split during the walkthrough stage (and I approve it there).
- In v1, each project has one stack/architecture only.

Code generation rules:
- Code generation follows the same file-by-file authoring workflow:
  - proposed path/name, one-question-at-a-time, drafts include Q/A notes, then “Approve” per file.
- For code files, draft Q/A notes are written inside comment blocks, so the code still runs; the notes are removed on approval.
- When generating code, GhostBuilder prefers creating new files and keeping edits to existing files as small as possible, so diffs are manageable by voice.
- `/app` should look like a normal GitHub project for the chosen stack, including structure like server/client if relevant.
- The repo has **one single README at the repo root**, including install/run instructions for the generated `/app` project (the placeholder README created at project start is updated later once the app is known).

---

## GitHub sync behavior

- Each project has one private GitHub repo.
- GhostBuilder does **one automatic initial push** when creating the repo. After that, syncing is **manual and batch**.

**Push flow:**
- Voice command: “push” (same voice rules as all other commands).
- When I trigger push, GhostBuilder:
  - reads a short summary of what changed since the last push (e.g., “3 files added, 2 modified”)
  - suggests a commit message by voice
    - I can approve it (“Approve”) or edit it using “Set message …”
    - after editing, GhostBuilder repeats the message and requires approval again
  - then requires a final “Proceed” before it actually pushes
- Push creates one single commit containing all changes since last push.

**What gets pushed:**
- GitHub contents include: `/seed`, `/walkthrough`, `/brain`, `/app`, and `/project_state.json`
- Local-only folders are excluded from GitHub via a generated `.gitignore`:
  - `/transcripts` (local-only)
  - `/logs` (local-only)

**Drafts on GitHub (manual push only):**
- Draft edits use side-by-side files: `File.md` and `File.draft.md`
- `.draft` files may appear in GitHub **only when I manually push**
- Drafts are temporary working copies; the approved file is the durable final.
- After approval, GhostBuilder:
  - removes the Q/A notes
  - updates the clean approved file
  - and automatically deletes the `.draft` file (cleanup, not data loss)

**Blocked push on consistency failures:**
- If a consistency check fails, progression is blocked and **push is also blocked** until issues are fixed.

**Restore from GitHub:**
- v1 includes a “Restore from GitHub” option (download/clone the repo back onto the phone).
- Restore requires signing into the **same GitHub account**.
- GhostBuilder then lists my private GhostBuilder repos so I can choose which project to restore.
- Restoring brings back the project workspace (seed/walkthrough/brain/app/state), but:
  - transcripts/logs are not restored and start fresh (they were never uploaded).

---

## What data the app stores

### Per-project files (in the project workspace)

- `/seed`: seed docs (built-in defaults, editable, plus any manual additions)
- `/walkthrough`: multi-file deep spec (approved outputs)
- `/brain`: multi-file planning docs mirroring walkthrough
- `/app`: generated codebase output
- `/project_state.json` (pushed to GitHub), contains:
  - state_version “1.0”
  - app_version (last writer)
  - pipeline stage tracking
  - file status map (Draft vs Approved)
  - approved stack + architecture decision (and later changes)
  - a timeline of high-level events with timestamps (approved file X, pushed commit, seeds verified pass/fail, etc.)
  - for seed verification FAIL, short error codes only

**Privacy clarification (explicit):**
- The `project_state.json` timeline contains **only high-level event labels and timestamps**.
- It does **not** contain the actual spoken words, prompts, transcripts, or full AI messages.
- It does **not** include file contents beyond what is already stored as the project files themselves.

### Local-only per-project data

- `/transcripts`: saved text transcripts per project (not pushed)
- `/logs`:
  - `audit.md`: action log summaries (not pushed)
  - `errors.md`: error log with short error codes (not pushed)
- Audio:
  - Raw audio is deleted immediately after transcription (no audio recordings saved).

---

## Roles and permissions

- Single-owner only. No multi-account system in v1 beyond GitHub sign-in.
- No extra app lock is required beyond normal phone security.

---

## Voice system (hands-free, screen-off)

### Voice modes

1. **Factory Mode (default)**
   - Always listening for wake word “Ghost” while the service is active.
   - Every command ends with “done”:
     - “Ghost … done”
   - One command per wake word.
   - Designed for noisy environments: strict boundaries, exact phrases.

2. **Quiet Mode (global setting)**
   - Still requires wake word “Ghost.”
   - No “done” requirement; capture ends after 2 seconds of silence.
   - One command per wake word.
   - Toggle by voice:
     - Quiet on: “quiet on” (spoken using whatever mode you are currently in)
     - Quiet off: “quiet off” (spoken using whatever mode you are currently in)

### Privacy clarification (wake word vs recording)

Even though GhostBuilder listens for a wake word, it does not continuously record or upload audio. It only captures a short command after the wake word, transcribes it, and deletes the audio immediately.

If GhostBuilder detects mostly noise or can’t confidently understand a command, it cancels that capture and goes back to waiting for the wake word.

### Readback, confirmations, and global safety rules

GhostBuilder reads back everything by voice.

**Global Safety Rules (voice actions):**
- Any voice action that changes files, project state, or GitHub requires:
  1) readback of what will happen  
  2) then “Proceed” (following the current voice mode rules)

**Proceed vs Approve (simple meaning):**
- **Proceed** = “go ahead and perform this change now”
- **Approve** = “this draft (or plan/message) is accepted as final”  
  (Approving a file finalizes it without an extra “Proceed.”)

**Read-only actions:**
- Read-only commands can run immediately after the wake word (no “Proceed”), such as:
  - read/open file, read status, local search, summarize, list files
- “Search” means searching within the project’s own files/folders (local search), not the internet.

**Destructive actions:**
- Example: deleting a file or folder
- Destructive voice actions require two-step confirmation:
  - GhostBuilder asks for confirmation twice
  - I must confirm with “Proceed” both times (following normal voice rules)

**UI actions (on-screen):**
- On-screen actions use normal confirmation dialogs (tap-confirm).
- Voice-specific “readback + Proceed” rules apply to voice actions.

### File reading controls (voice)

When reading a file aloud (screen-off):
- default reads top 40 lines
- supports:
  - “next”
  - “previous”
  - “stop reading”
- “stop reading” interrupts immediately.
- In Factory Mode, these still require the wake word and “done” every time.

Auto-repeat behavior:
- If I stay silent, GhostBuilder auto-repeats the readback after 10 seconds.

### Choosing files by voice

- I can say the filename.
- GhostBuilder searches for the best match.
- If more than one likely match exists, GhostBuilder reads the top options and I pick:
  - Factory Mode: “Ghost A done” (or B/C…)
  - Quiet Mode: “Ghost A” (or B/C…)

---

## Optional Auto-Decision Rule (optional feature)

GhostBuilder can optionally enable an “Auto-Decision” mode to speed up building while still staying controlled and reviewable.

- When this rule is on, the AI is allowed to make one or more decisions on its own **only if those decisions match an already-existing, editable checklist** inside the app.
- The AI does not apply these decisions silently. In the same response, it:
  1) clearly reads the auto-decisions out loud as a **numbered list** (“Auto-decisions: 1)… 2)…”)  
  2) then asks the next question (if there is one)
- These numbered auto-decisions are also written into the draft Q/A notes, so the reason and the exact choices are visible later.
- If I answer the question and then approve the draft, that approval also approves the auto-decisions in that same message (because they are part of the same draft and written into the Q/A notes).
- If I disagree with specific auto-decisions, I can reject only those decisions by number, for example:  
  - “reject decisions 2 3” (reject auto-decision #2 and #3)  
  Then the AI must redo only those rejected decisions.

---

## AI request design (predictable and parsable)

GhostBuilder and the AI communicate using a strict JSON contract. The AI never returns free-form text to the app.

Even though responses are strict JSON, the `speech` field contains normal human sentences that GhostBuilder reads aloud.

### Response envelope (high-level)

- Every AI response is one JSON object only, with:
  - schema_version “1.0”
  - response_id (unique)
  - speech (what the app reads aloud)
  - optional question (only one at a time; includes question_id)
  - optional commands (structured requests, e.g., request more files)
  - optional patch (structured patch operations)
  - optional requires (what confirmation word is required and in what mode)
- App ignores anything outside the known keys.

### Context strategy (no full chat history)

- The backend is stateless per request.
- The app sends a focused context pack:
  - `project_state.json`
  - relevant files for the current step
- The AI can request additional files using a strict JSON command (`REQUEST_FILES`).
- Decisions are remembered because they are stored in approved files and in `project_state.json`, not in a giant conversation log.

### Invalid AI responses

If the AI returns an invalid response (can’t be parsed / doesn’t match the expected format), GhostBuilder:
- reads a short error message
- auto-retries once
- if it still fails, it stops and waits for the user.

---

## Authoring session persistence

- In-progress authoring sessions must survive app restarts.
- The app stores a local-only session state file (gitignored and never pushed) so it can resume the current file authoring exactly where it stopped.

---

## Patches and diffs

- File changes are proposed as structured patch operations (create/modify/delete/rename).
- The app can render them into unified diffs for readback.
- Patch readback order:
  1. creates
  2. modifies
  3. renames/moves (including folder moves)
  4. deletes
- For each modified file, Ghost says “File X changed (N lines)” where N counts changed lines only, then reads the full diff.
- Very large patches are auto-split into smaller patches for manageable voice approvals.

---

## Consistency and update mode

### Consistency checks

- Consistency rules are built into the app (editable).
- A consistency check runs:
  - after applying an update plan
  - after approving each new file
  - when I click Continue building (especially after manual filesystem changes)
- If the check fails:
  - progression is blocked
  - Ghost reads the errors
  - then waits for my strict phrase “fix” to start the fix workflow

### Fix workflow

- Saying “fix” triggers the fix workflow.
- Fix requires readback + “Proceed” (same global rule).
- GhostBuilder proposes a fix plan; plan approval uses “Approve.”
- After applying fixes, another consistency check runs.

### Update mode

- If I change an approved decision (by editing files, approving patches that change meaning, or explicitly stating a decision change), GhostBuilder enters Update Mode.
- In Update Mode, GhostBuilder proposes an update plan touching only related files needed to keep everything consistent (walkthrough, brain, and app as necessary).
- Plan approval uses “Approve.”
- The plan and results are summarized into `logs/audit.md` (local-only).
- Consistency checks run after applying the plan and after approving each updated file.

---

## User interface (v1 minimum)

- Projects list (simple list).
- Project view:
  - file tree with folders and files
  - text editor with syntax highlighting (Markdown/JSON/code)
  - manual file/folder operations (create/rename/delete)
  - Continue building button
  - Status page (and “read status” voice command)
- These on-screen tools are mainly for times I can look at the phone; the voice workflow is what I use during shifts with the screen off.
- No advanced visual diff viewer required; voice readback + editor is enough.
- UI deletes require one confirmation (tap-confirm), while voice deletes follow the two-step destructive confirmation rule.

---

## Commands and prompt templates (editable system)

- Commands and their phrases are global (apply to all projects), with built-in defaults but editable.
- Each AI-backed command has an editable prompt template using simple placeholders (no conditionals/loops).
- GhostBuilder includes:
  - Reset to defaults
  - Test Command (dry-run) to validate the JSON schema response
- If editing a command prompt causes invalid JSON schema responses repeatedly, GhostBuilder reverts that command prompt to default after 3 failures.
- The app always injects non-editable base invariants (the strict JSON contract, safety rules, and one-question rule). Each command also has its own editable command-level system prompt/template layered on top.

---

## Non-functional requirements (privacy, security, reliability, performance)

### Privacy
- No audio storage; delete recordings immediately after transcription.
- Transcripts and logs stay local-only and are never pushed to GitHub.
- Backend stores no project content logs (no saved prompts/files/responses), only minimal operational logs (like error codes).

### Security
- OpenAI API key is never stored on device; only the backend holds it.
- Backend access is restricted to the signed-in owner account only.

### Reliability
- Foreground service + persistent notification for screen-off voice operation.
- Strict phrase matching and wake word to reduce accidental triggers.
- Hard blocking on consistency failures to prevent contradictions from accumulating.
- Authoring session persistence across app restarts.

### Performance/cost
- Focused context packs instead of sending full conversation history.
- Soft budget tracking with once-per-day over-budget warnings.
- Budget window is calendar-month based (resets on the 1st).

---

## Example session (Factory Mode, generic placeholder)

> Goal: create a simple walkthrough file section in a controlled way.

1. GhostBuilder: “I will create `/walkthrough/01.01_Overview.md` and draft the next section. Say ‘Proceed’ to continue.”
2. Me: “Ghost proceed done”
3. GhostBuilder: “Question: Should this overview describe the core goal of the app in one paragraph? Answer A) Yes B) No.”
4. Me: “Ghost A done”
5. GhostBuilder: “Drafted section. I will read it now… If you want to keep it, say ‘Approve’.”
6. Me: “Ghost approve done”
7. GhostBuilder: “Approved. Cleaning draft Q/A notes and saving the final file.”

---

## Summary

GhostBuilder is a voice-first Android project builder that turns short, controlled voice interactions into a full, consistent software project. It enforces predictability through seed verification, a strict one-question authoring workflow, explicit approvals, structured patch operations, and consistency checks. The result is a multi-file walkthrough, mirrored brain files, and a real codebase under `/app`, all synced to a private GitHub repo per project, while keeping transcripts and logs private on-device.

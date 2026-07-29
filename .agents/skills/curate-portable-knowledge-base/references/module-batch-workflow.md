# Module batch workflow

Use this after the user approves deep polishing across published modules. It coordinates one batch at a time without creating another module registry.

## 1. Sources of truth

- Read sequencing from tracked `knowledge/module-polish/plan.json` and verified batch history from tracked `knowledge/module-polish/progress.json`.
- Treat both as orchestration views, never module registries or content owners.
- Resolve requested slugs from the live publication registry configured by `kb.config.json` and follow its imports to real content owners.
- Store generated briefs/work packets only under configured module-polish `.runtime`; never commit or publish them.
- Never copy the public module list, count, project path, hosting ID, or URL here.
- Treat the plan as sequencing intent and live registries as implementation truth; pause if a mismatch changes scope.

## 2. Control task

Keep one user-facing control task. By default it is also the batch writer, while module analysts remain read-only subagents.

1. Run read-only `validate` and `status` before planning any action.
2. After explicit authorization, run `prepare next`, then `brief <batch> --json`.
3. Drive the batch through the CLI and report compact validation/Git/release evidence.
4. Do not advance the next batch until the active task reaches a verified seal.

Completion never authorizes the next batch. `prepare` requires the prior non-calibration batch's local seal receipt to match `HEAD`.

## 3. Optional batch worktree task

Create a separate worktree task only when the user explicitly requests it or the batch
needs stronger isolation. Dispatch the approved ID, clean base SHA, this Skill, and
project standards. Never split CLI state changes across two checkouts. After prior
release proof, the worktree may locally `seal` the completed dependency before `prepare`.

The batch task drives every mutating transition through `set-batch`, `set-module`,
`verify`, `finish`, then `seal`. It is the sole writer for content and
`progress.json`. Use live help/output for arguments; CLI failure is fail-closed. Do
not start another batch while it has unresolved writes, is unpushed, or awaits a
required deployment.

## 4. Per-module read-only analysts

Inside the batch task, spawn one bounded analyst per module, subject to concurrency.
Analysts may inspect the repository and browse primary sources, but must not edit,
stage, commit, push, deploy, create worktrees, or own task state.

Each analyst returns:

- the reader problem and main decision chain;
- definition, mechanism, failure, boundary, customer decision, and evidence gaps;
- adjacent overlap and proposed primary owner;
- affected Chinese, English, terminology, source, claim, test, and UI surfaces;
- dynamic facts needing current verification;
- additions, merges, removals, and unresolved questions.

Wait for all reports before the Evidence Gate. Replace one failed analyst or finish
its analysis in the batch task; never create a second writer.

## 5. Evidence Gate

Before editing, the batch task must:

1. deduplicate claims and customer questions by decision, not wording;
2. assign each shared concept one primary owner and keep only local consequences
   elsewhere;
3. verify dynamic facts with current primary sources and capture required evidence
   metadata and lifecycle state;
4. enumerate reverse references before replacing or splitting a stable source ID;
5. identify rewritten or removed historical questions and identity-hash effects;
6. classify findings as supported, evidence-needed, or excluded.

Pass only when evidence, ownership, boundaries, reverse references, and scope are
resolved; otherwise record `blocked` through the CLI and request the exact need.

## 6. Single-writer integration

After the gate, only the batch task writes. This includes publication/content
registries; Chinese curriculum, learning, QA, completion, and briefs; terminology;
public sources and private claims; English owners and review records; shared UI,
search, tests, Git state, release artifacts, and Sites deployment.

Before editing, inspect `git status --short` and planned files. On overlap, freeze
integration, preserve both diffs, and restore one owner. Never discard user work.

Integrate one coherent change. Follow project date policy; presentation-only edits
do not refresh dates, and rewrites do not receive a new-question date.

## 7. Independent English review

After canonical integration, spawn a fresh read-only reviewer that did not author
the Chinese prose. It reviews English directly from evidence and mechanisms, not
sentence-by-sentence translation.

It checks stable IDs and ordering, dates, terms, sources, mechanism and boundary
fidelity, numerical scope, professional US technical English, presales usefulness,
route/interaction parity, and shared-copy ownership. The batch task alone applies
accepted corrections. Generated review records synchronize hashes; they do not
replace independent review.

## 8. Targeted and full gates

Run the smallest relevant validation, overlap, bilingual, rendering, and changed-
surface tests plus `git diff --check`. Then regenerate and validate review records.

Run all full quality commands configured by `kb.config.json`; create no parallel
command registry. For visible changes, verify viewports, interactions, console, and
fresh load.

After `verify`, review and stage only the intended batch snapshot; `finish` runs the
full profile while progress remains `verified`, then atomically advances it to
`complete`. Restage that progress transition before the final diff and commit.
Targeted success never waives full gates. To repair a full-gate failure, resume the
verified batch with a recovery note, rerun targeted checks, restage, then rerun
`finish`. Pause on out-of-scope systemic failure.

## 9. Commit, push, and Sites

External mutation is permitted only when both the current request and project rules
authorize it. Analysts never receive release authority.

When authorized, the batch task:

1. reviews the final diff and required handoff checks;
2. commits the intentional batch and pushes the required branch or target;
3. proves upstream equals the exact local commit;
4. builds, saves, and deploys Sites from that pushed commit using the existing
   binding and live Sites workflow;
5. waits for `succeeded`, then checks representative public direct routes, language
   switching, interactions, and console state;
6. runs `seal` from the clean deployed commit. The RAG calibration batch is the only
   grandfathered dependency without a historical seal receipt.

An exact-commit release-check worktree validates; it neither edits nor proves deploy.

## 10. Automatic continuation

Within an explicitly started batch, continue without asking again when:

- work stays within named modules and approved adjacent contracts;
- primary evidence resolves dynamic facts;
- only normal implementation, review, repair, and verification remain;
- release authority is explicit and project rules require commit, push, or Sites.

## 11. Mandatory pauses

Record `blocked` through the CLI, pause execution, and request the exact decision when:

- the next batch was not explicitly started;
- plan slugs do not resolve live or scope is ambiguous;
- overlapping repository changes have no clear owner;
- a new module, major redesign, source-ID migration, or responsibility transfer
  materially expands scope;
- privacy, licensing, attachment authority, evidence, or freshness blocks release;
- destructive action, force push, branch replacement, or hosting-binding change is
  required;
- a full gate exposes an out-of-scope systemic defect;
- push succeeds but required Sites deployment or public verification fails.

Never complete the batch or advance the plan while pause or recovery remains.

## 12. State commands and reporting

The CLI persists validated state in `progress.json`; commentary only summarizes it:

```text
batch:  planned -> prepared -> in-progress -> verified -> complete
module: planned -> in-progress -> ready -> verified -> complete
either may enter blocked before complete
```

`seal` leaves tracked progress at `complete`; it verifies that state from a clean
committed `HEAD` and writes the commit receipt only to ignored runtime state.

After each CLI transition run `status` and emit:

```text
STATUS batch=<plan key> task=<id> base=<sha> branch=<name> state=<state>
latest=<gate/result> modules=<slugs> next=<automatic action or exact blocker>
```

Map user `STATUS` to the CLI `status`; map execution transitions through `set-batch`
or `set-module`. Only explicit `START <batch>` permits `prepare` and task creation.

## 13. Thread-tool fallback

Prefer compact wait snapshots; use read/send tools for precise follow-up and avoid
repeated full-history dumps. If wait is unavailable, poll sparingly. If send is
unavailable, continue only from already delivered instructions and report the limit.

The default current-task flow relies on a frozen clean Git baseline and read-only
subagents; it does not claim filesystem isolation. Never emulate worktrees with
destructive shell commands.

## 14. Failure recovery

- Resume the same batch task; do not create a duplicate writer.
- If unreadable, reconstruct from base SHA, branch, state, and diff before replacement.
- On overlap, freeze writers, inventory both sides, select one owner, and reapply.
- On gate failure, repair the responsible layer, rerun that gate, then full gates.
- On divergence, inspect commits/upstream; never force push without exact authority.
- On release failure, preserve pushed SHA/artifact, report the stage, and retry.
- On completion, run `verify`, `finish`, then `seal`; await the next explicit `START`.

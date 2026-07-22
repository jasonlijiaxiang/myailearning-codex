# Handoff audit

Read this reference before a formal internal handoff, any external redistribution, or a source-level portable package.

## Declare the delivery boundary

- Name the intended audience as `internal` or `external`; never infer external redistribution rights from repository access, a public URL, a chat, or the existence of an attachment.
- Treat `internal` as the default local handoff audience. Unknown attachment authorization remains visible as a warning; it is not proof of permission.
- Require explicit per-attachment authorization before `external` packaging. A missing record, unknown owner, unclear license, or scope that does not include external redistribution is blocking.
- Bind authorization to the attachment's canonical project path and exact SHA-256. Generate the digest with `shasum -a 256 <path>` on macOS or `sha256sum <path>` on Linux; copy the lowercase 64-character value into the policy only after reviewing that exact file.
- Any byte change, including a same-path replacement or metadata edit, invalidates the old authorization. Recompute the digest, review the changed file, and record a new authorization decision; never copy the old digest forward mechanically.
- Keep personal hosting bindings, private inbox data, environment files, Git history, dependencies, caches, and machine-local paths outside the default archive.

Apply the audience to the actual distribution surface:

- an internal portable ZIP may use `internal`, where unknown attachments remain visible warnings;
- a public source repository exposes every committed attachment and therefore requires `external` authorization for the full source tree;
- a public Sites release audits the staged deploy artifact itself. Source attachments omitted from `dist` are not part of that Sites distribution, while any attachment bytes copied into the artifact require `external` authorization.

Run the formal pre-share sequence:

```bash
npm run kb:handoff-audit -- --audience internal
npm run kb:release-check -- --mode local --audience internal
npm run kb:package -- --audience internal
```

Use `external` only after the attachment policy records explicit authorization for every included attachment. Review the generated `PORTABLE-MANIFEST.json` and SHA-256 sidecar from the exact archive.

## Inventory attachments without rewriting them

- Enumerate every included attachment under the configured attachment roots, including nested files.
- Resolve its authorization state and allowed audiences from the attachment distribution policy only when both path and SHA-256 match.
- Inspect embedded author-facing metadata where the format permits it: creator, last modifier, company, manager, speaker-note count, and embedded-file count.
- Report unknown authorization and embedded personal attribution before sharing. Do not silently strip, normalize, or rewrite source attachments; obtain authorization, replace the file, exclude it, or deliberately accept the internal warning.
- Treat attachment metadata inspection as best effort, not as a malware scanner or a substitute for ownership review. Opaque archives and unsupported formats still require human review.

## Audit source splits and replacements in reverse

Before splitting, renaming, or replacing a stable `sourceId`:

1. Inventory every reverse reference from module content, customer questions, deep answers, evidence cards, claims, candidates, releases, aliases, tests, and maintenance notes.
2. Define the successor source IDs and the exact claim each successor supports.
3. Update all active references in the same change. Preserve the old ID only in explicit replacement history when that history has decision value.
4. Search again for the old ID and classify every remaining occurrence. An unexplained active reference is blocking.
5. Recheck the affected module, related questions, evidence cards, Reference grouping, and claim lifecycle together.

Do not declare a source migration complete merely because the new source exists or the main module renders.

## Watch announced futures and release candidates

- Treat an officially announced future version, planned effective date, preview, beta, or release candidate as a change signal, not as generally available behavior.
- Record a scoped `watch` claim with the announced target, current status, source, verification date, and a review trigger at or before the announced milestone.
- Recheck immediately when the final release, delay, withdrawal, breaking change, or replacement is announced; the ordinary 30/90/180-day cadence is only a maximum backstop.
- Keep current and future behavior visibly separate in modules, questions, and evidence. Do not rewrite an RC or roadmap into a present-tense capability claim.

## Review semantic near-duplicates across modules

- Search across module bodies, questions, boundaries, exercises, and evidence summaries for concepts that make the same decision under different wording.
- Use lexical or embedding similarity only to produce candidates. A human must decide whether two passages are duplicates, complementary perspectives, intentional cross-links, or distinct module-specific decisions.
- Merge the canonical explanation into its primary owner, retain module-specific consequences where they differ, and link related modules instead of copying full explanations.
- Verify that a merge does not remove a necessary boundary, customer question, acceptance criterion, or module-specific action.

Record a concise no-op when the review finds no meaningful duplication; do not rewrite content merely to make wording different.

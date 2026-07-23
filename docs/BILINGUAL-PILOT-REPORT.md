# English knowledge-base pilot report

> Historical checkpoint: this three-module pilot was the acceptance baseline for the later 21-module English edition. Its remaining-gates table is superseded by `ENGLISH-ULTRA-ADJUDICATION.md`, the complete English audit, and the stored four-stage review records; the scope and verdict below should not be read as the current edition status.

Date: 2026-07-22

## Decision

- Local three-module pilot: **REVISE**
- Public English release: **BLOCK**
- Scope: **3 of 21 modules** — Retrieval-Augmented Generation, Model Landscape, and AI Governance
- Coverage: 50 customer questions, 14 evidence cards, 27 shared terms, and 40 shared sources

The pilot proves that a Sol xhigh authoring and cross-review stage followed by Ultra exception adjudication can produce a useful English knowledge layer without line-by-line human approval. It does not prove that an unreviewed 21-module English site is ready for public release.

## Implemented pilot

- Reuses the Chinese fieldbook's page structure, shared React components, typography, spacing, cards, tables, question patterns, and global CSS; English does not maintain a separate visual system.
- Added `/en`, `/en/modules/<slug>`, `/en/questions`, `/en/glossary`, and `/en/references` pilot routes.
- Added reciprocal language links for the three pilot modules.
- Kept terminology IDs, source IDs, question evidence relationships, evidence-card relationships, and `addedAt` values aligned with the Chinese canonical content.
- Added English-only stable section, question, evidence, and content-item IDs.
- Added deterministic bilingual tests and a bilingual-review schema.
- Marked the English subtree `noindex` and clearly labelled it as a 3-of-21 pilot.

## Model workflow used

1. Sol xhigh independently authored the three English modules.
2. Three Sol xhigh reviewers cross-reviewed modules they did not author.
3. Deterministic gates checked question order, evidence relationships, terminology and source IDs, stable IDs, Chinese residue, routes, and language links.
4. Ultra reviewed only exceptions and cross-module engineering risks.
5. Ultra findings were fixed where they were safe inside the isolated pilot, then rechecked in a production build and browser.

## Resolved during review

- Corrected evidence scope, governance wording, revocation semantics, query-decomposition boundaries, stable terminology labels, and unnatural English phrasing.
- Removed Chinese source kinds and short titles from English module pages.
- Restored missing table row titles and table-level source links.
- Removed duplicate rendered `evidence` and `qa` IDs.
- Narrowed two Model Landscape evidence cards to the single provider source each card actually cites.
- Added `test:bilingual` to the standard `npm test` gate.
- Added logical review-schema constraints so deterministic failure cannot coexist with a publishable verdict.
- Displayed question `addedAt` metadata and changed glossary calls to action to open related modules.

## Remaining release gates

| ID | Pilot | Public release | Required resolution |
| --- | --- | --- | --- |
| BIL-001 | Accept | BLOCK | Add canonical question IDs to the Chinese owners and align both locales by ID rather than array position. |
| BIL-002 | Accept with explicit limitation | BLOCK | Move locale trees to route-group root layouts so English responses emit `<html lang="en">`; the current nested `lang="en"` does not replace root `zh-CN`. |
| BIL-003 | Revise | REVISE | Add independent English publication metadata and show the English module update date once. |
| BIL-004 | Accept | Accept | The shared shell preserves content and evidence; dedicated visual parity can follow later. |
| BIL-005 | Accept | Accept only as a labelled pilot | Keep 3-of-21 and `noindex`; never describe this as the complete English edition. |
| BIL-006 | Accept | BLOCK | Move stable section, question, and evidence IDs into canonical owners, then derive both locales from them. |

Additional work before public release:

- Choose and enforce one English editorial standard across all modules; the pilot currently mixes US and UK spelling.
- Generate, store, and validate review records against the bilingual-review contract rather than only validating the contract structure.
- Expand English questions, glossary, references, and modules together as each additional module graduates.

## Verification

- `npm run lint` — PASS
- `npm run test:bilingual` — PASS (9/9)
- `npm test` — PASS (the standard suite now includes bilingual tests)
- `npm run kb:validate` — PASS
- `npm run build` — PASS
- `git diff --check` — PASS
- Browser desktop 1366×768 — no horizontal overflow; language switch, question expansion, and question search exercised
- Browser mobile 390×844 — no horizontal overflow
- Browser post-Ultra check — 45 RAG table rows retain titles; English source labels contain no Chinese; rendered `#evidence` and `#qa` are unique

## Delivery boundary

This pilot lives in an isolated local worktree so it does not mix with the 41 files already staged in the main workspace. It has not been committed, pushed, indexed, or published. Merge and public release should happen only after the main staged baseline and the blocking canonical-ID/root-layout decisions are resolved.

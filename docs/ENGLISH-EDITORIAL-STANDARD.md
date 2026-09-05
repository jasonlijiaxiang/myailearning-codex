# English edition editorial standard

## Purpose

The English edition is a parallel professional knowledge layer, not a sentence-by-sentence translation of the Chinese edition. Both editions share the same module identities, concept IDs, source IDs, evidence relationships, and publication boundaries, while English explanations are written and reviewed independently.

## Source-first writing

1. Read the canonical module contract to preserve scope, question order, evidence relationships, dates, and customer intent.
2. Reconstruct technical explanations from the cited primary or official source and the underlying mechanism.
3. Write the English claim directly in the language used by the relevant technical field.
4. Compare the result with the Chinese module for semantic coverage, not sentence similarity.
5. Escalate disagreements between the source and either language version; never translate the disagreement away.

## Terminology

- `app/terminology.mjs` owns the stable English name and abbreviation for every shared concept ID.
- Prefer terms used in primary specifications, standards, research papers, and official product documentation.
- Preserve protocol, framework, API, and model names exactly.
- Explain overloaded terms at first use and state the operational meaning used by the module.
- Use American English for editorial prose. Preserve an official source title as published.

## Direct technical prose

- Write the English argument from the technical mechanism and the cited source, not from the word order, noun stacks, or rhetorical cadence of the Chinese copy.
- Prefer an explicit actor and verb over a compressed noun chain. Split a sentence when it carries more than one mechanism, control, or decision.
- Use ordinary lowercase nouns for generic `tool`, `agent`, `gateway`, `server`, `client`, `run`, and `memory`. Capitalize `Tools`, `Resources`, and `Prompts` only when referring to MCP's named protocol primitives; preserve product and official API names exactly.
- Do not use a blanket synonym for `accepted`, `successful`, or `conforming`. Name the validation boundary: infrastructure measures SLO-satisfying Goodput; an application reports a task that meets stated criteria; a business result is authoritatively confirmed; and a data product is usable only under its declared quality and lifecycle conditions.
- Keep a technical boundary direct: say what a control does, what it does not establish, and who or what validates the remaining decision. Avoid future-sounding answers such as `Not yet` when the correct answer is a present limitation.

## Reader-facing copy

- Let the route, language switch, and prose establish the language; do not repeat `English edition`, `in English`, or `available in English` as decorative labels.
- Use scarce interface space for knowledge structure and reader value: module count, knowledge-layer count, reading role, evidence boundary, or next action.
- Keep locale and bilingual implementation language in metadata, internal contracts, and editorial documentation only when it serves discovery, accessibility, or maintenance.

## Evidence and claims

- Dynamic product, regulatory, benchmark, and standards claims require current primary or official evidence.
- Distinguish a documented capability from a measured result, and a measured result from a customer-specific commitment.
- Preserve numerical scope, units, populations, dates, and uncertainty. Do not make a claim broader or more current than its source.
- A source note must say what the source supports and what it does not establish.
- Customer answers follow: short answer, technical detail, evidence and limits, recommended discovery question.

## Bilingual parity

The English module must retain:

- the canonical module slug and publication identity;
- required shared concept IDs and exact canonical English names;
- customer-question count and order;
- evidence source-ID order for each question;
- evidence-card count and source-ID order;
- `addedAt` values and stable English anchor IDs.

Parity does not require sentence alignment, identical paragraph structure, or literal translation.

## Review gates

1. Deterministic checks: completeness, IDs, source resolution, question and evidence parity, dates, no unexplained Chinese prose, and editorial spelling.
2. Technical review: terminology, mechanism, quantitative scope, source entailment, customer usability, and hidden translation drift.
3. Cross-module review: shared definitions and source notes must not conflict.
4. Exception adjudication: unresolved or high-impact disagreements receive the highest-capability review before release.

No model review converts weak evidence into a strong claim. If the source is insufficient, narrow the wording or record the issue as a release blocker.

For every completed English editing batch, add a targeted regression check for the corrected translation-drift patterns. The check should protect the professional wording and terminology boundary without treating a keyword match as a substitute for human editorial review.

`npm run audit:english:complete` verifies that the complete English module set is structurally sound. It is not an English-release certificate while any module remains `deferred` in `knowledge/localization/status.json`. Before releasing an English content update, run `npm run check:english-release`; it requires every affected module to complete independent writing and professional review, then move its status from `deferred` to `aligned` with an updated `enSyncedCommit`. Use `npm run localization:diff -- <slug>` to review the Chinese-side changes since the last English sync.

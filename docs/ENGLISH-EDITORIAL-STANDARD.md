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

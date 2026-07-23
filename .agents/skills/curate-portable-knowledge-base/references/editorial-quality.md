# Editorial quality

Read this reference when a capture may change public knowledge content.

## Build knowledge, not transcript summaries

- Identify the reader, prior knowledge, device, task, and decision before choosing structure.
- Organize the explanation as definition → mechanism → boundary or failure → application or decision → evidence and next action.
- Explain inputs, outputs, responsibility, lifecycle, causal relationships, failure modes, alternatives, and verification when they matter.
- Keep theory and formulae only when they change a real judgment. Explain the intuitive mechanism first.
- Use Chinese-first prose with accurate English terminology or abbreviations at first use when Chinese is the primary language.
- Prefer concrete nouns and ordinary verbs. Remove internal production language, template chatter, and vague consulting language from reader pages.

## Preserve appropriate knowledge density

- Create density through relationships, mechanisms, trade-offs, examples, evidence, and decisions rather than small text or crowded cards.
- Give the first laptop viewport a useful starting point, not a slide-deck cover.
- Use progressive reading: conclusion, mechanism, and boundary first; details, cases, diagnostics, and evidence next.
- Let knowledge determine the number of sections, diagrams, questions, examples, exercises, and sources. Never enforce a content quota for visual symmetry.
- Merge near-duplicate questions. Keep a question only when it changes architecture, risk, acceptance, communication, or next action.
- Review semantic near-duplicates across module bodies, questions, boundaries, exercises, and evidence summaries. Similarity scores may surface candidates but cannot decide equivalence: a human must distinguish duplicate decisions from complementary depth, intentional cross-links, and module-specific consequences.
- When merging, keep one canonical owner, preserve materially different boundaries or actions, and recheck every referring module. Do not manufacture wording differences merely to make duplicates look unique.

## Preserve publication and question chronology

- Keep a module's first-publication date (`introducedAt`) separate from its latest substantive revision date (`updatedAt`). A later edit never rewrites the first-publication date.
- Apply `addedAt` only to a whole question first introduced after the project's date policy took effect. Editing an existing answer, evidence, or wording does not make the question newly added.
- Bind pre-policy questions that intentionally lack `addedAt` to a stable identity baseline, such as a SHA-256 of the sorted, canonically normalized question-text set. A count is not an identity baseline: deleting an old question and adding an undated replacement with the same count must fail.
- Change that identity baseline only as part of an explicit audit of a real historical-question rewrite or removal. Never refresh it to admit a newly added question that omitted `addedAt`.

## Absorb external material correctly

- Treat PPTs, PDFs, whitepapers, and chats as coverage clues, not default facts.
- Map each useful item to a concept, relationship, case, risk, question, dynamic fact, target module, and source need.
- Decide whether to absorb and reorganize, independently expand, merge, redraw, split, defer, or omit with a reason.
- Share facts, terminology, boundaries, and sources across media; do not share slide order, card count, font scale, or narrative pacing.
- Keep web-native search, stable links, chapter navigation, progressive explanation, responsive behavior, evidence context, and continuous updates.

## Match representation to relationship

- Use a flow for sequence, data movement, or responsibility transfer.
- Use a cycle or state machine for feedback, retry, or recovery.
- Use a hierarchy for ownership and boundary.
- Use a matrix for comparable options under shared dimensions.
- Use a path or decision tree for attacks, failures, diagnosis, or selection.
- Use a timeline for lifecycle and release gates.
- Use prose or a simple list when no important relationship requires a visual.

Do not reduce every topic to the same card wall.

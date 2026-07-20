# Evidence and freshness

Read this reference whenever a knowledge change includes facts that may drift, source changes, product behavior, dates, measurements, or externally attributed claims.

## Evidence discipline

- Prefer primary sources: official documentation, standards, original research, product announcements, authoritative datasets, and directly reproducible experiments.
- Record what each source supports and what it cannot support.
- Bind quantitative claims to workload, model or product version, dataset, conditions, region, date, evidence type, and non-extrapolation boundary.
- Keep vendor experiments scoped to their tested configuration; never rewrite them as universal guarantees.
- Treat secondary sources and chat statements as discovery clues until corroborated.
- Keep C-grade evidence private or under review. Publish only adequately supported claims.

## Claim lifecycle

For each changeable claim, maintain:

- stable claim ID and complete statement;
- applicable scope and exclusions;
- stable source IDs and evidence grade;
- actual verification date;
- next review date;
- explicit maximum cadence of 30, 90, or 180 days, with the next review date inside that window;
- owner and lifecycle status;
- replacement or supersession link.

Use `active`, `watch`, `deprecated`, or `replaced`. Preserve replacement history internally while exposing only current reader-relevant information.

## Review cadence

Use the project policy unless its configuration says otherwise:

- 30 days for rapidly changing catalogs, prices, quotas, and product specifications;
- 90 days for protocols, APIs, platform capabilities, security guidance, and engineering documentation;
- 180 days for stable principles, research, methods, and architecture patterns.

These are maximum intervals. Recheck immediately after relevant announcements, standard revisions, broken sources, security events, or field evidence.

## Efficient freshness audit

1. Scan locally for overdue, invalid, replaced, or change-signaled claims and sources.
2. Verify only affected items online.
3. Update the claim, source, dependent content, related questions, and replacement history together.
4. Run content and release gates.
5. Report “all current” when nothing requires revalidation; do not perform indiscriminate browsing.

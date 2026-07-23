# Visual and release gates

Read this reference when public content, layout, interaction, packaging, Git state, or hosting may change.

## Preserve the established product

- Keep existing page structure, components, typography, spacing, palette, responsive behavior, and interaction patterns unless the user requests a redesign.
- Reuse shared dynamic layouts. Do not add module-ID CSS patches, fixed item-count branches, duplicated cards, or filler content.
- Protect long Chinese terms, numbers with units, abbreviations, headings, tables, and expanded answers from clipping or destructive wrapping.
- Keep knowledge pages anonymously readable and independent of login or personal session state.

## Layer the checks

1. Review content completeness, mechanism, boundaries, decision value, and topic specificity.
2. Review source resolution, claim scope, evidence grade, and freshness.
3. Run configuration, schema, route, link, build, lint, test, and arbitrary-count layout checks.
4. When visible output changed, inspect representative pages at laptop, tablet, and phone sizes. Include long titles, odd/even grids, expanded answers, tables, no-result states, focus, and return paths.
5. Use an un-warmed browser for home and a representative deep link. Check title, body, interaction readiness, console, fonts, and network behavior.
6. For slide output, render every slide and inspect word breaks, table compression, clipping, collisions, and hierarchy; overflow automation alone is insufficient.

Do not treat HTTP 200, a successful build, a test count, a slide count, a saved version, or a Git push as sufficient user-facing proof.

## Portable handoff

- Declare `internal` or `external` distribution and run the formal handoff audit before release checks or packaging.
- Run local validation before packaging.
- Exclude `.git`, dependencies, caches, builds, environment files, private inbox data, machine paths, and the personal Sites binding by default.
- Include the project skill, hooks, source, lockfile, tests, configuration, reusable knowledge, and a per-file SHA-256 manifest.
- Inventory included attachments, exact content SHA-256, matching policy authorization, allowed audiences, and embedded author-facing metadata. Unknown or hash-mismatched authorization is a visible internal warning and an external-distribution blocker; do not silently strip metadata.
- Verify the ZIP can be reopened and that it contains no private sentinel or excluded path.

## Release modes

- `local`: require no Git or hosting account.
- `git`: require an upstream and exact local/upstream equality, declare source visibility, require `external` attachment authorization for a public repository, install from the committed lockfile, and run gates in an isolated checkout of that commit.
- `sites`: require the Git gate, authorized Sites binding, a handoff audit of the actual staged artifact, correct archive root, saved version, public deployment, and observed `succeeded` status. Do not treat source attachments omitted from the artifact as Sites-distributed files.

If a Git push succeeds but public deployment required by the project fails, report the precise failed stage and recoverable state; do not mark the release complete.

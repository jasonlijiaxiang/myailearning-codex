/**
 * @param {readonly {key: string; moduleId: string; tag: string; intentId?: string; tier?: string | null; fieldId?: string | null}[]} items
 * @param {{query?: string; moduleId?: string; tag?: string; intentId?: string; view?: string; tier?: string; textByKey?: Record<string, string> | null}} [options]
 */
export function filterQuestionDirectoryItems(items, { query = "", moduleId = "all", tag = "all", intentId = "all", view = "all", tier = "all", textByKey = null } = {}) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  const viewMatches = (/** @type {any} */ item) => view === "all" || (view === "field-kit" && item.tier) || (view === "situational" && item.tier === "situational") || (view === "core" && item.tier === "core");
  const tierMatches = (/** @type {any} */ item) => tier === "all" || item.tier === tier;
  return items.filter((item) => (
    (moduleId === "all" || item.moduleId === moduleId)
    && (tag === "all" || item.tag === tag)
    && (intentId === "all" || item.intentId === intentId)
    && viewMatches(item)
    && tierMatches(item)
    && (!normalized || (textByKey?.[item.key] ?? "").toLocaleLowerCase("zh-CN").includes(normalized))
  ));
}
/** @param {{tag: string; text: string}} item @param {string} query @param {string} tag */
export function matchesModuleQuestion(item, query, tag) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  return (tag === "all" || item.tag === tag)
    && (!normalized || item.text.toLocaleLowerCase("zh-CN").includes(normalized));
}

/**
 * @param {{q: string; a: string; depth: string; ask: string; basis: string; tag: string; evidence: readonly {sourceId: string; supports: string}[]}} item
 * @param {Record<string, {shortTitle: string; kind: string}>} sources
 */
export function moduleQuestionSearchText(item, sources) {
  return [item.q, item.a, item.depth, item.ask, item.basis, item.tag,
    ...item.evidence.map((reference) => `${sources[reference.sourceId]?.shortTitle ?? ""} ${sources[reference.sourceId]?.kind ?? ""} ${reference.supports}`),
  ].join(" ");
}

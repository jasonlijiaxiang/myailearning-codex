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

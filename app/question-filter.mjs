export function filterQuestionDirectoryItems(items, { query = "", moduleId = "all", tag = "all", intentId = "all", view = "all", tier = "all" } = {}) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  const viewMatches = (item) => view === "all" || (view === "field-kit" && item.tier) || (view === "situational" && item.tier === "situational") || (view === "core" && item.tier === "core");
  const tierMatches = (item) => tier === "all" || item.tier === tier;
  return items.filter((item) => (
    (moduleId === "all" || item.moduleId === moduleId)
    && (tag === "all" || item.tag === tag)
    && (intentId === "all" || item.intentId === intentId)
    && viewMatches(item)
    && tierMatches(item)
    && (!normalized || item.text.toLocaleLowerCase("zh-CN").includes(normalized))
  ));
}

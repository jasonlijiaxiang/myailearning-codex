export function filterQuestionDirectoryItems(items, { query = "", moduleId = "all", tag = "all" } = {}) {
  const normalized = query.trim().toLocaleLowerCase("zh-CN");
  return items.filter((item) => (
    (moduleId === "all" || item.moduleId === moduleId)
    && (tag === "all" || item.tag === tag)
    && (!normalized || item.text.toLocaleLowerCase("zh-CN").includes(normalized))
  ));
}

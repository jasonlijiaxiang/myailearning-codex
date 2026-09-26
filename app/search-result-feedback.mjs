/**
 * @param {{ moduleCount: number; knowledgeCount: number; query: string; indexState: "idle" | "loading" | "ready" | "error"; labels: { foundPrefix: string; moduleNoun: string; knowledgeHitsPrefix: string; knowledgeHitsSuffix: string } }} input
 */
export function moduleSearchFeedback({ moduleCount, knowledgeCount, query, indexState, labels }) {
  const status = moduleCount === 0 && knowledgeCount > 0
    ? `${labels.foundPrefix} ${knowledgeCount} ${labels.knowledgeHitsSuffix}`
    : `${labels.foundPrefix} ${moduleCount} ${labels.moduleNoun}${query ? `, ${labels.knowledgeHitsPrefix} ${knowledgeCount} ${labels.knowledgeHitsSuffix}` : ""}`;
  return { status, showEmpty: moduleCount === 0 && knowledgeCount === 0 && indexState !== "loading" };
}

/** @param {number} matchingCount @param {number} totalCount */
export function questionFilterCount(matchingCount, totalCount) {
  return `当前显示 ${matchingCount} / ${totalCount} 个问题`;
}

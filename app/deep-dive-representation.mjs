// 内容表达审计映射：深挖块类别 → 最省认知成本的表达方式。
// 本文件刻意零 import：让只需要该映射的客户端组件不再把整个内容注册表拉进客户端图。
// 规则说明见 app/module-representation-assessment.mjs（它从此处 re-export）。
export const deepDiveRepresentationByKind = Object.freeze({
  sequence: "interactive-flow",
  diagnostic: "interactive-diagnostic",
  matrix: "interactive-matrix",
  scenario: "interactive-branch",
  checklist: "editorial-checklist",
});

/** @param {string} kind */
export function requireDeepDiveRepresentation(kind) {
  const representation = deepDiveRepresentationByKind[/** @type {keyof typeof deepDiveRepresentationByKind} */ (kind)];
  if (!representation) throw new Error(`Unknown deep-dive representation kind: ${kind}`);
  return representation;
}

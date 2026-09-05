import { moduleContentRegistry } from "./module-content-registry.mjs";
import { publishedModules } from "./module-publication.mjs";
import { deepDiveRepresentationByKind, requireDeepDiveRepresentation } from "./deep-dive-representation.mjs";

export { deepDiveRepresentationByKind, requireDeepDiveRepresentation };

/**
 * 内容表达审计规则。
 *
 * 这不是视觉配额：它把每类内容关系映射到最省认知成本的表达方式。
 * 未建模关系的章节继续使用渐进文字；独立证据使用证据卡；共享维度使用表；
 * 只有方向、因果、分支或状态变化需要网页原生关系图。
 * 映射本体在 app/deep-dive-representation.mjs（零 import，供客户端组件直接消费）。
 */

export const moduleRepresentationAssessment = Object.freeze(Object.fromEntries(
  publishedModules.map((publication) => {
    const content = moduleContentRegistry[publication.slug];
    if (!content) throw new Error(`Missing representation assessment content: ${publication.slug}`);

    const deepDives = content.deepDives.map((block) => Object.freeze({
      title: block.title,
      relationship: block.kind,
      representation: requireDeepDiveRepresentation(block.kind),
      visual: block.kind !== "checklist",
    }));

    return [publication.slug, Object.freeze({
      slug: publication.slug,
      core: publication.knowledgeView
        ? Object.freeze({ representation: "knowledge-view", viewId: publication.knowledgeView })
        : Object.freeze({ representation: "prose", viewId: null }),
      learning: "outcome-route-lab",
      curriculum: "progressive-outline",
      decisions: "comparison-table",
      deepDives: Object.freeze(deepDives),
      evidence: "evidence-cards",
      cloud: "capability-table",
      qa: "progressive-disclosure",
      visualDeepDiveCount: deepDives.filter((item) => item.visual).length,
    })];
  }),
));

/** @param {string} slug */
export function requireModuleRepresentationAssessment(slug) {
  const assessment = moduleRepresentationAssessment[slug];
  if (!assessment) throw new Error(`Unknown module representation assessment: ${slug}`);
  return assessment;
}

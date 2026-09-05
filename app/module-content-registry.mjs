import { moduleManifests } from "./modules/index.mjs";
import { agentDeepDives, agentEvidenceCards, agentQa } from "./agent-content.mjs";
import { promptDecisionCase, promptDeepDives, promptEvidenceCards, promptQa } from "./prompt-content.mjs";
import { evidenceCards, ragDeepDives, ragLearningContent, ragQa } from "./rag-content.mjs";

/**
 * 已发布模块中可结构化复用的实战与证据数据。正文仍在各自内容文件中维护，
 * 本注册表从 manifest 派生：brief 模块引用 manifest.brief 的问答与证据，
 * 深度定制模块引用各自内容源，不另建模块名单。
 */
/** @type {Record<string, any>} */
const dedicatedContent = Object.freeze({
  rag: Object.freeze({ qa: ragQa, evidenceCards, deepDives: ragDeepDives, learning: ragLearningContent }),
  "ai-agent": Object.freeze({ qa: agentQa, evidenceCards: agentEvidenceCards, deepDives: agentDeepDives }),
  "prompt-engineering": Object.freeze({ qa: promptQa, evidenceCards: promptEvidenceCards, deepDives: promptDeepDives, caseStudy: promptDecisionCase }),
});

/** @type {Record<string, import("./content-types").ModuleBrief>} */
export const moduleContentRegistry = Object.freeze(Object.fromEntries(moduleManifests.map((manifest) => {
  if (manifest.brief) {
    return [manifest.slug, Object.freeze({
      qa: manifest.brief.qa,
      evidenceCards: manifest.brief.evidenceCards,
      deepDives: manifest.brief.deepDives ?? [],
    })];
  }
  const dedicated = dedicatedContent[manifest.slug];
  if (!dedicated) throw new Error(`Unknown published module content: ${manifest.slug}`);
  return [manifest.slug, dedicated];
})));

/** @param {string} slug */
export function requireModuleContent(slug) {
  const content = moduleContentRegistry[slug];
  if (!content) throw new Error(`Unknown published module content: ${slug}`);
  return content;
}

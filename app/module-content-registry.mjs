import { moduleManifests } from "./modules/index.mjs";
import { agentDeepDives, agentEvidenceCards, agentQa } from "./agent-content.mjs";
import { promptDecisionCase, promptDeepDives, promptEvidenceCards, promptQa } from "./prompt-content.mjs";
import { evidenceCards, ragDeepDives, ragLearningContent, ragQa } from "./rag-content.mjs";

/**
 * 已发布模块中可结构化复用的实战与证据数据。正文只维护在各自内容文件与
 * manifest.brief，本注册表统一暴露：brief 模块引用 manifest.brief 的问答与证据，
 * dedicated 模块保留原有内容源（qa/evidenceCards/deepDives/learning/caseStudy），
 * 并叠加 manifest.brief 的呈现字段，不另建模块名单。
 */
/** @type {Record<string, any>} */
const dedicatedContent = Object.freeze({
  rag: Object.freeze({ qa: ragQa, evidenceCards, deepDives: ragDeepDives, learning: ragLearningContent }),
  "ai-agent": Object.freeze({ qa: agentQa, evidenceCards: agentEvidenceCards, deepDives: agentDeepDives }),
  "prompt-engineering": Object.freeze({ qa: promptQa, evidenceCards: promptEvidenceCards, deepDives: promptDeepDives, caseStudy: promptDecisionCase }),
});

// brief 里与 dedicatedContent 同源、必须保持原有引用不变的键，避免叠加时被覆盖。
const briefDedicatedOwnedKeys = Object.freeze(["qa", "evidenceCards", "deepDives", "learning", "caseStudy"]);

/** @param {any} brief */
function briefPresentationFields(brief) {
  /** @type {Record<string, any>} */
  const fields = {};
  for (const key of Object.keys(brief)) {
    if (briefDedicatedOwnedKeys.includes(key)) continue;
    fields[key] = brief[key];
  }
  return fields;
}

/** @type {Record<string, import("./content-types").ModuleBrief>} */
export const moduleContentRegistry = Object.freeze(Object.fromEntries(moduleManifests.map((manifest) => {
  const dedicated = dedicatedContent[manifest.slug];
  if (manifest.brief && dedicated) {
    return [manifest.slug, Object.freeze({ ...dedicated, ...briefPresentationFields(manifest.brief) })];
  }
  if (manifest.brief) {
    return [manifest.slug, Object.freeze({
      qa: manifest.brief.qa,
      evidenceCards: manifest.brief.evidenceCards,
      deepDives: manifest.brief.deepDives ?? [],
    })];
  }
  if (!dedicated) throw new Error(`Unknown published module content: ${manifest.slug}`);
  return [manifest.slug, dedicated];
})));

/** @param {string} slug */
export function requireModuleContent(slug) {
  const content = moduleContentRegistry[slug];
  if (!content) throw new Error(`Unknown published module content: ${slug}`);
  return content;
}

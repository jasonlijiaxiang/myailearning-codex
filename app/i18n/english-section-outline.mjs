import { publishedModules } from "../module-publication.mjs";
import { moduleManifests } from "../modules/index.mjs";

// 英文统一 reader 的“自撰分组/共享分组”跟随英文内容形态：没有 brief 的模块
// 拥有完整自撰分组。mcp、a2a、llm-inference 的中文路由虽然改为 dedicated，
// 其英文内容仍是共享分组形态，因此这里按“是否有 brief”而不是中文 routeKind 判断。
// rag、ai-agent、prompt-engineering 的 brief 只承载中文专用页面的呈现正文
// （brief.presentation === "dedicated"），英文仍是完整自撰分组，不得因此翻转。
const englishAuthoredModuleSlugs = Object.freeze(
  moduleManifests
    .filter((manifest) => !manifest.brief || manifest.brief.presentation === "dedicated")
    .map((manifest) => manifest.slug),
);

export { classifySharedSection, sharedSectionRoles } from "./english-section-grouping.mjs";
import { buildEnglishSectionGroups as buildEnglishSectionGroupsForMode } from "./english-section-grouping.mjs";

const focusedEnglishModuleSlugs = Object.freeze(
  publishedModules.filter((module) => module.readingProfile === "focused").map((module) => module.slug),
);

/** @param {any} module */
export function buildEnglishSectionGroups(module) {
  return buildEnglishSectionGroupsForMode(module, englishAuthoredModuleSlugs.includes(module.slug));
}

// Kept for the English module pages: the legacy branch still renders the full
// authored selection for modules without a unified reader config.
/** @param {any} module */
export function selectVisibleEnglishSectionGroups(module, sectionGroups = buildEnglishSectionGroups(module)) {
  return sectionGroups;
}

/** @param {any} module */
export function selectVisibleEnglishEvidenceCards(module) {
  return module.evidenceCards;
}

/** @param {any} module */
export function selectVisibleEnglishQuestions(module) {
  return module.qa;
}

/** @param {any} module */
export function usesFocusedEnglishPreview(module) {
  return focusedEnglishModuleSlugs.includes(module.slug) && !englishAuthoredModuleSlugs.includes(module.slug);
}

/** @param {any} section */

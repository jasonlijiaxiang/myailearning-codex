/**
 * 23 个正式模块的发布注册表。
 *
 * 本文件不再保存任何每模块配置：publishedModules 全部从
 * app/modules/<slug>/manifest.mjs 派生，正文与其余注册表同理。
 * dedicated 模块保留深度定制页面；brief 模块共享导航、证据与问答能力，
 * 但正文根据内容选择流程、循环、分层、光谱或决策矩阵，不强迫同一版式。
 */
import { moduleManifests } from "./modules/index.mjs";

/** @type {ReadonlyArray<Readonly<{
 *   slug: string;
 *   path: string;
 *   titleId: string;
 *   requiredTerms: readonly string[];
 *   routeKind: "brief" | "dedicated";
 *   introducedAt: string;
 *   legacyUndatedQuestionSetSha256: string;
 *   updatedAt: string;
 *   visualProfile: "dense-reading" | "standard";
 *   readingProfile?: "focused";
 *   knowledgeView: string | null;
 *   contentContract: Readonly<Record<string, readonly string[]>>;
 * }>>} */
export const publishedModules = Object.freeze(moduleManifests.map((manifest) => Object.freeze({
  slug: manifest.slug,
  path: `/modules/${manifest.slug}`,
  titleId: manifest.titleId,
  requiredTerms: manifest.requiredTerms,
  routeKind: manifest.routeKind,
  introducedAt: manifest.introducedAt,
  legacyUndatedQuestionSetSha256: manifest.legacyUndatedQuestionSetSha256,
  updatedAt: manifest.updatedAt ?? null,
  visualProfile: manifest.visualProfile,
  ...(manifest.readingProfile ? { readingProfile: manifest.readingProfile } : {}),
  knowledgeView: manifest.knowledgeView ?? null,
  contentContract: manifest.contentContract,
})));

export const publishedModuleSlugs = Object.freeze(publishedModules.map((module) => module.slug));
const dedicatedModuleSlugs = Object.freeze(publishedModules.filter((module) => module.routeKind === "dedicated").map((module) => module.slug));


/**
 * @param {string} slug
 */
export function hasDedicatedModule(slug) {
  return dedicatedModuleSlugs.includes(slug);
}

/**
 * @param {string} slug
 */
export function getPublishedModule(slug) {
  return publishedModules.find((module) => module.slug === slug);
}

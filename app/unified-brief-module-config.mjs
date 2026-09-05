/**
 * 中文统一简报 reader 的每模块配置表。
 * 配置按模块维护在 app/modules/<slug>/manifest.mjs 的 unifiedBriefConfig 字段，本文件派生。
 */
import { moduleManifests } from "./modules/index.mjs";

/** @type {Record<string, any>} */
const configs = Object.freeze(Object.fromEntries(
  moduleManifests
    .map((manifest) => [manifest.slug, manifest.unifiedBriefConfig])
    .filter((entry) => Boolean(entry[1])),
));

/**
 * @param {string} slug
 */
export function getUnifiedBriefModuleConfig(slug) {
  return configs[slug] ?? null;
}

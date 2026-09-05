import { publishedModuleSlugs } from "../module-publication.mjs";

export const englishModuleSlugs = Object.freeze([...publishedModuleSlugs]);
/** @param {string} slug */
function isEnglishModuleSlug(slug) {
  return englishModuleSlugs.includes(slug);
}

/** @param {string} slug */
export function englishModulePath(slug) {
  if (!isEnglishModuleSlug(slug)) return null;
  return `/en/modules/${slug}`;
}


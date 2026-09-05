import { publishedModuleSlugs } from "../module-publication.mjs";

export const englishModuleSlugs = Object.freeze([...publishedModuleSlugs]);
function isEnglishModuleSlug(slug) {
  return englishModuleSlugs.includes(slug);
}

export function englishModulePath(slug) {
  if (!isEnglishModuleSlug(slug)) return null;
  return `/en/modules/${slug}`;
}


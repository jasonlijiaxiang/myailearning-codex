import { publishedModuleSlugs } from "../module-publication.mjs";

export const DEFAULT_LOCALE = "zh-CN";
export const ENGLISH_LOCALE = "en";

export const englishModuleSlugs = Object.freeze([...publishedModuleSlugs]);
export const englishPilotSlugs = englishModuleSlugs;

export function isEnglishModuleSlug(slug) {
  return englishModuleSlugs.includes(slug);
}

export function isEnglishPilotSlug(slug) {
  return isEnglishModuleSlug(slug);
}

export function englishModulePath(slug) {
  if (!isEnglishModuleSlug(slug)) return null;
  return `/en/modules/${slug}`;
}

export function chineseModulePath(slug) {
  return `/modules/${slug}`;
}

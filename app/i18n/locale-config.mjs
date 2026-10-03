import { moduleManifests } from "../modules/index.mjs";

export const englishModuleSlugs = Object.freeze(moduleManifests
  .filter((manifest) => !manifest.locales || manifest.locales.includes("en"))
  .map((manifest) => manifest.slug));
/** @param {string} slug */
function isEnglishModuleSlug(slug) {
  return englishModuleSlugs.includes(slug);
}

/** @param {string} slug */
export function englishModulePath(slug) {
  if (!isEnglishModuleSlug(slug)) return null;
  return `/en/modules/${slug}`;
}

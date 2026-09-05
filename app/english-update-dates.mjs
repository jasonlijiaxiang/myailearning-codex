/**
 * 英文模块最后真实同步日期。
 *
 * 本轮中文单线交付不撰写英文内容；英文页面读取本表，而不是读取中文
 * module-publication.updatedAt，避免中文模块更新被误报为英文同步日期。
 *
 * 日期按每个英文模块最后一次真实撰写与专业审校提交维护，按模块登记在
 * app/modules/<slug>/manifest.mjs 的 englishUpdatedAt 字段，本文件派生。
 * 中文单线更新不得刷新本表；未来英文同步只更新对应模块，不修改中文 updatedAt。
 */
import { moduleManifests } from "./modules/index.mjs";

/** @type {Record<string, string>} */
const englishUpdatedDates = Object.freeze(Object.fromEntries(
  moduleManifests.map((manifest) => [manifest.slug, manifest.englishUpdatedAt]),
));

/** @param {string} slug */
export function getEnglishUpdatedAt(slug) {
  return englishUpdatedDates[slug] ?? null;
}

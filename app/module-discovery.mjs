/**
 * 首页检索使用的售前任务语言。这里描述客户何时需要某个模块，不重复正文。
 * 文案按模块维护在 app/modules/<slug>/manifest.mjs 的 discovery 字段，本文件派生。
 */
import { moduleManifests } from "./modules/index.mjs";

/** @type {Record<string, { summary: string; cue: string }>} */
const discovery = {};
for (const manifest of moduleManifests) {
  discovery[manifest.slug] = Object.freeze({ summary: manifest.discovery.summary, cue: manifest.discovery.cue });
}

export const moduleDiscovery = Object.freeze(discovery);

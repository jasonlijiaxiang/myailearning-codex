/**
 * 模块 manifest 的共享结构类型。
 *
 * @typedef {object} ModuleManifest
 * @property {string} slug 稳定模块 slug，等于目录名。
 * @property {string} zh 中文模块名（知识地图显示名）。
 * @property {string} en 英文模块名。
 * @property {string} titleId 模块页主标题的稳定 ID。
 * @property {string} layerNo 知识地图层编号。
 * @property {"brief" | "dedicated"} routeKind 路由形态。
 * @property {string} introducedAt 模块首次发布日期。
 * @property {string} updatedAt 最近一次内容实质更新日期。
 * @property {readonly string[]} requiredTerms 模块必需术语 ID。
 * @property {string | null} knowledgeView 首屏知识视图 ID。
 * @property {"focused" | null} readingProfile 聚焦阅读画像。
 * @property {"dense-reading" | "standard"} visualProfile 视觉画像。
 * @property {string} legacyUndatedQuestionSetSha256 日期策略前无 addedAt 问题集合摘要。
 * @property {readonly string[]} qaCoverageTags 问答覆盖标签。
 * @property {Readonly<Record<string, readonly string[]>>} contentContract 内容质量契约。
 * @property {any} brief brief 正文引用（dedicated 模块为 null）。
 * @property {any} curriculum 课程地图正文引用。
 * @property {any} learning 学习路线正文引用。
 * @property {any} extensionViews 首屏扩展视图引用。
 * @property {{ summary: string; cue: string }} discovery 首页检索文案。
 * @property {string | null} referenceShortTitle Reference 分组短标题。
 * @property {readonly string[]} additionalSourceIds Reference 补充来源 ID。
 * @property {string} englishUpdatedAt 英文模块最后同步日期。
 * @property {any} englishReaderConfig 英文统一 reader 配置。
 * @property {any} unifiedBriefConfig 中文统一简报 reader 配置。
 * @property {readonly any[]} fieldKitEntries 现场备战条目引用。
 */
export const moduleManifestType = null;

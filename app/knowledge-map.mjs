/**
 * 面向读者的 23 模块知识地图。
 *
 * 层结构（编号、名称、说明与层内展示顺序）是地图自身的视觉结构；
 * 每个模块的条目（中英文名、slug、href、层级归属）全部从
 * app/modules/<slug>/manifest.mjs 派生，未列入展示顺序的新模块
 * 自动追加到其 layerNo 对应层的末尾。
 *
 * 初始主题与 external_reference/CC-20260717 建立归档映射，新增模块来自全局知识复核。
 * PPT 不定义模块的知识边界、章节顺序或内容上限；正文按售前判断链独立研究，
 * 公开事实由 来源与证据资料库中的一手来源核验。
 */
import { moduleManifests } from "./modules/index.mjs";

const layerDefinitions = [
  {
    no: "01",
    name: "方案与选型层",
    en: "Solution & Selection",
    purpose: "帮助客户比较方案、制定采购条件和验收标准。",
    moduleSlugs: ["solution-patterns", "model-landscape"],
  },
  {
    no: "02",
    name: "应用模式层",
    en: "Application Patterns",
    purpose: "选择检索、行动与多模态理解的正确组合。",
    moduleSlugs: ["rag", "ai-agent", "multimodal"],
  },
  {
    no: "03",
    name: "协议与互操作层",
    en: "Protocols & Interoperability",
    purpose: "明确模型、工具与 Agent 之间的连接和责任边界。",
    moduleSlugs: ["mcp", "a2a"],
  },
  {
    no: "04",
    name: "AI 应用交付与运营层",
    en: "AI Application Delivery & Operations",
    purpose: "把生成式应用的版本、流量、观测、成本与事故组织成持续工程闭环。",
    moduleSlugs: ["veadk", "agentkit", "ai-ops", "ai-gateway"],
  },
  {
    no: "05",
    name: "质量、安全与治理层",
    en: "Quality, Security & Governance",
    purpose: "用评估、安全控制、责任和证据决定 AI 系统能否进入并持续留在生产。",
    moduleSlugs: ["evaluation", "ai-governance", "security"],
  },
  {
    no: "06",
    name: "预测式 AI 与 MLOps 层",
    en: "Predictive AI & MLOps",
    purpose: "把预测模型的数据、特征、训练、发布与真实效果连成持续生命周期。",
    moduleSlugs: ["predictive-ai-mlops"],
  },
  {
    no: "07",
    name: "模型与优化层",
    en: "Models & Optimization",
    purpose: "理解模型能力从何而来，以及怎样训练、定制和高效服务。",
    moduleSlugs: ["llm", "prompt-engineering", "fine-tuning", "llm-training", "llm-inference"],
  },
  {
    no: "08",
    name: "数据工程层",
    en: "Data Engineering",
    purpose: "把原始数据整理为可被 AI 使用、能追溯来源的输入。",
    moduleSlugs: ["data-engineering"],
  },
  {
    no: "09",
    name: "AI 基础设施层",
    en: "AI Infrastructure",
    purpose: "承载算力、网络、存储、集群与平台编排。",
    moduleSlugs: ["ai-infra-platform", "ai-infra-compute"],
  },
];

const manifestBySlug = new Map(moduleManifests.map((manifest) => [manifest.slug, manifest]));
const listedModuleSlugs = new Set(layerDefinitions.flatMap((layer) => layer.moduleSlugs));

/**
 * @param {{ no: string; moduleSlugs: readonly string[] }} layer
 */
function modulesInLayer(layer) {
  const listed = layer.moduleSlugs
    .map((slug) => manifestBySlug.get(slug))
    .filter((manifest) => manifest !== undefined);
  const appended = moduleManifests.filter((manifest) => manifest.layerNo === layer.no && !listedModuleSlugs.has(manifest.slug));
  return [...listed, ...appended];
}

export const layers = Object.freeze(layerDefinitions.map((layer) => Object.freeze({
  no: layer.no,
  name: layer.name,
  en: layer.en,
  purpose: layer.purpose,
  modules: Object.freeze(modulesInLayer(layer).map((manifest) => Object.freeze({
    zh: manifest.zh,
    en: manifest.en,
    slug: manifest.slug,
    href: `/modules/${manifest.slug}`,
  }))),
})));

export const moduleList = layers.flatMap((layer) =>
  layer.modules.map((module) => ({
    ...module,
    layerNo: layer.no,
    layerName: layer.name,
    layerEn: layer.en,
    layerPurpose: layer.purpose,
  })),
);

/**
 * 历史地址继续解析为合并后的主要模块，避免同事保存的旧链接失效。
 * 别名不出现在知识地图，也不形成第二份内容。
 */
/** @type {Record<string, string>} */
export const legacyModuleAliases = Object.freeze({
  "scenario-solution-library": "solution-patterns",
  "industry-blueprint": "solution-patterns",
  "business-value-tco": "solution-patterns",
  "workflow-structured-generation": "solution-patterns",
  "model-selection-landscape": "model-landscape",
  multimodality: "multimodal",
  "api-events": "mcp",
  "identity-authorization-boundaries": "security",
  "safety-governance": "security",
  "inference-ai-gateway": "ai-gateway",
  "ai-application-engineering": "ai-ops",
  "ai-finops": "solution-patterns",
  "observability-finops": "solution-patterns",
  "model-principles": "llm",
  "training-fine-tuning": "fine-tuning",
  "model-compression-alignment": "llm-training",
  "parsing-ocr": "data-engineering",
  "synchronization-cdc": "data-engineering",
  "vector-database-retrieval": "data-engineering",
  "quality-knowledge-operations": "data-engineering",
  "accelerators-heterogeneous-compute": "ai-infra-compute",
  "storage-networking": "ai-infra-compute",
  "clusters-scheduling": "ai-infra-platform",
  "inference-stack": "llm-inference",
});

/**
 * @param {string} slug
 */
function resolveModuleSlug(slug) {
  return legacyModuleAliases[slug] ?? slug;
}

/**
 * @param {string} slug
 */
export function getModuleBySlug(slug) {
  const canonicalSlug = resolveModuleSlug(slug);
  const knowledgeModule = moduleList.find((item) => item.slug === canonicalSlug);
  return knowledgeModule ? { ...knowledgeModule, requestedSlug: slug, canonicalSlug } : undefined;
}

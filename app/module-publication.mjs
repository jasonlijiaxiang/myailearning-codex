/**
 * 19 个正式模块的发布注册表。
 *
 * dedicated 模块保留深度定制页面；brief 模块共享导航、证据与问答能力，
 * 但正文根据内容选择流程、循环、分层、光谱或决策矩阵，不强迫同一版式。
 */
const moduleSpecs = [
  ["solution-patterns", "solution-patterns-title", ["solution-patterns"], "brief"],
  ["model-landscape", "model-landscape-title", ["model-landscape", "model-routing"], "brief"],
  ["rag", "rag-title", ["rag", "retrieval", "augmentation", "generation", "sparse-retrieval", "dense-retrieval", "reranking", "grounding"], "dedicated"],
  ["ai-agent", "agent-title", ["ai-agent", "perceive", "reason", "act", "observe", "planning", "memory", "tools"], "dedicated"],
  ["multimodal", "multimodal-title", ["multimodal", "document-intelligence"], "brief"],
  ["mcp", "mcp-title", ["mcp", "tool-discovery", "identity-authorization"], "brief"],
  ["a2a", "a2a-title", ["a2a", "agent-collaboration", "identity-authorization"], "brief"],
  ["evaluation", "evaluation-title", ["evaluation", "golden-set", "observability"], "brief"],
  ["security", "security-title", ["security", "guardrails", "identity-authorization", "prompt-injection"], "brief"],
  ["ai-gateway", "ai-gateway-title", ["ai-gateway", "model-routing", "guardrails"], "brief"],
  ["ai-ops", "ai-ops-title", ["ai-ops", "observability", "golden-set"], "brief"],
  ["llm", "llm-title", ["llm", "transformer", "attention", "kv-cache"], "brief"],
  ["prompt-engineering", "prompt-title", ["prompt-engineering", "context-engineering", "instructions", "context", "tools-schema", "structured-outputs", "prompt-injection"], "dedicated"],
  ["fine-tuning", "fine-tuning-title", ["fine-tuning", "lora", "evaluation"], "brief"],
  ["llm-training", "llm-training-title", ["llm-training", "distributed-training", "evaluation"], "brief"],
  ["llm-inference", "llm-inference-title", ["llm-inference", "kv-cache", "batching"], "brief"],
  ["data-engineering", "data-engineering-title", ["data-engineering", "document-intelligence", "dense-retrieval"], "brief"],
  ["ai-infra-platform", "ai-infra-platform-title", ["ai-infra-platform", "resource-scheduling", "observability"], "brief"],
  ["ai-infra-compute", "ai-infra-compute-title", ["ai-infra-compute", "heterogeneous-compute", "kv-cache"], "brief"],
];

const pilotKnowledgeViews = Object.freeze({
  "solution-patterns": "decision-blueprint",
  rag: "application-architecture",
  "ai-agent": "control-architecture",
  security: "threat-path",
  llm: "theory-atlas",
  "fine-tuning": "tuning-lifecycle",
});

const pilotQaCoverageTags = Object.freeze({
  "solution-patterns": Object.freeze([
    "方案边界", "PoC 验收", "TCO", "场景选择", "编排选择", "智能客服", "企业搜索",
    "内容生成", "AI Coding", "数字人", "ChatBI", "会议助手", "生产运营",
  ]),
  security: Object.freeze([
    "共享责任", "提示注入", "RAG 安全", "Agent 安全", "风险盘点", "删除与撤权",
    "供应链", "身份与授权", "法规适用性", "持续红队", "事件响应", "日志治理",
  ]),
  "fine-tuning": Object.freeze([
    "路线选择", "方法选型", "数据准备", "验收", "对齐路线", "数据格式", "合成数据",
    "训练诊断", "训练平台", "Adapter 部署", "版本兼容", "能力保留",
  ]),
});

export const publishedModules = Object.freeze(moduleSpecs.map(([slug, titleId, requiredTerms, routeKind]) => Object.freeze({
  slug,
  path: `/modules/${slug}`,
  titleId,
  requiredTerms: Object.freeze(requiredTerms),
  routeKind,
  visualProfile: Object.hasOwn(pilotKnowledgeViews, slug) ? "dense-reading" : "standard",
  knowledgeView: pilotKnowledgeViews[slug] ?? null,
  qaCoverageTags: pilotQaCoverageTags[slug] ?? Object.freeze([]),
  contentContract: Object.freeze(routeKind === "dedicated"
    ? {
        principle: Object.freeze(slug === "rag"
          ? ["RAG 的工作原理与工程机制"]
          : slug === "ai-agent"
            ? ["Agent 的基础概念与工作循环"]
            : ["Prompt 是什么，以及 Context Engineering 的边界"]),
        mechanism: Object.freeze(slug === "rag"
          ? ["候选召回", "上下文组装", "有据生成"]
          : slug === "ai-agent"
            ? ["感知—思考—行动—观察", "规划、记忆与工具"]
            : ["稳定指令", "动态上下文", "能力接口"]),
        boundary: Object.freeze(slug === "rag"
          ? ["检索到不等于回答正确"]
          : slug === "ai-agent"
            ? ["模型会调用 API，不等于模型拥有 API 权限"]
            : ["必须执行的规则应落在模型外"]),
        cloud: Object.freeze([slug === "rag" ? "RAG 技术环节与云服务机会" : slug === "ai-agent" ? "Agent 技术环节与云服务机会" : "提示词工程与云服务机会"]),
        customer: Object.freeze(["客户高频问题与深度回答"]),
      }
    : {
        principle: Object.freeze(["核心机制与售前判断"]),
        mechanism: Object.freeze(["机制、失败与控制"]),
        boundary: Object.freeze(["重要边界"]),
        cloud: Object.freeze(["云服务连接"]),
        customer: Object.freeze(["客户高频问题与深度回答"]),
      }),
})));

export const publishedModuleSlugs = Object.freeze(publishedModules.map((module) => module.slug));
export const dedicatedModuleSlugs = Object.freeze(publishedModules.filter((module) => module.routeKind === "dedicated").map((module) => module.slug));

export function isPublishedModule(slug) {
  return publishedModuleSlugs.includes(slug);
}

export function hasDedicatedModule(slug) {
  return dedicatedModuleSlugs.includes(slug);
}

export function getPublishedModule(slug) {
  return publishedModules.find((module) => module.slug === slug);
}

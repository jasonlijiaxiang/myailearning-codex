/**
 * 19 个正式模块的发布注册表。
 *
 * dedicated 模块保留深度定制页面；brief 模块共享导航、证据与问答能力，
 * 但正文根据内容选择流程、循环、分层、光谱或决策矩阵，不强迫同一版式。
 */
const moduleSpecs = [
  ["solution-patterns", "solution-patterns-title", ["solution-patterns"], "brief"],
  ["model-landscape", "model-landscape-title", ["model-landscape", "model-routing"], "brief", "2026-07-20"],
  ["rag", "rag-title", ["rag", "retrieval", "augmentation", "generation", "sparse-retrieval", "dense-retrieval", "reranking", "grounding"], "dedicated", "2026-07-20"],
  ["ai-agent", "agent-title", ["ai-agent", "perceive", "reason", "act", "observe", "planning", "memory", "tools"], "dedicated", "2026-07-20"],
  ["multimodal", "multimodal-title", ["multimodal", "document-intelligence"], "brief", "2026-07-20"],
  ["mcp", "mcp-title", ["mcp", "tool-discovery", "identity-authorization"], "brief", "2026-07-20"],
  ["a2a", "a2a-title", ["a2a", "agent-collaboration", "identity-authorization"], "brief", "2026-07-20"],
  ["evaluation", "evaluation-title", ["evaluation", "golden-set", "observability"], "brief", "2026-07-20"],
  ["security", "security-title", ["security", "guardrails", "identity-authorization", "prompt-injection"], "brief", "2026-07-20"],
  ["ai-gateway", "ai-gateway-title", ["ai-gateway", "model-routing", "guardrails"], "brief"],
  ["ai-ops", "ai-ops-title", ["ai-ops", "observability", "golden-set"], "brief", "2026-07-20"],
  ["llm", "llm-title", ["llm", "transformer", "attention", "kv-cache"], "brief", "2026-07-20"],
  ["prompt-engineering", "prompt-title", ["prompt-engineering", "context-engineering", "instructions", "context", "tools-schema", "structured-outputs", "prompt-injection"], "dedicated", "2026-07-20"],
  ["fine-tuning", "fine-tuning-title", ["fine-tuning", "lora", "evaluation"], "brief", "2026-07-20"],
  ["llm-training", "llm-training-title", ["llm-training", "distributed-training", "evaluation"], "brief", "2026-07-20"],
  ["llm-inference", "llm-inference-title", ["llm-inference", "kv-cache", "batching"], "brief", "2026-07-20"],
  ["data-engineering", "data-engineering-title", ["data-engineering", "document-intelligence", "dense-retrieval"], "brief"],
  ["ai-infra-platform", "ai-infra-platform-title", ["ai-infra-platform", "resource-scheduling", "observability"], "brief", "2026-07-20"],
  ["ai-infra-compute", "ai-infra-compute-title", ["ai-infra-compute", "heterogeneous-compute", "kv-cache"], "brief"],
];

const moduleKnowledgeViews = Object.freeze({
  "solution-patterns": "decision-blueprint",
  "model-landscape": "selection-coordinate",
  rag: "application-architecture",
  "ai-agent": "control-architecture",
  multimodal: "multimodal-evidence-pipeline",
  mcp: "mcp-host-server-boundary",
  a2a: "delegated-task-lifecycle",
  evaluation: "evaluation-flywheel",
  security: "threat-path",
  "ai-gateway": "gateway-policy-data-plane",
  "ai-ops": "operations-feedback-loop",
  llm: "theory-atlas",
  "prompt-engineering": "context-assembly",
  "fine-tuning": "tuning-lifecycle",
  "llm-training": "training-supply-chain",
  "llm-inference": "latency-capacity-map",
  "data-engineering": "ai-data-lineage",
  "ai-infra-platform": "scheduler-control-plane",
  "ai-infra-compute": "compute-bottleneck-path",
});

const moduleQaCoverageTags = Object.freeze({
  "solution-patterns": Object.freeze([
    "方案边界", "PoC 验收", "TCO", "场景选择", "编排选择", "智能客服", "企业搜索",
    "内容生成", "AI Coding", "数字人", "ChatBI", "会议助手", "生产运营",
  ]),
  "model-landscape": Object.freeze([
    "选型方法", "供应连续性", "TCO", "生命周期", "组合策略", "版本治理", "Benchmark 边界", "退出策略",
    "任务分层", "模型身份", "部署责任", "上下文边界",
  ]),
  rag: Object.freeze([
    "架构判断", "风险边界", "产品选型", "故障诊断", "路线选择", "安全", "时效性", "评估",
    "数据工程", "FinOps", "训练策略", "检索调优", "检索架构", "生产运营", "查询规划",
    "时效与权限", "证据治理", "无停机迁移", "切块策略", "元数据治理", "GraphRAG",
    "多模态检索", "结构化数据", "可观测性", "容量规划", "故障恢复", "云服务选型", "PoC 验收",
  ]),
  "ai-agent": Object.freeze([
    "概念边界", "动作循环", "可解释与审计", "规划机制", "路线选择", "方案边界", "工具治理",
    "记忆治理", "安全", "架构选择", "评估", "可观测", "云选型", "FinOps", "上线治理",
    "协议边界", "执行方式", "Run 状态机", "身份授权", "工具契约", "人工介入", "故障恢复",
    "长任务运行", "多 Agent",
  ]),
  multimodal: Object.freeze([
    "方案选择", "成本与性能", "实时交互", "多模态安全", "证据链", "评估设计", "结构恢复", "路线组合",
    "输入预算", "时序证据", "语音交互", "模态隐私", "降级策略",
  ]),
  mcp: Object.freeze([
    "协议边界", "身份授权", "供应链安全", "选型与锁定", "安全边界", "平台治理", "错误语义", "Server 供应链",
    "授权链", "契约版本", "能力发现", "能力分权", "结果注入", "长任务",
  ]),
  a2a: Object.freeze([
    "协议边界", "架构选择", "可靠性", "审计与可观测", "采用判断", "故障恢复", "取消语义", "协作拓扑",
    "发现信任", "跨域委托", "产物验收",
  ]),
  evaluation: Object.freeze([
    "模型选型", "评估方法", "RAG 诊断", "Agent 评估", "评审方法", "持续评估", "黄金集治理", "发布门槛",
    "评估分工", "切片评估", "人工校准", "红队边界", "多目标评估", "统计可信度",
  ]),
  security: Object.freeze([
    "共享责任", "提示注入", "RAG 安全", "Agent 安全", "安全验证", "风险盘点",
    "供应链", "法规适用性", "事件响应", "日志治理",
  ]),
  "ai-gateway": Object.freeze([
    "架构定位", "模型路由", "可靠性", "MCP 治理", "路由策略", "策略发布", "故障降级",
    "缓存隔离", "成本归因", "旁路治理", "流式故障",
  ]),
  "ai-ops": Object.freeze([
    "平台复用", "在线评估", "漂移归因", "事件响应", "观测边界", "SLO 设计", "业务恢复", "遥测治理",
    "采样策略", "反馈治理", "成本异常", "安全回放", "告警设计",
  ]),
  "fine-tuning": Object.freeze([
    "路线选择", "方法选型", "数据准备", "验收", "对齐路线", "数据格式", "合成数据",
    "训练平台", "Adapter 部署", "版本兼容", "能力保留",
  ]),
  llm: Object.freeze([
    "基础原理", "概念边界", "上下文", "性能成本", "Tokenization", "表示边界",
    "训练阶段", "规模边界", "缓存机制", "上下文边界", "生成机制",
  ]),
  "prompt-engineering": Object.freeze([
    "能力边界", "安全边界", "结构化输出", "工具安全", "版本治理", "上下文装配", "提示注入", "评估方法", "灰度回滚", "PoC 验收",
  ]),
  "llm-training": Object.freeze([
    "训练全景", "规模边界", "后训练", "评估发布", "扩展效率", "可靠性", "训练恢复", "Scaling 边界",
    "数据去重", "Tokenizer 变更", "并行策略", "检查点策略",
  ]),
  "llm-inference": Object.freeze([
    "性能原理", "容量规划", "优化边界", "组件边界", "SLO 取舍", "精度选择", "显存容量", "量化发布",
    "调度公平", "投机解码", "弹性冷启动", "缓存安全", "性能归因", "准入控制",
  ]),
  "data-engineering": Object.freeze([
    "建设顺序", "文档解析", "向量库选型", "权限与删除", "生命周期", "解析质量", "用途治理", "删除传播",
    "增量同步", "索引发布", "质量契约", "主数据治理", "敏感数据",
  ]),
  "ai-infra-platform": Object.freeze([
    "建设起点", "调度选型", "DRA", "平台边界", "资源效率", "升级治理", "有效产出", "混部边界",
    "队列公平", "拓扑调度", "平台隔离",
  ]),
  "ai-infra-compute": Object.freeze([
    "性能判断", "显存规划", "混合云", "TCO", "采购方法", "网络选型", "规格边界", "扩展效率",
    "网络投资", "数据供给", "能源与散热", "异构可移植",
  ]),
});

export const publishedModules = Object.freeze(moduleSpecs.map(([slug, titleId, requiredTerms, routeKind, updatedAt]) => Object.freeze({
  slug,
  path: `/modules/${slug}`,
  titleId,
  requiredTerms: Object.freeze(requiredTerms),
  routeKind,
  updatedAt: updatedAt ?? null,
  visualProfile: Object.hasOwn(moduleKnowledgeViews, slug) ? "dense-reading" : "standard",
  knowledgeView: moduleKnowledgeViews[slug] ?? null,
  qaCoverageTags: moduleQaCoverageTags[slug] ?? Object.freeze([]),
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

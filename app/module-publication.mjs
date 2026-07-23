/**
 * 21 个正式模块的发布注册表。
 *
 * dedicated 模块保留深度定制页面；brief 模块共享导航、证据与问答能力，
 * 但正文根据内容选择流程、循环、分层、光谱或决策矩阵，不强迫同一版式。
 */
const moduleSpecs = [
  ["solution-patterns", "solution-patterns-title", ["solution-patterns", "ai-finops", "finops", "unit-economics", "cost-allocation", "cost-to-serve", "cost-anomaly"], "brief", "2026-07-21", "2026-07-17"],
  ["model-landscape", "model-landscape-title", ["model-landscape", "model-routing", "access-spectrum", "capability-matrix", "model-lifecycle"], "brief", "2026-07-21", "2026-07-17"],
  ["rag", "rag-title", ["rag", "retrieval", "augmentation", "generation", "sparse-retrieval", "dense-retrieval", "reranking", "grounding"], "dedicated", "2026-07-21", "2026-07-17"],
  ["ai-agent", "agent-title", ["ai-agent", "perceive", "reason", "act", "observe", "planning", "memory", "tools"], "dedicated", "2026-07-21", "2026-07-17"],
  ["multimodal", "multimodal-title", ["multimodal", "vision-transformer", "ocr", "asr", "document-intelligence"], "brief", "2026-07-21", "2026-07-17"],
  ["mcp", "mcp-title", ["mcp", "tool-discovery", "identity-authorization", "mcp-protocol-roles", "mcp-primitives"], "brief", "2026-07-22", "2026-07-17"],
  ["a2a", "a2a-title", ["a2a", "agent-card", "a2a-task", "artifact", "agent-collaboration", "identity-authorization"], "brief", "2026-07-21", "2026-07-17"],
  ["evaluation", "evaluation-title", ["evaluation", "golden-set", "observability", "evaluation-layers", "llm-as-judge"], "brief", "2026-07-22", "2026-07-17"],
  ["ai-governance", "ai-governance-title", ["ai-governance", "ai-inventory", "ai-risk-tiering", "impact-assessment", "governance-evidence", "continuous-assurance"], "brief", "2026-07-22", "2026-07-21"],
  ["security", "security-title", ["security", "guardrails", "identity-authorization", "prompt-injection"], "brief", "2026-07-20", "2026-07-17"],
  ["ai-gateway", "ai-gateway-title", ["ai-gateway", "model-routing", "rate-limiting", "semantic-cache", "guardrails"], "brief", "2026-07-21", "2026-07-17"],
  ["ai-ops", "ai-ops-title", ["ai-ops", "ai-application-engineering", "genaiops", "ai-release-manifest", "configuration-bundle", "release-evaluation", "shadow-traffic", "observability", "golden-set", "cost-allocation", "cost-anomaly"], "brief", "2026-07-21", "2026-07-17"],
  ["predictive-ai-mlops", "predictive-ai-mlops-title", ["predictive-ai-mlops", "feature-store", "model-registry", "point-in-time-correctness", "training-serving-skew", "model-drift"], "brief", "2026-07-21", "2026-07-21"],
  ["llm", "llm-title", ["llm", "transformer", "attention", "kv-cache"], "brief", "2026-07-20", "2026-07-17"],
  ["prompt-engineering", "prompt-title", ["prompt-engineering", "context-engineering", "instructions", "context", "tools-schema", "structured-outputs", "prompt-injection"], "dedicated", "2026-07-22", "2026-07-17"],
  ["fine-tuning", "fine-tuning-title", ["fine-tuning", "lora", "evaluation"], "brief", "2026-07-21", "2026-07-17"],
  ["llm-training", "llm-training-title", ["llm-training", "distributed-training", "evaluation"], "brief", "2026-07-22", "2026-07-17"],
  ["llm-inference", "llm-inference-title", ["llm-inference", "kv-cache", "batching"], "brief", "2026-07-22", "2026-07-17"],
  ["data-engineering", "data-engineering-title", ["data-engineering", "document-intelligence", "dense-retrieval", "data-contract", "data-lineage", "deletion-propagation"], "brief", "2026-07-21", "2026-07-17"],
  ["ai-infra-platform", "ai-infra-platform-title", ["ai-infra-platform", "resource-scheduling", "observability", "gang-scheduling", "goodput"], "brief", "2026-07-22", "2026-07-17"],
  ["ai-infra-compute", "ai-infra-compute-title", ["ai-infra-compute", "heterogeneous-compute", "kv-cache", "hbm", "scale-up", "scale-out"], "brief", "2026-07-22", "2026-07-17"],
];

// 2026-07-20 日期策略生效前无 addedAt 问题的稳定身份集合摘要。
// 摘要算法见 MODULE-BUILD-STANDARD；新增问题必须携带 addedAt，不能用同数量替换绕过。
const moduleLegacyUndatedQuestionSetSha256 = Object.freeze({
  "solution-patterns": "52a7b6302cb7bafde13c1d47e1f25e06eb103debf951508a765d7ae67341f110",
  "model-landscape": "710518d2e7495dd0a4ab3b5a5f4ca5a6eb25398ffc81ebedb832aaf4b7be4f12",
  rag: "5feec1dd0340b3d5d58d6b05c1a3dc0f094046b88c52471b2bc83b0aa524a713",
  "ai-agent": "53b2a8990c5769cdddd525727b6135d534dd4bbadc5501fa4fc32555e85bf114",
  multimodal: "93ef70cba5eb1c013be9aaa5d8139ad07490c4f8f05159fd20b25718ab4f9293",
  mcp: "0e77279a34c57ab3814cf800dd0f9f9874955adbcf0e1097d88d6999c267cc61",
  a2a: "7f302462d608a14f80957008e03ff4dfcdcb1c136d71eb6b4957998223a253b0",
  evaluation: "8581cb82f539cb8948f4f98047bc3683184dc5dec7baf38b198f1c669df6011a",
  "ai-governance": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  security: "46aaf8b0343c74c5b240bf2cb086f80d6d388696f35dd5e5ae3c848de9583e51",
  "ai-gateway": "342cad66994dc68ec21c90a7b31753746f7d2935c2d0dcacf0f0c80fa5a619d1",
  "ai-ops": "c94ef422a8f447daa9336ce65ebae56958cb1550c5b3e73b5f70e12cce8ec88f",
  "predictive-ai-mlops": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
  llm: "026090fc37ab854e455179f9a940f13674784b0cb67d8338f31ac1789c554cac",
  "prompt-engineering": "ce3b16efe824db7e6014597082739fb3789aa304aa88bd3e7a0e02a5b2f39870",
  "fine-tuning": "32309070485d6a96e18382bfb09f74f991f842911f3609bb238e2b7f58ab02cc",
  "llm-training": "1ec338b98689954956857f62e3dc3769777c435979e372ded82dcb8250ed863b",
  "llm-inference": "1a732d72e0a2f584fe4fcd76f56b7913afe8fdc63d50080556095c9bb1adf973",
  "data-engineering": "bd739a88b2905ba7ab67b7c900ab4f39efc924cd7133357ad11e165c49f3d234",
  "ai-infra-platform": "b1d9886106ef81384e0bb1593c441a8760ca4d1ce1aae6978d9fd002535ffa70",
  "ai-infra-compute": "5739e718d368d17dd46a01cd35bcc7eb1c7d158c3bd84b3a66153abf1343ef9e",
});

const moduleKnowledgeViews = Object.freeze({
  "solution-patterns": "decision-blueprint",
  "model-landscape": "selection-coordinate",
  rag: "application-architecture",
  "ai-agent": "control-architecture",
  multimodal: "multimodal-evidence-pipeline",
  mcp: "mcp-host-server-boundary",
  a2a: "delegated-task-lifecycle",
  evaluation: "evaluation-flywheel",
  "ai-governance": "governance-assurance-loop",
  security: "threat-path",
  "ai-gateway": "gateway-policy-data-plane",
  "ai-ops": "operations-feedback-loop",
  "predictive-ai-mlops": "predictive-model-lifecycle",
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
    "方案边界", "PoC 验收", "TCO", "场景选择", "架构组合", "智能客服", "企业搜索",
    "内容生成", "AI Coding", "数字人", "ChatBI", "会议助手", "生产运营",
    "成本边界", "范围设计", "单位经济", "采购选型", "价值衡量", "内部结算",
  ]),
  "model-landscape": Object.freeze([
    "选型方法", "供应连续性", "TCO", "生命周期", "组合策略", "版本治理", "候选初筛", "退出策略",
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
  "ai-governance": Object.freeze([
    "职责边界", "框架边界", "标准边界", "系统清单", "风险分级", "第三方治理", "法规时效", "治理落地", "责任模型",
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
    "采样策略", "反馈治理", "成本异常", "安全回放", "告警设计", "职责边界", "发布清单", "模型升级",
    "测试方法", "影子发布", "平台边界", "事故归因", "建设边界", "发布评估", "容量经济", "Agent 归因",
    "异常管理", "优化边界",
  ]),
  "predictive-ai-mlops": Object.freeze([
    "路线选择", "特征治理", "模型注册", "漂移再训练", "效果验收", "服务形态", "发布治理", "平台边界", "更新策略",
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

export const publishedModules = Object.freeze(moduleSpecs.map(([slug, titleId, requiredTerms, routeKind, updatedAt, introducedAt]) => Object.freeze({
  slug,
  path: `/modules/${slug}`,
  titleId,
  requiredTerms: Object.freeze(requiredTerms),
  routeKind,
  introducedAt,
  legacyUndatedQuestionSetSha256: moduleLegacyUndatedQuestionSetSha256[slug],
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

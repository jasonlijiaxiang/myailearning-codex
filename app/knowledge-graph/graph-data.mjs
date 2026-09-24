import { layers, moduleList } from "../knowledge-map.mjs";
import { explicitTermRelations, knowledgeRelationTypes, termPrimaryModules } from "../knowledge-relations.mjs";
import { moduleDiscovery } from "../module-discovery.mjs";
import { terminology } from "../terminology.mjs";

/**
 * 公开动态探索与后台覆盖门禁共用的唯一图谱数据适配器。
 * 页面与质量检查不得复制模块、术语或关系内容，只能消费这里派生的稳定数据。
 */
export const graphLayers = Object.freeze(layers.map((layer) => Object.freeze({
  no: layer.no,
  name: layer.name,
  en: layer.en,
  moduleIds: Object.freeze(layer.modules.map((module) => module.slug)),
})));

export const graphModules = Object.freeze(moduleList.map((module) => Object.freeze({
  id: module.slug,
  zh: module.zh,
  en: module.en,
  href: module.href,
  layerNo: module.layerNo,
  layerName: module.layerName,
  summary: moduleDiscovery[/** @type {keyof typeof moduleDiscovery} */ (module.slug)].summary,
})));

export const graphTerms = Object.freeze(Object.entries(terminology).map(([termId, term]) => Object.freeze({
  id: termId,
  zh: term.zh,
  en: term.en,
  abbr: term.abbr,
  description: term.description,
  moduleIds: Object.freeze([...term.moduleSlugs]),
  primaryModuleId: termPrimaryModules[termId],
})));

// 这些跨模块关系只描述已经在正式模块中明确划分的机制和责任。
// sourceId 指向现有 Reference 台账；这里不另存来源标题或外链。
const moduleRelationInputs = [
  {
    from: "security", to: "rag", type: "control", sourceId: "owasp-vector-weaknesses",
    explanation: "RAG 负责召回和引用证据；安全层在检索时按当前用户与租户权限过滤片段，并在进入模型上下文前复核边界，防止越权内容被转述。",
    explanationEn: "RAG retrieves and cites evidence. Security filters passages by the current user's and tenant's access rights, then checks the boundary before passages enter the model context.",
  },
  {
    from: "security", to: "ai-agent", type: "control", sourceId: "openai-source-sink-injection",
    explanation: "Agent 可以提出工具动作；执行前由模型外的授权层核对身份、工具范围和业务状态，模型输出不授予执行权。",
    explanationEn: "An agent may propose a tool action. Authorization outside the model checks identity, tool scope, and business state before execution; model output grants no execution rights.",
  },
  {
    from: "security", to: "ai-governance", type: "prerequisite", sourceId: "nist-ai-rmf",
    explanation: "安全团队提供越权路径、技术控制和遏止能力的验证证据；治理负责人据此决定用途条件与残余风险。安全测试通过不等于用途获批。",
    explanationEn: "Security supplies evidence on unauthorized paths, technical controls, and containment. Governance uses it to decide use conditions and residual risk; passing a security test does not approve a use.",
  },
  {
    from: "evaluation", to: "ai-governance", type: "prerequisite", sourceId: "nist-ai-rmf",
    explanation: "评估提供具体用途、受影响人群和失败切片的测量证据；治理据此设置批准条件，业务责任人决定是否接受残余风险。",
    explanationEn: "Evaluation measures outcomes for the specific use, affected groups, and failure slices. Governance sets approval conditions from that evidence; the business owner decides whether to accept residual risk.",
  },
  {
    from: "ai-governance", to: "ai-ops", type: "control", sourceId: "nist-ai-rmf",
    explanation: "治理批准绑定用途、版本和运行条件；AI Ops 发布或恢复前核对批准状态，重大变更先触发复审。",
    explanationEn: "Governance approval is tied to a use, version, and operating conditions. AI Ops checks that approval before release or recovery and sends material changes back for review.",
  },
  {
    from: "evaluation", to: "ai-ops", type: "control", sourceId: "openai-eval-best-practices",
    explanation: "评估把版本化任务集、关键风险切片和不可补偿门槛交给 AI Ops；AI Ops 阻断不合格发布，再把线上故障写回评估集验证修复。",
    explanationEn: "Evaluation hands versioned tasks, critical risk slices, and hard gates to AI Ops. AI Ops blocks an unfit release and feeds production failures back into the evaluation set to verify fixes.",
  },
  {
    from: "ai-governance", to: "predictive-ai-mlops", type: "control", sourceId: "nist-ai-rmf",
    explanation: "高影响预测用途的批准取决于受影响人群、误判代价和监督方式；MLOps 保留模型、特征、阈值与成熟真值的版本证据。",
    explanationEn: "Approval of a high-impact predictive use depends on affected groups, error costs, and oversight. MLOps retains versioned evidence for the model, features, thresholds, and mature labels.",
  },
];

const moduleIds = new Set(graphModules.map((module) => module.id));
for (const relation of moduleRelationInputs) {
  if (!moduleIds.has(relation.from) || !moduleIds.has(relation.to) || relation.from === relation.to) {
    throw new Error(`Invalid knowledge graph module relation: ${relation.from} -> ${relation.to}`);
  }
  if (!Object.hasOwn(knowledgeRelationTypes, relation.type)) {
    throw new Error(`Unknown knowledge graph relation type: ${relation.type}`);
  }
}

export const graphModuleRelations = Object.freeze(moduleRelationInputs.map((relation) => Object.freeze({
  id: `module:${relation.from}:${relation.type}:${relation.to}`,
  kind: "module",
  direction: "directed",
  status: "published",
  ...relation,
})));

export const graphRelations = Object.freeze([
  ...explicitTermRelations.map((relation) => Object.freeze({ ...relation })),
  ...graphModuleRelations,
]);
export const graphRelationTypes = Object.freeze(Object.fromEntries(
  Object.entries(knowledgeRelationTypes).map(([id, value]) => [id, Object.freeze({ ...value })]),
));

export const graphModuleCoverage = Object.freeze(graphModules.map((module) => {
  const relatedTerms = graphTerms.filter((term) => term.moduleIds.includes(module.id) && term.id !== module.id);
  return Object.freeze({
    moduleId: module.id,
    termCount: relatedTerms.length,
    primaryTermCount: relatedTerms.filter((term) => term.primaryModuleId === module.id).length,
  });
}));

export const graphOverviewPolicy = Object.freeze({
  requiresSharedTerm: true,
});

export const graphOverviewLinks = Object.freeze((() => {
  const links = [];
  for (let fromIndex = 0; fromIndex < graphModules.length; fromIndex += 1) {
    for (let toIndex = fromIndex + 1; toIndex < graphModules.length; toIndex += 1) {
      const from = graphModules[fromIndex];
      const to = graphModules[toIndex];
      const termIds = graphTerms
        .filter((term) => term.moduleIds.includes(from.id) && term.moduleIds.includes(to.id))
        .map((term) => term.id);
      if (!termIds.length) continue;
      links.push(Object.freeze({
        id: `${from.id}:shared-terms:${to.id}`,
        from: from.id,
        to: to.id,
        termIds: Object.freeze(termIds),
        sharedTermCount: termIds.length,
      }));
    }
  }
  return links
    .sort((left, right) => right.sharedTermCount - left.sharedTermCount || left.id.localeCompare(right.id));
})());

export const graphScalePolicy = Object.freeze({
  highDegreeWarning: 20,
});

export const graphHealth = Object.freeze((() => {
  const degree = new Map(graphTerms.map((term) => [term.id, term.moduleIds.length]));
  for (const relation of graphRelations) {
    if ("kind" in relation && relation.kind === "module") continue;
    degree.set(relation.from, (degree.get(relation.from) ?? 0) + 1);
    degree.set(relation.to, (degree.get(relation.to) ?? 0) + 1);
  }
  return {
    isolatedTermIds: Object.freeze(graphTerms.filter((term) => (degree.get(term.id) ?? 0) === 0).map((term) => term.id)),
    highDegreeTermIds: Object.freeze([...degree.entries()].filter(([, count]) => count > graphScalePolicy.highDegreeWarning).map(([id]) => id)),
    maximumDegree: Math.max(...degree.values()),
  };
})());

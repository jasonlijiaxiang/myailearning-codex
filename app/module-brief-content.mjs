import {
  a2aBrief,
  evaluationBrief,
  mcpBrief,
  multimodalBrief,
  securityBrief,
  solutionPatternsBrief,
} from "./module-briefs-app-protocol.mjs";
import { fineTuning, llm, llmTraining, modelLandscape } from "./module-briefs-foundations.mjs";
import { aiApplicationEngineeringContribution, aiFinopsContribution } from "./module-briefs-application-finops.mjs";
import { aiGovernanceBrief, predictiveAiMlopsBrief } from "./module-briefs-governance-mlops.mjs";
import { agentPlatformBriefs } from "./module-content-agent-platforms.mjs";
import {
  aiGatewayBrief,
  aiInfraComputeBrief,
  aiInfraPlatformBrief,
  aiOpsBrief,
  dataEngineeringBrief,
  llmInferenceBrief,
} from "./module-briefs-platform.mjs";
import { moduleQaExpansion } from "./module-qa-expansion.mjs";
import { completionQa } from "./module-completion-content.mjs";
import { moduleQuestionDepthExpansion } from "./module-question-depth-expansion.mjs";

const withExpandedQa = (brief) => Object.freeze({
  ...brief,
  qa: Object.freeze([
    ...brief.qa,
    ...moduleQaExpansion[brief.slug],
    ...(completionQa[brief.slug] ?? []),
    ...(moduleQuestionDepthExpansion[brief.slug] ?? []),
  ]),
});

const operationalFinopsTags = new Set(["容量经济", "Agent 归因", "异常管理", "优化边界"]);

const mergedSolutionPatternsBrief = Object.freeze({
  ...solutionPatternsBrief,
  definition: `${solutionPatternsBrief.definition} 成本归因与优化门槛也要在方案中写清，而不是留到上线后才补账。`,
  principles: Object.freeze([
    ...solutionPatternsBrief.principles,
    ...aiFinopsContribution.principles.filter((item) => ["稳定归因", "优化有门"].includes(item.zh)),
  ]),
  decisions: Object.freeze([
    ...solutionPatternsBrief.decisions,
    ...aiFinopsContribution.decisions.filter((item) => [
      "AI 是否需要独立 FinOps 范围？",
      "最重要的单位成本是什么？",
      "先路由、缓存还是换小模型？",
      "怎样给 Agent 设置预算？",
    ].includes(item.question)),
  ]),
  deepDives: Object.freeze([
    ...solutionPatternsBrief.deepDives,
    ...aiFinopsContribution.deepDives.filter((item) => item.title === "AI 成本经营的五段闭环"),
  ]),
  cloudHooks: Object.freeze([
    ...solutionPatternsBrief.cloudHooks,
    ...aiFinopsContribution.cloudHooks.filter((item) => [
      "采集与分配（Inform）",
      "价值与预算（Value）",
      "工程优化（Optimize）",
    ].includes(item.stage)),
  ]),
  relatedSlugs: Object.freeze([
    ...new Set([...solutionPatternsBrief.relatedSlugs, "ai-ops", "ai-gateway", "ai-infra-compute"]),
  ]),
  qa: Object.freeze([
    ...solutionPatternsBrief.qa,
    ...aiFinopsContribution.qa.filter((item) => !operationalFinopsTags.has(item.tag)),
  ]),
  evidenceCards: Object.freeze([
    ...solutionPatternsBrief.evidenceCards,
    ...aiFinopsContribution.evidenceCards,
  ]),
});

const mergedAiOpsBrief = Object.freeze({
  ...aiOpsBrief,
  definition: "AI 应用工程与运营（AI Application Engineering & GenAIOps）把模型、Prompt、检索、工具、工作流、策略、评估与运行配置作为一个可发布、可观测、可停止和可恢复的软件系统管理。每次变更与生产任务记录落在同一条证据链中，用来验证质量、风险、成本和业务终态。",
  position: "横跨 RAG、Agent、多模态、AI 网关和模型服务的交付与运行生命周期；它负责跨组件发布单元、真实流量、质量、成本与事故恢复，不替代 Agent 编排、业务授权或各领域自己的事实源。",
  principles: Object.freeze([
    ...aiApplicationEngineeringContribution.principles.filter((item) => !["受控发布", "持续改进"].includes(item.zh)),
    ...aiOpsBrief.principles.map((item) => {
      if (item.zh === "端到端追踪") {
        return {
          ...item,
          explanation: "一次业务任务可能包含多次检索、模型和工具调用，需要用同一 trace 关联版本、输入摘要、结果、时延、token、成本与错误。租户、产品、场景、预算和负责人标签让这条记录能归到可决策的对象；异步与多 Agent 路径也要继承关联。",
          decision: "任务记录从业务系统读取成功状态，模型或框架 span 解释中间过程和失败位置；标签只覆盖会改变投资、容量或责任判断的维度。",
        };
      }
      if (item.zh === "成本与容量") {
        return {
          ...item,
          explanation: "成本来自模型、检索、工具、重试、沙箱、存储和人工接管，应按完整成功任务而非单次模型调用归集。路由、缓存、批处理、量化和预留会改变成本，也会重新分配质量、时延、隔离与恢复风险。",
          decision: "先拆解失败重试、无效上下文、循环工具调用和低命中缓存；每项优化都要在质量、风险和 SLO 保护组中验证，不能只看账单下降。",
        };
      }
      return item;
    }),
  ]),
  decisions: Object.freeze([
    ...aiApplicationEngineeringContribution.decisions.map((item) => {
      if (item.question === "影子流量还是直接 A/B 测试？") {
        return {
          question: "更新怎样用回放、影子、灰度或 A/B 放量？",
          signal: "新版本需要接触真实分布，但结果可能影响用户或产生工具副作用；不同语言、客户群、工具和安全场景也可能出现局部回退。",
          recommendation: "先离线回放，再用无副作用影子验证；对低风险、可撤销流量灰度或 A/B，并按关键分组比较业务成功、风险、P95 与每个成功任务成本。高影响动作只记录拟议结果。",
          boundary: "影子不能执行不可逆动作，也不能未经治理保存全部生产输入；发布记录要绑定对照版本、候选版本和预验证回滚动作。",
        };
      }
      return item;
    }),
    ...aiOpsBrief.decisions.filter((item) => item.question !== "模型或 Prompt 更新怎样放量？"),
  ]),
  deepDiveTitle: "把变更和事故还原为可处理的证据",
  deepDiveLead: "发布前先界定变化半径；事故发生后再用同一任务、制品、版本和业务终态还原条件并安全恢复。",
  deepDives: Object.freeze([
    ...aiApplicationEngineeringContribution.deepDives.filter((item) => item.title === "一次变化需要重测哪些层"),
    ...aiOpsBrief.deepDives,
  ]),
  criticalBoundary: "本模块负责让跨组件变更可验证、可发布、可观测与可恢复。它不替代业务系统的权威终态、Agent 的业务编排、业务授权，或评估、安全、数据和基础设施各自的事实源；也不是传统 AIOps 的告警降噪或 GPU 监控。Trace、评估与成本数据是证据，不能自动证明答案正确或授予动作权限。",
  cloudHooks: Object.freeze([
    ...aiApplicationEngineeringContribution.cloudHooks
      .filter((item) => ["开发与实验（Develop）", "验证与门禁（Validate）"].includes(item.stage))
      .map((item) => (item.stage === "验证与门禁（Validate）" ? {
        ...item,
        stage: "验证、评估与门禁（Validate）",
        services: "评估平台、数据集与标注、合约测试、安全测试、策略即代码",
        value: "把质量、风险、性能和成本变成发布证据，并把裁决后的线上失败沉淀为下一次回归输入。",
        discover: "哪些错误必须单独阻断发布？谁提供权威答案，裁判与人工如何校准并维护样本？",
      } : item)),
    ...aiOpsBrief.cloudHooks.filter((item) => [
      "遥测底座（Telemetry Foundation）",
      "发布与事件响应（Release & Incident）",
      "治理与 FinOps（Governance & FinOps）",
    ].includes(item.stage)),
  ]),
  relatedSlugs: Object.freeze([
    ...new Set([
      ...aiApplicationEngineeringContribution.relatedSlugs.filter((slug) => !["ai-application-engineering", "ai-finops", "ai-ops"].includes(slug)),
      ...aiOpsBrief.relatedSlugs.filter((slug) => !["ai-application-engineering", "ai-finops", "ai-ops"].includes(slug)),
      "solution-patterns",
    ]),
  ]),
  qa: Object.freeze([
    ...aiApplicationEngineeringContribution.qa,
    ...aiOpsBrief.qa,
    ...aiFinopsContribution.qa.filter((item) => operationalFinopsTags.has(item.tag)),
  ]),
  evidenceCards: Object.freeze([
    ...aiApplicationEngineeringContribution.evidenceCards,
    ...aiOpsBrief.evidenceCards,
  ]),
});

export const moduleBriefs = Object.freeze({
  [mergedSolutionPatternsBrief.slug]: withExpandedQa(mergedSolutionPatternsBrief),
  [modelLandscape.slug]: withExpandedQa(modelLandscape),
  [multimodalBrief.slug]: withExpandedQa(multimodalBrief),
  [mcpBrief.slug]: withExpandedQa(mcpBrief),
  [a2aBrief.slug]: withExpandedQa(a2aBrief),
  [agentPlatformBriefs.veadk.slug]: withExpandedQa(agentPlatformBriefs.veadk),
  [agentPlatformBriefs.agentkit.slug]: withExpandedQa(agentPlatformBriefs.agentkit),
  [evaluationBrief.slug]: withExpandedQa(evaluationBrief),
  [aiGovernanceBrief.slug]: withExpandedQa(aiGovernanceBrief),
  [securityBrief.slug]: withExpandedQa(securityBrief),
  [aiGatewayBrief.slug]: withExpandedQa(aiGatewayBrief),
  [mergedAiOpsBrief.slug]: withExpandedQa(mergedAiOpsBrief),
  [predictiveAiMlopsBrief.slug]: withExpandedQa(predictiveAiMlopsBrief),
  [llm.slug]: withExpandedQa(llm),
  [fineTuning.slug]: withExpandedQa(fineTuning),
  [llmTraining.slug]: withExpandedQa(llmTraining),
  [llmInferenceBrief.slug]: withExpandedQa(llmInferenceBrief),
  [dataEngineeringBrief.slug]: withExpandedQa(dataEngineeringBrief),
  [aiInfraPlatformBrief.slug]: withExpandedQa(aiInfraPlatformBrief),
  [aiInfraComputeBrief.slug]: withExpandedQa(aiInfraComputeBrief),
});


export function requireModuleBrief(slug) {
  const brief = moduleBriefs[slug];
  if (!brief) throw new Error(`Unknown module brief: ${slug}`);
  return brief;
}

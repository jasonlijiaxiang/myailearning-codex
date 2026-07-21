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
  definition: `${solutionPatternsBrief.definition} 其中的经营判断用 AI FinOps 方法把完整成本、单位经济、预算与价值连接到同一业务结果。`,
  principles: Object.freeze([
    ...solutionPatternsBrief.principles,
    ...aiFinopsContribution.principles.filter((item) => ["完整成本边界", "单位经济", "持续经营"].includes(item.zh)),
  ]),
  decisions: Object.freeze([
    ...solutionPatternsBrief.decisions,
    ...aiFinopsContribution.decisions,
  ]),
  deepDives: Object.freeze([
    ...solutionPatternsBrief.deepDives,
    ...aiFinopsContribution.deepDives,
  ]),
  cloudHooks: Object.freeze([
    ...solutionPatternsBrief.cloudHooks,
    ...aiFinopsContribution.cloudHooks,
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
  definition: "AI 应用工程与运营（AI Application Engineering & GenAIOps）把模型、Prompt、检索、工具、工作流、策略、评估与运行配置作为一个可测试、可发布、可观测、可回滚的系统，并用生产证据持续改进。",
  position: "横跨 RAG、Agent、多模态、AI 网关和模型服务的交付与运行生命周期；它管理跨组件发布单元、真实流量、质量、成本与事故闭环，不负责替代 Agent 编排、业务授权或各组件自己的事实源。",
  principles: Object.freeze([
    ...aiApplicationEngineeringContribution.principles,
    ...aiOpsBrief.principles,
    ...aiFinopsContribution.principles.filter((item) => ["稳定归因", "优化有门"].includes(item.zh)),
  ]),
  decisions: Object.freeze([
    ...aiApplicationEngineeringContribution.decisions,
    ...aiOpsBrief.decisions,
  ]),
  deepDiveTitle: "从可重放发布单元走向可归因的生产闭环",
  deepDiveLead: "工程与运营共享同一组任务、制品、版本和业务终态：发布前证明候选可接受，发布后证明真实分布仍然可控，并在事故中安全恢复。",
  deepDives: Object.freeze([
    ...aiApplicationEngineeringContribution.deepDives,
    ...aiOpsBrief.deepDives,
  ]),
  criticalBoundary: aiApplicationEngineeringContribution.criticalBoundary,
  cloudHooks: Object.freeze([
    ...aiApplicationEngineeringContribution.cloudHooks,
    ...aiOpsBrief.cloudHooks,
  ]),
  relatedSlugs: Object.freeze([
    ...new Set([
      ...aiApplicationEngineeringContribution.relatedSlugs.filter((slug) => !["ai-application-engineering", "ai-finops"].includes(slug)),
      ...aiOpsBrief.relatedSlugs.filter((slug) => !["ai-application-engineering", "ai-finops"].includes(slug)),
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

export const moduleBriefSlugs = Object.freeze(Object.keys(moduleBriefs));

export function requireModuleBrief(slug) {
  const brief = moduleBriefs[slug];
  if (!brief) throw new Error(`Unknown module brief: ${slug}`);
  return brief;
}

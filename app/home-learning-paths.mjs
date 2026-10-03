/**
 * 中文首页学习入口数据。
 *
 * 场景路径按学习任务组织；时间预算路径按可用时间组织。所有目标必须
 * 能解析到正式模块、问答锚点或实战入口，不保存第二份答案内容。
 */
import { moduleManifests } from "./modules/index.mjs";

export const timeBudgetPaths = Object.freeze([
  Object.freeze({
    id: "time-10min",
    label: "10 分钟速查",
    duration: "碎片时间",
    focus: "找到相关核心问题，准备结论、关键边界和下一问。",
    href: "/questions?view=field-kit",
    steps: Object.freeze([
      Object.freeze({ type: "field-kit", label: "打开精选题" }),
      Object.freeze({ type: "question", label: "锁定 1 个核心判断" }),
      Object.freeze({ type: "fallback", label: "准备兜底话术" }),
    ]),
    deliverable: "一页问题卡：结论、边界、下一问、需要核验的事实。",
  }),
  Object.freeze({
    id: "time-30min",
    label: "30 分钟快速复习",
    duration: "开始一个新主题时",
    focus: "形成学习目标、三个关键问题、一个主要风险和一个下一步验证动作。",
    href: "/questions?view=field-kit",
    steps: Object.freeze([
      Object.freeze({ type: "module", label: "进入方案与选型层", slug: "solution-patterns" }),
      Object.freeze({ type: "question", label: "选 3 道意图题" }),
      Object.freeze({ type: "module", label: "沿相关模块读边界", slug: "evaluation" }),
    ]),
    deliverable: "复习清单：目标、三个问题、主要风险和验证动作。",
  }),
  Object.freeze({
    id: "time-2h",
    label: "2 小时重点学习",
    duration: "深入一个模块时",
    focus: "沿一个场景阅读机制、边界、评估和运营内容，形成方案假设与未知清单。",
    href: "/modules/solution-patterns",
    steps: Object.freeze([
      Object.freeze({ type: "module", label: "冻结结果与基线", slug: "solution-patterns" }),
      Object.freeze({ type: "module", label: "补齐数据与权限", slug: "data-engineering" }),
      Object.freeze({ type: "module", label: "设计评估与验收", slug: "evaluation" }),
      Object.freeze({ type: "module", label: "把上线运营写进方案", slug: "ai-ops" }),
    ]),
    deliverable: "方案假设、责任边界、PoC 建议和未知信息清单。",
  }),
  Object.freeze({
    id: "time-system",
    label: "系统学习",
    duration: "按个人节奏",
    focus: "理解相关模块如何协作与取舍，完成一个端到端场景蓝图。",
    href: "/knowledge-graph",
    steps: Object.freeze([
      Object.freeze({ type: "module", label: "建立模块关系", slug: "solution-patterns" }),
      Object.freeze({ type: "module", label: "沿应用模式学习", slug: "rag" }),
      Object.freeze({ type: "module", label: "完成治理与持续改进", slug: "ai-ops" }),
      Object.freeze({ type: "module", label: "验证跨模块蓝图", slug: "model-landscape" }),
    ]),
    deliverable: "个人知识缺口清单与一个端到端场景蓝图。",
  }),
]);

export const scenarioDefinitionsForHome = Object.freeze([
  ...moduleManifests.filter((manifest) => manifest.category === "scenario").map((manifest) => Object.freeze({
    id: `scenario-${manifest.slug}`,
    title: manifest.zh,
    href: `/modules/${manifest.slug}`,
  })),
  Object.freeze({ id: "scenario-first", title: "第一次接触 AI 平台", href: "/questions?view=field-kit" }),
  Object.freeze({ id: "scenario-knowledge", title: "正在设计企业知识助手", href: "/questions?module=rag" }),
  Object.freeze({ id: "scenario-agent", title: "学习 AI 如何执行业务任务", href: "/questions?module=ai-agent" }),
  Object.freeze({ id: "scenario-infra", title: "规划私有化 AI 基础设施", href: "/questions?module=ai-infra-compute" }),
  Object.freeze({ id: "scenario-china", title: "合规分诊", href: "/modules/ai-governance" }),
  Object.freeze({ id: "scenario-multimodal", title: "多模态体验与内容交付", href: "/modules/multimodal" }),
  Object.freeze({ id: "scenario-blueprint", title: "跨行业迁移蓝图", href: "/modules/solution-patterns" }),
]);

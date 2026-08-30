function freezeDirectory(items) {
  return Object.freeze(items.map((item) => Object.freeze(item)));
}

function defineConfig({ facts, primer, shortTitle }) {
  const quick = freezeDirectory([
    primer,
    { id: "decisions", label: "方案判断", eyebrow: "明确责任转交" },
  ]);
  const learn = freezeDirectory([
    { id: "principle", label: "机制速览", eyebrow: "建立工作模型" },
    { id: "study-guide", label: "学习与练习", eyebrow: "形成可复核产物" },
    { id: "curriculum", label: "知识地图", eyebrow: "补齐理论版图" },
    { id: "deep-dive", label: "工程深挖", eyebrow: "定位失败与边界" },
  ]);
  const field = freezeDirectory([
    { id: "evidence", label: "证据与边界", eyebrow: "说明来源能证明什么" },
    { id: "cloud", label: "云能力与责任", eyebrow: "连接交付与验收" },
    { id: "qa", label: "客户问题", eyebrow: "带边界回答" },
    { id: "related-modules", label: "相关模块", eyebrow: "查看上下游主题" },
  ]);

  return Object.freeze({
    shortTitle,
    facts: Object.freeze(facts.map((fact) => Object.freeze(fact))),
    directories: Object.freeze({ quick, learn, field }),
  });
}

const configs = Object.freeze({
  "model-landscape": defineConfig({
    shortTitle: "模型选型",
    primer: { id: "model-landscape-extension-primer-title", label: "选型坐标", eyebrow: "从业务损失到退出证明" },
    facts: [
      { label: "判断起点", value: "任务、不可接受损失与交付硬门" },
      { label: "候选身份", value: "提供方 × 端点 × 地域 × 精确版本 × 交付形态" },
      { label: "试点合同", value: "同一 Prompt、上下文、工具、Schema、预算与考卷" },
      { label: "退出证明", value: "备用候选通过相同硬门；否则阻断或转人工" },
    ],
  }),
  llm: defineConfig({
    shortTitle: "LLM",
    primer: { id: "llm-theory-primer-title", label: "生成主线", eyebrow: "从 Token 到输出" },
    facts: [
      { label: "生成机制", value: "Token 表示 → 上下文交互 → 自回归采样" },
      { label: "诊断顺序", value: "分开能力、证据、指令、解码、服务与编排" },
      { label: "性能转交", value: "质量达标后再把容量与时延交给推理平台" },
      { label: "生产边界", value: "流畅输出不证明事实、授权或业务动作有效" },
    ],
  }),
  "data-engineering": defineConfig({
    shortTitle: "AI 数据",
    primer: { id: "data-engineering-extension-primer-title", label: "数据血缘主线", eyebrow: "从权威源到撤回" },
    facts: [
      { label: "准入条件", value: "权威来源、允许用途、稳定身份" },
      { label: "生命周期", value: "连接 → 解析 → 裁决 → 派生 → 发布 → 撤回" },
      { label: "生产门禁", value: "结构、版本、策略引用、质量与血缘可验证" },
      { label: "完成证明", value: "状态到达全部派生层，并通过负向探针" },
    ],
  }),
});

export const unifiedBriefModuleSlugs = Object.freeze(Object.keys(configs));

export function getUnifiedBriefModuleConfig(slug) {
  return configs[slug] ?? null;
}

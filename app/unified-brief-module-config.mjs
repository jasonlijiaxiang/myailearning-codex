function freezeDirectory(items) {
  return Object.freeze(items.map((item) => Object.freeze(item)));
}

function defineConfig({ facts, mechanismId = "principle", primer, shortTitle }) {
  const quick = freezeDirectory([
    primer,
    { id: "decisions", label: "方案判断", eyebrow: "明确责任转交" },
  ]);
  const learn = freezeDirectory([
    { id: mechanismId, label: "机制速览", eyebrow: "建立工作模型" },
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
  "solution-patterns": defineConfig({
    shortTitle: "场景解决方案",
    mechanismId: "mechanism-summary",
    primer: { id: "solution-pattern-primer-title", label: "决策蓝图", eyebrow: "从业务结果到可验收闭环" },
    facts: [
      { label: "方案起点", value: "业务结果 × 当前基线 × 权威终态 × Owner" },
      { label: "最小闭环", value: "先比较无 AI、规则与单次模型；只为必要责任增加组件" },
      { label: "交付阶段", value: "Discovery → PoC → Pilot → Production" },
      { label: "经营与退出", value: "每个达标结果的完整成本 + 回滚、迁移与停服" },
    ],
  }),
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
  multimodal: defineConfig({
    shortTitle: "多模态",
    primer: { id: "multimodal-extension-primer-title", label: "证据管线", eyebrow: "定位信息损失" },
    facts: [
      { label: "采用条件", value: "非文本信息会改变任务判断" },
      { label: "证据坐标", value: "资产 × 页面/区域 × 时间段/说话人" },
      { label: "路线选择", value: "专用解析、原生模型与混合路线同卷比较" },
      { label: "安全降级", value: "重采、专用处理或责任复核；不继续猜" },
    ],
  }),
  veadk: defineConfig({
    shortTitle: "VeADK",
    primer: { id: "veadk-extension-primer-title", label: "Agent 交付桥", eyebrow: "定义、执行、状态、适配、证明" },
    facts: [
      { label: "实现基线", value: "固定源码中 Agent 与 Runner 扩展 Google ADK" },
      { label: "执行记录", value: "root_agent 版本 × Runner 事件 × Session 作用域" },
      { label: "状态边界", value: "会话、长期记忆与权威事实分层" },
      { label: "生产转交", value: "create_agentkit_app ≠ Runtime 已部署" },
    ],
  }),
  agentkit: defineConfig({
    shortTitle: "AgentKit",
    primer: { id: "agentkit-extension-primer-title", label: "应用到 Runtime", eyebrow: "从应用合同到上线证据" },
    facts: [
      { label: "应用合同", value: "入口 × 依赖 × 配置 × 调用接口" },
      { label: "交付链", value: "Source → Image → Runtime → 目标环境验证" },
      { label: "状态边界", value: "共享 Session 与受治理 Memory 分层；Memory ≠ 权威事实" },
      { label: "上线证明", value: "Runtime Ready ≠ 客户 SLO 或生产验收" },
    ],
  }),
  evaluation: defineConfig({
    shortTitle: "评估",
    primer: { id: "evaluation-extension-primer-title", label: "评估契约", eyebrow: "先定义决定，再定义分数" },
    facts: [
      { label: "评估单元", value: "版本元组 × 任务切片 × 环境 × 评分器" },
      { label: "评分分工", value: "代码验证终态 · 校准 Judge 评语义 · 人工裁决" },
      { label: "发布门禁", value: "重复试验、关键切片、不确定性与不可补偿硬门" },
      { label: "责任转交", value: "Evaluation 建议 · AI Ops 执行 · Governance 批准例外" },
    ],
  }),
  "ai-governance": defineConfig({
    shortTitle: "AI 治理",
    primer: { id: "ai-governance-extension-primer-title", label: "治理保证闭环", eyebrow: "从受治理用途到重新评估" },
    facts: [
      { label: "治理主键", value: "用途 × 人群 × 决定 × 数据 × 供应商 × 地区" },
      { label: "保证闭环", value: "登记 → 分级 → 保证 → 运营 / 复审" },
      { label: "批准状态", value: "Approve · Conditional · Hold · No-Go，均绑定证据与条件" },
      { label: "变化门禁", value: "重大变化先暂停受影响范围，再补证与重决策" },
    ],
  }),
  security: defineConfig({
    shortTitle: "AI 安全",
    primer: { id: "security-threat-primer-title", label: "威胁路径", eyebrow: "从恶意简历到 ATS 终态" },
    facts: [
      { label: "威胁起点", value: "不可接受损失 × 不可信 Source × 高影响 Sink" },
      { label: "数据边界", value: "招聘人员 × 职位 × 候选人 × 用途；检索时 ACL" },
      { label: "动作边界", value: "模型形成有据提案；真实身份与确定性策略授权 ATS" },
      { label: "恢复证明", value: "暂停写入 → 撤销凭据 → 核对 ATS 终态 → 补偿 → 回归" },
    ],
  }),
  "ai-gateway": defineConfig({
    shortTitle: "AI 网关",
    primer: { id: "ai-gateway-extension-primer-title", label: "策略与数据面", eyebrow: "沿一次请求检查控制证据" },
    facts: [
      { label: "引入条件", value: "消除重复控制，或形成可验证的治理证据" },
      { label: "策略上下文", value: "主体 × 任务 × 数据级别 × 地域 × 模型 / 工具 × 版本" },
      { label: "请求证据", value: "策略版本 × 路由理由 × 实际调用尝试 × 业务终态" },
      { label: "故障转移", value: "HTTP 200 ≠ 能力、质量、地域、安全或授权等价" },
    ],
  }),
  "ai-ops": defineConfig({
    shortTitle: "AI Ops",
    primer: { id: "ai-ops-extension-primer-title", label: "交付恢复闭环", eyebrow: "组装、验证、发布、观测、恢复" },
    facts: [
      { label: "发布单元", value: "模型 · Prompt · 数据或索引 · 工具 · 工作流 · 策略 · 运行配置" },
      { label: "测试分层", value: "代码契约 · 语义质量 · 风险 · 性能 · 业务终态" },
      { label: "受控流量", value: "回放 → 无副作用影子 → 灰度 → 回滚" },
      { label: "改进门禁", value: "隐私审查 · 去重 · 溯源 · 裁决后进入回归集" },
    ],
  }),
  "predictive-ai-mlops": defineConfig({
    shortTitle: "预测式 AI / MLOps",
    primer: { id: "predictive-ai-mlops-extension-primer-title", label: "预测生命周期", eyebrow: "从任务合同到成熟真值" },
    facts: [
      { label: "任务合同", value: "实体 × 预测时点 × 标签窗口 × 业务动作 × 误判成本" },
      { label: "时间正确", value: "每条训练样本只使用预测时点已可获得的信息" },
      { label: "发布身份", value: "模型 × 特征 × 预处理 × 镜像 × 配置 × 阈值 × 策略 × 批准" },
      { label: "更新边界", value: "漂移 → 调查；训练 → 候选；发布门 → 生产替换" },
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

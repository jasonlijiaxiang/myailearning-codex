/**
 * 首页检索使用的售前任务语言。这里描述客户何时需要某个模块，不重复正文。
 */
export const moduleDiscovery = Object.freeze({
  "solution-patterns": Object.freeze({ summary: "把业务目标拆成可验证的 AI 能力、流程和责任边界。", cue: "客户只有宏大愿景，还没有清晰场景与验收口径" }),
  "model-landscape": Object.freeze({ summary: "从质量、时延、成本、部署与治理约束选择模型组合。", cue: "客户问哪一个模型最好，或希望同时使用多个模型" }),
  rag: Object.freeze({ summary: "用可更新、可授权、可引用的外部证据增强模型回答。", cue: "答案必须基于企业知识，并说明出处和适用范围" }),
  "ai-agent": Object.freeze({ summary: "让模型在受控循环中规划、调用工具并推进业务任务。", cue: "客户希望 AI 不只回答，还要跨系统完成动作" }),
  multimodal: Object.freeze({ summary: "让文本、图像、语音、视频与版面信息共同参与理解。", cue: "关键信息藏在表格、图纸、扫描件、录音或视频中" }),
  mcp: Object.freeze({ summary: "标准化模型与工具、数据资源及提示能力之间的连接。", cue: "团队要复用工具接入，并控制远程调用与授权边界" }),
  a2a: Object.freeze({ summary: "让独立 Agent 发现、委托、协作并跟踪持久任务。", cue: "多个团队或系统拥有各自 Agent，需要跨边界协作" }),
  evaluation: Object.freeze({ summary: "把好不好用变成任务集、指标、回归和发布门禁。", cue: "PoC 看起来不错，但没人能说明是否达到上线标准" }),
  "ai-governance": Object.freeze({ summary: "用系统清单、风险分级、责任与证据持续治理 AI 生命周期。", cue: "组织正在扩大 AI 使用，却无法回答谁负责、为何允许和怎样证明" }),
  security: Object.freeze({ summary: "控制不可信输入、模型行为、敏感数据和高影响动作。", cue: "客户担心提示注入、越权、泄漏或不可逆业务动作" }),
  "ai-gateway": Object.freeze({ summary: "集中管理模型路由、配额、策略、缓存与调用治理。", cue: "模型供应商和应用增多，成本、策略与流量开始失控" }),
  "ai-ops": Object.freeze({ summary: "把质量、轨迹、时延、成本与版本变化放进一套持续改进流程。", cue: "上线后出现退化，却无法判断是数据、模型还是应用变化" }),
  "predictive-ai-mlops": Object.freeze({ summary: "把预测模型的数据、特征、训练、注册、发布与监控连成可复现生命周期。", cue: "传统机器学习能训练，却无法稳定上线、回滚或解释线上退化" }),
  llm: Object.freeze({ summary: "理解 Transformer、上下文、生成概率与模型能力边界。", cue: "需要解释模型为什么会生成、遗忘、幻觉或受上下文影响" }),
  "prompt-engineering": Object.freeze({ summary: "把指令、上下文、工具和输出契约组织成可发布资产。", cue: "Prompt 靠个人试错，修改后无法证明效果或安全性" }),
  "fine-tuning": Object.freeze({ summary: "用高质量样本改变稳定行为、风格或任务模式。", cue: "仅靠 Prompt 难以稳定达成专门行为或格式" }),
  "llm-training": Object.freeze({ summary: "理解数据、并行、优化、通信和恢复构成的训练系统。", cue: "客户计划自训或续训模型，需要评估数据与集群可行性" }),
  "llm-inference": Object.freeze({ summary: "在延迟、吞吐、显存、质量与成本之间设计服务策略。", cue: "模型能跑但并发、首 token、长上下文或成本不达标" }),
  "data-engineering": Object.freeze({ summary: "把原始内容变成可信、可追溯、可删除的 AI 数据产品。", cue: "数据分散、解析失真、版本冲突或权限无法同步" }),
  "ai-infra-platform": Object.freeze({ summary: "用集群、调度、运行时与运维体系稳定承载 AI 工作负载。", cue: "GPU 有空闲却排队，环境升级频繁破坏任务" }),
  "ai-infra-compute": Object.freeze({ summary: "从计算、显存、网络、存储和功耗判断算力方案。", cue: "客户准备采购 GPU，但缺少基于负载的容量与瓶颈证据" }),
});

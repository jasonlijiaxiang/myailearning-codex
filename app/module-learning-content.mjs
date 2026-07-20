/**
 * 16 个共享模块的网页原生学习路线与实战任务。
 *
 * external_reference 中的讲义只用于发现覆盖面与学习难点；这里重新按
 * “建立心智模型 -> 做出方案判断 -> 用证据验收”组织，不复刻 PPT 页序。
 * 所有公开依据仍只引用 reference-content.mjs 中的稳定 sourceId。
 */
export const moduleLearningContent = Object.freeze({
  "solution-patterns": {
    outcomes: ["把业务目标改写成可验收的一页约定", "从检索、生成、行动与人工控制搭配方案", "设计能证伪方案假设的 PoC", "用质量、风险与全成本共同决定是否上线"],
    route: [
      { title: "从业务结果开始", learn: "识别用户、触发、输入、期望结果和不可接受结果。", checkpoint: "能写出不依赖模型名称的成功定义。" },
      { title: "把场景拆成能力链", learn: "判断哪些步骤需要检索、生成、工具执行、规则或人工审批。", checkpoint: "能解释每个组件为什么存在，以及失败后由谁接管。" },
      { title: "PoC 优先验证最大不确定性", learn: "先验证质量、集成、风险和成本中最可能推翻方案的假设。", checkpoint: "能给出包含现有表现、样本、阈值和退出条件的验收表。" },
    ],
    labs: [
      { title: "把模糊需求改写成一页约定", scenario: "客户说“想做一个企业 AI 助手”，但没有定义用户、动作和失败责任。", tasks: ["列出三类目标用户和各自高频任务", "为每个任务写出输入、输出、失败与人工接管", "选出一个最适合先验证的窄场景"], deliverable: "一页场景约定与暂停条件清单", acceptance: "任何评审者都能据此判断 PoC 是否成功，不依赖主观演示效果。", sourceIds: ["nist-genai-profile", "anthropic-effective-agents"] },
      { title: "比较方案的全部成本", scenario: "两个候选方案的模型单价不同，但集成、人工复核和失败补偿成本未知。", tasks: ["分别估算技术资源、工程运营和业务失败成本", "标出必须通过客户数据实测的未知量", "为流量增长和质量下降各做一次敏感性分析"], deliverable: "包含假设、区间和重测触发器的 TCO 对比", acceptance: "结论不会因只替换模型单价就反转，未知量均有验证计划。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
    ],
  },
  "model-landscape": {
    outcomes: ["区分模型能力、产品形态与部署边界", "建立客户任务集而不是迷信通用榜单", "设计分层路由与回退策略", "把版本变化纳入持续评估"],
    route: [
      { title: "先划可行域", learn: "用数据边界、地域、时延、上下文、模态和工具能力排除不可行选项。", checkpoint: "能说明某模型为何不进入候选集，而不是只说排名较低。" },
      { title: "再比较任务表现", learn: "用客户样本比较质量、稳定性、延迟、成本与拒答行为。", checkpoint: "能解释榜单分数为什么不能直接代表客户工作负载。" },
      { title: "最后设计组合与发布", learn: "为简单、复杂、高风险和故障请求设置路由、降级与回归测试。", checkpoint: "能在模型升级或供应商故障时维持业务边界。" },
    ],
    labs: [
      { title: "构建模型可行域", scenario: "客户要处理中文合同、图片附件和敏感数据，同时要求低延迟。", tasks: ["把硬约束和偏好分开", "为每项约束定义可验证证据", "形成候选、待验证和淘汰三组"], deliverable: "模型可行域矩阵与淘汰理由", acceptance: "每个候选都满足硬约束，未知能力不会被写成已确认事实。", sourceIds: ["openai-models", "google-models", "anthropic-models"] },
      { title: "设计分层模型路由", scenario: "大多数请求简单，但少量长文档和高风险请求决定总体体验。", tasks: ["按任务复杂度与风险划分请求层级", "为每层定义主模型、回退和停止条件", "设计能检测路由误判的日志与评估"], deliverable: "路由策略、回退图与上线门槛", acceptance: "成本优化不会静默降低高风险任务质量，版本变化可回放验证。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
    ],
  },
  multimodal: {
    outcomes: ["理解视觉、语音与文本如何被编码和对齐", "在原生多模态与专用处理管线之间选型", "建立可回跳的多模态证据链", "用分层指标定位感知、融合与生成故障"],
    route: [
      { title: "先分理解与生成", learn: "区分识别、解析、问答、合成和实时对话的输入输出契约。", checkpoint: "能说明任务需要哪一种模态能力，而不是泛称多模态。" },
      { title: "再理解信息如何丢失", learn: "沿采集、编码、对齐、上下文组装和生成追踪错误。", checkpoint: "能把错误定位到具体层，而不是只更换模型。" },
      { title: "最后设计证据与运营", learn: "保留页码、区域、时间戳、说话人和原始资产版本。", checkpoint: "回答、审核和修正都能回到原始证据。" },
    ],
    labs: [
      { title: "比较原生模型与解析管线", scenario: "一批 PDF 同时包含正文、表格、扫描页和签章，客户希望可追溯问答。", tasks: ["建立版式、语言和扫描质量分层样本", "比较原生视觉问答与 OCR/版面解析后的结构完整性", "记录页码、区域和表格单元格级证据"], deliverable: "两条路线的质量—成本—可追溯性对比", acceptance: "结论覆盖最难文档类型，且每个答案可回到原始页和区域。", sourceIds: ["docling-report", "pp-ocr-2020", "colpali-2025"] },
      { title: "拆解实时语音体验", scenario: "客服语音助手平均延迟可接受，但用户仍频繁打断或重复问题。", tasks: ["分解端点检测、识别、推理、合成和网络延迟", "加入打断、噪声、口音和沉默场景", "分别记录任务完成率和轮次修复成本"], deliverable: "端到端时延瀑布图与体验故障清单", acceptance: "能区分模型慢、管线慢和交互策略错误，并给出对应修复责任。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
    ],
  },
  mcp: {
    outcomes: ["解释 Host、Client、Server 与三类原语", "按部署形态选择传输和信任边界", "把工具发现与身份授权分开", "为远程 MCP 建立生产发布门"],
    route: [
      { title: "理解协议对象", learn: "掌握能力协商、Tools、Resources、Prompts 与生命周期。", checkpoint: "能为一项现有能力选择正确原语。" },
      { title: "画出调用与信任链", learn: "追踪用户、Host、Client、Server 和下游系统之间的身份与数据。", checkpoint: "能指出每一步由谁认证、授权、校验和审计。" },
      { title: "完成生产化", learn: "处理版本、超时、幂等、限流、撤销、隔离与供应链风险。", checkpoint: "能把远程 MCP 当作高权限集成而不是普通插件。" },
    ],
    labs: [
      { title: "把现有 API 包装成最小 MCP Server", scenario: "客户有一个只读订单查询 API，希望多个 Agent 客户端复用。", tasks: ["定义工具 Schema 和错误语义", "保留调用者身份并实施最小权限", "加入超时、审计和敏感字段过滤"], deliverable: "协议契约、调用序列与安全检查表", acceptance: "工具可被发现但不能绕过原 API 权限，错误和撤销路径可测试。", sourceIds: ["mcp-architecture", "mcp-authorization", "mcp-security"] },
      { title: "比较本地与远程部署", scenario: "同一 Server 可通过本地 stdio 或远程 Streamable HTTP 提供。", tasks: ["分别画出进程、网络和凭据边界", "比较更新、隔离、可观测和故障半径", "为开发、受控桌面和企业共享三种场景选型"], deliverable: "部署决策记录与迁移触发条件", acceptance: "选择与信任边界一致，不把本地安全假设直接搬到远程。", sourceIds: ["mcp-architecture", "mcp-security", "nist-zero-trust"] },
    ],
  },
  a2a: {
    outcomes: ["区分 A2A 与 MCP 的职责边界", "理解 Agent Card、Task、Message、Artifact 与状态变化", "为长任务设计断线续传和异步交付", "建立跨组织 Agent 的信任与审计"],
    route: [
      { title: "先判断是否需要协议边界", learn: "区分单进程编排、内部多 Agent 和跨系统协作。", checkpoint: "能说明为什么不是增加一个本地子 Agent 就够了。" },
      { title: "再掌握任务状态机", learn: "理解输入消息、处理中间状态、等待输入、产物和终态。", checkpoint: "能设计重复投递、断线恢复和取消语义。" },
      { title: "最后处理信任与运营", learn: "验证能力声明、调用身份、产物权限和跨域审计。", checkpoint: "能在不暴露内部 Prompt 的情况下证明任务执行边界。" },
    ],
    labs: [
      { title: "设计一个可恢复的长任务", scenario: "研究 Agent 需要数分钟生成报告，中途可能等待用户补充文件。", tasks: ["定义任务状态、事件和终态", "设计断线重连、重复消息和取消处理", "规定 Artifact 的版本、访问与保留"], deliverable: "任务状态机与异常路径测试表", acceptance: "刷新、断线和重复投递不会创建不可解释的重复任务或丢失产物。", sourceIds: ["a2a-concepts", "a2a-specification", "opentelemetry-semconv"] },
      { title: "划分 A2A 与内部编排", scenario: "企业内已有多 Agent 框架，同时要连接合作伙伴的独立 Agent。", tasks: ["标出内部可共享状态与外部最小契约", "确定能力发现、身份和审计责任", "设计外部 Agent 不可用时的降级"], deliverable: "协议边界图与责任矩阵", acceptance: "内部实现可独立演进，外部协作只依赖稳定契约且故障不会扩散。", sourceIds: ["a2a-concepts", "anthropic-effective-agents", "nist-zero-trust"] },
    ],
  },
  evaluation: {
    outcomes: ["区分模型、组件与业务结果三层评估", "组合规则、模型裁判与人工复核", "建设可分层的黄金集和失败分类", "把离线门禁与在线巡检连接成闭环"],
    route: [
      { title: "先定义决策而不是分数", learn: "明确评估要支持选型、发布、诊断还是运营。", checkpoint: "每个指标都能对应一个可执行决策。" },
      { title: "再设计样本与量尺", learn: "按场景、风险、难度和失败模式分层，校准规则、Judge 与人工。", checkpoint: "能报告分层结果、不确定性和裁判偏差。" },
      { title: "最后接入发布与反馈", learn: "把回归、灰度、线上失败和修复样本写回评估资产。", checkpoint: "评估集随真实失败演进但不会被噪声污染。" },
    ],
    labs: [
      { title: "从二十条真实问题建立黄金集", scenario: "团队只有零散用户反馈，没有系统评估数据。", tasks: ["按意图、风险和难度分层", "为每条样本写可接受答案与不可接受行为", "选择规则、Judge 或人工并做小样本校准"], deliverable: "带版本、标签和评分说明的最小黄金集", acceptance: "不同评审者对关键失败有一致判断，且每类业务风险都有代表样本。", sourceIds: ["nist-genai-profile", "ragas"] },
      { title: "定位一次总分下降", scenario: "新版本总体得分下降，但部分用户反馈体验变好。", tasks: ["分解样本、模型、Prompt、检索、工具和评分器版本", "检查分层结果与量尺漂移", "确定回滚、修复或接受变化的证据"], deliverable: "归因树与发布决策记录", acceptance: "结论能区分系统变化和评估变化，不以单一平均分替代分析。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
    ],
  },
  security: {
    outcomes: ["建立模型、应用、工具、数据和供应链的分层威胁模型", "理解直接与间接提示注入", "用外部控制限制 Agent 自主性", "把红队、事件响应与治理纳入持续运营"],
    route: [
      { title: "先画攻击面与资产", learn: "识别不可信输入、高价值数据、可执行工具和外部依赖。", checkpoint: "能说明攻击者跨越哪条信任边界获得什么能力。" },
      { title: "再设计纵深防御", learn: "组合数据隔离、身份授权、参数校验、审批、沙箱、监控和停止机制。", checkpoint: "任一护栏失效时仍有下一层限制影响。" },
      { title: "最后验证与运营", learn: "按业务威胁做红队、保留证据、分级响应并持续回归。", checkpoint: "能证明控制有效，而不是只证明安全产品已启用。" },
    ],
    labs: [
      { title: "为带工具的 RAG Agent 建威胁模型", scenario: "Agent 会读取外部文档、查询内部知识并创建工单。", tasks: ["标出指令、数据与工具调用的 Source—Sink 路径", "枚举直接注入、间接注入、越权和数据外泄", "为高影响动作设置外部授权与人工门"], deliverable: "威胁模型、控制映射和残余风险清单", acceptance: "不可信文档不能仅靠文本指令获得工具权限或改变业务规则。", sourceIds: ["owasp-prompt-injection", "nist-zero-trust", "mcp-security"] },
      { title: "演练一次供应链事件", scenario: "第三方模型、插件或开源依赖出现高危公告。", tasks: ["建立版本、来源、部署和调用方清单", "确定隔离、回滚和替代路径", "设计证据保留与受影响客户判断"], deliverable: "事件响应时间线与恢复门槛", acceptance: "团队能在不依赖原供应商可用的情况下定位影响、停止扩散并恢复服务。", sourceIds: ["nist-genai-profile", "nist-zero-trust"] },
    ],
  },
  "ai-gateway": {
    outcomes: ["理解 AI 网关与传统 API 网关的重叠和差异", "设计多模型路由、配额、缓存与回退", "把身份、护栏和审计串成一条治理链", "用端到端遥测验证策略变更"],
    route: [
      { title: "先建立统一请求契约", learn: "归一化模型、流式、错误、用量和身份字段。", checkpoint: "应用无需感知每个供应商的全部差异。" },
      { title: "再添加策略而非魔法", learn: "显式定义路由、限流、预算、缓存、回退和护栏条件。", checkpoint: "每个策略都有失败模式、观测信号和回滚。" },
      { title: "最后验证端到端结果", learn: "关联应用任务、网关决策、模型调用、工具动作和业务终态。", checkpoint: "能证明降本没有以质量、隐私或可靠性为代价。" },
    ],
    labs: [
      { title: "设计一次受控路由发布", scenario: "团队要把 30% 简单请求切到更便宜的模型。", tasks: ["定义可路由流量与保护组", "离线回放并以影子模式验证", "设置分组指标、放量门槛和自动回退"], deliverable: "策略版本、验证证据与回滚手册", acceptance: "高风险请求不进入实验，质量和尾延迟退化能在用户投诉前被发现。", sourceIds: ["cloudflare-ai-gateway", "opentelemetry-semconv", "nist-genai-profile"] },
      { title: "评估语义缓存是否值得", scenario: "FAQ 流量高，但问题包含个人信息、时效信息和相似但不同的业务条件。", tasks: ["划分可缓存与禁止缓存请求", "定义相似阈值、租户隔离和失效条件", "比较命中率、错误复用风险和真实成本"], deliverable: "缓存策略与误命中测试集", acceptance: "缓存键包含必要权限与版本边界，收益基于业务成功而非仅命中率。", sourceIds: ["nist-zero-trust", "nist-genai-profile"] },
    ],
  },
  "ai-ops": {
    outcomes: ["把一次 AI 任务串成端到端 Trace", "连接离线验收与在线质量巡检", "识别数据、模型和系统漂移", "建立可回滚的发布与事故响应闭环"],
    route: [
      { title: "先定义任务级遥测", learn: "记录版本、输入类别、检索、模型、工具、成本、错误和业务终态。", checkpoint: "能从一次失败反查完整调用链而不过度收集原文。" },
      { title: "再构建质量与漂移信号", learn: "组合抽样人工、规则、Judge、用户反馈和业务指标。", checkpoint: "绿色基础设施指标不会掩盖静默质量退化。" },
      { title: "最后闭环发布与事故", learn: "用版本注册、灰度、回滚、Kill Switch 和修复样本管理变化。", checkpoint: "任何线上变更都能定位、停止、回放和复盘。" },
    ],
    labs: [
      { title: "定义最小 GenAI Trace", scenario: "一个 Agent 请求穿过网关、RAG、模型和两个工具，但当前只能看到 API 延迟。", tasks: ["定义跨组件共同 Trace 与版本字段", "区分可保留元数据和受限原文", "把最终业务成功与成本归到同一任务"], deliverable: "遥测字段表、采样和保留策略", acceptance: "一次失败可跨组件关联，且敏感数据收集遵守最小化原则。", sourceIds: ["opentelemetry-semconv", "nist-zero-trust"] },
      { title: "演练静默质量退化", scenario: "错误率和 P95 正常，但用户完成任务的比例持续下降。", tasks: ["建立模型、数据、Prompt、工具和外部依赖的变更时间线", "用分层样本和线上证据复现", "决定回滚、降级与修复样本回流"], deliverable: "事故归因图、处置记录和新增回归集", acceptance: "根因不被平均指标掩盖，修复后同类失败能被自动或抽样发现。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv"] },
    ],
  },
  llm: {
    outcomes: ["理解 Token、Embedding、位置与 Transformer 块", "用 Q/K/V 直觉解释注意力而不神化它", "区分 Prefill、Decode 与 KV Cache", "把上下文、并发、时延和成本联系起来"],
    route: [
      { title: "从序列表示开始", learn: "理解文本如何变成 Token 与向量，以及位置信息为什么必要。", checkpoint: "能解释同一句话为何占用不同 Token 数并影响成本。" },
      { title: "再看信息如何流动", learn: "沿注意力、前馈网络、残差和归一化理解表示变换。", checkpoint: "能区分注意力权重、模型解释和事实依据。" },
      { title: "最后连接生成与工程", learn: "理解自回归循环、采样、上下文窗口和 KV Cache。", checkpoint: "能从首字慢、生成慢或并发下降反推可能瓶颈。" },
    ],
    labs: [
      { title: "手算一个最小注意力例子", scenario: "用三个 Token 的简化向量观察查询如何选择上下文。", tasks: ["计算点积、缩放和 Softmax 权重", "对 Value 做加权求和", "改变一个 Token 并观察输出变化"], deliverable: "带中间值和解释的注意力计算表", acceptance: "能说明计算表达相关性聚合，但不能证明模型有可读的内在思维。", sourceIds: ["transformer-2017"] },
      { title: "拆解一次生成请求", scenario: "同一模型短问答很快，长文档首字慢，长输出持续占用资源。", tasks: ["分别估算输入和输出 Token", "标出 Prefill、Decode 和 KV Cache 阶段", "提出上下文、批处理或输出长度的验证实验"], deliverable: "请求时间线与瓶颈假设", acceptance: "优化建议对应具体阶段，不用“换更大 GPU”替代诊断。", sourceIds: ["vllm-2023", "flashattention-2022"] },
    ],
  },
  "fine-tuning": {
    outcomes: ["区分知识更新、行为塑形和新能力学习", "理解全参、LoRA 与 QLoRA 的投资差异", "建立训练数据与评估数据的治理边界", "把 Adapter 作为可发布、可回滚制品"],
    route: [
      { title: "先证明微调是正确手段", learn: "用 Prompt、RAG、工作流和模型切换作为对照。", checkpoint: "能说明问题来自稳定行为而不是缺少最新知识。" },
      { title: "再设计数据与方法", learn: "选择 SFT、偏好优化、LoRA、QLoRA 或全参，并防止训练测试泄漏。", checkpoint: "每种方法都对应明确目标与资源约束。" },
      { title: "最后完成发布与回滚", learn: "比较现有做法、切片失败、服务性能、回滚和数据反馈。", checkpoint: "训练 Loss 下降不是唯一发布依据。" },
    ],
    labs: [
      { title: "做一次微调适用性分诊", scenario: "客户希望模型记住产品知识、遵守品牌语气并输出固定 JSON。", tasks: ["把知识、风格和结构约束分开", "分别设计 RAG、Prompt/Schema 和微调对照", "定义每项方案的成功指标与维护成本"], deliverable: "定制路线决策树与实验计划", acceptance: "不会把所有问题都送进训练，且每条路线可独立验证。", sourceIds: ["nist-genai-profile", "openai-structured-outputs", "lora-2021"] },
      { title: "设计 LoRA 发布门", scenario: "Adapter 离线评分提高，但团队不清楚是否可进入生产。", tasks: ["建立未见任务和高风险切片", "比较质量、拒答、延迟和显存", "定义 Adapter、基座和推理配置的版本与回滚"], deliverable: "评估报告与部署清单", acceptance: "提升在代表性切片上稳定，且不会因基座升级或合并方式变化失去可复现性。", sourceIds: ["lora-2021", "qlora-2023", "nist-genai-profile"] },
    ],
  },
  "llm-training": {
    outcomes: ["理解数据、预训练、SFT、偏好优化与评估的关系", "解释 Scaling Law 的适用边界", "把并行、通信、Checkpoint 与有效训练时间连接起来", "判断从头训练、继续预训练或微调的投资边界"],
    route: [
      { title: "先理解学习阶段", learn: "区分通用模式学习、指令示范和偏好目标。", checkpoint: "能说明每阶段需要什么数据、优化目标和评估。" },
      { title: "再理解数据与算力共同约束", learn: "分析数据质量、去重、Token 预算、并行和通信。", checkpoint: "不会把参数量或 GPU 数当成效果保证。" },
      { title: "最后管理长周期实验", learn: "用 Checkpoint、可复现环境、故障恢复和分阶段门禁控制风险。", checkpoint: "能报告有效训练时间、数据版本和恢复证据。" },
    ],
    labs: [
      { title: "选择正确训练路径", scenario: "客户拥有领域语料和少量专家示范，计划从头训练一个模型。", tasks: ["比较从头预训练、继续预训练、SFT 与 RAG", "估算数据、算力、评估和运营要求", "设计最小可证伪实验"], deliverable: "训练路线决策记录与阶段门", acceptance: "高成本路线必须由无法用更轻方案解决的证据支持。", sourceIds: ["chinchilla-2022", "instructgpt-2022", "nist-genai-profile"] },
      { title: "诊断一次训练停滞", scenario: "Loss 波动、吞吐下降且 GPU 利用率不稳定。", tasks: ["检查数据批次、数值稳定、学习率和恢复点", "关联计算、网络、存储与作业事件", "区分模型问题和基础设施问题"], deliverable: "分层诊断树与复现实验", acceptance: "追加算力前已有证据定位瓶颈，恢复后结果可与故障前连续比较。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
    ],
  },
  "llm-inference": {
    outcomes: ["区分 Prefill、Decode、TTFT、TPOT 与吞吐", "理解 KV Cache、连续批处理和分页注意力", "评估量化、投机解码与分布式策略", "按工作负载建立容量和 SLO"],
    route: [
      { title: "先读懂单请求", learn: "沿 Tokenization、Prefill、Decode、采样和流式返回拆解时间线。", checkpoint: "能区分首字慢与字间慢。" },
      { title: "再理解多请求竞争", learn: "分析批处理、KV Cache、调度、公平性和尾延迟。", checkpoint: "能解释一张卡的并发为何不是固定数字。" },
      { title: "最后做优化与容量验证", learn: "针对交互、长上下文、Agent 和批处理分别基准。", checkpoint: "优化结论包含质量、成本、稳定性和故障恢复。" },
    ],
    labs: [
      { title: "建立四类负载基准", scenario: "平台宣称高 Tokens/s，但真实聊天和 Agent 体验不稳定。", tasks: ["定义短交互、长上下文、工具循环和离线批处理", "记录 TTFT、TPOT、吞吐、P95、显存和质量", "改变并发、输入输出长度和批策略"], deliverable: "容量曲线与负载专属 SLO", acceptance: "不再用单一平均吞吐代表所有场景，容量点包含稳定运行证据。", sourceIds: ["vllm-2023", "opentelemetry-semconv"] },
      { title: "验证一次量化决策", scenario: "团队希望用 4-bit 量化把模型放进更小 GPU。", tasks: ["比较权重、KV Cache 和运行时显存", "用客户任务集评估质量和长尾失败", "测量目标硬件上的时延、吞吐和稳定性"], deliverable: "质量—性能—成本三维对比", acceptance: "结论限定到具体模型、量化方法、硬件和负载，不把更小等同于必然更快。", sourceIds: ["vllm-2023", "nist-genai-profile"] },
    ],
  },
  "data-engineering": {
    outcomes: ["把 AI 数据当作有契约和生命周期的产品", "理解解析、同步、去重、索引与权限传播", "建立可分层的数据质量指标", "设计删除、撤权和反馈回流闭环"],
    route: [
      { title: "先建立来源与权威性", learn: "记录所有者、版本、权限、时间和业务含义。", checkpoint: "能判断哪个副本是权威，哪些仅供派生。" },
      { title: "再构建可验证管道", learn: "把解析、切分、同步、索引和质量检查拆成可观测阶段。", checkpoint: "静默损坏能在进入生成前被发现。" },
      { title: "最后管理派生与反馈", learn: "传播权限、删除、血缘和失败样本，避免只修 Prompt。", checkpoint: "一次源数据变化能追到所有受影响资产。" },
    ],
    labs: [
      { title: "建立文档管道验收集", scenario: "客户资料跨年份、模板、语言和扫描质量，解析结果偶发错表。", tasks: ["按版式与质量分层抽样", "定义文本、结构、表格、页码和元数据指标", "为静默错误设置人工抽检与阻断"], deliverable: "管道黄金集与阶段质量门", acceptance: "不是只看 OCR 字符准确率，关键表格和证据位置可复核。", sourceIds: ["docling-report", "pp-ocr-2020"] },
      { title: "演练撤权与删除传播", scenario: "源系统撤销一名员工的文档权限，并删除一个错误版本。", tasks: ["追踪缓存、对象、切块、Embedding、索引和评估样本", "定义传播窗口和失败重试", "生成可审计的完成证明"], deliverable: "删除传播图、SLO 与验证记录", acceptance: "搜索和生成在承诺窗口内不再返回内容，且例外由数据所有者显式批准。", sourceIds: ["nist-zero-trust", "hnsw-2016"] },
    ],
  },
  "ai-infra-platform": {
    outcomes: ["理解设备发现、调度、隔离、环境与恢复的完整平台责任", "比较 Kubernetes、Slurm 与分层共存", "评估整卡、MIG、时间共享和 DRA", "用 Goodput 而不是表面利用率衡量平台"],
    route: [
      { title: "先建立资源契约", learn: "描述设备拓扑、驱动、网络、存储、镜像和作业约束。", checkpoint: "调度器看到的不只是 GPU 数量。" },
      { title: "再处理排队与共享", learn: "理解配额、优先级、Gang Scheduling、碎片和隔离。", checkpoint: "能解释有空闲 GPU 但作业仍排队的合理原因。" },
      { title: "最后保证可恢复运营", learn: "管理环境版本、Checkpoint、节点故障、推理发布和成本归属。", checkpoint: "平台升级和故障恢复都有可验证证据。" },
    ],
    labs: [
      { title: "诊断 GPU 空闲但作业排队", scenario: "集群显示 20% GPU 空闲，训练团队仍等待数小时。", tasks: ["检查请求形状、拓扑、配额、优先级和 Gang 条件", "识别整卡碎片与不可调度约束", "比较等待、缩容请求和抢占的业务代价"], deliverable: "调度诊断树与容量改进计划", acceptance: "结论能复现排队原因，不以提高总利用率牺牲关键作业完成时间。", sourceIds: ["kubernetes-dra", "opentelemetry-semconv"] },
      { title: "设计 GPU 运行栈升级", scenario: "驱动、固件、Operator 和推理运行时需要协同升级。", tasks: ["建立兼容矩阵与回滚点", "选择金丝雀节点和代表工作负载", "验证训练恢复、推理质量和遥测连续性"], deliverable: "五阶段升级计划与恢复手册", acceptance: "任一阶段失败可回到已知可用组合，业务制品和作业状态不被误判为已恢复。", sourceIds: ["nvidia-gpu-operator", "kubernetes-dra"] },
    ],
  },
  "ai-infra-compute": {
    outcomes: ["从工作负载而不是芯片峰值开始选型", "理解计算、显存、互联、存储和电力的共同约束", "区分 Scale-up 与 Scale-out", "用可持续性能、可靠性和 TCO 做采购判断"],
    route: [
      { title: "先刻画工作负载", learn: "记录模型、精度、上下文、批量、并行、数据和 SLO。", checkpoint: "能说明训练与推理为何需要不同资源曲线。" },
      { title: "再定位约束层", learn: "用计算、HBM、节点内互联、节点间网络、存储和供电逐层排查。", checkpoint: "不会用峰值 FLOPS 替代端到端证据。" },
      { title: "最后验证供给与经济性", learn: "比较采购、租用、API、异构与可交付周期。", checkpoint: "TCO 包含软件适配、空闲、故障和容量风险。" },
    ],
    labs: [
      { title: "完成一份算力需求画像", scenario: "客户只提供模型参数量和预计 GPU 卡数，希望直接报价。", tasks: ["补齐训练/推理、精度、上下文、并发和 SLO", "估算权重、激活、优化器和 KV Cache 的不同内存账", "列出网络、存储和供电验证项"], deliverable: "工作负载画像与待测假设清单", acceptance: "任何容量数字都能追溯到负载假设，训练和服务不会混用同一估算。", sourceIds: ["flashattention-2022", "vllm-2023"] },
      { title: "比较两种集群投资方案", scenario: "方案 A 峰值算力更高，方案 B 软件成熟且云上交付更快。", tasks: ["在目标框架上测持续性能与稳定性", "加入软件迁移、供应、能耗和故障恢复成本", "对流量增长和交付延迟做敏感性分析"], deliverable: "性能—风险—TCO 决策记录", acceptance: "推荐不依赖单一规格表，并清楚说明需要采购时重新核验的动态事实。", sourceIds: ["nvidia-gpu-operator", "nist-genai-profile"] },
    ],
  },
});

export const moduleLearningSlugs = Object.freeze(Object.keys(moduleLearningContent));

export function requireModuleLearning(slug) {
  const content = moduleLearningContent[slug];
  if (!content) throw new Error(`Missing module learning content: ${slug}`);
  return content;
}

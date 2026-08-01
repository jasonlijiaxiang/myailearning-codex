import { completionLearning } from "./module-completion-content.mjs";
import { applicationFinopsLearning } from "./module-briefs-application-finops.mjs";
import { governanceMlopsLearning } from "./module-briefs-governance-mlops.mjs";

/**
 * 18 个共享模块的网页原生学习路线与实战任务。
 *
 * external_reference 中的讲义只用于发现覆盖面与学习难点；这里重新按
 * “建立心智模型 -> 做出方案判断 -> 用证据验收”组织，不复刻 PPT 页序。
 * 所有公开依据仍只引用 reference-content.mjs 中的稳定 sourceId。
 */
const baseModuleLearningContent = Object.freeze({
  ...governanceMlopsLearning,
  "solution-patterns": {
    outcomes: ["把业务目标改写成可验收的一页约定", "能拆解客服、企业搜索、内容生成、AI Coding、数字人、ChatBI 与会议助手", "设计能证伪方案假设的 PoC", "用完整成本、单位经济、质量与风险共同决定是否上线", ...applicationFinopsLearning["ai-finops"].outcomes],
    route: [
      { title: "从业务结果开始", learn: "识别用户、触发、输入、期望结果和不可接受结果。", checkpoint: "能写出不依赖模型名称的成功定义。" },
      { title: "把场景拆成能力链", learn: "判断哪些步骤需要检索、生成、工具执行、规则或人工审批。", checkpoint: "能解释每个组件为什么存在，以及失败后由谁接管。" },
      { title: "选择最接近的场景原型", learn: "比较客服、搜索、内容、Coding、数字人、ChatBI 和会议助手的数据链、动作深度与风险。", checkpoint: "能复用架构骨架，同时说清该场景特有的指标和控制。" },
      { title: "把架构连线写成运行约定", learn: "为身份、数据、模型、工具、人工和观测补上接口、超时、重试与责任。", checkpoint: "架构图可以支持故障演练和责任讨论，不只是产品摆放。" },
      { title: "PoC 优先验证最大不确定性", learn: "先验证质量、集成、风险和成本中最可能推翻方案的假设。", checkpoint: "能给出包含现有表现、样本、阈值和退出条件的验收表。" },
      { title: "用生产门与单位经济完成交接", learn: "核对容量、数据更新、质量巡检、事件处理、回滚、成本归因、成功单位和负责人。", checkpoint: "试点结论能转换成上线、补做、优化或停止的明确决定。" },
    ],
    labs: [
      { title: "把模糊需求改写成一页约定", scenario: "客户说“想做一个企业 AI 助手”，但没有定义用户、动作和失败责任。", tasks: ["列出三类目标用户和各自高频任务", "为每个任务写出输入、输出、失败与人工接管", "选出一个最适合先验证的窄场景"], deliverable: "一页场景约定与暂停条件清单", acceptance: "任何评审者都能据此判断 PoC 是否成功，不依赖主观演示效果。", sourceIds: ["nist-genai-profile", "anthropic-effective-agents"] },
      { title: "比较方案的全部成本", scenario: "两个候选方案的模型单价不同，但集成、人工复核和失败补偿成本未知。", tasks: ["分别估算技术资源、工程运营和业务失败成本", "标出必须通过客户数据实测的未知量", "为流量增长和质量下降各做一次敏感性分析"], deliverable: "包含假设、区间和重测触发器的 TCO 对比", acceptance: "结论不会因只替换模型单价就反转，未知量均有验证计划。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
      { title: "设计一条客服解决漏斗", scenario: "客户希望机器人减少人工量，但当前只统计回复次数。", tasks: ["区分自助、坐席辅助和必须转人工的问题", "画出知识查询、业务查询、工单和转接路径", "定义解决率、放弃率、误答补偿和人工接管指标"], deliverable: "客服任务漏斗、参考架构和验收表", acceptance: "指标能区分真正解决、用户放弃和错误拦截，且高风险问题不会被自动处理。", sourceIds: ["ragas", "nist-genai-profile"] },
      { title: "为 ChatBI 加上语义与执行护栏", scenario: "管理层希望用自然语言查询经营指标，但多个部门的口径不一致。", tasks: ["选定五个有权威定义的指标", "限制只读数据域、查询成本和允许操作", "设计结果校验、引用、人工确认和错误回退"], deliverable: "语义层边界、查询流程与反例测试集", acceptance: "相同问题不会因自由生成 SQL 得到不同业务口径，模型不能写入或越权读取数据。", sourceIds: ["nist-zero-trust", "nist-genai-profile"] },
      ...applicationFinopsLearning["ai-finops"].labs,
    ],
  },
  "model-landscape": {
    outcomes: ["把业务任务与错误损失转成模型硬门", "登记可复现的完整候选身份", "用同条件试点决定单模型或组合", "把发布、回退、退出与单位经济纳入选型"],
    route: [
      { title: "先冻结任务、损失与人工基线", learn: "把理赔材料分类、字段抽取、证据定位和说明草稿拆开，记录不可接受错误、当前耗时与裁决人。", checkpoint: "没有权威样本或裁决规则时停止模型比较。" },
      { title: "划定可行域并冻结完整候选", learn: "先用数据地域、敏感信息、模态、许可和交付形态排除候选，再绑定提供方、端点、地域、精确版本、运行配置、Prompt、上下文、工具、Schema、预算与考卷。", checkpoint: "每项硬门都有 pass、fail 或待验证及依据，所有候选在同一输入分布和通过条件下比较。" },
      { title: "用逐切片证据决定组合", learn: "比较严重错误、P95、人工复核率和单位合格结果成本；单模型达标就保持简单。", checkpoint: "多模型只由稳定分层证据触发，路由误判可测。" },
    ],
    labs: [
      { title: "建立理赔初审候选可行域", scenario: "跨地区团队接收多语言表单、扫描件和事故照片，数据敏感且最终赔付必须由授权人员决定。", tasks: ["拆分任务与不可接受错误", "把地域、模态、版本、许可和时延分成硬门与偏好", "为每个候选登记精确身份和排除理由"], deliverable: "任务契约、模型可行域与候选身份表", acceptance: "未知项不会写成通过，平均质量不能补偿任一硬门失败。", sourceIds: ["nist-genai-profile", "osi-open-source-ai-definition-1-0", "openai-models", "google-models", "anthropic-models"] },
      { title: "完成一次同条件模型 PoC", scenario: "团队想用公开榜单直接指定模型，并准备让便宜模型处理所有常规案件。", tasks: ["冻结 Prompt、上下文、工具、Schema、预算与客户考卷", "按语言、版式、风险与长尾报告严重错误和不确定性", "比较单模型、候选路由和人工升级的单位合格结果成本"], deliverable: "逐切片 PoC 结果与 Go / Hold / No-Go 建议", acceptance: "每个结论能回到完整候选元组，高风险漏检不被平均分掩盖。", sourceIds: ["nist-ai-800-3", "finops-unit-economics", "nist-genai-profile"] },
      { title: "演练模型升级与供应商退出", scenario: "主端点准备更换默认版本，备用模型从未跑过扫描件与数据地域硬门。", tasks: ["冻结当前发布包并对新旧版本离线回放", "验证备用候选的硬门、禁止降级任务和路由行为", "设计影子、灰度、阻断、人工接管与回滚"], deliverable: "升级评审单、退出演练与恢复证据", acceptance: "替代路径通过相同硬门；无法安全降级时会明确阻断或转人工。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
    ],
  },
  multimodal: {
    outcomes: ["从业务证据缺口判断是否需要多模态", "用客户困难切片比较专用、原生与混合路线", "让观察与结论回跳到页面、区域、时间段或说话人", "在证据不足时安全降级，并把 RAG、Agent、安全、评估与运行责任交给正确模块"],
    route: [
      { title: "先定义任务与证据", learn: "写清业务终态、不可接受漏检和纯文本基线会丢失的布局、图像、声音或时序信息。", checkpoint: "能说明为什么需要某种模态，而不是泛称多模态。" },
      { title: "再建立采集与失真地图", learn: "沿采集、解析、表示、对齐、时序和推断定位信息损失。", checkpoint: "能把错误定位到具体层，并为不可读输入设置质量门。" },
      { title: "比较路线而非套公式", learn: "在同一客户任务和门槛下比较专用、原生与混合路线。", checkpoint: "路线选择同时展示任务成功、严重失败、证据坐标、P95、成本和人工复核。" },
      { title: "最后设计证据与交接", learn: "保留原始坐标，证据不足时降级；只在需要知识或动作时接入 RAG 或 Agent。", checkpoint: "回答、审核和修正能回到原始证据，模型不能自行扩大权限。" },
    ],
    labs: [
      { title: "设计一条可核验的现场巡检链", scenario: "设备巡检同时包含照片、铭牌、短视频、语音说明和表单，系统要给出异常结论并引用原始证据。", tasks: ["定义质量门、证据坐标和不可接受漏检", "比较 OCR/文档解析、原生 VLM 与混合路线", "把带坐标观察交给可选 RAG，并为创建工单设置独立 Agent 授权"], deliverable: "巡检证据链、路线矩阵与降级图", acceptance: "每个结论可回跳；路线来自客户困难切片，RAG、Agent 和人工责任没有混入模型能力。", sourceIds: ["docling-report", "pp-ocrv5-2026", "longvideobench-2024", "nist-genai-profile"] },
      { title: "拆解实时语音体验", scenario: "客服语音助手平均延迟可接受，但用户仍频繁打断或重复问题。", tasks: ["分解端点检测、识别、推理、合成和网络延迟", "加入打断、噪声、口音和沉默场景", "分别记录任务完成率和轮次修复成本"], deliverable: "端到端时延瀑布图与体验故障清单", acceptance: "能区分模型慢、管线慢和交互策略错误，并给出对应修复责任。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv", "opentelemetry-genai-semconv"] },
    ],
  },
  mcp: {
    outcomes: ["解释 Host、Client、Server 与三类原语", "区分当前正式版与旧版兼容路径", "按部署形态选择传输和信任边界", "把工具发现与身份授权分开", "为远程 MCP 建立生产发布门"],
    route: [
      { title: "理解协议对象与版本", learn: "掌握 Tools、Resources、Prompts，并区分 2026-07-28 正式规范与 2025-11-25 旧版生命周期。", checkpoint: "能为一项能力选择正确原语，并说明结论适用的协议版本。" },
      { title: "画出调用与信任链", learn: "追踪用户、Host、Client、Server 和下游系统之间的身份与数据。", checkpoint: "能指出每一步由谁认证、授权、校验和审计。" },
      { title: "完成生产化", learn: "处理版本、超时、幂等、限流、撤销、隔离与供应链风险。", checkpoint: "能把远程 MCP 当作高权限集成而不是普通插件。" },
    ],
    labs: [
      { title: "把现有 API 包装成最小 MCP Server", scenario: "客户有一个只读订单查询 API，希望多个 Agent 客户端复用。", tasks: ["把查询定义为模型控制的只读 Tool，并声明 Schema 与错误语义", "保留调用者身份并实施最小权限", "加入超时、审计和敏感字段过滤"], deliverable: "协议契约、调用序列与安全检查表", acceptance: "只读 Tool 可被发现但不能绕过原 API 权限，错误和撤销路径可测试。", sourceIds: ["mcp-tools-2026-07-28", "mcp-authorization", "mcp-security"] },
      { title: "比较本地与远程部署", scenario: "同一 Server 可通过本地 stdio 或远程 Streamable HTTP 提供。", tasks: ["分别画出进程、网络和凭据边界", "比较更新、隔离、可观测和故障半径", "为开发、受控桌面和企业共享三种场景选型"], deliverable: "部署决策记录与迁移触发条件", acceptance: "选择与信任边界一致，不把本地安全假设直接搬到远程。", sourceIds: ["mcp-architecture", "mcp-security", "nist-zero-trust"] },
      { title: "评审一次 MCP 版本迁移", scenario: "团队正在运行 2025-11-25，并准备迁移到当前正式版 2026-07-28。", tasks: ["冻结当前 Client、Server、SDK、网关与扩展清单", "对比 initialize、session、逐请求元数据、server/discover、Tasks 与授权变化", "设计隔离验证、并行兼容、生态支持复核和回滚门"], deliverable: "按版本拆分的迁移影响矩阵与验证计划", acceptance: "规范已生效与产品已兼容被分开记录，所有破坏性变化都有受影响组件、验证证据和切换条件。", sourceIds: ["mcp-lifecycle-2025-11-25", "mcp-changelog-2026-07-28", "mcp-tasks-extension"] },
    ],
  },
  a2a: {
    outcomes: ["区分 A2A 与 MCP Tasks 的职责边界", "处理 Agent Card 后的 Message | Task 双路径", "按精确状态为长任务设计恢复与取消", "建立跨组织 Agent 的信任、验收与互操作测试"],
    route: [
      { title: "先判断是否需要协议边界", learn: "区分单进程编排、内部多 Agent 和跨系统协作。", checkpoint: "能说明为什么不是增加一个本地子 Agent 就够了。" },
      { title: "再选择 Message 或 Task", learn: "理解即时 Message、服务端 Task、精确中断态与终态，以及可选 Artifact。", checkpoint: "客户端能处理两类响应，并设计重复投递、断线恢复和取消语义。" },
      { title: "最后处理信任与运营", learn: "验证能力声明、调用身份、产物权限和跨域审计。", checkpoint: "能在不暴露内部 Prompt 的情况下证明任务执行边界。" },
    ],
    labs: [
      { title: "设计一个可恢复的长任务", scenario: "理赔受理 Agent 既可能即时回答材料问题，也可能委托跨区域专业 Agent 完成数分钟核验并等待补件。", tasks: ["为同一 SendMessage 覆盖直接 Message 与 Task 两类响应", "验证八个非 UNSPECIFIED 操作状态（正式枚举均以 TASK_STATE_ 开头）、断线重连、重复消息和取消", "规定可选 Artifact 的访问、验收与业务终态核对"], deliverable: "双路径契约、任务状态机与异常测试表", acceptance: "客户端不假设每次都有 Task；刷新、断线和重复投递不会创建不可解释的动作，COMPLETED 也不会被误当业务验收。", sourceIds: ["a2a-concepts", "a2a-specification", "a2a-release-1-0-1"] },
      { title: "划分 A2A 与内部编排", scenario: "企业内已有多 Agent 框架，同时要连接合作伙伴的独立 Agent。", tasks: ["标出内部可共享状态与外部最小契约", "确定能力发现、身份和审计责任", "设计外部 Agent 不可用时的降级"], deliverable: "协议边界图与责任矩阵", acceptance: "内部实现可独立演进，外部协作只依赖稳定契约且故障不会扩散。", sourceIds: ["a2a-concepts", "anthropic-effective-agents", "nist-zero-trust"] },
    ],
  },
  evaluation: {
    outcomes: ["用对象 × 生命周期二维地图定位每项证据", "把决定、目标量、完整候选版本和行动规则写成评估契约", "组合代码、校准后的 Judge 与人工裁决", "报告关键切片、不确定性与硬门，并把风险批准和发布执行交给正确 Owner"],
    route: [
      { title: "先定义决策而不是分数", learn: "明确评估要支持选型、发布、诊断还是运营。", checkpoint: "每个指标都能对应一个可执行决策。" },
      { title: "冻结对象、样本与量尺", learn: "记录完整版本元组，按场景、风险、难度和失败模式分层，校准代码、Judge 与人工。", checkpoint: "能重放被测候选，并说明结果描述固定题集还是外推相似任务。" },
      { title: "重复运行并形成决定", learn: "报告逐样本、关键切片、严重失败、样本量与不确定性，先执行不可补偿硬门。", checkpoint: "Go、Hold、No-Go 或补做建议不依赖最好一次或单一平均分。" },
      { title: "最后治理反馈与责任交接", learn: "AI Ops 采集生产证据；确认失败经脱敏、去重和裁决后进入下一版回归集。", checkpoint: "能区分评估建议、发布执行、风险例外和机制修复。" },
    ],
    labs: [
      { title: "为退款 Agent 写一份评估契约", scenario: "候选 Agent 会解释政策、调用订单工具并提交退款；团队需要决定是否交给 AI Ops 做有限放量。", tasks: ["冻结 Agent、模型、Prompt、工具、策略、环境和预算版本", "按正常、边界、越权、工具故障和高价值退款分层任务", "用代码验证权限与业务终态，用 Judge 评开放说明并以人工样本校准", "重复运行并预先定义硬门与 Go/Hold/No-Go 规则"], deliverable: "版本化评估契约、逐切片结果、不确定性与发布建议", acceptance: "错误退款和越权不能被平均分抵消；Evaluation 不执行灰度、回滚或风险例外。", sourceIds: ["anthropic-agent-evals", "llm-as-judge-2023", "nist-ai-800-3"] },
      { title: "定位一次总分下降", scenario: "候选版本总体得分下降，但部分高价值任务和用户反馈变好。", tasks: ["区分模型、Prompt、检索、工具、样本与评分器版本变化", "检查对象 × 生命周期位置、关键切片与量尺漂移", "判断差异是否超过自然波动，并列出未决外推边界"], deliverable: "归因树、切片报告与补做/接受/拒绝建议", acceptance: "结论能区分系统变化和评估变化，不用 OpenTelemetry 或单一平均分冒充发布门。", sourceIds: ["nist-ai-800-3", "nist-ai-800-4", "opentelemetry-genai-semconv"] },
    ],
  },
  security: {
    outcomes: ["从招聘业务损失建立 Source—Sink 威胁模型", "识别恶意简历、向量数据与跨候选人边界", "用真实身份和确定性策略限制 ATS 动作", "验证控制失效后的遏制、取证、补偿与恢复"],
    route: [
      { title: "先定义损失和攻击路径", learn: "识别候选人隐私、职位边界、ATS 完整性、招聘决定和可追责性，画出简历到高影响 Sink 的路径。", checkpoint: "能说明攻击者控制什么、跨越哪条边界、获得什么能力和造成什么业务后果。" },
      { title: "再截断内容到权限的传播", learn: "对解析、检索、模型提案和 ATS 执行分别设置来源、ACL、Schema、真实身份和业务授权。", checkpoint: "恶意简历即使影响模型，也不能扩大权限或直接改变候选人状态。" },
      { title: "验证每层控制和交接", learn: "为注入、越权、泄露、供应链变化和结果未知注入故障，区分 Security、Governance、Evaluation、AI Ops 与招聘业务 owner。", checkpoint: "每项控制有测试、owner、失败动作和下一层限制。" },
      { title: "最后演练遏制与恢复", learn: "暂停高影响写入、撤销凭据、处理队列、保留证据、核对 ATS 权威状态、补偿并回归。", checkpoint: "能证明业务状态恢复，不只证明接口重新可用。" },
    ],
    labs: [
      { title: "为恶意简历到 ATS 建威胁模型", scenario: "招聘 Agent 会解析候选人 PDF、检索招聘政策、生成筛选建议，并可向 ATS 写入部分字段。", tasks: ["标出简历、解析、RAG、模型提案、策略和 ATS 的 Source—Sink 路径", "枚举隐藏注入、跨候选人检索、参数篡改和审批绕过", "为每个高影响 Sink 指定真实身份、允许字段、业务授权和停止动作"], deliverable: "招聘威胁模型、控制映射和残余技术风险", acceptance: "恶意简历即使影响模型，也不能获得其他候选人数据或直接改变高影响 ATS 状态。", sourceIds: ["owasp-prompt-injection", "owasp-vector-weaknesses", "nist-zero-trust"] },
      { title: "验证候选人向量数据隔离与删除", scenario: "招聘人员调岗或候选人撤回资料，但切块、Embedding、缓存和评估样本可能继续被检索。", tasks: ["由 Data Engineering 追踪原文到所有派生层", "按招聘人员、职位与候选人测试正向和负向访问", "由客户定义撤权删除时限、失败处理和完成证据"], deliverable: "派生数据清单、权限矩阵与负向探针结果", acceptance: "客户承诺时限内所有读取路径停止返回内容，例外有 owner、范围和补救；该时限是系统 SLO，不是 OWASP 给出的通用值。", sourceIds: ["owasp-vector-weaknesses", "nist-zero-trust"] },
      { title: "演练 ATS 越权与结果未知事件", scenario: "Agent 似乎绕过审批修改了候选人状态，部分请求超时且是否已写入未知。", tasks: ["暂停高影响写入、撤销凭据并停止队列", "还原简历、上下文、版本、身份、策略、参数和 ATS 审计", "查询权威状态、执行补偿、验证恢复并形成回归样本"], deliverable: "事件时间线、影响清单、补偿记录与恢复签署", acceptance: "团队不盲目重试，能证明受影响候选人和业务状态已经恢复或进入人工修复。", sourceIds: ["nist-sp-800-61r3", "nist-genai-profile", "nist-zero-trust"] },
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
      { title: "设计一次受控路由发布", scenario: "团队要把 30% 简单请求切到更便宜的模型。", tasks: ["定义可路由流量与保护组", "离线回放并以影子模式验证", "设置分组指标、放量门槛和自动回退"], deliverable: "策略版本、验证证据与回滚手册", acceptance: "高风险请求不进入实验，质量和尾延迟退化能在用户投诉前被发现。", sourceIds: ["cloudflare-ai-gateway-dynamic-routing", "opentelemetry-genai-semconv", "nist-genai-profile"] },
      { title: "评估语义缓存是否值得", scenario: "FAQ 流量高，但问题包含个人信息、时效信息和相似但不同的业务条件。", tasks: ["先区分相同请求的精确缓存与相似请求的语义缓存", "定义相似阈值、租户隔离和失效条件", "比较命中率、错误复用风险和真实成本"], deliverable: "两类缓存策略与误命中测试集", acceptance: "缓存资格包含必要权限与版本边界，收益基于业务成功而非仅命中率。", sourceIds: ["cloudflare-ai-gateway-caching", "azure-apim-ai-gateway", "nist-zero-trust"] },
    ],
  },
  "ai-ops": {
    outcomes: [...applicationFinopsLearning["ai-application-engineering"].outcomes, "把一次 AI 任务串成端到端 Trace", "连接离线验收与在线质量巡检", "识别数据、模型和系统漂移", "建立可回滚的发布与事故响应闭环"],
    route: [
      { title: "先定义任务与发布单元", learn: "绑定模型、Prompt、数据、工具、编排、策略、环境和负责人。", checkpoint: "任一输出都能回到完整配置和业务成功定义。" },
      { title: "再建立评估与任务级遥测", learn: "分层验证候选版本，并记录输入类别、检索、模型、工具、成本、错误和业务终态。", checkpoint: "能从一次失败反查完整调用链而不过度收集原文。" },
      { title: "最后闭环发布、事故与改进", learn: "用影子、灰度、回滚、Kill Switch、业务恢复和已裁决样本管理变化。", checkpoint: "任何线上变更都能定位、停止、回放、恢复和复盘。" },
    ],
    labs: [
      ...applicationFinopsLearning["ai-application-engineering"].labs,
      { title: "定义最小 GenAI Trace", scenario: "一个 Agent 请求穿过网关、RAG、模型和两个工具，但当前只能看到 API 延迟。", tasks: ["定义跨组件共同 Trace 与版本字段", "区分可保留元数据和受限原文", "把最终业务成功与成本归到同一任务"], deliverable: "遥测字段表、采样和保留策略", acceptance: "一次失败可跨组件关联，且敏感数据收集遵守最小化原则。", sourceIds: ["opentelemetry-semconv", "opentelemetry-genai-semconv", "nist-zero-trust"] },
      { title: "演练跨区域理赔助手的静默质量退化", scenario: "跨区域多租户理赔助手的错误率和 P95 正常，但某地区材料核验完成率持续下降。", tasks: ["建立模型、区域数据、Prompt、工具、网关策略和外部依赖的变更时间线", "按地区、租户和任务风险用线上 Trace 与分层样本复现", "执行预验证回滚或降级，核对权威理赔状态并让已裁决样本回流"], deliverable: "事故归因图、业务恢复记录和新增回归集", acceptance: "平均指标不能掩盖地区退化；技术恢复与业务恢复各有证据，修复后同类失败能被自动或抽样发现。", sourceIds: ["nist-genai-profile", "opentelemetry-tail-sampling", "opentelemetry-genai-semconv"] },
    ],
  },
  llm: {
    outcomes: ["理解 Token、Embedding、位置与 Transformer 块", "用 Q/K/V 直觉解释注意力而不把权重当作完整解释", "区分参数化知识、当前上下文与自回归生成", "把应用症状转交给模型、RAG、Prompt、推理或外部控制责任层"],
    route: [
      { title: "从序列表示开始", learn: "理解文本如何变成 Token 与向量，以及位置信息为什么必要。", checkpoint: "能解释同一句话为何占用不同 Token 数并影响成本。" },
      { title: "再看信息如何流动", learn: "沿注意力、前馈网络、残差和归一化理解表示变换。", checkpoint: "能区分注意力计算、解释假设和事实或审计证据。" },
      { title: "最后用一次应用失败串起来", learn: "理解自回归循环、采样、上下文、Prefill、Decode 与 KV Cache，并把真实症状归到可验证责任层。", checkpoint: "能区分基础能力、证据供给、生成控制、推理服务和模型外编排。" },
    ],
    labs: [
      { title: "手算一个最小注意力例子", scenario: "用三个 Token 的简化向量观察查询如何选择上下文。", tasks: ["计算点积、缩放和 Softmax 权重", "对 Value 做加权求和", "改变一个 Token 并观察输出变化"], deliverable: "带中间值和解释的注意力计算表", acceptance: "能说明计算表达相关性聚合，但不能证明模型有可读的内在思维。", sourceIds: ["transformer-2017"] },
      { title: "拆解一次企业知识助手失败", scenario: "同一问题有时答错、有时格式漂移；长资料还让首字变慢，团队准备直接更换更大模型。", tasks: ["记录用户原问、实际上下文、模型与采样配置、输入输出 Token 和端到端 Trace", "分别提出基础能力、证据供给、生成控制、推理服务和外部编排假设", "每次只改变一个变量，并为下一步指定 Model Landscape、RAG、Prompt、LLM Inference、Agent 或 Security 责任层"], deliverable: "一份请求时间线、故障树和跨模块转交证据", acceptance: "结论能说明下一步由谁用什么实验证伪，不因回答流畅、一次成功或单一时延直接归因于模型。", sourceIds: ["transformer-2017", "lost-middle", "vllm-2023", "nist-genai-profile"] },
    ],
  },
  "fine-tuning": {
    outcomes: ["按失败类型判断微调是否值得", "理解全参、PEFT、LoRA 与 QLoRA 的边界", "建立数据合同与四层验收", "把完整运行元组、ROI 假设与停止规则纳入发布"],
    route: [
      { title: "先隔离稳定剩余行为缺口", learn: "在理赔初审上分别建立 Prompt/Schema、RAG、Tool/规则与换模型对照。", checkpoint: "知识、业务规则、动作权限和基础能力问题不会被送进训练。" },
      { title: "执行不微调门", learn: "检查数据权利、PII、可靠标注、冻结评测、调用规模、版本化和回滚。", checkpoint: "任一硬门失败就停止，并写明缺失证据。" },
      { title: "建立数据合同并选择最小方法", learn: "区分文本、对话、提示—回答和偏好对，固定模板、来源、拆分；再比较托管 SFT、PEFT/LoRA、QLoRA、DPO 或全参。", checkpoint: "方法由控制权、数据类型、运行时兼容和资源约束决定。" },
      { title: "用曲线与切片诊断训练", learn: "关联训练/评估 Loss、学习率、吞吐、目标任务和通用能力。", checkpoint: "能区分欠拟合、过拟合、数据异常和评估泄漏。" },
      { title: "完成四层验收与真实端点复放", learn: "检查数据、训练、目标与保留能力、安全、服务性能和单位合格结果成本。", checkpoint: "训练 Loss 或单一平均分不能越过任何硬门。" },
      { title: "最后完成灰度、回滚与停止", learn: "绑定基座、Adapter、Tokenizer、Chat Template、Runtime、Policy 和评估集，以 shadow/canary 有限放量。", checkpoint: "收益不稳定、轻量基线反超或完整成本越界时会停止。" },
    ],
    labs: [
      { title: "判断理赔初审是否应该微调", scenario: "条款与案件状态频繁变化，JSON 偶尔漂移，说明语气与缺件分类在 Prompt/RAG 后仍有一部分长期不稳定。", tasks: ["把知识、结构、实时状态、确定规则和稳定行为失败分开", "分别设计 RAG、Prompt/Schema、Tool/API、换模型与微调对照", "定义每条路线的业务指标、完整成本和停止条件"], deliverable: "失败路由、不微调门与实验计划", acceptance: "只有稳定、可重复、可标注的剩余行为进入训练，模型不获得赔付授权。", sourceIds: ["nist-genai-profile", "openai-structured-outputs", "lora-2021"] },
      { title: "设计 PEFT / LoRA 发布门", scenario: "理赔初审 Adapter 离线评分提高，但团队不清楚是否可进入生产。", tasks: ["建立未见任务、保留能力与高风险切片", "比较质量、安全、延迟、显存和每个被接受初审成本", "绑定基座、Adapter、Tokenizer、模板、Runtime、Policy 和回滚"], deliverable: "四层验收报告、运行元组与部署清单", acceptance: "所有硬门通过，增益相对轻量基线稳定，且完整版本可以影子验证和回滚。", sourceIds: ["hf-trl-peft", "lora-2021", "qlora-2023", "nist-genai-profile", "finops-unit-economics"] },
      { title: "检查一批理赔对话训练数据", scenario: "团队收集了初审记录准备做 SFT，但角色、保单版本、PII、答案质量和争议裁决不一致。", tasks: ["统一角色、Chat Template、保单版本与目标字段", "检查权利、重复、泄漏、敏感信息、拒答案例与来源", "划分训练、验证、冻结测试、保留能力和高风险切片"], deliverable: "数据合同、清洗报告和可直接加载的样本集", acceptance: "样本格式与目标基座一致，测试问题没有进入训练，冲突样本已隔离并有业务裁决人。", sourceIds: ["hf-trl-data-formats", "hf-trl-chat-templates", "nist-genai-profile"] },
      { title: "诊断一次漂亮但无效的训练曲线", scenario: "训练和验证 Loss 持续下降，但业务评审没有明显提升。", tasks: ["检查模板记忆、样本重复和评估泄漏", "按任务、难度、格式与拒答切片比较基座", "调整数据、学习率或停止点并重跑单变量实验"], deliverable: "训练诊断记录与下一轮可证伪假设", acceptance: "结论能解释曲线与业务结果为何不一致，并有证据决定继续、改数据或停止。", sourceIds: ["hf-trl-sft-trainer", "openai-eval-best-practices"] },
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
      { title: "建立四类负载基准", scenario: "平台宣称高 Tokens/s，但真实聊天和 Agent 体验不稳定。", tasks: ["定义短交互、长上下文、工具循环和离线批处理", "记录 TTFT、TPOT、吞吐、P95、显存和质量", "改变并发、输入输出长度和批策略"], deliverable: "容量曲线与负载专属 SLO", acceptance: "不再用单一平均吞吐代表所有场景，容量点包含稳定运行证据。", sourceIds: ["vllm-2023", "opentelemetry-genai-semconv"] },
      { title: "验证一次量化决策", scenario: "团队希望用 4-bit 量化把模型放进更小 GPU。", tasks: ["比较权重、KV Cache 和运行时显存", "用客户任务集评估质量和长尾失败", "测量目标硬件上的时延、吞吐和稳定性"], deliverable: "质量—性能—成本三维对比", acceptance: "结论限定到具体模型、量化方法、硬件和负载，不把更小等同于必然更快。", sourceIds: ["vllm-2023", "nist-genai-profile"] },
    ],
  },
  "data-engineering": {
    outcomes: ["把 AI 数据当作有权威来源、用途、稳定身份和生命周期的数据产品", "理解解析、清洗、版本裁决、同步、派生与策略传播", "建立可分层的数据质量、血缘、隔离与单位成本证据", "设计新增、替换、撤权、删除、例外和反馈回流闭环"],
    route: [
      { title: "先建立来源、用途与裁决权", learn: "记录所有者、权威系统、版本或有效期、策略引用、允许用途和冲突裁决人。", checkpoint: "能判断哪个副本权威、哪些是派生物，谁有权处理冲突。" },
      { title: "再构建可验证管道", learn: "把接入、解析、清洗、版本、派生、发布和质量检查拆成可观测阶段。", checkpoint: "静默损坏、未裁决冲突和隔离项不会进入下游。" },
      { title: "最后管理派生状态与反馈", learn: "传播替换、撤权、删除、例外、血缘和失败样本，避免只修 Prompt。", checkpoint: "一次源数据变化能追到所有受影响资产和当前状态。" },
    ],
    labs: [
      { title: "建立文档管道验收集", scenario: "客户资料跨年份、模板、语言和扫描质量，解析结果偶发错表。", tasks: ["按版式与质量分层抽样", "定义文本、结构、表格、页码和元数据指标", "为静默错误设置人工抽检与阻断"], deliverable: "管道黄金集与阶段质量门", acceptance: "不是只看 OCR 字符准确率，关键表格和证据位置可复核。", sourceIds: ["docling-report", "pp-ocr-2020"] },
      { title: "演练替换、撤权与删除传播", scenario: "源系统发布新版本、撤销一名员工的访问，并要求旧版本按保留规则退出生产用途。", tasks: ["为对象及派生物标记 active、superseded、revoked、quarantined、retained-by-exception 或 physically-deleted", "追踪缓存、对象、切块、Embedding、索引、评估与导出资产", "定义传播窗口、失败重试、全量对账和负向证明"], deliverable: "状态传播图、SLO、例外清单与验证记录", acceptance: "当前身份只看到当前权威版本；撤权内容在承诺窗口内不可访问，保留例外受控且每层结果可证明。", sourceIds: ["nist-zero-trust", "w3c-prov-o", "openlineage-spec"] },
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

export const moduleLearningContent = Object.freeze(Object.fromEntries(
  Object.entries(baseModuleLearningContent).map(([slug, content]) => [
    slug,
    Object.freeze({
      ...content,
      route: Object.freeze([...content.route, ...(completionLearning[slug]?.route ?? [])]),
      labs: Object.freeze([...content.labs, ...(completionLearning[slug]?.labs ?? [])]),
    }),
  ]),
));

export const moduleLearningSlugs = Object.freeze(Object.keys(moduleLearningContent));

export function requireModuleLearning(slug) {
  const content = moduleLearningContent[slug];
  if (!content) throw new Error(`Missing module learning content: ${slug}`);
  return content;
}

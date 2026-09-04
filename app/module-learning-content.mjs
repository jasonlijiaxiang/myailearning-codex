import { completionLearning } from "./module-completion-content.mjs";
import { applicationFinopsLearning } from "./module-briefs-application-finops.mjs";
import { governanceMlopsLearning } from "./module-briefs-governance-mlops.mjs";
import { agentPlatformLearning } from "./module-content-agent-platforms.mjs";

/**
 * 20 个共享模块的网页原生学习路线与实战任务。
 *
 * external_reference 中的讲义只用于发现覆盖面与学习难点；这里重新按
 * “建立心智模型 -> 做出方案判断 -> 用证据验收”组织，不复刻 PPT 页序。
 * 所有公开依据仍只引用 reference-content.mjs 中的稳定 sourceId。
 */
const baseModuleLearningContent = Object.freeze({
  ...governanceMlopsLearning,
  ...agentPlatformLearning,
  "solution-patterns": {
    outcomes: ["把业务目标、当前基线、权威终态和约束写成可验收契约", "用需求门选择最小充分闭环并分配八层责任", "设计能输出 Go、Hold、No-Go 或 Exit 的阶段证据", "用完整成本、单位达标结果、运营责任和退出条件共同决定投资"],
    route: [
      { title: "冻结结果、基线与约束包络", learn: "识别用户、当前流程、权威终态、不可接受损失以及质量、风险、SLO、恢复、成本和迁移约束。", checkpoint: "能写出不依赖模型名称且可对照现状的成功定义。" },
      { title: "选择最小充分闭环", learn: "从无 AI、规则和单次模型开始，只为证据、动作、动态路径、互操作或共享治理缺口增加能力。", checkpoint: "能解释每个组件的必要条件与移除后果。" },
      { title: "建立八层责任架构", learn: "为结果、数据、模型、编排、控制、人工、评估运营和经济退出补上接口、Owner 与失败响应。", checkpoint: "架构图支持故障、替换、接管和退出讨论。" },
      { title: "用完整客服案例验证主链", learn: "沿授权知识、业务查询、受限动作、复杂例外和人工升级观察真正解决、放弃和错误承诺。", checkpoint: "模型回答能连接到权威业务终态。" },
      { title: "按阶段证伪最大不确定性", learn: "让 Discovery、PoC、Pilot 与 Production 分别回答价值、技术、约束和持续责任问题。", checkpoint: "每阶段都有样本、阈值与 Go、Hold、No-Go、Exit 条件。" },
      { title: "用单位经济完成运营与退出", learn: "核对版本、数据更新、质量巡检、事件、恢复、成本归因、迁移资产和停止责任。", checkpoint: "结论能转换成扩大、限制、修复、迁移或停止决定。" },
    ],
    labs: [
      { title: "把模糊需求改写成最小闭环契约", scenario: "客户说“想做一个企业 AI 助手”，但没有现状基线、权威终态、约束或失败责任。", tasks: ["冻结三类目标用户的当前流程、成本、成功与不可接受损失", "把质量、时延、权限、恢复、成本和迁移写成场景化约束", "从无 AI、规则和单次模型开始，为每个拟增组件做必要性与移除测试"], deliverable: "一页结果—约束—最小闭环契约与暂停条件", acceptance: "任何评审者都能据此判断为什么需要每个组件以及什么证据会停止 PoC。", sourceIds: ["nist-genai-profile", "anthropic-effective-agents", "finops-unit-economics"] },
      { title: "把全成本、运营与退出写进同一决策包", scenario: "两个候选方案的模型单价不同，但集成、人工复核、失败补偿、迁移和停止成本未知。", tasks: ["画出技术资源、工程运营、人工处理和业务失败的成本边界及 Owner", "按同一质量门比较每个达标任务的成本，并标出必须用客户数据验证的未知量", "为流量变化、质量退化、迁移和停止分别写出敏感区间与重测或退出触发器"], deliverable: "包含假设、区间、责任、重测与退出条件的 TCO 决策包", acceptance: "结论不会因只替换模型单价就反转；未知量、运营责任和退出路径均有验证计划。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv", "finops-unit-economics"] },
      { title: "设计一条客服问题解决闭环", scenario: "客户希望机器人减少人工量，但当前只统计回复次数，并准备默认加入 RAG 与 Agent。", tasks: ["由 CRM 或工单状态区分真正解决、转人工、放弃、错误承诺和返工", "只为授权知识引入 RAG，为业务查询与受限动作使用确定性工作流，把动态例外交给有界 Agent 与人工", "定义解决率、关键错误、P95、接管、恢复和每解决一单的完整成本"], deliverable: "客服最小闭环、八层责任图与阶段验收表", acceptance: "每项能力都有必要性、Owner 和退出条件，高风险问题不会被自动处理，结果由权威系统确认。", sourceIds: ["ragas", "nist-genai-profile", "anthropic-effective-agents", "finops-unit-economics"] },
      { title: "为 ChatBI 加上语义与执行护栏", scenario: "管理层希望用自然语言查询经营指标，但多个部门的口径不一致。", tasks: ["选定五个有权威定义的指标", "限制只读数据域、查询成本和允许操作", "设计结果校验、引用、人工确认和错误回退"], deliverable: "语义层边界、查询流程与反例测试集", acceptance: "相同问题不会因自由生成 SQL 得到不同业务口径，模型不能写入或越权读取数据。", sourceIds: ["nist-zero-trust", "nist-genai-profile"] },
      { title: "签订客户责任四角与资产交接", scenario: "客户希望项目“全包”，但数据、接口、口径、评估样本和审批人员都没有指定。", tasks: ["为业务决策、数据与 IT、知识运营、安全合规四类角色定义可交付物与签字线", "把 PoC 的成功、失败、停止指标和资产交接写进一页契约", "区分可替换件与客户沉淀资产，并明确退出时哪些资产可带走"], deliverable: "客户责任矩阵、PoC 契约和资产交接清单", acceptance: "任一角色缺失都会被明确标记为风险；PoC 结论不依赖单个 Demo 或口头承诺。", sourceIds: ["nist-genai-profile", "nist-zero-trust", "finops-unit-economics"] },
      { title: "演练中国交付上线证据包", scenario: "客户准备在国内发布一个会生成内容的 AI 助手，希望快速上线。", tasks: ["按受众、主体、部署方式、模型来源和数据流完成分诊", "把内容标识、日志、申诉、人工复核和事件处置映射为控制与证据", "列出需要法律、安全和业务复核的未决项并设置复核人"], deliverable: "中国交付分诊表、义务—控制—证据映射和上线证据包", acceptance: "不出现“已合规”结论；每个义务都有证据产物、负责人和复核日期。", sourceIds: ["china-ai-content-labeling-2026-08-05", "gb-45438-2025", "nist-genai-profile"] },
      { title: "验证保险理赔初审蓝图", scenario: "跨地区团队希望 AI 自动处理理赔材料并给出赔付结论。", tasks: ["冻结业务结果、AI 允许与禁止动作、权威业务系统和人工 owner", "沿材料接收、质量检查、证据提取、初审建议、人工决定和申诉设计流程", "为每种失败模式定义证据、人工接管、事件和退出路径"], deliverable: "理赔初审场景合同、控制矩阵和验收集", acceptance: "AI 不自动核赔、拒赔、确定金额或付款；行业法规与阈值由专业审查确认后才进入生产。", sourceIds: ["nist-genai-profile", "nist-ai-800-3", "finops-unit-economics"] },
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
      { title: "建立模型服务（MaaS）采购决策面", scenario: "客户采购模型服务，面对 API、托管、专属实例和私有化等多种交付方式。", tasks: ["按地域、数据与日志政策、模型目录、版本、配额、SLA、评测、回滚和退出建立决策面", "把平台名称、价格、版本和地区状态标记为动态事实", "用同一硬门和客户任务集比较候选，而不是比较榜单"], deliverable: "MaaS 决策面模板、动态事实 Claim 清单和采购验证计划", acceptance: "任何采购结论都绑定候选身份、核验日期和同条件评估；不写死平台当前价格或版本。", sourceIds: ["nist-genai-profile", "finops-unit-economics", "openai-models", "google-models", "anthropic-models"] },
    ],
  },
  multimodal: {
    outcomes: ["从业务证据缺口判断是否需要多模态", "用客户困难切片比较专用、原生与混合路线", "让观察与结论回跳到页面、区域、时间段或说话人", "在证据不足时安全降级，并把 RAG、Agent、安全、评估与运行责任交给正确模块"],
    route: [
      { title: "先定义任务与证据", learn: "写清业务终态、不可接受漏检和纯文本基线会丢失的布局、图像、声音或时序信息。", checkpoint: "能说明为什么需要某种模态，而不是泛称多模态。" },
      { title: "再建立采集、失真与困难切片地图", learn: "沿采集、解析、表示、对齐、时序和推断定位信息损失，并用模糊、扫描、表格、低清图、口音、噪声、短暂视频事件和跨模态关系验证它。", checkpoint: "能把错误定位到具体层，并为不可读输入设置质量门，而不是把所有失败归因给模型。" },
      { title: "比较路线而非套公式", learn: "在同一客户任务和门槛下比较专用、原生与混合路线。", checkpoint: "路线选择同时展示任务成功、严重失败、证据坐标、P95、成本和人工复核。" },
      { title: "最后设计证据回看、降级与交接", learn: "保留页面、区域、时间段或说话人坐标；证据不足时重传、专用解析或人工复核，只在需要知识或动作时接入 RAG 或 Agent。", checkpoint: "高影响结论能回到原始证据；看不清时不会继续猜，模型也不能自行扩大权限。" },
    ],
    labs: [
      { title: "设计一条可核验的现场巡检链", scenario: "设备巡检同时包含照片、铭牌、短视频、语音说明和表单，系统要给出异常结论并引用原始证据。", tasks: ["定义质量门、证据坐标和不可接受漏检", "比较 OCR/文档解析、原生 VLM 与混合路线", "把带坐标观察交给可选 RAG，并为创建工单设置独立 Agent 授权"], deliverable: "巡检证据链、路线矩阵与降级图", acceptance: "每个结论可回跳；路线来自客户困难切片，RAG、Agent 和人工责任没有混入模型能力。", sourceIds: ["docling-report", "pp-ocrv5-2026", "longvideobench-2024", "nist-genai-profile"] },
      { title: "拆解实时语音体验", scenario: "客服语音助手平均延迟可接受，但用户仍频繁打断或重复问题。", tasks: ["分解端点检测、识别、推理、合成和网络延迟", "加入打断、噪声、口音和沉默场景", "分别记录任务完成率和轮次修复成本"], deliverable: "端到端时延瀑布图与体验故障清单", acceptance: "能区分模型慢、管线慢和交互策略错误，并给出对应修复责任。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv", "opentelemetry-genai-semconv"] },
      { title: "验收 Barge-in 取消与状态恢复", scenario: "用户说话到一半被系统播报打断，系统继续播放旧回复并沿用已被否决的上下文。", tasks: ["定义检测打断、停止播放、取消旧生成、丢弃失效输出和确认已听到边界的顺序", "为旧任务、新任务和上下文恢复分别设计状态机", "记录取消、延迟和状态证据并加入回归集"], deliverable: "Barge-in 状态机、验收用例和证据日志", acceptance: "旧生成不会在用户表态后继续影响新回复；取消与业务状态恢复都有可观测证据。", sourceIds: ["nist-genai-profile", "opentelemetry-semconv", "opentelemetry-genai-semconv"] },
    ],
  },
  mcp: {
    outcomes: ["解释 Host、Client、Server 与三类原语", "区分当前正式版与旧版兼容路径", "区分无状态请求、MRTR、Tasks、缓存与业务状态", "按部署形态选择传输、网关和信任边界", "为远程 MCP 建立生产发布门"],
    route: [
      { title: "理解协议对象与版本", learn: "掌握 Tools、Resources、Prompts，并区分 2026-07-28 正式规范与 2025-11-25 旧版生命周期。", checkpoint: "能为一项能力选择正确原语，并说明结论适用的协议版本。" },
      { title: "画出调用与信任链", learn: "追踪用户、Host、Client、Server 和下游系统之间的身份与数据。", checkpoint: "能指出每一步由谁认证、授权、校验和审计。" },
      { title: "拆开四类状态与网关元数据", learn: "用 MRTR 处理显式补参、Tasks 处理当前受支持 tools/call 的耐久执行、cacheScope 处理缓存隔离，并用 Mcp-Method / Mcp-Name 支持可验证路由。", checkpoint: "能说明 requestState、Task handle、缓存键和业务 ID 分别由谁保存、何时失效，以及为何都不是授权。" },
      { title: "完成生产化", learn: "处理版本、超时、幂等、限流、撤销、隔离、网关策略与供应链风险。", checkpoint: "能把远程 MCP 当作高权限集成而不是普通插件。" },
    ],
    labs: [
      { title: "把现有 API 包装成最小 MCP Server", scenario: "客户有一个只读订单查询 API，希望多个 Agent 客户端复用。", tasks: ["把查询定义为模型控制的只读 Tool，并声明 Schema 与错误语义", "保留调用者身份并实施最小权限", "加入超时、审计和敏感字段过滤"], deliverable: "协议契约、调用序列与安全检查表", acceptance: "只读 Tool 可被发现但不能绕过原 API 权限，错误和撤销路径可测试。", sourceIds: ["mcp-tools-2026-07-28", "mcp-authorization", "mcp-security"] },
      { title: "比较本地与远程部署", scenario: "同一 Server 可通过本地 stdio 或远程 Streamable HTTP 提供。", tasks: ["分别画出进程、网络和凭据边界", "比较更新、隔离、可观测和故障半径", "为开发、受控桌面和企业共享三种场景选型"], deliverable: "部署决策记录与迁移触发条件", acceptance: "选择与信任边界一致，不把本地安全假设直接搬到远程。", sourceIds: ["mcp-architecture", "mcp-security", "nist-zero-trust"] },
      { title: "评审一次 MCP 版本迁移", scenario: "团队正在运行 2025-11-25，并准备迁移到当前正式版 2026-07-28。", tasks: ["冻结当前 Client、Server、SDK、网关与扩展清单", "对比 initialize、session、逐请求元数据、server/discover、Tasks 与授权变化", "设计隔离验证、并行兼容、生态支持复核和回滚门"], deliverable: "按版本拆分的迁移影响矩阵与验证计划", acceptance: "规范已生效与产品已兼容被分开记录，所有破坏性变化都有受影响组件、验证证据和切换条件。", sourceIds: ["mcp-lifecycle-2025-11-25", "mcp-changelog-2026-07-28", "mcp-tasks-extension"] },
      { title: "验证无状态 MCP 的补参、缓存与路由", scenario: "一个多租户远程 Server 需要执行中补充信息、缓存工具目录，并由网关按方法与能力名施策。", tasks: ["让 input_required 以新 JSON-RPC id 重试原操作；Server 提供 requestState 时，验证它原样回传并绑定用户与操作", "验证 public / private cacheScope 的租户隔离、TTL 失效和撤权边界", "校验 Mcp-Method 及适用场景下的 Mcp-Name 与正文一致，再执行方法和能力级授权、限流与审计"], deliverable: "MRTR 时序、缓存键模型、网关策略与故障用例", acceptance: "没有隐式 Session 依赖；补参、缓存、路由元数据与业务状态不会互相冒充授权或权威事实。", sourceIds: ["mcp-mrtr-2026-07-28", "mcp-list-cache-2026-07-28", "mcp-http-routing-2026-07-28", "nist-zero-trust"] },
    ],
  },
  a2a: {
    outcomes: ["区分 A2A 与 MCP Tasks 的职责边界", "处理 Agent Card 后的 Message | Task 双路径", "映射 messageId、taskId、contextId、referenceTaskIds 与业务 ID", "按真实交付语义设计恢复、扩展与取消", "建立跨组织 Agent 的信任、验收与互操作测试"],
    route: [
      { title: "先判断是否需要协议边界", learn: "区分单进程编排、内部多 Agent 和跨系统协作。", checkpoint: "能说明为什么不是增加一个本地子 Agent 就够了。" },
      { title: "再选择 Message 或 Task 并建立 ID 谱系", learn: "理解即时 Message、服务端 Task、精确中断态与终态、可选 Artifact，以及四类协议 ID 与业务单号的映射。", checkpoint: "终态修订发送不带旧 taskId 的新 Message，可保留 contextId 并引用旧 Task；响应仍可能是 Message，只有返回 Task 时才有新 taskId。" },
      { title: "验证交付与扩展语义", learn: "区分读取幂等、SendMessage 可选去重、仅非终态可调用且无恢复游标的 SubscribeToTask、按每个已配置 webhook 至少尝试一次但不保证成功送达的 Push，并分清 Extended Agent Card 与 Extension。", checkpoint: "未知写结果会先查询，终态 Task 改用 GetTask；缺少 Push 能力时返回指定错误，重复通知按自有投递键或双方契约幂等处理，需要重放时有自有事件存储或明确扩展。" },
      { title: "最后处理信任与运营", learn: "验证 Card 来源与可选签名、调用身份、Extension、产物权限和跨域审计。", checkpoint: "能在不暴露内部 Prompt 的情况下证明任务执行边界。" },
    ],
    labs: [
      { title: "设计一个可恢复的长任务", scenario: "理赔受理 Agent 既可能即时回答材料问题，也可能委托跨区域专业 Agent 完成数分钟核验并等待补件。", tasks: ["为同一 SendMessage 覆盖直接 Message 与 Task 两类响应，并保存四类协议 ID 到业务单号的映射", "验证八个非 UNSPECIFIED 操作状态、非终态 SubscribeToTask 无恢复游标、终态 GetTask 回读、每个已配置 webhook 的 Push 失败与重复、缺少 Push 能力、SendMessage 未知结果和取消", "注入无效 taskId、taskId/contextId 不匹配与仅给 taskId 三类组合；终态修订发送不带旧 taskId 的新 Message，可保留 contextId、引用旧 Task，并再次覆盖 Message 与 Task 两类响应"], deliverable: "双路径契约、ID 谱系、任务状态机与异常测试表", acceptance: "客户端不假设每次都有 Task、成功 Push 或订阅重放；终态订阅返回 UnsupportedOperationError，无效 ID 返回 TaskNotFoundError，Agent Card 中 pushNotifications 缺失或为 false 时 Create / Get / List / Delete 配置操作返回 PushNotificationNotSupportedError。断线和重复投递不会创建不可解释动作，COMPLETED 也不会被误当业务验收。", sourceIds: ["a2a-concepts", "a2a-specification", "a2a-release-1-0-1"] },
      { title: "划分 A2A 与内部编排", scenario: "企业内已有多 Agent 框架，同时要连接合作伙伴的独立 Agent。", tasks: ["标出内部可共享状态与外部最小契约", "确定能力发现、身份和审计责任", "设计外部 Agent 不可用时的降级"], deliverable: "协议边界图与责任矩阵", acceptance: "内部实现可独立演进，外部协作只依赖稳定契约且故障不会扩散。", sourceIds: ["a2a-concepts", "anthropic-effective-agents", "nist-zero-trust"] },
      { title: "验收 Agent Card 与 Extension 协商", scenario: "合作伙伴公开一张最小 Agent Card，认证后提供 Extended Card，并要求一个行业 Extension。", tasks: ["验证公开 Card 来源、可选 JWS 与请求身份，再获取 Extended Card", "固定 Extension 的版本化 URI、required、配置与 A2A-Extensions 激活请求，并验证破坏性变化改用新 URI", "注入不支持的可选 URI 或版本、required Extension 未声明支持、Card 更新和授权撤销"], deliverable: "发现信任链、扩展兼容矩阵与降级记录", acceptance: "Extended Card 和 Extension 不混淆；不支持的可选版本被忽略且不回退，缺少 required Extension 支持时返回 ExtensionSupportRequiredError，Card 或扩展变化会触发重新准入。", sourceIds: ["a2a-agent-discovery", "a2a-extensions", "a2a-specification", "nist-zero-trust"] },
    ],
  },
  evaluation: {
    outcomes: ["用对象 × 生命周期二维地图定位每项证据", "把决定、目标量、完整候选版本和行动规则写成评估契约", "组合代码、校准后的 Judge 与人工裁决", "报告关键切片、不确定性与硬门，并把风险批准和发布执行交给正确 Owner"],
    route: [
      { title: "先定义决策而不是分数", learn: "明确评估要支持选型、发布、诊断还是运营。", checkpoint: "每个指标都能对应一个可执行决策。" },
      { title: "冻结对象、样本、量尺与行动规则", learn: "记录完整候选版本、目标人群、样本与切片、评分器、环境、预算、重复条件、基线和行动规则，按场景、风险、难度和失败模式校准代码、Judge 与人工。", checkpoint: "未参与开发的人能重放候选，并说明结果描述固定题集还是外推相似任务。" },
      { title: "重复运行、报告不确定性并形成决定", learn: "报告逐样本、关键切片、严重失败、样本量、波动与未决边界，先执行不可补偿硬门。", checkpoint: "Go、Hold、No-Go 或补做建议不依赖最好一次或单一平均分，也不把未校准分歧藏进总分。" },
      { title: "治理生产反馈并分派责任", learn: "AI Ops 采集生产证据；确认失败经脱敏、去重和裁决后进入下一版回归集，再将评估建议、风险例外、发布执行和机制修复交给对应 Owner。", checkpoint: "能说明哪些结论由 Evaluation 提供、哪些必须由 Governance、AI Ops 或业务 Owner 执行。" },
    ],
    labs: [
      { title: "为退款 Agent 写一份评估契约", scenario: "候选 Agent 会解释政策、调用订单工具并提交退款；团队需要决定是否交给 AI Ops 做有限放量。", tasks: ["冻结 Agent、模型、Prompt、工具、策略、环境和预算版本", "按正常、边界、越权、工具故障和高价值退款分层任务", "用代码验证权限与业务终态，用 Judge 评开放说明并以人工样本校准", "重复运行并预先定义硬门与 Go/Hold/No-Go 规则"], deliverable: "版本化评估契约、逐切片结果、不确定性与发布建议", acceptance: "错误退款和越权不能被平均分抵消；Evaluation 不执行灰度、回滚或风险例外。", sourceIds: ["anthropic-agent-evals", "llm-as-judge-2023", "nist-ai-800-3"] },
      { title: "定位一次总分下降", scenario: "候选版本总体得分下降，但部分高价值任务和用户反馈变好。", tasks: ["区分模型、Prompt、检索、工具、样本与评分器版本变化", "检查对象 × 生命周期位置、关键切片与量尺漂移", "判断差异是否超过自然波动，并列出未决外推边界"], deliverable: "归因树、切片报告与补做/接受/拒绝建议", acceptance: "结论能区分系统变化和评估变化，不用 OpenTelemetry 或单一平均分冒充发布门。", sourceIds: ["nist-ai-800-3", "nist-ai-800-4", "opentelemetry-genai-semconv"] },
      { title: "制作客户任务 Benchmark Atlas", scenario: "团队想用公开榜单直接决定模型，但客户任务包含长尾语言、工具调用和高风险切片。", tasks: ["为每类基准记录测量对象、适合筛选阶段、数据与评分条件、不能证明的结论", "把客户任务、Estimand、重复试验和人工终审放在最终验收位置", "把模型版本与榜单分数标为动态事实"], deliverable: "Benchmark Atlas、候选初筛表和客户终审计划", acceptance: "榜单只用于缩小候选；生产结论必须回到客户任务与完整评估契约。", sourceIds: ["nist-ai-800-3", "nist-genai-profile"] },
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
      { title: "演练 ATS 越权和结果未知事件", scenario: "Agent 似乎绕过审批修改了候选人状态，部分请求超时且是否已写入未知。", tasks: ["暂停高影响写入、撤销凭据并停止队列", "还原简历、上下文、版本、身份、策略、参数和 ATS 审计", "查询权威状态、执行补偿、验证恢复并形成回归样本"], deliverable: "事件时间线、影响清单、补偿记录与恢复签署", acceptance: "团队不盲目重试，能证明受影响候选人和业务状态已经恢复或进入人工修复。", sourceIds: ["nist-sp-800-61r3", "nist-genai-profile", "nist-zero-trust"] },
      { title: "评审高风险内容交付", scenario: "客户准备发布会生成图文内容的助手，但标识、审核、撤回和申诉责任不清。", tasks: ["按生成、审核、标识、发布、撤回、更正、申诉和事件处置建立控制", "区分技术生成成功、审核通过、标识与分发满足、业务批准发布和持续责任", "把未决法务问题交给复核人并设置复核日期"], deliverable: "内容交付控制矩阵、证据清单和未决项表", acceptance: "每个发布动作都有责任人和证据；不把“已标识”写成“已合规”。", sourceIds: ["china-ai-content-labeling-2026-08-05", "gb-45438-2025", "nist-genai-profile"] },
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
      { title: "设计一次受控的路由发布", scenario: "团队要把 30% 简单请求切到更便宜的模型。", tasks: ["定义可路由流量与保护组", "离线回放并以影子模式验证", "设置分组指标、放量门槛和自动回退"], deliverable: "策略版本、验证证据与回滚手册", acceptance: "高风险请求不进入实验，质量和尾延迟退化能在用户投诉前被发现。", sourceIds: ["cloudflare-ai-gateway-dynamic-routing", "opentelemetry-genai-semconv", "nist-genai-profile"] },
      { title: "评估语义缓存是否值得", scenario: "FAQ 流量高，但问题包含个人信息、时效信息和相似但不同的业务条件。", tasks: ["先区分相同请求的精确缓存与相似请求的语义缓存", "定义相似阈值、租户隔离和失效条件", "比较命中率、错误复用风险和真实成本"], deliverable: "两类缓存策略与误命中测试集", acceptance: "缓存资格包含必要权限与版本边界，收益基于业务成功而非仅命中率。", sourceIds: ["cloudflare-ai-gateway-caching", "azure-apim-ai-gateway", "nist-zero-trust"] },
    ],
  },
  "ai-ops": {
    outcomes: [...applicationFinopsLearning["ai-application-engineering"].outcomes, "把一次 AI 任务串成端到端 Trace", "连接离线验收与在线质量巡检", "识别数据、模型和系统漂移", "建立可回滚的发布与事故响应闭环"],
    route: [
      { title: "冻结任务、发布单元与业务终态", learn: "绑定模型、Prompt、数据、工具、编排、策略、环境、负责人和权威业务状态。", checkpoint: "任一输出都能回到完整配置和可验收的业务成功定义。" },
      { title: "建立可归因且受控的观测证据", learn: "分层验证候选版本；为输入类别、检索、模型、工具、成本、错误和业务终态定义最小必要字段、采样、脱敏、访问与保留。", checkpoint: "能从一次失败反查完整调用链，而不会因默认保存原文扩大敏感数据暴露。" },
      { title: "用质量证据发布并及时止损", learn: "把离线验收、影子、灰度、回滚与 Kill Switch 绑定到发布单元和风险切片。", checkpoint: "每次线上变更都有可回放证据、放量条件和停止路径。" },
      { title: "从技术恢复完成业务恢复与复盘", learn: "追踪外部副作用和客户影响，核对权威状态；将裁决后的失败样本带回下一轮回归。", checkpoint: "技术恢复、业务恢复和防复发证据各自可核验，不把线上信号直接当真值。" },
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
      { title: "判断理赔初审是否适合微调", scenario: "条款与案件状态频繁变化，JSON 偶尔漂移，说明语气与缺件分类在 Prompt/RAG 后仍有一部分长期不稳定。", tasks: ["把知识、结构、实时状态、确定规则和稳定行为失败分开", "分别设计 RAG、Prompt/Schema、Tool/API、换模型与微调对照", "定义每条路线的业务指标、完整成本和停止条件"], deliverable: "失败路由、不微调门与实验计划", acceptance: "只有稳定、可重复、可标注的剩余行为进入训练，模型不获得赔付授权。", sourceIds: ["nist-genai-profile", "openai-structured-outputs", "lora-2021"] },
      { title: "设计 PEFT / LoRA 的发布门槛", scenario: "理赔初审 Adapter 离线评分提高，但团队不清楚是否可进入生产。", tasks: ["建立未见任务、保留能力与高风险切片", "比较质量、安全、延迟、显存和每个被接受初审成本", "绑定基座、Adapter、Tokenizer、模板、Runtime、Policy 和回滚"], deliverable: "四层验收报告、运行元组与部署清单", acceptance: "所有硬门通过，增益相对轻量基线稳定，且完整版本可以影子验证和回滚。", sourceIds: ["hf-trl-peft", "lora-2021", "qlora-2023", "nist-genai-profile", "finops-unit-economics"] },
      { title: "检查理赔对话训练数据", scenario: "团队收集了初审记录准备做 SFT，但角色、保单版本、PII、答案质量和争议裁决不一致。", tasks: ["统一角色、Chat Template、保单版本与目标字段", "检查权利、重复、泄漏、敏感信息、拒答案例与来源", "划分训练、验证、冻结测试、保留能力和高风险切片"], deliverable: "数据合同、清洗报告和可直接加载的样本集", acceptance: "样本格式与目标基座一致，测试问题没有进入训练，冲突样本已隔离并有业务裁决人。", sourceIds: ["hf-trl-data-formats", "hf-trl-chat-templates", "nist-genai-profile"] },
      { title: "诊断一次漂亮但无效的训练曲线", scenario: "训练和验证 Loss 持续下降，但业务评审没有明显提升。", tasks: ["检查模板记忆、样本重复和评估泄漏", "按任务、难度、格式与拒答切片比较基座", "调整数据、学习率或停止点并重跑单变量实验"], deliverable: "训练诊断记录与下一轮可证伪假设", acceptance: "结论能解释曲线与业务结果为何不一致，并有证据决定继续、改数据或停止。", sourceIds: ["hf-trl-sft-trainer", "openai-eval-best-practices"] },
    ],
  },
  "llm-training": {
    outcomes: ["理解数据、预训练、SFT、偏好优化与评估的关系", "写出可恢复的版本化训练 Run 合同", "把并行、通信、Checkpoint 与有效训练时间连接起来", "判断从头训练、继续预训练或微调的投资边界"],
    route: [
      { title: "先理解学习阶段", learn: "区分通用模式学习、指令示范和偏好目标。", checkpoint: "能说明每阶段需要什么数据、优化目标和评估。" },
      { title: "建立可重放训练谱系", learn: "绑定基础权重、代码、Tokenizer、数据快照与配比、目标、优化器、精度、随机状态、并行拓扑、Checkpoint、环境、停止规则和评估版本；恢复后核验状态连续。", checkpoint: "任何候选与恢复点都能回到同一份 Run manifest、数据位置和训练条件。" },
      { title: "再选择分布式执行方案", learn: "分析显存构成、数据质量、并行、通信、I/O 和故障损失。", checkpoint: "不会把参数量、GPU 数或短时利用率当成有效进度保证。" },
      { title: "用有效进度验收集群", learn: "同时观察计算、通信、I/O、失败、恢复和合格模型产出。", checkpoint: "不再用 GPU 小时或瞬时利用率代替训练结果。" },
      { title: "最后管理恢复与候选门", learn: "验证 Checkpoint 完成、状态连续性、容差内复现和阶段评估。", checkpoint: "能报告有效训练时间、状态缺口、恢复证据和候选结论。" },
    ],
    labs: [
      { title: "选择正确训练路径", scenario: "客户拥有领域语料和少量专家示范，计划从头训练一个模型。", tasks: ["比较从头预训练、继续预训练、SFT 与 RAG", "估算数据、算力、评估和运营要求", "设计最小可证伪实验"], deliverable: "训练路线决策记录与阶段门", acceptance: "高成本路线必须由无法用更轻方案解决的证据支持。", sourceIds: ["chinchilla-2022", "instructgpt-2022", "nist-genai-profile"] },
      { title: "诊断一次训练停滞", scenario: "Loss 波动、吞吐下降且 GPU 利用率不稳定。", tasks: ["检查异常批次、数值稳定、学习率与 OOM 内存构成", "关联并行通信、网络、存储、Checkpoint 与作业事件", "按 Run 合同验证故障前后状态与数据连续性"], deliverable: "分层诊断树、状态清单与复现实验", acceptance: "追加算力前已有证据定位瓶颈；恢复差异可解释并落在声明容差内。", sourceIds: ["megatron-3d-parallelism-2021", "nccl-collectives", "pytorch-distributed-checkpoint", "pytorch-reproducibility"] },
    ],
  },
  "llm-inference": {
    outcomes: ["从真实负载合同区分 queue、Prefill、Decode、TTFT、TPOT 与端到端时延", "理解 KV Cache、连续批处理、公平与缓存隔离", "评估量化、投机解码、过载准入与分布式策略", "用 Goodput 和单位达标任务成本验收发布"],
    route: [
      { title: "先读懂单请求", learn: "沿 Tokenization、Prefill、Decode、采样和流式返回拆解时间线。", checkpoint: "能区分首字慢与字间慢。" },
      { title: "再理解多请求竞争", learn: "分析批处理、KV Cache、调度、公平性和尾延迟。", checkpoint: "能解释一张卡的并发为何不是固定数字。" },
      { title: "最后做运行包络与发布验证", learn: "针对交互、长上下文、Agent 和批处理分别测试稳态、突发、过载、长跑、故障与恢复。", checkpoint: "优化结论包含质量、Goodput、成本、准入、排空和回滚。" },
    ],
    labs: [
      { title: "建立四类负载与过载基准", scenario: "平台宣称高 Tokens/s，但真实聊天和 Agent 体验不稳定。", tasks: ["冻结短交互、长上下文、工具循环和离线批处理的到达与长度分布", "记录 queue、TTFT、TPOT、P95、拒绝、Goodput、显存和质量", "测试稳态、突发、等待上限、暖容量、故障和恢复"], deliverable: "容量曲线、负载专属 SLO 与过载处置", acceptance: "不再用单一平均吞吐代表所有场景，每个容量点都有稳定达标和安全拒绝证据。", sourceIds: ["vllm-metrics-v0-12", "jitserve-2026", "serverlessllm-2024"] },
      { title: "验证一次量化发布", scenario: "团队希望用 4-bit 量化把模型放进更小 GPU。", tasks: ["比较权重、KV Cache 和运行时显存", "用客户任务集评估质量和长尾失败", "测量目标硬件上的时延、Goodput、稳定性和单位达标任务成本", "验证灰度、排空与回滚"], deliverable: "质量—性能—成本—回滚决策记录", acceptance: "结论限定到具体模型、量化方法、制品、硬件和负载，不把更小或更高吞吐等同于值得上线。", sourceIds: ["gptq-2023", "nist-genai-profile", "finops-unit-economics"] },
    ],
  },
  "data-engineering": {
    outcomes: ["把 AI 数据当作有权威来源、用途、稳定身份和生命周期的数据产品", "理解解析、清洗、版本裁决、同步、派生与策略传播", "建立可分层的数据质量、血缘、隔离与单位成本证据", "设计新增、替换、撤权、删除、例外和反馈回流闭环"],
    route: [
      { title: "冻结来源、用途与裁决权", learn: "记录所有者、权威系统、版本或有效期、策略引用、允许用途和冲突裁决人。", checkpoint: "能判断哪个副本权威、哪些是派生物，谁有权处理冲突。" },
      { title: "建立可验证的数据管道", learn: "把接入、解析、清洗、版本、派生、发布和质量检查拆成可观测阶段。", checkpoint: "静默损坏、未裁决冲突和隔离项不会进入下游。" },
      { title: "按用途发布可验证的数据制品", learn: "从同一血缘派生 RAG、评估或训练制品，并分别绑定许可、标签、更新与泄漏边界。", checkpoint: "用途不同的数据制品不被默认混用，发布版本可被独立核验。" },
      { title: "证明变更传播并让反馈回流", learn: "对替换、撤权、删除、例外和失败样本执行全链对账、重放与血缘回溯，避免只修 Prompt。", checkpoint: "一次源数据变化能追到所有受影响资产和当前状态。" },
    ],
    labs: [
      { title: "建立文档管道验收集", scenario: "客户资料跨年份、模板、语言和扫描质量，解析结果偶发错表。", tasks: ["按版式与质量分层抽样", "定义文本、结构、表格、页码和元数据指标", "为静默错误设置人工抽检与阻断"], deliverable: "管道黄金集与阶段质量门", acceptance: "不是只看 OCR 字符准确率，关键表格和证据位置可复核。", sourceIds: ["docling-report", "pp-ocr-2020"] },
      { title: "演练替换、撤权与删除传播", scenario: "源系统发布新版本、撤销一名员工的访问，并要求旧版本按保留规则退出生产用途。", tasks: ["为对象及派生物标记 active、superseded、revoked、quarantined、retained-by-exception 或 physically-deleted", "追踪缓存、对象、切块、Embedding、索引、评估与导出资产", "定义传播窗口、失败重试、全量对账和负向证明"], deliverable: "状态传播图、SLO、例外清单与验证记录", acceptance: "当前身份只看到当前权威版本；撤权内容在承诺窗口内不可访问，保留例外受控且每层结果可证明。", sourceIds: ["nist-zero-trust", "w3c-prov-o", "openlineage-spec"] },
      { title: "做一次会前数据就绪分诊", scenario: "客户希望直接开始 RAG PoC，但数据能否合法访问、是否有稳定身份和权限传播都未确认。", tasks: ["用五类就绪问题逐项检查数据访问、身份版本、权限传播、质量和变更纠错", "把未就绪范围缩到单一来源、有限对象、明确 ACL 和可回放评估集", "为每个缺口定义负责人、验证证据和进入下一阶段条件"], deliverable: "数据就绪分诊表、PoC 缩围范围和缺口清单", acceptance: "不会因为“先建向量库”绕过数据契约；每个缺口都能阻止或缩小后续范围。", sourceIds: ["nist-genai-profile", "nist-zero-trust", "w3c-prov-o"] },
    ],
  },
  "ai-infra-platform": {
    outcomes: ["把 AI 平台定义成面向内部用户的自助产品与工作负载契约", "区分控制层、执行层、准入、放置与领域工作负载责任", "验证四类多租户验收边界与真实可移植性", "用 Goodput、浪费和资源成本支持容量决定而不冒充业务 ROI"],
    route: [
      { title: "从平台用户和 Golden Path 开始", learn: "选择代表性开发者、训练或服务路径，定义能力目录、自助接口、支持边界和服务等级。", checkpoint: "平台需求来自用户任务，不来自组件清单。" },
      { title: "写清工作负载与控制契约", learn: "描述身份、设备、拓扑、网络、存储、运行时、时限、恢复和拒绝语义。", checkpoint: "控制层与执行层对象、状态和责任可追踪。" },
      { title: "完成准入、放置与多租户边界设计", learn: "组合配额、优先级、Gang、设备声明、拓扑和四类多租户验收边界。", checkpoint: "能分别解释排队、碎片、Noisy Neighbor、安全隔离与成本归属。" },
      { title: "连接开发、运行、恢复与退出", learn: "版本化环境、作业、制品和服务，演练升级、回滚与目标环境迁移。", checkpoint: "容器化不会被误写成完整可移植性。" },
      { title: "用有效产出完成经营判断", learn: "关联排队、利用率、Goodput、闲置、预留、失败重跑和成本责任。", checkpoint: "平台资源经济与应用业务 ROI 明确分工。" },
    ],
    labs: [
      { title: "诊断 GPU 空闲但作业排队", scenario: "集群显示 20% GPU 空闲，训练团队仍等待数小时。", tasks: ["检查请求形状、拓扑、配额、优先级和 Gang 条件", "识别整卡碎片与不可调度约束", "比较等待、缩容请求和抢占的业务代价"], deliverable: "调度诊断树与容量改进计划", acceptance: "结论能复现排队原因，不以提高总利用率牺牲关键作业完成时间。", sourceIds: ["kubernetes-dra", "opentelemetry-semconv"] },
      { title: "设计 GPU 运行栈升级", scenario: "驱动、固件、Operator 和推理运行时需要协同升级。", tasks: ["建立兼容矩阵与回滚点", "选择金丝雀节点和代表工作负载", "验证训练恢复、推理质量和遥测连续性"], deliverable: "五阶段升级计划与恢复手册", acceptance: "任一阶段失败可回到已知可用组合，业务制品和作业状态不被误判为已恢复。", sourceIds: ["nvidia-gpu-operator", "kubernetes-dra"] },
      { title: "演练一次平台退出与迁移", scenario: "团队认为同一 OCI 镜像和 Kubernetes YAML 可以直接迁往另一朵云与不同加速器。", tasks: ["登记镜像、驱动、内核、资源声明、数据、IAM、网络、存储、观测和托管依赖", "在目标环境重放构建、数据访问、训练或推理、恢复与 SLO", "验证回滚、数据导出、成本差异和停止条件"], deliverable: "可移植性分层清单、迁移证据与退出手册", acceptance: "只对通过目标环境测试的范围声明可迁移，失败依赖有替代、保留或停止决定。", sourceIds: ["oci-image-spec-v1-1-1", "kubernetes-dra", "nist-zero-trust"] },
    ],
  },
  "ai-infra-compute": {
    outcomes: ["从工作负载包络而不是芯片峰值开始选型", "用 Roofline 与端到端 Profile 区分计算、内存、通信和 I/O", "区分紧耦合 Scale-up 域与跨域 Scale-out", "用同质量长跑、恢复和单位达标结果成本做采购判断"],
    route: [
      { title: "先刻画工作负载", learn: "记录模型、精度、上下文、批量、并行、数据和 SLO。", checkpoint: "能说明训练与推理为何需要不同资源曲线。" },
      { title: "再定位约束层", learn: "用计算、HBM、紧耦合互联域、跨域网络、存储、设施和故障域逐层排查。", checkpoint: "不会用峰值 FLOPS、卡数或单次基准替代端到端证据。" },
      { title: "在同质量包络下长跑、扩展与恢复", learn: "覆盖冷启动、稳态、峰值、数据供给、扩展、故障和恢复，并记录不可外推条件。", checkpoint: "硬件比较不依赖短时缓存后的峰值或单一运行阶段。" },
      { title: "以供给约束和单位达标结果完成决策", learn: "比较采购、租用、API、异构、可交付周期、软件适配、闲置、能耗和人员责任。", checkpoint: "TCO 和推荐结果都回到同一质量门下的业务单位。" },
    ],
    labs: [
      { title: "完成一份算力工作负载包络", scenario: "客户只提供模型参数量和预计 GPU 卡数，希望直接报价。", tasks: ["补齐模型版本、训练/推理、精度、数据或上下文、并发、质量、SLO、增长和恢复", "分开估算权重、激活、梯度、优化器、KV Cache、工作区和余量", "列出紧耦合互联、跨域网络、存储、故障域、供电和散热验证项"], deliverable: "工作负载包络与待测假设清单", acceptance: "任何容量数字都能追溯到同口径负载和质量门，训练与服务不会混用同一估算。", sourceIds: ["roofline-2009", "mlperf-training", "mlperf-inference-datacenter", "vllm-2023"] },
      { title: "比较两种集群投资方案", scenario: "方案 A 峰值算力更高，方案 B 软件成熟且云上交付更快。", tasks: ["在同一质量目标和负载上测冷启动、稳态、峰值、长跑、缩放和恢复", "加入软件迁移、供应、能耗、闲置、设施和故障恢复成本", "对流量增长、交付延迟和利用率做敏感性分析"], deliverable: "有效产能—风险—资源级 TCO 决策记录", acceptance: "推荐不依赖单一规格或公开提交，并明确项目 ROI 仍需上层业务证据。", sourceIds: ["mlperf-training", "mlperf-inference-datacenter", "mlperf-storage-v2", "finops-unit-economics"] },
      { title: "把采购问题改写成约束就绪门", scenario: "客户只问“买几张卡”，但训练/推理负载、设施、网络、软件运维和供给周期都未知。", tasks: ["先排工作负载合同、设施、内存与数据路径、通信、软件与运维、供应连续性和 TCO", "把每个约束写成 pass、fail 或待验证", "为缺证据项定义验证负责人和进入采购的条件"], deliverable: "采购前约束就绪门、验证项和敏感区间", acceptance: "不会用“利用率达到某百分比就自建”或“几张卡即可”回答；每个就绪门都有证据。", sourceIds: ["mlperf-training", "mlperf-storage-v2", "finops-unit-economics"] },
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

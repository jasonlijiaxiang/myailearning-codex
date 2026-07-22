const freezeItems = (items) => Object.freeze(items.map((item) => Object.freeze(item)));
const freezeLabs = (items) => freezeItems(items.map((item) => ({ ...item, tasks: freezeItems(item.tasks), sourceIds: Object.freeze(item.sourceIds) })));
const freezeQa = (items) => freezeItems(items.map((item) => ({ ...item, evidence: freezeItems(item.evidence) })));

/**
 * 在原有课程与学习内容上补齐试点之后暴露出的生产判断缺口。
 * 数量由主题决定；这里不复制既有章节，也不把每个模块配成相同长度。
 */
export const completionCurriculum = Object.freeze({
  "model-landscape": freezeItems([
    { title: "评估矩阵与模型发布", en: "Evaluation & Release", explanation: "模型候选要在相同任务、输入分布和通过条件下比较，并把模型标识、Prompt、工具 Schema、数据版本和结果绑定。模型升级后先离线回归，再按任务切片灰度。", decision: "把选型结果转成可复现发布证据，不停留在一次榜单或 Demo。", boundary: "同名模型、默认别名或厂商自动升级可能改变行为；历史结果不能自动代表当前版本。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
  ]),
  multimodal: freezeItems([
    { title: "证据坐标与分层评估", en: "Evidence Coordinates", explanation: "文档、图像、音频和视频的错误来源不同，应分别检查采集、解析、定位、跨模态理解和最终主张。输出需要保留页码、区域、时间段或说话人等原始坐标。", decision: "用最难模态切片和证据回看能力决定是否可进入生产。", boundary: "统一多模态模型能简化接口，但不会自动恢复丢失的版面、时间和权限信息。", sourceIds: ["docling-report", "nist-genai-profile"] },
  ]),
  mcp: freezeItems([
    { title: "错误、进度与可观测", en: "Failure Semantics", explanation: "生产 MCP Server 不只返回成功结果，还要让 Host 区分参数错误、权限拒绝、暂时故障、超时和部分结果，并关联请求、工具、主体与下游业务状态。", decision: "在复用前验证错误是否可处理、重试是否安全、日志是否足以追责。", boundary: "协议层错误不能替代业务事务状态；网络超时也不能证明动作未发生。", sourceIds: ["mcp-architecture", "opentelemetry-genai-semconv"] },
  ]),
  a2a: freezeItems([
    { title: "幂等、取消与恢复", en: "Reliability", explanation: "跨 Agent 长任务可能在网络超时后继续执行，委托方需要稳定任务 ID、查询权威状态、幂等键、取消语义、部分产物规则与人工升级条件。", decision: "把失败恢复写进任务契约，再决定重试和超时。", boundary: "收到取消请求不等于副作用已经撤销；完成技术状态也不证明业务结果已被接受。", sourceIds: ["a2a-concepts", "nist-genai-profile"] },
    { title: "采用边界与迁移", en: "Adoption Boundary", explanation: "A2A 适合独立 Agent 之间需要能力发现和持久任务协作的场景。固定集成、单一组织内编排或简单事件通知，通常用 API、队列和工作流更直接。", decision: "只有跨边界协作收益能够覆盖协议、身份和运营成本时采用。", boundary: "多 Agent 数量增加不会自动提高任务质量，反而会放大协调、成本与故障面。", sourceIds: ["a2a-concepts", "anthropic-effective-agents"] },
  ]),
  evaluation: freezeItems([
    { title: "评估集版本、污染与裁决", en: "Dataset Governance", explanation: "黄金集要记录题目来源、适用任务、裁决人、版本和难度切片，并与训练、调参和演示样本隔离。争议样本需要保留裁决理由和更新历史。", decision: "把评估集当作受治理资产，避免调参过程把考卷变成训练材料。", boundary: "样本量增加不能修复错误标签、分布偏差或评审口径不一致。", sourceIds: ["nist-genai-profile", "ragas"] },
    { title: "线上任务结果与回流", en: "Online Evaluation", explanation: "离线评估提供可重复比较，线上灰度负责暴露真实分布、工具故障和用户行为。只有经过脱敏、复核和责任确认的新失败，才进入下一轮回归集。", decision: "把业务终态、质量、风险、时延和成本一起用于发布后判断。", boundary: "点赞、停留时间或模型自评不能单独证明任务成功，也不能未经裁决直接成为标签。", sourceIds: ["opentelemetry-genai-semconv", "nist-genai-profile"] },
  ]),
  "ai-gateway": freezeItems([
    { title: "策略变更与证据化发布", en: "Policy Release", explanation: "路由、限流、护栏、缓存和日志策略会改变生产行为，应绑定同一策略版本，经过离线回放、影子判定、分段灰度和可验证回滚。", decision: "让一次请求可以还原当时命中的完整策略，而不是只看到当前配置。", boundary: "回滚网关配置不会撤销已经发生的外部动作，业务补偿仍由应用负责。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
  ]),
  "ai-ops": freezeItems([
    { title: "遥测数据与隐私", en: "Telemetry Governance", explanation: "可观测需要记录任务、版本、阶段、错误和业务结果，但不代表默认保存所有 Prompt 与响应。采样、脱敏、访问、用途和保留期要按数据敏感度设计。", decision: "先定义需要回答的运营问题，再收集足以归因的最小数据。", boundary: "只保存全文会增加泄露风险；只保存聚合指标又可能无法复现具体故障。", sourceIds: ["opentelemetry-genai-semconv", "nist-genai-profile"] },
    { title: "从告警到业务恢复", en: "Incident Recovery", explanation: "事故处理需要区分检测、止损、隔离、技术恢复、业务状态确认和客户影响评估。回滚模型或 Prompt 后，还要确认工具副作用、缓存和异步任务是否一致。", decision: "为高风险路径预先准备分层开关、责任人和恢复证据。", boundary: "错误率恢复正常或服务重新返回 200，都不能证明业务影响已经结束。", sourceIds: ["nist-genai-profile", "nist-zero-trust"] },
  ]),
  "llm-training": freezeItems([
    { title: "实验谱系与可复现制品", en: "Experiment Lineage", explanation: "训练结果需要关联代码、数据、Tokenizer、初始化权重、超参数、随机种子、并行配置、Checkpoint、评估和运行环境。长作业恢复后也要验证状态连续。", decision: "把可复现证据作为模型制品的一部分，而不是依赖运行人员记忆。", boundary: "记录所有参数仍不能消除硬件、内核和非确定性执行带来的差异。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
  ]),
  "llm-inference": freezeItems([
    { title: "版本发布与请求连续性", en: "Serving Release", explanation: "模型、引擎、量化格式、Tokenizer、聊天模板和路由策略共同决定服务行为。灰度要同时观察质量、TTFT、TPOT、拒绝率、成本和在途请求处理。", decision: "把推理栈作为一个发布单元验证，并预先定义排空、回滚和缓存处理。", boundary: "进程健康和权重加载成功不能证明协议兼容、质量不退化或请求状态连续。", sourceIds: ["vllm-2023", "opentelemetry-genai-semconv"] },
  ]),
  "data-engineering": freezeItems([
    { title: "按用途分流数据制品", en: "Purpose-specific Products", explanation: "同一原始数据用于 RAG、评估和训练时，更新速度、许可、去重、标签和泄漏风险不同。共享来源身份与血缘，但分别发布用途明确的数据版本。", decision: "在加工前先写用途和验收，不把一个数据集无条件复制到所有下游。", boundary: "能用于检索不表示可以用于训练；能用于内部评估也不表示可以进入生产日志。", sourceIds: ["nist-genai-profile", "nist-zero-trust"] },
  ]),
  "ai-infra-platform": freezeItems([
    { title: "容量、成本与供给", en: "Capacity Economics", explanation: "平台容量既受设备数量影响，也受队列、拓扑碎片、故障、升级、保留余量和供给周期影响。成本要关联完成的训练或达标推理结果。", decision: "用业务优先级、排队原因和有效产出共同制定扩容或共享策略。", boundary: "设备利用率高不代表 Goodput 高，低利用率也可能是为在线 SLO 保留的必要容量。", sourceIds: ["opentelemetry-semconv", "nvidia-gpu-operator"] },
  ]),
  "ai-infra-compute": freezeItems([
    { title: "端到端基准与交付验收", en: "Benchmark & Acceptance", explanation: "硬件比较要使用目标模型、精度、序列、并发、框架和数据通路，覆盖冷启动、长跑、故障恢复和质量，而不只运行短时峰值测试。", decision: "以每个达标结果的持续性能、全成本和可恢复性验收供给。", boundary: "单次公开 Benchmark、峰值 FLOPS 或缓存后的稳态速度都不能代表客户生产负载。", sourceIds: ["flashattention-2022", "vllm-2023", "nist-genai-profile"] },
  ]),
});

export const completionLearning = Object.freeze({
  "model-landscape": Object.freeze({
    route: freezeItems([
      { title: "补上风险与交付边界", learn: "为候选模型标注不可接受错误、数据地域、版本固定和替换条件。", checkpoint: "模型可行域包含能力以外的硬约束。" },
      { title: "把选择变成发布证据", learn: "绑定任务集、模型、Prompt、工具和结果，设计灰度与回滚。", checkpoint: "任何上线结论都能还原比较条件和版本。" },
    ]),
    labs: freezeLabs([
      { title: "评审一次模型自动升级", scenario: "供应商准备更新默认模型别名，客户担心行为漂移。", tasks: ["冻结当前模型、Prompt、工具和知识版本", "选择关键任务与高风险切片做新旧对照", "设计灰度、告警、回滚和无法固定版本时的补偿控制"], deliverable: "模型升级评审单", acceptance: "明确允许变化、禁止退化、负责人和回滚证据。", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
    ]),
  }),
  multimodal: Object.freeze({
    route: freezeItems([
      { title: "按模态建立困难切片", learn: "分开检查扫描、表格、低清图、口音、噪声、长视频和跨模态引用。", checkpoint: "能说明每类错误发生在采集、解析、对齐还是推断。" },
      { title: "验证证据回看", learn: "要求输出回到页面、区域、时间段或说话人，并设计人工复核。", checkpoint: "高影响结论不依赖模型的一句自我解释。" },
    ]),
    labs: freezeLabs([
      { title: "建立多模态错误分层报告", scenario: "同一批合同含文字 PDF、扫描页、表格和图片附件。", tasks: ["为四类输入定义原始证据坐标", "分别记录解析、定位、理解和回答错误", "比较统一模型与专用解析管线的失败分布"], deliverable: "多模态错误分层与路线建议", acceptance: "每个结论都能回看原始证据，并说明不可外推范围。", sourceIds: ["docling-report", "pp-ocr-2020", "nist-genai-profile"] },
    ]),
  }),
  mcp: Object.freeze({
    route: freezeItems([
      { title: "验证错误与恢复", learn: "为只读、写入和长任务工具定义错误、超时、重试和幂等。", checkpoint: "Host 能区分可重试故障与未知业务状态。" },
      { title: "建立目录与下线责任", learn: "登记 Server 所有者、版本、信任来源、兼容范围和停用流程。", checkpoint: "协议接入不会形成无人负责的工具供应链。" },
    ]),
    labs: freezeLabs([
      { title: "评审一个企业 MCP Server", scenario: "团队准备把工单系统工具开放给多个 Agent 客户端。", tasks: ["检查能力边界、Schema、只读与写入分离", "画出用户、Host、授权服务器与业务系统身份链", "演练超时、重复提交、版本不兼容和下线"], deliverable: "MCP Server 上线评审包", acceptance: "能证明谁可调用什么、失败怎样恢复、谁负责长期维护。", sourceIds: ["mcp-architecture", "mcp-authorization", "mcp-security"] },
    ]),
  }),
  a2a: Object.freeze({
    route: freezeItems([
      { title: "补齐恢复与取消", learn: "用权威任务状态、幂等键、部分产物和人工接管处理不确定结果。", checkpoint: "网络超时后不会盲目重复高风险动作。" },
      { title: "验证采用收益", learn: "把 A2A 与 API、事件、工作流和内部多 Agent 编排放在同一问题下比较。", checkpoint: "只有独立 Agent 协作确有价值时才增加协议。" },
    ]),
    labs: freezeLabs([
      { title: "设计跨团队 Agent 委托契约", scenario: "销售 Agent 委托交付 Agent 创建一份需要多小时完成的方案资产。", tasks: ["定义 Agent Card、输入、身份、预算和预期 Artifact", "设计进行中、补充信息、完成、失败与取消状态", "演练超时、重复委托、部分产物和人工接管"], deliverable: "A2A 长任务契约与恢复图", acceptance: "任务状态、业务结果、责任人和副作用恢复分别明确。", sourceIds: ["a2a-concepts", "a2a-specification", "nist-genai-profile"] },
    ]),
  }),
  evaluation: Object.freeze({
    route: freezeItems([
      { title: "治理考卷与裁决", learn: "记录样本来源、切片、评分规则、争议和版本，隔离训练与评估。", checkpoint: "评估结果不依赖不可追溯的题目和标签。" },
      { title: "连接线上业务结果", learn: "用灰度、业务终态和已复核失败补充离线评估。", checkpoint: "能区分离线通过与生产真实有效。" },
    ]),
    labs: freezeLabs([
      { title: "校准一次 LLM Judge", scenario: "开放问答没有唯一标准答案，团队准备使用模型评审。", tasks: ["把质量拆成可观察维度并写评分量表", "对人工双评样本交换答案顺序并做长度扰动", "跨模型家族抽检一致性，定义适用范围与争议升级"], deliverable: "评审量表、偏差切片与校准报告", acceptance: "确定性检查、模型评审和人工裁决各有边界，位置与冗长偏差有实测记录。", sourceIds: ["llm-as-judge-2023", "ragas", "nist-genai-profile"] },
    ]),
  }),
  "ai-gateway": Object.freeze({
    route: freezeItems([
      { title: "把策略当作发布资产", learn: "统一版本化路由、限流、重试、护栏、缓存、日志和例外。", checkpoint: "一次请求可以还原当时命中的完整策略。" },
      { title: "演练网关自身故障", learn: "验证控制面不可用、数据面退化、绕行和下游故障时的行为。", checkpoint: "关键策略不会因故障被静默跳过。" },
    ]),
    labs: freezeLabs([
      { title: "排查一次网关放大故障", scenario: "模型提供方间歇报错后，网关延迟和调用量同时上升。", tasks: ["沿 Trace 统计应用、网关、SDK 和下游的每层 attempt", "明确重试、超时、限流与幂等所有者", "设计受控降级、容量保护和恢复验证"], deliverable: "故障放大归因与策略修订", acceptance: "能解释每次额外调用来自哪一层，并证明修订后不再乘法放大。", sourceIds: ["opentelemetry-semconv", "opentelemetry-genai-semconv", "nist-genai-profile"] },
    ]),
  }),
  "ai-ops": Object.freeze({
    route: freezeItems([
      { title: "先治理观测数据", learn: "为 Prompt、响应、工具结果和业务事件定义采样、脱敏、访问与保留。", checkpoint: "观测既能归因，也不默认扩大敏感数据暴露。" },
      { title: "验证业务恢复", learn: "从告警止损继续追踪技术恢复、外部副作用和客户影响。", checkpoint: "服务恢复与业务恢复都有独立证据。" },
    ]),
    labs: freezeLabs([
      { title: "设计一份 AI 事故运行手册", scenario: "Agent 出现越权工具调用，团队需要立即止损并恢复服务。", tasks: ["定义按模型、Prompt、工具、租户和动作风险分层的开关", "指定证据保留、负责人、通知和业务状态核对", "用事故样本完成回放、受限恢复与逐级放量"], deliverable: "AI 事故处置与恢复手册", acceptance: "每个阶段都有执行人、进入条件、退出条件和业务确认。", sourceIds: ["nist-genai-profile", "nist-zero-trust", "opentelemetry-genai-semconv"] },
    ]),
  }),
  "llm-training": Object.freeze({
    route: freezeItems([
      { title: "建立实验谱系", learn: "绑定数据、代码、Tokenizer、超参数、并行、环境、Checkpoint 和评估。", checkpoint: "任何候选模型都能追到完整训练条件。" },
      { title: "用有效进度验收集群", learn: "同时观察计算、通信、I/O、失败、恢复和合格模型产出。", checkpoint: "不再用 GPU 小时或瞬时利用率代替训练结果。" },
    ]),
    labs: freezeLabs([
      { title: "复盘一次长训练中断", scenario: "多节点训练在中途故障后从 Checkpoint 恢复，但最终结果异常。", tasks: ["核对数据游标、随机状态、优化器、调度器和拓扑", "比较恢复前后 Loss、吞吐和未见任务表现", "补齐 Checkpoint 周期、校验和恢复演练"], deliverable: "训练恢复一致性报告", acceptance: "能证明训练状态连续，或明确必须回退到哪个可信点。", sourceIds: ["opentelemetry-semconv", "nist-genai-profile"] },
    ]),
  }),
  "llm-inference": Object.freeze({
    route: freezeItems([
      { title: "拆开时间账与显存账", learn: "分别计算排队、Prefill、Decode、传输，以及权重、KV、工作区和余量。", checkpoint: "能解释慢在哪里、容量被什么占用。" },
      { title: "把优化作为版本发布", learn: "量化、缓存、批处理、分离和引擎升级都经过质量与服务回归。", checkpoint: "性能收益不以隐藏质量或恢复退化为代价。" },
    ]),
    labs: freezeLabs([
      { title: "诊断一次首字延迟退化", scenario: "模型版本未变，但用户看到首字的时间突然增加。", tasks: ["分别测客户端、网关、排队和引擎 Prefill 时间", "按输入长度、并发、缓存命中和重试切片", "提出最小修复并验证 TPOT、吞吐和质量未退化"], deliverable: "TTFT 分层诊断报告", acceptance: "定位到具体阶段和条件，而不是笼统归因于模型变慢。", sourceIds: ["vllm-2023", "opentelemetry-genai-semconv"] },
    ]),
  }),
  "data-engineering": Object.freeze({
    route: freezeItems([
      { title: "按用途发布数据版本", learn: "为 RAG、评估与训练分别定义许可、更新、标签和泄漏边界。", checkpoint: "共享血缘但不混用用途不同的数据制品。" },
      { title: "证明变化已传播", learn: "对新增、修改、撤权和删除执行全链对账与失败重放。", checkpoint: "源系统变化能在约定时间内到达所有派生层。" },
    ]),
    labs: freezeLabs([
      { title: "排查一次知识更新未生效", scenario: "源文档已修订，但 RAG 仍引用旧版本。", tasks: ["沿连接、解析、切分、索引、缓存和回答版本逐层对账", "区分事件遗漏、失败隔离、别名切换和缓存问题", "设计重放、全量校验和完成证明"], deliverable: "数据变化传播诊断图", acceptance: "能定位旧版本停留层，并证明修复后撤回和新增都可验证。", sourceIds: ["nist-zero-trust", "opentelemetry-semconv", "docling-report"] },
    ]),
  }),
  "ai-infra-platform": Object.freeze({
    route: freezeItems([
      { title: "区分资源忙与有效产出", learn: "把利用率、MFU、Goodput、排队和业务 SLO 放在同一观察面。", checkpoint: "平台优化指向作业完成与达标服务。" },
      { title: "设计训练和推理的共享边界", learn: "比较资源池、优先级、抢占、切分和故障域。", checkpoint: "共享收益不会破坏在线尾延迟和训练恢复。" },
    ]),
    labs: freezeLabs([
      { title: "设计训练与在线推理混部策略", scenario: "客户希望提高 GPU 利用率，同时保证在线模型的尾部时延。", tasks: ["建立两类负载的资源、拓扑、时限和恢复契约", "比较独立池、配额共享、抢占和设备切分", "压测干扰、扩缩、故障和成本归属"], deliverable: "混部策略与停止条件", acceptance: "说明何时共享、何时隔离，以及违反 SLO 时如何恢复。", sourceIds: ["kubernetes-dra", "nvidia-gpu-operator", "opentelemetry-semconv"] },
    ]),
  }),
  "ai-infra-compute": Object.freeze({
    route: freezeItems([
      { title: "建立端到端长跑", learn: "覆盖模型加载、稳态、峰值、数据供给、故障和恢复。", checkpoint: "硬件比较不依赖短时缓存后的峰值。" },
      { title: "按达标结果核算成本", learn: "把质量、持续性能、闲置、能耗、软件适配和人员纳入比较。", checkpoint: "采购、云租用和 API 使用同一业务单位评估。" },
    ]),
    labs: freezeLabs([
      { title: "验证一条算力瓶颈假设", scenario: "增加加速器后训练吞吐几乎没有提升。", tasks: ["采集计算、HBM、节点内互联、网络、数据加载和 Checkpoint 指标", "用单节点与多节点对照定位最窄层", "调整一个主要变量并进行长跑与故障复测"], deliverable: "算力瓶颈证据报告", acceptance: "结论能区分计算、内存、通信、I/O 和恢复开销，并给出不可外推条件。", sourceIds: ["flashattention-2022", "opentelemetry-semconv", "nist-genai-profile"] },
    ]),
  }),
});

export const completionQa = Object.freeze({
  "model-landscape": freezeQa([
    { q: "公开 Benchmark 应该怎样用于模型候选初筛，而不是直接选出赢家？", a: "先用地域、版本、工具、数据和预算等硬约束划出可行域，再把与客户任务相关的 Benchmark 作为排序信号，选出少量候选进入同条件验证。", depth: "记录榜单对应的模型版本、硬件、Prompt、评分方法和适用任务，把每个分数映射到客户真正需要的能力；不相关或无法复现的分数不进入排序。初筛输出应是候选短名单、淘汰理由和待验证假设，生产验收仍在客户数据、工具和约束下比较任务成功、严重错误、P95 与单位成功成本。", ask: "追问客户：哪些榜单维度与真实任务相关？哪些候选已满足硬约束，值得进入下一轮同条件验证？", tag: "候选初筛", basis: "模型可行域 + 证据映射", evidence: [{ sourceId: "nist-genai-profile", supports: "支持按具体使用情境、受影响主体和风险容忍度测量生成式 AI，而非依赖单一通用分数。" }, { sourceId: "openai-models", supports: "支持模型家族具有不同能力与使用定位，选择仍需结合任务。" }] },
    { q: "怎样为模型停服或不可用准备替代方案？", a: "预先维护通过同一硬门槛的候选模型、适配层和回归集，并明确哪些任务可以降级、阻断或转人工。", depth: "替代不只是换一个端点。上下文窗口、工具调用、Schema、语言、安全策略和输出质量都可能不同。发布包应记录主备模型、适配模板、禁止降级任务、切换条件和回滚证据，并定期演练供应商或地域故障。", ask: "追问客户：哪些能力和数据边界切换时绝不能改变？允许牺牲时延、质量还是功能？", tag: "退出策略", basis: "供应连续性 + 版本治理", evidence: [{ sourceId: "nist-genai-profile", supports: "支持识别第三方依赖、准备响应和持续管理部署风险。" }, { sourceId: "opentelemetry-genai-semconv", supports: "支持记录模型与提供方等调用属性，为切换前后比较提供共同遥测基础。" }] },
  ]),
  multimodal: freezeQa([
    { q: "文档 OCR 字符准确率很高，为什么表格问答仍可能错误？", a: "因为字符识别正确不等于版面、行列、表头、单位和阅读顺序恢复正确。", depth: "表格问题要分开验收文字识别、结构恢复、单元格关系、跨页延续、证据定位和最终计算。客户样本中常见的合并单元格、扫描歪斜、脚注和多级表头应单独切片；高风险数字还要回到原区域复核。", ask: "追问客户：最复杂的表格有哪些结构？错误的行列关系会造成什么业务后果？", tag: "结构恢复", basis: "文档解析 + 分层评估", evidence: [{ sourceId: "docling-report", supports: "支持文档处理需要恢复版面、阅读顺序和表格结构，而不只是纯文本。" }, { sourceId: "pp-ocr-2020", supports: "支持 OCR 系统包含检测、方向与识别等独立阶段；其结果不自动代表表格语义正确。" }] },
    { q: "什么时候应该用原生多模态模型，什么时候保留专用解析管线？", a: "开放理解和复杂图文关系可优先验证原生模型；稳定抽取、坐标、批量处理和强审计通常仍需要专用管线或组合方案。", depth: "对同一任务比较端到端模型和解析后模型的质量、失败可定位性、延迟、成本、版本稳定和人工复核。原生模型减少组件但可能隐藏中间错误，专用管线更可控却会丢失视觉关系；实际方案常按文档类型路由。", ask: "追问客户：结果必须回到原始坐标吗？输入类型是否稳定，谁负责修复解析失败？", tag: "路线组合", basis: "多模态表示 + 生产可审计性", evidence: [{ sourceId: "colpali-2025", supports: "支持直接使用视觉语言模型表示视觉丰富文档的检索路线。" }, { sourceId: "docling-report", supports: "支持显式恢复文档结构的解析路线。" }] },
  ]),
  mcp: freezeQa([
    { q: "MCP 工具返回成功，为什么业务动作仍可能失败？", a: "协议调用成功只说明交换完成；业务系统还可能拒绝授权、校验失败、部分提交或在超时后处于未知状态。", depth: "Server 应把协议错误与业务结果分开，返回可处理的错误语义和稳定关联 ID。写入工具还要使用幂等键、权威状态查询和必要的补偿流程；Host 不应把一段成功文本当作订单、付款或资源变更已经完成。", ask: "追问客户：最终由哪个系统确认动作完成？网络超时后怎样查询、重试或补偿？", tag: "错误语义", basis: "协议边界 + 业务状态", evidence: [{ sourceId: "mcp-architecture", supports: "支持 MCP Host、Client 与 Server 的协议职责分离；最终业务语义由具体能力实现。" }, { sourceId: "opentelemetry-genai-semconv", supports: "支持关联 Agent、工具和模型调用，为跨层归因提供基础。" }] },
    { q: "企业应该允许客户端自动安装任意 MCP Server 吗？", a: "不应该默认允许。Server 是可执行能力和数据入口，应经过来源、代码、权限、版本和运营责任评审。", depth: "建立受管目录，登记发布者、签名或制品来源、暴露能力、所需 scope、网络出口、敏感日志、更新和下线机制。高风险 Server 在隔离环境验证，只读与写入分开批准；客户端自动发现不能绕过企业安装与授权策略。", ask: "追问客户：谁批准 Server 进入目录？更新后如何重新评审，发现恶意版本怎样撤回？", tag: "Server 供应链", basis: "MCP 安全 + 零信任", evidence: [{ sourceId: "mcp-security", supports: "支持评估 MCP 生态中的授权、令牌与安全威胁。" }, { sourceId: "nist-zero-trust", supports: "支持对资源和主体持续验证并实施最小权限。" }] },
  ]),
  a2a: freezeQa([
    { q: "A2A 的取消请求，是否保证远端任务已经停止？", a: "不能默认保证。取消语义要由双方契约说明，并区分停止继续工作、撤销已发生副作用和拒绝最终产物。", depth: "委托方发送取消后仍应查询权威任务状态；执行方要报告正在进行、已完成、不可取消或需要补偿。付款、资源创建等副作用必须由业务系统提供幂等与补偿，不能只靠 Agent 消息。", ask: "追问客户：取消后最迟多久停止？已发生动作由谁发现和补偿？", tag: "取消语义", basis: "任务生命周期 + 业务补偿", evidence: [{ sourceId: "a2a-concepts", supports: "支持 A2A 以持久 Task 状态表达协作，而非仅传递一次消息。" }, { sourceId: "nist-genai-profile", supports: "支持为高影响 AI 行为配置人工监督、响应和恢复。" }] },
    { q: "多 Agent 架构应该由一个编排者控制，还是允许点对点协作？", a: "固定业务责任和高风险流程优先显式编排；只有协作关系确需动态发现时才增加点对点自治。", depth: "中心编排便于统一预算、身份、状态和审计，但可能成为扩展瓶颈；点对点更灵活，却增加环路、重复委托、权限传播和成本失控。可以用业务任务所有者保持最终控制，同时让局部 Agent 通过 A2A 协作。", ask: "追问客户：谁对最终结果负责？协作拓扑变化时，预算、身份和停止条件由谁执行？", tag: "协作拓扑", basis: "复杂度递增 + 风险管理", evidence: [{ sourceId: "anthropic-effective-agents", supports: "支持从简单可组合模式开始，仅在任务需要时增加多 Agent 复杂度。" }, { sourceId: "a2a-concepts", supports: "支持独立 Agent 通过任务与产物语义进行协作。" }] },
  ]),
  evaluation: freezeQa([
    { q: "评估集可以持续增加线上失败样本吗？", a: "可以，但必须先脱敏、去重、裁决和版本化；未经审核的线上输出不能直接成为标准答案。", depth: "为每个候选样本记录来源、任务切片、失败类型、期望行为、裁决人和适用时间。高频相似问题合并，安全或少数群体风险单独保留。评估版本变化后，新旧模型需要在相同版本上比较。", ask: "追问客户：谁有权把线上样本加入考卷？争议答案怎样裁决和更新？", tag: "黄金集治理", basis: "评估数据治理 + 持续学习", evidence: [{ sourceId: "nist-genai-profile", supports: "支持记录测量方法、数据限制和持续出现的新风险。" }, { sourceId: "ragas", supports: "支持将 RAG 质量拆成不同评估维度，但不提供业务真值。" }] },
    { q: "评估分数提升多少才值得发布？", a: "没有通用百分比；要看提升发生在哪些任务、是否越过业务门槛，以及是否带来关键退化、风险、时延或成本。", depth: "发布判断应按切片展示变化，优先检查零容忍错误和核心业务任务，再看总体收益。小幅平均提升可能来自关键高价值切片，也可能掩盖少数严重退化；同时报告置信区间、样本量和评审一致性。", ask: "追问客户：哪个任务门槛决定上线？哪些退化即使总体分数上升也不能接受？", tag: "发布门槛", basis: "风险分层 + 版本比较", evidence: [{ sourceId: "nist-genai-profile", supports: "支持依据组织风险容忍度和使用情境设定测量与管理标准。" }, { sourceId: "opentelemetry-genai-semconv", supports: "支持将线上版本和调用属性纳入可比较遥测。" }] },
  ]),
  "ai-gateway": freezeQa([
    { q: "AI 网关的策略应该怎样安全上线？", a: "把路由、限流、重试、护栏、缓存和日志绑定为版本化策略包，先回放和影子判定，再按业务风险分段灰度。", depth: "离线回放比较新旧决策，不实际执行高风险动作；影子模式只记录拟议变化；灰度按租户、任务和风险分组，而不是只按流量百分比。超过质量、时延、风险或成本门槛时原子回滚，并保留受影响请求。", ask: "追问客户：哪些策略变化会改变业务结果？谁批准，怎样还原一次请求使用的策略版本？", tag: "策略发布", basis: "发布治理 + 可观测", evidence: [{ sourceId: "nist-genai-profile", supports: "支持在系统变更前后进行风险测量、监控和管理。" }, { sourceId: "opentelemetry-genai-semconv", supports: "支持用共同遥测字段关联生成式 AI 请求与版本属性。" }] },
    { q: "模型提供方故障时，AI 网关应该自动切到任意可用模型吗？", a: "不应该。只能切到预先验证过能力、数据边界和安全策略的候选；不满足硬门槛的任务应阻断或转人工。", depth: "备用模型即使返回成功，也可能缺少工具、Schema、上下文、语言或地域能力。为每条回退路径维护评估结果、允许降级项和禁止任务，并在故障演练中验证路由原因、质量、尾延迟和恢复。", ask: "追问客户：故障时允许牺牲质量、功能、地域还是时延？哪些任务不能自动降级？", tag: "故障降级", basis: "模型等价性 + 风险门槛", evidence: [{ sourceId: "nist-genai-profile", supports: "支持识别依赖失效并准备与风险相称的响应和恢复。" }, { sourceId: "cloudflare-ai-gateway", supports: "支持 AI 网关可提供多模型代理与故障转移等集中治理能力；具体等价性仍需应用验证。" }] },
  ]),
  "ai-ops": freezeQa([
    { q: "AI 事故恢复后，为什么还要核对业务系统状态？", a: "因为模型或服务恢复只证明技术链可用，事故期间已经发生的订单、通知、权限或数据写入不会自动撤销。", depth: "事件处理要从受影响任务和 Trace 找到外部动作，查询权威系统的最终状态，按幂等或补偿规则修复，再确认客户影响和通知。只有技术指标、业务状态和风险复测共同通过，才能逐级恢复流量。", ask: "追问客户：AI 系统可以改变哪些外部状态？事故后由谁逐项核对和补偿？", tag: "业务恢复", basis: "事件响应 + 权威状态", evidence: [{ sourceId: "nist-genai-profile", supports: "支持为生成式 AI 风险建立响应、恢复和受影响主体管理。" }, { sourceId: "nist-zero-trust", supports: "支持对资源访问持续执行身份与策略控制，恢复时不能沿用隐式信任。" }] },
    { q: "观测数据保留越多，是否越容易排查 AI 问题？", a: "不一定。需要的是可关联、可解释且合法的证据；无目的保存全文会增加泄露与治理成本。", depth: "先列运营问题，再选择任务 ID、版本、阶段、错误、时延、成本和业务结果等结构化字段。正文只在确有必要时按风险采样、脱敏和受控访问，并设置用途与保留期。没有版本和业务结果的大量日志，通常仍无法归因。", ask: "追问客户：必须回答哪些排障或审计问题？哪些字段足够，哪些原文确有合法保存理由？", tag: "遥测治理", basis: "最小必要 + 可归因性", evidence: [{ sourceId: "opentelemetry-genai-semconv", supports: "支持用标准属性描述生成式 AI 和 Agent 遥测，不要求默认保存全部正文。" }, { sourceId: "nist-genai-profile", supports: "支持在测量需求与隐私、数据治理风险之间进行管理。" }] },
  ]),
  "llm-training": freezeQa([
    { q: "训练恢复后 Loss 连续，为什么还不能证明状态正确？", a: "Loss 连续只是一项信号；数据游标、随机状态、优化器、学习率、并行拓扑和样本顺序仍可能漂移。", depth: "恢复演练应比较 Checkpoint 元数据、下一批样本、优化器与调度器状态、吞吐和未见任务表现。对大规模训练还要核对数据重复或跳过、集群成员变化和数值精度。无法证明连续时，应回退到更早的可信 Checkpoint。", ask: "追问客户：Checkpoint 保存了哪些状态？恢复后如何发现样本重复、遗漏或优化器重置？", tag: "训练恢复", basis: "分布式状态 + 评估证据", evidence: [{ sourceId: "nist-genai-profile", supports: "支持记录模型生命周期、测试限制和变更后的风险。" }, { sourceId: "opentelemetry-semconv", supports: "支持将运行事件与系统遥测关联，为恢复诊断提供基础。" }] },
    { q: "参数更多、训练 Token 更多，是否一定能得到更好的模型？", a: "不能。收益取决于数据质量、模型与数据配比、架构、优化和目标任务，规模扩大还会增加通信与失败成本。", depth: "Scaling Law 是特定实验设定下的经验关系，可用于形成预算假设，但不能脱离数据质量和目标任务外推。训练前应比较更好数据、继续预训练、微调或更换模型；训练中用未见任务和效率证据决定是否继续。", ask: "追问客户：目标能力缺口是什么？增加参数、数据或训练阶段分别依据什么证据？", tag: "Scaling 边界", basis: "计算最优 + 任务验证", evidence: [{ sourceId: "chinchilla-2022", supports: "支持在论文实验设定下模型规模与训练数据应共同扩展，而非只增加参数。" }, { sourceId: "nist-genai-profile", supports: "支持在具体使用情境中测量模型能力与风险。" }] },
  ]),
  "llm-inference": freezeQa([
    { q: "模型权重能装进显存，为什么并发一上来仍会 OOM？", a: "因为权重只是固定内存；KV Cache、激活、工作区、碎片和并发序列还会持续占用显存。", depth: "容量模型要按层数、KV 头、头维度、精度、输入与输出长度和并发计算缓存，再加运行时工作区与安全余量。最大上下文和最大并发通常不能同时兑现；批处理和缓存策略也会改变峰值。", ask: "追问客户：真实输入、输出和并发分布是什么？最长请求占比与可排队时间是多少？", tag: "显存容量", basis: "KV Cache + 运行时内存", evidence: [{ sourceId: "vllm-2023", supports: "支持 KV Cache 块管理、连续批处理和显存碎片会影响推理容量。" }] },
    { q: "量化后吞吐提高，为什么仍可能不值得上线？", a: "因为需要同时验证目标任务质量、长上下文、尾延迟、硬件内核、稳定性和每个成功任务成本。", depth: "量化格式减少内存或带宽，但不同硬件与算子收益不同，质量损失可能集中在少数高价值切片。发布前用相同负载比较 TTFT、TPOT、吞吐、拒绝率、能耗和关键任务，并验证模型、Tokenizer、模板和引擎组合可回滚。", ask: "追问客户：量化要解决的是容量、延迟还是成本？哪些任务退化不能接受？", tag: "量化发布", basis: "性能与质量共同验收", evidence: [{ sourceId: "vllm-2023", supports: "支持推理引擎的内存与调度优化需要结合具体模型和负载。" }, { sourceId: "nist-genai-profile", supports: "支持模型变更后持续评估性能与风险。" }] },
  ]),
  "data-engineering": freezeQa([
    { q: "同一份数据能否同时用于 RAG、评估和训练？", a: "可以共享来源，但不能默认共享用途；三者的许可、更新、标签、泄漏和删除要求不同。", depth: "RAG 需要当前权威版本和查询时权限，评估需要稳定且未被调参污染的样本，训练还涉及复制、长期保留和权重记忆。应从同一来源身份派生用途明确的数据版本，分别登记使用权、截止条件和删除传播。", ask: "追问客户：数据所有者允许哪些用途？评估样本如何避免进入训练，撤回后各下游多久生效？", tag: "用途治理", basis: "数据血缘 + 使用目的", evidence: [{ sourceId: "nist-genai-profile", supports: "支持管理生成式 AI 数据来源、用途、隐私和生命周期风险。" }, { sourceId: "nist-zero-trust", supports: "支持资源访问按当前主体和具体资源授权。" }] },
    { q: "源系统已经删除文档，为什么 AI 应用里仍可能查到？", a: "因为文档可能仍存在于缓存、切块、Embedding、索引、评估资产或异步失败队列。", depth: "为每层建立稳定文档 ID、版本、删除事件、传播状态和完成证明。删除流程要可重试、可对账，并在查询时使用当前权限；必要时重建索引。训练权重是否需要处理则是另一类技术与治理问题。", ask: "追问客户：删除和撤权必须在多久内生效？目前能否列出一份文档的全部派生位置？", tag: "删除传播", basis: "派生血缘 + 当前授权", evidence: [{ sourceId: "nist-zero-trust", supports: "支持每次资源访问根据当前主体和策略作出授权判断。" }, { sourceId: "hnsw-2016", supports: "支持 HNSW 解决近似向量搜索机制，但不提供业务删除、权限或血缘治理。" }] },
  ]),
  "ai-infra-platform": freezeQa([
    { q: "GPU 利用率很高，为什么训练和推理产出仍可能很差？", a: "利用率只说明设备忙，不说明计算对目标模型有效、作业按时完成或在线请求满足 SLO。", depth: "训练还要看 MFU、Goodput、通信、数据等待、Checkpoint、重试和合格模型产出；推理要看任务成功、尾延迟、拒绝率和单位成功成本。平台优化应从排队原因和业务结果反推资源策略。", ask: "追问客户：设备忙时完成了多少达标工作？哪些时间花在通信、等待、重试或不合格输出上？", tag: "有效产出", basis: "资源遥测 + 业务结果", evidence: [{ sourceId: "opentelemetry-semconv", supports: "支持用核心资源、运行时与跨组件语义关联系统遥测。" }, { sourceId: "opentelemetry-genai-semconv", supports: "支持关联生成式 AI 模型调用属性；业务有效产出仍需应用定义。" }, { sourceId: "nvidia-gpu-operator", supports: "支持 GPU 运行栈和监控能力，但不自动定义业务 Goodput。" }] },
    { q: "训练和在线推理可以长期混在同一个 GPU 资源池吗？", a: "可以评估共享，但必须证明抢占、干扰、碎片和故障不会破坏在线尾延迟或训练恢复。", depth: "训练偏长作业吞吐和 Checkpoint，在线推理偏优先级、弹性和尾延迟。可采用独立池、保留容量、配额、低优先级训练或设备切分；用峰值、故障和恢复压测决定边界，而不是只看平均利用率。", ask: "追问客户：在线请求的硬 SLO 是什么？训练被抢占后能丢多少进度，谁承担额外成本？", tag: "混部边界", basis: "调度契约 + 隔离验证", evidence: [{ sourceId: "kubernetes-dra", supports: "支持以设备声明和属性参与调度，不同工作负载仍需明确资源契约。" }, { sourceId: "nvidia-gpu-operator", supports: "支持不同 GPU 共享与运行管理方式；实际隔离和性能需目标环境验证。" }] },
  ]),
  "ai-infra-compute": freezeQa([
    { q: "为什么不能直接用峰值 FLOPS 比较 AI 加速器？", a: "峰值只适用于特定精度和理想算子；真实性能还受内存、互联、软件内核、数据供给和工作负载形状限制。", depth: "用目标模型、精度、序列、批量和框架做端到端长跑，分别观察计算利用、HBM 带宽、通信、数据等待和恢复。训练与推理的瓶颈也不同，单一峰值无法解释首字、吞吐或扩展效率。", ask: "追问客户：目标负载偏计算、内存还是通信受限？候选硬件在哪一层形成瓶颈？", tag: "规格边界", basis: "Roofline 思路 + 端到端验证", evidence: [{ sourceId: "flashattention-2022", supports: "支持通过减少 HBM 读写改善注意力效率，说明内存访问可成为关键瓶颈。" }, { sourceId: "nist-genai-profile", supports: "支持在具体系统与使用情境中验证性能和风险。" }] },
    { q: "多加一倍 GPU，为什么训练速度没有接近翻倍？", a: "设备增加会同时放大通信、同步、数据供给、负载不均和故障开销，扩展效率通常不是线性的。", depth: "比较单卡、单节点和多节点剖析，定位 AllReduce 或 All-to-All、拓扑、拥塞、数据加载、Checkpoint 和 Straggler。MoE 还可能出现专家负载不均。只有在最窄层改善后，增加设备才可能转成有效吞吐。", ask: "追问客户：扩容后哪项等待时间增长最快？单节点和多节点的有效训练进度分别是多少？", tag: "扩展效率", basis: "通信与系统长跑", evidence: [{ sourceId: "opentelemetry-semconv", supports: "支持通过分布式遥测关联调用与基础设施阶段；训练通信仍需框架指标补充。" }, { sourceId: "chinchilla-2022", supports: "支持模型、数据和计算应共同考虑，不能只以设备数量代表训练收益。" }] },
  ]),
});

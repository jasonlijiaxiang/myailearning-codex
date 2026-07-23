const evidence = (sourceId, supports) => ({ sourceId, supports: supports.includes("支持") ? supports : `支持${supports}` });

export const predictiveAiMlopsBrief = {
  slug: "predictive-ai-mlops",
  definition: "预测式 AI（Predictive AI）用历史数据学习分类、回归、排序、预测或异常检测关系；MLOps 把数据、特征、训练、评估、注册、部署、监控和再训练连接成可重复、可审计的生产生命周期。",
  position: "位于数据工程、业务应用与 AI 平台之间，覆盖传统机器学习和深度学习预测系统；它与生成式 AI 可共用数据、评估、发布和观测能力，但不把 Prompt、RAG 或 Agent 的运行机制混同为模型训练流水线。",
  presentation: "lifecycle",
  principleTitle: "一个预测模型如何从业务问题走到持续运营",
  principles: [
    { zh: "目标与标签", en: "Objective & Label", explanation: "先把业务决策写成预测时点、目标变量、观察窗口和可采取动作，避免标签泄漏和无法干预的漂亮分数。", decision: "用预测结果将改变的动作定义成功，而不是先选择算法。" },
    { zh: "特征一致性", en: "Feature Consistency", explanation: "训练与服务必须使用一致的特征定义、时间语义和转换逻辑；离线历史与在线最新值承担不同访问模式。", decision: "只有跨团队复用、低延迟或一致性问题成立时才引入 Feature Store。" },
    { zh: "可复现实验", en: "Reproducible Experiment", explanation: "代码、数据快照、特征、参数、环境和随机种子共同决定模型结果，单独保存权重不足以复现。", decision: "每个候选模型都应能回到一次完整运行及其数据血缘。" },
    { zh: "注册与发布门", en: "Registry & Release Gate", explanation: "模型注册表保存版本、指标、血缘、审批和阶段，发布流水线再执行验证、灰度、回滚与端点配置。", decision: "注册表示形成候选资产，不表示自动适合生产。" },
    { zh: "漂移与再训练", en: "Drift & Retraining", explanation: "数据分布、特征质量、概念关系和业务策略都会变化；监控要关联输入、预测、真实结果和业务影响。", decision: "再训练由证据和门槛触发，不能把固定周期或自动训练等同于自动发布。" },
  ],
  decisions: [
    { question: "这个场景该用预测模型还是生成式模型？", signal: "输出是结构化分数、类别、排序或未来数值，并存在可验证历史标签。", recommendation: "优先建立规则或预测模型基线；只有任务确实需要开放式语言、内容或推理时再加入生成式能力。", boundary: "两类模型可以组合，但必须分别验收预测正确性、生成可靠性和最终业务结果。" },
    { question: "是否需要建设 Feature Store？", signal: "多个模型重复实现特征、线上线下定义不一致，或实时特征访问已成为瓶颈。", recommendation: "先建立稳定实体、时间语义和特征负责人，再验证离线回放与在线读取；小团队单模型可先复用数据管道。", boundary: "Feature Store 不会自动修复错误标签、数据许可或泄漏。" },
    { question: "什么时候触发再训练？", signal: "输入或预测分布变化、真实效果下降、业务规则改变，或新数据足以支持改进。", recommendation: "把数据质量、漂移、延迟标签和业务指标组合成触发器，候选仍需通过独立发布门。", boundary: "漂移不必然导致效果下降，效果下降也可能来自产品、策略或数据管道。" },
    { question: "实时推理还是批量预测？", signal: "决策是否必须在单次请求内完成，以及特征是否能在该时限内取得。", recommendation: "能提前计算的优先批量；需要会话或事件上下文的才做在线，并为缺失特征设计降级。", boundary: "低延迟端点不会让上游特征自动新鲜或正确。" },
    { question: "托管 MLOps 平台还是自建？", signal: "团队在交付速度、数据边界、框架自由度、多云与长期运营能力之间取舍。", recommendation: "用一条代表性流水线比较身份、血缘、注册、部署、监控、成本和退出路径。", boundary: "产品功能与区域会变化，采购时必须按当期官方文档核验。" },
  ],
  deepDiveTitle: "从可训练模型走向可恢复的生产系统",
  deepDiveLead: "MLOps 的难点不是多一个流水线工具，而是让数据、代码、模型和业务结果在变化时仍可追溯、可比较、可回滚。",
  deepDives: [
    { kind: "sequence", eyebrow: "MODEL SUPPLY CHAIN", title: "预测模型的八段生产链", intro: "任何一段失去版本或时间语义，离线分数与线上行为就可能无法解释。", sourceIds: ["google-mlops-predictive-ai", "aws-sagemaker-model-registry", "azure-ml-registries"], items: [
      { name: "定义问题与标签", en: "Frame", mechanism: "固定预测时点、标签窗口、业务动作和误判成本。", decision: "先建立不使用模型的基线。", boundary: "训练标签不能包含预测时点之后的信息。" },
      { name: "生成与验证特征", en: "Feature", mechanism: "记录来源、实体、事件时间、转换和缺失策略。", decision: "用 point-in-time 回放检查泄漏。", boundary: "离线相关性不等于可在线获得。" },
      { name: "训练与比较", en: "Train", mechanism: "绑定代码、数据快照、环境、参数和评估切片。", decision: "比较业务代价而不只比较总体分数。", boundary: "交叉验证不能替代未来时间窗口验证。" },
      { name: "注册、发布与运营", en: "Release", mechanism: "登记血缘和审批，灰度部署后关联输入、输出、标签、业务结果与回滚。", decision: "自动训练与自动上线使用不同授权。", boundary: "旧版本回滚还要恢复特征和端点配置。" },
    ] },
    { kind: "diagnostic", eyebrow: "PRODUCTION FAILURE", title: "离线优秀、线上失效的四类根因", intro: "先沿时间和版本定位，不要把所有下降都归结为模型漂移。", sourceIds: ["google-mlops-predictive-ai", "aws-sagemaker-feature-store"], items: [
      { name: "训练—服务偏差", en: "Training-serving Skew", mechanism: "两侧特征代码、时间窗口、默认值或数据源不一致。", decision: "对同一实体逐字段回放并比较。", boundary: "共享代码仍可能读取不同时间的数据。" },
      { name: "标签或概念变化", en: "Concept Shift", mechanism: "业务策略、用户行为或市场关系改变，使旧标签关系失效。", decision: "同时检查真实结果和策略变更时间线。", boundary: "输入分布稳定也可能发生概念漂移。" },
      { name: "反馈回路", en: "Feedback Loop", mechanism: "模型推荐改变后续数据，使训练样本只看到自身策略产生的结果。", decision: "保留探索组或可识别的策略版本。", boundary: "直接用线上结果再训练可能放大偏差。" },
      { name: "延迟真值", en: "Delayed Ground Truth", mechanism: "欺诈、流失等结果晚于预测很久，短期代理指标掩盖真实效果。", decision: "分别运营快速代理与成熟标签。", boundary: "代理指标改善不能提前宣布业务成功。" },
    ] },
  ],
  criticalBoundary: "MLOps 不是某个产品，也不是把 Notebook 自动运行。它必须同时治理数据和特征时间语义、可复现实验、模型版本、发布控制、线上证据与再训练；生成式 AI 的 Prompt、RAG、Agent 和人工复核仍需各自的应用工程控制。",
  cloudHooks: [
    { stage: "数据与特征（Data & Feature）", services: "对象存储、数据仓库、流处理、Feature Store、数据质量与血缘", value: "统一训练、批量和在线特征的定义与时间语义。", discover: "哪些特征必须实时？训练与服务现在是否使用同一转换和时间点？" },
    { stage: "训练与流水线（Train & Pipeline）", services: "托管训练、流水线、实验跟踪、镜像与密钥管理", value: "把代码、数据、参数、环境和运行记录绑定为可复现实验。", discover: "一次模型结果能否准确复现？数据和代码由谁批准进入训练？" },
    { stage: "注册与部署（Registry & Deploy）", services: "模型注册表、端点、批量推理、CI/CD、灰度与回滚", value: "让候选、审批、版本和生产端点形成可审计发布链。", discover: "谁能批准上线？回滚是否包含特征、镜像和配置？" },
    { stage: "监控与闭环（Monitor & Retrain）", services: "模型监控、数据质量、事件总线、可观测与告警", value: "关联漂移、真实性能、业务结果和再训练证据。", discover: "真实标签多久到达？哪些变化触发调查、训练或回滚？" },
  ],
  relatedSlugs: ["data-engineering", "evaluation", "ai-ops", "ai-infra-platform", "ai-governance"],
  qa: [
    { q: "传统机器学习是不是已经被大模型替代？", a: "没有。结构化分类、预测、排序和异常检测仍常由规则、统计学习或专用模型更直接地完成。", depth: "应比较任务成功、延迟、成本、可解释与维护，不按技术新旧选型。生成式模型可帮助处理非结构化输入或解释结果，但不应无证据替换稳定基线。", ask: "追问客户：最终输出是一个可校准分数，还是开放式内容与行动？", tag: "路线选择", basis: "任务契约 + MLOps 架构", evidence: [evidence("google-mlops-predictive-ai", "该官方架构明确以 predictive AI 为主要适用范围，并描述其持续交付生命周期。")] },
    { q: "Feature Store 是否是 MLOps 的必选组件？", a: "不是。它在特征复用、低延迟访问或训练—服务一致性形成真实问题时才有价值。", depth: "先治理实体、事件时间、负责人和转换定义；否则只是集中保存不可靠特征。PoC 要同时验证离线历史回放、在线新鲜度、访问控制和删除。", ask: "追问客户：目前最严重的是重复开发、在线延迟，还是训练—服务偏差？", tag: "特征治理", basis: "官方架构 + 产品文档", evidence: [evidence("google-mlops-predictive-ai", "把 Feature Store 描述为流水线自动化的可选组件。"), evidence("aws-sagemaker-feature-store", "说明在线与离线存储及训练—服务偏差边界。")] },
    { q: "模型注册表与代码仓库有什么区别？", a: "代码仓库管理源代码；模型注册表管理可部署模型版本及其指标、血缘、审批和生命周期阶段。", depth: "生产发布需要把代码提交、数据快照、环境、模型制品、评估和端点配置关联起来。注册完成只是候选资产形成，不是上线批准。", ask: "追问客户：当前能否从生产预测追到模型、数据、代码和审批？", tag: "模型注册", basis: "官方产品文档", evidence: [evidence("aws-sagemaker-model-registry", "列出模型版本、指标、血缘、审批、阶段和部署职责。"), evidence("azure-ml-registries", "说明跨工作区共享模型、环境、组件和数据资产。")] },
    { q: "监测到数据漂移就应该自动再训练吗？", a: "不应该。漂移只是调查信号，必须结合数据质量、真实效果、业务变化和风险门槛判断。", depth: "自动训练可以生成候选，自动发布应使用独立门禁。某些漂移不影响目标关系，某些概念变化在输入分布上也不明显。", ask: "追问客户：真实标签何时到达？谁有权批准新模型替换生产版本？", tag: "漂移再训练", basis: "持续训练边界", evidence: [evidence("google-mlops-predictive-ai", "支持以新数据、触发器、数据验证和模型验证组成持续训练流水线。")] },
    { q: "离线 AUC 很高，为什么线上业务没有改善？", a: "离线指标可能与业务动作、阈值、时间切分或真实成本不一致，也可能存在泄漏和训练—服务偏差。", depth: "应从业务漏斗反推：分数如何转成动作、谁被影响、真值何时出现、误判代价是什么，再按时间和人群切片检查。", ask: "追问客户：模型输出后具体改变了哪一步决策，现有基线是什么？", tag: "效果验收", basis: "业务结果 + 时间验证", evidence: [evidence("google-mlops-predictive-ai", "要求生产流水线包含数据与模型验证，并记录运行元数据。")] },
    { q: "在线和批量预测应该怎样选择？", a: "由决策时限、特征新鲜度和调用规模决定；能提前计算的任务不必承担在线端点复杂度。", depth: "批量适合周期评分和大规模排序，在线适合会话或事件驱动决策。两者都要管理模型、特征和结果版本，并准备缺失数据与端点故障的降级。", ask: "追问客户：最晚在何时得到分数仍能改变业务动作？", tag: "服务形态", basis: "特征访问与推理时限", evidence: [evidence("aws-sagemaker-feature-store", "区分低延迟在线特征与训练、批量使用的离线历史存储。")] },
    { q: "MLOps 平台建成后，数据科学家就能直接自动上线吗？", a: "不应默认如此。平台可以自动执行验证和交付，但生产替换权限应与风险、职责和回滚能力匹配。", depth: "低风险模型可在严格门槛下提高自动化，高影响模型需要模型所有者、业务和风险角色共同批准。所有路径都要记录审批依据与生产版本。", ask: "追问客户：哪些模型会影响资格、价格、资源分配或安全？", tag: "发布治理", basis: "模型生命周期 + 组织责任", evidence: [evidence("aws-sagemaker-model-registry", "模型注册表支持审批状态和生命周期阶段，但具体组织授权仍需自行定义。")] },
    { q: "生成式 AI 与预测式 AI 能否共用一套 MLOps？", a: "可以共用资产版本、评估、发布、权限和观测底座，但不能共用全部质量指标和运行对象。", depth: "预测模型围绕特征、标签、分数和漂移；生成式系统还涉及 Prompt、检索、工具、非确定输出和人工复核。平台应共享控制面，保留不同工作负载的专用证据。", ask: "追问客户：准备共享的是平台能力，还是把两类系统强行放进同一流水线？", tag: "平台边界", basis: "生命周期分工", evidence: [evidence("google-mlops-predictive-ai", "明确文档主要适用于预测式 AI，因此其做法不能无差别覆盖生成式系统。")] },
  ].map((item) => ({ ...item, addedAt: "2026-07-21" })),
  evidenceCards: [
    { metric: "适用边界", title: "经典 MLOps 主要描述预测式 AI", finding: "Google Cloud 的官方 MLOps 架构明确说明主要适用于预测式 AI，并以 CI、CD 与 CT 组织自动化。", boundary: "该架构不是生成式 AI 应用工程的完整规范。", sourceId: "google-mlops-predictive-ai", accent: true },
    { metric: "特征一致", title: "在线与离线特征承担不同读取模式", finding: "Feature Store 可同时提供低延迟在线最新值与供训练、批量使用的离线历史。", boundary: "使用同一产品不自动保证 point-in-time 正确、许可或数据质量。", sourceId: "aws-sagemaker-feature-store" },
    { metric: "发布证据", title: "注册表管理的不只是模型文件", finding: "模型注册表可关联版本、指标、血缘、审批、阶段和生产部署。", boundary: "产品能力不能替代组织的风险分级与批准职责。", sourceId: "aws-sagemaker-model-registry" },
    { metric: "跨环境", title: "资产可在工作区之外统一晋升", finding: "机器学习 Registry 可集中共享模型、环境、组件和数据资产，并支持从开发向测试与生产晋升。", boundary: "跨工作区共享仍需逐项执行身份、网络、数据和区域控制。", sourceId: "azure-ml-registries" },
  ],
};

export const aiGovernanceBrief = {
  slug: "ai-governance",
  definition: "AI 治理、风险与合规（AI Governance, Risk & Compliance）把组织目标、AI 清单、责任、风险分级、影响评估、控制、证据和持续复核连接成管理体系，使不同 AI 系统按用途和影响接受相称治理。",
  position: "横跨方案、数据、模型、应用、安全、运营与采购层；本模块负责组织级制度与证据闭环，安全模块负责技术威胁控制，法务或监管专业人员负责具体法律解释与适用性结论。",
  presentation: "control",
  principleTitle: "治理如何贯穿 AI 系统的完整生命周期",
  principles: [
    { zh: "清单与责任", en: "Inventory & Accountability", explanation: "先知道组织拥有哪些 AI 系统、用于什么、影响谁、依赖哪些模型与数据，以及谁对每个决定负责。", decision: "没有用途、所有者和生产状态的系统不得被视为已治理。" },
    { zh: "情境与风险分级", en: "Context & Risk Tiering", explanation: "同一模型用于写作辅助与资格判断时风险不同；应按用途、影响对象、自动化程度、可逆性和地区分级。", decision: "控制强度跟随具体用途，不跟随模型品牌。" },
    { zh: "影响与控制映射", en: "Impact & Controls", explanation: "把潜在伤害、受影响群体、数据和模型限制映射到预防、检测、人工、申诉、事件和退出控制。", decision: "每项控制都要有负责人、证据和残余风险。" },
    { zh: "第三方与供应链", en: "Third-party Governance", explanation: "采购模型、数据、工具或云服务不会转移采用方责任；合同、版本、数据处理、变更通知和退出能力必须进入评审。", decision: "采购问卷与技术验证共同决定可用范围。" },
    { zh: "持续保证", en: "Continuous Assurance", explanation: "法规、标准、模型、数据和用途都会变化，治理结论必须带核验日期、复核触发器和可撤销状态。", decision: "用证据台账证明当前控制有效，而不是给系统贴永久“已合规”标签。" },
  ],
  decisions: [
    { question: "先建设委员会、平台还是制度？", signal: "组织缺少统一清单、责任和风险分级，却准备先采购治理工具。", recommendation: "先定义最小政策、角色、清单与分级，再用平台自动收集证据和执行控制。", boundary: "委员会和工具都不能替代业务所有者对用途与影响的判断。" },
    { question: "所有 AI 系统是否使用同一套门禁？", signal: "用同一表单处理低风险助手与高影响自动决策，导致过度治理或重大漏项。", recommendation: "建立公共底线，再按风险层级增加独立验证、人工监督、申诉、外部评估和高层批准。", boundary: "风险分级不是规避义务的标签，适用法律仍需逐地区逐用途判断。" },
    { question: "如何证明治理真正落地？", signal: "只有原则声明和培训记录，无法从生产系统回到版本、测试、审批和事件。", recommendation: "为每个系统建立可追溯证据包：用途、影响、数据、模型、评估、控制、批准、监控和变更。", boundary: "文档齐全不证明控制有效，关键控制需要测试和运行证据。" },
    { question: "第三方模型通过认证是否就能直接采用？", signal: "供应商提供标准证书或合规声明，但客户用途、数据和集成方式不同。", recommendation: "把证书作为组织控制的一项输入，再验证适用范围、例外、客户配置和持续变更。", boundary: "标准认证、风险框架与法律合规是不同性质的证据。" },
    { question: "动态法规如何进入产品生命周期？", signal: "一次法律评审后长期不复核，或把实施时间表写死在产品页面。", recommendation: "维护按地区和用途的法规声明，设置 owner、reviewBy、触发器与替换记录，并保留法务确认。", boundary: "知识库只能提供工程化核验线索，不能代替具体法律意见。" },
  ],
  deepDiveTitle: "从原则口号走向可核验的责任与证据",
  deepDiveLead: "治理真正的交付物不是一份原则，而是任何系统在任何版本都能回答：为何允许、由谁负责、证据是什么、何时复核、如何停止。",
  deepDives: [
    { kind: "sequence", eyebrow: "GOVERNANCE LIFECYCLE", title: "AI 系统的六段治理闭环", intro: "治理从需求进入，在退役和数据处置完成后才结束。", sourceIds: ["nist-ai-rmf", "iso-iec-42001", "nist-genai-profile"], items: [
      { name: "登记与分级", en: "Inventory", mechanism: "记录用途、所有者、用户、影响、模型、数据、地区和自动化程度。", decision: "未登记系统不得进入生产采购与接入。", boundary: "工具扫描不能发现全部影子 AI 和真实用途。" },
      { name: "影响与控制", en: "Assess", mechanism: "识别受影响群体、失败、滥用和供应链风险，并映射控制与残余风险。", decision: "高影响用途先定义不可接受结果。", boundary: "风险矩阵分值不能替代专业判断。" },
      { name: "验证与批准", en: "Assure", mechanism: "用技术测试、人工评审、红队、文档和合同证据决定是否发布。", decision: "批准绑定具体用途、版本与条件。", boundary: "实验环境通过不等于生产控制有效。" },
      { name: "监控、事件与退役", en: "Operate", mechanism: "持续复核效果、伤害、投诉、变化和事件，必要时限制、回滚或退出。", decision: "重大用途和模型变更重新评估。", boundary: "停止端点不等于数据、缓存和派生资产已经处置。" },
    ] },
    { kind: "matrix", eyebrow: "FRAMEWORK BOUNDARIES", title: "框架、标准与法律不能互相替代", intro: "它们可以交叉映射，但回答的问题和证据性质不同。", sourceIds: ["nist-ai-rmf", "iso-iec-42001", "eu-ai-act"], items: [
      { name: "风险框架", en: "Risk Framework", mechanism: "提供识别、测量和管理可信风险的方法。", decision: "用于建立共同语言和活动清单。", boundary: "自愿框架不是产品认证或法律结论。" },
      { name: "管理体系标准", en: "Management System", mechanism: "要求组织建立、实施、维护并持续改进政策、职责和过程。", decision: "用于制度化治理和独立审核准备。", boundary: "体系认证不证明每个模型输出正确。" },
      { name: "法规", en: "Regulation", mechanism: "按司法辖区、角色、用途和风险类别规定法定义务与时间。", decision: "由法务确认适用性并转成技术与流程控制。", boundary: "时间表和实施细则会变化，必须持续核验。" },
      { name: "内部控制", en: "Internal Control", mechanism: "把多种要求映射到一个可测试控制和证据库。", decision: "一项控制可支持多个要求，但保留各自来源与适用范围。", boundary: "交叉映射不能把差异压成一个“已合规”状态。" },
    ] },
  ],
  criticalBoundary: "治理框架、管理体系标准和法规解决的问题不同：采用 NIST AI RMF 不构成认证，获得 ISO/IEC 42001 相关认证也不证明某个系统输出正确或自动满足所有法律，知识库中的法规摘要更不能替代面向具体地区、角色与用途的法律意见。",
  cloudHooks: [
    { stage: "清单与身份（Inventory & Identity）", services: "服务目录、CMDB、模型目录、IAM、标签与资产发现", value: "把系统、模型、数据、所有者和运行环境关联起来。", discover: "组织是否知道哪些团队在生产使用哪些模型、数据和外部 AI 服务？" },
    { stage: "风险与控制（Risk & Controls）", services: "GRC、策略引擎、DLP、内容安全、审批工作流", value: "按用途和风险层级执行共同底线与增强控制。", discover: "哪些用途影响资格、权益、价格、安全或公共信息？" },
    { stage: "证据与保证（Evidence & Assurance）", services: "评估平台、日志、数据目录、审计存储、供应链与合同管理", value: "把测试、版本、审批、运行和第三方证据形成可追溯包。", discover: "一次外部审查能否从政策追到生产请求和控制结果？" },
    { stage: "监控与事件（Monitor & Incident）", services: "可观测、告警、工单、事件响应、法规情报", value: "让模型、用途、法规和供应商变化触发复核、限制或退出。", discover: "谁负责接收变化通知？多快能定位受影响系统并停止使用？" },
  ],
  relatedSlugs: ["security", "evaluation", "ai-ops", "data-engineering", "model-landscape", "predictive-ai-mlops"],
  qa: [
    { q: "AI 治理和 AI 安全是不是同一件事？", a: "不是。安全控制攻击、泄漏和越权；治理还覆盖用途、责任、公平、透明、第三方、合规、申诉和退役。", depth: "安全是治理控制域之一。治理决定哪些系统允许以什么条件运行，安全团队负责部分技术控制，业务、数据、法务、风险和采购分别承担其他责任。", ask: "追问客户：当前缺口是技术防护，还是无人能批准、复核和停止系统？", tag: "职责边界", basis: "风险框架 + 管理体系", evidence: [evidence("nist-ai-rmf", "框架面向个人、组织与社会风险，不限于网络安全。"), evidence("iso-iec-42001", "标准面向组织级 AI 管理体系的建立与持续改进。")] },
    { q: "采用 NIST AI RMF 是否表示已经合规？", a: "不表示。AI RMF 是自愿风险管理框架，可帮助组织建立方法，但不是法律适用结论或产品认证。", depth: "可以把框架活动映射到内部控制，再由法务和合规人员判断各司法辖区要求。当前 NIST 页面还明确 AI RMF 1.0 正在修订，因此引用必须带版本和复核日期。", ask: "追问客户：希望解决内部风险方法、外部认证，还是特定法律义务？", tag: "框架边界", basis: "NIST 官方页面", evidence: [evidence("nist-ai-rmf", "说明 AI RMF 自愿采用、用于风险管理，且 1.0 正在修订。")] },
    { q: "ISO/IEC 42001 能证明某个 AI 产品安全吗？", a: "不能直接证明。它规定组织建立、实施、维护并持续改进 AI 管理体系的要求。", depth: "管理体系证据可增强职责、过程和持续改进，但具体产品仍需完成情境风险评估、技术测试、运行监控和法律适用性判断。", ask: "追问客户：需要体系建设、认证准备，还是某个产品的独立技术保证？", tag: "标准边界", basis: "ISO 官方标准说明", evidence: [evidence("iso-iec-42001", "明确其对象是组织的 AI management system，而非单个模型性能认证。")] },
    { q: "AI 清单至少应该登记什么？", a: "用途、所有者、用户、受影响对象、模型与版本、数据、自动化程度、地区、供应商、生产状态和风险层级。", depth: "清单应能从业务用途追到技术资产和控制证据，并区分实验、内部辅助、对外服务与高影响自动决策。只扫描 API 调用无法发现表格插件、嵌入式模型或真实用途。", ask: "追问客户：今天发生供应商停服或监管询问，多久能列出受影响系统？", tag: "系统清单", basis: "治理可追溯性", evidence: [evidence("iso-iec-42001", "支持通过组织政策、目标和过程管理 AI 系统。"), evidence("nist-ai-rmf", "支持把风险管理纳入 AI 的设计、开发、使用和评估。")] },
    { q: "如何给 AI 系统做风险分级？", a: "按具体用途和影响分级，而不是按模型名称。重点看影响对象、决定类型、自动化程度、可逆性、规模、敏感数据和地区。", depth: "公共底线适用于所有系统，高层级再增加独立验证、人工监督、申诉、事件响应和高层批准。分级依据和例外都要可复核。", ask: "追问客户：系统会建议、排序、拒绝，还是直接改变个人权益或关键运营？", tag: "风险分级", basis: "情境风险方法", evidence: [evidence("nist-ai-rmf", "强调将可信风险纳入具体 AI 产品、服务和系统的生命周期。"), evidence("eu-ai-act", "官方页面按不同风险类别描述不同要求及实施时间。")] },
    { q: "使用第三方模型后，治理责任是否转给供应商？", a: "不会。供应商负责其承诺范围，采用方仍要对具体用途、数据、配置、集成和最终决定负责。", depth: "采购需要验证版本、地域、数据处理、评估、事件通知、停服、分包商和退出路径；上线后还要监控供应商变化是否使原批准失效。", ask: "追问客户：合同是否承诺模型变更通知、数据边界、事件协作和可退出性？", tag: "第三方治理", basis: "共享责任 + 持续治理", evidence: [evidence("iso-iec-42001", "标准同时适用于提供或使用 AI 产品与服务的组织。"), evidence("nist-ai-rmf", "风险框架覆盖 AI 产品、服务和系统的开发与使用。")] },
    { q: "欧盟 AI Act 的时间表可以一次写死吗？", a: "不可以。官方页面显示实施安排仍可能因后续政治协议和修法而变化，应按具体日期重新核验。", depth: "截至本次核验，页面列出 2026 年 8 月的总体适用节点，并列出部分高风险规则延至 2027 或 2028 的更新安排。知识库只维护动态声明和复核日期，具体义务由法务确认。", ask: "追问客户：组织扮演 provider、deployer 还是其他角色？系统属于哪个地区和用途？", tag: "法规时效", basis: "欧盟委员会官方实施页面", evidence: [evidence("eu-ai-act", "官方页面给出当前适用时间表，并记录 2026 年政治协议后的调整。")] },
    { q: "怎样避免治理变成只填表？", a: "让每项声明连接到可测试控制和运行证据，并让重大变更自动触发复核。", depth: "高价值证据包括数据和模型版本、评估结果、访问策略、审批、红队、人工接管、投诉、事件和退役证明。抽样验证文档与生产实际一致，而不是只检查字段是否填写。", ask: "追问客户：哪三项关键控制能从政策一路追到生产运行证据？", tag: "治理落地", basis: "持续保证", evidence: [evidence("iso-iec-42001", "要求建立、实施、维护并持续改进管理体系。"), evidence("nist-ai-rmf", "将风险管理贯穿设计、开发、使用与评估。")] },
  ].map((item) => ({ ...item, addedAt: "2026-07-21" })),
  evidenceCards: [
    { metric: "动态状态", title: "NIST AI RMF 1.0 正在修订", finding: "NIST 官方页面当前明确标注 AI RMF 1.0 is being revised，并保留 1.0、Playbook 与 GenAI Profile 的入口。", boundary: "修订状态不使现有框架失效，但动态结论必须设置复核。", sourceId: "nist-ai-rmf", accent: true },
    { metric: "体系对象", title: "ISO/IEC 42001 管理组织过程", finding: "ISO 官方说明该标准规定建立、实施、维护和持续改进 AI 管理体系的要求。", boundary: "管理体系标准不是单个模型正确率、安全性或法律合规的保证。", sourceId: "iso-iec-42001" },
    { metric: "实施时点", title: "法规时间表必须持续复核", finding: "欧盟委员会页面列出 AI Act 的总体适用节点、例外以及 2026 年政治协议后的高风险系统时间调整。", boundary: "页面摘要和政治协议不能替代正式法律文本与具体法律意见。", sourceId: "eu-ai-act" },
    { metric: "生成式风险", title: "通用治理需要生成式 AI 专项画像", finding: "NIST AI 600-1 在通用 AI RMF 之上提出生成式 AI 特有风险与行动。", boundary: "专项画像仍是风险管理资源，不是产品认证或统一合规清单。", sourceId: "nist-genai-profile" },
  ],
};

export const governanceMlopsCurriculum = {
  "predictive-ai-mlops": {
    lead: "预测式 AI 的学习重点不是算法目录，而是把业务目标、时间正确的数据、可复现实验、受控发布和真实结果连接起来。",
    chapters: [
      { title: "预测问题与业务动作", en: "Problem Framing", explanation: "分类、回归、排序、预测与异常检测都要定义预测时点、标签窗口、决策动作和误判成本。", decision: "从可改变的业务决策反推标签与指标。", boundary: "相关性和离线分数不能自动证明干预有效。", sourceIds: ["google-mlops-predictive-ai"] },
      { title: "时间切分与数据泄漏", en: "Temporal Validation", explanation: "训练样本只能使用预测时点可获得的信息，验证应模拟未来数据和真实标签延迟，并保留当时可见的数据快照。", decision: "按时间、群体和场景切片，并保留不使用模型的基线。", boundary: "随机切分可能把未来信息泄漏到训练和验证。", sourceIds: ["google-mlops-predictive-ai"] },
      { title: "特征工程与 Feature Store", en: "Feature Engineering", explanation: "特征需要实体、事件时间、转换、版本、负责人和在线离线访问语义，还要定义缺失、回填与删除如何传播。", decision: "由复用、一致性与服务时限决定是否建设 Feature Store。", boundary: "集中存储不能自动保证 point-in-time 正确。", sourceIds: ["aws-sagemaker-feature-store", "google-mlops-predictive-ai"] },
      { title: "实验与流水线", en: "Experiment & Pipeline", explanation: "数据验证、特征生成、训练、评估和制品生成应模块化，并记录每次运行元数据，使失败和差异能够逐步重放。", decision: "先让一条代表性流水线可重复，再扩大自动化。", boundary: "Notebook 可用于探索，不应成为唯一生产记录。", sourceIds: ["google-mlops-predictive-ai"] },
      { title: "注册、审批与晋升", en: "Registry & Promotion", explanation: "模型、环境、组件和数据资产需要稳定版本、血缘、指标和批准状态，并在跨环境晋升时保留同一资产身份。", decision: "把注册候选与生产批准分开。", boundary: "模型文件相同不表示端点、特征和配置相同。", sourceIds: ["aws-sagemaker-model-registry", "azure-ml-registries"] },
      { title: "批量与在线服务", en: "Serving Modes", explanation: "批量预测提前计算大规模结果，在线预测在请求时组合最新特征，两者对时限、容量、降级和结果版本的要求不同。", decision: "由业务时限和特征可用性选择服务方式。", boundary: "实时端点不会自动提供实时正确的特征。", sourceIds: ["aws-sagemaker-feature-store"] },
      { title: "监控、漂移与真值", en: "Monitoring", explanation: "监控覆盖数据质量、输入与预测分布、真实效果、延迟、成本和业务结果，并区分快速代理指标与延迟到达的成熟真值。", decision: "把调查、再训练、回滚和接受变化设为不同动作。", boundary: "漂移检测不是模型失效证明。", sourceIds: ["google-mlops-predictive-ai"] },
      { title: "预测式与生成式 AI 的平台边界", en: "Predictive vs Generative", explanation: "两类系统可共享资产、权限、评估、发布和观测底座，但运行对象与质量证据不同，因此需要分别保存专用版本关系。", decision: "共享控制面，保留专用流水线与指标。", boundary: "经典 MLOps 做法不能原样覆盖 Prompt、RAG 和 Agent。", sourceIds: ["google-mlops-predictive-ai", "nist-genai-profile"] },
    ],
  },
  "ai-governance": {
    lead: "AI 治理要把原则翻译成分级、责任、控制和证据，并随着系统、供应商与法规变化持续复核。",
    chapters: [
      { title: "AI 清单与系统边界", en: "Inventory", explanation: "清单连接用途、所有者、用户、影响对象、模型、数据、供应商、地区和生产状态，并区分试验、内部和对外运行范围。", decision: "从业务用途登记，再关联技术资产。", boundary: "API 扫描无法替代用途与影响判断。", sourceIds: ["nist-ai-rmf", "iso-iec-42001"] },
      { title: "责任与三道防线", en: "Accountability", explanation: "业务和产品拥有用途风险，技术团队实现控制，风险与合规监督，独立审计提供保证，各角色还要保留停止和升级路径。", decision: "每项重大决定指定有权批准和停止的人。", boundary: "成立委员会不等于责任已经落实。", sourceIds: ["iso-iec-42001"] },
      { title: "情境风险与影响评估", en: "Impact Assessment", explanation: "按影响对象、自动化程度、可逆性、规模、数据和地区识别伤害与机会，并记录受影响群体与残余不确定性。", decision: "先定义不可接受结果和残余风险。", boundary: "通用模型评级不能替代具体用途评估。", sourceIds: ["nist-ai-rmf", "nist-genai-profile"] },
      { title: "控制与证据映射", en: "Control Mapping", explanation: "把多种框架、标准和法规要求映射到可测试内部控制，并保留各自适用范围、负责人、测试结果和例外状态。", decision: "一项控制可复用证据，但不能合并不同法律结论。", boundary: "控制存在不代表控制有效。", sourceIds: ["nist-ai-rmf", "iso-iec-42001"] },
      { title: "数据、模型与供应商治理", en: "Supply Chain", explanation: "验证数据来源、许可、版本、模型变更、分包商、事件通知和退出能力，并让合同承诺能被技术运行证据核对。", decision: "合同与技术证据共同决定采用范围。", boundary: "采购第三方服务不会转移采用方全部责任。", sourceIds: ["iso-iec-42001", "nist-genai-profile"] },
      { title: "透明、人工与申诉", en: "Human Oversight", explanation: "告知、解释、人工复核、挑战与补救方式要匹配具体影响和角色，相关人员必须拥有足够信息、权限和处理时限。", decision: "高影响决定必须设计可操作的接管与申诉。", boundary: "页面声明或模型解释不能自动纠正错误决定。", sourceIds: ["eu-ai-act", "nist-genai-profile"] },
      { title: "事件、变化与退役", en: "Continuous Assurance", explanation: "重大模型、数据、用途、法规或供应商变化触发复核；退役还包括数据和派生资产处置，并验证访问与运行已经停止。", decision: "所有批准都绑定版本、条件和复核日期。", boundary: "一次合规评审不是永久状态。", sourceIds: ["nist-ai-rmf", "iso-iec-42001", "eu-ai-act"] },
      { title: "框架、标准与法规边界", en: "Framework Boundaries", explanation: "风险框架提供方法，管理体系标准约束组织过程，法规规定具体法定义务；三者可以交叉映射但证据性质不同。", decision: "交叉映射但保留各自证据性质。", boundary: "任何一类都不能单独证明全部合规与技术正确。", sourceIds: ["nist-ai-rmf", "iso-iec-42001", "eu-ai-act"] },
    ],
  },
};

export const governanceMlopsLearning = {
  "predictive-ai-mlops": {
    outcomes: ["把业务决策写成可验证预测任务", "识别标签泄漏和训练—服务偏差", "设计模型注册、灰度与回滚链", "用真值和业务结果管理漂移与再训练"],
    route: [
      { title: "先定义预测时点", learn: "固定谁、在何时、预测什么、用于哪项动作。", checkpoint: "能指出标签泄漏和不可行动指标。" },
      { title: "再建立可复现流水线", learn: "绑定数据、特征、代码、环境、模型与评估。", checkpoint: "任一生产结果能回到完整运行。" },
      { title: "最后运营真实效果", learn: "关联线上输入、预测、真值、业务结果与变化。", checkpoint: "能区分漂移、数据故障、策略变化和模型退化。" },
    ],
    labs: [
      { title: "审计一次流失预测", scenario: "团队报告随机切分 AUC 很高，但上线后转化没有改善。", tasks: ["重建预测时点与标签窗口", "检查未来信息和人群切分", "把分数阈值连接到触达动作和成本"], deliverable: "时间正确的评估设计与业务动作表", acceptance: "所有特征在预测时可获得，指标能支持是否采取行动。", sourceIds: ["google-mlops-predictive-ai"] },
      { title: "设计最小模型发布链", scenario: "模型文件通过聊天工具发送，生产端点无法证明使用哪个版本。", tasks: ["定义模型、数据、代码和环境身份", "设置候选、批准、灰度与回滚", "记录端点、特征和预测证据"], deliverable: "模型注册与发布状态机", acceptance: "任一生产预测可追溯且可恢复到已验证版本。", sourceIds: ["aws-sagemaker-model-registry", "azure-ml-registries"] },
      { title: "诊断一次训练—服务偏差", scenario: "离线重算正确，在线分数在部分用户上持续异常。", tasks: ["逐字段比较离线与在线特征", "检查事件时间、默认值和新鲜度", "设计回放、告警和降级"], deliverable: "偏差归因和防回归测试", acceptance: "能证明问题来自数据时间、转换或模型，并有对应控制。", sourceIds: ["aws-sagemaker-feature-store", "google-mlops-predictive-ai"] },
    ],
  },
  "ai-governance": {
    outcomes: ["建立用途驱动的 AI 清单", "区分风险框架、标准与法规", "把原则映射为可测试控制和证据", "设计第三方、变化、事件与退役治理"],
    route: [
      { title: "先知道拥有什么", learn: "从业务用途登记系统、模型、数据、角色和影响。", checkpoint: "供应商变化时能快速定位受影响系统。" },
      { title: "再按情境分级", learn: "识别受影响对象、决定、自动化、可逆性和地区。", checkpoint: "不同风险层级有清晰增强控制与批准人。" },
      { title: "最后用证据持续保证", learn: "连接评估、策略、审批、运行、投诉、事件和复核。", checkpoint: "任何“已治理”结论都有版本、证据和失效条件。" },
    ],
    labs: [
      { title: "建立最小 AI 系统清单", scenario: "组织知道采购了哪些平台，却不知道团队实际用哪些模型处理什么数据。", tasks: ["选取十个真实用途登记资产和责任", "按影响与自动化程度初步分级", "标出未知项和停止条件"], deliverable: "可追到技术资产的 AI 清单", acceptance: "每项系统都有用途、所有者、生产状态、风险层级和待补证据。", sourceIds: ["nist-ai-rmf", "iso-iec-42001"] },
      { title: "把一项原则变成可测试控制", scenario: "政策写着“保持人工监督”，但生产流程没有明确接管点。", tasks: ["选择一个高影响决定", "定义人工权限、信息、时限与申诉", "设计正常、超时和错误接管测试"], deliverable: "控制说明、运行证据和残余风险", acceptance: "可以证明谁在何种条件下阻止或纠正系统决定。", sourceIds: ["nist-genai-profile", "iso-iec-42001"] },
      { title: "复核一项动态法规声明", scenario: "产品材料沿用一年前的欧盟 AI Act 时间表并声称已经合规。", tasks: ["确认地区、角色、用途和当前官方来源", "拆分法律判断、工程控制与待确认事项", "设置 owner、reviewBy 和变化触发器"], deliverable: "带适用范围和复核日期的法规声明", acceptance: "不使用永久合规标签，时间与结论能回到当前官方页面和法务确认。", sourceIds: ["eu-ai-act"] },
    ],
  },
};

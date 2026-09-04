export const solutionPatternsBrief = {
  slug: "solution-patterns",
  definition:
    "场景解决方案（Solution Pattern）是从业务结果、当前基线与约束出发，对最小充分闭环的能力、责任、证据、运行经济和退出方式所作的可复用决策蓝图。",
  position:
    "位于方案与选型层，主责回答为什么做、系统最少承担什么责任、RAG、Agent、MCP、A2A、Gateway 或平台在何种条件下才需要，以及怎样验收、运营和退出；具体模型比较、切片检索、Agent 循环和协议机制由相关模块展开。",
  presentation: "decision",
  principleTitle: "从客户结果组织方案",
  principles: [
    {
      zh: "业务结果与当前基线",
      en: "Outcome & Baseline",
      explanation:
        "需求记录包含使用者、触发、当前流程、权威完成状态、期望变化、责任人和不可接受损失。模型输出通常是中间产物；获准直接交付时应在契约中明示。",
      decision:
        "缺少现状基线、权威终态或责任人时，项目保留在 Discovery，并把缺口列为下一轮访谈与数据任务。",
    },
    {
      zh: "可测约束包络",
      en: "Measurable Constraint Envelope",
      explanation:
        "把质量、P95/P99 时延、吞吐、可用性、恢复、隐私、驻留、授权、审计、成本上限、维护和迁移写成有场景、优先级和观察方法的约束。",
      decision:
        "硬约束先划定可行域；未知约束进入待验证清单，不得在报价或上线承诺中默认为通过。",
    },
    {
      zh: "最小充分闭环",
      en: "Minimum Sufficient Loop",
      explanation:
        "候选基线依次包括无 AI、确定性规则和单次模型调用；当前知识、外部动作、动态路径、重复互操作或共享治理形成明确需求时，才增加 RAG、工作流、Agent、MCP、A2A、Gateway 或平台。",
      decision:
        "每个组件都要写明必要条件、责任人、失败响应和移除条件；技术名称不是成熟度阶梯。",
    },
    {
      zh: "证据与阶段门",
      en: "Evidence & Delivery Gates",
      explanation:
        "Discovery、PoC、Pilot 与 Production 分别消除价值、最大技术不确定性、真实负载与约束、持续责任和经济性风险，并预先写明停止、修复和扩展条件。",
      decision:
        "用代表、边界和失败样本对照当前基线；只有当前阶段的问题被证据解决，才进入下一阶段。",
    },
    {
      zh: "运营、单位经济与退出",
      en: "Operations, Economics & Exit",
      explanation:
        "知识、模型、Prompt、工具、流程和政策会变化；完整成本、每个达标结果、责任交接、回滚、迁移和停服要从第一版方案共同定义。",
      decision:
        "用完整成本和单位达标结果决定扩大、限制、迁移或停止，不用 Token 单价或理论节省冒充 ROI。",
    },
    {
      zh: "客户侧责任四角",
      en: "Customer Responsibility Quad",
      explanation:
        "方案启动前先确认四类责任角色：业务决策人确认业务结果、损失函数与是否进入下一阶段；数据与 IT Owner 提供数据、身份、权限、系统接口和运行环境；知识与口径运营人维护规则、术语、评估样本与争议处理；安全与合规签字人确认上线条件、责任与专业复核。",
      decision:
        "角色可以由同一人或团队兼任，但四类责任都不能消失；没有签字人的上线决定不属于方案范畴。",
    },
    {
      zh: "三本账连接单位经济",
      en: "Three Ledgers of Unit Economics",
      explanation:
        "用三本账核算方案经济性：Token 与模型调用账、并发容量与服务等级账、人工建设运营与复核账；三本账必须连接到单位经济与客户业务结果。",
      decision:
        "不给脱离工作负载的统一比例；缺账本的数字只能作为待验证假设。",
    },
    {
      zh: "禁止动作先于能力",
      en: "Prohibited Actions First",
      explanation:
        "高影响行业场景先写死模型不能做什么，再定义它能做什么；允许动作必须绑定授权检索、带引用建议与人工最终决定。",
      decision:
        "把禁止动作写入场景合同与发布门，所有模块使用同一表述。",
    },
  ],
  decisions: [
    {
      question: "这个需求值得进入方案设计吗？",
      signal:
        "客户能说清目标用户、当前流程与成本、权威完成状态、期望变化、数据来源、责任人和不可接受损失。",
      recommendation:
        "形成一页结果与基线契约，并把价值、因果归因和未知约束列为待验证假设。",
      boundary:
        "“想用大模型”不是业务结果；没有权威终态、现状基线和负责人时仍处于探索期。",
    },
    {
      question: "系统最少需要承担什么责任？",
      signal:
        "当前流程的剩余缺口可能只是信息整理，也可能需要授权数据、确定性状态推进、外部动作、动态调查或人工判断。",
      recommendation:
        "先用无 AI、规则或单次模型建立基线，再只为无法覆盖的必要责任增加证据、状态、动作、Agent 或互操作能力。",
      boundary:
        "组件更多不表示闭环更完整；无法说明移除后会损失什么的组件不应进入主架构。",
    },
    {
      question: "应该选择检索、生成、行动还是组合方案？",
      signal:
        "问题是否依赖企业知识、是否要改变外部系统状态、输入是否包含文档/图像/语音，以及错误是否可逆。",
      recommendation:
        "当前或私有证据才引入 RAG；稳定状态推进优先工作流；路径随新证据变化且收益足够才用受限 Agent；重复跨 Host 工具接入再考虑 MCP，独立 Agent 域委托再考虑 A2A。",
      boundary:
        "采用门只判断为什么需要；切片、Agent loop、MCP/A2A 对象和 Gateway 策略由各自主模块展开。",
    },
    {
      question: "PoC 之后是 Go、Hold、No-Go 还是 Exit？",
      signal:
        "客户已提供当前基线、代表与失败样本、业务指标、约束阈值、签署人和最大不确定性。",
      recommendation:
        "PoC 证伪最大技术或数据假设，Pilot 验证真实负载与非功能约束，Production 验证持续责任和经济性；每一阶段输出明确决定与后续证据。",
      boundary:
        "演示流畅、单个样例正确或公开 Benchmark 较高都不能单独构成 Go；关键硬门缺证据时应 Hold 或 No-Go。",
    },
    {
      question: "先用托管服务还是自建？",
      signal:
        "比较上线速度、数据与网络边界、定制深度、团队运维能力、规模和现有云资产。",
      recommendation:
        "不确定阶段先用托管能力缩短验证周期；当规模、合规或差异化足以覆盖运维成本时再评估自建。",
      boundary:
        "托管与开源不是绝对二选一，自定义框架也可以运行在托管容器和云基础设施上。",
    },
    {
      question: "报价应怎样避免低估？",
      signal:
        "已有请求量、峰值并发、上下文长度、工具调用次数、数据增量、人工审核和可用性目标。",
      recommendation:
        "分别建立模型、平台资源、集成、评估安全和人工运营成本模型，并给出规模变化的敏感性区间。",
      boundary:
        "PoC 账单不能直接外推生产 TCO；失败重试、峰值容量和人工接管必须计入。",
    },
    {
      question: "客户侧谁为方案结果负责？",
      signal:
        "能列出业务决策人、数据与 IT Owner、知识与口径运营人、安全与合规签字人，以及各自要确认的事项。",
      recommendation:
        "把四角角色写进启动契约：业务结果与损失函数、数据/身份/权限/环境、规则/术语/评估样本/争议、上线条件/责任/专业复核各有人确认。",
      boundary:
        "角色可兼任但责任不能消失；没有安全合规签字的上线决定不属于方案范畴。",
    },
    {
      question: "PoC 通过后上生产为什么还要继续投入？",
      signal:
        "PoC 已验证最大技术或数据假设，但生产还需要高可用、权限、审计、评估回归、运营与责任交接。",
      recommendation:
        "把 PoC 视为模型与数据两层样板墙，生产件还包括入口、保障与运营三层；按生产验收线逐项补证据。",
      boundary:
        "演示成功不等于生产就绪；缺少生产层的验收线不能进入 Pilot。",
    },
    {
      question: "多个场景先做哪一个？",
      signal:
        "候选场景已有数据可用性、权限复杂度、容错成本与 ROI 判断的初步信息。",
      recommendation:
        "用「数据就绪度 × 容错成本」矩阵排序：数据现成、权限可控且容错成本低的最先起步；数据未就绪时先缩范围而非硬上。",
      boundary:
        "行业热点或 ROI 单一指标不能代替矩阵；数据就绪度不足时先做 PoC 缩围。",
    },
    {
      question: "内容生成方案验收时，怎样才算可上线？",
      signal:
        "方案能生成看起来不错的图片、视频或文案，但审核、标识、发布与撤回责任尚未定义。",
      recommendation:
        "把五状态门连成验收链：生成成功、审核通过、标识与分发要求满足、业务批准发布、发布后的撤回/更正/申诉与事件责任；为每个门定义证据、owner 与失败动作，并把素材授权列为前置条件。",
      boundary:
        "视觉或语言质量好不能证明可发布；实时或批量场景都不能跳过强制审核与标识门。",
    },
  ],
    deepDiveTitle: "把方案落到可验收的业务系统",
  deepDiveLead:
    "一份可验收方案说明业务变化的机制、权威终态、失效条件、阶段证据、运行成本和上线后的责任人。组件清单只用来承载这些责任。",
  deepDives: [
    {
      kind: "scenario",
      eyebrow: "AUTONOMY GRADIENT",
      title: "同一个业务目标，自动化深度决定风险与云架构",
      intro:
        "先判断系统只是提供信息、形成建议，还是会改变业务状态；自主性越高，身份、策略、恢复和人工介入越应成为主架构。",
      items: [
        {
          name: "知识助手",
          en: "Read-only Assistant",
          mechanism:
            "系统检索、汇总并引用企业知识，不改变外部系统状态；主要风险是越权检索、过期证据和错误解释。",
          decision:
            "云服务重点放在文档处理、搜索、模型服务、IAM、引用与质量监控，并以可访问、可定位和可拒答验收。",
          boundary:
            "只读不等于低风险；敏感信息泄漏仍可能不可逆。",
        },
        {
          name: "决策副驾",
          en: "Decision Copilot",
          mechanism:
            "系统在证据基础上给出比较、评分或建议，但最终决策由有责任的人员作出。",
          decision:
            "增加规则引擎、解释记录、审批工作流和人工反馈；验收既看建议质量，也看校准、覆盖与升级路径。",
          boundary:
            "建议附带证据并不转移业务责任，也不能掩盖不确定性。",
        },
        {
          name: "受控流程助手",
          en: "Bounded Workflow",
          mechanism:
            "系统只在预定义步骤、工具和参数范围内执行任务，关键状态由工作流或业务系统保存。",
          decision:
            "云服务重点转向工作流、队列、短期身份、幂等、补偿和审批；用最终业务状态而非回答文本验收。",
          boundary:
            "模型可以选择动作，但不能自行扩大工具范围或授权范围。",
        },
        {
          name: "自主任务系统",
          en: "Autonomous Task System",
          mechanism:
            "模型可规划、多轮调用工具并根据观察调整路径，复合错误与资源消耗随轨迹增长。",
          decision:
            "只有复杂度收益与现有做法对比后得到证明才引入，并配置预算、停止条件、沙箱、策略检查、全链追踪和人工接管。",
          boundary:
            "自主性是需要证明的成本，不是默认更高级的方案形态。",
        },
      ],
      sourceIds: ["anthropic-effective-agents", "nist-genai-profile"],
      maxColumns: 2,
    },
    {
      kind: "diagnostic",
      eyebrow: "SOLUTION FAILURE DIAGNOSTICS",
      title: "架构图看起来完整，为什么方案仍可能失真",
      intro:
        "用失败现象反推缺失的因果证据和运营机制，可以在报价和资源投入前暴露方案风险。",
      items: [
        {
          name: "Demo 很好，业务指标不动",
          mechanism:
            "演示指标与业务结果之间没有可验证因果链，或者系统只优化了回答质量，却没有改变真实流程瓶颈。",
          decision:
            "补齐当前做法、目标行为、可观察的最终业务状态和对照组；云上把模型 Trace 与业务事件关联。",
          boundary:
            "用户喜欢或单次回答正确不能替代业务结果。",
        },
        {
          name: "PoC 成功，生产成本失控",
          mechanism:
            "样本未覆盖峰值并发、长上下文、多轮工具、失败重试、人工接管和持续数据处理。",
          decision:
            "按负载切片做容量与成本敏感性分析，观测每个成功任务的模型、检索、计算和人工成本。",
          boundary:
            "PoC 单价与平均时延不能直接外推生产。",
        },
        {
          name: "组件可替换，系统却无法回滚",
          mechanism:
            "模型、Prompt、检索索引、工具 Schema 和策略没有共同版本，变更后无法还原当时执行条件。",
          decision:
            "建立版本元组、灰度路由、冻结回归集和回滚资产；使用注册表、CI/CD、对象存储与 Feature Flag 承载。",
          boundary:
            "供应商提供模型版本不等于应用具备端到端回滚。",
        },
        {
          name: "系统上线，问题无人负责",
          mechanism:
            "业务、数据、平台、安全和运营只在建设期协作，没有为质量漂移、数据更新、告警和争议设定责任人。",
          decision:
            "在方案中建立运行责任矩阵、事件响应、内容所有者和定期复核；将告警直接路由到可处置团队。",
          boundary:
            "托管云服务承担基础设施责任，不承担客户业务事实和最终决策责任。",
        },
      ],
      sourceIds: ["nist-genai-profile", "opentelemetry-semconv", "opentelemetry-genai-semconv"],
      columnLabels: {
        name: "失真现象",
        mechanism: "根因机制",
        decision: "验证与云服务落点",
        boundary: "不能误判",
      },
    },
    {
      kind: "sequence",
      eyebrow: "CLAIM INTAKE BLUEPRINT",
      title: "理赔材料受理与初审助手教学蓝图",
      intro:
        "本蓝图是教学案例，不是保险行业生产标准。AI 只负责材料接收、质量检查、事实与证据提取、缺件提示和带引用的初审建议；资格、责任、金额与付款由授权人工或确定性业务系统决定。",
      sourceIds: ["nist-genai-profile", "nist-zero-trust", "owasp-prompt-injection", "opentelemetry-genai-semconv"],
      items: [
        {
          name: "材料接收与身份授权检查",
          en: "Receive & Verify Identity",
          mechanism:
            "输入申请表、扫描件、照片与补充材料；权威来源是提交人身份、代理关系和授权记录。AI 允许校验身份、登记材料批次并做格式预检。",
          decision:
            "受理系统与人工确认身份和授权；登记材料来源、版本与时间。",
          boundary:
            "AI 不把无授权材料转入检索；身份或授权校验失败时转人工，不自动放行。",
        },
        {
          name: "文件质量、完整性、来源与溯源",
          en: "Quality & Provenance",
          mechanism:
            "AI 允许检测模糊、缺页、格式异常、重复和来源信息，并登记文件哈希与溯源。",
          decision:
            "低质量材料要求重传或人工补录；每份材料保留稳定资产身份。",
          boundary:
            "AI 不跳过低质量材料，也不把解析结果冒充原始证据。",
        },
        {
          name: "授权权威源检索",
          en: "Authorized Retrieval",
          mechanism:
            "AI 允许按案件、角色和当前权限检索保单、条款与业务记录，并把检索结果与来源绑定。",
          decision:
            "检索时 ACL 与租户隔离；无权限内容连存在性都不暴露。",
          boundary:
            "AI 不跨客户检索，也不因相关度或向量接近而获得读取权。",
        },
        {
          name: "事实提取与缺件提示",
          en: "Extract & Missing Items",
          mechanism:
            "AI 允许抽取事实、定位证据坐标、列出缺件、不一致与不确定性。",
          decision:
            "证据冲突或无法定位的内容标记为待人工裁决，不进入初审结论。",
          boundary:
            "AI 不推断资格或责任；提取正确不等于业务事实成立。",
        },
        {
          name: "生成带引用初审建议",
          en: "Cited Intake Suggestion",
          mechanism:
            "AI 允许生成带引用、缺件清单和不确定性的初审说明草稿。",
          decision:
            "每个建议绑定材料、保单条款与证据坐标；缺证据时拒答或转人工。",
          boundary:
            "AI 不决定资格与金额；草稿再流畅也不具备决定效力。",
        },
        {
          name: "授权人工或确定性规则决定",
          en: "Authorized Decision",
          mechanism:
            "规则引擎与授权人员核对资格、责任、金额与付款前置条件，作出最终决定。",
          decision:
            "最终决定 owner 明确，决定依据与复核路径留痕。",
          boundary:
            "模型不参与最终决定；人工点击不能变成无证据的自动放行。",
        },
        {
          name: "写入权威业务系统并通知",
          en: "Commit & Notify",
          mechanism:
            "确定性服务按批准结果写入权威业务系统，并触发客户通知。",
          decision:
            "写入幂等、可回读；失败时先查询再重试并保留证据。",
          boundary:
            "AI 不直接写入赔付状态；接口成功不等于业务终态正确。",
        },
        {
          name: "纠正、申诉、事件与重新评估",
          en: "Redress & Reassessment",
          mechanism:
            "登记客户纠正、申诉与安全事件，触发重新评估与补救路径。",
          decision:
            "申诉与事件由业务 owner 处置，证据链完整保留。",
          boundary:
            "AI 不自动撤销或赔付；重新评估也不覆盖已生效业务动作。",
        },
        {
          name: "模型、供应商或流程退出",
          en: "Exit & Fallback",
          mechanism:
            "演练模型替换、供应商退出、区域故障与人工兜底流程。",
          decision:
            "替代路径通过相同硬门；退出后有对账与补救计划。",
          boundary:
            "退出不改变已生效业务状态，也不能让 AI 在故障时自动接管决定权。",
        },
      ],
    },
  ],
  criticalBoundary:
    "合格的场景解决方案从当前基线走向权威业务结果，并把约束、最小闭环、责任、证据、运营、单位经济和退出连成同一份契约。产品图标、一次 Demo、Token 单价或技术指标都不能单独证明生产可用与 ROI。",
  cloudHooks: [
    {
      stage: "接入与身份（Access & Identity）",
      services: "API Gateway、IAM、OAuth/OIDC、私网接入、密钥管理",
      value: "统一入口、身份传递、流量控制和审计边界。",
      discover: "客户现有渠道、租户模型、身份源、网络区和 API 管理体系是什么？",
    },
    {
      stage: "编排与执行（Orchestration & Execution）",
      services: "Serverless、容器、工作流、消息队列、事件总线、Agent Runtime",
      value: "运行确定性流程和异步任务，并支持弹性执行与失败恢复。",
      discover: "哪些步骤同步完成，哪些可异步；哪些动作需要审批、补偿或人工接管？",
    },
    {
      stage: "模型与数据（Models & Data）",
      services: "模型服务、向量检索、搜索、数据库、对象存储、数据集成",
      value: "把模型能力和企业知识、业务事实及多模态资产连接起来。",
      discover: "数据位于哪里、如何更新、由谁授权，是否要求地域、加密和删除？",
    },
    {
      stage: "工程保障（Engineering Assurance）",
      services: "评估平台、内容安全、DLP、Tracing、日志、监控、FinOps",
      value: "用评估、日志、指标和追踪持续观察质量、风险、成本与可用性。",
      discover: "上线通过条件、零容忍错误、SLA、审计周期和成本责任人分别是什么？",
    },
  ],
  relatedSlugs: [
    "model-landscape",
    "rag",
    "ai-agent",
    "mcp",
    "a2a",
    "multimodal",
    "ai-gateway",
    "evaluation",
    "security",
    "ai-ops",
    "ai-infra-platform",
  ],
  qa: [
    {
      q: "场景解决方案和直接采购模型 API 有什么区别？",
      a: "模型 API 只提供一项能力；场景解决方案还要解决数据、流程、身份、工具、验收、安全和运营责任。",
      depth:
        "例如企业客服不仅需要模型回答，还要连接知识库、识别用户权限、调用工单系统、处理失败与人工升级，并持续评估解决率和风险。售前方案应说明每层由谁负责、如何验收，而不是只展示模型能力。",
      ask: "最终要改变哪个业务指标？哪些系统状态可以证明任务完成？",
      tag: "方案边界",
      basis: "场景架构 + 风险治理",
      evidence: [
        {
          sourceId: "anthropic-effective-agents",
          supports: "支持根据任务复杂度选择简单工作流或 Agent，而不是默认堆叠自治能力。",
        },
        {
          sourceId: "nist-genai-profile",
          supports: "支持从治理、测量和管理角度覆盖生成式 AI 全生命周期风险。",
        },
      ],
    },
    {
      q: "一个 PoC 做到什么程度才值得进入生产试点？",
      a: "PoC 应用代表与边界样本证伪最大技术或数据不确定性，并据此判断是否值得进入 Pilot；它不能提前声称生产就绪。",
      depth:
        "先冻结现状基线以及正常、边界和失败样本，再围绕该不确定性验证关键任务、权限、集成和失败方式。真实负载 P95、规模、恢复、持续责任和完整成本分别登记为 Pilot 或 Production 门，而不是强迫 PoC 一次证明；同时保留模型、数据、Prompt、工具和版本，让失败结果能够停止或改向项目。",
      ask: "谁签署 PoC 决定？它必须消除哪项最大不确定性？哪些非功能和运营门留到 Pilot 与 Production 验证？",
      tag: "PoC 验收",
      basis: "应用评估 + 发布门禁",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持按场景风险设置部署前后评估与 Go/No-Go 决策。",
        },
        {
          sourceId: "opentelemetry-genai-semconv",
          supports: "支持用生成式 AI 语义记录模型调用与 Agent 轨迹，为结果回溯提供基础。",
        },
      ],
    },
    {
      q: "为什么不能按模型 Token 单价直接报价？",
      a: "因为客户购买的是成功完成的业务任务，真实成本还包括多轮调用、工具、检索、并发资源、失败重试、评估安全和人工运营。",
      depth:
        "相同模型在不同上下文长度、轨迹深度和缓存策略下成本差异很大。应以每个成功任务成本为主指标，并给出峰值并发、失败率和人工接管率变化时的成本区间。",
      ask: "日均与峰值任务量、任务长度、成功率目标和人工复核比例是多少？",
      tag: "TCO",
      basis: "任务成本模型 + 可观测数据",
      evidence: [
        {
          sourceId: "opentelemetry-genai-semconv",
          supports: "支持用标准化遥测关联模型、工具调用、时延和使用量。",
        },
        {
          sourceId: "anthropic-effective-agents",
          supports: "支持自治循环会增加成本与复合错误，需要相应控制。",
        },
      ],
    },
    {
      q: "客户有很多想法，应该从哪个场景开始？",
      a: "优先选择价值明确、数据可得、风险可控、结果可验证，并能在有限周期内得到结论的场景。",
      depth:
        "高频不一定等于高价值，技术可行也不一定适合首发。可以按业务价值、数据准备度、集成复杂度、错误可逆性和责任人意愿排序，先做能积累评估集和运营能力的场景。",
      ask: "哪个问题现在有人持续付出成本解决，并且结果能被系统或负责人验证？",
      tag: "场景选择",
      basis: "价值发现 + 风险分级",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持按用途、影响对象与风险上下文进行治理和优先级判断。",
        },
      ],
    },],
  evidenceCards: [
    {
      metric: "场景 × 能力",
      title: "完整方案覆盖模型以外的业务责任",
      finding: "客户场景需要把模型、数据、流程、身份、工具和工程保障组合为可运行系统。",
      boundary: "每一层对应明确需求、owner、验收证据和移除条件。",
      sourceId: "anthropic-effective-agents",
      accent: true,
    },
    {
      metric: "价值 → 运营",
      title: "分阶段设置交付门",
      finding: "价值、技术、非功能和运营问题应分别验证，避免把 Demo 成功直接解释为生产可用。",
      boundary: "阶段划分是交付方法，不是固定项目周期；应根据风险调整。",
      sourceId: "nist-genai-profile",
    },
    {
      metric: "真实数据",
      title: "验收建立在客户样本上",
      finding: "公开 Benchmark 适合初筛，客户 Golden Set 和真实流程才决定场景可用性。",
      boundary: "评估集需要代表高价值、边界和失败样本，不能只选容易问题。",
      sourceId: "ragas",
    },
    {
      metric: "每个成功任务",
      title: "用业务单位计算 TCO",
      finding: "把模型、工具、基础设施、失败重试和人工运营合并，才能比较方案的真实经济性。",
      boundary: "成本结论依赖客户负载和架构，不能把单一 PoC 账单外推为采购承诺。",
      sourceId: "opentelemetry-genai-semconv",
    },
    {
      metric: "权限 + 证据",
      title: "企业搜索不只是聊天问答",
      finding: "搜索与问答链要同时保留资料来源、版本和检索时访问控制，才能支持跨部门使用。",
      boundary: "命中文档和生成引用都不能单独证明答案正确或用户有权读取。",
      sourceId: "nist-zero-trust",
    },
    {
      metric: "建议 → 动作",
      title: "场景自动化深度决定控制强度",
      finding: "从提供信息到修改外部系统状态，身份、审批、审计和恢复应随影响范围增强。",
      boundary: "加入 Agent 不等于业务结果必然更好，自主性收益需要用现有做法对比证明。",
      sourceId: "anthropic-effective-agents",
    },
  ],
};

export const multimodalBrief = {
  slug: "multimodal",
  definition:
    "多模态 AI（Multimodal AI）让图像、文档、语音与视频中的非文本证据，从采集、解析、对齐、推理到业务交付都保持可定位、可验证并可安全降级。",
  position:
    "位于应用模式层，主责模态特有的采集质量、表示、对齐、证据坐标与降级；检索和引用归 RAG，行动授权与业务终态归 Agent 和业务系统，通用数据生命周期、评估方法、安全控制与运行发布分别由相邻模块负责。",
  presentation: "pipeline",
  principleTitle: "业务证据链如何决定模型、管线与降级路线",
  principles: [
    {
      zh: "理解与生成分离",
      en: "Understanding vs Generation",
      explanation:
        "图像问答、文档理解、语音识别属于理解；图像、视频和语音合成属于生成，两者模型、指标、价格和风险不同。",
      decision:
        "分别定义输入、输出、验收指标和治理流程，不以“支持多模态”概括全部能力。",
    },
    {
      zh: "视觉标记化",
      en: "Visual Tokenization",
      explanation:
        "视觉 Transformer（ViT）把图像切成 Patch 并转换为视觉 Token；分辨率、裁剪和 Patch 规模会影响细节、上下文和成本。",
      decision:
        "小字、图表和复杂页面需要针对分辨率与区域切分测试，不能只看普通图片样例。",
    },
    {
      zh: "跨模态语义对齐",
      en: "Cross-modal Alignment",
      explanation:
        "CLIP 等对比学习路线把图像与文本映射到共享语义空间，为跨模态检索、分类和视觉语言模型提供基础。",
      decision:
        "语义相似不等于事实一致；检索、分类和生成需要分别验收。",
    },
    {
      zh: "原生与管线互补",
      en: "Native vs Pipeline",
      explanation:
        "原生模型、专用 OCR/ASR/文档解析与混合路线保留的信息和失败方式不同；路线优劣只能在客户任务、困难切片与端到端成本下比较。",
      decision:
        "先比较专用、原生和混合路线的任务成功、证据坐标、时延、成本与人工复核，再按输入或风险路由。",
    },
    {
      zh: "输入契约与来源定位",
      en: "Input Contract & Provenance",
      explanation:
        "生产系统应保留原始资产、转换过程、编码方式、页码/区域/时间位置和模型输出之间的关系。",
      decision:
        "无法定位到原始页面、图像区域或音视频时间段的输出，不应作为高风险业务证据。",
    },
    {
      zh: "实时交互闭环",
      en: "Real-time Interaction Loop",
      explanation:
        "实时语音不仅是 ASR 和 TTS，还包括端点检测、轮次判断、打断、网络传输、状态同步和失败恢复。",
      decision:
        "按端到端首响、打断成功和任务完成评估体验，而不是只比较单个模型速度。",
    },
    {
      zh: "生成不等于可发布",
      en: "Generation Is Not Publication",
      explanation:
        "技术生成成功、内容审核通过、标识与分发要求满足、业务批准发布与发布后的持续责任是五个不同状态；每个状态都有自己的门禁、证据和责任人。",
      decision:
        "把交付链定义为可安全发布的资产与持续责任，不是一次生成成功。",
    },
    {
      zh: "素材授权与溯源先行",
      en: "Material Authorization & Provenance",
      explanation:
        "输入素材的来源、授权、肖像与品牌权利、版权和合同边界要在生成前确认；生成和编辑记录要保留版本与溯源，以便撤回、更正与事件取证。",
      decision:
        "先确认可用素材与授权边界，再进入生成管线；缺授权的素材不进入商用输出。",
    },
  ],
  decisions: [
    {
      question: "现场巡检为什么不能只把媒体转成一段文字？",
      signal:
        "异常可能只存在于设备外观、铭牌版式、短暂动作、异响或画面与手册的对应关系中，纯文本转写会删除定位和时序。",
      recommendation:
        "先写明必须保留的业务证据与不可接受漏检，再为照片、视频、语音和表单分别定义采集与定位契约。",
      boundary:
        "上传了媒体不等于必须使用一个统一大模型；若文本基线已保留全部必要证据，多模态复杂度可能没有收益。",
    },
    {
      question: "选择原生多模态还是 OCR/ASR 管线？",
      signal:
        "客户困难样本更依赖字符与结构、开放图文关系，还是两者同时存在；结果是否必须回到页码、区域或时间段。",
      recommendation:
        "在同一任务、输入和门槛下比较专用、原生与混合路线，再依据失败类型和风险路由，而不是按任务名称套公式。",
      boundary:
        "论文 Benchmark 只形成候选假设；不能外推为某一路线在所有文档、语言、表格语义和生产成本上更优。",
    },
    {
      question: "什么时候才需要把 RAG 或 Agent 接进来？",
      signal:
        "巡检结论是否需要查手册、历史记录或库存，是否还要创建工单、订零件或改变设备状态。",
      recommendation:
        "只读理解先停在可核验结论；需要外部知识时交给 RAG，需要产生副作用时才接入带独立授权和终态验证的 Agent。",
      boundary:
        "多模态输入本身不要求 Agent、MCP 或 A2A；模型看到故障也不因此获得执行工具的权限。",
    },
    {
      question: "实时语音选择级联还是端到端语音模型？",
      signal:
        "客户更看重可审计、模块可替换和术语控制，还是自然打断、情感和低交互延迟。",
      recommendation:
        "强控制场景优先 ASR→LLM→TTS 级联；自然交互优先端到端语音，并为敏感动作增加结构化确认。",
      boundary:
        "更自然的声音不等于更高任务成功率；电话网络、VAD、工具时延都会影响体验。",
    },
    {
      question: "视频生成可以直接替代内容制作吗？",
      signal:
        "客户是否接受分镜、参考素材、人工审核、后期编辑、授权和内容标识流程。",
      recommendation:
        "定位为素材生产和创意加速能力，采用生成—审核—标识—发布的内容供应链。",
      boundary:
        "生成完成不等于可以发布；人物肖像、品牌、版权和深度合成要求必须单独审查。",
    },
  ],
    deepDiveTitle: "照片、视频、语音和巡检表怎样回到原始坐标",
  deepDiveLead:
    "设备巡检包包含照片区域、铭牌字段、视频时间段、语音片段和表单单元格；每条异常结论保存对应坐标、转换版本、模型结果与降级状态，工程师可以直接回跳核对。",
  deepDives: [
    {
      kind: "sequence",
      eyebrow: "BARGE-IN STATE MACHINE",
      title: "一次语音打断需要保存播放时间、取消信号和上下文版本",
      intro:
        "实时语音 Agent 被用户打断时，错误处理是继续播放过期内容、让旧生成任务继续写状态。正确做法是把打断当作一次需要恢复上下文并丢弃失效输出的状态迁移。",
      items: [
        {
          name: "检测打断",
          en: "Detect Interruption",
          mechanism: "用 VAD 与端点检测识别用户开始说话，并绑定当前播放帧的时间戳。",
          decision: "打断信号是否带因果时间，能区分噪声与真实打断？",
          boundary: "只在模型层判断会把打断语义变成自由猜测。",
        },
        {
          name: "停止播放",
          en: "Stop Playback",
          mechanism: "立即停止当前 TTS 播放，避免新指令被覆盖或产生双通道噪声。",
          decision: "停止后是否还有缓冲内容在音箱侧继续出声？",
          boundary: "停止播放不等于取消生成任务。",
        },
        {
          name: "取消或隔离旧生成",
          en: "Cancel Old Generation",
          mechanism: "取消或隔离旧响应生成，防止其继续消耗预算、写入状态或覆盖新上下文。",
          decision: "取消是尽力而为还是保证生效？哪些资源需要释放？",
          boundary: "已部分写出的外部动作需要幂等与补偿，不能靠取消解决。",
        },
        {
          name: "丢弃失效输出",
          en: "Discard Stale Output",
          mechanism: "到达过晚的旧输出不允许进入播放或上下文，避免新旧指令串扰。",
          decision: "过期输出是否有独立标记，并被下游消费方拒绝？",
          boundary: "只要旧任务还能写状态，就可能污染对话历史。",
        },
        {
          name: "恢复上下文并生成新响应",
          en: "Restore & Respond",
          mechanism: "以用户最新指令与已被确认听到/看到的边界重建上下文，生成新响应并记录取消、延迟与状态证据。",
          decision: "哪些历史片段仍可信？被旧输出覆盖的状态是否回滚？",
          boundary: "恢复的上下文必须与已播放内容一致，否则会前后矛盾。",
        },
      ],
      sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"],
    },
    {
      kind: "sequence",
      eyebrow: "EVIDENCE-PRESERVING PIPELINE",
      title: "让非文本内容形成可回跳的证据链",
      intro:
        "先冻结业务完成条件和不可接受漏检，再沿采集、路由、对齐、交付与降级保留每一步证据。",
      items: [
        {
          name: "定义任务与证据契约",
          en: "Task & Evidence Contract",
          mechanism:
            "把“完成巡检”拆成要识别的状态、允许的推断、必须引用的原始证据和一次失败的业务后果。",
          decision:
            "先用纯文本与人工现状作基线；只有布局、图像、声音或时序信息确实决定任务时才引入对应模态。",
          boundary:
            "模型支持某种输入格式不能证明它保留了任务所需证据。",
        },
        {
          name: "采集与质量门",
          en: "Capture & Quality Gate",
          mechanism:
            "为原始照片、音频、视频和文档登记稳定资产身份、来源、权限、质量与版本，检测模糊、截断、噪声、缺页和格式异常。",
          decision:
            "不满足可处理门槛时要求重拍、重传或人工补录，不让不可读输入静默进入推理。",
          boundary:
            "后续更大的模型不能恢复采集阶段没有记录的像素、声音或页面。",
        },
        {
          name: "按证据路由并对齐",
          en: "Route & Align",
          mechanism:
            "按字符与结构、视觉关系、语音内容和视频时序选择 OCR、ASR、文档解析、关键片段、原生 VLM 或混合路线。",
          decision:
            "在客户困难切片上比较任务成功和信息损失；把对象、区域、文字、说话人与时间窗口显式绑定。",
          boundary:
            "PP-OCRv5 等专用模型的论文结果与原生 VLM 的开放能力都不能替代客户场景验证。",
        },
        {
          name: "形成可核验结论",
          en: "Grounded Conclusion",
          mechanism:
            "每条观察和结论绑定资产、页码、区域、时间段或说话人，并保留原始媒体、转换结果和模型版本之间的关系。",
          decision:
            "需要手册或历史记录时把带坐标的观察交给 RAG；只读结论与创建工单等动作使用不同控制门。",
          boundary:
            "答案有引用不等于关系判断正确，RAG 也不能替代多模态证据定位。",
        },
        {
          name: "降级与责任交接",
          en: "Degrade & Handoff",
          mechanism:
            "不可读、证据冲突、低置信或超预算时返回明确失败原因，转专用解析、重传、人工复核或受控 Agent。",
          decision:
            "Multimodal 交付证据与失真信息；Data Engineering 管资产生命周期，Evaluation 管量尺，Security 管威胁，AI Ops 管运行。",
          boundary:
            "降级不是换一个模型继续猜，也不能扩大原媒体的权限范围。",
        },
      ],
      sourceIds: ["docling-report", "pp-ocrv5-2026", "colpali-2025", "nist-genai-profile"],
    },
    {
      kind: "diagnostic",
      eyebrow: "MULTIMODAL FAILURE SLICES",
      title: "同样是答错，先判断信息在哪一层丢失",
      intro:
        "按媒体特有的失败切片建立诊断集，才能判断应调整输入处理、检索表示、模型还是实时链路。",
      items: [
        {
          name: "小字和表格数值经常错误",
          mechanism:
            "分辨率、裁剪、OCR、阅读顺序或表格结构恢复丢失了字符和单元格关系。",
          decision:
            "抽样比对原图区域与解析结果，比较专业解析、区域放大和页面视觉检索；在云端分别记录解析与模型质量。",
          boundary:
            "提升通用 VLM 规模不一定修复错误的输入像素或表格结构。",
        },
        {
          name: "图片相关，但回答说错关系",
          mechanism:
            "共享向量空间找到了语义相近图片，却没有证明数量、空间位置、流程箭头或因果关系正确。",
          decision:
            "把检索相关性与视觉事实验证分开，针对计数、空间、图表和流程建立独立测试切片。",
          boundary:
            "跨模态相似度不是事实正确率。",
        },
        {
          name: "长视频摘要完整，却漏掉短暂异常",
          mechanism:
            "均匀抽帧、整段压缩或只依赖字幕丢失了关键事件前后的时序与跨模态证据。",
          decision:
            "按镜头和候选事件分段，保留时间窗口、音轨与字幕关联，并在长视频困难集和客户切片上验证遗漏。",
          boundary:
            "帧数更多不保证理解更好，LongVideoBench 也不规定客户生产分段架构。",
        },
        {
          name: "语音首响快，但对话仍然卡顿",
          mechanism:
            "端点检测、网络抖动、工具等待、TTS 排队或打断取消未完成造成端到端体验问题。",
          decision:
            "用统一 Trace 拆分 VAD、ASR、模型、工具、TTS 和传输时延，并测试打断后的任务取消与状态续接。",
          boundary:
            "单个模型首包指标不能代表一轮对话体验。",
        },
        {
          name: "答案正确，却无法给出出处",
          mechanism:
            "转写、Caption 或摘要脱离了页码、坐标和时间戳，生成端只能引用派生文本。",
          decision:
            "为每个派生单元保存原资产引用和空间/时间定位，使用对象存储版本与元数据目录支持回跳。",
          boundary:
            "无法回到原始媒体的正确答案仍不适合作为高风险证据。",
        },
      ],
      sourceIds: ["vit-2021", "clip-2021", "longvideobench-2024", "docling-report", "opentelemetry-semconv", "opentelemetry-genai-semconv"],
      columnLabels: {
        name: "客户症状",
        mechanism: "可能丢失层",
        decision: "诊断与云服务接点",
        boundary: "重要边界",
      },
    },
    {
      kind: "sequence",
      eyebrow: "CONTENT DELIVERY LOOP",
      title: "多模态内容交付闭环：从素材授权到发布后责任",
      intro:
        "把生成、审核、标识、发布、撤回和事件处置连成一条可审计链；每个状态独立验收，不能因为前一步成功就自动获得下一步资格。",
      sourceIds: ["nist-genai-profile", "c2pa-2-4", "china-ai-content-labeling-2026-08-05"],
      items: [
        {
          name: "素材来源与授权",
          en: "Material & Rights",
          mechanism:
            "登记素材来源、版权、肖像、品牌、许可与合同边界，并为原始资产保留稳定身份与版本。",
          decision:
            "缺授权素材不进入生成管线；合同边界由业务与专业人员确认。",
          boundary:
            "平台免责声明或模型卡不能覆盖客户对素材权利与发布用途的责任。",
        },
        {
          name: "生成与版本记录",
          en: "Generate & Version",
          mechanism:
            "记录模型、版本、Prompt、参数、输入素材与输出资产之间的关系，生成编辑历史。",
          decision:
            "每个输出都能回到一次完整生成，并保留中间版本。",
          boundary:
            "生成成功只证明资产产生，不表示内容可发布。",
        },
        {
          name: "自动与人工审核",
          en: "Auto & Human Review",
          mechanism:
            "事实、版权、敏感、冒用与品牌检查；高风险内容由有权限人员复核并留痕。",
          decision:
            "审核通过后才进入标识与分发准备。",
          boundary:
            "自动审核命中率不能替代业务判断，审核通过也不等于已经合规。",
        },
        {
          name: "生成内容标识",
          en: "Content Labeling",
          mechanism:
            "按适用主体与发布渠道完成显式标识、元数据隐式标识与发布侧核验提示。",
          decision:
            "标识与分发要求满足是独立状态，单独验收。",
          boundary:
            "标识满足不等于内容正确或已获业务批准；凭证也可能被移除。",
        },
        {
          name: "发布与分发",
          en: "Publish & Distribute",
          mechanism:
            "明确发布渠道、范围、时限与接收方，由有权限角色执行并记录发布日志。",
          decision:
            "业务批准后发布，发布版本与渠道可追溯。",
          boundary:
            "渠道可用不表示内容正确或责任结束。",
        },
        {
          name: "撤回、更正与申诉",
          en: "Retract & Correct",
          mechanism:
            "定义撤回、更正、覆盖与申诉路径，并保留版本历史与通知记录。",
          decision:
            "错误内容先撤回再更正，必要时通知接收方。",
          boundary:
            "撤回不等于副本、缓存与分发渠道已全部清除。",
        },
        {
          name: "事件处置与证据保留",
          en: "Incident & Evidence",
          mechanism:
            "篡改、冒用、泄露或违规发布事件按证据链处置：保留素材、生成、审核、标识、发布与撤回证据。",
          decision:
            "先停止扩散并撤回，再核对版本与哈希、定位路径并评估影响。",
          boundary:
            "技术取证不自动等于法律结论，证据保留时长按义务与专业意见确认。",
        },
        {
          name: "批量、实时与公开发布差异门",
          en: "Batch / Real-time / Public Gates",
          mechanism:
            "批量生产、实时交互与公开发布对审核、标识、人工介入与撤回的要求不同。",
          decision:
            "按发布面分别定义门禁，不共用一套默认流程。",
          boundary:
            "实时性不能作为跳过审核或标识的理由。",
        },
      ],
    },
  ],
  criticalBoundary:
    "多模态管线分别记录转写、理解、事实核验、内容审核、标识和业务批准状态；任何一个状态都不能替代下一道门。",
  cloudHooks: [
    {
      stage: "媒体接入与解析（Ingestion & Parsing）",
      services: "对象存储、CDN、Document AI、OCR、ASR、媒体转码",
      value: "稳定接收大文件，保留原始资产与派生内容的来源关系。",
      discover: "媒体类型、尺寸、格式、语言、更新频率和保留要求是什么？",
    },
    {
      stage: "模型理解与生成（Inference & Generation）",
      services: "多模态模型 API、图像/视频生成、GPU、推理服务、模型网关",
      value: "按场景选择托管模型或自托管模型，并统一配额、路由和成本。",
      discover: "质量、P95、并发、地域、私网和成本目标是什么？",
    },
    {
      stage: "实时音视频（Real-time Media）",
      services: "WebRTC、SIP、云联络中心、STT/TTS、流式计算",
      value: "承载低延迟双向语音、打断、电话网络与会话状态。",
      discover: "已有电话或会议平台是什么，是否要求打断、录音、转人工和合规告知？",
    },
    {
      stage: "内容治理（Content Governance）",
      services: "内容审核、水印与凭证、DLP、KMS、访问控制、审计存储",
      value: "控制敏感数据、侵权、冒用、提示注入和错误发布风险。",
      discover: "谁有权上传和发布，哪些内容必须人工审核或显式标识？",
    },
    {
      stage: "质量与运营（Quality & Operations）",
      services: "评估平台、Tracing、日志、媒体质量监控、成本分析",
      value: "分别监控解析、模型、网络和业务任务的质量与成本。",
      discover: "失败如何分类，能否定位到页面、区域、时间段和具体模型步骤？",
    },
  ],
  relatedSlugs: [
    "rag",
    "ai-agent",
    "data-engineering",
    "llm-inference",
    "evaluation",
    "security",
    "ai-ops",
  ],
  qa: [
    {
      q: "多模态模型能否直接替代 OCR 和文档解析？",
      a: "不能一概而论。专用、原生和混合路线保留的信息、可审计性与成本不同，必须在客户困难切片上比较。",
      depth:
        "同一批输入分别验证专用解析、原生视觉理解与组合路线的任务成功、结构恢复、证据坐标、严重失败、P95、单位成功成本和人工复核。PP-OCRv5 表明小型专用 OCR 在其测试基准上仍可与多种大参数 VLM 竞争，但不能外推到所有文档、表格语义或生产 TCO；ColPali 等视觉文档路线也只是另一种候选。实际系统可按输入类型和风险路由。",
      ask: "最难输入是哪几类？结果必须回到哪些原始坐标，哪种错误最难发现和修复？",
      tag: "方案选择",
      basis: "客户切片 + 路线比较 + 生产可审计性",
      evidence: [
        {
          sourceId: "pp-ocrv5-2026",
          supports: "支持在论文所测 OCR Benchmark 内，小型专用 OCR 仍可与多种大参数 VLM 竞争；不支持普遍替代结论。",
        },
        {
          sourceId: "docling-report",
          supports: "支持文档处理需要显式恢复版面、阅读顺序和表格结构，并保留可检查中间结果。",
        },
        {
          sourceId: "colpali-2025",
          supports: "支持视觉丰富文档可以直接形成视觉检索表示，作为专用解析之外的候选路线。",
        },
      ],
    },
    {
      q: "为什么多模态输入通常更贵、更慢？",
      a: "图像、文档、音频和视频需要额外编码、解析或大量视觉与时间 Token，且长媒体还会增加存储、网络和预处理成本。",
      depth:
        "成本优化应从裁剪、分辨率、关键帧、去重、缓存和专业预处理开始，而不只是换更小模型。报告应拆开媒体处理、模型推理、网络和人工审核成本。",
      ask: "平均页数、图片数量、音视频时长、并发和可接受处理时限是多少？",
      tag: "成本与性能",
      basis: "视觉标记化 + 端到端成本",
      evidence: [
        {
          sourceId: "vit-2021",
          supports: "支持图像通过 Patch 序列进入 Transformer，说明分辨率与序列规模相关。",
        },
        {
          sourceId: "opentelemetry-genai-semconv",
          supports: "支持用端到端遥测拆分模型和处理链路的时延与用量。",
        },
      ],
    },
    {
      q: "实时语音为什么不能只比较模型首包速度？",
      a: "用户体验由端点检测、网络、模型、工具、语音合成、打断和状态恢复共同决定。",
      depth:
        "应测从用户停止说话到系统开始回应的端到端延迟，并测试用户打断后能否停止播报、取消旧任务和正确续接上下文。涉及查询或交易时，还要把工具执行和人工转接纳入任务成功率。",
      ask: "电话还是 App？是否需要打断、转人工、录音、工具调用和多语言？",
      tag: "实时交互",
      basis: "端到端系统评估",
      evidence: [
        {
          sourceId: "opentelemetry-semconv",
          supports: "支持以 Trace 关联多个处理阶段，而不是只观察单个模型请求。",
        },
        {
          sourceId: "opentelemetry-genai-semconv",
          supports: "支持关联生成式 AI 模型与工具调用的专用遥测属性。",
        },
        {
          sourceId: "nist-genai-profile",
          supports: "支持按实际使用情境持续测量系统性能与风险。",
        },
      ],
    },
    {
      q: "图片或文档里的文字会不会攻击 Agent？",
      a: "会。间接提示注入（Indirect Prompt Injection）可以藏在网页、文档、图片文字、邮件或工具结果中。",
      depth:
        "媒体内容应视为不可信数据，先解析并标记来源，再与系统指令和工具授权隔离。模型看到内容不应自动获得执行权限；高风险动作需要独立策略、参数校验和人工确认。",
      ask: "模型会读取哪些外部媒体，读取后能调用哪些工具或访问哪些数据？",
      tag: "多模态安全",
      basis: "提示注入风险 + 最小权限",
      evidence: [
        {
          sourceId: "owasp-prompt-injection",
          supports: "支持外部内容触发间接提示注入的威胁与分层缓解原则。",
        },
        {
          sourceId: "nist-zero-trust",
          supports: "支持资源访问前持续验证主体和权限，而不信任内容来源。",
        },
      ],
    },],
  evidenceCards: [
    {
      metric: "Patch → Token",
    title: "为视觉内容预留上下文空间",
      finding: "ViT 把图像 Patch 转为序列，说明分辨率和切分策略会同时影响细节、时延和成本。",
      boundary: "这是视觉编码原理，不等于所有商业模型采用完全相同的 Token 计费方式。",
      sourceId: "vit-2021",
      accent: true,
    },
    {
      metric: "图像 ↔ 文本",
      title: "共享语义空间支撑跨模态检索",
      finding: "CLIP 通过对比学习对齐图像与文本表征，可用于检索、分类和视觉语言模型底座。",
      boundary: "语义对齐不能证明图像中的事实、数量和空间关系一定判断正确。",
      sourceId: "clip-2021",
    },
    {
      metric: "5M 专用模型 ↔ 大参数 VLM",
      title: "专用模型仍可能是有效候选",
      finding: "PP-OCRv5 在论文所测 OCR Benchmark 上以约 5M 参数与多种大参数 VLM 竞争，说明路线不能只按模型规模判断。",
      boundary: "结论只适用于论文任务和快照，不证明其在所有语言、版式、表格语义、时延和生产成本上更优。",
      sourceId: "pp-ocrv5-2026",
    },
    {
      metric: "长视频 ≠ 多张图片",
      title: "时序证据需要独立验证",
      finding: "LongVideoBench 用细粒度、交错的视频—语言证据检验长视频理解，暴露了检索与跨时间推理问题。",
      boundary: "Benchmark 不规定客户应怎样分段，也不支持“输入帧数越多越好”。",
      sourceId: "longvideobench-2024",
    },
    {
      metric: "媒体即输入",
      title: "多模态内容同样可能包含恶意指令",
      finding: "网页、文档和图片文字可形成间接提示注入，不能因其不是纯文本输入而默认可信。",
      boundary: "输入检测不能单独消除风险，工具权限和动作控制仍需在模型外执行。",
      sourceId: "owasp-prompt-injection",
    },
    {
      metric: "声明 ≠ 事实",
      title: "内容凭证验证的是声明与绑定",
      finding: "C2PA 签名清单验证内容与来源声明的绑定和防篡改，不证明内容真实、版权成立或已经合规。",
      boundary: "凭证可能被移除；标识与凭证满足是分发层状态，不是业务批准。",
      sourceId: "c2pa-2-4",
    },
  ],
};

export const mcpBrief = {
  slug: "mcp",
  definition:
    "模型上下文协议（Model Context Protocol, MCP）规定 Host 中的 Client 如何发现一个 Server，并以 Tool、Resource 和 Prompt 交换调用或上下文。它统一协议消息，现有 API、身份、授权和业务事务继续作为执行依据。",
  position:
    "位于协议与互操作层，连接 AI 应用或 Agent 与工具、资源和提示模板；现有 API、身份、安全和网关体系继续负责业务执行与控制。",
  presentation: "stack",
  principleTitle: "一条 tools/call 请求怎样找到 Server、取得授权并留下执行证据",
  principles: [
    {
      zh: "主机、客户端与服务端",
      en: "Host, Client & Server",
      explanation:
        "Host 管理用户体验、权限和多个连接；在当前正式版 2026-07-28 中，Client 以自包含请求和一个 Server 交换能力；只有兼容 2025-11-25 等旧版时才使用协议会话；Server 暴露受控能力。",
      decision:
        "架构图标出持有身份、呈现确认、执行策略和记录审计的具体组件，并让每条调用日志都能回到这些责任主体。",
    },
    {
      zh: "三类服务端原语",
      en: "Tools, Resources & Prompts",
      explanation:
        "Tools 是模型控制的可调用操作，Resources 是应用控制的可寻址上下文，Prompts 是用户控制的可选择模板；Tool 可以只读，三类原语都可能承载敏感或不可信内容。",
      decision:
        "按控制主体选择原语，并在能力清单中另列数据范围、敏感性、副作用、授权、幂等与审计字段。",
    },
    {
      zh: "能力协商与生命周期",
      en: "Capability Negotiation & Lifecycle",
      explanation:
        "当前正式版 2026-07-28 已删除 initialize/initialized 与 Mcp-Session-Id；每个请求必须携带 protocolVersion 与 clientCapabilities，Client 还应通过 clientInfo 自报软件名称与版本等元数据，Server 必须实现 server/discover。Client 可用它预取能力；同时兼容新旧协议的 stdio Client 应先用它探测对端是否支持当前协议。clientInfo 不是认证身份；锁定 2025-11-25 的实现仍走初始化握手与协议会话。",
      decision:
        "兼容矩阵至少保存一条 2026-07-28 自包含请求和一条 2025-11-25 initialize 轨迹，并覆盖能力缺失、调用失败、取消、断线与降级。",
    },
    {
      zh: "传输决定信任边界",
      en: "Transport Defines Trust Boundary",
      explanation:
        "stdio 常用于本机受控子进程；Streamable HTTP 面向远程服务，会引入网络、身份、租户和回调风险。",
      decision:
        "本地转远程的上线单应包含新的威胁模型、认证授权、租户隔离、限流和审计方案。",
    },
    {
      zh: "MCP 与函数调用互补",
      en: "MCP + Function Calling",
      explanation:
        "Function Calling 定义模型如何表达一次工具选择和参数；MCP 统一工具如何被发现、描述与调用。",
      decision:
        "单应用、少量稳定工具使用直接函数调用；出现多个客户端或工具提供方时，用重复适配数量和运营成本决定是否引入 MCP。",
    },
    {
      zh: "无状态不等于无交互",
      en: "Stateless, Not Interaction-free",
      explanation:
        "2026-07-28 的请求自包含，但一次业务交互仍可通过 Multi Round-Trip Requests 补参；当前仅受支持的 tools/call 可通过 Tasks 扩展持久执行；符合条件的 complete 结果可使用带作用域的缓存提示。",
      decision:
        "分别设计补参轮次与 requestState、Task 句柄、private 缓存隔离和业务状态；不要用一个隐式会话混合承担这些责任。",
    },
  ],
  decisions: [
    {
      question: "现有系统是否真的需要 MCP？",
      signal:
        "同一工具要服务多个 AI 客户端，或同一客户端需要接入多个独立工具提供方，并且发现与调用接口正在重复建设。",
      recommendation:
        "在已有 API 上增加薄 MCP 适配层，先标准化高价值、边界清楚的能力。",
      boundary:
        "单一应用连接少量固定 API 时，直接函数调用可能更简单。",
    },
    {
      question: "应该重写服务还是包装现有 API？",
      signal:
        "现有 API 已具备稳定业务语义、授权、幂等和审计，只缺少 MCP 发现与调用接口。",
      recommendation:
        "优先薄适配，保留原 API 作为业务事实源；只有底层接口本身不稳定时才同步重构。",
      boundary:
        "MCP Server 不应复制业务规则或绕过原系统授权。",
    },
    {
      question: "能力应建成 Tool、Resource 还是 Prompt？",
      signal:
        "能力由模型调用、由应用选择并装配为上下文，还是由用户主动选择模板；读写与副作用另行分类。",
      recommendation:
        "模型控制的可调用操作用 Tool，应用控制的 URI 上下文用 Resource，用户控制的模板用 Prompt；Tool 既可以只读也可以写入。",
      boundary:
        "原语名称不能替代敏感性、副作用、授权、幂等和业务风险分级。",
    },
    {
      question: "远程 MCP 如何进入生产？",
      signal:
        "已有明确的服务身份、用户授权、租户隔离、工具风险分级、配额、版本和审计要求。",
      recommendation:
        "通过网关集中执行认证、授权、Allowlist、限流、版本控制、日志和异常隔离。",
      boundary:
        "能在 Registry 中发现，或能被客户端成功连接，都不代表 Server 已通过企业安全审查。",
    },
    {
      question: "使用 stdio 还是 Streamable HTTP？",
      signal:
        "Server 是本地开发工具或受控桌面进程，还是跨主机、多人、多租户的共享服务。",
      recommendation:
        "本地进程优先 stdio；远程共享服务使用 HTTP，并接入企业 OAuth、API Gateway、限流和审计。",
      boundary:
        "stdio 不等于无风险，HTTP 也不自动具备认证；安全取决于完整部署边界。",
    },
    {
      question: "如何从 2025-11-25 迁移到 2026-07-28 正式版？",
      signal:
        "团队准备把锁定 2025-11-25 的实现直接切换到 2026-07-28，或把正式规范发布等同于所用 SDK、Client、Server 与网关已经兼容。",
      recommendation:
        "建立双版本兼容矩阵，记录 2026-07-28 请求头与 _meta、2025-11-25 initialize 与 Mcp-Session-Id、Tasks 扩展、授权、SDK 模式、网关结果和回滚条件。",
      boundary:
        "正式规范已经发布，但不证明具体 SDK、Client、Server、网关或私有扩展已经兼容。",
    },
    {
      question: "什么时候不该上 MCP？",
      signal:
        "单一应用直连少量固定 API、没有跨客户端复用需求、安全边界简单、团队没有 Server 运维与升级能力。",
      recommendation:
        "使用直接函数调用或 API 网关，并把重复适配次数、Server 运维成本和治理收益写入选型记录；收益达到团队约定阈值时再评估 MCP。",
      boundary:
        "选型总成本应计入协议版本、授权、排错、Server 运营和供应链管理。",
    },
  ],
  deepDiveTitle: "远程 MCP 调用的主体、协议版本、授权和执行记录",
  deepDiveLead:
    "最小运行包包括 Server 端点与发布者、协议版本、Tool Schema、调用身份、授权决策、执行终态和 Trace。它既用于核算复用收益，也用于追查一次发现、授权或执行落到了哪个主体、资源和版本。",
  deepDives: [
    {
      kind: "sequence",
      eyebrow: "REMOTE MCP TRUST CHAIN",
      title: "远程 Tool 调用穿过哪些信任边界",
      intro:
        "模型表达调用意图；目录、身份服务、策略引擎、业务 API 和审计系统分别验证服务、主体、参数、资源与执行结果。",
      items: [
        {
          name: "发现并验证 Server",
          en: "Discovery & Verification",
          mechanism:
            "Host 获得 Server 地址与能力信息，并核验发布者、域名、版本、传输和允许接入的环境。",
          decision:
            "使用私有目录、DNS、证书、签名资产和准入工作流；第三方目录只作为发现线索。",
          boundary:
            "能解析端点或读取工具描述不等于服务可信。",
        },
        {
          name: "用双版本契约测试固定协议路径",
          en: "Version Before Capability",
          mechanism:
            "2026-07-28 的每个请求必须携带 protocolVersion 与 clientCapabilities，Client 还应通过 clientInfo 自报软件名称与版本等元数据；Server 必须实现 server/discover。Client 可用它预取能力，同时兼容新旧协议的 stdio Client 应先用它探测当前协议支持；clientInfo 不提供认证身份。2025-11-25 等旧版通过 initialize/initialized 与 Mcp-Session-Id 建立协议会话。",
          decision:
            "为两条协议路径各保留请求轨迹和契约测试；网关记录协议、SDK 模式、Server、扩展与 Tool Schema 版本。",
          boundary:
            "2026-07-28 已是正式规范，但客户端不能据此假设具体实现已支持，也不能根据上一次请求无限期假设能力不变。",
        },
        {
          name: "建立用户或工作负载授权",
          en: "Authorization Context",
          mechanism:
            "远程调用需要将调用主体、受众、Scope、租户和授权时效绑定到受保护资源。",
          decision:
            "接入企业 OAuth/OIDC、工作负载身份和短期凭据；由 Host 呈现同意，由资源服务校验访问。",
          boundary:
            "模型声称代表用户，或 Host 能连接 Server，都不构成资源授权。",
        },
        {
          name: "策略检查后执行",
          en: "Policy-bound Execution",
          mechanism:
            "模型提出 Tool 和参数，应用根据风险、身份、资源和业务规则执行 Allowlist、Schema 校验、审批和限流。",
          decision:
            "API Gateway、策略引擎、WAF 和业务 API 共同控制动作；高影响请求先生成预览再确认。",
          boundary:
            "Tool Schema 约束格式，不证明参数有权执行或业务语义正确。",
        },
        {
          name: "验证结果并关联审计",
          en: "Result Validation & Audit",
          mechanism:
            "工具结果可能包含错误、敏感数据或间接提示注入，必须记录执行终态、过滤后再进入模型上下文。",
          decision:
            "关联 Trace、工具版本、调用身份、策略决策和下游资源日志，并将异常发送到 SIEM。",
          boundary:
            "HTTP 成功和结构合法都不等于业务动作成功或返回内容可信。",
        },
      ],
      sourceIds: ["mcp-architecture", "mcp-lifecycle-2025-11-25", "mcp-specification-2026-07-28", "mcp-changelog-2026-07-28", "mcp-authorization", "mcp-security", "nist-zero-trust"],
    },
    {
      kind: "matrix",
      eyebrow: "PRIMITIVE CONTROL MODEL",
      title: "三类原语按控制主体区分，读写风险另行分级",
      intro:
        "原语清单记录谁决定何时使用；风险清单记录它能看到什么、改变什么、由谁批准。两份记录用同一个能力 ID 关联。",
      items: [
        {
          name: "Tool · 模型控制",
          en: "Model-controlled",
          mechanism:
            "模型可以请求执行已声明的操作，包括查询数据库、调用 API 或计算；Tool 不等于写操作。",
          decision:
            "为每个 Tool 声明输入输出、数据范围、只读或写入、副作用、身份、审批、幂等和后置条件。",
          boundary:
            "模型选择 Tool、参数通过 Schema 或 Tool 标注为只读，都不构成业务授权。",
        },
        {
          name: "Resource · 应用控制",
          en: "Application-driven",
          mechanism:
            "Server 以 URI 暴露文件、Schema、记录或其他上下文，由 Host 应用决定发现、选择和放入模型上下文。",
          decision:
            "定义可见性、订阅、缓存、版本、ACL 与上下文装配责任。",
          boundary:
            "Resource 通常用于上下文，但仍可能包含敏感、过期或带恶意指令的数据。",
        },
        {
          name: "Prompt · 用户控制",
          en: "User-controlled",
          mechanism:
            "Server 编写可复用模板，用户决定何时选择，并可提供参数形成消息。",
          decision:
            "明确发布者、适用任务、参数、版本、展示方式和用户同意。",
          boundary:
            "用户主动选择不代表模板内容可信，也不替代后续 Tool 的授权和结果验证。",
        },
      ],
      sourceIds: ["mcp-tools-2026-07-28", "mcp-resources-2026-07-28", "mcp-prompts-2026-07-28"],
      columnLabels: {
        name: "原语与控制主体",
        mechanism: "规范机制",
        decision: "生产设计",
        boundary: "不能推导",
      },
    },
    {
      kind: "matrix",
      eyebrow: "DEPLOYMENT TRUST MODES",
      title: "部署形态决定 MCP Server 的信任与运营成本",
      intro:
        "部署位置、用户数量、工具影响和运营主体共同决定网关、安全与审计投入；stdio 或 HTTP 只是其中一个字段。",
      items: [
        {
          name: "本机开发工具",
          en: "Local Developer Tool",
          mechanism:
            "Host 启动受控进程，通过 stdio 交换消息，主要风险来自本地文件、命令执行和依赖供应链。",
          decision:
            "使用沙箱、目录白名单、最小文件权限、进程隔离和锁定依赖；适合单用户开发能力。",
          boundary:
            "本机运行不会自动限制进程可以读取或执行什么。",
        },
        {
          name: "企业内部共享服务",
          en: "Internal Shared Service",
          mechanism:
            "多个用户和应用通过远程端点复用工具，身份、租户、配额和版本成为共享控制面。",
          decision:
            "通过私网、API Gateway、企业身份、细粒度 Scope、限流和集中审计运行。",
          boundary:
            "内网位置不能替代逐请求授权。",
        },
        {
          name: "第三方 SaaS Server",
          en: "External SaaS Server",
          mechanism:
            "服务由外部组织运营，工具描述、数据处理、版本和可用性不在客户直接控制范围。",
          decision:
            "完成供应商评估、数据边界、版本固定、出站网关和最小 Tool Allowlist，再逐项批准。",
          boundary:
            "协议兼容不等于供应商满足数据、地域和事件响应要求。",
        },
        {
          name: "高影响业务工具",
          en: "High-impact Tool",
          mechanism:
            "Tool 可付款、删除、发布、修改生产或访问受监管数据，错误会形成真实且可能不可逆的状态。",
          decision:
            "使用强身份、短期授权、参数约束、双人审批、幂等与补偿，并将执行证据写入不可变审计。",
          boundary:
            "高影响能力不应因采用 MCP 而降低原业务系统的授权和审批标准。",
        },
      ],
      sourceIds: ["mcp-authorization", "mcp-security", "owasp-prompt-injection"],
      columnLabels: {
        name: "部署形态",
        mechanism: "主要信任边界",
        decision: "云服务与治理路线",
        boundary: "不能忽略",
      },
    },
    {
      kind: "matrix",
      eyebrow: "STATELESS INTERACTION MODEL",
      title: "无状态请求不等于无交互、无缓存或无业务状态",
      intro:
        "2026-07-28 把请求间隐式协议会话拆开，让补参、耐久执行、缓存和业务状态各自拥有显式契约。生产设计要逐层说明状态由谁签发、保存、隔离和失效。",
      items: [
        {
          name: "自包含请求与业务状态",
          en: "Self-contained Request",
          mechanism:
            "每个请求必须携带 protocolVersion 与 clientCapabilities，Client 还应通过 clientInfo 自报软件名称与版本等元数据；clientInfo 不是认证身份。订单、案件或工作流状态仍由应用与权威业务系统用显式句柄维护。",
          decision:
            "把 protocol request、Run、MCP Task 与业务 operation ID 分开记录，并在每次请求重新建立当前身份、版本和能力上下文。",
          boundary:
            "删除协议 Session 不会删除应用状态，也不允许 Server 依赖未声明的上一次请求上下文。",
        },
        {
          name: "Multi Round-Trip Requests 补参",
          en: "MRTR Input",
          mechanism:
            "prompts/get、resources/read 与 tools/call 可返回 input_required；inputRequests 与不透明 requestState 各自可选，但每个 InputRequiredResult 至少必须包含其中一项。Client 以新的 JSON-RPC id 重试原操作，只对收到的 inputRequests 提交相应 inputResponses；仅在收到 requestState 时原样回传，未收到时不得自行添加。",
          decision:
            "限制补参轮数和有效期；若存在 requestState，则校验、封存并绑定原用户与操作；同时重新鉴权与验证输入，需要耐久轮询时另用 Tasks。",
          boundary:
            "MRTR 不是协议会话，也不是让 Server 借补参扩大原始权限或无限循环；Form / 带内补参不得收集密码、令牌等敏感凭据，确需敏感交互时应使用在 MCP Client 外完成的 URL mode。",
        },
        {
          name: "列表缓存与租户隔离",
          en: "Scoped List Cache",
          mechanism:
            "server/discover、tools/list、prompts/list、resources/list、resources/templates/list 与 resources/read 的 resultType: \"complete\" 结果必须携带 ttlMs 和 public / private cacheScope。resultType: \"input_required\" 中间结果不携带缓存提示且不得缓存；含 inputResponses 或 requestState 的 MRTR 重试也不得缓存。",
          decision:
            "private 缓存键至少绑定授权上下文（如不同 access token）、主体、租户、Scope、Server、协议与能力版本；敏感变更通过更短 TTL、失效通知或禁用缓存处理。",
          boundary:
            "TTL 是新鲜度提示，不是一致性、撤权传播或跨租户安全保证；public 也不等于可信。",
        },
        {
          name: "HTTP 镜像头与网关路由",
          en: "HTTP Routing Metadata",
          mechanism:
            "Streamable HTTP 中，每个承载 JSON-RPC request 的 Client POST 都必须用 Mcp-Method 镜像请求方法；本修订未规定 notification POST 的该头要求，且核心协议不定义 Streamable HTTP 上的 Client→Server notification。核心协议的 Mcp-Name 镜像 tools/call 与 prompts/get 的 params.name，或 resources/read 的 params.uri；Tasks 扩展还要求 tasks/get、tasks/update 与 tasks/cancel 用它镜像 params.taskId。",
          decision:
            "网关校验镜像头与正文一致，再按主体、Server、方法、能力名、租户和风险执行授权、限流与审计。",
          boundary:
            "路由头只是可验证的元数据，不是身份、权限或业务策略；头与正文不一致时必须拒绝。",
        },
      ],
      sourceIds: ["mcp-specification-2026-07-28", "mcp-mrtr-2026-07-28", "mcp-list-cache-2026-07-28", "mcp-http-routing-2026-07-28", "mcp-tasks-extension", "nist-zero-trust"],
      columnLabels: {
        name: "状态面",
        mechanism: "规范机制",
        decision: "生产契约",
        boundary: "不能推导",
      },
    },
  ],
  criticalBoundary:
    "MCP 覆盖发现与调用的协议消息。服务准入、主体授权、参数策略、资源校验和安全保证由 Host、网关与业务系统执行。",
  cloudHooks: [
    {
      stage: "服务运行（Server Runtime）",
      services: "Serverless、容器、托管 MCP Runtime、服务网格",
      value: "把 MCP Server 作为可弹性伸缩、可隔离和可发布的服务运行。",
      discover: "Server 是本地、单租户还是共享远程服务，是否有长连接和状态要求？",
    },
    {
      stage: "身份与网关（Identity & Gateway）",
      services: "OAuth/OIDC、IAM、API Gateway、WAF、密钥与证书管理",
      value: "统一认证、细粒度授权、限流、版本、网络策略和审计。",
      discover: "调用以用户身份还是工作负载身份执行，Scope 和租户如何传递？",
    },
    {
      stage: "API 与数据适配（API & Data Adapters）",
      services: "API 管理、数据库、对象存储、搜索、企业 SaaS 连接器",
      value: "复用现有业务 API 和数据控制面，避免 MCP Server 复制业务逻辑。",
      discover: "哪些现有接口已具备稳定 Schema、授权、幂等和审计？",
    },
    {
      stage: "运营与安全（Operations & Security）",
      services: "Tracing、日志、SIEM、策略引擎、漏洞管理、私有目录",
      value: "观察每次发现与调用，控制工具版本、异常行为和供应链风险。",
      discover: "谁批准工具上架，如何处理描述变化、撤销、漏洞和调用争议？",
    },
  ],
  relatedSlugs: ["ai-agent", "a2a", "ai-gateway", "security", "ai-ops"],
  qa: [
    {
      q: "已经有 Function Calling，为什么还需要 MCP？",
      a: "Function Calling 解决模型如何提出一次调用；MCP 解决不同客户端如何统一发现、描述和调用由不同 Server 提供的能力。",
      depth:
        "一个应用连接几个固定工具时，直接函数调用足够。随着客户端、工具和团队增加，MCP 可以复用协议适配，但底层 API、身份和业务规则仍然存在。是否采用取决于重复集成成本，而不是市场热度。",
      ask: "有多少 AI 客户端、工具提供方和重复适配？工具是否需要跨团队复用？",
      tag: "协议边界",
      basis: "MCP 架构 + 工具调用机制",
      evidence: [
        {
          sourceId: "mcp-architecture",
          supports: "支持 Host、Client、Server 的分工，以及 MCP 对上下文交换与能力发现的标准化。",
        },
        {
          sourceId: "openai-function-calling",
          supports: "支持函数调用以工具 Schema 表达模型可选择的动作和参数。",
        },
      ],
    },
    {
      q: "MCP Server 能否直接使用现有用户权限？",
      a: "只有建立明确授权链后才可以。Server 必须知道主体、受众、Scope、租户和授权时效，不能仅凭模型声称代用户执行。",
      depth:
        "远程 MCP 应使用 OAuth/OIDC 等机制获得短期、限域凭据，并由资源服务再次校验。Host 负责呈现授权和高风险确认，Server 负责执行资源级授权；模型不应看到长期凭证。",
      ask: "用户身份怎样传到 Server，资源端如何验证 Scope 和租户？",
      tag: "身份授权",
      basis: "MCP 授权规范 + 零信任",
      evidence: [
        {
          sourceId: "mcp-authorization",
          supports: "支持远程 MCP 的授权角色、受保护资源元数据和 OAuth 相关流程。",
        },
        {
          sourceId: "nist-zero-trust",
          supports: "支持资源访问前验证主体、设备和授权，不提供隐式信任。",
        },
      ],
    },
    {
      q: "接入公共 MCP Server 是否等于接入普通 SaaS API？",
      a: "不等于。除了 API 风险，还要评估工具描述影响模型选择、能力变化、返回内容注入和自动执行范围。",
      depth:
        "应核验发布者、代码与部署来源，固定版本和允许的 Tool，监控描述变化，并限制输出进入高权限上下文。高风险调用需要预览或确认，公共目录只能作为发现线索。",
      ask: "谁批准外部 Server，版本如何固定，工具描述变化时如何复核？",
      tag: "供应链安全",
      basis: "MCP 威胁模型",
      evidence: [
        {
          sourceId: "mcp-tools-2026-07-28",
          supports: "支持 Tool annotations 在 Server 未受信时必须视为不可信，并要求 Host 保留人类拒绝调用的能力。",
        },
        {
          sourceId: "mcp-security",
          supports: "支持 MCP 部署中的令牌、混淆代理、本地 Server 与权限风险需要额外控制。",
        },
        {
          sourceId: "owasp-prompt-injection",
          supports: "支持外部工具返回内容可形成间接提示注入。",
        },
      ],
    },
    {
      q: "MCP 会不会造成新的平台锁定？",
      a: "协议可以降低接口层锁定，但运行时、身份、网关、扩展能力和业务数据模型仍可能形成平台差异。",
      depth:
        "应把核心业务 API 与 MCP 适配层分离，使用标准原语和传输，避免依赖未经验证的私有扩展；同时测试 Server 在多个兼容客户端上的行为。",
      ask: "哪些能力属于标准协议，哪些依赖特定平台的托管扩展？",
      tag: "选型与锁定",
      basis: "协议互操作边界",
      evidence: [
        {
          sourceId: "mcp-architecture",
          supports: "支持以标准 Host、Client、Server 和协议消息实现互操作。",
        },
      ],
    },
    {
      q: "MCP 2026-07-28 已成为正式规范，生产系统应该立即切换吗？",
      a: "把 2026-07-28 作为目标协议，把切换作为一次破坏性版本迁移。生产日期由 SDK、Client、Server、网关和扩展的兼容测试决定。",
      depth:
        "迁移测试分别保存现代自包含请求和旧版 initialize/initialized、Mcp-Session-Id 轨迹，并覆盖 server/discover、Tasks 扩展、授权、并行兼容、灰度与回滚。规范层已经生效；产品层兼容由这些测试结果证明。",
      ask: "当前实现固定了哪个协议版本？哪些 SDK、Server、网关和自建扩展会受破坏性变化影响？",
      tag: "契约版本",
      basis: "当前正式版 + 旧版迁移边界",
      evidence: [
        {
          sourceId: "mcp-lifecycle-2025-11-25",
          supports: "支持历史版本 2025-11-25 的初始化、协议版本与能力协商机制，用于旧实现迁移对照。",
        },
        {
          sourceId: "mcp-specification-2026-07-28",
          supports: "支持 2026-07-28 已成为当前正式规范及无状态、自包含请求和可选扩展的规范基线；不证明具体产品已经兼容。",
        },
        {
          sourceId: "mcp-changelog-2026-07-28",
          supports: "支持 initialize 与协议级 Session 的移除、逐请求元数据、server/discover 及 Tasks 移至扩展等破坏性变化。",
        },
        {
          sourceId: "mcp-tasks-extension",
          supports: "支持当前 Tasks 扩展仅让 tools/call 返回 CreateTaskResult，并定义耐久句柄、状态获取、更新、取消与恢复语义，以及三个 Task 方法用 Mcp-Name 镜像 params.taskId 的 HTTP 路由要求。",
        },
      ],
      addedAt: "2026-07-21",
    },
    {
      q: "MCP 2026-07-28 已经无状态，工具执行中还需要用户补充信息怎么办？",
      a: "使用 Multi Round-Trip Requests：prompts/get、resources/read 与 tools/call 可返回 input_required；inputRequests 与不透明 requestState 各自可选，但每个 InputRequiredResult 至少必须包含其中一项。Client 用新的 JSON-RPC id 重试原操作，对收到的 inputRequests 提交相应 inputResponses；仅在收到 requestState 时原样回传，未收到时不得自行添加。需要跨时段耐久执行时再采用 Tasks 扩展。",
      depth:
        "Host 应限制补参轮数、时间和字段，在可信界面向用户显示是哪一个 Server 请求信息，并拒绝通过 Form / 带内补参收集密码或令牌；确需敏感交互时使用在 MCP Client 外完成的 URL mode。若存在 requestState，实现应将它绑定到原用户、操作和上下文，双方都不能把它当成授权。MRTR、Tasks、列表缓存和业务状态是四套不同契约：无状态只取消隐式协议会话，不表示一次交互不能跨轮，也不表示 Server 可以隐式记住一切。",
      ask: "补参由谁展示和验证，存在 requestState 时多久失效，何时转成 Task，重新调用时怎样复核授权？",
      tag: "长任务",
      basis: "2026-07-28 MRTR + Tasks 边界",
      evidence: [
        {
          sourceId: "mcp-mrtr-2026-07-28",
          supports: "支持 prompts/get、resources/read 与 tools/call 的 input_required、各自可选但至少存在一项的 inputRequests / requestState、新 JSON-RPC id，以及只针对收到的 inputRequests 提交 inputResponses 并在收到时原样回传 requestState 的多轮补参模式。",
        },
        {
          sourceId: "mcp-tasks-extension",
          supports: "支持当前仅由 tools/call 通过独立 Tasks 扩展返回 CreateTaskResult，再使用耐久句柄、轮询、更新、恢复或取消。",
        },
      ],
      addedAt: "2026-09-04",
    },
  ],
  evidenceCards: [
    {
      metric: "Host–Client–Server",
      title: "三层角色拆分连接责任",
      finding: "MCP 用 Host 管理体验和策略、Client 与一个 Server 交换协议消息、Server 提供能力。",
      boundary: "具体产品可以合并进程，但逻辑责任仍需清楚。",
      sourceId: "mcp-architecture",
      accent: true,
    },
    {
      metric: "Tool / Resource / Prompt",
      title: "原语对应不同控制主体",
      finding: "Tool 由模型控制调用，Resource 由应用选择装配，Prompt 由用户主动选择；Tool 也可以是只读查询。",
      boundary: "控制主体不等于风险等级；三类原语都要独立处理敏感性、权限与不可信内容。",
      sourceId: "mcp-server-overview-2026-07-28",
    },
    {
      metric: "2025-11-25 → 2026-07-28",
      title: "双版本测试保留两套协议证据",
      finding: "2026-07-28 是当前正式规范，采用自包含请求且没有 initialize/initialized 与 Mcp-Session-Id；这些握手和会话机制只出现在锁定旧版的实现与迁移对照中。",
      boundary: "正式规范发布不等于生态兼容；SDK、Client、Server、网关和私有扩展仍需逐项验证。",
      sourceId: "mcp-changelog-2026-07-28",
    },
    {
      metric: "连接成功 / 服务准入",
      title: "协议成功与安全准入是两项检查",
      finding: "工具描述、外部内容、凭据和自动执行范围仍可能造成投毒与越权。",
      boundary: "网关、身份、Allowlist、审批与审计负责协议之外的服务准入与执行控制。",
      sourceId: "mcp-security",
    },
    {
      metric: "stdio ↔ HTTP",
      title: "传输变化会改变威胁模型",
      finding: "本地进程和远程共享服务面对不同的身份、网络、租户和运营风险。",
      boundary: "任何传输都需要与部署环境匹配的安全控制。",
      sourceId: "mcp-authorization",
    },
    {
      metric: "input_required → inputResponses",
      title: "无状态请求仍可显式请求补参",
      finding: "MRTR 的 InputRequiredResult 至少携带 inputRequests 或 requestState 之一，再用新的请求重试原操作；Server 提供 requestState 时原样回传。它不恢复旧式协议 Session，耐久工作另由 Tasks 处理。",
      boundary: "requestState 不是授权或业务真值；若存在，仍需绑定原用户与操作，并配合轮数限制、字段校验、重新鉴权和敏感信息保护。",
      sourceId: "mcp-mrtr-2026-07-28",
    },
  ],
};

export const a2aBrief = {
  slug: "a2a",
  definition:
    "智能体间协议（Agent2Agent Protocol, A2A）用 Agent Card 发布能力；一次 Send Message 调用可直接返回 Message，也可创建带服务端 ID 的 Task，并以状态事件和可选 Artifact 交付结果。",
  position:
    "位于协议与互操作层，处理独立 Agent 的水平协作；本地编排、消息队列和业务工作流继续维护内部执行，工具与数据接入通常由 MCP 或 API 负责。",
  presentation: "loop",
  principleTitle: "一次跨团队委派留下 Agent Card、Task 状态事件和 Artifact 验收记录",
  principles: [
    {
      zh: "能力发现",
      en: "Agent Card & Discovery",
      explanation:
        "Agent Card 描述身份、地址、技能、输入输出和安全要求，让调用方在委派前判断能力与接入方式。",
      decision:
        "准入记录保存 Card 来源、域名、签名、有效期和验证结果；自声明技能只进入候选能力清单。",
    },
    {
      zh: "有状态任务",
      en: "Stateful Task",
      explanation:
        "需要跟踪、等待或恢复时，服务端创建 Task 并维护明确状态；即时、自包含交互可以直接返回 Message，不必强制建 Task。",
      decision:
        "客户端契约测试覆盖 Message 与 Task 两种响应；Task 日志保存 Task ID、八个非 UNSPECIFIED 操作状态、取消、重试和超时事件。",
    },
    {
      zh: "消息与产物分离",
      en: "Messages, Parts & Artifacts",
      explanation:
        "Message 表达即时响应或任务交互，Part 承载内容，Artifact 是 Task 的可选输出；关键状态和任务结果不能只依赖可能未持久保存的 Message。",
      decision:
        "对大型文件使用受控对象引用，并由接收方验证媒体类型、完整性、安全与业务接受条件。",
    },
    {
      zh: "多种结果交付",
      en: "Blocking, Polling, Streaming & Push",
      explanation:
        "直接 Message、Task 轮询、订阅、流式和 Push 对应不同响应节奏与客户端在线条件；交付通道不等于权威任务状态。",
      decision:
        "按是否需要状态跟踪、任务时长、网络边界和客户端在线能力选择，并为回调设置验证、认证和幂等。",
    },
    {
      zh: "不透明协作边界",
      en: "Opaque Collaboration Boundary",
      explanation:
        "Agent 可以只暴露能力、输入、状态和产物，不必共享内部 Prompt、工具和推理过程。",
      decision:
        "跨组织审计包记录契约、身份、状态和产物验收；提供方在自己的信任域保存内部执行证据。",
    },
  ],
  decisions: [
    {
      question: "这项委派是否跨越部署、所有权或信任域？",
      signal:
        "任务交给独立部署、独立所有者、不同框架或不同云上的专业 Agent。",
      recommendation:
        "跨系统边界采用 A2A 的稳定任务契约；同一应用内共享状态和发布周期的子任务保留在本地编排。",
      boundary:
        "把一个应用人为拆成多个 Agent 不会自动提高质量，只会增加交接与评估成本。",
    },
    {
      question: "A2A 与内部编排框架如何分工？",
      signal:
        "内部节点是否共享状态、代码仓库和信任域，还是由不同服务或组织独立运营。",
      recommendation:
        "信任域内使用框架管理细粒度状态；跨边界通过 A2A 暴露稳定任务契约。",
      boundary:
        "A2A 不替代 LangGraph 等内部运行时，也不要求暴露内部节点。",
    },
    {
      question: "任务应同步返回还是异步交付？",
      signal:
        "交互能否一次自包含完成，还是需要跟踪进度、等待人或外部系统，以及客户端能否维持连接。",
      recommendation:
        "即时结果可直接返回 Message；需要跟踪才创建 Task，再按连接条件选择阻塞、轮询、订阅、流式或受控 Push。",
      boundary:
        "Task 与 Artifact 都不是每次交互的必经对象；Push 还需要地址验证、认证、幂等和限流。",
    },
    {
      question: "跨组织 Agent 如何建立信任？",
      signal:
        "已有可验证 Agent 身份、调用主体、租户、Skill Scope、数据分类和任务审计要求。",
      recommendation:
        "验证 Agent Card，使用 OAuth2 或 mTLS，把授权限制到具体操作、租户和任务。",
      boundary:
        "发现某个 Agent 只证明找到服务，不证明调用方有权委派或接收其产物。",
    },
    {
      question: "大文件和敏感产物怎样传递？",
      signal:
        "Artifact 包含大文件、受监管数据、跨区域数据或需要长期留存的输出。",
      recommendation:
        "通过受控对象存储传递短期访问地址、校验值和元数据，独立执行访问与保留策略。",
      boundary:
        "A2A 消息不是数据治理绕行通道，底层存储权限和地域要求仍然有效。",
    },
  ],
  deepDiveTitle: "把跨 Agent 协作设计成可恢复的分布式任务",
  deepDiveLead:
    "最小运行包包含 Agent Card 快照、调用身份、Task ID、TaskState 时间线、幂等键、可选 Artifact 校验值和业务验收记录。即时 Message 路径也要保留身份、输入和响应证据。",
  deepDives: [
    {
      kind: "sequence",
      eyebrow: "TASK LIFECYCLE",
      title: "Message 直接响应与 Task 状态化委派的两条运行轨迹",
      intro:
        "远端对即时交互返回 Message，对需要跟踪的工作创建 Task。Task 存储保存状态、授权和恢复语义，网络连接只负责传递更新。",
      items: [
        {
          name: "发送 Message 并选择响应对象",
          en: "Send Message & Choose Response",
          mechanism:
            "调用方依据已验证的 Agent Card 发送 Message；远端对即时交互直接返回 Message，对需跟踪工作创建服务端 taskId。客户端提供的 taskId 只能引用既有且可访问的 Task，不能创建新 Task；仅给 taskId 时，Agent 必须从 Task 推断 contextId，同时给出两者时必须匹配。",
          decision:
            "契约测试覆盖 Message 与 Task 两条路径，以及 TaskNotFoundError、taskId / contextId 不匹配拒绝和仅给 taskId 的推断路径；对非终态 Task，订阅首帧应取得当前 Task 快照。SubscribeToTask 请求没有恢复游标或历史重放；Task 已处于终态时必须返回 UnsupportedOperationError，客户端改用 GetTask。ListTasks 的 pageToken / cursor 只用于列表分页，不能恢复订阅。需要断点重放时由自有事件存储或显式扩展承担。",
          boundary:
            "接收请求不等于接受无限范围目标；Task 的持久化方案是实现责任，不是协议指定数据库。",
        },
        {
          name: "执行并发布进度",
          en: "Work & Progress",
          mechanism:
            "Agent 在内部执行，外部只看到标准状态、消息和必要进度；流式输出不替代任务持久状态。",
          decision:
            "使用工作流、队列和 Trace 记录重试、内部超时和中间产物，并限制外部可见信息。",
          boundary:
            "内部思考过程不是跨组织审计所必需的证据。",
        },
        {
          name: "等待输入或授权",
          en: "Input / Auth Required",
          mechanism:
            "任务可能因缺少业务信息、用户确认或新授权而暂停，而不是继续猜测或直接失败。",
          decision:
            "将等待原因、允许输入和超时策略结构化，通过审批工作流或身份服务恢复同一 Task。",
          boundary:
            "补充信息不能被用来静默扩大原始授权范围。",
        },
        {
          name: "进入可判定终态",
          en: "Terminal State",
          mechanism:
            "规范共有九个 TaskState 枚举；TASK_STATE_UNSPECIFIED 只表示未知，另外八个操作状态为 TASK_STATE_SUBMITTED、TASK_STATE_WORKING、TASK_STATE_INPUT_REQUIRED、TASK_STATE_AUTH_REQUIRED、TASK_STATE_COMPLETED、TASK_STATE_FAILED、TASK_STATE_CANCELED 与 TASK_STATE_REJECTED。",
          decision:
            "中断态恢复原 Task；终态不可改写或恢复。修订工作发送不带旧 taskId 的新 Message，可保留 contextId 并通过 referenceTaskIds 引用旧 Task；SendMessage 仍可能返回 Message 或 Task，只有返回 Task 时才由服务端生成新的 taskId。重复业务动作仍使用独立业务幂等键。",
          boundary:
            "网络超时不能直接被解释为任务失败，也不能盲目重复执行高影响动作。",
        },
        {
          name: "交付并验收 Artifact",
          en: "Deliver & Verify Artifact",
          mechanism:
            "Task 可以没有 Artifact；有产物时，客户端按媒体类型、来源、安全、访问和业务条件独立验收。",
          decision:
            "大文件使用受控对象引用；跨 Task 版本谱系和接受或拒绝记录由客户端与业务应用管理。",
          boundary:
            "Task completed 只表示提供方结束执行，不自动证明产物满足调用方业务标准。",
        },
      ],
      sourceIds: ["a2a-concepts", "a2a-specification", "opentelemetry-semconv", "opentelemetry-genai-semconv"],
    },
    {
      kind: "scenario",
      eyebrow: "COLLABORATION TOPOLOGIES",
      title: "什么时候用本地编排，什么时候建立 A2A 边界",
      intro:
        "选型记录比较所有权、部署、信任域和生命周期；Agent 数量只描述拓扑，不决定协议。",
      items: [
        {
          name: "同一应用内的专业节点",
          en: "One Runtime",
          mechanism:
            "节点共享代码、状态存储、发布周期和安全边界，协作失败由同一团队处理。",
          decision:
            "继续使用本地工作流或 Agent 框架，统一部署在容器或托管运行时。",
          boundary:
            "为内部节点强行增加网络协议会扩大延迟、故障和测试面。",
        },
        {
          name: "跨部门专业服务",
          en: "Cross-team Service",
          mechanism:
            "提供方独立升级并对专业能力负责，调用方只应依赖稳定任务契约和产物。",
          decision:
            "用私有 Agent 目录、A2A Task、企业身份和跨服务 Trace 建立边界，并约定 SLO 与升级兼容。",
          boundary:
            "共享企业身份不代表部门间数据可以无条件流动。",
        },
        {
          name: "跨组织或跨云委派",
          en: "Cross-organization",
          mechanism:
            "双方拥有不同身份、数据、网络、审计和事件响应体系，产物可能跨地域交付。",
          decision:
            "使用网关、OAuth2/mTLS、数据分类、对象存储交换区和合同化任务边界；限制 Skill 与 Artifact 范围。",
          boundary:
            "可互操作不等于双方已经建立法律、数据和运营信任。",
        },
        {
          name: "人机共同完成的长任务",
          en: "Human-in-the-loop",
          mechanism:
            "任务在自动执行与人工补充、批准、修订之间切换，处理时间可能跨越会话和工作日。",
          decision:
            "使用持久工作流、审批队列、通知、任务超时和审计；人工决定应成为结构化状态变化。",
          boundary:
            "人工介入不是异常兜底，而是部分高风险任务的正常协议路径。",
        },
      ],
      sourceIds: ["a2a-concepts", "a2a-specification", "anthropic-effective-agents"],
      maxColumns: 2,
    },
  ],
  criticalBoundary:
    "A2A 的协议终态描述远端执行状态，MCP 描述应用与工具或数据的调用。调用方仍需验证身份与授权，并把技术 COMPLETED、产物校验和业务验收记录为三个独立事件。",
  cloudHooks: [
    {
      stage: "Agent 运行与目录（Runtime & Directory）",
      services: "托管 Agent Runtime、容器、服务发现、私有目录、DNS",
      value: "运行独立 Agent，并向获准调用方发布稳定能力入口。",
      discover: "Agent 分属哪些团队、云和信任域，目录是公开还是私有？",
    },
    {
      stage: "任务与消息（Tasks & Messaging）",
      services: "任务存储、数据库、消息队列、事件总线、工作流",
      value: "保存任务状态，支持长任务、重试、取消、回调和故障恢复。",
      discover: "任务最长多久，是否等待人工，终态、重试和补偿规则是什么？",
    },
    {
      stage: "身份与边界（Identity & Boundary）",
      services: "API Gateway、OAuth/OIDC、mTLS、IAM、WAF、策略引擎",
      value: "验证 Agent 与调用者身份，限制 Skill、租户、操作和流量。",
      discover: "谁有权委派哪个任务，跨组织和跨租户身份如何映射？",
    },
    {
      stage: "产物与可观测（Artifacts & Observability）",
      services: "对象存储、KMS、Tracing、日志、审计、成本监控",
      value: "安全交付大文件，并把跨 Agent 状态、调用链、错误和成本关联起来。",
      discover: "产物如何加密、保留和删除，哪个 Trace 能关联多个 Agent 的同一任务？",
    },
  ],
  relatedSlugs: ["ai-agent", "mcp", "ai-gateway", "security", "ai-ops"],
  qa: [
    {
      q: "A2A 和 MCP 到底有什么区别？",
      a: "A2A 面向客户端与独立远端 Agent 的 Message 或 Task 协作；MCP 面向 AI 应用与工具、资源和提示模板的连接。",
      depth:
        "一个理赔受理 Agent 可通过 A2A 向跨区域专业 Agent 获取即时 Message，或委派一个有状态 Task；专业 Agent 再通过 MCP 调用知识与工具。A2A Task 是核心跨 Agent 对象；当前 MCP Tasks 是仅支持 tools/call 的可选耐久执行扩展，两类 ID、状态、取消和业务终态只能显式映射。",
      ask: "对方是能独立接任务并交付产物的 Agent，还是一个数据库/API 工具？",
      tag: "协议边界",
      basis: "A2A 概念模型 + MCP 架构",
      evidence: [
        {
          sourceId: "a2a-mcp-boundary",
          supports: "支持 A2A 面向独立 Agent 协作、MCP 面向工具与资源连接的互补边界。",
        },
        {
          sourceId: "mcp-tasks-extension",
          supports: "支持当前 MCP Tasks 是需显式采用且仅覆盖 tools/call 的耐久执行扩展，与 A2A 的跨 Agent Task 语义不同。",
        },
      ],
    },
    {
      q: "已经使用多 Agent 框架，还需要 A2A 吗？",
      a: "只有需要跨系统或跨信任域协作时才需要。单个系统内部共享状态和代码的 Agent，继续使用本地框架更直接。",
      depth:
        "A2A 的价值是稳定外部契约和异步任务边界，而不是替换内部状态机。可以让一个内部编排系统整体作为 A2A Agent 暴露，内部节点不必逐一对外。",
      ask: "协作方是否独立部署、独立升级、独立授权或由不同组织负责？",
      tag: "架构选择",
      basis: "协议边界 + 内部编排",
      evidence: [
        {
          sourceId: "a2a-specification",
          supports: "支持 A2A 通过外部协议契约交换任务、消息和产物。",
        },
        {
          sourceId: "anthropic-effective-agents",
          supports: "支持在单个应用内按任务复杂度选择编排模式。",
        },
      ],
    },
    {
      q: "长任务如何避免断线后丢失？",
      a: "需要跟踪的工作应由远端返回 Task；实现必须让客户端可通过 Task ID 恢复查询，并且只在 Task 仍为非终态时恢复订阅，而不是把网络连接或 Message 当作唯一状态。",
      depth:
        "实现应保存八个非 UNSPECIFIED 操作状态（正式枚举均以 TASK_STATE_ 开头），并在流式中断后通过 Task ID 调用 GetTask 回读当前状态。仅当 Task 仍为非终态时才调用 SubscribeToTask；其首帧是当前 Task 快照，但请求没有恢复游标或历史重放。Task 已处于终态时，SubscribeToTask 必须返回 UnsupportedOperationError，客户端继续使用 GetTask。ListTasks 的 pageToken / cursor 只用于列表分页。对于每个已配置 webhook，Agent 必须至少尝试一次 Push；失败后可以重试，也可以在连续失败达到配置数量后停止，因此不保证至少一次成功送达，重试还可能产生重复通知。Agent Card 未声明 pushNotifications 或值为 false 时，Push 配置操作必须返回 PushNotificationNotSupportedError。需要重放、幂等处理或重试次数保证时必须另建事件存储或产品契约。",
      ask: "任务状态存在哪里，断线、重复回调和服务重启后如何恢复？",
      tag: "可靠性",
      basis: "A2A Task 模型",
      evidence: [
        {
          sourceId: "a2a-concepts",
          supports: "支持 Task 作为有状态工作单元并具有明确生命周期。",
        },
        {
          sourceId: "a2a-specification",
          supports: "支持同步、流式和异步任务交互及对应状态语义。",
        },
      ],
    },
    {
      q: "A2A Agent 不公开内部工具和 Prompt，怎么审计？",
      a: "跨系统审计记录身份、任务契约、状态变化、输入输出、策略决策和 Artifact 验收；完整内部思维链不属于跨组织协议契约。",
      depth:
        "调用方记录谁在何时委派了什么、依据哪个 Agent Card、使用何种授权、收到哪些状态和产物；提供方记录内部执行与策略。双方用 Task ID 和 Trace Context 关联，敏感内部实现仍可隔离。",
      ask: "争议发生时，双方共同证明哪些事实，各自保留哪些内部执行证据？",
      tag: "审计与可观测",
      basis: "任务契约 + 分布式追踪",
      evidence: [
        {
          sourceId: "a2a-specification",
          supports: "支持通过标准任务、消息和产物交换跨 Agent 状态。",
        },
        {
          sourceId: "opentelemetry-semconv",
          supports: "支持使用 Trace Context 和统一遥测关联跨服务调用。",
        },
        {
          sourceId: "opentelemetry-genai-semconv",
          supports: "支持关联 Agent 运行与工具调用的专用遥测属性；跨组织任务审计字段仍需双方定义。",
        },
      ],
    },
    {
      q: "contextId、taskId、messageId、referenceTaskIds 和业务单号分别负责什么？",
      a: "messageId 标识一条消息，taskId 标识服务端跟踪的工作，contextId 归组相关交互，referenceTaskIds 显式引用旧任务；taskId 由服务端生成，客户端只能引用既有且可访问的 Task。未提供 contextId 时，Agent 可以生成，生成后必须在返回的 Task 或 Message 中带回；客户端提供时，Agent 可以接受并保留。业务单号仍由权威业务系统生成并负责交易语义。",
      depth:
        "客户端提供的 taskId 必须引用既有且可访问的 Task，不能用于创建新 Task；否则 Agent 返回 TaskNotFoundError。仅给 taskId 时，Agent 必须从 Task 推断 contextId；同时给出 taskId 与 contextId 时必须匹配，否则拒绝 Message。Agent 自行生成 contextId 后必须在返回的 Task 或 Message 中带回，客户端应将服务端生成值视为不透明标识。终态 Task 不能改写或恢复。需要修订时，发送不带旧 taskId 的新 Message，可保留 contextId 并通过 referenceTaskIds 引用旧 Task；SendMessage 仍可能返回 Message 或 Task，只有返回 Task 时服务端才生成新 taskId。Agent 若拒绝客户端提供的 contextId，必须报错而不能静默替换；客户端除非理解其语义，否则不应主动提供。客户端保存新旧对象、业务单号、A2A / MCP / Run ID 和验收事件的映射。任何协议 ID 都不自动继承权限，也不能独自证明业务完成。",
      ask: "每类 ID 由谁生成或接受，哪些非法组合必须失败，终态后如何用新 Message 保留谱系，哪个业务 ID 能回读权威结果？",
      tag: "可靠性",
      basis: "A2A 标识与任务生命周期",
      evidence: [
        {
          sourceId: "a2a-specification",
          supports: "支持 Message、Task、Context 与 referenceTaskIds 的标识职责、仅服务端创建 Task、无效或不可访问 taskId 的 TaskNotFoundError、contextId 推断与不匹配拒绝，以及终态后发送不带旧 taskId 的新 Message。",
        },
      ],
      addedAt: "2026-09-04",
    },
    {
      q: "SendMessage 超时后，可以带同一个 messageId 直接重发吗？",
      a: "不能默认直接重发。服务端只可能基于 messageId 提供去重；规范没有给 SendMessage exactly-once 保证，超时后必须先判断远端是否已创建 Task 或产生业务副作用。",
      depth:
        "读取类操作可以退避重试；SendMessage 结果未知时，先用 context、Task 或业务 operation ID 查询，再依据双方明确的去重窗口和业务幂等契约重发。CancelTask 虽是幂等操作，对已清理 Task 的请求也可能返回 TaskNotFoundError。对于每个已配置 webhook，Agent 必须至少尝试一次 Push，但失败后可重试或在连续失败达到配置数量后停止，因此没有至少一次成功送达保证；接收方应以自有投递键或双方契约幂等处理可能的重复通知。Agent Card 未声明 pushNotifications 或值为 false 时，Push 配置操作必须返回 PushNotificationNotSupportedError。",
      ask: "服务端是否明确实现 messageId 去重，保留多久，超时后用什么 ID 查询 Task 和业务副作用？",
      tag: "故障恢复",
      basis: "A2A 操作幂等与未知结果",
      evidence: [
        {
          sourceId: "a2a-specification",
          supports: "支持不同 RPC 的幂等等级、SendMessage 的可选 messageId 去重、每个已配置 webhook 的 Push 尝试、重复交付、缺失 Push 能力时的错误和取消边界。",
        },
      ],
      addedAt: "2026-09-04",
    },
    {
      q: "Agent Card 声明的 Extension 和 Extended Agent Card 是同一件事吗？",
      a: "不是。Extended Agent Card 是认证后返回的选择性能力信息披露；Extension 是用稳定 URI 标识、在 Card 中声明并由客户端逐请求启用的协议扩展。",
      depth:
        "调用方先验证公开 Card 的来源、域名和可选签名，再完成请求身份与授权，按需取得 Extended Card；若使用 Extension，还要核验版本化 URI、required、配置、安全、URI 演进和降级，并通过 A2A-Extensions 明确激活。Extension 没有独立 version 字段，破坏性变化必须使用新 URI。不支持的可选 Extension 请求可以忽略；若请求的是不支持的可选版本，Agent 应忽略本次激活，且不得自动回退到另一版本。只有 Server 要求使用 Card 中标为 required 的 Extension、而 Client 未在请求中声明支持时，Agent 才必须返回 ExtensionSupportRequiredError。Extension 不得改变核心数据结构或给核心枚举加值；两者都不自动证明能力质量或业务授权。",
      ask: "当前拿到的是公开还是认证后的 Card，请求和启用了哪些 Extension URI，不支持的可选版本是否被忽略且未回退，缺少 required Extension 支持时是否返回指定错误？",
      tag: "发现信任",
      basis: "A2A 认证发现 + 扩展协商",
      evidence: [
        {
          sourceId: "a2a-agent-discovery",
          supports: "支持公开 Agent Card、认证后的 Extended Agent Card 与发现信任链的区分。",
        },
        {
          sourceId: "a2a-extensions",
          supports: "支持 Extension 的 URI 声明、逐请求激活、不支持的可选版本被忽略且不得回退，以及 required Extension 应以适当错误拒绝的边界。",
        },
        {
          sourceId: "a2a-specification",
          supports: "以能力校验的规范性条款定义缺少 required Extension 支持时必须返回 ExtensionSupportRequiredError。",
        },
      ],
      addedAt: "2026-09-04",
    },
  ],
  evidenceCards: [
    {
      metric: "Card → Message | Task → Artifact?",
      title: "发现之后有两条响应路径",
      finding: "Agent Card 描述候选能力；远端可直接返回 Message，或创建 Task 并按需形成 Artifact。",
      boundary: "Artifact 不是必选项，能力自声明、协议终态和产物交付也都不构成业务验收。",
      sourceId: "a2a-concepts",
      accent: true,
    },
    {
      metric: "同步 ↔ 异步",
      title: "交付方式匹配任务时长",
      finding: "Blocking、Polling、Streaming 与 Push 支持不同在线状态和结果节奏。",
      boundary: "异步能力需要持久任务状态、幂等和恢复机制配合。",
      sourceId: "a2a-specification",
    },
    {
      metric: "Agent ↔ Agent",
      title: "A2A 与 MCP 的方向不同",
      finding: "A2A 负责独立 Agent 间协作，MCP 负责应用与工具、资源之间的互操作。",
      boundary: "一个系统可能同时使用两者，但不能共用一套授权假设。",
      sourceId: "a2a-mcp-boundary",
    },
    {
      metric: "Task ID + Trace Context",
      title: "任务审计围绕契约与状态事件",
      finding: "身份、Task、状态、Message 和 Artifact 形成跨组织可核对的协作记录；内部执行证据由提供方留存。",
      boundary: "协议审计范围不免除提供方的内部质量与安全责任。",
      sourceId: "a2a-concepts",
    },
    {
      metric: "messageId ≠ exactly-once",
      title: "未知写结果要先查状态再决定重试",
      finding: "SendMessage 可由服务端选择基于 messageId 去重；SubscribeToTask 只适用于非终态 Task，请求没有恢复游标或历史重放，终态 Task 应通过 GetTask 查询；ListTasks 分页游标不能恢复订阅。对于每个已配置 webhook，Push 必须至少尝试一次，但失败后可停止，重试还可能产生重复通知；缺少 Push 能力时配置操作返回 PushNotificationNotSupportedError。",
      boundary: "协议级标识不能替代业务幂等、权威状态查询、自有事件存储和补偿。",
      sourceId: "a2a-specification",
    },
  ],
};

export const evaluationBrief = {
  slug: "evaluation",
  definition:
    "评估（Evaluation）把一个版本化被测系统、代表性任务与切片、有效评分器、重复试验、基线和决策规则绑定起来，为选型、发布、诊断与持续运营提供可解释证据。",
  position:
    "位于质量与风险决策层，横跨模型、Prompt、RAG、Agent、微调和应用；它负责定义量尺、测量与发布建议，AI Ops 负责执行流水线、灰度、监控、停止和回滚，Governance 负责风险接受与例外批准。",
  presentation: "loop",
  principleTitle: "一份评估契约应固定哪些变量，结果会触发什么动作",
  principles: [
    {
      zh: "明确决策与目标量",
      en: "Decision & Estimand First",
      explanation:
        "同一组结果可以回答“这份固定考卷表现如何”，也可能被误读为“相似任务总体表现如何”；初筛、验收、发布和诊断需要不同证据。",
      decision:
        "评估契约列出要支持的决定、被测对象、目标人群、基线、目标量，以及 Pass、Fail、Uncertain 各自触发的动作。",
    },
    {
      zh: "对象与生命周期二维分层",
      en: "Object × Lifecycle",
      explanation:
        "对象轴区分模型、检索、工具、应用和业务终态；证据生命周期轴区分 Benchmark 初筛、离线验收和部署后监测。受保护放量是 AI Ops 消费评估契约的发布执行，不另造一类评估证据。",
      decision:
        "局部指标用于归因，端到端终态用于验收；不同阶段证据不能互相替代。",
    },
    {
      zh: "评分器按可验证性分工",
      en: "Code, Judge & Human",
      explanation:
        "确定性字段、权限和业务后置条件优先代码验证；开放语义使用校准后的 Judge；人工负责量表、争议、高影响样本和最终裁决。",
      decision:
        "评分器本身也要固定版本、验证偏差并声明适用范围，不能让模型自证成为业务真值。",
    },
    {
      zh: "考卷分工与污染控制",
      en: "Development, Regression & Holdout",
      explanation:
        "开发集帮助迭代，冻结回归集保护既有能力，盲留出集检查泛化；每条样本要保留来源、裁决、切片和适用期。",
      decision:
        "线上失败经脱敏、去重和业务裁决后进入下一版回归集，不能直接污染盲留出集。",
    },
    {
      zh: "重复试验与硬门",
      en: "Uncertainty & Hard Gates",
      explanation:
        "模型和 Judge 都可能波动；总体均值还会掩盖少数语言、长输入、高风险任务和严重单次失败。",
      decision:
        "固定可控变量，重复运行并报告分布、不确定性和关键切片；不可补偿错误独立阻断。",
    },
    {
      zh: "证据闭环而非自动真值",
      en: "Adjudicated Feedback Loop",
      explanation:
        "离线评估提供可重复比较，生产信号暴露新分布和交互失败；投诉、点赞、模型自评和 Trace 本身都不是权威标签。",
      decision:
        "Evaluation 定义可接受终态与抽样裁决，AI Ops 采集和执行，确认后的失败再升级评估资产。",
    },
  ],
  decisions: [
    {
      question: "这次到底在评估什么？",
      signal:
        "候选版本是否同时改变模型、Prompt、检索、工具、策略、运行环境或评分器，最终由哪个系统状态证明任务完成。",
      recommendation:
        "把完整候选元组、基线、任务环境、预算、终态和不可接受行为写入评估契约。",
      boundary:
        "只记录模型名称无法解释应用结果；一次演示也不能代表稳定版本。",
    },
    {
      question: "公开 Benchmark 能否决定模型选型？",
      signal:
        "Benchmark 的任务、语言、提示、工具环境和客户真实工作是否相似，结果要描述固定题集还是外推相似任务。",
      recommendation:
        "用相关 Benchmark 缩小候选并记录其版本与假设，再在同一客户任务、环境和门槛下比较候选。",
      boundary:
        "榜单名次和固定 Benchmark Accuracy 不构成客户场景表现、业务价值或 Generalized Accuracy 承诺。",
    },
    {
      question: "Benchmark 应该怎样分层使用？",
      signal:
        "存在知识问答、推理、编码、检索、Agent 与多模态等多类候选基准，但客户任务与它们重叠程度不同。",
      recommendation:
        "把基准当 Atlas 分层使用：先按任务类型选相关基准缩小候选，再用客户数据评估集做终审；基准版本与当前领先分数单独进入动态事实记录或不下结论。",
      boundary:
        "基准测的是受限题集与环境，不能证明生产结论；模型榜单不能替代客户任务验收。",
    },
    {
      question: "没有历史标注数据怎样开始？",
      signal:
        "存在领域专家、真实日志、SOP、历史工单或可验证业务状态。",
      recommendation:
        "由专家定义少量高价值与边界样本，再从日志抽样和合成扩展；所有合成样本都需人工筛选。",
      boundary:
        "合成问题可以补覆盖，不能替代真实分布和真实失败。",
    },
    {
      question: "该用规则、Judge 还是人工？",
      signal:
        "输出是否有 Schema、事实字段或可执行测试，质量是否主观，错误风险是否需要责任人裁决。",
      recommendation:
        "Schema、权限和业务状态用代码；相关性、完整性和风格用校准后的 Judge；高风险与争议由人工。",
      boundary:
        "Judge 给出高分不等于事实正确，也不能为越权动作免责。",
    },
    {
      question: "什么样的结果可以发布？",
      signal:
        "候选与当前版本在同等条件下完成了重复试验，关键切片、硬风险、时延、成本和不确定性都有解释。",
      recommendation:
        "先执行不可补偿硬门，再形成 Go、Hold、No-Go 或有限放量的测量建议，并把未决失败交给责任 Owner。",
      boundary:
        "Evaluation 提供发布建议，不自行批准风险例外，也不执行灰度和回滚。",
    },
    {
      question: "上线后还需要离线评估吗？",
      signal:
        "数据、用户、模型、知识库或工具会持续变化，线上反馈又受选择偏差和延迟影响。",
      recommendation:
        "保留开发集、冻结回归集和盲留出集；由 AI Ops 采集线上证据，经过脱敏、去重和裁决后版本化升级回归集。",
      boundary:
        "部署后监测仍是方法不完全成熟的独立领域；低投诉、点赞率或自动评分不能证明系统持续有效。",
    },
  ],
    deepDiveTitle: "版本元组、样本切片与 Go、Hold、No-Go",
  deepDiveLead:
    "一次可复查的评估保存完整版本元组、样本与切片、评分器版本、逐次试验分布、硬门结果和决定记录。任何变化都能落到具体任务、风险切片或量尺上。",
  deepDives: [
    {
      kind: "matrix",
      eyebrow: "BENCHMARK ATLAS",
      title: "每类基准测什么、不能证明什么",
      intro:
        "把基准当作能力地图而不是排行榜：先知道它测量什么、适合哪轮筛选，再决定能否外推到客户任务。",
      columnLabels: { name: "基准类别", mechanism: "测量对象", decision: "适合的用法", boundary: "不能证明" },
      items: [
        {
          name: "通用知识问答",
          mechanism: "静态知识、事实回忆与多选能力，覆盖广但容易饱和和污染。",
          decision: "用于候选初筛与知识基线比较，不用于客户任务终审。",
          boundary: "高分不代表检索、权限、时效与业务事实正确。",
        },
        {
          name: "推理与数学",
          mechanism: "符号、逻辑与多步推理，反映思考链与预算调参空间。",
          decision: "用于判断推理模型是否值得按任务启用思考预算。",
          boundary: "单点成绩不反映延迟成本；overthinking 会降低收益。",
        },
        {
          name: "编码",
          mechanism: "仓库级任务、测试通过率与工具使用，如 SWE-bench 与 Terminal-Bench。",
          decision: "用于 Agentic Coding 场景的候选筛选，配合客户代码库评估。",
          boundary: "公开集成绩不能证明私有代码库、权限与发布流程下的表现。",
        },
        {
          name: "检索与 RAG",
          mechanism: "召回、重排、上下文相关性与忠实度，如 BEIR 与 RAGAS 类指标。",
          decision: "用于定位检索层或生成层问题，配合客户文档集复测。",
          boundary: "公开检索基准不能代表企业权限、更新与多模态混合文档。",
        },
        {
          name: "Agent 与工具",
          mechanism: "多步规划、工具调用、状态恢复与安全边界，如 WebArena 与 Harness Bench。",
          decision: "用于 Agent 能力初筛，配合场景测试集验收轨迹与终态。",
          boundary: "评测环境的工具契约与生产工具契约不同，不能直接外推上线风险。",
        },
        {
          name: "多模态",
          mechanism: "视觉、语音与长视频理解，如 LongVideoBench 等时序与感知任务。",
          decision: "用于多模态输入质量与降级策略的候选判断。",
          boundary: "理解分不代表生成、审核、标识与发布链路达标。",
        },
      ],
      sourceIds: ["swe-bench", "terminal-bench", "beir-2021", "webarena-2024", "harness-bench-2026", "longvideobench-2024", "openai-eval-best-practices"],
    },
    {
      kind: "diagnostic",
      eyebrow: "SCORE CHANGE DIAGNOSTICS",
      title: "总分变化的两条排查线：系统版本与评分量尺",
      intro:
        "模型、数据、流量和评分器都会漂移；只看聚合分数容易把评估问题误当成模型问题。",
      items: [
        {
          name: "总分上升，关键任务反而退化",
          mechanism:
            "容易样本占比增加或平均分掩盖高风险切片，关键场景退化没有触发硬门。",
          decision:
            "按任务、风险、语言、租户和数据源分层报告，并为零容忍错误设置独立阻断规则。",
          boundary:
            "总体平均分不能抵消越权、错误执行或关键事实错误。",
        },
        {
          name: "同一输出，Judge 分数变化",
          mechanism:
            "Judge 模型、Rubric、Prompt、采样配置或服务版本变化导致量尺漂移。",
          decision:
            "固定 Judge 版本与配置，使用人工标注校准集监控一致性，并保存评分理由和原始输入。",
          boundary:
            "更强或更新的 Judge 不自动与业务专家更一致。",
        },
        {
          name: "离线稳定，线上投诉增加",
          mechanism:
            "真实问题分布、知识新鲜度、工具状态、权限或负载已变化，冻结集没有覆盖新失败。",
          decision:
            "从脱敏 Trace 按失败和流量切片采样，将确认后的新案例加入回归集并补线上告警。",
          boundary:
            "点赞、投诉和人工接管具有选择偏差，不能单独作为 ground truth。",
        },
        {
          name: "结果相同，时延与成本恶化",
          mechanism:
            "路由、上下文、检索宽度、工具重试或模型服务改变，质量分没有覆盖资源效率。",
          decision:
            "关联 Trace、Token、工具次数、P95 和每个成功任务成本，并设置质量与效率联合门。",
          boundary:
            "低平均成本不能掩盖峰值超时和失败重试。",
        },
        {
          name: "测试集持续变好，真实泛化不变",
          mechanism:
            "团队反复针对已知评估集优化，产生测试集过拟合或污染。",
          decision:
            "保留独立留出集、盲测和轮换样本，并记录每次修复针对的案例与预期泛化范围。",
          boundary:
            "评估集是控制资产，不应同时充当无限公开的开发提示。",
        },
      ],
      sourceIds: ["nist-ai-800-3", "nist-genai-profile", "nist-ai-800-4"],
      columnLabels: {
        name: "异常现象",
        mechanism: "可能原因",
        decision: "验证与处理",
        boundary: "不能误读",
      },
    },
    {
      kind: "checklist",
      eyebrow: "EVALUATION CONTRACT",
      title: "一份评估契约怎样把结果变成决定",
      intro:
        "契约应让未参与开发的人也能重放被测版本、理解量尺与外推边界，并知道每种结果触发什么动作。",
      items: [
        {
          name: "决策、对象与基线",
          en: "Decision, Unit & Baseline",
          mechanism:
            "声明评估用于初筛、验收、发布还是诊断，并冻结候选与当前版本的模型、Prompt、数据、检索、工具、策略、环境和预算。",
          decision:
            "把完整版本元组交给 AI Ops 的发布清单，但 Evaluation 只比较契约内声明的对象。",
          boundary:
            "模型名、端点别名或代码提交任何单项都不是完整被测系统。",
        },
        {
          name: "目标人群、任务与目标量",
          en: "Population, Tasks & Estimand",
          mechanism:
            "说明样本代表哪类用户、任务和时间范围，以及结果仅描述固定题集还是要外推到相似任务总体。",
          decision:
            "按真实分布、高价值、边界、历史失败和高风险场景建立切片，并公开抽样与外推假设。",
          boundary:
            "更多样本不能自动修复选择偏差；Benchmark Accuracy 与 Generalized Accuracy 不是同一目标量。",
        },
        {
          name: "评分器、量表与真值",
          en: "Graders & Ground Truth",
          mechanism:
            "为每个维度指定代码、Judge 或人工，保存 Rubric、正反例、评分器版本、人工校准和争议裁决。",
          decision:
            "权威系统后置条件优先确定性验证，开放语义才使用模型评审；高影响与争议由责任人裁决。",
          boundary:
            "Judge 的理由和分数不是业务真值，人工一致性也需要测量和改进。",
        },
        {
          name: "重复、切片与不确定性",
          en: "Trials, Slices & Uncertainty",
          mechanism:
            "在同等条件下重复运行，报告逐样本结果、关键切片、严重失败频率、分布和适合目标量的不确定性。",
          decision:
            "先处理不可补偿硬门，再比较通过候选的质量、时延、成本和每个可接受结果效率。",
          boundary:
            "最好一次、单一平均值和未经说明的置信区间都不能独立支持发布。",
        },
        {
          name: "决定规则与责任转交",
          en: "Decision Rule & Handoff",
          mechanism:
            "预先写明 Pass、Fail 和 Uncertain 分别触发 Go、Hold、No-Go、补充样本或人工复核，并保存失败归因与未决风险。",
          decision:
            "Evaluation 输出测量建议；AI Ops 执行放量、停止和回滚，Governance 决定例外，模块 Owner 修复机制。",
          boundary:
            "评估团队不能批准自己的风险例外，也不能把遥测存在等同于业务成功。",
        },
      ],
      sourceIds: ["nist-ai-800-3", "nist-genai-profile", "llm-as-judge-2023", "anthropic-agent-evals"],
      maxColumns: 3,
    },
  ],
  criticalBoundary:
    "评估结论随被测版本、目标量、样本、评分器、重复试验和决策规则一起交付；不可补偿风险单列硬门。Evaluation 输出测量建议，AI Ops 执行发布动作，Governance 决定风险接受与例外。",
  cloudHooks: [
    {
      stage: "数据集与实验（Datasets & Experiments）",
      services: "对象存储、数据仓库、评估集管理、实验追踪、版本控制",
      value: "分开开发、冻结回归与盲留出集，保存来源、裁决、切片、版本和适用期。",
      discover: "样本代表谁和什么任务，谁提供真值，哪些数据可用于评估而不能进入训练？",
    },
    {
      stage: "离线评估（Offline Evaluation）",
      services: "托管模型评估、批处理、Judge 服务、RAG/Agent 评测框架",
      value: "在同等契约下重复比较完整候选版本，输出切片、失败、不确定性和外推边界。",
      discover: "被测对象和目标量是什么，哪些终态可代码校验，Judge 怎样校准，重复几次才足够？",
    },
    {
      stage: "决策接口（Decision Interface）",
      services: "评估报告、策略规则、模型注册表、审批记录",
      value: "把测量结果转成 Go、Hold、No-Go 或补做建议，并保留责任转交和未决失败。",
      discover: "哪些硬门不可补偿，谁执行发布，谁批准例外，谁修复具体机制？",
    },
    {
      stage: "线上监控（Production Monitoring）",
      services: "Tracing、日志、指标、在线采样评估、A/B、告警、FinOps",
      value: "由 AI Ops 采集功能、运行、人因、安全与业务结果信号，供 Evaluation 发现离线未覆盖的新分布。",
      discover: "线上权威终态从哪里来，样本如何脱敏和裁决，哪些信号只用于调查而不能直接当标签？",
    },
  ],
  relatedSlugs: [
    "rag",
    "ai-agent",
    "prompt-engineering",
    "fine-tuning",
    "security",
    "ai-ops",
  ],
  qa: [
    {
      q: "模型在公开 Benchmark 上排名很高，为什么还要做客户评估？",
      a: "因为 Benchmark 测的是特定数据和任务，客户关心的是自己的语言、知识、流程、工具、风险和成本。",
      depth:
        "公开基准适合初筛通用能力，但无法覆盖企业权限、数据质量、工具错误、品牌规则和真实用户分布。还要说明分数描述固定题集表现，还是打算外推到相似任务总体；最终应在同一客户任务、环境、预算和硬门下比较完整候选版本。",
      ask: "哪些真实任务代表价值，哪些错误即使少量发生也不可接受？",
      tag: "模型选型",
      basis: "目标量 + 场景化评估",
      evidence: [
        {
          sourceId: "nist-ai-800-3",
          supports: "支持区分固定 Benchmark 表现与对相似任务总体的外推，并显式报告假设和不确定性。",
        },
        {
          sourceId: "nist-genai-profile",
          supports: "支持按具体使用情境、受影响主体和风险容忍度评估生成式 AI。",
        },
      ],
    },
    {
      q: "LLM-as-a-Judge 可以完全代替人工吗？",
      a: "不能。Judge 适合扩展主观质量评估，但需要人工定义 Rubric、校准偏差、处理争议和审核高风险样本。",
      depth:
        "先用人工 Gold Set 校准 Judge，再通过答案顺序交换、长度扰动、跨模型家族抽检和人工双评检查一致性、位置与冗长偏差。Judge 模型、Prompt 与 Rubric 要共同版本化；业务状态、Schema 和权限仍用代码验证。",
      ask: "哪些判断是主观质量，哪些有确定业务事实，谁是争议裁决者？",
      tag: "评估方法",
      basis: "评分方法分工",
      evidence: [
        {
          sourceId: "llm-as-judge-2023",
          supports: "支持模型评审存在位置、冗长等偏差，需要校准而不能作为自动真值。",
        },
        {
          sourceId: "nist-genai-profile",
          supports: "支持结合自动化测量、领域专家与人工监督管理评估局限。",
        },
      ],
    },
    {
      q: "RAG 回答错了，怎样判断是检索还是模型的问题？",
      a: "先评检索是否找到并排序了必要证据，再评生成是否忠实使用证据；两层不能混成一个总分。",
      depth:
        "检索层看必要内容是否进入候选、无关内容是否占据上下文；生成层看回答是否由上下文支持、是否正确引用和拒答。召回失败时换模型通常无效，生成失真时单纯增加 Top-K 也可能更差。",
      ask: "正确证据是否存在、是否被检索、是否进入最终上下文、回答是否引用了它？",
      tag: "RAG 诊断",
      basis: "RAG 分层评估",
      evidence: [
        {
          sourceId: "ragas",
          supports: "支持用 Context Recall、Context Precision 与 Faithfulness 等维度区分检索和生成问题。",
        },
      ],
    },
    {
      q: "Agent 为什么不能只评最终回答？",
      a: "因为 Agent 可能碰巧得到正确文字，却经历越权、无效调用、隐藏失败或未真正改变业务状态。",
      depth:
        "先用权威系统后置条件验证 Outcome，再检查权限、安全约束、工具副作用、时延与每个成功任务成本。Trajectory 适合归因；只有路径本身属于安全或业务契约时才设硬路径要求，否则固定步骤可能误杀另一条有效路线。",
      ask: "哪个系统状态证明完成，哪些动作或权限绝不能出现，哪些轨迹只用于诊断？",
      tag: "Agent 评估",
      basis: "业务终态 + 约束 + 诊断轨迹",
      evidence: [
        {
          sourceId: "anthropic-agent-evals",
          supports: "支持把任务、试验、评分器、轨迹和环境终态分开，并优先使用可验证后置条件。",
        },
      ],
    },
  ],
  evidenceCards: [
    {
      metric: "对象 × 阶段",
      title: "对象与证据阶段共同限定结论",
      finding: "模型、组件、应用和业务终态是不同对象；Benchmark、离线验收与部署后监测回答不同问题。",
      boundary: "局部分数不能替代端到端终态，部署前结果也不能证明真实运行不会出现新失败。",
      sourceId: "nist-genai-profile",
      accent: true,
    },
    {
      metric: "代码 → Judge → 人工",
      title: "按可验证程度选择评分方法",
      finding: "确定性后置条件优先代码，开放语义使用校准 Judge，高风险、争议和量表制定保留人工。",
      boundary: "评分器本身也要评估；Judge 与人工都不会自动成为业务事实源。",
      sourceId: "anthropic-agent-evals",
    },
    {
      metric: "固定题集 ≠ 相似任务总体",
      title: "目标量决定不确定性的解释方式",
      finding: "固定 Benchmark 上的表现与对相似任务总体的外推是不同目标，需要不同假设和不确定性解释。",
      boundary: "统计方法不能修复错误样本、选择偏差，也不能替客户设定通过线。",
      sourceId: "nist-ai-800-3",
    },
    {
      metric: "离线 → 生产",
      title: "部署后监测是另一类证据系统",
      finding: "受控评估无法覆盖真实流量、动态输入、人机交互和所有后果，生产还需功能、运行、人因、安全与业务结果监测。",
      boundary: "NIST AI 800-4 汇总类别与挑战，不是成熟监控标准，也不保证发现全部风险。",
      sourceId: "nist-ai-800-4",
    },
  ],
};

export const securityBrief = {
  slug: "security",
  definition:
    "AI 安全（AI Security）记录不可信 Source 到高影响 Sink 的攻击路径，并用信任标签、检索 ACL、确定性授权、控制验证与恢复事件限制模型、数据、Agent、工具和供应链的影响范围。",
  position:
    "位于工程保障层，负责攻击路径、技术控制、对抗性验证、遏制和取证；AI Governance 定义用途门禁、证据与残余风险决策权，获授权的招聘业务负责人决定用途和候选人高影响状态，Evaluation 负责测量结果，AI Ops 负责发布、停止与恢复。ATS 只执行限域权限并保存权威状态，不承担业务责任。",
  presentation: "stack",
  principleTitle: "恶意简历进入 ATS 时的控制证据",
  principles: [
    {
      zh: "记录不可接受损失",
      en: "Unacceptable Loss",
      explanation:
        "招聘辅助系统最严重的失败不是答错一句话，而是跨候选人泄露资料、错误淘汰、篡改 ATS 或让攻击者影响其他人的决定。",
      decision:
        "交付资产清单、攻击者能力表和 Source—Sink 图，并为每项不可接受后果指定控制 owner。",
    },
    {
      zh: "简历始终是不可信内容",
      en: "Resume as Untrusted Content",
      explanation:
        "候选人可在 PDF、隐藏文本或图片中放入间接提示注入；上传者已认证，也不改变内容的信任等级。",
      decision:
        "记录来源、版本和完整性，隔离解析，最小化上下文，并让外部内容只能成为候选证据。",
    },
    {
      zh: "检索使用当前身份与 ACL",
      en: "Authorized Retrieval",
      explanation:
        "职位政策、候选人材料、切块、Embedding、缓存和日志仍有访问与删除边界，不能因进入向量库而混用。",
      decision:
        "按招聘人员、职位和候选人执行检索时 ACL、隔离、来源验证与撤权传播。",
    },
    {
      zh: "模型只形成有据提案",
      en: "Evidence-bound Proposal",
      explanation:
        "模型可以总结证据、指出不确定性和提出下一步，但不持有 ATS 长期凭据，也不决定候选人资格或授权。",
      decision:
        "输出绑定候选人、职位、来源片段和允许字段；缺证据或冲突时停止并交给招聘人员。",
    },
    {
      zh: "ATS 动作由确定性门控制",
      en: "Deterministic ATS Gate",
      explanation:
        "应用用真实主体、职位范围、候选人 ID、允许字段、审批和最新资源版本决定能否写入 ATS。",
      decision:
        "自动化只覆盖已批准的低影响草稿；淘汰、排序发布或改变候选人状态保留业务授权。",
    },
    {
      zh: "验证控制并准备恢复",
      en: "Control Assurance & Recovery",
      explanation:
        "红队要证明某层失效后下一层仍限制影响；事件证据要能还原来源、上下文、身份、策略、动作、终态和补偿。",
      decision:
        "把遏制、撤销、队列停止、业务状态核对、恢复和回归样本写进发布门与演练。",
    },
  ],
  decisions: [
    {
      question: "哪些资产和 ATS 状态需要保护？",
      signal:
        "系统会解析候选人材料、检索招聘政策、读取其他候选人数据，或向 ATS 写入字段和状态。",
      recommendation:
        "把候选人隐私、职位边界、招聘决定、ATS 完整性和可追责性列为资产，并沿简历到业务终态标注 Source、信任边界、Sink 与 owner。",
      boundary:
        "从 OWASP 目录开始可以防漏项，但不能替代本系统的损失和信任边界分析。",
    },
    {
      question: "恶意简历最远能影响到哪里？",
      signal:
        "简历文本会进入 OCR、解析、RAG、模型、工具参数，甚至影响候选人排序或 ATS 状态。",
      recommendation:
        "逐段标记信任边界，隔离不可信内容，校验来源与参数，并在高影响 Sink 前设置独立授权和人工门。",
      boundary:
        "更长系统提示、分隔符或单个检测模型都不能保证恶意内容不会影响模型。",
    },
    {
      question: "怎样防止跨候选人数据泄露？",
      signal:
        "向量库、缓存或检索服务同时保存多职位、多地区或多候选人资料，权限还会随招聘流程变化。",
      recommendation:
        "按招聘人员、职位、候选人和用途执行写入准入、检索时 ACL、租户隔离和缓存键；由 Data Engineering 传播撤权删除，Security 用客户定义的时限和负向探针验收读取边界。",
      boundary:
        "OWASP 支持向量访问、投毒和泄露风险，不规定通用删除 SLA；Embedding 也不是匿名化。",
    },
    {
      question: "哪些 ATS 动作可以自动执行？",
      signal:
        "动作可能只是生成招聘人员草稿，也可能改变评分、排序、淘汰状态或向候选人发送外部信息。",
      recommendation:
        "按业务后果分级；用真实身份、短期限域凭据、允许字段、资源版本和审批决定执行，并回读 ATS 权威状态。",
      boundary:
        "模型输出合法 JSON、调用 Tool 或拥有共享服务账号，都不构成业务授权。",
    },
    {
      question: "怎样证明控制失效后仍能遏制和恢复？",
      signal:
        "一次 Guardrail 或红队通过，但系统仍会更换模型、解析器、Prompt、知识、权限和 ATS 集成。",
      recommendation:
        "对注入、越权、泄露、供应链变化和结果未知注入故障，记录下一层控制、停止动作、证据字段、补偿与恢复门槛。",
      boundary:
        "检测命中率、HTTP 恢复或 Prompt 修复都不能单独证明业务状态已经安全恢复。",
    },
  ],
    deepDiveTitle: "恶意简历进入 ATS 前的控制记录",
  deepDiveLead:
    "最小安全包包括源文件哈希与信任标签、检索 ACL 决策、模型提案、ATS 授权决策、写入后的权威状态和补偿事件。这些记录用同一候选人、职位、请求与 Trace 标识关联。",
  deepDives: [
    {
      kind: "sequence",
      eyebrow: "MALICIOUS RESUME TO ATS",
    title: "恶意简历进入招聘 Agent 后，如何限制权限",
      intro:
        "这条五段路径把简历限制为不可信证据：内容可影响模型提案，读取其他候选人资料和改变 ATS 高影响状态仍由模型外的身份、ACL 与审批决定。",
      items: [
        {
          name: "定义资产与不可接受损失",
          en: "Loss & Assets",
          mechanism:
            "候选人资料、招聘政策、职位范围、ATS 完整性和招聘决定由不同主体拥有，错误淘汰、跨候选人泄露和未授权写入是不同损失。",
          decision:
            "记录攻击者可控制的 Source、每条信任边界、可达 Sink、业务后果与控制 owner。",
          boundary:
            "风险目录能提示类别，但不能替客户决定什么损失不可接受。",
        },
        {
          name: "把简历作为不可信证据准入",
          en: "Untrusted Admission",
          mechanism:
            "候选人 PDF 在隔离环境解析，记录原文件、页码、版本、完整性和信任标签；隐藏文字、图片和解析结果都保持不可信。",
          decision:
            "执行文件与内容准入、DLP、来源追踪和最小上下文，避免将文档文字提升到系统规则区域。",
          boundary:
            "上传者已认证、解析成功或注入检测未命中，都不能提升内容权限。",
        },
        {
          name: "在当前身份下检索获准证据",
          en: "Authorized Retrieval",
          mechanism:
            "检索服务依据招聘人员、职位、候选人、地区和当前权限返回招聘政策与候选人材料，缓存键也保留相同边界。",
          decision:
            "执行检索时 ACL、租户与职位隔离、来源验证、撤权和删除传播负向测试。",
          boundary:
            "检索相关、向量接近或元数据存在，都不表示当前主体有权看到内容。",
        },
        {
          name: "模型生成有据提案",
          en: "Evidence-bound Proposal",
          mechanism:
            "模型只能输出候选人和职位 ID、允许字段的建议、证据引用、不确定性与需要人工复核的冲突，不持有 ATS 凭据。",
          decision:
            "用 Schema、参数来源、证据绑定和禁止字段校验把输出限制在提案层。",
          boundary:
            "格式正确或理由流畅不证明提案公平、准确或获准执行。",
        },
        {
          name: "确定性授权、执行与恢复",
          en: "Authorize, Execute & Recover",
          mechanism:
            "应用以真实主体、职位范围、允许字段、资源版本和审批决定执行；回读 ATS 权威状态，并记录来源、策略、参数、结果和补偿。",
          decision:
            "高影响状态变化保留招聘负责人授权；异常时暂停写入、撤销凭据、处理队列、修复业务状态并验证恢复。",
          boundary:
            "Agent 编排、MCP 或普通 API 都不把业务责任交给 ATS；ATS 执行限域权限并保存权威状态，高影响决定仍由获授权的招聘负责人作出。",
        },
      ],
      sourceIds: ["owasp-prompt-injection", "owasp-vector-weaknesses", "nist-zero-trust", "nist-genai-profile"],
    },
    {
      kind: "diagnostic",
      eyebrow: "AI INCIDENT TRIAGE",
      title: "招聘 Agent 出现异常时，怎样从症状定位失效边界",
      intro:
        "事件时间线从停止 ATS 高影响写入开始，串联简历来源、解析、检索、模型、身份、策略、动作、业务终态与补偿证据。",
      items: [
        {
          name: "招聘人员看到其他职位或候选人资料",
          mechanism:
            "检索 ACL、租户映射、缓存键、日志脱敏或删除传播失败，导致敏感内容进入候选或响应。",
          decision:
            "立即封禁相关索引与缓存路径，核对身份、查询过滤、命中文档和 ACL 版本，并执行全租户负向回归。",
          boundary:
            "只删除最终回答不能证明其他副本、日志和缓存已清除。",
        },
        {
          name: "Agent 改变了未获准的候选人状态",
          mechanism:
            "提示注入、工具选择错误、参数未校验、凭据过宽或审批绕过把模型错误放大为系统状态变化。",
          decision:
            "暂停高风险 Tool、撤销短期凭据、验证业务终态并执行补偿；回放模型输入、策略决定和资源审计。",
          boundary:
            "只修改 Prompt 无法修复过宽权限和缺失的资源端授权。",
        },
        {
          name: "恶意简历开始稳定影响筛选结果",
          mechanism:
            "可信写入路径被投毒、来源版本被替换、恶意文档获得高排名，或 Embedding/索引更新改变检索分布。",
          decision:
            "冻结写入、隔离来源批次、核对哈希和血缘，重建干净索引并用历史失败与投毒样本回归。",
          boundary:
            "向量相似度和 Reranker 分数不能证明来源真实。",
        },
        {
          name: "解析器、模型或 ATS 连接器突然变化",
          mechanism:
            "模型版本、Server 描述、依赖、权重或供应商策略发生未受控变化，绕过原评估与批准范围。",
          decision:
            "切换到批准版本，核验注册表、哈希、SBOM、发布记录和供应商通知，再重新完成安全与任务回归。",
          boundary:
            "服务仍可调用不代表其行为和数据处理条件仍与批准时一致。",
        },
        {
          name: "检测指标正常但错误淘汰仍发生",
          mechanism:
            "检测只覆盖已知内容模式，真正失效点可能在授权、工具、编码、多模态输入或人工流程。",
          decision:
            "按攻击路径复核输入、行动、输出和监控各门，增加自适应红队与确定性策略，而不是只调检测阈值。",
          boundary:
            "没有告警不能证明没有风险；遥测缺失本身就是控制缺口。",
        },
      ],
      sourceIds: ["owasp-prompt-injection", "owasp-vector-weaknesses", "nist-genai-profile", "nist-sp-800-61r3", "nist-sp-800-218a"],
      columnLabels: {
        name: "事件症状",
        mechanism: "可能失效点",
        decision: "遏制、取证与恢复",
        boundary: "避免误判",
      },
    },
  ],
  criticalBoundary:
    "Security 证明攻击路径受到限制且系统能够遏制、取证和恢复；Governance 决定招聘用途、残余风险与法律升级，获授权的业务负责人决定候选人高影响状态。身份、授权、凭据、数据访问和 ATS 写入由模型外的确定性控制执行。",
  cloudHooks: [
    {
      stage: "身份与凭据（Identity & Credentials）",
      services: "IAM、OAuth/OIDC、工作负载身份、KMS、Secrets Manager、PAM",
      value: "提供短期、限域、可撤销身份，避免凭据进入 Prompt 和模型上下文。",
      discover: "模型以谁的身份行动，凭据存在哪里，Scope、租户和有效期如何限制？",
    },
    {
      stage: "网络与运行隔离（Network & Runtime Isolation）",
      services: "私网、WAF、API Gateway、容器沙箱、虚拟桌面、服务网格",
      value: "限制模型、Agent、工具和外部内容之间的通信与影响范围。",
      discover: "哪些资源允许出网、写入或执行代码，环境能否按任务隔离和销毁？",
    },
    {
      stage: "数据保护（Data Protection）",
      services: "DLP、数据分类、加密、访问控制、向量数据库、审计存储",
      value: "保护 Prompt、日志、知识库、Embedding 和模型输出中的敏感信息。",
      discover: "哪些数据可进入模型、向量库和日志，如何执行租户隔离、保留与删除？",
    },
    {
      stage: "AI 防护（AI Guardrails）",
      services: "内容安全、Prompt 防护、策略引擎、模型安全过滤、人工审批",
      value: "在输入、行动和输出位置检测风险并阻断不允许的行为。",
      discover: "哪些内容和动作必须阻断，误报如何处理，策略由谁批准和更新？",
    },
    {
      stage: "安全运营与治理（SecOps & Governance）",
      services: "SIEM、Tracing、威胁检测、红队平台、漏洞管理、资产与物料清单",
      value: "持续发现注入、越权、异常调用、供应链变化和控制失效。",
      discover: "谁负责 AI 资产、告警、事件响应、证据保留和定期复核？",
    },
  ],
  relatedSlugs: [
    "rag",
    "ai-agent",
    "multimodal",
    "mcp",
    "a2a",
    "data-engineering",
    "ai-gateway",
    "evaluation",
    "ai-ops",
    "ai-governance",
  ],
  qa: [
    {
      q: "模型已经做过安全对齐，应用还需要哪些安全工作？",
      a: "仍需传统安全和 AI 专用控制。模型对齐只能影响生成行为，不能替应用完成身份、授权、数据隔离、工具审批和事件响应。",
      depth:
        "招聘 Agent 要对简历来源、候选人和职位权限、招聘政策检索、ATS 工具、凭据、允许字段、人工授权和业务终态负责。安全目标不是声称模型永不受恶意简历影响，而是即使受影响，也不能跨候选人泄露、扩大权限或直接淘汰候选人。",
      ask: "恶意简历最远能影响哪些数据和 ATS 字段，最坏错误会改变什么候选人状态？",
      tag: "共享责任",
      basis: "生成式 AI 风险框架 + 零信任",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持组织在生成式 AI 全生命周期识别、测量和管理系统级风险。",
        },
        {
          sourceId: "nist-zero-trust",
          supports: "支持不依赖隐式信任，而在资源访问前验证主体和授权。",
        },
      ],
    },
    {
      q: "候选人在简历中藏入恶意指令，能不能靠更强的系统提示解决？",
      a: "不能保证。提示可以降低部分风险，但模型仍可能把不可信内容误当指令，必须在模型外限制权限和影响范围。",
      depth:
        "OWASP 直接给出简历筛选中的间接注入场景：恶意内容可藏在 PDF、隐藏文字或图片中。系统要保留来源与信任标签、隔离解析、最小化上下文并检测可疑内容；更关键的是，让候选人资料只能影响有据提案，跨候选人读取与 ATS 高影响动作必须经过独立 ACL、参数校验和业务授权。",
      ask: "一份简历从解析到检索、模型和 ATS 会跨过哪些信任边界？",
      tag: "提示注入",
      basis: "OWASP 威胁定义 + 外部控制",
      evidence: [
        {
          sourceId: "owasp-prompt-injection",
          supports: "支持直接与间接提示注入的威胁，以及单纯依赖模型内指令的局限。",
        },
      ],
    },
    {
      q: "候选人材料存进向量库后，数据风险真的降低了吗？",
      a: "不能这样判断。向量化不是匿名化，向量、元数据、原文和检索结果仍可能敏感，删除原文也不会自动清除所有派生数据。",
      depth:
        "简历会形成切块、Embedding、索引、缓存、日志和评估样本。必须把招聘人员、职位、候选人和用途写进权限边界，执行写入准入、检索时 ACL 与隔离。Data Engineering 负责副本清单和撤权删除传播；Security 要求客户定义时限、失败处理与负向探针作为验收证据。OWASP 支持向量访问、投毒和泄露风险，但不提供通用删除 SLA。",
      ask: "一份简历会复制到哪些位置，谁可以跨职位读取，撤权和删除怎样证明完成？",
      tag: "RAG 安全",
      basis: "向量与 Embedding 风险",
      evidence: [
        {
          sourceId: "owasp-vector-weaknesses",
          supports: "支持向量与 Embedding 系统的访问控制、投毒、跨租户和数据泄露风险。",
        },
      ],
    },
    {
      q: "怎样避免招聘 Agent 越权修改 ATS 或错误淘汰候选人？",
      a: "模型只提出动作意图，应用使用真实身份做授权、参数校验和执行；按动作风险决定自动、确认或禁止。",
      depth:
        "招聘人员已登录只证明身份，不表示 Agent 可以读取所有职位或修改所有候选人字段。要区分发起人、代表主体、职位范围、允许字段和凭据受众；生成草稿可以自动化，评分发布、淘汰、状态变化和对外通知应预览并由有权招聘人员确认。执行后回读 ATS 权威状态，结果未知时先查询再重试。",
      ask: "ATS 调用以谁的身份执行，哪些字段允许写，谁能改变候选人状态，失败怎样补偿？",
      tag: "Agent 安全",
      basis: "最小权限 + 行动控制",
      evidence: [
        {
          sourceId: "nist-zero-trust",
          supports: "支持资源访问前验证身份与授权，并持续限制访问范围。",
        },
        {
          sourceId: "mcp-security",
          supports: "支持工具调用场景中的混淆代理、令牌和权限风险需要独立控制。",
        },
      ],
    },
    {
      q: "采用 Guardrail 并通过一次红队后，可以减少后续安全测试吗？",
      a: "不能。Guardrail 是控制组件，一次红队只是当前版本的有限证据；模型、Prompt、知识、工具和攻击方法都会变化。",
      depth:
        "测试要覆盖普通与恶意简历、隐藏文本、跨候选人检索、ATS 参数篡改、审批绕过、结果未知和供应链变化，并观察某层失效后下一层是否限制影响。模型、解析器、Prompt、向量索引、权限或 ATS 集成的重要变更都要重跑；线上事件经裁决后进入回归。",
      ask: "哪些招聘系统变更会触发重测，Guardrail 绕过后 ATS 仍允许发生什么？",
      tag: "安全验证",
      basis: "风险测量 + 持续评估",
      evidence: [
        {
          sourceId: "nist-genai-profile",
          supports: "支持部署前后持续测量、红队测试和控制有效性复核。",
        },
        {
          sourceId: "owasp-prompt-injection",
          supports: "支持采用多层缓解而非依赖单一检测或提示。",
        },
        {
          sourceId: "owasp-llm-top-ten",
          supports: "支持测试覆盖多类生成式 AI 应用风险，而不只检查内容过滤。",
        },
      ],
    },],
  evidenceCards: [
    {
      metric: "模型 + 应用 + Agent",
      title: "安全风险存在于完整系统",
      finding: "模型输出、应用数据流和 Agent 工具行动形成不同攻击面，需要分层控制。",
      boundary: "通过模型安全测试不能证明数据、身份、工具和供应链同样安全。",
      sourceId: "nist-genai-profile",
      accent: true,
    },
    {
      metric: "直接 + 间接",
      title: "恶意简历可以形成间接提示注入",
      finding: "OWASP 直接列出简历筛选场景：攻击者可在简历中隐藏指令，影响模型判断或后续动作。",
      boundary: "检测降低风险但不提供绝对防护；简历内容不能因此获得跨候选人读取或 ATS 写入权限。",
      sourceId: "owasp-prompt-injection",
    },
    {
      metric: "向量化 ≠ 匿名化",
      title: "Embedding 仍需数据治理",
      finding: "向量数据库可能发生投毒、越权检索、跨租户泄露与敏感信息推断。",
      boundary: "加密存储不能替代检索时 ACL、租户隔离和来源治理。",
      sourceId: "owasp-vector-weaknesses",
    },
    {
      metric: "输入 / 行动 / 输出 / 监控",
      title: "四道控制门共同降低风险",
      finding: "把检测、身份、策略、DLP、审批和审计放在不同控制点，避免单点失效。",
      boundary: "控制组合需要按场景测试，不能承诺消除所有生成式 AI 风险。",
      sourceId: "nist-genai-profile",
    },
    {
      metric: "10 类常见风险",
      title: "风险目录帮助威胁建模防止漏项",
      finding: "提示注入、敏感信息、供应链、投毒、输出处理、过度授权与向量弱点需要跨层检查。",
      boundary: "目录只提供共同语言，不能替代系统特有的数据流、损失分析和控制测试。",
      sourceId: "owasp-llm-top-ten",
    },
    {
      metric: "准备 / 检测 / 响应 / 恢复",
    title: "把事件响应纳入日常风险管理",
      finding: "NIST SP 800-61 Rev. 3 把事件响应纳入 CSF 2.0 风险管理，要求准备、检测、响应、恢复与持续改进协同。",
      boundary: "该指南不规定招聘 AI 的统一告警阈值、取证字段或恢复时限，具体机制仍需按系统设计。",
      sourceId: "nist-sp-800-61r3",
    },
    {
      metric: "标识 + 元数据 + 日志",
      title: "标识义务可翻译为可测试控制",
      finding: "标识办法把显式标识、元数据隐式标识、传播平台核验提示与特定情形的日志留存连成一条可执行链，工程控制可对应生成、写入、核验、提示与留痕。",
      boundary: "控制存在不等于已经满足全部法定义务；适用主体与情形需由专业人员确认。",
      sourceId: "china-ai-content-labeling-2026-08-05",
    },
  ],
};

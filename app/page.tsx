const layers = [
  {
    no: "01",
    name: "解决方案层",
    en: "Solution Plays",
    purpose: "把技术能力翻译成客户价值、路线与采购边界。",
    modules: ["场景方案库", "模型选型格局", "行业蓝图", "商业价值与 TCO"],
    presales: "先回答为什么做、做什么，再谈怎么做。",
  },
  {
    no: "02",
    name: "应用模式层",
    en: "Application Patterns",
    purpose: "掌握用模型解决问题的主流模式与组合方式。",
    modules: ["RAG", "Agent", "多模态", "工作流与结构化生成"],
    presales: "识别需求适合检索、生成、行动，还是它们的组合。",
  },
  {
    no: "03",
    name: "协议与互操作层",
    en: "Protocols & Interoperability",
    purpose: "理解模型、工具、Agent 与系统间如何发现、协作和治理。",
    modules: ["MCP", "A2A", "API / Event", "身份与授权边界"],
    presales: "避免把协议能力误说成完整平台能力。",
  },
  {
    no: "04",
    name: "工程保障层",
    en: "Engineering Assurance",
    purpose: "让 PoC 从“能回答”走向“可上线、可治理、可运营”。",
    modules: ["评估 Eval", "安全与治理", "推理与 AI 网关", "可观测与 FinOps"],
    presales: "把准确率、SLA、风险、成本一起写入验收。",
  },
  {
    no: "05",
    name: "模型基础层",
    en: "Model Foundations",
    purpose: "建立解释模型能力、局限与优化手段所需的理论底座。",
    modules: ["模型原理", "提示词工程", "训练与微调", "模型压缩与对齐"],
    presales: "懂原理，但不陷入与客户目标无关的算法细节。",
  },
  {
    no: "06",
    name: "数据底座层",
    en: "Data Foundation",
    purpose: "把非结构化与结构化数据转成可信、可检索、可运营的知识。",
    modules: ["解析 / OCR", "同步 / CDC", "向量库与检索", "质量与知识运营"],
    presales: "多数 RAG 问题首先是数据与权限问题。",
  },
  {
    no: "07",
    name: "算力底座层",
    en: "Compute Foundation",
    purpose: "理解模型以下的硬件、集群、存储、网络与平台能力。",
    modules: ["加速器与异构算力", "集群与调度", "推理栈", "存储与网络"],
    presales: "把吞吐、时延、可用性和成本放在同一张容量表里。",
  },
];

const qa = [
  {
    q: "上下文窗口已经很长，为什么还需要 RAG？",
    a: "长上下文解决“能装下多少”，RAG 解决“该拿什么、是否最新、谁能看、证据来自哪里”。当语料很小、稳定且可整体装入时，直接长上下文可能更简单；当知识持续变化、跨权限域、需要引用或规模持续增长时，RAG 更可运营。",
    depth: "不能只比较 token 上限。还要比较有效召回、上下文位置偏差、首 token 时延、重复传输成本、权限过滤和更新 SLA。研究显示，相关信息位于长上下文中部时，模型表现可能显著下降，所以“放得下”不等于“用得好”。",
    ask: "追问客户：语料多大、多久变化一次、是否分权限、答案是否必须给出处？",
    tag: "架构判断",
  },
  {
    q: "RAG 能消除幻觉吗？",
    a: "不能。RAG 能提供外部证据并降低无依据生成的概率，但仍会在检索、上下文理解、推理和生成四个环节失败。",
    depth: "应把“幻觉”拆成可诊断链路：没检到、检错了、证据冲突、模型忽略证据、引用与结论不一致。上线控制应包含拒答阈值、逐句引用、冲突提示、高风险场景人工复核，以及检索与生成分层评估。",
    ask: "追问客户：错误答案的业务代价是什么？允许拒答吗？哪些场景必须人工确认？",
    tag: "风险边界",
  },
  {
    q: "做 RAG 一定要向量数据库吗？",
    a: "不一定。向量检索擅长语义相似，但精确编号、产品代码、日期、人名与强过滤条件常常更适合关键词、结构化查询或混合检索。",
    depth: "常见稳健方案是 dense + sparse + metadata filter，再对候选结果 rerank。小规模、低并发场景也可以先用已有搜索引擎或数据库扩展，避免为技术名词单独采购。选型重点是过滤正确性、增量更新、隔离、备份和可观测，不只是向量吞吐。",
    ask: "追问客户：查询更像“找同义内容”还是“查精确事实”？现有搜索与数据库能否复用？",
    tag: "产品选型",
  },
  {
    q: "为什么系统明明有文档，还是答不到？",
    a: "先看检索链路，不要先换更大的模型。常见原因是解析丢内容、切块破坏语义、元数据错误、查询与文档语言不一致、Top-K 太小，或重排把正确证据压下去。",
    depth: "用带标准答案和证据位置的诊断集逐层排查：文档是否入库 → 正确片段是否进入候选集 → 是否进入最终上下文 → 模型是否忠实使用。只有最后一步失败时，升级生成模型才最可能有效。",
    ask: "追问客户：能否提供 50–100 个真实失败问题及其正确证据？",
    tag: "故障诊断",
  },
  {
    q: "RAG 和微调怎么选？",
    a: "知识频繁更新、要给出处，优先 RAG；希望模型稳定遵循风格、格式或专门行为，考虑微调。两者可以组合。",
    depth: "微调把模式写入参数，更新与追溯成本较高；RAG 在运行时注入证据，便于更新和撤回。不要用微调代替权限控制，也不要期待 RAG 自动学会复杂输出行为。先用提示词 + RAG 建基线，确认剩余误差确实是行为问题后再评估微调。",
    ask: "追问客户：变化的是“事实知识”还是“回答行为”？多久变一次？",
    tag: "路线选择",
  },
  {
    q: "不同部门、不同客户的数据权限如何保证？",
    a: "权限必须在检索前或检索时强制执行，不能只写在提示词里。",
    depth: "身份应贯穿查询链路；索引保留来源 ACL 或采用物理隔离；检索服务在候选生成前做 tenant / user / group 过滤；缓存键包含权限上下文；日志做脱敏。验收必须包含越权对抗集，并要求越权泄漏率为零。",
    ask: "追问客户：权限来自哪个主系统？是否有行列级、文档级和租户级隔离要求？",
    tag: "安全",
  },
  {
    q: "源文档更新后，多久能在回答中生效？",
    a: "这不是模型 SLA，而是数据新鲜度 SLA。需要把发现、解析、索引、缓存失效和删除传播分别计时。",
    depth: "建议为不同来源定义更新等级，例如政策分钟级、产品手册小时级、历史档案天级；记录 source_version、indexed_at、effective_at 和 deletion_at。删除与权限撤销往往比新增更关键，必须有可验证的端到端传播时间。",
    ask: "追问客户：哪类数据最敏感？新增、修改、删除分别要求多快生效？",
    tag: "时效性",
  },
  {
    q: "如何证明 RAG 的效果，而不是做一个漂亮 Demo？",
    a: "先冻结真实问题集和业务门槛，再对检索、生成、端到端、性能安全四层分别验收。",
    depth: "检索看 Recall@K、MRR / nDCG；生成看 faithfulness、答案相关性、引用正确性；端到端看任务完成率与人工接受率；工程看 P95、单问成本、更新 SLA、越权泄漏率。自动评分用于提速，人审用于校准高风险样本。",
    ask: "追问客户：谁定义正确答案？什么分数能上线？失败样本如何回流？",
    tag: "评估",
  },
  {
    q: "PDF、扫描件、表格和图片很多，RAG 还能做好吗？",
    a: "可以，但解析质量会成为上限。必须把版面、表格关系、页码和图文对应关系保留下来。",
    depth: "纯文本抽取容易把双栏顺序、表头、脚注和跨页表格打乱。建议按文档类型路由解析器，保留页级坐标和原始文件回链；表格同时保留结构化表示与可读摘要；抽样衡量字段完整率和版面恢复率。多模态检索只在图片本身承载信息时引入。",
    ask: "追问客户：文档类型各占多少？扫描质量如何？正确答案依赖图表还是正文？",
    tag: "数据工程",
  },
  {
    q: "怎样控制延迟和成本？",
    a: "先缩短无效链路，再缩小模型。成本通常来自解析与索引、检索 / 重排、输入 token、生成 token 和峰值容量。",
    depth: "可采用查询分类跳过不必要检索、缓存稳定结果、分级 Top-K、轻量模型做改写与路由、只对高价值候选重排、压缩上下文，并把流式首 token 与总时延分开管理。不要只报每百万 token 价格，应报每个成功回答成本。",
    ask: "追问客户：并发、P95、峰值系数、平均文档长度和每月成功问答量是多少？",
    tag: "FinOps",
  },
  {
    q: "开源模型还是商业模型更适合？",
    a: "没有脱离约束的统一答案。先用同一套语料与评测集比较质量、吞吐、运维、合规、锁定和三年 TCO。",
    depth: "商业 API 通常更快获得强能力与弹性；自托管更利于深度控制、数据域隔离和稳定大规模负载，但需要容量、升级、安全和 SRE 能力。RAG 把知识层与模型层解耦，有利于做模型可替换性，但提示、分词、上下文长度和工具调用差异仍需适配。",
    ask: "追问客户：数据能否出域？团队是否具备 GPU / 推理运维能力？负载是否稳定？",
    tag: "模型格局",
  },
  {
    q: "RAG 系统会不会被文档里的恶意指令攻击？",
    a: "会。检索到的内容是不可信数据，不能把它当系统指令。RAG 也不能天然防止 prompt injection。",
    depth: "控制包括来源白名单、入库扫描与签名、把指令与证据分区、最小权限工具调用、输出校验、敏感动作二次确认、异常检索监控和红队测试。对于能执行动作的 Agent，知识检索与工具授权要采用不同信任域。",
    ask: "追问客户：系统只回答，还是还能发邮件、下单、改配置？知识源是否允许外部写入？",
    tag: "安全",
  },
];

const sources = [
  {
    level: "A / 论文",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks",
    note: "RAG 原始研究脉络；论文在当时 3 个开放域问答任务上取得 SOTA。",
    date: "核验：2026-07-17",
    href: "https://arxiv.org/abs/2005.11401",
  },
  {
    level: "A / 论文",
    title: "Lost in the Middle: How Language Models Use Long Contexts",
    note: "长上下文并不保证稳定利用；相关信息位置会显著影响表现。",
    date: "核验：2026-07-17",
    href: "https://arxiv.org/abs/2307.03172",
  },
  {
    level: "B / 厂商实验",
    title: "Contextual Retrieval",
    note: "特定实验中，混合检索将 top-20 失败率从 5.7% 降至 2.9%，加重排后为 1.9%；不可直接外推。",
    date: "核验：2026-07-17",
    href: "https://www.anthropic.com/engineering/contextual-retrieval",
  },
  {
    level: "A / 论文",
    title: "RAGAS: Automated Evaluation of Retrieval Augmented Generation",
    note: "将评估拆到检索上下文、忠实度和回答质量等维度。",
    date: "核验：2026-07-17",
    href: "https://arxiv.org/abs/2309.15217",
  },
  {
    level: "S / 标准框架",
    title: "NIST AI RMF: Generative AI Profile",
    note: "用 Govern / Map / Measure / Manage 组织生成式 AI 风险治理。",
    date: "核验：2026-07-17",
    href: "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
  },
  {
    level: "S / 社区标准",
    title: "OWASP LLM01:2025 Prompt Injection",
    note: "明确 RAG 与微调都不能完全消除 prompt injection。",
    date: "核验：2026-07-17",
    href: "https://genai.owasp.org/llmrisk/llm01-prompt-injection/",
  },
];

export default function Home() {
  return (
    <main>
      <header className="hero" id="top">
        <nav className="topbar" aria-label="主导航">
          <a className="brand" href="#top" aria-label="云与 AI 售前知识库首页">
            <span className="brandMark">CA</span>
            <span>Cloud × AI / Presales Fieldbook</span>
          </a>
          <div className="toplinks">
            <a href="#map">知识地图</a>
            <a href="#rag">RAG 实战包</a>
            <a href="#maintenance">维护机制</a>
          </div>
        </nav>

        <div className="heroGrid">
          <div className="heroCopy">
            <p className="eyebrow">READING EDITION · V0.1</p>
            <h1>云计算 × AI 平台<br />售前知识库</h1>
            <p className="heroLead">
              从客户问题出发，把概念、架构、选择、证据和回答话术连成一条可复用的售前路径。
              中文为主，关键术语中英对照；兼顾理论深度与客户现场可用性。
            </p>
            <div className="heroActions">
              <a className="primaryButton" href="#rag">进入 RAG 实战包</a>
              <a className="textButton" href="#map">浏览完整框架 <span>↘</span></a>
            </div>
          </div>
          <aside className="briefCard" aria-label="知识库定义">
            <div className="briefTop">
              <span>BUILD BRIEF</span><span>2026.07</span>
            </div>
            <dl>
              <div><dt>读者</dt><dd>有 Python / API 基础的售前人员</dd></div>
              <div><dt>重点</dt><dd>概念 → 判断 → 证据 → 客户回答</dd></div>
              <div><dt>载体</dt><dd>阅读型 HTML，可扩展为模块库</dd></div>
              <div><dt>示范</dt><dd>RAG：架构、选型、评估、安全、问答</dd></div>
            </dl>
            <p className="statusLine"><span /> 当前版本已纳入 6 份一级来源</p>
          </aside>
        </div>
      </header>

      <section className="principles section" aria-labelledby="principles-title">
        <div className="sectionNumber">00</div>
        <div className="sectionBody">
          <div className="sectionIntro">
            <p className="kicker">HOW TO USE</p>
            <h2 id="principles-title">每个模块都回答四个问题</h2>
          </div>
          <div className="principleGrid">
            <article><span>01</span><h3>它解决什么？</h3><p>业务问题、适用边界、非目标与价值假设。</p></article>
            <article><span>02</span><h3>怎么判断？</h3><p>架构模式、关键变量、选型矩阵与反例。</p></article>
            <article><span>03</span><h3>如何证明？</h3><p>数据、评测、来源等级与验收门槛。</p></article>
            <article><span>04</span><h3>现场怎么说？</h3><p>客户问题、短答、深答、追问和风险提示。</p></article>
          </div>
        </div>
      </section>

      <section className="section mapSection" id="map" aria-labelledby="map-title">
        <div className="sectionNumber">01</div>
        <div className="sectionBody">
          <div className="sectionIntro splitIntro">
            <div>
              <p className="kicker">KNOWLEDGE MAP</p>
              <h2 id="map-title">知识地图：7 层、28 个细分模块</h2>
            </div>
            <p>目录按售前对话的自然顺序自上而下；学习时可从底座向上补齐。层与层之间用“能力依赖”和“客户证据”交叉链接。</p>
          </div>

          <div className="layerStack">
            {layers.map((layer) => (
              <article className="layer" key={layer.no}>
                <div className="layerIndex">{layer.no}</div>
                <div className="layerTitle">
                  <h3>{layer.name}</h3>
                  <p>{layer.en}</p>
                </div>
                <div className="layerContent">
                  <p className="layerPurpose">{layer.purpose}</p>
                  <div className="chips">
                    {layer.modules.map((module) => <span key={module}>{module}</span>)}
                  </div>
                </div>
                <p className="layerNote">{layer.presales}</p>
              </article>
            ))}
          </div>

          <div className="curriculum">
            <div>
              <p className="kicker">LEARNING PATHS</p>
              <h3>不是一条固定学习路线</h3>
            </div>
            <div className="pathCards">
              <article><strong>新入门 · 4 周</strong><p>模型基础 → RAG → 评估 → 场景方案</p></article>
              <article><strong>做 PoC · 2 周</strong><p>场景 → 数据 → RAG / Agent → 验收与安全</p></article>
              <article><strong>做平台规划</strong><p>方案组合 → 工程保障 → 数据 / 算力底座 → TCO</p></article>
            </div>
          </div>
        </div>
      </section>

      <section className="ragHero" id="rag" aria-labelledby="rag-title">
        <div className="ragHeader">
          <div>
            <p className="kicker light">MODULE SAMPLE · APPLICATION PATTERN</p>
            <h2 id="rag-title">RAG<br /><span>Retrieval-Augmented Generation</span></h2>
          </div>
          <div className="ragDefinition">
            <p>用可更新、可追溯的外部证据增强模型回答；核心不是“接一个向量库”，而是建立一条可评估、可授权、可运营的知识供应链。</p>
            <div className="moduleMeta"><span>阅读约 18 分钟</span><span>12 个客户问题</span><span>6 份一级来源</span></div>
          </div>
        </div>
      </section>

      <section className="section ragBody" aria-label="RAG 核心内容">
        <div className="sectionNumber">02</div>
        <div className="sectionBody">
          <div className="decisionBanner">
            <p className="kicker">PRESALES POSITION</p>
            <h3>一句话定位</h3>
            <p>客户要的不是一个“会聊天的搜索框”，而是一套能在正确权限下找到正确证据、生成可核验回答，并持续知道哪里做错了的系统。</p>
          </div>

          <div className="subsection" id="when-to-use">
            <div className="subHead"><span>2.1</span><div><p className="kicker">FIT CHECK</p><h3>先判断：是不是该做 RAG</h3></div></div>
            <div className="fitGrid">
              <article className="fit yes">
                <h4><span>✓</span> 高匹配</h4>
                <ul>
                  <li>知识频繁变化，需要分钟 / 小时级更新</li>
                  <li>答案必须附来源、页码或原文证据</li>
                  <li>数据按用户、部门或租户分权限</li>
                  <li>语料规模持续增长，无法稳定整体放入上下文</li>
                  <li>需要知道失败发生在检索还是生成</li>
                </ul>
              </article>
              <article className="fit maybe">
                <h4><span>△</span> 先做对比</h4>
                <ul>
                  <li>语料很小、稳定，可整体放入上下文</li>
                  <li>核心需求是固定格式、语气或专门行为</li>
                  <li>问题依赖实时交易数据与复杂计算</li>
                  <li>没有可用的权威知识源或内容所有者</li>
                  <li>错误代价极高，却不允许拒答或人工复核</li>
                </ul>
              </article>
            </div>
          </div>

          <div className="subsection" id="architecture">
            <div className="subHead"><span>2.2</span><div><p className="kicker">REFERENCE ARCHITECTURE</p><h3>把 RAG 看成两条链</h3></div></div>
            <div className="chainWrap">
              <div className="chainLabel"><strong>离线知识链</strong><span>Knowledge pipeline</span></div>
              <div className="flow">
                {['源系统', '解析 / OCR', '切块与元数据', '权限映射', '稀疏 + 向量索引'].map((x, i) => <div className="flowStep" key={x}><span>{String(i+1).padStart(2,'0')}</span>{x}</div>)}
              </div>
              <div className="chainLabel runtime"><strong>在线问答链</strong><span>Serving pipeline</span></div>
              <div className="flow runtimeFlow">
                {['查询理解', '混合召回', '过滤与重排', '上下文组装', '生成 / 引用 / 拒答'].map((x, i) => <div className="flowStep" key={x}><span>{String(i+1).padStart(2,'0')}</span>{x}</div>)}
              </div>
            </div>
            <div className="architectureNotes">
              <p><strong>共同控制面</strong>：评测集、提示版本、来源谱系、权限策略、日志追踪、成本与 SLA。</p>
              <p><strong>关键分界</strong>：模型负责基于证据生成；应用负责身份、权限、工具调用和最终业务动作。</p>
            </div>
          </div>

          <div className="subsection" id="choice">
            <div className="subHead"><span>2.3</span><div><p className="kicker">CHOICE MATRIX</p><h3>四种路线，不要一上来就选产品</h3></div></div>
            <div className="tableWrap">
              <table>
                <thead><tr><th>路线</th><th>最适合</th><th>更新 / 引用</th><th>主要代价</th><th>售前判断</th></tr></thead>
                <tbody>
                  <tr><th>长上下文<br /><small>Long context</small></th><td>小而稳定的封闭语料</td><td>更新简单；可引用但需额外设计</td><td>输入成本、时延、位置偏差</td><td>先做最小基线</td></tr>
                  <tr className="highlight"><th>RAG</th><td>动态、跨源、需权限与证据</td><td>强；可增量更新与撤回</td><td>数据链路与评估复杂度</td><td>默认企业知识路线</td></tr>
                  <tr><th>微调<br /><small>Fine-tuning</small></th><td>稳定行为、风格、格式与领域模式</td><td>知识更新慢；来源难追溯</td><td>数据构造、训练与回归</td><td>针对行为，不替代检索</td></tr>
                  <tr><th>Agentic retrieval</th><td>多步查询、跨系统、需计划与工具</td><td>强，但链路更长</td><td>时延、不可预测性与权限风险</td><td>复杂任务再引入</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="subsection" id="evidence">
            <div className="subHead"><span>2.4</span><div><p className="kicker">DATA WITH CAVEATS</p><h3>可以引用的数据，也要说明边界</h3></div></div>
            <div className="evidenceGrid">
              <article className="metricCard"><p className="metric">3</p><h4>开放域问答任务</h4><p>原始 RAG 论文在当时 3 个 open-domain QA 任务达到 SOTA。它证明方法潜力，不等于今天任何企业语料都能复现。</p><a href="https://arxiv.org/abs/2005.11401" target="_blank" rel="noreferrer">查看论文 ↗</a></article>
              <article className="metricCard accent"><p className="metric">5.7% → 1.9%</p><h4>Top-20 检索失败率</h4><p>Anthropic 的特定实验中，contextual dense + BM25 + rerank 达到该结果。应作为“混合检索值得 A/B”的证据，不是采购承诺。</p><a href="https://www.anthropic.com/engineering/contextual-retrieval" target="_blank" rel="noreferrer">查看实验 ↗</a></article>
              <article className="metricCard"><p className="metric">4</p><h4>分层验收面</h4><p>检索质量、生成忠实度、端到端业务结果、工程与安全。单一“正确率”无法定位系统失败。</p><a href="https://arxiv.org/abs/2309.15217" target="_blank" rel="noreferrer">评估研究 ↗</a></article>
            </div>
          </div>

          <div className="subsection" id="poc">
            <div className="subHead"><span>2.5</span><div><p className="kicker">POC PLAYBOOK</p><h3>10 个工作日的验证包</h3></div></div>
            <div className="pocGrid">
              <article><span>D1–2</span><h4>定义问题与基线</h4><p>选 2–3 个高价值任务；冻结真实问题、正确答案、证据位置与风险等级；用长上下文 / 现有搜索建立基线。</p></article>
              <article><span>D3–5</span><h4>打通知识链</h4><p>接入最小权威语料；验证解析、切块、元数据、权限与增量更新；记录每个处理版本。</p></article>
              <article><span>D6–8</span><h4>对比检索与生成</h4><p>比较 sparse / dense / hybrid、Top-K 与 rerank；固定生成配置，避免同时改太多变量。</p></article>
              <article><span>D9–10</span><h4>红队与验收</h4><p>测试拒答、冲突、越权、恶意文档、过期内容和峰值延迟；输出差距清单、上线门槛与容量估算。</p></article>
            </div>
            <div className="gates">
              <h4>建议的 Go / No-Go 门槛结构</h4>
              <div className="gateList">
                <span>检索 Recall@K</span><span>引用正确率</span><span>关键任务成功率</span><span>P95 / 首 token</span><span>单次成功成本</span><span>越权泄漏 = 0</span><span>更新 / 删除 SLA</span><span>人工接受率</span>
              </div>
              <p>具体数值必须由客户风险与基线共同决定；不要把通用数字写成合同承诺。</p>
            </div>
          </div>

          <div className="subsection qaSection" id="qa">
            <div className="subHead"><span>2.6</span><div><p className="kicker">CUSTOMER QUESTION PACK</p><h3>客户高频问题与深度回答</h3></div></div>
            <p className="qaGuide">现场先给“结论短答”，客户继续追问时再展开“深一层”。每题最后给出售前必须确认的下一问。</p>
            <div className="qaList">
              {qa.map((item, index) => (
                <details key={item.q} open={index === 0}>
                  <summary><span className="qaNo">Q{String(index + 1).padStart(2, '0')}</span><strong>{item.q}</strong><span className="qaTag">{item.tag}</span><span className="plus">＋</span></summary>
                  <div className="qaAnswer">
                    <div><p className="answerLabel">结论短答</p><p>{item.a}</p></div>
                    <div><p className="answerLabel">深一层</p><p>{item.depth}</p></div>
                    <div className="ask"><p className="answerLabel">售前下一问</p><p>{item.ask}</p></div>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="subsection" id="sources">
            <div className="subHead"><span>2.7</span><div><p className="kicker">SOURCE LEDGER</p><h3>本模块的来源与证据等级</h3></div></div>
            <div className="sourceList">
              {sources.map((source) => (
                <a className="sourceItem" href={source.href} target="_blank" rel="noreferrer" key={source.title}>
                  <span className="sourceLevel">{source.level}</span>
                  <span className="sourceTitle"><strong>{source.title}</strong><small>{source.note}</small></span>
                  <span className="sourceDate">{source.date}<br />打开 ↗</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="maintenance" id="maintenance" aria-labelledby="maintenance-title">
        <div className="maintenanceHead">
          <p className="kicker light">MAINTENANCE BY DESIGN</p>
          <h2 id="maintenance-title">时效性不是页脚日期，<br />而是一套内容供应链。</h2>
        </div>
        <div className="maintenanceGrid">
          <article>
            <span className="maintNo">A</span><h3>事实最小单元</h3>
            <p>每条时效性事实记录：结论、适用范围、来源、证据等级、核验日、下次复核日、负责人、替代历史。</p>
          </article>
          <article>
            <span className="maintNo">B</span><h3>三档复核节奏</h3>
            <p><strong>30 天</strong>：模型目录、价格、配额、产品规格<br /><strong>90 天</strong>：协议、平台能力、安全清单、基准<br /><strong>180 天</strong>：原理、方法论、稳定架构模式</p>
          </article>
          <article>
            <span className="maintNo">C</span><h3>只核验变化项</h3>
            <p>先离线筛选超期事实，再只对变化项联网核验；巡检只出报告，不直接改成品。确认影响后再发布新版本，旧结论进入历史。</p>
          </article>
          <article>
            <span className="maintNo">D</span><h3>模块发布门槛</h3>
            <p>有负责人、有来源台账、有客户问答、有验证数据、有风险边界、有变更记录；缺一项则标记为草案。</p>
          </article>
        </div>
        <div className="schema">
          <span>claim_id</span><span>claim</span><span>scope</span><span>source_url</span><span>evidence_grade</span><span>verified_at</span><span>review_by</span><span>owner</span><span>status</span>
        </div>
      </section>

      <footer>
        <div><span className="brandMark">CA</span><strong>云计算 × AI 平台售前知识库</strong></div>
        <p>框架稿 + RAG 示范模块 · 2026-07-17</p>
        <a href="#top">返回顶部 ↑</a>
      </footer>
    </main>
  );
}

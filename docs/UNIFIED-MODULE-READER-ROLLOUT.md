# 其余模块统一阅读壳迁移执行文档

- 状态：待执行
- 冻结基线：`51d604c5abdd0b17b362d1f0a247d400039bd7f6`（2026-08-27）
- 适用分支：`codex/unified-module-reader-rollout`
- 执行者：DSH
- 最终审查者：Codex 主 Agent

## 1. 目标与范围

2026-08-27 的两个提交已经让 Agent、MCP、A2A 共用 `UnifiedModuleScaffold`、`UnifiedModuleHero` 与 `DenseModuleReadingModes`，并补上共享外壳的 CSS 所有权和自动门禁。本次任务把同一契约迁移到其余 20 个正式中文模块，最终让 `app/module-publication.mjs` 中的 23 个正式模块全部使用统一外壳。

已完成、仅做回归的模块：

- `ai-agent`
- `mcp`
- `a2a`

本次必须迁移的模块：

- 通用 `[slug]` 页面：`solution-patterns`、`model-landscape`、`multimodal`、`veadk`、`agentkit`、`evaluation`、`ai-governance`、`security`、`ai-gateway`、`ai-ops`、`predictive-ai-mlops`、`llm`、`fine-tuning`、`llm-training`、`data-engineering`、`ai-infra-platform`、`ai-infra-compute`
- 深度定制页面：`rag`、`prompt-engineering`
- 独立交互页面：`llm-inference`

本次不做：

- 不改英文正文、英文审校状态或英文更新时间。
- 不新增知识事实、来源、问答、证据卡、课程章节或实战任务。
- 不改变模块的 `knowledgeView`、`readingProfile`、正式 slug、标题 ID 或现有稳定正文锚点。
- 纯外壳迁移不刷新 `app/module-publication.mjs` 的 `updatedAt`；只有审查中发现并明确修正了事实、机制、边界、判断或回答，才按项目规则另行刷新。
- 不运行 portable 流程，不提交、不推送、不发布 Sites；由最终审查者决定后续 Git 与发布动作。

## 2. 从今日改动沉淀出的强制结论

### 2.1 页面边界必须由 Scaffold 持有

每个迁移后的模块只允许出现一次：

```tsx
<UnifiedModuleScaffold className={...} hero={...}>
  <DenseModuleReadingModes ... />
  ...
</UnifiedModuleScaffold>
```

`UnifiedModuleScaffold` 独占以下职责：

- `ReadingProgress`
- `UnifiedModuleHero`
- `id="main-content"`
- `data-module-content="unified"`

模块页面不得再直接渲染 `<ReadingProgress>` 或 `<UnifiedModuleHero>`，也不得把共享 Hero 放进模块 `.page`、`.reader`、`.moduleFocused` 等正文根节点内。共享 Header / Hero 与模块正文根必须是兄弟节点。

### 2.2 Header 与 Hero 是固定阅读语法

共享 Hero 的信息顺序固定为：

1. 模块短标题；
2. 中文名与英文名；
3. 一句话定义；
4. 责任定位；
5. 三种阅读方式、问题数、证据卡数；
6. 四项核心判断。

全局导航固定为“首页 / 本模块问答 / 来源 / 术语库 / English（有英文页时）”。模块章节入口只能进入阅读模式目录，不能回到全局 Header。

四项核心判断只能压缩模块已有正文，不得趁迁移新增主张。每项使用短标签和一句短值；桌面与移动端都必须保持四项，不以窄屏为由删除。

页面顶部锚点继续兼容旧链接：通用 `[slug]` 使用 `top`，RAG 使用 `rag`，Prompt 使用 `prompt-engineering`，Inference 使用 `top`；Agent、MCP、A2A 保持现状。页脚“返回顶部”链接必须指向同一个 `anchorId`。

### 2.3 三种阅读模式的职责固定

- `quick`：采用判断、主机制、硬边界；不能复制完整原理章或完整问答。
- `learn`：学习产出、正式章节、工程细节、验证实验；不能再放一份完整问答。
- `field`：客户问答、证据、云责任、Runbook / 现场检查；不能重复完整课程。

所有模块只使用 `DenseModuleReadingModes` 维护模式状态、Tab 键盘行为、Hash 导航、Back、目录当前位置和移动目录。不得保留模块自己的 Tab、桌面目录或移动章节导航。Inference 可以保留一条窄化的 `hashchange` effect，仅用于把 `metric-*` 同步到所选指标和 Inspector；它不能切模式、滚动页面或处理目录。

同一模式的桌面目录与移动目录必须来自同一份 `directories` 数据。所有现有正文锚点继续有效；直接打开 `#anchor` 时先切到所属模式，再滚到目标。

每个模块都必须向 Dense reader 传入一条 `criticalBoundary`，由共享 reader 统一输出 `aria-label="重要边界"` 与 `data-importance="critical"`。通用页使用现有 `brief.criticalBoundary`；专用页使用正文中既有的模块总边界。若旧 quick 内容已经逐字渲染同一条总边界，应移除那一处重复；章节内不同语义的局部边界继续保留。

### 2.4 共享外壳和模块正文必须隔离

- `app/globals.css` 是全部 `--fb-*` Token 的唯一声明者。
- `app/unified-module-reader.module.css` 独占共享 Header / Hero 的文字角色、颜色、断点和交互状态。
- 模块 CSS 只能定义正文语义色，如 `--mcp-*`、`--a2a-*` 或推理工作台自己的局部变量。
- 模块 CSS 不得声明 `--fb-chrome-*`，不得穿透 `[data-module-hero="unified"]`，不得用 `.page a`、`.page h1`、裸 `header/nav` 或 `!important` 影响共享外壳。
- CSS Module 只哈希类名，不形成级联隔离；不能依赖样式加载顺序解决冲突。

### 2.5 内容构图继续按模块保留

统一的是外壳、阅读任务和交互语义，不是正文模板。RAG 的双生命周期、Prompt 的上下文装配、推理热力图、平台控制面、治理复审循环等独有构图必须保留。不得把所有模块改成相同卡片数量、相同章节数或相同首屏图。

### 2.6 React / Next 组件边界

- 页面数据聚合继续留在 Server Component；传给 client reader 或推理交互组件的对象只保留实际使用字段，避免把完整 publication、brief 或来源台账重复序列化到浏览器。
- Dense reader 是唯一的模式导航控制器，也是唯一的全局文档 click 监听者。推理组件移除自己的模式监听；允许的 metric Hash effect 只读当前 Hash 并同步局部交互状态。
- 新拆出的推理子组件定义在模块作用域，不能在父组件函数内部声明，避免每次交互重新挂载和丢失焦点 / 状态。
- 保留 `[slug]` 对 `llm-inference` 的按需动态加载边界；不能因为统一外壳把重交互工作台并入所有通用模块的首包。

## 3. 数据所有权与唯一注册表

`app/module-publication.mjs` 继续作为 23 个正式模块的唯一发布注册表；本次不得新建第二份模块名单、迁移 slug 数组或 route 内的 slug → Hero 映射。Hero 短标题与四项判断属于正文摘要，不把 80 条展示文案塞进 publication 状态 tuple，也不为纯外壳迁移改 `updatedAt`。

Hero 文案按既有内容 owner 存放：

- 17 个通用模块：在各自现有 brief 对象上增加 `hero`，最终都由 `requireModuleBrief(slug)` 返回；不得在 `[slug]/page.tsx` 再写一份 map。
- RAG 与 Prompt：各自在现有专用内容 / 页面 owner 中定义一份模块级 `hero` 常量。
- LLM Inference：在现有 `llmInferenceBrief` 上增加 `hero`，由 `requireModuleBrief("llm-inference")` 读取。
- 已迁移的 Agent、MCP、A2A 不需要为本次任务搬迁数据所有权；只保持当前文案和行为并参加 23 页回归。

通用 brief 的新增字段形状：

```js
hero: Object.freeze({
  shortTitle: "...",
  facts: Object.freeze([
    Object.freeze({ label: "...", value: "..." }),
    Object.freeze({ label: "...", value: "..." }),
    Object.freeze({ label: "...", value: "..." }),
    Object.freeze({ label: "...", value: "..." }),
  ]),
})
```

要求：

- `publishedModules` 仍只从现有 `moduleSpecs` 派生，不新增并行 slug 集合。
- `hero`、`facts` 和每个 fact 对象均冻结；TypeScript 把 facts 约束为四项 tuple，并在运行时测试中检查标签和值非空。
- 中文名、英文名继续来自 `knowledge-map.mjs`；问题数和证据数必须取合并后的正式数据。通用页使用 `brief.qa.length` / `brief.evidenceCards.length`，不能回到某个原始 brief 文件取未合并数量。
- definition、position、critical boundary 继续读取各模块当前内容 owner，不在页面重复维护。
- 页面只消费 `brief.hero` 或专用模块级 hero 常量；不得用 `switch(slug)`、对象 map 或 CSS 特判补齐。

其余 20 个模块的 Hero 文案使用下表。这里的值均为现有正文的压缩表达，不应扩写为新事实。

| slug | `shortTitle` | 四项核心判断（标签：值） |
| --- | --- | --- |
| `solution-patterns` | `Solution` | 采用起点：业务结果 · 当前基线 · 权威终态；架构原则：只增加最小充分闭环所需能力；阶段门：Discovery · PoC · Pilot · Production；经营单位：每个达标业务结果的完整成本 |
| `model-landscape` | `Models` | 选型起点：客户任务 · 不可接受损失 · 交付硬门；候选身份：提供方 · 端点 · 地域 · 精确版本；比较方式：同 Prompt、上下文、工具、Schema 与预算；完成证据：短名单 · 淘汰理由 · 备用路线 |
| `rag` | `RAG` | 采用条件：知识动态、跨源、需权限、引用或撤回；证据条件：权威、当前、适用于当前用户；回答动作：回答、限定、追问、拒答或转人工；完成证据：关键主张可回到原始证据 |
| `multimodal` | `Multimodal` | 采用条件：纯文本基线丢失必要证据；证据链：采集 · 解析 · 对齐 · 推理 · 业务交付；路线判断：专用 · 原生 · 混合同条件比较；发布边界：生成、审核、标识、批准分门验收 |
| `veadk` | `VeADK` | 负责层：Agent 定义与开发期执行；运行对象：root_agent · Runner · Session · Event；工具边界：注册与调用都不授予业务权限；上线边界：本地通过不等于 Runtime 已上线 |
| `agentkit` | `AgentKit` | 交付对象：App · 镜像 · Runtime · 资源绑定；生命周期：Build · Deploy · Cloud Verify；状态边界：Session / Memory 不依赖单容器；上线门：云端回归 · SLO · 恢复与回退 |
| `evaluation` | `Evaluation` | 评估起点：先定决策与目标量，再定分数；被测对象：完整版本 · 任务 · 环境 · 预算；评分分工：代码 · 校准 Judge · 人工裁决；责任边界：Evaluation 给证据，AI Ops 执行动作 |
| `ai-governance` | `Governance` | 治理主键：用途 · 人群 · 决定 · 数据 · 地区；保证循环：登记 · 分级 · 证据 · 复审；批准主体：有权业务负责人接受残余风险；责任边界：安全、评估、运营、法务分别交付 |
| `security` | `Security` | 威胁主线：不可信 Source → 高影响 Sink；模型责任：只形成绑定证据的提案；执行责任：真实身份 · ACL · 确定性授权；恢复证据：遏制 · 取证 · 业务状态 · 补偿 |
| `ai-gateway` | `Gateway` | 采用条件：重复跨提供方控制值得集中；策略面：身份 · 路由 · 限流 · 安全 · 成本；请求证据：命中策略版本 + 端到端 Trace；责任边界：统一策略执行，不接管质量与业务授权 |
| `ai-ops` | `GenAIOps` | 发布单元：代码 · 模型 · Prompt · 索引 · 工具 · 策略；发布路径：回放 · 影子 · 灰度 · 回滚；运营证据：Trace 连接版本、成本与业务终态；真值边界：生产反馈待裁决，不能自动训练 |
| `predictive-ai-mlops` | `MLOps` | 路线条件：结构化预测 + 可验证历史标签；版本链：数据 · 特征 · 代码 · 模型 · 成熟真值；更新规则：漂移先调查，再训练只产候选；生产替换：独立发布门决定，既有动作另行补救 |
| `llm` | `LLM` | 处理单位：Token；生成机制：上下文条件下逐 Token 预测；性能分段：排队 · Prefill · Decode · 端到端；硬边界：流畅不等于事实、权限或动作正确 |
| `prompt-engineering` | `Prompt` | 任务范围：已定义任务的输入表达与验证；装配对象：指令 · 身份 · 证据 · 工具；发布单元：Prompt · 模型 · 上下文 · 工具；执行边界：身份、授权与业务规则留在模型外 |
| `fine-tuning` | `Tuning` | 采用条件：稳定、可重复、可标注的行为缺口；路线前置：先比较 Prompt / RAG / Tool / 换模型；发布单元：数据 + 基座 + Adapter + Tokenizer + 运行镜像；硬边界：不替代实时知识、业务规则或执行权限 |
| `llm-training` | `Training` | 立项条件：差异化数据 + 底座缺口 + 长期训练能力；Run 合同：权重 · Tokenizer · 数据 · 拓扑 · 评估；交付对象：候选模型 + 恢复验证 + 阶段评估；上线边界：Run 完成不等于正确、合规或可运营 |
| `llm-inference` | `Inference` | 发布单元：模型 · Tokenizer · 模板 · 引擎；时间账：排队 · Prefill · Decode；显存账：权重 · KV Cache · 运行余量；验收口径：质量 · SLO · Goodput · 回滚 |
| `data-engineering` | `Data` | 交付对象：可重建、可更新、可撤回的数据产品；身份链：权威来源 + 稳定 ID + 坐标 + 版本；传播责任：状态沿全部派生物传播并留完成证据；授权边界：Security / IAM 与应用执行最终访问决定 |
| `ai-infra-platform` | `Platform` | 建设起点：代表性用户 + 工作负载合同；控制路径：准入 · 排队 · 放置 · 恢复；运营证据：Goodput + 排队 + 重跑 + 成本归属；平台边界：不替代训练、推理、网关、评估或 ROI |
| `ai-infra-compute` | `Compute` | 选型起点：训练 / 推理工作负载包络；瓶颈路径：计算 · 内存 · 互联 · 网络 · 存储 · 设施；验收证据：同一质量与 SLO 下的长跑、缩放和恢复；采购边界：峰值 FLOPS、卡数、显存都不是结论 |

## 4. 按页面家族执行

### 4.1 通用 `[slug]` 页面：一次迁移 17 个模块

主文件：`app/(zh)/modules/[slug]/page.tsx`

操作：

1. 用 `UnifiedModuleScaffold` 替换现有最外层 `<main>`、`ReadingProgress`、`modulePageHero/moduleBriefHero`、`topbar/toplinks` 和本地 `main-content`。
2. Hero 使用 canonical slug、现有 `publication.titleId`、`knowledge-map` 中英文名、`brief.definition`、`brief.position`、正式 QA / evidence 数量，以及 `brief.hero.shortTitle` / `brief.hero.facts`。
3. 用 `DenseModuleReadingModes` 替换 `ModuleReadingModes`。
4. 把 `brief.criticalBoundary` 传给 Dense reader，并移除 quick 中逐字重复的模块总边界；其他章节级边界不动。
5. 保留现有 quick / learn / field React 内容，不复制正文；仅补三份目录数据和完整 Hash 分组。
6. alias 地址继续解析到 canonical slug；Hero、来源、问答和 English 链接一律使用 canonical slug。
7. `solution-patterns` 的 `readingProfile: focused` 保持聚焦正文，不因统一外壳重新拆出重复章节。

通用目录契约：

- `quick`：当前 `SharedModulePrimer` 已渲染的真实标题锚点，加上仍会渲染的 `decisions`；不能把 `knowledgeView` 数据值误当 DOM ID。`solution-patterns` 使用 `principle`；LLM 使用 `llm-theory-primer-title`；Security 使用 `security-threat-primer-title`；Fine-tuning 使用 `fine-tuning-primer-title`；其余 extension primer 使用 `${slug}-extension-primer-title`。
- `learn`：`principle`、`study-guide`、`curriculum`、存在时的 `deep-dive`；`solution-patterns` 因 Primer 已占用 `principle`，改用现有 `mechanism-summary`。
- `field`：`evidence`、`cloud`、`qa`、`related-modules`。
- `qa-*` 自动归入 `field`。

目录必须根据真实渲染条件生成。例如没有 deep dive 时不能出现 `#deep-dive`；`primerOwnsPrincipleId` 导致主锚点为 `mechanism-summary` 时，目录和 `hashGroups` 都必须使用该真实 ID。测试必须从渲染 HTML 证明每个目录 `href` 都存在目标元素，不能只比较字符串数组。

17 个通用模块只改一份路由 JSX，但 Hero 摘要必须回到各自内容 owner。下表是落点和不可丢失的特殊契约；最终 definition、position、QA、evidence 和计数仍统一从 `requireModuleBrief()` 的合并结果读取。

| slug | Hero 内容 owner | quick 首锚点 | 迁移时必须保留 |
| --- | --- | --- | --- |
| `solution-patterns` | `module-briefs-app-protocol.mjs` | `principle` | focused 节奏；Primer 中前 4 个 decision 不重复，路由余项不丢；总边界只显示一次 |
| `model-landscape` | `module-briefs-foundations.mjs` | `model-landscape-extension-primer-title` | 不写易过期的“当前最佳”、价格或目录结论；移动端 spectrum 不溢出 |
| `multimodal` | `module-briefs-app-protocol.mjs` | `multimodal-extension-primer-title` | 五段证据链；生成、审核、标识、批准四道门不能合并 |
| `veadk` | `module-content-agent-platforms.mjs` | `veadk-extension-primer-title` | 与 AgentKit / 云 Runtime 的责任边界；本地通过不是上线证明 |
| `agentkit` | `module-content-agent-platforms.mjs` | `agentkit-extension-primer-title` | `Runtime Ready` 不是生产上线；控制面绑定不等于数据面可访问 |
| `evaluation` | `module-briefs-app-protocol.mjs` | `evaluation-extension-primer-title` | Evaluation 交付决策证据，AI Ops 才执行发布、停止和回滚 |
| `ai-governance` | `module-briefs-governance-mlops.mjs` | `ai-governance-extension-primer-title` | 不新增法律结论；保留业务 Owner、法务及其他保证职能的分工 |
| `security` | `module-briefs-app-protocol.mjs` | `security-threat-primer-title` | 专用 Threat Primer 和 Source → Sink 路径；总边界只显示一次 |
| `ai-gateway` | `module-briefs-platform.mjs` | `ai-gateway-extension-primer-title` | 不把网关写成质量提升器、任意 failover 或最终业务授权者 |
| `ai-ops` | `module-briefs-platform.mjs` | `ai-ops-extension-primer-title` | 页面必须消费 `module-brief-content.mjs` 合并后的 brief，不能绕过应用工程 / FinOps 贡献 |
| `predictive-ai-mlops` | `module-briefs-governance-mlops.mjs` | `predictive-ai-mlops-extension-primer-title` | 成熟真值和独立发布门；`predictive-model-lifecycle` 不是 DOM ID |
| `llm` | `module-briefs-foundations.mjs` | `llm-theory-primer-title` | 专用 Theory Primer、生成 Explorer 和术语提示；slug 不得前缀匹配 |
| `fine-tuning` | `module-briefs-foundations.mjs` | `fine-tuning-primer-title` | 专用 `TuningRouteExplorer` 与四层发布证据；不要求 extension view |
| `llm-training` | `module-briefs-foundations.mjs` | `llm-training-extension-primer-title` | Hero 指标取 completion / depth 扩展合并后的数量，不读原始数组 |
| `data-engineering` | `module-briefs-platform.mjs` | `data-engineering-extension-primer-title` | 自然保留 3 个 deep dive；删除传播与跨境分诊语义不得改写 |
| `ai-infra-platform` | `module-briefs-platform.mjs` | `ai-infra-platform-extension-primer-title` | 控制面 6 步及 RUN / PROVE；不得顺手改 DRA 版本事实 |
| `ai-infra-compute` | `module-briefs-platform.mjs` | `ai-infra-compute-extension-primer-title` | 自然的 7 principles / 7 decisions / 3 evidence，不按模板补卡 |

`solution-patterns` 与 `ai-ops` 虽由 `module-brief-content.mjs` 合并多源内容，`hero` 默认加在各自 base brief，让现有 spread / merge 继承；除非语义确实依赖合并结果，才在 merge 层显式覆盖，禁止两处重复定义。

### 4.2 RAG：保留双生命周期，替换外壳和控制器

主文件：`app/(zh)/modules/rag/page.tsx`

操作：

1. 移除本地 `ReadingProgress`、`ragHero`、`topbar/toplinks`、`skipTarget` 和 `ModuleHeroMetrics`。
2. 使用 `UnifiedModuleScaffold`；定义、定位和四项判断来自现有 RAG 内容与第 3 节契约。
3. 用 `DenseModuleReadingModes` 替换 `ModuleReadingModes`，传入 RAG 既有的总生产边界，不改 RAG 正文顺序和 `RagArchitecturePrimer`。
4. 删除路由本地 `ragEnglishPath`；English 入口由共享 Hero 处理。

RAG Hero 继续使用现有定义“把外部资料整理成当前用户可使用、能核对且可撤回的依据；向量检索只是候选发现手段之一。”；新增的责任定位只压缩现有正文：“位于外部证据与模型回答之间；数据工程生产可追踪知识产物，RAG 负责召回、证据编排、引用与回答验收，业务系统继续负责授权与权威状态。”

Dense reader 的总边界使用现有原句：“检索到不等于回答正确。标准证据还必须进入最终上下文，被模型忠实使用，并且来源本身权威、当前且适用于这位用户。”

目录与 Hash：

- `quick`：`fit`、`knowledge-location`
- `learn`：`evidence-contract`、`evidence-lifecycle`、`model-selection`、`measurement`、`production`、`extensions`、`practice`
- `field`：`cloud`、`evidence`、`qa`、`related-modules`

RAG 的验收重点：直接打开双生命周期、生产控制、具体 QA 锚点时，模式正确且内容不重复；两条生命周期和采用比较仍是独有主构图。

### 4.3 Prompt Engineering：保留上下文装配，替换外壳和控制器

主文件：`app/(zh)/modules/prompt-engineering/page.tsx`

操作：

1. 移除本地 `ReadingProgress`、Hero、全局导航、`skipTarget` 和 `ModuleHeroMetrics`。
2. 使用 `UnifiedModuleScaffold`，移除 `promptEnglishPath`；语言入口由共享 Hero 处理。
3. 用 `DenseModuleReadingModes` 替换 `ModuleReadingModes`，传入 Prompt 既有的模型外控制总边界，并保留 `ModuleExtensionPrimer`、Prompt 装配、失败路由、发布治理、PoC 和现场内容。
4. `context-assembly` 当前只存在于 view 数据和旧 `hashGroups`，不是 DOM ID。给 Prompt 的 Primer 根补真实 `id="context-assembly"`（可给 `ModuleExtensionPrimer` 增加可选 `sectionId`，只由 Prompt 传入），同时保留标题 ID `prompt-engineering-extension-primer-title`；目录使用兼容根锚点，`hashGroups` 同时识别二者。

Prompt Hero 继续使用现有定义“把业务目标、上下文、约束与输出契约翻译成模型可执行的输入，并通过版本、评估和安全控制持续验证；它是系统工程的一部分，不是寻找一句‘万能咒语’。”；责任定位压缩现有正文为：“位于应用输入装配层；负责指令、动态上下文、示例、工具 Schema 与输出契约，身份授权、工具执行和必须执行的业务规则仍由模型外应用负责。”

Dense reader 的总边界使用现有原句：“消息角色与指令层级能帮助模型区分来源，却不是通用安全协议。不同模型 API 的角色、优先级与能力并不完全一致；必须执行的规则应落在模型外。”

目录与 Hash：

- `quick`：`context-assembly`、`quick-triage`；兼容 Hash 另含 `prompt-engineering-extension-primer-title`
- `learn`：`learn-input`、`prompt-foundation`、`message-hierarchy`、`learn-diagnose`、`patterns`、`prompt-diagnostics`、`templates`、`fit-check`、`learn-release`、`version-governance`、`prompt-independent-depth`、`poc`、`concept-map`
- `field`：`evidence`、`cloud-opportunities`、`qa`

Prompt 的验收重点：工具定义与业务授权边界不能因重排而隐藏；`cloud-opportunities` 必须仍能从全站搜索和直接 Hash 到达。

### 4.4 LLM Inference：拆除第二套页面壳，保留交互工作台

主文件：

- `app/inference-module-page.tsx`
- `app/inference-studio.tsx`
- `app/inference-studio.css`

这是风险最高的一组，不能只在现有 `InferenceStudio` 外再包一层共享壳。现有组件同时拥有全局 Header、Hero、模式 Tab、Hash、移动目录和热力图状态，必须拆成“共享页面控制 + 推理内容交互”两层。

操作：

1. `InferenceModulePage` 成为页面装配者，使用 `UnifiedModuleScaffold` 和唯一的 `DenseModuleReadingModes`。
2. 从 `InferenceStudio` 移除 `inferenceTopbar`、全局导航、`inferenceHero`、`main-content`、`modeDefinitions`、模式 Tab、模式状态、负责切换模式的 Hash 逻辑和 `inferenceChapterRail`。
3. 把推理特有内容拆成可传给 Dense reader 的 quick / learn 节点；field 继续由 `InferenceModulePage` 的正式内容装配。
4. 保留热力图、指标 Inspector、OOM 案例、容量实验、学习路线和现场内容的内部状态与键盘语义。
5. “查看容量实验”等跨模式入口改为真实 `href="#capacity-experiment"` 深链，让共享 Dense reader 负责切换模式；不得再维护第二份 `activeMode`。
6. 现有 `#metric-input` 等六个 Hash 是虚拟别名，没有同名 DOM 目标。给对应指标控件补上真实 `id="metric-*"`，并把推理内部 Hash effect 缩小为“同步选中指标与 Inspector”这一项职责；它不得再切换阅读模式或维护第二套目录。这样 Dense reader 负责模式与滚动，推理组件只负责指标状态。
7. 推理目录按真实内容提供给 `DenseModuleReadingModes`：
   - `quick`：`principle`、`latency-heatmap`、`request-timeline`、`selected-metric`、`oom-case` 及 `metric-*`
   - `learn`：`study-guide`、`curriculum`、`capacity-experiment`、`practice` 及 `chapter-*`
   - `field`：`field-guide`、`mechanism-index`、`decision-guide`、`deep-dive`、`evidence`、`boundary`、`cloud`、`qa`、`related-modules`
8. Dense reader 的 `criticalBoundary` 使用 `brief.criticalBoundary`；现场 `boundary` 章节作为深入解释继续保留，两者不能用不同口径互相矛盾。
9. 只删除确认不再引用的推理外壳 CSS；热力图、时间线、Inspector、容量实验和内容布局样式全部保留。

拆分后不得把完整 `brief`、`curriculum`、`learning` 和 `sourceLedger` 一次性传给单个 client 组件。Server 页面先形成各面板真正需要的最小 props；静态 field 正文尽量保持服务端渲染，只有热力图、Inspector、容量实验等真实交互留在 client 边界。

推理验收重点：56 个热力图单元、roving tabindex、Inspector 焦点恢复、OOM 示例、容量实验跳转、直接 Hash、Back、移动目录和 reduced-motion 均不能退化。

## 5. 旧实现清理

全部模块接入后执行：

```bash
rg -n "ModuleReadingModes|<ReadingProgress|<UnifiedModuleHero|modulePageHero|ragHero|inferenceTopbar|inferenceModeTabs" app tests
```

处理规则：

- 中文正式模块不得再导入或渲染 `ModuleReadingModes`。
- 确认无引用后删除 `app/module-reading-modes.tsx`；不得留两套模式控制器。
- 只删除已证明无引用的模块外壳 CSS。`modulePageHero`、`ragHero` 等选择器若仍服务英文页或非模块页面，不得顺手全局删除。
- 已迁移的 Agent、MCP、A2A 不得因共享重构回退；MCP 不能恢复 `.page a { color: inherit }` 或第二套移动章节导航。
- 不新增任何 slug CSS 特判。

## 6. 自动测试必须同步升级

### 6.1 `tests/rendered-html.test.mjs`

把当前“Agent, MCP, and A2A”门禁升级为全部正式模块门禁；测试名也要改成 23 个正式模块的真实语义，在 exact-set 断言通过前不得宣称迁移完成：

- 从 `publishedModules.map(({ path }) => path)` 派生 expected paths；实际带 unified marker 的路径集合必须与它排序后完全相等，不能保留 `>= 3` 或手写第二份模块名单。
- 每个 path 必须同时包含 `data-module-hero="unified"`、`data-module-content="unified"`、`data-module-reader="unified"`。
- 每个页面恰好一个共享 Hero、一个共享正文根、一个共享 reader。
- 检查统一品牌、完整桌面 / 移动导航、三种模式、三种任务语义和重要边界；每个 Hero 的核心判断 `<dl>` 必须恰好渲染四组 `<dt>/<dd>`，不是只检查文案出现。
- 对 20 个本次模块增加代表性稳定锚点断言，确保迁移没有丢正文。
- 对 reader 的每一个目录 `href="#..."` 验证同页存在对应 DOM ID；另行覆盖兼容 alias、空 Hash、`qa-*`、浏览器 Back 和前进。
- 保留推理热力图、容量实验、RAG 双生命周期、Prompt 装配以及现有所有知识质量断言。

### 6.2 `tests/design-language-contract.test.mjs`

- 继续检查 Token 唯一所有者、共享文字角色、Hover / Focus / 移动状态和 Scaffold 兄弟节点边界。
- 把 `UnifiedModuleHeroProps.facts` 收紧为恰好四项的 readonly tuple；测试共享类型契约，并由 rendered test 对 23 个实际页面验证四项非空 label / value。
- 扫描所有使用 `UnifiedModuleScaffold` 的源文件，覆盖 generic route、RAG、Prompt、Inference 装配页以及既有 Agent / MCP / A2A；禁止同文件再出现 `<UnifiedModuleHero>` 或 `<ReadingProgress>`。`InferenceStudio` 不是 Scaffold owner，不得为了凑源文件数量再包一次。
- `scaffoldEntries` 的最终集合必须覆盖上述七个物理 Scaffold owner，不能继续只断言 `>= 3`；如文件拆分，应从源码真实 owner 派生断言，不新增模块 slug 注册表。
- 禁止模块 CSS 声明 `--fb-chrome-*` 或穿透 `[data-module-hero="unified"]`。

### 6.3 `tests/bilingual-pilot.test.mjs`

- 中文模块的 English 入口统一由 `app/unified-module-hero.tsx` 的 `englishModulePath` 提供。
- RAG、Prompt、Inference 和通用 `[slug]` 不再需要各自的语言入口实现；删除要求 `ragEnglishPath` / `promptEnglishPath` 或 route 本地 `englishModulePath` 的旧源码断言。
- 测试改为验证中文物理页面家族使用 Scaffold，并验证唯一的 shared Hero owner 调用 `englishModulePath`；补上 Inference，不能要求每页重复调用语言 helper。
- 不修改英文正文或审校记录。

### 6.4 Localization deferment

共享中文 renderer 变化会改变多个模块的 rendered projection。代码稳定后再更新 `knowledge/localization-deferments.json` 中现有活动 deferment 的 `affectedObjects`，必须由当前真实投影差异生成，不能手填猜测，也不能伪造 closed / ready 状态。

本次在未提交实现上不创建新的 runtime maintenance receipt；若后续正式提交需要登记 runtime maintenance，必须使用项目脚本对干净实现提交记录，并由最终审查者处理。

## 7. 执行顺序与停机条件

执行顺序：

1. 冻结并核对基线、分支和干净状态。
2. 在 17 个通用 base brief、RAG / Prompt 专用 owner 和 `llmInferenceBrief` 中加入第 3 节 Hero 摘要；保持 `module-publication.mjs` 的既有发布 tuple 形状与已迁移三模块的数据所有权不变。
3. 迁移通用 `[slug]`，一次覆盖 17 个模块。
4. 迁移 RAG 和 Prompt。
5. 重构并迁移 LLM Inference。
6. 删除确认无引用的旧控制器与旧外壳样式。
7. 升级测试，刷新真实 localization projection。
8. 运行定向测试、全量 `npm run check` 和人工浏览器 QA。

出现以下任一情况立即停止，不得自行扩大范围：

- 工作区出现不属于本任务的改动或冻结基线漂移。
- 需要改写知识事实、来源、英文正文、正式问答或模块日期才能让迁移成立。
- 稳定锚点无法保留，且改变它会影响全站搜索或历史深链。
- 必须通过 slug CSS、`!important`、第二套 reader 或样式加载顺序才能通过视觉检查。
- localization 状态不能由现有真实差异解释。

## 8. 验证与 Definition of Done

定向验证：

```bash
npm run lint
npm run build
node --test tests/design-language-contract.test.mjs tests/rendered-html.test.mjs
npm run test:bilingual
```

最终门禁：

```bash
npm run check
```

人工浏览器 QA 至少覆盖：

- 视口：`1440×900`、约 `1024px`、`390px`。
- 页面：通用标准模块 2 个、通用 focused 模块 `solution-patterns`、RAG、Prompt、Inference，以及已迁移的 Agent、MCP、A2A。
- Header / Hero：品牌、五个导航入口、短标题、中英文副题、定义、定位、指标、四项判断的计算色值、字号、字重和行高一致。
- 交互：Hover、键盘 Focus、移动菜单、Tab 方向键 / Home / End、目录当前位置、直接 Hash、浏览器 Back、模式切换、reduced-motion。
- 布局：无全局横向溢出；Header 不被正文 CSS 改色；正文独有构图仍可读。
- 内容：QA、证据、云责任、相关模块和更新时间仍可达；没有重复章节、丢失锚点或错误计数。

完成标准：

- 23/23 正式中文模块均使用唯一共享 Scaffold、Hero 和 Dense reader。
- 20 个本次模块的既有知识内容、稳定锚点和专属交互完整保留。
- 源码中不再存在中文正式模块使用的旧 `ModuleReadingModes` 或模块自建 Header / Hero / Tab / 移动目录。
- `npm run check` 通过，定向浏览器 QA 通过。
- 工作区只包含本任务文档、实现、测试和必要的 localization projection 变更；无提交、推送或发布。

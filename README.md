# 云计算 × AI 平台售前知识库

面向具有 Python / API 基础的售前人员，以中文为主、专业术语中英对照。知识库围绕概念、架构判断、证据、云服务连接和客户现场问答组织内容。

当前知识地图包含 23 个正式模块；初始主题曾参照维护者本机 `external_reference/CC-20260717` 中的资料建立归档映射，全局复核后补入预测式 AI 与 MLOps、AI 应用工程、AI 治理以及 AI FinOps 等关键生命周期知识，并按独立决策价值把应用工程并入 GenAIOps、把 AI FinOps 主要并入场景解决方案。PPT 只用于发现线索和查漏，不定义网站章节、知识边界或内容上限。V2 阅读版提供全库搜索、章节导航、阅读进度、交互式机制视图和可筛选客户实战包；RAG、Agent、Prompt Engineering 使用主题定制的深度页面，其余模块继承同一阅读系统。全站来源集中在可搜索的统一 Reference 页面。

## 日常维护与本地运行

日常维护以 GitHub 为唯一源码、历史和协作入口，并由 GPT Sites 呈现公开站点。准备条件为 Node.js 22.13 或更高版本；只有需要 Codex 协作或按需 portable 交接时才需要 Codex。

```bash
npm ci
npm run check
npm run dev
```

`npm run check` 是日常门禁，覆盖代码检查、内容、发布分支回归和网站构建；日常开发用 `npm run check:fast`（约 30 秒），提交前用 `npm run check`。CI 拆为三个 job：`fast`（lint + 类型 + 单测）、`full`（双语 + 构建 + 体积预算 + 渲染测试）、`portable`（仅定时与手动触发）；另有每晚来源链接体检与 Dependabot 每周分组更新。`main` 是唯一生产分支；只有推送到 `origin/main` 的正式变更才用同一精确提交保存和部署 GPT Sites 版本。任务分支可以推送做跨设备同步或可选审查，但不发布公开站点。离线 ZIP、跨机器迁移和私有聊天整理不属于日常发布步骤。

## 分支与多设备维护

- 小而明确、一次完成并准备立即公开的低风险修正，可以在同步后的干净 `main` 直接完成。
- 内容研究、聊天整理和 topic / 链接核验先在私有或只读阶段完成；确认要修改 tracked 正式内容时，跨模块变更、共享文件、依赖、Schema、设计或多轮任务从最新 `origin/main` 创建短生命周期 `codex/<topic>` 分支。
- 同一任务换设备时继续同一远端分支；不同任务才新建分支。只有已通过隐私复核、允许进入公开 Git 的源码 checkpoint 才能推送，新设备使用 `git fetch --prune origin` 和 `git pull --ff-only` 恢复。
- 原始聊天、私有候选和本机资料不会随 Git 同步，也不得为了同步而提交到公开任务分支。私有整理未晋升时，应在原设备完成，或由用户在新设备重新提供材料并重新核验。
- 任务完成后通过 `npm run check`，线性整合到 `main`；只有 `main` 的精确提交可以部署到现有唯一公开 Site。

完整的决策表、聊天 / topic / 链接入口、跨设备命令和异常恢复步骤见 [`docs/REPOSITORY-WORKFLOW.md`](docs/REPOSITORY-WORKFLOW.md)。

只有收到 portable ZIP 或需要离线交接时，才阅读 [`HANDOFF-READ-FIRST.html`](HANDOFF-READ-FIRST.html) 和 [`HANDOFF.md`](HANDOFF.md)，并使用下方按需命令。

## 模块批次打磨

模块深度打磨使用一个用户可见的控制任务，每次只推进一个批次；批次内每个模块由只读 Sub-agent 并行研究，公共内容始终由一个主 Agent 串行整合。对 Codex 说“启动并完成下一个安全的模块打磨批次；除真实阻塞外全程自动继续”即可触发项目 Skill。

这套批次流程与普通本地知识整理不同，必须位于项目自身的干净 Git checkout，才能冻结基线、拦截并发漂移并生成提交证明。`plan.json` 只负责调度，正式模块仍以发布注册表为准。

```bash
npm run module:polish:validate
npm run module:polish -- status
npm run module:polish -- prepare next
```

批次完成定向验证后，主 Agent 暂存本批次快照，再运行全量门禁；门禁通过后只把进度推进为 `complete`，最终提交、推送和 Sites 验证完成后生成本地 seal receipt。完整流程见 `.agents/skills/curate-portable-knowledge-base/references/module-batch-workflow.md`。

## 按需 Portable 与聊天沉淀

Portable 仅用于离线 ZIP、跨机器交接、迁移或需要私有聊天沉淀的任务；不会在常规 GitHub + Sites 发布中自动执行。

```bash
npm run portable:check
```

`portable:check` 会运行 portable 契约、handoff 和相关安全测试。通过后再按实际需求打包或审计。

- `UserPromptSubmit` 与 `Stop` Hook 默认只把可见的用户问题和最终回答保存在 `knowledge/private-inbox/.runtime/`。Hook 绑定经过逐级校验的项目根；有 Git 时拒绝嵌套仓库遮蔽，无 Git 时只接受当前项目根。任何定位、导入或写入失败都不会阻断聊天。完整 transcript 默认关闭；显式启用后也只接受 Codex 会话目录内的真实文件，且仍按不稳定的私有输入处理。
- 已处理记录只有在载荷完整性通过且结果 ID 能解析到真实候选、Claim、模块、来源或发布记录后，才会进入定期原文清理；清理前会再次确认结果仍存在且仍能反向追到该捕获。未处理、受阻或结果已失效的记录不会静默删除。
- `curate-portable-knowledge-base` Skill 在明确请求时负责脱敏、去重、事实核验、更新现有模块内容和来源，并在通过质量门禁后才把知识晋升到公开网站。
- 私有 capture 只在明确启动聊天沉淀或 portable 工作流时处理；闲聊、重复内容、仅助手内容、部分捕获、敏感内容和缺少证据的断言不会自动公开。
- 当前网页的内容架构和视觉系统仍是公开知识的呈现层；portable 能力不会建立另一套页面或改变现有样式。

按需 portable 命令：

```bash
npm run kb:doctor
npm run kb:inbox
npm run kb:validate
npm run kb:handoff-audit -- --audience internal
npm run kb:package -- --audience internal
npm run kb:release-check -- --mode local --audience internal
```

修改 `HANDOFF.md`（仅 portable 交接时）后，同步生成并检查 HTML：

```bash
npm run handoff:build
npm run handoff:check
```

`npm run kb:package` 生成源码级 ZIP 和 SHA-256 清单，默认文件名为 `portable-knowledge-base-yyyymmddhhmm.zip`，日期使用打包机器的本地时间。打包默认排除任意层级的依赖、构建缓存、私有聊天、Git 历史和个人 Sites 绑定。在 Git checkout 中，打包器只读取已暂存的 index 内容：先暂存准备交付的文件，任何 tracked 文件仍有未暂存改动时会拒绝打包，其他 untracked 文件不会进入 ZIP；无 Git 项目则只读取配置中明确允许的路径。只有在自己的已授权环境中才使用 `--include-site-binding`。仓库中的 `.openai/hosting.json` 仍是本项目正式 Sites 构建与发布所需的受控绑定；“默认排除”只指 portable 包，不代表它不进入 Git 或正式构建。

正式分享前必须按实际分发面声明 `internal` 或 `external` audience。附件审计会报告授权状态、当前 SHA-256、嵌入作者元数据、演讲者备注和嵌入文件，但不会自动改写附件；未知授权或同路径内容变化导致的摘要不匹配，在内部交接中保持可见警告，在外部分发中会阻断。公开源仓库属于 `external`，公开 Sites 则审实际 staged artifact；授权记录维护在 `knowledge/attachment-distribution.json`，摘要生成与复核步骤见 `HANDOFF.md`。

整个 `external_reference/` 是维护者本机保留的参考资料区，已由 `.gitignore` 排除，不属于 GitHub 源码交付。不要使用 `git add -f` 强制加入；如需通过其他渠道单独交付，仍须按实际分发对象重新审计授权与文件内容。

## 主要目录

- `app/(zh)/page.tsx`：中文知识库首页与全局知识地图
- `app/(en)/en/`：英文首页、模块、问题、术语、来源与决策工具路由
- `app/knowledge-map.mjs`：9 层架构、23 个正式模块、历史地址别名与稳定路由的统一注册表
- `app/(zh)/modules/rag/page.tsx`：RAG 原理、架构、云服务连接与实战问答
- `app/(zh)/modules/ai-agent/page.tsx`：Agent 原理、受控循环、云上运行与实战问答
- `app/(zh)/modules/prompt-engineering/page.tsx`：提示词、上下文工程、发布治理与实战问答
- `app/(zh)/modules/[slug]/page.tsx`：20 个内容自适应模块及历史地址别名的独立页面入口
- `app/(zh)/glossary/page.tsx`：从统一术语注册表派生的可搜索专业术语库
- `app/module-briefs-*.mjs` 与 `app/module-content-agent-platforms.mjs`：20 个模块的原理、决策、云连接、问答与证据内容源
- `app/rag-content.mjs`：RAG 问答与证据卡内容源
- `app/agent-content.mjs`：Agent 问答与证据卡内容源
- `app/prompt-content.mjs`：Prompt Engineering 问答与证据卡内容源
- `app/module-content-components.tsx`：模块共用的动态证据卡与深度问答组件
- `app/fieldbook-interactions.tsx`：全库搜索、章节导航、机制视图、问答与来源筛选
- `app/fieldbook-v2.css`：历史阅读组件与响应式布局基础；全站颜色统一消费 `globals.css` 的语义 token
- `app/fieldbook-v3.css`：模块、目录与共享阅读组件的当前视觉层
- `app/home-refresh.css`：中英文首页共用的 A / Mist 首页构图
- `app/reference-content.mjs`：全站来源台账与模块来源分组的唯一内容源
- `app/(zh)/references/page.tsx`：所有中文模块共用的 Reference 页面
- `app/globals.css`：基础组件视觉系统与历史兼容样式
- `tests/rendered-html.test.mjs`：内容、导航和构图规则检查
- `docs/CONTENT-DESIGN-STANDARD.md`：后续模块必须遵守的内容与构图规范
- `docs/DESIGN-LANGUAGE.md`：A / Mist 全站颜色、字体、留白、组件和页面家族规则
- `docs/MODULE-BUILD-STANDARD.md`：由 RAG 提炼的模块建设、证据、云服务与验收标准
- `docs/MODULE-QUALITY-GATES.md`：历史问题追溯、防复发机制与新模块 Definition of Done
- `docs/CONTENT-MAINTENANCE.md`：仅供维护者使用的事实台账、复核与发布规则
- `docs/REPOSITORY-WORKFLOW.md`：分支选择、跨设备同步与唯一生产 Site 操作手册
- `external_reference/`：仅保留在维护者本机的参考资料投放区，不进入 GitHub
- `.openai/hosting.json`：公开站点发布配置
- `kb.config.json`：GitHub + Sites 日常发布与按需 portable 的统一配置
- `.agents/skills/curate-portable-knowledge-base/`：按需 portable、聊天沉淀和知识整理 Skill
- `.codex/hooks.json`：本机可选私有聊天采集入口
- `knowledge/attachment-distribution.json`：原始附件的分发授权范围与人工复核台账
- `knowledge/claims/`：动态事实生命周期台账
- `knowledge/module-polish/`：模块批次计划与已验证进度；`.runtime/` 始终保持本地私有
- `knowledge/private-inbox/`：仅本机可见、不会发布的聊天采集区

## 内容维护原则

- 中文正文为主，专业术语首次出现提供准确英文或通行缩写。
- 基础概念讲到当前模块可独立读懂，并回链到唯一的主要归属模块。
- 所有可变事实记录来源和核验日期；不把厂商实验直接写成普遍承诺。
- 每道客户问答标明具体依据、支持范围和边界，并通过稳定来源 ID 回链到统一来源台账。
- 每个技术环节同时说明可能连接的云服务、客户价值和售前发现问题。
- 图、表、代码、案例与问答按理解需要使用，不设数量配额。
- 外部讲义只用于发现知识点和查漏，不沿用其章节顺序、固定框架或结论作为网站内容上限；正文按售前任务重新组织，并用一手来源补充、校正和扩展。

## 页面结构

- 首页：`/`
- 模块页：`/modules/<slug>`
- RAG：`/modules/rag`
- Agent：`/modules/ai-agent`
- Prompt Engineering：`/modules/prompt-engineering`
- 其余正式模块：由知识地图进入 `/modules/<slug>`
- 专业术语库：`/glossary`
- 统一来源台账：`/references`

每个模块独立维护和分享；正文中的证据链接统一跳转到 Reference 页对应来源，不在模块页重复展示完整来源列表。

## 推送与发布

本项目的 Codex 协作规则要求：非 `main` 推送只用于协作，不更新公开站点；每次 `main` 推送后，同一次任务必须把 `origin/main` 的精确提交发布到现有唯一公开站点并确认部署成功。详细规则见 `AGENTS.md`。

## 发布地址

[https://cloud-ai-presales-fieldbook.lijx.chatgpt.site](https://cloud-ai-presales-fieldbook.lijx.chatgpt.site)

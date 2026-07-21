# 云计算 × AI 平台售前知识库

面向具有 Python / API 基础的售前人员，以中文为主、专业术语中英对照。知识库围绕概念、架构判断、证据、云服务连接和客户现场问答组织内容。

当前知识地图把原有主题合并为 19 个正式模块，并与 `external_reference/CC-20260717` 的资料主题建立归档映射。PPT 只用于发现线索和查漏，不定义网站章节、知识边界或内容上限。V2 阅读版提供全库搜索、章节导航、阅读进度、交互式机制视图和可筛选客户实战包；RAG、Agent、Prompt Engineering 使用主题定制的深度页面，其余模块继承同一阅读系统。全站来源集中在可搜索的统一 Reference 页面。

## 本地运行

准备条件：Codex 和 Node.js 22.13 或更高版本。解压项目后，从项目根目录加入或打开 Codex；项目级 Skill 会从 `.agents/skills` 自动发现。首次启用聊天采集时，通过 Codex 的 `/hooks` 检查并信任项目 Hook。

如果你拿到的是同事分享的 portable ZIP，请先阅读 [`HANDOFF.md`](HANDOFF.md)，按“只阅读、聊天沉淀、参与维护”三种身份选择对应流程。

```bash
npm ci
npm run kb:doctor
npm run dev
```

完整检查：

```bash
npm run check
```

本地使用不要求 Git 或 GitHub。没有远端仓库时，知识整理、搜索、构建和 portable 打包仍可工作；公网发布仍需要使用者自己的托管授权。

## 聊天沉淀与 Portable

- `UserPromptSubmit` 与 `Stop` Hook 默认只把可见的用户问题和最终回答保存在 `knowledge/private-inbox/.runtime/`。Hook 绑定经过逐级校验的项目根；有 Git 时拒绝嵌套仓库遮蔽，无 Git 时只接受当前项目根。任何定位、导入或写入失败都不会阻断聊天。完整 transcript 默认关闭；显式启用后也只接受 Codex 会话目录内的真实文件，且仍按不稳定的私有输入处理。
- 已处理记录只有在载荷完整性通过且结果 ID 能解析到真实候选、Claim、模块、来源或发布记录后，才会进入定期原文清理；清理前会再次确认结果仍存在且仍能反向追到该捕获。未处理、受阻或结果已失效的记录不会静默删除。
- `curate-portable-knowledge-base` Skill 负责脱敏、去重、事实核验、更新现有模块内容和来源，并在通过质量门禁后才把知识晋升到公开网站。
- 每轮聊天都会获得处理机会，但闲聊、重复内容、仅助手内容、部分捕获、敏感内容和缺少证据的断言不会自动公开。
- 当前网页的内容架构和视觉系统仍是公开知识的呈现层；portable 能力不会建立另一套页面或改变现有样式。

常用命令：

```bash
npm run kb:doctor
npm run kb:inbox
npm run kb:validate
npm run kb:package
npm run kb:release-check -- --mode local
```

`npm run kb:package` 生成源码级 ZIP 和 SHA-256 清单，默认文件名为 `portable-knowledge-base-yyyymmddhhmm.zip`，日期使用打包机器的本地时间。打包默认排除任意层级的依赖、构建缓存、私有聊天、Git 历史和个人 Sites 绑定。在 Git checkout 中，打包器只读取已暂存的 index 内容：先暂存准备交付的文件，任何 tracked 文件仍有未暂存改动时会拒绝打包，其他 untracked 文件不会进入 ZIP；无 Git 项目则只读取配置中明确允许的路径。只有在自己的已授权环境中才使用 `--include-site-binding`。仓库中的 `.openai/hosting.json` 仍是本项目正式 Sites 构建与发布所需的受控绑定；“默认排除”只指 portable 包，不代表它不进入 Git 或正式构建。

## 主要目录

- `app/page.tsx`：知识库首页与全局知识地图
- `app/knowledge-map.mjs`：7 层架构、19 个正式模块、历史地址别名与稳定路由的统一注册表
- `app/modules/rag/page.tsx`：RAG 原理、架构、云服务连接与实战问答
- `app/modules/ai-agent/page.tsx`：Agent 原理、受控循环、云上运行与实战问答
- `app/modules/prompt-engineering/page.tsx`：提示词、上下文工程、发布治理与实战问答
- `app/modules/[slug]/page.tsx`：16 个内容自适应模块及历史地址别名的独立页面入口
- `app/glossary/page.tsx`：从统一术语注册表派生的可搜索专业术语库
- `app/module-briefs-*.mjs`：16 个模块的原理、决策、云连接、问答与证据内容源
- `app/rag-content.mjs`：RAG 问答与证据卡内容源
- `app/agent-content.mjs`：Agent 问答与证据卡内容源
- `app/prompt-content.mjs`：Prompt Engineering 问答与证据卡内容源
- `app/module-content-components.tsx`：模块共用的动态证据卡与深度问答组件
- `app/fieldbook-interactions.tsx`：全库搜索、章节导航、机制视图、问答与来源筛选
- `app/fieldbook-v2.css`：V2 网页原生阅读与响应式视觉系统
- `app/reference-content.mjs`：全站来源台账与模块来源分组的唯一内容源
- `app/references/page.tsx`：所有模块共用的 Reference 页面
- `app/globals.css`：基础组件视觉系统与历史兼容样式
- `tests/rendered-html.test.mjs`：内容、导航和构图规则检查
- `docs/CONTENT-DESIGN-STANDARD.md`：后续模块必须遵守的内容与构图规范
- `docs/MODULE-BUILD-STANDARD.md`：由 RAG 提炼的模块建设、证据、云服务与验收标准
- `docs/MODULE-QUALITY-GATES.md`：历史问题追溯、防复发机制与新模块 Definition of Done
- `docs/CONTENT-MAINTENANCE.md`：仅供维护者使用的事实台账、复核与发布规则
- `external_reference/`：原始参考资料投放区；内容经核验后才能进入公开来源台账
- `.openai/hosting.json`：公开站点发布配置
- `kb.config.json`：portable、聊天采集、知识整理和可选发布模式的统一配置
- `.agents/skills/curate-portable-knowledge-base/`：项目级知识整理 Skill
- `.codex/hooks.json`：私有聊天采集入口
- `knowledge/claims/`：动态事实生命周期台账
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

本项目的 Codex 协作规则要求：每次代码推送后，同一次任务必须把该精确提交发布到公开站点并确认部署成功。详细规则见 `AGENTS.md`。

## 发布地址

[https://cloud-ai-presales-fieldbook.lijx.chatgpt.site](https://cloud-ai-presales-fieldbook.lijx.chatgpt.site)

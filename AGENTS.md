# 项目协作与发布规则

## 页面结构

- `/` 只维护全局入口、知识地图与学习路径。
- `/glossary` 是全站专业术语库；首页只展示跨模块高频概念，完整中文名、英文名、缩写、简短说明和相关模块统一从 `app/terminology.mjs` 派生。
- 每个知识模块使用独立地址 `/modules/<slug>`，模块正文不得重新堆回首页。
- `/references` 是全站唯一的公开来源台账；所有模块的论文、标准、官方文档、厂商实验与行业指南都按模块汇总在该页。
- 来源标题、链接、证据类别、边界与核验日期只在 `app/reference-content.mjs` 维护；模块内容只引用稳定的 `sourceId`。
- 页面用“相关模块”，不用“模块依赖”。

## 日常 GitHub + Sites 与按需 Portable

- GitHub 是日常维护的唯一源码、历史与协作入口；GPT Sites 是公开呈现与部署目标。`kb.config.json` 仍保存 portable、私有采集和按需交接契约，Skill 或脚本中不得写入本机绝对路径。
- `main` 是唯一生产分支，`origin/main` 的精确提交是唯一公开 Sites 的来源；任务分支、任务 worktree 或 `sites-origin` 不得成为生产源。发布门禁可以创建只读的 exact-commit 临时 worktree，用于验证和打包该 `origin/main` 提交。
- 日常维护、模块打磨与公开发布只运行 `npm run check` 和 Sites 发布门禁；不得因为常规发布自动运行 `kb:doctor`、`kb:validate`、handoff 审计、portable 打包或 `portable-*` 测试。
- `.agents/skills/curate-portable-knowledge-base` 仅在用户明确要求离线 ZIP、跨机器交接、portable 审计，或明确要求整理私有聊天时使用。需要时先运行完整的 `npm run portable:check`，再按实际对象执行打包与分发审计。
- `.codex/hooks.json` 的私有 inbox 仍可作为本机可选采集入口；其内容不构成日常发布输入，始终不进入 Git、网页、构建产物或 portable 包。
- 原始聊天、仅助手内容、部分捕获、敏感内容和未核验断言不得自动晋升。正式内容仍通过现有模块注册表、问答、证据和 Reference 契约进入网站。
- Portable、采集或维护基础设施变更不得顺带重写现有知识正文、页面组件或视觉样式；只有用户明确要求内容或设计变化时才修改对应公开页面。

## 分支与跨设备协作

- 只有范围清晰、低风险、能在一个短会话内完成、无需独立审查且准备立即公开的小修，才可在同步后的干净 `main` 直接修改。跨模块内容、证据来源与事实、共享注册表、路由、依赖、Schema、设计系统、发布流程、多轮或跨设备任务在开始修改 tracked 正式内容时，使用从最新 `origin/main` 创建的短生命周期 `codex/<topic>` 分支；纯私有研究和未确认候选不进入 Git，也不要求提前创建分支。
- 分支按任务而不是按设备划分：同一任务换设备时继续同一远端分支；不同任务新建分支。只有已通过隐私复核、允许进入公开 Git 的源码 checkpoint 才能在切换设备前提交并推送，新设备先 `git fetch --prune origin`，再切换同名分支并 `git pull --ff-only`。私有 inbox、私有候选和本机材料不能借任务分支同步；应在原设备完成晋升，或由用户在新设备重新提供材料并重新核验。
- 非 `main` 分支可以推送，用于跨设备同步、备份或可选审查，但不得触发 Sites 发布。任务分支同样位于公开 GitHub，禁止提交原始聊天、私有候选、秘密、个人信息、本机路径、运行时状态或未核验断言。
- 同一时刻只允许一个写者修改 `app/module-publication.mjs`、`app/module-content-registry.mjs`、`app/terminology.mjs`、`app/reference-content.mjs` 和其他共享所有者文件；发生并行任务时串行整合，不自动 stash、reset、覆盖或 force-push。
- 任务分支先吸收最新 `origin/main`，再完成 `npm run check` 和所需人工复核，并以 fast-forward、rebase 或 squash 的线性历史进入 `main`。合并并发布成功后删除该任务分支；不确定是否已吸收的历史分支先保留并审计。
- 完整操作手册见 `docs/REPOSITORY-WORKFLOW.md`。

## 推送与公开发布

- 经用户确认且已达到发布条件的正式知识库内容、配置或维护规则变更，必须在同一次任务中整合到 `main`，完成 Git 提交、推送和公开发布；计划、调研、无改动检查、未确认草稿和任务分支 checkpoint 不触发公开发布。
- Codex 对本项目执行非 `main` 分支推送后不得更新公开站点；执行 `main` 推送后，必须在同一次任务中更新公开站点，不得只停留在 GitHub。
- 推送 `main` 前运行 `npm run check`（构建、网站与内容检查、代码检查、类型检查）；日常开发用 `npm run check:fast`（约 30 秒），提交前用 `npm run check`。`npm run portable:check` 只在需要 portable 时运行。推送后确认本地 `main`、实时 `origin/main` 与目标提交一致，再运行 `npm run sites:release-check` 生成同一提交的发布候选；该门禁必须拒绝非 `origin/main`。
- 公开站点必须使用刚刚推送到 `origin/main` 的精确提交生成 Sites 版本，部署到现有唯一项目，并轮询到发布成功；不要为分支或设备创建第二个正式 Site。
- 发布成功后打开并交付公开地址：`https://cloud-ai-presales-fieldbook.lijx.chatgpt.site`。
- 如果 `main` 推送成功但公开发布失败，旧站保持在线，任务不得标记完成；必须说明失败环节、未对齐的提交和当前可恢复状态。

## 内容同步

- 模块正文发生变化时，同步检查客户高频问题、深度回答、证据卡和 Reference 台账。
- 自 2026-07-20 起，模块发生事实、机制、边界、判断或回答的实质变化时，只刷新 `app/module-publication.mjs` 中该模块的 `updatedAt: "YYYY-MM-DD"`，模块页仅在顶部或底部显示一次最近更新时间；课程章节、独立深挖块、实战任务等正文不显示逐条日期。只有整道新增的客户问答设置 `addedAt: "YYYY-MM-DD"` 并显示“新增于”；后续改写既有问题不刷新 `addedAt`。历史内容不回填，纯排版、样式或格式调整不刷新模块日期。
- 新模块加入知识地图时，同步建立独立页面、稳定 slug、Reference 分组与路由检查。
- 不把编辑说明、维护规则、发布流程或构建信息展示在读者页面。

## 模块质量门禁

- 后续模块必须同时遵守 `docs/MODULE-BUILD-STANDARD.md` 与 `docs/MODULE-QUALITY-GATES.md`；历史反馈、代码控制、自动检查和人工复核在质量门禁中追溯。
- `app/module-publication.mjs` 是正式发布模块的唯一状态与内容契约入口；首页入口、专用路由和测试名单必须从它派生，不得分别硬编码。
- `app/module-content-registry.mjs` 统一登记已发布模块的客户问答与证据数据；新增正式模块时必须同步注册，不能在测试里另建模块名单。
- 专业术语在 `app/terminology.mjs` 维护稳定中英名称。未来英文版共享概念 ID 和来源关系，但英文文案必须独立撰写、独立专业校对。
- 新建或进入全面呈现重构的中文模块，必须通过共享 `UnifiedModuleScaffold`、`UnifiedModuleHero` 和 `DenseModuleReadingModes` 提供全局导航、Hero 与按内容和读者任务决定的一个或多个阅读视图；标题、重要边界和动态卡片继续优先使用 `moduleHeroTitle`、`CriticalBoundary`、`BalancedGrid` 与 `balanceRows`，不得为单个模块复制 Header / Tab / 目录控制器，或增加固定数量布局与模块 ID CSS 补丁。
- 共享 Header / Hero 的颜色、字体与交互状态只由 `globals.css` 的 `--fb-chrome-*`、`--fb-font-*` 和 `unified-module-reader.module.css` 管理。模块 CSS 不得覆盖这些 Token，不得用 `.page a` 等页面根裸标签规则重置共享外壳，也不得穿透 `data-module-hero="unified"`；新增系统性视觉问题时必须同步更新 `tests/design-language-contract.test.mjs`。
- 知识页面默认匿名可读，不引入 Login、个人会话或用户状态依赖；本仓库是源文件与必要资产的唯一事实源，不依赖临时目录、本机绝对路径或部署产物。
- 图、卡、表、案例、问答和来源均按知识需要决定数量；不为排版凑数，也不以交付包大小为理由删减概念、边界或证据。
- 每次出现新的系统性问题，修复当前页面的同时更新质量追溯矩阵、共享规则和可自动化的回归检查，并复核其他已发布模块。

## 模块批次打磨

- 批次计划只维护在 `knowledge/module-polish/plan.json`，并由 `npm run module:polish:validate` 与 `app/module-publication.mjs` 的实时模块集合校验；它只负责调度，不得成为第二份模块注册表。
- 启动下一批前运行 `npm run module:polish -- prepare next`；恢复未完成批次先运行 `status`，再按已有批次 ID 继续。每批的模块范围与并行度由复杂度、共享文件冲突和可用审查能力决定，不设数字硬上限。
- 模块 Sub-agent 默认只读，分别返回机制、边界、证据、重复项、双语和文件影响工作包；公开正文、共享注册表、术语、Reference、Claims、测试、审校记录、Git 与 Sites 只由批次主 Agent 串行整合。
- 同一批次必须冻结 Git 基线、计划摘要和关键文件摘要；工作区存在未纳入本批次的改动、基线漂移、来源冲突、责任归属不清或稳定 ID/日期异常时立即暂停，不得自动 stash、reset、覆盖或扩展范围。
- 每批依次通过并行只读研究、证据门、单写者整合、独立英文审查、定向验证和全量门禁。上一批未进入已完成进度前，不启动下一批写入。独立英文审查的产物是 `knowledge/localization/status.json` 里对应模块从 `deferred` 改为 `aligned` 并更新 `enSyncedCommit`；中文侧变化用 `npm run localization:diff -- <slug>` 查看。
- 默认在一个用户可见的控制任务内逐批执行，并按模块派发只读 Sub-agent；只有用户明确要求或批次确需更强隔离时才创建独立 Worktree 批次任务。前一非校准批次的 seal receipt 必须与当前 `HEAD` 一致，任务隔离不能替代共享内容的单写者规则。

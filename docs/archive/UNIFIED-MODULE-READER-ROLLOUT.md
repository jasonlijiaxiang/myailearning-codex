# 统一模块阅读器收口与发布记录

- 状态：23 个模块的统一迁移基线已在 `origin/main`；本轮运行时实现、视觉/测试/文档收口、最终验证和代码审查已完成，推送和 Sites 发布待完成。
- 迁移基线：`origin/main` 的 `21046ef`（2026-08-31 审核时）。
- 工作分支：`codex/unified-module-reader-rollout`。
- 范围：中文正式模块的阅读器运行时、服务端可读性、目录派生和正文排版；不改知识事实、来源、英文正文、问答、稳定锚点或模块发布时间。

## 1. 已完成的迁移基线

`origin/main` 已让全部 23 个正式中文模块使用统一的阅读壳：17 个通用 brief 模块，以及 AI Agent、MCP、A2A、RAG、Prompt Engineering、LLM Inference 六个专用模块。它们共享 `UnifiedModuleScaffold`、`UnifiedModuleHero` 与 `DenseModuleReadingModes`，但继续保留各自的机制视图、阅读节奏和稳定深链。

因此，本轮不是再次迁移内容或重写 23 个页面；它是对已统一基线的发布级收口，消除通用路由的旧阅读器回退，补齐无 JavaScript 的阅读路径，并统一检查正文可读字号。

## 2. 本轮收口记录

### 2.1 通用路由不再回退

通用中文路由 `app/(zh)/modules/[slug]/page.tsx` 现在无条件装配 `UnifiedBriefModulePage`。它不会再根据是否存在配置回退到 `ModuleReadingModes`、本地 Header / Hero 或另一套目录。

每个已发布的通用 brief 必须能取得 `getUnifiedBriefModuleConfig(canonicalSlug)`；缺失时路由明确报错，而不是悄悄以旧读者呈现。已确认无生产引用的 `app/module-reading-modes.tsx` 随之删除。

### 2.2 目录由真实渲染条件派生

`buildBriefModuleDirectories()` 是通用 brief 阅读器的目录构造点：

- `quick` 由实际 Primer（如有）和方案判断组成；
- `learn` 使用配置给出的真实机制锚点、学习路线、知识地图，并且仅在 `brief.deepDives` 真正存在时加入 `deep-dive`；
- `field` 固定指向证据、云责任、客户问题和相关模块。

这避免了目录给出未渲染的 `#deep-dive`，也避免 Primer 占用 `principle` 时把读者带向错误锚点。稳定锚点和别名仍由各模块已有正文承担；本轮不重命名它们。

### 2.3 注册表与展示配置的边界

`app/module-publication.mjs` 仍是唯一的正式发布注册表，决定模块身份、路径和发布范围。`app/unified-brief-module-config.mjs` 仅是通用阅读器的展示投影：短标题、按模块需要呈现的 Hero 判断、Primer 目录项和机制锚点。

展示配置不导出并行 slug 名单，也不能成为发布入口、内容所有者或隐式路由白名单。通用路由通过正式模块解析 canonical slug，并对缺失展示配置失败关闭；新增模块必须先进入 `publishedModules`，再补齐其阅读器展示投影。

### 2.4 无 JavaScript 时仍可连续阅读

`DenseModuleReadingModes` 的服务端初始 HTML 同时包含模块声明的全部阅读任务面板。`quick`、`learn`、`field` 是可复用预设，而不是每个模块必须拥有的固定集合。浏览器完成客户端增强后，才在下一帧按当前任务折叠非活动面板；Tab、Hash、目录、高亮、Back / Forward 和受控定位仍由同一 reader 接管。

这使禁用 JavaScript、脚本延迟或 hydration 尚未完成时，读者仍能从服务器返回的正文连续获取该模块声明的全部阅读内容。渲染回归会检查每个正式路由的全部任务面板在初始 HTML 中均未带 `hidden`。

### 2.5 正文字号收口

本轮把专用页面和共享问答中的正文类型字号纳入强制修复范围：连续正文、问答、表格正文、机制解释和现场检查文本最低为 16px；次级说明、来源说明和辅助标签最低为 14px。图表刻度、纯装饰性小标签与非正文控制不作为正文字号的替代品。

CSS 变更必须同时覆盖桌面与窄屏的最终生效规则，不能只提高基础规则后又由移动断点降回 9–14px。最终浏览器 QA 将用真实长文本检查行宽、断行、表格横滚、重叠和全局横向溢出。

## 3. 不变的内容与本地化边界

- 不改 `module-publication.mjs` 的 `updatedAt`：本轮是 renderer、可达性和排版修正，不是知识内容修订。
- 不改英文正文、英文审校状态、正式问答、来源、证据卡或模块内容 owner。
- 不改历史本地化 deferment / maintenance receipt 的文本、哈希或文件清单。它们必须能从各自的历史提交独立重建。
- 本轮 renderer 实现稳定并形成精确实现提交后，才使用项目审计脚本另建不可变的 `document-shell` runtime-maintenance receipt；不得手工改写旧 receipt 或把 runtime maintenance 表述为英文内容已审校。

## 4. 自动门禁与人工复核

本轮实现必须由以下检查证明，而不能只依赖源码搜索：

1. `tests/rendered-html.test.mjs` 从真实服务端渲染验证全部正式模块均有唯一共享 Hero、正文根和 unified reader，并验证每个模块声明的任务面板在 SSR 初始 HTML 都可读。
2. `tests/design-language-contract.test.mjs` 验证通用中文路由失败关闭、目录派生、没有旧 reader 分支，以及共享 reader 的渐进增强语义。
3. `tests/bilingual-pilot.test.mjs` 保持中英文入口和 renderer 责任边界，不把本轮 runtime 变化误判为英文正文变更。
4. 定向 lint、构建和最终 `npm run check` 必须通过；本轮已通过最终全量门禁，单次构建只作为过程证据，不能替代该门禁。
5. 浏览器在 `1440×900`、约 `1024px`、`390px` 复核通用标准页、focused 页和专用模块：无 JavaScript 初始阅读、模式切换、Hash、Back / Forward、移动目录、字号、表格与全局横向溢出。

## 5. 发布前后顺序

1. 完成 CSS、定向测试、全量门禁和浏览器 QA，处理审查发现的问题。
2. 将实现整理为精确提交；在干净工作树上记录本轮 renderer maintenance receipt，并提交该回执。
3. 审查相对 `origin/main` 的完整 diff，确认只包含本任务实现、测试、文档和必要的 runtime-maintenance 记录。
4. 更新 `main` 并推送；推送前再次确认远端没有新的线性提交需要整合。
5. 推送 `main` 后运行 `npm run sites:release-check`，使用与 `origin/main` 完全相同的提交发布 Sites，并在公开地址验证页面。

在第 4、5 步完成前，本记录不得声称已经提交、推送或发布。

## 6. 完成条件

- [x] `origin/main` 的 23 个正式中文模块已处于统一阅读器迁移基线。
- [x] 通用路由已移除旧 reader 回退，并以缺失配置失败关闭。
- [x] 通用目录已根据展示配置和真实 `deepDives` 条件派生。
- [x] 服务端初始 HTML 保留模块声明的全部阅读内容，客户端再渐进折叠。
- [x] 专用页面与共享正文的 16px / 14px 可读性下限完成并通过真实视口复核。
- [x] 定向测试、`npm run check`、浏览器 QA 和代码审查完成。
- [x] 实现与不可变 runtime-maintenance receipt 已提交。
- [ ] `main` 已推送，Sites 已使用同一精确提交公开部署并验证。

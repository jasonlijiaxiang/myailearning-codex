# 中文单线交付与英文延期契约

状态：`implemented-v3`（2026-08-09 补充可重建的英文运行时维护记录；机器契约见 `knowledge/localization-deferments.json`）

## 1. 目的与边界

本轮知识正文只增强中文。英文模块正文必须保留在最后真实英文同步状态，中文变化不能被误报成新的双语 PASS，也不能因为共享来源、模块路由或日期变化而静默影响英文模块页。`/en/questions` 只允许修复既有死锚和失实导航承诺，不新增模块知识断言；该全局目录不属于逐模块 effective 哈希，单独由渲染回归检查约束。

延期是内部审计状态，不展示到读者页面；它不是跳过英文检查的通配豁免。

## 2. 核心不变量

1. `app/i18n/en/**` 的 authored 文件哈希保持基线。
2. 英文模块、真实英文日期、实际渲染使用的模块路由属性与共享来源元数据共同形成 module effective 哈希，并保持基线。
3. 未延期模块的中文完整状态、英文状态和历史审校文件都必须与模块基线一致。
4. 延期模块的当前中文对象差异必须与登记表逐项、逐哈希完全相同；漏登记和伪登记都失败。
5. 每个模块最多一条活动延期，避免按 slug 覆盖多条记录。
6. 历史双语审校文件按文件路径和字节哈希保持不可变，且其中的中英文 scope 哈希必须可核验。
7. `deferred` 状态不允许任何英文哈希或 `englishUpdatedAt` 漂移，也不允许写入英文候选。
8. `ready-for-english-review` 只接受已登记的英文候选哈希和真实候选审校文件；它仍不是发布对齐状态。
9. `closed` 不再提供例外；只有通过真实四阶段 PASS 审校并以原子关闭命令同时提升模块基线后才能关闭。

## 3. 基线与快照范围

本次登记使用按模块、按语言拆分的可重建基线。8 个在 `origin/main` 已存在的中文延期保留 `671072cae7bb3ffcde366713eb421e65c2e9cbc1` 作为中文起点，并使用 `d58403b6e939cb3f24f936caa763ea448098f748` 作为英文有效视图起点；其余模块中英文均以 `d58403b6e939cb3f24f936caa763ea448098f748` 为起点。这样既不吞掉既有中文债务，也不把后续已发布的英文运行时修订误算为本轮漂移。

登记表中的顶层 `baselineCommit`、每模块 `zhBaselineCommit` / `enBaselineCommit`、延期 `openedFromCommit` 与历史关闭的 `promotedCommit` 都必须是完整 40 位 SHA、当前 `HEAD` 的祖先，并能从提交归档重建。日常与推送前审计要求它们已提交且可从本地历史重建；推送后的 Sites release gate 通过 `KB_RELEASE_COMMIT`（或显式 `npm run audit:localization:remote`）额外要求全部 SHA 已从远端跟踪分支可达，避免关闭流程在推送前形成循环依赖。

每个模块保存：

- `zhReviewHash`：模块基线中保存历史四阶段审校实际覆盖的中文 scope 哈希；新候选使用覆盖完整中文 effective state 的当前哈希，不再只绑定 publication 与 QA 注册表。
- `zhStateHash`：模块当前中文完整状态哈希。
- `zhObjects`：稳定 JSON Pointer 对象目录，覆盖 publication、正式内容、brief、curriculum、learning、必需术语、模块扩展视图、相关知识地图对象、模块实际引用的来源、相关 Claim、中文共享渲染器与实际可见投影。
- `zhRendererFiles`：该模块中文页面在基线提交中实际使用的入口与本地可见组件闭包；brief 路由与 dedicated 路由按模块分别记录，不把未执行的通用入口算入专用页。
- `enAuthoredHash`：英文模块文件字节哈希。
- `enEffectiveHash`：英文模块、真实英文日期、实际可见 section/evidence/QA 投影、共享英文模块渲染器、模块扩展视图、知识地图关系，以及 `/en/references` 实际使用的英文来源投影哈希。
- `enReviewHash`：历史审校实际覆盖的英文模块哈希。
- `enRendererFiles`：该模块英文页面在基线提交中实际使用的 route wrapper、布局与本地可见组件闭包。
- `englishUpdatedAt`：逐模块最后真实英文同步日期。
- `reviewFiles`：历史审校文件路径、字节哈希及其中的中英文 scope 哈希。

对象目录对数组同时记录顺序摘要和带零填充的项目位置；新增、删除、修改或顺序变化都会形成可核验差异。

## 4. 登记结构

`knowledge/localization-deferments.json` 使用 `localization-deferment/v3`，schema 位于 `knowledge/schemas/localization-deferment.schema.json`。

每条延期包含：

- 稳定 `defermentId`、正式 `moduleSlug`、`zh-CN → en` locale 与状态。
- 完整可达的 `openedFromCommit`、决定 ID、原因和 locale requirement。
- 已知 Stage 0 `candidateIds` 与历史批次 `workItemIds`。
- 精确 `affectedObjects`：对象 ID、类型、`added|modified|deleted`、基线哈希、当前哈希和来源 ID。
- 不可变 `baselineReviewIds`、可解析 `localeGateReceipt` 与关闭条件。
- ready 状态使用的 `englishCandidate`（含候选中英文 renderer 文件闭包），或 closed 状态使用的关闭日期、不可变 `promotedCommit`、审校 ID 与关闭回执；非 closed 状态禁止携带任何关闭字段。

新增对象必须是 `baselineHash=null/currentHash=sha256`；删除对象相反；修改对象必须有两个不同的完整 SHA-256。语义检查在 schema 之上执行这些条件与实际差异的集合相等验证。

`runtimeMaintenances` 仅记录英文 reader runtime 的受控维护，不改变任何模块 baseline 或 deferment 状态。每条记录都固定：前一提交、实现提交、对应 receipt、实现提交中准确变更的 renderer 文件、由真实 import closure 推导的受影响模块、明确的可见投影模块和 metadata 范围。`scripts/audit-localization-deferments.mjs --record-runtime-maintenance …` 只能在干净的实现提交上执行；审计会从父提交与实现提交的 archive 重建状态，要求英文 authored/review/date 和历史 review files 完全不变，并且只能更新实际 renderer closure/effective hash。它不能将 `deferred` 转为 `ready-for-english-review` 或 `closed`。

## 5. 状态机

### `deferred`

- 当前中文必须相对基线存在真实差异。
- 实际对象差异与 `affectedObjects` 完全相等。
- 英文 authored、effective、review 哈希和日期全部等于基线。
- 输出 `DEFERRED/NOT_ALIGNED`。

### `ready-for-english-review`

- 中文对象差异仍需完全登记。
- 英文当前状态必须精确等于 `englishCandidate`，且与旧基线确实不同。
- 候选必须显式登记覆盖完整中文 effective state 的当前 `zhReviewHash`，且四个候选审校文件必须通过完整 review schema，分别覆盖 `xhigh-author`、`xhigh-semantic`、`xhigh-language`、`ultra-exception`；所有 deterministic gate 都必须 PASS，rubric 与 attempt 必须在 schema 范围内，顶层 verdict 才能为可发布 PASS。
- 输出 `READY/NOT_ALIGNED`，仍不得作为已对齐发布证据。

### `closed`

- 必须保留 `englishCandidate`、`closedAt`、与候选完全相同的 `closureReviewIds`、不可变 `promotedCommit`，以及决定 ID 匹配的 closure receipt。
- `scripts/audit-localization-deferments.mjs --close-and-promote <slug> --closure-receipt <id> --closed-at YYYY-MM-DD` 只接受已经通过 ready 门的模块和干净工作区，并从当前已提交的 `HEAD` 重新归档、重建与精确比较中英文状态后再同时提升基线和关闭；不能把未提交内容归属给 HEAD，也不能先伪造 closed 再覆盖基线。
- closed 记录不进入活动延期集合；每条历史记录都按自己的 `promotedCommit` 重建候选状态和四阶段 PASS，不错误绑定到该模块未来的新基线，因此同一模块可保留多轮关闭历史。

## 6. 日期与共享运行时

- 中文 `updatedAt` 继续只在 `app/module-publication.mjs` 维护。
- 英文页面读取 `app/english-update-dates.mjs` 的逐模块真实日期；中文更新不刷新英文日期。
- 共享来源的既有 ID 不做静默内容替换。需要刷新且只供本轮中文内容使用时，新建带核验日期的 sourceId，保留英文引用的旧 ID 与元数据。
- 英文 module effective 哈希只包含英文模块页实际读取的来源字段，不纳入纯中文说明；renderer gate 从该模块真实 wrapper 与布局出发递归解析本地可见组件闭包，并覆盖交互、深挖关系、可视化、判断辅助代码和可见投影，防止“英文数据没改、模块页却变了”的漏报。
- 中文完整状态同样从该模块真实入口递归解析本地可见组件闭包：brief 页使用 `[slug]` 入口，RAG、Agent 与提示词工程使用各自 dedicated 入口和 flagship lab；不把未执行的通用入口误算给专用页。每个基线与候选固化当时的精确文件清单，但历史重建不能盲信该清单：审计必须在声明提交中使用 `module-renderer-dependencies/v1` resolver 重算 canonical 闭包并逐项相等，拒绝缩短清单、绝对路径、`..`、非法扩展、符号链接和项目外文件。未来 resolver 演进必须新增契约版本并显式迁移，不能静默改写 v1 语义。CSS-only 呈现变化不纳入语义哈希，继续由构建、渲染与真实浏览器回归约束。
- 共享英文页面、布局或 metadata 改动会影响英文 effective hash 时，不能手改 21 个 module baseline，也不能把 `shared-runtime-decoupling` 当通配豁免。先把只含 runtime 文件的实现提交 C 形成干净工作区，再以 `--record-runtime-maintenance` 写入子提交 D；D 的 audit 必须继续输出 `DEFERRED/NOT_ALIGNED`，而已对齐模块会明确输出 `ALIGNED/RUNTIME-MAINTAINED`。后续实际英文内容漂移仍须走四阶段审校和候选/关闭状态机。

## 7. 审校记录规则

`scripts/generate-bilingual-review-records.mjs --check` 验证历史 84 份记录的中英文 scope 哈希；它不忽略延期模块的中文哈希。

`--write` 永久拒绝自动生成 PASS，防止把静态模板或旧英文对新中文伪装成独立审校。未来完成英文独立撰写后，四阶段审校必须在独立流程中形成新的 review ID，再在 `englishCandidate.reviewIds` 登记。

`--write-baseline` 已禁用。未来关闭顺序为：独立英文写作与四阶段审校 → 登记 `englishCandidate` 并通过 ready 门 → 将候选代码与审校记录提交为本地候选提交 C → 建立匹配决定的 closure receipt → 在干净的 C 上使用 `--close-and-promote` 原子关闭并提升该模块基线 → 将登记变化提交为 C 的子提交 D → 在 D 上重跑全量门禁 → 一次性推送 D（C 随父历史同时可达）→ Sites release gate 核验远端可达并只发布精确 D。这样不会先公开 `READY/NOT_ALIGNED` 候选，也不会违反“任何 push 同任务必须发布 Sites”的规则。

## 8. 自动回归

`tests/localization-deferment.test.mjs` 至少覆盖：

- 完整递归 schema 与 21 模块基线覆盖。
- 漏登记、伪登记、空哈希、相同修改哈希、重复活动记录。
- 未知 candidate、receipt 与 source 引用。
- deferred 英文内容和日期漂移。
- ready 候选哈希、完整 review schema、四阶段集合、PASS verdict、审校 scope 与真实差异。
- review schema 的条件分支、deterministic FAIL、数值边界，以及完整中文 effective review scope。
- 伪造 closed、非 closed 偷带关闭字段、缺失审校和未提升基线；reviewed ready → promoted closed 的正向状态迁移；以及同一模块多轮关闭后历史快照仍可重建。
- 任何自动写 PASS 的尝试。
- 从每个声明 Git 提交重建并核对模块基线。
- 中英文逐模块 renderer import 闭包、dedicated/brief 入口隔离、间接组件变更、基线固化文件清单、可见 QA/evidence/section 投影与全局英文来源视图。
- runtime maintenance 的 receipt、直接父提交、准确变更文件、derived affected closure、内容/日期漂移拒绝、后续 drift 拒绝，以及 runtime overlay 不改变 19 条 deferment 的状态。
- 行级 `ALIGNED` 与 `DEFERRED/NOT_ALIGNED` 输出，避免子串假阳性。

日常 `npm run check` 必须继续运行完整英文审计、本地化审计、构建与渲染测试；不得关闭或放宽这些检查来获得绿色结果。发布候选还必须在已推送精确提交上运行远端 provenance 门。

## 9. 当前登记结果

当前 21 个模块都有可从 Git 重建的基线。按真实 route/import 闭包核算后，19 个模块各有且只有一条活动延期，共 500 个自动生成并核验的对象差异；RAG 与提示词工程的 dedicated 页面没有执行本轮变化的通用 `[slug]` 入口，因此保持严格 `ALIGNED`，不再被共享 renderer 假阳性污染。仅共享渲染器发生变化的模块仍明确登记为 `shared-runtime-decoupling`。

未来英文同步必须独立撰写、独立专业审校、登记候选哈希并通过 ready 状态，随后提升模块基线、关闭延期并重新运行全量门禁。

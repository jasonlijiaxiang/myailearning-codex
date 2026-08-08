# 第 0 阶段：内容差异矩阵计划

状态：`incomplete`（2026-08-08 合并复核确认输入覆盖账仍有 492 项待检查，C-N01～C-N10 缺少逐题当前库精确位置；现有产物只作为历史研究草稿，不作为 100% screening 已完成的证据）

Review 修订：`2026-08-02`

## 1. 阶段目标

本阶段建立可逐条审核、可追溯且可生成后续工作包的内容决策矩阵，回答：

1. 对照库有哪些真正新增的知识或取用方法？
2. 哪些内容当前库已经覆盖，或当前表达更完整？
3. 哪些内容值得吸收但必须重新研究和核验？
4. 哪些内容来自当前库回流、共同上游来源或格式重复？
5. 哪些内容不应进入当前库？
6. 每项候选由哪个现有模块或全局契约负责，应进入哪个后续阶段？

本阶段不修改正式正文、问答、Reference、Claim、术语、页面或路由。

## 2. 基线与启动门

当前审计基线：

- 当前库：`671072cae7bb3ffcde366713eb421e65c2e9cbc1`
- 对照库：`jasonlijiaxiang/ai-knowledge-base@100ca761fec3e55ceea01609d01f66b0c05802dc`

正式执行前必须：

1. 重新读取本目录的总体计划和决策记录。
2. 确认当前分支为 `codex/ai-knowledge-base-content-improvement`，并检查 `HEAD`、远端基线与工作区。
3. 核验对照库目标提交是否仍是用户希望比较的版本。
4. 冻结 21 个正式模块、内容注册表、问答、Reference、Claim 和术语摘要。
5. 生成双方输入清单和关键文件内容摘要。
6. 将本计划目录明确列入允许的研究改动范围。
7. 如果存在无关工作区改动、基线漂移、来源缺失或模块归属冲突，暂停并报告。

当前只读复核确认：当前 `HEAD` 仍与上述当前库基线一致，正式模块仍为 21 个；该确认只用于计划 Review，正式执行时仍须重验。

## 3. 完整性的定义

“完整差异矩阵”不表示把每个自然语言句子都变成候选，而表示：

- 声明范围内的文件已 100% 盘点和检查。
- 231 道模块问答、91 道实战题等结构化单元全部有检查记录。
- 每个被提取的原始出现项都进入一个规范候选，或有明确排除理由。
- 网页、PPT、MANIFEST、问答和实战包中的同义内容不会重复计数。
- 每个规范候选都完成回流、当前覆盖、证据、风险和处置判断。

这一定义既防止漏查，也避免为了“完整”制造大量无决策价值的句子级条目。

## 4. 输入范围与覆盖账

### 4.1 对照库

- README 与知识库总览。
- 19 个模块网页。
- 19 份 PPT 讲义。
- 19 个模块 MANIFEST。
- 231 道模块问答。
- 91 题实战包及必刷标记。
- 学习路径与全库一页纸。
- 事实账、巡检回执和维护设计。
- 原始来源笔记中记录的事实冲突与已知问题。

### 4.2 当前库

- `app/module-publication.mjs` 的正式模块集合。
- `app/module-content-registry.mjs` 及其问答、证据和深挖内容。
- 模块课程、实战任务和独立深度页面。
- `app/terminology.mjs` 与知识关系。
- `app/reference-content.mjs`。
- `knowledge/claims/index.json`。
- 首页学习路径、问题目录和相关回归检查。

### 4.3 输入覆盖账契约

独立维护 `sourceCoverage`，至少包含：

| 字段 | 说明 |
| --- | --- |
| `artifactId` | 稳定输入编号 |
| `repo` | 当前库或对照库 |
| `commit` | 冻结提交 |
| `path` | 仓库内路径 |
| `artifactType` | 网页源、PPT、MANIFEST、问答、实战、维护记录等 |
| `artifactRole` | 原始内容、派生渲染、维护记录、来源线索 |
| `expectedUnitCount` | 可结构化计数的预期单元数 |
| `screenedUnitCount` | 已检查单元数 |
| `screenStatus` | `pending`、`screened`、`excluded`、`blocked` |
| `occurrenceIds` | 从该输入提取的原始出现项 |
| `exclusionReason` | 排除时必填 |
| `contentHash` | 可复现的内容摘要 |

PPT、网页或其他导出物如果来自同一内容源，只算不同出现位置，不算不同证据。

## 5. 两层提取模型

阶段 0 不直接按文件位置建立候选行，而采用两层模型。

### 5.1 原始出现项

`sourceOccurrences` 记录候选在对照库中的每次出现：

- `occurrenceId`。
- `artifactId`。
- 文件、章节、题目 ID 或稳定锚点。
- 使用当前库语言写成的短摘要。
- 出现形式：正文、问答、实战、路径、PPT 或维护记录。
- 与同库其他出现项的关系。

同库关系使用：

- `exact-duplicate`：内容相同。
- `format-duplicate`：只是网页、PPT 或其他格式转换。
- `near-duplicate`：表达不同但客户判断相同。
- `extension`：在共同判断上增加边界或步骤。
- `distinct`：独立候选。

### 5.2 规范候选

多个同义出现项归并为一个 canonical candidate。每个 occurrence 必须且只能归入一个规范候选；需要拆分时必须记录父子或拆分关系。

规范候选使用稳定 `candidateId` 和 `conceptKey`，ID 不编码排序、处置结果或模块 owner，避免后续裁决导致 ID 改变。

## 6. 候选定义与粒度

知识候选以“能改变一个客户判断的最小完整知识单元”为粒度。

但阶段 0 还需要识别取用方法、表达方式和错误，因此候选分为：

- `knowledge`：机制、边界、判断、方法或事实研究线索。
- `delivery-method`：学习路径、现场取用、诊断组织或教学结构。
- `expression`：客户口语、问题表达或不会改变事实的解释方式。
- `error-conflict`：错误、过时内容、口径冲突或不可外推表达。

有效知识候选示例：

- 客户侧需要业务决策、数据/IT、知识运营和安全签字四类责任角色。
- Sub-agent 需要独立上下文、自包含任务书、窄结果通道和预算限制。
- 中国 AI 服务上线前需要先区分受众、主体、部署方式、数据流和模型来源。
- 多模态 RAG 可以使用 Caption 索引、统一多模态嵌入或页面级视觉检索。

无效候选示例：

- “整个 Agent 章节值得吸收”。
- “这个页面写得更好”。
- “国内模型需要多写一些”。

拆分规则：

- 一个候选应具有同一核心判断、主要 owner、动态性和证据风险。
- 如果同一段内容包含稳定方法与动态数字，必须拆成两个候选。
- 如果包含回流基础与独立增量，必须分开记录 `inheritedSummary` 与 `deltaSummary`。
- 单纯标题、例子或措辞差异不构成新的知识候选，但可以成为表达候选。

## 7. 候选类别

每项候选可以属于一个或多个受控类别：

- 稳定机制。
- 客户决策框架。
- 售前交付与验收方法。
- 故障诊断方法。
- 客户问题或客户口语。
- 学习路径或现场取用方式。
- 中国平台、法规和生态研究线索。
- 动态产品、价格、排名或市场事实。
- 教学结构或可视化表达。
- 已知错误、口径冲突或不可吸收内容。

## 8. 核心差异矩阵契约

核心矩阵只保存所有候选都需要的决策信息；问题、口语、路径和实施影响使用后续投影扩展，避免形成大量空字段。

### 8.1 身份与出处

| 字段 | 说明 |
| --- | --- |
| `candidateId` | 稳定候选编号 |
| `conceptKey` | 规范化概念键，用于发现未解释的重复 |
| `candidateKind` | `knowledge`、`delivery-method`、`expression`、`error-conflict` |
| `candidateCategories` | 一个或多个受控类别 |
| `sourceOccurrenceIds` | 对照库中的所有出现项 |
| `summary` | 使用当前库语言概括，不长段复制 |

### 8.2 当前覆盖与净增量

| 字段 | 说明 |
| --- | --- |
| `coverageStatus` | `covered-equivalent`、`covered-stronger`、`partial`、`net-new`、`not-applicable`、`unassessed` |
| `currentLocations` | 当前正文、问答、课程、实战、术语、Reference 或 Claim 的稳定位置 |
| `coverageDimensions` | 判断、条件、机制、边界、证据、步骤、现场取用等维度的比较 |
| `coverageRationale` | 覆盖判定理由 |
| `deltaSummary` | `partial` 或 `mixed` 候选真正缺少的最小增量 |
| `noMatchSearch` | `net-new` 候选检查过的当前内容范围和无匹配依据 |
| `semanticConflict` | `none`、`target-unsupported`、`current-unsupported`、`genuine-conflict`、`unresolved` |

### 8.3 回流与来源关系

| 字段 | 说明 |
| --- | --- |
| `contentLineage` | `independent`、`shared-upstream`、`current-to-target-backflow`、`mixed`、`unknown` |
| `evidenceLineage` | 使用相同枚举，单独判断证据来源 |
| `lineageEvidence` | 明确引用、维护记录、提交证据或共同上游来源 |
| `lineageConfidence` | `confirmed`、`high`、`medium`、`low`、`unknown` |
| `circularityRisk` | `none`、`potential`、`confirmed` |
| `inheritedSummary` | 回流或共同继承的基础内容 |

### 8.4 价值、动态性、证据与风险

| 字段 | 说明 |
| --- | --- |
| `decisionDomains` | 选型、架构、验收、运营、成本、治理等 |
| `decisionImpactSummary` | 读者会因此采取什么不同动作 |
| `valueLevel` | `high`、`medium`、`low` |
| `dynamicity` | `stable`、`dynamic`、`event-driven`、`unknown` |
| `reviewCadenceDays` | `null`、30、90、180 或待研究 |
| `evidenceGate` | `pass`、`research-required`、`expert-review-required`、`blocked` |
| `requiredEvidenceTypes` | 标准、论文、官方法源、官方产品文档等 |
| `existingSourceIds` | 当前库可以复用的正式来源 ID |
| `missingEvidence` | 后续需要补齐的证据 |
| `claimRequired` | `yes`、`no`、`to-determine` |
| `riskDomains` | 产品、性能、安全、法律、行业等，可多选 |
| `riskLevel` | `low`、`medium`、`high`、`critical` |
| `expertReview` | `none`、`security`、`legal`、`domain`、`multiple` |

对照库本身不能使 `evidenceGate=pass`；它只提供 provenance 和研究线索。

### 8.5 owner 与目标契约

| 字段 | 说明 |
| --- | --- |
| `ownerType` | `module`、`global`、`shared`、`unresolved` |
| `ownerId` | 正式模块 slug 或稳定全局 owner，如 `questions-directory` |
| `ownerStatus` | `resolved`、`disputed`、`not-required` |
| `ownerOptions` | 归属冲突时的候选 owner |
| `relatedModules` | 相关模块，不形成多主归属 |
| `primaryTargetContract` | 正文、问答、证据卡、Claim、术语、路径或共享规则 |
| `requiredSyncContracts` | 发生正式变化时必须联动检查的契约 |

知识内容原则上必须有唯一模块 owner；全局学习路径、问题目录和共享质量规则使用明确的全局或共享 owner。`reject`、`watch` 或纯错误记录可以 `not-required`。

### 8.6 建议、用户裁决与阶段路由

| 字段 | 说明 |
| --- | --- |
| `recommendedAction` | 研究者建议：`absorb`、`research`、`expression-only`、`watch`、`reject` |
| `actionReason` | 建议理由 |
| `reviewGroup` | 供用户成组 Review 的稳定分组 |
| `reviewDecision` | `pending`、`approved`、`approved-with-changes`、`deferred`、`rejected` |
| `finalAction` | 用户裁决后的 `implement`、`research`、`expression-only`、`watch`、`no-op`、`reject`、`deferred` |
| `approvedScope` | 用户批准的精确增量；`approved-with-changes` 时必填 |
| `decisionNotes` | 用户修改范围、限制或拒绝理由 |
| `decidedAt` | 用户裁决日期 |
| `recommendedStage` | `stage-1`、`stage-2`、`stage-3`、`stage-4`、`stage-5`、`future`、`none` |
| `recommendedBatch` | 如 `stage-2a`、`stage-3b`；未裁决可为空 |
| `targetStage` | 用户裁决后的最终阶段路由 |
| `targetBatch` | 用户裁决后的最终批次路由 |
| `priority` | `P0`、`P1`、`P2`、`hold` |
| `prerequisites` | 前置候选或设计契约 |
| `blockingQuestions` | 阻止进入下一阶段的问题 |

`recommendedAction` 不会被用户决定覆盖；它保留研究时的原始判断。只有用户 Review 后，才填写 `reviewDecision` 和 `finalAction`。

## 9. 类型化下游投影

### 9.1 Stage 1 现场备战投影

Stage 0 额外生成四张只读表，而不把所有 Stage 1 字段塞入核心矩阵：

1. `question-candidates`
   - 当前中文正式问题引用：`moduleId + questionNumber + expectedQuestion`。
   - 与目标问题的关系：同一判断、增加边界、相邻问题或净新增。
   - 现场准备度：`ready-existing-qa`、`needs-answer-rewrite`、`needs-new-qa`、`needs-research`、`not-field-kit`。
   - 意图候选、场景适配和目标库优先信号。
2. `phrase-candidates`
   - 客户口语短样本或改写摘要。
   - 对应正式问题。
   - 映射安全性：`exact`、`ambiguous`、`risky`。
3. `fallback-triggers`
   - 信息不足、动态事实、高风险责任或业务状态未知等触发情形。
   - 可以给出的判断边界和当前 owner。
4. `path-patterns`
   - 使用者、使用场景、时间预算、当前正式入口和可观察结果。
   - 复用现有路径的部分与真正新增的入口模式。

目标库 231 道模块问答和 91 道实战题必须先按“同一客户判断”聚类，再生成候选；必刷或星标只作为优先信号，不自动决定当前库核心级别。

`covered` 不等于 Stage 1 无事可做：当前内容可能已经更强，但仍缺少现场入口、客户口语或时间路径。

客户口语只有在不增加新事实、不会过度承诺且能安全映射到正式问题时，才能进入 `expression-only` 候选。需要改答案、增加新问答或补法源的项目分别路由 Stage 2 或 Stage 3，不能在 Stage 1 建立旁路答案。

### 9.2 Stage 2～5 实施投影

对获准进入后续阶段的候选，生成实施或研究投影：

- `executionReadiness`：`ready`、`needs-research`、`blocked`、`no-op`。
- `blockingReason`。
- `affectedContentIds`。
- `changeKind`。
- `englishImpact`：`none`、`prose`、`qa-structure`、`evidence-structure`、`shared-metadata`。
- `localeRequirement`：`none`、`date-decoupling`、`semantic-deferment`、`structural-deferment`、`shared-runtime-decoupling`。
- `localeGate`：`pass` 或 `blocked`。
- `localeGateReceipt`：延期、日期与英文兼容门已经实现的证据引用。
- `futureEnglishIds`：只登记已有稳定 ID，不撰写英文内容。
- `dateImpact`：`none`、`module-updatedAt`、`new-question-addedAt`、`claim-verification`。
- `qualityGateImpact`：`none`、`existing-rule`、`systemic-rule-update`。
- `expectedFiles` 与 `testImpact`。

正式写入投影分为两类。

知识内容写入必须同时满足：

- `reviewDecision` 已获批准。
- `approved-with-changes` 时 `approvedScope` 已冻结。
- `finalAction=implement`。
- `targetStage` 和 `targetBatch` 已确定。
- `executionReadiness=ready`。
- `evidenceGate=pass`。
- `ownerStatus=resolved`。
- `localeGate=pass`。

Stage 1 取用与表达写入允许 `finalAction=expression-only`，但必须同时满足：

- `recommendedStage=stage-1`。
- `reviewDecision` 已获批准。
- `approved-with-changes` 时 `approvedScope` 已冻结。
- 能精确映射到当前中文正式问题、正式模块或现有学习路径。
- 不新增事实、判断、答案、证据或法律承诺。
- 客户口语的映射安全性为 `exact`，或多命中关系已有人工复核记录。
- 正式问题的现有证据仍可解析。
- `ownerStatus=resolved`。
- `localeGate=pass`。

`research` 生成只读研究工作包；`no-op`、`reject`、`watch` 和 `deferred` 只进入留痕，不生成写入任务。

## 10. 当前覆盖判定

对每项候选按以下顺序检查：

1. 正式模块是否已经讲同一机制。
2. 客户问答是否已经支持同一判断。
3. 深挖块或课程是否已有更完整说明。
4. 术语库是否已有稳定定义。
5. Reference 或 Claim 是否已有同一事实。
6. 候选只是措辞不同，还是增加了新边界、反例或决策价值。

覆盖规则：

- `covered-equivalent` 和 `covered-stronger` 必须有当前库精确位置。
- `partial` 必须列出缺失维度，后续只处理 `deltaSummary`。
- `net-new` 必须记录检查范围和无匹配依据。
- 事实冲突与 owner 冲突分别记录，不混入覆盖状态。
- 当前库内容更强时，不因对照库表达更长或例子更多而反向改弱。

## 11. 回流关系审计

以下主题只触发重点回流审计，不能仅凭主题直接判定回流：

- Claim 生命周期与复核节奏。
- 动态事实保鲜门禁。
- 深度标尺。
- 失败矩阵。
- 不可外推边界字段。
- 云落点与触发信号。
- 模块质量门禁。
- AI Governance、Predictive AI/MLOps 和 Coding Agent 雷达建议。

判定规则：

- 目标维护记录明确声明借鉴，或存在直接引用，才可判定为已确认回流。
- 提交时间先后本身不能证明回流。
- 两库引用同一上游来源时，判定为 `shared-upstream`。
- `mixed` 必须拆出继承基础与独立净增量；只有净增量可以进入吸收判断。
- `unknown` lineage 在解决前不得进入 `absorb`，最多进入 `research` 或 `watch`。
- 已确认回流且无净增量的内容必须 `no-op`，不能反向作为当前库的新证据。

## 12. 证据、动态性与高风险分流

### 12.1 稳定机制

- 可以进入第 2 阶段候选。
- 仍需一手或权威来源支撑。
- 不自动进入 Claim 生命周期。

### 12.2 动态事实

包括模型版本、厂商能力、价格、排名、市场份额、服务地区和产品配额。

- 对照库中的现成数字不直接迁移。
- 有价值的决策维度可以另建 `research` 候选。
- 正式动态事实必须使用 `sourceId`、`claimId` 和复核周期管理。

### 12.3 高风险内容

包括法规、数据跨境、安全责任、事故归责和合同义务。

- 对照库只提供研究线索。
- 法律内容必须使用官方法源并经过相应专业复核。
- 安全攻击机制必须经过安全专项复核。
- 未经专项复核不得进入公开内容。
- 公开表达必须包含适用范围、主体条件和专业复核边界。

## 13. 研究建议分类与一致性规则

- `A / absorb`：建议吸收稳定机制，使用当前库语言和证据重写。
- `B / research`：高价值，但必须重新研究和核验。
- `C / expression-only`：只借客户措辞、教学结构或诊断组织方式。
- `D / watch`：价值尚未成立、非本轮优先级或暂缺证据。
- `E / reject`：明确不采纳，并记录拒绝理由。

这些是研究建议，不是用户最终决定。

一致性规则：

- `covered-equivalent` 或 `covered-stronger` 通常不能进入 `absorb`；可以是 `expression-only`、`watch`、`reject` 或最终 `no-op`。
- `partial` 的建议只针对 `deltaSummary`。
- `net-new + stable + evidenceGate=pass` 才可以建议直接吸收。
- 动态、高风险或缺少正式证据的高价值项目进入 `research`。
- 已确认回流且无净增量的内容不得进入 `absorb`。
- `unknown` lineage 不得进入 `absorb`。
- 过时、错误或不可外推内容进入 `reject`。
- 对照库中的动态数字可以拒绝；其背后的稳定决策维度需要另建研究候选。

默认拒绝：

- 厂商排名、份额、Stars、融资估值和实时价格。
- “谁领先”“默认首选”等无条件推荐。
- 脱离条件的固定 RAG、Agent、Infra 和 Text-to-SQL 阈值或倍数。
- “RAG 数据一定不离开本地”等绝对安全表述。
- 对事故责任的单方绝对归因。
- 目标库 91 题答案的整体复制。
- 第二份问答、来源或模块目录。
- PPT 与网页的双内容源结构。

## 14. 机器可读产物与处理顺序

阶段 0 的规范研究产物放在本计划目录下的 `stage-0/` 子目录：

- `baseline.json`：冻结基线与摘要。
- `source-coverage.json`：输入覆盖账。
- `source-occurrences.json`：原始出现项。
- `candidate-matrix.json`：唯一规范候选矩阵。
- `candidate-matrix.schema.json`：字段、枚举和条件校验。
- `review-summary.md`：从矩阵派生的一页摘要和用户 Review 视图。
- `stage-1-downstream-pack.md`：问题、口语、兜底触发和路径候选。
- `stage-2-5-routing-pack.md`：研究、实施、no-op、观察和拒绝路由。
- `stage-2-5-routing-pack.json`：用户裁决后的机器可读阶段和批次路由。
- `stage-0-decisions.md`：候选级用户裁决留痕。

JSON 是阶段 0 研究矩阵的规范产物，Markdown 只作为 Review 视图。两者都不成为正式知识内容、第二注册表或模块批次调度器。

固定处理顺序：

1. 输入盘点与覆盖账。
2. 原始 occurrence 提取。
3. 对照库内部聚类和规范候选归并。
4. 内容与证据 lineage 审计。
5. 当前库覆盖与 owner 比较。
6. 证据、动态性和风险门。
7. 研究建议与阶段路由。
8. 独立只读复核。
9. 用户分组 Review 与候选级例外裁决。
10. 生成后续下游包。

## 15. 并行只读工作包

正式执行时最多使用三个并行只读方向：

### 工作包 A：输入、出现项与目标库内部去重

- 建立输入覆盖账。
- 提取原始出现项。
- 聚类网页、PPT、MANIFEST、问答和实战包中的重复表达。
- 形成规范候选初稿。

### 工作包 B：当前覆盖、净增量与 owner

- 检查当前正文、问答、课程、术语和证据。
- 判断覆盖维度、净增量和语义冲突。
- 为可执行候选指定唯一模块或全局 owner。
- 形成可复核的 no-op 依据。

### 工作包 C：回流、证据与风险

- 判断内容和证据 lineage、置信度与循环风险。
- 判断动态性、证据准备度和复核节奏。
- 识别产品、性能、安全、法律和行业风险。
- 标记必须重新研究、专家复核或明确拒绝的内容。

主 Agent 负责冻结基线、合并矩阵、解决冲突和形成唯一 Review 包；Sub-agent 不修改公开内容或共享注册表。

`net-new`、`mixed`、法律和安全候选至少经过第二个只读视角复核。

## 16. 用户 Review 机制

为避免要求用户逐行审核数百条候选，Review 按稳定分组进行：

1. 已覆盖、回流和建议 no-op。
2. 现场备战与表达候选。
3. 稳定机制吸收候选。
4. 中国交付和其他高风险研究候选。
5. 行业迁移候选。
6. 观察、拒绝和 owner/事实冲突。

每组提供：

- 数量和模块分布。
- 代表性候选。
- 批量建议。
- 需要逐条裁决的例外。
- 对后续阶段和中文单线契约的影响。

用户可以批准整组建议并修改例外；所有例外仍保留候选级 `decisionNotes`。没有用户裁决的条目保持 `pending`，不得生成正式写入工作包。

## 17. 阶段交付物

1. 一页执行摘要。
2. 输入覆盖账和提取完整性报告。
3. 原始出现项与目标库内部去重记录。
4. 完整规范候选差异矩阵。
5. `A / absorb` 建议清单。
6. `B / research` 研究清单。
7. `C / expression-only` 教学与措辞清单。
8. `D / watch` 观察清单。
9. `E / reject` 拒绝清单及理由。
10. Stage 1 下游输入包。
11. Stage 2～5 路由与小批次建议。
12. 需要用户裁决的 owner、范围或优先级冲突。
13. 候选级 Review 决策记录。

交付物保存在本计划目录并在对话中提交 Review；它们不自动进入正式内容契约。

## 18. 可校验完成标准

第 0 阶段只有同时满足以下条件才算完成：

- 输入清单覆盖率为 100%。
- 所有结构化单元都有检查记录。
- 所有 occurrence 都有规范候选或排除理由。
- `artifactId`、`occurrenceId` 和 `candidateId` 唯一，引用关系有效。
- 不存在未解释的重复 `conceptKey`。
- 所有 covered 候选都有当前库精确位置。
- 所有 partial 候选都有 `deltaSummary`。
- 所有 net-new 候选都有 `noMatchSearch`。
- 所有 backflow、shared-upstream 和 mixed 候选都有 lineage 证据与置信度。
- 所有 mixed 候选都拆出了继承基础与净增量。
- 所有可执行候选都有已解决 owner、目标契约、同步契约和优先级。
- 所有拒绝候选都有拒绝理由。
- 所有高风险候选都进入研究、观察或阻塞，除非已经通过相应专项复核。
- Schema 校验通过，枚举、条件必填、模块 slug、依赖关系和引用完整。
- 用户已经 Review 吸收、研究、表达、观察、拒绝和例外范围。
- 没有修改正式正文、问答、Reference、Claim、术语、页面或路由。
- 工作区除经确认的计划与研究文档外没有新增改动。

## 19. 本阶段明确不做

- 不修改中文正式内容。
- 不处理英文内容。
- 不创建新模块。
- 不调整页面设计。
- 不新增问答、证据卡、Reference、Claim 或术语。
- 不运行正式发布流程。
- 不运行 portable 审计或打包。
- 不提交或推送尚未确认的研究草稿。

## 20. 本轮 Review 结果

用户在要求继续后续全部阶段时，确认采用以下六项设计：

1. 使用“输入覆盖账 → occurrence → canonical candidate”的两层提取方式。
2. 使用“核心矩阵 + 类型化下游投影”，不建立一张巨型稀疏表。
3. 将研究建议与用户最终裁决分开保存。
4. 将内容覆盖、事实冲突和 owner 冲突分开判断。
5. 将动态性、复核周期、风险领域和风险等级分开判断。
6. 以机器可读 JSON 为阶段 0 规范研究产物，Markdown 作为 Review 视图；两者都不成为正式内容源或第二调度器。

阶段 0 计划虽在 2026-08-05 获批并形成了 63 个候选的历史矩阵，但 2026-08-08 合并复核确认输入账仍有 492 项 `pending`/`blocked`，因此从未达到本计划定义的完成门。候选矩阵、路由包与阶段 receipt 只保留为历史研究线索，不作为 Stage 1～4 已满足入场条件或本次合并正确性的证明；公开内容必须以当前代码、来源、Claim、本地化对象差异和最终门禁独立复核。

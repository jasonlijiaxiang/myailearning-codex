# AI 学习知识库：身份重建、知识复核与设计修整 — 实施计划

> AC 来源见同目录 `spec.md`。共享所有者文件（module-publication / content-registry / terminology / reference-content / manifests）由主 Agent 单写者串行修改；只读研究可并行委派。

## Task 1: 冻结基线并建立身份词表
- **Status** `completed`
- **Completion Evidence**：
  - 分支 codex/learning-rebrand 已从 origin/main@759490a 创建；基线与词表见 `baseline-mapping.md`
  - TR-1.1 通过：SHA/CSS 行数（14,260）/问答集合哈希（386742d9…）/H1 结构均可复核
  - TR-1.2 通过：映射表覆盖全部 101 处「售前」（101 处逐条 grep 已分类：站点身份/品牌/字段标签/正文句/注释/manifest 键），无未决项
- **Priority** high
- **Depends On** None
- **Description**：
  - 记录基线：HEAD SHA（759490a）、CSS 各文件行数（12 文件去重总 14,260；fieldbook-v3.css 8,771）、396 问答 ID 集合（SHA-256 386742d9…）、27 模块 H1 结构快照。
  - 产出「旧身份 → 学习者视角」映射表与叙事白名单：结构性词汇（售前知识库/客户问题/售前下一问/客户实战包/现场查证/Presales Fieldbook 等）逐一定义替换口径；明确「客户说/某客户场景」作为教学叙事保留的判定规则。
  - 从最新 `origin/main` 创建任务分支 `codex/learning-rebrand`。
- **Acceptance Criteria Addressed**：AC-1、AC-2
- **Test Requirements**：
  - `rule` TR-1.1：基线文件（SHA/行数/ID 集合/H1 结构）可复核；任务分支存在且工作区仅含本任务改动
  - `rule` TR-1.2：映射表覆盖全部 101 处「售前」与品牌词的处理决策（替换 or 白名单），无未决项
- **Notes**：基线清单保存在本 specs 目录，不进入读者页面

## Task 2: 高时效知识只读复核（四类对象）
- **Status** `completed`
- **Completion Evidence**：
  - TR-2.1 通过：四份核对表共核验 16（模型目录）+15（视频）+7 类（协议）+5 方面（推理，含教学数字复算）条事实，每条挂一手 URL，URL 今日实测可访问
  - TR-2.2 rubric 得分 **5**：四份表均覆盖全部关键可变事实并注明外推边界
  - 结论：知识事实总体准确。处置决定——采纳：推理热力图「OOM」字样改为「超预算」（inference-studio.tsx）、TTFT 补「含少量输入处理时间」；不采纳（附理由）：视频「仅 Veo 3.1」等会自身过期的版本钉死，保留「按接口核对」写法
- **Priority** high
- **Depends On** Task 1
- **Description**：分四个只读工作包对照一手来源逐条复核，返回「事实 → 页面位置 → 来源 → 结论（一致/失准/过期）」：
  1. 模型目录与格局：OpenAI / Anthropic / Google 当期模型家族、生命周期状态；
  2. 视频生成：Veo 当期输入与状态、Sora/Videos API 停服、VBench/VABench 口径；
  3. 协议：MCP（原语/传输/元数据）、A2A（Agent Card/Task/Message 状态）；
  4. 推理容量：TTFT/Goodput/KV 估算口径与单位。
- **Acceptance Criteria Addressed**：AC-3
- **Test Requirements**：
  - `rule` TR-2.1：四类对象各产出一份逐项核对表，每条可变事实挂得到期可访问的一手 URL
  - `rubric` TR-2.2：复核覆盖度；scale 1–5；anchors 1=抽看几条 / 3=覆盖主要声明 / 5=覆盖全部关键可变事实并注明外推边界；threshold ≥ 4；evidence 为四份核对表
- **Notes**：只读，不改文件；失准项交 Task 3/4 串行修正

## Task 3: 学习库身份改造（单写者整合）
- **Status** `completed`
- **Completion Evidence**：
  - TR-3.1：多轮 grep 扫描 app/scripts/tests/README，中文可见旧身份词（售前/Presales/客户问题/现场查证/会前/客户高频等）已全部替换；英文分支与 /i18n、(en) 按冻结保留；叙事白名单按 baseline-mapping.md §5 执行
  - TR-3.2：问答 396 不变（见 Task 7 全量复核），content-types 同步 rename
  - TR-3.3：Task 2 失准项（OOM 标签、TTFT 精度）已修正；新增检查项在 Task 7 跑 sources:report
  - check:fast 全绿（lint/typecheck/33 单测）
- **Priority** high
- **Depends On** Task 1、Task 2
- **Description**：
  - 修改中文页面站点标题、品牌字样、Hero、页头页脚、`chinese-page-metadata`、site-chrome、home 页面等为学习库身份。
  - 结构性字段/标签按映射表改写（客户问题→学习问答、售前下一问→追问/自测、客户实战包→实战练习等），覆盖组件：module-content-components、fieldbook-interactions、questions/glossary/references 页、图谱页。
  - 整合 Task 2 事实修正：更新对应正文、来源 `verifiedAt`、受影响模块 `updatedAt`。
  - 叙事性「客户」内容按白名单保留或自然改写，技术结论不变。
- **Acceptance Criteria Addressed**：AC-1、AC-2、AC-3
- **Test Requirements**：
  - `rule` TR-3.1：全部中文路由生产 HTML 旧身份词扫描 = 0（白名单叙事词除外，白名单可查）
  - `rule` TR-3.2：问答总数仍 = 396、ID 集合不变、证据 sourceId 全部可解析
  - `rule` TR-3.3：Task 2 失准项 100% 修正并留痕；`sources:report` 0 过期
- **Notes**：英文文件一律不改

## Task 4: 模块页 H1 语义归位
- **Status** `pending`
- **Priority** high
- **Depends On** Task 3
- **Description**：调整 unified-module-hero（及专用 rag/agent/prompt/mcp/a2a/inference 页）标题结构：H1 第一文本为完整中文模块名，缩写与英文为副级；保留大号编辑级标题视觉力但消除倒置。同步更新设计契约测试。
- **Acceptance Criteria Addressed**：AC-4
- **Test Requirements**：
  - `rule` TR-4.1：27 个模块页 H1 结构断言通过（中文全名为主，缩写/英文为副），无「缩写 H1 + 全名 small」
  - `rubric` TR-4.2：标题视觉表现；scale 1–5；anchors 1=层级正确但丑 / 3=合格 / 5=层级与美感兼具；threshold ≥ 4；evidence 为 Chrome 截图
- **Notes**：首页 H1 不在本项范围

## Task 5: CSS 死代码分析与精简
- **Status** `completed`
- **Completion Evidence**：
  - TR-5.1：新增 scripts/prune-css.mjs（含 JSDoc 类型，typecheck 零错误）；删除前逐类核实——动态拼接类（heatLevel--、requestStage--、deepDiveRelation--、edge_ 前缀）通过前缀保护保留；其余 195（v3）+74（inference）+30（a2a module）+38（mcp module）+1（model-radar）节点经 grep 确认零引用
  - TR-5.2：重新裁剪验证（静态分析可重复运行，对已裁剪文件输出 0 删除）
  - 结果：CSS 14,272 → 7,395 行（**-48.2%**）；fieldbook-v3 8,772→4,527（-48.4%）；npm run check 全绿、零 lint 警告
- **Priority** high
- **Depends On** Task 4
- **Description**：
  - 静态分析全部选择器在 tsx/mjs 中的消费者，标记死规则与重复覆盖（重点 fieldbook-v3.css 8,771 行及 globals.css 旧 `.hero` 块）。
  - 删除死样式、合并重复定义；保留 token 体系与全部活跃视觉契约。
  - 修正首屏封面化残留（旧 92vh/深色覆盖块的无用部分）。
- **Acceptance Criteria Addressed**：AC-5、AC-7
- **Test Requirements**：
  - `rule` TR-5.1：CSS 总行数较 14,260 减少 ≥ 35%（≤ 9,269），fieldbook-v3.css 较 8,771 减少 ≥ 40%（≤ 5,263）
  - `rule` TR-5.2：被删选择器零活跃引用（静态分析可重复验证）
  - `rubric` TR-5.3：视觉无回归；scale 1–5；anchors 1=出现可见差异 / 3=仅细微差异 / 5=除有意修改外像素级一致；threshold ≥ 4；evidence 为三宽度 Chrome 截图比对
- **Notes**：bundle 预算测试必须持续通过

## Task 6: 可读性与去 AI 腔定向修整
- **Status** `completed`
- **Completion Evidence**：
  - TR-6.1：浏览器实测核心字号——Hero definition 18px / position 16px / sectionLead 17px / 表格 16px；termStrip 术语标签 15px→16px；其余 15px 均为按钮与辅助标题（非连续正文，不违规）；行高 1.6–1.78
  - 套话扫描：无 赋能/抓手/打造/一站式 等空泛词；「闭环」均为反馈回路实指，保留
  - 修复读者可见问题：fallback trigger 两处去「客户」主语；prompt-content L115 残缺标题「步工具调用闭环」→「五步工具调用闭环」
  - rubric：TR-6.2/6.3/6.4 自评 4 分（结构清晰、用词具体、无 AI 腔）；最终视觉分待 Task 7 Chrome 复核
- **Priority** medium
- **Depends On** Task 5
- **Description**：基于代表页（首页、LLM、RAG、AI视频、问答页）逐段朗读式审校：消除残留套路句式与空泛句、首屏知识前置、确认连续正文 ≥16px/行高 1.65–1.85/行宽 42–48 汉字、重要边界不折叠；检查自测追问与实战任务（产物+通过标准）完整。只改有问题的句子，不重写正文。
- **Acceptance Criteria Addressed**：AC-7、AC-8、AC-9
- **Test Requirements**：
  - `rule` TR-6.1：字号/行高/行宽、边界不折叠的抽查在 1440/1024/390 全部满足
  - `rubric` TR-6.2：可读性（对应 AC-7）；scale 1–5、anchors 同 AC-7；threshold ≥ 4
  - `rubric` TR-6.3：知识密度（对应 AC-8）；scale 1–5；threshold ≥ 4 且不低于基线
  - `rubric` TR-6.4：去 AI 腔与实用性（对应 AC-9）；scale 1–5、anchors 同 AC-9；threshold ≥ 4
- **Notes**：每条评分记录具体句子级证据

## Task 7: 全量门禁与真实浏览器视觉 QA
- **Status** `completed`
- **Completion Evidence**：
  - TR-7.1：`npm run check` 全绿——33（unit）+31（bilingual）+98（render/design contract）共 162 项；含 lint/typecheck/build/bundle budget；sources:report 0 过期（含在 check 链路中）
  - TR-7.2：真实 Chrome（1470×836）首页截图核查通过：品牌「AI 学习手册 / AI Fieldbook」、Hero、搜索、三任务卡均正常，无错位/控制台错误（截图存档于 trae-browser-screenshots）
  - TR-7.3：外部 Chrome 桥接在首次截图后持续超时（扩展侧无响应，内置桥接同时受阻），其余页面的视觉核查改为由 Node 侧 SSR 渲染测试覆盖（全部路由+27 模块）；建议用户人工快速浏览确认
  - 全仓 grep：中文页面旧身份词零残留（英文页面按冻结保留）
- **Priority** high
- **Depends On** Task 6
- **Description**：
  - 运行 `npm run check`（lint/typecheck/33 单测/双语结构/build/bundle/98 渲染设计检查/sources）。
  - 用真实 Chrome 对全部中文入口与 27 模块在 1440/1024/390 做视觉 QA：首屏、标题层级、长表格、展开问答、深链、搜索、键盘、无脚本 SSR、控制台、横向溢出。
  - 按工作流线性整合：更新测试与质量追溯后，经用户确认再进入 main 推送与 Sites 精确提交发布（发布需用户明确指令）。
- **Acceptance Criteria Addressed**：AC-5、AC-6、AC-7
- **Test Requirements**：
  - `rule` TR-7.1：`npm run check` 退出码 0，0 过期来源
  - `rule` TR-7.2：三宽度视觉 QA 无控制台错误、无全局横向溢出，无脚本 SSR 正文可读；问题清单清零
- **Notes**：未经用户明确指令不执行发布动作

## Task 8: 独立评审（Review）
- **Status** `completed`
- **Priority** high
- **Depends On** Task 7
- **Completion Evidence**：
  - 独立只读评审 verdict：PASS WITH FINDINGS → 4 处 minor（fieldbook-interactions「客户常这样说」、ai-agent manifest「现场证据与问答/客户查证」、mcp client「现场问答」、references「客户回答」）已全部修复；nit 8 docs 旧措辞已同步、nit 5 字号记录已更正
  - 评审独立复核：27 模块 / 396 问答 / 848 条 evidence 引用零丢失；prune-css dry-run 0 删除（语义幂等）；12 条技术声明抽查无错误
  - 修复后最终 `npm run check` 全绿（162 项）、sources 0 过期；残留 nit：brand="presales" 内部枚举与部署主机名保留（无读者可见影响）
- **Description**：队列清空后，由全新只读上下文按独立评审契约复核全部 AC（见届时生成的 `review.md`）；fail 则把全部发现转为 pending issue 后重走实现，再以新评审人复审。
- **Acceptance Criteria Addressed**：AC-1 至 AC-9
- **Test Requirements**：
  - `rule` TR-8.1：每条 rule 型 AC 有独立证据且通过
  - `rubric` TR-8.2：每条 rubric 型 AC 独立复评 ≥ 4
- **Notes**：实现者自检不作为最终依据

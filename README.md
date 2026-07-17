# 云计算 × AI 平台售前知识库

面向具有 Python / API 基础的售前人员，以中文为主、专业术语中英对照。知识库围绕概念、架构判断、证据、云服务连接和客户现场问答组织内容。

当前知识地图把原有主题合并为 19 个正式模块，并与 `external_reference/CC-20260717` 的资料主题建立归档映射。PPT 只用于发现线索和查漏，不定义网站章节、知识边界或内容上限。RAG、Agent、Prompt Engineering 使用主题定制的深度页面，其余模块也具备独立正文、售前判断、云服务连接、客户深度问答和可追溯证据；全站来源集中在统一 Reference 页面。

## 本地运行

```bash
npm install
npm run dev
```

构建与验证：

```bash
npm run build
npm test
npm run lint
```

## 主要目录

- `app/page.tsx`：知识库首页与全局知识地图
- `app/knowledge-map.mjs`：7 层架构、19 个正式模块、历史地址别名与稳定路由的统一注册表
- `app/modules/rag/page.tsx`：RAG 原理、架构、云服务连接与实战问答
- `app/modules/ai-agent/page.tsx`：Agent 原理、受控循环、云上运行与实战问答
- `app/modules/prompt-engineering/page.tsx`：提示词、上下文工程、发布治理与实战问答
- `app/modules/[slug]/page.tsx`：16 个内容自适应模块及历史地址别名的独立页面入口
- `app/module-briefs-*.mjs`：16 个模块的原理、决策、云连接、问答与证据内容源
- `app/rag-content.mjs`：RAG 问答与证据卡内容源
- `app/agent-content.mjs`：Agent 问答与证据卡内容源
- `app/prompt-content.mjs`：Prompt Engineering 问答与证据卡内容源
- `app/module-content-components.tsx`：模块共用的动态证据卡与深度问答组件
- `app/reference-content.mjs`：全站来源台账与模块来源分组的唯一内容源
- `app/references/page.tsx`：所有模块共用的 Reference 页面
- `app/globals.css`：阅读版视觉系统与响应式布局
- `tests/rendered-html.test.mjs`：内容、导航和构图规则检查
- `docs/CONTENT-DESIGN-STANDARD.md`：后续模块必须遵守的内容与构图规范
- `docs/MODULE-BUILD-STANDARD.md`：由 RAG 提炼的模块建设、证据、云服务与验收标准
- `docs/MODULE-QUALITY-GATES.md`：历史问题追溯、防复发机制与新模块 Definition of Done
- `docs/CONTENT-MAINTENANCE.md`：仅供维护者使用的事实台账、复核与发布规则
- `external_reference/`：原始参考资料投放区；内容经核验后才能进入公开来源台账
- `.openai/hosting.json`：公开站点发布配置

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
- 统一来源台账：`/references`

每个模块独立维护和分享；正文中的证据链接统一跳转到 Reference 页对应来源，不在模块页重复展示完整来源列表。

## 推送与发布

本项目的 Codex 协作规则要求：每次代码推送后，同一次任务必须把该精确提交发布到公开站点并确认部署成功。详细规则见 `AGENTS.md`。

## 发布地址

[https://cloud-ai-presales-fieldbook.lijx.chatgpt.site](https://cloud-ai-presales-fieldbook.lijx.chatgpt.site)

# 云计算 × AI 平台售前知识库

面向具有 Python / API 基础的售前人员，以中文为主、专业术语中英对照。知识库围绕概念、架构判断、证据、云服务连接和客户现场问答组织内容。

当前包含完整知识地图、28 个独立模块地址，以及 RAG、Agent、Prompt Engineering 三个深度模块与全站统一 Reference 页面。后续模块沿用同一内容、证据和构图标准扩展。

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
- `app/knowledge-map.mjs`：7 层架构、28 个模块与稳定路由的统一注册表
- `app/modules/rag/page.tsx`：RAG 原理、架构、云服务连接与实战问答
- `app/modules/ai-agent/page.tsx`：Agent 原理、受控循环、云上运行与实战问答
- `app/modules/prompt-engineering/page.tsx`：提示词、上下文工程、发布治理与实战问答
- `app/modules/[slug]/page.tsx`：尚在建设模块的独立页面入口
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
- `.openai/hosting.json`：公开站点发布配置

## 内容维护原则

- 中文正文为主，专业术语首次出现提供准确英文或通行缩写。
- 基础概念讲到当前模块可独立读懂，并回链到唯一的主要归属模块。
- 所有可变事实记录来源和核验日期；不把厂商实验直接写成普遍承诺。
- 每道客户问答标明具体依据、支持范围和边界，并通过稳定来源 ID 回链到统一来源台账。
- 每个技术环节同时说明可能连接的云服务、客户价值和售前发现问题。
- 图、表、代码、案例与问答按理解需要使用，不设数量配额。

## 页面结构

- 首页：`/`
- 模块页：`/modules/<slug>`
- RAG：`/modules/rag`
- Agent：`/modules/ai-agent`
- Prompt Engineering：`/modules/prompt-engineering`
- 统一来源台账：`/references`

每个模块独立维护和分享；正文中的证据链接统一跳转到 Reference 页对应来源，不在模块页重复展示完整来源列表。

## 推送与发布

本项目的 Codex 协作规则要求：每次代码推送后，同一次任务必须把该精确提交发布到公开站点并确认部署成功。详细规则见 `AGENTS.md`。

## 发布地址

[https://cloud-ai-presales-fieldbook.lijx.chatgpt.site](https://cloud-ai-presales-fieldbook.lijx.chatgpt.site)

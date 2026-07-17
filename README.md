# 云计算 × AI 平台售前知识库

面向具有 Python / API 基础的售前人员，以中文为主、专业术语中英对照。知识库围绕概念、架构判断、证据、云服务连接和客户现场问答组织内容。

当前包含完整知识地图与 RAG 样板模块，后续模块沿用同一内容和构图标准扩展。

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

- `app/page.tsx`：知识地图、RAG 模块和实战问答内容
- `app/rag-content.mjs`：RAG 问答、证据卡与来源台账的统一内容源
- `app/globals.css`：阅读版视觉系统与响应式布局
- `tests/rendered-html.test.mjs`：内容、导航和构图规则检查
- `docs/CONTENT-DESIGN-STANDARD.md`：后续模块必须遵守的内容与构图规范
- `docs/CONTENT-MAINTENANCE.md`：仅供维护者使用的事实台账、复核与发布规则
- `.openai/hosting.json`：公开站点发布配置

## 内容维护原则

- 中文正文为主，专业术语首次出现提供准确英文或通行缩写。
- 基础概念讲到当前模块可独立读懂，并回链到唯一的主要归属模块。
- 所有可变事实记录来源和核验日期；不把厂商实验直接写成普遍承诺。
- 每道客户问答标明具体依据、支持范围和边界，并通过稳定来源 ID 回链到统一来源台账。
- 每个技术环节同时说明可能连接的云服务、客户价值和售前发现问题。
- 图、表、代码、案例与问答按理解需要使用，不设数量配额。

## 发布地址

[https://cloud-ai-presales-fieldbook.lijx.chatgpt.site](https://cloud-ai-presales-fieldbook.lijx.chatgpt.site)

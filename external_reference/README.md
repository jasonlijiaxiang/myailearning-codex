# External Reference

这里用于存放为知识库收集的外部参考资料，例如：

- PDF、PPT、Word、Markdown 与 HTML 文件
- 官方文档、论文、标准和厂商白皮书
- 网页链接清单、案例材料与调研记录
- 图片、图表及其他待整理素材

本目录是原始材料投放区，不直接等同于公开页面 `/references`。材料经过核验、归类和提炼后，再把正式来源记录写入 `app/reference-content.mjs`，并由对应模块通过稳定的 `sourceId` 引用。

你可以直接把资料或包含资料的子目录放在这里，暂时不需要预先分类或改名。

## CC-20260717

`CC-20260717/` 当前收录 19 份模块讲义，共 1,715 页。它们与网站 V1.0 的 19 个模块一一对应：

- Solution Patterns、Model Landscape
- RAG、Agent、Multimodal
- MCP、A2A
- Evaluation、Security、AI Gateway、AI Ops
- LLM、Prompt Engineering、Fine-tuning、LLM Training、LLM Inference
- Data Engineering
- AI Infra Platform、AI Infra Compute

本批材料只用于发现知识点、客户问题和可能的云服务连接，不沿用 PPT 目录、章节顺序、卡片数量或结论作为网页结构和内容上限。网站正文必须按售前任务重新组织，并补充讲义没有展开的因果机制、生产失败、方案权衡、验收方法与客户决策。模型版本、价格、榜单、产品能力、性能倍数、协议版本和法规等动态事实，需要回到论文、标准或官方文档核验后，才能登记为公开 `sourceId`。

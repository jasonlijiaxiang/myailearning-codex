const VERIFIED_AT = "2026-08-23";
const NEXT_REVIEW_AT = "2026-09-22";

/**
 * @param {any} item
 */
function product(item) {
  return Object.freeze({
    status: "active",
    verifiedAt: VERIFIED_AT,
    nextReviewAt: NEXT_REVIEW_AT,
    ...item,
    surfaces: Object.freeze(item.surfaces),
    harnessSignals: Object.freeze(item.harnessSignals),
    sourceIds: Object.freeze(item.sourceIds),
  });
}

export const codingAgentProducts = Object.freeze([
  product({ id: "codex", name: "Codex", provider: "OpenAI", market: "国际", surfaces: ["CLI", "IDE", "Cloud"], modelPolicy: "第一方为主", implementation: "商业托管 + 开源 CLI", harnessSignals: ["规则与 Skills", "沙箱与权限", "本地 / 云端任务"], fit: "需要在本地、IDE 与云端任务间切换，并重视仓库规则、工具扩展和受控执行的团队。", boundary: "不要把 Codex 的产品能力外推到所有 OpenAI 模型或任意第三方 Harness。", sourceIds: ["product-codex-docs"], claimId: "coding-agent.codex-active-2026-07-23" }),
  product({ id: "claude-code", name: "Claude Code", provider: "Anthropic", market: "国际", surfaces: ["CLI", "IDE", "Cloud"], modelPolicy: "第一方为主", implementation: "商业产品", harnessSignals: ["终端 / IDE / Web", "项目指令", "工具与权限"], fit: "希望从终端、IDE 或 Web 进入代码库，以 Claude 模型和项目指令组织长任务的团队。", boundary: "产品入口、模型、账户计划、权限、区域和数据策略应分别评估。", sourceIds: ["product-claude-code-docs"], claimId: "coding-agent.claude-code-active-2026-07-23" }),
  product({ id: "github-coding-agents", name: "GitHub Coding Agents", provider: "GitHub / Microsoft", market: "国际", surfaces: ["Cloud"], modelPolicy: "多 Agent 入口", implementation: "商业托管", harnessSignals: ["Issue 到 PR", "PR 评论迭代", "多 Agent 集成"], fit: "工作流已经围绕 GitHub Issue、Pull Request 和组织策略运转，并接受预览期能力变化的团队。", boundary: "当前第三方 Agent、模型、套餐、组织策略、Actions 分钟和 AI credits 均需单独核验；该能力仍为 public preview。", sourceIds: ["product-github-copilot-coding-agent"], claimId: "coding-agent.github-agents-active-2026-07-23" }),
  product({ id: "cursor", name: "Cursor", provider: "Anysphere", market: "国际", surfaces: ["IDE", "CLI", "Cloud"], modelPolicy: "可选多模型", implementation: "商业产品", harnessSignals: ["编辑器上下文", "Rules / Skills", "Cloud Agents"], fit: "把 Agent 深度嵌入编辑器，并需要交互式改码与云端任务协作的团队。", boundary: "编辑器体验、云端执行、模型质量和权限治理应拆开测试；官方能力变化较快。", sourceIds: ["product-cursor-docs"], claimId: "coding-agent.cursor-active-2026-07-23" }),
  product({ id: "kiro", name: "Kiro", provider: "AWS", market: "国际", surfaces: ["CLI", "IDE", "Cloud"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["CLI / IDE / Web", "项目规范", "AWS 生态"], fit: "希望在终端、IDE 与 Web 中采用结构化开发工作流，并与 AWS 开发环境衔接的团队。", boundary: "CLI 2.x 到 3.0 的 session、hooks、Agent 配置和权限兼容性应按目标版本复核。", sourceIds: ["product-kiro-cli"], claimId: "coding-agent.kiro-active-2026-07-23" }),
  product({ id: "devin", name: "Devin", provider: "Cognition", market: "国际", surfaces: ["CLI", "Cloud"], modelPolicy: "平台托管", implementation: "商业托管", harnessSignals: ["托管工作区", "本地 CLI", "Cloud handoff"], fit: "希望在本地入口与云端 Workspace 间交接较完整软件工程任务的团队。", boundary: "本地 CLI、云端托管任务与具体模型、套餐、集成和数据处理应分别核验。", sourceIds: ["product-devin-docs"], claimId: "coding-agent.devin-active-2026-07-23" }),
  product({ id: "openhands", name: "OpenHands", provider: "All Hands AI / Community", market: "国际", surfaces: ["Cloud", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["Agent SDK", "本地 / 远程 Workspace", "Python / REST API"], fit: "需要组合或自托管 Harness，并愿意承担模型、沙箱和运维责任的团队。", boundary: "开源提高可检查性，不自动提供企业支持、安全加固和托管可靠性。", sourceIds: ["product-openhands-docs"], claimId: "coding-agent.openhands-active-2026-07-23" }),
  product({ id: "cline", name: "Cline", provider: "Cline", market: "国际", surfaces: ["CLI", "IDE", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["编辑器 / 终端", "可配置审批", "MCP / SDK"], fit: "希望在编辑器或终端观察文件、命令与浏览器动作，并自由选择模型的团队。", boundary: "审批可配置而非始终人工确认；体验和成本依赖模型、提供方与本地权限。", sourceIds: ["product-cline-docs"], claimId: "coding-agent.cline-active-2026-07-23" }),
  product({ id: "aider", name: "Aider", provider: "Aider Community", market: "国际", surfaces: ["CLI", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["Git 原生", "终端结对", "云端 / 本地模型"], fit: "偏好轻量终端、Git 驱动和显式人工协作，而不需要完整云端自治平台的开发者。", boundary: "产品形态更接近终端结对编程；与云端长任务 Agent 的比较要控制任务类型。", sourceIds: ["product-aider-docs"], claimId: "coding-agent.aider-active-2026-07-23" }),
  product({ id: "opencode", name: "OpenCode", provider: "OpenCode", market: "国际", surfaces: ["CLI", "IDE", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["终端 / 桌面 / IDE", "提供方选择", "本地模型"], fit: "需要开源 Coding Agent、提供方选择和多种客户端入口的团队。", boundary: "开放实现不等于完整企业控制面；身份、隔离、遥测和支持需按部署补齐。", sourceIds: ["product-opencode-docs"], claimId: "coding-agent.opencode-active-2026-07-23" }),
  product({ id: "antigravity", name: "Antigravity CLI", provider: "Google", market: "国际", surfaces: ["CLI", "IDE"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["个人账户迁移", "共享 Agent 引擎", "Google 开发生态"], fit: "使用 Google AI 个人账户并需要从 Gemini CLI 迁移，或评估 Antigravity 2.0 / CLI 路线的团队。", boundary: "这是按账户与认证路径分化的生命周期变化，不是 Gemini CLI 的统一更名或全面停服；企业许可证和 API key 路径须另行核验。", sourceIds: ["product-gemini-cli-individual-transition", "product-antigravity-cli-migration", "product-gemini-cli-releases"], claimId: "coding-agent.antigravity-lifecycle-2026-08-23", status: "watch" }),
  product({ id: "qwen-code", name: "Qwen Code", provider: "Alibaba / Qwen", market: "中国", surfaces: ["CLI", "IDE", "Cloud", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["终端 Agent", "IDE / Actions", "Daemon / SDK"], fit: "需要中文生态、开源 Coding Agent 和可检查 Harness，并希望扩展到 IDE 或自动化工作流的团队。", boundary: "Qwen Code、Qwen 模型服务与 Qoder CN（原通义灵码）是不同产品面，不能混作一个评估对象。", sourceIds: ["product-qwen-code-docs"], claimId: "coding-agent.qwen-code-active-2026-07-23" }),
  product({ id: "kimi-code", name: "Kimi Code", provider: "Moonshot AI", market: "中国", surfaces: ["CLI", "IDE"], modelPolicy: "第一方为主", implementation: "商业产品", harnessSignals: ["CLI Agent", "VS Code", "第三方工具 API"], fit: "希望以 Kimi Code 的 CLI、VS Code 或 API 入口完成代码理解、修改与验证的团队。", boundary: "不同入口的认证、账户、网络、模型和工具权限不同；旧 Python CLI 已不再维护。", sourceIds: ["product-kimi-code-docs"], claimId: "coding-agent.kimi-code-active-2026-07-23" }),
  product({ id: "codebuddy", name: "CodeBuddy", provider: "Tencent", market: "中国", surfaces: ["CLI", "IDE", "Cloud"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["Sub-Agents / Teams", "Skills / Hooks", "Checkpoint / 沙箱"], fit: "需要腾讯生态、CLI 与 IDE、多 Agent 扩展和企业部署入口的团队。", boundary: "CLI 与 IDE 产品面并非完全一致，仍要固定具体版本、模型、权限模式和部署形态。", sourceIds: ["product-codebuddy-docs"], claimId: "coding-agent.codebuddy-active-2026-07-23" }),
  product({ id: "comate", name: "文心快码 Comate", provider: "Baidu", market: "中国", surfaces: ["IDE"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["Agents / Subagents", "Rules / Memory", "MCP / 回退"], fit: "以中国企业 IDE 场景为主，并关注 Agent、规则、记忆和 MCP 集成的团队。", boundary: "插件、AI IDE、个人版、企业版与 VPC 版的能力和数据边界应分别核验。", sourceIds: ["product-comate-agent-docs"], claimId: "coding-agent.comate-active-2026-07-23" }),
  product({ id: "tongyi-lingma", name: "Qoder CN IDE（原通义灵码）", provider: "Alibaba Cloud", market: "中国", surfaces: ["IDE"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["Qoder CN IDE", "JetBrains 插件", "阿里云生态"], fit: "在中国企业 IDE 与阿里云生态中评估 Qoder CN 编码 Agent 的团队。", boundary: "Qoder CN IDE、JetBrains 插件、CLI 与 Cloud Agents 是不同产品面；VS Code 插件已停止维护。", sourceIds: ["product-qoder-cn-series", "product-qoder-cn-ide", "product-qoder-cn-ide-changelog"], claimId: "coding-agent.qoder-cn-ide-active-2026-08-23" }),
]);

export const codingAgentBenchmarks = Object.freeze([
  Object.freeze({ id: "swe-bench", name: "SWE-bench", scope: "真实 GitHub Issue 修复", use: "比较特定模型与 Agent 配置在仓库修复任务上的成功率。", boundary: "不能代表新功能开发、团队协作、安全或企业代码库。", sourceId: "swe-bench" }),
  Object.freeze({ id: "terminal-bench", name: "Terminal-Bench", scope: "终端环境多类任务", use: "观察 Agent 在命令行、工具和环境交互中的端到端能力。", boundary: "任务集、时间与计算预算必须与客户工作负载对齐。", sourceId: "terminal-bench" }),
  Object.freeze({ id: "swe-rebench", name: "SWE-ReBench", scope: "持续刷新软件工程任务", use: "降低静态榜单过时和污染，观察较新的可复现结果。", boundary: "更新更快不等于覆盖更全面，仍需核对 Harness 和模型版本。", sourceId: "swe-rebench" }),
  Object.freeze({ id: "harness-bench", name: "Harness-Bench", scope: "跨模型 Harness 效应", use: "尝试把模型与 Harness 的贡献拆开，验证同模型不同外壳的差异。", boundary: "预印本研究，不是产品认证或统一行业标准。", sourceId: "harness-bench-2026" }),
]);

export const codingAgentLandscapePolicy = Object.freeze({
  verifiedAt: VERIFIED_AT,
  nextReviewAt: NEXT_REVIEW_AT,
  reviewCadenceDays: 30,
  stableMethodReviewDays: 180,
  productCount: codingAgentProducts.length,
});

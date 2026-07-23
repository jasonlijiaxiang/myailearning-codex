const VERIFIED_AT = "2026-07-23";
const NEXT_REVIEW_AT = "2026-08-22";

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
  product({ id: "codex", name: "Codex", provider: "OpenAI", market: "国际", surfaces: ["CLI", "IDE", "Cloud"], modelPolicy: "第一方为主", implementation: "商业托管 + 开源 CLI", harnessSignals: ["规则与 Skills", "沙箱与权限", "本地 / 云任务"], fit: "需要在本地、IDE 与云端任务间切换，并重视仓库规则、工具扩展和受控执行的团队。", boundary: "不要把 Codex 的产品能力外推到所有 OpenAI 模型或任意第三方 Harness。", sourceIds: ["product-codex-docs"], claimId: "coding-agent.codex-active-2026-07-23" }),
  product({ id: "claude-code", name: "Claude Code", provider: "Anthropic", market: "国际", surfaces: ["CLI", "IDE"], modelPolicy: "第一方为主", implementation: "商业产品", harnessSignals: ["终端 Agent", "项目指令", "工具与权限"], fit: "希望从终端进入代码库、以 Claude 模型和项目指令组织长任务的团队。", boundary: "模型强项、产品 Harness 与账户计划应分别评估，不能只凭 Claude 模型榜单选型。", sourceIds: ["product-claude-code-docs"], claimId: "coding-agent.claude-code-active-2026-07-23" }),
  product({ id: "github-coding-agents", name: "GitHub Coding Agents", provider: "GitHub / Microsoft", market: "国际", surfaces: ["Cloud"], modelPolicy: "多 Agent 入口", implementation: "商业托管", harnessSignals: ["Issue 到 PR", "仓库权限", "多 Agent 集成"], fit: "工作流已经围绕 GitHub Issue、分支、Pull Request 和组织策略运转的团队。", boundary: "GitHub 集成层、具体第三方 Agent 与其模型是三层责任，必须分别核验权限和结果。", sourceIds: ["product-github-copilot-coding-agent"], claimId: "coding-agent.github-agents-active-2026-07-23" }),
  product({ id: "cursor", name: "Cursor", provider: "Anysphere", market: "国际", surfaces: ["IDE", "CLI", "Cloud"], modelPolicy: "可选多模型", implementation: "商业产品", harnessSignals: ["编辑器上下文", "Rules / Skills", "后台 Agent"], fit: "把 Agent 深度嵌入编辑器，并需要交互式改码与后台任务协作的团队。", boundary: "编辑器体验、后台执行与模型质量应拆开测试；官方能力变化较快。", sourceIds: ["product-cursor-docs"], claimId: "coding-agent.cursor-active-2026-07-23" }),
  product({ id: "kiro", name: "Kiro", provider: "AWS", market: "国际", surfaces: ["CLI", "IDE"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["CLI / IDE", "项目规范", "AWS 生态"], fit: "希望在 IDE 与终端中采用结构化开发工作流，并与 AWS 开发环境衔接的团队。", boundary: "产品路线和原 Amazon Q Developer 能力迁移应按当期公告核验。", sourceIds: ["product-kiro-cli"], claimId: "coding-agent.kiro-active-2026-07-23" }),
  product({ id: "devin", name: "Devin", provider: "Cognition", market: "国际", surfaces: ["Cloud"], modelPolicy: "平台托管", implementation: "商业托管", harnessSignals: ["托管工作区", "异步委托", "团队协作"], fit: "希望把较完整的软件工程任务交给云端工作空间异步执行和复核的团队。", boundary: "托管自治任务与本地结对式 CLI 不是同一产品形态，不能用单一榜分替代流程适配。", sourceIds: ["product-devin-docs"], claimId: "coding-agent.devin-active-2026-07-23" }),
  product({ id: "openhands", name: "OpenHands", provider: "All Hands AI / Community", market: "国际", surfaces: ["Cloud", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["Agent SDK", "自定义运行时", "开放实现"], fit: "需要检查、修改或自托管 Harness，并愿意承担模型、沙箱和运维责任的团队。", boundary: "开源提高可检查性，不自动提供企业支持、安全加固和托管可靠性。", sourceIds: ["product-openhands-docs"], claimId: "coding-agent.openhands-active-2026-07-23" }),
  product({ id: "cline", name: "Cline", provider: "Cline", market: "国际", surfaces: ["IDE", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["编辑器协作", "动作审批", "MCP 扩展"], fit: "希望在编辑器内明确观察和批准文件、终端与浏览器动作，并自由选择模型的团队。", boundary: "体验和成本高度依赖所选模型、提供方与本地权限配置。", sourceIds: ["product-cline-docs"], claimId: "coding-agent.cline-active-2026-07-23" }),
  product({ id: "aider", name: "Aider", provider: "Aider Community", market: "国际", surfaces: ["CLI", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["Git 原生", "终端结对", "模型路由"], fit: "偏好轻量终端、Git 驱动和显式人工协作，而不需要完整云端自治平台的开发者。", boundary: "产品形态更接近终端结对编程；与云端长任务 Agent 的比较要控制任务类型。", sourceIds: ["product-aider-docs"], claimId: "coding-agent.aider-active-2026-07-23" }),
  product({ id: "opencode", name: "OpenCode", provider: "OpenCode", market: "国际", surfaces: ["CLI", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["终端 Agent", "提供方选择", "可扩展工具"], fit: "需要开源终端 Agent、提供方选择和较强自定义空间的团队。", boundary: "开放实现不等于完整企业控制面；身份、隔离、遥测和支持需按部署补齐。", sourceIds: ["product-opencode-docs"], claimId: "coding-agent.opencode-active-2026-07-23" }),
  product({ id: "antigravity", name: "Antigravity CLI", provider: "Google", market: "国际", surfaces: ["CLI", "IDE"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["Gemini CLI 迁移", "共享 Harness", "Google 开发生态"], fit: "正在评估 Google Coding Agent 路线，或需要从 Gemini CLI 迁移的团队。", boundary: "这是生命周期变化中的产品；迁移节点、兼容性和企业能力应优先复核。", sourceIds: ["product-antigravity-migration"], claimId: "coding-agent.antigravity-transition-2026-07-23", status: "watch" }),
  product({ id: "qwen-code", name: "Qwen Code", provider: "Alibaba / Qwen", market: "中国", surfaces: ["CLI", "Open Source"], modelPolicy: "可接多模型", implementation: "开源可扩展", harnessSignals: ["终端 Agent", "开放实现", "工具扩展"], fit: "需要中文生态、开源终端 Agent 和可检查 Harness 的团队。", boundary: "开源 CLI、Qwen 模型服务与通义灵码是不同产品面，不能混作一个评估对象。", sourceIds: ["product-qwen-code-docs"], claimId: "coding-agent.qwen-code-active-2026-07-23" }),
  product({ id: "kimi-code", name: "Kimi Code", provider: "Moonshot AI", market: "中国", surfaces: ["CLI"], modelPolicy: "第一方为主", implementation: "商业产品", harnessSignals: ["终端 Agent", "Kimi 模型", "本地代码协作"], fit: "希望以 Kimi 模型和终端工作流完成代码理解、修改与验证的团队。", boundary: "账户、网络、模型与工具权限会影响可用性，应使用真实仓库复测。", sourceIds: ["product-kimi-code-docs"], claimId: "coding-agent.kimi-code-active-2026-07-23" }),
  product({ id: "codebuddy", name: "CodeBuddy", provider: "Tencent", market: "中国", surfaces: ["CLI", "IDE", "Cloud"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["Skills / Hooks", "Checkpoint", "沙箱与企业部署"], fit: "需要腾讯生态、CLI 与 IDE、多种扩展和企业部署入口的团队。", boundary: "官方文档覆盖面较广，选型时仍要固定具体版本、模型、权限模式和部署形态。", sourceIds: ["product-codebuddy-docs"], claimId: "coding-agent.codebuddy-active-2026-07-23" }),
  product({ id: "comate", name: "文心快码 Comate", provider: "Baidu", market: "中国", surfaces: ["IDE"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["Agents / Subagents", "Rules / Memory", "MCP"], fit: "以中国企业 IDE 场景为主，并关注 Agent、规则、记忆和 MCP 集成的团队。", boundary: "官网功能入口不能替代企业控制、数据边界和目标语言栈的实际 PoC。", sourceIds: ["product-comate-agent-docs"], claimId: "coding-agent.comate-active-2026-07-23" }),
  product({ id: "tongyi-lingma", name: "通义灵码", provider: "Alibaba Cloud", market: "中国", surfaces: ["IDE"], modelPolicy: "平台托管", implementation: "商业产品", harnessSignals: ["IDE 助手", "阿里云生态", "企业入口"], fit: "主要在中国企业 IDE 与阿里云生态中评估代码助手和 Agent 能力的团队。", boundary: "当前台账只确认官方产品与安装入口；详细 Harness 能力必须在目标版本功能文档和 PoC 中补证。", sourceIds: ["product-tongyi-lingma"], claimId: "coding-agent.tongyi-lingma-active-2026-07-23" }),
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

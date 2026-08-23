export const englishSupplementalSourceCopy = Object.freeze({
  "scicode-verified-2026": Object.freeze({
    kind: "Preprint · task-specific research",
    shortTitle: "SciCode-Verified",
    note: "An independent domain-expert audit reports specification and grading defects in the original SciCode test set that reject many correct solutions, and releases a corrected dataset with an audit trail. Neither SciCode nor Artificial Analysis has adopted it as a replacement series, so it marks validity risk rather than silently rewriting the published scores.",
  }),
  "miracl-2023": Object.freeze({
    kind: "Peer-reviewed benchmark paper",
    shortTitle: "MIRACL",
    note: "Provides native-language retrieval queries, passages, and relevance judgments across 18 languages. It supports multilingual retrieval evaluation, not cross-language retrieval claims or enterprise-domain suitability.",
  }),
  "china-ai-content-labeling": Object.freeze({
    kind: "Official regulatory instrument",
    shortTitle: "China AI Content Labeling Measures",
    note: "Sets China-specific labeling requirements for AI-generated or synthetic content, including explicit and metadata-based labels, and assigns duties to relevant service and dissemination roles. Applicability turns on the product, content, role, and jurisdiction and needs qualified review.",
  }),
  "opentelemetry-genai-observability-2026": Object.freeze({
    kind: "Official technical article",
    shortTitle: "OpenTelemetry GenAI Observability",
    note: "Explains how GenAI spans and metrics can expose model calls, tokens, latency, and tool activity through OpenTelemetry. Semantic conventions evolve, and telemetry does not by itself establish quality, cost, security, or business outcomes.",
  }),
  "product-codex-docs": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Codex Docs",
    note: "Documents Codex across CLI, IDE, and cloud surfaces, including local work, rules, Skills, sandboxing, permissions, and extensions. Model access, plan limits, platform behavior, and release status must be verified at selection time.",
  }),
  "product-claude-code-docs": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Claude Code",
    note: "Introduces Claude Code as an agentic coding tool that can read a codebase, edit files, and run commands across Terminal, IDE, Desktop, and Web surfaces. Verify models, plans, permissions, regions, data handling, and enterprise controls separately.",
  }),
  "product-github-copilot-coding-agent": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "GitHub Coding Agents",
    note: "Documents GitHub's public-preview third-party coding-agent integrations for starting asynchronous tasks from issues or prompts, creating pull requests, and iterating through pull-request comments. Supported agents, models, authorization, billing, and organization controls can change.",
  }),
  "product-cursor-docs": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Cursor Agent Docs",
    note: "Documents Cursor's Agent, Rules, Skills, MCP, Cloud Agents, and CLI surfaces. Model choices, cloud execution, plugins, subagents, hooks, SDK behavior, permissions, and team governance must be checked for the deployed version.",
  }),
  "product-kiro-cli": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Kiro CLI",
    note: "Documents installation and terminal-agent workflows for Kiro CLI. Validate session, hook, agent-configuration, and permission compatibility between CLI 2.x and 3.0, as well as account, region, model, IDE, web, and enterprise capabilities, against the target version.",
  }),
  "product-devin-docs": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Devin",
    note: "Introduces Devin's web and hosted Workspace software-engineering workflow. Official documentation also provides a local Devin CLI and handoff to Cloud Devin; verify each surface's autonomy boundary, integrations, data handling, models, and plans separately.",
  }),
  "product-openhands-docs": Object.freeze({
    kind: "Official technical documentation",
    shortTitle: "OpenHands SDK",
    note: "Documents the open-source OpenHands Software Agent SDK for composing agents, tools, and local or remote workspaces through Python and REST APIs, with local or cloud execution. Deployment security, model integration, tool permissions, and production operations remain the adopter's responsibility.",
  }),
  "product-cline-docs": Object.freeze({
    kind: "Official technical documentation",
    shortTitle: "Cline",
    note: "Documents Cline as an open-source coding agent for editors and terminals, with CLI, VS Code, JetBrains, Kanban, and SDK entry points. Model-provider choice, configurable approvals, extensions, and execution boundaries are controlled by the user's environment.",
  }),
  "product-aider-docs": Object.freeze({
    kind: "Official technical documentation",
    shortTitle: "Aider",
    note: "Documents Aider as a terminal AI pair-programming tool with deep local Git integration and support for cloud or local LLMs. Its interaction model differs from a hosted asynchronous agent.",
  }),
  "product-opencode-docs": Object.freeze({
    kind: "Official technical documentation",
    shortTitle: "OpenCode",
    note: "Documents OpenCode as an open-source coding agent available through terminal, desktop, and IDE surfaces with multiple providers and local-model options. Authorization, isolation, telemetry, support, and data handling depend on the selected deployment.",
  }),
  "product-antigravity-migration": Object.freeze({
    kind: "Official announcement",
    shortTitle: "Antigravity CLI Transition",
    note: "Announces the transition of Gemini CLI individual-account access to Antigravity CLI. Interpret it together with the subsequent status update, migration guide, and repository releases; it is not evidence of a uniform Gemini CLI rename or shutdown.",
  }),
  "product-gemini-cli-individual-transition": Object.freeze({
    kind: "Official announcement",
    shortTitle: "Gemini CLI Account Transition",
    note: "States that requests through Google AI Pro, Ultra, and free individual accounts moved from Gemini CLI to Antigravity CLI on June 18, 2026, while Standard or Enterprise licenses, Google Cloud, and paid API-key paths were unaffected by that individual-account change.",
  }),
  "product-antigravity-cli-migration": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Antigravity CLI Migration Guide",
    note: "Documents migration from Gemini CLI to Antigravity CLI and places Antigravity CLI and Antigravity 2.0 on a shared core agent engine. Verify plugin, Skill, MCP, theme, compatibility, and enterprise behavior for the target version.",
  }),
  "product-gemini-cli-releases": Object.freeze({
    kind: "Official source repository",
    shortTitle: "Gemini CLI Releases",
    note: "The official repository release page confirms that Gemini CLI continues to publish versions. Repository activity does not imply unchanged account authentication paths, service quotas, or enterprise capabilities.",
  }),
  "product-qwen-code-docs": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Qwen Code",
    note: "Documents Qwen Code with an open-source CLI at its core and IDE, GitHub Actions, desktop, daemon, and SDK surfaces. Verify service availability, authentication, quotas, data boundaries, and version compatibility for the chosen integration.",
  }),
  "product-kimi-code-docs": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Kimi Code",
    note: "Introduces Kimi Code through CLI, VS Code, and API entry points for third-party developer tools. Authentication, accounts, networking, models, tool permissions, and plan capabilities differ by surface; the older Python CLI is no longer maintained.",
  }),
  "product-codebuddy-docs": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "CodeBuddy",
    note: "Documents CodeBuddy's CLI and IDE surfaces, including MCP, sub-agents, agent teams, Skills, Hooks, plugins, checkpoints, permission controls, and Bash sandboxing. Verify each surface's version, model, enterprise deployment, and data-governance capabilities in the procurement environment.",
  }),
  "product-comate-agent-docs": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Comate Agent",
    note: "Documents Agents, subagents, Rules, Memory, MCP, checkpoints, and rollback for Comate IDE. Verify the plugin, AI IDE, individual, enterprise, and VPC offerings separately, including models, enterprise controls, and data boundaries.",
  }),
  "product-tongyi-lingma": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Tongyi Lingma historical entry",
    note: "Preserves the former Tongyi Lingma brand and IDE download entry for traceability. Use current Qoder CN documentation for the active brand, maintained clients, and product family.",
  }),
  "product-qoder-cn-series": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Qoder CN product family",
    note: "States that Alibaba Cloud renamed Tongyi Lingma to the Qoder CN product family on May 20, 2026, and distinguishes Qoder CN IDE, plugins, CLI, and Cloud Agents as separate surfaces.",
  }),
  "product-qoder-cn-ide": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "Qoder CN IDE",
    note: "Documents the current Qoder CN IDE positioning and client lifecycle: the JetBrains plugin remains available while the VS Code plugin is no longer maintained. Verify models, credits, plans, and enterprise policy separately.",
  }),
  "product-qoder-cn-ide-changelog": Object.freeze({
    kind: "Official announcement",
    shortTitle: "Qoder CN changelog",
    note: "Records the Qoder CN IDE name for the coding desktop application from August 14, 2026. The changelog establishes naming and lifecycle timing, not complete feature, plan, or enterprise-control coverage.",
  }),
});

import { codingAgentBenchmarks, codingAgentLandscapePolicy, codingAgentProducts } from "../../coding-agent-landscape.mjs";

const productCopy = Object.freeze({
  codex: Object.freeze({ name: "Codex", market: "Global", modelPolicy: "Primarily first-party", implementation: "Hosted product with an open-source CLI", harnessSignals: ["Rules and Skills", "Sandboxing and permissions", "Local and cloud tasks"], fit: "Teams that move between local work, the IDE, and cloud tasks and need repository rules, extensibility, and controlled execution.", boundary: "Do not generalize Codex product behavior to every OpenAI model or an arbitrary third-party harness." }),
  "claude-code": Object.freeze({ name: "Claude Code", market: "Global", modelPolicy: "Primarily first-party", implementation: "Commercial product", harnessSignals: ["Terminal, IDE, and web", "Project instructions", "Tools and permissions"], fit: "Teams that enter a codebase from the terminal, an IDE, or the web and organize long-running work with Claude models and project instructions.", boundary: "Evaluate product surfaces, models, account plans, permissions, regions, and data policies separately." }),
  "github-coding-agents": Object.freeze({ name: "GitHub Coding Agents", market: "Global", modelPolicy: "Multi-agent entry point", implementation: "Commercial hosted service", harnessSignals: ["Issue-to-PR workflow", "PR comment iteration", "Multiple agent integrations"], fit: "Organizations whose work already runs through GitHub issues, pull requests, and organization policy and that accept preview-stage change.", boundary: "Verify the currently supported agents, models, plans, organization policy, Actions minutes, and AI credits separately; this capability remains in public preview." }),
  cursor: Object.freeze({ name: "Cursor", market: "Global", modelPolicy: "Model choice", implementation: "Commercial product", harnessSignals: ["Editor context", "Rules and Skills", "Cloud Agents"], fit: "Teams that want agent work embedded in the editor while coordinating interactive changes and cloud tasks.", boundary: "Test editor experience, cloud execution, model quality, and permission governance independently; product capabilities change quickly." }),
  kiro: Object.freeze({ name: "Kiro", market: "Global", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["CLI, IDE, and web", "Project specifications", "AWS ecosystem"], fit: "Teams that want a structured development workflow across terminal, IDE, and web surfaces with an AWS development environment.", boundary: "Validate session, hook, agent-configuration, and permission compatibility between CLI 2.x and 3.0 against the target version." }),
  devin: Object.freeze({ name: "Devin", market: "Global", modelPolicy: "Platform-managed", implementation: "Commercial hosted service", harnessSignals: ["Hosted workspace", "Local CLI", "Cloud handoff"], fit: "Teams that want to hand off substantial software-engineering tasks between a local entry point and a cloud workspace.", boundary: "Evaluate the local CLI, hosted cloud tasks, models, plans, integrations, and data handling separately." }),
  openhands: Object.freeze({ name: "OpenHands", market: "Global", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Agent SDK", "Local and remote workspaces", "Python and REST APIs"], fit: "Teams that need to compose or self-host the harness and can own model integration, sandboxing, and operations.", boundary: "Open source improves inspectability; it does not automatically provide enterprise support, security hardening, or hosted reliability." }),
  cline: Object.freeze({ name: "Cline", market: "Global", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Editor and terminal", "Configurable approvals", "MCP and SDK"], fit: "Teams that want to observe file, command, and browser actions in an editor or terminal while selecting their own model.", boundary: "Approvals are configurable rather than always manual; experience and cost depend on the model, provider, and local permissions." }),
  aider: Object.freeze({ name: "Aider", market: "Global", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Git-native workflow", "Terminal pairing", "Cloud and local models"], fit: "Developers who prefer a lightweight terminal and Git workflow with explicit human collaboration rather than a complete hosted autonomy platform.", boundary: "Its operating model is closer to terminal pair programming; control task type when comparing it with cloud-based long-running agents." }),
  opencode: Object.freeze({ name: "OpenCode", market: "Global", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Terminal, desktop, and IDE", "Provider choice", "Local models"], fit: "Teams that need an open-source coding agent, provider choice, and multiple client surfaces.", boundary: "An open implementation is not a complete enterprise control plane; supply identity, isolation, telemetry, and support for the chosen deployment." }),
  antigravity: Object.freeze({ name: "Antigravity CLI", market: "Global", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["Individual-account migration", "Shared agent engine", "Google developer ecosystem"], fit: "Teams using individual Google AI accounts that need to migrate from Gemini CLI, or evaluating the Antigravity 2.0 and CLI path.", boundary: "This is a lifecycle split by account and authentication path, not a uniform Gemini CLI rename or shutdown; verify enterprise-license and API-key paths separately." }),
  "qwen-code": Object.freeze({ name: "Qwen Code", market: "China", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Terminal agent", "IDE and Actions", "Daemon and SDK"], fit: "Teams that need a China-focused ecosystem and an inspectable open-source coding agent that can extend into IDE or automation workflows.", boundary: "Qwen Code, Qwen model services, and Qoder CN, formerly Tongyi Lingma, are separate product surfaces and must not be treated as one evaluation target." }),
  "kimi-code": Object.freeze({ name: "Kimi Code", market: "China", modelPolicy: "Primarily first-party", implementation: "Commercial product", harnessSignals: ["CLI agent", "VS Code", "Third-party tool API"], fit: "Teams using Kimi Code through its CLI, VS Code, or API entry points for code understanding, modification, and validation.", boundary: "Authentication, account, networking, models, and tool permissions differ by entry point; the older Python CLI is no longer maintained." }),
  codebuddy: Object.freeze({ name: "CodeBuddy", market: "China", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["Sub-agents and teams", "Skills and Hooks", "Checkpoints and sandboxing"], fit: "Teams that need the Tencent ecosystem, CLI and IDE surfaces, multi-agent extensions, and enterprise deployment options.", boundary: "CLI and IDE surfaces are not identical; fix the version, model, permission mode, and deployment before evaluation." }),
  comate: Object.freeze({ name: "Comate", market: "China", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["Agents and subagents", "Rules and memory", "MCP and rollback"], fit: "Teams centered on China enterprise IDE workflows and interested in agents, rules, memory, and MCP integration.", boundary: "Evaluate the plugin, AI IDE, individual, enterprise, and VPC offerings separately, including their data boundaries." }),
  "tongyi-lingma": Object.freeze({ name: "Qoder CN IDE (formerly Tongyi Lingma)", market: "China", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["Qoder CN IDE", "JetBrains plugin", "Alibaba Cloud ecosystem"], fit: "Teams evaluating the Qoder CN coding agent in Alibaba Cloud and China-focused enterprise IDE environments.", boundary: "Qoder CN IDE, the JetBrains plugin, CLI, and Cloud Agents are distinct product surfaces; the VS Code plugin is no longer maintained." }),
});

const benchmarkCopy = Object.freeze({
  "swe-bench": Object.freeze({ scope: "Real GitHub issue resolution", use: "Compare a specified model-and-agent configuration on repository repair tasks.", boundary: "It does not represent new feature development, team collaboration, security, or an enterprise codebase." }),
  "terminal-bench": Object.freeze({ scope: "Multi-step terminal tasks", use: "Observe end-to-end behavior across command-line tools and environments.", boundary: "The task set, time limit, and compute budget must be comparable to the customer's workload." }),
  "swe-rebench": Object.freeze({ scope: "Continuously refreshed software-engineering tasks", use: "Reduce stale-leaderboard and contamination risk while observing newer reproducible results.", boundary: "Faster updates do not mean broader coverage; still verify the harness and model version." }),
  "harness-bench": Object.freeze({ scope: "Harness effects across models", use: "Separate model and harness contributions and test how the same model changes across wrappers.", boundary: "It is a preprint, not product certification or a universal industry standard." }),
});

function localizeProduct(product) {
  const copy = productCopy[product.id];
  if (!copy) throw new Error(`Missing English coding-agent copy: ${product.id}`);
  return Object.freeze({
    ...product,
    ...copy,
    harnessSignals: Object.freeze(copy.harnessSignals),
    sourceIds: Object.freeze(product.sourceIds),
  });
}

function localizeBenchmark(benchmark) {
  const copy = benchmarkCopy[benchmark.id];
  if (!copy) throw new Error(`Missing English coding benchmark copy: ${benchmark.id}`);
  return Object.freeze({ ...benchmark, ...copy });
}

export const englishCodingAgentProducts = Object.freeze(codingAgentProducts.map(localizeProduct));
export const englishCodingAgentBenchmarks = Object.freeze(codingAgentBenchmarks.map(localizeBenchmark));
export const englishCodingAgentLandscapePolicy = Object.freeze({
  ...codingAgentLandscapePolicy,
  reviewCadence: "30 days for dynamic product facts",
  stableMethodReview: "180 days for stable methodology",
});

export const englishCodingAgentExplorerLabels = Object.freeze({
  locale: "en-US",
  all: "All",
  markets: Object.freeze(["Global", "China"]),
  surfaces: Object.freeze(["CLI", "IDE", "Cloud", "Open Source"]),
  modelPolicies: Object.freeze(["Primarily first-party", "Platform-managed", "Model choice", "Bring-your-own model", "Multi-agent entry point"]),
  searchLabel: "Search product, provider, or harness capability",
  searchPlaceholder: "Try CLI, open source, checkpoint, Tencent…",
  filtersAriaLabel: "Product filters",
  marketLabel: "Market",
  surfaceLabel: "Surface",
  modelPolicyLabel: "Model policy",
  showingPrefix: "Showing",
  showingSuffix: "products",
  clear: "Clear filters",
  activeStatus: "Verified",
  watchStatus: "Watch",
  productShape: "Product surface",
  implementation: "Implementation",
  fit: "Start here when: ",
  boundary: "Boundary: ",
  verified: "Verified",
  nextReview: "review by",
  sourceLink: "Official source ↗",
  emptyTitle: "No product matches these filters",
  emptyBody: "Clear the filters or try another product surface and keyword.",
  showAll: "Show all products",
});

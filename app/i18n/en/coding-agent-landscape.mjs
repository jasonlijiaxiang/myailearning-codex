import { codingAgentBenchmarks, codingAgentLandscapePolicy, codingAgentProducts } from "../../coding-agent-landscape.mjs";

const productCopy = Object.freeze({
  codex: Object.freeze({ name: "Codex", market: "Global", modelPolicy: "Primarily first-party", implementation: "Hosted product with an open-source CLI", harnessSignals: ["Rules and Skills", "Sandboxing and permissions", "Local and cloud tasks"], fit: "Teams that move between local work, the IDE, and cloud tasks and need repository rules, extensibility, and controlled execution.", boundary: "Do not generalize Codex product behavior to every OpenAI model or an arbitrary third-party harness." }),
  "claude-code": Object.freeze({ name: "Claude Code", market: "Global", modelPolicy: "Primarily first-party", implementation: "Commercial product", harnessSignals: ["Terminal agent", "Project instructions", "Tools and permissions"], fit: "Teams that work from the terminal in a codebase and organize long-running work with Claude models and project instructions.", boundary: "Evaluate model strengths, the product harness, and the account plan separately; do not select from a Claude model leaderboard alone." }),
  "github-coding-agents": Object.freeze({ name: "GitHub Coding Agents", market: "Global", modelPolicy: "Multi-agent entry point", implementation: "Commercial hosted service", harnessSignals: ["Issue-to-PR workflow", "Repository permissions", "Multiple agent integrations"], fit: "Organizations whose work already runs through GitHub issues, branches, pull requests, and organization policy.", boundary: "The GitHub integration layer, each third-party agent, and its model are separate responsibilities; verify permissions and outcomes at each layer." }),
  cursor: Object.freeze({ name: "Cursor", market: "Global", modelPolicy: "Model choice", implementation: "Commercial product", harnessSignals: ["Editor context", "Rules and Skills", "Background agents"], fit: "Teams that want agent work embedded in the editor while coordinating interactive changes and background tasks.", boundary: "Test editor experience, background execution, and model quality independently; product capabilities change quickly." }),
  kiro: Object.freeze({ name: "Kiro", market: "Global", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["CLI and IDE", "Project specifications", "AWS ecosystem"], fit: "Teams that want a structured development workflow in the IDE and terminal with an AWS development environment.", boundary: "Verify the current product roadmap and any migration from Amazon Q Developer against the applicable announcement." }),
  devin: Object.freeze({ name: "Devin", market: "Global", modelPolicy: "Platform-managed", implementation: "Commercial hosted service", harnessSignals: ["Hosted workspace", "Asynchronous delegation", "Team collaboration"], fit: "Teams that want complete software-engineering tasks executed asynchronously in a cloud workspace and then reviewed.", boundary: "A hosted autonomous task and a local pair-programming CLI are different operating models; a single score cannot replace workflow fit." }),
  openhands: Object.freeze({ name: "OpenHands", market: "Global", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Agent SDK", "Custom runtime", "Open implementation"], fit: "Teams that need to inspect, modify, or self-host the harness and can own model integration, sandboxing, and operations.", boundary: "Open source improves inspectability; it does not automatically provide enterprise support, security hardening, or hosted reliability." }),
  cline: Object.freeze({ name: "Cline", market: "Global", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Editor collaboration", "Action approvals", "MCP extensions"], fit: "Teams that want to see and approve editor, terminal, and browser actions while selecting their own model.", boundary: "Experience and cost depend heavily on the selected model, provider, and local permission configuration." }),
  aider: Object.freeze({ name: "Aider", market: "Global", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Git-native workflow", "Terminal pairing", "Model routing"], fit: "Developers who prefer a lightweight terminal and Git workflow with explicit human collaboration rather than a complete hosted autonomy platform.", boundary: "Its operating model is closer to terminal pair programming; control task type when comparing it with cloud-based long-running agents." }),
  opencode: Object.freeze({ name: "OpenCode", market: "Global", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Terminal agent", "Provider choice", "Extensible tools"], fit: "Teams that need an open-source terminal agent, provider choice, and room to customize the harness.", boundary: "An open implementation is not a complete enterprise control plane; supply identity, isolation, telemetry, and support for the chosen deployment." }),
  antigravity: Object.freeze({ name: "Antigravity CLI", market: "Global", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["Gemini CLI migration", "Shared harness", "Google developer ecosystem"], fit: "Teams evaluating Google's coding-agent direction or planning a migration from Gemini CLI.", boundary: "This product is in a lifecycle transition; verify migration timing, compatibility, and enterprise capabilities first." }),
  "qwen-code": Object.freeze({ name: "Qwen Code", market: "China", modelPolicy: "Bring-your-own model", implementation: "Open-source, extensible", harnessSignals: ["Terminal agent", "Open implementation", "Tool extensions"], fit: "Teams that need a China-focused ecosystem, an open-source terminal agent, and an inspectable harness.", boundary: "The open CLI, Qwen model service, and Tongyi Lingma are separate product surfaces and must not be treated as one evaluation target." }),
  "kimi-code": Object.freeze({ name: "Kimi Code", market: "China", modelPolicy: "Primarily first-party", implementation: "Commercial product", harnessSignals: ["Terminal agent", "Kimi models", "Local code collaboration"], fit: "Teams using Kimi models and a terminal workflow for code understanding, modification, and validation.", boundary: "Accounts, networking, model access, and tool permissions affect availability; retest on a representative repository." }),
  codebuddy: Object.freeze({ name: "CodeBuddy", market: "China", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["Skills and Hooks", "Checkpoints", "Sandboxing and enterprise deployment"], fit: "Teams that need the Tencent ecosystem, CLI and IDE surfaces, extensions, and enterprise deployment options.", boundary: "Even broad official documentation does not replace a fixed-version, fixed-model, fixed-permission, deployment-specific evaluation." }),
  comate: Object.freeze({ name: "Comate", market: "China", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["Agents and subagents", "Rules and memory", "MCP"], fit: "Teams centered on China enterprise IDE workflows and interested in agents, rules, memory, and MCP integration.", boundary: "A product page cannot substitute for a PoC of enterprise controls, data boundaries, and the target language stack." }),
  "tongyi-lingma": Object.freeze({ name: "Tongyi Lingma", market: "China", modelPolicy: "Platform-managed", implementation: "Commercial product", harnessSignals: ["IDE assistant", "Alibaba Cloud ecosystem", "Enterprise entry points"], fit: "Teams evaluating an IDE assistant in Alibaba Cloud and China-focused enterprise environments.", boundary: "This entry verifies the product and installation path only; confirm agent features, models, enterprise policy, and plan in current documentation and a target-version PoC." }),
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

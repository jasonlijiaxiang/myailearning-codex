export const agentPlatformSourceCopy = Object.freeze({
  "veadk-agent-source-2026-08-15": Object.freeze({
    kind: "Official source code",
    shortTitle: "VeADK Agent Source",
    note: "Shows the current VeADK Agent implementation and its Google ADK LlmAgent base. The pinned snapshot establishes current code lineage, not future compatibility.",
  }),
  "veadk-runner-source-2026-08-15": Object.freeze({
    kind: "Official source code",
    shortTitle: "VeADK Runner Source",
    note: "Shows the current default VeADK Runner path, its Google ADK Runner base, and its session-facing execution surface. Optional runtime modes, application behavior, and compatibility still depend on the tested backend, dependency set, and configuration.",
  }),
  "veadk-agentkit-integration-2026-08-15": Object.freeze({
    kind: "Official integration documentation",
    shortTitle: "VeADK AgentKit Integration",
    note: "Documents create_agentkit_app as an AgentKit-compatible application adapter around a root agent. It does not provision or certify a cloud Runtime.",
  }),
  "veadk-short-term-memory-2026-08-15": Object.freeze({
    kind: "Official technical documentation",
    shortTitle: "VeADK Short-Term Memory",
    note: "Documents short-term session-memory backends and distinguishes distributed database persistence from in-memory and local-file options. Target multi-instance continuity, failover, isolation, retention, and recovery still require tests.",
  }),
  "veadk-builtin-tools-2026-08-15": Object.freeze({
    kind: "Official framework documentation",
    shortTitle: "VeADK Built-in Web Tools",
    note: "Documents the concrete web_search and web_fetch functions and their module import paths. Availability does not establish authorization, mandatory selection, or correct business outcomes.",
  }),
  "agentkit-platform-overview-2026-08-15": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "AgentKit Platform Overview",
    note: "Describes AgentKit's application-development and delivery scope. Platform capability does not establish application correctness, end-to-end readiness, or a customer SLO.",
  }),
  "agentkit-cli-overview-2026-08-15": Object.freeze({
    kind: "Official technical documentation",
    shortTitle: "AgentKit CLI Overview",
    note: "Defines the normal CLI lifecycle: build creates an image, deploy targets a built image, and launch combines build and deployment. Artifact and Runtime evidence remain necessary.",
  }),
  "agentkit-cli-commands-2026-08-15": Object.freeze({
    kind: "Official command reference",
    shortTitle: "AgentKit CLI Commands",
    note: "Documents lifecycle command syntax and options, including paths whose internal stages need log-level inspection. It does not prove that a particular command run produced an accepted service.",
  }),
  "agentkit-config-reference-2026-08-15": Object.freeze({
    kind: "Official configuration reference",
    shortTitle: "AgentKit Configuration Reference",
    note: "Documents application and Runtime configuration surfaces. A configured resource reference does not prove data-plane reachability, authorization, or correct behavior.",
  }),
  "agentkit-runtime-quickstart-2026-08-15": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "AgentKit Runtime Quickstart",
    note: "Documents the Runtime deployment and invocation path. Resource readiness does not establish identity, dependency, quality, load, observability, recovery, or acceptance against a customer-defined SLO.",
  }),
  "agentkit-memory-quickstart-2026-08-15": Object.freeze({
    kind: "Official product documentation",
    shortTitle: "AgentKit Memory Quickstart",
    note: "Documents memory resource creation and application integration. A binding does not prove retrieval freshness, identity isolation, deletion behavior, or source-of-truth status.",
  }),
  "mem0-oss-overview-2026-08-15": Object.freeze({
    kind: "Official project documentation",
    shortTitle: "Mem0 Open Source Overview",
    note: "Describes the self-managed open-source memory project and integration surface. The adopting team retains deployment, security, upgrade, observability, backup, and recovery ownership.",
  }),
  "mem0-platform-vs-oss-2026-08-15": Object.freeze({
    kind: "Official product comparison",
    shortTitle: "Mem0 Platform vs Open Source",
    note: "Compares managed and self-managed Mem0 delivery choices. It does not establish that AgentKit Memory uses or is operated by Mem0, nor does it establish regional availability, data residency, or SLA terms. The application still owns identity scope, data governance, retrieval tests, and checks against authoritative systems.",
  }),
});

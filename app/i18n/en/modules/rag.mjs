import {
  evidenceCards as canonicalEvidenceCards,
  ragDeepDives as canonicalDeepDives,
  ragLearningContent as canonicalLearningContent,
  ragQa as canonicalQa,
} from "../../../rag-content.mjs";

/**
 * @param {string} title
 * @param {string | undefined} intro
 * @param {any[]} items
 */
const cards = (title, intro, items) => ({ type: "cards", title, intro, items });
/**
 * @param {string} title
 * @param {string | undefined} intro
 * @param {any[]} items
 */
const steps = (title, intro, items) => ({ type: "steps", title, intro, items });
/**
 * @param {string} title
 * @param {string | undefined} intro
 * @param {string[]} columns
 * @param {any[]} items
 */
const table = (title, intro, columns, items) => ({ type: "table", title, intro, columns, items });
/**
 * @param {string} id
 * @param {string} title
 * @param {string} body
 */
const boundary = (id, title, body) => ({
  type: "boundary",
  title,
  items: [{ id, title, body }],
});

/**
 * @param {any} item
 * @param {string | ((item: any) => string | undefined)} key
 * @param {string} label
 */
const keyOf = (item, key, label) => {
  const value = typeof key === "function" ? key(item) : item?.[key];
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${label} is missing a stable identity`);
  }
  return value;
};

/**
 * @param {readonly any[]} items
 * @param {string | ((item: any) => string | undefined)} key
 * @param {string} label
 */
const indexUnique = (items, key, label) => {
  if (!Array.isArray(items)) throw new Error(`${label} must be an array`);
  const indexed = new Map();
  for (const item of items) {
    const value = keyOf(item, key, label);
    if (indexed.has(value)) throw new Error(`${label} repeats ${value}`);
    indexed.set(value, item);
  }
  return indexed;
};

/**
 * @param {{ canonicalItems: readonly any[]; canonicalKey: string | ((item: any) => string | undefined); englishItems: readonly any[]; englishKey: string | ((item: any) => string | undefined); canonicalKeyByEnglishKey: Record<string, string>; label: string; }} params
 */
const resolveCompleteProjection = ({
  canonicalItems,
  canonicalKey,
  englishItems,
  englishKey,
  canonicalKeyByEnglishKey,
  label,
}) => {
  const canonicalByKey = indexUnique(canonicalItems, canonicalKey, `${label} canonical`);
  const englishByKey = indexUnique(englishItems, englishKey, `${label} English`);
  const resolved = new Map();
  const claimedCanonicalKeys = new Set();

  for (const [englishIdentity, canonicalIdentity] of Object.entries(canonicalKeyByEnglishKey)) {
    if (!englishByKey.has(englishIdentity)) {
      throw new Error(`${label} maps unknown English identity ${englishIdentity}`);
    }
    if (!canonicalByKey.has(canonicalIdentity)) {
      throw new Error(`${label} maps ${englishIdentity} to unknown canonical identity ${canonicalIdentity}`);
    }
    if (claimedCanonicalKeys.has(canonicalIdentity)) {
      throw new Error(`${label} maps canonical identity ${canonicalIdentity} more than once`);
    }
    claimedCanonicalKeys.add(canonicalIdentity);
    resolved.set(englishIdentity, canonicalByKey.get(canonicalIdentity));
  }

  for (const englishIdentity of englishByKey.keys()) {
    if (!resolved.has(englishIdentity)) throw new Error(`${label} leaves English identity ${englishIdentity} unmapped`);
  }
  for (const canonicalIdentity of canonicalByKey.keys()) {
    if (!claimedCanonicalKeys.has(canonicalIdentity)) throw new Error(`${label} leaves canonical identity ${canonicalIdentity} unmapped`);
  }
  return resolved;
};

/**
 * @param {Map<string, any>} left
 * @param {Map<string, any>} right
 * @param {string} label
 */
const assertSameIdentities = (left, right, label) => {
  for (const identity of left.keys()) {
    if (!right.has(identity)) throw new Error(`${label} is missing ${identity}`);
  }
  for (const identity of right.keys()) {
    if (!left.has(identity)) throw new Error(`${label} has unexpected ${identity}`);
  }
};

const canonicalDeepDivesByTitle = indexUnique(canonicalDeepDives, "title", "RAG deep dives");
const canonicalLabsByTitle = indexUnique(canonicalLearningContent.labs, "title", "RAG learning labs");
/** @type {Record<string, string>} */
const ragDeepDiveCanonicalTitlesById = Object.freeze({
  "deep-query-policy": "这次请求应该回答、追问还是停下",
  "deep-lifecycle-consistency": "知识变化只有传播到最终回答，才算在 RAG 中生效",
  "deep-evidence-compiler": "把 Top-K 整理成可以逐条核对的回答",
  "deep-offline-handoff": "一份文档什么时候才算 RAG 可用",
});
const ragDeepDiveEnglishBlockTitlesById = Object.freeze({
  "deep-query-policy": "Control online query planning without turning every request into an Agent loop",
  "deep-lifecycle-consistency": "Treat additions, changes, deletions, and access revocation as separate consistency paths",
  "deep-evidence-compiler": "Compile evidence at claim level",
  "deep-offline-handoff": "Accept the offline evidence handoff before exposing an index",
});
/** @type {Record<string, string>} */
const ragLabCanonicalTitlesById = Object.freeze({
  "learning-lab-data-readiness": "完成一次 RAG 数据就绪审阅",
  "learning-lab-retrieval-routes": "比较四条检索路线",
  "learning-lab-risk-trace": "演练高风险回答并还原 Trace",
  "learning-lab-economics-decision": "把 RAG PoC 结论写成经济决定",
});

/**
 * @param {Map<string, any>} canonicalByTitle
 * @param {string} canonicalTitle
 * @param {string} label
 */
const canonicalSourceIdsFor = (canonicalByTitle, canonicalTitle, label) => {
  const canonical = canonicalByTitle.get(canonicalTitle);
  if (!canonical) throw new Error(`${label} is not mapped to a canonical title`);
  if (!Array.isArray(canonical.sourceIds)) throw new Error(`${label} has no canonical source IDs`);
  return canonical.sourceIds;
};

/**
 * @param {string} id
 */
const deepDiveSourceIds = (id) => canonicalSourceIdsFor(
  canonicalDeepDivesByTitle,
  ragDeepDiveCanonicalTitlesById[id],
  `RAG deep dive ${id}`,
);
/**
 * @param {string} id
 */
const labSourceIds = (id) => canonicalSourceIdsFor(
  canonicalLabsByTitle,
  ragLabCanonicalTitlesById[id],
  `RAG learning lab ${id}`,
);

const terms = Object.freeze({
  rag: {
    name: "Retrieval-Augmented Generation",
    abbr: "RAG",
    definition: "An application pattern that turns external material into authorized, verifiable, and revocable evidence for the current user, then uses that evidence to answer, qualify, or abstain.",
  },
  retrieval: {
    name: "Retrieval",
    definition: "Finding candidate evidence in documents, databases, or indexes in response to a query.",
  },
  augmentation: {
    name: "Augmentation",
    definition: "Compiling current evidence, source metadata, answer rules, and business context into the model input for one request.",
  },
  generation: {
    name: "Generation",
    definition: "Producing text, code, or structured output token by token from the current context.",
  },
  "sparse-retrieval": {
    name: "Sparse Retrieval",
    definition: "Term-based retrieval that is especially effective for exact names, identifiers, and specialist vocabulary.",
  },
  "dense-retrieval": {
    name: "Dense Retrieval",
    definition: "Retrieval that compares vector representations to find semantically similar content.",
  },
  reranking: {
    name: "Reranking",
    definition: "Applying a more precise relevance model to an existing candidate set; a reranker cannot recover evidence that was never retrieved.",
  },
  grounding: {
    name: "Grounding",
    definition: "Constraining material claims with traceable evidence or authoritative system state, while allowing the system to qualify or decline unsupported claims.",
  },
  bm25: {
    name: "Best Matching 25",
    abbr: "BM25",
    definition: "A classic keyword-ranking method based on term frequency, inverse document frequency, and document-length normalization.",
  },
  ann: {
    name: "Approximate Nearest Neighbor",
    abbr: "ANN",
    definition: "A family of methods that trades a controlled amount of search accuracy for speed at large vector-search scale.",
  },
  hnsw: {
    name: "Hierarchical Navigable Small World",
    abbr: "HNSW",
    definition: "A widely used ANN index that organizes vectors in a multilayer proximity graph.",
  },
  rrf: {
    name: "Reciprocal Rank Fusion",
    abbr: "RRF",
    definition: "A rank-based method for combining several result lists, commonly sparse and dense retrieval results.",
  },
});

const sources = Object.freeze({
  "bm25-book": { kind: "Authoritative textbook", shortTitle: "Okapi BM25", note: "Explains the probabilistic ranking basis of sparse retrieval, including term frequency, inverse document frequency, and document-length normalization." },
  "dpr-2020": { kind: "Peer-reviewed paper", shortTitle: "DPR", note: "Introduces dense passage retrieval with a dual encoder. Its 9–19 percentage-point top-20 improvement is specific to the evaluated open-domain QA datasets and Lucene-BM25 baseline." },
  "rrf-2009": { kind: "Peer-reviewed short paper", shortTitle: "Reciprocal Rank Fusion", note: "Introduces rank-based fusion that does not require scores from different retrievers to share a scale. The reported comparisons are specific to the paper's test collections and candidate rankers." },
  "beir-2021": { kind: "Peer-reviewed benchmark paper", shortTitle: "BEIR", note: "Compares zero-shot retrieval across 18 heterogeneous datasets and several retrieval architectures, showing both strong sparse baselines and quality–compute trade-offs. It does not replace evaluation on the customer's corpus, languages, permissions, or end-to-end tasks." },
  "mteb-2023": { kind: "Peer-reviewed benchmark paper", shortTitle: "MTEB", note: "The original benchmark covers eight task families, 58 datasets, and 112 languages and finds no embedding method that dominates every task. Those counts describe the 2023 paper, not a current leaderboard or a customer-specific retrieval result." },
  "clirmatrix-2020": { kind: "Peer-reviewed dataset paper", shortTitle: "CLIRMatrix", note: "Provides bilingual and multilingual retrieval datasets in which query and relevant-document languages differ. The data is mined from Wikipedia and cannot replace human relevance judgments in the target enterprise domain." },
  "hnsw-2016": { kind: "Primary research paper", shortTitle: "HNSW", note: "Explains the multilayer proximity graph used by a common approximate nearest-neighbor index and the trade-off between search cost and recall." },
  "rag-survey": { kind: "Research survey", shortTitle: "RAG Survey", note: "Surveys basic, advanced, and modular RAG, covering retrieval, augmentation, generation, and evaluation choices." },
  graphrag: { kind: "Primary research paper", shortTitle: "GraphRAG", note: "Uses entity graphs, communities, and community summaries for corpus-wide synthesis questions; it does not replace ordinary fact retrieval." },
  "chunking-study": { kind: "Task-specific research", shortTitle: "Code RAG Chunking Study", note: "A controlled chunking study for retrieval-augmented code completion. It supports task-specific testing, not reuse of its settings for contracts, PDFs, or scans." },
  "rag-original-2020": { kind: "Peer-reviewed paper", shortTitle: "Original RAG Paper", note: "Defines the original RAG formulation and its combination of parametric and retrieved memory, including the training scope of that research system." },
  "bert-reranker": { kind: "Primary research paper", shortTitle: "BERT Reranker", note: "Describes a two-stage query–passage reranking pattern. It can reorder retrieved candidates but cannot recover evidence outside the candidate set." },
  "fid-2021": { kind: "Peer-reviewed paper", shortTitle: "Fusion-in-Decoder", note: "Shows a method for encoding multiple passages separately and combining them in the decoder. Passage-count findings remain specific to the reported experiments." },
  "replug-2024": { kind: "Peer-reviewed paper", shortTitle: "REPLUG", note: "Demonstrates a modular route in which a black-box language model remains frozen while an external retriever is trained and retrieved documents are added to the input." },
  "self-rag": { kind: "Primary research paper", shortTitle: "Self-RAG", note: "Studies on-demand retrieval and reflection tokens for evaluating evidence and generation. It does not mean that a conventional RAG system automatically self-checks." },
  "lost-middle": { kind: "Peer-reviewed journal paper", shortTitle: "Lost in the Middle", note: "Reports position-sensitive long-context performance in specific multi-document QA and key–value retrieval experiments; it does not prove that every model behaves identically or that RAG always wins." },
  "contextual-retrieval": { kind: "Vendor experiment", shortTitle: "Contextual Retrieval", note: "Reports a top-20 retrieval failure rate changing from 5.7% to 2.9%, then to 1.9% with reranking, in a specific vendor experiment. Treat it as a PoC hypothesis, not a customer commitment." },
  ragas: { kind: "Peer-reviewed paper", shortTitle: "RAGAS", note: "Proposes Faithfulness, Answer Relevance, and Context Relevance as automated, reference-free RAG evaluation dimensions; it does not define business, safety, P95, or cost thresholds." },
  "nist-genai-profile": { kind: "Official risk-management framework", shortTitle: "NIST AI 600-1", note: "Organizes generative-AI risk work around Govern, Map, Measure, and Manage. It is a voluntary risk-management resource, not product certification or a RAG performance standard." },
  "nist-zero-trust": { kind: "Official architecture publication", shortTitle: "NIST SP 800-207", note: "Requires authentication and authorization before access to enterprise resources rather than implicit trust based on network location. Retrieval filtering is one RAG implementation of that principle." },
  "owasp-prompt-injection": { kind: "Community security guidance", shortTitle: "OWASP LLM01", note: "Identifies prompt injection as a major generative-AI application risk and states that RAG, fine-tuning, or a system prompt alone does not eliminate it." },
  "owasp-vector-weaknesses": { kind: "Community security guidance", shortTitle: "OWASP LLM08", note: "Covers cross-context leakage, fine-grained access control, logical isolation, source validation, and retrieval logging in vector and embedding systems." },
  "docling-report": { kind: "Technical report", shortTitle: "Docling", note: "Describes PDF conversion, layout analysis, and table-structure recognition. Successful conversion does not itself establish downstream RAG accuracy." },
  "pp-ocr-2020": { kind: "Primary research paper", shortTitle: "PP-OCR", note: "Describes an OCR pipeline combining text detection, direction classification, and recognition. Results do not guarantee performance for arbitrary scan quality." },
  "colpali-2025": { kind: "Primary research paper", shortTitle: "ColPali", note: "Studies multi-vector visual retrieval directly from document-page images. Quality and cost still require validation on the customer corpus." },
  "fine-tuning-or-retrieval": { kind: "Task-specific research", shortTitle: "Fine-Tuning or Retrieval?", note: "Compares retrieval and unsupervised fine-tuning for new-fact injection in a particular experimental setting. It does not show that every form of fine-tuning is unsuitable for knowledge work." },
  "anthropic-effective-agents": { kind: "Vendor engineering guidance", shortTitle: "Building Effective Agents", note: "Distinguishes predefined workflows from Agents whose models direct process and tool use, and recommends beginning with simple composable patterns. It is vendor engineering guidance, not a standard or a universal outcome guarantee." },
  "mcp-architecture": { kind: "Official technical documentation", shortTitle: "MCP Architecture", note: "Defines MCP hosts, clients, servers, data and transport layers, and the Tools, Resources, and Prompts primitives. The protocol does not prescribe how an AI application manages models, evidence quality, or context." },
  "a2a-concepts": { kind: "Official technical documentation", shortTitle: "A2A Core Concepts", note: "Defines Agent Cards, Tasks, Messages, Parts, and Artifacts for collaboration between Agents. It does not prescribe an individual Agent's implementation or make A2A necessary for an ordinary application call." },
  "alce-2023": { kind: "Primary research paper", shortTitle: "ALCE", note: "Separates whether a citation supports its associated claim from whether all important claims receive citations. Its evaluation results are not a customer-system accuracy guarantee." },
  "finops-unit-economics": { kind: "Industry foundation framework", shortTitle: "FinOps Unit Economics", note: "Connects technology spending to the value created by a product, service, or activity and distinguishes resource-efficiency units from business-outcome units. Unit economics supports baselines and trends; it does not by itself prove causality, ROI, or customer value." },
  "opentelemetry-genai-semconv": { kind: "Official technical specification", shortTitle: "OpenTelemetry GenAI Conventions", note: "Defines evolving telemetry conventions for generative AI, retrieval, agents, and tools. Projects still need their own business-quality, access-control, and evidence-coverage fields." },
  "hyde-2023": { kind: "Primary research paper", shortTitle: "HyDE", note: "Studies hypothetical-document embeddings for zero-shot dense retrieval. The generated hypothetical document is a retrieval aid, not evidence for the answer." },
  "azure-search-query-rewrite": { kind: "Official product documentation", shortTitle: "Azure Query Rewrite", note: "Documents a preview query-rewriting capability that preserves the original query and creates alternatives, while warning that exact unique terms can be lost. Capability maturity and limits are product-specific and require current verification." },
  "aws-bedrock-query-decomposition": { kind: "Official product documentation", shortTitle: "Bedrock Query Decomposition", note: "Documents optional decomposition of complex queries into subqueries and the resulting increase in query activity. It does not guarantee better answers." },
  "aws-bedrock-kb-sync": { kind: "Official product documentation", shortTitle: "Bedrock Knowledge Base Sync", note: "Documents propagation of additions, changes, and deletions through a managed knowledge-base synchronization process. Connector and governance coverage must still be checked." },
  "azure-search-indexer-lifecycle": { kind: "Official product documentation", shortTitle: "Azure Indexer Lifecycle", note: "Documents separate reset, run, rebuild, and deletion behavior, including orphaned-document and ACL high-water-mark limitations. These are product-specific implementation boundaries." },
  "azure-search-index-alias": { kind: "Official product documentation", shortTitle: "Azure Index Alias", note: "Documents a stable alias that can point to a search index and support controlled cutover and rollback. Equivalent capability cannot be assumed for every service." },
  "azure-search-document-acl": { kind: "Official product documentation", shortTitle: "Azure Document-Level Access", note: "Documents document-level access-control features in a managed search service. Availability, stage, region, and constraints require current verification." },
});

const expectedSourceIds = Object.freeze(Object.keys(sources));

const sectionDrafts = [
  {
    id: "concept-map",
    eyebrow: "ADOPTION DECISION",
    title: "Begin with the business decision, not the vector database",
    lead: "Before selecting models or search products, define the work that should improve, the authoritative evidence the answer must use, the failures that require a stop, and the baseline against which value will be judged.",
    blocks: [
      steps("Eight decisions that define an adoptable RAG program", "Use the same business tasks, identities, authoritative sources, and risk slices throughout discovery, design, PoC, and production review.", [
        { id: "offline-connect-parse", title: "Name the business task", subtitle: "OUTCOME", body: "Choose a bounded task such as finding an approved product limitation, drafting a cited support answer, or comparing current policy versions. Record who performs it and what happens after the answer." },
        { id: "offline-chunk-describe", title: "Measure the current workflow", subtitle: "BASELINE", body: "Measure task success, handling time, escalation, rework, and error cost before introducing RAG. A faster demo has no value if the accepted business outcome does not improve." },
        { id: "offline-index-refresh", title: "Identify authoritative material", subtitle: "AUTHORITY", body: "List source owners, effective versions, access rules, conflict policy, and withdrawal behavior. Retrieval cannot resolve an organization that has not decided which source governs." },
        { id: "offline-quality-gate", title: "Define unacceptable failures", subtitle: "RISK", body: "Specify which tasks may use a qualified answer, which require human review, and which must abstain. Unauthorized disclosure, obsolete commitments, and unsupported material claims are typical no-go conditions." },
        { id: "online-query-contract", title: "Freeze representative task slices", subtitle: "TEST CONTRACT", body: "Preserve the question, expected evidence, caller identity, version, language, risk, and current-process outcome. Evaluate difficult and negative cases, not only convenient demonstrations." },
        { id: "online-retrieve-rerank", title: "Prove evidence availability", subtitle: "EVIDENCE", body: "Demonstrate that current, authorized support enters the candidate set. Keyword, vector, structured, or graph retrieval are interchangeable mechanisms only when this gate is met." },
        { id: "online-context-assembly", title: "Prove answer usability", subtitle: "ANSWER", body: "Show that the final answer preserves scope, cites the right evidence, handles conflicts, and stops when support is insufficient." },
        { id: "online-generate-abstain", title: "Compare total economics", subtitle: "DECISION", body: "Evaluate cost per successful outcome, avoided work, residual risk, and operating responsibility. Conclude Go, Repair, or Stop rather than treating PoC completion as approval." },
      ]),
      cards("The baseline must cover more than answer quality", "These dimensions become the comparison frame for every architecture and model choice.", [
        { id: "shared-identity-access", title: "Task and risk baseline", body: "Record present task success, handling time, escalation, high-impact errors, and the authority that accepts residual risk." },
        { id: "shared-version-freshness", title: "Knowledge and access baseline", body: "Measure source ownership, version conflicts, update and revocation delay, permission complexity, and the proportion of material that is actually usable." },
        { id: "shared-evaluation-observation", title: "Service and economics baseline", body: "Record volume, concurrency, P95, human effort, current platform cost, and cost per accepted task outcome rather than tokens alone." },
      ]),
      cards("Module ownership around the RAG decision", "RAG owns the application evidence chain. Follow the related module when the design question moves into a specialist mechanism.", [
        { id: "related-llm-context", title: "LLMs and context windows", subtitle: "Foundation Models", body: "Own model behavior, tokens, attention, and the limits of parametric memory.", decision: "Use here to understand what the generator can and cannot do.", cells: ["/modules/llm"] },
        { id: "related-embedding", title: "Embeddings", subtitle: "Foundation Models", body: "Own vector representation and similarity behavior; similarity does not establish authority or truth.", decision: "Use here when selecting and evaluating dense retrieval.", cells: ["/modules/llm"] },
        { id: "related-parsing-chunking", title: "Parsing, OCR, cleaning, and chunks", subtitle: "AI Data Engineering", body: "Own document recovery, normalization, lineage, quality, and lifecycle-ready evidence units.", decision: "Use here to establish the offline evidence supply.", cells: ["/modules/data-engineering"] },
        { id: "related-search-vector-store", title: "Search, indexes, and vector stores", subtitle: "AI Data Engineering", body: "Own sparse and dense indexes, filters, refresh, and retrieval infrastructure; no one of them is a complete RAG system.", decision: "Use here to implement candidate discovery.", cells: ["/modules/data-engineering"] },
        { id: "related-prompt-grounding", title: "Instructions and context compilation", subtitle: "Prompt Engineering", body: "Own the answer contract, evidence placement, citation format, and abstention instruction.", decision: "Use here to control evidence use by the generator.", cells: ["/modules/prompt-engineering"] },
        { id: "related-evaluation-security-gateway", title: "Evaluation and production controls", subtitle: "Evaluation", body: "Own experimental design and quality measurement; Security, AI Gateway, and AI Ops own their respective threat, policy, telemetry, release, and incident mechanisms.", decision: "Use here to prove and operate the evidence chain.", cells: ["/modules/evaluation"] },
        { id: "related-agent-graphrag", title: "Agents and graph-based retrieval", subtitle: "AI Agents", body: "Agent planning is optional orchestration for selected multi-step tasks; graph construction and quality remain data responsibilities.", decision: "Use only after a measured failure justifies the additional control loop.", cells: ["/modules/ai-agent"] },
        { id: "related-runtime-platform", title: "Containers, serverless, and compute", subtitle: "AI Infrastructure Platform", body: "Own the runtime, scaling, isolation, and recovery substrate for parsing, retrieval, and inference.", decision: "Use here to translate acceptance targets into an operable platform.", cells: ["/modules/ai-infra-platform"] },
      ]),
    ],
  },
  {
    id: "rag-principle",
    eyebrow: "EVIDENCE CONTRACT",
    title: "Define what counts as usable evidence before designing retrieval",
    lead: "RAG has one durable contract: make current, authorized evidence available to the current request; compile only applicable evidence into the context; then answer, qualify, or abstain at claim level. The views below explain that one contract—they are not competing RAG architectures.",
    blocks: [
      table("Two forms of memory with different governance properties", "A model's learned parameters and externally governed evidence must not be treated as interchangeable sources of authority.", ["Memory", "What it contains", "How it changes", "Key limitation"], [
        { id: "parametric-memory", title: "Parametric memory", cells: ["Patterns encoded in model weights", "Training or fine-tuning", "It is difficult to update, withdraw, attribute, or permission item by item."] },
        { id: "non-parametric-memory", title: "Retrieved external memory", cells: ["Documents, records, and indexed evidence", "Source and index updates", "It remains useful only if parsing, versioning, access control, and retrieval are correct."] },
      ]),
      steps("Three terms, one evidence contract", "Retrieval, augmentation, and generation name distinct responsibilities inside the same request lifecycle.", [
        { id: "mechanism-retrieval", title: "Retrieval", body: "Select candidate passages or records that may support the answer. The first objective is evidence availability, not polished prose." },
        { id: "mechanism-augmentation", title: "Augmentation", body: "Assemble valid evidence, metadata, instructions, and the token budget into the actual model context." },
        { id: "mechanism-generation", title: "Generation", body: "Use the assembled evidence to answer, cite, qualify, or abstain. The model must not invent authority that the evidence does not provide." },
      ]),
      steps("Four observable handoffs", "Each handoff must produce an inspectable artifact so that a fluent failure can be located rather than guessed at.", [
        { id: "engineering-candidate-retrieval", title: "Candidate retrieval", subtitle: "Candidate Retrieval", body: "Maximize the chance that supporting evidence enters the candidate set. Observe Recall@K before and after access filters." },
        { id: "engineering-filter-rerank", title: "Filter and rerank", subtitle: "Filtering and Reranking", body: "Enforce access and validity constraints, then move stronger supporting evidence toward the top. Measure ranking gain and added latency." },
        { id: "engineering-context-assembly", title: "Assemble the context", subtitle: "Context Assembly", body: "Handle duplicates, versions, conflicts, ordering, token limits, and source identity. This is not a blind Top-K concatenation." },
        { id: "engineering-grounded-generation", title: "Generate from evidence", subtitle: "Evidence-grounded Generation", body: "Separate fact, inference, and recommendation; abstain when support is insufficient; preserve a path back to the original evidence." },
      ]),
      cards("Three boundaries that determine what the contract can prove", undefined, [
        { id: "limit-recall-upper-bound", title: "Recall sets the ceiling for evidence use", body: "If the reference evidence never enters the candidate set, the generator cannot create a verifiable citation. A lucky answer from parametric memory is not a successful evidence chain." },
        { id: "limit-relevance-truth", title: "Relevance is not truth", body: "A retrieval score estimates match to the query; it does not establish that a source is authoritative, current, or applicable to this customer." },
        { id: "limit-context-not-weights", title: "Augmentation changes context, not weights", body: "A typical enterprise RAG request serializes evidence as input tokens. It changes the current generation conditions but does not permanently write that evidence into the model parameters." },
      ]),
      steps("Worked example: a version-sensitive product commitment", "Question: ‘What is the data-retention period for the enterprise edition?’ The answer is acceptable only when authority, version, access, and claim support survive the full contract.", [
        { id: "example-retrieve", title: "Retrieve", body: "Find candidate evidence in product documentation, contractual terms, and current notices, filtered for the caller's identity." },
        { id: "example-augment", title: "Augment", body: "Add effective dates, product version, original excerpts, and citation requirements to the context." },
        { id: "example-generate", title: "Generate", body: "Compare the evidence and state its scope. If it is insufficient or conflicting, abstain and request authoritative confirmation." },
      ]),
      boundary("principle-evidence-chain-boundary", "Critical boundary", "RAG does not turn retrieved text into truth. It turns governed external material into candidate evidence and preserves enough identity, scope, and provenance for the application to decide whether a claim may be made."),
      steps("The answer-decision record", "Follow one query by the artifacts it must leave behind, not by a vendor-specific component diagram.", [
        { id: "lens-query-understand", title: "Understand the question", subtitle: "Query Contract", body: "Identify intent, entities, time, product version, and caller identity.", decision: "Output: executable queries and filters." },
        { id: "lens-query-broad-recall", title: "Retrieve broadly", subtitle: "Candidate Retrieval", body: "Use keyword and vector retrieval to preserve both exact identifiers and semantic variants.", decision: "Check: did the reference evidence enter Top-K?" },
        { id: "lens-query-filter-rerank", title: "Filter and rerank", subtitle: "Filter and Rerank", body: "Apply access and version filters before ranking the evidence that truly supports the question.", decision: "Check: recall before and after filtering, and ranking gain." },
        { id: "lens-query-assemble", title: "Assemble evidence", subtitle: "Context Assembly", body: "Resolve conflicts, remove duplicates, order evidence, manage tokens, and retain source IDs.", decision: "Output: an auditable final evidence package." },
        { id: "lens-query-answer", title: "Answer or abstain", subtitle: "Generate or Abstain", body: "Answer and cite from evidence; stop when support is inadequate.", decision: "Check: does evidence support every material claim?" },
      ]),
      steps("Use the same record to trace a failed answer", "A single wrong answer can represent several different incidents; component replacement is justified only after the failing handoff is known.", [
        { id: "lens-failure-not-ingested", title: "Knowledge never entered", body: "Synchronization failed, parsing lost a table, deletion state was wrong, or the authoritative version was not identified.", decision: "Evidence: document- and chunk-level processing trace." },
        { id: "lens-failure-chunk-broken", title: "Evidence was split incorrectly", body: "Chunk boundaries broke a heading, table, condition, or parent–child relationship.", decision: "Evidence: reference-passage coverage by chunk." },
        { id: "lens-failure-not-retrieved", title: "The candidate was not retrieved", body: "Query rewriting, embeddings, keyword fields, or filters did not match.", decision: "Evidence: Recall@K before and after filters." },
        { id: "lens-failure-context-omitted", title: "Evidence was displaced from the context", body: "The correct candidate ranked too low, duplicates consumed the budget, or the token budget was too small.", decision: "Evidence: final context snapshot." },
        { id: "lens-failure-model-misused", title: "The model misused the evidence", body: "It ignored qualifications, merged conflicting sources, or failed to abstain.", decision: "Evidence: claim–citation alignment and abstention evaluation." },
      ]),
      steps("Assign responsibility before mapping products", "The application owns the end-to-end outcome while specialist modules and platform teams own distinct mechanisms.", [
        { id: "lens-cloud-supply", title: "Knowledge supply", body: "Object storage, connectors, change data capture, document intelligence, and batch processing.", decision: "Accept: propagation targets for additions, changes, and deletions." },
        { id: "lens-cloud-retrieval", title: "Retrieval foundation", body: "Managed search, vector stores, caches, relational data, and graph queries.", decision: "Accept: candidate recall after access filtering." },
        { id: "lens-cloud-model", title: "Model capabilities", body: "Embeddings, rerankers, generation models, and model routing.", decision: "Accept: quality, latency, and cost per successful outcome." },
        { id: "lens-cloud-secure-runtime", title: "Secure runtime", body: "API gateways, containers, serverless, IAM, key management, and private networking.", decision: "Accept: no unauthorized disclosure, peak-load behavior, and recovery." },
        { id: "lens-cloud-operations", title: "Continuous operations", body: "Tracing, evaluation, alerts, versioning, and FinOps.", decision: "Accept: detect regression, roll back safely, and identify ownership." },
      ]),
      steps("How to use the interactive retrieval lab", "Hold the customer question constant and change only the retrieval strategy. Observe whether the reference evidence rises, disappears, or is hidden by a plausible distractor.", [
        { id: "lab-instruction-select-scenario", title: "Choose a query scenario", body: "Read the customer query, retrieval challenge, and reference evidence before looking at a ranking." },
        { id: "lab-instruction-switch-strategy", title: "Switch retrieval strategy", body: "Compare keyword BM25, vector retrieval, Hybrid + RRF, and reranking under the same scenario." },
        { id: "lab-instruction-read-result", title: "Read the complete result", body: "Inspect the reference-evidence position, Top-3 candidate IDs, match signals, failure boundary, and decision takeaway—not just the first candidate." },
      ]),
      cards("Interactive retrieval lab: scenarios", "Switch among the three customer questions, then compare keyword, vector, hybrid, and reranking strategies. Rankings are illustrative diagnostic examples, not benchmark results.", [
        { id: "lab-exact-policy", title: "Exact policy term", body: "Query: ‘How long are enterprise-edition audit logs retained?’ Product name and audit-log retention are strong terms, but the answer must come from the current version rather than a general security guide.", decision: "Reference evidence: Enterprise Security and Compliance Specification v2026.06, Audit Logs." },
        { id: "lab-semantic-rewrite", title: "Semantic paraphrase", body: "Query: ‘When the policy is revised, can the knowledge base update automatically?’ The customer does not use engineering terms such as incremental synchronization, effective version, or index rebuild.", decision: "Reference evidence: Knowledge Update and Version-Effectivity Rules, Incremental Synchronization and Withdrawal." },
        { id: "lab-compound-constraints", title: "Compound constraints", body: "Query: ‘For a financial customer in Asia Pacific, private deployment is mandatory and data must remain in-region. Which option qualifies?’ Industry, region, network, and residency are all hard constraints.", decision: "Reference evidence: Financial Services APAC Private Deployment Matrix v3.2, Regional and Data-Residency Table." },
      ]),
      table("Interactive retrieval lab: strategy results", "Each row preserves the ranked candidates, the failure to watch for, and the decision implication.", ["Scenario and strategy", "Ranked candidates", "Failure mode", "Conclusion"], [
        { id: "lab-exact-policy-bm25", title: "Exact policy · BM25", cells: ["1 SEC-2606 — Enterprise Security and Compliance Specification v2026.06; exact product, audit-log, and retention match; correct. 2 OPS-118 — Log Service Capacity Planning Guide. 3 SEC-2509 — Enterprise Security Specification v2025.09; strong lexical match, obsolete version.", "Paraphrases such as ‘how long is the record kept?’ or OCR loss can sharply reduce rank.", "BM25 is a strong low-cost baseline for stable product names, terms, and versions; version filtering remains mandatory."] },
        { id: "lab-exact-policy-vector", title: "Exact policy · Vector", cells: ["1 OPS-118 — Log Service Capacity Planning Guide; semantically similar, not a product commitment. 2 SEC-2606 — Enterprise Security and Compliance Specification v2026.06; relevant and current; correct. 3 REG-041 — Financial Data-Retention Guidance; guidance, not the product scope.", "Semantic similarity does not establish applicability; generic guidance can outrank an exact product term.", "Vector retrieval catches paraphrases but cannot replace product, region, and version filters."] },
        { id: "lab-exact-policy-hybrid", title: "Exact policy · Hybrid + RRF", cells: ["1 SEC-2606 — Enterprise Security and Compliance Specification v2026.06; retrieved by both routes; correct. 2 OPS-118 — Log Service Capacity Planning Guide. 3 SEC-2509 — Enterprise Security Specification v2025.09; lexical match, demoted by version.", "Without access, version, and product filters before fusion, both routes can amplify the wrong candidate.", "Hybrid retrieval is a useful enterprise baseline, provided metadata filters are enforced at a controlled stage."] },
        { id: "lab-exact-policy-rerank", title: "Exact policy · Rerank", cells: ["1 SEC-2606 — Enterprise Security and Compliance Specification v2026.06; complete question–passage match and current; correct. 2 SEC-2509 — Enterprise Security Specification v2025.09; direct but old. 3 OPS-118 — Log Service Capacity Planning Guide; related, not a commitment.", "Reranking can only reorder retrieved material; it cannot repair a missing candidate.", "When candidates differ by version or scope, reranking may be more valuable than continuously increasing Top-K."] },
        { id: "lab-semantic-rewrite-bm25", title: "Semantic paraphrase · BM25", cells: ["1 DOC-014 — Knowledge Base Product FAQ. 2 SYNC-031 — Content Synchronization Troubleshooting. 3 OPS-063 — Model Version Upgrade Guide. GOV-208, the correct version-effectivity rule, is absent from Top-3.", "The authoritative document uses ‘effective version’ and ‘withdrawal’, which share little surface text with the customer's wording.", "Prepare paraphrase slices in the PoC rather than relying only on literal query terms."] },
        { id: "lab-semantic-rewrite-vector", title: "Semantic paraphrase · Vector", cells: ["1 GOV-208 — Knowledge Update and Version-Effectivity Rules; covers revision, synchronization, and effectivity; correct. 2 SYNC-031 — Content Synchronization Troubleshooting. 3 DOC-014 — Knowledge Base Product FAQ.", "Several documents about updates may still differ on withdrawal, latency, and consistency.", "Semantic retrieval can bridge conversational and engineering language, but the answer must expose effectivity, rollback, and observable state."] },
        { id: "lab-semantic-rewrite-hybrid", title: "Semantic paraphrase · Hybrid + RRF", cells: ["1 GOV-208 — Knowledge Update and Version-Effectivity Rules; semantic retrieval plus exact version/effectivity terms; correct. 2 SYNC-031 — Content Synchronization Troubleshooting. 3 DOC-014 — Knowledge Base Product FAQ.", "If chunking separates synchronization, indexing, and effectivity, fusion still sees incomplete evidence.", "Evaluate hybrid retrieval together with chunking, inherited headings, and version metadata."] },
        { id: "lab-semantic-rewrite-rerank", title: "Semantic paraphrase · Rerank", cells: ["1 GOV-208 — Knowledge Update and Version-Effectivity Rules; complete treatment of synchronization, effectivity, withdrawal, and latency; correct. 2 SYNC-031 — Content Synchronization Troubleshooting. 3 DOC-014 — Knowledge Base Product FAQ.", "A domain-weak reranker can prefer a fluent but shallow passage and adds latency and cost.", "Rerank a small, clean candidate set and measure nDCG, answer citation quality, and latency on business questions."] },
        { id: "lab-compound-constraints-bm25", title: "Compound constraints · BM25", cells: ["1 NET-071 — Private Network Access Configuration; strong private-network match, missing industry and residency. 2 FIN-AP32 — Financial Services APAC Private Deployment Matrix v3.2; all four constraints; correct. 3 FIN-GEN — Financial Services Solution Overview.", "One frequent constraint can dominate ranking even when the document fails the other mandatory conditions.", "BM25 exposes strong constraint terms, but qualification needs field filters or later constraint-aware ranking."] },
        { id: "lab-compound-constraints-vector", title: "Compound constraints · Vector", cells: ["1 FIN-GEN — Financial Services Solution Overview; semantically broad, no residency commitment. 2 FIN-AP32 — Financial Services APAC Private Deployment Matrix v3.2; complete constraints; correct. 3 NET-071 — Private Network Access Configuration.", "Vector similarity can favor fluent overviews over a table row containing decisive Boolean constraints.", "For compliance qualification, structured fields and table parsing can matter more than semantic resemblance."] },
        { id: "lab-compound-constraints-hybrid", title: "Compound constraints · Hybrid + RRF", cells: ["1 NET-071 — Private Network Access Configuration; strong terms, incomplete. 2 FIN-AP32 — Financial Services APAC Private Deployment Matrix v3.2; stable two-route retrieval and complete; correct. 3 FIN-GEN — Financial Services Solution Overview.", "RRF combines ranks; it does not understand that ‘must’ denotes a hard constraint.", "Hybrid recall helps find the evidence; hard filters and constraint-aware reranking put it in the right position."] },
        { id: "lab-compound-constraints-rerank", title: "Compound constraints · Rerank", cells: ["1 FIN-AP32 — Financial Services APAC Private Deployment Matrix v3.2; industry, region, private network, and residency all match; correct. 2 NET-071 — Private Network Access Configuration. 3 FIN-GEN — Financial Services Solution Overview.", "If the regional matrix is not parsed as row-level evidence, the reranker still cannot see all constraints.", "For qualification questions, prefer metadata filters → hybrid retrieval → constraint-aware reranking → citation to the original table."] },
      ]),
    ],
  },
  {
    id: "retrieval-basics",
    eyebrow: "OFFLINE EVIDENCE LIFECYCLE",
    title: "Turn governed material into retrievable evidence objects",
    lead: "The offline system does more than create embeddings. It accepts authoritative material, recovers structure, removes harmful noise, creates evidence-sized units, carries identity and validity, builds task-appropriate indexes, and proves that updates and withdrawals propagate.",
    blocks: [
      cards("Four offline design responsibilities", undefined, [
        { id: "retrieval-parsing-chunking", title: "Recover and clean usable structure", body: "Preserve reading order, headings, clauses, tables, captions, pages, and coordinates. Remove repeated noise carefully, detect duplicates, quarantine failed extraction, and never let a successful parser status substitute for evidence review.", decision: "Output: a versioned representation that can be compared with the original." },
        { id: "retrieval-sparse", title: "Create evidence-sized units", subtitle: "Chunking and Metadata", body: "Use headings, clauses, table regions, code structure, or parent–child boundaries according to the task. Carry source, version, validity, authority, language, ACL, parent, and original coordinates with every unit.", decision: "Output: an independently understandable, locatable, permissionable, and withdrawable evidence object." },
        { id: "retrieval-dense", title: "Build candidate-discovery routes", subtitle: "Sparse, Dense, and Structured Indexes", body: "Retain exact fields for identifiers and terms, add embeddings when semantic variation matters, and use structured or graph routes for governed facts and relationships. A vector index is one route, not the evidence system.", decision: "Output: versioned indexes with known coverage and rebuild behavior." },
        { id: "retrieval-filter-rerank", title: "Accept the offline release", body: "Probe reference questions, unauthorized identities, obsolete versions, deletions, and revoked access before exposing an index. Record parser, chunker, embedding, metadata, index, and ACL versions.", decision: "Output: a signed evidence-supply release or a blocked processing queue." },
      ]),
      table("Choose candidate-discovery mechanisms by observed query behavior", "Hold the corpus, questions, identities, and evidence judgments constant while changing one route at a time.", ["Mechanism", "Strongest signal", "Common blind spot", "Offline preparation", "Acceptance evidence"], [
        { id: "compare-bm25", title: "BM25 / sparse", cells: ["Exact terms, names, identifiers, and rare vocabulary", "Paraphrases, translation, and vocabulary mismatch", "Preserve searchable fields, original terms, language, version, and filters.", "Incremental Recall@K on exact and domain-term slices."] },
        { id: "compare-dense", title: "Dense / embedding", cells: ["Semantic similarity across natural-language variation", "Exact values, negation, hard constraints, and factual applicability", "Select an embedding model by language, domain, sequence, latency, privacy, and index compatibility.", "Incremental Recall@K on paraphrase and cross-language slices."] },
        { id: "compare-hybrid", title: "Hybrid retrieval", cells: ["Complementary sparse and dense candidate coverage", "Fusion can amplify stale, unauthorized, or duplicate candidates", "Define filtering and fusion order; do not assume raw scores are comparable.", "Recall gain by route and slice, plus P95 and cost overhead."] },
        { id: "compare-reranker", title: "Reranker", cells: ["Fine query–candidate relevance within an existing set", "Cannot recover evidence absent from the candidate set", "Prepare a limited, permission-valid candidate set and version the reranker.", "Ranking gain, final-evidence coverage, added P95, and cost."] },
      ]),
      cards("Three details that often invalidate an otherwise plausible index", undefined, [
        { id: "note-cosine-similarity", title: "Similarity scores are configuration-local", body: "Cosine or another distance measure ranks representations within a specific model, normalization, index, and task. It does not produce an authority score and should not be compared casually across embedding versions." },
        { id: "note-ann-hnsw", title: "ANN settings trade resource use for recall", body: "HNSW and other approximate nearest-neighbor methods reduce search cost by accepting a controlled recall trade-off. Tune them only after corpus and query baselines exist, and repeat the test after a model or index migration." },
        { id: "note-task-dependent-chunking", title: "Chunking is an evidence-design decision", body: "Choose boundaries by what must be understood, cited, permissioned, updated, and withdrawn together. Overlap can protect context while increasing duplicates, index size, and prompt cost." },
      ]),
    ],
  },
  {
    id: "production-rag",
    eyebrow: "ONLINE ANSWER LIFECYCLE",
    title: "Turn one authorized request into an evidence-backed answer or a safe stop",
    lead: "The online system is a sequence of explicit decisions: understand the request, discover candidates, enforce policy and validity, rank and compile evidence, then generate only the claims that the evidence supports.",
    blocks: [
      steps("The online answer decision", "Record every handoff in one correlated trace so that quality, access, latency, and cost can be attributed to the stage that created them.", [
        { id: "production-dual-recall", title: "Interpret and route the request", subtitle: "Query Contract", body: "Preserve the original question, caller identity, conversation state, time, language, and hard constraints. Decide whether to use sparse, dense, structured, graph, API, direct context, or no retrieval." },
        { id: "production-rank-fusion", title: "Discover and filter candidates", subtitle: "Candidate Discovery", body: "Run only the justified routes; enforce tenant, user, version, product, region, and validity rules at the controlled stage; retain rejected candidates and reasons for diagnosis." },
        { id: "production-cross-encoder", title: "Rank and compile evidence", subtitle: "Evidence Compilation", body: "Fuse incomparable result lists deliberately, rerank a limited set when it adds value, remove duplicates, resolve conflicts, preserve source identity, and fit the context budget." },
        { id: "production-evidence-assembly", title: "Answer, qualify, continue, or abstain", subtitle: "Answer Decision", body: "Generate only supported claims. Continue retrieval when a bounded evidence gap can be resolved; qualify when scope is limited; abstain or escalate when evidence is stale, conflicting, unauthorized, or insufficient." },
      ]),
      table("Diagnose the failing handoff before changing a component", undefined, ["Failure stage", "Observable symptom", "Evidence to inspect", "Repair direction"], [
        { id: "failure-source-parsing", title: "Source acceptance and parsing", cells: ["The authoritative material never becomes a faithful evidence object.", "Original page or record, extraction output, coordinates, version, ACL, and failure queue", "Repair source authority, routing, parsing, cleaning, or manual review."] },
        { id: "failure-chunk-index", title: "Evidence units and indexes", cells: ["Conditions are split, duplicates dominate, or obsolete and revoked units remain discoverable.", "Chunk boundaries, parent links, metadata, embedding and index versions, deletion tombstones", "Repair evidence boundaries, metadata, indexing, and lifecycle propagation."] },
        { id: "failure-candidate-recall", title: "Candidate discovery and policy", cells: ["The reference evidence is absent before or after filtering.", "Recall@K by route, query interpretation, filters, identity, version, and rejected-candidate reasons", "Repair routing, fields, embeddings, structured queries, or policy mapping."] },
        { id: "failure-fusion-rerank", title: "Fusion and reranking", cells: ["The reference candidate exists but ranks outside the compiled evidence set.", "Route ranks, fusion output, reranker version, MRR/nDCG, incremental P95 and cost", "Repair fusion policy, reranker, candidate budget, or skip the stage when it adds no value."] },
        { id: "failure-context-assembly", title: "Evidence compilation", cells: ["The final context omits scope, mixes versions, preserves conflicts, or loses citation coordinates.", "Final evidence package, deduplication, conflict policy, ordering, and token allocation", "Repair claim selection, compression, ordering, conflict handling, or context budget."] },
        { id: "failure-generation-citation", title: "Answer decision", cells: ["The generator misreads valid evidence, invents an unsupported claim, or fails to stop.", "Claim–evidence alignment, citation correctness and coverage, qualification, continuation, and abstention", "Repair the answer contract, generator choice, structured output, or review path."] },
      ]),
      boundary("production-model-upgrade-boundary", "Do not start with a larger generator", "A larger or more expensive generator can address only the failure slice in which the correct evidence and decision rules already reached the final context but were not used reliably. It cannot restore lost structure, missing candidates, incorrect access, stale versions, or a broken conflict policy."),
    ],
  },
  {
    id: "rag-variants",
    eyebrow: "OPTIONAL PATTERNS AND PROTOCOL BOUNDARIES",
    title: "Add complexity only when a measured task requires a different capability",
    lead: "A read-only knowledge assistant does not require an Agent, MCP, or A2A. Begin with the smallest evidence chain that meets the acceptance contract; add planning, standardized capability exposure, cross-agent delegation, graphs, vision, or structured querying only for the task slices that prove the need.",
    blocks: [
      cards("Four architecture labels—and the capability each actually adds", "These labels describe broad design families, not maturity levels or mandatory upgrade steps.", [
        { id: "variant-basic-rag", title: "Single-pass RAG", subtitle: "BASELINE", body: "One bounded request selects candidates, compiles evidence, and returns an answer or abstention.", decision: "Use as the default baseline for read-only knowledge questions.", boundary: "It still requires authority, ACL, lifecycle, evaluation, tracing, and safe-stop controls; ‘basic’ does not mean ungoverned." },
        { id: "variant-advanced-rag", title: "Controlled retrieval pipeline", body: "Add hybrid routes, filters, reranking, evidence compilation, or routing as independently justified stages.", decision: "Use when a known failure slice improves under the added stage.", boundary: "More stages increase version combinations, P95, cost, and diagnosis work; they do not require an autonomous Agent." },
        { id: "variant-agentic-rag", title: "Agent-orchestrated retrieval", body: "An Agent chooses sources, decomposes a task, iterates retrieval or tools, evaluates intermediate state, and stops under a budget.", decision: "Use only for genuinely multi-step or adaptive tasks that outperform deterministic routing.", boundary: "Agent planning adds trajectory risk and tool authorization; it is not the default meaning of modular RAG." },
        { id: "variant-graphrag", title: "Graph-assisted RAG", body: "Entity, relationship, community, or graph-query artifacts support relationship discovery and corpus-wide synthesis.", decision: "Use when the evaluation set contains relationship or global-theme questions that ordinary retrieval cannot serve.", boundary: "Graph extraction and summaries create a separate governed data product; routine fact lookup still needs precise source retrieval." },
      ]),
      table("Choose the extension by the capability gap", undefined, ["Pattern", "Use when", "Capability added", "Additional acceptance evidence", "Do not use it to"], [
        { id: "extension-advanced", title: "Controlled single-pass RAG", cells: ["Single-hop facts, policies, products, support answers, and bounded comparisons", "Hybrid candidates, filters, reranking, citations, qualification, and abstention", "Per-stage quality delta, P95, cost, versions, and failure trace", "Hide unresolved source authority, access, or lifecycle problems behind a more complex pipeline."] },
        { id: "extension-agentic", title: "Agent orchestration", cells: ["The task requires adaptive decomposition, source selection, iterative retrieval, or governed tool use", "Planning, loops, budgets, stopping, and trajectory state", "Trajectory success, tool authorization, loop budget, failure containment, and deterministic fallback", "Route every request through an expensive and less predictable control loop."] },
        { id: "extension-graph", title: "Graph-assisted retrieval", cells: ["Questions depend on cross-document relationships, communities, or global themes", "Entities, relationships, graph queries, community summaries, and provenance links", "Extraction and update quality, relationship evidence, global-answer support, and access propagation", "Replace exact lookup, original-source citation, or ordinary document retrieval."] },
        { id: "extension-multimodal", title: "Multimodal retrieval", cells: ["Evidence lives in layout, charts, drawings, images, or visually structured pages", "OCR, structured parsing, vision models, page representations, or fused routes", "Evidence recall and citation coordinates by document type, plus visual-processing P95 and cost", "Assume text extraction or page embeddings preserve every table and visual relationship."] },
        { id: "extension-structured", title: "Structured and live-data route", cells: ["The answer requires exact filters, calculations, transactions, or current system state", "Semantic layer, controlled SQL, business API, deterministic validation, and result provenance", "Query safety, numerical correctness, access, freshness, resource budgets, and auditability", "Turn transaction rows into stale text chunks and ask the generator to calculate authoritative results."] },
      ]),
      boundary("variant-ownership-boundary", "Agent, MCP, and A2A solve different problems", "Agent adds adaptive planning and tool-use control. MCP can standardize how an application or Agent exposes and consumes resources, prompts, or tools. A2A addresses task delegation and artifact exchange between independently operated Agents. None of the three improves source authority, chunk quality, retrieval recall, access control, or citation fidelity by itself, and none is required for ordinary read-only RAG."),
    ],
  },
  {
    id: "when-to-use",
    eyebrow: "FIT AND ALTERNATIVES",
    title: "Adopt RAG only when selective evidence supply changes the outcome",
    lead: "The decision is not RAG versus no AI. Compare selective retrieval with direct context, deterministic systems, prompting, fine-tuning, search without generation, and the current human workflow on the same task slices.",
    blocks: [
      cards("Signals that selective evidence supply may be worth the operating cost", undefined, [
        { id: "fit-frequently-changing", title: "Knowledge changes independently of the model", body: "Material is added, corrected, superseded, deleted, or withdrawn on a cadence that cannot wait for model training." },
        { id: "fit-source-required", title: "Material claims need direct support", body: "Users or reviewers need the governing document, version, page, excerpt, record, or calculation behind the answer." },
        { id: "fit-permissioned-data", title: "Visibility depends on the current identity", body: "Tenant, user, group, region, document, row, or field permissions must affect which evidence can enter the answer." },
        { id: "fit-growing-corpus", title: "The useful corpus exceeds a controlled direct context", body: "The complete corpus is too large, too dynamic, or too costly to supply on every request." },
        { id: "fit-diagnostic-separation", title: "Evidence failures must be attributable", body: "Operators need to distinguish missing knowledge, retrieval loss, context displacement, unsupported generation, and policy rejection." },
      ]),
      cards("Cases in which a simpler or different system should win", undefined, [
        { id: "compare-small-stable-corpus", title: "Direct context is complete and economical", body: "For a small, stable, safely shareable corpus, controlled direct context may remove an entire retrieval subsystem." },
        { id: "compare-behavior-problem", title: "The gap is stable behavior rather than evidence", body: "Prompting, workflow rules, or fine-tuning may address style, format, classification, or repeated behavior more directly." },
        { id: "compare-transactional-computation", title: "The task requires exact current state or action", body: "Use governed databases, APIs, semantic layers, and business logic; retrieved prose may explain the result but should not perform the authoritative computation." },
        { id: "compare-no-authority", title: "No one owns source authority", body: "Search can expose a conflict but cannot decide which policy, price, or obligation governs. Repair content governance before automating the answer." },
        { id: "compare-no-abstention", title: "Severe errors are possible but no safe stop exists", body: "Do not deploy autonomous answers. Add accountable review, narrow the task, or retain the current process until a defensible failure path exists." },
      ]),
    ],
  },
  {
    id: "architecture",
    eyebrow: "ONE OPERATING COORDINATE",
    title: "Use the offline evidence chain and online answer chain as the reference model",
    lead: "Every later optimization, control, trace, and cost item should attach to one of these two lifecycles or to a control that crosses both. Product components may change; the responsibility handoffs do not.",
    blocks: [
      steps("Offline evidence lifecycle", "Transform governed source material into evidence objects that can be located, authorized, versioned, tested, and withdrawn.", [
        { id: "architecture-source-systems", title: "Source systems", subtitle: "Source Systems", body: "Authoritative files, databases, content systems, and SaaS applications." },
        { id: "architecture-parse-ocr", title: "Parsing and OCR", subtitle: "Parsing and OCR", body: "Recover text, tables, headings, pages, and visual structure." },
        { id: "architecture-chunk-metadata", title: "Chunking and metadata", subtitle: "Chunking and Metadata", body: "Create stable evidence units with version, validity, lineage, and source coordinates." },
        { id: "architecture-access-mapping", title: "Access mapping", subtitle: "Access Mapping", body: "Carry tenant, group, user, document, and field-level authorization into retrieval." },
        { id: "architecture-sparse-vector-index", title: "Sparse and vector indexes", subtitle: "Sparse + Vector Indexing", body: "Support exact-term and semantic candidate retrieval with controlled refresh." },
      ]),
      steps("Online answer lifecycle", "Transform the current user's request into a claim-level evidence decision: answer, qualify, continue retrieving, or abstain.", [
        { id: "architecture-query-understanding", title: "Query understanding", subtitle: "Query Understanding", body: "Extract intent, entities, time, product version, and hard constraints." },
        { id: "architecture-hybrid-retrieval", title: "Hybrid retrieval", subtitle: "Hybrid Retrieval", body: "Combine sparse and dense routes to improve candidate coverage." },
        { id: "architecture-filter-rerank", title: "Filtering and reranking", subtitle: "Filtering and Reranking", body: "Apply access and validity constraints, then refine relevance within the candidate set." },
        { id: "architecture-context-assembly", title: "Context assembly", subtitle: "Context Assembly", body: "Resolve duplicates, conflicts, ordering, and the token budget while retaining provenance." },
        { id: "architecture-generation-citation", title: "Generation, citation, or abstention", subtitle: "Generation / Citation / Abstention", body: "Answer only to the degree justified by accessible, current evidence." },
      ]),
      boundary("architecture-shared-control-boundary", "The application keeps end-to-end responsibility", "Both chains share authority, identity, versioning, evaluation, tracing, release, security, cost, and recovery controls. Retrieval and generation models provide bounded capabilities; they do not own source truth, access decisions, business commitments, or final actions."),
    ],
  },
  {
    id: "choice",
    eyebrow: "COMPONENT AND MODEL SELECTION",
    title: "Select the stack by the failure it must remove",
    lead: "There is no single ‘RAG model.’ Treat parsing, chunking, embeddings, candidate retrieval, reranking, generation, and evaluation as separately replaceable decisions. Compare them on the same frozen task slices and release them as a tested version matrix.",
    blocks: [
      table("A four-layer selection record", "For each layer, record candidates, fixed evaluation data, version compatibility, quality delta, P95 delta, unit-cost delta, security boundary, and rollback condition.", ["Decision layer", "What to compare", "Primary evidence", "Release condition", "Common trap"], [
        { id: "choice-long-context", title: "Parsing and evidence-unit design", cells: ["Native parsers, OCR, document AI, vision routes; structural, parent–child, and table-aware chunking", "Structure fidelity, evidence recall, citation coordinates, failed-document rate, language and layout slices", "The selected route preserves the business evidence and fails visibly on unsupported layouts.", "Choosing one parser or fixed chunk size for every document because it was convenient in a demo."] },
        { id: "choice-rag", title: "Embedding, search, and index route", cells: ["Sparse, dense, hybrid, structured, and graph retrieval; embedding language, domain, sequence length, latency, privacy, and index compatibility", "Candidate Recall@K before and after filters, index resource use, update and deletion behavior, cross-language and exact-term slices", "The selected routes add measurable coverage over the simplest baseline and can be rebuilt, versioned, and rolled back.", "Selecting a vector database first and treating semantic similarity as authority, truth, or access control."] },
        { id: "choice-fine-tuning", title: "Reranker and evidence compiler", cells: ["Cross-encoder or late-interaction rerankers, candidate and final-evidence budgets, deduplication, conflict resolution, compression, and ordering", "MRR/nDCG, final evidence coverage, citation quality, incremental P95 and cost, critical-slice regressions", "The stage improves accepted outcomes enough to justify its latency, cost, and operating complexity.", "Adding reranking when the correct evidence is absent from the candidate set."] },
        { id: "choice-agentic-retrieval", title: "Generator, evaluator, and answer policy", cells: ["Generation quality, supported languages, context behavior, structured output, privacy, throughput, cost; independent and model-assisted evaluation", "Claim support, citation correctness and coverage, qualification, abstention, task success, human acceptance, P95, and cost per successful outcome", "The versioned combination passes risk slices and rollback gates; no single model score substitutes for end-to-end acceptance.", "Choosing the largest generator before proving that the correct evidence reaches the final context."] },
      ]),
    ],
  },
  {
    id: "rag-independent-depth",
    eyebrow: "PRODUCTION CONTROLS",
    title: "Keep evidence, access, versions, and decisions consistent over time",
    lead: "Production readiness is not another RAG pattern. It is the set of lifecycle and control obligations that make the same evidence contract survive query complexity, source change, revocation, component migration, load, and incident recovery.",
    blocks: [
      steps("Control online query planning without turning every request into an Agent loop", "Preserve the original request, extract hard constraints, choose a deterministic route first, and add rewriting, decomposition, or iteration only when it creates measurable evidence value.", [
        { id: "deep-query-preserve-original", title: "Preserve the original question", subtitle: "Preserve Original Query", body: "Store the user's wording together with identity, conversation, and time so that model numbers, negation, dates, and qualifications remain recoverable.", decision: "Keep every rewrite alongside the original and compare its contribution in the trace.", boundary: "A generated rewrite is not new user authorization and cannot overwrite business constraints.", sourceIds: deepDiveSourceIds("deep-query-policy") },
        { id: "deep-query-classify-risk", title: "Classify intent and risk", subtitle: "Classify Intent and Risk", body: "Distinguish exact lookup, semantic explanation, relationship synthesis, structured query, and no-retrieval cases, and assign an answer-risk level.", decision: "Use keyword or structured retrieval for exact identifiers; reserve planning for genuinely complex questions.", boundary: "Misclassification routes the request to the wrong source.", sourceIds: deepDiveSourceIds("deep-query-policy") },
        { id: "deep-query-hard-filters", title: "Extract hard filters", subtitle: "Extract Hard Filters", body: "Turn tenant, region, product version, effective date, document type, and caller identity into deterministic filters.", decision: "Validate filters in the application rather than hiding them in natural-language instructions.", boundary: "Overly strict filters lose recall; loose filters can disclose data or mix versions.", sourceIds: deepDiveSourceIds("deep-query-policy") },
        { id: "deep-query-route-retrieval", title: "Route retrieval", subtitle: "Route Retrieval", body: "Choose among keyword, vector, SQL, graph, API, or no retrieval, with a budget and stopping rule for each route.", decision: "Establish a single-route baseline before using real failures to justify combinations.", boundary: "More retrievers add latency, cost, and failure paths; they do not automatically add accuracy.", sourceIds: deepDiveSourceIds("deep-query-policy") },
        { id: "deep-query-rewrite-decompose", title: "Rewrite or decompose only when needed", subtitle: "Rewrite or Decompose", body: "Split multi-intent requests and consider query expansion or HyDE for a measured semantic gap, recording the incremental hit from every subquery.", decision: "Enable this only for clearly complex slices and validate candidate recall and task success.", boundary: "A HyDE hypothetical document may hallucinate; it can help locate real evidence but is not evidence itself.", sourceIds: deepDiveSourceIds("deep-query-policy") },
      ]),
      steps("Treat additions, changes, deletions, and access revocation as separate consistency paths", "A successful synchronization job does not prove that obsolete or unauthorized content is absent. Validate every change through parsed artifacts, indexes, caches, access state, citations, and the final answer.", [
        { id: "deep-lifecycle-version-source", title: "Version the source", subtitle: "Version the Source", body: "Store source_version, valid_from, valid_to, supersedes, indexed_at, and acl_version on the evidence unit.", decision: "Define the authoritative version and conflict policy before setting a synchronization interval.", boundary: "A modification timestamp cannot fully represent business effectivity and access changes.", sourceIds: deepDiveSourceIds("deep-lifecycle-consistency") },
        { id: "deep-lifecycle-change-events", title: "Propagate change events", subtitle: "Propagate Change Events", body: "Use change data capture, object events, or scheduled jobs to distinguish additions, changes, deletions, and ACL updates.", decision: "Give each change type a target, failure queue, and accountable owner.", boundary: "Some ACL changes do not update content timestamps and can bypass ordinary high-water-mark detection.", sourceIds: deepDiveSourceIds("deep-lifecycle-consistency") },
        { id: "deep-lifecycle-rebuild-artifacts", title: "Rebuild index artifacts", subtitle: "Rebuild Index Artifacts", body: "Version parsing, chunking, embeddings, and indexes. Keep the previous serviceable version during failure and isolate partial output.", decision: "After the job finishes, sample content, coordinates, permissions, and versions.", boundary: "Resetting or rerunning a job does not necessarily remove orphaned documents that disappeared from the source.", sourceIds: deepDiveSourceIds("deep-lifecycle-consistency") },
        { id: "deep-lifecycle-delete-invalidate", title: "Delete and invalidate", subtitle: "Delete and Invalidate", body: "Use tombstones or explicit deletion to remove vector and sparse-index entries, summaries, answer caches, and access snapshots.", decision: "Treat deletion and access revocation as higher-priority negative acceptance paths than ordinary additions.", boundary: "Deleting a source file before notifying the index can leave an orphan that is difficult to trace.", sourceIds: deepDiveSourceIds("deep-lifecycle-consistency") },
        { id: "deep-lifecycle-consistency-probe", title: "Run an end-to-end consistency probe", subtitle: "Consistency Probe", body: "Continuously query deleted, revoked, and superseded examples to prove that text, metadata, and cached answers are no longer returned.", decision: "Measure the target at the final result under a real user identity, not at the job-status screen.", boundary: "Probes and logs must also comply with sensitive-data and retention policies.", sourceIds: deepDiveSourceIds("deep-lifecycle-consistency") },
      ]),
      table("Compile evidence at claim level", "The context is not a bag of passages. It is a versioned decision object containing current, accessible evidence that can support specific claims.", ["Object", "Mechanism", "Acceptance question", "Failure mode"], [
        { id: "deep-evidence-object", title: "Evidence object", cells: ["Carry source ID, original coordinates, version, validity, ACL, authority, and extraction method.", "Can every answer fragment return reliably to the original?", "A link without version and coordinates cannot prove what was available at the time."], sourceIds: deepDiveSourceIds("deep-evidence-compiler") },
        { id: "deep-evidence-conflict-set", title: "Conflict set", cells: ["Group versions, regions, or terms that address the same subject and decide whether to select, present, or abstain by scope.", "Has the customer defined the authoritative source and conflict owner?", "Passing conflicting passages to the model transfers the decision to stochastic generation."], sourceIds: deepDiveSourceIds("deep-evidence-compiler") },
        { id: "deep-evidence-claim-attribution", title: "Claim attribution", cells: ["Split the answer into verifiable claims, bind direct evidence to each one, and measure citation correctness separately from coverage.", "Does every material number, deadline, and conclusion have direct support?", "A related document does not necessarily support the whole answer."], sourceIds: deepDiveSourceIds("deep-evidence-compiler") },
        { id: "deep-evidence-scope-abstain", title: "Qualify or abstain", cells: ["When evidence is insufficient, stale, conflicting, or unauthorized, narrow the answer, state uncertainty, or escalate.", "Which claims require evidence and which may be labeled professional judgment?", "Adding links after generation is decoration, not an auditable evidence chain."], sourceIds: deepDiveSourceIds("deep-evidence-compiler") },
      ]),
      cards("Accept the offline evidence handoff before exposing an index", "Data Engineering owns connection, parsing, cleaning, deduplication, and change propagation. RAG accepts the handoff only when each evidence object can be found, verified at the source, authorized, updated, and withdrawn.", [
        { id: "deep-migration-stable-snapshot", title: "Receive an authoritative snapshot", subtitle: "Authority and Scope", body: "Require a stable source ID, original version, effective scope, owner, license or use boundary, ACL, and processing version.", decision: "Block material that lacks an authoritative source, applicable version, or permitted-use boundary.", boundary: "A RAG intake check does not replace source-system governance or content approval.", sourceIds: deepDiveSourceIds("deep-offline-handoff") },
        { id: "deep-migration-dual-index", title: "Build evidence objects", subtitle: "Identity and Coordinates", body: "Carry original coordinates, parent relationships, version, validity, ACL, authority, and extraction method with every retrievable unit.", decision: "Define the minimum evidence object before comparing parsers, chunkers, embedding models, or indexes.", boundary: "Text and a vector without source identity and version are not auditable evidence.", sourceIds: deepDiveSourceIds("deep-offline-handoff") },
        { id: "deep-migration-shadow", title: "Choose units and representations", subtitle: "Structure and Retrieval", body: "Use clauses, headings, tables, or other business structure to create understandable units, then build sparse, dense, or structured representations as the task requires.", decision: "Compare recall, noise, citation location, and context cost on real questions rather than copying a universal chunk value.", boundary: "Chunking cannot repair source conflicts, incorrect extraction, or missing permissions.", sourceIds: deepDiveSourceIds("deep-offline-handoff") },
        { id: "deep-migration-cutover", title: "Publish filterable candidates", subtitle: "Deterministic Policy Fields", body: "Retain tenant, identity, region, product version, effective date, and document type as deterministic filters before candidates reach the online chain.", decision: "Prove that reference evidence survives authorized filtering and disappears for prohibited identities.", boundary: "Natural-language instructions cannot replace retrieval-layer access and version controls.", sourceIds: deepDiveSourceIds("deep-offline-handoff") },
        { id: "deep-migration-negative-verification", title: "Pass the offline gate", subtitle: "Positive and Negative Evidence", body: "Use questions with reference evidence, source coordinates, versions, and identities to test extraction, Candidate Recall@K, citation return, and unauthorized negatives.", decision: "Release material only when authorized identities find valid evidence reliably and prohibited identities do not.", boundary: "A green job, expected document count, or completed vector write is not proof that RAG is ready.", sourceIds: deepDiveSourceIds("deep-offline-handoff") },
      ]),
      cards("Cross-cutting controls that every production release must carry", "Attach these controls to both lifecycles and verify them again on every material component, data, policy, or routing change.", [
        { id: "production-control-identity", title: "Identity and authorization", body: "Resolve the current subject and authoritative policy before protected evidence is returned; carry the decision through candidate generation, reranking, caches, citations, and logs.", decision: "Negative tests must show zero unauthorized disclosure for the agreed risk boundary.", boundary: "Prompts and post-generation filtering are not access-control systems.", sourceIds: ["nist-zero-trust", "owasp-vector-weaknesses"] },
        { id: "production-control-untrusted-evidence", title: "Untrusted-content handling", body: "Treat retrieved text and images as data, separate them from system instructions, validate output and tool arguments, and prevent knowledge content from granting itself authority.", decision: "Red-team malicious documents and poisoned sources before enabling external ingestion or tool-capable workflows.", boundary: "RAG, fine-tuning, or a system prompt does not eliminate prompt injection.", sourceIds: ["owasp-prompt-injection", "owasp-vector-weaknesses"] },
        { id: "production-control-trace", title: "Correlated quality and policy trace", body: "Record request and identity context, query plan, candidates, filter reasons, final evidence, source and component versions, answer decision, latency, tokens, cost, and error reason under controlled retention.", decision: "One failed answer must be reconstructable without storing unnecessary sensitive content.", boundary: "Standard telemetry supplies correlation semantics; the project still defines evidence, access, and business-quality fields.", sourceIds: ["opentelemetry-genai-semconv"] },
        { id: "production-control-release", title: "Versioned release and rollback", body: "Bind parser, chunker, embedding, index, reranker, prompt, generator, policy, and evaluation-set versions to a release record with shadow comparison and rollback triggers.", decision: "Promote only when critical slices, deletion, revocation, capacity, and fallback paths pass.", boundary: "A successful deployment or HTTP response is not proof of evidence-chain correctness.", sourceIds: ["nist-genai-profile", "opentelemetry-genai-semconv"] },
        { id: "production-control-incident", title: "Degradation and incident policy", body: "Define which tasks may use cached answers, keyword-only retrieval, a standby index or model, human escalation, or mandatory abstention, then exercise recovery of missed updates and access changes.", decision: "Recovery completes only when knowledge and authorization consistency are re-established.", boundary: "High availability must not preserve an answer path that is stale, unauthorized, or unverifiable.", sourceIds: ["nist-genai-profile", "aws-bedrock-kb-sync", "azure-search-indexer-lifecycle"] },
      ]),
    ],
  },
  {
    id: "rag-evidence-practice",
    eyebrow: "PRACTICAL DELIVERABLES",
    title: "Learn by producing the evidence required for a real decision",
    lead: "The route moves from adoption through offline evidence, retrieval and model experiments, online answer policy, local acceptance, and production handoff. The result is an auditable decision package rather than a working demo with no operating contract.",
    blocks: [
      cards("Learning outcomes", "After completing the module, the reader should be able to make and defend these five decisions.", [
        { id: "learning-outcome-adoption", title: "Decide whether RAG is warranted", body: "Compare RAG with direct context, search, structured queries, fine-tuning, and deterministic application logic using the business baseline and evidence requirement.", decision: "State the boundaries for supported, qualified, and declined answers." },
        { id: "learning-outcome-evidence-handoff", title: "Accept or reject the evidence supply", body: "Review whether material is retrievable, locatable, authorized, versioned, updateable, and withdrawable before it reaches the online answer path.", decision: "Return unresolved parsing, authority, or access defects to the accountable owner." },
        { id: "learning-outcome-component-selection", title: "Select components through controlled experiments", body: "Compare evidence units, sparse and dense routes, embeddings, rerankers, and generators on the same task slices instead of assembling a product catalog.", decision: "Require an observed failure, incremental result, and budget for every added stage." },
        { id: "learning-outcome-diagnosis", title: "Locate a failure in the evidence chain", body: "Separate candidate recall, policy filtering, final evidence, claim support, and answer action, then preserve a trace that can reproduce the result.", decision: "Assign the repair to source processing, retrieval, evidence compilation, generation, or a cross-cutting control." },
        { id: "learning-outcome-release-decision", title: "Make a Go, Repair, or Stop decision", body: "Use quality, risk, P95, lifecycle behavior, and cost per successful outcome while preserving no-go conditions and unverified assumptions.", decision: "Hand complete ROI and operating ownership to the relevant scenario, FinOps, security, evaluation, and AI operations owners." },
      ]),
      steps("Recommended learning route", "Each checkpoint produces evidence needed by the next step; do not advance because a component merely runs.", [
        { id: "learning-route-adoption", title: "Establish the adoption boundary", body: "Begin with the business outcome, current workflow, search baseline, knowledge change, access, citations, and safe-stop requirement.", decision: "Checkpoint: explain when a simpler route is sufficient and what RAG must change." },
        { id: "learning-route-offline-handoff", title: "Establish the offline evidence handoff", body: "Accept authority, original coordinates, version, validity, ACL, stable IDs, and a deletion path for every evidence unit.", decision: "Checkpoint: an authorized identity can find and verify the evidence, while a revoked identity cannot." },
        { id: "learning-route-retrieval-baseline", title: "Build the retrieval and model baseline", body: "Compare evidence-unit design, sparse, dense, hybrid, reranking, and generation on one frozen question and identity set.", decision: "Checkpoint: every added component has an observed failure, incremental metric, P95 impact, and rollback path." },
        { id: "learning-route-answer-policy", title: "Design the online answer decision", body: "Connect current-turn resolution, hard filters, retrieval budget, conflict policy, and claim-level evidence to the answer action.", decision: "Checkpoint: the application can explain when it asks, retrieves again, qualifies, abstains, or escalates." },
        { id: "learning-route-local-acceptance", title: "Complete local RAG acceptance", body: "Test candidate recall, final evidence, faithfulness, claim citations, unauthorized cases, update, deletion, and revocation by task and risk slice.", decision: "Checkpoint: no aggregate score hides a critical failure and every failure has an accountable repair owner." },
        { id: "learning-route-production-handoff", title: "Form the production handoff decision", body: "Package the RAG trace, quality slices, P95, cost per successful outcome, security and lifecycle gates, stop conditions, and remaining hypotheses.", decision: "Checkpoint: the decision states Go, Repair, or Stop and names every cross-module owner." },
      ]),
      cards("Practice labs", "Run the labs with customer-like material, identities, questions, and constraints. The deliverable and acceptance statement matter more than completing the implementation.", [
        { id: "learning-lab-data-readiness", title: "Review RAG data readiness", subtitle: "Portal, PDF, scan, and permission sources", body: "Sample authority, version, scope, license, owner, ACL, text, tables, coordinates, stable IDs, evidence-unit relationships, and negative access cases.", decision: "Deliverable: an evidence-handoff checklist, reference questions, and a blocking-issue report.", boundary: "Accept only when every passed item has source, version, identity, and query proof; return parsing or governance defects to Data Engineering or Security.", sourceIds: labSourceIds("learning-lab-data-readiness") },
        { id: "learning-lab-retrieval-routes", title: "Compare four retrieval routes", subtitle: "Exact terms, semantic variation, and compound constraints", body: "Freeze reference-evidence questions, then compare sparse, dense, hybrid, and hybrid-plus-reranker candidates for Recall@K, final evidence coverage, P95, and incremental value.", decision: "Deliverable: a route experiment table and recommendation by query slice.", boundary: "Accept only when failure distribution and incremental evidence justify the route; reranking cannot conceal missing candidates.", sourceIds: labSourceIds("learning-lab-retrieval-routes") },
        { id: "learning-lab-risk-trace", title: "Exercise a high-risk answer and reconstruct its trace", subtitle: "Unauthorized, obsolete, conflicting, absent, and malicious evidence", body: "Record the query plan, candidates, filter reasons, reranked order, final evidence, versions, answer action, material claims, citations, and escalation outcome.", decision: "Deliverable: a RAG risk case set, one complete trace, and an ownership report.", boundary: "Accept only when every claim returns to valid evidence, unauthorized content stays out of candidates, and fluent generation cannot conceal insufficient support.", sourceIds: labSourceIds("learning-lab-risk-trace") },
        { id: "learning-lab-economics-decision", title: "Turn the PoC into an economic decision", subtitle: "Demo quality is not an approval", body: "Freeze the current workflow and compare task success, handling time, human work, retrieval, answer action, citations, P95, risk slices, offline processing, online serving, retries, and escalation.", decision: "Deliverable: a Go / Repair / Stop package and a list of ROI hypotheses for the scenario and FinOps owners.", boundary: "Accept only when cost per successful outcome retains quality and risk gates; local RAG economics do not prove complete ROI.", sourceIds: labSourceIds("learning-lab-economics-decision") },
      ]),
      cards("Eight artifacts for an end-to-end RAG decision", "Use the artifacts as living operating records. They should remain useful when a parser, embedding model, index, reranker, generator, policy, or cloud service changes.", [
        { id: "deliverable-adoption-brief", title: "Adoption and baseline brief", body: "Business task, users, current workflow, task and risk slices, volume, handling time, escalation, error cost, desired outcome, decision owner, and no-go conditions.", decision: "Answers: why consider RAG at all?" },
        { id: "deliverable-evidence-contract", title: "Evidence contract", body: "Authoritative sources, version and conflict rules, identities and ACLs, required coordinates, material-claim policy, qualification, continuation, abstention, and review path.", decision: "Answers: what may count as support for this user and claim?" },
        { id: "deliverable-offline-acceptance", title: "Offline evidence-supply report", body: "Document routing, parsing and cleaning quality, evidence-unit design, metadata and lineage, index routes, version matrix, processing failures, update, deletion, and revocation results.", decision: "Answers: is governed material entering and leaving the system correctly?" },
        { id: "deliverable-online-trace", title: "Online answer-decision trace", body: "Original request, identity, route, candidates, filters, ranks, final evidence, source and component versions, answer decision, citations, latency, tokens, cost, and error reason.", decision: "Answers: why did this answer happen?" },
        { id: "deliverable-component-scorecard", title: "Component and model scorecard", body: "Frozen evaluation set, candidates, quality delta, P95 delta, unit-cost delta, security and data constraints, compatibility, migration, rollback, and selected version combination.", decision: "Answers: why this parser, embedding, retriever, reranker, generator, and evaluator?" },
        { id: "deliverable-production-readiness", title: "Production control and recovery review", body: "Threat cases, authorization tests, telemetry and retention, capacity, degraded modes, incident ownership, rollback, index rebuild, and recovery of missed knowledge or access events.", decision: "Answers: can the team operate the evidence contract under failure?" },
        { id: "deliverable-economics-decision", title: "Go / Repair / Stop decision record", body: "Benefit, cost per successful outcome, risk-slice results, no-go conditions, residual risk, accountable owner, scope, assumptions, next action, and review trigger.", decision: "Answers: should this workload proceed now?" },
        { id: "deliverable-extension-record", title: "Optional-complexity justification", body: "Measured failure that motivates Agent, MCP, A2A, graph, multimodal, or structured-data capability; incremental value; added risk, cost, and controls; deterministic fallback.", decision: "Answers: why is the extension necessary rather than fashionable?" },
      ]),
      boundary("evidence-card-usage-boundary", "Evidence-card rule", "Retain the metric, experimental conditions, and non-extrapolation boundary together. Never detach a number from the workload and baseline that produced it."),
    ],
  },
  {
    id: "cloud-opportunities",
    eyebrow: "CLOUD OPPORTUNITY MAP",
    title: "Map RAG capabilities to cloud opportunities",
    lead: "Describe the required capability in vendor-neutral terms first, then map it to current products, regions, quotas, service levels, and charging units.",
    blocks: [
      table("Capability-to-service discovery map", undefined, ["RAG stage", "Relevant cloud capabilities", "Customer value", "Discovery question"], [
        { id: "cloud-data-ingestion", title: "Data ingestion", cells: ["Object storage, databases, file services, SaaS connectors, CDC, and messaging", "Consolidate sources and establish incremental synchronization.", "Where is the data, and how quickly must additions, changes, and deletions take effect?"] },
        { id: "cloud-document-understanding", title: "Document understanding", cells: ["OCR, document intelligence, batch processing, functions, and container jobs", "Turn PDFs, scans, tables, and images into traceable content.", "What proportion is scanned, multi-column, or table-heavy?"] },
        { id: "cloud-data-governance", title: "Data governance", cells: ["Catalogs, metadata, quality, masking, master data, and lineage", "Identify authority, version, ownership, and retention.", "Who approves content, and which source wins when versions conflict?"] },
        { id: "cloud-retrieval-index", title: "Retrieval and indexing", cells: ["Managed search, vector stores, relational databases, caches, and knowledge graphs", "Provide keyword, semantic, filtered, and relationship queries.", "What share of real questions is exact lookup, semantic retrieval, or relationship analysis?"] },
        { id: "cloud-model-capability", title: "Model capability", cells: ["Model services, embeddings, rerankers, fine-tuning, and inference", "Supply vectorization, reranking, generation, and model replaceability.", "May data leave the environment, and how do quality, language, and latency rank?"] },
        { id: "cloud-application-runtime", title: "Application runtime", cells: ["Serverless, containers, Kubernetes, API gateways, and load balancing", "Operate the knowledge and answer chains as an elastic online service.", "What are concurrency, peak factor, P95, and availability objectives?"] },
        { id: "cloud-security-compliance", title: "Security and compliance", cells: ["IAM, key management, WAF, private connectivity, and audit", "Carry identity, access policy, and key controls through retrieval and generation.", "Where is the source of access truth, and is isolation required by tenant, document, row, or field?"] },
        { id: "cloud-operations-optimization", title: "Operations and optimization", cells: ["Logs, tracing, APM, evaluation, alerts, and FinOps", "Diagnose failures, measure continuously, and calculate cost per successful answer.", "Who owns quality, and how will the team respond when performance degrades?"] },
      ]),
      cards("Illustrative capability bundles", "These are responsibility maps, not current product SKUs.", [
        { id: "bundle-secure-assistant", title: "Secure enterprise knowledge assistant", subtitle: "BUNDLE A", body: "Object storage or document intelligence + managed search or vector retrieval + model service + API gateway + IAM/key management + observability.", decision: "Buying roles: business, data owner, security, and application teams." },
        { id: "bundle-realtime-sync", title: "Near-real-time knowledge synchronization", subtitle: "BUNDLE B", body: "Database or SaaS + CDC or event bus + serverless processing + incremental indexing + cache invalidation + audit.", decision: "Buying roles: data platform, integration, and business operations." },
        { id: "bundle-private-scale", title: "Privately operated service at scale", subtitle: "BUNDLE C", body: "Kubernetes or GPU inference + private model gateway + vector retrieval + elastic caching + APM and FinOps.", decision: "Buying roles: platform, infrastructure, information security, and procurement." },
      ]),
      boundary("cloud-product-mapping-boundary", "Product mapping is time-sensitive", "A later overlay may map capability → product → limitation → charging unit without changing the durable explanation. Every mapping must state product version, region, lifecycle stage, and verification date."),
    ],
  },
  {
    id: "poc",
    eyebrow: "ECONOMICS AND RELEASE DECISION",
    title: "Use the PoC to decide Go, Repair, or Stop",
    lead: "A PoC is a bounded decision experiment. It must compare the same business tasks with the current workflow, isolate quality and operating costs by stage, and preserve no-go conditions that an attractive average cannot offset.",
    blocks: [
      cards("Four decision gates", "Agree the decision owner, evidence, thresholds, and no-go conditions before running the experiment.", [
        { id: "poc-baseline", title: "Baseline the current business outcome", subtitle: "BASELINE", body: "Freeze representative tasks by value and risk, including current success, handling time, escalation, rework, error cost, volume, identity, authoritative evidence, and human acceptance.", decision: "Repair the experiment if the baseline cannot be reproduced; there is nothing credible to compare against." },
        { id: "poc-data-proof", title: "Prove the minimum trustworthy evidence loop", subtitle: "FEASIBILITY", body: "Use the smallest authoritative corpus that includes real versions and permissions. Validate parsing, evidence units, candidate recall, citations, additions, changes, deletion, revocation, and safe stop.", decision: "Stop or repair if critical evidence is unavailable, unauthorized content leaks, or authority cannot be resolved." },
        { id: "poc-quality-proof", title: "Attribute benefit and full run cost", subtitle: "VALUE", body: "Compare task success, accepted-answer rate, handling time, avoided escalation, and residual review with offline processing, online serving, retries, telemetry, peak reserve, support, and human-operation costs.", decision: "Use cost per successful outcome and business impact; a lower token bill with worse success or P95 is not an improvement." },
        { id: "poc-operations", title: "Make the release decision", subtitle: "GO / REPAIR / STOP", body: "Go when critical quality, security, lifecycle, service, economics, ownership, and rollback gates pass. Repair a named bottleneck when evidence suggests a tractable change. Stop when authority, risk, value, or operating responsibility remains unacceptable.", decision: "PoC completion is not production approval; record scope, assumptions, residual risk, accountable owner, and next review trigger." },
      ]),
      cards("Decision scorecard", "Set thresholds by task and risk slice. Report numerator, denominator, workload, versions, and uncertainty; never let averages hide a no-go failure.", [
        { id: "gate-recall", title: "Reference-evidence availability", body: "Candidate Recall@K before and after filters, sliced by query type, source, language, document form, identity, and risk." },
        { id: "gate-citation", title: "Claim-level evidence quality", body: "Citation correctness, material-claim coverage, source authority, version applicability, and return to an original location." },
        { id: "gate-task-success", title: "Critical-task outcome", body: "Accepted completion, correct next action, avoided escalation, and severe-error rate compared with the current workflow." },
        { id: "gate-latency", title: "User-visible service quality", body: "P50/P95/P99, time to first token, timeout, retry, queueing, and degradation behavior at representative load." },
        { id: "gate-cost", title: "Cost per successful outcome", body: "Offline processing plus online retrieval, reranking, generation, network, cache, telemetry, reserve, support, and human review divided by accepted outcomes." },
        { id: "gate-access", title: "Security no-go conditions", body: "Unauthorized disclosure, cross-tenant leakage, poisoned retrieval, malicious instructions, and policy-bypass tests under real identities." },
        { id: "gate-freshness", title: "Lifecycle service objectives", body: "End-to-end propagation for additions, corrections, effective versions, deletions, and access revocation, including caches and fallback paths." },
        { id: "gate-human-acceptance", title: "Adoption and residual work", body: "Reviewer acceptance, edit distance or rework, escalation, complaint, training burden, and who remains accountable for the final business decision." },
      ]),
    ],
  },
  {
    id: "rag-customer-question-guide",
    eyebrow: "CUSTOMER QUESTION PACK",
    title: "Common customer questions with decision-ready answers",
    lead: "The question pack follows the same decision path: adoption, evidence and data, online behavior, component selection, evaluation, production controls, economics, and optional extensions. Each answer keeps evidence scope and the next discovery question visible.",
    blocks: [
      boundary("qa-evidence-boundary", "How to use the question pack", "Use the short answer to state the decision, open the technical detail to explain the mechanism and boundary, and follow every source before turning a product-specific, dynamic, or quantitative statement into a commitment. The question set does not override customer-specific legal, security, or business review."),
    ],
  },
];

const sectionOrder = Object.freeze([
  "concept-map",
  "when-to-use",
  "rag-principle",
  "architecture",
  "retrieval-basics",
  "production-rag",
  "choice",
  "rag-independent-depth",
  "cloud-opportunities",
  "poc",
  "rag-variants",
  "rag-evidence-practice",
  "rag-customer-question-guide",
]);
const independentDepthBlockTitlesInReadingOrder = Object.freeze([
  "Accept the offline evidence handoff before exposing an index",
  "Treat additions, changes, deletions, and access revocation as separate consistency paths",
  "Control online query planning without turning every request into an Agent loop",
  "Compile evidence at claim level",
  "Cross-cutting controls that every production release must carry",
]);
const sectionById = new Map(sectionDrafts.map((section) => [section.id, section]));
const orderedSections = sectionOrder.map((sectionId) => {
  const section = sectionById.get(sectionId);
  if (!section) throw new Error(`Missing RAG English section: ${sectionId}`);
  if (sectionId === "rag-independent-depth") {
    const blocksByTitle = indexUnique(section.blocks, "title", "RAG independent-depth blocks");
    const orderedBlocks = independentDepthBlockTitlesInReadingOrder.map((title) => {
      const block = blocksByTitle.get(title);
      if (!block) throw new Error(`Missing RAG independent-depth block: ${title}`);
      return block;
    });
    const orderedTitles = new Set(independentDepthBlockTitlesInReadingOrder);
    const unclassifiedBlocks = section.blocks.filter((block) => !orderedTitles.has(block.title));
    return { ...section, blocks: [...orderedBlocks, ...unclassifiedBlocks] };
  }
  return section;
});
const orderedSectionIds = new Set(sectionOrder);
const sections = [
  ...orderedSections,
  ...sectionDrafts.filter((section) => !orderedSectionIds.has(section.id)),
];

const qaCopy = [
  {
    id: "long-context-vs-rag",
    q: "Context windows are already very long. When does RAG still add value?",
    a: "Long context determines how much material a request can carry. RAG determines which current, authorized evidence should be carried. Direct context is often simpler when the corpus is small, stable, uniformly accessible, and economical to send in full.",
    depth: "Compare the approaches on the same tasks rather than on token limits alone. Measure reference-evidence availability, position sensitivity, time to first token, repeated-input cost, identity-based filtering, citation precision, and update or withdrawal behavior. Position-sensitive performance has been observed in specific multi-document and key-value tasks; that finding justifies a customer baseline, not a claim that retrieval always wins.",
    ask: "How large and volatile is the usable corpus, who sees different material, which claims need a source, and where does the current direct-context or search route fail?",
    tag: "Adoption decision",
    basis: "Long-context research + RAG mechanism + customer baseline",
    supports: {
      "lost-middle": "Reports position-sensitive use of long context in specific tasks and models; it does not establish that RAG is universally superior.",
      "rag-original-2020": "Establishes the combination of parametric memory and externally retrieved memory in the original RAG formulation; it does not define enterprise access or lifecycle controls.",
    },
  },
  {
    id: "rag-vs-fine-tuning",
    q: "How should we choose between RAG and fine-tuning?",
    a: "Start with RAG when the gap is changing evidence that must be cited or withdrawn. Evaluate fine-tuning when the gap is stable behavior, format, style, or task policy. They solve different problems and may be combined.",
    depth: "Fine-tuning changes parameterized behavior, which makes item-level refresh and attribution difficult. RAG supplies evidence at request time, allowing sources and permissions to change independently. One task-specific study favored retrieval over the unsupervised fine-tuning route it evaluated for new-fact injection, but it does not show that all fine-tuning is unsuitable for knowledge work. Diagnose whether the residual error is evidence supply or answer behavior before training.",
    ask: "Is the changing requirement factual evidence or response behavior, how often does it change, and must individual facts be cited and withdrawn?",
    tag: "Adoption decision",
    basis: "Task-specific research + modular system boundary",
    supports: {
      "fine-tuning-or-retrieval": "Supports the reported retrieval comparison for new-fact injection within the paper's setting, not a universal rejection of fine-tuning.",
      "replug-2024": "Demonstrates a modular route in which retrieval can evolve around a frozen black-box language model.",
    },
  },
  {
    id: "vector-database-required",
    q: "Does every RAG system need a vector database?",
    a: "No. Exact identifiers, names, dates, and governed filters may favor sparse or structured retrieval. Semantic variation may justify embeddings. Reuse an existing search engine or database when it meets the evidence, lifecycle, and operating contract.",
    depth: "A vector store is one candidate-discovery component, not a RAG system. Selection must include filtering, access, update and deletion behavior, index versioning, backup, and operations—not only a similarity API. For HNSW or another approximate index, establish Recall@K, P95, memory, and rebuild baselines before tuning search parameters against a stable corpus and query distribution.",
    ask: "Are users finding paraphrases, exact facts, or filtered records, and which real questions defeat the current search and database paths?",
    tag: "Adoption decision",
    basis: "Sparse, dense, and approximate-retrieval mechanisms",
    supports: {
      "bm25-book": "Supports the term-based ranking mechanism behind a sparse retrieval baseline.",
      "beir-2021": "Compares sparse and dense retrieval across heterogeneous datasets and supports retaining multiple baselines; it does not select a winner for the customer corpus.",
      "hnsw-2016": "Supports the recall, search-cost, and resource trade-offs of a common approximate nearest-neighbor index.",
    },
  },
  {
    id: "managed-vs-composable",
    q: "Should we use a managed RAG service or compose the stack ourselves?",
    a: "Write a capability and responsibility contract first. Managed services can reduce delivery work, but they do not assume the customer's authority, access acceptance, answer risk, or value decision. A composed stack provides more control and leaves more upgrade, capacity, security, and recovery work with the team.",
    depth: "Compare connectors and deletion, parsing, sparse and dense retrieval, filters, reranking, identity, network, model portability, traces, quotas, region, service levels, backup, and charging units against current official documentation. Keep responsibilities explicit: the RAG design owns evidence compilation and answer behavior; data, platform, AI operations, security, and the business owner retain their own acceptance obligations.",
    ask: "Which stages truly require customization, which responsibilities will the team operate for years, and do the candidates meet the target region, network, access, and withdrawal requirements?",
    tag: "Adoption decision",
    basis: "Official product mechanisms + responsibility analysis",
    supports: {
      "aws-bedrock-kb-sync": "Documents one managed synchronization mechanism for additions, changes, and deletions; connector and governance coverage remain product-specific.",
      "azure-search-document-acl": "Documents document-level access capability in one managed search service; current scope and lifecycle limits require verification.",
      "azure-search-index-alias": "Documents one product-specific index-alias mechanism for controlled cutover and rollback.",
      "nist-genai-profile": "Supports explicit governance, measurement, and management of generative-AI risk; it does not transfer accountability to a managed service.",
    },
  },
  {
    id: "agent-mcp-a2a-boundary",
    q: "Does an enterprise RAG application also need an Agent, MCP, or A2A?",
    a: "Usually not. A read-only assistant can use deterministic application logic for retrieval, evidence compilation, and answering. Add an Agent for justified adaptive multi-step work, MCP for a standardized capability interface, and A2A for task collaboration between independently operated Agents.",
    depth: "The three additions change different boundaries: Agent changes runtime control, MCP changes how capabilities are exposed and consumed, and A2A changes cross-Agent task and artifact exchange. None repairs weak source authority, parsing, candidate recall, access control, or citation quality. Begin with the failed task slice that ordinary RAG cannot solve, then add the relevant budget, permission, stopping, protocol-version, task-state, and fallback tests.",
    ask: "Why is one deterministic retrieval pass insufficient: do we need adaptive planning, standardized capability access, or durable task delegation between independent Agents?",
    tag: "Adoption decision",
    basis: "Modular RAG + Agent adoption guidance + official protocol models",
    supports: {
      "rag-survey": "Supports selecting advanced or modular RAG components by task rather than treating complexity as a universal upgrade.",
      "anthropic-effective-agents": "Distinguishes predefined workflows from model-directed Agents and recommends beginning with the simplest effective design.",
      "mcp-architecture": "Defines MCP host, client, server, and capability-exchange boundaries; it does not say that every RAG application needs the protocol.",
      "a2a-concepts": "Defines tasks, messages, parts, and artifacts for collaboration between independent Agents; it does not apply to ordinary single-pass retrieval.",
    },
  },
  {
    id: "pdf-scans-tables-images",
    q: "Can RAG work with PDFs, scans, tables, and images?",
    a: "Yes, but route by where the evidence lives. Preserve structure and coordinates in digital documents, use OCR for scans, and compare visual page retrieval or fused routes when charts, layout, or spatial relationships carry the answer.",
    depth: "Data engineering owns parsing, cleaning, and repair. RAG accepts the handoff only when reference evidence can enter the candidate set and citations can return to the original page or region. Plain-text extraction can scramble columns, headers, footnotes, and cross-page tables; visual representations retain layout while adding compute, indexing, and localization challenges. Report evidence recall, citation location, P95, and cost by document type and language.",
    ask: "What proportion is digital, scanned, tabular, or visual, what evidence does each type contain, and how precisely must a citation return to the source?",
    tag: "Offline evidence",
    basis: "Document parsing, OCR, and visual-retrieval research",
    supports: {
      "docling-report": "Supports layout-aware conversion and table recovery; successful parsing alone does not establish downstream RAG quality.",
      "pp-ocr-2020": "Supports an OCR pipeline based on detection, direction classification, and recognition; results do not cover arbitrary scan quality.",
      "colpali-2025": "Supports page-image multi-vector retrieval; quality and cost still require validation on the customer corpus.",
    },
  },
  {
    id: "chunk-size-overlap",
    q: "What chunk size and overlap should we use?",
    a: "There is no corpus-independent optimum. An evidence unit should be understandable, locatable, permissionable, versionable, and withdrawable; choose boundaries by comparing real questions, not by copying a token count.",
    depth: "Small units can split conditions, headings, or table semantics. Large units dilute the subject and consume context. Begin with natural business structure such as clauses, headings, tables, or code, then test parent expansion, neighboring evidence, semantic boundaries, and overlap against observed failures. Overlap can protect a boundary while increasing index size, duplicate candidates, and prompt cost. A result from one task does not supply settings for another corpus.",
    ask: "Does the supporting evidence usually fit in a sentence, clause, table, or several sections, and must citations resolve to an exact page or region?",
    tag: "Offline evidence",
    basis: "Task-specific research + customer-corpus experiment",
    supports: {
      "chunking-study": "Shows that chunking changes performance in a particular code-RAG task; its settings are not portable to every corpus.",
      "rag-survey": "Supports treating chunking and pre-retrieval augmentation as separately designed RAG stages.",
      "lost-middle": "Supports testing position effects in long contexts; it does not prove that larger chunks are more reliable.",
    },
  },
  {
    id: "chunk-metadata-parent-page-version",
    q: "Why must evidence units retain parent links, pages, versions, and metadata?",
    a: "Retrieval finds a fragment; a customer verifies an original business record. Stable document and unit IDs, source coordinates, version, validity, ACL, authority, and parent relationships enable expansion, precise citation, update, withdrawal, and audit.",
    depth: "Parent relationships allow a small unit to be retrieved and a fuller parent to be compiled. Page and region coordinates support return to source. Version and validity prevent mixed terms. ACL fields constrain use by the current identity. Stable IDs align incremental changes and dual-index comparison. These fields must come from authoritative systems and deterministic processing, not from model guesses.",
    ask: "Does the content system provide stable IDs, versions, effective dates, owners, and ACLs, and must citations resolve to a document, page, or table cell?",
    tag: "Offline evidence",
    basis: "Document structure + lifecycle and risk governance",
    supports: {
      "docling-report": "Supports preserving layout, structure, and tables as a technical basis for source coordinates.",
      "azure-search-indexer-lifecycle": "Supports the distinct lifecycle of indexed content and why reset or rerun does not replace update and deletion design.",
      "nist-genai-profile": "Supports governance of provenance, validity, and lifecycle; the exact metadata schema remains an engineering decision.",
    },
  },
  {
    id: "structured-data-vectorization",
    q: "Should metrics and transactions be chunked and stored directly in a vector index?",
    a: "Usually not. Exact calculations, filters, aggregations, and current state belong behind controlled SQL, a semantic layer, or a business API. Vector retrieval is better suited to definitions, documentation, and candidate entities.",
    depth: "Route document lookup and computation separately. Retrieval can identify the metric definition and authoritative system; a deterministic query enforces access, time range, aggregation, and numerical correctness; the model explains the result with provenance. Text snapshots of transaction tables invite staleness, duplicate records, wrong aggregation, and row or column access gaps. RAG accepts the structured result as evidence but does not own SQL safety or metric governance.",
    ask: "Is the user asking for a definition or a calculation, where is the authoritative metric contract, and are a semantic layer, row and column access, audit, and read-only execution available?",
    tag: "Offline evidence",
    basis: "Modular RAG + data and risk governance",
    supports: {
      "rag-survey": "Supports routing different retrieval and augmentation components by task rather than vectorizing every data source.",
      "nist-genai-profile": "Supports governance of data validity and output risk; SQL controls remain an application and data responsibility.",
      "alce-2023": "Supports claim-level evidence coverage; a structured result should preserve query, time, and authoritative source.",
    },
  },
  {
    id: "cross-language-retrieval",
    q: "How should retrieval work when users ask in one language and the evidence is in another?",
    a: "Distinguish multilingual same-language retrieval from true cross-language retrieval. For the latter, compare multilingual embeddings, query translation, translated indexing, and sparse–dense fusion on the same language-pair evaluation set.",
    depth: "Freeze original questions, authoritative evidence, and acceptable answers for each language pair. Measure Candidate Recall@K, terminology, numbers, names, negation, citation return, P95, and cost. Translation may improve lexical alignment while changing product names or conditions, so retain the original query, the translated query, and the original-language evidence. Localize the explanation when useful, but bind material claims to the authoritative original.",
    ask: "Which languages do users and sources use, which terms must not be translated, and should the answer display the original evidence alongside a localized explanation?",
    tag: "Offline evidence",
    basis: "Cross-language retrieval dataset + modular retrieval + claim-level citation",
    supports: {
      "clirmatrix-2020": "Provides bilingual and multilingual datasets in which query and relevant-document languages differ; it does not predict enterprise-domain performance.",
      "rag-survey": "Supports composing query-processing, retrieval, and augmentation components by task; it supplies no universal cross-language winner.",
      "alce-2023": "Supports direct evidence for material claims; translation does not remove the need to return to the original source.",
    },
  },
  {
    id: "source-update-freshness",
    q: "How quickly should a source change appear in an answer?",
    a: "End at the user-visible answer, not at a green synchronization job. Measure additions, changes, deletions, and access revocation separately across discovery, parsing, indexing, caches, candidates, final evidence, and citations.",
    depth: "Data engineering propagates changes reliably; RAG proves that its own candidate set, final context, citations, and caches have switched. Record source_version, effective_at, indexed_at, acl_version, and deletion_at as an engineering design, then run positive and negative probes with real identities. No universal minute or hour target exists; business risk, current service capability, and PoC evidence set the objective.",
    ask: "How quickly must each change type take effect, and which overdue changes require the application to block the answer or escalate?",
    tag: "Offline evidence",
    basis: "Official synchronization behavior + zero-trust principle + customer service objective",
    supports: {
      "aws-bedrock-kb-sync": "Documents propagation of additions, changes, and deletions through one managed synchronization process.",
      "azure-search-indexer-lifecycle": "Documents separate reset, run, rebuild, deletion, orphan, and ACL-change behaviors in one indexing service.",
      "nist-zero-trust": "Supports authorization at each resource access rather than trust in an obsolete access snapshot.",
    },
  },
  {
    id: "department-customer-access-control",
    q: "How do we enforce different access rights for departments and customers?",
    a: "The identity system, application, and retrieval service must enforce access deterministically. A prompt is not an access-control mechanism. Subject, tenant, groups, document policy, and data version must affect candidates, caches, final checks, citations, and audit.",
    depth: "Security owns identity, policy, isolation, and incident response. RAG must prove locally that unauthorized evidence never enters the candidate set, access changes reach every derived copy, and answers do not leak protected text or metadata. Use positive and negative tests under real identities, include access context in cache keys, and minimize logged content while retaining controlled provenance.",
    ask: "Which system is authoritative for permissions, what isolation granularity is required, how quickly must revocation propagate, and how do caches distinguish identity?",
    tag: "Offline evidence",
    basis: "Zero-trust principle + retrieval-security boundary + product mechanism",
    supports: {
      "nist-zero-trust": "Supports authentication and authorization before resource access rather than implicit trust.",
      "owasp-vector-weaknesses": "Supports fine-grained access control, isolation, source validation, and retrieval logging for vector and embedding systems.",
      "azure-search-document-acl": "Documents one managed document-level access capability; its current scope and lifecycle limitations remain product-specific.",
    },
  },
  {
    id: "malicious-instructions-in-documents",
    q: "Can malicious instructions inside retrieved material attack a RAG system?",
    a: "Yes. Retrieved material is untrusted data and must not be promoted to system instruction. RAG, fine-tuning, and a system prompt do not inherently eliminate indirect prompt injection.",
    depth: "Security owns the complete threat model. RAG preserves source identity, separates evidence from instructions, limits discoverable material, and tests whether malicious content changes the answer policy or reaches a privileged action. If the application can use tools, evidence and tool authorization remain separate trust domains; write operations still require Agent or application policy and, when appropriate, human approval.",
    ask: "Does the system only answer, who can write to each source, and what is the most privileged tool or business state that malicious evidence could influence?",
    tag: "Offline evidence",
    basis: "Community security guidance + local RAG control boundary",
    supports: {
      "owasp-prompt-injection": "Directly supports that retrieval or fine-tuning does not completely eliminate prompt injection.",
      "owasp-vector-weaknesses": "Supports poisoning, cross-context leakage, access-control, and source-validation risks in vector and embedding systems.",
    },
  },
  {
    id: "component-model-stack-selection",
    q: "How should we combine parsing, embedding, reranking, generation, and evaluation models?",
    a: "Treat them as five different jobs. Accept parsing by evidence recovery, embeddings by candidate recall, reranking by within-set ordering, generation by claim support and task outcome, and evaluation models by calibration against stable human adjudication.",
    depth: "Freeze the same corpus, questions, identities, versions, and load. Establish a simple replaceable baseline, then change one job at a time. Record the parser, evidence-unit design, embedding, index, reranker, generator, prompt, policy, and evaluator as one version matrix. A larger generator does not repair missing candidates, and an evaluator cannot validate itself. Compare hosted, open, and self-operated routes separately for data boundaries, capacity, operations, and total cost.",
    ask: "Which job is failing now, what local metric and hard constraint accepts each job, and what data and migration work does replacement require?",
    tag: "Online retrieval",
    basis: "Modular research + staged retrieval and evaluation",
    supports: {
      "docling-report": "Supports document conversion and structure recovery as a distinct technical responsibility; it does not establish answer quality.",
      "mteb-2023": "Shows that embedding performance varies across task families and languages; the benchmark does not replace retrieval testing on the target corpus.",
      "bert-reranker": "Supports a second-stage query–passage ranking model and its candidate-set boundary.",
      "replug-2024": "Supports decoupling an external retriever from a frozen black-box language model.",
      "ragas": "Supports separate automated dimensions for context and answer quality; evaluator outputs still require human calibration.",
    },
  },
  {
    id: "hybrid-rrf-reranker",
    q: "What different problems do Hybrid Search, RRF, and a reranker solve?",
    a: "Hybrid Search broadens coverage with sparse and dense routes. RRF combines their rank positions. A reranker makes a finer query–evidence judgment within a limited candidate set. Candidate K is a recall budget; final-context K is an answer budget.",
    depth: "BM25 and vector scores occupy different spaces and should not be compared directly. RRF uses result positions rather than assuming score calibration. A reranker reads the query and candidate together, adds latency, and cannot recover missing evidence. Measure incremental recall from each route, fused Candidate Recall@K, post-rerank MRR or nDCG, final evidence coverage, added P95, and cost.",
    ask: "Are failures caused by missed exact terms, missed semantic variants, or reference evidence that is retrieved but ranks outside the final context?",
    tag: "Online retrieval",
    basis: "Sparse, dense, and two-stage ranking research + customer experiment",
    supports: {
      "bm25-book": "Supports term-based sparse ranking as the exact-signal route.",
      "dpr-2020": "Supports dense candidate retrieval and dataset-bounded recall measurement.",
      "rrf-2009": "Introduces rank-position fusion without assuming that different retrievers share a score scale; its reported comparisons remain dataset-bound.",
      "bert-reranker": "Supports joint query–passage ranking after candidate discovery and its inability to recover absent evidence.",
    },
  },
  {
    id: "document-exists-no-answer",
    q: "The document exists. Why can the system still fail to answer?",
    a: "Locate the handoff where the reference evidence disappeared: source acceptance, candidate discovery, policy filtering, reranking, evidence compilation, or model use. Do not begin by replacing the generator.",
    depth: "Use a diagnostic set containing the expected answer, source location, version, and caller identity. Inspect parsing completeness, Candidate Recall@K, recall after filters, reranked position, final evidence coverage, and answer faithfulness in order. A reranker cannot recover evidence outside its candidates. The generator or prompt becomes the direct suspect only after the correct evidence and answer policy reach the final context.",
    ask: "Can the customer provide failed questions across major tasks and risks, with the correct document, passage, version, and access identity?",
    tag: "Online retrieval",
    basis: "Stage-specific research metrics + local failure diagnosis",
    supports: {
      "dpr-2020": "Supports measuring candidate retrieval separately through top-K passage accuracy.",
      "bert-reranker": "Supports finer ranking within an existing candidate set, not recovery outside it.",
      "ragas": "Supports separating context relevance and answer faithfulness during RAG evaluation.",
    },
  },
  {
    id: "agentic-retrieval-query-decomposition",
    q: "Does agentic retrieval or query decomposition always improve accuracy?",
    a: "No. It may add evidence for multi-intent, multi-hop, or source-selection tasks. Exact identifiers, short facts, and single-hop requests may become slower or worse when rewriting drops hard terms and adds calls.",
    depth: "Keep the original request and evaluate exact lookup, semantic explanation, multi-hop comparison, and cross-source slices separately. For every rewrite or subquery, record incremental candidates, duplicates, P95, cost, and final task success. Stop when no new evidence appears or the budget is exhausted. A HyDE hypothetical document may guide discovery but cannot become evidence. Product-specific rewrite capabilities and lifecycle stages require current verification.",
    ask: "Which real tasks require multiple sources or steps, and which identifiers, dates, negations, or business constraints must survive every rewrite?",
    tag: "Online retrieval",
    basis: "Query-planning research + product-specific mechanisms",
    supports: {
      "hyde-2023": "Supports hypothetical-document embeddings as a retrieval aid; the generated hypothetical document is not answer evidence.",
      "azure-search-query-rewrite": "Documents one preview query-rewrite capability and warns that exact unique terms can be lost.",
      "aws-bedrock-query-decomposition": "Documents optional query decomposition and the possibility of additional query activity; it does not guarantee better answers.",
    },
  },
  {
    id: "multi-turn-conversation-retrieval",
    q: "How should conversation history affect retrieval for the next turn?",
    a: "Use history to resolve references such as ‘that version’ or ‘continue the comparison,’ not as authoritative evidence. Preserve the current user's words, create a standalone current query, and reacquire identity, time, region, and product constraints on every turn.",
    depth: "Separate confirmed user constraints, unresolved assumptions, retrieved evidence, and model answers. Only confirmed constraints or authoritative system state may become deterministic filters; a previous model answer cannot become fact for the next turn. Compare the original turn, standalone query, and history summary for candidate recall, constraint preservation, unauthorized negative cases, and latency. Replay critical tasks after summarizing long conversations.",
    ask: "Which conditions should persist across turns, which must be reconfirmed, and can history cross a user, tenant, or permission change?",
    tag: "Online retrieval",
    basis: "Modular query processing + original-query preservation + zero-trust boundary",
    supports: {
      "rag-survey": "Supports modular query-processing and retrieval components; it does not make conversation summaries authoritative.",
      "azure-search-query-rewrite": "Documents preserving the original query while producing alternatives; product behavior remains specific to that capability.",
      "nist-zero-trust": "Supports re-evaluating identity and authorization at resource access rather than inheriting a prior decision.",
    },
  },
  {
    id: "evidence-insufficient-answer-action",
    q: "When evidence is incomplete, should the system ask, retrieve again, qualify, or abstain?",
    a: "Ask when a necessary condition must come from the user. Retrieve again when the request is complete but a bounded evidence gap may be closed. Qualify when only part of the requested scope is supported. Abstain or escalate when evidence is missing, conflicting, stale, unauthorized, or too risky.",
    depth: "Define required inputs, minimum evidence, permitted scope, risk tier, and retrieval budget before runtime. Continued retrieval must identify incremental evidence and stop at call, P95, and cost limits. A qualified answer states what is and is not covered. Abstention gives an actionable reason without leaking protected evidence. A model may assist classification, but application rules and accountable owners set high-risk thresholds and escalation.",
    ask: "Which conditions can only the user supply, what evidence supports a complete or partial answer, and which tasks require abstention or human review regardless of fluency?",
    tag: "Evidence-grounded answer",
    basis: "Retrieval self-reflection research + claim-level citation + risk governance",
    supports: {
      "self-rag": "Supports on-demand retrieval and reflection as research mechanisms; it does not make a conventional system self-governing.",
      "alce-2023": "Supports checking direct claim support and citation coverage separately.",
      "nist-genai-profile": "Supports risk-context measurement and management; application-specific answer thresholds remain the operator's responsibility.",
    },
  },
  {
    id: "retrieved-right-document-still-wrong",
    q: "If RAG retrieved the right document, why can the answer still be wrong? Does RAG eliminate hallucinations?",
    a: "No. A candidate hit does not prove that the correct evidence reached the final context, that the generator used it faithfully, or that the source itself is authoritative, current, and applicable.",
    depth: "Separate Candidate Recall, final-evidence coverage, Faithfulness, and Factual Correctness. The system may faithfully repeat an obsolete document and still be wrong. It may also produce a correct sentence from parametric memory without a verifiable chain. RAG improves the ability to inspect support; it does not eliminate unsupported generation or source-governance failure.",
    ask: "Which source governs, who resolves conflicting versions, when may the application qualify or abstain, and which answers need accountable review?",
    tag: "Evidence-grounded answer",
    basis: "RAG evaluation dimensions + risk boundary",
    supports: {
      "ragas": "Supports evaluating context relevance, answer relevance, and faithfulness as distinct dimensions.",
      "self-rag": "Supports evidence and generation reflection in a research system; it does not mean conventional RAG self-checks automatically.",
      "nist-genai-profile": "Supports continuing governance and management beyond a single model metric.",
    },
  },
  {
    id: "citations-trust-compliance",
    q: "If an answer has citations, can it be treated as trustworthy or compliant?",
    a: "No. Verify that each citation directly supports its claim, that all material claims are covered, that the version is current and applicable, and that the user may view the evidence. Compliance remains a governance, legal, and business determination.",
    depth: "Split the answer into verifiable numbers, deadlines, conditions, and conclusions, then bind each to original coordinates. Evaluate citation correctness separately from completeness. A related link may not entail the claim; an accurate quotation may come from an obsolete or inapplicable source. RAG supplies an inspectable evidence chain but does not issue a compliance conclusion.",
    ask: "Which claims require direct evidence, who selects the governing version, and can every citation return to an original location the current user may access?",
    tag: "Evidence-grounded answer",
    basis: "Peer-reviewed citation evaluation + risk governance",
    supports: {
      "alce-2023": "Supports evaluating citation correctness separately from material-claim coverage.",
      "nist-genai-profile": "Supports continuing governance of provenance, validity, transparency, and generative-AI risk.",
    },
  },
  {
    id: "graphrag-everywhere",
    q: "Is GraphRAG an upgrade that every knowledge base should adopt?",
    a: "No. GraphRAG is primarily a candidate for relationship discovery, theme synthesis, and global questions across many documents. Single-hop facts, exact terms, and routine service questions should retain ordinary retrieval as the baseline.",
    depth: "GraphRAG extracts entities and relationships, builds communities, and produces summaries. That creates additional model calls, indexing time, update consistency, access propagation, and quality governance. Test it only when failed questions require cross-document relationships or corpus-wide synthesis and when entity, relationship, summary, and source-provenance quality can be accepted. It does not replace original citations or precise fact retrieval.",
    ask: "What share of real questions requires cross-document synthesis, who validates entities and relationships, and how will graphs and summaries follow source and access changes?",
    tag: "Evidence-grounded answer",
    basis: "Primary GraphRAG paper + RAG architecture survey",
    supports: {
      "graphrag": "Supports entity graphs, communities, and community summaries for corpus-wide synthesis questions.",
      "rag-survey": "Supports selecting advanced or modular RAG by problem rather than treating complexity as a universal upgrade.",
    },
  },
  {
    id: "prove-rag-beyond-demo",
    q: "How do we prove RAG value instead of building an impressive demo?",
    a: "Freeze the same real tasks, authoritative evidence, identities, versions, and load. Accept candidate discovery, final evidence, answer action, risk, service, and cost separately, and define Go, Repair, and Stop conditions before testing.",
    depth: "Measure Candidate Recall@K, recall after filters, final evidence coverage, faithfulness, claim-level citations, no-answer and unauthorized cases, P95, and cost per successful outcome by task and risk slice. General evaluation design belongs to the Evaluation module; security red lines belong to Security; complete ROI belongs to the scenario and FinOps owners. A PoC proves feasibility only for the tested data, versions, identities, and load.",
    ask: "Where will real tasks come from, who adjudicates evidence and outcomes, which failures are automatic no-go conditions, and what production decision should the PoC change?",
    tag: "Local acceptance",
    basis: "Retrieval, answer, and citation evaluation + risk gate + business baseline",
    supports: {
      "dpr-2020": "Supports independent top-K candidate-retrieval measurement.",
      "ragas": "Supports separate automated dimensions for context and answer quality.",
      "alce-2023": "Supports checking claim-level citation correctness and completeness.",
      "nist-genai-profile": "Supports risk-context measurement, management, and continued monitoring.",
    },
  },
  {
    id: "production-quality-regression",
    q: "RAG quality declined after several months. How should we investigate?",
    a: "Compare a frozen set and adjudicated production failures through source acceptance, candidates, filters, reranking, final evidence, and generation. Hand the confirmed change to data, model, security, or AI operations owners; do not begin with an intuitive prompt or model change.",
    depth: "One RAG trace should correlate the current request and identity, query plan, candidates from each route, filter reasons, reranked order, final evidence, source and component versions, answer action, latency, and tokens. Minimize logged text; use stable source IDs, hashes, or controlled snapshots where possible. RAG defines the evidence-chain fields and local quality signals; AI operations owns releases, alerts, capacity, incident recovery, and retention.",
    ask: "When did degradation begin, which users and tasks are affected, and can each failure be reconstructed to candidates, policy decisions, final evidence, and the full component version matrix?",
    tag: "Local acceptance",
    basis: "Continuous RAG evaluation + standard telemetry + AI operations boundary",
    supports: {
      "ragas": "Supports separate measurement of context relevance, answer relevance, and faithfulness.",
      "opentelemetry-genai-semconv": "Supports evolving telemetry conventions for retrieval and generative-AI operations; project-specific quality fields remain necessary.",
      "nist-genai-profile": "Supports continuing post-deployment measurement and management of risk.",
    },
  },
  {
    id: "latency-and-cost",
    q: "How should we control latency and cost?",
    a: "Remove stages that add no evidence or accepted outcome before shrinking a model. Give query planning, candidate discovery, reranking, evidence compilation, and generation separate budgets, and route complexity only to the tasks that prove its value.",
    depth: "Count offline parsing, embeddings, and indexing plus online routing, search, reranking, context, generation, retries, telemetry, peak reserve, and human escalation. Record per-stage P50/P95, calls, tokens, cost, and successful task slices. AI operations owns capacity, release, and incident response; the scenario and FinOps owners connect local cost to adoption, labor, risk, and complete ROI. Compare cost per successful outcome, not token price alone.",
    ask: "Which tasks require what P95, which stages add no incremental evidence, and what are document change, query volume, success, retry, and human-escalation rates?",
    tag: "Local acceptance",
    basis: "Hybrid retrieval and multi-passage research + standard telemetry + unit-economics boundary",
    supports: {
      "contextual-retrieval": "Provides a vendor experiment for hybrid retrieval and reranking under one configuration; it supplies no universal cost threshold.",
      "fid-2021": "Supports multi-passage evidence aggregation in a particular task; it does not define a universal passage count.",
      "opentelemetry-genai-semconv": "Supports recording generative-AI call and usage attributes; business cost fields remain project-defined.",
      "finops-unit-economics": "Supports connecting technology cost to value through unit economics; it does not provide a universal RAG ROI.",
    },
  },
];
const ragQaCanonicalQuestionsById = Object.freeze({
  "long-context-vs-rag": "上下文窗口已经很长，为什么还需要 RAG？",
  "rag-vs-fine-tuning": "RAG 和微调怎么选？",
  "vector-database-required": "做 RAG 一定要向量数据库吗？",
  "managed-vs-composable": "RAG 应该选择托管云服务，还是自己拼搜索、向量库和编排？",
  "agent-mcp-a2a-boundary": "一个企业 RAG 是否还需要 Agent、MCP 或 A2A？",
  "pdf-scans-tables-images": "PDF、扫描件、表格和图片很多，RAG 还能做好吗？",
  "chunk-size-overlap": "Chunk 大小和重叠比例应该设多少？",
  "chunk-metadata-parent-page-version": "为什么 Chunk 还要保存父子关系、页码、版本和元数据？",
  "structured-data-vectorization": "数据库里的指标和交易数据，能不能直接切块后放进向量库？",
  "cross-language-retrieval": "用户用中文提问、证据主要是英文时，跨语言检索应该怎样设计？",
  "source-update-freshness": "源文档更新后，多久能在回答中生效？",
  "department-customer-access-control": "不同部门、不同客户的数据权限如何保证？",
  "malicious-instructions-in-documents": "RAG 系统会不会被文档里的恶意指令攻击？",
  "component-model-stack-selection": "解析、Embedding、Reranker、生成和评估模型，应该怎样组合选型？",
  "hybrid-rrf-reranker": "Hybrid Search、RRF 和 Reranker 各自解决什么问题？",
  "document-exists-no-answer": "为什么系统明明有文档，还是答不到？",
  "agentic-retrieval-query-decomposition": "开启 Agentic Retrieval 或查询分解后，是不是一定更准确？",
  "multi-turn-conversation-retrieval": "多轮会话中的历史问题和答案，应该怎样参与下一轮检索？",
  "evidence-insufficient-answer-action": "证据不足时，系统应该追问、继续检索、限定回答还是拒答？",
  "retrieved-right-document-still-wrong": "RAG 检到了正确文档，为什么仍可能答错？RAG 能消除幻觉吗？",
  "citations-trust-compliance": "答案已经带出处，是否就可以认定可信或合规？",
  "graphrag-everywhere": "GraphRAG 是不是向量 RAG 的升级版，所有知识库都应该上？",
  "prove-rag-beyond-demo": "如何证明 RAG 的效果，而不是做一个漂亮 Demo？",
  "production-quality-regression": "RAG 上线几个月后效果变差，应该怎样排查？",
  "latency-and-cost": "怎样控制延迟和成本？",
});
/**
 * @param {any} copy
 */
const supportTextBySourceId = (copy) => {
  if (!copy.supports || Array.isArray(copy.supports)) {
    throw new Error(`RAG English QA ${copy.id} must key support text by source ID`);
  }
  const supportEntries = indexUnique(
    Object.entries(copy.supports).map(([sourceId, support]) => ({ sourceId, support })),
    "sourceId",
    `RAG English QA ${copy.id} support entries`,
  );
  const supports = new Map();
  for (const [sourceId, entry] of supportEntries) {
    const { support } = entry;
    if (typeof support !== "string" || !support.trim()) {
      throw new Error(`RAG English QA ${copy.id} has no support text for ${sourceId}`);
    }
    supports.set(sourceId, support);
  }
  return supports;
};

const canonicalQaByEnglishId = resolveCompleteProjection({
  canonicalItems: canonicalQa,
  canonicalKey: "q",
  englishItems: qaCopy,
  englishKey: "id",
  canonicalKeyByEnglishKey: ragQaCanonicalQuestionsById,
  label: "RAG QA",
});
const qa = Object.freeze(qaCopy.map((copy) => {
  const canonical = canonicalQaByEnglishId.get(copy.id);
  const canonicalEvidenceBySourceId = indexUnique(canonical.evidence, "sourceId", `RAG QA ${copy.id} evidence`);
  const supportsBySourceId = supportTextBySourceId(copy);
  assertSameIdentities(canonicalEvidenceBySourceId, supportsBySourceId, `RAG QA ${copy.id} evidence sources`);
  return Object.freeze({
    id: copy.id,
    q: copy.q,
    a: copy.a,
    depth: copy.depth,
    ask: copy.ask,
    tag: copy.tag,
    basis: copy.basis,
    evidence: Object.freeze(canonical.evidence.map((/** @type {any} */ item) => Object.freeze({ sourceId: item.sourceId, supports: supportsBySourceId.get(item.sourceId) }))),
    ...(canonical.addedAt ? { addedAt: canonical.addedAt } : {}),
  });
}));

const evidenceCopy = [
  { id: "dpr-top-20-improvement", metric: "+9–19 pp", title: "Top-20 passage retrieval accuracy", finding: "Across the open-domain QA datasets evaluated in the paper, DPR achieved this absolute improvement over its Lucene-BM25 baseline.", boundary: "The datasets and baseline are specific; this is not a promise that dense retrieval will outperform BM25 on a customer corpus." },
  { id: "ragas-three-dimensions", metric: "3", title: "RAGAS automated evaluation dimensions", finding: "Faithfulness, Answer Relevance, and Context Relevance examine evidence use, answer relevance, and retrieved-context relevance separately.", boundary: "Business outcome, performance, security, and cost are additional engineering acceptance areas in this fieldbook, not part of the paper's three dimensions." },
  { id: "contextual-retrieval-failure-rate", metric: "5.7% → 1.9%", title: "Top-20 retrieval failure rate", finding: "In Anthropic's specific experiment, contextual dense retrieval + BM25 + reranking produced this result.", boundary: "This is vendor evidence. Use it to form a hybrid-retrieval A/B hypothesis, not a procurement or outcome commitment." },
  { id: "replug-black-box-route", metric: "Black-box", title: "A modular route with a frozen model", finding: "REPLUG demonstrates a route in which a black-box language model is frozen while a trainable external retriever supplies documents.", boundary: "It supports decoupling retrieval from the model; it does not establish enterprise access, rollback, or observability controls." },
  { id: "long-context-position-sensitivity", metric: "Position-sensitive", title: "Long context is not used uniformly", finding: "In the paper's experiments, relevant information placed in the middle of the context often performed worse than information near the beginning or end.", boundary: "The result comes from particular models and tasks. It supports a position-sensitivity baseline, not a conclusion that RAG always wins." },
  { id: "claim-level-citation-quality", metric: "Claim-level", title: "Citation correctness and completeness are different", finding: "ALCE treats whether a citation supports its claim and whether all material claims receive citations as separate evaluation questions.", boundary: "The method supports decomposing citation quality; its results cannot be reused as a customer-system accuracy rate." },
  { id: "deletion-not-reset", metric: "Delete ≠ reset", title: "Knowledge freshness is end-to-end state", finding: "Azure documentation states that reset/run does not automatically remove orphaned documents and that some ACL changes can bypass ordinary high-water-mark detection.", boundary: "This is a product-specific boundary. It supports deletion and revocation acceptance tests but does not establish the behavior of other services." },
];

const ragEvidenceSourceIdsById = Object.freeze({
  "dpr-top-20-improvement": "dpr-2020",
  "ragas-three-dimensions": "ragas",
  "contextual-retrieval-failure-rate": "contextual-retrieval",
  "replug-black-box-route": "replug-2024",
  "long-context-position-sensitivity": "lost-middle",
  "claim-level-citation-quality": "alce-2023",
  "deletion-not-reset": "azure-search-indexer-lifecycle",
});
const canonicalEvidenceByEnglishId = resolveCompleteProjection({
  canonicalItems: canonicalEvidenceCards,
  canonicalKey: "sourceId",
  englishItems: evidenceCopy,
  englishKey: "id",
  canonicalKeyByEnglishKey: ragEvidenceSourceIdsById,
  label: "RAG evidence cards",
});
const evidenceCards = Object.freeze(evidenceCopy.map((copy) => {
  const canonical = canonicalEvidenceByEnglishId.get(copy.id);
  return Object.freeze({
    ...copy,
    sourceId: canonical.sourceId,
    ...(canonical.accent ? { accent: true } : {}),
  });
}));

const usedSourceIds = new Set([
  ...canonicalQa.flatMap((item) => item.evidence.map((entry) => entry.sourceId)),
  ...canonicalDeepDives.flatMap((item) => item.sourceIds),
  ...canonicalEvidenceCards.map((item) => item.sourceId),
]);
const deepDiveEnglishBlocksByTitle = indexUnique(
  Object.entries(ragDeepDiveEnglishBlockTitlesById).map(([id, title]) => ({ id, title })),
  "title",
  "RAG deep-dive English block titles",
);
const deepDiveSection = sections.find((section) => section.id === "rag-independent-depth");
if (!deepDiveSection) throw new Error("RAG English deep-dive section is missing");
const deepDiveEnglishItems = deepDiveSection.blocks
  .filter((block) => deepDiveEnglishBlocksByTitle.has(block.title))
  .map((block) => ({ id: deepDiveEnglishBlocksByTitle.get(block.title).id }));
resolveCompleteProjection({
  canonicalItems: canonicalDeepDives,
  canonicalKey: "title",
  englishItems: deepDiveEnglishItems,
  englishKey: "id",
  canonicalKeyByEnglishKey: ragDeepDiveCanonicalTitlesById,
  label: "RAG deep dives",
});

const ragOutcomeCanonicalValuesById = Object.freeze({
  "learning-outcome-adoption": "判断一个业务问题是否需要 RAG，并写清有据回答、限定回答与拒答的边界",
  "learning-outcome-evidence-handoff": "交给 RAG 的资料是否能检索、定位、授权、更新和撤回",
  "learning-outcome-component-selection": "用真实问题选择切片、关键词、Embedding、Reranker 与生成模型，而不是按产品类别堆组件",
  "learning-outcome-diagnosis": "沿候选召回、最终上下文和主张引用定位失败，并留下足以复现的 RAG Trace",
  "learning-outcome-release-decision": "用质量、风险、时延和单位达标回答成本决定 PoC 是上线、整改还是停止",
});
const ragRouteCanonicalTitlesById = Object.freeze({
  "learning-route-adoption": "明确采用边界",
  "learning-route-offline-handoff": "建立离线证据交接",
  "learning-route-retrieval-baseline": "建立检索与模型基线",
  "learning-route-answer-policy": "设计在线回答决策",
  "learning-route-local-acceptance": "完成 RAG 局部验收",
  "learning-route-production-handoff": "形成生产交接决定",
});
const learningSection = sections.find((section) => section.id === "rag-evidence-practice");
if (!learningSection) throw new Error("RAG English learning section is missing");
const learningBlocksByTitle = indexUnique(learningSection.blocks, "title", "RAG English learning blocks");
const learningOutcomes = learningBlocksByTitle.get("Learning outcomes");
const learningRoute = learningBlocksByTitle.get("Recommended learning route");
const learningLabs = learningBlocksByTitle.get("Practice labs");
if (!learningOutcomes || !learningRoute || !learningLabs) {
  throw new Error("RAG English learning blocks are incomplete");
}
resolveCompleteProjection({
  canonicalItems: canonicalLearningContent.outcomes,
  canonicalKey: (outcome) => outcome,
  englishItems: learningOutcomes.items,
  englishKey: "id",
  canonicalKeyByEnglishKey: ragOutcomeCanonicalValuesById,
  label: "RAG learning outcomes",
});
resolveCompleteProjection({
  canonicalItems: canonicalLearningContent.route,
  canonicalKey: "title",
  englishItems: learningRoute.items,
  englishKey: "id",
  canonicalKeyByEnglishKey: ragRouteCanonicalTitlesById,
  label: "RAG learning route",
});
resolveCompleteProjection({
  canonicalItems: canonicalLearningContent.labs,
  canonicalKey: "title",
  englishItems: learningLabs.items,
  englishKey: "id",
  canonicalKeyByEnglishKey: ragLabCanonicalTitlesById,
  label: "RAG learning labs",
});
assertSameIdentities(
  new Map([...usedSourceIds].map((sourceId) => [sourceId, true])),
  new Map(expectedSourceIds.map((sourceId) => [sourceId, true])),
  "RAG English source notes",
);

export const englishModule = Object.freeze({
  slug: "rag",
  title: "Retrieval-Augmented Generation",
  subtitle: "RAG",
  definition: "RAG turns external material into authorized, verifiable, and revocable evidence for the current user, then uses that evidence to answer, qualify, or abstain. Vector retrieval is one candidate-discovery mechanism—not the architecture, the truth source, or an access-control boundary.",
  position: "Treat RAG as an application evidence system. The application owns authority, identity, lifecycle, evaluation, production control, and economics; Agent, MCP, and A2A are optional additions for distinct orchestration or interoperability needs, not default parts of read-only RAG.",
  relatedSlugs: Object.freeze(["llm", "data-engineering", "prompt-engineering", "evaluation", "ai-agent", "ai-infra-platform"]),
  sections: Object.freeze(sections),
  qa,
  evidenceCards,
  terms,
  sources,
});

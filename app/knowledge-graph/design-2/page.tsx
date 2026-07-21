import { permanentRedirect } from "next/navigation";

export default function LegacyKnowledgeGraphPage() {
  permanentRedirect("/knowledge-graph/explore");
}

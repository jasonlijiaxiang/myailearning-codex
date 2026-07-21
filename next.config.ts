import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    const legacyGraphPaths = ["/knowledge-graph/explore", "/knowledge-graph/design-2"];
    return legacyGraphPaths.flatMap((source) => [
      {
        source,
        has: [{ type: "query" as const, key: "node", value: "(?<focus>.+)" }],
        destination: "/knowledge-graph?node=:focus",
        permanent: true,
      },
      { source, destination: "/knowledge-graph", permanent: true },
    ]);
  },
};

export default nextConfig;

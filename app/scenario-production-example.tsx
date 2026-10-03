import { scenarioContent } from "./scenario-content.mjs";

type TeachingShot = { id: string; seconds: number; framing: string; beat: string; dependencies: string[]; before: string; after: string; screen: string; audio: string };
type ProductionExample = { title: string; intro: string; data: unknown; shots?: TeachingShot[] };

export function hasScenarioProductionExample(slug: string): boolean {
  return Boolean((scenarioContent[slug] as { productionExample?: ProductionExample } | undefined)?.productionExample);
}

export function ScenarioProductionExample({ slug }: { slug: string }) {
  const example = (scenarioContent[slug] as { productionExample?: ProductionExample }).productionExample;
  if (!example) return null;
  return <section id="scenario-production-example" className="subsection scenarioProductionExample" aria-labelledby="scenario-production-example-title">
    <div className="subHead"><span>制作实例</span><div><h2 id="scenario-production-example-title">{example.title}</h2></div></div>
    <p className="sectionLead">{example.intro}</p>
    {example.shots ? <ol className="scenarioShotList">{example.shots.map((shot) => <li key={shot.id}>
      <h3>{shot.id} · {shot.framing} · {shot.seconds} 秒</h3><p>{shot.beat}</p>
      <dl><div><dt>进入镜头时</dt><dd>{shot.before}</dd></div><div><dt>结束镜头时</dt><dd>{shot.after}</dd></div><div><dt>空间与视线</dt><dd>{shot.screen}</dd></div><div><dt>声音</dt><dd>{shot.audio}</dd></div><div><dt>引用资产</dt><dd>{shot.dependencies.join("、")}</dd></div></dl>
    </li>)}</ol> : null}
    <details className="scenarioProductionData"><summary>查看示例制作数据（JSON）</summary><p>这是应用自行设计的教学数据，未生成媒体，也不代表真实授权或验收；字段并非厂商 API 请求或 OTIO 序列化格式。</p><pre tabIndex={0} aria-label="教学制作数据，可滚动阅读"><code>{JSON.stringify(example.data, null, 2)}</code></pre></details>
  </section>;
}

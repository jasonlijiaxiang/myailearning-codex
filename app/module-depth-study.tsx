import { WorkedExample, type WorkedExampleContent } from "./worked-example";

export type DepthStudyContent = {
  title: string;
  thesis: string;
  mechanism: string;
  failure: string;
  control: string;
  decision: string;
  example: WorkedExampleContent;
  sourceLinks: readonly { id: string; label: string }[];
};

export function ModuleDepthStudy({ study }: { study: DepthStudyContent }) {
  return (
    <section id="depth-study" className="subsection moduleDepthStudy" data-quality-section="depth-study" aria-labelledby="depth-study-title">
      <div className="subHead"><span>推演</span><div><h2 id="depth-study-title">{study.title}</h2></div></div>
      <p className="sectionLead">{study.thesis}</p>
      <p>{study.mechanism}</p>
      <dl><div><dt>失败如何发生</dt><dd>{study.failure}</dd></div><div><dt>控制与验证</dt><dd>{study.control}</dd></div><div><dt>怎样改变方案判断</dt><dd>{study.decision}</dd></div></dl>
      <WorkedExample example={study.example} />
      <nav aria-label="本节机制与计算依据" className="depthStudySources">{study.sourceLinks.map((source) => <a key={source.id} href={`/references#source-${source.id}`}>{source.label} →</a>)}</nav>
    </section>
  );
}

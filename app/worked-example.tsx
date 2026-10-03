import { MechanismCalculator } from "./mechanism-calculators";

export type WorkedExampleContent = {
  premise: string;
  steps: readonly string[];
  result: string;
  boundary: string;
  calculator?: "attention" | "zero-failure" | "serial-bottleneck";
};

export function WorkedExample({ example }: { example?: WorkedExampleContent }) {
  if (!example) return null;
  return (
    <details className="learningWorkedExample">
      <summary>查看参考推演</summary>
      <div>
        <p><strong>教学情境：</strong>{example.premise}</p>
        <ol>{example.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <p><strong>判断：</strong>{example.result}</p>
        <p className="learningExampleBoundary"><strong>适用限制：</strong>{example.boundary}</p>
        {example.calculator ? <MechanismCalculator kind={example.calculator} /> : null}
      </div>
    </details>
  );
}

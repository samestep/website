import { ComponentChildren } from "preact";
import { Content } from "../../../blog";

const weightsToProbs = (weights: number[]): Map<string, number> => {
  const total = weights.reduce((a, b) => a + b, 0);
  return new Map(
    weights
      .map((w, i): [string, number] => [`${i}`, w / total])
      .filter(() => true), // get rid of holes in the array
  );
};

const width = 300;

const Svg = (props: { height: number; children: ComponentChildren }) => (
  <div class="svg">
    <svg viewBox={`0 0 ${width} ${props.height}`} height={props.height}>
      {props.children}
    </svg>
  </div>
);

const Histogram = (props: { probs: Map<string, number>; pmax: number }) => {
  const { probs, pmax } = props;

  const height = 200;
  const top = 10;
  const bottom = height - 20;
  const left = 45;
  const right = width;

  const ylabels = [pmax, 0].map((p) => (
    <text
      x={left - 5}
      y={(p / pmax) * top + (1 - p / pmax) * bottom}
      fill="white"
      text-anchor="end"
      dominant-baseline="central"
    >
      {p * 100}%
    </text>
  ));

  const w = (right - left) / probs.size;

  const xlabels = [];
  const bars = [];
  let i = 0;
  for (const [label, p] of probs.entries()) {
    const x = left + i * w;
    xlabels.push(
      <text
        x={x + w / 2}
        y={bottom + 5}
        fill="white"
        text-anchor="middle"
        dominant-baseline="hanging"
      >
        {label}
      </text>,
    );
    const margin = 5;
    bars.push(
      <rect
        x={x + margin}
        y={(p / pmax) * top + (1 - p / pmax) * bottom}
        width={w - 2 * margin}
        height={(p / pmax) * (bottom - top)}
        fill="hsl(222 100% 75%)"
      />,
    );
    ++i;
  }

  return (
    <Svg height={height}>
      {bars}
      {ylabels}
      {xlabels}
      <polyline
        points={`${left},${top} ${left},${bottom} ${right},${bottom}`}
        fill="none"
        stroke="white"
        stroke-width="2"
      />
    </Svg>
  );
};

const Bitsogram = ({ n }: { n: number }) => {
  const k = n.toString(2).length;
  const p = n / 2 ** k;
  const probs = new Map<string, number>();
  for (let i = 1; i < 10; ++i) {
    probs.set(`${i}`, 0);
  }
  let q = 1;
  for (let i = 1; i * k < 10; ++i) {
    probs.set(`${i * k}`, q * p);
    q *= 1 - p;
  }
  return <Histogram probs={probs} pmax={1} />;
};

const ExpectedBits = () => {
  const height = 200;
  const top = 10;
  const bottom = height - 20;
  const left = 25;
  const right = width - 15;

  const xmax = 100;
  const ymax = 15;

  const ylabels = [ymax, 0].map((y) => (
    <text
      x={left - 5}
      y={(y / ymax) * top + (1 - y / ymax) * bottom}
      fill="white"
      text-anchor="end"
      dominant-baseline="central"
    >
      {y}
    </text>
  ));

  const xlabels = [];
  const xgap = 20;
  for (let i = 1; i * xgap <= xmax; ++i) {
    const x = i * xgap;
    xlabels.push(
      <text
        x={left + (x / xmax) * (right - left)}
        y={bottom + 5}
        fill="white"
        text-anchor="middle"
        dominant-baseline="hanging"
      >
        {x}
      </text>,
    );
  }

  const limit: [number, number][] = [];
  const python: [number, number][] = [];
  for (let n = 1; n <= xmax; ++n) {
    limit.push([n, Math.log2(n)]);
    const k = n.toString(2).length;
    const p = n / 2 ** k;
    python.push([n, k / p]);
  }

  const points = (coords: [number, number][]) =>
    coords
      .map(([n, p]) => {
        const x = left + (n / xmax) * (right - left);
        const y = bottom - (p / ymax) * (bottom - top);
        return `${x},${y}`;
      })
      .join(" ");

  return (
    <Svg height={height}>
      <polyline
        points={points(limit)}
        fill="none"
        stroke="hsl(222 100% 75%)"
        stroke-width="2"
      />
      <polyline
        points={points(python)}
        fill="none"
        stroke="hsl(0 100% 75%)"
        stroke-width="2"
      />
      {ylabels}
      {xlabels}
      <polyline
        points={`${left},${top} ${left},${bottom} ${right},${bottom}`}
        fill="none"
        stroke="white"
        stroke-width="2"
      />
    </Svg>
  );
};

export const content: Content = async () => {
  const pmax = 0.3;
  return {
    histogramNaive: (
      <Histogram probs={weightsToProbs([, 2, 2, 1, 1, 1, 1])} pmax={pmax} />
    ),
    histogramEight: (
      <Histogram probs={weightsToProbs([1, 1, 1, 1, 1, 1, 1, 1])} pmax={pmax} />
    ),
    histogramDie: (
      <Histogram probs={weightsToProbs([, 1, 1, 1, 1, 1, 1])} pmax={pmax} />
    ),
    histogramBits: <Bitsogram n={6} />,
    expectedBits: <ExpectedBits />,
  };
};

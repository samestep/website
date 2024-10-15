import { ComponentChildren } from "preact";
import { Content } from "../../../blog";

const sparseRange = (array: any[]): { start: number; end: number } => {
  let first = false;
  let start: number;
  let last: number;
  array.forEach((_, i) => {
    if (!first) {
      start = i;
      first = true;
    }
    last = i;
  });
  return { start, end: last + 1 };
};

const weightsToProbs = (weights: number[]) => {
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map((w) => w / total);
};

const width = 350;

const Svg = (props: { height: number; children: ComponentChildren }) => (
  <div class="svg">
    <svg viewBox={`0 0 ${width} ${props.height}`} height={props.height}>
      {props.children}
    </svg>
  </div>
);

const Histogram = (props: { probs: number[]; pmax: number }) => {
  const { probs, pmax } = props;

  const height = 200;
  const top = 10;
  const bottom = height - 20;
  const left = 45;
  const right = width;

  const ylabels = [0, pmax].map((p) => (
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

  const { start, end } = sparseRange(probs);
  const w = (right - left) / (end - start);

  const xlabels = [];
  const bars = [];
  probs.forEach((p, i) => {
    const x = left + (i - start) * w;
    xlabels.push(
      <text
        x={x + w / 2}
        y={bottom + 5}
        fill="white"
        text-anchor="middle"
        dominant-baseline="hanging"
      >
        {i}
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
  });

  return (
    <Svg height={height}>
      {bars}
      {xlabels}
      {ylabels}
      <polyline
        points={`${left},${top} ${left},${bottom} ${width},${bottom}`}
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
  };
};

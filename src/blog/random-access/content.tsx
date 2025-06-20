import { Content, splitlines, Svg, width } from "../../../blog";
import desktop from "./desktop.jsonl" with { type: "text" };
import macbook from "./macbook.jsonl" with { type: "text" };

interface Measurement {
  floats: "float32" | "float64";
  indices: "unshuffled32" | "shuffled32" | "unshuffled64" | "shuffled64";
  exponent: number;
  iteration: number;
  seconds: number;
}

interface Plot {
  color: string;
  f: (n: number) => number | undefined;
}

interface Group {
  float: 32 | 64;
  index: 32 | 64;
  shuffle: boolean;
  points: Map<number, number[]>;
}

const process = (
  jsonl: string,
): { float: 32 | 64; index: 32 | 64; plots: Plot[] }[] => {
  const groups: Group[] = [
    { float: 32, index: 32, shuffle: false, points: new Map() },
    { float: 32, index: 32, shuffle: true, points: new Map() },
    { float: 32, index: 64, shuffle: false, points: new Map() },
    { float: 32, index: 64, shuffle: true, points: new Map() },
    { float: 64, index: 32, shuffle: false, points: new Map() },
    { float: 64, index: 32, shuffle: true, points: new Map() },
    { float: 64, index: 64, shuffle: false, points: new Map() },
    { float: 64, index: 64, shuffle: true, points: new Map() },
  ];
  const exponents = new Set();
  for (const line of splitlines(jsonl)) {
    const { floats, indices, exponent, iteration, seconds }: Measurement =
      JSON.parse(line);
    if (iteration < 5) continue;
    exponents.add(exponent);
    const { points } = groups.find(
      ({ float, index, shuffle }) =>
        floats === `float${float}` &&
        indices === `${shuffle ? "shuffled" : "unshuffled"}${index}`,
    )!;
    let array = points.get(exponent);
    if (!array) {
      array = [];
      points.set(exponent, array);
    }
    array.push(seconds);
  }
  const regrouped: { float: 32 | 64; index: 32 | 64; pair: Group[] }[] = [
    { float: 32, index: 32, pair: [groups[1], groups[0]] },
    { float: 32, index: 64, pair: [groups[3], groups[2]] },
    { float: 64, index: 32, pair: [groups[5], groups[4]] },
    { float: 64, index: 64, pair: [groups[7], groups[6]] },
  ];
  return regrouped.map(({ float, index, pair }) => ({
    float,
    index,
    plots: pair.map(({ shuffle, points }) => ({
      color: shuffle ? "hsl(0 100% 75%)" : "hsl(222 100% 75%)",
      f: (exponent) => {
        const n = 1 << exponent;
        const array = points.get(exponent);
        if (!array) return undefined;
        let total = 0;
        for (const timing of array) total += timing;
        const mean = total / array.length;
        return (mean / n) * 1000000000;
      },
    })),
  }));
};

const MeanTimePerElement = ({ plots }: { plots: Plot[] }) => {
  const height = 250;
  const top = 10;
  const bottom = height - 40;
  const left = 60;
  const right = width - 15;

  const xmax = 30;
  const ymax = 6;

  const ylabel = (
    <text
      x="0"
      y={bottom / 2}
      fill="white"
      text-anchor="middle"
      dominant-baseline="hanging"
      transform={`rotate(-90 0 ${bottom / 2})`}
    >
      time per element
    </text>
  );

  const yticks = [];
  const ygap = 1;
  for (let i = ymax; i >= 0; --i) {
    const y = i * ygap;
    yticks.push(
      <text
        x={left - 5}
        y={(y / ymax) * top + (1 - y / ymax) * bottom}
        fill="white"
        text-anchor="end"
        dominant-baseline="central"
      >
        {y}ns
      </text>,
    );
  }

  const xticks = [];
  const xgap = 4;
  for (let i = 1; i * xgap <= xmax; ++i) {
    const x = i * xgap;
    xticks.push(
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

  const xlabel = (
    <text
      x={(left + right) / 2}
      y={height - 5}
      fill="white"
      text-anchor="middle"
      dominant-baseline="text-bottom"
    >
      logarithm of array length
    </text>
  );

  return (
    <Svg height={height}>
      {plots.map(({ color, f }) => {
        const points: string[] = [];
        for (let n = 0; n <= xmax; ++n) {
          const p = f(n);
          if (p === undefined) break;
          const x = left + (n / xmax) * (right - left);
          const y = bottom - (p / ymax) * (bottom - top);
          points.push(`${x},${y}`);
        }
        return (
          <polyline
            points={points.join(" ")}
            fill="none"
            stroke={color}
            stroke-width="2"
            stroke-linejoin="round"
          />
        );
      })}
      {ylabel}
      {yticks}
      {xticks}
      {xlabel}
      <polyline
        points={`${left},${top} ${left},${bottom} ${right},${bottom}`}
        fill="none"
        stroke="white"
        stroke-width="2"
      />
    </Svg>
  );
};

const FourCharts = ({ name, jsonl }: { name: string; jsonl: string }) => {
  const floats = `floats-${name}`;
  const indices = `indices-${name}`;
  const f32 = `f32-${name}`;
  const f64 = `f64-${name}`;
  const u32 = `u32-${name}`;
  const u64 = `u64-${name}`;
  return (
    <div>
      <div class="selection">
        {process(jsonl).map(({ float, index }) => (
          <div class={`f${float}-u${index}-${name}`}>
            <p>
              Here are the results with{" "}
              <strong>
                {{ 32: "single", 64: "double" }[float]}
                -precision floating-point
              </strong>{" "}
              and <strong>{index}-bit integer indices</strong> (use the toggles
              to select other configurations):
            </p>
          </div>
        ))}
      </div>
      <input type="radio" id={f32} name={floats} checked />
      <label for={f32}>f32</label>
      <input type="radio" id={f64} name={floats} />
      <label for={f64}>f64</label>
      <input type="radio" id={u32} name={indices} checked />
      <label for={u32}>u32</label>
      <input type="radio" id={u64} name={indices} />
      <label for={u64}>u64</label>
      <div class="selection">
        {process(jsonl).map(({ float, index, plots }) => (
          <div class={`f${float}-u${index}-${name}`}>
            <MeanTimePerElement plots={plots} />
          </div>
        ))}
      </div>
    </div>
  );
};

export const content: Content = async () => {
  return {
    macbook: <FourCharts name="macbook" jsonl={macbook} />,
    desktop: <FourCharts name="desktop" jsonl={desktop} />,
  };
};

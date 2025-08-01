import { Content, Svg, width } from "../../../blog";
import {
  AxesLabeled,
  linePlot,
  logScale,
  Plot,
  scales,
  ScalesChild,
  tick,
  xticks,
  yticks,
} from "../../../plot";
import { range, splitlines } from "../../../util";
import desktopBuffer from "./desktop-buffer.jsonl" with { type: "text" };
import desktopMmap from "./desktop-mmap.jsonl" with { type: "text" };
import desktop from "./desktop.jsonl" with { type: "text" };
import macbookBuffer from "./macbook-buffer.jsonl" with { type: "text" };
import macbookMmap from "./macbook-mmap.jsonl" with { type: "text" };
import macbook from "./macbook.jsonl" with { type: "text" };

const colorGrid = "#444";
const colorUnshuffled = "hsl(222 100% 75%)";
const colorShuffled = "hsl(42 100% 75%)";

const Caches = () => {
  const height = 400;
  const cores = 6;
  const gap = 4;
  const stroke = "#666";
  const w = width / cores;
  const l2 = 24;
  const scale = l2 / 512;
  const y0 = 20;
  const l3 = (32 * 1024 * scale) / 6;
  const ram = height - (y0 + l2 + l3);
  const y0ram = y0 + l2 + l3 + gap;
  const y1ram = y0 + l2 + l3 + ram - gap;
  const x0 = gap;
  const x1 = width - gap;
  return (
    <Svg height={height}>
      <defs>
        <linearGradient id="ramFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="hsl(0 50% 50%)" />
          <stop offset="100%" stop-color="hsl(0 50% 50% / 0%)" />
        </linearGradient>
        <linearGradient id="ramStroke" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color={stroke} />
          <stop offset="100%" stop-color={`${stroke}0`} />
        </linearGradient>
      </defs>
      {range(0, cores).map((i) => {
        const x = i * w;
        const y = y0;
        return (
          <>
            <text
              x={x + w / 2}
              y={y - 2 * gap}
              fill="white"
              text-anchor="middle"
              dominant-baseline="text-bottom"
            >
              L1
            </text>
            <line
              x1={x + gap}
              y1={y - gap}
              x2={x + w - gap}
              y2={y - gap}
              stroke={stroke}
              stroke-width={scale * 64}
            />
          </>
        );
      })}
      {range(0, cores).map((i) => {
        const h = l2;
        const x = i * w;
        const y = y0;
        return (
          <>
            <rect
              x={x + gap}
              y={y + gap}
              width={w - 2 * gap}
              height={h - 2 * gap}
              fill="hsl(111 50% 50%)"
              stroke={stroke}
              stroke-width="2"
            />
            <text
              x={x + w / 2}
              y={y + h / 2}
              fill="white"
              text-anchor="middle"
              dominant-baseline="central"
            >
              L2
            </text>
          </>
        );
      })}
      <rect
        x={gap}
        y={y0 + l2 + gap}
        width={width - 2 * gap}
        height={l3 - 2 * gap}
        fill="hsl(222 50% 50%)"
        stroke={stroke}
        stroke-width="2"
      />
      <text
        x={width / 2}
        y={y0 + l2 + l3 / 2}
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
      >
        L3
      </text>
      <polyline
        points={`${x1},${y1ram} ${x1},${y0ram} ${x0},${y0ram} ${x0},${y1ram}`}
        fill="url(#ramFill)"
        stroke="url(#ramStroke)"
        stroke-width="2"
      />
      <text
        x={width / 2}
        y={y0 + l2 + l3 + ram / 2}
        fill="white"
        text-anchor="middle"
        dominant-baseline="central"
      >
        RAM
      </text>
    </Svg>
  );
};

export const Arrays = () => {
  const height = 150;
  const elements = 6;
  const indices = [4, 0, 3, 5, 1, 2];
  const floats = ["α", "β", "γ", "δ", "ε", "ζ"];
  const gap = 5;
  const w = width / elements;
  return (
    <Svg height={height}>
      {range(0, elements).map((i) => {
        const x = i * w;
        const y = 0;
        const x0 = indices[i] * w;
        const y0 = height - w;
        const x1 = x + w / 2;
        const y1 = y + w;
        const x2 = x0 + w / 2;
        const y2 = y0;
        const y3 = (y1 + y2) / 2;
        return (
          <>
            <rect
              x={x + gap}
              y={y + gap}
              width={w - 2 * gap}
              height={w - 2 * gap}
              fill="none"
              stroke="white"
              stroke-width="2"
            />
            <text
              x={x + w / 2}
              y={y + w / 2}
              fill="white"
              text-anchor="middle"
              dominant-baseline="central"
            >
              {indices[i]}
            </text>
            <path
              d={`M ${x1} ${y1} C ${x1} ${y3}, ${x2} ${y3}, ${x2} ${y2}`}
              fill="none"
              stroke="white"
              stroke-width="2"
            />
          </>
        );
      })}
      {range(0, elements).map((i) => {
        const x = i * w;
        const y = height - w;
        return (
          <>
            <rect
              x={x + gap}
              y={y + gap}
              width={w - 2 * gap}
              height={w - 2 * gap}
              fill="none"
              stroke="white"
              stroke-width="2"
            />
            <text
              x={x + w / 2}
              y={y + w / 2}
              fill="white"
              text-anchor="middle"
              dominant-baseline="central"
            >
              {floats[i]}
            </text>
          </>
        );
      })}
    </Svg>
  );
};

const grid =
  (ticks: { x: number[]; y: number[] }): ScalesChild =>
  ({ w, h, t, l, x, y }) => (
    <>
      {ticks.x.map((value) => {
        const x0 = l + w * x(value);
        return <line x1={x0} y1={t} x2={x0} y2={t + h} stroke={colorGrid} />;
      })}
      {ticks.y.map((value) => {
        const y0 = t + h - h * y(value);
        return <line x1={l} y1={y0} x2={l + w} y2={y0} stroke={colorGrid} />;
      })}
    </>
  );

interface Measurement {
  floats: "float32" | "float64";
  indices: "unshuffled32" | "shuffled32" | "unshuffled64" | "shuffled64";
  exponent: number;
  iteration: number;
  seconds: number;
}

interface Group {
  float: 32 | 64;
  index: 32 | 64;
  shuffle: boolean;
  points: Map<number, number[]>;
}

interface Processed {
  float: 32 | 64;
  index: 32 | 64;
  plots: Plot[];
}

const process = (jsonl: string): Processed[] => {
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
  for (const line of splitlines(jsonl)) {
    const { floats, indices, exponent, iteration, seconds }: Measurement =
      JSON.parse(line);
    if (iteration < 2) continue;
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
      color: shuffle ? colorShuffled : colorUnshuffled,
      points: [...points].map(([exponent, array]) => {
        const n = 2 ** exponent;
        let total = 0;
        for (const timing of array) total += timing;
        const mean = total / array.length;
        return { x: n, y: (mean / n) * 1000000000 };
      }),
    })),
  }));
};

const Chart = ({ plots }: { plots: Plot[] }) => {
  const xtickVals = range(1, 33).map((i) => 2 ** i);
  const ytickVals = range(0, 8).map((i) => 2 ** i);
  return (
    <AxesLabeled
      height={250}
      top={10}
      left={40}
      right={5}
      bottom={20}
      xlabel="number of elements"
      ylabel="time per element"
      content={[
        scales({
          x: logScale(1, 2 ** 33),
          y: logScale(0.5, 2 ** 7.5),
          content: [
            yticks(ytickVals.map((ns) => tick(ns, `${ns}ns`))),
            grid({ x: xtickVals, y: ytickVals }),
            ...plots.map(linePlot),
            xticks([
              tick(10 ** 3, "1K"),
              tick(10 ** 6, "1M"),
              tick(10 ** 9, "1B"),
            ]),
          ],
        }),
      ]}
    />
  );
};

const FourCharts = ({
  name,
  jsonl,
  verbose,
}: {
  name: string;
  jsonl: string;
  verbose?: boolean;
}) => {
  const floats = `floats-${name}`;
  const indices = `indices-${name}`;
  const f32 = `f32-${name}`;
  const f64 = `f64-${name}`;
  const u32 = `u32-${name}`;
  const u64 = `u64-${name}`;
  const processed = process(jsonl);
  return (
    <>
      <div class="selection">
        {processed.map(({ float, index }) => (
          <div class={`f${float}-u${index}-${name}`}>
            {verbose ? (
              <p>
                Here are the{" "}
                <span style={{ color: colorUnshuffled }}>unshuffled</span> and{" "}
                <span style={{ color: colorShuffled }}>shuffled</span> results
                with{" "}
                <strong>
                  {{ 32: "single", 64: "double" }[float]}
                  -precision floating-point
                </strong>{" "}
                and <strong>{index}-bit integer indices</strong> (use the
                toggles to select other configurations):
              </p>
            ) : (
              <p>
                Here are the results with{" "}
                <strong>
                  {{ 32: "single", 64: "double" }[float]}
                  -precision floating-point
                </strong>{" "}
                and <strong>{index}-bit integer indices</strong>:
              </p>
            )}
          </div>
        ))}
      </div>
      <div class="selectors">
        <div class="selector">
          <input type="radio" id={f32} name={floats} checked />
          <label for={f32}>f32</label>
          <input type="radio" id={f64} name={floats} />
          <label for={f64}>f64</label>
        </div>
        <div class="selector">
          <input type="radio" id={u32} name={indices} />
          <label for={u32}>u32</label>
          <input type="radio" id={u64} name={indices} checked />
          <label for={u64}>u64</label>
        </div>
      </div>
      <div class="selection">
        {processed.map(({ float, index, plots }) => (
          <div class={`f${float}-u${index}-${name}`}>
            <Chart plots={plots} />
          </div>
        ))}
      </div>
    </>
  );
};

const TwoCharts = ({ name, jsonl }: { name: string; jsonl: string }) => {
  const floats = `floats-${name}`;
  const f32 = `f32-${name}`;
  const f64 = `f64-${name}`;
  const processed = process(jsonl);
  return (
    <>
      <div class="selection">
        {processed.map(({ float, index }) =>
          index === 32 ? (
            <></>
          ) : (
            <div class={`f${float}-${name}`}>
              <p>
                Here are the{" "}
                <strong>
                  {{ 32: "single", 64: "double" }[float]}
                  -precision
                </strong>{" "}
                results.
              </p>
            </div>
          ),
        )}
      </div>
      <div class="selectors">
        <div class="selector">
          <input type="radio" id={f32} name={floats} checked />
          <label for={f32}>f32</label>
          <input type="radio" id={f64} name={floats} />
          <label for={f64}>f64</label>
        </div>
      </div>
      <div class="selection">
        {processed.map(({ float, index, plots }) =>
          index === 32 ? (
            <></>
          ) : (
            <div class={`f${float}-${name}`}>
              <Chart plots={plots} />
            </div>
          ),
        )}
      </div>
    </>
  );
};

export const content: Content = async () => {
  return {
    caches: <Caches />,
    arrays: <Arrays />,
    macbook: <FourCharts name="macbook" jsonl={macbook} verbose={true} />,
    desktop: <FourCharts name="desktop" jsonl={desktop} />,
    macbookMmap: <FourCharts name="macbook-mmap" jsonl={macbookMmap} />,
    desktopMmap: <FourCharts name="desktop-mmap" jsonl={desktopMmap} />,
    macbookBuffer: <TwoCharts name="macbook-buffer" jsonl={macbookBuffer} />,
    desktopBuffer: <TwoCharts name="desktop-buffer" jsonl={desktopBuffer} />,
  };
};

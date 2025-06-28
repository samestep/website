import { Content } from "../../../blog";
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
import desktop from "./desktop.jsonl" with { type: "text" };
import macbook from "./macbook.jsonl" with { type: "text" };

const colorGrid = "#444";
const colorUnshuffled = "hsl(222 100% 75%)";
const colorShuffled = "hsl(42 100% 75%)";

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

interface ChartMeta {
  bits: 32 | 64;
}

interface GroupMeta extends ChartMeta {
  order: "unshuffled" | "shuffled";
}

interface Measurement extends GroupMeta {
  exponent: number;
  iteration: number;
  seconds: number;
}

interface Group extends GroupMeta {
  points: Map<number, number[]>;
}

interface Processed extends ChartMeta {
  plots: Plot[];
}

const process = (jsonl: string): Processed[] => {
  const groups: Group[] = [
    { bits: 32, order: "unshuffled", points: new Map() },
    { bits: 32, order: "shuffled", points: new Map() },
    { bits: 64, order: "unshuffled", points: new Map() },
    { bits: 64, order: "shuffled", points: new Map() },
  ];
  for (const line of splitlines(jsonl)) {
    const { bits, order, exponent, seconds }: Measurement = JSON.parse(line);
    const { points } = groups.find(
      (group) => group.bits === bits && group.order === order,
    )!;
    let array = points.get(exponent);
    if (!array) {
      array = [];
      points.set(exponent, array);
    }
    array.push(seconds);
  }
  const regrouped: { bits: 32 | 64; pair: Group[] }[] = [
    { bits: 32, pair: [groups[1], groups[0]] },
    { bits: 64, pair: [groups[3], groups[2]] },
  ];
  return regrouped.map(({ bits, pair }) => ({
    bits,
    plots: pair.map(({ order, points }) => ({
      color: { unshuffled: colorUnshuffled, shuffled: colorShuffled }[order],
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
  const xtickVals = range(1, 31).map((i) => 2 ** i);
  const ytickVals = range(0, 8).map((i) => 2 ** i);
  return (
    <AxesLabeled
      height={250}
      top={10}
      left={35}
      right={0}
      bottom={20}
      xlabel="number of elements"
      ylabel="time per element"
      content={[
        scales({
          x: logScale(1, 2 ** 31),
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

const TwoCharts = ({ name, jsonl }: { name: string; jsonl: string }) => {
  const button = `${name}-bits`;
  const bits32 = `${name}-32bit`;
  const bits64 = `${name}-64bit`;
  const processed = process(jsonl);
  return (
    <>
      <div class="selection">
        {processed.map(({ bits }) => (
          <div class={`${name}-${bits}bit`}>
            <p>
              Here are the <strong>{bits}-bit</strong> results.
            </p>
          </div>
        ))}
      </div>
      <div class="selectors">
        <div class="selector">
          <input type="radio" id={bits32} name={button} checked />
          <label for={bits32}>32-bit</label>
          <input type="radio" id={bits64} name={button} />
          <label for={bits64}>64-bit</label>
        </div>
      </div>
      <div class="selection">
        {processed.map(({ bits, plots }) => (
          <div class={`${name}-${bits}bit`}>
            <Chart plots={plots} />
          </div>
        ))}
      </div>
    </>
  );
};

export const content: Content = async () => {
  return {
    macbook: <TwoCharts name="macbook" jsonl={macbook} />,
    desktop: <TwoCharts name="desktop" jsonl={desktop} />,
  };
};

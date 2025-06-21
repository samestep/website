import { Content } from "../../../blog";
import {
  AxesLabeled,
  linePlot,
  logScale,
  Plot,
  scales,
  tick,
  xticks,
  yticks,
} from "../../../plot";
import { range, splitlines } from "../../../util";
import desktop from "./desktop.jsonl" with { type: "text" };
import macbook from "./macbook.jsonl" with { type: "text" };

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
  for (const line of splitlines(jsonl)) {
    const { floats, indices, exponent, iteration, seconds }: Measurement =
      JSON.parse(line);
    if (iteration < 5) continue;
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
      points: [...points].map(([exponent, array]) => {
        const n = 1 << exponent;
        let total = 0;
        for (const timing of array) total += timing;
        const mean = total / array.length;
        return { x: 2 ** exponent, y: (mean / n) * 1000000000 };
      }),
    })),
  }));
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
            <AxesLabeled
              height={250}
              top={10}
              left={35}
              right={5}
              bottom={20}
              xlabel="number of elements"
              ylabel="time per element"
              content={[
                scales({
                  x: logScale(1, 2 ** 31),
                  y: logScale(0.5, 50),
                  content: [
                    yticks({
                      minor: [1, 2, 4, 8, 16, 32],
                      major: [1, 2, 4, 8, 16, 32].map((ns) =>
                        tick(ns, `${ns}ns`),
                      ),
                    }),
                    ...plots.map(linePlot),
                    xticks({
                      minor: range(1, 31).map((i) => 2 ** i),
                      major: [
                        { value: 10 ** 3, text: "1K" },
                        { value: 10 ** 6, text: "1M" },
                        { value: 10 ** 9, text: "1B" },
                      ],
                    }),
                  ],
                }),
              ]}
            />
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

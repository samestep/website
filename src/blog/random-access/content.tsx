import { Content, Svg, width } from "../../../blog";

interface Plot {
  color: string;
  f: (n: number) => number;
}

const MeanTimePerElement = ({ plots }: { plots: Plot[] }) => {
  const height = 250;
  const top = 10;
  const bottom = height - 40;
  const left = 50;
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
        for (let n = 1; n <= xmax; ++n) {
          const p = f(n);
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

export const content: Content = async () => {
  const line: Plot = {
    color: "hsl(0 100% 75%)",
    f: (n) => n / 5,
  };
  return {
    chart: <MeanTimePerElement plots={[line]} />,
  };
};

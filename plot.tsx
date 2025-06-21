import { ComponentChildren } from "preact";
import { Svg, width } from "./blog";

const labelSize = 20;
const tickSize = 5;

export interface Dims {
  /** Total height of the entire graphic. */
  height: number;

  /** Width of the area subtended by the axes. */
  w: number;

  /** Height of the area subtended by the axes. */
  h: number;

  /** Free space above the area subtended by the axes. */
  t: number;

  /** Free space to the left of the area subtended by the axes */
  l: number;

  /** Free space to the right of the area subtended by the axes */
  r: number;

  /** Free space below the area subtended by the axes. */
  b: number;
}

export type AxesChild = (dims: Dims) => ComponentChildren;

export const Axes = (props: {
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  content: AxesChild[];
}) => {
  const height = props.height;
  const w = width - props.left - props.right;
  const h = props.height - props.top - props.bottom;
  const t = props.top;
  const l = props.left;
  const r = props.right;
  const b = props.bottom;
  const dims: Dims = { height, w, h, t, l, r, b };
  return (
    <Svg height={props.height}>
      {props.content.map((f) => f(dims))}
      <polyline
        points={`${l},${t} ${l},${height - b} ${width - r},${height - b}`}
        fill="none"
        stroke="white"
        stroke-width="2"
      />
    </Svg>
  );
};

export const AxesLabeled = (props: {
  height: number;
  top: number;
  left: number;
  right: number;
  bottom: number;
  xlabel: string;
  ylabel: string;
  content: AxesChild[];
}) => (
  <Axes
    height={props.height}
    top={props.top}
    left={props.left + labelSize}
    right={props.right}
    bottom={props.bottom + labelSize}
    content={[
      ({ h, t }) => {
        const y = (t + (t + h)) / 2;
        return (
          <text
            x="0"
            y={y}
            fill="white"
            text-anchor="middle"
            dominant-baseline="hanging"
            transform={`rotate(-90 0 ${y})`}
          >
            {props.ylabel}
          </text>
        );
      },
      ...props.content,
      ({ height, w, l }) => (
        <text
          x={(l + (l + w)) / 2}
          y={height - 5}
          fill="white"
          text-anchor="middle"
          dominant-baseline="text-bottom"
        >
          {props.xlabel}
        </text>
      ),
    ]}
  />
);

/** Returns a number between zero and one for all values in range. */
export type Scale = (value: number) => number;

export interface Scales extends Dims {
  x: Scale;
  y: Scale;
}

export type ScalesChild = (info: Scales) => ComponentChildren;

export const scales =
  ({
    x,
    y,
    content,
  }: {
    x: Scale;
    y: Scale;
    content: ScalesChild[];
  }): AxesChild =>
  (dims) => {
    const info: Scales = { ...dims, x, y };
    return content.map((f) => f(info));
  };

export const linearScale = (min: number, max: number): Scale => {
  const difference = max - min;
  return (value) => (value - min) / difference;
};

export const logScale = (min: number, max: number): Scale => {
  const linear = linearScale(Math.log(min), Math.log(max));
  return (value) => linear(Math.log(value));
};

export interface MajorTick {
  value: number;
  text: string;
}

export interface Ticks {
  minor?: number[];
  major: MajorTick[];
}

export const yticks =
  ({ minor, major }: Ticks): ScalesChild =>
  ({ h, t, l, y }) => (
    <>
      {major.map(({ value, text }) => (
        <text
          x={l - tickSize}
          y={t + h - h * y(value)}
          fill="white"
          text-anchor="end"
          dominant-baseline="central"
        >
          {text}
        </text>
      ))}
      {(minor ?? []).map((value) => {
        const y0 = t + h - h * y(value);
        return <line x1={l} y1={y0} x2={l + tickSize} y2={y0} stroke="grey" />;
      })}
    </>
  );

export const xticks =
  ({ minor, major }: Ticks): ScalesChild =>
  ({ w, h, t, l, x }) => (
    <>
      {(minor ?? []).map((value) => {
        const x0 = l + w * x(value);
        return (
          <line
            x1={x0}
            y1={t + h}
            x2={x0}
            y2={t + h - tickSize}
            stroke="grey"
          />
        );
      })}
      {major.map(({ value, text }) => (
        <text
          x={l + w * x(value)}
          y={t + h + tickSize}
          fill="white"
          text-anchor="middle"
          dominant-baseline="hanging"
        >
          {text}
        </text>
      ))}
    </>
  );

export const tick = (value: number, text: string): MajorTick => {
  return { value, text };
};

export interface Point {
  x: number;
  y: number;
}

export interface Plot {
  color: string;
  points: Point[];
}

export const linePlot =
  ({ color, points }: Plot): ScalesChild =>
  ({ w, h, t, l, x, y }) => (
    <polyline
      points={points
        .map((point) => `${l + w * x(point.x)},${t + h - h * y(point.y)}`)
        .join(" ")}
      fill="none"
      stroke={color}
      stroke-width="2"
      stroke-linejoin="round"
    />
  );

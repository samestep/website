import { ComponentChildren, JSX } from "preact";

export type Content = () => Promise<Record<string, JSX.Element>>;

export const splitlines = (s: string): string[] => {
  const lines = s.split(/\n/);
  let n = lines.length;
  if (n > 0 && lines[n - 1] === "") lines.pop();
  return lines;
};

export const width = 300;

export const Svg = (props: { height: number; children: ComponentChildren }) => {
  const debug = false;
  return (
    <div class="svg">
      <svg viewBox={`0 0 ${width} ${props.height}`} height={props.height}>
        {debug ? (
          <rect
            x="0"
            y="0"
            width={width}
            height={props.height}
            stroke="red"
            fill="none"
          />
        ) : (
          <></>
        )}
        {props.children}
      </svg>
    </div>
  );
};

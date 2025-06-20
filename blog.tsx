import { ComponentChildren, JSX } from "preact";

export type Content = () => Promise<Record<string, JSX.Element>>;

export const width = 300;

export const Svg = (props: { height: number; children: ComponentChildren }) => (
  <div class="svg">
    <svg viewBox={`0 0 ${width} ${props.height}`} height={props.height}>
      {props.children}
    </svg>
  </div>
);

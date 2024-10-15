import { JSX } from "preact";

export type Content = () => Promise<Record<string, JSX.Element>>;

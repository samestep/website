declare module "markdown-it-katex";

declare module "*.jsonl" {
  const text: string;
  export default text;
}

// workaround for using preact to render the XML for the RSS feed using JSX elements
declare namespace preact.JSX {
  interface XmlElementAttributes extends preact.JSX
    .HTMLAttributes<HTMLElement> {
    [attr: string]: unknown;
  }

  interface IntrinsicElements {
    rss: XmlElementAttributes;
    channel: XmlElementAttributes;
    "atom:link": XmlElementAttributes;
    description: XmlElementAttributes;
    item: XmlElementAttributes;
    guid: XmlElementAttributes;
    pubDate: XmlElementAttributes;
  }
}

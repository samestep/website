import { Resvg } from "@resvg/resvg-js";
import hljs from "highlight.js";
import markdownit from "markdown-it";
import markdownitKatex from "markdown-it-katex";
import * as fs from "node:fs/promises";
import { JSX } from "preact";
import { render } from "preact-render-to-string";
import prettier from "prettier";
import { Content } from "./blog";
import { Logo } from "./logo";
import { publications } from "./publications";
import { blogHtml, indexHtml } from "./templates";
import { importText } from "./util";

export const renderHtml = async (element: JSX.Element): Promise<string> =>
  await prettier.format(`<!doctype html>\n${render(element)}`, {
    parser: "html",
  });

const out = "out";

const getBlogPostContent = async (
  name: string,
): Promise<Map<string, string>> => {
  if (!(await fs.exists(`src/blog/${name}/content.tsx`))) return new Map();
  const content: Content = (await import(`./src/blog/${name}/content`)).content;
  return new Map(
    Object.entries(await content()).map(([k, v]) => [k, render(v)]),
  );
};

export const getBlogPostBody = async (
  md: markdownit,
  name: string,
): Promise<string> => {
  const replacements = await getBlogPostContent(name);
  const filename = `src/blog/${name}/index.md`;
  const markdown = (await importText(filename)).replaceAll(
    /^\{\{(\w+)\}\}$/gm,
    (_, key) => {
      const val = replacements.get(key);
      if (val === undefined) throw Error(`${filename} unknown key: ${key}`);
      return val;
    },
  );
  return md.render(markdown);
};

interface BlogPost {
  date?: string;
  title: string;
}

type PublishedPost = [string, Required<BlogPost>];

const isPublished = (entry: [string, BlogPost]): entry is PublishedPost => {
  const [_, p] = entry;
  return p.date !== undefined;
};

export const blogPosts: Record<string, BlogPost> = {
  autodiff: { title: "Differentiable Programming in General" },
  "incremental-parsing": {
    title: "How much faster is incremental parsing, really?",
  },
  "linked-lists": { title: "How much slower are linked lists, really?" },
  "parameter-syntax": {
    date: "2025-09-05",
    title: "Parameters and binding forms should be mutually recursive",
  },
  "random-access": {
    date: "2025-06-23",
    title: "How much slower is random access, really?",
  },
  "typst-impressions": {
    date: "2025-03-27",
    title: "First impressions with Typst",
  },
  "random-integers": {
    date: "2024-10-20",
    title: "How can computers roll dice?",
  },
  "parallelizing-nvcc": { date: "2021-02-20", title: "Parallelizing nvcc" },
};

export const md = markdownit({
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(str, { language: lang }).value;
      } catch (_) {}
    }
    return "";
  },
  html: true,
}).use(markdownitKatex);

const postHref = (id: string) => `/blog/${id}`;
const escapeXML = (str: string) =>
  str.replace(
    /[&<>'"]/g,
    (tag) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[tag] ?? "",
  );

const rss = (posts: PublishedPost[], baseUrl: string) => {
  const items = posts
    .map(
      ([id, p]) => `<item>
<title>${escapeXML(p.title)}</title>
<description>TODO</description>
<link>${new URL(postHref(id), baseUrl).href}</link>
<guid>${new URL(postHref(id), baseUrl).href}</guid>
<pubDate>${new Date(p.date).toUTCString()}</pubDate>
</item>`,
    )
    .join("\n");

  const feedUrl = new URL("rss.xml", baseUrl).href;
  const feed = `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
<title>Sam Estep</title>
<link>${baseUrl}</link>
<description>TODO</description>
${items}
</channel>
</rss>`;
  return `<?xml version="1.0" encoding="UTF-8" ?>
${feed}
`;
};

export const logo = () => {
  const svg = render(<Logo />);
  return {
    svg,
    png: new Blob([
      new Resvg(svg, { fitTo: { mode: "width", value: 192 } }).render().asPng(),
    ]),
  };
};

const generate = async () => {
  for (const file of ["all.css", "blog.css", "index.css", "photo.jpeg"]) {
    await Bun.write(`${out}/${file}`, Bun.file(`src/${file}`));
  }

  const { svg, png } = logo();
  await Bun.write(`${out}/logo.svg`, svg);
  await Bun.write(`${out}/icon.png`, png);

  const publishedPosts = Object.entries(blogPosts).filter(isPublished);
  await Bun.write(
    `${out}/index.html`,
    await renderHtml(
      indexHtml({
        pubs: publications(),
        blog: (
          <ul>
            {publishedPosts.map(([id, { date, title }]) => {
              const name = Bun.escapeHTML(title);
              return (
                <li>
                  {date} <a href={`/blog/${id}/`}>{name}</a>
                </li>
              );
            })}
          </ul>
        ),
      }),
    ),
  );

  for (const [name, { date, title }] of Object.entries(blogPosts)) {
    try {
      await fs.cp(`src/blog/${name}/assets`, `${out}/blog/${name}/assets`, {
        recursive: true,
      });
    } catch (_) {}
    const body = (
      <div
        dangerouslySetInnerHTML={{
          __html: await getBlogPostBody(md, name),
        }}
      ></div>
    );
    const style = `src/blog/${name}/style.css`;
    const css = await fs.exists(style);
    if (css) await fs.cp(style, `${out}/blog/${name}/style.css`);
    await Bun.write(
      `${out}/blog/${name}/index.html`,
      await renderHtml(
        blogHtml({ css, date: date ?? "unpublished", title, body }),
      ),
    );
  }

  const blogUrl = Bun.env["BLOG_BASE_URL"];
  if (blogUrl) {
    Bun.write(`${out}/rss.xml`, rss(publishedPosts, blogUrl));
  } else {
    console.debug("Blog URL not set; skipping RSS generation");
  }
};

export const build = async () => {
  await fs.rm(out, { force: true, recursive: true });
  await generate();
  const tmp = "tmp";
  const dist = "dist";
  try {
    await fs.rename(dist, tmp);
  } catch (_) {}
  await fs.rename(out, dist);
  await fs.rm(tmp, { force: true, recursive: true });
};

import hljs from "highlight.js";
import markdownit from "markdown-it";
import * as fs from "node:fs/promises";
import { JSX } from "preact";
import { render } from "preact-render-to-string";
import prettier from "prettier";
import { Content } from "./blog";
import { publications } from "./publications";
import { blogHtml, indexHtml } from "./templates";

const renderHtml = async (element: JSX.Element) =>
  await prettier.format(`<!doctype html>\n${render(element)}`, {
    parser: "html",
  });

const out = "out";

const blogPosts = {
  "random-integers": { date: "2024-10-06", title: "Random integers" },
  "parallelizing-nvcc": { date: "2021-02-20", title: "Parallelizing nvcc" },
};

const generate = async () => {
  const md = markdownit({
    highlight: (str, lang) => {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (_) {}
      }
      return "";
    },
    html: true,
  });

  for (const file of ["all.css", "blog.css", "index.css", "photo.jpeg"]) {
    await Bun.write(`${out}/${file}`, Bun.file(`src/${file}`));
  }
  await Bun.write(
    `${out}/index.html`,
    await renderHtml(
      indexHtml({
        pubs: publications(),
        blog: (
          <ul>
            {Object.entries(blogPosts).map(([id, { date, title }]) => {
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
    await fs.cp(`src/blog/${name}`, `${out}/blog/${name}`, { recursive: true });
    await fs.rm(`out/blog/${name}/index.md`);
    await fs.rm(`out/blog/${name}/content.tsx`);
    const content: Content = (await import(`./src/blog/${name}/content`))
      .content;
    const replacements = new Map(
      Object.entries(await content()).map(([k, v]) => [k, render(v)]),
    );
    const filename = `src/blog/${name}/index.md`;
    const markdown = (await Bun.file(filename).text()).replaceAll(
      /\{\{(\w+)\}\}/g,
      (_, key) => {
        const val = replacements.get(key);
        if (val === undefined) throw Error(`${filename} unknown key: ${key}`);
        return val;
      },
    );
    const body = (
      <div
        dangerouslySetInnerHTML={{
          __html: md.render(markdown),
        }}
      ></div>
    );
    await Bun.write(
      `${out}/blog/${name}/index.html`,
      await renderHtml(blogHtml({ date, title, body })),
    );
  }
};

export const build = async () => {
  await fs.rm(out, { recursive: true });
  await generate();
  const tmp = "tmp";
  const dist = "dist";
  try {
    await fs.rename(dist, tmp);
  } catch (_) {}
  await fs.rename(out, dist);
  await fs.rm(tmp, { recursive: true });
};

import markdownit from "markdown-it";
import * as fs from "node:fs/promises";
import { JSX } from "preact";
import { render } from "preact-render-to-string";
import prettier from "prettier";
import { blogHtml, indexHtml } from "./templates";

const renderHtml = async (element: JSX.Element) =>
  await prettier.format(`<!doctype html>\n${render(element)}`, {
    parser: "html",
  });

const out = "out";

const blogPosts = {
  "parallelizing-nvcc": { date: "2021-02-20", title: "Parallelizing nvcc" },
};

const generate = async () => {
  const md = markdownit();

  for (const file of ["all.css", "blog.css", "index.css", "photo.jpeg"]) {
    await Bun.write(`${out}/${file}`, Bun.file(`src/${file}`));
  }
  await Bun.write(
    `${out}/index.html`,
    await renderHtml(
      indexHtml(
        <ul>
          {Object.entries(blogPosts).map(([id, { date, title }]) => {
            const name = Bun.escapeHTML(title);
            return (
              <li>
                {date} <a href={`/blog/${id}/`}>{name}</a>
              </li>
            );
          })}
        </ul>,
      ),
    ),
  );

  for (const [name, { date, title }] of Object.entries(blogPosts)) {
    await fs.cp(`src/blog/${name}`, `${out}/blog/${name}`, { recursive: true });
    await fs.rm(`out/blog/${name}/index.md`);
    const body = (
      <div
        dangerouslySetInnerHTML={{
          __html: md.render(await Bun.file(`src/blog/${name}/index.md`).text()),
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

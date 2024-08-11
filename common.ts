import markdownit from "markdown-it";
import * as fs from "node:fs/promises";

const out = "out";

const blogPosts = {
  "parallelizing-nvcc": { date: "2021-02-20", title: "Parallelizing nvcc" },
};

const generate = async () => {
  const md = markdownit();

  for (const file of [
    "all.css",
    "blog.css",
    "index.css",
    "index.html",
    "photo.jpeg",
  ]) {
    await Bun.write(`${out}/${file}`, Bun.file(`src/${file}`));
  }
  await Bun.write(
    `${out}/index.html`,
    (await Bun.file(`src/index.html`).text()).replaceAll(
      "{{blog}}",
      Object.entries(blogPosts)
        .map(([id, { date, title }]) => {
          const name = Bun.escapeHTML(title);
          return `<li>${date} <a href="/blog/${id}/">${name}</a></li>`;
        })
        .join("\n"),
    ),
  );

  const template = await Bun.file("src/blog.html").text();
  for (const [name, { date, title }] of Object.entries(blogPosts)) {
    await fs.cp(`src/blog/${name}`, `${out}/blog/${name}`, { recursive: true });
    await fs.rm(`out/blog/${name}/index.md`);
    const body = md.render(await Bun.file(`src/blog/${name}/index.md`).text());
    await Bun.write(
      `${out}/blog/${name}/index.html`,
      template
        .replaceAll("{{date}}", date)
        .replaceAll("{{title}}", Bun.escapeHTML(title))
        .replaceAll("{{body}}", body),
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

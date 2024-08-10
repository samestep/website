import { $ } from "bun";
import * as fs from "node:fs/promises";

const out = "tmp";

const generate = async () => {
  await fs.cp("src", out, { recursive: true });
};

const clean = async () => {
  await fs.rm(out, { recursive: true });
};

export const build = async () => {
  await clean();
  await generate();
  const dist = "dist";
  await fs.mkdir(dist, { recursive: true });
  await $`fs-swap ${out} ${dist}`;
  await clean();
};

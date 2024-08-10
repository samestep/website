import * as fs from "node:fs/promises";

const out = "out";

const generate = async () => {
  await fs.cp("src", out, { recursive: true });
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

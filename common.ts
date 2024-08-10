import * as fs from "node:fs/promises";

const out = "out";

const generate = async () => {
  await fs.cp("src", out, { recursive: true });
};

export const build = async () => {
  await fs.rm(out, { recursive: true });
  await generate();
  const dist = "dist";
  const tmp = "tmp";
  try {
    await fs.rename(dist, tmp);
  } catch (e) {}
  await fs.rename(out, dist);
  await fs.rm(tmp, { recursive: true });
};

import * as fs from "node:fs/promises";

const out = "out";

const generate = async () => {
  await fs.cp("src", out, { recursive: true });
};

export const build = async () => {
  await fs.rm(out, { recursive: true });
  await generate();
  const dist = "dist";
  try {
    const tmp = "tmp";
    await fs.rename(dist, tmp);
    await fs.rm(tmp, { recursive: true });
  } catch (e) {}
  await fs.rename(out, dist);
};

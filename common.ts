import * as fs from "node:fs/promises";

export const build = async () => {
  await fs.cp("src", "dist", { recursive: true });
};

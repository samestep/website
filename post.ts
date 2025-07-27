import { parseArgs } from "node:util";
import { getBlogPostBody, md } from "./common";
import { println } from "./lock";

const start = performance.now();
println(async () => {
  const { positionals } = parseArgs({ allowPositionals: true });
  if (positionals.length !== 1)
    throw Error("expected exactly one positional argument");
  const [name] = positionals;
  const body = await getBlogPostBody(md, name);
  return { milliseconds: performance.now() - start, body };
});

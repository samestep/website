import { parseArgs } from "node:util";
import { getBlogPostBody, md } from "./common";
import { println } from "./lock";

println(async () => {
  const { positionals } = parseArgs({ allowPositionals: true });
  if (positionals.length !== 1)
    throw Error("expected exactly one positional argument");
  const [name] = positionals;
  return await getBlogPostBody(md, name);
});

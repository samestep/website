import logUpdate from "log-update";
import * as child_process from "node:child_process";
import * as fs from "node:fs/promises";
import os from "node:os";
import * as readline from "node:readline";
import { parseArgs } from "node:util";
import encodeQR from "qr";
import { blogPosts, logo, renderHtml } from "./common";
import { blogHtml } from "./templates";

const listen = <T,>(
  command: string,
  args: string[],
  callback: (value: T) => void,
) => {
  const child = child_process.spawn(command, args ?? [], {
    stdio: ["pipe", "pipe", "inherit"],
  });
  const childStdout = child.stdout!;
  readline.createInterface({ input: childStdout }).on("line", (line) => {
    callback(JSON.parse(line));
  });
};

const { values } = parseArgs({ options: { post: { type: "string" } } });
const { post: name } = values;
if (name === undefined) throw Error("expected a blog post name");

const addresses = Object.values(os.networkInterfaces()).flatMap((ifaces) =>
  (ifaces ?? [])
    .filter(
      ({ family, address }) => family === "IPv4" && address !== "127.0.0.1",
    )
    .map(({ address }) => address),
);
if (addresses.length < 1) throw Error("expected at least one address");
const [address] = addresses;

const clients = new Set<Bun.ServerWebSocket<unknown>>();

let body: string | undefined = undefined;

Bun.serve({
  routes: {
    "/all.css": Bun.file("src/all.css"),
    "/blog.css": Bun.file("src/blog.css"),
    "/icon.png": new Response(logo().png),
    [`/blog/${name}/style.css`]: Bun.file(`src/blog/${name}/style.css`),
    [`/blog/${name}/`]: new Response(
      await renderHtml(
        blogHtml({
          hot: `ws://${address}:3000/ws`,
          css: await fs.exists(`src/blog/${name}/style.css`),
          date: blogPosts[name].date ?? "unpublished",
          title: blogPosts[name].title,
          body: <></>,
        }),
      ),
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    ),
    "/ws": (req, server) => {
      // Upgrade to a WebSocket.
      if (server.upgrade(req)) return; // Do not return a Response.
      return new Response("Upgrade failed", { status: 500 });
    },
  },
  websocket: {
    message() {},
    open(ws) {
      if (body !== undefined) ws.send(body);
      clients.add(ws);
    },
    close(ws) {
      clients.delete(ws);
    },
  },
});

const url = `http://${address}:3000/blog/${name}/`;
console.log(url);
console.log();
console.log(encodeQR(url, "ascii"));

let lastInput = performance.now();
let lastOutput = performance.now();

const log = () => {
  const latency = lastOutput - lastInput;
  if (latency >= 0) logUpdate(`${Math.round(latency)} milliseconds`);
};

const args = ["--hot", "--no-clear-screen", "post.ts", name];
listen("bun", args, (newBody: string) => {
  lastOutput = performance.now();
  log();
  body = newBody;
  for (const ws of clients) {
    ws.send(body);
  }
});

for await (const _ of fs.watch(".", { recursive: true })) {
  lastInput = performance.now();
  log();
}

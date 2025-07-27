import logUpdate from "log-update";
import * as child_process from "node:child_process";
import * as fs from "node:fs/promises";
import os from "node:os";
import * as readline from "node:readline";
import { parseArgs } from "node:util";
import encodeQR from "qr";
import { blogPosts, logo, renderHtml } from "./common";
import { blogHtml } from "./templates";

interface Timed<T> {
  when: number;
  what: T;
}

const stamp = <T,>(what: T): Timed<T> => ({ when: performance.now(), what });

const formatMs = (ms: number): string => `${Math.round(ms)}`.padStart(6);

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

interface Output {
  milliseconds: number;
  body: string;
}

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

const url = `http://${address}:3000/blog/${name}/`;
console.log(url);
console.log();
console.log(encodeQR(url, "ascii"));

const clients = new Set<Bun.ServerWebSocket<unknown>>();

let lastFsEvent: Timed<fs.FileChangeInfo<string>> | undefined = undefined;
let lastOutput: Timed<Output> | undefined = undefined;
let lastAck: Timed<"ack"> | undefined = undefined;

const log = () => {
  let lines: string[] = [];
  let total = 0;

  if (lastFsEvent !== undefined && lastOutput !== undefined) {
    const latency = lastOutput.when - lastFsEvent.when;
    const event = `${lastFsEvent.what.filename} ${lastFsEvent.what.eventType}`;
    lines.push(`${formatMs(latency)}ms rebuild after ${event}`);
    total += latency;
  } else lines.push("");

  if (lastOutput !== undefined && lastAck !== undefined) {
    const latency = lastAck.when - lastOutput.when;
    lines.push(`${formatMs(latency)}ms network roundtrip`);
    total += latency;
  } else lines.push("");

  lines.push(`${formatMs(total)}ms total`);
  logUpdate(lines.join("\n"));
};

const args = ["--hot", "--no-clear-screen", "post.ts", name];
listen("bun", args, (output: Output) => {
  lastOutput = stamp(output);
  log();
  for (const ws of clients) {
    ws.send(lastOutput.what.body);
  }
});

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
    message(ws, message) {
      if (message === "ack") {
        lastAck = stamp(message);
        log();
      } else console.warn({ message });
    },
    open(ws) {
      if (lastOutput !== undefined) ws.send(lastOutput.what.body);
      clients.add(ws);
    },
    close(ws) {
      clients.delete(ws);
    },
  },
});

for await (const event of fs.watch(".", { recursive: true })) {
  lastFsEvent = stamp(event);
  log();
}

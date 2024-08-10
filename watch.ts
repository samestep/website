#!/usr/bin/env bun

import chokidar from "chokidar";
import { build } from "./common";

const now = () => new Date().toISOString();

let working = false;
let dirty = false;

async function work() {
  if (working) return;
  working = true;
  while (dirty) {
    dirty = false;
    console.log(`${now()} building`);
    await build();
    console.log(`${now()} done`);
  }
  working = false;
}

chokidar.watch("src").on("all", async (event, path) => {
  dirty = true;
  console.log(event, path);
  await work();
});

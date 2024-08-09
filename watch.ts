#!/usr/bin/env bun

import chokidar from "chokidar";
import { build } from "./common";

chokidar.watch("src").on("all", async (event, path) => {
  console.log(event, path);
  await build();
});

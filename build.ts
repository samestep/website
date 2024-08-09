#!/usr/bin/env bun

import * as fs from "node:fs/promises";
import { build } from "./common";

await fs.rm("dist", { recursive: true });
await build();

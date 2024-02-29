#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import getConfig from "./fresh.config.ts";
import "$std/dotenv/load.ts";

import { logi, 初始化 } from "./pmims/mod.ts";

// DEBUG
logi(": dev.ts");
await 初始化();

await dev(import.meta.url, "./main.ts", getConfig());

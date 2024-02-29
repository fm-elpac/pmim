/// <reference no-default-lib="true" />
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
/// <reference lib="dom.asynciterable" />
/// <reference lib="deno.ns" />
/// <reference lib="deno.unstable" />

import "$std/dotenv/load.ts";

import { start } from "$fresh/server.ts";
import manifest from "./fresh.gen.ts";
import getConfig from "./fresh.config.ts";

import { logi, 初始化 } from "./pmims/mod.ts";

// DEBUG
logi(": main.ts");
await 初始化();

await start(manifest, getConfig());

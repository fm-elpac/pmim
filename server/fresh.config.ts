import { defineConfig } from "$fresh/server.ts";

import { 监听地址 } from "./pmims/conf.ts";
import { onListen, 获取端口 } from "./pmims/mod.ts";

export default function getConfig() {
  return defineConfig({
    plugins: [],

    server: {
      port: 获取端口(),
      hostname: 监听地址,
      onListen,
    },
  });
}

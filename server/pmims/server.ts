// deno server
import { join } from "$std/path/join.ts";

import {
  ENV_PMIMS_PORT,
  ENV_XDG_RUNTIME_DIR,
  FP_PORT,
  默认端口,
} from "./conf.ts";
import { logi } from "./util/log.ts";

// 获取 http 服务器监听的端口号
export function 获取端口(): number {
  const p = Deno.env.get(ENV_PMIMS_PORT);
  if (p != null) {
    const p1 = Number.parseInt(p);
    if (!Number.isNaN(p1)) {
      return p1;
    }
  }

  return 默认端口;
}

export function 端口文件路径(): string {
  const 目录 = Deno.env.get(ENV_XDG_RUNTIME_DIR)!;
  return join(目录, FP_PORT);
}

// http 服务器开始监听后的回调
export async function onListen(p: { hostname: string; port: number }) {
  logi("/fresh: listen");
  console.log(p);

  // 保存端口号至运行文件
  await Deno.writeTextFile(端口文件路径(), p.port.toString());

  // TODO
}

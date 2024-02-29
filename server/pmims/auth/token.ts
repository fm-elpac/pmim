// http 接口 /pmims_api/ 认证使用的口令管理
// 口令文件: /run/user/1000/pmim/server_token
import { join } from "$std/path/join.ts";
import { timingSafeEqual } from "$std/crypto/timing_safe_equal.ts";
import { encodeBase64 } from "$std/encoding/base64.ts";

import { ENV_XDG_RUNTIME_DIR, FP_TOKEN } from "../conf.ts";
import { logi } from "../util/log.ts";
import { 建上级目录 } from "../util/mod.ts";

// 内存中保存的口令
const etc = {
  口令: new Uint8Array(),
};

async function 获取随机数据(): Promise<string> {
  // 64 Byte, 512bit 随机数据
  const a = new Uint8Array(64);
  crypto.getRandomValues(a);

  // base64(sha256())
  const h = await crypto.subtle.digest("SHA-256", a);
  return encodeBase64(h);
}

export function 口令文件路径(): string {
  const 目录 = Deno.env.get(ENV_XDG_RUNTIME_DIR)!;
  return join(目录, FP_TOKEN);
}

export async function 初始化口令() {
  const 口令文件 = 口令文件路径();
  logi(" token: " + 口令文件);

  const 口令 = await 获取随机数据();
  // 存储口令
  etc.口令 = new TextEncoder().encode(口令);

  await 建上级目录(口令文件);
  await Deno.writeTextFile(口令文件, 口令);
}

export function 检查口令(t: string): boolean {
  const d = new TextEncoder().encode(t);
  return timingSafeEqual(d, etc.口令);
}

// pmim-server
import { loge, logi } from "./util/log.ts";
import { 关闭数据库, 初始化数据库 } from "./db/mod.ts";
import { 初始化口令 } from "./auth/mod.ts";
import { 初始化ibus } from "./ibus/mod.ts";
import * as pin_yin from "./pin_yin/mod.ts";
import * as p2c from "./p2c/mod.ts";

export { logi } from "./util/log.ts";
export { onListen, 获取端口 } from "./server.ts";

export async function 初始化核心() {
  await 关闭数据库();

  await 初始化数据库();
  await pin_yin.初始化();
  await p2c.初始化();

  logi(": 核心初始化成功");
}

export async function 初始化() {
  // 检查 deno task build: deno run -A dev.ts build
  if ("build" == Deno.args[0]) {
    return;
  }
  logi(": 初始化");

  try {
    await 初始化核心();
  } catch (e) {
    // 允许核心初始化失败
    loge(": 核心初始化失败");
    loge(e);
  }

  await 初始化口令();
  await 初始化ibus();
}

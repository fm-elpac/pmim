import { join } from "$std/path/join.ts";

import {
  DB_SYS_VERSION,
  DB_USER_VERSION,
  ENV_HOME,
  ENV_PMIMS_DB,
  FP_DB_SYS,
  FP_DB_SYS_1,
  FP_DB_USER,
  FP_DB_USER_1,
  P_VERSION,
} from "../conf.ts";
import { logi } from "../util/log.ts";

function 内置数据库文件(): string {
  const d = Deno.env.get(ENV_PMIMS_DB);
  if (d != null) {
    return join(d, FP_DB_SYS_1);
  }
  return join(Deno.env.get(ENV_HOME)!, FP_DB_SYS);
}

function 用户数据库文件(): string {
  const d = Deno.env.get(ENV_PMIMS_DB);
  if (d != null) {
    return join(d, FP_DB_USER_1);
  }
  return join(Deno.env.get(ENV_HOME)!, FP_DB_USER);
}

// 打开的数据库实例
const 库: {
  s?: Deno.Kv;
  u?: Deno.Kv;
} = {
  s: undefined,
  u: undefined,
};

// 键: 数据库版本
const K_DB_VERSION = ["pmim_db", "version"];

async function 初始化内置数据库() {
  const 路径 = 内置数据库文件();
  logi(" db_sys: " + 路径);

  const kv = await Deno.openKv(路径);
  // 检查数据库版本
  const { value } = await kv.get(K_DB_VERSION);
  if (value != DB_SYS_VERSION) {
    throw new Error("内置数据库版本错误 " + value);
  }

  库.s = kv;
}

async function 初始化用户数据库() {
  const 路径 = 用户数据库文件();
  logi(" db_user: " + 路径);

  const kv = await Deno.openKv(路径);
  // 检查数据库版本
  const { value } = await kv.get(K_DB_VERSION);
  if (null == value) {
    // 新建的空白数据库, 写入版本数据
    const k = ["pmim_db", "v"];
    await kv.set(k, {
      pmim: P_VERSION,
      deno_version: Deno.version,
      _last_update: new Date().toISOString(),
    });
    await kv.set(K_DB_VERSION, DB_USER_VERSION);

    // 检查版本是否匹配
  } else if (value != DB_USER_VERSION) {
    throw new Error("用户数据库版本错误 " + value);
  }

  库.u = kv;
}

export async function 初始化数据库() {
  // 首先初始化用户数据库: 可以读取配置
  await 初始化用户数据库();

  await 初始化内置数据库();
}

export async function 关闭数据库() {
  if (null != 库.u) {
    logi(": 关闭用户数据库");
    库.u.close();
  }
  if (null != 库.s) {
    logi(": 关闭内置数据库");
    库.s.close();
  }
}

// 获取内置数据库
export function ds(): Deno.Kv {
  return 库.s!;
}

// 获取用户数据库
export function du(): Deno.Kv {
  return 库.u!;
}

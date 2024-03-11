import { join } from "$std/path/join.ts";
import { ulid } from "ulidx";

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

// 将整个内置数据库全部载入内存
async function 内置数据库载入内存(ds: Deno.Kv): Promise<Deno.Kv> {
  // 内存中的 sqlite 数据库
  const o = await Deno.openKv(":memory:");
  logi(" db_sys: 开始加载内置数据库");

  // 加载数据的条数
  let c = 0;
  for await (const i of ds.list({ prefix: [] })) {
    await o.set(i.key, i.value);
    c += 1;
  }
  // 记得关闭数据库
  ds.close();

  logi(" db_sys: 内置数据库已全部载入内存 (" + c + ")");
  return o;
}

// 键: 数据库版本
const K_DB_VERSION = ["pmim_db", "version"];

async function 初始化内置数据库(sdb_m = 0) {
  const 路径 = 内置数据库文件();
  logi(" db_sys: " + 路径);

  const kv = await Deno.openKv(路径);
  // 检查数据库版本
  const { value } = await kv.get(K_DB_VERSION);
  if (value != DB_SYS_VERSION) {
    throw new Error("内置数据库版本错误 " + value);
  }

  // 配置项: `c.sdb_m`
  if (1 == sdb_m) {
    logi(" db_sys: c.sdb_m = " + sdb_m);
    库.s = await 内置数据库载入内存(kv);
  } else {
    库.s = kv;
  }
}

// 检查用户数据库 ULID 标记
async function 检查ulid(kv: Deno.Kv) {
  const K = ["pmim_db", "u_ulid"];
  const { value } = await kv.get(K);
  if (null != value) {
    logi(" db_user: ULID " + value);
  } else {
    // 生成新的 ULID
    const id = ulid();
    logi(" db_user: ULID = " + id);
    await kv.set(K, id);
  }
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

  await 检查ulid(kv);

  库.u = kv;
}

export async function 初始化数据库() {
  // 首先初始化用户数据库: 可以读取配置
  await 初始化用户数据库();

  // 配置项: `c.sdb_m`
  const K1 = ["data_u", "conf", "c.sdb_m"];
  const { value } = await du().get(K1);

  await 初始化内置数据库(value as number);
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

export interface 数据库信息结果 {
  ds?: {
    version?: string;
    v?: Record<string, unknown>;
  };
  du?: {
    version?: string;
    v?: Record<string, unknown>;
    u_ulid?: string;
  };
  内置数据库文件?: string;
  用户数据库文件?: string;
}

// 获取数据库信息 (ds, du)
export async function 数据库信息(): Promise<数据库信息结果> {
  const o: 数据库信息结果 = {};
  o.内置数据库文件 = 内置数据库文件();
  o.用户数据库文件 = 用户数据库文件();
  if (null != 库.u) {
    o.du = {};
    {
      const { value } = await 库.u.get(["pmim_db", "version"]);
      o.du.version = value as string;
    }
    {
      const { value } = await 库.u.get(["pmim_db", "v"]);
      o.du.v = value as Record<string, unknown>;
    }
    {
      const { value } = await 库.u.get(["pmim_db", "u_ulid"]);
      o.du.u_ulid = value as string;
    }
  }
  if (null != 库.s) {
    o.ds = {};
    {
      const { value } = await 库.s.get(["pmim_db", "version"]);
      o.ds.version = value as string;
    }
    {
      const { value } = await 库.s.get(["pmim_db", "v"]);
      o.ds.v = value as Record<string, unknown>;
    }
  }
  return o;
}

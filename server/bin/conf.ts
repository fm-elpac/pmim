#!/usr/bin/env -S deno run -A
// pmim/server/bin/conf.ts: 配置命令行工具
// 使用 /pmims_api/conf_get, /pmims_api/conf_set 接口
//
// 用法:
// + ./conf.ts get XXX
// + ./conf.ts set XXX VVV
import {
  ENV_XDG_RUNTIME_DIR,
  FP_PORT,
  FP_TOKEN,
  HH_TOKEN,
  监听地址,
} from "../pmims/conf.ts";

// join path
function join(a: string, b: string): string {
  return a + b;
}

async function 读取口令(): Promise<string> {
  const 文件 = join(Deno.env.get(ENV_XDG_RUNTIME_DIR)!, FP_TOKEN);
  return await Deno.readTextFile(文件);
}

// 获取接口请求地址
async function url(路径: string): Promise<string> {
  // 读取端口号
  const 文件 = join(Deno.env.get(ENV_XDG_RUNTIME_DIR)!, FP_PORT);
  const 端口 = Number.parseInt(await Deno.readTextFile(文件));

  return `http://${监听地址}:${端口}/pmims_api/${路径}`;
}

// 对请求 /pmims_api/* 的封装
async function da(路径: string, 数据: unknown): Promise<unknown> {
  const 响应 = await fetch(await url(路径), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      [HH_TOKEN]: await 读取口令(),
    },
    body: JSON.stringify(数据),
  });

  // 错误检查
  if (!响应.ok) {
    throw new Error("HTTP " + 响应.status);
  }
  const 结果 = await 响应.json();
  if ((结果.e != null) && (结果.e != 0)) {
    throw new Error(`e ${结果.e}: ${结果.t}`);
  }
  // 没有错误
  return 结果;
}

function 帮助信息() {
  console.log("Usage:");
  console.log("  ./conf.ts get XXX");
  console.log("  ./conf.ts set XXX VVV");
}

async function main() {
  const 操作 = Deno.args[0];

  function 键(): string {
    const k = Deno.args[1];

    if ((k == null) || (k.length < 1)) {
      throw new Error("bad key: " + k);
    }
    return k;
  }

  if ("get" == 操作) {
    const 结果 = await da("conf_get", [键()]);
    console.log(结果);
  } else if ("set" == 操作) {
    const 值 = Deno.args[2];
    const 结果 = await da("conf_set", {
      [键()]: 值,
    });
    console.log(结果);
  } else if (操作 == "--help") {
    帮助信息();
  } else {
    throw new Error("unknown command " + 操作);
  }
}

// 程序入口
if (import.meta.main) main();

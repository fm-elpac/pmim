// ibus 适配
import { join } from "$std/path/join.ts";
import { TextLineStream } from "$std/streams/text_line_stream.ts";

import { ENV_PMIMS_US, ENV_XDG_RUNTIME_DIR, FP_PMIM_US } from "../conf.ts";
import { logi } from "../util/log.ts";
import { 发送消息 } from "../../routes/pmims_api/ibus_sse.ts";

export function 接口文件路径(): string {
  const us = Deno.env.get(ENV_PMIMS_US);
  if (null != us) {
    return us;
  }

  // 默认值
  const 目录 = Deno.env.get(ENV_XDG_RUNTIME_DIR)!;
  return join(目录, FP_PMIM_US);
}

export async function 初始化ibus() {
  // unix socket
  const 路径 = 接口文件路径();
  logi(" ibus: " + 路径);

  const s = Deno.listen({
    transport: "unix",
    path: 路径,
  });
  处理监听(s);

  // 退出前删除 unix socket 文件
  Deno.addSignalListener("SIGINT", () => {
    logi(" ibus: SIGINT");

    Deno.removeSync(路径);
    Deno.exit();
  });
}

async function 处理监听(s: Deno.Listener) {
  for await (const c of s) {
    处理连接1(c);
  }
}

// 保存已建立的连接
const 连接: Set<WritableStreamDefaultWriter<Uint8Array>> = new Set();

async function 处理连接1(c: Deno.Conn) {
  const w = c.writable.getWriter();
  连接.add(w);
  try {
    await 处理连接(c);
  } catch (_e) {
    // TODO
  }
  // 移除连接
  连接.delete(w);
}

// 给 ibrus 发送消息
export async function ibus发送消息(t: string, m: unknown) {
  // 消息格式: `类型 JSON`
  const s = `${t} ${JSON.stringify(m)}\n`;
  const b = new TextEncoder().encode(s);
  for (const i of 连接) {
    try {
      await i.write(b);
    } catch (e) {
      // TODO
      console.log(e);

      // 出错则移除
      连接.delete(i);
    }
  }
}

// 单个连接
async function 处理连接(c: Deno.Conn) {
  const 行 = c.readable.pipeThrough(new TextDecoderStream()).pipeThrough(
    new TextLineStream(),
  );

  // 是否收到 `ok` 消息
  let ok = false;

  for await (const i of 行) {
    //console.log(i);

    // 消息格式: `类型 JSON`
    const 空格位置 = i.indexOf(" ");
    let 类型: string, 数据: unknown;
    if (空格位置 < 0) {
      类型 = i;
    } else {
      类型 = i.slice(0, 空格位置);
      数据 = JSON.parse(i.slice(空格位置 + 1, i.length));
    }

    // 忽略第一个 `ok` 消息之前的所有消息
    if (("S" == 类型) && ("ok" == 数据)) {
      ok = true;
    }
    if (!ok) {
      continue;
    }
    // 解析消息
    const m: {
      类型: string;
      数据: unknown;
      文本?: string;
      x?: number;
      y?: number;
      w?: number;
      h?: number;
      键值?: string;
      键码?: number;
      键状态?: number;
      键按下?: number;
    } = {
      // 保留原始类型和数据
      类型,
      数据,
    };

    switch (类型) {
      // 简单字符串消息
      case "S":
        m.文本 = 数据 as string;
        break;
      // 按键管理器 消息
      case "T":
        m.文本 = 数据 as string;
        break;
      // 光标位置消息
      case "C":
        {
          const d = 数据 as Array<number>;
          m.x = d[0];
          m.y = d[1];
          m.w = d[2];
          m.h = d[3];
        }
        break;
      // 按键消息
      case "K":
        {
          const d = 数据 as Array<number>;
          const 值 = d[0];
          if (值 < 127) {
            // ASCII 转为字符
            m.键值 = String.fromCharCode(值);
          }
          m.键码 = d[1];
          m.键状态 = d[2];
          m.键按下 = d[3];
        }
        break;
    }

    发送消息(m);
  }
}

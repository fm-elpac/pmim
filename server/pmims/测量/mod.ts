// 输入测量 (统计) 功能
import { 提交文本参数 } from "../util/mod.ts";
import { u切分 } from "../p2c/uu.ts";
import { 至日期 } from "../p2c/user/d7.ts";
import { du } from "../db/mod.ts";

export interface 统计参数 {
  // 统计的日期, 比如 `2024-02-25`
  d: string;

  // s = 1: 不输出每分钟的原始数据
  s?: number;
}

// deno-kv: 过期 30 天
function _ed30() {
  // 毫秒
  const expireIn = 30 * 24 * 60 * 60 * 1e3;
  return { expireIn };
}

// 返回时分 (UTC), 比如 `0207`
function 至时分(d: Date): string {
  return d.toISOString().split("T")[1].split(":").slice(0, 2).join("");
}

// deno-kv 写入工具函数

// 构造统计键
function k1(日期: string, 时分: string, k: string): Deno.KvKey {
  return ["data_u", "m", 日期, k, 时分];
}

// 写入累计值
function 写入计数(
  a: Deno.AtomicOperation,
  日期: string,
  时分: string,
  k: string,
  n: number,
) {
  a.sum(k1(日期, 时分, k), BigInt(n));
}

// 写入最小值
function 写入最小(
  a: Deno.AtomicOperation,
  日期: string,
  时分: string,
  k: string,
  n: number,
) {
  a.min(k1(日期, 时分, k), BigInt(n));
}

// 写入最大值
function 写入最大(
  a: Deno.AtomicOperation,
  日期: string,
  时分: string,
  k: string,
  n: number,
) {
  a.max(k1(日期, 时分, k), BigInt(n));
}

// 同时写入多个累计值, 最小值, 最大值
function 写入多个(
  a: Deno.AtomicOperation,
  日期: string,
  时分: string,
  k: string,
  n: Array<number>,
) {
  if (n.length < 1) {
    return;
  }

  const 计数 = n.reduce((a, b) => a + b, 0);
  const 最小 = Math.min(...n);
  const 最大 = Math.max(...n);

  写入计数(a, 日期, 时分, k, 计数);
  写入最小(a, 日期, 时分, k + "_m", 最小);
  写入最大(a, 日期, 时分, k + "_M", 最大);
}

export async function 测量(提交: 提交文本参数) {
  const d = new Date();
  const a = du().atomic();
  const 日期 = 至日期(d);
  const 时分 = 至时分(d);

  // c.n 提交次数
  写入计数(a, 日期, 时分, "c.n", 1);

  // 仅汉字输入
  if ("c" == 提交.c) {
    // c.c 提交次数
    写入计数(a, 日期, 时分, "c.c", 1);

    // c.t, c.t_m, c.t_M 输入字数
    const 字 = u切分(提交.t);
    写入多个(a, 日期, 时分, "c.t", [字.length]);

    // i.n, i.n_m, i.n_M 候选项序号的个数
    if (null != 提交.m_i) {
      const m_i = 提交.m_i;
      写入多个(a, 日期, 时分, "i.n", [m_i.length]);

      // i.c, i.c_m, i.c_M 候选项序号 (综合)
      写入多个(a, 日期, 时分, "i.c", m_i);

      // i.c1, i.c1_m, i.c1_M, i.c1_n 候选项序号 仅一项
      if (1 == m_i.length) {
        写入计数(a, 日期, 时分, "i.c1_n", 1);
        写入多个(a, 日期, 时分, "i.c1", m_i);
      } else if (m_i.length > 1) {
        // i.cn, i.cn_m, i.cn_M, i.cn_n 候选项序号 仅多项
        写入计数(a, 日期, 时分, "i.cn_n", m_i.length);
        写入多个(a, 日期, 时分, "i.cn", m_i);
      }
    }

    // t.p, t.p_m, t.p_M, t.p_n 拼音切分 响应时间 ms
    if (null != 提交.mt_pin_yin) {
      const t = 提交.mt_pin_yin;
      写入计数(a, 日期, 时分, "t.p_n", t.length);
      写入多个(a, 日期, 时分, "t.p", t);
    }
    // t.c, t.c_m, t.c_M, t.c_n 拼音转汉字 响应时间 ms
    if (null != 提交.mt_p2c) {
      const t = 提交.mt_p2c;
      写入计数(a, 日期, 时分, "t.c_n", t.length);
      写入多个(a, 日期, 时分, "t.c", t);
    }
  }
  // 保存数据
  await a.commit();
}

export async function 统计结果(参数: 统计参数) {
  const { d, s } = 参数;
  // 按 时分 为数据分组
  const 数据: Record<string, Record<string, number>> = {};

  // 读取该日期的所有数据
  for await (
    const { key, value } of du().list({ prefix: ["data_u", "m", d] })
  ) {
    const 时分 = key.at(-1) as string;
    const k = key.at(-2) as string;
    if (null == 数据[时分]) {
      数据[时分] = {};
    }
    数据[时分][k] = Number.parseInt(value as string);
  }

  // 对当天的所有数据进行统计
  const 统计: Record<string, number> = {};
  for (const i of Object.keys(数据)) {
    const r = 数据[i];
    for (const j of Object.keys(r)) {
      // 最小
      if (j.endsWith("_m")) {
        if (null == 统计[j]) {
          统计[j] = r[j];
        } else {
          统计[j] = Math.min(统计[j], r[j]);
        }
      } else if (j.endsWith("_M")) {
        // 最大
        if (null == 统计[j]) {
          统计[j] = r[j];
        } else {
          统计[j] = Math.max(统计[j], r[j]);
        }
      } else {
        // 计数
        if (null == 统计[j]) {
          统计[j] = 0;
        }
        统计[j] += r[j];
        // 补充最小和最大
        const m = j + "/m";
        const M = j + "/M";
        if (null == 统计[m]) {
          统计[m] = r[j];
        } else {
          统计[m] = Math.min(统计[m], r[j]);
        }
        if (null == 统计[M]) {
          统计[M] = r[j];
        } else {
          统计[M] = Math.max(统计[M], r[j]);
        }
      }
    }
  }

  // 包含多少分钟的有效数据
  const 分钟 = Array.from(Object.keys(数据)).length;
  // 计算平均值
  const 平均 = {
    // 每分钟的提交次数
    "c.n": 统计["c.n"] / 分钟,
    // 每分钟的提交次数 (仅汉字输入)
    "c.c": 统计["c.c"] / 分钟,
    // 每分钟的输入字数
    "c.t": 统计["c.t"] / 分钟,

    // 每次提交有几个候选项序号
    "i.n": 统计["i.n"] / 统计["c.c"],
    // 平均候选项序号 (综合)
    "i.c": 统计["i.c"] / 统计["i.n"],
    // 平均候选项序号 (仅一项)
    "i.c1": 统计["i.c1"] / 统计["i.c1_n"],
    // 平均候选项序号 (仅多项)
    "i.cn": 统计["i.cn"] / 统计["i.cn_n"],

    // 拼音切分 响应时间 ms
    "t.p": 统计["t.p"] / 统计["t.p_n"],
    // 拼音转汉字 响应时间 ms
    "t.c": 统计["t.c"] / 统计["t.c_n"],
  };

  // 输出结果
  const o = {
    [d]: {
      分钟,
      统计,
      平均,
      数据,
    },
  };
  // s = 1
  if (1 == s) {
    o[d].数据 = {};
  }
  return o;
}

// 删除旧的统计数据
export async function 清理(_n = 30) {
  // TODO
}

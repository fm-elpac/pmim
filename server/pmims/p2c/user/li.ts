// 列表: ASCII 符号, 扩展
import { ds, du, freq_ascii, 读取多前缀 } from "../../db/mod.ts";
import { d7 } from "./d7.ts";

// 降序排序
function 降序(a: [string, number], b: [string, number]): number {
  return b[1] - a[1];
}

// 降序排序: 最近使用
function 降序2(
  a: [string, string, number],
  b: [string, string, number],
): number {
  // 首先按日期排序
  if (b[1] > a[1]) {
    return 1;
  }
  if (b[1] < a[1]) {
    return -1;
  }
  // 按时间排序
  return b[2] - a[2];
}

// 读取内置数据库扩展输入数据
async function 读取内置扩展0(): Promise<Array<string>> {
  const r = await 读取多前缀(ds(), [["data", "freq_o"]]);
  const o: Array<[string, number]> = [];
  for (const i of r) {
    o.push([
      i[0].at(-1) as string,
      i[1] as number,
    ]);
  }
  // 排序
  o.sort(降序);
  return o.map((x) => x[0]);
}

function 内置ascii符号(): Array<string> {
  const o = ([] as Array<[string, number]>).concat(freq_ascii());
  // 排序
  o.sort(降序);
  return o.map((x) => x[0]);
}

// 用户 ASCII 符号表 最近
async function 读取ascii最近(): Promise<Array<string>> {
  const 最近 = d7();
  const k = 最近.map((x) => ["data_u", "r_ascii", x]);
  const r = await 读取多前缀(du(), k);
  const o: Array<[string, string, number]> = [];
  for (const i of r) {
    o.push([
      i[0].at(-1) as string,
      i[0].at(-2) as string,
      i[1] as number,
    ]);
  }
  // 排序
  o.sort(降序2);
  return o.map((x) => x[0]);
}

// 用户 ASCII 符号表 频率
async function 读取ascii频率(): Promise<Array<string>> {
  const r = await 读取多前缀(du(), [["data_u", "f_ascii"]]);
  const o: Array<[string, number]> = [];
  for (const i of r) {
    o.push([
      i[0].at(-1) as string,
      Number.parseInt(i[1] as bigint as unknown as string),
    ]);
  }
  // 排序
  o.sort(降序);
  return o.map((x) => x[0]);
}

// 用户扩展表 最近
async function 读取扩展最近(o_id: number | string): Promise<Array<string>> {
  const 最近 = d7();
  const k = 最近.map((x) => ["data_u", "r_o", x, o_id]);
  const r = await 读取多前缀(du(), k);
  const o: Array<[string, string, number]> = [];
  for (const i of r) {
    o.push([
      i[0].at(-1) as string,
      i[0].at(-3) as string,
      i[1] as number,
    ]);
  }
  // 排序
  o.sort(降序2);
  return o.map((x) => x[0]);
}

// 用户扩展表 频率
async function 读取扩展频率(o_id: number | string): Promise<Array<string>> {
  const r = await 读取多前缀(du(), [["data_u", "f_o", o_id]]);
  const o: Array<[string, number]> = [];
  for (const i of r) {
    o.push([
      i[0].at(-1) as string,
      Number.parseInt(i[1] as bigint as unknown as string),
    ]);
  }
  // 排序
  o.sort(降序);
  return o.map((x) => x[0]);
}

function 去重(a: Array<string>): Array<string> {
  const s: Set<string> = new Set();
  const o: Array<string> = [];
  for (const i of a) {
    if (s.has(i)) {
      continue;
    }
    s.add(i);
    o.push(i);
  }
  return o;
}

export async function 列出ascii(): Promise<Array<string>> {
  const 内置 = 内置ascii符号();
  const 最近 = await 读取ascii最近();
  const 频率 = await 读取ascii频率();

  const o = ([] as Array<string>).concat(
    // 最近使用最多 8 个
    最近.slice(0, 8),
    频率,
    内置,
  );
  return 去重(o);
}

export async function 列出扩展(o_id: number | string): Promise<Array<string>> {
  let 内置: Array<string> = [];
  if (0 == o_id) {
    内置 = await 读取内置扩展0();
  }
  const 最近 = await 读取扩展最近(o_id);
  const 频率 = await 读取扩展频率(o_id);

  const o = ([] as Array<string>).concat(
    // 最近使用最多 10 个
    最近.slice(0, 10),
    频率,
    内置,
  );
  return 去重(o);
}

export interface 请求参数 {
  // 列表类型
  // + `a`: ASCII 符号
  // + `o`: 扩展
  c: string;
  o_id?: string | number;
}

export interface 返回格式 {
  // 候选项
  c: Array<string>;
  // 剩余页数
  n: number;
}

export async function li(参数: 请求参数): Promise<返回格式> {
  if ("a" == 参数.c) {
    const c = await 列出ascii();
    return { c, n: 0 };
  } else if (("o" == 参数.c) && (null != 参数.o_id)) {
    const c = await 列出扩展(参数.o_id);
    return { c, n: 0 };
  }

  // 无数据
  return { c: [], n: 0 };
}

// 提交: 保存用户的输入
import { 提交文本参数 } from "../../util/mod.ts";
import { u切分 } from "../uu.ts";
import { pin_yin } from "../util.ts";
import { du } from "../../db/mod.ts";
import { 至日期, 至时间 } from "./d7.ts";

// deno-kv: 过期 7 天
function ed7() {
  // 毫秒
  const expireIn = 7 * 24 * 60 * 60 * 1e3;
  return { expireIn };
}

// 获取当前时间
function 当前时间(): [string, number] {
  const d = new Date();
  const 日期 = 至日期(d);
  const 时间 = 至时间(d);
  return [日期, 时间];
}

// 用户数据库: 设置最近使用时间和频率
async function 最近频率(k1: Deno.KvKey, k2: Deno.KvKey, 时间: number) {
  // k1: 最近使用记录
  // k2: 频率
  // 在单个事务中完成
  await du().atomic().set(k1, 时间, ed7()).sum(k2, 1n).commit();
}

// 汉字输入 (拼音)
async function 提交c(t: string, 拼音?: Array<string>) {
  const 字 = u切分(t);
  // 如果长度不匹配, 直接忽略
  if (
    (null == 拼音) || (字.length != 拼音.length) || (拼音.length < 1)
  ) {
    return;
  }

  const [日期, 时间] = 当前时间();
  // 用户词表 (直接字)
  const p = pin_yin(拼音);
  const k1 = ["data_u", "r_d", 日期, p, t];
  const k2 = ["data_u", "f_d", p, t];
  await 最近频率(k1, k2, 时间);

  // 用户字表 (间接字)
  const a = du().atomic();
  for (let i = 0; i < 字.length; i += 1) {
    const k1 = ["data_u", "r_c", 日期, 拼音[i], 字[i]];
    const k2 = ["data_u", "f_c", 拼音[i], 字[i]];
    a.set(k1, 时间, ed7()).sum(k2, 1n);
  }
  await a.commit();
}

// ASCII 符号输入
async function 提交a(t: string) {
  // 只接受长度为 1
  if (1 != t.length) {
    return;
  }

  const [日期, 时间] = 当前时间();
  const k1 = ["data_u", "r_ascii", 日期, t];
  const k2 = ["data_u", "f_ascii", t];
  await 最近频率(k1, k2, 时间);
}

// 扩展输入
async function 提交o(t: string, o_id?: string | number) {
  // o_id 不能为空
  if ((null == o_id) || (t.length < 1)) {
    return;
  }

  const [日期, 时间] = 当前时间();
  const k1 = ["data_u", "r_o", 日期, o_id, t];
  const k2 = ["data_u", "f_o", o_id, t];
  await 最近频率(k1, k2, 时间);
}

// commit 通用入口
export async function 提交(d: 提交文本参数) {
  if ("c" == d.c) {
    await 提交c(d.t, d.pin_yin);
  } else if ("a" == d.c) {
    await 提交a(d.t);
  } else if ("o" == d.c) {
    await 提交o(d.t, d.o_id);
  }
}

export interface 删除参数 {
  // 文本
  t: string;
  // 拼音
  pin_yin: Array<Array<string | Array<string>>>;
}

// 删除记录的某个词
export async function 删除(_参数: 删除参数) {
  // TODO
}

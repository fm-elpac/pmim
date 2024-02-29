// 内置字
import { freq_tgh, pinyin_tgh } from "../../db/mod.ts";
import { 候选项, 来源_内置字 } from "../util.ts";

// 内置字: 单个汉字 (内置数据库)
// 允许同时查询多个拼音
export async function 内置字(拼音: Array<string>): Promise<Array<候选项>> {
  // 拼音数据
  const pt = pinyin_tgh();
  // 汉字频率数据
  const ft = freq_tgh();

  const o: Array<候选项> = [];
  for (const i of 拼音) {
    const c = pt.pc[i];
    if (null != c) {
      for (const j of c) {
        o.push({
          t: j,
          c: BigInt(ft[j]),
          f: 来源_内置字,
        });
      }
    }
  }
  return o;
}

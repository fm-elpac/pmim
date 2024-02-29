// 用户字 (间接字)
import { du, 读取多前缀 } from "../../db/mod.ts";
import { 候选项, 来源_用户字_最近, 来源_用户字_频率 } from "../util.ts";
import { d7 } from "./d7.ts";

export async function 用户字(拼音: Array<string>): Promise<Array<候选项>> {
  const o: Array<候选项> = [];
  // 频率
  const k1 = 拼音.map((x) => ["data_u", "f_c", x]);
  const r1 = await 读取多前缀(du(), k1);
  for (const i of r1) {
    const t = i[0].at(-1) as string;
    const c = i[1] as bigint;
    o.push({
      t,
      c,
      f: 来源_用户字_频率,
    });
  }

  // 最近 7 天的日期
  const 最近 = d7();
  const k2: Array<Deno.KvKey> = [];
  for (const i of 最近) {
    for (const j of 拼音) {
      k2.push(["data_u", "r_c", i, j]);
    }
  }
  const r2 = await 读取多前缀(du(), k2);
  for (const i of r2) {
    const t = i[0].at(-1) as string;
    const d = i[0].at(-3) as string;
    const s = i[1] as number;
    o.push({
      t,
      d,
      s,
      f: 来源_用户字_最近,
    });
  }
  return o;
}

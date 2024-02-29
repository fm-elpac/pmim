// 用户词 (直接字)
import { du, 读取多前缀 } from "../../db/mod.ts";
import {
  pin_yin,
  候选项,
  全拼,
  展开拼音,
  来源_用户词_最近,
  来源_用户词_频率,
} from "../util.ts";
import { d7 } from "./d7.ts";

// 返回: [最近], [频率]
export async function 用户词(
  拼音: 全拼,
): Promise<[Array<候选项>, Array<候选项>]> {
  const p = 展开拼音(拼音).map(pin_yin);

  const o频率: Array<候选项> = [];
  const k1 = p.map((x) => ["data_u", "f_d", x]);
  const r1 = await 读取多前缀(du(), k1);
  for (const i of r1) {
    const t = i[0].at(-1) as string;
    const c = i[1] as bigint;
    o频率.push({
      t,
      c,
      f: 来源_用户词_频率,
    });
  }

  const o最近: Array<候选项> = [];
  // 最近 7 天的日期
  const 最近 = d7();
  const k2: Array<Deno.KvKey> = [];
  for (const i of 最近) {
    for (const j of p) {
      k2.push(["data_u", "r_d", i, j]);
    }
  }
  const r2 = await 读取多前缀(du(), k2);
  for (const i of r2) {
    const t = i[0].at(-1) as string;
    const d = i[0].at(-3) as string;
    const s = i[1] as number;
    o最近.push({
      t,
      d,
      s,
      f: 来源_用户词_最近,
    });
  }
  return [o最近, o频率];
}

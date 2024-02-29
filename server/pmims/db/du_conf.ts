// 用户配置数据保存
import { du } from "./kv.ts";
import { 读取多键1 } from "./util.ts";

// 数据库中的键
const K_CONF = ["data_u", "conf"];

// 读取设置数据
export async function conf_get(键列表: Array<string>) {
  const 键 = 键列表.map((k) => ([] as Array<string>).concat(K_CONF, [k]));
  const 数据 = await 读取多键1(du(), 键);

  const 结果: { [k: string]: unknown } = {};
  for (let i = 0; i < 键列表.length; i += 1) {
    结果[键列表[i]] = 数据[i];
  }
  return 结果;
}

// 保存设置数据
export async function conf_set(数据: { [k: string]: unknown }) {
  const t = du().atomic();

  for (const i of Object.keys(数据)) {
    t.set(([] as Array<string>).concat(K_CONF, [i]), 数据[i]);
  }

  const r = await t.commit();
  if (!r.ok) {
    throw new Error(JSON.stringify(数据));
  }
}

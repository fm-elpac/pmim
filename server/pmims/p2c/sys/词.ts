// 内置词
import { logi } from "../../util/log.ts";
import { ds, pinyin_tgh, 读取多键, 读取多键1 } from "../../db/mod.ts";
import {
  pin_yin,
  PinyinTgh,
  候选项,
  全拼,
  取拼音2,
  来源_内置词,
} from "../util.ts";
import { u切分 } from "../uu.ts";
import { 估计词, 初始化nc } from "./sys_dict_nc.ts";

// 全局配置
const etc = {
  // 词库没有词的频率数据, 根据汉字平均频率估算词的频率
  sys_dict_nc: 0,
};

export async function 内置词初始化() {
  // 检查 sys_dict_nc
  const { value } = await ds().get(["pmim_db", "sys_dict_nc"]);
  if (1 == value) {
    logi(": sys_dict_nc = " + value);
    etc.sys_dict_nc = 1;
  }

  if (1 == etc.sys_dict_nc) {
    await 初始化nc();
  }
}

// 单个汉字的拼音匹配
function 匹配拼音1(
  拼音: string | Array<string>,
  p: Set<string>,
): boolean {
  if (拼音 instanceof Array) {
    for (const i of 拼音) {
      if (p.has(i)) {
        return true;
      }
    }
    return false;
  } else {
    return p.has(拼音);
  }
}

// 检查字符串 (汉字) 是否匹配拼音
function 匹配拼音(拼音: 全拼, t: string, pt: PinyinTgh): boolean {
  // 汉字可能的拼音
  const 字 = u切分(t);
  const p: Array<Set<string>> = 字.map((x) => new Set(pt.cp[x]));

  for (const i of 拼音) {
    // 检查拼音长度: 允许词比拼音短, 但不允许拼音比文字长
    if (i.length < 字.length) {
      continue;
    }

    let 匹配 = true;
    for (let j = 0; j < 字.length; j += 1) {
      if (!匹配拼音1(i[j], p[j])) {
        匹配 = false;
        break;
      }
    }
    if (匹配) {
      return true;
    }
  }
  return false;
}

function 拼接文本组(d: Array<Array<string>>): Array<string> {
  const o = ([] as Array<string>).concat(...d);
  // 去重
  return Array.from(new Set(o));
}

async function 获取频率(词: Array<string>): Promise<Array<number>> {
  if (1 == etc.sys_dict_nc) {
    // 估计词的频率
    const o: Array<number> = [];
    for (const i of 词) {
      o.push(await 估计词(i));
    }
    return o;
  } else {
    // 从内置数据库读取词的频率
    const k3 = 词.map((i) => ["data", "dict", i.slice(0, 2), i]);
    const 频率 = (await 读取多键1(ds(), k3)).map((i) =>
      (null != i) ? i : 0
    ) as Array<number>;
    return 频率;
  }
}

// 内置词: 2 个字及以上 (内置数据库)
// 允许同时查询多个拼音
export async function 内置词(拼音: 全拼): Promise<Array<候选项>> {
  // 拼音数据
  const pt = pinyin_tgh();

  // 获取前缀
  const 前缀拼音 = 取拼音2(拼音).filter((x) => x.length > 1).map(pin_yin);
  const k1 = 前缀拼音.map((i) => ["data", "dict", i]);
  const 前缀 = 拼接文本组(await 读取多键(ds(), k1) as Array<Array<string>>);

  // 获取词
  const k2 = 前缀.map((i) => ["data", "dict", i]);
  const 词1 = 拼接文本组(await 读取多键(ds(), k2) as Array<Array<string>>);
  // 检查拼音
  const 词: Array<string> = [];
  for (const i of 词1) {
    if (匹配拼音(拼音, i, pt)) {
      词.push(i);
    }
  }

  const 频率 = await 获取频率(词);

  const o: Array<候选项> = [];
  for (let i = 0; i < 词.length; i += 1) {
    o.push({
      t: 词[i],

      c: BigInt(频率[i]),
      f: 来源_内置词,
    });
  }
  return o;
}

// sys_dict_nc: 内置词库没有词的频率数据, 根据汉字平均频率估算词的频率
import { ds, freq_tgh } from "../../db/mod.ts";
import { u切分 } from "../uu.ts";

class 字频缓存 {
  _缓存: Record<string, number>;
  // preload/freq_tgh
  _pt: Record<string, number>;

  constructor() {
    this._缓存 = {};
    this._pt = {};
  }

  async 初始化() {
    this._pt = freq_tgh();
  }

  // 获取汉字对应的频率
  async 频率(c: string): Promise<number> {
    if (null != this._pt[c]) {
      return this._pt[c];
    }

    if (null != this._缓存[c]) {
      return this._缓存[c];
    }

    const { value } = await ds().get(["data", "freq_d", c]);
    if (null != value) {
      this._缓存[c] = value as number;
    } else {
      this._缓存[c] = 0;
    }
    return this._缓存[c];
  }
}

const etc = {
  字频: new 字频缓存(),
};

export async function 初始化nc() {
  etc.字频 = new 字频缓存();
  await etc.字频.初始化();
}

export async function 估计词(词: string): Promise<number> {
  const 字 = u切分(词);
  if (字.length < 1) {
    return 0;
  }
  let 计数 = 0;
  for (const i of 字) {
    计数 += await etc.字频.频率(i);
  }
  return Number.parseInt((计数 / 字.length) as unknown as string);
}

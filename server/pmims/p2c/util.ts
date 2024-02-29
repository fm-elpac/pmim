import { u切分 } from "./uu.ts";

// 输入的拼音格式
// 允许同时查询多个拼音
export type 全拼 = Array<Array<string | Array<string>>>;

export type PinyinTgh = {
  pc: Record<string, Array<string>>;
  cp: Record<string, Array<string>>;
};

// 候选项的来源
export const 来源_用户词_最近 = 1;
export const 来源_用户词_频率 = 2;
export const 来源_内置词 = 3;
export const 来源_用户字_最近 = 4;
export const 来源_用户字_频率 = 5;
export const 来源_内置字 = 6;

// 核心的每一部分输出的候选项
export interface 候选项 {
  // 文本
  t: string;

  // 排序数据
  // 频率
  c?: bigint;
  // 日期, 比如 `2024-02-19`
  d?: string;
  // 时间, 当天的秒数 (0 ~ 86400)
  s?: number;
  // 来源
  f?: number;
}

// 去除重复的候选项, 保持原来的顺序不变
export function 去重(d: Array<候选项>): Array<候选项> {
  const o: Array<候选项> = [];
  const t: Set<string> = new Set();
  for (const i of d) {
    if (t.has(i.t) || (u切分(i.t).length < 1)) {
      continue;
    }
    t.add(i.t);
    o.push(i);
  }
  return o;
}

// 限制候选项中词 (字数 >= 2) 的个数
export function 词数限制(d: Array<候选项>, n: number): Array<候选项> {
  const o: Array<候选项> = [];
  let c = 0;
  for (const i of d) {
    if (u切分(i.t).length > 1) {
      if (c >= n) {
        continue;
      }
      o.push(i);
      c += 1;
    } else {
      o.push(i);
    }
  }
  return o;
}

// 排序比较函数 (升序)
export function 升序(
  f: (x: 候选项) => number | bigint | string | undefined | null,
): (a: 候选项, b: 候选项) => number {
  return function (a1: 候选项, b1: 候选项): number {
    const a = f(a1);
    const b = f(b1);
    // 数字比较
    if ((typeof a == "number") || (typeof b == "number")) {
      if (a! > b!) {
        return 1;
      }
      if (a! < b!) {
        return -1;
      }
      return 0;
    }
    // 大整数比较
    if ((typeof a == "bigint") || (typeof b == "bigint")) {
      if (a! > b!) {
        return 1;
      }
      if (a! < b!) {
        return -1;
      }
      return 0;
    }
    // 非数字比较
    if ((null == a) || (null == b)) {
      // 无法比较
      return 0;
    }
    if (a > b) {
      return 1;
    }
    if (a < b) {
      return -1;
    }
    return 0;
  };
}

// 排序比较函数 (降序)
export function 降序(
  f: (x: 候选项) => number | bigint | string | undefined | null,
): (a: 候选项, b: 候选项) => number {
  const 升序1 = 升序(f);
  return function (a, b) {
    return -升序1(a, b);
  };
}

// 获取 pin_yin
export function pin_yin(p: Array<string>): string {
  return p.join("_");
}

// 从输入的多个拼音中提取第 1 个拼音
export function 取拼音1(d: 全拼): Array<string> {
  const o: Array<string> = [];
  for (const i of d) {
    const j = i[0];
    if (j instanceof Array) {
      for (const k of j) {
        o.push(k);
      }
    } else {
      o.push(j);
    }
  }
  // 去重
  return Array.from(new Set(o));
}

// 局部展开拼音 (递归)
function 局部展开1(
  a: Array<string>,
  r: Array<string | Array<string>>,
  添加: (p: Array<string>) => void,
) {
  if (r.length > 0) {
    // 展开第 1 个拼音
    const p = r[0];
    const r1 = r.slice(1);
    if (p instanceof Array) {
      for (const i of p) {
        const b = ([] as Array<string>).concat(a).concat([i]);
        局部展开1(b, r1, 添加);
      }
    } else {
      const b = ([] as Array<string>).concat(a).concat([p]);
      局部展开1(b, r1, 添加);
    }
  } else {
    添加(a);
  }
}

// 局部展开拼音
export function 局部展开(
  d: Array<string | Array<string>>,
): Array<Array<string>> {
  const s: Set<string> = new Set();
  const o: Array<Array<string>> = [];

  function 添加(p: Array<string>) {
    if (p.length < 1) {
      return;
    }
    const k = pin_yin(p);
    // 去重
    if (!s.has(k)) {
      s.add(k);
      o.push(p);
    }
  }

  局部展开1([], d, 添加);
  return o;
}

// 从输入的拼音中提取前 2 个拼音
export function 取拼音2(d: 全拼): Array<Array<string>> {
  const s: Set<string> = new Set();
  const o: Array<Array<string>> = [];
  for (const i of d) {
    const 前 = 局部展开(i.slice(0, 2));
    for (const j of 前) {
      const k = pin_yin(j);
      // 去重
      if (!s.has(k)) {
        s.add(k);
        o.push(j);
      }
    }
  }
  return o;
}

// 展开输入的拼音
export function 展开拼音(d: 全拼): Array<Array<string>> {
  const s: Set<string> = new Set();
  const o: Array<Array<string>> = [];
  for (const i of d) {
    const 展 = 局部展开(i);
    for (const j of 展) {
      const k = pin_yin(j);
      // 去重
      if (!s.has(k)) {
        s.add(k);
        o.push(j);
      }
    }
  }
  return o;
}

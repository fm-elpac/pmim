// js Unicode 工具

// 将字符串按照 unicode code point 切分成单个字符
export function u切分(s: string): Array<string> {
  const o: Array<string> = [];
  let i = 0;
  while (i < s.length) {
    const c = s.codePointAt(i)!;
    o.push(String.fromCodePoint(c));
    if (c > 0xffff) {
      i += 2;
    } else {
      i += 1;
    }
  }
  return o;
}

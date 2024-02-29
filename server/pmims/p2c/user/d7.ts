// 最近 7 天的使用时间

// `Date` 转换成日期 (UTC), 比如 `2024-02-19`
export function 至日期(d: Date): string {
  const t = d.toISOString();
  return t.split("T")[0];
}

// 当前日期 (UTC)
export function 日期(): string {
  return 至日期(new Date());
}

// `Date` 转换成时间 (UTC): 当天的秒数 (0 ~ 86400)
export function 至时间(d: Date): number {
  const h = d.getUTCHours();
  const m = d.getUTCMinutes();
  const s = d.getUTCSeconds();
  return s + m * 60 + h * 60 * 60;
}

// 当前时间 (UTC): 当天的秒数 (0 ~ 86400)
export function 时间(): number {
  return 至时间(new Date());
}

// 生成最近 7 天的日期
export function d7(n = 7): Array<string> {
  const o: Array<string> = [];
  const d = new Date();
  // 毫秒时间戳
  const t = d.getTime();
  // 一天的毫秒数
  const D = 24 * 60 * 60 * 1e3;
  for (let i = -1; i < n; i += 1) {
    d.setTime(t - i * D);
    o.push(至日期(d));
  }
  return o;
}

// 数据库访问工具

// 读取多个键, 转换读取的数据
export async function 读取多键(
  kv: Deno.Kv,
  k: Array<Deno.KvKey>,
): Promise<Array<unknown>> {
  const o = await 读取多键1(kv, k);
  return o.filter((x) => null != x);
}

// 读取多个键, 不过滤数据
export async function 读取多键1(
  kv: Deno.Kv,
  k: Array<Deno.KvKey>,
): Promise<Array<unknown>> {
  // `getMany()` 一次最多读取 10 个键
  const M = 10;
  const o: Array<unknown> = [];
  for (let i = 0; i < k.length; i += M) {
    const k1 = k.slice(i, i + M);
    const r = await kv.getMany(k1);
    for (const j of r) {
      o.push(j.value);
    }
  }
  return o;
}

// 读取多个前缀的所有键
export async function 读取多前缀(
  kv: Deno.Kv,
  k: Array<Deno.KvKey>,
): Promise<Array<[Deno.KvKey, unknown]>> {
  const o: Array<[Deno.KvKey, unknown]> = [];
  for (const i of k) {
    const e = kv.list({ prefix: i });
    for await (const j of e) {
      o.push([j.key, j.value]);
    }
  }
  return o;
}

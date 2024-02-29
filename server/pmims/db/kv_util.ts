// deno-kv 工具

// chunk_set, chunk_get: 用于在 deno-kv 存储更大的数据
// 每个 key 可以存储的最大字节数
const KV_MAX_SIZE = 65536;

// 存储
export async function chunk_set(kv: Deno.Kv, k: Deno.KvKey, data: unknown) {
  // 数据转换成字节
  const b = new TextEncoder().encode(JSON.stringify(data));

  // 每次存储 65536 字节
  let i = 0;
  let rest = b.length;
  let start = 0;
  while (rest > 0) {
    let chunk;
    if (rest > KV_MAX_SIZE) {
      chunk = b.slice(start, start + KV_MAX_SIZE);
    } else {
      chunk = b.slice(start, start + rest);
    }
    start += chunk.length;
    rest -= chunk.length;

    await kv.set(k.concat([i]), chunk);
    i += 1;
  }
}

// 读取
export async function chunk_get(kv: Deno.Kv, k: Deno.KvKey) {
  // 读取所有数据
  const d = [];
  for await (const { key, value } of kv.list({ prefix: k })) {
    d.push([key.at(-1), value]);
  }
  // 排序
  d.sort((a, b) => ((a[0] as number) - (b[0] as number)));
  // 拼接数据
  const 数据 = d.map((x) => x[1]) as Array<Uint8Array>;
  const 总长度 = 数据.reduce((a, i) => a + i.length, 0);
  const o = new Uint8Array(总长度);
  let start = 0;
  for (const i of 数据) {
    o.set(i, start);
    start += i.length;
  }

  // 读取数据
  return JSON.parse(new TextDecoder().decode(o));
}

// 一次设置多个值, 加快写入 deno-kv 的速度
export async function batch_set(kv: Deno.Kv, data: Array<unknown>, n: number) {
  let index = 0;
  let rest = data.length;
  while (rest > 0) {
    const a = kv.atomic();
    let i = 0;
    while ((rest > 0) && (i < n)) {
      const d = data[index] as Array<unknown>;
      const k = d[0] as Deno.KvKey;
      const v = d[1] as unknown;
      a.set(k, v);
      index += 1;
      rest -= 1;
      i += 1;
    }
    await a.commit();
  }
}

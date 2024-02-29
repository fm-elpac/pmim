import { dirname } from "$std/path/dirname.ts";

// 确保目录存在 (类似 mkdir -p)
export async function 建目录(p: string) {
  await Deno.mkdir(p, { recursive: true });
}

// 确保指定文件的上级目录存在
export async function 建上级目录(p: string) {
  await 建目录(dirname(p));
}

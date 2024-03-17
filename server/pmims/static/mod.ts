// 返回静态文件资源
import { extname } from "$std/path/extname.ts";
import { exists } from "$std/fs/exists.ts";
import { contentType } from "$std/media_types/content_type.ts";
import { FreshContext } from "$fresh/server.ts";

export async function 返回文件(ctx: FreshContext, 路径: string): Promise<Response> {
  // 检查文件是否存在
  if (!await exists(路径, { isReadable: true, isFile: true })) {
    return await ctx.renderNotFound();
  }

  const 类型 = contentType(extname(路径)) ?? "application/octet-stream";
  const s = await Deno.stat(路径);

  const 数据 = (await Deno.open(路径)).readable;
  const 响应 = new Response(数据);
  响应.headers.set("content-type", 类型);
  响应.headers.set("content-length", s.size.toString());
  return 响应;
}

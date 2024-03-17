import { join } from "$std/path/join.ts";
import { Handlers } from "$fresh/server.ts";

import { 插件列表1 } from "../../pmims/插件/mod.ts";
import { 返回文件 } from "../../pmims/static/mod.ts";

async function 检查路径(req: Request): Promise<string | undefined> {
  const 请求路径 = decodeURI(new URL(req.url).pathname);

  const p = 请求路径.split("/");
  const 插件id = p.length > 2 ? p[2] : "";
  const 文件路径 = p.slice(3).join("/");

  const 插件 = 插件列表1().find(x => 插件id == x.id);
  if (null != 插件) {
    const 资源 = await Deno.realPath(插件.资源);
    const 路径1 = join(资源, 文件路径);
    // DEBUG
    console.log(请求路径 + " -> " + 路径1);

    let 路径: string;
    try {
      // 本地文件路径
      路径 = await Deno.realPath(路径1);
    } catch (_e) {
      // 忽略错误
      console.log(请求路径 + " -> !");
      return;
    }
    if (!路径.startsWith(资源 + "/")) {
      console.log("访问越界: " + 请求路径 + " -> " + 路径);
      return;
    }
    return 路径;
  }

  // DEBUG
  console.log(请求路径 + " ->");
  return;
}

// /plugin/插件id/文件
// 插件静态资源文件 (static/)
export const handler: Handlers = {
  async GET(req, ctx) {
    const 路径 = await 检查路径(req);
    if (null != 路径) {
      return await 返回文件(ctx, 路径);
    }

    return await ctx.renderNotFound();
  },
};

import { FreshContext } from "$fresh/server.ts";
import { getCookies } from "$std/http/cookie.ts";

import { HH_TOKEN } from "../../pmims/conf.ts";
import { 检查口令 } from "../../pmims/auth/mod.ts";

interface 状态 {
  // TODO
  _todo?: number;
}

// /pmims_api/* header: x-token
// 检查口令 (认证)
export async function handler(
  req: Request,
  ctx: FreshContext<状态>,
) {
  // 首先尝试从 headers 中获取 token
  let token = req.headers.get(HH_TOKEN);
  // 其次从 cookie 中获取 token
  if (null == token) {
    token = getCookies(req.headers)["x_token"];
  }
  // 检查 token 是否正确
  if ((null == token) || (!检查口令(token))) {
    return new Response("HTTP 403", {
      status: 403,
    });
  }

  return await ctx.next();
}

import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";

// POST /pmims_api/user_gc
// 用户数据库: 垃圾清理 (删除 7 天前的最近使用数据)
export const handler: Handlers = {
  async POST(req, _ctx) {
    const _参数 = await req.json();

    // TODO
    return res_json({});
  },
};

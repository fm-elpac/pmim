import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { li, 请求参数 } from "../../pmims/p2c/user/li.ts";

// POST /pmims_api/li
// 列表输入 (用于 Android)
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json() as 请求参数;

    const 结果 = await li(参数);
    return res_json(结果);
  },
};

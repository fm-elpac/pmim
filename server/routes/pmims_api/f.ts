import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { ibus发送消息 } from "../../pmims/ibus/mod.ts";

// POST /pmims_api/f
// 输入反馈
//
// 发送给 ibrus
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json() as number;

    // 发送给 ibrus
    await ibus发送消息("f", 参数);
    return res_json({});
  },
};

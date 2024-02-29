import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { 统计参数, 统计结果 } from "../../pmims/测量/mod.ts";

// POST /pmims_api/m
// 输入测量: 获取统计结果
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json() as 统计参数;
    const 结果 = await 统计结果(参数);
    return res_json(结果);
  },
};

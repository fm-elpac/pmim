import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { 删除, 删除参数 } from "../../pmims/p2c/user/mod.ts";

// POST /pmims_api/user_rm
// 用户数据库: 删除记录的某个词
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json() as 删除参数;
    await 删除(参数);
    return res_json({});
  },
};

import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { 数据库信息 } from "../../pmims/db/mod.ts";

// POST /pmims_api/db
// 获取数据库信息 (ds, du)
export const handler: Handlers = {
  async POST(_req, _ctx) {
    const 结果 = await 数据库信息();
    return res_json(结果);
  },
};

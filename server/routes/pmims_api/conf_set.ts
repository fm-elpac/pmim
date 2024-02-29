import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { conf_set } from "../../pmims/db/du_conf.ts";

// POST /pmims_api/conf_set
// 保存配置键值
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json();
    await conf_set(参数);
    return res_json({});
  },
};

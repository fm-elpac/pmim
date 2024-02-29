import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { conf_get } from "../../pmims/db/du_conf.ts";

// POST /pmims_api/conf_get
// 读取配置键值
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json();
    const 结果 = await conf_get(参数);
    return res_json(结果);
  },
};

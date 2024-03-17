import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { 插件列表 } from "../../pmims/插件/mod.ts";

// POST /pmims_api/pl
// 返回插件列表
export const handler: Handlers = {
  async POST(_req, _ctx) {
    return res_json(插件列表());
  },
};

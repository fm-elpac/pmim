import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { loge } from "../../pmims/util/log.ts";
import { 初始化核心 } from "../../pmims/mod.ts";

// POST /pmims_api/ci
// 核心初始化
export const handler: Handlers = {
  async POST(_req, _ctx) {
    try {
      await 初始化核心();
      // 核心初始化 成功
      return res_json({});
    } catch (e) {
      loge(": 核心初始化错误");
      loge(e);

      // 返回错误信息
      return res_json({
        e: 1,
        t: e,
      });
    }
  },
};

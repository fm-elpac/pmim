import { Handlers } from "$fresh/server.ts";
import { is_android, res_json, 提交文本参数 } from "../../pmims/util/mod.ts";
import { logi } from "../../pmims/util/log.ts";
import { ibus发送消息 } from "../../pmims/ibus/mod.ts";
import { 提交 } from "../../pmims/p2c/user/mod.ts";
import { 测量 } from "../../pmims/测量/mod.ts";

// 检查是否运行在 Android 模式
const a = is_android();
if (a) {
  logi(": android");
}

// POST /pmims_api/commit
// 提交文本 (CommitText)
//
// 发送给 ibus-daemon
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json() as 提交文本参数;
    // 检查 Android 模式
    if (!a) {
      // 发送给 ibrus
      await ibus发送消息("t", 参数.t);
    }

    // 更新用户数据库
    await 提交(参数);
    // 输入测量功能
    await 测量(参数);
    return res_json({});
  },
};

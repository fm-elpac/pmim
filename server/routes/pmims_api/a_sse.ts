import { Handlers } from "$fresh/server.ts";
import { SSE } from "../../pmims/util/sse.ts";

const sse = new SSE();

// ServerSentEvent: /pmims_api/a_sse
// 获取从 Android 输入法框架发来的消息
export const handler: Handlers = {
  async GET(_req, _ctx) {
    return sse.请求();
  },
};

export function 发送消息a(m: unknown) {
  sse.发送消息(m);
}

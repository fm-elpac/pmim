import { Handlers } from "$fresh/server.ts";
import { SSE } from "../../pmims/util/sse.ts";

const sse = new SSE();

// ServerSentEvent: /pmims_api/ibus_sse
// 获取从 ibus 发来的消息
export const handler: Handlers = {
  async GET(_req, _ctx) {
    return sse.请求();
  },
};

export function 发送消息(m: unknown) {
  sse.发送消息(m);
}

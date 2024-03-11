import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { SSE } from "../../pmims/util/sse.ts";

const sse = new SSE();

// ServerSentEvent: /pmims_api/psse
// 消息广播通道
export const handler: Handlers = {
  async GET(_req, _ctx) {
    return sse.请求();
  },

  async POST(req, _ctx) {
    const 参数 = await req.json() as unknown;
    await 发送消息p(参数);
    return res_json({});
  },
};

export function 发送消息p(m: unknown) {
  sse.发送消息(m);
}

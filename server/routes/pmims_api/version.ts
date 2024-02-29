import { FreshContext } from "$fresh/server.ts";
import { P_VERSION } from "../../pmims/conf.ts";

// GET /pmims_api/version
// 获取程序版本信息 (需要口令认证)
export const handler = (_req: Request, _ctx: FreshContext): Response => {
  return new Response(P_VERSION);
};

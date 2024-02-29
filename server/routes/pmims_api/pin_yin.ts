import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { 拼音切分 } from "../../pmims/pin_yin/mod.ts";

export interface 拼音切分参数 {
  // 原始输入
  t: string;
  // (可选) 输入方案
  // 默认为 `2p_zirjma`: 双拼 (自然码)
  p?: string;
}

export interface 返回格式 {
  // 拼音切分结果
  pin_yin: Array<{
    // 已经切分的部分
    p: Array<string | Array<string>>;
    // 剩余无法切分的部分
    r?: string;
  }>;
}

// POST /pmims_api/pin_yin
// 输入法核心: 拼音切分
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json() as 拼音切分参数;

    const 结果 = await 拼音切分(参数.t, 参数.p);
    return res_json(结果);
  },
};

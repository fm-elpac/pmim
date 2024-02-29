import { Handlers } from "$fresh/server.ts";
import { res_json } from "../../pmims/util/mod.ts";
import { 拼音转汉字 } from "../../pmims/p2c/mod.ts";

export interface 请求参数 {
  // 拼音 (全拼)
  // 允许同时请求多个拼音
  pin_yin: Array<Array<string | Array<string>>>;
  // 当前页码 (默认 0)
  n: number;
}

export interface 返回格式 {
  // 候选项
  c: Array<string>;
  // 剩余页数
  n: number;
}

// POST /pmims_api/p2c
// 输入法核心: 拼音转汉字 (候选项)
export const handler: Handlers = {
  async POST(req, _ctx) {
    const 参数 = await req.json() as 请求参数;

    // TODO 处理页码
    const 结果 = await 拼音转汉字(参数.pin_yin);

    return res_json({
      c: 结果,
      n: 0,
    });
  },
};

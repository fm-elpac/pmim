import { ENV_PMIMS_ANDROID, ENV_PMIMS_DEBUG } from "../conf.ts";

export { 建上级目录, 建目录 } from "./fs.ts";

// 返回 json 响应
export function res_json(数据: unknown) {
  return new Response(JSON.stringify(数据), {
    headers: {
      "Content-Type": "application/json",
    },
  });
}

// 判断是否运行在 Android 模式
export function is_android(): boolean {
  return (1 == Deno.env.get(ENV_PMIMS_ANDROID) as unknown as number);
}

// 是否开启调试模式
export function is_debug(): boolean {
  return (1 == Deno.env.get(ENV_PMIMS_DEBUG) as unknown as number);
}

export interface 提交文本参数 {
  // 要输入的文本
  t: string;
  // (可选) 对应的 原始输入
  i?: string;
  // (可选) 对应的 拼音
  pin_yin?: Array<string>;
  // (可选) 输入类型
  c?: string;
  // 具体的输入类型:
  // + `c`: 汉字输入 (拼音)
  // + `a`: ASCII 符号输入
  // + `o`: 扩展输入
  o_id?: string | number;

  // 输入测量功能
  // 候选项序号 (从 0 开始)
  m_i?: Array<number>;
  // 核心: 拼音切分 响应时间 (ms)
  mt_pin_yin?: Array<number>;
  // 核心: 拼音转汉字 响应时间 (ms)
  mt_p2c?: Array<number>;
}

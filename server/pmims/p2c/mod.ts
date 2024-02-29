// (p2c) 拼音核心: 拼音转汉字
import { is_debug } from "../util/mod.ts";
import { 全拼 } from "./util.ts";
import { 混合 } from "./mix.ts";

const d = is_debug();

export async function 拼音转汉字(拼音: 全拼): Promise<Array<string>> {
  if (d) {
    console.log(拼音);
  }

  const 结果 = await 混合(拼音);
  //console.log(结果);

  // 转换候选项
  return 结果.map((x) => x.t);
}

export async function 初始化() {
  // TODO
}

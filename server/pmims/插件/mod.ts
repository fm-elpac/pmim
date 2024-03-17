// pmim 插件系统
import { logi } from "../util/log.ts";
import { 内置插件目录, 加载插件, 插件项, 用户插件目录 } from "./util.ts";

// 全局数据
const etc: {
  插件列表: Array<插件项>;
} = {
  插件列表: [],
};

export async function 初始化插件() {
  const 内置目录 = 内置插件目录();
  logi(": 内置插件目录 " + 内置目录);

  etc.插件列表 = await 加载插件(内置目录, 1);

  const 用户目录 = 用户插件目录();
  logi(": 用户插件目录 " + 用户目录);
  etc.插件列表 = etc.插件列表.concat(
    await 加载插件(用户目录, 0),
  );

  logi(": 插件加载完毕 (" + etc.插件列表.length + ")");
}

export function 插件列表(): Array<插件项> {
  return JSON.parse(JSON.stringify(etc.插件列表)) as Array<插件项>;
}

// 用于 routes/plugin/_middleware.ts
export function 插件列表1(): Array<插件项> {
  return etc.插件列表;
}

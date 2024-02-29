// 混合方法
import { 候选项, 全拼, 升序, 去重, 取拼音1, 词数限制, 降序 } from "./util.ts";
import { 内置字, 内置词 } from "./sys/mod.ts";
import { 用户字, 用户词 } from "./user/mod.ts";
import { u切分 } from "./uu.ts";

// 词数限制 (最大个数)
const 最多用户词最近 = 10;
const 最多用户词频率 = 30;
const 最多内置词 = 20;
// 总词数限制
const 最多词 = 30;

function 排序(a: 候选项, b: 候选项): number {
  // 最终输出排序
  // (1) 长度
  const o1 = 降序((x) => u切分(x.t).length)(a, b);
  if (0 != o1) {
    return o1;
  }
  // (2) 来源
  const o2 = 升序((x) => x.f)(a, b);
  if (0 != o2) {
    return o2;
  }
  // (3) 时间/频率
  const o3 = 降序((x) => x.d)(a, b);
  if (0 != o3) {
    return o3;
  }
  const o4 = 降序((x) => x.s)(a, b);
  if (0 != o4) {
    return o4;
  }
  const o5 = 降序((x) => x.c)(a, b);
  if (0 != o5) {
    return o5;
  }
  // (4) 文本
  const o6 = 升序((x) => x.t)(a, b);
  return o6;
}

export async function 混合(拼音: 全拼): Promise<Array<候选项>> {
  const p = 取拼音1(拼音);

  // 异步并发查询
  const [
    候选1,
    候选2,
    候选3,
    [候选4, 候选5],
  ] = await Promise.all([
    // 内置数据库
    内置字(p),
    内置词(拼音),
    // 用户数据库
    用户字(p),
    用户词(拼音),
  ]);

  // 按频率排序
  候选1.sort(降序((x) => x.c));
  候选2.sort(降序((x) => x.c));
  // 用户数据排序
  候选4.sort(排序);
  候选5.sort(排序);

  // 应用词数限制
  const 候选 = ([] as Array<候选项>).concat(
    候选4.slice(0, 最多用户词最近),
    候选5.slice(0, 最多用户词频率),
    候选2.slice(0, 最多内置词),
    候选3,
    候选1,
  );

  // 最终输出步骤:
  // (1) 排序
  候选.sort(排序);
  // (2) 去重
  const o1 = 去重(候选);
  // (3) 总词数限制
  return 词数限制(o1, 最多词);
}

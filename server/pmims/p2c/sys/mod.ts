export { 内置字 } from "./字.ts";
export { 内置词 } from "./词.ts";

import { 内置词初始化 } from "./词.ts";

export async function 内置初始化() {
  await 内置词初始化();
}

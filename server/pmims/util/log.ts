// console.log 日志
import { P_LOG } from "../conf.ts";

export function logi(t: string) {
  console.log(P_LOG + t);
}

export function loge(t: string) {
  console.error(P_LOG + t);
}

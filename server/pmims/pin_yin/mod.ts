// (pin_yin) 拼音核心: 拼音切分
import { p2_zirjma, 预加载 } from "../db/mod.ts";
import { conf_get } from "../db/du_conf.ts";

const 配置: {
  双拼名称?: string;
  双拼表: Record<string, string | Array<string>>;
} = {
  双拼名称: "2p_zirjma",
  双拼表: {},
};

// p2: 双拼表
function 双拼切分(t: string, p2: Record<string, string | Array<string>>) {
  const 结果: Array<string | Array<string>> = [];
  let 剩余 = t;
  while (剩余.length >= 2) {
    const 双拼 = 剩余.slice(0, 2);

    const 全拼 = p2[双拼];
    if (null != 全拼) {
      结果.push(全拼);
    } else {
      // 无效的双拼
      break;
    }
    剩余 = 剩余.slice(2);
  }

  const 结果1: {
    p: Array<string | Array<string>>;
    r?: string;
  } = {
    p: 结果,
  };
  if (剩余.length > 0) {
    结果1.r = 剩余;
  }
  return {
    pin_yin: [结果1],
  };
}

// 双拼(自然码)
function c_zirjma(t: string) {
  return 双拼切分(t, p2_zirjma());
}

// 用户自定义的双拼表
function c_user(t: string) {
  return 双拼切分(t, 配置.双拼表);
}

export async function 拼音切分(t: string, p?: string) {
  if (null == p) {
    p = 配置.双拼名称;
  }

  switch (p) {
    case "2p_user":
      return c_user(t);
    case "2p_zirjma":
    default:
      return c_zirjma(t);
  }
}

export async function 初始化() {
  await 预加载();

  // 加载配置
  const C_2PB = "c.2pb";
  const C_2PB_USER = "c.2pb.user";

  const c = await conf_get([C_2PB, C_2PB_USER]);
  if (null != c[C_2PB]) {
    配置.双拼名称 = c[C_2PB] as string;
  }
  if (null != c[C_2PB_USER]) {
    配置.双拼表 = c[C_2PB_USER] as Record<string, string | Array<string>>;
  }
}

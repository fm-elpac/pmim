// 预加载数据
import { ds } from "./kv.ts";
import { chunk_get } from "./kv_util.ts";

interface 数据库版本信息 {
  pmim: string;
  deno_version: {
    deno: string;
    v8: string;
    typescript: string;
  };
  _last_update: string;
}

// 存储预加载的数据
const 数据: {
  // 内置数据库版本信息
  version: string;
  // 内置数据库版本信息 (2)
  v?: 数据库版本信息;
  // 拼音数据 (kTGHZ2013)
  pinyin_tgh?: {
    pc: Record<string, Array<string>>;
    cp: Record<string, Array<string>>;
  };
  // 汉字频率数据 (tgh8105)
  freq_tgh?: Record<string, number>;
  // ASCII 符号频率数据
  freq_ascii?: Array<[string, number]>;
  // 双拼表 (自然码)
  p2_zirjma?: Record<string, string | Array<string>>;
} = {
  version: "",
};

// 初始化
export async function 预加载() {
  {
    const { value } = await ds().get(["pmim_db", "version"]);
    数据.version = value as string;
  }
  {
    const { value } = await ds().get(["pmim_db", "v"]);
    数据.v = value as 数据库版本信息;
  }

  {
    const value = await chunk_get(ds(), ["data", "preload", "pinyin_tgh"]);
    if (null == value) {
      throw new Error("预加载 拼音数据 失败");
    }
    数据.pinyin_tgh = value as {
      pc: Record<string, Array<string>>;
      cp: Record<string, Array<string>>;
    };
  }
  {
    const { value } = await ds().get(["data", "preload", "freq_tgh"]);
    if (null == value) {
      throw new Error("预加载 汉字频率 失败");
    }
    数据.freq_tgh = value as Record<string, number>;
  }
  {
    const { value } = await ds().get(["data", "preload", "freq_ascii"]);
    if (null == value) {
      throw new Error("预加载 ASCII 符号频率 失败");
    }
    数据.freq_ascii = value as Array<[string, number]>;
  }
  {
    const { value } = await ds().get(["data", "preload", "2p_zirjma"]);
    if (null == value) {
      throw new Error("预加载 双拼表(自然码) 失败");
    }
    数据.p2_zirjma = value as Record<string, string | Array<string>>;
  }
}

// 数据获取函数

export function db_version() {
  return {
    version: 数据.version,
    v: 数据.v!,
  };
}

export function pinyin_tgh() {
  return 数据.pinyin_tgh!;
}

export function freq_tgh() {
  return 数据.freq_tgh!;
}

export function freq_ascii() {
  return 数据.freq_ascii!;
}

export function p2_zirjma() {
  return 数据.p2_zirjma!;
}

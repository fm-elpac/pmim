import { join } from "$std/path/join.ts";
import { exists } from "$std/fs/exists.ts";

import { logi } from "../util/log.ts";
import {
  ENV_HOME,
  ENV_PMIMS_PLUGIN,
  ENV_PMIMS_PLUGIN_0,
  FP_PLUGIN,
  FP_PLUGIN_0,
  FP_PLUGIN_STATIC,
  PLUGIN_PMIM_VERSION,
  PLUGIN_PMIM_VERSION_K,
  PLUGIN_PMIMP_JSON,
} from "../conf.ts";

export function 内置插件目录(): string {
  const d = Deno.env.get(ENV_PMIMS_PLUGIN_0);
  if (null != d) {
    return d;
  }
  return join(import.meta.dirname!, FP_PLUGIN_0);
}

export function 用户插件目录(): string {
  const d = Deno.env.get(ENV_PMIMS_PLUGIN);
  if (null != d) {
    return d;
  }
  return join(Deno.env.get(ENV_HOME)!, FP_PLUGIN);
}

// 插件描述文件 `pmimp.json`
export interface 插件描述 {
  pmim_version: string;
  插件信息: {
    名称: string;
    描述: string;
    版本: string;
    URL: string;
  };
  默认启用?: number;

  双拼方案?: string;
  键盘布局?: string;

  皮肤?: {
    入口: string;
    名称: string;
    能力: Array<string>;
  };

  服务?: {
    入口: string;
  };
}

// 加载的插件数据
export interface 插件项 {
  // 插件 id
  id: string;
  // pmimp.json 文件路径
  描述文件: string;
  // 插件根目录
  目录: string;
  // 插件静态资源 (static) 目录
  资源: string;
  // 是否为内置插件 (内置 = 1)
  内置?: number;

  描述: 插件描述;
}

export async function 加载插件描述(
  路径: string,
): Promise<插件描述 | undefined> {
  logi(": 加载插件 " + 路径);
  if (!await exists(路径, { isReadable: true, isFile: true })) {
    logi(": 文件不存在, 忽略这个插件");
    return;
  }

  let 描述: 插件描述 | undefined;

  try {
    const t = await Deno.readTextFile(路径);
    描述 = JSON.parse(t) as 插件描述;
  } catch (e) {
    logi(": 加载插件描述文件失败, 忽略这个插件");
    console.error(e);
  }

  if ((null == 描述) || (描述[PLUGIN_PMIM_VERSION_K] != PLUGIN_PMIM_VERSION)) {
    logi(": 插件格式版本不正确 (!= " + PLUGIN_PMIM_VERSION + "), 忽略这个插件");
    return;
  }

  return 描述;
}

export async function 加载插件(目录: string, 内置 = 0): Promise<Array<插件项>> {
  const o: Array<插件项> = [];

  if (
    !await exists(目录, { isReadable: true, isDirectory: true })
  ) {
    logi(": 目录不存在, 忽略");
    return o;
  }

  for await (const i of Deno.readDir(目录)) {
    // 只处理下级目录
    if (i.isDirectory) {
      // 插件根目录
      const 根目录 = join(目录, i.name);
      const 描述文件 = join(根目录, PLUGIN_PMIMP_JSON);

      try {
        const 描述 = await 加载插件描述(描述文件);
        if (null != 描述) {
          const 插件: 插件项 = {
            id: i.name,
            描述文件,
            目录: 根目录,
            资源: join(根目录, FP_PLUGIN_STATIC),
            内置,
            描述,
          };
          o.push(插件);
        }
      } catch (e) {
        // 如果出错, 忽略这个插件
        console.error(e);
      }
    }
  }
  return o;
}

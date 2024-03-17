# pmims_api 接口文档

HTTP 请求路径: `/pmims_api/`

## 开放接口

无需认证 (token).

- GET `/version`

  获取程序版本.

  示例:

  ```
  > curl http://127.0.0.1:20200/version
  pmim-server v0.1.0-a1
  ```

- GET `/time`

  获取当前时间.

  示例:

  ```
  > curl http://127.0.0.1:20200/time
  2024-02-17T08:05:38.360Z
  ```

## 认证接口

认证 (token) 文件位于: `${XDG_RUNTIME_DIR}/pmim/server_token`

```
> cat /run/user/1000/pmim/server_token
+763i3Kr9rzwqFhPOEiZ9+cn9/r0j96LdMVwwb1hOuQ=
```

- GET `/pmims_api/version`

  获取程序版本 (用于测试 token).

  示例:

  ```
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) http://127.0.0.1:20200/pmims_api/version
  pmim-server v0.1.0-a1
  ```

- ServerSentEvent `/pmims_api/ibus_sse`

  获取 ibus 发来的 (按键) 消息 (SSE).

  页面代码示例:

  ```js
  // 设置 cookie, 用于 SSE 认证
  document.cookie = "x_token=" + token + ";path=/pmims_api";

  const s = new EventSource("/pmims_api/ibus_sse", {
    withCredentials: true,
  });

  s.onmessage = (e) => {
    console.log(JSON.parse(e.data));
  };
  ```

  TODO

- POST `/pmims_api/f`

  输入反馈 (发送给 ibrus).

  请求参数:

  - `0`: 禁用输入反馈 (默认)

    由 ibrus 自行决定退出拼音模式.

  - `1`: 启用输入反馈

    ibrus 不会自动退出拼音模式 (除了 ESC 强制退出). 发送 `2` 退出拼音模式.

  - `2`: 重置输入状态

  - `3`: 禁用按键捕获 (英文输入模式)

  - `4`: 禁用 退格键

  - `5`: 启用 退格键

  示例:

  ```
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) -X POST http://127.0.0.1:20200/pmims_api/f -d 1
  {}
  ```

- POST `/pmims_api/commit`

  提交文本 (CommitText). 发送给 ibus-daemon.

  请求参数:

  ```ts
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
  ```

  示例:

  ```
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) -X POST http://127.0.0.1:20200/pmims_api/commit -d '{"t": "测试"}'
  {}
  ```

- POST `/pmims_api/pin_yin`

  核心: 拼音切分

  请求参数:

  ```ts
  export interface 拼音切分参数 {
    // 原始输入
    t: string;
    // (可选) 输入方案
    // 默认为 `2p_zirjma`: 双拼 (自然码)
    p?: string;
  }
  ```

  返回结果:

  ```ts
  export interface 返回格式 {
    // 拼音切分结果
    pin_yin: Array<{
      // 已经切分的部分
      p: Array<string | Array<string>>;
      // 剩余无法切分的部分
      r?: string;
    }>;
  }
  ```

  示例 1:

  ```
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) -X POST http://127.0.0.1:20200/pmims_api/pin_yin -d '{"t": "zirjma"}'
  {"pin_yin":[{"p":["zi","ran","ma"]}]}
  ```

  示例 2:

  ```
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) -X POST http://127.0.0.1:20200/pmims_api/pin_yin -d '{"t": "ceuiddd"}'
  {"pin_yin":[{"p":["ce","shi"],"r":"ddd"}]}
  ```

- POST `/pmims_api/p2c`

  核心: 拼音转汉字 (候选项)

  请求参数:

  ```ts
  export interface 请求参数 {
    // 拼音 (全拼)
    // 允许同时请求多个拼音
    pin_yin: Array<Array<string | Array<string>>>;
    // 当前页码 (默认 0)
    n: number;
  }
  ```

  返回结果:

  ```ts
  export interface 返回格式 {
    // 候选项
    c: Array<string>;
    // 剩余页数
    n: number;
  }
  ```

  示例:

  ```
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) -X POST http://127.0.0.1:20200/pmims_api/p2c -d '{"pin_yin": [["xiao", "miao"]], "n": 0}'
  {"c":["小喵","小苗","小庙","小","笑","消","萧","晓","校","肖","效","潇","霄","孝","筱","啸","逍","嚣","宵","销","箫","削","哮","骁","枭","绡","硝","淆","哓","魈","鸮","崤","翛","虓","蛸","枵","皛","涍","洨","猇","敩","滧","蟏","𫍲"],"n":0}
  ```

- POST `/pmims_api/ci`

  核心初始化 (重新加载配置).

  示例:

  ```
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) -X POST http://127.0.0.1:20200/pmims_api/ci
  {}
  ```

- POST `/pmims_api/db`

  获取数据库信息 (ds, du)

  示例:

  ```json
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) -X POST http://127.0.0.1:20200/pmims_api/db | jq '.'
    % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
  100   592  100   592    0     0  16154      0 --:--:-- --:--:-- --:--:-- 16444
  {
    "内置数据库文件": "/home/s2/.config/pmim/pmim_sys.db",
    "用户数据库文件": "/home/s2/.config/pmim/pmim_user.db",
    "du": {
      "version": "pmim_user_db version 0.1.0",
      "v": {
        "pmim": "pmim-server v0.1.0-a1",
        "deno_version": {
          "deno": "1.40.4",
          "v8": "12.1.285.6",
          "typescript": "5.3.3"
        },
        "_last_update": "2024-02-18T18:37:01.096Z"
      },
      "u_ulid": "01HRNCQVGKVECTFZBHKBZD81XD"
    },
    "ds": {
      "version": "pmim_sys_db version 0.1.0",
      "v": {
        "pmim": "pmim version 0.1.0",
        "deno_version": {
          "deno": "1.41.2",
          "v8": "12.1.285.27",
          "typescript": "5.3.3"
        },
        "n": "胖喵拼音内置数据库 (6w)",
        "_last_update": "2024-03-11T00:37:23.225Z"
      }
    }
  }
  ```

- POST `/pmims_api/pl`

  返回插件列表.

  示例:

  ```json
  > curl -H x-token:(cat /run/user/1000/pmim/server_token) -X POST http://127.0.0.1:20200/pmims_api/pl | jq '.'
    % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                  Dload  Upload   Total   Spent    Left  Speed
  100  5772  100  5772    0     0   842k      0 --:--:-- --:--:-- --:--:--  939k
  [
    {
      "id": "pmim-2p-gbt34947",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-2p-gbt34947/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-2p-gbt34947",
      "资源": "/home/s2/pmim/server/plugin/pmim-2p-gbt34947/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "双拼方案: 国家标准双拼 (GB/T 34947-2017)",
          "描述": "胖喵拼音内置双拼方案 (2p_gbt34947)",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "双拼方案": "双拼.json"
      }
    },
    {
      "id": "pmim-2p-ms",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-2p-ms/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-2p-ms",
      "资源": "/home/s2/pmim/server/plugin/pmim-2p-ms/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "双拼方案: 微软双拼",
          "描述": "胖喵拼音内置双拼方案 (2p_ms)",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "双拼方案": "双拼.json"
      }
    },
    {
      "id": "pmim-2p-sogou",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-2p-sogou/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-2p-sogou",
      "资源": "/home/s2/pmim/server/plugin/pmim-2p-sogou/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "双拼方案: 搜狗双拼",
          "描述": "胖喵拼音内置双拼方案 (2p_sogou)",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "双拼方案": "双拼.json"
      }
    },
    {
      "id": "pmim-2p-xnhe",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-2p-xnhe/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-2p-xnhe",
      "资源": "/home/s2/pmim/server/plugin/pmim-2p-xnhe/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "双拼方案: 小鹤双拼",
          "描述": "胖喵拼音内置双拼方案 (2p_xnhe)",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "双拼方案": "双拼.json"
      }
    },
    {
      "id": "pmim-2p-zirjma",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-2p-zirjma/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-2p-zirjma",
      "资源": "/home/s2/pmim/server/plugin/pmim-2p-zirjma/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "双拼方案: 自然码",
          "描述": "胖喵拼音内置双拼方案 (2p_zirjma)",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "双拼方案": "双拼.json"
      }
    },
    {
      "id": "pmim-kbl-abcd7109",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-kbl-abcd7109/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-kbl-abcd7109",
      "资源": "/home/s2/pmim/server/plugin/pmim-kbl-abcd7109/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "键盘布局: abcd7109",
          "描述": "胖喵拼音内置键盘布局",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "键盘布局": "布局.json"
      }
    },
    {
      "id": "pmim-kbl-dvorak",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-kbl-dvorak/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-kbl-dvorak",
      "资源": "/home/s2/pmim/server/plugin/pmim-kbl-dvorak/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "键盘布局: dvorak",
          "描述": "胖喵拼音内置键盘布局",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "键盘布局": "布局.json"
      }
    },
    {
      "id": "pmim-kbl-qwerty",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-kbl-qwerty/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-kbl-qwerty",
      "资源": "/home/s2/pmim/server/plugin/pmim-kbl-qwerty/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "键盘布局: qwerty",
          "描述": "胖喵拼音内置键盘布局",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "键盘布局": "布局.json"
      }
    },
    {
      "id": "pmim-uis-bl",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-uis-bl/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-uis-bl",
      "资源": "/home/s2/pmim/server/plugin/pmim-uis-bl/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "冰蓝 (胖喵拼音内置皮肤)",
          "描述": "重水里超光速粒子发出的微光 ~",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "皮肤": {
          "入口": "main.js",
          "名称": "pmim-uis-bl",
          "能力": [
            "im0",
            "im1",
            "im2"
          ]
        }
      }
    },
    {
      "id": "pmim-uis-nc",
      "描述文件": "/home/s2/pmim/server/plugin/pmim-uis-nc/pmimp.json",
      "目录": "/home/s2/pmim/server/plugin/pmim-uis-nc",
      "资源": "/home/s2/pmim/server/plugin/pmim-uis-nc/static",
      "内置": 1,
      "描述": {
        "pmim_version": "0.1.0",
        "插件信息": {
          "名称": "暖橙 (胖喵拼音内置皮肤)",
          "描述": "冬日里的一缕温暖 ~~",
          "版本": "0.1.0",
          "URL": "https://github.com/fm-elpac/pmim-ibus"
        },
        "默认启用": 1,
        "皮肤": {
          "入口": "main.js",
          "名称": "pmim-uis-nc",
          "能力": [
            "im0",
            "im1",
            "im2",
            "conf"
          ]
        }
      }
    }
  ]
  ```

## 输入测量

输入测量 (统计) 功能.

- POST `/pmims_api/m`

  获取统计结果.

  ```ts
  export interface 统计参数 {
    // 统计的日期, 比如 `2024-02-25`
    d: string;

    // s = 1: 不输出每分钟的原始数据
    s?: number;
  }
  ```

TODO

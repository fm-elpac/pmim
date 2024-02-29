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

## 输入测量

输入测量 (统计) 功能.

TODO

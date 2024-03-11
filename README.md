# 胖喵拼音: 可信任的跨平台开源输入法

<https://github.com/fm-elpac/pmim>

![CI](https://github.com/fm-elpac/pmim/actions/workflows/ci.yml/badge.svg)

镜像:

- <https://bitbucket.org/fm-elpac/pmim/>
- <https://codeberg.org/fm-elpac/pmim>
- <https://notabug.org/fm-elpac/pmim>
- <https://gitlab.com/fm-elpac/pmim>

---

**建议**: 每个用户在使用之前, 读一遍本输入法的源代码.
(本输入法的源代码一共只有几千行, 且大部分为 JavaScript. )

- GNU/Linux 平台 (ibus): <https://github.com/fm-elpac/pmim-ibus>

- Android 平台: <https://github.com/fm-elpac/pmim-apk>

## 相关代码仓库

| 名称      | 说明                            | 主要编程语言 (框架/库)    | LICENSE            |
| :-------- | :------------------------------ | :------------------------ | :----------------- |
| pmim      | (本仓库) 拼音核心 (pmim-server) | TypeScript (deno / fresh) | `GPL-3.0-or-later` |
| pmim-data | 数据 (字频, 词库, 工具等)       | python, js (deno)         | `CC-BY-SA-4.0`     |
| pmim-ibus | GNU/Linux 应用 (ibus)           | js (electron, vue)        | `GPL-3.0-or-later` |
| pmim-apk  | Android 应用                    | kotlin (webview)          | `GPL-3.0-or-later` |

## 长期计划

计划以后做, 但是最近可能不会开始做的事情. (只是草稿, 随时可能修改)

- `pmim-ibus`: 支持 shift 键切换 中英文输入模式

- `pmim-data-greatdict`: 300 万大词库. 数据来自 `pyim-greatdict`
  <https://github.com/tumashu/pyim-greatdict>

- 编译 Android deno: 目前没有编译成功 (替代 proot)

- `ibrus --ibusd`: 使用 rust 重写 (替代) ibus-daemon (librush).

- `pmim-win`: Windows 远程输入模块 (rust).

TODO

## LICENSE

GNU General Public License v3.0 or later (SPDX Identifier: `GPL-3.0-or-later`)

<https://spdx.org/licenses/GPL-3.0-or-later.html>

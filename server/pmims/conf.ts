// 程序版本号
export const P_VERSION = "pmim-server v0.1.4";
// 日志前缀
export const P_LOG = "pmims";

// 默认监听端口: http://127.0.0.1:20200
export const 默认端口 = 20200;
// 监听地址
export const 监听地址 = "127.0.0.1";

// 环境变量名称
export const ENV_XDG_RUNTIME_DIR = "XDG_RUNTIME_DIR";
export const ENV_HOME = "HOME";
export const ENV_PMIMS_PORT = "PMIMS_PORT";
export const ENV_PMIMS_ANDROID = "PMIMS_ANDROID";
export const ENV_PMIMS_DB = "PMIMS_DB";
export const ENV_PMIMS_US = "PMIMS_US";
export const ENV_PMIMS_DEBUG = "PMIMS_DEBUG";
export const ENV_PMIMS_PLUGIN_0 = "PMIMS_PLUGIN_0";
export const ENV_PMIMS_PLUGIN = "PMIMS_PLUGIN";

// 口令 http 头的名称
export const HH_TOKEN = "x-token";

// 口令文件路径: ${XDG_RUNTIME_DIR}/pmim/server_token
export const FP_TOKEN = "/pmim/server_token";
// 运行端口存储位置: ${XDG_RUNTIME_DIR}/pmim/port
export const FP_PORT = "/pmim/port";
// unix socket 文件路径: ${XDG_RUNTIME_DIR}/pmim/us
export const FP_PMIM_US = "/pmim/us";

// 数据库文件位置: ~/.config/pmim/pmim_sys.db
export const FP_DB_SYS = "/.config/pmim/pmim_sys.db";
export const FP_DB_USER = "/.config/pmim/pmim_user.db";
export const FP_DB_SYS_1 = "pmim_sys.db";
export const FP_DB_USER_1 = "pmim_user.db";
// 内置 (系统) 数据库版本
export const DB_SYS_VERSION = "pmim_sys_db version 0.1.0";
// 用户数据库版本
export const DB_USER_VERSION = "pmim_user_db version 0.1.0";

// 内置插件默认目录: server/plugin
export const FP_PLUGIN_0 = "../../plugin";
// 用户插件默认目录: ~/.config/pmim/plugin
export const FP_PLUGIN = "/.config/pmim/plugin";
// 插件描述文件名
export const PLUGIN_PMIMP_JSON = "pmimp.json";
// 插件静态资源目录
export const FP_PLUGIN_STATIC = "static";
// 插件描述文件, 格式版本
export const PLUGIN_PMIM_VERSION_K = "pmim_version";
export const PLUGIN_PMIM_VERSION = "0.1.0";

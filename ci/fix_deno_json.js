// ci/fix_deno_json.js
//
// 在执行 `deno vendor` 之后, 从 `deno.json` 中删除 `imports`
// 命令行示例:
// > deno run --allow-read --allow-write ci/fix_deno_json.js server/deno.json

const 文件 = Deno.args[0];
const 内容 = JSON.parse(await Deno.readTextFile(文件));

Reflect.deleteProperty(内容, "imports");

const 文本 = JSON.stringify(内容, "", "  ") + "\n";
await Deno.writeTextFile(文件, 文本);

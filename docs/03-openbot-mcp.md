# 03 — 把 Muse 掛成 OpenBot MCP server

讓 OpenBot 的 **Muse MCP** 成為一支 stdio 工具 server，理論上想注入「每個 agent」。

## 設定

在 OpenBot 的管理面把 Muse 加為 MCP server：

- **transport**：`stdio`
- **command**：`muse-mcp-wrapper.sh`（本 SOP 提供的 wrapper，把入口清乾淨）
- **workingDirectory**：Muse-Chat-MCP 目錄

`muse-mcp-wrapper.sh`：

```sh
#!/bin/sh
# 停用內建 OpenAI shim，避免撞 8787 headroom proxy；用 headless 省記憶體
export MUSE_SHIM_PORT=0
export MUSE_HEADLESS=1
exec node /<abs>/Muse-Chat-MCP/muse-server.mjs "$@"
```

註冊後 `enabled=true`。OpenBot 端測：`Muse MCP server → status:ready, toolCount 11`（muse_status / muse_login / muse_new_chat / muse_chat / muse_read_last / muse_chats / muse_open_chat / muse_read_chat / muse_media / muse_dump_dom / muse_close）。

## ⚠️ 最大的坑：工具能不能真的注入 agent 執行時

這是本 SOP 踩過最久的一關。**事實：**
- MCP server 註冊對、`enabled=true`、`test` 回 `ready`、11 工具都列得出來（server 端 100% 健康）。
- 但**該 agent 的執行時工具目錄常常根本搜不到 muse 來源**、直接打回「not a known tool」。
- 這是 **OpenBot 把 MCP 工具注入 agent runtime 的那一段沒生效**，不是 server 壞。

**所以：** 別在 agent 層硬等注入。如果工具沒進你執行時，最快的正解是跳過 MCP，直接走**內聯 CLI**（[docs/04](04-inline-cli.md)）——`muse-inline.mjs` 在你自己的 turn 內 `spawn muse-server.mjs`(stdio) → 送 → 拍照 → 完事，完全不依賴 OpenBot 的工具注入。你要 Muse 就一句話。

## 想確認 server 端是否健康（不等注入）

可以直接對 Muse MCP 做 stdio handshake 確認工具全在：

```bash
node -e "require('node:child_process').spawn('node',['muse-server.mjs'],{stdio:['pipe','pipe','pipe'],env:{...process.env,MUSE_SHIM_PORT:'0',MUSE_HEADLESS:'1'},cwd:'/<abs>/Muse-Chat-MCP'})"
# 用 /tmp probe 送 initialize → tools/list，回 11 支 = server 通
```

（信任順序：**真工具回覆 > 你親手測 > agent 自述**。agent 說「我有 muse」不可信，看它真的能呼叫。）
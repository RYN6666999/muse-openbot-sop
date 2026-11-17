# 02 — 工具本體：Muse-Chat-MCP（第三方）

核心工具是 **duclm1x1/Muse-Chat-MCP**——一支用 Playwright 駕你已登入的真實 Chrome，把 Muse 網頁版包成「MCP server」和「OpenAI 相容端點」的小程式。它是別人的 repo，**本 SOP 不重造輪子，只 clone 使用**。

## Clone + 準備

```bash
git clone https://github.com/duclm1x1/Muse-Chat-MCP
cd Muse-Chat-MCP
npm install          # 安裝 Playwright + 依賴
```

## 首次登入（必做，只一次）

先用「有頭」瀏覽器開一支登入，把登入狀態存進 `.muse-profile`：

```bash
MUSE_HEADLESS=0 node muse-server.mjs --serve-only
# 開 http://127.0.0.1:8787 或依官方 README，登入 muse.ai
```

登入一次後，`.muse-profile` 會長存你登入，後續 **headless 免重登**。

## 驗證（外部真值，不是聽它說）

```bash
# 列得出 model + 真回話，才代表引擎通
curl http://127.0.0.1:8787/v1/models
```

## 本目錄檔案快速參考

| 檔 | 作用 |
|---|---|
| `muse-server.mjs` | stdio MCP server（`muse_status/chats/chat/media/dump_dom…`） |
| `muse-openai-shim.mjs` | OpenAI 相容 HTTP 端點（`/v1/chat/completions`） |
| `muse-driver.mjs` / `muse-cli.mjs` | CLI／驅動層 |
| `muse-mcp-wrapper.sh` | OpenBot 用 wrapper（見 docs/03） |
| `muse-inline.mjs` | 本 SOP 新增的「內聯一句話」入口（見 docs/04） |

## 關鍵環境變數

- `MUSE_HEADLESS=1`：無頭跑（省記憶體、少 GPU 子程序）。**接頭務必開**。
- `MUSE_PROFILE_DIR`：預設 `./.muse-profile`（你的登入）。
- `MUSE_SHIM_PORT`：shim 監聽埠。

## ⚠️ 別走的三條死路（詳見 docs/08）

- 別把 muse-local 設成 opencode 的 model／引擎（灌爆網頁窗口）。
- 別開著一堆孤兒 Chrome（每次請求可能留 7+ 支，記得 `pkill -f "Muse-Chat-MCP/.muse-profile"`）。
- 別用 8787 撞埠（常被本機其他服務佔用）。

下一步：要掛進 OpenBot 看 [docs/03](03-openbot-mcp.md)；只要自己一句話白嫖看 [docs/04](04-inline-cli.md)。
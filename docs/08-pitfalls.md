# 08 — 全部坑與死路（事先知道，能省你幾小時）

每條都是實際踩過、實測確認的。照做即可避開。

## 死路一（最痛）：把 Muse 設成 opencode 的 model／引擎

- **症狀**：employee 選了 `muse-local-spark` 當引擎 → provider-error → 或瀏覽器窗口直接被整包 context「灌爆」卡死 → 連一個字都不回。
- **根因**：opencode 是 agent runner，每次 request 把整套 system prompt＋工具表＋歷史（實測可到 **66 萬字**）一次倒進 muse-local shim → shim 把這整包餵進真實瀏覽器 Muse 網頁版 → 窗口塞爆。
- **根因補充**：Muse 有瀏覽器實體，長 context 會實打實塞爆網頁；不是「服務商設錯」。
- **判法**：看引擎 log 最後一筆 `promptChars` 是否超大（66 萬那級）。
- **正解**：**永遠不要**把 local 引擎設為執行器 model。員工引擎用正常 deepseek（腦＋拍照），Muse 只透過 MCP/CLI 當免費發電機、一次一個小 prompt。
- **已移除**：`muse-local` provider（含 `muse-local-spark`）已從執行 config 刪除，別再設回去。

## 死路二：養一支「獨立員工 agent」來當 Muse 的門面

- **症狀**：員工 agent 自己的 deepseek loop 常 `OpenCode 停止響應`，而且手上的 Muse MCP 工具常常沒注入。
- **根因**：多開一支「自帶引擎的獨立 agent」等於多一條會死的鏈，對吃額度零貢獻；真正白嫖的機制只有「駕瀏覽器送一句話」。
- **正解**：**內聯**——任何一個穩定 agent 在自己的 turn 裡直接 `node muse-inline.mjs`（docs/04），不分家。員工那層砍掉或閒置。

## 死路三：深信「MCP server ready = agent 一定能叫」

- **症狀**：`list_mcp_servers` 顯示 Muse `enabled=true`、`test` 回 ready、11 工具都列得出（server 100% 健康）——但該 agent 執行時工具目錄**搜不到 muse 來源**、直打回「not a known tool」。
- **根因**：OpenBot「把 MCP 工具注入 agent runtime」的那一段偶發沒生效，**不是 server 壞**。
- **正解**：別在 agent 層硬等注入。繞過 MCP 直接走內聯 CLI（docs/04）；要確認 server 健康就自己做 stdio handshake（docs/03 尾段）。

## 坑 1：孤兒 Chrome 一堆（「chrome 號量很恐怖」的主來源）

- 一次請求就可能留 **7+ 支** `--user-data-dir=.muse-profile` 的 Chrome（headless 也照留）。這不是大 context 才有。
- **抓**：`ps aux | grep -i "muse-profile"`
- **清**：`pkill -f "Muse-Chat-MCP/.muse-profile"`，再殺測試 shim。
- 登入存 `.muse-profile` 資料夾，清 process 不會掉登入。
- **正解**：用 `muse-inline.mjs`（完事自動清）或測完必清。

## 坑 2：埠衝突（8787 被占）

- Muse shim 預設 8787，常被本機其他 OpenAI 相容服務（如 headroom proxy）占用 → EADDRINUSE。
- **正解**：獨立埠（如 `MUSE_SHIM_PORT=8788` 或內聯 CLI 用 0 停 shim）。

## 坑 3：模型/設定路由錯——撞名或沒補執行器

- **model id 撞名**：內建付費端點占用的 id（如 `muse-spark-1.3`）別重用，自訂新名。
- **Base URL 大小寫**：shim 只聽小寫 `/v1`；存 `/V1` 回 404 → OpenBot 自動跳 fallback，看起來「白嫖沒生效」。存完回頭看設定檔確認小寫。
- **執行器不認 provider**：只註冊 Custom provider 不夠，要連同 `opencode.json` 一起補，否則 provider-error。
- **Custom provider 無 reasoning effort**：設 effort 會回「has no reasoning effort」錯誤，省略該欄位。

## 坑 4：agent 自述不可信

- agent 說「我跑 deepseek」／「我有 muse」**都不算數**。
- 判引擎上線：看**引擎 log 有無請求**。判瀏覽器回話：**親手駕一下看回覆文字**。判注入成：看它**真的能呼叫並拿到回覆**。

## 坑 5：測試中途改員工 model/config

- 員工正在跑時 `update_profile` 改 model 會 pendingRuntime，看它 turn 卡死、`lastActivityAt` 凍結。
- **正解**：先改好設定 → 再派測試活。改完沒動它還卡，才抽換引擎驗。

## 區域／條款

- 開通要 VPN（美/加/日/星），日常台灣 IP 直接連。帳號綁註冊當下地域、不符官方條款，風險自評。
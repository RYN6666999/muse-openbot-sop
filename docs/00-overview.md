# 00 — 全景架構：從 VPN 到 OpenBot 一次看懂

一張圖看完整條路：

```
[VPN] 開通美國免費 Muse 帳號（只此一次）
   │  台灣 IP 日常使用不需 VPN
   ▼
[真實 Chrome 瀏覽器] 已登入 muse.ai（登入存在 .muse-profile，headless 免重登）
   │  Muse 聊天沒有公開 API，只有加密 WebSocket (Noise)，無法直接寫 client
   │  → 所以「駕真實瀏覽器」= 讓 Muse 網頁自己跑加密，我們只送/讀
   ▼
[Muse-Chat-MCP 工具]（duclm1x1 第三方 repo）
   ├─ muse-server.mjs   → stdio MCP server（11 工具）
   ├─ muse-openai-shim.mjs → OpenAI 相容 HTTP 端點（可當自訂 provider）
   └─ muse-inline.mjs   → 一句話內聯白嫖（本 SOP 新增，最簡）
   ▼
[OpenBot 端二種吃法]
   ├─ MCP server（Muse, stdio）→ 11 工具，想注入每顆 agent
   └─ 內聯 CLI → 總管自己一個 turn 直接用，不需第二顆腦
```

## 關鍵概念（改念不踩坑）

- **Muse 沒有公開 API**：它聊天走 `wss://hatch.metaaivm.com/v1/noise`，是 X25519+HKDF+AES-GCM+Ed25519 的 Noise 加密協議。與其重寫協議（難、易壞），不如**開一支你已登入的真實 Chrome**，讓 Muse 網頁自己跑加密，我們只負責「打字進 composer、讀渲染出來的回覆」。
- **Muse = 工具，不是引擎**：它適合「單一粗活、小 prompt」。它不適合當 AI agent 的 model——那會灌爆。見 docs/05。
- **免費的真相**：美國帳號免費額度 + 台灣 IP 可直接連。付費路（muse-sub-proxy）不需要。
- **登入 vs 使用是兩個階段**：開通時要 VPN；之後長存 `.muse-profile`，台灣直連即可、headless 免重登。

## 本 SOP 不包含

- Muse-Chat-MCP 工具本體（去 clone 原 repo，作者 duclm1x1）。
- 你專案私有的密碼／帳號（存於你本機，別進 git）。
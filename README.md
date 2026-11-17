# muse-openbot-sop

**把 Meta Muse（muse.ai「Hatch」）白嫖成 OpenBot 免費打工機的完整 SOP＋踩坑紀錄。**

別人不要再走彎路：本 repo 把「從 VPN 開美國帳號 → 駕真實瀏覽器 → 掛進 OpenBot 當 MCP 工具／一句話內聯白嫖」整段驗證過的路，寫成一張照抄就能走的地圖，並附上**所有我們踩過、事先知道就能省的坑**。

> 目標：零成本用 Muse 的免費額度。Muse 是**工具（瀏覽器白嫖的發電機）**，不是引擎。

---

## 一句話結論

Muse 聊天只有加密 WebSocket、沒有公開 API，所以要靠**駕你已登入的真實 Chrome**（Playwright）去送 prompt、讀回覆。OpenBot 端有二種吃法：

| 吃法 | 做法 | 適合 |
|---|---|---|
| **內聯 CLI（推薦，最穩）** | `node muse-inline.mjs "句子"`，一個 turn 裡送＋拍照一次完成 | 總管自己直接用，不需第二顆腦 |
| **OpenBot MCP server** | 掛 Muse 當 stdio MCP，11 工具注入「每個 agent」 | 想讓所有 agent 都能叫 Muse 時 |

**絕對不要**：把 Muse 設成 opencode 的 model／引擎——opencode 每次 request 帶 60~70 萬字，會把瀏覽器網頁窗口灌爆。詳見 [docs/08-pitfalls.md](docs/08-pitfalls.md)。

---

## 快開始（3 步，全程約 30 分鐘）

1. **開美國免費帳號**（只有首次開通要 VPN，日常台灣 IP 可直接用）— [docs/01-vpn-account.md](docs/01-vpn-account.md)
2. **抓工具＋登入**：`git clone https://github.com/duclm1x1/Muse-Chat-MCP`（第三方），跑一次 leading 登入存 `.muse-profile` — [docs/02-root-tool.md](docs/02-root-tool.md)
3. **選吃法**：
   - 只要自己用 → [docs/04-inline-cli.md](docs/04-inline-cli.md)（`muse-inline.mjs` 直接放進工具目錄）
   - 要掛進整個 OpenBot → [docs/03-openbot-mcp.md](docs/03-openbot-mcp.md)

---

## 目錄

| 文件 | 內容 |
|---|---|
| [docs/00-overview.md](docs/00-overview.md) | 全景架構：從 VPN 到 OpenBot 一次看懂 |
| [docs/01-vpn-account.md](docs/01-vpn-account.md) | VPN 開通美國帳號（首次 only） |
| [docs/02-root-tool.md](docs/02-root-tool.md) | 工具本體 Muse-Chat-MCP：clone、登入、headless |
| [docs/03-openbot-mcp.md](docs/03-openbot-mcp.md) | 把 Muse 掛成 OpenBot MCP server |
| [docs/04-inline-cli.md](docs/04-inline-cli.md) | 推薦：內聯 CLI 一句話白嫖 |
| [docs/05-architecture.md](docs/05-architecture.md) | 為什麼這樣架：引擎 vs 工具的判斷 |
| [docs/06-alternatives.md](docs/06-alternatives.md) | 同性質 repo 比較（別人怎麼做、差在哪） |
| [docs/08-pitfalls.md](docs/08-pitfalls.md) | 全部坑與死路（事先知道能省幾小時） |

License: [MIT](LICENSE)（獨立的整合 SOP 文件，不含 Muse-Chat-MCP 工具本體，該工具屬「duclm1x1/Muse-Chat-MCP」）。
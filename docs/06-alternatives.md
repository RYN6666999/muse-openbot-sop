# 06 — 同性質 repo 比較

開發前先看別人已經做過什麼，避免重造。以下都是「把 Muse 接出來給別的 agent／工具用」的公開方案（截至本 SOP 撰寫）。

| repo | 做法 | 差異點 |
|---|---|---|
| **duclm1x1/Muse-Chat-MCP**（本 SOP 用的） | Playwright 駕你已登入的真實 Chrome，包成 MCP server + OpenAI 相容 shim | MCP + OpenAI 雙門；有 media/session 支援；本 SOP 的根基 |
| **kleprevost/muse-mcp** | Python 薄 transport：直接 reuse 上游 muse-cli 的 auth、WebSocket Noice gateway、歷史 | **不走瀏覽器**，直連 Muse 私有 WebSocket；薄、快，但極依賴沒版號的內部 API（Muse 一改就壞） |
| **Nbill27/muse-opencode** | Local OpenAI 相容 HTTP relay，駕自家 muse.ai Web chat（Chrome DevTools Protocol） | 專給 opencode；概念與 Muse-Chat-MCP 同 |
| **manishkumar1601/muse-ai-api** | 把 Muse AI Web 轉成 OpenAI & Anthropic 相容 API | 純 HTTP API + Anthropic compat |
| **merlow1337/Muse-Chat-MCP** | ＝ duclm1x1 同名（同工具，常見 clone 環） | 同上 |

## 取捨

- **要走「穩」**：選 duclm1x1/Muse-Chat-MCP（駕真實瀏覽器，Muse 前端改了靠瀏覽器 CSS 大致還撐得住，不容易一夕全壞）。
- **要走「快/薄」**：kleprevost/muse-mcp（直連私有 WS，不用開 Chrome，但脆弱）——前提是你能接受它可能隨 Muse 前端改版斷線。
- **想複用 OpenAI SDK**：任一有 OpenAI-compat 的（duclm1x1 / manishkumar1601）都行。
- **OpenBot 整合體位**：本 SOP 結論是「內聯 CLI + MCP 二選一」，都不要當引擎（docs/05、docs/08）。

## 本 SOP 相對於這些 repo 的價值

以上 repo 都是「**工具本體**」；本 repo 是「**整合 SOP**」——含 VPN 開通、AMP 驗證、OpenBot 掛法、內聯 CLI、以及所有踩過的死路與坑。工具 repo 不會教你怎麼接 OpenBot 不灌爆、怎麼避免孤兒 Chrome、怎麼判注入成不成——這些在 docs/08。
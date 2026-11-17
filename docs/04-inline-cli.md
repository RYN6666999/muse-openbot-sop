# 04 — 推薦：內聯 CLI 一句話白嫖

這是本 SOP 的**最終正解、最穩、最省事**的做法。把 `muse-inline.mjs` 放進 Muse-Chat-MCP 目錄，然後：

```bash
cd /Users/ryan/tools/Muse-Chat-MCP
node muse-inline.mjs "用一句話回答：你是誰？"
# → 我是 Muse，你的個人助理，由 Muse Spark 驅動。
```

## 它內部做了什麼（一個 turn 一次完成）

1. `spawn muse-server.mjs` —— 走 stdio 起一支 MCP server（`MUSE_SHIM_PORT=0` 停 shim 避免撞埠、`MUSE_HEADLESS=1` 省記憶體）。
2. `muse_chat`（new_thread）—— 把句子送進瀏覽器，吃 Muse 額度。
3. `muse_read_last` —— 「拍照」，讀瀏覽器真渲染出來的回覆（不是聽工具自述）。
4. kill + 清孤兒 Chrome —— 完事即清，不殘留 process。

```js
// muse-inline.mjs（完整可執行）
import { spawn } from 'node:child_process';
const prompt = process.argv[2];
if (!prompt) { console.error('用法: node muse-inline.mjs "<一句話>"'); process.exit(1); }
const child = spawn('/<abs>/.hermes/node/bin/node', ['muse-server.mjs'], {
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, MUSE_SHIM_PORT: '0', MUSE_HEADLESS: process.env.MUSE_HEADLESS || '1' }
});
let pending = null;
function ask(id, method, params) {
  return new Promise((res) => { pending = { res, id };
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params: params || {} }) + '\n'); });
}
let buf = '';
child.stdout.on('data', (d) => { buf += d; let i;
  while ((i = buf.indexOf('\n')) >= 0) { const ln = buf.slice(0, i); buf = buf.slice(i + 1);
    if (!ln.trim()) continue; try { const m = JSON.parse(ln); if (pending && m.id === pending.id) { pending.res(m); pending = null; } } catch (e) {} } });
const txt = (m) => { try { return JSON.parse(m.result?.content?.[0]?.text || '{}'); } catch { return m.result?.content?.[0]?.text?.slice(0, 2000) ?? m; } };
await ask(1, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'inline', version: '1' } });
await ask(2, 'notifications/initialized');
await ask(3, 'tools/call', { name: 'muse_chat', arguments: { prompt, new_thread: true } });
const last = await ask(4, 'tools/call', { name: 'muse_read_last', arguments: {} });
const r = txt(last);
console.log((typeof r === 'object' && r.reply) ? r.reply : JSON.stringify(r));
child.kill(); process.exit(0);
```

## 為什麼它比「養一支員工／等 MCP 注入」好

- **沒有第二顆腦**：不需要另開一個 agent loop。你（任何一個穩定 agent）在自己的 turn 裡一下就白嫖完。
- **不依賴 OpenBot 的工具注入**：繞過「MCP server ready 但工具沒進 agent」的坑。
- **不會灌爆**：一次一個小 prompt，不走 opencode 的 60~70 萬字 context。
- **headless + 完事清**：不殘留孤兒 Chrome。

## 實測證據

- `node muse-inline.mjs "用一句話回答：你是誰？"` → 「我是 Muse，你的個人助理，由 Muse Spark 驅動。」
- 完整跑完孤兒 Chrome = 0。

## 進階

- 想有頭看畫面：`MUSE_HEADLESS=0 node muse-inline.mjs "..."`。
- 要更大批次或換 thread：改 `muse_chat` 的 `new_thread`／`chat` 參數即可。
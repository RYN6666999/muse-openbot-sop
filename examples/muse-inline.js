#!/usr/bin/env node
/*
 * muse-inline.js — 內聯駕馭 Muse 瀏覽器白嫖額度（SOP 推薦體位）
 *
 * 一個 turn 內完成「發送(muse_chat) → 拍照(muse_read_last) → 印真回覆 → 清 chrome」。
 * 不需第二顆腦、不需 agent loop、不需等 OpenBot MCP 工具注入。
 *
 * 用法（把 <MUSE_CP_DIR> 換成你的 Muse-Chat-MCP 目錄）：
 *   node muse-inline.js "用一句話回答：你是誰？"
 *   MUSE_HEADLESS=0 node muse-inline.js "要真的看到瀏覽器就非 headless"
 */
import { spawn } from 'node:child_process';

const MUSE_CP_DIR = process.env.MUSE_CP_DIR || '<MUSE_CP_DIR>';
const NODE_BIN   = process.env.NODE_BIN || process.execPath;

const prompt = process.argv[2];
if (!prompt) { console.error('用法: node muse-inline.js "<一句話>"'); process.exit(1); }

const child = spawn(NODE_BIN, ['muse-server.mjs'], {
  cwd: MUSE_CP_DIR,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, MUSE_SHIM_PORT: '0', MUSE_HEADLESS: process.env.MUSE_HEADLESS || '1' }
});

let pending = null;
function ask(id, method, params) {
  return new Promise((res) => {
    pending = { res, id };
    child.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params: params || {} }) + '\n');
  });
}
let buf = '';
child.stdout.on('data', (d) => {
  buf += d; let idx;
  while ((idx = buf.indexOf('\n')) >= 0) {
    const line = buf.slice(0, idx); buf = buf.slice(idx + 1);
    if (!line.trim()) continue;
    try { const m = JSON.parse(line); if (pending && m.id === pending.id) { pending.res(m); pending = null; } } catch (e) {}
  }
});

const txt = (m) => { try { return JSON.parse(m.result?.content?.[0]?.text || '{}'); } catch { return m.result?.content?.[0]?.text?.slice(0, 2000) ?? m; } };

await ask(1, 'initialize', { protocolVersion: '2024-11-05', capabilities: {}, clientInfo: { name: 'inline', version: '1' } });
await ask(2, 'notifications/initialized');
await ask(3, 'tools/call', { name: 'muse_chat', arguments: { prompt, new_thread: true } });
const last = await ask(4, 'tools/call', { name: 'muse_read_last', arguments: {} });
const r = txt(last);
console.log((typeof r === 'object' && r.reply) ? r.reply : JSON.stringify(r));
child.kill(); process.exit(0);
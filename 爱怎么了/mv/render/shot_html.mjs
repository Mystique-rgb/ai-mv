// Screenshot any local HTML page from the lemo server root (no window.render needed).
// node render/shot_html.mjs <url-path> <out.jpg> [--size 1080x1920] [--wait 800]
import { chromium } from 'playwright-core';
const SERVEMOD = 'file:///D:/deepseek%E5%B7%A5%E4%BD%9C%E5%8C%BA/lemo-opuscar/core/render/serve.mjs';
const { serve } = await import(SERVEMOD);
import path from 'path'; import { fileURLToPath } from 'url';
const ROOT = process.env.LEMO_ROOT || 'D:/deepseek工作区/lemo-opuscar';
const args = process.argv.slice(2);
const size = (() => { const i = args.indexOf('--size'); return i < 0 ? [1080, 1920] : args.splice(i, 2)[1].split('x').map(Number); })();
const wait = (() => { const i = args.indexOf('--wait'); return i < 0 ? 800 : +args.splice(i, 2)[1]; })();
const [url, out] = args;
const { server, port } = await serve(ROOT);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 1 });
page.on('console', m => console.log('[page]', m.text().slice(0, 400)));
page.on('pageerror', e => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${port}${url}`);
await page.waitForTimeout(wait);
await page.screenshot({ path: out, type: 'jpeg', quality: 92 });
console.log('saved', out);
await browser.close(); server.close();

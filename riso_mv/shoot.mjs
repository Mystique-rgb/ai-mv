// shoot.mjs —— 把 cover.html 截成图
//   node shoot.mjs --v=A,B --size=1920x1080 --out=out/cover
// 出图为 CSS 尺寸的 2 倍（1920x1080 → 3840x2160），JPEG q95。
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const CHROMES = [args.chrome, process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found: pass --chrome=<path>'); process.exit(1); }

const [W, H] = String(args.size || '1920x1080').split('x').map(Number);
const variants = String(args.v || 'A').split(',').map(s => s.trim()).filter(Boolean);
const outDir = resolve(args.out || 'out/cover');
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });

for (const v of variants) {
  const url = pathToFileURL(resolve('cover.html')).href + `?v=${v}&w=${W}&h=${H}`;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 250));
  const file = resolve(outDir, `cover_${v}_${W}x${H}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 95 });
  console.log('wrote ' + file);
}
await browser.close();

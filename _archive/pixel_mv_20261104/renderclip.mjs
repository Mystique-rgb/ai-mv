// renderclip.mjs — 渲染测试片为 PNG 帧序列，供 ffmpeg 合成
//   用法：node renderclip.mjs --out=out/testclip --fps=24 --dur=10
//   320×180 内部分辨率，最后 ffmpeg 放大到 1920×1080（nearest，保持硬边像素）。
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
if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const FPS = Number(args.fps || 24);
const DUR = Number(args.dur || 10);
const N = Math.round(FPS * DUR);
const outDir = resolve(args.out || 'out/testclip');
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width: 320, height: 180, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve('clip.html')).href, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });

const t0 = Date.now();
for (let i = 0; i < N; i++) {
  const t = i / FPS;
  await page.evaluate(tt => window.renderFrame(tt), t);
  const f = String(i).padStart(4, '0');
  await page.screenshot({ path: resolve(outDir, `f${f}.png`), type: 'png' });
  if (i % 24 === 0) console.log(`frame ${i}/${N}  (${((Date.now() - t0) / (i + 1)).toFixed(1)}ms/frame)`);
}
await browser.close();
console.log(`done: ${N} frames -> ${outDir}`);

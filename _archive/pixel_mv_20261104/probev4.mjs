// probev4.mjs — v4 预览抽帧（probe.mjs 的加强版：支持给舞台追加查询参数）
//   node probev4.mjs --spec=v4a --t=7.8,11.2 --out=out/v4
//   node probev4.mjs --spec=v4a --q=notext --t=7.8 --out=out/v4n
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

const times = String(args.t || '2.5').split(',').map(Number);
const outDir = resolve(args.out || 'out/v4');
mkdirSync(outDir, { recursive: true });
const page_ = resolve(args.page || 'stage.html');
const SP = String(args.spec || 'v4a');
const Q = args.q ? '&' + args.q : '';
const tag = String(args.tag || '');

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
await page.goto(pathToFileURL(page_).href + '?spec=' + SP + Q, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });

for (const t of times) {
  await page.evaluate(tt => window.renderFrame(tt), t);
  const f = resolve(outDir, `${tag}${tag ? '_' : ''}st_${t}.png`);
  await page.screenshot({ path: f, type: 'png' });
  console.log('wrote ' + f);
}
await browser.close();

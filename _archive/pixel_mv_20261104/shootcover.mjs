// shootcover.mjs — 截封面图
//   node shootcover.mjs --v=A,B,C --w=1920 --h=1080 --out=out/cover
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const CHROMES = [args.chrome, process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const W = Number(args.w || 1920), H = Number(args.h || 1080);
const variants = String(args.v || 'A').split(',').map(s => s.trim()).filter(Boolean);
const outDir = resolve(args.out || 'out/cover');
mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: 2 });
for (const v of variants) {
  await page.goto(pathToFileURL(resolve('cover.html')).href + `?v=${v}&w=${W}&h=${H}`, { waitUntil: 'load' });
  await page.waitForFunction('window.__ready === true', { timeout: 30000 });
  await new Promise(r => setTimeout(r, 300));
  const file = resolve(outDir, `cover_${v}.jpg`);
  await page.screenshot({ path: file, type: 'jpeg', quality: 95 });
  console.log('wrote ' + file);
}
await browser.close();

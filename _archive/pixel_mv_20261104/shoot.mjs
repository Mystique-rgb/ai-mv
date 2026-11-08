// shoot.mjs —— 把任意 html 截成图（整页或固定视口）
//   node shoot.mjs --page=rigsheet.html --w=1600 --h=1000 --out=out/rig/sheet.png --full
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const CHROMES = [args.chrome, process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found: pass --chrome=<path>'); process.exit(1); }

const W = Number(args.w || 1600), H = Number(args.h || 1000);
const pagePath = resolve(args.page || 'rigsheet.html');
const out = resolve(args.out || 'out/rig/sheet.png');
mkdirSync(dirname(out), { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none',
         '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: W, height: H, deviceScaleFactor: Number(args.dsf || 2) });
await page.goto(pathToFileURL(pagePath).href, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });
await new Promise(r => setTimeout(r, 200));
await page.screenshot({ path: out, fullPage: !!args.full, type: 'png' });
const hh = await page.evaluate(() => document.body.scrollHeight);
console.log('wrote ' + out + '  pageHeight=' + hh);
await browser.close();

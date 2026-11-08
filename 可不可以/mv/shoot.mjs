// shoot.mjs —— 把任意 html 截成图（固定视口）
//   node shoot.mjs --page=tools/rigtest.html --w=1920 --h=1080 --out=out/rig.png
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));

const W = Number(args.w || 1920), H = Number(args.h || 1080);
const pagePath = resolve(args.page || 'tools/rigtest.html');
const out = resolve(args.out || 'out/shot.png');
mkdirSync(dirname(out), { recursive: true });

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none',
    '--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
await page.setViewport({ width: W, height: H, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(pagePath).href, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });
await new Promise(r => setTimeout(r, 120));
await page.screenshot({ path: out, type: 'png' });
console.log('wrote ' + out);
await browser.close();

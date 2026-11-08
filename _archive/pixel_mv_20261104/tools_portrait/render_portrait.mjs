// render_portrait.mjs — 用 Chromium canvas 把 portrait.html 渲成 PNG
// 用: node tools_portrait/render_portrait.mjs
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROMES = [process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const OUT = process.argv[2] || 'D:/workbuddy-音乐mv知识库/02.输出区/2026-11-05-训练-代码渲染人物/主角-代码渲染-金边雨夜-v1.png';

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
await page.goto(pathToFileURL(resolve('tools_portrait/portrait.html')).href, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });
await page.screenshot({ path: OUT, type: 'png' });
console.log('saved:', OUT);
await browser.close();

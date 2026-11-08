// render_spec.mjs — 把任意 spec 渲成单帧 PNG（审图 / 裁定用）
// 用: node tools_portrait/render_spec.mjs <spec名> <时间秒> <输出路径>
import puppeteer from 'puppeteer-core';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const SPEC = process.argv[2] || 'ys_bed';
const T = Number(process.argv[3] || 0.4);
const OUT = process.argv[4] || `D:/workbuddy-音乐mv知识库/02.输出区/2026-11-05-训练-代码渲染场景/${SPEC}-t${T}.png`;

const CHROMES = [process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none',
         '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
await page.goto(pathToFileURL(resolve('stage.html')).href + '?spec=' + SPEC, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });
await page.evaluate(tt => window.renderFrame(tt), T);
await page.screenshot({ path: OUT, type: 'png' });
console.log('saved:', OUT);
await browser.close();

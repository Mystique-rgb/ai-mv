// render_hero.mjs — 渲染 chibi 主角资产图（纯代码，无 AI 生图）
// 用: node tools_portrait/render_hero.mjs
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const OUT = 'D:/workbuddy-音乐mv知识库/02.输出区/2026-11-05-训练-代码渲染人物';
mkdirSync(OUT, { recursive: true });

const CHROMES = [process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const JOBS = [
  { mode: 'girl', k: 7, file: '主角-女-01-立绘-透明底.png' },
  { mode: 'boy',  k: 7, file: '主角-男-01-立绘-透明底.png' },
  { mode: 'duo',  k: 6, file: '主角-情侣-立绘-透明底.png' },
  { mode: 'card', k: 6, file: '主角-情侣-回忆那年夏天-拍立得.png' },
];

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none',
         '--force-color-profile=srgb', '--hide-scrollbars'],
});

for (const j of JOBS) {
  const page = await browser.newPage();
  const LW = j.mode === 'card' ? 320 : (j.mode === 'duo' ? 200 : 160);
  const LH = j.mode === 'card' ? 180 : 160;
  await page.setViewport({ width: LW * j.k, height: LH * j.k, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.log('PAGEERROR:', j.mode, e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', j.mode, m.text()); });
  const url = pathToFileURL(resolve('tools_portrait/hero/hero.html')).href +
    `?mode=${j.mode}&k=${j.k}`;
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction('window.__done === true', { timeout: 20000 });
  await page.screenshot({ path: `${OUT}/${j.file}`, type: 'png', omitBackground: true });
  console.log('saved:', j.file, `${LW * j.k}x${LH * j.k}`);
  await page.close();
}

await browser.close();

// tools/probe_v2.mjs — 批量渲染指定秒的单帧做质检
//   node tools/probe_v2.mjs 0.5,2,5,17  out/probe_v2
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = process.argv[2] || '0.5,17,72.5,102,107,117.5,127,187';
const OUTDIR = resolve(process.argv[3] || 'out/probe_v2');
mkdirSync(OUTDIR, { recursive: true });
const CHROMES = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'];
const CHROME = CHROMES.find(p => existsSync(p));
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none',
    '--force-color-profile=srgb', '--hide-scrollbars', '--no-proxy-server'],
});
const page = await browser.newPage();
page.on('pageerror', e => console.error('PAGE ERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.error('CONSOLE:', m.text()); });
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve('stage.html')).href + '?spec=main', { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });
for (const t of arg.split(',').map(Number)) {
  await page.evaluate(tt => window.renderFrame(tt), t);
  const f = resolve(OUTDIR, `t${String(t).replace('.', '_')}.png`);
  await page.screenshot({ path: f, type: 'png' });
  console.log('OK', t, '->', f);
}
await browser.close();

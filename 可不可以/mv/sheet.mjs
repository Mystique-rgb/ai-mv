// sheet.mjs — 批量渲染时间点并拼成 3×3 联系表
//   node sheet.mjs --t=1.6,8,17,... --out=out/sheet1.png
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, ...v] = a.replace(/^--/, '').split('='); return [k, v.length ? v.join('=') : true]; }));
const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));

const times = String(args.t || '1').split(',').map(Number);
const outDir = resolve(args.dir || 'out/_sheet');
mkdirSync(outDir, { recursive: true });
const spec = String(args.spec || 'main');

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none', '--force-color-profile=srgb', '--hide-scrollbars'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve('stage.html')).href + '?spec=' + spec, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });

const files = [];
for (let i = 0; i < times.length; i++) {
  const t = times[i];
  await page.evaluate(tt => window.renderFrame(tt), t);
  const f = resolve(outDir, `s${String(i).padStart(2, '0')}_${t}.png`);
  await page.screenshot({ path: f, type: 'png' });
  files.push(f);
}
await browser.close();

// 拼图（3 列，640×360）
const out = resolve(args.out || 'out/sheet.png');
const cols = Math.min(3, files.length);
const rows = Math.ceil(files.length / cols);
const inputs = files.flatMap(f => ['-i', f]);
const filt = files.map((f, i) => `[${i}:v]scale=640:360,drawtext=text='${times[i]}':x=8:y=8:fontsize=22:fontcolor=yellow:box=1:boxcolor=black@0.6[v${i}]`).join(';')
  + ';' + files.map((f, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=` +
  files.map((f, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|') + ':fill=black[o]';
try {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filt, '-map', '[o]', out], { stdio: 'inherit' });
  console.log('sheet -> ' + out + `  (${cols}×${rows})`);
} catch (e) {
  console.log('ffmpeg failed: ' + e.message);
}

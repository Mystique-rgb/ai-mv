// render.mjs — 分段/并行出帧（比 daily.mjs 多了：起止范围、步长、截图重试）
//   node render.mjs --spec=v2 --outdir=out/frames --from=0 --to=7900 --step=4
// 4 个进程分别跑 from=0/1/2/3，step=4，最后 ffmpeg 合成 f%04d.png。
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const CHROMES = [args.chrome, process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const SP = String(args.spec || 'v2');
const OUTDIR = resolve(args.outdir || 'out/frames');
const FROM = Number(args.from || 0);
const TO = Number(args.to || 7900);
const STEP = Math.max(1, Number(args.step || 1));
const FPS = Number(args.fps || 24);
mkdirSync(OUTDIR, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none',
         '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
await page.goto(pathToFileURL(resolve('stage.html')).href + '?spec=' + SP, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });

const t0 = Date.now();
let n = 0;
for (let i = FROM; i <= TO; i += STEP) {
  await page.evaluate(tt => window.renderFrame(tt), i / FPS);
  const file = resolve(OUTDIR, `f${String(i).padStart(4, '0')}.png`);
  let ok = false, lastErr = null;
  for (let att = 0; att < 6 && !ok; att++) {
    try {
      await page.screenshot({ path: file, type: 'png' });
      ok = true;
    } catch (e) {
      lastErr = e;
      await new Promise(r => setTimeout(r, 250 + att * 350));
    }
  }
  if (!ok) { console.error(`FAILED frame ${i}: ${lastErr && lastErr.message}`); process.exit(2); }
  n++;
  if (n % 50 === 0) {
    const el = (Date.now() - t0) / 1000;
    console.log(`[${FROM}/${STEP}] 帧 ${i}  ${n} done  ${el.toFixed(0)}s  (${(el / n * 1000).toFixed(0)}ms/帧)`);
  }
}
console.log(`[${FROM}/${STEP}] DONE ${n} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
await browser.close();

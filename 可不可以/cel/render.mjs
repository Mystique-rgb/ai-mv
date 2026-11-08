// render.mjs — 出静帧（预览）/ 出全片
//   node render.mjs --stills=0.9,2.4,13.2 --out=out/stills
//   node render.mjs --video --fps=24 --from=0 --to=240.889 --out=out/mv.mp4
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { pathToFileURL, fileURLToPath } from 'node:url';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const CHROMES = [args.chrome, process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const ROOT = dirname(fileURLToPath(import.meta.url));
const PAGE = pathToFileURL(resolve(ROOT, 'index.html')).href;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none',
    '--disable-lcd-text', '--force-color-profile=srgb', '--no-proxy-server', '--hide-scrollbars']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()); });
page.on('pageerror', e => console.log('PAGE EXC:', e.message));
await page.goto(PAGE, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });
await page.evaluate(() => document.fonts.load('500 72px STKaiti'));
await new Promise(r => setTimeout(r, 300));

const cv = await page.$('#c');

if (args.stills) {
  const out = resolve(ROOT, args.out || 'out/stills');
  mkdirSync(out, { recursive: true });
  const times = String(args.stills).split(',').map(Number);
  for (const t of times) {
    const info = await page.evaluate(tt => window.drawAt(tt), t);
    await new Promise(r => setTimeout(r, 60));
    const f = resolve(out, `t${t.toFixed(2).padStart(7, '0')}.png`);
    await cv.screenshot({ path: f });
    console.log(`${t.toFixed(2)}s  ${info.model}  ${info.shot}  ${info.sub || '-'}  → ${f}`);
  }
}

if (args.video) {
  const fps = Number(args.fps || 24);
  const from = Number(args.from || 0), to = Number(args.to || 240.889);
  const dur = to - from;
  const N = Math.round(fps * dur);
  const work = resolve(ROOT, 'out/_frames');
  mkdirSync(work, { recursive: true });
  console.log(`video: ${fps}fps × ${dur.toFixed(2)}s = ${N} 帧`);
  const t0 = Date.now();
  let lastShot = null, count = 0;
  for (let i = 0; i < N; i++) {
    const t = from + i / fps;
    const info = await page.evaluate(tt => window.drawAt(tt), t);
    if (info.shot !== lastShot) { console.log(`  ${t.toFixed(2)}s → ${info.shot}`); lastShot = info.shot; }
    await cv.screenshot({ path: resolve(work, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 92 });
    count++;
    if (i % 120 === 0) console.log(`  ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  const outV = resolve(ROOT, args.out || 'out/mv.mp4');
  const audio = args.audio ? resolve(args.audio) : null;
  const ff = [
    '-y', '-framerate', String(fps), '-i', resolve(work, 'f%05d.jpg')
  ];
  if (audio) ff.push('-ss', String(from), '-t', String(dur), '-i', audio, '-shortest');
  ff.push('-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', '-r', String(fps));
  if (audio) ff.push('-c:a', 'aac', '-b:a', '256k');
  ff.push(outV);
  execFileSync('ffmpeg', ff, { stdio: 'inherit' });
  console.log(`成片 ${outV}  共 ${count} 帧，用时 ${((Date.now() - t0) / 60000).toFixed(1)} 分`);
}

await browser.close();

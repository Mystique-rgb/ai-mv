// render.mjs — 孔版 MV 渲染
//   node render.mjs --stills=0.9,2.9 --out=out/stills
//   node render.mjs --video --fps=24 --from=0 --to=240.889
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
    '--disable-lcd-text', '--force-color-profile=srgb', '--no-proxy-server', '--hide-scrollbars',
    '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader',
    '--disable-dev-shm-usage']
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.log('PAGE ERR:', m.text()); });
page.on('pageerror', e => console.log('PAGE EXC:', e.message));
await page.goto(PAGE, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });
await page.evaluate(async () => {
  await document.fonts.load('500 58px STKaiti');
  await document.fonts.load('700 108px STKaiti');
  await document.fonts.ready;
});
await new Promise(r => setTimeout(r, 400));

const cv = await page.$('#c');

if (args.stills) {
  const out = resolve(ROOT, args.out || 'out/stills');
  mkdirSync(out, { recursive: true });
  const times = String(args.stills).split(',').map(Number);
  for (const t of times) {
    const info = await page.evaluate(tt => window.drawAt(tt), t);
    await new Promise(r => setTimeout(r, 80));
    const f = resolve(out, `t${t.toFixed(2).padStart(7, '0')}_${info.shot}.png`);
    await cv.screenshot({ path: f });
    console.log(`${t.toFixed(2)}s ${info.shot} ${info.scene} p=${info.p} kick=${info.kick} sub="${info.sub}" → ${f}`);
  }
}

if (args.video) {
  const fps = Number(args.fps || 24);
  const from = Number(args.from || 0), to = Number(args.to || 240.889);
  const dur = to - from;
  const N = Math.round(fps * dur);
  const work = resolve(ROOT, 'out/_frames');
  mkdirSync(work, { recursive: true });
  console.log(`video ${fps}fps × ${dur.toFixed(2)}s = ${N} 帧`);
  const t0 = Date.now();
  let last = null;
  for (let i = 0; i < N; i++) {
    const t = from + i / fps;
    const info = await page.evaluate(tt => window.drawAt(tt), t);
    if (info.shot !== last) { console.log(`  ${t.toFixed(2)}s → ${info.shot}`); last = info.shot; }
    await cv.screenshot({ path: resolve(work, `f${String(i).padStart(5, '0')}.png`) });
    if (i % 240 === 0) console.log(`  ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  const outV = resolve(ROOT, args.out || 'out/mv.mp4');
  const audio = args.audio ? resolve(args.audio) : null;
  const ff = ['-y', '-framerate', String(fps), '-i', resolve(work, 'f%05d.png')];
  if (audio) ff.push('-ss', String(from), '-t', String(dur), '-i', audio, '-shortest');
  ff.push('-vf', 'scale=out_color_matrix=bt709:out_range=tv,format=yuv420p');
  ff.push('-c:v', 'libx264', '-crf', '16', '-preset', 'slow', '-tune', 'grain', '-r', String(fps));
  if (audio) ff.push('-c:a', 'aac', '-b:a', '256k');
  ff.push('-movflags', '+faststart', outV);
  execFileSync('ffmpeg', ff, { stdio: 'inherit' });
  console.log(`成片 ${outV}  ${N} 帧  用时 ${((Date.now() - t0) / 60000).toFixed(1)} 分`);
}

await browser.close();

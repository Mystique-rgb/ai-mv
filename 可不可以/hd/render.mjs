// render.mjs — 《可不可以》半调案卷版渲染器
//   node render.mjs --stills=2.6,5.8 --out=out/preview        单帧 PNG（1920×1080）
//   node render.mjs --sheet=2.6,5.8 --cols=3 --w=560 --out=out/sheet.jpg   接触表
//   node render.mjs --frames --range=0:60 --workers=1 --out=out/frames       JPEG 帧（可分段续跑）
//   node render.mjs --encode --audio=assets/song.mp3 --out=out/video.mp4
import puppeteer from 'puppeteer-core';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';

const args = Object.fromEntries(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? true]; }));
const DIR = dirname(fileURLToPath(import.meta.url));
const P = (...a) => resolve(DIR, ...a);
const FPS = +(args.fps || 30);
const DUR = 240.889;

function findChrome() {
  const cands = [args.chrome, process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    '/usr/bin/google-chrome', '/usr/bin/chromium'];
  const pw = `${homedir()}/.cache/ms-playwright`;
  if (existsSync(pw)) for (const n of readdirSync(pw).filter(n => /^chromium-\d+$/.test(n)).sort((a, b) => b.split('-')[1] - a.split('-')[1])) {
    cands.push(`${pw}/${n}/chrome-win64/chrome.exe`, `${pw}/${n}/chrome-win/chrome.exe`, `${pw}/${n}/chrome-linux64/chrome`);
  }
  const win = `${process.env.LOCALAPPDATA}/ms-playwright`;
  if (existsSync(win)) for (const n of readdirSync(win).filter(n => /^chromium-\d+$/.test(n)).sort((a, b) => b.split('-')[1] - a.split('-')[1])) {
    cands.push(`${win}/${n}/chrome-win64/chrome.exe`, `${win}/${n}/chrome-win/chrome.exe`);
  }
  return cands.find(p => p && existsSync(p));
}
const run = (cmd, a) => new Promise((ok, bad) => { const p = spawn(cmd, a, { stdio: 'inherit' }); p.on('close', c => c ? bad(new Error(cmd + ' ' + c)) : ok()); });
const times = s => String(s).split(',').map(Number);

if (args.encode) {
  const frames = args.dir || P('out/frames'), out = args.out || P('out/video.mp4');
  const n = readdirSync(frames).filter(f => f.endsWith('.jpg')).length;
  const audio = args.audio ? resolve(DIR, args.audio) : null;
  if (!n) { console.error('no frames in ' + frames); process.exit(1); }
  console.log(`encode ${n} frames (${(n / FPS).toFixed(1)}s) → ${out}`);
  const af = audio ? ['-i', audio, '-map', '0:v', '-map', '1:a', '-af', 'volume=-2.6dB,apad=pad_dur=1.5', '-c:a', 'aac', '-b:a', '256k', '-shortest'] : [];
  await run('ffmpeg', ['-y', '-loglevel', 'error', '-stats', '-framerate', String(FPS), '-i', `${frames}/f%05d.jpg`, ...af,
    '-c:v', 'libx264', '-preset', 'slow', '-crf', '16', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out]);
  console.log('wrote ' + out); process.exit(0);
}

const CHROME = findChrome();
if (!CHROME) { console.error('找不到 Chrome：--chrome=<path> 或设 CHROME_PATH'); process.exit(1); }
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--font-render-hinting=none', '--force-color-profile=srgb', '--allow-file-access-from-files'] });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('console', m => { if (m.type() === 'error') console.error('[page]', m.text()); });
page.on('pageerror', e => console.error('[pageerror]', e.message));
await page.goto(pathToFileURL(P('index.html')).href);
await page.waitForFunction('window.READY === true', { timeout: 120000 });

if (args.stills) {
  const out = args.out || P('out/stills');
  mkdirSync(out, { recursive: true });
  for (const ts of times(args.stills)) {
    const t0 = Date.now();
    await page.evaluate(t => window.render(t), ts);
    const f = resolve(DIR, out, `t_${String(ts).replace('.', '_')}.png`);
    await page.screenshot({ path: f, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    console.log(`t=${ts} → ${f}  (${Date.now() - t0} ms)`);
  }
} else if (args.sheet) {
  const out = args.out || P('out/sheet.jpg');
  mkdirSync(dirname(out), { recursive: true });
  const list = times(args.sheet), cols = +(args.cols || 3), cw = +(args.w || 560);
  const tmp = P('out/_sheet'); mkdirSync(tmp, { recursive: true });
  const files = [];
  for (const ts of list) {
    await page.evaluate(t => window.render(t), ts);
    const f = resolve(tmp, `s_${ts}.png`);
    await page.screenshot({ path: f, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    files.push(f);
  }
  const rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap(f => ['-i', f]);
  const filt = files.map((_, i) => `[${i}:v]scale=${cw}:-1,pad=${cw}:${Math.round(cw * 9 / 16) + 2}:0:0:color=0x111111[v${i}]`).join(';')
    + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=`
    + files.map((_, i) => `${(i % cols) * cw}_${Math.floor(i / cols) * (Math.round(cw * 9 / 16) + 2)}`).join('|') + '[o]';
  await run('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', filt, '-map', '[o]', out]);
  console.log('sheet → ' + out);
} else if (args.frames) {
  const out = args.dir || P('out/frames');
  mkdirSync(out, { recursive: true });
  const [a, b] = String(args.range || `0:${Math.ceil(DUR * FPS)}`).split(':').map(Number);
  const t0 = Date.now();
  for (let f = a; f < b; f++) {
    await page.evaluate(t => window.render(t), f / FPS);
    await page.screenshot({ path: resolve(out, `f${String(f).padStart(5, '0')}.jpg`), quality: 94, type: 'jpeg', clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    if ((f - a) % 150 === 0) console.log(`frame ${f - a}/${b - a}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  console.log(`done ${a}..${b} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();

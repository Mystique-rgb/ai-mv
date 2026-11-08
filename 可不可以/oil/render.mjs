// render.mjs — 静帧预览 / 全片（用风格库的静态服务器 + headless chromium）
//   node render.mjs --stills=4,10.5,32 --out=out/stills
//   node render.mjs --video --fps=24 --out=out/mv.mp4 --audio="D:/ai音乐mv/可不可以/张紫豪 - 可不可以.mp3"
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { mkdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const LIB = 'C:/Users/79420/WorkBuddy/2026-10-31-19-32-52';
const { openDemo, closeServer } = await import(pathToFileURL(LIB + '/core/render/page.mjs').href);

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const ROOT = dirname(fileURLToPath(import.meta.url));
const { browser, page } = await openDemo(ROOT, { w: 1920, h: 1080 });

if (args.stills) {
  const out = resolve(ROOT, args.out || 'out/stills');
  mkdirSync(out, { recursive: true });
  for (const t of String(args.stills).split(',').map(Number)) {
    const t0 = Date.now();
    const info = await page.evaluate(tt => window.drawAt(tt), t);
    await new Promise(r => setTimeout(r, 80));
    const f = resolve(out, `t${t.toFixed(2).padStart(7, '0')}.png`);
    await page.screenshot({ path: f });
    console.log(`${t.toFixed(2)}s ${info.shot} ${info.model} 「${info.sub}」 ${Date.now() - t0}ms → ${f}`);
  }
}

if (args.video) {
  const fps = Number(args.fps || 24);
  const from = Number(args.from || 0), to = Number(args.to || 240.889);
  const N = Math.round(fps * (to - from));
  const work = resolve(ROOT, 'out/_frames');
  mkdirSync(work, { recursive: true });
  console.log(`video ${fps}fps  ${(to - from).toFixed(2)}s = ${N} 帧`);
  const t0 = Date.now();
  let last = null;
  for (let i = 0; i < N; i++) {
    const t = from + i / fps;
    const info = await page.evaluate(tt => window.drawAt(tt), t);
    if (info.shot !== last) { console.log(`  ${t.toFixed(2)}s → ${info.shot}`); last = info.shot; }
    await page.screenshot({ path: resolve(work, `f${String(i).padStart(5, '0')}.jpg`), type: 'jpeg', quality: 93 });
    if (i % 200 === 0) console.log(`  ${i}/${N}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  const outV = resolve(ROOT, args.out || 'out/mv.mp4');
  const ff = ['-y', '-framerate', String(fps), '-i', resolve(work, 'f%05d.jpg')];
  if (args.audio) ff.push('-ss', String(from), '-t', String(to - from), '-i', resolve(args.audio), '-shortest');
  ff.push('-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-r', String(fps));
  if (args.audio) ff.push('-c:a', 'aac', '-b:a', '256k');
  ff.push(outV);
  execFileSync('ffmpeg', ff, { stdio: 'inherit' });
  console.log(`成片 ${outV}`);
}

await browser.close(); closeServer();

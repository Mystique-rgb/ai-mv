// daily.mjs — 一键出片
//   node daily.mjs [--spec=specs/current.js] [--audio=assets/song.mp3] [--out=out/daily.mp4] [--cover=A] [--no-cover]
//
// 流程：读 spec → 逐帧渲染 1920×1080 → ffmpeg 合成(+混音频) → 出封面
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const CHROMES = [args.chrome, process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium'];
const CHROME = CHROMES.find(p => p && existsSync(p));
if (!CHROME) { console.error('Chrome not found'); process.exit(1); }

const SPEC = resolve(args.spec || 'specs/current.js');
const OUT = resolve(args.out || 'out/daily.mp4');
const AUDIO = args.audio ? resolve(args.audio) : null;
const WORK = resolve(dirname(OUT), '_frames_' + basename(OUT, '.mp4'));

// 时长/fps 直接给（spec 里依赖浏览器全局，node 里不 eval）
const FPS = Number(args.fps || 24);
const DUR = Number(args.dur || 240.89);
const N = Math.round(FPS * DUR);
console.log(`spec: ${basename(SPEC)}  ${FPS}fps × ${DUR}s = ${N} 帧`);

// 不清空旧帧：文件名固定为 f0000..fNNNN，逐帧覆盖即可。
// 若新片帧数比旧片少，编码时用 -frames:v N 截断，避免残留旧帧混进成片。
mkdirSync(WORK, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none',
         '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(resolve('stage.html')).href + '?spec=' + basename(SPEC, '.js'), { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });

const F0 = Math.max(0, Number(args.from || 0));
const F1 = Math.min(N, Number(args.to || N));
const RANGE = args.from != null || args.to != null;
console.log(`range: ${F0}..${F1} (${F1 - F0} 帧)`);
const t0 = Date.now();
for (let i = F0; i < F1; i++) {
  await page.evaluate(tt => window.renderFrame(tt), i / FPS);
  await page.screenshot({ path: resolve(WORK, `f${String(i).padStart(4, '0')}.png`), type: 'png' });
  if (i % 48 === 0 || i === F1 - 1) {
    const el = (Date.now() - t0) / 1000;
    process.stdout.write(`\r  帧 ${i + 1}/${N}  ${el.toFixed(1)}s  (${((Date.now() - t0) / (i - F0 + 1)).toFixed(0)}ms/帧)`);
  }
}
console.log('');
await browser.close();
if (RANGE) { console.log('分段渲染完成，跳过合成：' + WORK); process.exit(0); }

// ---- 合成 ----
mkdirSync(dirname(OUT), { recursive: true });
const ffArgs = ['-y', '-loglevel', 'error', '-framerate', String(FPS), '-i', resolve(WORK, 'f%04d.png')];
let audioIdx = null;
if (AUDIO && existsSync(AUDIO)) {
  ffArgs.push('-ss', '0', '-t', String(DUR), '-i', AUDIO);
  audioIdx = 1;
}
ffArgs.push('-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', '-frames:v', String(N));
if (audioIdx !== null) {
  ffArgs.push('-c:a', 'aac', '-b:a', '192k', '-shortest',
    '-af', `afade=t=in:st=0:d=0.3,afade=t=out:st=${Math.max(0, DUR - 0.6)}:d=0.6`,
    '-map', '0:v:0', '-map', '1:a:0');
}
ffArgs.push(OUT);
console.log('合成中…');
execFileSync('ffmpeg', ffArgs, { stdio: 'inherit' });

// ---- 封面 ----
if (!args['no-cover']) {
  const cv = String(args.cover || S.cover || 'A');
  try {
    execFileSync('node', ['shootcover.mjs', `--v=${cv}`, '--w=1920', '--h=1080',
      `--out=${dirname(OUT)}`], { stdio: 'inherit' });
  } catch (e) { console.warn('封面生成失败：' + e.message); }
}

// ---- 报告 ----
const probe = execFileSync('ffprobe', ['-v', 'error', '-show_entries',
  'format=duration,size', '-show_entries', 'stream=codec_type,width,height,r_frame_rate',
  '-of', 'default=nw=1', OUT], { encoding: 'utf8' });
console.log('\n=== 完成 ===');
console.log(OUT);
console.log(probe.trim());
console.log(`帧序列保留在：${WORK}（改了代码要重跑，脚本会自动清空）`);

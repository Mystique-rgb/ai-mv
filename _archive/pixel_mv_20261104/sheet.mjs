// sheet.mjs — 每镜取一帧，拼成联系表（审片用）
//   node sheet.mjs --at=0.35 --out=out/sheet
import puppeteer from 'puppeteer-core';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { execFileSync } from 'node:child_process';

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const [k, ...v] = a.replace(/^--/, '').split('=');
  return [k, v.length ? v.join('=') : true];
}));
const CHROMES = [process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'];
const CHROME = CHROMES.find(p => p && existsSync(p));
const at = Number(args.at || .35);          // 每镜取 35% 处的帧
const outDir = resolve(args.out || 'out/sheet');
mkdirSync(outDir, { recursive: true });

const SP = String(args.spec || 'current');
const specSrc = readFileSync(resolve('specs/' + SP + '.js'), 'utf8');
const MODS = ['_pal', '_fig', '_cam', '_fx']
  .map(n => resolve('specs/' + n + '.js'))
  .filter(p => existsSync(p))
  .map(p => readFileSync(p, 'utf8'))
  .join('\n');
const sandbox = { window: {} };
new Function('window', MODS + '\n' + specSrc)(sandbox.window);
const shots = sandbox.window.SPEC.shots;

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none', '--force-color-profile=srgb'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
page.on('pageerror', e => console.log('PAGEERROR:', e.message));
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
await page.goto(pathToFileURL(resolve('stage.html')).href + '?spec=' + SP, { waitUntil: 'load' });
await page.waitForFunction('window.__ready === true', { timeout: 30000 });

let i = 0;
for (const s of shots) {
  const t = s.t0 + (s.t1 - s.t0) * at;
  await page.evaluate(tt => window.renderFrame(tt), t);
  await page.screenshot({ path: resolve(outDir, `f${String(i).padStart(3, '0')}.png`), type: 'png' });
  i++;
}
await browser.close();
console.log(`rendered ${i} stills`);

execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '1', '-i', resolve(outDir, 'f%03d.png'),
  '-vf', 'scale=384:216:flags=neighbor,tile=6x8', '-frames:v', '1', resolve(outDir, 'sheet.png')]);
console.log('sheet: ' + resolve(outDir, 'sheet.png'));

// genfont.mjs — 生成 16×16 中文 / 8×16 ASCII 点阵字模（来自华文楷体 STKAITI）
//   node tools/genfont.mjs
import puppeteer from 'puppeteer-core';
import { existsSync, writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const CHROME = ['C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe'].find(p => existsSync(p));

// 字符集：歌词全集 + 场景标语
const lyric = readFileSync('D:/ai音乐mv/可不可以/张紫豪 - 可不可以.txt', 'utf8');
// 把源码里出现的所有中文字都收进来（避免场景文字缺字）
import { readdirSync } from 'node:fs';
let srcAll = '';
for (const d of ['src', 'specs']) {
  for (const f of readdirSync(d)) if (f.endsWith('.js')) srcAll += readFileSync(d + '/' + f, 'utf8');
}
const extra = '流浪书咖旺铺出租烤串奶茶糖炒栗子珍珠面筋小卖部保质期永远我回来了可不可以我们在一起第天生日快乐烤红薯麻辣烫肉夹馍冰粉柠檬水咖啡便利店夜市大学食堂教室操场看台天台海边沙滩石桥灯笼地铁站台公寓阳台清晨黄昏夜色雨雪风雷闪电浪船纸船回忆之城像素游戏开始继续存档读档结局终';
const cnSet = new Set();
for (const ch of lyric + extra + srcAll) if (/[\u4e00-\u9fff]/.test(ch)) cnSet.add(ch);
cnSet.add(' ');
const cn = [...cnSet];
const ascii = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~×：·—…“”！？';

const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'K';src:url('${pathToFileURL(resolve('assets/fonts/STKAITI.TTF')).href}') format('truetype');}
html,body{margin:0;background:#000}canvas{display:block}
</style></head><body><canvas id="cv" width="64" height="32"></canvas>
<script>
window.__ready=false;
document.fonts.load('400 16px K').then(()=>document.fonts.ready).then(()=>{window.__ready=true});
window.glyphCN = function(ch){
  const cv=document.getElementById('cv'), c=cv.getContext('2d');
  c.clearRect(0,0,64,32);
  c.fillStyle='#000'; c.textBaseline='alphabetic'; c.textAlign='left';
  c.font='16px K';
  c.fillStyle='#fff'; c.fillText(ch,0,15);
  const d=c.getImageData(0,0,16,16).data, rows=[];
  for(let y=0;y<16;y++){let s='';for(let x=0;x<16;x++){const a=d[(y*16+x)*4+3];s+=a>110?'1':'0';}rows.push(s);}
  return rows;
};
window.glyphEN = function(ch){
  const cv=document.getElementById('cv'), c=cv.getContext('2d');
  c.clearRect(0,0,64,32);
  c.textBaseline='alphabetic'; c.textAlign='left';
  c.fillStyle='#000'; c.fillRect(0,0,64,32);
  c.font='bold 13px monospace';
  c.fillStyle='#fff'; c.fillText(ch,1,12);
  const d=c.getImageData(0,0,8,16).data, rows=[];
  for(let y=0;y<16;y++){let s='';for(let x=0;x<8;x++){const a=d[(y*8+x)*4];s+=a>100?'1':'0';}rows.push(s);}
  return rows;
};
</script></body></html>`;
writeFileSync('tools/_font.html', html);

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new',
  args: ['--no-sandbox', '--allow-file-access-from-files', '--font-render-hinting=none'] });
const page = await browser.newPage();
page.on('pageerror', e => console.log('ERR', e.message));
await page.goto(pathToFileURL(resolve('tools/_font.html')).href, { waitUntil: 'load' });
await page.waitForFunction('window.__ready===true', { timeout: 30000 });

const hex = rows => rows.map(r => parseInt(r, 2).toString(16).padStart(4, '0').toUpperCase());
const outCN = {}, outEN = {};
for (const ch of cn) {
  const rows = await page.evaluate(c => window.glyphCN(c), ch);
  outCN[ch] = hex(rows);
}
for (const ch of ascii) {
  const rows = await page.evaluate(c => window.glyphEN(c), ch);
  outEN[ch] = rows.map(r => parseInt(r, 2).toString(16).padStart(2, '0').toUpperCase());
}
await browser.close();

let js = '// pxfont.js — 自动生成（华文楷体 16×16 中文 / 8×16 ASCII），勿手改\nwindow.PXF=window.PXF||{};window.PXF.cn={\n';
js += Object.entries(outCN).map(([k, v]) => JSON.stringify(k) + ':[' + v.map(x => JSON.stringify(x)).join(',') + ']').join(',\n');
js += '\n};\nwindow.PXF.en={\n';
js += Object.entries(outEN).map(([k, v]) => JSON.stringify(k) + ':[' + v.map(x => JSON.stringify(x)).join(',') + ']').join(',\n');
js += '\n};\n';
writeFileSync('src/pxfont.js', js);
console.log('chars CN=' + cn.length + ' EN=' + ascii.length + '  -> src/pxfont.js ' + (js.length / 1024).toFixed(0) + 'KB');

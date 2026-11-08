// _pal-audit.mjs — 色板体检：列出所有 spec 里"未登记"的色值
//   node specs/_pal-audit.mjs
//
// 用途：新图做完跑一遍。出现在 core（对标实测）或 ext（我方扩展）里的色 → 通过；
//       出现在「未登记」里的 → 要么改成已登记的族，要么回写进 _pal.js 的 ext。
// 这是把"别再各搓一套"从口号变成可检查的事。
import { readFileSync, readdirSync } from 'node:fs';
import { resolve, basename } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const P = require('./_pal.js');
const REG = P.all();           // '#RRGGBB' -> 'core.xxx' | 'ext.xxx'

const dir = resolve('.', 'specs');
// 可选：只查指定文件（部分匹配）——  node specs/_pal-audit.mjs bed couple2 face2 demo10
const only = process.argv.slice(2).filter(a => !a.startsWith('-'));
const files = readdirSync(dir)
  .filter(f => f.endsWith('.js') && f !== '_pal.js')
  .filter(f => !only.length || only.some(o => f.includes(o)));

const path0 = (m) => m;
let rows = [];
for (const f of files) {
  const src = readFileSync(resolve(dir, f), 'utf8');
  const hits = src.match(/#[0-9A-Fa-f]{6}\b/g) || [];
  if (!hits.length) continue;
  const uniq = [...new Set(hits.map(h => h.toUpperCase()))];
  let core = 0, ext = 0, unknown = [];
  for (const h of uniq) {
    const v = REG[h];
    if (!v) unknown.push(h);
    else if (v.startsWith('core')) core++;
    else ext++;
  }
  rows.push({ f, total: uniq.length, core, ext, unknown });
}

rows.sort((a, b) => (b.unknown.length / b.total) - (a.unknown.length / a.total));

let sumT = 0, sumC = 0, sumE = 0, sumU = 0;
console.log('\n色板体检 · specs/_pal.js 已登记 ' + Object.keys(REG).length + ' 色\n');
console.log('spec                      色数  命中core  命中ext  未登记  命中率');
console.log('─'.repeat(70));
for (const r of rows) {
  sumT += r.total; sumC += r.core; sumE += r.ext; sumU += r.unknown.length;
  const rate = ((r.core + r.ext) / r.total * 100).toFixed(0) + '%';
  console.log(
    r.f.padEnd(24) + String(r.total).padStart(5) +
    String(r.core).padStart(9) + String(r.ext).padStart(9) +
    String(r.unknown.length).padStart(8) + rate.padStart(8)
  );
}
console.log('─'.repeat(70));
console.log(
  '合计'.padEnd(24) + String(sumT).padStart(5) +
  String(sumC).padStart(9) + String(sumE).padStart(9) +
  String(sumU).padStart(8) + ((sumC + sumE) / sumT * 100).toFixed(0).padStart(7) + '%'
);

const worst = rows.filter(r => r.unknown.length);
if (worst.length) {
  console.log('\n未登记色（去重后全区合并，按色值列出）：');
  const allUnknown = new Set();
  for (const r of worst) r.unknown.forEach(h => allUnknown.add(h));
  const arr = [...allUnknown];
  for (let i = 0; i < arr.length; i += 8) {
    console.log('  ' + arr.slice(i, i + 8).join(' '));
  }
  console.log('\n→ 处理：能换成已登记族的就换；确实新增的语义（新角色/新光源），回写进 _pal.js 的 ext。');
} else {
  console.log('\n全部命中，无未登记色。');
}

// 冲突登记提醒
if (P.conflict && P.conflict.length) {
  console.log('\n待收敛的冲突（_pal.js §C）：');
  for (const c of P.conflict) console.log('  ' + c.key.padEnd(8) + '主值 ' + c.use + '　弃用 ' + c.drops.join(' / '));
}
console.log('');

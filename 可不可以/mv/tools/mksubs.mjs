// tools/mksubs.mjs — 由「字幕音频对照.csv」生成 specs/subs.js（严格对齐起唱/收声）
import { readFileSync, writeFileSync } from 'node:fs';

const csv = readFileSync('D:/ai音乐mv/可不可以/张紫豪 - 可不可以-字幕音频对照.csv', 'utf8').replace(/^\uFEFF/, '');
const lines = csv.trim().split(/\r?\n/).slice(1);
const rows = lines.map(l => {
  const c = l.split(',');
  return { i: +c[0], sec: c[1], s0: +c[2], s1: +c[3], disp: c[4], text: c[8] };
});
const out = rows.map((r, i) => {
  const next = rows[i + 1];
  const dispEnd = +r.disp.split('-')[1];
  let t1 = Math.min(dispEnd, next ? next.s0 - 0.02 : 228.4);
  if (t1 < r.s0 + 1.0) t1 = r.s0 + 1.0;
  return { i: r.i, sec: r.sec, t0: r.s0, t1: +t1.toFixed(2), p0: r.s0, p1: Math.min(r.s1, t1), text: r.text };
});
// 校验：相邻不重叠
for (let i = 1; i < out.length; i++) if (out[i].t0 < out[i - 1].t1) console.log('OVERLAP', out[i - 1].text, out[i - 1].t1, out[i].text, out[i].t0);

const js = '// subs.js — 由 CSV 自动生成，勿手改\nwindow.SUBS = [\n' +
  out.map(s => `  { t0:${s.t0}, t1:${s.t1}, p0:${s.p0}, p1:${s.p1}, text:${JSON.stringify(s.text)} }`).join(',\n') +
  '\n];\n';
writeFileSync('specs/subs.js', js);
console.log('subs=' + out.length + '  首句', out[0].t0, out[0].text, ' 末句', out[out.length - 1].t1);

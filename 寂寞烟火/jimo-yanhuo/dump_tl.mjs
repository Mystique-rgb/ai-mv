import { pathToFileURL } from 'node:url';
const dir = process.argv[2];
const m = await import(pathToFileURL(dir + '/timeline.js').href);
const bar = m.BEAT * 4;
console.log('DUR', m.DUR, 'BEAT', m.BEAT, 'bar', bar.toFixed(4));
console.log('--- shot cuts vs nearest beat:');
for (const s of m.SHOTS) {
  const n = Math.round((s.t0 - m.T0) / m.BEAT);
  const err = (s.t0 - m.beat(n)) * 1000;
  console.log(s.id.padEnd(9), s.t0.toFixed(2), 'beat', n, 'bar-pos', (n % 4), 'err', err.toFixed(0) + 'ms');
}
console.log('--- key hits vs nearest beat:');
for (const [k, t] of Object.entries(m.HIT)) {
  const n = Math.round((t - m.T0) / m.BEAT);
  console.log(k.padEnd(11), t.toFixed(3), 'beat', n, 'err', ((t - m.beat(n)) * 1000).toFixed(0) + 'ms');
}
console.log('--- lyrics:', m.LYRICS.length, 'lines; min hold', Math.min(...m.LYRICS.map(l => l.t1 - l.t0)).toFixed(2), 's');
const out = dir + '/out';
import('node:fs').then(fs => { fs.mkdirSync(out, { recursive: true }); fs.writeFileSync(out + '/timeline.json', JSON.stringify({ DUR: m.DUR, BEAT: m.BEAT, T0: m.T0, SHOTS: m.SHOTS, LYRICS: m.LYRICS, HIT: m.HIT }, null, 1)); console.log('wrote', out + '/timeline.json'); });

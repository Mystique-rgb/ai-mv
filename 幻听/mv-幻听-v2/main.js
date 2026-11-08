import * as U from './ui.js';
import * as C from './clawd.js';
import * as FM from './film.js';
import * as S from './stage.js';

const wL = document.getElementById('wL'), wD = document.getElementById('wD');
const spr = document.getElementById('spr'), hud = document.getElementById('hud');
const lyr = document.getElementById('lyr'), veil = document.getElementById('veil');
const mbw = document.getElementById('mbw'), mbg = document.getElementById('mbg');
const seg = (t, a, b) => Math.min(1, Math.max(0, (t - a) / (b - a)));
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));

await Promise.all([document.fonts.load('100px XK'), document.fonts.load('16px YH')]);
await document.fonts.ready;

window.DUR = FM.DUR;
window.SUBS = FM.SUBS;

const tf = ([cx, cy, z]) => `translate(960px,540px) scale(${z}) translate(${-cx}px,${-cy}px)`;

// ---------- 字阵：歌词就是布景 ----------
function song(F, t) {
  const [cx, cy, z] = F.cam;
  const dark = F.theme === 'D';
  const ink = dark ? '#F2EFE8' : '#241F1B';
  const hot = dark ? '#FFC24A' : '#C2412A';
  let s = '';
  for (const c of S.chars(t, cx, cy, z)) {
    const sz = c.size;
    const dy = c.hit * 16;
    const top = c.y - sz * 1.06 + dy;
    const base = `position:absolute;left:${c.x}px;top:${top}px;width:${sz * 1.14}px;
      transform:translate(-50%,0) scale(${c.sc});transform-origin:50% 90%;
      font-family:XK;font-size:${sz}px;line-height:${sz}px;text-align:center;white-space:nowrap;`;
    // 落脚光台：让人一眼看出这是"可以踩的台阶"
    const tw = sz * .80, th = Math.max(3, sz * .032);
    s += `<div style="position:absolute;left:${c.x - tw / 2}px;top:${c.y - th / 2}px;width:${tw}px;height:${th}px;border-radius:${th}px;
      background:linear-gradient(90deg,${hot}00,${hot},${hot}00);opacity:${(.14 + c.hit * .85) * (c.ahead ? .55 : 1)}"></div>`;
    if (c.ahead) {
      // 还没踩到：轮廓 + 极淡的填充（看得出字形，但明显"还没到"）
      const sw = Math.max(1.8, sz * .015);
      if (c.solid > 0) {
        s += `<div style="${base}color:${ink};opacity:${c.solid}">${c.ch}</div>`;
      } else {
        s += `<div style="${base}color:${ink};opacity:.14">${c.ch}</div>`;
        s += `<div style="${base}color:transparent;-webkit-text-stroke:${sw}px ${ink};opacity:.52">${c.ch}</div>`;
      }
    } else {
      s += `<div style="${base}color:${ink};opacity:${c.op}">${c.ch}</div>`;
      if (c.hit > .02) s += `<div style="${base}color:${hot};opacity:${c.op * c.hit};
        text-shadow:0 0 30px ${hot}99,0 0 86px ${hot}55,0 0 160px ${hot}22">${c.ch}</div>`;
    }
  }
  return s + shadow(F) + endCard(F, t);
}

// 主角的投影：给跳跃建立高度感
function shadow(F) {
  const H = F.hero;
  if (H.gy == null) return '';
  const h = Math.max(0, H.y - H.gy);
  const k = clamp(1 - h / 400, 0, 1);
  if (k <= .05) return '';
  const w = 128 * k, hh = 22 * k;
  return `<div style="position:absolute;left:${H.x - w / 2}px;top:${H.gy - hh * .5}px;width:${w}px;height:${hh}px;border-radius:50%;
    opacity:${clamp((F.hero.op ?? 1) * 1.1, 0, 1)};background:radial-gradient(ellipse at 50% 50%,rgba(0,0,0,${.34 * k}),rgba(0,0,0,0) 72%)"></div>`;
}

// 结尾：一块悬在路上的气泡，他在上面打下「在吗」，不发送
function endCard(F, t) {
  const E = S.END, q = t - E.t;
  if (q < -.14) return '';
  const a = seg(t, E.t - .14, E.t + .10);
  const sc = .90 + .10 * (1 - Math.pow(1 - clamp(a), 3));
  const typed = q > 1.02 ? '在吗' : (q > .62 ? '在' : '');
  const caret = typed && Math.floor(t * 3.1) % 2 === 0;
  const dotsN = q > 1.55 ? (q > 2.2 ? 2 : (Math.floor((q - 1.55) * 2.6) % 2) + 1) : 0;
  const bubble = `
    <div style="position:absolute;left:38px;top:${E.h / 2 - 21}px;width:42px;height:42px;border-radius:12px;background:${C.PINK};
      box-shadow:0 0 22px ${C.PINK}77"></div>
    <div style="position:absolute;left:84px;top:0;width:${E.w - 108}px;height:${E.h}px;border-radius:26px;
      background:linear-gradient(160deg,rgba(30,34,54,.94),rgba(18,21,36,.96));
      box-shadow:inset 0 0 0 2px rgba(255,255,255,.14),0 26px 60px rgba(0,0,0,.55)">
      <div style="position:absolute;left:0;top:0;right:0;bottom:0;display:flex;align-items:center;padding-left:34px;
        font-family:XK;font-size:76px;color:#FFF6E8;letter-spacing:6px;white-space:nowrap;
        text-shadow:0 4px 30px rgba(0,0,0,.5)">${typed || `<span style="opacity:.22;font-size:30px;letter-spacing:2px">写点什么…</span>`}<span style="display:inline-block;width:3px;height:64px;margin-left:6px;
        background:${caret ? '#FFC24A' : 'transparent'};vertical-align:-6px"></span></div>
    </div>
    ${q > 1.5 ? `<div style="position:absolute;left:96px;top:${E.h + 26}px;display:flex;align-items:center;gap:14px">
      <span style="font-family:YH;font-size:26px;color:rgba(255,255,255,.62);letter-spacing:2px">对方正在输入</span>
      ${[1, 2, 3].map(i => `<span style="width:12px;height:12px;border-radius:50%;
        background:${i <= dotsN ? '#E58384' : 'rgba(255,255,255,.20)'};display:block;
        transform:translateY(${i === dotsN ? -5 : 0}px)"></span>`).join('')}
    </div>` : ''}
`;
  return `<div style="position:absolute;left:${E.x}px;top:${E.y - E.h}px;width:${E.w}px;height:${E.h}px;
    transform:scale(${sc});transform-origin:50% 100%;opacity:${a}">${bubble}</div>`;
}

// ---------- 字幕：华文行楷 + 卡拉OK填色（可读性兜底） ----------
function lyric(t) {
  const show = [];
  FM.LINES.forEach((L, i) => {
    const out = i === 2 ? 12.92 : L.t1 + 0.18;
    if (t < L.t0 - 0.16 || t > out) return;
    show.push({ ...L, i, k: clamp((t - L.t0) / (L.t1 - L.t0)) });
  });
  if (!show.length) return '';
  const stacked = t > 11.05 && t < 12.92;
  const dark = t > 9.44;
  return show.map((L, n) => {
    const accent = dark ? (L.sec ? '#E58384' : '#8FE3FF') : (L.sec ? '#C2412A' : '#2E8FC0');
    const base = dark ? 'rgba(255,255,255,.30)' : 'rgba(36,31,27,.30)';
    const sh = dark ? '0 3px 20px rgba(4,6,14,.85),0 1px 3px rgba(0,0,0,.6)' : '0 2px 14px rgba(255,250,240,.9),0 1px 2px rgba(90,70,50,.3)';
    const sz = Math.min(56, Math.max(44, Math.round(L.size * 0.33)));
    const size = stacked && L.i === 2 ? sz * 0.86 : sz;
    const y = stacked ? (L.i === 2 ? 936 : 1012) : 1004;
    const ent = seg(t, L.t0 - 0.16, L.t0 + 0.04);
    const op = ent * (1 - seg(t, L.t1 + 0.02, L.t1 + 0.18)) * (stacked && L.i === 2 ? .55 : 1);
    return `<div style="position:absolute;left:960px;top:${y - size}px;transform:translate(-50%,0);opacity:${op};white-space:nowrap">
      <div style="position:relative;font-family:XK;font-size:${size}px;line-height:${size * 1.14}px;letter-spacing:2px;
        color:${base};text-shadow:${sh}">
        <span>${L.text}</span>
        <span style="position:absolute;left:0;top:0;width:${(L.k * 100).toFixed(2)}%;overflow:hidden;color:${accent};
          text-shadow:0 0 16px ${accent}77,${sh}">${L.text}</span>
      </div></div>`;
  }).join('');
}

function build(F, t, theme, uiK) {
  const Sx = { ...F, theme };
  let html = U.desk(Sx, t) + U.spectrum(t, theme === 'D');
  html += `<div style="position:absolute;inset:0;opacity:${uiK.toFixed(3)}">`
    + U.player(Sx, t) + U.imWin(Sx, t) + U.notifs(Sx) + `</div>`;
  html += `<div style="position:absolute;inset:0;opacity:${Math.max(0, uiK * 1.6 - .6).toFixed(3)}">`
    + U.dock(Sx, t) + `</div>`;
  return html;
}

function render(t) {
  const F = FM.frame(t);
  const [cx, cy, z] = F.cam;
  const uiK = seg(t, 0.30, 0.82) * (1 - seg(t, 1.15, 2.35)) + seg(t, 26.9, 27.7) * 0.30;
  const base = F.base === 'L' ? wL : wD;
  const over = F.over ? wD : null;
  base.innerHTML = build(F, t, F.base, uiK); base.style.display = ''; base.style.clipPath = '';
  if (over) {
    over.innerHTML = build(F, t, 'D', uiK); over.style.display = ''; over.style.zIndex = 2;
    over.style.clipPath = `circle(${F.r}px at 306px 268px)`;
  } else (base === wL ? wD : wL).style.display = 'none';
  wL.style.zIndex = 1; wD.style.zIndex = 2;

  // 界面固定不动（它是"世界的外壳"），字阵与主角才是会移动的世界
  for (const el of [lyr, spr]) el.style.transform = tf(F.cam);
  const dark = F.theme === 'D';
  veil.style.background = 'transparent';

  // 字阵
  lyr.innerHTML = song(F, t);

  // 精灵
  const A = FM.actors(t);
  let s = '';
  for (const a of A) {
    if (!a.show) continue;
    s += C.sprite({ x: a.x, y: a.y, px: a.px, flip: a.flip, sq: a.sq, rot: a.rot, op: a.op, eyes: a.eyes, arms: a.arms, legs: a.legs, color: a.color, dark: a.dark });
  }
  spr.innerHTML = s;

  // 字幕带 + 全屏光效
  const sc = dark ? '8,10,22' : '250,244,236';
  const scrim = `<div style="position:absolute;left:0;top:884px;width:1920px;height:196px;pointer-events:none;
    background:linear-gradient(180deg,rgba(${sc},0) 0%,rgba(${sc},.36) 20%,rgba(${sc},.72) 44%,rgba(${sc},.93) 72%,rgba(${sc},.97) 100%)"></div>
    <div style="position:absolute;inset:0;pointer-events:none;background:radial-gradient(1500px 980px at 50% 44%,rgba(0,0,0,0),rgba(${dark ? '0,0,0' : '120,90,60'},${dark ? .26 : .10}))"></div>`;
  // 句首闪光
  let flash = 0;
  S.LINES.forEach((L, li) => {
    const c0 = S.CHARS.find(c => c.line === li && c.i === 0);
    if (!c0) return;
    const d = t - c0.t;
    if (d >= 0 && d < .30) flash = Math.max(flash, Math.exp(-d * 16) * .16);
  });
  const fl = flash > .01 ? `<div style="position:absolute;inset:0;pointer-events:none;background:${dark ? '#FFE9C4' : '#FFF6E4'};opacity:${flash}"></div>` : '';
  hud.innerHTML = scrim + fl + lyric(t);

  // 运动模糊（只有甩镜才糊）
  const [px, py, pz] = FM.camAt(t - 1 / 30);
  const vx = (cx - px) * z, vy = (cy - py) * z;
  const bx = Math.min(6, Math.max(0, Math.abs(vx) - 70) * .012), by = Math.min(3, Math.max(0, Math.abs(vy) - 70) * .008);
  mbg.setAttribute('stdDeviation', `${bx.toFixed(2)} ${by.toFixed(2)}`);
  mbw.style.filter = (bx > .6 || by > .6) ? 'url(#mb)' : '';
}
window.render = render;
window.READY = true;

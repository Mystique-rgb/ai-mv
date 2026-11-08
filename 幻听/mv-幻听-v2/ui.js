// 界面：全部矢量重绘（不截图），每个函数都是 t 的纯函数
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const seg = (t, a, b) => clamp((t - a) / (b - a));
export const L = {
  mb: 30,
  win: { x: 120, y: 104, w: 1010, h: 656 },
  art: { x: 156, y: 178, s: 300 },
  prog: { x: 156, y: 596, w: 300 },
  vol: { x: 186, y: 706, w: 100 },
  heart: { x: 344, y: 706 },
  list: { x: 496, y: 214, rowH: 72, gap: 4, w: 608 },
  member: { x: 866, y: 162, w: 226, h: 38 },
  close: { x: 1104, y: 104, w: 46, h: 46 },
  im: { x: 1176, y: 330, w: 420, h: 430 },
  notif: { x: 1176, y: 92, w: 420, h: 78, gap: 10 },
  dock: { x: 512, y: 996, w: 896, h: 60 },
  lyricY: 848,
};
export const ROWCOL = ['#4FC3F7', '#F2CD37', '#6C7BFF', '#F0703A'];
export const ROWN = ['幻听', '晴天', '夜曲', '后来'];
export const ROWD = ['3:06', '4:29', '4:16', '4:24'];
export const TAG = '她分享的';
export const ACC = { ve: '#4FC3F7', ch: '#E58384' };

const h = (x, y, w, hh, extra = '') => `left:${x}px;top:${y}px;width:${w}px;height:${hh}px;${extra}`;

// ---------- 频谱：64 根柱，随拍起落（纯函数） ----------
export function eqBar(i, t, nt = 64) {
  const beat = 0.470, ph = (((t - 1.45) / beat) % 1 + 1) % 1, dec = Math.exp(-ph * 3.2);
  const sd = (i * 37) % 97;
  const lane = 0.5 + 0.5 * Math.sin(i * 0.9 + t * 2.1 + sd * 0.07);
  const mid = 0.5 + 0.5 * Math.sin(i * 0.31 - t * 1.3);
  const env = 0.32 + 0.68 * dec;
  return Math.min(96, Math.max(3, (6 + 34 * mid * lane + 30 * dec * (0.4 + 0.6 * lane)) * env * 0.55));
}
export function spectrum(t, dark) {
  let s = '';
  const n = 64, w = 22, gap = 8, x0 = (1920 - (n * w + (n - 1) * gap)) / 2, base = 1052;
  for (let i = 0; i < n; i++) {
    const hh = eqBar(i, t) * (dark ? 1 : .82);
    const g = dark ? `linear-gradient(180deg,rgba(242,160,192,.85),rgba(138,123,255,.6) 45%,rgba(90,107,216,.25))`
      : `linear-gradient(180deg,rgba(150,158,255,.55),rgba(150,158,255,.28) 50%,rgba(120,130,220,.08))`;
    s += `<div style="position:absolute;${h(x0 + i * (w + gap), base - hh, w, hh)}background:${g};border-radius:3px;opacity:${dark ? .72 : .38}"></div>`;
  }
  return s;
}

// ---------- 壁纸 / 雨 / 星 ----------
export function desk(st, t) {
  const dark = st.theme === 'D';
  let s = '';
  s += `<div style="position:absolute;left:-700px;top:-700px;width:3320px;height:2480px;background:
    radial-gradient(1100px 700px at 22% 18%,var(--wall1) 0,transparent 68%),
    radial-gradient(900px 620px at 78% 76%,var(--wall3) 0,transparent 70%),
    radial-gradient(700px 520px at 60% 40%,var(--wall2) 0,transparent 72%),var(--wall0)"></div>`;
  // 桌面图标
  {
    const ic = [['#4FC3F7', 44, 214, '我们的歌单'], ['#F2CD37', 44, 334, '照片'], ['#E58384', 44, 454, '录音']];
    for (const [c, x, y, name] of ic) {
      s += `<div style="position:absolute;left:${x}px;top:${y}px;width:108px;text-align:center;opacity:${(dark ? .9 : .95) * (1 - seg(t, 0.95, 1.35))}">
        <div style="width:64px;height:64px;margin:0 auto;border-radius:13px;background:linear-gradient(150deg,${c},${c}b0);
          box-shadow:0 8px 20px rgba(40,30,20,.22),inset 0 0 0 1px rgba(255,255,255,.4)"></div>
        <div style="margin-top:7px;font-size:11px;color:${dark ? 'rgba(232,236,255,.82)' : 'rgba(64,54,46,.92)'};text-shadow:0 1px 3px rgba(255,255,255,.5)">${name}</div></div>`;
    }
  }
  // 月（暗场里出现，藏在窗口后面制造纵深）
  if (dark) {
    const age = Math.max(0, t - 9.44);
    const mx = 1700 - 26 * age, my = 640 - 18 * age, m = st.moon ?? 1;
    s += `<div style="position:absolute;${h(mx - 96, my - 96, 192, 192)}border-radius:50%;background:radial-gradient(circle at 40% 34%,rgba(255,246,214,${.7 * m}) 0,rgba(255,232,180,${.36 * m}) 34%,rgba(255,228,170,${.12 * m}) 58%,rgba(255,228,170,0) 72%)"></div>
      <div style="position:absolute;${h(mx - 38, my - 38, 76, 76)}border-radius:50%;background:radial-gradient(circle at 38% 32%,#FFF8DE,#FFE7A8 58%,#E9C271);box-shadow:0 0 46px rgba(255,224,150,${.3 * m});opacity:${m * .92}"></div>
      <div style="position:absolute;${h(mx - 50, my - 20, 32, 24)}border-radius:50%;background:rgba(20,26,54,${.14 * m});filter:blur(9px)"></div>`;
  }
  // 桌面时钟小组件（时间跳字是「入夜」的第二个信号）
  {
    const dark2 = dark;
    const fade = st.clockFade ?? 1;
    s += `<div style="position:absolute;left:1440px;top:104px;width:320px;text-align:right;opacity:${(dark2 ? .7 : .5) * fade}">
      <div style="font-size:46px;font-weight:200;letter-spacing:2px;color:${dark2 ? '#E8ECFF' : '#7E7166'};font-variant-numeric:tabular-nums;line-height:1">${st.clock || '22:47'}</div>
      <div style="margin-top:12px;font-size:17px;letter-spacing:1.2px;color:${dark2 ? 'rgba(232,236,255,.86)' : 'rgba(104,90,76,.92)'}">第 37 天　没有新消息</div></div>`;
  }
  // 星
  if (dark) for (let i = 0; i < 64; i++) {
    const x = (i * 197 + 53) % 1900 + 10, y = (i * 131 + 71) % 620 + 20;
    const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.7 + i * 1.31));
    const sz = 2 + ((i * 13) % 3);
    s += `<div style="position:absolute;${h(x, y, sz, sz)}background:var(--star);opacity:${tw * (st.starOp ?? 1)};border-radius:1px"></div>`;
  }
  // 雨丝
  for (let i = 0; i < 26; i++) {
    const sp = 0.6 + ((i * 29) % 40) / 60, x = (i * 271 + 37) % 1960 - 20;
    const y = ((t * 320 * sp + i * 173) % 1120) - 40;
    s += `<div style="position:absolute;${h(x, y, 1.6, 26)}background:var(--rain);opacity:${.9}"></div>`;
  }
  return s;
}

export function menubar(st) {
  const dark = st.theme === 'D';
  return `<div class="mb" style="position:absolute;left:0;top:0;width:1920px">
    <b>夜航</b><span>文件</span><span>编辑</span><span>显示</span><span>播放</span><span>窗口</span><span>帮助</span>
    <div class="r"><span>${dark ? '夜间模式' : '暮色模式'}</span><span>${st.hudKey || ''}</span>
    <span style="font-weight:700">${st.clock || '22:47'}</span><span>拼音</span></div></div>`;
}

export function dock(st, t) {
  const { x, y, w, h: hh } = L.dock;
  const cols = ['#4FC3F7', '#F2CD37', '#6C7BFF', '#F0703A', '#5FD3A8', '#E58384', '#8A7BFF', '#FFFFFF', '#FFD166', '#7FB6E8', '#CFC7B6'];
  let s = `<div class="dock" style="position:absolute;${h(x, y, w, hh)}">`;
  for (let i = 0; i < 11; i++) {
    const lit = i === 3 ? 1 : 0; // 音乐 app 亮着（正在播放）
    s += `<i style="background:linear-gradient(150deg,${cols[i]},${cols[i]}bb);box-shadow:inset 0 0 0 1px rgba(255,255,255,.22);${lit ? 'transform:translateY(-6px)' : ''}">
      <span style="position:absolute;left:8px;bottom:6px;width:36px;height:6px;background:rgba(255,255,255,.55);border-radius:3px"></span>
      ${lit ? `<span style="position:absolute;left:22px;top:-9px;width:8px;height:8px;background:#4FC3F7;border-radius:50%"></span>` : ''}</i>`;
  }
  return s + `</div>`;
}

// ---------- 播放器窗 ----------
export function player(st, t) {
  const p = st.pl || {}, W = L.win;
  const dark = st.theme === 'D';
  let s = `<div class="win" style="position:absolute;${h(W.x, W.y, W.w, W.h)}">`;
  // 标题栏
  s += `<div class="tbar"><div class="lights"><i></i><i></i><i></i></div>
    <div class="ttl" style="font-family:XK;font-size:17px;letter-spacing:2px">${p.ttl || '幻听'}　—　我们的歌单</div>
    <div class="xbtn" style="opacity:${p.xop ?? 1};transform:translate(${p.xoff || 0}px,${(p.xoff || 0) * -.75}px)">✕</div></div>`;
  s += `<div style="position:absolute;left:${-W.x}px;top:${-W.y}px;width:0;height:0">`;
  if (p.split) s += `<div style="position:absolute;left:${W.x}px;top:${W.y + 46}px;width:760px;height:610px;background:linear-gradient(90deg,rgba(90,107,216,.06),rgba(90,107,216,0))"></div>`;
  // 专辑卡
  const A = L.art, moon = p.artMoon ?? 1;
  s += `<div style="position:absolute;${h(A.x, A.y, A.s, A.s)}border-radius:18px;overflow:hidden;
     background:linear-gradient(160deg,${dark ? '#22294a,#141a30' : '#2b3a63,#4b5f9a'})">
     <div style="position:absolute;inset:0;background:
       radial-gradient(180px 140px at 72% 28%,rgba(255,240,190,${.55 * moon}),transparent 66%),
       radial-gradient(220px 180px at 18% 82%,rgba(229,131,132,${.35 * moon}),transparent 70%)"></div>
     <div style="position:absolute;left:74px;top:64px;width:96px;height:96px;border-radius:50%;
       background:radial-gradient(circle at 34% 30%,#FFF4D2,#FFE39B 60%,#F0C25C);
       box-shadow:0 0 44px rgba(255,225,150,${.7 * moon}),inset -14px -10px 22px rgba(180,140,60,.45)"></div>
     <div style="position:absolute;left:52px;top:86px;width:150px;height:150px;border-radius:50%;border:1px dashed rgba(255,255,255,.35);opacity:.7"></div>
     <div style="position:absolute;left:44px;top:78px;width:166px;height:166px;border-radius:50%;border:1px dashed rgba(255,255,255,.22)"></div>
     <div style="position:absolute;left:0;right:0;bottom:22px;text-align:center;font-family:XK;font-size:40px;color:#fff;letter-spacing:6px;text-shadow:0 2px 10px rgba(0,0,0,.35)">幻听</div>
   </div>`;
  // 曲目信息
  s += `<div style="position:absolute;${h(A.x, 512, 320, 30)}font-size:26px;font-weight:700;color:var(--ink);letter-spacing:1px">${p.name || '幻听'}</div>
    <div style="position:absolute;${h(A.x, 548, 320, 20)}font-size:14px;color:var(--mute);letter-spacing:.6px">许嵩　—　梦游计</div>`;
  // 进度条
  const pr = p.prog ?? 0.02, P = L.prog;
  s += `<div style="position:absolute;${h(P.x, P.y, P.w, 4)}background:var(--line2);border-radius:2px"></div>
    <div style="position:absolute;${h(P.x, P.y, Math.max(3, P.w * pr), 4)}background:${dark ? '#F2A0C0' : '#D97757'};border-radius:2px"></div>
    <div style="position:absolute;${h(P.x + P.w * pr - 6, P.y - 5, 12, 14)}border-radius:4px;background:#fff;box-shadow:0 2px 8px rgba(0,0,0,.25)"></div>
    <div style="position:absolute;${h(P.x, P.y + 14, 60, 16)}font-size:11px;color:var(--mute);font-variant-numeric:tabular-nums">${fmtTime(pr * 30.6)}</div>
    <div style="position:absolute;${h(P.x + P.w - 40, P.y + 14, 44, 16)}font-size:11px;color:var(--mute);text-align:right;font-variant-numeric:tabular-nums">-${fmtTime((1 - pr) * 30.6)}</div>`;
  // 控制条
  const cy = 646;
  s += `<div style="position:absolute;${h(A.x, cy, 300, 44)}display:flex;align-items:center;gap:16px">
     <span style="font-size:13px;color:var(--mute)">⤨</span>
     <span style="font-size:17px;color:var(--ink2)">◀◀</span>
     <span style="width:42px;height:42px;border-radius:50%;background:${dark ? '#F2EFE8' : '#2A241E'};color:${dark ? '#141a30' : '#fff'};display:flex;align-items:center;justify-content:center;font-size:15px">${p.playing === false ? '▶' : '❚❚'}</span>
     <span style="font-size:17px;color:var(--ink2)">▶▶</span>
     <span style="font-size:13px;color:var(--mute)">↻</span></div>`;
  // 音量 + 心
  const V = L.vol, vol = p.vol ?? .55;
  s += `<div style="position:absolute;${h(A.x, 700, 24, 20)}font-size:14px;color:var(--mute)">🔈</div>
    <div style="position:absolute;${h(V.x, V.y, V.w, 4)}background:var(--line2);border-radius:2px"></div>
    <div style="position:absolute;${h(V.x, V.y, Math.max(3, V.w * vol), 4)}background:${p.volPink ? '#E58384' : (dark ? '#F2EFE8' : '#2A241E')};border-radius:2px"></div>
    <div style="position:absolute;${h(V.x + V.w * vol - 6, V.y - 5, 12, 14)}border-radius:4px;background:${p.volPink ? '#E58384' : '#fff'};box-shadow:0 2px 6px rgba(0,0,0,.28);${p.knobGlow ? 'box-shadow:0 0 18px rgba(229,131,132,.95)' : ''}"></div>`;
  s += `<div style="position:absolute;${h(L.heart.x, 694, 26, 26)}font-size:20px;color:${p.heart ? '#E0543A' : 'var(--faint)'};${p.heartPulse ? `transform:scale(${1 + .3 * p.heartPulse})` : ''}">♥</div>`;
  // 音量 popover（她从里面爬出来）
  if (p.popover > 0) {
    const o = p.popover, px = 146, py = 624;
    s += `<div style="position:absolute;${h(px, py + (1 - o) * 8, 140, 92)}border-radius:14px;background:var(--win);opacity:${o};
      box-shadow:0 0 0 1px rgba(0,0,0,.07),0 20px 46px rgba(0,0,0,.28);transform:scale(${.94 + .06 * o});transform-origin:50% 100%;padding:12px 14px">
      <div style="font-size:10.5px;color:var(--mute);letter-spacing:.4px">音量</div>
      <div style="margin-top:12px;position:relative;height:6px;border-radius:3px;background:var(--line)">
        <div style="position:absolute;left:0;top:0;height:6px;width:${clamp(vol, 0, 1) * 100}%;border-radius:3px;background:#E58384"></div>
        <div style="position:absolute;left:calc(${clamp(vol, 0, 1) * 100}% - 8px);top:-5px;width:16px;height:16px;border-radius:50%;background:#E58384;box-shadow:0 0 16px rgba(229,131,132,.9)"></div>
      </div>
      <div style="margin-top:14px;display:flex;gap:10px;font-size:10.5px;color:var(--faint)"><span>🔈</span><span style="margin-left:auto">${Math.round(clamp(vol,0,1)*100)}</span></div>
    </div>`;
  }
  // 歌单
  const L0 = L.list;
  s += `<div style="position:absolute;${h(L0.x, 168, 260, 26)}font-size:20px;font-weight:700;color:var(--ink);letter-spacing:1px">我们的歌单</div>`;
  const mem = p.member || '1人';
  s += `<div style="position:absolute;${h(L.member.x, L.member.y, L.member.w, L.member.h)}border-radius:16px;
     background:${p.memberHot > 0 ? 'rgba(229,131,132,' + (.25 + .5 * p.memberHot) + ')' : 'var(--chip)'};
     display:flex;align-items:center;justify-content:center;gap:9px;font-size:19px;letter-spacing:.5px;color:${p.memberHot > 0 ? '#fff' : 'var(--mute)'}">
     <span style="width:9px;height:9px;border-radius:50%;background:${p.memberHot > 0 ? '#fff' : '#5FD3A8'}"></span>${mem}在听</div>`;
  // 行
  const rows = p.rows || [];
  rows.forEach((r, i) => {
    const y = L0.y + i * (L0.rowH + L0.gap) - (p.scroll || 0);
    if (y < 150 || y > 740) return;
    const op = r.op ?? 1, lit = r.lit ? 1 : 0;
    s += `<div style="position:absolute;${h(L0.x, y, L0.w, L0.rowH)}border-radius:10px;opacity:${op};
       background:${lit ? 'var(--rowA)' : 'var(--row)'};box-shadow:${lit ? '0 6px 18px rgba(0,0,0,.10)' : 'none'};
       display:flex;align-items:center;padding:0 14px;gap:14px">
       <div style="width:44px;height:44px;border-radius:9px;overflow:hidden;background:linear-gradient(150deg,${r.c},${r.c}aa);position:relative;flex:none;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)">
         <span style="position:absolute;left:6px;top:6px;width:32px;height:32px;border-radius:50%;background:rgba(255,255,255,.18)"></span>
         <span style="position:absolute;left:13px;bottom:15px;width:18px;height:3px;border-radius:2px;background:rgba(255,255,255,.92)"></span>
         <span style="position:absolute;left:13px;bottom:9px;width:11px;height:3px;border-radius:2px;background:rgba(255,255,255,.6)"></span></div>
       <div style="flex:1;min-width:0">
         <div style="font-size:17.5px;color:var(--ink);font-weight:${lit ? 700 : 500};white-space:nowrap;overflow:hidden">${r.t}</div>
         <div style="font-size:13px;color:var(--mute);margin-top:2px">许嵩${r.sub ? ' · ' + r.sub : ''}</div></div>
       ${r.tag ? `<div style="font-size:12.5px;color:#E58384;background:rgba(229,131,132,.14);border:1px solid rgba(229,131,132,.35);border-radius:9px;padding:3px 8px;flex:none">${r.tag}</div>` : ''}
       <div style="font-size:13px;color:var(--faint);flex:none;font-variant-numeric:tabular-nums">${r.d || ''}</div>
       ${lit ? `<div style="font-size:12px;color:${r.c};flex:none">▮▮▮</div>` : ''}
     </div>`;
  });
  // 滚动条（分屏长列表时出现，他站在上面）
  if (p.longList) {
    const top = 214, hgt = 4 * 76 - 4, th = hgt * 0.45, ty = top + ((p.scroll || 0) / 336) * (hgt - th);
    s += `<div style="position:absolute;${h(1092, top, 7, hgt)}border-radius:4px;background:var(--line)"></div>
      <div style="position:absolute;${h(1092, ty, 7, Math.max(28, th))}border-radius:4px;background:${dark ? '#8A7BFF' : '#B9AE9C'}"></div>`;
  }
  // 预览卡
  if (p.card) {
    const c = p.card;
    s += `<div style="position:absolute;${h(c.x, c.y, 340, 168)}border-radius:14px;background:var(--win);opacity:${c.op ?? 1};
      box-shadow:0 0 0 1px rgba(0,0,0,.06),0 24px 50px rgba(0,0,0,.28);transform:translateY(${c.dy || 0}px) scale(${c.sc || 1});transform-origin:20% 0;padding:16px 18px">
      <div style="display:flex;gap:12px;align-items:center">
        <div style="width:44px;height:44px;border-radius:9px;background:linear-gradient(150deg,#F2CD37,#F2CD37aa)"></div>
        <div><div style="font-size:15px;color:var(--ink);font-weight:700">晴天</div>
        <div style="font-size:11px;color:var(--mute);margin-top:3px">周杰伦 · 4:29</div></div>
        <div style="margin-left:auto;width:26px;height:26px;border-radius:50%;background:#E58384;box-shadow:0 0 0 3px rgba(229,131,132,.25)"></div>
      </div>
      <div style="margin-top:12px;font-size:13px;color:var(--ink2);line-height:1.7">「睡前听这首」</div>
      <div style="margin-top:6px;font-size:11px;color:var(--mute);letter-spacing:.4px">2026-03-14　23:12　·　她分享的</div>
    </div>`;
  }
  // 评论角标
  s += `<div style="position:absolute;${h(L0.x, 660, 120, 26)}font-size:11.5px;color:var(--mute);display:flex;align-items:center;gap:6px">
    <span style="background:var(--chip);border-radius:8px;padding:4px 9px;${p.commentHot ? 'color:#E58384;background:rgba(229,131,132,.2)' : ''}">评论 ${p.comment || 37}</span></div>
   <div style="position:absolute;${h(L0.x + 130, 660, 120, 26)}font-size:11.5px;color:var(--mute)"><span style="background:var(--chip);border-radius:8px;padding:4px 9px">最近播放</span></div>`;
  return s + `</div></div>`;
}
const fmtTime = s => { const m = Math.floor(s / 60), r = Math.floor(s % 60); return m + ':' + String(r).padStart(2, '0'); };

// ---------- 聊天窗 ----------
export function imWin(st, t) {
  const I = L.im, p = st.im || {};
  const op = p.op ?? 1, dy = p.dy || 0, gray = p.gray || 0;
  let s = `<div class="win" style="position:absolute;${h(I.x, I.y + dy, I.w, I.h)}opacity:${op};background:${gray > 0 ? 'var(--win2)' : 'var(--win)'}">`;
  s += `<div class="tbar" style="height:50px"><div class="lights"><i></i><i></i><i></i></div>
    <div class="ttl" style="font-size:17px">回声</div>
    <div style="position:absolute;right:16px;top:16px;font-size:14px;color:${gray ? 'var(--faint)' : '#5FD3A8'}">● ${gray ? '已离线' : '在线'}</div></div>`;
  s += `<div style="position:absolute;left:16px;right:16px;top:62px;font-size:14px;color:var(--faint);text-align:center">2026-03-14</div>`;
  // 她的消息（左）
  s += `<div style="position:absolute;left:18px;top:92px;max-width:352px;opacity:${gray ? .45 : 1}">
      <div style="display:flex;gap:10px;align-items:flex-start">
        <div style="width:34px;height:34px;border-radius:9px;background:#E58384;flex:none"></div>
        <div style="background:var(--rowA);border-radius:14px 14px 14px 4px;padding:12px 16px;font-size:19px;color:var(--ink);line-height:1.55">好呀，我等你。</div></div></div>`;
  // 他的消息（右）
  s += `<div style="position:absolute;right:18px;top:172px;max-width:352px;opacity:${gray ? .45 : 1}">
      <div style="display:flex;gap:10px;align-items:flex-start;flex-direction:row-reverse">
        <div style="width:34px;height:34px;border-radius:9px;background:#D97757;flex:none"></div>
        <div style="background:${p.hisBubble || '#D97757'};color:#fff;border-radius:14px 14px 4px 14px;padding:12px 16px;font-size:19px;line-height:1.55">你好呀，以后每天都来找你玩</div></div></div>`;
  // 正在输入
  const ty = p.typing || 0;
  if (ty > 0) {
    s += `<div style="position:absolute;left:18px;top:286px;opacity:${gray ? .5 : .95}">
      <div style="display:flex;gap:10px;align-items:center">
        <div style="width:34px;height:34px;border-radius:9px;background:#E58384;flex:none"></div>
        <div style="background:var(--rowA);border-radius:14px;padding:14px 16px;display:flex;gap:7px;align-items:center">
          ${[1, 2, 3].map(i => `<span style="width:9px;height:9px;border-radius:50%;background:${i <= ty ? 'var(--mute)' : 'var(--faint)'};opacity:${i <= ty ? 1 : .3};transform:translateY(${i === ty ? '-3px' : '0'})"></span>`).join('')}
        </div></div></div>`;
  }
  // 日期分隔 / 空提示
  s += `<div style="position:absolute;left:16px;right:16px;top:246px;display:flex;align-items:center;gap:8px;opacity:.8">
      <span style="flex:1;height:1px;background:var(--line)"></span>
      <span style="font-size:14px;color:var(--faint);white-space:nowrap">3 月 14 日之后，没有新消息</span>
      <span style="flex:1;height:1px;background:var(--line)"></span></div>`;
  // 输入框
  {
    s += `<div style="position:absolute;left:16px;right:16px;bottom:14px;height:56px;border-radius:13px;background:var(--rowA);
      box-shadow:inset 0 0 0 1px var(--line);display:flex;align-items:center;padding:0 16px;font-size:19px;color:var(--ink)">
      <span>${p.input || '<span style="color:var(--faint)">发消息…</span>'}</span>
      <span style="display:inline-block;width:2px;height:22px;background:${p.caretOn ? '#E58384' : 'transparent'};margin-left:2px"></span>
      <span style="margin-left:auto;font-size:15px;color:var(--faint)">⏎</span></div>`;
  }
  return s + `</div>`;
}

// ---------- 通知塔 ----------
export function notifs(st) {
  const N = L.notif;
  return (st.notifs || []).map((n, i) => {
    const y = N.y + i * (N.h + N.gap), op = n.op ?? 1, sc = n.sc ?? 1;
    const back = n.flip > 0;
    return `<div style="position:absolute;${h(N.x + (n.dx || 0), y, N.w, N.h)}border-radius:16px;opacity:${op};
      background:var(--win);box-shadow:0 0 0 1px rgba(0,0,0,.06),0 18px 40px rgba(0,0,0,.30);transform:scale(${sc});transform-origin:100% 0;
      padding:14px 16px;display:flex;gap:12px;align-items:center">
      <div style="width:44px;height:44px;border-radius:10px;background:${back ? 'var(--chip)' : 'linear-gradient(150deg,#E58384,#E58384aa)'};flex:none"></div>
      <div style="flex:1;min-width:0">
        <div style="font-size:13.5px;color:var(--mute);letter-spacing:.3px">${back ? '已读' : '回声 · 刚刚'}</div>
        <div style="font-size:17.5px;color:var(--ink);margin-top:3px;white-space:nowrap;overflow:hidden">${n.text}</div></div>
      ${back ? '' : '<div style="font-size:11px;color:var(--faint)">›</div>'}
    </div>`;
  }).join('');
}

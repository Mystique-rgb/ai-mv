// All the paper art: page spreads, props, city. Flat fills, one dark-brown ink, a hard crescent shadow.
import { cv, paperFill, finishCut, GRAIN, INK, blob, sh, smoothClosed, rr } from './engine/paper.js';
import { mulberry, TAU, clamp, lerp } from './engine/lib.js';

export const PPM = 7000;            // texture pixels per metre
export const PW = 2048, PH = Math.round(2048 * .30 / .44);
export const gx = xm => (xm / .44 + .5) * PW;     // page metres → page pixels
export const gz = zm => zm / .30 * PH;
export const sy = ym => (1 - ym / .30) * PH;

export const C = {
  paper: '#f6efdd', paper2: '#efe4cb', ink: INK,
  terra: '#d97757', terraL: '#e79a72', terraS: '#a2502f', terraK: '#5b2718',
  pink: '#e58384', pinkL: '#f2a8aa', pinkS: '#a85660', pinkK: '#5a2a30',
  red: '#c8402f', gold: '#e8a33d', navy: '#2e4a7d', green: '#2f7a6b', cream: '#f4e9cf',
  night: '#2b3a63', nightDeep: '#1b2444', gray: '#9a938b',
};

// ---------- canvas helpers ----------
function canvasOf(wm, hm, pad = 20) {
  const w = Math.round(wm * PPM) + pad * 2, h = Math.round(hm * PPM) + pad * 2;
  const c = cv(w, h), x = c.getContext('2d');
  x.translate(pad, pad);
  return { c, x, w, h, pad };
}
// item: {c, w, h, ax, ay} — w/h in metres, anchor at bottom centre
export function item(wm, hm, draw, o = {}) {
  const pad = o.pad ?? 16, { c, x, w, h } = canvasOf(wm, hm, pad);
  draw(x, wm * PPM, hm * PPM);
  const cut = finishCut(c, o.border ?? 12, { paper: o.paperCol || '#fffdf7', edge: o.edgeCol || '#b9ad9c' });
  return { c: cut, w: w / PPM, h: h / PPM, ax: o.ax ?? .5, ay: o.ay ?? 1 };
}
export function texItem(wm, hm, draw, o = {}) {          // no cut border (page surfaces)
  const pad = 0, { c, x } = canvasOf(wm, hm, pad);
  draw(x, wm * PPM, hm * PPM);
  return { c, w: wm, h: hm, ax: .5, ay: 0 };
}

function grain(x, w, h, a = .8) { x.save(); x.globalAlpha = a; x.fillStyle = x.createPattern(GRAIN, 'repeat'); x.fillRect(0, 0, w, h); x.restore(); }

// wobbling rounded box (paper is never a perfect rectangle)
function wob(x, px, py, w, h, r, seed = 1, amp = 3) {
  const R = mulberry(seed), n = 26, pts = [];
  for (let i = 0; i < n; i++) {
    const t = i / n, per = 2 * (w + h), d = t * per;
    let ax, ay;
    if (d < w) { ax = px + d; ay = py; }
    else if (d < w + h) { ax = px + w; ay = py + d - w; }
    else if (d < 2 * w + h) { ax = px + w - (d - w - h); ay = py + h; }
    else { ax = px; ay = py + h - (d - 2 * w - h); }
    const k = 1 + (R() - .5) * amp / Math.max(w, h);
    pts.push([px + w / 2 + (ax - px - w / 2) * k, py + h / 2 + (ay - py - h / 2) * k]);
  }
  smoothClosed(x, pts);
}

// ---------- pages ----------
export function buildPages() {
  const P = {};
  const page = (fn, seed = 1) => { const c = cv(PW, PH), x = c.getContext('2d'); fn(x); grain(x, PW, PH, .8); return c; };

  // ===== A. the little room =====
  P.roomBack = page(x => {
    paperFill(x, PW, PH, '#f1e6d2', 3, .05);
    // wallpaper stripes
    for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? 'rgba(214,190,158,.35)' : 'rgba(255,255,255,.35)'; x.fillRect(i * PW / 16, 0, PW / 32, PH); }
    // window: navy night with rain and one neon smear
    const wx = PW * .12, wy = PH * .16, ww = PW * .40, wh = PH * .46;
    x.fillStyle = '#20284a'; x.fillRect(wx, wy, ww, wh);
    const gr = x.createLinearGradient(wx, wy, wx + ww, wy + wh); gr.addColorStop(0, 'rgba(53,224,240,.22)'); gr.addColorStop(.55, 'rgba(20,24,44,0)'); gr.addColorStop(1, 'rgba(255,61,138,.26)');
    x.fillStyle = gr; x.fillRect(wx, wy, ww, wh);
    const R = mulberry(11);
    for (let i = 0; i < 40; i++) { const px = wx + R() * ww, py = wy + R() * wh, l = 20 + R() * 60; x.strokeStyle = `rgba(200,225,255,${.10 + R() * .25})`; x.lineWidth = 2 + R() * 3; x.beginPath(); x.moveTo(px, py); x.lineTo(px - 6, py + l); x.stroke(); }
    // window frame (paper strips)
    x.fillStyle = '#f9f1e0'; x.strokeStyle = INK; x.lineWidth = 9;
    x.fillRect(wx - 18, wy - 18, ww + 36, 26); x.strokeRect(wx - 18, wy - 18, ww + 36, 26);
    x.fillRect(wx - 18, wy + wh - 8, ww + 36, 26); x.strokeRect(wx - 18, wy + wh - 8, ww + 36, 26);
    x.fillRect(wx - 18, wy - 18, 26, wh + 36); x.strokeRect(wx - 18, wy - 18, 26, wh + 36);
    x.fillRect(wx + ww - 8, wy - 18, 26, wh + 36); x.strokeRect(wx + ww - 8, wy - 18, 26, wh + 36);
    x.fillRect(wx + ww * .48, wy, 14, wh);
    // hand-written song list taped to the wall
    const lx = PW * .62, ly = PH * .26, lw = PW * .27, lh = PH * .34;
    x.save(); x.translate(lx, ly); x.rotate(-.035);
    x.fillStyle = '#fdf6e3'; wob(x, 0, 0, lw, lh, 10, 5, 5); x.fill(); x.lineWidth = 7; x.strokeStyle = INK; x.stroke();
    x.fillStyle = 'rgba(210,190,160,.6)'; x.fillRect(0, 0, lw, 18);
    x.fillStyle = '#3a2a24'; x.font = '600 46px Xingkai'; x.textBaseline = 'top';
    ['幻听', '晴天', '夜曲', '后来'].forEach((s, i) => { x.fillText(`${i + 1}.  ${s}`, 34, 46 + i * 72); });
    x.strokeStyle = 'rgba(90,70,50,.35)'; x.lineWidth = 3;
    for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(34, 104 + i * 72); x.lineTo(lw - 40, 104 + i * 72); x.stroke(); }
    x.restore();
    // skirting
    x.fillStyle = '#ddc8a8'; x.fillRect(0, PH - 60, PW, 60); x.fillStyle = INK; x.fillRect(0, PH - 64, PW, 6);
  }, 1);

  P.roomGround = page(x => {
    paperFill(x, PW, PH, '#e7cfae', 4, .05);
    for (let i = 0; i < 13; i++) { x.strokeStyle = 'rgba(150,110,70,.32)'; x.lineWidth = 4; x.beginPath(); x.moveTo(0, i * PH / 12.5); x.lineTo(PW, i * PH / 12.5); x.stroke(); }
    const R = mulberry(21);
    for (let i = 0; i < 60; i++) { x.strokeStyle = `rgba(140,100,65,${.05 + R() * .1})`; x.lineWidth = 2; const y = R() * PH; x.beginPath(); x.moveTo(R() * PW, y); x.lineTo(R() * PW, y); x.stroke(); }
    // the torn page: her place, right of the gutter
    x.save();
    const tx = PW * .58, ty = PH * .1, tw = PW * .34, th = PH * .74;
    x.beginPath(); x.moveTo(tx, ty);
    for (let i = 0; i <= 18; i++) x.lineTo(tx + tw * (i / 18), ty + Math.sin(i * 2.3) * 9 + (i % 3) * 5);
    for (let i = 0; i <= 12; i++) x.lineTo(tx + tw + Math.cos(i * 3.1) * 10, ty + th * (i / 12));
    for (let i = 18; i >= 0; i--) x.lineTo(tx + tw * (i / 18), ty + th + Math.sin(i * 4.1) * 8);
    for (let i = 12; i >= 0; i--) x.lineTo(tx + Math.cos(i * 2.7) * 9, ty + th * (i / 12));
    x.closePath(); x.fillStyle = '#f7f0de'; x.fill();
    x.setLineDash([16, 14]); x.lineWidth = 5; x.strokeStyle = 'rgba(120,100,80,.5)'; x.stroke(); x.setLineDash([]);
    x.restore();
    // rug
    x.fillStyle = 'rgba(200,64,47,.30)'; x.beginPath(); x.ellipse(PW * .26, PH * .62, PW * .21, PH * .3, 0, 0, TAU); x.fill();
  }, 2);

  // ===== B. night =====
  P.nightBack = page(x => {
    const g = x.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, '#141c3c'); g.addColorStop(.62, '#26365f'); g.addColorStop(1, '#3b4a72');
    x.fillStyle = g; x.fillRect(0, 0, PW, PH);
    const R = mulberry(7);
    for (let i = 0; i < 210; i++) { x.beginPath(); x.arc(R() * PW, R() * PH * .8, .8 + R() * 2.4, 0, TAU); x.fillStyle = `rgba(255,248,220,${.25 + R() * .6})`; x.fill(); }
    // far skyline: dark towers with a few lit windows
    for (let i = 0; i < 13; i++) {
      const r = mulberry(60 + i), w = 60 + r() * 120, hh = 120 + r() * 380, px = i * PW / 13 - 20, py = PH - hh - 40;
      x.fillStyle = '#1d2848'; x.fillRect(px, py, w, hh);
      for (let k = 0; k < 26; k++) { if (r() < .55) continue; x.fillStyle = ['#ffcf8a', '#8fe0e8', '#ff9ec1'][(r() * 3) | 0]; x.fillRect(px + 10 + (k % 4) * 26, py + 12 + ((k / 4) | 0) * 28, 10, 12); }
    }
    x.fillStyle = 'rgba(255,255,255,.05)'; x.fillRect(0, PH - 90, PW, 90);
  }, 3);

  P.nightGround = page(x => {
    const g = x.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, '#3a4670'); g.addColorStop(1, '#252e4e');
    x.fillStyle = g; x.fillRect(0, 0, PW, PH);
    const R = mulberry(33);
    for (let i = 0; i < 26; i++) {
      const px = R() * PW, py = R() * PH, rw = 60 + R() * 150, rh = rw * .32;
      x.fillStyle = `rgba(150,190,255,${.06 + R() * .1})`; x.beginPath(); x.ellipse(px, py, rw, rh, 0, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(210,230,255,.16)'; x.lineWidth = 3; x.beginPath(); x.ellipse(px, py, rw * .6, rh * .6, 0, 0, TAU); x.stroke();
    }
  }, 4);

  // ===== C. paper city =====
  P.cityBack = page(x => {
    const g = x.createLinearGradient(0, 0, 0, PH); g.addColorStop(0, '#1a2148'); g.addColorStop(.7, '#2c3a66'); g.addColorStop(1, '#4a5580');
    x.fillStyle = g; x.fillRect(0, 0, PW, PH);
    const R = mulberry(77);
    for (let i = 0; i < 120; i++) { x.beginPath(); x.arc(R() * PW, R() * PH * .6, .8 + R() * 2, 0, TAU); x.fillStyle = `rgba(255,250,225,${.2 + R() * .5})`; x.fill(); }
    // moon
    x.beginPath(); x.arc(PW * .78, PH * .2, 96, 0, TAU); x.fillStyle = '#fff6d5'; x.fill(); x.lineWidth = 6; x.strokeStyle = 'rgba(90,80,60,.35)'; x.stroke();
    x.beginPath(); x.arc(PW * .78 - 30, PH * .2 - 20, 20, 0, TAU); x.fillStyle = 'rgba(220,210,180,.5)'; x.fill();
    // skyline
    for (let i = 0; i < 17; i++) {
      const r = mulberry(200 + i), w = 80 + r() * 110, hh = 180 + r() * 460, px = i * PW / 17 - 30, py = PH - hh;
      x.fillStyle = ['#222c52', '#1b2344', '#2a3560'][i % 3]; x.fillRect(px, py, w, hh);
      for (let k = 0; k < 40; k++) { if (r() < .45) continue; x.fillStyle = ['#ffcf8a', '#8fe0e8', '#ff9ec1', '#f7f0d8'][(r() * 4) | 0]; x.fillRect(px + 12 + (k % 3) * 32, py + 16 + ((k / 3) | 0) * 34, 12, 14); }
    }
  }, 5);

  P.cityGround = page(x => {
    x.fillStyle = '#3b3a52'; x.fillRect(0, 0, PW, PH);
    // sidewalk band at the back, street in front
    x.fillStyle = '#6a6480'; x.fillRect(0, 0, PW, PH * .18);
    x.fillStyle = INK; x.fillRect(0, PH * .18, PW, 8);
    const R = mulberry(91);
    for (let i = 0; i < 9; i++) { x.fillStyle = 'rgba(255,255,255,.18)'; x.fillRect(i * PW / 9 + 40, PH * .55, PW / 22, 26); }
    for (let i = 0; i < 40; i++) { x.fillStyle = `rgba(20,18,30,${.05 + R() * .1})`; x.beginPath(); x.ellipse(R() * PW, PH * .3 + R() * PH * .65, 40 + R() * 90, 14 + R() * 26, 0, 0, TAU); x.fill(); }
    // neon reflections
    for (const [px, col] of [[.18, '#ff3d8a'], [.42, '#35e0f0'], [.66, '#ffcf5a'], [.86, '#e58384']]) {
      const g = x.createLinearGradient(0, PH * .2, 0, PH); g.addColorStop(0, col + 'aa'); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g; x.globalAlpha = .35; x.beginPath(); x.ellipse(PW * px, PH * .5, 46, PH * .34, 0, 0, TAU); x.fill(); x.globalAlpha = 1;
    }
  }, 6);

  // ===== D. the blank page =====
  P.blankBack = page(x => {
    paperFill(x, PW, PH, '#f5eedc', 41, .05);
    const R = mulberry(13);
    x.strokeStyle = 'rgba(90,88,84,.22)'; x.lineWidth = 3;
    for (let i = 0; i < 120; i++) { const px = R() * PW, py = R() * PH, l = 40 + R() * 90; x.beginPath(); x.moveTo(px, py); x.lineTo(px + l * .5, py + l * .5); x.stroke(); }
    // ghost of the room, in pencil only
    x.strokeStyle = 'rgba(90,88,84,.30)'; x.lineWidth = 5;
    x.strokeRect(PW * .12, PH * .18, PW * .34, PH * .42);
    x.beginPath(); x.moveTo(PW * .5, PH * .14); x.lineTo(PW * .94, PH * .14); x.stroke();
    // torn edge
    x.beginPath(); x.moveTo(PW * .955, 0);
    for (let i = 0; i <= 20; i++) x.lineTo(PW * .955 + Math.sin(i * 2.1) * 12, PH * i / 20);
    x.lineTo(PW, PH); x.lineTo(PW, 0); x.closePath(); x.fillStyle = '#e6dcc4'; x.fill();
  }, 7);

  P.blankGround = page(x => {
    paperFill(x, PW, PH, '#f6f0de', 43, .04);
    x.strokeStyle = 'rgba(120,115,105,.12)'; x.lineWidth = 2;
    for (let i = 0; i < 14; i++) { x.beginPath(); x.moveTo(0, i * PH / 13); x.lineTo(PW, i * PH / 13); x.stroke(); }
    for (let i = 0; i < 20; i++) { x.beginPath(); x.moveTo(i * PW / 19, 0); x.lineTo(i * PW / 19, PH); x.stroke(); }
  }, 8);

  return P;
}

// ---------- cover ----------
export function coverCanvases() {
  const w = 2048, h = Math.round(2048 * .30 / .44), c = cv(w, h), x = c.getContext('2d'), m = cv(w, h), y = m.getContext('2d');
  x.fillStyle = '#2a4a6b'; x.fillRect(0, 0, w, h);
  const R = mulberry(3);
  for (let i = 0; i < h; i += 4) { x.fillStyle = `rgba(0,0,0,${.04 + R() * .06})`; x.fillRect(0, i, w, 1.6); }
  for (let i = 0; i < w; i += 4) { x.fillStyle = `rgba(255,255,255,${.02 + R() * .03})`; x.fillRect(i, 0, 1.6, h); }
  y.fillStyle = 'rgb(0,235,0)'; y.fillRect(0, 0, w, h);
  const GOLD = '#e2b862';
  const both = fn => { x.save(); fn(x, GOLD); x.restore(); y.save(); fn(y, 'rgb(0,80,255)'); y.restore(); };
  both((k, col) => { k.strokeStyle = col; k.lineWidth = 8; k.strokeRect(110, 110, w - 220, h - 220); });
  both((k, col) => {
    k.fillStyle = col; k.textAlign = 'center'; k.textBaseline = 'middle';
    k.font = '150px Xingkai'; k.fillText('我们的歌', w * .5, h * .44);
    k.font = '54px Xingkai'; k.fillText('一本只有一个人在听的立体书', w * .5, h * .62);
  });
  // little paper clawd stamped in the corner
  both((k, col) => { k.strokeStyle = col; k.lineWidth = 6; k.strokeRect(w - 320, h - 300, 180, 160); });
  return { c, m };
}

// ---------- props ----------
export function clawdItem(o = {}) {
  const pink = !!o.pink;
  const P = pink ? { L: '#f9c1cf', M: '#ef7fa0', S: '#c25a80', K: '#7a2f4a' } : { L: C.terraL, M: C.terra, S: C.terraS, K: C.terraK };
  const eyes = o.eyes || 'flat', arm = o.arm || 0, lean = o.lean || 0, legs = o.legs ?? 0, bodyH = o.bodyH ?? 1, look = o.look || 0;
  // legPhase: 连续步态相位（弧度）。给了它就不再走 legs 的硬切两帧，而是四条腿按相位错开 —— 走路才有起伏。
  const legPhase = o.legPhase;
  const legAmp = o.legAmp ?? 1;
  const armSwing = o.armSwing || 0;
  return item(.054, .054, (x, w, h) => {
    x.save(); x.translate(w / 2, h); x.rotate(lean * .18);
    const bw = w * .74, bh = h * .58 * bodyH, bx = -bw / 2, by = -h * .78, r = bw * .17;
    // legs
    const lw = bw * .12, lh = h * .16;
    for (let i = 0; i < 4; i++) {
      const lx = bx + bw * (.12 + i * .25);
      let off = 0;
      if (legPhase !== undefined) off = Math.sin(legPhase + i * Math.PI / 2) * h * .042 * legAmp;
      else if (legs && i % 2) off = legs * h * .04;
      x.fillStyle = P.S; rr(x, lx, by + bh - 4 + off, lw, lh + 4, lw * .45); x.fill(); x.lineWidth = 7; x.strokeStyle = P.K; x.stroke();
      x.fillStyle = P.M; rr(x, lx, by + bh - 6 + off, lw, lh * .4, lw * .4); x.fill();
    }
    // arms
    if (arm || armSwing) {
      const ah = bh * .5;
      for (const s of [-1, 1]) {
        if (arm && s < 0 && arm < 0) continue;
        if (arm && s > 0 && arm > 0) continue;
        const sw = arm ? -s * arm * .9 : 0;
        const sg = armSwing ? s * Math.sin(armSwing + (s > 0 ? Math.PI : 0)) * .55 : 0;
        x.save(); x.translate(s * (bw / 2 + 2), by + bh * .3); x.rotate(sw + sg);
        x.fillStyle = P.M; rr(x, -lw * .5, 0, lw, ah, lw * .45); x.fill(); x.lineWidth = 7; x.strokeStyle = P.K; x.stroke();
        x.restore();
      }
    }
    // body
    x.fillStyle = P.M; wob(x, bx, by, bw, bh, r, pink ? 4 : 3, 4); x.fill();
    x.lineWidth = 9; x.strokeStyle = P.K; x.stroke();
    // crescent shadow (bottom-right inside)
    x.save(); wob(x, bx, by, bw, bh, r, pink ? 4 : 3, 4); x.clip();
    x.fillStyle = P.S; x.fillRect(bx + bw * .16, by + bh * .12, bw, bh);
    x.translate(-bw * .1, -bh * .1); x.fillStyle = P.M; wob(x, bx, by, bw, bh, r, pink ? 4 : 3, 4); x.fill();
    x.restore();
    // top light
    x.save(); wob(x, bx, by, bw, bh, r, pink ? 4 : 3, 4); x.clip();
    x.fillStyle = P.L; x.globalAlpha = .55; x.beginPath(); x.ellipse(bx + bw * .38, by + bh * .22, bw * .34, bh * .16, -.2, 0, TAU); x.fill(); x.restore();
    // eyes
    const ex = bw * .20, ey = by + bh * .42, er = bw * .105, lookX = look * bw * .05;
    x.fillStyle = '#2a1a14';
    for (const s of [-1, 1]) {
      const cx = s * ex + lookX;
      if (eyes === 'closed') { x.fillRect(cx - er, ey, er * 2, 7); }
      else if (eyes === 'wide') { x.beginPath(); x.arc(cx, ey, er * 1.5, 0, TAU); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(cx - er * .5, ey - er * .5, er * .5, 0, TAU); x.fill(); x.fillStyle = '#2a1a14'; }
      else if (eyes === 'up') { rr(x, cx - er, ey - er * 1.7, er * 2, er * 2.1, er * .8); x.fill(); }
      else if (eyes === 'squint') { rr(x, cx - er * 1.2, ey - er * .35, er * 2.4, er * .8, er * .4); x.fill(); }
      else { rr(x, cx - er * .9, ey - er * 1.25, er * 1.8, er * 2.2, er * .8); x.fill(); }
    }
    x.restore();
  }, { border: 13, paperCol: '#fffdf7' });
}

export function chairItem(seed = 1) {
  return item(.032, .052, (x, w, h) => {
    const wd = w * .78, ht = h * .95;
    x.fillStyle = '#c9a06a'; x.strokeStyle = INK; x.lineWidth = 8;
    x.beginPath(); x.roundRect(w * .1, h - ht * .38, wd, ht * .16, 8); x.fill(); x.stroke();      // seat
    x.beginPath(); x.roundRect(w * .1, h - ht, wd * .9, ht * .16, 8); x.fill(); x.stroke();         // back
    for (const lx of [.14, .74]) { x.beginPath(); x.roundRect(w * lx, h - ht * .26, w * .06, ht * .26, 6); x.fill(); x.stroke(); }
    x.strokeStyle = 'rgba(90,60,30,.5)'; x.lineWidth = 4; x.beginPath(); x.moveTo(w * .14, h - ht * .9); x.lineTo(w * .78, h - ht * .95); x.stroke();
  }, { seed });
}

export function cupItem(notch = false) {
  return item(.020, .024, (x, w, h) => {
    x.fillStyle = '#f3e7cf'; x.strokeStyle = INK; x.lineWidth = 8;
    x.beginPath(); x.moveTo(w * .2, h * .26); x.lineTo(w * .8, h * .26); x.lineTo(w * .7, h * .95); x.lineTo(w * .3, h * .95); x.closePath(); x.fill(); x.stroke();
    x.beginPath(); x.arc(w * .82, h * .46, w * .1, -.6, 1.4); x.stroke();
    x.fillStyle = '#8a5a34'; x.beginPath(); x.ellipse(w * .5, h * .28, w * .29, h * .07, 0, 0, TAU); x.fill();
    if (notch) { x.globalCompositeOperation = 'destination-out'; x.beginPath(); x.moveTo(w * .62, h * .3); x.lineTo(w * 1.02, h * .62); x.lineTo(w * .58, h * .72); x.closePath(); x.fill(); }
  });
}

export function deckItem() {
  return item(.130, .072, (x, w, h) => {
    x.fillStyle = '#4a4a5c'; x.strokeStyle = INK; x.lineWidth = 9;
    rr(x, w * .04, h * .16, w * .92, h * .78, 12); x.fill(); x.stroke();
    x.fillStyle = '#2f2f3d'; rr(x, w * .09, h * .22, w * .38, h * .50, 8); x.fill(); x.stroke();
    // reels
    for (const rx of [.18, .34]) {
      x.fillStyle = '#e8dcc0'; x.beginPath(); x.arc(w * rx, h * .47, w * .062, 0, TAU); x.fill(); x.lineWidth = 6; x.strokeStyle = INK; x.stroke();
      x.fillStyle = '#6b6259'; for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; x.fillRect(w * rx + Math.cos(a) * w * .03 - 3, h * .47 + Math.sin(a) * w * .03 - 3, 6, 6); }
    }
    // vu window
    x.fillStyle = '#f6efd9'; rr(x, w * .52, h * .24, w * .36, h * .26, 8); x.fill(); x.lineWidth = 6; x.stroke();
    x.strokeStyle = 'rgba(90,70,50,.5)'; x.lineWidth = 3;
    for (let i = 0; i < 7; i++) { const px = w * (.55 + i * .045); x.beginPath(); x.moveTo(px, h * .26); x.lineTo(px, h * .32 + i * 2); x.stroke(); }
    x.fillStyle = 'rgba(200,64,47,.6)'; x.fillRect(w * .79, h * .26, w * .08, h * .05);
    // buttons
    for (let i = 0; i < 5; i++) { x.fillStyle = i === 0 ? '#c8402f' : '#d9cdb4'; rr(x, w * (.08 + i * .13), h * .78, w * .09, h * .1, 4); x.fill(); x.lineWidth = 5; x.strokeStyle = INK; x.stroke(); }
    x.fillStyle = '#1d1d26'; x.fillRect(w * .04, h * .14, w * .92, h * .04);
  });
}

export function needleItem() {
  return item(.020, .020, (x, w, h) => {
    x.strokeStyle = '#c8402f'; x.lineWidth = 9; x.lineCap = 'round';
    x.beginPath(); x.moveTo(w * .5, h * .95); x.lineTo(w * .5, h * .12); x.stroke();
    x.fillStyle = '#c8402f'; x.beginPath(); x.arc(w * .5, h * .95, w * .09, 0, TAU); x.fill();
  }, { border: 8 });
}

export function phoneItem() {
  return item(.070, .082, (x, w, h) => {
    x.fillStyle = '#3f3f52'; x.beginPath(); x.arc(w * .5, h * .5, w * .40, Math.PI * .05, Math.PI * .95, true); x.lineWidth = w * .16; x.strokeStyle = '#3f3f52'; x.stroke();
    x.strokeStyle = INK; x.lineWidth = 9; x.beginPath(); x.arc(w * .5, h * .5, w * .40, Math.PI * .06, Math.PI * .94, true); x.stroke();
    for (const s of [-1, 1]) {
      x.save(); x.translate(w * .5 + s * w * .40, h * .52);
      x.fillStyle = '#c8402f'; rr(x, -w * .11, 0, w * .22, h * .40, w * .09); x.fill(); x.lineWidth = 8; x.strokeStyle = INK; x.stroke();
      x.fillStyle = '#8f2c22'; rr(x, -w * .11, h * .30, w * .22, h * .10, w * .05); x.fill();
      x.restore();
    }
    x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.arc(w * .42, h * .30, w * .07, 0, TAU); x.fill();
  });
}

export function waveItem() {
  return item(.115, .022, (x, w, h) => {
    x.strokeStyle = INK; x.lineWidth = 7; x.beginPath();
    for (let i = 0; i <= 40; i++) { const px = w * i / 40, py = h * (.5 + Math.sin(i * .9) * .28 * (1 - i / 60)); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
    x.strokeStyle = '#c8402f'; x.lineWidth = 4; x.beginPath();
    for (let i = 0; i <= 40; i++) { const px = w * i / 40, py = h * (.5 + Math.sin(i * 1.7) * .2); i ? x.lineTo(px, py) : x.moveTo(px, py); }
    x.stroke();
  }, { border: 8 });
}

export function moonItem() {
  return item(.040, .040, (x, w, h) => {
    x.beginPath(); x.arc(w * .5, h * .5, w * .42, 0, TAU); x.fillStyle = '#fff5d6'; x.fill(); x.lineWidth = 8; x.strokeStyle = 'rgba(120,100,70,.55)'; x.stroke();
    for (const [a, b, r] of [[.38, .40, .07], [.6, .58, .05], [.46, .64, .04]]) { x.beginPath(); x.arc(w * a, h * b, w * r, 0, TAU); x.fillStyle = 'rgba(226,214,180,.75)'; x.fill(); }
  });
}

export function rulerItem() {
  return item(.100, .050, (x, w, h) => {
    x.fillStyle = '#f7efd9'; x.strokeStyle = INK; x.lineWidth = 9; rr(x, w * .03, h * .12, w * .94, h * .66, 8); x.fill(); x.stroke();
    x.strokeStyle = INK; x.lineWidth = 5; x.fillStyle = '#3a2a24'; x.font = '600 26px Xingkai';
    for (let i = 0; i <= 10; i++) {
      const px = w * (.08 + i * .084);
      x.beginPath(); x.moveTo(px, h * .12); x.lineTo(px, h * (.12 + (i % 5 === 0 ? .22 : .13))); x.stroke();
      x.fillText(String(i), px - 8, h * .44);
    }
    x.fillStyle = 'rgba(200,64,47,.35)'; x.fillRect(w * .83, h * .12, w * .14, h * .66);
  });
}

export function blockItem(wm, hm, col, seed = 1, lit = 3) {
  return item(wm, hm, (x, w, h) => {
    x.fillStyle = col; x.strokeStyle = INK; x.lineWidth = 9;
    rr(x, w * .04, h * .04, w * .92, h * .9, 10); x.fill(); x.stroke();
    // roof slab
    x.fillStyle = 'rgba(255,255,255,.35)'; rr(x, w * .06, h * .04, w * .88, h * .10, 6); x.fill();
    const R = mulberry(seed);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 3; c++) {
      if (R() < .42) continue;
      x.fillStyle = ['#ffe6a8', '#c8f2f6', '#ffd0e0'][(R() * 3) | 0];
      x.fillRect(w * (.16 + c * .26), h * (.20 + r * .18), w * .16, h * .10);
    }
  });
}

export function carItem(col = '#c8402f') {
  return item(.036, .020, (x, w, h) => {
    x.fillStyle = col; x.strokeStyle = INK; x.lineWidth = 7;
    x.beginPath(); x.moveTo(w * .05, h * .82); x.lineTo(w * .12, h * .42); x.lineTo(w * .34, h * .26); x.lineTo(w * .70, h * .26); x.lineTo(w * .90, h * .46); x.lineTo(w * .96, h * .82); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#dff0f7'; x.fillRect(w * .36, h * .33, w * .16, h * .14); x.fillRect(w * .56, h * .33, w * .16, h * .14);
    x.fillStyle = '#2a1a14'; for (const px of [.24, .76]) { x.beginPath(); x.arc(w * px, h * .84, w * .09, 0, TAU); x.fill(); }
  });
}

export function figureItem(seed = 1) {
  return item(.020, .034, (x, w, h) => {
    x.fillStyle = C.gray; x.strokeStyle = INK; x.lineWidth = 7;
    x.beginPath(); x.arc(w * .5, h * .22, w * .17, 0, TAU); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(w * .5, h * .38); x.lineTo(w * .5, h * .74); x.lineWidth = w * .26; x.strokeStyle = C.gray; x.stroke();
    x.lineWidth = 7; x.strokeStyle = INK; x.beginPath(); x.moveTo(w * .5, h * .74); x.lineTo(w * .32, h * .96); x.moveTo(w * .5, h * .74); x.lineTo(w * .68, h * .96); x.stroke();
    x.beginPath(); x.moveTo(w * .5, h * .48); x.lineTo(w * .2, h * .6); x.moveTo(w * .5, h * .48); x.lineTo(w * .8, h * .6); x.stroke();
  });
}

export function ribbonItem(col, len = .30) {
  return item(len, .020, (x, w, h) => {
    x.fillStyle = col; x.beginPath();
    x.moveTo(0, h * .28); x.lineTo(w, h * .18); x.lineTo(w, h * .82); x.lineTo(0, h * .72); x.closePath(); x.fill();
    x.strokeStyle = 'rgba(60,40,30,.45)'; x.lineWidth = 4; x.setLineDash([18, 14]); x.beginPath(); x.moveTo(0, h * .5); x.lineTo(w, h * .5); x.stroke(); x.setLineDash([]);
  }, { border: 6 });
}

export function hairTieItem() {
  return item(.026, .026, (x, w, h) => {
    x.lineWidth = w * .16; x.strokeStyle = C.pinkS; x.beginPath(); x.arc(w * .5, h * .5, w * .34, 0, TAU); x.stroke();
    x.lineWidth = w * .1; x.strokeStyle = C.pink; x.beginPath(); x.arc(w * .5, h * .5, w * .34, .6, 3.2); x.stroke();
  }, { border: 10 });
}

export function butterflyItem() {
  return item(.016, .013, (x, w, h) => {
    x.fillStyle = '#ffe6a8'; x.strokeStyle = INK; x.lineWidth = 5;
    for (const s of [-1, 1]) { x.beginPath(); x.ellipse(w * (.5 + s * .18), h * .42, w * .17, h * .26, s * .5, 0, TAU); x.fill(); x.stroke(); }
    x.fillStyle = INK; x.fillRect(w * .49, h * .3, w * .03, h * .5);
  }, { border: 6 });
}

// small paper bits for particles (dust, rain, eraser)
export function bitItem(col, w = .006, h = .006, shape = 'rect') {
  return item(w, h, (x, W, H) => {
    x.fillStyle = col;
    if (shape === 'rect') x.fillRect(W * .1, H * .1, W * .8, H * .8);
    else if (shape === 'rain') { x.fillStyle = col; rr(x, W * .3, H * .05, W * .4, H * .9, W * .2); x.fill(); }
    else { x.beginPath(); x.arc(W / 2, H / 2, W * .42, 0, TAU); x.fill(); }
  }, { border: 4 });
}

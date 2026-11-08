// 镜头表：88 幅
import {
  W, H, FR, PAL, TX, clamp, lerp, seg, ss, eio, eo, ei, hash, mulberry, TAU,
  rgba, mix, smooth, poly, carve, wob, bokashi, kasumi, vtext, cartouche,
  frame, paper, seal, bigSeal, slipV, snow, petals, scraps, lantern, roof, houseRow,
  cityWall, hill, pineTree, blade, waterLines, crack, inkBlot, brushText, STX, mk,
  stampLayer, stampFn, PSET, dip, q8, BEAT
} from './base.js';
import { actor, kasa, ROLES, setInk } from './actor.js';
import { RIDGE, ridgePts, drawRun, ridgeInk, ridgeBlocks, woodBlock, firstPic } from './scenes.js';

// 只有线的一版（前奏用）
let _ink = null;
function inkPic() {
  if (_ink) return _ink;
  const c = mk(), x = c.getContext('2d');
  x.fillStyle = PAL.paper; x.fillRect(0, 0, W, H);
  x.drawImage(TX.fiber, 0, 0);
  setInk(true); ridgeInk(x, 3); setInk(false);
  x.drawImage(TX.fiber, 0, 0);
  return (_ink = c);
}

// 切纸/木屑
function chips(x, cx, cy, t, n, seed) {
  const R = mulberry(seed);
  for (let i = 0; i < n; i++) {
    const a = -1.7 + R() * 1.4, v = 120 + R() * 260, t0 = R() * .25;
    const tt = Math.max(0, t - t0), px = cx + Math.cos(a) * v * tt, py = cy + Math.sin(a) * v * tt + 900 * tt * tt;
    if (tt > 1.1) continue;
    const s = 4 + R() * 7, rot = tt * (6 + R() * 8);
    x.save(); x.translate(px, py); x.rotate(rot); x.globalAlpha = clamp(1.2 - tt);
    x.fillStyle = '#e6d3ae'; x.fillRect(-s / 2, -s * .3, s, s * .6);
    x.strokeStyle = 'rgba(60,40,20,.5)'; x.lineWidth = .8; x.strokeRect(-s / 2, -s * .3, s, s * .6);
    x.restore();
  }
  x.globalAlpha = 1;
}

// ================= 前奏 0–22.30 =================
const P0 = [
  {
    id: 'V00', t0: 0, t1: 2.60, seg: 'P', cache: false, noFrame: true,
    still(x) {
      paper(x);
      // 日晒差：右上暖、左下冷
      const g = x.createRadialGradient(1650, 200, 100, 1650, 200, 1400);
      g.addColorStop(0, 'rgba(214,178,120,.14)'); g.addColorStop(1, 'rgba(120,110,90,.10)');
      x.fillStyle = g; x.fillRect(0, 0, W, H);
    },
    live(x, t) {
      // 一根几乎看不见的线，两拍延两次
      const len = 62 * clamp(seg(t, .87, 1.6)) + 62 * clamp(seg(t, 1.74, 2.45));
      if (len > 1) {
        x.strokeStyle = rgba(PAL.sumi, .9); x.lineWidth = 1.3; x.lineCap = 'round';
        x.beginPath(); x.moveTo(1562, 128); x.lineTo(1562 + len * .97, 128 + len * .24); x.stroke();
      }
    },
    ui(x, t, lt, S) {
      seal(x, '宿', 232, 898, 104, ss(seg(t, .12, .62)), { seed: 5, rot: .02 });
    },
  },
  {
    id: 'V01', t0: 2.60, t1: 5.20, seg: 'P', cache: false, noFrame: true,
    cam: (t, lt) => ({ z: 1 + .06 * ss(seg(lt, 0, 2.6)), cy: 540 - 20 * ss(seg(lt, 0, 2.6)) }),
    live(x, t, lt) {
      woodBlock(x);
      const pts = ridgePts();
      const N = 6, k = Math.floor(lt / BEAT);
      // 每一刀刻开一段
      for (let i = 0; i <= Math.min(N - 1, k); i++) {
        const u0 = i / N, u1 = Math.min(1, (i + 1) / N);
        const p = i < k ? 1 : clamp((lt - i * BEAT) / (BEAT * .8));
        drawRun(x, pts, u0, u0 + (u1 - u0) * p, 8, PAL.sumi);
      }
      if (k < N) {
        const u = Math.min(N - 1, k) / N + clamp((lt - k * BEAT) / (BEAT * .8)) / N;
        const idx = Math.floor(u * (pts.length - 1)), q = pts[Math.min(pts.length - 1, idx)];
        chips(x, q[0], q[1], clamp((lt - k * BEAT) / BEAT), 12, 40 + k);
        // 刻刀
        x.save(); x.translate(q[0] + 26, q[1] - 24); x.rotate(-.5);
        x.fillStyle = '#5b4630'; x.fillRect(-6, -110, 12, 110);
        x.strokeStyle = PAL.sumi; x.lineWidth = 1.6; x.strokeRect(-6, -110, 12, 110);
        x.beginPath(); x.moveTo(-5, 0); x.lineTo(-1, 22); x.lineTo(1, 22); x.lineTo(5, 0); x.closePath();
        x.fillStyle = '#cfd6d8'; x.fill(); x.stroke();
        x.restore();
      }
    },
  },
  {
    id: 'V02', t0: 5.20, t1: 8.00, seg: 'P', cache: false, noFrame: true,
    cam: (t, lt) => ({ cx: 960 + 120 * (1 - ss(seg(lt, 0, 2.8))), z: 1.02 }),
    live(x, t, lt) {
      const prog = clamp(seg(lt, .1, 2.3));
      woodBlock(x, prog);
      // 墨辊
      const rx = lerp(-160, 2080, prog), ry = 560;
      x.save(); x.translate(rx, ry);
      x.fillStyle = '#3a2f26'; x.fillRect(-26, -150, 52, 300);
      x.strokeStyle = PAL.sumi; x.lineWidth = 2.4; x.strokeRect(-26, -150, 52, 300);
      x.fillStyle = '#6b5844'; x.fillRect(-26, -150, 52, 16); x.fillRect(-26, 134, 52, 16);
      x.fillStyle = '#241d18'; x.fillRect(-40, -180, 80, 30);
      x.strokeStyle = PAL.sumi; x.strokeRect(-40, -180, 80, 30);
      // 墨光
      const g = x.createLinearGradient(-26, 0, 26, 0);
      g.addColorStop(0, 'rgba(255,255,255,.06)'); g.addColorStop(.4, 'rgba(255,255,255,.22)'); g.addColorStop(1, 'rgba(255,255,255,.04)');
      x.fillStyle = g; x.fillRect(-26, -150, 52, 300);
      x.restore();
    },
  },
  {
    id: 'V03', t0: 8.00, t1: 10.80, seg: 'P', cache: false, noFrame: true,
    live(x, t, lt) {
      woodBlock(x, 1);
      // 纸从上方垂下，盖住整块版
      const k = q8(lt), p = clamp(k / 2.2);
      const yEdge = lerp(-120, 1120, p);
      if (yEdge > 0) {
        x.save(); x.beginPath();
        x.moveTo(-40, -200); x.lineTo(W + 40, -200); x.lineTo(W + 40, yEdge - 26);
        for (let i = 0; i <= 8; i++) {
          const u = 1 - i / 8, px = 40 + u * (W - 80);
          x.lineTo(px, yEdge - 26 + Math.sin(u * 5.2 + 1) * 26 + Math.sin(u * 11) * 8);
        }
        x.lineTo(-40, yEdge - 26); x.closePath();
        x.fillStyle = PAL.paper; x.fill();
        x.restore();
        // 纸下透出的墨影
        x.save(); x.beginPath(); x.rect(0, 0, W, Math.max(0, yEdge - 40)); x.clip();
        x.globalAlpha = .10; x.strokeStyle = PAL.sumi; x.lineWidth = 26; x.lineCap = 'round';
        const pts = ridgePts(); x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const q of pts) x.lineTo(q[0], q[1]); x.stroke();
        x.restore();
        // 纸缘投影
        x.strokeStyle = 'rgba(60,50,40,.28)'; x.lineWidth = 3;
        x.beginPath(); for (let i = 0; i <= 8; i++) { const u = i / 8, px = 40 + u * (W - 80), py = yEdge - 26 + Math.sin(u * 5.2 + 1) * 26 + Math.sin(u * 11) * 8; i ? x.lineTo(px, py) : x.moveTo(px, py); } x.stroke();
      }
    },
  },
  {
    id: 'V04', t0: 10.80, t1: 13.40, seg: 'P', cache: false, noFrame: true,
    live(x, t, lt) {
      paper(x);
      const IC = inkPic();
      // 马连打圈
      const a = lt * 3.4, cx = 900 + Math.cos(a) * 210, cy = 560 + Math.sin(a) * 150;
      const r = lerp(90, 1150, ss(seg(lt, .15, 2.4)));
      x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.clip();
      x.drawImage(IC, 0, 0);
      x.restore();
      // 擦痕边
      x.save(); x.beginPath(); x.arc(cx, cy, r, 0, TAU);
      x.strokeStyle = 'rgba(120,100,70,.30)'; x.lineWidth = 46; x.stroke();
      x.restore();
      // 马连
      x.save(); x.translate(cx, cy); x.rotate(lt * 2);
      x.beginPath(); x.arc(0, 0, 74, 0, TAU);
      const g = x.createRadialGradient(-20, -24, 8, 0, 0, 78);
      g.addColorStop(0, '#c8a877'); g.addColorStop(1, '#7d5f3a');
      x.fillStyle = g; x.fill();
      x.strokeStyle = PAL.sumi; x.lineWidth = 3; x.stroke();
      x.strokeStyle = 'rgba(60,42,24,.55)'; x.lineWidth = 1.4;
      for (let i = 0; i < 26; i++) { const aa = i / 26 * TAU; x.beginPath(); x.moveTo(Math.cos(aa) * 12, Math.sin(aa) * 12); x.lineTo(Math.cos(aa) * 70, Math.sin(aa) * 70); x.stroke(); }
      x.fillStyle = '#4a3620'; x.beginPath(); x.arc(0, 0, 16, 0, TAU); x.fill();
      x.restore();
    },
  },
  {
    id: 'V05', t0: 13.40, t1: 16.20, seg: 'P', cache: false, noFrame: true,
    cam: (t, lt) => ({ cy: 540 - 18 * ss(seg(lt, 0, 2.6)) }),
    live(x, t, lt) {
      const p = eo(seg(lt, .1, 2.3));
      paper(x);
      const IC = inkPic();
      // 折线：右下角掀起
      const ux = lerp(W + 60, 560, p), uy = lerp(H + 60, 330, p);
      const vx = W + 60, vy = uy - 420;
      x.save();
      x.beginPath(); x.moveTo(ux, uy); x.lineTo(vx, vy); x.lineTo(vx, H + 60); x.lineTo(ux - 240, H + 60); x.closePath();
      x.clip(); x.drawImage(IC, 0, 0); x.restore();
      // 掀起的纸角（沿折线上翻的三角）
      const mx = (ux + vx) / 2, my = (uy + vy) / 2;
      x.save();
      x.beginPath(); x.moveTo(ux, uy); x.lineTo(vx, vy); x.lineTo(ux + (vx - ux) * .34, uy + (vy - uy) * .34 - 330); x.closePath();
      x.fillStyle = PAL.paper; x.fill();
      x.strokeStyle = 'rgba(70,58,44,.55)'; x.lineWidth = 2.2; x.stroke();
      x.globalAlpha = .55; x.fillStyle = 'rgba(60,50,40,.20)';
      x.beginPath(); x.moveTo(ux, uy); x.lineTo(vx, vy); x.lineTo(vx - 40, vy + 190); x.closePath(); x.fill();
      x.restore();
    },
  },
  {
    id: 'V06', t0: 16.20, t1: 19.00, seg: 'P', cache: false,
    cam: (t, lt) => ({ z: 1 + .03 * ss(seg(lt, 0, 2.8)) }),
    live(x, t, lt) {
      paper(x);
      x.drawImage(inkPic(), 0, 0);
      const P = PSET.B1;
      const t1 = seg(lt, 0.00, .34), t2 = seg(lt, 0.85, 1.19), t3 = seg(lt, 1.72, 2.00);
      if (t1 > 0) stampFn(x, g => { bokashi(g, 0, 40, W, 430, P.sky, .95, 0, { rough: 30, seed: 7 }); bokashi(g, 0, 392, W, 720, mix(P.sky, P.pale, .62), .6, 0, { rough: 44, seed: 11 }); kasumi(g, 520, 306, 780, 46, P.cloud, .72); kasumi(g, 1400, 246, 660, 34, P.cloud, .55); }, t1, [6, -5]);
      if (t2 > 0) stampFn(x, g => {
        const h1 = hill(g, 600, 706, 1560, 262, 'none', { line: false }); g.beginPath(); poly(g, h1); g.fillStyle = mix(P.far, P.sky, .30); g.fill();
        const h2 = hill(g, 1340, 700, 1180, 176, 'none', { line: false }); g.beginPath(); poly(g, h2); g.fillStyle = mix(P.far, P.sky, .58); g.fill();
        const pts = ridgePts(); g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); g.lineTo(1880, 1042); g.lineTo(40, 1042); g.closePath();
        g.fillStyle = P.earth; g.fill();
        pineTree(g, 300, 800, 1.05, mix(P.earthD, PAL.pine, .45), { seed: 3 });
      }, t2, [-6, 4]);
      if (t3 > 0) stampFn(x, g => {
        g.fillStyle = P.hot; g.fillRect(RIDGE.figX - 34, RIDGE.y - 132, 70, 12);
        g.fillStyle = 'rgba(184,65,47,.55)'; g.fillRect(RIDGE.figX - 26, RIDGE.y - 120, 54, 6);
      }, t3, [5, 5]);
    },
    ui(x, t, lt) { seal(x, '宿敌', 1730, 160, 92, ss(seg(lt, 2.05, 2.4)), { seed: 3 }); },
  },
  {
    id: 'V07', t0: 19.00, t1: 22.30, seg: 'P', cache: false, noFrame: true,
    live(x, t, lt) {
      // 土墙 + 一排空画框
      const wall = x.createLinearGradient(0, 0, 0, H);
      wall.addColorStop(0, '#cfc0a2'); wall.addColorStop(1, '#b6a684');
      x.fillStyle = wall; x.fillRect(0, 0, W, H);
      x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = .5; x.drawImage(TX.paper, 0, 0); x.restore();
      const k = eio(seg(lt, .05, 2.0));
      const z = lerp(1.0, .34, k), cx = lerp(960, 760, k), cy = lerp(540, 500, k);
      const PW = W * z, PH = H * z, px = cx - PW / 2, py = cy - PH / 2;
      // 12 个空框（网格）
      const gz = z;
      for (let i = 0; i < 12; i++) {
        const col = i % 4, row = Math.floor(i / 4);
        const fx = 120 + col * 400 * gz + (1 - k) * 0, fy = 150 + row * 260 * gz;
        const fw = 340 * gz, fh = 210 * gz;
        if (Math.abs(fx - px) < PW + 40 && Math.abs(fy - py) < PH + 40) continue;
        x.fillStyle = 'rgba(246,239,220,.55)'; x.fillRect(fx, fy, fw, fh);
        x.strokeStyle = 'rgba(35,31,28,.55)'; x.lineWidth = 2; x.strokeRect(fx, fy, fw, fh);
        x.lineWidth = 1; x.strokeRect(fx - 5, fy - 5, fw + 10, fh + 10);
      }
      // 装裱 + 画
      x.fillStyle = PAL.mount; x.fillRect(px - 26 * z, py - 26 * z, PW + 52 * z, PH + 52 * z);
      x.save(); x.globalAlpha = .6; x.globalCompositeOperation = 'multiply';
      x.fillStyle = '#8f7a55'; x.fillRect(px - 26 * z, py - 26 * z, PW + 52 * z, PH + 52 * z); x.restore();
      x.drawImage(firstPic(), px, py, PW, PH);
      x.strokeStyle = PAL.sumi; x.lineWidth = 2.4; x.strokeRect(px, py, PW, PH);
      // 印砸下
      const sp = ss(seg(lt, 1.35, 1.75));
      if (sp > 0) {
        const sh = Math.exp(-(lt - 1.35) * 8) * 6;
        x.save(); x.translate((hash(9) - .5) * sh, (hash(11) - .5) * sh);
        seal(x, '宿敌百景', px + PW - 90 * z, py + 96 * z, 96 * z + 18, sp, { seed: 7, rot: .03 });
        x.restore();
      }
      // 12 个空框闪一下
      const fl = Math.max(0, Math.sin(clamp((lt - 2.35) / .55) * Math.PI));
      if (fl > 0) {
        x.globalAlpha = fl * .22; x.fillStyle = '#fff8e6';
        for (let i = 0; i < 12; i++) { const col = i % 4, row = Math.floor(i / 4); x.fillRect(120 + col * 400 * z, 150 + row * 260 * z, 340 * z, 210 * z); }
        x.globalAlpha = 1;
      }
    },
    ui(x, t, lt) {
      if (lt > 2.35) {
        const p = ss(seg(lt, 2.35, 2.9));
        x.fillStyle = `rgba(18,14,12,${p})`; x.fillRect(0, 0, W, H);
      }
    },
  },
];

export const SHOTS = [...P0];

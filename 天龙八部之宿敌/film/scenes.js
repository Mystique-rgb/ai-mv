// 场景画：前奏「从零造一幅画」+ 全片复用构件
import {
  W, H, FR, PAL, TX, clamp, lerp, seg, ss, eio, eo, ei, hash, mulberry, TAU,
  rgba, mix, smooth, poly, carve, wob, line, bokashi, kasumi, vtext, cartouche,
  frame, paper, seal, bigSeal, slipV, snow, petals, scraps, lantern, roof, houseRow,
  cityWall, hill, pineTree, blade, waterLines, crack, inkBlot, brushText, STX, mk
} from './base.js';
import { actor, kasa, ROLES, setInk } from './actor.js';

// ============ 第一幅画：山脊上的人 ============
export const RIDGE = { y: 748, figX: 1010, figS: 300 };

const RIDGE_SEG = [
  [40, 806], [260, 786], [520, 752], [760, 752], [960, 758], [1160, 752],
  [1380, 736], [1620, 716], [1880, 716]
];
export function ridgePts(n = 90) {
  const out = [];
  for (let i = 0; i < RIDGE_SEG.length - 1; i++) {
    const [a, b] = [RIDGE_SEG[i], RIDGE_SEG[i + 1]];
    for (let k = 0; k < n / (RIDGE_SEG.length - 1); k++) {
      const u = k / (n / (RIDGE_SEG.length - 1));
      out.push([lerp(a[0], b[0], u) + Math.sin(u * 9 + i) * 3, lerp(a[1], b[1], u) + Math.sin(u * 7 + i * 2) * 4]);
    }
  }
  out.push(RIDGE_SEG[RIDGE_SEG.length - 1]);
  return out;
}
export function drawRun(x, pts, u0, u1, w, col) {
  const a = Math.max(0, Math.floor(u0 * (pts.length - 1))), b = Math.min(pts.length - 1, Math.ceil(u1 * (pts.length - 1)));
  if (b <= a) return;
  x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.lineJoin = 'round';
  x.beginPath(); x.moveTo(pts[a][0], pts[a][1]);
  for (let i = a + 1; i <= b; i++) x.lineTo(pts[i][0], pts[i][1]);
  x.stroke();
}

// 远景：山 + 松 + 人（只看线）
export function ridgeInk(x, lw = 3, prog = 1) {
  x.strokeStyle = PAL.sumi; x.lineCap = 'round';
  if (prog > 0) {
    const h1 = hill(x, 600, 706, 1560, 262, 'none', { line: false });
    x.beginPath(); x.moveTo(h1[0][0], h1[0][1]); for (const q of h1) x.lineTo(q[0], q[1]);
    x.lineWidth = lw * .85; x.globalAlpha = clamp(prog * 1.6); x.stroke();
    const h2 = hill(x, 1340, 700, 1180, 176, 'none', { line: false });
    x.beginPath(); x.moveTo(h2[0][0], h2[0][1]); for (const q of h2) x.lineTo(q[0], q[1]);
    x.lineWidth = lw * .7; x.stroke(); x.globalAlpha = 1;
  }
  if (prog > .2) {
    x.globalAlpha = clamp((prog - .2) * 2);
    drawRun(x, ridgePts(), 0, clamp((prog - .2) / .5), lw * 1.25, PAL.sumi);
    x.lineWidth = lw * .5;
    for (let i = 0; i < 14; i++) {
      const px = 140 + i * 126, py = 772 + Math.sin(i * 1.7) * 14;
      x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 24, py + 18, px + 12, py + 46); x.stroke();
    }
    x.globalAlpha = 1;
  }
  if (prog > .55) {
    x.globalAlpha = clamp((prog - .55) * 3);
    pineTree(x, 300, 800, 1.05, 'none', { seed: 3 });
    actor(x, RIDGE.figX, RIDGE.y + 26, RIDGE.figS, { role: 'A', mode: 'stand', sword: 'sheathed', tilt: -.05 });
    x.globalAlpha = 1;
  }
}

export function ridgeBlocks(x, P) {
  bokashi(x, 0, 40, W, 430, P.sky, .95, 0, { rough: 30, seed: 7 });
  bokashi(x, 0, 392, W, 720, mix(P.sky, P.pale, .62), .6, 0, { rough: 44, seed: 11 });
  kasumi(x, 520, 306, 780, 46, P.cloud, .72);
  kasumi(x, 1400, 246, 660, 34, P.cloud, .55);
  const h1 = hill(x, 600, 706, 1560, 262, 'none', { line: false });
  x.beginPath(); poly(x, h1); x.fillStyle = mix(P.far, P.sky, .30); x.fill();
  const h2 = hill(x, 1340, 700, 1180, 176, 'none', { line: false });
  x.beginPath(); poly(x, h2); x.fillStyle = mix(P.far, P.sky, .58); x.fill();
  // 山脊赭石
  x.save(); x.beginPath();
  const pts = ridgePts();
  x.moveTo(pts[0][0], pts[0][1]); for (const q of pts) x.lineTo(q[0], q[1]);
  x.lineTo(1880, 1042); x.lineTo(40, 1042); x.closePath();
  x.fillStyle = P.earth; x.fill(); x.restore();
  pineTree(x, 300, 800, 1.05, mix(P.earthD, PAL.pine, .45), { seed: 3 });
  actor(x, RIDGE.figX, RIDGE.y + 26, RIDGE.figS, { role: 'A', mode: 'stand', sword: 'sheathed', tilt: -.05 });
}

let _pic = null;
export function firstPic() {
  if (_pic) return _pic;
  const c = mk(), x = c.getContext('2d');
  x.fillStyle = PAL.paper; x.fillRect(0, 0, W, H);
  ridgeBlocks(x, { ...PALP });
  ridgeInk(x, 3);
  x.drawImage(TX.fiber, 0, 0);
  return (_pic = c);
}
const PALP = {
  sky: '#2a4a72', far: '#8ba0b4', cloud: '#dfe3dc', earth: '#cbb894',
  earthD: '#a08a63', pale: '#e8dcc0',
};

// ============ 木版 ============
export function woodBlock(x, inkFrac = 0) {
  x.fillStyle = '#bb9a70'; x.fillRect(0, 0, W, H);
  x.save(); x.globalCompositeOperation = 'multiply'; x.globalAlpha = .5; x.drawImage(TX.grain, 0, 0); x.restore();
  x.fillStyle = 'rgba(92,66,40,.16)';
  for (let i = 0; i < 46; i++) { const y = 20 + i * 23 + hash(i) * 12; x.fillRect(0, y, W, 1 + hash(i + 9) * 2); }
  const pts = ridgePts();
  // 凸脊：阴影 + 亮面
  x.save(); x.translate(4, 5);
  x.strokeStyle = 'rgba(70,48,28,.45)'; x.lineWidth = 13; x.lineCap = 'round';
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const q of pts) x.lineTo(q[0], q[1]); x.stroke();
  x.restore();
  x.strokeStyle = '#e0cda6'; x.lineWidth = 11; x.lineCap = 'round';
  x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const q of pts) x.lineTo(q[0], q[1]); x.stroke();
  // 人的凸脊
  x.save(); x.translate(4, 5); x.strokeStyle = 'rgba(70,48,28,.4)'; x.lineWidth = 10;
  x.beginPath(); x.arc(RIDGE.figX, RIDGE.y - 130, 74, 0, TAU); x.stroke(); x.restore();
  x.strokeStyle = '#e0cda6'; x.lineWidth = 8;
  x.beginPath(); x.arc(RIDGE.figX, RIDGE.y - 130, 74, 0, TAU); x.stroke();
  // 已上墨的部分
  if (inkFrac > 0) {
    x.save(); x.beginPath(); x.rect(0, 0, W * inkFrac, H); x.clip();
    x.globalAlpha = .92; x.strokeStyle = PAL.sumi; x.lineWidth = 7;
    x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const q of pts) x.lineTo(q[0], q[1]); x.stroke();
    x.restore();
  }
}

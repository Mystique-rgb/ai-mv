// 转场库 · 全部基于「上一镜头最后一帧」与「新镜头」两张图的合成
// 不做额外重渲染：main.js 每帧把画面缓存一张，切镜时那张就是上一镜头的末帧。
const TAU = Math.PI * 2;
const clamp01 = v => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = v => v * v * (3 - 2 * v);

// 13 个切换点，按情绪配不同转场（不是轮播，是每处都说得通）
export const TRANS = [
  { t: 1.92,  kind: 'iris',     dur: .34, dir: 1 },   // 开机亮点扩成整个房间
  { t: 5.68,  kind: 'zoomcut',  dur: .20 },           // 推进耳朵特写
  { t: 7.56,  kind: 'flashinv', dur: .16 },           // 反相闪（第一句副歌起）
  { t: 9.44,  kind: 'whip',     dur: .24, dir: 1 },   // 横甩到夜色
  { t: 11.32, kind: 'shutter',  dur: .22 },           // 快门合上再开（VU 表）
  { t: 13.20, kind: 'burn',     dur: .30, dir: 1 },   // 烧片亮线（起风）
  { t: 15.07, kind: 'blackout', dur: .16 },           // 黑一下（升到最高俯视）
  { t: 16.95, kind: 'flashinv', dur: .20 },           // 玻璃碎完炸进城市
  { t: 20.71, kind: 'dissolve', dur: .36 },           // 叠影（城市化进雨里）
  { t: 22.59, kind: 'blinds',   dur: .26 },           // 百叶条（落到脸上）
  { t: 24.47, kind: 'burn',     dur: .28, dir: -1 },  // 烧片反向（磁带）
  { t: 26.35, kind: 'whip',     dur: .24, dir: -1 },  // 横甩（顶视河）
  { t: 28.23, kind: 'dissolve', dur: .30 },           // 灯海化回房间
];

export function transAt(t) {
  for (const d of TRANS) {
    if (t >= d.t && t < d.t + d.dur) return { def: d, p: (t - d.t) / d.dur };
  }
  return null;
}

// g：画面层；ge：发光层（必须同步遮，否则圆外黑了、光晕还漏在画面上）；
// prev：上一镜头 canvas；cur：当前镜头 canvas；p：0→1
export function applyTransition(g, ge, prev, cur, p, def) {
  const W = cur.width, H = cur.height;
  const k = clamp01(p), e = smooth(k);
  paintScene(g, prev, cur, k, e, def, W, H);
  if (ge) maskEmissive(ge, k, e, def, W, H);
}

// —— 发光层：只做减法（destination-out），不做位移，肉眼看不出差别 ——
function maskEmissive(ge, k, e, def, W, H) {
  const R = Math.hypot(W, H) * .58;
  ge.save();
  ge.setTransform(1, 0, 0, 1, 0, 0);
  ge.globalAlpha = 1;
  ge.globalCompositeOperation = 'destination-out';
  ge.fillStyle = '#000';
  switch (def.kind) {
    case 'iris': {
      const r = def.dir > 0 ? R * e : R * (1 - e);
      ge.beginPath(); ge.rect(0, 0, W, H);
      ge.arc(W / 2, H / 2, Math.max(0.5, r), 0, TAU, true);
      ge.fill();
      break;
    }
    case 'shutter': {
      const bh = (k < .5 ? smooth(k * 2) : smooth((1 - k) * 2)) * H * .52;
      ge.fillRect(0, 0, W, bh);
      ge.fillRect(0, H - bh, W, bh);
      break;
    }
    case 'blinds': {
      const bars = 5, bw = W / bars;
      for (let i = 0; i < bars; i++) {
        const kk = clamp01((k - i * .04) / .62);
        ge.fillRect(i * bw, 0, bw - 2, smooth(kk) * H);
      }
      break;
    }
    case 'blackout': {
      const half = k < .5 ? smooth(k * 2) : smooth((1 - k) * 2);
      ge.globalAlpha = half; ge.fillRect(0, 0, W, H);
      break;
    }
    case 'burn': {
      const d = def.dir >= 0 ? 1 : -1;
      const bx = d > 0 ? e * (W + 260) - 130 : W - (e * (W + 260) - 130);
      if (d > 0) ge.fillRect(bx, 0, W - bx, H); else ge.fillRect(0, 0, bx, H);
      break;
    }
    default: {
      // 位移 / 叠影型：整体衰减到底，不跟着位移（发光位移看不出来，还会脏）
      ge.globalAlpha = Math.min(.9, k * 1.1);
      ge.fillRect(0, 0, W, H);
      break;
    }
  }
  ge.restore();
}

function paintScene(g, prev, cur, k, e, def, W, H) {
  g.save();
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';

  switch (def.kind) {
    // —— 叠影：旧画面慢慢化掉（城市 → 雨） ——
    case 'dissolve': {
      g.drawImage(cur, 0, 0);
      const a = Math.pow(1 - k, 2.6);
      if (a > .01) {
        // 旧画面横向拉丝后淡出：像两段信号在叠，不是两张照片在混
        for (let i = 0; i < 3; i++) {
          g.globalAlpha = a * (.5 - i * .13);
          g.drawImage(prev, (i - 1) * 22 * (1 - k), 0);
        }
        g.globalAlpha = a * .7; g.drawImage(prev, 0, 0);
      }
      g.globalAlpha = 1;
      break;
    }

    // —— 圆扩 / 圆收：开机、关机 ——
    case 'iris': {
      const R = Math.hypot(W, H) * .58;
      const r = def.dir > 0 ? R * e : R * (1 - e);
      // 圆外压黑，不铺旧画面：两个镜头长得像的时候（开机→房间），铺旧的等于没转场
      g.drawImage(cur, 0, 0);
      g.save();
      g.beginPath(); g.rect(0, 0, W, H);
      g.arc(W / 2, H / 2, Math.max(0.5, r), 0, TAU, true);   // 反向 = 挖掉中间的洞
      g.clip();
      g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
      g.restore();
      // 圆边一圈光：CRT 的束流边界
      if (r > 4 && r < R * .96) {
        g.save(); g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 3; i++) {
          g.strokeStyle = `rgba(255,242,226,${.22 / (i + 1)})`;
          g.lineWidth = 5 - i;
          g.beginPath(); g.arc(W / 2, H / 2, r + i * 5, 0, TAU); g.stroke();
        }
        g.restore();
      }
      break;
    }

    // —— 推穿：旧画面放大冲出去 ——
    case 'zoomcut': {
      g.drawImage(cur, 0, 0);
      const z = 1 + e * 2.6;
      g.globalAlpha = Math.max(0, 1 - e * 1.55);
      const dw = W * z, dh = H * z;
      g.drawImage(prev, (W - dw) / 2, (H - dh) / 2, dw, dh);
      // 中心往外抽的放射线
      g.save(); g.globalCompositeOperation = 'lighter';
      g.strokeStyle = `rgba(255,248,236,${.3 * (1 - k)})`; g.lineWidth = 3;
      for (let i = 0; i < 22; i++) {
        const a = i / 22 * TAU + .2, r0 = 60 + e * 900, r1 = r0 + 180 + e * 500;
        g.beginPath();
        g.moveTo(W / 2 + Math.cos(a) * r0, H / 2 + Math.sin(a) * r0);
        g.lineTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1);
        g.stroke();
      }
      g.restore();
      break;
    }

    // —— 反相闪：一帧翻底，旧画面立刻灭 ——
    case 'flashinv': {
      g.drawImage(cur, 0, 0);
      const fade = Math.max(0, 1 - k * 3.2);
      if (fade > .01) { g.globalAlpha = fade; g.drawImage(prev, 0, 0); }
      if (k < .22) {
        const a = (1 - k / .22) * .72;
        g.globalAlpha = 1;
        g.globalCompositeOperation = 'difference';
        g.fillStyle = `rgba(255,255,255,${a})`; g.fillRect(0, 0, W, H);
      }
      break;
    }

    // —— 横甩 / 竖甩：新旧两张一起甩，中间拉丝 ——
    case 'whip': {
      const vert = def.vert;
      const d = def.dir >= 0 ? 1 : -1;
      const off = vert ? H : W;
      g.fillStyle = '#05070C'; g.fillRect(0, 0, W, H);
      // 旧的甩出
      const po = -d * e * off * 1.45;
      g.globalAlpha = 1;
      if (vert) g.drawImage(prev, 0, po); else g.drawImage(prev, po, 0);
      // 新的甩入
      const co = d * (1 - e) * off * 1.45;
      if (vert) g.drawImage(cur, 0, co); else g.drawImage(cur, co, 0);
      // 拉丝：沿甩动方向的条痕
      g.save(); g.globalCompositeOperation = 'lighter';
      const streak = Math.sin(k * Math.PI);
      for (let i = 0; i < 16; i++) {
        const q = (i * 97) % 100 / 100;
        const al = .2 * streak * (1 - Math.abs(q - .5) * 1.4);
        if (al <= 0) continue;
        if (vert) {
          const y = (i * 71 + k * 640) % H;
          g.fillStyle = `rgba(214,238,255,${al})`;
          g.fillRect(0, y, W, 5 + (i % 3) * 4);
        } else {
          const x = (i * 131 + k * 980) % W;
          g.fillStyle = `rgba(214,238,255,${al})`;
          g.fillRect(x, 0, 6 + (i % 3) * 5, H);
        }
      }
      g.restore();
      break;
    }

    // —— 快门：上下黑边合上再开 ——
    case 'shutter': {
      g.drawImage(cur, 0, 0);
      const half = k < .5 ? smooth(k * 2) : smooth((1 - k) * 2);
      const bh = half * H * .52;
      g.fillStyle = '#000';
      g.fillRect(0, 0, W, bh);
      g.fillRect(0, H - bh, W, bh);
      // 快门叶片的一道硬反光
      if (bh > 2) {
        g.fillStyle = 'rgba(180,215,240,.22)';
        g.fillRect(0, bh - 3, W, 3);
        g.fillRect(0, H - bh, W, 3);
      }
      break;
    }

    // —— 烧片：一条亮线扫过，扫过的地方才是新画面 ——
    case 'burn': {
      const d = def.dir >= 0 ? 1 : -1;
      const bx = d > 0 ? e * (W + 260) - 130 : W - (e * (W + 260) - 130);
      g.drawImage(prev, 0, 0);                       // 旧的全屏
      g.save();
      g.beginPath();
      if (d > 0) g.rect(0, 0, Math.max(0, bx), H); else g.rect(bx, 0, W - bx, H);
      g.clip();
      g.drawImage(cur, 0, 0);
      g.restore();
      // 烧线：白心 + 暖边 + 烟
      g.save(); g.globalCompositeOperation = 'lighter';
      const gr = g.createLinearGradient(bx - 100, 0, bx + 100, 0);
      gr.addColorStop(0, 'rgba(255,180,90,0)');
      gr.addColorStop(.42, 'rgba(255,214,150,.5)');
      gr.addColorStop(.5, 'rgba(255,255,248,.95)');
      gr.addColorStop(.58, 'rgba(255,214,150,.5)');
      gr.addColorStop(1, 'rgba(255,180,90,0)');
      g.fillStyle = gr; g.fillRect(bx - 100, 0, 200, H);
      g.restore();
      // 边缘焦黑
      g.fillStyle = 'rgba(20,10,4,.55)';
      if (d > 0) g.fillRect(bx - 16, 0, 9, H); else g.fillRect(bx + 7, 0, 9, H);
      break;
    }

    // —— 百叶条：一条条翻过去 ——
    case 'blinds': {
      g.drawImage(cur, 0, 0);
      const bars = 5, bw = W / bars;
      for (let i = 0; i < bars; i++) {
        // 每条错开一点，才有"依次翻"的机械感
        const kk = clamp01((k - i * .04) / .62);
        const h = smooth(kk) * H;
        g.fillStyle = '#000';
        g.fillRect(i * bw, 0, bw - 2, h);
        // 叶片下沿一道反光
        if (h > 2) {
          g.fillStyle = 'rgba(170,210,238,.2)';
          g.fillRect(i * bw, h - 3, bw - 2, 3);
        }
      }
      break;
    }

    // —— 黑场：单纯黑一下，只有 CRT 余辉 ——
    case 'blackout': {
      g.drawImage(cur, 0, 0);
      const half = k < .5 ? smooth(k * 2) : smooth((1 - k) * 2);
      g.fillStyle = `rgba(0,0,0,${half})`;
      g.fillRect(0, 0, W, H);
      break;
    }

    default: break;
  }

  g.restore();
}

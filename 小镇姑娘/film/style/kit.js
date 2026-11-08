// kit.js —— 风格化工具：从 p5 渲染帧里抠出主角，按色版分离重印
// 依赖 core.js 的 W/H/PAL（在 core 之后加载）
const KIT = (() => {
  let cv = null, cx = null, cw = 0, ch = 0;

  function ctxFor(w, h) {
    if (!cv || cw !== w || ch !== h) {
      cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      cx = cv.getContext('2d', { willReadFrequently: true });
      cw = w; ch = h;
    }
    return cx;
  }

  function pixels(src) {
    const w = src.width, h = src.height;
    const c = ctxFor(w, h);
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, w, h);
    c.drawImage(src, 0, 0);
    return c.getImageData(0, 0, w, h);
  }

  function newCanvas(w, h) {
    const n = document.createElement('canvas'); n.width = w; n.height = h;
    return n;
  }

  function hsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0;
    if (d > 1e-6) {
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60; if (h < 0) h += 360;
    }
    return [h, mx === 0 ? 0 : d / mx, mx];
  }

  // 纸底抠像：返回 Uint8Array（255 = 主体，0 = 纸）
  function mask(id, paper, tol) {
    const d = id.data, n = id.width * id.height, m = new Uint8Array(n);
    for (let i = 0, p = 0; i < n; i++, p += 4) {
      const dr = d[p] - paper[0], dg = d[p + 1] - paper[1], db = d[p + 2] - paper[2];
      const dist = Math.sqrt(dr * dr * .3 + dg * dg * .59 + db * db * .11);
      m[i] = dist > tol ? 255 : 0;
    }
    return m;
  }

  // 去孤立点：笔触飞白散落在纸上会被当成主体，腐蚀一遍把 <3 个邻居的像素清掉
  function clean(m, w, h, minN = 3) {
    const b = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x;
      if (!m[i]) continue;
      let c = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
        if (!dx && !dy) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h && m[ny * w + nx]) c++;
      }
      b[i] = c >= minN ? 255 : 0;
    }
    return b;
  }

  // 分版重印：rules 按顺序命中（判定优先级），写入时按规则的逆序叠（底版先印、细节后印）
  // rule: { h:[0,360] 色相区间 | null, l:[0,1] 明度区间, s:[0,1] 饱和, col:'#RRGGBB', off:[dx,dy] }
  function separate(id, m, rules, opt = {}) {
    const w = id.width, h = id.height, src = id.data, n = w * h;
    const out = newCanvas(w, h), oc = out.getContext('2d');
    const img = oc.createImageData(w, h), od = img.data;
    const squash = opt.lumBands || null;
    const ink = new Int8Array(n).fill(-1);

    // pass 1：判定每个像素属于哪一版（第一个命中的规则）
    for (let i = 0; i < n; i++) {
      if (!m[i]) continue;
      const p = i * 4;
      let [hh, ss, vv] = hsv(src[p], src[p + 1], src[p + 2]);
      if (squash) { for (const b of squash) { if (vv <= b.max) { vv = b.to; break; } } }
      for (let k = 0; k < rules.length; k++) {
        const r = rules[k];
        if (r.h && !(hh >= r.h[0] && hh <= r.h[1]) && !(r.wrap && (hh >= r.h[0] || hh <= r.h[1]))) continue;
        if (r.l && !(vv >= r.l[0] && vv <= r.l[1])) continue;
        if (r.s && !(ss >= r.s[0] && ss <= r.s[1])) continue;
        ink[i] = k; break;
      }
    }
    // pass 2：从最后一版往第一版印（前者是底，后者是细节）
    for (let k = rules.length - 1; k >= 0; k--) {
      const r = rules[k], rgb = hexToRgb(r.col), off = r.off || [0, 0], alph = r.alpha == null ? 255 : r.alpha;
      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = y * w + x;
          if (ink[i] !== k) continue;
          const tx = Math.round(x + off[0]), ty = Math.round(y + off[1]);
          if (tx < 0 || ty < 0 || tx >= w || ty >= h) continue;
          const q = (ty * w + tx) * 4;
          od[q] = rgb[0]; od[q + 1] = rgb[1]; od[q + 2] = rgb[2]; od[q + 3] = alph;
        }
      }
    }
    oc.putImageData(img, 0, 0);
    return out;
  }

  function hexToRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }

  // 剪影描边（形态学膨胀 - 原图）
  function outline(m, w, h, r, col) {
    const out = newCanvas(w, h), oc = out.getContext('2d');
    const img = oc.createImageData(w, h), od = img.data;
    const rgb = hexToRgb(col);
    const dil = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!m[y * w + x]) continue;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue;
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && ny >= 0 && nx < w && ny < h) dil[ny * w + nx] = 255;
      }
    }
    for (let i = 0; i < w * h; i++) {
      if (dil[i] && !m[i]) { const q = i * 4; od[q] = rgb[0]; od[q + 1] = rgb[1]; od[q + 2] = rgb[2]; od[q + 3] = 255; }
    }
    oc.putImageData(img, 0, 0);
    return out;
  }

  // 明度分级（黑白/灰度风格用）：bands = [{max:.35, col:'#111'}, {max:.72, col:'#777'}, {col:'#F2F0EA'}]
  function tone(id, m, bands, opt = {}) {
    const w = id.width, h = id.height, d = id.data, n = w * h;
    const out = newCanvas(w, h), oc = out.getContext('2d');
    const img = oc.createImageData(w, h), od = img.data;
    const cols = bands.map(b => hexToRgb(b.col));
    for (let i = 0; i < n; i++) {
      if (!m[i]) continue;
      const p = i * 4;
      const L = (d[p] * .299 + d[p + 1] * .587 + d[p + 2] * .114) / 255;
      let k = bands.length - 1;
      for (let j = 0; j < bands.length; j++) { if (bands[j].max != null && L <= bands[j].max) { k = j; break; } }
      const rgb = cols[k], off = opt.off || [0, 0];
      const tx = Math.round((i % w) + off[0]), ty = Math.round(Math.floor(i / w) + off[1]);
      if (tx < 0 || ty < 0 || tx >= w || ty >= h) continue;
      const q = (ty * w + tx) * 4;
      od[q] = rgb[0]; od[q + 1] = rgb[1]; od[q + 2] = rgb[2]; od[q + 3] = 255;
    }
    oc.putImageData(img, 0, 0);
    return out;
  }

  // 只保留剪影（单色版）
  function fill(m, w, h, col) {
    const out = newCanvas(w, h), oc = out.getContext('2d');
    const img = oc.createImageData(w, h), od = img.data, rgb = hexToRgb(col);
    for (let i = 0; i < w * h; i++) {
      if (!m[i]) continue;
      const q = i * 4; od[q] = rgb[0]; od[q + 1] = rgb[1]; od[q + 2] = rgb[2]; od[q + 3] = 255;
    }
    oc.putImageData(img, 0, 0);
    return out;
  }

  // 纸纹 / 颗粒 / 暗角
  function grain(c, w, h, amt = 0.05, seed = 7) {
    const n = newCanvas(w, h), nc = n.getContext('2d');
    const img = nc.createImageData(w, h), d = img.data;
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < d.length; i += 4) {
      const v = 255 - (rnd() < .5 ? rnd() * rnd() * 60 * amt * 8 : 0);
      d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = 255;
    }
    nc.putImageData(img, 0, 0);
    c.save(); c.globalCompositeOperation = 'multiply'; c.globalAlpha = amt; c.drawImage(n, 0, 0); c.restore();
  }

  function vignette(c, w, h, col = 'rgba(40,26,16,.42)', inner = .45) {
    const g = c.createRadialGradient(w / 2, h / 2, h * inner, w / 2, h / 2, h * 1.15);
    g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, col);
    c.save(); c.fillStyle = g; c.fillRect(0, 0, w, h); c.restore();
  }

  // 纸纤维（浅色，画在最后，压在墨上）
  function fibres(c, w, h, col = 'rgba(255,255,255,.5)', n = 1200, seed = 3) {
    let s = seed;
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    c.save(); c.strokeStyle = col; c.lineWidth = 1; c.globalAlpha = .5;
    for (let i = 0; i < n; i++) {
      const x = rnd() * w, y = rnd() * h, l = 4 + rnd() * 22, a = rnd() * Math.PI * 2;
      c.beginPath(); c.moveTo(x, y);
      c.quadraticCurveTo(x + Math.cos(a + .7) * l * .5, y + Math.sin(a + .7) * l * .5, x + Math.cos(a) * l, y + Math.sin(a) * l);
      c.stroke();
    }
    c.restore();
  }

  // 硬边多边形（丝印/平涂的底色块）
  function poly(c, pts, col) {
    c.save(); c.fillStyle = col; c.beginPath();
    pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y));
    c.closePath(); c.fill(); c.restore();
  }

  function text(c, txt, x, y, size, col, o = {}) {
    c.save();
    c.font = o.font || `${o.weight || 700} ${size}px ${o.family || '"Impact","Arial Black",sans-serif'}`;
    c.fillStyle = col; c.textAlign = o.align || 'left'; c.textBaseline = o.base || 'alphabetic';
    if (o.track) {  // 字距
      const chars = [...txt];
      const total = chars.reduce((s, ch) => s + c.measureText(ch).width + o.track, 0) - o.track;
      let cx0 = o.align === 'center' ? x - total / 2 : (o.align === 'right' ? x - total : x);
      for (const ch of chars) { c.fillText(ch, cx0, y); cx0 += c.measureText(ch).width + o.track; }
    } else c.fillText(txt, x, y);
    c.restore();
  }

  return { pixels, mask, clean, separate, tone, outline, fill, grain, vignette, fibres, poly, text, newCanvas, hexToRgb, hsv };
})();

// main.js — 版面上墨 → 印刷着色器 → 出图
const gl_cv = document.getElementById('c');
const plateCv = makePlateCanvas();
const plateCtx = plateCv.getContext('2d', { willReadFrequently: false });
const P = { g: plateCtx };

const gl = gl_cv.getContext('webgl2', { antialias: false, preserveDrawingBuffer: true, premultipliedAlpha: false });

const VS = `#version 300 es
in vec2 aPos; void main(){ gl_Position = vec4(aPos,0.,1.); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uPlate;
uniform vec2 uRes;
uniform vec3 uInk0, uInk1, uInk2, uPaper;
uniform vec2 uOff0, uOff1, uOff2;
uniform float uRot0, uRot1, uRot2;
uniform float uAng0, uAng1, uAng2;
uniform float uPeriod, uGrain, uSeed, uPinhole;
out vec4 o;
float h21(vec2 p){ p = fract(p*vec2(233.34,851.73)); p += dot(p,p+23.45); return fract(p.x*p.y); }
vec2 rot(vec2 p, float a){ float c=cos(a), s=sin(a); return vec2(c*p.x-s*p.y, s*p.x+c*p.y); }
float plateAt(vec2 fc, vec2 off, float rotAng, int ch){
  vec2 p = fc - uRes*0.5 - off;
  p = rot(p, -rotAng) + uRes*0.5;
  vec2 uv = p / uRes;
  if(uv.x<0.0||uv.x>1.0||uv.y<0.0||uv.y>1.0) return 0.0;
  vec4 s = texture(uPlate, uv);
  return ch==0 ? s.r : (ch==1 ? s.g : s.b);
}
float inked(float d, vec2 fc, float ang){
  vec2 g = rot(fc, ang) * (6.2831853 / uPeriod);
  float spot = 0.5 + 0.5*cos(g.x)*cos(g.y);
  float n = h21(fc + uSeed*37.13);
  float thr = spot + (n-0.5)*uGrain;
  float cov = smoothstep(thr-0.055, thr+0.055, d);
  cov = mix(cov, 1.0, smoothstep(0.90,0.98,d));
  float ph = h21(floor(fc*0.5)+vec2(13.0,7.0));
  cov *= mix(1.0, 1.0-step(0.988,ph), smoothstep(0.88,0.96,d)*uPinhole);
  return cov;
}
void main(){
  vec2 fc = gl_FragCoord.xy;
  // 纸：极淡的纤维 + 长条斑（不能做成电视雪花）
  float fib = h21(vec2(floor(fc.x*0.055), floor(fc.y*0.62)));
  float blot = h21(floor(fc*0.045)+vec2(3.0,7.0));
  vec3 paper = uPaper * (0.9975 + 0.0035*blot + 0.0025*fib);
  float streak = 1.0 - 0.05*h21(vec2(floor(fc.x*0.35), 3.0));
  float d0 = plateAt(fc,uOff0,uRot0,0)*streak;
  float d1 = plateAt(fc,uOff1,uRot1,1)*streak;
  float d2 = plateAt(fc,uOff2,uRot2,2)*streak;
  vec3 col = paper;
  col *= mix(vec3(1.0), uInk0, inked(d0,fc,uAng0));
  col *= mix(vec3(1.0), uInk1, inked(d1,fc,uAng1));
  col *= mix(vec3(1.0), uInk2, inked(d2,fc,uAng2));
  o = vec4(col,1.0);
}`;

function compile(type, src) {
  const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
  return s;
}
const prog = gl.createProgram();
gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
gl.linkProgram(prog);
if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
gl.useProgram(prog);

const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(prog, 'aPos');
gl.enableVertexAttribArray(loc);
gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

const U = {};
['uPlate', 'uRes', 'uInk0', 'uInk1', 'uInk2', 'uPaper', 'uOff0', 'uOff1', 'uOff2',
  'uRot0', 'uRot1', 'uRot2', 'uAng0', 'uAng1', 'uAng2', 'uPeriod', 'uGrain', 'uSeed', 'uPinhole']
  .forEach(n => U[n] = gl.getUniformLocation(prog, n));

const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);   // canvas 原点在左上，gl_FragCoord 在左下
gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

const hex = h => [parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255];
const INK0 = hex('#3D5588'), INK1 = hex('#FF48B0'), INK2 = hex('#FFB511'), PAPER = hex('#F4EEE2');

// ---------------- 字幕 ----------------
const SUB_FONT = '500 58px STKaiti, "华文楷体", "KaiTi", serif';
function drawSub(P, t) {
  const L = lineAt(t);
  if (!L) return null;
  const g = P.g;
  const txt = L.text;
  g.font = SUB_FONT;
  const w = g.measureText(txt).width;
  const padX = 44, bw = w + padX * 2, bh = 96;
  const x = 140, y = 872;
  // 纸白敲白条
  cut(g, 1);
  rr(g, x - padX, y, bw, bh, 6); g.fill();
  // 字：蓝版；金句再叠粉版，错位 3px
  g.textAlign = 'left'; g.textBaseline = 'middle';
  ink(g, 'blue', 1);
  g.font = SUB_FONT;
  g.fillText(txt, x, y + bh / 2 + 2);
  if (L.hook) {
    ink(g, 'pink', 1);
    g.fillText(txt, x + 3, y + bh / 2 + 2);
  }
  return { text: txt, hook: L.hook };
}

// ---------------- 镜头表 ----------------
// t0/t1 以拍点为准（song.json），场景参数按镜头手调
const SHOTS = [
  { id: 'S01', t0: 0.00, t1: 1.74, sc: 'paper', p: { inkProg: 0 } },
  { id: 'S02', t0: 1.74, t1: 3.52, sc: 'cityGrow', p: {} },
  { id: 'S03', t0: 3.52, t1: 5.30, sc: 'bridge', p: { hole: { x: 900, y: 380, w: 78, h: 150 } } },
  { id: 'S04', t0: 5.30, t1: 8.86, sc: 'street', p: {} },
  { id: 'S05', t0: 8.86, t1: 12.42, sc: 'street', p: { storeX: 1500 } },
  { id: 'S06', t0: 12.42, t1: 14.20, sc: 'bridge', p: { pale: 0.42 } },
  { id: 'S07', t0: 15.98, t1: 17.76, sc: 'memory', p: {} },
  { id: 'S08', t0: 19.54, t1: 23.10, sc: 'bus', p: {} },
  { id: 'S09', t0: 23.10, t1: 30.21, sc: 'sea', p: { dot: [1660, 300, 7] } },
  { id: 'S10', t0: 30.24, t1: 33.76, sc: 'sea', p: { dot: [1700, 220, 5], tear: 1 } },
  { id: 'S11', t0: 34.16, t1: 37.76, sc: 'street', p: { grid: 1 } },
  { id: 'S12', t0: 37.76, t1: 42.21, sc: 'bridge', p: { hole: { x: 780, y: 300, w: 220, h: 420 } } },
  { id: 'S13', t0: 43.76, t1: 47.12, sc: 'store', p: { filled: 6, faces: ['smile', 'sad', 'wide', 'smile'] } },
  { id: 'S14', t0: 47.28, t1: 50.64, sc: 'food', p: { zhou: 1 } },
  { id: 'S15', t0: 50.88, t1: 54.16, sc: 'store', p: { filled: 12, faces: ['smile'] } },
  { id: 'S16', t0: 54.40, t1: 59.98, sc: 'memory', p: {} },
  { id: 'S17', t0: 58.56, t1: 61.54, sc: 'store', p: { filled: 12, faces: ['smile'] } },
  { id: 'S18', t0: 61.60, t1: 66.08, sc: 'store', p: { filled: 8, faces: ['calm'], lights: 1 } },
  { id: 'S19', t0: 66.08, t1: 71.12, sc: 'store', p: { filled: 6, faces: ['calm'], hands: 1 } },
  { id: 'S20', t0: 71.44, t1: 74.80, sc: 'store', p: { filled: 4, faces: ['love'] } },
  { id: 'S21', t0: 75.04, t1: 78.32, sc: 'bridge', p: { pale: 0.55 } },
  { id: 'S22', t0: 78.56, t1: 81.84, sc: 'store', p: { filled: 5, faces: ['smile'] } },
  { id: 'S23', t0: 82.08, t1: 85.36, sc: 'memory', p: {} },
  { id: 'S24', t0: 85.68, t1: 89.04, sc: 'room', p: {} },
  { id: 'S25', t0: 89.28, t1: 92.56, sc: 'food', p: { zhou: 0 } },
  { id: 'S26', t0: 92.80, t1: 96.16, sc: 'stamp', p: { stampY: 210 } },
  { id: 'S27', t0: 96.40, t1: 101.31, sc: 'stamp', p: { stampY: 300, marked: 1 } },
  { id: 'S28', t0: 101.31, t1: 106.65, sc: 'stack', p: { n: 30 } },
  { id: 'S29', t0: 106.65, t1: 111.98, sc: 'stack', p: { n: 18 } },
  { id: 'S30', t0: 111.98, t1: 115.54, sc: 'stack', p: { n: 12 } },
  { id: 'S31', t0: 115.54, t1: 120.87, sc: 'stack', p: { n: 6 } },
  { id: 'S32', t0: 120.87, t1: 125.76, sc: 'bridge', p: { pale: 0.6 } },
  { id: 'S33', t0: 123.98, t1: 130.08, sc: 'bridge', p: { pale: 0.62, scrape: 1 } },
  { id: 'S34', t0: 130.08, t1: 141.76, sc: 'bridge', p: { pale: 0.62, scrape: 2 } },
  { id: 'S35', t0: 141.76, t1: 145.31, sc: 'dark', p: { cracks: 2 } },
  { id: 'S36', t0: 145.31, t1: 154.20, sc: 'dark', p: { cracks: 6 } },
  { id: 'S37', t0: 154.20, t1: 160.66, sc: 'store', p: { filled: 4, faces: ['love'] } },
  { id: 'S38', t0: 160.90, t1: 165.02, sc: 'bridge', p: { pale: 0.7 } },
  { id: 'S39', t0: 165.26, t1: 168.91, sc: 'store', p: { filled: 3, faces: ['sad'] } },
  { id: 'S40', t0: 169.09, t1: 171.42, sc: 'memory', p: {} },
  { id: 'S41', t0: 171.48, t1: 174.51, sc: 'room', p: {} },
  { id: 'S42', t0: 174.87, t1: 179.46, sc: 'food', p: {} },
  { id: 'S43', t0: 179.09, t1: 183.46, sc: 'stamp', p: { stampY: 250, marked: 1 } },
  { id: 'S44', t0: 183.52, t1: 185.12, sc: 'stamp', p: { stampY: 250, marked: 1 } },
  { id: 'S45', t0: 185.20, t1: 188.64, sc: 'store', p: { filled: 2, faces: ['love'] } },
  { id: 'S46', t0: 188.88, t1: 195.52, sc: 'bridge', p: { pale: 0.7 } },
  { id: 'S47', t0: 195.54, t1: 207.98, sc: 'store', p: { filled: 1, faces: ['smile'] } },
  { id: 'S48', t0: 207.98, t1: 216.88, sc: 'stamp', p: { stampY: 250, marked: 1 } },
  { id: 'S49', t0: 216.88, t1: 221.32, sc: 'store', p: { filled: 1, faces: ['smile'] } },
  { id: 'S50', t0: 221.32, t1: 226.66, sc: 'store', p: { filled: 0 } },
  { id: 'S51', t0: 226.66, t1: 232.00, sc: 'paper', p: { hole: 1 } },
  { id: 'S52', t0: 232.00, t1: 232.45, sc: 'paper', p: { hole: 1, dot: 1 } },
  { id: 'S53', t0: 232.45, t1: 244.00, sc: 'paper', p: { hole: 1 } },
];

function shotAt(t) {
  for (const s of SHOTS) if (t >= s.t0 && t < s.t1) return s;
  return SHOTS[SHOTS.length - 1];
}

// ---------------- 人物编排（按镜头） ----------------
function castFor(shot, p, t) {
  const id = shot.id;
  const out = [];
  const push = o => out.push(o);
  // 天桥双人 / 单人
  if (shot.sc === 'memory' && (id === 'S07' || id === 'S16' || id === 'S23' || id === 'S40')) {
    const walk = id === 'S07' ? 26 : 0;
    push({ who: 'yan', x: 810 - walk * p, y: 1000, s: 470, view: 'q', mood: 'smile', pose: { legL: 12, legR: -12, armL: 10 } });
    push({ who: 'fen', x: 1052 - walk * p, y: 1000, s: 470, view: 'q', mood: p > .55 ? 'wide' : 'smile', flip: 1, pose: { legL: -10, legR: 10, armL: 40 }, blush: 1 });
  }
  if (shot.sc === 'bridge' && ['S03', 'S06', 'S12', 'S21', 'S32', 'S33', 'S34', 'S38', 'S46'].includes(id)) {
    if (id !== 'S03' && id !== 'S12') {
      push({ who: 'yan', x: 690, y: 1000, s: 470, view: 'q', mood: id === 'S06' ? 'sad' : 'calm', pose: { armR: -14 } });
    }
  }
  if (shot.sc === 'store' && ['S15', 'S17', 'S19', 'S20', 'S49'].includes(id)) {
    push({ who: 'yan', x: 620, y: 1150, s: 540, view: 'q', mood: 'calm', pose: { armR: -40 } });
    push({ who: 'fen', x: 1180, y: 1150, s: 540, view: 'q', mood: 'smile', flip: 1, pose: { armL: 44 }, blush: 1 });
  }
  if (shot.sc === 'dark') {
    push({ who: 'yan', x: 780, y: 900, s: 620, view: 'q', mood: 'love' });
    push({ who: 'fen', x: 1080, y: 900, s: 620, view: 'q', mood: 'love', flip: 1, blush: 1 });
  }
  return out;
}

// ---------------- 主绘制 ----------------
function drawAt(t) {
  const shot = shotAt(t);
  const p = clamp((t - shot.t0) / Math.max(1e-3, shot.t1 - shot.t0), 0, 1);
  clearPlate(plateCtx);
  P.g.setTransform(1, 0, 0, 1, 0, 0);

  const params = Object.assign({ t, p }, shot.p);
  (SCENES[shot.sc] || SCENES.bridge)(P, params);

  // 人
  for (const c of castFor(shot, p, t)) person(P, c);

  // 特殊叠加
  if (shot.sc === 'sea' && shot.p.tear) {
    // 撕开一道缝，露出暖光
    const w = 40 + p * 300;
    cut(P.g, 1); P.g.fillRect(0, 0, w, H);
    ink(P.g, 'yellow', .8); P.g.fillRect(0, 0, w, H);
    ink(P.g, 'pink', .3); P.g.fillRect(w - 8, 0, 8, H);
  }
  if (shot.p.hole === 1) {
    whiteHole(P, 880, 330, 160, 380, 30);
  }
  if (shot.p.dot) {
    ink(P.g, 'pink', 1);
    ellipse(P.g, 960, 520, 2.2, 2.2); P.g.fill();
  }
  if (shot.sc === 'paper') crossMarks(P, Math.min(4, Math.floor(t / 0.4445) + 1));

  // 字幕
  const sub = drawSub(P, t);

  // 套版：基础错位 + 重鼓踢 + 极缓漂移
  const ke = kickEnv(t);
  const drift = Math.sin(t * .7) * 1.2;
  const base = shot.reg || [0, 0, 0, 0, 0, 0];
  const off = [
    [base[0] + drift, base[1] + ke * 11],
    [base[2] - 2.6 - ke * 9, base[3] + 1.4],
    [2.2, -1.8 + ke * 7],
  ];

  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, plateCv);
  gl.viewport(0, 0, 1920, 1080);
  gl.uniform1i(U.uPlate, 0);
  gl.uniform2f(U.uRes, 1920, 1080);
  gl.uniform3fv(U.uInk0, INK0); gl.uniform3fv(U.uInk1, INK1); gl.uniform3fv(U.uInk2, INK2);
  gl.uniform3fv(U.uPaper, PAPER);
  gl.uniform2fv(U.uOff0, off[0]); gl.uniform2fv(U.uOff1, off[1]); gl.uniform2fv(U.uOff2, off[2]);
  gl.uniform1f(U.uRot0, 0.0006); gl.uniform1f(U.uRot1, -0.0009); gl.uniform1f(U.uRot2, 0.0004);
  gl.uniform1f(U.uAng0, Math.PI / 12); gl.uniform1f(U.uAng1, Math.PI * 5 / 12); gl.uniform1f(U.uAng2, 0.02);
  gl.uniform1f(U.uPeriod, 7.2);
  gl.uniform1f(U.uGrain, 0.30);
  gl.uniform1f(U.uSeed, Math.floor(t * 12) % 97);
  gl.uniform1f(U.uPinhole, 1.0);
  gl.drawArrays(gl.TRIANGLES, 0, 3);

  return { shot: shot.id, scene: shot.sc, sub: sub ? sub.text : '', p: +p.toFixed(3), kick: +ke.toFixed(2) };
}

window.drawAt = drawAt;
window.__ready = true;

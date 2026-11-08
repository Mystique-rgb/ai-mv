// sets.js — 七个画板（Ref 平涂 → 刀痕批）
import { Ref, paintRef } from '../engine/plate.js';
import { Strokes, KNIFE, BRUSH, DAB } from '../engine/impasto.js';

const C = window.PAL.C;
const hex = window.PAL.hex, mix = window.PAL.mix, shade = window.PAL.shade;

const rect = (x, y, w, h) => ctx => { ctx.rect(x, y, w, h); };
const poly = pts => ctx => { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); };
const ell = (x, y, rx, ry) => ctx => { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, 0, 0, 6.2832); };

function build(name, w, h, scale, draw, o = {}) {
  const ref = new Ref(w, h, scale);
  draw(ref);
  const st = new Strokes(60000);
  paintRef(ref, { R: o.R || [30, 16, 8, 4], T: o.T ?? 14, out: st, seed: o.seed || 7 });
  return { name, w, h, strokes: st, anchors: o.anchors || {} };
}

// ——————————————————————— P1 · 街角招牌墙 ———————————————————————
function P1(ref) {
  // 天
  ref.fill(rect(0, 0, 2200, 1240), '#14100F', { dir: 12, maxR: 60, group: 1 });
  // 远处楼群
  for (let i = 0; i < 7; i++) {
    const x = 60 + i * 150, w = 110 + (i % 3) * 40, top = 150 + (i % 4) * 55;
    ref.fill(rect(x, top, w, 900 - top), i % 2 ? '#232632' : '#1B1F28', { dir: 90, maxR: 26, group: 10 + i });
    for (let wy = top + 30; wy < 860; wy += 54) for (let wx = x + 14; wx < x + w - 18; wx += 36) {
      if ((wx + wy + i * 7) % 3 === 0) continue;
      ref.fill(rect(wx, wy, 13, 18), (wx * wy) % 5 === 0 ? '#C9762F' : '#3A4050', { dir: 0, maxR: 3, detail: 3, group: 30 + i });
    }
  }
  // 主墙（右 2/3）
  ref.fill(rect(860, 130, 1340, 900), '#2B2A2C', { dir: 88, maxR: 34, group: 60 });
  ref.fill(rect(860, 130, 1340, 180), '#221F21', { dir: 90, maxR: 24, group: 61 });
  // 三层旧广告
  ref.fill(rect(960, 300, 1080, 250), '#3A3F46', { dir: 0, maxR: 18, group: 62 });      // 2026 空白
  ref.fill(rect(1000, 340, 980, 180), '#4A4340', { dir: 2, maxR: 22, group: 63 });      // 撕口
  ref.fill(poly([[1000, 340], [1110, 340], [1080, 520], [1000, 520]]), '#7A3A34', { dir: 60, maxR: 8, detail: 2, group: 64 }); // 2022
  ref.fill(poly([[1300, 340], [1980, 340], [1980, 420], [1300, 400]]), '#5E6A5A', { dir: 4, maxR: 10, detail: 3, group: 65 });
  // 墙脚 + 台度
  ref.fill(rect(860, 860, 1340, 170), '#1D1B1C', { dir: 0, maxR: 20, group: 66 });
  // 路灯杆
  ref.fill(rect(940, 60, 22, 900), '#101010', { dir: 90, maxR: 8, detail: 3, group: 67 });
  ref.fill(rect(880, 50, 140, 30), '#0E0E0E', { dir: 0, maxR: 6, detail: 3, group: 67 });
  ref.fill(ell(950, 96, 34, 26), '#F7D08A', { dir: 0, maxR: 5, detail: 4, group: 68 });  // 灯泡
  // 街面（湿）
  ref.fill(rect(0, 1000, 2200, 240), '#2A2D33', { dir: 0, maxR: 40, group: 70 });
  ref.fill(ell(620, 1090, 460, 90), '#3B4149', { dir: 0, maxR: 30, group: 71 });
  // 湿地反光的竖条（钠橙）
  for (let i = 0; i < 9; i++) {
    const x = 700 + i * 120;
    ref.fill(rect(x, 1010 + (i % 3) * 12, 14 + (i % 4) * 6, 150), i % 2 ? '#8A5A2A' : '#6B4522', { dir: 90, maxR: 7, detail: 2, group: 72 });
  }
  // 第三块方砖（灰斑的家，会被动态灰斑盖住）
  ref.fill(rect(1000, 1030, 190, 150), '#4A4740', { dir: 0, maxR: 14, group: 73 });
  // 墙角小广告纸
  ref.fill(rect(1420, 700, 120, 90), '#C8BFA8', { dir: 4, maxR: 7, detail: 3, group: 74 });
}

// ——————————————————————— P2 · 食街 / 便利店 ———————————————————————
function P2(ref) {
  ref.fill(rect(0, 0, 2200, 1240), '#1A1512', { dir: 10, maxR: 50, group: 1 });
  // 招牌光晕底
  ref.fill(ell(560, 240, 520, 260), '#3E2A18', { dir: 0, maxR: 40, group: 2 });
  ref.fill(rect(200, 120, 900, 90), '#C9762F', { dir: 0, maxR: 12, detail: 2, group: 3 }); // 招牌
  // 货架（右）
  ref.fill(rect(1240, 200, 900, 780), '#2A211C', { dir: 90, maxR: 26, group: 10 });
  const cols = ['#B8402F', '#2F6B52', '#C9A24B', '#3B5C7A', '#8A5A2A', '#6E4A6B'];
  for (let r = 0; r < 5; r++) for (let c = 0; c < 7; c++) {
    ref.fill(rect(1270 + c * 122, 240 + r * 148, 96, 112), cols[(r * 3 + c) % 6], { dir: r % 2 ? 0 : 90, maxR: 9, detail: 2, group: 20 + r * 7 + c });
  }
  ref.fill(rect(1240, 960, 900, 40), '#3A2C24', { dir: 0, maxR: 10, group: 9 });
  // 台面
  ref.fill(rect(0, 900, 1240, 120), '#3B2E24', { dir: 0, maxR: 26, group: 40 });
  ref.fill(rect(0, 1020, 2200, 220), '#241A14', { dir: 0, maxR: 40, group: 41 });
  // 关东煮锅
  ref.fill(ell(430, 880, 230, 60), '#4A4A50', { dir: 0, maxR: 14, group: 42 });
  ref.fill(poly([[200, 880], [660, 880], [640, 960], [220, 960]]), '#5A5A62', { dir: 0, maxR: 12, group: 43 });
  for (let i = 0; i < 6; i++) ref.fill(ell(250 + i * 68, 872, 26, 14), '#C9A24B', { dir: 0, maxR: 4, detail: 3, group: 44 });
  // 签筒
  ref.fill(rect(760, 800, 90, 110), '#7A5A3A', { dir: 90, maxR: 8, detail: 3, group: 45 });
  // 塑料凳
  ref.fill(rect(120, 800, 110, 20), '#B8402F', { dir: 0, maxR: 7, detail: 3, group: 46 });
  // 蒸汽（用白色块，动态还会补）
  for (let i = 0; i < 4; i++) ref.fill(ell(320 + i * 90, 760 - i * 26, 80, 50), '#EFE6D6', { dir: 20, maxR: 20, group: 47, alpha: .35 });
  // 玻璃门 + 门内灯
  ref.fill(rect(60, 300, 340, 600), '#2E2A2A', { dir: 90, maxR: 20, group: 50 });
  ref.fill(rect(84, 320, 292, 560), '#6B4A2E', { dir: 0, maxR: 18, group: 51 });
}

// ——————————————————————— P3 · 长街 / 长椅 / 橱窗 ———————————————————————
function P3(ref) {
  ref.fill(rect(0, 0, 2200, 1240), '#191514', { dir: 8, maxR: 50, group: 1 });
  // 远楼
  for (let i = 0; i < 6; i++) ref.fill(rect(80 + i * 340, 120 + (i % 3) * 60, 280, 780), i % 2 ? '#20242E' : '#191D25', { dir: 90, maxR: 24, group: 10 + i });
  // 卷帘门
  for (let i = 0; i < 5; i++) {
    ref.fill(rect(120 + i * 400, 420, 340, 500), i % 2 ? '#33302E' : '#2A2725', { dir: 90, maxR: 16, group: 20 + i });
    for (let s = 0; s < 9; s++) ref.fill(rect(120 + i * 400, 430 + s * 54, 340, 8), '#3E3A36', { dir: 0, maxR: 4, detail: 3, group: 30 + i });
  }
  // 橱窗 + 旧照片（平涂：极小的 maxR）
  ref.fill(rect(1560, 380, 520, 520), '#0F1216', { dir: 90, maxR: 18, group: 60 });
  ref.fill(rect(1600, 420, 440, 440), '#1A2028', { dir: 0, maxR: 14, group: 61 });
  ref.fill(rect(1700, 500, 240, 300), '#C9BFA8', { dir: 0, maxR: 3, detail: 6, group: 62 });
  ref.fill(rect(1712, 512, 216, 276), '#8E8672', { dir: 0, maxR: 3, detail: 6, group: 63 });
  ref.fill(poly([[1740, 760], [1760, 600], [1800, 600], [1810, 760]]), '#4A4438', { dir: 0, maxR: 2, detail: 8, group: 64 });
  ref.fill(poly([[1840, 760], [1852, 610], [1886, 610], [1896, 760]]), '#B9AE96', { dir: 0, maxR: 2, detail: 8, group: 65 });
  // 长椅
  ref.fill(rect(300, 780, 460, 26), '#4A3A28', { dir: 0, maxR: 8, detail: 3, group: 70 });
  ref.fill(rect(300, 860, 460, 26), '#43341F', { dir: 0, maxR: 8, detail: 3, group: 71 });
  ref.fill(rect(330, 806, 22, 70), '#2E2418', { dir: 90, maxR: 6, group: 72 });
  ref.fill(rect(710, 806, 22, 70), '#2E2418', { dir: 90, maxR: 6, group: 73 });
  for (let i = 0; i < 5; i++) ref.fill(rect(320 + i * 88, 786, 66, 14), '#54402A', { dir: 0, maxR: 5, group: 74 });
  // 站牌
  ref.fill(rect(980, 520, 14, 480), '#25252A', { dir: 90, maxR: 5, detail: 3, group: 80 });
  ref.fill(rect(944, 470, 90, 66), '#D9D2C0', { dir: 0, maxR: 3, detail: 6, group: 81 });
  // 街面
  ref.fill(rect(0, 920, 2200, 320), '#282B31', { dir: 0, maxR: 40, group: 90 });
  ref.fill(ell(700, 1150, 700, 110), '#363C45', { dir: 0, maxR: 30, group: 91 });
  for (let i = 0; i < 10; i++) ref.fill(rect(160 + i * 200, 940, 16, 200), i % 2 ? '#7A4E22' : '#5E3C1C', { dir: 90, maxR: 8, detail: 2, group: 92 });
}

// ——————————————————————— P4 · 天桥 ———————————————————————
function P4(ref) {
  ref.fill(rect(0, 0, 2200, 1240), '#151318', { dir: 8, maxR: 50, group: 1 });
  // 下方城市：窗户点阵
  for (let i = 0; i < 26; i++) {
    const x = (i * 91) % 2100, y = 520 + (i * 37) % 420;
    ref.fill(rect(x, y, 42, 9), i % 3 ? '#C9762F' : '#E8B25C', { dir: 0, maxR: 3, detail: 5, group: 2 });
  }
  for (let i = 0; i < 9; i++) ref.fill(rect(60 + i * 240, 300 + (i % 4) * 90, 150, 700), '#1B1C24', { dir: 90, maxR: 22, group: 20 + i });
  // 桥面
  ref.fill(rect(0, 760, 2200, 480), '#23252B', { dir: 0, maxR: 40, group: 40 });
  ref.fill(rect(0, 745, 2200, 26), '#3A3E46', { dir: 0, maxR: 12, group: 41 });
  // 护栏
  ref.fill(rect(0, 600, 2200, 22), '#121216', { dir: 0, maxR: 10, group: 50 });
  ref.fill(rect(0, 690, 2200, 18), '#0F0F13', { dir: 0, maxR: 8, group: 51 });
  for (let i = 0; i < 22; i++) ref.fill(rect(40 + i * 100, 600, 12, 160), '#0D0D11', { dir: 90, maxR: 6, detail: 3, group: 52 });
  // 桥下红灯
  for (let i = 0; i < 5; i++) ref.fill(ell(180 + i * 460, 620, 16, 16), '#B8402F', { dir: 0, maxR: 4, detail: 4, group: 60 });
}

// ——————————————————————— P5 · 楼顶 ———————————————————————
function P5(ref) {
  ref.fill(rect(0, 0, 2200, 1240), '#1B1A20', { dir: 6, maxR: 60, group: 1 });
  ref.fill(rect(0, 520, 2200, 220), '#2A2630', { dir: 0, maxR: 40, group: 2 });
  // 天际线
  for (let i = 0; i < 12; i++) {
    const x = i * 190 - 40, w = 150 + (i % 3) * 30, top = 380 + (i % 5) * 70;
    ref.fill(rect(x, top, w, 900 - top), i % 2 ? '#20222C' : '#1A1C24', { dir: 90, maxR: 20, group: 10 + i });
    for (let wy = top + 30; wy < 820; wy += 60) for (let wx = x + 16; wx < x + w - 20; wx += 40) if ((wx + wy) % 4) ref.fill(rect(wx, wy, 12, 16), (wx * 3 + wy) % 7 === 0 ? '#E8B25C' : '#39404E', { dir: 0, maxR: 3, detail: 5, group: 30 + i });
  }
  // 广告牌铁架背面
  ref.fill(rect(1240, 120, 760, 520), '#242628', { dir: 0, maxR: 22, group: 60 });
  for (let i = 0; i < 7; i++) ref.fill(rect(1240 + i * 108, 120, 18, 520), '#17191B', { dir: 90, maxR: 6, detail: 3, group: 61 });
  for (let i = 0; i < 4; i++) ref.fill(rect(1240, 160 + i * 120, 760, 14), '#17191B', { dir: 0, maxR: 6, detail: 3, group: 62 });
  // 屋面
  ref.fill(rect(0, 880, 2200, 360), '#2E2C2C', { dir: 0, maxR: 40, group: 70 });
  ref.fill(rect(0, 870, 2200, 20), '#464444', { dir: 0, maxR: 10, group: 71 });
  // 烟囱 / 水塔
  ref.fill(rect(300, 700, 120, 200), '#262424', { dir: 90, maxR: 14, group: 72 });
  ref.fill(rect(1900, 640, 140, 260), '#222020', { dir: 90, maxR: 16, group: 73 });
}

// ——————————————————————— P6 · 微距：罐与刀 ———————————————————————
function P6(ref) {
  ref.fill(rect(0, 0, 1600, 1000), '#1A1614', { dir: 8, maxR: 50, group: 1 });
  // 桌面
  ref.fill(rect(0, 520, 1600, 480), '#2A2320', { dir: 0, maxR: 40, group: 2 });
  ref.fill(rect(0, 512, 1600, 14), '#463A32', { dir: 0, maxR: 8, group: 3 });
  // 罐身
  ref.fill(poly([[560, 250], [1040, 250], [1060, 520], [540, 520]]), '#8E8A80', { dir: 90, maxR: 18, group: 10 });
  ref.fill(poly([[600, 300], [1000, 300], [1010, 500], [590, 500]]), '#C8BFA8', { dir: 90, maxR: 10, detail: 2, group: 11 }); // 标签
  ref.fill(poly([[560, 250], [1040, 250], [1040, 286], [560, 286]]), '#6E6A62', { dir: 0, maxR: 8, group: 12 });   // 罐口
  ref.fill(ell(800, 262, 236, 34), '#5A564E', { dir: 0, maxR: 6, detail: 3, group: 13 });                            // 干壳
  ref.fill(ell(800, 268, 190, 22), '#9A958C', { dir: 0, maxR: 4, detail: 4, group: 14 });                            // 粉面
  // 干裂
  for (let i = 0; i < 4; i++) ref.fill(poly([[770 + i * 24, 258], [790 + i * 24, 258], [800 + i * 26, 280], [778 + i * 24, 280]]), '#7C7870', { dir: 90, maxR: 3, detail: 5, group: 15 });
  // 刀
  ref.fill(poly([[180, 700], [520, 640], [700, 700], [520, 760]]), '#B9BDC4', { dir: 8, maxR: 12, group: 20 });
  ref.fill(poly([[180, 700], [300, 660], [300, 742], [180, 720]]), '#8A8F98', { dir: 8, maxR: 8, group: 21 });
  ref.fill(rect(120, 686, 70, 40), '#6B4A2E', { dir: 0, maxR: 6, detail: 3, group: 22 });
  // 桌上颜料堆
  for (let i = 0; i < 6; i++) ref.fill(ell(1150 + (i % 3) * 90, 600 + Math.floor(i / 3) * 90, 42, 26), i % 2 ? '#E0708C' : '#B98F98', { dir: 20, maxR: 8, group: 30 + i });
}

// ——————————————————————— P7 · 全城俯视 ———————————————————————
function P7(ref) {
  ref.fill(rect(0, 0, 2400, 1400), '#1C1A1E', { dir: 0, maxR: 60, group: 1 });
  // 街区网格
  const bw = 300, bh = 260;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 8; c++) {
    const x = 40 + c * bw, y = 60 + r * bh;
    ref.fill(rect(x, y, bw - 46, bh - 52), (r + c) % 3 ? '#2A2B30' : '#323238', { dir: (r + c) % 2 ? 0 : 90, maxR: 22, group: 10 + r * 8 + c });
    for (let i = 0; i < 14; i++) {
      const wx = x + 18 + (i % 7) * 34, wy = y + 20 + Math.floor(i / 7) * 80;
      ref.fill(rect(wx, wy, 15, 22), (i * 3 + r * 7 + c) % 4 ? '#3C4152' : '#E8B25C', { dir: 0, maxR: 3, detail: 5, group: 60 + r * 8 + c });
    }
  }
  // 路
  for (let c = 0; c <= 8; c++) ref.fill(rect(40 + c * bw - 46, 0, 46, 1400), '#232227', { dir: 90, maxR: 20, group: 200 });
  for (let r = 0; r <= 5; r++) ref.fill(rect(0, 60 + r * bh - 52, 2400, 52), '#232227', { dir: 0, maxR: 20, group: 201 });
  // 第 7 街 × 第 3 巷：没上色的那一格
  ref.fill(rect(40 + 6 * bw - 46 + 8, 60 + 3 * bh - 52 + 22, 120, 96), '#8A857C', { dir: 0, maxR: 4, detail: 6, group: 300 });
}

export const SETS = {};
export function buildSets() {
  SETS.P1 = build('P1', 2200, 1240, .5, P1, { seed: 11, anchors: { grey: { x: 1095, y: 1105, r: 95 }, bench: { x: 530, y: 800 }, wall: { x: 1500, y: 500 } } });
  SETS.P2 = build('P2', 2200, 1240, .5, P2, { seed: 23, anchors: { counter: { x: 700, y: 900 }, shelf: { x: 1600, y: 500 } } });
  SETS.P3 = build('P3', 2200, 1240, .5, P3, { seed: 31, anchors: { bench: { x: 530, y: 780 }, photo: { x: 1820, y: 650 }, sign: { x: 985, y: 500 } } });
  SETS.P4 = build('P4', 2200, 1240, .5, P4, { seed: 41, anchors: {} });
  SETS.P5 = build('P5', 2200, 1240, .5, P5, { seed: 53, anchors: {} });
  SETS.P6 = build('P6', 1600, 1000, .8, P6, { seed: 61, anchors: { can: { x: 800, y: 400 }, knife: { x: 420, y: 700 } } });
  SETS.P7 = build('P7', 2400, 1400, .45, P7, { seed: 71, anchors: { hole: { x: 40 + 6 * 300 - 46 + 68, y: 60 + 3 * 260 - 52 + 70 } } });
  return SETS;
}

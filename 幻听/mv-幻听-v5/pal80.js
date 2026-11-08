// 色指定 4 套（80s 赛璐璐硬约束：不是滤镜，是每套各自一套 mid/lit/shadow/line/rim 五值）
// A 室内钨丝  B 霓虹夜窗  C 雨玻璃·副歌  D 尾奏冷蓝
// light = 光从哪个方向来（单位向量，屏幕坐标 y 向下）；角色阴影朝反方向偏移
export const SETS = {
  A: {
    key: 'A', name: '室内钨丝',
    env: {
      wall: '#3A2A24', wallHi: '#4E382B', wallLo: '#241812',
      floor: '#2A1C16', floorHi: '#402C22', floorLo: '#150D0A',
      lamp: '#F3B24A', lampHot: '#FFE0A8', lampCone: '#F0A94A',
      glass: '#1B1E3C', glassHi: '#2C3160',
      blind: '#171009',
    },
    char: { mid: '#D97757', lit: '#E9966F', sh: '#A6502F', line: '#57281B', rim: '#FFD79A' },
    pink: { mid: '#E58384', lit: '#F2A3A4', sh: '#A8505A', line: '#5E2A32', rim: '#FFD0DA' },
    prop: {
      wood: '#6B4630', woodHi: '#8A5C3E', woodLo: '#38220F',
      metal: '#8A8C99', chrome: '#C9D2E4', chromeLo: '#5D6478',
      deck: '#2E2A26', deckHi: '#4A443C', deckLo: '#141210',
      gold: '#E8B94A', goldHi: '#FFF0B0', green: '#8FE3B0', red: '#D8352A',
      cream: '#F3E2C0', needle: '#F6E8C8', card: '#F0E4C8',
    },
    light: [-0.85, -0.52], backlit: 0,
  },
  B: {
    key: 'B', name: '霓虹夜窗',
    env: {
      wall: '#231B33', wallHi: '#3A2C4E', wallLo: '#150F20',
      floor: '#1A1426', floorHi: '#2E2340', floorLo: '#0C0814',
      lamp: '#F3B24A', lampHot: '#FFE0A8', lampCone: '#E89A3C',
      glass: '#1B1E3C', glassHi: '#3A3F74',
      blind: '#120C1C',
      magenta: '#FF4E8A', cyan: '#37D6E0', gold: '#F3B24A',
    },
    char: { mid: '#D97757', lit: '#EC8E68', sh: '#8E4A44', line: '#5A2A28', rim: '#FF7BB0' },
    pink: { mid: '#E58384', lit: '#F5A6A8', sh: '#9A4450', line: '#54202C', rim: '#FFE1EA' },
    prop: {
      wood: '#4A3030', woodHi: '#654242', woodLo: '#241616',
      metal: '#6E7080', chrome: '#B9C2D8', chromeLo: '#4C5266',
      deck: '#242032', deckHi: '#3C3750', deckLo: '#0E0C16',
      gold: '#E8B94A', goldHi: '#FFF0B0', green: '#8FE3B0', red: '#E03A3A',
      cream: '#EDE0C4', needle: '#F6E8C8', card: '#E6D9BE',
    },
    light: [-0.45, -0.9], backlit: 1,
  },
  C: {
    key: 'C', name: '雨玻璃·副歌',
    env: {
      wall: '#2A3A46', wallHi: '#45606E', wallLo: '#18242C',
      floor: '#1E2A32', floorHi: '#33454F', floorLo: '#0E161B',
      lamp: '#F3B24A', lampHot: '#FFEFC0', lampCone: '#E89A3C',
      glass: '#20303E', glassHi: '#4C6B80',
      blind: '#10181E',
      cyan: '#6FE3FF', magenta: '#FF4E8A', gold: '#F3B24A',
    },
    char: { mid: '#C4694F', lit: '#DE8365', sh: '#7E3F3C', line: '#4E2725', rim: '#6FE3FF' },
    pink: { mid: '#D2737E', lit: '#E6989F', sh: '#8E4550', line: '#4A1F28', rim: '#BFF3FF' },
    prop: {
      wood: '#4E4238', woodHi: '#6C5A4A', woodLo: '#241E18',
      metal: '#7C8494', chrome: '#CFD9EA', chromeLo: '#525C70',
      deck: '#26303A', deckHi: '#3E4C58', deckLo: '#101820',
      gold: '#E8B94A', goldHi: '#FFF0B0', green: '#8FE3B0', red: '#E03A3A',
      cream: '#EFE6D0', needle: '#F6E8C8', card: '#E8DFC6',
    },
    light: [-0.2, -0.95], backlit: 1,
  },
  D: {
    key: 'D', name: '尾奏冷蓝',
    env: {
      wall: '#1A2330', wallHi: '#2A3542', wallLo: '#0F151C',
      floor: '#131A22', floorHi: '#222E38', floorLo: '#080C10',
      lamp: '#E8C48A', lampHot: '#FFF0C8', lampCone: '#BA9660',
      glass: '#16202C', glassHi: '#2C3C4C',
      blind: '#0A0F14',
      gold: '#E8B94A', green: '#8FE3B0',
    },
    char: { mid: '#A85B49', lit: '#C06E58', sh: '#5E3434', line: '#3A1F1E', rim: '#C87E62' },
    pink: { mid: '#B9687A', lit: '#CE8292', sh: '#6E3040', line: '#3A1720', rim: '#D89098' },
    prop: {
      wood: '#2C333C', woodHi: '#3E4852', woodLo: '#141A20',
      metal: '#5E6A76', chrome: '#A8B8C6', chromeLo: '#3E4A56',
      deck: '#1E262E', deckHi: '#303C46', deckLo: '#0A1016',
      gold: '#E8B94A', goldHi: '#FFF0B0', green: '#8FE3B0', red: '#C03030',
      cream: '#DCE6E0', needle: '#CFE8DA', card: '#D8E0D8',
    },
    light: [-0.7, 0.62], backlit: 0,
  },
};
export const P = SETS.A;

// 小节头换套：A 0–9.44 / B 9.44–13.20 / C 13.20–20.71 / D 20.71–30.64
export function setAt(t) {
  if (t < 9.44) return SETS.A;
  if (t < 13.20) return SETS.B;
  if (t < 20.71) return SETS.C;
  return SETS.D;
}
// 换套白闪：每个换套点 1–3 帧
export const SEAM = [9.44, 13.20, 20.71];
export function whiteFlash(t, n = 1) {
  for (const s of SEAM) { const d = t - s; if (d >= 0 && d < n / 24) return 1 - d / (n / 24); }
  return 0;
}

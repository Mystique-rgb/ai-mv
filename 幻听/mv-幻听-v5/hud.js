// 字幕层：华文楷体，奶黄字面 + 深棕描边 + 软影；硬上硬下，不进 fade
import { W, H, rgba } from '/styles/cel-anime-80s/demo/cel.js';
import { lyricAt } from './story.js';

export function hud(c, t) {
  c.clearRect(0, 0, W, H);
  const v = lyricAt(t);
  if (!v) return;
  const y = H - 92;
  c.save();
  c.font = '58px STKaiti, "Microsoft YaHei", serif';
  c.textBaseline = 'middle';
  c.textAlign = 'center';
  const x = W / 2;
  // 软影
  c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 14; c.shadowOffsetY = 4;
  c.fillStyle = '#FFE9B8'; c.fillText(v.text, x, y);
  c.shadowColor = 'transparent';
  // 深棕描边（描两遍让楷体更立得住）
  c.lineJoin = 'round'; c.lineWidth = 6; c.strokeStyle = '#2A1C18';
  c.strokeText(v.text, x, y);
  c.lineWidth = 2.4; c.strokeStyle = 'rgba(84,48,30,.9)';
  c.strokeText(v.text, x, y);
  // 字面
  c.fillStyle = '#FFF3D6'; c.fillText(v.text, x, y);
  // 一道很淡的横向反光（贴在磁带上的感觉）
  c.globalCompositeOperation = 'lighter';
  c.fillStyle = 'rgba(255,240,210,.10)';
  c.fillRect(x - 320, y - 30, 640, 12);
  c.restore();
}

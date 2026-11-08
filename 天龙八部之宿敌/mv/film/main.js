// main.js — 把镜头、字幕、纸面合成一帧。render(t) 是 t 的纯函数。
import { W, H, warmUp } from './world.js';
import { shotAt, setCtx } from './shots.js';
import { drawSubs } from './subs.js';

const cv = document.getElementById('cv'), g = cv.getContext('2d', { alpha: false });
const probe = '会在何处见到你莫非前尘已注定飞过时空的距离却囿于刀剑光影三月春花渐次醒迢迢年华谁老去是劫是缘随我心除了你万敌不侵当恩怨各一半我怎么圈揽看灯笼血红染寻仇已太晚月下门童喟叹昨夜太平长安当天上星河转我命已定盘待绝笔墨痕干宿敌已来犯我借你的孤单今生恐怕难还缠绕孤岛的雪雨飘飘洒洒谁来停摘取一颗海上星陪我终夜不孤寂灵柩长埋深谷底没有永远的秘密染指江湖结悲局无人逃得过宿命';
await document.fonts.load('400 62px "Xingkai"', probe);
await document.fonts.load('700 200px "Xingkai"', '宿敌');
setCtx(g);
warmUp();

window.DUR = 263.34;
window.render = t => {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.fillStyle = '#0d0608'; g.fillRect(0, 0, W, H);
  const sh = shotAt(t);
  sh[2](g, t, t - sh[0], sh[1] - sh[0]);
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  drawSubs(g, t);
};
window.READY = true;

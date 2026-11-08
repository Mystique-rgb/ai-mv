# -*- coding: utf-8 -*-
"""生成《天龙八部之宿敌》字幕核对 HTML（音频 + 滚动歌词 + 逐字点亮）"""
import json, shutil, os

ROOT = r"D:\ai音乐mv\天龙八部之宿敌"
OUT = os.path.join(ROOT, "输出")
subs = json.load(open(os.path.join(OUT, "天龙八部之宿敌_逐字时间戳.json"), encoding="utf-8"))
DUR = 263.34

HTML = """<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>天龙八部之宿敌 · 字幕核对</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{
    font-family:-apple-system,"PingFang SC","Microsoft YaHei",sans-serif;
    background:radial-gradient(1200px 700px at 50% -10%,#231c2e 0%,#120e18 55%,#0a070e 100%);
    color:#e8ecf4;min-height:100vh;display:flex;align-items:center;justify-content:center;
    padding:24px 16px;
  }
  .shell{width:100%;max-width:760px}
  .top{display:flex;align-items:baseline;justify-content:space-between;margin-bottom:18px;padding:0 6px}
  .title{font-size:15px;letter-spacing:.14em;color:#a08fc0;font-weight:600}
  .title b{color:#fff;font-weight:700;letter-spacing:.02em;font-size:17px}
  .hint{font-size:12px;color:#6b5d82}

  .stage{
    position:relative;background:linear-gradient(180deg,#1a1425 0%,#130e1c 100%);
    border:1px solid #2a2038;border-radius:20px;padding:30px 26px 22px;
    box-shadow:0 24px 70px -24px #000, inset 0 1px 0 #ffffff0d;
    overflow:hidden;
  }
  .stage::after{
    content:"";position:absolute;inset:0;pointer-events:none;
    background:radial-gradient(420px 220px at 50% 42%,#8a5fd414 0%,transparent 70%);
  }
  .lyrics{
    height:372px;overflow-y:auto;scrollbar-width:none;
    mask-image:linear-gradient(180deg,transparent 0,#000 16%,#000 78%,transparent 100%);
  }
  .lyrics::-webkit-scrollbar{display:none}
  .pad{height:146px}

  .line{
    padding:9px 14px;border-radius:12px;cursor:pointer;
    font-size:23px;line-height:1.55;color:#5d5470;font-weight:500;
    transition:color .25s,transform .25s,opacity .25s;
    text-align:center;letter-spacing:.02em;
    position:relative;
  }
  .line:hover{color:#b0a2cd;background:#ffffff06}
  .line.done{color:#483d5c}
  .line.active{color:#fff;transform:scale(1.06);font-weight:700;
    text-shadow:0 0 30px #a86eff55}
  .line.active .ch.filled{color:#ffd9a0}
  .ch{transition:color .12s}
  .ch.filled{color:#ffcf87}

  .meta{
    display:flex;justify-content:space-between;align-items:center;
    margin-top:8px;font-size:11px;color:#544a68;padding:0 6px;
    font-variant-numeric:tabular-nums;font-family:ui-monospace,Consolas,monospace;
  }

  .ctrl{margin-top:22px;display:flex;align-items:center;gap:14px;padding:0 4px}
  .play{
    width:46px;height:46px;border-radius:14px;background:linear-gradient(180deg,#8a4ff0,#6a35c8);border:1px solid #b28aff44;
    color:#fff;font-size:15px;cursor:pointer;flex:none;
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 8px 24px -8px #8a4ff0aa;transition:transform .12s,filter .12s;
  }
  .play:hover{filter:brightness(1.12)}
  .play:active{transform:scale(.95)}
  .bar{flex:1;position:relative;height:6px;border-radius:6px;background:#241c32;cursor:pointer;overflow:hidden}
  .fill{position:absolute;inset:0 auto 0 0;width:0;background:linear-gradient(90deg,#8a4ff0,#d09aff);border-radius:6px}
  .time{font-size:12px;color:#8d7fa3;font-variant-numeric:tabular-nums;
    font-family:ui-monospace,Consolas,monospace;flex:none;min-width:86px;text-align:right}

  .foot{margin-top:16px;padding:0 6px;font-size:11.5px;color:#5c5270;line-height:1.7}
  .kbd{background:#221b30;border:1px solid #342848;border-radius:5px;padding:1px 5px;
    font-family:ui-monospace,monospace;color:#a394bd;font-size:11px}
</style>
</head>
<body>
<div class="shell">
  <div class="top">
    <div class="title"><b>天龙八部之宿敌</b> &nbsp;/&nbsp; 许嵩 263.34s · 52 行</div>
    <div class="hint">点击任意一行可跳转</div>
  </div>

  <div class="stage">
    <div class="lyrics" id="lyrics"><div class="pad"></div></div>
    <div class="meta">
      <span id="cur">--</span>
      <span id="code">SRT 时间码</span>
    </div>
  </div>

  <div class="ctrl">
    <button class="play" id="play">▶</button>
    <div class="bar" id="bar"><div class="fill" id="fill"></div></div>
    <div class="time" id="time">0:00.00 / 4:23.34</div>
  </div>

  <div class="foot">
    空格 播放/暂停 &nbsp;·&nbsp; <span class="kbd">←</span> <span class="kbd">→</span> 前后 2 秒 &nbsp;·&nbsp;
    逐字点亮来自 faster-whisper medium 词级对齐 + 人声能量校验
  </div>
</div>

<audio id="audio" src="song.mp3" preload="auto"></audio>
<script>
const LINES = __DATA__;
const DUR = 263.34;
const box = document.getElementById('lyrics');
const audio = document.getElementById('audio');
const fill = document.getElementById('fill');
const timeEl = document.getElementById('time');
const curEl = document.getElementById('cur');
const codeEl = document.getElementById('code');
const playBtn = document.getElementById('play');

const nodes = [];
LINES.forEach((ln, i) => {
  const d = document.createElement('div');
  d.className = 'line';
  d.dataset.i = i;
  const spans = ln.c.map(([ch]) => {
    const s = document.createElement('span');
    s.className = 'ch'; s.textContent = ch;
    d.appendChild(s); return s;
  });
  d.addEventListener('click', () => { audio.currentTime = ln.s + 0.001; audio.play(); });
  box.appendChild(d);
  nodes.push({el: d, spans, line: ln});
});
const tail = document.createElement('div'); tail.className = 'pad';
box.appendChild(tail);

function srt(t){
  const m = Math.floor(t/60), s = t%60;
  const ss = String(Math.floor(s)).padStart(2,'0');
  const ms = String(Math.round((s%1)*1000)).padStart(3,'0');
  return `${String(m).padStart(2,'0')}:${ss},${ms}`;
}

let activeIdx = -1;
function tick(){
  const t = audio.currentTime;
  fill.style.width = (t/DUR*100) + '%';
  timeEl.textContent = `${Math.floor(t/60)}:${String(Math.floor(t%60)).padStart(2,'0')}.${String(Math.floor((t%1)*100)).padStart(2,'0')} / 4:23.34`;

  let idx = -1;
  for (let i = 0; i < LINES.length; i++){
    if (t >= LINES[i].s && t < LINES[i].e) { idx = i; break; }
  }
  if (idx !== activeIdx){
    if (activeIdx >= 0) nodes[activeIdx].el.classList.remove('active');
    if (idx >= 0){
      nodes[idx].el.classList.add('active');
      const el = nodes[idx].el;
      const target = el.offsetTop - box.clientHeight/2 + el.clientHeight/2;
      box.scrollTo({top: target, behavior:'smooth'});
    }
    activeIdx = idx;
  }
  nodes.forEach((n, i) => {
    n.el.classList.toggle('done', t >= n.line.e);
    if (i === idx){
      n.spans.forEach((sp, k) => {
        sp.classList.toggle('filled', t >= n.line.c[k][1]);
      });
    } else {
      n.spans.forEach(sp => sp.classList.remove('filled'));
    }
  });

  if (idx >= 0){
    curEl.textContent = `第 ${idx+1} 句 · ${LINES[idx].t}`;
    codeEl.textContent = `${srt(LINES[idx].s)} → ${srt(LINES[idx].e)}`;
  } else {
    curEl.textContent = t < 22.3 ? '前奏' : (t > 101 && t < 123.5) ? '间奏' : (t >= 244.5 ? '尾奏' : '——');
    codeEl.textContent = 'SRT 时间码';
  }
  requestAnimationFrame(tick);
}

playBtn.onclick = () => audio.paused ? audio.play() : audio.pause();
audio.onplay = () => playBtn.textContent = '❚❚';
audio.onpause = () => playBtn.textContent = '▶';
document.getElementById('bar').onclick = e => {
  const r = e.currentTarget.getBoundingClientRect();
  audio.currentTime = (e.clientX - r.left)/r.width * DUR;
};
document.addEventListener('keydown', e => {
  if (e.code === 'Space'){ e.preventDefault(); playBtn.onclick(); }
  if (e.code === 'ArrowLeft'){ audio.currentTime = Math.max(0, audio.currentTime-2); }
  if (e.code === 'ArrowRight'){ audio.currentTime = Math.min(DUR, audio.currentTime+2); }
});
requestAnimationFrame(tick);
</script>
</body>
</html>
"""

data = [{"t": x["t"], "s": x["s"], "e": x["e"], "c": [[c[0], c[1]] for c in x["c"]]} for x in subs]
html = HTML.replace("__DATA__", json.dumps(data, ensure_ascii=False))
p = os.path.join(OUT, "天龙八部之宿敌_字幕核对.html")
open(p, "w", encoding="utf-8").write(html)
shutil.copy2(os.path.join(ROOT, "song.mp3"), os.path.join(OUT, "song.mp3"))
print("saved", p)

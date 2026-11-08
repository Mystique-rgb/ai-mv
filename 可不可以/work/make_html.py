# -*- coding: utf-8 -*-
"""生成字幕-音频对照页（本地 HTML，双击即可逐句试听）。"""
import json, os, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
data = json.load(open(os.path.join(ROOT, "work", "aligned.json"), encoding="utf-8"))
lines = data["lines"]
SEG = {"A1": "主歌一", "A2": "主歌二", "P1": "预副歌", "C1": "副歌",
       "B1": "桥段", "OUTRO": "尾声"}


def mmss(t):
    return f"{int(t // 60)}:{t % 60:05.2f}"


rows = []
for ln in lines:
    dur = ln["end"] - ln["start"]
    chars = len(ln["text"].replace(" ", ""))
    rows.append(f"""    <tr data-s="{ln['start']:.3f}" data-e="{ln['end']:.3f}">
      <td class="n">{ln['index']}</td>
      <td class="tag">{SEG.get(ln['tag'], ln['tag'])}</td>
      <td class="t">{mmss(ln['start'])}</td>
      <td class="t dim">{mmss(ln['end'])}</td>
      <td class="t dim">{dur:.2f}s</td>
      <td class="t dim">{chars / dur:.1f}</td>
      <td class="ly">{ln['text']}</td>
      <td><button class="play" title="只播这一句">▶</button></td>
    </tr>""")

html = f"""<!DOCTYPE html>
<html lang="zh-CN"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>可不可以 · 字幕音频对照</title>
<style>
  :root {{ --bg:#14110f; --panel:#1d1916; --line:#2e2823; --ink:#efe4d2;
           --dim:#9a8d7d; --hot:#c0503f; }}
  * {{ box-sizing:border-box; }}
  body {{ margin:0; background:var(--bg); color:var(--ink);
          font:15px/1.7 "Songti SC","Source Han Serif SC",serif; }}
  header {{ position:sticky; top:0; z-index:5; background:rgba(20,17,15,.96);
            border-bottom:1px solid var(--line); padding:16px 24px 12px; }}
  h1 {{ margin:0 0 2px; font-size:20px; font-weight:600; letter-spacing:.06em; }}
  .meta {{ color:var(--dim); font-size:13px; }}
  .meta b {{ color:var(--hot); font-weight:600; }}
  audio {{ width:100%; margin-top:10px; height:34px; filter:sepia(.25) saturate(.9); }}
  table {{ width:100%; border-collapse:collapse; margin:8px 0 60px; }}
  th {{ text-align:left; font-weight:500; font-size:12px; color:var(--dim);
        letter-spacing:.12em; padding:10px 8px; border-bottom:1px solid var(--line);
        position:sticky; top:112px; background:var(--bg); }}
  td {{ padding:9px 8px; border-bottom:1px solid var(--line); vertical-align:middle; }}
  tr.on {{ background:linear-gradient(90deg,rgba(192,80,63,.20),transparent 70%); }}
  tr.on .ly {{ color:#fff; }}
  .n {{ color:var(--dim); font-size:12px; width:44px; }}
  .tag {{ color:var(--dim); font-size:12px; white-space:nowrap; width:64px; }}
  .t {{ font-variant-numeric:tabular-nums; white-space:nowrap; width:84px; }}
  .dim {{ color:var(--dim); }}
  .ly {{ font-size:17px; letter-spacing:.02em; }}
  .play {{ background:none; border:1px solid var(--line); color:var(--dim); width:30px;
           height:26px; border-radius:2px; cursor:pointer; font-size:11px; }}
  .play:hover {{ border-color:var(--hot); color:var(--hot); }}
  tr:hover {{ background:rgba(255,255,255,.03); }}
  footer {{ position:fixed; bottom:0; left:0; right:0; background:var(--panel);
            border-top:1px solid var(--line); padding:8px 24px; font-size:12px;
            color:var(--dim); }}
</style></head><body>
<header>
  <h1>可不可以 · 字幕音频对照</h1>
  <div class="meta">张紫豪 · 词曲 刘伟锋 · 全长 {data['duration']:.2f}s ·
    <b>{len(lines)}</b> 条字幕 · 点任意行跳转试听</div>
  <audio id="au" controls preload="metadata" src="张紫豪 - 可不可以.mp3"></audio>
</header>
<table>
  <thead><tr><th>#</th><th>段落</th><th>起唱</th><th>收声</th><th>时长</th>
  <th>字/秒</th><th>字幕文本</th><th></th></tr></thead>
<tbody id="tb">
{chr(10).join(rows)}
</tbody></table>
<footer id="ft">未播放</footer>
<script>
const au = document.getElementById('au');
const trs = [...document.querySelectorAll('#tb tr')];
let loopEnd = null;
au.addEventListener('timeupdate', () => {{
  const t = au.currentTime;
  let cur = null;
  trs.forEach(tr => {{
    const s = +tr.dataset.s, e = +tr.dataset.e;
    tr.classList.toggle('on', t >= s - 0.05 && t < e);
    if (t >= s - 0.05 && t < e) cur = tr;
  }});
  if (loopEnd !== null && t >= loopEnd) {{ au.pause(); loopEnd = null; }}
  document.getElementById('ft').textContent =
    cur ? `当前：第 ${{cur.querySelector('.n').textContent}} 句 · ${{cur.dataset.s}}s` : `${{t.toFixed(2)}}s`;
}});
trs.forEach(tr => {{
  tr.querySelector('.play').addEventListener('click', ev => {{
    ev.stopPropagation();
    au.currentTime = +tr.dataset.s;
    loopEnd = +tr.dataset.e + 0.2;
    au.play();
  }});
  tr.addEventListener('click', () => {{
    au.currentTime = +tr.dataset.s;
    loopEnd = null;
    au.play();
  }});
}});
</script></body></html>
"""
p = os.path.join(ROOT, "张紫豪 - 可不可以-字幕对照.html")
open(p, "w", encoding="utf-8").write(html)
print("写入", p)

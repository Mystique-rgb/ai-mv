# -*- coding: utf-8 -*-
"""生成全套字幕（终版：行级时间经整轨+人声轨双源校准）"""
import os, json, re, shutil

OUT = r"D:\ai音乐mv\寂寞烟火\输出"
MP3 = r"D:\ai音乐mv\寂寞烟火\11月6日(1).MP3"
os.makedirs(OUT, exist_ok=True)

# (歌词, 行起, 行止, [(字, 字起), ...])
LINES = [
 ("跨越过多少海洋去看你", 0.00, 3.34,
  [("跨",0.26),("越",0.36),("过",0.46),("多",0.56),("少",0.82),
   ("海",1.30),("洋",1.62),("去",2.10),("看",2.46),("你",2.90)]),
 ("孤单的黑夜途中", 3.34, 5.42,
  [("孤",3.34),("单",3.62),("的",3.78),("黑",4.04),("夜",4.50),("途",4.66),("中",5.00)]),
 ("只要想着你", 5.42, 7.22,
  [("只",5.42),("要",5.86),("想",6.14),("着",6.48),("你",6.78)]),
 ("我就不会惶恐", 7.22, 10.32,
  [("我",7.22),("就",7.50),("不",7.78),("会",8.10),("惶",8.56),("恐",9.22)]),
 ("时光的岸上人来了又走", 10.32, 13.92,
  [("时",10.32),("光",10.66),("的",10.90),("岸",11.10),("上",11.45),
   ("人",11.86),("来",12.66),("了",13.10),("又",13.30),("走",13.60)]),
 ("离开时你不用说我都懂", 13.92, 17.15,
  [("离",13.92),("开",14.24),("时",14.40),("你",14.56),("不",15.22),
   ("用",15.41),("说",15.60),("我",16.30),("都",16.68),("懂",17.06)]),
 ("感谢你曾让我", 17.15, 19.78,
  [("感",17.25),("谢",17.55),("你",17.85),("曾",18.15),("让",18.45),("我",18.80)]),
 ("留在你眼中", 19.78, 23.30,
  [("留",19.78),("在",20.30),("你",20.72),("眼",21.48),("中",22.12)]),
 ("我曾经走过最遥远的路", 24.00, 28.02,
  [("我",24.00),("曾",24.84),("经",25.06),("走",25.18),("过",25.68),
   ("最",26.04),("遥",26.60),("远",27.02),("的",27.22),("路",27.66)]),
 ("想要去拥抱未成真的梦", 28.02, 31.60,
  [("想",28.02),("要",28.34),("去",28.56),("拥",28.76),("抱",29.22),
   ("未",29.60),("成",30.08),("真",30.36),("的",30.67),("梦",30.98)]),
 ("迷失的黑夜途中", 31.60, 33.78,
  [("迷",31.60),("失",31.92),("的",32.08),("黑",32.26),("夜",32.74),("途",32.94),("中",33.42)]),
 ("只要想起你", 33.78, 35.55,
  [("只",33.78),("要",34.16),("想",34.50),("起",34.70),("你",35.18)]),
 ("就点亮了星空", 35.55, 38.54,
  [("就",35.60),("点",35.80),("亮",36.30),("了",36.60),("星",37.06),("空",37.46)]),
 ("流浪的纸船忘不掉港口", 38.54, 42.18,
  [("流",38.54),("浪",38.96),("的",39.14),("纸",39.62),("船",39.88),
   ("忘",40.22),("不",40.68),("掉",41.22),("港",41.38),("口",41.86)]),
 ("渐灭的花火割不断彩虹", 42.18, 45.72,
  [("渐",42.18),("灭",42.50),("的",42.66),("花",42.94),("火",43.36),
   ("割",43.60),("不",44.02),("断",44.60),("彩",44.84),("虹",45.42)]),
 ("你就是我心中", 45.72, 48.44,
  [("你",45.72),("就",46.06),("是",46.24),("我",46.40),("心",46.96),("中",47.36)]),
 ("永恒的天空", 48.44, 52.20,
  [("永",48.50),("恒",48.98),("的",49.14),("天",50.10),("空",50.54)]),
]

def ts_srt(t):
    h=int(t//3600); m=int(t%3600//60); s=int(t%60); ms=int(round((t-int(t))*1000))
    if ms==1000: s+=1; ms=0
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"
def ts_lrc(t):
    m=int(t//60); return f"{m:02d}:{t-m*60:05.2f}"
def ts_ass(t):
    h=int(t//3600); m=int(t%3600//60); return f"{h}:{m:02d}:{t%60:05.2f}"

# SRT
srt=[f"{i}\n{ts_srt(a)} --> {ts_srt(b)}\n{t}\n" for i,(t,a,b,_) in enumerate(LINES,1)]
open(os.path.join(OUT,"寂寞烟火_片段.srt"),"w",encoding="utf-8").write("\n".join(srt))

# VTT
vtt=["WEBVTT",""]+sum([[f"{ts_srt(a).replace(',','.')} --> {ts_srt(b).replace(',','.')}",t,""]
                      for t,a,b,_ in LINES],[])
open(os.path.join(OUT,"寂寞烟火_片段.vtt"),"w",encoding="utf-8").write("\n".join(vtt))

# LRC
lrc=["[ti:寂寞烟火（片段）]","[ar:朱婧汐]","[al:以梦为马]","[by:WorkBuddy]",
     "[re:逐句对齐 LRC]"]
lrc+= [f"[{ts_lrc(a)}]{t}" for t,a,_,_ in LINES]
open(os.path.join(OUT,"寂寞烟火_片段.lrc"),"w",encoding="utf-8").write("\n".join(lrc))

# ASS 逐字
head = """[Script Info]
Title: 寂寞烟火（片段）逐字
ScriptType: v4.00+
PlayResX: 1920
PlayResY: 1080
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,思源黑体 CN Bold,72,&H00FFFFFF,&H00A5C6FF,&H00000000,&H80000000,-1,0,0,0,100,100,2,0,1,4,2,2,80,80,90,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
ass=[head]
for t,a,b,chars in LINES:
    parts=[]
    for k,(ch,cs) in enumerate(chars):
        ce = chars[k+1][1] if k+1<len(chars) else b
        parts.append("{\\kf%.0f}%s" % (max(0.02,ce-cs)*100, ch))
    ass.append(f"Dialogue: 0,{ts_ass(a)},{ts_ass(b)},Default,,0,0,0,,{''.join(parts)}")
open(os.path.join(OUT,"寂寞烟火_片段_逐字.ass"),"w",encoding="utf-8").write("\n".join(ass))

# 对齐表
md = ["# 《寂寞烟火》片段 · 字幕对齐表","",
 f"- 音频：`11月6日(1).MP3`（55.28 秒 / 128 kbps / 44.1 kHz 立体声）",
 f"- 演唱起始：**0 秒直接进入「跨越过多少海洋去看你」**，没有「我已经又习惯一个人生活」等主歌，也没有「我曾经走过多遥远的路」",
 f"- 制作方法：① 商用 ASR 定位乐句停顿 ② HTDemucs 分离人声 ③ faster-whisper medium 在整轨与人声轨各取一次词级时间戳 ④ Qwen3-ForcedAligner 逐句字级强制对齐 ⑤ 四组结果交叉校验",
 "","| # | 时间 | 时长 | 歌词 | 字级起点 |","|---|---|---|---|---|"]
for i,(t,a,b,chars) in enumerate(LINES,1):
    md.append(f"| {i} | {a:.2f}–{b:.2f} | {b-a:.2f}s | {t} | " + " ".join(f"{c}{s:.2f}" for c,s in chars) + " |")
md += ["","## 无人声区间","- **23.30–24.00**：间奏（下一句在 24.00 起）",
       "- **52.20–55.28**：尾奏，人声能量已降至 −73 dB，确认无唱词",
       "","## 对齐说明",
       "- 第 7 句「留在你眼中」的「中」是长拖音，一直延续到约 23.3 秒，字幕随之停留",
       "- 字级时间由两套模型融合，误差一般在 ±0.08 s；若用于卡拉OK，建议以行级为准、字级微调"]
open(os.path.join(OUT,"寂寞烟火_字幕对齐表.md"),"w",encoding="utf-8").write("\n".join(md))

# 数据
data=[{"t":t,"s":a,"e":b,"c":[[c,cs] for c,cs in chars]} for t,a,b,chars in LINES]
json.dump(data, open(os.path.join(OUT,"lyrics.json"),"w",encoding="utf-8"), ensure_ascii=False)

# HTML 注入（幂等）
html_p = os.path.join(OUT,"寂寞烟火_字幕核对.html")
if os.path.exists(html_p):
    h = open(html_p, encoding="utf-8").read()
    h = re.sub(r"const LINES = .*?;\n", "const LINES = __DATA__;\n", h, count=1, flags=re.S)
    h = h.replace("__DATA__", json.dumps(data, ensure_ascii=False))
    open(html_p,"w",encoding="utf-8").write(h)

if not os.path.exists(os.path.join(OUT,"song.mp3")):
    shutil.copy2(MP3, os.path.join(OUT,"song.mp3"))

print("done:")
for f in sorted(os.listdir(OUT)):
    print("  ", f, os.path.getsize(os.path.join(OUT,f)))

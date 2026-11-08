# -*- coding: utf-8 -*-
"""由 aligned.json 生成交付文件：lrc / srt / ass / txt / 对照表 csv+json。"""
import json, io, os, sys

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lyrics import INFO

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, "work")
BASE = "张紫豪 - 可不可以"

SEG_NAME = {"A1": "主歌一", "A2": "主歌二", "P1": "预副歌",
            "C1": "副歌", "B1": "桥段", "OUTRO": "尾声"}


def fmt_lrc(t):
    m, s = divmod(max(0.0, t), 60)
    return f"[{int(m):02d}:{s:05.2f}]"


def fmt_srt(t):
    h, rem = divmod(max(0.0, t), 3600)
    m, s = divmod(rem, 60)
    return f"{int(h):02d}:{int(m):02d}:{s:06.3f}".replace(".", ",")


def fmt_ass(t):
    h, rem = divmod(max(0.0, t), 3600)
    m, s = divmod(rem, 60)
    cs = int(round((s - int(s)) * 100))
    return f"{int(h)}:{int(m):02d}:{int(s):02d}.{cs:02d}"


def main():
    data = json.load(open(os.path.join(WORK, "aligned.json"), encoding="utf-8"))
    lines = data["lines"]
    total = data["duration"]

    # 字幕显示区间：短句承接、长间奏不硬撑
    cues = []
    for i, ln in enumerate(lines):
        s, e = ln["start"], ln["end"]
        nxt = lines[i + 1]["start"] if i + 1 < len(lines) else total
        gap = nxt - e
        if gap <= 2.5:
            disp_end = max(e + 0.25, nxt - 0.12)
        else:
            disp_end = min(s + max(1.6, e - s + 0.7), nxt - 0.35)
        cues.append({"index": i + 1, "tag": ln["tag"], "text": ln["text"],
                     "sing_start": round(s, 3), "sing_end": round(e, 3),
                     "start": round(s, 3), "end": round(disp_end, 3)})

    # ---- LRC ----
    lrc = [f"[ti:{INFO['title']}]", f"[ar:{INFO['artist']}]",
           f"[al:{INFO['album']}]", "[by:music-mv-align]", "[offset:0]", ""]
    for c in cues:
        lrc.append(f"{fmt_lrc(c['start'])}{c['text']}")
    open(os.path.join(ROOT, f"{BASE}.lrc"), "w", encoding="utf-8").write("\n".join(lrc) + "\n")

    # ---- SRT ----
    srt = []
    for k, c in enumerate(cues, 1):
        srt += [str(k), f"{fmt_srt(c['start'])} --> {fmt_srt(c['end'])}", c["text"], ""]
    open(os.path.join(ROOT, f"{BASE}.srt"), "w", encoding="utf-8").write("\n".join(srt))

    # ---- ASS（竖屏 1080x1920，华文行楷）----
    head = f"""[Script Info]
Title: {INFO['title']} · {INFO['artist']}
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Lyric,华文行楷,76,&H00FFFFFF,&H00FFFFFF,&H1A1A1A1A,&H64000000,-1,0,0,0,100,100,1,0,1,3,2,2,70,70,300,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
    ev = [f"Dialogue: 0,{fmt_ass(c['start'])},{fmt_ass(c['end'])},Lyric,,0,0,0,,"
          f"{{\\fad(140,140)}}{c['text']}" for c in cues]
    open(os.path.join(ROOT, f"{BASE}.ass"), "w", encoding="utf-8").write(head + "\n".join(ev) + "\n")

    # ---- 纯歌词 txt ----
    txt, last = [], None
    for c in cues:
        if last and c["tag"] != last:
            txt.append("")
        txt.append(c["text"])
        last = c["tag"]
    open(os.path.join(ROOT, f"{BASE}.txt"), "w", encoding="utf-8").write("\n".join(txt) + "\n")

    # ---- 对照表 CSV ----
    rows = ["序号,段落,起唱(秒),收声(秒),字幕显示区间,时长(秒),字数,字/秒,字幕文本"]
    for c in cues:
        dur = c["sing_end"] - c["sing_start"]
        chars = len(c["text"].replace(" ", ""))
        rows.append(",".join([
            str(c["index"]), SEG_NAME.get(c["tag"], c["tag"]),
            f"{c['sing_start']:.2f}", f"{c['sing_end']:.2f}",
            f"{c['start']:.2f}-{c['end']:.2f}",
            f"{dur:.2f}", str(chars),
            f"{chars/dur:.2f}" if dur > 0 else "", c["text"]]))
    open(os.path.join(ROOT, f"{BASE}-字幕音频对照.csv"), "w", encoding="utf-8-sig").write(
        "\n".join(rows) + "\n")

    # ---- 对照表 JSON ----
    meta = {
        "source": f"{BASE}.mp3",
        "song": f"{INFO['title']} · {INFO['artist']}",
        "duration": round(total, 3),
        "sample_rate": 48000,
        "channels": 2,
        "method": "htdemucs 人声分离 → faster-whisper(medium) 句级骨架 → "
                  "官方歌词三源核对（QQ音乐/百度百科/闽南网）→ Qwen3-ForcedAligner 逐字强制对齐",
        "cue_count": len(cues),
        "segments": [
            {"index": c["index"], "tag": c["tag"], "section": SEG_NAME.get(c["tag"], c["tag"]),
             "sing_start": c["sing_start"], "sing_end": c["sing_end"],
             "start": c["start"], "end": c["end"],
             "duration": round(c["sing_end"] - c["sing_start"], 3),
             "chars": len(c["text"].replace(" ", "")), "text": c["text"]}
            for c in cues],
    }
    json.dump(meta, open(os.path.join(ROOT, f"{BASE}-字幕音频对照.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print(f"共 {len(cues)} 条字幕；总时长 {total:.2f}s")
    print("lrc/srt/ass/txt/csv/json 已写入", ROOT)


if __name__ == "__main__":
    main()

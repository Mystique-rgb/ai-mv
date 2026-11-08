# -*- coding: utf-8 -*-
"""可疑行二次对齐：字速异常（过快/过慢/过短）的行单独切窗重对，取更合理者。"""
import json, io, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from align import (MODEL_DIR, HOP, norm, read_wav, frame_db)

# align.py 在导入时会替换 stdout，这里重新包一层，避免 I/O on closed file
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, "work")

RATE_MAX = 5.0     # 字/秒，超过视为被压扁
RATE_MIN = 0.90    # 低于视为被拉长（末行除外）


def rate_of(ln):
    d = ln["end"] - ln["start"]
    return len(norm(ln["text"])) / d if d > 0.01 else 99.0


def main():
    import torch
    from transformers import AutoProcessor, Qwen3ASRForTokenClassification

    audio, sr = read_wav(os.path.join(WORK, "vocals16k.wav"))
    duration = len(audio) / sr
    db = frame_db(audio, sr)
    data = json.load(open(os.path.join(WORK, "aligned.json"), encoding="utf-8"))
    lines = data["lines"]
    n = len(lines)

    suspect = []
    for i, ln in enumerate(lines):
        r = rate_of(ln)
        too_slow = r < RATE_MIN and i < n - 2
        if r > RATE_MAX or too_slow or (ln["end"] - ln["start"]) < 0.55:
            suspect.append(i)
    print("可疑行：", ", ".join(f"L{i+1}({rate_of(lines[i]):.1f}字/s)" for i in suspect) or "无")
    if not suspect:
        return

    proc = AutoProcessor.from_pretrained(MODEL_DIR)
    model = Qwen3ASRForTokenClassification.from_pretrained(MODEL_DIR, dtype=torch.float32)
    model.eval()

    for i in suspect:
        ln = lines[i]
        prev_end = lines[i - 1]["end"] if i > 0 else 0.0
        next_start = lines[i + 1]["start"] if i + 1 < n else duration
        next_end = lines[i + 1]["end"] if i + 1 < n else duration
        chars = len(norm(ln["text"]))
        lo = max(0.0, min(prev_end, ln["start"]) - 0.45)
        hi = min(duration, max(next_start, ln["end"]) + 0.55)
        need = chars * 0.26 + 0.7
        if hi - lo < need:                     # 窗口太窄，往两边借
            lo = max(0.0, lo - (need - (hi - lo)) / 2)
            hi = min(duration, hi + (need - (hi - lo)) / 2)
        if hi - lo < need:
            hi = min(duration, next_end + 0.6)

        text = norm(ln["text"])
        clip = audio[int(lo * sr):int(hi * sr)]
        try:
            inputs, word_lists = proc.prepare_forced_aligner_inputs(
                clip, [text], language="Chinese")
            with torch.no_grad():
                logits = model(**inputs).logits
            res = proc.decode_forced_alignment(
                logits, inputs["input_ids"], word_lists,
                model.config.timestamp_token_id)[0]
            words = [{"w": r["text"], "s": round(lo + r["start_time"], 3),
                      "e": round(lo + r["end_time"], 3)} for r in res]
        except Exception as ex:
            print(f"L{i+1} 重对齐失败 {ex!r}"[:120])
            continue
        if not words:
            continue
        s0, e0 = words[0]["s"], words[-1]["e"]
        new_rate = chars / max(0.05, e0 - s0)
        old_rate = rate_of(ln)
        ok = 1.0 <= new_rate <= 5.6 and abs(s0 - ln["start"]) < 3.0
        if ok:
            print(f"L{i+1:2d} {ln['start']:7.2f}-{ln['end']:7.2f} ({old_rate:4.1f}字/s)"
                  f" → {s0:7.2f}-{e0:7.2f} ({new_rate:4.1f}字/s)  {ln['text']}")
            ln["start"], ln["end"] = s0, e0
            ln["words"] = words
        else:
            print(f"L{i+1:2d} 保留原值（新解 {s0:.2f}-{e0:.2f} {new_rate:.1f}字/s 不合理）")

    # 单调修正
    for a, b in zip(lines, lines[1:]):
        if a["end"] > b["start"] - 0.05:
            mid = (a["end"] + b["start"]) / 2
            a["end"] = round(max(a["start"] + 0.25, mid), 3)
            b["start"] = round(min(b["end"] - 0.25, mid), 3)
    for ln in lines:
        if ln["end"] - ln["start"] < 0.25:
            ln["end"] = round(ln["start"] + 0.25, 3)

    words_all = [w for ln in lines for w in ln.get("words", [])]
    json.dump({"duration": duration, "lines": lines, "words": words_all},
              open(os.path.join(WORK, "aligned.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print("\n=== 修正后字速体检 ===")
    bad = 0
    for ln in lines:
        r = rate_of(ln)
        flag = "  <<<" if (r > RATE_MAX or (r < 0.75 and ln["index"] < n - 1)) else ""
        bad += bool(flag)
        print(f"{ln['index']:3d} {ln['tag']:5s} {ln['start']:7.2f}-{ln['end']:7.2f} "
              f"{r:4.1f}字/s {ln['text']}{flag}")
    print(f"\n仍有异常 {bad} 行 → work/aligned.json")


if __name__ == "__main__":
    main()

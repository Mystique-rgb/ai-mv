# -*- coding: utf-8 -*-
"""把字速仍偏快的相邻两行合并成一组重新对齐，再按字数回填。"""
import json, io, os, sys
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from align import MODEL_DIR, norm, read_wav

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, "work")


def rate(ln):
    d = ln["end"] - ln["start"]
    return len(norm(ln["text"])) / d if d > 0.01 else 99.0


def main():
    import torch
    from transformers import AutoProcessor, Qwen3ASRForTokenClassification

    audio, sr = read_wav(os.path.join(WORK, "vocals16k.wav"))
    duration = len(audio) / sr
    data = json.load(open(os.path.join(WORK, "aligned.json"), encoding="utf-8"))
    lines = data["lines"]

    targets = [i for i, ln in enumerate(lines) if rate(ln) > 4.9 and i + 1 < len(lines)]
    print("待合并重对：", ", ".join(f"L{i+1}+L{i+2}" for i in targets) or "无")
    if not targets:
        return

    proc = AutoProcessor.from_pretrained(MODEL_DIR)
    model = Qwen3ASRForTokenClassification.from_pretrained(MODEL_DIR, dtype=torch.float32)
    model.eval()

    for i in targets:
        a, b = lines[i], lines[i + 1]
        lo = max(0.0, (lines[i - 1]["end"] if i > 0 else 0.0) - 0.3)
        hi = min(duration, (lines[i + 2]["start"] if i + 2 < len(lines) else duration) + 0.4)
        ta, tb = norm(a["text"]), norm(b["text"])
        text = ta + tb
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
            print(f"L{i+1} 合并对齐失败 {ex!r}"[:120])
            continue

        # 按字符数把 words 分给两行
        acc, first = 0, []
        for w in words:
            take = min(len(w["w"]), len(ta) - acc)
            first.append({"w": w["w"][:take], "s": w["s"], "e": w["e"]})
            acc += take
            if acc >= len(ta):
                break
        rest = words[len(first):]
        if not first or not rest:
            print(f"L{i+1} 合并结果不足，跳过")
            continue
        # 句中切点 = 两行接缝处
        seam = first[-1]["e"]
        ra = len(ta) / max(0.05, seam - first[0]["s"])
        rb = len(tb) / max(0.05, rest[-1]["e"] - rest[0]["s"])
        if 1.0 <= ra <= 5.2 and 1.0 <= rb <= 5.2:
            print(f"L{i+1} {a['start']:.2f}-{a['end']:.2f}({rate(a):.1f}) → "
                  f"{first[0]['s']:.2f}-{seam:.2f}({ra:.1f}) | "
                  f"L{i+2} → {rest[0]['s']:.2f}-{rest[-1]['e']:.2f}({rb:.1f})")
            a.update(start=first[0]["s"], end=seam, words=first)
            b.update(start=rest[0]["s"], end=rest[-1]["e"], words=rest)
        else:
            print(f"L{i+1} 合并解仍不合理（{ra:.1f}/{rb:.1f} 字每秒），保留原值")

    json.dump({"duration": duration, "lines": lines,
               "words": [w for ln in lines for w in ln.get("words", [])]},
              open(os.path.join(WORK, "aligned.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)

    print("\n=== 最终字速 ===")
    for ln in lines:
        print(f"{ln['index']:3d} {ln['tag']:5s} {ln['start']:7.2f}-{ln['end']:7.2f} "
              f"{rate(ln):4.1f}字/s {ln['text']}")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""歌词强制对齐 v2：能量定界 + 整块一次对齐 + 按字数回填。

关键点（v1 的坑）：
- whisper 的时间在长静音后会发生漂移（把 130s 的段落报到 115s），
  所以段落边界一律吸附到人声轨的能量谷 / 发声起点，不信 ASR 的绝对时间。
- 逐行切窗口再对齐，会让"一行塞进半句"的窗口把字压扁（2s 唱 10 字）。
  改成一个演唱块内的若干行拼成一串文字，一次对齐，再按字数回填。
"""
import json, io, os, re, sys, wave, difflib
import numpy as np

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from lyrics import build_sequence

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORK = os.path.join(ROOT, "work")
_mdir = r"C:/Users/79420/.cache/huggingface/hub/models--Qwen--Qwen3-ForcedAligner-0.6B-hf/snapshots"
MODEL_DIR = os.path.join(_mdir, os.listdir(_mdir)[0])

PUNCT = "，。！？、,.!?…～~“”\"'‘’()（）：:；;—-"
HOP = 0.02


def norm(s):
    s = re.sub(r"\s+", "", s)
    return "".join(ch for ch in s if ch not in PUNCT)


def read_wav(path):
    w = wave.open(path, "rb")
    n, sr = w.getnframes(), w.getframerate()
    data = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768.0
    w.close()
    return data, sr


def frame_db(audio, sr):
    hop_n, win_n = int(HOP * sr), int(0.04 * sr)
    n = max(1, (len(audio) - win_n) // hop_n + 1)
    idx = np.arange(win_n)[None, :] + hop_n * np.arange(n)[:, None]
    rms = np.sqrt((audio[idx] ** 2).mean(axis=1) + 1e-12)
    return 20 * np.log10(rms)


def voiced_blocks(db, thr=-45.0, merge_gap=0.45):
    v = db > thr
    runs, t = [], 0
    while t < len(v):
        if v[t]:
            u = t
            while u < len(v) and v[u]:
                u += 1
            runs.append([t * HOP, u * HOP])
            t = u
        else:
            t += 1
    blocks = []
    for s, e in runs:
        if blocks and s - blocks[-1][1] < merge_gap:
            blocks[-1][1] = e
        else:
            blocks.append([s, e])
    return [(s, e) for s, e in blocks if e - s > 0.15]


def snap_to_gap(db, t, lo, hi, radius=2.0):
    """把候选切点吸附到最近的能量谷（必须落在静音里，否则视为句中切点，丢弃）。"""
    a = max(0, int((t - radius) / HOP))
    b = min(len(db), int((t + radius) / HOP))
    if b - a < 3:
        return None
    seg = db[a:b]
    k = int(np.argmin(seg))
    if seg[k] > -38:            # 附近没有真正的静音 → 不是句界
        return None
    return (a + k) * HOP


def dp_align(lines, segs):
    n, m = len(lines), len(segs)
    sim = np.zeros((n, m), dtype=np.float32)
    for i in range(n):
        a = norm(lines[i])
        for j in range(m):
            b = norm(segs[j]["text"])
            if not a or not b:
                continue
            r = difflib.SequenceMatcher(None, a, b).ratio()
            ratio = min(len(a), len(b)) / max(len(a), len(b))
            sim[i, j] = r * (0.5 + 0.5 * ratio)
    NEG = -1e9
    dp = np.full((n + 1, m + 1), NEG, dtype=np.float32)
    back = np.zeros((n + 1, m + 1), dtype=np.int8)
    dp[0, 0] = 0
    for i in range(n + 1):
        for j in range(m + 1):
            if i == 0 and j == 0:
                continue
            best, arg = NEG, -1
            if i > 0 and j > 0:
                v = dp[i - 1, j - 1] + sim[i - 1, j - 1]
                if v > best:
                    best, arg = v, 0
            if i > 0:
                v = dp[i - 1, j] - 0.30
                if v > best:
                    best, arg = v, 1
            if j > 0:
                v = dp[i, j - 1] - 0.30
                if v > best:
                    best, arg = v, 2
            dp[i, j], back[i, j] = best, arg
    pairs, i, j = [], n, m
    while i > 0 or j > 0:
        b = back[i, j]
        if i > 0 and j > 0 and b == 0:
            pairs.append((i - 1, j - 1)); i, j = i - 1, j - 1
        elif i > 0 and (j == 0 or b == 1):
            pairs.append((i - 1, None)); i -= 1
        else:
            j -= 1
    pairs.reverse()
    return pairs


def group_lines(pairs):
    groups, pending, cur = [], [], None
    for i, j in pairs:
        if j is not None:
            cur = [j, [i]]
            if pending:
                cur[1] = pending + cur[1]
                pending = []
            groups.append(cur)
        else:
            if cur is None:
                pending.append(i)
            else:
                cur[1].append(i)
    if pending:
        if groups:
            groups[0][1] = pending + groups[0][1]
        else:
            groups.append([0, pending])
    return groups


def map_words(words, lengths):
    """把逐字时间按字数回填到每行，返回 [(start, end, text_words), ...]。"""
    pos, out = 0, []
    for L in lengths:
        seg = []
        acc = 0
        while pos < len(words) and acc < L:
            w = words[pos]
            take = min(len(w["w"]), L - acc)
            seg.append({"w": w["w"][:take], "s": w["s"], "e": w["e"]})
            acc += take
            pos += 1
        out.append(seg)
    # 若模型少给了字，把最后一行延长到最后
    if pos < len(words) and out:
        out[-1].append(words[pos])
    return out


def main():
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")
    import torch
    from transformers import AutoProcessor, Qwen3ASRForTokenClassification

    audio, sr = read_wav(os.path.join(WORK, "vocals16k.wav"))
    duration = len(audio) / sr
    db = frame_db(audio, sr)
    blocks = voiced_blocks(db)
    print("人声发声块：", ", ".join(f"{s:.1f}-{e:.1f}" for s, e in blocks))

    seq = build_sequence()
    lines = [t for _, t in seq]
    tags = [g for g, _ in seq]
    segs = json.load(open(os.path.join(WORK, "asr.json"), encoding="utf-8"))
    pairs = dp_align(lines, segs)
    groups = group_lines(pairs)
    print(f"歌词 {len(lines)} 行 → {len(groups)} 个演唱组")

    # ---- 边界：ASR 段起点 → 落在静音里就吸附到下一个发声起点，否则吸附能量谷 ----
    def boundary(t):
        i = int(t / HOP)
        a, b = max(0, i - 25), min(len(db), i + 25)      # ±0.5s
        if len(db[a:b]) and db[a:b].max() < -45:          # 整个 ±0.5s 都是静音 → ASR 漂了
            for bs, be in blocks:
                if be > t - 0.2:
                    return bs
            return t
        g = snap_to_gap(db, t, 0, duration, radius=1.5)
        return g if g is not None else t

    starts = [0.0] * (len(groups) + 1)
    for k, g in enumerate(groups):
        starts[k] = boundary(segs[g[0]]["start"])
    starts[len(groups)] = duration
    for k in range(1, len(starts)):                        # 强制单调
        starts[k] = max(starts[k], starts[k - 1] + 0.4)

    proc = AutoProcessor.from_pretrained(MODEL_DIR)
    model = Qwen3ASRForTokenClassification.from_pretrained(MODEL_DIR, dtype=torch.float32)
    model.eval()

    results = []
    for k, (j, idxs) in enumerate(groups):
        lo = starts[k]
        hi = starts[k + 1]
        # 收紧到真实发声范围
        seg_db = db[int(lo / HOP):int(hi / HOP)]
        if len(seg_db) > 3:
            v = np.where(seg_db > -45)[0]
            if len(v):
                lo = lo + v[0] * HOP - 0.15
                hi = lo + (v[-1] - v[0]) * HOP + 0.30
        text = "".join(norm(lines[i]) for i in idxs)
        lengths = [len(norm(lines[i])) for i in idxs]
        clip = audio[int(max(0, lo) * sr):int(min(duration, hi) * sr)]
        entry = {"group": k, "lines": idxs, "window": [round(lo, 2), round(hi, 2)],
                 "target": text}
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
            entry["got"] = "".join(w["w"] for w in words)
            entry["words"] = words
        except Exception as ex:
            entry["words"] = []
            entry["error"] = repr(ex)[:160]
        results.append(entry)
        flag = "" if entry.get("got") == text else f"  ≠[{entry.get('got','FAIL')}]"
        print(f"组{k:2d} {lo:7.2f}-{hi:7.2f} {text}{flag}")

    # ---- 回填到行 ----
    out_lines, out_words = [], []
    for entry in results:
        idxs = entry["lines"]
        lengths = [len(norm(lines[i])) for i in idxs]
        lo, hi = entry["window"]
        if not entry["words"]:   # 回退：按字数比例铺满
            tot = sum(lengths) or 1
            acc = 0
            for i, L in zip(idxs, lengths):
                s = lo + (hi - lo) * acc / tot
                acc += L
                e = lo + (hi - lo) * acc / tot
                out_lines.append({"index": i + 1, "tag": tags[i], "text": lines[i],
                                  "start": round(s, 3), "end": round(e, 3),
                                  "words": [], "fallback": True})
            continue
        per_line = map_words(entry["words"], lengths)
        for i, ws in zip(idxs, per_line):
            if not ws:
                continue
            out_lines.append({"index": i + 1, "tag": tags[i], "text": lines[i],
                              "start": ws[0]["s"], "end": ws[-1]["e"], "words": ws})
            out_words.extend(ws)

    out_lines.sort(key=lambda d: d["index"])

    # ---- 单调修正：不许重叠 ----
    for a, b in zip(out_lines, out_lines[1:]):
        if a["end"] > b["start"]:
            mid = (a["end"] + b["start"]) / 2
            a["end"] = round(mid, 3) if mid > a["start"] + 0.2 else a["start"] + 0.2
            b["start"] = round(mid, 3)
    for ln in out_lines:
        if ln["end"] - ln["start"] < 0.2:
            ln["end"] = round(ln["start"] + 0.2, 3)

    print("\n=== 每行结果 ===")
    for ln in out_lines:
        d = ln["end"] - ln["start"]
        sp = ln["chars"] if "chars" in ln else len(norm(ln["text"]))
        print(f"{ln['index']:3d} {ln['tag']:5s} {ln['start']:7.2f}-{ln['end']:7.2f} "
              f"{d:5.2f}s {len(norm(ln['text']))/d if d else 0:4.1f}字/s {ln['text']}")

    json.dump({"duration": duration, "lines": out_lines, "words": out_words},
              open(os.path.join(WORK, "aligned.json"), "w", encoding="utf-8"),
              ensure_ascii=False, indent=1)
    print(f"\n→ work/aligned.json（{len(out_lines)} 行）")


if __name__ == "__main__":
    main()

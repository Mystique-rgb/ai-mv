import json, sys, os

SRC = r"D:\ai音乐mv\可不可以\mv2-listen\song.json"
OUT = r"D:\ai音乐mv\可不可以\riso\src\data.js"

d = json.load(open(SRC, encoding="utf-8"))
r3 = lambda x: round(float(x), 3)

lines = []
for L in d["lines"]:
    lines.append({
        "n": L["n"], "t0": r3(L["t0"]), "t1": r3(L["t1"]),
        "sung": r3(L.get("sung_end", L["t1"])),
        "text": L["text"], "hook": bool(L.get("hook")), "at": L.get("at", ""),
        "chars": [[c["c"], r3(c["t"])] for c in L.get("chars", [])],
    })

secs = [{"t0": r3(s["t0"]), "t1": r3(s["t1"]), "letter": s["letter"],
         "energy": round(s["energy"], 3), "kind": s["kind"]} for s in d["sections"]]

js = {
    "bpm": d["bpm"], "beat": d["beat"], "bar": d["bar"], "dur": r3(d["dur"]),
    "firstDownbeat": r3(d["first_downbeat"]),
    "beats": [r3(b) for b in d["beats"]],
    "downbeats": [r3(b) for b in d["downbeats"]],
    "kicks": [[r3(k["t"]), round(k["s"], 2)] for k in d["kicks"]],
    "snares": [[r3(k["t"]), round(k["s"], 2)] for k in d["snares"]],
    "lines": lines, "sections": secs,
    "big": [{"t": r3(b["t"]), "score": round(b["score"], 2), "why": b["why"], "at": b["at"]} for b in d["big"]],
    "drops": [{"t": r3(x["t"]), "db": x["db"]} for x in d["drops"]],
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    f.write("// data.js — 自动生成，源 mv2-listen/song.json\nwindow.SONG = ")
    json.dump(js, f, ensure_ascii=False, separators=(",", ":"))
    f.write(";\n")

print("wrote", OUT, os.path.getsize(OUT), "bytes")
print("beats", len(js["beats"]), "kicks", len(js["kicks"]), "lines", len(js["lines"]),
      "sections", len(js["sections"]), "big", len(js["big"]))

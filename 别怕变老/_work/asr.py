import json, subprocess, numpy as np
from faster_whisper import WhisperModel
p = r"D:/ai音乐mv/别怕变老/_work/stems/htdemucs/11月7日/vocals.wav"
raw = subprocess.run(["ffmpeg","-v","error","-i",p,"-ac","1","-ar","16000","-f","f32le","-"],capture_output=True,check=True).stdout
audio = np.frombuffer(raw, np.float32).copy()
m = WhisperModel("medium", device="cpu", compute_type="int8", local_files_only=True)
prompt = ("让我的爱人勇敢别怕变老 对面的女孩看过来 看着我 别再盯着镜子盯着自己手机摄像头 "
          "我总说 可能问题源于你的视力太好 总说你正在衰老 害怕我会被拐跑 baby "
          "我从没忘记爱慕你的初衷 迷恋你的特别 尽管我们都很普通 光阴的故事 说实话没经历也不懂 "
          "也只能珍惜眼前 为了不成为它的附庸 babe 岁月划过指尖 一切像梦境实现 就算被苦痛肆虐 那也是很久之前 "
          "我们现在拥有所有 就像埋下了火种 现在我为你歌颂 就只管牵着我走 "
          "Baby 我仰慕你的自然你的优雅 Baby 我会大声向你表白 虽然肉麻")
segs, info = m.transcribe(audio, language="zh", beam_size=5, vad_filter=False,
                          word_timestamps=True, initial_prompt=prompt,
                          condition_on_previous_text=False)
out=[]
for s in segs:
    words=[(w.word, round(w.start,2), round(w.end,2)) for w in (s.words or [])]
    out.append({"start":round(s.start,2),"end":round(s.end,2),"text":s.text,"words":words})
open("asr_raw.json","w",encoding="utf-8").write(json.dumps(out,ensure_ascii=False,indent=1))
for s in out:
    print(f"[{s['start']:6.2f}-{s['end']:6.2f}] {s['text']}")

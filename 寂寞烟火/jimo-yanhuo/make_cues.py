import json, sys
here = sys.argv[1]
TL = json.load(open(here + '/out/timeline.json', encoding='utf-8'))
cues = [{'t0': l['t0'], 't1': l['t1'], 'text': l['text']} for l in TL['LYRICS']]
json.dump(cues, open(here + '/out/cues.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('cues', len(cues))

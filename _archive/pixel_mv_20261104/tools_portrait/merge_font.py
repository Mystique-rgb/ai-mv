# merge_font.py — 合并式点阵字库扩充（不丢原有字）
#   现有 px16.js 的键 + 指定 spec 里出现的所有中文，一起重新生成 16x16 字模
#   用法: python tools_portrait/merge_font.py specs/pv_street.js specs/pv_bed.js
import re, io, sys
from PIL import Image, ImageDraw, ImageFont

FONT = 'C:/Windows/Fonts/simhei.ttf'
THRESH_CN = 110
THRESH_AS = 128
TARGET = 'assets/fonts/px16.js'

def glyph(ch, w, h, thresh):
    f = ImageFont.truetype(FONT, h)
    pad = h
    im = Image.new('L', (w + pad * 2, h + pad * 2), 0)
    ImageDraw.Draw(im).text((pad, pad), ch, font=f, fill=255)
    bb = im.getbbox()
    if not bb:
        return ['%0*X' % (h // 4, 0)] * h
    ink = im.crop(bb)
    if ink.width > w or ink.height > h:
        k = min(w / ink.width, h / ink.height)
        ink = ink.resize((max(1, int(ink.width * k)), max(1, int(ink.height * k))), Image.LANCZOS)
    canvas = Image.new('L', (w, h), 0)
    canvas.paste(ink, ((w - ink.width) // 2, (h - ink.height) // 2))
    px = canvas.convert('L').load()
    hexw = (w + 3) // 4
    rows = []
    for y in range(h):
        v = 0
        for x in range(w):
            if px[x, y] >= thresh:
                v |= (1 << (w - 1 - x))
        rows.append('%0*X' % (hexw, v))
    return rows

# ① 现有字库的键
old = io.open(TARGET, encoding='utf-8').read()
cn = set(re.findall(r"^  '(.)': \[", old, re.M))
asc = set(re.findall(r"^  '([^']+)': \[", old, re.M))
asc = {a for a in asc if len(a) == 1 and ord(a) < 0x7f}

# ② 追加 spec 里的所有字面量字符
for p in sys.argv[1:]:
    src = io.open(p, encoding='utf-8').read()
    for s in re.findall(r"'([^'\\]*)'", src) + re.findall(r'"([^"\\]*)"', src):
        for ch in s:
            if '\u4e00' <= ch <= '\u9fff' or ch in '，。！？：；、（）《》“”‘’—‰·…×〇':
                cn.add(ch)
            elif 0x20 < ord(ch) < 0x7f:
                asc.add(ch)

cn = sorted(cn); asc = sorted(asc)
buf = ['// px16.js — 点阵字模，由 tools/gen_pxfont.py / tools_portrait/merge_font.py 生成，勿手改',
       '// 中文 16x16（每行 4 位十六进制），ASCII 8x16（每行 2 位）',
       'window.PXF = window.PXF || {};',
       'window.PXF.cn = {']
buf.append(',\n'.join("  '%s': [%s]" % (c, ','.join("'%s'" % r for r in glyph(c, 16, 16, THRESH_CN))) for c in cn))
buf.append('};')
buf.append('window.PXF.as = {')
buf.append(',\n'.join("  '%s': [%s]" % (c.replace('\\', '\\\\').replace("'", "\\'"),
                                     ','.join("'%s'" % r for r in glyph(c, 8, 16, THRESH_AS))) for c in asc))
buf.append('};')
io.open(TARGET, 'w', encoding='utf-8').write('\n'.join(buf))
print('cn=%d as=%d -> %s' % (len(cn), len(asc), TARGET))

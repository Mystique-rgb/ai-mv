# 竖版封面合成 · 1080×1440（3:4）
# 用法: python make_cover.py
import os, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H = 1080, 1440
ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT)

F_XK = 'C:/Windows/Fonts/STXINGKA.TTF'      # 华文行楷（主标题）
F_KT = 'C:/Windows/Fonts/STZHONGS.TTF'      # 华文中宋（副标）
F_KAI = 'D:/ai音乐mv/幻听/mv-幻听-v5/fonts/STKaiti.ttf'   # 华文楷体（跟片内字幕同族）
F_MONO = 'C:/Windows/Fonts/consola.ttf'

CREAM = (255, 243, 214)
CREAM_D = (240, 217, 176)
INK = (42, 28, 24)
PINK = (255, 156, 176)


def cover_crop(img, tw, th, ox=.5):
    """等比放大到刚好盖住 tw×th，再按 ox（0=左 1=右）横向裁"""
    s = max(tw / img.width, th / img.height)
    im = img.resize((max(tw, round(img.width * s)), max(th, round(img.height * s))), Image.LANCZOS)
    x = round((im.width - tw) * ox)
    return im.crop((x, 0, x + tw, th))


def bg_from(img, blur=46, dark=.40, sat=1.0):
    b = cover_crop(img, W, H).filter(ImageFilter.GaussianBlur(blur))
    a = np.asarray(b).astype(np.float32) / 255.0
    g = a.mean(axis=2, keepdims=True)
    a = np.clip(g + (a - g) * sat, 0, 1)
    a *= dark
    return Image.fromarray(np.clip(a * 255, 0, 255).astype(np.uint8))


def vignette(im, strength=.55, power=2.1):
    a = np.asarray(im).astype(np.float32)
    yy, xx = np.mgrid[0:H, 0:W]
    dx = (xx - W / 2) / (W / 2)
    dy = (yy - H / 2) / (H / 2)
    r = np.sqrt(dx * dx * .82 + dy * dy) / 1.28
    v = 1.0 - strength * np.clip(r, 0, 1) ** power
    a *= v[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def grain(im, amt=9.0, seed=7):
    rng = np.random.default_rng(seed)
    a = np.asarray(im).astype(np.float32)
    n = rng.normal(0, amt, (H, W, 1))
    lum = a.mean(axis=2, keepdims=True) / 255.0
    a = a + n * (1.0 - lum * .55)
    a[..., 0] += rng.normal(0, amt * .3, (H, W))
    a[..., 2] += rng.normal(0, amt * .3, (H, W))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def scanlines(im, alpha=.055, step=4):
    a = np.asarray(im).astype(np.float32)
    a[::step] *= (1 - alpha)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def text_layer(size, draw_fn):
    lay = Image.new('L', size, 0)
    d = ImageDraw.Draw(lay)
    draw_fn(d)
    return lay


def draw_text(base, xy, s, font, fill, anchor='lt', stroke=0, stroke_fill=INK,
              glow=None, glow_r=22, glow_a=.55, spacing=0):
    """带描边 + 可选外发光的文字。glow=(r,g,b)"""
    lay = Image.new('RGBA', base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(lay)
    if spacing:
        # 手动字距
        total = sum(d.textlength(ch, font=font) for ch in s) + spacing * (len(s) - 1)
        x = xy[0] - (total / 2 if anchor[0] == 'm' else (total if anchor[0] == 'r' else 0))
        bb = font.getbbox(s)
        for ch in s:
            d.text((x, xy[1]), ch, font=font, fill=fill + (255,),
                   anchor='l' + anchor[1], stroke_width=stroke, stroke_fill=stroke_fill + (255,))
            x += d.textlength(ch, font=font) + spacing
    else:
        d.text(xy, s, font=font, fill=fill + (255,), anchor=anchor,
               stroke_width=stroke, stroke_fill=stroke_fill + (255,))
    if glow:
        g = lay.split()[3].filter(ImageFilter.GaussianBlur(glow_r))
        gl = Image.new('RGBA', base.size, glow + (0,))
        gl.putalpha(g.point(lambda v: int(v * glow_a)))
        base = Image.alpha_composite(base.convert('RGBA'), gl)
    return Image.alpha_composite(base.convert('RGBA'), lay)


def strip(base, img, y, h=None, w=W, border=True, zoom=1.0, fx=.5, fy=.5):
    """把 16:9 帧按比例贴成一条满宽的画面；zoom>1 时先按焦点裁一块再贴"""
    h = h or round(w * img.height / img.width)
    if zoom > 1.001:
        cw, chh = round(img.width / zoom), round(img.height / zoom)
        cx, cy = round((img.width - cw) * fx), round((img.height - chh) * fy)
        img = img.crop((cx, cy, cx + cw, cy + chh))
    im = img.resize((w, h), Image.LANCZOS)
    x = (W - w) // 2
    # 投影
    sh = Image.new('L', (W, H), 0)
    ImageDraw.Draw(sh).rectangle([x - 6, y - 6, x + w + 6, y + h + 6], fill=150)
    sh = sh.filter(ImageFilter.GaussianBlur(26))
    dark = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    dark.putalpha(sh.point(lambda v: int(v * .8)))
    base = Image.alpha_composite(base.convert('RGBA'), dark)
    base.paste(im, (x, y))
    if border:
        d = ImageDraw.Draw(base)
        d.line([x, y, x + w, y], fill=CREAM + (70,), width=2)
        d.line([x, y + h - 1, x + w, y + h - 1], fill=CREAM + (46,), width=2)
    return base


def hairline(base, y, w=150, a=110):
    d = ImageDraw.Draw(base)
    d.rectangle([(W - w) // 2, y, (W + w) // 2, y + 2], fill=CREAM + (a,))
    return base


def framesafe(base):
    d = ImageDraw.Draw(base)
    m = 26
    d.rectangle([m, m, W - m, H - m], outline=CREAM + (26,), width=1)
    return base


def finish(im, g=9.0):
    im = vignette(im, .6, 2.0)
    im = scanlines(im, .05, 4)
    im = grain(im, g)
    return im.convert('RGB')


# ———————————————————————— A · 画面主导 ————————————————————————
def make_A():
    src = Image.open(os.path.join(SRC, 'k_18.15.jpg')).convert('RGB')
    im = bg_from(src, blur=50, dark=.36, sat=.82)
    im = Image.alpha_composite(im.convert('RGBA'), Image.new('RGBA', (W, H), (6, 8, 18, 52)))

    # 顶部小字
    f_m = ImageFont.truetype(F_MONO, 34)
    d = ImageDraw.Draw(im)
    im = draw_text(im, (74, 92), '11.07', f_m, CREAM_D, anchor='lt', glow=None)
    im = draw_text(im, (W - 74, 92), '1987 / 30"', f_m, CREAM_D, anchor='rt', glow=None)

    # 主标题
    f_t = ImageFont.truetype(F_XK, 300)
    im = draw_text(im, (W // 2, 132), '幻听', f_t, CREAM, anchor='mt',
                   stroke=11, stroke_fill=INK, glow=(255, 206, 158), glow_r=26, glow_a=.34, spacing=18)
    # 副标
    f_s = ImageFont.truetype(F_KAI, 56)
    im = draw_text(im, (W // 2, 452), '一个人的对唱', f_s, (246, 214, 176), anchor='mt',
                   stroke=4, stroke_fill=(30, 20, 18), glow=None, spacing=10)

    # 画面
    im = strip(im, src, 566, zoom=1.28, fx=.54, fy=.52)

    # 一句歌词
    im = hairline(im, 1232, 170, 120)
    f_l = ImageFont.truetype(F_KAI, 50)
    im = draw_text(im, (W // 2, 1268), '我却还没走脱', f_l, CREAM, anchor='mt',
                   stroke=4, stroke_fill=(28, 18, 16))
    f_f = ImageFont.truetype(F_KAI, 30)
    im = draw_text(im, (W // 2, 1362), '全片 735 帧 · 逐帧代码绘制', f_f, (214, 190, 158), anchor='mt')
    return finish(framesafe(im))


# ———————————————————————— B · 文字主导 ————————————————————————
def make_B():
    src = Image.open(os.path.join(SRC, 'k_18.15.jpg')).convert('RGB')
    im = bg_from(src, blur=64, dark=.26, sat=.5)
    # 中央压暗，给竖排字让位
    grad = Image.new('L', (1, H))
    for y in range(H):
        grad.putpixel((0, y), int(150 * math.exp(-((y - 620) / 620) ** 2)))
    m = grad.resize((W, H))
    dark = Image.new('RGBA', (W, H), (4, 6, 14, 255))
    dark.putalpha(m)
    im = Image.alpha_composite(im.convert('RGBA'), dark)

    # 竖排主标题（右侧，传统竖排从右往左）
    f_t = ImageFont.truetype(F_XK, 262)
    x = W - 250
    for i, ch in enumerate('幻听'):
        im = draw_text(im, (x, 176 + i * 300), ch, f_t, CREAM, anchor='mt',
                       stroke=10, stroke_fill=INK, glow=(255, 130, 88), glow_r=26, glow_a=.45)
    # 左侧竖排副标
    f_s = ImageFont.truetype(F_KAI, 46)
    for i, ch in enumerate('一个人的对唱'):
        im = draw_text(im, (196, 210 + i * 74), ch, f_s, (240, 210, 172), anchor='mt', stroke=3,
                       stroke_fill=(30, 20, 18))
    # 一条竖线
    d = ImageDraw.Draw(im)
    d.rectangle([150, 198, 152, 642], fill=CREAM + (64,))

    # 下方小画面
    im = strip(im, src, 668, w=W, zoom=1.26, fx=.54, fy=.52)
    f_m = ImageFont.truetype(F_MONO, 30)
    im = draw_text(im, (74, 92), '11.07', f_m, CREAM_D, anchor='lt')
    im = draw_text(im, (W - 74, 92), 'PHANTOM  HEARING', f_m, CREAM_D, anchor='rt')
    f_f = ImageFont.truetype(F_KAI, 44)
    im = draw_text(im, (W // 2, 1322), '我却还没走脱', f_f, (206, 184, 154), anchor='mt',
                   stroke=3, stroke_fill=(24, 16, 14))
    return finish(framesafe(im))


# ———————————————————————— C · 特写拼版（上图 + 下黑条） ————————————————————————
def make_C():
    src = Image.open(os.path.join(SRC, 'k_23.00.jpg')).convert('RGB')
    # 取脸，1.08 倍推近：眼睛与嘴在正中
    cw = 1000
    cx, cy = 1032 - cw // 2, 40
    face = src.crop((cx, cy, cx + cw, cy + cw)).resize((W, W), Image.LANCZOS)
    im = Image.new('RGBA', (W, H), (7, 9, 15, 255))
    im.paste(face, (0, 0))
    # 图与黑条之间一道奶黄细线
    d = ImageDraw.Draw(im)
    d.rectangle([0, W - 2, W, W], fill=CREAM + (95,))
    # 画面最上沿压一条暗，防止脸顶到边缘
    gh = 150
    g = Image.new('L', (1, gh))
    for y in range(gh):
        g.putpixel((0, y), int(200 * (1 - y / gh) ** 1.6))
    im.alpha_composite(Image.composite(Image.new('RGBA', (W, gh), (4, 6, 12, 255)),
                                       Image.new('RGBA', (W, gh), (0, 0, 0, 0)),
                                       g.resize((W, gh))), (0, 0))

    f_m = ImageFont.truetype(F_MONO, 26)
    f_t = ImageFont.truetype(F_XK, 172)
    f_s = ImageFont.truetype(F_KAI, 42)
    im = draw_text(im, (74, 1094), '11.07', f_m, (206, 184, 154), anchor='lt')
    im = draw_text(im, (W - 74, 1094), '1987 / 30"', f_m, (206, 184, 154), anchor='rt')
    im = draw_text(im, (W // 2, 1124), '幻听', f_t, CREAM, anchor='mt',
                   stroke=8, stroke_fill=INK, glow=(255, 200, 152), glow_r=20, glow_a=.3, spacing=16)
    im = draw_text(im, (W // 2, 1316), '玻 璃 上 的 第 二 个 人', f_s, (238, 210, 174), anchor='mt',
                   stroke=3, stroke_fill=(28, 18, 16))
    return finish(framesafe(im))


for name, fn in [('cover_A_画面主导', make_A), ('cover_B_文字主导', make_B), ('cover_C_特写主导', make_C)]:
    p = os.path.join(OUT, name + '.png')
    fn().save(p)
    print(p, os.path.getsize(p) // 1024, 'KB')

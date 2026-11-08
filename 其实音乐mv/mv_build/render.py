# -*- coding: utf-8 -*-
"""
《于是》像素 RPG 读档版 MV 渲染核心
320x180 像素层 -> x6 nearest -> 1920x1080；文字走 HD 层。
画法：平涂色带 + 1px 抖动缝，单个暖光源，剪影为主。
"""
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFont

W, H = 320, 180
OW, OH = 1920, 1080
FPS = 24
TOTAL = 232.835813
SCALE = 6

FONT_B = r"C:\Windows\Fonts\msyhbd.ttc"
FONT_R = r"C:\Windows\Fonts\msyh.ttc"

def hx(s):
    s = s.lstrip('#')
    return np.array([int(s[0:2],16), int(s[2:4],16), int(s[4:6],16)], dtype=np.uint8)

C = {
 'ink0': hx('0E1220'), 'ink1': hx('1A2133'), 'ink2': hx('2A3450'), 'ink3': hx('46527A'),
 'cream': hx('F3E7D3'), 'gold': hx('FFD166'),
 'rose': hx('E8556D'), 'lilac': hx('B9A9D6'),
 'red': hx('C8463C'), 'cyan': hx('5FD3C4'),
 'skin': hx('E3B393'), 'gray': hx('888780'),
}

BAYER4 = (np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]], dtype=np.float32)+0.5)/16.0

def bayer(h, w, ox=0, oy=0):
    t = np.tile(BAYER4, (h//4+2, w//4+2))
    return t[oy % 4:(oy % 4)+h, ox % 4:(ox % 4)+w]

def mix(a, b, t):
    a = np.asarray(a, dtype=np.float32); b = np.asarray(b, dtype=np.float32)
    return np.clip(a*(1.0-t) + b*t, 0, 255).astype(np.uint8)

def dark(c, f=0.6):
    return np.clip(np.asarray(c,dtype=np.float32)*f, 0, 255).astype(np.uint8)

def light(c, f=0.4):
    return mix(c, C['cream'], f)

# ---------------------------------------------------------------- 像素层基础
def new_frame(bg=None):
    return np.tile(np.asarray(bg if bg is not None else C['ink0'], np.uint8), (H, W, 1)).copy()

def rect(img, x0, y0, x1, y1, col):
    x0 = int(round(x0)); x1 = int(round(x1)); y0 = int(round(y0)); y1 = int(round(y1))
    if x0 > x1: x0, x1 = x1, x0
    if y0 > y1: y0, y1 = y1, y0
    x0 = max(0, x0); y0 = max(0, y0); x1 = min(W, x1); y1 = min(H, y1)
    if x1 <= x0 or y1 <= y0: return
    img[y0:y1, x0:x1] = col

def frame_rect(img, x0, y0, x1, y1, col, t=1):
    rect(img, x0, y0, x1, y0+t, col); rect(img, x0, y1-t, x1, y1, col)
    rect(img, x0, y0, x0+t, y1, col); rect(img, x1-t, y0, x1, y1, col)

def hline(img, x0, x1, y, col, t=1): rect(img, x0, y, x1, y+t, col)
def vline(img, x, y0, y1, col, t=1): rect(img, x, y0, x+t, y1, col)

def disc(img, cx, cy, r, col):
    if r <= 0: return
    for y in range(max(0,int(cy-r)-1), min(H,int(cy+r)+2)):
        dy = y + 0.5 - cy
        if abs(dy) > r: continue
        dx = math.sqrt(max(0.0, r*r - dy*dy))
        xa = max(0, int(math.ceil(cx-dx))); xb = min(W, int(math.floor(cx+dx))+1)
        if xb > xa: img[y, xa:xb] = col

def star(img, cx, cy, r, col, inner=0.42):
    """填充五角星（扫描线），用于星星贴纸/发夹"""
    if r <= 0: return
    pts = []
    for i in range(10):
        a = -math.pi/2 + i*math.pi/5
        rr = r if i % 2 == 0 else r*inner
        pts.append((cx+math.cos(a)*rr, cy+math.sin(a)*rr))
    ys = [p[1] for p in pts]
    y0 = max(0, int(min(ys))); y1 = min(H, int(max(ys))+1)
    for y in range(y0, y1):
        yy = y+0.5
        xs = []
        for i in range(10):
            ax, ay = pts[i]; bx2, by2 = pts[(i+1) % 10]
            if (ay <= yy < by2) or (by2 <= yy < ay):
                t = (yy-ay)/(by2-ay) if by2 != ay else 0
                xs.append(ax + t*(bx2-ax))
        xs.sort()
        for k in range(0, len(xs)-1, 2):
            xa = max(0, int(round(xs[k]))); xb = min(W, int(round(xs[k+1]))+1)
            if xb > xa: img[y, xa:xb] = col

def vband(img, y0, y1, c0, c1, steps=5, x0=0, x1=None, seam=True):
    """竖直色带：平涂 + 交界 1px 棋盘缝（经典像素渐变）"""
    x1 = W if x1 is None else x1
    y0 = max(0, int(y0)); y1 = min(H, int(y1))
    n = y1 - y0
    if n <= 0: return
    steps = max(1, int(steps))
    for i in range(steps):
        a = y0 + int(n*i/steps); b = y0 + int(n*(i+1)/steps)
        if b <= a: continue
        rect(img, x0, a, x1, b, mix(c0, c1, (i+0.5)/steps))
        if seam and i < steps-1:
            cc = mix(c0, c1, (i+1.0)/steps)
            row = b
            if row < H:
                for x in range(int(x0), int(x1)):
                    if (x // 2 + row) % 2 == 0:
                        img[row, x] = cc

def vgrad(img, y0, y1, c0, c1, ox=0, oy=0):
    vband(img, y0, y1, c0, c1, steps=5)

def glow(img, cx, cy, r, col, power=1.0, dither=True):
    """局部光斑：内芯实心，外圈 2 层棋盘，不超过 4 档"""
    if r <= 0 or power <= 0: return
    x0 = max(0, int(cx-r)); x1 = min(W, int(cx+r)+1)
    y0 = max(0, int(cy-r)); y1 = min(H, int(cy+r)+1)
    if x1 <= x0 or y1 <= y0: return
    yy, xx = np.mgrid[y0:y1, x0:x1]
    d = np.sqrt((xx-cx)**2 + (yy-cy)**2) / float(r)
    s = np.clip(1.0-d, 0, 1) ** 0.85 * float(power)
    b = bayer(y1-y0, x1-x0, x0, y0)
    # 只有 3 个量化档位，避免大范围噪点
    s = np.clip(np.round(s*3.0)/3.0, 0, 1)
    m = s > (b if dither else 0.5)
    sub = img[y0:y1, x0:x1]
    sub[m] = col

def spot(img, cx=160, cy=90, r_in=0, r_out=999, floor=1.0):
    """按距离压暗，档位粗一点（像素味），但避免出现色环"""
    if floor >= 1.0: return
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt((xx-cx)**2 + (yy-cy)**2).astype(np.float32)
    f = np.clip((d - r_in) / max(r_out - r_in, 1), 0, 1)
    f = f*f*(3-2*f)
    m = 1.0 - (1.0-floor)*f
    # 用抖动代替色阶，白色背景上不会出现同心环
    b = bayer(H, W)
    m = np.where(m > (b*0.85 + 0.08), m, np.minimum(1.0, m + (1.0-floor)*0.10))
    img[:] = np.clip(img.astype(np.float32) * m[:, :, None], 0, 255).astype(np.uint8)

def warm_pool(img, cx, cy, rx, ry, col, levels=3, strength=0.55):
    yy, xx = np.mgrid[0:H, 0:W]
    d = np.sqrt(((xx-cx)/max(rx,1))**2 + ((yy-cy)/max(ry,1))**2)
    b = bayer(H, W)
    for i in range(levels, 0, -1):
        edge = i/max(levels,1)
        inner = max(0.0, (i-1)/max(levels,1)) * 0.55
        m = (d < edge) & (d > inner)
        m &= ((1-d/edge)*2.2 > b)
        if not m.any(): continue
        t = (strength*(0.55 + 0.45*(1-d[m]/edge)))[:, None]
        a = img[m].astype(np.float32)
        img[m] = np.clip(a*(1.0-t) + np.asarray(col,np.float32)*t, 0, 255).astype(np.uint8)

def clip_rect(img, x0, y0, x1, y1):
    return (int(x0), int(y0), int(x1), int(y1))

def put(img, box, fn, *a, **k):
    """在子区域内绘制：临时画布 + 拼接，用于把雨限制在窗内"""
    x0, y0, x1, y1 = box
    x0 = max(0,int(x0)); y0 = max(0,int(y0)); x1 = min(W,int(x1)); y1 = min(H,int(y1))
    if x1<=x0 or y1<=y0: return
    sub = img[y0:y1, x0:x1].copy()
    fn(sub, *a, **k)
    img[y0:y1, x0:x1] = sub

# ---------------------------------------------------------------- 文字
_fc = {}
def font(size, bold=True):
    key = (int(size), bold)
    if key not in _fc:
        _fc[key] = ImageFont.truetype(FONT_B if bold else FONT_R, int(size))
    return _fc[key]

def _bbox(d, s, size):
    f = font(size)
    b = d.textbbox((0,0), s, font=f)
    return b[2]-b[0], b[3]-b[1], b

def text_item(x, y, s, size=5, col=None, align='la', shadow=True):
    return dict(x=x, y=y, text=s, size=size,
                color=col if col is not None else C['cream'],
                align=align, shadow=shadow)

_sub_cache = {}
def subtitle_layer(s):
    if s in _sub_cache: return _sub_cache[s]
    tmp = Image.new('RGBA', (10,10))
    d = ImageDraw.Draw(tmp)
    size = 88
    while size > 40:
        tw, _, _ = _bbox(d, s, size)
        if tw <= 1560: break
        size -= 2
    tw, th, bb = _bbox(d, s, size)
    pad = 40
    img = Image.new('RGBA', (tw+pad*2, th+pad*2), (0,0,0,0))
    dd = ImageDraw.Draw(img)
    ox, oy = pad-bb[0], pad-bb[1]
    for dx, dy, a in ((0,6,210),(5,4,120),(-4,4,110),(0,3,80)):
        dd.text((ox+dx, oy+dy), s, font=font(size), fill=(3,5,10,a))
    dd.text((ox, oy), s, font=font(size), fill=(243,231,211,255))
    _sub_cache[s] = img
    return img

# ---------------------------------------------------------------- 人物
PAL_HIM = {'coat': C['ink2'], 'coat_l': C['ink3'], 'coat_d': dark(C['ink2'], 0.52),
           'inner': C['cream'], 'skin': C['skin'], 'hair': dark(C['ink1'], 0.65)}
PAL_HER = {'coat': C['lilac'], 'coat_l': light(C['lilac'], 0.40),
           'coat_d': dark(C['lilac'], 0.55), 'inner': C['rose'],
           'skin': light(C['skin'], 0.12), 'hair': dark(C['ink1'], 0.50)}

def person(img, bx, by, sc=1.0, pal=None, pose='stand', hair='short', her=False, rim=True):
    """脚底/臀底基准 (bx,by)；净高约 40*sc"""
    pal = PAL_HER if (pal is None and her) else (pal or PAL_HIM)
    coat   = np.asarray(pal['coat'], np.uint8)
    coat_d = np.asarray(pal['coat_d'], np.uint8)
    coat_l = np.asarray(pal['coat_l'], np.uint8)
    skin   = np.asarray(pal['skin'], np.uint8)
    hair_c = np.asarray(pal['hair'], np.uint8)
    inner  = np.asarray(pal['inner'], np.uint8)

    s = float(sc)
    sit = pose == 'sit'
    crouch = pose == 'crouch'
    leg_h = (12.5*s) if not sit else (6.5*s)
    body_h = (14.5*s) if not crouch else (10.5*s)
    head_r = 4.4*s

    # 腿
    if sit:
        for lx in (-0.6*s, 1.5*s):
            rect(img, bx+lx, by-leg_h, bx+lx+2.3*s, by-0.5, coat_d)
        rect(img, bx+0.4*s, by-leg_h*0.35, bx+4.6*s, by-leg_h*0.35+2.0*s, coat_d)
    else:
        off = 0.0
        if pose == 'walk': off = 1.8*s
        if pose == 'run': off = 3.2*s
        for i, lx in enumerate((-2.2*s, 0.7*s)):
            dy = (off if i == 0 else -off)
            rect(img, bx+lx, by-leg_h-dy*0.15, bx+lx+1.9*s, by-1, coat_d)
        rect(img, bx-2.9*s, by-1.8*s, bx-0.4*s, by, dark(coat_d, 0.6))
        rect(img, bx+0.5*s, by-1.8*s, bx+2.9*s, by, dark(coat_d, 0.6))

    t0 = by - leg_h - body_h
    t1 = by - leg_h
    tw = 9.0*s
    rect(img, bx-tw/2, t0, bx+tw/2, t1, coat)
    rect(img, bx+tw/2-1.6*s, t0, bx+tw/2, t1, coat_d)
    vline(img, bx-tw/2, t0, t1, coat_l, max(1, int(round(0.9*s))))
    # 内搭
    w = 1.5*s if her else 1.0*s
    rect(img, bx-w, t0+1.8*s, bx+w, t1-1.2*s, inner)

    # 手臂
    ay = t0 + 1.4*s
    rect(img, bx-tw/2+0.2*s, ay, bx-tw/2+2.1*s, ay+9.5*s, coat_d)
    if pose == 'reach':
        rect(img, bx+tw/2-1.0*s, ay-0.8*s, bx+tw/2+6.4*s, ay+1.4*s, coat_d)
        disc(img, bx+tw/2+6.9*s, ay+0.3*s, 1.5*s, skin)
    else:
        ao = bx+tw/2-2.1*s
        rect(img, ao, ay, ao+2.0*s, ay+8.2*s, coat)
        rect(img, ao, ay+8.0*s, ao+1.9*s, ay+10.2*s, skin)

    # 头
    head_cy = t0 - head_r + 1.0*s
    rect(img, bx-1.0*s, head_cy+head_r-0.5*s, bx+1.0*s, t0+0.8*s, mix(skin, coat_d, 0.45))
    disc(img, bx, head_cy, head_r, skin)

    if hair == 'short':
        disc(img, bx, head_cy-0.7*s, head_r*1.04, hair_c)
        rect(img, bx-head_r*1.04, head_cy-1.2*s, bx+head_r*1.04, head_cy+head_r*0.15, hair_c)
        rect(img, bx-head_r*1.00, head_cy-0.2*s, bx-head_r*0.55, head_cy+head_r*0.85, hair_c)
        rect(img, bx+head_r*0.55, head_cy-0.2*s, bx+head_r*1.00, head_cy+head_r*0.85, hair_c)
        disc(img, bx, head_cy+0.85*s, head_r*0.72, skin)
    else:
        disc(img, bx, head_cy-0.35*s, head_r*1.06, hair_c)
        rect(img, bx-head_r*1.10, head_cy-0.9*s, bx-head_r*0.52, t0+5.5*s, hair_c)
        rect(img, bx+head_r*0.52, head_cy-0.9*s, bx+head_r*1.10, t0+5.5*s, hair_c)
        disc(img, bx, head_cy+0.85*s, head_r*0.74, skin)
        rect(img, bx-0.6*s, head_cy-head_r*0.95, bx+0.6*s, head_cy+head_r*0.25, hair_c)

    if her:
        sx = bx - head_r*1.05; sy = head_cy - head_r*0.45
        k = max(1, int(round(2.2*s)))
        rect(img, sx, sy, sx+k, sy+k, C['gold'])

    # 眼
    ey = head_cy + 1.0*s
    eye = dark(skin, 0.30)
    rect(img, bx-1.5*s, ey, bx-0.6*s, ey+0.9*s, eye)
    rect(img, bx+0.6*s, ey, bx+1.5*s, ey+0.9*s, eye)
    if her:
        rect(img, bx-2.3*s, ey+1.5*s, bx-1.5*s, ey+2.0*s, mix(skin, C['rose'], 0.40))
        rect(img, bx+1.5*s, ey+1.5*s, bx+2.3*s, ey+2.0*s, mix(skin, C['rose'], 0.40))

    if rim:
        vline(img, bx-tw/2, t0, t1, light(coat, 0.35), 1)
        disc(img, bx-head_r*0.85, head_cy-head_r*0.55, max(1.0, head_r*0.28), light(skin, 0.62))

def her_face_closeup(img, cx, cy, r=26, mode='closed'):
    skin = light(C['skin'], 0.10)
    hair_c = dark(C['ink1'], 0.50)
    brow = dark(hair_c, 0.80)
    lip = mix(C['rose'], dark(C['skin'], 0.45), 0.25)
    r = float(r)
    disc(img, cx, cy-r*0.10, r*1.10, hair_c)
    rect(img, cx-r*1.22, cy-r*0.22, cx-r*0.60, cy+r*1.5, hair_c)
    rect(img, cx+r*0.60, cy-r*0.22, cx+r*1.22, cy+r*1.5, hair_c)
    y = cy - r*0.94
    while y < cy + r*1.18:
        dy = (y + 0.5 - cy)/r
        if dy < 0.28:
            half = r*0.80*math.sqrt(max(0.0, 1-dy*dy))
        else:
            k = min(1.0, (dy-0.28)/0.88)
            half = r*0.80*math.sqrt(max(0.0, 1-k*k))
        if half > 0.3:
            rect(img, cx-half, y, cx+half, y+1, skin)
        y += 1
    rect(img, cx-r*0.92, cy-r*0.94, cx+r*0.92, cy-r*0.32, hair_c)
    disc(img, cx-r*0.36, cy-r*0.62, r*0.46, hair_c)
    disc(img, cx+r*0.40, cy-r*0.60, r*0.43, hair_c)
    rect(img, cx-r*0.09, cy-r*0.94, cx+r*0.05, cy-r*0.28, hair_c)
    rect(img, cx-r*0.52, cy-r*0.13, cx-r*0.15, cy-r*0.085, brow)
    rect(img, cx+r*0.15, cy-r*0.13, cx+r*0.52, cy-r*0.085, brow)
    if mode in ('closed', 'eyes_closed'):
        rect(img, cx-r*0.50, cy+r*0.03, cx-r*0.14, cy+r*0.08, dark(skin, 0.40))
        rect(img, cx+r*0.14, cy+r*0.03, cx+r*0.50, cy+r*0.08, dark(skin, 0.40))
        rect(img, cx-r*0.50, cy+r*0.08, cx-r*0.14, cy+r*0.11, dark(skin, 0.20))
        rect(img, cx+r*0.14, cy+r*0.08, cx+r*0.50, cy+r*0.11, dark(skin, 0.20))
    else:
        rect(img, cx-r*0.50, cy-r*0.03, cx-r*0.14, cy+r*0.10, dark(skin, 0.45))
        rect(img, cx+r*0.14, cy-r*0.03, cx+r*0.50, cy+r*0.10, dark(skin, 0.45))
        rect(img, cx-r*0.38, cy-r*0.01, cx-r*0.32, cy+r*0.06, C['cream'])
        rect(img, cx+r*0.20, cy-r*0.01, cx+r*0.26, cy+r*0.06, C['cream'])
        rect(img, cx-r*0.52, cy-r*0.05, cx-r*0.14, cy-r*0.01, brow)
        rect(img, cx+r*0.14, cy-r*0.05, cx+r*0.52, cy-r*0.01, brow)
    rect(img, cx-0.5, cy+r*0.21, cx+0.5, cy+r*0.32, mix(skin, dark(skin, 0.60), 0.55))
    if mode == 'smile':
        rect(img, cx-r*0.18, cy+r*0.47, cx+r*0.18, cy+r*0.53, lip)
        rect(img, cx-r*0.25, cy+r*0.43, cx-r*0.18, cy+r*0.48, lip)
        rect(img, cx+r*0.18, cy+r*0.43, cx+r*0.25, cy+r*0.48, lip)
    elif mode == 'talk':
        rect(img, cx-r*0.11, cy+r*0.43, cx+r*0.11, cy+r*0.58, dark(lip, 0.60))
    else:
        rect(img, cx-r*0.16, cy+r*0.48, cx+r*0.16, cy+r*0.53, lip)
    rect(img, cx-r*0.60, cy+r*0.19, cx-r*0.38, cy+r*0.25, mix(skin, C['rose'], 0.35))
    rect(img, cx+r*0.38, cy+r*0.19, cx+r*0.60, cy+r*0.25, mix(skin, C['rose'], 0.35))
    rect(img, cx-r*0.58, cy+r*1.10, cx+r*0.58, cy+r*1.48, C['rose'])
    rect(img, cx-r*0.76, cy+r*1.00, cx+r*0.76, cy+r*1.14, C['lilac'])
    rect(img, cx-r*1.06, cy-r*0.02, cx-r*1.06+3, cy-r*0.02+3, C['gold'])

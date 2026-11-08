# -*- coding: utf-8 -*-
"""8 个场景的像素层绘制。返回需要走 HD 层的文字项。"""
import math
import numpy as np
from render import (W, H, C, mix, dark, light, new_frame, rect, frame_rect, hline, vline,
                    disc, vband, glow, spot, warm_pool, bayer, person, her_face_closeup,
                    text_item, star)

def txt(x, y, s, size=5, col=None, align='la', shadow=True):
    return text_item(x, y, s, size, col, align, shadow)

def cursor_tri(img, x, y, size_px=6, col=None, kind='right'):
    """手绘 ▶ / ▼ 光标（字体里没有该字形，必须画）"""
    col = C['gold'] if col is None else col
    n = int(size_px)
    for i in range(n):
        if kind == 'right':
            rect(img, x, y+i, x+2+n//2-i, y+i+1, col)
        else:
            rect(img, x+i, y, x+n-i, y+1, col)

# ------------------------------------------------------------------ 雨
def rain_box(img, lt, x0, y0, x1, y1, n=40, col=None, speed=110, seed=7, slant=0.25):
    if n <= 0: return
    x0=max(0,int(x0)); y0=max(0,int(y0)); x1=min(W,int(x1)); y1=min(H,int(y1))
    if x1<=x0 or y1<=y0: return
    rng = np.random.RandomState(seed)
    bw, bh = x1-x0, y1-y0
    cc = col if col is not None else mix(C['ink3'], C['cream'], 0.20)
    for i in range(n):
        px = rng.uniform(0, bw); py = rng.uniform(0, bh); sp = rng.uniform(0.7, 1.5)
        ln = int(rng.randint(2, 5))
        y = (py + lt*speed*sp) % bh
        x = (px + y*slant) % bw
        for k in range(ln):
            xx = int(x0 + (x - k*slant) % bw); yy = int(y0 + y - k)
            if x0 <= xx < x1 and y0 <= yy < y1:
                img[yy, xx] = cc

def glass_drops(img, lt, x0, y0, x1, y1, n=10, seed=3):
    x0=max(0,int(x0)); y0=max(0,int(y0)); x1=min(W,int(x1)); y1=min(H,int(y1))
    rng = np.random.RandomState(seed)
    bh = y1-y0
    for i in range(n):
        px = rng.uniform(x0+2, x1-2); py = rng.uniform(0, bh)
        sp = rng.uniform(2.5, 8.0)
        y = (py + lt*sp) % bh + y0
        xx = int(px + math.sin(lt*0.8 + i)*1.2)
        for k in range(3):
            yy = int(y)+k
            if y0 <= yy < y1 and x0 <= xx < x1:
                img[yy, xx] = mix(img[yy,xx], C['cream'], 0.16)

# ------------------------------------------------------------------ S1 room
def s_room(img, lt, dur, P):
    v = P.get('v', 'window')
    out = []

    if v == 'desk':
        vband(img, 0, 100, C['ink0'], dark(C['ink1'], 0.95), 4)
        rect(img, 0, 100, W, H, dark(C['ink2'], 0.42))
        rect(img, 0, 100, W, 103, C['ink3'])
        rect(img, 0, 103, W, 106, dark(C['ink2'], 0.7))
        cx, cy = 58, 100
        rect(img, cx-11, cy-27, cx+11, cy, dark(C['ink3'], 0.85))
        rect(img, cx-8, cy-24, cx+8, cy-2, dark(C['ink1'], 0.8))
        rect(img, cx-8, cy-19, cx+8, cy-13, mix(C['ink3'], C['cream'], 0.22))
        hline(img, cx-11, cx+11, cy-28, C['cream'], 2)
        vline(img, cx+11, cy-24, cy-12, C['ink3'], 2)
        gx, gy = 196, 168
        led = P.get('led', 0.0)
        rect(img, gx-46, gy-26, gx+46, gy+14, C['ink2'])
        rect(img, gx-46, gy-26, gx+46, gy-22, C['ink3'])
        disc(img, gx-30, gy+8, 13, dark(C['ink2'], 0.78))
        disc(img, gx+30, gy+8, 13, dark(C['ink2'], 0.78))
        rect(img, gx-42, gy-14, gx-18, gy-6, C['ink1'])
        disc(img, gx+26, gy-10, 4, C['rose'])
        disc(img, gx+36, gy-10, 4, C['cream'])
        rect(img, gx+2, gy-16, gx+14, gy-12, mix(dark(C['red'], 0.4), C['red'], led))
        sk = C['skin']
        rect(img, gx-6, gy-30, gx+10, gy-6, sk)
        disc(img, gx+2, gy-8, 10, sk)
        rect(img, gx-2, gy-26, gx+6, gy-8, mix(sk, C['ink2'], 0.25))
        glow(img, gx+8, gy-14, 18, mix(C['red'], C['cream'], 0.25), 0.45*led)
        warm_pool(img, 205, 132, 120, 92, C['gold'], 3, 0.16)
        return out

    if v == 'window' or v == 'steam':
        vband(img, 0, 150, C['ink0'], C['ink1'], 4)
        vband(img, 146, H, dark(C['ink1'], 0.9), dark(C['ink0'], 0.95), 3)
        rect(img, 0, 145, W, 148, C['ink2'])

        wx0, wy0, wx1, wy1 = 16, 20, 150, 130
        rect(img, wx0-4, wy0-4, wx1+4, wy1+4, C['ink2'])
        vband(img, wy0, wy1, dark(C['ink2'], 0.45), C['ink3'], 5, wx0, wx1)
        rect(img, wx0, wy0, wx1, wy0+2, dark(C['ink2'], 0.5))
        for (bx, bw, bh) in [(18,26,34),(46,20,50),(68,24,28),(96,22,42),(120,30,30)]:
            rect(img, bx, wy1-bh, bx+bw, wy1, dark(C['ink2'], 0.55))
        vline(img, 82, wy0, wy1, C['ink2'], 3)
        hline(img, wx0, wx1, wy0+54, C['ink2'], 3)
        frame_rect(img, wx0-4, wy0-4, wx1+4, wy1+4, C['ink2'], 2)
        rain_box(img, lt, wx0, wy0, wx1, wy1, 34, mix(C['ink3'], C['cream'], 0.18), 120, 11)
        glass_drops(img, lt, wx0+1, wy0+1, wx1-1, wy1-1)
        rect(img, wx0-10, wy1+4, wx1+10, wy1+9, C['ink3'])
        hline(img, wx0-10, wx1+10, wy1+4, C['cream'], 1)

        if v == 'steam':
            val = P.get('steam_val', '21:37')
            yy, xx = np.mgrid[wy0:wy1, wx0:wx1]
            d = np.sqrt(((xx-92)/30)**2 + ((yy-84)/20)**2)
            b = bayer(H, W)[wy0:wy1, wx0:wx1]
            m = (d < 1.05) & ((1-d) * 1.5 > b*0.75)
            sub = img[wy0:wy1, wx0:wx1]
            sub[m] = mix(sub[m], C['cream'], 0.26)
            out.append(txt(92, 84, val, 7.4, mix(C['cream'], C['ink3'], 0.10), 'cc'))
            return out

        lx = 252
        rect(img, lx-16, 74, lx+16, 84, C['cream'])
        rect(img, lx-14, 84, lx+14, 88, dark(C['cream'], 0.8))
        rect(img, lx-2, 88, lx+2, 132, C['ink2'])
        rect(img, lx-12, 130, lx+12, 136, C['ink2'])
        warm_pool(img, lx, 96, 82, 74, C['gold'], 3, 0.60)
        glow(img, lx, 92, 54, mix(C['gold'], C['cream'], 0.45), 0.52)
        person(img, 186, 150, 1.55, pose='sit', rim=True)
        glow(img, 250, 112, 40, mix(C['cream'], C['gold'], 0.35), 0.26)
        spot(img, 168, 100, 74, 240, 0.32)
        return out

    if v == 'floor':
        rect(img, 0, 0, W, H, dark(C['ink0'], 0.92))
        vband(img, 112, H, dark(C['ink2'], 0.5), dark(C['ink0'], 0.9), 3)
        hline(img, 0, W, 112, dark(C['ink3'], 0.55), 1)
        rect(img, 30, 126, 292, 158, dark(C['ink2'], 0.55))
        rect(img, 30, 148, 292, 160, dark(C['ink1'], 0.8))
        disc(img, 272, 132, 15, dark(C['ink2'], 0.55))
        disc(img, 278, 128, 12, dark(C['ink1'], 0.72))
        ph = P.get('phone_on', 0.8)
        rect(img, 148, 130, 178, 156, C['ink2'])
        rect(img, 151, 133, 175, 153, mix(dark(C['cream'], 0.28), C['cream'], ph))
        warm_pool(img, 163, 143, 46, 30, mix(C['cream'], C['ink3'], 0.25), 3, 0.30*ph)
        rect(img, 262, 128, 276, 140, mix(C['skin'], C['ink0'], 0.25))
        spot(img, 163, 140, 44, 200, 0.26)
        return out

    if v in ('tv2', 'tvempty'):
        rect(img, 0, 0, W, H, dark(C['ink0'], 0.94))
        # 电视缩小并抬高，给人物留出地面
        rect(img, 104, 34, 216, 104, C['ink2'])
        rect(img, 109, 39, 211, 99, dark(C['ink3'], 0.72))
        rng = np.random.RandomState(int(lt*18) % 89 + 3)
        sub = img[39:99, 109:211]
        nl = rng.randint(0, 100, sub.shape[:2])
        m = nl > 72
        sub[m] = mix(sub[m], C['cream'], 0.26)
        hline(img, 98, 222, 104, C['ink1'], 3)
        vband(img, 108, H, dark(C['ink2'], 0.46), dark(C['ink0'], 0.92), 3)
        yy, xx = np.mgrid[108:H, 0:W]
        d = np.sqrt(((xx-160)/118.0)**2 + ((yy-118)/34.0)**2)
        b = bayer(H, W)[108:H, 0:W]
        mm = (d < 1) & ((1-d)*1.3 > b*0.85)
        g = img[108:H, 0:W]
        g[mm] = mix(g[mm], mix(C['cream'], C['ink3'], 0.45), 0.20)
        # 人物抬高，头顶留在字幕上方
        if v == 'tv2':
            person(img, 116, 158, 1.30, pose='sit', rim=True)
            person(img, 198, 158, 1.28, her=True, hair='long', pose='sit', rim=True)
        else:
            person(img, 128, 158, 1.30, pose='sit', rim=True)
        return out

    if v == 'screen':
        rect(img, 0, 0, W, H, dark(C['ink0'], 0.94))
        rect(img, 56, 24, 264, 136, C['ink2'])
        rect(img, 60, 28, 260, 132, dark(C['ink3'], 0.7))
        rng = np.random.RandomState(int(lt*10) % 53 + 1)
        sub = img[28:132, 60:260]
        nl = rng.randint(0, 100, sub.shape[:2])
        sub[nl > 70] = mix(sub[nl > 70], C['cream'], 0.22)
        person(img, 160, 180, 1.9, pose='sit', rim=False)
        glow(img, 160, 150, 46, mix(C['cream'], C['ink3'], 0.5), 0.20)
        return out

    return out

# ------------------------------------------------------------------ S2 phone
def s_phone(img, lt, dur, P):
    v = P.get('v', 'chat')
    out = []
    rect(img, 0, 0, W, H, dark(C['ink0'], 0.7))
    x0, y0, w, h = 106, 2, 108, 176
    rect(img, x0-3, y0-3, x0+w+3, y0+h+3, C['ink2'])
    frame_rect(img, x0-3, y0-3, x0+w+3, y0+h+3, dark(C['ink3'], 0.7), 1)
    sx0, sy0, sx1, sy1 = x0+4, y0+12, x0+w-4, y0+h-10
    scr = mix(C['cream'], C['ink0'], 0.10)
    if v == 'call': scr = dark(C['ink3'], 0.62)
    rect(img, sx0, sy0, sx1, sy1, scr)
    rect(img, sx0, sy0, sx1, sy0+9, dark(scr, 0.82))
    out.append(txt(x0+12, sy0+2, '21:37', 2.6, C['ink2'], 'la'))
    out.append(txt(x0+w-12, sy0+2, '4G', 2.4, C['ink2'], 'ra'))

    if v == 'contact':
        for i in range(6):
            yy = sy0+14+i*18
            rect(img, sx0+3, yy, sx1-3, yy+15, mix(scr, C['cream'], 0.30))
            disc(img, sx0+12, yy+7, 5, dark(C['ink3'], 0.75))
            rect(img, sx0+21, yy+5, sx0+52, yy+7, dark(scr, 0.5))
            rect(img, sx0+21, yy+9, sx0+38, yy+11, dark(scr, 0.72))
        yy = sy0+14+3*18
        rect(img, sx0+3, yy, sx1-3, yy+15, dark(C['ink3'], 0.35))
        disc(img, sx0+12, yy+7, 5, C['rose'])
        rect(img, sx0+21, yy+5, sx0+34, yy+7, dark(scr, 0.35))
        out.append(txt(sx0+21, yy+9, '他', 4.0, C['ink2'], 'la'))
        disc(img, sx0+78, yy+24, 7, C['skin'])
        out.append(txt(160, sy1-24, '上次聊天：2018年8月', 3.0, dark(C['ink3'], 0.7), 'ca'))
        out.append(txt(160, sy1-12, '未发送 1', 3.0, C['red'], 'ca'))

    elif v in ('chat', 'typing', 'typed', 'offline'):
        rect(img, sx0, sy0+9, sx1, sy0+26, mix(scr, C['ink3'], 0.08))
        hline(img, sx0, sx1, sy0+26, dark(scr, 0.75), 1)
        gray = P.get('her_gray', False)
        av = mix(C['rose'], C['ink3'], 0.85) if gray else C['rose']
        rect(img, sx0+4, sy0+11, sx0+21, sy0+24, av)
        rect(img, sx0+8, sy0+13, sx0+17, sy0+22, mix(C['skin'], C['ink1'], 0.15 if gray else 0.0))
        rect(img, sx0+8, sy0+13, sx0+17, sy0+16, dark(C['ink1'], 0.65))
        if v == 'offline':
            out.append(txt(sx0+25, sy0+12, '对方已离线 · 2018', 3.2, C['gray'], 'la'))
        elif v == 'typing':
            out.append(txt(sx0+25, sy0+12, '对方正在输入…', 3.2, C['ink2'], 'la'))
        else:
            out.append(txt(sx0+25, sy0+13, '她', 4.2,
                           C['ink2'] if not gray else dark(C['ink3'], 0.7), 'la'))

        for i, item in enumerate(P.get('bubbles', [])):
            side, s = item
            yy = sy0+32+i*22
            if side == 'r':
                rect(img, sx1-62, yy, sx1-4, yy+17, mix(C['rose'], C['cream'], 0.22))
                out.append(txt(sx1-33, yy+4, s, 3.2, C['cream'], 'ca'))
            else:
                rect(img, sx0+4, yy, sx0+66, yy+17, mix(scr, C['cream'], 0.55))
                out.append(txt(sx0+35, yy+4, s, 3.2, C['ink2'], 'ca'))

        iy = sy1-22
        rect(img, sx0+4, iy, sx1-4, iy+14, mix(scr, C['cream'], 0.55))
        frame_rect(img, sx0+4, iy, sx1-4, iy+14, dark(scr, 0.62), 1)
        draft = P.get('draft', '')
        if draft:
            out.append(txt(sx0+8, iy+4, draft, 3.2, C['ink2'], 'la'))
        if P.get('cursor') and int(lt*4) % 2 == 0:
            cw = len(draft)*6.4+2
            rect(img, sx0+8+cw, iy+3, sx0+9+cw, iy+11, C['ink2'])
        ns = P.get('unsent')
        if ns:
            out.append(txt(160, sy1-34, ns, 2.8, dark(C['ink3'], 0.85), 'ca'))

    elif v == 'back':
        rect(img, sx0, sy0, sx1, sy1, dark(C['ink3'], 0.42))
        rect(img, sx0+8, sy0+8, sx0+34, sy0+32, dark(C['ink0'], 0.75))
        disc(img, sx0+19, sy0+17, 6, dark(C['ink0'], 0.9))
        disc(img, sx0+19, sy0+17, 3, mix(C['ink3'], C['cream'], 0.15))
        rect(img, sx0+16, sy0+28, sx0+32, sy0+31, C['ink2'])
        st = P.get('sticker', 1.0)
        if st > 0:
            sx, sy = sx0+66, sy0+44
            glow(img, sx, sy, 16, dark(C['gold'], 0.55), 0.30*st)
            star(img, sx, sy, 7.0, C['gold'], 0.44)
            star(img, sx, sy, 5.0, mix(C['gold'], C['cream'], 0.35), 0.44)

    elif v == 'call':
        out.append(txt(160, sy0+14, P.get('call_name', '她'), 4.2, C['cream'], 'ca'))
        cy = (sy0+sy1)//2 + 4
        if P.get('call_state') == 'fail':
            out.append(txt(160, cy-14, '连接失败', 7.0, C['red'], 'ca'))
            out.append(txt(160, cy+14, '2018-08-21 21:38', 3.0, C['gray'], 'ca'))
        else:
            for i in range(3):
                r = 14 + i*10
                a0 = lt*2.4 + i*2.1
                for k in range(18):
                    a = a0 + k*math.pi/9
                    rect(img, 160+math.cos(a)*r, cy+math.sin(a)*r,
                         160+math.cos(a)*r+1, cy+math.sin(a)*r+1, C['ink3'])
            out.append(txt(160, cy-8, '正在连接…', 5.4, C['cream'], 'ca'))

    elif v == 'expired':
        rect(img, sx0, sy0, sx1, sy1, dark(C['ink0'], 0.9))
        out.append(txt(160, (sy0+sy1)//2-6, '已过期 · 无法发送', 5.0, C['ink3'], 'ca'))
        out.append(txt(160, (sy0+sy1)//2+16, '未发送 1', 2.8, dark(C['ink3'], 0.6), 'ca'))

    vline(img, x0-3, y0-3, y0+h+3, C['ink3'], 1)
    return out

# ------------------------------------------------------------------ S3 street
def s_street(img, lt, dur, P):
    v = P.get('v', 'look')
    out = []
    vband(img, 0, 120, C['ink0'], C['ink2'], 4)
    rng = np.random.RandomState(21)
    xs = 0
    while xs < W:
        bw = int(rng.randint(30, 56)); bh = int(rng.randint(56, 104))
        x1 = min(W, xs+bw)
        bcol = dark(C['ink1'], 0.95 - rng.uniform(0, 0.10))
        rect(img, xs, 120-bh, x1, 120, bcol)
        vline(img, x1-1, 120-bh, 120, dark(bcol, 0.75), 1)
        for wy in range(120-bh+7, 114, 13):
            for wx in range(xs+5, max(xs+6, x1-7), 10):
                if rng.random() < 0.42:
                    rect(img, wx, wy, wx+5, wy+6, mix(C['gold'], C['ink2'], 0.35))
        xs = x1 + int(rng.randint(1, 4))
    dx, dy = 206, 120-104+7+13*3
    rect(img, dx, dy, dx+6, dy+7, C['ink0'])

    if P.get('neon', True):
        rect(img, 36, 76, 39, 98, C['rose'])
        rect(img, 56, 90, 58, 98, C['cyan'])
        glow(img, 38, 86, 20, C['rose'], 0.45)

    vband(img, 118, H, dark(C['ink2'], 0.42), dark(C['ink0'], 0.9), 3)
    hline(img, 0, W, 118, dark(C['ink3'], 0.6), 2)
    for i in range(8):
        xx = (i*41+11) % (W-30)
        hline(img, xx, xx+24, 140+(i%4)*8, mix(C['ink2'], C['cream'], 0.14), 1)

    if v == 'look':
        rain_box(img, lt, 0, 0, W, H, 44, mix(C['ink2'], C['cream'], 0.10), 130, 31)
        disc(img, 92, 110, 21, dark(C['ink2'], 0.72))
        rect(img, 70, 110, 114, 112, dark(C['ink1'], 0.9))
        rect(img, 90, 110, 94, 152, C['ink2'])
        person(img, 92, 168, 1.15, pose='stand', rim=True)
        f = P.get('dark_window_focus', 0)
        if f > 0:
            frame_rect(img, dx-1, dy-1, dx+7, dy+8, mix(C['ink3'], C['cream'], 0.25), 1)
        spot(img, 150, 118, 84, 230, 0.34)

    elif v == 'run':
        rain_box(img, lt, 0, 0, W, H, 66, mix(C['ink2'], C['cream'], 0.14), 200, 33)
        for k in range(3):
            hline(img, 40, 118, 122+k*14, mix(C['rose'], C['ink0'], 0.55), 2)
            hline(img, 186, 280-k*8, 132+k*12, mix(C['cyan'], C['ink0'], 0.62), 2)
        person(img, 150, 172, 1.25, pose='run', rim=True)
        spot(img, 150, 132, 92, 230, 0.36)

    elif v == 'frozen':
        rain_box(img, lt, 0, 0, W, H, 66, mix(C['ink3'], C['cream'], 0.22), 0, 35)
        person(img, 150, 172, 1.25, pose='run', rim=True)
        spot(img, 150, 132, 92, 230, 0.32)
        img[:] = mix(img, dark(C['ink3'], 0.55), 0.12)

    elif v == 'puddle':
        for i in range(3):
            xx = 52 + i*62
            rect(img, xx, 142, xx+46, 148, dark(C['ink3'], 0.40))
        person(img, 84, 148, 0.95, pose='stand', rim=False)
        if P.get('reflection_gone', 0) < 0.5:
            person(img, 112, 148, 0.95, her=True, hair='long', pose='stand', rim=False)
        spot(img, 110, 140, 64, 200, 0.38)

    elif v == 'footprint':
        n2 = P.get('fp_second_until', 9)
        for i in range(9):
            xx = 40 + i*26
            yy = 152 + int(math.sin(i*0.7)*4)
            rect(img, xx, yy, xx+4, yy+3, dark(C['ink0'], 0.65))
            rect(img, xx, yy+6, xx+4, yy+9, dark(C['ink0'], 0.65))
            if i < n2:
                rect(img, xx+9, yy+2, xx+13, yy+5, dark(C['ink0'], 0.48))
                rect(img, xx+9, yy+8, xx+13, yy+11, dark(C['ink0'], 0.48))
        spot(img, 150, 152, 74, 210, 0.44)

    elif v == 'flashlight':
        for i in range(9):
            xx = 40 + i*26
            yy = 152 + int(math.sin(i*0.7)*4)
            rect(img, xx, yy, xx+4, yy+3, dark(C['ink0'], 0.7))
        person(img, 116, 174, 1.15, pose='crouch', rim=True)
        cx, cy = 156, 154
        yy, xx2 = np.mgrid[0:H, 0:W]
        d = np.sqrt(((xx2-cx)/64)**2 + ((yy-cy)/20)**2)
        b = bayer(H, W)
        m = (d < 1) & ((1-d)*1.7 > b*0.8)
        img[m] = mix(img[m], mix(C['cream'], C['ink3'], 0.35), 0.30)
        glow(img, cx, cy-2, 22, C['cream'], 0.7)
    return out

# ------------------------------------------------------------------ S4 gate
def s_bench(img, bx=20):
    rect(img, bx, 130, bx+76, 134, C['ink2'])
    rect(img, bx+4, 134, bx+8, 150, C['ink2'])
    rect(img, bx+68, 134, bx+72, 150, C['ink2'])
    hline(img, bx, bx+76, 130, C['ink3'], 1)

def s_gate(img, lt, dur, P):
    v = P.get('v', 'platform')
    out = []
    vband(img, 0, 60, C['ink0'], dark(C['ink2'], 0.80), 4)
    rect(img, 0, 0, W, 26, dark(C['ink2'], 0.55))
    hline(img, 0, W, 26, dark(C['ink3'], 0.6), 2)
    for i in range(0, W, 18):
        rect(img, i, 26, i+2, 40, dark(C['ink2'], 0.45))
    cx, cy = 262, 48
    disc(img, cx, cy, 18, C['ink2'])
    disc(img, cx, cy, 15, mix(C['cream'], C['ink2'], 0.16))
    out.append(txt(cx, cy-4, P.get('clock', '21:37'), 5.6, C['ink2'], 'cc'))
    out.append(txt(cx, cy+10, '2018·08·21', 2.4, dark(C['ink3'], 0.9), 'ca'))
    vband(img, 138, H, dark(C['ink2'], 0.48), dark(C['ink0'], 0.9), 3)
    hline(img, 0, W, 138, dark(C['ink3'], 0.55), 2)
    rect(img, 0, 166, W, H, dark(C['ink0'], 0.8))
    hline(img, 0, W, 166, dark(C['ink3'], 0.4), 1)

    if P.get('drip', True) and v in ('platform', 'turnback'):
        ph = (lt*0.7) % 1.0
        yy = 30 + ph*66
        rect(img, 74, yy, 75, yy+3, mix(C['cream'], C['ink3'], 0.35))

    if v == 'platform':
        gx = 250
        rect(img, gx, 96, gx+10, 148, C['ink2'])
        rect(img, gx+36, 96, gx+46, 148, C['ink2'])
        rect(img, gx, 96, gx+46, 100, C['ink3'])
        rect(img, gx+10, 114, gx+36, 118, C['ink2'])
        s_bench(img)
        person(img, 48, 132, 1.10, pose='sit', rim=True)
        spot(img, 140, 120, 76, 220, 0.38)

    elif v == 'turnback':
        gx = 244
        rect(img, gx, 96, gx+10, 148, C['ink2'])
        rect(img, gx+36, 96, gx+46, 148, C['ink2'])
        look = P.get('look_back', 0.0)
        person(img, 232, 152, 1.30, her=True, hair='long', pose='stand', rim=True)
        if look > 0.2:
            her_face_closeup(img, 232, 100, 16, mode='smile')
            glow(img, 232, 100, 30, C['cream'], 0.30*look)
        person(img, 104, 162, 1.20, pose='reach', rim=True)
        spot(img, 184, 122, 84, 220, 0.36)

    elif v == 'bench':
        s_bench(img)
        if P.get('controller_down'):
            rect(img, 62, 124, 84, 130, C['ink2'])
            hline(img, 62, 84, 124, C['ink3'], 1)
            led = mix(C['red'], C['ink2'], P.get('led_gray', 0.0))
            rect(img, 64, 125, 68, 127, led)
        person(img, 40, 132, 1.10, pose='sit', rim=True)
        spot(img, 76, 126, 66, 200, 0.36)
        if P.get('dialog') is not None:
            dg = P['dialog']
            n = len(dg)
            bw = min(268, max(132, n*13+58))
            bx0 = 160-bw//2
            # RPG 消息窗放在上半区，避免与底部字幕相撞
            rect(img, bx0, 22, bx0+bw, 56, dark(C['ink0'], 0.94))
            frame_rect(img, bx0, 22, bx0+bw, 56, C['cream'], 2)
            frame_rect(img, bx0+3, 25, bx0+bw-3, 53, C['ink3'], 1)
            if n:
                out.append(txt(bx0+18, 33, dg, 4.6, C['cream'], 'la'))
            if int(lt*3) % 2 == 0:
                cursor_tri(img, bx0+bw-16, 38, 5, C['gold'], 'down')

    elif v == 'drop':
        cx = 160
        rect(img, 22, 130, 150, 134, C['ink2'])
        ph = (P.get('drop_t', lt*0.9)) % 1.0
        yy = 58 + ph*72
        rect(img, cx, yy, cx+2, yy+4, mix(C['cream'], C['ink3'], 0.28))
        if ph > 0.86:
            r = (ph-0.86)/0.14
            for i in range(3):
                disc(img, cx+1, 130, 2+i*5*r, mix(C['cream'], C['ink3'], 0.45))
        spot(img, 160, 122, 54, 190, 0.40)

    elif v == 'clockjump':
        s_bench(img)
        person(img, 48, 132, 1.10, pose='sit', rim=True)
        spot(img, 206, 100, 76, 210, 0.38)
        if P.get('b1', 0) > 0:
            glow(img, 262, 48, 28, C['red'], 0.30)
    return out

# ------------------------------------------------------------------ S5 menu
def s_menu(img, lt, dur, P):
    v = P.get('v', 'slots')
    out = []
    rect(img, 0, 0, W, H, dark(C['ink0'], 0.92))
    x0, y0, x1, y1 = 28, 18, 292, 162
    rect(img, x0-6, y0-6, x1+6, y1+6, C['ink2'])
    frame_rect(img, x0-6, y0-6, x1+6, y1+6, dark(C['ink3'], 0.6), 1)
    rect(img, x0, y0, x1, y1, dark(C['ink0'], 0.55))
    for y in range(y0, y1, 3):
        rect(img, x0, y, x1, y+1, dark(C['ink0'], 0.72))
    # 荧光余晖
    glow(img, 160, 90, 150, mix(C['cyan'], C['ink0'], 0.85), 0.10)

    if P.get('boot') is not None:
        b = P['boot']
        mid = (y0+y1)//2
        hh = max(1, int((y1-y0)*b))
        rect(img, x0+2, mid-hh//2, x1-2, mid+hh//2+1, C['cream'])
        return out

    if v in ('slots', 'title', 'save'):
        out.append(txt(160, 40, '于是', 8.0, C['cream'], 'cc'))
        out.append(txt(160, 60, 'a game about waiting', 3.0, C['gray'], 'ca'))
        hline(img, 112, 208, 70, C['ink3'], 1)

    if v in ('slots', 'save'):
        for i in range(3):
            yy = 82 + i*22
            sel = (i == 1)
            col = C['cream'] if sel else dark(C['ink3'], 0.72)
            frame_rect(img, 38, yy, 282, yy+19, col, 1)
            th = P.get('thumb', 'her') if sel else None
            if th == 'her':
                rect(img, 42, yy+3, 72, yy+16, dark(C['lilac'], 0.55))
                rect(img, 52, yy+5, 58, yy+13, C['ink3'])
                rect(img, 59, yy+5, 65, yy+13, C['rose'])
                rect(img, 66, yy+7, 70, yy+13, C['lilac'])
            elif th == 'empty':
                rect(img, 42, yy+3, 72, yy+16, dark(C['ink3'], 0.5))
                out.append(txt(57, yy+6, '?', 5.0, C['gray'], 'cc'))
            elif th == 'sticker':
                rect(img, 42, yy+3, 72, yy+16, dark(C['lilac'], 0.5))
                star(img, 57, yy+9.5, 5.4, C['gold'], 0.44)
                glow(img, 57, yy+9, 12, dark(C['gold'], 0.5), 0.30)
            else:
                rect(img, 42, yy+3, 72, yy+16, dark(C['ink2'], 0.6))
            out.append(txt(78, yy+2, '存档 %d' % (i+1), 3.4,
                           C['cream'] if sel else dark(C['ink3'], 0.8), 'la'))
            info = P.get('slot_text', '2018/08/21 21:37')
            out.append(txt(78, yy+10, info if sel else '— — —', 2.4,
                           C['ink3'] if sel else dark(C['ink3'], 0.5), 'la'))
            if sel:
                cursor_tri(img, 262, yy+6, 7, C['gold'], 'right')
        if P.get('savebar') is not None:
            p = P['savebar']
            rect(img, 90, 152, 230, 156, dark(C['ink3'], 0.7))
            rect(img, 90, 152, 90+int(140*p), 156, C['cyan'])
            if p >= 1.0:
                out.append(txt(160, 158, '存档成功', 4.0, C['cyan'], 'ca'))

    if v == 'mainmenu':
        items = ['继续游戏', '读取存档', '退出']
        for i, s in enumerate(items):
            yy = 90 + i*20
            c = C['cream'] if i == P.get('cursor', 0) else dark(C['ink3'], 0.85)
            out.append(txt(160, yy, s, 5.4, c, 'ca'))
            if i == P.get('cursor', 0):
                cursor_tri(img, 96, yy-2, 9, C['gold'], 'right')
    return out

# ------------------------------------------------------------------ S6 roof
def s_roof(img, lt, dur, P):
    v = P.get('v', 'stars')
    out = []
    if v == 'cloud':
        vband(img, 0, 150, dark(C['ink2'], 0.52), C['ink2'], 4)
    else:
        vband(img, 0, 150, C['ink0'], dark(C['ink2'], 0.72), 5)

    if v != 'cloud':
        stars = [(58, 32), (150, 22), (232, 42)]
        for i, (sx, sy) in enumerate(stars):
            if i < P.get('star_count', 3):
                tw = 0.55 + 0.45*math.sin(lt*2.2 + i*1.7)
                c = mix(C['gold'], C['cream'], 0.25*tw)
                rect(img, sx-1, sy, sx+2, sy+1, c)
                rect(img, sx, sy-1, sx+1, sy+2, c)
                glow(img, sx+0.5, sy+0.5, 7, C['gold'], 0.22*tw)
    else:
        push = P.get('cloud_push', 0.0)
        for i in range(3):
            yy = 8 + i*28 + push*26
            rect(img, -40+push*16*i, yy, 380-push*26*i, yy+20, dark(C['ink2'], 0.40))
        vband(img, 96, 150, dark(C['ink2'], 0.55), C['ink0'], 3)
        bk = P.get('blackout', 0.0)
        if bk > 0:
            rect(img, 0, H*(1-bk), W, H, C['ink0'])

    rect(img, 0, 150, W, H, dark(C['ink2'], 0.46))
    hline(img, 0, W, 149, C['ink3'], 2)
    rect(img, 246, 76, 300, 104, dark(C['ink2'], 0.72))
    rect(img, 244, 72, 302, 78, C['ink3'])
    rect(img, 250, 104, 256, 150, C['ink2'])
    rect(img, 290, 104, 296, 150, C['ink2'])
    for i in range(4):
        hline(img, 246, 300, 76+i*8, dark(C['ink2'], 0.5))
    person(img, 120, 152, 1.30, pose='sit', rim=True)
    glow(img, 120, 122, 26, mix(C['cream'], C['ink3'], 0.6), 0.20)
    spot(img, 150, 110, 80, 240, 0.34)
    if v == 'stars':
        out.append(txt(286, 118, '今晚星星 %d' % P.get('star_count', 3), 4.0, C['gold'], 'ca'))
    return out

# ------------------------------------------------------------------ S7 mirror
def s_mirror(img, lt, dur, P):
    out = []
    v = P.get('v', 'sync')
    vband(img, 0, H, dark(C['ink1'], 0.62), C['ink0'], 4)
    mx0, my0, mx1, my1 = 196, 16, 300, 156
    frame_rect(img, mx0-3, my0-3, mx1+3, my1+3, C['ink3'], 2)
    rect(img, mx0, my0, mx1, my1, dark(C['ink2'], 0.72))
    vband(img, 148, H, dark(C['ink2'], 0.46), dark(C['ink0'], 0.9), 3)

    fog = P.get('fog', 0.0)
    if fog > 0:
        yy, xx = np.mgrid[my0:my1, mx0:mx1]
        b = bayer(H, W)[my0:my1, mx0:mx1]
        d = np.sqrt(((xx-248)/52.0)**2 + ((yy-86)/70.0)**2)
        m = (b < fog*0.9) | ((d > 0.55) & (b < fog))
        sub = img[my0:my1, mx0:mx1]
        sub[m] = mix(sub[m], C['cream'], 0.10)

    person(img, 96, 178, 1.62, pose='stand', rim=True)
    delay = P.get('delay', 0.0)
    dy_off = -2 if delay > 0.05 else 0
    rect(img, mx0, my0, mx1, my1, dark(C['ink2'], 0.9))
    person(img, 248, 158+dy_off, 1.0, pose='stand', rim=False)

    her = P.get('her_face', 0.0)
    if her > 0:
        her_face_closeup(img, 248, 84, 26, mode='eyes_open' if v != 'peel' else 'closed')
        if her < 1.0:
            # 只让脸部边缘碎掉，不把整张脸打成噪点
            yy, xx = np.mgrid[my0:my1, mx0:mx1]
            d = np.sqrt(((xx-248)/34.0)**2 + ((yy-88)/40.0)**2)
            b = bayer(H, W)[my0:my1, mx0:mx1]
            edge = (d > 0.55)
            rng = np.random.RandomState(int(lt*12) % 17)
            r = rng.randint(0, 100, (my1-my0, mx1-mx0))/100.0
            hide = edge & (r > her*0.85) & (b < 0.6)
            sub = img[my0:my1, mx0:mx1]
            sub[hide] = dark(C['ink2'], 0.9)

    cr = P.get('crack', 0.0)
    if cr > 0:
        pts = [(248, 16), (244, 50), (252, 84), (240, 120), (250, 156)]
        n = max(1, int(round((len(pts)-1)*cr)))
        for i in range(n):
            x0p, y0p = pts[i]; x1p, y1p = pts[i+1]
            for k in range(24):
                tt = k/24.0
                xx = int(x0p+(x1p-x0p)*tt + math.sin(tt*9)*1.5)
                yy = int(y0p+(y1p-y0p)*tt)
                if mx0 <= xx < mx1 and my0 <= yy < my1:
                    img[yy, xx] = C['cream']
                    if k % 3 == 0 and xx+2 < mx1:
                        img[yy, xx+2] = dark(C['ink2'], 0.9)

    if P.get('reach', 0) > 0:
        rect(img, 118, 118, 158, 122, C['ink2'])
        disc(img, 160, 120, 4, C['skin'])

    if v == 'peel':
        p = P.get('peel', 0.0)
        # 手机翻过来，抠贴纸
        rect(img, 108, 118, 148, 156, C['ink2'])
        rect(img, 112, 122, 144, 152, dark(C['ink3'], 0.55))
        sx, sy = 128, 130
        k = max(0.0, 1.0-p)
        if k > 0:
            for i in range(10):
                a = -math.pi/2 + i*math.pi/5
                r = 5.4 if i % 2 == 0 else 2.2
                disc(img, sx+math.cos(a)*r, sy+math.sin(a)*r, 1.1, C['gold'])
            glow(img, sx, sy, 13, C['gold'], 0.45*k)
        if p > 0.55:
            disc(img, 160, 128, 3, C['gold'])
        spot(img, 140, 130, 70, 200, 0.42)
    else:
        spot(img, 150, 110, 80, 230, 0.36)
    return out

# ------------------------------------------------------------------ S8 white
def s_white(img, lt, dur, P):
    out = []
    c_top = mix(C['cream'], C['ink3'], 0.05)
    c_bot = mix(C['cream'], C['ink3'], 0.26)
    rect(img, 0, 0, W, H, c_top)
    # 抖动渐变：由上到下逐行增加抖动密度，不出现横向色带
    n = H
    t = (np.arange(n, dtype=np.float32)/max(n-1,1)).reshape(n,1)
    b = bayer(H, W, 0, 0)
    m = t > b
    img[:] = np.where(m[:,:,None], c_bot, c_top)
    rect(img, 0, 148, W, H, mix(C['cream'], C['ink3'], 0.34))
    hline(img, 0, W, 147, mix(C['cream'], C['ink3'], 0.45), 1)
    rect(img, 110, 132, 210, 138, C['ink3'])
    rect(img, 118, 138, 122, 154, dark(C['ink3'], 0.8))
    rect(img, 198, 138, 202, 154, dark(C['ink3'], 0.8))
    x0, y0, x1, y1 = 132, 80, 188, 132
    rect(img, x0-3, y0-3, x1+3, y1+3, C['ink3'])
    rect(img, x0, y0, x1, y1, dark(C['ink0'], 0.85))
    rect(img, 150, 132, 170, 136, dark(C['ink3'], 0.9))
    if P.get('screen_on', True):
        for i in range(3):
            if i <= P.get('lines_shown', 2):
                yy = 90 + i*11
                rect(img, 142, yy, 178, yy+1, mix(C['cream'], C['ink3'], 0.35))
    spot(img, 160, 112, 96, 260, 0.66)
    if P.get('show_menu'):
        items = ['继续游戏', '读取存档', '退出']
        cur = P.get('cursor', -1)
        for i in range(len(items)):
            yy = 86 + i*11
            if i <= P.get('lines_shown', 2):
                rect(img, 142, yy, 178, yy+1, C['ink3'])
            if i == cur:
                out.append(txt(126, yy-2, '▶', 3.0, C['gold'], 'la'))
    return out

SCENES = {
    'room': s_room, 'phone': s_phone, 'street': s_street, 'gate': s_gate,
    'menu': s_menu, 'roof': s_roof, 'mirror': s_mirror, 'white': s_white,
}

def draw_scene(name, img, lt, dur, P):
    fn = SCENES.get(name)
    if fn is None:
        return []
    return fn(img, lt, dur, P) or []

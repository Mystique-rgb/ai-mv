# -*- coding: utf-8 -*-
"""《于是》像素 RPG MV —— 时间轴 + 合成 + 编码"""
import os, sys, math, subprocess, argparse
import numpy as np
from PIL import Image, ImageDraw

from render import (W, H, OW, OH, FPS, TOTAL, SCALE, C, mix, dark, light,
                    new_frame, rect, frame_rect, hline, vline, disc, vgrad, glow, spot,
                    warm_pool, bayer, person, her_face_closeup, font,
                    subtitle_layer, _bbox)
from scenes import draw_scene

MP3 = r"D:\ai音乐mv\其实音乐mv\郑润泽 - 于是.mp3"
OUT = r"D:\ai音乐mv\其实音乐mv\于是-像素RPG读档版.mp4"

# ------------------------------------------------------------------ 字幕
SUBS = [
 (13.48, 21.00, "窗外下着雨 房间里依然很冷清"),
 (21.00, 27.88, "等着你出现 从来没改变"),
 (27.88, 34.83, "昨晚想到你 被寂寞包裹的恐惧"),
 (34.83, 40.89, "等待黎明 等待深爱 的你"),
 (40.89, 47.88, "能不能留下来再陪我数次星星"),
 (47.88, 55.14, "能不能别提起念念不忘的他"),
 (55.14, 63.19, "能不能告诉我你这次离开的各种原因"),
 (63.19, 70.00, "只能和孤独亲密 像小孩想要星星"),
 (70.00, 76.69, "忘不了你我互相的甜蜜"),
 (76.69, 83.86, "是你给我的最后的记忆"),
 (83.86, 88.22, "松开的手再抓不紧"),
 (88.22, 91.98, "等雨后等天晴"),
 (91.98, 98.52, "一起走的路都泥泞 沉睡向往的梦境"),
 (98.52, 105.35, "说来又说去还放不下你"),
 (105.35, 112.86, "最后再求你求你别离去"),
 (112.86, 117.01, "即便现实都已看清"),
 (117.01, 120.96, "镜子两面我破碎又织起"),
 (120.96, 128.32, "倔强的我最后过回了沉溺"),
 (128.32, 131.58, "渐渐两路模糊我视线"),
 (131.58, 134.86, "有一瞬间就将我冻结"),
 (134.86, 142.16, "重新连接的爱却又只能够妥协"),
 (142.16, 146.12, "于是我们又错过了时间"),
 (146.12, 151.98, "乌云密布了整个蓝天"),
 (151.98, 159.24, "忘不了你我互相的甜蜜"),
 (159.24, 166.23, "是你给我的最后的记忆"),
 (166.23, 170.71, "松开的手再抓不紧"),
 (170.71, 174.31, "等雨后等天晴"),
 (174.31, 180.59, "一起走的路都泥泞 沉睡向往的梦境"),
 (180.59, 187.67, "说来又说去还放不下你"),
 (187.67, 194.91, "最后再求你求你别离去"),
 (194.91, 199.20, "即便现实都已看清"),
 (199.20, 202.94, "镜子两面我破碎又织起"),
 (202.94, 232.84, "最后我会承认 无法改变结局"),
]

# ------------------------------------------------------------------ 分镜
SHOTS = [
 dict(id='SH01', t0=0.00,   t1=5.50,   scene='black'),
 dict(id='SH02', t0=5.50,   t1=9.50,   scene='menu',  v='boot'),
 dict(id='SH03', t0=9.50,   t1=13.48,  scene='room',  v='desk', cam=('push',1.12)),
 dict(id='SH04', t0=13.48,  t1=21.00,  scene='room',  v='window', hud=1),
 dict(id='SH05', t0=21.00,  t1=27.88,  scene='street',v='look',   cam=('tilt',), hud=0),
 dict(id='SH06', t0=27.88,  t1=34.83,  scene='room',  v='floor',  hud=1, read=3),
 dict(id='SH07', t0=34.83,  t1=40.89,  scene='room',  v='steam',  hud=1, steam=True, cam=('fix',)),
 dict(id='SH08', t0=40.89,  t1=47.88,  scene='roof',  v='stars',  hud=1, read=6, stars=True),
 dict(id='SH09', t0=47.88,  t1=55.14,  scene='phone', v='contact', hud=0),
 dict(id='SH10', t0=55.14,  t1=63.19,  scene='phone', v='typing', hud=0, draft=True),
 dict(id='SH11', t0=63.19,  t1=70.00,  scene='phone', v='back',   hud=0, insert=True),
 dict(id='SH12', t0=70.00,  t1=73.20,  scene='room',  v='tv2',    hud=1, read=19, cg=True),
 dict(id='SH13', t0=73.20,  t1=76.69,  scene='room',  v='tv2close', hud=1, cg=True, cam=('push',1.40)),
 dict(id='SH14', t0=76.69,  t1=83.86,  scene='menu',  v='slots',  hud=0, thumb='her'),
 dict(id='SH15', t0=83.86,  t1=88.22,  scene='gate',  v='turnback', hud=0),
 dict(id='SH16', t0=88.22,  t1=91.98,  scene='street',v='puddle', hud=0),
 dict(id='SH17', t0=91.98,  t1=98.52,  scene='street',v='footprint', hud=1, read=31),
 dict(id='SH18', t0=98.52,  t1=105.35, scene='phone', v='chat',   hud=0, menu=True),
 dict(id='SH19', t0=105.35, t1=112.86, scene='gate',  v='bench',  hud=1, read=44, dialog=True),
 dict(id='SH20', t0=112.86, t1=117.01, scene='mirror',v='sync',   hud=0),
 dict(id='SH21', t0=117.01, t1=120.96, scene='mirror',v='crack',  hud=0),
 dict(id='SH22', t0=120.96, t1=124.20, scene='mirror',v='her',    hud=0),
 dict(id='SH23', t0=124.20, t1=128.32, scene='room',  v='screen', hud=1, roll=True),
 dict(id='SH24', t0=128.32, t1=131.58, scene='street',v='run',    hud=0),
 dict(id='SH25', t0=131.58, t1=134.86, scene='street',v='frozen', hud=0),
 dict(id='SH26', t0=134.86, t1=142.16, scene='phone', v='call',   hud=0),
 dict(id='SH27', t0=142.16, t1=146.12, scene='gate',  v='clockjump', hud=1, b1=True),
 dict(id='SH28', t0=146.12, t1=151.98, scene='roof',  v='cloud',  hud=0),
 dict(id='SH29', t0=151.98, t1=159.24, scene='room',  v='tvempty',hud=1),
 dict(id='SH30', t0=159.24, t1=166.23, scene='menu',  v='slots',  hud=0, thumb='empty'),
 dict(id='SH31', t0=166.23, t1=170.71, scene='gate',  v='bench',  hud=0, reach=True),
 dict(id='SH32', t0=170.71, t1=174.31, scene='gate',  v='drop',   hud=0),
 dict(id='SH33', t0=174.31, t1=180.59, scene='street',v='flashlight', hud=0),
 dict(id='SH34', t0=180.59, t1=187.67, scene='phone', v='typed',  hud=0),
 dict(id='SH35', t0=187.67, t1=194.91, scene='gate',  v='bench',  hud=0, putdown=True),
 dict(id='SH36', t0=194.91, t1=199.20, scene='phone', v='offline',hud=0, b2=True),
 dict(id='SH37', t0=199.20, t1=202.94, scene='mirror',v='peel',   hud=0),
 dict(id='SH38', t0=202.94, t1=207.50, scene='menu',  v='save',   hud=0, thumb='sticker'),
 dict(id='SH39', t0=207.50, t1=213.00, scene='white', v='menu',   hud=0),
 dict(id='SH40', t0=213.00, t1=219.00, scene='white', v='cursor', hud=0),
 dict(id='SH41', t0=219.00, t1=224.00, scene='expired'),
 dict(id='SH42', t0=224.00, t1=229.00, scene='black'),
 dict(id='SH43', t0=229.00, t1=232.84, scene='black'),
]

def shot_at(t):
    for s in SHOTS:
        if s['t0'] <= t < s['t1']:
            return s
    return SHOTS[-1]

def readsave(t):
    """读档计数：按分镜推进，SH23 内暴涨到 163 后冻结"""
    v = 0
    for s in SHOTS:
        if t < s['t0']: break
        if 'read' in s: v = s['read']
        if s['id'] == 'SH03': v = 1
        if s.get('roll'):
            lt = t - s['t0']
            prog = min(1.0, max(0.0, (lt-0.3)/2.2))
            v = int(44 + (163-44)*(prog**0.62))
            if t >= s['t1']: v = 163
    if t >= 124.20: v = 163
    return v

# ------------------------------------------------------------------ 相机
def apply_cam(frame, kind, z, ox=0, oy=0):
    if kind == 'fix' and z == 1.0 and ox == 0 and oy == 0:
        return frame
    cw = W / z; ch = H / z
    cx = W/2 + ox; cy = H/2 + oy
    x0 = int(round(np.clip(cx - cw/2, 0, W-cw)))
    y0 = int(round(np.clip(cy - ch/2, 0, H-ch)))
    sub = frame[y0:y0+int(round(ch)), x0:x0+int(round(cw))]
    im = Image.fromarray(sub)
    im = im.resize((W, H), Image.NEAREST)
    return np.array(im, copy=True)

# ------------------------------------------------------------------ 文字项归一化
def norm(it):
    return dict(x=float(it['x']), y=float(it['y']), s=it['text'], size=float(it['size']),
                col=np.asarray(it['color'], np.uint8), align=it['align'], shadow=it['shadow'])

def paste(canvas, img, x, y):
    if img is None: return
    canvas.paste(img, (int(x), int(y)), img)

def draw_tri(canvas, x, y, size, col):
    """画一个小三角光标（320 坐标）"""
    d = ImageDraw.Draw(canvas)
    n = max(2, int(round(size)))
    cx = x*SCALE; cy = y*SCALE
    s = n*SCALE
    pts = [(cx, cy-s*0.55), (cx+s*0.62, cy), (cx, cy+s*0.55)]
    d.polygon(pts, fill=(int(col[0]), int(col[1]), int(col[2]), 255))

def draw_items(canvas, items):
    for it in items:
        if 'tri' in it:
            tx, ty, ts, tc = it['tri']
            draw_tri(canvas, tx, ty, ts, tc)
            continue
        it = norm(it)
        sub_canvas = Image.new('RGBA', canvas.size, (0,0,0,0))  # not used
        # 直接画到 RGBA 层再合成
        layer = Image.new('RGBA', (1,1))
        # 用临时大图层代价高，改为按字形尺寸绘制
        s = it['s']; px = max(2.0, it['size'])
        fsize = max(6, int(round(px*3)))
        d0 = ImageDraw.Draw(canvas)
        tw, th, bb = _bbox(d0, s, fsize)
        x = it['x']*SCALE; y = it['y']*SCALE
        if it['align'][0] == 'c': x -= tw
        elif it['align'][0] == 'r': x -= tw*2
        if it['align'][1] == 'c': y -= th
        elif it['align'][1] == 'b': y -= th*2
        pad = 6
        tmp = Image.new('RGBA', (tw+pad*2, th+pad*2), (0,0,0,0))
        dt = ImageDraw.Draw(tmp)
        ox, oy = pad-bb[0], pad-bb[1]
        if it['shadow']:
            dt.text((ox+2, oy+2), s, font=font(fsize), fill=(4,6,12,215))
            dt.text((ox+1, oy+2), s, font=font(fsize), fill=(4,6,12,110))
        c = tuple(int(v) for v in it['col'])
        dt.text((ox, oy), s, font=font(fsize), fill=(c[0],c[1],c[2],255))
        tmp = tmp.resize((tmp.width*2, tmp.height*2), Image.NEAREST)
        paste(canvas, tmp, x-pad*2, y-pad*2)

# ------------------------------------------------------------------ HUD
def hud_items(P, t, s):
    items = []
    if not P.get('hud'): return items
    v = readsave(t)
    items.append(dict(x=8, y=6, text='主线：' + ('该任务已过期' if t >= 142.16 else '等她上线'),
                      size=5.0, color=(C['red'] if t >= 142.16 else C['cream']),
                      align='la', shadow=True))
    items.append(dict(x=312, y=6, text='读档 ×%04d' % v, size=5.0, color=C['cream'],
                      align='ra', shadow=True))
    items.append(dict(x=8, y=170, text='2018·08·21  21:' + ('38' if t >= 142.16 else '37'),
                      size=4.6, color=mix(C['cream'], C['ink3'], 0.25), align='la', shadow=True))
    if P.get('cg'):
        items.append(dict(x=8, y=15, text='过场 CG · 08/21', size=4.2, color=C['gray'],
                          align='la', shadow=True))
        items.append(dict(tri=(13, 16, 4, C['gray'])))
    if P.get('stars'):
        items.append(dict(x=312, y=15, text='今晚星星 3', size=4.2,
                          color=mix(C['gold'], C['cream'], 0.15), align='ra', shadow=True))
    if s['id'] == 'SH27':
        items.append(dict(x=160, y=6, text='21:37 → 21:38', size=5.0, color=C['red'],
                          align='ca', shadow=True))
    return items

# ------------------------------------------------------------------ 单镜绘制
def build_params(s, lt, dur):
    P = {}
    for k in ('v','hud','cg','stars','thumb','dialog','reach','putdown','read','roll','insert',
              'menu','draft','b1','b2','steam'):
        if k in s: P[k] = s[k]
    sid = s['id']

    if sid == 'SH02':
        P['boot'] = min(1.0, lt/0.75)
        if lt >= 0.9:
            P['boot'] = None
            P['v'] = 'slots'
            P['thumb'] = 'her'
    if sid == 'SH03':
        P['led'] = min(1.0, max(0.0, (lt-2.0)/0.5))
        P['lamp'] = True
    if sid == 'SH04':
        P['lamp'] = True
    if sid == 'SH05':
        P['dark_window_focus'] = min(1.0, lt/2.0)
    if sid == 'SH06':
        P['phone_on'] = 0.55 + 0.45*abs(math.sin(lt*1.05))
    if sid == 'SH07':
        seq = ['21:37','23:40','02:15','04:50']
        P['steam_val'] = seq[min(3, int(lt/(dur/4)))]
        P['lamp'] = lt < dur*0.5
    if sid == 'SH08':
        P['star_count'] = 3
    if sid == 'SH09':
        P['bubbles'] = []
    if sid == 'SH10':
        n = int(max(0, min(6, lt*1.6)))
        txt = '你这次……'[:n]
        P['draft'] = txt
        P['cursor'] = True
        P['typing'] = lt < 2.5
        P['bubbles'] = []
    if sid == 'SH11':
        if lt < 0.9:
            P['insert'] = lt
        else:
            P['insert'] = None
        P['sticker'] = 1.0
        P['bubbles'] = []
    if sid == 'SH12':
        P['bubbles'] = []
    if sid == 'SH14':
        P['slot_text'] = '2018/08/21 21:37'
    if sid == 'SH15':
        P['look_back'] = 1.0 if 1.6 < lt < 2.9 else 0.0
    if sid == 'SH16':
        P['reflection_gone'] = 1.0 if lt > dur*0.45 else 0.0
    if sid == 'SH17':
        P['fp_second_until'] = max(0, 9 - int(lt*1.6))
    if sid == 'SH18':
        P['bubbles'] = [('r','那年夏天'), ('l','嗯')]
        P['unsent'] = '未发送 1'
        P['draft'] = ''
    if sid == 'SH19':
        n = int(max(0, min(5, (lt-0.5)*3)))
        P['dialog'] = '别再走了。'[:n]
    if sid == 'SH20':
        P['delay'] = 0.4 if lt < dur*0.7 else 0.0
        P['fog'] = 0.45 - 0.15*min(1.0, lt/2)
    if sid == 'SH21':
        p = lt/dur
        P['crack'] = min(1.0, p/0.55) if p < 0.62 else max(0.0, 1.0-(p-0.62)/0.38)
        P['fog'] = 0.2
    if sid == 'SH22':
        p = lt/dur
        P['her_face'] = min(1.0, p/0.45)
        if p > 0.72:
            P['her_face'] = max(0.0, 1.0-(p-0.72)/0.28)
        P['fog'] = 0.55 if p > 0.72 else 0.10
        P['reach'] = 1 if 0.35 < p < 0.72 else 0
    if sid == 'SH23':
        P['b1'] = 0.0
    if sid == 'SH25':
        P['frozen'] = True
    if sid == 'SH26':
        P['call_state'] = 'fail' if lt > 3.5 else 'connecting'
    if sid == 'SH27':
        p = lt/dur
        P['clock'] = '21:38' if p > 0.18 else '21:37'
        P['b1'] = 1.0 if p > 0.18 else 0.0
    if sid == 'SH28':
        P['cloud_push'] = min(1.0, lt/dur)
        P['blackout'] = max(0.0, (lt-(dur-1.2))/1.2)*0.55
    if sid == 'SH30':
        P['thumb'] = 'empty'
    if sid == 'SH31':
        P['v'] = 'bench'
    if sid == 'SH35':
        P['controller_down'] = lt > 1.0
        P['led_gray'] = min(1.0, max(0.0, (lt-1.4)/1.5))
    if sid == 'SH36':
        p = lt/dur
        P['her_gray'] = p > 0.55
        P['bubbles'] = [('r','那年夏天')]
        P['unsent'] = None if p > 0.62 else '未发送 1'
    if sid == 'SH37':
        P['fog'] = 0.0
        P['peel'] = min(1.0, lt/2.2)
    if sid == 'SH38':
        P['savebar'] = min(1.0, max(0.0, (lt-0.7)/1.2))
        P['thumb'] = 'sticker'
    if sid == 'SH39':
        P['show_menu'] = True
        P['lines_shown'] = min(2, int(lt/0.3))
        P['cursor'] = -1
    if sid == 'SH40':
        P['show_menu'] = True
        P['lines_shown'] = 2
        P['cursor'] = 2 if lt > 0.4 else 1
    return P

def render_frame(t):
    s = shot_at(t)
    lt = t - s['t0']
    dur = s['t1'] - s['t0']
    P = build_params(s, lt, dur)
    items = []

    if s['scene'] == 'black':
        frame = np.zeros((H, W, 3), np.uint8)
        frame[:] = C['ink0']
    elif s['scene'] == 'expired':
        frame = np.zeros((H, W, 3), np.uint8)
        frame[:] = C['ink0']
    else:
        frame = new_frame()
        items += draw_scene(s['scene'], frame, lt, dur, P)

    # 相机
    cam = s.get('cam')
    if cam:
        if cam[0] == 'push':
            z = 1.0 + (cam[1]-1.0)*min(1.0, lt/max(dur,0.01))
            frame = apply_cam(frame, 'fix', z)
        elif cam[0] == 'tilt':
            oy = -6.0*min(1.0, lt/4.0)
            frame = apply_cam(frame, 'fix', 1.10, 0, oy)
        elif cam[0] == 'fix':
            frame = apply_cam(frame, 'fix', 1.0)
    if s['id'] == 'SH13':
        # 正脸特写：直接叠她的脸
        p = min(1.0, lt/dur)
        her_face_closeup(frame, 196, 96, 30, mode='closed')

    # 放大到 1080p
    up = np.repeat(np.repeat(frame, SCALE, axis=0), SCALE, axis=1)
    canvas = Image.fromarray(up, 'RGB').convert('RGBA')

    # ---- 黑场/特殊
    sid = s['id']
    if sid == 'SH01':
        items.append(dict(x=160, y=76, text='第 163 次读档', size=20, color=C['cream'], align='cc', shadow=True))
        items.append(dict(x=160, y=104, text='游戏是他做的。她只出现在过场里。', size=7.2,
                          color=C['ink3'], align='cc', shadow=True))
        items.append(dict(x=160, y=118, text='—————', size=6, color=C['ink2'], align='cc', shadow=False))
    if sid == 'SH41':
        # 先全黑，后手机亮
        p = lt
        items = []
        if p > 0.8:
            a = min(1.0, (p-0.8)/1.5)
            ph = np.zeros((H, W, 3), np.uint8); ph[:] = C['ink0']
            rect(ph, 116, 14, 204, 148, C['ink1'])
            rect(ph, 119, 19, 201, 143, mix(dark(C['cream'], 0.15), C['cream'], a))
            ph = ph.astype(np.uint8)
            up2 = np.repeat(np.repeat(ph, SCALE, axis=0), SCALE, axis=1)
            canvas = Image.fromarray(up2, 'RGB').convert('RGBA')
            items.append(dict(x=160, y=74, text='已过期 · 无法发送', size=9.6,
                              color=mix(C['ink3'], C['cream'], a*0.2), align='cc', shadow=True))
            items.append(dict(x=160, y=98, text='未发送 1', size=4.6, color=dark(C['ink3'], 0.7),
                              align='cc', shadow=True))
    if sid == 'SH42':
        items = []
        if lt > 3.0:
            items.append(dict(x=160, y=88, text='第 164 次，他没有读档。', size=9.0,
                              color=C['ink3'], align='cc', shadow=True))
    if sid == 'SH43':
        items = [dict(x=160, y=74, text='于是', size=26, color=C['cream'], align='cc', shadow=True),
                 dict(x=160, y=110, text='郑润泽 · 2018', size=6.4, color=C['ink3'], align='cc', shadow=True),
                 dict(x=160, y=124, text='像素版 MV', size=5.0, color=C['ink2'], align='cc', shadow=True)]

    # HUD
    if sid not in ('SH01','SH02','SH41','SH42','SH43'):
        for h in hud_items(P, t, s):
            items.append(h)

    # 过场插入（SH11 的 0.9s）
    if sid == 'SH11' and P.get('insert') is not None:
        p = P['insert']/0.9
        # duotone 闪回帧
        f2 = new_frame(dark(C['ink0'], 0.9))
        vgrad(f2, 0, H, np.array([0x16,0x08,0x10],np.uint8), np.array([0x2A,0x12,0x1E],np.uint8))
        her_face_closeup(f2, 160, 84, 34, mode='smile')
        person(f2, 232, 176, 1.6, her=True, hair='long', pose='stand')
        up2 = np.repeat(np.repeat(f2, SCALE, axis=0), SCALE, axis=1)
        canvas = Image.fromarray(up2, 'RGB').convert('RGBA')
        items = [dict(x=8, y=15, text='过场 CG · 08/21', size=4.2, color=C['gray'],
                      align='la', shadow=True),
                 dict(tri=(13, 16, 4, C['gray']))]
        if p > 0.85:
            pass

    draw_items(canvas, items)

    # 字幕
    sub = None
    for (a, b, s_) in SUBS:
        if a - 0.10 <= t < b - 0.05:
            sub = s_; break
    if sub:
        img = subtitle_layer(sub)
        x = (OW - img.width)//2
        y = OH - img.height - 58
        paste(canvas, img, x, y)

    return canvas.convert('RGB')

# ------------------------------------------------------------------ 预览
def preview(times):
    outdir = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'preview')
    os.makedirs(outdir, exist_ok=True)
    for tt in times:
        im = render_frame(tt)
        p = os.path.join(outdir, 'f_%07.2f.png' % tt)
        im.save(p)
        print(p)

# ------------------------------------------------------------------ 全片
def render_all(start=0.0, end=TOTAL, out=OUT, fps=FPS):
    n = int(round((end-start)*fps))
    cmd = ['ffmpeg','-y','-hide_banner','-loglevel','error',
           '-f','rawvideo','-pix_fmt','rgb24','-s','%dx%d'%(OW,OH),'-r',str(fps),
           '-i','-','-ss','%.3f'%start,'-t','%.3f'%(end-start),'-i',MP3,
           '-c:v','libx264','-preset','veryfast','-crf','17','-pix_fmt','yuv420p',
           '-c:a','aac','-b:a','192k','-shortest','-movflags','+faststart', out]
    pr = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for i in range(n):
        t = start + i/fps
        im = render_frame(t)
        pr.stdin.write(im.tobytes())
        if i % 120 == 0:
            print('frame %d/%d  t=%.2fs' % (i, n, t), flush=True)
    pr.stdin.close()
    pr.wait()
    print('done ->', out)

if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--preview', type=str, default=None)
    ap.add_argument('--start', type=float, default=0.0)
    ap.add_argument('--end', type=float, default=TOTAL)
    ap.add_argument('--out', type=str, default=OUT)
    a = ap.parse_args()
    if a.preview:
        preview([float(x) for x in a.preview.split(',')])
    else:
        render_all(a.start, a.end, a.out)

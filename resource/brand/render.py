#!/usr/bin/env python3
"""Rebuild WnC SVG/PNG assets with Pillow; writes only beside this script.
Usage: python3 resource/brand/render.py [--font /path/to/Korean-Bold.ttf]
"""
from pathlib import Path
import argparse
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
BLUE = '#0346FF'
DEEP = '#002B99'
WHITE = '#FFFFFF'
AA = 3
POINTS = [(207, 387), (322, 677), (487, 457), (602, 677), (817, 347)]
STROKE = 108
FONT_FAMILY = "Pretendard, 'Apple SD Gothic Neo', sans-serif"
TITLE = 'WnC 그룹웨어'

def mark_svg(cx=512, cy=512, scale=1, color=BLUE):
    points = ' '.join(f'{cx+(x-512)*scale:g},{cy+(y-512)*scale:g}' for x,y in POINTS)
    return f'<polyline points="{points}" fill="none" stroke="{color}" stroke-width="{STROKE*scale:g}" stroke-linecap="round" stroke-linejoin="round"/>'

def text_svg(text, x, baseline, size, color, centered=True):
    anchor = 'middle' if centered else 'start'
    return f'<text x="{x}" y="{baseline}" text-anchor="{anchor}" font-family="{FONT_FAMILY}" font-size="{size}" font-weight="700" fill="{color}">{text}</text>'

def save_svg(name, width, height, body, title):
    (ROOT/name).write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img" aria-label="{title}">
<title>{title}</title>
{body}
</svg>\n''', encoding='utf-8')

GRADIENT = f'''<defs><linearGradient id="brand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{BLUE}"/><stop offset="1" stop-color="{DEEP}"/></linearGradient></defs>'''

def make_svgs():
    save_svg('logo-symbol.svg',1024,1024,mark_svg(), 'WnC 연결 체크 심벌')
    save_svg('logo-horizontal.svg',1760,400,
             mark_svg(210,200,.46)+ '\n'+text_svg(TITLE,450,255,180,BLUE,False),TITLE)
    # Full bleed square: platform launchers apply their own corner masks.
    save_svg('app-icon.svg',1024,1024,
             f'<rect width="1024" height="1024" fill="{BLUE}"/>\n'+mark_svg(scale=.98,color=WHITE),TITLE+' 앱 아이콘')
    save_svg('splash.svg',1284,2778,
             GRADIENT+'\n<rect width="1284" height="2778" fill="url(#brand)"/>\n'
             +mark_svg(642,1160,.98,WHITE)+'\n'
             +text_svg(TITLE,642,1540,104,WHITE)+'\n'
             +text_svg('WordnCode',642,2610,40,WHITE),TITLE+' 시작 화면')

def canvas(w,h,background=None):
    return Image.new('RGBA',(w*AA,h*AA),background or (0,0,0,0))

def draw_mark(im,cx=512,cy=512,scale=1,color=WHITE):
    draw=ImageDraw.Draw(im)
    pts=[((cx+(x-512)*scale)*AA,(cy+(y-512)*scale)*AA) for x,y in POINTS]
    width=round(STROKE*scale*AA)
    draw.line(pts,fill=color,width=width,joint='curve')
    radius=width/2
    # Explicit disks make every vertex and end match SVG round joins/caps.
    for x,y in pts:
        draw.ellipse((x-radius,y-radius,x+radius,y+radius),fill=color)

def save_png(im,name,size,opaque=False):
    im=im.resize(size,Image.Resampling.LANCZOS)
    if opaque:
        im=im.convert('RGB')
    im.save(ROOT/name,optimize=True)

def draw_text(im,text,x,baseline,size,font_path,font_index):
    font=ImageFont.truetype(str(font_path),round(size*AA),index=font_index)
    draw=ImageDraw.Draw(im)
    length=draw.textlength(text,font=font)
    draw.text((x*AA-length/2,baseline*AA),text,font=font,fill=WHITE,anchor='ls')

def make_pngs(font_path,font_index):
    icon=canvas(1024,1024,BLUE)
    draw_mark(icon,scale=.98)
    for name,size in [('icon-1024.png',1024),('favicon-48.png',48),('favicon-192.png',192),('apple-touch-icon-180.png',180)]:
        save_png(icon,name,(size,size),True)
    for name,scale in [('adaptive-foreground-1024.png',.78),('adaptive-monochrome-1024.png',.78),('splash-icon-1024.png',.85)]:
        im=canvas(1024,1024)
        draw_mark(im,scale=scale)
        save_png(im,name,(1024,1024))
    im=canvas(1284,2778)
    draw=ImageDraw.Draw(im)
    a=(3,70,255); b=(0,43,153)
    for y in range(im.height):
        t=y/(im.height-1)
        color=tuple(round(u+(v-u)*t) for u,v in zip(a,b))+(255,)
        draw.line((0,y,im.width,y),fill=color)
    draw_mark(im,642,1160,.98)
    draw_text(im,TITLE,642,1540,104,font_path,font_index)
    draw_text(im,'WordnCode',642,2610,40,font_path,font_index)
    save_png(im,'splash-1284x2778.png',(1284,2778),True)

def verify():
    expected={'icon-1024.png':(1024,1024),'adaptive-foreground-1024.png':(1024,1024),
              'adaptive-monochrome-1024.png':(1024,1024),'splash-icon-1024.png':(1024,1024),
              'splash-1284x2778.png':(1284,2778),'favicon-48.png':(48,48),
              'favicon-192.png':(192,192),'apple-touch-icon-180.png':(180,180)}
    for name,size in expected.items():
        with Image.open(ROOT/name) as im:
            im.load()
            assert im.size==size,(name,im.size)
            if name.startswith('adaptive-') or name.startswith('splash-icon-'):
                assert im.mode=='RGBA'
                bounds=im.getchannel('A').getbbox()
                if name.startswith('adaptive-'):
                    assert bounds[0]>=174 and bounds[1]>=174 and bounds[2]<=850 and bounds[3]<=850,bounds
                print(f'OK {name}: {im.size}, {im.mode}, mark bounds={bounds}')
            else:
                assert im.mode=='RGB'
                print(f'OK {name}: {im.size}, opaque RGB')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--font',type=Path,help='Korean-capable bold TTF/OTF/TTC')
    parser.add_argument('--font-index',type=int,default=None)
    args=parser.parse_args()
    font=args.font or Path('/System/Library/Fonts/AppleSDGothicNeo.ttc')
    index=args.font_index if args.font_index is not None else (6 if args.font is None else 0)
    if not font.is_file():
        parser.error('Supply a Korean bold font with --font (and --font-index for TTC).')
    make_svgs()
    make_pngs(font,index)
    verify()

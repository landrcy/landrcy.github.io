# Blackhole F v5 — Allura F, smooth rim, solid black core, smooth wave glitch intro.
import numpy as np,random,math
from PIL import Image,ImageDraw,ImageFont
N=240;SC=2;INTRO=14;LOOP=48;FR=INTRO+LOOP;TAU=2*math.pi
font=ImageFont.truetype('/usr/share/fonts/truetype/sand-box/google/Allura/Allura-Regular.ttf',150)
B8=np.array([[0,32,8,40,2,34,10,42],[48,16,56,24,50,18,58,26],[12,44,4,36,14,46,6,38],[60,28,52,20,62,30,54,22],
 [3,35,11,43,1,33,9,41],[51,19,59,27,49,17,57,25],[15,47,7,39,13,45,5,37],[63,31,55,23,61,29,53,21]])/64-.5
PAL=np.array([(4,1,10),(18,4,34),(40,8,72),(72,10,110),(110,8,48),(160,14,52),(120,50,200),(200,40,70),(255,70,90),(255,150,170),(255,180,200)],np.uint8)
# fit Allura F inside core: render big, crop bbox, scale to fit ~0.68*2R box, center
big=Image.new('L',(600,600));ImageDraw.Draw(big).text((300,300),'F',font=ImageFont.truetype('/usr/share/fonts/truetype/sand-box/google/Allura/Allura-Regular.ttf',420),fill=255,anchor='mm',stroke_width=9,stroke_fill=255)
big=big.crop(big.getbbox());bw,bh_=big.size;k=min(66/bw,70/bh_);big=big.resize((max(1,round(bw*k)),max(1,round(bh_*k))),Image.LANCZOS)
m=Image.new('L',(N,N));m.paste(big,(N//2-big.size[0]//2,N//2-big.size[1]//2));F=np.array(m)>110
def sh(a,dy,dx): return np.roll(np.roll(a,dy,0),dx,1)
yy,xx=np.mgrid[0:N,0:N]+.5;c=N/2;dx,dy=xx-c,yy-c;r=np.hypot(dx,dy);A=np.arctan2(dy,dx);R=50
D=B8[(yy.astype(int)%8),(xx.astype(int)%8)]
frames=[]
for f in range(FR):
 t=(f%LOOP)/LOOP*TAU;rnd=random.Random(f*13+5)
 # lensing: warp radius near horizon, angle swirl grows inward
 rw=r-R*R*0.55/np.maximum(r,1)+R*0.55
 wob=1+0.04*np.sin(A*5+t*2)+0.02*np.sin(A*9-t*3)
 rd=np.hypot(dx,dy/0.30)*wob
 sw=A*1+ 60/np.maximum(rd,1)
 arms=0.5+0.5*np.sin(sw*4-rd*.18+t*4)*np.sin(A*7+rd*.07-t*2)
 disk=np.clip(1-np.abs(rd-92)/30,0,1)**.8*(0.35+0.75*arms)
 front=dy>0;behind=(dy<0)&(r<R+10)&(np.abs(dx)<R+4);sm=np.clip(dy/12+.5,0,1);bh=np.clip((R+10-r)/6,0,1)*np.clip((R+4-np.abs(dx))/6,0,1)*(1-sm);disk=disk*(1-0.85*bh)
 # lensed upper/lower arc (disk image bent over hole)
 arc=np.clip(1-np.abs(rw-R-14)/7,0,1)*(0.6+0.4*np.sin(A*6+t*4))*np.clip(1-np.abs(np.abs(dy)/np.maximum(r,1)-0.9)*1.4,0,1)
 ring=np.clip(1-np.abs(r-R-2.5)/3.2,0,1)*(0.85+0.15*np.sin(A*3-t*4))
 halo=np.clip(1-(r-R)/95,0,1)**2*0.45*(0.8+0.2*np.sin(A*11+t*3+r*.2))
 streak=0*np.clip(1-(r-R)/60,0,1)*np.clip(np.sin(A*23+r*.35-t*6)*2-1.5,0,1)*0.5
 v=np.maximum.reduce([disk*(0.9+0.25*sm),arc,ring*1.05,halo,streak])
 v=np.clip(v,0,1)
 x=v*(len(PAL)-1);i0=np.clip(np.floor(x).astype(int),0,len(PAL)-2);fr=(x-i0)[...,None]
 img=np.zeros((N,N,4),np.uint8);img[...,:3]=(PAL[i0]*(1-fr)+PAL[i0+1]*fr).astype(np.uint8);img[...,3]=np.where(v<.05,0,np.clip(v/.15*255,0,255)).astype(np.uint8)
 # monster maw: void core with crimson rim teeth
 core=r<R
 img[core]=(0,0,0,255)
 rg=np.clip(1-np.abs(r-R)/2.2,0,1)[...,None];band=(r>R-3)&(r<R+3)
 img[band,:3]=(img[band,:3]*(1-rg[band])+np.array([235,30,56])*rg[band]).astype(np.uint8);img[band,3]=255
 if 0: rim=np.clip(1-np.abs(r-(R-2.5))/2.5,0,1)[...,None];m2=(r>=R-5)&(r<R);img[m2,:3]=((1-rim)*np.array([2,0,5])+rim*np.array([150,10,36]))[m2].astype(np.uint8)
 # inner eye glint
 # engraved F
 s=f
 if True:
  intro=f<INTRO;burst=False;p=min(1,f/(INTRO-2))  # 0..1 settle progress
  rg_=random.Random(f*7+1);yv=np.arange(N)
  shift=np.zeros(N,int)
  if intro:
   amp=(1-p)**1.5*38;y0=0
   while y0<N:
    h=rg_.randint(3,9);shift[y0:y0+h]=int(rg_.uniform(-1,1)*amp);y0+=h
  Fs=np.stack([np.roll(F[y],shift[y]) for y in range(N)])
  if intro:
   nz=np.random.default_rng(f).random((N,N));Fs&=nz<(0.25+0.85*p)
   vs=int((1-p)*10*rg_.choice([-1,1]));Fs=np.roll(Fs,vs,0)
  Fs&=(r<R-3)
  def S(a,b,c2): return np.stack([np.roll(np.roll(F,a,0)[y],shift[y]+b) for y in range(N)]) if True else None
  inUL=S(1,1,0);inUL2=S(2,2,0);inDR=S(-1,-1,0);inR=S(0,-1,0);inL=S(0,1,0);inU=S(1,0,0)
  col=np.zeros((N,N,3),np.uint8);d=((xx-c)+(yy-c))/120
  col[...,0]=(150+40*d).clip(0,255);col[...,1]=(40+20*d).clip(0,255);col[...,2]=(210+30*d).clip(0,255)
  col[(~inL)|(~inU)]=(12,0,18)
  col[(~inDR)|(~inR)]=(235,40,64)
  col[inUL&~inUL2]=(0,0,0)
  hi=(~sh(F,2,2))&F; 
  if burst:
   nz=np.random.default_rng(f).random((N,N))
   pal=np.array([(255,60,80),(192,77,240),(110,30,170),(0,0,0)],np.uint8)
   col=np.where((nz<.07)[...,None],pal[(nz*1000).astype(int)%4],col)
   # RGB split
   sh_r=np.roll(Fs,3,1)&~Fs;sh_b=np.roll(Fs,-3,1)&~Fs
   img[sh_r&(r<R+12)]=(255,30,60,255);img[sh_b&(r<R+12)]=(110,50,255,255)
  img[Fs]=np.concatenate([col,np.full((N,N,1),255,np.uint8)],2)[Fs]
 frames.append(Image.fromarray(img).resize((N*SC,N*SC),Image.NEAREST))
frames[INTRO+6].save('blackhole-f.png')
st=Image.new('RGBA',(N*FR,N));[st.paste(fr.resize((N,N),Image.NEAREST),(i*N,0)) for i,fr in enumerate(frames)];st.save('strip.png')
frames[0].save('blackhole-f.gif',save_all=True,append_images=frames[1:],duration=60,loop=0,disposal=2,transparency=0)

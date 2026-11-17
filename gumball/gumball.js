/* Laverse gumball machine (pixel art): an all-glass machine with gold fittings. The planets are the hub's own planet painters,
   pre-rendered to p48/p64/p96/p160/p384/*.png. Everything is drawn into a low-res canvas and upscaled by an integer factor. */
(()=>{'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)');
// id, name, link (same as the hub's Play/link), accent (hub theme / tint colour). Cooper City is left out on purpose.
const PL=[
 ['ashaad','The Binding of Ashaad','https://landrcy.github.io/binding-of-ashaad/','#ffd23a'],
 ['sea','Sea of Thought','https://landrcy.github.io/sea-of-thought/','#48cae4'],
 ['yt','LLC Powered Channels','/youtube/','#ff0033'],
 ['void','The Void','https://landrcy.github.io/the-void/','#c04df0'],
 ['pmuseum','Pixel Museum','https://landrcy.github.io/pixel-museum/','#3ad8e0'],
 ['aiquiz','AI Quiz','https://landrcy.github.io/ai-quiz/','#57f0ff'],
 ['typefall','typefall','/typefall/','#1b1d22'],
 ['mine','MINE','https://landrcy.github.io/mine/','#ffd23a'],
 ['ttt','Talk to Tung','/ttt/','#b07a3a'],
 ['lan4drcy','lan4drcy','/lan4drcy/','#3fc8f0'],
 ['lsu','Lsu','/lsu/','#ff3d7f'],
 ['escapeca','Escape CA','https://landrcy.github.io/escape-ca/','#ff3a4a'],
 ['terra','Terra','https://landrcy.github.io/terra/','#c4a05a'],
 ['wam','W.A.M.','https://landrcy.github.io/wam/','#8a8a96']];
const cv=document.getElementById('gm'),G2D=cv.getContext('2d'),btn=document.getElementById('spin'),pop=document.getElementById('pop'),pimg=document.getElementById('pimg'),pname=document.getElementById('pname'),pgo=document.getElementById('pgo'),again=document.getElementById('again');
document.getElementById('sites').innerHTML=PL.map(p=>`<a href="${p[2]}">${p[1]}</a>`).join('');
let g=G2D;
// machine geometry (machine units; origin = globe centre)
const G=150,R=28,GR=G-6-R,TAU=Math.PI*2,NECK=158,BODY0=176,BODY1=468,BW=104,TRAY=[0,430],HX=50,H0=196,H1=384,TURNS=2,PS=44/(2.3*28);
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,eio=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,eo=t=>1-Math.pow(1-t,3),ei=t=>t*t;
let W=0,H=0,dpr=1,S=1,OX=0,OY=0,PX=2,lw=1,lh=1;
// ---- planets ----
const balls=PL.map((p,i)=>({i,id:p[0],name:p[1],href:p[2],acc:p[3],x:0,y:0,vx:0,vy:0,st:'in',al:1}));
const SZ=[48,64,96,160,384];
function bbox(im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;
 for(let y=0;y<c.height;y++)for(let X=0;X<c.width;X++)if(d[(y*c.width+X)*4+3]>40){if(X<x0)x0=X;if(X>x1)x1=X;if(y<y0)y0=y;if(y>y1)y1=y}return x1<0?[0,0,im.width,im.height]:[x0,y0,x1-x0+1,y1-y0+1]}
balls.forEach(b=>{b.im={};for(const n of SZ){const im=new Image();im.onload=()=>{b.im[n]={im,bb:bbox(im)}};im.src='p'+n+'/'+b.id+'.png'}});
function pick(b,px){let best=null;for(const n of SZ){const e=b.im[n];if(!e)continue;best=e;if(Math.max(e.bb[2],e.bb[3])>=px*.92)break}return best}
// draw a planet upright (no spinning), centred at x,y, fitted to `size` (max side) in the current units
function drawPlanet(b,x,y,s,al,g0,px){const c=g0||lg,size=px||R*2.3*s,e=pick(b,size*(g0?1:S/PX));c.save();c.globalAlpha=al;
 if(e){const[bx,by,bw,bh]=e.bb,k=size/Math.max(bw,bh);c.imageSmoothingEnabled=false;c.drawImage(e.im,bx,by,bw,bh,Math.round(x-bw*k/2),Math.round(y-bh*k/2),bw*k,bh*k)}c.restore()}
// ---- physics: only runs while the pile is settling (no constant motion) ----
let settleT=0;
function step(dt){const live=balls.filter(b=>b.st==='in');
 for(const b of live){b.vy+=1400*dt;b.vx*=Math.pow(.05,dt);b.vy*=Math.pow(.3,dt);b.x+=b.vx*dt;b.y+=b.vy*dt}
 for(let it=0;it<5;it++){
  for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){const a=live[i],c=live[j];let dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy);if(d>=R*2||d<1e-4)continue;const nx=dx/d,ny=dy/d,o=(R*2-d)/2;a.x-=nx*o;a.y-=ny*o;c.x+=nx*o;c.y+=ny*o;
   const rv=(c.vx-a.vx)*nx+(c.vy-a.vy)*ny;if(rv<0){const im=-1.1*rv/2;a.vx-=im*nx;a.vy-=im*ny;c.vx+=im*nx;c.vy+=im*ny}}
  for(const b of live){const d=Math.hypot(b.x,b.y);if(d>GR){const nx=b.x/d,ny=b.y/d;b.x=nx*GR;b.y=ny*GR;const rv=b.vx*nx+b.vy*ny;if(rv>0){b.vx-=1.2*rv*nx;b.vy-=1.2*rv*ny}}}}}
function settle(sec){for(let t=0;t<sec;t+=1/120)step(1/120);balls.forEach(b=>{b.vx=b.vy=0})}
function scatter(){balls.forEach((b,k)=>{const a=k*2.4,r=GR*.8*Math.sqrt((k+.5)/balls.length);b.x=Math.cos(a)*r;b.y=Math.sin(a)*r;b.vx=b.vy=0})}
// ---- layout: integer pixel size PX ----
function resize(){dpr=devicePixelRatio||1;W=innerWidth;H=innerHeight;const top=Math.max(52,H*.06),bot=Math.max(92,H*.12),avail=H-top-bot;
 S=Math.min(avail/720,W*.9/330,1.5);PX=Math.max(2,Math.round(720*S/300));lw=Math.ceil(W/PX);lh=Math.ceil(H/PX);lo.width=lw;lo.height=lh;
 cv.width=Math.round(lw*PX*dpr);cv.height=Math.round(lh*PX*dpr);cv.style.width=lw*PX+'px';cv.style.height=lh*PX+'px';
 OX=Math.round(W/2/PX)*PX;OY=Math.round((top+(avail-720*S)/2+158*S)/PX)*PX}
const SX=x=>x*S+OX,SY=y=>y*S+OY;
// ---- pixel renderer: machine layers get snapped to a small palette + 4x4 ordered dither for see-through glass ----
const lo=document.createElement('canvas'),lg=lo.getContext('2d'),LAY={};
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const PAL=['#ffffff','#f3f6fa','#e3e9f1','#cfd8e4','#aeb9c9','#8a97ab','#5e6a7e','#3c4556','#4a3208','#7a520e','#a8741a','#d29a2a','#f0c24a','#ffe58a','#fff6cc','#1b1d22','#dde0e6','#b8bdc6','#8d939d','#5f646e'].map(h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]);
const QC=new Map();function near(r,gg,b){const k=(r>>2)<<12|(gg>>2)<<6|(b>>2);let c=QC.get(k);if(c)return c;let bd=1e9;for(const q of PAL){const e=(r-q[0])**2*.3+(gg-q[1])**2*.59+(b-q[2])**2*.11;if(e<bd){bd=e;c=q}}QC.set(k,c);return c}
function setT(x){x.setTransform(S/PX,0,0,S/PX,OX/PX,OY/PX)}
function quant(x,box){let x0=0,y0=0,x1=lw,y1=lh;if(box){x0=Math.max(0,Math.floor((box[0]*S+OX)/PX));y0=Math.max(0,Math.floor((box[1]*S+OY)/PX));x1=Math.min(lw,Math.ceil((box[2]*S+OX)/PX));y1=Math.min(lh,Math.ceil((box[3]*S+OY)/PX))}
 const w=x1-x0,h=y1-y0;if(w<=0||h<=0)return;const im=x.getImageData(x0,y0,w,h),d=im.data;
 for(let y=0;y<h;y++)for(let X=0;X<w;X++){const i=(y*w+X)*4,a=d[i+3];if(!a)continue;if(a/255<B4[((y+y0)&3)*4+((X+x0)&3)]){d[i+3]=0;continue}const c=near(d[i],d[i+1],d[i+2]);d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255}
 x.putImageData(im,x0,y0)}
function layer(name,key,fn,box){let e=LAY[name];if(!e||e.c.width!==lw||e.c.height!==lh){const c=document.createElement('canvas');c.width=lw;c.height=lh;e=LAY[name]={c,x:c.getContext('2d'),key:null}}
 if(key===null||e.key!==key){g=e.x;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,lw,lh);setT(g);fn();quant(e.x,box);e.key=key}
 g=lg;lg.setTransform(1,0,0,1,0,0);lg.drawImage(e.c,0,0);setT(lg)}
// ---- drawing helpers ----
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function gold(x0,x1){const l=g.createLinearGradient(x0,0,x1,0);l.addColorStop(0,'#7a520e');l.addColorStop(.1,'#a8741a');l.addColorStop(.22,'#fff6cc');l.addColorStop(.3,'#f0c24a');l.addColorStop(.6,'#d29a2a');l.addColorStop(.88,'#a8741a');l.addColorStop(1,'#4a3208');return l}
function band(y0,y1,hw,r){g.fillStyle=gold(-hw,hw);rr(-hw,y0,hw*2,y1-y0,r||3);g.fill();g.fillStyle='#fff6cc';g.fillRect(-hw+6,y0+2,hw*2-12,2);g.fillStyle='#7a520e';g.fillRect(-hw+3,y1-3,hw*2-6,2)}
// helix: t in [0,1] -> x, y, depth (1 = front)
function hel(t){const a=t*TURNS*TAU;return[Math.sin(a)*HX,lerp(H0,H1,t),Math.cos(a)]}
function tube(front){const N=160;for(const pass of[0,1,2]){g.lineCap='round';g.lineJoin='round';
  for(let i=0;i<N;i++){const t0=i/N,t1=(i+1)/N,[x0,y0,d0]=hel(t0),[x1,y1,d1]=hel(t1);if((d0+d1>0)!==front)continue;
   g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);
   if(pass===0){g.strokeStyle=front?'#8a97ab':'#cfd8e4';g.lineWidth=44}else if(pass===1){if(front){g.globalCompositeOperation='destination-out';g.strokeStyle='#000';g.lineWidth=38;g.stroke();g.globalCompositeOperation='source-over'}g.strokeStyle=front?'rgba(243,246,250,.3)':'rgba(243,246,250,.8)';g.lineWidth=38}else{g.strokeStyle=front?'rgba(255,255,255,.95)':'rgba(255,255,255,.5)';g.lineWidth=4;g.beginPath();g.moveTo(x0-8,y0-12);g.lineTo(x1-8,y1-12)}g.stroke()}}
 if(front){ // short straight pieces: neck -> helix top, helix end -> tray
  g.fillStyle='#8a97ab';g.fillRect(-22,NECK+8,44,H0-NECK-8);g.fillStyle='rgba(243,246,250,.55)';g.fillRect(-19,NECK+8,38,H0-NECK-8);g.fillStyle='#ffffff';g.fillRect(-14,NECK+10,3,H0-NECK-12)}}
function drawBack(){
 // floor shadow
 g.fillStyle='#e3e9f1';g.beginPath();g.ellipse(0,552,170,16,0,0,TAU);g.fill();g.fillStyle='#cfd8e4';g.beginPath();g.ellipse(0,550,120,10,0,0,TAU);g.fill();
 // globe back
 let gr=g.createRadialGradient(-40,-50,20,0,0,G);gr.addColorStop(0,'#ffffff');gr.addColorStop(.8,'#f3f6fa');gr.addColorStop(1,'#e3e9f1');g.fillStyle=gr;g.beginPath();g.arc(0,0,G,0,TAU);g.fill();
 g.strokeStyle='#cfd8e4';g.lineWidth=3;g.beginPath();g.arc(0,0,G-10,Math.PI*.12,Math.PI*.88);g.stroke();
 // body back (glass capsule)
 gr=g.createLinearGradient(-BW,0,BW,0);gr.addColorStop(0,'#e3e9f1');gr.addColorStop(.25,'#ffffff');gr.addColorStop(.75,'#f3f6fa');gr.addColorStop(1,'#e3e9f1');g.fillStyle=gr;rr(-BW,BODY0,BW*2,BODY1-BODY0,44);g.fill();
 g.strokeStyle='#e3e9f1';g.lineWidth=3;g.beginPath();g.ellipse(0,BODY1-24,BW-10,14,0,0,Math.PI);g.stroke();
 // tray back + spiral tube back half
 g.fillStyle='#e3e9f1';rr(-58,TRAY[1]-26,116,30,6);g.fill();g.strokeStyle='#aeb9c9';g.lineWidth=3;g.stroke();
 tube(false)}
function drawFront(){let gr;
 // globe front: rim, fresnel, highlights
 gr=g.createRadialGradient(0,0,G*.7,0,0,G);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.9,'rgba(207,216,228,0)');gr.addColorStop(1,'rgba(174,185,201,.45)');g.fillStyle=gr;g.beginPath();g.arc(0,0,G,0,TAU);g.fill();
 g.strokeStyle='#8a97ab';g.lineWidth=4;g.beginPath();g.arc(0,0,G,0,TAU);g.stroke();g.strokeStyle='#cfd8e4';g.lineWidth=2;g.beginPath();g.arc(0,0,G-4,Math.PI*.05,Math.PI*.95);g.stroke();
 g.strokeStyle='rgba(255,255,255,.95)';g.lineWidth=12;g.lineCap='round';g.beginPath();g.arc(0,0,G-20,Math.PI*1.12,Math.PI*1.38);g.stroke();
 g.lineWidth=6;g.beginPath();g.arc(0,0,G-20,Math.PI*1.45,Math.PI*1.52);g.stroke();
 g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=7;g.beginPath();g.arc(0,0,G-16,Math.PI*1.86,Math.PI*1.98);g.stroke();
 // neck: gold collar between globe and body
 band(NECK-14,NECK+4,88,4);band(NECK+4,BODY0+6,98,4);
 // body front glass: outline, fresnel edges, highlight stripes
 g.strokeStyle='#8a97ab';g.lineWidth=4;rr(-BW,BODY0,BW*2,BODY1-BODY0,44);g.stroke();
 gr=g.createLinearGradient(-BW,0,BW,0);gr.addColorStop(0,'rgba(174,185,201,.5)');gr.addColorStop(.12,'rgba(207,216,228,0)');gr.addColorStop(.88,'rgba(207,216,228,0)');gr.addColorStop(1,'rgba(174,185,201,.5)');g.fillStyle=gr;rr(-BW,BODY0,BW*2,BODY1-BODY0,44);g.fill();
 g.fillStyle='rgba(255,255,255,.95)';rr(-BW+14,BODY0+30,8,BODY1-BODY0-90,4);g.fill();g.fillStyle='rgba(255,255,255,.75)';rr(-BW+28,BODY0+46,4,BODY1-BODY0-150,2);g.fill();
 g.fillStyle='rgba(255,255,255,.7)';rr(BW-22,BODY0+40,6,BODY1-BODY0-120,3);g.fill();
 // tray front rim
 g.fillStyle='rgba(243,246,250,.6)';rr(-62,TRAY[1]-8,124,26,6);g.fill();g.strokeStyle='#8a97ab';g.lineWidth=3;rr(-62,TRAY[1]-8,124,26,6);g.stroke();g.fillStyle='#ffffff';g.fillRect(-52,TRAY[1]-4,90,3);
 // gold base: band, coin slot plate, foot
 band(BODY1-6,BODY1+18,110,4);band(BODY1+18,BODY1+40,104,3);
 g.fillStyle=gold(-128,128);g.beginPath();g.moveTo(-92,BODY1+40);g.lineTo(92,BODY1+40);g.quadraticCurveTo(128,BODY1+62,130,BODY1+74);g.lineTo(-130,BODY1+74);g.quadraticCurveTo(-128,BODY1+62,-92,BODY1+40);g.fill();
 g.fillStyle='#7a520e';g.fillRect(-130,BODY1+72,260,6);g.fillStyle='#fff6cc';g.fillRect(-80,BODY1+44,140,2);
 // coin slot
 g.fillStyle='#4a3208';rr(-20,BODY1+1,40,30,4);g.fill();g.fillStyle=gold(-18,18);rr(-18,BODY1+2,36,27,3);g.fill();g.fillStyle='#1b1d22';g.fillRect(-3,BODY1+7,6,17);g.fillStyle='#fff6cc';g.fillRect(-14,BODY1+4,10,2)}
let knobA=0;
function drawKnob(){const y=BODY1+18,x0=110;g.fillStyle='#7a520e';g.fillRect(x0-2,y-10,14,20);
 const l=g.createLinearGradient(0,y-18,0,y+18);l.addColorStop(0,'#a8741a');l.addColorStop(.25,'#fff6cc');l.addColorStop(.45,'#f0c24a');l.addColorStop(.8,'#a8741a');l.addColorStop(1,'#4a3208');g.fillStyle=l;rr(x0+10,y-18,30,36,6);g.fill();
 // grip ridges rotate around the knob's axis (they slide up and wrap)
 g.save();rr(x0+10,y-18,30,36,6);g.clip();for(let k=0;k<6;k++){const a=k/6*TAU+knobA,yy=y+Math.sin(a)*17;if(Math.cos(a)<0)continue;g.fillStyle='#7a520e';g.fillRect(x0+12,yy-1.5,26,3);g.fillStyle='#fff6cc';g.fillRect(x0+12,yy-3,26,1.5)}g.restore();
 g.fillStyle='#d29a2a';rr(x0+38,y-13,8,26,3);g.fill();g.fillStyle='#fff6cc';g.fillRect(x0+40,y-10,2,10)}
function coinFace(r,sx,al){g.save();g.globalAlpha=al;g.scale(sx,1);
 let gr=g.createRadialGradient(-r*.35,-r*.4,r*.1,0,0,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(.5,'#dde0e6');gr.addColorStop(1,'#8d939d');g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();
 g.strokeStyle='#5f646e';g.lineWidth=r*.12;g.beginPath();g.arc(0,0,r*.92,0,TAU);g.stroke();
 g.fillStyle='#ffffff';g.fillRect(-r*.26,-r*.5,r*.24,r*.98);g.fillRect(-r*.26,r*.26,r*.62,r*.22);g.fillStyle='#5f646e';g.fillRect(-r*.32,-r*.56,r*.24,r*.98);g.fillRect(-r*.32,r*.2,r*.62,r*.22);g.restore()}
// ---- state ----
let T=null,last=performance.now(),lastPick=null,coin=null,mover=null,busy=false,queued=false;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;if(T)T.tick(now);
 if(settleT>0){settleT-=dt;const n=Math.max(1,Math.ceil(dt*240));for(let k=0;k<n;k++)step(dt/n);if(settleT<=0)balls.forEach(b=>{b.vx=b.vy=0})}
 draw(now);requestAnimationFrame(frame)}
function draw(now){const rk=lw+'x'+lh+':'+S.toFixed(4)+':'+PX;
 lg.setTransform(1,0,0,1,0,0);lg.fillStyle='#fff';lg.fillRect(0,0,lw,lh);
 layer('back',rk,drawBack,[-180,-160,180,575]);
 g=lg;setT(lg);g.save();g.beginPath();g.arc(0,0,G-3,0,TAU);g.rect(-40,G-30,80,60);g.clip();
 for(const b of balls)if(b.st==='in'||b.st==='drop')drawPlanet(b,b.x,b.y,1,b.al);
 if(mover&&mover.zone==='globe')drawPlanet(mover.b,mover.x,mover.y,mover.s,1);g.restore();
 if(mover&&mover.zone!=='globe')drawPlanet(mover.b,mover.x,mover.y,mover.s,mover.al??1);
 layer('tube',rk,()=>tube(true),[-80,NECK,80,H1+30]);
 layer('front',rk,drawFront,[-180,-160,180,575]);
 layer('knob',rk+':'+knobA.toFixed(3),drawKnob,[100,BODY1-4,160,BODY1+40]);
 if(coin)layer('coin',null,()=>coin&&coin.draw(now),null);
 G2D.setTransform(1,0,0,1,0,0);G2D.imageSmoothingEnabled=false;G2D.drawImage(lo,0,0,cv.width,cv.height)}
// ---- spin ----
function btnMachine(){const r=btn.getBoundingClientRect();return[((r.left+28)-OX)/S,((r.top+r.height/2)-OY)/S]}
function setBusy(v){busy=v;btn.disabled=v;btn.classList.toggle('used',v)}
function spin(){if(busy)return;setBusy(true);const rm=RM.matches,t0=performance.now();
 const cand=balls.filter(b=>b.st==='in'&&b.id!==lastPick),pk=cand[Math.floor(Math.random()*cand.length)];lastPick=pk.id;
 const D=rm?{coin:300,knob:300,pull:0,neck:0,helix:0,drop:350}:{coin:1000,knob:800,pull:550,neck:350,helix:2600,drop:600};
 const[sx0,sy0]=btnMachine(),slot=[0,BODY1+15];
 coin={draw(now){const t=(now-t0)/D.coin;if(t>=1){coin=null;return}g.save();
  if(rm){g.translate(slot[0],slot[1]);coinFace(16,1-t*.85,1-t)}
  else if(t<.65){const p=eo(t/.65);g.translate(lerp(sx0,slot[0]-60,p),lerp(sy0,slot[1],p)-Math.sin(p*Math.PI)*140);coinFace(lerp(22,16,p),1,1)}
  else if(t<.85){const q=eio((t-.65)/.2);g.translate(lerp(slot[0]-60,slot[0],q),slot[1]);coinFace(16,lerp(1,.2,q),1)}
  else{const q=(t-.85)/.15;g.translate(slot[0],slot[1]);coinFace(16,.2,1-q)}
  g.restore()}};
 const tK=t0+D.coin,tP=tK+D.knob,tN=tP+D.pull,tH=tN+D.neck,tD=tH+D.helix,tE=tD+D.drop;
 const k0=knobA;let px=null,py=null;
 T={tick(now){
  if(now>=tK&&now<tP+40)knobA=k0+(rm?Math.PI/2:TAU)*eio(clamp((now-tK)/D.knob));
  if(now<tP)return;
  if(rm){if(pk.st==='in'){pk.st='out';settle(2)}const q=clamp((now-tP)/D.drop);mover={b:pk,zone:'tray',x:TRAY[0],y:TRAY[1]-14,s:PS*1.1,al:q}}
  else if(now<tN){if(px===null){px=pk.x;py=pk.y;pk.st='out';settleT=1.6}const q=eio(clamp((now-tP)/D.pull));mover={b:pk,zone:'globe',x:lerp(px,0,q),y:lerp(py,GR,q),s:1}}
  else if(now<tH){const q=ei(clamp((now-tN)/D.neck));mover={b:pk,zone:'neck',x:0,y:lerp(GR,H0,q),s:lerp(1,PS+.08,q)}}
  else if(now<tD){const q=clamp((now-tH)/D.helix),t=q*q*.35+q*.65,[x,y,dep]=hel(t);mover={b:pk,zone:'tube',x,y,s:PS+.08*dep}}
  else if(now<tE){const q=clamp((now-tD)/D.drop),bn=Math.abs(Math.sin(q*Math.PI*2.5))*(1-q)*16;mover={b:pk,zone:'tray',x:0,y:lerp(H1,TRAY[1]-14,eo(clamp(q*1.6)))-(q>.35?bn:0),s:lerp(PS+.08,PS*1.1,q)}}
  if(now>=tE){T=null;showPop(pk)}}}}
// ---- popup ----
function onColor(hex){const n=parseInt(hex.slice(1),16),r=n>>16&255,gg=n>>8&255,b=n&255;return(r*.299+gg*.587+b*.114)>150?'#1b1d22':'#fff'}
function showPop(b){const rm=RM.matches;pname.textContent=b.name;pgo.href=b.href;pgo.textContent='Go to '+b.name;
 if(/^https?:/.test(b.href)){pgo.target='_blank';pgo.rel='noopener'}else{pgo.removeAttribute('target');pgo.removeAttribute('rel')}
 pop.style.setProperty('--acc',b.acc);pop.style.setProperty('--on',onColor(b.acc));
 const m=PX*2,n=Math.max(24,Math.round(Math.min(W*.66,H*.4,360)/m));pimg.width=pimg.height=n;pop.style.setProperty('--D',n*m+'px');
 {const x=pimg.getContext('2d');x.clearRect(0,0,n,n);drawPlanet(b,n/2,n/2,1,1,x,n)}pimg.setAttribute('aria-label',b.name);pop.hidden=false;
 const ir=pimg.getBoundingClientRect(),bx=SX(mover?mover.x:0),by=SY(mover?mover.y:TRAY[1]),bs=R*2.3*(mover?mover.s:1)*S/(ir.width||1);
 const txt=pop.querySelector('.ptxt');
 if(rm)pop.animate([{opacity:0},{opacity:1}],{duration:200,fill:'both'});
 else{pop.animate([{backgroundColor:'rgba(255,255,255,0)'},{backgroundColor:'rgba(255,255,255,.92)'}],{duration:300,easing:'steps(5)'});
  pimg.animate([{transform:`translate(${bx-(ir.left+ir.width/2)}px,${by-(ir.top+ir.height/2)}px) scale(${bs})`},{transform:'translate(0,0) scale(1.1)',offset:.68},{transform:'translate(0,0) scale(.96)',offset:.86},{transform:'none'}],{duration:720,easing:'cubic-bezier(.3,.7,.3,1)',fill:'both'});
  txt.animate([{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:360,delay:420,easing:'steps(6)',fill:'both'})}
 pgo.focus({preventScroll:true})}
function closePop(then){const fin=()=>{pop.hidden=true;returnPlanet();then&&then()};
 if(RM.matches){fin();return}const a=pop.animate([{opacity:1},{opacity:0}],{duration:220,easing:'steps(4)'});a.onfinish=fin}
function returnPlanet(){const b=mover&&mover.b;mover=null;if(!b){setBusy(false);return}
 if(RM.matches){b.st='in';b.x=(Math.random()-.5)*50;b.y=-GR*.5;settle(2.5);setBusy(false);return}
 b.st='drop';b.x=(Math.random()-.5)*40;b.y=-GR*.75;b.al=0;b.vx=0;b.vy=0;const t0=performance.now();
 T={tick(now){const q=(now-t0)/300;b.al=clamp(q);if(q>=1){b.st='in';b.al=1;settleT=1.6;T=null;setBusy(false);if(queued){queued=false;spin()}}}}}
btn.addEventListener('click',spin);
again.addEventListener('click',()=>{queued=!RM.matches;closePop(()=>{if(RM.matches)spin()})});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden)closePop()});
pop.addEventListener('click',e=>{if(e.target===pop)closePop()});
addEventListener('resize',resize);
resize();scatter();settle(4);requestAnimationFrame(frame);
window.__gumball={balls,spin,get busy(){return busy},get open(){return!pop.hidden},get mover(){return mover&&{zone:mover.zone,id:mover.b.id}},PL};
})();

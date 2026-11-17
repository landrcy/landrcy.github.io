/* Laverse gumball machine: every hub planet tumbles inside (the hub's own planet painters, pre-rendered to p96/p160/p384/*.png).
   Plain canvas 2D: shaded glass globe, red metal body, simple circle physics so the planets settle and tumble. */
(()=>{'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)');
// id, name, link (same as the hub's Play/link; Cooper City has none on the hub, so its popup only offers Spin again), base colour under the texture, accent (hub theme / tint colours), texture crop [cx,cy,size] as fractions of the sprite
const PL=[
 ['ashaad','The Binding of Ashaad','https://landrcy.github.io/binding-of-ashaad/','#2a1608','#ffd23a',[.5,.6,.62]],
 ['sea','Sea of Thought','https://landrcy.github.io/sea-of-thought/','#0b3b7a','#48cae4',[.5,.5,.84]],
 ['yt','LLC Powered Channels','/youtube/','#b3122a','#ff0033',[.5,.5,.84]],
 ['gow','Cooper City',null,'#111116','#e01a22',[.5,.5,.86]],
 ['void','The Void','https://landrcy.github.io/the-void/','#05020d','#c04df0',[.5,.5,.62]],
 ['pmuseum','Pixel Museum','https://landrcy.github.io/pixel-museum/','#3a2e22','#3ad8e0',[.5,.62,.6]],
 ['aiquiz','AI Quiz','https://landrcy.github.io/ai-quiz/','#1a3a6a','#57f0ff',[.5,.52,.72]],
 ['typefall','typefall','/typefall/','#efe6d2','#1d1d24',[.5,.53,.56]],
 ['mine','MINE','https://landrcy.github.io/mine/','#241a12','#ffd23a',[.46,.55,.66]],
 ['ttt','Talk to Tung','/ttt/','#b07a3a','#b07a3a',[.48,.52,.62]],
 ['lan4drcy','lan4drcy','/lan4drcy/','#f1f3ff','#3fc8f0',[.57,.46,.64]],
 ['lsu','Lsu','/lsu/','#e8467e','#ff3d7f',[.5,.5,.54]],
 ['escapeca','Escape CA','https://landrcy.github.io/escape-ca/','#1c1030','#ff3a4a',[.5,.5,.84]],
 ['terra','Terra','https://landrcy.github.io/terra/','#2c5a2c','#c4a05a',[.5,.5,.84]],
 ['wam','W.A.M.','https://landrcy.github.io/wam/','#101018','#8a8a96',[.5,.5,.84]]];
const cv=document.getElementById('gm'),g=cv.getContext('2d'),G2D=g,btn=document.getElementById('spin'),pop=document.getElementById('pop'),pimg=document.getElementById('pimg'),pname=document.getElementById('pname'),pgo=document.getElementById('pgo'),again=document.getElementById('again');
document.getElementById('sites').innerHTML=PL.filter(p=>p[2]).map(p=>`<a href="${p[2]}">${p[1]}</a>`).join('');
const G=165,R=40,TAU=Math.PI*2,GR=G-7-R; // globe radius, gumball radius, max centre distance inside the glass
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t,eio=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2,eo=t=>1-Math.pow(1-t,3),ei=t=>t*t*t;
let W=0,H=0,dpr=1,S=1,OX=0,OY=0; // machine units -> screen: x*S+OX
// ---- gumballs ----
const balls=PL.map((p,i)=>({i,id:p[0],name:p[1],href:p[2],base:p[3],acc:p[4],crop:p[5],x:0,y:0,vx:0,vy:0,a:Math.random()*TAU,w:0,st:'in',al:1}));
const SZ=[96,160,384];
function bbox(im){const c=document.createElement('canvas');c.width=im.width;c.height=im.height;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height).data;let x0=1e9,y0=1e9,x1=-1,y1=-1;
 for(let y=0;y<c.height;y++)for(let X=0;X<c.width;X++)if(d[(y*c.width+X)*4+3]>40){if(X<x0)x0=X;if(X>x1)x1=X;if(y<y0)y0=y;if(y>y1)y1=y}return x1<0?[0,0,im.width,im.height]:[x0,y0,x1-x0+1,y1-y0+1]}
balls.forEach(b=>{b.im={};for(const n of SZ){const im=new Image();im.onload=()=>{b.im[n]={im,bb:bbox(im)}};im.src='p'+n+'/'+b.id+'.png'}});
function scatter(){balls.forEach((b,k)=>{const a=k*2.4,r=GR*.85*Math.sqrt((k+.5)/balls.length);b.x=Math.cos(a)*r;b.y=Math.sin(a)*r;b.vx=b.vy=0})}
// ---- physics (machine units, seconds) ----
function step(dt,churn){const live=balls.filter(b=>b.st==='in'||b.st==='return');
 for(const b of live){b.vy+=1500*dt;if(churn){const dx=b.x,dy=b.y,d=Math.hypot(dx,dy)||1;b.vx+=(-dy/d)*churn*900*dt;b.vy+=(dx/d)*churn*900*dt;if(b.y>GR*.35)b.vy-=churn*(2600+Math.random()*2400)*dt;b.vx+=(Math.random()-.5)*churn*1400*dt}
  b.vx*=Math.pow(.6,dt);b.vy*=Math.pow(.75,dt);b.x+=b.vx*dt;b.y+=b.vy*dt}
 for(let it=0;it<4;it++){
  for(let i=0;i<live.length;i++)for(let j=i+1;j<live.length;j++){const a=live[i],c=live[j];let dx=c.x-a.x,dy=c.y-a.y,d=Math.hypot(dx,dy);if(d>=R*2||d<1e-4)continue;const nx=dx/d,ny=dy/d,o=(R*2-d)/2;a.x-=nx*o;a.y-=ny*o;c.x+=nx*o;c.y+=ny*o;
   const rv=(c.vx-a.vx)*nx+(c.vy-a.vy)*ny;if(rv<0){const im=-(1.3)*rv/2;a.vx-=im*nx;a.vy-=im*ny;c.vx+=im*nx;c.vy+=im*ny}
   const tv=(c.vx-a.vx)*-ny+(c.vy-a.vy)*nx;a.w+=tv*dt*.02;c.w-=tv*dt*.02}
  for(const b of live){const d=Math.hypot(b.x,b.y);if(d>GR){const nx=b.x/d,ny=b.y/d;b.x=nx*GR;b.y=ny*GR;const rv=b.vx*nx+b.vy*ny;if(rv>0){b.vx-=1.35*rv*nx;b.vy-=1.35*rv*ny}const tv=b.vx*-ny+b.vy*nx;b.w+=(-tv/R-b.w)*.25}}}
 for(const b of live){b.w+=(b.vx/R-b.w)*Math.min(1,dt*6);b.a+=b.w*dt}}
function settle(sec){for(let t=0;t<sec;t+=1/120)step(1/120,0);balls.forEach(b=>{if(b.st==='in'){b.vx=b.vy=0;b.w=0}})}
// ---- layout ----
function resize(){dpr=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);
 const top=Math.max(56,H*.07),bot=Math.max(96,H*.13),avail=H-top-bot;S=Math.min(avail/690,W*.92/400,1.35);OX=W/2;OY=top+(avail-690*S)/2+222*S;}
addEventListener('resize',resize);
// ---- drawing helpers ----
const SX=x=>x*S+OX,SY=y=>y*S+OY;
function rr(x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
function metal(x0,x1,dark){const l=g.createLinearGradient(x0,0,x1,0);l.addColorStop(0,dark?'#5c070c':'#7d0b11');l.addColorStop(.12,'#c3141c');l.addColorStop(.26,'#ff6a6a');l.addColorStop(.34,'#e8262d');l.addColorStop(.7,'#c1131b');l.addColorStop(.92,'#8a0c12');l.addColorStop(1,'#62080d');return l}
function chrome(x0,y0,x1,y1){const l=g.createLinearGradient(x0,y0,x1,y1);l.addColorStop(0,'#f7f8fa');l.addColorStop(.35,'#c3c8d0');l.addColorStop(.5,'#8d939d');l.addColorStop(.62,'#e4e7ec');l.addColorStop(1,'#9aa0aa');return l}
// draw a planet sprite (the hub painter's own pixel art) centred at x,y, fitted to size (max side), rotated by its tumble angle
function pick(b,px){let best=null;for(const n of SZ){const e=b.im[n];if(!e)continue;best=e;if(Math.max(e.bb[2],e.bb[3])>=px*.92)break}return best}
function drawBall(b,x,y,s,al,g0,px){const g=g0||G2D,size=px||R*2.2*s,e=pick(b,size*(g0?1:S*dpr));g.save();g.globalAlpha=al;g.translate(x,y);if(!g0)g.rotate(b.a);
 if(e){const[bx,by,bw,bh]=e.bb,k=size/Math.max(bw,bh);g.imageSmoothingEnabled=false;g.drawImage(e.im,bx,by,bw,bh,-bw*k/2,-bh*k/2,bw*k,bh*k)}
 else{g.fillStyle=b.base;g.beginPath();g.arc(0,0,R*s,0,TAU);g.fill()}g.restore()}
function coinFace(r,sx,al,rot){g.save();g.globalAlpha=al;g.rotate(rot||0);g.scale(sx,1);
 const edge=Math.max(0,(1-sx))*r*.18;if(edge>0){g.fillStyle='#7d828c';g.beginPath();g.ellipse(edge/sx,0,r,r,0,0,TAU);g.fill()}
 let gr=g.createRadialGradient(-r*.35,-r*.4,r*.1,0,0,r);gr.addColorStop(0,'#ffffff');gr.addColorStop(.45,'#d6d9e0');gr.addColorStop(1,'#8c919c');g.fillStyle=gr;g.beginPath();g.arc(0,0,r,0,TAU);g.fill();
 g.strokeStyle='#a3a8b2';g.lineWidth=r*.05;for(let k=0;k<48;k++){const a=k/48*TAU;g.beginPath();g.moveTo(Math.cos(a)*r*.93,Math.sin(a)*r*.93);g.lineTo(Math.cos(a)*r,Math.sin(a)*r);g.stroke()}
 g.strokeStyle='rgba(120,125,135,.8)';g.lineWidth=r*.04;g.beginPath();g.arc(0,0,r*.84,0,TAU);g.stroke();
 g.font=`700 ${r*1.15}px Georgia,"Times New Roman",serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle='rgba(255,255,255,.9)';g.fillText('L',-r*.04,r*.04);g.fillStyle='#6d727d';g.fillText('L',r*.02,0);g.restore()}
// ---- state machine ----
let T=null,last=performance.now(),lastPick=null,crankA=0,flap=0,coin=null,out=null,busy=false;
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 if(T)T.tick(now);
 if(!RM.matches){const churn=T&&T.churn?T.churn(now):0;const n=Math.max(1,Math.ceil(dt*240));for(let k=0;k<n;k++)step(dt/n,churn)}
 draw(now);requestAnimationFrame(frame)}
function draw(now){g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);g.fillStyle='#fff';g.fillRect(0,0,W,H);
 g.save();g.translate(OX,OY);g.scale(S,S);
 // floor shadow
 let gr=g.createRadialGradient(0,452,10,0,452,230);gr.addColorStop(0,'rgba(30,20,40,.28)');gr.addColorStop(.55,'rgba(30,20,40,.1)');gr.addColorStop(1,'rgba(30,20,40,0)');g.fillStyle=gr;g.beginPath();g.ellipse(0,452,240,30,0,0,TAU);g.fill();
 // glass back
 gr=g.createRadialGradient(-40,-50,20,0,0,G);gr.addColorStop(0,'rgba(235,244,255,.35)');gr.addColorStop(1,'rgba(190,210,235,.45)');g.fillStyle=gr;g.beginPath();g.arc(0,0,G,0,TAU);g.fill();
 g.strokeStyle='rgba(150,170,200,.25)';g.lineWidth=2;g.beginPath();g.arc(0,0,G-8,Math.PI*.15,Math.PI*.85);g.stroke();
 // gumballs (and the chosen one sinking into the neck, drawn before the collar so the metal covers it)
 g.save();g.beginPath();g.arc(0,0,G-3,0,TAU);g.rect(-60,G-40,120,120);g.clip();
 for(const b of balls)if(b.st==='in'||b.st==='return'||b.st==='sink')drawBall(b,b.x,b.y,1,b.al);g.restore();
 // glass front: fresnel rim, reflections
 gr=g.createRadialGradient(0,0,G*.6,0,0,G);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.85,'rgba(170,195,225,.12)');gr.addColorStop(1,'rgba(140,165,200,.38)');g.fillStyle=gr;g.beginPath();g.arc(0,0,G,0,TAU);g.fill();
 g.save();g.beginPath();g.arc(0,0,G,0,TAU);g.clip();
 gr=g.createLinearGradient(-G,-G,-G*.3,-G*.2);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.55,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');g.strokeStyle=gr;g.lineWidth=20;g.lineCap='round';g.beginPath();g.arc(0,0,G-22,Math.PI*1.08,Math.PI*1.42);g.stroke();
 g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.ellipse(-78,-96,15,8,-.75,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-104,-60,5,3,-1,0,TAU);g.fill();
 gr=g.createLinearGradient(92,0,128,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,'rgba(255,255,255,.32)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.beginPath();g.moveTo(96,-110);g.quadraticCurveTo(134,-20,110,70);g.lineTo(98,64);g.quadraticCurveTo(118,-20,86,-104);g.fill();
 g.restore();
 g.strokeStyle='rgba(120,140,170,.45)';g.lineWidth=2.5;g.beginPath();g.arc(0,0,G,0,TAU);g.stroke();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=1.5;g.beginPath();g.arc(0,0,G-2,Math.PI*1.1,Math.PI*1.45);g.stroke();
 // lid + knob
 g.fillStyle=metal(-84,84);g.beginPath();g.ellipse(0,-148,84,36,0,Math.PI,TAU);g.lineTo(84,-146);g.ellipse(0,-146,84,13,0,0,Math.PI);g.closePath();g.fill();
 g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.ellipse(-30,-168,26,8,-.25,0,TAU);g.fill();
 g.fillStyle=chrome(-14,-205,14,-175);g.fillRect(-5,-192,10,12);
 gr=g.createRadialGradient(-5,-201,1,0,-196,15);gr.addColorStop(0,'#ff8a8a');gr.addColorStop(.4,'#e3222a');gr.addColorStop(1,'#7a0a10');g.fillStyle=gr;g.beginPath();g.arc(0,-196,13,0,TAU);g.fill();
 // collar
 g.fillStyle=metal(-112,112);g.beginPath();g.ellipse(0,146,108,16,0,Math.PI,TAU);g.lineTo(112,188);g.ellipse(0,188,112,14,0,0,Math.PI);g.closePath();g.fill();
 g.fillStyle='rgba(60,0,4,.35)';g.beginPath();g.ellipse(0,146,108,16,0,0,TAU);g.fill();g.fillStyle=metal(-104,104,1);g.beginPath();g.ellipse(0,146,102,12,0,0,TAU);g.fill();
 g.strokeStyle='rgba(255,180,180,.5)';g.lineWidth=1.5;g.beginPath();g.ellipse(0,146,108,16,0,Math.PI*1.05,Math.PI*1.6);g.stroke();
 // body
 g.fillStyle=metal(-128,128);g.beginPath();g.moveTo(-104,190);g.lineTo(104,190);g.quadraticCurveTo(110,190,111,198);g.lineTo(126,412);g.lineTo(-126,412);g.lineTo(-111,198);g.quadraticCurveTo(-110,190,-104,190);g.fill();
 g.fillStyle='rgba(0,0,0,.18)';g.fillRect(-112,190,224,6);
 // coin plate + slot
 g.fillStyle='rgba(60,0,4,.35)';g.beginPath();g.arc(2,256,56,0,TAU);g.fill();
 g.fillStyle=chrome(-54,200,54,310);g.beginPath();g.arc(0,254,54,0,TAU);g.fill();g.strokeStyle='rgba(255,255,255,.9)';g.lineWidth=1.5;g.beginPath();g.arc(0,254,52,Math.PI*1.05,Math.PI*1.7);g.stroke();
 g.strokeStyle='rgba(70,75,85,.55)';g.lineWidth=2;g.beginPath();g.arc(0,254,46,0,TAU);g.stroke();
 g.fillStyle='#2a2d33';rr(-4,210,8,26,4);g.fill();g.fillStyle='#e8ebf0';rr(-6,236,12,2,1);g.fill();
 
 // crank
 g.save();g.translate(0,266);g.rotate(crankA);g.fillStyle='rgba(0,0,0,.18)';rr(-48,-6,96,16,8);g.fill();g.fillStyle=chrome(0,-9,0,9);rr(-48,-9,96,18,9);g.fill();
 for(const sx of[-1,1]){gr=g.createRadialGradient(sx*42-3,-4,1,sx*42,0,12);gr.addColorStop(0,'#fff');gr.addColorStop(.5,'#c9cdd4');gr.addColorStop(1,'#7c818b');g.fillStyle=gr;g.beginPath();g.arc(sx*42,0,11,0,TAU);g.fill()}g.restore();
 gr=g.createRadialGradient(-4,262,1,0,266,14);gr.addColorStop(0,'#ff8a8a');gr.addColorStop(.45,'#d81c24');gr.addColorStop(1,'#760a10');g.fillStyle=gr;g.beginPath();g.arc(0,266,12,0,TAU);g.fill();
 // chute
 g.fillStyle='rgba(60,0,4,.35)';rr(-55,326,112,78,22);g.fill();g.fillStyle=chrome(-54,320,54,400);rr(-54,322,108,76,22);g.fill();
 g.fillStyle='#22252b';rr(-44,330,88,58,16);g.fill();gr=g.createLinearGradient(0,330,0,388);gr.addColorStop(0,'rgba(0,0,0,.6)');gr.addColorStop(1,'rgba(60,60,70,0)');g.fillStyle=gr;rr(-44,330,88,58,16);g.fill();
 if(out&&out.inChute){g.save();rr(-44,330,88,58,16);g.clip();drawBall(out.b,out.x,out.y,out.s,1);g.restore()}
 // flap (hinged at the top, swings up as a ball comes through)
 {const fh=58*(1-flap*.82);g.fillStyle=chrome(-44,330,44,330+fh);rr(-44,330,88,Math.max(6,fh),Math.min(16,fh/2));g.fill();g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=1.5;g.beginPath();g.moveTo(-36,333);g.lineTo(36,333);g.stroke()}
 // base
 g.fillStyle=metal(-150,150,1);g.beginPath();g.moveTo(-128,410);g.lineTo(128,410);g.quadraticCurveTo(150,412,152,428);g.lineTo(152,436);g.quadraticCurveTo(150,446,128,446);g.lineTo(-128,446);g.quadraticCurveTo(-150,446,-152,436);g.lineTo(-152,428);g.quadraticCurveTo(-150,412,-128,410);g.fill();
 g.fillStyle='rgba(255,255,255,.22)';g.fillRect(-126,412,252,3);
 // tray lip in front of the dispensed ball
 if(out&&!out.inChute&&out.vis)drawBall(out.b,out.x,out.y,out.s,out.al);
 g.fillStyle=chrome(-60,396,60,420);g.beginPath();g.moveTo(-62,398);g.quadraticCurveTo(0,430,62,398);g.lineTo(62,404);g.quadraticCurveTo(0,438,-62,404);g.closePath();g.fill();
 // returning ball falls in through the lid opening (drawn above the lid while it enters)
 for(const b of balls)if(b.st==='drop')drawBall(b,b.x,b.y,1,b.al);
 if(coin)coin.draw(now);
 g.restore()}
// ---- spin sequence ----
function btnMachine(){const r=btn.getBoundingClientRect();return[((r.left+r.width*.1+16)-OX)/S,((r.top+r.height/2)-OY)/S]}
function spin(){if(busy)return;busy=true;btn.disabled=true;btn.classList.add('used');const rm=RM.matches,t0=performance.now();
 const cand=balls.filter(b=>b.st==='in'&&b.id!==lastPick),pick=cand[Math.floor(Math.random()*cand.length)];lastPick=pick.id;
 const D=rm?{coin:350,crank:500,churn:0,pull:0,sink:0,wait:0,emerge:450}:{coin:1150,crank:1500,churn:1700,pull:600,sink:450,wait:350,emerge:900};
 const[sx0,sy0]=btnMachine(),slot=[0,222];
 coin={draw(now){const t=(now-t0)/D.coin;if(t>=1){coin=null;return}g.save();
  if(rm){g.translate(slot[0],slot[1]);coinFace(22,1-t*.85,1-t)}
  else{const a=clamp(t/.62),p=eo(a),x=lerp(sx0,slot[0]+40,p),y=lerp(sy0,slot[1],p)-Math.sin(p*Math.PI)*120;
   if(t<.62){g.translate(x,y);coinFace(lerp(30,22,p),1,1,(1-p)*2.4)}
   else if(t<.82){const q=eio((t-.62)/.2);g.translate(lerp(slot[0]+40,slot[0],q),slot[1]);coinFace(22,lerp(1,.16,q),1)}
   else{const q=(t-.82)/.18;g.beginPath();g.rect(-40,150,80,64);g.clip();g.translate(slot[0],slot[1]+ei(q)*40-8*q);coinFace(22,.16,1)}}
  g.restore()}};
 const tCr=t0+D.coin,tCh=tCr+120,tPull=tCr+D.crank+(rm?0:D.churn-D.crank+500),tSink=tPull+D.pull,tWait=tSink+D.sink,tEm=tWait+D.wait,tEnd=tEm+D.emerge;
 const a0=crankA;
 T={churn:now=>rm||now<tCh?0:now<tCh+D.churn?Math.sin(clamp((now-tCh)/D.churn)*Math.PI)*1.1:0,
  tick(now){
   if(now>=tCr&&now<tCr+D.crank+60){crankA=a0+(rm?Math.PI/2:TAU)*eio(clamp((now-tCr)/D.crank))}
   if(!rm&&now>=tPull&&now<tSink){const q=eio(clamp((now-tPull)/D.pull));pick.st='in';pick.x=lerp(pick.px??(pick.px=pick.x),0,q);pick.y=lerp(pick.py??(pick.py=pick.y),GR,q);pick.vx=pick.vy=0;pick.a+=.08}
   if(!rm&&now>=tSink&&now<tWait){pick.st='sink';const q=ei(clamp((now-tSink)/D.sink));pick.x=0;pick.y=lerp(GR,G+R+40,q);pick.a+=.1}
   if(now>=tWait&&pick.st!=='out'){pick.st='out';delete pick.px;delete pick.py;if(rm)settle(2)}
   if(now>=tEm){const q=clamp((now-tEm)/D.emerge);flap=rm?clamp(q*3)*(q<.8?1:(1-q)*5):Math.sin(clamp(q/.6)*Math.PI);
    if(rm){out={b:pick,inChute:false,vis:true,x:0,y:388,s:1.12,al:clamp(q*2)}}
    else if(q<.35){const k=eo(q/.35);out={b:pick,inChute:true,x:0,y:lerp(318,372,k),s:lerp(.95,1.05,k)}}
    else{const k=(q-.35)/.65,bn=Math.abs(Math.sin(k*Math.PI*2.2))*(1-k)*22;out={b:pick,inChute:false,vis:true,x:0,y:lerp(372,390,eo(clamp(k*2)))-bn,s:lerp(1.05,1.14,eo(k)),al:1};pick.a+=.06*(1-k)}}
   if(now>=tEnd){T=null;flap=0;showPop(pick)}}}}
// ---- popup ----
function onColor(hex){const n=parseInt(hex.slice(1),16),r=n>>16&255,gg=n>>8&255,b=n&255;return(r*.299+gg*.587+b*.114)>150?'#1d1d24':'#fff'}
function showPop(b){const rm=RM.matches;pname.textContent=b.name;pgo.hidden=!b.href;if(b.href){pgo.href=b.href;pgo.textContent='Go to '+b.name}
 if(b.href&&/^https?:/.test(b.href)){pgo.target='_blank';pgo.rel='noopener'}else{pgo.removeAttribute('target');pgo.removeAttribute('rel')}
 pop.style.setProperty('--acc',b.acc);pop.style.setProperty('--on',onColor(b.acc));
 const D=Math.round(Math.min(W*.68,H*.4,360));pop.style.setProperty('--D',D+'px');{const px=Math.round(D*dpr);pimg.width=pimg.height=px;const x=pimg.getContext('2d');x.clearRect(0,0,px,px);drawBall(b,px/2,px/2,1,1,x,px*.98)}pimg.setAttribute('aria-label',b.name);pop.hidden=false;
 const ir=pimg.getBoundingClientRect(),bx=SX(out?out.x:0),by=SY(out?out.y:390),bs=R*2.2*(out?out.s:1)*S/(ir.width*.98||1);
 pop.querySelector('.burst').style.setProperty('--by',(ir.top+ir.height/2)+'px');
 const txt=pop.querySelector('.ptxt');
 if(rm){pop.animate([{opacity:0},{opacity:1}],{duration:200,fill:'both'})}
 else{pop.animate([{backgroundColor:'rgba(255,255,255,0)',backdropFilter:'blur(0px)'},{backgroundColor:'rgba(255,255,255,.72)',backdropFilter:'blur(8px)'}],{duration:420,easing:'ease-out'});
  pimg.animate([{transform:`translate(${bx-(ir.left+ir.width/2)}px,${by-(ir.top+ir.height/2)}px) scale(${bs})`},{transform:'translate(0,0) scale(1.1)',offset:.68},{transform:'translate(0,0) scale(.97)',offset:.86},{transform:'none'}],{duration:760,easing:'cubic-bezier(.3,.7,.3,1)',fill:'both'});
  pop.querySelector('.burst').animate([{transform:'scale(.3)',opacity:0},{transform:'scale(1)',opacity:.38,offset:.45},{transform:'scale(1.5)',opacity:0}],{duration:900,delay:380,easing:'ease-out'});
  txt.animate([{opacity:0,transform:'translateY(14px)'},{opacity:1,transform:'none'}],{duration:420,delay:430,easing:'cubic-bezier(.2,.8,.3,1)',fill:'both'})}
 (b.href?pgo:again).focus({preventScroll:true})}
function closePop(then){const rm=RM.matches;const fin=()=>{pop.hidden=true;returnBall();then&&then()};
 if(rm){fin();return}const a=pop.animate([{opacity:1},{opacity:0}],{duration:240,easing:'ease-in'});pimg.animate([{transform:'none'},{transform:'scale(.6)'}],{duration:240,easing:'ease-in',fill:'both'});a.onfinish=fin}
function returnBall(){const b=out&&out.b;out=null;if(!b){busy=false;btn.disabled=false;btn.classList.remove('used');return}
 if(RM.matches){b.st='in';b.x=(Math.random()-.5)*60;b.y=-GR*.6;settle(2.5);busy=false;btn.disabled=false;btn.classList.remove('used');return}
 b.st='drop';b.x=0;b.y=-190;b.al=0;b.vx=(Math.random()-.5)*60;b.vy=0;const t0=performance.now();
 T={tick(now){const q=(now-t0)/450;b.al=clamp(q*2);b.y=lerp(-190,-110,eo(clamp(q)));if(q>=1){b.st='in';b.vy=380;T=null;busy=false;btn.disabled=false;btn.classList.remove('used');if(queued){queued=false;spin()}}}}}
let queued=false;
btn.addEventListener('click',spin);
again.addEventListener('click',()=>{queued=!RM.matches;closePop(()=>{if(RM.matches)spin()})});
addEventListener('keydown',e=>{if(e.key==='Escape'&&!pop.hidden)closePop()});
pop.addEventListener('click',e=>{if(e.target===pop)closePop()});
// ---- start ----
resize();scatter();settle(4);requestAnimationFrame(frame);
window.__gumball={balls,spin,get busy(){return busy},get open(){return!pop.hidden},PL};
})();

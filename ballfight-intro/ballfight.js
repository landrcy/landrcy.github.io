/* Eternal Ball Fight — boxing-ring arena with spotlight matchup intro.
   Roster = the ball characters from the Langrino YouTube channel (names/colours from Shorts titles + thumbnails).
   Physics: fixed 60 Hz step with accumulator (identical speed at 30/60/144 Hz), dt capped at 50 ms.
   Intro plays once when the arena scrolls into view; click / any key skips; prefers-reduced-motion = no intro, slow fight. */
(function(){
const cv=document.getElementById('bf');if(!cv)return;
const g=cv.getContext('2d');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,SPD=RM?.3:1;
const QS=new URLSearchParams(location.search),MANUAL=QS.has('bfmanual');
const STEP=1000/60;
/* ---------- roster ---------- */
const ROSTER=[
 {n:'Sword Ball',c:'#e63950',w:'sword',q:"I'm simply the sharpest."},
 {n:'Trident Ball',c:'#3fd3ea',w:'trident',q:"Three points. Zero chill."},
 {n:'Rapier Ball',c:'#4a7dff',w:'rapier',q:"Poke first, ask later."},
 {n:'Swordlass',c:'#c4213f',w:'cutlass',q:"Ahoy, ya squishy orb!"},
 {n:'Snowball',c:'#e6ebf5',w:'none',body:7,grow:1.2,r:15,q:"Chill out. I'll roll over you."},
 {n:'Chess Ball',c:'#b9d33f',w:'king',q:"Checkmate in three moves."},
 {n:'Toxic Spike',c:'#6fdc2f',w:'spikes',q:"Don't touch. Seriously."},
 {n:'Grow Ball',c:'#ff8a1f',w:'none',body:5,grow:.9,q:"Wait till I get bigger."},
 {n:'Clone Ball',c:'#a21cb0',w:'clone',q:"Which one's the real me?"},
 {n:'Glass Ball',c:'#aeb9cf',w:'none',body:10,glass:1,q:"Handle with care. Please."},
 {n:'Chainsaw Ball',c:'#ff9a1f',w:'chainsaw',q:"BZZZZ. Let's talk."},
 {n:'Pinball',c:'#d9deea',rim:'#ff6be0',w:'none',body:6,fast:1.55,q:"Tilt! Tilt! Tilt!"},
 {n:'Club Ball',c:'#b9783a',w:'club',q:"One bonk. Nap time."},
 {n:'Lance Ball',c:'#2fc4e4',w:'lance',q:"Long reach, short temper."},
 {n:'Lightning Ball',c:'#e8a824',w:'zap',q:"Shocking, I know."}];
const WP={sword:{L:16,dmg:8,spin:.09},cutlass:{L:15,dmg:9,spin:.085},rapier:{L:23,dmg:6,spin:.07},trident:{L:22,dmg:7,spin:.06},lance:{L:31,dmg:6,spin:.045},
 club:{L:14,dmg:9,spin:.05,stun:36},chainsaw:{L:13,dmg:2.2,spin:.16,cd:7},spikes:{L:7,dmg:3,spin:.05,cd:14},king:{L:10,dmg:7,spin:.07},clone:{L:9,dmg:3,spin:.06,cd:16},zap:{L:0,dmg:8,spin:.03},none:{L:0,dmg:0,spin:.03}};
/* ---------- dom ---------- */
const board=document.getElementById('bf-board'),fightEl=document.getElementById('bf-fight'),stEl=document.getElementById('bf-status'),arenaEl=cv.closest('.bf-arena')||cv.parentNode;
const KEY='llcBallStandingsV2';let S={};try{S=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
function render(){const rows=ROSTER.map(r=>({n:r.n,c:r.c,W:(S[r.n]||{}).w||0,L:(S[r.n]||{}).l||0})).sort((a,b)=>b.W-a.W||a.L-b.L||a.n.localeCompare(b.n));
 board.innerHTML=rows.map((r,i)=>`<li><span class="rk">${i+1}</span><i style="background:${r.c}"></i><span>${r.n}</span><span class="w">${r.W}W</span><span class="l">${r.L}L</span></li>`).join('')}
render();document.getElementById('bf-reset').onclick=()=>{S={};try{localStorage.removeItem(KEY);localStorage.removeItem(KEY+'N')}catch(e){}render()};
let fightN=+(localStorage.getItem(KEY+'N')||0)+1;
/* ---------- helpers ---------- */
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t)},eo=t=>1-Math.pow(1-clamp(t,0,1),3),eob=t=>{t=clamp(t,0,1)-1;return 1+2.7*t*t*t+1.7*t*t};
const BAY=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v=>(v+.5)/64);
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
/* crisp pixel text sprites (alpha thresholded => no anti-aliasing) */
const SP=new Map();let fontGen=0;
function spr(str,font,col,ol){const k=fontGen+'|'+str+'|'+font+'|'+col+'|'+ol;let s=SP.get(k);if(s)return s;
 const m=document.createElement('canvas').getContext('2d');m.font=font;const w=Math.ceil(m.measureText(str).width)+4,h=parseInt(font.match(/(\d+)px/)[1])+6;
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.font=font;x.textBaseline='middle';x.textAlign='left';
 if(ol){x.fillStyle=ol;for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1],[1,1],[-1,-1],[1,-1],[-1,1]])x.fillText(str,2+dx,h/2+dy)}
 x.fillStyle=col;x.fillText(str,2,h/2);const id=x.getImageData(0,0,w,h),d=id.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>110?255:0;x.putImageData(id,0,0);
 if(SP.size>500)SP.clear();s={c,w,h};SP.set(k,s);return s}
const F8='8px Silkscreen',F7='7px Silkscreen',F10='10px Silkscreen',F16='bold 16px Silkscreen',F26='bold 26px Silkscreen',FQ='9px "Pixelify Sans"',FQB='bold 10px "Pixelify Sans"';
function txt(str,x,y,font,col,al,ol,alpha){const s=spr(str,font,col,ol||'#0b0618');const px=Math.round(al==='c'?x-s.w/2:al==='r'?x-s.w:x),py=Math.round(y-s.h/2);if(alpha!=null&&alpha<1)g.globalAlpha=alpha;g.drawImage(s.c,px,py);g.globalAlpha=1;return s}
function wrap(str,font,maxW){const m=document.createElement('canvas').getContext('2d');m.font=font;const ws=str.split(' '),L=[];let cur='';for(const w of ws){const t=cur?cur+' '+w:w;if(m.measureText(t).width>maxW&&cur){L.push(cur);cur=w}else cur=t}L.push(cur);return L}
/* ---------- layout / static scene ---------- */
let AW,AH,SC,FT,FB,PX0,hb,hf,cx,bgA,bgB,fgL,mask,mg,maskImg;
const wl=y=>lerp(AW*.085,AW*.02,clamp((y-FT)/(FB-FT),0,1)),wr=y=>AW-wl(y);
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c}
function layout(){const cw=Math.max(240,Math.floor(arenaEl.clientWidth-8));SC=cw>=640?2:1;AW=Math.floor(cw/SC);AH=Math.round(AW*.69);cv.width=AW;cv.height=AH;g.imageSmoothingEnabled=false;
 FT=Math.round(AH*.38);FB=AH-9;hb=Math.round(AH*.17);hf=Math.round(AH*.3);cx=AW/2;
 const gen=fontGen;bgA=buildBG(0);bgB=buildBG(1);fgL=buildFG();mask=mk(AW,AH);mg=mask.getContext('2d');maskImg=mg.createImageData(AW,AH);SP.clear()}
function disc(x,y,r,c){g.fillStyle=c;for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+.25));g.fillRect(Math.round(x-w),Math.round(y+dy),w*2+1,1)}}
function ropeLine(c,x0,y0,x1,y1,col,w){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0||1;c.fillStyle=col;for(let i=0;i<=n;i++){const t=i/n;c.fillRect(Math.round(x0+(x1-x0)*t),Math.round(y0+(y1-y0)*t),w,w)}}
function crowd(c,frame){const R=rng(77),rows=[];for(let y=FT-3;y>5;y-=9)rows.push(y);rows.reverse(); // far -> near
 const acc=['#8f2a4a','#2a5a8f','#8f6a2a','#4a2a8f','#2a8f6a','#8f4a2a'],b0=hex('#0a0516'),f0=hex('#3a2466');
 const mix=(k,o)=>'rgb('+[0,1,2].map(i=>Math.round(clamp(lerp(b0[i],f0[i],k)+o,0,255))).join(',')+')';
 rows.forEach((by,ri)=>{const k=.25+.75*ri/(rows.length-1||1),sp=8,off=(ri%2)*4;
  for(let x=-4+off;x<AW+4;x+=sp){const hx=Math.round(x+(R()*3-1)|0),up=frame&&R()<.38,hy=by+(up?-2:0)+(R()*2|0),lit=R()<.16,hat=R()<.07;
   const body=mix(k,0),head=mix(k,10);
   c.fillStyle=body;c.fillRect(hx-4,hy+4,9,12);c.fillRect(hx-3,hy+3,7,2);
   if(lit){c.fillStyle=acc[(R()*acc.length)|0];c.globalAlpha=.55;c.fillRect(hx-4,hy+5,9,3);c.globalAlpha=1}
   if(up){c.fillStyle=body;c.fillRect(hx-5,hy-5,2,9);c.fillRect(hx+4,hy-5,2,9);c.fillStyle=head;c.fillRect(hx-5,hy-6,2,2);c.fillRect(hx+4,hy-6,2,2)}
   c.fillStyle=head;c.fillRect(hx-2,hy-2,5,6);c.fillRect(hx-3,hy-1,7,4);
   c.fillStyle=mix(k,38);c.fillRect(hx-2,hy-3,5,1);c.fillRect(hx-1,hy-2,3,1);
   if(hat){c.fillStyle=acc[(R()*acc.length)|0];c.fillRect(hx-3,hy-3,7,2)}}})}
function buildBG(frame){const c=mk(AW,AH),x=c.getContext('2d');
 // dark hall wall w/ dithered vertical gradient
 const id=x.createImageData(AW,AH),d=id.data;const A=hex('#07030f'),B=hex('#1a0e32'),F1=hex('#241a66'),F2=hex('#4d3cc0'),AP=hex('#0e0719');
 for(let y=0;y<AH;y++)for(let X=0;X<AW;X++){let col;const th=BAY[(y&7)*8+(X&7)];
  if(y<FT){const t=y/FT;col=th<t*.9?B:A}
  else{const t=(y-FT)/(FB-FT),l=wl(y),r=wr(y);
   if(X>=l&&X<=r){const dx=(X-cx)/(AW*.5),dy=(y-(FT+FB)/2)/((FB-FT)*.55),e=Math.sqrt(dx*dx*.9+dy*dy);const lv=clamp(1-e*.95,0,1)*.9+.06;col=th<lv?F2:F1;
    if(((y-FT)%11)===0&&th<.55)col=F1;
    if(y>=FB-2)col=[233,226,255]}
   else col=th<.25?B:AP}
  const k=(y*AW+X)*4;d[k]=col[0];d[k+1]=col[1];d[k+2]=col[2];d[k+3]=255}
 x.putImageData(id,0,0);
 // hanging lights + dithered glow
 for(let i=0;i<4;i++){const lx=Math.round(AW*(.14+i*.24)),ly=3;x.fillStyle='#fff3b0';x.fillRect(lx-3,ly,7,2);x.fillStyle='#ffd966';x.fillRect(lx-2,ly+2,5,1);
  x.fillStyle='rgba(255,226,130,.35)';for(let yy=ly+3;yy<ly+26;yy++)for(let xx=lx-(yy-ly)*.6;xx<=lx+(yy-ly)*.6;xx++)if(BAY[(yy&7)*8+(Math.round(xx)&7)]<.16*(1-(yy-ly)/26))x.fillRect(Math.round(xx),yy,1,1)}
 crowd(x,frame);
 // apron / floor edge + red skirt
 x.fillStyle='#8c1f3a';x.fillRect(0,FB+1,AW,AH-FB-1);x.fillStyle='#c4344f';x.fillRect(0,FB+3,AW,1);x.fillStyle='#e9e2ff';x.fillRect(0,FB+1,AW,1);
 // mat logo
 const lg=spr('LANGRINO',F26,'#4636ad','#33268a');x.drawImage(lg.c,Math.round(cx-lg.w/2),Math.round(FB-lg.h/2-16));
 // back posts + ropes (ropes rendered in front of crowd, behind fighters)
 const bx0=wl(FT),bx1=wr(FT),fx0=wl(FB),fx1=wr(FB),cols=['#e63950','#f4f0ff','#4a7dff'];
 [.4,.68,.96].forEach((f,i)=>{ropeLine(x,bx0,FT-hb*f,bx1,FT-hb*f,cols[i],2);ropeLine(x,bx0,FT-hb*f,fx0,FB-hf*f,cols[i],2);ropeLine(x,bx1,FT-hb*f,fx1,FB-hf*f,cols[i],2);
  ropeLine(x,bx0,FT-hb*f+2,bx1,FT-hb*f+2,'rgba(0,0,0,.35)',1)});
 post(x,bx0,FT,hb,'#e63950');post(x,bx1,FT,hb,'#4a7dff');
 return c}
function post(x,px,py,h,pad){x.fillStyle='#16101f';x.fillRect(px-2,py-h,4,h+2);x.fillStyle='#4b3f66';x.fillRect(px-2,py-h,1,h+2);x.fillStyle=pad;
 for(const f of[.4,.68,.96]){x.fillRect(px-4,Math.round(py-h*f)-3,8,7);x.fillStyle='rgba(255,255,255,.35)';x.fillRect(px-3,Math.round(py-h*f)-3,2,7);x.fillStyle=pad}
 x.fillStyle='#2a2140';x.fillRect(px-3,py-h-3,6,3)}
function buildFG(){const c=mk(AW,AH),x=c.getContext('2d');post(x,wl(FB),FB,hf,'#f4f0ff');post(x,wr(FB),FB,hf,'#f4f0ff');return c}
/* ---------- state ---------- */
let mode='idle',balls=[],sparks=[],nums=[],bolts=[],tick=0,acc=0,T=0,shake=0,over=0,overT=0,annT=0,banner=null,winner=null,pair=null,prevPair=null,vis=false,introDone=false,flash=0,crowdE=0,clock=0;
function pickPair(first){if(first&&QS.get('bfpair')){const p=QS.get('bfpair').split(',').map(Number);if(p.length===2&&ROSTER[p[0]]&&ROSTER[p[1]])return p}
 let a,b;do{a=Math.random()*ROSTER.length|0;b=Math.random()*ROSTER.length|0}while(a===b||(prevPair&&((a===prevPair[0]&&b===prevPair[1])||(a===prevPair[1]&&b===prevPair[0]))));return[a,b]}
function startXY(i){return{x:i?cx+AW*.22:cx-AW*.22,y:(FT+FB)/2+10}}
function mkBall(spec,i){const s=startXY(i),a=i?Math.PI:0;return{s:spec,name:spec.n,c:spec.c,w:spec.w,i,x:s.x,y:s.y,px:s.x,py:s.y,vx:(i?-1:1)*(1.4+Math.random()),vy:(Math.random()-.5)*2.5,r:spec.r||14,hp:100,ang:a,pang:a,dir:Math.random()<.5?1:-1,cd:{},fl:0,stun:0,poison:0,t:0,cr:[],zapT:50+Math.random()*30,dm:1}}
function newMatch(first){prevPair=pair;pair=pickPair(first);balls=pair.map((k,i)=>mkBall(ROSTER[k],i));sparks=[];nums=[];bolts=[];over=0;winner=null;tick=0;fightEl.textContent='Fight #'+fightN;stEl.textContent=balls[0].name+' vs '+balls[1].name}
/* ---------- weapons ---------- */
function pt(c,x,y,s){g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),s||1,s||1)}
function ln(x0,y0,x1,y1,c,w){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0||1;for(let i=0;i<=n;i++){const t=i/n;pt(c,x0+(x1-x0)*t-(w>1?.5:0),y0+(y1-y0)*t-(w>1?.5:0),w||1)}}
// returns hit circles [x,y,rad]
function weapon(b,x,y,ang,draw){const W=WP[b.w],ca=Math.cos(ang),sa=Math.sin(ang),r=b.r,bx=x+ca*r,by=y+sa*r,tx=x+ca*(r+W.L),ty=y+sa*(r+W.L),mx=x+ca*(r+W.L*.5),my=y+sa*(r+W.L*.5),pts=[];
 switch(b.w){
 case'sword':if(draw){ln(bx,by,tx,ty,'#f1f1ff',2);pt('#aeb4d4',tx,ty,1);ln(bx-sa*4,by+ca*4,bx+sa*4,by-ca*4,'#e0b43e',2);ln(bx-ca*2,by-sa*2,bx,by,'#8a5a2a',2)}pts.push([mx,my,3],[tx,ty,3]);break;
 case'cutlass':if(draw){for(let i=0;i<=12;i++){const t=i/12,a=ang+.55*t*t*b.dir,px=x+Math.cos(a)*(r+W.L*t),py=y+Math.sin(a)*(r+W.L*t);pt('#e6eaf7',px,py,2)}ln(bx-sa*4,by+ca*4,bx+sa*4,by-ca*4,'#d9a52f',2);pt('#8a5a2a',bx-ca*2,by-sa*2,2)}pts.push([mx,my,3],[tx+sa*b.dir*2,ty-ca*b.dir*2,3]);break;
 case'rapier':if(draw){ln(bx,by,tx,ty,'#eaf2ff',1);for(let i=-3;i<=3;i++){const a=ang+i*.3;pt('#7aa0ff',bx+Math.cos(a)*4,by+Math.sin(a)*4,1)}pt('#fff',tx,ty,1)}pts.push([mx,my,2],[tx,ty,2]);break;
 case'trident':if(draw){ln(bx,by,tx-ca*3,ty-sa*3,'#d8c15a',2);for(const o of[-3,0,3]){ln(tx-ca*5-sa*o,ty-sa*5+ca*o,tx-sa*o+ca*2,ty+ca*o+sa*2,'#c8f6ff',1)}ln(tx-ca*4-sa*3,ty-sa*4+ca*3,tx-ca*4+sa*3,ty-sa*4-ca*3,'#c8f6ff',1)}pts.push([tx,ty,4],[tx-sa*3,ty+ca*3,2],[tx+sa*3,ty-ca*3,2]);break;
 case'lance':if(draw){ln(bx,by,tx,ty,'#c9a46a',2);ln(tx-ca*7,ty-sa*7,tx+ca*3,ty+sa*3,'#eef6ff',2);for(let i=1;i<=3;i++)pt('#e63950',x+ca*(r+i*6),y+sa*(r+i*6),2)}pts.push([tx,ty,3],[x+ca*(r+W.L*.7),y+sa*(r+W.L*.7),3]);break;
 case'club':if(draw){ln(bx,by,tx,ty,'#8a5a2a',2);disc(tx,ty,4,'#5b3416');pt('#d9d9e8',tx+1,ty-2,1);pt('#d9d9e8',tx-2,ty+1,1);pt('#c08a52',tx-1,ty-1,2)}pts.push([tx,ty,5]);break;
 case'chainsaw':if(draw){ln(bx,by,tx,ty,'#c9ccd8',3);for(let i=0;i<W.L;i+=2){const o=((i+(b.t>>1))%4<2);pt(o?'#2a2a38':'#fff',x+ca*(r+i)-sa*2,y+sa*(r+i)+ca*2,1);pt(o?'#fff':'#2a2a38',x+ca*(r+i)+sa*2,y+sa*(r+i)-ca*2,1)}ln(bx-ca*3,by-sa*3,bx,by,'#e0701a',4)}pts.push([mx,my,4],[tx,ty,4]);break;
 case'spikes':for(let k=0;k<8;k++){const a=ang+k*Math.PI/4,c2=Math.cos(a),s2=Math.sin(a);if(draw){ln(x+c2*(r-1),y+s2*(r-1),x+c2*(r+W.L),y+s2*(r+W.L),'#3f8f16',2);pt('#e4ff8a',x+c2*(r+W.L),y+s2*(r+W.L),2)}pts.push([x+c2*(r+W.L-1),y+s2*(r+W.L-1),2.5])}break;
 case'king':{const px=x+ca*(r+9),py=y+sa*(r+9);if(draw){g.fillStyle='#1a0b2e';g.fillRect(Math.round(px)-3,Math.round(py)-5,7,11);g.fillStyle='#f6f0d2';g.fillRect(Math.round(px)-2,Math.round(py)-1,5,6);g.fillRect(Math.round(px)-1,Math.round(py)-4,3,3);g.fillRect(Math.round(px),Math.round(py)-5,1,1);g.fillStyle='#d4a63a';g.fillRect(Math.round(px)-1,Math.round(py)-3,3,1);g.fillRect(Math.round(px),Math.round(py)-4,1,3);g.fillStyle='#7d7650';g.fillRect(Math.round(px)-3,Math.round(py)+4,7,1)}pts.push([px,py,5]);break}
 case'clone':for(let k=0;k<2;k++){const a=ang+k*Math.PI,px=x+Math.cos(a)*(r+8),py=y+Math.sin(a)*(r+8);if(draw){disc(px,py,5,'#1a0b2e');disc(px,py,4,k?'#ff7bd5':'#d53fe0');pt('#fff',px-2,py-2,1)}pts.push([px,py,5])}break}
 return pts}
/* ---------- sim ---------- */
function wallClamp(b){const y0=FT+b.r*.55,y1=FB-b.r;if(b.y<y0){b.y=y0;b.vy=Math.abs(b.vy)}if(b.y>y1){b.y=y1;b.vy=-Math.abs(b.vy)}
 const l=wl(b.y)+b.r+3,r=wr(b.y)-b.r-3;if(b.x<l){b.x=l;b.vx=Math.abs(b.vx)}if(b.x>r){b.x=r;b.vx=-Math.abs(b.vx)}}
function dmgNum(x,y,v,c){nums.push({x,y,l:34,v:'-'+(v<1?v.toFixed(1):Math.round(v)),c})}
function hit(t,dmg,from,fx,fy,kb){if(t.hp<=0)return;const sd=1+Math.max(0,tick-2400)/600;dmg*=sd*(t.s.glass?1.6:1);t.hp=Math.max(0,t.hp-dmg);t.fl=6;const a=Math.atan2(t.y-fy,t.x-fx);t.vx+=Math.cos(a)*(kb||2.2);t.vy+=Math.sin(a)*(kb||2.2);
 for(let i=0;i<7;i++)sparks.push({x:fx,y:fy,vx:(Math.random()-.5)*3.4,vy:(Math.random()-.5)*3.4,l:16,c:i%2?'#fff':t.c});
 dmgNum(t.x+(Math.random()-.5)*10,t.y-t.r-4,dmg,'#ffe08a');if(dmg>=6){shake=Math.max(shake,2)}crowdE=Math.min(1,crowdE+.25);
 if(t.s.glass){t.cr.push([(Math.random()-.5)*t.r,(Math.random()-.5)*t.r,Math.random()*6.28])}
 if(from)from.dir*=-1;
 if(from&&from.s.grow){from.r=Math.min(from.s.n==='Snowball'?21:19,from.r+from.s.grow*.5);from.hp=Math.min(130,from.hp+(from.s.n==='Grow Ball'?1.5:0))}}
function update(){ // one fixed tick
 tick++;const alive=balls.filter(b=>b.hp>0);
 for(const b of alive){b.px=b.x;b.py=b.y;b.pang=b.ang;b.t++;const W=WP[b.w],sp=Math.hypot(b.vx,b.vy);
  if(b.stun>0){b.stun--;b.vx*=.9;b.vy*=.9}
  b.x+=b.vx*SPD;b.y+=b.vy*SPD;b.ang+=W.spin*b.dir*SPD*(b.stun>0?.3:1);
  const lo=1.6*(b.s.fast||1),hi=4*(b.s.fast||1);if(sp<lo&&!b.stun){b.vx*=1.05;b.vy*=1.05}if(sp>hi){b.vx*=.97;b.vy*=.97}
  wallClamp(b);if(b.fl>0)b.fl--;for(const k in b.cd)if(b.cd[k]>0)b.cd[k]-=SPD;
  if(b.poison>0){b.poison--;if(b.t%12===0){b.hp=Math.max(0,b.hp-.7);sparks.push({x:b.x+(Math.random()-.5)*b.r,y:b.y,vx:0,vy:-.6,l:16,c:'#8dff3a'})}}
  if(b.w==='zap'){b.zapT-=SPD;const o=alive.find(q=>q!==b);if(o&&b.zapT<=0&&Math.hypot(o.x-b.x,o.y-b.y)<95){b.zapT=75;hit(o,W.dmg,b,o.x,o.y,2.8);const pts=[];const n=7;for(let i=0;i<=n;i++){const t=i/n;pts.push([lerp(b.x,o.x,t)+(i&&i<n?(Math.random()-.5)*14:0),lerp(b.y,o.y,t)+(i&&i<n?(Math.random()-.5)*14:0)])}bolts.push({pts,l:9});flash=3}}}
 for(let i=0;i<alive.length;i++)for(let j=i+1;j<alive.length;j++){const a=alive[i],b=alive[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy)||1,m=a.r+b.r;
  if(d<m){const nx=dx/d,ny=dy/d,o=(m-d)/2;a.x-=nx*o;a.y-=ny*o;b.x+=nx*o;b.y+=ny*o;const p=(a.vx-b.vx)*nx+(a.vy-b.vy)*ny;if(p>0){a.vx-=p*nx;a.vy-=p*ny;b.vx+=p*nx;b.vy+=p*ny}
   for(const[u,v]of[[a,b],[b,a]])if(u.s.body&&!(u.cd.body>0)){u.cd.body=26;hit(v,u.s.body,u,(u.x+v.x)/2,(u.y+v.y)/2,2.6)}}}
 for(const b of alive){const W=WP[b.w];if(!W.dmg||b.w==='zap')continue;const pts=weapon(b,b.x,b.y,b.ang,false);
  for(const t of alive){if(t===b||t.hp<=0||b.cd[t.name]>0)continue;let hitp=null;for(const p of pts)if(Math.hypot(p[0]-t.x,p[1]-t.y)<t.r+p[2]){hitp=p;break}
   if(hitp){hit(t,W.dmg,b,hitp[0],hitp[1],b.w==='lance'?3:2.2);b.cd[t.name]=W.cd||22;if(W.stun){t.stun=W.stun;sparks.push({x:t.x,y:t.y-t.r,vx:0,vy:-.4,l:30,c:'#ffe45c',star:1})}if(b.w==='spikes')t.poison=150}}}
 sparks=sparks.filter(s=>{s.x+=s.vx;s.y+=s.vy;if(!s.star)s.vy+=.02;s.l--;return s.l>0});nums=nums.filter(n=>{n.y-=.45;n.l--;return n.l>0});bolts=bolts.filter(b=>--b.l>0);
 if(shake>0&&tick%3===0)shake--;crowdE=Math.max(0,crowdE-.004);if(flash>0)flash--;
 const left=balls.filter(b=>b.hp>0);
 if(left.length<=1&&!over){over=1;overT=0;winner=left[0]||null;for(const b of balls){S[b.name]=S[b.name]||{w:0,l:0};if(b===winner)S[b.name].w++;else S[b.name].l++}
  try{localStorage.setItem(KEY,JSON.stringify(S));localStorage.setItem(KEY+'N',fightN)}catch(e){}render();stEl.textContent=(winner?winner.name:'Nobody')+' WINS!';fightN++;crowdE=1;
  for(const b of balls)if(b.hp<=0)for(let i=0;i<26;i++){const a=Math.random()*6.28,s=1+Math.random()*2.6;sparks.push({x:b.x,y:b.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:34,c:i%3?b.c:'#fff'})}
  if(winner)for(let i=0;i<40;i++)sparks.push({x:Math.random()*AW,y:FT-20,vx:(Math.random()-.5)*1.2,vy:Math.random()*1.5,l:90,c:['#ff5d8f','#ffcc4d','#38e1d0','#7c6cff','#fff'][i%5],conf:1})}}
/* ---------- drawing ---------- */
function drawBall(b,x,y,ang,r,alpha){
 if(b.s.rim){disc(x,y,r+1,'#1a0b2e');disc(x,y,r,b.s.rim);disc(x,y,r-2,b.fl?'#fff':b.c)}else{disc(x,y,r+1,'#1a0b2e');disc(x,y,r,b.fl?'#fff':b.c)}
 g.fillStyle='rgba(0,0,0,.2)';for(let dy=0;dy<r-3;dy++){const w=Math.floor(Math.sqrt((r-2)*(r-2)-(dy+2)*(dy+2)));g.fillRect(Math.round(x-w+3),Math.round(y+dy+3),Math.max(1,w),1)}
 pt('rgba(255,255,255,.75)',x-r*.5,y-r*.55,2);pt('rgba(255,255,255,.5)',x-r*.5+2,y-r*.55+1,1);
 if(b.s.glass){for(const[cx0,cy0,a]of b.cr){ln(x+cx0,y+cy0,x+cx0+Math.cos(a)*6,y+cy0+Math.sin(a)*6,'#4a5a7a',1);ln(x+cx0,y+cy0,x+cx0+Math.cos(a+2)*4,y+cy0+Math.sin(a+2)*4,'#4a5a7a',1)}}
 if(b.s.n==='Chess Ball'){g.fillStyle='rgba(20,30,0,.35)';for(let yy=-r+2;yy<r-1;yy+=4)for(let xx=-r+2;xx<r-1;xx+=4)if(((xx+yy)/4&1)===0&&xx*xx+yy*yy<(r-2)*(r-2))g.fillRect(Math.round(x+xx),Math.round(y+yy),4,4)}
 if(b.s.n==='Pinball'){pt('#ff6be0',x-3,y+r-4,2);pt('#ff6be0',x+2,y+r-4,2)}
 if(b.s.n==='Toxic Spike'||b.s.n==='Lightning Ball')pt('#fff',x-1,y-r+2,2)}
function drawHP(b){const sz=Math.round(b.r*.62);txt(String(Math.ceil(b.hp)),b.x,b.y+1,F8,'#fff','c','#1a0b2e')}
function drawFighters(al,ic){ // al = interpolation 0..1
 const list=balls.slice().sort((a,b)=>a.y-b.y);
 for(const b of list){if(b.hp<=0)continue;const x=lerp(b.px,b.x,al),y=lerp(b.py,b.y,al),ang=lerp(b.pang,b.ang,al);
  g.fillStyle='rgba(0,0,0,.35)';g.fillRect(Math.round(x-b.r),Math.round(y+b.r-1),b.r*2,2);
  if(b.w==='spikes'||b.w==='sword'||true){weapon(b,x,y,ang,true)}
  drawBall(b,x,y,ang,Math.round(b.r));drawHP(b);txt(b.name,x,y-b.r-8,F7,'#e9ddff','c')}}
function drawHUD(){balls.forEach((b,i)=>{const w=Math.round(AW*.36),x=i?AW-w-6:6,y=4,pct=b.hp/100,col=pct>.5?'#6bff9a':pct>.25?'#ffcc4d':'#ff5d6d';
 g.fillStyle='rgba(8,4,18,.78)';g.fillRect(x-2,y-2,w+4,19);g.fillStyle='#2a1650';g.fillRect(x,y,w,6);g.fillStyle=col;g.fillRect(x+(i?w-Math.round(w*Math.min(1,pct)):0),y,Math.round(w*Math.min(1,pct)),6);g.fillStyle='rgba(255,255,255,.35)';g.fillRect(x+(i?w-Math.round(w*Math.min(1,pct)):0),y,Math.round(w*Math.min(1,pct)),1);
 txt(b.name.toUpperCase(),i?x+w:x,y+12,F7,b.c,i?'r':'l');})}
function drawEffects(){for(const s of sparks){if(s.conf){g.fillStyle=s.c;g.fillRect(Math.round(s.x),Math.round(s.y),2,3)}else pt(s.c,s.x,s.y,s.star?3:2)}
 for(const b of bolts){for(let i=0;i<b.pts.length-1;i++){ln(b.pts[i][0],b.pts[i][1],b.pts[i+1][0],b.pts[i+1][1],'#fff6b0',3);ln(b.pts[i][0],b.pts[i][1],b.pts[i+1][0],b.pts[i+1][1],'#fff',1)}}
 for(const n of nums)txt(n.v,n.x,n.y,F7,n.c,'c','#3a0f1a',Math.min(1,n.l/14))}
function drawBanner(str,y,col,s,al){const sp=spr(str,F16,col,'#0b0618');const w=Math.round(sp.w*s),h=Math.round(sp.h*s);g.globalAlpha=al==null?1:al;g.drawImage(sp.c,Math.round(cx-w/2),Math.round(y-h/2),w,h);g.globalAlpha=1}
function drawScene(withBalls,al){const t=clock;const frame=RM?0:(Math.floor(t*(2.2+crowdE*5))&1);
 g.drawImage(frame?bgB:bgA,0,0);
 if(!RM){const R=rng(Math.floor(t*6)+3);for(let i=0;i<5;i++){if(R()<.35){g.fillStyle='#fff';const fx=Math.round(R()*AW),fy=Math.round(8+R()*(FT-12));g.fillRect(fx,fy,2,2);g.fillStyle='rgba(255,255,255,.4)';g.fillRect(fx-1,fy,4,2)}}}
 if(withBalls){drawFighters(al);drawEffects()}
 g.drawImage(fgL,0,0)}
/* spotlight dither mask */
function drawMask(rx,ry,dark){const d=maskImg.data;const ox=cx,oy=(FT+FB)/2-6,fe=.5;
 for(let y=0;y<AH;y++){const dy=(y-oy)/ry,dy2=dy*dy,row=(y&7)*8;for(let x=0;x<AW;x++){const dx=(x-ox)/rx,e=Math.sqrt(dx*dx+dy2),a=clamp((e-.8)/.3,0,1)*dark,k=(y*AW+x)*4;
   const on=BAY[row+(x&7)]<a;d[k]=3;d[k+1]=1;d[k+2]=10;d[k+3]=on?255:0}}
 mg.putImageData(maskImg,0,0);g.drawImage(mask,0,0)}
/* ---------- intro timeline ---------- */
const TL={spot:1,slide:1.15,vs:1.55,qa:1.75,qb:2.5,hold:4.2,expand:5.5,round:5.6,fight:6.3,end:6.7};
function ballCard(i){return{x:cx+(i?1:-1)*AW*.16,y:FT+(FB-FT)*.2+2}}
function introFrame(){const t=T,A=balls[0],B=balls[1];const dia=Math.hypot(AW,AH);
 // pose: balls
 const fs=[startXY(0),startXY(1)];
 let k=0;const ex=sm((t-TL.hold)/(TL.expand-TL.hold));// expansion progress
 drawScene(false);
 // draw balls ( card -> start pos )
 const items=balls.map((b,i)=>{const c=ballCard(i);let x,y;const slide=eob((t-.35-i*.1)/(TL.slide-.35));
   x=lerp(i?AW+24:-24,c.x,slide);y=c.y+(t>TL.slide?Math.sin(t*3+i)*1.2:0)-(slide<1?Math.sin(slide*3.14)*10:0);
   x=lerp(x,fs[i].x,ex);y=lerp(y,fs[i].y,ex);return{b,x,y,r:Math.round(lerp(15,b.r,ex))}});
 for(const it of items){const b=it.b;if(t<.35)continue;const ang=t*(1.2+.3*it.b.i)*(it.b.i?-1:1);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(Math.round(it.x-it.r),Math.round(it.y+it.r-1),it.r*2,2);
  const sr=b.r;b.r=it.r;weapon(b,it.x,it.y,ang+(ex>0?lerp(0,b.i?Math.PI:0,ex):0),true);drawBall(b,it.x,it.y,ang,it.r);b.r=sr;txt(String(Math.ceil(b.hp)),it.x,it.y+1,F8,'#fff','c','#1a0b2e')}
 // text layer (dissolves)
 const ta=1-clamp((t-TL.hold)/.55,0,1),q=Math.ceil(ta*4)/4;
 if(ta>0&&t>.8){
  items.forEach(it=>{const b=it.b,c=ballCard(b.i);txt(b.name.toUpperCase(),c.x,c.y+27,F8,b.c,'c','#0b0618',q)});
  if(t>TL.vs){const u=clamp((t-TL.vs)/.35,0,1),sc=lerp(3,1,eo(u)),sh=u<1?Math.round((1-u)*3*Math.sin(t*90)):0;const sp=spr('VS',F16,'#ffcc4d','#7a2a00');const w=Math.round(sp.w*sc),h=Math.round(sp.h*sc);g.globalAlpha=q;g.drawImage(sp.c,Math.round(cx-w/2+sh),Math.round(ballCard(0).y-h/2+sh),w,h);g.globalAlpha=1;
   if(u>=1&&u<1.2){}}
  [[0,TL.qa],[1,TL.qb]].forEach(([i,t0])=>{const b=balls[i],c=ballCard(i),qs='"'+b.s.q+'"',n=Math.max(0,Math.floor((t-t0)*30));if(n<=0)return;const maxW=AW*.27,lines=wrap(qs,FQ,maxW);let used=0;
   lines.forEach((ln0,li)=>{const room=n-used;used+=ln0.length+1;if(room<=0)return;const s=ln0.slice(0,room);txt(s,c.x,c.y+41+li*11,FQ,'#fff4d6','c','#0b0618',q)})})}
 // mask
 let dark=.97,rx,ry;const sp0=eo(t/TL.spot);
 const fl=t<.5?((t*14|0)%2&&t>.12?.5:1):1;
 rx=lerp(8,AW*.42,sp0)*(t<.5?fl:1);ry=lerp(5,AH*.47,sp0)*(t<.5?fl:1);
 rx=lerp(rx,dia*1.05,ex*ex*(3-2*ex)*1);ry=lerp(ry,dia*.85,ex);
 if(t<TL.round-.05||ex<1)drawMask(rx,ry,dark);
 // announce
 if(t>=TL.round){const u=t-TL.round;if(u<.7){const sl=eo(u/.3);drawBanner('ROUND '+fightN,FT*.55-(1-sl)*30,'#ffffff',1,sl*(1-clamp((u-.5)/.2,0,1)))}}
 if(t>=TL.fight-.15&&t<TL.end+.4){const u=t-(TL.fight-.15);const s=lerp(2.6,1.3,eo(u/.22));drawBanner('FIGHT!',(FT+FB)/2-6,'#ff5d6d',s,1-clamp((u-.55)/.35,0,1));if(u<.3)shake=2;crowdE=1}
if(ex>.7)drawHUD()}
function startFightPhase(){mode='fight';for(const b of balls){const s=startXY(b.i);b.x=b.px=s.x;b.y=b.py=s.y}acc=0}
/* ---------- main loop ---------- */
function runFrame(raw,rawSlow){
 const dt=Math.min(raw,50);clock+=dt/1000;
 if(mode==='intro'){T+=dt/1000;if(rawSlow>=6||T>9)T=Math.max(T,TL.end);if(T>=TL.end){mode='fight';introDone=true;if(window.__llcIntroBusy==='ballfight')window.__llcIntroBusy=0;startFightPhase()}else{introFrame();return}}
 if(mode==='fight'||mode==='over'){acc+=dt;let n=0;while(acc>=STEP&&n<4){update();acc-=STEP;n++}if(n===4)acc=0;
  if(over){overT+=dt/1000;if(overT>2.6){fightN=fightN;newMatch();mode='announce';annT=0;for(const b of balls){const s=startXY(b.i);b.x=b.px=s.x;b.y=b.py=s.y}}}
  drawFrame(acc/STEP)}
 else if(mode==='announce'){annT+=dt/1000;annDraw();if(annT>=1.7){mode='fight';acc=0}}}
function drawFrame(al){const sx=shake&&!RM?((Math.random()*2-1)*shake*.7)|0:0,sy=shake&&!RM?((Math.random()*2-1)*shake*.7)|0:0;g.save();g.translate(sx,sy);drawScene(true,al);g.restore();drawHUD();
 if(over&&overT>.2){const u=clamp((overT-.2)/.3,0,1);g.fillStyle='rgba(11,6,24,.6)';g.fillRect(0,(FT+FB)/2-16,AW,32);const msg=winner?winner.name.toUpperCase()+' WINS!':'DRAW!';drawBanner(msg,(FT+FB)/2,winner?winner.c:'#fff',lerp(1.6,1,eo(u)),1)}}
function annDraw(){drawScene(true,1);drawHUD();const u=annT;g.fillStyle='rgba(11,6,24,.5)';g.fillRect(0,(FT+FB)/2-28,AW,56);drawBanner('ROUND '+fightN,(FT+FB)/2-12,'#ffffff',1,1);
 txt(balls[0].name+'  VS  '+balls[1].name,cx,(FT+FB)/2+10,F8,'#ffcc4d','c');if(u>1.2)drawBanner('FIGHT!',(FT+FB)/2+20,'#ff5d6d',.0001,0)}
function skip(){if(mode==='intro'&&T<TL.round-.2){T=TL.round-.2}}
/* ---------- boot ---------- */
let last=0,slow=0;
function loop(ts){requestAnimationFrame(loop);if(!vis||document.hidden){last=0;return}if(!last){last=ts;return}const raw=ts-last;last=ts;slow=raw>60?slow+1:Math.max(0,slow-1);
 if(RM&&raw<30){/* reduced motion: update at ~30 Hz */}runFrame(raw,slow)}
function begin(){if(mode!=='idle')return;if(!RM&&window.__llcIntroBusy&&window.__llcIntroBusy!=='ballfight'){clearTimeout(begin.w);begin.w=setTimeout(()=>{if(vis)begin()},400);return}newMatch(true);if(RM){mode='fight';introDone=true}else{mode='intro';T=0;window.__llcIntroBusy='ballfight'}}
function boot(){layout();newMatch(true);mode='idle';g.fillStyle='#07030f';g.fillRect(0,0,AW,AH);
 // never hide content: if intro never triggers, a static arena frame is still drawn when scrolled into view / after 4s idle
 new IntersectionObserver(es=>{vis=es[0].isIntersecting;if(vis)begin()},{threshold:RM?.05:.45}).observe(arenaEl);
 new IntersectionObserver(es=>{if(es[0].isIntersecting&&mode==='idle')vis=true},{threshold:.05}).observe(arenaEl);
 setTimeout(()=>{if(mode==='idle'&&vis)begin()},1500);
 arenaEl.addEventListener('pointerdown',skip);addEventListener('keydown',skip);
 let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{const ow=AW,oh=AH;layout();for(const b of balls){b.x*=AW/ow;b.y*=AH/oh;b.px=b.x;b.py=b.y}},200)});
 if(MANUAL){vis=true;window.__bf={begin,adv(ms){let left=ms;if(mode==='idle')begin();while(left>0){const d=Math.min(left,50);runFrame(d,0);left-=d}},state:()=>({mode,T,pair,tick,hp:balls.map(b=>b.hp)}),skip}}
 else requestAnimationFrame(loop)}
const fl=['8px Silkscreen','bold 26px Silkscreen','9px "Pixelify Sans"'].map(f=>document.fonts?document.fonts.load(f):Promise.resolve());
Promise.race([Promise.all(fl),new Promise(r=>setTimeout(r,1500))]).then(()=>{fontGen++;boot()}).catch(boot);
})();

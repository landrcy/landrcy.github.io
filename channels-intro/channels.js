/* "LLC Powered Channels" intro: five linked icons (π, ball, donut, ?, speech bubble) joined by a glowing chain spin up as a ring,
   fling into their own channel card, and each grows into its card with its own pixel-art growth style:
   ball -> shockwave RINGS (Langrino) | donut -> voxel PIXEL-BURST build (clutchclips) | ? -> spiral GALAXY (bowlfuloftrivia)
   bubble -> rising FIRE cellular automaton (RedditStoryADay) | π -> chalk PYTHAGORAS TREE + lattice (SAT in a Minute).
   Plays once on scroll-in; click/key skips; reduced-motion = off; dt capped 50 ms; slow-frame self-skip; canvas removed at the end. */
(function(){
const sec=document.getElementById('channels'),grid=sec&&sec.querySelector('.ch-grid');if(!grid)return;
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const MANUAL=new URLSearchParams(location.search).has('chmanual');
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t)},eo=t=>1-Math.pow(1-clamp(t,0,1),3),ei=t=>{t=clamp(t,0,1);return t*t};
const BAY=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v=>(v+.5)/64);
const bay=(x,y)=>BAY[((y&7)<<3)|(x&7)];
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function hash(a,b){let h=(a*374761393+b*668265263)>>>0;h=((h^(h>>>13))*1274126177)>>>0;return((h^(h>>>16))>>>0)/4294967296}
const hexA=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const pk=(r,g,b)=>(0xff000000|(b<<16)|(g<<8)|r)>>>0;
const pkh=h=>{const c=hexA(h);return pk(c[0],c[1],c[2])};
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c}
const SP=new Map();
function spr(str,font,col,ol){const k=str+'|'+font+'|'+col+'|'+ol;let s=SP.get(k);if(s)return s;const m=mk(1,1).getContext('2d');m.font=font;const w=Math.ceil(m.measureText(str).width)+4,h=parseInt(font.match(/(\d+)px/)[1])+6;
 const c=mk(w,h),x=c.getContext('2d');x.font=font;x.textBaseline='middle';if(ol){x.fillStyle=ol;for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]])x.fillText(str,2+dx,h/2+dy)}
 x.fillStyle=col;x.fillText(str,2,h/2);const id=x.getImageData(0,0,w,h),d=id.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>120?255:0;x.putImageData(id,0,0);if(SP.size>400)SP.clear();s={c,w,h};SP.set(k,s);return s}
function T(g,str,x,y,font,col,al,ol){const s=spr(str,font,col,ol||'');g.drawImage(s.c,Math.round(al==='c'?x-s.w/2:al==='r'?x-s.w:x),Math.round(y-s.h/2));return s}
const F7='7px Silkscreen',F8='8px Silkscreen';
/* ---------- pixel icons (19x19 base) ---------- */
function bmp(g,rows,cols,ox,oy,outline){const h=rows.length,w=rows[0].length;
 if(outline){g.fillStyle=outline;for(let y=-1;y<=h;y++)for(let x=-1;x<=w;x++){let near=false;for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1;dx++){const yy=y+dy,xx=x+dx;if(yy>=0&&yy<h&&xx>=0&&xx<w&&rows[yy][xx]!=='.'){near=true;break}}if(near)g.fillRect(ox+x,oy+y,1,1)}}
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=rows[y][x];if(c!=='.'){g.fillStyle=cols[c]||c;g.fillRect(ox+x,oy+y,1,1)}}}
function dsc(g,cx,cy,r,col){g.fillStyle=col;for(let dy=-r;dy<=r;dy++){const w=Math.floor(Math.sqrt(r*r-dy*dy+.25));g.fillRect(Math.round(cx-w),Math.round(cy+dy),w*2+1,1)}}
const ICONS={
 ball(g){dsc(g,9,9,8,'#fff');dsc(g,9,9,7,'#ff3b5c');g.fillStyle='#b81f40';for(let y=0;y<14;y++)for(let x=0;x<14;x++){const dx=x-6.5,dy=y-6.5;if(dx*dx+dy*dy<49&&dx+dy>2+((x+y)&1)*1.5)g.fillRect(2+x,2+y,1,1)}
  g.fillStyle='#ffc2cf';g.fillRect(5,4,3,2);g.fillRect(4,5,2,2);g.fillStyle='#fff';g.fillRect(5,4,2,1);
  g.fillStyle='#1a0b2e';g.fillRect(8,8,1,1)},
 donut(g){dsc(g,9,9,8,'#3a2410');dsc(g,9,9,7,'#c9874a');
  for(let a=0;a<360;a+=6){const rr=5.4+((a*7)%5)*.28,x=9+Math.cos(a*Math.PI/180)*rr,y=9+Math.sin(a*Math.PI/180)*rr;g.fillStyle='#ff8fc8';for(let r=2.6;r<=rr;r+=.5)g.fillRect(Math.round(9+(x-9)*r/rr),Math.round(9+(y-9)*r/rr),1,1)}
  g.fillStyle='#ff5fae';for(let a=0;a<360;a+=8){const x=9+Math.cos(a*Math.PI/180)*5.6,y=9+Math.sin(a*Math.PI/180)*5.6;if(a%16===0)g.fillRect(Math.round(x),Math.round(y),1,1)}
  for(let y=-3;y<=3;y++)for(let x=-3;x<=3;x++){const d=Math.hypot(x,y);if(d<=3.1)g.clearRect(9+x,9+y,1,1)}
  g.fillStyle='#3a2410';for(let a=0;a<360;a+=10){g.fillRect(Math.round(9+Math.cos(a*Math.PI/180)*3.2),Math.round(9+Math.sin(a*Math.PI/180)*3.2),1,1)}
  [['#fff',6,5],['#ffe14d',12,6],['#4dc3ff',5,11],['#7dffb2',13,12],['#fff',10,4],['#ffe14d',8,14]].forEach(([c,x,y])=>{g.fillStyle=c;g.fillRect(x,y,2,1)})},
 quest(g){bmp(g,['...#####...','..#######..','.###...###.','.###...###.','.......###.','......###..','.....###...','....###....','....###....','...........','....###....','....###....'],{'#':'#c9bcff'},4,3,'#2a1f7a');
  g.fillStyle='#fff';g.fillRect(6,4,3,1);g.fillRect(5,5,1,2);g.fillStyle='#8a78e8';g.fillRect(12,6,1,2);g.fillRect(9,13,1,2)},
 bubble(g){const L=['..###############..','.#################.','###################','###################','###################','###################','###################','###################','.#################.','..###############..','...####.............','...###..............','...##...............'].map(r=>r);
  bmp(g,L.map(r=>r.replace(/#/g,'#')),{'#':'#fff1dc'},0,2,'#2a1208');g.fillStyle='#ff7b25';[5,9,13].forEach(x=>g.fillRect(x,7,2,2));g.fillStyle='#ffb15c';[5,9,13].forEach(x=>g.fillRect(x,7,2,1));g.fillStyle='#d8c0a0';g.fillRect(3,12,4,1)},
 math(g){g.fillStyle='#7a5230';g.fillRect(1,1,17,17);g.fillStyle='#244233';g.fillRect(2,2,15,15);g.fillStyle='#34614b';g.fillRect(2,2,15,1);g.fillRect(2,2,1,15);
  bmp(g,['#############','#############','.###.....###.','.###.....###.','.###.....###.','.###.....###.','.###.....####','.###......###'],{'#':'#f4f4ea'},3,5,'#14241c');g.fillStyle='#fff';g.fillRect(3,5,13,1)}};
const ICON_ORDER=['ball','donut','quest','bubble','math'];
function iconSprite(k){const c=mk(19,19),g=c.getContext('2d');ICONS[k](g);return c}
/* ---------- card themes ---------- */
const THEMES=[
 {key:'arena',label:'LANGRINO',col:'#ff7b93',style:'rings',px:{c:['#ff3b5c','#4dc3ff','#ff7bd5']}},
 {key:'donut',label:'CLUTCHCLIPS',col:'#ffd1ea',style:'voxel'},
 {key:'trivia',label:'BOWLFULOFTRIVIA',col:'#b9a8ff',style:'galaxy'},
 {key:'camp',label:'REDDITSTORYADAY',col:'#ffb15c',style:'fire'},
 {key:'chalk',label:'SAT IN A MINUTE',col:'#f4f4ea',style:'chalk'}];
const CARD_SEL=['.ch--arena','.ch--donut','.ch--trivia','.ch--camp','.ch--chalk'];
function stops(t,st){if(t<=st[0][0])return st[0][1];for(let i=1;i<st.length;i++)if(t<=st[i][0]){const a=st[i-1],b=st[i],u=(t-a[0])/(b[0]-a[0]||1);return[0,1,2].map(k=>lerp(a[1][k],b[1][k],u))}return st[st.length-1][1]}
function themeBuild(th,w,h){const c=mk(w,h),g=c.getContext('2d'),id=g.createImageData(w,h),d=id.data,H=hexA,L=6;
 const post=(x,y,rgb)=>{const t=bay(x,y),o=[];for(let k=0;k<3;k++){const v=rgb[k]/255*(L-1),f=Math.floor(v);o.push(Math.round((v-f>t?f+1:f)*255/(L-1)))}return o};
 const R7=7;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){let rgb;
  switch(th.key){
  case'arena':{const dd=Math.hypot(x-w/2,y-h*1.2)/(Math.hypot(w/2,h*1.2)*.7);rgb=stops(dd,[[0,H('#3a0d4a')],[1,H('#160822')]]);break}
  case'donut':{if(y<9)rgb=H('#5aa63b');else if(y<12)rgb=H('#3f7d2a');else{rgb=H('#7a5230');if((x%8===0||y%8===4)&&((x*7+y*3)&3))rgb=H('#6a4628')}break}
  case'trivia':{const dd=Math.hypot((x-w*.8)/(w*.85),(y)/(h*.95));rgb=stops(dd,[[0,H('#3b2b8f')],[.65,H('#0b0a2a')],[1,H('#0b0a2a')]]);if(hash(x>>1,y>>1)<.012)rgb=[230,235,255];else if(hash(y>>1,x>>1)<.006)rgb=[150,190,230];break}
  case'camp':{const tt=y/h;rgb=stops(tt,[[0,H('#12090a')],[.7,H('#2a1208')],[1,H('#3d1a08')]]);const fx=(x-w/2)/30,fy=(y-(h+5))/45,fd=Math.sqrt(fx*fx+fy*fy);if(fd<.72){const fc=stops(fd/.72,[[0,[255,209,102]],[.4/.72*.72,[255,123,37]],[.65,[255,60,0]],[.72,[255,60,0]]]),a=fd<.4?1:fd<.65?1-(fd-.4)/.25*.75:.25*(1-(fd-.65)/.07);rgb=[0,1,2].map(k=>lerp(rgb[k],fc[k],clamp(a,0,1)))}break}
  default:{rgb=H('#244233');if(((x+y*2)%7)===0)rgb=[rgb[0]+14,rgb[1]+14,rgb[2]+14]; if(x<4||y<4||x>=w-4||y>=h-4)rgb=H('#7a5230')}}
  const q=th.key==='chalk'&&(x<4||y<4||x>=w-4||y>=h-4)?rgb.map(Math.round):post(x,y,rgb);
  const dxc=Math.max(R7-x,x-(w-1-R7),0),dyc=Math.max(R7-y,y-(h-1-R7),0),inside=dxc*dxc+dyc*dyc<=R7*R7+2,k=(y*w+x)*4;
  if((x===0||y===0||x===w-1||y===h-1)&&inside){d[k]=q[0]*.9+20;d[k+1]=q[1]*.9+20;d[k+2]=q[2]*.9+20}else{d[k]=q[0];d[k+1]=q[1];d[k+2]=q[2]}d[k+3]=inside?255:0}
 g.putImageData(id,0,0);
 if(th.key==='chalk'){const s=spr('a2+b2=c2   S',F8,'#5d7f6d','');g.drawImage(s.c,w-s.w-4,h-30)}
 return{c,u32:new Uint32Array(g.getImageData(0,0,w,h).data.buffer.slice(0)),w,h}}
/* ---------- state ---------- */
let S=null,cvs,ctx,raf=0,last=0,time=0,running=false,slow=0,hint,vis=[];
const TLn={fade:.7,spin:3.7,launch:3.7,stag:.14,fly:.75,expand:3.5,out:8.6,end:9.5};
function build(){const SCL=sec.clientWidth>=1700?3:2,gx=grid.offsetLeft-14,gy=grid.offsetTop-14,gw=grid.offsetWidth+28,gh=grid.offsetHeight+28+44;
 const W=Math.floor(gw/SCL),H=Math.floor(gh/SCL),px=SCL;
 const cards=CARD_SEL.map((sel,i)=>{const el=grid.querySelector(sel);if(!el)throw new Error('card missing '+sel);const x=Math.round((el.offsetLeft-gx)/SCL),y=Math.round((el.offsetTop-gy)/SCL),w=Math.round(el.offsetWidth/SCL),h=Math.round(el.offsetHeight/SCL);
  const th=THEMES[i],tb=themeBuild(th,w,h);return{i,th,el,x,y,w,h,fx:w/2,fy:h/2+4,theme:tb,p:0,raw:0,heat:i===3?new Uint8Array(w*h):null,fireT:0,landT:TLn.launch+TLn.stag*i+TLn.fly,icon:iconSprite(ICON_ORDER[i]),landed:0,sparks:[],kind:ICON_ORDER[i]}});
 const bg=new Uint32Array(W*H),c0=pkh('#0f0f0f'),c1=pkh('#141414');for(let y=0;y<H;y++)for(let x=0;x<W;x++){const ax=(x*SCL+gx),ay=(y*SCL+gy);bg[y*W+x]=((ax%24)<2||(ay%24)<2)?c1:c0}
 const img=new ImageData(W,H);const out=new Uint32Array(img.data.buffer);
 const mask=mk(W,H),mg=mask.getContext('2d'),mi=mg.createImageData(W,H);
 return{W,H,SCL,gx,gy,gw,gh,cards,bg,img,out,mask,mg,mi,phi:0,om:1.6,parts:[],rings:[],fireAcc:0,cy0:0,R:0,cx:W/2,cy:H/2}}
/* ---------- coverage per style (returns packed colour or 0) ---------- */
const FIRE=['#12090a','#4a1006','#8a1c05','#d63a0a','#ff7b25','#ffb340','#ffe27a','#fff6c0'].map(pkh);
function fireStep(c,p,rr){const w=c.w,h=c.h,hm=c.heat;const sy=Math.max(0,Math.round(h-1-sm(p)*(h*1.12)));c.sy=sy;
 // seed
 const half=Math.min(w/2,6+p*w*.9);for(let x=0;x<w;x++){const dx=Math.abs(x-w/2);if(dx<half&&sy<h)hm[Math.min(h-1,sy+1)*w+x]=255}
 for(let y=Math.min(h-2,sy);y>=0;y--)for(let x=0;x<w;x++){const sx=clamp(x+((rr()*3)|0)-1,0,w-1);const v=hm[(y+1)*w+sx];hm[y*w+x]=Math.max(0,v-((rr()*14)|0)-(y<sy-1?0:0))}
 for(let y=sy+1;y<h;y++)for(let x=0;x<w;x++)hm[y*w+x]=hm[y*w+x]*.0}
function coverCard(c,t,out,W){const w=c.w,h=c.h,p=c.p,th=c.theme.u32,fx=c.fx,fy=c.fy,Rmax=Math.hypot(w/2,h/2)*1.08;if(p<=0)return;
 for(let y=0;y<h;y++){const oy=(c.y+y)*W+c.x;for(let x=0;x<w;x++){const tc=th[y*w+x];if(!(tc>>>24))continue;let res=0;const dx=x-fx,dy=y-fy;
  switch(c.th.style){
  case'rings':{const d=Math.hypot(dx,dy),front=p*Rmax*1.18;if(d>front){res=0;break}
   const per=9,f=((d%per)+per)%per,kk=Math.floor(d/per),gap=Math.pow(Math.max(0,1-p*1.08),1.3)*7.2*(.7+.3*Math.sin(d*.35-t*8));
   if(f+bay(x,y)*1.4>=gap||p>.97)res=tc;else res=((x+y)&1)&&(bay(x,y)<.7)?((kk&1)?pk(77,195,255):pk(255,59,92)):0;
   if(d>front-2)res=pk(255,255,255);break}
  case'voxel':{const bx=(x>>3),by=(y>>3),hh=hash(bx,by),dd=Math.hypot((bx*8+4)-fx,(by*8+4)-fy)/Rmax,a=.06+.5*hh+.34*dd,q=(p-a)/.11;if(q<0){res=0;break}
   if(q<1){if(bay(x,y)<(1-q)*.85)res=(hh<.5?pk(255,255,255):pk(255,225,77));else if(bay(x,y)<q*1.1)res=tc;else res=0;if(!res)break}else res=tc;
   if((x&7)===0||(y&7)===0){if(q<2.2&&q>=1)res=pk(255,255,255)}break}
  case'galaxy':{const d=Math.hypot(dx,dy),ang=Math.atan2(dy,dx),front=sm(p*1.15)*Rmax*1.1;if(d>front){res=0;break}
   const s=(((ang/(Math.PI*2))*3+d/26-t*.22)%1+1)%1,aw=lerp(.12,1.1,sm(p*1.12));
   if(s<aw||p>.96)res=tc;else if(s<aw+.06&&bay(x,y)<.4)res=pk(110,170,255);
   if(d>front-2)res=pk(185,168,255);break}
  case'fire':{const hv=c.heat[y*w+x],sy=c.sy==null?h:c.sy;
   if(y>sy+1)res=tc;else if(y>=sy&&y<=sy+1)res=FIRE[6];
   else if(hv>24){const k=Math.min(7,Math.floor(hv/256*8+bay(x,y)*1.2));res=FIRE[Math.max(1,k)]}
   if(!res&&y<sy&&hv>8&&bay(x,y)<hv/50)res=FIRE[1];break}
  default:{const cs=10,cxn=Math.floor((x-fx)/cs),cyn=Math.floor((y-fy)/cs),m=Math.max(Math.abs(cxn+.5),Math.abs(cyn+.5)),mM=Math.max(w,h)/2/cs,a=(m/mM)*.78+hash(cxn,cyn)*.22;const q=(p-a*.92)/.1;
   if(q<0){res=0;break}if(q<1){res=bay(x,y)<q?tc:(bay(x,y)<q+.25?pk(244,244,234):0);if(!res)break}else res=tc;
   const lx=((x-fx)%cs+cs)%cs,ly=((y-fy)%cs+cs)%cs;if(q>=1&&q<1.8&&(lx===0||ly===0))res=pk(244,244,234)}}
  if(res)out[oy+x]=res}}}
/* ---------- particles / sprites ---------- */
function addSparks(s,x,y,n,cols,sp,life){for(let i=0;i<n;i++){const a=Math.random()*6.283,v=(.3+Math.random())*sp;s.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:life*(.6+Math.random()*.6),L:life,c:cols[(Math.random()*cols.length)|0],g:0})}}
function stepParts(s,dt){const k=dt*60;s.parts=s.parts.filter(p=>{p.x+=p.vx*k;p.y+=p.vy*k;p.vy+=p.g*k;p.l-=k;return p.l>0&&p.x>-8&&p.y>-8&&p.x<s.W+8&&p.y<s.H+8})}
function drawParts(g,s){for(const p of s.parts){g.fillStyle=p.c;const z=p.l<p.L*.3?1:2;g.fillRect(Math.round(p.x),Math.round(p.y),z,z)}}
function dline(g,x0,y0,x1,y1,c){const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0||1;g.fillStyle=c;for(let i=0;i<=n;i++){const t=i/n;g.fillRect(Math.round(x0+(x1-x0)*t),Math.round(y0+(y1-y0)*t),1,1)}}
function drawIcon(g,spr0,x,y,sc,flash){const w=19*sc;g.drawImage(spr0,Math.round(x-w/2),Math.round(y-w/2),w,w);if(flash){g.globalCompositeOperation='lighter';g.globalAlpha=.7*flash;g.drawImage(spr0,Math.round(x-w/2),Math.round(y-w/2),w,w);g.globalAlpha=1;g.globalCompositeOperation='source-over'}}
/* ---------- orbit ring + chain ---------- */
const CHC=['#fff8c0','#ffd24a','#ff9a1f'];
function ringPos(s,i,t){const n=5,ph=s.phi+i*Math.PI*2/n,R=s.R*(1+.07*Math.sin(t*2.1)+.18*sm((t-1.2)/2.2)*(1+.05*Math.sin(t*9))),tilt=lerp(.42,.68,.5+.5*Math.sin(t*1.3)),rot=Math.sin(t*.7)*.25;
 const x0=Math.cos(ph)*R,y0=Math.sin(ph)*R*tilt,z=Math.sin(ph);return{x:s.cx+x0*Math.cos(rot)-y0*Math.sin(rot),y:s.cy+x0*Math.sin(rot)+y0*Math.cos(rot),z}}
function chainSeg(g,a,b,t,energy,seed){const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),n=Math.max(2,Math.floor(d/6.5)),ux=dx/d,uy=dy/d,nx=-uy,ny=ux,P=(x,y,c)=>{g.fillStyle=c;g.fillRect(Math.round(x),Math.round(y),1,1)};
 for(let k=1;k<n;k++){const u=k/n,x=a.x+dx*u,y=a.y+dy*u,flat=(k+seed)&1,hot=.5+.5*Math.sin(t*16-k*1.1+seed),core=energy>.6||hot>.7?CHC[0]:CHC[1];
  if(flat){for(let q=-3;q<=3;q++){P(x+ux*q+nx*2,y+uy*q+ny*2,core);P(x+ux*q-nx*2,y+uy*q-ny*2,core)}P(x+ux*4,y+uy*4,CHC[1]);P(x-ux*4,y-uy*4,CHC[1]);P(x+ux*4+nx,y+uy*4+ny,CHC[2]);P(x+ux*4-nx,y+uy*4-ny,CHC[2]);P(x-ux*4+nx,y-uy*4+ny,CHC[2]);P(x-ux*4-nx,y-uy*4-ny,CHC[2]);P(x+nx*3,y+ny*3,CHC[2]);P(x-nx*3,y-ny*3,CHC[2])}
  else{for(let q=-2;q<=2;q++)P(x+nx*q,y+ny*q,core);P(x+ux,y+uy,CHC[1]);P(x-ux,y-uy,CHC[1]);P(x+ux*2,y+uy*2,CHC[2]);P(x-ux*2,y-uy*2,CHC[2])}
  if((k*7+Math.floor(t*40))%(energy>.4?2:4)===0){const o=5+((k*3+Math.floor(t*20))%3);P(x+nx*o,y+ny*o,energy>.5?'#fff':CHC[2]);P(x-nx*o,y-ny*o,energy>.5?'#fff':CHC[2])}}}
/* ---------- frame ---------- */
function layoutRing(s){const vh=innerHeight,cr=cvs.getBoundingClientRect();let cyv=(vh*.5-cr.top)/s.SCL;s.R=Math.min(s.W*.27,s.H*.34,120);if(s.W<260)s.R=s.W*.3;s.cx=s.W/2;s.cy=clamp(cyv,s.R*.9+14,s.H-s.R*.9-14)}
function frame(dt){time+=dt;const s=S,t=time,W=s.W,H=s.H;if(t>=TLn.end){finish();return}
 // spin kinematics
 const sp=clamp((t-TLn.fade)/(TLn.spin-TLn.fade),0,1);s.om=1.5+(t<TLn.fade?0:Math.pow(sp,2.2)*21);s.phi+=s.om*dt;
 // card progress (paused when off-screen on tall layouts)
 for(const c of s.cards){const st=c.landT+.12;if(t>st){const adv=(vis[c.i]!==false)?dt:0;c.raw=Math.min(TLn.expand+.4,c.raw+adv);c.p=sm(c.raw/TLn.expand)}}
 // fire sim at fixed 30 Hz
 const fc=s.cards[3];if(fc.p>0){s.fireAcc+=dt;let n=0;while(s.fireAcc>=1/30&&n<3){s.fireAcc-=1/30;n++;fc.fireR=fc.fireR||rng(1234);fireStep(fc,fc.p,fc.fireR)}if(n===3)s.fireAcc=0}
 // base + card growth
 s.out.set(s.bg);for(const c of s.cards)coverCard(c,t,s.out,W);ctx.putImageData(s.img,0,0);
 // glow behind the ring
 const energy=clamp((s.om-3)/14,0,1);
 // icons & chain
 const nodes=ICON_ORDER.map((k,i)=>{const c=s.cards[i],rp=ringPos(s,i,t),L=TLn.launch+TLn.stag*i;let x=rp.x,y=rp.y,z=rp.z,sc=1,mode='ring';
  if(t>=L){const u=clamp((t-L)/TLn.fly,0,1);if(!c.snap){c.snap={x:rp.x,y:rp.y,tx:-Math.sin(s.phi+i*1.2566)*s.om,ty:Math.cos(s.phi+i*1.2566)*s.om*.55}}
   const P0=c.snap,tc=Math.hypot(P0.tx,P0.ty)||1,Cx=c.x+c.fx,Cy=c.y+c.fy,k1=24+energy*60,cx1=P0.x+P0.tx/tc*k1,cy1=P0.y+P0.ty/tc*k1,e=ei(u)*.55+eo(u)*.45;
   x=(1-e)*(1-e)*P0.x+2*(1-e)*e*cx1+e*e*Cx;y=(1-e)*(1-e)*P0.y+2*(1-e)*e*cy1+e*e*Cy;mode=u>=1?'landed':'fly';z=0;if(u>=1&&!c.landed){c.landed=t;addSparks(s,Cx,Cy,34,c.kind==='donut'?['#ff8fc8','#fff','#ffe14d','#4dc3ff','#7dffb2']:c.kind==='ball'?['#ff3b5c','#fff','#ff7bd5','#4dc3ff']:c.kind==='quest'?['#b9a8ff','#fff','#6fd0ff']:c.kind==='bubble'?['#ff7b25','#ffd166','#fff']:['#f4f4ea','#fff','#9ac'],2.6,22);s.rings.push({x:Cx,y:Cy,t0:t,c:c.th.col})}
   sc=mode==='landed'?3:(u>.62?3:2)}
  return{i,x,y,z,sc,mode,c,L}});
 // spawn spin sparks (trail)
 if(t<TLn.launch+.6&&t>TLn.fade&&energy>.05){for(const n of nodes)if(n.mode==='ring'&&Math.random()<.6+energy*.6){const col=['#ff3b5c','#ff8fc8','#b9a8ff','#ffb15c','#f4f4ea'][n.i];s.parts.push({x:n.x,y:n.y,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,l:14+energy*16,L:30,c:col,g:0})}}
 stepParts(s,dt);
 const g=ctx;
 // chain (only between icons still on the ring/flying)
 for(let i=0;i<5;i++){const a=nodes[i],b=nodes[(i+1)%5];if(a.mode==='landed'||b.mode==='landed'){if(!a.c['cut'+b.i]&&(a.mode==='landed'||b.mode==='landed')&&t>TLn.launch){a.c['cut'+b.i]=1;const mx=(a.x+b.x)/2,my=(a.y+b.y)/2;addSparks(s,mx,my,12,['#fff8c0','#ffd24a','#ff9a1f'],1.8,20)}continue}
  if(t<TLn.fade*.5)continue;const f=clamp((t-i*.12)/.5,0,1);if(f<=0)continue;chainSeg(g,a,b,t,energy,i)}
 // speed blur arcs along the orbit
 if(t>TLn.fade+.3&&t<TLn.launch){const cols=['#ff3b5c','#ff8fc8','#8a78e8','#ff9a3a','#a8d8b8'];for(const n of nodes){if(n.mode!=='ring')continue;const L=Math.min(26,Math.floor(s.om*1.3));for(let j=2;j<L;j++){const rp=ringPos({phi:s.phi-j*s.om*.011,R:s.R,cx:s.cx,cy:s.cy},n.i,t);g.fillStyle=j<5?'#fff':cols[n.i];if(j>L*.55&&(j&1))continue;const sz=j<8?3:2;g.fillRect(Math.round(rp.x-sz/2),Math.round(rp.y-sz/2),sz,sz)}}}
 // halo + icons back to front
 const order=nodes.slice().sort((a,b)=>a.z-b.z);
 for(const n of order){const vv=t<i0(n)?0:1;if(t<.05+n.i*.1)continue;const pop=clamp((t-n.i*.1)/.3,0,1);if(pop<=0)continue;
  const hal=(n.mode==='landed'?0:1);if(hal){const rad=Math.round(24+energy*8);g.fillStyle=['#ff3b5c','#ff8fc8','#8a78e8','#ff9a3a','#a8d8b8'][n.i];for(let a=0;a<28;a++){const ang=a*.2244+t*(n.i+2),rr=rad+Math.sin(a*3+t*6)*2;g.fillRect(Math.round(n.x+Math.cos(ang)*rr),Math.round(n.y+Math.sin(ang)*rr*.9),1,1)}}
  const dim=n.mode==='ring'&&n.z<-.25;drawIcon(g,n.c.icon,n.x,n.y,pop<1?1:(n.mode==='ring'?2:n.sc),(n.mode==='landed'&&t-n.c.landed<.12)?1:0);
  if(dim){g.fillStyle='rgba(15,15,15,.45)';for(let yy=-18;yy<=18;yy++)for(let xx=-18;xx<=18;xx++)if(((xx+yy)&1)&&Math.abs(xx)<18&&Math.abs(yy)<18)g.fillRect(Math.round(n.x)+xx,Math.round(n.y)+yy,1,1)}}
 // landing shock rings
 s.rings=s.rings.filter(r=>{const u=(t-r.t0)/.5;if(u>1)return false;const rad=2+eo(u)*26;g.fillStyle='#fff';for(let a=0;a<64;a++){const ang=a*.0982;if((a+Math.floor(t*40))%2)continue;g.fillRect(Math.round(r.x+Math.cos(ang)*rad),Math.round(r.y+Math.sin(ang)*rad),1,1)}return true});
 // per-card decorations (clipped to the card)
 for(const c of s.cards)if(c.landed)decor(g,s,c,t,dt);
 drawParts(g,s);
 // final fade-out of cards = dissolve
 if(t>TLn.out){const u=clamp((t-TLn.out)/(TLn.end-TLn.out),0,1),m=s.mi.data;for(let y=0;y<H;y++)for(let x=0;x<W;x++)m[(y*W+x)*4+3]=BAY[((y&7)<<3)|(x&7)]<(1-u)?255:0;s.mg.putImageData(s.mi,0,0);g.globalCompositeOperation='destination-in';g.drawImage(s.mask,0,0);g.globalCompositeOperation='source-over'}}
function i0(n){return 0}
function decor(g,s,c,t,dt){const w=c.w,h=c.h,p=c.p,Cx=c.x+c.fx,Cy=c.y+c.fy,k=c.kind,age=t-c.landed;
 g.save();g.beginPath();g.rect(c.x,c.y,w,h);g.clip();
 const iconOut=1-sm((p-.82)/.18),bob=Math.round(Math.sin(t*3+c.i)*1.5);
 const R=rng(c.i*77+Math.floor(t*14));
 if(k==='ball'){ // twin fighters orbit & clash
  for(let q=0;q<2;q++){const a=t*(1.3+p*2)*(q?-1:1)+q*3.14,rr=Math.min(w,h)*.5*sm(p*1.4)*.8*(.4+.6*Math.abs(Math.sin(t*.9+q))),bx=Cx+Math.cos(a)*rr*1.3,by=Cy+Math.sin(a)*rr*.8;if(p>.08&&iconOut>0){dsc(g,bx,by,3,'#fff');dsc(g,bx,by,2,q?'#4dc3ff':'#ff3b5c')}}}
 if(k==='donut'){ // sprinkle burst at the block front
  if(p<.98&&Math.random()<.9)for(let q=0;q<3;q++){const a=Math.random()*6.28,d=p*Math.hypot(w,h)*.55*(.7+Math.random()*.5);const col=['#ff8fc8','#fff','#ffe14d','#4dc3ff','#7dffb2'][(Math.random()*5)|0];s.parts.push({x:Cx+Math.cos(a)*d*.9,y:Cy+Math.sin(a)*d*.55,vx:Math.cos(a)*.8,vy:Math.sin(a)*.5-1.2,l:20,L:20,c:col,g:.09})}}
 if(k==='quest'){ // phyllotaxis stars
  const N=Math.floor(p*160)+(age<.6?0:0);for(let n=1;n<N;n++){const r=2.4*Math.sqrt(n)*1.55,a=n*2.39996+t*.12,x=Cx+Math.cos(a)*r*1.3,y=Cy+Math.sin(a)*r*.85;if(x<c.x||x>c.x+w||y<c.y||y>c.y+h)continue;const tw=(n+Math.floor(t*5))%7;g.fillStyle=tw<2?'#fff':tw<4?'#9ad8ff':'#b9a8ff';g.fillRect(Math.round(x),Math.round(y),(n%9===0)?2:1,(n%9===0)?2:1)}}
 if(k==='bubble'){ // rising embers + story bubbles
  if(Math.random()<.8){const x=c.x+4+Math.random()*(w-8),yb=c.y+(c.sy==null?h:c.sy);s.parts.push({x,y:yb,vx:(Math.random()-.5)*.5,vy:-.7-Math.random()*1.1,l:36,L:36,c:['#ffd166','#ff7b25','#ff3c00'][(Math.random()*3)|0],g:-.002})}
  for(let q=0;q<3;q++){const ph=(t*.35+q*.33)%1;const bx=Cx+(q-1)*w*.22+Math.sin(t*2+q*2)*5,by=c.y+h-ph*(h+10);if(ph>.02&&p>.05&&p<.9){const r=2+q;g.fillStyle='#fff1dc';g.fillRect(Math.round(bx)-r,Math.round(by),r*2+1,r+2);g.fillStyle='#2a1208';g.fillRect(Math.round(bx)-r,Math.round(by)+r+2,r*2+1,1);g.fillStyle='#ff7b25';g.fillRect(Math.round(bx),Math.round(by)+1,1,1)}}}
 if(k==='math'){ // chalk Pythagoras tree (recursive) + popping glyphs
  const depth=p<.02?0:1+Math.floor(sm(p*1.1)*9),L0=Math.min(w*.09,h*.21),th=Math.PI/4+Math.sin(t*.6)*.16,lines=[];
  (function tree(x,y,ux,uy,len,dpt){if(dpt>depth||len<1.5)return;const nx=uy,ny=-ux,p1=[x+ux*len,y+uy*len],p2=[p1[0]+nx*len,p1[1]+ny*len],p3=[x+nx*len,y+ny*len];
   lines.push([x,y,p1[0],p1[1],dpt],[p1[0],p1[1],p2[0],p2[1],dpt],[p2[0],p2[1],p3[0],p3[1],dpt],[p3[0],p3[1],x,y,dpt]);
   const l1=len*Math.cos(th),l2=len*Math.sin(th),ax=p3[0]+ux*l1*Math.cos(th)+nx*l1*Math.sin(th),ay=p3[1]+uy*l1*Math.cos(th)+ny*l1*Math.sin(th);
   tree(p3[0],p3[1],(ax-p3[0])/l1,(ay-p3[1])/l1,l1,dpt+1);tree(ax,ay,(p2[0]-ax)/l2,(p2[1]-ay)/l2,l2,dpt+1)})(Cx-L0/2,c.y+h-6,1,0,L0,1);
  for(const l of lines)dline(g,l[0],l[1],l[2],l[3],l[4]>=depth?'#ffffff':l[4]>5?'#cfe8d8':'#e8e8dc');
  const gl=['π','∑','√','x²','÷','%'],gs=p>.15?Math.floor((p-.15)*8):0;for(let q=0;q<Math.min(6,gs);q++){const gx=c.x+10+((q*37+11)%(w-30)),gy=c.y+14+((q*53)%Math.round(h*.45)),u=clamp((p-.15-q/8)*8,0,1);if(u>0)T(g,gl[q],gx,gy-(1-eo(u))*6,F8,q%2?'#cfe8d8':'#f4f4ea','l','')}}
 g.restore();
 // label
 const la=clamp(age/.3,0,1)*(1-sm((p-.55)/.3));if(la>0){const lab=c.th.label,sp=spr(lab,F8,c.th.col,'#000');g.globalAlpha=la>.5?1:.5;g.drawImage(sp.c,Math.round(Cx-sp.w/2),Math.round(Cy+24+bob),sp.w,sp.h);g.globalAlpha=1}
 // icon rides the card while it grows
 if(iconOut>0&&p<.999){g.save();g.beginPath();g.rect(c.x,c.y,w,h);g.clip();const sc=iconOut>.6?3:2;drawIcon(g,c.icon,Cx,Cy+bob,sc,0);g.restore()}}
/* ---------- run ---------- */
function finish(){if(!running)return;running=false;cancelAnimationFrame(raf);removeEventListener('keydown',skip);removeEventListener('resize',finish);if(cvs&&cvs.parentNode)cvs.remove();if(hint&&hint.parentNode)hint.remove();cvs=null;S=null;window.__chDone=true;if(window.__llcIntroBusy==='channels')window.__llcIntroBusy=0}
function skip(){if(!running)return;time=Math.max(time,TLn.out);for(const c of S.cards){c.p=1;c.raw=TLn.expand}}
function visCheck(){if(!cvs||!S)return;const vh=innerHeight;S.cards.forEach(c=>{const r=c.el.getBoundingClientRect();const o=Math.min(r.bottom,vh)-Math.max(r.top,0);vis[c.i]=o>Math.min(r.height,vh)*.25})}
function loop(ts){if(!running)return;raf=requestAnimationFrame(loop);if(!last){last=ts;return}const raw=ts-last;last=ts;slow=raw>60?slow+1:Math.max(0,slow-1);if(slow>=8&&time<TLn.out){skip();slow=0}
 if((ts|0)%6===0)visCheck();frame(Math.min(raw,50)/1000)}
const __ib=n=>window.__llcIntroBusy&&window.__llcIntroBusy!==n,__inV=el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};
function start(){if(running||window.__chStarted)return;if(__ib('channels')||!__inV(grid)){setTimeout(start,400);return}window.__chStarted=true;window.__llcIntroBusy='channels';
 const go=()=>{try{
  S=build();cvs=document.createElement('canvas');cvs.className='chi-canvas';cvs.width=S.W;cvs.height=S.H;cvs.setAttribute('aria-hidden','true');cvs.style.left=S.gx+'px';cvs.style.top=S.gy+'px';cvs.style.width=S.W*S.SCL+'px';cvs.style.height=S.H*S.SCL+'px';
  ctx=cvs.getContext('2d');ctx.imageSmoothingEnabled=false;sec.appendChild(cvs);hint=document.createElement('span');hint.className='chi-skip';hint.textContent='click to skip';hint.style.left=S.gx+S.gw-90+'px';hint.style.top=S.gy+S.gh-16+'px';sec.appendChild(hint);
  layoutRing(S);cvs.addEventListener('pointerdown',skip);addEventListener('keydown',skip);addEventListener('resize',finish);
  running=true;time=0;last=0;vis=[];frame(0);
  if(MANUAL)window.__ch={adv(ms){let l=ms;while(l>0&&running){const d=Math.min(l,50);frame(d/1000);l-=d}},time:()=>time,skip};
  else{raf=requestAnimationFrame(loop);setTimeout(finish,60000)}}catch(e){console.warn('channels intro skipped',e);finish()}};
 const fl=['8px Silkscreen','7px Silkscreen'].map(f=>document.fonts?document.fonts.load(f):Promise.resolve());
 Promise.race([Promise.all(fl),new Promise(r=>setTimeout(r,1500))]).then(go)}
new IntersectionObserver((es,ob)=>{if(es[0].isIntersecting){ob.disconnect();start()}},{threshold:.3}).observe(grid);
})();

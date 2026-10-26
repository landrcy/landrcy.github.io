/* LLC world: camera (pan/zoom/pinch), strings to every showcased site, rifts that open on approach, map view.
   To add a site: add an entry to SITES (angle in degrees from the LLC, distance in world px). */
(function(){
const SITES=[
 {id:'ashaad',theme:'ashaad',s:'ashaad',ang:200,dist:1500,title:'The Binding of Ashaad',by:'a brainrot roguelike by landrcy',img:'games/ashaad/screenshot.png',
  blurb:'Descend into the basement, shoot your tears, grab cursed items and survive in this browser roguelike. 3 starters, 4 floors, 1 secret Finley boss.',href:'https://landrcy.github.io/binding-of-ashaad/',cta:'▶ Play'},
 {id:'sea',theme:'sea',s:'sea',ang:150,dist:1500,title:'Sea of Thought',by:'a pixel ocean by landrcy',img:'sea-intro/title.png',
  blurb:'A quiet pixel ocean full of messages in bottles: write one, throw it in, then dive and read what strangers left behind.',href:'https://landrcy.github.io/sea-of-thought/',cta:'▶ Dive in'},
 {id:'void',theme:'void',s:'void',ang:250,dist:1650,title:'The Void',by:'a pixel space game by landrcy',img:'',
  blurb:'A pixel space game at the edge of a black hole. Fall in.',href:'https://landrcy.github.io/the-void/',cta:'▶ Play'},
 {id:'gow',theme:'gow',s:'gow',ang:300,dist:1500,title:'Game of Websites',by:'coopercitywebsites.github.io',img:'sites/gow/screenshot.png',
  blurb:'A searchable catalogue of every site in the collection — unblocked games, NeoForge mods, old builds and the trash pile — ranked by how much code went into each one.',href:'https://coopercitywebsites.github.io/main/',cta:'Open'},
 {id:'gh',theme:'gh',s:'gh',ang:345,dist:1350,title:'GitHub',by:'landrcy',img:'',
  blurb:'All the code behind the LLC: games, sites and experiments.',href:'https://github.com/landrcy',cta:'★ github.com/landrcy'},
 {id:'bf',theme:'bf',s:'bf',ang:100,dist:1450,title:'Eternal Ball Fight',by:'by landrcy',img:'',
  blurb:'Weapon balls fighting endlessly, with a running Total Ball Standings board.',href:'archive/#ballfight',cta:'▶ Watch'},
 // LLC Powered Channels — one red progress-bar string each
 {id:'yt-langrino',theme:'yt',s:'yt',ang:12,dist:1700,title:'Langrino',by:'@Langrino',img:'sites/yt/langrino.jpg',blurb:'Chaotic weapon-ball battle Shorts: two balls with powers enter, one ball leaves.',href:'https://www.youtube.com/@Langrino',cta:'▶ Watch on YouTube'},
 {id:'yt-clutch',theme:'yt',s:'yt',ang:32,dist:1950,title:'clutchclips',by:'@clutchclipscrate',img:'sites/yt/clutch.jpg',blurb:'The best DrDonut and Donut SMP moments, clipped into bite-size Shorts.',href:'https://www.youtube.com/@clutchclipscrate',cta:'▶ Watch on YouTube'},
 {id:'yt-trivia',theme:'yt',s:'yt',ang:52,dist:1700,title:'bowlfuloftrivia',by:'@bowlfuloftrivia',img:'sites/yt/trivia.jpg',blurb:'Quick "did you know?" fact Shorts — space, animals and everything in between.',href:'https://www.youtube.com/@bowlfuloftrivia',cta:'▶ Watch on YouTube'},
 {id:'yt-reddit',theme:'yt',s:'yt',ang:68,dist:2050,title:'RedditStoryADay',by:'@redditstoryaday',img:'sites/yt/reddit.jpg',blurb:'Pull up a log: a Reddit story a day, told over satisfying gameplay.',href:'https://www.youtube.com/channel/UCRegZeMyJ1B5B9n64rfgKAw',cta:'▶ Watch on YouTube'},
 {id:'yt-sat',theme:'yt',s:'yt',ang:82,dist:1750,title:'SAT in a Minute',by:'@satinaminuteprep · launching Oct 28',img:'sites/yt/sat.jpg',blurb:'Fast SAT prep tips, each one in under a minute.',href:'https://www.youtube.com/channel/UCfDhWTThokF3gKW03iEGijg',cta:'▶ Watch on YouTube'},
];
window.LLC_SITES=SITES;
const vp=document.getElementById('viewport'),world=document.getElementById('world'),mapBtn=document.getElementById('mapbtn');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const P=3; // screen px per art pixel (at zoom 1) — every string/rift is drawn on this grid
function rnd(seed){return()=>{seed=(seed*16807)%2147483647;return seed/2147483647}}
const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
// ---------- string geometry (world px) ----------
function strandPts(site,i){
 const r=rnd(1000+i*7919),a=site.ang*Math.PI/180,ex=Math.cos(a)*site.dist,ey=Math.sin(a)*site.dist;
 const sx=Math.cos(a)*400,sy=Math.sin(a)*190,nx=-Math.sin(a),ny=Math.cos(a);
 const bend=(r()-.5)*900,waves=1+r()*1.5,amp=60+r()*70,loopAt=.35+r()*.3,loopR=55+r()*45,dir=r()<.5?-1:1,pts=[],N=400;
 for(let k=0;k<=N;k++){const t=k/N;let x=sx+(ex-sx)*t,y=sy+(ey-sy)*t;
  const off=bend*Math.sin(Math.PI*t)+amp*Math.sin(t*Math.PI*2*waves)*Math.sin(Math.PI*t);x+=nx*off;y+=ny*off;
  const u=(t-loopAt)/.12;if(u>0&&u<1){const th=u*Math.PI*2;x+=dir*loopR*Math.sin(th);y+=loopR*(1-Math.cos(th))*dir*.9}
  pts.push([x,y])}
 site.x=ex;site.y=ey;
 const cum=[0];for(let k=1;k<pts.length;k++)cum.push(cum[k-1]+Math.hypot(pts[k][0]-pts[k-1][0],pts[k][1]-pts[k-1][1]));
 site.pts=pts;site.cum=cum;site.len=cum[cum.length-1]}
function pointAt(s,l){const c=s.cum;let lo=0,hi=c.length-1;l=Math.max(0,Math.min(s.len,l));while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<l)lo=m;else hi=m}
 const k=(l-c[lo])/((c[hi]-c[lo])||1);return{x:s.pts[lo][0]+(s.pts[hi][0]-s.pts[lo][0])*k,y:s.pts[lo][1]+(s.pts[hi][1]-s.pts[lo][1])*k}}
// ---------- per-site pixel styles: outline, 3 shading tones, radius (art px), pattern + decorations ----------
const STY={
 ashaad:{R:3,o:'#1a0305',hi:'#c4505a',mid:'#7a1e24',sh:'#4a0c12',pat:(s,t)=>((s+t*3)%9<2?'sh':null),deco:'blood'},
 sea:{R:2.5,o:'#3d2a12',hi:'#ead2a0',mid:'#c49a5c',sh:'#7d5a2c',pat:(s,t)=>(((s+t*2.5)%5)<1.6?'sh':null),deco:'drips'},
 void:{R:2.5,o:'#7a4dff',hi:'#3b1f73',mid:'#140a24',sh:'#05030a',glow:'#c6a8ff',deco:'stars'},
 gow:{R:1,o:null,hi:'#111111',mid:'#111111',sh:'#111111',deco:'blots'},
 yt:{R:2,o:'#222222',hi:'#ffffff',mid:'#d6d6d6',sh:'#a8a8a8',red:['#ff6b6b','#ff0000','#a30000'],deco:'scrub'},
 gh:{R:1.5,o:'#0d1117',hi:'#57606a',mid:'#24292f',sh:'#0d1117',deco:'commits'},
 bf:{R:2,o:'#5a2a00',hi:'#ffc27a',mid:'#f08a24',sh:'#a24d00',deco:'balls'},
};
function buildString(s,idx){
 const st=STY[s.s],r=rnd(77+idx*131);
 let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of s.pts){a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1])}
 const M=10,ox=Math.floor(a/P)-M,oy=Math.floor(c/P)-M,w=Math.ceil(b/P)-ox+M,h=Math.ceil(d/P)-oy+M,N=w*h;
 const col=new Array(N).fill(null),arc=new Float32Array(N).fill(1e9),kind=new Uint8Array(N); // kind:1 outline/glow 2 body 3 deco
 const set=(x,y,cl,k,ar)=>{if(x<0||y<0||x>=w||y>=h)return;const p=y*w+x;if(k<kind[p])return;if(k===kind[p]&&k!==3&&arc[p]<=ar)return;kind[p]=k;col[p]=cl;arc[p]=Math.min(arc[p],ar)};
 const L=s.len/P,pr=s.s==='yt'?.35+((idx*37)%50)/100:0,R=st.R,LX=-.6,LY=-.8;
 const centres=[];
 for(let l=0;l<=L;l+=.5){const p=pointAt(s,l*P),q=pointAt(s,Math.min(L,l+1)*P),u=p.x/P-ox,v=p.y/P-oy;let tx=q.x-p.x,ty=q.y-p.y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  centres.push([u,v,l,-ty,tx]);
  const RR=Math.ceil(R+2);
  for(let dy=-RR;dy<=RR;dy++)for(let dx=-RR;dx<=RR;dx++){const x=Math.round(u)+dx,y=Math.round(v)+dy,ex=x-u,ey=y-v,dd=Math.hypot(ex,ey);
   if(dd<=R){let tone=(ex*LX+ey*LY)/Math.max(R,1);let k=tone>.35?'hi':tone<-.3?'sh':'mid';
    const tt=(ex*-ty+ey*tx);const pk=st.pat&&st.pat(l,tt);if(pk&&k!=='hi')k=pk;
    let cl=st[k];if(st.red&&l<pr*L)cl=st.red[k==='hi'?0:k==='mid'?1:2];
    set(x,y,cl,2,l)}
   else if(st.o&&dd<=R+1.1)set(x,y,st.o,1,l)
   else if(st.glow&&dd<=R+2.2&&((x+y)&1))set(x,y,st.glow,1,l)}}
 // decorations
 const stamp=(u,v,rad,pal,l,k=3)=>{for(let dy=-rad-1;dy<=rad+1;dy++)for(let dx=-rad-1;dx<=rad+1;dx++){const dd=Math.hypot(dx,dy),x=Math.round(u)+dx,y=Math.round(v)+dy;
  if(dd<=rad){const tone=(dx*LX+dy*LY)/rad;set(x,y,tone>.3?pal[0]:tone<-.3?pal[2]:pal[1],k,l)}else if(dd<=rad+1&&pal[3])set(x,y,pal[3],k-1>0?k:k,l)}};
 centres.forEach((cc,n)=>{const[u,v,l]=cc;
  if(st.deco==='blood'&&n%46===23){const len=2+((r()*4)|0);for(let k=1;k<=len;k++)set(Math.round(u),Math.round(v)+R+k,k===len?'#ff8a8a':'#8a0f17',3,l);set(Math.round(u)+1,Math.round(v)+R+1,'#5e1218',3,l)}
  if(st.deco==='drips'&&n%38===19){const len=2+((r()*4)|0);for(let k=1;k<=len;k++)set(Math.round(u),Math.round(v)+R+k,k===len?'#cfeaff':'#4fa3e8',3,l);set(Math.round(u),Math.round(v)+R+len+2,'#4fa3e8',3,l)}
  if(st.deco==='stars'&&n%7===0){const a2=r()*6.28,d2=4+r()*7,x=Math.round(u+Math.cos(a2)*d2),y=Math.round(v+Math.sin(a2)*d2);const cl=r()<.6?'#c6a8ff':'#ffffff';set(x,y,cl,3,l);if(r()<.25){set(x+1,y,'#7a4dff',3,l);set(x-1,y,'#7a4dff',3,l);set(x,y+1,'#7a4dff',3,l);set(x,y-1,'#7a4dff',3,l)}}
  if(st.deco==='blots'&&n%60===30){const rad=1.5+r()*1.5;stamp(u+(r()-.5)*2,v+(r()-.5)*2,rad,['#333','#111','#000'],l);if(r()<.6)set(Math.round(u+rad+2),Math.round(v+1),'#111',3,l)}
  if(st.deco==='commits'&&n%40===20)stamp(u,v,2.2,['#7ee2a0','#2da44e','#116329','#0d1117'],l);
  if(st.deco==='balls'&&n%44===22){const pal=[['#ffb3b3','#e53935','#8e1b1b','#2b0b0b'],['#b3d4ff','#1e6fe5','#0f3a7a','#0b1a2b'],['#fff0a8','#f2c200','#8a6d00','#2b2300'],['#c8ffb3','#3cb043','#1c5e21','#0b2b0d']][(n/44|0)%4];stamp(u+cc[3]*5,v+cc[4]*5,2.2,pal,l)}
 });
 if(st.deco==='scrub'){const c2=centres[Math.min(centres.length-1,Math.round(pr*L*2))];stamp(c2[0],c2[1],3.6,['#ff8a8a','#ff0000','#a30000','#222222'],pr*L,4)}
 // sort painted pixels by arc so the string can grow in pixel by pixel
 const order=[];for(let p=0;p<N;p++)if(kind[p])order.push(p);order.sort((p,q)=>arc[p]-arc[q]);
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.className='strand';cv.style.cssText=`left:${ox*P}px;top:${oy*P}px;width:${w*P}px;height:${h*P}px`;
 const cx=cv.getContext('2d'),img=cx.createImageData(w,h);
 const rgb=col.map(c=>c?hex(c):null);
 s.str={cv,cx,img,order,rgb,arc,shown:0,L};
 return cv}
function growTo(s,frac){const g=s.str,lim=frac*g.L+.01,d=g.img.data;let n=g.shown;
 while(n<g.order.length&&g.arc[g.order[n]]<=lim){const p=g.order[n],c=g.rgb[p],o=p*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;n++}
 if(n!==g.shown){g.shown=n;g.cx.putImageData(g.img,0,0)}}
// ---------- rifts: a pixel crack in the white dot-grid surface with the site's world inside ----------
const RW=150,RH=130; // art px canvas around each rift
const THEME={
 ashaad:{bg:['#1b1211','#3a2418','#5a3a22'],acc:'#a3343c'},sea:{bg:['#0e3b6e','#2a74c8','#8fd0ff'],acc:'#e8f6ff'},
 void:{bg:['#05030a','#1a0f33','#3b1f73'],acc:'#c6a8ff'},gow:{bg:['#ffffff','#f1f1f1','#111111'],acc:'#111111'},
 yt:{bg:['#0f0f0f','#272727','#ff0000'],acc:'#ffffff'},gh:{bg:['#0d1117','#161b22','#2da44e'],acc:'#7ee2a0'},bf:{bg:['#fff6ea','#ffd9a8','#f08a24'],acc:'#5a2a00'}};
function makeRift(s,idx){
 const r=rnd(500+idx*97),K=48,rad=[];for(let k=0;k<K;k++)rad.push(.72+r()*.5); // jagged edge profile
 const cracks=[];for(let k=0;k<9;k++){const a=r()*6.283,seg=[];let x=0,y=0,ang=a;for(let j=0;j<7;j++){ang+=(r()-.5)*.9;const st=3+r()*5;x+=Math.cos(ang)*st;y+=Math.sin(ang)*st;seg.push([x,y])}cracks.push({a,seg,br:r()})}
 const shards=[];for(let k=0;k<26;k++)shards.push({a:r()*6.283,d:r(),sz:1+((r()*3)|0),vx:(r()-.5)*1.2,vy:-r()*1.5,rot:(r()*4)|0});
 const cv=document.createElement('canvas');cv.width=RW;cv.height=RH;cv.className='riftcv';
 return{cv,cx:cv.getContext('2d'),rad,cracks,shards,open:0,target:0,pop:0,t:0}}
function drawRift(s){const R=s.rift,c=R.cx,th=THEME[s.theme],t=R.t;c.clearRect(0,0,RW,RH);if(R.pop<=0)return;
 const ox=RW/2,oy=RH/2,o=R.open,pop=Math.min(1,R.pop);
 const bx=(9+o*58)*pop,by=(8+o*48)*pop; // crack half-size in art px
 const px=(x,y,cl)=>{c.fillStyle=cl;c.fillRect(x|0,y|0,1,1)};
 const inside=(x,y)=>{const dx=(x-ox)/bx,dy=(y-oy)/by,a=Math.atan2(dy,dx),k=((a/6.283+1)%1)*R.rad.length,i0=k|0,f=k-i0,rr=R.rad[i0]*(1-f)+R.rad[(i0+1)%R.rad.length]*f;return Math.hypot(dx,dy)<=rr};
 // fracture lines radiating into the white surface
 for(const cr of R.cracks){const len=Math.min(cr.seg.length,Math.floor(2+o*5+pop*2));const ex=Math.cos(cr.a)*bx*.95,ey=Math.sin(cr.a)*by*.95;
  for(let j=0;j<len;j++){const p=cr.seg[j],q=j?cr.seg[j-1]:[0,0];const sc=1+o*1.5;const x0=ox+ex+q[0]*sc,y0=oy+ey+q[1]*sc,x1=ox+ex+p[0]*sc,y1=oy+ey+p[1]*sc;
   const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/(n||1)),y=Math.round(y0+(y1-y0)*k/(n||1));px(x,y,'#5b6170');px(x+1,y+1,'#c9ced8')}}}
 // themed world inside + edge with shadowed, chipped white lip
 for(let y=0;y<RH;y++)for(let x=0;x<RW;x++){if(!inside(x,y))continue;
  const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
  if(edge){px(x,y,'#2a2d36');continue}
  const deep=!inside(x,y-3)||!inside(x-2,y); // depth shadow under the top/left lip
  px(x,y,themePix(s.theme,th,x-ox,y-oy,t,deep))}
 // white lip shards on the rim (raised, with drop shadow) + falling shards while opening
 for(const sh of R.shards){const a=sh.a,ex=ox+Math.cos(a)*bx*(1.02+sh.d*.12),ey=oy+Math.sin(a)*by*(1.02+sh.d*.12);
  let fx=ex,fy=ey;const fall=R.fall||0;if(fall>0&&sh.d>.45){fx+=sh.vx*fall*8;fy+=(sh.vy*fall+fall*fall*1.2)*8}
  if(fall>0&&sh.d>.45&&fall>1.6)continue;
  for(let j=0;j<sh.sz;j++)for(let i=0;i<sh.sz+(sh.rot&1);i++){px(fx+i+1,fy+j+1,'#9aa1ae');}
  for(let j=0;j<sh.sz;j++)for(let i=0;i<sh.sz+(sh.rot&1);i++)px(fx+i,fy+j,j===0?'#ffffff':'#e6e9ef')}}
function themePix(name,th,x,y,t,deep){const b=th.bg;let c;
 switch(name){
  case'ashaad':{const row=Math.floor((y+40)/4),off=row&1?3:0,mort=((y+40)%4===0)||(((x+40+off)%7)===0);c=mort?'#140c0b':(((x*7+y*3)&7)<2?'#4a2f1c':'#5a3a22');
   if(Math.hypot(x,y+2)<6+Math.sin(t*3)*1)c=(Math.hypot(x,y+2)<3)?'#000':'#2a0a0c';break}
  case'sea':{const w=Math.sin((x*.35)+t*2.4)*2+Math.sin(x*.12-t)*1.5;c=y<w-6?'#8fd0ff':y<w-4?'#e8f6ff':y<w+6?'#2a74c8':'#0e3b6e';if(((x*13+y*7+((t*6)|0))%41)===0)c='#e8f6ff';break}
  case'void':{const d=Math.hypot(x,y*1.3),a=Math.atan2(y,x)+t*1.4;c=d<6?'#000':(Math.abs(((a*3+d*.25)%6.28)-3)<.5&&d<26)?'#7a4dff':((x*31+y*17)%53===0)?'#fff':'#05030a';break}
  case'gow':{c=((x+60)%10===0||(y+60)%10===0)?'#dcdcdc':'#ffffff';if(Math.abs(y+((x*3+((t*4)|0))%7))<1.2&&Math.abs(x)<20)c='#111';break}
  case'yt':{c=(y+60)%3===0?'#151515':'#0f0f0f';if(Math.abs(x)<8&&Math.abs(y)<6&&x>-4+Math.abs(y)*0.9-2&&x<6-Math.abs(y)*.9)c=Math.abs(x)<8&&x>-4&&(x+4)<(6-Math.abs(y))*1.6?'#ffffff':c;
   if(Math.abs(x)<=10&&Math.abs(y)<=7&&!(x>-4&&x<5-Math.abs(y)*1.2&&Math.abs(y)<5))c=c==='#ffffff'?c:'#ff0000';break}
  case'gh':{const cx=Math.floor((x+60)/3),cy=Math.floor((y+60)/3),edge=(x+60)%3===2||(y+60)%3===2;const v=((cx*7+cy*13+((t*2)|0)*3)%11);c=edge?'#0d1117':v<2?'#39d353':v<4?'#26a641':v<6?'#006d32':'#161b22';break}
  case'bf':{c=((x+y+60)%8<4)?'#fff6ea':'#ffe9cc';const bx=Math.sin(t*2.2)*12,by=-Math.abs(Math.sin(t*4))*8+4;const d=Math.hypot(x-bx,y-by);if(d<3.2)c=d<1.5&&x<bx?'#ffc27a':'#f08a24';else if(d<4.2)c='#5a2a00';
   const b2x=-Math.sin(t*1.7)*10,b2y=-Math.abs(Math.cos(t*3.4))*6+4,d2=Math.hypot(x-b2x,y-b2y);if(d2<2.6)c='#1e6fe5';else if(d2<3.5&&c!=='#5a2a00')c='#0b1a2b';break}
 }
 if(deep){const v=hex(c);c=`rgb(${v[0]*.55|0},${v[1]*.55|0},${v[2]*.55|0})`}
 return c}
// ---------- build world ----------
const strandLayer=document.createElement('div');strandLayer.id='strands';world.prepend(strandLayer);
SITES.forEach((s,i)=>{strandPts(s,i);strandLayer.appendChild(buildString(s,i));
 const rf=document.createElement('div');rf.className='rift r-'+s.theme;rf.id='rift-'+s.id;rf.style.left=s.x+'px';rf.style.top=s.y+'px';
 s.rift=makeRift(s,i);
 rf.innerHTML=`<button class="seed" aria-label="Open rift: ${s.title}"></button><div class="panel"><h2>${s.title}</h2><p class="by">${s.by}</p>`+
  (s.img?`<img src="${s.img}" alt="" loading="lazy">`:'')+`<p>${s.blurb}</p><a class="go" href="${s.href}" ${s.href.startsWith('http')?'target="_blank" rel="noopener"':''}>${s.cta}</a></div>`;
 rf.prepend(s.rift.cv);
 rf.querySelector('.seed').addEventListener('click',e=>{e.stopPropagation();if(dragMoved>6)return;if(mapMode)setMap(false,s);else follow(s)});
 world.appendChild(rf);s.el=rf});
// ---------- intro: strings grow out after the LLC finishes forming ----------
let growStart=0;
function introDone(){const p=window.__llc5&&__llc5.phase;return p==='rest'||p==='static'}
const GROW=1600,STAG=260;
function growStep(now){
 if(!growStart){if(introDone()||(window.__llc5&&__llc5.phase==='skipping'))growStart=now;else return}
 for(let i=0;i<SITES.length;i++){const s=SITES[i],k=RM?1:Math.min(1,Math.max(0,(now-growStart-i*STAG)/GROW));
  if(s.str.shown<s.str.order.length)growTo(s,k===1?1.01:1-Math.pow(1-k,2));
  if(k>=1&&s.rift.pop<1){s.rift.pop=RM?1:Math.min(1,s.rift.pop+.12);s.el.classList.add('shown')}}}
// ---------- camera ----------
let px=0,py=0,z=1,anim=0,mapMode=false;const ZMIN=.05,ZMAX=3;
function draw(){const tx=Math.round(-px*z),ty=Math.round(-py*z);world.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;
 let g=7*z;while(g<6)g*=2;while(g>14)g/=2;vp.style.backgroundSize=g+'px '+g+'px';vp.style.backgroundPosition=`calc(50% + ${tx}px) calc(50% + ${ty}px)`;
 world.style.setProperty('--ms',mapMode?Math.min(8,.45/z):1);
 for(const s of SITES){const d=Math.hypot(s.x-px,s.y-py);s.rift.target=(!mapMode&&z>.55&&d<520/z&&s.rift.pop>=1)?1:0}}
function stop(){cancelAnimationFrame(anim);anim=0}
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
function to(x,y,zz,ms=900){stop();if(RM||!ms){px=x;py=y;z=zz;return draw()}const sx=px,sy=py,sz=z,t0=performance.now();
 const f=t=>{const k=ease(Math.min(1,(t-t0)/ms));px=sx+(x-sx)*k;py=sy+(y-sy)*k;z=Math.exp(Math.log(sz)+(Math.log(zz)-Math.log(sz))*k);draw();if(k<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)}
function follow(s){if(mapMode)return setMap(false,s);stop();if(RM){px=s.x;py=s.y;z=1;return draw()}
 let best=0,bd=1e9;for(let l=0;l<=s.len;l+=s.len/80){const p=pointAt(s,l),d=Math.hypot(p.x-px,p.y-py);if(d<bd){bd=d;best=l}}
 const sx=px,sy=py,sz=z,zt=Math.min(sz,.8),ms=Math.min(4200,1400+(s.len-best)*1.3),t0=performance.now();
 const f=t=>{const k=ease(Math.min(1,(t-t0)/ms)),p=pointAt(s,best+(s.len-best)*k),j=Math.min(1,k*5);px=sx+(p.x-sx)*j;py=sy+(p.y-sy)*j;
  z=k<.15?sz+(zt-sz)*(k/.15):zt+(1-zt)*k;draw();if(k<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)}
function fitAll(){let a=0,b=0,c=0,d=0;for(const s of SITES){a=Math.min(a,s.x);b=Math.max(b,s.x);c=Math.min(c,s.y);d=Math.max(d,s.y)}
 const mx=90,my=110;return[(a+b)/2,(c+d)/2,Math.max(ZMIN,Math.min((innerWidth-2*mx)/(b-a),(innerHeight-2*my)/(d-c)))]}
let preMap=null;
function setMap(on,target){mapMode=on;document.body.classList.toggle('mapmode',on);mapBtn.setAttribute('aria-pressed',on);
 if(on){preMap=[px,py,z];const f=fitAll();to(f[0],f[1],f[2],1400)}else if(target)to(target.x,target.y,1,1400);else{const p=preMap||[0,0,1];to(p[0],p[1],Math.max(.6,p[2]),1400)}}
mapBtn.onclick=()=>setMap(!mapMode);
// ---------- per-frame: string growth + rift crack animation (8 fps pixel steps) ----------
let lastR=0;
function loop(now){requestAnimationFrame(loop);growStep(now);
 if(now-lastR<125)return;lastR=now;
 for(const s of SITES){const R=s.rift;if(R.pop<=0)continue;R.t=now/1000;const was=R.open;
  if(R.target>R.open)R.open=RM?1:Math.min(1,R.open+.2);else if(R.target<R.open)R.open=RM?0:Math.max(0,R.open-.25);
  R.fall=R.open>0&&R.target?(R.fall||0)+.25:0;
  const open=R.open>=1;if(open!==s.el.classList.contains('open'))s.el.classList.toggle('open',open);
  // only redraw rifts near the view (cheap) or in map mode
  const d=Math.hypot(s.x-px,s.y-py)*z;if(d<innerWidth*1.2||mapMode)drawRift(s)}}
requestAnimationFrame(loop);
// ---------- input ----------
const ptrs=new Map();let dragMoved=0,pinch=null;
function nearestString(cx,cy){const wx=px+(cx-innerWidth/2)/z,wy=py+(cy-innerHeight/2)/z,tol=16/z;let best=null,bd=tol;
 for(const s of SITES){if(s.str.shown<s.str.order.length*.9)continue;for(let k=0;k<s.pts.length;k+=2){const d=Math.hypot(s.pts[k][0]-wx,s.pts[k][1]-wy);if(d<bd){bd=d;best=s}}}return best}
vp.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.panel'))return;stop();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});dragMoved=0;vp.setPointerCapture(e.pointerId);vp.classList.add('drag');
 if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z}}});
addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);
 if(!p){if(e.pointerType==='mouse'&&!mapMode)vp.classList.toggle('onstring',!!nearestString(e.clientX,e.clientY));return}
 const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;dragMoved+=Math.abs(dx)+Math.abs(dy);
 if(ptrs.size===2&&pinch){const[a,b]=[...ptrs.values()];zoomAt((a.x+b.x)/2,(a.y+b.y)/2,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d/z);px-=dx/2/z;py-=dy/2/z}else{px-=dx/z;py-=dy/z}draw()});
const end=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!ptrs.size)vp.classList.remove('drag')};addEventListener('pointerup',end);addEventListener('pointercancel',end);
vp.addEventListener('click',e=>{if(dragMoved>6){e.stopPropagation();return}if(mapMode||e.target.closest('button,a,.panel'))return;const s=nearestString(e.clientX,e.clientY);if(s){e.stopPropagation();follow(s)}},true);
function zoomAt(sx,sy,f){const nz=Math.max(ZMIN,Math.min(ZMAX,z*f)),wx=px+(sx-innerWidth/2)/z,wy=py+(sy-innerHeight/2)/z;z=nz;px=wx-(sx-innerWidth/2)/z;py=wy-(sy-innerHeight/2)/z;draw()}
vp.addEventListener('wheel',e=>{e.preventDefault();stop();if(e.ctrlKey||e.metaKey)zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.01));else{px+=e.deltaX/z;py+=e.deltaY/z;draw()}},{passive:false});
addEventListener('keydown',e=>{const s=(e.shiftKey?240:60)/z,m={ArrowLeft:[-s,0],ArrowRight:[s,0],ArrowUp:[0,-s],ArrowDown:[0,s]}[e.key];
 if(m){e.preventDefault();e.stopImmediatePropagation();to(px+m[0],py+m[1],z,RM?0:180)}
 else if(e.key==='+'||e.key==='='){e.stopImmediatePropagation();to(px,py,Math.min(ZMAX,z*1.25),RM?0:200)}else if(e.key==='-'){e.stopImmediatePropagation();to(px,py,Math.max(ZMIN,z/1.25),RM?0:200)}
 else if(e.key==='m'||e.key==='M'){e.stopImmediatePropagation();setMap(!mapMode)}else if(e.key==='Escape'&&mapMode){e.stopImmediatePropagation();setMap(false)}},true);
document.getElementById('recenter').onclick=()=>{if(mapMode){mapMode=false;document.body.classList.remove('mapmode');mapBtn.setAttribute('aria-pressed',false)}to(0,0,1)};
// pixel-art map icon
{const c=document.createElement('canvas');c.width=12;c.height=10;const x=c.getContext('2d');const art=['.##..##..##.','#ee##ff##ee#','#ee#ff#gg#e#','#e##ff#gg#e#','#ee#ffr#gee#','#ee#f#r#g#e#','#e##ff##gee#','#ee#ff#gg#e#','#ee##ff##ee#','.##..##..##.'],pal={'#':'#222','e':'#cfe3b4','f':'#f3e2b0','g':'#9fc9e8','r':'#d33'};
 art.forEach((row,y)=>[...row].forEach((ch,X)=>{if(pal[ch]){x.fillStyle=pal[ch];x.fillRect(X,y,1,1)}}));mapBtn.innerHTML='';mapBtn.appendChild(c)}
window.__pan={get x(){return px},get y(){return py},get z(){return z},set(x,y,zz=z){stop();px=x;py=y;z=zz;draw()},to,follow:id=>follow(SITES.find(s=>s.id===id)),map:setMap,
 point:(id,f)=>{const s=SITES.find(s=>s.id===id),p=pointAt(s,s.len*f);return[innerWidth/2+(p.x-px)*z,innerHeight/2+(p.y-py)*z]}};
addEventListener('resize',draw);draw();
})();

/* Laverse TV: the shelf's gold TV, full size. Turn the dial (drag, wheel, tap, arrow keys) to flip channels; tap the screen to open the site. */
(()=>{'use strict';
const SITES=[
 ['ashaad','The Binding of Ashaad','https://landrcy.github.io/binding-of-ashaad/'],
 ['sea','Sea of Thought','https://landrcy.github.io/sea-of-thought/'],
 ['yt','LLC Powered Channels','/youtube/'],
 ['void','The Void','https://landrcy.github.io/the-void/'],
 ['pmuseum','Pixel Museum','https://landrcy.github.io/pixel-museum/'],
 ['aiquiz','AI Quiz','https://landrcy.github.io/ai-quiz/'],
 ['typefall','typefall','/typefall/'],
 ['mine','MINE','https://landrcy.github.io/mine/'],
 ['ttt','Talk to Tung','/ttt/'],
 ['lan4drcy','lan4drcy','/lan4drcy/'],
 ['lsu','Lsu','/lsu/'],
 ['escapeca','Escape CA','https://landrcy.github.io/escape-ca/'],
 ['terra','Terra','https://landrcy.github.io/terra/'],
 ['wam','W.A.M.','https://landrcy.github.io/wam/'],
 ['cast','CAST','https://landrcy.github.io/cast/']];
const N=SITES.length,RM=matchMedia('(prefers-reduced-motion: reduce)'),$=id=>document.getElementById(id);
const cv=$('tv'),g=cv.getContext('2d'),scr=$('scr'),dialEl=$('dial'),cap=$('cap'),capN=cap.querySelector('.n'),capT=cap.querySelector('.t');
$('sites').innerHTML=SITES.map(s=>`<a href="${s[2]}">${s[1]}</a>`).join('');
const T=TVART.make(),[SX,SY,SW,SH]=T.screen,[DX,DY]=T.dial;
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
// ---- channel loops: each site's own 5s pixel animation (channels.js), drawn into a 66x50 buffer ----
const LOOP=5000,FPS=30,buf=document.createElement('canvas');buf.width=SW;buf.height=SH;const bx=buf.getContext('2d',{willReadFrequently:true});
const A={ash:null};{const im=new Image();im.onload=()=>{A.ash=im;lastKey='';dirty=true;kick()};im.src='img/ashaad_sprite.png?v=1'}
let pic=null,lastKey='';
function picAt(now){const f=RM.matches?0:Math.floor(now/(1000/FPS))%(LOOP/1000*FPS),key=st.ch+':'+f;if(key===lastKey&&pic)return pic;
 lastKey=key;bx.clearRect(0,0,SW,SH);try{TVCH[SITES[st.ch][0]](bx,f/(LOOP/1000*FPS),A)}catch(e){}pic=bx.getImageData(0,0,SW,SH).data;return pic}
// ---- 3x5 OSD digits ----
const FONT={C:'111100100100111',H:'101101111101101','0':'111101101101111','1':'010110010010111','2':'111001111100111','3':'111001111001111','4':'101101111001001','5':'111100111001111','6':'111100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001111'};
function osdMask(txt){const m=new Set();let x0=0;for(const ch of txt){if(ch===' '){x0+=2;continue}const f=FONT[ch];for(let i=0;i<15;i++)if(f[i]==='1')m.add((x0+i%3)+','+Math.floor(i/3));x0+=4}return{m,w:x0-1}}
// ---- state ----
const st={osdUntil:0,ch:0,pow:0,on:false,staticUntil:0,dialVis:0,dialV:0,dialT:0,frame:0};
let dirty=true,raf=0;
const H32=(a,b,c)=>{let h=(a*374761393+b*668265263+c*1442695041)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};
const GREY=[[18,20,26],[46,52,64],[94,106,126],[138,151,171],[174,185,201],[207,216,228],[243,246,250]];
function screenFn(now){const stat=now<st.staticUntil,d=stat?null:picAt(now),showOsd=now<st.osdUntil,pow=st.pow,osd=osdMask('CH '+String(st.ch+1).padStart(2,'0')),ox=SW-6-osd.w,oy=4,fr=Math.floor(now/33);
 const roll=(now/9)%SH;
 return(u,v,def)=>{
  // CRT power-on: a bright line opens into the picture
  let vv=v;if(pow<1){const cy=SH/2,ph=pow/.38;if(pow<.38){const w=ph*SW/2;return Math.abs(v+.5-cy)<1&&Math.abs(u+.5-SW/2)<w?[243,246,250]:[14,16,22]}
   const h=Math.max(1,(1-Math.pow(1-(pow-.38)/.62,3))*SH/2);if(Math.abs(v+.5-cy)>h)return[14,16,22];vv=cy+(v+.5-cy)*(SH/2)/h-.5}
  const nu=u/SW-.5,nv=vv/SH-.5;let c;
  if(stat){const n=H32(u,v,fr),band=Math.abs(((v-roll+SH)%SH)-SH*.5)<3;c=GREY[Math.min(6,Math.floor(n*(band?5:7))+(band?2:0))]}
  else if(d){const i=(clamp(Math.round(vv),0,SH-1)*SW+u)*4;c=[d[i],d[i+1],d[i+2]]}
  else c=def;
  if(showOsd&&!stat&&osd.m.has((u-ox)+','+(v-oy)))c=[140,255,160];else if(showOsd&&!stat&&osd.m.has((u-ox-1)+','+(v-oy-1)))c=[10,40,18];
  const r2=nu*nu+nv*nv,f=stat?(r2>.15?1-(r2-.15)*1.6:1)*(v&1?.88:1):(r2>.3?1-(r2-.3)*.5:1);
  return[Math.min(255,c[0]*f)|0,Math.min(255,c[1]*f)|0,Math.min(255,c[2]*f)|0]}}
// ---- layout ----
let L=TVART.layout(innerWidth,innerHeight);
function layout(){L=TVART.layout(innerWidth,innerHeight);const P=L.P;
 cv.style.width=TVART.W*P+'px';cv.style.height=TVART.H*P+'px';cv.style.transform=`translate(${L.x}px,${L.y}px)`;
 Object.assign(scr.style,{left:L.x+(SX-1)*P+'px',top:L.y+(SY-1)*P+'px',width:(SW+2)*P+'px',height:(SH+2)*P+'px'});
 Object.assign(dialEl.style,{left:L.x+(DX-13)*P+'px',top:L.y+(DY-13)*P+'px',width:27*P+'px',height:27*P+'px'});
 Object.assign(cap.style,{top:L.y+TVART.H*P+Math.max(14,P*4)+'px',fontSize:Math.max(14,Math.min(24,P*3.4))+'px'})}
addEventListener('resize',layout);layout();
// ---- channels ----
function label(){const s=SITES[st.ch];capN.textContent='CH '+String(st.ch+1).padStart(2,'0');capT.textContent=s[1];
 scr.href=s[2];scr.setAttribute('aria-label','Open '+s[1]);if(/^https?:/.test(s[2])){scr.target='_blank';scr.rel='noopener'}else{scr.target='_top';scr.removeAttribute('rel')}
 dialEl.setAttribute('aria-valuenow',st.ch+1);dialEl.setAttribute('aria-valuetext',s[1])}
let capAnim=null;
function setCh(i){i=((i%N)+N)%N;if(i===st.ch)return;st.ch=i;const now=performance.now();st.staticUntil=now+(RM.matches?60:200);st.osdUntil=now+1800;setTimeout(kick,1850);
 if(capAnim)capAnim.cancel();cap.style.opacity=1;
 if(!RM.matches)capAnim=cap.animate([{opacity:.25,transform:'translateY(4px)'},{opacity:1,transform:'none'}],{duration:180,delay:170,easing:'cubic-bezier(.3,.7,.3,1)',fill:'backwards'});
 label();dirty=true;kick()}
function step(dir){if(!st.on)return;st.dialT+=dir;setCh(Math.round(st.dialT));kick()}
// ---- dial input: drag/rotate with detents, tap, wheel, keys ----
let drag=null;
const dialC=()=>[L.x+(DX+.5)*L.P,L.y+(DY+.5)*L.P];
dialEl.addEventListener('pointerdown',e=>{if(!st.on)return;dialEl.setPointerCapture(e.pointerId);const[cx,cy]=dialC();drag={id:e.pointerId,a:Math.atan2(e.clientY-cy,e.clientX-cx),raw:Math.round(st.dialT),moved:0,x:e.clientX,y:e.clientY};e.preventDefault()});
dialEl.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const[cx,cy]=dialC();const a=Math.atan2(e.clientY-cy,e.clientX-cx);let da=a-drag.a;if(da>Math.PI)da-=Math.PI*2;if(da<-Math.PI)da+=Math.PI*2;drag.a=a;
 drag.moved+=Math.abs(e.clientX-drag.x)+Math.abs(e.clientY-drag.y);drag.x=e.clientX;drag.y=e.clientY;
 if(Math.hypot(e.clientX-cx,e.clientY-cy)<L.P*2)return;drag.raw+=da/(Math.PI*2)*TVART.DET;const r=Math.round(drag.raw);
 st.dialT=r+(drag.raw-r)*.32;if(r!==st.chRaw){st.chRaw=r;setCh(r)}kick()});
const endDrag=e=>{if(!drag||drag.id!==e.pointerId)return;const tap=drag.moved<6;drag=null;st.dialT=Math.round(st.dialT);if(tap)step(1);kick()};
dialEl.addEventListener('pointerup',endDrag);dialEl.addEventListener('pointercancel',endDrag);
let wheelAcc=0;addEventListener('wheel',e=>{e.preventDefault();if(!st.on)return;wheelAcc+=e.deltaY+e.deltaX;if(Math.abs(wheelAcc)>=60){step(Math.sign(wheelAcc));wheelAcc=0}},{passive:false});
addEventListener('keydown',e=>{if(!st.on)return;if(e.key==='ArrowRight'||e.key==='ArrowUp'){e.preventDefault();step(1)}else if(e.key==='ArrowLeft'||e.key==='ArrowDown'){e.preventDefault();step(-1)}
 else if((e.key==='Enter'||e.key===' ')&&document.activeElement===dialEl){e.preventDefault();step(1)}});
scr.addEventListener('click',e=>{if(!st.on||st.pow<1){e.preventDefault()}});
// ---- loop ----
function frame(now){raf=0;let more=false;
 // dial spring toward its detent target (a little overshoot = the click)
 const tgt=st.dialT,k=RM.matches?1:0;if(k){st.dialVis=tgt;st.dialV=0}else{st.dialV+=((tgt-st.dialVis)*700-st.dialV*34)/60;st.dialVis+=st.dialV/60}
 if(Math.abs(tgt-st.dialVis)>.002||Math.abs(st.dialV)>.002){more=true;dirty=true}else st.dialVis=tgt;
 if(st.powT0!=null&&st.pow<1){st.pow=clamp((now-st.powT0)/(RM.matches?1:520));if(RM.matches)st.pow=1;more=true;dirty=true;if(st.pow>=1){st.on=true;st.osdUntil=now+1800;setTimeout(kick,1850);label();cap.animate([{opacity:0},{opacity:1}],{duration:RM.matches?120:320,fill:'forwards'})}}
 if(now<st.staticUntil){more=true;dirty=true}else if(st.wasStatic){dirty=true}st.wasStatic=now<st.staticUntil;
 if(st.on&&!document.hidden){if(!RM.matches)more=true;const k2=st.ch+':'+(RM.matches?0:Math.floor(now/(1000/FPS)))+':'+(now<st.osdUntil);if(k2!==st.k2){st.k2=k2;dirty=true}}
 if(dirty){T.setDial(st.dialVis);T.setScreen(st.powT0!=null?screenFn(now):null);T.render();g.clearRect(0,0,112,100);g.drawImage(T.c,0,0);dirty=false}
 if(more||drag)raf=requestAnimationFrame(frame)}
const kick=()=>{if(!raf)raf=requestAnimationFrame(frame)};addEventListener('visibilitychange',kick);
st.chRaw=0;label();kick();
// power on shortly after arrival (a bit later inside the shelf, so its crossfade finishes first)
const inFrame=window.self!==window.top;
const powerOn=()=>{st.powT0=performance.now();kick()};
addEventListener('load',()=>setTimeout(powerOn,inFrame?520:RM.matches?60:280));
window.__tv={st,setCh,step,SITES,get L(){return L}};
})();

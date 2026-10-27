/* Landing mode: drop onto a planet and walk it in first person. Chunky pixel voxel-space terrain, themed per planet. */
(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,N=256,MASK=N-1,TAU=Math.PI*2;
const hx=c=>{const n=parseInt(c.slice(1),16);return[n>>16&255,n>>8&255,n&255]};
const h2=(x,y,s)=>{let h=(x*374761393+y*668265263+s*982451653)|0;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
function vnoise(x,y,p,s){const xi=Math.floor(x),yi=Math.floor(y),u=x-xi,v=y-yi,a=u*u*(3-2*u),b=v*v*(3-2*v),w=i=>((i%p)+p)%p;
 const q=(i,j)=>h2(w(i),w(j),s);return q(xi,yi)*(1-a)*(1-b)+q(xi+1,yi)*a*(1-b)+q(xi,yi+1)*(1-a)*b+q(xi+1,yi+1)*a*b}
function fbm(x,y,o,s,base=4){let t=0,amp=.5,f=base,n=0;for(let i=0;i<o;i++){t+=amp*vnoise(x*f/N,y*f/N,f,s+i*17);n+=amp;amp*=.5;f*=2}return t/n}
const mix=(a,b,k)=>[a[0]+(b[0]-a[0])*k,a[1]+(b[1]-a[1])*k,a[2]+(b[2]-a[2])*k];
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16),bay=(x,y)=>B4[(y&3)*4+(x&3)];
const VS=.42;const ramp=(pal,v,x,y)=>{const n=pal.length-1,f=Math.max(0,Math.min(.999,v))*n,i=Math.floor(f);return pal[Math.min(n,i+((f-i)>bay(x,y)?1:0))]};
// ---- themes: height(x,y) 0..255 and colour(x,y,h) ----
const T={
 sea:{name:'Sea of Thought',sky:['#0b2350','#2a6cc0','#7cc4ff','#cfeeff'],fog:'#a8dcff',wl:84,stars:0,
  h:(x,y)=>{const n=fbm(x,y,5,3);return Math.max(0,(n-.42))*420+40},
  c:(x,y,h,wl)=>{const sand=['#c9a86a','#e2c890','#f3dfae'].map(hx),grass=['#2f6b3a','#3f8a46','#5fae58'].map(hx),rock=['#6b6a6a','#8a8a8a'].map(hx);
   if(h<wl+5)return ramp(sand,(h-wl+6)/12,x,y);if(h<wl+40)return ramp(grass,fbm(x,y,3,9,16),x,y);return ramp(rock,fbm(x,y,2,4,32),x,y)},
  water:['#0a3a7a','#1660b0','#2f8ad8','#9ff5ff'].map(hx),glow:{c:'#9ff5ff',d:.004,min:0}},
 yt:{name:'LLC Powered Channels',sky:['#14020a','#4a0614','#a0142c','#ff6a7a'],fog:'#c0283c',stars:1,
  h:(x,y)=>{const n=fbm(x,y,4,7,3);return n*170+20+Math.max(0,Math.sin(x/N*TAU*4)*Math.sin(y/N*TAU*4))*30},
  c:(x,y,h)=>{const r=['#5a0610','#8a0e1c','#c01a2c','#ff3355'].map(hx);
   // big white play triangles printed on the hills
   const cx=((x%64)+64)%64-32,cy=((y%64)+64)%64-32;if(cx>-10&&cx<12&&Math.abs(cy)<(12-cx)*.55)return hx('#ffffff');return ramp(r,h/220,x,y)},
  glow:{c:'#ff3355',d:.003}},
 ashaad:{name:'The Binding of Ashaad',sky:['#120806','#3a1a0c','#8a4a1a','#e0903a'],fog:'#7a4020',stars:1,
  h:(x,y)=>{const n=fbm(x,y,4,21,4);return Math.floor((n*190+10)/14)*14},
  c:(x,y,h)=>{const s=['#3a2410','#5a3a1a','#7a5428','#a07438','#c89a50'].map(hx);const brick=((x>>2)+((y>>3)&1)*2)%4===0||(y&7)===0;return ramp(s,h/200+(brick?-.15:0),x,y)},
  glow:{c:'#ffb040',d:.006}},
 gow:{name:'Cooper City High',sky:['#2a5ab0','#5a90e0','#a8ccff','#e8f4ff'],fog:'#c8e0ff',stars:0,
  h:(x,y)=>{const n=fbm(x,y,4,31,3)*60+30;const bx=((x%48)+48)%48,by=((y%48)+48)%48;const b=bx>8&&bx<40&&by>12&&by<36&&h2(Math.floor(x/48),Math.floor(y/48),5)>.45;return b?n+70:n},
  c:(x,y,h)=>{const bx=((x%48)+48)%48,by=((y%48)+48)%48,b=bx>8&&bx<40&&by>12&&by<36&&h2(Math.floor(x/48),Math.floor(y/48),5)>.45;
   if(b){if((bx&3)===1&&(by&3)===1)return hx('#ffe27a');return ramp(['#5a0a0e','#8a1418','#b01e22','#e01a22'].map(hx),.5+(((x+y)&3)===0?-.2:0),x,y)}
   if(bx===4||by===6)return hx('#d8d8d8');return ramp(['#2a5a20','#3a7a2a','#5aa03a','#7ac04a'].map(hx),fbm(x,y,3,8,16),x,y)}},
 arena:{name:'Ball Arena',sky:['#0a0a16','#1a1a30','#34345a','#6a6a9a'],fog:'#2a2a48',stars:1,
  h:(x,y)=>{const dx=Math.abs(((x+N/2)%N)-N/2),dy=Math.abs(((y+N/2)%N)-N/2),m=Math.max(dx,dy);if(m<70)return 60;if(m<74)return(dx>66&&dy>66)?140:60;if(m<82)return 40-(m-74)*2;return 18+fbm(x,y,3,41,6)*30},
  c:(x,y,h)=>{const dx=Math.abs(((x+N/2)%N)-N/2),dy=Math.abs(((y+N/2)%N)-N/2),m=Math.max(dx,dy);
   if(m<70){const r=Math.hypot(dx,dy);if(r>18&&r<22)return hx('#e8eef8');return ramp(['#5a6a8a','#7a8cb0','#a2b2d2','#c8d4ec'].map(hx),.6-(((x>>3)+(y>>3))&1)*.08,x,y)}
   if(m<74){if(dx>66&&dy>66)return hx(x<N/2?(y<N/2?'#d83a3a':'#e8e8f0'):(y<N/2?'#3a6bff':'#e8e8f0'));return hx('#f2f2f8')}
   if(m<82)return ramp(['#3a0a10','#9a2232','#c43648'].map(hx),.6,x,y);return ramp(['#0e0e18','#1a1a2a','#26263a'].map(hx),h/60,x,y)},
  glow:{c:'#ffd54a',d:.002}},
 void:{name:'The Void',sky:['#000000','#0a0418','#2a0a4a','#5a1a8a'],fog:'#1a0830',stars:2,
  h:(x,y)=>{const n=fbm(x,y,4,51,4),r=fbm(x,y,2,61,16);return n*80+10+(r>.72?(r-.72)*900:0)},
  c:(x,y,h)=>h>110?ramp(['#5a1aa0','#8a3ad8','#c04df0','#e6c8ff'].map(hx),(h-110)/120,x,y):ramp(['#08040e','#140a24','#24123a'].map(hx),h/90,x,y),
  glow:{c:'#e6c8ff',d:.004}},
 pmuseum:{name:'Pixel Museum',sky:['#05040c','#0a0a1c','#1a1a38','#3a2e58'],fog:'#262448',stars:1,
  // temple ruins: flagstone plazas, raised platforms ringed by columns (some snapped), broken walls, moss
  h:(x,y)=>{const bx=((x%64)+64)%64,by=((y%64)+64)%64,ix=Math.floor(x/64),iy=Math.floor(y/64),k=h2(ix,iy,81),base=30+fbm(x,y,3,83,4)*26;
   if(k>.35){const px=Math.abs(bx-32),py=Math.abs(by-32);
    if(px<22&&py<16){if(px>=18||py>=12){const cx=(bx-11)%7,cy=(by-17)%5;if((px>=18&&py<=12&&cy<2)||(py>=12&&px<=18&&cx<2))return h2(ix*8+(bx>>2),iy*8+(by>>2),85)<.3?100+h2(bx,by,86)*30:150}return 62}
    if(px<24&&py<18)return 50}
   if(k<.2&&by>28&&by<31&&bx>8&&bx<56&&h2(bx>>3,iy,87)>.3)return 92+h2(bx,by,88)*30;
   return base},
  c:(x,y,h)=>{const bx=((x%64)+64)%64,by=((y%64)+64)%64,st=['#2a2230','#463a44','#6a5a5a','#94806e','#c0a888','#e4d0aa'].map(hx);
   if(h>=90){ // columns / wall stones: each 2x2 column gets its own stone (sandstone, grey marble, white marble, dark basalt, weathered ochre)
    const k=h2(x>>1,y>>1,95),P=k<.3?st:k<.5?['#3a3a44','#5a5a66','#8a8a96','#b4b4c0','#d8d8e2'].map(hx):k<.65?['#7a7470','#b0aaa4','#d8d2ca','#f0ece4','#ffffff'].map(hx):k<.8?['#16141c','#24202c','#3a3442','#56505e'].map(hx):['#4a2e1a','#7a5230','#a87a4a','#d0a870'].map(hx);
    return ramp(P,.35+h2(x>>1,y>>1,96)*.45+(((y&7)===0)?-.15:0),x,y)}
   const m=fbm(x,y,3,91,8);if(m>.68)return ramp(['#1a3a1a','#2e6a2a','#5aa040'].map(hx),(m-.66)*4,x,y);
   if(h>=48){const run=(((bx>>2)+(by>>2))%5===0)&&((bx&3)===1||(by&3)===1)&&h>=60;if(run)return hx('#3ad8e0');return ramp(st,.6+((bx&3)===0||(by&3)===0?-.2:0),x,y)}
   const grout=(x&7)===0||((y&7)===0);return ramp(st,(grout?.25:.45)+fbm(x,y,2,93,16)*.25,x,y)},
  glow:{c:'#a8fff8',d:.003}},
 wam:{name:'W.A.M.',sky:['#000000','#040308','#0c0818','#1e1436'],fog:'#0c0a16',stars:1,
  // black arena field: square stone arenas with ornate raised frames and corner towers, obsidian scree between, reality-cracks everywhere
  h:(x,y)=>{const bx=((x%64)+64)%64,by=((y%64)+64)%64,ix=Math.floor(x/64),iy=Math.floor(y/64),k=h2(ix,iy,121),px=Math.abs(bx-32),py=Math.abs(by-32),m=Math.max(px,py),
    cr=Math.abs(fbm(x,y,3,123,4)-.5),cut=cr<.01?-3:0;
   if(k>.28&&m<27){if(m>=23){if(px>=23&&py>=23)return 78;return(m>=26&&((((px>=23?by:bx)>>2)&1)))?52:58}if(m>=22)return 36;return 42+cut}
   return 20+fbm(x,y,4,125,4)*42+(h2(x>>2,y>>2,127)>.93?8:0)+cut},
  c:(x,y,h)=>{const bx=((x%64)+64)%64,by=((y%64)+64)%64,ix=Math.floor(x/64),iy=Math.floor(y/64),k=h2(ix,iy,121),px=Math.abs(bx-32),py=Math.abs(by-32),m=Math.max(px,py),cr=Math.abs(fbm(x,y,3,123,4)-.5);
   const FR=['#1c1c24','#34343e','#55555f','#8a8a96','#c8c8d2'].map(hx),OB=['#060608','#0e0e14','#181820','#24242e','#34343f'].map(hx);
   const wall=k>.28&&m>=22&&m<27;if(!wall){if(cr<.004)return hx('#e6d6ff');if(cr<.01)return hx(cr<.007?'#b480ff':'#5a2a9a')}
   if(k>.28&&m<27){if(m>=23){if(px>=23&&py>=23)return(Math.abs(px-25)<1&&Math.abs(py-25)<1&&h>=70)?hx('#ffffff'):ramp(FR,.6-((x+y)&1)*.06,x,y);return ramp(FR,.38+((((px>=23?by:bx))&3)===0?-.2:0)+(m>=26?.1:0),x,y)}
    if(m>=22)return hx('#050507');const g=(bx&7)===0||(by&7)===0;return ramp(OB,g?.62:.3+h2(bx>>3,by>>3,129)*.12,x,y)}
   if(cr<.02&&bay(x,y)<(.02-cr)*40)return hx('#2a1650');return ramp(OB,(h-20)/46+fbm(x,y,2,131,32)*.2-.1,x,y)},
  glow:{c:'#d8c0ff',d:.003}},
 moon:{name:'Moon',sky:['#000000','#04040a','#0c0c18','#1a1a2a'],fog:'#101018',stars:2,
  h:(x,y)=>{let h=fbm(x,y,4,71,4)*70+40;for(let k=0;k<14;k++){const cx=h2(k,1,71)*N,cy=h2(k,2,71)*N,R=8+h2(k,3,71)*26;let dx=Math.abs(x-cx),dy=Math.abs(y-cy);dx=Math.min(dx,N-dx);dy=Math.min(dy,N-dy);const d=Math.hypot(dx,dy)/R;if(d<1)h-=(1-d*d)*R*.9;else if(d<1.3)h+=(1.3-d)*R*.5}return h},
  c:(x,y,h)=>ramp(['#3a3a42','#5a5a64','#7a7a86','#a2a2ae','#c8c8d2'].map(hx),h/120+fbm(x,y,2,77,32)*.2-.1,x,y)}};
// ---- build the map ----
function build(key){const th=T[key]||T.moon,H=new Float32Array(N*N),C=new Uint32Array(N*N),G=new Uint8Array(N*N);
 for(let y=0;y<N;y++)for(let x=0;x<N;x++)H[y*N+x]=Math.max(0,Math.min(250,th.h(x,y)))*VS;
 const wl=(th.wl||0)*VS;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const k=y*N+x,h=H[k];let c=th.c(x,y,h/VS,wl/VS);
  // light from the upper left: compare with the up-left neighbour
  const sl=h-H[((y-1)&MASK)*N+((x-1)&MASK)],l=Math.max(.55,Math.min(1.25,1+sl*.07));c=[c[0]*l,c[1]*l,c[2]*l];
  if(th.glow&&h2(x,y,99)<th.glow.d&&h>=wl){c=hx(th.glow.c);G[k]=1}
  C[k]=(255<<24)|(Math.min(255,c[2])<<16)|(Math.min(255,c[1])<<8)|Math.min(255,c[0])}
 return{th,H,C,G,wl}}
// ---- dom ----
let el=null,cv=null,cx=null,img=null,buf=null,RW=0,RH=0,S=null,raf=0,last=0;
const keys={};let joy={x:0,y:0,id:null,ox:0,oy:0},look={id:null,x:0,y:0},jumpQ=false;
function ui(){if(el)return;el=document.createElement('div');el.id='land';el.innerHTML=`<canvas aria-label="First-person view of the planet"></canvas>
 <div class="lhud"><b class="lname"></b><button type="button" class="lback ui">⟵ space</button></div>
 <div class="lhint"></div><div class="ljoy" aria-hidden="true"><i></i></div><button type="button" class="ljump" aria-label="Jump">JUMP</button>`;
 document.body.appendChild(el);cv=el.querySelector('canvas');cx=cv.getContext('2d');
 el.querySelector('.lback').onclick=e=>{e.stopPropagation();leave()};el.querySelector('.ljump').addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();jumpQ=true});
 addEventListener('keydown',e=>{if(!S)return;keys[e.code]=1;if(e.code==='Space'){jumpQ=true;e.preventDefault()}if(e.code==='Escape'){e.stopImmediatePropagation();leave()}},true);
 addEventListener('keyup',e=>{keys[e.code]=0});
 cv.addEventListener('click',()=>{if(S&&!S.touch&&document.pointerLockElement!==cv&&cv.requestPointerLock)try{const p=cv.requestPointerLock();p&&p.catch&&p.catch(()=>{})}catch(_){}});
 document.addEventListener('pointerlockchange',()=>{if(!S)return;S.locked=document.pointerLockElement===cv;hint(S.locked?'WASD move · mouse look · space jump · Esc to leave':'click to look around · Esc to leave',S.locked?3500:0)});
 addEventListener('mousemove',e=>{if(S&&S.locked){S.tyaw+=e.movementX*.0026;S.tpitch=clampP(S.tpitch-e.movementY*.0026)}});
 // touch / drag: left half = joystick, right half = look
 cv.addEventListener('pointerdown',e=>{if(!S)return;if(e.pointerType!=='mouse')S.touch=true;if(e.pointerType==='mouse'&&S.locked)return;
  if(e.pointerType!=='mouse'&&e.clientX<innerWidth*.45&&joy.id==null){joy.id=e.pointerId;joy.ox=e.clientX;joy.oy=e.clientY;joy.x=joy.y=0;showJoy(e.clientX,e.clientY,0,0)}
  else if(look.id==null){look.id=e.pointerId;look.x=e.clientX;look.y=e.clientY}cv.setPointerCapture&&cv.setPointerCapture(e.pointerId)});
 cv.addEventListener('pointermove',e=>{if(!S)return;if(e.pointerId===joy.id){const dx=e.clientX-joy.ox,dy=e.clientY-joy.oy,r=Math.hypot(dx,dy),m=48,k=r>m?m/r:1;joy.x=dx*k/m;joy.y=dy*k/m;showJoy(joy.ox,joy.oy,dx*k,dy*k)}
  else if(e.pointerId===look.id){const s=S.touch?.006:.0035;S.tyaw+=(e.clientX-look.x)*s;S.tpitch=clampP(S.tpitch-(e.clientY-look.y)*s);look.x=e.clientX;look.y=e.clientY}});
 const up=e=>{if(e.pointerId===joy.id){joy.id=null;joy.x=joy.y=0;el.querySelector('.ljoy').classList.remove('on')}if(e.pointerId===look.id)look.id=null};
 cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 addEventListener('resize',()=>S&&size())}
const clampP=p=>Math.max(-.9,Math.min(.9,p));
function showJoy(x,y,dx,dy){const j=el.querySelector('.ljoy');j.classList.add('on');j.style.left=x+'px';j.style.top=y+'px';j.firstChild.style.transform=`translate(${dx}px,${dy}px)`}
let hintT=0;function hint(t,ms){const h=el.querySelector('.lhint');h.textContent=t;h.classList.add('on');clearTimeout(hintT);if(ms)hintT=setTimeout(()=>h.classList.remove('on'),ms)}
function size(){const W=innerWidth,H=innerHeight,mob=Math.min(W,H)<600;RH=mob?150:200;RW=Math.max(120,Math.min(mob?260:400,Math.round(RH*W/H)));cv.width=RW;cv.height=RH;img=cx.createImageData(RW,RH);buf=new Uint32Array(img.data.buffer);S&&(S.sky=skyCols(S.m.th))}
function skyCols(th){const c=th.sky.map(hx),out=new Uint32Array(RH*2);for(let y=0;y<RH*2;y++){const v=y/(RH*2-1),f=v*(c.length-1),i=Math.min(c.length-2,Math.floor(f)),k=f-i,q=mix(c[i],c[i+1],k);out[y]=(255<<24)|(q[2]<<16)|(q[1]<<8)|q[0]}return out}
// ---- enter / leave ----
let cur=null;function land(key){ui();const m=build(key);cur=m;const touch=matchMedia('(pointer:coarse)').matches;
 S={key,m,x:N/2+.5,y:N/2+40.5,z:0,vx:0,vy:0,vz:0,yaw:-Math.PI/2,tyaw:-Math.PI/2,pitch:-.05,tpitch:-.05,ch:0,bob:0,t0:performance.now(),acc:0,touch,locked:false,grounded:true};
 if(key==='arena'){S.x=.5;S.y=14.5}else{// spawn on a calm, low patch near the start
  let best=null,bs=1e9;for(let r=0;r<60;r+=3)for(let a=0;a<TAU;a+=.5){const x=S.x+Math.cos(a)*r,y=S.y+Math.sin(a)*r;let mx=-1e9,mn=1e9;for(let dy=-3;dy<=3;dy+=3)for(let dx=-3;dx<=3;dx+=3){const h=Math.max(hAt(x+dx,y+dy),m.wl);mx=Math.max(mx,h);mn=Math.min(mn,h)}const sc=(mx-mn)*3+mx*.05+r*.2;if(sc<bs){bs=sc;best=[x,y]}}S.x=best[0];S.y=best[1]}
 if(key!=='arena'){let by=S.yaw,bm=1e9;for(let a=0;a<TAU;a+=TAU/12){let mx=0;for(let r=4;r<70;r+=4)mx=Math.max(mx,ground(S.x+Math.cos(a)*r,S.y+Math.sin(a)*r)-r*.12);if(mx<bm){bm=mx;by=a}}S.yaw=S.tyaw=by}
 S.z=ground(S.x,S.y);S.ch=S.z+EYE;size();el.querySelector('.lname').textContent=m.th.name;el.classList.toggle('touch',touch);
 document.body.classList.add('landed');el.classList.add('on');
 hint(touch?'left thumb: move · drag right: look · JUMP · ⟵ space to leave':'click to look · WASD move · space jump · Esc to leave',4500);
 window.__blip&&__blip('click');last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(loop)}
function leave(){if(!S)return;S=null;cancelAnimationFrame(raf);if(document.pointerLockElement)document.exitPointerLock();el.classList.remove('on');document.body.classList.remove('landed');for(const k in keys)keys[k]=0;window.__blip&&__blip('click')}
window.__land=land;window.__leaveLand=leave;window.__landState=()=>S&&{x:S.x,y:S.y,z:S.z,yaw:S.yaw,grounded:S.grounded,vx:S.vx,vy:S.vy};
// ---- physics ----
const EYE=6,GR=70,JV=24,ACC=70,MAXS=14,RUN=1.7;
function hAt(x,y){const H=(S&&S.m||cur).H,xi=Math.floor(x),yi=Math.floor(y),u=x-xi,v=y-yi,a=H[(yi&MASK)*N+(xi&MASK)],b=H[(yi&MASK)*N+((xi+1)&MASK)],c=H[((yi+1)&MASK)*N+(xi&MASK)],d=H[((yi+1)&MASK)*N+((xi+1)&MASK)];return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
function ground(x,y){return Math.max(hAt(x,y),S.m.wl)}
function step(dt){let f=(keys.KeyW||keys.ArrowUp?1:0)-(keys.KeyS||keys.ArrowDown?1:0)-joy.y,s=(keys.KeyD?1:0)-(keys.KeyA?1:0)+joy.x;
 const turn=(keys.ArrowRight?1:0)-(keys.ArrowLeft?1:0);S.tyaw+=turn*dt*2.2;
 const l=Math.hypot(f,s);if(l>1){f/=l;s/=l}const run=keys.ShiftLeft||keys.ShiftRight?RUN:1,cy=Math.cos(S.yaw),sy=Math.sin(S.yaw);
 const tx=(cy*f-sy*s)*MAXS*run,ty=(sy*f+cy*s)*MAXS*run,k=1-Math.exp(-dt*(l>.05?6:9)*(S.grounded?1:.35));
 S.vx+=(tx-S.vx)*k;S.vy+=(ty-S.vy)*k;
 // walls: steep rises slow you down instead of teleporting you up cliffs
 const sp0=Math.hypot(S.vx,S.vy)||1,ux=S.vx/sp0,uy=S.vy/sp0,blocked=(x,y)=>{const a=ground(x,y)-S.z,b=ground(x+ux*2.5,y+uy*2.5)-S.z;return a>3||b>EYE-1.5};
 let nx=S.x+S.vx*dt,ny=S.y+S.vy*dt;if(blocked(nx,ny)){// slide along the wall on whichever axis is free
  if(!blocked(nx,S.y)){ny=S.y;S.vy*=.5}else if(!blocked(S.x,ny)){nx=S.x;S.vx*=.5}else{nx=S.x;ny=S.y;S.vx*=.2;S.vy*=.2}}S.x=nx;S.y=ny
 if(jumpQ&&S.grounded){S.vz=JV;S.grounded=false;window.__blip&&__blip('hover')}jumpQ=false;
 const g0=ground(S.x,S.y);if(!S.grounded){S.vz-=GR*dt;S.z+=S.vz*dt;if(S.z<=g0){S.z=g0;S.vz=0;S.grounded=true}}else{if(g0<S.z-2){S.grounded=false;S.vz=0}else S.z=g0}
 S.x=((S.x%N)+N)%N;S.y=((S.y%N)+N)%N;
 // eased look + camera height
 const lk=1-Math.exp(-dt*(S.locked?30:18));S.yaw+=(S.tyaw-S.yaw)*lk;S.pitch+=(S.tpitch-S.pitch)*lk;
 const sp=Math.hypot(S.vx,S.vy);if(!RM&&S.grounded)S.bob+=sp*dt*.55;
 const eye=S.z+EYE+(RM?0:Math.sin(S.bob)*Math.min(1,sp/MAXS)*.7);S.ch+=(eye-S.ch)*(1-Math.exp(-dt*(S.grounded?14:30)))}
// ---- render: voxel space, front to back with a y-buffer ----
const YB=new Int16Array(512);
function render(now){const m=S.m,th=m.th,H=m.H,C=m.C,G=m.G,wl=m.wl,hor=Math.round(RH*.45+S.pitch*RH*.9),sky=S.sky,FOV=1.05,D=S.touch?150:190,scale=RH*.9;
 // reveal: chunky -> detailed over the first .6s (instant with reduced motion)
 const rp=RM?1:Math.min(1,(now-S.t0)/650),blk=rp<1?Math.max(1,Math.round(8*(1-rp)))*1:1;
 for(let y=0;y<RH;y++){const c=sky[Math.max(0,Math.min(RH*2-1,y-hor+RH))];buf.fill(c,y*RW,(y+1)*RW)}
 if(th.stars){for(let i=0;i<70*th.stars;i++){const a=h2(i,7,3)*TAU,el2=h2(i,8,3)*.9,x=Math.round(((a-S.yaw)/TAU%1+1)%1*RW*5.5)%RW*0+0;const sx=Math.round((((a-S.yaw+Math.PI)%TAU+TAU)%TAU-Math.PI)/FOV*RW*.5+RW/2),sy=Math.round(hor-el2*RH*.9);if(sx>=0&&sx<RW&&sy>=0&&sy<RH&&(RM||h2(i,Math.floor(now/400),5)>.12))buf[sy*RW+sx]=0xffffffff}}
 const fog=hx(th.fog),cyw=Math.cos(S.yaw),syw=Math.sin(S.yaw),tf=Math.tan(FOV/2),ch=S.ch,water=m.th.water,tt=now/1000;
 for(let col=0;col<RW;col+=blk){const ox=(col/RW*2-1)*tf,dx=cyw-syw*ox,dy=syw+cyw*ox;let yb=RH,z=2.2,dz=.6;
  while(z<D&&yb>0){const px=S.x+dx*z,py=S.y+dy*z,ix=(px|0)&MASK,iy=(py|0)&MASK,k=iy*N+ix;let h=H[k],c=C[k];
   if(h<wl){const wv=RM?0:Math.sin(px*.35+tt*1.6)+Math.sin(py*.29-tt*1.2);h=wl;const q=water[(wv>1.3?3:wv>.2?2:1)-(z>D*.5&&wv<=1.3?1:0)];c=(255<<24)|(q[2]<<16)|(q[1]<<8)|q[0]}
   const sy=Math.round((ch-h)/z*scale+hor);
   if(sy<yb){const f=Math.min(1,Math.pow(z/D,1.6)),gl=G[k];let r=c&255,g=c>>8&255,b=c>>16&255;if(!gl){r+=(fog[0]-r)*f;g+=(fog[1]-g)*f;b+=(fog[2]-b)*f}
    // dithered fog band so far terrain stays pixel-crisp
    const top=Math.max(0,sy);for(let y=top;y<yb;y++){const ff=(f>.35&&bay(col,y)<(f-.35)*.6)?1:0;const v=ff?(255<<24)|(fog[2]<<16)|(fog[1]<<8)|fog[0]:(255<<24)|(b<<16)|(g<<8)|r;for(let q=0;q<blk&&col+q<RW;q++)buf[y*RW+col+q]=v}yb=top}
   z+=dz;dz*=1.012}}
 if(blk>1)for(let y=0;y<RH;y+=blk)for(let x=0;x<RW;x++){const v=buf[y*RW+x];for(let q=1;q<blk&&y+q<RH;q++)buf[(y+q)*RW+x]=v}
 cx.putImageData(img,0,0)}
function loop(now){if(!S)return;let dt=Math.min(.1,(now-last)/1000);last=now;S.acc+=dt;const h=1/120;while(S.acc>=h){step(h);S.acc-=h}render(now);raf=requestAnimationFrame(loop)}
})();

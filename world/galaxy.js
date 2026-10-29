/* Wormhole in the hub corner. Click it to fall through a hex tunnel into a blood-nebula galaxy
   whose centerpiece is the maximum Omniverse. A second click, the fly-home button, empty space,
   or Escape comes back. Not a planet — the portal is a fixed overlay. */
(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const P=window.PLANETS;
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const WH_GIF='world/assets/wormhole/wormhole-glitch.gif';
const WH_STILL='world/assets/wormhole/wormhole-still.png';
const OM_GIF='world/assets/omniverse/omniverse-spin.gif';
const OM_STILL='world/assets/omniverse/omniverse-max.png';

const worm=document.createElement('button');
worm.type='button';worm.id='worm';
worm.setAttribute('aria-label','Wormhole');
const wimg=document.createElement('img');
wimg.alt='';wimg.draggable=false;
wimg.src=RM?WH_STILL:WH_GIF;
worm.appendChild(wimg);
document.body.appendChild(worm);

const rush=document.createElement('canvas');
rush.id='rush';rush.hidden=true;rush.setAttribute('aria-hidden','true');
document.body.appendChild(rush);
const rg=rush.getContext('2d');

const gal=document.createElement('div');
gal.id='galaxy';gal.hidden=true;
const gsky=document.createElement('canvas');
gsky.id='gsky';gsky.setAttribute('aria-label','Blood nebula galaxy. The Maximum Omniverse is at the center. Drag to fly, click empty space or the wormhole to return.');
const gg=gsky.getContext('2d');
const omni=document.createElement('img');
omni.id='omni';omni.alt='Maximum Omniverse';omni.draggable=false;
omni.src=RM?OM_STILL:OM_STILL;
const back=document.createElement('button');
back.type='button';back.id='gback';back.className='ui';back.textContent='fly home';
gal.append(gsky,omni,back);
document.body.appendChild(gal);

const tip=document.getElementById('tip');
let busy=false,inGal=false,holdTip=false;
const cam={x:0,y:0,z:1};
let GW=1,GH=1,neb=null,stars=[],omniPx=0;

function showTip(text,x,y){if(!tip)return;tip.textContent=text;tip.style.left=(x+14)+'px';tip.style.top=(y+14)+'px';tip.classList.add('on');holdTip=true}
function hideTip(){if(!tip||!holdTip)return;tip.classList.remove('on');holdTip=false}
worm.addEventListener('pointerenter',e=>{if(document.body.classList.contains('arch'))return;showTip(inGal?'Wormhole':'Wormhole',e.clientX,e.clientY)});
worm.addEventListener('pointermove',e=>{if(holdTip&&tip&&tip.textContent==='Wormhole'){tip.style.left=(e.clientX+14)+'px';tip.style.top=(e.clientY+14)+'px'}});
worm.addEventListener('pointerleave',hideTip);

function pxScale(){const w=innerWidth;return w>=1500?4:w>=900?3:2}
function hexDist(x,y){x=Math.abs(x);y=Math.abs(y);return Math.max(y,x*0.8660254+y*0.5)}

function snapshot(){
 const c=document.createElement('canvas');c.width=innerWidth;c.height=innerHeight;
 const x=c.getContext('2d');x.imageSmoothingEnabled=false;
 if(inGal){x.drawImage(gsky,0,0);const r=omni.getBoundingClientRect();if(r.width>2)x.drawImage(omni,r.left,r.top,r.width,r.height)}
 else{const sky=document.getElementById('sky');if(sky)x.drawImage(sky,0,0)}
 return c}

function paintTunnel(buf,bw,bh,u){
 const d=buf.data,t=u*8.5,rushSp=RM?0:u*16;
 for(let y=0;y<bh;y++){
  const gSeed=(y*17+((u*70)|0))%53;
  const gl=gSeed<4;
  const gx0=gl?(y*13)%bw:0,gspan=gl?6+(y*5)%18:0;
  for(let x=0;x<bw;x++){
   let dx=x+.5-bw/2,dy=y+.5-bh/2;
   const hd=hexDist(dx,dy);
   const maxR=hexDist(bw/2,bh/2)||1;
   const depth=Math.min(1,hd/(maxR*.96));
   const band=(((Math.log(hd*.9+1.7)*2.35-rushSp)%1)+1)%1;
   let r,g,b;
   if(hd<2.4){r=10;g=2;b=18}
   else if(band<.11){r=255;g=138;b=28}
   else if(band<.2){r=196;g=68;b=10}
   else if(band<.36){r=22;g=42;b=148}
   else if(band<.48){r=12;g=18;b=72}
   else if(band<.6){r=232;g=104;b=18}
   else if(band<.74){r=92;g=36;b=168}
   else if(band<.86){r=42;g=12;b=78}
   else{r=16;g=4;b=32}
   const sh=.38+depth*.72;
   r*=sh;g*=sh;b*=sh;
   const bay=B4[(y&3)*4+(x&3)];
   if(bay>.62&&band>.7){r*=.55;g*=.45;b*=.85}
   if(gl&&x>=gx0&&x<gx0+gspan){if(y&1){r=48;g=220;b=245}else{r=245;g=40;b=175}}
   // keep the core dark — no white ball
   if(r>210&&g>210&&b>210){r=255;g=120;b=24}
   const o=(y*bw+x)*4;
   d[o]=r;d[o+1]=g;d[o+2]=b;d[o+3]=255}
 }
}

function drawTravel(u,snap,origin){
 const W=innerWidth,H=innerHeight,S=pxScale();
 if(rush.width!==W||rush.height!==H){rush.width=W;rush.height=H}
 rg.imageSmoothingEnabled=false;rg.setTransform(1,0,0,1,0,0);rg.clearRect(0,0,W,H);
 const suck=Math.min(1,u/.42),e=suck*suck*(3-2*suck);
 const px=origin.x+(W/2-origin.x)*Math.min(1,u/.45);
 const py=origin.y+(H/2-origin.y)*Math.min(1,u/.45);
 if(u<.62){
  rg.fillStyle='#010103';rg.fillRect(0,0,W,H);
  const z=1+e*3.1,stretch=1+e*.9;
  rg.save();rg.translate(px,py);rg.scale(z,z*stretch);rg.translate(-px,-py);
  rg.globalAlpha=Math.max(0,1-e*.85);
  rg.drawImage(snap,0,0,W,H);rg.restore();rg.globalAlpha=1}
 // growing portal sprite, then the hex rush
 const grow=RM?.55:(u<.4?.18+u*1.1:.55+(u-.4)*2.4);
 const sz=Math.min(W,H)*grow;
 if(u<.72&&wimg.complete){
  rg.save();rg.translate(px,py);rg.scale(1,1+Math.min(1,u)*0.35);rg.globalAlpha=u<.45?1:Math.max(0,1-(u-.45)/.27);
  rg.drawImage(wimg,-sz/2,-sz/2,sz,sz);rg.restore();rg.globalAlpha=1}
 if(u>.3){
  const bw=Math.max(8,Math.ceil(W/S)),bh=Math.max(8,Math.ceil(H/S));
  if(!drawTravel.buf||drawTravel.buf.width!==bw){const c=document.createElement('canvas');c.width=bw;c.height=bh;drawTravel.buf=c;drawTravel.im=c.getContext('2d').createImageData(bw,bh)}
  paintTunnel(drawTravel.im,bw,bh,u);
  const bx=drawTravel.buf.getContext('2d');bx.putImageData(drawTravel.im,0,0);
  rg.globalAlpha=RM?Math.min(1,(u-.3)/.2):Math.min(1,(u-.3)/.22);
  rg.drawImage(drawTravel.buf,0,0,bw*S,bh*S);
  rg.globalAlpha=1}
 if(u>.78){
  rg.fillStyle='#3a0610';
  rg.globalAlpha=Math.min(1,(u-.78)/.22);
  rg.fillRect(0,0,W,H);rg.globalAlpha=1}
}

function buildNeb(){
 if(!P){neb=null;return}
 const N=320,S=P.mk(N,N),d=S.img.data;
 const R=['#100204','#2c060e','#5c1018','#8e2430','#c43a46','#6a1420','#1a0408'];
 // edge-blended so the tile wraps — a hard repeat was reading as a checkerboard
 const f=(x,y)=>P.fbm(x/78+2,y/78)*1.2+P.fbm(x/28+6,y/28)*.42-.2;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){
  const ax=x/N,ay=y/N;
  const n=f(x,y)*(1-ax)*(1-ay)+f(x-N,y)*ax*(1-ay)+f(x,y-N)*(1-ax)*ay+f(x-N,y-N)*ax*ay;
  const v=Math.max(0,Math.min(1,(n+.08)*1.45));
  const c=P.hx(P.dq(R,v,x,y,v>.5?P.STAR:P.bay));
  const o=(y*N+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
 S.g.putImageData(S.img,0,0);neb=S.c}
function buildStars(){
 stars=[];
 const cols=['#ffd0c4','#ff6a62','#ffb098','#ffd27a','#fff0e4','#e04058'];
 for(let i=0;i<220;i++)stars.push({x:Math.random(),y:Math.random(),s:i%17===0?3:i%5===0?2:1,c:cols[i%cols.length],p:Math.random()*6.28})}

function fitCam(){cam.z=fitZ();cam.x=0;cam.y=0}
function placeOmni(){
 const size=Math.max(48,980*cam.z);
 omniPx=size;
 const x=(0-cam.x)*cam.z+GW/2,y=(0-cam.y)*cam.z+GH/2;
 omni.style.width=Math.round(size)+'px';omni.style.height=Math.round(size)+'px';
 omni.style.transform='translate('+Math.round(x-size/2)+'px,'+Math.round(y-size/2)+'px)'}
function resizeGal(){
 GW=innerWidth;GH=innerHeight;gsky.width=GW;gsky.height=GH;gg.imageSmoothingEnabled=false;
 if(inGal&&!busy)placeOmni()}
function drawGal(now){
 if(!inGal)return;
 gg.imageSmoothingEnabled=false;gg.fillStyle='#140206';gg.fillRect(0,0,GW,GH);
 const T=512,ox=Math.round(((cam.x*.08)%T+T)%T),oy=Math.round(((cam.y*.08)%T+T)%T);
 if(neb){gg.globalAlpha=.92;for(let y=-oy;y<GH;y+=T)for(let x=-ox;x<GW;x+=T)gg.drawImage(neb,x,y,T,T);gg.globalAlpha=1}
 else{const grd=gg.createRadialGradient(GW/2,GH/2,40,GW/2,GH/2,Math.max(GW,GH)*.7);grd.addColorStop(0,'#6a1420');grd.addColorStop(1,'#140206');gg.fillStyle=grd;gg.fillRect(0,0,GW,GH)}
 const t=now/1000;
 for(const s of stars){
  let x=((s.x*GW*1.4-cam.x*s.s*.15)%GW+GW)%GW,y=((s.y*GH*1.4-cam.y*s.s*.15)%GH+GH)%GH;
  const ps=s.s;x=Math.round(x/ps)*ps;y=Math.round(y/ps)*ps;
  const tw=RM?1:.55+.45*Math.sin(t*(.6+s.s*.4)+s.p);if(tw<.2&&s.s===1)continue;
  gg.globalAlpha=tw;gg.fillStyle=s.c;gg.fillRect(x,y,ps,ps);gg.globalAlpha=1}
 // vignette in chunky bands
 placeOmni()}
let gLoop=0;
function galFrame(now){if(!inGal){gLoop=0;return}drawGal(now);gLoop=requestAnimationFrame(galFrame)}

function armOmni(){if(omni.dataset.arm)return;omni.dataset.arm='1';omni.src=RM?OM_STILL:OM_GIF}

function showGalaxy(){
 inGal=true;armOmni();gal.hidden=false;document.body.classList.add('galaxy');
 window.__galaxyHold=true;resizeGal();fitCam();
 worm.setAttribute('aria-label','Return through the wormhole');
 if(!gLoop)gLoop=requestAnimationFrame(galFrame)}
function hideGalaxy(){
 inGal=false;document.body.classList.remove('galaxy');gal.hidden=true;
 window.__galaxyHold=false;worm.setAttribute('aria-label','Wormhole');hideTip()}

function portalOrigin(){const r=worm.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2}}

function travel(toGalaxy){
 if(busy)return;busy=true;hideTip();
 const solar=window.__solar;
 if(solar&&solar.intro&&solar.skip)solar.skip();
 if(solar&&solar.unfocus)solar.unfocus();
 if(toGalaxy)armOmni();
 window.__sfx&&__sfx('whoosh');
 const snap=snapshot();
 const origin=portalOrigin();
 const dur=RM?320:2000;
 const t0=performance.now();
 rush.hidden=false;document.body.classList.add('traveling');
 window.__galaxyHold=true;
 const step=now=>{
  const u=Math.min(1,(now-t0)/dur);
  drawTravel(RM?Math.max(u,.86):u,snap,origin);
  if(u<1)requestAnimationFrame(step);
  else finish()};
 const finish=()=>{
  rush.hidden=true;document.body.classList.remove('traveling');
  if(toGalaxy)showGalaxy();else hideGalaxy();
  busy=false};
 requestAnimationFrame(step)}

worm.addEventListener('click',e=>{
 e.stopPropagation();
 if(document.body.classList.contains('intro')&&window.__solar&&__solar.skip)__solar.skip();
 if(busy||document.body.classList.contains('arch'))return;
 travel(!inGal)});
back.addEventListener('click',e=>{e.stopPropagation();if(!busy)travel(false)});

addEventListener('keydown',e=>{
 if(e.key!=='Escape'||!inGal||busy)return;
 e.preventDefault();e.stopImmediatePropagation();travel(false)},true);

// fly the galaxy: drag pans, wheel / pinch zooms, a quiet click on empty space returns
const pts=new Map();let moved=0,pinch=null;
function overOmni(x,y){const r=omni.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2,rad=r.width*.42;return Math.hypot(x-cx,y-cy)<rad}
gsky.addEventListener('pointerdown',e=>{
 gsky.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;
 if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:cam.z}}});
gsky.addEventListener('pointermove',e=>{
 if(!pts.has(e.pointerId)){
  gsky.style.cursor=overOmni(e.clientX,e.clientY)?'pointer':'grab';
  if(overOmni(e.clientX,e.clientY))showTip('Maximum Omniverse',e.clientX,e.clientY);
  else if(holdTip&&tip&&tip.textContent==='Maximum Omniverse')hideTip();
  return}
 const p=pts.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];pts.set(e.pointerId,[e.clientX,e.clientY]);
 moved+=Math.abs(dx)+Math.abs(dy);if(moved<6)return;gsky.classList.add('drag');
 if(pts.size===2&&pinch){const[a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,pinch.z*(d/(pinch.d||1))/cam.z)}
 else{cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam()}});
function endPtr(e){const was=moved;pts.delete(e.pointerId);if(pts.size<2)pinch=null;gsky.classList.remove('drag');
 if(e.type==='pointerup'&&was<6&&!overOmni(e.clientX,e.clientY)&&!busy)travel(false)}
gsky.addEventListener('pointerup',endPtr);
gsky.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);pinch=null;gsky.classList.remove('drag')});
function zoomAt(sx,sy,f){
 const nz=Math.max(fitZ()*.42,Math.min(fitZ()*3.2,cam.z*f));
 const wx=cam.x+(sx-GW/2)/cam.z,wy=cam.y+(sy-GH/2)/cam.z;
 cam.z=nz;cam.x=wx-(sx-GW/2)/nz;cam.y=wy-(sy-GH/2)/nz;clampCam()}
function fitZ(){
 // the gif has transparent padding; size the box so the ring itself fills the view
 const artW=.92,artH=.66;
 return Math.min(GW*.96/artW,GH*.86/artH)/980}
function clampCam(){
 const lim=980*.55;cam.x=Math.max(-lim,Math.min(lim,cam.x));cam.y=Math.max(-lim*.8,Math.min(lim*.8,cam.y))}
gsky.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.0014))},{passive:false});
addEventListener('resize',()=>{if(inGal){resizeGal();cam.z=fitZ()}});

buildStars();if(P)buildNeb();
// warm the spin after the hub has painted, so the corner gif stays the first download
if(!RM)addEventListener('load',()=>{setTimeout(()=>{const i=new Image();i.src=OM_GIF},1200)},{once:true});

window.__worm={
 travel,galaxy:()=>{if(!inGal&&!busy){armOmni();showGalaxy()}},
 home:()=>{if(inGal&&!busy)hideGalaxy()},
 /** Draw one travel frame for previews. u in 0..1, toGalaxy snapshots the hub. */
 frame(u){const snap=snapshot();rush.hidden=false;document.body.classList.add('traveling');drawTravel(u,snap,portalOrigin())},
 clear(){rush.hidden=true;document.body.classList.remove('traveling');if(!inGal)window.__galaxyHold=false}
};
})();

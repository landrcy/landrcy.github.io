/* Wormhole in the hub corner. Click it to fall through a hex tunnel into a red blood-nebula galaxy
   whose center is the F blackhole, with the maximum Omniverse orbiting it. The little ship, empty space,
   or Escape comes back. The portal is a world-space object far out in the white void past the outer orbits, so it pans and zooms with the solar system. */
(()=>{
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const P=window.PLANETS;
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
const WH_GIF='world/assets/wormhole/wormhole-glitch.gif';
const WH_STILL='world/assets/wormhole/wormhole-still.png';
const OM_GIF='world/assets/omniverse/omniverse-spin.gif';
const OM_STILL='world/assets/omniverse/omniverse-max.png';
// F blackhole: the galaxy's sun. Glitch-in plays once on arrival, then the loop takes over.
const BH_IN='world/assets/blackhole-f/bh-in.gif',BH_LOOP='world/assets/blackhole-f/bh-loop.gif',BH_STILL='world/assets/blackhole-f/bh-still.png',BH_IN_MS=14*60;
// world layout: blackhole at origin, the Omniverse orbits it on a flattened ring like the hub planets
const CL_GIF='world/assets/clover/clover-planet.gif',CL_STILL='world/assets/clover/clover-planet.png';
// F is 5x bigger; the clover planet orbits far out, Max Omniverse is its moon
const BH_W=3800,CL_W=1300,ORB=4300,SQ=.6,OM_PER=70,OM_W=420,MO=980,MO_PER=16;

const worm=document.createElement('button');
worm.type='button';worm.id='worm';
worm.setAttribute('aria-label','Wormhole');
const wimg=document.createElement('img');
wimg.alt='';wimg.draggable=false;
wimg.src=RM?WH_STILL:WH_GIF;
worm.appendChild(wimg);
document.body.appendChild(worm);
// world-space anchor: bottom-right, out in the white void past the tear edge (~2670,1670 on that diagonal), framed by the zoomed-out default overview (z~.23 @1440x900)
const WX=2900,WY=1700,WS=320;
function placeWorm(){
 const v=window.__hubView&&window.__hubView();
 if(v&&v.sys==='main'){const z=v.cam.z,s=Math.max(44,Math.round(WS*z)),x=(WX-v.cam.x)*z+v.W/2,y=(WY-v.cam.y)*z+v.H/2;
  worm.style.width=worm.style.height=s+'px';worm.style.transform='translate('+Math.round(x-s/2)+'px,'+Math.round(y-s/2)+'px)';
  worm.style.display=(x<-s||y<-s||x>v.W+s||y>v.H+s)?'none':''}
 requestAnimationFrame(placeWorm)}
requestAnimationFrame(placeWorm);

const rush=document.createElement('canvas');
rush.id='rush';rush.hidden=true;rush.setAttribute('aria-hidden','true');
document.body.appendChild(rush);
const rg=rush.getContext('2d');

const gal=document.createElement('div');
gal.id='galaxy';gal.hidden=true;
const gsky=document.createElement('canvas');
gsky.id='gsky';gsky.setAttribute('aria-label','Blood nebula galaxy. The F blackhole is at the center, with the lucky clover planet orbiting it and the Maximum Omniverse as its moon. Drag to fly; the little ship at the bottom right flies you back to the hub.');
const gg=gsky.getContext('2d');
const omni=document.createElement('img');
omni.id='omni';omni.alt='Maximum Omniverse';omni.draggable=false;
omni.src=OM_STILL;
const clov=document.createElement('img');clov.id='clov';clov.alt='Lucky clover planet';clov.draggable=false;clov.src=CL_STILL;
clov.style.cssText='position:absolute;left:0;top:0;image-rendering:pixelated;pointer-events:none;user-select:none;z-index:3';
const bh=document.createElement('img');bh.id='bhf';bh.alt='F blackhole';bh.draggable=false;bh.src=BH_STILL;
bh.style.cssText='position:absolute;left:0;top:0;image-rendering:pixelated;pointer-events:none;user-select:none;z-index:2';
omni.style.zIndex=3;
// little pixel ship: the way back out to the hub (the wormhole button is hidden in here)
const back=document.createElement('button');
back.type='button';back.id='ship';back.setAttribute('aria-label','Fly the ship back to the hub');
const shipImg=document.createElement('img');shipImg.alt='';shipImg.draggable=false;
(()=>{const M=['....1....','...121...','...131...','..12221..','..12221..','.1122211.','112222211','1.14441.1','...5.5...','...6.6...'];
 const C={1:'#2a1440',2:'#cfd0ff',3:'#5affd8',4:'#8a7aff',5:'#ff9a30',6:'#ffe080'};
 const c=document.createElement('canvas');c.width=9;c.height=10;const x=c.getContext('2d');
 M.forEach((r,y)=>[...r].forEach((k,i)=>{if(C[k]){x.fillStyle=C[k];x.fillRect(i,y,1,1)}}));shipImg.src=c.toDataURL()})();
back.appendChild(shipImg);
// Omniverse CTA: tap the omniverse -> "roll for yourself..." + glitchy pixel PLAY link
const cta=document.createElement('div');cta.id='omcta';cta.hidden=true;
const ctaT=document.createElement('canvas');ctaT.className='lgtx';ctaT.setAttribute('role','img');ctaT.setAttribute('aria-label','Test ur luck');
const tx=ctaT.getContext('2d');const TXT='TEST UR LUCK';
function drawTxt(){const f="400 64px 'Silkscreen',monospace";tx.font=f;const w=Math.ceil(tx.measureText(TXT).width)+24;if(ctaT.width!==w){ctaT.width=w;ctaT.height=92}
 tx.clearRect(0,0,ctaT.width,ctaT.height);tx.font=f;tx.textBaseline='middle';tx.textAlign='center';tx.lineJoin='miter';
 const cx=ctaT.width/2,cy=ctaT.height/2;tx.fillStyle='#021a06';for(const[dx,dy]of[[-5,0],[5,0],[0,-5],[0,5],[-4,-4],[4,-4],[-4,4],[4,4],[0,8]])tx.fillText(TXT,cx+dx,cy+dy);
 tx.fillStyle='#3cff5a';tx.fillText(TXT,cx,cy);tx.fillStyle='#ff8a94';tx.fillRect(0,0,0,0)}
function glitchTxt(){const W=ctaT.width,H=ctaT.height,n=2+(Math.random()*4|0);for(let k=0;k<n;k++){const h=4*(1+(Math.random()*4|0)),w=8*(4+(Math.random()*20|0)),sx=Math.random()*(W-w)|0,sy=Math.random()*(H-h)|0,dx=Math.max(0,Math.min(W-w,sx+4*((Math.random()*9|0)-4)));
 const d=tx.getImageData(sx,sy,w,h);tx.putImageData(d,dx,sy);if(Math.random()<.4){tx.globalAlpha=.8;tx.fillStyle=Math.random()<.5?'#3cff5a':'#ffe14a';tx.fillRect(dx,sy,4*(2+(Math.random()*6|0)),4);tx.globalAlpha=1}}}
document.fonts&&document.fonts.load("64px 'Silkscreen'").then(drawTxt);drawTxt();
const play=document.createElement('a');play.id='omplay';play.href='https://rainbowroar14.github.io/RNG/';play.target='_blank';play.rel='noopener';play.setAttribute('aria-label','Play: test ur luck');
const pc=document.createElement('canvas');play.appendChild(pc);cta.append(ctaT,play);
pc.width=16;pc.height=16;
const px=pc.getContext('2d');
const PP=[['#0a5a14','M4 2h2v1h2v1h2v1h2v1h2v4h-2v1h-2v1h-2v1h-2v1h-2z'],['#3cff5a','M5 4h1v1h2v1h2v1h2v2h-2v1h-2v1h-2v1h-1z'],['#d8ffd0','M5 8h1v3h-1zM6 9h2v1h-2z']];
function drawPlay0(){px.clearRect(0,0,16,16);for(const[f,d]of PP){px.fillStyle=f;px.fill(new Path2D(d))}}
function drawPlay(){drawPlay0();drawTxt()}
drawPlay();
let glT=0;
function glitch(){if(cta.hidden||RM)return;const S=1,n=2+(Math.random()*5|0);
 for(let k=0;k<n;k++){const w=S*(2+(Math.random()*6|0)),h=S*(1+(Math.random()*2|0));
  const sx=(Math.random()*(pc.width-w)/S|0)*S,sy=(Math.random()*(pc.height-h)/S|0)*S;
  const dx=Math.max(0,Math.min(pc.width-w,sx+S*((Math.random()*7|0)-3)));
  const d=px.getImageData(sx,sy,w,h);px.putImageData(d,dx,sy);
  if(Math.random()<.4){px.fillStyle=Math.random()<.5?'#3cff5a':'#ffe14a';px.globalAlpha=.85;px.fillRect(dx,sy,S*(1+(Math.random()*3|0)),S);px.globalAlpha=1}}
 glitchTxt();
 setTimeout(()=>{drawPlay();if(Math.random()<.5)setTimeout(glitch,70)},90+Math.random()*120)}
function glitchLoop(){clearTimeout(glT);if(cta.hidden)return;glT=setTimeout(()=>{glitch();glitchLoop()},500+Math.random()*1800)}
function showCta(on){cta.hidden=!on;if(on){cta.classList.remove('fin');void cta.offsetWidth;cta.classList.add('fin');placeOmni()}if(on){drawPlay();glitchLoop()}else clearTimeout(glT)}
cta.addEventListener('pointerdown',e=>e.stopPropagation());
cta.addEventListener('click',e=>e.stopPropagation());
cta.style.zIndex=5;
// Finley mode: tap F -> it slides aside and "inley" glitches in letter by letter in Allura
const finW=document.createElement('div');finW.id='finw';finW.setAttribute('aria-hidden','true');
finW.style.cssText="position:absolute;left:0;top:0;z-index:6;pointer-events:none;font-family:'Allura',cursive;color:#ffe6ea;white-space:nowrap;line-height:1;transform-origin:0 50%;text-shadow:0 0 18px #ff1e32,0 0 4px #000";
let finT=[];
function finClear(){finT.forEach(clearTimeout);finT=[]}
function glitchEl(el,on,done){let n=0;const iv=setInterval(()=>{n++;el.style.opacity=Math.random()<.5?'1':'.2';el.style.transform='translate('+((Math.random()*10-5)|0)+'px,'+((Math.random()*6-3)|0)+'px)';el.style.color=Math.random()<.5?'#ff2a4a':'#5affd8';if(n>5){clearInterval(iv);el.style.transform='';el.style.color='';el.style.opacity=on?'1':'0';done&&done()}},55);finT.push(iv)}
function finOn(){if(fin)return;fin=true;gfoc=null;showCta(false);finClear();finW.textContent='';
 if(!document.fonts||RM){} 'inley'.split('').forEach((ch,i)=>{const sp=document.createElement('span');sp.textContent=ch;sp.style.opacity='0';sp.style.display='inline-block';finW.appendChild(sp);finT.push(setTimeout(()=>glitchEl(sp,true),RM?0:500+i*260))})}
function finOff(){if(!fin)return;fin=false;finClear();const sp=[...finW.children].reverse();sp.forEach((el,i)=>finT.push(setTimeout(()=>glitchEl(el,false,()=>el.remove()),RM?0:i*120)))}
// F pixel-scramble + Finley letter glitches (occasional)
const bhG=document.createElement('canvas');bhG.setAttribute('aria-hidden','true');bhG.style.cssText='position:absolute;left:0;top:0;pointer-events:none;image-rendering:pixelated;z-index:4';const bgx=bhG.getContext('2d');
function fScramble(){if(RM||gal.hidden||!bh.complete||!bh.naturalWidth)return;const W=bh.naturalWidth,H=bh.naturalHeight;bhG.width=W;bhG.height=H;bhG.style.width=bh.style.width;bhG.style.height=bh.style.height;bhG.style.transform=bh.style.transform;
 let f=0;const step=()=>{bgx.clearRect(0,0,W,H);if(f++>=3)return;const n=3+(Math.random()*5|0);
  for(let k=0;k<n;k++){const h=1+(Math.random()*Math.max(2,H*.05)|0),w=W*(.12+Math.random()*.22)|0,sx=W*(.3+Math.random()*.4-.06)|0,sy=H*(.3+Math.random()*.4)|0,dx=sx+((Math.random()*W*.1-W*.05)|0);
   bgx.fillStyle='#07020d';bgx.fillRect(sx,sy,w,h);bgx.drawImage(bh,sx,sy,w,h,dx,sy,w,h);
   if(Math.random()<.35){bgx.globalCompositeOperation='source-atop';bgx.fillStyle=Math.random()<.5?'rgba(255,42,74,.5)':'rgba(90,255,216,.5)';bgx.fillRect(dx,sy,w,h);bgx.globalCompositeOperation='source-over'}}
  setTimeout(step,50+Math.random()*60)};step()}
function finGlitch(){const sp=[...finW.children];if(!fin||sp.length!==5||sp.some(e=>e.style.opacity!=='1'))return;const k=1+(Math.random()*2|0);for(let i=0;i<k;i++)glitchEl(sp[Math.random()*5|0],true)}
(function gLoop(){setTimeout(()=>{if(!gal.hidden&&!document.hidden){if(fin&&Math.random()<.6)finGlitch();else fScramble()}gLoop()},1500+Math.random()*3500)})();
function overBH(x,y){const r=bh.getBoundingClientRect();return Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2)<r.width*.33}gal.append(gsky,bh,bhG,clov,omni,cta,finW,back);
document.body.appendChild(gal);

const tip=document.getElementById('tip');
let busy=false,inGal=false,holdTip=false;
const cam={x:0,y:0,z:1};
let fin=false,bhOff=0,gfoc=null,GW=1,GH=1,neb=null,stars=[],omniPx=0,omAng=.55,moAng=0,omSf=1,omHov=false,gLast=0,bhT=0;
function clPos(){return[Math.cos(omAng)*ORB,Math.sin(omAng)*ORB*SQ]}
function omPos(){const[c,d]=clPos();return[c+Math.cos(moAng)*MO,d+Math.sin(moAng)*MO*SQ]}

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
 if(inGal){x.drawImage(gsky,0,0);const r=clov.getBoundingClientRect();if(r.width>2)x.drawImage(clov,r.left,r.top,r.width,r.height)}
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
   else if(band<.11){r=255;g=150;b=40}
   else if(band<.2){r=200;g=80;b=20}
   else if(band<.36){r=40;g=70;b=190}
   else if(band<.48){r=20;g=22;b=90}
   else if(band<.6){r=150;g=70;b=230}
   else if(band<.74){r=90;g=30;b=170}
   else if(band<.86){r=44;g=12;b=86}
   else{r=16;g=4;b=34}
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
 const sm=k=>k*k*(3-2*k);
 // 1) hub-style fly-in: uniform zoom toward the portal, the portal drifting to centre (no stretch)
 const ZU=.42,a=sm(Math.min(1,u/ZU));
 const ps=origin.s||100,zEnd=Math.max(W,H)*1.5/ps,z=Math.exp(Math.log(zEnd)*a);
 const cx=origin.x+(W/2-origin.x)*a,cy=origin.y+(H/2-origin.y)*a;
 if(u<.62){
  rg.fillStyle=inGal?'#140206':'#ffffff';rg.fillRect(0,0,W,H);
  rg.save();rg.translate(cx,cy);rg.scale(z,z);rg.translate(-origin.x,-origin.y);
  rg.drawImage(snap,0,0,W,H);
  if(wimg.complete)rg.drawImage(wimg,origin.x-ps/2,origin.y-ps/2,ps,ps);
  rg.restore()}
 // 2) through the tunnel
 if(u>.3){
  const bw=Math.max(8,Math.ceil(W/S)),bh=Math.max(8,Math.ceil(H/S));
  if(!drawTravel.buf||drawTravel.buf.width!==bw||drawTravel.buf.height!==bh){const c=document.createElement('canvas');c.width=bw;c.height=bh;drawTravel.buf=c;drawTravel.im=c.getContext('2d').createImageData(bw,bh)}
  paintTunnel(drawTravel.im,bw,bh,u);
  drawTravel.buf.getContext('2d').putImageData(drawTravel.im,0,0);
  rg.globalAlpha=Math.min(1,(u-.3)/.14);
  const tz=1+Math.max(0,u-.3)*.6;
  rg.save();rg.translate(W/2,H/2);rg.scale(tz,tz);rg.drawImage(drawTravel.buf,-bw*S/2,-bh*S/2,bw*S,bh*S);rg.restore();
  rg.globalAlpha=1}
 // 3) arrive: crimson flash into the destination (white when heading home)
 if(u>.82){
  const k=Math.min(1,(u-.82)/.18);
  rg.globalAlpha=k;rg.fillStyle=inGal?'#ffffff':'#3a0610';rg.fillRect(0,0,W,H);rg.globalAlpha=1}
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

function fitCam(){gfoc=null;cam.z=fitZ();cam.x=0;cam.y=0}
let fsT=0;function fitCamSoft(){cancelAnimationFrame(fsT);const a={...cam},z1=fitZ(),t0=performance.now(),st=n=>{if(gfoc)return;const u=Math.min(1,(n-t0)/(RM?1:700)),e=u*u*(3-2*u);cam.x=a.x*(1-e);cam.y=a.y*(1-e);cam.z=a.z*Math.pow(z1/a.z,e);if(u<1)fsT=requestAnimationFrame(st)};fsT=requestAnimationFrame(st)}
function placeOmni(){
 const bs=Math.max(40,BH_W*cam.z),bx=(bhOff-cam.x)*cam.z+GW/2,by=(0-cam.y)*cam.z+GH/2;
 bh.style.width=bh.style.height=Math.round(bs)+'px';bh.style.transform='translate('+Math.round(bx-bs/2)+'px,'+Math.round(by-bs/2)+'px)';
 {const fs=BH_W*.36*cam.z;finW.style.fontSize=Math.round(fs)+'px';finW.style.transform='translate('+Math.round(bx+bs*.16)+'px,'+Math.round(by-fs*.55)+'px)'}
 const[cx,cy]=clPos(),[mx,my]=omPos();
 const size=Math.max(64,CL_W*cam.z),ms=Math.max(28,OM_W*cam.z);
 omniPx=size;
 // behind the blackhole on the far half of the ring, in front on the near half; the moon passes behind the clover on its far side
 clov.style.zIndex=cy<0?1:3;omni.style.zIndex=Math.sin(moAng)<0?(cy<0?0:2):(cy<0?2:4);
 const x=(cx-cam.x)*cam.z+GW/2,y=(cy-cam.y)*cam.z+GH/2,ox=(mx-cam.x)*cam.z+GW/2,oy=(my-cam.y)*cam.z+GH/2;
 clov.style.width=clov.style.height=Math.round(size)+'px';
 clov.style.transform='translate('+Math.round(x-size/2)+'px,'+Math.round(y-size/2)+'px)';
 omni.style.width=omni.style.height=Math.round(ms)+'px';
 omni.style.transform='translate('+Math.round(ox-ms/2)+'px,'+Math.round(oy-ms/2)+'px)';
 // CTA is world-anchored to the Omniverse sprite: same world x, centered on the disc, scales with zoom
 cta.style.transform='translate('+Math.round(x)+'px,'+Math.round(y)+'px) scale('+(size/1000).toFixed(4)+') translate(-50%,-50%)'}
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
 // soft crimson vignette in chunky bands
 for(let i=0;i<4;i++){const m=(i+1)*Math.max(8,pxScale()*6);gg.fillStyle='rgba(20,2,6,.22)';gg.fillRect(0,0,GW,m);gg.fillRect(0,GH-m,GW,m);gg.fillRect(0,0,m,GH);gg.fillRect(GW-m,0,m,GH)}
 // orbit: hover slows, open CTA stops it (like the hub planets)
 const dt=Math.min(.05,gLast?(now-gLast)/1000:0);gLast=now;
 const tg=RM?0:omHov&&!gfoc?.35:1;omSf+=(tg-omSf)*Math.min(1,dt*4);omAng+=dt*Math.PI*2/OM_PER*omSf;moAng+=dt*Math.PI*2/MO_PER*omSf;
 // orbit ring: fading pixel trail behind the Omniverse
 {const ps=pxScale(),n=Math.max(40,Math.min(150,Math.round(ORB*cam.z*2.6/(ps*3)))),arc=2.6;gg.fillStyle='#7aff8a';
  for(let k=1;k<=n;k++){const f=k/n,an=omAng-arc*f,sx=(Math.cos(an)*ORB-cam.x)*cam.z+GW/2,sy=(Math.sin(an)*ORB*SQ-cam.y)*cam.z+GH/2;if(sx<-4||sy<-4||sx>GW+4||sy>GH+4)continue;const al=Math.pow(1-f,1.3)*.6;if(al<.02||(k%2&&f>.35))continue;gg.globalAlpha=al;gg.fillRect(Math.round(sx/ps)*ps,Math.round(sy/ps)*ps,ps,ps)}gg.globalAlpha=1}
 // hub-style focus: fly + zoom the camera onto the clicked body
 if(gfoc){const[fx,fy]=gfoc==='om'?omPos():clPos(),zt=Math.min(GW,GH)*(gfoc==='om'?.55:.62)/(gfoc==='om'?OM_W:CL_W),k=Math.min(1,dt*(RM?60:5));cam.x+=(fx-cam.x)*k;cam.y+=(fy-cam.y)*k;cam.z*=Math.pow(zt/cam.z,k)}
 bhOff+=((fin?-BH_W*.42:0)-bhOff)*Math.min(1,dt*(RM?60:3.5));
 placeOmni()}
let gLoop=0;
function galFrame(now){if(!inGal){gLoop=0;return}drawGal(now);gLoop=requestAnimationFrame(galFrame)}

function armOmni(){if(omni.dataset.arm)return;omni.dataset.arm='1';omni.src=RM?OM_STILL:OM_GIF;clov.src=RM?CL_STILL:CL_GIF}
// replay the F glitch-in each arrival, then hand off to the loop
function bhArrive(){clearTimeout(bhT);if(RM){bh.src=BH_STILL;return}bh.src=BH_IN+'?t='+Date.now();bhT=setTimeout(()=>{if(inGal)bh.src=BH_LOOP},BH_IN_MS)}

function showGalaxy(){
 inGal=true;armOmni();bhArrive();gLast=0;gal.hidden=false;document.body.classList.add('galaxy');
 window.__galaxyHold=true;resizeGal();fitCam();
 worm.setAttribute('aria-label','Return through the wormhole');
 if(!gLoop)gLoop=requestAnimationFrame(galFrame)}
function hideGalaxy(){
 inGal=false;fin=false;finClear();finW.textContent='';bhOff=0;clearTimeout(bhT);bh.src=BH_STILL;showCta(false);document.body.classList.remove('galaxy');gal.hidden=true;
 window.__galaxyHold=false;worm.setAttribute('aria-label','Wormhole');hideTip()}

function portalOrigin(){const el=inGal?back:worm,r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,s:inGal?r.width*1.6:r.width}}

function travel(toGalaxy){
 if(busy)return;busy=true;hideTip();
 const solar=window.__solar;
 if(solar&&solar.intro&&solar.skip)solar.skip();
 if(solar&&solar.unfocus)solar.unfocus();
 if(toGalaxy)armOmni();
 window.__sfx&&__sfx('whoosh');
 const snap=snapshot();
 const origin=portalOrigin();
 const dur=RM?320:2400;
 const t0=performance.now();
 document.body.classList.add('traveling');rush.hidden=false;
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
 e.preventDefault();e.stopImmediatePropagation();if(fin){finOff();return}if(gfoc||!cta.hidden){unfocusG();fitCamSoft();return}travel(false)},true);

// fly the galaxy: drag pans, wheel / pinch zooms, a quiet click on empty space returns
const pts=new Map();let moved=0,pinch=null;
function overMoon(x,y){const r=omni.getBoundingClientRect();return Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2)<r.width*.4}
function unfocusG(){gfoc=null;showCta(false)}
function overOmni(x,y){const r=clov.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2,rad=r.width*.42;return Math.hypot(x-cx,y-cy)<rad}
gsky.addEventListener('pointerdown',e=>{
 gsky.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;
 if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:cam.z}}});
gsky.addEventListener('pointermove',e=>{
 if(!pts.has(e.pointerId)){
  omHov=overOmni(e.clientX,e.clientY)||overMoon(e.clientX,e.clientY);gsky.style.cursor=omHov?'pointer':'grab';
  if(overOmni(e.clientX,e.clientY))showTip('Lucky clover \u2014 test ur luck',e.clientX,e.clientY);
  else if(overMoon(e.clientX,e.clientY))showTip('Maximum Omniverse \u2014 moon',e.clientX,e.clientY);
  else if(holdTip&&tip&&/^(Lucky clover|Maximum Omniverse)/.test(tip.textContent))hideTip();
  return}
 const p=pts.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];pts.set(e.pointerId,[e.clientX,e.clientY]);
 moved+=Math.abs(dx)+Math.abs(dy);if(moved<6)return;gsky.classList.add('drag');
 if(pts.size===2&&pinch){const[a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,pinch.z*(d/(pinch.d||1))/cam.z)}
 else{gfoc=null;cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam()}});
function endPtr(e){const was=moved;pts.delete(e.pointerId);if(pts.size<2)pinch=null;gsky.classList.remove('drag');
 if(e.type!=='pointerup'||was>=6||busy)return;
 if(overMoon(e.clientX,e.clientY)&&omni.style.zIndex>clov.style.zIndex||!overOmni(e.clientX,e.clientY)&&overMoon(e.clientX,e.clientY)){showCta(false);gfoc=gfoc==='om'?null:'om';if(!gfoc)fitCamSoft();return}
 if(overOmni(e.clientX,e.clientY)){if(gfoc==='cl'){unfocusG();fitCamSoft()}else{gfoc='cl';showCta(true)}return}
 if(gfoc||!cta.hidden){unfocusG();fitCamSoft();return}
 if(overBH(e.clientX,e.clientY)){fin?finOff():finOn();return}
 if(fin){finOff();return}
 travel(false)}
gsky.addEventListener('pointerup',endPtr);
gsky.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);pinch=null;gsky.classList.remove('drag')});
function zoomAt(sx,sy,f){
 const nz=Math.max(fitZ()*.42,Math.min(fitZ()*40,cam.z*f));
 const wx=cam.x+(sx-GW/2)/cam.z,wy=cam.y+(sy-GH/2)/cam.z;
 cam.z=nz;cam.x=wx-(sx-GW/2)/nz;cam.y=wy-(sy-GH/2)/nz;clampCam()}
function fitZ(){
 // frame the whole orbit (ring + Omniverse art at both ends) around the blackhole
 const w=2*(ORB+MO)+CL_W*.9,h=2*(ORB+MO)*SQ+CL_W*.8;
 return Math.min(GW*.94/w,GH*.88/h)}
function clampCam(){
 const lim=(ORB+MO)*1.05;cam.x=Math.max(-lim,Math.min(lim,cam.x));cam.y=Math.max(-lim*SQ,Math.min(lim*SQ,cam.y))}
gsky.addEventListener('wheel',e=>{e.preventDefault();gfoc=null;zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.0014))},{passive:false});
addEventListener('resize',()=>{if(inGal){resizeGal();cam.z=fitZ()}});

buildStars();if(P)buildNeb();
// warm the spin after the hub has painted, so the corner gif stays the first download
if(!RM)addEventListener('load',()=>{setTimeout(()=>{for(const u of[OM_GIF,CL_GIF,BH_IN,BH_LOOP]){const i=new Image();i.src=u}},1200)},{once:true});

window.__worm={
 travel,galaxy:()=>{if(!inGal&&!busy){armOmni();showGalaxy()}},
 cta:showCta,
 home:()=>{if(inGal&&!busy)hideGalaxy()},
 /** Draw one travel frame for previews. u in 0..1, toGalaxy snapshots the hub. */
 frame(u){const snap=snapshot();rush.hidden=false;document.body.classList.add('traveling');drawTravel(u,snap,portalOrigin())},
 clear(){rush.hidden=true;document.body.classList.remove('traveling');if(!inGal)window.__galaxyHold=false}
};
})();

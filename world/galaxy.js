/* Wormhole in the hub corner. Click it to fall through a hex tunnel into a red blood-nebula galaxy
   whose center is the F blackhole, with the maximum Omniverse orbiting it. The little ship, empty space,
   or Escape comes back. The portal is a world-space object far out in deep space past the outer orbits, so it pans and zooms with the solar system. */
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
const PB_ORB=12400,PB_PER=150,PB_W=1100,DS_ORB=14000,DS_PER=120,DS_W=1500,BH_W=9200,CL_W=1300,ORB=10200,SQ=.6,OM_PER=70,OM_W=420,MO=1400,MO_PER=16;

const worm=document.createElement('button');
worm.type='button';worm.id='worm';
worm.setAttribute('aria-label','Wormhole');
const wimg=document.createElement('img');
wimg.alt='';wimg.draggable=false;
wimg.src=RM?WH_STILL:WH_GIF;
worm.appendChild(wimg);
document.body.appendChild(worm);
// world-space anchor: bottom-right, out in deep space past the outer orbits (~2670,1670 on that diagonal), framed by the zoomed-out default overview (z~.23 @1440x900)
const WX=2900,WY=1700,WS=520;
function placeWorm(){
 const v=window.__hubView&&window.__hubView();
 if(v&&v.sys==='main'){const z=v.cam.z,s=Math.max(44,Math.round(WS*z)),x=(WX-v.cam.x)*z+v.W/2,y=(WY-v.cam.y)*z+v.H/2;
  worm.style.width=worm.style.height=s+'px';worm.style.transform='translate('+Math.round(x-s/2)+'px,'+Math.round(y-s/2)+'px)';
  worm.style.display=(x<-s||y<-s||x>v.W+s||y>v.H+s)?'none':''}
 requestAnimationFrame(placeWorm)}
requestAnimationFrame(placeWorm);

const FFC=!!window.__FFC;
// full-screen veil used to blend wormhole travel into a page navigation (hub <-> /ffc/)
const veil=document.createElement('div');veil.id='veil';veil.setAttribute('aria-hidden','true');
veil.style.cssText='position:fixed;inset:0;z-index:40;pointer-events:none;background:#05040c;opacity:'+(FFC?1:0)+';transition:opacity .9s cubic-bezier(.4,0,.2,1)';
document.body.appendChild(veil);
function goTo(url){veil.style.transition='opacity .55s ease-in';veil.style.pointerEvents='auto';requestAnimationFrame(()=>{veil.style.opacity='1'});setTimeout(()=>{location.href=url},RM?60:600)}
const rush=document.createElement('canvas');
rush.id='rush';rush.hidden=true;rush.setAttribute('aria-hidden','true');
document.body.appendChild(rush);
const rg=rush.getContext('2d');

const gal=document.createElement('div');
gal.id='galaxy';gal.hidden=true;gal.style.opacity='0';gal.style.transition='opacity 1.4s cubic-bezier(.33,0,.2,1)';
const gsky=document.createElement('canvas');
gsky.id='gsky';gsky.setAttribute('aria-label','Blood nebula galaxy. The F blackhole is at the center, with the lucky clover planet orbiting it and the Maximum Omniverse as its moon. Drag or use W A S D to fly; the little ship at the bottom right flies you back to the hub.');
const gg=gsky.getContext('2d');
const omni=document.createElement('img');
omni.id='omni';omni.alt='Maximum Omniverse';omni.draggable=false;
omni.src=OM_STILL;
const clov=document.createElement('img');clov.id='clov';clov.alt='Lucky clover planet';clov.draggable=false;clov.src=CL_STILL;
clov.style.cssText='position:absolute;left:0;top:0;image-rendering:pixelated;pointer-events:none;user-select:none;z-index:3';
/* V39: clSrc is a tiny always-painted GIF decoder; browsers pause GIFs on opacity-0 imgs, so bakeClov samples this instead of clov */
const clSrc=document.createElement('img');clSrc.alt='';clSrc.setAttribute('aria-hidden','true');clSrc.draggable=false;clSrc.src=CL_STILL;
{const box=document.createElement('div');box.setAttribute('aria-hidden','true');box.style.cssText='position:fixed;right:0;bottom:0;width:1px;height:1px;overflow:hidden;opacity:.02;pointer-events:none;z-index:0';clSrc.style.cssText='display:block;width:64px;height:64px';box.appendChild(clSrc);document.body.appendChild(box)}
const bh=document.createElement('img');bh.id='bhf';bh.alt='F blackhole';bh.draggable=false;bh.src=BH_STILL;
bh.style.cssText='position:absolute;left:0;top:0;image-rendering:pixelated;pointer-events:none;user-select:none;z-index:2;-webkit-mask-image:radial-gradient(closest-side,#000 52%,rgba(0,0,0,.85) 64%,rgba(0,0,0,.4) 80%,transparent 100%);mask-image:radial-gradient(closest-side,#000 52%,rgba(0,0,0,.85) 64%,rgba(0,0,0,.4) 80%,transparent 100%);filter:drop-shadow(0 0 18px rgba(90,10,40,.55))';
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
// Deep Sea CTA: clicking the water planet flies the camera to it (follows its orbit) with a title + play link; Esc / empty space backs out
const dsc=document.createElement('div');dsc.id='dscta';dsc.hidden=true;
const dsT=document.createElement('canvas');dsT.className='lgtx';dsT.setAttribute('role','img');dsT.setAttribute('aria-label','Deep Sea');
const dtx=dsT.getContext('2d');
function drawDsT(){const T='DEEP SEA',f="400 64px 'Silkscreen',monospace";dtx.font=f;const w=Math.ceil(dtx.measureText(T).width)+24;if(dsT.width!==w){dsT.width=w;dsT.height=92}
 dtx.clearRect(0,0,dsT.width,dsT.height);dtx.font=f;dtx.textBaseline='middle';dtx.textAlign='center';const cx=dsT.width/2,cy=dsT.height/2;
 dtx.fillStyle='#020c24';for(const[dx,dy]of[[-5,0],[5,0],[0,-5],[0,5],[-4,-4],[4,-4],[-4,4],[4,4],[0,8]])dtx.fillText(T,cx+dx,cy+dy);dtx.fillStyle='#62b8f4';dtx.fillText(T,cx,cy)}
document.fonts&&document.fonts.load("64px 'Silkscreen'").then(drawDsT);drawDsT();
const dsP=document.createElement('a');dsP.id='dsplay';dsP.href='https://rainbowroar14.github.io/Sites/DeepSea/';dsP.target='_blank';dsP.rel='noopener';dsP.setAttribute('aria-label','Play Deep Sea');
{const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');for(const[f,d]of[['#0a3270',PP[0][1]],['#62b8f4',PP[1][1]],['#c4ecff',PP[2][1]]]){g.fillStyle=f;g.fill(new Path2D(d))}dsP.appendChild(c)}
dsc.append(dsT,dsP);dsc.style.zIndex=5;
dsc.addEventListener('pointerdown',e=>e.stopPropagation());dsc.addEventListener('click',e=>e.stopPropagation());
function showDs(on){dsc.hidden=!on;if(on){dsc.classList.remove('fin');void dsc.offsetWidth;dsc.classList.add('fin')}}
// V41 paper-ball planet CTA (FFC): same zoom-in title + play pattern as Deep Sea
const PB_URL='https://rainbowroar14.github.io/FinleyChang.com-Unblocked24/';
const pbc=document.createElement('div');pbc.id='pbcta';pbc.className='pbcta';pbc.hidden=true;
const pbT=document.createElement('canvas');pbT.className='lgtx';pbT.setAttribute('role','img');pbT.setAttribute('aria-label','Sticky Board');
function drawPbT(){const x=pbT.getContext('2d'),T='STICKY BOARD',f="400 64px 'Silkscreen',monospace";x.font=f;const w=Math.ceil(x.measureText(T).width)+24;if(pbT.width!==w){pbT.width=w;pbT.height=92}
 x.clearRect(0,0,pbT.width,pbT.height);x.font=f;x.textBaseline='middle';x.textAlign='center';const cx=pbT.width/2,cy=pbT.height/2;
 x.fillStyle='#1c1917';for(const[dx,dy]of[[-5,0],[5,0],[0,-5],[0,5],[-4,-4],[4,-4],[-4,4],[4,4],[0,8]])x.fillText(T,cx+dx,cy+dy);x.fillStyle='#ffe566';x.fillText(T,cx,cy)}
document.fonts&&document.fonts.load("64px 'Silkscreen'").then(drawPbT);drawPbT();
const pbP=document.createElement('a');pbP.id='pbplay';pbP.href=PB_URL;pbP.target='_blank';pbP.rel='noopener';pbP.setAttribute('aria-label','Play Sticky Board');
{const c=document.createElement('canvas');c.width=c.height=16;const g=c.getContext('2d');for(const[f,d]of[['#1c1917',PP[0][1]],['#ffe566',PP[1][1]],['#fffef8',PP[2][1]]]){g.fillStyle=f;g.fill(new Path2D(d))}pbP.appendChild(c)}
pbc.append(pbT,pbP);pbc.style.zIndex=5;
pbc.addEventListener('pointerdown',e=>e.stopPropagation());pbc.addEventListener('click',e=>e.stopPropagation());
function showPb(on){pbc.hidden=!on;if(on){pbc.classList.remove('fin');void pbc.offsetWidth;pbc.classList.add('fin')}}
window.__galPB=()=>{if(!inGal||busy)return;if(fin)finOff();if(gfoc==='pb'){unfocusG();fitCamSoft();return}showCta(false);showDs(false);gfoc='pb';showPb(true)};
window.__galDS=()=>{if(!inGal||busy)return;if(fin)finOff();if(gfoc==='ds'){unfocusG();fitCamSoft();return}showCta(false);showPb(false);gfoc='ds';showDs(true)};
cta.addEventListener('pointerdown',e=>e.stopPropagation());
cta.addEventListener('click',e=>e.stopPropagation());
cta.style.zIndex=5;
// Finley mode: tap F -> pixel F slides to left edge of the aura, "inley" glitches in rightward (Silkscreen, same as hub text)
const finW=document.createElement('div');finW.id='finw';finW.setAttribute('aria-hidden','true');
finW.style.cssText="position:absolute;left:0;top:0;z-index:6;pointer-events:none;font-family:Silkscreen,monospace;font-weight:700;color:#ffe6ea;white-space:nowrap;line-height:1;transform-origin:0 50%;text-shadow:0 0 18px #ff1e32,0 0 4px #000";
let finT=[],finP=0,finR=0;
const coreC=document.createElement('div');coreC.setAttribute('aria-hidden','true');coreC.style.cssText='position:absolute;left:0;top:0;z-index:5;pointer-events:none;border-radius:50%;background:radial-gradient(circle,#000 62%,rgba(0,0,0,0) 72%);opacity:0';
function finRatio(){if(finR)return finR;const c=document.createElement('canvas').getContext('2d');c.font="700 100px Silkscreen";const w=c.measureText('Finley').width/100;if(document.fonts&&document.fonts.check&&document.fonts.check("700 10px Silkscreen"))finR=w;return w||4.2}
if(document.fonts&&document.fonts.load)document.fonts.load("700 20px Silkscreen").then(()=>{finR=0});
function finClear(){finT.forEach(clearTimeout);finT=[]}
function glitchEl(el,on,done){let n=0;const iv=setInterval(()=>{n++;el.style.opacity=Math.random()<.5?'1':'.2';el.style.transform='translate('+((Math.random()*10-5)|0)+'px,'+((Math.random()*6-3)|0)+'px)';el.style.color=Math.random()<.5?'#ff2a4a':'#5affd8';if(n>5){clearInterval(iv);el.style.transform='';el.style.color='';el.style.opacity=on?'1':'0';done&&done()}},55);finT.push(iv)}
function finOn(){if(fin)return;fin=true;gfoc=null;showCta(false);showDs(false);finClear();finW.textContent='';
 'Finley'.split('').forEach((ch,i)=>{const sp=document.createElement('span');sp.textContent=ch;sp.style.display='inline-block';sp.style.opacity=i?'0':'1';finW.appendChild(sp);if(i)finT.push(setTimeout(()=>glitchEl(sp,true),RM?0:700+i*240))})}
function finOff(){if(!fin)return;fin=false;finClear();const sp=[...finW.children].slice(1).reverse();sp.forEach((el,i)=>finT.push(setTimeout(()=>glitchEl(el,false),RM?0:i*120)));finT.push(setTimeout(()=>{if(!fin){finClear();finW.textContent=''}},RM?0:900))}
// F pixel-scramble + Finley letter glitches (occasional)
const bhG=document.createElement('canvas');bhG.setAttribute('aria-hidden','true');bhG.style.cssText='position:absolute;left:0;top:0;pointer-events:none;image-rendering:pixelated;z-index:4';const bgx=bhG.getContext('2d');
function fScramble(){if(RM||gal.hidden||!bh.complete||!bh.naturalWidth)return;const W=bh.naturalWidth,H=bh.naturalHeight;bhG.width=W;bhG.height=H;bhG.style.width=bh.style.width;bhG.style.height=bh.style.height;bhG.style.transform=bh.style.transform;
 let f=0;const step=()=>{bgx.clearRect(0,0,W,H);if(f++>=3)return;const n=3+(Math.random()*5|0);
  for(let k=0;k<n;k++){const h=1+(Math.random()*Math.max(2,H*.05)|0),w=W*(.12+Math.random()*.22)|0,sx=W*(.3+Math.random()*.4-.06)|0,sy=H*(.3+Math.random()*.4)|0,dx=sx+((Math.random()*W*.1-W*.05)|0);
   bgx.fillStyle='#07020d';bgx.fillRect(sx,sy,w,h);bgx.drawImage(bh,sx,sy,w,h,dx,sy,w,h);
   if(Math.random()<.35){bgx.globalCompositeOperation='source-atop';bgx.fillStyle=Math.random()<.5?'rgba(255,42,74,.5)':'rgba(90,255,216,.5)';bgx.fillRect(dx,sy,w,h);bgx.globalCompositeOperation='source-over'}}
  setTimeout(step,50+Math.random()*60)};step()}
function finGlitch(){const sp=[...finW.children];if(!fin||sp.length!==6||sp.some(e=>e.style.opacity!=='1'))return;const k=1+(Math.random()*2|0);for(let i=0;i<k;i++)glitchEl(sp[1+(Math.random()*5|0)],true)}
(function gLoop(){setTimeout(()=>{if(!gal.hidden&&!document.hidden){if(fin&&Math.random()<.6)finGlitch();else fScramble()}gLoop()},1500+Math.random()*3500)})();
function overBH(x,y){const r=bh.getBoundingClientRect();return Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2)<r.width*.33}gal.append(gsky,bh,bhG,coreC,clov,omni,cta,dsc,pbc,finW,back);
document.body.appendChild(gal);

const tip=document.getElementById('tip');
let busy=false,inGal=false,holdTip=false;
const cam={x:0,y:0,z:1};window.__galView=()=>({cam,GW,GH,inGal,ds:dsPos(),dsZ:dsPos()[1]<0?1:3,pb:pbPos(),pbZ:pbPos()[1]<0?1:3,pbFoc:gfoc==='pb',pbLa:Math.atan2(-pbPos()[1],bhOff-pbPos()[0])});
let fin=false,bhOff=0,gfoc=null,GW=1,GH=1,neb=null,stars=[],omniPx=0,omAng=.55,moAng=0,omSf=1,omHov=false,gLast=0,bhT=0,dsAng=3.75,pbAng=.6;
function clPos(){return[Math.cos(omAng)*ORB,Math.sin(omAng)*ORB*SQ]}
function pbPos(){return[Math.cos(pbAng)*PB_ORB,Math.sin(pbAng)*PB_ORB*SQ]}
function dsPos(){return[Math.cos(dsAng)*DS_ORB,Math.sin(dsAng)*DS_ORB*SQ]}
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
  rg.fillStyle=inGal?'#140206':'#05040c';rg.fillRect(0,0,W,H);
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
 // 3) arrive: crimson flash into the destination (deep violet when heading home)
 if(u>.82){
  const k=Math.min(1,(u-.82)/.18);
  rg.globalAlpha=k;rg.fillStyle=inGal?'#1a0e3a':'#3a0610';rg.fillRect(0,0,W,H);rg.globalAlpha=1}
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
// V32: ominous blackhole light. Each planet gets a shade disc: the side facing the F blackhole glows blood-red, the far side falls into shadow
// V36: per-pixel neutral light from the F blackhole (like Deep Sea): dithered pixel shadow mask, lit face toward the BH, no red glare
const SHN=56,BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
function mkShade(){const c=document.createElement('canvas');c.width=c.height=SHN;c.setAttribute('aria-hidden','true');c.style.cssText='position:absolute;left:0;top:0;pointer-events:none;image-rendering:pixelated;border-radius:50%';return c}
const shDs=mkShade();
function shade(el,wx,wy,sx,sy,s,z){const a=Math.atan2(-wy,bhOff-wx),k=Math.round(a*40);
 el.style.width=el.style.height=Math.round(s)+'px';el.style.transform='translate('+Math.round(sx-s/2)+'px,'+Math.round(sy-s/2)+'px)';el.style.zIndex=z;
 if(el._k===k)return;el._k=k;const L=[Math.cos(a)*.88,Math.sin(a)*.88,.47],g=el.getContext('2d'),im=g.createImageData(SHN,SHN),d=im.data;
 for(let y=0;y<SHN;y++)for(let x=0;x<SHN;x++){const dx=(x+.5-SHN/2)/(SHN/2),dy=(y+.5-SHN/2)/(SHN/2),r2=dx*dx+dy*dy;if(r2>1)continue;
  const nz=Math.sqrt(1-r2),raw=Math.max(0,dx*L[0]+dy*L[1]+nz*L[2]),lit=Math.max(0,Math.min(1,Math.floor(raw*5+(BAY[(y&3)*4+(x&3)]/16-.5)*.6)/5+.1)),i=(y*SHN+x)*4;
  d[i]=4;d[i+1]=3;d[i+2]=12;d[i+3]=Math.round(Math.max(0,1-lit*1.25)*225)}
 g.putImageData(im,0,0)}
const clC=document.createElement('canvas');clC.setAttribute('aria-hidden','true');let clLA=0,clMask=null,clMK=null;const CLN=128;
// dithered light mask (alpha = darkness) for the current light angle; recomputed only when the angle moves
function clMaskFor(a){const k=Math.round(a*40);if(clMK===k)return clMask;clMK=k;const L=[Math.cos(a)*.88,Math.sin(a)*.88,.47],m=new Float32Array(CLN*CLN*2);
 for(let y=0;y<CLN;y++)for(let x=0;x<CLN;x++){const dx=(x+.5-CLN/2)/(CLN/2*.84),dy=(y+.5-CLN/2)/(CLN/2*.84),r2=Math.min(1,dx*dx+dy*dy),nz=Math.sqrt(1-r2),
  raw=Math.max(0,dx*L[0]+dy*L[1]+nz*L[2]),lit=Math.max(0,Math.min(1,Math.floor(raw*5+(BAY[(y&3)*4+(x&3)]/16-.5)*.6)/5+.1)),j=(y*CLN+x)*2;
  m[j]=Math.max(0,1-lit*1.25)*.85;m[j+1]=Math.max(0,1-raw)*Math.pow(Math.min(1,Math.sqrt(dx*dx+dy*dy)),2)}
 return clMask=m}
// bake: copy the current clover frame, darken its own pixels away from the blackhole; the sprite's real rainbow ring pixels stay
// emissive and their blurred colors are added back as light on the clover (V38: sampled from the rings, not an invented hue sweep)
const GN=32,clG=document.createElement('canvas');clG.width=clG.height=GN;const clGg=clG.getContext('2d',{willReadFrequently:true});
function isRb(r,g,b){const mx=Math.max(r,g,b),mn=Math.min(r,g,b);if(mx<120||mx-mn<mx*.55)return false;return !(g>=r&&g>=b&&g-Math.max(r,b)>20&&r<200)}
/* V41: clover frames pre-extracted offline into a sprite sheet (80 frames, 128px, 10x8, 70ms each, from clover-planet.gif);
   we step the frame index on a clock ourselves, no browser GIF decode involved */
const CLF={sh:null,n:80,cols:10,d:70,i:0,t:0};
{const im=new Image();im.onload=()=>{CLF.sh=im};im.src='world/assets/clover/clover-sheet.png?v=42'}
window.__clFrameIdx=()=>CLF.i;
function clFrame(now){if(!CLF.sh)return null;if(!RM){if(!CLF.t)CLF.t=now;const k=Math.floor((now-CLF.t)/CLF.d);if(k>0){CLF.i=(CLF.i+k)%CLF.n;CLF.t+=k*CLF.d;if(now-CLF.t>1000)CLF.t=now}}return CLF.sh}
function bakeClov(){const cf=clFrame(performance.now());if(!inGal||(!cf&&(!clSrc.complete||!clSrc.naturalWidth)))return;if(clC.width!==CLN){clC.width=clC.height=CLN}const g=clC.getContext('2d',{willReadFrequently:true});
 g.imageSmoothingEnabled=false;g.clearRect(0,0,CLN,CLN);(cf?g.drawImage(cf,(CLF.i%CLF.cols)*128,(CLF.i/CLF.cols|0)*128,128,128,0,0,CLN,CLN):g.drawImage(clSrc,0,0,CLN,CLN));const im=g.getImageData(0,0,CLN,CLN),d=im.data,m=clMaskFor(clLA),ring=cta.hidden?1:1.5,st=CLN/GN;
 const em=new ImageData(GN,GN),e=em.data;
 for(let i=0;i<d.length;i+=4){if(d[i+3]<128||!isRb(d[i],d[i+1],d[i+2]))continue;const x=(i>>2)%CLN,y=(i>>2)/CLN|0,o=((y/st|0)*GN+(x/st|0))*4;e[o]+=d[i]/st/st*3;e[o+1]+=d[i+1]/st/st*3;e[o+2]+=d[i+2]/st/st*3}
 for(let o=3;o<e.length;o+=4)e[o]=255;
 clGg.clearRect(0,0,GN,GN);clGg.putImageData(em,0,0);clGg.filter='blur(3px)';clGg.globalCompositeOperation='lighter';clGg.drawImage(clG,0,0);clGg.drawImage(clG,0,0);clGg.filter='none';clGg.globalCompositeOperation='source-over';
 const gl=clGg.getImageData(0,0,GN,GN).data;
 for(let i=0,j=0;i<d.length;i+=4,j+=2){if(!d[i+3])continue;const r=d[i],gg2=d[i+1],b=d[i+2];if(isRb(r,gg2,b))continue;
  const x=(i>>2)%CLN,y=(i>>2)/CLN|0,k=1-m[j],o=((y/st|0)*GN+(x/st|0))*4,w=ring*(.3+.7*(1-k));
  d[i]=Math.min(255,r*k+gl[o]*w*(.25+r/255));d[i+1]=Math.min(255,gg2*k+gl[o+1]*w*(.25+gg2/255));d[i+2]=Math.min(255,b*k+gl[o+2]*w*(.25+b/255))}
 g.putImageData(im,0,0)}
(function clLoop(){if(inGal)bakeClov();requestAnimationFrame(clLoop)})();
function placeOmni(){
 const bs=Math.max(2,BH_W*cam.z),bx=(bhOff-cam.x)*cam.z+GW/2,by=(0-cam.y)*cam.z+GH/2;
 bh.style.width=bh.style.height=Math.round(bs)+'px';bh.style.transform='translate('+Math.round(bx-bs/2)+'px,'+Math.round(by-bs/2)+'px)';
 {const aw=bs*.86,fs=aw/finRatio(),lx=bx-aw/2;finW.style.fontSize=Math.round(fs)+'px';finW.style.transform='translate('+Math.round(lx)+'px,'+Math.round(by-fs*.5)+'px)';
  const e=finP*finP*(3-2*finP),f0=finW.firstChild;if(f0){const fw=f0.offsetWidth||fs*.8;f0.style.transform='translateX('+Math.round((bx-fw/2-lx)*(1-e))+'px)'}
  const cr=bs*.5;coreC.style.width=coreC.style.height=Math.round(cr)+'px';coreC.style.transform='translate('+Math.round(bx-cr/2)+'px,'+Math.round(by-cr/2)+'px)';coreC.style.opacity=finW.firstChild?Math.min(1,finP*6+(fin?.6:0)).toFixed(2):'0'}
 const[cx,cy]=clPos(),[mx,my]=omPos();
 const size=Math.max(2,CL_W*cam.z),ms=Math.max(2,OM_W*cam.z);
 omniPx=size;
 // behind the blackhole on the far half of the ring, in front on the near half; the moon passes behind the clover on its far side
 clov.style.zIndex=cy<0?1:3;omni.style.zIndex=Math.sin(moAng)<0?(cy<0?0:2):(cy<0?2:4);
 const x=(cx-cam.x)*cam.z+GW/2,y=(cy-cam.y)*cam.z+GH/2,ox=(mx-cam.x)*cam.z+GW/2,oy=(my-cam.y)*cam.z+GH/2;
 clov.style.width=clov.style.height=Math.round(size)+'px';
 clov.style.transform='translate('+Math.round(x-size/2)+'px,'+Math.round(y-size/2)+'px)';
 omni.style.width=omni.style.height=Math.round(ms)+'px';
 omni.style.transform='translate('+Math.round(ox-ms/2)+'px,'+Math.round(oy-ms/2)+'px)';
 // CTA is world-anchored to the Omniverse sprite: same world x, centered on the disc, scales with zoom
 {const[px,py]=pbPos(),q=Math.max(2,PB_W*1.3*cam.z);pbc.style.transform='translate('+Math.round((px-cam.x)*cam.z+GW/2)+'px,'+Math.round((py-cam.y)*cam.z+GH/2)+'px) scale('+(q/1000).toFixed(4)+') translate(-50%,-50%)'}
 {const[dx,dy]=dsPos(),q=Math.max(2,DS_W*1.3*cam.z);dsc.style.transform='translate('+Math.round((dx-cam.x)*cam.z+GW/2)+'px,'+Math.round((dy-cam.y)*cam.z+GH/2)+'px) scale('+(q/1000).toFixed(4)+') translate(-50%,-50%)'}
 // V37: shade is baked into the clover sprite's own pixels (no overlay disc); the Maximum Omniverse stays full-bright
 if(clC.parentNode!==gal)gal.append(clC);clLA=Math.atan2(-cy,bhOff-cx);clC.style.cssText=clov.style.cssText;clC.style.opacity='';clov.style.opacity='0';bakeClov();
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
 const tg=RM?0:omHov&&!gfoc?.35:1;omSf+=(tg-omSf)*Math.min(1,dt*4);omAng+=dt*Math.PI*2/OM_PER*omSf;moAng+=dt*Math.PI*2/MO_PER*omSf;if(!RM){dsAng+=dt*Math.PI*2/DS_PER*(gfoc==='ds'?.35:1);pbAng+=dt*Math.PI*2/PB_PER*(gfoc==='pb'?.35:1)}
 // Deep Sea orbit trail (same style, ocean blue)
 {const ps=pxScale(),n=Math.max(40,Math.min(150,Math.round(DS_ORB*cam.z*2.6/(ps*3)))),arc=2.6;gg.fillStyle='#4ac8ff';
  for(let k=1;k<=n;k++){const f=k/n,an=dsAng-arc*f,sx=(Math.cos(an)*DS_ORB-cam.x)*cam.z+GW/2,sy=(Math.sin(an)*DS_ORB*SQ-cam.y)*cam.z+GH/2;if(sx<-4||sy<-4||sx>GW+4||sy>GH+4)continue;const al=Math.pow(1-f,1.3)*.6;if(al<.02||(k%2&&f>.35))continue;gg.globalAlpha=al;gg.fillRect(Math.round(sx/ps)*ps,Math.round(sy/ps)*ps,ps,ps)}gg.globalAlpha=1}
 // orbit ring: fading pixel trail behind the Omniverse
 {const ps=pxScale(),n=Math.max(40,Math.min(150,Math.round(ORB*cam.z*2.6/(ps*3)))),arc=2.6;gg.fillStyle='#7aff8a';
  for(let k=1;k<=n;k++){const f=k/n,an=omAng-arc*f,sx=(Math.cos(an)*ORB-cam.x)*cam.z+GW/2,sy=(Math.sin(an)*ORB*SQ-cam.y)*cam.z+GH/2;if(sx<-4||sy<-4||sx>GW+4||sy>GH+4)continue;const al=Math.pow(1-f,1.3)*.6;if(al<.02||(k%2&&f>.35))continue;gg.globalAlpha=al;gg.fillRect(Math.round(sx/ps)*ps,Math.round(sy/ps)*ps,ps,ps)}gg.globalAlpha=1}
 // hub-style focus: fly + zoom the camera onto the clicked body
 if(gfoc){const[fx,fy]=gfoc==='bh'?[0,0]:gfoc==='om'?omPos():gfoc==='ds'?dsPos():gfoc==='pb'?pbPos():clPos(),zt=Math.min(GW,GH)*(gfoc==='bh'?.9:gfoc==='om'?.55:.62)/(gfoc==='bh'?BH_W:gfoc==='om'?OM_W:gfoc==='ds'?DS_W:gfoc==='pb'?PB_W:CL_W),k=Math.min(1,dt*(RM?60:5));cam.x+=(fx-cam.x)*k;cam.y+=(fy-cam.y)*k;cam.z*=Math.pow(zt/cam.z,k)}
 // V33 (/ffc): WASD flight relative to the F blackhole. W/S fly toward/away from it, A/D strafe around it; the ship always faces it
 if(FFC){let vx=0,vy=0;const kw=gKeys.has('w'),ks=gKeys.has('s'),ka=gKeys.has('a'),kd=gKeys.has('d');
  if(kw||ks||ka||kd){gfoc=null;showCta(false);showDs(false);const r=Math.hypot(cam.x,cam.y/SQ),ux=r>1?-cam.x/r:0,uy=r>1?-cam.y/SQ/r:-1,sp=Math.max(1200,r*.9)*dt;
   const f=(kw?1:0)-(ks?1:0),st=(kd?1:0)-(ka?1:0);if(kw&&r<sp)vx=-cam.x,vy=-cam.y;else{vx=(ux*f-uy*st)*sp;vy=(uy*f+ux*st)*sp*SQ}cam.x+=vx;cam.y+=vy;clampCam()}
  const bx=(0-cam.x)*cam.z+GW/2,by=(0-cam.y)*cam.z+GH/2,r2=back.getBoundingClientRect();if(r2.width){const ang=Math.atan2(by-(r2.top+r2.height/2),bx-(r2.left+r2.width/2))+Math.PI/2;shipImg.style.transform='rotate('+ang.toFixed(3)+'rad)'}}
 bhOff=0;finP+=((fin?1:0)-finP)*Math.min(1,dt*(RM?60:3.2));if(!fin&&finP<.02&&finW.firstChild&&!finT.length)finW.textContent='';finW.style.visibility=(fin||finP>.02)?'visible':'hidden';
 placeOmni()}
let gLoop=0;
function galFrame(now){if(!inGal){gLoop=0;return}drawGal(now);gLoop=requestAnimationFrame(galFrame)}

function armOmni(){if(omni.dataset.arm)return;omni.dataset.arm='1';omni.src=RM?OM_STILL:OM_GIF;clov.src=clSrc.src=RM?CL_STILL:CL_GIF}
// replay the F glitch-in each arrival, then hand off to the loop
function bhArrive(){clearTimeout(bhT);if(RM){bh.src=BH_STILL;return}bh.src=BH_IN+'?t='+Date.now();bhT=setTimeout(()=>{if(inGal)bh.src=BH_LOOP},BH_IN_MS)}

function showGalaxy(){
 inGal=true;armOmni();bhArrive();gLast=0;gal.hidden=false;gal.style.opacity='0';requestAnimationFrame(()=>requestAnimationFrame(()=>{gal.style.opacity='1'}));document.body.classList.add('galaxy');
 window.__galaxyHold=true;resizeGal();fitCam();
 worm.setAttribute('aria-label','Return through the wormhole');
 if(!gLoop)gLoop=requestAnimationFrame(galFrame)}
function hideGalaxy(){
 inGal=false;showDs(false);showPb(false);fin=false;finClear();finW.textContent='';bhOff=0;clearTimeout(bhT);bh.src=BH_STILL;showCta(false);document.body.classList.remove('galaxy');gal.hidden=true;gal.style.opacity='0';
 window.__galaxyHold=false;worm.setAttribute('aria-label','Wormhole');hideTip()}

let srcWorm=worm;
function portalOrigin(){const el=inGal?back:srcWorm,r=el.getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2,s:inGal?r.width*1.6:r.width}}

// any click during the travel animation snaps straight to the destination
let skipT=false;
rush.addEventListener('pointerdown',e=>{if(busy){e.preventDefault();e.stopPropagation();skipT=true}});
function travel(toGalaxy){
 if(busy)return;busy=true;skipT=false;hideTip();
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
  if(skipT){finish();return}
  drawTravel(RM?Math.max(u,.86):u,snap,origin);
  if(u<1)requestAnimationFrame(step);
  else finish()};
 const finish=()=>{
  if(toGalaxy&&!FFC){goTo('ffc/');return}
  if(!toGalaxy&&FFC){goTo('../');return}
  rush.hidden=true;document.body.classList.remove('traveling');
  if(toGalaxy)showGalaxy();else hideGalaxy();
  busy=false};
 requestAnimationFrame(step)}

worm.addEventListener('click',e=>{
 e.stopPropagation();srcWorm=worm;
 if(document.body.classList.contains('intro')&&window.__solar&&__solar.skip)__solar.skip();
 if(busy||document.body.classList.contains('arch'))return;
 travel(!inGal)});
back.addEventListener('click',e=>{e.stopPropagation();if(!busy)travel(false)});

const gKeys=new Set();
addEventListener('keydown',e=>{const c=(e.code||'').replace('Key','').toLowerCase();if(FFC&&inGal&&!busy&&!e.ctrlKey&&!e.metaKey&&!e.altKey&&'wasd'.includes(c)&&c.length===1&&!/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||'')){gKeys.add(c);e.preventDefault()}});
addEventListener('keyup',e=>{gKeys.delete((e.code||'').replace('Key','').toLowerCase())});addEventListener('blur',()=>gKeys.clear());
addEventListener('keydown',e=>{
 if(e.key!=='Escape')return;
 // on /ffc/ Escape never leaves the page: it only backs out of a focused planet/blackhole
 if(FFC){e.preventDefault();e.stopImmediatePropagation();if(busy)return;if(fin){finOff();return}if(gfoc||!cta.hidden||(!dsc.hidden||!pbc.hidden))unfocusG();fitCamSoft();return}
 if(!inGal||busy)return;
 e.preventDefault();e.stopImmediatePropagation();if(fin){finOff();return}if(gfoc||!cta.hidden||(!dsc.hidden||!pbc.hidden)){unfocusG();fitCamSoft();return}travel(false)},true);

// fly the galaxy: drag pans, wheel / pinch zooms, a quiet click on empty space returns
const pts=new Map();let moved=0,pinch=null;
function overMoon(x,y){const r=omni.getBoundingClientRect();return Math.hypot(x-r.left-r.width/2,y-r.top-r.height/2)<r.width*.4}
function unfocusG(){gfoc=null;showCta(false);showDs(false);showPb(false)}
function overOmni(x,y){const r=clov.getBoundingClientRect();const cx=r.left+r.width/2,cy=r.top+r.height/2,rad=r.width*.42;return Math.hypot(x-cx,y-cy)<rad}
gsky.addEventListener('pointerdown',e=>{
 gsky.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;
 if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:cam.z}}});
gsky.addEventListener('pointermove',e=>{
 if(!pts.has(e.pointerId)){
  omHov=overOmni(e.clientX,e.clientY)||overMoon(e.clientX,e.clientY);gsky.style.cursor=omHov?'pointer':'grab';
  if(overOmni(e.clientX,e.clientY))showTip('Lucky clover',e.clientX,e.clientY);
  else if(overMoon(e.clientX,e.clientY))showTip('Maximum Omniverse',e.clientX,e.clientY);
  else if(holdTip&&tip&&/^(Lucky clover|Maximum Omniverse)/.test(tip.textContent))hideTip();
  return}
 const p=pts.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];pts.set(e.pointerId,[e.clientX,e.clientY]);
 moved+=Math.abs(dx)+Math.abs(dy);if(moved<6)return;gsky.classList.add('drag');
 if(pts.size===2&&pinch){const[a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,pinch.z*(d/(pinch.d||1))/cam.z)}
 else{gfoc=null;cam.x-=dx/cam.z;cam.y-=dy/cam.z;clampCam()}});
function endPtr(e){const was=moved;pts.delete(e.pointerId);if(pts.size<2)pinch=null;gsky.classList.remove('drag');
 if(e.type!=='pointerup'||was>=6||busy)return;
 if(overMoon(e.clientX,e.clientY)&&omni.style.zIndex>clov.style.zIndex||!overOmni(e.clientX,e.clientY)&&overMoon(e.clientX,e.clientY)){showCta(false);showDs(false);gfoc=gfoc==='om'?null:'om';if(!gfoc)fitCamSoft();return}
 if(overOmni(e.clientX,e.clientY)){if(gfoc==='cl'){unfocusG();fitCamSoft()}else{showDs(false);gfoc='cl';showCta(true)}return}
 if(gfoc||!cta.hidden||(!dsc.hidden||!pbc.hidden)){unfocusG();fitCamSoft();return}
 if(overBH(e.clientX,e.clientY)){if(fin)finOff();showCta(false);showDs(false);gfoc='bh';return}
 if(fin){finOff();return}
 if(!FFC)travel(false)}
gsky.addEventListener('pointerup',endPtr);
gsky.addEventListener('pointercancel',e=>{pts.delete(e.pointerId);pinch=null;gsky.classList.remove('drag')});
function zoomAt(sx,sy,f){
 const nz=Math.max(fitZ()*.42,Math.min(fitZ()*40,cam.z*f));
 const wx=cam.x+(sx-GW/2)/cam.z,wy=cam.y+(sy-GH/2)/cam.z;
 cam.z=nz;cam.x=wx-(sx-GW/2)/nz;cam.y=wy-(sy-GH/2)/nz;clampCam()}
function fitZ(){
 // frame the whole orbit (ring + Omniverse art at both ends) around the blackhole
 const R=Math.max(ORB+MO,DS_ORB+DS_W*.6),w=2*R+CL_W*.9,h=2*R*SQ+CL_W*.8;
 return Math.min(GW*.94/w,GH*.88/h)}
function clampCam(){
 const lim=Math.max(ORB+MO,DS_ORB+DS_W*.6)*1.05;cam.x=Math.max(-lim*1.45,Math.min(lim,cam.x));cam.y=Math.max(-lim*SQ*1.5,Math.min(lim*SQ,cam.y))}
gsky.addEventListener('wheel',e=>{e.preventDefault();gfoc=null;zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.0014))},{passive:false});
addEventListener('resize',()=>{if(inGal){resizeGal();cam.z=fitZ()}});

buildStars();if(P)buildNeb();
// warm the spin after the hub has painted, so the corner gif stays the first download
if(!RM)addEventListener('load',()=>{setTimeout(()=>{for(const u of[OM_GIF,CL_GIF,BH_IN,BH_LOOP]){const i=new Image();i.src=u}},1200)},{once:true});

// 5 clicks on the main solar system map within ~4s: the sky cracks there and a second wormhole tears open
const crk=document.createElement('canvas');crk.id='crack';crk.setAttribute('aria-hidden','true');
crk.style.cssText='position:fixed;left:0;top:0;pointer-events:none;z-index:3;image-rendering:pixelated';
document.body.appendChild(crk);const cg=crk.getContext('2d');
const worm2=document.createElement('div');worm2.id='worm2';worm2.setAttribute('role','button');worm2.tabIndex=0;
worm2.style.cssText='position:fixed;z-index:2;left:0;top:0;width:130px;height:130px;padding:0;margin:0;border:0;outline:0;background:transparent none;box-shadow:none;-webkit-appearance:none;appearance:none;cursor:pointer;overflow:visible;image-rendering:pixelated;display:none';
{const i2=document.createElement('img');i2.alt='';i2.draggable=false;i2.src=RM?WH_STILL:WH_GIF;i2.style.cssText='display:block;width:100%;height:100%;object-fit:contain;background:transparent;image-rendering:pixelated;pointer-events:none;filter:drop-shadow(0 0 5px rgba(90,20,140,.5))';worm2.appendChild(i2)}
worm2.setAttribute('aria-label','Wormhole (cracked open)');worm.after(worm2);
let w2=null,crack=null,clicks=[];
worm2.addEventListener('click',e=>{e.stopPropagation();if(busy||document.body.classList.contains('arch'))return;srcWorm=worm2;travel(true)});
worm2.addEventListener('pointerenter',e=>showTip('Wormhole',e.clientX,e.clientY));worm2.addEventListener('pointerleave',hideTip);
// jagged pixel fissures: main trunks with sharp kinks, forking side branches; points are in crack units (1u ~ 1 crack pixel)
function mkCrack(){const br=[],N=6+Math.floor(Math.random()*3);
 const walk=(x,y,a,L,w,d)=>{const pts=[[x,y]];for(let k=0;k<L;k++){a+=(Math.random()<.35?(Math.random()-.5)*1.4:(Math.random()-.5)*.35);const st=4+Math.random()*6;x+=Math.cos(a)*st;y+=Math.sin(a)*st;pts.push([x,y]);
   if(w>1&&Math.random()<.18)walk(x,y,a+(Math.random()<.5?1:-1)*(.5+Math.random()*.7),Math.ceil(L*.45),w-1,d+k/L*.6)}
  br.push({pts,w,d})};
 for(let i=0;i<N;i++)walk(0,0,i/N*Math.PI*2+(Math.random()-.5)*.7,12+Math.floor(Math.random()*10),3,0);
 return br}
function drawCrack(now){
 const v=window.__hubView&&window.__hubView();
 if(crk.width!==innerWidth||crk.height!==innerHeight){crk.width=innerWidth;crk.height=innerHeight}
 cg.clearRect(0,0,crk.width,crk.height);
 if(v&&v.sys==='main'){
  const wp=w2||crack;if(wp){const z=v.cam.z,s=Math.max(72,Math.round(WS*.8*z)),x=(wp.x-v.cam.x)*z+v.W/2,y=(wp.y-v.cam.y)*z+v.H/2;
   worm2.style.width=worm2.style.height=s+'px';worm2.style.transform='translate('+Math.round(x-s/2)+'px,'+Math.round(y-s/2)+'px)';
   worm2.style.display=(x<-s||y<-s||x>v.W+s||y>v.H+s)?'none':''}
  if(crack){const z=v.cam.z,cx=Math.round((crack.x-v.cam.x)*z+v.W/2),cy=Math.round((crack.y-v.cam.y)*z+v.H/2),k=Math.min(1,(now-crack.t0)/(RM?200:1600)),ps=Math.max(2,Math.min(5,Math.round(3*Math.max(.7,z*2.5))));
   const fade=w2?Math.max(0,1-(now-w2.t0)/2200):1,fl=.75+.25*Math.sin(now/90);
   // passes: soft purple halo (dithered), magenta body, pink-white hot core; all solid pixel squares, no fills
   const PAL=[[2,'#3a1470',.5],[1,'#8a34d8',1],[0,'#e070f0',1],[-1,'#ffc8f4',1]];
   for(const[pad,col,dens]of PAL){cg.fillStyle=col;cg.globalAlpha=fade*(pad===2?.55*fl:1);
    for(const b of crack.br){const g0=Math.max(0,Math.min(1,(k-b.d)/(1-b.d*.8)));if(g0<=0)continue;const th=b.w+pad;if(th<1&&pad<0&&b.w<3)continue;const m=(b.pts.length-1)*g0;
     for(let i=0;i<Math.ceil(m);i++){const p=b.pts[i],q=b.pts[i+1],f=Math.min(1,m-i),qx=p[0]+(q[0]-p[0])*f,qy=p[1]+(q[1]-p[1])*f,taper=1-i/(b.pts.length);const t2=Math.max(pad<0?1:0,Math.round(Math.max(1,th)*(.5+taper*.7)));
      const n=Math.max(1,Math.ceil(Math.hypot(qx-p[0],qy-p[1])/1.5));for(let j=0;j<=n;j++){const ux=Math.round((p[0]+(qx-p[0])*j/n)*ps/ps),uy=Math.round(p[1]+(qy-p[1])*j/n);
       for(let oy=-(t2>>1);oy<=(t2-1>>1)+(pad===2?1:0);oy++)for(let ox=-(t2>>1);ox<=(t2-1>>1)+(pad===2?1:0);ox++){if(dens<1&&((ux+ox+uy+oy)&1))continue;cg.fillRect(cx+(ux+ox)*ps-(ps>>1),cy+(uy+oy)*ps-(ps>>1),ps,ps)}}}}}
   cg.globalAlpha=1;
   if(!w2){const op=Math.max(0,(k-.15)/.85);worm2.style.animation='none';worm2.style.clipPath='circle('+(op*46).toFixed(1)+'% at 50% 50%)';if(op>0)worm2.style.display='';else worm2.style.display='none';
    const R=Math.max(6,Math.round(WS*.8*z*.46*op)),GC=['#0a0418','#2a0c55','#6a24c0','#e070f0','#7af0ff','#ffffff'];
    for(let n=0;n<Math.round(40+R*1.2);n++){const a=Math.random()*Math.PI*2,rr=R*(.75+Math.random()*.45);cg.fillStyle=GC[(Math.random()*GC.length)|0];cg.globalAlpha=.55+Math.random()*.45;
     cg.fillRect(Math.round((cx+Math.cos(a)*rr)/ps)*ps,Math.round((cy+Math.sin(a)*rr)/ps)*ps,ps*(1+(Math.random()*2|0)),ps)}
    cg.globalAlpha=1}
   if(k>=1&&!w2){w2={x:crack.x,y:crack.y,t0:now};{const z=v.cam.z,s2=Math.max(72,Math.round(WS*.8*z));worm2.style.width=worm2.style.height=s2+'px';worm2.style.transform='translate('+Math.round((w2.x-v.cam.x)*z+v.W/2-s2/2)+'px,'+Math.round((w2.y-v.cam.y)*z+v.H/2-s2/2)+'px)'}window.__sfx&&__sfx('whoosh');worm2.style.display='';worm2.style.clipPath='none';worm2.style.animation='wgrow .5s ease-out both'}
   if(w2&&fade<=0)crack=null}
 }else worm2.style.display='none';
 requestAnimationFrame(drawCrack)}
requestAnimationFrame(drawCrack);
(()=>{const sky=document.getElementById('sky');if(!sky)return;let d=null;
 sky.addEventListener('pointerdown',e=>{d=[e.clientX,e.clientY]});
 sky.addEventListener('pointerup',e=>{if(!d||Math.hypot(e.clientX-d[0],e.clientY-d[1])>6)return;d=null;
  const v=window.__hubView&&window.__hubView();if(!v||v.sys!=='main'||busy||crack||document.body.classList.contains('intro'))return;
  const now=performance.now();clicks=clicks.filter(c=>now-c.t<4000);clicks.push({t:now});
  if(clicks.length>=5){const z=v.cam.z,wx=(e.clientX-v.W/2)/z+v.cam.x,wy=(e.clientY-v.H/2)/z+v.cam.y;clicks=[];
   if(w2){w2=null;worm2.style.display='none';worm2.style.clipPath='circle(0% at 50% 50%)'}
   crack={x:wx,y:wy,t0:now,br:mkCrack()}}})})();

window.__worm={
 travel,galaxy:()=>{if(!inGal&&!busy){armOmni();showGalaxy()}},
 cta:showCta,
 home:()=>{if(inGal&&!busy)hideGalaxy()},
 /** Draw one travel frame for previews. u in 0..1, toGalaxy snapshots the hub. */
 frame(u){const snap=snapshot();rush.hidden=false;document.body.classList.add('traveling');drawTravel(u,snap,portalOrigin())},
 clear(){rush.hidden=true;document.body.classList.remove('traveling');if(!inGal)window.__galaxyHold=false}
};
// /ffc/ is the alternate dimension as its own page: boot straight into the galaxy and fade the veil away
if(FFC){const boot=()=>{const so=window.__solar;if(so&&so.skip)so.skip();document.body.classList.remove('intro');showGalaxy();requestAnimationFrame(()=>requestAnimationFrame(()=>{veil.style.opacity='0'}))};document.readyState==='complete'?boot():addEventListener('load',boot,{once:true})}
})();

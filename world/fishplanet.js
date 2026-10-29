// water planet "Deep Sea": 3 biomes (green shallows, blue sea, dark ocean) on the hub sphere painter; visibly spins;
// stir it with the cursor and the biomes/water mix where you touch; click to play. Hub: background far top-left. FFC: far out in the wormhole galaxy.
(()=>{const P=window.PLANETS;if(!P)return;const FFC=!!window.__FFC,URL='https://rainbowroar14.github.io/Sites/DeepSea/';
const N=96,WX=FFC?-6300:-3500,WY=FFC?-3500:-1950,WS=FFC?1500:560;
const S=P.mk(N,N),c=S.c;c.id='fishp';c.setAttribute('role','link');c.setAttribute('aria-label','Deep Sea water planet - play');
c.style.cssText='position:'+(FFC?'absolute':'fixed')+';left:0;top:0;z-index:'+(FFC?3:1)+';cursor:pointer;touch-action:none;image-rendering:pixelated;opacity:'+(FFC?1:.9)+';will-change:transform;display:none;border-radius:50%';
if(!FFC)document.body.appendChild(c);
const GRN=['#06281e','#0e4a34','#1a7a52','#2fa872','#6ad8a0','#c8f8dc'],
 BLU=['#04163a','#0a3270','#1458a8','#2a86d8','#62b8f4','#c4ecff'],
 DRK=['#020616','#050e2c','#0a1a48','#132a66','#24448a','#5a7ab8'],
 FOAM=['#4a7a9a','#a8d8ec','#ffffff'];
const {dq,fbm,vn,H,LINE,bay,hx}=P;
// stir field (canvas pixel space): cursor adds, decays over a few seconds
const ST=new Float32Array(N*N);let mx=-1,my=-1,stirring=0;
const stir=(px,py)=>{for(let y=Math.max(0,py-9);y<Math.min(N,py+10);y++)for(let x=Math.max(0,px-9);x<Math.min(N,px+10);x++){const d=Math.hypot(x-px,y-py);if(d<9){const i=y*N+x;ST[i]=Math.min(1,ST[i]+(1-d/9)*.35)}}stirring=1};
const mixHex=(a,b,k)=>{const A=hx(a),B=hx(b);return'#'+[0,1,2].map(i=>Math.round(A[i]+(B[i]-A[i])*k).toString(16).padStart(2,'0')).join('')};
const pal=b=>b>.58?GRN:b>.42?BLU:DRK;
let LT=null;
const paint=t=>{const rot=t*.55;
 P.sphere(S,N*.4,N/2,N/2,rot,(lon,lat,lit,x,y)=>{
  const k=ST[y*N+x]||0;
  let b=fbm(lon*1.3+t*.03+7,lat*1.6+3)+Math.sin(lat*2.2)*.08;
  const sw=Math.sin(lon*8+lat*3-t*1.6)*.5+Math.sin(lon*4-lat*6+t*1.1)*.35+Math.sin(lon*13+t*2.3)*.15;
  const cur=vn(lon*3+t*.25,lat*5-t*.1);
  let r=pal(b),th=bay;if(r===GRN&&sw>.4||r===BLU&&sw>.5)th=LINE;
  const edge=Math.abs(b-.58)<.012||Math.abs(b-.42)<.01;
  const v=lit*.9+(cur-.5)*.22+(r===DRK?-.08:0);
  if(k>.02){ // stirred: swirl the biome field and blend palettes into each other
   const a=Math.atan2(y-my,x-mx)+t*3,b2=b+Math.sin(a*3+Math.hypot(x-mx,y-my)*.5-t*4)*.22*k;
   const r2=pal(b2),r3=r2===GRN?BLU:r2===BLU?(H(x,y)>.5?GRN:DRK):BLU;
   const c1=dq(r,v,x,y,th),c2=dq(r2===r?r3:r2,v+Math.sin(a*2-t*5)*.12*k,x,y,bay);
   if(lit>.3&&k>.5&&H(x+Math.floor(t*9),y)>.9)return dq(FOAM,lit,x,y);
   return mixHex(c1,c2,Math.min(1,k*1.1)*.85)}
  if(lit>.3&&((edge&&H(x,y+Math.floor(t*5))>.5)||(sw>.8&&r!==DRK&&H(x+Math.floor(t*6),y)>.55)))return dq(FOAM,lit,x,y);
  if(lit>.7&&sw>.6&&H(x,y*3+Math.floor(t*3))>.93)return '#ffffff';
  return dq(r,v,x,y,th)},{w:Math.max(2,N*.4*.08),r:['#1a4a8a','#6ad0f4'],L:LT})};
// input: hover stirs, click (no drag) plays
const loc=e=>{const r=c.getBoundingClientRect();return[Math.floor((e.clientX-r.left)/r.width*N),Math.floor((e.clientY-r.top)/r.height*N)]};
const onDisc=(x,y)=>Math.hypot(x-N/2,y-N/2)<N*.44;
let down=null;
// V35: hub-style hover tip (name only)
const dsTip=(on,e)=>{const t=document.getElementById('tip');if(!t)return;if(on){if(t.textContent!=='Deep Sea'||!t.classList.contains('on'))window.__blip&&__blip('hover');t.textContent='Deep Sea';t.style.left=(e.clientX+14)+'px';t.style.top=(e.clientY+14)+'px';t.classList.add('on')}else if(t.textContent==='Deep Sea')t.classList.remove('on')};
c.addEventListener('pointermove',e=>{const[x,y]=loc(e);if(onDisc(x,y)){mx=x;my=y;stir(x,y);dsTip(1,e)}else dsTip(0);e.stopPropagation()});
c.addEventListener('pointerleave',()=>dsTip(0));
c.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];e.stopPropagation()});
c.addEventListener('pointerup',e=>{e.stopPropagation();if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<8){const[x,y]=loc(e);if(onDisc(x,y)){if(FFC&&window.__galDS)window.__galDS();else location.href=URL}}down=null});
c.addEventListener('click',e=>e.stopPropagation());
c.addEventListener('wheel',e=>{const g=document.getElementById(FFC?'gsky':'sky');if(g){e.preventDefault();g.dispatchEvent(new WheelEvent('wheel',e))}},{passive:false});
c.addEventListener('keydown',e=>{if(e.key==='Enter'){if(FFC&&window.__galDS)window.__galDS();else location.href=URL}});c.tabIndex=0;
let last=0;
function place(z,cx,cy,W,H2,o){const wx=o?o[0]:WX,wy=o?o[1]:WY,s=Math.max(40,Math.round(WS*z)),x=(wx-cx)*z+W/2,y=(wy-cy)*z+H2/2;
 c.style.width=c.style.height=s+'px';c.style.transform='translate('+Math.round(x-s/2)+'px,'+Math.round(y-s/2)+'px)';
 c.style.display=(x<-s||y<-s||x>W+s||y>H2+s)?'none':'';}
function frame(ms){
 if(FFC){const g=window.__galView&&window.__galView(),gal=document.getElementById('galaxy');
  if(!g||!gal||!g.inGal){c.style.display='none';return requestAnimationFrame(frame)}
  if(c.parentNode!==gal)gal.appendChild(c);c.style.zIndex=g.dsZ;place(g.cam.z,g.cam.x,g.cam.y,g.GW,g.GH,g.ds);
  // V34: neutral light FROM the blackhole (world origin): lit face points at the BH
  {const vx=-g.ds[0],vy=-g.ds[1],m=Math.hypot(vx,vy)||1,ax=vx/m*.88,ay=vy/m*.88,az=.47;LT=[ax,ay,az]}}
 else{const v=window.__hubView&&window.__hubView(),b=document.body.classList;
  if(!v||v.sys!=='main'||b.contains('arch')||b.contains('galaxy')||b.contains('intro')){c.style.display='none';return requestAnimationFrame(frame)}
  place(v.cam.z,v.cam.x,v.cam.y,v.W,v.H)}
 if(c.style.display!=='none'&&ms-last>55){const dt=(ms-last)/1000;last=ms;if(stirring){let any=0;const f=Math.pow(.55,dt);for(let i=0;i<ST.length;i++)if(ST[i]){ST[i]=ST[i]*f<.01?0:ST[i]*f;any=1}stirring=any}paint(ms/1000)}
 requestAnimationFrame(frame)}
paint(0);requestAnimationFrame(frame)})();

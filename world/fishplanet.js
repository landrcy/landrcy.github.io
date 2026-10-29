// background water planet: 3 biomes (green shallows, blue sea, dark ocean); uses the hub sphere painter (same light, dither, terminator and rim as other planets); animated currents + rotation; world-space, ambient, no input
(()=>{const P=window.PLANETS;if(!P)return;const N=96,WX=-3500,WY=-1950,WS=560;
const S=P.mk(N,N),c=S.c;c.id='fishp';c.setAttribute('aria-hidden','true');
c.style.cssText='position:fixed;left:0;top:0;z-index:1;pointer-events:none;image-rendering:pixelated;opacity:.9;will-change:transform;display:none';
document.body.appendChild(c);
const GRN=['#06281e','#0e4a34','#1a7a52','#2fa872','#6ad8a0','#c8f8dc'],
 BLU=['#04163a','#0a3270','#1458a8','#2a86d8','#62b8f4','#c4ecff'],
 DRK=['#020616','#050e2c','#0a1a48','#132a66','#24448a','#5a7ab8'],
 FOAM=['#4a7a9a','#a8d8ec','#ffffff'];
const {dq,fbm,vn,H,LINE,bay}=P;
const paint=t=>{const rot=t*.16;
 P.sphere(S,N*.4,N/2,N/2,rot,(lon,lat,lit,x,y)=>{
  // slow drifting biome field
  const b=fbm(lon*1.3+t*.03+7,lat*1.6+3)+Math.sin(lat*2.2)*.08;
  const sw=Math.sin(lon*8+lat*3-t*1.6)*.5+Math.sin(lon*4-lat*6+t*1.1)*.35+Math.sin(lon*13+t*2.3)*.15;
  const cur=vn(lon*3+t*.25,lat*5-t*.1);
  let r,th=bay;
  if(b>.58){r=GRN;if(sw>.4)th=LINE}else if(b>.42){r=BLU;if(sw>.5)th=LINE}else r=DRK;
  // foam on biome edges + wave crests (only on lit side)
  const edge=Math.abs(b-.58)<.012||Math.abs(b-.42)<.01;
  if(lit>.3&&((edge&&H(x,y+Math.floor(t*5))>.5)||(sw>.8&&r!==DRK&&H(x+Math.floor(t*6),y)>.55)))return dq(FOAM,lit,x,y);
  const v=lit*.9+(cur-.5)*.22+(r===DRK?-.08:0);
  // occasional specular glint on lit side
  if(lit>.7&&sw>.6&&H(x,y*3+Math.floor(t*3))>.93)return '#ffffff';
  return dq(r,v,x,y,th)},{w:Math.max(2,N*.4*.08),r:['#1a4a8a','#6ad0f4']})};
let last=0;
function frame(ms){const v=window.__hubView&&window.__hubView(),b=document.body.classList;
 if(!v||v.sys!=='main'||b.contains('arch')||b.contains('galaxy')||b.contains('intro')){c.style.display='none';return requestAnimationFrame(frame)}
 const z=v.cam.z,s=Math.max(40,Math.round(WS*z)),x=(WX-v.cam.x)*z+v.W/2,y=(WY-v.cam.y)*z+v.H/2;
 c.style.width=c.style.height=s+'px';c.style.transform='translate('+Math.round(x-s/2)+'px,'+Math.round(y-s/2)+'px)';
 c.style.display=(x<-s||y<-s||x>v.W+s||y>v.H+s)?'none':'';
 if(c.style.display!=='none'&&ms-last>66){last=ms;paint(ms/1000)}
 requestAnimationFrame(frame)}
paint(0);requestAnimationFrame(frame)})();

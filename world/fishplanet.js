// background water planet: 3 biomes (green shallows, blue sea, dark ocean), fish swimming, boats crossing; world-space, ambient, no input
(()=>{const N=96,WX=-3500,WY=-1950,WS=560;
const c=document.createElement('canvas');c.id='fishp';c.width=c.height=N;c.setAttribute('aria-hidden','true');
c.style.cssText='position:fixed;left:0;top:0;z-index:1;pointer-events:none;image-rendering:pixelated;opacity:.82;will-change:transform;display:none';
document.body.appendChild(c);const g=c.getContext('2d');const R=N/2-3,C=N/2;
const h=(x,y)=>{const s=Math.sin(x*12.9898+y*78.233)*43758.5453;return s-Math.floor(s)};
const bio=(x,y)=>{const v=Math.sin(x*.11+1.3)+Math.cos(y*.13-.4)*.8+Math.sin((x+y)*.07)*.6;return v>.7?0:v>-.6?1:2};
const PAL=[['#2f9a6a','#47c27e','#1f7350'],['#2f7fe0','#55a8ff','#1d5cb0'],['#0c1a44','#16306a','#060d26']];
const fish=[...Array(16)].map((_,i)=>({y:10+h(i,1)*76,x:h(i,2)*N,v:(h(i,3)*.5+.25)*(h(i,4)<.5?-1:1),c:['#ff9a3a','#ffe14a','#ff6ab0','#bff'][i&3]}));
const boats=[...Array(3)].map((_,i)=>({y:26+i*20,x:h(i,9)*N,v:.18+i*.06}));
function frame(t){const v=window.__hubView&&window.__hubView(),b=document.body.classList;
 if(!v||v.sys!=='main'||b.contains('arch')||b.contains('galaxy')||b.contains('intro')){c.style.display='none';return requestAnimationFrame(frame)}
 const z=v.cam.z,s=Math.max(40,Math.round(WS*z)),x=(WX-v.cam.x)*z+v.W/2,y=(WY-v.cam.y)*z+v.H/2;
 c.style.width=c.style.height=s+'px';c.style.transform='translate('+Math.round(x-s/2)+'px,'+Math.round(y-s/2)+'px)';
 c.style.display=(x<-s||y<-s||x>v.W+s||y>v.H+s)?'none':'';
 if(c.style.display==='none')return requestAnimationFrame(frame);
 g.clearRect(0,0,N,N);const sp=t/1400;
 for(let py=0;py<N;py++)for(let px=0;px<N;px++){const dx=px-C+.5,dy=py-C+.5,d=Math.hypot(dx,dy);if(d>R)continue;
  const u=px+sp*6,bi=bio(u,py),w=(Math.sin(u*.6+py*.9+t/300)>.82)?1:((dx+dy)/R>.55?2:0);
  g.fillStyle=PAL[bi][w];g.fillRect(px,py,1,1);if(d>R-1.5){g.fillStyle='rgba(150,220,255,.6)';g.fillRect(px,py,1,1)}}
 for(const f of fish){f.x+=f.v;if(f.x>N+3)f.x=-3;if(f.x<-3)f.x=N+3;const fx=Math.round(f.x),fy=Math.round(f.y+Math.sin(t/400+f.x*.2));
  if(Math.hypot(fx-C,fy-C)>R-3)continue;g.fillStyle=f.c;g.fillRect(fx,fy,2,1);g.fillRect(fx+(f.v>0?-1:2),fy+((t/200|0)&1?-1:1)*0,1,1)}
 for(const bt of boats){bt.x+=bt.v;if(bt.x>N+6)bt.x=-6;const bx=Math.round(bt.x),by=bt.y;if(Math.hypot(bx-C,by-C)>R-5)continue;
  g.fillStyle='#6b3a1e';g.fillRect(bx-2,by,5,1);g.fillRect(bx-1,by+1,3,1);g.fillStyle='#fff';g.fillRect(bx,by-3,1,3);g.fillRect(bx+1,by-2,1,2);
  g.fillStyle='rgba(255,255,255,.55)';g.fillRect(bx-4,by+1,2,1)}
 // night-side shade
 for(let py=0;py<N;py+=1)for(let px=0;px<N;px++){const dx=px-C,dy=py-C;if(Math.hypot(dx,dy)>R)continue;const k=(dx+dy)/(R*1.4);if(k>.25&&((px+py)&1||k>.6)){g.fillStyle='rgba(2,2,12,.45)';g.fillRect(px,py,1,1)}}
 requestAnimationFrame(frame)}
requestAnimationFrame(frame)})();

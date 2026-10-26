// Landrcyverse flight mode: first-person pixel flight around the solar system
(()=>{const S0=window.__sys;if(!S0)return;const{MAIN,MOONS,SHIPS,SQ,P}=S0,TAU=Math.PI*2,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const root=document.createElement('div');root.id='flight';root.hidden=true;
root.innerHTML=`<canvas id="fcv" aria-label="Flight view"></canvas>
<div class="fhud"><div class="fstat"><span class="fsp">SPD 0</span><span class="fnr">-</span></div><canvas class="fmap" width="96" height="96" aria-hidden="true"></canvas>
<div class="fprompt" hidden><b class="fname"></b><a class="fgo" target="_blank" rel="noopener">Visit ▸</a></div>
<button type="button" class="fexit">✕ Exit flight</button><div class="fhelp">W/S thrust · A/D or mouse (click to lock) steer · ↑/↓ pitch · Shift boost · E visit · Esc exit</div>
<div class="fstick" aria-hidden="true"><i></i></div><button type="button" class="fthr" aria-label="Thrust">▲</button><button type="button" class="fbrk" aria-label="Brake">▼</button></div>`;
document.body.appendChild(root);
const btn=document.createElement('button');btn.type='button';btn.className='ui';btn.id='flybtn';btn.textContent='✈ Fly';document.body.appendChild(btn);
const cv=root.querySelector('#fcv'),g=cv.getContext('2d'),mapC=root.querySelector('.fmap'),mg=mapC.getContext('2d'),spEl=root.querySelector('.fsp'),nrEl=root.querySelector('.fnr'),pr=root.querySelector('.fprompt'),prN=root.querySelector('.fname'),prA=root.querySelector('.fgo');
let W=320,H=180,F=260,on=false,raf=0,last=0,T=0;
const cam={x:0,y:140,z:1500,yaw:Math.PI,pitch:-.06,roll:0,v:0};const keys=new Set();let drag=null,stick=null,thr=0;
function size(){const mob=innerWidth<700;W=mob?220:Math.min(400,Math.round(innerWidth/3.2));H=Math.round(W*innerHeight/innerWidth);cv.width=W;cv.height=H;F=W*.85;g.imageSmoothingEnabled=false}
// bodies in 3D: plane (x, z=y/SQ)
const BOD=[...MAIN.map(b=>({b,kind:'main'})),...MOONS.map(b=>({b,kind:'moon'}))].map(o=>{const b=o.b,w=b.paint==='void'?168:b.paint==='sun'?128:b.paint==='crest'?100:b.moon?40:80,h=Math.round(w*(b.h||b.w)/b.w);o.S=P.mk(w,h);o.nx=0;o.w=b.w;o.h=b.h||b.w;return o});
const name=o=>o.b.moon?o.b.moon.name:o.b.title,href=o=>o.b.moon?o.b.moon.url:o.b.href;
function wpos(o,t){const b=o.b;if(b.orb==null)return[b.x,0,b.y/SQ];if(b.moon){const p=wpos(BOD[3],t);const a=b.ang+t*TAU/b.per*(b.dir||1);return[p[0]+Math.cos(a)*b.orb,p[1],p[2]+Math.sin(a)*b.orb]}const a=b.ang+t*TAU/b.per*(b.dir||1);return[Math.cos(a)*b.orb,0,Math.sin(a)*b.orb]}
const STARS=Array.from({length:420},()=>{const u=Math.random()*2-1,a=Math.random()*TAU,r=Math.sqrt(1-u*u);return{x:r*Math.cos(a),y:u,z:r*Math.sin(a),c:['#8a90c8','#cfd4ff','#fff6d8','#ffd0f0'][Math.floor(Math.random()*4)],b:Math.random()<.15}});
const ROCKS=Array.from({length:520},()=>{const r=405+Math.random()*70,a=Math.random()*TAU;return{r,a,y:(Math.random()-.5)*18,s:2+Math.random()*7,sp:.012*Math.pow(360/r,1.5),c:['#4a3c44','#7a6658','#b09878'][Math.floor(Math.random()*3)]}});
const FSH=Array.from({length:5},(_,i)=>({r:300+i*140,a:i*1.3,y:30+i*25,sp:(i%2?-1:1)*(.05+i*.012),c:['#9aa4c8','#c84a3a','#5aa878'][i%3]}));
function proj(x,y,z){const dx=x-cam.x,dy=y-cam.y,dz=z-cam.z,cy=Math.cos(-cam.yaw),sy=Math.sin(-cam.yaw);let X=dx*cy+dz*sy,Z=-dx*sy+dz*cy;const cp=Math.cos(-cam.pitch),sp=Math.sin(-cam.pitch);const Y=dy*cp-Z*sp;Z=dy*sp+Z*cp;if(Z<2)return null;return[W/2+X/Z*F,H/2-Y/Z*F,Z]}
function dirProj(x,y,z){const cy=Math.cos(-cam.yaw),sy=Math.sin(-cam.yaw);let X=x*cy+z*sy,Z=-x*sy+z*cy;const cp=Math.cos(-cam.pitch),sp=Math.sin(-cam.pitch);const Y=y*cp-Z*sp;Z=y*sp+Z*cp;if(Z<.05)return null;return[W/2+X/Z*F,H/2-Y/Z*F]}
const DT=1/120,cam0={};let acc=0,yv=0,pv=0,thrS=0,mdx=0,mdy=0,locked=false,ex=0,ey=0,ez=0,ftAvg=0,ftN=0,ftMax=0,ftList=[];
const SENS=.0022,DZ=.6;
function phys(h){const k=c=>keys.has(c);
 let yawI=(k('KeyA')||k('ArrowLeft')?-1:0)+(k('KeyD')||k('ArrowRight')?1:0),pitI=(k('ArrowUp')?1:0)+(k('ArrowDown')?-1:0);
 if(stick){const sx=Math.abs(stick.x)<.12?0:stick.x,sy=Math.abs(stick.y)<.12?0:stick.y;yawI+=sx;pitI-=sy}
 // angular velocity: target from inputs, critically-damped approach
 const ty=yawI*1.35,tp=pitI*1.0,da=1-Math.exp(-h*7);yv+=(ty-yv)*da;pv+=(tp-pv)*da;
 // mouse (pointer lock / drag) impulses -> angular velocity
 if(mdx||mdy){yv+=mdx*SENS/h*.12;pv-=mdy*SENS/h*.12;mdx=mdy=0}
 cam.yaw+=yv*h;cam.pitch=Math.max(-1.2,Math.min(1.2,cam.pitch+pv*h));if(Math.abs(cam.pitch)>=1.2)pv=0;
 const tr=-yv*.32;cam.roll+=(tr-cam.roll)*(1-Math.exp(-h*4));
 const boost=k('ShiftLeft')||k('ShiftRight')?2.2:1,tin=(k('KeyW')?1:0)-(k('KeyS')?1:0)+thr;thrS+=(tin-thrS)*(1-Math.exp(-h*5));
 cam.v+=thrS*h*240*boost;cam.v*=Math.exp(-h*.45);cam.v=Math.max(-140,Math.min(620*boost,cam.v));
 const fx=Math.sin(cam.yaw)*Math.cos(cam.pitch),fy=Math.sin(cam.pitch),fz=Math.cos(cam.yaw)*Math.cos(cam.pitch);
 // soft external forces: void pull, sun push -> drift velocity with damping
 const vp=wpos(VD,T),vx=vp[0]-cam.x,vy=vp[1]-cam.y,vz=vp[2]-cam.z,vd=Math.hypot(vx,vy,vz);if(vd<850&&vd>1){const f=55*Math.pow(1-vd/850,2);ex+=vx/vd*f*h;ey+=vy/vd*f*h;ez+=vz/vd*f*h}
 const sd=Math.hypot(cam.x,cam.y,cam.z)||1;if(sd<190){const f=260*Math.pow(1-sd/190,1.5);ex+=cam.x/sd*f*h;ey+=cam.y/sd*f*h;ez+=cam.z/sd*f*h}
 const ed=Math.exp(-h*1.4);ex*=ed;ey*=ed;ez*=ed;
 cam.x+=(fx*cam.v+ex)*h;cam.y+=(fy*cam.v+ey)*h;cam.z+=(fz*cam.v+ez)*h;
 if(sd<100){const s=100/sd;cam.x*=s;cam.y*=s;cam.z*=s}T+=h}
const VD=BOD.find(o=>o.b.id==='void');
const CK=['x','y','z','yaw','pitch','roll','v'];
function step(now){raf=requestAnimationFrame(step);const t0=performance.now();let fdt=Math.min(.1,(now-last)/1000||0);last=now;acc+=fdt;
 const cur={};let n=0;while(acc>=DT&&n<12){for(const k of CK)cam0[k]=cam[k];phys(DT);acc-=DT;n++}if(n>=12)acc=0;
 const al=acc/DT;for(const k of CK)cur[k]=cam[k];for(const k of CK)cam[k]=cam0[k]+(cur[k]-cam0[k])*al;
 const Tr=T-DT*(1-al);
 render(now,Tr);for(const k of CK)cam[k]=cur[k];
 const ft=performance.now()-t0;ftList.push(ft);if(ftList.length>600)ftList.shift()}
function render(now,T){
 // draw
 g.fillStyle='#010103';g.fillRect(0,0,W,H);g.save();g.translate(W/2,H/2);g.rotate(cam.roll);g.translate(-W/2,-H/2);
 for(const s of STARS){const p=dirProj(s.x,s.y,s.z);if(!p||p[0]<0||p[1]<0||p[0]>=W||p[1]>=H)continue;g.fillStyle=s.c;g.fillRect(p[0]|0,p[1]|0,1,1);if(s.b&&!RM&&Math.abs(cam.v)>400){g.globalAlpha=.4;g.fillRect((p[0]-(p[0]-W/2)*.04)|0,(p[1]-(p[1]-H/2)*.04)|0,1,1);g.globalAlpha=1}}
 const list=[];
 for(const o of BOD){const p3=wpos(o,T),p=proj(...p3);if(!p)continue;const w=o.w*F/p[2],h=o.h*F/p[2];if(p[0]+w<-W*.3||p[0]-w>W*1.3||p[1]+h<-H*.3||p[1]-h>H*1.3||w<.25)continue;list.push([p[2],()=>{if(now>=o.nx&&w>2.5){const arg=o.b.id==='sun'?{ign:1,L:1}:o.b.id==='ashaad'?{open:near===o?1:0}:o.b.arg;P[o.b.paint](o.S,RM?7:now/1000,arg);o.nx=now+(w>40?70:140)}
  const fa=Math.min(1,w/2.5);g.globalAlpha=fa;if(w<=3){g.fillStyle=o.b.id==='sun'?'#ff9a3a':'#cfd4ff';const q=Math.max(1,w);g.fillRect(p[0]-q/2,p[1]-q/2,q,q)}else g.drawImage(o.S.c,p[0]-w/2,p[1]-h/2,w,h);g.globalAlpha=1}])}
 for(const r of ROCKS){const a=r.a+T*r.sp*(RM?0:1),p=proj(Math.cos(a)*r.r,r.y,Math.sin(a)*r.r);if(!p)continue;const s=r.s*F/p[2];if(s<.25||p[0]<-s||p[1]<-s||p[0]>W+s||p[1]>H+s)continue;list.push([p[2],()=>{g.fillStyle=r.c;g.globalAlpha=Math.min(1,s/1.2);const q=Math.max(1,Math.round(s));g.fillRect(Math.round(p[0]-q/2),Math.round(p[1]-q/2),q,q);if(q>3){g.fillStyle='#e0c8a0';g.fillRect(Math.round(p[0]-q/2),Math.round(p[1]-q/2),Math.ceil(q/3),Math.ceil(q/3))}g.globalAlpha=1}])}
 for(const s of FSH){const a=s.a+T*s.sp,p=proj(Math.cos(a)*s.r,s.y+Math.sin(T*.7+s.a)*20,Math.sin(a)*s.r);if(!p)continue;const q=Math.max(1,Math.round(10*F/p[2]));list.push([p[2],()=>{g.fillStyle=s.c;g.fillRect(Math.round(p[0]-q),Math.round(p[1]-q/3),q*2,Math.max(1,Math.round(q*.66)));g.fillStyle=Math.sin(now/40)>0?'#ffd54a':'#ff8a1e';g.fillRect(Math.round(p[0]-q*1.5),Math.round(p[1]-q/6),Math.max(1,q>>1),Math.max(1,q/3|0))}])}
 list.sort((a,b)=>b[0]-a[0]);for(const[,f]of list)f();
 g.restore();
 // cockpit frame
 g.fillStyle='#0b0d16';g.fillRect(0,H-6,W,6);g.fillRect(0,0,W,3);g.fillStyle='#3a4058';g.fillRect(0,H-7,W,1);g.fillStyle='#5affb0';g.fillRect(W/2-3|0,H/2|0,2,1);g.fillRect(W/2+2|0,H/2|0,2,1);g.fillRect(W/2|0,H/2-3|0,1,2);g.fillRect(W/2|0,H/2+2|0,1,2);
 // HUD
 let best=null,bd=1e9;for(const o of BOD){const p=wpos(o,T),d=Math.hypot(p[0]-cam.x,p[1]-cam.y,p[2]-cam.z)-o.w*.4;if(d<bd){bd=d;best=o}}near=best;
 spEl.textContent='SPD '+Math.round(Math.abs(cam.v));nrEl.textContent=best?`${name(best)} · ${Math.max(0,Math.round(bd))}`:'-';
 const close=best&&bd<Math.max(220,best.w*2.6);if(close&&href(best)){pr.hidden=false;if(prN.textContent!==name(best)){prN.textContent=name(best);prA.href=href(best)}}else if(close){pr.hidden=false;prN.textContent=name(best);prA.removeAttribute('href')}else pr.hidden=true;prA.style.display=prA.getAttribute('href')?'':'none';
 // minimap (top-down)
 mg.fillStyle='rgba(5,6,14,.85)';mg.fillRect(0,0,96,96);const ms=44/1100;mg.fillStyle='#3a4058';for(const o of BOD){if(o.b.moon)continue;const p=wpos(o,T);mg.fillStyle=o.b.id==='sun'?'#ffd54a':o.b.id==='void'?'#c04df0':'#8fb4d8';mg.fillRect(48+p[0]*ms-1|0,48+p[2]*ms-1|0,o.b.id==='sun'?3:2,o.b.id==='sun'?3:2)}
 mg.fillStyle='#5affb0';const mx=48+cam.x*ms,my=48+cam.z*ms;mg.fillRect(mx-1|0,my-1|0,3,3);mg.fillRect(mx+Math.sin(cam.yaw)*5|0,my+Math.cos(cam.yaw)*5|0,1,1)}
let near=null;
function enter(){if(on)return;on=true;window.__flying=true;size();root.hidden=false;btn.hidden=true;document.body.classList.add('flying');cam.x=0;cam.y=140;cam.z=1500;cam.yaw=Math.PI;cam.pitch=-.06;cam.roll=0;cam.v=0;yv=pv=thrS=ex=ey=ez=acc=0;T=0;last=performance.now();raf=requestAnimationFrame(step);root.querySelector('.fexit').focus({preventScroll:true})}
function exit(){if(!on)return;on=false;window.__flying=false;cancelAnimationFrame(raf);if(document.pointerLockElement)document.exitPointerLock();root.hidden=true;btn.hidden=false;document.body.classList.remove('flying');keys.clear();stick=null;thr=0}
btn.onclick=enter;root.querySelector('.fexit').onclick=exit;window.__flight={enter,exit,cam,goto:id=>{const o=BOD.find(q=>q.b.id===id),p=wpos(o,T);cam.x=p[0];cam.y=p[1]+20;cam.z=p[2]+o.w*2.2;cam.yaw=Math.PI;cam.pitch=-.05;cam.v=0},stats(){const a=[...ftList].sort((x,y)=>x-y);return{n:a.length,avg:a.reduce((x,y)=>x+y,0)/a.length,p95:a[Math.floor(a.length*.95)],max:a[a.length-1]}},get near(){return near&&name(near)}};
addEventListener('resize',()=>{if(on)size()});
addEventListener('keydown',e=>{if(!on)return;if(e.code==='Escape'){exit();e.stopImmediatePropagation();return}if(e.code==='KeyE'||e.code==='Enter'){if(!pr.hidden&&prA.getAttribute('href'))prA.click();return}keys.add(e.code);if(e.code.startsWith('Arrow')||e.code==='Space')e.preventDefault();e.stopImmediatePropagation()},true);
addEventListener('keyup',e=>keys.delete(e.code),true);addEventListener('blur',()=>keys.clear());
cv.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;if(cv.requestPointerLock&&!document.pointerLockElement){try{const r=cv.requestPointerLock();r&&r.catch&&r.catch(()=>{})}catch(_){}}drag=[e.clientX,e.clientY];try{cv.setPointerCapture(e.pointerId)}catch(_){}});
addEventListener('mousemove',e=>{if(!on)return;locked=document.pointerLockElement===cv;if(!locked&&!drag)return;let dx=locked?e.movementX:e.clientX-drag[0],dy=locked?e.movementY:e.clientY-drag[1];if(!locked)drag=[e.clientX,e.clientY];if(Math.abs(dx)<DZ)dx=0;if(Math.abs(dy)<DZ)dy=0;mdx+=Math.max(-60,Math.min(60,dx));mdy+=Math.max(-60,Math.min(60,dy))});
cv.addEventListener('pointerup',()=>drag=null);
const st=root.querySelector('.fstick'),knob=st.querySelector('i');let sid=null,sc=null;
st.addEventListener('pointerdown',e=>{sid=e.pointerId;st.setPointerCapture(sid);const r=st.getBoundingClientRect();sc=[r.left+r.width/2,r.top+r.height/2,r.width/2];mv(e)});
const mv=e=>{if(e.pointerId!==sid)return;let x=(e.clientX-sc[0])/sc[2],y=(e.clientY-sc[1])/sc[2];const l=Math.hypot(x,y);if(l>1){x/=l;y/=l}stick={x,y};knob.style.transform=`translate(${x*sc[2]*.6}px,${y*sc[2]*.6}px)`};
st.addEventListener('pointermove',mv);const sEnd=()=>{sid=null;stick=null;knob.style.transform=''};st.addEventListener('pointerup',sEnd);st.addEventListener('pointercancel',sEnd);
const hold=(el,v)=>{el.addEventListener('pointerdown',e=>{e.preventDefault();thr=v});['pointerup','pointercancel','pointerleave'].forEach(n=>el.addEventListener(n,()=>{if(thr===v)thr=0}))};hold(root.querySelector('.fthr'),1);hold(root.querySelector('.fbrk'),-1);
})();

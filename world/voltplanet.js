// V50 FFC only: Volt Sphere, a wireframe globe of electric lines and lightning bolts, two grids spinning on crossed axes.
// Procedural pixel art (low-res buffer, nearest upscale), F blackhole light baked per pixel. Click zooms to it (title showcase).
(()=>{if(!window.__FFC)return;
const VS_W=900,K=1.9,N=320,B=80,R=30,RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const c=document.createElement('canvas');c.width=c.height=N;c.id='vsplanet';c.tabIndex=0;c.setAttribute('role','button');c.setAttribute('aria-label','Volt Sphere planet');
c.style.cssText='position:absolute;left:0;top:0;z-index:3;image-rendering:pixelated;display:none;touch-action:none;will-change:transform';
const g=c.getContext('2d');g.imageSmoothingEnabled=false;
const bc=document.createElement('canvas');bc.width=bc.height=B;const bg=bc.getContext('2d');
const img=bg.createImageData(B,B),D=img.data;let LA=null,seed=1;
const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const PAL=[[40,30,110],[90,60,200],[60,140,255],[90,230,255],[230,250,255]];
const BAY=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const buf=new Float32Array(B*B),hue=new Float32Array(B*B);
function plot(x,y,v,h){x|=0;y|=0;if(x<0||y<0||x>=B||y>=B)return;const i=y*B+x;if(v>buf[i]){buf[i]=v;hue[i]=h}}
// rotate point by grid frame: spin about local Y by a, then tilt about X by tx, then about Z by tz
function rot(p,a,tx,tz){let[x,y,z]=p;let X=x*Math.cos(a)+z*Math.sin(a),Z=-x*Math.sin(a)+z*Math.cos(a);x=X;z=Z;
 let Y=y*Math.cos(tx)-z*Math.sin(tx);Z=y*Math.sin(tx)+z*Math.cos(tx);y=Y;z=Z;X=x*Math.cos(tz)-y*Math.sin(tz);Y=x*Math.sin(tz)+y*Math.cos(tz);return[X,Y,z]}
function line(pts,amp,base,h){for(let k=0;k<pts.length-1;k++){const[a,b]=[pts[k],pts[k+1]];const st=Math.max(2,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])*R*1.5));
 for(let s=0;s<st;s++){const f=s/st,x=a[0]+(b[0]-a[0])*f,y=a[1]+(b[1]-a[1])*f,z=a[2]+(b[2]-a[2])*f,j=(rnd()-.5)*amp;
  const v=base*(z<0?.35:1);plot(B/2+x*R+j,B/2+y*R+(rnd()-.5)*amp,v,h)}}}
function grid(t,a,tx,tz,h,pulse){
 for(let la=-3;la<=3;la++){const ph=la*Math.PI/8,pts=[];for(let k=0;k<=36;k++){const lo=k/36*Math.PI*2;pts.push(rot([Math.cos(ph)*Math.cos(lo),Math.sin(ph),Math.cos(ph)*Math.sin(lo)],a,tx,tz))}
  line(pts,.05,.55+.45*Math.max(0,Math.sin(t*4+la*1.3+pulse)),h)}
 for(let lo=0;lo<8;lo++){const L=lo*Math.PI/8,pts=[];for(let k=0;k<=36;k++){const p=k/36*Math.PI*2;pts.push(rot([Math.cos(p)*Math.cos(L),Math.sin(p),Math.cos(p)*Math.sin(L)],a,tx,tz))}
  line(pts,.05,.55+.45*Math.max(0,Math.sin(t*3.2+lo*1.1+pulse+1)),h)}}
function bolt(a,b,d,h){if(d===0){line([a,b],.4,1,h);return}const m=[(a[0]+b[0])/2+(rnd()-.5)*.25,(a[1]+b[1])/2+(rnd()-.5)*.25,(a[2]+b[2])/2],l=Math.hypot(...m)||1;
 const mm=m.map(v=>v/l*(1+rnd()*.12));bolt(a,mm,d-1,h);bolt(mm,b,d-1,h);if(d===3&&rnd()<.5){const e=[mm[0]+(rnd()-.5)*.5,mm[1]+(rnd()-.5)*.5,mm[2]];bolt(mm,e,1,h)}}
const sp=()=>{const u=rnd()*2-1,a=rnd()*Math.PI*2,s=Math.sqrt(1-u*u);return[s*Math.cos(a),u,s*Math.sin(a)]};
function paint(t){seed=(Math.floor(t*12)%997)+7;buf.fill(0);hue.fill(0);
 grid(t,RM?.3:t*.6,.41,.18,0,0);grid(t,RM?1:-t*.45,1.2,-.6,1,2);
 const nb=RM?1:2+Math.floor(rnd()*3);for(let i=0;i<nb;i++){const a=sp();a[2]=Math.abs(a[2]);const b=sp();b[2]=Math.abs(b[2]);bolt(a,b,3,2)}
 if(!RM&&rnd()<.35){const a=sp(),o=[a[0]*1.45,a[1]*1.45,a[2]];bolt(a,o,2,2)}
 const L=LA==null?[-.5,-.5,.7]:[Math.cos(LA)*.88,Math.sin(LA)*.88,.47];
 for(let y=0;y<B;y++)for(let x=0;x<B;x++){const i=y*B+x,o=i*4,nx=(x+.5-B/2)/R,ny=(y+.5-B/2)/R,r2=nx*nx+ny*ny;let v=buf[i];
  const nz=Math.sqrt(Math.max(0,1-r2)),lit=Math.max(0,Math.min(1,.45+(nx*L[0]+ny*L[1]+nz*L[2])*.75));
  if(v>0){let q=v*(.55+.6*lit);const n=Math.max(0,Math.min(4,Math.floor(q*4+BAY[(y&3)*4+(x&3)]/16)));let col=PAL[n];if(hue[i]===1&&n<4)col=[col[0]+25,col[1]+10,255];if(hue[i]===2)col=n>=2?PAL[4]:PAL[3];
   D[o]=Math.min(255,col[0]);D[o+1]=Math.max(0,col[1]);D[o+2]=col[2];D[o+3]=255}
  else if(r2<1){const q=Math.floor((.15+lit*.35)*4+BAY[(y&3)*4+(x&3)]/16)/4,gl=RM?0:.5+.5*Math.sin(t*5);D[o]=8+q*14;D[o+1]=6+q*16+gl*4;D[o+2]=26+q*50+gl*10;D[o+3]=255}
  else if(r2<1.18&&!RM&&BAY[(y&3)*4+(x&3)]<(Math.sin(t*6)+1.2)*3){D[o]=70;D[o+1]=170;D[o+2]=255;D[o+3]=110}
  else D[o+3]=0}
 bg.putImageData(img,0,0);g.clearRect(0,0,N,N);g.drawImage(bc,0,0,N,N)}
const NAME='Volt Sphere';
const tipOn=(on,e)=>{const t=document.getElementById('tip');if(!t)return;if(on){if(t.textContent!==NAME||!t.classList.contains('on'))window.__blip&&__blip('hover');t.textContent=NAME;t.style.left=(e.clientX+14)+'px';t.style.top=(e.clientY+14)+'px';t.classList.add('on')}else if(t.textContent===NAME)t.classList.remove('on')};
const onBall=e=>{const r=c.getBoundingClientRect();return Math.hypot((e.clientX-r.left)/r.width*N-N/2,(e.clientY-r.top)/r.height*N-N/2)<R*N/B*1.15};
let down=null;
c.addEventListener('pointermove',e=>{if(onBall(e)){c.style.cursor='pointer';tipOn(1,e)}else{c.style.cursor='';tipOn(0)}});
c.addEventListener('pointerleave',()=>tipOn(0));
c.addEventListener('pointerdown',e=>{if(onBall(e)){down=[e.clientX,e.clientY];e.stopPropagation()}});
c.addEventListener('pointerup',e=>{if(down){e.stopPropagation();if(Math.hypot(e.clientX-down[0],e.clientY-down[1])<8&&window.__galVS)window.__galVS()}down=null});
c.addEventListener('click',e=>{if(onBall(e))e.stopPropagation()});
c.addEventListener('wheel',e=>{const s=document.getElementById('gsky');if(s){e.preventDefault();s.dispatchEvent(new WheelEvent('wheel',e))}},{passive:false});
c.addEventListener('keydown',e=>{if(e.key==='Enter'&&window.__galVS)window.__galVS()});
let last=0;
function frame(ms){const v=window.__galView&&window.__galView(),gal=document.getElementById('galaxy');
 if(!v||!gal||!v.inGal||!v.vs){c.style.display='none';return requestAnimationFrame(frame)}
 if(v.vsLa!=null)LA=v.vsLa;if(c.parentNode!==gal)gal.appendChild(c);
 const z=v.cam.z,s=Math.max(2,Math.round(VS_W*K*z)),x=(v.vs[0]-v.cam.x)*z+v.GW/2,y=(v.vs[1]-v.cam.y)*z+v.GH/2;
 c.style.zIndex=v.vsZ;c.style.width=c.style.height=s+'px';c.style.transform='translate('+Math.round(x-s/2)+'px,'+Math.round(y-s/2)+'px)';
 c.style.display=(x<-s||y<-s||x>v.GW+s||y>v.GH+s)?'none':'';
 if(c.style.display!=='none'&&(ms-last>60||!last)){last=ms;paint(ms/1000)}
 requestAnimationFrame(frame)}
requestAnimationFrame(frame)})();

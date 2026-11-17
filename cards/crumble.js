/* The open box breaks apart. The two swung halves (as they are drawn on the mech canvas) and the velvet bed under the deck
   are cut into irregular chunks of real box pixels (a weighted Voronoi split with ragged edges, so sizes vary). A short burst
   throws them outward, gravity pulls them down, they spin a little, and a chunk that lands on the ledge the box stood on
   bounces and cracks into smaller bits that tumble off the edge. Everything is drawn at the art's own pixel scale, unsmoothed. */
(()=>{'use strict';
const G=3000;                      // gravity, art px / s^2
let rnd=Math.random;
function cut(src,ox,oy,sw,sh,avg,out,layer,skip){
 // src: ImageData (sw x sh). opaque pixels only. seeds get random weights so cells come in mixed sizes
 const d=src.data,op=[];for(let i=0;i<sw*sh;i++)if(d[i*4+3]>8&&!(skip&&skip(i%sw,(i/sw)|0)))op.push(i);
 if(!op.length)return;
 const n=Math.max(2,Math.round(op.length/avg)),S=[];
 for(let k=0;k<n;k++){const i=op[(rnd()*op.length)|0];const r=rnd();S.push([i%sw,(i/sw)|0,Math.pow(r,3)*avg*2.2])}
 // grid buckets for speed
 const C=24,gw=Math.ceil(sw/C),gh=Math.ceil(sh/C),bk=[];for(let k=0;k<gw*gh;k++)bk.push([]);
 S.forEach((s,k)=>bk[((s[1]/C)|0)*gw+((s[0]/C)|0)].push(k));
 const lab=new Int32Array(sw*sh).fill(-1),R=3;
 for(const i of op){const x=i%sw,y=(i/sw)|0,gx=(x/C)|0,gy=(y/C)|0;let best=1e18,bi=0;
  // hash noise makes the break lines ragged rather than straight
  const h=((x*73856093)^(y*19349663))>>>0,nz=((h%1000)/1000-.5)*14;
  for(let yy=Math.max(0,gy-R);yy<=Math.min(gh-1,gy+R);yy++)for(let xx=Math.max(0,gx-R);xx<=Math.min(gw-1,gx+R);xx++)
   for(const k of bk[yy*gw+xx]){const s=S[k],dx=x-s[0],dy=y-s[1],v=dx*dx+dy*dy-s[2]+nz;if(v<best){best=v;bi=k}}
  lab[i]=bi}
 const bb=S.map(()=>[1e9,1e9,-1,-1,0]);
 for(const i of op){const b=bb[lab[i]],x=i%sw,y=(i/sw)|0;if(x<b[0])b[0]=x;if(y<b[1])b[1]=y;if(x>b[2])b[2]=x;if(y>b[3])b[3]=y;b[4]++}
 bb.forEach((b,k)=>{if(!b[4])return;const w=b[2]-b[0]+1,h=b[3]-b[1]+1,px=new Uint8ClampedArray(w*h*4);
  for(let y=b[1];y<=b[3];y++)for(let x=b[0];x<=b[2];x++){const i=y*sw+x;if(lab[i]!==k)continue;const j=((y-b[1])*w+(x-b[0]))*4;px.set(d.subarray(i*4,i*4+4),j)}
  out.push(mk(px,w,h,ox+b[0]+w/2,oy+b[1]+h/2,b[4],layer))})}
function mk(px,w,h,cx,cy,area,layer){const c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').putImageData(new ImageData(px,w,h),0,0);
 return {c,px,w,h,x:cx,y:cy,a:0,vx:0,vy:0,w0:0,area,layer,hits:0,t0:0}}
// split a chunk (already rotated by ch.a) into 2-4 smaller bits of its own pixels
function crack(ch){const {px,w,h}=ch,op=[];for(let i=0;i<w*h;i++)if(px[i*4+3]>8)op.push(i);
 const n=Math.min(4,Math.max(2,Math.round(op.length/45))),S=[];for(let k=0;k<n;k++){const i=op[(rnd()*op.length)|0];S.push([i%w,(i/w)|0])}
 const lab=new Int8Array(w*h).fill(-1);for(const i of op){const x=i%w,y=(i/w)|0;let b=1e9,bi=0;S.forEach((s,k)=>{const v=(x-s[0])**2+(y-s[1])**2;if(v<b){b=v;bi=k}});lab[i]=bi}
 const res=[],ca=Math.cos(ch.a),sa=Math.sin(ch.a);
 S.forEach((s,k)=>{let x0=1e9,y0=1e9,x1=-1,y1=-1,a=0;for(const i of op)if(lab[i]===k){const x=i%w,y=(i/w)|0;x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);a++}
  if(!a)return;const ww=x1-x0+1,hh=y1-y0+1,q=new Uint8ClampedArray(ww*hh*4);
  for(const i of op)if(lab[i]===k){const x=i%w,y=(i/w)|0;q.set(px.subarray(i*4,i*4+4),((y-y0)*ww+(x-x0))*4)}
  const lx=x0+ww/2-w/2,ly=y0+hh/2-h/2,b=mk(q,ww,hh,ch.x+lx*ca-ly*sa,ch.y+lx*sa+ly*ca,a,ch.layer);
  b.a=ch.a;b.hits=ch.hits;b.side=ch.side;res.push(b)});return res}
const ext=ch=>{const c=Math.abs(Math.cos(ch.a)),s=Math.abs(Math.sin(ch.a));return (ch.w*s+ch.h*c)/2};
/* prep(o): cut the open box into chunks (o: mech canvas, floor img, deck, p). run(chunks,o): break it apart; o.onFirst() fires once
   the chunks are on screen so the caller can hide the real box. resolves when every chunk has gone */
window.Crumble={prep(o){const p=o.p;
 const mr=o.mech.getBoundingClientRect(),fr=o.floor.getBoundingClientRect();
 const mx=Math.round(mr.left/p),my=Math.round(mr.top/p),fxo=Math.round(fr.left/p),fyo=Math.round(fr.top/p);
 const ch=[];
 const m=o.mech.getContext('2d').getImageData(0,0,o.mech.width,o.mech.height);cut(m,mx,my,o.mech.width,o.mech.height,150,ch,1);
 const fc=document.createElement('canvas');fc.width=o.floor.naturalWidth;fc.height=o.floor.naturalHeight;const fg=fc.getContext('2d');fg.drawImage(o.floor,0,0);
 cut(fg.getImageData(0,0,fc.width,fc.height),fxo,fyo,fc.width,fc.height,170,ch,0);return ch},
run(ch,o){return new Promise(res=>{
 const p=o.p,vw=innerWidth,vh=innerHeight,AW=Math.ceil(vw/p),AH=Math.ceil(vh/p);
 const mk2=(z,before)=>{const c=document.createElement('canvas');c.width=AW;c.height=AH;c.className='px';c.setAttribute('aria-hidden','true');
  c.style.cssText=`position:fixed;left:0;top:0;width:${AW*p}px;height:${AH*p}px;pointer-events:none;z-index:${z}`;before?document.body.insertBefore(c,before):document.body.appendChild(c);return c};
 const back=mk2(0,document.body.firstChild),front=mk2(40),bx=back.getContext('2d'),fx=front.getContext('2d');
 const fr=o.floor.getBoundingClientRect(),dr=o.deck.getBoundingClientRect();
 // burst from the middle of the box; small bits fly faster and spin quicker; a crack runs out from the centre (tiny stagger)
 const cx=(dr.left+dr.width/2)/p,cy=(dr.top+dr.height/2)/p,ground=Math.round((fr.bottom)/p)+2,gl=fr.left/p-6,gr=fr.right/p+6;
 for(const c of ch){let dx=c.x-cx,dy=c.y-cy;const L=Math.hypot(dx,dy)||1;dx/=L;dy/=L;const k=1/Math.sqrt(Math.max(.6,c.area/120));
  const sp=(230+rnd()*220)*Math.min(1.8,k);c.vx=dx*sp*1.15+(rnd()-.5)*70;c.vy=c.layer?dy*sp*.5-(160+rnd()*240):dy*sp*.3-(60+rnd()*140);if(!c.layer)c.vx*=1.5;c.side=dx<0?-1:1;
  if(Math.abs(c.vx)<90)c.vx=c.side*(90+rnd()*90);
  c.w0=(rnd()<.5?-1:1)*(1.5+rnd()*6)*Math.min(2.2,k);c.t0=Math.min(60,L*.28)+rnd()*12}
 const T0=performance.now();let lt=T0,done=false;
 const draw=()=>{bx.clearRect(0,0,AW,AH);fx.clearRect(0,0,AW,AH);bx.imageSmoothingEnabled=fx.imageSmoothingEnabled=false;
  for(const c of ch){const g=c.layer?fx:bx,X=Math.round(c.x),Y=Math.round(c.y);
   if(Math.abs(c.a)<.02)g.drawImage(c.c,Math.round(c.x-c.w/2),Math.round(c.y-c.h/2));
   else{g.save();g.translate(X,Y);g.rotate(c.a);g.drawImage(c.c,-c.w/2,-c.h/2);g.restore()}}};
 draw();o.onFirst&&o.onFirst();
 const step=now=>{const t=now-T0,dt=Math.min(.033,(now-lt)/1000);lt=now;
  for(let i=ch.length-1;i>=0;i--){const c=ch[i];if(t<c.t0)continue;
   c.vy+=G*dt;c.x+=c.vx*dt;c.y+=c.vy*dt;c.a+=c.w0*dt;
   const e=ext(c);
   // the ledge the box stood on: only under the box's footprint
   if(c.vy>0&&c.x>gl&&c.x<gr&&c.y+e>=ground&&c.y+e-c.vy*dt<=ground+1){
    c.y=ground-e;c.hits++;
    if(c.area>40&&c.vy>260&&c.hits<3){const bits=crack(c);ch.splice(i,1);
     for(const b of bits){b.vy=-c.vy*(.22+rnd()*.2);b.vx=c.vx*.5+b.side*(150+rnd()*150)+(b.x-c.x)*6;b.w0=(rnd()-.5)*16;b.t0=0;ch.push(b)}continue}
    c.vy=-c.vy*.3;c.vx=c.vx*.8+(c.side||1)*160;c.w0*=-.5;if(Math.abs(c.vy)<40){c.vy=0;c.vx=(c.side||1)*Math.max(340,Math.abs(c.vx))}}
   if(c.y-ext(c)>AH+4||c.x+c.w<-40||c.x-c.w>AW+40)ch.splice(i,1)}
  draw();
  if(!ch.length||t>1700){back.remove();front.remove();res();return}
  requestAnimationFrame(step)};
 requestAnimationFrame(step)})}};
})();

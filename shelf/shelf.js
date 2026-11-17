/* Landry's shelf: a pixel-art shelf with four objects. Everything is drawn into one low-res canvas (1 unit = 1 art pixel),
   upscaled by a whole number of device pixels (U css px per art px) with image-rendering:pixelated. The "camera" is a CSS transform on that canvas. */
(()=>{'use strict';
const LAVERSE_URL='/';           // the solar hub (the root will later become the shelf; change this then)
const GUMBALL_URL='/gumball/', CARDS_URL='/cards/', TV_URL='/tv/';
const RM=matchMedia('(prefers-reduced-motion: reduce)');
const cam=document.getElementById('cam'),cv=document.getElementById('sc'),g=cv.getContext('2d'),hits=document.getElementById('hits'),
 back=document.getElementById('back'),fade=document.getElementById('fade'),plate=document.getElementById('plate');
// palette (gold + glass ramps shared with /gumball/)
const GD=['#4a3208','#7a520e','#a8741a','#d29a2a','#f0c24a','#ffe58a','#fff6cc'],GL=['#ffffff','#f3f6fa','#e3e9f1','#cfd8e4','#aeb9c9','#8a97ab','#5e6a7e','#3c4556'];
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return{c,x,w,h}}
function px(x,X,Y,col,w=1,h=1){x.fillStyle=col;x.fillRect(X,Y,w,h)}
function line(x,x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
 for(;;){px(x,x0,y0,col);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function disc(x,cx,cy,r,f){for(let y=-r;y<=r;y++)for(let X=-r;X<=r;X++){const d=Math.hypot(X+.5-.5,y);if(d<=r+.25)f(cx+X,cy+y,X,y,d)}}
const load=src=>new Promise(res=>{const im=new Image();im.onload=()=>res(im);im.onerror=()=>res(null);im.src=src});

// ---------------- sprites ----------------
// GUMBALL: a frame rendered by the live /gumball/ page itself at PX=2 (300x544 viewport), so it matches exactly.
// Crop origin inside that frame (art px) and the page's layout numbers for that viewport, used to line up the hand-off.
const GB={cx0:31,cy0:28,S0:(544-52-92)/720,OX0:150,OY0:140};
function gumLayout(W,H){const top=Math.max(52,H*.06),bot=Math.max(92,H*.12),avail=H-top-bot,S=Math.min(avail/720,W*.9/330,1.5),P=Math.max(2,Math.round(720*S/300));
 return{S,OX:Math.round(W/2/P)*P,OY:Math.round((top+(avail-720*S)/2+158*S)/P)*P}}

// CARD BOX: the exact golden box from /cards/ (208x288 art), snapshotted and reduced 3x to the shelf's pixel size.
// CB = how /cards/ lays its box out, used to line the zoom up with the real page.
function cbLayout(W,H){const p=(H>=1100&&W>=900)?2:1,tw=208*p,th=288*p;return{p,x:Math.round((W-tw)/2),y:Math.max(56,Math.round((H-th-70)/2)),w:tw,h:th}}
function cardBox(img){const s=mk(img.width,img.height);s.x.drawImage(img,0,0);const d=s.x.getImageData(0,0,s.w,s.h).data,gl=[];
 for(let y=0;y<s.h;y++)for(let X=0;X<s.w;X++){const i=(y*s.w+X)*4;if(d[i]>190&&d[i+1]>130&&d[i+2]<150&&d[i]-d[i+2]>90)gl.push([X,y])}
 return{...s,glint:gl,F:s.w}}

// RETRO TV: the exact model /tv/ uses (shared ../tv/tvart.js), so the zoom hands off with no swap.
function tv(){return TVART.make()}

// LAVERSE ORRERY (redrawn live so it can spin). Hand-built: stepped engraved gold base, central spindle, six thin arms on
// collars at different heights, each with an elbow knuckle and a rod up to its planet. Light comes from the top-left.
// Planets are the hub's own painters at 20px, in hub orbit order; Cooper City on the outermost arm.
const ORB=[['sea',20],['aiquiz',30],['yt',40],['escapeca',50],['terra',60],['gow',70]];
const ORR={W:168,H:150,cx:84,sunY:26,sunR:17,py:62,rot:-.45,tilt:.24,glow:0};
const SUNC=['#5a0a02','#8a1606','#b8280a','#dc4410','#f26a1c','#fb9636','#ffc46e','#ffe8b8'];
function sunSprite(){const R=ORR.sunR,D=R*2+1,s=mk(D,D),x=s.x;
 for(let y=-R;y<=R;y++)for(let X=-R;X<=R;X++){const d=Math.hypot(X,y);if(d>R+.35)continue;const nz=Math.sqrt(Math.max(0,1-(d/(R+.5))**2)),l=(-X*.55-y*.6)/(R+.5)+nz*.75;
  let c=d>R-.65?SUNC[1]:SUNC[clamp(Math.floor(2+l*4.2),2,7)];px(x,X+R,y+R,c)}
 // engraved cursive L: dark cut with a lit lower lip
 const LP=[[[1.5,-3],[-3.5,-6],[1,-12.5],[5,-9.5]],[[5,-9.5],[7.5,-7],[2,-6],[.5,-2.5]],[[.5,-2.5],[-.5,2],[-2,5.5],[-4.5,7.5]],[[-4.5,7.5],[-7.5,10],[-2,11],[0,8]],[[0,8],[2,6],[4.5,9.5],[7.5,7]]];
 const bz=(p,t)=>{const u=1-t;return[0,1].map(i=>u*u*u*p[0][i]+3*u*u*t*p[1][i]+3*u*t*t*p[2][i]+t*t*t*p[3][i])};const pts=new Map();
 const LS=1.18;LP.forEach(sg=>{for(let i=0;i<=120;i++){const[a,b]=bz(sg,i/120);const X=Math.round(R+a*LS),Y=Math.round(R+b*LS+1);pts.set(X+','+Y,[X,Y])}});
 pts.forEach(([a,b])=>{if(!pts.has(a+','+(b+1)))px(x,a,b+1,SUNC[7])});pts.forEach(([a,b])=>px(x,a,b,SUNC[0]));return s}
function orrery(im){const s=mk(ORR.W,ORR.H);s.im=im;im.sunS=sunSprite();s.draw=()=>drawOrr(s);s.draw();s.sun=[ORR.cx,ORR.sunY,ORR.sunR];return s}
function drawOrr(s){const x=s.x,im=s.im,{cx,py}=ORR,N=ORB.length;x.clearRect(0,0,s.w,s.h);
 // base: three stepped tiers (top face + front band), engraved
 const tier=(rx,ry,yt,hb,eng)=>{for(let X=-rx;X<=rx;X++){const e=ry*Math.sqrt(Math.max(0,1-(X/(rx+.5))**2)),yf=Math.round(yt+e),yb=Math.round(yt-e),u=X/rx;
   const band=u<-.65?GD[4]:u<-.2?GD[3]:u<.35?GD[3]:u<.75?GD[2]:GD[1];
   for(let y=yf+1;y<=yf+hb;y++){let c=band;if(y===yf+hb)c=GD[0];else if(y===yf+1)c=u<-.3?GD[6]:u<.4?GD[5]:GD[4];
    else if(eng&&y===yf+Math.ceil(hb/2)){const m=(X+rx)%6;if(m===0)c=u<.1?GD[2]:GD[0];else if(m===1)c=u<.1?GD[6]:GD[4]}px(x,cx+X,y,c)}
   for(let y=yb;y<=yf;y++){const v=(y-yt)/(ry+.01);let c=(u*.8+v)<-.95?GD[5]:(u*.8+v)<-.05?GD[4]:GD[3];if(y===yb)c=GD[2];if(y===yf)c=GD[5];if(Math.abs(X)>=rx-1&&y!==yf)c=GD[1];px(x,cx+X,y,c)}}
  if(eng)for(let a=0;a<72;a++){if(a%2)continue;const t=a/72*Math.PI*2;px(x,Math.round(cx+Math.cos(t)*(rx-5)),Math.round(yt+Math.sin(t)*(ry-1.8)),GD[2])}};
 tier(40,7,135,6,true);tier(28,5,128,4,true);tier(17,3,122,3,false);
 // baluster neck
 [[121,6],[120,5],[119,4],[118,4],[117,3],[116,3],[115,4],[114,3]].forEach(([y,w])=>{for(let X=-w;X<=w;X++){const u=X/w;px(x,cx+X,y,Math.abs(X)===w?GD[0]:u<-.4?GD[6]:u<.15?GD[4]:u<.6?GD[3]:GD[2])}});
 // arms
 const items=ORB.map(([id,r],i)=>{const A=ORR.rot+(i%2)*Math.PI+i*.2,yc=84+i*5,ex=cx+Math.cos(A)*r,ey=yc+Math.sin(A)*r*ORR.tilt,pY=py+Math.sin(A)*r*ORR.tilt;return{id,r,yc,ex,ey,pY,z:Math.sin(A)}});
 const arm=o=>{const X=Math.round(o.ex),Y=Math.round(o.ey),top=Math.round(o.pY)+9;
  line(x,cx,o.yc,X,Y,GD[5]);line(x,cx,o.yc+1,X,Y+1,GD[1]);
  for(let y=top;y<Y-1;y++){px(x,X-1,y,GD[0]);px(x,X,y,GD[6]);px(x,X+1,y,GD[3]);px(x,X+2,y,GD[0])}
  // elbow knuckle
  px(x,X-2,Y-2,GD[0],6,5);px(x,X-1,Y-1,GD[6],2,1);px(x,X+1,Y-1,GD[4],2,1);px(x,X-1,Y,GD[5],1,2);px(x,X,Y,GD[4],2,2);px(x,X+2,Y,GD[2],1,2);px(x,X-1,Y+2,GD[1],4,1);
  // cup under the planet
  px(x,X-3,top-1,GD[0],8,3);px(x,X-2,top-1,GD[6],3,1);px(x,X+1,top-1,GD[4],3,1);px(x,X-2,top,GD[2],6,1);
  const p=im[o.id];if(p)x.drawImage(p,X+1-Math.ceil(p.width/2),Math.round(o.pY)-Math.floor(p.height/2))};
 const spindle=()=>{for(let y=ORR.sunY+ORR.sunR;y<114;y++){px(x,cx-2,y,GD[0]);px(x,cx-1,y,GD[6]);px(x,cx,y,GD[4]);px(x,cx+1,y,GD[2]);px(x,cx+2,y,GD[0])}
  items.forEach(o=>{px(x,cx-3,o.yc-1,GD[0],7,3);px(x,cx-2,o.yc,GD[6],2,1);px(x,cx,o.yc,GD[4],2,1);px(x,cx+2,o.yc,GD[2])});
  // sun cup
  const cy=ORR.sunY+ORR.sunR;px(x,cx-6,cy-2,GD[0],13,4);px(x,cx-5,cy-1,GD[6],5,1);px(x,cx,cy-1,GD[4],6,1);px(x,cx-5,cy,GD[3],11,1)};
 items.filter(o=>o.z<0).sort((a,b)=>a.ey-b.ey).forEach(arm);
 spindle();
 if(ORR.glow>0.01){const R=ORR.sunR;for(let yy=-R-6;yy<=R+6;yy++)for(let X=-R-6;X<=R+6;X++){const d=Math.hypot(X,yy);if(d<=R+.6||d>R+5.5)continue;const bnd=d<R+2.5?0:1;x.globalAlpha=ORR.glow*(bnd?.28:.6);px(x,cx+X,ORR.sunY+yy,bnd?GD[5]:GD[6])}x.globalAlpha=1}
 x.drawImage(im.sunS.c,cx-ORR.sunR,ORR.sunY-ORR.sunR);
 items.filter(o=>o.z>=0).sort((a,b)=>a.ey-b.ey).forEach(arm)}

// ---------------- scene / layout ----------------
let W=0,H=0,U=2,dpr=1,lw=0,lh=0,objs=[],shelves=[],ready=false;
const O={gumball:{label:'Gumball machine'},cards:{label:'Deck of cards'},laverse:{label:'The Laverse'},tv:{label:'TV'}};
// Two gold shelves, two objects on each. Gaps grow until, zoomed on any object, no other object is in view.
function zoomWin(o){const t=target(o),q=U*t.k;return[-t.tx/q,-t.ty/q,(W-t.tx)/q,(H-t.ty)/q]}
function placeRows(rows,hg,vg,x0,y0){const SH=24;let y=y0;const out=[];
 rows.forEach((r,i)=>{const rh=Math.max(...r.map(k=>O[k].s.h)),rw=r.reduce((a,k)=>a+O[k].s.w,0)+hg[i]*(r.length-1),top=y+rh;let X=x0-Math.round(rw/2);
  out.push({x0:x0-Math.round(rw/2),x1:x0+Math.round(rw/2),y:top});r.forEach(k=>{const o=O[k];o.x=X;o.y=top-o.s.h+3;X+=o.s.w+hg[i]});y=top+SH+vg});return out}
function layout(){W=innerWidth;H=innerHeight;dpr=devicePixelRatio||1;const tall=W/H<.9;
 const rows=[['gumball','cards'],['laverse','tv']],hg=tall?[40,40]:[120,120];let vg=tall?80:70,pad=tall?24:60;objs=rows.flat().map(k=>{O[k].id=k;return O[k]});
 U=1/dpr;let sh;const M=8;
 for(let it=0;it<200;it++){sh=placeRows(rows,hg,vg,0,0);let bad=false;
  for(const a of objs){const w=zoomWin(a);for(const b of objs){if(a===b)continue;
   if(b.x+b.s.w+M>w[0]&&b.x-M<w[2]&&b.y-6+M<w[3]&&b.y+b.s.h-M>w[1]){bad=true;const ra=rows.findIndex(r=>r.includes(a.id)),rb=rows.findIndex(r=>r.includes(b.id));if(ra===rb)hg[ra]+=6;else vg+=6}}}
  if(!bad)break}
 // balance the two rows to the same width: widen the narrower row's gap
 const rwid=i=>rows[i].reduce((a,k)=>a+O[k].s.w,0)+hg[i];const d=rwid(0)-rwid(1);if(d>0)hg[1]+=d;else hg[0]-=d;sh=placeRows(rows,hg,vg,0,0);
 const bx0=Math.min(...sh.map(q=>q.x0))-pad,bx1=Math.max(...sh.map(q=>q.x1))+pad,by0=Math.min(...objs.map(o=>o.y))-8,by1=Math.max(...sh.map(q=>q.y))+24;
 const PXd=Math.max(1,Math.floor(Math.min(W*.94/(bx1-bx0),H*.9/(by1-by0))*dpr+1e-6));U=PXd/dpr;lw=Math.ceil(W/U);lh=Math.ceil(H/U);
 cv.width=lw;cv.height=lh;cv.style.width=lw*U+'px';cv.style.height=lh*U+'px';
 const ox=Math.round(lw/2-(bx0+bx1)/2),oy=Math.round(lh/2-(by0+by1)/2);objs.forEach(o=>{o.x+=ox;o.y+=oy});
 shelves=sh.map(q=>({x0:q.x0+ox-pad,x1:q.x1+ox+pad,y:q.y+oy}));
 layout.info={hg:[...hg],vg,U,overlap:objs.map(a=>{const w=zoomWin(a);return objs.filter(b=>b!==a&&b.x+b.s.w>w[0]&&b.x<w[2]&&b.y<w[3]&&b.y+b.s.h>w[1]).map(b=>b.id)})};
 placeHits();draw()}
function drawShelf(sh){const{x0,x1,y}=sh,w=x1-x0;
 [x0+14,x1-26].forEach(bx=>{for(let k=0;k<12;k++){const ww=12-k;px(g,bx,y+10+k,GD[0],ww,1);if(ww>2)px(g,bx+1,y+10+k,k<2?GD[4]:GD[3],ww-2,1);if(ww>3)px(g,bx+1,y+10+k,GD[5]);if(ww>5)px(g,bx+ww-2,y+10+k,GD[2])}});
 px(g,x0,y-1,GD[2],w,1);px(g,x0,y,GD[6],w,1);px(g,x0,y+1,GD[5],w,2);px(g,x0,y+3,GD[4],w,1);px(g,x0,y+4,GD[6],w,1);px(g,x0,y+5,GD[4],w,2);px(g,x0,y+7,GD[3],w,2);px(g,x0,y+9,GD[1],w,1);
 for(let X=x0+4;X<x1-3;X+=6)px(g,X,y+6,GD[5]);
 px(g,x0-1,y-1,GD[0],1,11);px(g,x1,y-1,GD[0],1,11);px(g,x0+1,y+10,GL[2],w-2,1);px(g,x0+3,y+11,GL[1],w-6,1)}
let glintT=0;
function draw(){g.setTransform(1,0,0,1,0,0);g.fillStyle='#fff';g.fillRect(0,0,lw,lh);if(!ready)return;
 shelves.forEach(drawShelf);
 for(const o of objs){const L=Math.round(o.lift||0),sw=Math.max(4,o.s.w-10-L*3),sx=o.x+Math.round((o.s.w-sw)/2)-(o.id==='cards'?4:0);
  px(g,sx,o.y+o.s.h-3,L?GD[4]:GD[3],sw,1);px(g,sx+2,o.y+o.s.h-2,L>1?GD[5]:GD[4],sw-4,1);
  g.drawImage(o.s.c,o.x,o.y-L);
  if(o.id==='cards'&&glintT>0){const F=o.s.F,pos=lerp(-30,F+60,glintT);for(const[a,b]of o.s.glint){const d=a+b*.5-pos;if(d>-2.5&&d<2.5)px(g,o.x+a,o.y-L+b,Math.abs(d)<1.1?GD[6]:GD[5])}}}}
function placeHits(){for(const o of objs){const b=o.btn;b.style.left=o.x*U+'px';b.style.top=(o.y-6)*U+'px';b.style.width=o.s.w*U+'px';b.style.height=(o.s.h+6)*U+'px'}}

// ---------------- animation loop: hover springs, glint, orrery spin ----------------
let raf=0,last=0;const tick=[];
const spin={on:false,drag:null,v:0,tiltT:.26,hover:false,dirty:true};
function loop(now){raf=0;const dt=Math.min(.05,(now-(last||now))/1000)||1/60;last=now;let more=false;
 for(const o of objs){const tgt=o.press?1.2:o.hover?4.6:0;o.v=(o.v||0)+((tgt-(o.lift||0))*420-(o.v||0)*28)*dt;o.lift=(o.lift||0)+o.v*dt;if(Math.abs(o.v)>.02||Math.abs(tgt-o.lift)>.02)more=true;else{o.lift=tgt;o.v=0}}
 if(!RM.matches&&!zoomed){const ph=(now%4800)/1000;glintT=ph<1?ph:0;more=true}else glintT=0;
 // orrery: momentum spin, eased tilt, sun glow
 if(spin.on){if(!spin.drag&&Math.abs(spin.v)>.0005){ORR.rot+=spin.v*dt;spin.v*=Math.exp(-1.5*dt);spin.dirty=true;more=true}
  const tt=spin.tiltT-ORR.tilt;if(Math.abs(tt)>.0005){ORR.tilt+=tt*Math.min(1,dt*10);spin.dirty=true;more=true}
  const coarse=matchMedia('(hover: none)').matches,gt=spin.hover?1:coarse?(RM.matches?.5:.35+.25*Math.sin(now/520)):0;
  const gd=gt-ORR.glow;if(Math.abs(gd)>.004){ORR.glow+=gd*Math.min(1,dt*8);spin.dirty=true}if(coarse&&!RM.matches)more=true;if(Math.abs(gd)>.004)more=true;
  if(spin.drag)more=true}
 if(spin.dirty){O.laverse.s.draw();spin.dirty=false}
 for(let i=tick.length-1;i>=0;i--)if(tick[i](now)===false)tick.splice(i,1);
 if(tick.length)more=true;draw();if(more)raf=requestAnimationFrame(loop);else last=0}
const kick=()=>{if(!raf)raf=requestAnimationFrame(loop)};

// ---------------- camera ----------------
let camK=1,camX=0,camY=0,zoomed=null,busy=false,app=null;
function setCam(k,tx,ty){camK=k;camX=tx;camY=ty;cam.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${k})`}
function target(o){if(o.id==='tv'){const L=TVART.layout(W,H),k=L.P/U;return{k,tx:L.x-o.x*U*k,ty:L.y-o.y*U*k}}
 if(o.id==='cards'){const L=cbLayout(W,H),k=L.w/(o.s.w*U);return{k,tx:L.x-o.x*U*k,ty:L.y-o.y*U*k}}
 if(o.id==='gumball'){const L=gumLayout(W,H),r=L.S/GB.S0,k=2*r/U;
  return{k,tx:((GB.cx0*2-GB.OX0)*r+L.OX)-o.x*U*k,ty:((GB.cy0*2-GB.OY0)*r+L.OY)-o.y*U*k}}
 const fw=o.id==='tv'?.8:o.id==='laverse'?.86:.72,fh=o.id==='laverse'?.8:.72,k=Math.min(W*fw/(o.s.w*U),H*fh/(o.s.h*U)),cx=(o.x+o.s.w/2)*U,cy=(o.y+o.s.h/2)*U;
 return{k,tx:W/2-cx*k,ty:H/2-cy*k}}
function backIO(t,c){const c2=c*1.525;return t<.5?(Math.pow(2*t,2)*((c2+1)*2*t-c2))/2:(Math.pow(2*t-2,2)*((c2+1)*(t*2-2)+c2)+2)/2}
function backIn(t,c){return(c+1)*t*t*t-c*t*t}
function tweenCam(A,to,dur,ease,done){const k0=camK,q0=[A[0]*k0+camX,A[1]*k0+camY],q1=[A[0]*to.k+to.tx,A[1]*to.k+to.ty],t0=performance.now();
 tick.push(now=>{const t=clamp((now-t0)/dur),p=ease(t),k=k0*Math.pow(to.k/k0,p),qx=lerp(q0[0],q1[0],p),qy=lerp(q0[1],q1[1],p);
  if(t>=1){setCam(to.k,to.tx,to.ty);done&&done();return false}setCam(k,qx-A[0]*k,qy-A[1]*k)});kick()}
const ctr=o=>[(o.x+o.s.w/2)*U,(o.y+o.s.h/2)*U];
function fadeTo(v,ms,col,delay){if(col)fade.style.background=col;return fade.animate([{opacity:getComputedStyle(fade).opacity},{opacity:v}],{duration:ms,delay:delay||0,easing:'ease-in-out',fill:'forwards'}).finished}

// ---------------- apps (iframes) ----------------
function openApp(url){const f=document.createElement('iframe');f.className='app';f.title=url==GUMBALL_URL?'Gumball machine':url==TV_URL?'TV':'Deck of cards';f.src=url;
 f.loaded=new Promise(res=>f.addEventListener('load',()=>{try{const d=f.contentDocument,st=d.createElement('style');st.textContent='#back{display:none!important}';d.head.appendChild(st);
  if(!d.querySelector('base')){const b=d.createElement('base');b.target='_top';d.head.prepend(b)}
  f.contentWindow.addEventListener('keydown',e=>{if(e.key==='Escape'&&!d.querySelector('[role=dialog]:not([hidden])'))goBack()})}catch(e){}res()},{once:true}));
 document.body.appendChild(f);return f}
function showApp(f){return f.loaded.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))).then(()=>{if(app!==f)return;
 const a=f.animate([{opacity:0},{opacity:1}],{duration:RM.matches?160:320,easing:'ease-out',fill:'forwards'});return a.finished.then(()=>{try{f.contentWindow.focus()}catch(e){}})})}
let cardsOK=null;const cardsCheck=()=>fetch(CARDS_URL,{method:'HEAD',cache:'no-store'}).then(r=>cardsOK=r.ok).catch(()=>cardsOK=false);

function showPlate(o){const[sx,sy,sw,sh]=o.s.screen||[0,0,o.s.F||o.s.w,o.s.h],cx=((o.x+sx+sw/2)*U)*camK+camX,cy=((o.y+sy+sh/2)*U)*camK+camY,u=U*camK;
 plate.style.left=cx+'px';plate.style.top=cy+'px';plate.style.setProperty('--fs',Math.max(11,Math.min(Math.round(u*6.4),Math.floor(W/17)))+'px');plate.style.setProperty('--b',Math.max(2,Math.round(u*1.2))+'px');plate.hidden=false;
 plate.animate(RM.matches?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translate(-50%,-50%) scale(.82)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.06)',offset:.6},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:RM.matches?150:380,easing:'cubic-bezier(.3,.7,.3,1)',fill:'both'})}

// ---------------- orrery interaction (zoomed in): drag/swipe to spin, tap the sun to fly in ----------------
const pad=document.createElement('div');pad.id='pad';pad.hidden=true;document.body.appendChild(pad);
function sunScreen(){const o=O.laverse,[sx,sy,r]=o.s.sun,u=U*camK;return[(o.x+sx)*U*camK+camX,(o.y+sy)*U*camK+camY,r*u]}
function onSun(e){const[x,y,r]=sunScreen();return Math.hypot(e.clientX-x,e.clientY-y)<=r*1.08}
pad.addEventListener('pointerdown',e=>{if(!spin.on||busy)return;pad.setPointerCapture(e.pointerId);spin.drag={id:e.pointerId,x0:e.clientX,y0:e.clientY,x:e.clientX,y:e.clientY,t:performance.now(),moved:0,hist:[]};spin.v=0;kick()});
pad.addEventListener('pointermove',e=>{if(!spin.on)return;const d=spin.drag;
 if(!d||d.id!==e.pointerId){const h=onSun(e);if(h!==spin.hover){spin.hover=h;pad.classList.toggle('sun',h);kick()}return}
 const dx=e.clientX-d.x,dy=e.clientY-d.y,now=performance.now(),R=60*U*camK;d.moved+=Math.abs(dx)+Math.abs(dy);d.x=e.clientX;d.y=e.clientY;
 const da=-dx/R;ORR.rot+=da;spin.tiltT=clamp(spin.tiltT+dy/(R*5),.14,.44);ORR.tilt=lerp(ORR.tilt,spin.tiltT,.5);spin.dirty=true;
 d.hist.push([now,da]);while(d.hist.length&&now-d.hist[0][0]>90)d.hist.shift();d.t=now;if(d.moved>6&&spin.hover){spin.hover=false;pad.classList.remove('sun')}kick()});
const endDrag=e=>{const d=spin.drag;if(!d||d.id!==e.pointerId)return;spin.drag=null;const now=performance.now();
 if(d.moved<8){if(onSun(e))flyToSun();return}
 const h=d.hist.filter(q=>now-q[0]<90);if(!RM.matches&&h.length&&now-d.t<60){const span=Math.max(16,now-h[0][0]);spin.v=clamp(h.reduce((a,q)=>a+q[1],0)/(span/1000),-14,14)}kick()};
pad.addEventListener('pointerup',endDrag);pad.addEventListener('pointercancel',e=>{if(spin.drag&&spin.drag.id===e.pointerId)spin.drag=null});
pad.addEventListener('pointerleave',()=>{if(spin.hover&&!spin.drag){spin.hover=false;pad.classList.remove('sun');kick()}});
addEventListener('keydown',e=>{if(!spin.on||busy)return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){spin.v+=(e.key==='ArrowLeft'?1:-1)*(RM.matches?0:2.2);if(RM.matches){ORR.rot+=e.key==='ArrowLeft'?.3:-.3;spin.dirty=true}kick()}if(e.key==='Enter'||e.key===' '){e.preventDefault();flyToSun()}});
function flyToSun(){if(busy||!spin.on)return;busy=true;spin.on=false;spin.drag=null;spin.hover=false;pad.hidden=true;back.classList.remove('on');
 const o=O.laverse,[sx,sy,r]=o.s.sun,A=[(o.x+sx)*U,(o.y+sy)*U],HUB_BG='#05040c';
 if(RM.matches){history.replaceState(null,'',location.pathname);fadeTo(1,200,HUB_BG).then(()=>{location.href=LAVERSE_URL});return}
 const k=Math.hypot(W,H)*1.6/(2*r*U),to={k,tx:W/2-A[0]*k,ty:H/2-A[1]*k};
 history.replaceState(null,'',location.pathname);tweenCam(A,to,1250,t=>backIn(t,.9),null);fadeTo(1,520,HUB_BG,700).then(()=>{location.href=LAVERSE_URL})}

// ---------------- zoom in / out ----------------
function zoomIn(o){if(busy||zoomed)return;busy=true;zoomed=o;o._arrived=false;objs.forEach(q=>{q.hover=false;q.press=false});document.body.classList.add('zoomed');
 history.pushState({shelf:o.id},'','#'+o.id);
 const rm=RM.matches,to=target(o);let useApp=o.id==='gumball'?GUMBALL_URL:o.id==='tv'?TV_URL:null;
 const proceed=()=>{if(o.id==='cards'&&cardsOK)useApp=CARDS_URL;if(useApp)app=openApp(useApp);
  const arrive=()=>{o._arrived=true;back.hidden=false;requestAnimationFrame(()=>back.classList.add('on'));
   if(o.id==='laverse'){spin.on=true;pad.hidden=false;busy=false;if(!rm)spin.v=-.5;kick();return}
   if(app){const f=app;showApp(f).then(()=>{if(app===f)busy=false})}else{if(o.id==='cards')showPlate(o);busy=false}};
  if(rm){fadeTo(1,140,'#fff').then(()=>{setCam(to.k,to.tx,to.ty);draw();return fadeTo(0,160)}).then(arrive)}
  else tweenCam(ctr(o),to,1050,t=>backIO(t,.85),arrive)};
 if(o.id==='cards'&&!cardsOK)cardsCheck().then(proceed);else proceed()}
function goBack(fromPop){if(!zoomed||zoomed._leaving||(busy&&!zoomed._arrived))return;busy=true;const o=zoomed,rm=RM.matches;o._leaving=true;back.classList.remove('on');
 spin.on=false;spin.drag=null;spin.hover=false;pad.hidden=true;pad.classList.remove('sun');if(ORR.glow){ORR.glow=0;spin.dirty=true}
 if(!fromPop&&history.state&&history.state.shelf)history.back();
 const pl=plate.hidden?Promise.resolve():plate.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}).finished.then(()=>{plate.hidden=true;plate.getAnimations().forEach(a=>a.cancel())});
 const ap=app?app.animate([{opacity:1},{opacity:0}],{duration:rm?140:260,easing:'ease-in',fill:'forwards'}).finished.then(()=>{if(app){app.remove();app=null}}):Promise.resolve();
 Promise.all([pl,ap]).then(()=>{const fin=()=>{o._leaving=false;zoomed=null;busy=false;back.hidden=true;document.body.classList.remove('zoomed');o.btn.focus({preventScroll:true});kick()};
  if(rm){fadeTo(1,120,'#fff').then(()=>{setCam(1,0,0);draw();return fadeTo(0,160)}).then(fin)}else tweenCam(ctr(o),{k:1,tx:0,ty:0},850,t=>backIO(t,.7),fin)})}
back.addEventListener('click',()=>goBack());
addEventListener('keydown',e=>{if(e.key==='Escape')goBack()});
addEventListener('popstate',()=>{if(zoomed)goBack(true)});
addEventListener('pageshow',e=>{if(e.persisted){fade.getAnimations().forEach(a=>a.cancel());tick.length=0;if(zoomed){zoomed=null;busy=false;spin.on=false;pad.hidden=true;setCam(1,0,0);back.hidden=true;back.classList.remove('on');document.body.classList.remove('zoomed')}busy=false;kick()}});
addEventListener('resize',()=>{if(!ready)return;layout();if(zoomed){const t=target(zoomed);setCam(t.k,t.tx,t.ty);if(!plate.hidden)showPlate(zoomed)}});

// ---------------- boot ----------------
Promise.all([load('img/gumball.png'),load('img/cards.png'),...ORB.map(o=>load('img/'+o[0]+'.png'))]).then(([gum,cbox,...pl])=>{
 const im={};ORB.forEach((o,i)=>{const p=pl[i];if(!p)return;const c=mk(p.width,p.height);c.x.drawImage(p,0,0);const d=c.x.getImageData(0,0,c.w,c.h),r=Math.min(c.w,c.h)*.42+.3;
  for(let y=0;y<c.h;y++)for(let X=0;X<c.w;X++)if(Math.hypot(X+.5-c.w/2,y+.5-c.h/2)>r)d.data[(y*c.w+X)*4+3]=0;c.x.putImageData(d,0,0);im[o[0]]=c.c});
 const gs=mk(gum.width,gum.height);gs.x.drawImage(gum,0,0);O.gumball.s=gs;O.cards.s=cardBox(cbox);O.laverse.s=orrery(im);O.tv.s=tv();
 for(const k in O){const o=O[k];o.id=k;const b=document.createElement('button');b.type='button';b.className='hit';b.setAttribute('aria-label',o.label);o.btn=b;hits.appendChild(b);
  b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!zoomed){o.hover=true;kick()}});b.addEventListener('pointerleave',()=>{o.hover=false;o.press=false;kick()});
  b.addEventListener('pointerdown',()=>{if(!zoomed){o.press=true;kick()}});b.addEventListener('pointerup',()=>{o.press=false;kick()});
  b.addEventListener('focus',()=>{if(b.matches(':focus-visible')){o.hover=true;kick()}});b.addEventListener('blur',()=>{o.hover=false;kick()});
  b.addEventListener('click',()=>zoomIn(o))}
 ready=true;layout();kick();
 const h=location.hash.slice(1);if(O[h]&&O[h].s){history.replaceState(null,'',location.pathname);setTimeout(()=>zoomIn(O[h]),200)}});
window.__shelf={O,ORR,spin,get zoomed(){return zoomed&&zoomed.id},get busy(){return busy},get cam(){return[camK,camX,camY]},get U(){return U},target,sunScreen,get info(){return layout.info}};
})();

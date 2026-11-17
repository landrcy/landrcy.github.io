/* Landry's shelf: a pixel-art shelf with four objects. Everything is drawn into one low-res canvas (1 unit = 1 art pixel),
   upscaled by an integer PX with image-rendering:pixelated. The "camera" is a CSS transform on that canvas. */
(()=>{'use strict';
const LAVERSE_URL='/';           // the solar hub (the root will later become the shelf; change this then)
const GUMBALL_URL='/gumball/', CARDS_URL='/cards/';
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
// GUMBALL: a frame rendered by the live /gumball/ page itself at PX=2 (220x344 viewport), so it matches exactly.
// Crop origin inside that frame (art px) and the page's layout numbers for that viewport, used to line up the hand-off.
const GB={cx0:33,cy0:26,S0:(344-52-92)/720,OX0:110,OY0:96};
function gumLayout(W,H){const top=Math.max(52,H*.06),bot=Math.max(92,H*.12),avail=H-top-bot,S=Math.min(avail/720,W*.9/330,1.5),P=Math.max(2,Math.round(720*S/300));
 return{S,OX:Math.round(W/2/P)*P,OY:Math.round((top+(avail-720*S)/2+158*S)/P)*P}}

// CARD BOX: an upright golden tuck box, filigree border, jewels, a cursive L on a burgundy cartouche
const LBM=['......XXXX..','.....X....X.','....X.....X.','....X....X..','...X...XX...','...X........','..X.........','..X.........','.X.........X','.X........X.','XXX......X..','X..XXXXXX...','.XX.........'];
function cardBox(){const W=34,H=46,s=mk(W,H),x=s.x,F=28; // front face width F, side face 4px + outline
 const gold=new Set();const P=(X,Y,c,isG)=>{px(x,X,Y,c);if(isG)gold.add(X+','+Y)};
 // side face (depth)
 for(let y=3;y<H-1;y++)for(let X=F;X<F+4;X++){if(y<3+(X-F))continue;P(X,y,X===F+3?GD[0]:y<8?GD[2]:GD[1])}
 for(let X=F;X<F+4;X++)P(X,2+(X-F),GD[0]);
 // front face
 for(let y=1;y<H-1;y++)for(let X=1;X<F;X++){const v=X<F*.4?4:X<F*.75?3:3;let c=GD[v];if(y<9)c=GD[v===4?3:2];if(X===1)c=GD[5];P(X,y,c,true)}
 for(let X=1;X<F;X++){P(X,1,GD[5],true)}
 // outline
 for(let X=0;X<=F;X++){px(x,X,0,GD[0]);px(x,X,H-1,GD[0])}for(let y=0;y<H;y++){px(x,0,y,GD[0]);px(x,F,y,GD[0])}
 for(let X=F;X<F+4;X++)px(x,X,H-1,GD[0]);
 // tuck flap: a curved tuck line near the top
 for(let X=2;X<F-1;X++){const y=8-Math.round(2*Math.sin(Math.PI*(X-2)/(F-4)));P(X,y,GD[1]);if(y+1<9)P(X,y+1,GD[5],true)}
 // inner border + filigree dots
 const bx0=3,by0=10,bx1=F-3,by1=H-4;
 for(let X=bx0;X<=bx1;X++){P(X,by0,GD[1]);P(X,by1,GD[1]);if((X&1)===0){P(X,by0+2,GD[6],true);P(X,by1-2,GD[6],true)}else{P(X,by0+2,GD[2]);P(X,by1-2,GD[2])}}
 for(let y=by0;y<=by1;y++){P(bx0,y,GD[1]);P(bx1,y,GD[1]);if(y>by0+2&&y<by1-2){if((y&1)===0){P(bx0+2,y,GD[6],true);P(bx1-2,y,GD[6],true)}else{P(bx0+2,y,GD[2]);P(bx1-2,y,GD[2])}}}
 // corner scrolls
 const scroll=(X,Y,sx,sy)=>{[[0,0],[1,0],[2,0],[0,1],[0,2],[2,1],[1,2]].forEach(([a,b])=>P(X+a*sx,Y+b*sy,GD[1]))};
 scroll(bx0+1,by0+1,1,1);scroll(bx1-1,by0+1,-1,1);scroll(bx0+1,by1-1,1,-1);scroll(bx1-1,by1-1,-1,-1);
 // cartouche (oval)
 const ccx=F/2+.5,ccy=(by0+by1)/2+.5,rx=8.6,ry=11.2;
 for(let y=by0+3;y<by1-2;y++)for(let X=bx0+3;X<bx1-2;X++){const d=Math.hypot((X+.5-ccx)/rx,(y+.5-ccy)/ry);
  if(d<=1){const rim=d>.86;P(X,y,rim?(d>.94?GD[0]:GD[5]):(d>.78&&((X+y)&1)?'#7a1424':'#5a0e1a'),rim&&d<=.94)}}
 // filigree flourishes above/below the cartouche
 // cursive L
 const lx=Math.round(ccx-6),ly=Math.round(ccy-6.5);LBM.forEach((r,j)=>[...r].forEach((ch,i)=>{if(ch==='X'){P(lx+i,ly+j,i<5&&j<6?GD[6]:GD[5],true);if(lx+i+1<F&&LBM[j][i+1]!=='X')px(x,lx+i+1,ly+j+1,'#2a0610')}}));
 // jewels: rubies top/bottom of the cartouche, sapphires in the corners, emeralds on the sides
 const gem=(X,Y,c)=>{px(x,X-1,Y-1,c[1],3,3);px(x,X,Y-1,c[0]);px(x,X-1,Y,c[0]);px(x,X-1,Y-1,c[2]);px(x,X+1,Y+1,GD[0])};
 const RUBY=['#ff3a4a','#b0121a','#ffd0d4'],SAPH=['#3fa0ff','#1a4aa8','#dff4ff'],EMER=['#3ad870','#126a30','#d8ffe4'];
 gem(Math.round(ccx)-1,by0+2,RUBY);gem(Math.round(ccx)-1,by1-2,RUBY);
 gem(bx0+4,by0+4,SAPH);gem(bx1-4,by0+4,SAPH);gem(bx0+4,by1-4,SAPH);gem(bx1-4,by1-4,SAPH);
 gem(bx0+2,Math.round(ccy)-1,EMER);gem(bx1-2,Math.round(ccy)-1,EMER);
 gem(Math.round(ccx)-1,4,RUBY);
 // gold pixels the glint may sweep over
 const gl=[];gold.forEach(k=>{const[a,b]=k.split(',').map(Number);const d=x.getImageData(a,b,1,1).data;if(d[0]>180&&d[1]>110&&d[2]<150)gl.push([a,b])});
 return{...s,glint:gl,F}}

// RETRO TV: gold casing, gold dial, gold antenna
function tv(){const W=56,H=50,s=mk(W,H),x=s.x,y0=12;
 // antenna
 const ant=(x1,y1)=>{line(x,26,y0-2,x1,y1,GD[2]);line(x,27,y0-2,x1+1,y1,GD[4]);px(x,x1-1,y1-1,GD[1],3,3);px(x,x1,y1-1,GD[5]);px(x,x1-1,y1,GD[4]);px(x,x1,y1,GD[4])};
 ant(13,2);ant(41,1);
 for(let X=22;X<=31;X++){const h=Math.round(3*Math.sqrt(Math.max(0,1-((X-26.5)/5)**2)));for(let k=0;k<=h;k++)px(x,X,y0-k,k===h?GD[0]:X<26?GD[5]:GD[3])}
 // casing
 const cx0=1,cy0=y0,cw=54,ch=33;
 for(let y=cy0;y<cy0+ch;y++)for(let X=cx0;X<cx0+cw;X++){const ex=Math.min(X-cx0,cx0+cw-1-X),ey=Math.min(y-cy0,cy0+ch-1-y);if(ex+ey<2)continue;
  let c=y<cy0+2?GD[5]:y>cy0+ch-4?GD[2]:X<cx0+3?GD[5]:GD[4];if(y>cy0+ch*.55&&c===GD[4])c=GD[3];if(ex===0||ey===0||ex+ey===2)c=GD[0];px(x,X,y,c)}
 // screen
 const sx=5,sy=cy0+4,sw=34,sh=25;
 for(let y=sy-1;y<sy+sh+1;y++)for(let X=sx-1;X<sx+sw+1;X++){const ex=Math.min(X-sx+1,sx+sw-X),ey=Math.min(y-sy+1,sy+sh-y);if(ex+ey<3)continue;
  let c;if(ex===0||ey===0||ex+ey===3)c=y<sy+2?GD[1]:GD[1];else if(ex===1||ey===1||ex+ey===4)c=y<sy+sh/2?GD[0]:GD[6];else{const u=(X-sx)/sw-.5,v=(y-sy)/sh-.5,d=u*u+v*v;
   c=d>.3?GL[7]:d>.16?'#46506a':'#525d78';if((y&1)&&c!==GL[7])c=c==='#525d78'?'#4a5570':'#404a62'}
  px(x,X,y,c)}
 // CRT glare
 [[sx+3,sy+3],[sx+4,sy+3],[sx+5,sy+3],[sx+6,sy+3],[sx+3,sy+4],[sx+3,sy+5],[sx+3,sy+6]].forEach(([a,b],i)=>px(x,a,b,i<4?GL[4]:GL[5]));px(x,sx+8,sy+3,GL[5]);
 // dial + knob + grille
 const dx=46,dy=sy+6;
 disc(x,dx,dy,4,(X,Y,a,b,d)=>px(x,X,Y,d>3.4?GD[0]:a+b<-2?GD[6]:a+b<1?GD[5]:a+b<4?GD[4]:GD[2]));
 px(x,dx,dy-3,GD[0],1,3);px(x,dx-1,dy-1,GD[1]);
 for(let k=0;k<12;k++){const a=k/12*Math.PI*2;px(x,Math.round(dx+Math.cos(a)*6),Math.round(dy+Math.sin(a)*6),k%3===0?GD[1]:GD[3])}
 disc(x,dx,dy+11,2,(X,Y,a,b,d)=>px(x,X,Y,d>1.7?GD[0]:a+b<0?GD[6]:GD[3]));
 for(let k=0;k<3;k++){px(x,dx-3,dy+16+k*2,GD[1],7,1);px(x,dx-3,dy+17+k*2,GD[5],7,1)}
 // legs
 const leg=X=>{px(x,X,cy0+ch,GD[0],4,1);px(x,X,cy0+ch+1,GD[0],1,3);px(x,X+3,cy0+ch+1,GD[0],1,3);px(x,X+1,cy0+ch+1,GD[4],2,2);px(x,X+1,cy0+ch+3,GD[2],2,1);px(x,X,cy0+ch+4,GD[0],4,1)};
 leg(7);leg(45);
 s.screen=[sx,sy,sw,sh];return s}

// LAVERSE ORRERY: a gold desk model. Sun on a gold post, planets on gold arms + rods, Cooper City on the outermost arm.
const ORB=[['ashaad',7,-1.2,24],['sea',12,2.8,14],['pmuseum',16,-.35,27],['typefall',21,2.3,7],['void',25,-2.75,31],['gow',30,.25,17]];
function orrery(im){const W=76,H=72,s=mk(W,H),x=s.x,cx=37,hy=60; // hub (arm root) height
 const items=ORB.map(([id,r,a,h])=>{const X=cx+Math.cos(a)*r,Y=hy+Math.sin(a)*r*.26;return{id,X,Y,h,z:Math.sin(a)}});
 const drawArm=o=>{line(x,cx,hy,o.X,o.Y,GD[2]);line(x,cx,hy-1,o.X,o.Y-1,GD[4]);
  const top=Math.round(o.Y-1-o.h);px(x,Math.round(o.X),top,GD[3],1,Math.round(o.Y)-top);px(x,Math.round(o.X)+1,top+3,GD[1],1,Math.round(o.Y)-top-3);
  px(x,Math.round(o.X)-1,Math.round(o.Y)-1,GD[5],3,1);px(x,Math.round(o.X)-1,Math.round(o.Y),GD[1],3,1);
  const p=im[o.id];if(p){const bw=p.width,bh=p.height;x.drawImage(p,Math.round(o.X-bw/2+.5),Math.round(top-bh/2-1))}};
 // base: stepped gold ellipse
 const base=(rw,rh,y,cols)=>{for(let yy=-rh;yy<=rh;yy++)for(let X=-rw;X<=rw;X++){const d=(X/rw)**2+(yy/rh)**2;if(d>1)continue;const c=d>.8?cols[0]:yy<0?(X<0?cols[3]:cols[2]):cols[1];px(x,cx+X,y+yy,c)}};
 base(15,3,H-4,[GD[0],GD[2],GD[4],GD[5]]);base(9,2,H-7,[GD[0],GD[3],GD[5],GD[6]]);
 items.filter(o=>o.z<0).sort((a,b)=>a.Y-b.Y).forEach(drawArm);
 // post
 for(let y=14;y<H-7;y++){px(x,cx-1,y,GD[0]);px(x,cx,y,GD[5]);px(x,cx+1,y,GD[3]);px(x,cx+2,y,GD[0])}
 px(x,cx-2,hy-1,GD[0],5,3);px(x,cx-1,hy-1,GD[6],2,1);px(x,cx-1,hy,GD[4],3,1);px(x,cx+1,hy-1,GD[3]);
 // sun
 const sun=im.sun;if(sun)x.drawImage(sun,cx-Math.floor(sun.width/2)+1,2);
 items.filter(o=>o.z>=0).sort((a,b)=>a.Y-b.Y).forEach(drawArm);
 return s}

// ---------------- scene / layout ----------------
let W=0,H=0,PX=4,lw=0,lh=0,objs=[],shelves=[],ready=false;
const O={gumball:{label:'Gumball machine'},cards:{label:'Deck of cards'},laverse:{label:'The Laverse'},tv:{label:'TV'}};
function layout(){W=innerWidth;H=innerHeight;const two=W/H<.9,gap=two?6:15,pad=two?3:10;
 const rows=two?[['gumball','tv'],['cards','laverse']]:[['gumball','cards','laverse','tv']];
 const rw=rows.map(r=>r.reduce((a,k)=>a+O[k].s.w,0)+gap*(r.length-1)),rh=rows.map(r=>Math.max(...r.map(k=>O[k].s.h)));
 const needW=Math.max(...rw)+pad*2+2,needH=rh.reduce((a,b)=>a+b+12,0)+(rows.length-1)*14;
 PX=Math.max(1,Math.floor(Math.min(W*(two?.96:.88)/needW,H*(two?.8:.62)/needH)));lw=Math.ceil(W/PX);lh=Math.ceil(H/PX);
 cv.width=lw;cv.height=lh;cv.style.width=lw*PX+'px';cv.style.height=lh*PX+'px';
 let y=Math.round((lh-needH)/2+(two?0:lh*.03));objs=[];shelves=[];
 rows.forEach((r,i)=>{const top=y+rh[i];let X=Math.round((lw-rw[i])/2);shelves.push({x0:Math.round((lw-rw[i])/2)-pad,x1:Math.round((lw+rw[i])/2)+pad,y:top});
  r.forEach(k=>{const o=O[k];o.id=k;o.x=X;o.y=top-o.s.h+1;objs.push(o);X+=o.s.w+gap});y=top+12+14});
 placeHits();draw()}
function drawShelf(sh){const{x0,x1,y}=sh;
 // brackets
 [x0+6,x1-12].forEach(bx=>{for(let k=0;k<6;k++){const w=6-k;px(g,bx,y+5+k,GD[0],w,1);if(w>2)px(g,bx+1,y+5+k,k<1?GD[4]:GD[3],w-2,1);if(w>3)px(g,bx+1,y+5+k,GD[5])}});
 px(g,x0,y,GD[6],x1-x0,1);px(g,x0,y+1,GD[5],x1-x0,1);px(g,x0,y+2,GD[4],x1-x0,1);px(g,x0,y+3,GD[3],x1-x0,1);px(g,x0,y+4,GD[1],x1-x0,1);
 px(g,x0-1,y,GD[0],1,5);px(g,x1,y,GD[0],1,5);px(g,x0,y-1,GD[3],x1-x0,1);px(g,x0+1,y+5,GL[2],x1-x0-2,1)}
let glintT=0;
function draw(){g.setTransform(1,0,0,1,0,0);g.fillStyle='#fff';g.fillRect(0,0,lw,lh);if(!ready)return;
 shelves.forEach(drawShelf);
 for(const o of objs){const L=Math.round(o.lift||0),sw=Math.max(2,o.s.w-6-L*2);
  // contact shadow on the shelf top, shrinks as the object lifts
  px(g,o.x+Math.round((o.s.w-sw)/2)-(o.id==='cards'?2:0),o.y+o.s.h-1,L?GD[4]:GD[3],sw,1);
  g.drawImage(o.s.c,o.x,o.y-L);
  if(o.id==='cards'&&glintT>0){const q=glintT,F=o.s.F,pos=lerp(-14,F+30,q);for(const[a,b]of o.s.glint){const d=a+b*.5-pos;if(d>-1.5&&d<1.5)px(g,o.x+a,o.y-L+b,Math.abs(d)<.6?GD[6]:GD[5])}}}}
function placeHits(){for(const o of objs){const b=o.btn;b.style.left=o.x*PX+'px';b.style.top=(o.y-3)*PX+'px';b.style.width=o.s.w*PX+'px';b.style.height=(o.s.h+3)*PX+'px'}}

// ---------------- hover lifts (tactile spring) ----------------
let raf=0;const tick=[];function loop(){raf=0;const now=performance.now();let more=false;
 for(const o of objs){const tgt=o.press?0.6:o.hover?2.4:0;o.v=(o.v||0)+((tgt-(o.lift||0))*420-(o.v||0)*30)/60;o.lift=(o.lift||0)+o.v/60;if(Math.abs(o.v)>.01||Math.abs(tgt-o.lift)>.01)more=true;else{o.lift=tgt;o.v=0}}
 // glint sweep on the card box every ~4.5s
 if(!RM.matches&&!zoomed){const ph=(now%4500)/900;glintT=ph<1?ph:0;more=true}else glintT=0;
 for(let i=tick.length-1;i>=0;i--)if(tick[i](now)===false)tick.splice(i,1);
 if(tick.length)more=true;draw();if(more)raf=requestAnimationFrame(loop)}
const kick=()=>{if(!raf)raf=requestAnimationFrame(loop)};

// ---------------- camera ----------------
let camK=1,camX=0,camY=0,zoomed=null,busy=false,app=null;
function setCam(k,tx,ty){camK=k;camX=tx;camY=ty;cam.style.transform=`translate3d(${tx}px,${ty}px,0) scale(${k})`}
// target framing for an object: {k,tx,ty}
function target(o){if(o.id==='gumball'){const L=gumLayout(W,H),r=L.S/GB.S0,k=2*r/PX;
  return{k,tx:((GB.cx0*2-GB.OX0)*r+L.OX)-o.x*PX*k,ty:((GB.cy0*2-GB.OY0)*r+L.OY)-o.y*PX*k}}
 const fw=o.id==='tv'?.78:.72,k=Math.min(W*fw/(o.s.w*PX),H*.72/(o.s.h*PX)),cx=(o.x+o.s.w/2)*PX,cy=(o.y+o.s.h/2)*PX;
 return{k,tx:W/2-cx*k,ty:H/2-cy*k}}
// ease in-out with a little anticipation and overshoot (back), then a settle
function backIO(t,c){const c2=c*1.525;return t<.5?(Math.pow(2*t,2)*((c2+1)*2*t-c2))/2:(Math.pow(2*t-2,2)*((c2+1)*(t*2-2)+c2)+2)/2}
function tweenCam(o,to,dur,c,done){const A=[(o.x+o.s.w/2)*PX,(o.y+o.s.h/2)*PX],k0=camK,q0=[A[0]*k0+camX,A[1]*k0+camY],q1=[A[0]*to.k+to.tx,A[1]*to.k+to.ty],t0=performance.now();
 tick.push(now=>{const t=clamp((now-t0)/dur),p=backIO(t,c),k=k0*Math.pow(to.k/k0,p),qx=lerp(q0[0],q1[0],p),qy=lerp(q0[1],q1[1],p);
  if(t>=1){setCam(to.k,to.tx,to.ty);done&&done();return false}setCam(k,qx-A[0]*k,qy-A[1]*k)});kick()}
function fadeTo(v,ms){return fade.animate([{opacity:getComputedStyle(fade).opacity},{opacity:v}],{duration:ms,easing:'ease-in-out',fill:'forwards'}).finished}

// ---------------- apps (iframes) ----------------
function openApp(url){const f=document.createElement('iframe');f.className='app';f.title=url==GUMBALL_URL?'Gumball machine':'Deck of cards';f.src=url;
 f.loaded=new Promise(res=>f.addEventListener('load',()=>{try{const d=f.contentDocument,st=d.createElement('style');st.textContent='#back{display:none!important}';d.head.appendChild(st);
  if(!d.querySelector('base')){const b=d.createElement('base');b.target='_top';d.head.prepend(b)}
  f.contentWindow.addEventListener('keydown',e=>{if(e.key==='Escape'&&!d.querySelector('[role=dialog]:not([hidden])'))goBack()})}catch(e){}res()},{once:true}));
 document.body.appendChild(f);return f}
function showApp(f){return f.loaded.then(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))).then(()=>{if(app!==f)return;
 const a=f.animate([{opacity:0},{opacity:1}],{duration:RM.matches?160:320,easing:'ease-out',fill:'forwards'});return a.finished.then(()=>{try{f.contentWindow.focus()}catch(e){}})})}

let cardsOK=null;const cardsCheck=()=>fetch(CARDS_URL,{method:'HEAD',cache:'no-store'}).then(r=>cardsOK=r.ok).catch(()=>cardsOK=false);

function showPlate(o){const[sx,sy,sw,sh]=o.s.screen||[0,0,o.s.F||o.s.w,o.s.h],cx=((o.x+sx+sw/2)*PX)*camK+camX,cy=((o.y+sy+sh/2)*PX)*camK+camY,u=PX*camK;
 plate.style.left=cx+'px';plate.style.top=cy+'px';plate.style.setProperty('--fs',Math.max(11,Math.min(Math.round(u*3.2),Math.floor(W/17)))+'px');plate.style.setProperty('--b',Math.max(2,Math.round(u*.6))+'px');plate.hidden=false;
 plate.animate(RM.matches?[{opacity:0},{opacity:1}]:[{opacity:0,transform:'translate(-50%,-50%) scale(.82)'},{opacity:1,transform:'translate(-50%,-50%) scale(1.06)',offset:.6},{opacity:1,transform:'translate(-50%,-50%) scale(1)'}],{duration:RM.matches?150:380,easing:'cubic-bezier(.3,.7,.3,1)',fill:'both'})}

function zoomIn(o){if(busy||zoomed)return;busy=true;zoomed=o;o.hover=false;o.press=false;document.body.classList.add('zoomed');
 if(o.id!=='laverse')history.pushState({shelf:o.id},'','#'+o.id);
 const rm=RM.matches,to=target(o);
 let useApp=o.id==='gumball'?GUMBALL_URL:null;
 const proceed=()=>{if(o.id==='cards'&&cardsOK)useApp=CARDS_URL;if(useApp)app=openApp(useApp);
  const arrive=()=>{back.hidden=false;requestAnimationFrame(()=>back.classList.add('on'));
   if(o.id==='laverse'){fadeTo(1,rm?120:380).then(()=>{location.href=LAVERSE_URL});return}
   if(app)showApp(app).then(()=>{busy=false});else{if(o.id==='tv'||o.id==='cards')showPlate(o);busy=false}};
  if(rm){fadeTo(1,140).then(()=>{setCam(to.k,to.tx,to.ty);draw();return fadeTo(0,160)}).then(arrive)}
  else tweenCam(o,to,o.id==='laverse'?1150:1050,.85,arrive)};
 if(o.id==='cards'&&!cardsOK)cardsCheck().then(proceed);else proceed()}
function goBack(fromPop){if(!zoomed||busy)return;busy=true;const o=zoomed,rm=RM.matches;back.classList.remove('on');
 if(!fromPop&&history.state&&history.state.shelf)history.back();
 const pl=plate.hidden?Promise.resolve():plate.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}).finished.then(()=>{plate.hidden=true;plate.getAnimations().forEach(a=>a.cancel())});
 const ap=app?app.animate([{opacity:1},{opacity:0}],{duration:rm?140:260,easing:'ease-in',fill:'forwards'}).finished.then(()=>{app.remove();app=null}):Promise.resolve();
 Promise.all([pl,ap]).then(()=>{const fin=()=>{zoomed=null;busy=false;back.hidden=true;document.body.classList.remove('zoomed');o.btn.focus({preventScroll:true});kick()};
  if(rm){fadeTo(1,120).then(()=>{setCam(1,0,0);draw();return fadeTo(0,160)}).then(fin)}else tweenCam(o,{k:1,tx:0,ty:0},850,.7,fin)})}
back.addEventListener('click',()=>goBack());
addEventListener('keydown',e=>{if(e.key==='Escape')goBack()});
addEventListener('popstate',()=>{if(zoomed)goBack(true)});
addEventListener('pageshow',e=>{if(e.persisted){fade.getAnimations().forEach(a=>a.cancel());if(zoomed){const o=zoomed;zoomed=null;busy=false;setCam(1,0,0);back.hidden=true;back.classList.remove('on');document.body.classList.remove('zoomed');kick()}}});
addEventListener('resize',()=>{layout();if(zoomed){const t=target(zoomed);setCam(t.k,t.tx,t.ty);if(!plate.hidden)showPlate(zoomed)}});

// ---------------- boot ----------------
Promise.all([load('img/gumball.png'),load('img/sun20.png'),...ORB.map(o=>load('img/'+o[0]+'.png'))]).then(([gum,sun,...pl])=>{
 const im={sun};ORB.forEach((o,i)=>im[o[0]]=pl[i]);
 const gs=mk(gum.width,gum.height);gs.x.drawImage(gum,0,0);O.gumball.s=gs;O.cards.s=cardBox();O.laverse.s=orrery(im);O.tv.s=tv();
 for(const k in O){const o=O[k];o.id=k;const b=document.createElement('button');b.type='button';b.className='hit';b.setAttribute('aria-label',o.label);o.btn=b;hits.appendChild(b);
  b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'){o.hover=true;kick()}});b.addEventListener('pointerleave',()=>{o.hover=false;o.press=false;kick()});
  b.addEventListener('pointerdown',()=>{o.press=true;kick()});b.addEventListener('pointerup',()=>{o.press=false;kick()});
  b.addEventListener('focus',()=>{if(b.matches(':focus-visible')){o.hover=true;kick()}});b.addEventListener('blur',()=>{o.hover=false;kick()});
  b.addEventListener('click',()=>zoomIn(o))}
 ready=true;layout();kick();
 const h=location.hash.slice(1);if(O[h]&&O[h].s&&h!=='laverse'){history.replaceState(null,'',location.pathname);setTimeout(()=>zoomIn(O[h]),200)}});
window.__shelf={O,get zoomed(){return zoomed&&zoomed.id},get busy(){return busy},get cam(){return[camK,camX,camY]},get PX(){return PX},target};
})();

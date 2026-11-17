/* Landry's shelf: a pixel-art shelf with four objects. Everything is drawn into one low-res canvas (1 unit = 1 art pixel),
   upscaled by a whole number of device pixels (U css px per art px) with image-rendering:pixelated. The "camera" is a CSS transform on that canvas. */
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
// GUMBALL: a frame rendered by the live /gumball/ page itself at PX=2 (300x544 viewport), so it matches exactly.
// Crop origin inside that frame (art px) and the page's layout numbers for that viewport, used to line up the hand-off.
const GB={cx0:31,cy0:28,S0:(544-52-92)/720,OX0:150,OY0:140};
function gumLayout(W,H){const top=Math.max(52,H*.06),bot=Math.max(92,H*.12),avail=H-top-bot,S=Math.min(avail/720,W*.9/330,1.5),P=Math.max(2,Math.round(720*S/300));
 return{S,OX:Math.round(W/2/P)*P,OY:Math.round((top+(avail-720*S)/2+158*S)/P)*P}}

// CARD BOX: an upright golden tuck box: gold filigree border, corner fans, jewel inlays, a cursive L on a burgundy cartouche
function cardBox(){const F=58,D=8,W=F+D+1,H=92,s=mk(W,H),x=s.x,gold=[];const P=(X,Y,c,gl)=>{px(x,X,Y,c);if(gl)gold.push([X,Y])};
 // side face (oblique)
 for(let X=F+1;X<=F+D;X++){const t=X-F;px(x,X,t,GD[0]);for(let y=t+1;y<H-1;y++)px(x,X,y,X===F+D?GD[0]:y<t+3?GD[3]:y>H-6?GD[0+1]:(X-F)%3===0&&y>24&&y<H-10?GD[1]:GD[2]);px(x,X,H-1,GD[0])}
 // front face
 for(let y=1;y<H-1;y++)for(let X=1;X<F;X++){const u=X/F;let c=u<.1?GD[5]:u<.58?GD[4]:GD[3];if(y>H-7)c=u<.1?GD[4]:GD[2];if(y<17)c=u<.1?GD[4]:u<.58?GD[3]:GD[2];P(X,y,c,true)}
 for(let X=1;X<F;X++)P(X,1,GD[6],true);
 for(let X=0;X<=F;X++){px(x,X,0,GD[0]);px(x,X,H-1,GD[0])}for(let y=0;y<H;y++){px(x,0,y,GD[0]);px(x,F,y,GD[0])}
 // tuck flap curve + thumb notch
 for(let X=2;X<F-1;X++){const yc=16-Math.round(4*Math.sin(Math.PI*(X-2)/(F-4)));P(X,yc,GD[1]);P(X,yc+1,GD[6],true);P(X,yc+2,GD[5],true)}
 for(let X=-6;X<=6;X++){const d=Math.round(3*Math.sqrt(1-(X/6.5)**2));for(let y=1;y<=d;y++)px(x,F/2+X,y,y===d?GD[0]:GD[1])}
 // inner border with filigree band
 const bx0=6,by0=20,bx1=F-6,by1=H-7;const rect=(i,c,c2)=>{for(let X=bx0+i;X<=bx1-i;X++){P(X,by0+i,c);P(X,by1-i,c2||c)}for(let y=by0+i;y<=by1-i;y++){P(bx0+i,y,c);P(bx1-i,y,c2||c)}};
 rect(0,GD[1]);rect(1,GD[5],GD[2]);rect(5,GD[1]);rect(6,GD[2],GD[5]);
 const band=(X,Y,k)=>{const p=k%6;if(p===0){P(X,Y,GD[6],true)}else if(p===3){P(X,Y-1,GD[1]);P(X,Y+1,GD[1]);P(X-1,Y,GD[1]);P(X+1,Y,GD[1]);P(X,Y,GD[6],true)}};
 for(let X=bx0+4;X<=bx1-4;X++){band(X,by0+3,X-bx0);band(X,by1-3,X-bx0)}for(let y=by0+6;y<=by1-6;y++){band(bx0+3,y,y-by0);band(bx1-3,y,y-by0)}
 // corner fans
 const fan=(X0,Y0,sx,sy)=>{for(let a=0;a<=12;a++){const t=a/12*Math.PI/2;for(const[r,c]of[[5,GD[1]],[8,GD[1]]])P(Math.round(X0+sx*Math.cos(t)*r),Math.round(Y0+sy*Math.sin(t)*r),c);P(Math.round(X0+sx*Math.cos(t)*6.5),Math.round(Y0+sy*Math.sin(t)*6.5),a%3?GD[5]:GD[6],true)}};
 fan(bx0+7,by0+7,1,1);fan(bx1-7,by0+7,-1,1);fan(bx0+7,by1-7,1,-1);fan(bx1-7,by1-7,-1,-1);
 // cartouche
 const ccx=F/2,ccy=Math.round((by0+by1)/2),rx=14.5,ry=20.5;
 for(let y=-22;y<=22;y++)for(let X=-16;X<=16;X++){const d=Math.hypot((X+.5)/rx,(y+.5)/ry);if(d>1)continue;const ang=Math.atan2(y,X);let c,gl=false;
  if(d>.95)c=GD[0];else if(d>.87){c=Math.floor((ang+Math.PI)/(Math.PI*2)*36)%2?GD[6]:GD[3];gl=true}else if(d>.83)c=GD[1];
  else{c='#5a0e1a';if(d>.72&&((X+y)&1))c='#7a1424';if(d<.55&&X+y<-6)c='#6a1220';if(d>.78)c='#3a0812'}P(ccx+X,ccy+y,c,gl)}
 // cursive L (cubic beziers), 2px stroke with highlight and drop shadow
 const LP=[[[2,-5],[-5,-9],[1,-19],[7,-14]],[[7,-14],[11,-10],[3,-9],[1,-4]],[[1,-4],[-1,2],[-3,8],[-6,11]],[[-6,11],[-10,15],[-3,16],[0,12]],[[0,12],[3,9],[6,14],[10,11]]];
 const bz=(p,t)=>{const u=1-t;return[0,1].map(i=>u*u*u*p[0][i]+3*u*u*t*p[1][i]+3*u*t*t*p[2][i]+t*t*t*p[3][i])};
 const pts=[];LP.forEach(seg=>{for(let i=0;i<=60;i++){const[a,b]=bz(seg,i/60);pts.push([Math.round(ccx+a),Math.round(ccy+b)])}});
 pts.forEach(([a,b])=>{px(x,a+1,b+1,'#2a0610',2,2)});pts.forEach(([a,b])=>{P(a,b,GD[4],true);P(a+1,b,GD[4],true);P(a,b+1,GD[3]);P(a+1,b+1,GD[3])});pts.forEach(([a,b])=>P(a,b,GD[6],true));
 // jewels
 const gem=(X,Y,c)=>{for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const m=Math.abs(dx)+Math.abs(dy);if(m>3)continue;let col;if(m===3)col=GD[1];else if(m===2)col=dx+dy<0?c[0]:c[2];else col=c[1];if(dx===-1&&dy===-1)col=c[3];if(dx===0&&dy===-2)col=c[3];px(x,X+dx,Y+dy,col)}};
 const RUBY=['#ff3a4a','#d81c24','#7a0610','#ffd0d4'],SAPH=['#3fa0ff','#1a64d0','#0e2a6a','#dff4ff'],EMER=['#3ad870','#1a9a40','#0a4a1e','#d8ffe4'];
 gem(ccx,ccy-ry-3,RUBY);gem(ccx,ccy+ry+3,RUBY);gem(ccx,8,RUBY);
 gem(bx0+11,by0+11,SAPH);gem(bx1-11,by0+11,SAPH);gem(bx0+11,by1-11,SAPH);gem(bx1-11,by1-11,SAPH);
 gem(bx0+4+3,ccy,EMER);gem(bx1-4-3,ccy,EMER);
 const gl=gold.filter(([a,b])=>{const d=x.getImageData(a,b,1,1).data;return d[0]>180&&d[1]>110&&d[2]<160});
 return{...s,glint:gl,F}}

// RETRO TV: gold casing, gold dial, gold antenna
function tv(){const W=112,H=100,s=mk(W,H),x=s.x;
 const ball=(X,Y)=>disc(x,X,Y,3,(a,b,dx,dy,d)=>px(x,a,b,d>2.6?GD[0]:dx+dy<-1?GD[6]:dx+dy<1?GD[5]:GD[3]));
 const rod=(x0,y0,x1,y1)=>{line(x,x0,y0,x1,y1,GD[2]);line(x,x0,y0-1,x1,y1-1,GD[5]);line(x,x0+1,y0,x1+1,y1,GD[1])};
 rod(52,20,24,5);rod(60,20,88,4);ball(24,5);ball(88,4);
 for(let X=44;X<=68;X++){const h=Math.round(7*Math.sqrt(Math.max(0,1-((X-56)/12.5)**2)));for(let k=0;k<=h;k++)px(x,X,25-k,k===h?GD[0]:X<52?(k>h-2?GD[6]:GD[5]):X<62?GD[4]:GD[3])}
 const cx0=2,cy0=25,cw=108,ch=66,R=8;
 const inR=(X,Y,x0,y0,w,h,r)=>{const ex=Math.min(X-x0,x0+w-1-X),ey=Math.min(Y-y0,y0+h-1-Y);if(ex<0||ey<0)return-1;if(ex<r&&ey<r){const d=r-Math.hypot(r-ex-.5,r-ey-.5);return d<0?-1:d}return Math.min(ex,ey)};
 for(let y=cy0;y<cy0+ch;y++)for(let X=cx0;X<cx0+cw;X++){const e=inR(X,y,cx0,cy0,cw,ch,R);if(e<0)continue;
  let c=y<cy0+4?GD[5]:X<cx0+5?GD[5]:y>cy0+ch*.58?GD[3]:GD[4];if(y>cy0+ch-6)c=GD[2];if(e<1)c=GD[0];else if(e<2&&(y<cy0+6||X<cx0+6))c=GD[6];else if(e<2)c=GD[1];px(x,X,y,c)}
 // screen
 const sx=11,sy=33,sw=66,sh=50;
 for(let y=sy-4;y<sy+sh+4;y++)for(let X=sx-4;X<sx+sw+4;X++){const e=inR(X,y,sx-4,sy-4,sw+8,sh+8,10);if(e<0)continue;let c;
  if(e<1)c=GD[1];else if(e<2)c=(y<sy+sh/2&&X<sx+sw*.8)?GD[0]:GD[6];else if(e<4)c=(y<sy+sh/2)?GD[2]:GD[5];
  else{const u=(X-sx)/sw-.5,v=(y-sy)/sh-.5,d=u*u*1.1+v*v;c=d>.24?'#262c38':d>.15?GL[7]:d>.07?'#46506a':'#525d78';if(y&1)c=c==='#525d78'?'#4c5772':c==='#46506a'?'#414b64':c===GL[7]?'#363e4e':c}
  px(x,X,y,c)}
 for(let a=0;a<=20;a++){const t=Math.PI*(1.08+a/20*.36);px(x,Math.round(sx+sw/2+Math.cos(t)*sw*.4),Math.round(sy+sh/2+Math.sin(t)*sh*.38),a<14?GL[4]:GL[5])}
 for(let a=0;a<=6;a++){const t=Math.PI*(1.12+a/6*.12);px(x,Math.round(sx+sw/2+Math.cos(t)*sw*.32),Math.round(sy+sh/2+Math.sin(t)*sh*.28),GL[5])}
 // dial with ticks, knob, grille
 const dx=95,dy=47;
 for(let k=0;k<16;k++){const a=k/16*Math.PI*2;px(x,Math.round(dx+Math.cos(a)*12),Math.round(dy+Math.sin(a)*12),k%4===0?GD[0]:GD[2])}
 disc(x,dx,dy,9,(X,Y,a,b,d)=>px(x,X,Y,d>8.5?GD[0]:d>7.6?(a+b<0?GD[6]:GD[2]):a+b<-6?GD[6]:a+b<-1?GD[5]:a+b<5?GD[4]:GD[3]));
 line(x,dx,dy,dx+4,dy-6,GD[0]);line(x,dx+1,dy,dx+5,dy-6,GD[1]);disc(x,dx,dy,1,(X,Y)=>px(x,X,Y,GD[0]));
 disc(x,dx,66,5,(X,Y,a,b,d)=>px(x,X,Y,d>4.6?GD[0]:a+b<-2?GD[6]:a+b<2?GD[4]:GD[2]));
 for(let k=0;k<4;k++){px(x,86,74+k*3,GD[1],18,1);px(x,86,75+k*3,GD[5],18,1)}
 // legs
 const leg=X=>{for(let y=0;y<9;y++){const w=8-Math.floor(y/3);for(let i=0;i<w;i++){const c=i===0||i===w-1||y===8?GD[0]:i===1?GD[5]:GD[3];px(x,X+i+Math.floor(y/3)*.5|0,91+y,c)}}};
 leg(14);leg(90);
 s.screen=[sx,sy,sw,sh];return s}

// LAVERSE ORRERY (redrawn live so it can spin): gold base, gold post, gold arms + rods, the hub sun on top, Cooper City outermost.
const ORB=[['ashaad',14,-1.2,48],['sea',24,2.8,28],['pmuseum',32,-.35,54],['typefall',42,2.3,14],['void',50,-2.75,62],['gow',60,.25,34]];
const ORR={W:152,H:156,cx:76,hy:122,by:146,sunY:2,rot:0,tilt:.26,glow:0};
function orrery(im){const s=mk(ORR.W,ORR.H);s.im=im;s.draw=()=>drawOrr(s);s.draw();s.sun=[ORR.cx,ORR.sunY+20,20];return s}
function drawOrr(s){const x=s.x,im=s.im,{cx,hy,by}=ORR;x.clearRect(0,0,s.w,s.h);
 const items=ORB.map(([id,r,a,h])=>{const A=a+ORR.rot,X=cx+Math.cos(A)*r,Y=hy+Math.sin(A)*r*ORR.tilt;return{id,X,Y,h,z:Math.sin(A)}});
 const drawArm=o=>{const X=Math.round(o.X),Y=Math.round(o.Y);line(x,cx,hy,X,Y,GD[2]);line(x,cx,hy-1,X,Y-1,GD[5]);line(x,cx,hy+1,X,Y+1,GD[1]);
  const top=Y-o.h;px(x,X-1,top,GD[6],1,Y-top);px(x,X,top,GD[4],1,Y-top);px(x,X+1,top,GD[2],1,Y-top);
  px(x,X-2,Y-1,GD[0],5,4);px(x,X-1,Y-1,GD[6],2,1);px(x,X-1,Y,GD[4],3,1);px(x,X-1,Y+1,GD[2],3,1);
  const p=im[o.id];if(p)x.drawImage(p,X-Math.floor(p.width/2),top-p.height+3)};
 const base=(rw,rh,y,c)=>{for(let yy=-rh;yy<=rh;yy++)for(let X=-rw;X<=rw;X++){const d=(X/rw)**2+(yy/rh)**2;if(d>1)continue;let k=d>.86?c[0]:yy>rh*.35?c[1]:X<-rw*.35?c[4]:X<rw*.4?c[3]:c[2];if(yy===-rh+1&&d<=.86)k=c[5];px(x,cx+X,y+yy,k)}};
 base(36,8,by,[GD[0],GD[2],GD[3],GD[4],GD[5],GD[6]]);base(22,5,by-7,[GD[0],GD[2],GD[3],GD[4],GD[5],GD[6]]);
 items.filter(o=>o.z<0).sort((a,b)=>a.Y-b.Y).forEach(drawArm);
 for(let y=36;y<by-9;y++){px(x,cx-3,y,GD[0]);px(x,cx-2,y,GD[6]);px(x,cx-1,y,GD[5]);px(x,cx,y,GD[4]);px(x,cx+1,y,GD[3]);px(x,cx+2,y,GD[2]);px(x,cx+3,y,GD[0])}
 for(const[y0,w]of[[hy-3,7],[40,5]]){px(x,cx-w,y0,GD[0],w*2+1,6);px(x,cx-w+1,y0+1,GD[6],w*2-1,1);px(x,cx-w+1,y0+2,GD[5],w,2);px(x,cx+1,y0+2,GD[3],w-1,2);px(x,cx-w+1,y0+4,GD[2],w*2-1,1)}
 // sun glow (hover): banded rings behind the sun
 if(ORR.glow>0.01){const sy=ORR.sunY+20;for(let yy=-28;yy<=28;yy++)for(let X=-28;X<=28;X++){const d=Math.hypot(X+.5,yy+.5);if(d<19||d>27)continue;const bnd=Math.floor((d-19)/2.7);x.globalAlpha=ORR.glow*[.75,.45,.22][bnd];px(x,cx+X,sy+yy,bnd?GD[5]:GD[6])}x.globalAlpha=1}
 if(im.sun)x.drawImage(im.sun,cx-20,ORR.sunY);
 items.filter(o=>o.z>=0).sort((a,b)=>a.Y-b.Y).forEach(drawArm)}

// ---------------- scene / layout ----------------
let W=0,H=0,U=2,dpr=1,lw=0,lh=0,objs=[],shelves=[],ready=false;
const O={gumball:{label:'Gumball machine'},cards:{label:'Deck of cards'},laverse:{label:'The Laverse'},tv:{label:'TV'}};
function layout(){W=innerWidth;H=innerHeight;dpr=devicePixelRatio||1;const two=W/H<.9,gap=two?12:30,pad=two?6:20;
 const rows=two?[['gumball','tv'],['cards','laverse']]:[['gumball','cards','laverse','tv']];
 const rw=rows.map(r=>r.reduce((a,k)=>a+O[k].s.w,0)+gap*(r.length-1)),rh=rows.map(r=>Math.max(...r.map(k=>O[k].s.h)));
 const needW=Math.max(...rw)+pad*2+4,needH=rh.reduce((a,b)=>a+b+24,0)+(rows.length-1)*28;
 const PXd=Math.max(1,Math.floor(Math.min(W*(two?.96:.88)/needW,H*(two?.8:.64)/needH)*dpr+1e-6));U=PXd/dpr;lw=Math.ceil(W/U);lh=Math.ceil(H/U);
 cv.width=lw;cv.height=lh;cv.style.width=lw*U+'px';cv.style.height=lh*U+'px';
 let y=Math.round((lh-needH)/2+(two?0:lh*.03));objs=[];shelves=[];
 rows.forEach((r,i)=>{const top=y+rh[i];let X=Math.round((lw-rw[i])/2);shelves.push({x0:Math.round((lw-rw[i])/2)-pad,x1:Math.round((lw+rw[i])/2)+pad,y:top});
  r.forEach(k=>{const o=O[k];o.id=k;o.x=X;o.y=top-o.s.h+3;objs.push(o);X+=o.s.w+gap});y=top+24+28});
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
function target(o){if(o.id==='gumball'){const L=gumLayout(W,H),r=L.S/GB.S0,k=2*r/U;
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
function openApp(url){const f=document.createElement('iframe');f.className='app';f.title=url==GUMBALL_URL?'Gumball machine':'Deck of cards';f.src=url;
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
 const dx=e.clientX-d.x,dy=e.clientY-d.y,now=performance.now(),R=45*U*camK;d.moved+=Math.abs(dx)+Math.abs(dy);d.x=e.clientX;d.y=e.clientY;
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
function zoomIn(o){if(busy||zoomed)return;busy=true;zoomed=o;objs.forEach(q=>{q.hover=false;q.press=false});document.body.classList.add('zoomed');
 history.pushState({shelf:o.id},'','#'+o.id);
 const rm=RM.matches,to=target(o);let useApp=o.id==='gumball'?GUMBALL_URL:null;
 const proceed=()=>{if(o.id==='cards'&&cardsOK)useApp=CARDS_URL;if(useApp)app=openApp(useApp);
  const arrive=()=>{back.hidden=false;requestAnimationFrame(()=>back.classList.add('on'));
   if(o.id==='laverse'){spin.on=true;pad.hidden=false;busy=false;if(!rm)spin.v=-1.6;kick();return}
   if(app)showApp(app).then(()=>{busy=false});else{if(o.id==='tv'||o.id==='cards')showPlate(o);busy=false}};
  if(rm){fadeTo(1,140,'#fff').then(()=>{setCam(to.k,to.tx,to.ty);draw();return fadeTo(0,160)}).then(arrive)}
  else tweenCam(ctr(o),to,1050,t=>backIO(t,.85),arrive)};
 if(o.id==='cards'&&!cardsOK)cardsCheck().then(proceed);else proceed()}
function goBack(fromPop){if(!zoomed||busy)return;busy=true;const o=zoomed,rm=RM.matches;back.classList.remove('on');
 spin.on=false;spin.drag=null;spin.hover=false;pad.hidden=true;pad.classList.remove('sun');if(ORR.glow){ORR.glow=0;spin.dirty=true}
 if(!fromPop&&history.state&&history.state.shelf)history.back();
 const pl=plate.hidden?Promise.resolve():plate.animate([{opacity:1},{opacity:0}],{duration:160,fill:'forwards'}).finished.then(()=>{plate.hidden=true;plate.getAnimations().forEach(a=>a.cancel())});
 const ap=app?app.animate([{opacity:1},{opacity:0}],{duration:rm?140:260,easing:'ease-in',fill:'forwards'}).finished.then(()=>{app.remove();app=null}):Promise.resolve();
 Promise.all([pl,ap]).then(()=>{const fin=()=>{zoomed=null;busy=false;back.hidden=true;document.body.classList.remove('zoomed');o.btn.focus({preventScroll:true});kick()};
  if(rm){fadeTo(1,120,'#fff').then(()=>{setCam(1,0,0);draw();return fadeTo(0,160)}).then(fin)}else tweenCam(ctr(o),{k:1,tx:0,ty:0},850,t=>backIO(t,.7),fin)})}
back.addEventListener('click',()=>goBack());
addEventListener('keydown',e=>{if(e.key==='Escape')goBack()});
addEventListener('popstate',()=>{if(zoomed)goBack(true)});
addEventListener('pageshow',e=>{if(e.persisted){fade.getAnimations().forEach(a=>a.cancel());tick.length=0;if(zoomed){zoomed=null;busy=false;spin.on=false;pad.hidden=true;setCam(1,0,0);back.hidden=true;back.classList.remove('on');document.body.classList.remove('zoomed')}busy=false;kick()}});
addEventListener('resize',()=>{if(!ready)return;layout();if(zoomed){const t=target(zoomed);setCam(t.k,t.tx,t.ty);if(!plate.hidden)showPlate(zoomed)}});

// ---------------- boot ----------------
Promise.all([load('img/gumball.png'),load('img/sun.png'),...ORB.map(o=>load('img/'+o[0]+'.png'))]).then(([gum,sun,...pl])=>{
 const im={sun};ORB.forEach((o,i)=>im[o[0]]=pl[i]);
 const gs=mk(gum.width,gum.height);gs.x.drawImage(gum,0,0);O.gumball.s=gs;O.cards.s=cardBox();O.laverse.s=orrery(im);O.tv.s=tv();
 for(const k in O){const o=O[k];o.id=k;const b=document.createElement('button');b.type='button';b.className='hit';b.setAttribute('aria-label',o.label);o.btn=b;hits.appendChild(b);
  b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&!zoomed){o.hover=true;kick()}});b.addEventListener('pointerleave',()=>{o.hover=false;o.press=false;kick()});
  b.addEventListener('pointerdown',()=>{if(!zoomed){o.press=true;kick()}});b.addEventListener('pointerup',()=>{o.press=false;kick()});
  b.addEventListener('focus',()=>{if(b.matches(':focus-visible')){o.hover=true;kick()}});b.addEventListener('blur',()=>{o.hover=false;kick()});
  b.addEventListener('click',()=>zoomIn(o))}
 ready=true;layout();kick();
 const h=location.hash.slice(1);if(O[h]&&O[h].s){history.replaceState(null,'',location.pathname);setTimeout(()=>zoomIn(O[h]),200)}});
window.__shelf={O,ORR,spin,get zoomed(){return zoomed&&zoomed.id},get busy(){return busy},get cam(){return[camK,camX,camY]},get U(){return U},target,sunScreen};
})();

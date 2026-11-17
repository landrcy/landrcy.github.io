/* Laverse card box: a clockwork lock drawn pixel by pixel into a low-res canvas.
   Causal chain: the L dial (61 teeth) turns in three detents -> it drives gear A (14) and gear C (14).
   A carries pinion pa (6) which moves two racks in opposite directions: the top bolts slide out of the frame.
   C carries pinion pc (6) -> idlers F (10) -> G (7). G_r drives a vertical rack (the bottom bolt); a spring pawl
   ticks over G_l. When the last bolt clears, the plate settles on its hinges and falls open; the deck lift rises.
   The gear train follows the dial through a stiff spring (a little backlash and settle). No overlays, no glows. */
(()=>{'use strict';
const BW=208,BH=288,CH=528,X0=33,Y0=33,X1=175,Y1=255,TAU=Math.PI*2;
const C=(r,g,b)=>(255<<24)|(b<<16)|(g<<8)|r;
const DK=C(36,20,4),G4=C(110,66,14),G3=C(160,110,30),G2=C(214,166,66),G1=C(240,204,110),HL=C(255,240,184),HOLE=C(40,22,8),
 ST0=C(70,72,84),ST1=C(140,144,156),ST2=C(214,218,226);
const DX=104.5,DY=139.5; // dial centre
const D={N:61,R:61,x:DX,y:DY},A={N:14,R:14,x:104.5,y:64.5},EL={N:10,R:10,x:80.5,y:64.5},ER={N:10,R:10,x:128.5,y:64.5},PE={N:5,R:5},
 CC={N:20,R:20,x:104.5,y:220.5},FL={N:10,R:10,x:74.5,y:220.5},FR={N:10,R:10,x:134.5,y:220.5},GL={N:7,R:7,x:57.5,y:220.5},GR={N:7,R:7,x:151.5,y:220.5};
const STEP=25; // degrees per detent
const BOLT={rr:10,r4:40,rl:34}; // rack travel (px) before each bolt clears the frame
function train(th){const a=mesh(D,th,A),el=mesh(A,a,EL),er=mesh(A,a,ER),c=mesh(D,th,CC),fl=mesh(CC,c,FL),fr=mesh(CC,c,FR),gl=mesh(FL,fl,GL),gr=mesh(FR,fr,GR);return{a,el,er,c,fl,fr,gl,gr}}
function load(src){return new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.src=src})}
const Mech={};let cv,ctx,pc,pctx,buf,b32,base32,imgs={},ready;
Mech.init=async function(canvas,v){cv=canvas;ctx=cv.getContext('2d');
 const [plate,back,frame,medal]=await Promise.all(['plate','plateback','frame','medal'].map(n=>load('img/'+n+'.png?v='+v)));
 imgs={plate,back,frame,medal};
 pc=document.createElement('canvas');pc.width=BW;pc.height=BH;pctx=pc.getContext('2d');
 const t=document.createElement('canvas');t.width=BW;t.height=BH;const tx=t.getContext('2d');tx.drawImage(plate,0,0);
 base32=new Uint32Array(tx.getImageData(0,0,BW,BH).data.buffer.slice(0));
 buf=pctx.createImageData(BW,BH);b32=new Uint32Array(buf.data.buffer);
 ready=true;state.dial=0;state.train=0;phases();render()};
const state={dial:0,train:0,drop:0,phi:0,shake:0};let T0,ph={};
// rack phases so each rack's teeth sit in its pinion's gaps at rest
function phases(){T0=train(0);const f=(th,n)=>th+.46*TAU/n;
 ph.rl=EL.x+PE.R*(f(T0.el,PE.N)+Math.PI/2);ph.rr=ER.x-PE.R*(f(T0.er,PE.N)-Math.PI/2);ph.r4=GR.y+GR.R*f(T0.gr,GR.N)}
// ---- pixel helpers (plate buffer, clipped to the plate) ----
function px(x,y,c){x|=0;y|=0;if(x<X0||x>=X1||y<Y0||y>=Y1)return;b32[y*BW+x]=c}
function frac(v){return v-Math.floor(v)}
// gear: teeth occupy frac in [.2,.72) of each pitch; light from upper-left; 1px dark outline
function gear(g,th,o={}){const N=g.N,Rp=g.R,Rr=Rp-1.6,Rt=Rp+1.6,cx=g.x,cy=g.y,tau=TAU/N;
 const x0=Math.floor(cx-Rt-2),x1=Math.ceil(cx+Rt+2),y0=Math.floor(cy-Rt-2),y1=Math.ceil(cy+Rt+2),w=x1-x0,h=y1-y0;
 const m=new Uint8Array(w*h),inside=(dx,dy)=>{const r=Math.hypot(dx,dy);if(r<=Rr)return 1;if(r>Rt)return 0;const f=frac((Math.atan2(dy,dx)-th)/tau);return f>=.2&&f<.72?1:0};
 for(let j=0;j<h;j++)for(let i=0;i<w;i++)m[j*w+i]=inside(x0+i+.5-cx,y0+j+.5-cy);
 const sp=o.spokes||0,hub=o.hub||Math.max(2.5,Rp*.28),inner=o.inner||0;
 for(let j=0;j<h;j++)for(let i=0;i<w;i++){const k=j*w+i,X=x0+i,Y=y0+j;
  if(!m[k]){if((i>0&&m[k-1])||(i<w-1&&m[k+1])||(j>0&&m[k-w])||(j<h-1&&m[k+w]))px(X,Y,DK);continue}
  const dx=X+.5-cx,dy=Y+.5-cy,r=Math.hypot(dx,dy);
  if(inner&&r<inner)continue; // leave the centre for something drawn on top (the dial medallion)
  const d=(-.6*dx-.8*dy)/(r||1);let c;
  if(r>Rr-2){c=d>.55?HL:d>.1?G1:d>-.45?G2:G3}
  else if(r>Rr-3){c=d>0?G4:G1}
  else if(r<=hub){c=r<1.3?DK:(r>hub-1?(d>0?G1:G3):G2)}
  else if(sp){let a=Math.atan2(dy,dx)-th,best=9;for(let s=0;s<sp;s++){let q=Math.abs(((a-s*TAU/sp)%TAU+TAU+Math.PI)%TAU-Math.PI);if(q<best)best=q}
   const sw=best*r;if(sw<1.6)c=sw<.6&&d>0?G1:G2;else if(sw<2.4)c=DK;else c=HOLE}
  else c=(r<hub+1.2)?G3:G2;
  px(X,Y,c)}}
// mesh phase: gear2 angle from gear1 angle (contact direction a from gear1 to gear2)
function mesh(g1,th1,g2){const a=Math.atan2(g2.y-g1.y,g2.x-g1.x),t1=TAU/g1.N,t2=TAU/g2.N;
 return a+Math.PI-.96*t2-(g1.N/g2.N)*(th1+.46*t1-a)}
// rack with teeth pitch 2*pi (matches every gear here: N = R)
function hrack(xa,xb,yp,up,off){const P=TAU,y0=up?yp+1.6:yp-6.6,y1=up?yp+6.6:yp-1.6;
 const T=(x)=>{const f=frac((x-off)/P);return f>=.25&&f<.75};
 for(let x=Math.floor(xa)-1;x<=Math.ceil(xb)+1;x++)for(let y=Math.floor(y0)-4;y<=Math.ceil(y1)+4;y++){
  const ins=(X,Y)=>{if(X<xa||X>xb)return false;if(Y>=y0&&Y<y1)return true;const ty=up?(Y>=yp-1.6&&Y<y0):(Y>=y1&&Y<yp+1.6);return ty&&T(X+.5)};
  if(!ins(x,y)){if(ins(x-1,y)||ins(x+1,y)||ins(x,y-1)||ins(x,y+1))px(x,y,DK);continue}
  let c=G2;if(y===Math.floor(y0))c=HL;else if(y===Math.floor(y0)+1)c=G1;else if(y===Math.ceil(y1)-1)c=G3;
  if(!(y>=y0&&y<y1))c=up?(y<yp?G1:G2):(y>yp?G3:G2);px(x,y,c)}}
function vrack(x0b,ya,yb,xp,off){const P=TAU,x0=xp+1.6,x1=xp+6.6;const T=y=>{const f=frac((y-off)/P);return f>=.25&&f<.75};
 for(let y=Math.floor(ya)-1;y<=Math.ceil(yb)+1;y++)for(let x=Math.floor(xp)-3;x<=Math.ceil(x1)+2;x++){
  const ins=(X,Y)=>{if(Y<ya||Y>yb)return false;if(X>=x0&&X<x1)return true;return X>=xp-1.6&&X<x0&&T(Y+.5)};
  if(!ins(x,y)){if(ins(x-1,y)||ins(x+1,y)||ins(x,y-1)||ins(x,y+1))px(x,y,DK);continue}
  let c=G2;if(x===Math.floor(x0))c=G1;else if(x===Math.ceil(x1)-1)c=G3;if(x<x0)c=G2;px(x,y,c)}}
function line(x0,y0,x1,y1,c){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
 for(;;){px(x0,y0,c);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
// coil spring between two points (steel, 3 tones)
function spring(ax,ay,bx,by,coils,amp){const L=Math.hypot(bx-ax,by-ay),ux=(bx-ax)/L,uy=(by-ay)/L,nx=-uy,ny=ux,n=coils*2;let px0=ax,py0=ay;
 line(ax-nx*2,ay-ny*2,ax+nx*2,ay+ny*2,ST0);
 for(let i=1;i<=n;i++){const t=i/(n+1),s=(i%2?1:-1)*amp,x=ax+ux*L*t+nx*s,y=ay+uy*L*t+ny*s;line(px0,py0,x,y,i%2?ST2:ST1);px0=x;py0=y}
 line(px0,py0,bx,by,ST1);line(bx-nx*2,by-ny*2,bx+nx*2,by+ny*2,ST0)}
function thick(x0,y0,x1,y1){for(const [ox,oy] of [[0,2],[2,0],[0,-2],[-2,0],[1,1],[-1,-1],[1,-1],[-1,1]])line(x0+ox,y0+oy,x1+ox,y1+oy,DK);
 for(const [ox,oy] of [[0,1],[1,0],[0,0]])line(x0+ox,y0+oy,x1+ox,y1+oy,G3);for(const [ox,oy] of [[0,-1],[-1,0]])line(x0+ox,y0+oy,x1+ox,y1+oy,G1)}
function screw(x,y){x=Math.round(x);y=Math.round(y);for(let j=-2;j<=2;j++)for(let i=-2;i<=2;i++){const r=Math.hypot(i,j);if(r<=2.3)px(x+i,y+j,r>1.5?DK:(i+j<0?G1:G3))}px(x,y,DK)}
// ---- draw one state ----
function drawPlate(){b32.set(base32);
 const T=train(state.train);
 const st=(T.el-T0.el)*PE.R,sb=-(T.gr-T0.gr)*GR.R; // top / bottom rack travel (px), positive = retracting
 // bottom bolt: vertical rack beside G_r, slides up under the dial
 vrack(0,196-sb,Y1+BOLT.r4-sb+4,GR.x+GR.R,ph.r4-sb);
 for(let i=-3;i<=3;i++)for(let j=-2;j<=2;j++)px(GR.x+GR.R+4+i,232+j,Math.abs(i)===3||Math.abs(j)===2?DK:(j<0?G1:G3));
 // dial teeth ring (the medallion is drawn on top)
 gear(D,state.train,{inner:57});
 // top train: A -> idlers E (each with a 5-tooth pinion on its shaft)
 gear(A,T.a,{spokes:5});gear(EL,T.el,{spokes:4});gear(ER,T.er,{spokes:4});gear({...EL,...PE},T.el,{hub:2});gear({...ER,...PE},T.er,{hub:2});
 // bottom train: C -> F -> G
 gear(CC,T.c,{spokes:6});gear(FL,T.fl,{spokes:4});gear(FR,T.fr,{spokes:4});gear(GL,T.gl);gear(GR,T.gr);
 // left bolt rides on top of E_l's pinion; right bolt rides under E_r's pinion
 const rlb=87+st;hrack(X0-BOLT.rl+st-2,rlb,EL.y-PE.R,false,ph.rl+st);
 const rra=122-st;hrack(rra,X1+BOLT.rr-st+2,ER.y+PE.R,true,ph.rr-st);
 // extension springs that pull the bolts back out
 spring(45,46,rlb-8,46,6,2);spring(rra+8,83,164,83,6,2);
 for(const [x,y] of [[rlb-8,48],[rra+8,81]])for(let i=-1;i<=1;i++)for(let j=-2;j<=2;j++)px(x+i,y+j,Math.abs(i)===1&&Math.abs(j)===2?DK:G1);
 // bolt guides
 for(const [gx,gy] of [[50,EL.y-PE.R-4],[158,ER.y+PE.R+4]])for(let i=-3;i<=3;i++)for(let j=-5;j<=5;j++)px(gx+i,gy+j,Math.abs(i)===3||Math.abs(j)===5?DK:(i<0?G1:G3));
 // spring pawl ticking over G_l (tip follows the tooth profile, then snaps into the next gap)
 const ca=-2.25,f=frac((ca-T.gl)/(TAU/GL.N)),tip=f>=.2&&f<.72?GL.R+2.2:GL.R-.8;
 const tx=GL.x+Math.cos(ca)*tip,ty=GL.y+Math.sin(ca)*tip,pvx=48,pvy=202;
 thick(pvx,pvy,tx,ty);screw(pvx,pvy);spring(pvx-1,pvy-5,tx-2,ty-6,3,1.5);
 for(const g of [A,EL,ER,CC,FL,FR,GL,GR])screw(g.x,g.y);
 pctx.putImageData(buf,0,0);
 // the L medallion turns with the dial (nearest-neighbour rotation keeps it pixel art)
 pctx.save();pctx.imageSmoothingEnabled=false;pctx.translate(DX,DY);pctx.rotate(state.dial);pctx.drawImage(imgs.medal,-59.5,-59.5);pctx.restore()}
function render(){if(!ready)return;ctx.clearRect(0,0,BW,CH);ctx.imageSmoothingEnabled=false;
 const sy=state.shake|0;
 drawPlate();
 ctx.drawImage(imgs.frame,0,sy);
 const phi=state.phi,drop=state.drop|0;
 if(phi<=0){ctx.drawImage(pc,X0,Y0,X1-X0,Y1-Y0,X0,Y0+sy+drop,X1-X0,Y1-Y0);return}
 // the plate falls forward on its bottom hinge: rows compress toward the hinge, the top edge comes toward you
 const c=Math.cos(phi),s=Math.sin(phi),H=Y1-Y0,hy=Y1+drop+sy;
 if(c>=0){for(let j=0;j<H;j++){const dist=H-j,k=1+.16*s*dist/H,w=Math.round((X1-X0)*k),x=Math.round(DX-w/2),y=Math.round(hy-dist*c);
   ctx.drawImage(pc,X0,Y0+j,X1-X0,1,x,y,w,1)}
  if(phi>.08){const k=1+.16*s,w=Math.round((X1-X0)*k),x=Math.round(DX-w/2),y=Math.round(hy-H*c),th=Math.max(1,Math.round(4*s));ctx.fillStyle='#24140'+'4';ctx.fillRect(x,y-th-1,w,th+1);ctx.fillStyle='#d6a642';ctx.fillRect(x+1,y-th,w-2,th);ctx.fillStyle='#f0cc6e';ctx.fillRect(x+1,y-th,w-2,1)}}
 else{const cc=-c;for(let j=0;j<H;j++){const dist=H-j,k=1+.16*s*dist/H,w=Math.round((X1-X0)*k),x=Math.round(DX-w/2),y=Math.round(hy+dist*cc);
   ctx.drawImage(imgs.back,X0,Y0+j,X1-X0,1,x,y,w,1)}
  const k=1+.16*s,w=Math.round((X1-X0)*k),x=Math.round(DX-w/2),y=Math.round(hy+H*cc),th=Math.max(1,Math.round(4*s));ctx.fillStyle='#241404';ctx.fillRect(x,y,w,th+1);ctx.fillStyle='#a06e1e';ctx.fillRect(x+1,y,w-2,th)}
}
// ---- the opening, driven by one rAF clock; returns a promise when the deck can rise ----
const eio=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2,eo=t=>1-Math.pow(1-t,3),ei=t=>t*t;
const R=Math.PI/180;
function dialAt(t){ // anticipation, then three detents with overshoot and settle
 if(t<180)return -4*R*eo(t/180);let a=-4*R;
 for(let i=0;i<3;i++){const s0=180+i*470,to=(STEP*(i+1))*R;
  if(t<s0+290)return a+(to+1.6*R-a)*eio(Math.max(0,(t-s0)/290));
  if(t<s0+380)return to+1.6*R*(1-eo((t-s0-290)/90));
  if(t<s0+470)return to;a=to}
 return 3*STEP*R}
Mech.open=function(hooks){return new Promise(res=>{
 let t0=performance.now(),v=0,last=t0,clicked=[false,false,false],dropT=0,fallT=0;
 const step=now=>{const t=now-t0;let dt=Math.min(32,now-last)/1000;last=now;
  const target=dialAt(t);
  // gear train follows the dial through a stiff spring: tiny lag, overshoot, settle (backlash)
  for(let k=0;k<4;k++){const h=dt/4,acc=1800*(target-state.train)-34*v;v+=acc*h;state.train+=v*h}
  state.dial=target;
  // detent feedback: 1px knock when each detent seats
  for(let i=0;i<3;i++){const s0=180+i*470+290;if(!clicked[i]&&t>=s0){clicked[i]=true;state.shake=1;setTimeout(()=>state.shake=0,50)}}
  const end=180+3*470;
  if(t>=end+60&&!dropT){dropT=now}
  if(dropT){state.drop=now-dropT>40?1:0}
  if(dropT&&now-dropT>170&&!fallT){fallT=now;hooks&&hooks.fall&&hooks.fall()}
  if(fallT){const u=(now-fallT);
   // gravity fall to the stop, then a damped bounce on the hinge
   if(u<480)state.phi=100*R*ei(u/480);
   else{const b=u-480;state.phi=(100-11*Math.exp(-b/120)*Math.abs(Math.sin(b/62)))*R}
   if(u>900){render();res();return}}
  render();requestAnimationFrame(step)};
 requestAnimationFrame(step)})};
Mech.render=render;
window.Mech=Mech;
})();

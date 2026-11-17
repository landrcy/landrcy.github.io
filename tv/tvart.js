/* The gold retro TV, shared by /shelf/ and /tv/ so both show the exact same pixel model (112x100 art px).
   TVART.make() -> {c,w,h,screen,dial, setDial(units), setScreen(fn|null), render()}; fn(u,v,def) returns [r,g,b] for a glass pixel. */
(()=>{'use strict';
const GD=['#4a3208','#7a520e','#a8741a','#d29a2a','#f0c24a','#ffe58a','#fff6cc'],GL=['#ffffff','#f3f6fa','#e3e9f1','#cfd8e4','#aeb9c9','#8a97ab','#5e6a7e','#3c4556'];
const W=112,H=100,SCR=[11,33,66,50],DIAL=[95,47],DET=14;
function mk(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');x.imageSmoothingEnabled=false;return{c,x,w,h}}
function px(x,X,Y,col,w=1,h=1){x.fillStyle=col;x.fillRect(X,Y,w,h)}
function line(x,x0,y0,x1,y1,col){x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
 for(;;){px(x,x0,y0,col);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function disc(x,cx,cy,r,f){for(let y=-r;y<=r;y++)for(let X=-r;X<=r;X++){const d=Math.hypot(X,y);if(d<=r+.25)f(cx+X,cy+y,X,y,d)}}
const inR=(X,Y,x0,y0,w,h,r)=>{const ex=Math.min(X-x0,x0+w-1-X),ey=Math.min(Y-y0,y0+h-1-Y);if(ex<0||ey<0)return-1;if(ex<r&&ey<r){const d=r-Math.hypot(r-ex-.5,r-ey-.5);return d<0?-1:d}return Math.min(ex,ey)};
const hx=c=>{const n=parseInt(c.slice(1),16);return[n>>16,n>>8&255,n&255]};
// static body: antenna, casing, bezel, grille, knob, legs (everything except glass + dial face)
function body(){const s=mk(W,H),x=s.x;
 const ball=(X,Y)=>disc(x,X,Y,3,(a,b,dx,dy,d)=>px(x,a,b,d>2.6?GD[0]:dx+dy<-1?GD[6]:dx+dy<1?GD[5]:GD[3]));
 const rod=(x0,y0,x1,y1)=>{line(x,x0,y0,x1,y1,GD[2]);line(x,x0,y0-1,x1,y1-1,GD[5]);line(x,x0+1,y0,x1+1,y1,GD[1])};
 rod(52,20,24,5);rod(60,20,88,4);ball(24,5);ball(88,4);
 for(let X=44;X<=68;X++){const h=Math.round(7*Math.sqrt(Math.max(0,1-((X-56)/12.5)**2)));for(let k=0;k<=h;k++)px(x,X,25-k,k===h?GD[0]:X<52?(k>h-2?GD[6]:GD[5]):X<62?GD[4]:GD[3])}
 const cx0=2,cy0=25,cw=108,ch=66,R=8;
 for(let y=cy0;y<cy0+ch;y++)for(let X=cx0;X<cx0+cw;X++){const e=inR(X,y,cx0,cy0,cw,ch,R);if(e<0)continue;
  let c=y<cy0+4?GD[5]:X<cx0+5?GD[5]:y>cy0+ch*.58?GD[3]:GD[4];if(y>cy0+ch-6)c=GD[2];if(e<1)c=GD[0];else if(e<2&&(y<cy0+6||X<cx0+6))c=GD[6];else if(e<2)c=GD[1];px(x,X,y,c)}
 const[sx,sy,sw,sh]=SCR,glass=[];
 for(let y=sy-4;y<sy+sh+4;y++)for(let X=sx-4;X<sx+sw+4;X++){const e=inR(X,y,sx-4,sy-4,sw+8,sh+8,10);if(e<0)continue;let c;
  if(e<1)c=GD[1];else if(e<2)c=(y<sy+sh/2&&X<sx+sw*.8)?GD[0]:GD[6];else if(e<4)c=(y<sy+sh/2)?GD[2]:GD[5];
  else{const u=(X-sx)/sw-.5,v=(y-sy)/sh-.5,d=u*u*1.1+v*v;c=d>.24?'#262c38':d>.15?GL[7]:d>.07?'#46506a':'#525d78';if(y&1)c=c==='#525d78'?'#4c5772':c==='#46506a'?'#414b64':c===GL[7]?'#363e4e':c;glass.push([X,y,hx(c)])}
  px(x,X,y,c)}
 const glare=[];for(let a=0;a<=20;a++){const t=Math.PI*(1.08+a/20*.36);glare.push([Math.round(sx+sw/2+Math.cos(t)*sw*.4),Math.round(sy+sh/2+Math.sin(t)*sh*.38),a<14?GL[4]:GL[5]])}
 for(let a=0;a<=6;a++){const t=Math.PI*(1.12+a/6*.12);glare.push([Math.round(sx+sw/2+Math.cos(t)*sw*.32),Math.round(sy+sh/2+Math.sin(t)*sh*.28),GL[5]])}
 const[dx,dy]=DIAL;
 for(let k=0;k<DET;k++){const a=k/DET*Math.PI*2-Math.PI/2;px(x,Math.round(dx+Math.cos(a)*12),Math.round(dy+Math.sin(a)*12),k===0?GD[0]:GD[2])}
 disc(x,dx,66,5,(X,Y,a,b,d)=>px(x,X,Y,d>4.6?GD[0]:a+b<-2?GD[6]:a+b<2?GD[4]:GD[2]));
 for(let k=0;k<4;k++){px(x,86,74+k*3,GD[1],18,1);px(x,86,75+k*3,GD[5],18,1)}
 const leg=X=>{for(let y=0;y<9;y++){const w=8-Math.floor(y/3);for(let i=0;i<w;i++){const c=i===0||i===w-1||y===8?GD[0]:i===1?GD[5]:GD[3];px(x,X+i+Math.floor(y/3)*.5|0,91+y,c)}}};
 leg(14);leg(90);
 return{s,glass,glare}}
function make(){const B=body(),s=mk(W,H),x=s.x;let dial=0,scr=null;
 const img=x.createImageData(W,H);
 s.screen=SCR;s.dial=DIAL;s.DET=DET;
 s.setDial=u=>{dial=u};s.setScreen=f=>{scr=f};
 s.render=()=>{x.clearRect(0,0,W,H);x.drawImage(B.s.c,0,0);
  if(scr){const id=x.getImageData(0,0,W,H),d=id.data,[sx,sy,sw,sh]=SCR;
   for(const[X,y,def]of B.glass){const c=scr(X-sx,y-sy,def);const i=(y*W+X)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255}x.putImageData(id,0,0)}
  for(const[a,b,c]of B.glare)px(x,a,b,c);
  // dial face + pointer at `dial` detents (0 = pointing up)
  const[dx,dy]=DIAL,a=dial/DET*Math.PI*2-Math.PI/2;
  disc(x,dx,dy,9,(X,Y,p,q,dd)=>px(x,X,Y,dd>8.5?GD[0]:dd>7.6?(p+q<0?GD[6]:GD[2]):p+q<-6?GD[6]:p+q<-1?GD[5]:p+q<5?GD[4]:GD[3]));
  const ex=dx+Math.cos(a)*6.4,ey=dy+Math.sin(a)*6.4,nx=-Math.sin(a),ny=Math.cos(a);
  line(x,dx+nx*.9,dy+ny*.9,ex+nx*.9,ey+ny*.9,GD[1]);line(x,dx,dy,ex,ey,GD[0]);disc(x,dx,dy,1,(X,Y)=>px(x,X,Y,GD[0]))};
 s.render();return s}
// how /tv/ frames the TV: integer css px per art px (P), top-left (x,y)
function layout(vw,vh){const P=Math.max(1,Math.floor(Math.min(vw*.88/W,(vh-150)/H)));return{P,x:Math.round((vw-W*P)/2),y:Math.max(48,Math.round((vh-H*P)/2-24))}}
window.TVART={make,layout,W,H,SCR,DIAL,DET};
})();

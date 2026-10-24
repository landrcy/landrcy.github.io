/* "Game of Websites" intro: generic unblocked-games site -> gets hacked (glitch, RGB split, tears, flicker, error text, scrambling tiles)
   -> slowly turns into the real Game of Websites catalogue (sites/gow/screenshot.png) -> "Cooper City's number one official website / -Mr Cooper City"
   -> dithers away to reveal the normal section. Plays once on scroll-in; click/key skips; reduced-motion = no intro; dt capped at 50 ms; slow-frame self-skip. */
(function(){
const sec=document.getElementById('game-of-websites');if(!sec)return;
const show=()=>sec.classList.add('llc-shown');
if(matchMedia('(prefers-reduced-motion: reduce)').matches||!('IntersectionObserver' in window)){show();return}
const QS=new URLSearchParams(location.search),MANUAL=QS.has('gwmanual');
const clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t,sm=t=>{t=clamp(t,0,1);return t*t*(3-2*t)},eo=t=>1-Math.pow(1-clamp(t,0,1),3);
const BAY=[0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21].map(v=>(v+.5)/64);
function rng(seed){return()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
function mk(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c}
const TL={calm:.9,hack:3.0,xform:5.6,msg:8.0,end:8.9};
const shot=new Image();let shotOK=false;shot.onload=()=>{shotOK=true};shot.src='sites/gow/screenshot.png';
const SP=new Map();
function spr(str,font,col,ol){const k=str+'|'+font+'|'+col+'|'+ol;let s=SP.get(k);if(s)return s;
 const m=mk(1,1).getContext('2d');m.font=font;const w=Math.ceil(m.measureText(str).width)+4,h=parseInt(font.match(/(\d+)px/)[1])+6;
 const c=mk(w,h),x=c.getContext('2d');x.font=font;x.textBaseline='middle';
 if(ol){x.fillStyle=ol;for(const[dx,dy]of[[-1,0],[1,0],[0,-1],[0,1]])x.fillText(str,2+dx,h/2+dy)}
 x.fillStyle=col;x.fillText(str,2,h/2);const id=x.getImageData(0,0,w,h),d=id.data;for(let i=3;i<d.length;i+=4)d[i]=d[i]>120?255:0;x.putImageData(id,0,0);
 if(SP.size>600)SP.clear();s={c,w,h};SP.set(k,s);return s}
function T(g,str,x,y,font,col,al,ol){const s=spr(str,font,col,ol||'');g.drawImage(s.c,Math.round(al==='c'?x-s.w/2:al==='r'?x-s.w:x),Math.round(y-s.h/2));return s}
const FP='9px "Pixelify Sans"',FS='8px Silkscreen',FS7='7px Silkscreen';
const GEN_T=['Slope Run','Cube Rush','Moto Max','Tower Up','Sky Hop','Zombie Run','Ninja Dash','Tank Wars','Fruit Chop','Drift Kings','Stack Ball','Run Guy 3','Knife Flip','Penalty','Hill Climb','Duck Dash','Block Pop','Mini Golf','Space Raid','Car Jam','Neon Snake','Hoop Star','Tiny Fish','Jump Bot','Pixel Race','Bomb Bash','Sand Surf','Lava Leap','Cat Quest','Rail Rush','Brick Out','Frog Hop','Ice Slide','Gold Miner','Sky Dive','Pong Plus','Mole Whack','Aim Pro','Bubble Pop','Maze Run','Jelly Jump','Toy Kart','Rocket Up','Bike Trial'];
const REAL=[['GAME — Simulations','FinleyChang.com-Unblocked21','25,961 lines','UNBLOCKED · VERY COMPLEX'],['Archive of Things','PC','14,255 lines','UNBLOCKED · VERY COMPLEX'],['Night Arena','OnlineClash','11,433 lines','UNBLOCKED · VERY COMPLEX']];
const PAL=[['#ff5d8f','#7c1f4a'],['#ffcc4d','#a35a12'],['#38e1d0','#0e5a6a'],['#7c6cff','#2a1a7a'],['#7dffb2','#14683c'],['#ff8c28','#8a2a10'],['#4dc3ff','#143a8a'],['#d9c2ff','#5a2596'],['#e8e84a','#5a6a10'],['#ff6be0','#6a1a70']];
let st=null;
/* ---------- procedural generic tile art ---------- */
function dgrad(g,x,y,w,h,c1,c2,bias){const a=hex(c1),b=hex(c2);for(let j=0;j<h;j++){const t=clamp(j/h+(bias||0),0,1);for(let i=0;i<w;i++){const c=BAY[((y+j)&7)*8+((x+i)&7)]<t?b:a;g_.fillStyle='rgb('+c[0]+','+c[1]+','+c[2]+')';g_.fillRect(x+i,y+j,1,1)}}}
let g_=null;
function hex(h){return[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)]}
function tileArt(w,h,seed){const R=rng(seed*7919+13),c=mk(w,h),g=c.getContext('2d');g_=g;const p=PAL[(R()*PAL.length)|0],q=PAL[(R()*PAL.length)|0],kind=(R()*8)|0;
 g.fillStyle=p[1];g.fillRect(0,0,w,h);
 const R2=n=>(R()*n)|0;
 switch(kind){
 case 0:dgrad(g,0,0,w,h*.55|0,'#9ad8ff','#ffe8c0',0);g.fillStyle='#394';g.fillRect(0,h*.55|0,w,h);g.fillStyle='#555';g.beginPath();g.moveTo(w*.42,h*.5);g.lineTo(w*.58,h*.5);g.lineTo(w*.95,h);g.lineTo(w*.05,h);g.fill();g.fillStyle='#eee';g.fillRect(w*.49|0,h*.55|0,2,h*.12|0);g.fillRect(w*.48|0,h*.8|0,3,h*.12|0);g.fillStyle=q[0];g.fillRect(w*.38|0,h*.66|0,w*.24|0,h*.17|0);g.fillStyle='#111';g.fillRect(w*.4|0,h*.8|0,4,3);g.fillRect(w*.56|0,h*.8|0,4,3);break;
 case 1:dgrad(g,0,0,w,h,p[0],p[1],-.1);g.fillStyle=q[0];for(let i=0;i<4;i++)g.fillRect(R2(w-14),8+R2(h-18),14,4);g.fillStyle='#fff';g.fillRect(w*.4|0,h*.5|0,7,9);g.fillStyle='#ff4';g.fillRect(w*.4|0,h*.5|0,7,3);g.fillStyle='#432';g.fillRect(0,h-6,w,6);break;
 case 2:g.fillStyle='#07061a';g.fillRect(0,0,w,h);g.fillStyle='#fff';for(let i=0;i<24;i++)g.fillRect(R2(w),R2(h),1,1);g.fillStyle=q[0];for(let i=0;i<8;i++){const ax=6+(i%4)*(w/4.6)|0,ay=6+(i>>2)*9;g.fillRect(ax,ay,7,5);g.fillRect(ax+1,ay+5,2,2);g.fillRect(ax+4,ay+5,2,2)}g.fillStyle=p[0];g.fillRect(w/2-4|0,h-10,9,5);g.fillRect(w/2-1|0,h-14,3,4);break;
 case 3:for(let j=0;j<4;j++)for(let i=0;i<6;i++){const cc=PAL[R2(PAL.length)];g.fillStyle=cc[0];g.fillRect(i*(w/6)|0,j*(h/4)|0,(w/6|0)-1,(h/4|0)-1)}break;
 case 4:g.fillStyle=p[0];g.fillRect(0,0,w,h);g.fillStyle=p[1];for(let j=0;j<h;j+=8)for(let i=((j/8)&1)*8;i<w;i+=16)g.fillRect(i,j,8,8);{const r=Math.min(w,h)*.3|0;g.fillStyle='#111';g.beginPath();g.arc(w/2,h/2,r+1,0,6.3);g.fill();g.fillStyle=q[0];g.beginPath();g.arc(w/2,h/2,r,0,6.3);g.fill();g.fillStyle='#fff';g.fillRect(w/2-r*.5|0,h/2-r*.5|0,3,3)}break;
 case 5:dgrad(g,0,0,w,h,'#12123a','#4a1a6a',0);for(let i=0;i<6;i++){const cc=PAL[(i+kind)%PAL.length];g.fillStyle=cc[0];const bw=22-i*2;g.fillRect(w/2-bw/2+(R2(5)-2)|0,h-6-i*6,bw,5)}break;
 case 6:dgrad(g,0,0,w,h,'#ff7a45','#2a1a6a',.1);g.fillStyle='#ffe27a';g.beginPath();g.arc(w*.5,h*.5,h*.2,0,6.3);g.fill();g.fillStyle='#14102a';g.beginPath();g.moveTo(0,h);for(let i=0;i<=8;i++)g.lineTo(i*w/8,h*.62+((i%2)?-1:1)*R2(10));g.lineTo(w,h);g.fill();break;
 default:dgrad(g,0,0,w,h*.7|0,p[0],q[0],0);g.fillStyle='#2a2438';g.fillRect(0,h*.7|0,w,h);g.fillStyle=q[1];for(let i=0;i<3;i++)g.fillRect(8+i*(w/3)|0,h*.7-8|0,5,8);g.fillStyle='#fff';g.fillRect(w*.2|0,h*.7-12|0,6,12);}
 return c}
/* ---------- layout / prerender ---------- */
function build(W,H){
 const S={W,H,cols:Math.max(3,Math.floor((W-12)/62)),tiles:[],seed:3};
 const gap=4,tw=Math.floor((W-12-(S.cols-1)*gap)/S.cols),th=Math.round(tw*.66),rowH=th+13+4,top=H>340?52:50;S.tw=tw;S.th=th;S.top=top;S.rowH=rowH;
 S.rows=Math.max(2,Math.ceil((H-top)/rowH));const n=S.cols*S.rows;
 const R=rng(99);const titles=GEN_T.slice();
 for(let i=0;i<n;i++){const col=i%S.cols,row=(i/S.cols)|0;S.tiles.push({i,slot:i,art:tileArt(tw,th,i+1),title:titles[i%titles.length],badge:R()<.34?'HOT':R()<.14?'NEW':'',x:6+col*(tw+gap),y:top+row*rowH,gx:0,gy:0})}
 // static generic page
 const pg=mk(W,H),g=pg.getContext('2d');g.fillStyle='#10121f';g.fillRect(0,0,W,H);
 g.fillStyle='#161a2e';for(let y=0;y<H;y+=4)for(let x=(y>>2&1)*2;x<W;x+=4)g.fillRect(x,y,1,1);
 g.fillStyle='#1b2038';g.fillRect(0,0,W,28);g.fillStyle='#ff3b3b';g.fillRect(0,28,W,2);
 T(g,'UNBLOCKED',6,13,'bold 12px Silkscreen','#ffcc4d','l','#6a2a00');T(g,'GAMES 99',6+spr('UNBLOCKED','bold 12px Silkscreen','#fff','').w-2,13,'bold 12px Silkscreen','#ff5d8f','l','#4a0a2a');
 const sbx=Math.round(W*.42),sbw=Math.round(W*(W>400?.3:.36));if(W>260){g.fillStyle='#0b0d18';g.fillRect(sbx,6,sbw,15);g.fillStyle='#38e1d0';g.fillRect(sbx,6,sbw,1);g.fillRect(sbx,20,sbw,1);T(g,'search games...',sbx+5,14,FP,'#7a85b0','l')}
 if(W>=420){['HOME','ACTION','RACING','PUZZLE','SPORTS'].forEach((s,i)=>T(g,s,W-6-(4-i)*48+(0),14,FS7,i?'#9aa4d0':'#fff','r'))}
 const chips=['ALL','ACTION','RACING','PUZZLE','2 PLAYER','SPORTS','SHOOTER'];let cxp=6;chips.forEach((s,i)=>{const w=spr(s,FS7,'#fff','').w+4;if(cxp+w>W-4)return;g.fillStyle=i?'#262c4a':'#ff3b3b';g.fillRect(cxp,34,w,11);T(g,s,cxp+2,40,FS7,'#fff','l');cxp+=w+3});
 S.page=pg;
 // destination: real screenshot, dithered to a pixel palette
 const dest=mk(W,H),d=dest.getContext('2d');d.fillStyle='#f3ecdf';d.fillRect(0,0,W,H);d.fillStyle='rgba(221,207,188,.55)';for(let y=15;y<H;y+=16)d.fillRect(0,y,W,1);
 if(shotOK){const port=W/H<1.3;let sw,sh,sx,sy;
  if(!port){const sc=Math.max(W/1200,H/800);sw=Math.ceil(1200*sc);sh=Math.ceil(800*sc);sx=Math.round((W-sw)/2);sy=0}
  else{sw=W-16;sh=Math.round(sw*800/1200);sx=8;sy=Math.round((H-sh)/2);d.fillStyle='#fffaf3';d.fillRect(sx-3,sy-9,sw+6,sh+12);d.fillStyle='#c2412d';d.fillRect(sx,sy-6,3,3);d.fillStyle='#ddcfbc';d.fillRect(sx+5,sy-6,3,3);d.fillRect(sx+10,sy-6,3,3)}
  d.imageSmoothingQuality='high';d.drawImage(shot,sx,sy,sw,sh);
  if(port){d.strokeStyle='#ddcfbc';d.strokeRect(sx-3.5,sy-9.5,sw+7,sh+13)}}
 const id=d.getImageData(0,0,W,H),dd=id.data,L=8;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=(y*W+x)*4,t=BAY[(y&7)*8+(x&7)];for(let c=0;c<3;c++){const v=dd[k+c]/255*(L-1),f=Math.floor(v);dd[k+c]=Math.round((v-f>t?f+1:f)*255/(L-1))}}d.putImageData(id,0,0);S.dest=dest;
 S.fx=mk(W,H);S.fg=S.fx.getContext('2d',{willReadFrequently:true});S.veil=[.2,.4,.62].map(lv=>{const c=mk(W,H),x=c.getContext('2d'),im=x.createImageData(W,H);for(let y=0;y<H;y++)for(let X=0;X<W;X++){const k=(y*W+X)*4;im.data[k]=18;im.data[k+1]=10;im.data[k+2]=8;im.data[k+3]=BAY[(y&7)*8+(X&7)]<lv?255:0}x.putImageData(im,0,0);return c});S.mask=mk(W,H);S.mg=S.mask.getContext('2d');S.mi=S.mg.createImageData(W,H);S.dm=mk(W,H);S.dg=S.dm.getContext('2d');
 S.od=null;S.noise=new Float32Array((W>>2)*(H>>2)+64).map((_,i)=>rng(i*31+7)());
 return S}
/* ---------- frame ---------- */
const ERR=[['ERROR 403: BLOCKED','by school filter?'],['FIREWALL.EXE','has stopped working'],['ACCESS GRANTED','>> root@cooper'],['rm -rf /filter','... done.'],['SYSTEM OVERRIDE','0xC00PER'],['404 GAMES','NOT FOUND'],['INJECTING','GAME_OF_WEBSITES.js'],['UNBLOCKED_BY','Mr Cooper City'],['WARNING!!','page integrity 12%'],['>> ./takeover.sh','permission: yes']];
function tilesDraw(g,S,t,hk,R){const ci=((t*3)|0)%S.tiles.length;
 for(const tl of S.tiles){const slot=S.tiles[tl.slot],x=slot.x,y=slot.y;let ox=0,oy=0;
  if(hk>.3&&R()<hk*.05){ox=((R()*7)|0)-3;oy=((R()*5)|0)-2}
  g.drawImage(tl.art,x+ox,y+oy);
  const hot=tl.i===ci&&hk<.1;if(hot){g.fillStyle='#fff';g.fillRect(x-1,y-1,S.tw+2,1);g.fillRect(x-1,y+S.th,S.tw+2,1);g.fillRect(x-1,y,1,S.th);g.fillRect(x+S.tw,y,1,S.th)}
  if(tl.badge){const label=hk>.45&&((tl.i*7+(t*6|0))%5<2)?'PWNED':tl.badge;const sp=spr(label,FS7,'#fff','');g.fillStyle=label==='NEW'?'#1fa655':'#e8202a';g.fillRect(x+2+ox,y+2+oy,sp.w-1,sp.h-3);g.drawImage(sp.c,x+2+ox,y+oy-1)}
  let title=tl.title;if(hk>.25){const n=Math.floor(hk*6);let o='';for(let k=0;k<title.length;k++){o+=(R()<hk*.22)?'#@%&01?!$'[(R()*9)|0]:title[k]}title=o}
  T(g,title,x+1+ox,y+S.th+7+oy,FP,hk>.5&&R()<.2?'#7dffb2':'#d6dbf5','l')}
 // swap scrambling
 }
function render(S,t){
 const W=S.W,H=S.H,g=S.fg,ep=Math.floor(t*24),R=rng(ep*977+5),Rf=rng(Math.floor(t*60)*313+9);
 const hack=clamp((t-TL.calm)/(TL.hack-TL.calm),0,1),xf=clamp((t-TL.hack)/(TL.xform-TL.hack),0,1);
 // glitch intensity: ramp up, stay high through the transform, die out at the end of it
 let gi=t<TL.calm?0:t<TL.hack?.12+.88*Math.pow(hack,1.3):t<TL.xform?lerp(.85,.1,Math.pow(xf,1.4)):t<TL.msg?.04:0;
 if(t>TL.calm&&t<TL.calm+.25&&((t*40|0)%3===0))gi=Math.max(gi,.5);
 // scramble: tile slot permutation evolves while hacking
 if(t>TL.calm&&t<TL.xform&&S.lastEp!==ep){S.lastEp=ep;const n=Math.floor(gi*4);for(let k=0;k<n;k++){const a=(R()*S.tiles.length)|0,b=(R()*S.tiles.length)|0;const tmp=S.tiles[a].slot;S.tiles[a].slot=S.tiles[b].slot;S.tiles[b].slot=tmp}}
 if(t>=TL.xform-.2&&!S.tidy){S.tidy=1;S.tiles.forEach(tl=>tl.slot=tl.i)}
 g.globalCompositeOperation='source-over';g.drawImage(S.page,0,0);
 // marquee ticker
 const mq='NEW GAMES ADDED DAILY !!  PLAY FREE AT SCHOOL !!  NO DOWNLOAD !!  ';const ms=spr(mq,FS7,'#ffcc4d','');g.fillStyle='#1b2038';g.fillRect(0,H-9,W,9);const mo=-((t*18)%ms.w);for(let x=mo;x<W;x+=ms.w)g.drawImage(ms.c,Math.round(x),H-10);
 tilesDraw(g,S,t,gi,R);
 // cursor
 const cxp=lerp(W*.2,W*.62,sm(t/TL.hack)),cyp=S.top+S.rowH*.8+Math.sin(t*1.7)*8;if(t<TL.hack+.5){g.fillStyle='#fff';for(let i=0;i<8;i++)g.fillRect(Math.round(cxp),Math.round(cyp)+i,1+Math.min(i,4),1);g.fillStyle='#000';g.fillRect(Math.round(cxp),Math.round(cyp)-1,1,1)}
 // hack overlays: error boxes, bars, noise blocks
 if(gi>.2&&t<TL.xform+.4){
  const nE=gi>.7?3:gi>.4?2:1;for(let k=0;k<nE;k++){const R2=rng(Math.floor(t*(4+k))*7331+k*101);const e=ERR[(R2()*ERR.length)|0],bx=Math.round(R2()*(W-100)),by=Math.round(30+R2()*(H-70));if(R2()<.55+gi*.35){
    const w=Math.max(spr(e[0],FS,'#000','').w,spr(e[1],FS,'#000','').w)+8;g.fillStyle='#050805';g.fillRect(bx,by,w,25);g.fillStyle=k%2?'#ff3b3b':'#46ff7a';g.fillRect(bx,by,w,1);g.fillRect(bx,by+24,w,1);g.fillRect(bx,by,1,25);g.fillRect(bx+w-1,by,1,25);
    T(g,e[0],bx+4,by+8,FS,k%2?'#ff7b7b':'#46ff7a','l');T(g,e[1],bx+4,by+18,FS,'#b8ffcb','l')}}
  if(gi>.55){const pw=Math.round(W*.5),px0=Math.round(W*.25),py0=Math.round(H*.5),pr=clamp((t-TL.calm-1)/(TL.xform-TL.calm-1),0,1);g.fillStyle='#050805';g.fillRect(px0-2,py0-12,pw+4,24);g.fillStyle='#46ff7a';g.fillRect(px0,py0+2,Math.round(pw*pr),6);g.fillStyle='#1c3a26';g.fillRect(px0+Math.round(pw*pr),py0+2,pw-Math.round(pw*pr),6);T(g,'UPLOADING GAME OF WEBSITES... '+Math.round(pr*100)+'%',px0,py0-6,FS7,'#46ff7a','l')}
  for(let k=0;k<Math.floor(gi*7);k++){const bw=4*(2+((R()*14)|0)),bh=2*(1+((R()*4)|0)),bx=4*((R()*(W/4))|0),by=2*((R()*(H/2))|0);const c=['#ff00ff','#00ffff','#ffffff','#ff3b3b','#ffee00','#000000'][(R()*6)|0];g.fillStyle=c;g.globalAlpha=.55;g.fillRect(bx,by,bw,bh);g.globalAlpha=1}
 }
 // transform sweep: destination page revealed through a ragged dithered front
 if(t>=TL.hack){const pf=sm(xf)*1.25-.06;const m=S.mi.data,wN=W>>2;const rowJ=[];for(let y=0;y<H;y+=2)rowJ[y>>1]=(Rf()-.5)*(.05+.07*gi);
  for(let y=0;y<H;y++){const rj=rowJ[y>>1],row=(y&7)*8;for(let x=0;x<W;x++){const nz=S.noise[(y>>2)*wN+(x>>2)]*.1,v=x/W*.72+y/H*.28+nz+rj,a=v<pf-.05?1:v>pf+.05?0:clamp(1-(v-(pf-.05))/.1,0,1),k=(y*W+x)*4;m[k+3]=BAY[row+(x&7)]<a?255:0}}
  S.mg.putImageData(S.mi,0,0);const dg=S.dg;dg.globalCompositeOperation='source-over';dg.clearRect(0,0,W,H);dg.drawImage(S.dest,0,0);dg.globalCompositeOperation='destination-in';dg.drawImage(S.mask,0,0);dg.globalCompositeOperation='source-over';g.drawImage(S.dm,0,0);
  // glowing front edge
  if(xf<1){const m2=S.mi.data;}}
 // message overlay
 if(t>=TL.xform+.1){const u=clamp((t-(TL.xform+.1))/.5,0,.999);
  g.drawImage(S.veil[Math.min(2,Math.floor(u*3))],0,0);
  messageCard(g,W,H,t-(TL.xform+.1))}
 return gi}
function wrapLines(str,font,maxW){const m=mk(1,1).getContext('2d');m.font=font;const out=[];let cur='';for(const w of str.split(' ')){const tt=cur?cur+' '+w:w;if(m.measureText(tt).width>maxW&&cur){out.push(cur);cur=w}else cur=tt}out.push(cur);return out}
function messageCard(g,W,H,u){const fs=Math.round(clamp(W/20,12,22)),font='bold '+fs+'px Palatino,"Palatino Linotype","Iowan Old Style",Georgia,serif',ink='#1a1612',red='#c2412d';
 const full="Cooper City's number one official website",maxW=Math.min(W-30,fs*17),lines=wrapLines(full,font,maxW),lh=fs+5;
 const sigF='italic bold '+Math.round(fs*.95)+'px Palatino,"Palatino Linotype",Georgia,serif',sig='-Mr Cooper City';
 const cw=Math.min(W-14,Math.round(Math.max(...lines.map(l=>spr(l,font,ink,'').w))+30)),ch=14+lines.length*lh+Math.round(fs*1.9)+10,cx=Math.round((W-cw)/2),cy=Math.round((H-ch)/2);
 const pop=clamp(u/.3,0,1);if(pop<=0)return;const off=Math.round((1-eo(pop))*14);
 g.fillStyle=red;g.fillRect(cx+4,cy+4+off,cw,ch);g.fillStyle=ink;g.fillRect(cx-2,cy-2+off,cw+4,ch+4);g.fillStyle='#fffaf3';g.fillRect(cx,cy+off,cw,ch);
 T(g,'★ OFFICIAL ★',cx+cw/2,cy+off+8,FS7,red,'c');
 const typed=Math.floor(Math.max(0,u-.25)*45);let used=0;
 lines.forEach((l,i)=>{const room=typed-used;used+=l.length+1;if(room<=0)return;T(g,l.slice(0,room),cx+cw/2,cy+off+22+i*lh+fs*.4,font,ink,'c')});
 const su=clamp((u-(.25+full.length/45+.1))/.7,0,1);
 if(su>0){const ty=cy+off+22+lines.length*lh+fs*.7,sw=spr(sig,sigF,red,'').w,n=Math.ceil(sig.length*su);T(g,sig.slice(0,n),cx+cw-sw/2-10,ty+4,sigF,red,'c');
  const ul=Math.round((sw-6)*sm(su*1.3));g.fillStyle=red;for(let i=0;i<ul;i++)g.fillRect(cx+cw-sw-6+i+3,ty+Math.round(fs*.65)+(i&2?1:0),1,1)}}
function post(S,gi,t,out){ // RGB split, scanline tears, flicker on the composed scene -> visible canvas
 const W=S.W,H=S.H,o=out.getContext('2d');
 const ep=Math.floor(t*30),R=rng(ep*1237+3);
 let shx=0,shy=0;if(gi>.25&&R()<gi*.6){shx=((R()*5)|0)-2;shy=((R()*3)|0)-1}
 if(gi<.04&&t>TL.xform){o.drawImage(S.fx,0,0);return}
 const src=S.fg.getImageData(0,0,W,H),sd=src.data;if(!S.od)S.od=o.createImageData(W,H);const dd=S.od.data;
 const split=Math.round(gi*(R()<.6?5:2)),shift=new Int16Array(H),tear=R()<.3+gi*.7;
 if(tear&&gi>.1){const nb=1+Math.floor(gi*5);for(let b=0;b<nb;b++){const y0=(R()*H)|0,h=2+((R()*(8+gi*22))|0),dx=Math.round((R()-.5)*(10+gi*60));for(let y=y0;y<Math.min(H,y0+h);y++)shift[y]=dx}}
 const flick=gi>.3&&R()<gi*.12,neg=gi>.5&&R()<.04,blank=gi>.6&&R()<.025;
 for(let y=0;y<H;y++){const sh=shift[y],sy=clamp(y+shy,0,H-1),row=sy*W,dark=(y&1)&&gi>.05?.86:1;
  for(let x=0;x<W;x++){let sx=x-sh+shx;sx=sx<0?sx+W:sx>=W?sx-W:sx;const xr=sx+split>=W?W-1:sx+split,xb=sx-split<0?0:sx-split,k=(y*W+x)*4;
   let r=sd[(row+xr)*4],gg=sd[(row+sx)*4+1],b=sd[(row+xb)*4+2];
   if(neg){r=255-r;gg=255-gg;b=255-b}if(flick){r=Math.min(255,r*1.5+30);gg=Math.min(255,gg*1.5+30);b=Math.min(255,b*1.5+30)}
   if(blank){r=gg=b=6}
   dd[k]=r*dark;dd[k+1]=gg*dark;dd[k+2]=b*dark;dd[k+3]=255}}
 o.putImageData(S.od,0,0)}
/* ---------- runner ---------- */
let cvs,ctx,raf=0,last=0,time=0,running=false,slow=0,hint;
function finish(){show();if(!running)return;running=false;cancelAnimationFrame(raf);removeEventListener('keydown',skip);removeEventListener('resize',onResize);if(cvs&&cvs.parentNode)cvs.remove();if(hint&&hint.parentNode)hint.remove();cvs=null;st=null;window.__gwDone=true;if(window.__llcIntroBusy==='gow')window.__llcIntroBusy=0}
function skip(){if(running&&time<TL.msg+.3)time=TL.msg+.3}
function onResize(){finish()}
function frame(dt){time+=dt;if(time>=TL.end){finish();return}
 const gi=render(st,time);post(st,gi,time,cvs);
 if(time>TL.msg){const u=clamp((time-TL.msg)/(TL.end-TL.msg),0,1);const m=st.mi.data;for(let y=0;y<st.H;y++)for(let x=0;x<st.W;x++){m[(y*st.W+x)*4+3]=BAY[(y&7)*8+(x&7)]<(1-u)?255:0}
  st.mg.putImageData(st.mi,0,0);ctx.globalCompositeOperation='destination-in';ctx.drawImage(st.mask,0,0);ctx.globalCompositeOperation='source-over'}}
function loop(ts){if(!running)return;raf=requestAnimationFrame(loop);if(!last){last=ts;return}const raw=ts-last;last=ts;slow=raw>60?slow+1:Math.max(0,slow-1);if(slow>=8){time=Math.max(time,TL.msg+.4);slow=0}frame(Math.min(raw,50)/1000)}
const __ib=n=>window.__llcIntroBusy&&window.__llcIntroBusy!==n,__inV=el=>{const r=el.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight};
function start(){if(running||window.__gwStarted)return;if(__ib('gow')||!__inV(sec)){setTimeout(start,400);return}window.__gwStarted=true;window.__llcIntroBusy='gow';
 const go=()=>{try{
  const w=sec.clientWidth,h=sec.clientHeight,SC=w>=1700?3:2,W=Math.floor(w/SC),H=Math.floor(h/SC);
  cvs=document.createElement('canvas');cvs.className='gwi-canvas';cvs.width=W;cvs.height=H;cvs.setAttribute('aria-hidden','true');ctx=cvs.getContext('2d');ctx.imageSmoothingEnabled=false;
  st=build(W,H);sec.appendChild(cvs);hint=document.createElement('span');hint.className='gwi-skip';hint.textContent='click to skip';sec.appendChild(hint);
  cvs.addEventListener('pointerdown',skip);addEventListener('keydown',skip);addEventListener('resize',onResize);
  running=true;time=0;last=0;frame(0);show();
  if(MANUAL)window.__gw={adv(ms){let l=ms;while(l>0){const d=Math.min(l,50);frame(d/1000);l-=d;if(!running)break}},time:()=>time,skip};
  else{raf=requestAnimationFrame(loop);setTimeout(finish,15000)}}catch(e){console.warn('gow intro skipped',e);finish()}};
 const fl=['8px Silkscreen','bold 12px Silkscreen','9px "Pixelify Sans"'].map(f=>document.fonts?document.fonts.load(f):Promise.resolve());
 Promise.race([Promise.all(fl),new Promise(r=>setTimeout(r,1500))]).then(()=>{if(shotOK||!shot.complete)return shotOK?go():new Promise(r=>{const t0=Date.now();(function w(){if(shotOK||Date.now()-t0>1800)r();else setTimeout(w,50)})()}).then(go);else go()})}
new IntersectionObserver((es,ob)=>{if(es[0].isIntersecting){ob.disconnect();start()}},{threshold:.4}).observe(sec);
})();

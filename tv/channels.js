/* Laverse TV channels: one hand-drawn 66x50 pixel loop per site, drawn in code.
   TVCH[id](c,t,A) paints frame t (0..1, a 5s loop) onto a 66x50 2D context c. A holds loaded sprites. */
(()=>{'use strict';
const W=66,H=50,TAU=Math.PI*2,rnd=Math.round,clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const hash=(a,b,s=0)=>{let h=(a*374761393+b*668265263+s*1442695041)|0;h=Math.imul(h^h>>>13,1274126177);return((h^h>>>16)>>>0)/4294967296};
const ease=x=>x<.5?2*x*x:1-Math.pow(-2*x+2,2)/2;
let c;const R=(x,y,w,h,col)=>{c.fillStyle=col;c.fillRect(rnd(x),rnd(y),w,h)},P=(x,y,col)=>R(x,y,1,1,col);
function line(x0,y0,x1,y1,col){x0=rnd(x0);y0=rnd(y0);x1=rnd(x1);y1=rnd(y1);const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
 for(;;){P(x0,y0,col);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}}
function ring(cx,cy,r,col,sq=1){r=rnd(r);let x=r,y=0,e=1-r;const p=(a,b)=>P(cx+a,cy+rnd(b*sq),col);
 while(x>=y){p(x,y);p(y,x);p(-y,x);p(-x,y);p(-x,-y);p(-y,-x);p(y,-x);p(x,-y);y++;if(e<0)e+=2*y+1;else{x--;e+=2*(y-x)+1}}}
function disc(cx,cy,r,fn){for(let y=-r;y<=r;y++)for(let x=-r;x<=r;x++)if(x*x+y*y<=r*r+r*.8){const col=fn(x,y);if(col)P(cx+x,cy+y,col)}}
const stars=(n,seed,cols,ymax=H)=>{for(let i=0;i<n;i++){const x=Math.floor(hash(i,1,seed)*W),y=Math.floor(hash(i,2,seed)*ymax);P(x,y,cols[i%cols.length])}};
// 3x5 font
const F={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','!':'010010010000010','?':'111001010000010','.':'000000000000010'};
function text(s,x,y,col,sc=1){for(const ch of s){if(ch===' '){x+=3*sc;continue}const f=F[ch];if(f)for(let i=0;i<15;i++)if(f[i]==='1')R(x+(i%3)*sc,y+Math.floor(i/3)*sc,sc,sc,col);x+=4*sc}}
const tw=(s,sc=1)=>s.length*4*sc-sc;
const CH={};

// 01 The Binding of Ashaad: Ashaad's sprite paces between flickering candles in the brick crypt
CH.ashaad=(cx,t,A)=>{c=cx;R(0,0,W,H,'#1a1411');
 for(let r=0;r<8;r++){const y=r*5,off=r%2?5:0;for(let x=-off;x<W;x+=10){R(x,y,9,4,r<2?'#241c17':r<5?'#2c231d':'#33281f');P(x,y,r<5?'#3a2e25':'#43362b')}}
 R(0,40,W,10,'#2a1f18');R(0,40,W,1,'#4a3828');for(let x=3;x<W;x+=7)R(x,44+(x%3),3,1,'#231a14');
 const f=Math.floor(t*150);
 [[3,10],[9,7],[56,8],[62,11]].forEach(([x,h],i)=>{const top=42-h;R(x-1,42,4,1,'#5a4630');R(x,top,2,h,'#e2d5b8');R(x+1,top,1,h,'#b3a383');P(x,top,'#f3ead4');
  P(x+(i%2),top-1,'#2b2420');const s=hash(i,Math.floor(f/3),7),tall=s>.35,sw=s>.82?1:s<.12?-1:0,fx=x+(i%2);
  R(fx-1,top-2,3,1,'#e08a2a');P(fx,top-2,'#ffd25a');R(fx-1,top-3,3,1,'#e08a2a');P(fx,top-3,'#ffd25a');P(fx+sw,top-4,'#ffd25a');if(tall)P(fx+sw,top-5,'#fff0b0')});
 // pace: walk right, pause, walk left, pause
 const seg=t<.4?ease(t/.4):t<.5?1:t<.9?1-ease((t-.5)/.4):0,moving=(t<.4&&t>.02)||(t>.5&&t<.88),dir=t<.45?1:-1,x=rnd(12+seg*10),bob=moving&&Math.floor(f/4)%2?1:0;
 R(x+8,41,16,2,'#140f0c');R(x+10,43,12,1,'#140f0c');
 if(A.ash){c.save();if(dir<0){c.translate(x*2+32,0);c.scale(-1,1)}c.drawImage(A.ash,dir<0?x:x,10-bob);c.restore()}};

// 02 Sea of Thought: a message bottle bobbing on the waves, bubbles rising
CH.sea=(cx,t)=>{c=cx;R(0,0,W,6,'#c6f0f6');R(0,6,W,5,'#a2e4ee');R(0,11,W,4,'#86d8e6');
 const surf=x=>12+rnd(1.4*Math.sin(TAU*(x/22-t*2))+.6*Math.sin(TAU*(x/9+t*3)));
 const band=y=>y<22?'#1fa9c6':y<31?'#1893b4':y<40?'#117a9a':'#0c6280';
 for(let x=0;x<W;x++){const s=surf(x);for(let y=s;y<H;y++)P(x,y,band(y));P(x,s,'#e9fbfd');if(x%5===0)P(x,s+1,'#5ccbe0')}
 for(let i=0;i<4;i++){const x0=6+i*17;for(let y=16;y<40;y+=1)if((y+i)%3===0)P(x0+Math.floor((y-16)/3),y,'#2bb3cf')}
 [[5,7],[12,5],[58,8],[63,4]].forEach(([x,h],i)=>{for(let k=0;k<h;k++){const y=49-k*2,sw=rnd(Math.sin(TAU*t+k*.5+i)*k/5);R(x+sw,y-1,2,2,k%2?'#2f8f52':'#3fa865')}});
 for(let i=0;i<9;i++){const sp=1+(i%2),ph=(hash(i,3,2)+t*sp)%1,x=rnd(8+hash(i,4,2)*50+Math.sin(TAU*(ph*2+i/9))),y=rnd(48-ph*32);if(y<surf(x)+2)continue;
  if(i%3===0){R(x,y,2,2,'#bdf3fa');P(x,y,'#ffffff')}else P(x,y,'#9be6f2')}
 const bx=rnd(29+2*Math.sin(TAU*t)),by=rnd(3+1.6*Math.sin(TAU*t*2)),tl=Math.sin(TAU*t)>0.55?1:0;
 R(bx+3,by,3,2,'#a8743a');P(bx+3,by,'#c99055');
 R(bx+3,by+2,3,3,'#a9e3df');P(bx+2,by+2,'#4f9c9b');P(bx+6,by+2,'#4f9c9b');P(bx+2,by+3,'#4f9c9b');P(bx+6,by+3,'#4f9c9b');
 R(bx+1,by+5,7,1,'#4f9c9b');R(bx,by+6,9,10,'#4f9c9b');R(bx+1,by+6,7,9,'#bfeee9');R(bx+1,by+15,7,1,'#4f9c9b');
 R(bx+2,by+8,5,5,'#efe0b4');R(bx+2,by+8,5,1,'#d8c38a');R(bx+3,by+10,3,1,'#b59a62');R(bx+1,by+7,1,3,'#ffffff');P(bx+tl+6,by+7,'#e6fbf8');
 // water over the bottle's lower half
 c.globalAlpha=.45;for(let x=bx;x<bx+9;x++){const s=surf(x);if(s<by+16)R(x,s+1,1,by+16-s-1,'#1fa9c6')}c.globalAlpha=1;
 for(let x=bx-1;x<bx+10;x++)P(x,surf(x),'#e9fbfd')};

// 03 LLC Powered Channels: the play button, and a chart that climbs
CH.yt=(cx,t)=>{c=cx;R(0,0,W,H,'#0d1430');for(let x=2;x<W;x+=8)R(x,0,1,H,'#121b3d');for(let y=4;y<H;y+=8)R(0,y,W,1,'#121b3d');
 const T=(t+.82)%1,g=T<.8?ease(clamp(T/.8)):T<.92?1:1-ease((T-.92)/.08),beat=T<.06?1:0;
 const bx=5,by=7-beat;R(bx+1,by,20,16,'#e3262b');R(bx,by+1,22,14,'#e3262b');R(bx+1,by+13,20,2,'#b51a20');R(bx+2,by,18,1,'#ff5c57');
 for(let i=0;i<6;i++)R(bx+8+i,by+4+Math.floor(i/2)*0+i*0,1,0,'#fff');
 for(let k=0;k<7;k++)R(bx+8+Math.floor(k/1)*1,by+4+Math.floor(k/2),1,8-2*Math.floor(k/2),'#ffffff');
 text('LLC',bx+5,by+19,'#ffffff');
 const base=44,x0=31,goal=[6,10,9,15,20,29];R(x0-1,base+1,33,1,'#3b4a85');R(x0-1,8,1,37,'#3b4a85');
 const tops=[];goal.forEach((hh,i)=>{const p=clamp(g*1.35-i*.07),h=rnd(hh*ease(p)),x=x0+1+i*5;if(h>0){R(x,base+1-h,4,h,'#c41f27');R(x,base+1-h,4,1,'#ff5c57');R(x+3,base+2-h,1,h-1,'#94161c')}tops.push([x+1.5,base-h])});
 for(let i=0;i<5;i++)line(tops[i][0],tops[i][1]-2,tops[i+1][0],tops[i+1][1]-2,'#ffffff');
 const e=tops[5];if(g>.9){P(e[0],e[1]-4,'#ffffff');P(e[0]-1,e[1]-3,'#ffffff');P(e[0]+1,e[1]-3,'#ffffff')}};

// 04 The Void: an accretion disk swirling around the hole
CH.void=(cx,t)=>{c=cx;R(0,0,W,H,'#05030c');stars(26,4,['#3c3568','#6d64a8','#2a2450']);
 const X=33,Y=25,sq=.3,cols=r=>r<12?'#fff2ff':r<15?'#f0b8ff':r<19?'#c77dff':r<24?'#8a3ff0':'#4b1fa6';
 const parts=[];for(let i=0;i<340;i++){const r=10+Math.pow(hash(i,1,9),1.4)*21,k=r<14?3:r<20?2:1,a=hash(i,2,9)*TAU+t*TAU*k;parts.push([r,a])}
 const draw=front=>{for(const[r,a]of parts){const s=Math.sin(a);if((s>0)!==front)continue;P(rnd(X+Math.cos(a)*r),rnd(Y+s*r*sq),cols(r))}};
 for(let x=-30;x<=30;x++){const y=rnd(Math.sqrt(Math.max(0,1-(x/30)**2))*30*sq);P(X+x,Y-y,'#2a0f5a');P(X+x,Y+y,'#2a0f5a')}
 draw(false);
 // lensed back of the disk over the top of the hole
 for(let a=0;a<=40;a++){const th=Math.PI+a/40*Math.PI,rr=10;P(rnd(X+Math.cos(th)*rr),rnd(Y+Math.sin(th)*rr*.9),a%4===Math.floor(t*16)%4?'#ffffff':'#e2a8ff')}
 disc(X,Y,8,()=>'#000000');ring(X,Y,8,'#b46cff',.95);draw(true)};

// 05 Pixel Museum: the doors swing open on a lit gallery
CH.pmuseum=(cx,t)=>{c=cx;R(0,0,W,H,'#0d1220');stars(10,5,['#3a4466','#56628c'],12);
 const st='#9b9a94',lt='#b9b8b1',dk='#62625e';
 for(let i=0;i<8;i++){R(9+i*3,11-i,48-i*6,1,i===7?lt:st)}R(30,6,6,3,'#5f5f5a');P(32,7,'#c9a24a');P(33,7,'#c9a24a');
 R(7,12,52,7,lt);R(7,18,52,1,dk);text('MUSEUM',22,13,'#55554f');
 R(8,19,50,22,'#77766f');
 [10,17,45,52].forEach(x=>{R(x,19,4,21,st);R(x,19,1,21,lt);R(x+3,19,1,21,dk);R(x-1,19,6,1,lt);R(x-1,39,6,1,lt)});
 R(4,41,58,2,lt);R(2,43,62,2,st);R(0,45,W,2,dk);R(0,47,W,3,'#1a1e2c');
 // doorway with interior
 const dx=25,dy=22,dw=16,dh=19;R(dx-1,dy-2,dw+2,dh+2,dk);
 R(dx,dy,dw,dh,'#6b4a2a');R(dx,dy+12,dw,7,'#b88a4a');R(dx,dy+12,dw,1,'#d6a75e');R(dx+4,dy+3,8,6,'#c9a24a');R(dx+5,dy+4,6,4,'#2f5d8a');R(dx+5,dy+6,6,2,'#3f8a52');P(dx+8,dy+5,'#f2d36b');
 R(dx+1,dy+15,2,4,'#3a2716');R(dx+13,dy+15,2,4,'#3a2716');
 const o=t<.15?0:t<.35?ease((t-.15)/.2):t<.7?1:t<.9?1-ease((t-.7)/.2):0,lw=Math.max(1,rnd(8*(1-o*.85)));
 const leaf=(x,w,flip)=>{R(x,dy,w,dh,'#2b5552');if(w>2){R(x+1,dy+2,w-2,6,'#3f716c');R(x+1,dy+10,w-2,7,'#3f716c')}R(flip?x:x+w-1,dy,1,dh,'#1d3a38');if(w>3)P(flip?x+1:x+w-2,dy+9,'#c9a24a')};
 leaf(dx,lw,false);leaf(dx+dw-lw,lw,true);R(dx-1,dy-2,dw+2,1,lt)};

// 06 AI Quiz: the question pops, A and B light up in turn, one is picked
CH.aiquiz=(cx,t)=>{c=cx;R(0,0,W,H,'#0e1526');R(1,1,W-2,H-2,'#111a30');
 const seg=t<.5?0:1,u=(t%.5)/.5,pop=u<.1?Math.sin(u/.1*Math.PI):0,sq=u<.05?1:0;
 const Q=['0111110','1100011','1100011','0000011','0000110','0001100','0011000','0011000','0000000','0011000','0011000'];
 const qx=26,qy=3-rnd(pop*3);Q.forEach((row,j)=>{for(let i=0;i<7;i++)if(row[i]==='1'){R(qx+i*2,qy+j*2+sq,2,2,'#ffd34a');if(j<10&&Q[j+1]&&Q[j+1][i]!=='1')R(qx+i*2,qy+j*2+1+sq,2,1,'#c79a1e')}});
 const hl=u<.3?-1:u<.5?0:u<.7?1:2,pick=seg;
 [[3,31,'A'],[35,31,'B']].forEach(([x,y,l],i)=>{const on=hl===i||(hl===2&&pick===i),right=hl===2&&pick===i;
  R(x,y,28,15,right?'#5fe08a':on?'#ffd34a':'#2f4170');R(x+1,y+1,26,13,right?'#1f6b3a':on?'#2a3658':'#16213c');
  R(x+3,y+4,7,7,right?'#5fe08a':on?'#ffd34a':'#2f4170');text(l,x+5,y+5,right?'#0f3a1e':on?'#2a2a10':'#8a9ac4');
  R(x+13,y+5,11,1,right?'#9ff0b8':'#5a6a96');R(x+13,y+8,8,1,right?'#9ff0b8':'#5a6a96')})};

// 07 typefall: real words fall onto the pile
const WORDS=['TYPE','FALL','WORD','KEY','FOX','JUMP','DROP','QUIZ','FAST','INK'];
const pileH=x=>{const d=(x-38)/16;return 4+rnd(9*Math.exp(-d*d))+(hash(x,1,3)>.6?1:0)};
CH.typefall=(cx,t)=>{c=cx;R(0,0,W,H,'#eeebe3');
 for(let i=0;i<14;i++){const x=Math.floor(hash(i,5,3)*W),y=Math.floor(hash(i,6,3)*30);R(x,y,2,1,'#d6d2c8')}
 for(let x=0;x<W;x++){const h=pileH(x);for(let y=H-h;y<H;y++){const n=hash(x,y,8);P(x,y,y===H-h?'#555':n<.35?'#1e1e1e':n<.7?'#3a3a3a':n<.9?'#6a6a6a':'#9a9a9a')}}
 for(let i=0;i<4;i++){const sp=i%2?2:1,q=t*sp+[0,.55,.3,.8][i],ph=q%1,w=WORDS[(i*2+Math.floor(q)%sp)%WORDS.length],ww=tw(w),x=2+i*16+Math.floor((15-ww)/2);
  let land=H;for(let k=0;k<ww;k++)land=Math.min(land,H-pileH(x+k));const y=rnd(-6+Math.min(1,ph/.8)**2*(land-5+6));
  const col=ph>.8?'#2a2a2a':'#111';text(w,x,y,col);if(ph>.8&&ph<.86){P(x-2,land-1,'#888');P(x+ww+1,land-1,'#888')}}};

// 08 MINE: the robot swings its pick and breaks the ore block
CH.mine=(cx,t)=>{c=cx;R(0,0,W,H,'#18120e');
 const blk=(x,y,kind)=>{const base=kind==='s'?['#6d6d70','#58585b','#86868a']:kind==='o'?['#6d6d70','#58585b','#86868a']:['#6b4a2e','#563a22','#7e5a38'];
  R(x,y,8,8,base[0]);R(x,y+7,8,1,base[1]);R(x+7,y,1,8,base[1]);R(x,y,7,1,base[2]);for(let k=0;k<4;k++)P(x+1+Math.floor(hash(x,y,k)*6),y+1+Math.floor(hash(y,x,k)*6),base[1]);
  if(kind==='o'){P(x+2,y+2,'#4fd6e8');P(x+3,y+2,'#a8f2fb');P(x+5,y+4,'#4fd6e8');P(x+2,y+5,'#4fd6e8');P(x+3,y+5,'#2a9fb3')}};
 for(let y=0;y<H;y+=8)for(let x=-2;x<W;x+=8){if(y>=18&&y<42&&x<50)continue;blk(x,y,y>=42?'s':hash(x,y,4)>.85?'o':y<10?'d':'s')}
 R(0,18,50,24,'#120d0a');R(0,41,50,1,'#2a211a');
 const hits=[.12,.32,.52,.72],u=t,hit=hits.filter(h=>u>=h).length,broke=u>=.72&&u<.94;
 // target ore block
 const bx=38,by=34;if(!broke){const drop=u>=.94?rnd((1-(u-.94)/.06)*-3):0;blk(bx,by+drop,'o');
  const cr=[[[3,3],[4,4]],[[5,2],[2,5],[3,6]],[[1,1],[6,6],[6,3],[4,1]]];for(let k=0;k<Math.min(hit,3);k++)for(const[a,b]of cr[k])P(bx+a,by+b,'#1b1b1e')}
 else{const p=(u-.72)/.22;for(let k=0;k<7;k++){const vx=(hash(k,1,6)-.3)*16,vy=-6-hash(k,2,6)*8,x=bx+4+vx*p,y=by+4+vy*p+30*p*p;if(y<41)R(x,y,k%3?1:2,k%3?1:2,k%2?'#86868a':'#4fd6e8')}}
 // robot
 const rx=20,ry=29,f=Math.floor(t*150),tread=f%2;R(rx,ry+9,13,3,'#2e2e30');for(let k=0;k<6;k++)P(rx+1+k*2+tread,ry+10,'#5a5a5e');
 R(rx+1,ry,11,9,'#7d858f');R(rx+1,ry,10,8,'#b9c0c8');R(rx+1,ry,10,1,'#dce1e6');R(rx+4,ry+2,6,3,'#203040');R(rx+6,ry+3,2,1,'#3fe0ff');R(rx+5,ry-3,1,3,'#7d858f');P(rx+5,ry-4,'#e3262b');
 // pick swing: wind up slowly, strike fast
 let ph=1;for(const h of hits){const d=u-(h-.2);if(d>=0&&d<.2)ph=d<.15?d/.15:1-(d-.15)/.05*0;}
 const near=hits.find(h=>u>=h-.2&&u<h);let ang;if(near!==undefined){const d=(u-(near-.2))/.2;ang=d<.8?-1.9+.4*ease(d/.8):-1.5+(d-.8)/.2*2.2}else ang=.7;
 if(near===undefined&&hits.some(h=>u>=h&&u<h+.03))ang=.75;
 const px0=rx+11,py0=ry+4,len=12,hx=px0+Math.cos(ang)*len,hy=py0+Math.sin(ang)*len;line(px0,py0,hx,hy,'#8a5a2c');
 const nx=-Math.sin(ang),ny=Math.cos(ang);line(hx-nx*3,hy-ny*3,hx+nx*3,hy+ny*3,'#c8ccd2');P(hx+nx*3,hy+ny*3,'#8e939b');
 if(hits.some(h=>u>=h&&u<h+.025)&&!broke){P(bx-1,by+1,'#ffe8a0');P(bx-2,by+3,'#ffe8a0');P(bx-1,by+5,'#ffe8a0')}};

// 09 Talk to Tung: Tung winds up and bonks
CH.ttt=(cx,t)=>{c=cx;const u=(t%.5)/.5,imp=u>=.62&&u<.7,sh=imp&&u<.66?1:0;R(0,0,W,H,'#0f1a2e');stars(14,9,['#2d3c5c','#4a5c84'],30);
 R(52,6,6,6,'#d9d3b8');R(53,5,4,8,'#d9d3b8');R(51,7,8,4,'#d9d3b8');P(54,7,'#bfb898');P(55,10,'#bfb898');
 R(0,42+sh,W,8,'#2a2219');R(0,42+sh,W,1,'#3d3124');
 const x=20,y=12+sh,wood='#a8743f',dk='#7a5028',lt='#c99256';
 R(x,y+2,16,28,wood);R(x+1,y,14,2,wood);R(x+1,y,14,1,'#d9b27a');R(x+3,y-1,10,1,'#d9b27a');R(x+5,y,6,1,'#b88a52');
 R(x,y+2,1,28,dk);R(x+15,y+2,1,28,dk);R(x+12,y+2,3,28,'#946032');R(x+2,y+2,1,26,lt);
 [[4,4,9],[7,16,10],[10,6,7],[5,24,5],[12,20,8]].forEach(([gx,gy,gh])=>R(x+gx,y+gy,1,gh,dk));
 R(x+3,y+7,4,3,'#f4efe4');R(x+9,y+7,4,3,'#f4efe4');const look=imp?0:1;R(x+4+look,y+8,2,2,'#111');R(x+10+look,y+8,2,2,'#111');
 R(x+3,y+5,4,1,dk);R(x+9,y+5,4,1,dk);R(x+6,y+12,4,1,dk);R(x+5,y+14,6,1,'#3a1f10');if(imp)R(x+6,y+15,4,1,'#3a1f10');
 R(x+3,y+30,3,3,dk);R(x+10,y+30,3,3,dk);R(x-3,y+16,3,1,dk);R(x-3,y+16,1,6,dk);
 // bat: raised behind, brought down onto the ground at the right
 const ang=u<.45?-1.1-.35*ease(u/.45):u<.62?-1.45+1.85*Math.pow((u-.45)/.17,2):u<.8?.4:.4-1.5*ease((u-.8)/.2);
 const hx=x+17,hy=y+17;R(x+15,y+16,3,1,dk);const L=15;
 for(let k=1;k<=L;k++){const px=hx+Math.cos(ang)*k,py=hy+Math.sin(ang)*k,th=k>10?3:k>5?2:1;R(px-(th-1)/2,py-(th-1)/2,th,th,k>5?'#c48a4c':'#8a5a2c')}R(x+15,y+15,3,3,'#7a5028');
 if(imp){const ex=hx+Math.cos(.4)*L,ey=hy+Math.sin(.4)*L;line(ex-1,ey-4,ex-2,ey-6,'#ffe8a0');line(ex+3,ey-3,ex+5,ey-5,'#ffe8a0');line(ex+4,ey+1,ex+7,ey+1,'#ffe8a0');text('BONK',41,24,'#ffe8a0')}
 if(u>=.62&&u<.8){const p=(u-.62)/.18;for(let k=0;k<5;k++)P(hx+13+(k-2)*3*p*1.6,43-3*p+2*p*p*k%2,'#5a4a38')}};

// 10 lan4drcy: a Mandelbrot zoom into seahorse valley and back out
const MPAL=['#120a26','#1c1150','#281e86','#3f2cbd','#6a3fe6','#a15ff5','#d38dff','#f6d4ff'];
CH.lan4drcy=(cx,t)=>{c=cx;const s=.5-.5*Math.cos(TAU*t),z=Math.exp(Math.log(3.2)+(Math.log(.05)-Math.log(3.2))*s),X0=-.6+(-.16+.6)*Math.min(1,s*1.5),Y0=1.0405*Math.min(1,s*1.5);
 const img=c.createImageData(W,H),d=img.data,MAX=160;
 for(let py=0;py<H;py++)for(let px=0;px<W;px++){const cr=X0+(px-W/2+.5)/W*z,ci=Y0+(py-H/2+.5)/W*z;let x=0,y=0,n=0;while(n<MAX&&x*x+y*y<4){const xt=x*x-y*y+cr;y=2*x*y+ci;x=xt;n++}
  let col=n>=MAX?'#000000':MPAL[Math.min(7,Math.floor(Math.log2(n+1)*1.05))];const i=(py*W+px)*4;d[i]=parseInt(col.slice(1,3),16);d[i+1]=parseInt(col.slice(3,5),16);d[i+2]=parseInt(col.slice(5,7),16);d[i+3]=255}
 c.putImageData(img,0,0)};

// 11 Lsu: the pink planet pulses out rings
CH.lsu=(cx,t)=>{c=cx;R(0,0,W,H,'#140812');stars(12,11,['#3a1630','#5a2448']);
 for(let i=0;i<3;i++){const p=(t*2+i/3)%1,r=10+p*28;ring(33,25,r,p<.3?'#ff5aa0':p<.6?'#c2357a':'#6e1c48')}
 ring(33,25,14,'#3a1530');const b=(t*2)%1<.08?1:0,r=8+b;
 disc(33,25,r,(x,y)=>{const l=(-x*.6-y*.7)/r;return l>.55?'#ffb3d4':l>.15?'#ff7fb6':l>-.3?'#ef5a9c':l>-.7?'#c93f82':'#8e2a5e'});
 R(27,24,13,1,'#d94a8c');R(28,28,10,1,'#c93f82')};

// 12 Escape CA: a runner sprints through the gate out of the red city
CH.escapeca=(cx,t)=>{c=cx;R(0,0,W,14,'#2a0608');R(0,14,W,12,'#3d0a0c');R(0,26,W,10,'#57100f');R(0,36,W,6,'#6e1712');
 [[0,22,9],[8,16,7],[14,26,6],[19,12,6],[44,14,7],[50,24,5],[54,10,6],[59,20,7]].forEach(([x,y,w],i)=>{R(x,y,w,42-y,'#1a0405');for(let yy=y+2;yy<40;yy+=3)for(let xx=x+1;xx<x+w-1;xx+=2)if(hash(xx,yy,i)>.7)P(xx,yy,'#a3201c')});
 R(0,42,W,8,'#120203');R(0,42,W,1,'#3a0a08');
 const gx=25,gw=16;R(gx,14,gw,28,'#e2502e');R(gx,14,gw,3,'#2a0a0a');for(let k=0;k<5;k++)R(gx+2+k*3,17,1,3,'#2a0a0a');R(gx+3,20,10,1,'#f28a5a');
 R(gx-4,10,4,32,'#2a0a0a');R(gx+gw,10,4,32,'#2a0a0a');R(gx-5,9,6,2,'#7a1a16');R(gx+gw-1,9,6,2,'#7a1a16');R(gx-3,11,1,31,'#5a1210');R(gx+gw+1,11,1,31,'#5a1210');R(gx-5,10,gw+10,1,'#7a1a16');
 const x=rnd(-8+t*82),fr=Math.floor(t*150/3)%4,y=33,cl=x>gx-2&&x<gx+gw?'#1a0405':'#f2e6e0';
 R(x+2,y,3,3,cl);R(x+2,y+3,3,4,cl);
 const legs=[[[1,7],[0,8],[5,7],[6,8]],[[2,7],[2,8],[4,7],[5,8]],[[1,7],[1,8],[4,7],[4,8]],[[3,7],[3,8],[3,7],[2,8]]][fr];legs.forEach(([a,b])=>P(x+a,y+b,cl));
 const arms=[[[1,4],[0,5],[5,3],[6,3]],[[1,4],[5,4]],[[5,4],[6,5],[1,3],[0,3]],[[1,4],[5,4]]][fr];arms.forEach(([a,b])=>P(x+a,y+b,cl));
 if(x>gx-2&&x<gx+gw){}else{P(x+4,y+1,'#120203')}};

// 13 Terra: the planet turns under its clouds and ring
CH.terra=(cx,t)=>{c=cx;R(0,0,W,H,'#05070f');stars(30,13,['#3a4060','#6a7090','#2a3048']);
 const X=33,Y=25,Rr=15,rot=t*TAU,ringPts=[];for(let a=0;a<220;a++){const th=a/220*TAU,rr=a%2?24:26;ringPts.push([th,rr])}
 const rp=front=>{for(const[th,rr]of ringPts){const s=Math.sin(th);if((s>0)!==front)continue;const x=X+Math.cos(th)*rr,y=Y+s*rr*.2-Math.cos(th)*rr*.12;P(rnd(x),rnd(y),rr>25?'#8d7a56':'#c2ab80')}};
 rp(false);
 for(let y=-Rr;y<=Rr;y++)for(let x=-Rr;x<=Rr;x++){const r2=(x*x+y*y)/(Rr*Rr+Rr);if(r2>1)continue;const nx=x/Rr,ny=y/Rr,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),lat=Math.asin(clamp(ny,-1,1)),lon=Math.atan2(nx,nz)+rot;
  const land=Math.sin(2*lon+1.3)*Math.cos(3*lat)+.6*Math.sin(3*lon-.7+2*lat)+.35*Math.sin(5*lon+4*lat),cl=Math.sin(3*(lon+rot)+lat*5)*Math.sin(2*(lon+rot)-1+lat*3);
  let col=Math.abs(lat)>1.15?[232,240,242]:land>.55?[61,140,74]:land>.35?[45,107,55]:land>.2?[42,111,179]:[29,79,138];if(cl>.55)col=[238,244,246];
  const l=-nx*.55-ny*.45+nz*.7,f=l<-.05?.38:l<.3?.7:1;P(X+x,Y+y,`rgb(${col[0]*f|0},${col[1]*f|0},${col[2]*f|0})`)}
 rp(true)};

// 14 W.A.M.: a little wanderer crosses the mountain at night
CH.wam=(cx,t)=>{c=cx;R(0,0,W,H,'#0c1020');stars(22,14,['#3a4466','#5c6890','#2a3250'],26);
 for(let x=0;x<W;x++){const y=rnd(30+5*Math.sin(x/9+1)+3*Math.sin(x/4));R(x,y,1,H-y,'#161c34')}
 const ridge=x=>{const d=Math.abs(x-33);return rnd(16+d*.85+(hash(Math.floor(x/3),1,14)>.5?1:0))};
 for(let x=0;x<W;x++){const y=ridge(x);R(x,y,1,H-y,'#232b4c');P(x,y,'#3a4670');if(y<21)R(x,y,1,2,'#c9d3e8')}
 for(let x=28;x<40;x++){const y=ridge(x);if(y<20){P(x,y+1,'#9aa6c4')}}
 const p=t,x=rnd(-6+p*78),f=Math.floor(t*150/4)%2,gy=Math.min(ridge(x+2),ridge(x+3)),y=gy-9;
 const cl='#c8ccd6',dk='#8a90a2';R(x+1,y,4,4,cl);P(x+1,y,dk);P(x+3,y+1,'#1a1e2c');R(x+1,y+4,4,3,dk);R(x+2,y+4,2,3,cl);
 if(f){P(x+1,y+7,cl);P(x+4,y+7,cl);P(x,y+8,cl);P(x+5,y+8,cl)}else{P(x+2,y+7,cl);P(x+3,y+7,cl);P(x+2,y+8,cl);P(x+3,y+8,cl)}
 line(x+5,y+3,x+7,y-1,'#9aa6c4')};

// CAST: first person off the end of a dock at sunset sea; the bobber floats, dips on a bite, and a fish leaps out on the hook
CH.cast=(cx,t)=>{c=cx;const SK=['#0a2a5a','#1a4a8a','#2a7ac0','#48CAE4','#90E0EF'];for(let i=0;i<5;i++)R(0,i*3,W,3,SK[i]);
 R(52,4,6,6,'#ffe9a8');R(53,3,4,8,'#ffe9a8');R(54,5,2,2,'#ffffff');
 const HZ=15,SEA=['#90E0EF','#48CAE4','#1a7ac0','#0a4a8a','#021e5a'];{let y=HZ;[2,3,4,6,8].forEach((h,i)=>{R(0,y,W,h,SEA[i]);y+=h});R(0,y,W,H-y,SEA[4])}
 for(let k=0;k<14;k++){const y=HZ+2+Math.floor(hash(k,1,21)*26),sp=.6+y/30,x=((hash(k,2,21)*W+t*W*sp*(k%2?1:-1))%W+W)%W;R(x,y,2+Math.floor(y/10),1,y<HZ+10?'#e6fbff':'#90E0EF')}
 // bobber: floats, gets nibbled, dips under, then the fish jumps
 const bite=t>.45&&t<.62,dip=t>=.62&&t<.72,jump=t>=.72&&t<.92,bx=30,by=27+rnd(Math.sin(t*TAU*3))+(bite?rnd(Math.sin(t*90)):0)+(dip?2:0);
 if(!jump){if(!dip){R(bx,by-3,3,2,'#ff6a4a');R(bx,by-1,3,1,'#c0281e');P(bx+1,by-4,'#ffffff')}R(bx-1,by,5,1,'#e6fbff');if(bite||dip){P(bx-3,by,'#e6fbff');P(bx+5,by,'#e6fbff')}}
 let ex=bx+1,ey=by-3;
 if(jump){const q=(t-.72)/.2,fx=bx+1-q*8,fy=by-2-Math.sin(q*Math.PI)*12;ex=fx;ey=fy;const fl=Math.floor(t*60)%2;
  R(fx-3,fy,7,3,'#8ad0a0');R(fx-3,fy,7,1,'#d8fff0');R(fx-2,fy+2,5,1,'#3a8a6a');P(fx+3,fy+1,'#0a1a14');R(fx-5,fy+(fl?-1:1),2,2,'#3a8a6a');
  if(q<.3||q>.7){const sy=by+1;for(let k=0;k<4;k++)P(bx-2+k*2,sy-1-((k+Math.floor(t*40))%2),'#ffffff')}}
 // dock planks in perspective and the rod from the bottom right
 for(let i=0;i<4;i++){const y=38+i*3;R(0,y,W,3,i%2?'#8a5a2c':'#a07038');R(0,y,W,1,'#c08a4a')}for(let x=6;x<W;x+=14)R(x,38,1,12,'#5a3418');
 R(0,37,W,1,'#2a1608');const rx=60,ry=49,tx=44+rnd(Math.sin(t*TAU)*.5),ty=12+(bite?1:0)+(dip||jump?2:0);line(rx,ry,tx,ty,'#2a1608');line(rx+1,ry,tx+1,ty,'#5a3418');
 for(let i=0;i<=20;i++){const q=i/20;P(tx+(ex-tx)*q,ty+(ey-ty)*q+Math.sin(q*Math.PI)*(jump?0:3),'#e6fbff')}
 R(58,44,6,6,'#f2c89a');R(58,44,6,1,'#d8a070')};

window.TVCH=CH;
})();

/* LLC pixel solar system landing. Every body is a procedurally painted, dithered pixel sprite (world/planets.js). */
(()=>{
const P=window.PLANETS,RM=matchMedia('(prefers-reduced-motion: reduce)').matches,TAU=Math.PI*2,SQ=.6;
const cv=document.getElementById('sky'),g=cv.getContext('2d'),info=document.getElementById('info'),tip=document.getElementById('tip'),backBtn=document.getElementById('back'),homeBtn=document.getElementById('home'),archBtn=document.getElementById('archbtn');
let W=0,H=0,DPR=1;
// ---- data (stats: public YouTube counts as of Oct 26, 2026; null = not public) ----
const CH=[
 {id:'langrino',name:'Langrino',url:'https://www.youtube.com/@Langrino',subs:28,views:17847,kind:'battle'},
 {id:'clutch',name:'clutchclips',url:'https://www.youtube.com/@clutchclipscrate',subs:21,views:29940,kind:'mc'},
 {id:'trivia',name:'bowlfuloftrivia',url:'https://www.youtube.com/@bowlfuloftrivia',subs:11,views:7358,kind:'cosmic'},
 {id:'reddit',name:'RedditStoryADay',url:'https://www.youtube.com/channel/UCRegZeMyJ1B5B9n64rfgKAw',subs:null,views:8,kind:'fire'},
 {id:'sat',name:'SAT in a Minute',url:'https://www.youtube.com/channel/UCfDhWTThokF3gKW03iEGijg',subs:null,views:null,kind:'chalk'}];
const fmt=n=>n==null?'-':n.toLocaleString('en-US'),TV=CH.reduce((a,c)=>a+(c.views||0),0),TS=CH.reduce((a,c)=>a+(c.subs||0),0),MV=Math.max(...CH.map(c=>c.views||0));
const B=(o)=>Object.assign({ang:0,sf:1,pop:0,next:0},o);
const MAIN=[
 B({id:'sun',paint:'sun',w:250,x:0,y:0,hr:.36,title:'Landrcyverse',by:'games & websites by Landry',blurb:'Every planet is one of my sites. Click a planet to fly to it.'}),
 B({id:'ashaad',paint:'ashaad',w:66,h:60,orb:220,per:50,ph:2.2,hr:.42,title:'The Binding of Ashaad',by:'a brainrot roguelike by landrcy',blurb:'Descend into the basement, shoot your tears, grab cursed items and survive in this browser roguelike. 3 starters, 4 floors, 1 secret Finley boss.',href:'https://landrcy.github.io/binding-of-ashaad/',cta:'▶ Play'}),
 B({id:'sea',paint:'sea',w:122,orb:325,per:72,ph:.4,hr:.4,title:'Sea of Thought',by:'a pixel ocean by landrcy',blurb:'A quiet pixel ocean full of messages in bottles: write one, throw it in, then dive and read what strangers left behind.',href:'https://landrcy.github.io/sea-of-thought/',cta:'▶ Dive in'}),
 B({id:'yt',paint:'yt',w:96,orb:590,per:110,ph:4.1,hr:.42,title:'LLC Powered Channels',by:'YouTube',yt:1}),
 B({id:'gow',paint:'crest',w:92,h:74,orb:1190,per:260,ph:5.3,hr:.42,title:'Game of Websites',by:'coopercitywebsites.github.io',blurb:'A searchable catalogue of every site in the collection: unblocked games, NeoForge mods, old builds and the trash pile, ranked by how much code went into each one.',href:'https://coopercitywebsites.github.io/main/',cta:'Open'}),
 B({id:'void',paint:'void',w:236,h:124,orb:990,per:220,ph:5.9,tc:'#c04df0',hr:.16,title:'The Void',by:'a pixel space game by landrcy',blurb:'A pixel space game at the edge of a black hole. Fall in.',href:'https://landrcy.github.io/the-void/',cta:'▶ Play',fs:.13}),
 B({id:'arena',paint:'arena',w:134,h:110,orb:790,per:150,ph:2.9,hr:.42,title:'Ball Arena',by:'ball fights from the Langrino channel',href:'https://www.youtube.com/@Langrino',cta:'▶ Watch'})];
const MOONS=CH.map((c,i)=>B({id:'m-'+c.id,paint:'moon',arg:c.kind,w:Math.round(12+14*Math.sqrt((c.views||0)/MV)),orb:66+i*9,per:9+i*2.6,ph:i*1.3,dir:1,hr:.42,moon:c,title:c.name}));
const V=(id,kind,w,orb,per,title,by,href,blurb)=>B({id,paint:'vplanet',arg:kind,w,orb,per,ph:orb*.037,hr:.4,title,by,href,cta:'Visit this version',blurb});
const ARCH=[
 B({id:'oldhub',paint:'oldhub',w:110,x:0,y:0,hr:.36,title:'The space hub',by:'Oct 24, 2026 · one long page on a starfield',blurb:'Every site as its own floating pixel panel: dungeon slab, waves, warped void, browser tab, TV and arena.',href:'archive/',cta:'Visit this version'}),
 V('v-lovely','lovely',40,112,40,"Landry's Lovely Creations LLC",'first launch · Oct 22, 2026','archive/v/lovely/','The very first hub.'),
 V('v-arcade','arcade',44,150,52,'Arcade redesign','Oct 22, 2026','archive/v/arcade/','Arcade brand theme with a themed Binding of Ashaad showcase.'),
 V('v-larper','larper',46,190,64,"Landry's Larper Creations",'Oct 22, 2026','archive/v/larper/','Dark oxblood logo and a title-only hero.'),
 V('v-purple','purple',50,232,78,'Pixel purple LLC','Oct 22, 2026','archive/v/pixel-purple/','Purple pixel LLC monogram, filigree frame and a pixel cursor trail.'),
 V('v-white','white',50,276,92,'White title landing','Oct 26, 2026','archive/v/white-title/','A clean white page with only the animated LLC title.'),
 V('v-strings','strings',56,322,108,'Strings & rifts world','Oct 26, 2026','archive/v/strings/','The white dot-grid world: themed strings from a gold frame to rifts for every site.'),
 B({id:'ballfight',paint:'ballfight',w:46,orb:368,per:124,ph:1,hr:.36,title:'Eternal Ball Fight',by:'from the space hub',blurb:'Balls fight forever and the standings keep count.',href:'archive/#ballfight',cta:'▶ Watch'}),
 B({id:'ccold',paint:'ccold',w:50,orb:412,per:140,ph:4,hr:.4,title:"Cooper City's number one official website",by:'coopercitywebsites.github.io',blurb:'The original Cooper City site, linked from the old LLC footer.',href:'https://coopercitywebsites.github.io/',cta:'Open'})];
const LOD=[[3.2,4],[1.7,7],[1,0]];
function lodLv(){return Math.max(0,Math.min(2,Math.log(cam.z/1.1)/Math.log(2)))}
for(const b of [...MAIN,...MOONS,...ARCH]){b.S={N:0};b.L=[].map(([dv0])=>{const dv=b.paint==='crest'?Math.min(dv0,2.2):b.paint==='void'?Math.max(dv0,1.45):dv0;return P.mk(Math.max(8,Math.round(b.w/dv)),Math.max(6,Math.round((b.h||b.w)/dv)))});b.S={N:0};b.nx=0;b.ang=b.ph||0}
let sys='main',bodies=MAIN;
// ---- camera ----
const cam={x:0,y:0,z:1};let tw=null,focus=null,hover=null,intro=RM?null:{t0:performance.now()};
function fitZ(){const ext=sys==='main'?(W<H?[1250,780]:[1250,775]):(W<H?[490,300]:[490,300]);return Math.min(W/(2*ext[0]),(H-90)/(2*ext[1]))}
function fitX(){return 0}
function fitY(){return 0}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function to(x,y,z,ms=900,done){mv.on=0;if(RM)ms=1;tw={a:{...cam},b:{x,y,z},t0:performance.now(),ms,done}}
// ---- body positions ----
const parent=b=>b.moon?MAIN[3]:null;
function pos(b){if(b.orb==null)return[b.x,b.y];const c=b.moon?pos(MAIN[3]):[0,0];return[c[0]+Math.cos(b.ang)*b.orb,c[1]+Math.sin(b.ang)*b.orb*SQ]}
const S2W=(sx,sy)=>[cam.x+(sx-W/2)/cam.z,cam.y+(sy-H/2)/cam.z],W2S=(x,y)=>[(x-cam.x)*cam.z+W/2,(y-cam.y)*cam.z+H/2];
// ---- starfield + nebula ----
const STARS=[];for(let l=0;l<3;l++)for(let i=0;i<(l===0?260:l===1?110:40);i++)STARS.push({x:Math.random(),y:Math.random(),l,p:Math.random()*TAU,c:['#8a90c8','#cfd4ff','#fff6d8','#ffd0f0'][Math.floor(Math.random()*4)]});
let neb=null;
function buildNeb(){if(neb)return;const P0=256,S=P.mk(P0,P0),d=S.img.data,R=['#010103','#03030a','#070614','#0d0a1e','#140e2a'];
 const f=(x,y)=>P.fbm(x/70+3,y/70)*1.2+P.fbm(x/26,y/26+5)*.35-.55;
 for(let y=0;y<P0;y++)for(let x=0;x<P0;x++){const ax=x/P0,ay=y/P0,n=f(x,y)*(1-ax)*(1-ay)+f(x-P0,y)*ax*(1-ay)+f(x,y-P0)*(1-ax)*ay+f(x-P0,y-P0)*ax*ay;
  const v=Math.max(0,n*1.35)*1.4;const c=P.hx(P.dq(R,v,x,y,v>.5?P.STAR:P.bay)),o=(y*P0+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
 S.g.putImageData(S.img,0,0);neb=S}
function resize(){DPR=1;W=innerWidth;H=innerHeight;cv.width=W;cv.height=H;g.imageSmoothingEnabled=false;buildNeb();if(!focus&&!tw){cam.z=intro?cam.z:fitZ();if(!intro){cam.x=fitX();cam.y=fitY()}}}
addEventListener('resize',resize);
// ---- intro timeline ----
const clamp=v=>Math.max(0,Math.min(1,v)),seg=(t,a,b)=>clamp((t-a)/(b-a));
function introState(now){if(!intro)return{stars:1,ign:1,L:1,orb:1,pop:()=>1};const t=(now-intro.t0)/1000;
 return{t,stars:seg(t,0,.9),ign:seg(t,.5,1.7),L:seg(t,1.7,3.7),orb:seg(t,4.4,6),pop:i=>{const p=seg(t,5.2+i*.32,5.75+i*.32);return p<=0?0:1+Math.sin(p*Math.PI)*.25*(1-p)-(1-p)*(1-p)*.9}}}
function skipIntro(){if(!intro)return;intro=null;to(fitX(),fitY(),fitZ(),700)}
// ---- render ----
let last=performance.now(),FA=0;

// ---- asteroid belt between YouTube and the crest ----
const BELT=[];{const rk=(sz,seed)=>{const n=8,S=[];for(let k=0;k<n;k++){const la=k/n*TAU,c=P.mk(sz,sz),d=c.img.data,lx=Math.cos(la),ly=Math.sin(la);
  for(let y=0;y<sz;y++)for(let x=0;x<sz;x++){const dx=(x+.5)/sz*2-1,dy=(y+.5)/sz*2-1,a=Math.atan2(dy,dx),rr=.62+.3*P.vn(Math.cos(a)*1.6+seed,Math.sin(a)*1.6+seed*3);if(dx*dx+dy*dy>rr*rr)continue;
   const nz=Math.sqrt(Math.max(0,1-(dx*dx+dy*dy)/(rr*rr))),l=Math.max(0,-(dx*lx+dy*ly)/rr*.75+nz*.45)+(P.vn(x*.9+seed,y*.9)-.5)*.3;
   const q=P.hx(P.dq(['#120c1a','#2a2030','#4a3c44','#7a6658','#b09878','#e0c8a0'],Math.min(1,l*.9),x,y)),o=(y*sz+x)*4;d[o]=q[0];d[o+1]=q[1];d[o+2]=q[2];d[o+3]=255}
  c.g.putImageData(c.img,0,0);S.push(c.c)}return S};
 const LIB=[];for(let i=0;i<14;i++)LIB.push(rk([4,5,6,7,8,10,12][i%7],i*7.3));
 for(let i=0;i<260;i++){const u=Math.random(),r=405+(u+Math.random())*.5*70+((Math.random()-.5)*12);BELT.push({r,a:Math.random()*TAU,sp:.012*Math.pow(360/r,1.5)*(.9+Math.random()*.2),s:LIB[Math.floor(Math.random()*Math.random()*LIB.length)],sc:.6+Math.random()*.9})}}
function drawBelt(dt,alpha){if(sys!=='main'||alpha<=0)return;const ga=g.globalAlpha;g.globalAlpha=ga*alpha;
 for(const k of BELT){if(!RM)k.a+=dt*k.sp;const wx=Math.cos(k.a)*k.r,wy=Math.sin(k.a)*k.r*SQ,[sx,sy]=W2S(wx,wy);const sz=Math.max(1,Math.round(k.s[0].width*k.sc*cam.z*.9));if(sx<-sz||sy<-sz||sx>W+sz||sy>H+sz)continue;
  if(sz<=2){g.fillStyle='#7a6658';g.fillRect(Math.round(sx),Math.round(sy),sz,sz);continue}
  const li=((Math.round(Math.atan2(wy,wx)/TAU*8)%8)+8)%8;g.drawImage(k.s[li],Math.round(sx-sz/2),Math.round(sy-sz/2),sz,sz)}
 g.globalAlpha=ga}

// ---- spaceships (decorative, non-interactive) ----
const SHIPS=(()=>{const D=[
 ['..........','....aa....','..abbbba..','.abccccbaa','abcddddcbb','.abccccbaa','..abbbba..','....aa....'],
 ['...a......','..aba.....','.abbbaaaa.','abcccdddbb','.abbbaaaa.','..aba.....','...a......'],
 ['.aa.......','abba..aa..','.abbbbbba.','.bcccdddbb','.abbbbbba.','abba..aa..','.aa.......']];
 const PAL=[{a:'#3a3f58',b:'#9aa4c8',c:'#e8ecff',d:'#5ad8ff'},{a:'#4a1a1a',b:'#c84a3a',c:'#ffd0a0',d:'#ffe66d'},{a:'#1a3a2a',b:'#5aa878',c:'#d8ffe8',d:'#ff8ad8'}];
 const mkS=(k,pi)=>{const rows=D[k],h=rows.length,w=rows[0].length,S=P.mk(w,h),d=S.img.data,pl=PAL[pi];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const ch=rows[y][x];if(ch==='.')continue;const q=P.hx(pl[ch]),o=(y*w+x)*4;d[o]=q[0];d[o+1]=q[1];d[o+2]=q[2];d[o+3]=255}S.g.putImageData(S.img,0,0);return S.c};
 const L=[];for(let i=0;i<6;i++){const far=i>=4;L.push({c:mkS(i%3,(i*2)%3),far,ax:far?.6:620+i*90,ay:far?.4:330+i*40,fx:.021+i*.006,fy:.033+i*.005,ph:i*1.9,sc:far?1:2.2+(i%2)*.6,lp:i===1})}return L})();
function drawShips(now,alpha){if(sys!=='main'||alpha<=0||RM)return;const t=now/1000,ga=g.globalAlpha;
 for(const s of SHIPS){const T=t+s.ph*10;let x,y,vx,vy;
  if(s.far){x=W*(.5+s.ax*Math.sin(T*s.fx*1.4))-cam.x*.05;y=H*(.5+s.ay*Math.sin(T*s.fy*1.1+1));x=((x%(W+80))+W+80)%(W+80)-40;vx=Math.cos(T*s.fx*1.4);vy=Math.cos(T*s.fy*1.1+1)*.6;g.globalAlpha=ga*alpha*.55}
  else{const wx=s.ax*Math.sin(T*s.fx)+(s.lp?60*Math.cos(T*.9):0),wy=s.ay*Math.sin(T*s.fy+s.ph)*SQ+(s.lp?60*Math.sin(T*.9):0);[x,y]=W2S(wx,wy);vx=s.ax*s.fx*Math.cos(T*s.fx)-(s.lp?54*Math.sin(T*.9):0);vy=s.ay*s.fy*Math.cos(T*s.fy+s.ph)*SQ+(s.lp?54*Math.cos(T*.9):0);g.globalAlpha=ga*alpha}
  const sc=s.far?s.sc:Math.max(1,Math.round(s.sc*Math.min(cam.z,2.5)*.6)),w=s.c.width*sc,h=s.c.height*sc;if(x<-w||y<-w||x>W+w||y>H+w)continue;
  g.save();g.translate(Math.round(x),Math.round(y));g.rotate(Math.atan2(vy,vx));
  const fl=.6+.4*Math.sin(t*40+s.ph*7);g.fillStyle=`rgba(255,${150+Math.round(80*fl)},60,${.85*fl})`;const fl2=Math.round(sc*(2+2*fl));g.fillRect(-w/2-fl2,-sc,fl2,sc*2);g.fillStyle='#fff6d8';g.fillRect(-w/2-sc,-Math.ceil(sc/2),sc,sc);
  g.drawImage(s.c,Math.round(-w/2),Math.round(-h/2),w,h);g.restore()}
 g.globalAlpha=ga}
function clamp2(v,a,b){return v<a?a:v>b?b:v}
// ---- occasional big solar flare ----
let BF={next:performance.now()+12000+Math.random()*10000,t0:0,a:0,s:1};
function bigFlare(now){if(RM||sys!=='main'||intro)return;if(!BF.t0&&now>=BF.next){BF.t0=now;BF.a=Math.random()*TAU;BF.s=Math.random()<.5?1:-1}if(!BF.t0)return;
 const k=(now-BF.t0)/4200;if(k>=1){BF.t0=0;BF.next=now+15000+Math.random()*25000;return}
 const sun=MAIN[0],[cx,cy]=W2S(0,0),R=sun.w*.34*cam.z,ps=Math.max(1,Math.min(4,Math.round(cam.z*1.2))),grow=Math.min(1,k/.3),fade=k<.6?1:1-(k-.6)/.4,ga=g.globalAlpha,PAL=['#fffbe8','#ffe98a','#ffc23a','#ff8a1e','#d8460a'];
 if(cx<-R*4||cy<-R*4||cx>W+R*4||cy>H+R*4)return;
 const cs=Math.max(3,Math.round(R/12)),span=.8,Hm=R*2.1*grow,BAND=[['#8e1a06',1],['#c8300c',.74],['#f0601a',.5],['#ffa040',.3],['#ffe0a8',.14]];
 const n=Math.ceil((span*R+Hm*2.2)/cs*1.6),seen=new Set();
 for(const[col,wf]of BAND){g.fillStyle=col;g.globalAlpha=ga*Math.min(1,fade*1.4-(1-wf)*(k>.6?.6:0));if(g.globalAlpha<=.02)continue;seen.clear();
  for(let i=0;i<=n;i++){const u=i/n,env=Math.sin(Math.PI*u),a=BF.a+BF.s*(u-.5)*span+Math.sin(u*5+now/700)*.05*grow,h=env*Hm+Math.sin(u*11+now/260)*R*.06*grow,th=R*(.12+.14*env)*wf*(1+.25*Math.sin(u*17+now/150));
   const bx=cx+Math.cos(a)*(R*.97+h),by=cy+Math.sin(a)*(R*.97+h),m=Math.ceil(th/cs);
   for(let j=-m;j<=m;j++){const px=Math.floor((bx+Math.cos(a)*j*cs)/cs),py=Math.floor((by+Math.sin(a)*j*cs)/cs),key=px*7919+py;if(seen.has(key))continue;seen.add(key);g.fillRect(px*cs,py*cs,cs,cs)}}}
 if(k>.35){g.fillStyle='#ffa040';for(let i=0;i<22;i++){const q=(i*.618)%1,a=BF.a+BF.s*(q-.5)*span*1.5,d=R*(1+2.1*grow)+(k-.35)*R*3*(.5+q);g.globalAlpha=ga*fade*(1-q*.5);g.fillRect(Math.floor((cx+Math.cos(a)*d)/cs)*cs,Math.floor((cy+Math.sin(a)*d)/cs)*cs,cs,cs)}}
 g.globalAlpha=ga}
let lensC=null,lensN=0,lensR=null;
function lens(){if(sys!=='main')return;const b=MAIN.find(q=>q.id==='void'),[vx0,vy0]=pos(b),[sx,sy]=W2S(vx0,vy0),E=b.w*.084*cam.z*2.3,Rr=Math.ceil(E*3.2);
 if(E<3||sx+Rr<0||sy+Rr<0||sx-Rr>W||sy-Rr>H)return;const x0=Math.floor(sx-Rr),y0=Math.floor(sy-Rr),D=Rr*2,q=Math.max(1,Math.ceil(D/260)),w=Math.ceil(D/q),h=w;
 if(!lensC)lensC=document.createElement('canvas');const moved=!lensR||Math.abs(lensR[0]-x0)>1||Math.abs(lensR[1]-y0)>1||lensR[2]!==D;
 if(moved||(++lensN%3)===0){if(lensC.width!==w){lensC.width=w;lensC.height=h}const lc=lensC.getContext('2d',{willReadFrequently:true});lc.imageSmoothingEnabled=false;lc.clearRect(0,0,w,h);lc.drawImage(cv,x0,y0,D,D,0,0,w,h);
  const src=lc.getImageData(0,0,w,h),a=src.data,out=lc.createImageData(w,h),o=out.data,c=w/2,Eq=E/q,E2=Eq*Eq,Rq=Rr/q;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=x+.5-c,dy=(y+.5-c)/.8,d2=dx*dx+dy*dy;if(d2>Rq*Rq)continue;const i=(y*w+x)*4,dd=Math.sqrt(d2),fall=dd/Rq,f=1-E2/Math.max(d2,1),k=f*(1-fall*fall)+fall*fall;
   let X,Y;if(f<0){X=Math.round(c-dx*.6*(E2/d2));Y=Math.round(c-dy*.8*.6*(E2/d2))}else{X=Math.round(c+dx*k);Y=Math.round(c+dy*.8*k)}X=X<0?0:X>=w?w-1:X;Y=Y<0?0:Y>=h?h-1:Y;
   const j=(Y*w+X)*4,m=1-fall*fall*fall,m2=m*m*(3-2*m);o[i]=a[j];o[i+1]=a[j+1];o[i+2]=a[j+2];o[i+3]=255*m2}
  lc.putImageData(out,0,0);lensR=[x0,y0,D]}
 g.drawImage(lensC,x0,y0,D,D)}
function frame(now){if(sys==='archive'&&!warp&&document.body.classList.contains('arch')){last=now;requestAnimationFrame(frame);return}const dt=Math.min(.05,(now-last)/1000);last=now;const IS=introState(now);FA+=((focus?1:0)-FA)*Math.min(1,dt*4);if(mv.on&&!tw){const k=Math.pow(.9,dt*60);mv.x*=k;mv.y*=k;cam.x+=mv.x*dt*60;cam.y+=mv.y*dt*60;if(Math.hypot(mv.x,mv.y)*cam.z<.1)mv.on=0}if(!tw&&!intro&&sys==='main'){const bx=1260,by=790;cam.x=clamp2(cam.x,fitX()-bx,fitX()+bx);cam.y=clamp2(cam.y,fitY()-by,fitY()+by)}
 if(intro){if(IS.t<3.9){cam.x=0;cam.y=0;cam.z=Math.min(W,H)*.82/(250*.72)}else if(!intro.zoomed){intro.zoomed=1;to(fitX(),fitY(),fitZ(),1500)}if(IS.t>8.2)intro=null}
 if(tw){const k=ease(clamp((now-tw.t0)/tw.ms));const zl=Math.exp(Math.log(tw.a.z)+(Math.log(tw.b.z)-Math.log(tw.a.z))*k);cam.x=tw.a.x+(tw.b.x-tw.a.x)*k;cam.y=tw.a.y+(tw.b.y-tw.a.y)*k;cam.z=zl;if(k>=1){const d=tw.done;tw=null;d&&d()}}
 // orbit motion: hover/focus slows to a stop
 const list=sys==='main'?[...bodies,...MOONS]:bodies;
 for(const b of list){if(b.orb==null)continue;const frozen=focus&&(focus===b||(b.moon?(focus===b||focus.moon):(b.id==='yt'&&(focus.yt||focus.moon))));const tgt=RM||frozen?0:hover===b?0:(hover&&hover.yt&&b.moon)?.35:1;b.sf+=(tgt-b.sf)*Math.min(1,dt*4);b.ang+=dt*TAU/b.per*b.sf*(b.dir||1)}
 let wv=0;if(warp){const k=(now-warp.t0)/1700;wv=Math.sin(Math.min(1,k)*Math.PI);if(k>=.5&&!warp.swapped){warp.swapped=true;sys=warp.to;bodies=sys==='main'?MAIN:ARCH;document.body.classList.toggle('arch',sys==='archive');tw=null;cam.x=fitX();cam.y=fitY();cam.z=fitZ()*6;to(fitX(),fitY(),fitZ(),1100)}if(k>=1)warp=null}
 // stars
 g.globalAlpha=1;g.fillStyle='#010103';g.fillRect(0,0,W,H);
 g.globalAlpha=IS.stars;const T=1024,ox=Math.round(((cam.x*.056)%T+T)%T),oy=Math.round(((cam.y*.056)%T+T)%T);for(let ty=-oy;ty<H;ty+=T)for(let tx=-ox;tx<W;tx+=T)g.drawImage(neb.c,tx,ty,T,T);
 const ts=now/1000;for(const s of STARS){const f=[.04,.09,.16][s.l],ps=[2,2,3][s.l];let x=((s.x*W-cam.x*f*.7)%W+W)%W,y=((s.y*H-cam.y*f*.7)%H+H)%H;x=Math.round(x/ps)*ps;y=Math.round(y/ps)*ps;
  const tw2=RM?1:.5+.5*Math.sin(ts*(1+s.l)+s.p);if(tw2<.25&&s.l===0)continue;g.fillStyle=s.c;if(wv>.02){const L=wv*(.15+s.l*.12),ex=x+(x-W/2)*L,ey=y+(y-H/2)*L,n=Math.ceil(Math.hypot(ex-x,ey-y)/ps);for(let i=0;i<=n;i++)g.fillRect(Math.round((x+(ex-x)*i/n)/ps)*ps,Math.round((y+(ey-y)*i/n)/ps)*ps,ps,ps);continue}g.fillRect(x,y,ps,ps);if(s.l===2&&tw2>.7){g.fillRect(x-ps,y,ps,ps);g.fillRect(x+ps,y,ps,ps);g.fillRect(x,y-ps,ps,ps);g.fillRect(x,y+ps,ps,ps)}}
 g.globalAlpha=1;lens();
 g.globalAlpha=Math.max(0,1-wv*1.6);
 // orbit rings (pixel dashes)
 const ring=(cx,cy,r,prog,col)=>{const ps=Math.max(1,Math.min(3,Math.round(cam.z))),n=Math.max(48,Math.floor(r*cam.z*TAU/(ps*3.5)));g.fillStyle=col;for(let k=0;k<n*prog;k++){if(k%3===2)continue;const a=k/n*TAU-Math.PI/2,[sx,sy]=W2S(cx+Math.cos(a)*r,cy+Math.sin(a)*r*SQ);g.fillRect(Math.round(sx/ps)*ps,Math.round(sy/ps)*ps,ps,ps)}};
 {const ps=Math.max(1,Math.min(3,Math.round(cam.z))),ga0=g.globalAlpha;for(const b of bodies){if(b.orb==null||b.moon)continue;const n=Math.max(40,Math.min(130,Math.round(b.orb*cam.z*2.6/(ps*3)))),arc=2.6,dr=b.dir||1;g.fillStyle=b.tc||'#c8ccff';
 for(let k=1;k<=n;k++){const f=k/n,an=b.ang-dr*arc*f,[sx,sy]=W2S(Math.cos(an)*b.orb,Math.sin(an)*b.orb*SQ);if(sx<-4||sy<-4||sx>W+4||sy>H+4)continue;const al=Math.pow(1-f,1.3)*.6*IS.orb;if(al<.02||(k%2&&f>.35))continue;g.globalAlpha=ga0*al;g.fillRect(Math.round(sx/ps)*ps,Math.round(sy/ps)*ps,ps,ps)}}g.globalAlpha=ga0}
 if(sys==='main'){const[yx,yy]=pos(MAIN[3]);}
 {const A=MAIN[1],tg=(hover===A||focus===A)?1:0;A.op=(A.op||0)+(tg-(A.op||0))*Math.min(1,dt*(tg?2.2:3));A.arg={open:RM?tg:A.op}}
 drawBelt(dt,IS.orb);drawShips(now,IS.orb);
 // sprites, back-to-front
 const draw=[];bodies.forEach((b,i)=>draw.push([b,i]));if(sys==='main')MOONS.forEach((m,i)=>draw.push([m,3]));
 draw.sort((a,b)=>pos(a[0])[1]-pos(b[0])[1]);
 for(const[b,i]of draw){const pp=b.id==='sun'||b.id==='oldhub'?1:IS.pop(Math.min(i,7)+(b.moon?.5:0));if(pp<=0)continue;const isF=focus&&(b===focus||(focus.yt&&b.moon)),dim=isF||FA<.005?1:1-.72*FA;
  const[x,y]=pos(b),[sx,sy]=W2S(x,y),w=b.w*cam.z*pp,h=(b.h||b.w)*cam.z*pp;
  if(sx+w<0||sx-w>W||sy+h<0||sy-h>H)continue;
  // resolution chosen from on-screen size: redraw at that res, integer pixel scale, no colour-quantised downsample
  const cap=b.paint==='void'?Math.round(b.w*1.1):b.paint==='crest'?128:b.paint==='sun'?(focus===b?210:140):b.paint==='arena'?180:160,pw=Math.max(2,w),ps=Math.max(1,Math.ceil(pw/cap)),Nt=Math.max(6,Math.round(pw/ps)),asp=(b.h||b.w)/b.w;
  let S=b.S;const ga=g.globalAlpha;
  if(!S.N||Math.abs(Nt-S.N)/Nt>.06&&now>=(b.rz||0)){const S2=P.mk(Nt,Math.max(4,Math.round(Nt*asp)));S2.N=Nt;if(S.N){b.prev=S;b.xf=now}b.S=S=S2;b.nx=0;b.rz=now+40}
  if(now>=(b.nx||0)||(b.id==='sun'&&intro)){const o=b.id==='sun'?{ign:IS.ign,L:IS.L}:b.arg;P.setFlat(S.N<cap*.55);const tn=RM?7:now/1000+(b.ph||0)*3,nc=NIGHT[b.moon?'moon':b.id];P.setNight(nc&&!nc.post?{...nc,t:tn}:null);P[b.paint](S,tn,o);P.setNight(null);if(nc&&nc.post)nightPass(S,nc,tn,S.N<cap*.55);P.setFlat(0);b.nx=RM?Infinity:now+(b.paint==='sun'?(S.N>200?90:S.N>100?110:70):S.N>140?66:S.N>60?44:60)+Math.random()*8}
  const dw=Math.abs(S.N*ps-pw)<=ps?S.N*ps:pw,dh=Math.round(dw*asp),dx=Math.round(sx-dw/2),dy=Math.round(sy-dh/2);
  const xf=b.prev?Math.min(1,(now-b.xf)/160):1;if(b.prev&&xf<1){g.globalAlpha=ga*dim;g.drawImage(b.prev.c,dx,dy,dw,dh)}else b.prev=null;
  g.globalAlpha=ga*dim*(b.prev?xf:1);g.drawImage(S.c,dx,dy,dw,dh);
  g.globalAlpha=ga}
 g.globalAlpha=1;bigFlare(now);if(focus&&!tw&&sys==='main'){const[fx,fy]=pos(focus);cam.x+=(fx-cam.x)*Math.min(1,dt*8);cam.y+=(fy-cam.y)*Math.min(1,dt*8)}if(focus)placeInfo();
 requestAnimationFrame(frame)}
// ---- hit testing ----
function hit(sx,sy){const[wx,wy]=S2W(sx,sy);let best=null,bd=1e9;const list=sys==='main'?[...MOONS,...bodies]:bodies;
 for(const b of list){const[x,y]=pos(b),r=b.w*b.hr*(b.id==='void'?1.4:1),d=Math.hypot(wx-x,(wy-y)*(b.id==='void'?1.6:1));if(d<r&&d/r<bd){bd=d/r;best=b}}return best}
// ---- focus & info ----
let revealT=0;
const TH={sun:['#080a12','#dde0e8','#ffe66d','#080a12','Silkscreen','#9ab4e8'],ashaad:['#120a0c','#e8dcc0','#ffd23a','#2a1608','Silkscreen','#5a3a20'],sea:['#021e5a','#90E0EF','#48CAE4','#021e5a','VT323','#f3dfae'],arena:['#1a0f08','#fff3d6','#ffcf3a','#1a0f08','Silkscreen','#ff6464'],
 gow:['#000','#fff','#e01a22','#fff','Anton','#e01a22'],ccold:['#000','#fff','#e01a22','#fff','Anton','#e01a22'],void:['#05020d','#efe6ff','#c04df0','#fff','VT323','#c04df0'],
 yt:['#0f0f0f','#fff','#fff','#0f0f0f','Roboto','#ff0033'],oldhub:['#120c1e','#f3ecdf','#ff0033','#fff','Silkscreen','#ffcc4d'],ballfight:['#120c1e','#f3ecdf','#ffcc4d','#120c1e','Silkscreen','#ff0033'],
 'v-lovely':['#fff8f1','#3a2430','#ff5d8f','#fff','Fredoka','#ffb347'],'v-arcade':['#1a1440','#ffd257','#ff5d8f','#fff','Silkscreen','#7c6cff'],'v-larper':['#1a1440','#ffcc4d','#7c6cff','#fff','Silkscreen','#ff5d8f'],
 'v-purple':['#241640','#ffcc4d','#38e1d0','#0a0814','Silkscreen','#7c6cff'],'v-white':['#080a12','#dde0e8','#9ab4e8','#080a12','Silkscreen','#cfe0ff'],'v-strings':['#080a12','#dde0e8','#ffe66d','#080a12','Silkscreen','#c9ced8']};
function theme(b){const t=TH[b.moon?'yt':b.id]||TH.sun;return `--bg:${t[0]};--fg:${t[1]};--ac:${t[2]};--bf:${t[3]};--ft:'${t[4]}';--bd:${t[5]}`}
const NOINFO={sun:1};
// night-side lights (shadow side, lower right since light comes from upper left)
const NIGHT={sea:{c:['#9ff5ff','#48cae4'],d:.3},yt:{c:['#ff3355','#ff9aa8'],d:.32},moon:{c:['#ffd9a0'],d:.25},
 gow:{post:1,c:['#ffe27a','#fff2b0'],d:.06},arena:{post:1,c:['#ffd54a','#ff6464','#7ad8ff'],d:.05},ashaad:{post:1,c:['#ffb040','#ffd27a'],d:.035,glow:1}};
function nightPass(S,nc,t,flat){const W=S.c.width,Hh=S.c.height,im=S.g.getImageData(0,0,W,Hh),d=im.data,cs=flat?2:1;let n=0;
 for(let y=Math.floor(Hh*.4);y<Hh;y+=cs)for(let x=Math.floor(W*.5);x<W;x+=cs){const o=(y*W+x)*4;if(d[o+3]<200)continue;const sh=(x/W-.5)*1.4+(y/Hh-.4)*1.1;if(sh<.45)continue;
  const i=Math.floor(x/(cs*2)),j=Math.floor(y/(cs*2)),h=P.H(i*13+5,j*7+3);if(h>nc.d)continue;if(!flat&&P.H(i+77,j+Math.floor(t*1.4+h*40))<.2)continue;
  const c=P.hx(nc.c[(i+j)%nc.c.length]);for(let yy=0;yy<cs;yy++)for(let xx=0;xx<cs;xx++){const q=((y+yy)*W+x+xx)*4;if(q<d.length){d[q]=c[0];d[q+1]=c[1];d[q+2]=c[2]}}
  if(nc.glow&&!flat)for(const[a,b2]of[[1,0],[-1,0],[0,1],[0,-1]]){const q=((y+b2)*W+x+a)*4;if(q>=0&&q<d.length&&d[q+3]>200){d[q]=Math.min(255,d[q]*.5+c[0]*.5);d[q+1]=Math.min(255,d[q+1]*.5+c[1]*.4);d[q+2]=d[q+2]*.6}}}
 S.g.putImageData(im,0,0)}
const PLAY=(d,l,m)=>`<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="${d}" d="M4 2h2v1h2v1h2v1h2v1h2v4h-2v1h-2v1h-2v1h-2v1h-2z"/><path fill="${l}" d="M5 4h1v1h2v1h2v1h2v2h-2v1h-2v1h-2v1h-1z"/><path fill="${m}" d="M5 8h1v3h-1zM6 9h2v1h-2z"/></svg>`;
const YTLOGO=`<svg class="lgsvg" viewBox="0 0 24 17" shape-rendering="crispEdges"><path fill="#ff0033" d="M2 0h20v1h1v1h1v13h-1v1h-1v1h-20v-1h-1v-1h-1v-13h1v-1h1z"/><path fill="#b8001f" d="M1 14h22v1h-1v1h-20v-1h-1z"/><path fill="#fff" d="M9 4h2v1h2v1h2v1h2v2h-2v1h-2v1h-2v1h-2z"/></svg><b class="lgtx">LLC Powered<br>Channels</b>`;
// box = [width frac of w, height frac of h, y offset frac of h]
const LG={arena:{box:[.6,.42,-.02],pal:['#3a1a06','#ffcf3a','#ff6464'],arena:1},sea:{box:[.56,.56,0],img:'sea',pal:['#021e5a','#90E0EF','#48CAE4']},ashaad:{box:[.66,.5,.06],img:'ashaad',pal:['#2a1608','#ffd23a','#c08a1e']},void:{box:[.3,.74,0],img:'void',pal:['#05020d','#e6c8ff','#c04df0']},
 yt:{box:[.6,.6,0],pal:['#2a0008','#ffffff','#ffb0b8']},gow:{box:[.2,.2,.3],btn:1,pal:['#000000','#ffffff','#e01a22']},moon:{box:[.62,.62,0],pal:['#2a0008','#ffffff','#ffb0b8']}};
const lgOf=b=>b.moon?LG.moon:LG[b.id];
const TITLES={void:1,ashaad:1,sea:1,oldhub:1,'v-lovely':1,'v-arcade':1,'v-larper':1,'v-purple':1,'v-white':1,'v-strings':1};
function infoHTML(b){const L=lgOf(b);if(L){const href=b.moon?b.moon.url:b.href,nm=b.moon?b.moon.name:b.title,pl=`<a class="lgplay"${href?` href="${href}" target="_blank" rel="noopener"`:` href="#" data-chans="1"`} aria-label="${b.yt?'Show channels':'Play '+nm}">${PLAY(...L.pal)}</a>`;
  const logo=L.btn?'':L.img?`<img class="lgimg" src="world/titles/${L.img}.png" alt="${nm}">`:b.yt?`<div class="lglogo">${YTLOGO}</div>`:L.arena?`<div class="lglogo"><b class="lgtx fb">BALL<br>ARENA</b></div>`:`<div class="lglogo"><b class="lgtx mo">${nm}</b></div>`;
  const ch=b.yt?`<div class="lgch" hidden>${CH.map(c=>`<button class="lgc" data-moon="m-${c.id}">${c.name}</button>`).join('')}</div>`:'';
  return `<h2 class="sr">${nm}</h2>${logo}${pl}${ch}`}
 if(TITLES[b.id]){const ex=/^https?:/.test(b.href)?' target="_blank" rel="noopener"':'';return `<h2 class="sr">${b.title}</h2><a class="tlink" href="${b.href}"${ex} aria-label="${b.title}"><img class="timg" src="world/titles/${b.id}.png" alt="${b.title}"></a><a class="go" href="${b.href}"${ex}>${b.cta}</a>`}
const a=s=>/^https?:/.test(s)?' target="_blank" rel="noopener"':'';
 if(b.yt)return `<h2>${b.title}</h2><p class="stat"><b>${fmt(TV)}</b> views · <b>${fmt(TS)}</b> subs</p><div class="mlist">${CH.map(c=>`<button class="go sm" data-moon="m-${c.id}">${c.name}</button>`).join('')}</div>`;
 if(b.moon){const c=b.moon;return `<h2>${c.name}</h2><p class="stat"><b>${fmt(c.subs)}</b> subs · <b>${fmt(c.views)}</b> views</p><a class="go" href="${c.url}" target="_blank" rel="noopener">▶ Watch</a>`}
 return `<h2>${b.title}</h2>${b.href?`<a class="go" href="${b.href}"${a(b.href)}>${b.cta}</a>`:''}`}
function faceR(b){return b.id==='void'?b.w*.12:b.w*b.hr}
function focusOn(b,push=true){hideTip();window.__blip&&__blip("click");if(b.arch){enterArchive();return}if(b.home){warpTo('main');return}
 focus=b;info.className='';const bare=NOINFO[b.id];info.innerHTML=bare?'':'<div class="txt" style="'+theme(b)+'">'+infoHTML(b)+'</div>';
 const[x,y]=pos(b),fr=faceR(b),z=Math.min(W,H)*(W<H?.95:.82)/Math.max(b.w*(b.id==='void'?.62:b.yt?1.75:.92),1);
 info.querySelectorAll('[data-chans]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();el.hidden=true;const c=info.querySelector('.lgch');c.hidden=false;const lg=info.querySelector('.lglogo');if(lg)lg.hidden=true});
 info.querySelectorAll('[data-moon]').forEach(el=>el.onclick=e=>{e.stopPropagation();focusOn(MOONS.find(m=>m.id===el.dataset.moon))});
 to(x,y,z,950,()=>{if(bare)return;revealT=performance.now();info.classList.add('on')});
 if(push&&!RM)history.pushState({f:b.id},'');}
function unfocus(){if(!focus)return;focus=null;info.className='';info.innerHTML='';to(fitX(),fitY(),fitZ(),900)}
function placeInfo(){const b=focus,[x,y]=pos(b),[sx,sy]=W2S(x,y),L=lgOf(b);info.classList.toggle('lg',!!L);info.classList.toggle('lgbtn',!!(L&&L.btn));
 if(L){const bw=b.w*cam.z,bh=(b.h||b.w)*cam.z,w=bw*L.box[0],h=bh*L.box[1],cy2=sy+bh*L.box[2];info.style.cssText=`left:${Math.round(sx-w/2)}px;top:${Math.round(cy2-h/2)}px;width:${Math.round(w)}px;height:${Math.round(h)}px`}
 else{const D=Math.min(Math.max(faceR(b)*2*cam.z*.86,230),Math.min(W,H)*.92);info.style.cssText=`left:${Math.round(sx-D/2)}px;top:${Math.round(sy-D/2)}px;width:${Math.round(D)}px;height:${Math.round(D)}px`}
 if(!info.classList.contains('on'))return;const p=RM?1:clamp((performance.now()-revealT)/450);
 const tt=performance.now()/1000;info.style.setProperty('--rv',p);info.style.setProperty('--px',(RM?0:Math.sin(tt*.5)*6).toFixed(1)+'px');info.style.setProperty('--py',(RM?0:Math.cos(tt*.4)*3).toFixed(1)+'px')}
// ---- archive system ----
let warp=null;
function warpTo(to2){if(warp||sys===to2)return;focus=null;info.className='';info.innerHTML='';hideTip();
 if(RM){sys=to2;bodies=to2==='main'?MAIN:ARCH;cam.x=fitX();cam.y=fitY();cam.z=fitZ();document.body.classList.toggle('arch',to2==='archive');return}
 const sat=bodies.find(b=>b.arch||b.home);if(sat){const[x,y]=pos(sat);to(x,y,cam.z*3,700)}warp={t0:performance.now(),to:to2,swapped:false}}
function enterArchive(){if(sys==='archive'||warp)return;history.pushState({a:1},'');warpTo('archive')}
window.__museumBack=()=>backBtn.onclick();backBtn.onclick=()=>{if(history.state&&history.state.a)history.back();else warpTo('main')};
homeBtn.onclick=()=>{skipIntro();if(focus)unfocus();else to(fitX(),fitY(),fitZ(),700)};
if(archBtn)archBtn.onclick=()=>enterArchive();
addEventListener('popstate',()=>{if(focus)unfocus();else if(sys==='archive')warpTo('main')});
// ---- input: drag pan, wheel / pinch zoom, tap/click focus ----
const pts=new Map(),mv={x:0,y:0,t:0,on:0};let moved=0,pinch=null;
cv.addEventListener('pointerdown',e=>{mv.on=0;cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);moved=0;if(pts.size===2){const[a,b]=[...pts.values()];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1]),z:cam.z}}});
cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId)){const b=hit(e.clientX,e.clientY);hover=b;cv.style.cursor=b?'pointer':'grab';b&&!focus?showTip(b,e.clientX,e.clientY):(b&&b.moon&&focus&&focus.yt?showTip(b,e.clientX,e.clientY):hideTip());return}
 const p=pts.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];pts.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(dx)+Math.abs(dy);if(moved<6)return;
 if(intro)skipIntro();tw=null;if(pts.size===2&&pinch){const[a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,pinch.z*d/pinch.d/cam.z)}else{cam.x-=dx/cam.z;cam.y-=dy/cam.z;mv.x=-dx/cam.z;mv.y=-dy/cam.z;mv.t=performance.now()}cv.classList.add('drag')});
const up=e=>{if(pts.size===1&&moved>=6&&performance.now()-mv.t<80&&!RM)mv.on=1;pts.delete(e.pointerId);if(pts.size<2)pinch=null;cv.classList.remove('drag')};
cv.addEventListener('pointerup',e=>{up(e);if(moved>=6)return;if(intro){skipIntro();return}const b=hit(e.clientX,e.clientY);if(b&&b!==focus)focusOn(b);else if(!b&&focus)history.state&&history.state.f?history.back():unfocus()});
cv.addEventListener('pointercancel',up);cv.addEventListener('pointerleave',()=>{hover=null;hideTip()});
function zoomAt(sx,sy,f){const nz=Math.max(.15,Math.min(60,cam.z*f)),[wx,wy]=S2W(sx,sy);cam.z=nz;cam.x=wx-(sx-W/2)/nz;cam.y=wy-(sy-H/2)/nz}
cv.addEventListener('wheel',e=>{e.preventDefault();if(intro)skipIntro();tw=null;zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.0015))},{passive:false});
addEventListener('keydown',e=>{if(intro){skipIntro();return}if(e.key==='Escape'){if(focus)history.state&&history.state.f?history.back():unfocus();else if(sys==='archive')history.state&&history.state.a?history.back():warpTo('main')}});
function showTip(b,x,y){const tx=b.moon?b.moon.name:b.title;if(tip.textContent!==tx||!tip.classList.contains("on"))window.__blip&&__blip("hover");tip.textContent=tx;tip.style.left=x+14+'px';tip.style.top=y+14+'px';tip.classList.add('on')}
function hideTip(){tip.classList.remove('on')}
resize();if(intro){cam.z=Math.min(W,H)*.82/(250*.72)}else{cam.x=fitX();cam.y=fitY();cam.z=fitZ()}
// fixed top-left satellite: archive in, home out
const satBtn=document.getElementById('sat'),SAT=P.mk(64,40);satBtn.width=64;satBtn.height=40;const sg=satBtn.getContext('2d');
setInterval(()=>{P.satellite(SAT,RM?3:performance.now()/1000);sg.clearRect(0,0,64,40);sg.drawImage(SAT.c,0,0)},110);
satBtn.onclick=()=>{if(warp)return;if(focus)unfocus();if(sys==='main')enterArchive();else backBtn.onclick()};
const setSatLbl=()=>satBtn.setAttribute('aria-label',sys==='main'?'Fly to the archive of old versions':'Fly home');setInterval(setSatLbl,500);setSatLbl();
requestAnimationFrame(frame);
window.__ARCH=ARCH;window.__sys={MAIN,MOONS,SHIPS,SQ,P,hit:()=>{}};window.__flare=()=>{BF.next=0};window.__solar={cam,focus:id=>focusOn([...MAIN,...MOONS,...ARCH].find(b=>b.id===id)),unfocus,screen:id=>{const b=[...MAIN,...MOONS,...ARCH].find(b=>b.id===id);return W2S(...pos(b))},skip:skipIntro,get sys(){return sys},get intro(){return !!intro}};
})();

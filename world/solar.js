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
 B({id:'sun',paint:'sun',w:150,x:0,y:0,hr:.36,title:'Landrcyverse',by:'games & websites by Landry',blurb:'Every planet is one of my sites. Click a planet to fly to it.'}),
 B({id:'ashaad',paint:'ashaad',w:92,h:84,orb:140,per:50,ph:2.2,hr:.42,title:'The Binding of Ashaad',by:'a brainrot roguelike by landrcy',blurb:'Descend into the basement, shoot your tears, grab cursed items and survive in this browser roguelike. 3 starters, 4 floors, 1 secret Finley boss.',href:'https://landrcy.github.io/binding-of-ashaad/',cta:'▶ Play'}),
 B({id:'sea',paint:'sea',w:96,orb:208,per:72,ph:.4,hr:.4,title:'Sea of Thought',by:'a pixel ocean by landrcy',blurb:'A quiet pixel ocean full of messages in bottles: write one, throw it in, then dive and read what strangers left behind.',href:'https://landrcy.github.io/sea-of-thought/',cta:'▶ Dive in'}),
 B({id:'yt',paint:'yt',w:78,orb:285,per:96,ph:4.1,hr:.42,title:'LLC Powered Channels',by:'YouTube',yt:1}),
 B({id:'gow',paint:'crest',w:124,h:100,orb:375,per:140,ph:5.3,hr:.42,title:'Game of Websites',by:'coopercitywebsites.github.io',blurb:'A searchable catalogue of every site in the collection: unblocked games, NeoForge mods, old builds and the trash pile, ranked by how much code went into each one.',href:'https://coopercitywebsites.github.io/main/',cta:'Open'}),
 B({id:'void',paint:'void',w:290,h:150,x:560,y:-300,hr:.16,title:'The Void',by:'a pixel space game by landrcy',blurb:'A pixel space game at the edge of a black hole. Fall in.',href:'https://landrcy.github.io/the-void/',cta:'▶ Play',fs:.13})];
const MOONS=CH.map((c,i)=>B({id:'m-'+c.id,paint:'moon',arg:c.kind,w:Math.round(12+14*Math.sqrt((c.views||0)/MV)),orb:50+i*9,per:9+i*2.6,ph:i*1.3,hr:.42,moon:c,title:c.name}));
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
for(const b of [...MAIN,...MOONS,...ARCH]){b.L=LOD.map(([dv0])=>{const dv=b.paint==='crest'?Math.min(dv0,2.2):dv0;return P.mk(Math.max(8,Math.round(b.w/dv)),Math.max(6,Math.round((b.h||b.w)/dv)))});b.S=b.L[2];b.nx=[0,0,0];b.ang=b.ph||0}
let sys='main',bodies=MAIN;
// ---- camera ----
const cam={x:0,y:0,z:1};let tw=null,focus=null,hover=null,intro=RM?null:{t0:performance.now()};
function fitZ(){const ext=sys==='main'?(W<H?[500,490]:[680,390]):(W<H?[490,300]:[490,300]);return Math.min(W/(2*ext[0]),(H-90)/(2*ext[1]))}
function fitX(){return sys==='main'&&W>=H?40:0}
function fitY(){return sys==='main'&&W<H?-150:0}
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
 for(let y=0;y<P0;y++)for(let x=0;x<P0;x++){const ax=x/P0,ay=y/P0,n=f(x,y)*(1-ax)*(1-ay)+f(x+P0,y)*ax*(1-ay)+f(x,y+P0)*(1-ax)*ay+f(x+P0,y+P0)*ax*ay;
  const v=Math.max(0,n*1.35)*1.4;const c=P.hx(P.dq(R,v,x,y,v>.5?P.STAR:P.bay)),o=(y*P0+x)*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
 S.g.putImageData(S.img,0,0);neb=S}
function resize(){const vd=MAIN.find(b=>b.id==='void');if(innerWidth<innerHeight){vd.x=150;vd.y=-560}else{vd.x=520;vd.y=-300}DPR=1;W=innerWidth;H=innerHeight;cv.width=W;cv.height=H;g.imageSmoothingEnabled=false;buildNeb();if(!focus&&!tw){cam.z=intro?cam.z:fitZ();if(!intro){cam.x=fitX();cam.y=fitY()}}}
addEventListener('resize',resize);
// ---- intro timeline ----
const clamp=v=>Math.max(0,Math.min(1,v)),seg=(t,a,b)=>clamp((t-a)/(b-a));
function introState(now){if(!intro)return{stars:1,ign:1,L:1,orb:1,pop:()=>1};const t=(now-intro.t0)/1000;
 return{t,stars:seg(t,0,.9),ign:seg(t,.5,1.7),L:seg(t,1.7,3.7),orb:seg(t,4.4,6),pop:i=>{const p=seg(t,5.2+i*.32,5.75+i*.32);return p<=0?0:1+Math.sin(p*Math.PI)*.25*(1-p)-(1-p)*(1-p)*.9}}}
function skipIntro(){if(!intro)return;intro=null;to(fitX(),fitY(),fitZ(),700)}
// ---- render ----
let last=performance.now(),FA=0;
function lens(){if(sys!=='main')return;const b=MAIN.find(q=>q.id==='void'),[sx,sy]=W2S(b.x,b.y),E=b.w*.084*cam.z*1.9,Rr=Math.ceil(E*3.2);
 if(E<3||sx+Rr<0||sy+Rr<0||sx-Rr>W||sy-Rr>H)return;const x0=Math.max(0,Math.floor(sx-Rr)),y0=Math.max(0,Math.floor(sy-Rr)),x1=Math.min(W,Math.ceil(sx+Rr)),y1=Math.min(H,Math.ceil(sy+Rr)),w=x1-x0,h=y1-y0;if(w<2||h<2)return;
 const src=g.getImageData(x0,y0,w,h),out=g.createImageData(w,h),a=src.data,o=out.data,E2=E*E;
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=x0+x+.5-sx,dy=(y0+y+.5-sy)/.8,d2=dx*dx+dy*dy,i=(y*w+x)*4;if(d2>Rr*Rr){o[i]=a[i];o[i+1]=a[i+1];o[i+2]=a[i+2];o[i+3]=255;continue}
  const f=1-E2/Math.max(d2,1),fall=Math.min(1,Math.sqrt(d2)/Rr),k=f*(1-fall*fall)+fall*fall;let X=Math.round(sx+dx*k-x0),Y=Math.round(sy+dy*.8*k-y0);
  if(f<0){X=Math.round(sx-dx*.6*(E2/d2)-x0);Y=Math.round(sy-dy*.8*.6*(E2/d2)-y0)}X=Math.max(0,Math.min(w-1,X));Y=Math.max(0,Math.min(h-1,Y));const j=(Y*w+X)*4;o[i]=a[j];o[i+1]=a[j+1];o[i+2]=a[j+2];o[i+3]=255}
 g.putImageData(out,x0,y0)}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;const IS=introState(now);FA+=((focus?1:0)-FA)*Math.min(1,dt*4);if(mv.on&&!tw){const k=Math.pow(.9,dt*60);mv.x*=k;mv.y*=k;cam.x+=mv.x*dt*60;cam.y+=mv.y*dt*60;if(Math.hypot(mv.x,mv.y)*cam.z<.1)mv.on=0}
 if(intro){if(IS.t<3.9){cam.x=0;cam.y=0;cam.z=Math.min(W,H)*.82/(150*.72)}else if(!intro.zoomed){intro.zoomed=1;to(fitX(),fitY(),fitZ(),1500)}if(IS.t>8.2)intro=null}
 if(tw){const k=ease(clamp((now-tw.t0)/tw.ms));const zl=Math.exp(Math.log(tw.a.z)+(Math.log(tw.b.z)-Math.log(tw.a.z))*k);cam.x=tw.a.x+(tw.b.x-tw.a.x)*k;cam.y=tw.a.y+(tw.b.y-tw.a.y)*k;cam.z=zl;if(k>=1){const d=tw.done;tw=null;d&&d()}}
 // orbit motion: hover/focus slows to a stop
 const list=sys==='main'?[...bodies,...MOONS]:bodies;
 for(const b of list){if(b.orb==null)continue;const frozen=focus&&(focus===b||(b.moon?(focus===b||focus.moon):(b.id==='yt'&&(focus.yt||focus.moon))));const tgt=RM||frozen?0:hover===b?0:(hover&&hover.yt&&b.moon)?.35:1;b.sf+=(tgt-b.sf)*Math.min(1,dt*4);b.ang+=dt*TAU/b.per*b.sf}
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
 for(const b of bodies)if(b.orb!=null)ring(0,0,b.orb,IS.orb,'rgba(170,175,255,.42)');
 if(sys==='main'){const[yx,yy]=pos(MAIN[3]);if(cam.z>1.3)for(const m of MOONS)ring(yx,yy,m.orb,IS.orb,'rgba(255,120,120,.22)')}
 // sprites, back-to-front
 const draw=[];bodies.forEach((b,i)=>draw.push([b,i]));if(sys==='main')MOONS.forEach((m,i)=>draw.push([m,3]));
 draw.sort((a,b)=>pos(a[0])[1]-pos(b[0])[1]);
 for(const[b,i]of draw){const pp=b.id==='sun'||b.id==='oldhub'?1:IS.pop(Math.min(i,7)+(b.moon?.5:0));if(pp<=0)continue;const isF=focus&&(b===focus||(focus.yt&&b.moon)),dim=isF||FA<.005?1:1-.72*FA;
  const[x,y]=pos(b),[sx,sy]=W2S(x,y),w=b.w*cam.z*pp,h=(b.h||b.w)*cam.z*pp;
  if(sx+w<0||sx-w>W||sy+h<0||sy-h>H)continue;
  const lv=lodLv(),t0=Math.floor(lv),fr=t0>=2?0:Math.max(0,Math.min(1,(lv-t0-.3)/.4)),fs=fr*fr*(3-2*fr);
  const ga=g.globalAlpha,tiers=fs>=1?[[t0+1,1]]:fs>0?[[t0,1],[t0+1,fs]]:[[t0,1]];
  for(const[ti,al]of tiers){const S=b.L[ti];
   if(now>=b.nx[ti]||(b.id==='sun'&&intro)){const o=b.id==='sun'?{ign:IS.ign,L:IS.L}:b.arg;P[b.paint](S,RM?7:now/1000+(b.ph||0)*3,o);if(LOD[ti][1])P.reduce(S,LOD[ti][1]+(b.paint==='crest'?3:b.paint==='sea'?2:0));b.nx[ti]=RM?Infinity:now+(ti?34:48)+Math.random()*8}
   g.globalAlpha=ga*al*dim;g.filter=dim<1&&FA>.05?`blur(${(FA*1.5).toFixed(2)}px)`:'none';g.drawImage(S.c,Math.round(sx-w/2),Math.round(sy-h/2),Math.round(w),Math.round(h))}
  g.globalAlpha=ga;g.filter='none'}
 g.globalAlpha=1;if(focus)placeInfo();
 requestAnimationFrame(frame)}
// ---- hit testing ----
function hit(sx,sy){const[wx,wy]=S2W(sx,sy);let best=null,bd=1e9;const list=sys==='main'?[...MOONS,...bodies]:bodies;
 for(const b of list){const[x,y]=pos(b),r=b.w*b.hr*(b.id==='void'?1.4:1),d=Math.hypot(wx-x,(wy-y)*(b.id==='void'?1.6:1));if(d<r&&d/r<bd){bd=d/r;best=b}}return best}
// ---- focus & info ----
let revealT=0;
const TH={sun:['#080a12','#dde0e8','#ffe66d','#080a12','Silkscreen','#9ab4e8'],ashaad:['#120a0c','#e8dcc0','#ffd23a','#2a1608','Silkscreen','#5a3a20'],sea:['#021e5a','#90E0EF','#48CAE4','#021e5a','VT323','#f3dfae'],
 gow:['#000','#fff','#e01a22','#fff','Anton','#e01a22'],ccold:['#000','#fff','#e01a22','#fff','Anton','#e01a22'],void:['#05020d','#efe6ff','#c04df0','#fff','VT323','#c04df0'],
 yt:['#0f0f0f','#fff','#fff','#0f0f0f','Roboto','#ff0033'],oldhub:['#120c1e','#f3ecdf','#ff0033','#fff','Silkscreen','#ffcc4d'],ballfight:['#120c1e','#f3ecdf','#ffcc4d','#120c1e','Silkscreen','#ff0033'],
 'v-lovely':['#fff8f1','#3a2430','#ff5d8f','#fff','Fredoka','#ffb347'],'v-arcade':['#1a1440','#ffd257','#ff5d8f','#fff','Silkscreen','#7c6cff'],'v-larper':['#1a1440','#ffcc4d','#7c6cff','#fff','Silkscreen','#ff5d8f'],
 'v-purple':['#241640','#ffcc4d','#38e1d0','#0a0814','Silkscreen','#7c6cff'],'v-white':['#080a12','#dde0e8','#9ab4e8','#080a12','Silkscreen','#cfe0ff'],'v-strings':['#080a12','#dde0e8','#ffe66d','#080a12','Silkscreen','#c9ced8']};
function theme(b){const t=TH[b.moon?'yt':b.id]||TH.sun;return `--bg:${t[0]};--fg:${t[1]};--ac:${t[2]};--bf:${t[3]};--ft:'${t[4]}';--bd:${t[5]}`}
const NOINFO={sun:1,sea:1,void:1,yt:1};
const TITLES={void:1,ashaad:1,sea:1,oldhub:1,'v-lovely':1,'v-arcade':1,'v-larper':1,'v-purple':1,'v-white':1,'v-strings':1};
function infoHTML(b){if(TITLES[b.id]){const ex=/^https?:/.test(b.href)?' target="_blank" rel="noopener"':'';return `<h2 class="sr">${b.title}</h2><a class="tlink" href="${b.href}"${ex} aria-label="${b.title}"><img class="timg" src="world/titles/${b.id}.png" alt="${b.title}"></a><a class="go" href="${b.href}"${ex}>${b.cta}</a>`}
const a=s=>/^https?:/.test(s)?' target="_blank" rel="noopener"':'';
 if(b.yt)return `<h2>${b.title}</h2><p class="stat"><b>${fmt(TV)}</b> views · <b>${fmt(TS)}</b> subs</p><div class="mlist">${CH.map(c=>`<button class="go sm" data-moon="m-${c.id}">${c.name}</button>`).join('')}</div>`;
 if(b.moon){const c=b.moon;return `<h2>${c.name}</h2><p class="stat"><b>${fmt(c.subs)}</b> subs · <b>${fmt(c.views)}</b> views</p><a class="go" href="${c.url}" target="_blank" rel="noopener">▶ Watch</a>`}
 return `<h2>${b.title}</h2>${b.href?`<a class="go" href="${b.href}"${a(b.href)}>${b.cta}</a>`:''}`}
function faceR(b){return b.id==='void'?b.w*.12:b.w*b.hr}
function focusOn(b,push=true){hideTip();if(b.arch){enterArchive();return}if(b.home){warpTo('main');return}
 focus=b;info.className='';const bare=NOINFO[b.id];info.innerHTML=bare?'':'<div class="txt" style="'+theme(b)+'">'+infoHTML(b)+'</div>';
 const[x,y]=pos(b),fr=faceR(b),z=Math.min(W,H)*(W<H?.95:.82)/Math.max(b.w*(b.id==='void'?.5:b.yt?1.75:.92),1);
 info.querySelectorAll('[data-moon]').forEach(el=>el.onclick=e=>{e.stopPropagation();focusOn(MOONS.find(m=>m.id===el.dataset.moon))});
 to(x,y,z,950,()=>{if(bare)return;revealT=performance.now();info.classList.add('on')});
 if(push&&!RM)history.pushState({f:b.id},'');}
function unfocus(){if(!focus)return;focus=null;info.className='';info.innerHTML='';to(fitX(),fitY(),fitZ(),900)}
function placeInfo(){const b=focus,[x,y]=pos(b),[sx,sy]=W2S(x,y),D=Math.min(Math.max(faceR(b)*2*cam.z*.86,230),Math.min(W,H)*.92);
 info.style.cssText=`left:${Math.round(sx-D/2)}px;top:${Math.round(sy-D/2)}px;width:${Math.round(D)}px;height:${Math.round(D)}px`;
 if(!info.classList.contains('on'))return;const p=RM?1:clamp((performance.now()-revealT)/450);
 const tt=performance.now()/1000;info.style.setProperty('--rv',p);info.style.setProperty('--px',(RM?0:Math.sin(tt*.5)*6).toFixed(1)+'px');info.style.setProperty('--py',(RM?0:Math.cos(tt*.4)*3).toFixed(1)+'px')}
// ---- archive system ----
let warp=null;
function warpTo(to2){if(warp||sys===to2)return;focus=null;info.className='';info.innerHTML='';hideTip();
 if(RM){sys=to2;bodies=to2==='main'?MAIN:ARCH;cam.x=fitX();cam.y=fitY();cam.z=fitZ();document.body.classList.toggle('arch',to2==='archive');return}
 const sat=bodies.find(b=>b.arch||b.home);if(sat){const[x,y]=pos(sat);to(x,y,cam.z*3,700)}warp={t0:performance.now(),to:to2,swapped:false}}
function enterArchive(){if(sys==='archive'||warp)return;history.pushState({a:1},'');warpTo('archive')}
backBtn.onclick=()=>{if(history.state&&history.state.a)history.back();else warpTo('main')};
homeBtn.onclick=()=>{skipIntro();if(focus)unfocus();else to(fitX(),fitY(),fitZ(),700)};
archBtn.onclick=()=>enterArchive();
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
function showTip(b,x,y){const c=b.moon;tip.innerHTML=c?`<b>${c.name}</b><br>${fmt(c.subs)} subs · ${fmt(c.views)} views`:`<b>${b.title}</b>${b.arch?'<br>fly to the archive of old versions':b.by?'<br>'+b.by:''}`;tip.style.left=x+14+'px';tip.style.top=y+14+'px';tip.classList.add('on')}
function hideTip(){tip.classList.remove('on')}
resize();if(intro){cam.z=Math.min(W,H)*.82/(150*.72)}else{cam.x=fitX();cam.y=fitY();cam.z=fitZ()}
// fixed top-left satellite: archive in, home out
const satBtn=document.getElementById('sat'),SAT=P.mk(64,40);satBtn.width=64;satBtn.height=40;const sg=satBtn.getContext('2d');
setInterval(()=>{P.satellite(SAT,RM?3:performance.now()/1000);sg.clearRect(0,0,64,40);sg.drawImage(SAT.c,0,0)},110);
satBtn.onclick=()=>{if(warp)return;if(focus)unfocus();if(sys==='main')enterArchive();else backBtn.onclick()};
const setSatLbl=()=>satBtn.setAttribute('aria-label',sys==='main'?'Fly to the archive of old versions':'Fly home');setInterval(setSatLbl,500);setSatLbl();
requestAnimationFrame(frame);
window.__ARCH=ARCH;window.__solar={cam,focus:id=>focusOn([...MAIN,...MOONS,...ARCH].find(b=>b.id===id)),unfocus,screen:id=>{const b=[...MAIN,...MOONS,...ARCH].find(b=>b.id===id);return W2S(...pos(b))},skip:skipIntro,get sys(){return sys},get intro(){return !!intro}};
})();

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
 B({id:'yt',paint:'yt',w:96,orb:885,per:140,ph:4.1,hr:.42,title:'LLC Powered Channels',by:'YouTube',yt:1}),
 B({id:'gow',paint:'crest',w:92,h:74,orb:1590,per:315,ph:5.3,hr:.42,title:'Game of Websites',by:'coopercitywebsites.github.io',blurb:'A searchable catalogue of every site in the collection: unblocked games, NeoForge mods, old builds and the trash pile, ranked by how much code went into each one.',href:'https://coopercitywebsites.github.io/main/',cta:'Open'}),
 B({id:'void',paint:'void',w:236,h:236,orb:1255,per:245,ph:5.9,tc:'#c04df0',hr:.16,title:'The Void',by:'a pixel space game by landrcy',blurb:'A pixel space game at the edge of a black hole. Fall in.',href:'https://landrcy.github.io/the-void/',cta:'▶ Play',fs:.13}),
 B({id:'arena',paint:'arena',w:134,h:110,orb:1080,per:185,ph:2.9,hr:.42,title:'Ball Arena',by:'ball fights from the Langrino channel',href:'https://www.youtube.com/@Langrino',cta:'▶ Watch'}),
 B({id:'pmuseum',paint:'temple',w:150,orb:525,per:98,ph:1.4,hr:.4,title:'Pixel Museum',href:'https://landrcy.github.io/pixel-museum/',cta:'▶ Visit'}),
 B({id:'wam',paint:'wam',w:104,orb:1425,per:272,ph:3.6,hr:.4,title:'W.A.M.',href:'https://landrcy.github.io/wam/',cta:'▶ Play'})];
const MOONS=CH.map((c,i)=>B({id:'m-'+c.id,paint:'moon',arg:c.kind,w:Math.round(12+14*Math.sqrt((c.views||0)/MV)),orb:66+i*9,per:9+i*2.6,ph:i*1.3,dir:1,hr:.42,moon:c,title:c.name}));
// Pixel Museum room moons: one animated relic per museum room, two rings (west wing sites inside, east wing vaults outside)
const PMU=MAIN.find(b=>b.id==='pmuseum'),PMURL='https://landrcy.github.io/pixel-museum/#';
const ROOMS=[['hub','Landrcyverse Observatory','Landrcyverse','lsun',18],['void','The Void Abyss','The Void','voidorb',18],['sea','Sea of Thought','Sea of Thought','bottle',17],['ashaad','The Binding of Ashaad','Ashaad','chained',18],['llc','LLC Broadcast Shrine','LLC Channels','tv',18],['arena','Ball Arena Colosseum','Ball Arena','glove',16],['city','Cooper Sky City','Cooper City','crest',16],
 ['mecha','Mecha Forge','Mecha Forge','mech',20],['swords','Hall of Blades & Armor','Swords & Armor','sword',22],['books','Arcane Library','Arcane Library','book',20],['dragon','Dragon Hoard','Dragon Hoard','dragon',22],['crystal','Crystal Cavern','Crystal Cavern','crystal',20],['cyber','Neon Cyber Shrine','Cyber Shrine','torii',20],['relic','Starship Relic Vault','Relic Vault','cube',19]];
const RMOONS=ROOMS.map(([id,title,short,kind,w],i)=>{const outer=i>=7,k=i%7;return B({id:'r-'+id,paint:'rmoon',arg:kind,w,orb:outer?124:84,per:outer?52:34,ph:k*TAU/7+(outer?.45:0),hr:.45,par:PMU,room:id,short,title,href:PMURL+id})});
MOONS.push(...RMOONS);
// W.A.M. party moons: the warrior's sword, the archer's bow and the mage's staff
const WAMB=MAIN.find(b=>b.id==='wam');
MOONS.push(...[['sword',"Warrior's Sword",'SWORD','wsword',19],['bow',"Archer's Bow",'BOW','wbow',18],['staff',"Mage's Staff",'STAFF','wstaff',20]].map(([id,title,short,kind,w],i)=>B({id:'w-'+id,paint:'rmoon',arg:kind,w,orb:70,per:30,ph:i*TAU/3+.3,hr:.45,par:WAMB,short,title,href:WAMB.href})));
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
const cam={x:0,y:0,z:1};let tw=null,focus=null,hover=null,intro=RM?null:{t0:performance.now()};if(intro)document.body.classList.add('intro');
function fitZ(){const ext=sys==='main'?(W<H?[1650,1560]:[1680,1040]):(W<H?[490,300]:[490,300]);return Math.min(W/(2*ext[0]),(H-90)/(2*ext[1]))}
function fitX(){return 0}
function fitY(){return 0}
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
function to(x,y,z,ms=900,done){mv.on=0;if(RM)ms=1;tw={a:{...cam},b:{x,y,z},t0:performance.now(),ms,done}}
// ---- body positions ----
const parent=b=>b.moon?MAIN[3]:b.par||null;
function pos(b){if(b.orb==null)return[b.x,b.y];const c=b.moon?pos(MAIN[3]):b.par?pos(b.par):[0,0];return[c[0]+Math.cos(b.ang)*b.orb,c[1]+Math.sin(b.ang)*b.orb*SQ]}
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
function introState(now){if(!intro)return{stars:1,ign:1,fl:1,L:1,orb:1,pop:()=>1};const t=(now-intro.t0)/1000;
 return{t,R:revealR(t),stars:1,ign:seg(t,.5,1.7),fl:seg(t,1.6,3.0),L:seg(t,1.7,3.7),orb:1,pop:()=>1,popOld:i=>{const p=seg(t,5.2+i*.32,5.75+i*.32);return p<=0?0:1+Math.sin(p*Math.PI)*.25*(1-p)-(1-p)*(1-p)*.9}}}
// ---- the rift: the solar system is a jagged pixel tear in the old white dot-grid space; small tears peek into archived versions ----
const RC=5,RX=3900,RY=4700,RGW=RX*2/RC|0,RGH=RY*2/RC|0;
const hsh=(a,b)=>{let h=(a*374761393+b*668265263)^0x5bd1e995;h=Math.imul(h^(h>>>13),1274126177);return((h^(h>>>16))>>>0)/4294967296};
const an1=(a,f,s)=>{const x=a/TAU*f,i=Math.floor(x),u=x-i,k=u*u*(3-2*u);return hsh(((i%f)+f)%f,s)*(1-k)+hsh((((i+1)%f)+f)%f,s)*k};
// piecewise-linear angular noise: hard corners instead of smooth waves
const lin=(a,f,s)=>{const x=((a/TAU)%1+1)%1*f,i=Math.floor(x),u=x-i;return hsh(i%f,s)*(1-u)+hsh((i+1)%f,s)*u};
// edge profile: sharp shards + uneven notches at varied scales, precomputed into a lookup table (seeded, stable)
const JT={};function jagTab(s){if(JT[s])return JT[s];const n=8192,T=new Float32Array(n),SH=[];let r=s*977+1;const rnd=()=>(r=hsh(r,s+71)*1e6|0,hsh(r,s+3));
 for(let i=0;i<95;i++){const big=rnd()<.18,notch=rnd()<.3;SH.push([rnd()*TAU,(big?.02+rnd()*.05:.002+rnd()*.016)*(notch?1.4:1),notch?-(.015+rnd()*(big?.07:.03)):(big?.06+rnd()*.13:.012+rnd()*.05),rnd()*.8-.4])}
 for(let k=0;k<n;k++){const a=k/n*TAU;let v=.08*(lin(a,9,s)-.5)*2+.045*(lin(a,23,s+1)-.5)*2+.025*(lin(a,61,s+2)-.5)*2+.012*(lin(a,173,s+4)-.5)*2;
  for(const[c,w,h,sk]of SH){let d=Math.atan2(Math.sin(a-c),Math.cos(a-c))/w;d+=d*sk*Math.sign(d);if(d>-1&&d<1)v+=h*(1-Math.abs(d))}T[k]=v}return JT[s]=T}
const jag=(a,s)=>{const T=jagTab(s);return T[((Math.round(a/TAU*8192)%8192)+8192)%8192]};
function riftGrid(gw,gh,cell,cx,cy,ax,ay,seed){const m=new Uint8Array(gw*gh);for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const x=(i+.5)*cell-cx,y=(j+.5)*cell-cy,a=Math.atan2(y/ay,x/ax),r=Math.hypot(x/ax,y/ay);m[j*gw+i]=r<1+jag(a,seed)?1:0}return m}
// branching cracks splintering out of the tear into the white (seeded): thick ones open the tear, hairlines are glow only
const HL=new Uint8Array(RGW*RGH),SEGS=[];
function riftCracks(m,gw,gh,cell,cx,cy,ax,ay,seed){let r=seed*131+7;const rnd=()=>(r=(hsh(r,seed)*1e7)|0,hsh(r,seed+9));
 const plot=(x,y,th)=>{const i=Math.floor((x+cx)/cell),j=Math.floor((y+cy)/cell);const t=Math.floor(th);for(let dj=-t;dj<=t;dj++)for(let di=-t;di<=t;di++){if(di*di+dj*dj>th*th+.5)continue;const ii=i+di,jj=j+dj;if(ii<1||jj<1||ii>=gw-1||jj>=gh-1)continue;if(th<.75)HL[jj*gw+ii]=1;else m[jj*gw+ii]=1}};
 const grow=(x,y,ang,len,th,depth)=>{let L=0;while(L<len){const seg=cell*(2+rnd()*5);ang+=(rnd()-.5)*.9;const nx=x+Math.cos(ang)*seg,ny=y+Math.sin(ang)*seg,st=Math.ceil(seg/(cell*.5));
   for(let q=1;q<=st;q++)plot(x+(nx-x)*q/st,y+(ny-y)*q/st,th*(1-L/len*.6));SEGS.push([x,y,nx,ny,th*(1-L/len*.6)*cell]);x=nx;y=ny;L+=seg;
   if(depth<3&&rnd()<(depth?.12:.2)){const bl=(len-L)*(.3+rnd()*.7);if(bl>cell*4)grow(x,y,ang+(rnd()<.5?-1:1)*(.35+rnd()*.9),bl,Math.max(.4,th*(.35+rnd()*.4)),depth+1)}}};
 const n=16+Math.floor(rnd()*6);for(let k=0;k<n;k++){const a=rnd()*TAU,e=1+jag(Math.atan2(Math.sin(a),Math.cos(a)),seed)-.01,x=Math.cos(a)*ax*e,y=Math.sin(a)*ay*e,big=rnd();
  grow(x,y,Math.atan2(Math.sin(a)*ax/ay,Math.cos(a))+(rnd()-.5)*.8,(big<.25?400:120)+rnd()*(big<.25?650:300),big<.2?2.2:big<.6?1.2:.5,0)}}
const RPAL=['#ffffff','#f0ddff','#d79cff','#b45cf0','#8a34d8','#5a1ea8'].map(c=>P.hx(c));
// mask (inside opaque) + 3 shimmer frames of the crackling edge, all at 1px per cell

const MR=riftGrid(RGW,RGH,RC,RX,RY,3000,3650,11);riftCracks(MR,RGW,RGH,RC,RX,RY,3000,3650,11);
// coarse distance fields (cells) used to skip the bulk; the edge itself is evaluated per screen texel
const cham=(inside)=>{const gw=RGW,gh=RGH,D=new Uint8Array(gw*gh).fill(9);for(let k=0;k<D.length;k++)if((MR[k]===1)!==inside)D[k]=0;
 for(let j=0;j<gh;j++)for(let i=0;i<gw;i++){const k=j*gw+i;let v=D[k];if(!v)continue;if(i>0)v=Math.min(v,D[k-1]+1);if(j>0){v=Math.min(v,D[k-gw]+1);if(i>0)v=Math.min(v,D[k-gw-1]+1);if(i<gw-1)v=Math.min(v,D[k-gw+1]+1)}D[k]=v}
 for(let j=gh-1;j>=0;j--)for(let i=gw-1;i>=0;i--){const k=j*gw+i;let v=D[k];if(!v)continue;if(i<gw-1)v=Math.min(v,D[k+1]+1);if(j<gh-1){v=Math.min(v,D[k+gw]+1);if(i<gw-1)v=Math.min(v,D[k+gw+1]+1);if(i>0)v=Math.min(v,D[k+gw-1]+1)}D[k]=v}return D};
const DOUT=cham(false),DIN=cham(true),SGH=new Map();
SEGS.forEach((g,n)=>{const p=g[4]+14,i0=Math.floor((Math.min(g[0],g[2])-p+RX)/RC),i1=Math.floor((Math.max(g[0],g[2])+p+RX)/RC),j0=Math.floor((Math.min(g[1],g[3])-p+RY)/RC),j1=Math.floor((Math.max(g[1],g[3])+p+RY)/RC);
 for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const k=j*RGW+i;let L=SGH.get(k);if(!L)SGH.set(k,L=[]);L.push(n)}});
const RAX=3000,RAY=3650;let rHair=1e9;
function riftSD(x,y,k){const a=Math.atan2(y/RAY,x/RAX),rr=Math.hypot(x/RAX,y/RAY),e=1+jag(a,11);let d=(rr-e)/Math.max(rr,1e-3)*Math.hypot(x,y);rHair=1e9;
 const L=SGH.get(k);if(L)for(const n of L){const g=SEGS[n],vx=g[2]-g[0],vy=g[3]-g[1],l2=vx*vx+vy*vy||1;let t=((x-g[0])*vx+(y-g[1])*vy)/l2;t=t<0?0:t>1?1:t;const q=Math.hypot(x-g[0]-vx*t,y-g[1]-vy*t);if(g[4]<RC*.75){if(q<rHair)rHair=q}else{const dd=q-g[4];if(dd<d)d=dd}}return d}

const inMain=(x,y)=>{const i=Math.floor((x+RX)/RC),j=Math.floor((y+RY)/RC);return i>=0&&j>=0&&i<RGW&&j<RGH&&MR[j*RGW+i]===1};
// small rifts: one per archived version, placed in the white space around the main tear (random per visit)
let OC=null,OG=null,ocK='',dotT=null,dotS=0;
function dotPat(s){if(s===dotS&&dotT)return dotT;dotS=s;const c=document.createElement('canvas');c.width=c.height=s;const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,s,s);x.fillStyle=s>=10?'#b9bfcc':'#ccd0da';const d=s>=18?2:1;x.fillRect(0,0,d,d);dotT=g.createPattern(c,'repeat');return dotT}
// is the whole screen inside the main tear (and no small rift on screen)? then there is nothing outside to draw
function allInside(){const[a,b]=S2W(0,0),[c,d]=S2W(W,H);for(let i=0;i<=6;i++)for(let j=0;j<=6;j++)if(!inMain(a+(c-a)*i/6,b+(d-b)*j/6))return false;return true}
let RCUT=null,RGLO=null;
function drawOutside(now){if(window.__noRift||sys!=='main')return;if(allInside())return;
 const z=cam.z,fr=RM?0:Math.floor(now/140)%3,key=[W,H,cam.x.toFixed(2),cam.y.toFixed(2),z.toFixed(4),fr].join();
 if(key!==ocK){ocK=key;
  if(!OC||OC.width!==W||OC.height!==H){OC=document.createElement('canvas');OC.width=W;OC.height=H;OG=OC.getContext('2d')}
  const o=OG;o.imageSmoothingEnabled=false;o.globalCompositeOperation='source-over';o.clearRect(0,0,W,H);
  const s=Math.max(4,Math.round(26*z)),[ox,oy]=W2S(0,0);o.save();o.translate(((ox%s)+s)%s,((oy%s)+s)%s);o.fillStyle=dotPat(s);o.fillRect(-s,-s,W+2*s,H+2*s);o.restore();
  // edge rendered per screen texel (same pixel size as the planets at this zoom)
  const T=REFT(),wt=Math.ceil(W/T),ht=Math.ceil(H/T),wpt=T/z,lim=Math.min(8,Math.ceil(5*wpt/RC)+1);
  if(!RCUT||RCUT.c.width!==wt||RCUT.c.height!==ht){const mk=()=>{const c=document.createElement('canvas');c.width=wt;c.height=ht;const x=c.getContext('2d');const im=x.createImageData(wt,ht);return{c,x,im,U:new Uint32Array(im.data.buffer)}};RCUT=mk();RGLO=mk()}
  const CU=RCUT.U,GU=RGLO.U;CU.fill(0);GU.fill(0);const PK=RPAL.map(c=>(255<<24)|(c[2]<<16)|(c[1]<<8)|c[0]),CUTV=0xff000000;
  for(let ty=0;ty<ht;ty++){const wy=cam.y+((ty+.5)*T-H/2)/z,j=Math.floor((wy+RY)/RC);if(j<0||j>=RGH)continue;
   for(let tx=0;tx<wt;tx++){const wx=cam.x+((tx+.5)*T-W/2)/z,i=Math.floor((wx+RX)/RC);if(i<0||i>=RGW)continue;const k=j*RGW+i,q=ty*wt+tx;
    if(MR[k]===1&&DIN[k]>2){CU[q]=CUTV;continue}if(MR[k]!==1&&DOUT[k]>lim&&!HL[k])continue;
    const dt=riftSD(wx,wy,k)/wpt,b=P.bay(Math.round(wx/wpt)&1023,Math.round(wy/wpt)&1023);let col=-1;
    // texel-hash must be world-anchored so the edge doesn't swim when panning
    const hw=hsh(Math.round(wx/wpt)*3+fr*101,Math.round(wy/wpt)*7+fr*13);
    if(dt<0){CU[q]=CUTV;if(dt>-1)col=hw>.7?2:5}
    else if(dt<1)col=hw>.55?0:hw>.2?1:2;else if(dt<2)col=b<.55+(hw-.5)*.5?2:3;else if(dt<3)col=b<.3+(hw-.5)*.4?3:-1;else if(dt<4)col=b<.1&&hw>.4?4:-1;
    if(dt>=1&&dt<4&&hw>.985)col=0;
    if(dt>0&&rHair/wpt<.6)col=hw>.5?1:2;
    if(col>=0)GU[q]=PK[col]}}
  RCUT.x.putImageData(RCUT.im,0,0);RGLO.x.putImageData(RGLO.im,0,0);
  o.globalCompositeOperation='destination-out';o.drawImage(RCUT.c,0,0,wt*T,ht*T);o.globalCompositeOperation='source-over';o.drawImage(RGLO.c,0,0,wt*T,ht*T)}
 g.drawImage(OC,0,0)}
// pixel reveal front (screen px): grows from the sun outwards; everything beyond it is dithered/chunky-hidden
function revealR(t){const m=Math.min(W,H);if(t<3.9)return m*(.5+.12*seg(t,0,3.9));const z0=m*.82/(250*.72),w0=m*.62/z0;return(w0+(3800-w0)*Math.pow(seg(t,3.9,8.2),1.25))*cam.z}
const RVB=.22;let rvC=null,rvG=null,rvI=null;
function revealOf(sx,sy,R){const[cx,cy]=W2S(0,0);return clamp((R-Math.hypot(sx-cx,sy-cy))/Math.max(20,Math.min(Math.min(W,H)*RVB,R*.5)))}
function revealMask(R){const cs=4,mw=Math.ceil(W/cs),mh=Math.ceil(H/cs);if(!rvC||rvC.width!==mw||rvC.height!==mh){rvC=document.createElement('canvas');rvC.width=mw;rvC.height=mh;rvG=rvC.getContext('2d');rvI=rvG.createImageData(mw,mh)}
 const d=rvI.data,[cx,cy]=W2S(0,0),band=Math.max(20,Math.min(Math.min(W,H)*RVB,R*.5));
 for(let y=0;y<mh;y++)for(let x=0;x<mw;x++){const p=clamp((R-Math.hypot(x*cs+2-cx,y*cs+2-cy))/band),s=p<.34?4:p<.67?2:1,o=(y*mw+x)*4;
  // chunky blocks far from the front, fine dither near it
  const th=B4[((y/s|0)&3)*4+((x/s|0)&3)];if(p>th){d[o+3]=0;continue}const e=p>0&&p>th-.18,h=(x*7+y*13+((performance.now()/120)|0))%5;const c=e?(h<2?[255,255,255]:h<4?[215,156,255]:[180,92,240]):[255,255,255];d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255}
 rvG.putImageData(rvI,0,0);g.imageSmoothingEnabled=false;g.drawImage(rvC,0,0,mw*cs,mh*cs)}
const B4=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5].map(v=>(v+.5)/16);
function uiReveal(){document.body.classList.remove('intro');document.body.classList.add('uirv');setTimeout(()=>document.body.classList.remove('uirv'),2000)}
function skipIntro(){if(!intro)return;if(!intro.ui)uiReveal();intro=null;to(fitX(),fitY(),fitZ(),700)}
// ---- render ----
let last=performance.now(),FA=0;

// ---- asteroid belt between the Pixel Museum and YouTube ----
const BELT=[];{const rk=(sz,seed)=>{const n=8,S=[];for(let k=0;k<n;k++){const la=k/n*TAU,c=P.mk(sz,sz),d=c.img.data,lx=Math.cos(la),ly=Math.sin(la);
  for(let y=0;y<sz;y++)for(let x=0;x<sz;x++){const dx=(x+.5)/sz*2-1,dy=(y+.5)/sz*2-1,a=Math.atan2(dy,dx),rr=.62+.3*P.vn(Math.cos(a)*1.6+seed,Math.sin(a)*1.6+seed*3);if(dx*dx+dy*dy>rr*rr)continue;
   const nz=Math.sqrt(Math.max(0,1-(dx*dx+dy*dy)/(rr*rr))),l=Math.max(0,-(dx*lx+dy*ly)/rr*.75+nz*.45)+(P.vn(x*.9+seed,y*.9)-.5)*.3;
   const q=P.hx(P.dq(['#120c1a','#2a2030','#4a3c44','#7a6658','#b09878','#e0c8a0'],Math.min(1,l*.9),x,y)),o=(y*sz+x)*4;d[o]=q[0];d[o+1]=q[1];d[o+2]=q[2];d[o+3]=255}
  c.g.putImageData(c.img,0,0);S.push(c.c)}return S};
 const LIB=[];for(let i=0;i<14;i++)LIB.push(rk([4,5,6,7,8,10,12][i%7],i*7.3));
 for(let i=0;i<340;i++){const u=Math.random(),r=680+(u+Math.random())*.5*70+((Math.random()-.5)*12);BELT.push({r,a:Math.random()*TAU,sp:.012*Math.pow(360/r,1.5)*(.9+Math.random()*.2),s:LIB[Math.floor(Math.random()*Math.random()*LIB.length)],sc:.6+Math.random()*.9})}}
function drawBelt(dt,alpha){if(sys!=='main'||alpha<=0)return;const ga=g.globalAlpha;g.globalAlpha=ga*alpha;
 for(const k of BELT){if(!RM)k.a+=dt*k.sp;const wx=Math.cos(k.a)*k.r,wy=Math.sin(k.a)*k.r*SQ,[sx,sy]=W2S(wx,wy);const sw=k.s[0].width,tgt=sw*k.sc*cam.z*.9,rt=REFT(),sz=tgt<sw*.75?Math.max(1,Math.round(tgt/rt))*rt:sw*Math.max(1,Math.min(rt,Math.round(tgt/sw)));if(sx<-sz||sy<-sz||sx>W+sz||sy>H+sz)continue;
  if(tgt<sw*.75){g.fillStyle='#7a6658';const q=Math.min(sz,rt*3);g.fillRect(Math.round(sx/rt)*rt,Math.round(sy/rt)*rt,q,q);continue}
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
  const sc=s.far?1:REFT(),w=s.c.width*sc,h=s.c.height*sc;if(x<-w||y<-w||x>W+w||y>H+w)continue;
  g.save();g.translate(Math.round(x),Math.round(y));g.rotate(Math.atan2(vy,vx));
  const fl=.6+.4*Math.sin(t*40+s.ph*7);g.fillStyle=`rgba(255,${150+Math.round(80*fl)},60,${.85*fl})`;const fl2=Math.round(sc*(2+2*fl));g.fillRect(-w/2-fl2,-sc,fl2,sc*2);g.fillStyle='#fff6d8';g.fillRect(-w/2-sc,-Math.ceil(sc/2),sc,sc);
  g.drawImage(s.c,Math.round(-w/2),Math.round(-h/2),w,h);g.restore()}
 g.globalAlpha=ga}
function REFT(){return Math.max(1,Math.round(cam.z*.68))}
function snapPlay(){const p=info.querySelector('.lgplay');if(!p)return;const k=(tw?'t':'s')+W+'x'+H+(focus&&focus.id);if(tw||p.dataset.sn===k)return;p.style.width='';const w=p.getBoundingClientRect().width,u=p.querySelector('svg')?.viewBox?.baseVal?.width||16,n=Math.max(1,Math.floor(w/u));p.style.width=n*u+'px';p.dataset.sn=k}
function clamp2(v,a,b){return v<a?a:v>b?b:v}
// ---- occasional big solar flare ----
let BF={next:performance.now()+12000+Math.random()*10000,t0:0,a:0,s:1};
// rendered on the sun's own texel grid (same pixel size + origin as the sun sprite at every LOD)
let FC=null,FV=null;
function bigFlare(now){if(RM||sys!=='main'||intro)return;if(!BF.t0&&now>=BF.next){BF.t0=now;BF.a=Math.random()*TAU;BF.s=Math.random()<.5?1:-1;BF.sd=Math.random()*99}if(!BF.t0)return;
 const k=(now-BF.t0)/4200;if(k>=1){BF.t0=0;BF.next=now+15000+Math.random()*25000;return}
 const sun=MAIN[0];if(!sun.tx)return;const[cx,cy]=W2S(0,0),R=sun.w*.34*cam.z,tx=sun.tx,grow=Math.min(1,k/.3),fade=k<.6?1:1-(k-.6)/.4;
 const E=R*3.4;if(cx<-E||cy<-E||cx>W+E||cy>H+E)return;
 const x0=sun.gx+Math.floor((cx-E-sun.gx)/tx)*tx,y0=sun.gy+Math.floor((cy-E-sun.gy)/tx)*tx,n=Math.min(900,Math.ceil(2*E/tx)+1);let bx0=n,bx1=-1,by0=n,by1=-1;
 if(!FC||FC.width!==n){FC=document.createElement('canvas');FC.width=FC.height=n;FV=new Float32Array(n*n)}FV.fill(0);
 const Rc=R/tx,ccx=(cx-x0)/tx,ccy=(cy-y0)/tx,t=now/1000;
 const stamp=(px,py,rad,amp)=>{const r=Math.max(.6,rad),i0=Math.max(0,Math.floor(px-r)),i1=Math.min(n-1,Math.ceil(px+r)),j0=Math.max(0,Math.floor(py-r)),j1=Math.min(n-1,Math.ceil(py+r));if(i0<bx0)bx0=i0;if(i1>bx1)bx1=i1;if(j0<by0)by0=j0;if(j1>by1)by1=j1;
  for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){const d=Math.hypot(i+.5-px,j+.5-py)/r;if(d<1){const v=(1-d)*amp,q=j*n+i;if(v>FV[q])FV[q]=v}}};
 const arc=(a0,span,Hm,thk,wob,amp)=>{const L=(span*Rc+Hm*2.4),m=Math.ceil(L/Math.max(.5,Rc*thk*.3));for(let i=0;i<=m;i++){const u=i/m,env=Math.sin(Math.PI*u),a=a0+BF.s*(u-.5)*span+Math.sin(u*5+t*1.4)*.05*grow*wob,h=env*Hm+Math.sin(u*11+t*3.8)*Rc*.06*grow*wob,
   th=Rc*thk*(.45+.55*env)*(1+.25*Math.sin(u*17+t*6.6));stamp(ccx+Math.cos(a)*(Rc*.97+h),ccy+Math.sin(a)*(Rc*.97+h),th,amp)}};
 arc(BF.a,.8,Rc*2.1*grow,.26,1,1);
 arc(BF.a+BF.s*.62,.22,Rc*.42*grow,.09,.5,.85);arc(BF.a-BF.s*.55,.16,Rc*.3*grow,.07,.5,.8);arc(BF.a+BF.s*.08,.12,Rc*.75*grow,.05,.3,.75);
 if(k>.35)for(let i=0;i<34;i++){const q=(i*.618)%1,a=BF.a+BF.s*(q-.5)*.8*1.5,d=Rc*(1+2.1*grow)+(k-.35)*Rc*3*(.5+q);stamp(ccx+Math.cos(a)*d,ccy+Math.sin(a)*d,i%5?.6:1.3,.55+.4*(1-q))}
 if(bx1<bx0)return;const bw=bx1-bx0+1,bh=by1-by0+1,fg=FC.getContext('2d'),im=fg.createImageData(bw,bh),U=new Uint32Array(im.data.buffer),BANDS=[[.86,'#fff6d8'],[.74,'#ffe0a8'],[.62,'#ffc23a'],[.5,'#ffa040'],[.38,'#f0601a'],[.26,'#c8300c'],[.14,'#8e1a06']].map(([v,c])=>{const h=P.hx(c);return[v,(255<<24)|(h[2]<<16)|(h[1]<<8)|h[0]]});
 const thr=1-fade;for(let j=by0;j<=by1;j++)for(let i=bx0;i<=bx1;i++){let v=FV[j*n+i];const q=(j-by0)*bw+i-bx0;if(v<=0)continue;v=v*(.75+.25*fade)+(P.vn(i*.42+BF.sd,j*.42-t*1.5)-.5)*.32+(P.bay(i,j)-.5)*.08-thr*.5;
  for(const[b0,c]of BANDS)if(v>b0){U[q]=c;break}}
 fg.clearRect(0,0,n,n);fg.putImageData(im,bx0,by0);const ga=g.globalAlpha;g.imageSmoothingEnabled=false;g.drawImage(FC,x0,y0,n*tx,n*tx);g.globalAlpha=ga}
let lensC=null,lensN=0,lensR=null;
function lens(){if(sys!=='main')return;const b=MAIN.find(q=>q.id==='void'),[vx0,vy0]=pos(b),[sx,sy]=W2S(vx0,vy0),E=b.w*.084*cam.z*2.3,Rr=Math.ceil(E*3.2);
 if(E<3||sx+Rr<0||sy+Rr<0||sx-Rr>W||sy-Rr>H)return;const x0=Math.floor(sx-Rr),y0=Math.floor(sy-Rr),D=Rr*2,q=Math.max(1,Math.ceil(D/260)),w=Math.ceil(D/q),h=w;
 if(!lensC)lensC=document.createElement('canvas');const moved=!lensR||Math.abs(lensR[0]-x0)>1||Math.abs(lensR[1]-y0)>1||lensR[2]!==D;
 if(moved||(++lensN%3)===0){if(lensC.width!==w){lensC.width=w;lensC.height=h}const lc=lensC.getContext('2d',{willReadFrequently:true});lc.imageSmoothingEnabled=false;lc.clearRect(0,0,w,h);lc.drawImage(cv,x0,y0,D,D,0,0,w,h);
  const src=lc.getImageData(0,0,w,h),a=src.data,out=lc.createImageData(w,h),o=out.data,c=w/2,Eq=E/q,E2=Eq*Eq,Rq=Rr/q;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const dx=x+.5-c,dy=y+.5-c,d2=dx*dx+dy*dy;if(d2>Rq*Rq)continue;const i=(y*w+x)*4,dd=Math.sqrt(d2),fall=dd/Rq,f=1-E2/Math.max(d2,1),k=f*(1-fall*fall)+fall*fall;
   let X,Y;if(f<0){X=Math.round(c-dx*.6*(E2/d2));Y=Math.round(c-dy*.6*(E2/d2))}else{X=Math.round(c+dx*k);Y=Math.round(c+dy*k)}X=X<0?0:X>=w?w-1:X;Y=Y<0?0:Y>=h?h-1:Y;
   const j=(Y*w+X)*4,m=1-fall*fall*fall,m2=m*m*(3-2*m);o[i]=a[j];o[i+1]=a[j+1];o[i+2]=a[j+2];o[i+3]=255*m2}
  lc.putImageData(out,0,0);lensR=[x0,y0,D]}
 g.drawImage(lensC,x0,y0,D,D)}
function frame(now){if(document.body.classList.contains('landed')){last=now;requestAnimationFrame(frame);return}if(sys==='archive'&&!warp&&document.body.classList.contains('arch')){last=now;requestAnimationFrame(frame);return}const dt=Math.min(.05,(now-last)/1000);last=now;const IS=introState(now);FA+=((focus?1:0)-FA)*Math.min(1,dt*4);if(mv.on&&!tw){const k=Math.pow(.9,dt*60);mv.x*=k;mv.y*=k;cam.x+=mv.x*dt*60;cam.y+=mv.y*dt*60;if(Math.hypot(mv.x,mv.y)*cam.z<.1)mv.on=0}if(!tw&&!intro&&!focus&&sys==='main'){const bx=W<H?2200:2600,by=W<H?2700:2300;cam.x=clamp2(cam.x,fitX()-bx,fitX()+bx);cam.y=clamp2(cam.y,fitY()-by,fitY()+by)}
 if(intro){if(IS.t<3.9){cam.x=0;cam.y=0;cam.z=Math.min(W,H)*.82/(250*.72)}else if(!intro.zoomed){intro.zoomed=1;to(fitX(),fitY(),fitZ(),2200)}if(IS.t>7.4&&!intro.ui){intro.ui=1;uiReveal()}if(IS.t>8.8)intro=null}
 if(tw){const k=ease(clamp((now-tw.t0)/tw.ms));const zl=Math.exp(Math.log(tw.a.z)+(Math.log(tw.b.z)-Math.log(tw.a.z))*k);cam.x=tw.a.x+(tw.b.x-tw.a.x)*k;cam.y=tw.a.y+(tw.b.y-tw.a.y)*k;cam.z=zl;if(k>=1){const d=tw.done;tw=null;d&&d()}}
 // orbit motion: hover/focus slows to a stop
 const list=sys==='main'?[...bodies,...MOONS]:bodies;
 for(const b of list){if(b.orb==null)continue;const frozen=focus&&(focus===b||(b.moon?(focus===b||focus.moon):b.par?focus.par===b.par:(b.id==='yt'&&(focus.yt||focus.moon))||(focus.par===b)));const tgt=RM||frozen?0:hover===b?0:(hover&&((hover.yt&&b.moon)||(hover===b.par)))?.35:1;b.sf+=(tgt-b.sf)*Math.min(1,dt*4);b.ang+=dt*TAU/b.per*b.sf*(b.dir||1)}
 let wv=0;if(warp){const k=(now-warp.t0)/1700;wv=Math.sin(Math.min(1,k)*Math.PI);if(k>=.5&&!warp.swapped){warp.swapped=true;sys=warp.to;bodies=sys==='main'?MAIN:ARCH;document.body.classList.toggle('arch',sys==='archive');tw=null;cam.x=fitX();cam.y=fitY();cam.z=fitZ()*6;to(fitX(),fitY(),fitZ(),1100)}if(k>=1)warp=null}
 // stars
 g.globalAlpha=1;g.fillStyle='#010103';g.fillRect(0,0,W,H);
 g.globalAlpha=IS.stars;const T=1024,ox=Math.round(((cam.x*.056)%T+T)%T),oy=Math.round(((cam.y*.056)%T+T)%T);for(let ty=-oy;ty<H;ty+=T)for(let tx=-ox;tx<W;tx+=T)g.drawImage(neb.c,tx,ty,T,T);
 const ts=now/1000;for(const s of STARS){const f=[.04,.09,.16][s.l],ps=[2,2,3][s.l];let x=((s.x*W-cam.x*f*.7)%W+W)%W,y=((s.y*H-cam.y*f*.7)%H+H)%H;x=Math.round(x/ps)*ps;y=Math.round(y/ps)*ps;
  const tw2=RM?1:.5+.5*Math.sin(ts*(1+s.l)+s.p);if(tw2<.25&&s.l===0)continue;g.fillStyle=s.c;if(wv>.02){const L=wv*(.15+s.l*.12),ex=x+(x-W/2)*L,ey=y+(y-H/2)*L,n=Math.ceil(Math.hypot(ex-x,ey-y)/ps);for(let i=0;i<=n;i++)g.fillRect(Math.round((x+(ex-x)*i/n)/ps)*ps,Math.round((y+(ey-y)*i/n)/ps)*ps,ps,ps);continue}g.fillRect(x,y,ps,ps);if(s.l===2&&tw2>.7){g.fillRect(x-ps,y,ps,ps);g.fillRect(x+ps,y,ps,ps);g.fillRect(x,y-ps,ps,ps);g.fillRect(x,y+ps,ps,ps)}}
 g.globalAlpha=1;lens();drawDecoBack(now);
 g.globalAlpha=Math.max(0,1-wv*1.6);
 // orbit rings (pixel dashes)
 const ring=(cx,cy,r,prog,col)=>{const ps=REFT(),n=Math.max(48,Math.floor(r*cam.z*TAU/(ps*3.5)));g.fillStyle=col;for(let k=0;k<n*prog;k++){if(k%3===2)continue;const a=k/n*TAU-Math.PI/2,[sx,sy]=W2S(cx+Math.cos(a)*r,cy+Math.sin(a)*r*SQ);g.fillRect(Math.round(sx/ps)*ps,Math.round(sy/ps)*ps,ps,ps)}};
 {const ps=REFT(),ga0=g.globalAlpha;for(const b of bodies){if(b.orb==null||b.moon)continue;const n=Math.max(40,Math.min(130,Math.round(b.orb*cam.z*2.6/(ps*3)))),arc=2.6,dr=b.dir||1;g.fillStyle=b.tc||'#c8ccff';
 for(let k=1;k<=n;k++){const f=k/n,an=b.ang-dr*arc*f,[sx,sy]=W2S(Math.cos(an)*b.orb,Math.sin(an)*b.orb*SQ);if(sx<-4||sy<-4||sx>W+4||sy>H+4)continue;const al=Math.pow(1-f,1.3)*.6*IS.orb;if(al<.02||(k%2&&f>.35))continue;g.globalAlpha=ga0*al;g.fillRect(Math.round(sx/ps)*ps,Math.round(sy/ps)*ps,ps,ps)}}g.globalAlpha=ga0}
 if(sys==='main'){const[yx,yy]=pos(MAIN[3]);}
 {const A=MAIN[1],tg=(hover===A||focus===A)?1:0;A.op=(A.op||0)+(tg-(A.op||0))*Math.min(1,dt*(tg?2.2:3));A.arg={open:RM?tg:A.op}}
 drawBelt(dt,IS.orb);drawShips(now,IS.orb);drawDecoWorld(now);
 // sprites, back-to-front
 const draw=[];bodies.forEach((b,i)=>draw.push([b,i]));if(sys==='main')MOONS.forEach((m,i)=>draw.push([m,m.par?MAIN.indexOf(m.par):3]));
 draw.sort((a,b)=>pos(a[0])[1]-pos(b[0])[1]);
 const one=(b,i)=>{const pp=b.id==='sun'||b.id==='oldhub'?1:IS.pop(Math.min(i,7)+(b.moon?.5:0));if(pp<=0)return;const isF=focus&&(b===focus||(focus.yt&&b.moon)||(b.par&&focus===b.par)),dim=isF||FA<.005?1:1-.72*FA;
  const[x,y]=pos(b),[sx,sy]=W2S(x,y),w=b.w*cam.z*pp,h=(b.h||b.w)*cam.z*pp;
  if(sx+w<0||sx-w>W||sy+h<0||sy-h>H)return;
  // resolution chosen from on-screen size: redraw at that res, integer pixel scale, no colour-quantised downsample
  const capB=b.paint==='void'?Math.round(b.w*1.1):b.paint==='crest'?128:b.paint==='sun'?(intro?140:380):b.paint==='arena'?180:b.paint==='rmoon'?96:160,cap=Math.max(6,Math.round(capB*(b.rv<1?Math.max(.08,b.rv*b.rv):1))),pw=Math.max(2,w),ps=Math.max(1,Math.ceil(pw/cap)),Nt=Math.max(6,Math.round(pw/ps)),asp=(b.h||b.w)/b.w;
  let S=b.S;const ga=g.globalAlpha;
  if(!S.N||Math.abs(Nt-S.N)/Nt>.06&&now>=(b.rz||0)){const S2=P.mk(Nt,Math.max(4,Math.round(Nt*asp)));S2.N=Nt;if(S.N){b.prev=S;b.xf=now}b.S=S=S2;b.nx=0;b.rz=now+40}
  if(now>=(b.nx||0)||(b.id==='sun'&&intro)){let o=b.id==='sun'?{ign:IS.ign,fl:IS.fl,L:IS.L}:b.arg;if(b.id==='sun'&&!intro&&S.N>200&&S.full){const ch=Math.ceil(S.N/10),y0=(S.row||0);o={...o,y0,y1:y0+ch};S.row=y0+ch>=S.N?0:y0+ch}else if(b.id==='sun')S.full=1;if(b.id==='void'&&!RM&&S.N>140&&S.full){const HH=S.img.height,ch=Math.ceil(HH/3),y0=(S.row||0);o={y0,y1:y0+ch};S.row=y0+ch>=HH?0:y0+ch}else if(b.id==='void')S.full=1;P.setFlat(b.id==='sun'&&intro?0:S.N<cap*.55);const tn=RM?7:now/1000+(b.ph||0)*3;P[b.paint](S,tn,o);P.setFlat(0);b.nx=RM?Infinity:now+(b.id==='void'&&S.N>140&&S.full&&!RM?22:b.paint==='sun'?(S.N>200&&!intro?16:S.N>200?90:S.N>100?110:70):S.N>140?66:S.N>60?44:60)+Math.random()*8}
  const dw=Math.abs(S.N*ps-pw)<=ps?S.N*ps:pw,dh=Math.round(dw*asp),dx=Math.round(sx-dw/2),dy=Math.round(sy-dh/2);if(b.id==='sun'){b.tx=dw/S.N;b.gx=dx;b.gy=dy}
  const xf=b.prev?Math.min(1,(now-b.xf)/160):1;if(b.prev&&xf<1){g.globalAlpha=ga*dim;g.drawImage(b.prev.c,dx,dy,dw,dh)}else b.prev=null;
  g.globalAlpha=ga*dim*(b.prev?xf:1);g.drawImage(S.c,dx,dy,dw,dh);
  g.globalAlpha=ga};
 let sunL=null;for(const[b,i]of draw){if(intro&&b.id==='sun'){sunL=[b,i];continue}if(intro){const[x0,y0]=pos(b),[s0,t0]=W2S(x0,y0);b.rv=revealOf(s0,t0,IS.R);if(b.rv<=0)continue}else b.rv=1;one(b,i)}
 g.globalAlpha=1;drawOutside(now);
 if(intro){g.globalAlpha=1;revealMask(IS.R);if(sunL)one(...sunL)}
 g.globalAlpha=1;bigFlare(now);if(focus&&!tw&&sys==='main'){const[fx,fy]=pos(focus);cam.x+=(fx-cam.x)*Math.min(1,dt*8);cam.y+=(fy-cam.y)*Math.min(1,dt*8)}if(focus){placeInfo();snapPlay()}
 requestAnimationFrame(frame)}
// ---- deep-space decor: nebulae, galaxies, far planets (parallax), stations/wrecks/rocks (world), comets, shooting stars, secrets ----
// every decor sprite is painted procedurally at a resolution picked from its on-screen size (like the planets), so far = chunky, near = detailed
const DK=(()=>{let r=4242;return()=>(r=(Math.imul(r^(r>>>15),2246822519)+0x9e3779b9)|0,((r>>>0)%100000)/100000)})();
const dhx=c=>P.hx(c),dpk=c=>{const h=dhx(c);return(255<<24)|(h[2]<<16)|(h[1]<<8)|h[0]};
const DLOD=[6,8,12,16,24,32,48,64,96,128,160,200,256,320];
function dSprite(o,N){o.cache=o.cache||{};if(o.cache[N])return o.cache[N];const w=N,h=Math.max(2,Math.round(N*o.asp)),c=document.createElement('canvas');c.width=w;c.height=h;const cg=c.getContext('2d'),im=cg.createImageData(w,h),U=new Uint32Array(im.data.buffer);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=o.paint((x+.5)/w,(y+.5)/h,x,y,N);if(v)U[y*w+x]=v}cg.putImageData(im,0,0);const keys=Object.keys(o.cache);if(keys.length>3)delete o.cache[keys[0]];return o.cache[N]=c}
function dDraw(o,sx,sy,zl,rot){const px=o.sz*zl;if(px<2)return;if(sx+px<0||sy+px<0||sx-px>W||sy-px>H)return;let N=DLOD[0];for(const n of DLOD)if(n<=px&&n<=o.cap)N=n;const c=dSprite(o,N),sc=Math.max(1,Math.floor(px/N)),dw=c.width*sc,dh=c.height*sc;
 if(rot){g.save();g.translate(Math.round(sx),Math.round(sy));g.rotate(rot);g.drawImage(c,-Math.round(dw/2),-Math.round(dh/2),dw,dh);g.restore()}else g.drawImage(c,Math.round(sx-dw/2),Math.round(sy-dh/2),dw,dh);o.sw=dw;o.sh=dh}
const ramp=(pal,v,x,y)=>{const n=pal.length,f=Math.max(0,Math.min(.999,v))*(n-1),i=Math.floor(f);return pal[Math.min(n-1,i+(f-i>P.bay(x,y)?1:0))]};
// palettes
const NPAL=[['#12082a','#24104a','#3c1a6e','#5e2a98','#8a4ac0'],['#041a22','#08303a','#0e4c56','#1a7478','#36a8a0'],['#1e0620','#3a0c3c','#5e165e','#8a2a82','#c04aa8']].map(p=>p.map(dpk));
function nebula(seed,pal,sz){const sd=seed*13.7,FW=128,FH=80,F=new Float32Array(FW*FH);for(let y=0;y<FH;y++)for(let x=0;x<FW;x++){const u=(x+.5)/FW,v=(y+.5)/FH,dx=(u-.5)*2,dy=(v-.5)*2,fall=Math.max(0,1-Math.pow(dx*dx+dy*dy,.8));
  F[y*FW+x]=fall>0?(P.fbm(u*3.2+sd,v*2+sd*.7)*1.15+P.fbm(u*9+sd*2,v*6)*.35-.42)*fall*2.2:0}
 return{neb:1,F,FW,FH,pal,sz,asp:.62,cap:160,pf:.55,paint:()=>0}}
// nebula layer: dithered per screen texel (planet pixel size), cached and re-rendered when the camera settles / every 2s for drift
let NL=null;
function nebRender(now,T){const t=RM?0:now/1000,wt=Math.ceil(W/T),ht=Math.ceil(H/T);if(!NL||NL.c.width!==wt||NL.c.height!==ht){const c=document.createElement('canvas');c.width=wt;c.height=ht;const x=c.getContext('2d'),im=x.createImageData(wt,ht);NL={c,x,im,U:new Uint32Array(im.data.buffer)}}
 const U=NL.U;U.fill(0);const z=cam.z;
 for(const o of DECO.back){if(!o.neb)continue;const px=o.sz*z*o.pf,py=px*o.asp,cx=W/2+(o.x+(o.dx||0)*t-cam.x*o.pf)*z,cy=H/2+(o.y+(o.dy||0)*t-cam.y*o.pf)*z,x0=cx-px/2,y0=cy-py/2;
  const tx0=Math.max(0,Math.floor(x0/T)),tx1=Math.min(wt-1,Math.ceil((x0+px)/T)),ty0=Math.max(0,Math.floor(y0/T)),ty1=Math.min(ht-1,Math.ceil((y0+py)/T));if(tx0>tx1||ty0>ty1)continue;
  const F=o.F,FW=o.FW,FH=o.FH,pal=o.pal;
  for(let ty=ty0;ty<=ty1;ty++){const fv=((ty+.5)*T-y0)/py*FH-.5;if(fv<0||fv>=FH-1)continue;const j=fv|0,b=fv-j,X0=Math.round((ty*T-y0)/T);
   for(let tx=tx0;tx<=tx1;tx++){const fu=((tx+.5)*T-x0)/px*FW-.5;if(fu<0||fu>=FW-1)continue;const i=fu|0,a=fu-i,k=j*FW+i;
    const d=(F[k]*(1-a)+F[k+1]*a)*(1-b)+(F[k+FW]*(1-a)+F[k+FW+1]*a)*b;if(d<=.08)continue;const X=Math.round((tx*T-x0)/T),Y=X0;if(P.bay(X,Y)>d*2.4)continue;U[ty*wt+tx]=ramp(pal,d*1.15,X,Y)}}}
 NL.x.putImageData(NL.im,0,0);NL.cx=cam.x;NL.cy=cam.y;NL.z=z;NL.T=T;NL.t=now}
function drawNeb(now){const T=REFT(),moved=NL&&NL.z!==cam.z,off=NL&&Math.abs(NL.cx-cam.x)*cam.z*.55>W*.5;
 if(!NL||NL.T!==T||(moved&&now-NL.t>220)||off||(!RM&&now-NL.t>2000)||NL.c.width!==Math.ceil(W/T))nebRender(now,T);
 const k=cam.z/NL.z,pf=.55,ox=W/2+(-W/2/NL.z+(NL.cx-cam.x)*pf)*cam.z,oy=H/2+(-H/2/NL.z+(NL.cy-cam.y)*pf)*cam.z,ga=g.globalAlpha;g.globalAlpha=ga*.6;g.imageSmoothingEnabled=false;g.drawImage(NL.c,Math.round(ox),Math.round(oy),NL.c.width*NL.T*k,NL.c.height*NL.T*k);g.globalAlpha=ga}

function galaxy(seed,kind,sz){const sd=seed*7.1,tilt=.35+DK()*.5,rot=DK()*6.28,arms=2+(DK()<.4?1:0);return{sz,asp:1,cap:96,pf:.3,paint:(u,v,x,y)=>{let dx=(u-.5)*2,dy=(v-.5)*2;const ca=Math.cos(rot),sa=Math.sin(rot),rx=dx*ca-dy*sa,ry=(dx*sa+dy*ca)/tilt,r=Math.hypot(rx,ry);if(r>1)return 0;
  let d;if(kind){d=Math.exp(-r*r*5)*1.1}else{const a=Math.atan2(ry,rx),sp=Math.cos(arms*(a-Math.log(r+.05)*2.6)+sd);d=Math.exp(-r*r*7)*1.1+Math.max(0,sp)*(1-r)*.55*(.7+.3*P.vn(rx*9+sd,ry*9))}
  if(d<.1||P.bay(x,y)>d*2)return 0;return ramp(kind?GPE:GPS,d,x,y)}}}
const GPS=['#1a1440','#3a3478','#6a6ab8','#a8b4f0','#fff6e0'].map(dpk),GPE=['#2a1418','#5a3028','#a07048','#e8c890','#fff6e0'].map(dpk);
function farPlanet(seed,sz){const pals=[['#0c0a1a','#2a2448','#4e4680','#8a82c0'],['#140808','#3a1a14','#7a3a22','#c47a48'],['#06140e','#12342a','#2a6050','#5aa08a'],['#101014','#2a2a34','#55556a','#9a9ab0']],pal=pals[seed%4].map(dpk),ring=seed%3===1,sd=seed*3.3;
 return{sz,asp:ring?.7:1,cap:64,pf:.4,paint:(u,v,x,y,N)=>{const asp=ring?.7:1;let dx=(u-.5)*2*(ring?1.45:1),dy=(v-.5)*2*(ring?1.45/asp*asp:1);if(ring)dy=(v-.5)*2*1.45*asp;
  const r=Math.hypot(dx,dy);if(ring){const ry=dy/.28,rr=Math.hypot(dx,ry);if(rr>1.2&&rr<1.42&&!(r<1&&dy<0))return P.bay(x,y)<.6?pal[2]:pal[1]}
  if(r>1)return 0;const nz=Math.sqrt(1-r*r),l=Math.max(0,(-dx*.6-dy*.6+nz*.55));const b=P.vn(dy*4+sd,dx*.6)*.3;return ramp(pal,l*.9+b-.1,x,y)}}}
// world objects (lit from the upper left)
const MTL=['#14141c','#2a2c3a','#4a4e64','#7a809c','#b4bad4','#eef0ff'].map(dpk),RUST=['#1a0e0a','#3a1e14','#6a3a24','#9a5a34','#c88a50'].map(dpk),ROCK=['#120e0e','#2a2222','#4a3c36','#6e5c50','#9a8470'].map(dpk);
const lite=(dx,dy)=>.62-dx*.32-dy*.32;
function station(seed,sz){const kind=seed%2,sd=seed*1.7;return{sz,asp:kind?1:.7,cap:96,name:kind?'Ring station':'Relay outpost',paint:(u,v,x,y,N)=>{const dx=(u-.5)*2,dy=(v-.5)*2;
  if(kind){const ry=dy/.5,r=Math.hypot(dx,ry);if(r>.82&&r<1){const sh=lite(dx,dy)+(r-.91)*-2;return ramp(MTL,sh+((Math.floor(Math.atan2(ry,dx)*6))%2?.08:0),x,y)}
   if(r<.22)return ramp(MTL,lite(dx,dy)+.2-r,x,y);const a=Math.atan2(ry,dx);for(let k=0;k<4;k++){const da=Math.atan2(Math.sin(a-k*Math.PI/2-.3),Math.cos(a-k*Math.PI/2-.3));if(Math.abs(da)*r<.035&&r<.85)return ramp(MTL,.45,x,y)}
   if(r>.82&&r<1.0&&P.bay(x,y)>.95)return dpk('#ffe66d');return 0}
  const ay=dy/.7;if(Math.abs(ay)<.16&&Math.abs(dx)<.24)return ramp(MTL,lite(dx,ay)+.15,x,y);if(Math.abs(ay)<.035&&Math.abs(dx)<.9)return ramp(MTL,.4,x,y);
  if(Math.abs(dx)>.3&&Math.abs(dx)<.9&&Math.abs(ay)>.07&&Math.abs(ay)<.5){const cx=Math.floor((Math.abs(dx)-.3)*N*.25),cy=Math.floor(ay*N*.25);return (cx+cy)%2?dpk('#1e3a8a'):dpk('#3a6ad8')}
  if(Math.abs(dx)<.05&&ay<-.16&&ay>-.7)return ramp(MTL,.55,x,y);if(Math.hypot(dx,ay+.74)<.08)return dpk('#ff5a5a');return 0}}}
function wreck(seed,sz){const sd=seed*5.3;return{sz,asp:.5,cap:96,name:['Derelict freighter','Wrecked scout','Broken hauler'][seed%3],paint:(u,v,x,y,N)=>{const dx=(u-.5)*2,dy=(v-.5)*2/.5*.5*2;
  const hull=Math.abs(dy)<.42*(1-Math.pow(Math.max(0,dx),3))&&dx>-.95,brk=Math.abs(dx-(.15+.2*P.vn(dy*4+sd,1)))<.06+.05*P.vn(dy*9,sd);if(!hull||brk)return 0;
  const hole=P.fbm(u*4+sd,v*4)>.62;if(hole)return P.bay(x,y)>.5?RUST[0]:0;const pan=(Math.floor(u*N/6)+Math.floor(v*N/6))%2?.05:0;
  return ramp(P.vn(u*6+sd,v*6)>.55?RUST:MTL,lite(dx,dy)+pan-Math.abs(dy)*.3,x,y)}}}
function rock(seed,sz){const sd=seed*2.9;return{sz,asp:.85,cap:48,name:seed%5?'Drifting rock':'Ice chunk',paint:(u,v,x,y)=>{const dx=(u-.5)*2,dy=(v-.5)*2/.85*.85,a=Math.atan2(dy,dx),rr=.78+.22*P.vn(Math.cos(a)*2+sd,Math.sin(a)*2);const r=Math.hypot(dx,dy);if(r>rr)return 0;
  const nz=Math.sqrt(Math.max(0,1-(r/rr)**2)),c=P.vn(u*7+sd,v*7)>.68?-.2:0;return ramp(seed%5?ROCK:MTL,lite(dx,dy)*.7+nz*.35+c-.1,x,y)}}}
const ASTRO={sz:15,asp:1.3,cap:24,name:'A lost astronaut',paint:(u,v,x,y)=>{const dx=(u-.5)*2,dy=(v-.5)*2;if(Math.hypot(dx,dy+.45)<.42)return Math.hypot(dx+.08,dy+.5)<.26?(dx<-.05&&dy<-.6?dpk('#ffffff'):dpk('#2a6ad8')):ramp(MTL,lite(dx,dy)+.35,x,y);
  if(Math.abs(dx)<.4&&dy>-.05&&dy<.5)return ramp(MTL,lite(dx,dy)+.3,x,y);if(dy>=.5&&dy<.95&&Math.abs(Math.abs(dx)-.2)<.14)return ramp(MTL,.65,x,y);if(Math.abs(dy-.05)<.12&&Math.abs(dx)<.85&&Math.abs(dx)>.38)return ramp(MTL,.7,x,y);if(dx>.4&&dx<.62&&dy>-.2&&dy<.35)return dpk('#c84a3a');return 0}};
const UFO={sz:22,asp:.5,cap:32,name:'UFO?!',paint:(u,v,x,y,N)=>{const dx=(u-.5)*2,dy=(v-.5)*2;if(dy<0&&Math.hypot(dx/.42,dy/.95+.05)<1)return Math.hypot(dx+.15,dy+.55)<.15?dpk('#ffffff'):dpk('#7af0c8');
  if(Math.abs(dy-.2)<.32&&Math.abs(dx)<1-Math.abs(dy-.2)*.9){if(Math.abs(dy-.25)<.07&&(Math.floor(u*N/3))%2)return dpk('#ffe66d');return ramp(MTL,lite(dx,dy)+.2,x,y)}return 0}};
// layout (seeded, stable): only in the empty space between the outer orbit and the tear, never on the planets
const DECO={back:[],world:[]};
(function(){const inZone=(x,y,m)=>Math.hypot(x,y/SQ)>1700+m&&inMain(x,y)&&inMain(x+m,y)&&inMain(x-m,y)&&inMain(x,y+m)&&inMain(x,y-m);
 const put=(o,pf,m,tries=300)=>{for(let t=0;t<tries;t++){const x=(DK()*2-1)*2700,y=(DK()*2-1)*3300;if(pf===1?!inZone(x,y,m):!(inMain(x,y)&&Math.hypot(x,y/SQ)>1660+o.sz*.35))continue;if(pf<1&&DECO.back.some(q=>Math.hypot(q.x-x,q.y-y)<(q.sz+o.sz)*.45))continue;if(pf===1&&DECO.world.some(q=>Math.hypot(q.x-x,q.y-y)<q.sz+o.sz+90))continue;o.x=x;o.y=y;return o}return null};
 for(let i=0;i<11;i++){const o=put(nebula(i,NPAL[i%3],700+DK()*900),.55,0);if(o){o.pf=.55;o.dx=(DK()-.5)*3;o.dy=(DK()-.5)*2;DECO.back.push(o)}}
 for(let i=0;i<6;i++){const o=put(galaxy(i,i%3===2,110+DK()*150),.3,0);if(o){o.pf=.3;DECO.back.push(o)}}
 for(let i=0;i<5;i++){const o=put(farPlanet(i,45+DK()*80),.4,0);if(o){o.pf=.4;DECO.back.push(o)}}
 DECO.back.sort((a,b)=>a.pf-b.pf);
 const add=(o,m)=>{const q=put(o,1,m);if(q){q.ph=DK()*6.28;DECO.world.push(q)}};
 for(let i=0;i<3;i++)add(station(i,110+DK()*70),120);for(let i=0;i<4;i++)add(wreck(i,90+DK()*80),110);for(let i=0;i<24;i++)add(rock(i,18+DK()*42),40);add(ASTRO,60);ASTRO.astro=1})();
// transient fx
const FX={comet:null,nextC:performance.now()+9000+Math.random()*15000,shoot:null,nextS:performance.now()+4000+Math.random()*6000,ufo:null,nextU:performance.now()+70000+Math.random()*130000};
const TX=()=>REFT();for(const o of[...DECO.back,...DECO.world,UFO])o.cap=Math.min(o.pf===.55?320:256,Math.max(o.cap,Math.ceil(o.sz*1.5)));
function drawDecoBack(now){if(sys!=='main')return;const ga=g.globalAlpha,t=RM?0:now/1000;
 drawNeb(now);for(const o of DECO.back){if(o.neb)continue;const zl=cam.z*o.pf,wx=o.x+(o.dx||0)*t,wy=o.y+(o.dy||0)*t;g.globalAlpha=ga*(o.asp===.62?.6:o.pf<.35?.8:.9);dDraw(o,W/2+(wx-cam.x*o.pf)*cam.z,H/2+(wy-cam.y*o.pf)*cam.z,cam.z)}
 g.globalAlpha=ga;if(RM)return;
 // shooting stars: brief pixel streaks in the deep layer
 if(!FX.shoot&&now>FX.nextS&&!intro){FX.shoot={t0:now,x:Math.random()*W,y:Math.random()*H*.6,a:.4+Math.random()*.5+(Math.random()<.5?Math.PI-1.3:0),L:60+Math.random()*90}}
 if(FX.shoot){const s=FX.shoot,k=(now-s.t0)/650;if(k>=1){FX.shoot=null;FX.nextS=now+5000+Math.random()*9000}else{const ps=REFT(),hx=s.x+Math.cos(s.a)*s.L*2*k,hy=s.y+Math.sin(s.a)*s.L*2*k;for(let i=0;i<s.L/ps;i++){const f=i/(s.L/ps);if(P.bay(i,3)>1-f*1.2&&i>2)continue;g.fillStyle=f<.15?'#ffffff':f<.5?'#cfd4ff':'#6a70b8';g.globalAlpha=ga*(1-k*k)*(1-f);g.fillRect(Math.round((hx-Math.cos(s.a)*i*ps)/ps)*ps,Math.round((hy-Math.sin(s.a)*i*ps)/ps)*ps,ps,ps)}g.globalAlpha=ga}}}
function drawDecoWorld(now){if(sys!=='main')return;const t=RM?0:now/1000,ga=g.globalAlpha;
 for(const o of DECO.world){const bob=RM?0:Math.sin(t*.4+o.ph)*6,[sx,sy]=W2S(o.x+(o.astro?Math.sin(t*.13)*30:0),o.y+bob);let rot=0;if(!RM&&!o.name.includes('station')&&o!==ASTRO)rot=Math.sin(t*.05+o.ph)*.35;if(o===ASTRO&&!RM)rot=t*.25+(o.wave&&now-o.wave<1600?Math.sin((now-o.wave)/90)*.5:0);
  dDraw(o,sx,sy,cam.z,rot);o.scx=sx;o.scy=sy;o.sr=o.sz*cam.z*.5;
  if(o.name==='Ring station'||o.name==='Relay outpost'){if(!RM&&(Math.floor(t*1.5+o.ph)%2)){const ps=TX();g.fillStyle='#ff5a5a';g.fillRect(Math.round(sx+o.sz*cam.z*.42),Math.round(sy-o.sz*cam.z*.05),ps,ps)}}}
 g.globalAlpha=ga;if(RM)return;
 // comets: occasionally cross with a dithered pixel tail
 if(!FX.comet&&now>FX.nextC&&!intro){const a=Math.random()*TAU,[cx,cy]=S2W(W/2,H/2),Rv=Math.hypot(W,H)/cam.z*.6,off=(Math.random()-.5)*Rv*.8;FX.comet={t0:now,x:cx-Math.cos(a)*Rv-Math.sin(a)*off,y:cy-Math.sin(a)*Rv+Math.cos(a)*off,vx:Math.cos(a)*Rv*2/9,vy:Math.sin(a)*Rv*2/9,H:[]}}
 if(FX.comet){const c=FX.comet,k=(now-c.t0)/9000;if(k>=1){FX.comet=null;FX.nextC=now+25000+Math.random()*30000}else{const wx=c.x+c.vx*k*9,wy=c.y+c.vy*k*9,[hx,hy]=W2S(wx,wy),ps=TX(),sp=Math.hypot(c.vx,c.vy),ux=-c.vx/sp,uy=-c.vy/sp,L=Math.max(40,90*cam.z*2)/ps;
   for(let i=L;i>=0;i--){const f=i/L,wd=Math.max(0,Math.round((1-f)*3*Math.min(1,cam.z*1.5)));for(let j=-wd;j<=wd;j++){if(i>2&&P.bay(i,j+4)>(1-f)*1.4-Math.abs(j)*.2)continue;g.fillStyle=f<.06?'#ffffff':f<.25?'#c8f4ff':f<.55?'#5ad8ff':'#2a6ad8';g.fillRect(Math.round(hx/ps+ux*i-uy*j)*ps,Math.round(hy/ps+uy*i+ux*j)*ps,ps,ps)}}}}
 // the UFO (rare)
 if(!FX.ufo&&now>FX.nextU&&!intro&&!focus){const l=Math.random()<.5;FX.ufo={t0:now,l,y:H*(.15+Math.random()*.5)}}
 if(FX.ufo){const u=FX.ufo,k=(now-u.t0)/2600;if(k>=1){FX.ufo=null;FX.nextU=now+150000+Math.random()*150000}else{const e=k<.4?k/.4*.5:k<.6?.5:.5+(k-.6)/.4*.5,ee=k<.4?1-Math.pow(1-k/.4,2):k<.6?1:1+Math.pow((k-.6)/.4,2)*2,x=u.l?-60+(W*.5+60)*Math.min(ee,1)+(ee>1?(ee-1)*W:0):W+60-(W*.5+60)*Math.min(ee,1)-(ee>1?(ee-1)*W:0),y=u.y+Math.sin(k*20)*6;
   const z=Math.max(1.6,cam.z*1.6);dDraw(UFO,x,y,z);UFO.scx=x;UFO.scy=y;UFO.sr=UFO.sz*z*.6;UFO.live=1;if(k>.4&&k<.6){g.fillStyle='rgba(122,240,200,.25)';const ps=TX()+1;for(let i=0;i<10;i++)if(P.bay(i,Math.floor(now/90))>.4)g.fillRect(Math.round(x-6+i*1.2),Math.round(y+8+i*3),ps,ps)}}}else UFO.live=0}
function decoHit(sx,sy){if(sys!=='main')return null;if(UFO.live&&Math.hypot(sx-UFO.scx,sy-UFO.scy)<UFO.sr)return{title:UFO.name,deco:UFO};for(const o of DECO.world)if(o.sr>4&&Math.hypot(sx-o.scx,sy-o.scy)<o.sr)return{title:o.name,deco:o};return null}
let sunClicks=[];function sunTap(){const n=performance.now();sunClicks=sunClicks.filter(q=>n-q<3000);sunClicks.push(n);if(sunClicks.length>=5){sunClicks=[];BF.next=0;BF.t0=0;tip.textContent='☀ you woke the sun';tip.style.left=W/2-70+'px';tip.style.top=H*.2+'px';tip.classList.add('on');setTimeout(hideTip,2400)}}
window.__flare=()=>{BF.next=0};window.__deco=DECO;window.__fx=FX;
// ---- hit testing ----
function hit(sx,sy){const[wx,wy]=S2W(sx,sy);let best=null,bd=1e9;const list=sys==='main'?[...MOONS,...bodies]:bodies;
 for(const b of list){const[x,y]=pos(b),r=b.w*b.hr*(b.id==='void'?1.4:1),d=Math.hypot(wx-x,wy-y);if(d<r&&d/r<bd){bd=d/r;best=b}}return best||decoHit(sx,sy)}
// ---- focus & info ----
let revealT=0;
const TH={sun:['#080a12','#dde0e8','#ffe66d','#080a12','Silkscreen','#9ab4e8'],ashaad:['#120a0c','#e8dcc0','#ffd23a','#2a1608','Silkscreen','#5a3a20'],sea:['#021e5a','#90E0EF','#48CAE4','#021e5a','VT323','#f3dfae'],arena:['#1a0f08','#fff3d6','#ffcf3a','#1a0f08','Silkscreen','#ff6464'],
 gow:['#000','#fff','#e01a22','#fff','Anton','#e01a22'],ccold:['#000','#fff','#e01a22','#fff','Anton','#e01a22'],void:['#05020d','#efe6ff','#c04df0','#fff','VT323','#c04df0'],
 yt:['#0f0f0f','#fff','#fff','#0f0f0f','Roboto','#ff0033'],oldhub:['#120c1e','#f3ecdf','#ff0033','#fff','Silkscreen','#ffcc4d'],ballfight:['#120c1e','#f3ecdf','#ffcc4d','#120c1e','Silkscreen','#ff0033'],
 'v-lovely':['#fff8f1','#3a2430','#ff5d8f','#fff','Fredoka','#ffb347'],'v-arcade':['#1a1440','#ffd257','#ff5d8f','#fff','Silkscreen','#7c6cff'],'v-larper':['#1a1440','#ffcc4d','#7c6cff','#fff','Silkscreen','#ff5d8f'],
 'v-purple':['#241640','#ffcc4d','#38e1d0','#0a0814','Silkscreen','#7c6cff'],'v-white':['#080a12','#dde0e8','#9ab4e8','#080a12','Silkscreen','#cfe0ff'],pmuseum:['#05040c','#a8fff8','#3ad8e0','#05040c','Silkscreen','#1a7a8a'],wam:['#000000','#f2f2f2','#ffffff','#000000','Silkscreen','#8a8a96'],'v-strings':['#080a12','#dde0e8','#ffe66d','#080a12','Silkscreen','#c9ced8']};
function theme(b){const t=TH[b.moon?'yt':b.par?b.par.id:b.id]||TH.sun;return `--bg:${t[0]};--fg:${t[1]};--ac:${t[2]};--bf:${t[3]};--ft:'${t[4]}';--bd:${t[5]}`}
const NOINFO={sun:1};
const PLAY=(d,l,m)=>`<svg viewBox="0 0 16 16" shape-rendering="crispEdges"><path fill="${d}" d="M4 2h2v1h2v1h2v1h2v1h2v4h-2v1h-2v1h-2v1h-2v1h-2z"/><path fill="${l}" d="M5 4h1v1h2v1h2v1h2v2h-2v1h-2v1h-2v1h-1z"/><path fill="${m}" d="M5 8h1v3h-1zM6 9h2v1h-2z"/></svg>`;
const YTLOGO=`<svg class="lgsvg" viewBox="0 0 24 17" shape-rendering="crispEdges"><path fill="#ff0033" d="M2 0h20v1h1v1h1v13h-1v1h-1v1h-20v-1h-1v-1h-1v-13h1v-1h1z"/><path fill="#b8001f" d="M1 14h22v1h-1v1h-20v-1h-1z"/><path fill="#fff" d="M9 4h2v1h2v1h2v1h2v2h-2v1h-2v1h-2v1h-2z"/></svg><b class="lgtx">LLC Powered<br>Channels</b>`;
// box = [width frac of w, height frac of h, y offset frac of h]
const LG={arena:{box:[.6,.42,.02],pal:['#3a1a06','#ffcf3a','#ff6464'],arena:1},sea:{box:[.56,.56,0],img:'sea',pal:['#021e5a','#90E0EF','#48CAE4']},ashaad:{box:[.66,.5,.06],img:'ashaad',pal:['#2a1608','#ffd23a','#c08a1e']},void:{box:[.3,.39,0],img:'void',pal:['#05020d','#e6c8ff','#c04df0']},
 yt:{box:[.6,.6,0],pal:['#2a0008','#ffffff','#ffb0b8']},gow:{box:[.2,.2,.3],btn:1,pal:['#000000','#ffffff','#e01a22']},moon:{box:[.62,.62,0],pal:['#2a0008','#ffffff','#ffb0b8']},rmoon:{box:[.7,.62,0],pal:['#0a3a4a','#a8fff8','#3ad8e0']},pmuseum:{box:[.4,.34,0],img:'pmuseum',pal:['#0a3a4a','#a8fff8','#3ad8e0']},wam:{box:[.56,.44,0],wam:1,pal:['#24242c','#ffffff','#8a8a96']},wmoon:{box:[.8,.66,0],wam:1,pal:['#24242c','#ffffff','#8a8a96']}};
const lgOf=b=>b.moon?LG.moon:b.par?(b.par.id==='wam'?LG.wmoon:LG.rmoon):LG[b.id];
// W.A.M. pixel font (glyphs from the game's js/font.js: [width, 11 rows of LSB-left bitmasks]), drawn white with the game's #24242c drop shadow
const WG={W:[12,3951,1902,1902,1902,1902,1902,1902,1830,2046,1023,0],'.':[3,0,0,0,0,0,0,0,0,7,7,0],A:[10,510,252,462,462,462,510,510,462,462,975,0],M:[12,1023,2046,1830,1902,1902,1902,1902,1902,1902,3951,0],
 S:[10,766,1023,911,7,254,508,896,967,1023,509,0],O:[10,252,510,462,903,903,903,903,462,510,252,0],R:[10,255,510,454,462,462,510,254,462,462,975,0],D:[10,511,1022,966,910,910,910,910,926,1022,495,0],B:[10,511,1022,974,910,510,1022,910,926,1022,495,0],T:[9,511,511,313,56,56,56,56,56,56,124,0],F:[10,1023,1022,518,78,126,126,78,14,14,31,0]};
function wamSVG(str,cls){let x=0,d='';for(const ch of str){const gl=WG[ch];if(!gl){x+=4;continue}for(let r=0;r<11;r++){const m=gl[r+1];let c=0;while(c<gl[0]){if(m>>c&1){let e=c;while(e<gl[0]&&(m>>e&1))e++;d+=`M${x+c} ${r}h${e-c}v1h${c-e}z`;c=e}else c++}}x+=gl[0]+1}
 return `<svg class="${cls}" viewBox="0 0 ${x} 11" shape-rendering="crispEdges" aria-hidden="true"><path fill="#24242c" transform="translate(1 1)" d="${d}"/><path fill="#ffffff" d="${d}"/></svg>`}
const TITLES={void:1,ashaad:1,sea:1,oldhub:1,'v-lovely':1,'v-arcade':1,'v-larper':1,'v-purple':1,'v-white':1,'v-strings':1};
function infoHTML(b){const L=lgOf(b);if(L){const href=b.moon?b.moon.url:b.href,nm=b.moon?b.moon.name:b.title,pl=`<a class="lgplay"${href?` href="${href}" target="_blank" rel="noopener"`:` href="#" data-chans="1"`} aria-label="${b.yt?'Show channels':(b.par?'Open ':'Play ')+nm}">${PLAY(...L.pal)}</a>`;
  const logo=L.btn?'':L.wam?`<div class="lglogo">${wamSVG(b.short||nm,'lgsvg lgwam')}</div>`:L.img?`<img class="lgimg" src="world/titles/${L.img}.png" alt="${nm}">`:b.yt?`<div class="lglogo">${YTLOGO}</div>`:L.arena?`<div class="lglogo"><b class="lgtx fb">BALL<br>ARENA</b></div>`:`<div class="lglogo"><b class="lgtx mo">${b.short||nm}</b></div>`;
  const ch=b.yt?`<div class="lgch" hidden>${CH.map(c=>`<button class="lgc" data-moon="m-${c.id}">${c.name}</button>`).join('')}</div>`:'';
  const lk=b.moon?'moon':b.par?b.par.id:b.id;return `<h2 class="sr">${nm}</h2>${logo}<div class="lgrow">${pl}<button type="button" class="lgland" data-land="${lk}" aria-label="Land on ${nm}">LAND</button></div>${ch}`}
 if(TITLES[b.id]){const ex=/^https?:/.test(b.href)?' target="_blank" rel="noopener"':'';return `<h2 class="sr">${b.title}</h2><a class="tlink" href="${b.href}"${ex} aria-label="${b.title}"><img class="timg" src="world/titles/${b.id}.png" alt="${b.title}"></a><a class="go" href="${b.href}"${ex}>${b.cta}</a>`}
const a=s=>/^https?:/.test(s)?' target="_blank" rel="noopener"':'';
 if(b.yt)return `<h2>${b.title}</h2><p class="stat"><b>${fmt(TV)}</b> views · <b>${fmt(TS)}</b> subs</p><div class="mlist">${CH.map(c=>`<button class="go sm" data-moon="m-${c.id}">${c.name}</button>`).join('')}</div>`;
 if(b.moon){const c=b.moon;return `<h2>${c.name}</h2><p class="stat"><b>${fmt(c.subs)}</b> subs · <b>${fmt(c.views)}</b> views</p><a class="go" href="${c.url}" target="_blank" rel="noopener">▶ Watch</a>`}
 return `<h2>${b.title}</h2>${b.href?`<a class="go" href="${b.href}"${a(b.href)}>${b.cta}</a>`:''}`}
function faceR(b){return b.id==='void'?b.w*.12:b.w*b.hr}
function focusOn(b,push=true){hideTip();if(b.deco){const o=b.deco;window.__blip&&__blip('hover');if(o===ASTRO){o.wave=performance.now();tip.textContent='👋 hi! (lost astronaut)';tip.classList.add('on')}return}window.__blip&&__blip("click");if(b.arch){enterArchive();return}if(b.home){warpTo('main');return}
 focus=b;info.className='';info.dataset.p=b.id||'';const bare=NOINFO[b.id];info.innerHTML=bare?'':'<div class="txt" style="'+theme(b)+'">'+infoHTML(b)+'</div>';
 const[x,y]=pos(b),fr=faceR(b),z=Math.min(W,H)*(W<H?.95:.82)/Math.max(b.w*(b.id==='void'?.62:b.yt?1.75:.92),1);
 info.querySelectorAll('[data-chans]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();el.hidden=true;const c=info.querySelector('.lgch');c.hidden=false;const lg=info.querySelector('.lglogo');if(lg)lg.hidden=true});
 info.querySelectorAll('[data-moon]').forEach(el=>el.onclick=e=>{e.stopPropagation();focusOn(MOONS.find(m=>m.id===el.dataset.moon))});info.querySelectorAll('[data-land]').forEach(el=>el.onclick=e=>{e.preventDefault();e.stopPropagation();window.__land&&__land(el.dataset.land)});
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
cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId)){const b=hit(e.clientX,e.clientY);hover=b;cv.style.cursor=b?'pointer':'grab';b&&!focus?showTip(b,e.clientX,e.clientY):(b&&((b.moon&&focus&&focus.yt)||(b.par&&focus&&(focus===b.par||(focus.par&&focus!==b))))?showTip(b,e.clientX,e.clientY):hideTip());return}
 const p=pts.get(e.pointerId),dx=e.clientX-p[0],dy=e.clientY-p[1];pts.set(e.pointerId,[e.clientX,e.clientY]);moved+=Math.abs(dx)+Math.abs(dy);if(moved<6)return;
 if(intro)skipIntro();tw=null;if(pts.size===2&&pinch){const[a,b]=[...pts.values()];const d=Math.hypot(a[0]-b[0],a[1]-b[1]);zoomAt((a[0]+b[0])/2,(a[1]+b[1])/2,pinch.z*d/pinch.d/cam.z)}else{cam.x-=dx/cam.z;cam.y-=dy/cam.z;mv.x=-dx/cam.z;mv.y=-dy/cam.z;mv.t=performance.now()}cv.classList.add('drag')});
const up=e=>{if(pts.size===1&&moved>=6&&performance.now()-mv.t<80&&!RM)mv.on=1;pts.delete(e.pointerId);if(pts.size<2)pinch=null;cv.classList.remove('drag')};
cv.addEventListener('pointerup',e=>{up(e);if(moved>=6)return;if(intro){skipIntro();return}const b=hit(e.clientX,e.clientY);if(b&&b.id==='sun')sunTap();if(b&&b!==focus)focusOn(b);else if(!b&&focus)history.state&&history.state.f?history.back():unfocus()});
cv.addEventListener('pointercancel',up);cv.addEventListener('pointerleave',()=>{hover=null;hideTip()});
function zoomAt(sx,sy,f){const nz=Math.max(sys==='main'?fitZ()*.45:.15,Math.min(60,cam.z*f)),[wx,wy]=S2W(sx,sy);cam.z=nz;cam.x=wx-(sx-W/2)/nz;cam.y=wy-(sy-H/2)/nz}
cv.addEventListener('wheel',e=>{e.preventDefault();if(intro)skipIntro();tw=null;zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.0015))},{passive:false});
addEventListener('keydown',e=>{if(document.body.classList.contains('landed'))return;if(intro){skipIntro();return}if(e.key==='Escape'){if(focus)history.state&&history.state.f?history.back():unfocus();else if(sys==='archive')history.state&&history.state.a?history.back():warpTo('main')}});
function showTip(b,x,y){const tx=b.moon?b.moon.name:b.title;if(tip.textContent!==tx||!tip.classList.contains("on"))window.__blip&&__blip("hover");tip.textContent=tx;tip.style.left=x+14+'px';tip.style.top=y+14+'px';tip.classList.add('on')}
function hideTip(){tip.classList.remove('on')}
resize();if(intro){cam.z=Math.min(W,H)*.82/(250*.72)}else{cam.x=fitX();cam.y=fitY();cam.z=fitZ()}
// fixed top-left satellite: archive in, home out
const satBtn=document.getElementById('sat'),SW=innerWidth<=520?72:96,SH=innerWidth<=520?45:60,SAT=P.mk(SW,SH);satBtn.width=SW;satBtn.height=SH;const sg=satBtn.getContext('2d');
setInterval(()=>{P.satellite(SAT,RM?3:performance.now()/1000);sg.clearRect(0,0,SW,SH);sg.drawImage(SAT.c,0,0)},110);
satBtn.onclick=()=>{if(warp)return;if(focus)unfocus();if(sys==='main')enterArchive();else backBtn.onclick()};
const setSatLbl=()=>satBtn.setAttribute('aria-label',sys==='main'?'Fly to the archive of old versions':'Fly home');setInterval(setSatLbl,500);setSatLbl();
requestAnimationFrame(frame);
window.__ARCH=ARCH;window.__sys={MAIN,MOONS,SHIPS,SQ,P,hit:()=>{}};window.__flare=()=>{BF.next=0};window.__solar={cam,focus:id=>focusOn([...MAIN,...MOONS,...ARCH].find(b=>b.id===id)),unfocus,screen:id=>{const b=[...MAIN,...MOONS,...ARCH].find(b=>b.id===id);return W2S(...pos(b))},skip:skipIntro,get sys(){return sys},get intro(){return !!intro}};
})();

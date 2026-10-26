/* LLC world: camera (pan/zoom/pinch), strings to every showcased site, rifts that open on approach, map view.
   To add a site: add an entry to SITES (angle in degrees from the LLC, distance in world px). */
(function(){
const SITES=[
 {id:'ashaad',theme:'ashaad',s:'ashaad',ang:200,dist:1500,title:'The Binding of Ashaad',by:'a brainrot roguelike by landrcy',img:'games/ashaad/screenshot.png',
  blurb:'Descend into the basement, shoot your tears, grab cursed items and survive in this browser roguelike. 3 starters, 4 floors, 1 secret Finley boss.',href:'https://landrcy.github.io/binding-of-ashaad/',cta:'▶ Play'},
 {id:'sea',theme:'sea',s:'sea',ang:150,dist:1500,title:'Sea of Thought',by:'a pixel ocean by landrcy',img:'sea-intro/title.png',
  blurb:'A quiet pixel ocean full of messages in bottles: write one, throw it in, then dive and read what strangers left behind.',href:'https://landrcy.github.io/sea-of-thought/',cta:'▶ Dive in'},
 {id:'void',theme:'void',s:'void',ang:250,dist:1650,title:'The Void',by:'a pixel space game by landrcy',img:'',
  blurb:'A pixel space game at the edge of a black hole. Fall in.',href:'https://landrcy.github.io/the-void/',cta:'▶ Play'},
 {id:'gow',theme:'gow',s:'gow',ang:300,dist:1500,title:'Game of Websites',by:'coopercitywebsites.github.io',img:'sites/gow/screenshot.png',
  blurb:'A searchable catalogue of every site in the collection — unblocked games, NeoForge mods, old builds and the trash pile — ranked by how much code went into each one.',href:'https://coopercitywebsites.github.io/main/',cta:'Open'},
 {id:'gh',theme:'gh',s:'gh',ang:345,dist:1350,title:'GitHub',by:'landrcy',img:'',
  blurb:'All the code behind the LLC: games, sites and experiments.',href:'https://github.com/landrcy',cta:'★ github.com/landrcy'},
 {id:'bf',theme:'bf',s:'bf',ang:100,dist:1450,title:'Eternal Ball Fight',by:'by landrcy',img:'',
  blurb:'Weapon balls fighting endlessly, with a running Total Ball Standings board.',href:'archive/#ballfight',cta:'▶ Watch'},
 // LLC Powered Channels — one red progress-bar string each
 {id:'yt-langrino',theme:'yt',s:'yt',ang:12,dist:1700,title:'Langrino',by:'@Langrino',img:'sites/yt/langrino.jpg',blurb:'Chaotic weapon-ball battle Shorts: two balls with powers enter, one ball leaves.',href:'https://www.youtube.com/@Langrino',cta:'▶ Watch on YouTube'},
 {id:'yt-clutch',theme:'yt',s:'yt',ang:32,dist:1950,title:'clutchclips',by:'@clutchclipscrate',img:'sites/yt/clutch.jpg',blurb:'The best DrDonut and Donut SMP moments, clipped into bite-size Shorts.',href:'https://www.youtube.com/@clutchclipscrate',cta:'▶ Watch on YouTube'},
 {id:'yt-trivia',theme:'yt',s:'yt',ang:52,dist:1700,title:'bowlfuloftrivia',by:'@bowlfuloftrivia',img:'sites/yt/trivia.jpg',blurb:'Quick "did you know?" fact Shorts — space, animals and everything in between.',href:'https://www.youtube.com/@bowlfuloftrivia',cta:'▶ Watch on YouTube'},
 {id:'yt-reddit',theme:'yt',s:'yt',ang:68,dist:2050,title:'RedditStoryADay',by:'@redditstoryaday',img:'sites/yt/reddit.jpg',blurb:'Pull up a log: a Reddit story a day, told over satisfying gameplay.',href:'https://www.youtube.com/channel/UCRegZeMyJ1B5B9n64rfgKAw',cta:'▶ Watch on YouTube'},
 {id:'yt-sat',theme:'yt',s:'yt',ang:82,dist:1750,title:'SAT in a Minute',by:'@satinaminuteprep · launching Oct 28',img:'sites/yt/sat.jpg',blurb:'Fast SAT prep tips, each one in under a minute.',href:'https://www.youtube.com/channel/UCfDhWTThokF3gKW03iEGijg',cta:'▶ Watch on YouTube'},
];
window.LLC_SITES=SITES;
const vp=document.getElementById('viewport'),world=document.getElementById('world'),mapBtn=document.getElementById('mapbtn');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const NS='http://www.w3.org/2000/svg';
// ---------- strings ----------
const svg=document.createElementNS(NS,'svg');svg.id='strings';world.prepend(svg);
function rnd(seed){return()=>{seed=(seed*16807)%2147483647;return seed/2147483647}}
function strandPath(site,i){
 const r=rnd(1000+i*7919),a=site.ang*Math.PI/180,ex=Math.cos(a)*site.dist,ey=Math.sin(a)*site.dist;
 const sx=Math.cos(a)*400,sy=Math.sin(a)*190; // start at the logo's edge
 const nx=-Math.sin(a),ny=Math.cos(a),bend=(r()-.5)*900,waves=1+r()*1.5,amp=60+r()*70,loopAt=.35+r()*.3,loopR=55+r()*45,dir=r()<.5?-1:1;
 const pts=[];const N=160;
 for(let k=0;k<=N;k++){const t=k/N;let x=sx+(ex-sx)*t,y=sy+(ey-sy)*t;
  const off=bend*Math.sin(Math.PI*t)+amp*Math.sin(t*Math.PI*2*waves)*Math.sin(Math.PI*t);x+=nx*off;y+=ny*off;
  const u=(t-loopAt)/.12;if(u>0&&u<1){const th=u*Math.PI*2;x+=dir*loopR*(Math.sin(th))*1-0;y+=loopR*(1-Math.cos(th))*dir*.9;
   const d=loopR*Math.sin(th);x+=Math.cos(a)*0*d}
  pts.push([x,y])}
 pts[N]=[ex,ey];site.x=ex;site.y=ey;
 return 'M'+pts.map(p=>p[0].toFixed(1)+' '+p[1].toFixed(1)).join('L')}
SITES.forEach((s,i)=>{const g=document.createElementNS(NS,'g');g.setAttribute('class','s-'+s.s);g.dataset.id=s.id;
 const d=strandPath(s,i);
 for(const c of ['main','deco','hit']){const p=document.createElementNS(NS,'path');p.setAttribute('d',d);p.setAttribute('class',c);g.appendChild(p)}
 const t=document.createElementNS(NS,'title');t.textContent='Follow the string to '+s.title;g.appendChild(t);
 svg.appendChild(g);s.path=g.querySelector('.main');s.len=s.path.getTotalLength();
 if(s.s==='yt'){const L=s.len,pr=.35+((i*37)%50)/100;g.querySelector('.deco').setAttribute('stroke-dasharray',`${L*pr} ${L}`)}
 g.querySelector('.hit').addEventListener('click',e=>{if(dragMoved>6)return;e.stopPropagation();follow(s)});
 // rift
 const rf=document.createElement('div');rf.className='rift r-'+s.theme;rf.id='rift-'+s.id;rf.style.left=s.x+'px';rf.style.top=s.y+'px';
 rf.innerHTML=`<button class="seed" aria-label="Open rift: ${s.title}"></button><div class="panel"><h2>${s.title}</h2><p class="by">${s.by}</p>`+
  (s.img?`<img src="${s.img}" alt="" loading="lazy">`:'')+`<p>${s.blurb}</p><a class="go" href="${s.href}" ${s.href.startsWith('http')?'target="_blank" rel="noopener"':''}>${s.cta}</a></div>`;
 rf.querySelector('.seed').addEventListener('click',e=>{e.stopPropagation();if(mapMode)setMap(false,s);else follow(s)});
 world.appendChild(rf);s.el=rf});
// ---------- camera: world point (px,py) at screen centre, zoom z ----------
let px=0,py=0,z=1,anim=0,mapMode=false;
const ZMIN=.06,ZMAX=2.5;
function draw(){world.style.transform=`translate(${-px*z}px,${-py*z}px) scale(${z})`;
 let g=7*z;while(g<6)g*=2;while(g>14)g/=2; // keep dot spacing 6-14px at any zoom
 vp.style.backgroundSize=g+'px '+g+'px';vp.style.backgroundPosition=`calc(50% + ${-px*z}px) calc(50% + ${-py*z}px)`;
 for(const s of SITES){const d=Math.hypot(s.x-px,s.y-py),open=!mapMode&&z>.55&&d<520/z;if(open!==s.el.classList.contains('open'))s.el.classList.toggle('open',open)}}
function stop(){cancelAnimationFrame(anim);anim=0}
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
function to(x,y,zz,ms=900){stop();if(RM||!ms){px=x;py=y;z=zz;return draw()}
 const sx=px,sy=py,sz=z,t0=performance.now();
 const f=t=>{const k=ease(Math.min(1,(t-t0)/ms));px=sx+(x-sx)*k;py=sy+(y-sy)*k;z=Math.exp(Math.log(sz)+(Math.log(zz)-Math.log(sz))*k);draw();if(k<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)}
// fly along a string from wherever it's nearest to the camera, to its rift
function follow(s){if(mapMode)return setMap(false,s);stop();
 if(RM){px=s.x;py=s.y;z=1;return draw()}
 const L=s.len;let best=0,bd=1e9;for(let l=0;l<=L;l+=L/80){const p=s.path.getPointAtLength(l),d=Math.hypot(p.x-px,p.y-py);if(d<bd){bd=d;best=l}}
 const sx=px,sy=py,sz=z,ms=Math.min(4200,1400+(L-best)*1.3),t0=performance.now(),p0=s.path.getPointAtLength(best);
 const f=t=>{const k=ease(Math.min(1,(t-t0)/ms)),p=s.path.getPointAtLength(best+(L-best)*k),j=Math.min(1,k*5);
  px=sx+(p.x-sx)*j+(p.x-p0.x)*(1-j)*0;px=j<1?sx+(p.x-sx)*j:p.x;py=j<1?sy+(p.y-sy)*j:p.y;
  z=Math.min(sz,.8)+(1-Math.min(sz,.8))*k;if(k<.15)z=sz+(Math.min(sz,.8)-sz)*(k/.15);draw();if(k<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)}
// ---------- map ----------
function fitAll(){let a=0,b=0,c=0,d=0;for(const s of SITES){a=Math.min(a,s.x);b=Math.max(b,s.x);c=Math.min(c,s.y);d=Math.max(d,s.y)}
 const m=300,zz=Math.max(ZMIN,Math.min((innerWidth)/(b-a+2*m),(innerHeight)/(d-c+2*m)));return[(a+b)/2,(c+d)/2,zz]}
let preMap=null;
function setMap(on,target){mapMode=on;document.body.classList.toggle('mapmode',on);mapBtn.setAttribute('aria-pressed',on);
 if(on){preMap=[px,py,z];const f=fitAll();to(f[0],f[1],f[2],1400)}
 else if(target){to(target.x,target.y,1,1400)}else{const p=preMap||[0,0,1];to(p[0],p[1],Math.max(.6,p[2]),1400)}}
mapBtn.onclick=()=>setMap(!mapMode);
// ---------- input: drag, pinch, wheel, keys ----------
const ptrs=new Map();let dragMoved=0,pinch=null;
vp.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.panel,.hit'))return;stop();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});dragMoved=0;vp.setPointerCapture(e.pointerId);vp.classList.add('drag');
 if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z}}});
// allow drags that start on a string too (click still follows it if it didn't move)
svg.addEventListener('pointerdown',e=>{if(!e.target.classList.contains('hit'))return;stop();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});dragMoved=0;vp.classList.add('drag')});
addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p)return;const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;dragMoved+=Math.abs(dx)+Math.abs(dy);
 if(ptrs.size===2&&pinch){const[a,b]=[...ptrs.values()];zoomAt((a.x+b.x)/2,(a.y+b.y)/2,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d/z);px-=dx/2/z;py-=dy/2/z}
 else{px-=dx/z;py-=dy/z}draw()});
const end=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!ptrs.size)vp.classList.remove('drag')};addEventListener('pointerup',end);addEventListener('pointercancel',end);
vp.addEventListener('click',e=>{if(dragMoved>6)e.stopPropagation()},true);
function zoomAt(sx,sy,f){const nz=Math.max(ZMIN,Math.min(ZMAX,z*f));const wx=px+(sx-innerWidth/2)/z,wy=py+(sy-innerHeight/2)/z;z=nz;px=wx-(sx-innerWidth/2)/z;py=wy-(sy-innerHeight/2)/z;draw()}
vp.addEventListener('wheel',e=>{e.preventDefault();stop();if(e.ctrlKey||e.metaKey)zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.01));else{px+=e.deltaX/z;py+=e.deltaY/z;draw()}},{passive:false});
addEventListener('keydown',e=>{if(e.target.closest&&e.target.closest('input,textarea'))return;const s=(e.shiftKey?240:60)/z,m={ArrowLeft:[-s,0],ArrowRight:[s,0],ArrowUp:[0,-s],ArrowDown:[0,s]}[e.key];
 if(m){e.preventDefault();e.stopImmediatePropagation();to(px+m[0],py+m[1],z,RM?0:180)}
 else if(e.key==='+'||e.key==='='){e.stopImmediatePropagation();to(px,py,Math.min(ZMAX,z*1.25),RM?0:200)}else if(e.key==='-'){e.stopImmediatePropagation();to(px,py,Math.max(ZMIN,z/1.25),RM?0:200)}
 else if(e.key==='m'||e.key==='M'){e.stopImmediatePropagation();setMap(!mapMode)}else if(e.key==='Escape'&&mapMode){e.stopImmediatePropagation();setMap(false)}},true);
document.getElementById('recenter').onclick=()=>{if(mapMode){mapMode=false;document.body.classList.remove('mapmode');mapBtn.setAttribute('aria-pressed',false)}to(0,0,1)};
window.__pan={get x(){return px},get y(){return py},get z(){return z},set(x,y,zz=z){stop();px=x;py=y;z=zz;draw()},to,follow:id=>follow(SITES.find(s=>s.id===id)),map:setMap};
addEventListener('resize',draw);draw();
})();

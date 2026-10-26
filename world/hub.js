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
 {id:'bf',theme:'bf',s:'bf',ang:100,dist:1450,title:'Eternal Ball Fight',by:'by landrcy',img:'',
  blurb:'Weapon balls fighting endlessly, with a running Total Ball Standings board.',href:'archive/#ballfight',cta:'▶ Watch'},
 // LLC Powered Channels — one red progress-bar string each
 {id:'yt-langrino',theme:'yt',s:'yt',title:'Langrino',by:'@Langrino',img:'sites/yt/langrino.jpg',blurb:'Chaotic weapon-ball battle Shorts: two balls with powers enter, one ball leaves.',href:'https://www.youtube.com/@Langrino',cta:'▶ Watch on YouTube'},
 {id:'yt-clutch',theme:'yt',s:'yt',title:'clutchclips',by:'@clutchclipscrate',img:'sites/yt/clutch.jpg',blurb:'The best DrDonut and Donut SMP moments, clipped into bite-size Shorts.',href:'https://www.youtube.com/@clutchclipscrate',cta:'▶ Watch on YouTube'},
 {id:'yt-trivia',theme:'yt',s:'yt',title:'bowlfuloftrivia',by:'@bowlfuloftrivia',img:'sites/yt/trivia.jpg',blurb:'Quick "did you know?" fact Shorts — space, animals and everything in between.',href:'https://www.youtube.com/@bowlfuloftrivia',cta:'▶ Watch on YouTube'},
 {id:'yt-reddit',theme:'yt',s:'yt',title:'RedditStoryADay',by:'@redditstoryaday',img:'sites/yt/reddit.jpg',blurb:'Pull up a log: a Reddit story a day, told over satisfying gameplay.',href:'https://www.youtube.com/channel/UCRegZeMyJ1B5B9n64rfgKAw',cta:'▶ Watch on YouTube'},
 {id:'yt-sat',theme:'yt',s:'yt',title:'SAT in a Minute',by:'@satinaminuteprep · launching Oct 28',img:'sites/yt/sat.jpg',blurb:'Fast SAT prep tips, each one in under a minute.',href:'https://www.youtube.com/channel/UCfDhWTThokF3gKW03iEGijg',cta:'▶ Watch on YouTube'},
];
window.LLC_SITES=SITES;
const vp=document.getElementById('viewport'),world=document.getElementById('world'),mapBtn=document.getElementById('mapbtn');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const P=3; // screen px per art pixel (at zoom 1) — every string/rift is drawn on this grid
function rnd(seed){return()=>{seed=(seed*16807)%2147483647;return seed/2147483647}}
const hex=c=>[parseInt(c.slice(1,3),16),parseInt(c.slice(3,5),16),parseInt(c.slice(5,7),16)];
// ---------- custom minimalist pixel icons (12x12, 2-4 colours from each rift palette) ----------
const ICONS={
 ashaad:{pal:{a:'#1b1211',b:'#a3343c',c:'#e8c9a8'},art:['....aaaa....','..aabbbbaa..','.abbbbbbbba.','.abbbbbbbba.','abbaabbaabba','abbaabbaabba','abbcabbcabba','abbcbbbcbbba','.abcbaabcba.','.abbbbbbbba.','..aabbbbaa..','....aaaa....']},
 sea:{pal:{a:'#0e3b6e',b:'#2a74c8',c:'#e8f6ff'},art:['............','......cc....','....ccbbc...','...cbbbbbc..','..cbbaabbbc.','..cbaa.abbc.','.cbba...cbc.','.cbba.......','cbbbbcc.....','bbbbbbbbccbb','aabbbbbbbbaa','aaaaaaaaaaaa']},
 void:{pal:{a:'#3b1f73',b:'#7a4dff',c:'#c6a8ff',d:'#ffffff'},art:['d..........d','....aaaa....','...abbbba...','..abbcbbba..','cccbbbbbbccc','.ccccccccc..','..abbbbbba..','...abbbba...','....aaaa....','............','.d........d.','............']},
 gow:{pal:{a:'#111111',b:'#ffffff'},art:['............','a....a....a.','aa..aaa..aa.','aaa.aaa.aaa.','aaaaaaaaaaa.','aabaabaabaa.','aaaaaaaaaaa.','aaaaaaaaaaa.','............','aaaaaaaaaaa.','............','............']},
 bf:{pal:{a:'#5a2a00',b:'#f08a24',c:'#ffc27a'},art:['....aaaa....','..aabbbbaa..','.abccbbbbba.','.abccbbbbba.','abbbbbbbbbba','abbbbbbbbbba','abbbbbbbbbba','abbbbbbbbbba','.abbbbbbbba.','.abbbbbbbba.','..aabbbbaa..','....aaaa....']},
 'yt-langrino':{pal:{a:'#ff9f1a',b:'#ffffff',c:'#ff0000'},art:['............','.aaa....bbb.','aaaaa..bbbbb','aaaaa..bbbbb','aaaaa..bbbbb','.aaa.c..bbb.','....ccc.....','.....c......','............','..cccccccc..','............','............']},
 'yt-clutch':{pal:{a:'#e86fb0',b:'#c98a4b',c:'#ffffff'},art:['....aaaa....','..aacaaaaa..','.aaaaaacaaa.','.acaaaaaaaa.','aaaab..baaca','aaab....baaa','bbbb....bbbb','bbbbb..bbbbb','.bbbbbbbbbb.','.bbbbbbbbbb.','..bbbbbbbb..','....bbbb....']},
 'yt-trivia':{pal:{a:'#ffd84a',b:'#ffffff',c:'#ff0000'},art:['....aaaa....','...aa..aa...','.......aa...','.....aaa....','.....aa.....','............','.....aa.....','............','bbbbbbbbbbbb','.bbbbbbbbbb.','..bbccccbb..','...bbbbbb...']},
 'yt-reddit':{pal:{a:'#ff5700',b:'#ffffff',c:'#0f0f0f'},art:['.aaaaaaaaaa.','aaaaaaaaaaaa','aabbbbbbbbaa','aaaaaaaaaaaa','aabbbbbbaaaa','aaaaaaaaaaaa','aabbbbbbbbaa','aaaaaaaaaaaa','.aaaaaaaaaa.','...aaa......','...aa.......','...a........']},
 'yt-sat':{pal:{a:'#5ad17a',b:'#ffffff',c:'#ff0000'},art:['....bbbb....','.....bb.....','...aaaaaa...','..aabbbbaa..','.abbbbcbbba.','.abbbbcbbba.','.abbbbcbbba.','.abbbbbbbba.','.abbbbbbbba.','..aabbbbaa..','...aaaaaa...','............']}};
const ihash=(x,y)=>{let h=(x*374761393+y*668265263)>>>0;h=((h^(h>>>13))*1274126177)>>>0;return((h^(h>>>16))&1023)/1023};
// draw icon pixels via fn(x,y,colour); k = materialize progress: pixels condense from dark rift depth to full colour in hashed order
function iconPix(id,k,t,fn){const I=ICONS[id];const bob=RM?0:(Math.sin(t*2.2+id.length)>.6?-1:0);
 I.art.forEach((row,y)=>[...row].forEach((ch,x)=>{const cl=I.pal[ch];if(!cl)return;const h=ihash(x+3,y+7)*.8;if(k<h)return;
  if(k<h+.2){const v=hex(cl),m=.25+(k-h)/.2*.5;fn(x,y+bob,`rgb(${v[0]*m|0},${v[1]*m|0},${v[2]*m|0})`)}else fn(x,y+bob,cl)}));
 // idle twinkle: one pixel briefly brightens
 if(!RM&&k>=1){const n=((t*3)|0)%37,x=n%12,y=(n*5)%12;if(I.pal[I.art[y][x]])fn(x,y+bob,'#ffffff')}}
window.__icons={ICONS,iconPix};
// ---------- oval frame around the logo: draws itself first (~1s), strings anchor on it ----------
const OVR=[485,228];
const OV=(()=>{const n=4000,pt=[],cum=[0];for(let i=0;i<=n;i++){const a=-Math.PI/2+i/n*6.2832;pt.push([Math.cos(a)*OVR[0],Math.sin(a)*OVR[1]]);if(i)cum.push(cum[i-1]+Math.hypot(pt[i][0]-pt[i-1][0],pt[i][1]-pt[i-1][1]))}
 const tot=cum[n],anc=[];for(let k=0;k<6;k++){const l=tot*k/6;let i=0;while(cum[i]<l)i++;anc.push(pt[i])}return{pt,anc}})();
// ---------- string geometry (world px) ----------
// evenly spaced radial layout; each string is one eased cubic Bézier (gentle S-curve), arc-length resampled
const ORDER=['gow','void','ashaad','sea','yt','bf'];const TI=ORDER.indexOf('yt');
const YT=['yt-langrino','yt-clutch','yt-trivia','yt-reddit','yt-sat'];
function bez(site,sx,sy,ex,ey,bowf){const L=Math.hypot(ex-sx,ey-sy),ux=(ex-sx)/L,uy=(ey-sy)/L,nx=-uy,ny=ux,bow=bowf*L;
 const c1=[sx+(ex-sx)*.3+nx*bow,sy+(ey-sy)*.3+ny*bow],c2=[sx+(ex-sx)*.7-nx*bow*.8,sy+(ey-sy)*.7-ny*bow*.8];
 const B=t=>{const m=1-t;return[m*m*m*sx+3*m*m*t*c1[0]+3*m*t*t*c2[0]+t*t*t*ex,m*m*m*sy+3*m*m*t*c1[1]+3*m*t*t*c2[1]+t*t*t*ey]};
 const raw=[],rc=[0];for(let j=0;j<=2000;j++){raw.push(B(j/2000));if(j)rc.push(rc[j-1]+Math.hypot(raw[j][0]-raw[j-1][0],raw[j][1]-raw[j-1][1]))}
 const tot=rc[2000],pts=[],cum=[];let q=0;for(let j=0;j<=400;j++){const l=tot*j/400;while(q<1999&&rc[q+1]<l)q++;const f=(l-rc[q])/((rc[q+1]-rc[q])||1);
  pts.push([raw[q][0]+(raw[q+1][0]-raw[q][0])*f,raw[q][1]+(raw[q+1][1]-raw[q][1])*f]);cum.push(l)}
 site.x=ex;site.y=ey;site.pts=pts;site.cum=cum;site.len=tot}
const ang=k=>Math.atan2(OV.anc[k][1]/OVR[1],OV.anc[k][0]/OVR[0]);const anc=k=>OV.anc[k];
// main strings: 7 evenly spaced; the YouTube trunk ends at a branch point that splits into 5 short delta branches
const TRUNK={id:'yt',s:'ytT',title:'LLC Powered Channels',endZ:.3};
function strandPts(site){
 if(site===TRUNK){const a=ang(TI),D=1250;bez(site,anc(TI)[0],anc(TI)[1],Math.cos(a)*D,Math.sin(a)*D,.12);return}
 const j=YT.indexOf(site.id);
 if(j>=0){const a=ang(TI),bx=TRUNK.x,by=TRUNK.y,b=a+(j-2)*.55,D=j%2?1300:950;bez(site,bx,by,bx+Math.cos(b)*D,by+Math.sin(b)*D,(j-2)*.05+(j%2?.06:-.06));return}
 const k=ORDER.indexOf(site.id),a=ang(k),D=k%2?1750:1550;bez(site,anc(k)[0],anc(k)[1],Math.cos(a)*D,Math.sin(a)*D,k%2?.16:-.16)}
function pointAt(s,l){const c=s.cum;let lo=0,hi=c.length-1;l=Math.max(0,Math.min(s.len,l));while(hi-lo>1){const m=(lo+hi)>>1;if(c[m]<l)lo=m;else hi=m}
 const k=(l-c[lo])/((c[hi]-c[lo])||1);return{x:s.pts[lo][0]+(s.pts[hi][0]-s.pts[lo][0])*k,y:s.pts[lo][1]+(s.pts[hi][1]-s.pts[lo][1])*k}}
// ---------- per-site pixel styles: outline, 3 shading tones, radius (art px), pattern + decorations ----------
// slender lines: 2px core (highlight + body) tapering to 1px toward the rift; one sparse accent every ~700px
const STY={
 ashaad:{hi:'#7a2a34',mid:'#3e0d14',acc:'blood'}, sea:{hi:'#9fd3ff',mid:'#2a6fb8',acc:'drop'},
 void:{hi:'#b48cff',mid:'#2a1650',acc:'star'}, gow:{hi:'#555555',mid:'#111111',acc:'blot'},
 yt:{hi:'#e6e6e6',mid:'#a8a8a8',red:['#ff6b6b','#e00000'],acc:'scrub'}, gh:{hi:'#6e7781',mid:'#24292f',acc:'commit'},
 bf:{hi:'#ffc27a',mid:'#d9731a',acc:'ball'},
 ytT:{hi:'#9a9a9a',mid:'#3a3a3a',red:['#ff6b6b','#e00000'],acc:'scrub'},
 'yt-langrino':{hi:'#ffc46b',mid:'#d97a00',red:['#ff6b6b','#e00000'],acc:'scrub'},'yt-clutch':{hi:'#f6a8d2',mid:'#c2457f',red:['#ff6b6b','#e00000'],acc:'scrub'},
 'yt-trivia':{hi:'#ffe98f',mid:'#c9a400',red:['#ff6b6b','#e00000'],acc:'scrub'},'yt-reddit':{hi:'#ff9a5c',mid:'#c94400',red:['#ff6b6b','#e00000'],acc:'scrub'},
 'yt-sat':{hi:'#9de8b0',mid:'#2f9e52',red:['#ff6b6b','#e00000'],acc:'scrub'}};
function buildString(s,idx){
 const st=STY[s.id]||STY[s.s];let a=1e9,b=-1e9,c=1e9,d=-1e9;for(const p of s.pts){a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1])}
 const M=8,ox=Math.floor(a/P)-M,oy=Math.floor(c/P)-M,w=Math.ceil(b/P)-ox+M,h=Math.ceil(d/P)-oy+M,N=w*h;
 const col=new Array(N).fill(null),arc=new Float32Array(N).fill(1e9),kind=new Uint8Array(N);
 const set=(x,y,cl,k,ar)=>{if(x<0||y<0||x>=w||y>=h)return;const p=y*w+x;if(k<kind[p])return;kind[p]=k;col[p]=cl;arc[p]=Math.min(arc[p],ar)};
 const L=s.len/P,pr=st.red?.3+((idx*37)%45)/100:0;
 let last=null;
 for(let l=0;l<=L;l+=.35){const p=pointAt(s,l*P),q=pointAt(s,Math.min(L,l+1)*P);let tx=q.x-p.x,ty=q.y-p.y;const tl=Math.hypot(tx,ty)||1;tx/=tl;ty/=tl;
  const u=p.x/P-ox,v=p.y/P-oy,x=Math.round(u),y=Math.round(v),red=false;
  set(x,y,red?st.red[1]:st.mid,2,l); // core
  if(l<L*.62){ // 2nd pixel (highlight) on the upper/left side while the line is still thick → tapers to 1px
   const nx=-ty,ny=tx,sgn=(nx*-.6+ny*-.8)>0?1:-1,hx=Math.round(u+nx*sgn*.9),hy=Math.round(v+ny*sgn*.9);
   if(hx!==x||hy!==y)set(hx,hy,red?st.red[0]:st.hi,1,l)}}
 // sparse accents
 const acc=(l)=>{const p=pointAt(s,l*P),u=Math.round(p.x/P-ox),v=Math.round(p.y/P-oy);return[u,v]};
 const n=Math.max(1,Math.floor(L/240));
 for(let j=1;j<=n;j++){const l=L*j/(n+1),[u,v]=acc(l);
  switch(st.acc){
   case'blood':set(u,v+1,'#8a0f17',3,l);set(u,v+2,'#8a0f17',3,l);set(u,v+3,'#e0757b',3,l);break;
   case'drop':set(u,v+2,'#4fa3e8',3,l);set(u,v+3,'#cfeaff',3,l);break;
   case'star':for(const[dx,dy,cl]of[[0,-3,'#ffffff'],[0,-4,'#b48cff'],[0,-2,'#b48cff'],[-1,-3,'#b48cff'],[1,-3,'#b48cff']])set(u+dx,v+dy,cl,3,l);break;
   case'blot':for(const[dx,dy]of[[0,0],[1,0],[0,1],[1,1],[-1,0],[0,-1],[2,1]])set(u+dx,v+dy,'#111111',3,l);break;
   case'commit':for(const[dx,dy,cl]of[[0,0,'#2da44e'],[1,0,'#2da44e'],[0,1,'#116329'],[1,1,'#116329'],[0,-1,'#24292f'],[1,-1,'#24292f'],[-1,0,'#24292f'],[-1,1,'#24292f'],[2,0,'#24292f'],[2,1,'#24292f'],[0,2,'#24292f'],[1,2,'#24292f']])set(u+dx,v+dy,cl,3,l);break;
   case'ball':for(const[dx,dy,cl]of[[0,-2,'#ffb3b3'],[1,-2,'#e53935'],[0,-1,'#e53935'],[1,-1,'#8e1b1b']])set(u+dx,v+dy,cl,3,l);break;
  }}
 if(st.acc==='scrub'){const[u,v]=acc(pr*L);for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++){const dd=dx*dx+dy*dy;if(dd<=4)set(u+dx,v+dy,dd<=1&&dx<=0&&dy<=0?'#ff8a8a':dd===4||dd===5?'#a30000':'#ff0000',4,pr*L)}}
 const order=[];for(let p=0;p<N;p++)if(kind[p])order.push(p);order.sort((p,q)=>arc[p]-arc[q]);
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;cv.className='strand';cv.style.cssText=`left:${ox*P}px;top:${oy*P}px;width:${w*P}px;height:${h*P}px`;
 const cx=cv.getContext('2d'),img=cx.createImageData(w,h);
 s.str={cv,cx,img,order,rgb:col.map(c=>c?hex(c):null),arc,shown:0,L,frac:0};
 const sp=document.createElement('i');sp.className='spark';s.spark=sp;
 cv.style.transformOrigin=`${s.pts[0][0]-ox*P}px ${s.pts[0][1]-oy*P}px`;cv.style.animationDelay=(-idx*1.3)+'s';
 const pu=document.createElement('i');pu.className='pulse';s.pulse=pu;s.pph=idx*.37;
 return[cv,sp,pu]}
function growTo(s,frac){const g=s.str,d=g.img.data;frac=Math.max(0,Math.min(1.001,frac));const lim=frac*g.L+.01;let n=g.shown;
 if(frac<g.frac){while(n>0&&g.arc[g.order[n-1]]>lim){const o=g.order[n-1]*4;d[o+3]=0;n--}} // retract
 else while(n<g.order.length&&g.arc[g.order[n]]<=lim){const p=g.order[n],c=g.rgb[p],o=p*4;d[o]=c[0];d[o+1]=c[1];d[o+2]=c[2];d[o+3]=255;n++}
 g.frac=frac;if(n!==g.shown){g.shown=n;g.cx.putImageData(g.img,0,0)}
 // glowing pixel spark at the moving tip
 const moving=frac>0&&frac<1,sp=s.spark;sp.style.display=moving?'block':'none';
 if(moving){const p=pointAt(s,frac*s.len);sp.style.left=Math.round(p.x/P)*P+'px';sp.style.top=Math.round(p.y/P)*P+'px'}}
// ---------- rifts: a pixel crack in the white dot-grid surface with the site's world inside ----------
const RW=150,RH=130; // art px canvas around each rift
const THEME={
 ashaad:{bg:['#1b1211','#3a2418','#5a3a22'],acc:'#a3343c'},sea:{bg:['#0e3b6e','#2a74c8','#8fd0ff'],acc:'#e8f6ff'},
 void:{bg:['#05030a','#1a0f33','#3b1f73'],acc:'#c6a8ff'},gow:{bg:['#ffffff','#f1f1f1','#111111'],acc:'#111111'},
 yt:{bg:['#0f0f0f','#272727','#ff0000'],acc:'#ffffff'},gh:{bg:['#0d1117','#161b22','#2da44e'],acc:'#7ee2a0'},bf:{bg:['#fff6ea','#ffd9a8','#f08a24'],acc:'#5a2a00'}};
function makeRift(s,idx){
 const r=rnd(500+idx*97),K=48,rad=[];for(let k=0;k<K;k++)rad.push(.72+r()*.5); // jagged edge profile
 const cracks=[];for(let k=0;k<9;k++){const a=r()*6.283,seg=[];let x=0,y=0,ang=a;for(let j=0;j<7;j++){ang+=(r()-.5)*.9;const st=3+r()*5;x+=Math.cos(ang)*st;y+=Math.sin(ang)*st;seg.push([x,y])}cracks.push({a,seg,br:r()})}
 const shards=[];for(let k=0;k<26;k++)shards.push({a:r()*6.283,d:r(),sz:1+((r()*3)|0),vx:(r()-.5)*1.2,vy:-r()*1.5,rot:(r()*4)|0});
 const cv=document.createElement('canvas');cv.width=RW;cv.height=RH;cv.className='riftcv';
 return{cv,cx:cv.getContext('2d'),rad,cracks,shards,open:0,target:0,pop:0,t:0}}
function drawRift(s){const R=s.rift,c=R.cx,th=THEME[s.theme],t=R.t;c.clearRect(0,0,RW,RH);if(R.pop<=0)return;
 const ox=RW/2,oy=RH/2,o=R.open,pop=Math.min(1,R.pop);
 const bx=(9+o*58)*pop,by=(8+o*48)*pop; // crack half-size in art px
 const px=(x,y,cl)=>{c.fillStyle=cl;c.fillRect(x|0,y|0,1,1)};
 const inside=(x,y)=>{const dx=(x-ox)/bx,dy=(y-oy)/by,a=Math.atan2(dy,dx),k=((a/6.283+1)%1)*R.rad.length,i0=k|0,f=k-i0,rr=R.rad[i0]*(1-f)+R.rad[(i0+1)%R.rad.length]*f;return Math.hypot(dx,dy)<=rr};
 // fracture lines radiating into the white surface
 for(const cr of R.cracks){const len=Math.min(cr.seg.length,Math.floor(2+o*5+pop*2));const ex=Math.cos(cr.a)*bx*.95,ey=Math.sin(cr.a)*by*.95;
  for(let j=0;j<len;j++){const p=cr.seg[j],q=j?cr.seg[j-1]:[0,0];const sc=1+o*1.5;const x0=ox+ex+q[0]*sc,y0=oy+ey+q[1]*sc,x1=ox+ex+p[0]*sc,y1=oy+ey+p[1]*sc;
   const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/(n||1)),y=Math.round(y0+(y1-y0)*k/(n||1));px(x,y,'#5b6170');px(x+1,y+1,'#c9ced8')}}}
 // themed world inside + edge with shadowed, chipped white lip
 for(let y=0;y<RH;y++)for(let x=0;x<RW;x++){if(!inside(x,y))continue;
  const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
  if(edge){px(x,y,RM?'#2a2d36':(((x*7+y*13+((t*8)|0))%23)===0?th.acc:'#2a2d36'));continue}
  const deep=!inside(x,y-3)||!inside(x-2,y); // depth shadow under the top/left lip
  px(x,y,themePix(s.theme,th,x-ox,y-oy,t,deep))}
 // the site's icon materializes out of the rift depth (2 art px per icon px), clipped to the crack
 R.ic=RM?1:Math.min(1.2,(R.ic||0)+.06);const S=2,ix=ox-12,iy=oy-12+(R.open>0?-Math.round(R.open*6):0);
 iconPix(s.id,R.ic,t,(x,y,cl)=>{for(let j=0;j<S;j++)for(let i=0;i<S;i++){const X=ix+x*S+i,Y=iy+y*S+j;if(inside(X,Y)&&inside(X,Y-2))px(X,Y,cl)}});
 // white lip shards on the rim (raised, with drop shadow) + falling shards while opening
 for(const sh of R.shards){const a=sh.a,ex=ox+Math.cos(a)*bx*(1.02+sh.d*.12),ey=oy+Math.sin(a)*by*(1.02+sh.d*.12);
  let fx=ex,fy=ey;if(!RM&&sh.d>.6){fx+=Math.round(Math.sin(t*.9+sh.a*5)*1.2);fy+=Math.round(Math.cos(t*.7+sh.a*3))}const fall=R.fall||0;if(fall>0&&sh.d>.45){fx+=sh.vx*fall*8;fy+=(sh.vy*fall+fall*fall*1.2)*8}
  if(fall>0&&sh.d>.45&&fall>1.6)continue;
  for(let j=0;j<sh.sz;j++)for(let i=0;i<sh.sz+(sh.rot&1);i++){px(fx+i+1,fy+j+1,'#9aa1ae');}
  for(let j=0;j<sh.sz;j++)for(let i=0;i<sh.sz+(sh.rot&1);i++)px(fx+i,fy+j,j===0?'#ffffff':'#e6e9ef')}}
function themePix(name,th,x,y,t,deep){const b=th.bg;let c;
 switch(name){
  case'ashaad':{const row=Math.floor((y+40)/4),off=row&1?3:0,mort=((y+40)%4===0)||(((x+40+off)%7)===0);c=mort?'#140c0b':(((x*7+y*3)&7)<2?'#4a2f1c':'#5a3a22');
   if(Math.hypot(x,y+2)<6+Math.sin(t*3)*1)c=(Math.hypot(x,y+2)<3)?'#000':'#2a0a0c';break}
  case'sea':{const w=Math.sin((x*.35)+t*2.4)*2+Math.sin(x*.12-t)*1.5;c=y<w-6?'#8fd0ff':y<w-4?'#e8f6ff':y<w+6?'#2a74c8':'#0e3b6e';if(((x*13+y*7+((t*6)|0))%41)===0)c='#e8f6ff';break}
  case'void':{const d=Math.hypot(x,y*1.3),a=Math.atan2(y,x)+t*1.4;c=d<6?'#000':(Math.abs(((a*3+d*.25)%6.28)-3)<.5&&d<26)?'#7a4dff':((x*31+y*17)%53===0)?'#fff':'#05030a';break}
  case'gow':{c=((x+60)%10===0||(y+60)%10===0)?'#dcdcdc':'#ffffff';if(Math.abs(y+((x*3+((t*4)|0))%7))<1.2&&Math.abs(x)<20)c='#111';break}
  case'yt':{c=(y+60)%3===0?'#151515':'#0f0f0f';if(Math.abs(x)<8&&Math.abs(y)<6&&x>-4+Math.abs(y)*0.9-2&&x<6-Math.abs(y)*.9)c=Math.abs(x)<8&&x>-4&&(x+4)<(6-Math.abs(y))*1.6?'#ffffff':c;
   if(Math.abs(x)<=10&&Math.abs(y)<=7&&!(x>-4&&x<5-Math.abs(y)*1.2&&Math.abs(y)<5))c=c==='#ffffff'?c:'#ff0000';break}
  case'gh':{const cx=Math.floor((x+60)/3),cy=Math.floor((y+60)/3),edge=(x+60)%3===2||(y+60)%3===2;const v=((cx*7+cy*13+((t*2)|0)*3)%11);c=edge?'#0d1117':v<2?'#39d353':v<4?'#26a641':v<6?'#006d32':'#161b22';break}
  case'bf':{c=((x+y+60)%8<4)?'#fff6ea':'#ffe9cc';const bx=Math.sin(t*2.2)*12,by=-Math.abs(Math.sin(t*4))*8+4;const d=Math.hypot(x-bx,y-by);if(d<3.2)c=d<1.5&&x<bx?'#ffc27a':'#f08a24';else if(d<4.2)c='#5a2a00';
   const b2x=-Math.sin(t*1.7)*10,b2y=-Math.abs(Math.cos(t*3.4))*6+4,d2=Math.hypot(x-b2x,y-b2y);if(d2<2.6)c='#1e6fe5';else if(d2<3.5&&c!=='#5a2a00')c='#0b1a2b';break}
 }
 if(deep){const v=hex(c);c=`rgb(${v[0]*.55|0},${v[1]*.55|0},${v[2]*.55|0})`}
 return c}
// ---------- build world ----------
const strandLayer=document.createElement('div');strandLayer.id='strands';world.prepend(strandLayer);
{const W=Math.ceil(OVR[0]/P)*2+8,H=Math.ceil(OVR[1]/P)*2+8,cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.id='oval';
 cv.style.cssText=`left:${-W/2*P}px;top:${-H/2*P}px;width:${W*P}px;height:${H*P}px`;strandLayer.appendChild(cv);const c=cv.getContext('2d'),seen=new Set();
 const dot=(x,y,cl)=>{c.fillStyle=cl;c.fillRect(x,y,1,1)};
 const drawTo=f=>{const n=Math.floor(f*(OV.pt.length-1));for(let i=0;i<=n;i+=2){const[x,y]=OV.pt[i],X=Math.round(x/P+W/2),Y=Math.round(y/P+H/2),key=X+','+Y;if(seen.has(key))continue;seen.add(key);
   dot(X,Y,'#2b2b33');dot(Math.round(x/P*.975+W/2),Math.round(y/P*.95+H/2),'#c9ced8')}};
 const knots=()=>OV.anc.forEach(([x,y])=>{const X=Math.round(x/P+W/2),Y=Math.round(y/P+H/2);for(const[dx,dy,cl]of[[0,-1,'#2b2b33'],[-1,0,'#2b2b33'],[1,0,'#2b2b33'],[0,1,'#2b2b33'],[0,0,'#ffffff']])dot(X+dx,Y+dy,cl)});
 if(RM){drawTo(1);knots()}else{const t0=performance.now(),D=1000;const f=t=>{const k=Math.min(1,(t-t0)/D);drawTo(1-Math.pow(1-k,3));if(k<1)requestAnimationFrame(f);else knots()};requestAnimationFrame(f)}}
strandPts(TRUNK);strandLayer.append(...buildString(TRUNK,99));const STRS=[...SITES,TRUNK];
SITES.forEach((s,i)=>{strandPts(s,i);strandLayer.append(...buildString(s,i));
 const rf=document.createElement('div');rf.className='rift r-'+s.theme;rf.id='rift-'+s.id;rf.style.left=s.x+'px';rf.style.top=s.y+'px';
 s.rift=makeRift(s,i);
 rf.innerHTML=`<button class="seed" aria-label="Open rift: ${s.title}"></button><div class="panel"><h2>${s.title}</h2><p class="by">${s.by}</p>`+
  `<canvas class="icon" width="12" height="12"></canvas>`+`<p>${s.blurb}</p><a class="go" href="${s.href}" ${s.href.startsWith('http')?'target="_blank" rel="noopener"':''}>${s.cta}</a></div>`;
 rf.prepend(s.rift.cv);
 rf.querySelector('.seed').addEventListener('click',e=>{e.stopPropagation();if(dragMoved>6)return;if(mapMode)setMap(false,s);else follow(s)});
 s.icv=rf.querySelector('.icon');s.icx=s.icv.getContext('2d');s.pk=0;world.appendChild(rf);s.el=rf});
// ---------- intro: strings grow out after the LLC finishes forming ----------
let growStart=0,retractAt=0;
function introDone(){const p=window.__llc5&&__llc5.phase;return p==='rest'||p==='static'}
const GROW=1400,STAG=180,easeIO=k=>k<.5?2*k*k:1-Math.pow(-2*k+2,2)/2;
function growStep(now){
 if(!growStart){if(introDone())growStart=now;else return}
 for(const s of STRS){const yb=YT.indexOf(s.id),o=yb>=0?ORDER.length+GROW/STAG+yb*.6:ORDER.indexOf(s.id);let k;
  if(retractAt){const ro=yb>=0?0:s===TRUNK?3:3+(ORDER.length-1-o);k=RM?0:1-Math.min(1,Math.max(0,(now-retractAt-ro*STAG*.5)/(GROW*.7)));}
  else k=RM?1:Math.min(1,Math.max(0,(now-growStart-o*STAG)/GROW));
  const f=easeIO(k);if(Math.abs(f-s.str.frac)>1e-4||(k===1&&s.str.frac<1))growTo(s,k>=1?1.001:f);
  if(s===TRUNK)continue;
  if(k>=1&&!retractAt&&s.rift.pop<1){s.rift.pop=RM?1:Math.min(1,s.rift.pop+.12);s.el.classList.add('shown')}
  if(retractAt&&k<1){s.rift.pop=0;s.rift.ic=0;s.el.classList.remove('shown','open')}}}
// hide (retract back into the logo) / show (draw outward again)
function retractStrings(){retractAt=performance.now()}function growStrings(){if(retractAt){retractAt=0;growStart=performance.now()}}
// ---------- camera ----------
let px=0,py=0,z=1,anim=0,mapMode=false;const ZMIN=.05,ZMAX=3;
function draw(){const tx=Math.round(-px*z),ty=Math.round(-py*z);world.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;
 let g=7*z;while(g<6)g*=2;while(g>14)g/=2;vp.style.backgroundSize=g+'px '+g+'px';vp.style.backgroundPosition=`calc(50% + ${tx}px) calc(50% + ${ty}px)`;
 world.style.setProperty('--ms',mapMode?Math.min(8,.45/z):1);
 for(const s of SITES){const d=Math.hypot(s.x-px,s.y-py);s.rift.target=(!mapMode&&z>.55&&d<520/z&&s.rift.pop>=1)?1:0}}
function stop(){cancelAnimationFrame(anim);anim=0}
const ease=k=>k<.5?4*k*k*k:1-Math.pow(-2*k+2,3)/2;
function to(x,y,zz,ms=900){stop();if(RM||!ms){px=x;py=y;z=zz;return draw()}const sx=px,sy=py,sz=z,t0=performance.now();
 const f=t=>{const k=ease(Math.min(1,(t-t0)/ms));px=sx+(x-sx)*k;py=sy+(y-sy)*k;z=Math.exp(Math.log(sz)+(Math.log(zz)-Math.log(sz))*k);draw();if(k<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)}
function follow(s){if(mapMode)return setMap(false,s);stop();if(RM){px=s.x;py=s.y;z=s.endZ||1;return draw()}
 let best=0,bd=1e9;for(let l=0;l<=s.len;l+=s.len/80){const p=pointAt(s,l),d=Math.hypot(p.x-px,p.y-py);if(d<bd){bd=d;best=l}}
 const sx=px,sy=py,sz=z,zt=Math.min(sz,.8,s.endZ||1),ms=Math.min(4200,1400+(s.len-best)*1.3),t0=performance.now();
 const f=t=>{const k=ease(Math.min(1,(t-t0)/ms)),p=pointAt(s,best+(s.len-best)*k),j=Math.min(1,k*5);px=sx+(p.x-sx)*j;py=sy+(p.y-sy)*j;
  const ez=s.endZ||1;z=k<.15?sz+(zt-sz)*(k/.15):zt+(ez-zt)*k;draw();if(k<1)anim=requestAnimationFrame(f)};anim=requestAnimationFrame(f)}
function fitAll(){let a=0,b=0,c=0,d=0;for(const s of SITES){a=Math.min(a,s.x);b=Math.max(b,s.x);c=Math.min(c,s.y);d=Math.max(d,s.y)}
 const mx=90,my=110;return[(a+b)/2,(c+d)/2,Math.max(ZMIN,Math.min((innerWidth-2*mx)/(b-a),(innerHeight-2*my)/(d-c)))]}
let preMap=null;
function setMap(on,target){mapMode=on;document.body.classList.toggle('mapmode',on);mapBtn.setAttribute('aria-pressed',on);
 if(on){preMap=[px,py,z];const f=fitAll();to(f[0],f[1],f[2],1400)}else if(target)to(target.x,target.y,1,1400);else{const p=preMap||[0,0,1];to(p[0],p[1],Math.max(.6,p[2]),1400)}}
mapBtn.onclick=()=>setMap(!mapMode);
// ---------- per-frame: string growth + rift crack animation (8 fps pixel steps) ----------
let lastR=0;
function loop(now){requestAnimationFrame(loop);growStep(now);
 if(!RM)for(const s of STRS){const pu=s.pulse;if(s.str.frac<1){pu.style.display='none';continue}
  const T=4.5,ph=((now/1000+s.pph*T)%T)/T,on=ph<.6;pu.style.display=on?'block':'none';if(!on)continue;
  const p=pointAt(s,ph/.6*s.len);pu.style.transform=`translate(${Math.round(p.x/P)*P}px,${Math.round(p.y/P)*P}px)`;pu.style.opacity=Math.sin(ph/.6*Math.PI).toFixed(2)}
 if(now-lastR<125)return;lastR=now;
 for(const s of SITES){const R=s.rift;if(R.pop<=0)continue;R.t=now/1000;const was=R.open;
  if(R.target>R.open)R.open=RM?1:Math.min(1,R.open+.2);else if(R.target<R.open)R.open=RM?0:Math.max(0,R.open-.25);
  R.fall=R.open>0&&R.target?(R.fall||0)+.25:0;
  const open=R.open>=1;if(open!==s.el.classList.contains('open'))s.el.classList.toggle('open',open);
  // only redraw rifts near the view (cheap) or in map mode
  if(open){s.pk=RM?1.2:Math.min(1.2,s.pk+.1);s.icx.clearRect(0,0,12,12);iconPix(s.id,s.pk,R.t,(x,y,cl)=>{s.icx.fillStyle=cl;s.icx.fillRect(x,y,1,1)})}else s.pk=0;
  const d=Math.hypot(s.x-px,s.y-py)*z;if(d<innerWidth*1.2||mapMode)drawRift(s)}}
requestAnimationFrame(loop);
// ---------- input ----------
const ptrs=new Map();let dragMoved=0,pinch=null;
function nearestString(cx,cy){const wx=px+(cx-innerWidth/2)/z,wy=py+(cy-innerHeight/2)/z,tol=16/z;let best=null,bd=tol;
 for(const s of STRS){if(s.str.shown<s.str.order.length*.9)continue;for(let k=0;k<s.pts.length;k+=2){const d=Math.hypot(s.pts[k][0]-wx,s.pts[k][1]-wy);if(d<bd){bd=d;best=s}}}return best}
vp.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.panel'))return;stop();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});dragMoved=0;vp.setPointerCapture(e.pointerId);vp.classList.add('drag');
 if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z}}});
addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);
 if(!p){if(e.pointerType==='mouse'&&!mapMode)vp.classList.toggle('onstring',!!nearestString(e.clientX,e.clientY));return}
 const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;dragMoved+=Math.abs(dx)+Math.abs(dy);
 if(ptrs.size===2&&pinch){const[a,b]=[...ptrs.values()];zoomAt((a.x+b.x)/2,(a.y+b.y)/2,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d/z);px-=dx/2/z;py-=dy/2/z}else{px-=dx/z;py-=dy/z}draw()});
const end=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!ptrs.size)vp.classList.remove('drag')};addEventListener('pointerup',end);addEventListener('pointercancel',end);
vp.addEventListener('click',e=>{if(dragMoved>6){e.stopPropagation();return}if(mapMode||e.target.closest('button,a,.panel'))return;const s=nearestString(e.clientX,e.clientY);if(s){e.stopPropagation();follow(s)}},true);
function zoomAt(sx,sy,f){const nz=Math.max(ZMIN,Math.min(ZMAX,z*f)),wx=px+(sx-innerWidth/2)/z,wy=py+(sy-innerHeight/2)/z;z=nz;px=wx-(sx-innerWidth/2)/z;py=wy-(sy-innerHeight/2)/z;draw()}
vp.addEventListener('wheel',e=>{e.preventDefault();stop();if(e.ctrlKey||e.metaKey)zoomAt(e.clientX,e.clientY,Math.exp(-e.deltaY*.01));else{px+=e.deltaX/z;py+=e.deltaY/z;draw()}},{passive:false});
addEventListener('keydown',e=>{const s=(e.shiftKey?240:60)/z,m={ArrowLeft:[-s,0],ArrowRight:[s,0],ArrowUp:[0,-s],ArrowDown:[0,s]}[e.key];
 if(m){e.preventDefault();e.stopImmediatePropagation();to(px+m[0],py+m[1],z,RM?0:180)}
 else if(e.key==='+'||e.key==='='){e.stopImmediatePropagation();to(px,py,Math.min(ZMAX,z*1.25),RM?0:200)}else if(e.key==='-'){e.stopImmediatePropagation();to(px,py,Math.max(ZMIN,z/1.25),RM?0:200)}
 else if(e.key==='m'||e.key==='M'){e.stopImmediatePropagation();setMap(!mapMode)}else if(e.key==='Escape'&&mapMode){e.stopImmediatePropagation();setMap(false)}},true);
document.getElementById('recenter').onclick=()=>{if(mapMode){mapMode=false;document.body.classList.remove('mapmode');mapBtn.setAttribute('aria-pressed',false)}to(0,0,1)};
// pixel-art map icon
{const c=document.createElement('canvas');c.width=12;c.height=10;const x=c.getContext('2d');const art=['.##..##..##.','#ee##ff##ee#','#ee#ff#gg#e#','#e##ff#gg#e#','#ee#ffr#gee#','#ee#f#r#g#e#','#e##ff##gee#','#ee#ff#gg#e#','#ee##ff##ee#','.##..##..##.'],pal={'#':'#222','e':'#cfe3b4','f':'#f3e2b0','g':'#9fc9e8','r':'#d33'};
 art.forEach((row,y)=>[...row].forEach((ch,X)=>{if(pal[ch]){x.fillStyle=pal[ch];x.fillRect(X,y,1,1)}}));mapBtn.innerHTML='';mapBtn.appendChild(c)}
window.__pan={get x(){return px},get y(){return py},get z(){return z},set(x,y,zz=z){stop();px=x;py=y;z=zz;draw()},to,follow:id=>follow(STRS.find(s=>s.id===id)),map:setMap,retract:retractStrings,grow:growStrings,
 point:(id,f)=>{const s=SITES.find(s=>s.id===id),p=pointAt(s,s.len*f);return[innerWidth/2+(p.x-px)*z,innerHeight/2+(p.y-py)*z]}};
addEventListener('resize',draw);draw();
})();


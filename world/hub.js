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
// ---------- carved rococo wood frame + wood-grain panel (pixel art, procedural heightmap) ----------
const C32=new Map();function c32(c){let v=C32.get(c);if(v!==undefined)return v;let r,g,b,a=255;
 if(c[0]==='#'){if(c.length===4){r=parseInt(c[1]+c[1],16);g=parseInt(c[2]+c[2],16);b=parseInt(c[3]+c[3],16)}else{r=parseInt(c.slice(1,3),16);g=parseInt(c.slice(3,5),16);b=parseInt(c.slice(5,7),16)}}
 else{const m=c.match(/[\d.]+/g);r=+m[0];g=+m[1];b=+m[2];if(m[3]!=null)a=Math.round(+m[3]*255)}
 v=((a<<24)|(b<<16)|(g<<8)|r)>>>0;C32.set(c,v);return v}
const FA=127,FB=63,BAND=12;
function buildFrame(layer){
 const M=30,W=(FA+BAND+M)*2,H=(FB+BAND+M)*2,cx=W/2,cy=H/2,N=W*H;
 const Hm=new Float32Array(N),mat=new Uint8Array(N),tm=new Float32Array(N).fill(99);
 const TAU=6.2832,ap=(x,y)=>((Math.atan2(y,x)+Math.PI/2+TAU)%TAU)/TAU;
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const X=x-cx+.5,Y=y-cy+.5,r=Math.hypot(X/FA,Y/FB),th=Math.atan2(Y/FB,X/FA),d=(r-1)*Math.hypot(FA*Math.cos(th),FB*Math.sin(th)),p=y*W+x;
  if(d<0){mat[p]=1;tm[p]=1.25+.3*Math.min(1,r)}
  else if(d<BAND){const q=d/BAND;mat[p]=2;Hm[p]=1+.9*Math.sin(Math.PI*q)-(Math.abs(q-.6)<.09?.45:0)+(q<.18?.25:0);tm[p]=ap(X,Y)*.8}}
 const stamp=(ex,ey,R,hf,m,t0)=>{for(let j=-R-1;j<=R+1;j++)for(let i=-R-1;i<=R+1;i++){const x=Math.round(cx+ex+i),y=Math.round(cy+ey+j);if(x<0||y<0||x>=W||y>=H)continue;
   const h=hf(x-cx-ex,y-cy-ey);if(!(h>0))continue;const p=y*W+x,base=m===4?3:2,v=base+h;if(v>Hm[p]||mat[p]<2){Hm[p]=Math.max(Hm[p],v);mat[p]=m;tm[p]=Math.min(tm[p],t0+ihash(x,y)*.08)}}};
 const rose=(R,rot)=>(dx,dy)=>{const r=Math.hypot(dx,dy),f=Math.atan2(dy,dx),Re=R*(.78+.22*Math.abs(Math.cos(2.5*f+rot)));if(r>Re)return 0;
  let h=1.3*(1-r/Re)+.35*Math.cos(5*f+rot)*(r/Re);if(Math.abs(r/R-.55)<.09)h-=.35;if(r<R*.28)h+=.6;return h};
 const leaf=(L,Wd,al)=>(dx,dy)=>{const u=dx*Math.cos(al)+dy*Math.sin(al),v=-dx*Math.sin(al)+dy*Math.cos(al);if(u<0||u>L)return 0;const w=Wd*Math.sin(Math.PI*u/L);if(Math.abs(v)>w)return 0;let h=1-(v*v)/(w*w+.01)*.7;if(Math.abs(v)<.6)h-=.3;return h};
 const curl=(sg)=>(dx,dy)=>{const r=Math.hypot(dx,dy);if(r>5.5)return 0;const f=(Math.atan2(dy,dx)*sg+TAU)%TAU;let best=9;for(let k=0;k<3;k++){const rr=1+.55*(f+TAU*k);best=Math.min(best,Math.abs(r-rr))}return best<1.1?1-best/1.1:0};
 const at=(th,off)=>[(FA+off)*Math.cos(th),(FB+off)*Math.sin(th)];
 for(let i=0;i<48;i++){const th=-Math.PI/2+i/48*TAU,[ex,ey]=at(th,BAND*.55),t0=ap(ex,ey)*.8+.22,tang=Math.atan2(FB*Math.cos(th),-FA*Math.sin(th)),out=Math.atan2(FA*Math.sin(th),FB*Math.cos(th));
  if(i%12===0){stamp(ex,ey,11,rose(11,i),3,t0);for(const s of[-1,1]){const[lx,ly]=at(th+s*.09,BAND*.5);stamp(lx,ly,12,leaf(12,3.6,tang+(s>0?0:Math.PI)+s*.35),3,t0+.03);
     const[qx,qy]=at(th+s*.16,BAND*.9);stamp(qx,qy,6,rose(4.5,i+s),3,t0+.05)}}
  else if(i%4===0){stamp(ex,ey,8,rose(7,i*1.7),3,t0);const[lx,ly]=at(th+.05,BAND);stamp(lx,ly,8,leaf(8,2.6,out+.6),3,t0+.04)}
  else if(i%4===2){const[sx,sy]=at(th,BAND*.95);stamp(sx,sy,6,curl(i%8===2?1:-1),3,t0)}
  else{stamp(ex,ey,9,leaf(9,2.8,tang+(i%2?0:Math.PI)+.25),3,t0);const[bx,by]=at(th,BAND*.3);stamp(bx,by,3,(dx,dy)=>{const r=Math.hypot(dx,dy);return r<2.2?1-r/2.6:0},3,t0+.03)}}
 // knobs: string attachment points on the outer edge, evenly spaced (same anchors the strings use)
 OV.anc.forEach(([wx,wy],k)=>{const ex=wx/P,ey=wy/P;stamp(ex,ey,6,(dx,dy)=>{const r=Math.hypot(dx,dy);return r<4.2?.8+Math.sqrt(1-(r/4.2)**2)*1.6:r<5.6?.5:0},4,1.5+k*.02)});
 // shade the height field (light from top-left), wood ramp, outlines, soft drop shadow
 const RAMP=['#1e0f05','#3a1d0a','#552c12','#6e3c18','#8a4f22','#a8673a','#c98a58','#e0ab78'].map(c32),KN=['#2a1407','#4a2410','#7a4424','#b06a3e','#e09a68','#ffd2a8'].map(c32);
 const WOOD=['#3e2210','#4a2913','#552f17','#61371b','#6d3f20','#7a4826'].map(c32),SEAM=c32('#2a160a'),OUT=c32('#140a03'),SH=c32('rgba(40,20,5,.22)');
 const col=new Uint32Array(N);
 for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const p=y*W+x,m=mat[p];if(!m){const q=(y-2)*W+(x-1);if(y>2&&x>1&&mat[q]>=2){col[p]=SH;tm[p]=tm[q]}continue}
  if(m===1){const X=x-cx,Y=y-cy,row=Math.floor((Y+200)/14),rowY=(Y+200)%14,off=(row*37)%60;
   if(rowY===0||((X+400+off)%70===0)){col[p]=SEAM;continue}
   const g=Y*1.1+3.2*Math.sin(X*.045+row)+1.6*Math.sin(X*.13+Y*.05+row*2),v=Math.sin(g*1.15)*.5+.5;
   let i=Math.floor(v*2.4+ihash(x,y)*1.3+1.2);const r=Math.hypot(X/FA,Y/FB);if(r>.9)i-=Math.round((r-.9)*30);if(r<.55)i+=1;
   for(const[kx,ky]of[[-70,18],[64,-30],[20,40]]){const kd=Math.hypot((X-kx)/2.2,Y-ky);if(kd<5&&((kd|0)%2===0))i-=2}
   col[p]=WOOD[Math.max(0,Math.min(5,i))];continue}
  const gx=Hm[p+1]-Hm[p-1],gy=Hm[p+W]-Hm[p-W],nl=(.5*gx+.6*gy+.62)/Math.hypot(gx,gy,1);
  if(!mat[p-1]||!mat[p+1]||!mat[p-W]||!mat[p+W]){col[p]=OUT;continue}
  const ao=(Hm[p]<(Hm[p-1]+Hm[p+1]+Hm[p-W]+Hm[p+W])/4-.25)?-1.2:0;
  if(m===4){col[p]=KN[Math.max(0,Math.min(5,Math.floor(nl*5.2+ao)))];continue}
  const b=nl*6.4+ao+(ihash(x*3,y)-.5)*.9+(m===3?.5:0)+Math.sin((x*.9+y*.3))*.25;
  col[p]=RAMP[Math.max(0,Math.min(7,Math.floor(b)))]}
 const cv=document.createElement('canvas');cv.width=W;cv.height=H;cv.id='oval';cv.style.cssText=`left:${-W/2*P}px;top:${-H/2*P}px;width:${W*P}px;height:${H*P}px`;layer.appendChild(cv);
 const c=cv.getContext('2d'),img=c.createImageData(W,H),u=new Uint32Array(img.data.buffer);
 const order=[];for(let p=0;p<N;p++)if(col[p])order.push(p);order.sort((a,b)=>tm[a]-tm[b]);
 if(RM){for(const p of order)u[p]=col[p];c.putImageData(img,0,0);return}
 let n=0,last=0;const t0=performance.now();const f=now=>{if(now-last>=80||n===0){last=now;const el=(now-t0)/1000;while(n<order.length&&tm[order[n]]<=el){u[order[n]]=col[order[n]];n++}c.putImageData(img,0,0)}if(n<order.length)requestAnimationFrame(f)};requestAnimationFrame(f)}
const OVR=[(FA+BAND+2)*P,(FB+BAND+2)*P];
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
const TRUNK={id:'yt',s:'ytT',title:'LLC Powered Channels',endZ:.95};
function strandPts(site){
 if(site===TRUNK){const a=ang(TI),D=2300;bez(site,anc(TI)[0],anc(TI)[1],Math.cos(a)*D,Math.sin(a)*D,.12);return}
 const j=YT.indexOf(site.id);
 if(j>=0){const a=ang(TI),bx=TRUNK.x,by=TRUNK.y,b=a+(j-2)*.55,D=j%2?1300:950;bez(site,bx,by,bx+Math.cos(b)*D,by+Math.sin(b)*D,(j-2)*.05+(j%2?.06:-.06));return}
 const k=ORDER.indexOf(site.id),a=ang(k),D=k%2?2650:2250;bez(site,anc(k)[0],anc(k)[1],Math.cos(a)*D,Math.sin(a)*D,k%2?.16:-.16)}
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
const RW=330,RH=290; // art px canvas around each rift
const THEME={
 ashaad:{bg:['#1b1211','#3a2418','#5a3a22'],acc:'#a3343c'},sea:{bg:['#0e3b6e','#2a74c8','#8fd0ff'],acc:'#e8f6ff'},
 void:{bg:['#05030a','#1a0f33','#3b1f73'],acc:'#c6a8ff'},gow:{bg:['#ffffff','#f1f1f1','#111111'],acc:'#111111'},
 yt:{bg:['#0f0f0f','#272727','#ff0000'],acc:'#ffffff'},gh:{bg:['#0d1117','#161b22','#2da44e'],acc:'#7ee2a0'},bf:{bg:['#fff6ea','#ffd9a8','#f08a24'],acc:'#5a2a00'}};
function makeRift(s,idx){
 const r=rnd(500+idx*97),K=48,rad=[];for(let k=0;k<K;k++)rad.push(.72+r()*.5); // jagged edge profile
 const cracks=[];for(let k=0;k<9;k++){const a=r()*6.283,seg=[];let x=0,y=0,ang=a;for(let j=0;j<7;j++){ang+=(r()-.5)*.9;const st=3+r()*5;x+=Math.cos(ang)*st;y+=Math.sin(ang)*st;seg.push([x,y])}cracks.push({a,seg,br:r()})}
 const shards=[];for(let k=0;k<60;k++)shards.push({a:r()*6.283,d:r(),sz:1+((r()*3)|0),vx:(r()-.5)*1.2,vy:-r()*1.5,rot:(r()*4)|0});
 const cv=document.createElement('canvas');cv.width=RW;cv.height=RH;cv.className='riftcv';
 const cx=cv.getContext('2d'),img=cx.createImageData(RW,RH);return{cv,cx,img,u:new Uint32Array(img.data.buffer),rad,cracks,shards,open:0,target:0,pop:0,t:0}}
function drawRift(s){const R=s.rift,c=R.cx,th=THEME[s.theme],t=R.t;R.u.fill(0);if(R.pop<=0){c.putImageData(R.img,0,0);return}
 const ox=RW/2,oy=RH/2,o=R.open,pop=Math.min(1,R.pop);
 const bx=(14+o*132)*pop,by=(12+o*112)*pop; // crack half-size in art px
 const px=(x,y,cl)=>{x|=0;y|=0;if(x>=0&&y>=0&&x<RW&&y<RH)R.u[y*RW+x]=c32(cl)};
 const inside=(x,y)=>{const dx=(x-ox)/bx,dy=(y-oy)/by,a=Math.atan2(dy,dx),k=((a/6.283+1)%1)*R.rad.length,i0=k|0,f=k-i0,rr=R.rad[i0]*(1-f)+R.rad[(i0+1)%R.rad.length]*f;return Math.hypot(dx,dy)<=rr};
 // fracture lines radiating into the white surface
 for(const cr of R.cracks){const len=Math.min(cr.seg.length,Math.floor(2+o*5+pop*2));const ex=Math.cos(cr.a)*bx*.95,ey=Math.sin(cr.a)*by*.95;
  for(let j=0;j<len;j++){const p=cr.seg[j],q=j?cr.seg[j-1]:[0,0];const sc=1+o*3.4;const x0=ox+ex+q[0]*sc,y0=oy+ey+q[1]*sc,x1=ox+ex+p[0]*sc,y1=oy+ey+p[1]*sc;
   const n=Math.max(Math.abs(x1-x0),Math.abs(y1-y0))|0;for(let k=0;k<=n;k++){const x=Math.round(x0+(x1-x0)*k/(n||1)),y=Math.round(y0+(y1-y0)*k/(n||1));px(x,y,'#5b6170');px(x+1,y+1,'#c9ced8')}}}
 // themed world inside + edge with shadowed, chipped white lip
 const y0=Math.max(0,Math.floor(oy-by*1.3)-2),y1=Math.min(RH,Math.ceil(oy+by*1.3)+2),x0=Math.max(0,Math.floor(ox-bx*1.3)-2),x1=Math.min(RW,Math.ceil(ox+bx*1.3)+2);
 for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){if(!inside(x,y))continue;
  const edge=!inside(x-1,y)||!inside(x+1,y)||!inside(x,y-1)||!inside(x,y+1);
  if(edge){px(x,y,RM?'#2a2d36':(((x*7+y*13+((t*8)|0))%23)===0?th.acc:'#2a2d36'));continue}
  const deep=!inside(x,y-3)||!inside(x-2,y); // depth shadow under the top/left lip
  px(x,y,themePix(s.theme,th,x-ox,y-oy,t,deep))}
 // the site's icon materializes out of the rift depth (2 art px per icon px), clipped to the crack
 R.ic=RM?1:Math.min(1.2,(R.ic||0)+.06);const S=3,ix=ox-18,iy=oy-18;
 iconPix(s.id,R.ic,t,(x,y,cl)=>{for(let j=0;j<S;j++)for(let i=0;i<S;i++){const X=ix+x*S+i,Y=iy+y*S+j;if(inside(X,Y)&&inside(X,Y-2))px(X,Y,cl)}});
 // white lip shards on the rim (raised, with drop shadow) + falling shards while opening
 for(const sh of R.shards){const a=sh.a,ex=ox+Math.cos(a)*bx*(1.02+sh.d*.12),ey=oy+Math.sin(a)*by*(1.02+sh.d*.12);
  let fx=ex,fy=ey;if(!RM&&sh.d>.6){fx+=Math.round(Math.sin(t*.9+sh.a*5)*1.2);fy+=Math.round(Math.cos(t*.7+sh.a*3))}const fall=R.fall||0;if(fall>0&&sh.d>.45){fx+=sh.vx*fall*8;fy+=(sh.vy*fall+fall*fall*1.2)*8}
  if(fall>0&&sh.d>.45&&fall>1.6)continue;
  for(let j=0;j<sh.sz;j++)for(let i=0;i<sh.sz+(sh.rot&1);i++){px(fx+i+1,fy+j+1,'#9aa1ae');}
  for(let j=0;j<sh.sz;j++)for(let i=0;i<sh.sz+(sh.rot&1);i++)px(fx+i,fy+j,j===0?'#ffffff':'#e6e9ef')}
 c.putImageData(R.img,0,0)}
function themePix(name,th,x,y,t,deep){const b=th.bg;let c;
 switch(name){
  case'ashaad':{const row=Math.floor((y+40)/4),off=row&1?3:0,mort=((y+40)%4===0)||(((x+40+off)%7)===0);c=mort?'#140c0b':(((x*7+y*3)&7)<2?'#4a2f1c':'#5a3a22');
   if(Math.hypot(x,y+2)<6+Math.sin(t*3)*1)c=(Math.hypot(x,y+2)<3)?'#000':'#2a0a0c';break}
  case'sea':{const w=Math.sin((x*.35)+t*2.4)*2+Math.sin(x*.12-t)*1.5;c=y<w-6?'#8fd0ff':y<w-4?'#e8f6ff':y<w+6?'#2a74c8':'#0e3b6e';if(ihash(x+((t*2)|0),y)>.992)c='#e8f6ff';break}
  case'void':{const d=Math.hypot(x,y*1.3),a=Math.atan2(y,x)+t*1.4;c=d<6?'#000':(Math.abs(((a*3+d*.25)%6.28)-3)<.5&&d<26)?'#7a4dff':(ihash(x,y)>.988)?'#fff':'#05030a';break}
  case'gow':{c=((x+60)%10===0||(y+60)%10===0)?'#dcdcdc':'#ffffff';if(Math.abs(y+((x*3+((t*4)|0))%7))<1.2&&Math.abs(x)<20)c='#111';break}
  case'yt':{c=(y+60)%3===0?'#151515':'#0f0f0f';if(Math.abs(x)<8&&Math.abs(y)<6&&x>-4+Math.abs(y)*0.9-2&&x<6-Math.abs(y)*.9)c=Math.abs(x)<8&&x>-4&&(x+4)<(6-Math.abs(y))*1.6?'#ffffff':c;
   if(Math.abs(x)<=10&&Math.abs(y)<=7&&!(x>-4&&x<5-Math.abs(y)*1.2&&Math.abs(y)<5))c=c==='#ffffff'?c:'#ff0000';break}
  case'gh':{const cx=Math.floor((x+60)/3),cy=Math.floor((y+60)/3),edge=(x+60)%3===2||(y+60)%3===2;const v=((cx*7+cy*13+((t*2)|0)*3)%11);c=edge?'#0d1117':v<2?'#39d353':v<4?'#26a641':v<6?'#006d32':'#161b22';break}
  case'bf':{c=((x+y+60)%8<4)?'#fff6ea':'#ffe9cc';const bx=Math.sin(t*2.2)*12,by=-Math.abs(Math.sin(t*4))*8+4;const d=Math.hypot(x-bx,y-by);if(d<3.2)c=d<1.5&&x<bx?'#ffc27a':'#f08a24';else if(d<4.2)c='#5a2a00';
   const b2x=-Math.sin(t*1.7)*10,b2y=-Math.abs(Math.cos(t*3.4))*6+4,d2=Math.hypot(x-b2x,y-b2y);if(d2<2.6)c='#1e6fe5';else if(d2<3.5&&c!=='#5a2a00')c='#0b1a2b';break}
 }
 if(deep){const v=hex(c);c=`rgb(${v[0]*.55|0},${v[1]*.55|0},${v[2]*.55|0})`}
 return c}
// ---------- rift reveal shapes: each site's text lives inside a detailed pixel-art object (no rectangles) ----------
const SZ=180;
const SHAPES={
 sea:{box:[-36,-20,36,46],pix(x,y,t,k){const wy=64+Math.round(2*Math.sin(x*.16+t*2.2)+Math.sin(x*.07-t));
   if(y>=wy&&(x/88)**2+((y-80)/16)**2<1)return y===wy?'#e8f6ff':y<wy+3?'#4f9be0':((x*3+y*5+((t*4)|0))%17===0?'#8fd0ff':'#2a74c8');
   const Y=y-Math.round((1-k)*130),inb=(x,Y)=>{const ax=Math.abs(x);if(Y>=-84&&Y<-80)return ax<17;if(Y>=-80&&Y<-56)return ax<13;if(Y>=-56&&Y<-34)return ax<13+38*((Y+56)/22);
    if(Y>=-34&&Y<=62){const cy=Y>42?Y-42:0;return ax<=51&&(ax<31||cy===0||(ax-31)**2+cy*cy<400)}return false};
   if(Y>=-96&&Y<-84&&Math.abs(x)<11)return Math.abs(x)>8||Y===-96?'#5a3418':(((x+Y)&3)===0?'#8a5a2b':'#b07a45');
   if(!inb(x,Y))return null;if(!inb(x-1,Y)||!inb(x+1,Y)||!inb(x,Y-1)||!inb(x,Y+1))return'#0b3a4a';
   if(Math.abs(x)<=40&&Y>=-26&&Y<=50){if(Math.abs(x)===40||Y===-26||Y===50)return'#a8864a';if(Y<-22||Y>46)return(Y&1)?'#c9a96a':'#e2c890';return((x*7+Y*3)%29===0)?'#ead6a6':'#f3e2b8'}
   if(x<-38&&x>-46&&Y>-30&&Y<52)return'#e8fbff';if(Math.abs(x)<9&&Y<-60)return x<-4?'#e8fbff':'#7cc4d8';
   const bub=((x*13+Math.round(Y+t*6)*7)%61===0);return bub?'#e8fbff':x>38?'#4f9cb4':'#7cc4d8'}},
 void:{box:[-40,-38,40,38],pix(x,y,t,k){const r=Math.hypot(x,y),a=Math.atan2(y,x);if(r>k*112+4*Math.sin(a*3+t))return null;
   if(r<56)return r>53?'#2a1650':'#000';if(r<59)return(((a*8+t*3)%2+2)%2<1)?'#ffd9a8':'#ffffff';
   const e=(x/104)**2+(y/30)**2;if(e<1){const v=Math.sin(a*3-t*2+r*.18);return v>.6?'#ffd27a':v>.1?'#ff9a3c':v>-.4?'#b44cff':'#5a1fa8'}
   if(r<68)return((x*7+y*3)&3)?'#1a0f33':'#3b1f73';if(((x*31+y*17)&127)===0)return'#ffffff';return null}},
 ashaad:{box:[-64,-46,64,46],pix(x,y,t,k){const ax=Math.abs(x),ay=Math.abs(y);if(ay>k*70)return null;if(ax>84||ay>66||ax+ay>136)return null;
   if(ax>82||ay>64||ax+ay>134)return'#140c0b';
   if(ax>70||ay>52||ax+ay>112){if(ax<12&&y<-50)return y<-58?'#000':'#2a0a0c';if(ay<10&&ax>70)return ax>76?'#000':'#2a0a0c';
    const row=(y+90)>>2,off=row&1?4:0;if(((y+90)&3)===0||((x+90+off)%9===0))return'#1b1211';if(y<-52&&ax<60&&((x*5)%13===0)&&y>-60+((x*3)&3))return'#8a0f17';return ihash(x>>2,y>>2)>.5?'#4a2f1c':'#5a3a22'}
   if(ax>68||ay>50||ax+ay>110)return'#0d0807';
   if(((x+96)%16===0)||((y+96)%16===0))return'#241814';const st=Math.hypot(x+40,y-30)<9||Math.hypot(x-52,y+30)<6;return st?'#3a1515':(ihash(x,y)>.93?'#3d2a20':'#33231a')}},
 gow:{box:[-56,-52,56,38],pix(x,y,t,k){const H=Math.round(k*62),ax=Math.abs(x),ay=Math.abs(y),dr=ay-(H+6);
   if(Math.abs(dr)<=6&&ax<=76){if(ax>70)return Math.abs(dr)>4?null:'#3a2a1a';const i=Math.floor((y<0?-dr:dr)+6);return['#8a7e62','#a89c80','#c4b896','#d9cfb5','#efe7d2','#f8f2e2','#f8f2e2','#efe7d2','#d9cfb5','#c4b896','#a89c80','#8a7e62','#6e6450'][Math.max(0,Math.min(12,i))]}
   if(ay>H||ax>64)return null;if(ax>=63)return'#d8cba8';
   if(H>50){const d=Math.hypot(x-44,y-46);if(d<11)return d>9?'#7a1018':(d<4&&x<44)?'#e05a62':(((x+y)&3)===0?'#8a1820':'#b3202a')}
   return(((y+80)%8===0)?'#efe6d0':(ihash(x,y)>.97?'#e8dfc6':'#fbf7ec'))}},
 bf:{box:[-52,-44,52,44],pix(x,y,t,k){const r=Math.hypot(x,y);if(r>k*90||r>88)return null;if(r>86)return'#3a1a00';
   if(r>76){const a=Math.atan2(y,x),seg=((a/6.283*28+28)|0)%2;return r>82?(seg?'#f08a24':'#5a2a00'):(((x+y)&1)?'#ffd9a8':'#f0b070')}if(r>74)return'#5a2a00';
   for(const[ph,cl,cd]of[[0,'#f08a24','#5a2a00'],[Math.PI,'#1e6fe5','#0b1a2b']]){const a=t*1.1+ph,bx=Math.cos(a)*65,by=Math.sin(a)*65,d=Math.hypot(x-bx,y-by);if(d<6)return d>4.6?cd:(d<2.4&&x<bx&&y<by?'#ffffff':cl)}
   if(Math.abs(r-61)<.6)return'#f0c890';return((x*7+y*13)&15)===0?'#f5d8b0':'#ffe9cc'}}};
const BOXCOL={sea:'#3a2410',void:'#efe6ff',ashaad:'#f2dcc8',gow:'#1d1d24',bf:'#3a1a00'};
function drawShape(s){const D=s.shp;if(!D)return;const sh=SHAPES[s.theme],t=s.rift.t,k=Math.min(1,s.sk);D.u.fill(0);
 for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const c=sh.pix(x-SZ/2,y-SZ/2,RM?0:t,k);if(c)D.u[y*SZ+x]=c32(c)}D.cx.putImageData(D.img,0,0)}
// ---------- LLC Powered Channels: a pixel solar system at the end of the channels string ----------
// stats scraped from each channel page (ytInitialData) — as of Oct 26, 2026; null = not public / not available
const STATS_ASOF='Oct 26, 2026';
const CH=[
 {id:'yt-langrino',name:'Langrino',url:'https://www.youtube.com/@Langrino',subs:28,views:17847,kind:'battle'},
 {id:'yt-clutch',name:'clutchclips',url:'https://www.youtube.com/@clutchclipscrate',subs:21,views:29940,kind:'mc'},
 {id:'yt-trivia',name:'bowlfuloftrivia',url:'https://www.youtube.com/@bowlfuloftrivia',subs:11,views:7358,kind:'cosmic'},
 {id:'yt-reddit',name:'RedditStoryADay',url:'https://www.youtube.com/channel/UCRegZeMyJ1B5B9n64rfgKAw',subs:null,views:8,kind:'fire'},
 {id:'yt-sat',name:'SAT in a Minute',url:'https://www.youtube.com/channel/UCfDhWTThokF3gKW03iEGijg',subs:null,views:null,kind:'chalk'}];
const fmt=n=>n==null?'-':n.toLocaleString('en-US');
const SYW=330,SYH=240,SYR=30;
const SYS={el:null,cv:null,cx:null,img:null,u:null,st:null,sf:1,tgt:1,hov:null,ang:0,last:0,pop:0};
{const mx=Math.max(...CH.map(c=>Math.max(c.views||0,(c.subs||0)*400)));
 CH.forEach((c,i)=>{const sc=Math.max(c.views||0,(c.subs||0)*400);c.r=Math.max(8,Math.round(19*Math.sqrt(sc/mx)));c.a=58+i*21;c.b=c.a*.5;c.w=.42/(1+i*.45);c.ph=i*1.9})}
function planetCol(kind,nx,ny,nz,t,x,y){const lon=Math.atan2(nx,nz)+t*.35,lat=Math.asin(Math.max(-1,Math.min(1,ny)));let c;
 switch(kind){
  case'yt':{c=Math.sin(lat*9+Math.sin(lon*2)*.6)>.55?'#b00000':'#e00000';break}
  case'battle':{const b=Math.sin(lat*5);c=b>.35?'#ff9f1a':b<-.35?'#ffffff':'#e00000';if(Math.abs(Math.sin(lon*3))<.12)c='#2a1a0a';break}
  case'mc':{const bu=Math.floor(lon*4.5),bv=Math.floor(lat*5);c=lat<-.7?'#5fbf3a':lat<-.5?((bu&1)?'#4a9a2c':'#5fbf3a'):(((bu*7+bv*3)&7)===0?'#9aa0a8':((bu*5+bv)&7)===1?'#3ad0d6':((bu+bv)&1)?'#8a5a2b':'#7a4c22');break}
  case'cosmic':{const s=Math.sin(lon*2+lat*4);c=s>.5?'#7a4dff':s>-.2?'#3b1f73':'#22104a';if(((x*31+y*17+((t*3)|0))%41)===0)c='#ffffff';break}
  case'fire':{c=((Math.floor(lon*6)+Math.floor(lat*6))&1)?'#2a2420':'#3a302a';const g=Math.cos(lon-1.2)*Math.cos(lat);if(g>.75)c=(((x+y+((t*8)|0))&3)===0)?'#ffd27a':'#ff7a1a';else if(g>.6)c='#a8431a';break}
  case'chalk':{c='#2f5a3a';const sv=Math.sin(lon*8)*Math.sin(lat*10);if(Math.abs(lat*10%2)<.18&&Math.sin(lon*3)>0)c='#e8efe8';else if(sv>.85)c='#cfe0cf';break}}
 return c}
function shadeHex(c,f){const v=hex(c);return`rgb(${Math.min(255,v[0]*f)|0},${Math.min(255,v[1]*f)|0},${Math.min(255,v[2]*f)|0})`}
function drawPlanet(u,cx,cy,R,kind,t){for(let j=-R-3;j<=R+3;j++)for(let i=-R-3;i<=R+3;i++){const X=Math.round(cx+i),Y=Math.round(cy+j);if(X<0||Y<0||X>=SYW||Y>=SYH)continue;
  const d2=i*i+j*j;if(d2>R*R){
   if(kind==='chalk'&&d2<=(R+2)*(R+2))u[Y*SYW+X]=c32(d2>(R+1)*(R+1)?'#5a5a5a':'#f4f4f4'); // stopwatch bezel
   if(kind==='chalk'&&Math.abs(i)<=1&&j<-R&&j>=-R-3)u[Y*SYW+X]=c32('#9a9a9a');
   if(kind==='battle'&&d2<=(R+3)*(R+3)){const a=Math.atan2(j,i)+t*.6,s=((a/6.283*6)%1+1)%1;if(s<.12)u[Y*SYW+X]=c32('#c9ced8')} // weapon spikes
   if(kind==='fire'&&j<-R+2&&d2<=(R+3)*(R+3)&&Math.abs(i+R*.35)<3&&((i+j+((t*10)|0))&1))u[Y*SYW+X]=c32('#ffb347');
   continue}
  const nx=i/R,ny=j/R,nz=Math.sqrt(Math.max(0,1-nx*nx-ny*ny)),l=.25+.75*Math.max(0,-.5*nx-.55*ny+.67*nz),f=[.42,.62,.82,1.02,1.18][Math.min(4,Math.floor(l*4.6))];
  const edge=d2>(R-1)*(R-1);u[Y*SYW+X]=c32(edge?'#140c10':shadeHex(planetCol(kind,nx,ny,nz,t,X,Y),f))}}
function buildSystem(){const el=document.createElement('div');el.id='system';el.style.left=TRUNK.x+'px';el.style.top=TRUNK.y+'px';
 el.innerHTML=`<canvas width="${SYW}" height="${SYH}"></canvas><div class="sysc"><b>LLC Powered</b><b>Channels</b><span>${fmt(CH.reduce((a,c)=>a+(c.views||0),0))} views</span><span>${fmt(CH.reduce((a,c)=>a+(c.subs||0),0))} subscribers</span><i>as of ${STATS_ASOF}</i></div><div class="systip"></div>`;
 world.appendChild(el);SYS.el=el;SYS.cv=el.querySelector('canvas');SYS.cx=SYS.cv.getContext('2d');SYS.img=SYS.cx.createImageData(SYW,SYH);SYS.u=new Uint32Array(SYS.img.data.buffer);SYS.tip=el.querySelector('.systip');
 const st=new Uint32Array(SYW*SYH),r=rnd(77);for(let k=0;k<140;k++){const x=(r()*SYW)|0,y=(r()*SYH)|0;st[y*SYW+x]=c32(r()<.3?'#c9ced8':'#e3e6ee')}
 for(const c of CH)for(let k=0;k<720;k+=2){const a=k/720*6.2832,x=Math.round(SYW/2+Math.cos(a)*c.a),y=Math.round(SYH/2+Math.sin(a)*c.b);if(x>=0&&y>=0&&x<SYW&&y<SYH&&((k>>2)&1))st[y*SYW+x]=c32('#c3c8d4')}
 SYS.st=st}
function sysPos(c){const a=c.ph+SYS.ang*c.w*6;return[SYW/2+Math.cos(a)*c.a,SYH/2+Math.sin(a)*c.b]}
function drawSystem(now){const S=SYS;if(!S.el)return;const t=RM?0:now/1000,u=S.u;u.set(S.st);
 const W2=SYW/2,H2=SYH/2,ring=(front)=>{for(let k=0;k<900;k++){const a=k/900*6.2832,s=Math.sin(a);if((s>0)!==front)continue;for(const[rr,cl]of[[44,'#ffb3b3'],[47,'#ff6b6b'],[50,'#a30000']]){const x=Math.round(W2+Math.cos(a)*rr),y=Math.round(H2+s*rr*.22);if(front||Math.hypot(x-W2,y-H2)>SYR)u[y*SYW+x]=c32(cl)}}};
 const ps=CH.map(c=>[c,...sysPos(c)]).sort((a,b)=>a[2]-b[2]);
 for(const[c,x,y]of ps)if(y<H2)drawPlanet(u,x,y,c.r,c.kind,t);
 ring(false);drawPlanet(u,W2,H2,SYR,'yt',t);ring(true);
 // play-button badge on the YouTube planet
 for(let j=-5;j<=5;j++)for(let i=-7;i<=7;i++){const X=W2+i,Y=H2-SYR+8+j;if(Math.abs(i)===7||Math.abs(j)===5)continue;u[Y*SYW+X]=c32((i>=-2&&i<=3&&Math.abs(j)<=3-Math.max(0,i)*.8)?'#ffffff':'#ff2a2a')}
 for(const[c,x,y]of ps)if(y>=H2)drawPlanet(u,x,y,c.r,c.kind,t);
 S.cx.putImageData(S.img,0,0)}
function sysHit(cx,cy){if(!SYS.el||SYS.pop<1)return null;const wx=px+(cx-innerWidth/2)/z,wy=py+(cy-innerHeight/2)/z,ax=(wx-TRUNK.x)/P+SYW/2,ay=(wy-TRUNK.y)/P+SYH/2;
 for(const c of CH){const[x,y]=sysPos(c);if(Math.hypot(ax-x,ay-y)<=c.r+2)return c}return null}
function sysHover(cx,cy){if(!SYS.el)return;const wx=px+(cx-innerWidth/2)/z,wy=py+(cy-innerHeight/2)/z,d=Math.hypot(wx-TRUNK.x,wy-TRUNK.y);
 const c=sysHit(cx,cy);SYS.hov=c;SYS.tgt=c?0:Math.max(.08,Math.min(1,(d-SYW*P*.35)/700));
 const tp=SYS.tip;if(c){const[x,y]=sysPos(c);tp.innerHTML=`<b>${c.name}</b><span>${fmt(c.subs)} subscribers</span><span>${fmt(c.views)} views</span>`;tp.style.left=(x-SYW/2)*P+'px';tp.style.top=((y-SYH/2)-c.r-4)*P+'px';tp.classList.add('on')}else tp.classList.remove('on');
 vp.classList.toggle('onplanet',!!c)}
// ---------- build world ----------
const strandLayer=document.createElement('div');strandLayer.id='strands';world.prepend(strandLayer);
buildFrame(strandLayer);
strandPts(TRUNK);strandLayer.append(...buildString(TRUNK,99));buildSystem();const STRS=[...SITES,TRUNK];
SITES.forEach((s,i)=>{strandPts(s,i);strandLayer.append(...buildString(s,i));
 const rf=document.createElement('div');rf.className='rift r-'+s.theme;rf.id='rift-'+s.id;rf.style.left=s.x+'px';rf.style.top=s.y+'px';
 s.rift=makeRift(s,i);
 rf.innerHTML=`<button class="seed" aria-label="Open rift: ${s.title}"></button><div class="shape"><canvas width="${SZ}" height="${SZ}"></canvas></div><div class="panel" style="${(b=>`left:${b[0]*P}px;top:${b[1]*P}px;width:${(b[2]-b[0])*P}px;height:${(b[3]-b[1])*P}px;color:${BOXCOL[s.theme]}`)(SHAPES[s.theme].box)}"><h2>${s.title}</h2><p class="by">${s.by}</p><p>${s.blurb}</p><a class="go" href="${s.href}" ${s.href.startsWith('http')?'target="_blank" rel="noopener"':''}>${s.cta}</a></div>`;
 rf.prepend(s.rift.cv);
 rf.querySelector('.seed').addEventListener('click',e=>{e.stopPropagation();if(dragMoved>6)return;if(mapMode)setMap(false,s);else follow(s)});
 {const c=rf.querySelector('.shape canvas'),cx=c.getContext('2d'),img=cx.createImageData(SZ,SZ);s.shp={cx,img,u:new Uint32Array(img.data.buffer)};s.sk=0}world.appendChild(rf);s.el=rf});
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
  if(s===TRUNK){if(k>=1&&!retractAt)SYS.pop=1;if(retractAt&&k<1)SYS.pop=0;SYS.el.classList.toggle('shown',SYS.pop>=1);continue}
  if(k>=1&&!retractAt&&s.rift.pop<1){s.rift.pop=RM?1:Math.min(1,s.rift.pop+.12);s.el.classList.add('shown')}
  if(retractAt&&k<1){s.rift.pop=0;s.rift.ic=0;s.el.classList.remove('shown','open')}}}
// hide (retract back into the logo) / show (draw outward again)
function retractStrings(){retractAt=performance.now()}function growStrings(){if(retractAt){retractAt=0;growStart=performance.now()}}
// ---------- camera ----------
let px=0,py=0,z=1,anim=0,mapMode=false;const ZMIN=.05,ZMAX=3;
function draw(){const tx=Math.round(-px*z),ty=Math.round(-py*z);world.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;
 let g=7*z;while(g<6)g*=2;while(g>14)g/=2;vp.style.backgroundSize=g+'px '+g+'px';vp.style.backgroundPosition=`calc(50% + ${tx}px) calc(50% + ${ty}px)`;
 world.style.setProperty('--ms',mapMode?Math.min(8,.32/z):1);
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
function fitAll(){let a=0,b=0,c=0,d=0;for(const s of [...SITES,{x:TRUNK.x-500,y:TRUNK.y-380},{x:TRUNK.x+500,y:TRUNK.y+380}]){a=Math.min(a,s.x);b=Math.max(b,s.x);c=Math.min(c,s.y);d=Math.max(d,s.y)}
 const mx=90,my=110;return[(a+b)/2,(c+d)/2,Math.max(ZMIN,Math.min((innerWidth-2*mx)/(b-a),(innerHeight-2*my)/(d-c)))]}
let preMap=null;
function setMap(on,target){mapMode=on;document.body.classList.toggle('mapmode',on);mapBtn.setAttribute('aria-pressed',on);
 if(on){preMap=[px,py,z];const f=fitAll();to(f[0],f[1],f[2],1400)}else if(target)to(target.x,target.y,1,1400);else{const p=preMap||[0,0,1];to(p[0],p[1],Math.max(.6,p[2]),1400)}}
mapBtn.onclick=()=>setMap(!mapMode);
// ---------- per-frame: string growth + rift crack animation (8 fps pixel steps) ----------
let lastR=0;
function loop(now){requestAnimationFrame(loop);growStep(now);
 {const S=SYS;S.sf+=(S.tgt-S.sf)*.08;if(S.hov)S.sf=0;if(!RM)S.ang+=(now-(S.pt||now))/1000*S.sf*.12;S.pt=now;
  if(S.pop&&now-S.last>50&&(Math.hypot(TRUNK.x-px,TRUNK.y-py)*z<innerWidth*1.5||mapMode)){S.last=now;drawSystem(now)}}
 if(!RM)for(const s of STRS){const pu=s.pulse;if(s.str.frac<1){pu.style.display='none';continue}
  const T=4.5,ph=((now/1000+s.pph*T)%T)/T,on=ph<.6;pu.style.display=on?'block':'none';if(!on)continue;
  const p=pointAt(s,ph/.6*s.len);pu.style.transform=`translate(${Math.round(p.x/P)*P}px,${Math.round(p.y/P)*P}px)`;pu.style.opacity=Math.sin(ph/.6*Math.PI).toFixed(2)}
 if(now-lastR<125)return;lastR=now;
 for(const s of SITES){const R=s.rift;if(R.pop<=0)continue;R.t=now/1000;const was=R.open;
  if(R.target>R.open)R.open=RM?1:Math.min(1,R.open+.2);else if(R.target<R.open)R.open=RM?0:Math.max(0,R.open-.25);
  R.fall=R.open>0&&R.target?(R.fall||0)+.25:0;
  const open=R.open>=1;if(open!==s.el.classList.contains('open'))s.el.classList.toggle('open',open);
  // only redraw rifts near the view (cheap) or in map mode
  if(open){s.sk=RM?1:Math.min(1,s.sk+.09);drawShape(s);s.el.classList.toggle('ready',s.sk>=1)}else if(s.sk){s.sk=0;s.el.classList.remove('ready')}
  const d=Math.hypot(s.x-px,s.y-py)*z;if(d<innerWidth*1.2||mapMode)drawRift(s)}}
requestAnimationFrame(loop);
// ---------- input ----------
const ptrs=new Map();let dragMoved=0,pinch=null;
function nearestString(cx,cy){const wx=px+(cx-innerWidth/2)/z,wy=py+(cy-innerHeight/2)/z,tol=16/z;let best=null,bd=tol;
 for(const s of STRS){if(s.str.shown<s.str.order.length*.9)continue;for(let k=0;k<s.pts.length;k+=2){const d=Math.hypot(s.pts[k][0]-wx,s.pts[k][1]-wy);if(d<bd){bd=d;best=s}}}return best}
vp.addEventListener('pointerdown',e=>{if(e.target.closest('button,a,.panel'))return;stop();ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});dragMoved=0;vp.setPointerCapture(e.pointerId);vp.classList.add('drag');
 if(ptrs.size===2){const[a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z}}});
addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);
 if(!p){if(e.pointerType==='mouse'&&!mapMode)sysHover(e.clientX,e.clientY);if(e.pointerType==='mouse'&&!mapMode)vp.classList.toggle('onstring',!!nearestString(e.clientX,e.clientY));return}
 const dx=e.clientX-p.x,dy=e.clientY-p.y;p.x=e.clientX;p.y=e.clientY;dragMoved+=Math.abs(dx)+Math.abs(dy);
 if(ptrs.size===2&&pinch){const[a,b]=[...ptrs.values()];zoomAt((a.x+b.x)/2,(a.y+b.y)/2,pinch.z*Math.hypot(a.x-b.x,a.y-b.y)/pinch.d/z);px-=dx/2/z;py-=dy/2/z}else{px-=dx/z;py-=dy/z}draw()});
const end=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(!ptrs.size)vp.classList.remove('drag')};addEventListener('pointerup',end);addEventListener('pointercancel',end);
vp.addEventListener('click',e=>{if(dragMoved>6){e.stopPropagation();return}{const pl=!mapMode&&sysHit(e.clientX,e.clientY);if(pl){e.stopPropagation();open(pl.url,'_blank','noopener');return}}if(mapMode||e.target.closest('button,a,.panel'))return;const s=nearestString(e.clientX,e.clientY);if(s){e.stopPropagation();follow(s)}},true);
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
window.__pan={planets:()=>CH.map(c=>{const[x,y]=sysPos(c);const wx=TRUNK.x+(x-SYW/2)*P,wy=TRUNK.y+(y-SYH/2)*P;return[c.id,(wx-px)*z+innerWidth/2,(wy-py)*z+innerHeight/2]}),get x(){return px},get y(){return py},get z(){return z},set(x,y,zz=z){stop();px=x;py=y;z=zz;draw()},to,follow:id=>follow(STRS.find(s=>s.id===id)),map:setMap,retract:retractStrings,grow:growStrings,
 point:(id,f)=>{const s=SITES.find(s=>s.id===id),p=pointAt(s,s.len*f);return[innerWidth/2+(p.x-px)*z,innerHeight/2+(p.y-py)*z]}};
addEventListener('resize',draw);draw();
})();


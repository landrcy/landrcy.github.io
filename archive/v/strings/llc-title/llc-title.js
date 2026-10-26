/* LLC pixel title player. 320x180 native art, scaled up with nearest-neighbour.
   assembly.bin = 285 delta frames (0-9.5 s) on top of frame0.png; rest.bin = 180 delta frames (6 s seamless loop)
   that start from final.png. Delta-time based: frame index = elapsed * 30 fps, skipped frames are applied in order. */
(function(){
const cv=document.getElementById('llc5c');if(!cv)return;
const logo=cv.closest('.logo'),hero=cv.closest('.hero'),skipBtn=document.getElementById('llc5skip');
const W=320,H=180,FPS=30,ASM=285,REST=180,BASE='llc-title/';
const ctx=cv.getContext('2d',{alpha:!!cv.dataset.white||cv.dataset.white===''});
const img=ctx.createImageData(W,H),buf=img.data;for(let i=3;i<buf.length;i+=4)buf[i]=255;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
// white-page recolour: the art is light-on-#080a12; treat it as light over black and composite onto white
const WHITE=cv.dataset.white!=null;const out=ctx.createImageData(W,H),ob=out.data;
// ---- white page: stable silhouette mask from the assembled final frame ----
// bg = flood fill from the border through dark pixels; unreached = letter (holes filled for free); tiny islands (stars) dropped; dilated 1px.
let MASK=null,F0=null;
const keyed=(r,g,b)=>{const m=Math.max(r,g,b),n=Math.min(r,g,b);return m>=46&&!(m-n<28&&m>150)};
function buildMask(fimg){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(fimg,0,0);
 const d=x.getImageData(0,0,W,H).data,N=W*H,bg=new Uint8Array(N),Qm=new Int32Array(N);let h=0,t=0;
 const dark=p=>{const o=p*4,r=d[o],g=d[o+1],b=d[o+2],m=Math.max(r,g,b),n=Math.min(r,g,b);return m<46||(m-n<28&&m>150)}; // bg tolerance (incl. white stars)
 for(let p=0;p<N;p++){const X=p%W,Y=(p/W)|0;if((X===0||Y===0||X===W-1||Y===H-1)&&dark(p)){bg[p]=1;Qm[t++]=p}}
 while(h<t){const p=Qm[h++],X=p%W;for(const q of [X>0?p-1:-1,X<W-1?p+1:-1,p-W,p+W])if(q>=0&&q<N&&!bg[q]&&dark(q)){bg[q]=1;Qm[t++]=q}}
 // enclosed dark regions: big ones are real counters (bg), small ones are holes in the texture (letter)
 {const seen=new Uint8Array(N);for(let s0=0;s0<N;s0++){if(bg[s0]||seen[s0]||!dark(s0))continue;h=0;t=0;Qm[t++]=s0;seen[s0]=1;
  while(h<t){const p=Qm[h++],X=p%W;for(const q of [X>0?p-1:-1,X<W-1?p+1:-1,p-W,p+W])if(q>=0&&q<N&&!bg[q]&&!seen[q]&&dark(q)){seen[q]=1;Qm[t++]=q}}
  if(t>=40)for(let k=0;k<t;k++)bg[Qm[k]]=1}}
 // drop small letter islands (stars / sparkles not touching letters)
 const lab=new Int32Array(N);let id=0;
 for(let s0=0;s0<N;s0++){if(bg[s0]||lab[s0])continue;id++;h=0;t=0;Qm[t++]=s0;lab[s0]=id;
  while(h<t){const p=Qm[h++],X=p%W;for(const q of [X>0?p-1:-1,X<W-1?p+1:-1,p-W,p+W,X>0?p-W-1:-1,X<W-1?p-W+1:-1,X>0?p+W-1:-1,X<W-1?p+W+1:-1])if(q>=0&&q<N&&!bg[q]&&!lab[q]){lab[q]=id;Qm[t++]=q}}
  if(t<20)for(let k=0;k<t;k++)bg[Qm[k]]=1}
 const M=new Uint8Array(N);for(let p=0;p<N;p++)if(!bg[p]){const X=p%W;M[p]=1;if(X>0)M[p-1]=1;if(X<W-1)M[p+1]=1;if(p>=W)M[p-W]=1;if(p+W<N)M[p+W]=1}
 return M}
if(WHITE)Promise.resolve().then(()=>{loadImg(BASE+'final.png').then(f=>{MASK=buildMask(f);put()}).catch(()=>{});
 loadImg(BASE+'frame0.png').then(f=>{const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');x.drawImage(f,0,0);F0=x.getImageData(0,0,W,H).data}).catch(()=>{})})
const A=new Uint8Array(W*H);
const put=()=>{if(!WHITE){ctx.putImageData(img,0,0);return}
 const assembling=phase!=='rest'&&phase!=='static';
 for(let p=0,i=0;p<A.length;p++,i+=4){const r=buf[i],g=buf[i+1],b=buf[i+2];let on;
  if(MASK&&MASK[p]){ // inside the letter silhouette
   on=assembling?(keyed(r,g,b)||(F0&&(Math.abs(r-F0[i])+Math.abs(g-F0[i+1])+Math.abs(b-F0[i+2])>18))):1}
  else on=(keyed(r,g,b)&&Math.max(r,g,b)>=90)?2:0; // outside: flying pixels / drips, speck-filtered below
  A[p]=on}
 // speck filter for outside pixels only (stars)
 for(let y=0,p=0;y<H;y++)for(let x=0;x<W;x++,p++){if(A[p]!==2)continue;let c=0;
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const xx=x+dx,yy=y+dy;if(xx>=0&&yy>=0&&xx<W&&yy<H&&A[yy*W+xx])c++}
  if(c<2)A[p]=0}
 for(let p=0,i=0;p<A.length;p++,i+=4){if(A[p]){ob[i]=buf[i];ob[i+1]=buf[i+1];ob[i+2]=buf[i+2];ob[i+3]=255}else{ob[i]=ob[i+1]=ob[i+2]=255;ob[i+3]=0}}
 ctx.putImageData(out,0,0)};
const loadImg=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
function setFrom(i){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(i,0,0);buf.set(x.getImageData(0,0,W,H).data)}
// ---- responsive crisp scaling: whole multiples when >=2x, fractional below ----
function size(){if(cv.dataset.scale){const s=+cv.dataset.scale;cv.style.width=W*s+'px';logo.style.setProperty('--s',s);return}const aw=WHITE?innerWidth*.9:(hero.clientWidth||innerWidth),ah=Math.max(240,innerHeight-90);
 const raw=Math.min(aw/W,ah/H,5);const s=raw>=2?Math.floor(raw):Math.max(1,Math.floor(raw*16)/16);
 cv.style.width=W*s+'px';logo.style.setProperty('--s',s)}
size();addEventListener('resize',size);
// ---- delta packs ----
async function getPack(name){
 const r=await fetch(BASE+name);if(!r.ok)throw new Error(name);let raw=new Uint8Array(await r.arrayBuffer());
 if(raw[0]===0x1f&&raw[1]===0x8b){if(typeof DecompressionStream==='undefined')throw new Error('no DecompressionStream');
  raw=new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new DecompressionStream('gzip'))).arrayBuffer())}
 if(String.fromCharCode(raw[0],raw[1],raw[2],raw[3])!=='LLC5')throw new Error('bad pack');
 const n=raw[4]|raw[5]<<8,fr=[];let p=6;
 for(let f=0;f<n;f++){let c=0,s=0,b;do{b=raw[p++];c|=(b&127)<<s;s+=7}while(b&128);
  const g=p;for(let i=0;i<c;i++){while(raw[p++]&128);}fr.push({c,g,r:p});p+=3*c}
 return{raw,fr}}
function apply(pk,f){const raw=pk.raw,d=pk.fr[f];let p=d.g,pos=-1,rp=d.r,gp=rp+d.c,bp=gp+d.c;
 for(let i=0;i<d.c;i++){let v=0,s=0,b;do{b=raw[p++];v|=(b&127)<<s;s+=7}while(b&128);pos+=v;const o=pos*4;buf[o]=raw[rp+i];buf[o+1]=raw[gp+i];buf[o+2]=raw[bp+i]}}
let asmP=null,restP=null,asmReq=null,restReq=null;
const needAsm=()=>asmReq||(asmReq=getPack('assembly.bin').then(p=>asmP=p));
const needRest=()=>restReq||(restReq=getPack('rest.bin').then(p=>restP=p));
// ---- state machine: idle -> asm -> rest (loop) | static ----
let phase='idle',t0=0,cur=0,rcur=0,rT0=0,rTot=0,raf=0,visible=true,started=false,finalImg=null;
const API=window.__llc5={get phase(){return phase},get frame(){return phase==='asm'?cur:phase==='rest'?ASM+rcur:phase==='static'?ASM:0},get ready(){return !!asmP}};
function setHint(on){if(skipBtn)skipBtn.classList.toggle('off',!on);logo.classList.toggle('playing',on)}
function enterRest(now){phase='rest';rcur=0;rTot=0;rT0=now;setHint(false);needRest().catch(()=>{});schedule()}
function schedule(){if(!raf)raf=requestAnimationFrame(tick)}
function tick(now){raf=0;
 if(phase==='asm'){const target=Math.min(ASM,Math.floor((now-t0)*FPS/1000));
  if(target>cur){while(cur<target){apply(asmP,cur);cur++}put()}
  if(cur>=ASM){enterRest(now);return}schedule()}
 else if(phase==='rest'){if(!visible)return;
  if(restP){const tot=Math.floor((now-rT0)*FPS/1000);let steps=tot-rTot;rTot=tot;
   if(steps>0){steps%=REST;for(let i=0;i<steps;i++){apply(restP,rcur);rcur=(rcur+1)%REST}if(steps)put()}}
  schedule()}}
function startAssembly(){if(started)return;started=true;const dl=+(cv.dataset.delay||0);if(dl&&!RM){needRest().catch(()=>{});setTimeout(go,dl);return}go()}
function go(){
 needRest().catch(()=>{});
 needAsm().then(()=>{if(phase!=='idle')return;phase='asm';cur=0;t0=performance.now();setHint(true);schedule()}).catch(showFinalOnly)}
function showFinalOnly(){ // fallback: no packs available/supported -> final art, still
 loadImg(BASE+'final.png').then(i=>{setFrom(i);put();phase='static';setHint(false)})}
function skip(){if(phase==='asm'||phase==='idle'){started=true;const wasAsm=phase==='asm';phase='skipping';
  (finalImg?Promise.resolve(finalImg):loadImg(BASE+'final.png')).then(i=>{finalImg=i;setFrom(i);put();enterRest(performance.now())})}}
// ---- boot ----
loadImg(BASE+'frame0.png').then(i=>{
 if(RM){return loadImg(BASE+'final.png').then(f=>{finalImg=f;setFrom(f);put();phase='static';setHint(false)})}
 setFrom(i);put();
 if(typeof IntersectionObserver==='undefined')return startAssembly();
 new IntersectionObserver(es=>{for(const e of es){visible=e.isIntersecting;
   if(visible){if(!started)startAssembly();else if(phase==='rest'){rT0=performance.now()-rTot*1000/FPS;schedule()}}}},{threshold:.2}).observe(cv)
}).catch(()=>{});
if(!RM){hero.addEventListener('click',e=>{if(e.target.closest('a'))return;skip()});
 addEventListener('keydown',e=>{if(e.ctrlKey||e.metaKey||e.altKey||e.key==='Tab'||e.key==='Shift'||e.key==='Control'||e.key==='Alt'||e.key==='Meta')return;skip()})}
else setHint(false);
})();

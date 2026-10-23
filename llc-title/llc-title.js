/* LLC pixel title player. 320x180 native art, scaled up with nearest-neighbour.
   assembly.bin = 285 delta frames (0-9.5 s) on top of frame0.png; rest.bin = 180 delta frames (6 s seamless loop)
   that start from final.png. Delta-time based: frame index = elapsed * 30 fps, skipped frames are applied in order. */
(function(){
const cv=document.getElementById('llc5c');if(!cv)return;
const logo=cv.closest('.logo'),hero=cv.closest('.hero'),skipBtn=document.getElementById('llc5skip');
const W=320,H=180,FPS=30,ASM=285,REST=180,BASE='llc-title/';
const ctx=cv.getContext('2d',{alpha:false});
const img=ctx.createImageData(W,H),buf=img.data;for(let i=3;i<buf.length;i+=4)buf[i]=255;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const put=()=>ctx.putImageData(img,0,0);
const loadImg=src=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=src});
function setFrom(i){const c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext("2d",{willReadFrequently:true});x.drawImage(i,0,0);buf.set(x.getImageData(0,0,W,H).data)}
// ---- responsive crisp scaling: whole multiples when >=2x, fractional below ----
function size(){const aw=hero.clientWidth||innerWidth,ah=Math.max(240,innerHeight-90);
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
function startAssembly(){if(started)return;started=true;
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

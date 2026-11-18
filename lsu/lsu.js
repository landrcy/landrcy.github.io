'use strict';
// Lsu: minimalist rhythm game. Every gameplay value derives from ONE song clock (songT), every visual from real elapsed time.
const $=id=>document.getElementById(id),cv=$('c'),g=cv.getContext('2d');
const RMQ=matchMedia('(prefers-reduced-motion: reduce)');let RM=RMQ.matches;(RMQ.addEventListener?RMQ.addEventListener('change',e=>RM=e.matches):RMQ.addListener(e=>RM=e.matches));
let W,H,DPR,PF={x:0,y:0,s:1};
function fit(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(DPR,0,0,DPR,0,0);
 const s=(W<H?Math.min(W/560,H/440):Math.min(W/640,H/480))*.92;PF={s,x:(W-512*s)/2,y:(H-384*s)/2+H*.02}}
fit();addEventListener('resize',fit);
const px=x=>PF.x+x*PF.s,py=y=>PF.y+y*PF.s,clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// ---------------- audio ----------------
let ac,master,music,sfx,an,fbin,spec=new Float32Array(48),bass=0,noiseB;
function initAudio(){if(ac)return;ac=new (window.AudioContext||window.webkitAudioContext)();const comp=ac.createDynamicsCompressor();comp.threshold.value=-10;comp.ratio.value=3;
 master=ac.createGain();master.gain.value=.9;master.connect(comp);comp.connect(ac.destination);
 an=ac.createAnalyser();an.fftSize=512;an.smoothingTimeConstant=0;fbin=new Uint8Array(an.frequencyBinCount);
 music=ac.createGain();music.connect(an);an.connect(master);sfx=ac.createGain();sfx.gain.value=.7;sfx.connect(master);
 const b=ac.createBuffer(1,ac.sampleRate*.3,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;noiseB=b}
function env(gn,t,a,v,dec){gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(v,t+a);gn.gain.exponentialRampToValueAtTime(.0001,t+a+dec)}
function nz(t,dur,v,type,f){const s=ac.createBufferSource();s.buffer=noiseB;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;const q=ac.createGain();env(q,t,.001,v,dur);s.connect(fl);fl.connect(q);q.connect(sfx);s.start(t);s.stop(t+dur+.05)}
function hitTick(soft){if(!ac)return;const t=ac.currentTime;nz(t,soft?.02:.035,soft?.12:.28,'highpass',soft?6000:3000)}
function missSnd(){if(!ac)return;const t=ac.currentTime,o=ac.createOscillator(),q=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(70,t+.2);env(q,t,.002,.18,.2);o.connect(q);q.connect(sfx);o.start(t);o.stop(t+.3)}
// decoded song buffers (only two kept in memory for phones)
const BUF=new Map(),LOAD=new Map();
function loadSong(s){if(BUF.has(s.id))return Promise.resolve(BUF.get(s.id));if(LOAD.has(s.id))return LOAD.get(s.id);
 const p=fetch('songs/'+s.id+'.mp3').then(r=>{if(!r.ok)throw Error('load '+r.status);return r.arrayBuffer()}).then(a=>new Promise((res,rej)=>ac.decodeAudioData(a,res,rej))).then(b=>{BUF.set(s.id,b);LOAD.delete(s.id);while(BUF.size>2){const k=BUF.keys().next().value;if(k==s.id)break;BUF.delete(k)}return b});
 p.catch(()=>LOAD.delete(s.id));LOAD.set(s.id,p);return p}
let cur=null; // {src,gain,ctxStart,off,song}
function playBuf(buf,song,when,off,loop){stopMusic();const src=ac.createBufferSource(),gn=ac.createGain();src.buffer=buf;src.connect(gn);gn.connect(music);
 if(loop){src.loop=true;src.loopStart=off;src.loopEnd=Math.min(buf.duration,off+30);gn.gain.setValueAtTime(0,when);gn.gain.linearRampToValueAtTime(1,when+.6)}
 src.start(when,off);cur={src,gn,ctxStart:when,off,song,loop}}
function stopMusic(){if(!cur)return;const c=cur;cur=null;const t=ac.currentTime;try{c.gn.gain.cancelScheduledValues(t);c.gn.gain.setValueAtTime(c.gn.gain.value,t);c.gn.gain.linearRampToValueAtTime(0,t+.15);c.src.stop(t+.2)}catch(e){}}
// THE clock: context time of what is audible right now (output latency compensated), smoothed between audio callbacks
let clkLast=0;
function audible(){if(!ac)return 0;let t;
 if(ac.state=='running'&&ac.getOutputTimestamp){const ts=ac.getOutputTimestamp();if(ts.contextTime>0&&ts.performanceTime>0)t=ts.contextTime+clamp((performance.now()-ts.performanceTime)/1000,0,.1)}
 if(t===undefined)t=ac.currentTime-Math.min(.3,ac.outputLatency||ac.baseLatency||0);
 if(ac.state!='running')t=Math.min(t,ac.currentTime);
 return t}
function songT(){if(!G)return 0;const t=audible()-G.t0+G.off;if(t<G.lastT)return G.lastT;G.lastT=t;return t} // monotonic per game
function musicPos(){if(!cur)return null;const t=audible()-cur.ctxStart;if(t<0)return null;let p=cur.off+t;if(cur.loop){const L=cur.src.loopEnd-cur.src.loopStart;p=cur.off+(t%L)}return p}
// ---------------- songs + maps ----------------
let SONGS=[];
const DIFFS=[{n:'easy',ar:5,cs:3,od:4,hp:3},{n:'normal',ar:7,cs:4,od:6,hp:5},{n:'hard',ar:8.8,cs:4.3,od:8,hp:6}];
function stars(s,d){const m=s.maps[d];if(!m.length)return 0;const span=m[m.length-1].t-m[0].t||1,nps=m.length/span,ar=DIFFS[d].ar;return Math.round((nps*.75+ar*.25+d*.35)*10)/10}
const bez=(o,u)=>{const s=o.sl,a=(1-u)*(1-u),b=2*(1-u)*u,c=u*u;return[a*o.x+b*s.mx+c*s.ex,a*o.y+b*s.my+c*s.ey]};
const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
// ---------------- game state ----------------
const COLS=['#ff3d7f','#3dd6ff','#b37dff','#ffcf4a'];
let mode='menu',song=0,diff=1,G=null,mx=innerWidth/2,my=innerHeight/2,trail=[],keysDown=new Set(),ptrs=new Set(),fx=[],parts=[],lights=[],errs=[],loading=false;
const holding=()=>keysDown.size>0||ptrs.size>0;
async function newGame(){if(loading||!SONGS.length)return;initAudio();ac.resume();const s=SONGS[song],d=DIFFS[diff];loading=true;buildSel();
 let buf;try{buf=await loadSong(s)}catch(e){loading=false;buildSel(e);return}loading=false;stopMusic();
 const pre=(d.ar<5?1200+600*(5-d.ar)/5:1200-750*(d.ar-5)/5)/1000,r=54.4-4.48*d.cs;
 const objs=s.maps[diff].map(o=>{const q={...o,j:null,head:null,fol:false,ti:0,tickHit:0,endHit:null};if(o.sl){const spb=60/s.bpm,ticks=[];for(let k=1;k<o.sl.beats;k++)ticks.push(o.t+k*spb);q.ticks=ticks}return q});
 const first=objs[0].t,last=objs[objs.length-1],lastEnd=last.t+(last.sl?last.sl.dur:0);
 // skip long intros: audio starts 2.2s before the first circle appears
 const off=Math.max(0,first-pre-2.2),lead=Math.max(.35,1.8-(first-pre-off)); // first circle always appears >=1.8s after play
 G={s,d,objs,pre,r,w300:(80-6*d.od)/1000,w100:(140-8*d.od)/1000,w50:(200-10*d.od)/1000,score:0,dscore:0,combo:0,max:0,n300:0,n100:0,n50:0,nm:0,hp:1,
  t0:ac.currentTime+lead,off,lastT:-1e9,paused:0,next:0,first,start:first-pre,lastEnd,end:lastEnd+1.4,failed:0,errs:[],kiaiOn:false,beatIdx:-1};
 G.lastT=-1e9;playBuf(buf,s,G.t0,off,false);fx=[];parts=[];lights=[];errs=[];trail=[];show('hud')}
function show(id){for(const k of['menu','sel','hud','pause','res','cred'])$(k).classList.toggle('off',k!=id&&!(id=='pause'&&k=='hud'));mode=id=='hud'?'play':id;document.body.classList.toggle('playing',mode=='play'||mode=='pause')}
function acc(){const n=G.n300+G.n100+G.n50+G.nm;return n?(G.n300*300+G.n100*100+G.n50*50)/(n*300):1}
function addCombo(){G.combo++;G.max=Math.max(G.max,G.combo);if(G.combo%50==0)popCombo()}
function breakCombo(){if(G.combo>=10)missSnd();G.combo=0}
function popCombo(){fx.push({x:W/2,y:H*.32,v:-2,txt:G.combo+' combo',t:performance.now(),c:'#ff3d7f'});flash(W/2,H/2,'#ff3d7f',1.2)}
function judge(o,v,x,y,combo=true){o.j=v;if(v){if(combo)addCombo();G.score+=Math.round(v*(1+Math.max(0,G.combo-1)/25*(1+diff*.4)));G.hp=Math.min(1,G.hp+(v==300?.06:v==100?.03:.01));G['n'+v]++;hitTick()}
 else{breakCombo();G.nm++;G.hp-=.09}
 const c=COLS[o.c%COLS.length];fx.push({x,y,v,t:performance.now(),c});if(v){burst(x,y,c,v==300?14:8);flash(x,y,c,v==300?1:.6);if(!RM)$('combo').animate([{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:140})}}
function press(){if(mode!='play'||!G||G.paused)return;const t=songT();
 for(let i=G.next;i<G.objs.length;i++){const o=G.objs[i];if(o.j!==null||o.head!==null)continue; // already done / head already taken
  if(o.t-t>G.pre)break;const d=Math.hypot(mx-px(o.x),my-py(o.y));if(d>G.r*PF.s*1.05)return; // notelock: only the first pending object
  const e=t-o.t;if(e<-G.w50){o.shake=performance.now();return}
  const ae=Math.abs(e),v=ae<=G.w300?300:ae<=G.w100?100:ae<=G.w50?50:0;if(v){G.errs.push(e);errs.push({e,t:performance.now()})}
  if(o.sl){o.head=v;if(v){addCombo();G.score+=30;hitTick();burst(px(o.x),py(o.y),COLS[o.c%4],6)}else breakCombo();fx.push({x:px(o.x),y:py(o.y),v:-1,t:performance.now(),c:COLS[o.c%4]})}
  else judge(o,v,px(o.x),py(o.y));return}}
function sliderStep(o,t){const s=o.sl,end=o.t+s.dur;
 if(o.head===null&&t>o.t+G.w50){o.head=0;breakCombo();fx.push({x:px(o.x),y:py(o.y),v:-3,t:performance.now(),c:'#ff3d3d'})}
 if(t<o.t)return;const u=clamp((t-o.t)/s.dur,0,1),[bx,by]=bez(o,u),dist=Math.hypot(mx-px(bx),my-py(by));
 o.fol=holding()&&dist<G.r*PF.s*(o.fol?2.4:1.5); // bigger follow circle once you are on it (osu-style)
 while(o.ti<o.ticks.length&&t>=o.ticks[o.ti]){if(o.fol){o.tickHit++;addCombo();G.score+=10;hitTick(1)}else breakCombo();o.ti++}
 if(o.endHit===null&&t>=end-.036)o.endHit=o.fol?1:0; // end checked 36ms early like osu
 if(t>=end){const tot=2+o.ticks.length,got=(o.head>0?1:0)+o.tickHit+o.endHit,f=got/tot,v=f==1?300:f>=.5?100:f>0?50:0;const[ex,ey]=bez(o,1);o.fol=false;judge(o,v,px(ex),py(ey),!!o.endHit)}}
let lastFrame=performance.now();
function update(t){if(mode!='play'||!G||G.paused)return;
 for(let i=G.next;i<G.objs.length;i++){const o=G.objs[i];if(o.t-t>G.pre)break;if(o.j!==null)continue;
  if(!o.sl){if(t>o.t+G.w50)judge(o,0,px(o.x),py(o.y))}else sliderStep(o,t)}
 while(G.next<G.objs.length&&G.objs[G.next].j!==null)G.next++;
 // hp drain per second of song time, paused during breaks (gaps > 3s)
 const dt=clamp(t-(G.prevT??t),0,.25);G.prevT=t;
 if(t>G.first&&t<G.lastEnd&&!G.failed){const nx=G.objs[G.next];const inBreak=nx&&nx.t-t>3&&!(G.objs[G.next-1]&&G.objs[G.next-1].sl&&t<G.objs[G.next-1].t+G.objs[G.next-1].sl.dur);if(!inBreak)G.hp-=dt*.05*(1+diff*.35)}
 if(G.hp<=0&&!G.failed){G.failed=1;fail()}
 if(t>G.end&&!G.failed)results()}
function fail(){stopMusic();const s=performance.now();(function f(){if(performance.now()-s<900){requestAnimationFrame(f)}else results(1)})()}
function results(failed){if(mode=='res')return;stopMusic();const a=acc(),n=G.n300+G.n100+G.n50+G.nm,r3=n?G.n300/n:1;
 const gr=failed?'F':a==1?'SS':r3>.9&&G.n50/n<.01&&!G.nm?'S':r3>.8&&!G.nm||r3>.9?'A':r3>.7&&!G.nm||r3>.8?'B':r3>.6?'C':'D';
 $('grade').textContent=gr;$('grade').style.color={SS:'#ffe27a',S:'#ffcf4a',A:'#7dff9a',B:'#3dd6ff',C:'#b37dff',D:'#ff3d7f',F:'#ff3d3d'}[gr];
 $('rscore').textContent=String(G.score).padStart(8,'0');$('rsong').textContent=G.s.title+' · '+G.s.artist+' · '+G.d.n;
 const E=G.errs,mean=E.length?E.reduce((a,b)=>a+b,0)/E.length:0,ur=E.length>1?Math.sqrt(E.reduce((a,b)=>a+(b-mean)**2,0)/E.length)*10000:0;
 $('rstat').innerHTML=[['300',G.n300],['100',G.n100],['50',G.n50],['miss',G.nm],['accuracy',(a*100).toFixed(2)+'%'],['max combo',G.max+'x'],['unstable rate',E.length>1?ur.toFixed(0):'–'],['avg offset',E.length?(mean>=0?'+':'')+(mean*1000).toFixed(0)+'ms':'–']].map(([k,v])=>`<div><i>${k}</i>${v}</div>`).join('');
 drawErr(E);$('elab').textContent=E.length?'hit timing · early ← → late':'';
 show('res');if(!RM)$('grade').animate([{transform:'scale(2.2)',opacity:0,filter:'blur(10px)'},{transform:'scale(1)',opacity:1,filter:'blur(0)'}],{duration:650,easing:'cubic-bezier(.2,1.4,.4,1)'});
 flash(W/2,H*.3,$('grade').style.color,2)}
function drawErr(E){const c=$('errc'),w=c.clientWidth||440,h=c.clientHeight||70,x=c.getContext('2d');c.width=w*DPR;c.height=h*DPR;x.setTransform(DPR,0,0,DPR,0,0);x.clearRect(0,0,w,h);if(!E.length)return;
 const lim=G.w50,B=41,bins=new Array(B).fill(0);for(const e of E)bins[clamp(Math.round((e/lim+1)/2*(B-1)),0,B-1)]++;const mxb=Math.max(...bins);
 const z=[[G.w50,'rgba(255,207,74,.18)'],[G.w100,'rgba(125,255,154,.2)'],[G.w300,'rgba(61,214,255,.25)']];for(const[ww,col]of z){const a=w/2-ww/lim*w/2;x.fillStyle=col;x.fillRect(a,h-6,w-2*a,4)}
 for(let i=0;i<B;i++){const bh=bins[i]/mxb*(h-14),bw=w/B;x.fillStyle='#ff3d7f';x.shadowColor='#ff3d7f';x.shadowBlur=8;x.fillRect(i*bw+1,h-8-bh,bw-2,bh)}x.shadowBlur=0;x.fillStyle='#fff';x.fillRect(w/2-1,0,2,h-6)}
function pause(on){if(!G||mode=='res'||G.failed)return;G.paused=on;if(on){ac.suspend();show('pause')}else{ac.resume();show('hud')}}
// ---------------- effects (all keyed to real time; positions are closed-form functions of age) ----------------
function burst(x,y,c,n){if(RM)return;const t=performance.now();for(let i=0;i<n;i++){const a=Math.random()*6.283,sp=120+Math.random()*260;parts.push({x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,c,t,life:380+Math.random()*320,s:1.5+Math.random()*2.5})}}
function flash(x,y,c,k){lights.push({x,y,c,k,t:performance.now()})}
const AMB=Array.from({length:46},(_,i)=>({x:(i*0.618034)%1,y:(i*0.381966*7.3)%1,v:.012+((i*37)%11)/300,s:.6+((i*13)%7)/5,ph:i*1.7}));
// ---------------- render ----------------
function circle(x,y,r,col,alpha,num){g.globalAlpha=alpha;g.save();if(!RM){g.shadowColor=col;g.shadowBlur=r*.6}g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=col;g.fill();g.restore();g.globalAlpha=alpha;g.lineWidth=r*.12;g.strokeStyle='#fff';g.beginPath();g.arc(x,y,r,0,7);g.stroke();
 g.beginPath();g.arc(x,y,r*.82,0,7);g.fillStyle='rgba(0,0,0,.25)';g.fill();if(num!=null){g.fillStyle='#fff';g.font=`700 ${r*.8}px ui-sans-serif,system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(num,x,y+r*.04)}g.globalAlpha=1}
function glow(x,y,rad,col,a){if(a<=.003)return;const gr=g.createRadialGradient(x,y,0,x,y,rad);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.globalAlpha=Math.min(1,a);g.fillStyle=gr;g.fillRect(x-rad,y-rad,rad*2,rad*2);g.globalAlpha=1}
function hexA(h,a){const n=parseInt(h.slice(1),16);return`rgba(${n>>16},${n>>8&255},${n&255},${a})`}
function readSpectrum(dt){if(!an)return;an.getByteFrequencyData(fbin);const k=1-Math.exp(-dt*14);let lo=0;for(let i=0;i<48;i++){const a=Math.floor(Math.pow(i/48,1.7)*120)+1,b=Math.floor(Math.pow((i+1)/48,1.7)*120)+2;let m=0;for(let j=a;j<b;j++)m=Math.max(m,fbin[j]);spec[i]+=(m/255-spec[i])*k}
 for(let i=1;i<6;i++)lo+=fbin[i];lo/=5*255;bass+=(lo-bass)*(1-Math.exp(-dt*(lo>bass?30:6)))}
function draw(now){requestAnimationFrame(draw);const dt=clamp((now-lastFrame)/1000,0,.1);lastFrame=now;
 const t=G&&(mode=='play'||mode=='pause')?songT():0;update(t);readSpectrum(dt);g.clearRect(0,0,W,H);
 // beat phase from the music actually playing (song clock in game, preview clock in menus)
 let bpm=SONGS[song]?SONGS[song].bpm:140,mpos=null,offs=0;if(G&&(mode=='play'||mode=='pause')){mpos=t;bpm=G.s.bpm;offs=G.s.offset}else if(cur){mpos=musicPos();bpm=cur.song.bpm;offs=cur.song.offset}
 const spb=60/bpm,bf=mpos!=null&&mpos>=offs?((mpos-offs)/spb)%1:(now/1000/spb)%1,beatN=mpos!=null?Math.floor((mpos-offs)/spb):Math.floor(now/1000/spb),pulse=Math.pow(1-bf,3);
 let kiai=false;if(G&&mode!='res'&&mpos!=null)kiai=G.s.kiai.some(([a,b])=>mpos>=a&&mpos<b);else if(cur&&mpos!=null)kiai=cur.song.kiai.some(([a,b])=>mpos>=a&&mpos<b);
 if(G){$('kiai').style.opacity=kiai&&mode=='play'?1:0}
 // --- background light ---
 const cx=W/2,cy=H/2,big=Math.max(W,H);
 if(RM){glow(cx,cy,big*.75,'rgba(255,61,127,.16)',1);glow(W*.1,H*.95,big*.5,'rgba(179,125,255,.10)',1);glow(W*.92,H*.05,big*.45,'rgba(61,214,255,.07)',1)}
 else{const e=.10+pulse*.10+bass*.28+(kiai?.12+pulse*.18:0);glow(cx,cy,big*(.62+bass*.12),`rgba(255,61,127,${clamp(e,0,.75)})`,1);
  glow(W*.08,H*.96,big*.55,`rgba(179,125,255,${.06+bass*.22+(kiai?pulse*.2:0)})`,1);glow(W*.94,H*.04,big*.5,`rgba(61,214,255,${.04+bass*.16+(kiai?pulse*.16:0)})`,1);
  if(kiai){const kc=['#ff3d7f','#b37dff','#3dd6ff'][((beatN%3)+3)%3];g.globalAlpha=.07*pulse;g.fillStyle=kc;g.fillRect(0,0,W,H);g.globalAlpha=1;
   if(mode=='play')for(const sx of[0,W]){const lg=g.createLinearGradient(sx,0,sx?sx-W*.22:W*.22,0);lg.addColorStop(0,hexA(kc,.32*pulse+.06));lg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=lg;g.fillRect(sx?W*.78:0,0,W*.22,H)}}
  lights=lights.filter(l=>now-l.t<700);for(const l of lights){const k=(now-l.t)/700;glow(l.x,l.y,(150+260*k)*PF.s*l.k,hexA(l.c.startsWith('#')?l.c:'#ff3d7f',.32*(1-k)*(1-k)*Math.min(1.4,l.k)),1)}}
 // ambient motes drifting up (closed-form in time)
 const T=now/1000;for(const a of AMB){const yy=(((a.y-T*a.v*(RM?0:1))%1)+1)%1,xx=a.x+Math.sin(T*.3+a.ph)*.01*(RM?0:1);g.globalAlpha=.12+(RM?0:bass*.35+pulse*.08);g.fillStyle='#ff7fb0';g.fillRect(xx*W,yy*H,a.s*(1+(RM?0:bass)),a.s*(1+(RM?0:bass)));}g.globalAlpha=1;
 // spectrum floor
 const bw=W/48;if(!RM)for(let i=0;i<48;i++){const h=spec[i]*H*(mode=='play'?.1:.2);if(h<1)continue;const lg=g.createLinearGradient(0,H,0,H-h);lg.addColorStop(0,'rgba(255,61,127,.38)');lg.addColorStop(1,'rgba(255,61,127,0)');g.fillStyle=lg;g.fillRect(i*bw+1,H-h,bw-2,h)}
 if(mode=='menu'||mode=='sel'||mode=='cred'){const sc=1+(RM?0:pulse*.06+bass*.05);$('cookie').style.transform=`scale(${sc})`;
  if(!RM)for(let i=0;i<5;i++){const k=((now/4000)+i/5)%1;g.strokeStyle=`rgba(255,61,127,${(1-k)*.14})`;g.lineWidth=1.5;g.beginPath();g.arc(cx,cy,80+k*big*.6,0,7);g.stroke()}
  if(mode=='menu'){const R0=Math.min(130,W*.26)+14;glow(cx,cy-20,R0*2.3*sc,`rgba(255,61,127,${RM?.35:.32+pulse*.2+bass*.25})`,1);g.save();if(!RM){g.shadowColor='#ff3d7f';g.shadowBlur=12}g.strokeStyle='rgba(255,127,176,.55)';g.lineWidth=3;g.beginPath();for(let i=0;i<96;i++){const v=spec[i%48]*(RM?0:1),a=i/96*6.283-1.57,rr=R0*sc+v*46;const x=cx+Math.cos(a)*rr,y=cy-20+Math.sin(a)*rr;g.moveTo(cx+Math.cos(a)*R0*sc,cy-20+Math.sin(a)*R0*sc);g.lineTo(x,y)}g.stroke();g.restore()}}
 if(G&&(mode=='play'||mode=='pause')){const r=G.r*PF.s;
  // playfield border pulse
  if(!RM){g.strokeStyle=`rgba(255,61,127,${.05+pulse*.07+(kiai?.08:0)})`;g.lineWidth=1;g.strokeRect(px(-10),py(-10),(532)*PF.s,404*PF.s)}
  const vis=[];for(let i=G.next;i<G.objs.length;i++){const o=G.objs[i];if(o.t-t>G.pre)break;vis.push(o)}
  for(let i=0;i+1<vis.length;i++){const a=vis[i],b=vis[i+1];if(b.n==1)continue;const[ax,ay]=a.sl?bez(a,1):[a.x,a.y],x1=px(ax),y1=py(ay),x2=px(b.x),y2=py(b.y),L=Math.hypot(x2-x1,y2-y1);if(L<r*3)continue;
   const al=clamp((G.pre-(b.t-t))/(G.pre*.5),0,1);g.strokeStyle=`rgba(255,255,255,${.25*al})`;g.lineWidth=2;g.beginPath();for(let k=r*1.2;k<L-r*1.2;k+=22){const u=k/L;g.moveTo(x1+(x2-x1)*u,y1+(y2-y1)*u);g.lineTo(x1+(x2-x1)*(u+8/L),y1+(y2-y1)*(u+8/L))}g.stroke()}
  for(let i=vis.length-1;i>=0;i--){const o=vis[i];if(o.j!==null)continue;const col=COLS[o.c%COLS.length],fade=clamp((G.pre-(o.t-t))/(G.pre*.45),0,1);let sx=0;if(!RM&&o.shake&&now-o.shake<250)sx=Math.sin((now-o.shake)/18)*6;
   const x=px(o.x)+sx,y=py(o.y);
   if(o.sl){g.lineCap='round';g.lineJoin='round';g.globalAlpha=fade*.9;g.beginPath();for(let k=0;k<=32;k++){const[bx,by]=bez(o,k/32);k?g.lineTo(px(bx),py(by)):g.moveTo(px(bx),py(by))}
    g.save();if(!RM){g.shadowColor=col;g.shadowBlur=r*.5}g.strokeStyle='#fff';g.lineWidth=r*2;g.stroke();g.restore();g.globalAlpha=fade*.9;g.strokeStyle='#111116';g.lineWidth=r*1.8;g.stroke();g.strokeStyle=col;g.globalAlpha=fade*.35;g.stroke();g.globalAlpha=1;
    for(let k=0;k<o.ticks.length;k++){if(k<o.ti)continue;const[tx,ty]=bez(o,(o.ticks[k]-o.t)/o.sl.dur);g.globalAlpha=fade;g.fillStyle='#fff';g.beginPath();g.arc(px(tx),py(ty),r*.12,0,7);g.fill();g.globalAlpha=1}
    const[ex,ey]=bez(o,1);circle(px(ex),py(ey),r,col,fade*.9);
    if(t>=o.t){const u=clamp((t-o.t)/o.sl.dur,0,1),[bx,by]=bez(o,u);g.beginPath();g.arc(px(bx),py(by),r*.8,0,7);g.fillStyle='#fff';g.fill();
     g.beginPath();g.arc(px(bx),py(by),r*(o.fol?2.4:1.5),0,7);g.strokeStyle=o.fol?'rgba(255,255,255,.85)':'rgba(255,255,255,.18)';g.lineWidth=o.fol?3:1.5;if(o.fol&&!RM){g.save();g.shadowColor=col;g.shadowBlur=14;g.stroke();g.restore()}else g.stroke()}}
   if(o.head===null)circle(x,y,r,col,fade,o.n);
   if(t<o.t&&o.head===null){const k=(o.t-t)/G.pre;g.globalAlpha=fade;g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(x,y,r*(1+k*3),0,7);g.stroke();g.globalAlpha=1}}
  // hit-error meter
  const em=$('acc');errs=errs.filter(e=>now-e.t<4000);if(errs.length){const mw=Math.min(240,W*.5),ex0=W/2,ey0=H-14;g.fillStyle='rgba(61,214,255,.35)';g.fillRect(ex0-mw/2*G.w300/G.w50,ey0-2,mw*G.w300/G.w50,4);g.fillStyle='rgba(125,255,154,.18)';g.fillRect(ex0-mw/2*G.w100/G.w50,ey0-2,mw*G.w100/G.w50,4);
   for(const e of errs){const a=1-(now-e.t)/4000;g.globalAlpha=a;g.fillStyle=Math.abs(e.e)<=G.w300?'#3dd6ff':Math.abs(e.e)<=G.w100?'#7dff9a':'#ffcf4a';g.fillRect(ex0+e.e/G.w50*mw/2-1,ey0-9,2,18)}g.globalAlpha=1;g.fillStyle='#fff';g.fillRect(ex0-1,ey0-11,2,22)}
  // HUD (time-based easing)
  G.dscore+=(G.score-G.dscore)*(1-Math.exp(-dt*14));if(Math.abs(G.score-G.dscore)<1)G.dscore=G.score;
  $('score').textContent=String(Math.round(G.dscore)).padStart(8,'0');em.textContent=(acc()*100).toFixed(2)+'%';$('combo').textContent=G.combo?G.combo+'x':'';$('hp').style.width=Math.max(0,G.hp*100)+'%';
  const p=clamp((t-G.start)/(G.lastEnd-G.start),0,1);$('pc').style.strokeDashoffset=56.5*(1-p);$('tleft').textContent=t<G.start?'':'-'+fmt(Math.max(0,G.lastEnd-t));
  if(G.failed){g.fillStyle='rgba(120,0,0,.25)';g.fillRect(0,0,W,H)}
  if(t<G.start){g.fillStyle='rgba(255,255,255,.55)';g.font='300 14px ui-sans-serif,system-ui';g.textAlign='center';g.fillText(G.s.title+'  ·  '+G.d.n,W/2,H-34)}}
 // particles + judgements (closed form: x = x0 + v*(1-e^-kt)/k)
 parts=parts.filter(p=>now-p.t<p.life);for(const p of parts){const a=(now-p.t)/1000,k=4,f=(1-Math.exp(-k*a))/k,q=1-(now-p.t)/p.life;g.globalAlpha=q;g.fillStyle=p.c;g.fillRect(p.x+p.vx*f-p.s/2,p.y+p.vy*f+40*a*a-p.s/2,p.s,p.s)}g.globalAlpha=1;
 fx=fx.filter(f=>now-f.t<(f.v==-2?1000:600));for(const f of fx){const k=(now-f.t)/(f.v==-2?1000:600),r=G?G.r*PF.s:30;
  if(f.v==-2){g.globalAlpha=1-k;g.save();if(!RM){g.shadowColor='#ff3d7f';g.shadowBlur=20}g.font=`900 ${RM?40:40+k*16}px ui-sans-serif,system-ui,sans-serif`;g.textAlign='center';g.fillStyle='#fff';g.fillText(f.txt,f.x,f.y-(RM?0:k*20));g.restore();g.globalAlpha=1;continue}
  if(f.v>0||f.v==-1){g.globalAlpha=(1-k)*.7;g.beginPath();g.arc(f.x,f.y,r*(1+(RM?0:k*.5)),0,7);g.strokeStyle=f.c;g.lineWidth=r*.15*(1-k);g.stroke();g.globalAlpha=1}
  if(f.v>=0){g.globalAlpha=1-k;g.save();const col=f.v==300?'#3dd6ff':f.v==100?'#7dff9a':f.v==50?'#ffcf4a':'#ff3d3d';if(!RM){g.shadowColor=col;g.shadowBlur=10}g.font=`800 ${f.v==300?16:f.v?22:30}px ui-sans-serif,system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillStyle=col;g.fillText(f.v?f.v:'miss',f.x,f.y+r*1.25-(RM?0:k*12)+(f.v?0:(RM?0:k*16)));g.restore();g.globalAlpha=1}
  if(f.v==-3){g.globalAlpha=1-k;g.font='800 18px ui-sans-serif,system-ui,sans-serif';g.textAlign='center';g.fillStyle='#ff3d3d';g.fillText('×',f.x,f.y);g.globalAlpha=1}}
 // cursor + trail (time-windowed)
 trail.push([mx,my,now]);trail=trail.filter(p=>now-p[2]<(RM?60:140));for(let i=1;i<trail.length;i++){const k=i/trail.length;g.strokeStyle=`rgba(255,${120+k*135|0},${180+k*75|0},${k*.45})`;g.lineWidth=k*10;g.lineCap='round';g.beginPath();g.moveTo(trail[i-1][0],trail[i-1][1]);g.lineTo(trail[i][0],trail[i][1]);g.stroke()}
 const pr=holding();g.save();if(!RM){g.shadowColor='#ff3d7f';g.shadowBlur=pr?22:12}g.beginPath();g.arc(mx,my,pr?11:13,0,7);g.fillStyle='#fff';g.fill();g.lineWidth=3;g.strokeStyle='#ff3d7f';g.stroke();g.restore()}
requestAnimationFrame(draw);
// ---------------- UI ----------------
function cover(c,s,i){const w=c.width=128,h=c.height=128,x=c.getContext('2d'),hue=[330,300,345,280,195][i%5];const gr=x.createLinearGradient(0,0,w,h);gr.addColorStop(0,`hsl(${hue},90%,58%)`);gr.addColorStop(1,`hsl(${hue+30},70%,14%)`);x.fillStyle=gr;x.fillRect(0,0,w,h);
 x.fillStyle='rgba(0,0,0,.35)';x.fillRect(0,h*.55,w,h*.45);x.fillStyle='rgba(255,255,255,.9)';const n=s.wf.length,bw=w/n;for(let k=0;k<n;k++){const v=s.wf[k]*h*.36;x.fillRect(k*bw,h*.74-v/2,Math.max(1,bw-.4),v)}
 x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=5;x.beginPath();x.arc(w*.5,h*.3,h*.17,0,7);x.stroke();x.font='800 20px ui-sans-serif,system-ui,sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillStyle='#fff';x.fillText(Math.round(s.bpm),w*.5,h*.3)}
function buildSel(err){const S=$('songs');S.innerHTML=SONGS.map((s,i)=>`<div class="song${i==song?' on':''}" data-i="${i}"><canvas class="cov"></canvas><div class="meta"><b>${s.title}</b><small>${s.artist} &middot; ${Math.round(s.bpm)} bpm &middot; ${fmt(s.dur)}</small><div class="lic">${s.lic}${i==song&&loading?' <span class="ld">&middot; loading…</span>':''}${i==song&&err?' <span class="ld">&middot; couldn\'t load, tap again</span>':''}</div></div></div>`).join('');
 S.querySelectorAll('canvas.cov').forEach((c,i)=>cover(c,SONGS[i],i));
 $('diffs').innerHTML=DIFFS.map((d,i)=>{const st=SONGS[song]?stars(SONGS[song],i):0;return`<div class="diff${i==diff?' on':''}" data-d="${i}">${d.n} <span class="stars">★${st.toFixed(1)}</span><i>${SONGS[song]?SONGS[song].maps[i].length:0} notes</i></div>`}).join('')}
function buildCred(){$('credbox').innerHTML='<h3>music</h3>'+SONGS.map(s=>`<p><b>${s.title}</b> by ${s.artist}<br><span style="opacity:.6">${s.lic=='CC BY 4.0'?`licensed <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a> &middot; <a href="${s.src}" target="_blank" rel="noopener">Free Music Archive</a>`:'uploaded by Landry for this map'}</span></p>`).join('')+'<p style="opacity:.5">Beatmaps generated from each track\'s detected tempo and onsets.</p>'}
let prevTok=0;async function previewSong(){if(!ac||!SONGS.length)return;const s=SONGS[song],tok=++prevTok;stopMusic();let b;try{b=await loadSong(s)}catch(e){return}if(tok!=prevTok||mode!='sel'&&mode!='cred')return;playBuf(b,s,ac.currentTime+.05,Math.min(s.preview,b.duration-31),true)}
function toSel(){initAudio();ac.resume();buildSel();show('sel');previewSong()}
function pickSong(i){if(i==song)return newGame();song=i;buildSel();previewSong()}
function setPtr(e){mx=e.clientX;my=e.clientY}
addEventListener('pointermove',e=>{if(e.pointerType!='touch'||ptrs.has(e.pointerId)||!ptrs.size)setPtr(e)},{passive:true});
addEventListener('pointerdown',e=>{if(e.pointerType=='touch')trail=[];setPtr(e);if(mode=='play'){e.preventDefault();ptrs.add(e.pointerId);press();return}
 const el=e.target;if(el.closest&&el.closest('#back'))return;
 if(mode=='menu'&&el.closest('#menu')){toSel();return}
 if(mode=='sel'){const so=el.closest('.song'),df=el.closest('.diff');if(so)pickSong(+so.dataset.i);if(df){diff=+df.dataset.d;buildSel()}if(el.closest('#playb'))newGame();if(el.closest('#credb')){buildCred();show('cred')}}
 const b=el.closest('.btn');if(b){const a=b.dataset.a;if(a=='credx'){show('sel');return}if(a=='cont')pause(false);if(a=='retry'){if(G&&G.paused){G.paused=0;ac.resume()}newGame()}if(a=='quit'){if(G&&G.paused)ac.resume();G=null;stopMusic();toSel()}}});
const up=e=>{ptrs.delete(e.pointerId)};addEventListener('pointerup',up);addEventListener('pointercancel',up);addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.repeat)return;
 if(k=='escape'){if(mode=='play')pause(true);else if(mode=='pause')pause(false);else if(mode=='cred')show('sel');else if(mode=='sel'){stopMusic();show('menu')}else if(mode=='res'){G=null;toSel()}return}
 if(mode=='menu'&&(k=='enter'||k==' ')){toSel();return}
 if(mode=='sel'){if(k=='arrowdown'||k=='arrowup'){song=(song+(k=='arrowdown'?1:SONGS.length-1))%SONGS.length;buildSel();previewSong()}if(k=='arrowleft'||k=='arrowright'){diff=clamp(diff+(k=='arrowright'?1:-1),0,2);buildSel()}if(k=='enter')newGame();return}
 if(mode=='res'&&k=='enter'){newGame();return}if(mode=='play'&&k=='`'){newGame();return}
 if(mode=='play'&&(k.length==1||k==' ')){keysDown.add(k);press()}});
addEventListener('keyup',e=>keysDown.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keysDown.clear();ptrs.clear();if(mode=='play')pause(true)});
document.addEventListener('visibilitychange',()=>{if(document.hidden){keysDown.clear();ptrs.clear();if(mode=='play')pause(true)}});
if(matchMedia('(pointer:coarse)').matches)$('hint').textContent='tap to play';
fetch('songs/maps.json?v=2').then(r=>r.json()).then(j=>{SONGS=j;if(mode=='sel')buildSel()});
window.__lsu={finish:()=>G&&results(),get G(){return G},get mode(){return mode},songT,newGame,setSong:(s,d)=>{song=s;diff=d},get SONGS(){return SONGS},get ac(){return ac},press,get ptrs(){return ptrs},setMouse:(x,y)=>{mx=x;my=y},px,py,bez};

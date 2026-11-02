'use strict';
const $=id=>document.getElementById(id),cv=$('c'),g=cv.getContext('2d');
let W,H,DPR,PF={x:0,y:0,s:1};
function fit(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';g.setTransform(DPR,0,0,DPR,0,0);
 const s=Math.min(W/640,H/480)*.92;PF={s,x:(W-512*s)/2,y:(H-384*s)/2+H*.02}}
fit();addEventListener('resize',fit);
const px=x=>PF.x+x*PF.s,py=y=>PF.y+y*PF.s;
// ---------------- audio: procedural phonk ----------------
let ac,master,comp,dist;
function initAudio(){if(ac)return;ac=new (window.AudioContext||window.webkitAudioContext)();comp=ac.createDynamicsCompressor();comp.threshold.value=-14;comp.ratio.value=4;master=ac.createGain();master.gain.value=.8;master.connect(comp);comp.connect(ac.destination);
 dist=ac.createWaveShaper();const k=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/512-1;k[i]=Math.tanh(x*3.2)}dist.curve=k;dist.connect(master)}
const NB=()=>{const b=ac.createBuffer(1,ac.sampleRate*.5,ac.sampleRate),d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;return b};let noiseB;
function env(gn,t,a,v,dec){gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(v,t+a);gn.gain.exponentialRampToValueAtTime(.0001,t+a+dec)}
function kick(t,v=1){const o=ac.createOscillator(),q=ac.createGain();o.frequency.setValueAtTime(160,t);o.frequency.exponentialRampToValueAtTime(42,t+.12);env(q,t,.002,v*.9,.28);o.connect(q);q.connect(master);o.start(t);o.stop(t+.35)}
function b808(t,f,dur,glide){const o=ac.createOscillator(),q=ac.createGain();o.type='sine';o.frequency.setValueAtTime(f*1.6,t);o.frequency.exponentialRampToValueAtTime(f,t+.05);if(glide)o.frequency.exponentialRampToValueAtTime(glide,t+dur*.8);q.gain.setValueAtTime(0,t);q.gain.linearRampToValueAtTime(.55,t+.01);q.gain.setValueAtTime(.5,t+dur*.7);q.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(q);q.connect(dist);o.start(t);o.stop(t+dur+.05)}
function nz(t,dur,v,type,f,qv=1){const s=ac.createBufferSource();s.buffer=noiseB;const fl=ac.createBiquadFilter();fl.type=type;fl.frequency.value=f;fl.Q.value=qv;const q=ac.createGain();env(q,t,.001,v,dur);s.connect(fl);fl.connect(q);q.connect(master);s.start(t);s.stop(t+dur+.05)}
function clap(t){nz(t,.18,.5,'bandpass',1500,.8);nz(t+.012,.14,.35,'bandpass',1200,.8);nz(t+.024,.2,.4,'bandpass',1800,.7)}
function hat(t,v=.12,open){nz(t,open?.18:.04,v,'highpass',7500)}
function bell(t,f,v=.22,dur=.35){const bp=ac.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*1.3;bp.Q.value=2.5;const q=ac.createGain();env(q,t,.002,v,dur);bp.connect(q);q.connect(master);
 for(const m of[1,1.4836]){const o=ac.createOscillator();o.type='square';o.frequency.value=f*m;o.connect(bp);o.start(t);o.stop(t+dur+.05)}
 const dl=ac.createDelay();dl.delayTime.value=.19;const fb=ac.createGain();fb.gain.value=.28;q.connect(dl);dl.connect(fb);fb.connect(dl);const wet=ac.createGain();wet.gain.value=.35;dl.connect(wet);wet.connect(master);setTimeout(()=>{try{dl.disconnect()}catch(e){}},(t-ac.currentTime+2)*1000)}
function hitTick(){if(!ac)return;nz(ac.currentTime,.03,.25,'highpass',3000)}
function missSnd(){if(!ac)return;const o=ac.createOscillator(),q=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(220,ac.currentTime);o.frequency.exponentialRampToValueAtTime(70,ac.currentTime+.2);env(q,ac.currentTime,.002,.18,.2);o.connect(q);q.connect(master);o.start();o.stop(ac.currentTime+.3)}
const NOTE=n=>440*Math.pow(2,(n-69)/12);
// songs: bpm, root midi, cowbell riff (16 steps, -1 rest, scale degrees semitone offsets), bass pattern
const SONGS=[
 {name:'DRIFT LSU',artist:'lsu phonk',bpm:140,root:49,bars:44,riff:[12,-1,12,15,-1,12,10,-1,12,-1,7,-1,10,-1,8,7],riff2:[12,-1,15,17,-1,15,12,-1,10,-1,12,-1,8,-1,7,-1],bass:[0,0,0,-2],seed:7},
 {name:'COWBELL TERROR',artist:'lsu phonk',bpm:156,root:46,bars:48,riff:[0,3,7,3,10,7,3,7,12,10,7,3,8,7,3,-1],riff2:[12,-1,10,-1,8,-1,7,-1,8,7,5,3,5,3,2,-1],bass:[0,0,-4,-5],seed:21},
 {name:'MIDNIGHT CA',artist:'lsu phonk',bpm:128,root:51,bars:40,riff:[7,-1,-1,10,-1,7,-1,5,3,-1,-1,5,-1,3,0,-1],riff2:[12,-1,-1,10,-1,12,-1,15,14,-1,-1,12,-1,10,7,-1],bass:[0,-4,-7,-5],seed:3}];
// arrangement: 0-1 intro (bell only), 2-9 drop, 10-11 break, 12+ drop2, last 2 outro
const sect=(s,bar)=>bar<2?'intro':bar>=s.bars-2?'outro':(bar>=18&&bar<20)||(bar>=34&&bar<36)?'break':bar<18?'drop':'drop2';
let sched=null;
function startMusic(s,t0){noiseB=noiseB||NB();const spb=60/s.bpm,st=spb/4;let step=0;const total=s.bars*16;
 sched={s,t0,timer:setInterval(()=>{while(step<total&&t0+step*st<ac.currentTime+.15){const t=t0+step*st,bar=Math.floor(step/16),i=step%16,sc=sect(s,bar),r=(bar%4<2?s.riff:s.riff2)[i];
   if(r>=0&&sc!='outro'||(sc=='outro'&&i==0&&bar==s.bars-2))bell(t,NOTE(s.root+24+(r<0?0:r)),sc=='break'?.12:.2);
   if(sc=='drop'||sc=='drop2'){const bn=s.root-12+s.bass[bar%4];if(i==0)b808(t,NOTE(bn),st*6);if(i==6)b808(t,NOTE(bn),st*4);if(i==10)b808(t,NOTE(bn+(bar%2?3:0)),st*5,bar%4==3?NOTE(bn-5):0);
    if(i==0||i==6||i==10||(sc=='drop2'&&i==13))kick(t);if(i==4||i==12)clap(t);
    hat(t,i%4==2?.14:.08,i==14&&bar%2);if(sc=='drop2'&&bar%4==3&&i>=12)hat(t+st/2,.08)}
   if(sc=='break'&&i%4==0)hat(t,.06);
   if(sc=='intro'&&bar==1&&i>=8&&i%2==0)nz(t,.12,.05+i*.01,'bandpass',800+i*120,1.2);
   step++}},25),total,spb}}
function stopMusic(){if(sched){clearInterval(sched.timer);sched=null}if(master){const m=master;m.gain.setTargetAtTime(0,ac.currentTime,.05);master=ac.createGain();master.gain.value=.8;master.connect(comp);dist.disconnect();dist.connect(master)}}
// ---------------- beatmap generation ----------------
function rng(seed){let s=seed>>>0||1;return()=>(s=Math.imul(s^s>>>15,1|s)+0x6D2B79F5|0,((s^s>>>13)>>>0)/4294967296)}
const DIFFS=[{n:'easy',ar:5,cs:3,od:4,step:1,jump:90,stars:2,slider:.3},{n:'normal',ar:7,cs:4,od:6,step:.5,jump:130,stars:3.4,slider:.35},{n:'hard',ar:8.8,cs:4.3,od:8,step:.5,jump:190,stars:4.8,slider:.25}];
function gen(s,d){const R=rng(s.seed*97+d.ar*10),spb=60/s.bpm,objs=[];let x=256,y=192,ang=R()*6.28,combo=0,cset=0;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 for(let beat=8;beat<(s.bars-2)*4;beat+=d.step){const bar=Math.floor(beat/4),sc=sect(s,bar);if(sc=='break'||sc=='intro'){if(beat%4==0){combo=0}continue}
  const b4=beat%4;if(d.step==.5&&sc=='drop'&&b4%1&&R()<.35)continue;
  if(beat%4==0&&(bar%2==0)){combo=0;cset++}
  const isSlider=R()<d.slider&&beat%1==0&&beat+2<(s.bars-2)*4;
  const dist=(sc=='drop2'?1.15:1)*d.jump*(b4%1?.45:1)*(0.75+R()*.5);ang+=(R()-.5)*2.2+(R()<.2?Math.PI*.8:0);
  let nx=x+Math.cos(ang)*dist,ny=y+Math.sin(ang)*dist;if(nx<30||nx>482){ang=Math.PI-ang;nx=clamp(x+Math.cos(ang)*dist,30,482)}if(ny<30||ny>354){ang=-ang;ny=clamp(y+Math.sin(ang)*dist,30,354)}
  x=nx;y=ny;combo++;const o={t:beat*spb,x,y,n:combo,c:cset};
  if(isSlider){const len=d.step==1?2:1,a2=ang+(R()-.5)*1.6,L=90+R()*70;let ex=clamp(x+Math.cos(a2)*L,30,482),ey=clamp(y+Math.sin(a2)*L,30,354);const mx=(x+ex)/2+(R()-.5)*90,my=(y+ey)/2+(R()-.5)*90;
   o.sl={ex,ey,mx,my,dur:len*spb};x=ex;y=ey;beat+=len-d.step+d.step;if(d.step==.5)beat+=0}
  objs.push(o)}
 return objs}
const bez=(o,u)=>{const s=o.sl,a=(1-u)*(1-u),b=2*(1-u)*u,c=u*u;return[a*o.x+b*s.mx+c*s.ex,a*o.y+b*s.my+c*s.ey]};
// ---------------- game state ----------------
const COLS=['#ff3d7f','#3dd6ff','#b37dff','#ffcf4a'];
let mode='menu',song=0,diff=1,G=null,mx=W/2,my=H/2,trail=[],keysDown=new Set(),mouseDown=0,fx=[],bump=0,lastBeat=-1;
function newGame(){stopMusic();initAudio();const s=SONGS[song],d=DIFFS[diff];const preempt=d.ar<5?1200+600*(5-d.ar)/5:1200-750*(d.ar-5)/5,r=54.4-4.48*d.cs;
 G={s,d,objs:gen(s,d).map(o=>({...o,j:null,held:0,hit:0})),pre:preempt/1000,r,w300:(80-6*d.od)/1000,w100:(140-8*d.od)/1000,w50:(200-10*d.od)/1000,score:0,dscore:0,combo:0,max:0,n300:0,n100:0,n50:0,nm:0,hp:1,t0:ac.currentTime+1.2,paused:0,next:0,end:0,failed:0};
 G.end=G.objs.length?G.objs[G.objs.length-1].t+(G.objs[G.objs.length-1].sl?.dur||0)+1.6:10;
 startMusic(s,G.t0);fx=[];show('hud')}
const T=()=>G?ac.currentTime-G.t0:0;
function show(id){for(const k of['menu','sel','hud','pause','res'])$(k).classList.toggle('off',k!=id&&!(id=='pause'&&k=='hud'));mode=id=='hud'?'play':id}
function acc(){const n=G.n300+G.n100+G.n50+G.nm;return n?(G.n300*300+G.n100*100+G.n50*50)/(n*300):1}
function judge(o,v,x,y){o.j=v;if(v){G.combo++;G.max=Math.max(G.max,G.combo);G.score+=Math.round(v*(1+Math.max(0,G.combo-1)/25*(1+diff*.4)));G.hp=Math.min(1,G.hp+(v==300?.06:v==100?.03:.01));G['n'+v]++;hitTick()}
 else{if(G.combo>=10)missSnd();G.combo=0;G.nm++;G.hp-=.09}
 fx.push({x,y,v,t:performance.now(),c:COLS[o.c%COLS.length]});if(v)$('combo').animate([{transform:'scale(1.35)'},{transform:'scale(1)'}],{duration:140})}
function press(){if(mode!='play'||!G||G.paused)return;const t=T();
 for(let i=G.next;i<G.objs.length;i++){const o=G.objs[i];if(o.hit||o.j!==null&&!o.sl)continue;if(o.hit)continue;
  if(o.t-t>G.pre)break;const d=Math.hypot(mx-px(o.x),my-py(o.y));if(d>G.r*PF.s*1.05)return; // notelock: only the first object
  const e=Math.abs(t-o.t);if(t<o.t-G.w50){o.shake=performance.now();return}
  const v=e<=G.w300?300:e<=G.w100?100:e<=G.w50?50:0;o.hit=1;if(o.sl){o.head=v;o.held=1;if(v){G.combo++;G.max=Math.max(G.max,G.combo);G.score+=30;hitTick()}else{G.combo=0}fx.push({x:px(o.x),y:py(o.y),v:-1,t:performance.now(),c:COLS[o.c%4]})}else judge(o,v,px(o.x),py(o.y));return}}
function update(){if(mode!='play'||!G||G.paused)return;const t=T(),holding=keysDown.size>0||mouseDown;
 for(let i=G.next;i<G.objs.length;i++){const o=G.objs[i];if(o.t-t>G.pre)break;
  if(!o.sl){if(o.j===null&&t>o.t+G.w50){o.hit=1;judge(o,0,px(o.x),py(o.y))}}
  else{if(!o.hit&&t>o.t+G.w50){o.hit=1;o.head=0;G.combo=0;G.hp-=.06}
   if(t>=o.t&&t<=o.t+o.sl.dur){const u=(t-o.t)/o.sl.dur,[bx,by]=bez(o,u),inR=Math.hypot(mx-px(bx),my-py(by))<G.r*PF.s*2.4;o.track=(o.track||0)+(holding&&inR?1:0);o.tot=(o.tot||0)+1;o.following=holding&&inR}
   if(o.j===null&&t>o.t+o.sl.dur){const f=(o.track||0)/Math.max(1,o.tot||1),h=o.head||0;const v=f>.85&&h?(h==300?300:100):f>.5?100:f>.15||h?50:0;const[ex,ey]=bez(o,1);if(v){G.combo=Math.max(0,G.combo-1)}judge(o,v,px(ex),py(ey))}}
  }
 while(G.next<G.objs.length&&G.objs[G.next].j!==null)G.next++;
 // drain + fail
 if(t>0&&t<G.end-1.6)G.hp-=.0009*(1+diff*.35);if(G.hp<=0&&!G.failed){G.failed=1;fail()}
 if(t>G.end)results();
 const beat=Math.floor(t/(60/G.s.bpm));if(beat!=lastBeat&&t>0){lastBeat=beat;bump=1}}
function fail(){stopMusic();const s=performance.now();(function f(){const k=(performance.now()-s)/900;if(k<1){requestAnimationFrame(f)}else results(1)})()}
function results(failed){if(mode=='res')return;stopMusic();const a=acc(),n=G.n300+G.n100+G.n50+G.nm,r3=n?G.n300/n:1;
 const gr=failed?'F':a==1?'SS':r3>.9&&G.n50/n<.01&&!G.nm?'S':r3>.8&&!G.nm||r3>.9?'A':r3>.7&&!G.nm||r3>.8?'B':r3>.6?'C':'D';
 $('grade').textContent=gr;$('grade').style.color={SS:'#ffe27a',S:'#ffcf4a',A:'#7dff9a',B:'#3dd6ff',C:'#b37dff',D:'#ff3d7f',F:'#ff3d3d'}[gr];
 $('rscore').textContent=String(G.score).padStart(8,'0');$('rstat').innerHTML=[['300',G.n300],['100',G.n100],['50',G.n50],['miss',G.nm],['accuracy',(a*100).toFixed(2)+'%'],['max combo',G.max+'x'],['song',G.s.name],['diff',G.d.n]].map(([k,v])=>`<div><i>${k}</i>${v}</div>`).join('');
 show('res');$('res').querySelector('.grade').animate([{transform:'scale(2.2)',opacity:0,filter:'blur(10px)'},{transform:'scale(1)',opacity:1,filter:'blur(0)'}],{duration:650,easing:'cubic-bezier(.2,1.4,.4,1)'})}
function pause(on){if(!G||mode=='res')return;G.paused=on;if(on){ac.suspend();show('pause')}else{ac.resume();show('hud')}}
// ---------------- render ----------------
function circle(x,y,r,col,alpha,num){g.globalAlpha=alpha;g.beginPath();g.arc(x,y,r,0,7);g.fillStyle=col;g.fill();g.lineWidth=r*.12;g.strokeStyle='#fff';g.stroke();
 g.beginPath();g.arc(x,y,r*.82,0,7);g.fillStyle='rgba(0,0,0,.25)';g.fill();if(num!=null){g.fillStyle='#fff';g.font=`700 ${r*.8}px ui-sans-serif,system-ui,sans-serif`;g.textAlign='center';g.textBaseline='middle';g.fillText(num,x,y+r*.04)}g.globalAlpha=1}
function draw(now){requestAnimationFrame(draw);update();g.clearRect(0,0,W,H);
 bump*=.9;const t=G&&(mode=='play'||mode=='pause')?T():0;
 // background: subtle beat pulse + menu cookie bounce
 const bg=g.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.max(W,H)*.7);bg.addColorStop(0,`rgba(255,61,127,${.05+bump*.05})`);bg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=bg;g.fillRect(0,0,W,H);
 if(mode=='menu'||mode=='sel'){const b=(now/1000*(SONGS[song].bpm/60))%1;$('cookie').style.transform=`scale(${1+Math.pow(1-b,4)*.05})`;
  for(let i=0;i<5;i++){const k=((now/4000)+i/5)%1;g.strokeStyle=`rgba(255,255,255,${(1-k)*.08})`;g.lineWidth=1;g.beginPath();g.arc(W/2,H/2,80+k*Math.max(W,H)*.6,0,7);g.stroke()}}
 if(G&&(mode=='play'||mode=='pause'||mode=='res')&&mode!='res'){const r=G.r*PF.s;
  // playfield objects back-to-front
  const vis=[];for(let i=G.next;i<G.objs.length;i++){const o=G.objs[i];if(o.t-t>G.pre)break;vis.push(o)}
  // follow points
  for(let i=0;i+1<vis.length;i++){const a=vis[i],b=vis[i+1];if(b.n==1)continue;const[ax,ay]=a.sl?bez(a,1):[a.x,a.y],x1=px(ax),y1=py(ay),x2=px(b.x),y2=py(b.y),L=Math.hypot(x2-x1,y2-y1);if(L<r*3)continue;
   const al=Math.min(1,(G.pre-(b.t-t))/(G.pre*.5));g.strokeStyle=`rgba(255,255,255,${.25*al})`;g.lineWidth=2;g.beginPath();for(let k=r*1.2;k<L-r*1.2;k+=22){const u=k/L;g.moveTo(x1+(x2-x1)*u,y1+(y2-y1)*u);g.lineTo(x1+(x2-x1)*(u+8/L),y1+(y2-y1)*(u+8/L))}g.stroke()}
  for(let i=vis.length-1;i>=0;i--){const o=vis[i];if(o.j!==null)continue;const col=COLS[o.c%COLS.length],fade=Math.min(1,(G.pre-(o.t-t))/(G.pre*.45));let sx=0;if(o.shake&&now-o.shake<250)sx=Math.sin((now-o.shake)/18)*6;
   const x=px(o.x)+sx,y=py(o.y);
   if(o.sl){g.lineCap='round';g.lineJoin='round';g.globalAlpha=fade*.9;g.beginPath();for(let k=0;k<=24;k++){const[bx,by]=bez(o,k/24);k?g.lineTo(px(bx),py(by)):g.moveTo(px(bx),py(by))}g.strokeStyle='#fff';g.lineWidth=r*2;g.stroke();g.strokeStyle='#111116';g.lineWidth=r*1.8;g.stroke();g.strokeStyle=col;g.globalAlpha=fade*.35;g.stroke();g.globalAlpha=1;
    const[ex,ey]=bez(o,1);circle(px(ex),py(ey),r,col,fade*.9);
    if(t>=o.t){const u=Math.min(1,(t-o.t)/o.sl.dur),[bx,by]=bez(o,u);g.beginPath();g.arc(px(bx),py(by),r*.8,0,7);g.fillStyle='#fff';g.fill();if(o.following){g.beginPath();g.arc(px(bx),py(by),r*2.1,0,7);g.strokeStyle='rgba(255,255,255,.6)';g.lineWidth=3;g.stroke()}}}
   if(!o.hit||!o.sl){circle(x,y,r,col,fade,o.n)}
   if(t<o.t){const k=(o.t-t)/G.pre;g.globalAlpha=fade;g.strokeStyle=col;g.lineWidth=3;g.beginPath();g.arc(x,y,r*(1+k*3),0,7);g.stroke();g.globalAlpha=1}}
  // hit bursts + judgements
  fx=fx.filter(f=>now-f.t<600);for(const f of fx){const k=(now-f.t)/600;
   if(f.v){g.globalAlpha=(1-k)*.7;g.beginPath();g.arc(f.x,f.y,r*(1+k*.45),0,7);g.strokeStyle=f.c;g.lineWidth=r*.15*(1-k);g.stroke();g.globalAlpha=1}
   if(f.v>=0&&f.v!=300){g.globalAlpha=1-k;g.font=`700 ${f.v?22:28}px ui-sans-serif,system-ui,sans-serif`;g.textAlign='center';g.fillStyle=f.v==100?'#7dff9a':f.v==50?'#ffcf4a':'#ff3d3d';g.fillText(f.v?f.v:'×',f.x,f.y-k*14+(f.v?0:k*20));g.globalAlpha=1}}
  // HUD
  $('score').textContent=String(G.dscore=Math.round(G.dscore+(G.score-G.dscore)*.25)).padStart(8,'0');$('acc').textContent=(acc()*100).toFixed(2)+'%';$('combo').textContent=G.combo?G.combo+'x':'';$('hp').style.width=Math.max(0,G.hp*100)+'%';
  $('pc').style.strokeDashoffset=56.5*(1-Math.max(0,Math.min(1,t/G.end)));
  if(G.failed){g.fillStyle='rgba(120,0,0,.25)';g.fillRect(0,0,W,H)}
  if(t<0){g.fillStyle='rgba(255,255,255,.5)';g.font='300 14px ui-sans-serif,system-ui';g.textAlign='center';g.fillText(G.s.name+'  ·  '+G.d.n,W/2,H-30)}}
 // cursor + trail
 trail.push([mx,my,now]);trail=trail.filter(p=>now-p[2]<120);for(let i=1;i<trail.length;i++){const k=i/trail.length;g.strokeStyle=`rgba(255,255,255,${k*.35})`;g.lineWidth=k*9;g.lineCap='round';g.beginPath();g.moveTo(trail[i-1][0],trail[i-1][1]);g.lineTo(trail[i][0],trail[i][1]);g.stroke()}
 const pr=keysDown.size||mouseDown;g.beginPath();g.arc(mx,my,pr?11:13,0,7);g.fillStyle='#fff';g.fill();g.lineWidth=3;g.strokeStyle='#ff3d7f';g.stroke()}
requestAnimationFrame(draw);
// ---------------- UI + input ----------------
function buildSel(){$('songs').innerHTML=SONGS.map((s,i)=>`<div class="song${i==song?' on':''}" data-i="${i}"><b>${s.name}</b><small>${s.artist} &middot; ${s.bpm} bpm &middot; ${Math.round(s.bars*4*60/s.bpm)}s</small></div>`).join('');
 $('diffs').innerHTML=DIFFS.map((d,i)=>`<div class="diff${i==diff?' on':''}" data-d="${i}">${d.n} <span class="stars">${'★'.repeat(Math.round(d.stars))}</span></div>`).join('')}
let preview=null;function previewSong(){if(!ac)return;stopMusic();startMusic(SONGS[song],ac.currentTime+.05);}
function toSel(){initAudio();ac.resume();buildSel();show('sel');previewSong()}
addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
addEventListener('mousedown',e=>{const el=document.elementFromPoint(e.clientX,e.clientY);
 if(mode=='play'){mouseDown++;press();e.preventDefault();return}
 if(mode=='menu'&&el&&el.closest('#menu')){toSel();return}
 if(mode=='sel'&&el){const so=el.closest('.song'),df=el.closest('.diff');if(so){const i=+so.dataset.i;if(i==song)return newGame();song=i;buildSel();previewSong()}if(df){diff=+df.dataset.d;buildSel()}}
 const b=el&&el.closest('.btn');if(b){const a=b.dataset.a;if(a=='cont')pause(false);if(a=='retry'){if(G&&G.paused){G.paused=0;ac.resume()}newGame()}if(a=='quit'){if(G&&G.paused)ac.resume();G=null;stopMusic();toSel()}}});
addEventListener('mouseup',()=>{mouseDown=Math.max(0,mouseDown-1)});addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(e.repeat)return;
 if(k=='escape'){if(mode=='play')pause(true);else if(mode=='pause')pause(false);else if(mode=='sel'){stopMusic();show('menu')}else if(mode=='res'){G=null;toSel()}return}
 if(mode=='menu'&&(k=='enter'||k==' ')){toSel();return}
 if(mode=='sel'){if(k=='arrowdown'||k=='arrowup'){song=(song+(k=='arrowdown'?1:SONGS.length-1))%SONGS.length;buildSel();previewSong()}if(k=='arrowleft'||k=='arrowright'){diff=Math.max(0,Math.min(2,diff+(k=='arrowright'?1:-1)));buildSel()}if(k=='enter')newGame();return}
 if(mode=='res'&&k=='enter'){newGame();return}if(mode=='play'&&k=='`'){newGame();return}
 if(mode=='play'&&(k.length==1||k==' ')){keysDown.add(k);press()}});
addEventListener('keyup',e=>keysDown.delete(e.key.toLowerCase()));
addEventListener('blur',()=>{keysDown.clear();mouseDown=0;if(mode=='play')pause(true)});
// touch: tap = move + hit
addEventListener('touchstart',e=>{const p=e.touches[e.touches.length-1];mx=p.clientX;my=p.clientY;if(mode=='play'){e.preventDefault();mouseDown++;press()}},{passive:false});
addEventListener('touchmove',e=>{const p=e.touches[0];mx=p.clientX;my=p.clientY},{passive:true});addEventListener('touchend',e=>{mouseDown=e.touches.length});
window.__lsu={get G(){return G},T,newGame,setSong:(s,d)=>{song=s;diff=d}};

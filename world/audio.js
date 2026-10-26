// Landrcyverse sound: original ambient chiptune generated with Web Audio + soft UI blips. Off by default.
(()=>{const KEY='lv-sound';let on=localStorage.getItem(KEY)==='1',ctx=null,master=null,mus=null,sfx=null,timer=0,nextT=0,step=0;
const btn=document.createElement('button');btn.type='button';btn.id='sndbtn';btn.className='ui';btn.setAttribute('aria-label','Toggle sound');
const ico=o=>`<svg viewBox="0 0 12 12" shape-rendering="crispEdges" aria-hidden="true"><path fill="currentColor" d="M1 4h2v4H1zM3 4h1V3h1V2h1v8H5V9H4V8H3z"/>${o?'<path fill="currentColor" d="M8 4h1v4H8zM10 2h1v8h-1zM9 3h1v1H9zM9 8h1v1H9z"/>':'<path fill="currentColor" d="M8 4h1v1H8zM10 4h1v1h-1zM9 5h1v2H9zM8 7h1v1H8zM10 7h1v1h-1z"/>'}</svg>`;
const paint=()=>{btn.innerHTML=ico(on);btn.setAttribute('aria-pressed',on?'true':'false');btn.title=on?'Sound on':'Sound off'};paint();document.body.appendChild(btn);
const NOTE=n=>440*Math.pow(2,(n-69)/12);
// Am - F - C - G, slow arps over a soft pad
const CH=[[57,60,64,69],[53,57,60,65],[48,52,55,60],[55,59,62,67]],ARP=[0,2,1,3,2,1,3,2],BAR=16,SPB=.28;
function init(){if(ctx)return;const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=new AC();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination);
 mus=ctx.createGain();mus.gain.value=.5;const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2400;mus.connect(lp);
 const dl=ctx.createDelay(1);dl.delayTime.value=SPB*3;const fb=ctx.createGain();fb.gain.value=.32;lp.connect(dl);dl.connect(fb);fb.connect(dl);dl.connect(master);lp.connect(master);
 sfx=ctx.createGain();sfx.gain.value=.5;sfx.connect(master)}
function tone(type,f,t,dur,vol,dest,glide){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(glide)o.frequency.exponentialRampToValueAtTime(glide,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.02);g.gain.exponentialRampToValueAtTime(.0005,t+dur);o.connect(g);g.connect(dest);o.start(t);o.stop(t+dur+.05)}
function sched(){while(nextT<ctx.currentTime+.4){const bar=Math.floor(step/BAR)%CH.length,s=step%BAR,c=CH[bar],t=nextT;
  if(s===0){for(const n of c.slice(0,3))tone('triangle',NOTE(n-12),t,SPB*BAR*.95,.05,mus);tone('sine',NOTE(c[0]-24),t,SPB*BAR*.9,.08,mus)}
  if(s%2===0)tone('square',NOTE(c[ARP[(s/2)%8]]+12),t,SPB*1.6,.018,mus);
  if(s===6||s===14){const m=[0,2,4,7,9][(step*7+bar*3)%5];tone('triangle',NOTE(69+m+(bar%2?0:12)),t,SPB*3,.025,mus)}
  nextT+=SPB/2;step++}}
function start(){init();if(!ctx)return;ctx.resume();const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(.22,t+2.5);if(!timer){nextT=ctx.currentTime+.1;timer=setInterval(sched,100)}}
function stop(){if(!ctx)return;const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(0,t+.8);setTimeout(()=>{if(!on){clearInterval(timer);timer=0;ctx.suspend()}},900)}
btn.onclick=e=>{e.stopPropagation();on=!on;localStorage.setItem(KEY,on?'1':'0');paint();if(on){start();setTimeout(()=>blip('click'),60)}else stop()};
let lastB=0;function blip(kind){if(!on||!ctx||ctx.state!=='running')return;const n=performance.now();if(n-lastB<60)return;lastB=n;const t=ctx.currentTime;if(kind==='hover')tone('square',1320,t,.06,.025,sfx,1760);else tone('square',660,t,.1,.04,sfx,990)}
window.__blip=blip;
// resume after a user gesture if the saved choice is on (autoplay rules)
if(on){const go=()=>{start();removeEventListener('pointerdown',go,true);removeEventListener('keydown',go,true)};addEventListener('pointerdown',go,true);addEventListener('keydown',go,true)}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('a,button')&&e.target.closest('#sndbtn')==null)blip('click')},true);
document.addEventListener('pointerover',e=>{if(e.pointerType==='mouse'&&e.target.closest&&e.target.closest('a,button'))blip('hover')},true);
})();

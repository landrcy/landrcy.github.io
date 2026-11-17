/* Laverse cards: an ornate golden card box with a cursive L lock dial. Turn the dial, the box blooms open, the cards fan out
   and gather into a deck. Shuffle riffles the deck and the top card flips over and pops up big.
   All art is pixel art (img/*.png), drawn at an integer scale with image-rendering: pixelated. No sound. */
(()=>{'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)');
// id, name, link: the same 14 hub sites as /gumball/ (no Cooper City, no Ball Arena)
const SITES=[
 ['ashaad','The Binding of Ashaad','https://landrcy.github.io/binding-of-ashaad/'],
 ['sea','Sea of Thought','https://landrcy.github.io/sea-of-thought/'],
 ['yt','LLC Powered Channels','/youtube/'],
 ['void','The Void','https://landrcy.github.io/the-void/'],
 ['pmuseum','Pixel Museum','https://landrcy.github.io/pixel-museum/'],
 ['aiquiz','AI Quiz','https://landrcy.github.io/ai-quiz/'],
 ['typefall','typefall','/typefall/'],
 ['mine','MINE','https://landrcy.github.io/mine/'],
 ['ttt','Talk to Tung','/ttt/'],
 ['lan4drcy','lan4drcy','/lan4drcy/'],
 ['lsu','Lsu','/lsu/'],
 ['escapeca','Escape CA','https://landrcy.github.io/escape-ca/'],
 ['terra','Terra','https://landrcy.github.io/terra/'],
 ['wam','W.A.M.','https://landrcy.github.io/wam/']];
const N=SITES.length,$=id=>document.getElementById(id);
const floor=$('floor'),table=$('table'),deck=$('deck'),box=$('box'),deckhit=$('deckhit'),shuf=$('shuffle'),shade=$('shade'),big=$('big'),acts=$('acts'),go=$('go'),again=$('again'),fx=$('fx'),live=$('live');
const medal=box.querySelector('.medal'),rays=box.querySelector('.rays'),pets=[...box.querySelectorAll('.pet')],glint=box.querySelector('.glint');
$('sites').innerHTML=SITES.map(p=>`<a href="${p[2]}">${p[1]}</a>`).join('');
// preload every face so swapping the top card's face is instant
const FACE=SITES.map(p=>{const i=new Image();i.src='img/'+p[0]+'.png';return i});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function A(el,kf,o){const a=el.animate(kf,Object.assign({fill:'forwards'},o));return a.finished.then(()=>{try{a.commitStyles()}catch(e){}a.cancel()},()=>{})}
let s=2,B=3,vw=0,vh=0,tx0=0,ty0=0;
// ---- cards (identical backs; only the top card's face matters, assigned after each shuffle) ----
const stack=[];
for(let i=0;i<N;i++){const c=document.createElement('div');c.className='card';c.innerHTML='<img class="px bk" src="img/back.png" alt=""><img class="px fc" alt="">';deck.appendChild(c);stack.push(c)}
const ST=k=>`translate(0px,${-Math.floor(k/2)*s}px)`;
function restack(){stack.forEach((c,k)=>{c.style.zIndex=k;c.style.transform=ST(k)})}
function layout(){vw=innerWidth;vh=innerHeight;
 s=(vh>=1060&&vw>=900)?3:2;
 B=Math.max(2,Math.min(5,Math.floor((vw-24)/100),Math.floor((vh-150)/140)));
 document.body.style.setProperty('--s',s);
 const tw=116*s,th=160*s,gap=70;
 tx0=Math.round((vw-tw)/2);ty0=Math.max(56,Math.round((vh-th-gap)/2));
 table.style.left=tx0+'px';table.style.top=ty0+'px';table.style.transform='none';
 shuf.style.top=(ty0+th+20)+'px';
 if(!busy&&state!=='big')restack();
 if(state==='big'&&cur)placeBig(cur,false);
}
let busy=false,state='box',cur=null,last=-1;
// ---- sparkles ----
function spark(x,y,n,r,dur=520){if(RM.matches)return;for(let i=0;i<n;i++){const im=document.createElement('img');im.src='img/spark.png';im.className='px';fx.appendChild(im);
 const a=Math.PI*2*i/n+Math.random()*.6,d=r*(.6+Math.random()*.5),z=7*s/2;
 im.style.left=Math.round(x-z)+'px';im.style.top=Math.round(y-z)+'px';
 im.animate([{transform:'translate(0,0) scale(.4)',opacity:1},{transform:`translate(${Math.round(Math.cos(a)*d)}px,${Math.round(Math.sin(a)*d)}px) scale(1)`,opacity:1,offset:.55},{transform:`translate(${Math.round(Math.cos(a)*d*1.25)}px,${Math.round(Math.sin(a)*d*1.25)}px) scale(.6)`,opacity:0}],{duration:dur+Math.random()*160,easing:'cubic-bezier(.2,.7,.3,1)'}).finished.then(()=>im.remove())}}
// ---- glint sweep across the closed box (low-res canvas, so the shine is pixel art too) ----
const gx=glint.getContext('2d'),boxImg=new Image();boxImg.src='img/box.png';
let glintOn=true;
function sweep(){if(!glintOn||RM.matches)return;const t0=performance.now(),D=900;
 (function f(t){const p=Math.min(1,(t-t0)/D),e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2,x=Math.round(-70+e*260);gx.clearRect(0,0,116,160);
  if(glintOn&&p<1){gx.globalCompositeOperation='source-over';
   const band=(o,w,al)=>{gx.fillStyle=`rgba(255,250,225,${al})`;gx.beginPath();gx.moveTo(x+o,0);gx.lineTo(x+o+w,0);gx.lineTo(x+o+w-60,160);gx.lineTo(x+o-60,160);gx.closePath();gx.fill()};
   band(0,14,.28);band(4,6,.5);band(18,3,.3);
   gx.globalCompositeOperation='destination-in';gx.drawImage(boxImg,0,0);gx.globalCompositeOperation='source-over';requestAnimationFrame(f)}
  else gx.clearRect(0,0,116,160)})(t0);
 setTimeout(sweep,3400)}
setTimeout(sweep,700);
// ---- open the box: dial twist + clicks, medallion lifts, panels bloom, gold light, cards fan out then gather ----
function rect(el){return el.getBoundingClientRect()}
async function openBox(){if(busy||state!=='box')return;busy=true;box.disabled=true;
 if(RM.matches){A(floor,[{opacity:1},{opacity:0}],{duration:320,easing:'ease'});await A(box,[{opacity:1},{opacity:0}],{duration:320,easing:'ease'});finishOpen();return}
 const r=rect(medal),mx=r.left+r.width/2,my=r.top+r.height/2;
 // anticipation: the box gives a little, the dial winds back
 await Promise.all([A(box,[{transform:'scale(1,1)'},{transform:'scale(.975,.97)'}],{duration:150,easing:'cubic-bezier(.3,0,.4,1)'}),
  A(medal,[{transform:'rotate(0deg)'},{transform:'rotate(-18deg)'}],{duration:190,easing:'cubic-bezier(.3,0,.4,1)'})]);
 A(box,[{transform:'scale(.975,.97)'},{transform:'scale(1.01,1.012)',offset:.6},{transform:'scale(1,1)'}],{duration:260,easing:'ease-out'});
 // the L turns like a lock dial, clicking at each quarter (overshoot + settle each time)
 const steps=[90,180,270,360];let a0=-18;
 for(let i=0;i<4;i++){const a1=steps[i],ov=i===3?12:5;
  await A(medal,[{transform:`rotate(${a0}deg)`,easing:'cubic-bezier(.5,0,.25,1)'},{transform:`rotate(${a1+ov}deg)`,offset:.72,easing:'cubic-bezier(.3,0,.3,1)'},{transform:`rotate(${a1}deg)`}],{duration:i===3?300:190});
  a0=a1;const k=Math.PI*2*(i/4)-Math.PI/2;spark(mx+Math.cos(k)*r.width*.42,my+Math.sin(k)*r.width*.42,3,10*s,360);
  A(table,[{transform:'translate(0,0)'},{transform:`translate(0,${s}px)`,offset:.35},{transform:'translate(0,0)'}],{duration:110,easing:'ease-out'});
  if(i<3)await wait(40)}
 // final heavy click
 spark(mx,my,10,40*s,640);
 await A(table,[{transform:'translate(0,0)'},{transform:`translate(0,${2*s}px)`,offset:.3},{transform:`translate(0,${-s}px)`,offset:.65},{transform:'translate(0,0)'}],{duration:220,easing:'ease-out'});
 glintOn=false;gx.clearRect(0,0,116,160);
 // medallion presses in, then lifts away; gold light spills from the opening
 A(medal,[{transform:'rotate(360deg) translateY(0px) scale(1)',opacity:1},{transform:'rotate(360deg) translateY(0px) scale(.9)',opacity:1,offset:.2,easing:'cubic-bezier(.3,0,.2,1)'},{transform:`rotate(360deg) translateY(${-18*s}px) scale(1.25)`,opacity:0}],{duration:560});
 A(rays,[{opacity:0,transform:'scale(.2) rotate(0deg)'},{opacity:1,transform:'scale(1.06) rotate(14deg)',offset:.6},{opacity:.85,transform:'scale(1) rotate(22deg)'}],{duration:1100,delay:120,easing:'cubic-bezier(.2,.8,.3,1)'});
 await wait(200);
 // the four panels bloom outward along the seams (each hinged on its outer edge)
 const rot={top:'rotateX',bottom:'rotateX',left:'rotateY',right:'rotateY'},sg={top:1,bottom:-1,left:-1,right:1};
 pets.forEach((p,i)=>{const k=p.classList[1],R=rot[k],g=sg[k];
  A(p,[{transform:`${R}(0deg)`,easing:'cubic-bezier(.45,0,.2,1)'},{transform:`${R}(${-6*g}deg)`,offset:.12,easing:'cubic-bezier(.5,0,.15,1)'},{transform:`${R}(${190*g}deg)`,offset:.8,easing:'cubic-bezier(.3,0,.3,1)'},{transform:`${R}(${180*g}deg)`}],{duration:920,delay:i*70})});
 await wait(820);
 // cards rise out in a fan
 deck.style.zIndex=4;
 const FA=vw<600?44:56,FS=vw<600?.68:1,FAN=k=>`translate(0px,${-28*s}px) rotate(${-FA+2*FA*k/(N-1)}deg) scale(${FS})`;
 const fan=stack.map((c,k)=>{c.style.transformOrigin='50% 140%';const ang=-FA+2*FA*k/(N-1);
  return A(c,[{transform:ST(k)+' rotate(0deg) scale(1)'},{transform:`translate(0px,${-30*s}px) rotate(${ang*1.06}deg) scale(${FS})`,offset:.75},{transform:FAN(k)}],{duration:620,delay:k*32,easing:'cubic-bezier(.25,.8,.35,1)'})});
 A(box,[{opacity:1},{opacity:0}],{duration:620,delay:380,easing:'ease'});A(floor,[{opacity:1},{opacity:0}],{duration:620,delay:520,easing:'ease'});
 await Promise.all(fan);await wait(230);
 // gather into a neat deck
 const back=stack.map((c,k)=>A(c,[{transform:FAN(k)},{transform:ST(k)+' rotate(0deg) scale(1)'}],{duration:480,delay:(N-1-k)*22,easing:'cubic-bezier(.55,0,.25,1)'}));
 await Promise.all(back);
 await A(deck,[{transform:'scale(1,1)'},{transform:'scale(1.02,.975)',offset:.35},{transform:'scale(.995,1.005)',offset:.7},{transform:'scale(1,1)'}],{duration:220,easing:'ease-out'});
 stack.forEach(c=>c.style.transformOrigin='');
 finishOpen()}
function finishOpen(){box.hidden=true;floor.hidden=true;deck.style.zIndex=2;deck.style.setProperty('--sh',1);restack();state='deck';deckhit.hidden=false;shuf.hidden=false;
 A(shuf,[{opacity:0,transform:'translate(-50%,8px)'},{opacity:1,transform:'translate(-50%,0)'}],{duration:260,easing:'cubic-bezier(.2,.8,.3,1)'}).then(()=>{shuf.style.transform=''});
 busy=false;shuf.focus({preventScroll:true})}
// ---- riffle shuffle ----
function pickNext(){let n;do n=Math.floor(Math.random()*N);while(n===last&&N>1);return n}
async function riffle(){
 if(RM.matches){await A(deck,[{opacity:1},{opacity:.35}],{duration:160,easing:'ease'});await A(deck,[{opacity:.35},{opacity:1}],{duration:160,easing:'ease'});return}
 const dx=Math.min(54*s,Math.floor((vw-100*s)/2)-10),L=stack.slice(0,7),R=stack.slice(7);
 const halfT=(side,j)=>`translate(${side*dx}px,${-8*s-Math.floor(j/2)*s}px) rotate(${side*6}deg)`;
 await Promise.all([...L.map((c,j)=>A(c,[{transform:ST(j)+' rotate(0deg)'},{transform:halfT(-1,j)}],{duration:230,delay:j*6,easing:'cubic-bezier(.3,0,.15,1)'})),
  ...R.map((c,j)=>A(c,[{transform:ST(7+j)+' rotate(0deg)'},{transform:halfT(1,j)}],{duration:230,delay:j*6,easing:'cubic-bezier(.3,0,.15,1)'}))]);
 // flex: the halves bend in just before release
 await Promise.all([...L.map((c,j)=>A(c,[{transform:halfT(-1,j)},{transform:halfT(-1,j)+` translate(${4*s}px,${-2*s}px) rotate(3deg)`}],{duration:110,easing:'ease-in-out'})),
  ...R.map((c,j)=>A(c,[{transform:halfT(1,j)},{transform:halfT(1,j)+` translate(${-4*s}px,${-2*s}px) rotate(-3deg)`}],{duration:110,easing:'ease-in-out'}))]);
 // release from the halves into the centre, a random interleave
 const out=[],l=L.slice(),r=R.slice(),fl=[];
 for(let n=0;n<N;n++){const fromL=l.length&&(!r.length||Math.random()<l.length/(l.length+r.length)),c=fromL?l.pop():r.pop(),side=fromL?-1:1,j=(fromL?l.length:r.length);
  out.push(c);const t=n*30;
  fl.push(wait(t).then(()=>{c.style.zIndex=100+n;
   return A(c,[{transform:halfT(side,j)+` translate(${-side*4*s}px,${-2*s}px) rotate(${-side*3}deg)`},{transform:`translate(${side*dx*.3}px,${-12*s}px) rotate(${side*2}deg)`,offset:.45},{transform:ST(n)+' rotate(0deg)'}],{duration:240,easing:'cubic-bezier(.35,0,.25,1)'})}))}
 await Promise.all(fl);
 stack.length=0;stack.push(...out);restack();
 await A(deck,[{transform:'scale(1,1)'},{transform:'scale(.98,1.015)',offset:.4},{transform:'scale(1,1)'}],{duration:170,easing:'ease-out'})}
// ---- flip the top card, then pop it up big ----
function bigTarget(){const w=100*B,h=140*B,acth=64;return{w,h,x:Math.round((vw-w)/2),y:Math.max(58,Math.round((vh-h-acth)/2))}}
function placeBig(c,anim){const t=bigTarget();c.style.setProperty('--cs',B);c.style.left=t.x+'px';c.style.top=t.y+'px';c.style.transform='none';acts.style.top=(t.y+t.h+22)+'px'}
async function draw(){if(busy||state!=='deck')return;busy=true;deckhit.disabled=true;shuf.disabled=true;
 A(shuf,[{opacity:1},{opacity:.35}],{duration:160});
 await riffle();
 const n=pickNext();last=n;cur=stack[N-1];const c=cur,img=c.querySelector('.fc');img.src=FACE[n].src;img.alt=SITES[n][1];
 go.href=SITES[n][2];go.textContent='Go to '+SITES[n][1];
 if(/^https?:/.test(SITES[n][2])){go.target='_blank';go.rel='noopener'}else{go.removeAttribute('target');go.removeAttribute('rel')}
 const top=ST(N-1),lift=`${top} translate(0px,${-10*s}px)`;
 if(!RM.matches){
  await A(c,[{transform:top+' rotateY(0deg)'},{transform:lift+' rotateY(0deg)'}],{duration:150,easing:'cubic-bezier(.3,0,.25,1)'});
  await A(c,[{transform:lift+' rotateY(0deg)',easing:'cubic-bezier(.55,0,.35,1)'},{transform:lift+' rotateY(192deg)',offset:.78,easing:'cubic-bezier(.3,0,.3,1)'},{transform:lift+' rotateY(180deg)'}],{duration:560});
  c.classList.add('up');c.style.transform=lift;
 }else{await A(c,[{opacity:1},{opacity:0}],{duration:150});c.classList.add('up');await A(c,[{opacity:0},{opacity:1}],{duration:150})}
 // move into the overlay layer at the same spot, then grow to the big size
 const r=rect(c);big.appendChild(c);c.style.zIndex=1;c.style.left=r.left+'px';c.style.top=r.top+'px';c.style.transform='none';
 const t=bigTarget(),k=B/s,dx=(t.x+t.w/2)-(r.left+r.width/2),dy=(t.y+t.h/2)-(r.top+r.height/2);
 shade.hidden=false;state='big';
 if(!RM.matches){A(shade,[{opacity:0},{opacity:1}],{duration:360,easing:'ease'});
  await A(c,[{transform:'translate(0px,0px) scale(1)',easing:'cubic-bezier(.3,0,.2,1)'},{transform:`translate(${dx}px,${dy}px) scale(${k*1.045})`,offset:.72,easing:'cubic-bezier(.4,0,.3,1)'},{transform:`translate(${dx}px,${dy}px) scale(${k*.99})`,offset:.88,easing:'ease-in-out'},{transform:`translate(${dx}px,${dy}px) scale(${k})`}],{duration:560});
  placeBig(c);spark(t.x+t.w/2,t.y+t.h/2,12,t.w*.62,700);
 }else{await A(c,[{opacity:1},{opacity:0}],{duration:120});placeBig(c);A(shade,[{opacity:0},{opacity:1}],{duration:200});await A(c,[{opacity:0},{opacity:1}],{duration:200})}
 acts.hidden=false;live.textContent=SITES[n][1];
 await A(acts,[{opacity:0,transform:RM.matches?'none':'translateY(10px)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.8,.3,1)'});
 busy=false;go.focus({preventScroll:true})}
async function drawAgain(){if(busy||state!=='big')return;busy=true;const c=cur;
 await A(acts,[{opacity:1},{opacity:0}],{duration:140,easing:'ease'});acts.hidden=true;
 const d=rect(deck),tw=100*s,th=140*s,tl=d.left,tt=d.top-Math.floor((N-1)/2)*s,t=bigTarget(),k=s/B,dx=(tl+tw/2)-(t.x+t.w/2),dy=(tt+th/2)-(t.y+t.h/2);
 A(shade,[{opacity:1},{opacity:0}],{duration:300,easing:'ease'}).then(()=>shade.hidden=true);
 if(!RM.matches)await A(c,[{transform:'translate(0px,0px) scale(1)'},{transform:`translate(${dx}px,${dy}px) scale(${k})`}],{duration:380,easing:'cubic-bezier(.5,0,.25,1)'});
 else await A(c,[{opacity:1},{opacity:0}],{duration:160});
 // back into the deck as the top card, face up, then turn it face down
 c.style.removeProperty('--cs');c.style.left='';c.style.top='';deck.appendChild(c);c.style.zIndex=N-1;
 if(!RM.matches){c.classList.remove('up');
  await A(c,[{transform:ST(N-1)+' rotateY(180deg)'},{transform:ST(N-1)+' rotateY(-6deg)',offset:.8},{transform:ST(N-1)+' rotateY(0deg)'}],{duration:340,easing:'cubic-bezier(.45,0,.3,1)'});
 }else{c.classList.remove('up');c.style.transform=ST(N-1);await A(c,[{opacity:0},{opacity:1}],{duration:160})}
 c.querySelector('.fc').removeAttribute('src');
 state='deck';busy=false;draw()}
box.addEventListener('click',openBox);deckhit.addEventListener('click',draw);shuf.addEventListener('click',draw);again.addEventListener('click',drawAgain);
addEventListener('keydown',e=>{if(e.key==='Escape'&&state==='big')drawAgain()});
addEventListener('resize',layout);layout();
})();

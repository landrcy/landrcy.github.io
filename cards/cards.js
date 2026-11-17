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
$('sites').innerHTML=SITES.map(p=>`<a href="${p[2]}">${p[1]}</a>`).join('');
// preload every face so swapping the top card's face is instant
const FACE=SITES.map(p=>{const i=new Image();i.src='img/'+p[0]+'.png?v=4';return i});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function A(el,kf,o){const a=el.animate(kf,Object.assign({fill:'forwards'},o));return a.finished.then(()=>{try{a.commitStyles()}catch(e){}a.cancel()},()=>{})}
let s=1.8,p=1,B=2,vw=0,vh=0,tx0=0,ty0=0;
// ---- cards (identical backs; only the top card's face matters, assigned after each shuffle) ----
const stack=[];
for(let i=0;i<N;i++){const c=document.createElement('div');c.className='card';c.innerHTML='<img class="px bk" src="img/back.png?v=3" alt=""><img class="px fc" alt="">';deck.appendChild(c);stack.push(c)}
const ST=k=>`translate(0px,${-Math.round(Math.floor(k/2)*s)}px)`;
function restack(){stack.forEach((c,k)=>{c.style.zIndex=k;c.style.transform=ST(k)})}
function layout(){vw=innerWidth;vh=innerHeight;
 p=(vh>=1100&&vw>=900)?2:1;s=1.8*p;
 B=Math.max(1,Math.min(3,Math.floor((vw-24)/180),Math.floor((vh-150)/252)));
 document.body.style.setProperty('--s',s);document.body.style.setProperty('--p',p);
 const tw=208*p,th=288*p,gap=70;
 tx0=Math.round((vw-tw)/2);ty0=Math.max(56,Math.round((vh-th-gap)/2));
 table.style.left=tx0+'px';table.style.top=ty0+'px';table.style.transform='none';
 shuf.style.top=(ty0+th+20)+'px';
 if(!busy&&state!=='big')restack();
 if(state==='big'&&cur)placeBig(cur,false);
}
let busy=false,state='box',cur=null,last=-1;
Mech.init(document.getElementById('mech'),6);
// ---- open the box: the clockwork lock and the split (mech.js) ----
function rect(el){return el.getBoundingClientRect()}
async function openBox(){if(busy||state!=='box')return;busy=true;box.disabled=true;
 if(RM.matches){A(floor,[{opacity:1},{opacity:0}],{duration:320,easing:'ease'});await A(box,[{opacity:1},{opacity:0}],{duration:320,easing:'ease'});finishOpen();return}
 await Mech.open();
 const mech=document.getElementById('mech'),t1=performance.now(),chunks=Crumble.prep({mech,floor,deck,p});
 await wait(Math.max(0,140-(performance.now()-t1)));
 // the open box takes the strain for a moment (1px knock), then breaks apart around the deck (crumble.js)
 await A(box,[{transform:'translate(0,0)'},{transform:`translate(${-p}px,0)`},{transform:`translate(${p}px,0)`},{transform:'translate(0,0)'}],{duration:90,easing:'steps(3,end)'});
 await Crumble.run(chunks,{floor,deck,p,onFirst(){box.style.visibility='hidden';floor.style.visibility='hidden'}});
 finishOpen()}
function finishOpen(){
 // the box and its bed are gone for good (display:none: .px sets display:block, which would beat the hidden attribute)
 box.hidden=floor.hidden=true;box.style.display=floor.style.display='none';deck.style.transform='';deck.style.zIndex=2;restack();state='deck';deckhit.hidden=false;shuf.hidden=false;
 A(shuf,[{opacity:0,transform:'translate(-50%,8px)'},{opacity:1,transform:'translate(-50%,0)'}],{duration:260,easing:'cubic-bezier(.2,.8,.3,1)'}).then(()=>{shuf.style.transform=''});
 busy=false;shuf.focus({preventScroll:true})}
// ---- riffle shuffle ----
function pickNext(){let n;do n=Math.floor(Math.random()*N);while(n===last&&N>1);return n}
// ---- shuffles: six different hand shuffles, picked at random, never the same one twice running ----
// every card is the same pixel card back; each shuffle really reorders `stack`, and ends with the deck squared (restack)
const hk=k=>-Math.round(Math.floor(k/2)*s);                       // a card's lift in a squared pile (the stacked edge)
const PT=(x,y,r,k)=>`translate(${Math.round(x)}px,${Math.round(y)+hk(k)}px) rotate(${r}deg)`;
const R0=k=>PT(0,0,0,k);
const rnd=(a,b)=>a+Math.random()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1));
const span=()=>Math.min(Math.round(54*s),Math.floor((vw-180*p)/2)-10);
// a pile of cards moving together (each keeps its place in the pile)
const movePile=(cs,from,to,o)=>Promise.all(cs.map((c,j)=>A(c,[{transform:from(j)},{transform:to(j)}],o)));
// split the stack into packets of a..b cards, from the top down
function packets(a,b){const P=[];let i=N;while(i>0){const n=Math.min(i,ri(a,b));P.push(stack.slice(i-n,i));i-=n}return P}
async function squareUp(){await A(deck,[{transform:'scale(1,1)'},{transform:'scale(.98,1.015)',offset:.4},{transform:'scale(1,1)'}],{duration:170,easing:'ease-out'})}

// 1. riffle with a bridge: two halves, interleave, the cards bow up into a bridge and cascade flat
async function riffle(){
 const dx=span(),L=stack.slice(0,7),R=stack.slice(7);
 const halfT=(side,j)=>`translate(${side*dx}px,${-8*s-Math.floor(j/2)*s}px) rotate(${side*6}deg)`;
 await Promise.all([...L.map((c,j)=>A(c,[{transform:ST(j)+' rotate(0deg)'},{transform:halfT(-1,j)}],{duration:230,delay:j*6,easing:'cubic-bezier(.3,0,.15,1)'})),
  ...R.map((c,j)=>A(c,[{transform:ST(7+j)+' rotate(0deg)'},{transform:halfT(1,j)}],{duration:230,delay:j*6,easing:'cubic-bezier(.3,0,.15,1)'}))]);
 await Promise.all([...L.map((c,j)=>A(c,[{transform:halfT(-1,j)},{transform:halfT(-1,j)+` translate(${4*s}px,${-2*s}px) rotate(3deg)`}],{duration:110,easing:'ease-in-out'})),
  ...R.map((c,j)=>A(c,[{transform:halfT(1,j)},{transform:halfT(1,j)+` translate(${-4*s}px,${-2*s}px) rotate(-3deg)`}],{duration:110,easing:'ease-in-out'}))]);
 const out=[],side=[],l=L.slice(),r=R.slice(),fl=[];
 for(let n=0;n<N;n++){const fromL=l.length&&(!r.length||Math.random()<l.length/(l.length+r.length)),c=fromL?l.pop():r.pop(),sd=fromL?-1:1,j=(fromL?l.length:r.length);
  out.push(c);side.push(sd);const t=n*28;
  // the interleaved halves stay a little apart and tilted up toward each other (the bridge)
  fl.push(wait(t).then(()=>{c.style.zIndex=100+n;
   return A(c,[{transform:halfT(sd,j)+` translate(${-sd*4*s}px,${-2*s}px) rotate(${-sd*3}deg)`},{transform:PT(sd*dx*.22,-6*s,-sd*5,n)}],{duration:220,easing:'cubic-bezier(.35,0,.25,1)'})}))}
 await Promise.all(fl);
 // bridge: the halves bow up in the middle...
 await Promise.all(out.map((c,n)=>A(c,[{transform:PT(side[n]*dx*.22,-6*s,-side[n]*5,n)},{transform:PT(side[n]*dx*.16,-11*s,-side[n]*11,n)}],{duration:170,easing:'cubic-bezier(.4,0,.3,1)'})));
 // ...and let go: the cards cascade down flat, bottom first
 await Promise.all(out.map((c,n)=>A(c,[{transform:PT(side[n]*dx*.16,-11*s,-side[n]*11,n)},{transform:PT(0,1*s,side[n]*.5,n),offset:.8},{transform:R0(n)}],{duration:240,delay:n*20,easing:'cubic-bezier(.5,0,.6,1)'})));
 stack.length=0;stack.push(...out);restack();await squareUp()}

// 2. overhand: the deck is held to one side and packets are peeled off its top in arcs onto a new pile
async function overhand(){
 const dx=span(),P=packets(2,4),hold=k=>PT(dx*.62,-5*s,5,k),pile=k=>PT(-dx*.45,0,-2,k);
 await Promise.all(stack.map((c,k)=>A(c,[{transform:R0(k)},{transform:hold(k)}],{duration:260,delay:(N-k)*4,easing:'cubic-bezier(.3,0,.2,1)'})));
 const out=[],fl=[];let t=0;
 for(const pk of P){const base=out.length;out.push(...pk);const st=t;
  fl.push(wait(st).then(()=>{pk.forEach((c,j)=>c.style.zIndex=300+base+j);
   const k0=N-pk.length;return Promise.all(pk.map((c,j)=>A(c,[{transform:hold(k0+j)},{transform:PT(dx*.1,-16*s,-1,base+j),offset:.45},{transform:pile(base+j)}],{duration:250,easing:'cubic-bezier(.4,0,.4,1)'})))}));
  t+=175+rnd(-20,25)}
 await Promise.all(fl);
 await Promise.all(out.map((c,k)=>A(c,[{transform:pile(k)},{transform:R0(k)}],{duration:240,easing:'cubic-bezier(.3,0,.2,1)'})));
 stack.length=0;stack.push(...out);restack();await squareUp()}

// 3. Hindu: the deck is held up high; small packets are pulled off its top and drop straight down onto the pile below
async function hindu(){
 const P=packets(1,3),up=Math.min(44*s,ty0-8),hold=k=>PT(3*s,-up,4,k),pile=k=>PT(-2*s,6*s,-1,k);
 await Promise.all(stack.map((c,k)=>A(c,[{transform:R0(k)},{transform:hold(k)}],{duration:260,easing:'cubic-bezier(.3,0,.2,1)'})));
 const out=[],fl=[];let t=0;
 for(const pk of P){const base=out.length;out.push(...pk);const st=t,wob=rnd(-4,4)*s;
  fl.push(wait(st).then(()=>{pk.forEach((c,j)=>c.style.zIndex=300+base+j);
   const k0=N-pk.length;return Promise.all(pk.map((c,j)=>A(c,[{transform:hold(k0+j)},{transform:PT(wob*.5,-up*.45,2+wob*.3,base+j),offset:.35},{transform:PT(wob,6*s+3*p,wob*.5-1,base+j),offset:.8},{transform:pile(base+j)}],{duration:210,easing:'cubic-bezier(.5,0,.75,.6)'})))}));
  t+=118+rnd(-15,20)}
 await Promise.all(fl);
 await Promise.all(out.map((c,k)=>A(c,[{transform:pile(k)},{transform:R0(k)}],{duration:200,easing:'cubic-bezier(.3,0,.2,1)'})));
 stack.length=0;stack.push(...out);restack();await squareUp()}

// 4. triple cut: top and middle packets are slid out left and right, then the deck is gathered back in a new order
async function cut(){
 const dx=span(),a=ri(3,5),b=ri(a+3,a+6),Abot=stack.slice(0,a),Bmid=stack.slice(a,b),Ctop=stack.slice(b);
 const arc=(cs,base0,x0,base1,x1,r,o)=>Promise.all(cs.map((c,j)=>A(c,[{transform:PT(x0,0,0,base0+j)},{transform:PT((x0+x1)/2,-14*s,r,Math.max(base0,base1)+j),offset:.5},{transform:PT(x1,0,0,base1+j)}],o)));
 Ctop.forEach(c=>c.style.zIndex=300);Bmid.forEach(c=>c.style.zIndex=200);
 // the top packet out to the left, then the middle one out to the right
 const p1=arc(Ctop,b,0,0,-dx*.9,-6,{duration:300,easing:'cubic-bezier(.4,0,.3,1)'});
 await wait(110);await arc(Bmid,a,0,0,dx*.9,6,{duration:300,easing:'cubic-bezier(.4,0,.3,1)'});await p1;
 // gather: the bottom packet onto the left one, then the right one on top of both
 Abot.forEach((c,j)=>c.style.zIndex=400+j);
 await arc(Abot,0,0,Ctop.length,-dx*.9,-4,{duration:280,easing:'cubic-bezier(.4,0,.3,1)'});
 Bmid.forEach((c,j)=>c.style.zIndex=500+j);
 await arc(Bmid,0,dx*.9,Ctop.length+Abot.length,-dx*.9,-8,{duration:320,easing:'cubic-bezier(.4,0,.3,1)'});
 const out=[...Ctop,...Abot,...Bmid];
 await Promise.all(out.map((c,k)=>A(c,[{transform:PT(-dx*.9,0,0,k)},{transform:R0(k)}],{duration:240,easing:'cubic-bezier(.3,0,.2,1)'})));
 stack.length=0;stack.push(...out);restack();await squareUp()}

// 5. spring: the deck is squeezed in one hand and the cards spring one at a time in an arc into the other
async function spring(){
 const dx=span(),xl=-dx*.72,xr=dx*.72,hold=k=>PT(xl,0,-4,k),pile=k=>PT(xr,0,3,k),H=Math.min(58*s,ty0);
 await Promise.all(stack.map((c,k)=>A(c,[{transform:R0(k)},{transform:hold(k)}],{duration:240,easing:'cubic-bezier(.3,0,.2,1)'})));
 const src=stack.slice(),out=[],fl=[];
 for(let n=0;n<N;n++){const c=src[N-1-n];out.push(c);const k0=N-1-n,k1=n;
  // a parabola from hand to hand, sampled so the card really travels on the arc
  const kf=[];for(let i=0;i<=8;i++){const u=i/8;kf.push({transform:PT(xl+(xr-xl)*u,-H*4*u*(1-u),-4+7*u+Math.sin(u*Math.PI)*-10,Math.round(k0+(k1-k0)*u))})}
  fl.push(wait(n*52).then(()=>{c.style.zIndex=300+n;return A(c,kf,{duration:360,easing:'linear'})}))}
 await Promise.all(fl);
 await Promise.all(out.map((c,k)=>A(c,[{transform:pile(k)},{transform:R0(k)}],{duration:240,easing:'cubic-bezier(.3,0,.2,1)'})));
 stack.length=0;stack.push(...out);restack();await squareUp()}

// 6. fan: the deck spreads into a fan around a pivot below it, then the cards are swept back in, in a new order
async function fan(){
 const Rv=150*p;let am=26;
 const fit=a=>{const r=a*Math.PI/180;return Rv*Math.sin(r)+90*p*Math.cos(r)+126*p*Math.sin(r)<=vw/2-8};while(am>8&&!fit(am))am-=1;
 const FT=(a,k)=>`translate(0px,${Rv+hk(k)}px) rotate(${a}deg) translate(0px,${-Rv}px)`,ang=k=>-am+2*am*k/(N-1);
 await Promise.all(stack.map((c,k)=>A(c,[{transform:FT(0,k)},{transform:FT(ang(k)*1.04,k),offset:.85},{transform:FT(ang(k),k)}],{duration:460,delay:k*8,easing:'cubic-bezier(.3,0,.2,1)'})));
 await wait(160);
 // sweep them in: each card slides from its slot onto the pile, in a random order
 const order=stack.map((c,k)=>k).sort(()=>Math.random()-.5),out=[],fl=[];
 order.forEach((k,n)=>{const c=stack[k];out.push(c);fl.push(wait(n*42).then(()=>{c.style.zIndex=300+n;
  return A(c,[{transform:FT(ang(k),k)},{transform:FT(ang(k)*.2,n)+` translate(0px,${-6*s}px)`,offset:.6},{transform:FT(0,n)}],{duration:280,easing:'cubic-bezier(.4,0,.3,1)'})}))});
 await Promise.all(fl);
 stack.length=0;stack.push(...out);restack();await squareUp()}

const SHUFFLES={riffle,overhand,hindu,cut,spring,fan},SK=Object.keys(SHUFFLES);let lastShuf='';
const forced=new URLSearchParams(location.search).get('shuffle');
async function shuffle(){
 if(RM.matches){// reduced motion: a quick dip, and the deck is still really shuffled
  await A(deck,[{opacity:1},{opacity:.35}],{duration:160,easing:'ease'});
  for(let i=N-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[stack[i],stack[j]]=[stack[j],stack[i]]}restack();
  await A(deck,[{opacity:.35},{opacity:1}],{duration:160,easing:'ease'});return}
 let k;if(SHUFFLES[forced])k=forced;else do k=SK[Math.floor(Math.random()*SK.length)];while(k===lastShuf);
 lastShuf=k;deck.dataset.shuffle=k;await SHUFFLES[k]()}
// ---- flip the top card, then pop it up big ----
function bigTarget(){const w=180*B,h=252*B,acth=64;return{w,h,x:Math.round((vw-w)/2),y:Math.max(58,Math.round((vh-h-acth)/2))}}
function placeBig(c,anim){const t=bigTarget();c.style.setProperty('--cs',B);c.style.left=t.x+'px';c.style.top=t.y+'px';c.style.transform='none';acts.style.top=(t.y+t.h+22)+'px'}
async function draw(){if(busy||state!=='deck')return;busy=true;deckhit.disabled=true;shuf.disabled=true;
 A(shuf,[{opacity:1},{opacity:.35}],{duration:160});
 await shuffle();
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
 const t=bigTarget(),k=B/p,dx=(t.x+t.w/2)-(r.left+r.width/2),dy=(t.y+t.h/2)-(r.top+r.height/2);
 shade.hidden=false;state='big';
 if(!RM.matches){A(shade,[{opacity:0},{opacity:1}],{duration:360,easing:'ease'});
  await A(c,[{transform:'translate(0px,0px) scale(1)',easing:'cubic-bezier(.3,0,.2,1)'},{transform:`translate(${dx}px,${dy}px) scale(${k*1.045})`,offset:.72,easing:'cubic-bezier(.4,0,.3,1)'},{transform:`translate(${dx}px,${dy}px) scale(${k*.99})`,offset:.88,easing:'ease-in-out'},{transform:`translate(${dx}px,${dy}px) scale(${k})`}],{duration:560});
  placeBig(c);
 }else{await A(c,[{opacity:1},{opacity:0}],{duration:120});placeBig(c);A(shade,[{opacity:0},{opacity:1}],{duration:200});await A(c,[{opacity:0},{opacity:1}],{duration:200})}
 acts.hidden=false;live.textContent=SITES[n][1];
 await A(acts,[{opacity:0,transform:RM.matches?'none':'translateY(10px)'},{opacity:1,transform:'none'}],{duration:240,easing:'cubic-bezier(.2,.8,.3,1)'});
 busy=false;go.focus({preventScroll:true})}
async function drawAgain(){if(busy||state!=='big')return;busy=true;const c=cur;
 await A(acts,[{opacity:1},{opacity:0}],{duration:140,easing:'ease'});acts.hidden=true;
 const d=rect(deck),tw=180*p,th=252*p,tl=d.left,tt=d.top-Math.round(Math.floor((N-1)/2)*s),t=bigTarget(),k=p/B,dx=(tl+tw/2)-(t.x+t.w/2),dy=(tt+th/2)-(t.y+t.h/2);
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

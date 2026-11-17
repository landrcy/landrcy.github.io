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
 await wait(220);
 // the open box steps back and leaves the deck where it sat
 A(box,[{opacity:1},{opacity:0}],{duration:480,easing:'ease-in'});
 await A(floor,[{opacity:1},{opacity:0}],{duration:520,delay:60,easing:'ease-in'});
 finishOpen()}
function finishOpen(){box.hidden=true;floor.hidden=true;deck.style.transform='';deck.style.zIndex=2;deck.style.setProperty('--sh',1);restack();state='deck';deckhit.hidden=false;shuf.hidden=false;
 A(shuf,[{opacity:0,transform:'translate(-50%,8px)'},{opacity:1,transform:'translate(-50%,0)'}],{duration:260,easing:'cubic-bezier(.2,.8,.3,1)'}).then(()=>{shuf.style.transform=''});
 busy=false;shuf.focus({preventScroll:true})}
// ---- riffle shuffle ----
function pickNext(){let n;do n=Math.floor(Math.random()*N);while(n===last&&N>1);return n}
async function riffle(){
 if(RM.matches){await A(deck,[{opacity:1},{opacity:.35}],{duration:160,easing:'ease'});await A(deck,[{opacity:.35},{opacity:1}],{duration:160,easing:'ease'});return}
 const dx=Math.min(Math.round(54*s),Math.floor((vw-180*p)/2)-10),L=stack.slice(0,7),R=stack.slice(7);
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
function bigTarget(){const w=180*B,h=252*B,acth=64;return{w,h,x:Math.round((vw-w)/2),y:Math.max(58,Math.round((vh-h-acth)/2))}}
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

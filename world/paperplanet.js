// V41 FFC only: crumpled paper-ball planet (Finley's Sticky Board site) with pixel sticky notes + meme stickers from that site orbiting it.
// Click flies the galaxy camera to it (title + play), hover shows a tip. Main hub never builds it.
(()=>{if(!window.__FFC)return;
const PB_W=1100,K=1.9,N=320,PR=80,RM=matchMedia('(prefers-reduced-motion: reduce)').matches,A='world/assets/paperball/';
const c=document.createElement('canvas');c.width=c.height=N;c.id='pbplanet';c.tabIndex=0;c.setAttribute('role','link');c.setAttribute('aria-label','Sticky Board paper planet - play');
c.style.cssText='position:absolute;left:0;top:0;z-index:3;image-rendering:pixelated;display:none;touch-action:none;will-change:transform';
const g=c.getContext('2d');g.imageSmoothingEnabled=false;
const ld=s=>{const i=new Image();i.src=A+s+'?v=41';return i};
const ball=ld('paperball-planet.png');
const memes=['doge','cheems','pog','sadcat','kekw','gigachad','maxwell','hamster'].map(n=>ld('meme-'+n+'.png'));
const notes=[0,1,2,3,4,5,6,7].map(n=>ld('note-'+n+'.png'));
// two tilted rings: inner sticky notes, outer memes
const items=[];
notes.forEach((im,k)=>items.push({im,r:PR+26,a:k/8*Math.PI*2,sp:.32,tilt:.38,sp2:1.3+k*.2,ph:k}));
memes.forEach((im,k)=>items.push({im,r:PR+58,a:k/8*Math.PI*2+.4,sp:-.2,tilt:.3,sp2:.9+k*.15,ph:k*2}));
function paint(t){g.clearRect(0,0,N,N);const cx=N/2,cy=N/2,list=items.map(o=>{const a=o.a+(RM?0:t*o.sp);return{o,x:cx+Math.cos(a)*o.r,y:cy+Math.sin(a)*o.r*o.tilt-Math.cos(a)*o.r*.12,z:Math.sin(a)}});
 const draw=p=>{const im=p.o.im;if(!im.complete||!im.naturalWidth)return;const s=.85+.25*(p.z+1)/2,w=Math.round(im.naturalWidth*s),h=Math.round(im.naturalHeight*s);
  g.save();g.translate(Math.round(p.x),Math.round(p.y));if(!RM)g.rotate(Math.round(Math.sin(t*p.o.sp2+p.o.ph)*2)/16);g.globalAlpha=p.z<0?.75:1;g.drawImage(im,-w>>1,-h>>1,w,h);g.restore()};
 list.filter(p=>p.z<0).sort((a,b)=>a.z-b.z).forEach(draw);
 if(ball.complete&&ball.naturalWidth){const bob=RM?0:Math.round(Math.sin(t*.8)*2);g.drawImage(ball,cx-PR,cy-PR+bob,PR*2,PR*2)}
 list.filter(p=>p.z>=0).sort((a,b)=>a.z-b.z).forEach(draw)}
const tipOn=(on,e)=>{const t=document.getElementById('tip');if(!t)return;const L='Sticky Board · Finley Chang';if(on){if(t.textContent!==L||!t.classList.contains('on'))window.__blip&&__blip('hover');t.textContent=L;t.style.left=(e.clientX+14)+'px';t.style.top=(e.clientY+14)+'px';t.classList.add('on')}else if(t.textContent===L)t.classList.remove('on')};
const onBall=e=>{const r=c.getBoundingClientRect();return Math.hypot((e.clientX-r.left)/r.width*N-N/2,(e.clientY-r.top)/r.height*N-N/2)<PR*1.05};
let down=null;
c.addEventListener('pointermove',e=>{if(onBall(e)){c.style.cursor='pointer';tipOn(1,e)}else{c.style.cursor='';tipOn(0)}});
c.addEventListener('pointerleave',()=>tipOn(0));
c.addEventListener('pointerdown',e=>{if(onBall(e)){down=[e.clientX,e.clientY];e.stopPropagation()}});
c.addEventListener('pointerup',e=>{if(down){e.stopPropagation();if(Math.hypot(e.clientX-down[0],e.clientY-down[1])<8&&window.__galPB)window.__galPB()}down=null});
c.addEventListener('click',e=>{if(onBall(e))e.stopPropagation()});
c.addEventListener('wheel',e=>{const s=document.getElementById('gsky');if(s){e.preventDefault();s.dispatchEvent(new WheelEvent('wheel',e))}},{passive:false});
c.addEventListener('keydown',e=>{if(e.key==='Enter'&&window.__galPB)window.__galPB()});
let last=0;
function frame(ms){const v=window.__galView&&window.__galView(),gal=document.getElementById('galaxy');
 if(!v||!gal||!v.inGal||!v.pb){c.style.display='none';return requestAnimationFrame(frame)}
 if(c.parentNode!==gal)gal.appendChild(c);
 const z=v.cam.z,s=Math.max(2,Math.round(PB_W*K*z)),x=(v.pb[0]-v.cam.x)*z+v.GW/2,y=(v.pb[1]-v.cam.y)*z+v.GH/2;
 c.style.zIndex=v.pbZ;c.style.width=c.style.height=s+'px';c.style.transform='translate('+Math.round(x-s/2)+'px,'+Math.round(y-s/2)+'px)';
 c.style.display=(x<-s||y<-s||x>v.GW+s||y>v.GH+s)?'none':'';
 if(c.style.display!=='none'&&(ms-last>50||!last)){last=ms;paint(ms/1000)}
 requestAnimationFrame(frame)}
requestAnimationFrame(frame)})();

(()=>{const P=window.PLANETS,A=window.__ARCH;if(!P||!A)return;
const m=document.createElement('section');m.id='museum';m.setAttribute('aria-label','Archive space museum');
m.innerHTML='<canvas id="mbg" aria-hidden="true"></canvas><h1 class="mtitle">Archive Museum</h1><div class="mhall"></div>';
document.body.appendChild(m);const hall=m.querySelector('.mhall'),thumbs=[];
for(const b of A){const a=document.createElement('a');a.className='case';a.href=b.href;if(/^https?:/.test(b.href)){a.target='_blank';a.rel='noopener'}
 a.innerHTML='<span class="glass"></span><span class="ped"></span><span class="plq"></span>';a.querySelector('.plq').textContent=b.title;const gl=a.querySelector('.glass');
 if(/^(oldhub|v-)/.test(b.id)){const i=new Image();i.src='world/titles/'+b.id+'.png';i.alt='';i.className='mlogo';gl.appendChild(i)}
 else{const S=P.mk(48,48);S.c.className='mlogo px';gl.appendChild(S.c);thumbs.push([S,b.paint])}
 hall.appendChild(a)}
const bg=m.querySelector('#mbg'),x=bg.getContext('2d');let st=[],t0=performance.now(),lt=0;
function size(){const w=Math.ceil(innerWidth/4),h=Math.ceil(innerHeight/4);bg.width=w;bg.height=h;st=Array.from({length:60},()=>({x:Math.random()*w,y:Math.random(),s:.2+Math.random()*.8}))}
addEventListener('resize',size);size();
function draw(now){requestAnimationFrame(draw);if(!document.body.classList.contains('arch'))return;if(now-lt<50)return;lt=now;const t=(now-t0)/1000,w=bg.width,h=bg.height;
 x.fillStyle='#0b0d16';x.fillRect(0,0,w,h);
 const wy=Math.round(h*.08),wh=Math.round(h*.26),n=Math.max(2,Math.round(w/60)),ww=Math.floor(w/n);
 for(let i=0;i<n;i++){const X=i*ww+4,Wd=ww-8;x.fillStyle='#000';x.fillRect(X,wy,Wd,wh);
  for(const s of st){const sx=((s.x-t*6*s.s)%w+w)%w;if(sx>=X&&sx<X+Wd){x.fillStyle=s.s>.7?'#fff':'#8890c0';x.fillRect(Math.floor(sx),wy+Math.floor(s.y*wh),1,1)}}
  x.strokeStyle='#3a4058';x.lineWidth=2;x.strokeRect(X,wy,Wd,wh);x.fillStyle='#2a2e40';x.fillRect(X+Wd/2-1,wy,2,wh)}
 x.fillStyle='#161a28';x.fillRect(0,wy+wh+2,w,2);
 for(let y=Math.round(h*.62);y<h;y+=4)for(let X=(y/4)%2*4;X<w;X+=8){x.fillStyle='#141824';x.fillRect(X,y,4,4)}
 x.fillStyle='#1c2132';x.fillRect(0,Math.round(h*.62),w,1);
 for(let i=0;i<n*2;i++){const on=Math.sin(t*2+i*1.7)>.3;x.fillStyle=on?(i%3?'#ff5a3a':'#5affb0'):'#2a1a1a';x.fillRect(Math.round((i+.5)*w/(n*2)),wy-3,1,1)}
 for(const[S,p] of thumbs){P[p](S,t);if(P.reduce)P.reduce(S,8)}}
requestAnimationFrame(draw)})();

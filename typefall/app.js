(()=>{
const M=Matter,{Engine,Bodies,Body,Composite,Constraint,Mouse,MouseConstraint,Events,Query}=M;
const cv=document.getElementById('c'),cx=cv.getContext('2d');
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const FONT='"Times New Roman",Times,serif';
let W,H,DPR,ground=[],walls=[];
const engine=Engine.create({enableSleeping:true});const world=engine.world;
engine.positionIterations=10;engine.constraintIterations=8;
let letters=[],wells=[],ropes=[],balls=[],holes=[],water=false,wind=0,quake=0,slow=false,frozen=false,wordMode=false,magnet=null,booms=[];
let tool='drag';
const hintEl=document.getElementById('hint');
const TOOLS=[
['drag','drag','drag letters around'],['well','black hole','click to place a black hole; letters spiral in'],
['bomb','bomb','click to explode'],['hole','dig','click the ground to open a pit'],
['magnet','magnet','hold to pull letters toward the pointer'],['ball','wrecking ball','click to hang a wrecking ball'],
['build','build ▲','arrange text into a tower',1],['castle','castle','arrange text into a castle',1],
['bridge','bridge','string text into a rope bridge',1],['wind','wind','toggle wind',1],
['flip','flip gravity','',1],['zerog','zero-g','',1],['water','water','letters float',1],
['quake','earthquake','',1],['slow','slow motion','',1],['freeze','freeze','',1],['clear','clear','',1]];
const tb=document.getElementById('tools');const btn={};
TOOLS.forEach(([id,l,h,act])=>{const b=document.createElement('button');b.textContent=l;b.dataset.t=id;btn[id]=b;
 b.onclick=()=>{if(act)action(id);else{tool=id;upd();}hintEl.textContent=h||'';};tb.appendChild(b);});
function upd(){for(const k in btn)btn[k].classList.toggle('on',k===tool||(k==='wind'&&wind)||(k==='water'&&water)||(k==='slow'&&slow)||(k==='freeze'&&frozen)||(k==='zerog'&&engine.gravity.y===0)||(k==='flip'&&engine.gravity.y<0)||(k==='quake'&&quake>0));}
function top(){return document.querySelector('header').getBoundingClientRect().bottom;}
function resize(){DPR=Math.min(2,devicePixelRatio||1);W=innerWidth;H=innerHeight;cv.width=W*DPR;cv.height=H*DPR;cv.style.width=W+'px';cv.style.height=H+'px';cx.setTransform(DPR,0,0,DPR,0,0);buildGround();}
function buildGround(){Composite.remove(world,[...ground,...walls]);ground=[];walls=[];
 const gy=H-30;holes.sort((a,b)=>a.x-b.x);let x=-200;
 const segs=[];for(const h of holes){if(h.x-h.w/2>x)segs.push([x,h.x-h.w/2]);x=Math.max(x,h.x+h.w/2);}segs.push([x,W+200]);
 for(const[a,b]of segs)ground.push(Bodies.rectangle((a+b)/2,gy+30,b-a,60,{isStatic:true,label:'ground'}));
 walls.push(Bodies.rectangle(-30,H/2,60,H*4,{isStatic:true}),Bodies.rectangle(W+30,H/2,60,H*4,{isStatic:true}),Bodies.rectangle(W/2,-H*1.5-30,W*2,60,{isStatic:true}));
 Composite.add(world,[...ground,...walls]);}
const meas=document.createElement('canvas').getContext('2d');
function size(){return Math.max(22,Math.min(46,W/22));}
function makeBody(ch,x,y,fs){meas.font=fs+'px '+FONT;const m=meas.measureText(ch);
 const w=Math.max(4,m.actualBoundingBoxLeft+m.actualBoundingBoxRight),h=Math.max(4,m.actualBoundingBoxAscent+m.actualBoundingBoxDescent);
 const b=Bodies.rectangle(x,y,w+2,h+2,{friction:.6,restitution:.15,density:.002,chamfer:{radius:Math.min(w,h)/5}});
 b.ch=ch;b.fs=fs;b.ox=(m.actualBoundingBoxLeft-m.actualBoundingBoxRight)/2;b.oy=(m.actualBoundingBoxAscent-m.actualBoundingBoxDescent)/2;b.adv=m.width;b.bw=w;b.bh=h;return b;}
function addBody(b){letters.push(b);Composite.add(world,b);while(letters.length>400)removeL(letters[0]);}
function removeL(b){Composite.remove(world,b);letters.splice(letters.indexOf(b),1);ropes=ropes.filter(r=>{if(r.bodyA===b||r.bodyB===b){Composite.remove(world,r);return false}return true});}
function drop(text){window.lastText=text;const fs=size();meas.font=fs+'px '+FONT;let x=40,y=top()+40;
 const parts=wordMode?text.split(/(\s+)/):[...text];
 for(const p of parts){const w=meas.measureText(p).width;if(/^\s+$/.test(p)){x+=w;continue}
  if(x+w>W-30){x=40;y+=fs*1.1}const b=makeBody(p,x+w/2,y,fs);Body.setAngle(b,(Math.random()-.5)*.1);addBody(b);x+=w+2;}}
const inp=document.getElementById('t');let caret=null,idle=0;
function placeText(text,x0,y0){const fs=size();meas.font=fs+'px '+FONT;let x=x0;const parts=wordMode?text.split(/(\s+)/):[...text];
 for(const p of parts){const w=meas.measureText(p).width;if(!/^\s+$/.test(p)){const b=makeBody(p,x+w/2,y0-fs*.35,fs);addBody(b);}x+=w;}}
function commit(){clearTimeout(idle);if(inp.value.trim())window.lastText=inp.value;if(caret&&inp.value.trim())placeText(inp.value,caret.x,caret.y);inp.value='';caret=null;}
function startCaret(x,y){commit();caret={x,y};inp.style.left=x+'px';inp.style.top=y+'px';inp.focus({preventScroll:true});setTimeout(()=>inp.focus({preventScroll:true}),0);}
inp.addEventListener('input',()=>{if(!caret)caret={x:40,y:top()+60};clearTimeout(idle);idle=setTimeout(commit,2500);});
inp.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();commit();}if(e.key==='Escape'){inp.value='';caret=null;inp.blur();}});
addEventListener('keydown',e=>{if(document.activeElement!==inp&&e.key.length===1&&!e.metaKey&&!e.ctrlKey){if(!caret)startCaret(40,top()+60);}});
window.__drawCaret=()=>{if(!caret)return;const fs=size();cx.font=fs+'px '+FONT;cx.textAlign='left';const w=cx.measureText(inp.value).width;cx.fillStyle='#111';cx.fillText(inp.value,caret.x,caret.y);
 if((performance.now()/530|0)%2===0||RM)cx.fillRect(caret.x+w+1,caret.y-fs*.8,1.2,fs*.95);cx.textAlign='center';};
document.getElementById('words').onclick=e=>{wordMode=!wordMode;e.target.textContent=wordMode?'words':'letters';};
function textPool(){let s=letters.map(b=>b.ch).join('')||'';const iv=document.getElementById('t').value;if(!s.trim())s=iv||'TYPEFALL';return s.replace(/\s/g,'');}
function clearL(){[...letters].forEach(removeL);}
function action(id){const g=engine.gravity;
 if(id==='clear'){clearL();wells=[];bombs=[];splats=[];sparks=[];balls.forEach(b=>Composite.remove(world,[b,b.rope]));balls=[];holes=[];buildGround();wind=0;quake=0;water=false;slow=false;frozen=false;g.y=1;g.x=0;}
 if(id==='flip')g.y=g.y<0?1:-1; if(id==='zerog')g.y=g.y===0?1:0;
 if(id==='wind')wind=wind?0:1; if(id==='water')water=!water; if(id==='slow')slow=!slow;if(id==='freeze')frozen=!frozen;
 if(id==='quake')quake=quake>0?0:(RM?120:360);
 if(id==='build'||id==='castle')build(id);if(id==='bridge')bridge();upd();}
function build(kind){const s=textPool();clearL();const fs=Math.min(size(),34);const cw=fs*.8,ch=fs*1.0,gy=H-30;let i=0;const nxt=()=>s[i++%s.length];
 const place=(c,r)=>{const b=makeBody(nxt(),c,gy-r*ch-ch/2,fs);
  // square block for stability
  Composite.remove(world,b);const sq=Bodies.rectangle(c,gy-r*ch-ch/2,cw-1,ch-1,{friction:.9,restitution:0,density:.002});Object.assign(sq,{ch:b.ch,fs,ox:b.ox,oy:b.oy,bw:cw,bh:ch});addBody(sq);M.Sleeping.set(sq,true);};
 const n=Math.min(s.length*3,320);
 if(kind==='build'){const cols=Math.max(3,Math.min(7,Math.round(Math.sqrt(n/4))));const x0=W/2-cols*cw/2+cw/2;let r=0,k=0;
  while(k<n&&gy-(r+1)*ch>top()+20){const c=Math.max(1,cols-Math.floor(r/6));for(let j=0;j<c&&k<n;j++,k++)place(W/2-c*cw/2+cw/2+j*cw,r);r++;}}
 else{const span=Math.min(W-80,cw*24);const x0=W/2-span/2;const cols=Math.floor(span/cw);let k=0;
  for(let r=0;r<10;r++)for(let j=0;j<cols;j++){const tw=j<3||j>=cols-3,midT=Math.abs(j-cols/2)<2;
   let hgt=tw?10:midT?8:5; if(r===hgt-1&&j%2&&!tw)continue; if(r<hgt&&k++<n)place(x0+j*cw+cw/2,r);}}}
function bridge(){const fs=size();const s=textPool().slice(0,Math.floor(W*.7/(fs*.62)));clearL();const gapL=W*.15,gapR=W*.85;holes=[{x:W/2,w:gapR-gapL-60}];buildGround();
 const y=Math.max(top()+120,H*.5);const n=s.length,step=(gapR-gapL)/(n+1);let prev=null;
 const pinL={x:gapL,y},pinR={x:gapR,y};
 [...s].forEach((c,i)=>{const b=makeBody(c,gapL+step*(i+1),y,fs);Body.setDensity(b,.0008);addBody(b);
  const opts={stiffness:1,length:step*.9,render:{}};
  const con=prev?Constraint.create({bodyA:prev,bodyB:b,...opts}):Constraint.create({pointA:pinL,bodyB:b,...opts});con.maxF=.6;ropes.push(con);Composite.add(world,con);prev=b;});
 if(prev){const con=Constraint.create({bodyA:prev,pointB:pinR,stiffness:1,length:step*.9});con.maxF=.6;ropes.push(con);Composite.add(world,con);}
 hintEl.textContent='drag or drop things on the bridge — pull hard and it snaps';}
// pointer
const mouse=Mouse.create(cv);mouse.pixelRatio=1;
const mc=MouseConstraint.create(engine,{mouse,constraint:{stiffness:.2,render:{visible:false}}});Composite.add(world,mc);
let down=false,px=0,py=0;
cv.addEventListener('pointerdown',e=>{down=true;px=e.clientX;py=e.clientY;const p={x:px,y:py};
 if(tool==='drag'){if(!Query.point(letters,p).length&&!balls.some(b=>Query.point([b],p).length)){e.preventDefault();startCaret(px,py);}else commit();}
 else commit();
 if(tool==='well')wells.push({x:px,y:py,r:0,eaten:0,chars:[],disk:Array.from({length:RM?20:46},(_,i)=>({a:Math.random()*7,d:1.6+Math.random()*1.8,c:'abcdefghijklmnopqrstuvwxyz.,;*~'[Math.random()*31|0],s:.6+Math.random()*.6}))});
 if(tool==='bomb')bombClick(px,py);
 if(tool==='hole'){holes.push({x:px,w:Math.max(90,W*.14)});buildGround();}
 if(tool==='ball'){const b=Bodies.circle(px,py+140,Math.max(28,W/30),{density:.04,frictionAir:.002});const r=Constraint.create({pointA:{x:px,y:Math.max(top(),py-60)},bodyB:b,stiffness:.9});b.rope=r;balls.push(b);Composite.add(world,[b,r]);Body.setVelocity(b,{x:18,y:0});}});
addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY});addEventListener('pointerup',()=>down=false);
mc.constraint.stiffness=.2;Events.on(mc,'startdrag',e=>{if(tool!=='drag')mc.constraint.bodyB=null;});
function boom(x,y){for(const b of letters)M.Sleeping.set(b,false);booms.push({x,y,t:0});for(const b of letters){const dx=b.position.x-x,dy=b.position.y-y,d=Math.hypot(dx,dy)+1;if(d<260){const f=.06*b.mass*(1-d/260);Body.applyForce(b,b.position,{x:dx/d*f,y:dy/d*f});}}
 for(const r of [...ropes])if(Math.hypot((r.bodyB?.position.x||0)-x,(r.bodyB?.position.y||0)-y)<120){Composite.remove(world,r);ropes.splice(ropes.indexOf(r),1);}}
// ---------- black hole ----------
let sparks=[],splats=[],bombs=[],kabooms=[];
const lens=document.createElement('canvas'),lx=lens.getContext('2d');
function updWells(){for(const w of [...wells]){
 w.rot=(w.rot||0)+.03;
 if(w.r>=24&&!RM&&Math.random()<.25)sparks.push({x:w.x,y:w.y,a:Math.random()*7,v:2+Math.random()*3,t:0,c:'*·+'[Math.random()*3|0]});
 if(w.eaten>=180){wells.splice(wells.indexOf(w),1);const fs=size();
  for(const c of w.chars.slice(-160)){const b=makeBody(c,w.x+(Math.random()-.5)*20,w.y+(Math.random()-.5)*20,fs);addBody(b);const a=Math.random()*7,v=8+Math.random()*14;Body.setVelocity(b,{x:Math.cos(a)*v,y:Math.sin(a)*v});}
  booms.push({x:w.x,y:w.y,t:0});splats.push(mkSplat(w.x,w.y,60));}}
 sparks=sparks.filter(s=>{s.t++;return s.t<40});}
function drawWells(){for(const w of wells){const R=w.r+20,L=R*5;
 const S=Math.ceil(L*2*DPR);if(lens.width!==S){lens.width=S;lens.height=S;}
 lx.clearRect(0,0,S,S);lx.drawImage(cv,(w.x-L)*DPR,(w.y-L)*DPR,S,S,0,0,S,S);
 const E=R*1.6;
 for(let i=0;i<9;i++){const rr=L*(1-i/10);const beta=Math.max(2,rr-E*E/rr);const sc=Math.min(rr/beta,6);
  cx.save();cx.beginPath();cx.arc(w.x,w.y,rr,0,7);cx.clip();cx.fillStyle='#f7f2e7';cx.fill();
  cx.translate(w.x,w.y);cx.rotate(i*.05);cx.scale(sc,sc);cx.drawImage(lens,-L,-L,L*2,L*2);cx.restore();}
 const g=cx.createRadialGradient(w.x,w.y,R*.8,w.x,w.y,R*4);g.addColorStop(0,'rgba(17,17,17,.55)');g.addColorStop(.35,'rgba(60,40,20,.15)');g.addColorStop(1,'rgba(17,17,17,0)');
 cx.fillStyle=g;cx.beginPath();cx.arc(w.x,w.y,R*4,0,7);cx.fill();
 cx.save();cx.translate(w.x,w.y);cx.scale(1,.38);
 cx.strokeStyle='#111';for(let k=0;k<5;k++){cx.globalAlpha=.25+.12*k;cx.lineWidth=.6+k*.3;cx.beginPath();const rr=R*(1.5+k*.35);cx.arc(0,0,rr,w.rot*(1+k*.2)+k,w.rot*(1+k*.2)+k+2.4);cx.stroke();}
 cx.globalAlpha=1;cx.fillStyle='#111';cx.textAlign='center';
 for(const p of w.disk){p.a+=.05/p.d;const rr=R*p.d;const x=Math.cos(p.a)*rr,y=Math.sin(p.a)*rr;cx.font=(8+R*.18)*p.s+'px '+FONT;cx.save();cx.translate(x,y);cx.scale(1,2.6);cx.rotate(p.a+1.57);cx.globalAlpha=y<0?.45:.95;cx.fillText(p.c,0,0);cx.restore();}
 cx.restore();cx.globalAlpha=1;
 cx.fillStyle='#0b0b0b';cx.beginPath();cx.arc(w.x,w.y,R,0,7);cx.fill();
 cx.save();cx.shadowColor='rgba(180,130,60,.9)';cx.shadowBlur=12;cx.strokeStyle='#e9dcc0';cx.lineWidth=1.4;cx.beginPath();cx.arc(w.x,w.y,R*1.12,0,7);cx.stroke();cx.restore();
 cx.save();cx.translate(w.x,w.y);cx.scale(1,.38);cx.strokeStyle='#111';cx.lineWidth=1.5;cx.beginPath();cx.arc(0,0,R*1.7,.1,3.04);cx.stroke();cx.restore();}
 cx.fillStyle='#111';cx.font='14px '+FONT;for(const s of sparks){cx.globalAlpha=1-s.t/40;cx.fillText(s.c,s.x+Math.cos(s.a)*s.v*s.t,s.y+Math.sin(s.a)*s.v*s.t);}cx.globalAlpha=1;}
// ---------- bomb ----------
function mkSplat(x,y,r){return{x,y,r,blobs:Array.from({length:14},()=>({a:Math.random()*7,d:Math.random()*r*1.4,s:3+Math.random()*r*.25})),t:0};}
function bombClick(x,y){for(const b of bombs){if(!b.lit&&Math.hypot(x-b.x,y-b.y)<b.R*2+20){b.lit=true;b.burn=0;return;}}
 const txt=(inp.value.trim()||window.lastText||'BOMB').replace(/\s+/g,'');inp.value='';caret=null;
 const fs=Math.max(16,size()*.6),words=(window.lastText||'tick tock').trim().split(/\s+/);
 const R=Math.max(40,Math.min(110,Math.sqrt(Math.max(txt.length,30))*fs*.55));const pts=[];
 for(let r=0;r<R;r+=fs*.9){const n=Math.max(1,Math.floor(2*Math.PI*r/(fs*.7)));for(let i=0;i<n;i++)pts.push({x:Math.cos(i/n*6.283)*r,y:Math.sin(i/n*6.283)*r});}
 const cells=pts.map((p,i)=>({...p,c:txt[i%txt.length],sx:(Math.random()-.5)*W,sy:-Math.random()*H}));
 const fuseTxt=('~'+words[words.length-1]+'-----').slice(0,14);
 const fuse=[...fuseTxt].map((c,i)=>{const u=i/fuseTxt.length;return{c,x:R*.6+i*fs*.62,y:-R*.95-Math.sin(u*3)*R*.4}});
 bombs.push({x,y,R,fs,cells,fuse,t:0,lit:false});hintEl.textContent='click the fuse to light it';}
function updBombs(){for(const b of [...bombs]){b.t++;if(b.lit){b.burn+=.12;if(b.burn>=b.fuse.length)explode(b);}}for(const s of splats)s.t++;}
function explode(b){bombs.splice(bombs.indexOf(b),1);
 for(const c of b.cells){const body=makeBody(c.c,b.x+c.x,b.y+c.y,b.fs*1.2);addBody(body);const d=Math.hypot(c.x,c.y)+5,v=10+Math.random()*10;Body.setVelocity(body,{x:c.x/d*v+(Math.random()-.5)*4,y:c.y/d*v-4});Body.setAngularVelocity(body,(Math.random()-.5)*.6);}
 for(let i=0;i<(RM?8:24);i++){const body=makeBody('!?*#&%'[i%6],b.x,b.y,b.fs*1.1);addBody(body);const a=Math.random()*7,v=16+Math.random()*12;Body.setVelocity(body,{x:Math.cos(a)*v,y:Math.sin(a)*v});}
 boom(b.x,b.y);splats.push(mkSplat(b.x,b.y,b.R*.8));kabooms.push({x:b.x,y:b.y,t:0});}
function drawBombs(){
 for(const s of splats){cx.fillStyle='rgba(17,17,17,'+Math.max(0,.55-s.t/900)+')';for(const o of s.blobs){cx.beginPath();cx.arc(s.x+Math.cos(o.a)*o.d,s.y+Math.sin(o.a)*o.d,o.s,0,7);cx.fill();}}
 splats=splats.filter(s=>s.t<500);cx.fillStyle='#111';cx.textAlign='center';
 for(const b of bombs){const k=RM?1:Math.min(1,b.t/45),e=1-(1-k)**3;cx.font=b.fs+'px '+FONT;
  const sh=b.lit?(Math.random()-.5)*3*(b.burn/b.fuse.length):0;
  for(const c of b.cells)cx.fillText(c.c,b.x+sh+c.sx+(c.x-c.sx)*e,b.y+c.sy+(c.y-c.sy)*e+b.fs*.35);
  cx.font='bold '+b.fs+'px '+FONT;cx.fillText('▬',b.x+b.R*.45,b.y-b.R*.78);
  cx.font='italic '+b.fs+'px '+FONT;cx.globalAlpha=e;b.fuse.forEach((f,i)=>{if(!(b.lit&&i<b.burn))cx.fillText(f.c,b.x+f.x,b.y+f.y);});cx.globalAlpha=1;
  if(b.lit){const f=b.fuse[Math.min(b.fuse.length-1,b.burn|0)];cx.font=(b.fs*1.6+Math.random()*6)+'px '+FONT;cx.fillText('*',b.x+f.x,b.y+f.y+b.fs*.4);}}
 kabooms=kabooms.filter(k=>{k.t++;cx.globalAlpha=Math.max(0,1-k.t/70);cx.font='bold italic '+(60+k.t*2.5)+'px '+FONT;cx.fillText('BOOM',k.x,k.y-20-k.t*.6);cx.globalAlpha=1;return k.t<70});}

let t=0;
Events.on(engine,'beforeUpdate',()=>{t++;
 const stir=wind||water||quake>0||wells.length||(tool==='magnet'&&down)||engine.gravity.y!==1;if(stir)for(const b of letters)if(b.isSleeping)M.Sleeping.set(b,false);
 for(const b of letters){
  if(wind)Body.applyForce(b,b.position,{x:.0008*b.mass*(1+Math.sin(t/40+b.position.y/80)),y:0});
  if(water){const wl=H*.55;if(b.position.y>wl){Body.applyForce(b,b.position,{x:0,y:-engine.gravity.y*.0019*b.mass});Body.setVelocity(b,{x:b.velocity.x*.97,y:b.velocity.y*.95});Body.setAngularVelocity(b,b.angularVelocity*.95);}}
  for(const w of wells){const dx=w.x-b.position.x,dy=w.y-b.position.y,d=Math.hypot(dx,dy)+1;const f=.9*b.mass/Math.max(d,40)**1.3;
   Body.applyForce(b,b.position,{x:dx/d*f-dy/d*f*.6,y:dy/d*f+dx/d*f*.6});if(d<22+w.r){b.dead=w;}}
  if(tool==='magnet'&&down){const dx=px-b.position.x,dy=py-b.position.y,d=Math.hypot(dx,dy)+1;if(d<350)Body.applyForce(b,b.position,{x:dx/d*.0025*b.mass,y:dy/d*.0025*b.mass});}
 }
 updBombs();updWells();
 for(const b of letters.filter(b=>b.dead)){b.dead.eaten++;(b.dead.chars=b.dead.chars||[]).push(b.ch);b.dead.r=Math.min(30,4+Math.sqrt(b.dead.eaten)*2.5);removeL(b);}
 for(const b of letters.filter(b=>b.position.y>H+200||b.position.y<-H*1.5))removeL(b);
 if(quake>0){quake--;const a=(RM?2:6)*Math.sin(t*.9);for(const g of ground)Body.setPosition(g,{x:g.position.x+a-(g.qa||0),y:g.position.y}),g.qa=a;}else for(const g of ground)if(g.qa){Body.setPosition(g,{x:g.position.x-g.qa,y:g.position.y});g.qa=0;}
 for(const r of [...ropes]){if(!r.bodyB&&!r.bodyA)continue;const pa=r.bodyA?r.bodyA.position:r.pointA,pb=r.bodyB?r.bodyB.position:r.pointB;const st=Math.hypot(pa.x-pb.x,pa.y-pb.y)/r.length;if(st>3){Composite.remove(world,r);ropes.splice(ropes.indexOf(r),1);}}
});
function draw(){cx.fillStyle='#f7f2e7';cx.fillRect(0,0,W,H);
 if(water){cx.fillStyle='rgba(60,80,110,.08)';cx.fillRect(0,H*.55,W,H);cx.strokeStyle='rgba(17,17,17,.35)';cx.beginPath();for(let x=0;x<=W;x+=12)cx.lineTo(x,H*.55+Math.sin(x/30+t/20)*2);cx.stroke();}
 cx.fillStyle='#111';for(const g of ground){const v=g.vertices;cx.fillRect(v[0].x,v[0].y,v[1].x-v[0].x,1.2);}
 cx.strokeStyle='#111';cx.lineWidth=1;
 for(const r of ropes){const pa=r.bodyA?r.bodyA.position:r.pointA,pb=r.bodyB?r.bodyB.position:r.pointB;cx.globalAlpha=.4;cx.beginPath();cx.moveTo(pa.x,pa.y);cx.lineTo(pb.x,pb.y);cx.stroke();cx.globalAlpha=1;}
 cx.textAlign='center';cx.textBaseline='alphabetic';
 for(const b of letters){cx.save();cx.translate(b.position.x,b.position.y);
  for(const w of wells){const dx=w.x-b.position.x,dy=w.y-b.position.y,d=Math.hypot(dx,dy),R=w.r+20;if(d<R*7){const k=Math.min(4,(R*7-d)/(d-R*.8+8)*1.2);const a=Math.atan2(dy,dx);cx.rotate(a);cx.scale(1+k,1/(1+k*.6));cx.rotate(-a);}}
  cx.rotate(b.angle);cx.font=b.fs+'px '+FONT;cx.fillText(b.ch,b.ox,b.oy);cx.restore();}
 for(const b of balls){cx.beginPath();cx.moveTo(b.rope.pointA.x,b.rope.pointA.y);cx.lineTo(b.position.x,b.position.y);cx.stroke();cx.beginPath();cx.arc(b.position.x,b.position.y,b.circleRadius,0,7);cx.fill();}
 drawWells();drawBombs();
 booms=booms.filter(o=>{o.t++;cx.globalAlpha=1-o.t/30;cx.beginPath();cx.arc(o.x,o.y,o.t*9,0,7);cx.stroke();cx.globalAlpha=1;return o.t<30});
 window.__drawCaret();if(tool==='magnet'&&down){cx.globalAlpha=.25;cx.beginPath();cx.arc(px,py,30,0,7);cx.stroke();cx.globalAlpha=1;}}
let last=performance.now();
function loop(now){const dt=Math.min(32,now-last);last=now;if(!frozen){const s=slow?.25:1;Engine.update(engine,dt*s);}draw();requestAnimationFrame(loop);}
addEventListener('resize',resize);resize();upd();drop('click anywhere and type');requestAnimationFrame(loop);
window.__tf={wells:()=>wells,bombs:()=>bombs,letters:()=>letters.length,action,drop};
})();

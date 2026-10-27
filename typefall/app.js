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
function drop(text){const fs=size();meas.font=fs+'px '+FONT;let x=40,y=top()+40;
 const parts=wordMode?text.split(/(\s+)/):[...text];
 for(const p of parts){const w=meas.measureText(p).width;if(/^\s+$/.test(p)){x+=w;continue}
  if(x+w>W-30){x=40;y+=fs*1.1}const b=makeBody(p,x+w/2,y,fs);Body.setAngle(b,(Math.random()-.5)*.1);addBody(b);x+=w+2;}}
document.getElementById('f').onsubmit=e=>{e.preventDefault();const t=document.getElementById('t');if(t.value.trim())drop(t.value);t.value='';};
document.getElementById('words').onclick=e=>{wordMode=!wordMode;e.target.textContent=wordMode?'words':'letters';};
function textPool(){let s=letters.map(b=>b.ch).join('')||'';const inp=document.getElementById('t').value;if(!s.trim())s=inp||'TYPEFALL';return s.replace(/\s/g,'');}
function clearL(){[...letters].forEach(removeL);}
function action(id){const g=engine.gravity;
 if(id==='clear'){clearL();wells=[];balls.forEach(b=>Composite.remove(world,[b,b.rope]));balls=[];holes=[];buildGround();wind=0;quake=0;water=false;slow=false;frozen=false;g.y=1;g.x=0;}
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
 if(tool==='well')wells.push({x:px,y:py,r:0,eaten:0});
 if(tool==='bomb')boom(px,py);
 if(tool==='hole'){holes.push({x:px,w:Math.max(90,W*.14)});buildGround();}
 if(tool==='ball'){const b=Bodies.circle(px,py+140,Math.max(28,W/30),{density:.04,frictionAir:.002});const r=Constraint.create({pointA:{x:px,y:Math.max(top(),py-60)},bodyB:b,stiffness:.9});b.rope=r;balls.push(b);Composite.add(world,[b,r]);Body.setVelocity(b,{x:18,y:0});}});
addEventListener('pointermove',e=>{px=e.clientX;py=e.clientY});addEventListener('pointerup',()=>down=false);
mc.constraint.stiffness=.2;Events.on(mc,'startdrag',e=>{if(tool!=='drag')mc.constraint.bodyB=null;});
function boom(x,y){for(const b of letters)M.Sleeping.set(b,false);booms.push({x,y,t:0});for(const b of letters){const dx=b.position.x-x,dy=b.position.y-y,d=Math.hypot(dx,dy)+1;if(d<260){const f=.06*b.mass*(1-d/260);Body.applyForce(b,b.position,{x:dx/d*f,y:dy/d*f});}}
 for(const r of [...ropes])if(Math.hypot((r.bodyB?.position.x||0)-x,(r.bodyB?.position.y||0)-y)<120){Composite.remove(world,r);ropes.splice(ropes.indexOf(r),1);}}
let t=0;
Events.on(engine,'beforeUpdate',()=>{t++;
 const stir=wind||water||quake>0||wells.length||(tool==='magnet'&&down)||engine.gravity.y!==1;if(stir)for(const b of letters)if(b.isSleeping)M.Sleeping.set(b,false);
 for(const b of letters){
  if(wind)Body.applyForce(b,b.position,{x:.0008*b.mass*(1+Math.sin(t/40+b.position.y/80)),y:0});
  if(water){const wl=H*.55;if(b.position.y>wl){Body.applyForce(b,b.position,{x:0,y:-engine.gravity.y*.0019*b.mass});Body.setVelocity(b,{x:b.velocity.x*.97,y:b.velocity.y*.95});Body.setAngularVelocity(b,b.angularVelocity*.95);}}
  for(const w of wells){const dx=w.x-b.position.x,dy=w.y-b.position.y,d=Math.hypot(dx,dy)+1;const f=.25*b.mass/Math.max(d,40)**1.3;
   Body.applyForce(b,b.position,{x:dx/d*f-dy/d*f*.6,y:dy/d*f+dx/d*f*.6});if(d<14+w.r){b.dead=w;}}
  if(tool==='magnet'&&down){const dx=px-b.position.x,dy=py-b.position.y,d=Math.hypot(dx,dy)+1;if(d<350)Body.applyForce(b,b.position,{x:dx/d*.0025*b.mass,y:dy/d*.0025*b.mass});}
 }
 for(const b of letters.filter(b=>b.dead)){b.dead.eaten++;b.dead.r=Math.min(30,4+Math.sqrt(b.dead.eaten)*2.5);removeL(b);}
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
 for(const b of letters){cx.save();cx.translate(b.position.x,b.position.y);cx.rotate(b.angle);cx.font=b.fs+'px '+FONT;cx.fillText(b.ch,b.ox,b.oy);cx.restore();}
 for(const w of wells){const R=w.r+10;const g=cx.createRadialGradient(w.x,w.y,0,w.x,w.y,R*3);g.addColorStop(0,'#111');g.addColorStop(.33,'#111');g.addColorStop(.34,'rgba(17,17,17,.15)');g.addColorStop(1,'rgba(17,17,17,0)');cx.fillStyle=g;cx.beginPath();cx.arc(w.x,w.y,R*3,0,7);cx.fill();}
 for(const b of balls){cx.beginPath();cx.moveTo(b.rope.pointA.x,b.rope.pointA.y);cx.lineTo(b.position.x,b.position.y);cx.stroke();cx.beginPath();cx.arc(b.position.x,b.position.y,b.circleRadius,0,7);cx.fill();}
 booms=booms.filter(o=>{o.t++;cx.globalAlpha=1-o.t/30;cx.beginPath();cx.arc(o.x,o.y,o.t*9,0,7);cx.stroke();cx.globalAlpha=1;return o.t<30});
 if(tool==='magnet'&&down){cx.globalAlpha=.25;cx.beginPath();cx.arc(px,py,30,0,7);cx.stroke();cx.globalAlpha=1;}}
let last=performance.now();
function loop(now){const dt=Math.min(32,now-last);last=now;if(!frozen){const s=slow?.25:1;Engine.update(engine,dt*s);}draw();requestAnimationFrame(loop);}
addEventListener('resize',resize);resize();upd();drop('type anything');requestAnimationFrame(loop);
window.__tf={letters:()=>letters.length,action,drop};
})();

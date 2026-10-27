(()=>{'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,MOB=matchMedia('(pointer:coarse)').matches||innerWidth<760;
const cv=document.getElementById('gl'),gl=cv.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
if(!gl){document.getElementById('nogl').hidden=false;return}
const $=id=>document.getElementById(id);
// ---------- shaders ----------
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const HEAD=`precision highp float;uniform vec2 uR;uniform float uT,uZ,uS,uK;uniform vec2 uC,uJ,uCam;uniform vec3 uRot;
vec3 pal(float t){return .5+.5*cos(6.28318*(vec3(1.,1.,1.)*t+vec3(.0,.33,.67)+vec3(.55,.2,.25)));}
vec3 hud(float t){return mix(vec3(.02,.9,1.),vec3(1.,.36,.94),.5+.5*sin(t));}
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec3 bg(vec2 q){float g=0.;vec2 f=abs(fract(q*8.)-.5);g=smoothstep(.49,.5,max(f.x,f.y))*.06;return vec3(.01,.02,.04)+vec3(.1,.6,.8)*g*(1.-length(q)*.5);}
vec3 camDir(vec2 uv,out vec3 ro,float dist){ro=vec3(0,0,dist*max(1.,uR.y/uR.x*.85));ro.yz*=r2(uCam.y);ro.xz*=r2(uCam.x);vec3 f=normalize(-ro),r=normalize(cross(vec3(0,1,0),f)),u=cross(f,r);return normalize(f*1.25+r*uv.x+u*uv.y);}
`;
const F2D=`
void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;vec2 z,c;bool jul=uK>.5;
 if(jul){z=uv*uZ*2.6+uC;c=uJ;}else{c=uv*uZ*2.6+uC;z=vec2(0);}
 float n=0.,m2=0.,MX=uS;vec2 dz=vec2(jul?1.:0.,0.);
 for(int i=0;i<600;i++){if(float(i)>=MX)break;dz=jul?2.*vec2(z.x*dz.x-z.y*dz.y,z.x*dz.y+z.y*dz.x):2.*vec2(z.x*dz.x-z.y*dz.y,z.x*dz.y+z.y*dz.x)+vec2(1,0);
  z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;m2=dot(z,z);if(m2>256.)break;n+=1.;}
 vec3 col;if(n>=MX){col=vec3(.01,.015,.03);}else{float sn=n-log2(log2(m2))+4.;float d=.5*sqrt(m2/dot(dz,dz))*log(m2);
  float e=clamp(d/(uZ*2.6/uR.y)*.5,0.,1.);float k=fract(sn*.02+uT*.03);vec3 p2=mix(vec3(.01,.03,.08),mix(vec3(.05,.55,.85),vec3(.95,.3,.9),.5+.5*sin(sn*.11+uT*.2)),pow(clamp(sn/60.,0.,1.),.7))*(.55+.45*sin(sn*.35+uT*.5));col=p2*(.3+.7*pow(e,.3))+vec3(.5,.95,1.)*(1.-smoothstep(0.,1.2,d/(uZ*2.6/uR.y)))*.7;}
 gl_FragColor=vec4(col,1.);}`;
const RAY=(de,col,far)=>`${de}
vec3 nrm(vec3 p){vec2 e=vec2(.0007,0);return normalize(vec3(DE(p+e.xyy)-DE(p-e.xyy),DE(p+e.yxy)-DE(p-e.yxy),DE(p+e.yyx)-DE(p-e.yyx)));}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;vec3 ro;vec3 rd=camDir(uv,ro,${far});float t=0.,d=1.;int st=0;
 for(int i=0;i<160;i++){d=DE(ro+rd*t);if(d<.0012*t||t>9.)break;t+=d*.95;st=i;}
 vec3 c=bg(uv)+vec3(.0,.05,.09)*(1.-length(uv));
 if(t<9.&&d<.02){vec3 p=ro+rd*t,n=nrm(p),L=normalize(vec3(.6,.8,.5));float dif=clamp(dot(n,L),0.,1.),ao=1.-float(st)/140.;
  vec3 base=${col};float fr=pow(1.-abs(dot(n,rd)),3.);
  c=base*(.15+.85*dif)*ao+vec3(.4,.95,1.)*fr*.8+pow(clamp(dot(reflect(rd,n),L),0.,1.),24.)*.6;}
 else c+=vec3(.2,.8,1.)*float(st)/140.*.25;
 gl_FragColor=vec4(pow(c,vec3(.9)),1.);}`;
const BULB=RAY(`vec3 orb;float DE(vec3 p){float bs=length(p)-1.25;if(bs>.1)return bs;vec3 w=p;float m=dot(w,w),dz=1.;orb=vec3(1e3);float P=8.+sin(uT*.2)*uS;
 for(int i=0;i<5;i++){dz=P*pow(m,(P-1.)*.5)*dz+1.;float r=length(w),b=P*acos(clamp(w.y/r,-1.,1.)),a=P*atan(w.x,w.z);w=p+pow(r,P)*vec3(sin(b)*sin(a),cos(b),sin(b)*cos(a));orb=min(orb,abs(w));m=dot(w,w);if(m>256.)break;}
 return .25*log(m)*sqrt(m)/dz;}`,`mix(vec3(.05,.35,.6),mix(vec3(.4,.95,1.),vec3(1.,.4,.9),clamp(orb.y*1.5,0.,1.)),clamp(length(orb)*1.2,0.,1.))`,'3.2');
const MENG=RAY(`float orbv;float sdB(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float DE(vec3 p){p.xz*=r2(uT*.1);float d=sdB(p,vec3(1.)),s=1.;orbv=0.;
 for(int m=0;m<5;m++){vec3 a=mod(p*s,2.)-1.;s*=3.;vec3 r=abs(1.-3.*abs(a));float da=max(r.x,r.y),db=max(r.y,r.z),dc=max(r.z,r.x);float c=(min(da,min(db,dc))-1.)/s;if(c>d){d=c;orbv=float(m);}}
 return d;}`,`pal(orbv*.17+uT*.05)`,'4.4');
const ROT4=`vec4 rot4(vec4 q){vec3 a=uRot;float c,s;c=cos(a.x);s=sin(a.x);q.xw=mat2(c,-s,s,c)*q.xw;c=cos(a.y);s=sin(a.y);q.yw=mat2(c,-s,s,c)*q.yw;c=cos(a.z);s=sin(a.z);q.zw=mat2(c,-s,s,c)*q.zw;return q;}`;
const CROSS=RAY(ROT4+`float DE(vec3 p){vec4 q=rot4(vec4(p,uS));if(uK>.5)return length(q)-1.2+.0*q.x;vec4 d=abs(q)-vec4(.8);float o=length(max(d,0.))+min(max(max(d.x,d.y),max(d.z,d.w)),0.);
 vec4 e=abs(q);float edge=max(max(min(e.x,e.y),min(e.z,e.w)),0.);return o;}`,
 `(uK>.5?hud(uS*2.+uT*.3):mix(vec3(.08,.35,.5),vec3(.7,1.,1.),smoothstep(.62,.8,max(max(min(abs(rot4(vec4(p,uS)).x),abs(rot4(vec4(p,uS)).y)),min(abs(rot4(vec4(p,uS)).z),abs(rot4(vec4(p,uS)).w))),0.)))+vec3(1.,.36,.94)*.15*sin(uS*6.))`,'4.4');
const QJ=RAY(`vec3 orb;vec4 qsq(vec4 a){return vec4(a.x*a.x-dot(a.yzw,a.yzw),2.*a.x*a.yzw);}
float DE(vec3 p){float bs=length(p)-1.6;if(bs>.1)return bs;vec4 z=vec4(p,uS),c=vec4(-.125,-.256,.847,.0895)+.06*sin(uT*vec4(.3,.23,.17,.41));float md2=1.,mz2=dot(z,z);orb=vec3(1e3);
 for(int i=0;i<14;i++){md2*=4.*mz2;z=qsq(z)+c;orb=min(orb,abs(z.xyz));mz2=dot(z,z);if(mz2>256.)break;}
 return .2*sqrt(mz2/md2)*log(mz2);}`,`mix(vec3(.1,.55,.85),vec3(1.,.4,.9),clamp(.5+.5*n.y+.3*n.x,0.,1.))*(.8+.5*clamp(length(orb),0.,1.))`,'3.');
const BGF=`void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;vec3 c=bg(uv*1.3)+vec3(.02,.07,.12)*(1.-length(uv));gl_FragColor=vec4(c,1.);}`;
const LVS=`attribute vec3 a;attribute float b;varying float vb,vd;void main(){vb=b;vd=a.z;gl_Position=vec4(a.xy,0.,1.);}`;
const LFS=`precision mediump float;varying float vb,vd;uniform float uT;void main(){float g=1.-abs(vb);g=g*g;vec3 c=mix(vec3(1.,.36,.94),vec3(.4,.95,1.),vd);gl_FragColor=vec4(c*g*(.35+.65*vd)+vec3(1.)*pow(g,8.)*.6*vd,1.);}`;
function prog(fs,vs=VS){const p=gl.createProgram();for(const[t,s]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));const u={};for(const n of['uR','uT','uZ','uS','uK','uC','uJ','uCam','uRot'])u[n]=gl.getUniformLocation(p,n);return{p,u}}
const cache={};const P=k=>cache[k]||(cache[k]=k==='line'?prog(LFS,LVS):prog(HEAD+{f2d:F2D,bulb:BULB,meng:MENG,cross:CROSS,qj:QJ,bg:BGF}[k]));
const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const lbuf=gl.createBuffer();
// ---------- 4D polytopes ----------
const PHI=(1+Math.sqrt(5))/2;
function edges(V,len){const E=[],e2=len*len;for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++){let d=0;for(let k=0;k<4;k++)d+=(V[i][k]-V[j][k])**2;if(Math.abs(d-e2)<1e-3)E.push([i,j])}return E}
function norm(V){const r=Math.hypot(...V[0]);return V.map(v=>v.map(x=>x/r))}
const tessV=[];for(let i=0;i<16;i++)tessV.push([i&1?1:-1,i&2?1:-1,i&4?1:-1,i&8?1:-1]);
const c24=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)for(const s of[1,-1])for(const t of[1,-1]){const v=[0,0,0,0];v[i]=s;v[j]=t;c24.push(v)}
const c600=[];for(let i=0;i<4;i++)for(const s of[1,-1]){const v=[0,0,0,0];v[i]=s;c600.push(v)}
for(let i=0;i<16;i++)c600.push([i&1?.5:-.5,i&2?.5:-.5,i&4?.5:-.5,i&8?.5:-.5]);
const EVEN=[];(function perm(a,l){if(l===4){let inv=0;for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(a[i]>a[j])inv++;if(!(inv&1))EVEN.push(a.slice());return}for(let i=l;i<4;i++){[a[l],a[i]]=[a[i],a[l]];perm(a,l+1);[a[l],a[i]]=[a[i],a[l]]}})([0,1,2,3],0);
for(const pm of EVEN)for(let s=0;s<8;s++){const b=[(s&1?-1:1)*PHI/2,(s&2?-1:1)*.5,(s&4?-1:1)/(2*PHI),0],v=[0,0,0,0];for(let k=0;k<4;k++)v[pm[k]]=b[k];c600.push(v)}
const POLY={tess:{V:norm(tessV),E:edges(tessV,2)},c24:{V:norm(c24),E:edges(c24,Math.SQRT2)},c600:{V:c600,E:edges(c600,1/PHI)}};
// ---------- scenes ----------
const S=[
 {id:'mandel',g:'F',n:'Mandelbrot',k:'f2d',d:'The classic set z → z² + c, coloured by smooth escape time with a distance-estimated glowing rim.',h:'Drag to pan · scroll / pinch to zoom',view:{C:[-.6,0],Z:1}},
 {id:'julia',g:'F',n:'Julia Set',k:'f2d',jul:1,d:'Fix c, iterate every point. The constant c follows your pointer across the plane.',h:'Move pointer to steer c · drag / scroll zoom',view:{C:[0,0],Z:.62}},
 {id:'bulb',g:'F',n:'Mandelbulb',k:'bulb',d:'Raymarched power-8 Mandelbulb using the Hubbard–Douady distance estimate, breathing its exponent.',h:'Drag to orbit',sl:[['PWR',0,3,1.5,.1]]},
 {id:'menger',g:'F',n:'Menger Sponge',k:'meng',d:'An infinite cube with its centres removed, five levels deep, raymarched with an exact box SDF.',h:'Drag to orbit'},
 {id:'tess',g:'D',n:'Tesseract',k:'poly',poly:'tess',d:'The 8-cell: 16 vertices, 32 edges, projected 4D → 3D → screen. Inner cube is the far w-side.',h:'Sliders rotate in XW / YW / ZW · drag to orbit'},
 {id:'c24',g:'D',n:'24-Cell',k:'poly',poly:'c24',d:'The self-dual polytope with no 3D analogue: 24 vertices, 96 edges, 24 octahedral cells.',h:'Sliders rotate in XW / YW / ZW · drag to orbit'},
 {id:'c600',g:'D',n:'600-Cell',k:'poly',poly:'c600',d:'120 vertices and 720 edges forming 600 tetrahedra, the 4D cousin of the icosahedron.',h:'Sliders rotate in XW / YW / ZW · drag to orbit'},
 {id:'slice',g:'D',n:'Cross-Section',k:'cross',d:'A 3D hyperplane sweeps along w through a rotating tesseract (or hypersphere). What you see is the slice.',h:'Slide W to sweep · drag to orbit',sl:[['W',-1.4,1.4,0,.01]],sw:1},
 {id:'qjulia',g:'D',n:'Quaternion Julia',k:'qj',d:'A 4D Julia set q → q² + c over the quaternions, cut by a 3D slice and raymarched.',h:'Slide W to move the slice · drag to orbit',sl:[['W',-.6,.6,0,.01]]}];
for(const s of S)if(s.k==='poly'||s.k==='cross')s.sl=[...(s.sl||[]),['XW',0,6.283,0,.01],['YW',0,6.283,0,.01],['ZW',0,6.283,0,.01]];
let cur,view={C:[0,0],Z:1},J=[-.8,.156],cam=[.6,.35],vals={},shape=0,spin=!RM;
const fmt=(i)=>String(i+1).padStart(2,'0');
for(const[i,s]of S.entries()){const b=document.createElement('button');b.innerHTML=`<i>${fmt(i)}</i>${s.n}`;b.onclick=()=>go(i);s.btn=b;$(s.g==='F'?'navF':'navD').appendChild(b)}
function go(i,push=true){cur=S[i];S.forEach(s=>s.btn.toggleAttribute('aria-current',s===cur));$('sid').textContent=fmt(i);$('sname').textContent=cur.n;$('sdesc').textContent=cur.d;$('hint').textContent=cur.h;
 if(cur.view)view={C:cur.view.C.slice(),Z:cur.view.Z};vals={};const ctl=$('ctl');ctl.innerHTML='';
 for(const[l,a,b,v,st]of cur.sl||[]){vals[l]=v;const r=document.createElement('label');r.className='row';r.innerHTML=`<span>${l}</span><input type="range" min="${a}" max="${b}" step="${st}" value="${v}" aria-label="${l}"><output>${(+v).toFixed(2)}</output>`;
  const inp=r.querySelector('input'),o=r.querySelector('output');inp.oninput=()=>{vals[l]=+inp.value;o.textContent=(+inp.value).toFixed(2)};ctl.appendChild(r)}
 const bt=document.createElement('div');bt.className='btns';
 const add=(t,f,pr)=>{const x=document.createElement('button');x.textContent=t;if(pr!=null)x.setAttribute('aria-pressed',pr);x.onclick=()=>f(x);bt.appendChild(x)};
 if(cur.sw)add(shape?'Hypersphere':'Tesseract',x=>{shape^=1;x.textContent=shape?'Hypersphere':'Tesseract'});
 if(cur.k!=='f2d')add('Auto-spin',x=>{spin=!spin;x.setAttribute('aria-pressed',spin)},spin);
 if(cur.k==='f2d')add('Reset view',()=>{view={C:cur.view.C.slice(),Z:cur.view.Z}});
 ctl.appendChild(bt);if(push)history.replaceState(null,'','#'+cur.id)}
// ---------- input ----------
const pts=new Map();let pinch=0;
function toPlane(x,y){const h=innerHeight;return[(x-innerWidth/2)/h*view.Z*2.6+view.C[0],-(y-h/2)/h*view.Z*2.6+view.C[1]]}
function zoomAt(x,y,f){const a=toPlane(x,y);view.Z=Math.min(2,Math.max(2e-5,view.Z*f));const b=toPlane(x,y);view.C[0]+=a[0]-b[0];view.C[1]+=a[1]-b[1]}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);cv.style.cursor='grabbing'});
cv.addEventListener('pointermove',e=>{
 if(cur.jul&&(e.pointerType==='mouse'||pts.size===1)&&!(e.buttons&1&&e.pointerType==='mouse'&&e.shiftKey)){if(e.pointerType==='mouse'&&!e.buttons||e.pointerType!=='mouse'){J=[(e.clientX/innerWidth-.5)*2.2-.25,-(e.clientY/innerHeight-.5)*1.8];if(e.pointerType!=='mouse')return}}
 const p=pts.get(e.pointerId);if(!p)return;const dx=e.clientX-p[0],dy=e.clientY-p[1];
 if(pts.size===2){const [a,b]=[...pts.values()],d0=Math.hypot(a[0]-b[0],a[1]-b[1]);p[0]=e.clientX;p[1]=e.clientY;const [c,d]=[...pts.values()],d1=Math.hypot(c[0]-d[0],c[1]-d[1]);
  if(cur.k==='f2d'&&d0>0)zoomAt((c[0]+d[0])/2,(c[1]+d[1])/2,d0/d1);return}
 p[0]=e.clientX;p[1]=e.clientY;
 if(cur.k==='f2d'){const s=view.Z*2.6/innerHeight;view.C[0]-=dx*s;view.C[1]+=dy*s}else{cam[0]-=dx*.008;cam[1]=Math.max(-1.4,Math.min(1.4,cam[1]+dy*.008))}});
const up=e=>{pts.delete(e.pointerId);cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();if(cur.k==='f2d')zoomAt(e.clientX,e.clientY,Math.exp(e.deltaY*.0015))},{passive:false});
addEventListener('keydown',e=>{const i=S.indexOf(cur);if(e.key==='ArrowRight'||e.key===']')go((i+1)%S.length);if(e.key==='ArrowLeft'||e.key==='[')go((i+S.length-1)%S.length)});
// ---------- render loop ----------
const DPR=Math.min(devicePixelRatio||1,MOB?1.5:2);let scale=MOB?.5:.8,W=0,H=0,T=0,last=performance.now(),fr=0,acc=0,vis=true;
document.addEventListener('visibilitychange',()=>{vis=!document.hidden;if(vis){last=performance.now();requestAnimationFrame(loop)}});
function size(){const w=Math.max(1,Math.round(innerWidth*DPR*scale)),h=Math.max(1,Math.round(innerHeight*DPR*scale));if(w!==W||h!==H){W=cv.width=w;H=cv.height=h;$('res').textContent='RES '+w+'×'+h}}
function full(k,set){const{p,u}=P(k);gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,quad);const a=gl.getAttribLocation(p,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 gl.uniform2f(u.uR,W,H);gl.uniform1f(u.uT,T);gl.uniform2f(u.uCam,cam[0],cam[1]);set&&set(u);gl.drawArrays(gl.TRIANGLES,0,3)}
function rotA(){const sp=spin?T*.25:0;return[(vals.XW||0)+sp,(vals.YW||0)+sp*.7,(vals.ZW||0)+sp*.45]}
function drawPoly(){full('bg');const{V,E}=POLY[cur.poly],[a,b,c]=rotA(),asp=W/H,ca=Math.cos(cam[0]),sa=Math.sin(cam[0]),cb=Math.cos(cam[1]),sb=Math.sin(cam[1]);
 const R=[];for(const v of V){let[x,y,z,w]=v,t;
  t=x*Math.cos(a)-w*Math.sin(a);w=x*Math.sin(a)+w*Math.cos(a);x=t;t=y*Math.cos(b)-w*Math.sin(b);w=y*Math.sin(b)+w*Math.cos(b);y=t;t=z*Math.cos(c)-w*Math.sin(c);w=z*Math.sin(c)+w*Math.cos(c);z=t;
  const k=1.6/(2.4-w);x*=k;y*=k;z*=k;t=x*ca+z*sa;z=-x*sa+z*ca;x=t;t=y*cb-z*sb;z=y*sb+z*cb;y=t;const q=1.9/(3.6-z),s=Math.min(1,asp)*1.5;R.push([x*q*s/asp,y*q*s,(w+1)/2])}
 const thick=(cur.poly==='c600'?2.2:3.4)*DPR*scale,out=new Float32Array(E.length*6*4+V.length*6*4);let o=0;
 const seg=(p,q,wd,glo)=>{let dx=(q[0]-p[0])*W,dy=(q[1]-p[1])*H,l=Math.hypot(dx,dy)||1;const nx=-dy/l*wd/W,ny=dx/l*wd/H;
  for(const[P0,s]of[[p,1],[p,-1],[q,1],[p,-1],[q,-1],[q,1]]){out[o++]=P0[0]+nx*s;out[o++]=P0[1]+ny*s;out[o++]=glo?P0[2]:P0[2];out[o++]=s}};
 for(const[i,j]of E)seg(R[i],R[j],thick*(.6+.8*(R[i][2]+R[j][2])/2),0);
 for(const p of R){const r=thick*1.6*(.5+p[2]);seg([p[0]-r/W,p[1],p[2]],[p[0]+r/W,p[1],p[2]],r,0)}
 const{p,u}=P('line');gl.useProgram(p);gl.uniform1f(u.uT,T);gl.bindBuffer(gl.ARRAY_BUFFER,lbuf);gl.bufferData(gl.ARRAY_BUFFER,out.subarray(0,o),gl.DYNAMIC_DRAW);
 const la=gl.getAttribLocation(p,'a'),lb=gl.getAttribLocation(p,'b');gl.enableVertexAttribArray(la);gl.vertexAttribPointer(la,3,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(lb);gl.vertexAttribPointer(lb,1,gl.FLOAT,false,16,12);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.drawArrays(gl.TRIANGLES,0,o/4);gl.disable(gl.BLEND);gl.disableVertexAttribArray(lb)}
function frame(){gl.viewport(0,0,W,H);const k=cur.k;
 if(k==='poly')return drawPoly();
 if(k==='f2d')return full('f2d',u=>{gl.uniform2f(u.uC,...view.C);gl.uniform1f(u.uZ,view.Z);gl.uniform1f(u.uK,cur.jul?1:0);gl.uniform2f(u.uJ,...J);gl.uniform1f(u.uS,Math.min(MOB?260:560,Math.round(90+40*Math.log2(1/view.Z+1))))});
 const r=rotA();if(spin&&k!=='poly')cam[0]+=.002;
 full(k,u=>{gl.uniform1f(u.uS,vals.W??vals.PWR??0);gl.uniform1f(u.uK,shape);gl.uniform3f(u.uRot,...r)})}
function loop(now){if(!vis)return;const dt=Math.min(.1,(now-last)/1000);last=now;if(!RM)T+=dt;
 fr++;acc+=dt;if(acc>=1){const fps=fr/acc;$('fps').textContent=Math.round(fps)+' FPS';
  if(fps<45&&scale>.3)scale=Math.max(.3,scale*.85);else if(fps>58&&scale<(MOB?.75:1))scale=Math.min(MOB?.75:1,scale*1.07);fr=0;acc=0}
 size();frame();requestAnimationFrame(loop)}
addEventListener('resize',size);
const h=location.hash.slice(1),hi=S.findIndex(s=>s.id===h);go(hi<0?0:hi,false);size();
try{for(const k of['f2d','bg','line'])P(k)}catch(e){console.error(e)}
requestAnimationFrame(loop);
window.__lan4={go,S,set:(o)=>Object.assign(vals,o)};
})();

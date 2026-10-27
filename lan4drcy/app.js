(()=>{'use strict';
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches,MOB=matchMedia('(pointer:coarse)').matches||innerWidth<760;
const cv=document.getElementById('gl'),gl=cv.getContext('webgl',{antialias:false,alpha:false,preserveDrawingBuffer:true,powerPreference:'high-performance'});
if(!gl){document.getElementById('nogl').hidden=false;return}
const $=id=>document.getElementById(id),FLT=!!gl.getExtension('OES_texture_float');
const MAXIT=MOB?9000:20000;
// ================= shaders =================
const VS='attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
const HEAD=`precision highp float;uniform vec2 uR,uC,uJ,uCam,uOff;uniform float uT,uZ,uS,uK,uQ,uMax,uN,uTH,uF,uP,uFlip,uOut;uniform vec3 uRot,uEye,uFw,uRt,uUp;uniform vec2 uPx;uniform float uIt,uPd;uniform sampler2D uOrb;
vec3 pal(float t){return .5+.5*cos(6.28318*(t+vec3(.55,.53,.92)));}
vec3 hud(float t){return mix(vec3(.02,.9,1.),vec3(1.,.36,.94),.5+.5*sin(t));}
vec3 spal(float s){float b=.5+.5*sin(s*.22+uT*.6);vec3 a=mix(vec3(.05,.55,.9),vec3(.95,.3,.9),.5+.5*sin(s*.07+uT*.3));return vec3(.008,.015,.035)+a*(.06+.55*b*b)*smoothstep(0.,22.,s)+vec3(.6,.97,1.)*pow(b,30.)*.45;}
mat2 r2(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
vec2 cm(vec2 a,vec2 b){return vec2(a.x*b.x-a.y*b.y,a.x*b.y+a.y*b.x);}
vec3 bg(vec2 q){vec2 f=abs(fract(q*8.)-.5);float g=smoothstep(.49,.5,max(f.x,f.y))*.06;return vec3(.01,.02,.04)+vec3(.1,.6,.8)*g*(1.-length(q)*.5);}
vec3 camDir(vec2 uv,out vec3 ro){ro=uEye;return normalize(uFw*1.25+uRt*uv.x+uUp*uv.y);}
`;
// perturbation-theory deep zoom: CPU reference orbit (BigInt fixed point) in a float texture, per-pixel float deltas with rebasing
const PERT=`vec2 ref(float i){return texture2D(uOrb,(vec2(mod(i,1024.),floor(i/1024.))+.5)/vec2(1024.,uTH)).xy;}
float dabs(float c,float d){if(c>=0.)return c+d>=0.?d:-d-2.*c;return c+d>0.?d+2.*c:-d;}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;uv.y*=uFlip;vec2 d=uOff+uv*uZ*2.6;bool jul=uF>.5&&uF<1.5;
 vec2 dc=jul?vec2(0):d,dz=jul?d:vec2(0),Z0=ref(0.);float ri=0.,n=0.,m2=0.;
 for(int i=0;i<${MAXIT};i++){if(n>=uMax)break;vec2 Z=ref(ri),nd;
  if(uF<1.5)nd=2.*cm(Z,dz)+cm(dz,dz)+dc;
  else if(uF<2.5){nd=2.*cm(Z,dz)+cm(dz,dz);nd.y=-nd.y;nd+=dc;}
  else if(uF<3.5){nd=vec2(2.*Z.x*dz.x+dz.x*dz.x-2.*Z.y*dz.y-dz.y*dz.y,2.*dabs(Z.x*Z.y,Z.x*dz.y+dz.x*Z.y+dz.x*dz.y))+dc;}
  else{vec2 A=vec2(0),Zm=vec2(1,0),zf=Z+dz;for(int k=0;k<8;k++){if(float(k)>=uP)break;A=cm(zf,A)+cm(dz,Zm);Zm=cm(Zm,Z);}nd=A+dc;}
  dz=nd;ri+=1.;n+=1.;vec2 z=ref(ri)+dz;m2=dot(z,z);if(m2>1e4)break;
  if((!jul&&m2<dot(dz,dz))||ri>=uN-1.){dz=z-(jul?Z0:vec2(0));ri=0.;}}
 if(uOut>.5){gl_FragColor=vec4(n>=uMax?vec3(0):vec3(fract(n/256.),floor(n/256.)/255.,1.),1.);return;}
 vec3 col=vec3(.01,.015,.03);if(n<uMax){float sn=n-log2(log2(m2))/log2(uF>3.5?uP:2.)+4.;col=spal(sn);}
 gl_FragColor=vec4(col,1.);}`;
// fallback (no float textures): plain single-precision escape time
const F2D=`void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;uv.y*=uFlip;vec2 p=uC+uOff+uv*uZ*2.6;bool jul=uF>.5&&uF<1.5;vec2 z=jul?p:vec2(0),c=jul?uJ:p;float n=0.,m2=0.;
 for(int i=0;i<1500;i++){if(n>=uMax)break;if(uF<1.5)z=cm(z,z)+c;else if(uF<2.5){z=cm(z,z);z.y=-z.y;z+=c;}else if(uF<3.5){z=abs(z);z=cm(z,z)+c;}else{vec2 w=z;for(int k=1;k<8;k++){if(float(k)>=uP)break;w=cm(w,z);}z=w+c;}
  m2=dot(z,z);if(m2>1e4)break;n+=1.;}
 if(uOut>.5){gl_FragColor=vec4(n>=uMax?vec3(0):vec3(fract(n/256.),floor(n/256.)/255.,1.),1.);return;}
 vec3 col=vec3(.01,.015,.03);if(n<uMax)col=spal(n-log2(log2(m2))/log2(uF>3.5?uP:2.)+4.);gl_FragColor=vec4(col,1.);}`;
const NEWT=`void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;vec2 z=uC+uv*uZ*2.6;float n=0.,a=1.+.35*sin(uT*.4)*uK;
 for(int i=0;i<64;i++){vec2 z2=cm(z,z),z3=cm(z2,z),num=z3-vec2(1,0),den=3.*z2;vec2 q=vec2(num.x*den.x+num.y*den.y,num.y*den.x-num.x*den.y)/max(dot(den,den),1e-12);z-=a*q;if(dot(num,num)<1e-8)break;n+=1.;}
 float ang=atan(z.y,z.x);vec3 r=ang>1.?vec3(.05,.85,1.):ang<-1.?vec3(1.,.36,.94):vec3(.55,.5,1.);gl_FragColor=vec4(r*(.12+.3*exp(-n*.25))+vec3(.55,.95,1.)*smoothstep(6.,24.,n)*.7+vec3(.01,.02,.04),1.);}`;
const PHX=`void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;vec2 z=(uC+uv*uZ*2.6).yx,zp=vec2(0),c=vec2(.5667,0)+.02*vec2(sin(uT*.3),cos(uT*.23))*uK,p=vec2(-.5,0);float n=0.,m2=0.;
 for(int i=0;i<300;i++){vec2 t=z;z=cm(z,z)+c+cm(p,zp);zp=t;m2=dot(z,z);if(m2>256.)break;n+=1.;}
 gl_FragColor=vec4(n>=300.?vec3(.01,.015,.03):spal(n-log2(log2(m2))+4.),1.);}`;
const LYAP=`void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;vec2 ab=uC+uv*uZ*2.6;float x=.5,l=0.;
 for(int i=0;i<160;i++){float r=(mod(float(i),6.)<3.)?ab.x:ab.y;x=r*x*(1.-x);if(i>=40)l+=log(abs(r*(1.-2.*x))+1e-9);}
 l/=120.;vec3 col=l<0.?mix(vec3(.02,.05,.1),mix(vec3(.1,.8,1.),vec3(1.,.4,.94),clamp(-l*.8,0.,1.)),clamp(-l*2.5,0.,1.)):vec3(.01,.015,.03)+vec3(.05,.1,.2)*clamp(l,0.,1.);
 if(ab.x<0.||ab.y<0.||ab.x>4.||ab.y>4.)col=vec3(.01,.015,.03);gl_FragColor=vec4(col,1.);}`;
const RAY=(de,col,dist,far='9.')=>`${de}
vec3 nrm(vec3 p,float e){vec2 h=vec2(e,0);return normalize(vec3(DE(p+h.xyy)-DE(p-h.xyy),DE(p+h.yxy)-DE(p-h.yxy),DE(p+h.yyx)-DE(p-h.yyx)));}
void main(){vec2 uv=(gl_FragCoord.xy+uPx-.5*uR)/uR.y;vec3 ro;vec3 rd=camDir(uv,ro);float t=0.,d=1.,st=0.,eps=1.5/uR.y;
 for(int i=0;i<260;i++){if(st>=uQ)break;d=DE(ro+rd*t);if(d<max(eps*t*.5,2e-7)||t>${far})break;t+=d*.92;st+=1.;}
 bool hit=t<${far}&&d<max(eps*t*3.,1e-6);
 if(uOut>.5){float v=hit?clamp(t/(uPd*64.),0.,1.):1.;float x=floor(v*16777215.);gl_FragColor=vec4(floor(x/65536.),mod(floor(x/256.),256.),mod(x,256.),255.)/255.;return;}
 vec3 c=bg(uv)+vec3(.0,.05,.09)*(1.-length(uv));
 if(hit){vec3 p=ro+rd*t,n=nrm(p,max(eps*t*.5,1e-7)),L=normalize(vec3(.6,.8,.5));float dif=clamp(dot(n,L),0.,1.),ao=1.-st/uQ;
  vec3 base=${col};float fr=pow(1.-abs(dot(n,rd)),3.);
  c=base*(.15+.85*dif)*(.3+.7*ao)+vec3(.4,.95,1.)*fr*.7+pow(clamp(dot(reflect(rd,n),L),0.,1.),24.)*.5;c=mix(c,bg(uv),smoothstep(${far}*.55,${far},t));}
 else c+=vec3(.2,.8,1.)*st/uQ*.25;
 gl_FragColor=vec4(pow(c,vec3(.9)),1.);}`;
const BULB=RAY(`vec3 orb;float DE(vec3 p){float bs=length(p)-1.25;if(bs>.1)return bs;vec3 w=p;float m=dot(w,w),dz=1.;orb=vec3(1e3);float P=8.+sin(uT*.2)*uS;
 float itB=min(14.,5.+uIt*.6);for(int i=0;i<16;i++){if(float(i)>=itB)break;dz=P*pow(m,(P-1.)*.5)*dz+1.;float r=length(w),b=P*acos(clamp(w.y/r,-1.,1.)),a=P*atan(w.x,w.z);w=p+pow(r,P)*vec3(sin(b)*sin(a),cos(b),sin(b)*cos(a));orb=min(orb,abs(w));m=dot(w,w);if(m>256.)break;}
 return .25*log(m)*sqrt(m)/dz;}`,`mix(vec3(.05,.35,.6),mix(vec3(.4,.95,1.),vec3(1.,.4,.9),clamp(orb.y*1.5,0.,1.)),clamp(length(orb)*1.2,0.,1.))`,'3.2');
const MENG=RAY(`float orbv;float sdB(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.))+min(max(q.x,max(q.y,q.z)),0.);}
float DE(vec3 p){float d=sdB(p,vec3(1.)),s=1.;orbv=0.;float lv=min(14.,5.+uIt/1.585);
 for(int m=0;m<15;m++){if(float(m)>=lv)break;vec3 a=mod(p*s,2.)-1.;s*=3.;vec3 r=abs(1.-3.*abs(a));float da=max(r.x,r.y),db=max(r.y,r.z),dc=max(r.z,r.x);float c=(min(da,min(db,dc))-1.)/s;if(c>d){d=c;orbv=float(m);}}
 return d;}`,`pal(orbv*.17+uT*.05)`,'4.4');
const SIERP=RAY(`float orbv;float DE(vec3 z){z.y-=.15;float s=1.;orbv=0.;float lv=min(24.,10.+uIt);
 for(int n=0;n<25;n++){if(float(n)>=lv)break;if(z.x+z.y<0.)z.xy=-z.yx;if(z.x+z.z<0.)z.xz=-z.zx;if(z.y+z.z<0.)z.zy=-z.yz;z=z*2.-vec3(1.);s*=2.;orbv+=dot(z,z)*.0001;}
 return (length(z)-1.2)/s;}`,`hud(orbv*1.4+uT*.3)*.9+.08`,'4.2');
const MBOX=RAY(`float orbv;float DE(vec3 p){vec4 z=vec4(p,1.);float S=-1.5+.05*sin(uT*.3);orbv=1e3;float lv=min(22.,10.+uIt*.7);
 for(int i=0;i<23;i++){if(float(i)>=lv)break;z.xyz=clamp(z.xyz,-1.,1.)*2.-z.xyz;float r=dot(z.xyz,z.xyz);orbv=min(orbv,r);if(r<.25)z*=4.;else if(r<1.)z/=r;z.xyz=z.xyz*S+p;z.w=z.w*abs(S)+1.;if(dot(z.xyz,z.xyz)>1e4)break;}
 return (length(z.xyz)-2.5)/abs(z.w)-pow(1.5,1.-lv);}`,`mix(vec3(.08,.45,.7),vec3(1.,.42,.9),clamp(orbv*2.,0.,1.))+.05`,'8.5','16.');
const APOL=RAY(`vec4 orb;float DE(vec3 p){float s=1.;orb=vec4(1e3);float lv=min(16.,8.+uIt*.5);
 for(int i=0;i<17;i++){if(float(i)>=lv)break;p=-1.+2.*fract(.5*p+.5);float r=dot(p,p);orb=min(orb,vec4(abs(p),r));float k=1.25/r;p*=k;s*=k;}
 return max(.25*abs(p.y)/s,length(p)*0.-10.)*1.;}`,`mix(vec3(.05,.5,.8),vec3(1.,.4,.9),clamp(orb.w*3.,0.,1.))*(.6+.6*clamp(orb.y*3.,0.,1.))`,'2.4','6.');
const ROT4=`vec4 rot4(vec4 q){vec3 a=uRot;float c,s;c=cos(a.x);s=sin(a.x);q.xw=mat2(c,-s,s,c)*q.xw;c=cos(a.y);s=sin(a.y);q.yw=mat2(c,-s,s,c)*q.yw;c=cos(a.z);s=sin(a.z);q.zw=mat2(c,-s,s,c)*q.zw;return q;}`;
const CROSS=RAY(ROT4+`float DE(vec3 p){vec4 q=rot4(vec4(p,uS));if(uK>.5)return length(q)-1.2;vec4 d=abs(q)-vec4(.8);return length(max(d,0.))+min(max(max(d.x,d.y),max(d.z,d.w)),0.);}
float edg(vec3 p){vec4 e=abs(rot4(vec4(p,uS)));return max(min(e.x,e.y),min(e.z,e.w));}`,
 `(uK>.5?hud(uS*2.+uT*.3):mix(vec3(.08,.35,.5),vec3(.7,1.,1.),smoothstep(.62,.8,edg(p)))+vec3(1.,.36,.94)*.15*sin(uS*6.))`,'4.4');
const QJ=RAY(`vec3 orb;vec4 qsq(vec4 a){return vec4(a.x*a.x-dot(a.yzw,a.yzw),2.*a.x*a.yzw);}
float DE(vec3 p){float bs=length(p)-1.6;if(bs>.1)return bs;vec4 z=vec4(p,uS),c=vec4(-.125,-.256,.847,.0895)+.06*sin(uT*vec4(.3,.23,.17,.41));float md2=1.,mz2=dot(z,z);orb=vec3(1e3);
 float lv=min(30.,14.+uIt*.6);for(int i=0;i<31;i++){if(float(i)>=lv)break;md2*=4.*mz2;z=qsq(z)+c;orb=min(orb,abs(z.xyz));mz2=dot(z,z);if(mz2>256.)break;}
 return .2*sqrt(mz2/md2)*log(mz2);}`,`mix(vec3(.1,.55,.85),vec3(1.,.4,.9),clamp(.5+.5*n.y+.3*n.x,0.,1.))*(.8+.5*clamp(length(orb),0.,1.))`,'3.');
const BGF=`void main(){vec2 uv=(gl_FragCoord.xy-.5*uR)/uR.y;gl_FragColor=vec4(bg(uv*1.3)+vec3(.02,.07,.12)*(1.-length(uv)),1.);}`;
const LVS=`attribute vec3 a;attribute float b;varying float vb,vd;void main(){vb=b;vd=a.z;gl_Position=vec4(a.xy,0.,1.);}`;
const LFS=`precision mediump float;varying float vb,vd;void main(){float g=1.-abs(vb);g=g*g;vec3 c=mix(vec3(1.,.36,.94),vec3(.4,.95,1.),vd);gl_FragColor=vec4(c*g*(.35+.65*vd)+vec3(1.)*pow(g,8.)*.6*vd,1.);}`;
const PVS=`attribute vec3 a;uniform vec2 uR,uC;uniform float uT,uZ;varying float vk;void main(){vec2 p=a.xy;p.x+=sin(uT*.8+p.y*.5)*.035*p.y;vk=a.z;vec2 s=(p-uC)/(uZ*2.6);gl_Position=vec4(s.x*2.*uR.y/uR.x,s.y*2.,0.,1.);gl_PointSize=1.;}`;
const PFS=`precision mediump float;varying float vk;void main(){gl_FragColor=vec4(mix(vec3(.05,.35,.3),vec3(.25,.9,1.),vk)*.22+vec3(.12,.0,.1)*(1.-vk),1.);}`;
const SRC={pert:PERT,f2d:F2D,newt:NEWT,phx:PHX,lyap:LYAP,bulb:BULB,meng:MENG,sierp:SIERP,mbox:MBOX,apol:APOL,cross:CROSS,qj:QJ,bg:BGF};
const UN=['uEye','uFw','uRt','uUp','uPx','uIt','uPd','uR','uT','uZ','uS','uK','uQ','uC','uJ','uCam','uRot','uOff','uMax','uN','uTH','uF','uP','uFlip','uOut','uOrb'];
function prog(fs,vs=VS){const p=gl.createProgram();for(const[t,s]of[[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const sh=gl.createShader(t);gl.shaderSource(sh,s);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh));gl.attachShader(p,sh)}
 gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));const u={};for(const n of UN)u[n]=gl.getUniformLocation(p,n);return{p,u}}
const cache={};const P=k=>cache[k]||(cache[k]=k==='line'?prog(LFS,LVS):k==='pts'?prog(PFS,PVS):prog(HEAD+SRC[k]));
const quad=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,quad);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
const lbuf=gl.createBuffer(),pbuf=gl.createBuffer(),orbTex=gl.createTexture();
// ================= big fixed-point reference orbits =================
const FB=420,ONE=1n<<BigInt(FB);
function dToB(v){if(!v)return 0n;const e=Math.floor(Math.log2(Math.abs(v))),k=52-e,m=BigInt(Math.round(v*2**Math.min(1000,k)));const sh=FB-Math.min(1000,k);return sh>=0?m<<BigInt(sh):m>>BigInt(-sh)}
function bToD(b){return Number(b>>BigInt(FB-60))/2**60}
function sToB(s){s=s.trim();const neg=s[0]==='-';if(neg||s[0]==='+')s=s.slice(1);const[i,f='']=s.split('.');const v=(BigInt(i+f)*ONE)/(10n**BigInt(f.length));return neg?-v:v}
let orbN=0,orbH=1,refKey='',refX=0n,refY=0n;
function buildRef(F,pw,cx,cy,jx,jy,maxIt,scale){const bits=Math.max(64,Math.ceil(-Math.log2(scale))+56),sh=BigInt(FB-bits),S=BigInt(bits);
 const R=v=>v>>sh;let x,y,ca,cb;const jul=F===1;if(jul){x=R(cx);y=R(cy);ca=R(dToB(jx));cb=R(dToB(jy))}else{x=0n;y=0n;ca=R(cx);cb=R(cy)}
 const W=1024,H=Math.ceil((maxIt+2)/W),buf=new Float32Array(W*H*4),k=2**bits;let n=0;
 const put=()=>{buf[n*4]=Number(x)/k;buf[n*4+1]=Number(y)/k;n++};put();
 for(let i=0;i<maxIt;i++){let nx,ny;
  if(F===4){let ax=x,ay=y;for(let p=1;p<pw;p++){const tx=(ax*x-ay*y)>>S;ay=(ax*y+ay*x)>>S;ax=tx}nx=ax+ca;ny=ay+cb}
  else{const x2=(x*x)>>S,y2=(y*y)>>S,xy=(x*y)>>S;nx=x2-y2+ca;ny=F===2?-2n*xy+cb:F===3?2n*(xy<0n?-xy:xy)+cb:2n*xy+cb}
  x=nx;y=ny;put();const fx=buf[n*4-4],fy=buf[n*4-3];if(fx*fx+fy*fy>1e4)break}
 gl.bindTexture(gl.TEXTURE_2D,orbTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,W,H,0,gl.RGBA,gl.FLOAT,buf);
 for(const[a,b]of[[gl.TEXTURE_MIN_FILTER,gl.NEAREST],[gl.TEXTURE_MAG_FILTER,gl.NEAREST],[gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE],[gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE]])gl.texParameteri(gl.TEXTURE_2D,a,b);
 orbN=n;orbH=H;refX=cx;refY=cy}
// ================= 4D polytopes =================
const PHI=(1+Math.sqrt(5))/2;
function edges(V,len){const E=[],e2=len*len;for(let i=0;i<V.length;i++)for(let j=i+1;j<V.length;j++){let d=0;for(let k=0;k<4;k++)d+=(V[i][k]-V[j][k])**2;if(Math.abs(d-e2)<1e-3)E.push([i,j])}return E}
const norm=V=>{const r=Math.hypot(...V[0]);return V.map(v=>v.map(x=>x/r))};
const tessV=[];for(let i=0;i<16;i++)tessV.push([i&1?1:-1,i&2?1:-1,i&4?1:-1,i&8?1:-1]);
const c24=[];for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)for(const s of[1,-1])for(const t of[1,-1]){const v=[0,0,0,0];v[i]=s;v[j]=t;c24.push(v)}
const c600=[];for(let i=0;i<4;i++)for(const s of[1,-1]){const v=[0,0,0,0];v[i]=s;c600.push(v)}
for(let i=0;i<16;i++)c600.push([i&1?.5:-.5,i&2?.5:-.5,i&4?.5:-.5,i&8?.5:-.5]);
const EVEN=[];(function perm(a,l){if(l===4){let inv=0;for(let i=0;i<4;i++)for(let j=i+1;j<4;j++)if(a[i]>a[j])inv++;if(!(inv&1))EVEN.push(a.slice());return}for(let i=l;i<4;i++){[a[l],a[i]]=[a[i],a[l]];perm(a,l+1);[a[l],a[i]]=[a[i],a[l]]}})([0,1,2,3],0);
for(const pm of EVEN)for(let s=0;s<8;s++){const b=[(s&1?-1:1)*PHI/2,(s&2?-1:1)*.5,(s&4?-1:1)/(2*PHI),0],v=[0,0,0,0];for(let k=0;k<4;k++)v[pm[k]]=b[k];c600.push(v)}
const POLY={tess:{V:norm(tessV),E:edges(tessV,2)},c24:{V:norm(c24),E:edges(c24,Math.SQRT2)},c600:{V:c600,E:edges(c600,1/PHI)}};
const LOUT=new Float32Array(800*6*4+130*6*4);
// ================= Barnsley fern (IFS) =================
let fernN=0;function fern(){const N=MOB?90000:220000,a=new Float32Array(N*3);let x=0,y=0;
 for(let i=0;i<N+20;i++){const r=Math.random();let nx,ny,k;if(r<.01){nx=0;ny=.16*y;k=0}else if(r<.86){nx=.85*x+.04*y;ny=-.04*x+.85*y+1.6;k=1}else if(r<.93){nx=.2*x-.26*y;ny=.23*x+.22*y+1.6;k=.6}else{nx=-.15*x+.28*y;ny=.26*x+.24*y+.44;k=.45}
  x=nx;y=ny;if(i>=20){const j=(i-20)*3;a[j]=x;a[j+1]=y;a[j+2]=k}}
 gl.bindBuffer(gl.ARRAY_BUFFER,pbuf);gl.bufferData(gl.ARRAY_BUFFER,a,gl.STATIC_DRAW);fernN=N}
// ================= scenes =================
const SEA=['-0.743643887037158704752191506114774','0.131825904205311970493132056385139'];
const D2=(o)=>Object.assign({g:'F',k:FLT?'pert':'f2d',deep:1},o);
const S=[
 D2({id:'mandel',n:'Mandelbrot',F:0,d:'z → z² + c with perturbation theory: a high-precision reference orbit lets you zoom past 1e-25 without pixelating (vs ~1e-5 with plain floats).',h:'Drag pan · scroll / pinch zoom · Auto-zoom dives',view:{C:['-0.6','0'],Z:1},dive:SEA}),
 D2({id:'julia',n:'Julia Set',F:1,d:'Fix c and iterate each point. c follows your pointer; zoom is perturbation-based and effectively infinite.',h:'Move pointer to steer c · drag / scroll zoom',view:{C:['0','0'],Z:.62}}),
 D2({id:'ship',n:'Burning Ship',F:3,d:'z → (|Re z| + i|Im z|)² + c. The absolute values fold the set into a burning hull with infinite masts.',h:'Drag pan · scroll / pinch zoom · Auto-zoom',view:{C:['-0.5','-0.5'],Z:.75},flip:-1}),
 D2({id:'tricorn',n:'Tricorn',F:2,d:'The Mandelbar: z → conj(z)² + c. Three-fold symmetry and wobbling filaments.',h:'Drag pan · scroll / pinch zoom · Auto-zoom',view:{C:['-0.3','0'],Z:.8}}),
 D2({id:'multi',n:'Multibrot',F:4,d:'z → zᵖ + c for integer powers 2–8; a power-p set has p−1 fold symmetry.',h:'Power slider · drag / scroll zoom',view:{C:['0','0'],Z:.75},sl:[['POW',2,8,4,1]]}),
 {id:'newton',g:'F',k:'newt',n:'Newton Fractal',d:'Newton’s method on z³ − 1. Each colour is the root a point converges to; the boundary is a fractal.',h:'Drag pan · scroll / pinch zoom',view:{C:['0','0'],Z:.8},anim:1},
 {id:'phoenix',g:'F',k:'phx',n:'Phoenix',d:'z → z² + c + p·zₙ₋₁. Memory of the previous iterate gives the curling phoenix wings.',h:'Drag pan · scroll / pinch zoom',view:{C:['0','0'],Z:.65},anim:1},
 {id:'lyap',g:'F',k:'lyap',n:'Lyapunov',d:'Logistic map with r switching AAABBB between the two axes; colour is the Lyapunov exponent (stable = lit).',h:'Drag pan · scroll / pinch zoom',view:{C:['3.4','3.4'],Z:.4}},
 {id:'fern',g:'F',k:'ifs',n:'Barnsley Fern',d:'An iterated function system: four affine maps chosen at random, 200k points accumulated into a swaying fern.',h:'Drag pan · scroll / pinch zoom',view:{C:['0.3','5'],Z:4.1},anim:1},
 {id:'bulb',g:'3',n:'Mandelbulb',k:'bulb',d:'Raymarched power-8 Mandelbulb using the Hubbard–Douady distance estimate, breathing its exponent.',h:'Drag to orbit · scroll/pinch to fly in',sl:[['PWR',0,3,1.5,.1]]},
 {id:'menger',g:'3',n:'Menger Sponge',k:'meng',d:'An infinite cube with its centres removed, five levels deep, raymarched with an exact box SDF.',h:'Drag to orbit · scroll/pinch to fly in'},
 {id:'sierp',g:'3',n:'Sierpinski Tetra',k:'sierp',d:'A tetrahedron folded into itself ten times: the 3D Sierpinski gasket via reflection folds.',h:'Drag to orbit · scroll/pinch to fly in'},
 {id:'mbox',g:'3',n:'Mandelbox',k:'mbox',d:'Box-fold then sphere-fold, scale −1.5, repeated: a crystalline city of folded space.',h:'Drag to orbit · scroll/pinch to fly in'},
 {id:'apol',g:'3',n:'Apollonian',k:'apol',d:'A Kleinian / Apollonian packing: endless sphere inversions in a repeating lattice.',h:'Drag to orbit · scroll/pinch to fly in'},
 {id:'tess',g:'D',n:'Tesseract',k:'poly',poly:'tess',d:'The 8-cell: 16 vertices, 32 edges, projected 4D → 3D → screen. Inner cube is the far w-side.',h:'Sliders rotate in XW / YW / ZW · drag to orbit'},
 {id:'c24',g:'D',n:'24-Cell',k:'poly',poly:'c24',d:'The self-dual polytope with no 3D analogue: 24 vertices, 96 edges, 24 octahedral cells.',h:'Sliders rotate in XW / YW / ZW · drag to orbit'},
 {id:'c600',g:'D',n:'600-Cell',k:'poly',poly:'c600',d:'120 vertices and 720 edges forming 600 tetrahedra, the 4D cousin of the icosahedron.',h:'Sliders rotate in XW / YW / ZW · drag to orbit'},
 {id:'slice',g:'D',n:'Cross-Section',k:'cross',d:'A 3D hyperplane sweeps along w through a rotating tesseract (or hypersphere). What you see is the slice.',h:'Slide W to sweep · drag to orbit',sl:[['W',-1.4,1.4,0,.01]],sw:1},
 {id:'qjulia',g:'D',n:'Quaternion Julia',k:'qj',d:'A 4D Julia set q → q² + c over the quaternions, cut by a 3D slice and raymarched.',h:'Slide W to move the slice · drag to orbit',sl:[['W',-.6,.6,0,.01]]}];
for(const s of S){if(s.k==='poly'||s.k==='cross')s.sl=[...(s.sl||[]),['XW',0,6.283,0,.01],['YW',0,6.283,0,.01],['ZW',0,6.283,0,.01]];s.ray=/bulb|meng|sierp|mbox|apol|cross|qj/.test(s.k);s.flat=!s.ray&&s.k!=='poly'}
// view state: centre as BigInt fixed point (deep scenes) and as double
let cur,cX=0n,cY=0n,Z=1,J=[-.8,.156],cam=[.6,.35],vals={},shape=0,spin=true,cycle=false,auto=false,dirty=true,diveT=null,lastPick=0;
const fmt=i=>String(i+1).padStart(2,'0');
for(const[i,s]of S.entries()){const b=document.createElement('button');b.innerHTML=`<i>${fmt(i)}</i>${s.n}`;b.onclick=()=>go(i);s.btn=b;$({F:'navF','3':'nav3',D:'navD'}[s.g]).appendChild(b)}
function setAuto(v,x){auto=v;if(x)x.setAttribute('aria-pressed',v);diveT=null;dirty=true}
function go(i,push=true){cur=S[i];cur.ray=cur.k in CD;S.forEach(s=>s.btn.toggleAttribute('aria-current',s===cur));cur.btn.scrollIntoView({block:'nearest',inline:'nearest'});
 $('sid').textContent=fmt(i);$('sname').textContent=cur.n;$('sdesc').textContent=cur.d;$('hint').textContent=cur.h;
 if(cur.view){cX=sToB(cur.view.C[0]);cY=sToB(cur.view.C[1]);Z=cur.view.Z}auto=false;diveT=null;refKey='';vals={};const ctl=$('ctl');ctl.innerHTML='';
 for(const[l,a,b,v,st]of cur.sl||[]){vals[l]=v;const r=document.createElement('label');r.className='row';r.innerHTML=`<span>${l}</span><input type="range" min="${a}" max="${b}" step="${st}" value="${v}" aria-label="${l}"><output>${(+v).toFixed(st>=1?0:2)}</output>`;
  const inp=r.querySelector('input'),o=r.querySelector('output');inp.oninput=()=>{vals[l]=+inp.value;o.textContent=(+inp.value).toFixed(st>=1?0:2);dirty=true;refKey=''};ctl.appendChild(r)}
 const bt=document.createElement('div');bt.className='btns';
 const add=(t,f,pr)=>{const x=document.createElement('button');x.textContent=t;if(pr!=null)x.setAttribute('aria-pressed',pr);x.onclick=()=>f(x);bt.appendChild(x)};
 if(cur.sw)add(shape?'Hypersphere':'Tesseract',x=>{shape^=1;x.textContent=shape?'Hypersphere':'Tesseract'});
 if(cur.g!=='F')add(spin?'Pause spin':'Spin',x=>{spin=!spin;x.textContent=spin?'Pause spin':'Spin';x.setAttribute('aria-pressed',spin)},spin);
 if(cur.deep&&FLT)add('Auto-zoom',x=>setAuto(!auto,x),false);
 if(cur.flat&&cur.k!=='ifs'&&!RM)add('Cycle colours',x=>{cycle=!cycle;x.setAttribute('aria-pressed',cycle)},cycle);
 if(cur.ray){add('Fly in',x=>{fly=!fly;x.setAttribute('aria-pressed',fly)},false);add('Reset view',()=>c3reset())}
 if(cur.view)add('Reset',()=>{cX=sToB(cur.view.C[0]);cY=sToB(cur.view.C[1]);Z=cur.view.Z;setAuto(false,bt.querySelector('[aria-pressed]'));dirty=true});
 ctl.appendChild(bt);if(cur.ray)c3reset();if(cur.k==='ifs'&&!fernN)fern();dirty=true;if(push)history.replaceState(null,'','#'+cur.id)}
// ================= 3D fly-in camera =================
const CD={bulb:3.2,meng:4.4,sierp:4.2,mbox:8.5,apol:2.4,cross:4.4,qj:3},PDMIN=1e-5;let C3=null,fly=false,T3=0,flyPick=0;
function c3reset(){const d=CD[cur.k]*Math.max(1,innerHeight/innerWidth*.85);C3={piv:[0,0,0],yaw:.6,pitch:.35,pd:d,D0:d};fly=false;const fb=[...document.querySelectorAll('.btns button')].find(b=>b.textContent==='Fly in');fb&&fb.setAttribute('aria-pressed',false);dirty=true}
const nz=v=>{const l=Math.hypot(...v);return v.map(x=>x/l)};
function basis(){const{yaw,pitch,piv,pd}=C3,cp=Math.cos(pitch),b=[Math.sin(yaw)*cp,Math.sin(pitch),Math.cos(yaw)*cp],fw=b.map(v=>-v),rt=nz([fw[2],0,-fw[0]]),up=[fw[1]*rt[2]-fw[2]*rt[1],fw[2]*rt[0]-fw[0]*rt[2],fw[0]*rt[1]-fw[1]*rt[0]];
 return{eye:piv.map((v,i)=>v+b[i]*pd),fw,rt,up}}
const zoom3v=()=>C3?C3.D0/C3.pd:1;
function setCam(u,B){gl.uniform3f(u.uEye,...B.eye);gl.uniform3f(u.uFw,...B.fw);gl.uniform3f(u.uRt,...B.rt);gl.uniform3f(u.uUp,...B.up);gl.uniform1f(u.uIt,Math.log2(Math.max(1,zoom3v())));gl.uniform1f(u.uPd,C3.pd)}
// raycast one pixel through the real shader: returns distance along the ray to the surface (or null on a miss)
function pick3(cx,cy){const B=basis(),px=cx*W/innerWidth,py=(innerHeight-cy)*H/innerHeight;gl.bindFramebuffer(gl.FRAMEBUFFER,pickFB);gl.viewport(0,0,1,1);
 full(cur.k,u=>{setCam(u,B);gl.uniform2f(u.uPx,px-.5,py-.5);gl.uniform1f(u.uOut,1);gl.uniform1f(u.uT,T3);gl.uniform1f(u.uS,vals.W??vals.PWR??0);gl.uniform1f(u.uK,shape);gl.uniform3f(u.uRot,...rotA());gl.uniform1f(u.uQ,240)});
 const o=new Uint8Array(4);gl.readPixels(0,0,1,1,gl.RGBA,gl.UNSIGNED_BYTE,o);gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,W,H);
 const v=(o[0]*65536+o[1]*256+o[2])/16777215;const uu=(px-.5*W)/H,vv=(py-.5*H)/H,rd=nz(B.fw.map((f,i)=>f*1.25+B.rt[i]*uu+B.up[i]*vv));return{t:v>=.99999?null:v*C3.pd*64,rd,B}}
function zoom3(cx,cy,f){if(!C3)return;if(f<1&&C3.pd<=PDMIN*1.01)return;const{t,rd,B}=pick3(cx,cy),tt=t??C3.pd,mv=tt*(1-f),eye=B.eye.map((e,i)=>e+rd[i]*mv);
 let pd=t!=null&&f<1?Math.min(C3.pd*f,t*f):C3.pd*f;pd=Math.max(PDMIN,Math.min(C3.D0*1.6,pd));C3.piv=eye.map((e,i)=>e+B.fw[i]*pd);C3.pd=pd;dirty=true}
function flyStep(dt,now){if(now-flyPick<60)return;flyPick=now;const r=pick3(innerWidth/2,innerHeight/2);if(r.t==null){C3.yaw+=dt*.3;return}
 const k=1-Math.exp(-dt*(RM?.3:.8)),B=r.B,eye=B.eye.map((e,i)=>e+B.fw[i]*r.t*k),pd=Math.max(PDMIN,r.t*(1-k));C3.piv=eye.map((e,i)=>e+B.fw[i]*pd);C3.pd=pd;if(pd<=PDMIN*1.05)c3reset()}
// ================= input =================
const pts=new Map();const zmin=()=>cur.deep&&FLT?1e-28:2e-5;
function wd(x,y){const h=innerHeight;return[(x-innerWidth/2)/h*Z*2.6,-(y-h/2)/h*Z*2.6*(cur.flip||1)]}
function shift(dx,dy){cX+=dToB(dx);cY+=dToB(dy);dirty=true}
function zoomAt(x,y,f){const a=wd(x,y);Z=Math.min(cur.k==='ifs'?8:3,Math.max(zmin(),Z*f));const b=wd(x,y);shift(a[0]-b[0],a[1]-b[1])}
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);cv.style.cursor='grabbing'});
cv.addEventListener('pointermove',e=>{
 if(cur.id==='julia'&&(e.pointerType==='mouse'?!e.buttons:pts.size===1)){J=[(e.clientX/innerWidth-.5)*2.2-.25,-(e.clientY/innerHeight-.5)*1.8];dirty=true;refKey='';if(e.pointerType!=='mouse')return}
 const p=pts.get(e.pointerId);if(!p)return;const dx=e.clientX-p[0],dy=e.clientY-p[1];
 if(pts.size===2){const[a,b]=[...pts.values()],d0=Math.hypot(a[0]-b[0],a[1]-b[1]);p[0]=e.clientX;p[1]=e.clientY;const[c,d]=[...pts.values()],d1=Math.hypot(c[0]-d[0],c[1]-d[1]);if(d0>0&&d1>0){if(cur.flat)zoomAt((c[0]+d[0])/2,(c[1]+d[1])/2,d0/d1);else if(cur.ray)zoom3((c[0]+d[0])/2,(c[1]+d[1])/2,Math.pow(d0/d1,1.6))}return}
 p[0]=e.clientX;p[1]=e.clientY;
 if(cur.flat){const s=Z*2.6/innerHeight;shift(-dx*s,dy*s*(cur.flip||1))}else if(cur.ray){C3.yaw-=dx*.006;C3.pitch=Math.max(-1.5,Math.min(1.5,C3.pitch+dy*.006))}else{cam[0]-=dx*.008;cam[1]=Math.max(-1.4,Math.min(1.4,cam[1]+dy*.008))}});
const up=e=>{pts.delete(e.pointerId);cv.style.cursor='grab'};cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();if(cur.flat)zoomAt(e.clientX,e.clientY,Math.exp(e.deltaY*.0015));else if(cur.ray)zoom3(e.clientX,e.clientY,Math.exp(Math.max(-150,Math.min(150,e.deltaY))*.003))},{passive:false});
addEventListener('keydown',e=>{if(e.target.tagName==='INPUT')return;const i=S.indexOf(cur);if(e.key==='ArrowRight'||e.key===']')go((i+1)%S.length);if(e.key==='ArrowLeft'||e.key==='[')go((i+S.length-1)%S.length)});
// ================= render =================
const DPR=Math.min(devicePixelRatio||1,MOB?1:1.25);let scale=MOB?.55:.7,W=0,H=0,T=0,T4=0,last=performance.now(),fr=0,acc=0,ft=0,vis=!document.hidden;
document.addEventListener('visibilitychange',()=>{vis=!document.hidden;if(vis){last=performance.now();dirty=true;requestAnimationFrame(loop)}});
function size(){const k=scale*(cur.ray?.62:1)*DPR,w=Math.max(1,Math.round(innerWidth*k)),h=Math.max(1,Math.round(innerHeight*k));if(w!==W||h!==H){W=cv.width=w;H=cv.height=h;dirty=true;$('res').textContent='RES '+w+'×'+h}}
function full(k,set){const{p,u}=P(k);gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,quad);const a=gl.getAttribLocation(p,'p');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,2,gl.FLOAT,false,0,0);
 gl.uniform2f(u.uR,W,H);gl.uniform1f(u.uT,T);gl.uniform2f(u.uCam,cam[0],cam[1]);set&&set(u);gl.drawArrays(gl.TRIANGLES,0,3);gl.disableVertexAttribArray(a)}
const maxIt=()=>Math.round(Math.min(MAXIT,(cur.id==='multi'?120:200)+60*Math.max(0,Math.log10(1/Z))+24*Math.max(0,Math.log10(1/Z))**2)*(scale<.45?.75:1));
function deep(out){const F=cur.F,pw=vals.POW||2,mi=maxIt(),key=[cur.id,pw,mi,J[0],J[1]].join();
 const off=[bToD(cX-refX),bToD(cY-refY)];
 if(key!==refKey||Math.hypot(off[0],off[1])>Z*1.5){buildRef(F,pw,cX,cY,J[0],J[1],mi,Z);refKey=key;off[0]=off[1]=0}
 full(FLT?'pert':'f2d',u=>{gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,orbTex);gl.uniform1i(u.uOrb,0);gl.uniform2f(u.uOff,off[0],off[1]);gl.uniform2f(u.uC,bToD(refX),bToD(refY));gl.uniform1f(u.uZ,Z);
  gl.uniform1f(u.uMax,mi);gl.uniform1f(u.uN,orbN);gl.uniform1f(u.uTH,orbH);gl.uniform1f(u.uF,F);gl.uniform1f(u.uP,pw);gl.uniform2f(u.uJ,J[0],J[1]);gl.uniform1f(u.uFlip,cur.flip||1);gl.uniform1f(u.uOut,out?1:0);gl.uniform1f(u.uT,cycle?T:0)})}
// auto-zoom: render a small iteration map, steer towards the deepest escaping pixel near the centre and keep diving
const pickFB=gl.createFramebuffer(),pickTex=gl.createTexture(),PK=48;gl.bindTexture(gl.TEXTURE_2D,pickTex);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,PK,PK,0,gl.RGBA,gl.UNSIGNED_BYTE,null);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.NEAREST);
gl.bindFramebuffer(gl.FRAMEBUFFER,pickFB);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,pickTex,0);gl.bindFramebuffer(gl.FRAMEBUFFER,null);const pix=new Uint8Array(PK*PK*4);
function pick(){const sw=W,sh=H;gl.bindFramebuffer(gl.FRAMEBUFFER,pickFB);W=H=PK;gl.viewport(0,0,PK,PK);deep(true);gl.readPixels(0,0,PK,PK,gl.RGBA,gl.UNSIGNED_BYTE,pix);gl.bindFramebuffer(gl.FRAMEBUFFER,null);W=sw;H=sh;
 let best=-1,bx=0,by=0;for(let y=0;y<PK;y++)for(let x=0;x<PK;x++){const o=(y*PK+x)*4;if(!pix[o+2])continue;const n=pix[o]+pix[o+1]*256,r=Math.hypot(x-PK/2,y-PK/2)/PK,sc=n*(1-r*.9);if(sc>best){best=sc;bx=x;by=y}}
 if(best<0)return null;const k=Z*2.6/PK;return[(bx+.5-PK/2)*k,(by+.5-PK/2)*k*(cur.flip||1)]}
function diveStep(dt,now){if(!diveT){if(cur.dive&&Z>.05){diveT=[sToB(cur.dive[0]),sToB(cur.dive[1])]}else diveT='pick'}
 if(diveT!=='pick'){const dx=bToD(diveT[0]-cX),dy=bToD(diveT[1]-cY),f=Math.min(1,dt*2.5);shift(dx*f,dy*f)}
 else if(now-lastPick>350){lastPick=now;const t=pick();if(t){const f=.35;shift(t[0]*f,t[1]*f)}}
 Z*=Math.exp(-dt*(RM?.25:.55));if(Z<1e-26){Z=cur.view.Z;cX=sToB(cur.view.C[0]);cY=sToB(cur.view.C[1]);diveT=null}dirty=true}
function rotA(){return[(vals.XW||0)+T4,(vals.YW||0)+T4*.7,(vals.ZW||0)+T4*.45]}
function drawPoly(){full('bg');const{V,E}=POLY[cur.poly],[a,b,c]=rotA(),asp=W/H,ca=Math.cos(cam[0]),sa=Math.sin(cam[0]),cb=Math.cos(cam[1]),sb=Math.sin(cam[1]),ka=[Math.cos(a),Math.sin(a),Math.cos(b),Math.sin(b),Math.cos(c),Math.sin(c)];
 const R=[];for(const v of V){let[x,y,z,w]=v,t;
  t=x*ka[0]-w*ka[1];w=x*ka[1]+w*ka[0];x=t;t=y*ka[2]-w*ka[3];w=y*ka[3]+w*ka[2];y=t;t=z*ka[4]-w*ka[5];w=z*ka[5]+w*ka[4];z=t;
  const k=1.6/(2.4-w);x*=k;y*=k;z*=k;t=x*ca+z*sa;z=-x*sa+z*ca;x=t;t=y*cb-z*sb;z=y*sb+z*cb;y=t;const q=1.9/(3.6-z),s=Math.min(1,asp)*1.5;R.push([x*q*s/asp,y*q*s,(w+1)/2])}
 const thick=(cur.poly==='c600'?2.2:3.4)*DPR*scale,out=LOUT;let o=0;
 const seg=(p0,p1,q0,q1,z,wd)=>{const dx=(q0-p0)*W,dy=(q1-p1)*H,l=Math.hypot(dx,dy)||1,nx=-dy/l*wd/W,ny=dx/l*wd/H;
  out[o]=p0+nx;out[o+1]=p1+ny;out[o+2]=z;out[o+3]=1;out[o+4]=p0-nx;out[o+5]=p1-ny;out[o+6]=z;out[o+7]=-1;out[o+8]=q0+nx;out[o+9]=q1+ny;out[o+10]=z;out[o+11]=1;
  out[o+12]=p0-nx;out[o+13]=p1-ny;out[o+14]=z;out[o+15]=-1;out[o+16]=q0-nx;out[o+17]=q1-ny;out[o+18]=z;out[o+19]=-1;out[o+20]=q0+nx;out[o+21]=q1+ny;out[o+22]=z;out[o+23]=1;o+=24};
 for(const[i,j]of E){const p=R[i],q=R[j],z=(p[2]+q[2])/2;seg(p[0],p[1],q[0],q[1],z,thick*(.6+.8*z))}
 for(const p of R){const r=thick*1.6*(.5+p[2]);seg(p[0]-r/W,p[1],p[0]+r/W,p[1],p[2],r)}
 const{p,u}=P('line');gl.useProgram(p);gl.bindBuffer(gl.ARRAY_BUFFER,lbuf);gl.bufferData(gl.ARRAY_BUFFER,out.subarray(0,o),gl.DYNAMIC_DRAW);
 const la=gl.getAttribLocation(p,'a'),lb=gl.getAttribLocation(p,'b');gl.enableVertexAttribArray(la);gl.vertexAttribPointer(la,3,gl.FLOAT,false,16,0);gl.enableVertexAttribArray(lb);gl.vertexAttribPointer(lb,1,gl.FLOAT,false,16,12);
 gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.drawArrays(gl.TRIANGLES,0,o/4);gl.disable(gl.BLEND);gl.disableVertexAttribArray(la);gl.disableVertexAttribArray(lb)}
function drawFern(){full('bg');const{p,u}=P('pts');gl.useProgram(p);gl.uniform2f(u.uR,W,H);gl.uniform1f(u.uT,RM?0:T);gl.uniform1f(u.uZ,Z);gl.uniform2f(u.uC,bToD(cX),bToD(cY));
 gl.bindBuffer(gl.ARRAY_BUFFER,pbuf);const a=gl.getAttribLocation(p,'a');gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,3,gl.FLOAT,false,0,0);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.drawArrays(gl.POINTS,0,fernN);gl.disable(gl.BLEND);gl.disableVertexAttribArray(a)}
const q=()=>Math.round((MOB?70:100)*Math.min(1.4,Math.max(.6,scale/.7)));
function frame(){gl.viewport(0,0,W,H);const k=cur.k;
 if(k==='poly')return drawPoly();if(k==='ifs')return drawFern();
 if(cur.deep)return deep(false);
 if(cur.flat)return full(k,u=>{gl.uniform2f(u.uC,bToD(cX),bToD(cY));gl.uniform1f(u.uZ,Z);gl.uniform1f(u.uK,cycle?1:0);gl.uniform1f(u.uT,cycle?T:0)});
 const r=rotA(),B=basis();
 full(k,u=>{setCam(u,B);gl.uniform2f(u.uPx,0,0);gl.uniform1f(u.uOut,0);gl.uniform1f(u.uT,T3);gl.uniform1f(u.uS,vals.W??vals.PWR??0);gl.uniform1f(u.uK,shape);gl.uniform3f(u.uRot,...r);gl.uniform1f(u.uQ,q())})}
function loop(now){if(!vis)return;requestAnimationFrame(loop);const dt=Math.min(.1,(now-last)/1000);last=now;if(!RM)T+=dt;if(spin)T4+=dt*(RM?.1:.25);
 if(auto&&cur.deep)diveStep(dt,now);
 if(cur.ray&&C3){if(zoom3v()<1.5&&!RM)T3+=dt;if(fly)flyStep(dt,now);else if(spin&&!RM&&zoom3v()<1.5)C3.yaw+=dt*.12}
 const animated=!cur.flat||auto||(cycle&&!RM)||(cur.anim&&!RM&&(cur.k==='ifs'||cycle));
 size();if(!animated&&!dirty){fr=0;acc=0;return}
 const t0=performance.now();frame();gl.flush();dirty=false;ft+=performance.now()-t0;
 fr++;acc+=dt;if(acc>=1){const fps=fr/acc;$('fps').textContent=Math.round(fps)+' FPS';
  if(fps<48&&scale>.32)scale=Math.max(.32,scale*.85);else if(fps>58&&scale<(MOB?.75:1))scale=Math.min(MOB?.75:1,scale*1.06);fr=0;acc=0;ft=0}
 const zz=cur.ray?zoom3v():1/Z;$('zm').textContent=(cur.flat&&cur.k!=='ifs')||cur.ray?'ZOOM '+(zz<1e4?zz.toFixed(zz<10?1:0)+'×':zz.toExponential(1).replace('e+','e')+'×'):''}
addEventListener('resize',()=>{dirty=true});
const hs=location.hash.slice(1),hi=S.findIndex(s=>s.id===hs);go(hi<0?0:hi,false);size();
requestAnimationFrame(loop);
window.__lan4={zoom3,pick3,fly:()=>{fly=true},c3:()=>C3,go,S,set:o=>{Object.assign(vals,o);dirty=true},auto:()=>{const b=[...document.querySelectorAll('.btns button')].find(b=>b.textContent==='Auto-zoom');b&&b.click()},zoom:()=>Z,setView:(x,y,z)=>{cX=sToB(x);cY=sToB(y);Z=z;dirty=true}};
})();

/* LLC space hub: each floating panel gets its own pixel-stepped silhouette (clip-path polygon in px, rebuilt on resize). */
(function(){
'use strict';
function rng(seed){return function(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296}}
var q=function(v,s){return Math.round(v/s)*s};
/* staircase from a to b with pixel step s (axis-aligned stairs, like pixel art) */
function stair(pts,ax,ay,bx,by,s){var dx=bx-ax,dy=by-ay,n=Math.max(1,Math.round(Math.max(Math.abs(dx),Math.abs(dy))/s));
 for(var i=1;i<=n;i++){var x=q(ax+dx*i/n,1),y=q(ay+dy*i/n,1),px=q(ax+dx*(i-1)/n,1);pts.push([x,q(ay+dy*(i-1)/n,1)]);pts.push([x,y]);}}
/* edge along one side with an offset function f(t) (inward, px), quantized to block b */
function edge(pts,x0,y0,x1,y1,b,f,nx,ny){var L=Math.hypot(x1-x0,y1-y0),n=Math.max(1,Math.round(L/b));
 for(var i=0;i<n;i++){var t0=i/n,t1=(i+1)/n,o=q(f((t0+t1)/2),Math.max(2,b/4));
  var ax=x0+(x1-x0)*t0+nx*o,ay=y0+(y1-y0)*t0+ny*o,bx=x0+(x1-x0)*t1+nx*o,by=y0+(y1-y0)*t1+ny*o;pts.push([Math.round(ax),Math.round(ay)],[Math.round(bx),Math.round(by)]);}}
function rect4(w,h,b,f){var p=[];edge(p,0,0,w,0,b,function(t){return f(t,0)},0,1);edge(p,w,0,w,h,b,function(t){return f(t,1)},-1,0);edge(p,w,h,0,h,b,function(t){return f(t,2)},0,-1);edge(p,0,h,0,0,b,function(t){return f(t,3)},1,0);return p}
var S={
 /* jagged dungeon slab: chipped stone blocks along every edge, stepped broken corners */
 ashaad:function(w,h,m){var r=rng(7),B=16*m,c=[];for(var i=0;i<400;i++)c.push(r());var k=0;
  return rect4(w,h,B,function(t,side){var v=c[(k++)%400];var corner=Math.min(t,1-t)<.04?18*m:0;return corner+(v<.45?0:v<.8?8*m:18*m)})},
 /* sea: stepped waves top and bottom, bubble bites on the sides */
 'sea-of-thought':function(w,h,m){var A=14*m;return rect4(w,h,8*m,function(t,side){
  if(side===0)return A+A*Math.sin(t*Math.PI*2*Math.max(3,w/260));
  if(side===2)return A+A*Math.sin(t*Math.PI*2*Math.max(3,w/320)+1.3);
  var u=(t*5)%1;return u>.35&&u<.65?10*m*Math.sin((u-.35)/.3*Math.PI):0})},
 /* the void: warped swirling edge with a few deep cracks */
 'the-void':function(w,h,m){var r=rng(42),cr=[];for(var i=0;i<4;i++)cr.push([i,r()*.8+.1,(r()*20+18)*m]);
  return rect4(w,h,6*m,function(t,side){var o=14*m+13*m*Math.sin(t*Math.PI*6+side*1.7)*Math.sin(t*Math.PI*2.3+side);
   for(var j=0;j<cr.length;j++)if(cr[j][0]===side){var d=Math.abs(t-cr[j][1]);if(d<.035)o+=cr[j][2]*(1-d/.035)}return Math.max(0,o)})},
 /* browser window: raised tab at the top-left, stepped corners */
 'game-of-websites':function(w,h,m){var T=28,c=10*m,tx0=40*m,tx1=Math.min(w*.4,300*m),p=[];
  p.push([0,T+c]);stair(p,0,T+c,c,T,4*m);p.push([tx0-12*m,T]);stair(p,tx0-12*m,T,tx0,0,4*m);p.push([tx1,0]);stair(p,tx1,0,tx1+12*m,T,4*m);
  p.push([w-c,T]);stair(p,w-c,T,w,T+c,4*m);p.push([w,h-c]);stair(p,w,h-c,w-c,h,4*m);p.push([c,h]);stair(p,c,h,0,h-c,4*m);return p},
 /* TV: bulging screen with big stepped corners and two little feet */
 channels:function(w,h,m){var F=22,R=48*m,p=[],H=h-F,s=8*m;
  p.push([0,R]);stair(p,0,R,R,0,s);p.push([w-R,0]);stair(p,w-R,0,w,R,s);p.push([w,H-R]);stair(p,w,H-R,w-R,H,s);
  p.push([w*.82+30*m,H],[w*.82+30*m,h],[w*.82-30*m,h],[w*.82-30*m,H],[w*.18+30*m,H],[w*.18+30*m,h],[w*.18-30*m,h],[w*.18-30*m,H]);
  p.push([R,H]);stair(p,R,H,0,H-R,s);return p},
 /* code brackets: < panel > with pixel-stepped points */
 contact:function(w,h,m){var D=Math.min(40*m,w*.08),p=[];p.push([D,0],[w-D,0]);stair(p,w-D,0,w,h/2,6*m);stair(p,w,h/2,w-D,h,6*m);p.push([D,h]);stair(p,D,h,0,h/2,6*m);stair(p,0,h/2,D,0,6*m);return p},
 /* arena: stepped octagon ring */
 ballfight:function(w,h,m){var C=Math.min(90*m,w*.12,h*.2),p=[],s=8*m;
  p.push([C,0],[w-C,0]);stair(p,w-C,0,w,C,s);p.push([w,h-C]);stair(p,w,h-C,w-C,h,s);p.push([C,h]);stair(p,C,h,0,h-C,s);p.push([0,C]);stair(p,0,C,C,0,s);return p}
};
function apply(sec,fn){var w=sec.offsetWidth,h=sec.offsetHeight;if(!w||!h)return;var m=w<600?.6:1;
 var pts=fn(w,h,m).map(function(p){return Math.max(0,Math.min(w,p[0]))+'px '+Math.max(0,Math.min(h,p[1]))+'px'});
 sec.style.clipPath='polygon('+pts.join(',')+')';}
var all=[].slice.call(document.querySelectorAll('.llc-shape')).map(function(wr){var sec=wr.firstElementChild;return {sec:sec,fn:S[wr.getAttribute('data-shape')]}}).filter(function(o){return o.sec&&o.fn});
function go(){all.forEach(function(o){apply(o.sec,o.fn)})}
go();addEventListener('load',go);addEventListener('resize',go);
if('ResizeObserver' in window){var ro=new ResizeObserver(go);all.forEach(function(o){ro.observe(o.sec)})}
window.__llcShapes={refresh:go};
})();

/* The Binding of Ashaad — "Trapdoor drop" transition.
   A candle-lit basement floor with a trapdoor. The trapdoor swings open, you fall down the shaft, and the Ashaad page
   rises up to meet you. Everything is procedural (canvas 2D) and a pure function of time t, so it is delta-time based,
   framerate independent and scrubbable. The transition is only a lead-in: the final state is the resting page itself.
   Plays once, only when the section scrolls into view, one transition at a time. Click / any key skips. Reduced motion: no transition. */
(function () {
'use strict';
var SEC = document.getElementById('ashaad');
if (!SEC || window.__ashaadIntroLoaded) return;
window.__ashaadIntroLoaded = true;
var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var OFF = /[?&]ashintro=off\b/.test(location.search);   /* dev/test switch: never auto-play */

/* ---------- timeline (seconds) ---------- */
var T = {
  fade: 0.6,          /* page -> dark basement */
  snap: 0.7,          /* (hidden under the overlay) scroll so the section sits exactly where the final page rests */
  knock1: 1.25, knock2: 1.55,
  open0: 1.75, open1: 2.95,   /* trapdoor swings open */
  fall0: 3.0, fall1: 5.25,    /* the fall */
  black0: 4.9,                /* shaft -> black */
  thud: 5.3,
  rise0: 6.05, rise1: 7.85,   /* the page rises (DOM) */
  ovFade0: 6.1, ovFade1: 7.6, /* overlay -> transparent */
  end: 8.0
};
var DUR = T.end;

/* ---------- helpers ---------- */
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function sm(v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); }
function lerp(a, b, k) { return a + (b - a) * k; }
function hh(n) { n = n | 0; n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
function R(i, s) { return hh(i * 7919 + (s || 0) * 104729 + 13); }
function vn(x, s) { var i = Math.floor(x), f = x - i; f = f * f * (3 - 2 * f); return lerp(R(i, s), R(i + 1, s), f); }
function rng(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mkc(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, Math.round(w)); c.height = Math.max(1, Math.round(h)); return c; }
function rgb(r, g, b, k) { k = k == null ? 1 : k; return 'rgb(' + Math.round(r * k) + ',' + Math.round(g * k) + ',' + Math.round(b * k) + ')'; }

/* ---------- state ---------- */
var S = null, played = false, busy = false;
function reveal() { SEC.classList.add('llc-shown'); }
function otherBusy() { return !!window.__llcIntroBusy && window.__llcIntroBusy !== 'ashaad'; }

/* ================================================================= scene geometry */
var F = 1000, L = 450, ZEND = 12 * L, NR = 46;      /* camera-to-floor distance, ring spacing, total fall, ring count */
function camZ(t) { var u = clamp((t - T.fall0) / (T.fall1 - T.fall0), 0, 1); return ZEND * Math.pow(u, 1.6); }

function metrics(s) {
  var W = s.ov.clientWidth || innerWidth, H = s.ov.clientHeight || innerHeight;
  var dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  var u = clamp(Math.max(W / 1600, H / 900), .4, 1.7);
  return { W: W, H: H, dpr: dpr, u: u, cx: W / 2, cy: H * .52, RR: 150 * u };
}

/* ---------- floor texture (procedural dark basement tiles, blood, cracks) ---------- */
function buildFloor(M) {
  var FW = Math.ceil(M.W * 1.3), FH = Math.ceil(M.H * 1.3), k = 2;
  var cv = mkc(FW * k, FH * k), c = cv.getContext('2d'), r = rng(1234), u = M.u, i, j, q;
  c.scale(k, k); c.translate(FW / 2, FH / 2);
  var TS = 112 * u, x0 = -Math.ceil(FW / 2 / TS) * TS, y0 = -Math.ceil(FH / 2 / TS) * TS;
  var PAL = [[74, 46, 30], [66, 52, 40], [82, 44, 32], [58, 44, 36], [88, 60, 40], [62, 38, 28]];
  c.fillStyle = '#0a0403'; c.fillRect(-FW / 2, -FH / 2, FW, FH);
  function slab(x, y, w, h, col, lum, seed) {
    var rr = rng(seed), g = 2.2 * u;
    c.fillStyle = rgb(col[0], col[1], col[2], lum); c.fillRect(x + g, y + g, w - 2 * g, h - 2 * g);
    var gr = c.createLinearGradient(x, y, x + w, y + h); gr.addColorStop(0, 'rgba(255,210,150,.09)'); gr.addColorStop(.55, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.32)');
    c.fillStyle = gr; c.fillRect(x + g, y + g, w - 2 * g, h - 2 * g);
    for (var n = 0; n < 7; n++) {
      var bx = x + rr() * w, by = y + rr() * h, br = (6 + rr() * 26) * u, dk = rr() < .6;
      var gg = c.createRadialGradient(bx, by, 0, bx, by, br); gg.addColorStop(0, dk ? 'rgba(8,3,2,.35)' : 'rgba(170,120,80,.12)'); gg.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = gg; c.fillRect(bx - br, by - br, br * 2, br * 2);
    }
    for (n = 0; n < 14; n++) { c.fillStyle = rr() < .5 ? 'rgba(0,0,0,.35)' : 'rgba(255,220,170,.10)'; c.fillRect(x + rr() * w, y + rr() * h, 1.6 * u, 1.6 * u); }
    c.fillStyle = 'rgba(255,210,160,.10)'; c.fillRect(x + g, y + g, w - 2 * g, 1.6 * u); c.fillRect(x + g, y + g, 1.6 * u, h - 2 * g);
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(x + g, y + h - g - 2.6 * u, w - 2 * g, 2.6 * u); c.fillRect(x + w - g - 2.6 * u, y + g, 2.6 * u, h - 2 * g);
    if (rr() < .22) {
      var cx2 = rr() < .5 ? x + g : x + w - g, cy2 = rr() < .5 ? y + g : y + h - g, cs = (10 + rr() * 16) * u, sx = cx2 === x + g ? 1 : -1, sy = cy2 === y + g ? 1 : -1;
      c.fillStyle = '#0a0403'; c.beginPath(); c.moveTo(cx2, cy2); c.lineTo(cx2 + sx * cs, cy2); c.lineTo(cx2, cy2 + sy * cs * .8); c.closePath(); c.fill();
    }
  }
  for (j = 0; y0 + j * TS < FH / 2; j++) for (i = 0; x0 + i * TS < FW / 2; i++) {
    var x = x0 + i * TS, y = y0 + j * TS, v = hh(i * 91 + j * 17 + 5), w = hh(i * 31 + j * 71 + 9), col = PAL[(hh(i * 13 + j * 57) * PAL.length) | 0], lum = .62 + .5 * v, sd = i * 1000 + j;
    if (w < .07) {
      c.fillStyle = '#070302'; c.fillRect(x + 2, y + 2, TS - 4, TS - 4);
      var rb = rng(sd + 9); for (q = 0; q < 9; q++) { var rx = x + 10 * u + rb() * (TS - 20 * u), ry = y + 10 * u + rb() * (TS - 20 * u), rs = (5 + rb() * 12) * u; c.fillStyle = rgb(col[0], col[1], col[2], .45 + rb() * .3); c.beginPath(); c.moveTo(rx, ry - rs); c.lineTo(rx + rs, ry); c.lineTo(rx + rs * .3, ry + rs * .8); c.lineTo(rx - rs, ry + rs * .2); c.closePath(); c.fill(); }
    } else if (w < .3) {
      if (v < .5) { slab(x, y, TS / 2, TS, col, lum, sd); slab(x + TS / 2, y, TS / 2, TS, PAL[(sd * 7) % PAL.length], lum * .92, sd + 3); }
      else { slab(x, y, TS, TS / 2, col, lum, sd); slab(x, y + TS / 2, TS, TS / 2, PAL[(sd * 5) % PAL.length], lum * .95, sd + 4); }
    } else if (w < .38) {
      for (q = 0; q < 4; q++) slab(x + (q & 1) * TS / 2, y + (q >> 1) * TS / 2, TS / 2, TS / 2, PAL[(sd + q * 3) % PAL.length], lum * (.85 + .2 * hh(sd * 4 + q)), sd * 4 + q);
    } else slab(x, y, TS, TS, col, lum, sd);
  }
  for (i = 0; i < 10; i++) {
    var sx2 = (r() - .5) * FW, sy2 = (r() - .5) * FH, sr = (40 + r() * 110) * u;
    c.strokeStyle = 'rgba(20,10,4,.35)'; c.lineWidth = 3 * u; c.beginPath(); c.ellipse(sx2, sy2, sr, sr * .7, r() * 3, 0, 6.28); c.stroke();
    var gs = c.createRadialGradient(sx2, sy2, 0, sx2, sy2, sr); gs.addColorStop(0, 'rgba(10,6,2,.3)'); gs.addColorStop(1, 'rgba(10,6,2,0)'); c.fillStyle = gs; c.beginPath(); c.ellipse(sx2, sy2, sr, sr * .7, 0, 0, 6.28); c.fill();
  }
  for (i = 0; i < 120; i++) { var mx = x0 + ((r() * FW / TS) | 0) * TS, my = y0 + r() * FH, ms = (2 + r() * 5) * u; if (r() < .5) { mx = x0 + r() * FW; my = y0 + ((r() * FH / TS) | 0) * TS; } c.fillStyle = 'rgba(' + (40 + r() * 30 | 0) + ',' + (60 + r() * 30 | 0) + ',28,.5)'; c.beginPath(); c.arc(mx, my, ms, 0, 6.28); c.fill(); }
  c.save(); c.translate(-M.W * .3, M.H * .2); c.rotate(-.09);
  var RW = Math.min(300 * u, M.W * .22), RH = RW * .64;
  c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(-RW / 2 + 6 * u, -RH / 2 + 8 * u, RW, RH);
  c.fillStyle = '#4a0b0d'; c.fillRect(-RW / 2, -RH / 2, RW, RH);
  c.strokeStyle = '#b89a62'; c.lineWidth = 5 * u; c.strokeRect(-RW / 2 + 10 * u, -RH / 2 + 10 * u, RW - 20 * u, RH - 20 * u);
  c.strokeStyle = '#2a0506'; c.lineWidth = 3 * u; c.strokeRect(-RW / 2 + 19 * u, -RH / 2 + 19 * u, RW - 38 * u, RH - 38 * u);
  c.fillStyle = '#b89a62'; for (q = -3; q <= 3; q++) { c.save(); c.translate(q * RW * .1, 0); c.rotate(.785); c.fillRect(-6 * u, -6 * u, 12 * u, 12 * u); c.restore(); }
  c.strokeStyle = '#7a1418'; c.lineWidth = 2 * u; c.beginPath(); c.moveTo(-RW * .35, -RH * .22); c.lineTo(RW * .35, -RH * .22); c.moveTo(-RW * .35, RH * .22); c.lineTo(RW * .35, RH * .22); c.stroke();
  c.strokeStyle = '#a08758'; c.lineWidth = 1.6 * u; for (q = 0; q < 26; q++) { var fx = -RW / 2 + (q + .5) * RW / 26; c.beginPath(); c.moveTo(fx, -RH / 2); c.lineTo(fx + (r() - .5) * 3 * u, -RH / 2 - (6 + r() * 6) * u); c.moveTo(fx, RH / 2); c.lineTo(fx + (r() - .5) * 3 * u, RH / 2 + (6 + r() * 6) * u); c.stroke(); }
  for (q = 0; q < 40; q++) { c.fillStyle = 'rgba(0,0,0,' + (.15 + r() * .25) + ')'; c.fillRect((r() - .5) * RW, (r() - .5) * RH, (4 + r() * 18) * u, (2 + r() * 5) * u); }
  c.fillStyle = '#0a0403'; c.beginPath(); c.moveTo(RW / 2, RH * .1); c.lineTo(RW / 2 - 22 * u, RH * .25); c.lineTo(RW / 2 - 8 * u, RH * .42); c.lineTo(RW / 2, RH / 2); c.closePath(); c.fill();
  c.restore();
  c.lineCap = 'round'; c.lineJoin = 'round';
  for (i = 0; i < 22; i++) {
    var px = (r() - .5) * FW, py = (r() - .5) * FH, an = r() * 6.28, len = 4 + (r() * 7 | 0), pts = [[px, py]];
    for (j = 0; j < len; j++) { an += (r() - .5) * 1.2; px += Math.cos(an) * (12 + r() * 24) * u; py += Math.sin(an) * (12 + r() * 24) * u; pts.push([px, py]); if (r() < .25) { var bx2 = px + Math.cos(an + 1.2) * 18 * u, by2 = py + Math.sin(an + 1.2) * 18 * u; c.strokeStyle = 'rgba(5,2,1,.7)'; c.lineWidth = 1.4 * u; c.beginPath(); c.moveTo(px, py); c.lineTo(bx2, by2); c.stroke(); } }
    c.beginPath(); pts.forEach(function (pt, n) { n ? c.lineTo(pt[0], pt[1]) : c.moveTo(pt[0], pt[1]); });
    c.strokeStyle = 'rgba(255,200,140,.07)'; c.lineWidth = 1.2 * u; c.save(); c.translate(1.2 * u, 1.2 * u); c.stroke(); c.restore();
    c.strokeStyle = 'rgba(4,1,0,.85)'; c.lineWidth = (1.8 + r() * 1.6) * u; c.stroke();
  }
  function blood(cx, cy, rad, n, al) {
    for (var b = 0; b < n; b++) {
      var a2 = r() * 6.28, d = r() * rad, bx = cx + Math.cos(a2) * d, by = cy + Math.sin(a2) * d * .7, br = (8 + r() * 30) * u;
      var gg = c.createRadialGradient(bx, by, 0, bx, by, br); gg.addColorStop(0, 'rgba(120,10,12,' + al + ')'); gg.addColorStop(.75, 'rgba(80,6,8,' + al * .85 + ')'); gg.addColorStop(1, 'rgba(40,0,0,0)');
      c.fillStyle = gg; c.beginPath(); c.arc(bx, by, br, 0, 6.28); c.fill();
    }
    for (b = 0; b < n; b++) { c.fillStyle = 'rgba(110,8,10,.75)'; c.beginPath(); c.arc(cx + (r() - .5) * rad * 3, cy + (r() - .5) * rad * 2, (1.5 + r() * 4) * u, 0, 6.28); c.fill(); }
  }
  blood(M.RR * 1.2, M.RR * 2.0, 110 * u, 16, .6); blood(-M.W * .28, -M.H * .12, 60 * u, 9, .5); blood(M.W * .33, M.H * .22, 80 * u, 11, .5); blood(-M.W * .08, M.H * .38, 50 * u, 7, .45);
  c.strokeStyle = 'rgba(90,6,8,.5)'; c.lineCap = 'round';
  for (q = 0; q < 3; q++) { c.lineWidth = (9 - q * 2.5) * u; c.beginPath(); c.moveTo(M.W * .3 + q * 9 * u, M.H * .22); c.bezierCurveTo(M.W * .2, M.H * .12 + q * 6 * u, M.RR * 2.2, M.RR * 1.4, M.RR * 1.25 + q * 6 * u, M.RR * .9); c.stroke(); }
  [[-.33, .06, .4], [.36, -.24, -.7], [-.2, -.35, 1.2], [.18, .3, 2.3], [.06, -.38, .1]].forEach(function (bn) {
    c.save(); c.translate(bn[0] * M.W, bn[1] * M.H); c.rotate(bn[2]); var bl = 40 * u, bw = 7 * u;
    c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(-bl / 2 + 3 * u, -bw / 2 + 4 * u, bl, bw);
    var bg = c.createLinearGradient(0, -bw, 0, bw); bg.addColorStop(0, '#d4c6a2'); bg.addColorStop(1, '#8c7c5c'); c.fillStyle = bg; c.fillRect(-bl / 2, -bw / 2, bl, bw);
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(function (e) { c.beginPath(); c.arc(e[0] * bl / 2, e[1] * bw / 2, bw * .72, 0, 6.28); c.fill(); });
    c.restore();
  });
  c.save(); c.translate(M.W * .27, -M.H * .08); c.rotate(.35); var sk = 26 * u;
  c.fillStyle = 'rgba(0,0,0,.55)'; c.beginPath(); c.ellipse(4 * u, 6 * u, sk, sk * 1.05, 0, 0, 6.28); c.fill();
  var skg = c.createRadialGradient(-sk * .3, -sk * .4, 0, 0, 0, sk * 1.2); skg.addColorStop(0, '#e6dbbd'); skg.addColorStop(1, '#8e7f5e'); c.fillStyle = skg;
  c.beginPath(); c.arc(0, -sk * .1, sk, 0, 6.28); c.fill(); c.fillRect(-sk * .55, sk * .5, sk * 1.1, sk * .55);
  c.fillStyle = '#140804'; c.beginPath(); c.ellipse(-sk * .38, 0, sk * .26, sk * .3, 0, 0, 6.28); c.ellipse(sk * .38, 0, sk * .26, sk * .3, 0, 0, 6.28); c.fill();
  c.beginPath(); c.moveTo(0, sk * .3); c.lineTo(-sk * .1, sk * .5); c.lineTo(sk * .1, sk * .5); c.closePath(); c.fill();
  for (q = -2; q <= 2; q++) c.fillRect(q * sk * .2 - 1 * u, sk * .62, 2 * u, sk * .4);
  c.restore();
  c.strokeStyle = 'rgba(220,200,170,.16)'; c.lineWidth = 3 * u; c.setLineDash([26 * u, 9 * u, 6 * u, 14 * u]);
  c.beginPath(); c.arc(0, 0, M.RR * 1.85, 0, 6.28); c.stroke(); c.beginPath(); c.arc(0, 0, M.RR * 2.05, 0, 6.28); c.stroke(); c.setLineDash([]);
  c.fillStyle = 'rgba(0,0,0,.42)'; c.fillRect(-FW / 2, -FH / 2, FW, FH);
  return { cv: cv, FW: FW, FH: FH };
}

function drawCandles(c, X, Y, sc, t, i, u, al) {
  var n = 2 + (i % 2), order = [];
  for (var k = 0; k < n; k++) order.push({ dx: (R(i * 7 + k, 81) - .5) * 44, dy: (R(i * 7 + k, 82) - .5) * 26, h: 18 + 26 * R(i * 7 + k, 83), w: 11 + 5 * R(i * 7 + k, 84), sd: i * 7 + k });
  order.sort(function (a, b) { return a.dy - b.dy; });
  c.save(); c.globalAlpha = al;
  order.forEach(function (o) {
    var s = sc * u * 1.6, x = X + o.dx * s, y = Y + o.dy * s, h = o.h * s, w = o.w * s, fl = candleFlicker(t, o.sd);
    c.fillStyle = 'rgba(0,0,0,.5)'; c.beginPath(); c.ellipse(x + w * .5, y + w * .15, w * 1.1, w * .42, 0, 0, 6.28); c.fill();
    var g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, '#7a6648'); g.addColorStop(.35, '#f2e6c8'); g.addColorStop(.7, '#cdb88f'); g.addColorStop(1, '#5e4c34');
    c.fillStyle = g; c.fillRect(x - w / 2, y - h, w, h); c.beginPath(); c.ellipse(x, y, w / 2, w * .2, 0, 0, 6.28); c.fill();
    c.fillStyle = '#d9c9a2'; for (var d = 0; d < 2; d++) { var ddx = x + (R(o.sd * 3 + d, 85) - .5) * w * .8, dl = h * (.15 + .3 * R(o.sd * 3 + d, 86)); c.fillRect(ddx - w * .09, y - h, w * .18, dl); c.beginPath(); c.arc(ddx, y - h + dl, w * .09, 0, 6.28); c.fill(); }
    c.fillStyle = '#fbf3dc'; c.beginPath(); c.ellipse(x, y - h, w / 2, w * .2, 0, 0, 6.28); c.fill();
    c.strokeStyle = '#1a0e06'; c.lineWidth = Math.max(1, 1.4 * s); c.beginPath(); c.moveTo(x, y - h); c.lineTo(x, y - h - 3.5 * s); c.stroke();
    var sw = (vn(t * 3.1 + o.sd * 5, o.sd + 9) - .5) * 4 * s, fh = (12 + 5 * fl) * s, fw = (4.2 + .8 * fl) * s, fx = x, fy = y - h - 2 * s;
    c.save(); c.globalCompositeOperation = 'lighter';
    var gr = (34 + 10 * fl) * s, gg = c.createRadialGradient(fx, fy - fh * .45, 0, fx, fy - fh * .45, gr); gg.addColorStop(0, 'rgba(255,200,90,' + (.55 * fl) + ')'); gg.addColorStop(.4, 'rgba(255,130,40,' + (.2 * fl) + ')'); gg.addColorStop(1, 'rgba(255,90,20,0)');
    c.fillStyle = gg; c.fillRect(fx - gr, fy - fh * .45 - gr, gr * 2, gr * 2); c.restore();
    c.fillStyle = 'rgba(255,150,40,.95)'; c.beginPath(); c.moveTo(fx + sw, fy - fh); c.quadraticCurveTo(fx + fw * 1.25, fy - fh * .35, fx, fy); c.quadraticCurveTo(fx - fw * 1.25, fy - fh * .35, fx + sw, fy - fh); c.fill();
    c.fillStyle = 'rgba(255,248,210,.98)'; c.beginPath(); c.moveTo(fx + sw * .6, fy - fh * .7); c.quadraticCurveTo(fx + fw * .6, fy - fh * .25, fx, fy - fh * .04); c.quadraticCurveTo(fx - fw * .6, fy - fh * .25, fx + sw * .6, fy - fh * .7); c.fill();
    c.fillStyle = 'rgba(70,110,255,.55)'; c.beginPath(); c.ellipse(fx, fy - fh * .06, fw * .35, fh * .08, 0, 0, 6.28); c.fill();
  });
  c.restore();
}

/* ---------- door art (top side + underside) ---------- */
function buildDoor(M) {
  var A = Math.round(M.RR * 2 * 2.2), out = {}, r = rng(77);
  function art(under) {
    var cv = mkc(A, A), c = cv.getContext('2d'), n = 6, pw = A / n, i, j;
    var pal = under ? [[44, 26, 14], [38, 22, 12], [48, 29, 16]] : [[96, 58, 30], [84, 50, 26], [104, 64, 34], [90, 54, 28]];
    for (i = 0; i < n; i++) {
      var p = pal[(r() * pal.length) | 0], x = i * pw;
      var g = c.createLinearGradient(x, 0, x + pw, 0); g.addColorStop(0, rgb(p[0], p[1], p[2], 1.12)); g.addColorStop(.5, rgb(p[0], p[1], p[2], 1)); g.addColorStop(1, rgb(p[0], p[1], p[2], .8));
      c.fillStyle = g; c.fillRect(x, 0, pw, A);
      for (j = 0; j < 9; j++) { var gx = x + 8 + r() * (pw - 16), gy = r() * A, gl = 40 + r() * 160; c.strokeStyle = 'rgba(0,0,0,' + (.12 + r() * .18) + ')'; c.lineWidth = 1 + r() * 2.2; c.beginPath(); c.moveTo(gx, gy); c.quadraticCurveTo(gx + (r() - .5) * 8, gy + gl / 2, gx + (r() - .5) * 6, gy + gl); c.stroke(); }
      c.fillStyle = 'rgba(0,0,0,.85)'; c.fillRect(x - 2, 0, 5, A);
      c.fillStyle = 'rgba(255,200,140,.10)'; c.fillRect(x + 4, 0, 2, A);
    }
    if (!under) {
      [.19, .8].forEach(function (fy) {
        var y = fy * A, h = A * .1;
        var gg = c.createLinearGradient(0, y, 0, y + h); gg.addColorStop(0, '#34343a'); gg.addColorStop(.5, '#1d1d22'); gg.addColorStop(1, '#101014');
        c.fillStyle = gg; c.fillRect(0, y, A, h); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, y, A, 3); c.fillStyle = '#000'; c.fillRect(0, y + h - 3, A, 3);
        for (var k = 0; k < 7; k++) { var rx = A * (.07 + k * .143), ry = y + h / 2; c.fillStyle = '#000'; c.beginPath(); c.arc(rx + 2, ry + 3, A * .017, 0, 6.28); c.fill(); c.fillStyle = '#6b665c'; c.beginPath(); c.arc(rx, ry, A * .015, 0, 6.28); c.fill(); c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.arc(rx - 2, ry - 2, A * .005, 0, 6.28); c.fill(); }
      });
      /* hinge straps */
      [.2, .8].forEach(function (fx) { c.fillStyle = '#17171b'; c.fillRect(fx * A - A * .035, 0, A * .07, A * .17); c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(fx * A - A * .035, 0, 3, A * .17); });
      /* ring handle */
      var hx = A * .5, hy = A * .9;
      c.fillStyle = '#101014'; c.fillRect(hx - A * .05, hy - A * .075, A * .1, A * .06);
      c.lineWidth = A * .022; c.strokeStyle = '#000'; c.beginPath(); c.arc(hx, hy + 3, A * .062, 0, 6.28); c.stroke();
      c.lineWidth = A * .02; c.strokeStyle = '#5b574e'; c.beginPath(); c.arc(hx, hy, A * .062, 0, 6.28); c.stroke();
      c.lineWidth = 3; c.strokeStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(hx, hy, A * .062, 3.6, 4.7); c.stroke();
      /* blood drips on the door */
      c.fillStyle = 'rgba(120,10,10,.6)'; for (i = 0; i < 6; i++) { var bx = A * (.12 + r() * .76), bl = A * (.04 + r() * .14); c.fillRect(bx, A * (.55 + r() * .15), 6 + r() * 6, bl); }
    } else {
      [.22, .78].forEach(function (fy) { c.fillStyle = 'rgba(14,8,4,.95)'; c.fillRect(0, fy * A - A * .045, A, A * .09); c.fillStyle = 'rgba(255,200,140,.07)'; c.fillRect(0, fy * A - A * .045, A, 3); });
      c.strokeStyle = 'rgba(14,8,4,.9)'; c.lineWidth = A * .07; c.beginPath(); c.moveTo(A * .08, A * .26); c.lineTo(A * .92, A * .74); c.stroke();
      c.fillStyle = 'rgba(160,150,140,.1)'; for (i = 0; i < 40; i++) { c.fillRect(r() * A, r() * A, 2 + r() * 3, 2 + r() * 3); }
    }
    /* frame / bevel */
    c.lineWidth = A * .028; c.strokeStyle = '#080302'; c.strokeRect(0, 0, A, A);
    c.lineWidth = 3; c.strokeStyle = 'rgba(255,200,140,.18)'; c.strokeRect(A * .03, A * .03, A * .94, A * .94);
    return cv;
  }
  out.top = art(false); out.under = art(true); out.A = A; return out;
}

function build(s) {
  var M = metrics(s); s.M = M;
  var cv = s.cv; cv.width = Math.round(M.W * M.dpr); cv.height = Math.round(M.H * M.dpr);
  s.floor = buildFloor(M); s.door = buildDoor(M);
  s.words = ['SKIBIDI', 'GYATT', 'OHIO', 'RIZZ', 'SIGMA', 'NO CAP', 'LOCK IN', 'SUS', 'MEWING', 'AURA'];
  s.cand = [[-.44, -.34], [.43, -.31], [-.40, .33], [.46, .30], [-.13, -.45], [.15, .46]];
}

/* ================================================================= painting */
function shakeAmp(t) {
  var a = 0, u = clamp((t - T.fall0) / (T.fall1 - T.fall0), 0, 1);
  if (t >= T.knock1) a += 3.2 * Math.exp(-(t - T.knock1) * 14);
  if (t >= T.knock2) a += 4.2 * Math.exp(-(t - T.knock2) * 14);
  if (t >= T.open1 - .25) a += 11 * Math.exp(-(t - (T.open1 - .25)) * 6.5);
  if (t > 1.0 && t < T.open0) a += 1.4 * sm((t - 1.0) / .7);
  if (t >= T.fall0 && t < T.fall1) a += 1.5 + 12 * Math.pow(u, 1.4);
  if (t >= T.thud) a += 26 * Math.exp(-(t - T.thud) * 5.2);
  return a;
}
function doorAngle(t) { /* radians; hinge on the far edge, door flung open to ~165 deg */
  var a = 0, k;
  k = clamp((t - T.knock1) / .26, 0, 1); a += .075 * Math.sin(k * Math.PI);
  k = clamp((t - T.knock2) / .26, 0, 1); a += .11 * Math.sin(k * Math.PI);
  var u = clamp((t - T.open0) / (T.open1 - T.open0), 0, 1);
  if (u > 0) { var g = u * u * (3 - 2 * u); g = lerp(g, u, .35); var e = 1 - Math.exp(-5.2 * g) * Math.cos(7.5 * g) * (1 - g * .0); e = clamp(e, 0, 1.06); a += e * 2.88; if (u >= 1) a = 2.88 + (a - 2.88) * 0 + 0; }
  return a;
}

function paint(s, t) {
  var M = s.M, c = s.ctx, W = M.W, H = M.H, u = M.u, RR = M.RR;
  c.setTransform(M.dpr, 0, 0, M.dpr, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.clearRect(0, 0, W, H);
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  var z = camZ(t), fu = clamp((t - T.fall0) / (T.fall1 - T.fall0), 0, 1);
  var amp = shakeAmp(t) * u, sx = (vn(t * 26, 1) - .5) * 2 * amp, sy = (vn(t * 31, 2) - .5) * 2 * amp;
  var roll = fu > 0 ? Math.sin(t * 1.7) * .045 * Math.min(1, fu * 3) : 0;
  var zf = clamp(z / F, 0, 1), px = M.cx + sx, py = lerp(M.cy, H / 2, sm(zf)) + sy;
  var scl = z < F * .94 ? F / (F - z) : 0;

  c.save();
  c.translate(M.cx, H / 2); c.rotate(roll); c.translate(-M.cx, -H / 2);

  if (scl) {
    var f = s.floor, doorA = doorAngle(t), fog = sm((scl - 1.08) / 1.1);
    /* ---- floor plane (world units = px at scale 1, origin = trapdoor centre) ---- */
    c.save(); c.translate(px, py); c.scale(scl, scl);
    c.drawImage(f.cv, -f.FW / 2, -f.FH / 2, f.FW, f.FH);
    /* stone rim */
    var ro = RR * 1.24;
    c.fillStyle = '#2a1c14'; c.fillRect(-ro, -ro, ro * 2, ro * 2);
    c.fillStyle = 'rgba(255,200,150,.1)'; c.fillRect(-ro, -ro, ro * 2, 3); c.fillRect(-ro, -ro, 3, ro * 2);
    c.fillStyle = 'rgba(0,0,0,.55)'; c.fillRect(-ro, ro - 4, ro * 2, 4); c.fillRect(ro - 4, -ro, 4, ro * 2);
    c.strokeStyle = 'rgba(0,0,0,.75)'; c.lineWidth = 2.5 * u;
    for (var q = 1; q < 6; q++) { var kk = -ro + q * (ro * 2 / 6); c.beginPath(); c.moveTo(kk, -ro); c.lineTo(kk, -RR); c.moveTo(kk, RR); c.lineTo(kk, ro); c.moveTo(-ro, kk); c.lineTo(-RR, kk); c.moveTo(RR, kk); c.lineTo(ro, kk); c.stroke(); }
    if (fog > 0) { c.fillStyle = 'rgba(0,0,0,' + (fog * .92).toFixed(3) + ')'; c.fillRect(-f.FW / 2, -f.FH / 2, f.FW, f.FH); }
    c.restore();

    /* ---- the shaft seen through the hole ---- */
    c.save(); c.beginPath(); c.rect(px - RR * scl, py - RR * scl, RR * scl * 2, RR * scl * 2); c.clip();
    drawShaft(s, t, z, px, py, fu);
    c.restore();

    /* ---- door ---- */
    c.save(); c.translate(px, py); c.scale(scl, scl);
    var hy = -RR, ca = Math.cos(doorA), sa = Math.sin(doorA), wsc = 1 + .1 * sa;
    if (doorA > .0005) {
      c.save(); c.translate(0, hy); c.scale(wsc, ca * (1 + .06 * sa));
      c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = 26 * u; c.shadowOffsetY = 8 * u * (ca > 0 ? 1 : -1);
      c.drawImage(ca >= 0 ? s.door.top : s.door.under, -RR, 0, RR * 2, RR * 2);
      c.shadowColor = 'transparent'; c.shadowBlur = 0;
      var dk = ca >= 0 ? .5 * sa * sa + .08 : .38; c.fillStyle = 'rgba(0,0,0,' + dk + ')'; c.fillRect(-RR, 0, RR * 2, RR * 2);
      c.restore();
    } else { c.drawImage(s.door.top, -RR, hy, RR * 2, RR * 2); }
    /* hinges on the rim */
    c.fillStyle = '#101014'; [-.58, .58].forEach(function (fx) { c.fillRect(fx * RR - 14 * u, hy - 12 * u, 28 * u, 12 * u); });
    c.restore();

    /* ---- candle light pools (additive), kept out of the pit ---- */
    c.save(); c.globalCompositeOperation = 'lighter';
    if (doorA < .02) { c.save(); c.translate(px, py); c.scale(scl, scl); var gd = c.createRadialGradient(-RR * .3, -RR * .3, 0, 0, 0, RR * 1.6); gd.addColorStop(0, 'rgba(255,150,60,.20)'); gd.addColorStop(1, 'rgba(255,100,30,0)'); c.fillStyle = gd; c.fillRect(-RR, -RR, RR * 2, RR * 2); c.restore(); }
    c.beginPath(); c.rect(0, 0, W, H); c.rect(px - RR * scl, py - RR * scl, RR * scl * 2, RR * scl * 2); c.clip('evenodd');
    s.cand.forEach(function (cd, i) {
      var fl = candleFlicker(t, i), X = px + cd[0] * W * scl, Y = py + cd[1] * H * scl, rad = Math.max(W, H) * .3 * (.92 + .16 * fl) * scl;
      if (X < -rad || X > W + rad || Y < -rad || Y > H + rad) return;
      var g = c.createRadialGradient(X, Y, 0, X, Y, rad);
      var lp = (1 - fog) * fl; g.addColorStop(0, 'rgba(255,165,70,' + (.42 * lp) + ')'); g.addColorStop(.18, 'rgba(255,130,45,' + (.22 * lp) + ')'); g.addColorStop(.5, 'rgba(200,80,25,' + (.07 * lp) + ')'); g.addColorStop(1, 'rgba(120,40,10,0)');
      c.fillStyle = g; c.fillRect(X - rad, Y - rad, rad * 2, rad * 2);
    });
    c.restore();
    /* warm glow from the pit once it is open */
    if (doorA > .3) { c.save(); c.globalCompositeOperation = 'lighter'; var o = sm((doorA - .3) / 1.6) * .35; var gp = c.createRadialGradient(px, py, RR * scl * .5, px, py, RR * scl * 2.2); gp.addColorStop(0, 'rgba(160,30,10,' + o + ')'); gp.addColorStop(1, 'rgba(160,30,10,0)'); c.fillStyle = gp; c.fillRect(0, 0, W, H); c.restore(); }

    /* ---- candles on the floor (they fade with the floor as you drop) ---- */
    s.cand.forEach(function (cd, i) {
      var X = px + cd[0] * W * scl, Y = py + cd[1] * H * scl;
      if (X < -120 * scl || X > W + 120 * scl || Y < -120 * scl || Y > H + 120 * scl) return;
      drawCandles(c, X, Y, scl, t, i, u, 1 - fog * .85);
    });

    /* ---- dust: motes + the cloud that billows out of the pit ---- */
    dust(s, t, px, py, scl);
  }

  if (!scl && z > 0 && t < T.fall1 + .02) drawShaft(s, t, z, px, py, fu);
  /* ---- falling: speed streaks, tumbling debris, brainrot words ---- */
  if (z > 0 && t < T.fall1 + .02) fallFx(s, t, z, px, py, fu);
  c.restore();

  /* ---- candle-lit vignette over everything ---- */
  var fv = .9 + .1 * vn(t * 8.5, 11), blackA = sm((t - T.black0) / (T.fall1 - T.black0 + .05));
  if (t >= T.fall1 - .02) blackA = 1;
  var vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * .18 * fv, W / 2, H / 2, Math.max(W, H) * .78);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(.55, 'rgba(0,0,0,.45)'); vg.addColorStop(1, 'rgba(0,0,0,.95)');
  c.fillStyle = vg; c.fillRect(0, 0, W, H);
  if (blackA > 0) { c.fillStyle = 'rgba(0,0,0,' + blackA + ')'; c.fillRect(0, 0, W, H); }

  /* ---- after the landing: embers + floor banner on black ---- */
  if (t >= T.thud - .05) afterFx(s, t);
}
function candleFlicker(t, i) { return clamp(.84 + .2 * (vn(t * 7.5 + i * 13, i + 3) - .5) * 2 + .07 * Math.sin(t * 21 + i * 2.1), .55, 1.12); }

/* ---------- shaft ---------- */
function drawShaft(s, t, z, px, py, fu) {
  var M = s.M, c = s.ctx, W = M.W, H = M.H, RR = M.RR, big = Math.max(W, H) * 3;
  var rings = [], k, kn = -1;
  for (k = 0; k <= NR; k++) { var d = F + k * L - z; if (d > 14) { var h = RR * F / d; rings.push({ k: k, h: h, d: d }); } }
  if (!rings.length) return;
  c.fillStyle = '#050201'; c.fillRect(px - big, py - big, big * 2, big * 2);
  var BR = [74, 44, 28];
  function face(i, corners, shade, dk) { c.fillStyle = rgb(BR[0], BR[1], BR[2], shade * (1 - dk)); c.beginPath(); c.moveTo(corners[0], corners[1]); c.lineTo(corners[2], corners[3]); c.lineTo(corners[4], corners[5]); c.lineTo(corners[6], corners[7]); c.closePath(); c.fill(); }
  /* segments: between ring i (nearer, bigger) and ring i+1; plus the open space in front of the nearest ring */
  var segs = [];
  segs.push({ k: rings[0].k - 1, ho: big, hi: rings[0].h, d: Math.max(rings[0].d - L * .5, 20) });
  for (var i = 0; i < rings.length - 1; i++) segs.push({ k: rings[i].k, ho: rings[i].h, hi: rings[i + 1].h, d: rings[i].d + L * .5 });
  var faceMul = [.62, .88, .74, .88]; /* top, right, bottom, left */
  for (var si = segs.length - 1; si >= 0; si--) {
    var sg = segs[si], ho = sg.ho, hi = sg.hi, dk = 1 - Math.exp(-(sg.d) / (6.2 * F)), kk = sg.k;
    if (hi < .6) continue;
    var lum = .8 + .35 * hh(kk * 53 + 7);
    var quads = [
      [-ho, -ho, ho, -ho, hi, -hi, -hi, -hi],   /* top */
      [ho, -ho, ho, ho, hi, hi, hi, -hi],       /* right */
      [-ho, ho, ho, ho, hi, hi, -hi, hi],       /* bottom */
      [-ho, -ho, -ho, ho, -hi, hi, -hi, -hi]    /* left */
    ];
    var nb = 5;
    for (var fc = 0; fc < 4; fc++) {
      var q = quads[fc], sh = faceMul[fc] * lum;
      c.save(); c.translate(px, py);
      /* bricks along the face */
      for (var b = 0; b < nb; b++) {
        var f0 = (b + .5 * (kk & 1) - (kk & 1 ? 0 : 0)) / nb, f1 = (b + 1 + .5 * (kk & 1)) / nb;
        f0 = clamp(f0, 0, 1); f1 = clamp(f1, 0, 1); if (f1 - f0 < .001) continue;
        var vj = .78 + .4 * hh(kk * 977 + fc * 131 + b * 17);
        var P = function (f, o) { /* point on outer(o=0) or inner(o=1) edge of this face */
          var x0 = q[o ? 6 : 0], y0 = q[o ? 7 : 1], x1 = q[o ? 4 : 2], y1 = q[o ? 5 : 3]; return [lerp(x0, x1, f), lerp(y0, y1, f)];
        };
        var a0 = P(f0, 0), a1 = P(f1, 0), b1 = P(f1, 1), b0 = P(f0, 1);
        c.fillStyle = rgb(BR[0] + 6 * (vj - 1) * 8, BR[1], BR[2], sh * vj * (1 - dk));
        c.beginPath(); c.moveTo(a0[0], a0[1]); c.lineTo(a1[0], a1[1]); c.lineTo(b1[0], b1[1]); c.lineTo(b0[0], b0[1]); c.closePath(); c.fill();
      }
      c.restore();
    }
    /* mortar: ring outline + radial joints */
    c.save(); c.translate(px, py);
    c.strokeStyle = 'rgba(6,2,1,' + (.9 - dk * .3) + ')'; c.lineWidth = Math.max(1, Math.min(ho, W) * .014);
    if (ho < big) c.strokeRect(-ho, -ho, ho * 2, ho * 2);
    c.lineWidth = Math.max(.8, hi * .02);
    for (var fc2 = 0; fc2 < 4; fc2++) { var qq = quads[fc2]; for (var b2 = 1; b2 < nb; b2++) { var ff = (b2 + .5 * (kk & 1)) / nb; if (ff >= 1) continue; var ox = lerp(qq[0], qq[2], ff), oy = lerp(qq[1], qq[3], ff), ix = lerp(qq[6], qq[4], ff), iy = lerp(qq[7], qq[5], ff); if (ho >= big) continue; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ix, iy); c.stroke(); } }
    c.restore();
    /* wall sconces: warm light that streams past */
    if (kk % 4 === 1 && hi > 3) {
      var side = (kk >> 2) & 1 ? 1 : -1, mx = side * (ho + hi) / 2, g = .42 * (1 - dk) + .06;
      c.save(); c.translate(px, py); c.globalCompositeOperation = 'lighter';
      var rad = (ho - hi) * 1.1 + hi * .8, gg = c.createRadialGradient(mx, 0, 0, mx, 0, rad); gg.addColorStop(0, 'rgba(255,170,70,' + g + ')'); gg.addColorStop(.4, 'rgba(255,110,30,' + g * .35 + ')'); gg.addColorStop(1, 'rgba(255,90,20,0)');
      c.fillStyle = gg; c.fillRect(mx - rad, -rad, rad * 2, rad * 2);
      c.restore();
    }
  }
  /* far end of the shaft: dim ember light that grows near the bottom */
  var far = rings[rings.length - 1], gl = .1 + .5 * sm((fu - .6) / .4);
  c.save(); c.globalCompositeOperation = 'lighter';
  var fr = Math.max(far.h * 5, Math.min(W, H) * .1), fg = c.createRadialGradient(px, py, 0, px, py, fr);
  fg.addColorStop(0, 'rgba(255,120,40,' + gl + ')'); fg.addColorStop(1, 'rgba(120,30,10,0)'); c.fillStyle = fg; c.fillRect(px - fr, py - fr, fr * 2, fr * 2); c.restore();
}

/* ---------- falling effects ---------- */
function fallFx(s, t, z, px, py, fu) {
  var M = s.M, c = s.ctx, W = M.W, H = M.H, u = M.u, RR = M.RR, i;
  var vis = clamp((z - 60) / 700, 0, 1);
  c.save(); c.globalCompositeOperation = 'lighter';
  /* speed streaks */
  var SPAN = 9 * L;
  for (i = 0; i < 90; i++) {
    var ang = R(i, 21) * 6.2832, rho = RR * (.18 + .8 * Math.sqrt(R(i, 22))), d0 = R(i, 23) * SPAN;
    var d1 = ((d0 - z) % SPAN + SPAN) % SPAN + 40, d2 = d1 + Math.max(60, (z - camZ(t - .045)) * 1.0 + 40);
    var r1 = rho * F / d1, r2 = rho * F / d2; if (r1 > Math.max(W, H)) continue;
    var al = .5 * vis * clamp(1 - d1 / SPAN, .1, 1) * (.4 + .6 * R(i, 24));
    c.strokeStyle = 'rgba(255,' + (190 + (R(i, 25) * 50 | 0)) + ',' + (120 + (R(i, 26) * 80 | 0)) + ',' + al + ')'; c.lineWidth = Math.max(.8, r1 * .012 * (1 + R(i, 27)));
    c.beginPath(); c.moveTo(px + Math.cos(ang) * r2, py + Math.sin(ang) * r2); c.lineTo(px + Math.cos(ang) * r1, py + Math.sin(ang) * r1); c.stroke();
  }
  c.restore();
  /* floor chunks that fall with you at first, then streak past */
  for (i = 0; i < 16; i++) {
    var rel = F * (1.02 + .9 * R(i, 31)) - z * .52 - 80 * R(i, 32); if (rel < 25) continue;
    var sc2 = F / rel, an = R(i, 33) * 6.2832, rh = RR * (.5 + .55 * R(i, 34)) * (R(i, 35) < .5 ? 1 : .7), X = px + Math.cos(an) * rh * sc2, Y = py + Math.sin(an) * rh * sc2;
    var sz = (10 + 20 * R(i, 36)) * u * sc2; if (sz > Math.max(W, H) * .5 || X < -sz || X > W + sz || Y < -sz || Y > H + sz) continue;
    var dkc = 1 - Math.exp(-rel / (5 * F)); c.save(); c.translate(X, Y); c.rotate(t * (R(i, 37) - .5) * 5 + R(i, 38) * 6);
    c.fillStyle = rgb(86, 52, 32, .5 + .5 * (1 - dkc)); c.beginPath();
    for (var v = 0; v < 6; v++) { var a2 = v / 6 * 6.2832, rr2 = sz * (.6 + .5 * R(i * 9 + v, 39)); c.lineTo(Math.cos(a2) * rr2, Math.sin(a2) * rr2); }
    c.closePath(); c.fill(); c.strokeStyle = 'rgba(6,2,1,.9)'; c.lineWidth = Math.max(1, sz * .1); c.stroke(); c.restore();
  }
  /* brainrot words flying past */
  c.save(); c.textAlign = 'center'; c.textBaseline = 'middle';
  var cols = ['#ff44cc', '#44ccff', '#ffdd33', '#66ff66', '#ff6644'];
  for (i = 0; i < 9; i++) {
    var d = ((F * 7 * R(i, 41) + 2100 + i * 700 - z * 1.0) % (F * 8) + F * 8) % (F * 8) + 60, scw = F / d;
    var an3 = (R(i, 42) < .5 ? -1 : 1) * (.4 + 1.1 * R(i, 43)) + (R(i, 44) - .5) * .4, wx = px + Math.sin(an3) * RR * 1.1 * scw * 1.3, wy = py + (R(i, 45) - .5) * RR * 1.8 * scw;
    var fs = 22 * u * scw; if (fs > 150 || fs < 3) continue; fs = Math.min(fs, 96 * u);
    var al2 = .55 * clamp(1 - d / (F * 6), 0, 1) * clamp((1000 - Math.abs(wx - px) * .0) / 1000, 0, 1) * sm(fu * 5) * (1 - sm((fu - .85) / .15));
    if (al2 < .02) continue;
    var wd = s.words[(i * 3 + 1) % s.words.length], mg = 56 * u;
    c.font = '700 ' + fs.toFixed(1) + 'px Silkscreen, "Courier New", monospace'; var tw = c.measureText(wd).width;
    if (tw > W - 2 * mg) { fs *= (W - 2 * mg) / tw; tw = W - 2 * mg; c.font = '700 ' + fs.toFixed(1) + 'px Silkscreen, "Courier New", monospace'; }
    if (z < F * .7 || wx - tw / 2 < mg || wx + tw / 2 > W - mg || wy - fs / 2 < mg || wy + fs / 2 > H - mg) continue; /* only words that sit fully on screen */
    c.globalAlpha = al2; c.fillStyle = cols[i % 5]; c.fillText(wd, wx, wy);
  }
  c.restore();
  /* dust along the shaft edges is the streaks above; add a faint central mist */
}

/* ---------- ambient dust + the cloud from the opening hatch ---------- */
function dust(s, t, px, py, scl) {
  var M = s.M, c = s.ctx, W = M.W, H = M.H, u = M.u, RR = M.RR, i;
  c.save(); c.globalCompositeOperation = 'lighter';
  var tw = 1 - sm((t - T.fall0 - .6) / .6);
  if (tw > 0) for (i = 0; i < 70; i++) {
    var x = (((R(i, 51) * W + (R(i, 52) - .5) * 22 * t * u + 14 * Math.sin(t * .6 + i)) % W) + W) % W, y = (((R(i, 53) * H - (6 + 14 * R(i, 54)) * t * u) % H) + H) % H;
    var al = tw * (.18 + .3 * R(i, 55)) * (.5 + .5 * Math.sin(t * (1.5 + R(i, 56) * 2) + i * 3)), r = (.9 + 1.8 * R(i, 57)) * u;
    c.fillStyle = 'rgba(255,' + (190 + (R(i, 58) * 50 | 0)) + ',130,' + al + ')'; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
  }
  c.restore();
  /* dust billowing out of the hole */
  c.save(); c.translate(px, py); c.scale(scl, scl);
  var T0 = T.knock1, tt;
  for (i = 0; i < 44; i++) {
    var ts = i < 6 ? T.knock1 + .02 * i : i < 12 ? T.knock2 + .02 * (i - 6) : T.open0 + .05 + 1.2 * R(i, 61);
    var age = t - ts; if (age < 0 || age > 2.2) continue;
    var ang = R(i, 62) * 6.2832, e0 = i < 12 ? 1 : R(i, 63);
    var ox = i < 12 ? (R(i, 64) - .5) * RR * 2 : (R(i, 64) - .5) * RR * 1.9, oy = i < 12 ? -RR + (R(i, 65) - .3) * 20 * u : (R(i, 65) - .5) * RR * 1.9;
    var vx = (R(i, 66) - .5) * 70 * u, vy = (R(i, 67) - .8) * 55 * u, dr = 1 - Math.exp(-age * 1.4);
    var X = ox + vx * dr * 1.6, Y = oy + vy * dr * 1.6, rad = ((i < 12 ? 12 : 26) + (i < 12 ? 40 : 90) * dr * R(i, 68)) * u;
    var al = (i < 12 ? .16 : .24) * Math.pow(1 - age / 2.2, 1.6) * sm(age / .12);
    var g = c.createRadialGradient(X, Y, 0, X, Y, rad); g.addColorStop(0, 'rgba(176,140,104,' + al + ')'); g.addColorStop(1, 'rgba(120,90,60,0)');
    c.fillStyle = g; c.beginPath(); c.arc(X, Y, rad, 0, 6.2832); c.fill();
  }
  c.restore();
}

/* ---------- landing: embers + banner on black ---------- */
function afterFx(s, t) {
  var M = s.M, c = s.ctx, W = M.W, H = M.H, u = M.u, i, a0 = t - T.thud;
  c.save(); c.globalCompositeOperation = 'lighter';
  if (a0 < .45) { var fl = .35 * Math.exp(-a0 * 9); c.fillStyle = 'rgba(255,150,60,' + fl + ')'; c.fillRect(0, 0, W, H); }
  for (i = 0; i < 46; i++) {
    var age = a0 - R(i, 71) * .6; if (age < 0) continue;
    var x = W * (.1 + .8 * R(i, 72)) + (R(i, 73) - .5) * 80 * u * age + Math.sin(age * 2 + i) * 14 * u, y = H * (.55 + .4 * R(i, 74)) - (30 + 90 * R(i, 75)) * u * age;
    var al = .7 * Math.max(0, 1 - age / 2.6) * sm(age / .2) * (.5 + .5 * Math.sin(age * 9 + i * 5)), r = (1 + 2.2 * R(i, 76)) * u;
    c.fillStyle = 'rgba(255,' + (150 + (R(i, 77) * 80 | 0)) + ',60,' + al + ')'; c.beginPath(); c.arc(x, y, r, 0, 6.2832); c.fill();
  }
  c.restore();
  var ba = sm((t - (T.thud + .12)) / .25) * (1 - sm((t - 5.72) / .24));
  if (ba > 0.01) {
    c.save(); c.globalAlpha = ba; c.textAlign = 'center'; c.textBaseline = 'middle';
    var fs = Math.round(clamp(W * .06, 26, 84)); c.font = '700 ' + fs + 'px Silkscreen, "Courier New", monospace';
    c.lineJoin = 'round'; c.strokeStyle = '#000'; c.lineWidth = fs * .18; c.strokeText('BASEMENT I', W / 2, H / 2); c.fillStyle = '#e8d8b8'; c.fillText('BASEMENT I', W / 2, H / 2);
    c.restore();
  }
}

/* ================================================================= the page side (DOM) */
function restY() { var nav = document.querySelector('nav'), nh = nav ? nav.getBoundingClientRect().height : 0; return Math.max(0, Math.round(SEC.getBoundingClientRect().top + window.pageYOffset - nh)); }
function jump(y) { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }
function riseEls() { return [].slice.call(SEC.querySelectorAll('[data-rise]')); }
function clearPage() {
  riseEls().forEach(function (el) { el.style.transform = ''; el.style.willChange = ''; el.style.transformOrigin = ''; });
  var st = SEC.querySelector('.ashx-stage'); if (st) { st.style.transform = ''; st.style.willChange = ''; }
}
function applyPage(s, t) {
  var H = s.M.H;
  var inRise = t >= T.fade && t < T.rise1;
  if (!inRise) { if (s.pageDirty) { clearPage(); s.pageDirty = false; } return; }
  s.pageDirty = true;
  var els = riseEls(), amp = 0, w = clamp(1 - (t - T.rise0) / 1.6, 0, 1), sx = 0, sy = 0;
  if (t >= T.rise0) { amp = 13 * w * w * s.M.u; sx = (vn(t * 24, 5) - .5) * 2 * amp; sy = (vn(t * 29, 6) - .5) * 2 * amp; }
  els.forEach(function (el) {
    var p = el.getAttribute('data-rise').split(','), dl = +p[0], dist = +p[1], sc = +p[2];
    var q = clamp((t - T.rise0 - dl) / 1.4, 0, 1), e = 1 - Math.pow(1 - q, 3.2), k = 1 - e;
    el.style.willChange = 'transform';
    el.style.transform = 'translate3d(0,' + (k * dist * H / 100).toFixed(2) + 'px,0) scale(' + (1 + k * sc).toFixed(4) + ')';
  });
  var st = SEC.querySelector('.ashx-stage');
  if (st) { if (t >= T.rise0 && amp > .01) { st.style.willChange = 'transform'; st.style.transform = 'translate3d(' + sx.toFixed(2) + 'px,' + sy.toFixed(2) + 'px,0)'; } else st.style.transform = ''; }
}
function overlayAlpha(t) { return t < T.fade ? sm(t / T.fade) : t < T.ovFade0 ? 1 : 1 - sm((t - T.ovFade0) / (T.ovFade1 - T.ovFade0)); }

/* ================================================================= session */
function ensure(opts) {
  if (S && !S.dead) return S;
  var ov = document.createElement('div'); ov.id = 'ashaad-intro'; ov.setAttribute('aria-hidden', 'true');
  var cv = document.createElement('canvas'), hint = document.createElement('div'); hint.className = 'ai-skip';
  hint.textContent = (matchMedia('(pointer:coarse)').matches ? 'tap' : 'click or press any key') + ' to skip';
  ov.appendChild(cv); ov.appendChild(hint); SEC.appendChild(ov);
  var s = S = { ov: ov, cv: cv, ctx: cv.getContext('2d'), hint: hint, dead: false, t: 0, startY: window.pageYOffset, restY: restY(), snapped: false, pageDirty: false, manual: !!(opts && opts.manual) };
  build(s); busy = true; window.__llcIntroBusy = 'ashaad';
  s.skip = function (e) { if (e && e.type === 'keydown') { if (e.metaKey || e.ctrlKey || e.altKey || e.key === 'Shift' || e.key === 'Control' || e.key === 'Alt' || e.key === 'Meta' || /^F\d+$/.test(e.key)) return; if (e.preventDefault) e.preventDefault(); } finish(s, true); };
  ov.addEventListener('click', s.skip); ov.addEventListener('touchend', function (e) { e.preventDefault(); s.skip(); }, { passive: false });
  addEventListener('keydown', s.skip, true);
  s.noscroll = function (e) { e.preventDefault(); }; addEventListener('wheel', s.noscroll, { passive: false }); addEventListener('touchmove', s.noscroll, { passive: false });
  s.onscroll = function () { if (!s.dead && Math.abs(window.pageYOffset - (s.snapped ? s.restY : s.startY)) > 1) jump(s.snapped ? s.restY : s.startY); }; addEventListener('scroll', s.onscroll, { passive: true });
  s.onresize = function () { if (!s.dead && (Math.abs(ov.clientWidth - s.M.W) > 2 || Math.abs(ov.clientHeight - s.M.H) > 2)) { build(s); s.restY = restY(); } }; addEventListener('resize', s.onresize);
  return s;
}
function render(s, t) {
  if (t >= DUR) { finish(s, false); return; }
  s.t = t;
  if (t >= T.snap && !s.snapped) { s.snapped = true; jump(s.restY); } else if (t < T.snap && s.snapped) { s.snapped = false; jump(s.startY); }
  paint(s, t); applyPage(s, t);
  if (t >= T.fade) reveal();   /* the overlay is fully opaque from here: the page appears only underneath it */
  s.ov.style.opacity = overlayAlpha(t).toFixed(4);
  s.hint.classList.toggle('on', t > 1.0 && t < 6.3 && !s.manual);
}
function finish(s, skipped) {
  if (!s || s.dead) return; s.dead = true; if (S === s) S = null;
  cancelAnimationFrame(s.raf);
  removeEventListener('keydown', s.skip, true); removeEventListener('wheel', s.noscroll); removeEventListener('touchmove', s.noscroll); removeEventListener('scroll', s.onscroll); removeEventListener('resize', s.onresize);
  /* the page goes to its resting state; if skipped before the snap, still land exactly where the final page rests */
  if (!s.snapped) { s.snapped = true; jump(s.restY); }
  clearPage(); reveal();
  if (skipped && s.ov.style.opacity !== '0') { s.ov.classList.add('out'); setTimeout(function () { s.ov.remove(); }, 320); } else s.ov.remove();
  busy = false; if (window.__llcIntroBusy === 'ashaad') window.__llcIntroBusy = 0;
}

/* real-time player: elapsed time comes from rAF deltas (clamped), never from frame counts */
function start(opts) {
  opts = opts || {};
  if (S && !S.dead) return S;
  if (!opts.force && (played || REDUCED || OFF || otherBusy())) return null;
  played = true;
  var s = ensure(); render(s, 0);
  var last = 0, slow = 0;
  s.raf = requestAnimationFrame(function fr(now) {
    if (s.dead) return;
    if (!last) last = now;
    var dt = (now - last) / 1000; last = now;
    if (dt > 0 && dt < .5) { if (dt > .09) slow++; else slow = Math.max(0, slow - 1); }
    if (slow >= 24) return finish(s, true);   /* hopelessly slow device: bail out gracefully */
    s.t += clamp(dt, 0, .1);
    render(s, s.t);
    if (!s.dead) s.raf = requestAnimationFrame(fr);
  });
  return s;
}

/* ---------- trigger: the section scrolls into view ---------- */
function inView() { var r = SEC.getBoundingClientRect(), vh = innerHeight; return r.top < vh * .8 && r.bottom > vh * .3; }
function arm() {
  if (REDUCED || OFF || !('IntersectionObserver' in window)) { reveal(); return; }
  var tmr = 0;
  function tryStart() { if (played) return cleanup(); if (!inView()) return; if (otherBusy() || document.hidden) { clearTimeout(tmr); tmr = setTimeout(tryStart, 400); return; } cleanup(); start(); }
  function cleanup() { removeEventListener('scroll', tryStart); try { io.disconnect(); } catch (e) {} clearTimeout(tmr); }
  var io = new IntersectionObserver(tryStart, { threshold: [0, .05, .1, .2, .3, .5] });
  io.observe(SEC); addEventListener('scroll', tryStart, { passive: true }); addEventListener('load', tryStart);
}

/* ---------- test / preview hook ---------- */
window.__ashaadIntro = {
  duration: DUR, timeline: T,
  /* paint the exact moment t (seconds), scrub-friendly and deterministic */
  seek: function (t) { var s = ensure({ manual: true }); s.manual = true; render(s, clamp(t, 0, DUR)); return t; },
  /* advance manual time by dt seconds (same maths as the real-time player) */
  step: function (dt) { var s = ensure({ manual: true }); s.manual = true; render(s, Math.min(DUR, s.t + dt)); return S ? S.t : DUR; },
  play: function () { played = false; return !!start({ force: true }); },
  skip: function () { if (S) finish(S, true); },
  end: function () { if (S) finish(S, false); },
  restY: restY,
  isPlaying: function () { return !!(S && !S.dead); },
  time: function () { return S ? S.t : null }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm); else arm();
})();

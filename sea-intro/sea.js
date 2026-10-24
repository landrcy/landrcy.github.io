/* Sea of Thought — hub section + "Rehydration" intro.
   A dried-out seabed (bleached cracked coral, limp brown kelp, a dusty cracked chest); rain clouds roll in and rain on
   everything, the rain raises the water and everything rehydrates; the chest opens and the bottle-message scrolls fly
   out to their places, the title/credit/description come out from behind the cloud, and the button just appears.
   Everything is drawn into the section's own low-res canvas as a pure function of t (delta-time player, scrubbable);
   compose(T.end) IS the resting canvas. Plays once when scrolled into view, one intro at a time (window.__llcIntroBusy).
   Click / tap / key skips. prefers-reduced-motion (or ?sotintro=off): the resting page. Test hook: window.__sotIntro. */
(function () {
'use strict';
var SEC = document.getElementById('sea-of-thought');
if (!SEC || window.__sotLoaded) return;
window.__sotLoaded = true;
var CV = SEC.querySelector('.sot-sea'), CX = CV.getContext('2d');
var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var OFF = /[?&]sotintro=off\b/.test(location.search);

/* ---------- timeline (s) ---------- */
var T = { cl0: .3, cl1: 2.0, r0: 1.4, r1: 5.6, lv0: 1.9, lv1: 5.4, out0: 5.7, out1: 6.9, co0: 5.6, co1: 6.3,
  cf0: 6.1, tx0: 6.6, txE: 7.9, calm0: 6.9, btn: 8.0, rev0: 6.1, end: 8.3 };
var DUR = T.end;

/* ---------- helpers ---------- */
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function lerp(a, b, k) { return a + (b - a) * k; }
function sm(v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); }
function eo(v) { v = clamp(v, 0, 1); return 1 - Math.pow(1 - v, 3); }
function eio(v) { v = clamp(v, 0, 1); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; }
function hh(n) { n = n | 0; n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
function R(i, s) { return hh(i * 7919 + (s || 0) * 104729 + 13); }
function u32(h) { var r = parseInt(h.substr(1, 2), 16), g = parseInt(h.substr(3, 2), 16), b = parseInt(h.substr(5, 2), 16); return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0; }
var PAL = ['#CAF0F8', '#ADE8F4', '#90E0EF', '#48CAE4', '#00B4D8', '#0096C7', '#0077B6', '#023E8A', '#03045E'].map(u32);
var WH = u32('#ffffff'), NV = u32('#021e5a'), OR = u32('#ff9a3c'), ORD = u32('#c2561a');
var BY = [0,32,8,40,2,34,10,42,48,16,56,24,50,18,58,26,12,44,4,36,14,46,6,38,60,28,52,20,62,30,54,22,3,35,11,43,1,33,9,41,51,19,59,27,49,17,57,25,15,47,7,39,13,45,5,37,63,31,55,23,61,29,53,21];
function th(x, y) { return (BY[(y & 7) * 8 + (x & 7)] + .5) / 64; }
function dith(f, x, y) { f = clamp(f, 0, 8); var i = Math.floor(f); return PAL[Math.min(8, i + ((f - i) > th(x, y) ? 1 : 0))]; }
function dithL(f, x, y) { f = clamp(f, 0, 8); var i = Math.floor(f), t = (((y & 3) * 2 + (x & 1)) + .5) / 8; return PAL[Math.min(8, i + ((f - i) > t ? 1 : 0))]; }

/* ---------- geometry + the two static layers (final ocean, dry pre-state) ---------- */
var G = null, FCV = null;
function navH() { var n = document.querySelector('nav'); return n ? n.getBoundingClientRect().height : 0; }
function layout() {
  var P = innerWidth < 600 ? 3 : 4, w = SEC.clientWidth, h = SEC.clientHeight;
  var cols = Math.max(1, Math.ceil(w / P)), rows = Math.max(1, Math.ceil(h / P));
  var hero = SEC.querySelector('.sot-hero');
  var wl = hero ? Math.round((hero.offsetTop + hero.offsetHeight) / P) : Math.round(rows * .2);
  wl = clamp(wl, 8, rows - 20);
  if (G && G.cols === cols && G.rows === rows && G.P === P && G.wl === wl) return false;
  CV.width = cols; CV.height = rows; CV.style.width = cols * P + 'px'; CV.style.height = rows * P + 'px';
  var img = CX.createImageData(cols, rows);
  G = { P: P, cols: cols, rows: rows, wl: wl, img: img, buf: new Uint32Array(img.data.buffer) };
  if (!FCV) { FCV = document.createElement('canvas'); FCV.className = 'sot-sea sot-front'; FCV.setAttribute('aria-hidden', 'true'); FCV.style.display = 'none'; SEC.appendChild(FCV); }
  FCV.width = cols; FCV.height = rows; FCV.style.width = cols * P + 'px'; FCV.style.height = rows * P + 'px';
  G.front = FCV; G.fcx = FCV.getContext('2d'); G.fimg = G.fcx.createImageData(cols, rows); G.fbuf = new Uint32Array(G.fimg.data.buffer);
  G.surf = new Int16Array(cols);
  for (var x = 0; x < cols; x++) G.surf[x] = wl + Math.round(Math.sin(x * .21) * 1.1 + Math.sin(x * .067 + 1) * 1.2);
  measureWindow(); buildFin();
  return true;
}
function put(F, x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < G.cols && y < G.rows) F[y * G.cols + x] = c; }
var FISH = ['t...bb..', 'tt.bbbb.', 'ttbbbbeb', 'tt.llll.', 't...ll..'];
function fish(F, x0, y0, dir, cb, cl, ce) {
  for (var j = 0; j < FISH.length; j++) for (var i = 0; i < 8; i++) {
    var ch = FISH[j][i]; if (ch === '.') continue;
    put(F, dir > 0 ? x0 + i : x0 + 7 - i, y0 + j, ch === 'e' ? ce : ch === 'l' ? cl : cb);
  }
}
/* ---------- extra colours (dry seabed, coral, kelp, chest, rain cloud) ---------- */
var SA = ['#e6cf9c', '#cfae74', '#a9834c', '#73532f'].map(u32);
var COW = ['#ffc2b3', '#ff7a93', '#d1406b'].map(u32), COD = ['#ebe3d3', '#bdb3a1', '#8a806e'].map(u32);
var KW = ['#8ce99a', '#40c057', '#2b8a3e'].map(u32), KD = ['#b0925f', '#80613a', '#54401f'].map(u32);
var WW = ['#c98a4b', '#9a5a27', '#5e3014'].map(u32), WD = ['#c4b091', '#9c8968', '#6d5e47'].map(u32);
var GW = ['#ffe066', '#f59f00'].map(u32), GD = ['#cbbf96', '#9d9170'].map(u32);
var CL = ['#d6deea', '#9fb0c8', '#6c7f9e', '#46587a'].map(u32);

function base(x) { return G.base[clamp(x | 0, 0, G.cols - 1)]; }
function buildFin() {
  var c = G.cols, r = G.rows, F = G.sea = new Uint32Array(c * r), D = G.dry = new Uint32Array(c * r), K = G.dk = new Uint32Array(c * r), x, y, k, j;
  var bs = G.base = new Int16Array(c);
  for (x = 0; x < c; x++) bs[x] = r - Math.round(9 + 4 * Math.sin(x * .045) + 2.5 * Math.sin(x * .13 + 2) + (R(x >> 2, 41) < .2 ? 1 : 0));
  for (y = 0; y < r; y++) for (x = 0; x < c; x++) {
    var s = G.surf[x], col, dc;
    if (y < s) {                                   /* sky (shared by both states) */
      var t = y / Math.max(1, s), f = 8 - t * 7.3;
      col = dith(f, x, y);
      if (t < .62 && R(x * 131 + y * 977, 7) < .004) col = R(x + y * 7, 3) < .35 ? WH : PAL[1];
      dc = col; var kc = dith(Math.max(f + 1.5, 6.3 + (f - 5) * .3), x, y);
    } else {
      if (y === s) col = R(x, 11) < .78 ? WH : PAL[0];
      else if (y === s + 1) col = R(x, 12) < .3 ? WH : PAL[1];
      else {
        var d = (y - s) / Math.max(1, r - s), f2 = .9 + d * 7.5;
        if (d < .5) { var q = ((x + y * .5) % 53 + 53) % 53, q2 = ((x + y * .5 + 19) % 71 + 71) % 71; if (q < 6 || q2 < 4) f2 -= 1.15 * (1 - d / .5); }
        col = d > .6 ? dithL(f2, x, y) : dith(f2, x, y);
        if (d > .22 && R(x * 977 + y * 31, 5) < .0028) col = d > .6 ? PAL[3] : PAL[1];
      }
      var dd = (y - s) / Math.max(1, r - s);          /* dry: pale hazy air over the empty basin, drifting dust */
      var sd = clamp((dd - .5) / .5, 0, 1) * .85; dc = th(x, y) < sd ? (th(y + 3, x + 5) < sd * .6 ? SA[1] : SA[0]) : dith(1.1 + dd * 1.2, x, y); var kc = th(x, y) < sd ? (th(y + 3, x + 5) < sd * .6 ? SA[2] : SA[1]) : dith(6.5 + dd * 1.3, x, y);
      if (R(x * 613 + y * 211, 17) < .004) dc = SA[1];
    }
    F[y * c + x] = col; D[y * c + x] = dc; K[y * c + x] = kc;
  }
  for (k = 0; k < Math.max(3, c / 40 | 0); k++) {   /* bubbles */
    var bx = 6 + R(k, 21) * (c - 12) | 0, by = r - 14 - (R(k, 22) * r * .3 | 0);
    for (j = 0; j < 7; j++) { var yy = by - j * (6 + j * 2), xx = bx + Math.round(Math.sin(j * 1.3 + k) * 2); if (yy < G.wl + 6) break;
      if (j % 2) put(F, xx, yy, PAL[1]); else { put(F, xx, yy - 1, PAL[1]); put(F, xx - 1, yy, PAL[1]); put(F, xx + 1, yy, PAL[1]); put(F, xx, yy + 1, PAL[1]); } }
  }
  var nf = Math.max(6, c / 22 | 0);                 /* fish */
  for (k = 0; k < nf; k++) {
    var d3 = .05 + R(k, 31) * .7, fy = Math.round(G.wl + 6 + d3 * (r - G.wl - 40)), fx = 4 + R(k, 32) * (c - 14) | 0, dir = R(k, 33) < .5 ? 1 : -1;
    if (k < 2) fish(F, fx, G.wl + 10 + k * 9, dir, OR, WH, NV);
    else if (d3 < .4) fish(F, fx, fy, dir, PAL[7], PAL[6], PAL[0]);
    else fish(F, fx, fy, dir, PAL[3], PAL[2], WH);
  }
  for (x = 0; x < c; x++) for (y = bs[x]; y < r; y++) {   /* seabed: blue when wet, cracked sand when dry */
    F[y * c + x] = y === bs[x] ? PAL[6] : (y === bs[x] + 1 || th(x, y) < .22) ? PAL[7] : NV;
    D[y * c + x] = y === bs[x] ? SA[0] : dith(1 + (y - bs[x]) * .35, x, y) === PAL[1] ? SA[1] : (th(x, y) < .3 ? SA[2] : SA[1]);
  }
  for (k = 0; k < Math.max(4, c / 25 | 0); k++) {    /* mud cracks */
    var cx = R(k, 71) * c, cy = 0;
    for (j = 0; j < 14; j++) { cx += R(k * 31 + j, 72) < .5 ? 1 : -1 + (j & 1); var xx2 = Math.round(cx + j), yy2 = bs[clamp(xx2, 0, c - 1)] + 2 + Math.round(Math.abs(Math.sin(j * .9 + k)) * 3);
      if (yy2 < r) put(D, xx2, yy2, SA[3]); }
  }
  /* props: coral clusters, kelp, chest, cloud (placed once per layout) */
  G.coral = []; var nc = Math.max(3, c / 55 | 0);
  for (k = 0; k < nc; k++) {
    var px = [], x0 = Math.round((k + .35 + R(k, 81) * .3) / nc * c);
    if (Math.abs(x0 - (c < 140 ? c - 19 : c * .84)) < 24) x0 += 30;
    (function br(xa, ya, a, len, dep, sd) {
      for (var i = 0; i < len; i++) {
        var X = Math.round(xa + Math.sin(a) * i), Y = Math.round(ya - Math.cos(a) * i);
        px.push([X, Y, 0, R(X * 7 + Y, 85) < .14]); if (dep < 2) px.push([X + 1, Y, 1, R(X * 5 + Y, 86) < .14]);
        if (i === len - 1 && dep < 3) { br(X, Y, a - .5 - R(sd, 83) * .3, len * .7 | 0, dep + 1, sd * 3 + 1); br(X, Y, a + .45 + R(sd, 84) * .3, len * .65 | 0, dep + 1, sd * 3 + 2); }
      }
    })(x0, base(x0) - 1, (R(k, 82) - .5) * .3, 11 + R(k, 87) * 6 | 0, 0, k + 1);
    px.forEach(function (p) { p[2] = (p[0] & 1) ? p[2] : Math.min(2, p[2] + (th(p[0], p[1]) < .3 ? 1 : 0)); });
    G.coral.push(px);
  }
  G.kelp = []; var nk = Math.max(4, c / 18 | 0);
  for (k = 0; k < nk; k++) { var kx = 3 + R(k, 51) * (c - 6) | 0; if (Math.abs(kx - (c < 140 ? c - 19 : c * .84)) < 20) continue; G.kelp.push([kx, 22 + R(k, 52) * 36 | 0, k]); }
  G.chw = c < 140 ? 28 : 36; G.chx = Math.round(c < 140 ? c - G.chw * .5 - 5 : c * .84); G.chy = base(G.chx) + 1;
  var sTop = G.surf[0]; G.cw = Math.round(clamp(c * .2, 30, 64)); G.clx = Math.round(Math.max(G.cw * .6 + 2, c * .12)); G.cly = Math.round(Math.max(G.cw * .25 + 2, sTop * .32));
  G.fin = new Uint32Array(c * r); compose(T.end, G.fin);
  G.pre = new Uint32Array(c * r); compose(0, G.pre);
}

/* ---------- timeline helpers ---------- */
function lvl(t) { var bot = G.rows + 2, tgt = G.wl - 6; return lerp(bot, tgt, eio((t - T.lv0) / (T.lv1 - T.lv0))); }
function wetAt(y, t) { return Math.max(clamp((y - lvl(t)) / 14, 0, 1), sm((t - T.lv1) / .5)); }
function swayA(t) { return clamp((t - T.lv0) / 1.2, 0, 1) * (1 - sm((t - T.calm0) / (T.end - T.calm0))); }
function storm(t) { return sm((t - .3) / 1.6) * (1 - sm((t - 5.0) / 1.4)); }
function mix(w, x, y, wet, dry) { return th(x, y) < w ? wet : dry; }

function drawCoral(B, t) {
  for (var k = 0; k < G.coral.length; k++) {
    var px = G.coral[k], w = wetAt(px.length ? px[px.length - 1][1] : 0, t);
    for (var i = 0; i < px.length; i++) { var p = px[i], dry = p[3] ? COD[2] : COD[p[2]], wet = COW[p[2]]; put(B, p[0], p[1], mix(w, p[0], p[1], wet, dry)); }
  }
}
function drawKelp(B, t) {
  var a = swayA(t);
  for (var n = 0; n < G.kelp.length; n++) {
    var kx = G.kelp[n][0], kh = G.kelp[n][1], k = G.kelp[n][2], b0 = base(kx), w = wetAt(b0 - kh, t), lp = 1 - w, dir = k & 1 ? 1 : -1;
    for (var j = 0; j < kh; j++) {
      var q = j / kh, sx = kx + Math.round(2 * Math.sin(j * .17 + k * 2.1) + a * 3 * q * Math.sin(t * 2.2 + k + j * .12) + lp * dir * q * q * kh * .55),
        sy = Math.round(b0 - j * (1 - lp * .55 * q));
      put(B, sx, sy, mix(w, sx, sy, KW[1], KD[1])); put(B, sx + 1, sy, mix(w, sx, sy, KW[2], KD[2]));
      if (j % 5 === 2 && j < kh - 2) put(B, sx + (k & 1 ? 2 : -1), sy, mix(w, sx, sy, KW[0], KD[0]));
    }
  }
}
function openK(t) { var o = clamp((t - T.co0) / (T.co1 - T.co0), 0, 1); return o < .2 ? 0 : o < .45 ? 1 : o < .7 ? 2 : 3; }
/* chest: front view; the lid swings back on two hinges at the rear of the body (closed -> ajar -> half -> open) */
function drawChest(B, t) {
  var W = G.chw, BH = Math.round(W * .46), LH = Math.round(W * .28), x0 = G.chx - (W >> 1), yb = G.chy, w = wetAt(yb - BH - LH, t), st = openK(t), x, y, X, Y;
  var b1 = Math.round(W * .17), b2 = W - 1 - b1, lk = W >> 1;
  function wood(lv, X, Y) { return mix(w, X, Y, WW[lv], WD[lv]); }
  function band(lv, X, Y) { return mix(w, X, Y, GW[lv], GD[lv]); }
  for (y = 0; y < BH; y++) for (x = 0; x < W; x++) {          /* body */
    X = x0 + x; Y = yb - 1 - y;
    var col = (x === 0 || x === W - 1 || y === 0 || y === BH - 1) ? wood(2, X, Y) : (y % 5 === 4 ? wood(2, X, Y) : wood(x < 3 ? 0 : 1, X, Y));
    if (Math.abs(x - b1) < 2 || Math.abs(x - b2) < 2) col = band(y === BH - 1 ? 1 : 0, X, Y);
    if (R(X * 17 + Y * 5, 61) < .07 && x > 0 && x < W - 1 && th(X, Y) >= w) col = WD[2];
    put(B, X, Y, col);
  }
  var lt = yb - BH;                                            /* rim row of the body */
  function lid(top, hgt, inset, inner) {                       /* trapezoid panel, `inset` px narrower per side at its top */
    for (var j = 0; j < hgt; j++) { var k = Math.round(inset * (1 - j / Math.max(1, hgt - 1))), Yy = top + j;
      for (var i = k; i < W - k; i++) { var Xx = x0 + i, cc;
        if (inner) cc = j < 2 ? WW[0] : (i === k || i === W - 1 - k || j === hgt - 1) ? WW[1] : (j % 3 === 1 ? WW[1] : WW[2]);
        else cc = (i === k || i === W - 1 - k || j === 0 || j === hgt - 1) ? wood(2, Xx, Yy) : wood(j < 2 ? 0 : 1, Xx, Yy);
        if (Math.abs(i - b1) < 2 || Math.abs(i - b2) < 2) cc = band(inner ? 1 : 0, Xx, Yy);
        put(B, Xx, Yy, cc); } }
  }
  if (st === 0) {
    lid(lt - LH, LH, 2, false);
    for (y = 0; y < 4; y++) for (x = lk - 2; x <= lk + 1; x++) put(B, x0 + x, lt - 2 + y, band(y === 3 ? 1 : 0, x0 + x, lt - 2 + y));   /* hasp */
  } else {
    for (x = 1; x < W - 1; x++) { put(B, x0 + x, lt, WW[2]); put(B, x0 + x, lt + 1, R(x, 63) < .5 ? GW[0] : GW[1]); if (st === 3 && R(x, 67) < .35) put(B, x0 + x, lt - 1, GW[0]); }
    if (st === 1) { lid(lt - LH - 2, LH, 2, false); for (x = 2; x < W - 2; x++) put(B, x0 + x, lt - 1, GW[0]); }       /* ajar: front edge lifted, light leaks */
    else if (st === 2) lid(lt - Math.round(LH * .7) - 1, Math.round(LH * .7), 1, true);   /* half: underside of the lid foreshortened */
    else lid(lt - LH - 3, LH + 3, -1, true);                    /* open: lid thrown back, its inside facing us */
    for (var h = 0; h < 2; h++) { var hx = x0 + (h ? W - 3 : 1); put(B, hx, lt - 1, GW[1]); put(B, hx + 1, lt - 1, GW[1]); put(B, hx, lt, NV); put(B, hx + 1, lt, GW[1]); }   /* hinges */
  }
  if (w > .6) for (var k = 0; k < 7; k++) put(B, x0 + 2 + (R(k, 64) * (W - 4) | 0), yb - 3 - (R(k, 65) * (BH - 5) | 0), WH);   /* wet gloss */
  else for (k = 0; k < 8; k++) put(B, x0 + 1 + (R(k, 66) * (W - 2) | 0), st ? lt : lt - LH, SA[0]);   /* dust */
}
/* clouds: puffy circle unions, rounded bottoms; extra clouds roll in from the right and away to the left */
var CBL = [[-.42, .1, .3], [-.12, -.08, .38], [.25, -.02, .33], [.5, .14, .24], [-.25, .26, .26], [.05, .26, .3], [.33, .26, .25], [-.55, .25, .18]];
var CS = ['#7d8aa3', '#525f7a', '#363f57', '#1f2638'].map(u32);
function cloudShape(B, cx, cy, cw, sk, seed) {
  var BL = CBL;
  if (seed) { BL = []; for (var n = 0; n < 9; n++) BL.push([(R(n, seed) - .5) * 1.25, (R(n, seed + 1) - .55) * .5, .17 + R(n, seed + 2) * .2]); BL.push([0, .1, .34]); }
  var x, y, x1 = Math.ceil(cw * .8), y0 = Math.floor(-cw * .5), y1 = Math.ceil(cw * .58);
  for (y = y0; y <= y1; y++) for (x = -x1; x <= x1; x++) {
    var ins = false;
    for (var b = 0; b < BL.length; b++) { var dx = x / cw - BL[b][0], dy = y / cw - BL[b][1]; if (dx * dx + dy * dy < BL[b][2] * BL[b][2]) { ins = true; break; } }
    if (!ins) continue;
    var v = y / cw, tone = v < -.25 ? 0 : v < -.05 ? (th(x, y) < .5 ? 0 : 1) : v < .2 ? 1 : v < .33 ? (th(x, y) < .5 ? 2 : 1) : v < .45 ? 2 : 3;
    if (sk > 0) { var nz = R((x >> 2) * 37 + (y >> 2) * 101 + (seed || 0), 5) * 1.6 - .5, st = clamp(Math.round(tone + nz * sk + sk * .4), 0, 3);
      put(B, cx + x, cy + y, th(x + cx, y + cy) < sk ? CS[st] : CL[tone]); }
    else put(B, cx + x, cy + y, CL[tone]);
  }
}
function clouds(t) {
  var cin = eo((t - T.cl0) / (T.cl1 - T.cl0)), cout = eio((t - T.out0) / (T.out1 - T.out0)), c = G.cols, bob = Math.sin(t * 1.3) * (1 - sm((t - T.calm0) / (T.end - T.calm0))) * 1.2;
  var L = [{ x: lerp(-G.cw * 1.2, G.clx, cin), y: G.cly + Math.round(bob), w: G.cw, main: true }];
  for (var k = 0; k < 3; k++) { var fx = c * (.4 + k * .27), ox = lerp(c + G.cw * (1.2 + k * .6), fx, eo((t - T.cl0 - k * .25) / (T.cl1 - T.cl0)));
    L.push({ x: ox - cout * (fx + G.cw * 1.5 + c * .2), y: Math.round(G.cly * (.7 + R(k, 77) * .6)), w: Math.round(G.cw * (.75 + R(k, 78) * .3)), main: false }); }
  return L;
}
function len0(cl) { return Math.max(0, G.wl - cl.y) * .3; }
function rain(B, t, L) {
  var rn = clamp((t - T.r0) / .5, 0, 1) * (1 - clamp((t - T.r1) / .5, 0, 1)); if (rn <= 0) return;
  var c = G.cols, lv = lvl(t), sp = 95;
  for (var k = 0; k < c * 2.2; k++) {
    if (R(k, 95) > rn) continue;
    var cl = L[k % L.length]; if (cl.x < -cl.w || cl.x > c + cl.w) continue;
    var rx = Math.round(cl.x + (R(k, 91) - .5) * cl.w * 1.7 + (t - T.r0) * -3 + len0(cl)), top = cl.y + cl.w * .45, bot = Math.min(lv, base(rx)), len = Math.max(4, bot - top), ry = top + ((t * sp + R(k, 92) * len) % len);
    var sl = (ry - top) * -.45; put(B, rx + sl, ry, WH); put(B, rx + sl - .45, ry + 1, PAL[4]); put(B, rx + sl - .9, ry + 2, PAL[5]); put(B, rx + sl - 1.35, ry + 3, PAL[5]); put(B, rx + sl - 1.8, ry + 4, PAL[6]);
    if (ry > bot - 3) { put(B, rx + sl - 1, bot - 1, WH); put(B, rx + sl + 1, bot - 1, WH); }
  }
}
function measureWindow() {
  var nh = navH(), top = SEC.getBoundingClientRect().top;
  G.oy = Math.round((nh - top) / G.P); G.vr = Math.max(20, Math.min(Math.ceil((innerHeight - nh) / G.P), G.rows - Math.max(0, G.oy)));
}

/* ---------- compositor (pure function of t); compose(T.end) IS the resting canvas ----------
   While the text is coming out, the main cloud is drawn on a second canvas ABOVE the text (so the text truly emerges from behind it). */
function compose(t, B, front) {
  var c = G.cols, r = G.rows, F = G.sea, D = G.dry, L = lvl(t), amp = 2.5 * (1 - sm((t - T.lv1) / (T.calm0 - T.lv1 + .6))) * clamp((t - T.lv0) * 2, 0, 1), fr = (t * 12) | 0, foam = t > T.lv0 && t < T.calm0, sk = storm(t);
  for (var x = 0; x < c; x++) {
    var Li = Math.ceil(L + amp * (Math.sin(x * .13 - t * 4.2) + .5 * Math.sin(x * .29 + t * 2.7)));
    for (var y = 0; y < r; y++) { var i = y * c + x; B[i] = y >= Li ? (foam && y < Li + 2 && y > G.surf[x] + 1 ? (R(x * 3 + fr * 7 + y, 4) < (y === Li ? .75 : .25) ? WH : PAL[0]) : F[i]) : (th(x, y) < sk * .85 ? G.dk[i] : D[i]); }
  }
  drawKelp(B, t); drawCoral(B, t); drawChest(B, t);
  var CLs = clouds(t);
  for (var k = CLs.length - 1; k >= 0; k--) { var q = CLs[k]; if (q.main && front) { front.fill(0); cloudShape(front, Math.round(q.x), q.y, q.w, sk, 0); } else cloudShape(B, Math.round(q.x), q.y, q.w, sk, q.main ? 0 : 200 + k * 7); }
  rain(B, t, CLs);
}
function paint(t) {
  var fx = t < T.txE && G.front;
  if (t >= T.end) G.buf.set(G.fin); else compose(t, G.buf, fx ? G.fbuf : null);
  CX.putImageData(G.img, 0, 0);
  if (G.front) { G.front.style.display = fx ? '' : 'none'; if (fx) G.fcx.putImageData(G.fimg, 0, 0); }
}

/* ---------- DOM: scrolls fly out of the chest, the text comes out from behind the cloud, the button just appears ---------- */
var ELS = [].slice.call(SEC.querySelectorAll('[data-sot-in]'));
function home(el) { var x = 0, y = 0, e = el; while (e && e !== SEC) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return [x + el.offsetWidth / 2, y + el.offsetHeight / 2]; }
function applyPage(t) {
  var P = G.P, nc = 0, nt = 0;
  for (var i = 0; i < ELS.length; i++) {
    var el = ELS[i], kind = el.getAttribute('data-sot-in'), st, dur, src, hm = home(el);
    if (kind === 'btn') { el.style.opacity = t >= T.btn ? '' : '0'; el.style.transform = ''; continue; }
    if (kind === 'chest') { st = T.cf0 + nc++ * .28; dur = .75; src = [G.chx * P, (G.chy - G.chw * .5) * P]; }
    else { st = T.tx0 + nt++ * .35; dur = .85; src = [G.clx * P, G.cly * P]; }
    var u = clamp((t - st) / dur, 0, 1);
    if (u >= 1) { el.style.opacity = ''; el.style.transform = ''; continue; }
    if (u <= 0) { el.style.opacity = '0'; continue; }
    var e = eo(u), dx = Math.round((src[0] - hm[0]) * (1 - e) / P) * P, dy = Math.round(((src[1] - hm[1]) * (1 - e) - (kind === 'chest' ? Math.sin(u * Math.PI) * 60 : 0)) / P) * P;
    el.style.opacity = String(Math.min(1, Math.ceil(u * 6) / 2));
    el.style.transform = 'translate(' + dx + 'px,' + dy + 'px) scale(' + (Math.round((.12 + .88 * e) * 20) / 20) + ')';
  }
}
function clearPage() { ELS.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; }); }

/* ---------- state ---------- */
var state = (REDUCED || OFF) ? 'done' : 'pre', S = null;
if (state === 'done') SEC.classList.remove('sot-pre');
function drawState() { if (!G) return; if (S && !S.dead) { measureWindow(); paint(S.t); } else if (state === 'pre') { G.buf.set(G.pre); CX.putImageData(G.img, 0, 0); } else { G.buf.set(G.fin); CX.putImageData(G.img, 0, 0); } }
function relayout() { layout(); drawState(); }
relayout();
if ('ResizeObserver' in window) new ResizeObserver(function () { if (layout()) drawState(); }).observe(SEC);
addEventListener('resize', function () { if (layout()) drawState(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
addEventListener('load', relayout);

function otherBusy() { return !!window.__llcIntroBusy && window.__llcIntroBusy !== 'sea'; }
function restY() { return Math.max(0, Math.round(SEC.getBoundingClientRect().top + window.pageYOffset - navH())); }
function jump(y) { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }

function ensure(manual) {
  if (S && !S.dead) return S;
  var cat = document.createElement('div'); cat.id = 'sot-intro-catch'; cat.setAttribute('aria-hidden', 'true');
  var hint = document.createElement('div'); hint.className = 'hint';
  hint.textContent = (matchMedia('(pointer:coarse)').matches ? 'tap' : 'click or press any key') + ' to skip';
  cat.appendChild(hint); document.body.appendChild(cat);
  window.__llcIntroBusy = 'sea'; state = 'running'; SEC.classList.remove('sot-pre');
  var s = S = { cat: cat, hint: hint, dead: false, t: 0, manual: !!manual };
  s.restY = restY(); jump(s.restY);
  s.skip = function (e) {
    if (e && e.type === 'keydown') { if (e.metaKey || e.ctrlKey || e.altKey || /^(Shift|Control|Alt|Meta)$/.test(e.key) || /^F\d+$/.test(e.key)) return; e.preventDefault(); }
    finish(s);
  };
  cat.addEventListener('click', s.skip); cat.addEventListener('touchend', function (e) { e.preventDefault(); s.skip(); }, { passive: false });
  addEventListener('keydown', s.skip, true);
  s.noscroll = function (e) { e.preventDefault(); }; addEventListener('wheel', s.noscroll, { passive: false }); addEventListener('touchmove', s.noscroll, { passive: false });
  s.onscroll = function () { if (!s.dead && Math.abs(window.pageYOffset - s.restY) > 1) jump(s.restY); }; addEventListener('scroll', s.onscroll, { passive: true });
  layout(); measureWindow();
  return s;
}
function render(s, t) {
  if (t >= DUR) { finish(s); return; }
  s.t = t; measureWindow(); paint(t); applyPage(t);
  s.hint.classList.toggle('on', t > .8 && t < T.rev0 && !s.manual);
}
function finish(s) {
  if (!s || s.dead) return; s.dead = true; if (S === s) S = null;
  cancelAnimationFrame(s.raf);
  removeEventListener('keydown', s.skip, true); removeEventListener('wheel', s.noscroll); removeEventListener('touchmove', s.noscroll); removeEventListener('scroll', s.onscroll);
  s.cat.remove(); state = 'done'; clearPage(); SEC.classList.remove('sot-pre');
  layout(); G.buf.set(G.fin); CX.putImageData(G.img, 0, 0); if (G.front) G.front.style.display = "none";
  if (window.__llcIntroBusy === 'sea') window.__llcIntroBusy = 0;
}
function start(force) {
  if (S && !S.dead) return S;
  if (!force && (state !== 'pre' || otherBusy())) return null;
  var s = ensure(false); render(s, 0);
  var last = 0, slow = 0;
  s.raf = requestAnimationFrame(function fr(now) {
    if (s.dead) return;
    if (!last) last = now;
    var dt = (now - last) / 1000; last = now;
    if (dt > .09 && dt < .5) slow++; else slow = Math.max(0, slow - 1);
    if (slow >= 24) return finish(s);                   /* hopelessly slow device */
    s.t += clamp(dt, 0, .1); render(s, s.t);
    if (!s.dead) s.raf = requestAnimationFrame(fr);
  });
  return s;
}

/* ---------- trigger: once, when the section scrolls into view ---------- */
function inView() { var r = SEC.getBoundingClientRect(), vh = innerHeight; return r.top < vh * .7 && r.bottom > vh * .3; }
if (state === 'pre' && 'IntersectionObserver' in window) {
  var tmr = 0, io;
  var tryStart = function () {
    if (state !== 'pre') return cleanup();
    if (!inView()) return;
    if (otherBusy() || document.hidden) { clearTimeout(tmr); tmr = setTimeout(tryStart, 400); return; }
    cleanup(); start(false);
  };
  var cleanup = function () { removeEventListener('scroll', tryStart); try { io.disconnect(); } catch (e) {} clearTimeout(tmr); };
  io = new IntersectionObserver(tryStart, { threshold: [0, .05, .1, .2, .3, .5] });
  io.observe(SEC); addEventListener('scroll', tryStart, { passive: true }); addEventListener('load', tryStart);
} else if (state === 'pre') { state = 'done'; SEC.classList.remove('sot-pre'); drawState(); }

/* ---------- seams (static dithered ramps into / out of the section) ---------- */
(function () {
  var hexs = ['#03045E', '#023E8A', '#0077B6', '#00B4D8', '#90E0EF', '#CAF0F8'];
  function rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function draw(el, n) {
    var cv = el.querySelector('canvas'), P = 4, w = el.clientWidth, h = el.clientHeight, cols = Math.ceil(w / P), rows = Math.ceil(h / P);
    cv.width = cols; cv.height = rows; cv.style.width = cols * P + 'px'; cv.style.height = rows * P + 'px';
    var x = cv.getContext('2d'), img = x.createImageData(cols, rows), D = img.data;
    var ramp = el.dataset.to === 'sea' ? [el.dataset.from, '#0a0430', '#03045E'] : hexs.concat(['#f3ecdf']);
    ramp = ramp.map(rgb); var N = ramp.length - 1, jit = [];
    for (var X = 0; X < cols; X++) jit.push(Math.round(Math.sin(X * .23 + n) * 1.5 + Math.sin(X * .071 + n * 2) * 2));
    for (var Y = 0; Y < rows; Y++) for (X = 0; X < cols; X++) {
      var t = clamp((Y + jit[X]) / (rows - 1), 0, 1); if (Y === 0) t = 0; if (Y === rows - 1) t = 1;
      var f = t * N, i = Math.min(N, Math.floor(f) + ((f - Math.floor(f)) > th(X, Y) ? 1 : 0)), c = ramp[i], k = (Y * cols + X) * 4;
      D[k] = c[0]; D[k + 1] = c[1]; D[k + 2] = c[2]; D[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
  }
  var seams = [].slice.call(document.querySelectorAll('.sot-seam'));
  function all() { seams.forEach(draw); }
  all(); var tm; addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(all, 150); });
})();

/* ---------- test / preview hook ---------- */
window.__sotIntro = {
  duration: DUR, timeline: T,
  seek: function (t) { var s = ensure(true); s.manual = true; render(s, clamp(t, 0, DUR)); return S ? S.t : DUR; },
  step: function (dt) { var s = ensure(true); s.manual = true; render(s, Math.min(DUR, s.t + dt)); return S ? S.t : DUR; },
  skip: function () { if (S) finish(S); },
  play: function () { if (S) return false; state = 'pre'; return !!start(true); },
  state: function () { return S ? 'running' : state; },
  restY: restY
};
})();

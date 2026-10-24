/* The Void — hub section + "Black hole" intro.
   Empty pixel space with stars; a black hole forms (it is the O of THE VOID); its gravity drags loose stars and scrap
   debris into a swirl; then the page pieces (Earth + astronaut, ringed planet, the stencil letters, the text, PLAY)
   are pulled in along spirals and snap into place. Everything is drawn into the section's own low-res canvas as a
   pure function of t (delta-time player, scrubbable); compose(DUR) IS the resting canvas.
   Plays once when scrolled into view, one intro at a time (window.__llcIntroBusy). Click / tap / key skips.
   prefers-reduced-motion (or ?voidintro=off): the resting page. Test hook: window.__voidIntro. */
(function () {
'use strict';
var SEC = document.getElementById('the-void');
if (!SEC || window.__voidLoaded) return;
window.__voidLoaded = true;
var CV = SEC.querySelector('.void-sky'), CX = CV.getContext('2d');
var TB = SEC.querySelector('.void-tbox');
var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
var OFF = /[?&]voidintro=off\b/.test(location.search);

/* ---------- timeline (s) ---------- */
var T = { rv0: .3, rv1: 1.1, bh0: .4, bh1: 1.3, gr0: 1.4, gr1: 2.8, sw0: .6, pl0: 2.0, ea0: 2.3, sh0: 4.3, sh1: 5.8, em0: 4.4, tx0: 6.3, end: 7.0 };
var DUR = T.end;

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function sm(v) { v = clamp(v, 0, 1); return v * v * (3 - 2 * v); }
function eo(v) { v = clamp(v, 0, 1); return 1 - Math.pow(1 - v, 3); }
function ei(v) { v = clamp(v, 0, 1); return v * v * v; }
function hh(n) { n = n | 0; n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n = n ^ (n >>> 4); n = Math.imul(n, 0x27d4eb2d); n = n ^ (n >>> 15); return (n >>> 0) / 4294967296; }
function R(i, s) { return hh(i * 7919 + (s || 0) * 104729 + 13); }
function u32(h) { var r = parseInt(h.substr(1, 2), 16), g = parseInt(h.substr(3, 2), 16), b = parseInt(h.substr(5, 2), 16); return ((255 << 24) | (b << 16) | (g << 8) | r) >>> 0; }
function cl(a) { return a.map(u32); }
var BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function th(x, y) { return (BAYER[(y & 3) * 4 + (x & 3)] + .5) / 16; }
var INK = u32('#05020d'), NEB = cl(['#05020d', '#0c0420', '#160833', '#2a0f4d']);
var STAR = cl(['#5a4a80', '#ad98e6', '#efe6ff', '#ffffff']);
var DISC = cl(['#0b0220', '#2a0a52', '#5a14a0', '#8e2bd6', '#c04df0', '#ff6fe0', '#ffd2f8', '#ffffff']);
var TXT = cl(['#fbf7ff', '#e9ddff', '#cdbcf3', '#ad98e6']), TSH = u32('#2a0a52');
var SCRAP = cl(['#8c8aa0', '#5d5a72', '#c04df0', '#efe6ff']);
var OCEAN = cl(['#2f6bd8', '#1d4aa8', '#12307a', '#0a1a48']), LAND = cl(['#4fb24a', '#2f8a3a', '#1e5c2a', '#103a1c']), ICE = cl(['#ffffff', '#cdd6ff', '#8f96c8', '#4a4a7a']);
var ATM = u32('#7fb0ff'), SUIT = u32('#ffffff'), SUIT2 = u32('#ad98e6'), VISOR = u32('#c04df0');
var PL = cl(['#e9c98a', '#c79a5a', '#8a5f32', '#4a2f18']), RING = cl(['#efe6ff', '#ad98e6', '#5a4a80']);

/* ---------- stencil letters (same construction as the game's title) ---------- */
function inPoly(x, y, p) { var c = false; for (var i = 0, j = p.length - 1; i < p.length; j = i++) { var xi = p[i][0], yi = p[i][1], xj = p[j][0], yj = p[j][1]; if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c; } return c; }
function rr(x, y, x0, y0, x1, y1, a, b, c, d) {
  if (x < x0 || x >= x1 || y < y0 || y >= y1) return false; a = a || 0; b = b || 0; c = c || 0; d = d || 0; var cx, cy, r;
  if (a && x < x0 + a && y < y0 + a) { cx = x0 + a; cy = y0 + a; r = a; return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; }
  if (b && x >= x1 - b && y < y0 + b) { cx = x1 - b; cy = y0 + b; r = b; return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; }
  if (c && x >= x1 - c && y >= y1 - c) { cx = x1 - c; cy = y1 - c; r = c; return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; }
  if (d && x < x0 + d && y >= y1 - d) { cx = x0 + d; cy = y1 - d; r = d; return (x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r; }
  return true;
}
function letter(ch, w, h) {
  var m = new Uint8Array(w * h), s = Math.round(h * 0.33), g = Math.max(1, Math.round(h * 0.055));
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
    var px = x + .5, py = y + .5, on = false;
    if (ch === 'T') { var st = Math.round(s * 1.1), bar = Math.round(s * 0.92), x0 = (w - st) / 2; on = rr(px, py, 0, 0, w, bar, 1, 1, 0, 0) || (px >= x0 && px < x0 + st && py >= bar + g); }
    else if (ch === 'H') { var bh = Math.round(s * 0.85), by = (h - bh) / 2; on = px < s || px >= w - s || (py >= by && py < by + bh && px < w - s - g); }
    else if (ch === 'E') { var as = Math.round(h * 0.25), my = (h - as) / 2; on = px < s || (px >= s + g && ((py < as) || (py >= my && py < my + as && px < w - s * 0.45) || py >= h - as)); }
    else if (ch === 'V') { var sT = s * 1.05, sB = s * 0.78, cxm = w / 2, ap = h * 0.74; on = inPoly(px, py, [[0, 0], [sT, 0], [cxm - g / 2, ap], [cxm - g / 2, h], [cxm - sB, h]]) || inPoly(px, py, [[w, 0], [w - sT, 0], [cxm + g / 2, ap], [cxm + g / 2, h], [cxm + sB, h]]); }
    else if (ch === 'I') { on = (py < h * 0.3 || py >= h * 0.3 + g); }
    else if (ch === 'D') { var rad = h * 0.5, bs = Math.round(s * 0.82), bx0 = s + g; on = px < s || (rr(px, py, bx0, 0, w, h, 0, rad, rad, 0) && !rr(px, py, bx0 + Math.round(s * 0.34), bs, w - bs, h - bs, 0, rad - bs, rad - bs, 0)); if (px >= s && px < bx0) on = false; }
    m[y * w + x] = on ? 1 : 0;
  }
  return m;
}

/* ---------- sprites: {x,y (home, cells), w,h, d: Uint32Array (0 = transparent)} ---------- */
function sprite(w, h) { return { w: w, h: h, d: new Uint32Array(w * h), x: 0, y: 0 }; }
function blit(B, sp, ox, oy) {
  var c = G.cols, r = G.rows, X0 = sp.x + ox, Y0 = sp.y + oy;
  for (var j = 0; j < sp.h; j++) { var Y = Y0 + j; if (Y < 0 || Y >= r) continue;
    for (var i = 0; i < sp.w; i++) { var v = sp.d[j * sp.w + i]; if (!v) continue; var X = X0 + i; if (X >= 0 && X < c) B[Y * c + X] = v; } }
}
/* title letters, with the hole's gravity stretching the pixels nearest the O toward it */
function buildTitle(x0, y0, hV) {
  var gap = Math.max(2, Math.round(hV * 0.085)), wV = Math.round(hV * 0.92), wO = Math.round(hV * 1.14), wI = Math.round(hV * 0.34), wD = Math.round(hV * 0.80);
  var lineW = wV + wO + wI + wD + gap * 3, hT = Math.round(hV * 0.74), gapV = Math.round(hV * 0.14);
  var yV = y0 + hT + gapV, wT = Math.floor((lineW - gap * 2) / 3), extra = lineW - gap * 2 - wT * 3;
  var hx = x0 + wV + gap + wO / 2, hy = yV + hV / 2, reach = hV * 1.15, out = [];
  var CRK = u32('#6a4a9a');
  function add(ch, x, y, w, h, li) {
    var m = letter(ch, w, h), pad = Math.ceil(hV * .3), sp = sprite(w + pad * 2 + 1, h + pad * 2 + 1); sp.x = x - pad; sp.y = y - pad; sp.ch = ch;
    function put(i, j, v, over) { if (i >= 0 && j >= 0 && i < sp.w && j < sp.h && (over || !sp.d[j * sp.w + i])) sp.d[j * sp.w + i] = v; }
    var lcx = x + w / 2, lcy = y + h / 2, ld = Math.hypot(hx - lcx, hy - lcy), ux = (hx - lcx) / ld, uy = (hy - lcy) / ld, close = clamp(1 - ld / (hV * 1.9), .15, 1);
    /* cracks (line segments) and chips (bites out of the edge), seeded per letter */
    var cracks = [], chips = [], q, nC = 1 + (R(li, 40) * 2 | 0) + (close > .5 ? 1 : 0);
    for (q = 0; q < nC; q++) { var c0x = R(li * 9 + q, 41) * w, c0y = R(li * 9 + q, 42) * h, an = R(li * 9 + q, 43) * 6.283, ln = (.35 + .4 * R(li * 9 + q, 44)) * Math.max(w, h);
      cracks.push([c0x, c0y, c0x + Math.cos(an) * ln, c0y + Math.sin(an) * ln, R(li * 9 + q, 45) * 3 + 1]); }
    var nK = 3 + (R(li, 46) * 4 | 0) + Math.round(close * 4);
    for (q = 0; q < nK; q++) { var ex = R(li * 11 + q, 47), ey = R(li * 11 + q, 48), side = (R(li * 11 + q, 49) * 4) | 0;
      chips.push([side === 0 ? ex * w : side === 1 ? w : side === 2 ? ex * w : 0, side === 0 ? 0 : side === 1 ? ey * h : side === 2 ? h : ey * h, 1.2 + R(li * 11 + q, 50) * (2 + close * 2)]); }
    function segD(px, py, c) { var vx = c[2] - c[0], vy = c[3] - c[1], l2 = vx * vx + vy * vy, k = clamp(((px - c[0]) * vx + (py - c[1]) * vy) / l2, 0, 1), qx = c[0] + vx * k - px, qy = c[1] + vy * k - py; return Math.sqrt(qx * qx + qy * qy) + Math.sin(k * 12 + c[4]) * .35; }
    var bendA = hV * .14 * close, tw = (R(li, 51) - .5) * .5;
    for (var j = 0; j < h; j++) for (var i = 0; i < w; i++) if (m[j * w + i]) {
      var px = i + .5, py = j + .5, gx = x + i, gy = y + j, dx = hx - gx, dy = hy - gy, d = Math.hypot(dx, dy), k = Math.max(0, 1 - d / reach);
      var col = TXT[Math.min(3, (j / h * 4) | 0)], gone = false, dark = false;
      for (q = 0; q < chips.length; q++) if (Math.hypot(px - chips[q][0], py - chips[q][1]) < chips[q][2]) gone = true;
      for (q = 0; q < cracks.length; q++) { var cd = segD(px, py, cracks[q]); if (cd < .6) gone = true; else if (cd < 1.5) dark = true; }
      if (R(gx * 131 + gy * 7, 52) < .03 + .22 * k * k) gone = true;
      if (gone) continue;
      /* gravity bend: the side facing the hole is dragged toward it, plus a kink */
      var f = Math.pow(1 - clamp(Math.hypot(px - (w / 2 + ux * w / 2), py - (h / 2 + uy * h / 2)) / Math.max(w, h), 0, 1), 1.5);
      var bx = Math.round(ux * bendA * f + Math.sin(j * .5 + li) * .8 * close + (j - h / 2) * tw * close * .3), by = Math.round(uy * bendA * f);
      var ii = i + pad + bx, jj = j + pad + by;
      put(ii, jj, dark ? CRK : col, true);
      var edge = !m[j * w + i - 1] || !m[j * w + i + 1] || !m[(j - 1) * w + i] || !m[(j + 1) * w + i], pull = Math.round(hV * .22 * k * k);
      if (pull > 0 && edge && R(gx * 31 + gy, 7) < .5) for (var z = 1; z <= pull; z++) put(ii + Math.round(dx / d * z), jj + Math.round(dy / d * z), z > pull * .6 ? DISC[5] : (z & 1 ? col : DISC[4]));
    }
    shadow(sp); out.push(sp);
  }
  function shadow(sp) { var i, j, W = sp.w, sh = new Uint8Array(sp.d.length);
    for (j = 0; j < sp.h - 1; j++) for (i = 0; i < W - 1; i++) if (sp.d[j * W + i] && !sp.d[(j + 1) * W + i + 1]) sh[(j + 1) * W + i + 1] = 1;
    for (i = 0; i < sh.length; i++) if (sh[i]) sp.d[i] = TSH; }
  var x = x0; add('T', x, y0, wT, hT, 0); x += wT + gap; add('H', x, y0, wT + extra, hT, 1); x += wT + extra + gap; add('E', x, y0, wT, hT, 2);
  x = x0; add('V', x, yV, wV, hV, 3); x += wV + gap + wO + gap; add('I', x, yV, wI, hV, 4); x += wI + gap; add('D', x, yV, wD, hV, 5);
  return { letters: out, hx: Math.round(hx), hy: Math.round(hy), rb: Math.max(3, Math.round(hV * .27)), w: lineW, h: hT + gapV + hV };
}
function titleSize(hV) { var gap = Math.max(2, Math.round(hV * 0.085)); return { w: Math.round(hV * 0.92) + Math.round(hV * 1.14) + Math.round(hV * 0.34) + Math.round(hV * 0.80) + gap * 3, h: Math.round(hV * 0.74) + Math.round(hV * 0.14) + hV }; }

/* big pixel Earth with a tiny astronaut standing on top */
function buildEarth(R0) {
  var pad = 4, D = R0 * 2 + pad * 2 + 1, sp = sprite(D, D), c = R0 + pad, lx = -.62, ly = -.55;
  for (var j = 0; j < D; j++) for (var i = 0; i < D; i++) {
    var dx = (i - c) / R0, dy = (j - c) / R0, d2 = dx * dx + dy * dy, idx = j * D + i;
    if (d2 > 1) { if (d2 < Math.pow(1 + 1.6 / R0, 2) && th(i, j) < .55 - (dx * lx + dy * ly) * .4) sp.d[idx] = ATM; continue; }
    var z = Math.sqrt(1 - d2), lit = clamp(dx * lx + dy * ly + z * .55, -1, 1), sh = lit > .55 ? 0 : lit > .15 ? 1 : lit > -.2 ? 2 : 3;
    var lv = clamp((.75 - lit) / .32, 0, 3), f = Math.min(3, Math.floor(lv) + ((lv - Math.floor(lv)) > th(i, j) ? 1 : 0));
    var u = Math.atan2(dx, z) * 3 + 2.1, v = dy * 3.3, n = Math.sin(u * 1.7 + Math.sin(v * 2.1)) + Math.sin(v * 1.9 - u * .8 + 1.3) + .6 * Math.sin(u * 3.9 + v * 3.1);
    var pal = Math.abs(dy) > .9 ? ICE : (n > .55 ? LAND : OCEAN);
    if (d2 > .92 && f < 3 && th(i, j) < .5) f++;
    sp.d[idx] = pal[Math.min(3, f)];
  }
  /* astronaut at ~20 deg right of the top, standing on the surface */
  var a = .34, ax = Math.round(c + Math.sin(a) * R0), ay = Math.round(c - Math.cos(a) * R0);
  var AST = ['.ww.', 'wvvw', 'wwww', 'swws', '.ww.', '.w.w'];
  var big = sprite(D, D + 8); big.d.set(sp.d, 8 * D); 
  for (var y = 0; y < 6; y++) for (var x = 0; x < 4; x++) { var ch = AST[y][x]; if (ch === '.') continue; big.d[(ay + 8 - 6 + y) * D + ax - 2 + x] = ch === 'w' ? SUIT : ch === 'v' ? VISOR : SUIT2; }
  big.c = c; big.top = 8; return big;
}
/* small ringed planet (tilted ring, back half hidden by the ball) */
function buildRinged(r) {
  var a = Math.round(r * 2.1), W = a * 2 + 3, H = r * 2 + 5, sp = sprite(W, H), cx = a + 1, cy = r + 2, t = -.28, ct = Math.cos(t), st = Math.sin(t);
  function ring(front) {
    for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) {
      var x = i - cx, y = j - cy, rx = x * ct + y * st, ry = (-x * st + y * ct) / .3, e = Math.hypot(rx, ry) / a;
      if (e > .72 && e <= 1 && ((ry > 0) === front)) { var k = e > .93 ? 2 : e > .82 ? 0 : 1; if (!(e > .79 && e < .82)) sp.d[j * W + i] = RING[k]; }
    }
  }
  ring(false);
  for (var j = 0; j < H; j++) for (var i = 0; i < W; i++) { var dx = (i - cx) / r, dy = (j - cy) / r, d2 = dx * dx + dy * dy; if (d2 > 1) continue;
    var lit = -dx * .6 - dy * .5 + Math.sqrt(1 - d2) * .6, band = Math.sin(dy * 7) > .4 ? 1 : 0, s = lit > .6 ? 0 : lit > .2 ? 1 : lit > -.1 ? 2 : 3;
    sp.d[j * W + i] = PL[Math.min(3, s + (band && s < 3 && th(i, j) < .5 ? 1 : 0))]; }
  ring(true);
  sp.ccx = cx; sp.ccy = cy; return sp;
}

/* ---------- black hole: back disk, shadow + photon ring, front disk ---------- */
function drawHole(B, hx, hy, rb, grow, ph) {
  if (grow <= 0) return;
  var c = G.cols, r = G.rows, core = rb * grow, A = rb * 2.35 * grow, Bm = rb * .62 * grow, tilt = -.12, ct = Math.cos(tilt), st = Math.sin(tilt), ext = Math.ceil(A + 3);
  for (var y = Math.max(0, hy - ext); y <= Math.min(r - 1, hy + ext); y++) for (var x = Math.max(0, hx - ext); x <= Math.min(c - 1, hx + ext); x++) {
    var dx = x - hx, dy = y - hy, d = Math.hypot(dx, dy), i = y * c + x;
    var ex = dx * ct + dy * st, ey = (-dx * st + dy * ct), e = Math.hypot(ex / A, ey / Bm), ang = Math.atan2(ey / Bm, ex / A);
    var inDisk = e > .48 && e < 1, front = ey > 0;
    var bright = function () { var w = .5 + .5 * Math.sin(ang * 3 + ph) * Math.cos(ang - ph * .5), k = 1 - Math.abs(e - .74) / .26, v = k * (.55 + .45 * w) * 7; return DISC[clamp(Math.round(v + th(x, y) - .5), 1, 7)]; };
    /* lensed glow: back half bent over the top as a thin arc (Einstein ring) */
    if (inDisk && !front && d > core) B[i] = bright();
    var cr = core + .5, glow = Math.max(2.5, core * .38);
    if (d >= cr && d < cr + 1) B[i] = DISC[7];
    else if (d >= cr + 1 && d < cr + 1 + glow) { var q = (d - cr - 1) / glow; if (q < th(x, y) * 1.1) B[i] = DISC[q < .5 ? 5 : 4]; }
    if (d < cr) B[i] = 0xff000000;
    if (inDisk && front) B[i] = bright();
  }
}

/* ---------- layout ---------- */
var G = null;
function navH() { var n = document.querySelector('nav'); return n ? n.getBoundingClientRect().height : 0; }
function layout() {
  var P = innerWidth < 600 ? 3 : 4, w = SEC.clientWidth, cols = Math.max(1, Math.ceil(w / P));
  var hV = innerWidth < 600 ? Math.min(26, Math.floor((cols - 12) / 3.4)) : innerWidth < 1000 ? 30 : 34;
  var ts = titleSize(hV), padC = Math.ceil(hV * .25);
  if (!G || G.P !== P || G.hV !== hV) { TB.style.width = (ts.w + padC * 2) * P + 'px'; TB.style.height = (ts.h + padC * 2) * P + 'px'; }
  var h = SEC.clientHeight, rows = Math.max(1, Math.ceil(h / P));
  var tbx = 0, tby = 0, e = TB; while (e && e !== SEC) { tbx += e.offsetLeft; tby += e.offsetTop; e = e.offsetParent; }
  var tx = Math.round(tbx / P) + padC, ty = Math.round(tby / P) + padC;
  if (G && G.cols === cols && G.rows === rows && G.P === P && G.tx === tx && G.ty === ty && G.hV === hV) return false;
  CV.width = cols; CV.height = rows; CV.style.width = cols * P + 'px'; CV.style.height = rows * P + 'px';
  var img = CX.createImageData(cols, rows);
  G = { P: P, cols: cols, rows: rows, hV: hV, tx: tx, ty: ty, img: img, buf: new Uint32Array(img.data.buffer) };
  build();
  return true;
}
function build() {
  var c = G.cols, r = G.rows, n = c * r, mob = innerWidth < 700, i, k;
  /* background: ink + dithered violet nebula + fixed stars */
  var BG = new Uint32Array(n);
  for (var y = 0; y < r; y++) for (var x = 0; x < c; x++) {
    var u = x / 38, v = y / 38, f = Math.sin(u * 1.3 + Math.sin(v * 1.7) * 1.2) * Math.sin(v * 1.1 - u * .4 + 1) + .45 * Math.sin(u * 2.9 + v * 2.3 + 2);
    f = clamp((f + .25) * .9, 0, .999) * 3; BG[y * c + x] = NEB[Math.floor(f) + (f - Math.floor(f) > th(x, y) ? 1 : 0)] || NEB[3];
  }
  G.stars = [];
  var ns = Math.floor(n / 70);
  for (i = 0; i < ns; i++) { var sx = (R(i, 1) * c) | 0, sy = (R(i, 2) * r) | 0, b = R(i, 3); var col = b < .55 ? 0 : b < .85 ? 1 : b < .97 ? 2 : 3; BG[sy * c + sx] = STAR[col];
    if (col === 3) { if (sx > 0) BG[sy * c + sx - 1] = STAR[0]; if (sx < c - 1) BG[sy * c + sx + 1] = STAR[0]; if (sy > 0) BG[(sy - 1) * c + sx] = STAR[0]; if (sy < r - 1) BG[(sy + 1) * c + sx] = STAR[0]; } }
  G.bg = BG;
  /* title + hole */
  var tt = buildTitle(G.tx, G.ty, G.hV); G.letters = tt.letters; G.hx = tt.hx; G.hy = tt.hy; G.rb = tt.rb;
  /* Earth bottom-left, ringed planet top-right */
  var ER = mob ? Math.round(c * .3) : clamp(Math.round(Math.min(c * .15, r * .5)), 30, 70), E = buildEarth(ER);
  E.x = Math.round((mob ? c * .5 : c * .1) - E.c); E.y = Math.round(r - ER * (mob ? -.08 : .62) - E.c - E.top); G.earth = E;
  var PR = mob ? 6 : clamp(Math.round(c * .022), 7, 12), Pn = buildRinged(PR);
  Pn.x = Math.round((mob ? c * .87 : c * .86) - Pn.ccx); Pn.y = Math.round((mob ? r - 40 : r * .2) - Pn.ccy); G.planet = Pn;
  G.BIG = Math.max(2, r * .34 / G.rb);
  [G.earth, G.planet].concat(G.letters).forEach(prep);
  /* loose stars + scrap debris that get dragged in */
  G.loose = []; var nl = Math.floor(n / 40);
  for (i = 0; i < nl; i++) { var deb = R(i, 21) < .22, ang = R(i, 22) * 6.283, rad = G.rb * 2.5 + R(i, 23) * Math.max(c, r) * .75;
    G.loose.push({ a: ang, r: rad, s: T.sw0 + R(i, 24) * 2.6 + (rad / Math.max(c, r)) * .8, d: 1.3 + R(i, 25) * 1.1, deb: deb, sz: deb ? 1 + (R(i, 26) * 2 | 0) : 0, col: deb ? SCRAP[(R(i, 27) * 4) | 0] : STAR[1 + ((R(i, 28) * 3) | 0)] }); }
  G.fin = new Uint32Array(n); compose(DUR, G.fin, true); G.base = new Uint32Array(n); compose(DUR, G.base, true, true);
  G.pre = new Uint32Array(n); G.pre.set(BG);
}

/* ---------- compositor (pure function of t) ---------- */
/* per-sprite pixel lists in polar coords around the hole (for spaghettification) */
function prep(sp) {
  var n = 0, i, j, W = sp.w; for (i = 0; i < sp.d.length; i++) if (sp.d[i]) n++;
  sp.pr = new Float32Array(n); sp.pa = new Float32Array(n); sp.pc = new Uint32Array(n); sp.pn = new Float32Array(n); sp.pxy = new Int32Array(n * 2);
  var k = 0, mn = 1e9, mx = 0;
  for (j = 0; j < sp.h; j++) for (i = 0; i < W; i++) { var v = sp.d[j * W + i]; if (!v) continue; var X = sp.x + i, Y = sp.y + j, dx = X - G.hx, dy = Y - G.hy, r = Math.hypot(dx, dy);
    sp.pr[k] = r; sp.pa[k] = Math.atan2(dy, dx); sp.pc[k] = v; sp.pxy[k * 2] = X; sp.pxy[k * 2 + 1] = Y; if (r < mn) mn = r; if (r > mx) mx = r; k++; }
  for (k = 0; k < n; k++) sp.pn[k] = (sp.pr[k] - mn) / (mx - mn + 1);
}
/* k: 0 = at home, 1 = fully swallowed. Near pixels lead, so the sprite stretches into a spiralling noodle. */
function drawFall(B, sp, k, core, dir) {
  var c = G.cols, r = G.rows, S = 1.3, n = sp.pr.length;
  for (var q = 0; q < n; q++) {
    var kp = clamp(k * (1 + S) - S * sp.pn[q], 0, 1);
    if (kp <= 0) { B[sp.pxy[q * 2 + 1] * c + sp.pxy[q * 2]] = sp.pc[q]; continue; }
    var f = kp * kp, rr = sp.pr[q] * (1 - f) + core * .6 * f;
    if (rr < core) continue;
    var a = sp.pa[q] + dir * 2.6 * f, ca = Math.cos(a), sa = Math.sin(a), len = Math.round(f * (1 - f) * 14) + 1;
    for (var z = 0; z < len; z++) { var X = Math.round(G.hx + ca * (rr + z)), Y = Math.round(G.hy + sa * (rr + z) * (1 - .25 * f));
      if (X >= 0 && Y >= 0 && X < c && Y < r) B[Y * c + X] = z === 0 ? sp.pc[q] : (z < 3 ? sp.pc[q] : DISC[4]); }
  }
}
function blitD(B, sp, a) { /* dithered reveal */
  var c = G.cols; if (a >= 1) return blit(B, sp, 0, 0);
  for (var q = 0; q < sp.pr.length; q++) { var X = sp.pxy[q * 2], Y = sp.pxy[q * 2 + 1]; if (X >= 0 && Y >= 0 && X < c && Y < G.rows && th(X, Y) < a) B[Y * c + X] = sp.pc[q]; }
}
function holeGrow(t) {
  if (t >= T.end) return 1;
  if (t < T.gr0) return eo((t - T.bh0) / (T.bh1 - T.bh0));
  if (t < T.sh0) return 1 + (G.BIG - 1) * sm((t - T.gr0) / (T.gr1 - T.gr0));
  return 1 + (G.BIG - 1) * (1 - sm((t - T.sh0) / (T.sh1 - T.sh0)));
}
function holePhase(t) { var u = clamp(t / DUR, 0, 1); return 1.3 - 9 * (1 - u) * (1 - u); }
function kOf(t, st, du) { return clamp((t - st) / du, 0, 1); }
function compose(t, B, rest, nohole) {
  var c = G.cols, r = G.rows, gr = rest ? 1 : holeGrow(t), core = G.rb * gr, i, k; B.set(G.bg);
  if (rest) { for (i = 0; i < G.letters.length; i++) blit(B, G.letters[i], 0, 0);
    if (!nohole) drawHole(B, G.hx, G.hy, G.rb, 1, holePhase(DUR)); return; }
  /* loose stars / scrap: spiral in, accelerate, swallowed at the horizon */
  for (i = 0; i < G.loose.length; i++) {
    var L = G.loose[i], u = (t - L.s) / L.d, rad, ang;
    if (u >= 1) continue;
    var e = u <= 0 ? 0 : ei(u); rad = L.r * (1 - e) + G.rb * .6 * e; ang = L.a + 5.5 * e * e + (u > 0 ? .4 * u : 0);
    if (rad < core) continue;
    var tl = u > 0 ? Math.min(9, 1 + ((e * 10) | 0)) : 0, sq = u > 0 ? (1 - .55 * e) : 1;
    for (var q = tl; q >= 0; q--) { var aq = ang - q * .05, rq = rad + q * .6, qx = Math.round(G.hx + Math.cos(aq) * rq), qy = Math.round(G.hy + Math.sin(aq) * rq * sq);
      if (qx >= 0 && qy >= 0 && qx < c && qy < r) B[qy * c + qx] = q === 0 ? (L.deb ? L.col : (e > .6 ? DISC[6] : L.col)) : (q < 3 ? DISC[4] : DISC[2]); }
    if (L.deb && L.sz > 1) { var px = Math.round(G.hx + Math.cos(ang) * rad), py = Math.round(G.hy + Math.sin(ang) * rad * sq);
      for (var yy = 0; yy < L.sz; yy++) for (var xx = 0; xx < L.sz; xx++) { var X = px + xx, Y = py + yy; if (X >= 0 && Y >= 0 && X < c && Y < r) B[Y * c + X] = (xx + yy) & 1 ? SCRAP[1] : L.col; } }
  }
  var rv = kOf(t, T.rv0, T.rv1 - T.rv0), late = [];
  /* Earth + planet: part of the opening scene; they fall in and are gone for good */
  [[G.earth, T.ea0, 1.7, 1], [G.planet, T.pl0, 1.5, -1]].forEach(function (o) {
    var kf = kOf(t, o[1], o[2]); if (kf <= 0) blitD(B, o[0], rv); else if (kf < 1) drawFall(B, o[0], kf, core, o[3]);
  });
  /* the damaged letters only appear at the end: they unwind out of the hole as it shrinks into the O */
  for (i = 0; i < G.letters.length; i++) {
    var em = T.em0 + i * .12; if (t < em) continue;
    var ke = 1 - eo(kOf(t, em, 1.4)); if (ke <= 0) blit(B, G.letters[i], 0, 0); else late.push([G.letters[i], ke, i & 1 ? -1 : 1]);
  }
  if (t >= T.bh0) drawHole(B, G.hx, G.hy, G.rb, gr, holePhase(t));
  for (i = 0; i < late.length; i++) drawFall(B, late[i][0], late[i][1], core * .12, late[i][2]);
}
function paint(t) { if (t >= DUR) G.buf.set(G.fin); else compose(t, G.buf, false); CX.putImageData(G.img, 0, 0); }

/* ---------- DOM pieces: pulled in along the same spiral, then snap ---------- */
var ELS = [].slice.call(SEC.querySelectorAll('[data-void-in]'));
function home(el) { var x = 0, y = 0, e = el; while (e && e !== SEC) { x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; } return [x + el.offsetWidth / 2, y + el.offsetHeight / 2]; }
function applyPage(t) {
  for (var i = 0; i < ELS.length; i++) { var el = ELS[i], u = kOf(t, T.tx0 + i * .25, .5);
    el.style.opacity = u <= 0 ? '0' : u < .5 ? '.5' : ''; el.style.transform = u > 0 && u < 1 ? 'scale(' + (Math.round((.6 + .4 * eo(u)) * 10) / 10) + ')' : ''; }
}
function clearPage() { ELS.forEach(function (el) { el.style.opacity = ''; el.style.transform = ''; }); }

/* ---------- state ---------- */
var state = (REDUCED || OFF) ? 'done' : 'pre', S = null;
if (state === 'done') SEC.classList.remove('void-pre');
function drawState() { if (!G) return; if (S && !S.dead) paint(S.t); else { G.buf.set(state === 'pre' ? G.pre : G.fin); CX.putImageData(G.img, 0, 0); } }
function relayout() { layout(); drawState(); }
relayout();
if ('ResizeObserver' in window) new ResizeObserver(function () { if (layout()) drawState(); }).observe(SEC);
addEventListener('resize', function () { if (layout()) drawState(); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
addEventListener('load', relayout);

function otherBusy() { return !!window.__llcIntroBusy && window.__llcIntroBusy !== 'void'; }
function restY() { return Math.max(0, Math.round(SEC.getBoundingClientRect().top + window.pageYOffset - navH())); }
function jump(y) { window.scrollTo({ top: y, left: 0, behavior: 'instant' }); }

function ensure(manual) {
  if (S && !S.dead) return S;
  var cat = document.createElement('div'); cat.id = 'void-intro-catch'; cat.setAttribute('aria-hidden', 'true');
  var hint = document.createElement('div'); hint.className = 'hint';
  hint.textContent = (matchMedia('(pointer:coarse)').matches ? 'tap' : 'click or press any key') + ' to skip';
  cat.appendChild(hint); document.body.appendChild(cat);
  window.__llcIntroBusy = 'void'; state = 'running'; SEC.classList.remove('void-pre');
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
  layout();
  return s;
}
function render(s, t) {
  if (t >= DUR) { finish(s); return; }
  s.t = t; paint(t); applyPage(t);
  s.hint.classList.toggle('on', t > .8 && t < T.tx0 && !s.manual);
}
function finish(s) {
  if (!s || s.dead) return; s.dead = true; if (S === s) S = null;
  cancelAnimationFrame(s.raf);
  removeEventListener('keydown', s.skip, true); removeEventListener('wheel', s.noscroll); removeEventListener('touchmove', s.noscroll); removeEventListener('scroll', s.onscroll);
  s.cat.remove(); state = 'done'; clearPage(); SEC.classList.remove('void-pre');
  layout(); G.buf.set(G.fin); CX.putImageData(G.img, 0, 0);
  if (window.__llcIntroBusy === 'void') window.__llcIntroBusy = 0;
  AMB.t0 = performance.now();
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
    if (slow >= 24) return finish(s);
    s.t += clamp(dt, 0, .1); render(s, s.t);
    if (!s.dead) s.raf = requestAnimationFrame(fr);
  });
  return s;
}

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
} else if (state === 'pre') { state = 'done'; SEC.classList.remove('void-pre'); drawState(); }

/* ---------- seams: dithered ramps sea -> void -> paper ---------- */
(function () {
  function rgb(h) { return [parseInt(h.substr(1, 2), 16), parseInt(h.substr(3, 2), 16), parseInt(h.substr(5, 2), 16)]; }
  function draw(el, n) {
    var cv = el.querySelector('canvas'), P = 4, w = el.clientWidth, h = el.clientHeight, cols = Math.ceil(w / P), rows = Math.ceil(h / P);
    cv.width = cols; cv.height = rows; cv.style.width = cols * P + 'px'; cv.style.height = rows * P + 'px';
    var x = cv.getContext('2d'), img = x.createImageData(cols, rows), D = img.data;
    var ramp = el.dataset.ramp.split(',').map(rgb), N = ramp.length - 1, jit = [];
    for (var X = 0; X < cols; X++) jit.push(Math.round(Math.sin(X * .23 + n * 3) * 1.5 + Math.sin(X * .071 + n * 2) * 2));
    for (var Y = 0; Y < rows; Y++) for (X = 0; X < cols; X++) {
      var t = clamp((Y + jit[X]) / (rows - 1), 0, 1); if (Y === 0) t = 0; if (Y === rows - 1) t = 1;
      var f = t * N, i = Math.min(N, Math.floor(f) + ((f - Math.floor(f)) > th(X, Y) ? 1 : 0)), c = ramp[i], k = (Y * cols + X) * 4;
      D[k] = c[0]; D[k + 1] = c[1]; D[k + 2] = c[2]; D[k + 3] = 255;
    }
    x.putImageData(img, 0, 0);
  }
  var seams = [].slice.call(document.querySelectorAll('.void-seam'));
  function all() { seams.forEach(draw); }
  all(); var tm; addEventListener('resize', function () { clearTimeout(tm); tm = setTimeout(all, 150); });
})();

/* ---------- ambient: slow swirl of the accretion disk on the resting page (not with reduced motion) ---------- */
var AMB = { off: REDUCED || /[?&]voidswirl=off\b/.test(location.search), frozen: false, t0: performance.now(), vis: false, last: 0 };
if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { AMB.vis = es[es.length - 1].isIntersecting; }).observe(SEC);
function ambient(now) {
  requestAnimationFrame(ambient);
  if (AMB.off || AMB.frozen || !AMB.vis || state !== 'done' || (S && !S.dead) || !G || now - AMB.last < 80) return;
  AMB.last = now;
  var ph = holePhase(DUR) + (now - AMB.t0) / 1000 * .45, ext = Math.ceil(G.rb * 2.35 + 4), x0 = Math.max(0, G.hx - ext), y0 = Math.max(0, G.hy - ext), x1 = Math.min(G.cols, G.hx + ext + 1), y1 = Math.min(G.rows, G.hy + ext + 1);
  for (var y = y0; y < y1; y++) { var o = y * G.cols; G.buf.set(G.base.subarray(o + x0, o + x1), o + x0); }
  drawHole(G.buf, G.hx, G.hy, G.rb, 1, ph);
  CX.putImageData(G.img, 0, 0, x0, y0, x1 - x0, y1 - y0);
}
requestAnimationFrame(ambient);

window.__voidIntro = {
  freeze: function (on) { AMB.frozen = on !== false; if (AMB.frozen && G && state === 'done' && !S) { G.buf.set(G.fin); CX.putImageData(G.img, 0, 0); } },
  duration: DUR, timeline: T,
  seek: function (t) { var s = ensure(true); s.manual = true; render(s, clamp(t, 0, DUR)); return S ? S.t : DUR; },
  step: function (dt) { var s = ensure(true); s.manual = true; render(s, Math.min(DUR, s.t + dt)); return S ? S.t : DUR; },
  skip: function () { if (S) finish(S); },
  play: function () { if (S) return false; state = 'pre'; return !!start(true); },
  state: function () { return S ? 'running' : state; },
  restY: restY
};
})();

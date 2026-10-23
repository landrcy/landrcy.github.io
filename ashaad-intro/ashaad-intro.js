/* The Binding of Ashaad — storybook intro.
   Three torn parchment panels (procedural, dithered pixel art) unroll one after another,
   then the last page tears open and rolls away to reveal the section. Local canvas only. */
(function () {
'use strict';
var SEC = document.getElementById('ashaad');
if (!SEC || window.__ashaadIntroLoaded) return;
window.__ashaadIntroLoaded = true;
var BASE = (function () { try { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/ashaad-intro\/[^\/]*$/, '') : ''; } catch (e) { return ''; } })();
var REDUCED = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- tiny helpers ---------- */
var BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(function (v) { return (v + .5) / 16; });
function bay(x, y) { return BAY[((y & 3) << 2) | (x & 3)]; }
function rng(s) { var a = s >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var t = a; t = Math.imul(t ^ t >>> 15, t | 1); t ^= t + Math.imul(t ^ t >>> 7, t | 61); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(x, y, s) { var h = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041); h = Math.imul(h ^ h >>> 13, 1274126177); return ((h ^ h >>> 16) >>> 0) / 4294967296; }
function vnoise(x, y, s) { var xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; xf = xf * xf * (3 - 2 * xf); yf = yf * yf * (3 - 2 * yf); var a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf; }
function fbm(x, y, s) { return vnoise(x, y, s) * .55 + vnoise(x * 2, y * 2, s + 7) * .3 + vnoise(x * 4, y * 4, s + 13) * .15; }
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function sm(a, b, v) { v = clamp((v - a) / (b - a), 0, 1); return v * v * (3 - 2 * v); }
function eio(p) { p = clamp(p, 0, 1); return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }
function eoback(p) { p = clamp(p, 0, 1); var c1 = 1.9, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); }
function C(h) { var n = parseInt(h.slice(1), 16); return ((255 << 24) | ((n & 255) << 16) | (n & 0xff00) | (n >> 16)) >>> 0; }
function mk(w, h) { var c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); c.getContext('2d').imageSmoothingEnabled = false; return c; }
function ramp(a, v, x, y) { var n = a.length - 1; if (v <= 0) return a[0]; if (v >= 1) return a[n]; var f = v * n, i = f | 0; return (f - i) > bay(x, y) ? a[i + 1] : a[i]; }
function pxl(c, x, y, col) { c.fillStyle = col; c.fillRect(x | 0, y | 0, 1, 1); }
function line(c, x0, y0, x1, y1, col, th) {
  x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; th = th || 1; c.fillStyle = col;
  var dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1, er = dx + dy, g = 0;
  while (g++ < 4000) { c.fillRect(x0, y0, th, th); if (x0 === x1 && y0 === y1) break; var e2 = 2 * er; if (e2 >= dy) { er += dy; x0 += sx; } if (e2 <= dx) { er += dx; y0 += sy; } }
}
function sketch(c, x0, y0, x1, y1, col, seed, jit, th) { /* hand-inked wobbly line */
  var L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / 7)), px = x0, py = y0, nx = -(y1 - y0) / (L || 1), ny = (x1 - x0) / (L || 1);
  for (var i = 1; i <= n; i++) { var t = i / n, j = i === n ? 0 : (hash(i, seed, 3) - .5) * 2 * jit; var X = Math.round(x0 + (x1 - x0) * t + nx * j), Y = Math.round(y0 + (y1 - y0) * t + ny * j); line(c, px, py, X, Y, col, th || 1); px = X; py = Y; }
}
function disc(c, cx, cy, r, col) { c.fillStyle = col; for (var y = -r; y <= r; y++) { var w = Math.round(Math.sqrt(Math.max(0, r * r - y * y))); c.fillRect(cx - w, cy + y, w * 2 + 1, 1); } }
function ellipse(c, cx, cy, rx, ry, col) { c.fillStyle = col; for (var y = -ry; y <= ry; y++) { var w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry || 1)))); c.fillRect(cx - w, cy + y, w * 2 + 1, 1); } }

var INK = '#0e0704';
var RAMP_PAPER = ['#7b5a30', '#9a7743', '#bf9b60', '#d8bd82', '#e8d298', '#f3e3b0'].map(C);
var RAMP_DARK = ['#0a0503', '#170d07', '#2b190d', '#472c16', '#6c4725', '#9b7240', '#cfa966', '#f1dfa6'].map(C);
var RAMP_SEPIA = ['#0e0704', '#26150b', '#4f3219', '#7f5a30', '#b88f55', '#e5c88d', '#f6e8bd'].map(C);
var RAMP_RED = ['#1c0605', '#541210', '#8f1d15', '#c93321', '#f05a3c'].map(C);
var RAMP_DAY = ['#1d1108', '#3f2813', '#6b4824', '#98703c', '#c39a5c', '#e2c88c', '#f6e8bd'].map(C);
var RAMP_ROLL = ['#1a0f08', '#3a2412', '#6b4a28', '#9a7743', '#c9a46a', '#e3cb90', '#f6e8bd'].map(C);
var RAMP_WOOD = ['#060302', '#100907', '#1c110a', '#2a1a0e'].map(C);

/* ---------- field -> dithered canvas ---------- */
function fieldCanvas(w, h, fn, rp) {
  var cv = mk(w, h), c = cv.getContext('2d'), id = c.createImageData(w, h), d = new Uint32Array(id.data.buffer);
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) { var v = fn(x, y); d[y * w + x] = v < -.5 ? 0 : ramp(rp, v, x, y); }
  c.putImageData(id, 0, 0); return cv;
}

/* ---------- stained, torn parchment ---------- */
function makePaper(w, h, seed, torn) {
  var cv = mk(w, h), ctx = cv.getContext('2d'), id = ctx.createImageData(w, h), d = new Uint32Array(id.data.buffer), R = rng(seed);
  var L = new Int8Array(h), Rr = new Int8Array(h), Tp = new Int8Array(w), Bt = new Int8Array(w), mx = torn ? 4 : 0;
  function walk(a, n) { var e = 1; for (var i = 0; i < n; i++) { var r = R(); if (r < .28) e++; else if (r < .56) e--; if (R() < .025) e += 2; e = clamp(e, 0, mx); a[i] = e; } }
  walk(L, h); walk(Rr, h); walk(Tp, w); walk(Bt, w);
  var blots = []; for (var i = 0; i < 5; i++) blots.push({ x: R() * w, y: R() * h, r: 8 + R() * 20 });
  var cx1 = Math.round(w * (.42 + R() * .16)), cy1 = Math.round(h * (.4 + R() * .2));
  var INKB = C('#2b1a0e'), FIB = C('#f6e8bd');
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
    var de = Math.min(x - L[y], w - 1 - Rr[y] - x, y - Tp[x], h - 1 - Bt[x] - y);
    if (torn) { /* snipped corners */
      var cr = 4, ccx = Math.min(x, w - 1 - x), ccy = Math.min(y, h - 1 - y); if (ccx + ccy < cr) de = -1;
    }
    if (de < 0) { d[y * w + x] = 0; continue; }
    if (torn && de === 0) { d[y * w + x] = INKB; continue; }
    if (torn && de === 1 && hash(x, y, seed) > .3) { d[y * w + x] = FIB; continue; }
    var v = .76 + (fbm(x * .035, y * .035, seed) - .5) * .6 + (fbm(x * .2, y * .2, seed + 5) - .5) * .16;
    if (de < 16) v -= Math.pow(1 - de / 16, 1.7) * .52;
    for (var b = 0; b < blots.length; b++) { var bb = blots[b], dd = Math.hypot(x - bb.x, y - bb.y) / bb.r; if (dd < 1.2) v -= (dd < 1 ? .045 : 0) + Math.exp(-Math.pow((dd - 1) * 6, 2)) * .17; }
    if (Math.abs(x - cx1) === 0) v -= .12; if (Math.abs(y - cy1) === 0) v -= .1;
    if (hash(x, y, seed + 9) > .988) v -= .13;
    d[y * w + x] = ramp(RAMP_PAPER, v, x, y);
  }
  ctx.putImageData(id, 0, 0); return cv;
}

/* ---------- ink-dithered sprites ---------- */
function inkSprite(img, w, h, o) {
  o = o || {}; var W = w + 2, H = h + 2, cv = mk(W, H), c = cv.getContext('2d');
  c.imageSmoothingEnabled = !!o.smooth; if (o.smooth) c.imageSmoothingQuality = 'high';
  c.drawImage(img, 1, 1, w, h);
  var s = c.getImageData(0, 0, W, H).data, out = new Uint32Array(W * H), op = new Uint8Array(W * H), rp = o.ramp || RAMP_SEPIA, i, x, y;
  for (i = 0; i < W * H; i++) if (s[i * 4 + 3] > 120) {
    op[i] = 1; var r = s[i * 4], g = s[i * 4 + 1], b = s[i * 4 + 2], lum = (.3 * r + .59 * g + .11 * b) / 255; x = i % W; y = (i / W) | 0;
    var v = clamp((lum - .06) * 1.3 * (o.gain || 1), 0, 1);
    out[i] = (r > g * 2.0 && r > b * 2.0 && r > 90) ? ramp(RAMP_RED, clamp(lum * 1.7, 0, 1), x, y) : ramp(rp, v, x, y);
  }
  var rim = C(o.rim || INK);
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) { i = y * W + x; if (op[i]) continue; if ((x > 0 && op[i - 1]) || (x < W - 1 && op[i + 1]) || (y > 0 && op[i - W]) || (y < H - 1 && op[i + W])) out[i] = rim; }
  c.putImageData(new ImageData(new Uint8ClampedArray(out.buffer), W, H), 0, 0); return cv;
}
function crispSprite(img, w, h) { /* keep colours, kill anti-alias */
  var cv = mk(w, h), c = cv.getContext('2d'); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(img, 0, 0, w, h);
  var id = c.getImageData(0, 0, w, h), d = id.data; for (var i = 0; i < w * h; i++) { d[i * 4 + 3] = d[i * 4 + 3] > 110 ? 255 : 0; } c.putImageData(id, 0, 0); return cv;
}
function textCv(str, px, col, outline, weight) {
  var f = (weight || 700) + ' ' + px + 'px Silkscreen,"Pixelify Sans",monospace', m = mk(4, 4).getContext('2d'); m.font = f;
  var wd = Math.ceil(m.measureText(str).width) + 4, hh = Math.ceil(px * 1.6) + 3, cv = mk(wd, hh), c = cv.getContext('2d'); c.font = f; c.fillStyle = '#fff'; c.fillText(str, 2, px + 1);
  var s = c.getImageData(0, 0, wd, hh).data, x, y, x0 = wd, x1 = 0, y0 = hh, y1 = 0;
  for (y = 0; y < hh; y++) for (x = 0; x < wd; x++) if (s[(y * wd + x) * 4 + 3] > 120) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  if (x1 < x0) { x0 = 0; x1 = 1; y0 = 0; y1 = 1; }
  var W = x1 - x0 + 3, H = y1 - y0 + 3, o = mk(W, H), oc = o.getContext('2d'), mask = new Uint8Array(W * H);
  for (y = y0; y <= y1; y++) for (x = x0; x <= x1; x++) if (s[(y * wd + x) * 4 + 3] > 120) mask[(y - y0 + 1) * W + (x - x0 + 1)] = 1;
  for (y = 0; y < H; y++) for (x = 0; x < W; x++) { var i = y * W + x; if (mask[i]) pxl(oc, x, y, col); else if (outline && ((x > 0 && mask[i - 1]) || (x < W - 1 && mask[i + 1]) || (y > 0 && mask[i - W]) || (y < H - 1 && mask[i + W]))) pxl(oc, x, y, outline); }
  return o;
}
function textFit(list, px, col, outline, weight, maxW) { var cv; for (var i = 0; i < list.length; i++) { cv = textCv(list[i], px, col, outline, weight); if (cv.width <= maxW) return cv; } return cv; }
var gcv = mk(64, 64);
function glow(c, cx, cy, r, amt, rgb) { /* dithered additive firelight */
  r = r | 0; var n = r * 2 + 1; if (gcv.width < n) { gcv.width = n; gcv.height = n; }
  var g = gcv.getContext('2d'); g.clearRect(0, 0, gcv.width, gcv.height); var id = g.createImageData(n, n), d = id.data;
  for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { var dx = x - r, dy = y - r, dd = Math.sqrt(dx * dx + dy * dy) / r; if (dd < 1) { var v = Math.pow(1 - dd, 1.5) * amt; if (v > bay(cx + dx, cy + dy) * .62 + hash(cx + dx, cy + dy, 77) * .38) { var i = (y * n + x) * 4; d[i] = rgb[0]; d[i + 1] = rgb[1]; d[i + 2] = rgb[2]; d[i + 3] = 255; } } }
  g.putImageData(id, 0, 0); c.save(); c.globalCompositeOperation = 'lighter'; c.drawImage(gcv, 0, 0, n, n, cx - r, cy - r, n, n); c.restore();
}
function computeExt(cv, dir) { /* per sheet-row left/right extents of opaque paper */
  var w = cv.width, h = cv.height, a = cv.getContext('2d').getImageData(0, 0, w, h).data, horiz = dir === 'right' || dir === 'left', Hv = horiz ? w : h, Wu = horiz ? h : w;
  var L = new Int16Array(Hv).fill(Wu), Rr = new Int16Array(Hv).fill(0);
  for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) if (a[(y * w + x) * 4 + 3] > 0) {
    var u = horiz ? y : x, v = horiz ? (dir === 'left' ? w - 1 - x : x) : (dir === 'up' ? h - 1 - y : y);
    if (u < L[v]) L[v] = u; if (u + 1 > Rr[v]) Rr[v] = u + 1;
  }
  for (var i = 0; i < Hv; i++) if (L[i] >= Rr[i]) { L[i] = 0; Rr[i] = Wu; }
  return { L: L, R: Rr };
}

/* ---------- the unfurl: a sheet that rolls open (or shut) around a shaded paper cylinder ---------- */
var SC = {};
function unfurl(dctx, src, o) {
  var dir = o.dir, sw = o.sw, sh = o.sh, horiz = dir === 'right' || dir === 'left', Wu = horiz ? sh : sw, Hv = horiz ? sw : sh;
  var Rm = o.Rmax, e = clamp(o.e, 0, 1), tp = clamp(o.tp, 0, 1), exit = !!o.exit, PADT = 6, PADB = 9;
  var OH = Hv + 2 * Rm + PADT + PADB + 4;
  if (!SC.sheet || SC.sheet.width !== Wu || SC.sheet.height !== Hv) { SC.sheet = mk(Wu, Hv); }
  if (!SC.out || SC.out.width !== Wu || SC.out.height !== OH) { SC.out = mk(Wu, OH); SC.sh = mk(Wu, OH); }
  var sctx = SC.sheet.getContext('2d'), octx = SC.out.getContext('2d');
  sctx.setTransform(1, 0, 0, 1, 0, 0); sctx.clearRect(0, 0, Wu, Hv);
  if (dir === 'down') sctx.setTransform(1, 0, 0, 1, 0, 0);
  else if (dir === 'up') sctx.setTransform(1, 0, 0, -1, 0, Hv);
  else if (dir === 'right') sctx.setTransform(0, 1, 1, 0, 0, 0);
  else sctx.setTransform(0, -1, 1, 0, 0, Hv);
  sctx.drawImage(src, o.sx, o.sy, sw, sh, 0, 0, sw, sh); sctx.setTransform(1, 0, 0, 1, 0, 0);
  octx.clearRect(0, 0, Wu, OH);
  var R = Math.round(Rm * sm(0, .1, tp) * Math.pow(1 - e, .75)); if (e > .985 && !exit) R = 0;
  var f = exit ? e * (Hv + 2 * Rm + 2) - (2 * Rm + 2) : e * Hv;
  var wobAmp = (o.wob == null ? 1 : o.wob) * Math.sin(Math.PI * (exit ? 1 - e : e)), t = o.t;
  var bw = o.bw || 3, nb = Math.ceil(Wu / bw), offs = new Int16Array(nb), b, x0, w;
  for (b = 0; b < nb; b++) { var xc = b * bw + bw / 2; offs[b] = Math.round(wobAmp * (1.5 * Math.sin(xc * .045 + t * 5.5) + (xc / Wu - .5) * 3.4 * Math.sin(t * 3.1 + 1)) + (o.jag ? o.jag[b] : 0)); }
  /* flat paper */
  for (b = 0; b < nb; b++) { x0 = b * bw; w = Math.min(bw, Wu - x0); var fb = f + offs[b]; if (fb > 0) { var hh = Math.min(fb, Hv); octx.drawImage(SC.sheet, x0, 0, w, hh, x0, 0, w, hh); } }
  if (R >= 1) {
    var RH = PADT + 2 * R + PADB;
    if (!SC.roll || SC.roll.width !== Wu || SC.roll.height < RH) SC.roll = mk(Wu, Math.max(RH, 2 * Rm + PADT + PADB));
    var rc = SC.roll.getContext('2d'); rc.clearRect(0, 0, SC.roll.width, SC.roll.height);
    var id = rc.createImageData(Wu, RH), d = new Uint32Array(id.data.buffer);
    var ei = clamp(Math.round(f + R), 0, Hv - 1), ext = o.ext, lo = ext ? ext.L[ei] : 0, hi = ext ? ext.R[ei] : Wu, INKC = C(INK);
    var j, x;
    for (j = 0; j < 2 * R; j++) {
      var k = (j + .5) / R - 1, nz = Math.sqrt(Math.max(0, 1 - k * k)), I = -.55 * k + .83 * nz + (k > .6 ? (k - .6) * .5 : 0);
      for (x = lo; x < hi; x++) {
        var v = .02 + .9 * Math.pow(clamp(I, 0, 1), 1.45) + (vnoise(x * .06, j * .45, 9) - .5) * .12 - (hash(x, j, 3) > .987 ? .16 : 0); if (I > .94) v = Math.max(v, .97);
        var endd = Math.min(x - lo, hi - 1 - x); if (endd < 3) v -= (3 - endd) * .1;
        d[(PADT + j) * Wu + x] = (j === 0 || j === 2 * R - 1) ? INKC : (j === 1 && hash(x, 5, 1) > .5) ? INKC : ramp(RAMP_ROLL, v, x, j);
      }
      /* a darker seam line where the paper's loose end sits on the roll */
      if (j === Math.round(R * 1.45)) for (x = lo; x < hi; x++) if (hash(x, 1, 2) > .12) d[(PADT + j) * Wu + x] = C('#6b4a28');
    }
    var jt, dens;
    for (j = 0; j < PADT; j++) { dens = .55 * Math.pow((j + 1) / PADT, 1.4); for (x = lo; x < hi; x++) if (dens > bay(x, j)) d[j * Wu + x] = C('#000000') & 0x00ffffff | (150 << 24); }
    for (j = 0; j < PADB; j++) { dens = .6 * Math.pow(1 - j / PADB, 1.3); for (x = lo + 1; x < hi + 2 && x < Wu; x++) if (dens > bay(x, j + 2)) d[(PADT + 2 * R + j) * Wu + x] = C('#000000') & 0x00ffffff | (170 << 24); }
    rc.putImageData(id, 0, 0);
    octx.save(); octx.globalCompositeOperation = 'source-atop';
    for (b = 0; b < nb; b++) { x0 = b * bw; w = Math.min(bw, Wu - x0); octx.drawImage(SC.roll, x0, 0, w, PADT, x0, f + offs[b] - PADT, w, PADT); }
    octx.restore();
    for (b = 0; b < nb; b++) { x0 = b * bw; w = Math.min(bw, Wu - x0); octx.drawImage(SC.roll, x0, PADT, w, 2 * R + PADB, x0, f + offs[b], w, 2 * R + PADB); }
  }
  /* blit to dest with the dir transform; shadow first */
  var M = dir === 'down' ? [1, 0, 0, 1, 0, 0] : dir === 'up' ? [1, 0, 0, -1, 0, Hv] : dir === 'right' ? [0, 1, 1, 0, 0, 0] : [0, 1, -1, 0, Hv, 0];
  if (o.shadow !== false) {
    var shc = SC.sh.getContext('2d'); shc.globalCompositeOperation = 'source-over'; shc.clearRect(0, 0, Wu, OH); shc.drawImage(SC.out, 0, 0);
    shc.globalCompositeOperation = 'source-in'; shc.fillStyle = '#000'; shc.fillRect(0, 0, Wu, OH); shc.globalCompositeOperation = 'source-over';
    dctx.save(); dctx.setTransform(M[0], M[1], M[2], M[3], M[4] + o.dx + 3, M[5] + o.dy + 3); dctx.globalAlpha = .5; dctx.drawImage(SC.sh, 0, 0); dctx.restore();
  }
  dctx.save(); dctx.setTransform(M[0], M[1], M[2], M[3], M[4] + o.dx, M[5] + o.dy); dctx.drawImage(SC.out, 0, 0); dctx.restore();
}

/* ---------- assets ---------- */
var IMG = {};
function loadImg(k, src) { return new Promise(function (res, rej) { var i = new Image(); i.onload = function () { IMG[k] = i; res(); }; i.onerror = function () { rej(new Error('img ' + src)); }; i.src = BASE + 'games/ashaad/' + src; }); }
var assetsP = null;
function assets() {
  if (assetsP) return assetsP;
  var names = { fin: 'finley.png', jul: 'julian.png', emm: 'emmanuel.png', jg: 'julian_good.png', ash: 'ashaad.png', f0: 'fire0.png', f1: 'fire1.png', f2: 'fire2.png', f3: 'fire3.png' };
  var ps = Object.keys(names).map(function (k) { return loadImg(k, names[k]); });
  var fp = (document.fonts && document.fonts.load) ? Promise.race([Promise.all([document.fonts.load('700 8px Silkscreen'), document.fonts.load('700 16px Silkscreen')]), new Promise(function (r) { setTimeout(r, 1500); })]).catch(function () {}) : Promise.resolve();
  assetsP = Promise.all(ps.concat([fp]));
  return assetsP;
}

/* ---------- panel scaffolding ---------- */
function artBox(w, h, small) { var m = small ? 6 : 8, cap = small ? 15 : 17; return { x: m, y: m, w: w - 2 * m, h: h - m - cap }; }
function boil(c, A, fr, col) { /* hand-inked frame that redraws a little differently every frame */
  var x0 = A.x - 1, y0 = A.y - 1, x1 = A.x + A.w - 2, y1 = A.y + A.h - 2, sd = [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]];
  for (var s = 0; s < 4; s++) { var q = sd[s], L = Math.hypot(q[2] - q[0], q[3] - q[1]), n = Math.round(L / 8), px = q[0], py = q[1], nx = s % 2 ? 1 : 0, ny = s % 2 ? 0 : 1;
    for (var i = 1; i <= n; i++) { var t = i / n, j = i === n ? 0 : ((hash(i, s, fr) * 3) | 0) - 1, X = Math.round(q[0] + (q[2] - q[0]) * t + nx * j), Y = Math.round(q[1] + (q[3] - q[1]) * t + ny * j); line(c, px, py, X, Y, col, 3); px = X; py = Y; } }
}
function typed(c, cv, x, y, p) { var w = Math.floor(cv.width * clamp(p, 0, 1)); if (w > 0) c.drawImage(cv, 0, 0, w, cv.height, x, y, w, cv.height); }
function brickField(seed, base, bw, bh, ms) { ms = ms == null ? .06 : ms; return function (x, y) { var row = (y / bh) | 0, off = (row & 1) * (bw >> 1), bx = x + off, col = bx % bw, mort = (y % bh === 0) || col === 0; return base + hash((bx / bw) | 0, row, seed) * .09 + (mort ? ms : 0) + (fbm(x * .05, y * .05, seed) - .5) * .12; }; }
function vig(x, y, aw, ah, k) { var nx = (x / aw - .5) * 2, ny = (y / ah - .5) * 2, r = Math.sqrt(nx * nx * .9 + ny * ny * 1.1), vv = Math.max(0, r - .32); return 1 - Math.min(.9, vv * vv * k); }
function fireFrames(w, h) { return [IMG.f0, IMG.f1, IMG.f2, IMG.f3].map(function (i) { return crispSprite(i, w, h); }); }
function flicker(t, s) { return .55 + .45 * (vnoise(t * 11, s, 4) * .6 + vnoise(t * 27, s, 5) * .4); }

/* PANEL 1 — finley, small and alone */
function buildPanel1(w, h, small) {
  var seed = 11, paper = makePaper(w, h, seed, true), A = artBox(w, h, small), aw = A.w, ah = A.h;
  var floorY = Math.round(ah * .7), wcx = Math.round(aw * .28), wy0 = 6, wh = Math.round(ah * .3), ww = Math.max(14, Math.round(aw * .12));
  var fx = Math.round(aw * (small ? .5 : .56)), ffy = floorY + Math.round((ah - floorY) * .5), fsz = Math.round(Math.min(ah * .27, aw * .22));
  var fin = inkSprite(IMG.fin, fsz, fsz, { smooth: true });
  var flames = fireFrames(Math.round(fsz * .42), Math.round(fsz * .56));
  var capCv = textFit(['FINLEY WAS ALONE.', 'FINLEY, ALONE.'], 8, '#2b1a0e', null, 700, w - 16);
  var art = fieldCanvas(aw, ah, function (x, y) {
    var v;
    if (y < floorY) v = brickField(seed, .5, 16, 8, -.13)(x, y);
    else { var fy = y - floorY; v = .4 + (fbm(x * .06, y * .2, seed) - .5) * .14 - (((x + ((fy / 6 | 0) & 1) * 9) % 18) === 0 ? .08 : 0) - (fy % 7 === 0 ? .08 : 0); }
    v *= vig(x, y, aw, ah, 1.3);
    var wy1 = wy0 + wh;
    if (Math.abs(x - wcx) < ww / 2 && y >= wy0 + ww / 2 && y <= wy1) v = .93;
    else if (y < wy0 + ww / 2 && y >= wy0 && Math.hypot(x - wcx, y - (wy0 + ww / 2)) < ww / 2) v = .93;
    if (y > wy1 && y < ffy + 10) { var t = (y - wy1) / (ffy - wy1), cx = wcx + (fx - wcx) * t, hw = ww / 2 + (22 - ww / 2) * t, dxn = Math.abs(x - cx) / hw; if (dxn < 1) v += .6 * (1 - t * .45) * (1 - Math.pow(dxn, 3)); }
    var pd = Math.hypot((x - fx) / (aw * .2), (y - (ffy - 1)) / 7); if (pd < 1) v += .4 * (1 - pd * pd);
    var sd = Math.hypot((x - (fx + 14)) / 24, (y - (ffy + 2)) / 4); if (sd < 1) v *= 1 - .8 * (1 - sd);
    return v;
  }, RAMP_DAY);
  var c = art.getContext('2d'), wy1 = wy0 + wh;
  /* window frame, cross bars, sill, cobweb — inked by hand */
  var wx0 = wcx - (ww >> 1), wx1 = wcx + (ww >> 1);
  line(c, wx0, wy0 + ww / 2, wx0, wy1, INK, 2); line(c, wx1, wy0 + ww / 2, wx1, wy1, INK, 2); line(c, wx0 - 2, wy1 + 1, wx1 + 2, wy1 + 1, INK, 2);
  var px = wx0, py = wy0 + ww / 2; for (var a = 1; a <= 10; a++) { var an = Math.PI + a * Math.PI / 10, X = Math.round(wcx + Math.cos(an) * ww / 2), Y = Math.round(wy0 + ww / 2 + Math.sin(an) * ww / 2); line(c, px, py, X, Y, INK, 2); px = X; py = Y; }
  line(c, wcx, wy0, wcx, wy1, INK, 1); line(c, wx0, wy0 + Math.round(wh * .5), wx1, wy0 + Math.round(wh * .5), INK, 1);
  var web = '#2b1a0e'; for (var q = 0; q < 5; q++) { var ang = q * Math.PI / 8 + .08; line(c, 0, 0, Math.round(Math.cos(ang) * 30), Math.round(Math.sin(ang) * 30), web, 1); }
  for (var r2 = 8; r2 <= 26; r2 += 9) for (var q2 = 0; q2 < 4; q2++) { var a0 = q2 * Math.PI / 8 + .08, a1 = a0 + Math.PI / 8; line(c, Math.round(Math.cos(a0) * r2), Math.round(Math.sin(a0) * r2), Math.round(Math.cos(a1) * r2 * .92), Math.round(Math.sin(a1) * r2 * .92 + 1), web, 1); }
  line(c, 0, floorY, aw, floorY, INK, 1);
  var base = mk(w, h), bc = base.getContext('2d'); bc.drawImage(paper, 0, 0); bc.drawImage(art, A.x, A.y);
  var P = { w: w, h: h, base: base, dir: 'down' };
  P.draw = function (c, lt) {
    c.drawImage(base, 0, 0);
    c.save(); c.translate(A.x, A.y); c.beginPath(); c.rect(0, 0, aw, ah); c.clip();
    var fi = Math.floor(lt * 9) % 4, bob = (Math.floor(lt * 1.6) % 2);
    /* candle */
    var cxx = fx + Math.round(fsz * .85), cyy = ffy - 1, ch = Math.round(fsz * .3);
    var gl = flicker(lt, 3); glow(c, cxx, cyy - ch - 4, Math.round(aw * .2), .55 * gl, [190, 84, 16]);
    c.fillStyle = INK; c.fillRect(cxx - 3, cyy - ch - 1, 7, ch + 2); c.fillStyle = '#d9c28a'; c.fillRect(cxx - 2, cyy - ch, 5, ch); c.fillStyle = '#a58a54'; c.fillRect(cxx + 1, cyy - ch, 2, ch);
    var fl = flames[fi]; c.drawImage(fl, cxx - (fl.width >> 1), cyy - ch - fl.height + 2 + (fi & 1));
    /* finley, breathing */
    c.drawImage(fin, fx - (fin.width >> 1), ffy - fin.height + 2 + bob);
    /* dust motes drifting through the light */
    for (var i = 0; i < 18; i++) {
      var hx = hash(i, 1, 41), hy = hash(i, 2, 41), t = ((hy * floorY) + lt * (3 + hash(i, 3, 41) * 4)) % (floorY - wy1 - 6), yy = wy1 + 4 + t, tt = (yy - wy1) / (ffy - wy1);
      var cc = wcx + (fx - wcx) * tt, hw = ww / 2 + (22 - ww / 2) * tt, xx = cc + (hx - .5) * 2 * hw * .95 + Math.sin(lt * .8 + i) * 3;
      pxl(c, xx, yy, hash(i, 4, 41) > .5 ? '#2b1a0e' : '#6b4824');
    }
    /* a spider on a thread */
    var sx = Math.round(aw * .86), sy = 10 + Math.round(14 * (.5 + .5 * Math.sin(lt * 1.2)));
    line(c, sx, 0, sx, sy, '#2b1a0e', 1); disc(c, sx, sy + 1, 1, INK); c.fillStyle = INK; c.fillRect(sx - 3, sy, 1, 1); c.fillRect(sx + 3, sy, 1, 1); c.fillRect(sx - 3, sy + 2, 1, 1); c.fillRect(sx + 3, sy + 2, 1, 1);
    /* a drip from the ceiling into the puddle */
    var dp = (lt * .8) % 1, dxp = Math.round(aw * .72); if (dp < .7) pxl(c, dxp, Math.round(dp / .7 * (ffy - 4)), '#1d1108'); else { var rr = Math.round((dp - .7) / .3 * 5); if (rr > 0) { ellipse(c, dxp, ffy - 3, rr, 1, '#3f2813'); } }
    c.restore();
    boil(c, A, Math.floor(lt * 6), INK);
    typed(c, capCv, ((w - capCv.width) >> 1), A.y + ah + (((h - A.y - ah - capCv.height) >> 1) - 1), (lt - 1.1) / 1.2);
  };
  P.ext = computeExt(base, 'down'); return P;
}

/* PANEL 2 — the brainrot looms */
var WORDS = ['RIZZ', 'SIGMA', 'SKIBIDI', 'LOCK IN', 'SUS', 'MEWING', 'DELULU', 'GYATT'];
function buildPanel2(w, h, small) {
  var seed = 29, paper = makePaper(w, h, seed, true), A = artBox(w, h, small), aw = A.w, ah = A.h, ar = aw / ah;
  var S = Math.round(Math.min(ah * .8, aw * (ar < 1.1 ? .6 : .42))), fsz = Math.round(Math.min(ah * .3, aw * .26));
  var floorY = Math.round(ah * .78);
  var tx = [Math.round(aw * .5 - aw * .17), Math.round(aw * .5 + aw * .17)], ty = Math.round(ah * .62), flames = fireFrames(Math.round(S * .26), Math.round(S * .35));
  var jul = [inkSprite(IMG.jul, S, S, { smooth: true }), inkSprite(IMG.jul, S + 4, S + 4, { smooth: true })];
  var emm = [inkSprite(IMG.emm, S, S, { smooth: true }), inkSprite(IMG.emm, S + 4, S + 4, { smooth: true })];
  var fin = inkSprite(IMG.fin, fsz, fsz, { smooth: true });
  var capCv = textFit(['THEN THE BRAINROT CAME.', 'THE BRAINROT CAME.', 'BRAINROT CAME.'], 8, '#2b1a0e', null, 700, w - 16);
  var words = WORDS.map(function (s) { return textCv(s, 8, '#d03a22', INK, 700); });
  var art = fieldCanvas(aw, ah, function (x, y) {
    var v = y < floorY ? brickField(seed, .1, 16, 8)(x, y) * .85 : .14 + (fbm(x * .06, y * .2, seed) - .5) * .1 + (((y - floorY) % 6) === 0 ? .04 : 0);
    v *= vig(x, y, aw, ah, 1.9);
    for (var t = 0; t < 2; t++) { var d = Math.hypot((x - tx[t]) / (aw * .24), (y - ty) / (ah * .5)); if (d < 1) v += .32 * (1 - d); }
    return v;
  }, RAMP_DARK);
  var c = art.getContext('2d');
  for (var t = 0; t < 2; t++) { c.fillStyle = INK; c.fillRect(tx[t] - 2, ty + 2, 5, Math.round(ah * .22)); c.fillRect(tx[t] - 5, ty + 2, 11, 3); c.fillStyle = '#4a3220'; c.fillRect(tx[t] - 1, ty + 3, 2, Math.round(ah * .22) - 1); }
  line(c, 0, floorY, aw, floorY, INK, 1);
  var base = mk(w, h), bc = base.getContext('2d'); bc.drawImage(paper, 0, 0); bc.drawImage(art, A.x, A.y);
  var P = { w: w, h: h, base: base, dir: 'right' };
  var eyeX = [.34, .57], eyeY = .405;
  function head(c, spr, big, x0, y0, lt, delay, side, sw) {
    var rise = 1 - eoback((lt - delay) / .9), yy = y0 + rise * S * .95 + Math.sin(lt * 2.3 + side) * 2, xx = x0 + Math.sin(lt * 1.7 + side * 2) * 2;
    var sp = spr[Math.floor(lt * 2.2 + side) % 2], off = (sp.width - S) >> 1; xx = Math.round(xx - off); yy = Math.round(yy - off);
    c.drawImage(sp, xx, yy);
    var on = sm(0, .5, lt - delay - .5); if (on > 0) { var pu = .65 + .35 * Math.sin(lt * 9 + side * 3), sz = sp.width;
      for (var e = 0; e < 2; e++) { var ex = Math.round(xx + sz * (eyeX[e] + (sw || 0))), ey = Math.round(yy + sz * eyeY); glow(c, ex, ey, Math.max(4, Math.round(S * .09)), .9 * pu * on, [230, 40, 20]); c.fillStyle = '#ff3b22'; c.fillRect(ex - 1, ey - 1, 3, 2); c.fillStyle = '#ffd27a'; c.fillRect(ex, ey - 1, 1, 1); } }
  }
  P.draw = function (c, lt) {
    c.drawImage(base, 0, 0);
    c.save(); c.translate(A.x, A.y); c.beginPath(); c.rect(0, 0, aw, ah); c.clip();
    var fi = Math.floor(lt * 9) % 4;
    for (var t = 0; t < 2; t++) { var gl = flicker(lt, 7 + t * 3); glow(c, tx[t], ty - 4, Math.round(aw * .26), .8 * gl, [210, 70, 14]); var fl = flames[(fi + t * 2) % 4]; c.drawImage(fl, tx[t] - (fl.width >> 1), ty - fl.height + 4 + (fi & 1)); }
    /* floating brain-rot scribbles */
    for (var i = 0; i < WORDS.length; i++) {
      var cvw = words[i], span = ah + 24, ph = (lt * 15 + i * span / WORDS.length * 1.0) % span, yy = Math.round(ah - ph + 6), xx = Math.round(aw * (.12 + .76 * hash(i, 8, 5)) - cvw.width / 2 + Math.sin(lt * 1.5 + i * 2) * 4);
      c.drawImage(cvw, xx, yy);
    }
    /* finley, trembling */
    var shk = (Math.floor(lt * 14) % 2) * 2 - 1; c.drawImage(fin, Math.round(aw / 2 - fin.width / 2 + shk * (lt > .6 ? 1 : 0)), ah - fin.height - 1);
    /* the looming faces */
    head(c, jul, S, Math.round(-S * .14), Math.round(ah - S * 1.02), lt, .1, 0, 0);
    head(c, emm, S, Math.round(aw - S * .86), Math.round(ah - S * 1.02), lt, .45, 1, 0);
    c.restore();
    boil(c, A, Math.floor(lt * 6) + 50, INK);
    typed(c, capCv, ((w - capCv.width) >> 1), A.y + ah + (((h - A.y - ah - capCv.height) >> 1) - 1), (lt - 1.2) / 1.3);
  };
  P.ext = computeExt(base, 'right'); return P;
}

/* PANEL 3 — the dramatic last page (full screen) */
function buildPanel3(w, h, small) {
  var seed = 47, paper = makePaper(w, h, seed, false), m = small ? 6 : 8, A = { x: m, y: m, w: w - 2 * m, h: h - 2 * m }, aw = A.w, ah = A.h, port = h > w * 1.15;
  var G = Math.round(port ? Math.min(ah * .3, aw * .66) : Math.min(ah * .8, aw * .36)), fsz = Math.round(port ? Math.min(aw * .55, ah * .24) : Math.min(ah * .38, aw * .2));
  var JS = Math.round(G * .42), floorY = Math.round(ah * (port ? .8 : .76)), fx = Math.round(aw / 2), ffy = floorY + Math.round((ah - floorY) * .62);
  var tr = port ? [Math.round(aw * .2), Math.round(aw * .8)] : [Math.round(aw * .3), Math.round(aw * .7)], ty = port ? Math.round(ah * .6) : Math.round(ah * .62);
  var flames = fireFrames(Math.round(G * .3), Math.round(G * .4));
  var jul = [inkSprite(IMG.jul, G, G, { smooth: true }), inkSprite(IMG.jul, G + 6, G + 6, { smooth: true })];
  var emm = [inkSprite(IMG.emm, G, G, { smooth: true }), inkSprite(IMG.emm, G + 6, G + 6, { smooth: true })];
  var jg = inkSprite(IMG.jg, JS, JS, { smooth: true });
  var fin = inkSprite(IMG.fin, fsz, fsz, { smooth: true });
  var capCv = textFit(small ? ['...AND SO HE WENT DOWN.', 'SO HE WENT DOWN.', 'HE WENT DOWN.'] : ['...AND SO HE WENT DOWN.', '...SO HE WENT DOWN.'], small ? 8 : 16, '#f1dfa6', INK, 700, aw - 10);
  var pitW = Math.round(aw * (port ? .4 : .2));
  var art = fieldCanvas(aw, ah, function (x, y) {
    var v = y < floorY ? brickField(seed, .1, 18, 9)(x, y) * .8 : .12 + (fbm(x * .05, y * .2, seed) - .5) * .1 + (((y - floorY) % 7) === 0 ? .04 : 0);
    v *= vig(x, y, aw, ah, 2.2);
    for (var t = 0; t < 2; t++) { var d = Math.hypot((x - tr[t]) / (aw * .2), (y - ty) / (ah * .38)); if (d < 1) v += .3 * (1 - d); }
    var pd = Math.hypot((x - fx) / pitW, (y - ffy) / (ah * .09)); if (pd < 1) v = Math.max(v, .62 * (1 - pd * .6)); /* the hole in the floor */
    return v;
  }, RAMP_DARK);
  var c = art.getContext('2d');
  for (var t = 0; t < 2; t++) { c.fillStyle = INK; c.fillRect(tr[t] - 2, ty + 3, 5, Math.round(ah * .2)); c.fillRect(tr[t] - 6, ty + 3, 13, 3); }
  line(c, 0, floorY, aw, floorY, INK, 1);
  ellipse(c, fx, ffy + 2, Math.round(pitW * .5), Math.max(2, Math.round(ah * .02)), INK);
  var base = mk(w, h), bc = base.getContext('2d'); bc.drawImage(paper, 0, 0); bc.drawImage(art, A.x, A.y);
  var P = { w: w, h: h, base: base, dir: 'up', port: port };
  /* the tear path */
  var J = 4, nU = port ? w : h, rr = rng(5), crackJ = new Int8Array(nU), cur = 0; for (var i = 0; i < nU; i++) { if (rr() < .4) cur += rr() < .5 ? -1 : 1; if (rr() < .06) cur += rr() < .5 ? -2 : 2; cur = clamp(cur, -J + 1, J - 1); crackJ[i] = cur; }
  P.J = J; P.crackJ = crackJ;
  var eyeX = [.34, .57], eyeY = .405;
  function giant(c, spr, x0, y0, lt, delay, side) {
    var k = eoback((lt - delay) / 1.0), yy = y0 - (1 - k) * G * .9 + Math.sin(lt * 1.9 + side) * 3, xx = x0 + Math.sin(lt * 1.3 + side * 2) * 3;
    var sp = spr[Math.floor(lt * 1.8 + side) % 2], off = (sp.width - G) >> 1; xx = Math.round(xx - off); yy = Math.round(yy - off);
    c.drawImage(sp, xx, yy);
    var on = sm(0, .5, lt - delay - .6); if (on > 0) { var pu = .7 + .3 * Math.sin(lt * 8 + side * 2), sz = sp.width;
      for (var e = 0; e < 2; e++) { var ex = Math.round(xx + sz * eyeX[e]), ey = Math.round(yy + sz * eyeY); glow(c, ex, ey, Math.max(6, Math.round(G * .1)), 1 * pu * on, [240, 40, 20]); c.fillStyle = '#ff3b22'; c.fillRect(ex - 2, ey - 1, 5, 3); c.fillStyle = '#ffd27a'; c.fillRect(ex, ey, 1, 1); } }
  }
  P.draw = function (c, lt, crack) {
    c.drawImage(base, 0, 0);
    c.save(); c.translate(A.x, A.y); c.beginPath(); c.rect(0, 0, aw, ah); c.clip();
    var fi = Math.floor(lt * 9) % 4, pu = .7 + .3 * Math.sin(lt * 5);
    /* red light pouring from the hole */
    glow(c, fx, ffy - 4, Math.round(Math.min(aw * .32, ah * .5)), .85 * pu, [190, 28, 14]); glow(c, fx, ffy, Math.round(pitW * .9), .9, [255, 120, 30]);
    for (var t = 0; t < 2; t++) { var gl = flicker(lt, 9 + t * 5); glow(c, tr[t], ty - 4, Math.round(Math.min(aw * .24, ah * .4)), .85 * gl, [215, 75, 16]); var fl = flames[(fi + t * 2) % 4]; c.drawImage(fl, tr[t] - (fl.width >> 1), ty - fl.height + 4 + (fi & 1)); }
    /* embers rising */
    for (var i = 0; i < 46; i++) { var sp = 10 + hash(i, 1, 6) * 26, yy = ah - ((lt * sp + hash(i, 2, 6) * ah) % ah), xx = (hash(i, 3, 6) * .5 + .25) * aw + Math.sin(lt * 1.5 + i) * 6 + (hash(i, 3, 6) - .5) * aw * .5 * (1 - yy / ah); pxl(c, xx, yy, yy > ah * .5 ? '#ff8c28' : yy > ah * .25 ? '#e5532a' : '#8f1d15'); }
    /* finley on the lip of the hole, pan up */
    var shk = (Math.floor(lt * 16) % 2) * 2 - 1; c.drawImage(fin, Math.round(fx - fin.width / 2 + (lt > .5 ? shk : 0)), ffy - fin.height + 1 + Math.floor(Math.sin(lt * 3)));
    /* giants */
    if (port) { giant(c, jul, Math.round(-G * .2), Math.round(ah * .02), lt, .1, 0); giant(c, emm, Math.round(aw - G * .8), Math.round(ah * .02 + G * .5), lt, .4, 1); }
    else { giant(c, jul, Math.round(-G * .16), Math.round(ah * .02), lt, .1, 0); giant(c, emm, Math.round(aw - G * .84), Math.round(ah * .02), lt, .4, 1); }
    var jb = Math.round(Math.sin(lt * 2.4) * 3) ; c.drawImage(jg, Math.round(aw / 2 - jg.width / 2), Math.round(port ? ah * .26 : ah * .08) + jb);
    glow(c, Math.round(aw / 2), Math.round(port ? ah * .26 : ah * .08) + jb + 2, Math.round(JS * .8), .5, [160, 120, 30]);
    typed(c, capCv, Math.round((aw - capCv.width) / 2), Math.round(port ? ah * .5 : ah * .55), (lt - .9) / 1.2);
    c.restore();
    boil(c, A, Math.floor(lt * 6) + 90, INK);
    if (crack > 0) { /* the page splits */
      var cc = Math.floor(crack * nU), jx = (Math.floor(lt * 30) % 2) ? 1 : 0, cxm = port ? 0 : Math.floor(w / 2), cym = port ? Math.floor(h / 2) : 0;
      for (var u = 0; u < cc; u++) { var ju = crackJ[u], X = port ? u : cxm + ju, Y = port ? cym + ju : u; c.fillStyle = INK; if (port) c.fillRect(X, Y - 1, 1, 3); else c.fillRect(X - 1, Y, 3, 1); c.fillStyle = (hash(u, 3, 1) > .35) ? '#ff6a2a' : '#ffd27a'; if (port) c.fillRect(X, Y, 1, 1 + jx); else c.fillRect(X, Y, 1 + jx, 1); }
    }
  };
  return P;
}

/* ---------- backdrop (dark old table) ---------- */
function buildBackdrop(w, h) {
  return fieldCanvas(w, h, function (x, y) { var g = .4 + .35 * Math.sin((y + fbm(x * .02, y * .08, 3) * 9) * .9) * .5 + (fbm(x * .03, y * .3, 4) - .5) * .5; return g * vig(x, y, w, h, 1.8) * .9 + .05; }, RAMP_WOOD);
}

/* ---------- controller ---------- */
var T = { u1: [.3, 1.3], u2: [3.2, 4.1], u3: [5.8, 6.7], crack: [7.7, 8.3], open: [8.3, 9.6], end: 9.7 };
var played = false, S = null;
function metrics() {
  var vw = window.innerWidth, vh = window.innerHeight, tgt = vw < 600 ? 140 : vw < 1000 ? 240 : 360, sc = Math.max(2, Math.round(vw / tgt));
  return { vw: vw, vh: vh, sc: sc, SW: Math.ceil(vw / sc), SH: Math.ceil(vh / sc) };
}
function build(M) {
  var SW = M.SW, SH = M.SH, port = SH > SW * 1.15, small = SW < 200, PW, PH;
  if (port) { PW = Math.round(SW * .86); PH = Math.round(SH * .48); } else { PW = Math.round(SW * .6); PH = Math.round(SH * .7); }
  var b = { SW: SW, SH: SH, port: port, small: small };
  b.p1 = buildPanel1(PW, PH, small); b.p2 = buildPanel2(PW, PH, small); b.p3 = buildPanel3(SW, SH, small);
  b.c1 = mk(PW, PH); b.c2 = mk(PW, PH); b.c3 = mk(SW, SH); b.back = buildBackdrop(SW, SH);
  var ox = port ? Math.round(SW * .02) : Math.round(SW * .06), oy = port ? Math.round(SH * .07) : 5;
  b.pos1 = { x: Math.round((SW - PW) / 2) - ox, y: Math.round((SH - PH) / 2) - oy }; b.pos2 = { x: Math.round((SW - PW) / 2) + ox, y: Math.round((SH - PH) / 2) + oy };
  b.Rm = Math.round(clamp(Math.min(PW, PH) * .09, 8, 14)); b.Rm3 = Math.round(clamp(Math.min(SW, SH * (port ? .5 : 1)) * .075, 9, 17));
  return b;
}
function render(ctx, b, t) {
  var SW = b.SW, SH = b.SH; ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, SW, SH);
  var opening = t >= T.open[0];
  var e3 = (t - T.u3[0]) / (T.u3[1] - T.u3[0]), done3 = e3 >= 1;
  if (!opening && !done3) {
    ctx.drawImage(b.back, 0, 0);
    if (t >= T.u1[0]) { b.p1.draw(b.c1.getContext('2d'), t - T.u1[0]); var q1 = (t - T.u1[0]) / (T.u1[1] - T.u1[0]); unfurl(ctx, b.c1, { dir: 'down', sx: 0, sy: 0, sw: b.c1.width, sh: b.c1.height, dx: b.pos1.x, dy: b.pos1.y, e: eio(q1), tp: q1, Rmax: b.Rm, t: t, ext: b.p1.ext, bw: 3 }); }
    if (t >= T.u2[0]) { b.p2.draw(b.c2.getContext('2d'), t - T.u2[0]); var q2 = (t - T.u2[0]) / (T.u2[1] - T.u2[0]); unfurl(ctx, b.c2, { dir: 'right', sx: 0, sy: 0, sw: b.c2.width, sh: b.c2.height, dx: b.pos2.x, dy: b.pos2.y, e: eio(q2), tp: q2, Rmax: b.Rm, t: t, ext: b.p2.ext, bw: 3 }); }
    if (t >= T.u3[0]) { b.p3.draw(b.c3.getContext('2d'), t - T.u3[0], 0); unfurl(ctx, b.c3, { dir: 'up', sx: 0, sy: 0, sw: SW, sh: SH, dx: 0, dy: 0, e: eio(e3), tp: e3, Rmax: b.Rm3, t: t, bw: 4 }); }
    return;
  }
  var crack = clamp((t - T.crack[0]) / (T.crack[1] - T.crack[0]), 0, 1);
  b.p3.draw(b.c3.getContext('2d'), t - T.u3[0], crack);
  if (!opening) { var sh = t >= T.crack[0] && (Math.floor(t * 30) % 2) ? 1 : 0; ctx.drawImage(b.c3, sh && !b.port ? 1 : 0, sh && b.port ? 1 : 0); return; }
  var q = (t - T.open[0]) / (T.open[1] - T.open[0]), e = 1 - eio(q), J = b.p3.J, cj = b.p3.crackJ, port = b.port, nU = cj.length, bwh = 2, nb = Math.ceil(nU / bwh), jA = new Int16Array(nb), jB = new Int16Array(nb), i;
  for (i = 0; i < nb; i++) { var j = cj[Math.min(nU - 1, i * bwh + 1)]; jA[i] = j - J; jB[i] = -J - j; }
  var o = { e: e, tp: q, exit: true, Rmax: b.Rm3, t: t, bw: bwh, wob: 1.3 };
  if (!port) { var cx = Math.floor(SW / 2);
    unfurl(ctx, b.c3, Object.assign({ dir: 'right', sx: 0, sy: 0, sw: cx + J, sh: SH, dx: 0, dy: 0, jag: jA }, o));
    unfurl(ctx, b.c3, Object.assign({ dir: 'left', sx: cx - J, sy: 0, sw: SW - cx + J, sh: SH, dx: cx - J, dy: 0, jag: jB }, o));
  } else { var cy = Math.floor(SH / 2);
    unfurl(ctx, b.c3, Object.assign({ dir: 'down', sx: 0, sy: 0, sw: SW, sh: cy + J, dx: 0, dy: 0, jag: jA }, o));
    unfurl(ctx, b.c3, Object.assign({ dir: 'up', sx: 0, sy: cy - J, sw: SW, sh: SH - cy + J, dx: 0, dy: cy - J, jag: jB }, o));
  }
}

var PRE = null;
function prebuild() {
  if (PRE || played || REDUCED) return;
  assets().then(function () { setTimeout(function () { if (PRE || S || played) return; try { var M = metrics(); PRE = { key: M.vw + 'x' + M.vh, M: M, b: build(M) }; } catch (e) { PRE = null; } }, 400); }).catch(function () {});
}
function start(opts) {
  opts = opts || {};
  if (S) return S;
  if (!opts.force && (played || REDUCED)) return null;
  played = true;
  var st = { dead: false };
  S = st;
  assets().then(function () {
    if (st.dead) return;
    var M = metrics(), b;
    if (PRE && PRE.key === M.vw + 'x' + M.vh) { M = PRE.M; b = PRE.b; } PRE = null;
    try { if (!b) b = build(M); } catch (err) { console.warn('[ashaad-intro] build failed', err); return finish(st, true); }
    var ov = document.createElement('div'); ov.id = 'ashaad-intro'; ov.setAttribute('aria-hidden', 'true');
    var cv = document.createElement('canvas'); cv.width = M.SW; cv.height = M.SH; cv.style.width = M.SW * M.sc + 'px'; cv.style.height = M.SH * M.sc + 'px';
    var hint = document.createElement('div'); hint.className = 'ai-skip'; hint.textContent = (matchMedia('(pointer:coarse)').matches ? 'tap' : 'click') + ' to skip';
    ov.appendChild(cv); ov.appendChild(hint); document.body.appendChild(ov);
    var ctx = cv.getContext('2d'); ctx.imageSmoothingEnabled = false;
    st.ov = ov; st.ctx = ctx; st.b = b; st.M = M; st.t = 0;
    var skip = function () { finish(st, false); };
    ov.addEventListener('click', skip); ov.addEventListener('touchend', function (e) { e.preventDefault(); skip(); }, { passive: false });
    st.onkey = function (e) { if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowDown' || e.key === 'PageDown') { skip(); } };
    addEventListener('keydown', st.onkey);
    st.onresize = function () { if (Math.abs(innerWidth - M.vw) > 40 || Math.abs(innerHeight - M.vh) > 160) skip(); }; addEventListener('resize', st.onresize);
    st.fail = setTimeout(function () { finish(st, false); }, 16000);
    render(ctx, b, 0); requestAnimationFrame(function () { ov.classList.add('on'); });
    if (opts.paused) return;
    var last = 0, slow = 0, chk = 0;
    st.raf = requestAnimationFrame(function fr(now) {
      if (st.dead) return;
      if (!last) last = now;
      var raw = now - last; last = now; if (raw < 1000) { if (raw > 66) slow++; else slow = Math.max(0, slow - 1); }
      if (slow >= 14) return finish(st, false);
      st.t += Math.min(raw, 50) / 1000;
      chk += raw; if (chk > 250) { chk = 0; var r = SEC.getBoundingClientRect(), vis = Math.min(r.bottom, innerHeight) - Math.max(r.top, 0); if (vis < innerHeight * .1) return finish(st, false); }
      if (st.t > T.open[0] - .05) ov.classList.add('late');
      try { render(ctx, b, Math.min(st.t, T.end)); } catch (err) { console.warn('[ashaad-intro] render failed', err); return finish(st, false); }
      if (st.t >= T.end) return finish(st, false, true);
      st.raf = requestAnimationFrame(fr);
    });
  }).catch(function (err) { console.warn('[ashaad-intro] assets failed', err); finish(st, true); });
  return st;
}
function finish(st, quiet, instant) {
  if (!st || st.dead) return; st.dead = true; if (S === st) S = null;
  cancelAnimationFrame(st.raf); clearTimeout(st.fail); removeEventListener('keydown', st.onkey); removeEventListener('resize', st.onresize);
  var ov = st.ov; if (!ov) return;
  if (instant) { ov.remove(); return; }
  ov.classList.add('out'); setTimeout(function () { ov.remove(); }, 300);
}

/* ---------- trigger: when the section scrolls into view ---------- */
function inView() { var r = SEC.getBoundingClientRect(), vh = innerHeight; return r.top < vh * .55 && r.bottom > vh * .35; }
function arm() {
  if (REDUCED || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function () { if (!played && inView()) { io.disconnect(); start(); } }, { threshold: [0, .05, .1, .2, .3, .4, .5, .6, .8, 1] });
  io.observe(SEC); addEventListener('scroll', function onS() { if (played) return removeEventListener('scroll', onS); if (inView()) { io.disconnect(); removeEventListener('scroll', onS); start(); } }, { passive: true });
  if (document.readyState === 'complete') prebuild(); else addEventListener('load', prebuild);
}
/* dev hook for previews: __ashaadIntro.seek(seconds) paints that moment of the timeline */
window.__ashaadIntro = {
  duration: T.end,
  play: function () { played = false; return start({ force: true }); },
  seek: function (t) { var go = function () { var st = S && S.ctx ? S : null; if (st) { st.t = t; render(st.ctx, st.b, t); st.ov.classList.add('on'); } }; if (S && S.ctx) go(); else { var s = start({ force: true, paused: true }); assets().then(function () { setTimeout(go, 0); }); } },
  end: function () { if (S) finish(S, false, true); }
};
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arm); else arm();
})();

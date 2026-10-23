/* LLC intro + permanent hero line extensions.
 * The ORIGINAL hero art (letters, frame, corner scrolls, ornaments) is never redrawn: the overlay cuts a feathered window over it
 * and the original hero animation plays through that window.
 * What this adds: the original thin filigree lines (wing line out of each wing tip, the scrollwork line above/below the frame,
 * the wing curls that were clipped at the logo canvas edge) are continued outward - same curves, curls, diamonds, dots, colours -
 * until they reach the screen edges, a little brighter and with a few more repeated curls/beads. Nothing else is added.
 * - art pixels share the hero logo's own pixel scale (mono canvas px) and its grid, so the new lines join the old ones.
 * - delta-time animation, image-rendering:pixelated, Bayer-dither dissolve, prefers-reduced-motion => no intro (static lines).
 * - the same line art is drawn into the overlay (lines draw themselves outward) and into a DOM canvas (.hbord) under the logo
 *   canvas that stays as the permanent hero lines (it also replaces the original #hlines canvas, which it reproduces).
 * Optional art: intro-art/sparkle-sheet.png (six 15x15 frames) for glints.
 */
(function () {
'use strict';
const SPARKLE = 'intro-art/sparkle-sheet.png';
const htmlEl = document.documentElement;
const light = matchMedia('(prefers-color-scheme: light)').matches;
const BAY = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const bay = (x, y) => (BAY[(y & 3) * 4 + (x & 3)] + .5) / 16;
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const rgb = c => 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function loadImg(src, ms = 1500) { return new Promise(res => { const i = new Image(); let d = false; const f = v => { if (!d) { d = true; res(v); } };
  i.onload = () => f(i.naturalWidth ? i : null); i.onerror = () => f(null); setTimeout(() => f(null), ms); i.src = src; }); }

/* palette indices: 1-5 purple ramp (deep..lavender), 6/11 dark/mid fill, 7-9 antique gold, 10 near-white */
const PAL = light
  ? [null,[205,185,235],[170,140,215],[130,92,200],[100,56,175],[70,30,140],[225,210,242],[140,96,28],[186,138,40],[214,170,60],[40,15,90],[190,165,228]]
  : [null,[46,22,82],[74,36,132],[112,56,180],[150,90,230],[196,150,255],[36,16,66],[176,128,58],[226,184,96],[255,236,176],[236,226,250],[96,48,160]];
const BG = light ? [255,246,238] : [13,10,26];
const GLOWS = light ? [[255,246,238],[251,240,240],[247,233,242],[242,226,246],[237,218,248]] : [[13,10,26],[21,13,40],[31,16,58],[44,21,82],[60,28,108]];
const P32 = PAL.map(c => c ? ((255 << 24) | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0 : 0);
const PCSS = PAL.map(c => c ? rgb(c) : '');


/* ---------- pixel grid in LOGO-CANVAS coordinates (x,y = mono canvas px); optional mirroring about the canvas centre ---------- */
class Grid {
  constructor(w, h, ox, oy, mx, my, kf) { this.w = w; this.h = h; this.ox = ox; this.oy = oy; this.G = new Uint8Array(w * h); this.K = new Float32Array(w * h); this.mx = mx; this.my = my; this.kf = kf; this.myOn = true; }
  put(x, y, c, k) { x = Math.round(x); y = Math.round(y); this.p(x, y, c, k); this.p(this.mx - x, y, c, k);
    if (this.myOn) { this.p(x, this.my - y, c, k); this.p(this.mx - x, this.my - y, c, k); } }
  p(x, y, c, k) { const gx = x - this.ox, gy = y - this.oy; if (gx < 0 || gy < 0 || gx >= this.w || gy >= this.h) return; const i = gy * this.w + gx; this.G[i] = c; this.K[i] = k === undefined ? this.kf(x) : k; }
  order() { const NB = 1000, cnt = new Int32Array(NB + 1), G = this.G, K = this.K, n = G.length; let m = 0;
    for (let i = 0; i < n; i++) if (G[i]) { cnt[Math.min(NB - 1, Math.max(0, Math.floor(K[i] * 100))) + 1]++; m++; }
    for (let b = 1; b <= NB; b++) cnt[b] += cnt[b - 1]; const o = new Int32Array(m);
    for (let i = 0; i < n; i++) if (G[i]) o[cnt[Math.min(NB - 1, Math.max(0, Math.floor(K[i] * 100)))]++] = i; return o; }
}

/* ---------- line generator: continues the original filigree lines out to the screen edges ---------- */
const K0 = 1.2, KSPAN = 2.0;                         // intro: outside the logo canvas the lines grow from its edge to the screen edge between K0 and K0+KSPAN s; the inner joins finish just before the dissolve
function genLines(B) {
  const { Wc, Hc, PX, PY, wide, X0 } = B;
  const x0 = PX - 22, y0 = PY - 18, x1 = PX + 310, y1 = PY + 140, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, hw = (x1 - x0) / 2;
  const xs = x0 - 2, XE = X0 - 3;                    // growth starts at the frame side, ends past the left screen edge
  const kx = x => { x = Math.min(x, Wc - 1 - x); return x < 0 ? K0 + clamp(-x / Math.max(30, -X0)) * KSPAN : 3.0 + clamp((xs - x) / xs) * 1.1; };
  const g = new Grid(B.gw, B.gh, B.X0, B.Y0, Wc - 1, Hc - 1, x => kx(x));
  const RAMP = 30;                                    // eases in from the original line's own brightness so the join is invisible
  const fade = (x, j) => (j - x < RAMP || (xs - x) / Math.max(40, xs - X0) > .86) ? 2 : 3;
  // spiral exactly like the logo's own scrollwork spirals (r shrinks to 15 %); only() lets us draw just the part the logo canvas clipped
  const spiral = (sx, sy, r0, turns, a0, dir, c, only, kk) => { const n = Math.ceil(r0 * turns * 8);
    for (let i = 0; i <= n; i++) { const t = i / n, a = a0 + dir * t * turns * Math.PI * 2, r = r0 * (1 - .85 * t), x = sx + Math.cos(a) * r, y = sy + Math.sin(a) * r;
      if (only && Math.round(x) >= 0) continue; g.put(x, y, c, kk === undefined ? undefined : kk + t * .2); } };
  const diamond = (x, y, r, c, mid, only) => { for (let i = -r; i <= r; i++) { const w = r - Math.abs(i); for (const xx of [x - w, x + w]) if (!only || Math.round(xx) < 0) g.put(xx, y + i, c); } if (!only || Math.round(x) < 0) g.put(x, y, mid); };
  const poly = (pts, j, c0) => { for (let i = 1; i < pts.length; i++) { const [ax, ay] = pts[i - 1], [bx, by] = pts[i], l = Math.hypot(bx - ax, by - ay);
    for (let s = 0; s <= l; s += .7) { const u = s / l, x = ax + (bx - ax) * u, y = ay + (by - ay) * u; const c = c0 || fade(x, j); g.put(x, y, c); if (c === 3 && Math.round(x) % 2 === 0) g.put(x, y + 1, 2); } } };
  const polyY = (pts, x) => { for (let i = 1; i < pts.length; i++) if (x <= pts[i - 1][0] && x >= pts[i][0]) { const u = (pts[i - 1][0] - x) / (pts[i - 1][0] - pts[i][0]); return pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * u; } return pts[pts.length - 1][1]; };

  /* (1) the line out of each wing tip (original #hlines): reinforced core, dotted flanks, alternating curls, diamond beads, dots */
  g.myOn = false;
  { const Lx = x0 - (wide ? 64 : 6), len = Math.max(0, Lx - XE);
    for (let d = 0; d < len; d++) { const x = Lx - d, w = Math.sin(d / 18) * 2.5, yy = cy + w, u = d / len;
      const fc = fade(x, Lx); g.put(x, yy, d % 5 === 0 && fc === 3 ? 4 : fc); if (d % 2 === 0 && fc === 3) g.put(x, yy + 1, 2);
      if (d % 3 === 0) g.put(x, cy - 7 + Math.sin(d / 11) * 1.5, u > .86 ? 1 : 2);
      if (d % 3 === 1) g.put(x, cy + 7 - Math.sin(d / 11) * 1.5, u > .86 ? 1 : 2);
      if (d % 46 === 23) { const up = (d / 46 | 0) % 2 ? 1 : -1; for (let i = 0; i <= 40; i++) { const t = i / 40, an = t * Math.PI * 1.7, r = 6 * (1 - .75 * t); g.put(x - Math.sin(an) * r, yy + up * (6 - Math.cos(an) * r), fc); } }
      if (d % 46 === 11 && d > 20) { const up = (d / 46 | 0) % 2 ? -1 : 1; for (let i = 0; i <= 28; i++) { const t = i / 28, an = t * Math.PI * 1.7, r = 3.5 * (1 - .7 * t); g.put(x - Math.sin(an) * r, yy + up * (3.5 - Math.cos(an) * r), 2); } }
      if (d % 46 === 0 && d > 0) { for (const [dx, dy] of [[0,-2],[-1,-1],[0,-1],[1,-1],[-2,0],[-1,0],[0,0],[1,0],[2,0],[-1,1],[0,1],[1,1],[0,2]]) g.put(x + dx, yy + dy, 3); g.put(x, yy, (d / 46 | 0) % 3 === 1 ? 9 : 5); }
      if (d % 46 === 34) { g.put(x, cy - 12, 5); g.put(x, cy + 12, 5); }
      if (d % 46 === 40 && d > 60) { g.put(x, cy - 9, 3); g.put(x, cy + 9, 3); } } }
  g.myOn = true;

  /* (2) scrollwork line above/below the frame: same wobbling vine and alternating curls, carried on past where the logo canvas stops */
  { const topY = y0 - 12, span = hw - 30, ys = [3, -5, 2, -6], pts = [[cx - span, topY - 6]];
    for (let j = 1; pts[pts.length - 1][0] > XE - 40; j++) pts.push([cx - span - j * 44, topY + ys[(j - 1) % 4]]);
    poly(pts, cx - span);
    for (let i = 6; ; i++) { const x = cx - span * i / 5.4; if (x < XE) break; const up = i % 2;
      spiral(x, topY + (up ? -7 : 6), 5, 1, up ? Math.PI / 2 : -Math.PI / 2, up ? 1 : -1, up ? 3 : 2); }
    for (let i = 5.5, n = 0; ; i += 1.0, n++) { const x = cx - span * i / 5.4; if (x < XE) break; if (n % 2 === 0) { const y = polyY(pts, x); diamond(x, y + (Math.round(i) % 2 ? 5 : -5), 1, 3, n % 4 === 0 ? 9 : 5); } } }

  /* (3) wing: finish what the logo canvas clipped at its left/right edge (outer halves of the wing curl, its diamond and dots),
         then let the wing vine run straight on out to the screen edge, same wobble, with the same alternating curls */
  if (wide) { const sx = x0 - 6;
    spiral(sx - 122, cy - 38, 9, 1.2, Math.PI / 2, 1, 2, true, 1.0);
    diamond(sx - 130, cy - 6, 2, 2, 5, true);
    for (let i = 0; i < 5; i++) { const a = Math.PI + (i - 2) * .35; diamond(sx - 6 + Math.cos(a) * (PX - 28), cy - 30 + Math.sin(a) * 40, 1, 2, 5, true); }
    const wp = [[-3, cy - 29]]; for (let j = 1; wp[wp.length - 1][0] > XE - 40; j++) wp.push([-3 - j * 32, cy - 28 + [-2, 3, -3, 2][(j - 1) % 4]]);
    poly(wp, -3);
    for (let i = 1; ; i++) { const x = -3 - i * 37; if (x < XE) break; const up = i % 2; spiral(x, polyY(wp, x) + (up ? -5 : 5), 4, 1, up ? Math.PI / 2 : -Math.PI / 2, up ? 1 : -1, up ? 3 : 2); if (i % 2 === 0) diamond(x - 18, polyY(wp, x - 18), 2, 3, i % 4 === 0 ? 9 : 5); } }
  return g;
}

/* ---------- geometry: everything is anchored to the logo (mono) canvas pixel grid ---------- */
function geom() {
  const hero = document.querySelector('.hero'), mono = document.getElementById('mono'); if (!hero || !mono || !mono.width) return null;
  const hr = hero.getBoundingClientRect(), mr = mono.getBoundingClientRect(); if (!mr.width || !hr.width) return null;
  const s = clamp(mr.width / mono.width, .5, 8), Wc = mono.width, Hc = mono.height, wide = innerWidth >= 640, PX = (Wc - 288) / 2, PY = (Hc - 122) / 2;
  const dx = mr.left - hr.left, dy = mr.top - hr.top, m = Math.ceil(dx / s - 1e-6), n = Math.ceil(dy / s - 1e-6);
  const cssL = dx - m * s, cssT = dy - n * s, gw = Math.ceil((hr.width - cssL) / s), gh = Math.ceil((hr.height - cssT) / s);
  const vw = htmlEl.clientWidth || innerWidth, vh = innerHeight, heroTop = hr.top + scrollY, monoTop = heroTop + dy;
  const mo = Math.ceil(mr.left / s - 1e-6), no = Math.ceil(monoTop / s - 1e-6), oL = mr.left - mo * s, oT = monoTop - no * s;
  return { s, Wc, Hc, wide, PX, PY, X0: -m, Y0: -n, gw, gh, cssL, cssT, key: [s.toFixed(3), Wc, Hc, wide, gw, gh, m, n].join(),
    ov: { mo, no, oL, oT, lw: Math.ceil((vw - oL) / s), lh: Math.ceil((vh - oT) / s), ox: mo - m, oy: no - n } }; }
let bGrid = null, bKey = '', bOrder = null;
function getBorder(B) { if (bKey !== B.key) { bKey = B.key; bGrid = genLines(B); bOrder = bGrid.order(); } return bGrid; }
function paintGrid(g, canvas) { const im = new ImageData(g.w, g.h), u = new Uint32Array(im.data.buffer); for (let i = 0; i < g.G.length; i++) if (g.G[i]) u[i] = P32[g.G[i]]; canvas.width = g.w; canvas.height = g.h; canvas.getContext('2d').putImageData(im, 0, 0); }

/* DOM lines (permanent): a canvas under the logo canvas; it takes over from the original #hlines canvas and keeps its grow-out reveal */
let bwrap = null, bcv = null;
function setupBorder() { const hero = document.querySelector('.hero'); if (!hero) return; const B = geom(); if (!B) return;
  if (!bwrap) { bwrap = document.createElement('div'); bwrap.className = 'hbord'; bwrap.setAttribute('aria-hidden', 'true'); bcv = document.createElement('canvas'); bwrap.appendChild(bcv); hero.insertBefore(bwrap, hero.firstChild);
    const hl = document.getElementById('hlines'); if (hl) { const sync = () => { if (hl.classList.contains('grow')) bwrap.classList.add('grow'); }; sync(); new MutationObserver(sync).observe(hl, { attributes: true, attributeFilter: ['class'] }); } }
  const g = getBorder(B); paintGrid(g, bcv); bcv.style.width = g.w * B.s + 'px'; bcv.style.height = g.h * B.s + 'px'; bcv.style.left = B.cssL + 'px'; bcv.style.top = B.cssT + 'px';
  htmlEl.classList.add('hb-ok'); }

/* ---------- boot ---------- */
function boot() {
  try { setupBorder(); } catch (e) { console.warn('lines', e); }
  addEventListener('load', () => { try { setupBorder(); } catch (e) {} });
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { try { setupBorder(); } catch (e) {} }, 260); });
  const root = document.getElementById('intro');
  if (!root || !htmlEl.classList.contains('intro-on')) { if (root) root.remove(); return; }
  window.__introStarted = true; startIntro(root);
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();

function startIntro(root) {
  const cv = root.querySelector('canvas'), ctx = cv.getContext('2d'), skipBtn = root.querySelector('.skip');
  let finished = false, released = false, skipT = -1, T = 0;
  const release = () => { if (!released) { released = true; if (window.__introGo) window.__introGo(); } };
  function finish() { if (finished) return; finished = true; release(); if (bwrap) bwrap.classList.add('grow', 'now'); htmlEl.classList.remove('intro-on', 'intro-reveal'); root.remove(); removeEventListener('keydown', onKey, true); document.dispatchEvent(new Event('intro:done')); }
  function skip() { if (skipT < 0) { skipT = T; release(); } }
  function onKey(e) { if (/^(Shift|Control|Alt|Meta|CapsLock|Tab)$/.test(e.key)) return; skip(); }
  addEventListener('keydown', onKey, true); root.addEventListener('pointerdown', skip); if (skipBtn) skipBtn.addEventListener('click', e => { e.stopPropagation(); skip(); });
  const w0 = innerWidth; addEventListener('resize', () => { if (Math.abs(innerWidth - w0) > 40) skip(); });
  try { if (scrollY) scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { scrollTo(0, 0); }
  loadImg(SPARKLE).then(spk => { try { run(spk && !light ? spk : null); } catch (e) { console.warn('intro disabled', e); finish(); } });

  function run(spk) {
    const B = geom(); if (!B) { finish(); return; } const ov = B.ov, lw = ov.lw, lh = ov.lh, css = B.s; if (lw * lh > 1.3e6) { finish(); return; }
    cv.width = lw; cv.height = lh; cv.style.width = lw * css + 'px'; cv.style.height = lh * css + 'px'; cv.style.left = ov.oL + 'px'; cv.style.top = ov.oT + 'px'; ctx.imageSmoothingEnabled = false;
    const wr = { x0: ov.mo, y0: ov.no, x1: ov.mo + B.Wc, y1: ov.no + B.Hc };
    const cxw = (wr.x0 + wr.x1) / 2, cyw = (wr.y0 + wr.y1) / 2;
    const bord = getBorder(B), bOrd = bOrder, rng = mulberry(1234 + lw), ox = ov.ox, oy = ov.oy;
    // background: flat base + dithered radial glow (4 bands), nothing else
    const glow = mk(lw, lh); { const g = glow.getContext('2d'), im = g.createImageData(lw, lh), d = im.data, R = Math.max(lw, lh) * .62;
      for (let y = 0; y < lh; y++) for (let x = 0; x < lw; x++) { const dx = (x - cxw) / R, dy = (y - cyw) / (R * .78), v = 1 - Math.sqrt(dx * dx + dy * dy);
        const q = Math.floor(clamp(v, 0, 1) ** 1.6 * 4.6 + (bay(x, y) - .5) * .95), c = GLOWS[clamp(q, 0, 4)], j = (y * lw + x) * 4; d[j] = c[0]; d[j+1] = c[1]; d[j+2] = c[2]; d[j+3] = 255; }
      g.putImageData(im, 0, 0); }
    // reveal layer (ImageData writes of newly grown cells)
    const bL = (() => { const c = mk(bord.w, bord.h), g = c.getContext('2d'), im = g.createImageData(bord.w, bord.h); return { c, g, im, u: new Uint32Array(im.data.buffer), p: 0 }; })();
    function grow(L, grid, ord, t) { const G = grid.G, K = grid.K; let p = L.p, dirty = false; while (p < ord.length && K[ord[p]] <= t) { const i = ord[p++]; L.u[i] = P32[G[i]]; dirty = true; } L.p = p; if (dirty) L.g.putImageData(L.im, 0, 0); }
    // glints: gold sweeps along the lines, ordered by diagonal projection
    const bProj = []; for (let i = 0; i < bord.G.length; i++) if (bord.G[i]) { const x = i % bord.w, y = (i / bord.w) | 0; bProj.push([x + y * .55, x, y, i]); } bProj.sort((p, q) => p[0] - q[0]);
    function sweep(pos, w) { let lo = 0, hi = bProj.length; while (lo < hi) { const m = (lo + hi) >> 1; if (bProj[m][0] < pos - w) lo = m + 1; else hi = m; }
      for (let j = lo; j < bProj.length && bProj[j][0] <= pos; j++) { const e = bProj[j], f = (pos - e[0]) / w; if (bord.K[e[3]] > T) continue; ctx.fillStyle = PCSS[f < .18 ? 10 : f < .5 ? 9 : f < .8 ? 8 : 7]; ctx.fillRect(e[1] + ox, e[2] + oy, 1, 1); } }
    const sweeps = [{ t: 3.0, d: 1.5 }, { t: 4.1, d: 1.0 }];
    // sparkles on gold / bright cells, floating gold dust
    const gold = []; for (let i = 0; i < bord.G.length; i++) { const c = bord.G[i]; if (c === 9 || (c === 5 && Math.random() < .35)) { const x = i % bord.w + ox, y = ((i / bord.w) | 0) + oy; if (x >= 0 && y >= 0 && x < lw && y < lh) gold.push([x, y, bord.K[i], c === 9]); } }
    const slots = Array.from({ length: 8 }, () => ({ t0: -9, d: 1, x: 0, y: 0 })); let lastSp = 0;
    const dust = Array.from({ length: Math.round(lw * lh / 2600) }, () => ({ x: rng() * lw, y: rng() * lh, v: 3 + rng() * 7, ph: rng() * 6.28, g: rng() < .22 }));
    const rings = [{ t: .15, sp: Math.max(lw, lh) * .7, d: 1.3, g: 0 }, { t: 3.5, sp: Math.max(lw, lh) * .8, d: 1.0, g: 1 }];
    const sparkle = (x, y, ph, goldc) => { if (spk && !goldc) { const f = Math.min(5, Math.floor(ph * 6)); ctx.drawImage(spk, f * 15, 0, 15, 15, x - 7, y - 7, 15, 15); return; }
      const a = ph < .5 ? ph * 2 : (1 - ph) * 2, L = a > .75 ? 3 : a > .4 ? 2 : 1; ctx.fillStyle = PCSS[goldc ? 8 : 5]; for (let i = 1; i <= L; i++) { ctx.fillRect(x - i, y, 1, 1); ctx.fillRect(x + i, y, 1, 1); ctx.fillRect(x, y - i, 1, 1); ctx.fillRect(x, y + i, 1, 1); } ctx.fillStyle = PCSS[goldc ? 9 : 10]; ctx.fillRect(x, y, 1, 1); };
    const pats = []; const pat = n => pats[n] || (pats[n] = (() => { const c = mk(8, 8), g = c.getContext('2d'); g.fillStyle = '#000'; for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) if (BAY[((y >> 1) & 3) * 4 + ((x >> 1) & 3)] < n) g.fillRect(x, y, 1, 1); return ctx.createPattern(c, 'repeat'); })());
    const erase = p => { const n = Math.round(clamp(p) * 16); if (!n) return; ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = pat(n); ctx.fillRect(0, 0, lw, lh); ctx.globalCompositeOperation = 'source-over'; };
    const hole = () => { ctx.globalCompositeOperation = 'destination-out'; for (const [d, n] of [[8, 3], [6, 6], [4, 9], [2, 12]]) { ctx.fillStyle = pat(n); ctx.fillRect(wr.x0 - d, wr.y0 - d, wr.x1 - wr.x0 + 2 * d, wr.y1 - wr.y0 + 2 * d); } ctx.fillStyle = '#000'; ctx.fillRect(wr.x0, wr.y0, wr.x1 - wr.x0, wr.y1 - wr.y0); ctx.globalCompositeOperation = 'source-over'; };
    const TOTAL = 5.7, DISS = 4.6, GATE = .7;
    let reveal = false;
    const doReveal = () => { reveal = true; if (bwrap) bwrap.classList.add('grow', 'now'); htmlEl.classList.add('intro-reveal'); };

    function step(dt) { T += dt; const t = T;
      for (const d of dust) { d.y -= d.v * dt; d.x += Math.sin(t * .8 + d.ph) * 3 * dt; if (d.y < 0) { d.y = lh; d.x = Math.random() * lw; } }
      if (t > 1.2 && t - lastSp > .16) { lastSp = t; const s = slots.find(q => t - q.t0 > q.d); if (s && gold.length) for (let tries = 0; tries < 12; tries++) { const e = gold[(Math.random() * gold.length) | 0]; if (e[2] <= t) { s.t0 = t; s.d = .55 + Math.random() * .5; s.x = e[0]; s.y = e[1]; s.g = e[3] || Math.random() < .5; break; } } }
      if (!released && t >= GATE) release();
      if (!reveal && t >= DISS) doReveal(); }

    function render() { const t = T;
      ctx.fillStyle = rgb(BG); ctx.fillRect(0, 0, lw, lh);
      ctx.globalAlpha = Math.floor(clamp((t - .05) / 2.2) * 8) / 8; ctx.drawImage(glow, 0, 0); ctx.globalAlpha = 1;
      for (const d of dust) { const v = Math.floor((Math.sin(t * 2 + d.ph) + 1) * 1.5); if (bay(d.x | 0, d.y | 0) > clamp((t - .3) / 1.2)) continue; ctx.fillStyle = PCSS[d.g ? (v > 1 ? 9 : 8) : (v > 1 ? 5 : v > 0 ? 4 : 2)]; ctx.fillRect(d.x | 0, d.y | 0, 1, 1); }
      for (const r of rings) { const u = (t - r.t) / r.d; if (u < 0 || u > 1) continue; const rad = (t - r.t) * r.sp, al = 1 - u, N = Math.ceil(rad * 6.283 * 1.1);
        for (let pass = 0; pass < 2; pass++) { ctx.fillStyle = PCSS[r.g ? (pass ? 8 : 9) : (pass ? 4 : 5)]; const R2 = rad - pass * 3; if (R2 < 1) continue; for (let i = 0; i < N; i++) { const a = i / N * 6.283, x = Math.round(cxw + Math.cos(a) * R2), y = Math.round(cyw + Math.sin(a) * R2 * .82); if (x < 0 || y < 0 || x >= lw || y >= lh) continue; if (bay(x, y) < al * (pass ? .5 : .8)) ctx.fillRect(x, y, 1, 1); } } }
      hole();
      grow(bL, bord, bOrd, t); ctx.drawImage(bL.c, ox, oy);
      for (const s of sweeps) { const u = (t - s.t) / s.d; if (u > 0 && u < 1) { const w = 12, umax = bord.w + bord.h * .55 + 2 * w; sweep(-w + u * umax, w); } }
      for (const s of slots) { const u = (t - s.t0) / s.d; if (u >= 0 && u < 1) sparkle(s.x | 0, s.y | 0, u, s.g); }
      const dp = skipT >= 0 ? Math.max(clamp((t - DISS) / 1.0), clamp((t - skipT) / .45)) : clamp((t - DISS) / 1.0);
      if (dp > 0) { if (!reveal) doReveal(); erase(dp); } }

    let last = 0, slow = 0, nfr = 0;
    function frame(now) { if (finished) return; if (!last) last = now; const raw = (now - last) / 1000; last = now; const dt = Math.min(.05, raw);
      try { step(dt); render(); } catch (e) { console.warn('intro error', e); finish(); return; }
      if (T > .3) { nfr++; slow += raw; if (nfr === 90 && slow / nfr > .05 && skipT < 0) skip(); }
      if (T >= TOTAL || (skipT >= 0 && T - skipT >= .5)) { finish(); return; }
      requestAnimationFrame(frame); }
    window.LLCIntro = { skip, get t() { return T; }, advance(sec) { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) step(1 / 60); render(); if (T >= TOTAL) finish(); }, total: TOTAL, size: [lw, lh, css] };
    render(); root.style.background = 'none'; if (!window.__introManual) requestAnimationFrame(frame);
  }
}
})();

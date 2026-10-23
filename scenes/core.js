/* Per-section pixel intro scenes: shared helpers + engine.
 * - overlay scenes (Ashaad, Game of Websites, Ball Fight): a pointer-events:none canvas laid over the visible part of the section when
 *   it scrolls into view (IntersectionObserver); plays once, then dissolves (Bayer) into the real section. Click/key skips.
 * - inline scenes (Sea of Thought): the section's own background canvas; the scene "starts" once when scrolled into view, then idles.
 * - low-res logical canvas, integer device pixels per art pixel, image-rendering:pixelated, delta-time, Bayer ordered dither.
 * - prefers-reduced-motion: no overlay scenes, inline scenes just show their settled frame. Everything pauses offscreen.
 * - test hook: window.__scnManual = true (set before load) turns off rAF; LLCScenes.advance(sec) steps all active scenes.
 */
(function () {
'use strict';
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;
const BAY = [0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
const bay = (x, y) => (BAY[(y & 3) * 4 + (x & 3)] + .5) / 16;
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, t) => { t = clamp((t - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const hex = s => [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)];
const css = c => typeof c === 'string' ? c : 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')';
/* ordered-dither colour ramp: f in 0..1 across the colour list, Bayer picks between neighbours */
function ramp(cols, f, x, y) { const v = clamp(f) * (cols.length - 1), i = Math.min(cols.length - 2, v | 0), fr = v - i; return bay(x, y) < fr ? cols[i + 1] : cols[i]; }
/* bake a static image from a per-pixel colour function */
function bake(w, h, fn) { const c = mk(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const q = fn(x, y); if (!q) continue; const j = (y * w + x) * 4; d[j] = q[0]; d[j + 1] = q[1]; d[j + 2] = q[2]; d[j + 3] = q[3] === undefined ? 255 : q[3]; }
  g.putImageData(im, 0, 0); return c; }
const R = (g, c, x, y, w = 1, h = 1) => { g.fillStyle = css(c); g.fillRect(Math.round(x), Math.round(y), w, h); };
function disc(g, c, cx, cy, r) { g.fillStyle = css(c); cx = Math.round(cx); cy = Math.round(cy); for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r + r * .6 - y * y)); g.fillRect(cx - w, cy + y, 2 * w + 1, 1); } }
function ringpx(g, c, cx, cy, r, th = 1, a0 = 0, a1 = 6.2832, ry = 1) { g.fillStyle = css(c); const n = Math.ceil(6.2832 * r * 1.4) + 8; for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * i / n; g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r * ry), th, th); } }
function line(g, c, x0, y0, x1, y1, th = 1) { g.fillStyle = css(c); const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))) + 1; for (let i = 0; i <= n; i++) { const u = i / n; g.fillRect(Math.round(x0 + (x1 - x0) * u), Math.round(y0 + (y1 - y0) * u), th, th); } }
function spr(g, rows, pal, x, y, flip) { x = Math.round(x); y = Math.round(y); for (let j = 0; j < rows.length; j++) { const r = rows[j]; for (let i = 0; i < r.length; i++) { const k = r[flip ? r.length - 1 - i : i], c = pal[k]; if (c) { g.fillStyle = css(c); g.fillRect(x + i, y + j, 1, 1); } } } }
/* Bayer dither fill: level 0..1 */
const pats = {};
function pat(col, n) { const key = col + '|' + n; if (pats[key]) return pats[key]; const c = mk(4, 4), g = c.getContext('2d'); g.fillStyle = col; for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) if (BAY[y * 4 + x] < n) g.fillRect(x, y, 1, 1); return pats[key] = g.createPattern(c, 'repeat'); }
function dfill(g, c, x, y, w, h, level) { const n = Math.round(clamp(level) * 16); if (!n) return; g.fillStyle = n >= 16 ? css(c) : pat(css(c), n); g.fillRect(Math.round(x), Math.round(y), w, h); }
function fit(w, target) { const dpr = Math.max(1, window.devicePixelRatio || 1), sd = Math.max(1, Math.round(w * dpr / target)); return { sd, css: sd / dpr }; }

/* shared ticker */
const tickers = new Set(); let raf = 0, last = 0;
function loop(now) { raf = 0; const dt = Math.min(.05, (now - last) / 1000 || 0); last = now; for (const f of [...tickers]) if (f(dt) === false) tickers.delete(f); if (tickers.size) raf = requestAnimationFrame(loop); }
function tick(f) { tickers.add(f); if (!raf && !window.__scnManual) { last = performance.now(); raf = requestAnimationFrame(loop); } }
function advance(sec) { const n = Math.round(sec * 60); for (let i = 0; i < n; i++) for (const f of [...tickers]) if (f(1 / 60) === false) tickers.delete(f); }

const H = { RM, BAY, bay, clamp, lerp, ss, eio, mk, rng, hex, css, ramp, bake, R, disc, ringpx, line, spr, dfill, fit, tick };
const defs = [], actives = [];
function eraseWith(g, W, Hh, p) { const n = Math.round(clamp(p) * 16); if (!n) return; g.globalCompositeOperation = 'destination-out'; g.fillStyle = n >= 16 ? '#000' : pat('#000', n); g.fillRect(0, 0, W, Hh); g.globalCompositeOperation = 'source-over'; }
function visWatch(el, a) { const o = new IntersectionObserver(es => { a.vis = es[es.length - 1].isIntersecting; }); o.observe(el); return o; }

function runOverlay(def, el) {
  const r = el.getBoundingClientRect(), vh = innerHeight, top = Math.max(0, -r.top), stageH = Math.max(120, Math.min(r.height - top, vh - Math.max(0, r.top)));
  const f = fit(r.width, def.target ? def.target(r.width) : r.width < 600 ? 200 : 300), c = f.css, W = Math.ceil(r.width / c), Hh = Math.ceil(stageH / c);
  const wrap = document.createElement('div'); wrap.className = 'scn-wrap'; wrap.setAttribute('aria-hidden', 'true'); wrap.style.cssText = 'top:' + top + 'px;height:' + stageH + 'px';
  const cv = document.createElement('canvas'); cv.width = W; cv.height = Hh; cv.style.width = W * c + 'px'; cv.style.height = Hh * c + 'px'; wrap.appendChild(cv); el.appendChild(wrap);
  const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
  const sc = def.make({ W, H: Hh, css: c, mobile: r.width < 600, rng: rng(def.seed || 7) });
  const a = { t: 0, vis: true, skipT: -1, wrap, def }; a.io = visWatch(wrap, a); actives.push(a);
  const FADE = .3, DISS = .9, end = () => { a.io.disconnect(); wrap.remove(); const i = actives.indexOf(a); if (i >= 0) actives.splice(i, 1); el.dispatchEvent(new CustomEvent('scene:done')); return false; };
  const draw = () => { g.clearRect(0, 0, W, Hh); sc.draw(g, a.t);
    const endT = a.skipT >= 0 ? Math.min(sc.dur, a.skipT) : sc.dur; let p = 0; if (a.t < FADE) p = 1 - a.t / FADE; if (a.t > endT) p = Math.max(p, (a.t - endT) / (a.skipT >= 0 ? .35 : DISS)); eraseWith(g, W, Hh, p); };
  tick(dt => { if (!a.vis && a.skipT < 0) return true; a.t += dt; sc.step(dt, a.t); draw(); if (a.t >= (a.skipT >= 0 ? Math.min(sc.dur, a.skipT) + .35 : sc.dur + DISS) || a.t > sc.dur + 4) return end(); return true; });
  sc.step(0, 0); draw();
}
function runInline(def, el) {
  const cv = document.createElement('canvas'); cv.className = 'scn-bg'; cv.setAttribute('aria-hidden', 'true'); el.insertBefore(cv, el.firstChild); const g = cv.getContext('2d');
  let sc = null, played = false, vis = false, W = 0, Hh = 0, lastW = 0;
  const build = () => { const r = el.getBoundingClientRect(), f = fit(r.width, def.target ? def.target(r.width) : r.width < 600 ? 200 : 300), c = f.css; W = Math.ceil(r.width / c); Hh = Math.ceil(r.height / c); lastW = r.width;
    cv.width = W; cv.height = Hh; cv.style.width = W * c + 'px'; cv.style.height = Hh * c + 'px'; g.imageSmoothingEnabled = false;
    sc = def.make({ W, H: Hh, css: c, mobile: r.width < 600, rng: rng(def.seed || 7) }); if (played || RM) sc.settle(); sc.step(0, 0); sc.draw(g, 0); };
  build(); let tm; addEventListener('resize', () => { clearTimeout(tm); tm = setTimeout(() => { if (Math.abs(el.getBoundingClientRect().width - lastW) > 1 || Math.abs(el.getBoundingClientRect().height / el.getBoundingClientRect().width * 1000 - Hh * 1000 / W) > 20) build(); }, 200); });
  if (RM) return;
  const io = new IntersectionObserver(es => { for (const e of es) { vis = e.isIntersecting; if (vis && !played && e.intersectionRect.height >= .4 * Math.min(e.boundingClientRect.height, innerHeight)) { played = true; sc.play(); } } }, { threshold: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1] });
  io.observe(el);
  tick(dt => { if (vis) { sc.step(dt, 0); sc.draw(g, 0); } return true; });
}
function register(def) { defs.push(def); }
function boot() {
  for (const def of defs) { const el = document.querySelector(def.sel); if (!el) continue;
    try {
      if (def.run) { def.run(el, H); continue; }
      if (def.inline) { runInline(def, el); continue; }
      if (RM) continue;
      let started = false;
      const io = new IntersectionObserver(es => { for (const e of es) { if (started || !e.isIntersecting) continue; if (root.classList.contains('intro-on')) continue;
        if (e.intersectionRect.height >= .45 * Math.min(e.boundingClientRect.height, innerHeight)) { started = true; io.disconnect(); try { runOverlay(def, el); } catch (err) { console.warn('scene', def.sel, err); } } } }, { threshold: [0, .1, .2, .3, .4, .5, .6, .7, .8, .9, 1] });
      io.observe(el);
    } catch (err) { console.warn('scene boot', def.sel, err); } }
}
const skip = () => { for (const a of actives) if (a.skipT < 0) a.skipT = a.t; };
addEventListener('pointerdown', skip, true); addEventListener('keydown', e => { if (!/^(Shift|Control|Alt|Meta|CapsLock|Tab)$/.test(e.key)) skip(); }, true);
window.LLCScenes = { register, H, advance, boot, get active() { return actives.length; }, _defs: defs };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

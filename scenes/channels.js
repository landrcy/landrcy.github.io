/* LLC Powered Channels: a lighter intro. Each channel card enters with its own theme (arena = glitchy slide with RGB split, donut = bouncy drop,
 * trivia = flickering pop-in, camp = rises with firelight flicker, chalk = pixel wipe), plus a ~1.3 s dithered-curtain overlay with themed
 * particles (balls colliding / sprinkles / stars / embers / chalk scribbles). Plays once per card as it scrolls into view. */
(function () {
const { clamp, lerp, ss, mk, R, ramp, bay, disc, line, dfill, fit, tick, css } = LLCScenes.H;
const WHITE = [255, 255, 255];
const T = {
  arena: { cur: [22, 8, 34], fx(g, t, W, H, r, S) { const cx = W / 2, cy = H / 2 - 4, u = clamp(t / .55), x = lerp(8, cx - 5, u * u * (3 - 2 * u));
      if (t < .62) { disc(g, WHITE, x, cy, 5); disc(g, [255, 59, 92], x, cy, 4); disc(g, WHITE, W - x, cy, 5); disc(g, [77, 195, 255], W - x, cy, 4); }
      if (t > .55) { const k = t - .55; if (k < .15) dfill(g, WHITE, 0, 0, W, H, (1 - k / .15) * .8); for (const s of S) { const px = cx + s.vx * k, py = cy + s.vy * k + 60 * k * k; if (k < s.l) R(g, s.c, px, py, 2, 2); } } },
    init(r) { return Array.from({ length: 22 }, () => { const a = r() * 6.28, v = 30 + r() * 80; return { vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: .3 + r() * .35, c: [WHITE, [255, 230, 120], [255, 59, 92], [77, 195, 255]][r() * 4 | 0] }; }); } },
  donut: { cur: [96, 62, 34], fx(g, t, W, H, r, S) { for (const s of S) { const y = -6 + (t * s.v * 0.9 + t * t * 120) - s.o; if (y > -6 && y < H) { g.fillStyle = css(s.c); if (s.h) g.fillRect(Math.round(s.x), Math.round(y), 3, 1); else g.fillRect(Math.round(s.x), Math.round(y), 1, 3); } } },
    init(r) { const P = [[255, 143, 200], [255, 220, 90], [120, 220, 255], [255, 255, 255], [160, 255, 140]]; return Array.from({ length: 46 }, () => ({ x: r() * 150, v: 50 + r() * 60, o: r() * 40, c: P[r() * 5 | 0], h: r() < .5 })); } },
  trivia: { cur: [11, 10, 42], fx(g, t, W, H, r, S) { for (const s of S) { const v = Math.sin(t * 14 + s.p); if (v > -.3) { R(g, v > .5 ? WHITE : [154, 170, 221], s.x, s.y); if (s.b && v > .5) { R(g, [185, 168, 255], s.x - 1, s.y); R(g, [185, 168, 255], s.x + 1, s.y); R(g, [185, 168, 255], s.x, s.y - 1); R(g, [185, 168, 255], s.x, s.y + 1); } } }
      const u = clamp((t - .15) / .55); if (u > 0 && u < 1) { const x = lerp(W, -10, u), y = lerp(4, H * .6, u); for (let i = 0; i < 9; i++) R(g, i < 1 ? WHITE : [185, 168, 255], x + i * 1.6, y - i * .8, 1, 1); } },
    init(r) { return Array.from({ length: 24 }, () => ({ x: r() * 150 | 0, y: r() * 90 | 0, p: r() * 6.28, b: r() < .25 })); } },
  camp: { cur: [18, 9, 10], fx(g, t, W, H, r, S) { for (const s of S) { const y = H + 4 - (t * s.v), x = s.x + Math.sin(t * 5 + s.p) * 3; if (y > -4) R(g, t * s.v > H * .7 ? [190, 70, 30] : s.c, x, y, 1 + (s.b ? 1 : 0), 1 + (s.b ? 1 : 0)); } },
    init(r) { return Array.from({ length: 34 }, () => ({ x: r() * 150 | 0, v: 55 + r() * 90, p: r() * 6.28, b: r() < .3, c: r() < .5 ? [255, 209, 102] : [255, 123, 37] })); } },
  chalk: { cur: [36, 66, 51], fx(g, t, W, H, r, S) { const p = clamp(t / 1.0) * S.length; S.forEach((s, i) => { const k = clamp(p - i); if (k <= 0) return; line(g, [244, 244, 234], s[0], s[1], lerp(s[0], s[2], k), lerp(s[1], s[3], k)); if (k < 1) for (let j = 0; j < 3; j++) R(g, [200, 210, 200], lerp(s[0], s[2], k) + (r() - .5) * 6, lerp(s[1], s[3], k) + 2 + r() * 8); }); },
    init(r) { return [[10, 14, 70, 14], [70, 14, 30, 40], [30, 40, 100, 38], [100, 38, 60, 70], [14, 80, 120, 70], [90, 10, 130, 44], [20, 56, 20, 90]]; } },
};
LLCScenes.register({ sel: '#channels', run(el, H) {
  const RM = H.RM; if (RM || !('IntersectionObserver' in window)) return;
  const cards = [...el.querySelectorAll('.ch')]; if (!cards.length) return; document.documentElement.classList.add('scn-on');
  cards.forEach(c => { c.classList.remove('reveal'); c.classList.add('scn-pre'); });
  const io = new IntersectionObserver(es => { for (const e of es) { if (!e.isIntersecting) continue; io.unobserve(e.target); go(e.target); } }, { threshold: .25 });
  cards.forEach(c => io.observe(c)); setTimeout(() => cards.forEach(c => { if (c.classList.contains('scn-pre')) { c.classList.remove('scn-pre'); } }), 12000);
  function go(card) { const key = (card.className.match(/ch--(\w+)/) || [])[1], th = T[key]; card.classList.remove('scn-pre'); card.classList.add('scn-go');
    if (!th) return; const delay = parseFloat(getComputedStyle(card).getPropertyValue('--d')) || 0, r = card.getBoundingClientRect(), f = fit(r.width, r.width / 3), c = f.css, W = Math.ceil(r.width / c), Hh = Math.ceil(r.height / c);
    const cv = mk(W, Hh); cv.className = 'scn-card'; cv.setAttribute('aria-hidden', 'true'); cv.style.cssText = 'width:' + W * c + 'px;height:' + Hh * c + 'px'; card.appendChild(cv); const g = cv.getContext('2d'); g.imageSmoothingEnabled = false;
    let s = 1234 + (key.length * 77); const rn = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; const S = th.init(rn); let t = -delay; const DUR = 1.4;
    const draw = () => { g.clearRect(0, 0, W, Hh); if (t < 0) { dfill(g, th.cur, 0, 0, W, Hh, 1); return; }
      // curtain: Bayer dissolve sweeping left -> right
      const p = t / .9; const im = g.createImageData(W, Hh), d = im.data; const col = th.cur; for (let y = 0; y < Hh; y++) for (let x = 0; x < W; x++) { const th2 = (x / W) * .45 + bay(x, y) * .55; if (p < th2) { const j = (y * W + x) * 4; d[j] = col[0]; d[j + 1] = col[1]; d[j + 2] = col[2]; d[j + 3] = 255; } } g.putImageData(im, 0, 0);
      const keep = t < 1.0 ? 1 : 0; if (keep) { th.fx(g, t, W, Hh, rn, S); } };
    draw(); tick(dt => { t += dt; if (t > DUR) { cv.remove(); return false; } draw(); return true; }); }
} });
})();

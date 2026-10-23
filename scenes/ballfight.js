/* Eternal Ball Fight: an arena ring draws itself on the purple grid, two weapon balls (sword vs spear) charge in, collide with an
 * impact flash, shockwave ring, sparks and floor cracks, bounce apart, clash again. Section palette: #140c26 grid, #7c3fc4 ring, #ff4d6d / #4dc3ff. */
(function () {
const { bay, clamp, lerp, ss, mk, R, bake, ramp, disc, ringpx, line, dfill } = LLCScenes.H;
const BG = [20, 12, 38], GRID = [31, 20, 56], RING = [124, 63, 196], RING2 = [201, 166, 245], WHITE = [255, 255, 255], PINK = [255, 77, 109], CYAN = [77, 195, 255];
LLCScenes.register({ sel: '#ballfight', seed: 3, make(E) {
  const { W, H, rng } = E, cx = W >> 1, cy = H >> 1, Rr = Math.round(Math.min(W * .44, H * .42, 96)), br = 11;
  const bg = bake(W, H, (x, y) => { const g = (x + 3) % 12 === 0 || (y + 3) % 12 === 0, d = Math.hypot((x - cx) / (W * .6), (y - cy) / (H * .6)); return ramp(g ? [GRID, [44, 28, 78]] : [BG, [28, 16, 52]], g ? 1 - clamp(d) : 1 - clamp(d) * 1.2, x, y); });
  const arena = bake(W, H, (x, y) => { const d = Math.hypot(x - cx, (y - cy)); return d > Rr - 14 && d < Rr - 1 && bay(x, y) < (1 - (Rr - d) / 14) * .22 ? [60, 30, 110] : null; });
  const A = { x: -20, y: cy, vx: 0, c: PINK, w: 0, a: 0, trail: [] }, B = { x: W + 20, y: cy, vx: 0, c: CYAN, w: 1, a: 1, trail: [] };
  const sparks = [], cracks = [], waves = [], flashes = []; let shakeT = 0, hits = 0, ringPulse = 0;
  const boom = (x, y, n, big) => { for (let i = 0; i < n; i++) { const a = rng() * 6.283, v = 40 + rng() * (big ? 130 : 80); sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l: .55 + rng() * .6, c: [WHITE, [255, 230, 120], PINK, CYAN][(rng() * 4) | 0] }); }
    waves.push({ x, y, t: 0 }); flashes.push({ t: 0, big }); shakeT = big ? .35 : .22; ringPulse = 1;
    for (let k = 0; k < 3; k++) { const pts = []; let px = x, py = y, a = rng() * 6.283; for (let s = 0; s < 7; s++) { a += (rng() - .5) * 1.2; px += Math.cos(a) * 4; py += Math.sin(a) * 3; pts.push([px, py]); } cracks.push({ x, y, pts, t: 0 }); } };
  const pos = t => { // x offsets from centre for each ball, two charges
    const g = (a, b, u) => lerp(a, b, ss(0, 1, u)); let o;
    if (t < .5) o = g(Rr + 24, Rr + 24, 0); else if (t < 1.5) o = g(Rr + 24, br + 1, (t - .5) / 1); else if (t < 2.05) o = g(br + 1, 46, (t - 1.5) / .55); else if (t < 2.75) o = 46 - 0 * t; else if (t < 3.05) o = g(46, br + 1, (t - 2.75) / .3); else o = g(br + 1, 52, (t - 3.05) / .5);
    return o; };
  const weapon = (g, b, t) => { const a = b.a * 3.14 + t * (b.w ? 3.1 : 6.2) * (b.w ? -1 : 1) + (b.w ? 3.14 : 0), dx = Math.cos(a), dy = Math.sin(a);
    if (!b.w) { line(g, [255, 205, 70], b.x + dx * br, b.y + dy * br, b.x + dx * (br + 3), b.y + dy * (br + 3), 2); line(g, [225, 235, 245], b.x + dx * (br + 3), b.y + dy * (br + 3), b.x + dx * (br + 17), b.y + dy * (br + 17), 2); R(g, WHITE, b.x + dx * (br + 17), b.y + dy * (br + 17)); }
    else { line(g, [190, 135, 80], b.x + dx * (br - 2), b.y + dy * (br - 2), b.x + dx * (br + 20), b.y + dy * (br + 20), 1); line(g, [205, 245, 255], b.x + dx * (br + 20), b.y + dy * (br + 20), b.x + dx * (br + 26), b.y + dy * (br + 26), 2); } };
  const ball = (g, b) => { disc(g, WHITE, b.x, b.y, br + 1); disc(g, b.c, b.x, b.y, br); disc(g, b.c.map(v => v * .72), b.x + 3, b.y + 4, br - 4); dfill(g, b.c.map(v => v * .72), b.x - 8, b.y - 8, 18, 18, 0); R(g, WHITE, b.x - 5, b.y - 6, 4, 2); R(g, WHITE, b.x - 6, b.y - 4, 2, 2);
    R(g, [20, 12, 38], b.x - 4, b.y - 1, 3, 3); R(g, [20, 12, 38], b.x + 2, b.y - 1, 3, 3); R(g, WHITE, b.x - 3, b.y - 1); R(g, WHITE, b.x + 3, b.y - 1); };
  let ev = [1.5, 3.05].map(v => ({ t: v, done: false }));
  return { dur: 3.9,
    step(dt, t) { const o = pos(t); A.x = cx - o; B.x = cx + o; for (const b of [A, B]) { b.trail.unshift([b.x, b.y]); if (b.trail.length > 6) b.trail.pop(); }
      for (const e of ev) if (!e.done && t >= e.t) { e.done = true; hits++; boom(cx, cy, hits === 1 ? 34 : 46, true); }
      if (t > 2.05 && t < 2.1 && !E._m) { E._m = 1; boom(cx, cy, 0, false); }
      for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.vy += 70 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vx *= 1 - dt * 1.5; s.l -= dt; if (s.l <= 0) sparks.splice(i, 1); }
      for (const w of waves) w.t += dt; for (const f of flashes) f.t += dt; for (const c of cracks) c.t += dt; shakeT = Math.max(0, shakeT - dt); ringPulse = Math.max(0, ringPulse - dt * 2.4); },
    draw(g, t) {
      const sx = shakeT > 0 ? ((Math.floor(t * 50) & 1) ? 2 : -2) * Math.ceil(shakeT * 6) / 2 | 0 : 0, sy = shakeT > 0 ? ((Math.floor(t * 43) & 1) ? 1 : -1) : 0; g.save(); g.translate(sx, sy);
      g.drawImage(bg, 0, 0); const dr = ss(.0, .8, t), a1 = -1.5708 + dr * 6.2832; if (dr > .3) g.drawImage(arena, 0, 0);
      // ring (draws itself) + bright head, pulses on every hit
      ringpx(g, ringPulse > 0 ? RING2 : RING, cx, cy, Rr, 2, -1.5708, a1);
      if (dr > 0 && dr < 1) { R(g, WHITE, cx + Math.cos(a1) * Rr, cy + Math.sin(a1) * Rr, 3, 3); }
      for (const c of cracks) { const n = Math.min(c.pts.length, Math.ceil(c.t * 40)); let px = c.x, py = c.y; for (let i = 0; i < n; i++) { line(g, [8, 4, 18], px, py, c.pts[i][0], c.pts[i][1]); px = c.pts[i][0]; py = c.pts[i][1]; } }
      for (const w of waves) { const r = w.t * 190; if (w.t < .6) { ringpx(g, w.t < .25 ? WHITE : RING2, w.x, w.y, r, 2); if (w.t < .35) ringpx(g, [255, 230, 120], w.x, w.y, Math.max(1, r - 4), 1); } }
      for (const b of [A, B]) { for (let i = 3; i < b.trail.length; i++) if (i % 2) disc(g, b.c.map(v => v * (.5 - i * .05)), b.trail[i][0], b.trail[i][1], br - i); }
      weapon(g, A, t); weapon(g, B, t); ball(g, A); ball(g, B);
      for (const s of sparks) { g.fillStyle = css(s.c); const z = s.l > .4 ? 3 : s.l > .2 ? 2 : 1; g.fillRect(Math.round(s.x), Math.round(s.y), z, z); if (s.l > .3) { g.fillStyle = css([255, 255, 255]); g.fillRect(Math.round(s.x), Math.round(s.y), 1, 1); } }
      for (const f of flashes) { const u = f.t / (f.big ? .3 : .2); if (u < 1) { dfill(g, WHITE, -4, -4, W + 8, H + 8, (1 - u) * (1 - u) * (f.big ? .95 : .6)); } const w2 = f.t / .5; if (w2 < 1) for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + .39, r0 = 8 + 14 * w2, r1 = 22 + 46 * Math.sqrt(w2); line(g, i & 1 ? [255, 230, 120] : WHITE, cx + Math.cos(a) * r0, cy + Math.sin(a) * r0, cx + Math.cos(a) * r1, cy + Math.sin(a) * r1, w2 < .4 ? 2 : 1); } { } }
      g.restore(); }
  };
  function css(c) { return 'rgb(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ')'; }
} });
})();

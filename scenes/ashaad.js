/* The Binding of Ashaad: a dark basement door creaks open on a dark red room, bone-white and blood-red tears fall and splash,
 * a cursed item rises on its pedestal and glints. Dark Isaac-like palette, dithered torch light, no text. */
(function () {
const { bay, clamp, ss, mk, R, bake, ramp, spr, ringpx, dfill } = LLCScenes.H;
const BONE = [232, 220, 192], BONE2 = [255, 250, 235], RED = [170, 22, 34], RED2 = [235, 70, 80], DRED = [90, 10, 20];
const TEAR = ['.a.', '.a.', 'aba', 'aaa', '.a.'];
LLCScenes.register({ sel: '#ashaad', seed: 11, make(E) {
  const { W, H, rng } = E, cx = W >> 1, dw = 60, dh = 78, doorTop = Math.max(34, Math.round(H / 2 - dh / 2 - 2)), floorY = doorTop + dh, dl = cx - dw / 2, dr = dl + dw;
  // background: brick wall + stone floor in dark browns, vignette by ordered dither
  const TONE = [[0, 0, 0], [12, 8, 6], [26, 17, 11], [46, 30, 19], [66, 44, 28]];
  const bg = bake(W, H, (x, y) => { const d = Math.hypot((x - cx) / (W * .62), (y - (doorTop + dh * .5)) / (Math.max(H, 140) * .72)), v = clamp(1 - d);
    if (y < floorY) { const row = (y / 8) | 0, bx = (x + (row & 1) * 11) % 22, mortar = y % 8 === 0 || bx === 0, sh = ((row * 7 + (((x + (row & 1) * 11) / 22) | 0) * 13) % 5) / 5;
      return ramp(TONE, v * (mortar ? .55 : .85 + sh * .45), x, y); }
    const slab = (y - floorY) % 14 === 0 || (x + ((y - floorY) / 14 | 0) * 17) % 40 === 0; return ramp(TONE, v * (slab ? .75 : 1.15) * (1 - .35 * ((y - floorY) / Math.max(1, H - floorY))), x, y); });
  // stone arch around the door
  const frame = bake(dw + 12, dh + 7, (x, y) => { const X = x - 6, inside = X >= 0 && X < dw && y >= 7; if (inside) return null; if (y < 2 && (x < 3 || x > dw + 8)) return null; if (y < 1 && (x < 5 || x > dw + 6)) return null; const sh = (x + y) % 7 === 0 ? 0 : 1; return sh ? [78, 62, 52] : [52, 40, 33]; });
  // interior: dark red room lit from within, dithered
  const inter = bake(dw, dh, (x, y) => { const d = Math.hypot((x - dw / 2) / (dw * .55), (y - dh * .78) / (dh * .8)); return ramp([[10, 2, 5], [44, 6, 14], [96, 12, 24], [160, 30, 36]], 1.05 - d, x, y); });
  const shaft = bake(dw * 2, 46, (x, y) => { const u = y / 46, half = dw * .5 + u * dw * .42; if (Math.abs(x - dw) > half) return null; const f = (1 - u) * .8 * (1 - Math.abs(x - dw) / half); return bay(x, y) < f * .55 ? [150, 28, 34, 200] : null; });
  const glow = [0, 1].map(k => bake(96, 96, (x, y) => { const d = Math.hypot(x - 48, y - 48) / 48, f = (1 - d) * (1 - d) * (k ? .62 : .5); return d < 1 && bay(x, y) < f ? [255, 130, 36, 255] : null; }));
  const FL = [['..y..', '.yoy.', '.yoo.', 'yooor', '.oor.', '.rrr.'], ['.y...', '.yoy.', 'yooo.', 'yoooy', '.orr.', '.rrr.'], ['...y.', '.yoy.', '.ooy.', '.ooor', 'roor.', '.rrr.']];
  const FPAL = { y: [255, 214, 96], o: [255, 138, 36], r: [190, 48, 22] };
  const PED = ['.hhhhhhhhhhh.', 'hhsssssssssh h'.replace(' ', ''), '.hsssssssssh.', '..hsssssssh..', '..hsssssssh..', '.hhhhhhhhhhh.'].map(r => r.slice(0, 13));
  const PPAL = { h: [120, 98, 82], s: [78, 62, 52] };
  const SKULL = ['..bbbbb..', '.bbbbbbb.', 'bbbbbbbbb', 'bkkbbbkkb', 'bkkbbbkkb', 'bbbbkbbbb', '.bbbbbbb.', '..bkbkb..', '..b.b.b..'], SPAL = { b: BONE, k: [34, 8, 12] };
  const tears = [], splash = [], rings = [], puddles = [], glints = []; let sp = 0, gl = 0, ring2 = -9;
  const spawn = (x, y, v) => tears.push({ x, y, vy: v || 20 + rng() * 30, k: rng() < .5 ? 0 : 1, ly: Math.min(H - 3, floorY + 4 + rng() * 22) });
  const open = t => { const q = clamp((t - .55) / 1.5), st = Math.floor(q * 14) / 14; return ss(0, 1, st * .85 + q * .15); };
  return { dur: 3.7,
    step(dt, t) {
      const rate = 1 + 11 * ss(.8, 2.4, t) - 6 * ss(3.2, 3.7, t); sp += dt * rate; while (sp > 1) { sp -= 1; spawn(rng() < .7 ? dl + rng() * dw : rng() * W, -4); }
      if (t > 1.5 && t < 3.4) { gl += dt * 5; while (gl > 1) { gl -= 1; spawn(cx + (rng() - .5) * dw * .45, doorTop + dh * .3, 4); } }
      for (let i = tears.length - 1; i >= 0; i--) { const p = tears[i]; p.vy += 320 * dt; p.y += p.vy * dt; if (p.y >= p.ly) { tears.splice(i, 1);
        for (let k = 0; k < 4; k++) splash.push({ x: p.x, y: p.ly, vx: (rng() - .5) * 50, vy: -(30 + rng() * 40), k: p.k, l: .35 });
        rings.push({ x: p.x, y: p.ly, t: 0, k: p.k }); if (puddles.length < 70) puddles.push({ x: p.x, y: p.ly, w: 2 + (rng() * 3 | 0), k: p.k }); } }
      for (let i = splash.length - 1; i >= 0; i--) { const s = splash[i]; s.vy += 260 * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.l -= dt; if (s.l <= 0) splash.splice(i, 1); }
      for (let i = rings.length - 1; i >= 0; i--) { rings[i].t += dt; if (rings[i].t > .5) rings.splice(i, 1); }
      if (t > 2.15) { gl += 0; if (t - (E._gt || 0) > .16) { E._gt = t; const a = rng() * 6.28, d = 8 + rng() * 6; glints.push({ x: cx + Math.cos(a) * d, y: floorY - 16 + Math.sin(a) * d * .8, t: 0, g: rng() < .25 }); } }
      for (let i = glints.length - 1; i >= 0; i--) { glints[i].t += dt; if (glints[i].t > .5) glints.splice(i, 1); }
    },
    draw(g, t) {
      g.drawImage(bg, 0, 0); const fr = Math.floor(t * 9);
      for (const [tx, k] of [[dl - 24, 0], [dr + 24, 1]]) { g.globalAlpha = (fr + k) % 3 ? .62 : .8; g.drawImage(glow[(fr + k) & 1], tx - 48, doorTop + 20 - 48); g.globalAlpha = 1; spr(g, FL[(fr + k * 2) % 3], FPAL, tx - 2, doorTop + 14); R(g, [90, 60, 36], tx - 1, doorTop + 20, 3, 14); R(g, [60, 40, 24], tx - 2, doorTop + 33, 5, 2); }
      g.drawImage(frame, dl - 6, doorTop - 7); const o = open(t);
      g.drawImage(inter, dl, doorTop); if (o > .02) { g.globalAlpha = clamp(o * 1.4) * .9; g.drawImage(shaft, cx - dw, floorY - 2); g.globalAlpha = 1; }
      // item pedestal + cursed item rising (inside the doorway)
      const pi = ss(1.9, 2.4, t); if (pi > 0) { const py = floorY - 6 + Math.round((1 - pi) * 8); g.save(); g.beginPath(); g.rect(dl, doorTop, dw, dh); g.clip(); spr(g, PED, PPAL, cx - 6, py);
        const bob = Math.round(Math.sin(t * 3.2) * 1.4), iy = py - 12 - Math.round(pi * 3) + bob;
        for (let d = 0; d < 3; d++) { g.globalAlpha = .18; R(g, RED, cx - 8 - d, iy - d, 17 + d * 2, 12 + d * 2); } g.globalAlpha = 1; dfill(g, [200, 40, 50], cx - 9, iy - 2, 18, 14, .35 + .1 * Math.sin(t * 5)); spr(g, SKULL, SPAL, cx - 4, iy); g.restore(); }
      // door leaves (hinged at the outer edges, swinging inward: narrow + shrink toward the free edge)
      const wL = Math.max(1, Math.round(dw / 2 * (1 - o * .86))), sh = o;
      for (const side of [0, 1]) for (let i = 0; i < wL; i++) { const u = i / Math.max(1, wL - 1), x = side ? dr - 1 - i : dl + i, hh = Math.round(dh * (1 - .17 * sh * u)), y0 = doorTop + Math.round((dh - hh) / 2), pl = ((i / wL) * 4 | 0) & 1, hv = ((u * 4 | 0) & 1);
        const c = [pl ? 96 : 80, pl ? 60 : 49, pl ? 33 : 26], f = 1 - .35 * u * sh - (hv ? .05 : 0); g.fillStyle = 'rgb(' + (c[0] * f | 0) + ',' + (c[1] * f | 0) + ',' + (c[2] * f | 0) + ')'; g.fillRect(x, y0, 1, hh);
        g.fillStyle = 'rgb(34,28,30)'; g.fillRect(x, y0 + Math.round(hh * .16), 1, 3); g.fillRect(x, y0 + Math.round(hh * .7), 1, 3); if (i === wL - 1 || i === 0) { g.fillStyle = 'rgb(40,24,14)'; g.fillRect(x, y0, 1, hh); } }
      { const hx = wL - 1; R(g, BONE, dl + hx - 2, doorTop + dh * .5 - 1, 3, 3); R(g, BONE, dr - hx + 0, doorTop + dh * .5 - 1, 3, 3); }
      // puddles + rings + splashes + falling tears
      for (const p of puddles) { R(g, p.k ? [96, 10, 20] : [120, 112, 98], p.x - p.w, p.y, p.w * 2 + 1, 1); }
      for (const r of rings) { const q = r.t / .5; ringpx(g, r.k ? RED2 : BONE, r.x, r.y, 1 + q * 6, 1, 0, 6.28, .38); }
      for (const s of splash) R(g, s.k ? RED2 : BONE2, s.x, s.y, 1, 1);
      for (const p of tears) spr(g, TEAR, p.k ? { a: RED, b: RED2 } : { a: BONE, b: BONE2 }, p.x - 1, p.y - 2);
      // item flash + glints
      const fl = (t - 2.3) / .5; if (fl > 0 && fl < 1) { ringpx(g, BONE2, cx, floorY - 14, 2 + fl * 26, 1, 0, 6.28, .8); if (fl < .35) dfill(g, BONE, dl, doorTop, dw, dh, (1 - fl / .35) * .55); }
      for (const q of glints) { const u = q.t / .5, L = Math.round(Math.sin(u * 3.14) * 3), c = q.g ? [255, 214, 96] : BONE2; R(g, c, q.x, q.y); for (let i = 1; i <= L; i++) { R(g, c, q.x - i, q.y); R(g, c, q.x + i, q.y); R(g, c, q.x, q.y - i); R(g, c, q.x, q.y + i); } }
    } };
} });
})();

/* Game of Websites: a paper catalogue. Tiny site thumbnails drop in, flip like index cards and stack into a grid, a red scan line
 * sweeps over them ticking each one, an equaliser + notes hint at the built-in soundtrack, and a stamp thumps down. Paper palette of the section. */
(function () {
const { bay, clamp, lerp, ss, mk, R, bake, ramp, rng: mkrng, dfill } = LLCScenes.H;
const PAPER = [243, 236, 223], TAN = [221, 207, 188], INK = [26, 22, 18], GRAY = [111, 101, 92], CARD = [255, 250, 243], STAMP = [194, 65, 45], PROJ = [29, 106, 72], GOLD = [222, 165, 58], BLUE = [58, 92, 150];
const NOTE = ['..xx', '..x.x', '..x..x', '..x', 'xx.', 'xx.'], NOTE2 = ['.xxxx', '.x..x', '.x..x', 'xx.xx', 'xx.xx'];
LLCScenes.register({ sel: '#game-of-websites', seed: 5, make(E) {
  const { W, H, rng } = E, cw = 38, ch = 28, gap = 7, cols = Math.max(2, Math.min(5, Math.floor((W - 10) / (cw + gap)))), rows = Math.max(2, Math.min(4, Math.floor((H - 46) / (ch + gap))));
  const gx0 = Math.round((W - (cols * cw + (cols - 1) * gap)) / 2), gy0 = Math.round((H - (rows * ch + (rows - 1) * gap)) / 2) - 3, tops = gy0;
  const bg = bake(W, H, (x, y) => { const e = Math.hypot((x - W / 2) / (W * .7), (y - H / 2) / (H * .75)); const ruled = y % 8 === 7; return ramp(ruled ? [TAN, [200, 184, 160]] : [PAPER, TAN], ruled ? .4 : clamp(e - .55) * 1.4, x, y); });
  const faces = []; for (let i = 0; i < cols * rows; i++) { const c = mk(cw, ch), g = c.getContext('2d'), pal = [STAMP, PROJ, GOLD, BLUE, INK], A = pal[(rng() * 5) | 0], B = pal[(rng() * 5) | 0], kind = (rng() * 3) | 0;
    R(g, INK, 0, 0, cw, ch); R(g, CARD, 1, 1, cw - 2, ch - 2); R(g, TAN, 1, 1, cw - 2, 5); R(g, STAMP, 3, 3, 2, 2); R(g, GOLD, 6, 3, 2, 2); R(g, PROJ, 9, 3, 2, 2);
    if (kind === 0) { R(g, A, 3, 8, cw - 6, 9); R(g, B, 3, 19, 10, 6); R(g, TAN, 15, 19, 8, 6); R(g, GRAY, 25, 19, 10, 6); }
    else if (kind === 1) { R(g, A, 3, 8, 11, ch - 11); for (let k = 0; k < 4; k++) R(g, k & 1 ? GRAY : INK, 17, 9 + k * 4, 17 - (k * 3) % 7, 2); }
    else { for (let a = 0; a < 3; a++) for (let b = 0; b < 2; b++) R(g, (a + b) & 1 ? A : B, 3 + a * 11, 8 + b * 9, 10, 8); }
    faces.push(c); }
  const back = mk(cw, ch); { const g = back.getContext('2d'); R(g, INK, 0, 0, cw, ch); R(g, [60, 52, 44], 2, 2, cw - 4, ch - 4); for (let y = 3; y < ch - 3; y += 2) for (let x = 3 + (y & 2); x < cw - 3; x += 4) R(g, INK, x, y, 1, 1); R(g, STAMP, cw / 2 - 2, ch / 2 - 2, 4, 4); }
  const order = [...Array(cols * rows).keys()].sort(() => rng() - .5), delay = []; order.forEach((id, k) => delay[id] = .15 + k * (1.45 / (cols * rows)));
  const tx = id => gx0 + (id % cols) * (cw + gap), ty = id => gy0 + ((id / cols) | 0) * (ch + gap), LAND = .5, FLIP = .26;
  const eqY = H - 6, nb = Math.min(16, Math.floor(W / 11)), eq0 = Math.round((W - nb * 9) / 2);
  const scanT0 = 2.0, scanT1 = 3.1, stampT = 3.2; let eqv = Array(nb).fill(0), notes = [{ x: W * .8, y: eqY - 10, t: 0 }, { x: W * .22, y: eqY - 6, t: 1.1 }], seed = 0;
  return { dur: 4.0,
    step(dt, t) { seed += dt; for (let i = 0; i < nb; i++) { const target = ss(.5, 1.2, t) * (1 - ss(3.7, 4.0, t)) * (4 + 10 * (.5 + .5 * Math.sin(t * (3 + i * .7) + i * 1.9)) * (.5 + .5 * Math.sin(t * 1.3 + i))); eqv[i] += (target - eqv[i]) * Math.min(1, dt * 14); }
      for (const n of notes) { n.t += dt; if (n.t > 2.2) { n.t = 0; n.x = 20 + rng() * (W - 40); } } },
    draw(g, t) {
      g.drawImage(bg, 0, 0); const sy = lerp(tops - 6, tops + rows * (ch + gap) + 2, ss(scanT0, scanT1, t)), shake = (t > stampT && t < stampT + .3) ? ((Math.floor(t * 40) & 1) ? 2 : -2) : 0; g.save(); g.translate(0, shake);
      for (let id = 0; id < cols * rows; id++) { const tt = t - delay[id]; if (tt < 0) continue; const x = tx(id), y1 = ty(id), q = tt / LAND;
        if (q < 1) { const yy = y1 - (1 - q * q) * (y1 + ch + 6); R(g, [200, 184, 160], x + 2, y1 + ch - 1, cw, 2); g.drawImage(back, x, Math.round(yy)); continue; }
        const f = (tt - LAND) / FLIP, bounce = Math.round(Math.abs(Math.sin(clamp(tt - LAND, 0, .3) * 11)) * 3 * (1 - clamp((tt - LAND) / .3)));
        R(g, [200, 184, 160], x + 2, y1 + ch - 1 - bounce, cw, 2);
        if (f < 1) { const sc = Math.abs(Math.cos(f * Math.PI)), h = Math.max(1, Math.round(ch * sc)); g.drawImage(f < .5 ? back : faces[id], x, y1 - bounce + Math.round((ch - h) / 2), cw, h); }
        else { g.drawImage(faces[id], x, y1 - bounce); const hit = sy - y1; if (t > scanT0 && hit > 0) { const age = (t - (scanT0 + (y1 - (tops - 6)) / (rows * (ch + gap) + 8) * (scanT1 - scanT0))); if (age > 0 && age < .5) { g.fillStyle = 'rgb(194,65,45)'; g.fillRect(x - 1, y1 - 1, cw + 2, 1); g.fillRect(x - 1, y1 + ch, cw + 2, 1); g.fillRect(x - 1, y1, 1, ch); g.fillRect(x + cw, y1, 1, ch); }
          if (hit > 6) { R(g, PROJ, x + cw - 6, y1 + 3, 3, 1); R(g, PROJ, x + cw - 5, y1 + 4, 1, 1); R(g, PROJ, x + cw - 7, y1 + 2, 1, 1); } } } }
      if (t > scanT0 && t < scanT1 + .1) { const a = Math.round(sy); R(g, STAMP, 0, a, W, 1); dfill(g, STAMP, 0, a - 4, W, 4, .5); dfill(g, STAMP, 0, a - 9, W, 5, .2); R(g, INK, 0, a + 1, W, 1); }
      // equaliser + notes
      for (let i = 0; i < nb; i++) { const h = Math.round(eqv[i]); if (h > 0) { R(g, i % 3 === 0 ? STAMP : i % 3 === 1 ? PROJ : INK, eq0 + i * 9, eqY - h, 7, h); R(g, CARD, eq0 + i * 9, eqY - h, 7, 1); } }
      for (const n of notes) if (t > .8) { const u = n.t / 2.2, y = n.y - u * 28, x = n.x + Math.sin(u * 9) * 3, c = u < .15 || u > .8 ? TAN : INK, rows2 = NOTE; for (let j = 0; j < rows2.length; j++) for (let i = 0; i < rows2[j].length; i++) if (rows2[j][i] === 'x') R(g, c, x + i, y + j); }
      g.restore();
      // stamp thump
      const sq = (t - stampT) / .14; if (sq > 0) { const sc = sq < 1 ? lerp(1.9, 1, sq * sq) : 1, w = Math.round(46 * sc), h = Math.round(20 * sc), x = Math.round(W / 2 - w / 2), y = Math.round(H / 2 - h / 2);
        g.globalAlpha = .93; R(g, PAPER, x, y, w, h); g.globalAlpha = 1; for (let k = 0; k < 2; k++) { g.fillStyle = css2(STAMP); g.fillRect(x + k, y + k, w - 2 * k, 1); g.fillRect(x + k, y + h - 1 - k, w - 2 * k, 1); g.fillRect(x + k, y + k, 1, h - 2 * k); g.fillRect(x + w - 1 - k, y + k, 1, h - 2 * k); }
        if (sq >= 1) { for (let i = 0; i < 4; i++) R(g, STAMP, x + 8 + i * 8, y + 7, 5, 6 - (i & 1) * 2); R(g, STAMP, x + 5, y + 4, 2, 2); R(g, STAMP, x + w - 7, y + h - 6, 2, 2); } else dfill(g, STAMP, x, y, w, h, .25); }
    } };
  function css2(c) { return 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')'; }
} });
})();

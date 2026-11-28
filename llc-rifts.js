/* ==========================================================================
   llc-rifts.js — Procedural Reality-Crack Geometry, Authentic Game Titles,
   23 Site-Specific Alive Animations & Pop-Out Characters
   ========================================================================== */

window.LLCRifts = (() => {
  /* ------------------------------------------------------------------------
     Deterministic PRNG & Procedural Reality-Crack Geometry Engine
     Generates 23 completely unique crack silhouettes (zero repeated shapes),
     radiating hairline fracture veins extending into the white page, and
     detached pixel blocks / reality shards around each tear.
     Coordinate space: 600 x 200 (portal), SVG overflows [-48..648] x [-34..234]
     ------------------------------------------------------------------------ */
  function mkRng(seed) {
    let s = (seed * 16807) % 2147483647;
    if (s <= 0) s += 2147483646;
    return () => {
      s = (s * 48271) % 2147483647;
      return (s - 1) / 2147483646;
    };
  }

  function quant(v, step) {
    return Math.round(v / step) * step;
  }

  // Convert a polyline into crisp 90-degree pixel staircase segments
  function stepify(pts, stepX = 8, stepY = 7) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = [quant(pts[i][0], stepX), quant(pts[i][1], stepY)];
      if (!out.length) {
        out.push(p);
        continue;
      }
      const prev = out[out.length - 1];
      if (prev[0] === p[0] && prev[1] === p[1]) continue;
      // Insert crisp orthogonal corner between prev and p
      if (prev[0] !== p[0] && prev[1] !== p[1]) {
        const midX = quant((prev[0] + p[0]) * 0.5, stepX);
        if (midX !== prev[0] && midX !== p[0]) {
          out.push([midX, prev[1]], [midX, p[1]]);
        } else {
          out.push([p[0], prev[1]]);
        }
      }
      out.push(p);
    }
    return out;
  }

  function buildCrackGeometry(site) {
    const W = 600;
    const H = 200;
    const r = mkRng(site.seed || 42);
    const arch = site.archetype || 'tapered';
    const isPx = !!site.pixel;

    // Tapered left & right fissure tips (makes it look like a REAL crack, not a box!)
    let leftTipY = 100 + (r() - 0.5) * 44;
    let rightTipY = 100 + (r() - 0.5) * 44;
    let leftX = 12 + r() * 14;
    let rightX = W - 12 - r() * 14;

    if (arch === 'lightning') {
      leftTipY = 58 + r() * 18;
      rightTipY = 132 + r() * 20;
    } else if (arch === 'reverse-slash') {
      leftTipY = 136 + r() * 18;
      rightTipY = 56 + r() * 20;
    } else if (arch === 'asymmetric-left') {
      leftX = 8 + r() * 10;
      rightX = W - 6 - r() * 8;
      leftTipY = 86 + r() * 28;
      rightTipY = 96 + r() * 14;
    } else if (arch === 'asymmetric-right') {
      leftX = 6 + r() * 8;
      rightX = W - 8 - r() * 10;
      leftTipY = 98 + r() * 14;
      rightTipY = 86 + r() * 28;
    }

    // Profile envelope for top and bottom edge (keeps center 115..485 comfortably open for BIG titles!)
    function envelope(u, side) {
      // u in [0..1] along X; side = -1 (top) or +1 (bottom)
      let base = 16; // margin from outer box edge
      // Taper sharply near left/right tips
      const endL = Math.max(0, 1 - u / 0.17);
      const endR = Math.max(0, 1 - (1 - u) / 0.17);
      let taper = (endL * endL * 54) + (endR * endR * 54);

      if (arch === 'lightning') {
        const tilt = (u - 0.5) * 34;
        base += side < 0 ? Math.max(-6, tilt) : Math.max(-6, -tilt);
      } else if (arch === 'reverse-slash') {
        const tilt = (0.5 - u) * 34;
        base += side < 0 ? Math.max(-6, tilt) : Math.max(-6, -tilt);
      } else if (arch === 'asymmetric-left') {
        taper = (endL * endL * 32) + Math.pow(Math.max(0, (u - 0.58) / 0.42), 1.9) * 58;
      } else if (arch === 'asymmetric-right') {
        taper = Math.pow(Math.max(0, (0.42 - u) / 0.42), 1.9) * 58 + (endR * endR * 32);
      } else if (arch === 'twin-bite') {
        const bite = Math.exp(-Math.pow((u - (side < 0 ? 0.34 : 0.66)) / 0.08, 2)) * 22;
        base += bite;
      } else if (arch === 'seismic') {
        base += Math.sin(u * Math.PI * 2.2 + (side < 0 ? 0 : 0.6)) * 12;
      } else if (arch === 'shattered') {
        taper = (endL * endL * 42) + (endR * endR * 42);
      }

      // Jagged crack tooth variance
      const jag = (r() - 0.45) * (isPx ? 22 : 24);
      let y = side < 0
        ? Math.max(6, Math.min(82, base + taper + jag))
        : Math.min(H - 6, Math.max(H - 82, H - (base + taper + jag)));

      // Protect center band so big real logos are never clipped by an aggressive tooth
      if (u > 0.20 && u < 0.80) {
        if (side < 0) y = Math.min(y, 26);
        else y = Math.max(y, H - 26);
      }
      return y;
    }

    const segs = isPx ? 13 : 15;
    const topPts = [];
    const botPts = [];

    for (let i = 1; i < segs; i++) {
      const u = i / segs + (r() - 0.5) * (0.45 / segs);
      const x = leftX + u * (rightX - leftX);
      topPts.push([x, envelope(u, -1)]);
    }
    for (let i = segs - 1; i >= 1; i--) {
      const u = i / segs + (r() - 0.5) * (0.45 / segs);
      const x = leftX + u * (rightX - leftX);
      botPts.push([x, envelope(u, +1)]);
    }

    // Add dramatic side jaw vertices near left & right tips
    const rawPoly = [
      [leftX, leftTipY],
      [leftX + 16 + r() * 14, Math.max(16, leftTipY - 28 - r() * 18)],
      ...topPts,
      [rightX - 16 - r() * 14, Math.max(16, rightTipY - 28 - r() * 18)],
      [rightX, rightTipY],
      [rightX - 16 - r() * 14, Math.min(H - 16, rightTipY + 28 + r() * 18)],
      ...botPts,
      [leftX + 16 + r() * 14, Math.min(H - 16, leftTipY + 28 + r() * 18)],
    ];

    const poly = isPx ? stepify(rawPoly, 8, 7) : rawPoly.map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);

    // CSS percentage polygon for clip-path
    const clipPolygon =
      'polygon(' +
      poly.map(([x, y]) => `${((x / W) * 100).toFixed(2)}% ${((y / H) * 100).toFixed(2)}%`).join(', ') +
      ')';

    // Exact SVG path for fracture rim + recessed cast shadow
    const polyPath =
      'M ' + poly.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';

    // Generate 7-9 radiating hairline fracture cracks shooting outward into the white paper!
    const veins = [];
    const glowVeins = [];

    function makeVein(sx, sy, angle, len, depth) {
      const pts = [[sx, sy]];
      let cx = sx;
      let cy = sy;
      let a = angle;
      const steps = isPx ? 3 : 4;
      const sl = len / steps;
      for (let k = 0; k < steps; k++) {
        a += (r() - 0.5) * 0.65;
        if (isPx) {
          const dx = Math.cos(a) * sl;
          const dy = Math.sin(a) * sl;
          if (Math.abs(dx) >= Math.abs(dy)) {
            cx = quant(cx + dx, 6);
            pts.push([cx, cy]);
            cy = quant(cy + dy, 6);
            pts.push([cx, cy]);
          } else {
            cy = quant(cy + dy, 6);
            pts.push([cx, cy]);
            cx = quant(cx + dx, 6);
            pts.push([cx, cy]);
          }
        } else {
          cx += Math.cos(a) * sl;
          cy += Math.sin(a) * sl;
          pts.push([cx, cy]);
        }
        // Fork a tiny hairline sub-crack midway
        if (depth === 0 && k === 1 && r() < 0.72) {
          makeVein(cx, cy, a + (r() < 0.5 ? 0.65 : -0.65), len * 0.52, 1);
        }
      }
      const d = 'M ' + pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ');
      const sw = depth === 0 ? (isPx ? 2.1 : 1.7) : (isPx ? 1.3 : 1.0);
      veins.push(`<path d="${d}" stroke-width="${sw}" />`);
      // Dimensional energy bleed near the crack mouth (first half of primary vein)
      if (depth === 0) {
        const half = pts.slice(0, Math.max(2, Math.ceil(pts.length * 0.55)));
        const dg = 'M ' + half.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ');
        glowVeins.push(`<path d="${dg}" stroke-width="${sw + 0.8}" />`);
      }
    }

    // Primary cracks shoot out from the left tip, right tip, and 4-5 sharp top/bottom fracture teeth!
    makeVein(poly[0][0], poly[0][1], Math.PI + (r() - 0.5) * 0.55, 36 + r() * 14, 0);
    // Find rightmost vertex
    let rightIdx = 0;
    for (let i = 1; i < poly.length; i++) if (poly[i][0] > poly[rightIdx][0]) rightIdx = i;
    makeVein(poly[rightIdx][0], poly[rightIdx][1], (r() - 0.5) * 0.55, 36 + r() * 14, 0);

    // Top & bottom hairline fissures radiating into the clean white page
    const pickCount = 5;
    for (let k = 0; k < pickCount; k++) {
      const idx = Math.floor(((k + 0.4 + r() * 0.4) / pickCount) * poly.length) % poly.length;
      const [vx, vy] = poly[idx];
      if (vx < 45 || vx > W - 45) continue;
      const outAngle = vy < H * 0.5
        ? -Math.PI * 0.5 + (r() - 0.5) * 1.1
        : Math.PI * 0.5 + (r() - 0.5) * 1.1;
      makeVein(vx, vy, outAngle, 20 + r() * 16, 0);
    }

    // Detached floating shards / chipped pixel blocks hovering just outside the fracture
    const shards = [];
    for (let k = 0; k < 6; k++) {
      const onLeft = k === 0;
      const onRight = k === 1;
      let sx, sy;
      if (onLeft) {
        sx = poly[0][0] - 12 - r() * 20;
        sy = poly[0][1] + (r() - 0.5) * 44;
      } else if (onRight) {
        sx = poly[rightIdx][0] + 10 + r() * 20;
        sy = poly[rightIdx][1] + (r() - 0.5) * 44;
      } else {
        sx = 70 + r() * (W - 140);
        sy = k % 2 === 0 ? 4 - r() * 18 : H - 4 + r() * 18;
      }
      const colored = k % 2 === 0;
      const cls = colored ? 'rift-shard is-accent' : 'rift-shard is-dark';
      if (isPx) {
        const sz = 4 + Math.floor(r() * 5);
        shards.push(`<rect class="${cls}" x="${quant(sx, 2)}" y="${quant(sy, 2)}" width="${sz}" height="${sz}" />`);
      } else {
        const s1 = 4 + r() * 5;
        const s2 = 3 + r() * 5;
        const a1 = r() * Math.PI * 2;
        const p1 = [sx + Math.cos(a1) * s1, sy + Math.sin(a1) * s1];
        const p2 = [sx + Math.cos(a1 + 2.2) * s2, sy + Math.sin(a1 + 2.2) * s2];
        const p3 = [sx + Math.cos(a1 + 4.3) * (s1 * 0.85), sy + Math.sin(a1 + 4.3) * (s1 * 0.85)];
        shards.push(`<polygon class="${cls}" points="${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)} ${p3[0].toFixed(1)},${p3[1].toFixed(1)}" />`);
      }
    }

    const svgMarkup = `
      <svg class="rift-fracture-svg" viewBox="-48 -32 696 264" preserveAspectRatio="none" aria-hidden="true">
        <g class="crack-veins-dark" fill="none" stroke-linecap="${isPx ? 'square' : 'round'}" stroke-linejoin="${isPx ? 'miter' : 'round'}">
          ${veins.join('')}
        </g>
        <g class="crack-veins-glow" fill="none" stroke-linecap="${isPx ? 'square' : 'round'}" stroke-linejoin="${isPx ? 'miter' : 'round'}">
          ${glowVeins.join('')}
        </g>
        <g class="crack-shards">
          ${shards.join('')}
        </g>
        <path class="crack-outline-dark" d="${polyPath}" fill="none" stroke-width="${isPx ? 3.2 : 2.6}" stroke-linejoin="${isPx ? 'miter' : 'round'}" />
        <path class="crack-outline-glow" d="${polyPath}" fill="none" stroke-width="${isPx ? 2.2 : 1.8}" stroke-linejoin="${isPx ? 'miter' : 'round'}" />
      </svg>
    `;

    return { clipPolygon, svgMarkup };
  }

  /* ------------------------------------------------------------------------
     Exact W.A.M. Pixel Bitmap Title SVG
     ------------------------------------------------------------------------ */
  const WG = {
    W: [12, 3951, 1902, 1902, 1902, 1902, 1902, 1902, 1830, 2046, 1023, 0],
    '.': [3, 0, 0, 0, 0, 0, 0, 0, 0, 7, 7, 0],
    A: [10, 510, 252, 462, 462, 462, 510, 510, 462, 462, 975, 0],
    M: [12, 1023, 2046, 1830, 1902, 1902, 1902, 1902, 1902, 1902, 3951, 0],
  };

  function wamSVG(str) {
    let x = 0;
    let d = '';
    for (const ch of str) {
      const gl = WG[ch];
      if (!gl) { x += 4; continue; }
      for (let r = 0; r < 11; r++) {
        const m = gl[r + 1];
        let c = 0;
        while (c < gl[0]) {
          if ((m >> c) & 1) {
            let e = c;
            while (e < gl[0] && ((m >> e) & 1)) e++;
            d += `M${x + c} ${r}h${e - c}v1h${c - e}z`;
            c = e;
          } else c++;
        }
      }
      x += gl[0] + 1;
    }
    return `<svg class="title-wam-svg" viewBox="0 0 ${x} 12" shape-rendering="crispEdges" aria-hidden="true"><path fill="#0e2217" transform="translate(1 1)" d="${d}"/><path fill="#ffffff" d="${d}"/></svg>`;
  }

  /* ------------------------------------------------------------------------
     Authentic Big In-Game Titles (Zero Descriptions)
     ------------------------------------------------------------------------ */
  function buildTitleHTML(site, assetBase) {
    if (site.titleImg) {
      const cls = site.titleStyle === 'img-tall' ? 'rift-title-img tall' : 'rift-title-img';
      return `<img class="${cls}" src="${assetBase}${site.titleImg}" alt="${site.title}" draggable="false" />`;
    }
    switch (site.titleStyle) {
      case 'wam':
        return `<span class="sr-only">${site.title}</span>${wamSVG('W.A.M.')}`;
      case 'roguelike':
        return `<div class="rt-roguelike">ROGUELIKE <span>QUIZ</span></div>`;
      case 'llccards':
        return `<div class="rt-llccards">LLC CARDS</div>`;
      case 'cast':
        return `<div class="rt-cast">CAST</div>`;
      case 'lsu':
        return `<div class="rt-lsu">LSU</div>`;
      case 'aiquiz':
        return `<div class="rt-aiquiz">AI QUIZ</div>`;
      case 'escapeca':
        return `<div class="rt-escapeca">ESCAPE CA</div>`;
      case 'tung':
        return `<div class="rt-tung">TALK TO TUNG</div>`;
      case 'gallery':
        return `<div class="rt-gallery">Pixel Art Gallery</div>`;
      case 'typefall':
        return `<div class="rt-typefall">typefall</div>`;
      case 'shaders':
        return `<div class="rt-shaders">lan4drcy</div>`;
      case 'atlas':
        return `<div class="rt-atlas">Atlas</div>`;
      case 'terrain':
        return `<div class="rt-terrain">Smooth Terrain Studio</div>`;
      case 'recommend':
        return `<div class="rt-recommend">Recommend</div>`;
      case 'channels':
        return `<div class="rt-channels"><span class="yt-play-pill">&#9654;</span>LLC Powered Channels</div>`;
      default:
        return `<div class="rt-default">${site.title}</div>`;
    }
  }

  /* ------------------------------------------------------------------------
     Pop-Out Characters & Props (Spring Out Past the Crack on Hover)
     ------------------------------------------------------------------------ */
  function pxSvg(rows, pal, w, h) {
    let rects = '';
    for (let y = 0; y < rows.length; y++) {
      const r = rows[y];
      for (let x = 0; x < r.length; x++) {
        const c = pal[r[x]];
        if (c) rects += `<rect x="${x}" y="${y}" width="1" height="1" fill="${c}"/>`;
      }
    }
    return `<svg viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges" aria-hidden="true">${rects}</svg>`;
  }

  function buildPopoutsHTML(site, assetBase) {
    const k = site.pop;
    if (k === 'ashaad') {
      return `
        <img class="pop-el pop-left pop-sprite" src="${assetBase}games/ashaad/ashaad.png" alt="" aria-hidden="true" />
        <img class="pop-el pop-right pop-sprite" src="${assetBase}games/ashaad/finley.png" alt="" aria-hidden="true" />
      `;
    }

    const PIX_POPS = {
      forge: {
        left: pxSvg([
          '........oo', '.......oGG', '......oGGo', '.....oGGo.', '....oGGo..',
          '..ooGGo...', '.oMMoo....', '..oBo.....', '.oBBo.....', 'oBBo......',
        ], { o: '#160a08', G: '#ffcf5c', M: '#ff7b24', B: '#8c5328' }, 10, 10),
        right: pxSvg([
          '....oo....', '...oCCo...', '..oCWWCo..', '.oCCWWCCo.',
          '.oCCCCCCo.', '..oCCCCo..', '...oCCo...', '....oo....',
        ], { o: '#0b2229', C: '#3ed4d8', W: '#d8ffff' }, 10, 8),
      },
      cast: {
        left: pxSvg([
          '....oooo....', '..ooTTTTto..', '.oTTWTTTTTo.', 'oTTBTTTTTTTo',
          '.oTTTTTTTTo.', '..ooTTTTto..', '....oooo....',
        ], { o: '#03182e', T: '#48cae4', t: '#1b8ab0', W: '#ffffff', B: '#04121f' }, 12, 7),
        right: pxSvg([
          '...oo...', '..oRRo..', '.oRRRRo.', '.oWWWWo.', '..oWWo..', '...oo...', '...o....', '...o....',
        ], { o: '#101820', R: '#e84848', W: '#ffffff' }, 8, 8),
      },
      mine: {
        left: pxSvg([
          '..oooooo..', '.oYYYYYYo.', '.oYBYBYBo.', '.oYYYYYYo.',
          '..oGGGGoo.', '.oGGGGGGGo', '.oGGYYGGGo', '..oo..oo..',
        ], { o: '#1a0e06', Y: '#ffd23a', B: '#0e1620', G: '#7a8a9c' }, 10, 8),
        right: pxSvg([
          '..ooooo...', '.oGGGGGoo.', 'oGGo..oBBo', 'oo....oBo.', '.....oBo..', '....oBo...', '...oBo....',
        ], { o: '#1a0e06', G: '#ffd23a', B: '#9a6234' }, 10, 7),
      },
      roguelike: {
        left: pxSvg([
          '....oo....', '...oCCo...', '..oCWWCo..', '.oCCCCCCo.',
          '.oCCBBCCo.', '.oCCCCCCo.', '..oCCCCo..', '...oooo...',
        ], { o: '#141a2b', C: '#7bc6ff', W: '#ffffff', B: '#2c5da8' }, 10, 8),
        right: pxSvg([
          '.oo....oo.', 'oYYo..oYYo', 'oYYYoYYYYo', 'oYRYRYRYRo', 'oYYYYYYYYo', '.oooooooo.',
        ], { o: '#261408', Y: '#ffd24c', R: '#e63946' }, 10, 6),
      },
      llccards: {
        left: pxSvg([
          'ooooooo...', 'oWWWWWo...', 'oWBBBWoooo', 'oWBBBWooWo',
          'oWWWWWoBWo', 'oWWWWWoWWo', 'oooooooWWo', '....oooooo',
        ], { o: '#000000', W: '#ffffff', B: '#111111' }, 10, 8),
        right: pxSvg([
          '...oo...', '..oWWo..', '.oWWWWo.', 'oWWWWWWo', '.oWWWWo.', '..oWWo..', '...oo...',
        ], { o: '#000000', W: '#ffffff' }, 8, 7),
      },
      aiquiz: {
        left: pxSvg([
          '....oo....', '.oooooooo.', 'oCCCCCCCCo', 'oCBBCCBBCo',
          'oCCCCCCCCo', 'oCCMMMMCCo', '.oooooooo.',
        ], { o: '#061428', C: '#7ef3ff', B: '#0a1430', M: '#ff5ad2' }, 10, 7),
        right: pxSvg([
          '..oooo..', '.oMMMMo.', 'oMMooMMo', '....oMMo', '...oMMo.', '........', '...oCCo.',
        ], { o: '#061428', M: '#ff5ad2', C: '#7ef3ff' }, 8, 7),
      },
      escapeca: {
        left: pxSvg([
          '..oooooo..', '.oWWWWWWo.', 'oWWWRRWWWo', 'oWWRRRRWWo', '.oWWWWWWo.', '..oooooo..',
        ], { o: '#14040a', W: '#f4e8ee', R: '#ff1a3a' }, 10, 6),
        right: pxSvg([
          '...oo...', '..oRRo..', '..oRRo..', '..oRRo..', '...oo...', '........', '..oRRo..',
        ], { o: '#1a040c', R: '#ff2840' }, 8, 7),
      },
      wam: {
        left: pxSvg([
          '.......oo', '......oWW', '.....oWWo', '....oWWo.', '...oWWo..',
          '.ooWWo...', 'oGGo.....', '.oBo.....', 'oBo......',
        ], { o: '#111914', W: '#eef6f0', G: '#ffd24c', B: '#8c5630' }, 9, 9),
        right: pxSvg([
          '..oooo..', '.oGGGGo.', 'oGWWWWGo', '.oGGGGo.', '...oBo..', '...oBo..', '...oBo..', '...oBo..',
        ], { o: '#111914', G: '#48c774', W: '#d8ffe4', B: '#7d4a26' }, 8, 8),
      },
      void: {
        left: pxSvg([
          '..oooo..', '.oWWWWo.', '.oWCCWo.', '.oWWWWo.', 'ooWWWWoo', '.oWWWWo.', '.oo..oo.',
        ], { o: '#140826', W: '#f4eeff', C: '#62d4ff' }, 8, 7),
        right: pxSvg([
          '...o....', '..oPo...', 'ooPWPoo.', '..oPo...', '...o....',
        ], { o: '#280d4a', P: '#c04df0', W: '#ffffff' }, 8, 5),
      },
      sea: {
        left: pxSvg([
          '...oo...', '...oCo..', '..oBBo..', '.oBWWBo.', '.oBPPBo.', '.oBPPBo.', '.oBBBBo.', '..oooo..',
        ], { o: '#031e4d', C: '#b87a44', B: '#7ae2f2', W: '#ffffff', P: '#f3dfae' }, 8, 8),
        right: pxSvg([
          '....oo....', '..ooWWoo..', '.oWWBBBBoo', 'oBBBBBBBB.',
        ], { o: '#031e4d', W: '#e6fbff', B: '#48cae4' }, 10, 4),
      },
      terra: {
        left: pxSvg([
          '....oooo....', '..ooGGGGoo..', '.oGGBBGGGGo.', 'oBBBGGBBBBBo',
          'oBBBBGGGGBBo', '.oBBBBGGGGo.', '..ooBBBBoo..', '....oooo....',
        ], { o: '#121826', G: '#6ab04c', B: '#3b82c4' }, 12, 8),
        right: pxSvg([
          '..o..', '.oYo.', 'oYWYo', '.oYo.', '..o..',
        ], { o: '#2b2010', Y: '#ffd55a', W: '#ffffff' }, 5, 5),
      },
      tung: {
        left: pxSvg([
          '.oooooo.', 'oBBBBBB.', 'oBWBWBB.', 'oBBBBBB.', 'oBooooB.', 'oBBBBBB.', '.oooooo.',
        ], { o: '#241206', B: '#c68a50', W: '#fff5e0' }, 8, 7),
        right: pxSvg([
          'o......o', 'oo.oo.oo', 'oooooooo', '.oooooo.', '..oooo..',
        ], { o: '#4a2a14' }, 8, 5),
      },
      pmuseum: {
        left: pxSvg([
          '...oo...', '..oCCo..', '.oCWWCo.', 'oCCCCCCo', '.oCCCCo.', '..oCCo..', '...oo...',
        ], { o: '#05222c', C: '#3ad8e0', W: '#d8ffff' }, 8, 7),
        right: pxSvg([
          'oYYYYo', '.oYYo.', '.oYYo.', 'oYYYYo', 'oooooo',
        ], { o: '#241806', Y: '#ffd24c' }, 6, 5),
      },
      ddom: {
        left: pxSvg([
          '.oo..oo.', 'oPPooPPo', '.oooooo.', '..oPPo..', '.oPPPPo.', '.oPPPPo.', '..oooo..',
        ], { o: '#2b1a10', P: '#e89b62' }, 8, 7),
        right: pxSvg([
          'oo..oo', 'oP..Po', '.oooo.', 'oPPPPo', '.oooo.',
        ], { o: '#2b1a10', P: '#f4c794' }, 6, 5),
      },
    };

    if (PIX_POPS[k]) {
      return `
        <span class="pop-el pop-left pop-pix">${PIX_POPS[k].left}</span>
        <span class="pop-el pop-right pop-pix">${PIX_POPS[k].right}</span>
      `;
    }

    const VEC_POPS = {
      gallery: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="3" y="4" width="22" height="20" rx="2" fill="#8c5a32" stroke="#5c381c" stroke-width="1.5"/><rect x="6.5" y="7.5" width="15" height="13" fill="#faf7f0"/><rect x="9" y="10" width="5" height="5" fill="#c84b31"/><rect x="14" y="10" width="5" height="5" fill="#f6d55c"/><rect x="9" y="15" width="10" height="4" fill="#388697"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 4l8 4.5v9L14 22l-8-4.5v-9L14 4z" fill="#ece7dc" stroke="#8c7a62" stroke-width="1.4"/><path d="M14 4v9l8-4.5M14 13l-8-4.5" stroke="#b5a58d" stroke-width="1.2"/></svg>',
      },
      atlas: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3c-4.4 0-8 3.5-8 7.8 0 5.8 8 14.2 8 14.2s8-8.4 8-14.2C22 6.5 18.4 3 14 3z" fill="#d64538" stroke="#ffffff" stroke-width="1.6"/><circle cx="14" cy="10.8" r="2.8" fill="#ffffff"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10" fill="#2b6cb0" stroke="#ffffff" stroke-width="1.5"/><path d="M8 11c2-2 5-1 6 1s3 3 6 1M9 17c2-1 4 0 5 2" stroke="#9ae6b4" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
      },
      terrain: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 22L11 8l5 7 3-4 6 11H3z" fill="#3a9d6e" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 11.5l2-3.5 2.4 3.4-2.2 1.2z" fill="#ffffff"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="9" fill="#68d391" stroke="#ffffff" stroke-width="1.5"/><circle cx="11" cy="11" r="2.5" fill="#d4fce4"/></svg>',
      },
      recommend: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><polygon points="14,3 17.2,10.2 25,11 19,16.2 20.8,24 14,19.8 7.2,24 9,16.2 3,11 10.8,10.2" fill="#f5c654" stroke="#523712" stroke-width="1.2"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="4" y="8" width="20" height="14" rx="2" fill="#231f1b" stroke="#e09f3e" stroke-width="1.5"/><path d="M4 12h20M8 8l2 4M14 8l2 4M20 8l2 4" stroke="#e09f3e" stroke-width="1.4"/></svg>',
      },
      typefall: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="#f7f2e7" stroke="#222" stroke-width="1.3"/><text x="14" y="19" text-anchor="middle" font-family="Times New Roman,serif" font-style="italic" font-size="16" fill="#111">a</text></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="#f7f2e7" stroke="#222" stroke-width="1.3"/><text x="14" y="19" text-anchor="middle" font-family="Times New Roman,serif" font-style="italic" font-size="15" fill="#111">g</text></svg>',
      },
      shaders: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><polygon points="14,2 25,14 14,26 3,14" fill="#081626" stroke="#3ad0f0" stroke-width="1.6"/><polygon points="14,7 20,14 14,21 8,14" fill="none" stroke="#d03af0" stroke-width="1.4"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="5" y="5" width="12" height="12" fill="none" stroke="#3ad0f0" stroke-width="1.5"/><rect x="11" y="11" width="12" height="12" fill="none" stroke="#ff7cf0" stroke-width="1.5"/></svg>',
      },
      lsu: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10.5" fill="#ff3d7f" stroke="#ffffff" stroke-width="2"/><text x="14" y="19" text-anchor="middle" font-family="Inter,sans-serif" font-weight="800" font-size="13" fill="#ffffff">1</text></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10" fill="none" stroke="#ff3d7f" stroke-width="2.2"/><circle cx="14" cy="14" r="4" fill="#ffffff"/></svg>',
      },
      channels: {
        left: '<svg viewBox="0 0 28 24" aria-hidden="true"><rect x="2" y="3" width="24" height="18" rx="5" fill="#ff0033" stroke="#ffffff" stroke-width="1.4"/><polygon points="11.5,8.2 18.5,12 11.5,15.8" fill="#ffffff"/></svg>',
        right: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="#ff0033" stroke="#ffffff" stroke-width="1.5"/><circle cx="12" cy="12" r="2.8" fill="#ffffff"/></svg>',
      },
    };

    const v = VEC_POPS[k];
    if (!v) return '';
    return `
      <span class="pop-el pop-left pop-vec">${v.left}</span>
      <span class="pop-el pop-right pop-vec">${v.right}</span>
    `;
  }

  /* ------------------------------------------------------------------------
     23 Deeply Authentic, Site-Specific Live Mini-World Animations
     ------------------------------------------------------------------------ */
  function hash(n) {
    const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return s - Math.floor(s);
  }

  function paintScene(canvas, scene, t, isPixel) {
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.imageSmoothingEnabled = !isPixel;

    switch (scene) {
      case 'ashaad': {
        // Real basement dungeon room + flickering corner torches + horizontal flying Isaac tears & splashes!
        ctx.fillStyle = '#3b200f';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2a1409';
        for (let y = 0; y < H; y += 11) {
          ctx.fillRect(0, y, W, 1);
          const off = ((y / 11) | 0) % 2 === 0 ? 0 : 8;
          for (let x = off; x < W; x += 16) ctx.fillRect(x, y, 1, 11);
        }
        // Flickering corner basement torches
        const fl = 0.8 + 0.2 * Math.sin(t * 11);
        for (const cx of [18, W - 20]) {
          const cy = H - 15;
          ctx.fillStyle = `rgba(255, 160, 48, ${0.26 * fl})`;
          ctx.fillRect(cx - 12, cy - 11, 24, 22);
          ctx.fillStyle = '#e8dcc0';
          ctx.fillRect(cx - 1, cy + 2, 3, 7);
          ctx.fillStyle = '#ff6a1a';
          ctx.fillRect(cx - 1, cy - 3, 3, 5);
          ctx.fillStyle = '#fff19c';
          ctx.fillRect(cx, cy - 2 - (((t * 7) | 0) % 2), 1, 2);
        }
        // Horizontal flying blue tears shooting across the dungeon & splashing!
        for (let i = 0; i < 4; i++) {
          const prog = (t * 0.55 + i * 0.27) % 1;
          const dir = i % 2 === 0 ? 1 : -1;
          const tx = Math.floor(dir > 0 ? 12 + prog * (W - 24) : W - 12 - prog * (W - 24));
          const ty = Math.floor(14 + (i * 11) % (H - 26) + Math.sin(prog * Math.PI) * -5);
          if (prog > 0.9) {
            ctx.fillStyle = '#a8ebff';
            ctx.fillRect(tx - 2, ty - 2, 1, 1);
            ctx.fillRect(tx + 2, ty - 1, 1, 1);
            ctx.fillRect(tx - 1, ty + 2, 1, 1);
          } else {
            ctx.fillStyle = '#48a8e8';
            ctx.fillRect(tx - 2, ty - 1, 4, 3);
            ctx.fillStyle = '#d8f6ff';
            ctx.fillRect(tx - 1, ty - 1, 2, 1);
          }
        }
        break;
      }

      case 'forge': {
        // Volcanic smithy hearth + glowing anvil + periodic hammer strike spark burst + cyan rune pulse!
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#160b10');
        g.addColorStop(0.55, '#3b1510');
        g.addColorStop(1, '#8c2d0e');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 1);
        // Hammer strike burst cadence every 1.4s on the left anvil
        const strike = (t * 0.72) % 1;
        const ax = 28, ay = H - 11;
        ctx.fillStyle = '#241a1d';
        ctx.fillRect(ax - 7, ay, 14, 4);
        ctx.fillRect(ax - 4, ay + 4, 8, 5);
        // Hot glowing ingot
        ctx.fillStyle = strike < 0.25 ? '#ffffff' : '#ff9830';
        ctx.fillRect(ax - 4, ay - 2, 8, 2);
        // Explosive sparks flying outward right after hammer strike
        if (strike < 0.65) {
          for (let i = 0; i < 10; i++) {
            const ang = -Math.PI * (0.15 + hash(i + 2) * 0.7);
            const spd = 16 + hash(i + 8) * 26;
            const sx = Math.floor(ax + Math.cos(ang) * spd * strike);
            const sy = Math.floor(ay - 2 + Math.sin(ang) * spd * strike + 26 * strike * strike);
            ctx.fillStyle = i % 3 === 0 ? '#ffffff' : '#ffbe42';
            ctx.fillRect(sx, sy, 2, 2);
          }
        }
        // Pulsing cyan enchantment rune on right
        const rp = 0.4 + 0.6 * Math.sin(t * 3.5);
        ctx.fillStyle = `rgba(62, 212, 216, ${rp * 0.5})`;
        ctx.fillRect(W - 34, Math.floor(H * 0.35), 14, 14);
        ctx.fillStyle = '#a8ffff';
        ctx.fillRect(W - 29, Math.floor(H * 0.35) + 5, 4, 4);
        // Rising forge embers
        for (let i = 0; i < 12; i++) {
          const x = Math.floor(hash(i * 3) * W + Math.sin(t * 2 + i) * 3);
          const y = Math.floor(H - ((t * (11 + (i % 4) * 3) + hash(i) * H) % (H + 4)));
          ctx.fillStyle = i % 2 === 0 ? '#ffd85c' : '#ff6b1a';
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      }

      case 'roguelike': {
        // Left: flickering crimson Isaac basement + blue tears | Right: Slay the Spire emerald energy & drifting relic cards!
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, '#301018');
        g.addColorStop(0.5, '#191124');
        g.addColorStop(1, '#0d2b24');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let y = 0; y < H; y += 9) for (let x = 0; x < W; x += 12) {
          if (((x + y) / 3) % 2 === 0) ctx.fillRect(x, y, 11, 8);
        }
        // Left side flying Isaac tears
        for (let i = 0; i < 4; i++) {
          const tx = Math.floor(10 + ((t * 26 + i * 22) % (W * 0.44)));
          const ty = Math.floor(12 + (i * 13) % (H - 22));
          ctx.fillStyle = '#78ceff';
          ctx.fillRect(tx, ty, 3, 2);
        }
        // Right side drifting Spire relic cards & emerald lightning sparks
        for (let i = 0; i < 4; i++) {
          const cx = Math.floor(W * 0.56 + hash(i + 3) * (W * 0.36));
          const cy = Math.floor(10 + hash(i + 7) * (H - 22) + Math.sin(t * 2.5 + i) * 3);
          ctx.fillStyle = '#4ae3b5';
          ctx.fillRect(cx, cy, 5, 7);
          ctx.fillStyle = '#122e28';
          ctx.fillRect(cx + 1, cy + 1, 3, 5);
          ctx.fillStyle = '#ffd24c';
          ctx.fillRect(cx + 2, cy + 3, 1, 1);
        }
        break;
      }

      case 'llccards': {
        // Hand-inked stark black-and-white TCG table with animated fanning & flipping monochrome cards!
        ctx.fillStyle = '#141418';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#222229';
        for (let x = -H; x < W + H; x += 10) {
          for (let y = 0; y < H; y += 2) ctx.fillRect(x + (y >> 1), y, 1, 1);
        }
        // Fanned flipping monochrome cards framing the outer left & right flanks
        for (let i = 0; i < 4; i++) {
          const side = i < 2 ? 9 + i * 9 : W - 27 + (i - 2) * 9;
          const bob = Math.round(Math.sin(t * 2.8 + i * 1.3) * 4);
          const cy = Math.floor(H * 0.30 + (i % 2) * 11 + bob);
          ctx.fillStyle = 'rgba(235, 235, 242, 0.68)';
          ctx.fillRect(side, cy, 7, 10);
          ctx.fillStyle = '#141418';
          ctx.fillRect(side + 1, cy + 1, 5, 8);
          ctx.fillStyle = 'rgba(235, 235, 242, 0.68)';
          ctx.fillRect(side + 3, cy + 3, 1, 4);
        }
        break;
      }

      case 'cast': {
        // Real dock fishing scene: dock planks, taut diagonal fishing line to bobbing red/white bobber, expanding ripples & darting fish!
        ctx.fillStyle = '#072240';
        ctx.fillRect(0, 0, W, Math.floor(H * 0.42));
        ctx.fillStyle = '#0d4772';
        ctx.fillRect(0, Math.floor(H * 0.42), W, H);
        // Twinkling twilight stars
        ctx.fillStyle = '#d8f6ff';
        for (let i = 0; i < 10; i++) ctx.fillRect(Math.floor(hash(i + 5) * W), Math.floor(hash(i + 12) * H * 0.35), 1, 1);
        // Wooden dock left
        ctx.fillStyle = '#734824';
        ctx.fillRect(0, Math.floor(H * 0.44), 26, 6);
        ctx.fillStyle = '#4e2e14';
        ctx.fillRect(6, Math.floor(H * 0.5), 3, H);
        ctx.fillRect(19, Math.floor(H * 0.5), 3, H);
        // Fishing rod tip + bobbing red-and-white bobber on the right!
        const bx = W - 34;
        const bite = Math.sin(t * 5.2) > 0.72 ? 2 : Math.round(Math.sin(t * 2.4));
        const by = Math.floor(H * 0.58) + bite;
        ctx.strokeStyle = 'rgba(220, 248, 255, 0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(25, Math.floor(H * 0.34));
        ctx.quadraticCurveTo(W * 0.46, Math.floor(H * 0.48), bx, by);
        ctx.stroke();
        // Expanding water ripple around bobber
        const rr = 3 + ((t * 10) % 10);
        ctx.fillStyle = 'rgba(130, 232, 248, 0.55)';
        ctx.fillRect(Math.floor(bx - rr), by + 2, Math.floor(rr * 2), 1);
        ctx.fillStyle = '#e84848';
        ctx.fillRect(bx - 1, by - 2, 3, 2);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(bx - 1, by, 3, 2);
        // Swimming fish silhouette gliding below surface
        const fx = Math.floor((t * 18) % (W + 16)) - 8;
        const fy = Math.floor(H * 0.78 + Math.sin(t * 3) * 2);
        ctx.fillStyle = '#2da8cc';
        ctx.fillRect(fx, fy, 7, 3);
        ctx.fillRect(fx - 2, fy - 1, 2, 5);
        break;
      }

      case 'mine': {
        // Active robot excavation shaft: yellow pixel robots rolling through tunnels with sweeping headlamp beams & sparkling ore!
        const bands = ['#3b2414', '#2e1b0f', '#23140b', '#190e07'];
        const bh = Math.ceil(H / bands.length);
        bands.forEach((c, idx) => { ctx.fillStyle = c; ctx.fillRect(0, idx * bh, W, bh); });
        // Two carved mine shafts
        const y1 = Math.floor(H * 0.24), y2 = Math.floor(H * 0.68);
        ctx.fillStyle = '#100805';
        ctx.fillRect(6, y1, W - 12, 11);
        ctx.fillRect(10, y2, W - 20, 11);
        // Tiny yellow mining robots driving back & forth with warm headlamp cones!
        const r1x = Math.floor(14 + ((t * 22) % (W - 32)));
        ctx.fillStyle = 'rgba(255, 236, 130, 0.25)';
        ctx.fillRect(r1x + 5, y1 + 1, 14, 8);
        ctx.fillStyle = '#ffd23a';
        ctx.fillRect(r1x, y1 + 3, 5, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(r1x + 4, y1 + 4, 2, 2);

        const r2x = Math.floor(W - 18 - ((t * 17 + 40) % (W - 34)));
        ctx.fillStyle = 'rgba(255, 236, 130, 0.25)';
        ctx.fillRect(r2x - 14, y2 + 1, 14, 8);
        ctx.fillStyle = '#e89b38';
        ctx.fillRect(r2x, y2 + 3, 5, 5);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(r2x - 1, y2 + 4, 2, 2);
        // Sparkling ore veins
        for (let i = 0; i < 14; i++) {
          const ox = Math.floor(hash(i + 2) * (W - 8) + 4);
          const oy = Math.floor(hash(i + 15) * (H - 6) + 3);
          ctx.fillStyle = i % 4 === 0 ? '#4ad4a8' : Math.sin(t * 5 + i) > 0.4 ? '#fff2a6' : '#e6a832';
          ctx.fillRect(ox, oy, 2, 2);
        }
        break;
      }

      case 'lsu': {
        // Real LSU rhythm gameplay: pink hit circles with shrinking white approach rings & snapping hit flashes!
        const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 10, W * 0.5, H * 0.5, W * 0.65);
        g.addColorStop(0, '#2e0824');
        g.addColorStop(1, '#0c030c');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        const spots = [[0.14, 0.36], [0.24, 0.72], [0.76, 0.34], [0.86, 0.68]];
        spots.forEach(([fx, fy], i) => {
          const cx = W * fx, cy = H * fy;
          const ph = (t * 1.15 + i * 0.27) % 1;
          const ar = 12 + (1 - ph) * 28;
          // Hit flash when approach ring reaches the inner circle
          if (ph > 0.88) {
            ctx.fillStyle = `rgba(255, 180, 210, ${(1 - ph) * 6})`;
            ctx.beginPath();
            ctx.arc(cx, cy, 22, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 + ph * 0.75})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, ar, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 61, 127, 0.35)';
          ctx.strokeStyle = '#ff3d7f';
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.arc(cx, cy, 12, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });
        break;
      }

      case 'aiquiz': {
        // Real AI vs Human split: crisp hand-crafted pixel landscape left vs. glitching neon neural grid right with sweeping scanner bar!
        const scanX = Math.floor(W * (0.5 + 0.34 * Math.sin(t * 1.15)));
        // Left: crisp handmade pixel sky & hills
        ctx.fillStyle = '#0e2846';
        ctx.fillRect(0, 0, scanX, H);
        ctx.fillStyle = '#1e5c4e';
        ctx.fillRect(0, Math.floor(H * 0.64), scanX, H);
        ctx.fillStyle = '#ffd85c';
        ctx.fillRect(18, 12, 6, 6);
        // Right: glitching magenta/cyan neural mesh
        ctx.fillStyle = '#1a0928';
        ctx.fillRect(scanX, 0, W - scanX, H);
        ctx.fillStyle = 'rgba(255, 90, 210, 0.14)';
        for (let x = scanX; x < W; x += 8) ctx.fillRect(x, 0, 1, H);
        for (let y = 0; y < H; y += 8) ctx.fillRect(scanX, y, W - scanX, 1);
        for (let i = 0; i < 10; i++) {
          const gx = scanX + Math.floor(hash(i + ((t * 4) | 0)) * Math.max(4, W - scanX - 4));
          const gy = Math.floor(hash(i + 9) * H);
          ctx.fillStyle = i % 2 === 0 ? '#ff5ad2' : '#57f0ff';
          ctx.fillRect(gx, gy, 5, 2);
        }
        // Bright glowing scanner bar separating Real vs AI
        ctx.fillStyle = '#8af4ff';
        ctx.fillRect(scanX - 1, 0, 2, H);
        break;
      }

      case 'escapeca': {
        // Real horror chase hallway: sweeping flashlight cone searching dark school lockers + flickering red alarm!
        ctx.fillStyle = '#100308';
        ctx.fillRect(0, 0, W, H);
        // School lockers lining both sides
        ctx.fillStyle = '#220b14';
        for (let x = 6; x < W - 6; x += 12) {
          ctx.fillRect(x, 10, 9, H - 16);
          ctx.fillStyle = '#14050b';
          ctx.fillRect(x + 2, 13, 5, 2);
          ctx.fillStyle = '#220b14';
        }
        // Sweeping flashlight beam moving back & forth down the corridor
        const lx = W * (0.5 + 0.34 * Math.sin(t * 1.4));
        const lg = ctx.createRadialGradient(lx, H * 0.5, 4, lx, H * 0.5, 42);
        lg.addColorStop(0, 'rgba(255, 236, 196, 0.32)');
        lg.addColorStop(0.6, 'rgba(255, 40, 70, 0.16)');
        lg.addColorStop(1, 'rgba(255, 40, 70, 0)');
        ctx.fillStyle = lg;
        ctx.fillRect(0, 0, W, H);
        // Red emergency light blink
        if (Math.sin(t * 9) > 0.3) {
          ctx.fillStyle = 'rgba(255, 24, 58, 0.22)';
          ctx.fillRect(0, 0, W, 6);
        }
        break;
      }

      case 'wam': {
        // Real W.A.M. pixel RPG battle: moving precision timing bar + warrior/archer/mage attack flashes!
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0a1914');
        g.addColorStop(0.68, '#163626');
        g.addColorStop(1, '#224f34');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Flying pixel archer arrow across upper field
        const arX = Math.floor((t * 48) % (W + 20)) - 10;
        ctx.fillStyle = '#f2e8cf';
        ctx.fillRect(arX, 14, 7, 1);
        ctx.fillStyle = '#48c774';
        ctx.fillRect(arX + 6, 13, 2, 3);
        // Timing bar along bottom with golden sweet-spot crit zone
        ctx.fillStyle = '#09120d';
        ctx.fillRect(20, H - 11, W - 40, 5);
        ctx.fillStyle = '#48c774';
        ctx.fillRect(Math.floor(W * 0.42), H - 11, Math.floor(W * 0.16), 5);
        ctx.fillStyle = '#ffd24c';
        ctx.fillRect(Math.floor(W * 0.48), H - 11, Math.floor(W * 0.04), 5);
        const curX = Math.floor(22 + ((Math.sin(t * 3.1) + 1) * 0.5) * (W - 46));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(curX, H - 12, 2, 7);
        break;
      }

      case 'void': {
        // Real Void galaxy: deep starfield, glowing purple gravity streams pulling pixels inward, and a tiny pixel spaceship gliding past!
        ctx.fillStyle = '#070212';
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 28; i++) {
          const tw = Math.sin(t * 3 + i * 2) > 0.3;
          ctx.fillStyle = i % 3 === 0 ? '#d8a6ff' : tw ? '#ffffff' : '#8a7ab0';
          ctx.fillRect(Math.floor(hash(i + 1) * W), Math.floor(hash(i + 17) * H), 1, 1);
        }
        // Spiraling gravity particles getting pulled into center black hole
        const cx = W * 0.5, cy = H * 0.56;
        for (let i = 0; i < 24; i++) {
          const pull = (t * 0.45 + hash(i + 4)) % 1;
          const dist = (1 - pull) * 76 + 10;
          const ang = pull * 4.5 + i * 1.1;
          ctx.fillStyle = i % 2 === 0 ? '#c04df0' : '#ff9cf0';
          ctx.fillRect(Math.floor(cx + Math.cos(ang) * dist), Math.floor(cy + Math.sin(ang) * dist * 0.36), 2, 2);
        }
        // Tiny pixel spaceship with cyan thruster gliding left-to-right near top!
        const sx = Math.floor((t * 22) % (W + 24)) - 12;
        const sy = Math.floor(12 + Math.sin(t * 2.5) * 3);
        ctx.fillStyle = '#57f0ff';
        ctx.fillRect(sx - 5, sy + 1, 5, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(sx, sy, 4, 3);
        ctx.fillRect(sx + 4, sy + 1, 2, 1);
        break;
      }

      case 'gallery': {
        // Real sunlit walkable Pixel Art Gallery: skylight rail, spotlight cones, framed wall painting, tiny easel, marble pedestal & strolling visitor!
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#ede7da');
        g.addColorStop(0.14, '#f8f4ec');
        g.addColorStop(0.75, '#efe8da');
        g.addColorStop(0.75, '#c9ae85');
        g.addColorStop(1, '#bda074');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#3c3630';
        ctx.fillRect(0, H * 0.11, W, 2.5);
        for (const frac of [0.2, 0.5, 0.8]) {
          const sx = W * frac;
          const cg = ctx.createRadialGradient(sx, H * 0.13, 2, sx, H * 0.58, H * 0.56);
          cg.addColorStop(0, 'rgba(255, 250, 224, 0.72)');
          cg.addColorStop(1, 'rgba(255, 250, 224, 0)');
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.moveTo(sx - 6, H * 0.12);
          ctx.lineTo(sx + 6, H * 0.12);
          ctx.lineTo(sx + 68, H * 0.78);
          ctx.lineTo(sx - 68, H * 0.78);
          ctx.closePath();
          ctx.fill();
        }
        // Left: framed mini painting on wall
        ctx.fillStyle = '#8c5a32';
        ctx.fillRect(W * 0.09, H * 0.28, 34, 34);
        ctx.fillStyle = '#faf7f0';
        ctx.fillRect(W * 0.09 + 4, H * 0.28 + 4, 26, 26);
        ctx.fillStyle = '#c84b31';
        ctx.fillRect(W * 0.09 + 8, H * 0.28 + 8, 9, 9);
        ctx.fillStyle = '#388697';
        ctx.fillRect(W * 0.09 + 8, H * 0.28 + 17, 18, 9);
        // Right: mini marble pedestal with golden voxel sculpture
        const px = W * 0.84;
        ctx.fillStyle = '#ebe4d6';
        ctx.fillRect(px - 12, H * 0.56, 24, H * 0.26);
        ctx.fillStyle = '#dfb44b';
        ctx.fillRect(px - 7, H * 0.42 + Math.sin(t * 2) * 1.5, 14, 14);
        // Tiny strolling visitor walking peacefully along the oak floor!
        const vx = W * (0.14 + ((t * 0.06) % 0.72));
        const vy = H * 0.72;
        ctx.fillStyle = '#2c2826';
        ctx.beginPath();
        ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#3b4d5e';
        ctx.fillRect(vx - 3, vy + 4, 6, 10);
        const leg = Math.sin(t * 8) * 2.5;
        ctx.strokeStyle = '#1b1a1d';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(vx - 1, vy + 14); ctx.lineTo(vx - 1 + leg, vy + 22);
        ctx.moveTo(vx + 1, vy + 14); ctx.lineTo(vx + 1 - leg, vy + 22);
        ctx.stroke();
        break;
      }

      case 'ddom': {
        // Real Maggie photo mosaic actively locking warm golden/caramel/espresso tiles into place with shimmering wave!
        const pal = ['#3a2518', '#5c3b24', '#8c5a36', '#b87a48', '#d99c64', '#f0cfa0', '#faf2e1', '#70492c'];
        const tile = 7;
        const waveX = ((t * 48) % (W + 40)) - 20;
        for (let y = 0; y < H; y += tile) {
          for (let x = 0; x < W; x += tile) {
            const idx = Math.floor(hash(x * 0.37 + y * 0.71) * pal.length);
            const near = Math.abs(x - waveX) < 14;
            ctx.fillStyle = near ? pal[Math.min(pal.length - 1, idx + 2)] : pal[idx];
            ctx.fillRect(x, y, tile - 1, tile - 1);
          }
        }
        ctx.fillStyle = 'rgba(26, 16, 10, 0.38)';
        ctx.fillRect(0, 0, W, H);
        break;
      }

      case 'typefall': {
        // Real falling-letter physics: cream paper with Times New Roman letters tumbling & gently bouncing at bottom!
        ctx.fillStyle = '#f7f2e7';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(20, 18, 16, 0.26)';
        ctx.font = 'italic 17px "Times New Roman", Times, serif';
        const chars = 'thequickbrownfoxjumpsoverthelazydog';
        for (let i = 0; i < 28; i++) {
          const x = hash(i + 3) * (W - 24) + 12;
          const fall = (t * (0.28 + (i % 5) * 0.08) + hash(i + 11)) % 1;
          const y = fall < 0.85
            ? (fall / 0.85) * (H - 18)
            : (H - 18) - Math.sin(((fall - 0.85) / 0.15) * Math.PI) * 9;
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(Math.sin(t * 1.5 + i) * 0.35);
          ctx.fillText(chars[i % chars.length], 0, 0);
          ctx.restore();
        }
        break;
      }

      case 'shaders': {
        // Real lan4drcy WebGL aesthetic: rotating 4D wireframe tesseract + cyan/magenta undulating shader wave contours!
        const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 8, W * 0.5, H * 0.5, W * 0.65);
        g.addColorStop(0, '#0c2038');
        g.addColorStop(1, '#040812');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Glowing interference contour waves
        for (let l = 0; l < 4; l++) {
          ctx.strokeStyle = l % 2 === 0 ? 'rgba(102, 240, 255, 0.18)' : 'rgba(255, 92, 240, 0.16)';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          for (let x = 0; x <= W; x += 10) {
            const y = H * (0.25 + l * 0.17) + Math.sin(x * 0.02 + t * (1.4 + l * 0.3) + l) * 14;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
        // Rotating 4D tesseract centered cleanly
        const a = t * 0.8, b = t * 0.5;
        const verts = [];
        for (let i = 0; i < 16; i++) {
          let x = i & 1 ? 1 : -1, y = i & 2 ? 1 : -1, z = i & 4 ? 1 : -1, w = i & 8 ? 1 : -1;
          const nx = x * Math.cos(a) - w * Math.sin(a);
          const nw = x * Math.sin(a) + w * Math.cos(a);
          const nz = z * Math.cos(b) - nw * Math.sin(b);
          const w2 = z * Math.sin(b) + nw * Math.cos(b);
          const k = 1 / (2.5 - w2 * 0.72);
          const rx = nx * k * Math.cos(b) + nz * k * Math.sin(b);
          const ry = y * k;
          verts.push([W * 0.5 + rx * 52, H * 0.5 + ry * 46, (w2 + 1) * 0.5]);
        }
        ctx.lineWidth = 1.4;
        for (let i = 0; i < 16; i++) {
          for (let bit = 0; bit < 4; bit++) {
            const j = i ^ (1 << bit);
            if (j <= i) continue;
            ctx.strokeStyle = verts[i][2] > 0.5 ? 'rgba(102, 240, 255, 0.48)' : 'rgba(255, 92, 240, 0.42)';
            ctx.beginPath();
            ctx.moveTo(verts[i][0], verts[i][1]);
            ctx.lineTo(verts[j][0], verts[j][1]);
            ctx.stroke();
          }
        }
        break;
      }

      case 'terra': {
        // Shared pixel solar system: twinkling starfield + glowing orbit rings + custom pixel planets!
        ctx.fillStyle = '#090e1a';
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 26; i++) {
          ctx.fillStyle = i % 3 === 0 ? '#ffe59c' : '#d6e4ff';
          ctx.fillRect(Math.floor(hash(i + 2) * W), Math.floor(hash(i + 13) * H), 1, 1);
        }
        ctx.strokeStyle = 'rgba(255, 232, 180, 0.14)';
        ctx.lineWidth = 1;
        for (const r of [34, 52, 68]) {
          ctx.beginPath();
          ctx.ellipse(W * 0.5, H * 0.52, r, r * 0.34, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        const orbs = [
          { r: 52, sp: 0.7, c1: '#6ab04c', c2: '#3b82c4', sz: 7 },
          { r: 34, sp: -1.1, c1: '#e87a4a', c2: '#ffd25c', sz: 6 },
          { r: 68, sp: 0.5, c1: '#a27cf0', c2: '#5ad0e6', sz: 6 },
        ];
        orbs.forEach((o, i) => {
          const px = Math.floor(W * 0.5 + Math.cos(t * o.sp + i * 2) * o.r);
          const py = Math.floor(H * 0.52 + Math.sin(t * o.sp + i * 2) * (o.r * 0.34));
          ctx.fillStyle = o.c2;
          ctx.fillRect(px - 3, py - 3, o.sz, o.sz);
          ctx.fillStyle = o.c1;
          ctx.fillRect(px - 2, py - 3, o.sz - 2, o.sz - 2);
        });
        break;
      }

      case 'tung': {
        // Night woodland silhouette + pulsing wooden drum shockwaves + fluttering tiny pixel bats!
        ctx.fillStyle = '#241208';
        ctx.fillRect(0, 0, W, H);
        // Expanding rhythmic drum shockwaves
        const beat = (t * 1.4) % 1;
        const cx = W * 0.5, cy = H * 0.52;
        for (let r = 82; r > 8; r -= 11) {
          ctx.strokeStyle = (r / 11 | 0) % 2 === 0 ? '#6e3f1c' : '#4a260e';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(cx, cy, r, r * 0.52, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.strokeStyle = `rgba(255, 224, 168, ${(1 - beat) * 0.55})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 12 + beat * 70, (12 + beat * 70) * 0.48, 0, 0, Math.PI * 2);
        ctx.stroke();
        // Fluttering tiny pixel bats
        for (let i = 0; i < 3; i++) {
          const bx = Math.floor((t * (20 + i * 6) + i * 50) % (W + 14)) - 7;
          const by = Math.floor(10 + i * 14 + Math.sin(t * 7 + i) * 3);
          const up = Math.sin(t * 12 + i) > 0;
          ctx.fillStyle = '#120804';
          ctx.fillRect(bx, by, 2, 2);
          ctx.fillRect(bx - 2, up ? by - 1 : by + 1, 2, 1);
          ctx.fillRect(bx + 2, up ? by - 1 : by + 1, 2, 1);
        }
        break;
      }

      case 'pmuseum': {
        // Illuminated dark-teal museum vault columns with floating glowing cyan crystal relics!
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#05141e');
        g.addColorStop(1, '#0c2d3a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(58, 216, 224, 0.13)';
        for (let x = 14; x < W; x += 28) ctx.fillRect(x, 0, 5, H);
        // Pedestals & bobbing glowing relics on flanks
        for (const rx of [22, W - 28]) {
          ctx.fillStyle = '#1c4f5e';
          ctx.fillRect(rx - 2, H - 14, 10, 14);
          const ry = Math.floor(H - 24 + Math.sin(t * 3 + rx) * 3);
          ctx.fillStyle = '#5cf6ff';
          ctx.fillRect(rx + 1, ry, 4, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(rx + 2, ry + 1, 2, 2);
        }
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = i % 3 === 0 ? '#ffd24c' : '#7ef8ff';
          ctx.fillRect(Math.floor(hash(i + 5) * W), Math.floor((H - (t * 8 + hash(i) * H) % H)), 2, 2);
        }
        break;
      }

      case 'sea': {
        // Starry pixel night sky + rolling turquoise ocean waves + bobbing pixel glass message bottles!
        ctx.fillStyle = '#031b4a';
        ctx.fillRect(0, 0, W, Math.floor(H * 0.44));
        ctx.fillStyle = '#073b7a';
        ctx.fillRect(0, Math.floor(H * 0.44), W, H);
        ctx.fillStyle = '#d8f4ff';
        for (let i = 0; i < 16; i++) ctx.fillRect(Math.floor(hash(i + 1) * W), Math.floor(hash(i + 8) * H * 0.36), 1, 1);
        // Bobbing message-in-a-bottle floating on the waves!
        for (const [bx0, ph] of [[24, 0], [W - 30, 2.2]]) {
          const by = Math.floor(H * 0.48 + Math.sin(t * 2.4 + ph) * 3);
          ctx.fillStyle = '#b87a44';
          ctx.fillRect(bx0 + 1, by - 2, 2, 2);
          ctx.fillStyle = '#8ef0ff';
          ctx.fillRect(bx0, by, 4, 6);
          ctx.fillStyle = '#f3dfae';
          ctx.fillRect(bx0 + 1, by + 2, 2, 3);
        }
        // Layered rolling waves
        for (let row = 0; row < 4; row++) {
          const baseY = Math.floor(H * 0.48 + row * 8);
          ctx.fillStyle = row === 0 ? '#7ae4f5' : row === 1 ? '#36a4d4' : '#1b6eb0';
          for (let x = 0; x < W; x += 4) {
            const wy = baseY + Math.round(Math.sin(x * 0.12 + t * (1.8 + row * 0.4) + row) * 2);
            ctx.fillRect(x, wy, 4, 2);
          }
        }
        break;
      }

      case 'atlas': {
        // Real spinning 3D Earth with back-side occluded red travel pins & connecting route arc!
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#f7fbff');
        g.addColorStop(1, '#dcebf9');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.strokeStyle = 'rgba(37, 99, 168, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 28; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 22; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        const gx = W * 0.8, gy = H * 0.52, gr = Math.min(H * 0.37, W * 0.14);
        const og = ctx.createRadialGradient(gx - gr * 0.32, gy - gr * 0.32, 3, gx, gy, gr);
        og.addColorStop(0, '#62aef0');
        og.addColorStop(0.7, '#2a6cb5');
        og.addColorStop(1, '#184273');
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.fill();
        ctx.save();
        ctx.beginPath();
        ctx.arc(gx, gy, gr, 0, Math.PI * 2);
        ctx.clip();
        ctx.fillStyle = '#6ec488';
        const span = gr * 3.4;
        const shift = (t * 15) % span;
        const lands = [
          [-0.9, -0.25, 0.45, 0.32, 0.2],
          [-0.55, 0.32, 0.28, 0.38, -0.15],
          [0.35, -0.28, 0.58, 0.34, 0.1],
          [0.48, 0.24, 0.34, 0.38, 0.25],
          [1.25, 0.28, 0.32, 0.22, -0.1],
        ];
        for (const wrap of [-span, 0, span]) {
          for (const [ox, oy, rw, rh, rot] of lands) {
            ctx.beginPath();
            ctx.ellipse(gx + ox * gr - shift + wrap + gr, gy + oy * gr, rw * gr, rh * gr, rot, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
        // Rotating travel pins that ONLY appear on the front hemisphere (just like the real Atlas site!)
        const pins = [[0.2, -0.25], [1.4, 0.15], [2.7, -0.1], [4.1, 0.22]];
        const visPts = [];
        for (const [lon0, lat] of pins) {
          const lon = lon0 + t * 0.65;
          const cz = Math.cos(lon);
          if (cz > 0.08) {
            const px = gx + Math.sin(lon) * gr * 0.85;
            const py = gy + lat * gr * 0.85;
            visPts.push([px, py]);
          }
        }
        if (visPts.length >= 2) {
          ctx.strokeStyle = 'rgba(214, 69, 56, 0.85)';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(visPts[0][0], visPts[0][1]);
          ctx.quadraticCurveTo((visPts[0][0] + visPts[1][0]) * 0.5, Math.min(visPts[0][1], visPts[1][1]) - 14, visPts[1][0], visPts[1][1]);
          ctx.stroke();
        }
        for (const [px, py] of visPts) {
          ctx.fillStyle = '#d64538';
          ctx.beginPath();
          ctx.arc(px, py, 3.6, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(px, py, 1.3, 0, Math.PI * 2);
          ctx.fill();
        }
        // Subtle dashed flight route leading from left margin into the globe
        ctx.strokeStyle = 'rgba(214, 69, 56, 0.42)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(W * 0.12, H * 0.72);
        ctx.quadraticCurveTo(W * 0.45, H * 0.15, gx - gr * 0.8, gy);
        ctx.stroke();
        ctx.setLineDash([]);
        break;
      }

      case 'terrain': {
        // Real 2.5D metaball terrain sculpting: smooth elevation bands gently sculpted by an invisible brush!
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#12292d');
        g.addColorStop(1, '#1d493e');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        const brushX = W * (0.5 + 0.34 * Math.sin(t * 0.85));
        const layers = [
          { y: 0.42, amp: 14, freq: 0.012, col: '#286452' },
          { y: 0.58, amp: 12, freq: 0.016, col: '#358565' },
          { y: 0.74, amp: 10, freq: 0.02, col: '#4fa87c' },
          { y: 0.88, amp: 7, freq: 0.024, col: '#84d9a3' },
        ];
        layers.forEach((L, idx) => {
          ctx.fillStyle = L.col;
          ctx.beginPath();
          ctx.moveTo(0, H);
          for (let x = 0; x <= W; x += 8) {
            const bulge = Math.exp(-Math.pow((x - brushX) / 72, 2)) * (16 - idx * 2.5);
            const yy = H * L.y - bulge + Math.sin(x * L.freq + idx * 1.4) * L.amp;
            ctx.lineTo(x, yy);
          }
          ctx.lineTo(W, H);
          ctx.closePath();
          ctx.fill();
        });
        break;
      }

      case 'recommend': {
        // Real cinema screening room: dual sweeping warm golden projector cones + scrolling film sprocket edges + dust motes!
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#171411');
        g.addColorStop(0.5, '#221a12');
        g.addColorStop(1, '#120f0d');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Dual sweeping warm projector spotlights
        for (const [phase, base] of [[0, 0.35], [2.4, 0.65]]) {
          const bx = W * (base + 0.16 * Math.sin(t * 0.75 + phase));
          const bg = ctx.createRadialGradient(bx, H * 0.25, 4, bx, H * 0.55, W * 0.35);
          bg.addColorStop(0, 'rgba(245, 200, 100, 0.26)');
          bg.addColorStop(1, 'rgba(245, 200, 100, 0)');
          ctx.fillStyle = bg;
          ctx.fillRect(0, 0, W, H);
        }
        // Scrolling vintage filmstrip sprockets top & bottom
        const spOff = (t * 22) % 24;
        ctx.fillStyle = 'rgba(245, 214, 142, 0.18)';
        for (let x = -24 + spOff; x < W + 24; x += 24) {
          ctx.fillRect(x, 8, 11, 5);
          ctx.fillRect(x, H - 13, 11, 5);
        }
        break;
      }

      case 'channels': {
        // Real live YouTube stats broadcast studio: live pulsing crimson equalizer + climbing view-count sparkline!
        ctx.fillStyle = '#141114';
        ctx.fillRect(0, 0, W, H);
        const bars = 28;
        const bw = W / bars;
        for (let i = 0; i < bars; i++) {
          const h = 10 + (Math.sin(t * 3.6 + i * 0.75) * 0.5 + 0.5) * (H * 0.42);
          ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 0, 51, 0.32)' : 'rgba(255, 80, 105, 0.16)';
          ctx.fillRect(i * bw + 2, H - h, bw - 4, h);
        }
        // Climbing live view sparkline
        ctx.strokeStyle = 'rgba(255, 58, 92, 0.65)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 14) {
          const u = x / W;
          const y = H * (0.76 - u * 0.42) + Math.sin(u * 10 - t * 2.5) * 6;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
      }

      default:
        ctx.fillStyle = '#18181c';
        ctx.fillRect(0, 0, W, H);
    }
  }

  /* ------------------------------------------------------------------------
     Viewport-Culled Animation Manager
     ------------------------------------------------------------------------ */
  let activeCanvases = [];
  let rafId = null;
  let lastPaint = 0;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sizeCanvas(item) {
    if (item.isPixel) {
      if (item.canvas.width !== 160) {
        item.canvas.width = 160;
        item.canvas.height = 60;
      }
      return;
    }
    const r = item.el.getBoundingClientRect();
    const tw = Math.max(240, Math.round(r.width || 560));
    const th = Math.max(110, Math.round(r.height || 170));
    if (Math.abs(item.canvas.width - tw) > 4 || Math.abs(item.canvas.height - th) > 4) {
      item.canvas.width = tw;
      item.canvas.height = th;
    }
  }

  function tick(now) {
    if (!document.hidden && now - lastPaint >= 50) {
      lastPaint = now;
      const t = now / 1000;
      const vh = window.innerHeight;
      for (const item of activeCanvases) {
        const r = item.el.getBoundingClientRect();
        if (r.bottom < -60 || r.top > vh + 60) continue;
        sizeCanvas(item);
        paintScene(item.canvas, item.scene, t, item.isPixel);
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function reset() {
    activeCanvases = [];
  }

  function register(cardEl, canvas, site) {
    const item = { el: cardEl, canvas, scene: site.scene, isPixel: site.pixel };
    if (site.pixel) {
      canvas.width = 160;
      canvas.height = 60;
    } else {
      canvas.width = 560;
      canvas.height = 170;
    }
    requestAnimationFrame(() => {
      sizeCanvas(item);
      paintScene(canvas, site.scene, 0.4, site.pixel);
    });
    if (!reducedMotion) {
      activeCanvases.push(item);
      if (!rafId) rafId = requestAnimationFrame(tick);
    }
  }

  return {
    buildCrackGeometry,
    buildTitleHTML,
    buildPopoutsHTML,
    reset,
    register,
  };
})();

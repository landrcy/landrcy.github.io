/* ==========================================================================
   llc-rifts.js — Bold Blocky Rift Silhouettes (Zero Thin Cracks),
   Authentic Site-Matched Live Mini-Worlds, Real Satellite Earth,
   2.5D Smooth Terrain, Animated Fractal, Street Museum, Cozy Couch Living Room,
   Animated THE VOID Logo & Site-Inspired Pop-Out Icons
   ========================================================================== */

window.LLCRifts = (() => {
  /* ------------------------------------------------------------------------
     Deterministic PRNG & Bold Blocky / Angular Rift Geometry
     Clean, chunky blocky pixel-stepped cracks (for pixel sites) and bold
     angular torn rifts (for smooth sites) — ZERO spindly thin hairline veins!
     Coordinate space: 600 x 200 (portal), SVG overflows [-24..624] x [-20..220]
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

  // Convert polyline to crisp chunky 90-degree pixel staircase segments
  function stepify(pts, stepX = 12, stepY = 10) {
    const out = [];
    for (let i = 0; i < pts.length; i++) {
      const p = [quant(pts[i][0], stepX), quant(pts[i][1], stepY)];
      if (!out.length) {
        out.push(p);
        continue;
      }
      const prev = out[out.length - 1];
      if (prev[0] === p[0] && prev[1] === p[1]) continue;
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
    const isPx = !!site.pixel;

    let poly;

    if (isPx) {
      // Chunky, bold blocky pixel-stepped rift (inspired by the beloved blocky style,
      // with bigger bold notched corners & deep pixel bites — zero thin hairlines!)
      const topNotch = 2 + Math.floor(r() * 4); // index of a bigger top crack notch
      const botNotch = 2 + Math.floor(r() * 4);
      const segs = 9;
      const topPts = [];
      const botPts = [];

      const leftIn = 12 + Math.floor(r() * 2) * 12;
      const rightIn = W - 12 - Math.floor(r() * 2) * 12;
      const leftMidY = 70 + Math.floor(r() * 5) * 10;
      const rightMidY = 70 + Math.floor(r() * 5) * 10;

      for (let i = 1; i < segs; i++) {
        const u = i / segs;
        const x = leftIn + u * (rightIn - leftIn);
        let y = 10 + Math.floor(r() * 2) * 10;
        if (i === 1 || i === segs - 1) y += 10;
        if (i === topNotch) y = 30; // bigger bold blocky crack notch!
        topPts.push([x, y]);
      }
      for (let i = segs - 1; i >= 1; i--) {
        const u = i / segs;
        const x = leftIn + u * (rightIn - leftIn);
        let y = H - 10 - Math.floor(r() * 2) * 10;
        if (i === 1 || i === segs - 1) y -= 10;
        if (i === botNotch) y = H - 30; // bigger bold blocky crack notch!
        botPts.push([x, y]);
      }

      const raw = [
        [0, leftMidY],
        [leftIn, Math.max(20, leftMidY - 40)],
        ...topPts,
        [rightIn, Math.max(20, rightMidY - 40)],
        [W, rightMidY],
        [rightIn, Math.min(H - 20, rightMidY + 40)],
        ...botPts,
        [leftIn, Math.min(H - 20, leftMidY + 40)],
      ];
      poly = stepify(raw, 12, 10);
    } else {
      // Bold, clean angular torn rift (strong geometric facets + 1-2 big wide crack notches)
      const segs = 10;
      const leftY = 82 + r() * 36;
      const rightY = 82 + r() * 36;
      const topBite = 2 + Math.floor(r() * 5);
      const botBite = 2 + Math.floor(r() * 5);

      const topPts = [];
      const botPts = [];
      for (let i = 1; i < segs; i++) {
        const u = i / segs + (r() - 0.5) * 0.035;
        const x = 18 + u * (W - 36);
        let y = 10 + r() * 12;
        if (i === 1 || i === segs - 1) y += 10;
        if (i === topBite) y = 29 + r() * 5;
        topPts.push([x, y]);
      }
      for (let i = segs - 1; i >= 1; i--) {
        const u = i / segs + (r() - 0.5) * 0.035;
        const x = 18 + u * (W - 36);
        let y = H - 10 - r() * 12;
        if (i === 1 || i === segs - 1) y -= 10;
        if (i === botBite) y = H - 29 - r() * 5;
        botPts.push([x, y]);
      }

      poly = [
        [4, leftY],
        [24, Math.max(18, leftY - 44)],
        ...topPts,
        [W - 24, Math.max(18, rightY - 44)],
        [W - 4, rightY],
        [W - 24, Math.min(H - 18, rightY + 44)],
        ...botPts,
        [24, Math.min(H - 18, leftY + 44)],
      ].map(([x, y]) => [Math.round(x * 10) / 10, Math.round(y * 10) / 10]);
    }

    const clipPolygon =
      'polygon(' +
      poly.map(([x, y]) => `${((x / W) * 100).toFixed(2)}% ${((y / H) * 100).toFixed(2)}%`).join(', ') +
      ')';

    const polyPath =
      'M ' + poly.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';

    // 4 chunky detached floating corner blocks/shards (bigger & cleaner, zero thin lines!)
    const shards = [];
    const shardSpots = [
      [12 + r() * 18, 6 - r() * 12],
      [W - 22 - r() * 18, 6 - r() * 12],
      [16 + r() * 20, H - 6 + r() * 12],
      [W - 26 - r() * 20, H - 6 + r() * 12],
    ];
    for (let k = 0; k < shardSpots.length; k++) {
      const [sx, sy] = shardSpots[k];
      const cls = k % 2 === 0 ? 'rift-shard is-accent' : 'rift-shard is-dark';
      if (isPx) {
        const sz = 7 + Math.floor(r() * 5);
        shards.push(`<rect class="${cls}" x="${quant(sx, 2)}" y="${quant(sy, 2)}" width="${sz}" height="${sz}" />`);
      } else {
        const s1 = 6 + r() * 5;
        const s2 = 5 + r() * 5;
        const a1 = r() * Math.PI * 2;
        const p1 = [sx + Math.cos(a1) * s1, sy + Math.sin(a1) * s1];
        const p2 = [sx + Math.cos(a1 + 2.2) * s2, sy + Math.sin(a1 + 2.2) * s2];
        const p3 = [sx + Math.cos(a1 + 4.3) * (s1 * 0.85), sy + Math.sin(a1 + 4.3) * (s1 * 0.85)];
        shards.push(`<polygon class="${cls}" points="${p1[0].toFixed(1)},${p1[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)} ${p3[0].toFixed(1)},${p3[1].toFixed(1)}" />`);
      }
    }

    const svgMarkup = `
      <svg class="rift-fracture-svg" viewBox="-24 -20 648 240" preserveAspectRatio="none" aria-hidden="true">
        <g class="crack-shards">${shards.join('')}</g>
        <path class="crack-outline-dark" d="${polyPath}" fill="none" stroke-width="${isPx ? 5 : 4}" stroke-linejoin="${isPx ? 'miter' : 'round'}" />
        <path class="crack-outline-glow" d="${polyPath}" fill="none" stroke-width="${isPx ? 3.2 : 2.6}" stroke-linejoin="${isPx ? 'miter' : 'round'}" />
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
     Equalized BIG Authentic In-Game Titles (Zero Descriptions)
     ------------------------------------------------------------------------ */
  function buildTitleHTML(site, assetBase) {
    if (site.titleStyle === 'void-anim' && site.titleImg) {
      return `
        <div class="void-title-anim">
          <div class="void-title-aura" aria-hidden="true"></div>
          <img class="rift-title-img tall void-logo-img" src="${assetBase}${site.titleImg}" alt="${site.title}" draggable="false" />
        </div>
      `;
    }
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
      case 'aiquiz':
        return `<div class="rt-aiquiz">AI QUIZ</div>`;
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
     Site-Inspired Pop-Out Pixel & Vector Characters/Props
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
      roguelike: {
        // Isaac golden crown & Slay the Spire emerald energy orb
        left: pxSvg([
          '.oo....oo.', 'oYYo..oYYo', 'oYYYoYYYYo', 'oYRYRYRYRo', 'oYYYYYYYYo', '.oooooooo.',
        ], { o: '#1f1208', Y: '#e4ab49', R: '#d85042' }, 10, 6),
        right: pxSvg([
          '...oooo...', '.ooGGGGoo.', 'oGGWWWWGGo', 'oGWWGGWWGo', 'oGGGGGGGGo', '.ooGGGGoo.', '...oooo...',
        ], { o: '#0d2618', G: '#5fc27c', W: '#e4ffe8' }, 10, 7),
      },
      llccards: {
        // Hand-inked black-and-white LLC Cards deck with crimson #e01b1b emblem
        left: pxSvg([
          'ooooooo...', 'oWWWWWo...', 'oWWRWWoooo', 'oWRRRWooWo',
          'oWWRWWoRWo', 'oWWWWWoWWo', 'oooooooWWo', '....oooooo',
        ], { o: '#000000', W: '#ffffff', R: '#e01b1b' }, 10, 8),
        right: pxSvg([
          '...oo...', '..oRRo..', '.oRRRRo.', 'oRRWWRRo', '.oRRRRo.', '..oRRo..', '...oo...',
        ], { o: '#000000', R: '#e01b1b', W: '#ffffff' }, 8, 7),
      },
      mine: {
        // Mining headlamp robot & gold pickaxe
        left: pxSvg([
          '..oooooo..', '.oYYYYYYo.', '.oYBYBYBo.', '.oYYYYYYo.',
          '..oPPPPoo.', '.oPPPPPPPo', '.oPPYYPPPo', '..oo..oo..',
        ], { o: '#0c0910', Y: '#ffd23a', B: '#100e12', P: '#7a7288' }, 10, 8),
        right: pxSvg([
          '..ooooo...', '.oCCCCCoo.', 'oCCo..oBBo', 'oo....oBo.', '.....oBo..', '....oBo...', '...oBo....',
        ], { o: '#0c0910', C: '#7fd0ff', B: '#9a6234' }, 10, 7),
      },
      aiquiz: {
        // Cyan/magenta pixel bot & glitch question mark
        left: pxSvg([
          '....oo....', '.oooooooo.', 'oCCCCCCCCo', 'oCBBCCBBCo',
          'oCCCCCCCCo', 'oCCMMMMCCo', '.oooooooo.',
        ], { o: '#05060f', C: '#57f0ff', B: '#080a18', M: '#ff5ad2' }, 10, 7),
        right: pxSvg([
          '..oooo..', '.oMMMMo.', 'oMMooMMo', '....oMMo', '...oMMo.', '........', '...oGGo.',
        ], { o: '#05060f', M: '#ff5ad2', G: '#7dff8f' }, 8, 7),
      },
      wam: {
        // Pixel sword & archery target shield
        left: pxSvg([
          '.......oo', '......oWW', '.....oWWo', '....oWWo.', '...oWWo..',
          '.ooWWo...', 'oGGo.....', '.oBo.....', 'oBo......',
        ], { o: '#0a140f', W: '#eef6f0', G: '#ffd24c', B: '#8c5630' }, 9, 9),
        right: pxSvg([
          '..oooo..', '.oGGGGo.', 'oGWWWWGo', '.oGGGGo.', '...oBo..', '...oBo..', '...oBo..', '...oBo..',
        ], { o: '#0a140f', G: '#48c774', W: '#d8ffe4', B: '#7d4a26' }, 8, 8),
      },
      void: {
        // Void starship & violet event-horizon star
        left: pxSvg([
          '..oooo..', '.oWWWWo.', '.oWCCWo.', '.oWWWWo.', 'ooWWWWoo', '.oWWWWo.', '.oo..oo.',
        ], { o: '#140826', W: '#f4eeff', C: '#62d4ff' }, 8, 7),
        right: pxSvg([
          '...o....', '..oPo...', 'ooPWPoo.', '..oPo...', '...o....',
        ], { o: '#280d4a', P: '#c04df0', W: '#ffffff' }, 8, 5),
      },
      sea: {
        // Message bottle & turquoise wave crest
        left: pxSvg([
          '...oo...', '...oCo..', '..oBBo..', '.oBWWBo.', '.oBPPBo.', '.oBPPBo.', '.oBBBBo.', '..oooo..',
        ], { o: '#031e4d', C: '#b87a44', B: '#7ae2f2', W: '#ffffff', P: '#f3dfae' }, 8, 8),
        right: pxSvg([
          '....oo....', '..ooWWoo..', '.oWWBBBBoo', 'oBBBBBBBB.',
        ], { o: '#031e4d', W: '#e6fbff', B: '#48cae4' }, 10, 4),
      },
      terra: {
        // Sunlit pixel grass-earth sandbox block & sparkling crystal
        left: pxSvg([
          'oooooooo', 'oGGGGGG0', 'oGggggGo', 'oBBgBBBo', 'oBBCBBBo', 'oBBBBYBo', 'oBBBBbBo', 'oooooooo',
        ], { o: '#1b140c', G: '#62d95c', g: '#3ea83e', B: '#b87644', b: '#875029', C: '#7ff2ff', Y: '#ffd55a', 0: '#1b140c' }, 8, 8),
        right: pxSvg([
          '...oo...', '..oCCo..', '.oCWWCo.', 'oCCCCCCo', '.oCCCCo.', '..oCCo..', '...oo...',
        ], { o: '#0e2838', C: '#66f0ff', W: '#ffffff' }, 8, 7),
      },
      pmuseum: {
        // Classical stone museum column & golden framed pixel painting (NO robot!)
        left: pxSvg([
          'oooooooo', 'oSSSSSSo', '.oSwSwo.', '.oSwSwo.', '.oSwSwo.', '.oSwSwo.', 'oSSSSSSo', 'oooooooo',
        ], { o: '#111d30', S: '#d8e4f0', w: '#9fb4cc' }, 8, 8),
        right: pxSvg([
          'oooooooo', 'oGGGGGG0', 'oGBBBbGo', 'oGBYYbGo', 'oGCCCCGo', 'oGGGGGG0', 'oooooooo',
        ], { o: '#1a140c', G: '#ffd24c', B: '#3a7bd5', b: '#2b5ca8', Y: '#fff08a', C: '#58e2ec', 0: '#1a140c' }, 8, 7),
      },
      ddom: {
        // Warm terracotta Maggie paw & heart photo frame
        left: pxSvg([
          '.oo..oo.', 'oPPooPPo', '.oooooo.', '..oPPo..', '.oPPPPo.', '.oPPPPo.', '..oooo..',
        ], { o: '#2b1a10', P: '#e89b62' }, 8, 7),
        right: pxSvg([
          'oooooooo', 'oWWWWWWo', 'oWPWWPWo', 'oWPPPPWo', 'oWWPPWWo', 'oWWWWWWo', 'oooooooo',
        ], { o: '#2b1a10', W: '#fdfaf5', P: '#c46835' }, 8, 7),
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
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M14 3c-4.4 0-8 3.5-8 7.8 0 5.8 8 14.2 8 14.2s8-8.4 8-14.2C22 6.5 18.4 3 14 3z" fill="#d94f30" stroke="#ffffff" stroke-width="1.6"/><circle cx="14" cy="10.8" r="2.8" fill="#ffffff"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="10" fill="#1d5b96" stroke="#ffffff" stroke-width="1.5"/><path d="M8 11c2-2 5-1 6 1s3 3 6 1M9 17c2-1 4 0 5 2" stroke="#76c47e" stroke-width="2.4" fill="none" stroke-linecap="round"/></svg>',
      },
      terrain: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M3 20l7-11 5 6 4-5 6 10H3z" fill="#78a363" stroke="#ffffff" stroke-width="1.4" stroke-linejoin="round"/><path d="M3 20h22v4H3z" fill="#986b47"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><ellipse cx="14" cy="17" rx="10" ry="6" fill="#565452" stroke="#ffffff" stroke-width="1.4"/><ellipse cx="14" cy="13" rx="10" ry="6" fill="#888684" stroke="#ffffff" stroke-width="1.2"/></svg>',
      },
      recommend: {
        // Midnight-indigo movie clapper & cozy open book
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><rect x="4" y="8" width="20" height="14" rx="2" fill="#182a54" stroke="#7aa4ff" stroke-width="1.5"/><path d="M4 12h20M8 8l2 4M14 8l2 4M20 8l2 4" stroke="#ffd875" stroke-width="1.5"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><path d="M4 8c3.5-1.5 7-1.5 10 0 3-1.5 6.5-1.5 10 0v13c-3.5-1.5-7-1.5-10 0-3-1.5-6.5-1.5-10 0V8z" fill="#eef4ff" stroke="#4c6fc4" stroke-width="1.5"/><path d="M14 8v13" stroke="#4c6fc4" stroke-width="1.4"/></svg>',
      },
      typefall: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="#f7f2e7" stroke="#222" stroke-width="1.3"/><text x="14" y="19" text-anchor="middle" font-family="Times New Roman,serif" font-style="italic" font-size="16" fill="#111">a</text></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><circle cx="14" cy="14" r="11" fill="#f7f2e7" stroke="#222" stroke-width="1.3"/><text x="14" y="19" text-anchor="middle" font-family="Times New Roman,serif" font-style="italic" font-size="15" fill="#111">g</text></svg>',
      },
      shaders: {
        left: '<svg viewBox="0 0 28 28" aria-hidden="true"><polygon points="14,2 25,14 14,26 3,14" fill="#060c1c" stroke="#66f0ff" stroke-width="1.6"/><polygon points="14,7 20,14 14,21 8,14" fill="none" stroke="#ff5cf0" stroke-width="1.5"/><polygon points="14,11 17,14 14,17 11,14" fill="#66f0ff"/></svg>',
        right: '<svg viewBox="0 0 28 28" aria-hidden="true"><polygon points="14,3 24,22 4,22" fill="none" stroke="#66f0ff" stroke-width="1.6"/><polygon points="14,11 19,20 9,20" fill="none" stroke="#ff5cf0" stroke-width="1.4"/></svg>',
      },
      channels: {
        left: '<svg viewBox="0 0 28 24" aria-hidden="true"><rect x="2" y="3" width="24" height="18" rx="5" fill="#ff0033" stroke="#ffffff" stroke-width="1.4"/><polygon points="11.5,8.2 18.5,12 11.5,15.8" fill="#ffffff"/></svg>',
        right: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" fill="#38e1d0" stroke="#ffffff" stroke-width="1.5"/><circle cx="12" cy="12" r="2.8" fill="#07050f"/></svg>',
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
     Real Satellite Earth Texture Loader (for Atlas) & Fractal Offscreen Buffer
     ------------------------------------------------------------------------ */
  let earthTexData = null;
  let earthTexW = 0;
  let earthTexH = 0;
  let earthLoadedBase = null;
  let globeBuf = null;
  let globeCtx = null;
  let globeImg = null;
  const GLOBE_SZ = 112;

  function ensureEarthTexture(assetBase) {
    if (earthLoadedBase === assetBase) return;
    earthLoadedBase = assetBase;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const c = document.createElement('canvas');
      c.width = img.naturalWidth || 360;
      c.height = img.naturalHeight || 180;
      const g = c.getContext('2d');
      g.drawImage(img, 0, 0, c.width, c.height);
      try {
        const id = g.getImageData(0, 0, c.width, c.height);
        earthTexData = id.data;
        earthTexW = c.width;
        earthTexH = c.height;
      } catch (_) {}
    };
    img.src = `${assetBase}world/titles/earth-tex.jpg`;
  }

  function renderRealisticGlobe(t) {
    if (!globeBuf) {
      globeBuf = document.createElement('canvas');
      globeBuf.width = GLOBE_SZ;
      globeBuf.height = GLOBE_SZ;
      globeCtx = globeBuf.getContext('2d');
      globeImg = globeCtx.createImageData(GLOBE_SZ, GLOBE_SZ);
    }
    const out = globeImg.data;
    const half = GLOBE_SZ * 0.5;
    const invR = 1 / (half - 2);
    const rot = t * 0.28;
    // Directional sunlight from upper-left-front
    const lx = -0.45, ly = -0.35, lz = 0.82;

    for (let py = 0; py < GLOBE_SZ; py++) {
      const ny = (py + 0.5 - half) * invR;
      const ny2 = ny * ny;
      for (let px = 0; px < GLOBE_SZ; px++) {
        const nx = (px + 0.5 - half) * invR;
        const r2 = nx * nx + ny2;
        const idx = (py * GLOBE_SZ + px) * 4;
        if (r2 >= 1) {
          out[idx + 3] = 0;
          continue;
        }
        const nz = Math.sqrt(1 - r2);
        // Spherical coordinates (tilt slightly ~16 deg so northern continents show clearly)
        const tilt = 0.26;
        const ty = ny * Math.cos(tilt) - nz * Math.sin(tilt);
        const tz = ny * Math.sin(tilt) + nz * Math.cos(tilt);
        const lat = Math.asin(Math.max(-1, Math.min(1, -ty)));
        const lon = Math.atan2(nx, tz) + rot;

        let sr = 32, sg = 92, sb = 158;
        if (earthTexData) {
          let u = (lon / (Math.PI * 2) + 0.5) % 1;
          if (u < 0) u += 1;
          const v = 0.5 - lat / Math.PI;
          const tx = Math.min(earthTexW - 1, Math.max(0, (u * earthTexW) | 0));
          const tyi = Math.min(earthTexH - 1, Math.max(0, (v * earthTexH) | 0));
          const tidx = (tyi * earthTexW + tx) * 4;
          sr = earthTexData[tidx];
          sg = earthTexData[tidx + 1];
          sb = earthTexData[tidx + 2];
        }

        // Subtle animated drifting cloud wisps
        const cloudN = Math.sin(lon * 3.4 - t * 0.14 + Math.cos(lat * 5.2) * 1.4) * Math.cos(lat * 4.3 + lon * 2.1);
        const cloud = cloudN > 0.52 ? Math.min(0.46, (cloudN - 0.52) * 1.1) : 0;
        sr = sr * (1 - cloud) + 245 * cloud;
        sg = sg * (1 - cloud) + 250 * cloud;
        sb = sb * (1 - cloud) + 255 * cloud;

        // Soft Lambertian daylight shading + subtle atmospheric blue Fresnel rim
        const ndotl = Math.max(0, nx * lx + ny * ly + nz * lz);
        const shade = 0.42 + 0.72 * ndotl;
        const rim = Math.pow(1 - nz, 2.6);

        let fr = sr * shade + 76 * rim;
        let fg = sg * shade + 158 * rim;
        let fb = sb * shade + 242 * rim;

        // Crisp anti-aliased sphere edge
        const edgeA = r2 > 0.94 ? Math.max(0, Math.min(1, (1 - Math.sqrt(r2)) / 0.03)) : 1;
        out[idx] = Math.min(255, fr) | 0;
        out[idx + 1] = Math.min(255, fg) | 0;
        out[idx + 2] = Math.min(255, fb) | 0;
        out[idx + 3] = (edgeA * 255) | 0;
      }
    }
    globeCtx.putImageData(globeImg, 0, 0);
    return globeBuf;
  }

  // Real-time animated Julia Set Fractal buffer (for lan4drcy)
  let fracBuf = null;
  let fracCtx = null;
  let fracImg = null;
  const FRAC_W = 132;
  const FRAC_H = 52;

  function renderFractalBuffer(t) {
    if (!fracBuf) {
      fracBuf = document.createElement('canvas');
      fracBuf.width = FRAC_W;
      fracBuf.height = FRAC_H;
      fracCtx = fracBuf.getContext('2d');
      fracImg = fracCtx.createImageData(FRAC_W, FRAC_H);
    }
    const data = fracImg.data;
    // Smoothly orbit classic electric Julia fractal parameter
    const ang = t * 0.42;
    const cr = -0.745 + 0.095 * Math.cos(ang);
    const ci = 0.185 + 0.095 * Math.sin(ang * 1.15);
    const scale = 1.48 + 0.18 * Math.sin(t * 0.55);
    const maxIter = 26;

    for (let py = 0; py < FRAC_H; py++) {
      const zy0 = ((py / FRAC_H) - 0.5) * 2.0 * scale;
      for (let px = 0; px < FRAC_W; px++) {
        const zx0 = ((px / FRAC_W) - 0.5) * 3.4 * scale;
        let zx = zx0;
        let zy = zy0;
        let iter = 0;
        let zx2 = zx * zx;
        let zy2 = zy * zy;
        while (zx2 + zy2 < 4.0 && iter < maxIter) {
          zy = 2 * zx * zy + ci;
          zx = zx2 - zy2 + cr;
          zx2 = zx * zx;
          zy2 = zy * zy;
          iter++;
        }
        const idx = (py * FRAC_W + px) * 4;
        if (iter === maxIter) {
          // Deep lan4drcy void core
          data[idx] = 4;
          data[idx + 1] = 8;
          data[idx + 2] = 20;
          data[idx + 3] = 255;
        } else {
          // Smooth escape-time neon palette: #03060c -> deep violet -> #66f0ff cyan -> #ff5cf0 magenta
          const mu = (iter + 1 - Math.log2(Math.log2(zx2 + zy2 + 1e-6))) / maxIter;
          const phase = mu * 6.28318 + t * 0.7;
          const c1 = 0.5 + 0.5 * Math.sin(phase);
          const c2 = 0.5 + 0.5 * Math.cos(phase * 1.35 + 1.1);
          const glow = Math.pow(mu, 0.72);
          data[idx] = Math.min(255, (14 + glow * (220 * c2 + 40 * c1))) | 0;
          data[idx + 1] = Math.min(255, (16 + glow * (235 * c1 + 45 * c2))) | 0;
          data[idx + 2] = Math.min(255, (38 + glow * (245))) | 0;
          data[idx + 3] = 255;
        }
      }
    }
    fracCtx.putImageData(fracImg, 0, 0);
    return fracBuf;
  }

  /* ------------------------------------------------------------------------
     2.5D Smooth Sculpted Plateau Helper (for Smooth Terrain Studio)
     ------------------------------------------------------------------------ */
  function drawBlobPath(ctx, cx, cy, rx, ry, lobes, phase) {
    ctx.beginPath();
    const steps = 40;
    for (let i = 0; i <= steps; i++) {
      const a = (i / steps) * Math.PI * 2;
      const w = 1 + 0.14 * Math.sin(a * lobes + phase) + 0.08 * Math.cos(a * (lobes + 2) - phase * 0.7);
      const x = cx + Math.cos(a) * rx * w;
      const y = cy + Math.sin(a) * ry * w;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function draw25DPlateau(ctx, cx, cy, rx, ry, lobes, phase, cliffH, topColor, wallColor, lipColor) {
    // Soft ambient contact shadow
    ctx.save();
    ctx.fillStyle = 'rgba(42, 34, 24, 0.18)';
    drawBlobPath(ctx, cx + 3, cy + cliffH + 5, rx * 1.03, ry * 1.03, lobes, phase);
    ctx.fill();
    // Vertical 2.5D cliff wall
    ctx.fillStyle = wallColor;
    drawBlobPath(ctx, cx, cy + cliffH, rx, ry, lobes, phase);
    ctx.fill();
    // Mid cliff fill for seamless vertical extrusion
    drawBlobPath(ctx, cx, cy + cliffH * 0.5, rx, ry, lobes, phase);
    ctx.fill();
    // Top sculpted terrain surface
    ctx.fillStyle = topColor;
    drawBlobPath(ctx, cx, cy, rx, ry, lobes, phase);
    ctx.fill();
    // Sunlit top bevel rim
    ctx.strokeStyle = lipColor;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
  }

  /* ------------------------------------------------------------------------
     18 Authentic, Site-Matched Live Mini-World Animations
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
      case 'roguelike': {
        // Real roguelike-quiz palette (#14100d / #1d1612 warm dark parchment-dungeon + #d85042 crimson + #e4ab49 gold + #5fc27c emerald)
        ctx.fillStyle = '#17110d';
        ctx.fillRect(0, 0, W, H);
        // Subtle dungeon stone floor tiles
        ctx.fillStyle = '#201813';
        for (let y = 0; y < H; y += 10) {
          for (let x = 0; x < W; x += 14) {
            if (((x / 14 + y / 10) | 0) % 2 === 0) ctx.fillRect(x, y, 13, 9);
          }
        }
        // Warm crimson-gold Isaac pedestal glow on left
        const fl = 0.82 + 0.18 * Math.sin(t * 7);
        ctx.fillStyle = `rgba(216, 80, 66, ${0.22 * fl})`;
        ctx.fillRect(6, 8, 34, H - 16);
        // Pixel Isaac item pedestal on left
        const py = H - 13;
        ctx.fillStyle = '#78685c';
        ctx.fillRect(16, py, 12, 8);
        ctx.fillStyle = '#a89688';
        ctx.fillRect(15, py - 2, 14, 3);
        // Bobbing golden relic/item above pedestal
        const bob = Math.round(Math.sin(t * 3.4) * 2);
        ctx.fillStyle = '#e4ab49';
        ctx.fillRect(19, py - 10 + bob, 6, 5);
        ctx.fillStyle = '#fff3b8';
        ctx.fillRect(21, py - 9 + bob, 2, 2);

        // Slay the Spire emerald aura & floating fanned cards on right
        ctx.fillStyle = `rgba(95, 194, 124, ${0.18 * fl})`;
        ctx.fillRect(W - 44, 8, 38, H - 16);
        for (let i = 0; i < 3; i++) {
          const cx = W - 36 + i * 9;
          const cy = Math.floor(H * 0.34 + Math.sin(t * 2.8 + i * 1.2) * 3 + (i % 2) * 4);
          ctx.fillStyle = i === 1 ? '#5fc27c' : '#e4ab49';
          ctx.fillRect(cx, cy, 7, 10);
          ctx.fillStyle = '#1d1612';
          ctx.fillRect(cx + 1, cy + 1, 5, 8);
          ctx.fillStyle = i === 0 ? '#d85042' : '#5fc27c';
          ctx.fillRect(cx + 2, cy + 3, 3, 3);
        }
        // Subtle drifting gold dust motes
        for (let i = 0; i < 10; i++) {
          const mx = Math.floor(hash(i * 3) * W);
          const my = Math.floor(H - ((t * 8 + hash(i) * H) % H));
          ctx.fillStyle = i % 2 === 0 ? 'rgba(228,171,73,0.75)' : 'rgba(95,194,124,0.65)';
          ctx.fillRect(mx, my, 1, 1);
        }
        break;
      }

      case 'llccards': {
        // Authentic LLC Cards stark black-and-white hand-inked table + crimson #e01b1b card accents
        ctx.fillStyle = '#141418';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#202028';
        for (let x = -H; x < W + H; x += 10) {
          for (let y = 0; y < H; y += 2) ctx.fillRect(x + (y >> 1), y, 1, 1);
        }
        // Fanned monochrome + crimson cards framing outer left & right flanks
        for (let i = 0; i < 4; i++) {
          const side = i < 2 ? 10 + i * 10 : W - 29 + (i - 2) * 10;
          const bob = Math.round(Math.sin(t * 2.8 + i * 1.3) * 4);
          const cy = Math.floor(H * 0.30 + (i % 2) * 10 + bob);
          ctx.fillStyle = '#f4f4f8';
          ctx.fillRect(side, cy, 8, 11);
          ctx.fillStyle = '#141418';
          ctx.fillRect(side + 1, cy + 1, 6, 9);
          ctx.fillStyle = i % 2 === 0 ? '#e01b1b' : '#ffffff';
          ctx.fillRect(side + 3, cy + 4, 2, 3);
        }
        break;
      }

      case 'mine': {
        // Real MINE palette: deep slate-purple cavern rock (#100e12 / #1a161e / #2e2834) + gold #ffd23a + cyan #7fd0ff ore + headlamp bots
        ctx.fillStyle = '#100e12';
        ctx.fillRect(0, 0, W, H);
        for (let y = 0; y < H; y += 9) {
          ctx.fillStyle = y < H * 0.35 ? '#1a161e' : y < H * 0.7 ? '#241e2b' : '#2e2834';
          ctx.fillRect(0, y, W, 8);
          ctx.fillStyle = '#07060a';
          ctx.fillRect(0, y + 8, W, 1);
        }
        // Gleaming gold & cyan diamond ore flecks
        for (let i = 0; i < 16; i++) {
          const ox = Math.floor(hash(i + 2) * (W - 4)) + 2;
          const oy = Math.floor(hash(i + 15) * (H - 4)) + 2;
          const gl = Math.sin(t * 4.5 + i * 1.4) > 0.45;
          ctx.fillStyle = i % 3 === 0 ? (gl ? '#ffffff' : '#7fd0ff') : (gl ? '#fff2a6' : '#ffd23a');
          ctx.fillRect(ox, oy, 2, 2);
        }
        // Two pixel mining robots cruising tunnels with golden headlamp cones
        for (let r = 0; r < 2; r++) {
          const dir = r === 0 ? 1 : -1;
          const ry = r === 0 ? Math.floor(H * 0.30) : Math.floor(H * 0.74);
          const prog = (t * (0.22 + r * 0.05) + r * 0.5) % 1;
          const rx = Math.floor(dir > 0 ? prog * (W + 16) - 8 : W + 8 - prog * (W + 16));
          ctx.fillStyle = 'rgba(255, 210, 58, 0.22)';
          ctx.fillRect(dir > 0 ? rx + 4 : rx - 14, ry - 2, 14, 7);
          ctx.fillStyle = '#ffd23a';
          ctx.fillRect(rx, ry, 4, 4);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(dir > 0 ? rx + 3 : rx, ry + 1, 1, 1);
        }
        break;
      }

      case 'aiquiz': {
        // Real AI Quiz palette (#080a18 / #10142c + #57f0ff cyan + #ff5ad2 magenta + #7dff8f mint)
        const split = Math.floor(W * 0.5 + Math.sin(t * 1.4) * (W * 0.16));
        ctx.fillStyle = '#080a18';
        ctx.fillRect(0, 0, W, H);
        // Left: pixel-art landscape side
        ctx.fillStyle = '#122244';
        ctx.fillRect(0, 0, split, H);
        ctx.fillStyle = '#1c5c52';
        ctx.fillRect(0, Math.floor(H * 0.65), split, H);
        ctx.fillStyle = '#7dff8f';
        ctx.fillRect(0, Math.floor(H * 0.65), split, 2);
        ctx.fillStyle = '#ffd866';
        ctx.fillRect(14, 10, 6, 6);
        // Right: neon AI neural grid
        ctx.fillStyle = '#150d2b';
        ctx.fillRect(split, 0, W - split, H);
        ctx.fillStyle = 'rgba(255, 90, 210, 0.24)';
        for (let x = split; x < W; x += 8) ctx.fillRect(x, 0, 1, H);
        for (let y = 0; y < H; y += 8) ctx.fillRect(split, y, W - split, 1);
        for (let i = 0; i < 6; i++) {
          const nx = split + 6 + Math.floor(hash(i + 4) * Math.max(8, W - split - 10));
          const ny = Math.floor(hash(i + 12) * (H - 6)) + 3;
          ctx.fillStyle = i % 2 === 0 ? '#57f0ff' : '#ff5ad2';
          ctx.fillRect(nx, ny, 2, 2);
        }
        // Sweeping cyan-white scanner beam
        ctx.fillStyle = '#57f0ff';
        ctx.fillRect(split - 1, 0, 2, H);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(split, 0, 1, H);
        break;
      }

      case 'wam': {
        // Real W.A.M. dark arcade forest arena with timing bar & zipping pixel arrow
        ctx.fillStyle = '#0d1c15';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#142b1f';
        for (let y = 0; y < H; y += 10) for (let x = 0; x < W; x += 12) {
          if (((x / 12 + y / 10) | 0) % 2 === 0) ctx.fillRect(x, y, 12, 10);
        }
        // Retro arcade timing bar at bottom
        const barY = H - 9;
        const barW = Math.floor(W * 0.56);
        const barX = Math.floor((W - barW) * 0.5);
        ctx.fillStyle = '#060f0a';
        ctx.fillRect(barX, barY, barW, 5);
        ctx.fillStyle = '#48c774';
        ctx.fillRect(barX + Math.floor(barW * 0.36), barY + 1, Math.floor(barW * 0.28), 3);
        ctx.fillStyle = '#ffd24c';
        ctx.fillRect(barX + Math.floor(barW * 0.46), barY + 1, Math.floor(barW * 0.08), 3);
        const curX = barX + Math.floor((0.5 + 0.46 * Math.sin(t * 3.8)) * barW);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(curX, barY - 1, 2, 7);
        // Zipping pixel arrow across top
        const ax = Math.floor(((t * 62) % (W + 24)) - 12);
        const ay = 10;
        ctx.fillStyle = '#e8f5ec';
        ctx.fillRect(ax, ay, 8, 1);
        ctx.fillStyle = '#ffd24c';
        ctx.fillRect(ax + 7, ay - 1, 2, 3);
        break;
      }

      case 'void': {
        // Deep cosmic space + swirling violet-cyan accretion ring particles orbiting right behind THE VOID's black hole O!
        ctx.fillStyle = '#05020d';
        ctx.fillRect(0, 0, W, H);
        const cx = Math.floor(W * 0.5);
        const cy = Math.floor(H * 0.54);
        // Subtle pulsing purple nebula glow
        const p = 0.5 + 0.5 * Math.sin(t * 2.4);
        const ng = ctx.createRadialGradient(cx, cy, 4, cx, cy, W * 0.45);
        ng.addColorStop(0, `rgba(192, 77, 240, ${0.28 + 0.12 * p})`);
        ng.addColorStop(0.55, 'rgba(72, 22, 130, 0.16)');
        ng.addColorStop(1, 'rgba(5, 2, 13, 0)');
        ctx.fillStyle = ng;
        ctx.fillRect(0, 0, W, H);

        // Swirling accretion-disk stars spiraling around the Void black hole!
        for (let i = 0; i < 24; i++) {
          const orbit = 14 + (i % 6) * 8;
          const ang = t * (1.25 - (i % 5) * 0.14) + i * 0.85;
          const sx = Math.floor(cx + Math.cos(ang) * orbit * 1.8);
          const sy = Math.floor(cy + Math.sin(ang) * orbit * 0.62);
          ctx.fillStyle = i % 3 === 0 ? '#c04df0' : i % 3 === 1 ? '#62d4ff' : '#ffffff';
          ctx.fillRect(sx, sy, i % 4 === 0 ? 2 : 1, 1);
        }
        // Distant twinkling starfield
        for (let i = 0; i < 20; i++) {
          const sx = Math.floor(hash(i + 3) * W);
          const sy = Math.floor(hash(i + 21) * H);
          const tw = 0.35 + 0.65 * Math.abs(Math.sin(t * 2.8 + i));
          ctx.fillStyle = `rgba(220, 200, 255, ${tw})`;
          ctx.fillRect(sx, sy, 1, 1);
        }
        // Gliding Void pixel spaceship
        const shx = Math.floor(((t * 24) % (W + 20)) - 10);
        const shy = Math.floor(11 + Math.sin(t * 3) * 3);
        ctx.fillStyle = '#62d4ff';
        ctx.fillRect(shx - 4, shy + 1, 4, 1);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(shx, shy, 5, 3);
        ctx.fillRect(shx + 5, shy + 1, 2, 1);
        break;
      }

      case 'ashaad': {
        // Real basement dungeon bricks + flickering corner torches + horizontal flying blue tears!
        ctx.fillStyle = '#3b200f';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2a1409';
        for (let y = 0; y < H; y += 11) {
          ctx.fillRect(0, y, W, 1);
          const off = ((y / 11) | 0) % 2 === 0 ? 0 : 8;
          for (let x = off; x < W; x += 16) ctx.fillRect(x, y, 1, 11);
        }
        const fl = 0.8 + 0.2 * Math.sin(t * 11);
        for (const cx of [18, W - 20]) {
          const cy = H - 14;
          ctx.fillStyle = `rgba(255, 160, 48, ${0.28 * fl})`;
          ctx.fillRect(cx - 12, cy - 11, 24, 22);
          ctx.fillStyle = '#e8dcc0';
          ctx.fillRect(cx - 1, cy + 2, 3, 7);
          ctx.fillStyle = '#ff6a1a';
          ctx.fillRect(cx - 1, cy - 3, 3, 5);
          ctx.fillStyle = '#fff19c';
          ctx.fillRect(cx, cy - 2 - (((t * 7) | 0) % 2), 1, 2);
        }
        for (let i = 0; i < 4; i++) {
          const prog = (t * 0.55 + i * 0.27) % 1;
          const dir = i % 2 === 0 ? 1 : -1;
          const tx = Math.floor(dir > 0 ? 12 + prog * (W - 24) : W - 12 - prog * (W - 24));
          const ty = Math.floor(14 + (i * 11) % (H - 26) + Math.sin(prog * Math.PI) * -5);
          ctx.fillStyle = '#48a8e8';
          ctx.fillRect(tx - 2, ty - 1, 4, 3);
          ctx.fillStyle = '#d8f6ff';
          ctx.fillRect(tx - 1, ty - 1, 2, 1);
        }
        break;
      }

      case 'gallery': {
        // Real Pixel Art Gallery sunlit museum hall (#f4efe6 plaster, #d6be9a oak floor, skylight beams, frames, easel, strolling visitor)
        ctx.fillStyle = '#f4efe6';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#d6be9a';
        ctx.fillRect(0, H * 0.72, W, H * 0.28);
        ctx.strokeStyle = 'rgba(130, 96, 56, 0.22)';
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 28) {
          ctx.beginPath();
          ctx.moveTo(x, H * 0.72);
          ctx.lineTo(x - 16, H);
          ctx.stroke();
        }
        // Skylight warm sunbeams
        for (let i = 0; i < 3; i++) {
          const bx = W * (0.16 + i * 0.34) + Math.sin(t * 0.7 + i) * 6;
          const sg = ctx.createLinearGradient(bx, 0, bx + 42, H * 0.78);
          sg.addColorStop(0, 'rgba(255, 248, 224, 0.55)');
          sg.addColorStop(1, 'rgba(255, 248, 224, 0)');
          ctx.fillStyle = sg;
          ctx.beginPath();
          ctx.moveTo(bx - 16, 0);
          ctx.lineTo(bx + 26, 0);
          ctx.lineTo(bx + 54, H * 0.78);
          ctx.lineTo(bx - 6, H * 0.78);
          ctx.closePath();
          ctx.fill();
        }
        // Hung framed artworks on left & right walls
        const frames = [
          [W * 0.08, H * 0.20, 34, 28, '#c84b31', '#f6d55c'],
          [W * 0.80, H * 0.18, 36, 30, '#388697', '#e8a87c'],
        ];
        for (const [fx, fy, fw, fh, c1, c2] of frames) {
          ctx.fillStyle = '#8c5a32';
          ctx.fillRect(fx, fy, fw, fh);
          ctx.fillStyle = '#fbf9f4';
          ctx.fillRect(fx + 3, fy + 3, fw - 6, fh - 6);
          ctx.fillStyle = c1;
          ctx.fillRect(fx + 6, fy + 6, (fw - 12) * 0.55, fh - 12);
          ctx.fillStyle = c2;
          ctx.fillRect(fx + 6 + (fw - 12) * 0.55, fy + 6, (fw - 12) * 0.45, fh - 12);
        }
        // Tiny strolling museum visitor walking across the oak floor
        const vx = ((t * 28) % (W + 40)) - 20;
        const vy = H * 0.74;
        ctx.fillStyle = '#2c3a47';
        ctx.beginPath();
        ctx.arc(vx, vy - 16, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(vx - 3.5, vy - 11, 7, 11);
        const leg = Math.sin(t * 7) * 3;
        ctx.strokeStyle = '#2c3a47';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(vx - 1, vy); ctx.lineTo(vx - 1 - leg, vy + 8);
        ctx.moveTo(vx + 1, vy); ctx.lineTo(vx + 1 + leg, vy + 8);
        ctx.stroke();
        break;
      }

      case 'ddom': {
        // Real DDOM warm terracotta/cream/golden photo mosaic wave (#f6f1e9, #c46835, #231a14, #ffd3b3)
        const cols = 14, rows = 6;
        const cw = Math.ceil(W / cols), ch = Math.ceil(H / rows);
        const pal = ['#3d2a1d', '#5c3c26', '#8a5532', '#c46835', '#d98a52', '#e8b382', '#6e4930'];
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const wave = Math.sin(t * 1.9 + c * 0.48 + r * 0.65);
            const idx = Math.floor(hash(c * 13 + r * 29) * pal.length);
            ctx.fillStyle = pal[idx];
            ctx.fillRect(c * cw, r * ch, cw - 1, ch - 1);
            if (wave > 0.78) {
              ctx.fillStyle = 'rgba(255, 224, 182, 0.34)';
              ctx.fillRect(c * cw, r * ch, cw - 1, ch - 1);
            }
          }
        }
        break;
      }

      case 'typefall': {
        // Real typefall warm book-paper #f7f2e7 + tumbling Times New Roman serif letters
        ctx.fillStyle = '#f7f2e7';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(17, 17, 17, 0.08)';
        for (let y = 26; y < H; y += 26) ctx.fillRect(16, y, W - 32, 1);
        const letters = 'typefallabcdefghijklmnopqrstuvwxyz';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < 16; i++) {
          const x = 22 + hash(i * 7 + 1) * (W - 44);
          const fall = (t * (28 + (i % 4) * 9) + hash(i * 11) * (H + 40)) % (H + 40) - 20;
          const rot = Math.sin(t * 1.6 + i) * 0.5;
          ctx.save();
          ctx.translate(x, fall);
          ctx.rotate(rot);
          ctx.font = `italic ${18 + (i % 3) * 5}px "Times New Roman", Georgia, serif`;
          ctx.fillStyle = `rgba(24, 20, 16, ${0.14 + (i % 3) * 0.07})`;
          ctx.fillText(letters[i % letters.length], 0, 0);
          ctx.restore();
        }
        break;
      }

      case 'shaders': {
        // Real lan4drcy animated Julia Set fractal in electric cyan (#66f0ff), violet & neon magenta (#ff5cf0) on #03060c!
        const fb = renderFractalBuffer(t);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(fb, 0, 0, W, H);
        // Subtle dark center vignette so big crisp "lan4drcy" Russo One title pops cleanly
        const vg = ctx.createRadialGradient(W * 0.5, H * 0.5, 10, W * 0.5, H * 0.5, W * 0.55);
        vg.addColorStop(0, 'rgba(3, 6, 14, 0.38)');
        vg.addColorStop(1, 'rgba(3, 6, 14, 0.06)');
        ctx.fillStyle = vg;
        ctx.fillRect(0, 0, W, H);
        break;
      }

      case 'terra': {
        // Real sunlit Terra pixel sandbox: blue sky, drifting clouds, rolling emerald grass hills, terracotta underground & glowing ores!
        const sg = ctx.createLinearGradient(0, 0, 0, H * 0.62);
        sg.addColorStop(0, '#398fd6');
        sg.addColorStop(1, '#84cef5');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
        // Drifting pixel clouds
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        for (let i = 0; i < 4; i++) {
          const cx = Math.floor(((t * (5 + i * 1.8) + i * 48) % (W + 26)) - 14);
          const cy = 6 + (i % 2) * 8;
          ctx.fillRect(cx, cy, 14, 4);
          ctx.fillRect(cx + 3, cy - 2, 8, 2);
        }
        // Rolling pixel hills & sandstone/terracotta underground strata
        for (let x = 0; x < W; x += 2) {
          const hill = Math.floor(H * 0.58 + Math.sin(x * 0.055) * 6 + Math.cos(x * 0.11) * 3);
          ctx.fillStyle = '#52c456';
          ctx.fillRect(x, hill, 2, 4);
          ctx.fillStyle = '#38993c';
          ctx.fillRect(x, hill + 4, 2, 3);
          ctx.fillStyle = '#a86f3e';
          ctx.fillRect(x, hill + 7, 2, 12);
          ctx.fillStyle = '#754925';
          ctx.fillRect(x, hill + 19, 2, H - hill);
        }
        // Tiny pixel trees on the left & right flanks
        for (const tx of [18, W - 24]) {
          const ty = Math.floor(H * 0.56);
          ctx.fillStyle = '#6b4222';
          ctx.fillRect(tx + 2, ty - 4, 2, 6);
          ctx.fillStyle = '#2d8c36';
          ctx.fillRect(tx, ty - 10, 6, 6);
          ctx.fillStyle = '#5cd663';
          ctx.fillRect(tx + 1, ty - 12, 4, 3);
        }
        // Sparkling underground gem ores
        for (let i = 0; i < 8; i++) {
          const gx = Math.floor(10 + hash(i + 4) * (W - 20));
          const gy = Math.floor(H * 0.76 + hash(i + 9) * (H * 0.20));
          const tw = Math.sin(t * 4 + i * 1.5) > 0.3;
          ctx.fillStyle = i % 2 === 0 ? (tw ? '#ffffff' : '#66f0ff') : (tw ? '#fff4a8' : '#ffd55a');
          ctx.fillRect(gx, gy, 2, 2);
        }
        break;
      }

      case 'pmuseum': {
        // Pixel Museum: Twilight pixel city street WITH the grand classical Pixel Museum building, streetlamps, pedestrians & passing cars!
        const sg = ctx.createLinearGradient(0, 0, 0, H * 0.74);
        sg.addColorStop(0, '#0f1730');
        sg.addColorStop(1, '#223562');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
        // Twinkling twilight stars
        for (let i = 0; i < 12; i++) {
          const sx = Math.floor(hash(i + 3) * W);
          const sy = Math.floor(hash(i + 17) * H * 0.34);
          ctx.fillStyle = Math.sin(t * 3 + i) > 0.2 ? '#d8f4ff' : '#6a82b0';
          ctx.fillRect(sx, sy, 1, 1);
        }
        // Flanking pixel town buildings (left & right)
        const sideY = Math.floor(H * 0.34);
        const roadY = Math.floor(H * 0.78);
        ctx.fillStyle = '#2d3756';
        ctx.fillRect(2, sideY + 6, 30, roadY - sideY - 6);
        ctx.fillRect(W - 34, sideY + 4, 32, roadY - sideY - 4);
        // Warm glowing apartment windows on flanking buildings
        ctx.fillStyle = '#ffd97a';
        for (let wx = 7; wx <= 23; wx += 8) {
          ctx.fillRect(wx, sideY + 12, 4, 5);
          ctx.fillRect(wx, sideY + 22, 4, 5);
        }
        for (let wx = W - 29; wx <= W - 11; wx += 8) {
          ctx.fillRect(wx, sideY + 10, 4, 5);
          ctx.fillRect(wx, sideY + 20, 4, 5);
        }

        // Grand Classical PIXEL MUSEUM Building in center!
        const mx = Math.floor(W * 0.24);
        const mw = Math.floor(W * 0.52);
        const my = Math.floor(H * 0.26);
        const mh = roadY - my;
        // Triangular pediment roof
        ctx.fillStyle = '#8fa4c2';
        for (let step = 0; step < 7; step++) {
          ctx.fillRect(mx - 4 + step * 5, my - step, mw + 8 - step * 10, 2);
        }
        // Limestone facade
        ctx.fillStyle = '#c4d2e4';
        ctx.fillRect(mx, my + 1, mw, mh);
        ctx.fillStyle = '#334668';
        ctx.fillRect(mx + 4, my + 6, mw - 8, mh - 10);
        // Warm glowing museum gallery windows & grand arched doorway
        ctx.fillStyle = '#ffe28a';
        ctx.fillRect(Math.floor(W * 0.5) - 6, roadY - 14, 12, 14);
        ctx.fillStyle = 'rgba(255, 226, 138, 0.72)';
        ctx.fillRect(mx + 10, my + 11, 12, 12);
        ctx.fillRect(mx + mw - 22, my + 11, 12, 12);
        // 6 classical stone columns across the front of the museum
        ctx.fillStyle = '#dce8f5';
        const colCount = 6;
        for (let i = 0; i < colCount; i++) {
          const cx = Math.floor(mx + 4 + (i / (colCount - 1)) * (mw - 12));
          ctx.fillRect(cx, my + 5, 4, mh - 8);
        }
        // Museum front steps
        ctx.fillStyle = '#aebfd4';
        ctx.fillRect(mx - 4, roadY - 3, mw + 8, 3);

        // Sidewalk + asphalt street + dashed yellow lane line
        ctx.fillStyle = '#7c8596';
        ctx.fillRect(0, roadY, W, 4);
        ctx.fillStyle = '#1b1f2c';
        ctx.fillRect(0, roadY + 4, W, H - roadY - 4);
        ctx.fillStyle = '#f2c94c';
        for (let x = 4; x < W; x += 14) ctx.fillRect(x, roadY + 9, 7, 1);

        // Glowing pixel streetlamps flanking the museum
        for (const lx of [mx - 10, mx + mw + 8]) {
          ctx.fillStyle = '#4a556e';
          ctx.fillRect(lx, roadY - 14, 2, 14);
          ctx.fillStyle = 'rgba(255, 230, 140, 0.25)';
          ctx.fillRect(lx - 4, roadY - 18, 10, 8);
          ctx.fillStyle = '#fff3b0';
          ctx.fillRect(lx - 1, roadY - 15, 4, 2);
        }

        // Tiny passing pixel cars cruising down the street!
        const car1 = Math.floor(((t * 34) % (W + 24)) - 12);
        ctx.fillStyle = '#ff5a6e';
        ctx.fillRect(car1, roadY + 5, 10, 4);
        ctx.fillStyle = '#fff5b8';
        ctx.fillRect(car1 + 9, roadY + 6, 2, 2);
        const car2 = Math.floor(W + 12 - ((t * 26 + 40) % (W + 24)));
        ctx.fillStyle = '#58e2ec';
        ctx.fillRect(car2, roadY + 10, 10, 4);
        ctx.fillStyle = '#fff5b8';
        ctx.fillRect(car2 - 1, roadY + 11, 2, 2);
        break;
      }

      case 'sea': {
        // Real Sea of Thought cerulean ocean (#0096c7 / #48cae4 / #031e4d) with rolling waves & bobbing message bottles!
        const sg = ctx.createLinearGradient(0, 0, 0, H);
        sg.addColorStop(0, '#0077b6');
        sg.addColorStop(0.45, '#0096c7');
        sg.addColorStop(1, '#032056');
        ctx.fillStyle = sg;
        ctx.fillRect(0, 0, W, H);
        for (let layer = 0; layer < 4; layer++) {
          const baseY = Math.floor(H * (0.34 + layer * 0.17));
          ctx.fillStyle = layer % 2 === 0 ? 'rgba(72, 202, 228, 0.35)' : 'rgba(3, 30, 77, 0.38)';
          for (let x = 0; x < W; x += 2) {
            const wy = Math.floor(baseY + Math.sin(x * 0.08 + t * (1.8 + layer * 0.4) + layer * 2) * 3);
            ctx.fillRect(x, wy, 2, H - wy);
            if (layer < 2 && ((x + ((t * 14) | 0)) % 14 === 0)) {
              ctx.fillStyle = 'rgba(230, 251, 255, 0.65)';
              ctx.fillRect(x, wy, 4, 1);
              ctx.fillStyle = layer % 2 === 0 ? 'rgba(72, 202, 228, 0.35)' : 'rgba(3, 30, 77, 0.38)';
            }
          }
        }
        // Bobbing corked glass message bottles
        for (let i = 0; i < 2; i++) {
          const bx = Math.floor(((t * 11 + i * (W * 0.55)) % (W + 14)) - 7);
          const by = Math.floor(H * (0.56 + i * 0.18) + Math.sin(t * 2.8 + i * 2) * 2);
          ctx.fillStyle = '#90e0ef';
          ctx.fillRect(bx, by, 5, 3);
          ctx.fillStyle = '#f3dfae';
          ctx.fillRect(bx + 1, by + 1, 3, 1);
          ctx.fillStyle = '#b87a44';
          ctx.fillRect(bx + 5, by + 1, 2, 1);
        }
        break;
      }

      case 'atlas': {
        // Real Atlas studio white canvas + 100% REALISTIC spinning satellite Earth (Esri World Imagery) + front-hemisphere red travel pins & flight arc!
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        // Ultra-subtle studio coordinate ticks
        ctx.strokeStyle = 'rgba(20, 40, 70, 0.05)';
        ctx.lineWidth = 1;
        for (let x = 32; x < W; x += 36) {
          ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        const gx = W * 0.5;
        const gy = H * 0.5;
        const R = Math.min(W, H) * 0.43;

        // Soft studio drop shadow beneath the floating Earth
        const sh = ctx.createRadialGradient(gx, gy + R * 0.14, R * 0.6, gx, gy + R * 0.14, R * 1.18);
        sh.addColorStop(0, 'rgba(18, 42, 74, 0.14)');
        sh.addColorStop(1, 'rgba(18, 42, 74, 0)');
        ctx.fillStyle = sh;
        ctx.beginPath();
        ctx.arc(gx, gy + R * 0.14, R * 1.18, 0, Math.PI * 2);
        ctx.fill();

        // Draw realistic raycast satellite globe
        const gbuf = renderRealisticGlobe(t);
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(gbuf, gx - R, gy - R, R * 2, R * 2);

        // Front-hemisphere red travel pins & connecting route arc (hidden when rotated to back of globe!)
        const rot = t * 0.28;
        const tilt = 0.26;
        const rawPins = [
          [-1.35, 0.62], // North America
          [-0.08, 0.85], // Europe
          [0.52, 0.48],  // Mediterranean / Cairo
          [2.42, 0.62],  // Tokyo
        ];
        const vis = [];
        for (const [lon0, lat0] of rawPins) {
          const lon = lon0 - rot;
          const x3 = Math.cos(lat0) * Math.sin(lon);
          const y3 = -Math.sin(lat0);
          const z3 = Math.cos(lat0) * Math.cos(lon);
          // Apply inverse tilt for screen space
          const sy3 = y3 * Math.cos(tilt) + z3 * Math.sin(tilt);
          const sz3 = -y3 * Math.sin(tilt) + z3 * Math.cos(tilt);
          if (sz3 > 0.14) {
            vis.push([gx + x3 * R * 0.94, gy + sy3 * R * 0.94]);
          }
        }
        if (vis.length >= 2) {
          ctx.strokeStyle = 'rgba(217, 79, 48, 0.9)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let i = 0; i < vis.length - 1; i++) {
            const [x1, y1] = vis[i];
            const [x2, y2] = vis[i + 1];
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo((x1 + x2) * 0.5, (y1 + y2) * 0.5 - 14, x2, y2);
          }
          ctx.stroke();
        }
        for (const [px, py] of vis) {
          ctx.fillStyle = '#d94f30';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.arc(px, py, 4.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        break;
      }

      case 'terrain': {
        // Real Smooth Terrain Studio generated 2.5D layered SDF cliff terrain!
        // Warm parchment/sand studio base (#efe7dc) + alpine water basin + raised organic 2.5D grass, stone & mesa plateaus
        ctx.fillStyle = '#efe7dc';
        ctx.fillRect(0, 0, W, H);
        // Subtle sand/parchment contour wash
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#f3ece1');
        bg.addColorStop(1, '#e0d2bc');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);

        const p1 = t * 0.45;
        // Alpine smooth water pond on right-center
        ctx.fillStyle = '#9ecbe0';
        drawBlobPath(ctx, W * 0.72, H * 0.58, W * 0.24, H * 0.36, 3, -p1 * 0.6);
        ctx.fill();
        ctx.fillStyle = '#5287a6';
        drawBlobPath(ctx, W * 0.73, H * 0.60, W * 0.16, H * 0.24, 3, -p1 * 0.6 + 0.4);
        ctx.fill();

        // Tier 1: Wide lush 2.5D Grass Plateau (left & lower-center)
        draw25DPlateau(ctx, W * 0.24, H * 0.56, W * 0.26, H * 0.38, 4, p1 * 0.5, 11, '#78a363', '#537544', '#9bc786');
        // Tier 2: Raised 2.5D Stone Ridge (upper-left)
        draw25DPlateau(ctx, W * 0.16, H * 0.34, W * 0.15, H * 0.22, 5, p1 * 0.7 + 1.2, 13, '#888684', '#565452', '#aba9a6');
        // Tier 1b: Raised 2.5D Terracotta Mesa Plateau (upper-right)
        draw25DPlateau(ctx, W * 0.84, H * 0.28, W * 0.17, H * 0.24, 3, -p1 * 0.5 + 0.8, 12, '#cda97e', '#986b47', '#e6c8a3');
        // Tier 2b: Small grass hillock on lower-right
        draw25DPlateau(ctx, W * 0.50, H * 0.84, W * 0.18, H * 0.20, 4, p1 * 0.4 + 2.1, 9, '#78a363', '#537544', '#9bc786');
        break;
      }

      case 'recommend': {
        // Cozy midnight blue / indigo living room (ZERO brown!) with someone sitting on a couch
        // wondering what they should watch or read!
        const wg = ctx.createLinearGradient(0, 0, 0, H);
        wg.addColorStop(0, '#0c152d');
        wg.addColorStop(0.74, '#16264b');
        wg.addColorStop(1, '#101b36');
        ctx.fillStyle = wg;
        ctx.fillRect(0, 0, W, H);

        // Floor plane
        ctx.fillStyle = '#0d162e';
        ctx.fillRect(0, H * 0.76, W, H * 0.24);

        // Starry twilight window on far right
        const winX = W * 0.78, winY = H * 0.14, winW = 54, winH = 44;
        ctx.fillStyle = '#070e20';
        ctx.fillRect(winX, winY, winW, winH);
        ctx.strokeStyle = '#334d82';
        ctx.lineWidth = 2;
        ctx.strokeRect(winX, winY, winW, winH);
        ctx.beginPath();
        ctx.moveTo(winX + winW * 0.5, winY); ctx.lineTo(winX + winW * 0.5, winY + winH);
        ctx.moveTo(winX, winY + winH * 0.5); ctx.lineTo(winX + winW, winY + winH * 0.5);
        ctx.stroke();
        // Little crescent moon & stars in window
        ctx.fillStyle = '#d8e6ff';
        ctx.beginPath(); ctx.arc(winX + 14, winY + 12, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillRect(winX + 36, winY + 10, 2, 2);
        ctx.fillRect(winX + 42, winY + 28, 2, 2);

        // Soft flickering TV screen glow on the left wall
        const tvPulse = 0.72 + 0.28 * Math.sin(t * 3.1) * Math.cos(t * 1.7);
        const tvGlow = ctx.createRadialGradient(28, H * 0.54, 4, 46, H * 0.56, 130);
        tvGlow.addColorStop(0, `rgba(110, 178, 255, ${0.34 * tvPulse})`);
        tvGlow.addColorStop(0.6, `rgba(130, 118, 255, ${0.12 * tvPulse})`);
        tvGlow.addColorStop(1, 'rgba(16, 28, 56, 0)');
        ctx.fillStyle = tvGlow;
        ctx.fillRect(0, 0, W * 0.5, H);
        // Sleek glowing TV on left stand
        ctx.fillStyle = '#253966';
        ctx.fillRect(14, H * 0.44, 14, 34);
        ctx.fillStyle = `rgba(148, 210, 255, ${0.85 * tvPulse})`;
        ctx.fillRect(24, H * 0.46, 5, 30);

        // Cozy standing floor lamp on right casting warm soft golden-amber accent glow
        const lampX = W * 0.87;
        const lg = ctx.createRadialGradient(lampX, H * 0.40, 4, lampX, H * 0.44, 68);
        lg.addColorStop(0, 'rgba(255, 224, 145, 0.30)');
        lg.addColorStop(1, 'rgba(255, 224, 145, 0)');
        ctx.fillStyle = lg;
        ctx.fillRect(W * 0.65, 0, W * 0.35, H);
        ctx.strokeStyle = '#6077a8';
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(lampX, H * 0.44); ctx.lineTo(lampX, H * 0.80); ctx.stroke();
        ctx.fillStyle = '#ffe599';
        ctx.beginPath();
        ctx.moveTo(lampX - 10, H * 0.44);
        ctx.lineTo(lampX + 10, H * 0.44);
        ctx.lineTo(lampX + 6, H * 0.34);
        ctx.lineTo(lampX - 6, H * 0.34);
        ctx.closePath();
        ctx.fill();

        // Cozy plush midnight-slate couch on lower-left
        const cx = W * 0.17;
        const cy = H * 0.63;
        ctx.fillStyle = '#243a6b';
        ctx.beginPath(); ctx.roundRect(cx - 42, cy - 6, 84, 24, 6); ctx.fill();
        ctx.fillStyle = '#324e8c';
        ctx.beginPath(); ctx.roundRect(cx - 48, cy + 4, 12, 20, 4); ctx.fill();
        ctx.beginPath(); ctx.roundRect(cx + 36, cy + 4, 12, 20, 4); ctx.fill();
        ctx.beginPath(); ctx.roundRect(cx - 38, cy + 8, 76, 16, 4); ctx.fill();

        // Person sitting comfortably on the couch thinking about what to watch or read!
        const px = cx - 4;
        const py = cy + 6;
        // Torso & head
        ctx.fillStyle = '#9bb8f5';
        ctx.beginPath(); ctx.roundRect(px - 8, py - 14, 16, 18, 6); ctx.fill();
        ctx.fillStyle = '#dce8ff';
        ctx.beginPath(); ctx.arc(px, py - 21, 7.5, 0, Math.PI * 2); ctx.fill();
        // Little thought bubble floating above person cycling smoothly between Movie & Book!
        const bBob = Math.sin(t * 2.2) * 3;
        const bx = px + 26;
        const by = py - 44 + bBob;
        ctx.fillStyle = 'rgba(226, 238, 255, 0.88)';
        ctx.beginPath(); ctx.arc(px + 9, py - 30, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(px + 15, py - 36, 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.roundRect(bx - 16, by - 12, 32, 22, 10); ctx.fill();

        // Cycle between film/play icon ("watch") and open book icon ("read")
        const showBook = Math.sin(t * 1.1) > 0;
        if (showBook) {
          // Open book inside thought bubble
          ctx.strokeStyle = '#243a6b';
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.moveTo(bx - 9, by - 4);
          ctx.quadraticCurveTo(bx - 4, by - 6, bx, by - 3);
          ctx.quadraticCurveTo(bx + 4, by - 6, bx + 9, by - 4);
          ctx.lineTo(bx + 9, by + 5);
          ctx.quadraticCurveTo(bx + 4, by + 3, bx, by + 6);
          ctx.quadraticCurveTo(bx - 4, by + 3, bx - 9, by + 5);
          ctx.closePath();
          ctx.stroke();
          ctx.beginPath(); ctx.moveTo(bx, by - 3); ctx.lineTo(bx, by + 6); ctx.stroke();
        } else {
          // Film / Play icon inside thought bubble
          ctx.fillStyle = '#3b66d4';
          ctx.beginPath(); ctx.roundRect(bx - 9, by - 6, 18, 12, 3); ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(bx - 2, by - 3.2);
          ctx.lineTo(bx + 4.5, by);
          ctx.lineTo(bx - 2, by + 3.2);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'channels': {
        // Real LLC Powered Channels dark studio (#07050f / #120c1e) + YouTube red #ff0033 + #38e1d0 cyan analytics sparkline!
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#07050f');
        bg.addColorStop(1, '#181028');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Subtle equalizer bars across bottom
        for (let i = 0; i < 22; i++) {
          const bh = 8 + Math.abs(Math.sin(t * 3.2 + i * 0.55)) * (H * 0.30);
          ctx.fillStyle = i % 4 === 0 ? 'rgba(56, 225, 208, 0.22)' : 'rgba(255, 0, 51, 0.20)';
          ctx.fillRect(10 + i * ((W - 20) / 22), H - bh, 6, bh);
        }
        // Climbing red view-count sparkline
        ctx.strokeStyle = 'rgba(255, 52, 84, 0.85)';
        ctx.lineWidth = 2.4;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 8) {
          const u = x / W;
          const y = H * 0.78 - u * H * 0.42 + Math.sin(u * 10 - t * 2.4) * 7;
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
     Viewport-Aware Animation Loop (Pauses Offscreen Rifts Automatically)
     ------------------------------------------------------------------------ */
  const entries = [];
  let rafId = null;
  let observer = null;
  const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ensureObserver() {
    if (observer || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(
      (list) => {
        for (const item of list) {
          const e = entries.find((x) => x.el === item.target);
          if (e) e.visible = item.isIntersecting;
        }
      },
      { rootMargin: '120px' }
    );
  }

  function sizeCanvas(entry) {
    if (entry.pixel) {
      entry.canvas.width = 160;
      entry.canvas.height = 60;
    } else {
      const rect = entry.canvas.getBoundingClientRect();
      const w = Math.max(240, Math.min(480, Math.round(rect.width || 360)));
      const h = Math.max(96, Math.min(200, Math.round(rect.height || 140)));
      if (entry.canvas.width !== w || entry.canvas.height !== h) {
        entry.canvas.width = w;
        entry.canvas.height = h;
      }
    }
  }

  function tick(now) {
    const t = now * 0.001;
    for (const e of entries) {
      if (!e.visible) continue;
      if (!e.pixel) sizeCanvas(e);
      paintScene(e.canvas, e.scene, t, e.pixel);
    }
    if (!reducedMotion && entries.length) {
      rafId = requestAnimationFrame(tick);
    }
  }

  function reset() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    if (observer) {
      observer.disconnect();
      observer = null;
    }
    entries.length = 0;
  }

  function register(el, canvas, site, assetBase = '') {
    ensureObserver();
    if (site.scene === 'atlas') ensureEarthTexture(assetBase);
    const entry = {
      el,
      canvas,
      scene: site.scene,
      pixel: !!site.pixel,
      visible: true,
    };
    sizeCanvas(entry);
    entries.push(entry);
    if (observer) observer.observe(el);
    paintScene(canvas, site.scene, 1.2, entry.pixel);
    if (!reducedMotion && !rafId) {
      rafId = requestAnimationFrame(tick);
    }
  }

  return {
    buildCrackGeometry,
    buildTitleHTML,
    buildPopoutsHTML,
    register,
    reset,
  };
})();

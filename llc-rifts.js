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
        return `<div class="rt-tboi-sts2"><span class="tboi-word">TBOI</span><span class="quiz-amp">&amp;</span><span class="sts-wrap"><span class="sts-word">STS</span><span class="sts-two">2</span></span><span class="quiz-word">QUIZ</span></div>`;
      case 'ddom':
        return `<div class="rt-ddom-wrap"><img class="ddom-maggie is-left" src="${assetBase}world/titles/maggie-1.jpg?v=9" alt="" aria-hidden="true" /><span class="rt-ddom">DDOM</span><img class="ddom-maggie is-right" src="${assetBase}world/titles/maggie-2.jpg?v=9" alt="" aria-hidden="true" /></div>`;
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
      case 'mimic':
        return `<div class="rt-mimic"><span class="mimic-dot"></span>MIMIC</div>`;
      case 'aivillage':
        return `<div class="rt-aivillage">AI Village</div>`;
      default:
        return `<div class="rt-default">${site.title}</div>`;
    }
  }

  /* ------------------------------------------------------------------------
     Authentic Game Character Sprites on Sides (Ashaad & W.A.M. only)
     ------------------------------------------------------------------------ */
  function buildPopoutsHTML(site, assetBase) {
    const k = site.pop;
    if (k === 'ashaad') {
      return `
        <img class="pop-el pop-left pop-sprite" src="${assetBase}games/ashaad/ashaad.png" alt="" aria-hidden="true" />
        <img class="pop-el pop-right pop-sprite" src="${assetBase}games/ashaad/finley.png" alt="" aria-hidden="true" />
      `;
    }
    if (k === 'wam') {
      return `
        <img class="pop-el pop-left pop-sprite" src="${assetBase}world/titles/wam-warrior.png" alt="" aria-hidden="true" />
        <img class="pop-el pop-right pop-sprite" src="${assetBase}world/titles/wam-mage.png" alt="" aria-hidden="true" />
      `;
    }
    return '';
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
    // Smoothly orbit classic electric Julia fractal parameter AND dramatically zoom in & out!
    const ang = t * 0.38;
    const cr = -0.745 + 0.085 * Math.cos(ang);
    const ci = 0.185 + 0.085 * Math.sin(ang * 1.15);
    const zoomPhase = 0.5 + 0.5 * Math.sin(t * 0.62);
    const scale = 2.35 * Math.pow(0.16, zoomPhase); // zooms from 2.35 deep into 0.38 and back out!
    const offX = 0.18 * Math.sin(t * 0.31) * (1 - scale * 0.25);
    const offY = 0.12 * Math.cos(t * 0.27) * (1 - scale * 0.25);
    const maxIter = 30;

    for (let py = 0; py < FRAC_H; py++) {
      const zy0 = ((py / FRAC_H) - 0.5) * 2.0 * scale + offY;
      for (let px = 0; px < FRAC_W; px++) {
        const zx0 = ((px / FRAC_W) - 0.5) * 3.4 * scale + offX;
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
        // Pure Black & White hand-drawn LLC Cards duel table (zero color, just like the real game!)
        ctx.fillStyle = '#f7f7f7';
        ctx.fillRect(0, 0, W, H);
        // Subtle hand-drawn black ink diagonal sketch lines
        ctx.fillStyle = '#e5e5e5';
        for (let x = -H; x < W + H; x += 10) {
          for (let y = 0; y < H; y += 2) ctx.fillRect(x + (y >> 1), y, 1, 1);
        }
        // Fanned pure black-and-white hand-inked playing cards on outer left & right flanks
        for (let i = 0; i < 4; i++) {
          const side = i < 2 ? 10 + i * 10 : W - 29 + (i - 2) * 10;
          const bob = Math.round(Math.sin(t * 2.8 + i * 1.3) * 4);
          const cy = Math.floor(H * 0.28 + (i % 2) * 10 + bob);
          ctx.fillStyle = '#111111';
          ctx.fillRect(side, cy, 9, 12);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(side + 1, cy + 1, 7, 10);
          ctx.fillStyle = '#111111';
          ctx.fillRect(side + 3, cy + 4, 3, 4);
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
        // Real DDOM warm cream paper (#f6f1e9 -> #ece4d6) matching ddom's actual website
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#fdfaf5');
        bg.addColorStop(0.5, '#f6f1e9');
        bg.addColorStop(1, '#ece4d6');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Subtle warm golden drifting light motes
        for (let i = 0; i < 8; i++) {
          const sx = (hash(i + 2) * W + Math.sin(t * 0.7 + i) * 10) % W;
          const sy = (hash(i + 11) * H + Math.cos(t * 0.6 + i) * 6) % H;
          ctx.fillStyle = 'rgba(196, 104, 53, 0.14)';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.2 + (i % 2), 0, Math.PI * 2);
          ctx.fill();
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
        // Real Sea of Thought ocean (from sea-of-thought/assets/ocean.js):
        // Sunlit sky horizon, choppy pixel surface line, deep turquoise->cobalt->indigo water,
        // angled underwater caustic shafts, swaying teal kelp, seabed & glass bottles FALLING DOWN!
        const surfBase = Math.floor(H * 0.22);
        // 1. Bright sunlit pixel sky above the water
        const skyG = ctx.createLinearGradient(0, 0, 0, surfBase);
        skyG.addColorStop(0, '#90E0EF');
        skyG.addColorStop(1, '#CAF0F8');
        ctx.fillStyle = skyG;
        ctx.fillRect(0, 0, W, surfBase + 2);
        // Sun glint on horizon
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.floor(W * 0.78), 3, 7, 4);

        // 2. Real Sea of Thought underwater depth gradient (#0096C7 -> #0055A4 -> #03045E)
        const seaG = ctx.createLinearGradient(0, surfBase, 0, H);
        seaG.addColorStop(0, '#0096C7');
        seaG.addColorStop(0.42, '#0062AD');
        seaG.addColorStop(0.78, '#083282');
        seaG.addColorStop(1, '#03045E');
        ctx.fillStyle = seaG;
        ctx.fillRect(0, surfBase, W, H - surfBase);

        // 3. Angled sunlit underwater caustic rays descending from the surface
        ctx.fillStyle = 'rgba(202, 240, 248, 0.12)';
        for (let r = 0; r < 5; r++) {
          const rx = Math.floor(14 + r * 32 + Math.sin(t * 0.8 + r) * 5);
          for (let y = surfBase; y < H - 8; y += 2) {
            const shift = Math.floor((y - surfBase) * 0.22);
            ctx.fillRect(rx - shift, y, 7, 2);
          }
        }

        // 4. Choppy pixel surface wave crest (#ADE8F4 + white sun sparkles)
        for (let x = 0; x < W; x++) {
          const sy = surfBase + Math.round(1.4 * Math.sin(x * 0.09 + t * 1.4) + 0.7 * Math.sin(x * 0.19 - t * 1.9));
          ctx.fillStyle = '#CAF0F8';
          ctx.fillRect(x, 0, 1, sy);
          ctx.fillStyle = '#ADE8F4';
          ctx.fillRect(x, sy, 1, 2);
          if (((x + ((t * 10) | 0)) % 17 === 0)) {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(x, sy, 2, 1);
          }
        }

        // 5. Swaying teal kelp & hazy seabed ridges along bottom (exact ocean.js colors)
        for (let x = 0; x < W; x += 2) {
          const fh = Math.floor(5 + 2.5 * Math.sin(x * 0.08) + 1.5 * Math.cos(x * 0.15));
          ctx.fillStyle = '#0e2c66';
          ctx.fillRect(x, H - fh, 2, fh);
          ctx.fillStyle = '#3a74b8';
          ctx.fillRect(x, H - fh, 2, 1);
        }
        const kelpX = [14, 28, W - 32, W - 16];
        for (let k = 0; k < kelpX.length; k++) {
          const kx = kelpX[k];
          const kh = 14 + (k % 2) * 6;
          for (let q = 0; q < kh; q++) {
            const sway = Math.round(Math.sin(t * 1.6 + k * 1.7 + q * 0.28) * 1.8);
            ctx.fillStyle = q < 6 ? '#165e64' : '#1f7a68';
            ctx.fillRect(kx + sway, H - 4 - q, 2, 1);
          }
        }

        // 6. Glass message bottles FALLING / SINKING DOWN through the ocean with tiny bubbles!
        for (let i = 0; i < 6; i++) {
          const bx = Math.floor(14 + hash(i * 7 + 3) * (W - 28) + Math.sin(t * 1.5 + i * 2) * 3);
          const prog = (t * (0.18 + (i % 3) * 0.05) + hash(i * 13 + 1)) % 1;
          const by = Math.floor(surfBase - 4 + prog * (H - surfBase + 8));
          // Cork on top
          ctx.fillStyle = '#b87a44';
          ctx.fillRect(bx + 1, by - 1, 2, 1);
          // Glass bottle body
          ctx.fillStyle = '#90E0EF';
          ctx.fillRect(bx, by, 4, 6);
          // Parchment scroll inside
          ctx.fillStyle = '#f3dfae';
          ctx.fillRect(bx + 1, by + 2, 2, 3);
          // Glass highlight
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(bx, by + 1, 1, 2);
          // Rising bubble trailing above sinking bottle
          if (by > surfBase + 5) {
            ctx.fillStyle = 'rgba(214, 242, 255, 0.8)';
            ctx.fillRect(bx + 1 + ((i + ((t * 4) | 0)) % 2), by - 4, 1, 1);
          }
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

      case 'mimic': {
        // Dark recording-studio obsidian backdrop + live glowing dual-channel cyan/indigo acoustic waveform!
        const bg = ctx.createLinearGradient(0, 0, W, H);
        bg.addColorStop(0, '#090a0d');
        bg.addColorStop(0.5, '#101420');
        bg.addColorStop(1, '#090a0d');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Subtle acoustic grid lines
        ctx.strokeStyle = 'rgba(56, 232, 255, 0.07)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, H * 0.5); ctx.lineTo(W, H * 0.5);
        ctx.stroke();
        // Glowing symmetric spectrum bars
        const barCount = 34;
        const step = W / barCount;
        for (let i = 0; i < barCount; i++) {
          const u = i / (barCount - 1);
          const env = Math.sin(u * Math.PI);
          const amp = (0.18 + 0.82 * Math.abs(Math.sin(t * 3.4 + i * 0.45) * Math.cos(t * 1.9 - i * 0.25))) * env;
          const bh = Math.max(4, amp * H * 0.62);
          ctx.fillStyle = i % 3 === 0 ? 'rgba(99, 102, 241, 0.32)' : 'rgba(56, 232, 255, 0.28)';
          ctx.fillRect(i * step + 2, (H - bh) * 0.5, Math.max(2, step - 4), bh);
        }
        // Crisp glowing cyan oscilloscope sine wave sweeping across
        ctx.strokeStyle = '#38e8ff';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        for (let x = 0; x <= W; x += 4) {
          const u = x / W;
          const env = Math.sin(u * Math.PI);
          const y = H * 0.5 + Math.sin(u * 18 - t * 5.2) * Math.cos(u * 7 + t * 2.1) * (H * 0.30) * env;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        break;
      }

      case 'aivillage': {
        // Warm minimalist cream sky, sage rolling hills, cottage, central fountain & R.E.P.O. stickmen!
        const sky = ctx.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#f3ede0');
        sky.addColorStop(0.55, '#f6f2e9');
        sky.addColorStop(1, '#c5d3b5');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, W, H);
        // Rolling sage hills
        ctx.fillStyle = '#c5d3b5';
        ctx.beginPath();
        ctx.moveTo(0, H * 0.56);
        ctx.quadraticCurveTo(W * 0.35, H * 0.42, W * 0.7, H * 0.54);
        ctx.quadraticCurveTo(W * 0.88, H * 0.50, W, H * 0.58);
        ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.closePath();
        ctx.fill();
        // Little terracotta cottage on left
        ctx.fillStyle = '#faf7f0'; ctx.strokeStyle = '#2c2a26'; ctx.lineWidth = 1.6;
        ctx.fillRect(W * 0.11, H * 0.48, 34, 24); ctx.strokeRect(W * 0.11, H * 0.48, 34, 24);
        ctx.fillStyle = '#c96d51';
        ctx.beginPath();
        ctx.moveTo(W * 0.11 - 5, H * 0.49); ctx.lineTo(W * 0.11 + 17, H * 0.33); ctx.lineTo(W * 0.11 + 39, H * 0.49);
        ctx.closePath(); ctx.fill(); ctx.stroke();
        // Central fountain on right-center
        const fx = W * 0.80, fy = H * 0.74;
        ctx.fillStyle = '#dcd3c1';
        ctx.beginPath(); ctx.ellipse(fx, fy, 26, 12, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#8fb3c2';
        ctx.beginPath(); ctx.ellipse(fx, fy - 1, 20, 8, 0, 0, Math.PI * 2); ctx.fill();
        const fp = Math.sin(t * 4.5) * 2;
        ctx.strokeStyle = 'rgba(250,247,240,0.9)'; ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(fx, fy - 12); ctx.quadraticCurveTo(fx - 9, fy - 24 - fp, fx - 13, fy - 2);
        ctx.moveTo(fx, fy - 12); ctx.quadraticCurveTo(fx + 9, fy - 24 - fp, fx + 13, fy - 2);
        ctx.stroke();
        // Two animated R.E.P.O.-head stickmen chatting!
        const drawMini = (sx, sy, dir, accent, phase) => {
          const flap = Math.max(0, Math.sin(t * 6.5 + phase)) * 0.65;
          ctx.save(); ctx.translate(sx, sy);
          ctx.strokeStyle = '#22211e'; ctx.lineWidth = 2; ctx.lineCap = 'round';
          ctx.beginPath();
          ctx.moveTo(0, -10); ctx.lineTo(-4, 0); ctx.moveTo(0, -10); ctx.lineTo(4, 0);
          ctx.moveTo(0, -10); ctx.lineTo(0, -21);
          ctx.moveTo(0, -19); ctx.lineTo(-6, -12); ctx.moveTo(0, -19); ctx.lineTo(6, -12);
          ctx.stroke();
          ctx.translate(0, -29);
          ctx.fillStyle = '#faf7f0'; ctx.lineWidth = 1.8;
          ctx.beginPath(); ctx.arc(0, 0, 8, 0.08, Math.PI - 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.save();
          ctx.translate(-7 * dir, 1); ctx.rotate(-flap * dir); ctx.translate(7 * dir, -1);
          ctx.beginPath(); ctx.arc(0, 0, 8, Math.PI - 0.08, 0.08); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.fillStyle = accent;
          ctx.beginPath(); ctx.arc(0, -2, 7.6, Math.PI * 1.05, Math.PI * 1.95); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.restore();
          ctx.restore();
        };
        drawMini(W * 0.25, H * 0.84, 1, '#c96d51', 0);
        drawMini(W * 0.64, H * 0.84, -1, '#6f8a6e', 2.2);
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

/* ==========================================================================
   llc-rifts.js — Alive Themed Rift Worlds, Authentic Titles & Pop-Out Art
   Renders 23 bespoke animated mini-worlds (pixelated scenes on low-res crisp
   canvases + smooth scenes on HD canvases), authentic in-game title logos,
   and charming characters/props that pop out over the torn white page edge.
   ========================================================================== */

window.LLCRifts = (() => {
  // Exact W.A.M. pixel bitmap glyphs (from W.A.M. / Laverse solar.js)
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
    return `<svg class="title-wam-svg" viewBox="0 0 ${x} 12" shape-rendering="crispEdges" aria-hidden="true"><path fill="#14291e" transform="translate(1 1)" d="${d}"/><path fill="#ffffff" d="${d}"/></svg>`;
  }

  /* ------------------------------------------------------------------------
     Authentic Title Renderer (exact in-game title style per website)
     ------------------------------------------------------------------------ */
  function buildTitleHTML(site, assetBase) {
    if (site.titleImg) {
      const cls = site.titleStyle === 'img-tall' ? 'rift-title-img tall' : 'rift-title-img';
      return `<img class="${cls}" src="${assetBase}${site.titleImg}" alt="${site.title}" draggable="false" />`;
    }
    switch (site.titleStyle) {
      case 'wam':
        return `<span class="sr-only">${site.title}</span>${wamSVG('W.A.M.')}`;
      case 'ashaad': {
        const letters = [
          ['A', '#9b6bff'], ['S', '#d45cb8'], ['H', '#f05a54'],
          ['A', '#e68c3e'], ['A', '#b8bf4a'], ['D', '#5bd662'],
        ];
        const rainbow = letters.map(([c, col]) => `<span style="color:${col}">${c}</span>`).join('');
        return `<div class="rt-ashaad"><div class="rt-ash-top">THE BINDING OF</div><div class="rt-ash-bot">${rainbow}</div></div>`;
      }
      case 'void':
        return `<div class="rt-void"><span class="rt-void-top">THE</span><span class="rt-void-bot">V<span class="rt-void-o"></span>ID</span></div>`;
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
     Pop-Out Characters & Props (positioned along the torn rift rim;
     peek gently at rest and spring outward over the white page on hover!)
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
    // Real pixel character sprites from the repo for The Binding of Ashaad!
    if (k === 'ashaad') {
      return `
        <img class="pop-el pop-left pop-sprite" src="${assetBase}games/ashaad/ashaad.png" alt="" aria-hidden="true" />
        <img class="pop-el pop-right pop-sprite" src="${assetBase}games/ashaad/finley.png" alt="" aria-hidden="true" />
      `;
    }

    const PIX_POPS = {
      forge: {
        left: pxSvg([
          '........oo',
          '.......oGG',
          '......oGGo',
          '.....oGGo.',
          '....oGGo..',
          '..ooGGo...',
          '.oMMoo....',
          '..oBo.....',
          '.oBBo.....',
          'oBBo......',
        ], { o: '#160a08', G: '#ffcf5c', M: '#ff7b24', B: '#8c5328' }, 10, 10),
        right: pxSvg([
          '....oo....',
          '...oCCo...',
          '..oCWWCo..',
          '.oCCWWCCo.',
          '.oCCCCCCo.',
          '..oCCCCo..',
          '...oCCo...',
          '....oo....',
        ], { o: '#0b2229', C: '#3ed4d8', W: '#d8ffff' }, 10, 8),
      },
      cast: {
        left: pxSvg([
          '....oooo....',
          '..ooTTTTto..',
          '.oTTWTTTTTo.',
          'oTTBTTTTTTTo',
          '.oTTTTTTTTo.',
          '..ooTTTTto..',
          '....oooo....',
        ], { o: '#03182e', T: '#48cae4', t: '#1b8ab0', W: '#ffffff', B: '#04121f' }, 12, 7),
        right: pxSvg([
          '...oo...',
          '..oRRo..',
          '.oRRRRo.',
          '.oWWWWo.',
          '..oWWo..',
          '...oo...',
          '...o....',
          '...o....',
        ], { o: '#101820', R: '#e84848', W: '#ffffff' }, 8, 8),
      },
      mine: {
        left: pxSvg([
          '..oooooo..',
          '.oYYYYYYo.',
          '.oYBYBYBo.',
          '.oYYYYYYo.',
          '..oGGGGoo.',
          '.oGGGGGGGo',
          '.oGGYYGGGo',
          '..oo..oo..',
        ], { o: '#1a0e06', Y: '#ffd23a', B: '#0e1620', G: '#7a8a9c' }, 10, 8),
        right: pxSvg([
          '..ooooo...',
          '.oGGGGGoo.',
          'oGGo..oBBo',
          'oo....oBo.',
          '.....oBo..',
          '....oBo...',
          '...oBo....',
        ], { o: '#1a0e06', G: '#ffd23a', B: '#9a6234' }, 10, 7),
      },
      roguelike: {
        left: pxSvg([
          '....oo....',
          '...oCCo...',
          '..oCWWCo..',
          '.oCCCCCCo.',
          '.oCCBBCCo.',
          '.oCCCCCCo.',
          '..oCCCCo..',
          '...oooo...',
        ], { o: '#141a2b', C: '#7bc6ff', W: '#ffffff', B: '#2c5da8' }, 10, 8),
        right: pxSvg([
          '.oo....oo.',
          'oYYo..oYYo',
          'oYYYoYYYYo',
          'oYRYRYRYRo',
          'oYYYYYYYYo',
          '.oooooooo.',
        ], { o: '#261408', Y: '#ffd24c', R: '#e63946' }, 10, 6),
      },
      llccards: {
        left: pxSvg([
          'ooooooo...',
          'oWWWWWo...',
          'oWBBBWoooo',
          'oWBBBWooWo',
          'oWWWWWoBWo',
          'oWWWWWoWWo',
          'oooooooWWo',
          '....oooooo',
        ], { o: '#000000', W: '#ffffff', B: '#111111' }, 10, 8),
        right: pxSvg([
          '...oo...',
          '..oWWo..',
          '.oWWWWo.',
          'oWWWWWWo',
          '.oWWWWo.',
          '..oWWo..',
          '...oo...',
        ], { o: '#000000', W: '#ffffff' }, 8, 7),
      },
      aiquiz: {
        left: pxSvg([
          '....oo....',
          '.oooooooo.',
          'oCCCCCCCCo',
          'oCBBCCBBCo',
          'oCCCCCCCCo',
          'oCCMMMMCCo',
          '.oooooooo.',
        ], { o: '#061428', C: '#7ef3ff', B: '#0a1430', M: '#ff5ad2' }, 10, 7),
        right: pxSvg([
          '..oooo..',
          '.oMMMMo.',
          'oMMooMMo',
          '....oMMo',
          '...oMMo.',
          '........',
          '...oCCo.',
        ], { o: '#061428', M: '#ff5ad2', C: '#7ef3ff' }, 8, 7),
      },
      escapeca: {
        left: pxSvg([
          '..oooooo..',
          '.oWWWWWWo.',
          'oWWWRRWWWo',
          'oWWRRRRWWo',
          '.oWWWWWWo.',
          '..oooooo..',
        ], { o: '#14040a', W: '#f4e8ee', R: '#ff1a3a' }, 10, 6),
        right: pxSvg([
          '...oo...',
          '..oRRo..',
          '..oRRo..',
          '..oRRo..',
          '...oo...',
          '........',
          '..oRRo..',
        ], { o: '#1a040c', R: '#ff2840' }, 8, 7),
      },
      wam: {
        left: pxSvg([
          '.......oo',
          '......oWW',
          '.....oWWo',
          '....oWWo.',
          '...oWWo..',
          '.ooWWo...',
          'oGGo.....',
          '.oBo.....',
          'oBo......',
        ], { o: '#111914', W: '#eef6f0', G: '#ffd24c', B: '#8c5630' }, 9, 9),
        right: pxSvg([
          '..oooo..',
          '.oGGGGo.',
          'oGWWWWGo',
          '.oGGGGo.',
          '...oBo..',
          '...oBo..',
          '...oBo..',
          '...oBo..',
        ], { o: '#111914', G: '#48c774', W: '#d8ffe4', B: '#7d4a26' }, 8, 8),
      },
      void: {
        left: pxSvg([
          '..oooo..',
          '.oWWWWo.',
          '.oWCCWo.',
          '.oWWWWo.',
          'ooWWWWoo',
          '.oWWWWo.',
          '.oo..oo.',
        ], { o: '#140826', W: '#f4eeff', C: '#62d4ff' }, 8, 7),
        right: pxSvg([
          '...o....',
          '..oPo...',
          'ooPWPoo.',
          '..oPo...',
          '...o....',
        ], { o: '#280d4a', P: '#c04df0', W: '#ffffff' }, 8, 5),
      },
      sea: {
        left: pxSvg([
          '...oo...',
          '...oCo..',
          '..oBBo..',
          '.oBWWBo.',
          '.oBPPBo.',
          '.oBPPBo.',
          '.oBBBBo.',
          '..oooo..',
        ], { o: '#031e4d', C: '#b87a44', B: '#7ae2f2', W: '#ffffff', P: '#f3dfae' }, 8, 8),
        right: pxSvg([
          '....oo....',
          '..ooWWoo..',
          '.oWWBBBBoo',
          'oBBBBBBBB.',
        ], { o: '#031e4d', W: '#e6fbff', B: '#48cae4' }, 10, 4),
      },
      terra: {
        left: pxSvg([
          '....oooo....',
          '..ooGGGGoo..',
          '.oGGBBGGGGo.',
          'oBBBGGBBBBBo',
          'oBBBBGGGGBBo',
          '.oBBBBGGGGo.',
          '..ooBBBBoo..',
          '....oooo....',
        ], { o: '#121826', G: '#6ab04c', B: '#3b82c4' }, 12, 8),
        right: pxSvg([
          '..o..',
          '.oYo.',
          'oYWYo',
          '.oYo.',
          '..o..',
        ], { o: '#2b2010', Y: '#ffd55a', W: '#ffffff' }, 5, 5),
      },
      tung: {
        left: pxSvg([
          '.oooooo.',
          'oBBBBBB.',
          'oBWBWBB.',
          'oBBBBBB.',
          'oBooooB.',
          'oBBBBBB.',
          '.oooooo.',
        ], { o: '#241206', B: '#c68a50', W: '#fff5e0' }, 8, 7),
        right: pxSvg([
          'o......o',
          'oo.oo.oo',
          'oooooooo',
          '.oooooo.',
          '..oooo..',
        ], { o: '#4a2a14' }, 8, 5),
      },
      pmuseum: {
        left: pxSvg([
          '...oo...',
          '..oCCo..',
          '.oCWWCo.',
          'oCCCCCCo',
          '.oCCCCo.',
          '..oCCo..',
          '...oo...',
        ], { o: '#05222c', C: '#3ad8e0', W: '#d8ffff' }, 8, 7),
        right: pxSvg([
          'oYYYYo',
          '.oYYo.',
          '.oYYo.',
          'oYYYYo',
          'oooooo',
        ], { o: '#241806', Y: '#ffd24c' }, 6, 5),
      },
      ddom: {
        left: pxSvg([
          '.oo..oo.',
          'oPPooPPo',
          '.oooooo.',
          '..oPPo..',
          '.oPPPPo.',
          '.oPPPPo.',
          '..oooo..',
        ], { o: '#2b1a10', P: '#e89b62' }, 8, 7),
        right: pxSvg([
          'oo..oo',
          'oP..Po',
          '.oooo.',
          'oPPPPo',
          '.oooo.',
        ], { o: '#2b1a10', P: '#f4c794' }, 6, 5),
      },
    };

    if (PIX_POPS[k]) {
      return `
        <span class="pop-el pop-left pop-pix">${PIX_POPS[k].left}</span>
        <span class="pop-el pop-right pop-pix">${PIX_POPS[k].right}</span>
      `;
    }

    // Crisp vector pop-outs for smooth modern sites
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
     23 Bespoke Animated Rift World Renderers (viewport-culled ~20fps)
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
        // Warm brick basement floor/wall + flickering corner candles + falling blue tears
        ctx.fillStyle = '#3b200f';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#2c160a';
        for (let y = 0; y < H; y += 12) {
          ctx.fillRect(0, y, W, 1);
          const off = (y / 12) % 2 === 0 ? 0 : 8;
          for (let x = off; x < W; x += 16) ctx.fillRect(x, y, 1, 12);
        }
        // Subtle radial dungeon torch glow from left & right
        const fl = 0.85 + 0.15 * Math.sin(t * 9.5);
        const drawCandle = (cx, cy) => {
          ctx.fillStyle = `rgba(255, 165, 55, ${0.22 * fl})`;
          ctx.fillRect(cx - 12, cy - 10, 24, 22);
          ctx.fillStyle = '#e8dcc0';
          ctx.fillRect(cx - 1, cy + 1, 3, 7);
          ctx.fillStyle = '#ff6d1f';
          ctx.fillRect(cx - 1, cy - 3, 3, 4);
          ctx.fillStyle = '#fff19c';
          ctx.fillRect(cx, cy - 2 - ((t * 6) | 0) % 2, 1, 2);
        };
        drawCandle(18, H - 14);
        drawCandle(W - 19, H - 14);
        // Falling tears
        ctx.fillStyle = '#7cd4ff';
        for (let i = 0; i < 6; i++) {
          const x = Math.floor(14 + hash(i + 1) * (W - 28));
          const y = Math.floor(((t * 14 + hash(i + 9) * H) % H));
          ctx.fillRect(x, y, 2, 3);
        }
        break;
      }

      case 'forge': {
        // Glowing warm volcanic hearth + rising orange embers + cyan rune shimmer
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#180d12');
        g.addColorStop(0.65, '#3b1510');
        g.addColorStop(1, '#8c2f10');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Brick forge silhouette
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        for (let y = 0; y < H; y += 8) ctx.fillRect(0, y, W, 1);
        // Rising embers
        for (let i = 0; i < 18; i++) {
          const x = Math.floor(hash(i * 3) * W + Math.sin(t * 2 + i) * 3);
          const y = Math.floor(H - ((t * (10 + (i % 5) * 3) + hash(i) * H) % (H + 6)));
          ctx.fillStyle = i % 4 === 0 ? '#5af0f0' : i % 2 === 0 ? '#ffd85c' : '#ff6b1a';
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      }

      case 'roguelike': {
        // Split crimson Isaac dungeon + emerald Spire glow + floating golden sparks
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#2a0f18');
        g.addColorStop(0.5, '#171124');
        g.addColorStop(1, '#0e2824');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Stone tile hint
        ctx.fillStyle = 'rgba(255,255,255,0.04)';
        for (let y = 0; y < H; y += 10) for (let x = 0; x < W; x += 14) {
          if (((x + y) / 2) % 2 === 0) ctx.fillRect(x, y, 13, 9);
        }
        // Floating golden relic sparks
        for (let i = 0; i < 14; i++) {
          const x = Math.floor(hash(i + 2) * W);
          const y = Math.floor((H - (t * 8 + hash(i + 7) * H) % H));
          ctx.fillStyle = i % 3 === 0 ? '#4ae3b5' : i % 3 === 1 ? '#ff6b7a' : '#ffd24c';
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      }

      case 'llccards': {
        // Monochrome hand-inked crosshatch canvas with twinkling stark white/black diamonds
        ctx.fillStyle = '#141418';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = '#24242b';
        for (let x = -H; x < W + H; x += 10) {
          for (let y = 0; y < H; y += 2) {
            ctx.fillRect(x + (y >> 1), y, 1, 1);
          }
        }
        // Floating white card silhouettes drifting gently
        for (let i = 0; i < 6; i++) {
          const x = Math.floor(10 + hash(i + 3) * (W - 22));
          const y = Math.floor(8 + hash(i + 8) * (H - 18) + Math.sin(t * 2 + i) * 2);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x, y, 6, 8);
          ctx.fillStyle = '#141418';
          ctx.fillRect(x + 1, y + 1, 4, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(x + 2, y + 3, 2, 2);
        }
        break;
      }

      case 'cast': {
        // Evening pixel dock over shimmering turquoise water ripples
        ctx.fillStyle = '#072240';
        ctx.fillRect(0, 0, W, Math.floor(H * 0.45));
        ctx.fillStyle = '#0e4770';
        ctx.fillRect(0, Math.floor(H * 0.45), W, H);
        // Stars
        ctx.fillStyle = '#d8f6ff';
        for (let i = 0; i < 10; i++) {
          ctx.fillRect(Math.floor(hash(i + 5) * W), Math.floor(hash(i + 12) * H * 0.38), 1, 1);
        }
        // Animated water sparkles
        for (let i = 0; i < 14; i++) {
          const y = Math.floor(H * 0.5 + hash(i + 1) * H * 0.44);
          const x = Math.floor((hash(i + 4) * W + Math.sin(t * 2.2 + i) * 6 + W) % W);
          ctx.fillStyle = i % 2 === 0 ? '#7ae4f5' : '#2a8ab8';
          ctx.fillRect(x, y, 7, 1);
        }
        // Wooden dock planks bottom left
        ctx.fillStyle = '#6e4522';
        ctx.fillRect(0, H - 9, 34, 9);
        ctx.fillStyle = '#4c2c12';
        for (let x = 4; x < 34; x += 6) ctx.fillRect(x, H - 9, 1, 9);
        break;
      }

      case 'mine': {
        // Layered underground earth strata + glinting gold/emerald ore + robot lights
        const bands = ['#382213', '#2e1b0f', '#24150c', '#1a0f08'];
        const bh = Math.ceil(H / bands.length);
        bands.forEach((c, idx) => {
          ctx.fillStyle = c;
          ctx.fillRect(0, idx * bh, W, bh);
        });
        // Carved tunnel band
        ctx.fillStyle = '#120a06';
        ctx.fillRect(10, Math.floor(H * 0.42), W - 20, Math.floor(H * 0.24));
        // Glinting ore clusters
        for (let i = 0; i < 16; i++) {
          const x = Math.floor(hash(i + 2) * (W - 6) + 3);
          const y = Math.floor(hash(i + 15) * (H - 6) + 3);
          const blink = Math.sin(t * 4 + i * 2) > 0.5;
          ctx.fillStyle = i % 4 === 0 ? '#4ad4a8' : blink ? '#fff09c' : '#e6a832';
          ctx.fillRect(x, y, 2, 2);
        }
        break;
      }

      case 'lsu': {
        // Midnight neon-phonk rhythm field with pulsing hot-pink approach circles
        const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 10, W * 0.5, H * 0.5, W * 0.65);
        g.addColorStop(0, '#2a0822');
        g.addColorStop(1, '#0d040c');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 4; i++) {
          const cx = W * (0.18 + i * 0.22);
          const cy = H * (i % 2 === 0 ? 0.34 : 0.68);
          const phase = ((t * 0.9 + i * 0.27) % 1);
          const r = 10 + (1 - phase) * 28;
          ctx.strokeStyle = `rgba(255, 61, 127, ${0.15 + phase * 0.65})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(255, 61, 127, 0.22)';
          ctx.beginPath();
          ctx.arc(cx, cy, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        break;
      }

      case 'aiquiz': {
        // Split cyan pixel vs hot-magenta digital grid with floating scan pixels
        const g = ctx.createLinearGradient(0, 0, W, 0);
        g.addColorStop(0, '#071b30');
        g.addColorStop(0.5, '#0d0f26');
        g.addColorStop(1, '#260a2a');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(87, 240, 255, 0.09)';
        for (let x = 0; x < W; x += 10) ctx.fillRect(x, 0, 1, H);
        for (let y = 0; y < H; y += 10) ctx.fillRect(0, y, W, 1);
        for (let i = 0; i < 12; i++) {
          const x = Math.floor(((hash(i + 2) * W + t * (i % 2 ? 9 : -9)) % W + W) % W);
          const y = Math.floor(hash(i + 9) * H);
          ctx.fillStyle = x < W / 2 ? '#57f0ff' : '#ff5ad2';
          ctx.fillRect(x, y, 3, 2);
        }
        break;
      }

      case 'escapeca': {
        // Dark eerie school corridor with flickering ceiling strip & red horror glow
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#180510');
        g.addColorStop(0.6, '#260818');
        g.addColorStop(1, '#0e0308');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Flickering hallway light
        const flick = Math.sin(t * 17) > -0.65;
        if (flick) {
          ctx.fillStyle = 'rgba(255, 42, 70, 0.16)';
          ctx.fillRect(W * 0.25, 0, W * 0.5, H);
          ctx.fillStyle = '#ff6b80';
          ctx.fillRect(W * 0.36, 3, W * 0.28, 2);
        }
        // Locker silhouettes on sides
        ctx.fillStyle = '#120309';
        for (let x = 6; x < 34; x += 7) ctx.fillRect(x, 12, 5, H - 18);
        for (let x = W - 34; x < W - 6; x += 7) ctx.fillRect(x, 12, 5, H - 18);
        break;
      }

      case 'wam': {
        // Lush dark pixel RPG battlefield with moving golden timing bar & emerald sparks
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#0c1c16');
        g.addColorStop(0.7, '#163526');
        g.addColorStop(1, '#204930');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Subtle timing bar along bottom
        ctx.fillStyle = '#0b140f';
        ctx.fillRect(22, H - 10, W - 44, 4);
        ctx.fillStyle = '#48c774';
        ctx.fillRect(Math.floor(W * 0.44), H - 10, Math.floor(W * 0.12), 4);
        const cx = Math.floor(24 + ((Math.sin(t * 2.8) + 1) * 0.5) * (W - 50));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(cx, H - 11, 2, 6);
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = i % 2 === 0 ? '#a8f5c0' : '#ffd24c';
          ctx.fillRect(Math.floor(hash(i + 4) * W), Math.floor((H - (t * 7 + hash(i) * H) % H)), 2, 2);
        }
        break;
      }

      case 'void': {
        // Deep violet-black abyss + swirling luminous accretion disk & starfield
        ctx.fillStyle = '#070212';
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 24; i++) {
          const x = Math.floor(hash(i + 1) * W);
          const y = Math.floor(hash(i + 17) * H);
          ctx.fillStyle = i % 3 === 0 ? '#d8a6ff' : '#ffffff';
          ctx.fillRect(x, y, 1, 1);
        }
        // Swirling accretion dots around center
        const cx = W * 0.5, cy = H * 0.52;
        for (let i = 0; i < 22; i++) {
          const a = t * 1.4 + (i / 22) * Math.PI * 2;
          const rx = 24 + (i % 4) * 7;
          const ry = 8 + (i % 3) * 3;
          ctx.fillStyle = i % 2 === 0 ? '#c04df0' : '#f2c8ff';
          ctx.fillRect(Math.floor(cx + Math.cos(a) * rx), Math.floor(cy + Math.sin(a) * ry), 2, 2);
        }
        break;
      }

      case 'gallery': {
        // Sunlit warm contemporary museum wall, overhead spotlight cones & oak floor strip
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#ede7da');
        g.addColorStop(0.14, '#f8f4ec');
        g.addColorStop(0.76, '#efe8da');
        g.addColorStop(0.76, '#c9ae85');
        g.addColorStop(1, '#bfa174');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Track rail
        ctx.fillStyle = '#3c3630';
        ctx.fillRect(0, H * 0.11, W, 2.5);
        // Soft spotlight cones
        for (const frac of [0.24, 0.5, 0.76]) {
          const sx = W * frac;
          const cg = ctx.createRadialGradient(sx, H * 0.14, 2, sx, H * 0.55, H * 0.55);
          cg.addColorStop(0, 'rgba(255, 250, 224, 0.65)');
          cg.addColorStop(1, 'rgba(255, 250, 224, 0)');
          ctx.fillStyle = cg;
          ctx.beginPath();
          ctx.moveTo(sx - 6, H * 0.12);
          ctx.lineTo(sx + 6, H * 0.12);
          ctx.lineTo(sx + 58, H * 0.78);
          ctx.lineTo(sx - 58, H * 0.78);
          ctx.closePath();
          ctx.fill();
        }
        // Subtle tiny framed squares on left & right walls
        ctx.fillStyle = '#8c5a32';
        ctx.fillRect(W * 0.08, H * 0.28, 28, 28);
        ctx.fillStyle = '#faf7f0';
        ctx.fillRect(W * 0.08 + 4, H * 0.28 + 4, 20, 20);
        ctx.fillStyle = '#c84b31';
        ctx.fillRect(W * 0.08 + 7, H * 0.28 + 7, 14, 14);
        break;
      }

      case 'ddom': {
        // Shimmering warm golden/caramel Maggie photo mosaic grid!
        const pal = ['#3a2518', '#5c3b24', '#8c5a36', '#b87a48', '#d99c64', '#f0cfa0', '#faf2e1', '#70492c'];
        const tile = 7;
        for (let y = 0; y < H; y += tile) {
          for (let x = 0; x < W; x += tile) {
            const idx = Math.floor((hash(x * 0.37 + y * 0.71) * pal.length + Math.sin(t * 1.4 + x * 0.1 + y * 0.08) * 0.6 + pal.length)) % pal.length;
            ctx.fillStyle = pal[idx];
            ctx.fillRect(x, y, tile - 1, tile - 1);
          }
        }
        // Soft warm vignette so DDOM logo pops cleanly
        ctx.fillStyle = 'rgba(26, 16, 10, 0.42)';
        ctx.fillRect(0, 0, W, H);
        break;
      }

      case 'typefall': {
        // Warm cream parchment paper with gently drifting Times New Roman letters
        ctx.fillStyle = '#f7f2e7';
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(24, 20, 16, 0.18)';
        ctx.font = 'italic 15px "Times New Roman", Times, serif';
        const chars = 'abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < 24; i++) {
          const x = hash(i + 3) * (W - 14) + 6;
          const y = ((t * (14 + (i % 4) * 5) + hash(i + 11) * (H + 20)) % (H + 20)) - 10;
          ctx.fillText(chars[(i * 7) % 26], x, y);
        }
        break;
      }

      case 'shaders': {
        // Deep cyan-indigo void with a rotating 4D wireframe hypercube (tesseract)!
        const g = ctx.createRadialGradient(W * 0.5, H * 0.5, 6, W * 0.5, H * 0.5, W * 0.65);
        g.addColorStop(0, '#102238');
        g.addColorStop(1, '#060a14');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        const a = t * 0.75, b = t * 0.45;
        const verts = [];
        for (let i = 0; i < 16; i++) {
          let x = i & 1 ? 1 : -1, y = i & 2 ? 1 : -1, z = i & 4 ? 1 : -1, w = i & 8 ? 1 : -1;
          const nx = x * Math.cos(a) - w * Math.sin(a);
          const nw = x * Math.sin(a) + w * Math.cos(a);
          const nz = z * Math.cos(b) - nw * Math.sin(b);
          const w2 = z * Math.sin(b) + nw * Math.cos(b);
          const k = 1 / (2.6 - w2 * 0.75);
          const rx = nx * k * Math.cos(b) + nz * k * Math.sin(b);
          const ry = y * k;
          verts.push([W * 0.5 + rx * 42, H * 0.5 + ry * 34, (w2 + 1) * 0.5]);
        }
        ctx.lineWidth = 1.25;
        for (let i = 0; i < 16; i++) {
          for (let bit = 0; bit < 4; bit++) {
            const j = i ^ (1 << bit);
            if (j <= i) continue;
            ctx.strokeStyle = verts[i][2] > 0.5 ? 'rgba(58, 208, 240, 0.42)' : 'rgba(210, 74, 240, 0.36)';
            ctx.beginPath();
            ctx.moveTo(verts[i][0], verts[i][1]);
            ctx.lineTo(verts[j][0], verts[j][1]);
            ctx.stroke();
          }
        }
        break;
      }

      case 'terra': {
        // Space starfield with 3 tiny colorful orbiting pixel planets
        ctx.fillStyle = '#090e1a';
        ctx.fillRect(0, 0, W, H);
        for (let i = 0; i < 22; i++) {
          ctx.fillStyle = i % 3 === 0 ? '#ffe59c' : '#d6e4ff';
          ctx.fillRect(Math.floor(hash(i + 2) * W), Math.floor(hash(i + 13) * H), 1, 1);
        }
        const orbs = [
          { r: 52, sp: 0.7, c1: '#6ab04c', c2: '#3b82c4', sz: 6 },
          { r: 34, sp: -1.1, c1: '#e87a4a', c2: '#ffd25c', sz: 5 },
          { r: 66, sp: 0.5, c1: '#a27cf0', c2: '#5ad0e6', sz: 5 },
        ];
        orbs.forEach((o, i) => {
          const px = Math.floor(W * 0.5 + Math.cos(t * o.sp + i * 2) * o.r);
          const py = Math.floor(H * 0.5 + Math.sin(t * o.sp + i * 2) * (o.r * 0.35));
          ctx.fillStyle = o.c2;
          ctx.fillRect(px - 2, py - 2, o.sz, o.sz);
          ctx.fillStyle = o.c1;
          ctx.fillRect(px - 1, py - 2, o.sz - 2, o.sz - 2);
        });
        break;
      }

      case 'tung': {
        // Warm carved concentric cedar tree-rings pulsing gently to a drumbeat
        ctx.fillStyle = '#381e0d';
        ctx.fillRect(0, 0, W, H);
        const pulse = 1 + 0.04 * Math.sin(t * 5.2);
        const cx = W * 0.5, cy = H * 0.52;
        const rings = ['#7a4822', '#5c3214', '#9e6836', '#4a260e', '#b87d44', '#633716'];
        for (let r = 82; r > 6; r -= 10) {
          ctx.strokeStyle = rings[(r / 10 | 0) % rings.length];
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.ellipse(cx, cy, r * pulse, r * 0.55 * pulse, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;
      }

      case 'pmuseum': {
        // Dark-teal pixel museum hall with glowing cyan columns & floating relic dust
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#05141e');
        g.addColorStop(1, '#0c2c38');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        ctx.fillStyle = 'rgba(58, 216, 224, 0.14)';
        for (let x = 14; x < W; x += 28) ctx.fillRect(x, 0, 4, H);
        for (let i = 0; i < 14; i++) {
          ctx.fillStyle = i % 3 === 0 ? '#ffd24c' : '#7ef8ff';
          ctx.fillRect(Math.floor(hash(i + 5) * W), Math.floor((H - (t * 8 + hash(i) * H) % H)), 2, 2);
        }
        break;
      }

      case 'sea': {
        // Starry midnight pixel sky + rolling luminous ocean waves + bobbing pixel bottles
        ctx.fillStyle = '#031b4a';
        ctx.fillRect(0, 0, W, Math.floor(H * 0.48));
        ctx.fillStyle = '#073b7a';
        ctx.fillRect(0, Math.floor(H * 0.48), W, H);
        ctx.fillStyle = '#d8f4ff';
        for (let i = 0; i < 14; i++) {
          ctx.fillRect(Math.floor(hash(i + 1) * W), Math.floor(hash(i + 8) * H * 0.4), 1, 1);
        }
        // Rolling waves
        for (let row = 0; row < 4; row++) {
          const baseY = Math.floor(H * 0.5 + row * 8);
          ctx.fillStyle = row === 0 ? '#7ae4f5' : row === 1 ? '#36a4d4' : '#1b6eb0';
          for (let x = 0; x < W; x += 4) {
            const wy = baseY + Math.round(Math.sin(x * 0.12 + t * (1.8 + row * 0.4) + row) * 2);
            ctx.fillRect(x, wy, 4, 2);
          }
        }
        break;
      }

      case 'atlas': {
        // Airy crisp sky-white horizon with a gently spinning shaded mini Earth & red flight arc!
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#f6fafe');
        g.addColorStop(1, '#dcebf9');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Subtle lat/lon grid lines
        ctx.strokeStyle = 'rgba(37, 99, 168, 0.08)';
        ctx.lineWidth = 1;
        for (let x = 28; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
        for (let y = 22; y < H; y += 30) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
        // Perfect-circle spinning Earth on the right side
        const gx = W * 0.82, gy = H * 0.52, gr = Math.min(H * 0.36, W * 0.14);
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
        const shift = (t * 16) % span;
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
        // Subtle sunlit atmosphere rim
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.32)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(gx, gy, gr - 1, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // Red dashed travel route curve + tiny pin dot
        ctx.strokeStyle = 'rgba(214, 69, 56, 0.58)';
        ctx.setLineDash([4, 4]);
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(W * 0.14, H * 0.72);
        ctx.quadraticCurveTo(W * 0.48, H * 0.14, gx - gr * 0.25, gy - gr * 0.15);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#d64538';
        ctx.beginPath();
        ctx.arc(gx - gr * 0.25, gy - gr * 0.15, 3.5, 0, Math.PI * 2);
        ctx.fill();
        break;
      }

      case 'terrain': {
        // Smooth sculpted undulating alpine terrain contour bands
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#132a2e');
        g.addColorStop(1, '#1d473d');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        const layers = [
          { y: 0.42, amp: 14, freq: 0.012, sp: 0.5, col: '#286452' },
          { y: 0.58, amp: 12, freq: 0.016, sp: -0.7, col: '#358565' },
          { y: 0.74, amp: 10, freq: 0.02, sp: 0.9, col: '#4fa87c' },
          { y: 0.88, amp: 7, freq: 0.024, sp: -0.6, col: '#7fd19e' },
        ];
        for (const L of layers) {
          ctx.fillStyle = L.col;
          ctx.beginPath();
          ctx.moveTo(0, H);
          for (let x = 0; x <= W; x += 8) {
            const yy = H * L.y + Math.sin(x * L.freq + t * L.sp) * L.amp + Math.cos(x * L.freq * 1.7) * (L.amp * 0.4);
            ctx.lineTo(x, yy);
          }
          ctx.lineTo(W, H);
          ctx.closePath();
          ctx.fill();
        }
        break;
      }

      case 'recommend': {
        // Warm cinema charcoal with sweeping golden projector beams & soft bokeh
        const g = ctx.createLinearGradient(0, 0, W, H);
        g.addColorStop(0, '#171411');
        g.addColorStop(0.5, '#211912');
        g.addColorStop(1, '#120f0d');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
        // Sweeping golden spotlight
        const bx = W * (0.5 + 0.28 * Math.sin(t * 0.7));
        const bg = ctx.createRadialGradient(bx, H * 0.35, 4, bx, H * 0.5, W * 0.45);
        bg.addColorStop(0, 'rgba(245, 200, 100, 0.24)');
        bg.addColorStop(1, 'rgba(245, 200, 100, 0)');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, W, H);
        // Film sprocket accents along top/bottom
        ctx.fillStyle = 'rgba(245, 214, 142, 0.14)';
        for (let x = 10; x < W; x += 22) {
          ctx.fillRect(x, 7, 10, 4);
          ctx.fillRect(x, H - 11, 10, 4);
        }
        break;
      }

      case 'channels': {
        // Sleek dark studio with live animated red audio/view bars
        ctx.fillStyle = '#141114';
        ctx.fillRect(0, 0, W, H);
        const bars = 28;
        const bw = W / bars;
        for (let i = 0; i < bars; i++) {
          const h = 10 + (Math.sin(t * 3.5 + i * 0.7) * 0.5 + 0.5) * (H * 0.44);
          ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 0, 51, 0.28)' : 'rgba(255, 80, 105, 0.16)';
          ctx.fillRect(i * bw + 2, H - h, bw - 4, h);
        }
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
        item.canvas.height = 56;
      }
      return;
    }
    const r = item.el.getBoundingClientRect();
    const tw = Math.max(240, Math.round(r.width || 540));
    const th = Math.max(100, Math.round(r.height || 144));
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
      canvas.height = 56;
    } else {
      canvas.width = 560;
      canvas.height = 144;
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
    buildTitleHTML,
    buildPopoutsHTML,
    reset,
    register,
  };
})();

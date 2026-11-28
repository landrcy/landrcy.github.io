/* ==========================================================================
   llc-app.js — LLC Procedural Reality-Crack Directory Renderer
   Mounts 23 unique dimensional fissures with radiating fracture veins,
   recessed live mini-worlds, big authentic game titles & pop-out characters.
   ========================================================================== */

(() => {
  const SITES = window.LLC_SITES || [];
  const CATEGORIES = window.LLC_CATEGORIES || [];
  const Rifts = window.LLCRifts;
  const catTitles = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.title]));

  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function buildRiftCell(site, showMeta, assetBase) {
    const li = document.createElement('li');
    li.className = 'rift-cell';

    if (showMeta) {
      const strip = document.createElement('div');
      strip.className = 'rift-meta-strip';
      strip.innerHTML = `<span>${catTitles[site.category] || site.category}</span><span>${formatDate(site.added)}</span>`;
      li.appendChild(strip);
    }

    const isLight = site.scene === 'gallery' || site.scene === 'typefall' || site.scene === 'atlas';
    const geom = Rifts.buildCrackGeometry(site);

    const a = document.createElement('a');
    a.className =
      'rift-card' +
      (site.pixel ? ' is-pixel' : ' is-smooth') +
      (isLight ? ' is-light' : '');
    a.href = site.url;
    a.dataset.siteId = site.id;
    a.setAttribute('aria-label', site.title);
    a.style.setProperty('--rim', site.rim || '#111111');
    a.style.setProperty('--rift-bg', site.bg || '#18181c');

    a.innerHTML = `
      <div class="rift-shell">
        <div class="rift-portal" style="clip-path:${geom.clipPolygon}">
          <canvas class="rift-bg-canvas" aria-hidden="true"></canvas>
          <div class="rift-depth" aria-hidden="true"></div>
          <div class="rift-title-layer">${Rifts.buildTitleHTML(site, assetBase)}</div>
        </div>
      </div>
      ${geom.svgMarkup}
      ${Rifts.buildPopoutsHTML(site, assetBase)}
    `;

    const canvas = a.querySelector('.rift-bg-canvas');
    Rifts.register(a, canvas, site);

    li.appendChild(a);
    return li;
  }

  function renderCategorized(container, assetBase) {
    Rifts.reset();
    container.innerHTML = '';

    for (const cat of CATEGORIES) {
      const items = SITES.filter((s) => s.category === cat.id);
      if (!items.length) continue;

      const sec = document.createElement('section');
      sec.className = 'category-block';
      sec.setAttribute('aria-labelledby', `cat-${cat.id}`);

      const head = document.createElement('div');
      head.className = 'category-head';
      head.innerHTML = `<h2 class="category-title" id="cat-${cat.id}"></h2><span class="category-count"></span>`;
      head.querySelector('.category-title').textContent = cat.title;
      head.querySelector('.category-count').textContent = String(items.length);
      sec.appendChild(head);

      const ul = document.createElement('ul');
      ul.className = 'rift-grid';
      for (const site of items) ul.appendChild(buildRiftCell(site, false, assetBase));
      sec.appendChild(ul);
      container.appendChild(sec);
    }
  }

  function renderNewest(container, assetBase) {
    Rifts.reset();
    container.innerHTML = '';

    const sorted = SITES.slice().sort((a, b) => {
      if (a.added !== b.added) return (b.added || '').localeCompare(a.added || '');
      return 0;
    });

    const sec = document.createElement('section');
    sec.className = 'category-block';
    sec.setAttribute('aria-labelledby', 'cat-newest');

    const head = document.createElement('div');
    head.className = 'category-head';
    head.innerHTML = `<h2 class="category-title" id="cat-newest">Newest</h2><span class="category-count">${sorted.length}</span>`;
    sec.appendChild(head);

    const ul = document.createElement('ul');
    ul.className = 'rift-grid';
    for (const site of sorted) ul.appendChild(buildRiftCell(site, true, assetBase));
    sec.appendChild(ul);
    container.appendChild(sec);
  }

  window.initLLC = function initLLC(defaultMode, assetBase = '') {
    const dir = document.getElementById('directory');
    const navAll = document.getElementById('nav-all');
    const navNewest = document.getElementById('nav-newest');
    const countEl = document.getElementById('total-count');
    if (!dir) return;

    if (countEl) countEl.textContent = `${SITES.length} websites`;

    function setMode(mode, updateHash) {
      const isNewest = mode === 'newest';
      if (isNewest) renderNewest(dir, assetBase);
      else renderCategorized(dir, assetBase);

      if (navAll) {
        navAll.classList.toggle('active', !isNewest);
        navAll.setAttribute('aria-current', !isNewest ? 'page' : 'false');
      }
      if (navNewest) {
        navNewest.classList.toggle('active', isNewest);
        navNewest.setAttribute('aria-current', isNewest ? 'page' : 'false');
      }
      if (updateHash) {
        history.replaceState(null, '', isNewest ? '#newest' : window.location.pathname);
      }
    }

    const startMode =
      defaultMode === 'newest' || window.location.hash === '#newest'
        ? 'newest'
        : 'all';
    setMode(startMode, false);

    if (defaultMode === 'all') {
      if (navAll) {
        navAll.addEventListener('click', (e) => {
          e.preventDefault();
          setMode('all', true);
        });
      }
      if (navNewest) {
        navNewest.addEventListener('click', (e) => {
          e.preventDefault();
          setMode('newest', true);
        });
      }
      window.addEventListener('hashchange', () => {
        setMode(window.location.hash === '#newest' ? 'newest' : 'all', false);
      });
    }
  };
})();

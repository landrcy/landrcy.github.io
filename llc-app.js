/* ==========================================================================
   llc-app.js — LLC Blocky Rift Directory Renderer + Secret Bottom Vault
   Filters hidden sites out of main categories & /newest/, and unlocks them
   as a minimal dimmed list via a tiny faint "···" trigger at the bottom.
   ========================================================================== */

(() => {
  const ALL_SITES = window.LLC_SITES || [];
  const VISIBLE_SITES = ALL_SITES.filter((s) => !s.hidden);
  const HIDDEN_SITES = ALL_SITES.filter((s) => s.hidden);
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

    const isLight = !!site.light;
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
    a.style.setProperty('--glow', site.glow || site.rim || '#3b82f6');
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
    Rifts.register(a, canvas, site, assetBase);

    li.appendChild(a);
    return li;
  }

  function renderCategorized(container, assetBase) {
    Rifts.reset();
    container.innerHTML = '';

    for (const cat of CATEGORIES) {
      const items = VISIBLE_SITES.filter((s) => s.category === cat.id);
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

    const sorted = VISIBLE_SITES.slice().sort((a, b) => {
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

  function mountSecretVault() {
    if (!HIDDEN_SITES.length) return;
    const page = document.querySelector('.page');
    if (!page || document.getElementById('hidden-vault-wrap')) return;

    const wrap = document.createElement('div');
    wrap.id = 'hidden-vault-wrap';
    wrap.className = 'hidden-vault-wrap';

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = 'hidden-vault-trigger';
    btn.className = 'hidden-vault-trigger';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'hidden-vault-panel');
    btn.setAttribute('title', 'More');
    btn.textContent = '···';

    const panel = document.createElement('section');
    panel.id = 'hidden-vault-panel';
    panel.className = 'hidden-vault-panel';
    panel.hidden = true;
    panel.setAttribute('aria-label', 'Hidden archive');

    const head = document.createElement('div');
    head.className = 'vault-head';
    head.innerHTML = `<span class="vault-title">Hidden</span><span class="vault-count">${HIDDEN_SITES.length}</span>`;
    panel.appendChild(head);

    const list = document.createElement('ul');
    list.className = 'vault-list';
    for (const site of HIDDEN_SITES) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.className = 'vault-card';
      a.href = site.url;
      a.innerHTML = `
        <span class="vault-card-title"></span>
        <span class="vault-card-meta">${catTitles[site.category] || site.category}</span>
      `;
      a.querySelector('.vault-card-title').textContent = site.title;
      li.appendChild(a);
      list.appendChild(li);
    }
    panel.appendChild(list);

    btn.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.classList.toggle('is-open', open);
      if (open) {
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });

    wrap.appendChild(btn);
    wrap.appendChild(panel);
    page.appendChild(wrap);
  }

  window.initLLC = function initLLC(defaultMode, assetBase = '') {
    const dir = document.getElementById('directory');
    const navAll = document.getElementById('nav-all');
    const navNewest = document.getElementById('nav-newest');
    const countEl = document.getElementById('total-count');
    if (!dir) return;

    if (countEl) countEl.textContent = `${VISIBLE_SITES.length} websites`;

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
    mountSecretVault();

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

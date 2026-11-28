/* ==========================================================================
   llc-app.js — Minimalist LLC Directory Renderer (Categories & Newest Views)
   Shared by /index.html (default categorized view) and /newest/index.html.
   ========================================================================== */

(() => {
  const SITES = window.LLC_SITES || [];
  const CATEGORIES = window.LLC_CATEGORIES || [];
  const ICONS = window.LLC_ICONS || {};

  const catTitles = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.title]));

  function formatDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-').map(Number);
    const dt = new Date(y, (m || 1) - 1, d || 1);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  function makeIcon(iconKey) {
    const body =
      ICONS[iconKey] ||
      '<circle cx="10" cy="10" r="6"/><circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/>';
    return (
      '<span class="site-icon" aria-hidden="true">' +
      '<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round">' +
      body +
      '</svg></span>'
    );
  }

  function buildRow(site, showMeta) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'site-row';
    a.href = site.url;
    if (site.color) a.style.setProperty('--accent', site.color);

    const catTag = showMeta
      ? `<span class="site-cat-note">(${catTitles[site.category] || site.category})</span>`
      : '';
    const dateHtml = showMeta && site.added
      ? `<span class="site-date">${formatDate(site.added)}</span>`
      : '';

    a.innerHTML =
      makeIcon(site.icon) +
      '<div class="site-text">' +
      `<div class="site-name-line"><span class="site-name"></span>${catTag}</div>` +
      '<p class="site-desc"></p>' +
      '</div>' +
      `<div class="site-right">${dateHtml}<span class="site-arrow" aria-hidden="true">&rarr;</span></div>`;

    a.querySelector('.site-name').textContent = site.title;
    a.querySelector('.site-desc').textContent = site.desc;
    li.appendChild(a);
    return li;
  }

  function renderCategorized(container) {
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
      ul.className = 'site-list';
      for (const site of items) ul.appendChild(buildRow(site, false));
      sec.appendChild(ul);
      container.appendChild(sec);
    }
  }

  function renderNewest(container) {
    container.innerHTML = '';
    const sorted = SITES.slice().sort((a, b) => {
      if (a.added !== b.added) return (b.added || '').localeCompare(a.added || '');
      return 0; // preserve explicit newest-first ordering in llc-sites.js
    });

    const sec = document.createElement('section');
    sec.className = 'category-block';
    sec.setAttribute('aria-labelledby', 'cat-newest');

    const head = document.createElement('div');
    head.className = 'category-head';
    head.innerHTML = `<h2 class="category-title" id="cat-newest">Newest</h2><span class="category-count">${sorted.length}</span>`;
    sec.appendChild(head);

    const ul = document.createElement('ul');
    ul.className = 'site-list';
    for (const site of sorted) ul.appendChild(buildRow(site, true));
    sec.appendChild(ul);
    container.appendChild(sec);
  }

  window.initLLC = function initLLC(defaultMode) {
    const dir = document.getElementById('directory');
    const navAll = document.getElementById('nav-all');
    const navNewest = document.getElementById('nav-newest');
    const countEl = document.getElementById('total-count');
    if (!dir) return;

    if (countEl) countEl.textContent = `${SITES.length} websites`;

    function setMode(mode, updateHash) {
      const isNewest = mode === 'newest';
      if (isNewest) renderNewest(dir);
      else renderCategorized(dir);

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

    // On the main page (/), switch instantaneously in-place between All and Newest
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

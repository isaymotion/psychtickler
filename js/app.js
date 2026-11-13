/* Psych Tickler - app shell: router, menu, search, theme, text size, language, backup, What's new.
   Plain ES5 in one IIFE, no build step. To add a screen: add one entry to VIEWS and one to NAV
   (see "APP VIEWS" below). Patterns come from the isaymotion Companion apps (Stahl / DSMVapp),
   MSEtrainer and sheatrainer. */
(function () {
  'use strict';

  /* ===== Storage (try/catch so the app works with storage blocked) ===== */
  var PREFIX = 'pt:v1:';
  var store = {
    get: function (k, d) {
      try { var v = localStorage.getItem(PREFIX + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(PREFIX + k, JSON.stringify(v)); } catch (e) { /* storage unavailable */ }
    },
    del: function (k) { try { localStorage.removeItem(PREFIX + k); } catch (e) {} }
  };

  /* ===== Key migration (for restyled apps whose storage PREFIX changed, so saved progress survives).
     map = { 'old:prefix:': 'sub-prefix' | function (rest, oldKey) { return 'new-suffix'; } }.
     Every localStorage key starting with an old prefix is copied under PREFIX, then the old key is removed.
     A string value is put in front of the rest of the key ('' just swaps the prefix); a function returns the new
     suffix (a falsy result skips that key). An existing key under PREFIX is never overwritten. ===== */
  function migrateKeys(map) {
    try {
      if (!map || typeof map !== 'object') return;
      var keys = [], i;
      for (i = 0; i < localStorage.length; i++) { var k0 = localStorage.key(i); if (k0) keys.push(k0); }
      Object.keys(map).forEach(function (oldP) {
        if (!oldP) return;
        var to = map[oldP], growing = PREFIX.indexOf(oldP) === 0;   // new prefix extends the old one: do not re-migrate
        keys.forEach(function (k) {
          if (k.indexOf(oldP) !== 0) return;
          if (growing && k.indexOf(PREFIX) === 0) return;
          var rest = k.slice(oldP.length), suffix = typeof to === 'function' ? to(rest, k) : (typeof to === 'string' ? to + rest : null);
          if (typeof suffix !== 'string' || !suffix) return;
          var nk = PREFIX + suffix;
          if (nk === k) return;
          try {
            if (localStorage.getItem(nk) == null) localStorage.setItem(nk, localStorage.getItem(k));
            localStorage.removeItem(k);
          } catch (e) { /* leave the old key in place */ }
        });
      });
    } catch (e) { /* storage unavailable */ }
  }
  if (window.MIGRATE_KEYS) migrateKeys(window.MIGRATE_KEYS);

  var META = window.APP_META || {};
  var CHANGELOG = window.APP_CHANGELOG || [];
  var ATTRIBUTION = META.attribution || '';
  var APP_NAME = META.name || document.title;
  var APP_LINKS = window.APP_LINKS || [];

  /* ===== Language: 'en' (default) or 'tl' (Tagalog). Shell UI strings live in data/strings.js. ===== */
  var STRINGS = window.STRINGS || {};
  var lang = store.get('lang', 'en') === 'tl' ? 'tl' : 'en';
  function has(o, k) { return Object.prototype.hasOwnProperty.call(o, k); }
  function t(key) {
    var s = STRINGS[lang] && has(STRINGS[lang], key) ? STRINGS[lang][key] : null;
    if (typeof s !== 'string' || !s) s = STRINGS.en && has(STRINGS.en, key) ? STRINGS.en[key] : null;
    return typeof s === 'string' && s ? s : key;
  }
  function tf(key, vars) { return t(key).replace(/\{(\w+)\}/g, function (m, k) { return vars && has(vars, k) ? String(vars[k]) : m; }); }
  function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\[\[(.+?)\]\]/g, '<kbd>$1</kbd>'); }   // **bold** and [[key]] in strings
  function locale() { return lang === 'tl' ? 'fil' : undefined; }

  /* ===== Helpers ===== */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function pad2(n) { return String(n).padStart(2, '0'); }
  function fmtDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso));
    if (!m) return String(iso);
    return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString(locale(), { month: 'long', day: 'numeric', year: 'numeric' });
  }

  var main = document.getElementById('main');
  var sidenav = document.getElementById('sidenav');
  var backdrop = document.getElementById('nav-backdrop');
  var menuBtn = document.getElementById('menu-btn');
  var tabMenu = document.getElementById('tab-menu');
  var qInput = document.getElementById('q');
  var suggestBox = document.getElementById('suggest');

  /* ===== Icons (inline SVG, 24x24, stroke = currentColor). NAV items refer to these by key. ===== */
  var ICONS = {
    home: '<path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4"/>',
    news: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h6M9 16h6"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    star: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7"/>',
    list: '<path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.8a3.5 3.5 0 0 1 0 6.4M18 14.2a6.5 6.5 0 0 1 3.5 5.8"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M8 3v4M16 3v4M3.5 10h17"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>'
  };
  function icon(name, cls) {
    return '<svg class="' + (cls || 'nav-ico') + '" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || ICONS.star) + '</svg>';
  }

  /* ===== NAV: one entry per screen. Builds the sidenav (grouped by `group`) and the home tiles.
     {label, href, icon, group}  Optional: tile:false (keep off the home grid), badge:'news' (unseen What's new count),
     tkey:'nav.x' (label comes from data/strings.js). The "Other apps" group is added after these from window.APP_LINKS. ===== */
  var NAV = [
    { label: 'Home', tkey: 'nav.home', href: '#/', icon: 'home', group: 'Start', tile: false },
    { label: 'Emergency info', tkey: 'nav.emergency', href: '#/emergency', icon: 'medic', group: 'Screens' },
    { label: 'The batch', tkey: 'nav.batch', href: '#/batch', icon: 'users', group: 'Screens' },
    { label: 'Partners', tkey: 'nav.partners', href: '#/partners', icon: 'heart', group: 'Screens' },
    { label: 'My card', tkey: 'nav.me', href: '#/me', icon: 'card', group: 'Screens' },
    { label: 'Birthdays', tkey: 'nav.birthdays', href: '#/birthdays', icon: 'cake', group: 'Screens' },
    { label: 'Hometown map', tkey: 'nav.map', href: '#/map', icon: 'pin', group: 'Screens' },
    { label: 'Batch picks', tkey: 'nav.picks', href: '#/picks', icon: 'list', group: 'Screens' },
    { label: 'Batch events', tkey: 'nav.events', href: '#/events', icon: 'calendar', group: 'Screens' },
    { label: 'Question of the week', tkey: 'nav.qotw', href: '#/qotw', icon: 'chat', group: 'Screens' },
    { label: 'Batch anthem', tkey: 'nav.anthem', href: '#/anthem', icon: 'music', group: 'Screens' },
    { label: 'Time capsule', tkey: 'nav.capsule', href: '#/capsule', icon: 'mail', group: 'Screens' },
    { label: 'Guess who', tkey: 'nav.guess', href: '#/guess', icon: 'quiz', group: 'Play' },
    { label: 'Who said it?', tkey: 'nav.whosaid', href: '#/whosaid', icon: 'chat', group: 'Play' },
    { label: 'Batch Bingo', tkey: 'nav.bingo', href: '#/bingo', icon: 'game', group: 'Play' },
    { label: 'Icebreakers', tkey: 'nav.icebreakers', href: '#/icebreakers', icon: 'spark', group: 'Play' },
    { label: 'Batch Wrapped', tkey: 'nav.wrapped', href: '#/wrapped', icon: 'star', group: 'Play' },
    { label: 'Two truths and a lie', tkey: 'nav.truths', href: '#/truths', icon: 'quiz', group: 'Play' },
    { label: 'How well do you know…?', tkey: 'nav.quiz', href: '#/quiz', icon: 'star', group: 'Play' },
    { label: 'Baby photo guess', tkey: 'nav.baby', href: '#/baby', icon: 'heart', group: 'Play' },
    { label: 'This or that', tkey: 'nav.tot', href: '#/thisorthat', icon: 'chart', group: 'Play' },
    { label: 'Batch superlatives', tkey: 'nav.sup', href: '#/superlatives', icon: 'star', group: 'Play' },
    { label: 'Where should we eat?', tkey: 'nav.eat', href: '#/eat', icon: 'food', group: 'Play' },
    { label: 'Kris Kringle', tkey: 'nav.monito', href: '#/monito', icon: 'gift', group: 'Play' },
    { label: 'Badges', tkey: 'nav.badges', href: '#/badges', icon: 'spark', group: 'Play' },
    { label: 'Batch stats', tkey: 'nav.stats', href: '#/stats', icon: 'chart', group: 'Screens' },
    { label: 'Print & PDF', tkey: 'nav.print', href: '#/print', icon: 'print', group: 'Screens' },
    { label: 'What’s new', tkey: 'nav.whatsNew', href: '#/whats-new', icon: 'news', group: 'App', tile: false, badge: 'news' },
    { label: 'About', tkey: 'nav.about', href: '#/about', icon: 'info', group: 'App', tile: false }
  ];
  var NAV_GROUPS = { Start: 'nav.start', Screens: 'nav.screens', Play: 'nav.play', App: 'nav.app' };   // group name -> strings key
  function navLabel(n) { return n.tkey ? t(n.tkey) : n.label; }

  /* ===== Search index: fill with {title, text, href, kind}. Rebuild it from your own data if you like.
     The shell's own entries (What's new, About) are added by shellIndex() so they follow the language. ===== */
  var SEARCH_INDEX = [
    /* { title: 'Example', text: 'Words people might search for.', href: '#/example', kind: 'Screen' } */
  ];
  function shellIndex() {
    return [
      { title: t('nav.whatsNew'), text: t('search.newsText'), href: '#/whats-new', kind: t('nav.app') },
      { title: t('nav.about'), text: t('search.aboutText'), href: '#/about', kind: t('nav.app') }
    ];
  }

  /* ===== Theme: auto (match device) / light / dark. No data-theme attribute = match device. ===== */
  var THEME_ICONS = {
    auto: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg>',
    dark: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
    light: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
  };
  var darkMQ = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
  function getTheme() {
    var cur = store.get('theme', 'auto');
    return cur === 'light' || cur === 'dark' ? cur : 'auto';
  }
  function applyTheme(mode) {
    var root = document.documentElement;
    if (mode === 'light' || mode === 'dark') root.setAttribute('data-theme', mode); else root.removeAttribute('data-theme');
    var dark = mode === 'dark' || (mode !== 'light' && darkMQ && darkMQ.matches);
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', dark ? '#160E20' : '#421C6E');
    var btn = document.getElementById('theme-btn');
    if (btn) {
      var label = tf('theme.label', { name: t('theme.' + mode) });
      btn.innerHTML = THEME_ICONS[mode];
      btn.setAttribute('aria-label', label);
      btn.setAttribute('title', label);
    }
    var opts = document.querySelectorAll('[data-theme-opt]');
    for (var i = 0; i < opts.length; i++) opts[i].setAttribute('aria-pressed', opts[i].getAttribute('data-theme-opt') === mode ? 'true' : 'false');
    var radios = document.querySelectorAll('input[name="theme"]');   // the Theme segment on the About page
    for (var j = 0; j < radios.length; j++) radios[j].checked = radios[j].value === mode;
  }
  function setTheme(mode) {
    if (mode !== 'light' && mode !== 'dark') mode = 'auto';
    if (mode === 'auto') store.del('theme'); else store.set('theme', mode);
    applyTheme(mode);
  }
  applyTheme(getTheme());
  (function () {
    var btn = document.getElementById('theme-btn');
    if (btn) btn.addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme') || 'auto';
      setTheme({ auto: 'light', light: 'dark', dark: 'auto' }[cur]);
    });
    function onDeviceChange() { applyTheme(document.documentElement.getAttribute('data-theme') || 'auto'); }
    if (darkMQ) { if (darkMQ.addEventListener) darkMQ.addEventListener('change', onDeviceChange); else if (darkMQ.addListener) darkMQ.addListener(onDeviceChange); }
  })();

  /* ===== Header height -> --top ===== */
  function headerH() { var t = document.querySelector('.topbar'); return t ? t.offsetHeight : 64; }
  function setTopVar() { document.documentElement.style.setProperty('--top', headerH() + 'px'); }
  window.addEventListener('resize', setTopVar);
  setTopVar();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setTopVar);

  /* ===== Text size (Aa panel) ===== */
  var TEXT_SIZES = [['90', 'textsize.smaller'], ['100', 'textsize.default'], ['112.5', 'textsize.larger'], ['125', 'textsize.largest']];   // [value, strings key]
  function syncSizeRadios(v) {   // the text-size segment on the About page
    var radios = document.querySelectorAll('input[name="aboutTextSize"]');
    for (var i = 0; i < radios.length; i++) radios[i].checked = radios[i].value === v;
  }
  function applyTextSize(v) {
    var ok = TEXT_SIZES.some(function (z) { return z[0] === v; });
    document.documentElement.style.fontSize = ok && v !== '100' ? v + '%' : '';
    setTopVar();
  }
  (function () {
    var btn = document.getElementById('textSizeBtn');
    if (!btn) return;
    var panel = document.createElement('div');
    panel.className = 'text-size-panel'; panel.id = 'textSizePanel'; panel.hidden = true;
    panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', t('textsize.title'));
    document.body.appendChild(panel);
    function build() {
      var cur = String(store.get('textSize', '100'));
      panel.setAttribute('aria-label', t('textsize.title'));
      panel.innerHTML = '<p class="text-size-panel__title">' + esc(t('textsize.title')) + '</p><div class="seg">' + TEXT_SIZES.map(function (z, i) {
        return '<label><input type="radio" name="textSize" value="' + z[0] + '"' + (cur === z[0] ? ' checked' : '') + '><span style="font-size:' + (0.82 + i * 0.1).toFixed(2) + 'rem">' + esc(t(z[1])) + '</span></label>';
      }).join('') + '</div>';
    }
    function open() { build(); panel.hidden = false; btn.setAttribute('aria-expanded', 'true'); var f = panel.querySelector('input:checked'); if (f) f.focus(); }
    function close() { if (panel.hidden) return; panel.hidden = true; btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function (e) { e.stopPropagation(); if (panel.hidden) open(); else close(); });
    panel.addEventListener('change', function (e) {
      if (e.target.name === 'textSize') { store.set('textSize', e.target.value); applyTextSize(e.target.value); syncSizeRadios(e.target.value); }
    });
    document.addEventListener('click', function (e) { if (!panel.hidden && !panel.contains(e.target) && e.target !== btn && !btn.contains(e.target)) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hidden) { close(); btn.focus(); } });
    window.addEventListener('hashchange', close);
  })();

  /* ===== In-app back/forward buttons (index-stamped history) ===== */
  var HIST_KEY = PREFIX + 'hist';
  var hist = (function () { try { return JSON.parse(sessionStorage.getItem(HIST_KEY)) || { cur: 0, max: 0 }; } catch (e) { return { cur: 0, max: 0 }; } })();
  function saveHist() { try { sessionStorage.setItem(HIST_KEY, JSON.stringify(hist)); } catch (e) {} }
  function stamp(i) { try { history.replaceState({ spIdx: i }, ''); } catch (e) {} }
  function syncHist() {
    var st = history.state;
    if (st && typeof st.spIdx === 'number') {
      hist.cur = st.spIdx;
      if (hist.cur > hist.max) hist.max = hist.cur;
    } else {
      hist.cur = hist.cur + 1;     // a new page: anything that was ahead is discarded
      hist.max = hist.cur;
      stamp(hist.cur);
    }
    saveHist(); paintHist();
  }
  function paintHist() {
    var b = document.getElementById('nav-back'), f = document.getElementById('nav-fwd');
    if (b) b.disabled = hist.cur <= 0;
    if (f) f.disabled = hist.cur >= hist.max;
  }
  (function initHist() {
    var st = history.state;
    if (st && typeof st.spIdx === 'number') { hist.cur = st.spIdx; if (hist.max < hist.cur) hist.max = hist.cur; }
    else { hist = { cur: 0, max: 0 }; stamp(0); }
    saveHist(); paintHist();
    var b = document.getElementById('nav-back'), f = document.getElementById('nav-fwd');
    if (b) b.addEventListener('click', function () { if (!b.disabled) history.back(); });
    if (f) f.addEventListener('click', function () { if (!f.disabled) history.forward(); });
  })();

  /* Alt+Left / Alt+Right (ignores typing in fields and other modifiers) */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    var typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if (e.altKey && !typing && !e.ctrlKey && !e.metaKey && !e.shiftKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault();
      if (e.key === 'ArrowLeft') history.back(); else history.forward();
    }
  });

  /* ===== Scroll restoration (only on back/forward, not on ordinary link clicks) ===== */
  var scrollMemo = {}, scrollKey = location.hash || '#/', fromHistory = false, scrollPending = false;
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.addEventListener('scroll', function () {
    if (scrollPending) return;
    scrollPending = true;
    setTimeout(function () { scrollPending = false; scrollMemo[scrollKey] = window.scrollY; }, 120);
  }, { passive: true });
  window.addEventListener('popstate', function (e) { fromHistory = !!(e.state && typeof e.state.spIdx === 'number'); });

  /* ===== Menu: docked sidebar on desktop, drawer on phones/tablets ===== */
  function isDrawerMode() { return window.matchMedia('(max-width: 1099px)').matches; }
  function setMenuExpanded(v) { [menuBtn, tabMenu].forEach(function (b) { if (b) b.setAttribute('aria-expanded', v ? 'true' : 'false'); }); }
  function openDrawer() {
    if (!isDrawerMode()) return;
    document.body.classList.add('drawer-open');
    backdrop.hidden = false;
    setMenuExpanded(true);
    var target = sidenav.querySelector('.sidenav__close');
    setTimeout(function () { if (target) target.focus(); }, 60);
  }
  function closeDrawer() {
    if (!document.body.classList.contains('drawer-open')) return;
    document.body.classList.remove('drawer-open');
    backdrop.hidden = true;
    setMenuExpanded(false);
  }
  if (menuBtn) menuBtn.addEventListener('click', function () { openDrawer(); });
  if (tabMenu) tabMenu.addEventListener('click', function () { if (document.body.classList.contains('drawer-open')) closeDrawer(); else openDrawer(); });
  document.getElementById('nav-close').addEventListener('click', function () { closeDrawer(); if (menuBtn) menuBtn.focus(); });
  backdrop.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) { closeDrawer(); if (menuBtn) menuBtn.focus(); } });
  sidenav.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && a.getAttribute('href') === location.hash) closeDrawer(); });
  var collapseBtn = document.getElementById('collapse-btn');   // desktop: hide/show the docked sidebar
  function labelCollapse() {
    var c = document.documentElement.classList.contains('nav-collapsed');
    collapseBtn.setAttribute('aria-label', t(c ? 'sidebar.show' : 'sidebar.hide'));
    collapseBtn.setAttribute('title', t(c ? 'sidebar.show' : 'sidebar.hide'));
  }
  collapseBtn.addEventListener('click', function () {
    var c = !document.documentElement.classList.contains('nav-collapsed');
    document.documentElement.classList.toggle('nav-collapsed', c);
    store.set('navCollapsed', c); labelCollapse(); setTopVar();
  });
  labelCollapse();

  /* APP_LINKS minus this app's own entry (matched on the repo slug at the end of the URL). Menu only: never tiles, search or tabs. */
  function otherApps() {
    if (!window.SHOW_OTHER_APPS) return [];   // off until she is ready to interlink the apps (data/app-meta.js)
    var me = String(META.repo || '').toLowerCase();
    return APP_LINKS.filter(function (a) {
      if (!a || !a.name || !/^https?:\/\//i.test(String(a.href || ''))) return false;
      var slug = String(a.href).replace(/[?#].*$/, '').replace(/\/+$/, '').split('/').pop().toLowerCase();
      return !me || slug !== me;
    });
  }
  function currentKey() { var p = parts(); return p.length ? p[0] : 'home'; }
  function buildNav() {
    var cur = location.hash || '#/';
    if (cur === '#') cur = '#/';
    var groups = [], byName = {};
    NAV.forEach(function (n) {
      var g = n.group || 'Menu';
      if (!byName[g]) { byName[g] = { label: g, items: [] }; groups.push(byName[g]); }
      byName[g].items.push(n);
    });
    var html = groups.map(function (g) {
      return '<div class="nav-group"><div class="nav-label">' + esc(NAV_GROUPS[g.label] ? t(NAV_GROUPS[g.label]) : g.label) + '</div><ul>' + g.items.map(function (n) {
        var active = n.href === cur;
        return '<li><a class="nav-item' + (active ? ' is-active' : '') + '" href="' + esc(n.href) + '"' + (active ? ' aria-current="page"' : '') + '>' + icon(n.icon) + '<span>' + esc(navLabel(n)) + '</span>' +
          (n.badge ? '<span class="badge" data-badge="' + esc(n.badge) + '" hidden></span>' : '') + '</a></li>';
      }).join('') + '</ul></div>';
    }).join('');
    var others = otherApps();
    if (others.length) {
      html += '<div class="nav-group"><div class="nav-label">' + esc(t('nav.otherApps')) + '</div><ul>' + others.map(function (a) {
        return '<li><a class="nav-item" href="' + esc(a.href) + '" target="_blank" rel="noopener">' + icon('external') + '<span>' + esc(a.name) + '</span><span class="sr-only"> ' + esc(t('nav.newTab')) + '</span></a></li>';
      }).join('') + '</ul></div>';
    }
    document.getElementById('sidenav-body').innerHTML = html;
    var tabs = document.querySelectorAll('.tabbar [data-tab]');
    var key = currentKey();
    for (var i = 0; i < tabs.length; i++) {
      var on = tabs[i].getAttribute('data-tab') === key;
      if (tabs[i].tagName === 'A') { tabs[i].classList.toggle('is-active', on); if (on) tabs[i].setAttribute('aria-current', 'page'); else tabs[i].removeAttribute('aria-current'); }
    }
  }

  /* ===== What's new: unseen badge keyed on the version string ===== */
  function latestNewsVersion() { return CHANGELOG.length ? String(CHANGELOG[0].version) : ''; }
  function seenNewsVersion() {
    var s = store.get('seenNews', null);
    if (s == null) { s = latestNewsVersion(); store.set('seenNews', s); }   // brand-new visitors start up to date
    return s;
  }
  function unseenNews() {
    var seen = seenNewsVersion(), out = [];
    for (var i = 0; i < CHANGELOG.length; i++) {
      if (String(CHANGELOG[i].version) === seen) return out;
      out.push(CHANGELOG[i]);
    }
    return out;
  }
  function updateNavBadges() {
    var n = unseenNews().length;
    var els = document.querySelectorAll('[data-badge="news"]');
    for (var i = 0; i < els.length; i++) { els[i].textContent = n; els[i].hidden = !n; }
  }

  /* ===== Search ===== */
  var sugIndex = -1, sugTimer = null, searchKind = '';
  function terms(q) { return String(q).toLowerCase().replace(/[^\p{L}\p{N}\-\s.]/gu, ' ').split(/\s+/).filter(function (t) { return t.length > 0; }); }
  function runSearch(q) {
    var ts = terms(q);
    if (!ts.length) return [];
    var out = [];
    shellIndex().concat(SEARCH_INDEX).forEach(function (e) {
      var t = String(e.title || '').toLowerCase(), x = String(e.text || '').toLowerCase(), score = 0, ok = true;
      ts.forEach(function (w) {
        var iT = t.indexOf(w), iX = x.indexOf(w);
        if (iT < 0 && iX < 0) { ok = false; return; }
        if (iT >= 0) score += iT === 0 ? 6 : 4;
        if (iX >= 0) score += 1;
      });
      if (ok) out.push({ e: e, score: score });
    });
    out.sort(function (a, b) { return b.score - a.score; });
    return out.map(function (r) { return r.e; });
  }
  function highlight(text, ts) {
    text = String(text == null ? '' : text);
    if (!ts.length) return esc(text);
    var re = new RegExp('(' + ts.map(escRe).join('|') + ')', 'gi');
    return text.split(re).map(function (seg, i) { return i % 2 ? '<mark>' + esc(seg) + '</mark>' : esc(seg); }).join('');
  }
  function snippet(text, ts, len) {
    text = String(text || '');
    if (text.length <= len) return text;
    var low = text.toLowerCase(), at = -1;
    for (var i = 0; i < ts.length && at < 0; i++) at = low.indexOf(ts[i]);
    var start = Math.max(0, (at < 0 ? 0 : at) - 40);
    return (start > 0 ? '…' : '') + text.slice(start, start + len) + (start + len < text.length ? '…' : '');
  }
  function openSuggest(q) {
    q = String(q || '').trim();
    if (!q) { closeSuggest(); return; }
    var ts = terms(q), res = runSearch(q), shown = res.slice(0, 6);
    sugIndex = -1;
    qInput.removeAttribute('aria-activedescendant');
    if (!shown.length) {
      suggestBox.innerHTML = '<div class="suggest__empty">' + esc(tf('search.noMatches', { q: q })) + '</div>';
    } else {
      suggestBox.innerHTML = shown.map(function (e, i) {
        return '<a class="suggest__item" role="option" id="sug-' + i + '" href="' + esc(e.href) + '" aria-selected="false"><span class="suggest__meta"><span class="kind">' + esc(e.kind || '') + '</span><span>' + highlight(e.title, ts) + '</span></span><span class="suggest__text">' + highlight(snippet(e.text, ts, 140), ts) + '</span></a>';
      }).join('') + '<a class="suggest__item suggest__all" role="option" id="sug-all" href="#/search/' + encodeURIComponent(q) + '" aria-selected="false">' + esc(tf(res.length === 1 ? 'search.seeAll1' : 'search.seeAllN', { n: res.length })) + '</a>';
    }
    suggestBox.hidden = false;
    qInput.setAttribute('aria-expanded', 'true');
  }
  function closeSuggest() {
    if (!suggestBox) return;
    suggestBox.hidden = true; sugIndex = -1;
    qInput.setAttribute('aria-expanded', 'false');
    qInput.removeAttribute('aria-activedescendant');
  }
  function moveSug(d) {
    var items = suggestBox.querySelectorAll('.suggest__item');
    if (!items.length) return;
    sugIndex = (sugIndex + d + items.length) % items.length;
    items.forEach(function (it, i) { it.setAttribute('aria-selected', String(i === sugIndex)); });
    qInput.setAttribute('aria-activedescendant', items[sugIndex].id);
    items[sugIndex].scrollIntoView({ block: 'nearest' });
  }
  qInput.addEventListener('input', function () {
    clearTimeout(sugTimer);
    sugTimer = setTimeout(function () { openSuggest(qInput.value); }, 110);
  });
  qInput.addEventListener('focus', function () { if (qInput.value.trim()) openSuggest(qInput.value); });
  qInput.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); if (suggestBox.hidden) openSuggest(qInput.value); moveSug(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moveSug(-1); }
    else if (e.key === 'Escape') { closeSuggest(); qInput.blur(); }
    else if (e.key === 'Enter') {
      e.preventDefault();
      var items = suggestBox.querySelectorAll('.suggest__item');
      var target = sugIndex > -1 && items[sugIndex] ? items[sugIndex].getAttribute('href') : (qInput.value.trim() ? '#/search/' + encodeURIComponent(qInput.value.trim()) : null);
      closeSuggest();
      if (target) { if (location.hash === target) route(); else location.hash = target; qInput.blur(); }
    }
  });
  suggestBox.addEventListener('mousedown', function (e) { e.preventDefault(); });
  qInput.addEventListener('blur', function () { setTimeout(closeSuggest, 120); });
  document.addEventListener('keydown', function (e) {
    if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.altKey && !(e.target.matches && e.target.matches('input, textarea, select'))) { e.preventDefault(); qInput.focus(); qInput.select(); }
  });

  /* ===== Views ===== */
  var VIEWS = {};
  var AFTER = {};      // optional: AFTER.myScreen = function (arg) { ...wire events after render... }
  var TITLES = { home: '' };   // key -> page title (the shell's own titles come from SHELL_TITLES)
  var SHELL_TITLES = { 'whats-new': 'nav.whatsNew', about: 'nav.about', search: 'search.title' };

  VIEWS['whats-new'] = function () {
    var unseen = {};
    unseenNews().forEach(function (e) { unseen[String(e.version)] = true; });
    var html = '<div class="wrap page news"><header class="page__head"><h1>' + esc(t('nav.whatsNew')) + '</h1><p>' + esc(t('news.intro1')) + '<span class="news__new">' + esc(t('news.new')) + '</span>' + esc(t('news.intro2')) + '</p></header>' +
      CHANGELOG.map(function (e) {
        var isNew = !!unseen[String(e.version)];
        return '<article class="news__entry' + (isNew ? ' is-new' : '') + '"><div class="news__date"><time datetime="' + esc(e.date) + '">' + esc(fmtDate(e.date)) + '</time><span class="news__ver">' + esc(tf('news.version', { v: e.version })) + '</span>' + (isNew ? '<span class="news__new">' + esc(t('news.new')) + '</span>' : '') + '</div>' +
          '<div class="news__body"><h2>' + esc(e.title) + '</h2>' + (e.summary ? '<p>' + esc(e.summary) + '</p>' : '') + '<ul>' +
          (e.items || []).map(function (it) {
            var ty = String(it.type || 'feature'), tyLabel = t('news.type.' + ty);
            if (tyLabel === 'news.type.' + ty) tyLabel = ty.charAt(0).toUpperCase() + ty.slice(1);
            return '<li><span class="news__type news__type--' + esc(ty) + '">' + esc(tyLabel) + '</span><span class="news__text">' + esc(it.text) + (it.href ? ' <a href="' + esc(it.href) + '">' + esc(t('news.open')) + '</a>' : '') + '</span></li>';
          }).join('') + '</ul></div></article>';
      }).join('') +
      '<p class="news__note">' + esc(t('news.note')) + '<a href="mailto:isaymotion@gmail.com">isaymotion@gmail.com</a>.</p></div>';
    store.set('seenNews', latestNewsVersion());   // opening the page marks everything as seen
    return html;
  };

  function segGroup(name, label, opts, cur) {   // opts: [[value, label], ...]; radios inside the shared .seg control
    return '<fieldset class="setting"><legend>' + esc(label) + '</legend><div class="seg">' + opts.map(function (o) {
      return '<label><input type="radio" name="' + esc(name) + '" value="' + esc(o[0]) + '"' + (cur === o[0] ? ' checked' : '') + '><span>' + esc(o[1]) + '</span></label>';
    }).join('') + '</div></fieldset>';
  }
  VIEWS.about = function () {
    var sizes = TEXT_SIZES.map(function (z) { return [z[0], t(z[1])]; });
    return '<div class="wrap page"><header class="page__head"><h1>' + esc(t('nav.about')) + '</h1><p>' + esc(META.tagline || '') + '</p></header>' +
      '<div class="prose"><p><strong>' + esc(APP_NAME) + '</strong> · ' + esc(t('about.version')) + ' ' + esc(META.version || '') + '</p><p>' + esc(ATTRIBUTION) + '</p></div>' +
      '<h2>' + esc(t('about.settings')) + '</h2><div class="card">' +
        segGroup('lang', t('about.language'), [['en', t('about.langEn')], ['tl', t('about.langTl')]], lang) +
        segGroup('theme', t('theme.title'), [['auto', t('theme.auto')], ['light', t('theme.light')], ['dark', t('theme.dark')]], getTheme()) +
        segGroup('aboutTextSize', t('textsize.title'), sizes, String(store.get('textSize', '100'))) +
        '<div class="setting"><span class="field__l">' + esc(t('bt.banner.title')) + '</span><p class="field__h">' + esc(t('bt.banner.hint')) + '</p><p class="form__acts"><input type="file" id="banner-file" class="sr-only" accept="image/*"><label class="btn" for="banner-file" id="banner-label">' + esc(t('bt.banner.choose')) + '</label>' + (bannerSrc() ? '<button type="button" class="link-btn" id="banner-rm">' + esc(t('bt.banner.remove')) + '</button>' : '') + '</p><p class="form__status" id="banner-status" role="status"></p></div>' +
        '<label class="field setting"><span class="field__l">' + esc(t('bt.batchName')) + '</span><input type="text" name="batchName" maxlength="60" value="' + esc(batchName()) + '" placeholder="Batch 2027"><span class="field__h">' + esc(t('bt.batchNameHint')) + '</span></label>' +
        '<label class="field setting"><span class="field__l">' + esc(t('bt.day.setting')) + '</span><input type="date" name="startDate" value="' + esc(startDate()) + '"><span class="field__h">' + esc(t('bt.day.hint')) + '</span></label>' +
      '</div>' +
      '<h2>' + esc(t('about.tips')) + '</h2><div class="card"><ul class="prose" style="margin:0;padding-left:1.2em">' +
        [1, 2, 3, 4, 5].map(function (i) { return '<li>' + rich(t('about.tip' + i)) + '</li>'; }).join('') +
      '</ul></div></div>';
  };

  VIEWS.search = function (q) {
    q = String(q || '');
    var ts = terms(q), res = runSearch(q);
    var kinds = [];
    res.forEach(function (e) { var k = e.kind || ''; if (k && kinds.indexOf(k) < 0) kinds.push(k); });
    if (searchKind && kinds.indexOf(searchKind) < 0) searchKind = '';
    var shown = searchKind ? res.filter(function (e) { return e.kind === searchKind; }) : res;
    return '<div class="wrap page search-page"><header class="page__head"><h1>' + esc(t('search.title')) + '</h1><p>' +
        esc(q ? tf(shown.length === 1 ? 'search.count1' : 'search.countN', { n: shown.length, q: q }) : t('search.prompt')) + '</p></header>' +
      (kinds.length > 1 ? '<div class="filters" role="group" aria-label="' + esc(t('search.filterBy')) + '"><button type="button" class="filter" data-kind="" aria-pressed="' + (!searchKind) + '">' + esc(t('search.all')) + '</button>' +
        kinds.map(function (k) { return '<button type="button" class="filter" data-kind="' + esc(k) + '" aria-pressed="' + (searchKind === k) + '">' + esc(k) + '</button>'; }).join('') + '</div>' : '') +
      (shown.length
        ? '<div class="results">' + shown.map(function (e) {
            return '<div class="result"><a href="' + esc(e.href) + '"><span class="result__meta"><span class="kind">' + esc(e.kind || '') + '</span></span><span class="result__title">' + highlight(e.title, ts) + '</span><span class="result__text">' + highlight(snippet(e.text, ts, 220), ts) + '</span></a></div>';
          }).join('') + '</div>'
        : (q ? '<div class="empty"><h2>' + esc(t('search.noneTitle')) + '</h2><p>' + esc(t('search.noneText')) + '</p></div>' : ''))
      + '</div>';
  };
  AFTER.about = function () {
    var fi = document.getElementById('banner-file'), rm = document.getElementById('banner-rm'), st = document.getElementById('banner-status');
    if (fi) fi.addEventListener('change', function () {
      var f = fi.files && fi.files[0]; fi.value = ''; if (!f) return;
      shrinkBanner(f, function (data) { if (!data) { st.textContent = t('bt.me.photoTooBig'); return; } store.set('banner', data); route({ keepScroll: true }); var st2 = document.getElementById('banner-status'); if (st2) st2.textContent = t('bt.banner.saved'); });
    });
    if (rm) rm.addEventListener('click', function () { store.del('banner'); route({ keepScroll: true }); });
  };
  AFTER.search = function (q) { if (qInput && document.activeElement !== qInput) qInput.value = q || ''; };

  function missingView() {
    return '<div class="wrap page"><div class="empty"><h2>' + esc(t('notfound.title')) + '</h2><p>' + esc(t('notfound.text')) + '</p><p><a class="btn btn--solid" href="#/">' + esc(t('notfound.home')) + '</a></p></div></div>';
  }

  /* ===================================================================================================
     BATCH TICKLER SCREENS
     Data: one card per resident. The owner's own card lives under store 'me'; everyone else's under
     store 'batch' (an array). Cards travel between phones as small JSON files (Share cards screen).
     Card = { id, name, nickname, hometown, medSchool, hobbies, shows, movies, cartoons, anime, games, music, food, funFact,
              phone, email, bmonth (1-12|0), bday (1-31|0), byear (number|0), photo (data:image/jpeg… | ''), updated (ISO) }
     =================================================================================================== */
  var FIELDS = window.CARD_FIELDS || [];
  var GROUPS = window.CARD_GROUPS || ['basics'];
  var SUBS = window.CARD_SUBS || {};
  var COMMON = window.COMMON_FIELDS || { exact: [], items: [] };
  var MAX_CUSTOM = 12, PLAYLIST_MAX = window.PLAYLIST_MAX || 5;
  var LISTS = window.LINK_LISTS || [], LIST_BY = {}; LISTS.forEach(function (L) { LIST_BY[L.key] = L; });
  var GUESS_FIELDS = window.GUESS_FIELDS || [];
  var POS = ['resident', 'consultant', 'alumni'], PRIV_GROUPS = (window.CLOUD_CONFIG || {}).privateGroups || ['emergency', 'contact'];
  var QUICK = window.QUICK_FIELDS || [], FIELD_BY = {}; FIELDS.forEach(function (f) { FIELD_BY[f.key] = f; });
  function groupFields(g) {   // 'quick' = the Quick card fields; every other group loses the fields that moved up there
    return g === 'quick' ? QUICK.map(function (k) { return FIELD_BY[k]; }).filter(Boolean) : FIELDS.filter(function (f) { return f.group === g && QUICK.indexOf(f.key) < 0; });
  }
  var HOSP = window.HOSPITAL || {};
  var MAX_PHOTO = 320, MAX_TEXT = 600;
  var MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  ICONS.tag = '<path d="M3.5 12.5V5a1.5 1.5 0 0 1 1.5-1.5h7.5l8 8-9 9z"/><circle cx="8" cy="8" r="1.2"/>';
  ICONS.pin = '<path d="M12 21s-6.5-6.2-6.5-11a6.5 6.5 0 0 1 13 0c0 4.8-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.4"/>';
  ICONS.school = '<path d="M2.5 9.5L12 5l9.5 4.5L12 14zM6 11.5v5c0 1.2 2.7 2.5 6 2.5s6-1.3 6-2.5v-5M21 10v5"/>';
  ICONS.heart = '<path d="M12 20.5s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 8a4.2 4.2 0 0 1 7.5 2.5c0 5.4-7.5 10-7.5 10z"/>';
  ICONS.gift = '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-3-5-3.5-5-1.2C7 8 9.5 8 12 8zm0 0c1.5-3 5-3.5 5-1.2C17 8 14.5 8 12 8z"/>';
  ICONS.play = '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="M10 9.2v5.6l5-2.8z"/>';
  ICONS.mic = '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M8.5 21h7"/>';
  ICONS.plane = '<path d="M10.5 13.5 3 11l1.5-1.5 7.5 1 4.2-4.2c.9-.9 2.6-1.4 3.3-.7s.2 2.4-.7 3.3L14.6 13l1 7.5L14 22l-2.5-7.5L8 18v2.5L6.5 22 5 18.5 1.5 17 3 15.5h2.5z"/>';
  ICONS.tv = '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M8 21h8M9 3l3 3 3-3"/>';
  ICONS.film = '<rect x="3.5" y="4" width="17" height="16" rx="2"/><path d="M7.5 4v16M16.5 4v16M3.5 9h4M3.5 15h4M16.5 9h4M16.5 15h4"/>';
  ICONS.music = '<path d="M9 18.5V6l11-2v12.5"/><circle cx="6.5" cy="18.5" r="2.5"/><circle cx="17.5" cy="16.5" r="2.5"/>';
  ICONS.food = '<path d="M5 3v8a3 3 0 0 0 3 3v7M8 3v6M11 3v6M11 11a3 3 0 0 1-3 3M17 21v-7c2 0 3-2.5 3-6s-1-5-3-5z"/>';
  ICONS.chat = '<path d="M4 5.5h16v10H9l-5 4z"/><path d="M8 10.5h8"/>';
  ICONS.game = '<rect x="2.5" y="7" width="19" height="11" rx="4"/><path d="M7 10.5v4M5 12.5h4M15.5 11.5h.01M18 13.5h.01"/>';
  ICONS.spark = '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z"/>';
  ICONS.phone = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>';
  ICONS.mail = '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>';
  ICONS.cake = '<path d="M4 20h16M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6M5 16c1.5 1.5 3 1.5 4.5 0s3 1.5 4.5 0 3 1.5 4.5 0M12 12V9M12 5.5a1.5 1.5 0 0 0 0 3 1.5 1.5 0 0 0 0-3z"/>';
  ICONS.share = '<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="M8.2 10.8l7.6-4.6M8.2 13.2l7.6 4.6"/>';
  ICONS.print = '<path d="M7 8V3.5h10V8M7 17H4.5a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1H17"/><rect x="7" y="14" width="10" height="6.5" rx="1"/>';
  ICONS.card = '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 16.5a3.5 3.5 0 0 1 7 0M14.5 10h4M14.5 13.5h4"/>';
  ICONS.quiz = '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .9-1 1.7M12 17v.3"/>';

  /* ---- Card store ---- */
  function newId() { return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
  function cleanText(v, max) { return String(v == null ? '' : v).replace(/\s+\n/g, '\n').trim().slice(0, max || MAX_TEXT); }
  function toInt(v, lo, hi) { var n = parseInt(v, 10); return isFinite(n) && n >= lo && n <= hi ? n : 0; }
  function okPhoto(p) { return typeof p === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(p) && p.length < 400000; }
  function sanitizeCard(c) {   // accept only known fields with safe values; returns null if unusable
    if (!c || typeof c !== 'object') return null;
    var out = { id: String(c.id || '').replace(/[^\w-]/g, '').slice(0, 40), name: cleanText(c.name, 80) };
    if (!out.id || !out.name) return null;
    FIELDS.forEach(function (f) {
      if (f.type === 'year') { var y = toInt(c[f.key], 1950, 2100); out[f.key] = y ? String(y) : ''; }
      else if (f.type === 'url') out[f.key] = cleanLink(c[f.key]);
      else if (f.type === 'month') { var mm = /^(\d{4})-(\d{2})$/.exec(cleanText(c[f.key], 7)); out[f.key] = mm && +mm[2] >= 1 && +mm[2] <= 12 && +mm[1] >= 1990 && +mm[1] <= 2100 ? mm[0] : ''; }
      else out[f.key] = cleanText(c[f.key], f.type === 'textarea' ? MAX_TEXT : 120);
    });
    out.playlists = (Array.isArray(c.playlists) ? c.playlists : []).map(function (x) {
      return x && typeof x === 'object' ? { label: cleanText(x.label, 60), url: spotifyUrl(x.url) } : null;
    }).filter(function (x) { return x && x.url; }).slice(0, PLAYLIST_MAX);
    out.netflix = cleanList(LIST_BY.netflix, c.netflix);
    out.shoutouts = (Array.isArray(c.shoutouts) ? c.shoutouts : []).map(function (x) { return x && typeof x === 'object' ? { to: cleanText(x.to, 40), name: cleanText(x.name, 80), text: cleanText(x.text, 280), date: cleanText(x.date, 30) } : null; }).filter(function (x) { return x && x.text && (x.to || x.name); }).slice(-30);
    out.badges = (Array.isArray(c.badges) ? c.badges : []).filter(function (b, i, a) { return typeof b === 'string' && /^[a-z0-9]{2,20}$/.test(b) && a.indexOf(b) === i; }).slice(0, 40);
    sanitizeFun(c, out); sanitizePT(c, out);
    out.partnerOf = String(c.partnerOf || '').replace(/[^\w-]/g, '').slice(0, 40); out.partnerName = cleanText(c.partnerName, 80);
    if (out.partnerOf === out.id) out.partnerOf = '';
    out.lists = {};
    LISTS.forEach(function (L) { if (L.key === 'netflix') return; var v = cleanList(L, c.lists && typeof c.lists === 'object' ? c.lists[L.key] : null); if (v.length) out.lists[L.key] = v; });
    out.custom = (Array.isArray(c.custom) ? c.custom : []).map(function (x) {
      return x && typeof x === 'object' ? { label: cleanText(x.label, 60), value: cleanText(x.value, MAX_TEXT) } : null;
    }).filter(function (x) { return x && x.label && x.value; }).slice(0, MAX_CUSTOM);
    out.bmonth = toInt(c.bmonth, 1, 12); out.bday = toInt(c.bday, 1, 31); out.byear = toInt(c.byear, 1900, 2100);
    if (!out.bmonth || !out.bday || !validDay(out.bmonth, out.bday, out.byear)) { out.bmonth = 0; out.bday = 0; out.byear = 0; }
    out.photo = okPhoto(c.photo) ? c.photo : '';
    out.updated = typeof c.updated === 'string' && !isNaN(new Date(c.updated).getTime()) ? c.updated : new Date(0).toISOString();
    return out;
  }
  function cleanLink(v) {   // a full http(s) URL, or a bare handle (letters, digits, . _ -); anything else is dropped
    v = cleanText(v, 200);
    if (!v) return '';
    if (/^https?:\/\//i.test(v)) return /^https?:\/\/[\w.-]+(\/[^\s<>"']*)?$/i.test(v) ? v : '';
    v = v.replace(/^@/, '');
    return /^[\w.-]{1,60}$/.test(v) ? v : '';
  }
  function linkHref(f, v) { return /^https?:\/\//i.test(v) ? v : (f.base || '') + encodeURIComponent(v); }
  function linkText(v) { return /^https?:\/\//i.test(v) ? v.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '') : '@' + v; }
  /* Link lists (1.12.0 / 1.13.0): see LINK_LISTS in data/fields.js. Items {title, url}; url optional and host-checked. */
  function listUrl(L, v) {
    v = cleanText(v, 300); if (!L || !/^https:\/\/[^\s<>"']+$/i.test(v)) return '';
    var u; try { u = new URL(v); } catch (e) { return ''; }
    if (u.protocol !== 'https:') return '';
    var h = u.hostname.toLowerCase().replace(/^www\./, ''), path = u.pathname.toLowerCase();
    return L.hosts.some(function (e) { if (e === '*') return true; var i = e.indexOf('/'), host = i < 0 ? e : e.slice(0, i), pre = i < 0 ? '' : e.slice(i); return (h === host || h.slice(-host.length - 1) === '.' + host) && path.indexOf(pre) === 0; }) ? v : '';
  }
  function cleanList(L, arr) {
    return (Array.isArray(arr) ? arr : []).map(function (x) { return x && typeof x === 'object' ? { title: cleanText(x.title, 80), url: listUrl(L, x.url) } : null; }).filter(function (x) { return x && x.title; }).slice(0, (L && L.max) || 10);
  }
  function listOf(c, key) { return key === 'netflix' ? (c.netflix || []) : ((c.lists && c.lists[key]) || []); }
  function listHref(L, x) { return x.url || (L.search ? L.search.replace('{q}', encodeURIComponent(x.title)) : ''); }
  function netflixHref(x) { return listHref(LIST_BY.netflix, x); }
  function listLabel(key) { return t('bt.l.' + key); }
  var SERVICES = [['netflix.com', 'Netflix'], ['disneyplus.com', 'Disney+'], ['primevideo.com', 'Prime Video'], ['amazon.com', 'Prime Video'], ['hbomax.com', 'Max'], ['max.com', 'Max'], ['viu.com', 'Viu'], ['tv.apple.com', 'Apple TV'], ['iwant', 'iWant']];
  function serviceName(url) { var h = ''; try { h = new URL(url).hostname.toLowerCase(); } catch (e) {} for (var i = 0; i < SERVICES.length; i++) if (h.indexOf(SERVICES[i][0]) >= 0) return SERVICES[i][1]; return 'Netflix'; }
  function listSection(c, L) {
    var xs = listOf(c, L.key); if (!xs.length) return '';
    return '<h2 id="list-' + L.key + '">' + esc(listLabel(L.key)) + '</h2><div class="card"><ol class="nf-list">' + xs.map(function (x, i) {
      var href = listHref(L, x);
      return '<li><span class="nf-list__n">' + (i + 1) + '</span>' + (href ? '<a href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(x.title) + '</a>' + (x.url ? '' : ' <span class="muted nf-list__s">' + esc(t('bt.l.search')) + '</span>') : '<span>' + esc(x.title) + '</span>') + '</li>';
    }).join('') + '</ol></div>';
  }
  function spotifyUrl(v) { v = cleanText(v, 300); return /^https:\/\/(open\.spotify\.com|spotify\.link)\/[^\s<>"']+$/i.test(v) ? v : ''; }
  /* Zodiac from the birthday: Western sign by month/day, Chinese animal by year (year boundary approximated at 1 Jan) */
  var SIGNS = [[1, 20, 'Capricorn'], [2, 19, 'Aquarius'], [3, 21, 'Pisces'], [4, 20, 'Aries'], [5, 21, 'Taurus'], [6, 21, 'Gemini'], [7, 23, 'Cancer'], [8, 23, 'Leo'], [9, 23, 'Virgo'], [10, 23, 'Libra'], [11, 22, 'Scorpio'], [12, 22, 'Sagittarius'], [12, 32, 'Capricorn']];
  var ANIMALS = ['Monkey', 'Rooster', 'Dog', 'Pig', 'Rat', 'Ox', 'Tiger', 'Rabbit', 'Dragon', 'Snake', 'Horse', 'Goat'];
  function zodiac(c) { if (!c.bmonth) return ''; for (var i = 0; i < SIGNS.length; i++) if (c.bmonth < SIGNS[i][0] || (c.bmonth === SIGNS[i][0] && c.bday < SIGNS[i][1])) return SIGNS[i][2]; return ''; }
  function chineseZodiac(c) { return c.byear ? ANIMALS[((c.byear % 12) + 12) % 12] : ''; }
  function validDay(m, d, y) { var dim = [31, y && isLeap(y) || !y ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; return d >= 1 && d <= dim[m - 1]; }
  function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }
  function getMe() { return sanitizeCard(store.get('me', null)); }
  function getOthers() { var a = store.get('batch', []); return (Array.isArray(a) ? a : []).map(sanitizeCard).filter(Boolean); }
  function saveOthers(list) { store.set('batch', list); rebuildIndex(); }
  function allCards() {   // everyone incl. partner cards (1.17.0), me included, sorted by name
    var me = getMe(), list = getOthers().filter(function (o) { return !me || o.id !== me.id; });
    if (me) list.push(me);
    return list.sort(byName);
  }
  function isPartner(c) { return !!(c && (c.partnerOf || c.partnerName)); }
  function people() { return allCards().filter(function (c) { return !isPartner(c); }); }   // residents only: games, stats, grid, map…
  function partners() { return allCards().filter(isPartner); }
  function byName(a, b) { return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }); }
  function findPerson(id) { var l = allCards(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function isMe(c) { var me = getMe(); return !!(me && c && me.id === c.id); }
  function initials(name) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (w) { return w.charAt(0).toUpperCase(); }).join(''); }
  function monthName(m) { if (lang === 'tl') { var d = new Date(2000, m - 1, 1); try { return d.toLocaleDateString('fil', { month: 'long' }); } catch (e) {} } return MONTHS_EN[m - 1] || ''; }
  function bdayText(c, withYear) { if (!c.bmonth) return ''; return monthName(c.bmonth) + ' ' + c.bday + (withYear && c.byear ? ', ' + c.byear : ''); }
  function daysUntil(c, today) {   // days from today to the next occurrence of the birthday (0 = today)
    if (!c.bmonth) return null;
    var t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    var next = new Date(today.getFullYear(), c.bmonth - 1, Math.min(c.bday, c.bmonth === 2 && c.bday === 29 && !isLeap(today.getFullYear()) ? 28 : c.bday));
    if (next < t0) next = new Date(today.getFullYear() + 1, c.bmonth - 1, c.bmonth === 2 && c.bday === 29 && !isLeap(today.getFullYear() + 1) ? 28 : c.bday);
    return Math.round((next - t0) / 86400000);
  }
  function ageOn(c, year) { return c.byear ? year - c.byear : 0; }
  function rebuildIndex() {
    SEARCH_INDEX.length = 0;
    allCards().forEach(function (c) {
      var text = FIELDS.filter(function (f) { return f.print; }).map(function (f) { return c[f.key]; }).concat(c.custom.map(function (x) { return x.label + ' ' + x.value; }), c.playlists.map(function (x) { return x.label; }), [].concat.apply([], LISTS.map(function (L) { return listOf(c, L.key).map(function (x) { return x.title; }); }))).filter(Boolean).join(' · ');
      SEARCH_INDEX.push({ title: c.name + (c.nickname ? ' (' + c.nickname + ')' : ''), text: text || bdayText(c), href: '#/person/' + encodeURIComponent(c.id), kind: t(isPartner(c) ? 'nav.partners' : 'nav.batch') });
    });
    [['nav.emergency', '#/emergency', 'bt.em.intro'], ['nav.partners', '#/partners', 'bt.pt.intro'], ['nav.me', '#/me', 'bt.me.intro'], ['nav.birthdays', '#/birthdays', 'bt.bd.intro'], ['nav.print', '#/print', 'bt.print.intro'], ['nav.guess', '#/guess', 'bt.guess.intro'], ['nav.stats', '#/stats', 'bt.stats.intro'], ['nav.map', '#/map', 'bt.map.intro'], ['nav.picks', '#/picks', 'bt.picks.intro'], ['nav.events', '#/events', 'bt.ev.intro'], ['nav.monito', '#/monito', 'bt.mm.intro'], ['nav.badges', '#/badges', 'bt.badge.note'], ['nav.whosaid', '#/whosaid', 'bt.ws.intro'], ['nav.bingo', '#/bingo', 'bt.bingo.intro'], ['nav.icebreakers', '#/icebreakers', 'bt.ice.intro'], ['nav.wrapped', '#/wrapped', 'bt.wrap.intro'], ['nav.truths', '#/truths', 'bt.tt.intro'], ['nav.quiz', '#/quiz', 'bt.quiz.intro'], ['nav.baby', '#/baby', 'bt.baby.intro'], ['nav.tot', '#/thisorthat', 'bt.tot.intro'], ['nav.sup', '#/superlatives', 'bt.sup.intro'], ['nav.qotw', '#/qotw', 'bt.qotw.intro'], ['nav.capsule', '#/capsule', 'bt.cap.intro'], ['nav.eat', '#/eat', 'bt.eat.intro'], ['nav.anthem', '#/anthem', 'bt.an.intro'], ['bt.tc.title', '#/tcard', 'bt.tc.intro']].forEach(function (s) {
      SEARCH_INDEX.push({ title: t(s[0]), text: t(s[2]), href: s[1], kind: t('nav.screens') });
    });
  }

  /* ---- Shared bits of markup ---- */
  function avatar(c, cls) {
    return c.photo ? '<img class="avatar ' + (cls || '') + '" src="' + esc(c.photo) + '" alt="" loading="lazy">'
                   : '<span class="avatar avatar--txt ' + (cls || '') + '" aria-hidden="true">' + esc(initials(c.name)) + '</span>';
  }
  function fieldLabel(key) { return t('bt.f.' + key); }
  function groupLabel(g) { return t('bt.g.' + g); }
  function subLabel(sb) { return t('bt.s.' + sb); }
  function subChunks(g) {   // [{sub, fields}] in display order; a group without subs is one chunk with sub null
    var fs = groupFields(g), subs = SUBS[g];
    if (!subs) return [{ sub: null, fields: fs }];
    return subs.map(function (sb) { return { sub: sb, fields: fs.filter(function (f) { return f.sub === sb; }) }; }).concat([{ sub: null, fields: fs.filter(function (f) { return !f.sub || subs.indexOf(f.sub) < 0; }) }]).filter(function (ch) { return ch.fields.length; });
  }
  function batchName() { return cleanText(store.get('batchName', ''), 60); }
  function completeness(c) {   // filled / total over the standard fields + photo + birthday
    var fs = FIELDS.filter(function (f) { return f.print; }), n = 0;
    fs.forEach(function (f) { if (c[f.key]) n++; });
    if (c.photo) n++; if (c.bmonth) n++; if (c.playlists.length) n++;
    LISTS.forEach(function (L) { if (listOf(c, L.key).length) n++; });
    return { n: n, total: fs.length + 3 + LISTS.length };
  }
  function items(v) {   // "a, b\nc · d" -> ['a','b','c','d'] (original casing), short tokens dropped
    return String(v || '').split(/[,\n;·\/|]+/).map(function (x) { return x.replace(/\s+/g, ' ').trim(); }).filter(function (x) { return x.length > 2; });
  }
  function inCommon(a, b) {
    var out = [];
    COMMON.exact.forEach(function (k) { if (a[k] && b[k] && a[k].toLowerCase() === b[k].toLowerCase()) out.push(tf('bt.common.same', { field: fieldLabel(k).toLowerCase(), value: a[k] })); });
    COMMON.items.forEach(function (k) {
      var ia = items(a[k]), ib = items(b[k]).map(function (x) { return x.toLowerCase(); }), hit = ia.filter(function (x) { return ib.indexOf(x.toLowerCase()) >= 0; });
      if (hit.length) out.push(tf('bt.common.shared', { field: fieldLabel(k).toLowerCase(), value: hit.join(', ') }));
    });
    LISTS.forEach(function (L) {
      if (!L.common) return;
      var lb = listOf(b, L.key).map(function (x) { return x.title.toLowerCase(); }), hit = listOf(a, L.key).filter(function (x) { return lb.indexOf(x.title.toLowerCase()) >= 0; }).map(function (x) { return x.title; });
      if (hit.length) out.push(tf('bt.common.shared', { field: t('bt.l.' + L.key + '.short'), value: hit.join(', ') }));
    });
    var tot = (window.THIS_OR_THAT || []).filter(function (q) { return a.tot && b.tot && a.tot[q.id] && a.tot[q.id] === b.tot[q.id]; }).map(function (q) { var o = q[a.tot[q.id]]; return o[lang] || o.en; });
    if (tot.length) out.push(tf('bt.common.tot', { value: tot.join(', ') }));
    return out;
  }
  function fmtMonth(v) { var m = /^(\d{4})-(\d{2})$/.exec(String(v)); return m ? monthName(+m[2]) + ' ' + m[1] : String(v); }
  function factRow(ico, k, v, extra) { return '<div class="fact">' + icon(ico, 'fact__ico') + '<div><div class="fact__k">' + esc(k) + (extra || '') + '</div><div class="fact__v">' + esc(v).replace(/\n/g, '<br>') + '</div></div></div>'; }
  function personCard(c, today) {
    var d = daysUntil(c, today), soon = d !== null && d <= 14;
    return '<a class="card pcard" href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c) +
      '<span class="pcard__body"><span class="pcard__name">' + esc(c.name) + (isMe(c) ? ' <span class="badge">' + esc(t('bt.batch.you')) + '</span>' : '') + '</span>' +
      (c.nickname ? '<span class="pcard__nick">“' + esc(c.nickname) + '”</span>' : '') + posChip(c) + consLine(c) +
      (c.hometown ? '<span class="pcard__meta">' + icon('pin', 'pcard__ico') + esc(c.hometown) + '</span>' : '') + askChips(c, 'askme--sm') +
      (c.bmonth ? '<span class="pcard__meta' + (soon ? ' is-soon' : '') + '">' + icon('cake', 'pcard__ico') + esc(bdayText(c)) + (d === 0 ? ' · ' + esc(t('bt.home.today')) : '') + '</span>' : '') +
      '</span></a>';
  }
  function crumb(label) { return '<p class="crumb"><a href="#/">' + esc(t('nav.home')) + '</a> / ' + esc(label) + '</p>'; }

  /* ---- Today's picks (1.10.0): same pick on every phone with the same batch, changes at local midnight ---- */
  var pickOff = { pl: 0, fact: 0, nf: 0, word: 0 };   // "Another" taps; session only, reset on a new day
  var pickDay = 0;
  function dayNum(d) { return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 864e5); }
  function dayHash(n, salt) { var h = (n * 2654435761 + salt * 40503) >>> 0; h ^= h >>> 15; h = Math.imul(h, 2246822519) >>> 0; h ^= h >>> 13; return h >>> 0; }
  function clip(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim(); return s.length > n ? s.slice(0, n - 1).trim() + '…' : s; }
  function todaysPicks(all, today) {
    var dn = dayNum(today);
    if (dn !== pickDay) { pickDay = dn; pickOff.pl = 0; pickOff.fact = 0; pickOff.nf = 0; pickOff.word = 0; }
    var pls = [];
    all.forEach(function (c) { c.playlists.forEach(function (pl) { pls.push({ c: c, pl: pl }); }); });
    pls.sort(function (a, b) { return byName(a.c, b.c) || (a.pl.url < b.pl.url ? -1 : a.pl.url > b.pl.url ? 1 : 0); });
    var need = all.length > 1 ? 2 : 1;
    var facts = (window.GUESS_FIELDS || []).filter(function (k) { return all.filter(function (c) { return c[k] && String(c[k]).trim(); }).length >= need; });
    var pl = pls.length ? pls[(dayHash(dn, 1) + pickOff.pl) % pls.length] : null;
    var nfMap = {}, nfs = [];
    all.forEach(function (c) { c.netflix.forEach(function (x, i) { var k = x.title.toLowerCase(); if (!nfMap[k]) { nfMap[k] = { title: x.title, url: x.url, fans: [] }; nfs.push(nfMap[k]); } if (!nfMap[k].url && x.url) nfMap[k].url = x.url; nfMap[k].fans.push({ c: c, rank: i + 1 }); }); });
    nfs.sort(function (a, b) { return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : a.title.toLowerCase() > b.title.toLowerCase() ? 1 : 0; });
    var nf = nfs.length ? nfs[(dayHash(dn, 5) + (pickOff.nf || 0)) % nfs.length] : null;
    var fk = facts.length ? facts[(dayHash(dn, 2) + pickOff.fact) % facts.length] : null;
    return { pl: pl, plN: pls.length, fk: fk, factN: facts.length, nf: nf, nfN: nfs.length };
  }
  function todayHTML(all, today) {
    var tp = todaysPicks(all, today), out = '';
    if (tp.pl) {
      var c = tp.pl.c;
      out += '<section class="card today" aria-labelledby="today-pl-h"><p class="today__k">' + icon('music', 'today__ico') + '<span id="today-pl-h">' + esc(t('bt.today.pl')) + '</span></p>' +
        '<div class="today__pl"><a href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c, 'avatar--sm') + '</a><div><h3>' + esc(tp.pl.pl.label || t('bt.f.playlists')) + '</h3><p class="muted">' + esc(tf('bt.today.by', { name: c.preferredName || c.nickname || c.name })) + '</p></div></div>' + spotifyPlayer(tp.pl.pl.url, tp.pl.pl.label || t('bt.f.playlists')) +
        '<p class="today__acts"><a class="btn' + (spotifyEmbed(tp.pl.pl.url) ? '' : ' btn--solid') + '" href="' + esc(tp.pl.pl.url) + '" target="_blank" rel="noopener">' + esc(t('bt.pl.open')) + '</a>' +
        (tp.plN > 1 ? '<button type="button" class="btn" data-another="pl">' + esc(t('bt.today.another')) + '</button>' : '') + '</p></section>';
    }
    if (tp.nf) {
      var fans = tp.nf.fans.slice().sort(function (a, b) { return a.rank - b.rank; }), top = fans[0];
      out += '<section class="card today" aria-labelledby="today-nf-h"><p class="today__k">' + icon('tv', 'today__ico') + '<span id="today-nf-h">' + esc(t('bt.today.nf')) + '</span></p>' +
        showInfoBox(tp.nf.title) +
        '<div class="today__pl"><a href="#/person/' + encodeURIComponent(top.c.id) + '">' + avatar(top.c, 'avatar--sm') + '</a><div><h3>' + esc(tp.nf.title) + '</h3><p class="muted">' + esc(tf('bt.today.nfBy', { name: short(top.c), n: top.rank })) + '</p></div></div>' +
        (fans.length > 1 ? '<p class="muted today__also">' + esc(tf('bt.today.nfAlso', { names: fans.slice(1).map(function (x) { return short(x.c); }).join(', ') })) + '</p>' : '') +
        '<p class="today__acts"><a class="btn btn--solid" href="' + esc(netflixHref(tp.nf)) + '" target="_blank" rel="noopener">' + esc(tp.nf.url ? tf('bt.nf.watchOn', { s: serviceName(tp.nf.url) }) : t('bt.nf.find')) + '</a>' +
        (tp.nfN > 1 ? '<button type="button" class="btn" data-another="nf">' + esc(t('bt.today.another')) + '</button>' : '') + '</p></section>';
    }
    if (tp.fk) {
      var f = FIELDS.filter(function (x) { return x.key === tp.fk; })[0] || { icon: 'star' };
      var who = all.filter(function (c) { return c[tp.fk] && String(c[tp.fk]).trim(); });
      out += '<section class="card today" aria-labelledby="today-fact-h"><p class="today__k">' + icon('star', 'today__ico') + '<span id="today-fact-h">' + esc(t('bt.today.fact')) + '</span></p>' +
        '<h3 class="today__q">' + icon(f.icon, 'fact__ico') + esc(fieldLabel(tp.fk)) + '</h3><ul class="today__list">' +
        who.map(function (c) { return '<li><a href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c, 'avatar--sm') + '<span><strong>' + esc(c.preferredName || c.nickname || c.name) + '</strong><span class="today__a">' + esc(clip(c[tp.fk], 140)) + '</span></span></a></li>'; }).join('') +
        '</ul><p class="today__acts">' + (all.length > 1 ? '<a class="btn btn--solid" href="#/whosaid/' + encodeURIComponent(tp.fk) + '">' + esc(t('nav.whosaid')) + '</a>' : '') + (tp.factN > 1 ? '<button type="button" class="btn" data-another="fact">' + esc(t('bt.today.another')) + '</button>' : '') + '</p></section>';
    }
    out = shoutHomeHTML() + capsuleHomeHTML(today) + qotwHomeHTML(all, today) + out + wordHTML(all, today) + anthemHomeHTML(all, today) + spotlightHTML(all, today);
    return out ? '<h2 class="home__h">' + esc(t('bt.today.h')) + '</h2><div class="today-grid">' + out + '</div>' : '';
  }
  AFTER.home = function () {
    main.querySelectorAll('[data-greet]').forEach(function (b) { b.addEventListener('click', function () { var c = findPerson(b.getAttribute('data-greet')); if (c) greet(c, document.getElementById('greet-status')); }); });
    main.querySelectorAll('[data-another]').forEach(function (b) {
      b.addEventListener('click', function () { var k = b.getAttribute('data-another'); pickOff[k]++; route({ keepScroll: true }); var nb = main.querySelector('[data-another="' + k + '"]'); if (nb) nb.focus({ preventScroll: true }); });
    });
  };

  /* ---- Home (overrides the starter hero with the batch banner) ---- */
  VIEWS.home = function () {
    var me = getMe(), all = people(), today = new Date(), latest = CHANGELOG[0];
    var tiles = NAV.filter(function (n) { return n.tile !== false && n.href !== '#/'; });
    var next = all.filter(function (c) { return c.bmonth; }).map(function (c) { return { c: c, d: daysUntil(c, today) }; }).sort(function (a, b) { return a.d - b.d; })[0];
    return '<section class="hero hero--banner">' + (bannerSrc() ? '<img class="hero__img hero__img--custom" src="' + esc(bannerSrc()) + '" alt="">' : '<img class="hero__img" src="img/banner.jpg" srcset="img/banner-small.jpg 480w, img/banner.jpg 774w" sizes="(max-width:720px) 66vw, 440px" alt="" width="774" height="774">') +
      '<div class="wrap hero__inner">' + (batchName() ? '<p class="hero__kicker">' + esc(batchName()) + '</p>' : '') + '<h1>' + esc(APP_NAME) + '</h1>' +
        '<p class="hero__lead">' + esc(META.tagline || '') + ' · ' + esc(HOSP.program || '') + '</p>' +
        '<p><a class="btn btn--solid" href="' + (me ? '#/batch' : '#/me') + '">' + esc(t(me ? 'bt.hero.ctaDone' : 'bt.hero.cta')) + '</a></p>' +
      '</div></section>' +
      '<div class="wrap home">' + birthdayBanner(allCards(), today) +
        '<div class="home__stats">' +
          '<div class="card stat"><span class="stat__n">' + all.length + '</span><span class="stat__t">' + esc(tf(all.length === 1 ? 'bt.home.count1' : 'bt.home.countN', { n: all.length }).replace(/^\d+\s*/, '')) + '</span>' + (!me ? '<a class="link-btn" href="#/me">' + esc(t('bt.home.noMe')) + '</a>' : '') + '</div>' +
          (next ? '<a class="card stat stat--link" href="#/person/' + encodeURIComponent(next.c.id) + '">' + icon('cake', 'stat__ico') + '<span class="stat__t">' + esc(t('bt.home.nextBirthday')) + '</span><span class="stat__name">' + esc(next.c.name) + '</span><span class="stat__sub">' + esc(bdayText(next.c)) + ' · ' + esc(next.d === 0 ? t('bt.home.today') : next.d === 1 ? t('bt.home.inDays1') : tf('bt.home.inDaysN', { n: next.d })) + '</span></a>' : '') + residencyStat(today) + nextEventStat(today) +
        '</div>' + todayHTML(all, today) +
        '<h2 class="home__h">' + esc(t('home.explore')) + '</h2><div class="cards">' + tiles.map(function (n) {
          return '<a class="card tile" href="' + esc(n.href) + '">' + icon(n.icon, 'tile__ico') + '<h3>' + esc(navLabel(n)) + '</h3></a>';
        }).join('') + '</div>' +
        '<a class="card news-strip" href="#/whats-new"><span class="badge" data-badge="news" hidden></span><strong>' + esc(t('nav.whatsNew')) + '</strong>' +
          (latest ? '<span class="muted">' + esc(tf('home.latest', { title: latest.title, version: latest.version })) + '</span>' : '') + '</a>' +
      '</div>';
  };

  /* ---- The batch (grid) ---- */
  var batchQ = '', batchSort = 'name', batchPos = 'all';
  VIEWS.batch = function () {
    var all = people(), today = new Date(), q = batchQ.trim().toLowerCase();
    var shown = q ? all.filter(function (c) { return FIELDS.map(function (f) { return c[f.key]; }).concat([c.name]).join(' ').toLowerCase().indexOf(q) >= 0; }) : all.slice();
    var posTabs = posFilters(all); if (!posTabs.some(function (x) { return x[0] === batchPos; })) batchPos = 'all';
    if (batchPos !== 'all') shown = shown.filter(function (c) { return posKey(c) === batchPos; });
    if (batchSort === 'birthday') shown.sort(function (a, b) { var da = daysUntil(a, today), db = daysUntil(b, today); return (da === null ? 9e9 : da) - (db === null ? 9e9 : db) || byName(a, b); });
    else if (batchSort === 'hometown') shown.sort(function (a, b) { return (a.hometown || '￿').localeCompare(b.hometown || '￿', undefined, { sensitivity: 'base' }) || byName(a, b); });
    var sorts = [['name', 'bt.batch.sortName'], ['birthday', 'bt.batch.sortBirthday'], ['hometown', 'bt.batch.sortHometown']];
    return '<div class="wrap page">' + crumb(t('nav.batch')) +
      '<header class="page__head"><h1>' + esc(t('nav.batch')) + '</h1><p>' + esc(t('bt.batch.intro')) + '</p></header>' +
      (all.length ? '<div class="toolbar"><label class="field field--inline"><span class="sr-only">' + esc(t('bt.batch.filter')) + '</span><input type="search" id="batch-q" placeholder="' + esc(t('bt.batch.filter')) + '" value="' + esc(batchQ) + '" autocomplete="off"></label>' +
        '<div class="filters" role="group">' + sorts.map(function (s) { return '<button type="button" class="filter" data-sort="' + s[0] + '" aria-pressed="' + (batchSort === s[0]) + '">' + esc(t(s[1])) + '</button>'; }).join('') + '</div></div>' +
        (posTabs.length > 2 ? '<div class="filters pos-filters" role="group" aria-label="' + esc(t('pt.pos.filter')) + '">' + posTabs.map(function (x) { return '<button type="button" class="filter" data-pos="' + x[0] + '" aria-pressed="' + (batchPos === x[0]) + '">' + esc(x[1]) + ' <span class="muted">' + x[2] + '</span></button>'; }).join('') + '</div>' : '') : '') +
      (!all.length ? '<div class="empty"><h2>' + esc(t('bt.batch.emptyTitle')) + '</h2><p>' + esc(t('bt.batch.emptyText')) + '</p><p><a class="btn btn--solid" href="#/me">' + esc(t('nav.me')) + '</a> <a class="btn" href="#/sync">' + esc(t('nav.sync')) + '</a></p></div>'
        : shown.length ? '<div class="pgrid">' + shown.map(function (c) { return personCard(c, today); }).join('') + '</div>' : '<div class="empty"><p>' + esc(t('bt.batch.noMatch')) + '</p></div>') +
      '</div>';
  };
  AFTER.batch = function () {
    var sorts = document.querySelectorAll('.toolbar .filter[data-sort]');
    for (var i = 0; i < sorts.length; i++) sorts[i].addEventListener('click', function (e) { batchSort = e.currentTarget.getAttribute('data-sort'); route({ keepScroll: true }); });
    document.querySelectorAll('.pos-filters .filter[data-pos]').forEach(function (b) { b.addEventListener('click', function () { batchPos = b.getAttribute('data-pos'); route({ keepScroll: true }); }); });
    var q = document.getElementById('batch-q'); if (!q) return;
    var timer;
    q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { batchQ = q.value; var pos = q.selectionStart; route({ keepScroll: true }); var nq = document.getElementById('batch-q'); if (nq) { nq.focus(); try { nq.setSelectionRange(pos, pos); } catch (e) {} } }, 160); });
  };

  /* ---- One person ---- */
  VIEWS.person = function (id) {
    var c = findPerson(String(id || ''));
    if (!c) return '<div class="wrap page">' + crumb(t('nav.batch')) + '<div class="empty"><h2>' + esc(t('notfound.title')) + '</h2><p>' + esc(t('bt.person.notFound')) + '</p><p><a class="btn btn--solid" href="#/batch">' + esc(t('nav.batch')) + '</a></p></div></div>';
    var today = new Date(), d = daysUntil(c, today), me = isMe(c);
    var me0 = getMe();
    var sections = GROUPS.filter(function (g) { return g !== 'contact' && (g !== 'consultant' || isCons(c)); }).map(function (g) {
      var rows = subChunks(g).map(function (ch) {
        var r = ch.fields.filter(function (f) { return f.print && c[f.key] && f.key !== 'nickname' && !(g === 'consultant' && cqShown(c) && CONS_QUICK.indexOf(f.key) >= 0); }).map(function (f) { return factRow(f.icon, fieldLabel(f.key), f.type === 'month' ? fmtMonth(c[f.key]) : c[f.key]); }).join('');
        return r ? (ch.sub ? '<h3 class="facts__sub">' + esc(subLabel(ch.sub)) + '</h3>' : '') + r : '';
      }).join('');
      return rows ? '<h2>' + esc(groupLabel(g)) + '</h2><div class="card facts">' + rows + '</div>' : '';
    }).join('');
    if (c.custom.length) sections += '<h2>' + esc(groupLabel('custom')) + '</h2><div class="card facts">' + c.custom.map(function (x) { return factRow('spark', x.label, x.value); }).join('') + '</div>';
    var common = '';
    if (me0 && !me) {
      var hits = inCommon(me0, c);
      common = '<h2>' + esc(t('bt.common.title')) + '</h2><div class="card common">' + (hits.length ? '<ul>' + hits.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(t('bt.common.none')) + '</p>') + '</div>';
    }
    var contact = '';
    var cfields = FIELDS.filter(function (f) { return f.group === 'contact' && c[f.key]; });
    if (cfields.length) {
      var tel = c.phone.replace(/[^\d+]/g, '');
      contact = '<h2>' + esc(groupLabel('contact')) + '</h2><div class="card facts">' + cfields.map(function (f) {
        var num = String(c[f.key]).replace(/[^\d+]/g, '');
        var acts = f.type === 'tel' && f.key !== 'gcash' && num ? '<p class="contact__acts"><a class="btn" href="tel:' + esc(num) + '">' + esc(t('bt.person.call')) + '</a> <a class="btn" href="sms:' + esc(num) + '">' + esc(t('bt.person.text')) + '</a></p>'
                 : f.type === 'email' ? '<p class="contact__acts"><a class="btn" href="mailto:' + esc(c[f.key]) + '">' + esc(t('bt.person.mail')) + '</a></p>' : '';
        var val = f.type === 'url' ? '<a href="' + esc(linkHref(f, c[f.key])) + '" target="_blank" rel="noopener">' + esc(linkText(c[f.key])) + '</a>' : f.type === 'month' ? esc(fmtMonth(c[f.key])) : esc(c[f.key]).replace(/\n/g, '<br>');
        return '<div class="fact">' + icon(f.icon, 'fact__ico') + '<div><div class="fact__k">' + esc(fieldLabel(f.key)) + '</div><div class="fact__v">' + val + '</div>' + acts + '</div></div>';
      }).join('') + '</div>';
    }
    contact = LISTS.map(function (L) { return listSection(c, L); }).join('') + contact;
    if (c.playlists.length) {
      contact = '<h2>' + esc(t('bt.f.playlists')) + '</h2><div class="card facts">' + c.playlists.map(function (pl) {
        return '<div class="fact">' + icon('music', 'fact__ico') + '<div><div class="fact__v"><strong>' + esc(pl.label || t('bt.f.playlists')) + '</strong></div><p class="contact__acts"><a class="btn" href="' + esc(pl.url) + '" target="_blank" rel="noopener">' + esc(t('bt.pl.open')) + '</a></p></div></div>';
      }).join('') + '</div>' + contact;
    }
    var comp = completeness(c);
    return '<div class="wrap page person">' + crumb(t('nav.batch')) +
      '<header class="person__head">' + avatar(c, 'avatar--lg') + '<div><h1>' + esc(c.name) + '</h1>' +
        (c.nickname ? '<p class="person__nick">“' + esc(c.nickname) + '”</p>' : '') + posLine(c) + (c.askMe ? '<p>' + askChips(c) + '</p>' : '') +
        (c.bmonth ? '<p class="person__bday">' + icon('cake', 'fact__ico') + esc(t('bt.person.birthday')) + ': ' + esc(bdayText(c, !!c.showYear)) + (d === 0 ? ' · <strong>' + esc(t('bt.home.today')) + '</strong>' : d !== null && d <= 30 ? ' · ' + esc(d === 1 ? t('bt.home.inDays1') : tf('bt.home.inDaysN', { n: d })) : '') + (c.byear && d !== null && d <= 30 ? ' (' + esc(tf('bt.person.turns', { n: ageOn(c, today.getFullYear() + (d && today.getMonth() + 1 > c.bmonth ? 1 : 0)) })) + ')' : '') + ' <button type="button" class="link-btn" id="cal-one">' + esc(t('bt.cal.one')) + '</button></p><p class="muted person__zodiac">' + esc(t('bt.zodiac')) + ': ' + esc(zodiac(c)) + (chineseZodiac(c) ? ' · ' + esc(t('bt.zodiac.cn')) + ': ' + esc(chineseZodiac(c)) : '') + '</p><p class="form__status" id="cal-status" role="status"></p>' : '') +
        (c.preferredName ? '<p class="muted">' + esc(fieldLabel('preferredName')) + ': ' + esc(c.preferredName) + (c.pronouns ? ' · ' + esc(c.pronouns) : '') + '</p>' : (c.pronouns ? '<p class="muted">' + esc(c.pronouns) + '</p>' : '')) +
        (me ? '<p><a class="btn btn--solid" href="#/me">' + esc(t('bt.person.edit')) + '</a> <span class="muted">' + esc(tf('bt.me.complete', comp)) + '</span></p>' : '') + personActs(c) +
      '</div></header>' + consQuickHTML(c) + common + (c.badges && c.badges.length ? '<h2>' + esc(t('nav.badges')) + '</h2>' + badgeChips(c.badges) : '') + shoutSection(c) + wallSection(c) + sections + contact +
      '<p class="person__foot muted">' + esc(tf('bt.person.updated', { date: bkDate(c.updated) || '—' })) + (me ? '' : ' · <button type="button" class="link-btn" id="rm-person" data-id="' + esc(c.id) + '">' + esc(t('bt.person.remove')) + '</button>') + '</p></div>';
  };
  AFTER.person = function (id) {
    var pc = findPerson(String(id || '')); if (pc) { if (!isMe(pc)) markSeen(pc.id); wireShouts(pc); }
    var cal = document.getElementById('cal-one');
    if (cal) cal.addEventListener('click', function () { var c = findPerson(String(id || '')); if (!c) return; icsOut([c], 'birthday-' + slug(c.name) + '.ics', function (m) { var st = document.getElementById('cal-status'); if (st) st.textContent = m; }); });
    var b = document.getElementById('rm-person'); if (!b) return;
    b.addEventListener('click', function () {
      var c = findPerson(b.getAttribute('data-id')); if (!c) return;
      if (!window.confirm(tf('bt.person.confirmRemove', { name: c.name }))) return;
      saveOthers(getOthers().filter(function (o) { return o.id !== c.id; }));
      location.hash = '#/batch';
    });
  };

  /* ---- My card (edit) ---- */
  var pendingPhoto = null;   // data URL chosen but not yet saved; null = unchanged, '' = removed
  function sel(name, label, opts, cur) {
    return '<label class="field field--sm"><span class="field__l">' + esc(label) + '</span><select name="' + name + '"><option value="0">' + esc(t('bt.me.none')) + '</option>' + opts.map(function (o) { return '<option value="' + o[0] + '"' + (String(cur) === String(o[0]) ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select></label>';
  }
  function customRow(label, value) {
    return '<div class="custom-row"><label class="field field--sm"><span class="field__l">' + esc(t('bt.custom.label')) + '</span><input type="text" name="customLabel" maxlength="60" value="' + esc(label || '') + '"></label><label class="field"><span class="field__l">' + esc(t('bt.custom.value')) + '</span><input type="text" name="customValue" maxlength="300" value="' + esc(value || '') + '"></label><button type="button" class="link-btn custom-rm">' + esc(t('bt.custom.remove')) + '</button></div>';
  }
  function playlistRow(label, url) {
    return '<div class="custom-row"><label class="field field--sm"><span class="field__l">' + esc(t('bt.pl.label')) + '</span><input type="text" name="plLabel" maxlength="60" value="' + esc(label || '') + '"></label><label class="field"><span class="field__l">' + esc(t('bt.pl.url')) + '</span><input type="text" name="plUrl" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="300" placeholder="https://open.spotify.com/playlist/…" value="' + esc(url || '') + '"></label><button type="button" class="link-btn custom-rm">' + esc(t('bt.custom.remove')) + '</button></div>';
  }
  function listRow(L, title, url) {
    return '<div class="custom-row nf-row"><span class="nf-row__n" aria-hidden="true"></span><label class="field field--sm"><span class="field__l">' + esc(t('bt.l.' + L.key + '.item')) + '</span><input type="text" name="lTitle" maxlength="80" value="' + esc(title || '') + '"></label><label class="field"><span class="field__l">' + esc(t('bt.l.' + L.key + '.url')) + '</span><input type="text" name="lUrl" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="300" placeholder="' + esc(L.ph || 'https://…') + '" value="' + esc(url || '') + '"></label><span class="nf-row__acts"><button type="button" class="link-btn nf-up">' + esc(t('bt.l.up')) + '</button><button type="button" class="link-btn custom-rm">' + esc(t('bt.custom.remove')) + '</button></span></div>';
  }
  VIEWS.me = function () {
    var me = meDraftRead() || getMe() || { id: '', name: '', bmonth: 0, bday: 0, byear: 0, photo: '', custom: [], playlists: [], netflix: [], lists: {} };
    var comp = completeness(me);
    pendingPhoto = null;
    var months = MONTHS_EN.map(function (m, i) { return [i + 1, monthName(i + 1)]; });
    var days = []; for (var i = 1; i <= 31; i++) days.push([i, String(i)]);
    var photoSrc = me.photo;
    return '<div class="wrap page me">' + crumb(t('nav.me')) +
      '<header class="page__head"><h1>' + esc(t('bt.me.title')) + '</h1><p>' + esc(t('bt.me.intro')) + '</p></header>' +
      '<form id="me-form" class="card form" novalidate>' +
        '<div class="form__photo"><div id="me-avatar">' + (photoSrc ? '<img class="avatar avatar--lg" src="' + esc(photoSrc) + '" alt="">' : '<span class="avatar avatar--lg avatar--txt" aria-hidden="true">' + esc(initials(me.name || '?')) + '</span>') + '</div>' +
          '<div><span class="field__l">' + esc(t('bt.me.photo')) + '</span><p class="field__h">' + esc(t('bt.me.photoHint')) + '</p>' +
          '<input type="file" id="me-photo" class="sr-only" accept="image/*"><label class="btn" for="me-photo" id="me-photo-label">' + esc(t('bt.me.choosePhoto')) + '</label> ' +
          '<button type="button" class="link-btn" id="me-photo-rm"' + (photoSrc ? '' : ' hidden') + '>' + esc(t('bt.me.removePhoto')) + '</button></div></div>' +
        '<label class="field"><span class="field__l">' + esc(t('bt.me.name')) + ' *</span><input name="name" type="text" required maxlength="80" autocomplete="name" value="' + esc(me.name) + '"><span class="field__h">' + esc(t('bt.me.nameHint')) + '</span></label>' +
        '<fieldset class="field fieldset"><legend class="field__l">' + esc(t('bt.me.birthday')) + ' *</legend><div class="field__row">' +
          sel('bmonth', t('bt.me.month'), months, me.bmonth) + sel('bday', t('bt.me.day'), days, me.bday) +
          '<label class="field field--sm"><span class="field__l">' + esc(t('bt.me.year')) + '</span><input name="byear" type="number" inputmode="numeric" min="1900" max="2100" placeholder="1998" value="' + (me.byear || '') + '"></label>' +
        '</div><label class="pt-tick"><input type="checkbox" name="showYear"' + (me.showYear ? ' checked' : '') + '> <span>' + esc(t('pt.me.showYear')) + '</span></label><span class="field__h">' + esc(t('pt.me.yearHint')) + '</span></fieldset>' + posFieldset(me) + partnerFieldset(me) +
        '<p class="form__note"><span class="meter__bar" style="display:block;margin-bottom:6px"><span style="width:' + Math.round(100 * comp.n / comp.total) + '%"></span></span>' + esc(tf('bt.me.complete', comp)) + ' · ' + esc(t('bt.me.completeHint')) + ' <button type="button" class="link-btn" id="me-toggle-all" data-open="1">' + esc(t('bt.me.collapseAll')) + '</button></p>' +
        GROUPS.map(function (g, gi) {
          return '<details class="fgroup"' + (gi === 0 ? ' open' : '') + posAttr(g, me) + '><summary><span>' + esc(groupLabel(g)) + '</span><span class="muted fgroup__n" data-group="' + g + '"></span></summary><div class="fgroup__body">' +
            (g === 'quick' ? '<p class="field__h">' + esc(t('pt.quick.note')) + '</p>' : g === 'consultant' ? '<p class="field__h">' + esc(t('pt.cons.note')) + '</p>' : g === 'contact' ? '<p class="field__h">' + esc(t('bt.f.contactNote')) + '</p>' : g === 'emergency' ? '<p class="field__h">' + esc(t('bt.f.emergencyNote')) + '</p>' : '') +
            subChunks(g).map(function (ch) { return (ch.sub ? '<h3 class="fgroup__sub">' + esc(subLabel(ch.sub)) + '</h3>' : '') + ch.fields.map(function (f) {
              var v = me[f.key] || '';
              var ctl = f.type === 'textarea' ? '<textarea name="' + f.key + '" rows="2" maxlength="' + MAX_TEXT + '">' + esc(v) + '</textarea>'
                      : f.type === 'year' ? '<input name="' + f.key + '" type="number" inputmode="numeric" min="1950" max="2100" value="' + esc(v) + '">'
                      : f.type === 'month' ? '<input name="' + f.key + '" type="month" min="1990-01" max="2100-12" value="' + esc(v) + '">'
                      : f.type === 'url' ? '<input name="' + f.key + '" type="text" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="200" placeholder="' + esc(t('bt.f.urlHint')) + '" value="' + esc(v) + '">'
                      : '<input name="' + f.key + '" type="' + f.type + '" maxlength="120"' + (f.type === 'tel' ? ' inputmode="tel" autocomplete="tel"' : f.type === 'email' ? ' autocomplete="email"' : '') + ' value="' + esc(v) + '">';
              return '<label class="field"><span class="field__l">' + esc(fieldLabel(f.key)) + (f.print ? '' : ' <em class="field__tag">' + esc(t('bt.f.inAppOnly')) + '</em>') + '</span>' + ctl + (t('bt.h.' + f.key) !== 'bt.h.' + f.key ? '<span class="field__h">' + esc(t('bt.h.' + f.key)) + '</span>' : '') + '</label>' + audSel(f, me);
            }).join(''); }).join('') + '</div></details>';
        }).join('') +
        '<details class="fgroup"><summary><span>' + esc(t('bt.f.playlists')) + '</span><span class="muted fgroup__n" data-group="playlists"></span></summary><div class="fgroup__body"><p class="field__h">' + esc(tf('bt.pl.hint', { n: PLAYLIST_MAX })) + '</p><div id="pl-rows">' +
          (me.playlists || []).map(function (x) { return playlistRow(x.label, x.url); }).join('') +
        '</div><p><button type="button" class="btn" id="pl-add">' + esc(t('bt.pl.add')) + '</button></p></div></details>' +
        '<p class="fgroup__intro">' + esc(t('bt.l.intro')) + '</p>' +
        LISTS.map(function (L) {
          return '<details class="fgroup"><summary><span>' + esc(listLabel(L.key)) + '</span><span class="muted fgroup__n" data-group="list-' + L.key + '"></span></summary><div class="fgroup__body"><p class="field__h">' + esc(tf('bt.l.' + L.key + '.hint', { n: L.max })) + '</p><div class="lrows" id="rows-' + L.key + '" data-list="' + L.key + '">' +
            listOf(me, L.key).map(function (x) { return listRow(L, x.title, x.url); }).join('') +
            '</div><p><button type="button" class="btn" data-ladd="' + L.key + '">' + esc(t('bt.l.' + L.key + '.add')) + '</button></p></div></details>';
        }).join('') +
        '<details class="fgroup"><summary><span>' + esc(t('bt.custom.title')) + '</span><span class="muted fgroup__n" data-group="custom"></span></summary><div class="fgroup__body"><p class="field__h">' + esc(t('bt.custom.hint')) + '</p><div id="custom-rows">' +
          (me.custom || []).map(function (x) { return customRow(x.label, x.value); }).join('') +
        '</div><p><button type="button" class="btn" id="custom-add">' + esc(t('bt.custom.add')) + '</button></p></div></details>' +
        '<p class="form__status" id="me-status" role="status" aria-live="polite"></p>' +
        '<div class="form__acts"><button type="submit" class="btn btn--solid">' + esc(t('bt.me.save')) + '</button>' + (me.id ? '<a class="btn" href="#/person/' + encodeURIComponent(me.id) + '">' + esc(t('nav.me')) + ' →</a><button type="button" class="link-btn" id="me-clear">' + esc(t('bt.me.clear')) + '</button>' : '') + '</div>' +
      '</form>' + (me.id ? funLinksHTML() : '') + '</div>';
  };
  function shrinkPhoto(file, cb) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      try {
        var s = Math.min(img.width, img.height), k = Math.min(1, MAX_PHOTO / s), w = Math.round(s * k);
        var cv = document.createElement('canvas'); cv.width = w; cv.height = w;
        var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, w);
        cx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, w, w);   // centre-square crop
        var out = cv.toDataURL('image/jpeg', 0.82);
        URL.revokeObjectURL(url); cb(okPhoto(out) ? out : null);
      } catch (e) { URL.revokeObjectURL(url); cb(null); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  AFTER.me = function () {
    var form = document.getElementById('me-form'), status = document.getElementById('me-status');
    var fi = document.getElementById('me-photo'), rm = document.getElementById('me-photo-rm'), av = document.getElementById('me-avatar');
    function say(m, err) { status.textContent = m; status.classList.toggle('is-error', !!err); }
    fi.addEventListener('change', function () {
      var f = fi.files && fi.files[0]; fi.value = ''; if (!f) return;
      shrinkPhoto(f, function (data) {
        if (!data) { say(t('bt.me.photoTooBig'), true); return; }
        pendingPhoto = data; av.innerHTML = '<img class="avatar avatar--lg" src="' + esc(data) + '" alt="">'; rm.hidden = false; say('');
      });
    });
    rm.addEventListener('click', function () { pendingPhoto = ''; av.innerHTML = '<span class="avatar avatar--lg avatar--txt" aria-hidden="true">' + esc(initials(form.name.value || '?')) + '</span>'; rm.hidden = true; });
    function paintCounts() {
      GROUPS.forEach(function (g) {
        var fs = groupFields(g), n = fs.filter(function (f) { return form.elements[f.key] && form.elements[f.key].value.trim(); }).length;
        var el = form.querySelector('.fgroup__n[data-group="' + g + '"]'); if (el) el.textContent = n + '/' + fs.length;
      });
      var cel = form.querySelector('.fgroup__n[data-group="custom"]'); if (cel) cel.textContent = String(form.querySelectorAll('#custom-rows .custom-row').length);
      var pel = form.querySelector('.fgroup__n[data-group="playlists"]'); if (pel) pel.textContent = form.querySelectorAll('#pl-rows .custom-row').length + '/' + PLAYLIST_MAX;
      var addBtn = document.getElementById('pl-add'); if (addBtn) addBtn.disabled = form.querySelectorAll('#pl-rows .custom-row').length >= PLAYLIST_MAX;
      LISTS.forEach(function (L) {
        var rs = form.querySelectorAll('#rows-' + L.key + ' .custom-row'), el = form.querySelector('.fgroup__n[data-group="list-' + L.key + '"]'); if (el) el.textContent = rs.length + '/' + L.max;
        rs.forEach(function (r, i) { r.querySelector('.nf-row__n').textContent = '#' + (i + 1); r.querySelector('.nf-up').disabled = i === 0; });
        var ab = form.querySelector('[data-ladd="' + L.key + '"]'); if (ab) ab.disabled = rs.length >= L.max;
      });
    }
    paintCounts();
    form.addEventListener('input', function () { clearTimeout(form._ct); form._ct = setTimeout(paintCounts, 200); });
    var rows = document.getElementById('custom-rows');
    document.getElementById('custom-add').addEventListener('click', function () { rows.insertAdjacentHTML('beforeend', customRow('', '')); var last = rows.lastElementChild.querySelector('input'); if (last) last.focus(); paintCounts(); });
    rows.addEventListener('click', function (e) { var b = e.target.closest('.custom-rm'); if (b) { b.closest('.custom-row').remove(); paintCounts(); } });
    var plRows = document.getElementById('pl-rows');
    document.getElementById('pl-add').addEventListener('click', function () { if (plRows.querySelectorAll('.custom-row').length >= PLAYLIST_MAX) return; plRows.insertAdjacentHTML('beforeend', playlistRow('', '')); var last = plRows.lastElementChild.querySelector('input'); if (last) last.focus(); paintCounts(); });
    plRows.addEventListener('click', function (e) { var b = e.target.closest('.custom-rm'); if (b) { b.closest('.custom-row').remove(); paintCounts(); } });
    form.querySelectorAll('[data-ladd]').forEach(function (btn) {
      var L = LIST_BY[btn.getAttribute('data-ladd')], box = document.getElementById('rows-' + L.key);
      btn.addEventListener('click', function () { if (box.querySelectorAll('.custom-row').length >= L.max) return; box.insertAdjacentHTML('beforeend', listRow(L, '', '')); var last = box.lastElementChild.querySelector('input'); if (last) last.focus(); paintCounts(); });
      box.addEventListener('click', function (e) {
        var rm = e.target.closest('.custom-rm'), up = e.target.closest('.nf-up');
        if (rm) { rm.closest('.custom-row').remove(); paintCounts(); }
        else if (up) { var row = up.closest('.custom-row'), prev = row.previousElementSibling; if (prev) { box.insertBefore(row, prev); paintCounts(); var b = row.querySelector('.nf-up'); (b.disabled ? row.querySelector('input') : b).focus(); } }
      });
    });
    var tog = document.getElementById('me-toggle-all');
    tog.addEventListener('click', function () {
      var open = tog.getAttribute('data-open') !== '1';
      form.querySelectorAll('details.fgroup').forEach(function (d) { d.open = open; });
      tog.setAttribute('data-open', open ? '1' : '0'); tog.textContent = t(open ? 'bt.me.collapseAll' : 'bt.me.expandAll');
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var old = getMe() || {}, c = { id: old.id || newId(), name: form.name.value };
      FIELDS.forEach(function (f) { c[f.key] = form.elements[f.key].value; });
      c.custom = []; c.playlists = []; c.netflix = []; c.lists = {};
      form.querySelectorAll('#custom-rows .custom-row').forEach(function (r) { c.custom.push({ label: r.querySelector('[name=customLabel]').value, value: r.querySelector('[name=customValue]').value }); });
      var badPl = false;
      form.querySelectorAll('#pl-rows .custom-row').forEach(function (r) { var u = r.querySelector('[name=plUrl]').value.trim(); if (u && !spotifyUrl(u)) badPl = true; if (u) c.playlists.push({ label: r.querySelector('[name=plLabel]').value, url: u }); });
      if (badPl) { say(t('bt.pl.badUrl'), true); return; }
      var badL = null;
      LISTS.forEach(function (L) {
        var arr = [];
        form.querySelectorAll('#rows-' + L.key + ' .custom-row').forEach(function (r) {
          var ti = r.querySelector('[name=lTitle]').value.trim(), u = r.querySelector('[name=lUrl]').value.trim();
          if (!badL && u && !listUrl(L, u)) badL = { L: L, k: 'url', el: r.querySelector('[name=lUrl]') };
          if (!badL && u && !ti) badL = { L: L, k: 'title', el: r.querySelector('[name=lTitle]') };
          if (ti) arr.push({ title: ti, url: u });
        });
        if (L.key === 'netflix') c.netflix = arr; else if (arr.length) c.lists[L.key] = arr;
      });
      if (badL) { say(badL.k === 'title' ? tf('bt.l.needTitle', { list: listLabel(badL.L.key) }) : tf('bt.l.badUrl', { list: listLabel(badL.L.key), hosts: t('bt.l.' + badL.L.key + '.hosts') }), true); badL.el.closest('details').open = true; badL.el.focus(); return; }
      var m = toInt(form.bmonth.value, 1, 12), d = toInt(form.bday.value, 1, 31), y = toInt(form.byear.value, 1900, 2100);
      if (!cleanText(c.name, 80)) { say(t('bt.me.needName'), true); form.name.focus(); return; }
      if (!(m && d) || !validDay(m, d, y)) { say(t('bt.me.badBirthday'), true); form.bmonth.focus(); return; }
      c.bmonth = m; c.bday = d; c.byear = m && d ? y : 0;
      c.photo = pendingPhoto === null ? (old.photo || '') : pendingPhoto;
      c.shoutouts = old.shoutouts || []; c.badges = earnedIds();
      FUN_KEYS.forEach(function (k) { if (old[k] !== undefined) c[k] = old[k]; });
      var role = form.querySelector('input[name="cardRole"]:checked');
      if (role && role.value === 'partner') {
        var po = form.elements.partnerOf ? form.elements.partnerOf.value : '', pr = po ? findPerson(po) : null, pn = cleanText(form.elements.partnerName ? form.elements.partnerName.value : '', 80);
        if (!pr && !pn) { say(t('bt.pt.needWho'), true); (form.elements.partnerOf || form.elements.partnerName).focus(); return; }
        c.partnerOf = pr ? pr.id : ''; c.partnerName = pr ? pr.name : pn;
      } else { c.partnerOf = ''; c.partnerName = ''; }
      collectPT(form, c);
      c.updated = new Date().toISOString();
      var clean = sanitizeCard(c);
      if (!clean) { say(t('bt.me.needName'), true); return; }
      store.set('me', clean); pendingPhoto = null; rebuildIndex();
      say(t('bt.me.saved'));
      setTimeout(function () { location.hash = '#/person/' + encodeURIComponent(clean.id); }, 500);
    });
    var cl = document.getElementById('me-clear');
    if (cl) cl.addEventListener('click', function () { if (!window.confirm(t('bt.me.confirmClear'))) return; store.del('me'); rebuildIndex(); route({ keepScroll: false }); });
  };

  /* ---- Birthdays ---- */
  VIEWS.birthdays = function () {
    var today = new Date(), all = allCards();
    var dated = all.filter(function (c) { return c.bmonth; }).map(function (c) { return { c: c, d: daysUntil(c, today) }; }).sort(function (a, b) { return a.d - b.d || byName(a.c, b.c); });
    var undated = all.filter(function (c) { return !c.bmonth; });
    var groups = [], seen = {};
    dated.forEach(function (x) {
      var key = x.d === 0 ? 'today' : x.c.bmonth === today.getMonth() + 1 && x.d < 32 ? 'month' : 'm' + x.c.bmonth;
      if (!seen[key]) { seen[key] = { key: key, label: key === 'today' ? t('bt.bd.today') : key === 'month' ? t('bt.bd.thisMonth') : monthName(x.c.bmonth), items: [] }; groups.push(seen[key]); }
      seen[key].items.push(x);
    });
    return '<div class="wrap page">' + crumb(t('nav.birthdays')) +
      '<header class="page__head"><h1>' + esc(t('nav.birthdays')) + '</h1><p>' + esc(t('bt.bd.intro')) + '</p></header>' +
      (dated.length ? '<div class="callout"><p class="callout__title">' + esc(t('bt.cal.all')) + '</p><p style="margin:0 0 10px">' + esc(t('bt.cal.allText')) + '</p><button type="button" class="btn" id="cal-all">' + icon('calendar', 'btn__ico') + esc(t('bt.cal.all')) + '</button><p class="form__status" id="cal-status" role="status"></p></div>' : '') +
      (!dated.length ? '<div class="empty"><p>' + esc(t('bt.bd.none')) + '</p><p><a class="btn btn--solid" href="#/me">' + esc(t('nav.me')) + '</a></p></div>' :
        groups.map(function (g) {
          return '<h2>' + esc(g.label) + '</h2><div class="bdlist">' + g.items.map(function (x) {
            var c = x.c, yr = today.getFullYear() + (x.d > 0 && (c.bmonth < today.getMonth() + 1 || (c.bmonth === today.getMonth() + 1 && c.bday < today.getDate())) ? 1 : 0);
            return '<a class="row bdrow' + (x.d === 0 ? ' is-today' : '') + '" href="#/person/' + encodeURIComponent(c.id) + '"><span class="bdrow__date"><span class="bdrow__d">' + c.bday + '</span><span class="bdrow__m">' + esc(monthName(c.bmonth).slice(0, 3)) + '</span></span>' +
              '<span><h3>' + esc(c.name) + (isPartner(c) ? ' <span class="em-tag">' + esc(t('bt.pt.tag')) + '</span>' : '') + '</h3><p>' + esc(x.d === 0 ? t('bt.home.today') : x.d === 1 ? t('bt.home.inDays1') : tf('bt.home.inDaysN', { n: x.d })) + (c.byear ? ' · ' + esc(tf('bt.person.turns', { n: ageOn(c, yr) })) : '') + '</p></span>' + avatar(c, 'avatar--sm') + '</a>';
          }).join('') + '</div>';
        }).join('')) +
      (undated.length ? '<h2>' + esc(t('bt.bd.noDate')) + '</h2><p class="muted">' + undated.map(function (c) { return esc(c.name); }).join(', ') + '</p>' : '') +
      '</div>';
  };

  AFTER.birthdays = function () {
    var b = document.getElementById('cal-all'); if (!b) return;
    b.addEventListener('click', function () { icsOut(allCards(), 'batch-birthdays.ics', function (m) { var st = document.getElementById('cal-status'); if (st) st.textContent = m; }); });
  };

  /* ---- Share cards: card files in and out ---- */
  function slug(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 30) || 'card'; }
  function mergeCards(incoming) {
    var me = getMe(), list = getOthers(), res = { added: 0, updated: 0, skipped: 0 };
    incoming.map(sanitizeCard).forEach(function (c) {
      if (!c) { res.skipped++; return; }
      if (me && (c.id === me.id || c.name.toLowerCase() === me.name.toLowerCase())) { res.skipped++; return; }
      var i = -1;
      for (var k = 0; k < list.length; k++) if (list[k].id === c.id || list[k].name.toLowerCase() === c.name.toLowerCase()) { i = k; break; }
      if (i < 0) { list.push(c); res.added++; }
      else if (new Date(c.updated) > new Date(list[i].updated)) { list[i] = c; res.updated++; }
      else res.skipped++;
    });
    saveOthers(list);
    return res;
  }
  /* ---- Print: batch sheet or name tags ---- */
  var printMode = 'sheet';
  VIEWS.print = function () {
    var all = people(), today = new Date(), bn = batchName();
    var head = '<header class="page__head no-print"><h1>' + esc(t('nav.print')) + '</h1><p>' + esc(t('bt.print.intro')) + '</p>' +
      (all.length ? '<div class="filters" role="group"><button type="button" class="filter" data-pmode="sheet" aria-pressed="' + (printMode === 'sheet') + '">' + esc(t('bt.print.modeSheet')) + '</button><button type="button" class="filter" data-pmode="tags" aria-pressed="' + (printMode === 'tags') + '">' + esc(t('bt.print.modeTags')) + '</button><button type="button" class="filter" data-pmode="full" aria-pressed="' + (printMode === 'full') + '">' + esc(t('bt.print.modeFull')) + '</button></div>' +
        '<p><button type="button" class="btn btn--solid" id="do-print">' + icon('print', 'btn__ico') + esc(t('bt.print.btn')) + '</button>' + (printMode === 'tags' ? ' <span class="muted">' + esc(t('bt.print.tagsHint')) + '</span>' : printMode === 'full' ? ' <span class="muted">' + esc(t('bt.print.fullHint')) + '</span>' : '') + '</p>' : '') + '</header>';
    if (!all.length) return '<div class="wrap page print">' + crumb(t('nav.print')) + head + '<div class="empty"><p>' + esc(t('bt.print.empty')) + '</p></div></div>';
    var body;
    if (printMode === 'full') {
      body = '<div class="sheet full"><header class="sheet__head"><h2>' + esc(bn ? bn + ' · ' + t('bt.print.fullTitle') : t('bt.print.fullTitle')) + '</h2><p>' + esc(tf('bt.print.subtitle', { program: HOSP.program || '', hospital: HOSP.name || '' })) + ' · ' + esc(today.toLocaleDateString(locale(), { year: 'numeric', month: 'long', day: 'numeric' })) + ' · ' + esc(tf(all.length === 1 ? 'bt.home.count1' : 'bt.home.countN', { n: all.length })) + '</p></header>' +
        all.map(function (c) {
          var head = '<header class="full__head">' + avatar(c, 'avatar--print') + '<div><h3>' + esc(c.name) + (c.nickname ? ' <small>“' + esc(c.nickname) + '”</small>' : '') + '</h3>' +
            (c.bmonth ? '<p>' + esc(t('bt.person.birthday')) + ': ' + esc(bdayText(c, true)) + (c.byear ? ' · ' + esc(tf('bt.person.turns', { n: ageOn(c, today.getFullYear()) })) : '') + ' · ' + esc(zodiac(c)) + (chineseZodiac(c) ? ' / ' + esc(chineseZodiac(c)) : '') + '</p>' : '') + '</div></header>';
          var groups = GROUPS.map(function (g) {
            var rows = subChunks(g).map(function (ch) {
              var r = ch.fields.filter(function (f) { return c[f.key] && f.key !== 'nickname'; }).map(function (f) {
                var v = f.type === 'month' ? fmtMonth(c[f.key]) : f.type === 'url' ? linkHref(f, c[f.key]) : c[f.key];
                return '<p class="sheet__line"><strong>' + esc(fieldLabel(f.key)) + ':</strong> ' + esc(v).replace(/\n/g, ' · ') + '</p>';
              }).join('');
              return r ? (ch.sub ? '<p class="full__sub">' + esc(subLabel(ch.sub)) + '</p>' : '') + r : '';
            }).join('');
            return rows ? '<section class="full__group"><h4>' + esc(groupLabel(g)) + '</h4>' + rows + '</section>' : '';
          }).join('');
          if (c.playlists.length) groups += '<section class="full__group"><h4>' + esc(t('bt.f.playlists')) + '</h4>' + c.playlists.map(function (pl) { return '<p class="sheet__line"><strong>' + esc(pl.label || '—') + ':</strong> ' + esc(pl.url) + '</p>'; }).join('') + '</section>';
          LISTS.forEach(function (L) { var xs = listOf(c, L.key); if (xs.length) groups += '<section class="full__group"><h4>' + esc(listLabel(L.key)) + '</h4>' + xs.map(function (x, i) { return '<p class="sheet__line"><strong>' + (i + 1) + '.</strong> ' + esc(x.title) + (x.url ? ' — ' + esc(x.url) : '') + '</p>'; }).join('') + '</section>'; });
          if (c.custom.length) groups += '<section class="full__group"><h4>' + esc(t('bt.print.custom')) + '</h4>' + c.custom.map(function (x) { return '<p class="sheet__line"><strong>' + esc(x.label) + ':</strong> ' + esc(x.value).replace(/\n/g, ' · ') + '</p>'; }).join('') + '</section>';
          return '<article class="full__person">' + head + '<div class="full__cols">' + groups + '</div></article>';
        }).join('') + '<p class="sheet__foot">' + esc(ATTRIBUTION) + '</p></div>';
    } else if (printMode === 'tags') {
      body = '<div class="sheet tags"><div class="tags__grid">' + all.map(function (c) {
        return '<article class="tag">' + (bn ? '<p class="tag__batch">' + esc(bn) + '</p>' : '') + avatar(c, 'avatar--tag') + '<h3>' + esc(c.preferredName || c.nickname || c.name.split(/\s+/)[0]) + '</h3><p class="tag__name">' + esc(c.name) + '</p>' + (c.hometown ? '<p class="tag__sub">' + esc(c.hometown) + '</p>' : '') + '<p class="tag__foot">' + esc(HOSP.shortName || '') + ' · ' + esc(HOSP.program || '') + '</p></article>';
      }).join('') + '</div></div>';
    } else {
      body = '<div class="sheet"><header class="sheet__head"><h2>' + esc(bn ? bn + ' · ' + t('bt.print.title') : t('bt.print.title')) + '</h2><p>' + esc(tf('bt.print.subtitle', { program: HOSP.program || '', hospital: HOSP.name || '' })) + ' · ' + esc(today.toLocaleDateString(locale(), { year: 'numeric', month: 'long' })) + '</p></header>' +
        '<div class="sheet__grid">' + all.map(function (c) {
          return '<article class="sheet__card">' + avatar(c, 'avatar--print') + '<div class="sheet__body"><h3>' + esc(c.name) + (c.nickname ? ' <small>“' + esc(c.nickname) + '”</small>' : '') + '</h3>' +
            (c.bmonth ? '<p class="sheet__line"><strong>' + esc(t('bt.person.birthday')) + ':</strong> ' + esc(bdayText(c)) + '</p>' : '') +
            FIELDS.filter(function (f) { return f.print && f.key !== 'nickname' && c[f.key]; }).map(function (f) { return '<p class="sheet__line"><strong>' + esc(fieldLabel(f.key)) + ':</strong> ' + esc(c[f.key]).replace(/\n/g, ' · ') + '</p>'; }).join('') +
            c.custom.map(function (x) { return '<p class="sheet__line"><strong>' + esc(x.label) + ':</strong> ' + esc(x.value) + '</p>'; }).join('') +
            '</div></article>';
        }).join('') + '</div><p class="sheet__foot">' + esc(ATTRIBUTION) + '</p></div>';
    }
    return '<div class="wrap page print">' + crumb(t('nav.print')) + head + body + '</div>';
  };
  AFTER.print = function () {
    var b = document.getElementById('do-print'); if (b) b.addEventListener('click', function () { window.print(); });
    var ms = document.querySelectorAll('.filter[data-pmode]');
    for (var i = 0; i < ms.length; i++) ms[i].addEventListener('click', function (e) { printMode = e.currentTarget.getAttribute('data-pmode'); route({ keepScroll: true }); });
  };

  /* ---- Guess who: three modes, rounds of 10, leaderboard on this phone ---- */
  var ROUND = 10, GUESS_MODES = ['clue', 'photo', 'month'];
  var guess = { mode: 'clue', right: 0, total: 0, q: null, done: false, marks: [] };
  function modeLabel(m) { return t('bt.guess.mode' + m.charAt(0).toUpperCase() + m.slice(1)); }
  function makeQuestion(mode) {
    var all = people(), pick, others, opts;
    if (mode === 'photo') {
      var withPhoto = all.filter(function (c) { return c.photo; });
      if (withPhoto.length < 4) return null;
      pick = withPhoto[Math.floor(Math.random() * withPhoto.length)];
      others = shuffle(all.filter(function (c) { return c.id !== pick.id; })).slice(0, 3);
      return { mode: mode, c: pick, opts: shuffle(others.concat([pick])).map(function (c) { return { id: c.id, label: c.name }; }), answer: pick.id, answered: false };
    }
    if (mode === 'month') {
      var dated = all.filter(function (c) { return c.bmonth; });
      if (dated.length < 4) return null;
      pick = dated[Math.floor(Math.random() * dated.length)];
      var months = [pick.bmonth]; while (months.length < 4) { var m = 1 + Math.floor(Math.random() * 12); if (months.indexOf(m) < 0) months.push(m); }
      return { mode: mode, c: pick, opts: shuffle(months).map(function (m) { return { id: String(m), label: monthName(m) }; }), answer: String(pick.bmonth), answered: false };
    }
    var pool = [];
    GUESS_FIELDS.forEach(function (k) { var have = all.filter(function (c) { return c[k]; }); if (have.length >= 4) have.forEach(function (c) { pool.push({ c: c, k: k }); }); });
    if (!pool.length) return null;
    var p = pool[Math.floor(Math.random() * pool.length)];
    others = shuffle(all.filter(function (c) { return c.id !== p.c.id; })).slice(0, 3);
    return { mode: mode, c: p.c, k: p.k, clue: p.c[p.k], opts: shuffle(others.concat([p.c])).map(function (c) { return { id: c.id, label: c.name }; }), answer: p.c.id, answered: false };
  }
  function board() { var b = store.get('guessBoard', []); return Array.isArray(b) ? b : []; }
  function saveRound() {
    var me = getMe(), b = board();
    b.push({ who: me ? me.name : t('bt.guess.player'), mode: guess.mode, right: guess.right, n: guess.total, date: new Date().toISOString() });
    b.sort(function (x, y) { return (y.right / y.n) - (x.right / x.n) || new Date(y.date) - new Date(x.date); });
    store.set('guessBoard', b.slice(0, 10));
  }
  function resetRound(mode) { guess = { mode: mode || guess.mode, right: 0, total: 0, q: null, done: false, marks: [] }; }
  VIEWS.guess = function () {
    if (!guess.q && !guess.done) guess.q = makeQuestion(guess.mode);
    var q = guess.q, b = board();
    var modes = '<div class="filters" role="group">' + GUESS_MODES.map(function (m) { return '<button type="button" class="filter" data-gmode="' + m + '" aria-pressed="' + (guess.mode === m) + '">' + esc(modeLabel(m)) + '</button>'; }).join('') + '</div>';
    var boardHtml = '<h2>' + esc(t('bt.guess.board')) + '</h2><div class="card">' + (b.length ? '<ol class="plain plain--num">' + b.map(function (r) { return '<li><strong>' + esc(r.who) + '</strong> <span class="muted">' + esc(tf('bt.guess.boardRow', { right: r.right, n: r.n, mode: modeLabel(r.mode), date: bkDate(r.date) })) + '</span></li>'; }).join('') + '</ol>' : '<p class="muted">' + esc(t('bt.guess.boardEmpty')) + '</p>') + '</div>';
    var body;
    if (guess.done) body = '<div class="card guess__card"><h2 style="margin-top:0">' + esc(tf('bt.guess.roundDone', { right: guess.right, n: guess.total })) + '</h2>' + (setResult(t('nav.guess') + ' (' + modeLabel(guess.mode) + ')', guess.right, guess.total, guess.marks || []) ? resultBlock() : '') + '<p><button type="button" class="btn btn--solid" id="g-again">' + esc(t('bt.guess.playAgain')) + '</button></p></div>';
    else if (!q) body = '<div class="empty"><p>' + esc(t(guess.mode === 'photo' ? 'bt.guess.needPhotos' : guess.mode === 'month' ? 'bt.guess.needDates' : 'bt.guess.notEnough')) + '</p></div>';
    else {
      var ask = q.mode === 'photo' ? '<p class="guess__ask">' + esc(t('bt.guess.whosePhoto')) + '</p><div class="guess__photo">' + avatar(q.c, 'avatar--xl') + '</div>'
              : q.mode === 'month' ? '<p class="guess__ask">' + esc(tf('bt.guess.whichMonth', { name: q.c.name })) + '</p><div class="guess__photo">' + avatar(q.c, 'avatar--lg') + '</div>'
              : '<p class="guess__ask">' + esc(tf('bt.guess.whose', { field: fieldLabel(q.k).toLowerCase() })) + '</p><blockquote class="guess__clue">' + esc(q.clue).replace(/\n/g, '<br>') + '</blockquote>';
      body = '<div class="card guess__card"><p class="muted guess__score">' + esc(tf('bt.guess.roundOf', { i: guess.total + 1, n: ROUND })) + ' · ' + esc(tf('bt.guess.score', { right: guess.right, total: guess.total })) + '</p>' + ask +
        '<div class="guess__opts">' + q.opts.map(function (o) { return '<button type="button" class="btn guess__opt" data-id="' + esc(o.id) + '">' + esc(o.label) + '</button>'; }).join('') + '</div>' +
        '<p class="form__status" id="g-status" role="status" aria-live="polite"></p><p class="guess__acts" id="g-acts" hidden><button type="button" class="btn btn--solid" id="g-next">' + esc(t('bt.guess.next')) + '</button> <a class="btn" href="#/person/' + encodeURIComponent(q.c.id) + '">' + esc(t('bt.guess.open')) + '</a></p></div>';
    }
    return '<div class="wrap page guess">' + crumb(t('nav.guess')) + '<header class="page__head"><h1>' + esc(t('nav.guess')) + '</h1><p>' + esc(t('bt.guess.intro')) + '</p></header>' + modes + body + boardHtml + '</div>';
  };
  AFTER.guess = function () {
    var ms = document.querySelectorAll('.filter[data-gmode]');
    for (var k = 0; k < ms.length; k++) ms[k].addEventListener('click', function (e) { resetRound(e.currentTarget.getAttribute('data-gmode')); route({ keepScroll: true }); });
    var again = document.getElementById('g-again'); if (again) again.addEventListener('click', function () { resetRound(); route({ keepScroll: true }); });
    var q = guess.q; if (!q || guess.done) return;
    var opts = document.querySelectorAll('.guess__opt'), st = document.getElementById('g-status'), acts = document.getElementById('g-acts');
    for (var i = 0; i < opts.length; i++) opts[i].addEventListener('click', function (e) {
      if (q.answered) return; q.answered = true; guess.total++;
      var ok = e.currentTarget.getAttribute('data-id') === q.answer; if (ok) guess.right++; (guess.marks = guess.marks || []).push(ok);
      var stk = ok ? counter('guessStreak', counter('guessStreak') + 1) : counter('guessStreak', 0); if (stk >= 10) award('streak10');
      if (guess.total >= ROUND && guess.right === guess.total) award('perfectguess');
      for (var j = 0; j < opts.length; j++) { opts[j].disabled = true; if (opts[j].getAttribute('data-id') === q.answer) opts[j].classList.add('is-right'); }
      if (!ok) e.currentTarget.classList.add('is-wrong');
      var answerLabel = q.mode === 'month' ? monthName(q.c.bmonth) : q.c.name;
      st.textContent = ok ? t('bt.guess.right') : tf('bt.guess.wrong', { name: answerLabel });
      acts.hidden = false;
      if (guess.total >= ROUND) { document.getElementById('g-next').textContent = tf('bt.guess.roundDone', { right: guess.right, n: guess.total }); }
    });
    document.getElementById('g-next').addEventListener('click', function () {
      if (guess.total >= ROUND) { saveRound(); guess.done = true; guess.q = null; } else guess.q = makeQuestion(guess.mode);
      route({ keepScroll: true });
    });
  };

  /* ---- Batch photo (home banner override, this device) ---- */
  function bannerSrc() { var b = store.get('banner', ''); return okPhoto(b) || (typeof b === 'string' && /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(b) && b.length < 900000) ? b : ''; }
  function shrinkBanner(file, cb) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      try {
        var k = Math.min(1, 1400 / img.width), w = Math.round(img.width * k), h = Math.round(img.height * k);
        var cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.getContext('2d').drawImage(img, 0, 0, w, h);
        var out = cv.toDataURL('image/jpeg', 0.8); URL.revokeObjectURL(url); cb(out.length < 900000 ? out : null);
      } catch (e) { URL.revokeObjectURL(url); cb(null); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }
  /* ---- 1.3.0: QR share, scan, calendar export, batch stats ---- */
  ICONS.qr = '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><path d="M13.5 13.5h3v3h-3zM18.5 13.5h2M20.5 16.5v4h-4M13.5 20.5h2"/>';
  ICONS.camera = '<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7H8l1.5-2.5h5L16 7h2.5A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="13" r="3.5"/>';
  ICONS.chart = '<path d="M4 20h16M7 16v-5M12 16V6M17 16v-8"/>';

  /* ICS (calendar) export: yearly all-day events */
  function icsDate(y, m, d) { return String(y) + pad2(m) + pad2(d); }
  function icsEscape(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); }
  function icsFor(list) {
    var now = new Date(), stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//isaymotion//Psych Tickler//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + icsEscape((batchName() ? batchName() + ' · ' : '') + t('nav.birthdays'))];
    list.forEach(function (c) {
      if (!c.bmonth) return;
      var y = c.byear || now.getFullYear(), d = c.bday;
      if (c.bmonth === 2 && d === 29 && !isLeap(y)) d = 28;
      lines.push('BEGIN:VEVENT', 'UID:' + c.id + '@isaymotion.github.io', 'DTSTAMP:' + stamp,
        'DTSTART;VALUE=DATE:' + icsDate(y, c.bmonth, d),
        'RRULE:FREQ=YEARLY', 'SUMMARY:' + icsEscape('🎂 ' + tf('bt.cal.summary', { name: c.name })),
        'DESCRIPTION:' + icsEscape((c.hometown ? c.hometown + '. ' : '') + (c.giftHints ? fieldLabel('giftHints') + ': ' + c.giftHints : '')),
        'TRANSP:TRANSPARENT', 'END:VEVENT');
    });
    lines.push('END:VCALENDAR');
    return lines.join('\r\n') + '\r\n';
  }
  function icsOut(list, name, cb) {
    var ics = icsFor(list), file = null;
    try { file = new File([ics], name, { type: 'text/calendar' }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: t('nav.birthdays') }).then(function () { cb(tf('bt.cal.saved', { name: name })); }).catch(function () { cb(t('bt.share.cancelled')); });
      return;
    }
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    var a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
    cb(tf('bt.cal.saved', { name: name }));
  }

  /* Batch stats */
  function countBy(list, fn) {
    var m = {}, out = [];
    list.forEach(function (c) { (fn(c) || []).forEach(function (v) { var k = v.toLowerCase(); if (!m[k]) { m[k] = { label: v, n: 0, who: [] }; out.push(m[k]); } m[k].n++; m[k].who.push(c.name); }); });
    return out.sort(function (a, b) { return b.n - a.n || a.label.localeCompare(b.label); });
  }
  function nPeople(n) { return tf(n === 1 ? 'bt.stats.n1' : 'bt.stats.nN', { n: n }); }
  function countList(rows, max) {
    if (!rows.length) return '<p class="muted">' + esc(t('bt.stats.empty')) + '</p>';
    var top = rows[0].n;
    return '<div class="bars">' + rows.slice(0, max || 12).map(function (r) {
      return '<div class="bar"><span class="bar__l">' + esc(r.label) + '</span><span class="bar__track"><span style="width:' + Math.max(6, Math.round(100 * r.n / top)) + '%"></span></span><span class="bar__n" title="' + esc(r.who.join(', ')) + '">' + r.n + '</span></div>';
    }).join('') + '</div>';
  }
  VIEWS.stats = function () {
    var all = people(), today = new Date(), n = all.length;
    if (!n) return '<div class="wrap page">' + crumb(t('nav.stats')) + '<header class="page__head"><h1>' + esc(t('nav.stats')) + '</h1></header><div class="empty"><p>' + esc(t('bt.stats.empty')) + '</p></div></div>';
    var withPhoto = all.filter(function (c) { return c.photo; }).length;
    var avg = Math.round(all.reduce(function (s, c) { var k = completeness(c); return s + 100 * k.n / k.total; }, 0) / n);
    var months = []; for (var i = 1; i <= 12; i++) months.push({ label: monthName(i), n: 0, who: [] });
    all.forEach(function (c) { if (c.bmonth) { months[c.bmonth - 1].n++; months[c.bmonth - 1].who.push(c.name); } });
    var top = Math.max.apply(null, months.map(function (m) { return m.n; }).concat([1]));
    var aged = all.filter(function (c) { return c.byear; }).sort(function (a, b) { return (a.byear - b.byear) || (a.bmonth - b.bmonth) || (a.bday - b.bday); });
    var thisMonth = all.filter(function (c) { return c.bmonth === today.getMonth() + 1; }).sort(function (a, b) { return a.bday - b.bday; });
    var sharedKeys = ['shows', 'kdrama', 'movies', 'anime', 'games', 'music', 'books', 'authors', 'food', 'snack', 'dessert', 'colour', 'pokemon', 'hobbies', 'sports'];
    var shared = sharedKeys.map(function (k) { return { k: k, rows: countBy(all, function (c) { return items(c[k]); }).filter(function (r) { return r.n >= 2; }) }; }).filter(function (x) { return x.rows.length; });
    return '<div class="wrap page stats">' + crumb(t('nav.stats')) +
      '<header class="page__head"><h1>' + esc(t('nav.stats')) + '</h1><p>' + esc(t('bt.stats.intro')) + '</p></header>' +
      '<div class="home__stats"><div class="card stat"><span class="stat__n">' + n + '</span><span class="stat__t">' + esc(t('bt.stats.residents')) + '</span></div>' +
        '<div class="card stat"><span class="stat__n">' + withPhoto + '</span><span class="stat__t">' + esc(t('bt.stats.withPhoto')) + '</span></div>' +
        '<div class="card stat"><span class="stat__n">' + avg + '%</span><span class="stat__t">' + esc(t('bt.stats.avgComplete')) + '</span></div></div>' +
      '<h2>' + esc(t('bt.stats.thisMonth')) + '</h2><div class="card">' + (thisMonth.length ? '<ul class="plain">' + thisMonth.map(function (c) { return '<li><a href="#/person/' + encodeURIComponent(c.id) + '">' + esc(c.name) + '</a> · ' + esc(bdayText(c)) + '</li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(t('bt.stats.thisMonthNone')) + '</p>') + '</div>' +
      '<h2>' + esc(t('bt.stats.months')) + '</h2><div class="card"><div class="bars bars--months">' + months.map(function (m) { return '<div class="bar"><span class="bar__l">' + esc(m.label.slice(0, 3)) + '</span><span class="bar__track"><span style="width:' + (m.n ? Math.max(6, Math.round(100 * m.n / top)) : 0) + '%"></span></span><span class="bar__n" title="' + esc(m.who.join(', ')) + '">' + (m.n || '') + '</span></div>'; }).join('') + '</div></div>' +
      '<h2>' + esc(t('bt.stats.hometowns')) + '</h2><div class="card">' + countList(countBy(all, function (c) { return c.hometown ? [c.hometown] : []; })) + '</div>' +
      '<h2>' + esc(t('bt.stats.schools')) + '</h2><div class="card">' + countList(countBy(all, function (c) { return c.medSchool ? [c.medSchool] : []; })) + '</div>' +
      '<h2>' + esc(t('bt.stats.languages')) + '</h2><div class="card">' + countList(countBy(all, function (c) { return items(c.languages); })) + '</div>' +
      LISTS.filter(function (L) { return L.common; }).map(function (L) { return all.some(function (c) { return listOf(c, L.key).length; }) ? '<h2>' + esc(listLabel(L.key)) + '</h2><div class="card">' + countList(countBy(all, function (c) { return listOf(c, L.key).map(function (x) { return x.title; }); }), 8) + '</div>' : ''; }).join('') +
      (n > 1 ? twinsHTML(all) : '') +
      (aged.length ? '<h2>' + esc(t('bt.stats.ages')) + '</h2><div class="card"><ol class="plain plain--num">' + aged.map(function (c) { return '<li><a href="#/person/' + encodeURIComponent(c.id) + '">' + esc(c.name) + '</a> <span class="muted">· ' + esc(bdayText(c, true)) + '</span></li>'; }).join('') + '</ol></div>' : '') +
      '<h2>' + esc(t('bt.stats.shared')) + '</h2>' + (shared.length ? shared.map(function (x) { return '<div class="card stats__shared"><h3>' + esc(fieldLabel(x.k)) + '</h3>' + countList(x.rows, 6) + '</div>'; }).join('') : '<div class="card"><p class="muted">' + esc(t('bt.stats.sharedNone')) + '</p></div>') +
      '</div>';
  };

  /* ===================== 1.11.0: FUN FEATURES =====================
     Birthday banner, Who said it?, Batch Bingo, Batch twins, Weekly spotlight, Icebreakers,
     Hometown map, Batch Wrapped, Residency day counter. Everything is computed from the cards on
     this device; the only new stored keys are `startDate` (YYYY-MM-DD) and `bingo` (current board). */
  function mulberry(seed) { var a = seed >>> 0; return function () { a = (a + 0x6D2B79F5) >>> 0; var x = Math.imul(a ^ (a >>> 15), 1 | a); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
  function shuffled(list, rnd) { var a = list.slice(); rnd = rnd || Math.random; for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(rnd() * (i + 1)); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function short(c) { return c.preferredName || c.nickname || c.name; }
  function filled(c, k) { return !!(c[k] && String(c[k]).trim()); }
  function others() { var me = getMe(); return people().filter(function (c) { return !me || c.id !== me.id; }); }
  function weekNum(d) { return Math.floor((dayNum(d) + 3) / 7); }   // Monday-based week count since 1970
  function personLink(c) { return '<a href="#/person/' + encodeURIComponent(c.id) + '">' + esc(c.name) + '</a>'; }

  /* ---- 9. Residency day counter ---- */
  function startDate() { var re = /^\d{4}-\d{2}-\d{2}$/, v = String(store.get('startDate', '') || ''), d = String(HOSP.residencyStart || ''); return re.test(v) ? v : re.test(d) ? d : ''; }
  function residencyDay(today) {
    var s = startDate(); if (!s) return null;
    var p = s.split('-'), start = new Date(+p[0], +p[1] - 1, +p[2]);
    var diff = dayNum(today) - dayNum(start);
    return { before: diff < 0, days: diff < 0 ? -diff : diff + 1, start: start };
  }
  function milestone(n) {
    if (n === 1) return t('bt.day.m1');
    if (n === 100 || n === 200 || n === 500 || n === 1000) return tf('bt.day.mN', { n: n });
    if (n > 1 && (n - 1) % 365 === 0) return tf('bt.day.mYear', { n: (n - 1) / 365 });
    return '';
  }
  function residencyStat(today) {
    var r = residencyDay(today);
    if (!r) return getMe() ? '<a class="card stat stat--link" href="#/about">' + icon('calendar', 'stat__ico') + '<span class="stat__t">' + esc(t('bt.day.title')) + '</span><span class="stat__sub">' + esc(t('bt.day.set')) + '</span></a>' : '';
    if (r.before) return '<div class="card stat">' + icon('calendar', 'stat__ico') + '<span class="stat__t">' + esc(t('bt.day.title')) + '</span><span class="stat__name">' + esc(r.days === 1 ? t('bt.day.tomorrow') : tf('bt.day.inN', { n: r.days })) + '</span><span class="stat__sub">' + esc(r.start.toLocaleDateString(locale(), { year: 'numeric', month: 'long', day: 'numeric' })) + '</span></div>';
    var yr = Math.min(Math.floor((r.days - 1) / 365) + 1, (HOSP.yearLevels || [1, 2, 3]).length);
    var m = milestone(r.days);
    return '<div class="card stat' + (m ? ' stat--party' : '') + '">' + icon('calendar', 'stat__ico') + '<span class="stat__t">' + esc(t('bt.day.title')) + '</span><span class="stat__name">' + esc(tf('bt.day.dayN', { n: r.days.toLocaleString() })) + '</span><span class="stat__sub">' + esc(m || tf('bt.day.year', { n: yr })) + '</span></div>';
  }

  /* ---- 1. Birthday-today banner ---- */
  function birthdayBanner(all, today) {
    var bd = all.filter(function (c) { return c.bmonth && daysUntil(c, today) === 0; });
    if (!bd.length) return '';
    var meToday = bd.filter(isMe)[0], rest = bd.filter(function (c) { return !isMe(c); });
    var bits = ''; for (var i = 0; i < 18; i++) bits += '<span style="--i:' + i + '"></span>';
    return '<section class="card bday-today" aria-labelledby="bdt-h"><div class="confetti" aria-hidden="true">' + bits + '</div>' +
      '<p class="today__k">' + icon('cake', 'today__ico') + esc(t('bt.bdt.kicker')) + '</p>' +
      '<h2 id="bdt-h">' + esc(meToday && !rest.length ? t('bt.bdt.you') : tf('bt.bdt.title', { names: rest.map(short).join(' & ') })) + '</h2>' +
      (meToday && rest.length ? '<p>' + esc(t('bt.bdt.youToo')) + '</p>' : '') + (meToday ? wallBits(meToday, today) : '') +
      '<div class="bday-today__people">' + rest.map(function (c) {
        return '<div class="bday-today__p"><a href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c) + '</a><div><strong>' + esc(c.name) + '</strong>' + (c.byear ? '<span class="muted">' + esc(tf('bt.person.turns', { n: ageOn(c, today.getFullYear()) })) + '</span>' : '') +
          '<p class="today__acts"><button type="button" class="btn btn--solid" data-greet="' + esc(c.id) + '">' + esc(t('bt.bdt.greet')) + '</button></p>' + wishBits(c) + wallBits(c, today) + '</div></div>';
      }).join('') + '</div><p class="form__status" id="greet-status" role="status"></p></section>';
  }
  function wishBits(c) {
    var w = listOf(c, 'wishlist'); if (!w.length) return '';
    return '<div class="bday-today__wish"><span class="today__fk">' + esc(listLabel('wishlist')) + '</span><ul class="plain">' + w.slice(0, 3).map(function (x) { var h = listHref(LIST_BY.wishlist, x); return '<li>' + (h ? '<a href="' + esc(h) + '" target="_blank" rel="noopener">' + esc(x.title) + '</a>' : esc(x.title)) + '</li>'; }).join('') + '</ul>' + (w.length > 3 ? '<a href="#/person/' + encodeURIComponent(c.id) + '">' + esc(tf('bt.l.seeAll', { n: w.length })) + '</a>' : '') + '</div>';
  }
  function greetText(c) { var bn = batchName(); return tf(bn ? 'bt.bdt.msgBatch' : 'bt.bdt.msg', { name: short(c), batch: bn }); }
  function greet(c, st) {
    var text = greetText(c); award('greeter');
    if (navigator.share) { navigator.share({ text: text }).then(function () { st.textContent = t('bt.share.shared'); }).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { st.textContent = t('bt.bdt.copied'); }, function () { st.textContent = text; });
    else st.textContent = text;
  }

  /* ---- 5. Weekly spotlight ---- */
  function spotlightHTML(all, today) {
    if (all.length < 2) return '';
    var wk = weekNum(today), c = all[dayHash(wk, 3) % all.length];
    var keys = shuffled((window.GUESS_FIELDS || []).filter(function (k) { return filled(c, k) && k !== 'hometown'; }), mulberry(dayHash(wk, 4))).slice(0, 3);
    return '<section class="card today" aria-labelledby="today-sp-h"><p class="today__k">' + icon('spark', 'today__ico') + '<span id="today-sp-h">' + esc(t('bt.spot.h')) + '</span></p>' +
      '<div class="today__pl"><a href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c) + '</a><div><h3>' + esc(c.name) + '</h3>' + (c.hometown ? '<p class="muted">' + esc(c.hometown) + '</p>' : '') + '</div></div>' +
      (keys.length ? '<ul class="today__facts">' + keys.map(function (k) { return '<li><span class="today__fk">' + esc(fieldLabel(k)) + '</span><span class="today__a">' + esc(clip(c[k], 120)) + '</span></li>'; }).join('') + '</ul>' : '') +
      '<p class="today__acts"><a class="btn" href="#/person/' + encodeURIComponent(c.id) + '">' + esc(t('bt.spot.open')) + '</a></p></section>';
  }

  /* ---- 2. Who said it? ---- */
  var ws = { k: '', order: [], i: 0, right: 0, answered: false, pick: '' };
  function wsFields(all) { var need = Math.min(2, all.length); return (window.GUESS_FIELDS || []).filter(function (k) { return all.filter(function (c) { return filled(c, k); }).length >= need; }); }
  function wsStart(k) {
    var all = people();
    ws = { k: k, order: shuffled(all.filter(function (c) { return filled(c, k); })).map(function (c) { return c.id; }), i: 0, right: 0, answered: false, pick: '', opts: null, marks: [] };
  }
  function wsOpts(c, all) { return shuffled([c].concat(shuffled(all.filter(function (x) { return x.id !== c.id; })).slice(0, 3))); }
  VIEWS.whosaid = function (k) {
    var all = people(), fields = wsFields(all);
    var head = '<div class="wrap page guess">' + crumb(t('nav.whosaid')) + '<header class="page__head"><h1>' + esc(t('nav.whosaid')) + '</h1><p>' + esc(t('bt.ws.intro')) + '</p></header>';
    if (all.length < 2 || !fields.length) return head + '<div class="empty"><p>' + esc(t('bt.ws.notEnough')) + '</p></div></div>';
    if (!k || fields.indexOf(k) < 0) k = (todaysPicks(all, new Date()).fk && fields.indexOf(todaysPicks(all, new Date()).fk) >= 0) ? todaysPicks(all, new Date()).fk : fields[0];
    if (ws.k !== k || !ws.order.length) wsStart(k);
    var sel = '<label class="field field--inline"><span class="field__l">' + esc(t('bt.ws.topic')) + '</span><select id="ws-k">' + fields.map(function (f) { return '<option value="' + esc(f) + '"' + (f === k ? ' selected' : '') + '>' + esc(fieldLabel(f)) + '</option>'; }).join('') + '</select></label>';
    var body;
    if (ws.i >= ws.order.length) {
      setResult(t('nav.whosaid') + ' · ' + fieldLabel(k), ws.right, ws.order.length, ws.marks || []);
      body = '<div class="card guess__card"><h2 style="margin-top:0">' + esc(tf('bt.guess.roundDone', { right: ws.right, n: ws.order.length })) + '</h2>' + resultBlock() + '<p class="guess__acts"><button type="button" class="btn btn--solid" id="ws-again">' + esc(t('bt.guess.playAgain')) + '</button><button type="button" class="btn" id="ws-other">' + esc(t('bt.ws.other')) + '</button></p></div>';
    } else {
      var c = findPerson(ws.order[ws.i]);
      if (!c) { ws.i++; return VIEWS.whosaid(k); }
      if (!ws.opts || ws.opts.id !== c.id) ws.opts = { id: c.id, list: wsOpts(c, all).map(function (x) { return { id: x.id, label: x.name }; }) };
      body = '<div class="card guess__card"><p class="muted guess__score">' + esc(tf('bt.guess.roundOf', { i: ws.i + 1, n: ws.order.length })) + ' · ' + esc(tf('bt.guess.score', { right: ws.right, total: ws.i })) + '</p>' +
        '<p class="guess__ask">' + esc(tf('bt.ws.ask', { field: fieldLabel(k).toLowerCase() })) + '</p><blockquote class="guess__clue">' + esc(c[k]).replace(/\n/g, '<br>') + '</blockquote>' +
        '<div class="guess__opts">' + ws.opts.list.map(function (o) { return '<button type="button" class="btn guess__opt" data-wsid="' + esc(o.id) + '">' + esc(o.label) + '</button>'; }).join('') + '</div>' +
        '<p class="form__status" id="ws-status" role="status" aria-live="polite"></p><p class="guess__acts" id="ws-acts" hidden><button type="button" class="btn btn--solid" id="ws-next">' + esc(t('bt.guess.next')) + '</button> <a class="btn" href="#/person/' + encodeURIComponent(c.id) + '">' + esc(t('bt.guess.open')) + '</a></p></div>';
    }
    return head + sel + body + '</div>';
  };
  AFTER.whosaid = function () {
    var s = document.getElementById('ws-k');
    if (s) s.addEventListener('change', function () { ws.k = ''; location.hash = '#/whosaid/' + encodeURIComponent(s.value); });
    var again = document.getElementById('ws-again'); if (again) again.addEventListener('click', function () { wsStart(ws.k); route({ keepScroll: true }); });
    var other = document.getElementById('ws-other'); if (other) other.addEventListener('click', function () {
      var f = wsFields(people()).filter(function (x) { return x !== ws.k; }); if (!f.length) return;
      ws.k = ''; location.hash = '#/whosaid/' + encodeURIComponent(f[Math.floor(Math.random() * f.length)]);
    });
    var opts = document.querySelectorAll('[data-wsid]'), answer = ws.order[ws.i];
    for (var i = 0; i < opts.length; i++) opts[i].addEventListener('click', function (e) {
      if (ws.answered) return; ws.answered = true;
      var ok = e.currentTarget.getAttribute('data-wsid') === answer; if (ok) ws.right++; (ws.marks = ws.marks || []).push(ok);
      if (ws.i === ws.order.length - 1 && ws.right === ws.order.length && ws.order.length >= 4) award('whosaid');
      for (var j = 0; j < opts.length; j++) { opts[j].disabled = true; if (opts[j].getAttribute('data-wsid') === answer) opts[j].classList.add('is-right'); }
      if (!ok) e.currentTarget.classList.add('is-wrong');
      var c = findPerson(answer);
      document.getElementById('ws-status').textContent = ok ? t('bt.guess.right') : tf('bt.guess.wrong', { name: c ? c.name : '' });
      document.getElementById('ws-acts').hidden = false;
      document.getElementById('ws-next').focus({ preventScroll: true });
    });
    var nx = document.getElementById('ws-next'); if (nx) nx.addEventListener('click', function () { ws.i++; ws.answered = false; route({ keepScroll: true }); });
  };

  /* ---- 3. Batch Bingo ---- */
  var BINGO_FIELDS = ['hometown', 'medSchool', 'languages', 'hobbies', 'shows', 'kdrama', 'movies', 'cartoons', 'anime', 'games', 'music', 'books', 'food', 'snack', 'dessert', 'comfortFood', 'sports', 'pets', 'travelled', 'bucketList', 'boardGames', 'karaoke', 'hiddenTalent', 'colour', 'pokemon', 'milkTea', 'superhero', 'dreamTrip', 'canCook', 'destress', 'animal'];
  function bingoPool(list) {
    var seen = {}, pool = [];
    list.forEach(function (c) {
      BINGO_FIELDS.forEach(function (k) {
        if (!filled(c, k)) return;
        var vals = (COMMON.exact.indexOf(k) >= 0 || k === 'hometown' || k === 'medSchool') ? [String(c[k]).trim()] : items(c[k]);
        vals.forEach(function (v) {
          if (v.length > 34) return;
          var id = k + '|' + v.toLowerCase(); if (seen[id]) return; seen[id] = 1;
          pool.push({ k: k, v: v });
        });
      });
    });
    return pool;
  }
  function bingoWho(sq, list) {
    var v = sq.v.toLowerCase();
    return list.filter(function (c) { return filled(c, sq.k) && (String(c[sq.k]).trim().toLowerCase() === v || items(c[sq.k]).some(function (x) { return x.toLowerCase() === v; })); });
  }
  function newBingo() {
    var list = others().length >= 2 ? others() : people(), pool = bingoPool(list), size = pool.length >= 24 ? 5 : pool.length >= 15 ? 4 : pool.length >= 8 ? 3 : 0;
    if (!size) { store.del('bingo'); return null; }
    var seed = Math.floor(Math.random() * 4294967296), rnd = mulberry(seed);
    // spread squares across people: round-robin over each person's own shuffled squares
    var byField = {}; shuffled(pool, rnd).forEach(function (s) { (byField[s.k] = byField[s.k] || []).push(s); });
    var keys = shuffled(Object.keys(byField), rnd), pick = [], need = size * size - (size % 2 ? 1 : 0);
    while (pick.length < need) { var any = false; keys.forEach(function (k) { if (pick.length < need && byField[k].length) { pick.push(byField[k].shift()); any = true; } }); if (!any) break; }
    pick = shuffled(pick, rnd);
    if (size % 2) pick.splice(Math.floor(size * size / 2), 0, { free: true });
    var b = { size: size, squares: pick, marks: size % 2 ? [Math.floor(size * size / 2)] : [], made: todayISO() };
    store.set('bingo', b); return b;
  }
  function todayISO() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function getBingo() {
    var b = store.get('bingo', null);
    if (!b || !Array.isArray(b.squares) || [3, 4, 5].indexOf(b.size) < 0 || b.squares.length !== b.size * b.size) return null;
    b.squares = b.squares.map(function (s) { return s && s.free ? { free: true } : { k: cleanText(s && s.k, 40), v: cleanText(s && s.v, 60) }; });
    b.marks = (Array.isArray(b.marks) ? b.marks : []).filter(function (i) { return i === +i && i >= 0 && i < b.size * b.size; });
    return b;
  }
  function bingoLines(b) {
    var n = b.size, lines = [], i, j, m = {}; b.marks.forEach(function (x) { m[x] = 1; });
    for (i = 0; i < n; i++) { var r = [], c = []; for (j = 0; j < n; j++) { r.push(i * n + j); c.push(j * n + i); } lines.push(r, c); }
    var d1 = [], d2 = []; for (i = 0; i < n; i++) { d1.push(i * n + i); d2.push(i * n + n - 1 - i); } lines.push(d1, d2);
    return lines.filter(function (l) { return l.every(function (x) { return m[x]; }); });
  }
  function bingoLabel(k) { var l = fieldLabel(k).replace(/^(favourite|favorite|paboritong|paborito)\s+/i, ''); return l.charAt(0).toUpperCase() + l.slice(1); }
  var bingoReveal = false;
  VIEWS.bingo = function () {
    var b = getBingo() || newBingo();
    var head = '<div class="wrap page bingo">' + crumb(t('nav.bingo')) + '<header class="page__head"><h1>' + esc(t('nav.bingo')) + '</h1><p>' + esc(t('bt.bingo.intro')) + '</p></header>';
    if (!b) return head + '<div class="empty"><p>' + esc(t('bt.bingo.notEnough')) + '</p></div></div>';
    var list = people(), won = bingoLines(b), inWin = {}; won.forEach(function (l) { l.forEach(function (x) { inWin[x] = 1; }); });
    if (won.length) setTimeout(function () { award('bingo'); }, 0);
    return head + (won.length ? '<p class="bingo__win" role="status">' + esc(won.length === 1 ? t('bt.bingo.win') : tf('bt.bingo.winN', { n: won.length })) + '</p>' + (bingoShare(b) ? resultBlock().replace('res__line', 'res__line res__line--hide') : '') : '') +
      '<div class="bingo__grid bingo__grid--' + b.size + '" role="grid">' + b.squares.map(function (s, i) {
        var on = b.marks.indexOf(i) >= 0;
        if (s.free) return '<div class="bingo__sq is-free is-on' + (inWin[i] ? ' is-win' : '') + '" role="gridcell"><span class="bingo__v">' + esc(t('bt.bingo.free')) + '</span></div>';
        var wl = bingoReveal ? bingoWho(s, list).map(short) : [], who = wl.length > 2 ? wl.slice(0, 2).join(', ') + ' +' + (wl.length - 2) : wl.join(', ');
        return '<button type="button" class="bingo__sq' + (on ? ' is-on' : '') + (inWin[i] ? ' is-win' : '') + '" role="gridcell" aria-pressed="' + on + '" data-sq="' + i + '"><span class="bingo__k">' + esc(bingoLabel(s.k)) + '</span><span class="bingo__v">' + esc(s.v) + '</span>' + (who ? '<span class="bingo__who">' + esc(who) + '</span>' : '') + '</button>';
      }).join('') + '</div>' +
      '<p class="guess__acts"><button type="button" class="btn" id="bingo-reveal" aria-pressed="' + bingoReveal + '">' + esc(t(bingoReveal ? 'bt.bingo.hide' : 'bt.bingo.reveal')) + '</button><button type="button" class="btn" id="bingo-new">' + esc(t('bt.bingo.new')) + '</button></p>' +
      '<p class="muted">' + esc(t('bt.bingo.how')) + '</p></div>';
  };
  AFTER.bingo = function () {
    main.querySelectorAll('[data-sq]').forEach(function (el) {
      el.addEventListener('click', function () {
        var b = getBingo(); if (!b) return; var i = +el.getAttribute('data-sq'), at = b.marks.indexOf(i);
        if (at >= 0) b.marks.splice(at, 1); else b.marks.push(i);
        store.set('bingo', b); route({ keepScroll: true });
        var again = main.querySelector('[data-sq="' + i + '"]'); if (again) again.focus({ preventScroll: true });
      });
    });
    var r = document.getElementById('bingo-reveal'); if (r) r.addEventListener('click', function () { bingoReveal = !bingoReveal; route({ keepScroll: true }); });
    var n = document.getElementById('bingo-new'); if (n) n.addEventListener('click', function () { if (!window.confirm(t('bt.bingo.newConfirm'))) return; newBingo(); route({ keepScroll: true }); });
  };

  /* ---- 4. Batch twins ---- */
  function twins(all, max) {
    var pairs = [];
    for (var i = 0; i < all.length; i++) for (var j = i + 1; j < all.length; j++) {
      var hits = inCommon(all[i], all[j]); if (hits.length) pairs.push({ a: all[i], b: all[j], hits: hits });
    }
    return pairs.sort(function (x, y) { return y.hits.length - x.hits.length || byName(x.a, y.a); }).slice(0, max || 5);
  }
  function twinsHTML(all) {
    var tw = twins(all, 5);
    return '<h2>' + esc(t('bt.twins.h')) + '</h2><p class="muted">' + esc(t('bt.twins.intro')) + '</p>' + (tw.length ? '<div class="twins">' + tw.map(function (p, i) {
      return '<div class="card twin"><div class="twin__pair">' + avatar(p.a, 'avatar--sm') + avatar(p.b, 'avatar--sm') + '<div><strong>' + personLink(p.a) + ' &amp; ' + personLink(p.b) + '</strong><span class="muted">' + esc(tf(p.hits.length === 1 ? 'bt.twins.n1' : 'bt.twins.nN', { n: p.hits.length })) + (i === 0 ? ' · ' + esc(t('bt.twins.top')) : '') + '</span></div></div>' +
        '<ul class="twin__hits">' + p.hits.slice(0, 4).map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('') + (p.hits.length > 4 ? '<li class="muted">' + esc(tf('bt.twins.more', { n: p.hits.length - 4 })) + '</li>' : '') + '</ul></div>';
    }).join('') + '</div>' : '<div class="card"><p class="muted">' + esc(t('bt.twins.none')) + '</p></div>');
  }

  /* ---- 6. Icebreakers ---- */
  var ice = { mode: 'q', i: -1, deck: [], who: '', cardQ: null, revealed: false };
  function iceList() { var L = window.ICEBREAKERS || { en: [] }; return (L[lang] && L[lang].length === L.en.length) ? L[lang] : L.en; }
  function iceNext() {
    ice.revealed = false;
    if (ice.i >= 0 || ice.cardQ) { if (counter('ice', counter('ice') + 1) >= 10) award('icebreaker'); }
    var o = others();
    if (ice.mode === 'q') {
      if (!ice.deck.length) ice.deck = shuffled(iceList().map(function (x, i) { return i; }));
      ice.i = ice.deck.shift();
      ice.who = o.length ? o[Math.floor(Math.random() * o.length)].id : '';
    } else {
      var pool = [];
      o.forEach(function (c) { (window.GUESS_FIELDS || []).forEach(function (k) { if (filled(c, k)) pool.push({ id: c.id, k: k }); }); });
      ice.cardQ = pool.length ? pool[Math.floor(Math.random() * pool.length)] : null;
    }
  }
  VIEWS.icebreakers = function () {
    if (ice.mode === 'q' ? ice.i < 0 : !ice.cardQ) iceNext();
    var modes = '<div class="filters" role="group">' + [['q', 'bt.ice.modeQ'], ['card', 'bt.ice.modeCard']].map(function (m) { return '<button type="button" class="filter" data-ice="' + m[0] + '" aria-pressed="' + (ice.mode === m[0]) + '">' + esc(t(m[1])) + '</button>'; }).join('') + '</div>';
    var body;
    if (ice.mode === 'q') {
      var who = ice.who && findPerson(ice.who);
      body = '<div class="card guess__card ice"><p class="guess__ask">' + esc(t('bt.ice.ask')) + '</p><blockquote class="guess__clue ice__q">' + esc(iceList()[ice.i] || '') + '</blockquote>' +
        (who ? '<div class="today__pl">' + avatar(who, 'avatar--sm') + '<p>' + esc(tf('bt.ice.askWho', { name: short(who) })) + '</p></div>' : '') +
        '<p class="guess__acts"><button type="button" class="btn btn--solid" id="ice-next">' + esc(t('bt.ice.next')) + '</button>' + (who ? '<button type="button" class="btn" id="ice-who">' + esc(t('bt.ice.otherWho')) + '</button>' : '') + '</p></div>';
    } else if (!ice.cardQ) body = '<div class="empty"><p>' + esc(t('bt.ice.noCards')) + '</p></div>';
    else {
      var c = findPerson(ice.cardQ.id), k = ice.cardQ.k;
      body = '<div class="card guess__card ice"><p class="guess__ask">' + esc(t('bt.ice.ask')) + '</p><div class="today__pl">' + avatar(c) + '<blockquote class="guess__clue ice__q">' + esc(tf('bt.ice.cardQ', { name: short(c), field: fieldLabel(k).toLowerCase() })) + '</blockquote></div>' +
        (ice.revealed ? '<p class="ice__a"><span class="today__fk">' + esc(t('bt.ice.theirCard')) + '</span>' + esc(c[k]).replace(/\n/g, '<br>') + '</p>' : '') +
        '<p class="guess__acts"><button type="button" class="btn btn--solid" id="ice-next">' + esc(t('bt.ice.next')) + '</button>' + (!ice.revealed ? '<button type="button" class="btn" id="ice-reveal">' + esc(t('bt.ice.reveal')) + '</button>' : '') + '<a class="btn" href="#/person/' + encodeURIComponent(c.id) + '">' + esc(t('bt.guess.open')) + '</a></p></div>';
    }
    return '<div class="wrap page guess">' + crumb(t('nav.icebreakers')) + '<header class="page__head"><h1>' + esc(t('nav.icebreakers')) + '</h1><p>' + esc(t('bt.ice.intro')) + '</p></header>' + modes + body + '</div>';
  };
  AFTER.icebreakers = function () {
    main.querySelectorAll('[data-ice]').forEach(function (b) { b.addEventListener('click', function () { ice.mode = b.getAttribute('data-ice'); iceNext(); route({ keepScroll: true }); }); });
    var nx = document.getElementById('ice-next'); if (nx) nx.addEventListener('click', function () { iceNext(); route({ keepScroll: true }); var a = document.getElementById('ice-next'); if (a) a.focus({ preventScroll: true }); });
    var w = document.getElementById('ice-who'); if (w) w.addEventListener('click', function () { var o = others().filter(function (c) { return c.id !== ice.who; }); if (o.length) ice.who = o[Math.floor(Math.random() * o.length)].id; route({ keepScroll: true }); });
    var rv = document.getElementById('ice-reveal'); if (rv) rv.addEventListener('click', function () { ice.revealed = true; route({ keepScroll: true }); });
  };

  /* ---- 7. Hometown map (offline outline + place table in data/places.js) ---- */
  function normPlace(s) { return ' ' + String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\bsta\.?\s/g, 'santa ').replace(/\bsto\.?\s/g, 'santo ').replace(/\bmt\.?\s/g, 'mountain ').replace(/\bgen\.?\s/g, 'general ').replace(/[^a-z0-9ñ]+/g, ' ').replace(/\s+/g, ' ') + ' '; }
  var placeIdx = null;
  function placeIndex() {
    if (placeIdx) return placeIdx;
    placeIdx = (window.PH_PLACES || []).map(function (p) { return { p: p, names: [p.n].concat(p.aka || []).map(normPlace).map(function (s) { return s.trim(); }).filter(Boolean), prov: normPlace(p.p).trim() }; });
    return placeIdx;
  }
  function locate(hometown) {
    var h = normPlace(hometown); if (h.trim().length < 2) return null;
    var best = null, bestScore = -1;
    placeIndex().forEach(function (e) {
      e.names.forEach(function (n) {
        if (h.indexOf(' ' + n + ' ') < 0) return;
        var score = n.length + (e.p.kind === 'province' ? 0 : 100) + (e.prov && e.p.kind !== 'province' && h.indexOf(' ' + e.prov + ' ') >= 0 ? 200 : 0);
        if (score > bestScore) { bestScore = score; best = e.p; }
      });
    });
    return best;
  }
  var mapSel = '', mapMode = 'home';
  VIEWS.map = function (mode) {
    var all = people(), M = window.PH_MAP;
    var hasTravel = all.some(function (c) { return listOf(c, 'travel').length; });
    mode = mode === 'travel' && hasTravel ? 'travel' : 'home';
    if (mode !== mapMode) { mapMode = mode; mapSel = ''; }
    var head = '<div class="wrap page map">' + crumb(t('nav.map')) + '<header class="page__head"><h1>' + esc(t('nav.map')) + '</h1><p>' + esc(t(mode === 'travel' ? 'bt.map.introTravel' : 'bt.map.intro')) + '</p></header>' +
      (hasTravel ? '<div class="filters" role="group"><a class="filter" href="#/map" aria-pressed="' + (mode === 'home') + '">' + esc(t('bt.map.modeHome')) + '</a><a class="filter" href="#/map/travel" aria-pressed="' + (mode === 'travel') + '">' + esc(listLabel('travel')) + '</a></div>' : '');
    if (!M) return head + '<div class="empty"><p>' + esc(t('bt.map.noData')) + '</p></div></div>';
    var spots = {}, off = [], none = [];
    function put(c, text) {
      var p = locate(text); if (!p) { off.push({ c: c, text: text }); return; }
      var key = p.n + '|' + p.p, sp = (spots[key] = spots[key] || { p: p, who: [], label: mode === 'travel' ? text : '' }); if (sp.who.indexOf(c) < 0) sp.who.push(c);
    }
    all.forEach(function (c) {
      if (mode === 'travel') { listOf(c, 'travel').forEach(function (x) { put(c, x.title); }); return; }
      if (!filled(c, 'hometown')) { none.push(c); return; }
      put(c, c.hometown);
    });
    var list = Object.keys(spots).map(function (k) { return spots[k]; }).sort(function (a, b) { return b.who.length - a.who.length || a.p.n.localeCompare(b.p.n); });
    if (mapSel && !spots[mapSel]) mapSel = '';
    var hosp = (window.PH_PLACES || []).filter(function (p) { return p.n === 'Mariveles'; })[0];
    var svg = '<svg class="map__svg" viewBox="0 0 ' + M.w + ' ' + M.h + '" role="img" aria-label="' + esc(t('bt.map.aria')) + '"><path class="map__land" d="' + M.path + '"/>' +
      (hosp ? '<g class="map__hosp" transform="translate(' + hosp.x + ' ' + hosp.y + ')"><path d="M0-9l2.6 5.6 6.1.7-4.5 4.2 1.2 6L0 4.5-5.4 7.5l1.2-6-4.5-4.2 6.1-.7z"/></g>' : '') +
      list.slice().reverse().map(function (s) {
        var key = s.p.n + '|' + s.p.p, r = 7 + Math.sqrt(s.who.length) * 5;
        return '<g class="map__spot' + (mapSel === key ? ' is-sel' : '') + '" tabindex="0" role="button" data-spot="' + esc(key) + '" aria-label="' + esc((s.label || s.p.n) + ': ' + s.who.length) + '"><circle cx="' + s.p.x + '" cy="' + s.p.y + '" r="' + r.toFixed(1) + '"/>' + (s.who.length > 1 ? '<text x="' + s.p.x + '" y="' + s.p.y + '" dy=".35em">' + s.who.length + '</text>' : '') + '</g>';
      }).join('') + '</svg>';
    var listHTML = list.map(function (s) {
      var key = s.p.n + '|' + s.p.p;
      return '<li' + (mapSel === key ? ' class="is-sel"' : '') + ' id="spot-' + esc(key.replace(/[^A-Za-z0-9]/g, '-')) + '"><button type="button" class="link-btn" data-spot="' + esc(key) + '"><strong>' + esc(s.label || s.p.n) + '</strong>' + (s.label && s.label.toLowerCase() !== s.p.n.toLowerCase() ? ' <span class="muted">' + esc(s.p.n + ', ' + s.p.p) + '</span>' : s.p.kind !== 'province' && s.p.p !== s.p.n ? ' <span class="muted">' + esc(s.p.p) + '</span>' : '') + ' · ' + s.who.length + '</button><span class="map__who">' + s.who.map(personLink).join(', ') + '</span></li>';
    }).join('');
    return head + '<div class="map__wrap"><div class="card map__card">' + svg + '<p class="muted map__legend">' + (hosp ? icon('star', 'map__star') + esc(t('bt.map.hosp')) + ' · ' : '') + esc(t(mode === 'travel' ? 'bt.map.tapTravel' : 'bt.map.tap')) + '</p></div>' +
      '<div><h2 style="margin-top:0">' + esc(tf('bt.map.places', { n: list.length })) + '</h2><div class="card"><ul class="plain map__list">' + (listHTML || '<li class="muted">' + esc(t('bt.map.empty')) + '</li>') + '</ul></div>' +
      (off.length ? '<h2>' + esc(t('bt.map.off')) + '</h2><div class="card"><p class="muted">' + esc(t(mode === 'travel' ? 'bt.map.offHintTravel' : 'bt.map.offHint')) + '</p><ul class="plain">' + off.map(function (o) { return '<li>' + personLink(o.c) + ' <span class="muted">· ' + esc(o.text) + '</span></li>'; }).join('') + '</ul></div>' : '') +
      (none.length ? '<p class="muted">' + esc(tf('bt.map.none', { n: none.length })) + '</p>' : '') + '</div></div>' +
      '<p class="muted map__src">' + esc(t('bt.map.src')) + '</p></div>';
  };
  AFTER.map = function () {
    main.querySelectorAll('[data-spot]').forEach(function (el) {
      function pick() { var k = el.getAttribute('data-spot'); mapSel = mapSel === k ? '' : k; route({ keepScroll: true }); var li = mapSel && document.getElementById('spot-' + mapSel.replace(/[^A-Za-z0-9]/g, '-')); if (li && el.tagName.toLowerCase() === 'g') li.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
      el.addEventListener('click', pick);
      el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); } });
    });
  };

  /* ---- 1.13.0 Batch picks: every link list across the batch ---- */
  VIEWS.picks = function (key) {
    var all = people(), today = new Date();
    var have = LISTS.filter(function (L) { return all.some(function (c) { return listOf(c, L.key).length; }); });
    var head = '<div class="wrap page picks">' + crumb(t('nav.picks')) + '<header class="page__head"><h1>' + esc(t('nav.picks')) + '</h1><p>' + esc(t('bt.picks.intro')) + '</p></header>';
    if (!have.length) return head + '<div class="empty"><p>' + esc(t('bt.picks.none')) + '</p><p><a class="btn btn--solid" href="#/me">' + esc(t('nav.me')) + '</a></p></div></div>';
    var L = LIST_BY[key] && have.indexOf(LIST_BY[key]) >= 0 ? LIST_BY[key] : have[0];
    var chips = '<div class="filters picks__chips" role="group">' + have.map(function (x) { return '<a class="filter" href="#/picks/' + x.key + '" aria-pressed="' + (x === L) + '">' + icon(x.icon, 'filter__ico') + esc(t('bt.l.' + x.key + '.short')) + '</a>'; }).join('') + '</div>';
    var body;
    if (L.key === 'wishlist') {
      var ppl = all.filter(function (c) { return listOf(c, 'wishlist').length; }).sort(function (a, b) { return (daysUntil(a, today) === null ? 999 : daysUntil(a, today)) - (daysUntil(b, today) === null ? 999 : daysUntil(b, today)); });
      body = '<p class="muted">' + esc(t('bt.picks.wishIntro')) + '</p><div class="twins">' + ppl.map(function (c) {
        var d = daysUntil(c, today);
        return '<div class="card twin"><div class="twin__pair">' + avatar(c, 'avatar--sm') + '<div style="margin-left:12px"><strong>' + personLink(c) + '</strong>' + (c.bmonth ? '<span class="muted">' + esc(bdayText(c)) + (d === 0 ? ' · ' + t('bt.home.today') : d !== null && d <= 60 ? ' · ' + (d === 1 ? t('bt.home.inDays1') : tf('bt.home.inDaysN', { n: d })) : '') + '</span>' : '') + '</div></div>' +
          '<ol class="nf-list">' + listOf(c, 'wishlist').map(function (x, i) { var h = listHref(L, x); return '<li><span class="nf-list__n">' + (i + 1) + '</span>' + (h ? '<a href="' + esc(h) + '" target="_blank" rel="noopener">' + esc(x.title) + '</a>' : esc(x.title)) + '</li>'; }).join('') + '</ol></div>';
      }).join('') + '</div>';
    } else {
      var m = {}, rows = [];
      all.forEach(function (c) { listOf(c, L.key).forEach(function (x, i) { var k = x.title.toLowerCase(); if (!m[k]) { m[k] = { title: x.title, url: x.url, fans: [] }; rows.push(m[k]); } if (!m[k].url && x.url) m[k].url = x.url; m[k].fans.push({ c: c, rank: i + 1 }); }); });
      rows.forEach(function (r) { r.fans.sort(function (a, b) { return a.rank - b.rank; }); });
      rows.sort(function (a, b) { return b.fans.length - a.fans.length || a.fans[0].rank - b.fans[0].rank || a.title.localeCompare(b.title); });
      body = '<div class="card"><ol class="nf-list picks__list">' + rows.map(function (r, i) {
        var h = listHref(L, r);
        return '<li><span class="nf-list__n">' + (i + 1) + '</span><div><div>' + (h ? '<a href="' + esc(h) + '" target="_blank" rel="noopener">' + esc(r.title) + '</a>' : esc(r.title)) + (r.fans.length > 1 ? ' <span class="badge">' + esc(nPeople(r.fans.length)) + '</span>' : '') + '</div><div class="picks__who">' + r.fans.map(function (f) { return '<a href="#/person/' + encodeURIComponent(f.c.id) + '">' + esc(short(f.c)) + '</a> <span class="muted">#' + f.rank + '</span>'; }).join(' · ') + '</div></div></li>';
      }).join('') + '</ol></div>' + (L.map ? '<p><a class="btn" href="#/map/travel">' + esc(t('bt.picks.onMap')) + '</a></p>' : '');
    }
    return head + chips + '<h2>' + esc(listLabel(L.key)) + '</h2>' + body + '</div>';
  };

  /* ---- 8. Batch Wrapped ---- */
  var wrapI = 0;
  function topOf(all, fn) { var r = countBy(all, fn); return r.length && r[0].n >= 2 ? r[0] : null; }
  function wrappedSlides(all, today) {
    var S = [], bn = batchName() || t('bt.wrap.theBatch'), yr = today.getFullYear();
    var towns = countBy(all, function (c) { return c.hometown ? [c.hometown] : []; }), schools = countBy(all, function (c) { return c.medSchool ? [c.medSchool] : []; }), langs = countBy(all, function (c) { return items(c.languages); });
    S.push({ k: tf('bt.wrap.k0', { year: yr }), big: bn, sub: t('bt.wrap.s0') });
    S.push({ k: t('bt.wrap.k1'), big: String(all.length), sub: t('bt.wrap.s1'), rows: [[towns.length, t('bt.wrap.towns')], [schools.length, t('bt.wrap.schools')], [langs.length, t('bt.wrap.langs')]].filter(function (r) { return r[0]; }).map(function (r) { return r[0] + ' ' + r[1]; }) });
    var mon = countBy(all, function (c) { return c.bmonth ? [monthName(c.bmonth)] : []; });
    if (mon.length) {
      var zs = topOf(all, function (c) { return zodiac(c) ? [zodiac(c)] : []; });
      S.push({ k: t('bt.wrap.k2'), big: mon[0].label, sub: tf(mon[0].n === 1 ? 'bt.wrap.s2one' : 'bt.wrap.s2', { n: mon[0].n }), rows: zs ? [tf('bt.wrap.zodiac', { sign: zs.label, n: zs.n })] : [] });
    }
    var yrs = all.filter(function (c) { return c.byear; }).map(function (c) { return c.byear; });
    if (yrs.length > 1) { var lo = Math.min.apply(null, yrs), hi = Math.max.apply(null, yrs); if (hi > lo) S.push({ k: t('bt.wrap.k3'), big: lo + '–' + hi, sub: tf('bt.wrap.s3', { n: hi - lo + 1 }) }); }
    var favs = [['food', 'bt.wrap.food'], ['shows', 'bt.wrap.shows'], ['music', 'bt.wrap.music'], ['movies', 'bt.wrap.movies'], ['games', 'bt.wrap.games'], ['hobbies', 'bt.wrap.hobbies']].map(function (f) { var top = topOf(all, function (c) { return items(c[f[0]]); }); return top ? tf(f[1], { v: top.label, n: top.n }) : ''; }).filter(Boolean);
    if (favs.length) S.push({ k: t('bt.wrap.k4'), big: t('bt.wrap.b4'), rows: favs });
    if (towns.length && towns[0].n >= 2) S.push({ k: t('bt.wrap.k5'), big: towns[0].label, sub: tf('bt.wrap.s5', { n: towns[0].n }) });
    var tw = twins(all, 1)[0];
    if (tw) S.push({ k: t('bt.twins.h'), big: short(tw.a) + ' & ' + short(tw.b), sub: tf(tw.hits.length === 1 ? 'bt.twins.n1' : 'bt.twins.nN', { n: tw.hits.length }), rows: tw.hits.slice(0, 3), pair: [tw.a, tw.b] });
    var nfTop = topOf(all, function (c) { return c.netflix.map(function (x) { return x.title; }); });
    if (nfTop) S.push({ k: t('bt.wrap.k8'), big: nfTop.label, sub: tf('bt.wrap.s8', { n: nfTop.n }) });
    var pls = 0; all.forEach(function (c) { pls += c.playlists.length; });
    if (pls) S.push({ k: t('bt.wrap.k6'), big: String(pls), sub: t(pls === 1 ? 'bt.wrap.s6one' : 'bt.wrap.s6') });
    var r = residencyDay(today);
    S.push({ k: t('bt.wrap.k7'), big: r && !r.before ? tf('bt.day.dayN', { n: r.days.toLocaleString() }) : bn, sub: t('bt.wrap.s7') });
    return S;
  }
  VIEWS.wrapped = function () {
    var all = people(), today = new Date();
    var head = '<div class="wrap page wrapped-page">' + crumb(t('nav.wrapped')) + '<header class="page__head"><h1>' + esc(t('nav.wrapped')) + '</h1><p>' + esc(t('bt.wrap.intro')) + '</p></header>';
    if (all.length < 2) return head + '<div class="empty"><p>' + esc(t('bt.wrap.notEnough')) + '</p></div></div>';
    var S = wrappedSlides(all, today); if (wrapI >= S.length) wrapI = S.length - 1; if (wrapI < 0) wrapI = 0;
    var s = S[wrapI];
    if (wrapI === S.length - 1) setTimeout(function () { award('wrapped'); }, 0);
    return head + '<section class="wrapped wrapped--' + (wrapI % 4) + '" aria-roledescription="slide" aria-label="' + esc((wrapI + 1) + ' / ' + S.length) + '">' +
      '<div class="wrapped__dots" aria-hidden="true">' + S.map(function (x, i) { return '<span' + (i === wrapI ? ' class="is-on"' : '') + '></span>'; }).join('') + '</div>' +
      '<p class="wrapped__k">' + esc(s.k) + '</p>' + (s.pair ? '<div class="wrapped__pair">' + avatar(s.pair[0], 'avatar--lg') + avatar(s.pair[1], 'avatar--lg') + '</div>' : '') +
      '<p class="wrapped__big">' + esc(s.big) + '</p>' + (s.sub ? '<p class="wrapped__sub">' + esc(s.sub) + '</p>' : '') +
      (s.rows && s.rows.length ? '<ul class="wrapped__rows">' + s.rows.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>' : '') +
      '</section><p class="guess__acts wrapped__nav"><button type="button" class="btn" id="wr-prev"' + (wrapI === 0 ? ' disabled' : '') + '>' + esc(t('bt.wrap.prev')) + '</button><span class="muted">' + (wrapI + 1) + ' / ' + S.length + '</span>' +
      (wrapI < S.length - 1 ? '<button type="button" class="btn btn--solid" id="wr-next">' + esc(t('bt.wrap.next')) + '</button>' : '<button type="button" class="btn btn--solid" id="wr-again">' + esc(t('bt.wrap.again')) + '</button>') + '</p>' +
      '<p class="muted">' + esc(t('bt.wrap.note')) + '</p></div>';
  };
  function wrapGo(d) { wrapI += d; route({ keepScroll: true }); var b = document.getElementById(d < 0 ? 'wr-prev' : 'wr-next') || document.getElementById('wr-again') || document.getElementById('wr-prev'); if (b && !b.disabled) b.focus({ preventScroll: true }); }
  AFTER.wrapped = function () {
    var p = document.getElementById('wr-prev'), n = document.getElementById('wr-next'), a = document.getElementById('wr-again'), sec = main.querySelector('.wrapped');
    if (p) p.addEventListener('click', function () { wrapGo(-1); });
    if (n) n.addEventListener('click', function () { wrapGo(1); });
    if (a) a.addEventListener('click', function () { wrapI = 0; route({ keepScroll: true }); });
    if (sec) {   // swipe left / right on the slide
      var x0 = null;
      sec.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
      sec.addEventListener('touchend', function (e) { if (x0 === null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) { if (dx < 0 && n) wrapGo(1); else if (dx > 0 && p && !p.disabled) wrapGo(-1); } });
    }
  };
  document.addEventListener('keydown', function (e) {
    if (currentKey() !== 'wrapped' || e.altKey || e.metaKey || e.ctrlKey || /input|textarea|select/i.test((e.target && e.target.tagName) || '')) return;
    if (e.key === 'ArrowRight' && document.getElementById('wr-next')) wrapGo(1);
    else if (e.key === 'ArrowLeft' && document.getElementById('wr-prev') && !document.getElementById('wr-prev').disabled) wrapGo(-1);
  });

  /* ===================== 1.14.0 =====================
     Monito-monita draw, badges, batch events, shoutouts, "Ask me about" chips, word of the day.
     Stored keys: monito, badges ({id: ISO date}), seen (person ids opened), events ([{id,title,date,time,place,note,updated}]),
     counters ({guessStreak, ice}). Shoutouts live on the sender's card (card.shoutouts) and travel with it;
     earned badge ids are copied to the owner's card (card.badges) so batchmates see them. */

  /* ---- small toast ---- */
  var toastEl = null, toastT = 0;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('is-on'); clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 3600);
  }

  /* ---- Badges ---- */
  var BADGES = [
    ['started', 'card'], ['openbook', 'book'], ['wholestory', 'star'], ['curator', 'list'], ['polyglot', 'chat'],
    ['collector5', 'users'], ['collector10', 'users'], ['collector20', 'users'], ['meteveryone', 'heart'],
    ['perfectguess', 'quiz'], ['streak10', 'spark'], ['whosaid', 'chat'], ['bingo', 'game'], ['wrapped', 'star'],
    ['icebreaker', 'spark'], ['greeter', 'cake'], ['shoutout', 'heart'], ['planner', 'calendar'], ['monito', 'gift']
  ];
  var BADGE_IDS = BADGES.map(function (b) { return b[0]; });
  function earned() { var e = store.get('badges', {}); return e && typeof e === 'object' && !Array.isArray(e) ? e : {}; }
  function earnedIds() { var e = earned(); return BADGE_IDS.filter(function (id) { return e[id]; }); }
  function counter(k, v) { var c = store.get('counters', {}); if (!c || typeof c !== 'object') c = {}; if (v === undefined) return +c[k] || 0; c[k] = v; store.set('counters', c); return v; }
  function award(id) {
    if (BADGE_IDS.indexOf(id) < 0) return false;
    var e = earned(); if (e[id]) return false;
    e[id] = new Date().toISOString(); store.set('badges', e);
    var me = getMe();
    if (me) { me.badges = earnedIds().concat(me.badges || []).filter(function (v, i, l) { return l.indexOf(v) === i; }); me.updated = new Date().toISOString(); var cl = sanitizeCard(me); if (cl) store.set('me', cl); }
    toast(tf('bt.badge.earned', { name: t('bt.badge.' + id) }));
    return true;
  }
  function checkBadges() {
    var me = getMe(), o = others();
    if (me) {
      award('started');
      var cp = completeness(me), pct = cp.total ? cp.n / cp.total : 0;
      if (pct >= 0.5) award('openbook'); if (pct >= 0.8) award('wholestory');
      if (LISTS.filter(function (L) { return listOf(me, L.key).length; }).length >= 3) award('curator');
      if (filled(me, 'teachWords')) award('polyglot');
      if ((me.shoutouts || []).length) award('shoutout');
    }
    if (o.length >= 5) award('collector5'); if (o.length >= 10) award('collector10'); if (o.length >= 20) award('collector20');
    if (o.length >= 5) { var seen = store.get('seen', []); if (Array.isArray(seen) && o.every(function (c) { return seen.indexOf(c.id) >= 0; })) award('meteveryone'); }
    if (getEvents().length) award('planner');
  }
  function markSeen(id) { var s = store.get('seen', []); if (!Array.isArray(s)) s = []; if (s.indexOf(id) < 0) { s.push(id); store.set('seen', s.slice(-500)); } }
  function badgeChips(ids) { return '<div class="bchips">' + ids.filter(function (id) { return BADGE_IDS.indexOf(id) >= 0; }).map(function (id) { var b = BADGES[BADGE_IDS.indexOf(id)]; return '<span class="bchip" title="' + esc(t('bt.badge.' + id + '.how')) + '">' + icon(b[1], 'bchip__ico') + esc(t('bt.badge.' + id)) + '</span>'; }).join('') + '</div>'; }
  VIEWS.badges = function () {
    checkBadges();
    var e = earned(), n = earnedIds().length;
    return '<div class="wrap page badges-page">' + crumb(t('nav.badges')) + '<header class="page__head"><h1>' + esc(t('nav.badges')) + '</h1><p>' + esc(tf('bt.badge.intro', { n: n, total: BADGES.length })) + '</p></header>' +
      '<div class="meter__bar badges-meter" aria-hidden="true"><span style="width:' + Math.round(n / BADGES.length * 100) + '%"></span></div>' +
      '<div class="badge-grid">' + BADGES.map(function (b) {
        var on = !!e[b[0]];
        return '<div class="card badge-card' + (on ? ' is-on' : '') + '"><span class="badge-card__ico">' + icon(b[1], '') + '</span><div><strong>' + esc(t('bt.badge.' + b[0])) + '</strong><span class="muted">' + esc(t('bt.badge.' + b[0] + '.how')) + '</span>' + (on ? '<span class="badge-card__when">' + esc(tf('bt.badge.on', { date: bkDate(e[b[0]]) })) + '</span>' : '') + '</div></div>';
      }).join('') + '</div><p class="muted">' + esc(t('bt.badge.note')) + '</p></div>';
  };

  /* ---- Ask me about (card field askMe) ---- */
  function askChips(c, cls) { var a = items(c.askMe).slice(0, 3); return a.length ? '<span class="askme' + (cls ? ' ' + cls : '') + '"><span class="askme__k">' + esc(t('bt.ask.k')) + '</span>' + a.map(function (x) { return '<span class="askme__t">' + esc(x) + '</span>'; }).join('') + '</span>' : ''; }

  /* ---- Word of the day (card field teachWords: one per line, "word — meaning") ---- */
  function wordPool(all) {
    var out = [];
    all.forEach(function (c) { String(c.teachWords || '').split(/\n+/).forEach(function (line) { line = line.trim(); if (line.length < 2) return; var m = /^(.+?)\s+[—–-]\s+(.+)$/.exec(line) || /^(.+?)\s*[:=]\s*(.+)$/.exec(line); out.push({ c: c, word: m ? m[1].trim() : line, meaning: m ? m[2].trim() : '' }); }); });
    return out.sort(function (a, b) { return byName(a.c, b.c) || (a.word < b.word ? -1 : a.word > b.word ? 1 : 0); });
  }
  function wordHTML(all, today) {
    var pool = wordPool(all); if (!pool.length) return '';
    var w = pool[(dayHash(dayNum(today), 6) + (pickOff.word || 0)) % pool.length], c = w.c;
    return '<section class="card today" aria-labelledby="today-w-h"><p class="today__k">' + icon('chat', 'today__ico') + '<span id="today-w-h">' + esc(t('bt.word.h')) + '</span></p>' +
      '<p class="word__w">' + esc(w.word) + '</p>' + (w.meaning ? '<p class="word__m">' + esc(w.meaning) + '</p>' : '') +
      '<div class="today__pl"><a href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c, 'avatar--sm') + '</a><p class="muted">' + esc(tf('bt.word.by', { name: short(c) })) + (c.languages ? ' · ' + esc(clip(c.languages, 60)) : '') + '</p></div>' +
      (pool.length > 1 ? '<p class="today__acts"><button type="button" class="btn" data-another="word">' + esc(t('bt.today.another')) + '</button></p>' : '') + '</section>';
  }

  /* ---- Shoutouts (card.shoutouts on the sender's card) ---- */
  function shoutsFor(c) {
    var out = [];
    allCards().forEach(function (from) { (from.shoutouts || []).forEach(function (s, i) { if (s.to === c.id || (s.name && s.name.toLowerCase() === c.name.toLowerCase())) out.push({ from: from, s: s, i: i }); }); });
    return out.sort(function (a, b) { return String(b.s.date).localeCompare(String(a.s.date)); });
  }
  function shoutSection(c) {
    var me = getMe(), mine = me && me.id === c.id, list = shoutsFor(c);
    var h = '<h2 id="shoutouts">' + esc(t(mine ? 'bt.shout.forYou' : 'bt.shout.h')) + '</h2><div class="card shouts">';
    h += list.length ? '<ul class="plain shouts__list">' + list.map(function (x) {
      var own = me && x.from.id === me.id;
      return '<li><div class="shouts__t">' + esc(x.s.text).replace(/\n/g, '<br>') + '</div><div class="muted shouts__by">— ' + (own ? esc(t('bt.shout.you')) : personLink(x.from)) + (x.s.date ? ' · ' + esc(bkDate(x.s.date)) : '') + (own ? ' · <button type="button" class="link-btn" data-unshout="' + x.i + '">' + esc(t('bt.custom.remove')) + '</button>' : '') + '</div></li>';
    }).join('') + '</ul>' : '<p class="muted">' + esc(t(mine ? 'bt.shout.noneYou' : 'bt.shout.none')) + '</p>';
    if (!mine) h += me ? '<form id="shout-form" class="shouts__form"><label class="field"><span class="field__l">' + esc(tf('bt.shout.label', { name: short(c) })) + '</span><textarea name="shout" rows="3" maxlength="280" placeholder="' + esc(t('bt.shout.ph')) + '"></textarea><span class="field__h">' + esc(t('bt.shout.hint')) + '</span></label><p><button type="submit" class="btn btn--solid">' + esc(t('bt.shout.send')) + '</button></p><p class="form__status" id="shout-status" role="status"></p></form>'
      : '<p><a class="btn" href="#/me">' + esc(t('bt.shout.needCard')) + '</a></p>';
    return h + '</div>';
  }
  function wireShouts(c) {
    var f = document.getElementById('shout-form');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      var txt = cleanText(f.shout.value, 280), me = getMe(); if (!txt || !me) return;
      me.shoutouts = (me.shoutouts || []).concat([{ to: c.id, name: c.name, text: txt, date: new Date().toISOString() }]).slice(-30);
      me.updated = new Date().toISOString(); store.set('me', sanitizeCard(me)); award('shoutout');
      route({ keepScroll: true }); var st = document.getElementById('shout-status'); if (st) st.textContent = t('bt.shout.sent');
    });
    main.querySelectorAll('[data-unshout]').forEach(function (b) {
      b.addEventListener('click', function () {
        var me = getMe(); if (!me) return; var i = +b.getAttribute('data-unshout');
        me.shoutouts = (me.shoutouts || []).filter(function (x, k) { return k !== i; }); me.updated = new Date().toISOString(); store.set('me', sanitizeCard(me)); route({ keepScroll: true });
      });
    });
  }
  function shoutHomeHTML() {
    var me = getMe(); if (!me) return '';
    var list = shoutsFor(me).filter(function (x) { return x.from.id !== me.id; }); if (!list.length) return '';
    var x = list[0];
    return '<section class="card today" aria-labelledby="today-sh-h"><p class="today__k">' + icon('heart', 'today__ico') + '<span id="today-sh-h">' + esc(t('bt.shout.homeH')) + '</span></p>' +
      '<blockquote class="shouts__q">' + esc(clip(x.s.text, 220)) + '</blockquote><div class="today__pl"><a href="#/person/' + encodeURIComponent(x.from.id) + '">' + avatar(x.from, 'avatar--sm') + '</a><p class="muted">— ' + esc(x.from.name) + '</p></div>' +
      (list.length > 1 ? '<p class="today__acts"><a class="btn" href="#/person/' + encodeURIComponent(me.id) + '">' + esc(tf('bt.shout.all', { n: list.length })) + '</a></p>' : '') + '</section>';
  }

  /* ---- Batch events ---- */
  function cleanEvent(e) {
    if (!e || typeof e !== 'object') return null;
    var d = cleanText(e.date, 10), tm = cleanText(e.time, 5);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return null;
    var title = cleanText(e.title, 80); if (!title) return null;
    return { id: cleanText(e.id, 40) || newId(), title: title, date: d, time: /^\d{2}:\d{2}$/.test(tm) ? tm : '', place: cleanText(e.place, 120), note: cleanText(e.note, 300), poster: +e.poster > 0 ? +e.poster : 0, updated: cleanText(e.updated, 30) || new Date().toISOString() };
  }
  function storedEvents() { var a = store.get('events', []); return (Array.isArray(a) ? a : []).map(cleanEvent).filter(Boolean).map(function (e) { if (/^monito-/.test(e.id) && e.title === 'Monito-monita exchange') e.title = t('bt.mm.evTitle'); return e; }); }
  function getEvents() {
    var list = storedEvents(), s = startDate();
    if (s && !list.some(function (e) { return e.id === 'residency-start'; })) list.push({ id: 'residency-start', title: t('bt.ev.firstDay'), date: s, time: '', place: HOSP.name || '', note: '', builtin: true });
    deptEvents().forEach(function (e) { if (!list.some(function (x) { return x.id === e.id; })) list.push(e); });
    return list.sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); });
  }
  function deptEvents() {   // data/dept-events.js (PT 1.2.1): built in, read-only, never synced
    var iso = /^\d{4}-\d{2}-\d{2}$/;
    return (Array.isArray(window.DEPT_EVENTS) ? window.DEPT_EVENTS : []).filter(function (e) { return e && e.id && e.title && iso.test(e.date); }).map(function (e) {
      return { id: String(e.id), title: String(e.title), date: e.date, end: iso.test(e.end || '') && e.end > e.date ? e.end : '', time: /^\d{2}:\d{2}$/.test(e.time || '') ? e.time : '', place: String(e.place || ''), note: String(e.note || ''),
        url: /^https:\/\//.test(e.url || '') ? e.url : '', lists: (Array.isArray(e.lists) ? e.lists : []).filter(function (l) { return l && l.title && Array.isArray(l.names) && l.names.length; }),
        poster: /^img\/events\/[\w.-]+\.(jpe?g|png|webp)$/.test(e.poster || '') ? e.poster : '', moderator: String(e.moderator || ''),
        program: (Array.isArray(e.program) ? e.program : []).filter(function (p) { return p && p.title; }).map(function (p) { return { time: String(p.time || ''), title: String(p.title), by: String(p.by || '') }; }), builtin: true, dept: true };
    });
  }
  function evLeft(e, today) { return e.end ? evDays({ date: e.end }, today) : evDays(e, today); }   // days until the LAST day
  function evDays(e, today) { var p = e.date.split('-'); return dayNum(new Date(+p[0], +p[1] - 1, +p[2])) - dayNum(today); }
  function evWhen(e, today) { var d = evDays(e, today); if (d < 0 && e.end && evLeft(e, today) >= 0) return t('pt.ev.now'); return d === 0 ? t('bt.home.today') : d === 1 ? t('bt.ev.tomorrow') : d > 1 ? tf('bt.home.inDaysN', { n: d }) : d === -1 ? t('bt.ev.yesterday') : tf('bt.ev.ago', { n: -d }); }
  function evDate(e) {
    function f(iso) { var p = iso.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]).toLocaleDateString(locale(), { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' }); }
    return f(e.date) + (e.end ? ' – ' + f(e.end) : '') + (e.time ? ' · ' + e.time : '');
  }
  function mergeEvents(incoming) {
    var list = storedEvents(), n = 0;
    (Array.isArray(incoming) ? incoming : []).map(cleanEvent).filter(Boolean).forEach(function (e) {
      if (e.id === 'residency-start') return;
      var i = -1; for (var k = 0; k < list.length; k++) if (list[k].id === e.id) { i = k; break; }
      if (i < 0) { list.push(e); n++; } else if (new Date(e.updated) > new Date(list[i].updated)) { list[i] = e; n++; }
    });
    store.set('events', list); return n;
  }
  function nextEventStat(today) {
    var up = getEvents().filter(function (e) { return evLeft(e, today) >= 0; })[0]; if (!up) return '';
    return '<a class="card stat stat--link" href="#/events">' + icon('calendar', 'stat__ico') + '<span class="stat__t">' + esc(t('bt.ev.next')) + '</span><span class="stat__name">' + esc(up.title) + '</span><span class="stat__sub">' + esc(evWhen(up, today)) + '</span></a>';
  }
  function icsEvents(list) {
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//isaymotion//Psych Tickler//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + icsEscape((batchName() ? batchName() + ' · ' : '') + t('nav.events'))];
    list.forEach(function (e) {
      var d = e.date.replace(/-/g, ''), start, end;
      if (e.time) { start = 'DTSTART:' + d + 'T' + e.time.replace(':', '') + '00'; var hh = (+e.time.slice(0, 2) + 2), dd = d; if (hh > 23) { hh = 23; } end = 'DTEND:' + dd + 'T' + ('0' + hh).slice(-2) + e.time.slice(3) + '00'; }
      else { start = 'DTSTART;VALUE=DATE:' + d; var p = (e.end || e.date).split('-'), nx = new Date(+p[0], +p[1] - 1, +p[2] + 1); end = 'DTEND;VALUE=DATE:' + icsDate(nx.getFullYear(), nx.getMonth() + 1, nx.getDate()); }
      lines.push('BEGIN:VEVENT', 'UID:' + e.id + '-ev@isaymotion.github.io', 'DTSTAMP:' + stamp, start, end, 'SUMMARY:' + icsEscape(e.title));
      if (e.place) lines.push('LOCATION:' + icsEscape(e.place));
      if (e.note || e.url) lines.push('DESCRIPTION:' + icsEscape(e.note + (e.url ? (e.note ? '\n' : '') + e.url : '')));
      if (e.url) lines.push('URL:' + e.url);
      lines.push('END:VEVENT');
    });
    lines.push('END:VCALENDAR'); return lines.join('\r\n') + '\r\n';
  }
  function icsEventsOut(list, name, cb) {
    var ics = icsEvents(list), file = null;
    try { file = new File([ics], name, { type: 'text/calendar' }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: t('nav.events') }).then(function () { cb(tf('bt.cal.saved', { name: name })); }).catch(function () { cb(t('bt.share.cancelled')); }); return; }
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000); cb(tf('bt.cal.saved', { name: name }));
  }
  var evEdit = '';
  function evForm(e) {
    e = e || { title: '', date: '', time: '', place: '', note: '' };
    return '<form id="ev-form" class="card ev-form"><h2 style="margin-top:0">' + esc(t(evEdit ? 'bt.ev.edit' : 'bt.ev.add')) + '</h2>' +
      '<label class="field"><span class="field__l">' + esc(t('bt.ev.title')) + '</span><input name="title" maxlength="80" required value="' + esc(e.title) + '" placeholder="' + esc(t('bt.ev.titlePh')) + '"></label>' +
      '<div class="ev-form__row"><label class="field"><span class="field__l">' + esc(t('bt.ev.date')) + '</span><input type="date" name="date" required value="' + esc(e.date) + '"></label><label class="field"><span class="field__l">' + esc(t('bt.ev.time')) + '</span><input type="time" name="time" value="' + esc(e.time) + '"></label></div>' +
      '<label class="field"><span class="field__l">' + esc(t('bt.ev.place')) + '</span><input name="place" maxlength="120" value="' + esc(e.place) + '"></label>' +
      '<label class="field"><span class="field__l">' + esc(t('bt.ev.note')) + '</span><textarea name="note" rows="2" maxlength="300">' + esc(e.note) + '</textarea></label>' + evPosterField(e) +
      '<p class="guess__acts"><button type="submit" class="btn btn--solid">' + esc(t('bt.ev.save')) + '</button>' + (evEdit ? '<button type="button" class="btn" id="ev-cancel">' + esc(t('bt.ev.cancel')) + '</button>' : '') + '</p><p class="form__status" id="ev-status" role="status"></p></form>';
  }
  VIEWS.events = function () {
    var today = new Date(), all = getEvents(), up = all.filter(function (e) { return evLeft(e, today) >= 0; }), past = all.filter(function (e) { return evLeft(e, today) < 0; }).reverse();
    function row(e) {
      return '<li class="ev"><div class="ev__when"><span class="ev__d">' + esc(evWhen(e, today)) + '</span></div><div class="ev__body"><strong>' + esc(e.title) + '</strong><span class="muted">' + esc(evDate(e)) + (e.place ? ' · ' + esc(e.place) : '') + '</span>' + (e.note ? '<span class="ev__note">' + esc(e.note) + '</span>' : '') + evPosterHTML(e) + evProgHTML(e) +
        (e.lists || []).map(function (l) { return '<details class="ev__list"><summary>' + esc(l.title) + ' <span class="muted">(' + l.names.length + ')</span></summary><ol>' + l.names.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ol></details>'; }).join('') +
        '<span class="ev__acts">' + (e.url ? '<a class="link-btn" href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(t('pt.ev.register')) + '</a>' : '') + '<button type="button" class="link-btn" data-evcal="' + esc(e.id) + '">' + esc(t('bt.cal.one')) + '</button>' + (e.builtin ? '' : '<button type="button" class="link-btn" data-evedit="' + esc(e.id) + '">' + esc(t('bt.ev.editBtn')) + '</button><button type="button" class="link-btn" data-evdel="' + esc(e.id) + '">' + esc(t('bt.custom.remove')) + '</button>') + '</span></div></li>';
    }
    var editing = evEdit ? storedEvents().filter(function (e) { return e.id === evEdit; })[0] : null; if (evEdit && !editing) evEdit = '';
    return '<div class="wrap page events">' + crumb(t('nav.events')) + '<header class="page__head"><h1>' + esc(t('nav.events')) + '</h1><p>' + esc(t('bt.ev.intro')) + '</p></header>' +
      '<div class="ev-layout"><div>' + (up.length ? '<ul class="plain ev-list card">' + up.map(row).join('') + '</ul>' : '<div class="empty"><p>' + esc(t('bt.ev.none')) + '</p></div>') +
      (up.length ? '<p class="guess__acts"><button type="button" class="btn" id="ev-all">' + esc(t('bt.ev.allCal')) + '</button></p>' : '') + '<p class="form__status" id="ev-cal-status" role="status"></p>' +
      (past.length ? '<details class="fgroup"><summary><span>' + esc(t('bt.ev.past')) + '</span><span class="muted fgroup__n">' + past.length + '</span></summary><div class="fgroup__body"><ul class="plain ev-list">' + past.map(row).join('') + '</ul></div></details>' : '') +
      '<p class="muted">' + esc(t('bt.ev.shareHint')) + ' <a href="#/sync">' + esc(t('nav.sync')) + '</a></p></div>' + evForm(editing) + '</div></div>';
  };
  AFTER.events = function () {
    var f = document.getElementById('ev-form'), st = document.getElementById('ev-status'), cst = document.getElementById('ev-cal-status');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var old = evEdit ? storedEvents().filter(function (x) { return x.id === evEdit; })[0] : null;
      var ev = cleanEvent({ id: evEdit || newId(), title: f.title.value, date: f.date.value, time: f.time.value, place: f.place.value, note: f.note.value, poster: old && !evPosterRm ? old.poster : 0, updated: new Date().toISOString() });
      if (!ev) { st.textContent = t('bt.ev.need'); st.classList.add('is-error'); return; }
      var im = evPoster, rm = evPosterRm && old && old.poster, code = evCode();   // (cst is a local name in this function)
      function finish(msg, bad) {
        var list = storedEvents().filter(function (x) { return x.id !== ev.id; }); list.push(ev); store.set('events', list); evEdit = ''; evPoster = null; evPosterRm = false; award('planner');
        if (isSynced()) schedulePush();
        route({ keepScroll: true }); var s2 = document.getElementById('ev-status'); if (s2) { s2.textContent = msg; s2.classList.toggle('is-error', !!bad); }
      }
      if (im && isSynced()) {   // 1.3.0: the poster goes up first, so an event never points at a poster that is not there
        var sb = f.querySelector('[type=submit]'); sb.disabled = true; st.classList.remove('is-error'); st.textContent = t('pt.ev.uploading');
        cloud().then(function (api) { return api.putPoster ? api.putPoster(code, ev.id, im) : Promise.reject(new Error('poster')); })
          .then(function () { ev.poster = Date.now(); posterCache[ev.id] = { stamp: ev.poster, data: im.data }; finish(t('bt.ev.saved')); },
            function (e2) { finish(tf('pt.ev.posterFail', { err: errText(e2) }), true); });
        return;
      }
      if (rm && isSynced()) cloud().then(function (api) { return api.deletePoster && api.deletePoster(code, ev.id); }).catch(function () {});
      finish(t('bt.ev.saved'));
    });
    bindPosterField();
    loadPosters();
    var cancel = document.getElementById('ev-cancel'); if (cancel) cancel.addEventListener('click', function () { evEdit = ''; evPoster = null; evPosterRm = false; route({ keepScroll: true }); });
    main.querySelectorAll('[data-evedit]').forEach(function (b) { b.addEventListener('click', function () { evEdit = b.getAttribute('data-evedit'); evPoster = null; evPosterRm = false; route({ keepScroll: true }); var t1 = document.querySelector('#ev-form [name=title]'); if (t1) { t1.focus(); t1.scrollIntoView({ block: 'center' }); } }); });
    main.querySelectorAll('[data-evdel]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-evdel'), e = storedEvents().filter(function (x) { return x.id === id; })[0]; if (!e || !window.confirm(tf('bt.ev.confirmDel', { title: e.title }))) return; store.set('events', storedEvents().filter(function (x) { return x.id !== id; })); cloudEvDel(e); if (e.poster && isSynced()) cloud().then(function (api) { return api.deletePoster && api.deletePoster(evCode(), id); }).catch(function () {}); delete posterCache[id]; route({ keepScroll: true }); }); });
    main.querySelectorAll('[data-evcal]').forEach(function (b) { b.addEventListener('click', function () { var e = getEvents().filter(function (x) { return x.id === b.getAttribute('data-evcal'); })[0]; if (e) icsEventsOut([e], 'event-' + slug(e.title) + '.ics', function (m) { cst.textContent = m; }); }); });
    var all = document.getElementById('ev-all'); if (all) all.addEventListener('click', function () { var today = new Date(); icsEventsOut(getEvents().filter(function (e) { return evLeft(e, today) >= 0; }), 'batch-events.ics', function (m) { cst.textContent = m; }); });
  };

  /* ---- Kris Kringle draw (was Monito-monita) ---- */
  function getMonito() { var m = store.get('monito', null); return m && Array.isArray(m.pairs) ? m : null; }
  var monitoPeek = {};
  function sattolo(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * i); var x = a[i]; a[i] = a[j]; a[j] = x; } return a; }
  function monitoText(m, giver, recv) {
    var w = recv ? listOf(recv, 'wishlist') : [];
    return tf('bt.mm.msg', { giver: short(giver), receiver: recv ? recv.name : '?', batch: batchName() || t('bt.wrap.theBatch') }) +
      (m.budget ? '\n' + tf('bt.mm.msgBudget', { budget: m.budget }) : '') + (m.date ? '\n' + tf('bt.mm.msgDate', { date: evDate({ date: m.date, time: '' }) }) : '') +
      (w.length ? '\n' + t('bt.mm.msgWish') + '\n' + w.map(function (x, i) { var h = listHref(LIST_BY.wishlist, x); return (i + 1) + '. ' + x.title + (h ? ' — ' + h : ''); }).join('\n') : '') +
      '\n' + t('bt.mm.msgSecret');
  }
  VIEWS.monito = function () {
    var all = people(), m = getMonito();
    var head = '<div class="wrap page monito">' + crumb(t('nav.monito')) + '<header class="page__head"><h1>' + esc(t('nav.monito')) + '</h1><p>' + esc(t('bt.mm.intro')) + '</p></header>';
    if (all.length < 3) return head + '<div class="empty"><p>' + esc(t('bt.mm.notEnough')) + '</p></div></div>';
    if (!m) {
      return head + '<form id="mm-form" class="card"><h2 style="margin-top:0">' + esc(t('bt.mm.who')) + '</h2><div class="mm-people">' + all.map(function (c) { return '<label class="mm-p"><input type="checkbox" name="p" value="' + esc(c.id) + '" checked>' + avatar(c, 'avatar--sm') + '<span>' + esc(c.name) + (isMe(c) ? ' <span class="badge">' + esc(t('bt.batch.you')) + '</span>' : '') + '</span></label>'; }).join('') + '</div>' +
        '<div class="ev-form__row"><label class="field"><span class="field__l">' + esc(t('bt.mm.budget')) + '</span><input name="budget" maxlength="40" placeholder="₱500"></label><label class="field"><span class="field__l">' + esc(t('bt.mm.date')) + '</span><input type="date" name="date"></label></div>' +
        '<label class="mm-ev"><input type="checkbox" name="addEvent" checked> ' + esc(t('bt.mm.addEvent')) + '</label>' +
        '<p class="callout">' + esc(t('bt.mm.warn')) + '</p><p><button type="submit" class="btn btn--solid">' + esc(t('bt.mm.draw')) + '</button></p><p class="form__status is-error" id="mm-status" role="status"></p></form></div>';
    }
    var sent = m.sent || {};
    return head + '<div class="card"><p class="mm-meta">' + esc(tf('bt.mm.drawn', { n: m.pairs.length, date: bkDate(m.made) })) + (m.budget ? ' · ' + esc(tf('bt.mm.budgetIs', { budget: m.budget })) : '') + (m.date ? ' · ' + esc(evDate({ date: m.date, time: '' })) : '') + '</p>' +
      '<p class="muted">' + esc(t('bt.mm.howSend')) + '</p><ul class="plain mm-list">' + m.pairs.map(function (p) {
        var g = findPerson(p[0]), r = findPerson(p[1]), gn = g ? g.name : (m.names && m.names[p[0]]) || '?', rn = r ? r.name : (m.names && m.names[p[1]]) || '?';
        return '<li class="mm-row">' + (g ? avatar(g, 'avatar--sm') : '') + '<div class="mm-row__b"><strong>' + esc(gn) + '</strong><span class="muted">' + (monitoPeek[p[0]] ? '→ ' + esc(rn) : esc(t('bt.mm.hidden'))) + (sent[p[0]] ? ' · ' + esc(t('bt.mm.sent')) : '') + '</span></div>' +
          '<span class="mm-row__a"><button type="button" class="btn btn--solid" data-mmsend="' + esc(p[0]) + '">' + esc(t('bt.mm.send')) + '</button><button type="button" class="link-btn" data-mmpeek="' + esc(p[0]) + '">' + esc(t(monitoPeek[p[0]] ? 'bt.mm.hide' : 'bt.mm.peek')) + '</button></span></li>';
      }).join('') + '</ul><p class="form__status" id="mm-status" role="status"></p>' +
      '<p class="guess__acts"><button type="button" class="btn" id="mm-redraw">' + esc(t('bt.mm.redraw')) + '</button><button type="button" class="btn" id="mm-clear">' + esc(t('bt.mm.clear')) + '</button></p></div></div>';
  };
  AFTER.monito = function () {
    var f = document.getElementById('mm-form'), st = document.getElementById('mm-status');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      var ids = Array.prototype.map.call(f.querySelectorAll('[name=p]:checked'), function (x) { return x.value; });
      if (ids.length < 3) { st.textContent = t('bt.mm.need3'); return; }
      var order = shuffled(ids), recv = sattolo(order), pairs = order.map(function (id, i) { return [id, recv[i]]; }), names = {};
      ids.forEach(function (id) { var c = findPerson(id); if (c) names[id] = c.name; });
      var date = /^\d{4}-\d{2}-\d{2}$/.test(f.date.value) ? f.date.value : '';
      store.set('monito', { made: new Date().toISOString(), budget: cleanText(f.budget.value, 40), date: date, pairs: pairs, names: names, sent: {} });
      if (date && f.addEvent.checked) { var list = storedEvents(); list.push(cleanEvent({ id: 'monito-' + date, title: t('bt.mm.evTitle'), date: date, time: '', place: '', note: f.budget.value ? tf('bt.mm.budgetIs', { budget: cleanText(f.budget.value, 40) }) : '', updated: new Date().toISOString() })); store.set('events', list.filter(function (x, i, a) { return a.map(function (y) { return y.id; }).lastIndexOf(x.id) === i; })); }
      monitoPeek = {}; award('monito'); route({ keepScroll: false });
    });
    main.querySelectorAll('[data-mmpeek]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-mmpeek'); monitoPeek[id] = !monitoPeek[id]; route({ keepScroll: true }); }); });
    main.querySelectorAll('[data-mmsend]').forEach(function (b) {
      b.addEventListener('click', function () {
        var m = getMonito(); if (!m) return; var id = b.getAttribute('data-mmsend'), p = m.pairs.filter(function (x) { return x[0] === id; })[0]; if (!p) return;
        var g = findPerson(p[0]) || { name: m.names[p[0]] || '?' }, r = findPerson(p[1]) || (m.names[p[1]] ? { name: m.names[p[1]], lists: {}, netflix: [] } : null), text = monitoText(m, g, r);
        function done(msg) { m.sent = m.sent || {}; m.sent[id] = 1; store.set('monito', m); route({ keepScroll: true }); var s = document.getElementById('mm-status'); if (s) s.textContent = msg; }
        if (navigator.share) { navigator.share({ text: text }).then(function () { done(tf('bt.mm.sentTo', { name: g.name })); }).catch(function () {}); return; }
        if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { done(tf('bt.mm.copied', { name: g.name })); }, function () { st.textContent = text; });
        else st.textContent = text;
      });
    });
    var rd = document.getElementById('mm-redraw'); if (rd) rd.addEventListener('click', function () { if (!window.confirm(t('bt.mm.redrawConfirm'))) return; store.del('monito'); monitoPeek = {}; route({ keepScroll: false }); });
    var cl = document.getElementById('mm-clear'); if (cl) cl.addEventListener('click', function () { if (!window.confirm(t('bt.mm.clearConfirm'))) return; store.del('monito'); monitoPeek = {}; route({ keepScroll: false }); });
  };

  /* ===================== 1.15.0 =====================
     Two truths and a lie, How well do you know…?, Baby photo guess, shareable emoji results, This or that,
     Batch superlatives, Question of the week, Birthday wall, Time capsule, Trading-card image,
     Where should we eat?, Batch anthem. Content (questions, polls, awards) lives in data/fun.js.
     New card keys (sanitizeFun; kept on My card save): truths {s:[3], lie}, baby (photo), tot {qid:'a'|'b'},
     votes {awardId: personId}, qotw {week: answer}, bwall [{to,name,text,date}] (on the sender's card),
     capsule [{id,text,open,date}] (letters to the batch), anthem {title,url}.
     This phone only: capsuleMine [{id,text,open,date}], quizBest {personId: [right,n]}, counters.lies. */
  var FUN_KEYS = ['truths', 'baby', 'tot', 'votes', 'qotw', 'bwall', 'capsule', 'anthem'];
  var ANTHEM_L = { hosts: ['open.spotify.com', 'spotify.link', 'youtube.com', 'youtu.be', 'music.youtube.com', 'music.apple.com'] };
  function TOT() { return window.THIS_OR_THAT || []; }
  function SUPS() { return window.SUPERLATIVES || []; }
  function QOTWS() { return window.QOTW || []; }
  function loc(o) { return o ? (o[lang] || o.en || '') : ''; }
  function isoDay(v) { v = cleanText(v, 10); return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : ''; }
  function strHash(s) { var h = 2166136261; s = String(s); for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function cleanMsgs(arr, max) { return (Array.isArray(arr) ? arr : []).map(function (x) { return x && typeof x === 'object' ? { to: cleanText(x.to, 40), name: cleanText(x.name, 80), text: cleanText(x.text, 280), date: cleanText(x.date, 30) } : null; }).filter(function (x) { return x && x.text && (x.to || x.name); }).slice(-(max || 30)); }
  function cleanLetters(arr, max) { return (Array.isArray(arr) ? arr : []).map(function (x, i) { return x && typeof x === 'object' ? { id: cleanText(x.id, 40).replace(/[^\w-]/g, '') || 'c' + i, text: cleanText(x.text, 1000), open: isoDay(x.open), date: cleanText(x.date, 30) } : null; }).filter(function (x) { return x && x.text && x.open; }).slice(0, max || 5); }
  function sanitizeFun(c, out) {
    var tr = c.truths;
    if (tr && typeof tr === 'object' && Array.isArray(tr.s)) { var s = tr.s.slice(0, 3).map(function (x) { return cleanText(x, 140); }); if (s.length === 3 && s.every(Boolean)) out.truths = { s: s, lie: +tr.lie === 1 || +tr.lie === 2 ? +tr.lie : 0 }; }
    if (okPhoto(c.baby)) out.baby = c.baby;
    out.tot = {}; var ct = c.tot && typeof c.tot === 'object' ? c.tot : {};
    TOT().forEach(function (q) { if (ct[q.id] === 'a' || ct[q.id] === 'b') out.tot[q.id] = ct[q.id]; });
    out.votes = {}; var cv = c.votes && typeof c.votes === 'object' ? c.votes : {};
    SUPS().forEach(function (a) { var v = cv[a.id]; if (typeof v === 'string' && /^[\w-]{1,40}$/.test(v)) out.votes[a.id] = v; });
    out.qotw = {}; var cq = c.qotw && typeof c.qotw === 'object' ? c.qotw : {};
    Object.keys(cq).filter(function (k) { return /^\d{1,6}$/.test(k) && cleanText(cq[k], 200); }).sort(function (a, b) { return b - a; }).slice(0, 26).forEach(function (k) { out.qotw[k] = cleanText(cq[k], 200); });
    out.bwall = cleanMsgs(c.bwall, 30);
    out.capsule = cleanLetters(c.capsule, 5);
    var an = c.anthem;
    if (an && typeof an === 'object' && cleanText(an.title, 80)) out.anthem = { title: cleanText(an.title, 80), url: listUrl(ANTHEM_L, an.url) };
  }
  function saveMe(mut) {
    var me = getMe(); if (!me) return null;
    mut(me); me.updated = new Date().toISOString();
    var cl = sanitizeCard(me); if (cl) { store.set('me', cl); rebuildIndex(); }
    return cl;
  }
  function needCard() { return '<div class="card fun-need"><p>' + esc(t('bt.fun.needCard')) + '</p><p><a class="btn btn--solid" href="#/me">' + esc(t('nav.me')) + '</a></p></div>'; }
  function pageHead(cls, navKey, introKey) { return '<div class="wrap page ' + cls + '">' + crumb(t(navKey)) + '<header class="page__head"><h1>' + esc(t(navKey)) + '</h1><p>' + esc(t(introKey)) + '</p></header>'; }
  function tabs(base, cur, list) { return '<div class="filters" role="group">' + list.map(function (x) { return '<a class="filter" href="' + base + x[0] + '" aria-pressed="' + (cur === x[0]) + '">' + esc(t(x[1])) + '</a>'; }).join('') + '</div>'; }

  /* ---- 4. Shareable results (emoji line, Wordle style) ---- */
  var lastResult = '';
  function emojiLine(marks) { return marks.map(function (m) { return m ? '🟩' : '🟥'; }).join(''); }
  function setResult(game, right, n, marks) { lastResult = tf('bt.res.text', { game: game, right: right, n: n, batch: batchName() || APP_NAME }) + '\n' + emojiLine(marks); return lastResult; }
  function resultBlock() { return '<div class="res"><p class="res__line" aria-hidden="true">' + esc(lastResult.split('\n').pop()) + '</p><p class="guess__acts"><button type="button" class="btn" data-res>' + icon('share', 'btn__ico') + esc(t('bt.res.share')) + '</button></p><p class="form__status" id="res-status" role="status"></p></div>'; }
  function shareOut(text, st, okMsg) {
    function say(m) { if (st) st.textContent = m; }
    if (navigator.share) { navigator.share({ text: text }).then(function () { say(okMsg || t('bt.share.shared')); }).catch(function () {}); return; }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(function () { say(t('bt.res.copied')); }, function () { say(text); });
    else say(text);
  }
  main.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-res]') : null;
    if (b && lastResult) shareOut(lastResult, document.getElementById('res-status'));
  });
  function bingoShare(b) {
    var n = b.size, rows = [];
    for (var r = 0; r < n; r++) { var line = ''; for (var c = 0; c < n; c++) { var i = r * n + c; line += b.squares[i].free ? '⭐' : b.marks.indexOf(i) >= 0 ? '🟩' : '⬜'; } rows.push(line); }
    lastResult = tf('bt.res.bingo', { batch: batchName() || APP_NAME, n: b.marks.length }) + '\n' + rows.join('\n');
    return lastResult;
  }

  /* ---- generic one-at-a-time game card (used by Two truths, Quiz, Baby photos) ---- */
  function gameCard(st, ask, opts, extra) {
    return '<div class="card guess__card"><p class="muted guess__score">' + esc(tf('bt.guess.roundOf', { i: st.i + 1, n: st.n })) + ' · ' + esc(tf('bt.guess.score', { right: st.right, total: st.i })) + '</p>' + ask +
      '<div class="guess__opts' + (opts.length === 2 ? ' guess__opts--2' : '') + '">' + opts.map(function (o) { return '<button type="button" class="btn guess__opt" data-gopt="' + esc(o.id) + '">' + esc(o.label) + '</button>'; }).join('') + '</div>' +
      '<p class="form__status" id="gm-status" role="status" aria-live="polite"></p><p class="guess__acts" id="gm-acts" hidden><button type="button" class="btn btn--solid" id="gm-next">' + esc(t('bt.guess.next')) + '</button>' + (extra || '') + '</p></div>';
  }
  function wireGame(st, answer, onAnswer, reveal) {
    var opts = main.querySelectorAll('[data-gopt]');
    opts.forEach(function (b) {
      b.addEventListener('click', function () {
        if (st.answered) return; st.answered = true;
        var ok = b.getAttribute('data-gopt') === String(answer); if (ok) st.right++; st.marks.push(ok);
        opts.forEach(function (o) { o.disabled = true; if (o.getAttribute('data-gopt') === String(answer)) o.classList.add('is-right'); });
        if (!ok) b.classList.add('is-wrong');
        document.getElementById('gm-status').textContent = ok ? t('bt.guess.right') : tf('bt.guess.wrong', { name: reveal });
        document.getElementById('gm-acts').hidden = false;
        if (onAnswer) onAnswer(ok);
        document.getElementById('gm-next').focus({ preventScroll: true });
      });
    });
    var nx = document.getElementById('gm-next'); if (nx) nx.addEventListener('click', function () { st.i++; st.answered = false; route({ keepScroll: true }); });
  }
  function doneCard(st, game, againId, more) {
    setResult(game, st.right, st.n, st.marks);
    return '<div class="card guess__card"><h2 style="margin-top:0">' + esc(tf('bt.guess.roundDone', { right: st.right, n: st.n })) + '</h2>' + resultBlock() + '<p class="guess__acts"><button type="button" class="btn btn--solid" id="' + againId + '">' + esc(t('bt.guess.playAgain')) + '</button>' + (more || '') + '</p></div>';
  }

  /* ---- 1. Two truths and a lie ---- */
  var tt = { order: [], i: 0, n: 0, right: 0, marks: [], answered: false, key: '' };
  function ttPool() { return others().filter(function (c) { return c.truths; }); }
  function ttStart() { var p = ttPool(); tt = { order: shuffled(p).map(function (c) { return c.id; }), i: 0, n: p.length, right: 0, marks: [], answered: false, key: p.map(function (c) { return c.id + c.updated; }).sort().join() }; }
  function ttOrder(c) { return shuffled([0, 1, 2], mulberry(strHash(c.id + c.truths.s.join('|')))); }
  function truthsForm(me) {
    var tr = me.truths || { s: ['', '', ''], lie: -1 };
    return '<details class="fgroup card-ish"' + (me.truths ? '' : ' open') + '><summary><span>' + esc(t('bt.tt.mine')) + '</span><span class="muted fgroup__n">' + (me.truths ? '✓' : '') + '</span></summary><div class="fgroup__body"><form id="tt-form" class="tt-form"><p class="field__h">' + esc(t('bt.tt.mineHint')) + '</p>' +
      [0, 1, 2].map(function (i) { return '<div class="tt-row"><label class="field"><span class="field__l">' + esc(tf('bt.tt.stmt', { n: i + 1 })) + '</span><input name="s' + i + '" maxlength="140" value="' + esc(tr.s[i]) + '"></label><label class="tt-lie"><input type="radio" name="lie" value="' + i + '"' + (tr.lie === i ? ' checked' : '') + '> ' + esc(t('bt.tt.isLie')) + '</label></div>'; }).join('') +
      '<p class="guess__acts"><button type="submit" class="btn btn--solid">' + esc(t('bt.me.save')) + '</button>' + (me.truths ? '<button type="button" class="link-btn" id="tt-clear">' + esc(t('bt.custom.remove')) + '</button>' : '') + '</p><p class="form__status" id="tt-status" role="status"></p></form></div></details>';
  }
  VIEWS.truths = function () {
    var me = getMe(), head = pageHead('guess truths', 'nav.truths', 'bt.tt.intro') + (me ? truthsForm(me) : needCard());
    var pool = ttPool();
    if (!pool.length) return head + '<div class="empty"><p>' + esc(t('bt.tt.none')) + '</p></div></div>';
    var key = pool.map(function (c) { return c.id + c.updated; }).sort().join();
    if (!tt.order.length || tt.key !== key) ttStart();
    if (tt.i >= tt.order.length) return head + doneCard(tt, t('nav.truths'), 'tt-again') + '</div>';
    var c = findPerson(tt.order[tt.i]); if (!c || !c.truths) { tt.i++; return VIEWS.truths(); }
    var ask = '<div class="tt-who">' + avatar(c, 'avatar--lg') + '<div><strong>' + esc(c.name) + '</strong><p class="guess__ask">' + esc(t('bt.tt.ask')) + '</p></div></div>';
    return head + gameCard(tt, ask, ttOrder(c).map(function (i) { return { id: i, label: c.truths.s[i] }; }), ' <a class="btn" href="#/person/' + encodeURIComponent(c.id) + '">' + esc(t('bt.guess.open')) + '</a>') + '</div>';
  };
  AFTER.truths = function () {
    var f = document.getElementById('tt-form');
    if (f) f.addEventListener('submit', function (e) {
      e.preventDefault();
      var s = [f.s0.value, f.s1.value, f.s2.value].map(function (x) { return cleanText(x, 140); }), lie = f.querySelector('[name=lie]:checked'), st = document.getElementById('tt-status');
      if (!s.every(Boolean)) { st.textContent = t('bt.tt.need3'); st.classList.add('is-error'); return; }
      if (!lie) { st.textContent = t('bt.tt.needLie'); st.classList.add('is-error'); return; }
      saveMe(function (me) { me.truths = { s: s, lie: +lie.value }; }); route({ keepScroll: true }); toast(t('bt.tt.saved'));
    });
    var clr = document.getElementById('tt-clear'); if (clr) clr.addEventListener('click', function () { saveMe(function (me) { delete me.truths; }); route({ keepScroll: true }); });
    var again = document.getElementById('tt-again'); if (again) again.addEventListener('click', function () { ttStart(); route({ keepScroll: true }); });
    if (tt.i < tt.order.length) {
      var c = findPerson(tt.order[tt.i]);
      if (c && c.truths) wireGame(tt, c.truths.lie, function (ok) { if (ok && counter('lies', counter('lies') + 1) >= 5) award('liedetector'); }, '“' + clip(c.truths.s[c.truths.lie], 80) + '”');
    }
  };

  /* ---- 2. How well do you know ___? ---- */
  var qz = { id: '', qs: [], i: 0, n: 0, right: 0, marks: [], answered: false };
  function quizQs(c) {
    var all = people().filter(function (x) { return x.id !== c.id; }), qs = [];
    GUESS_FIELDS.forEach(function (k) {
      if (!filled(c, k)) return;
      var mine = clip(c[k], 90), seen = {}; seen[mine.toLowerCase()] = 1;
      var wrong = shuffled(all.filter(function (x) { return filled(x, k); }).map(function (x) { return clip(x[k], 90); })).filter(function (v) { var l = v.toLowerCase(); if (seen[l]) return false; seen[l] = 1; return true; }).slice(0, 3);
      if (wrong.length < 2) return;
      qs.push({ ask: tf('bt.quiz.qField', { field: fieldLabel(k), name: short(c) }), opts: shuffled([mine].concat(wrong)), answer: mine });
    });
    if (c.bmonth) { var ms = [c.bmonth]; while (ms.length < 4) { var m = 1 + Math.floor(Math.random() * 12); if (ms.indexOf(m) < 0) ms.push(m); } qs.push({ ask: tf('bt.quiz.qMonth', { name: short(c) }), opts: shuffled(ms).map(monthName), answer: monthName(c.bmonth) }); }
    TOT().forEach(function (q) { var v = c.tot && c.tot[q.id]; if (v) qs.push({ ask: tf('bt.quiz.qTot', { name: short(c) }), opts: [loc(q.a), loc(q.b)], answer: loc(v === 'a' ? q.a : q.b), two: true }); });
    if (c.truths) qs.push({ ask: tf('bt.quiz.qLie', { name: short(c) }), opts: shuffled(c.truths.s.slice()), answer: c.truths.s[c.truths.lie] });
    var tots = shuffled(qs.filter(function (q) { return q.two; })).slice(0, 3);   // at most 3 this-or-that questions per quiz
    return shuffled(qs.filter(function (q) { return !q.two; }).concat(tots)).slice(0, 10);
  }
  function quizCount(c) { return quizQs(c).length; }
  function quizBest() { var b = store.get('quizBest', {}); return b && typeof b === 'object' && !Array.isArray(b) ? b : {}; }
  VIEWS.quiz = function (id) {
    var head = pageHead('guess quiz', 'nav.quiz', 'bt.quiz.intro');
    var c = id ? findPerson(String(id)) : null;
    if (!c) {
      var list = others().map(function (x) { return { c: x, n: quizCount(x) }; }).filter(function (x) { return x.n >= 4; }), best = quizBest();
      if (!list.length) return head + '<div class="empty"><p>' + esc(t('bt.quiz.none')) + '</p></div></div>';
      return head + '<ul class="plain quiz-list">' + list.map(function (x) { var b = best[x.c.id]; return '<li><a class="card quiz-pick" href="#/quiz/' + encodeURIComponent(x.c.id) + '">' + avatar(x.c, 'avatar--sm') + '<span><strong>' + esc(x.c.name) + '</strong><span class="muted">' + esc(tf('bt.quiz.nq', { n: x.n })) + (b ? ' · ' + esc(tf('bt.quiz.best', { right: b[0], n: b[1] })) : '') + '</span></span></a></li>'; }).join('') + '</ul></div>';
    }
    if (qz.id !== c.id || !qz.qs.length) { var qs = quizQs(c); qz = { id: c.id, qs: qs, i: 0, n: qs.length, right: 0, marks: [], answered: false }; }
    var title = '<h2 class="quiz-h">' + avatar(c, 'avatar--sm') + esc(tf('bt.quiz.title', { name: short(c) })) + '</h2>';
    if (qz.n < 4) return head + title + '<div class="empty"><p>' + esc(t('bt.quiz.few')) + '</p></div></div>';
    if (qz.i >= qz.n) {
      var pct = qz.right / qz.n, verdict = t(pct === 1 ? 'bt.quiz.v3' : pct >= 0.7 ? 'bt.quiz.v2' : pct >= 0.4 ? 'bt.quiz.v1' : 'bt.quiz.v0');
      setResult(tf('bt.quiz.title', { name: short(c) }), qz.right, qz.n, qz.marks);
      return head + title + '<div class="card guess__card"><h2 style="margin-top:0">' + esc(tf('bt.guess.roundDone', { right: qz.right, n: qz.n })) + '</h2><p class="quiz-verdict">' + esc(verdict) + '</p>' + resultBlock() +
        '<p class="guess__acts"><button type="button" class="btn btn--solid" id="qz-again">' + esc(t('bt.guess.playAgain')) + '</button><a class="btn" href="#/quiz">' + esc(t('bt.quiz.other')) + '</a><a class="btn" href="#/person/' + encodeURIComponent(c.id) + '">' + esc(t('bt.guess.open')) + '</a></p></div></div>';
    }
    var q = qz.qs[qz.i];
    return head + title + gameCard(qz, '<p class="guess__ask">' + esc(q.ask) + '</p>', q.opts.map(function (o) { return { id: o, label: o }; })) + '</div>';
  };
  AFTER.quiz = function () {
    var again = document.getElementById('qz-again'); if (again) again.addEventListener('click', function () { qz.qs = []; route({ keepScroll: true }); });
    if (qz.i >= qz.n && qz.n >= 4 && !qz.saved) {
      qz.saved = true; var b = quizBest(), old = b[qz.id];
      if (!old || qz.right / qz.n > old[0] / old[1]) { b[qz.id] = [qz.right, qz.n]; store.set('quizBest', b); }
      if (qz.right === qz.n && qz.n >= 5) award('quizmaster');
    }
    if (qz.i < qz.n) { var q = qz.qs[qz.i]; qz.saved = false; wireGame(qz, q.answer, null, q.answer); }
  };

  /* ---- 3. Baby photo guess ---- */
  var bb = { order: [], i: 0, n: 0, right: 0, marks: [], answered: false, opts: null, key: '' };
  function bbPool() { return others().filter(function (c) { return c.baby; }); }
  function bbStart() { var p = bbPool(); bb = { order: shuffled(p).map(function (c) { return c.id; }), i: 0, n: p.length, right: 0, marks: [], answered: false, opts: null, key: p.map(function (c) { return c.id; }).sort().join() }; }
  VIEWS.baby = function () {
    var me = getMe(), head = pageHead('guess baby', 'nav.baby', 'bt.baby.intro');
    var mine = me ? '<details class="fgroup card-ish"' + (me.baby ? '' : ' open') + '><summary><span>' + esc(t('bt.baby.mine')) + '</span><span class="muted fgroup__n">' + (me.baby ? '✓' : '') + '</span></summary><div class="fgroup__body"><div class="form__photo"><div>' + (me.baby ? '<img class="avatar avatar--lg" src="' + esc(me.baby) + '" alt="">' : '<span class="avatar avatar--lg avatar--txt" aria-hidden="true">👶</span>') + '</div><div><p class="field__h">' + esc(t('bt.baby.hint')) + '</p>' +
      '<input type="file" id="baby-photo" class="sr-only" accept="image/*"><label class="btn" for="baby-photo">' + esc(t('bt.me.choosePhoto')) + '</label> ' + (me.baby ? '<button type="button" class="link-btn" id="baby-rm">' + esc(t('bt.me.removePhoto')) + '</button>' : '') + '<p class="form__status" id="baby-status" role="status"></p></div></div></div></details>' : needCard();
    head += mine;
    var pool = bbPool();
    if (pool.length < 2 || people().length < 4) return head + '<div class="empty"><p>' + esc(t('bt.baby.none')) + '</p></div></div>';
    if (!bb.order.length || bb.key !== pool.map(function (c) { return c.id; }).sort().join()) bbStart();
    if (bb.i >= bb.n) return head + doneCard(bb, t('nav.baby'), 'bb-again') + '</div>';
    var c = findPerson(bb.order[bb.i]); if (!c || !c.baby) { bb.i++; return VIEWS.baby(); }
    if (!bb.opts || bb.opts.id !== c.id) bb.opts = { id: c.id, list: shuffled([c].concat(shuffled(people().filter(function (x) { return x.id !== c.id && !isMe(x); })).slice(0, 3))) };
    return head + gameCard(bb, '<p class="guess__ask">' + esc(t('bt.baby.ask')) + '</p><div class="guess__photo"><img class="avatar avatar--xl" src="' + esc(c.baby) + '" alt=""></div>', bb.opts.list.map(function (x) { return { id: x.id, label: x.name }; })) + '</div>';
  };
  AFTER.baby = function () {
    var fi = document.getElementById('baby-photo');
    if (fi) fi.addEventListener('change', function () {
      var f = fi.files && fi.files[0]; fi.value = ''; if (!f) return;
      shrinkPhoto(f, function (data) { if (!data) { document.getElementById('baby-status').textContent = t('bt.me.photoTooBig'); return; } saveMe(function (me) { me.baby = data; }); route({ keepScroll: true }); toast(t('bt.baby.saved')); });
    });
    var rm = document.getElementById('baby-rm'); if (rm) rm.addEventListener('click', function () { saveMe(function (me) { delete me.baby; }); route({ keepScroll: true }); });
    var again = document.getElementById('bb-again'); if (again) again.addEventListener('click', function () { bbStart(); route({ keepScroll: true }); });
    if (bb.i < bb.n) { var c = findPerson(bb.order[bb.i]); if (c) wireGame(bb, c.id, function () { if (bb.i === bb.n - 1 && bb.right === bb.n && bb.n >= 3) award('babyface'); }, c.name); }
  };

  /* ---- 5. This or that ---- */
  function totPicks(c, q) { var v = c.tot && c.tot[q.id]; return v ? loc(v === 'a' ? q.a : q.b) : ''; }
  VIEWS.thisorthat = function (mode) {
    var me = getMe(), qs = TOT(), all = people();
    mode = mode === 'split' || !me ? 'split' : 'mine';
    var head = pageHead('tot-page', 'nav.tot', 'bt.tot.intro') + tabs('#/thisorthat/', mode, [['mine', 'bt.tot.mine'], ['split', 'bt.tot.split']]);
    if (mode === 'mine') {
      var n = qs.filter(function (q) { return me.tot && me.tot[q.id]; }).length;
      return head + '<p class="muted">' + esc(tf('bt.tot.progress', { n: n, total: qs.length })) + '</p><div class="card tot-list">' + qs.map(function (q) {
        var v = me.tot && me.tot[q.id];
        return '<div class="tot-row" role="group" aria-label="' + esc(loc(q.a) + ' / ' + loc(q.b)) + '">' + ['a', 'b'].map(function (k, i) { return (i ? '<span class="tot-or" aria-hidden="true">' + esc(t('bt.tot.or')) + '</span>' : '') + '<button type="button" class="tot-b" data-tot="' + esc(q.id) + '" data-v="' + k + '" aria-pressed="' + (v === k) + '">' + esc(loc(q[k])) + '</button>'; }).join('') + '</div>';
      }).join('') + '</div><p class="guess__acts"><a class="btn btn--solid" href="#/thisorthat/split">' + esc(t('bt.tot.split')) + '</a></p></div>';
    }
    if (!me) head += needCard();
    var rows = qs.map(function (q) {
      var A = all.filter(function (c) { return c.tot && c.tot[q.id] === 'a'; }), B = all.filter(function (c) { return c.tot && c.tot[q.id] === 'b'; }), n = A.length + B.length;
      if (!n) return '';
      var pa = Math.round(100 * A.length / n);
      return '<div class="split"><div class="split__labels"><span>' + esc(loc(q.a)) + ' <b>' + A.length + '</b></span><span><b>' + B.length + '</b> ' + esc(loc(q.b)) + '</span></div>' +
        '<div class="split__bar" aria-hidden="true"><span style="width:' + pa + '%"></span></div>' +
        '<div class="split__who muted"><span>' + esc(A.map(short).join(', ')) + '</span><span>' + esc(B.map(short).join(', ')) + '</span></div></div>';
    }).join('');
    var twins = '';
    if (me) {
      var sc = others().map(function (c) { var same = 0, both = 0; qs.forEach(function (q) { var a = me.tot && me.tot[q.id], b = c.tot && c.tot[q.id]; if (a && b) { both++; if (a === b) same++; } }); return { c: c, same: same, both: both }; }).filter(function (x) { return x.both >= 3; }).sort(function (x, y) { return y.same / y.both - x.same / x.both || y.both - x.both; }).slice(0, 3);
      if (sc.length) twins = '<h2>' + esc(t('bt.tot.twins')) + '</h2><ul class="plain card tot-twins">' + sc.map(function (x) { return '<li><a href="#/person/' + encodeURIComponent(x.c.id) + '">' + avatar(x.c, 'avatar--sm') + '<span><strong>' + esc(x.c.name) + '</strong><span class="muted">' + esc(tf('bt.tot.same', { same: x.same, both: x.both })) + '</span></span></a></li>'; }).join('') + '</ul>';
    }
    return head + twins + '<h2>' + esc(t('bt.tot.split')) + '</h2>' + (rows ? '<div class="card splits">' + rows + '</div>' : '<div class="empty"><p>' + esc(t('bt.tot.none')) + '</p></div>') + '</div>';
  };
  AFTER.thisorthat = function () {
    main.querySelectorAll('[data-tot]').forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-tot'), v = b.getAttribute('data-v');
        saveMe(function (me) { me.tot = me.tot || {}; if (me.tot[id] === v) delete me.tot[id]; else me.tot[id] = v; });
        route({ keepScroll: true }); var nb = main.querySelector('[data-tot="' + id + '"][data-v="' + v + '"]'); if (nb) nb.focus({ preventScroll: true });
      });
    });
  };

  /* ---- 6. Batch superlatives ---- */
  function supTally(a) {
    var votes = {}, ids = {}; people().forEach(function (c) { ids[c.id] = c; });
    people().forEach(function (v) { var to = v.votes && v.votes[a.id]; if (to && ids[to] && to !== v.id) votes[to] = (votes[to] || 0) + 1; });
    return Object.keys(votes).map(function (id) { return { c: ids[id], n: votes[id] }; }).sort(function (x, y) { return y.n - x.n || byName(x.c, y.c); });
  }
  VIEWS.superlatives = function (mode) {
    var me = getMe(), sups = SUPS(), opts = others();
    mode = mode === 'results' || !me ? 'results' : 'vote';
    var head = pageHead('sup-page', 'nav.sup', 'bt.sup.intro') + tabs('#/superlatives/', mode, [['vote', 'bt.sup.vote'], ['results', 'bt.sup.results']]);
    if (mode === 'vote') {
      if (!opts.length) return head + '<div class="empty"><p>' + esc(t('bt.sup.noOthers')) + '</p></div></div>';
      var n = sups.filter(function (a) { return me.votes && me.votes[a.id]; }).length;
      return head + '<p class="muted">' + esc(tf('bt.sup.progress', { n: n, total: sups.length })) + '</p><div class="card sup-list">' + sups.map(function (a) {
        var v = me.votes && me.votes[a.id];
        return '<label class="field sup-row"><span class="field__l">🏆 ' + esc(loc(a)) + '</span><select data-sup="' + esc(a.id) + '"><option value="">' + esc(t('bt.sup.pick')) + '</option>' + opts.map(function (c) { return '<option value="' + esc(c.id) + '"' + (v === c.id ? ' selected' : '') + '>' + esc(c.name) + '</option>'; }).join('') + '</select></label>';
      }).join('') + '</div><p class="muted">' + esc(t('bt.sup.note')) + '</p></div>';
    }
    if (!me) head += needCard();
    var res = sups.map(function (a) {
      var tl = supTally(a); if (!tl.length) return '';
      var top = tl[0].n, lead = tl.filter(function (x) { return x.n === top; }), rest = tl.filter(function (x) { return x.n < top; }).slice(0, 3);
      return '<div class="card sup-res"><p class="sup-res__k">🏆 ' + esc(loc(a)) + '</p><div class="sup-res__lead">' + lead.map(function (x) { return '<a href="#/person/' + encodeURIComponent(x.c.id) + '">' + avatar(x.c) + '<span><strong>' + esc(x.c.name) + '</strong><span class="muted">' + esc(tf(x.n === 1 ? 'bt.sup.votes1' : 'bt.sup.votesN', { n: x.n })) + '</span></span></a>'; }).join('') + '</div>' +
        (rest.length ? '<p class="muted sup-res__rest">' + esc(t('bt.sup.also')) + ' ' + esc(rest.map(function (x) { return short(x.c) + ' (' + x.n + ')'; }).join(', ')) + '</p>' : '') + '</div>';
    }).join('');
    return head + (res ? '<div class="sup-grid">' + res + '</div>' : '<div class="empty"><p>' + esc(t('bt.sup.none')) + '</p></div>') + '<p class="muted">' + esc(t('bt.sup.note')) + '</p></div>';
  };
  AFTER.superlatives = function () {
    main.querySelectorAll('[data-sup]').forEach(function (s) {
      s.addEventListener('change', function () { var id = s.getAttribute('data-sup'), v = s.value; saveMe(function (me) { me.votes = me.votes || {}; if (v) me.votes[id] = v; else delete me.votes[id]; }); route({ keepScroll: true }); var ns = main.querySelector('[data-sup="' + id + '"]'); if (ns) ns.focus({ preventScroll: true }); });
    });
  };

  /* ---- 7. Question of the week ---- */
  function qotwQ(wk) { var q = QOTWS(); return q.length ? loc(q[((wk % q.length) + q.length) % q.length]) : ''; }
  function qotwAnswers(wk) { return people().filter(function (c) { return c.qotw && c.qotw[wk]; }).map(function (c) { return { c: c, a: c.qotw[wk] }; }); }
  var qotwEdit = false;
  function qotwBlock(wk, compact) {
    var me = getMe(), mine = me && me.qotw && me.qotw[wk], ans = qotwAnswers(wk).filter(function (x) { return !me || x.c.id !== me.id; });
    var form = me && (!mine || qotwEdit) ? '<form class="qotw-form" id="qotw-form" data-wk="' + wk + '"><label class="field"><span class="sr-only">' + esc(t('bt.qotw.yours')) + '</span><input name="a" maxlength="200" value="' + esc(mine || '') + '" placeholder="' + esc(t('bt.qotw.ph')) + '"></label><button type="submit" class="btn btn--solid">' + esc(t('bt.qotw.post')) + '</button></form>'
      : mine ? '<p class="qotw-mine"><span class="today__fk">' + esc(t('bt.qotw.yours')) + '</span> ' + esc(mine) + ' <button type="button" class="link-btn" id="qotw-edit">' + esc(t('bt.ev.editBtn')) + '</button></p>' : '';
    var list = ans.length ? '<ul class="today__list">' + (compact ? ans.slice(0, 4) : ans).map(function (x) { return '<li><a href="#/person/' + encodeURIComponent(x.c.id) + '">' + avatar(x.c, 'avatar--sm') + '<span><strong>' + esc(short(x.c)) + '</strong><span class="today__a">' + esc(clip(x.a, 140)) + '</span></span></a></li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(t(me ? 'bt.qotw.first' : 'bt.qotw.noneYet')) + '</p>';
    return '<h3 class="qotw-q">' + esc(qotwQ(wk)) + '</h3>' + form + list + (compact && ans.length > 4 ? '<p class="muted">' + esc(tf('bt.qotw.more', { n: ans.length - 4 })) + '</p>' : '');
  }
  function qotwHomeHTML(all, today) {
    if (!all.length || !QOTWS().length) return '';
    return '<section class="card today" aria-labelledby="today-q-h"><p class="today__k">' + icon('chat', 'today__ico') + '<span id="today-q-h">' + esc(t('nav.qotw')) + '</span></p>' + qotwBlock(weekNum(today), true) +
      '<p class="today__acts"><a class="btn" href="#/qotw">' + esc(t('bt.qotw.all')) + '</a></p></section>';
  }
  VIEWS.qotw = function () {
    var wk = weekNum(new Date()), weeks = {};
    people().forEach(function (c) { Object.keys(c.qotw || {}).forEach(function (k) { if (+k < wk) weeks[k] = 1; }); });
    var past = Object.keys(weeks).sort(function (a, b) { return b - a; });
    return pageHead('qotw-page', 'nav.qotw', 'bt.qotw.intro') + (getMe() ? '' : needCard()) + '<div class="card qotw-now"><p class="today__k">' + esc(t('bt.qotw.thisWeek')) + '</p>' + qotwBlock(wk, false) + '</div>' +
      (past.length ? '<h2>' + esc(t('bt.qotw.past')) + '</h2>' + past.map(function (k) { var a = qotwAnswers(k); return '<details class="fgroup"><summary><span>' + esc(qotwQ(+k)) + '</span><span class="muted fgroup__n">' + a.length + '</span></summary><div class="fgroup__body"><ul class="today__list">' + a.map(function (x) { return '<li><a href="#/person/' + encodeURIComponent(x.c.id) + '">' + avatar(x.c, 'avatar--sm') + '<span><strong>' + esc(short(x.c)) + '</strong><span class="today__a">' + esc(x.a) + '</span></span></a></li>'; }).join('') + '</ul></div></details>'; }).join('') : '') + '</div>';
  };
  function wireQotw() {
    var f = document.getElementById('qotw-form');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); var a = cleanText(f.a.value, 200), wk = f.getAttribute('data-wk'); saveMe(function (me) { me.qotw = me.qotw || {}; if (a) me.qotw[wk] = a; else delete me.qotw[wk]; }); qotwEdit = false; route({ keepScroll: true }); if (a) toast(t('bt.qotw.posted')); });
    var ed = document.getElementById('qotw-edit'); if (ed) ed.addEventListener('click', function () { qotwEdit = true; route({ keepScroll: true }); var i = document.querySelector('#qotw-form input'); if (i) i.focus(); });
  }
  AFTER.qotw = wireQotw;

  /* ---- 8. Birthday wall (card.bwall on the sender's card; the birthday person sees them on the day) ---- */
  function lastBirthday(c, today) {   // most recent occurrence on or before today (Date at local midnight)
    var d = daysUntil(c, today); if (d === null) return null;
    var t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d === 0) return t0;
    var y = today.getFullYear(), day = function (yy) { return new Date(yy, c.bmonth - 1, c.bmonth === 2 && c.bday === 29 && !isLeap(yy) ? 28 : c.bday); };
    var cand = day(y); return cand <= t0 ? cand : day(y - 1);
  }
  function wallFor(c) {
    var out = [];
    allCards().forEach(function (from) { (from.bwall || []).forEach(function (s, i) { if (s.to === c.id || (s.name && s.name.toLowerCase() === c.name.toLowerCase())) out.push({ from: from, s: s, i: i }); }); });
    return out.sort(function (a, b) { return String(a.s.date).localeCompare(String(b.s.date)); });
  }
  function wallOpen(c, x, today) { var lb = lastBirthday(c, today); return !!lb && new Date(x.s.date) < new Date(lb.getTime() + 864e5); }
  function wallList(list, me) {
    return '<ul class="plain shouts__list">' + list.map(function (x) {
      var own = me && x.from.id === me.id;
      return '<li><div class="shouts__t">' + esc(x.s.text).replace(/\n/g, '<br>') + '</div><div class="muted shouts__by">— ' + (own ? esc(t('bt.shout.you')) : personLink(x.from)) + (own ? ' · <button type="button" class="link-btn" data-unwall="' + x.i + '">' + esc(t('bt.custom.remove')) + '</button>' : '') + '</div></li>';
    }).join('') + '</ul>';
  }
  function wallSection(c) {
    if (!c.bmonth) return '';
    var me = getMe(), mine = me && me.id === c.id, today = new Date(), list = wallFor(c), d = daysUntil(c, today);
    var h = '<h2 id="bwall">🎂 ' + esc(t('bt.bw.h')) + '</h2><div class="card shouts bwall">';
    if (mine) {
      var open = list.filter(function (x) { return wallOpen(c, x, today); }), waiting = list.length - open.length;
      h += (open.length ? wallList(open, null) : '') + (waiting ? '<p class="bwall__wait">🎁 ' + esc(tf(waiting === 1 ? 'bt.bw.wait1' : 'bt.bw.waitN', { n: waiting })) + '</p>' : '') + (!list.length ? '<p class="muted">' + esc(t('bt.bw.noneYou')) + '</p>' : '');
      return h + '</div>';
    }
    h += '<p class="muted">' + esc(tf('bt.bw.about', { name: short(c), date: bdayText(c) })) + (d !== null ? ' · ' + esc(d === 0 ? t('bt.home.today') : d === 1 ? t('bt.home.inDays1') : tf('bt.home.inDaysN', { n: d })) : '') + '</p>';
    h += list.length ? wallList(list, me) : '<p class="muted">' + esc(t('bt.bw.none')) + '</p>';
    h += me ? '<form id="bw-form" class="shouts__form"><label class="field"><span class="field__l">' + esc(tf('bt.bw.label', { name: short(c) })) + '</span><textarea name="msg" rows="3" maxlength="280" placeholder="' + esc(t('bt.bw.ph')) + '"></textarea><span class="field__h">' + esc(tf('bt.bw.hint', { name: short(c) })) + '</span></label><p><button type="submit" class="btn btn--solid">' + esc(t('bt.bw.post')) + '</button></p><p class="form__status" id="bw-status" role="status"></p></form>' : '';
    return h + '</div>';
  }
  function wireWall(c) {
    var f = document.getElementById('bw-form');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); var txt = cleanText(f.msg.value, 280); if (!txt) return; saveMe(function (me) { me.bwall = (me.bwall || []).concat([{ to: c.id, name: c.name, text: txt, date: new Date().toISOString() }]).slice(-30); }); route({ keepScroll: true }); toast(t('bt.bw.posted')); });
    main.querySelectorAll('[data-unwall]').forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-unwall'); saveMe(function (me) { me.bwall = (me.bwall || []).filter(function (x, k) { return k !== i; }); }); route({ keepScroll: true }); }); });
  }
  function wallBits(c, today) {   // on the Home birthday banner
    var list = wallFor(c).filter(function (x) { return wallOpen(c, x, today); }); if (!list.length) return '';
    return '<div class="bday-today__wish bwall-home"><span class="today__fk">🎂 ' + esc(tf(list.length === 1 ? 'bt.bw.home1' : 'bt.bw.homeN', { n: list.length })) + '</span><blockquote class="shouts__q">' + esc(clip(list[list.length - 1].s.text, 160)) + '<span class="muted"> — ' + esc(short(list[list.length - 1].from)) + '</span></blockquote><a href="#/person/' + encodeURIComponent(c.id) + '">' + esc(t('bt.bw.read')) + '</a></div>';
  }

  /* ---- 9. Time capsule ---- */
  function capsMine() { return cleanLetters(store.get('capsuleMine', []), 20); }
  function capsAll() {
    var out = capsMine().map(function (x) { return { x: x, mine: true, self: true }; }), me = getMe();
    people().forEach(function (c) { (c.capsule || []).forEach(function (x) { out.push({ x: x, from: c, mine: !!(me && c.id === me.id) }); }); });
    return out.sort(function (a, b) { return a.x.open.localeCompare(b.x.open); });
  }
  function isOpen(x, today) { return evDays({ date: x.open }, today) <= 0; }
  var capsPeek = {};
  function defaultOpen() { var s = startDate(), base = s ? s.split('-') : null, d = base ? new Date(+base[0] + 1, +base[1] - 1, +base[2]) : new Date(); if (!base) d.setFullYear(d.getFullYear() + 1); if (d < new Date()) { d = new Date(); d.setFullYear(d.getFullYear() + 1); } return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  VIEWS.capsule = function () {
    var me = getMe(), today = new Date(), all = capsAll();
    function row(e) {
      var x = e.x, open = isOpen(x, today), show = open || (e.self && capsPeek[x.id]);
      var who = e.self ? t('bt.cap.toSelf') : e.mine ? t('bt.cap.fromYou') : tf('bt.cap.from', { name: e.from.name });
      return '<li class="cap' + (open ? ' is-open' : '') + '"><span class="cap__ico" aria-hidden="true">' + (open ? '💌' : '🔒') + '</span><div class="cap__b"><span class="muted">' + esc(who) + ' · ' + esc(tf(open ? 'bt.cap.opened' : 'bt.cap.opens', { date: evDate({ date: x.open, time: '' }) })) + (open ? '' : ' · ' + esc(evWhen({ date: x.open }, today))) + '</span>' +
        (show ? '<div class="cap__t">' + esc(x.text).replace(/\n/g, '<br>') + '</div>' : '') +
        ((e.self || e.mine) ? '<span class="ev__acts">' + (e.self && !open ? '<button type="button" class="link-btn" data-cpeek="' + esc(x.id) + '">' + esc(t(capsPeek[x.id] ? 'bt.mm.hide' : 'bt.cap.peek')) + '</button>' : '') + '<button type="button" class="link-btn" data-cdel="' + esc(x.id) + '" data-cself="' + (e.self ? 1 : 0) + '">' + esc(t('bt.custom.remove')) + '</button></span>' : '') + '</div></li>';
    }
    var form = '<form id="cap-form" class="card ev-form"><h2 style="margin-top:0">' + esc(t('bt.cap.write')) + '</h2>' +
      '<fieldset class="field fieldset"><legend class="field__l">' + esc(t('bt.cap.to')) + '</legend><label class="mm-ev"><input type="radio" name="to" value="self" checked> ' + esc(t('bt.cap.toSelfL')) + '</label>' + (me ? '<label class="mm-ev"><input type="radio" name="to" value="batch"> ' + esc(t('bt.cap.toBatchL')) + '</label>' : '') + '</fieldset>' +
      '<label class="field"><span class="field__l">' + esc(t('bt.cap.letter')) + '</span><textarea name="text" rows="6" maxlength="1000" placeholder="' + esc(t('bt.cap.ph')) + '"></textarea></label>' +
      '<label class="field"><span class="field__l">' + esc(t('bt.cap.openOn')) + '</span><input type="date" name="open" required value="' + esc(defaultOpen()) + '"></label>' +
      '<p><button type="submit" class="btn btn--solid">' + esc(t('bt.cap.seal')) + '</button></p><p class="form__status" id="cap-status" role="status"></p><p class="muted">' + esc(t('bt.cap.note')) + '</p></form>';
    return pageHead('events capsule', 'nav.capsule', 'bt.cap.intro') + '<div class="ev-layout"><div>' + (all.length ? '<ul class="plain ev-list card cap-list">' + all.map(row).join('') + '</ul>' : '<div class="empty"><p>' + esc(t('bt.cap.none')) + '</p></div>') + '</div>' + form + '</div></div>';
  };
  AFTER.capsule = function () {
    var f = document.getElementById('cap-form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var st = document.getElementById('cap-status'), txt = cleanText(f.text.value, 1000), open = isoDay(f.open.value), to = (f.querySelector('[name=to]:checked') || {}).value;
      if (!txt) { st.textContent = t('bt.cap.needText'); st.classList.add('is-error'); return; }
      if (!open || evDays({ date: open }, new Date()) < 1) { st.textContent = t('bt.cap.needDate'); st.classList.add('is-error'); return; }
      var x = { id: newId(), text: txt, open: open, date: new Date().toISOString() };
      if (to === 'batch') { var me = getMe(); if ((me.capsule || []).length >= 5) { st.textContent = t('bt.cap.max'); st.classList.add('is-error'); return; } saveMe(function (m) { m.capsule = (m.capsule || []).concat([x]); }); }
      else store.set('capsuleMine', capsMine().concat([x]));
      award('timekeeper'); route({ keepScroll: true }); toast(t('bt.cap.sealed'));
    });
    main.querySelectorAll('[data-cpeek]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-cpeek'); if (!capsPeek[id] && !window.confirm(t('bt.cap.peekConfirm'))) return; capsPeek[id] = !capsPeek[id]; route({ keepScroll: true }); }); });
    main.querySelectorAll('[data-cdel]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (!window.confirm(t('bt.cap.delConfirm'))) return;
        var id = b.getAttribute('data-cdel');
        if (b.getAttribute('data-cself') === '1') store.set('capsuleMine', capsMine().filter(function (x) { return x.id !== id; }));
        else saveMe(function (m) { m.capsule = (m.capsule || []).filter(function (x) { return x.id !== id; }); });
        route({ keepScroll: true });
      });
    });
  };
  function capsuleHomeHTML(today) {
    var fresh = capsAll().filter(function (e) { var d = evDays({ date: e.x.open }, today); return d <= 0 && d > -7; }); if (!fresh.length) return '';
    var e = fresh[fresh.length - 1];
    return '<section class="card today" aria-labelledby="today-cap-h"><p class="today__k">' + icon('mail', 'today__ico') + '<span id="today-cap-h">' + esc(t('bt.cap.homeH')) + '</span></p><blockquote class="shouts__q">' + esc(clip(e.x.text, 220)) + '</blockquote><p class="muted">' + esc(e.self ? t('bt.cap.toSelf') : tf('bt.cap.from', { name: e.from.name })) + '</p><p class="today__acts"><a class="btn" href="#/capsule">' + esc(t('nav.capsule')) + '</a></p></section>';
  }

  /* ---- 10. Trading-card image (canvas → PNG) ---- */
  function wrapLines(x, text, maxW, maxLines) {
    var words = String(text).split(/\s+/), lines = [], cur = '';
    words.forEach(function (w) { var tr = cur ? cur + ' ' + w : w; if (x.measureText(tr).width > maxW && cur) { lines.push(cur); cur = w; } else cur = tr; });
    if (cur) lines.push(cur);
    if (lines.length > maxLines) { lines = lines.slice(0, maxLines); var l = lines[maxLines - 1]; while (l && x.measureText(l + '…').width > maxW) l = l.slice(0, -1); lines[maxLines - 1] = l + '…'; }
    return lines;
  }
  function rr(x, X, Y, w, h, r) { x.beginPath(); x.moveTo(X + r, Y); x.arcTo(X + w, Y, X + w, Y + h, r); x.arcTo(X + w, Y + h, X, Y + h, r); x.arcTo(X, Y + h, X, Y, r); x.arcTo(X, Y, X + w, Y, r); x.closePath(); }
  function tcFacts(c) {
    var out = [];
    if (c.hometown) out.push([fieldLabel('hometown'), c.hometown]);
    if (c.medSchool) out.push([fieldLabel('medSchool'), c.medSchool]);
    if (c.askMe) out.push([t('bt.ask.k'), items(c.askMe).slice(0, 3).join(' · ')]);
    ['food', 'music', 'shows', 'hobbies', 'hiddenTalent', 'funFact'].forEach(function (k) { if (out.length < 4 && filled(c, k)) out.push([fieldLabel(k), c[k]]); });
    if (c.anthem && out.length < 5) out.push([t('bt.an.k'), c.anthem.title]);
    return out.slice(0, 5);
  }
  function drawTCard(c, cv, done) {
    var W = 1080, H = 1500, x = cv.getContext('2d'); cv.width = W; cv.height = H;
    var serif = '"Fraunces", Georgia, serif', sans = '"Figtree", "Helvetica Neue", Arial, sans-serif';
    function paint(img) {
      var g = x.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0E4A50'); g.addColorStop(1, '#16304F');
      x.fillStyle = g; rr(x, 0, 0, W, H, 56); x.fill();
      x.fillStyle = '#F2C14E'; rr(x, 28, 28, W - 56, H - 56, 40); x.fill();
      x.fillStyle = '#FFFDF7'; rr(x, 44, 44, W - 88, H - 88, 30); x.fill();
      x.fillStyle = '#0E4A50'; rr(x, 44, 44, W - 88, 110, 30); x.fill(); x.fillRect(44, 110, W - 88, 44);
      x.fillStyle = '#FFFDF7'; x.font = '700 34px ' + sans; x.textAlign = 'left'; x.textBaseline = 'middle';
      x.fillText((batchName() || APP_NAME).toUpperCase().slice(0, 40), 84, 110);
      x.textAlign = 'right'; x.font = '700 34px ' + sans; x.fillStyle = '#F2C14E'; x.fillText('★ ' + ((c.badges || []).length), W - 84, 110);
      var P = 520, px = (W - P) / 2, py = 190;
      x.save(); rr(x, px, py, P, P, 36); x.clip();
      if (img) x.drawImage(img, px, py, P, P);
      else { x.fillStyle = '#127C84'; x.fillRect(px, py, P, P); x.fillStyle = '#FFFDF7'; x.font = '700 200px ' + serif; x.textAlign = 'center'; x.fillText(initials(c.name), W / 2, py + P / 2 + 10); }
      x.restore(); x.lineWidth = 8; x.strokeStyle = '#0E4A50'; rr(x, px, py, P, P, 36); x.stroke();
      x.textAlign = 'center'; x.textBaseline = 'alphabetic'; x.fillStyle = '#1B2426'; x.font = '700 72px ' + serif;
      var y = py + P + 100; wrapLines(x, c.name, W - 180, 2).forEach(function (l) { x.fillText(l, W / 2, y); y += 80; });
      x.font = 'italic 400 40px ' + serif; x.fillStyle = '#127C84';
      var sub = [c.nickname ? '“' + c.nickname + '”' : '', c.pronouns || ''].filter(Boolean).join(' · ');
      if (sub) { x.fillText(clip(sub, 50), W / 2, y - 10); y += 50; }
      var z = [zodiac(c), chineseZodiac(c)].filter(Boolean).join(' · '), bd = c.bmonth ? '🎂 ' + bdayText(c) + (z ? ' · ' + z : '') : '';
      if (bd) { x.font = '600 34px ' + sans; x.fillStyle = '#5B6B6E'; x.fillText(bd, W / 2, y); y += 40; }
      y += 20; x.strokeStyle = '#E4DCCB'; x.lineWidth = 3; x.beginPath(); x.moveTo(110, y); x.lineTo(W - 110, y); x.stroke(); y += 56;
      x.textAlign = 'left';
      tcFacts(c).forEach(function (f) {
        if (y > H - 170) return;
        x.font = '700 26px ' + sans; x.fillStyle = '#127C84'; x.fillText(String(f[0]).toUpperCase(), 110, y); y += 40;
        x.font = '500 36px ' + sans; x.fillStyle = '#1B2426'; wrapLines(x, f[1], W - 220, 1).forEach(function (l) { x.fillText(l, 110, y); }); y += 62;
      });
      x.textAlign = 'center'; x.font = '600 28px ' + sans; x.fillStyle = '#5B6B6E';
      x.fillText(APP_NAME + ' · isaymotion.github.io/psychtickler', W / 2, H - 84);
      done();
    }
    var go = function () { if (c.photo) { var im = new Image(); im.onload = function () { paint(im); }; im.onerror = function () { paint(null); }; im.src = c.photo; } else paint(null); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(go, go); else go();
  }
  VIEWS.tcard = function (id) {
    var c = id ? findPerson(String(id)) : getMe();
    var head = '<div class="wrap page tcard-page">' + crumb(t('bt.tc.title')) + '<header class="page__head"><h1>' + esc(t('bt.tc.title')) + '</h1><p>' + esc(t('bt.tc.intro')) + '</p></header>';
    if (!c) return head + needCard() + '</div>';
    return head + '<div class="tcard"><canvas id="tc-canvas" hidden></canvas><img id="tc-img" class="tcard__img" alt="' + esc(tf('bt.tc.alt', { name: c.name })) + '"></div>' +
      '<p class="guess__acts"><button type="button" class="btn btn--solid" id="tc-share" disabled>' + esc(t('bt.tc.share')) + '</button><a class="btn" href="#/person/' + encodeURIComponent(c.id) + '">' + esc(t('bt.guess.open')) + '</a></p><p class="form__status" id="tc-status" role="status"></p></div>';
  };
  AFTER.tcard = function (id) {
    var c = id ? findPerson(String(id)) : getMe(); if (!c) return;
    var cv = document.getElementById('tc-canvas'), img = document.getElementById('tc-img'), btn = document.getElementById('tc-share'), st = document.getElementById('tc-status');
    drawTCard(c, cv, function () {
      try { img.src = cv.toDataURL('image/png'); } catch (e) {}
      btn.disabled = false;
      btn.addEventListener('click', function () {
        var name = 'trading-card-' + slug(c.name) + '.png';
        cv.toBlob(function (blob) {
          if (!blob) return; var file = null; try { file = new File([blob], name, { type: 'image/png' }); } catch (e) {}
          if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: c.name }).then(function () { st.textContent = t('bt.share.shared'); }).catch(function () {}); return; }
          var url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
          st.textContent = tf('bt.tc.saved', { name: name });
        }, 'image/png');
      });
    });
  };

  /* ---- 11. Where should we eat? ---- */
  var eatWho = null, eatPick = '';
  function eatPool(ids) {
    var map = {}, out = [];
    people().forEach(function (c) { if (ids && !ids[c.id]) return; listOf(c, 'foodSpots').forEach(function (x) { var k = x.title.toLowerCase(); if (!map[k]) { map[k] = { title: x.title, url: x.url, fans: [] }; out.push(map[k]); } if (!map[k].url && x.url) map[k].url = x.url; map[k].fans.push(c); }); });
    return out.sort(function (a, b) { return a.title.toLowerCase() < b.title.toLowerCase() ? -1 : 1; });
  }
  VIEWS.eat = function () {
    var all = people().filter(function (c) { return listOf(c, 'foodSpots').length; });
    eatWho = eatWho || {}; all.forEach(function (c) { if (!(c.id in eatWho)) eatWho[c.id] = 1; });
    var pool = eatPool(eatWho), head = pageHead('eat-page', 'nav.eat', 'bt.eat.intro');
    if (!eatPool(null).length) return head + '<div class="empty"><p>' + esc(t('bt.eat.none')) + '</p><p><a class="btn" href="#/me">' + esc(listLabel('foodSpots')) + '</a></p></div></div>';
    var pick = pool.filter(function (x) { return x.title.toLowerCase() === eatPick; })[0];
    return head + '<div class="card eat"><p class="eat__wheel" id="eat-wheel" aria-live="polite">' + esc(pick ? pick.title : '🍽️') + '</p>' +
      (pick ? '<p class="muted eat__from">' + esc(tf('bt.eat.from', { names: pick.fans.map(short).join(', ') })) + '</p><p class="guess__acts eat__acts"><a class="btn" href="' + esc(listHref(LIST_BY.foodSpots, pick)) + '" target="_blank" rel="noopener">' + esc(t('bt.eat.maps')) + '</a><button type="button" class="btn" id="eat-share">' + esc(t('bt.eat.share')) + '</button></p>' : '<p class="muted eat__from">' + esc(tf('bt.eat.count', { n: pool.length })) + '</p>') +
      '<p><button type="button" class="btn btn--solid eat__spin" id="eat-spin"' + (pool.length ? '' : ' disabled') + '>' + esc(t(pick ? 'bt.eat.again' : 'bt.eat.spin')) + '</button></p><p class="form__status" id="eat-status" role="status"></p></div>' +
      '<details class="fgroup"><summary><span>' + esc(t('bt.eat.who')) + '</span><span class="muted fgroup__n">' + Object.keys(eatWho).filter(function (k) { return eatWho[k]; }).length + '/' + all.length + '</span></summary><div class="fgroup__body"><div class="mm-people">' + all.map(function (c) { return '<label class="mm-p"><input type="checkbox" data-eatwho="' + esc(c.id) + '"' + (eatWho[c.id] ? ' checked' : '') + '>' + avatar(c, 'avatar--sm') + '<span>' + esc(c.name) + '</span></label>'; }).join('') + '</div></div></details>' +
      '<h2>' + esc(t('bt.eat.list')) + '</h2><div class="card"><ul class="plain eat-list">' + pool.map(function (x) { return '<li><a href="' + esc(listHref(LIST_BY.foodSpots, x)) + '" target="_blank" rel="noopener">' + esc(x.title) + '</a> <span class="muted">' + esc(x.fans.map(short).join(', ')) + '</span></li>'; }).join('') + '</ul></div></div>';
  };
  AFTER.eat = function () {
    main.querySelectorAll('[data-eatwho]').forEach(function (b) { b.addEventListener('change', function () { eatWho[b.getAttribute('data-eatwho')] = b.checked ? 1 : 0; eatPick = ''; route({ keepScroll: true }); }); });
    var sp = document.getElementById('eat-spin');
    if (sp) sp.addEventListener('click', function () {
      var pool = eatPool(eatWho); if (!pool.length) return;
      var final = pool[Math.floor(Math.random() * pool.length)], wheel = document.getElementById('eat-wheel');
      var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function land() { eatPick = final.title.toLowerCase(); award('foodie'); route({ keepScroll: true }); }
      if (reduce || pool.length < 2) { land(); return; }
      sp.disabled = true; wheel.classList.add('is-spin'); var n = 0, timer = setInterval(function () { wheel.textContent = pool[n++ % pool.length].title; if (n > 16) { clearInterval(timer); land(); } }, 80);
    });
    var sh = document.getElementById('eat-share');
    if (sh) sh.addEventListener('click', function () { var p = eatPool(eatWho).filter(function (x) { return x.title.toLowerCase() === eatPick; })[0]; if (p) shareOut(tf('bt.eat.msg', { place: p.title }) + (listHref(LIST_BY.foodSpots, p) ? '\n' + listHref(LIST_BY.foodSpots, p) : ''), document.getElementById('eat-status')); });
  };

  /* ---- 12. Batch anthem ---- */
  function anthemHref(a) { return a.url || 'https://www.youtube.com/results?search_query=' + encodeURIComponent(a.title); }
  VIEWS.anthem = function () {
    var me = getMe(), all = people().filter(function (c) { return c.anthem; }), a = me && me.anthem || { title: '', url: '' };
    var form = me ? '<form id="an-form" class="card ev-form"><h2 style="margin-top:0">' + esc(t('bt.an.mine')) + '</h2><label class="field"><span class="field__l">' + esc(t('bt.an.song')) + '</span><input name="title" maxlength="80" value="' + esc(a.title) + '" placeholder="' + esc(t('bt.an.songPh')) + '"></label>' +
      '<label class="field"><span class="field__l">' + esc(t('bt.an.url')) + '</span><input name="url" inputmode="url" autocapitalize="off" autocomplete="off" spellcheck="false" maxlength="300" value="' + esc(a.url) + '" placeholder="https://open.spotify.com/track/…"><span class="field__h">' + esc(t('bt.an.hint')) + '</span></label>' +
      '<p class="guess__acts"><button type="submit" class="btn btn--solid">' + esc(t('bt.me.save')) + '</button>' + (me.anthem ? '<button type="button" class="link-btn" id="an-clear">' + esc(t('bt.custom.remove')) + '</button>' : '') + '</p><p class="form__status" id="an-status" role="status"></p></form>' : needCard();
    var list = all.length ? '<ol class="plain card an-list">' + all.map(function (c) { return '<li><a href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c, 'avatar--sm') + '</a><div class="an-list__b"><strong>' + esc(c.anthem.title) + '</strong><span class="muted">' + esc(c.name) + '</span></div><a class="btn" href="' + esc(anthemHref(c.anthem)) + '" target="_blank" rel="noopener">' + esc(t(c.anthem.url ? 'bt.an.play' : 'bt.an.find')) + '</a></li>'; }).join('') + '</ol>' : '<div class="empty"><p>' + esc(t('bt.an.none')) + '</p></div>';
    return pageHead('events anthem', 'nav.anthem', 'bt.an.intro') + '<div class="ev-layout"><div>' + list + '</div>' + form + '</div></div>';
  };
  AFTER.anthem = function () {
    var f = document.getElementById('an-form'); if (!f) return;
    f.addEventListener('submit', function (e) {
      e.preventDefault(); var st = document.getElementById('an-status'), ti = cleanText(f.title.value, 80), u = f.url.value.trim();
      if (!ti) { st.textContent = t('bt.an.needTitle'); st.classList.add('is-error'); return; }
      if (u && !listUrl(ANTHEM_L, u)) { st.textContent = t('bt.an.badUrl'); st.classList.add('is-error'); return; }
      saveMe(function (me) { me.anthem = { title: ti, url: u }; }); award('dj'); route({ keepScroll: true }); toast(t('bt.an.saved'));
    });
    var cl = document.getElementById('an-clear'); if (cl) cl.addEventListener('click', function () { saveMe(function (me) { delete me.anthem; }); route({ keepScroll: true }); });
  };
  function anthemHomeHTML(all, today) {
    var pool = all.filter(function (c) { return c.anthem; }); if (!pool.length) return '';
    var c = pool[dayHash(weekNum(today), 7) % pool.length];
    return '<section class="card today" aria-labelledby="today-an-h"><p class="today__k">' + icon('music', 'today__ico') + '<span id="today-an-h">' + esc(t('bt.an.homeH')) + '</span></p>' +
      '<div class="today__pl"><a href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c, 'avatar--sm') + '</a><div><h3>' + esc(c.anthem.title) + '</h3><p class="muted">' + esc(tf('bt.today.by', { name: short(c) })) + '</p></div></div>' +
      '<p class="today__acts"><a class="btn btn--solid" href="' + esc(anthemHref(c.anthem)) + '" target="_blank" rel="noopener">' + esc(t(c.anthem.url ? 'bt.an.play' : 'bt.an.find')) + '</a><a class="btn" href="#/anthem">' + esc(t('nav.anthem')) + '</a></p></section>';
  }

  /* ---- hooks into existing screens ---- */
  function funLinksHTML() {
    var L = [['#/truths', 'nav.truths', 'quiz'], ['#/baby', 'nav.baby', 'heart'], ['#/thisorthat', 'nav.tot', 'chart'], ['#/superlatives', 'nav.sup', 'star'], ['#/qotw', 'nav.qotw', 'chat'], ['#/anthem', 'nav.anthem', 'music'], ['#/capsule', 'nav.capsule', 'mail'], ['#/pets', 'bt.pets.mine', 'paw'], ['#/tcard', 'bt.tc.title', 'card']];
    return '<h2>' + esc(t('bt.fun.more')) + '</h2><p class="muted">' + esc(t('bt.fun.moreHint')) + '</p><div class="cards fun-links">' + L.map(function (x) { return '<a class="card tile" href="' + x[0] + '">' + icon(x[2], 'tile__ico') + '<h3>' + esc(t(x[1])) + '</h3></a>'; }).join('') + '</div>';
  }
  function personActs(c) {
    var me = isMe(c), q = !me && quizCount(c) >= 4;
    return '<p class="person__acts"><a class="btn" href="#/tcard/' + encodeURIComponent(c.id) + '">' + icon('card', 'btn__ico') + esc(t('bt.tc.title')) + '</a>' + (q ? '<a class="btn" href="#/quiz/' + encodeURIComponent(c.id) + '">' + icon('quiz', 'btn__ico') + esc(tf('bt.quiz.title', { name: short(c) })) + '</a>' : '') + '</p>' +
      (c.anthem ? '<p class="muted person__anthem">' + icon('music', 'fact__ico') + esc(t('bt.an.k')) + ': <a href="' + esc(anthemHref(c.anthem)) + '" target="_blank" rel="noopener">' + esc(c.anthem.title) + '</a></p>' : '');
  }
  (function () {
    var afterHome = AFTER.home; AFTER.home = function () { afterHome.apply(null, arguments); wireQotw(); };
    var afterPerson = AFTER.person; AFTER.person = function (id) { afterPerson.apply(null, arguments); var c = findPerson(String(id || '')); if (c) wireWall(c); };
    var nb = BADGES.length;
    [['liedetector', 'quiz'], ['quizmaster', 'star'], ['babyface', 'heart'], ['pollster', 'chart'], ['voter', 'users'], ['qotw', 'chat'], ['timekeeper', 'mail'], ['dj', 'music'], ['foodie', 'food']].forEach(function (b) { if (BADGE_IDS.indexOf(b[0]) < 0) { BADGES.push(b); BADGE_IDS.push(b[0]); } });
    var check0 = checkBadges;
    checkBadges = function () {
      check0();
      var me = getMe(); if (!me) return;
      if (TOT().length && TOT().every(function (q) { return me.tot && me.tot[q.id]; })) award('pollster');
      if (SUPS().length && others().length && SUPS().every(function (a) { return me.votes && me.votes[a.id]; })) award('voter');
      if (Object.keys(me.qotw || {}).length) award('qotw');
      if ((me.capsule || []).length || capsMine().length) award('timekeeper');
      if (me.anthem) award('dj');
    };
    return nb;
  })();
  ICONS.mail = ICONS.mail || '<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.5 7l8.5 6 8.5-6"/>';
  ICONS.chart = ICONS.chart || ICONS.list;
  TITLES.quiz = function () { return t('nav.quiz'); };
  TITLES.tcard = function () { return t('bt.tc.title'); };

  /* ===================== 1.16.0: EMERGENCY INFO =====================
     Group 'emergency' in data/fields.js (blood type, allergies, conditions, two emergency contacts).
     #/emergency = whole batch (filter by name; me first; people without info listed at the end); #/emergency/<id> = one person.
     Home: red strip above the stats. Tab bar: Emergency button. Person page: button in the head + section before the footer.
     #/me/emergency opens My card with that group open. Nothing here is printed or put in QR beyond what fields.js allows. */
  ICONS.medic = '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><path d="M12 8v8M8 12h8"/>';
  var EM_FIELDS = FIELDS.filter(function (f) { return f.group === 'emergency'; });
  function hasEm(c) { return !!(c && (c.bloodType || c.allergies || c.dutyConditions || c.emergencyNumber || c.emergencyContact || c.emergencyNumber2 || c.emergencyContact2)); }
  function emTel(num) {
    var n = String(num || '').replace(/[^\d+]/g, ''); if (!n) return '';
    return '<span class="em-acts"><a class="btn em-call" href="tel:' + esc(n) + '">' + icon('phone', 'btn__ico') + esc(t('bt.person.call')) + '</a><a class="btn" href="sms:' + esc(n) + '">' + esc(t('bt.person.text')) + '</a></span>';
  }
  function emLine(k, v, extra) { return '<div class="em-line"><span class="em-line__k">' + esc(k) + '</span><span class="em-line__v">' + v + '</span>' + (extra || '') + '</div>'; }
  function emContact(name, rel, num) {
    if (!name && !num) return '';
    return emLine(t('bt.em.contact'), esc(name || '—') + (rel ? ' <span class="muted">(' + esc(rel) + ')</span>' : '') + (num ? '<br><span class="em-num">' + esc(num) + '</span>' : ''), emTel(num));
  }
  function emBody(c) {
    return '<div class="em-body">' +
      emLine(t('bt.em.allergies'), c.allergies ? '<strong class="em-alert">' + esc(c.allergies) + '</strong>' : '<span class="muted">' + esc(t('bt.em.noAllergy')) + '</span>') +
      (c.dutyConditions ? emLine(t('bt.em.conditions'), esc(c.dutyConditions).replace(/\n/g, '<br>')) : '') +
      (c.phone ? emLine(t('bt.em.own'), '<span class="em-num">' + esc(c.phone) + '</span>', emTel(c.phone)) : '') +
      emContact(c.emergencyContact, c.emergencyRelation, c.emergencyNumber) +
      emContact(c.emergencyContact2, c.emergencyRelation2, c.emergencyNumber2) + '</div>';
  }
  function emBlood(c) { return '<span class="em-blood' + (c.bloodType ? '' : ' em-blood--none') + '" title="' + esc(t('bt.em.blood')) + '"><small>' + esc(t('bt.em.blood')) + '</small>' + esc(c.bloodType || '—') + '</span>'; }
  function emCard(c) {
    return '<section class="card em-card" data-name="' + esc((c.name + ' ' + (c.nickname || '') + ' ' + (c.preferredName || '')).toLowerCase()) + '">' +
      '<header class="em-card__head"><a href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c, 'avatar--sm') + '</a><div class="em-card__who"><h3><a href="#/person/' + encodeURIComponent(c.id) + '">' + esc(c.name) + '</a>' + (isMe(c) ? ' <span class="em-tag">' + esc(t('bt.em.yours')) + '</span>' : '') + '</h3>' + (c.nickname ? '<p class="muted">“' + esc(c.nickname) + '”</p>' : '') + '</div>' + emBlood(c) + '</header>' + emBody(c) +
      (isMe(c) ? '<p class="em-card__edit"><a class="link-btn" href="#/me/emergency">' + esc(t('bt.em.edit')) + '</a></p>' : '') + '</section>';
  }
  VIEWS.emergency = function (id) {
    var all = people(), me = getMe(), one = id ? findPerson(String(id)) : null;
    var head = '<header class="page__head"><h1>' + icon('medic', 'page__ico em-ico') + esc(t('nav.emergency')) + '</h1><p>' + esc(t('bt.em.intro')) + '</p></header>' +
      '<div class="callout callout--caution em-911"><p>' + esc(t('bt.em.note')) + '</p><p style="margin:0"><a class="btn btn--solid em-911__btn" href="tel:911">' + icon('phone', 'btn__ico') + esc(t('bt.em.call911')) + '</a></p></div>';
    if (one) return '<div class="wrap page em">' + crumb(t('nav.emergency')) + head + emCard(one) + '<p><a class="btn" href="#/emergency">' + icon('users', 'btn__ico') + esc(t('bt.em.all')) + '</a></p></div>';
    if (!all.length) return '<div class="wrap page em">' + crumb(t('nav.emergency')) + head + '<div class="empty"><p>' + esc(t('bt.em.none')) + '</p><p><a class="btn btn--solid" href="#/me/emergency">' + esc(t('nav.me')) + '</a> <a class="btn" href="#/sync">' + esc(t('nav.sync')) + '</a></p></div></div>';
    var withInfo = all.filter(hasEm).sort(function (a, b) { return (isMe(b) ? 1 : 0) - (isMe(a) ? 1 : 0) || byName(a, b); });
    var without = all.filter(function (c) { return !hasEm(c) && !isMe(c); });
    return '<div class="wrap page em">' + crumb(t('nav.emergency')) + head +
      (!me || (!hasEm(me) && !isPartner(me)) ? '<div class="callout"><p class="callout__title">' + esc(t('bt.em.add')) + '</p><p style="margin:0 0 10px">' + esc(t('bt.em.addText')) + '</p><a class="btn btn--solid" href="#/me/emergency">' + esc(t('bt.em.add')) + '</a></div>' : '') +
      (withInfo.length > 3 ? '<div class="toolbar"><label class="field field--inline"><span class="sr-only">' + esc(t('bt.em.filter')) + '</span><input type="search" id="em-q" placeholder="' + esc(t('bt.em.filter')) + '" autocomplete="off"></label></div>' : '') +
      '<div class="em-grid">' + withInfo.map(emCard).join('') + '</div><p class="empty" id="em-nomatch" hidden>' + esc(t('bt.em.noMatch')) + '</p>' +
      (without.length ? '<h2>' + esc(t('bt.em.missing')) + '</h2><p class="muted">' + esc(t('bt.em.missingText')) + '</p><p>' + without.map(function (c) { return '<a href="#/person/' + encodeURIComponent(c.id) + '">' + esc(c.name) + '</a>'; }).join(', ') + '</p>' : '') +
      '</div>';
  };
  AFTER.emergency = function () {
    var q = document.getElementById('em-q'); if (!q) return;
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase(), cards = document.querySelectorAll('.em-card'), n = 0;
      for (var i = 0; i < cards.length; i++) { var on = !v || cards[i].getAttribute('data-name').indexOf(v) >= 0; cards[i].hidden = !on; if (on) n++; }
      document.getElementById('em-nomatch').hidden = n > 0;
    });
  };
  TITLES.emergency = function () { return t('nav.emergency'); };
  (function () {
    var home0 = VIEWS.home;
    VIEWS.home = function () {
      var html = home0.apply(null, arguments), all = people(), me = getMe();
      if (!all.length) return html;
      var n = all.filter(hasEm).length;
      var strip = '<a class="card em-strip" href="#/emergency">' + icon('medic', 'em-strip__ico') + '<span class="em-strip__t"><strong>' + esc(t('nav.emergency')) + '</strong><span>' + esc(n === 1 ? t('bt.em.homeS1') : tf('bt.em.homeSN', { n: n })) + '</span></span>' + (me && !hasEm(me) && !isPartner(me) ? '<span class="em-tag em-strip__add">' + esc(t('bt.em.homeAdd')) + '</span>' : '') + '</a>';
      return html.replace('<div class="home__stats">', strip + '<div class="home__stats">');
    };
    var person0 = VIEWS.person;
    VIEWS.person = function (id) {
      var html = person0.apply(null, arguments), c = findPerson(String(id || ''));
      if (!c || !hasEm(c)) return html;
      html = html.replace('<p class="person__acts">', '<p class="person__acts"><a class="btn em-btn" href="#/emergency/' + encodeURIComponent(c.id) + '">' + icon('medic', 'btn__ico') + esc(t('nav.emergency')) + '</a>');
      var sec = '<h2>' + esc(groupLabel('emergency')) + '</h2><div class="card em-card em-card--inline"><header class="em-card__head">' + emBlood(c) + '</header>' + emBody(c) + '</div>';
      var i = html.lastIndexOf('<p class="person__foot');
      return i < 0 ? html + sec : html.slice(0, i) + sec + html.slice(i);
    };
    var me0 = AFTER.me;
    AFTER.me = function (arg) {
      me0.apply(null, arguments);
      if (arg !== 'emergency') return;
      var n = document.querySelector('.fgroup__n[data-group="emergency"]'), d = n && n.closest('details');
      if (d) { d.open = true; setTimeout(function () { d.scrollIntoView({ block: 'start' }); var f = d.querySelector('input,textarea'); if (f) f.focus({ preventScroll: true }); }, 60); }
    };
  })();

  /* ===================== 1.17.0: PARTNER (JOWA/ASAWA) CARDS — option B =====================
     A card with partnerOf (resident id) or partnerName (typed, matched by name) is a partner card. people() = residents only,
     so partners stay out of games, stats, superlatives, Wrapped, Kris Kringle, map, emergency and the batch grid.
     allCards() = everyone: used by findPerson, search, Birthdays (+ .ics), birthday banner, sharing, shoutouts/birthday wall.
     Partners show on their resident's page (section after the header), on #/partners, and say "Partner of X" on their own page. */
  function resolveResident(c) {
    if (!isPartner(c)) return null;
    var r = c.partnerOf ? findPerson(c.partnerOf) : null;
    if (r && !isPartner(r)) return r;
    var n = (c.partnerName || '').toLowerCase(); if (!n) return null;
    var l = people(); for (var i = 0; i < l.length; i++) if (l[i].name.toLowerCase() === n) return l[i];
    return null;
  }
  function partnersOf(r) { return partners().filter(function (p) { var x = resolveResident(p); return x && x.id === r.id; }); }
  function ofText(c) { var r = resolveResident(c); return tf('bt.pt.of', { name: r ? r.name : (c.partnerName || '?') }); }
  function partnerCard(c, today) {
    return personCard(c, today).replace(/<\/span><\/a>$/, '<span class="pcard__meta pt-meta">' + icon('heart', 'pcard__ico') + esc(ofText(c)) + '</span></span></a>');
  }
  function partnerFieldset(me) {
    var pt = isPartner(me), res = people().filter(function (c) { return !me.id || c.id !== me.id; }), cur = resolveResident(me);
    return '<fieldset class="field fieldset pt-role"><legend class="field__l">' + esc(t('bt.pt.role')) + '</legend>' +
      '<label class="pt-radio"><input type="radio" name="cardRole" value="resident"' + (pt ? '' : ' checked') + '> ' + esc(t('bt.pt.roleRes')) + '</label>' +
      '<label class="pt-radio"><input type="radio" name="cardRole" value="partner"' + (pt ? ' checked' : '') + '> ' + esc(t('bt.pt.rolePt')) + '</label>' +
      '<div class="pt-who"' + (pt ? '' : ' hidden') + '>' +
        (res.length ? '<label class="field"><span class="field__l">' + esc(t('bt.pt.pick')) + '</span><select name="partnerOf"><option value="">' + esc(t('bt.pt.pickNone')) + '</option>' + res.map(function (r) { return '<option value="' + esc(r.id) + '"' + (cur && cur.id === r.id ? ' selected' : '') + '>' + esc(r.name) + '</option>'; }).join('') + '</select></label>' : '') +
        '<label class="field"><span class="field__l">' + esc(t(res.length ? 'bt.pt.name' : 'bt.pt.nameOnly')) + '</span><input type="text" name="partnerName" maxlength="80" value="' + esc(cur ? '' : (me.partnerName || '')) + '"></label>' +
        '<p class="field__h">' + esc(t('bt.pt.hint')) + '</p></div></fieldset>';
  }
  VIEWS.partners = function () {
    var today = new Date(), list = partners().sort(function (a, b) { var ra = resolveResident(a), rb = resolveResident(b); return ((ra ? ra.name : a.partnerName) || '').localeCompare((rb ? rb.name : b.partnerName) || '', undefined, { sensitivity: 'base' }) || byName(a, b); });
    return '<div class="wrap page">' + crumb(t('nav.partners')) +
      '<header class="page__head"><h1>' + esc(t('nav.partners')) + '</h1><p>' + esc(t('bt.pt.intro')) + '</p></header>' +
      (list.length ? '<div class="pgrid">' + list.map(function (c) { return partnerCard(c, today); }).join('') + '</div>' : '<div class="empty"><p>' + esc(t('bt.pt.none')) + '</p></div>') +
      '<div class="callout" style="margin-top:20px"><p class="callout__title">' + esc(t('bt.pt.how')) + '</p><p style="margin:0">' + esc(t('bt.pt.howText')) + '</p></div></div>';
  };
  TITLES.partners = function () { return t('nav.partners'); };
  (function () {
    var person0 = VIEWS.person;
    VIEWS.person = function (id) {
      var html = person0.apply(null, arguments), c = findPerson(String(id || ''));
      if (!c) return html;
      if (isPartner(c)) {
        var r = resolveResident(c);
        html = html.replace('</h1>', '</h1><p class="pt-of">' + icon('heart', 'fact__ico') + (r ? esc(t('bt.pt.ofLead')) + ' <a href="#/person/' + encodeURIComponent(r.id) + '">' + esc(r.name) + '</a>' : esc(ofText(c))) + '</p>');
        return html.replace(/<a class="btn" href="#\/quiz\/[^"]*">[\s\S]*?<\/a>/, '');
      }
      var ps = partnersOf(c); if (!ps.length) return html;
      var today = new Date(), sec = '<h2>' + esc(t('bt.pt.section')) + '</h2><div class="pgrid pt-grid">' + ps.map(function (p) { return personCard(p, today); }).join('') + '</div>';
      var i = html.indexOf('</header>'); return i < 0 ? html : html.slice(0, i + 9) + sec + html.slice(i + 9);
    };
    var batch0 = VIEWS.batch;
    VIEWS.batch = function () {
      var html = batch0.apply(null, arguments), n = partners().length;
      if (!n) return html;
      return html.replace(/<\/div>$/, '<p class="pt-link"><a class="btn" href="#/partners">' + icon('heart', 'btn__ico') + esc(n === 1 ? t('bt.pt.count1') : tf('bt.pt.countN', { n: n })) + '</a></p></div>');
    };
    var me1 = AFTER.me;
    AFTER.me = function () {
      me1.apply(null, arguments);
      var who = document.querySelector('.pt-who'); if (!who) return;
      document.querySelectorAll('input[name="cardRole"]').forEach(function (r) { r.addEventListener('change', function () { who.hidden = r.value !== 'partner' || !r.checked; }); });
    };
  })();

  /* ===================== 1.18.0: CLOUD SYNC (Firebase) =====================
     Cards travel through Firestore instead of files and QR codes. Google sign-in, a join code per batch and
     approval by an admin (CLOUD_CONFIG.admins). The SDK (js/vendor/firebase.js + js/cloud.js) loads only for
     members or on #/sync. No realtime listeners (free-plan read quota): sync on open (at most every 5 min),
     on Sync now, and a push a few seconds after My card changes. Store key `cloud` holds the phone's sync state:
     {code, name, state:'pending'|'member'|'removed', consent:{emergency,contact}, pushKey, lastPull, lastFull,
     syncIds, evPush, evPull, evDel, lastSync, lastErr}. */
  var CCFG = window.CLOUD_CONFIG || {}, PRIV = CCFG.privateGroups || ['emergency', 'contact'];
  var SYNC_EVERY = 5 * 60 * 1000, SAFE_RERENDER = ['home', 'batch', 'birthdays', 'emergency', 'partners', 'stats', 'events', 'sync', 'picks', 'map'];
  var cloudAgain = '', cloudApi = null, cloudLoading = null, cloudLoadErr = '', cloudBusy = false, pushTimer = null, syncAdmin = null, syncFlash = '';
  ICONS.cloud = '<path d="M7 18.5a4.5 4.5 0 0 1-.7-8.95A6 6 0 0 1 17.8 9a4.75 4.75 0 0 1-.3 9.5z"/>';
  (function () { for (var i = 0; i < NAV.length; i++) if (NAV[i].href === '#/me') { NAV.splice(i + 1, 0, { label: 'Cloud sync', tkey: 'nav.sync', href: '#/sync', icon: 'cloud', group: 'Screens' }); return; } })();
  function cst() { var c = store.get('cloud', null); return c && typeof c === 'object' ? c : {}; }
  function cset(mut) { var c = cst(); mut(c); store.set('cloud', c); return c; }
  function isSynced() { var c = cst(); return c.state === 'member' && !!c.code; }
  function normCode(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12); }
  function fmtCode(c) { return c && c.length === 8 ? c.slice(0, 4) + '-' + c.slice(4) : (c || ''); }
  function newCode() { var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', r = new Uint32Array(8), s = ''; window.crypto.getRandomValues(r); for (var i = 0; i < 8; i++) s += A[r[i] % A.length]; return s; }
  function loadScript(src) { return new Promise(function (res, rej) { var sc = document.createElement('script'); sc.src = src; sc.onload = res; sc.onerror = function () { rej({ code: 'network-load' }); }; document.head.appendChild(sc); }); }
  function cloud() {   // promise of the adapter, signed-in state restored
    if (cloudApi) return Promise.resolve(cloudApi);
    if (!cloudLoading) cloudLoading = (window.BT_CLOUD ? Promise.resolve() : loadScript('js/vendor/firebase.js').then(function () { return loadScript('js/cloud.js'); }))
      .then(function () { var api = window.BT_CLOUD(CCFG); if (api.setFlags) api.setFlags(cst()); return api.ready().then(function () { cloudApi = api; cloudLoadErr = ''; return api; }); })
      .catch(function (e) { cloudLoading = null; cloudLoadErr = errText(e); throw e; });
    return cloudLoading;
  }
  function cUser() { return cloudApi ? cloudApi.user() : null; }
  function errText(e) {
    var c = String((e && (e.code || e.message)) || '');
    if (/permission/i.test(c)) return t('bt.sync.errPerm');
    if (/network|unavailable|offline|fetch|load/i.test(c)) return t('bt.sync.errNet');
    if (/popup-closed|cancelled-popup|user-cancelled/i.test(c)) return t('bt.sync.errClosed');
    if (/signed-out/.test(c)) return t('bt.sync.errSignedOut');
    return tf('bt.sync.errOther', { code: c.slice(0, 80) });
  }
  function cloudCard(me, con) {   // my card as uploaded: private groups emptied unless their owner said yes
    var c = JSON.parse(JSON.stringify(me));
    FIELDS.forEach(function (f) { if (PRIV.indexOf(f.group) >= 0 && !con[f.group]) c[f.key] = ''; });
    if (!c.showYear) c.byear = 0;                                   // the birth year stays on the phone unless its owner shows it
    Object.keys(c.aud || {}).forEach(function (k) { c[k] = ''; });   // restricted fields travel separately (cloudParts)
    return c;
  }
  function cloudParts(me, c) {   // the restricted values, by audience; consultants have none
    var out = { res: {}, batch: {}, year: 0, oldYear: c.partYear || 0 }, myBatch = +c.batch || 0;
    if ((c.role || 'resident') === 'consultant') { out.res = null; return out; }
    Object.keys(me.aud || {}).forEach(function (k) {
      if (!me[k]) return;
      if (me.aud[k] === 'res') out.res[k] = me[k]; else if (myBatch) out.batch[k] = me[k];   // "my batch" with no batch on record yet: not uploaded at all until an admin records the batch
    });
    out.year = myBatch;
    return out;
  }
  function pushKey(me, con) { var c = cst(); return me.id + '|' + me.updated + '|' + (con.emergency ? 1 : 0) + (con.contact ? 1 : 0) + '|' + (c.role || '') + (c.batch || 0); }
  function pushMe(api, c) {
    var me = getMe(), con = c.consent || {}; if (!me) return Promise.resolve(false);
    var k = pushKey(me, con); if (k === c.pushKey) return Promise.resolve(false);
    var parts = cloudParts(me, c);
    return api.putCard(c.code, cloudCard(me, con), con, parts).then(function () { cset(function (x) { x.pushKey = k; x.partYear = parts.year; }); return true; });
  }
  function pullCards(api, c, full) {
    var u = api.user(), me = getMe();
    return api.cardsSince(c.code, full ? -1 : (c.lastPull || 0)).then(function (docs) {
      var maxU = c.lastPull || 0, byId = {}, incoming = [], removed = 0;
      getOthers().forEach(function (x) { byId[x.id] = x; });
      // 1.19.2: my own card, uploaded from my other device (same Google account), becomes My card here when this device has none or an older copy
      var gotMe = false, mine = docs.filter(function (d) { return d.card && u && d.owner === u.uid; }).sort(function (a, b) { return b.updated - a.updated; })[0];
      if (mine && (!me || mine.updated > (Date.parse(me.updated) || 0))) {
        var mc = sanitizeCard(mine.card), msh = mine.shared || {};
        if (mc) {
          if (me) PRIV.forEach(function (g) { if (!msh[g]) FIELDS.forEach(function (f) { if (f.group === g && me[f.key] && !mc[f.key]) mc[f.key] = me[f.key]; }); });
          if (me) { Object.keys(mc.aud || {}).forEach(function (k) { if (me[k] && !mc[k]) mc[k] = me[k]; }); if (!mc.byear && me.byear && me.bmonth === mc.bmonth && me.bday === mc.bday) mc.byear = me.byear; }
          var eb = earned(); (mc.badges || []).forEach(function (id) { if (!eb[id]) eb[id] = mc.updated; }); store.set('badges', eb);   // badges earned on the other device count here too
          store.set('me', mc); gotMe = true;
          cset(function (x) { x.consent = { emergency: !!msh.emergency, contact: !!msh.contact }; x.pushKey = pushKey(mc, x.consent); });
          if (me && me.id !== mc.id && api.deleteCard) docs.forEach(function (d) { if (d.owner === u.uid && d.id === me.id) api.deleteCard(c.code, d.id).catch(function () {}); });
          me = mc;
        }
      }
      var owners = store.get('owners', {}); if (!owners || typeof owners !== 'object' || full) owners = {};
      docs.forEach(function (d) { if (d.owner) owners[d.id] = d.owner; });
      store.set('owners', owners);
      docs.forEach(function (d) {
        if (d.updated > maxU) maxU = d.updated;
        if (!d.card || (u && d.owner === u.uid) || (me && d.id === me.id)) return;
        var card = d.card, old = byId[d.id], sh = d.shared || {};
        // a group its owner keeps off the cloud arrives empty: keep what this phone already had from them
        if (old) PRIV.forEach(function (g) { if (!sh[g]) FIELDS.forEach(function (f) { if (f.group === g && old[f.key] && !card[f.key]) card[f.key] = old[f.key]; }); });
        incoming.push(card);
      });
      var res = incoming.length ? mergeCards(incoming) : { added: 0, updated: 0 };
      var ids = docs.map(function (d) { return d.id; });
      if (full) {   // cards deleted from the cloud (member left or was removed) leave this phone too — only ones that came from the cloud
        var was = c.syncIds || [], keep = getOthers().filter(function (x) { var gone = was.indexOf(x.id) >= 0 && ids.indexOf(x.id) < 0; if (gone) removed++; return !gone; });
        if (removed) saveOthers(keep);
      }
      cset(function (x) { x.lastPull = maxU; x.syncIds = full ? ids : (x.syncIds || []).concat(ids).filter(function (v, i, a) { return a.indexOf(v) === i; }); if (full) x.lastFull = dayNum(new Date()); });
      return { added: res.added, updated: res.updated, removed: removed, me: gotMe };
    });
  }
  function syncEvents(api, c) {
    var since = c.evPush || '', mine = storedEvents().filter(function (e) { return e.updated > since; }), dels = c.evDel || [];
    return Promise.all(mine.map(function (e) { return api.putEvent(c.code, e); }).concat(dels.map(function (e) { return api.putEvent(c.code, Object.assign({}, e, { deleted: true })); })))
      .then(function () {
        var top = mine.reduce(function (m, e) { return e.updated > m ? e.updated : m; }, since);
        cset(function (x) { x.evPush = top; x.evDel = []; });
        return api.eventsSince(c.code, c.evPull || 0);
      }).then(function (list) {
        var maxU = c.evPull || 0, add = [], gone = {}, n = 0;
        list.forEach(function (e) {
          if (e.updated > maxU) maxU = e.updated;
          var iso = new Date(e.updated).toISOString();
          if (e.deleted) gone[e.id] = iso; else add.push({ id: e.id, title: e.title, date: e.date, time: e.time, place: e.place, note: e.note, poster: e.poster || 0, updated: iso });
        });
        if (add.length) n += mergeEvents(add);
        if (Object.keys(gone).length) { var before = storedEvents(), after = before.filter(function (e) { return !(gone[e.id] && e.updated <= gone[e.id]); }); n += before.length - after.length; store.set('events', after); }
        var pulledTop = maxU ? new Date(maxU).toISOString() : '';
        cset(function (x) { x.evPull = maxU; if (pulledTop > (x.evPush || '')) x.evPush = pulledTop; });   // do not send pulled events straight back
        return n;
      });
  }
  function cloudEvDel(e) {   // called when an event is removed on this phone: the deletion travels as a tombstone
    if (!isSynced() || !e || e.builtin) return;
    cset(function (x) { x.evDel = (x.evDel || []).concat([{ id: e.id, title: e.title, date: e.date, time: e.time || '', place: e.place || '', note: e.note || '', updated: new Date().toISOString() }]); });
    schedulePush();
  }
  function cloudSync(opts) {
    opts = opts || {};
    var c = cst();
    if (c.state !== 'member' || !c.code) return Promise.resolve(null);
    if (cloudBusy) { if (opts.force || opts.pushOnly) cloudAgain = cloudAgain || (opts.force ? 'force' : 'push'); return Promise.resolve(null); }
    if (!opts.force && !opts.pushOnly && c.lastSync && Date.now() - Date.parse(c.lastSync) < SYNC_EVERY) return Promise.resolve(null);
    cloudBusy = true; paintSyncStatus();
    return cloud().then(function (api) {
      if (!api.user()) throw { code: 'signed-out' };
      var first = !opts.pushOnly && (!c.role || opts.force || c.lastFull !== dayNum(new Date())) ? pullRoles(api, c.code) : Promise.resolve();
      return first.then(function () { return pushMe(api, cst()); }).then(function () {
        if (opts.pushOnly) return (c.evDel || []).length || storedEvents().some(function (e) { return e.updated > (c.evPush || ''); }) ? syncEvents(api, cst()).then(function () { return null; }) : null;
        var full = cst().lastFull !== dayNum(new Date()) || !getMe();   // a device without My card looks at every card, so it can find its own
        var info = full || opts.force ? api.getBatch(c.code).then(function (b) { if (b) cset(function (x) { x.name = b.name || x.name; x.tmdbKey = okTmdbKey(b.tmdbKey); }); }).catch(function () {}) : Promise.resolve();
        return info.then(function () { return pullCards(api, cst(), full); })
          .then(function (r) { return pullParts(api, cst(), full || opts.force).then(function (n) { if (n) r.updated += n; return r; }); })
          .then(function (r) { return syncEvents(api, cst()).then(function (n) { r.events = n; return r; }); })
          .then(function (r) { return syncDD(api, cst(), full || !!opts.force).then(function (n) { r.events = (r.events || 0) + n; return r; }); });
      });
    }).then(function (r) {
      cloudBusy = false; again();
      cset(function (x) { if (!opts.pushOnly) x.lastSync = new Date().toISOString(); x.lastErr = ''; });
      var changed = r && (r.added || r.updated || r.removed || r.events || r.me);
      if (r && r.me) { rebuildIndex(); toast(t('bt.sync.gotMe')); if (currentKey() === 'me') route({ keepScroll: true }); }
      if (r && opts.force) syncFlash = changed ? tf('bt.sync.result', { added: r.added, updated: r.updated, removed: r.removed }) : t('bt.sync.upToDate');
      if (changed) { rebuildIndex(); if (SAFE_RERENDER.indexOf(currentKey()) >= 0) route({ keepScroll: true }); else toast(tf('bt.sync.result', { added: r.added, updated: r.updated, removed: r.removed })); }
      else if (currentKey() === 'sync') route({ keepScroll: true });
      return r;
    }).catch(function (e) {
      cloudBusy = false; again();
      cset(function (x) { x.lastErr = errText(e); });
      if (e && /permission/i.test(String(e.code || ''))) {   // perhaps removed from the batch: find out
        return cloud().then(function (api) { return api.status(c.code); }).then(function (st) {
          if (st !== 'member') cset(function (x) { x.state = st === 'pending' ? 'pending' : 'removed'; });
        }).catch(function () {}).then(function () { if (currentKey() === 'sync') route({ keepScroll: true }); });
      }
      if (currentKey() === 'sync') route({ keepScroll: true });
    });
  }
  function again() { setTimeout(paintSyncStatus, 0); var a = cloudAgain; cloudAgain = ''; if (a) setTimeout(function () { cloudSync(a === 'force' ? { force: true } : { pushOnly: true }); }, 50); }
  function schedulePush() { clearTimeout(pushTimer); pushTimer = setTimeout(function () { cloudSync({ pushOnly: true }); }, 3000); }
  var syncStarted = false;
  function cloudAfterRoute() {
    paintSyncBtn();
    var c0 = cst();
    if (c0.state === 'pending' && c0.code && !syncStarted) {   // waiting for approval: look once per app start
      syncStarted = true;
      cloud().then(function (api) { if (!api.user()) return; return api.status(c0.code).then(function (s) { if (s !== 'member') return; cset(function (x) { x.state = 'member'; }); toast(t('bt.sync.approved')); cloudSync({ force: true }); }); }).catch(function () {});
      return;
    }
    if (!isSynced()) return;
    if (!syncStarted) { syncStarted = true; setTimeout(function () { cloudSync(); }, 600); return; }
    var me = getMe(), c = cst();
    if ((me && pushKey(me, c.consent || {}) !== c.pushKey) || (c.evDel || []).length) schedulePush();
    else if (storedEvents().some(function (e) { return e.updated > (c.evPush || ''); })) schedulePush();
  }
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'visible') cloudSync(); });
  function paintSyncStatus() {
    paintSyncBtn();
    var el = document.getElementById('sy-last'); if (!el) return;
    el.textContent = syncLastText();
  }
  /* 1.20.0: cloud button in the top bar — shows the sync state; tap = Sync now (or open Cloud sync when not set up) */
  function syncBtnState() {
    var c = cst();
    if (c.state === 'pending' && c.code) return 'pending';
    if (c.state === 'removed') return 'off';
    if (!isSynced()) return 'off';
    if (cloudBusy) return 'busy';
    if (c.lastErr) return 'err';
    return 'ok';
  }
  function paintSyncBtn() {
    var b = document.getElementById('sync-btn'); if (!b) return;
    var s = syncBtnState(), c = cst();
    var label = s === 'ok' ? (c.lastSync ? tf('bt.sync.tb.ok', { when: fmtWhen(c.lastSync) }) : t('bt.sync.tb.okNever')) : t('bt.sync.tb.' + s);
    b.className = 'icon-btn sync-btn is-' + s;
    b.setAttribute('aria-label', label); b.title = label;
    b.setAttribute('aria-busy', s === 'busy' ? 'true' : 'false');
  }
  (function addSyncBtn() {
    var anchor = document.getElementById('textSizeBtn'); if (!anchor || document.getElementById('sync-btn')) return;
    var b = document.createElement('button');
    b.type = 'button'; b.id = 'sync-btn'; b.className = 'icon-btn sync-btn';
    b.innerHTML = icon('cloud', 'sync-btn__ico') + '<span class="sync-btn__dot" aria-hidden="true"></span>';
    anchor.parentNode.insertBefore(b, anchor);
    b.addEventListener('click', function () {
      var s = syncBtnState();
      if (s === 'off' || s === 'pending') { location.hash = '#/sync'; return; }
      if (s === 'busy') return;
      cloudSync({ force: true }).then(function (r) {
        var c = cst();
        if (r) { var ch = r.added || r.updated || r.removed || r.events; toast(ch ? tf('bt.sync.result', { added: r.added, updated: r.updated, removed: r.removed }) : t('bt.sync.upToDate')); }
        else if (c.lastErr) toast(t('bt.sync.tb.err'));
        paintSyncBtn();
      });
    });
    paintSyncBtn();
  })();
  function syncLastText() {
    var c = cst();
    if (cloudBusy) return t('bt.sync.busy');
    return c.lastSync ? tf('bt.sync.last', { when: fmtWhen(c.lastSync) }) : t('bt.sync.never');
  }
  function fmtWhen(iso) { var d = new Date(iso); if (isNaN(d.getTime())) return ''; return d.toLocaleDateString(locale(), { month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' }); }

  /* ---- #/sync screen ---- */
  VIEWS.sync = function () {
    var c = cst(), head = pageHead('sync', 'nav.sync', 'bt.sync.intro'), u = cUser();
    if (!cloudApi) return head + '<div class="card sync__box">' + (cloudLoadErr ? '<p class="is-error">' + esc(cloudLoadErr) + '</p><p><button type="button" class="btn btn--solid" id="sy-retry">' + esc(t('bt.sync.retry')) + '</button></p>' : '<p class="muted">' + esc(t('bt.sync.loading')) + '</p>') + '</div></div>';
    var flash = syncFlash ? '<p class="form__status" role="status">' + esc(syncFlash) + '</p>' : ''; syncFlash = '';
    var who = u ? '<p class="sync__who">' + icon('cloud', 'sync__ico') + '<span>' + esc(tf('bt.sync.signedInAs', { email: u.email })) + '</span> <button type="button" class="link-btn" id="sy-out">' + esc(t('bt.sync.signOut')) + '</button></p>' : '';
    var status = '<p class="form__status" id="sy-status" role="status" aria-live="polite"></p>';
    if (!u) return head + '<div class="card sync__box"><h2>' + esc(t('bt.sync.step1')) + '</h2><p>' + esc(t('bt.sync.signInText')) + '</p><p><button type="button" class="btn btn--solid" id="sy-in">' + esc(t('bt.sync.signIn')) + '</button></p>' + status + '</div>' + privacyNote() + '</div>';
    if (c.state === 'pending' && c.code) return head + who + '<div class="card sync__box"><h2>' + esc(t('bt.sync.pendingH')) + '</h2><p>' + esc(tf('bt.sync.pendingText', { name: c.name || fmtCode(c.code) })) + '</p><p class="form__acts"><button type="button" class="btn btn--solid" id="sy-check">' + esc(t('bt.sync.checkAgain')) + '</button> <button type="button" class="btn" id="sy-cancel">' + esc(t('bt.sync.cancelReq')) + '</button></p>' + status + '</div></div>';
    if (c.state !== 'member' || !c.code) {
      return head + who + (c.state === 'removed' ? '<div class="callout callout--caution"><p>' + esc(t('bt.sync.removed')) + '</p></div>' : '') +
        '<form class="card sync__box" id="sy-join"><h2>' + esc(t('bt.sync.joinH')) + '</h2><p>' + esc(t('bt.sync.joinText')) + '</p>' +
        '<label class="field"><span class="field__l">' + esc(t('bt.sync.code')) + '</span><input type="text" name="code" autocomplete="off" autocapitalize="characters" spellcheck="false" maxlength="14" placeholder="ABCD-2345" inputmode="text"></label>' +
        '<p class="form__acts"><button type="submit" class="btn btn--solid">' + esc(t('bt.sync.join')) + '</button></p>' + status + '</form>' +
        (u.owner ? '<form class="card sync__box" id="sy-create"><h2>' + esc(t('bt.sync.createH')) + '</h2><p>' + esc(t('bt.sync.createText')) + '</p><label class="field"><span class="field__l">' + esc(t('bt.batchName')) + '</span><input type="text" name="bname" maxlength="60" value="' + esc(batchName()) + '" placeholder="Batch 2027"></label><p class="form__acts"><button type="submit" class="btn">' + esc(t('bt.sync.create')) + '</button></p><div id="sy-mine"></div></form>' : '') +
        privacyNote() + '</div>';
    }
    var con = c.consent || {}, me = getMe();
    var html = head + who + flash +
      '<section class="card sync__box"><h2>' + esc(c.name || t('bt.sync.batch')) + '</h2>' +
        '<p>' + esc(t('bt.sync.memberText')) + '</p>' +
        '<p class="sync__code">' + esc(t('bt.sync.inviteCode')) + ' <strong>' + esc(fmtCode(c.code)) + '</strong> <button type="button" class="link-btn" id="sy-copy">' + esc(t('bt.sync.copy')) + '</button></p>' +
        '<p class="form__acts"><button type="button" class="btn btn--solid" id="sy-now">' + esc(t('bt.sync.now')) + '</button> <span class="muted" id="sy-last">' + esc(syncLastText()) + '</span></p>' +
        (c.lastErr ? '<p class="is-error">' + esc(c.lastErr) + '</p>' : '') +
        (!me ? '<p class="callout"><a href="#/me">' + esc(t('bt.sync.needCard')) + '</a></p>' : '') + status +
      '</section>' +
      '<section class="card sync__box"><h2>' + esc(t('bt.sync.consentH')) + '</h2><p>' + esc(t('bt.sync.consentText')) + '</p>' +
        PRIV.map(function (g) { return '<label class="sync__tick"><input type="checkbox" name="consent" value="' + esc(g) + '"' + (con[g] ? ' checked' : '') + '> <span><strong>' + esc(groupLabel(g)) + '</strong><span class="field__h">' + esc(t('bt.sync.consent.' + g)) + '</span></span></label>'; }).join('') +
      '</section>' +
      (u.admin ? '<section class="card sync__box" id="sy-admin"><h2>' + esc(t('bt.sync.adminH')) + '</h2>' + adminHTML() + '</section>' : '') +
      '<section class="card sync__box"><h2>' + esc(t('bt.sync.leaveH')) + '</h2><p>' + esc(t('bt.sync.leaveText')) + '</p><p><button type="button" class="btn" id="sy-leave">' + esc(t('bt.sync.leave')) + '</button></p></section>' +
      privacyNote() + '</div>';
    return html;
  };
  function privacyNote() { return '<div class="callout sync__privacy"><p><strong>' + esc(t('bt.sync.privacyH')) + '</strong></p><ul>' + [1, 2, 3, 4].map(function (i) { return '<li>' + esc(t('bt.sync.privacy' + i)) + '</li>'; }).join('') + '</ul></div>'; }
  function adminHTML() {
    if (!syncAdmin) return '<p class="muted">' + esc(t('bt.sync.loading')) + '</p>';
    if (syncAdmin.err) return '<p class="is-error">' + esc(syncAdmin.err) + '</p>';
    var u = cUser() || {};
    return '<h3>' + esc(t('bt.sync.requests')) + ' (' + syncAdmin.requests.length + ')</h3>' +
      (syncAdmin.requests.length ? '<ul class="sync__list sync__list--adm">' + syncAdmin.requests.map(function (r) { return '<li data-row="' + esc(r.uid) + '"><span><strong>' + esc(r.name || '—') + '</strong><span class="muted">' + esc(r.email) + '</span></span>' + admFields(r) + '<span class="form__acts"><button type="button" class="btn btn--solid btn--sm" data-approve="' + esc(r.uid) + '">' + esc(t('bt.sync.approve')) + '</button><button type="button" class="btn btn--sm" data-decline="' + esc(r.uid) + '">' + esc(t('bt.sync.decline')) + '</button></span></li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(t('bt.sync.noRequests')) + '</p>') +
      '<h3>' + esc(t('bt.sync.members')) + ' (' + syncAdmin.members.length + ')</h3><p class="field__h">' + esc(t('pt.adm.hint')) + '</p><ul class="sync__list sync__list--adm">' + syncAdmin.members.map(function (m) { return '<li data-row="' + esc(m.uid) + '"><span><strong>' + esc(m.name || '—') + '</strong>' + (m.admin || isOwnerEmail(m.email) ? ' <span class="badge">' + esc(t('pt.adm.admin')) + '</span>' : '') + '<span class="muted">' + esc(m.email) + '</span></span>' + admFields(m) + '<span class="form__acts"><button type="button" class="btn btn--sm" data-savem="' + esc(m.uid) + '">' + esc(t('pt.adm.save')) + '</button>' + (u.owner && !isOwnerEmail(m.email) ? '<button type="button" class="btn btn--sm" data-adminm="' + esc(m.uid) + '">' + esc(t(m.admin ? 'pt.adm.unmake' : 'pt.adm.make')) + '</button>' : '') + (m.uid === u.uid ? '<span class="muted">' + esc(t('bt.sync.you')) + '</span>' : '<button type="button" class="btn btn--sm" data-unmember="' + esc(m.uid) + '">' + esc(t('bt.sync.remove')) + '</button>') + '</span></li>'; }).join('') + '</ul>' +
      '<p><button type="button" class="link-btn" id="sy-adm-reload">' + esc(t('bt.sync.reload')) + '</button></p>' +
      '<form id="sy-tmdb" class="sync__tmdb"><h3>' + esc(t('bt.sync.tmdbH')) + '</h3><p class="field__h">' + esc(t(cst().tmdbKey ? 'bt.sync.tmdbSet' : 'bt.sync.tmdbText')) + '</p>' +
        '<label class="field"><span class="field__l">' + esc(t('bt.sync.tmdbKey')) + '</span><input type="text" name="key" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="' + esc(cst().tmdbKey ? '••••••••' + cst().tmdbKey.slice(-4) : '32 letters and numbers') + '"></label>' +
        '<p class="form__acts"><button type="submit" class="btn btn--sm">' + esc(t('bt.sync.tmdbSave')) + '</button>' + (cst().tmdbKey ? ' <button type="button" class="link-btn" id="sy-tmdb-rm">' + esc(t('bt.sync.tmdbRemove')) + '</button>' : '') + '</p><p class="form__status" id="sy-tmdb-st" role="status"></p></form>';
  }
  function loadAdmin(api, code) {
    return Promise.all([api.requests(code), api.members(code)]).then(function (r) {
      syncAdmin = { requests: r[0].sort(function (a, b) { return a.created - b.created; }), members: r[1].sort(function (a, b) { return a.name.localeCompare(b.name); }) };
    }).catch(function (e) { syncAdmin = { err: errText(e), requests: [], members: [] }; }).then(function () { if (currentKey() === 'sync') route({ keepScroll: true }); });
  }
  function myName() { var me = getMe(), u = cUser(); return (me && me.name) || (u && u.name) || ''; }
  function isOwnerEmail(e) { return (CCFG.admins || []).map(function (x) { return String(x).toLowerCase(); }).indexOf(String(e || '').toLowerCase()) >= 0; }
  function admFields(m) {   // position + batch year, editable by an admin (in a request before approving, or on a member)
    return '<span class="adm-f"><label><span class="sr-only">' + esc(t('pt.pos.label')) + '</span><select data-f="role">' + ['resident', 'consultant', 'alumni'].map(function (r) { return '<option value="' + r + '"' + ((m.role || 'resident') === r ? ' selected' : '') + '>' + esc(t('pt.pos.' + r)) + '</option>'; }).join('') + '</select></label>' +
      '<label><span class="sr-only">' + esc(t('pt.pos.startYear')) + '</span><input data-f="batch" type="number" inputmode="numeric" min="1980" max="2100" placeholder="' + esc(t('pt.pos.batchPh')) + '" title="' + esc(t('pt.pos.startYear')) + '" value="' + (m.batch || '') + '"></label></span>';
  }
  function admRead(uid) {
    var row = main.querySelector('[data-row="' + uid + '"]'), role = row ? row.querySelector('[data-f="role"]').value : 'resident', batch = row ? toInt(row.querySelector('[data-f="batch"]').value, 1980, 2100) : 0;
    return { role: role, batch: role === 'consultant' ? 0 : batch };
  }
  function pullRoles(api, code) {   // who I am here (role, batch, admin) and who everyone else is; once a day and on Sync now
    return (api.self ? api.self(code) : Promise.resolve(null)).then(function (me) {
      if (me) cset(function (x) { x.role = me.role; x.batch = me.batch; x.admin = me.admin; });
      return api.members(code);
    }).then(function (list) {
      var roles = {}; list.forEach(function (m) { roles[m.uid] = { role: m.role || 'resident', batch: +m.batch || 0, admin: !!m.admin }; });
      store.set('roles', roles);
    }).catch(function () {});
  }
  function pullParts(api, c, full) {   // restricted fields I may read; kept apart from the cards (store `parts`) and laid over them when shown
    if (!api.partsSince) return Promise.resolve(0);
    var canRes = (c.role || 'resident') !== 'consultant', year = canRes ? (+c.batch || 0) : 0;
    if (!canRes && !year) { store.del('parts'); return Promise.resolve(0); }
    return api.partsSince(c.code, full ? -1 : (c.partPull || 0), canRes, year).then(function (list) {
      var parts = full ? {} : (store.get('parts', {}) || {}), maxU = c.partPull || 0, n = 0;
      list.forEach(function (d) {
        if (d.updated > maxU) maxU = d.updated;
        var f = {}; Object.keys(d.fields || {}).forEach(function (k) { if (FIELD_BY[k] && typeof d.fields[k] === 'string') f[k] = cleanText(d.fields[k], MAX_TEXT); });
        parts[d.id] = parts[d.id] || {}; parts[d.id][d.aud] = f; n++;
      });
      store.set('parts', parts); cset(function (x) { x.partPull = maxU; });
      return full ? 0 : n;
    }).catch(function () { return 0; });
  }
  AFTER.sync = function () {
    var c = cst(), st = document.getElementById('sy-status');
    function say(m, err) { if (!st) return; st.textContent = m; st.classList.toggle('is-error', !!err); }
    function busy(btn, on) { if (btn) btn.disabled = !!on; }
    function on(id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', function () { fn(el); }); }
    if (!cloudApi) {
      if (!cloudLoadErr) cloud().then(function () { if (currentKey() === 'sync') route({ keepScroll: true }); }, function () { if (currentKey() === 'sync') route({ keepScroll: true }); });
      on('sy-retry', function () { cloudLoadErr = ''; route({ keepScroll: true }); });
      return;
    }
    var api = cloudApi, u = api.user();
    on('sy-in', function (b) { busy(b, true); say(t('bt.sync.signingIn')); api.signIn().then(function () { route({ keepScroll: true }); }, function (e) { busy(b, false); say(errText(e), true); }); });
    on('sy-out', function () { if (!window.confirm(t('bt.sync.confirmOut'))) return; api.signOut().then(function () { cset(function (x) { var keep = x.consent; Object.keys(x).forEach(function (k) { delete x[k]; }); if (keep) x.consent = keep; }); syncAdmin = null; route({ keepScroll: true }); }); });
    var jf = document.getElementById('sy-join');
    if (jf) jf.addEventListener('submit', function (e) {
      e.preventDefault();
      var code = normCode(jf.code.value), btn = jf.querySelector('button[type=submit]');
      if (code.length < 6) { say(t('bt.sync.badCode'), true); return; }
      busy(btn, true); say(t('bt.sync.checking'));
      api.getBatch(code).then(function (b) {
        if (!b) throw { code: 'no-batch' };
        return api.status(code).then(function (s) {
          if (s === 'none') { var mc0 = getMe() || {}; return api.request(code, { name: myName(), role: mc0.pos || 'resident', batch: mc0.pos === 'consultant' ? 0 : (+mc0.startYear || 0) }).then(function () { return 'pending'; }); }
          return s;
        }).then(function (s) {
          cset(function (x) { x.code = code; x.name = b.name || ''; x.tmdbKey = okTmdbKey(b.tmdbKey); x.state = s; x.lastPull = 0; x.lastFull = -1; x.evPull = 0; x.lastSync = ''; x.pushKey = ''; x.partPull = 0; });
          if (s === 'member') { if (!batchName() && b.name) store.set('batchName', b.name); cloudSync({ force: true }); }
          route({ keepScroll: true });
        });
      }).catch(function (e2) { busy(btn, false); say(e2 && e2.code === 'no-batch' ? t('bt.sync.noBatch') : errText(e2), true); });
    });
    var cf = document.getElementById('sy-create');
    if (cf) {
      cf.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = cleanText(cf.bname.value, 60) || ((window.HOSPITAL || {}).shortName || '') + ' Psychiatry', code = newCode(), btn = cf.querySelector('button[type=submit]');
        busy(btn, true);
        var mc1 = getMe() || {};
        api.createBatch(code, name, { name: myName(), role: mc1.pos || 'resident', batch: mc1.pos === 'consultant' ? 0 : (+mc1.startYear || 0) }).then(function () {
          cset(function (x) { x.code = code; x.name = name; x.state = 'member'; x.lastPull = 0; x.lastFull = -1; x.evPull = 0; x.lastSync = ''; x.pushKey = ''; x.partPull = 0; });
          if (!batchName()) store.set('batchName', name);
          syncAdmin = null; cloudSync({ force: true }); route({ keepScroll: true });
        }).catch(function (e2) { busy(btn, false); say(errText(e2), true); });
      });
      var mine = document.getElementById('sy-mine');
      if (mine && u && u.owner) api.myBatches().then(function (list) {
        if (!list.length || !document.getElementById('sy-mine')) return;
        mine.innerHTML = '<p class="field__h">' + esc(t('bt.sync.existing')) + '</p><p class="form__acts">' + list.map(function (b) { return '<button type="button" class="btn btn--sm" data-open="' + esc(b.code) + '">' + esc((b.name || 'Batch') + ' · ' + fmtCode(b.code)) + '</button>'; }).join('') + '</p>';
        mine.querySelectorAll('[data-open]').forEach(function (b) { b.addEventListener('click', function () { var jc = document.querySelector('#sy-join [name=code]'); if (jc) { jc.value = fmtCode(b.getAttribute('data-open')); jf.requestSubmit ? jf.requestSubmit() : jf.dispatchEvent(new Event('submit', { cancelable: true })); } }); });
      }).catch(function () {});
    }
    on('sy-check', function (b) {
      busy(b, true);
      api.status(c.code).then(function (s) {
        cset(function (x) { x.state = s === 'none' ? 'removed' : s; });
        if (s === 'member') { syncFlash = t('bt.sync.approved'); cloudSync({ force: true }); }
        else if (s === 'pending') syncFlash = '';
        route({ keepScroll: true });
        if (s === 'pending') { var st2 = document.getElementById('sy-status'); if (st2) st2.textContent = t('bt.sync.stillPending'); }
      }).catch(function (e) { busy(b, false); say(errText(e), true); });
    });
    on('sy-cancel', function () { api.cancelRequest(c.code).catch(function () {}).then(function () { cset(function (x) { x.state = ''; x.code = ''; }); route({ keepScroll: true }); }); });
    on('sy-now', function (b) { busy(b, true); cset(function (x) { x.lastErr = ''; }); cloudSync({ force: true }).then(function () { var nb = document.getElementById('sy-now'); if (nb) nb.disabled = false; }); });
    on('sy-copy', function () { var txt = fmtCode(c.code); if (navigator.clipboard) navigator.clipboard.writeText(txt).then(function () { toast(t('bt.sync.copied')); }, function () {}); });
    main.querySelectorAll('input[name="consent"]').forEach(function (box) {
      box.addEventListener('change', function () {
        var g = box.value, v = box.checked;
        if (v && !window.confirm(t('bt.sync.consentConfirm.' + g))) { box.checked = false; return; }
        cset(function (x) { x.consent = x.consent || {}; x.consent[g] = v; });
        if (getMe()) saveMe(function () {});   // bumps `updated` so batchmates pull the change
        say(v ? t('bt.sync.consentOn') : t('bt.sync.consentOff'));
        cloudSync({ pushOnly: true });
      });
    });
    on('sy-leave', function (b) {
      if (!window.confirm(t('bt.sync.confirmLeave'))) return;
      busy(b, true);
      api.leave(c.code).then(function () { cset(function (x) { ['code', 'name', 'state', 'pushKey', 'lastPull', 'lastFull', 'syncIds', 'evPush', 'evPull', 'evDel', 'lastSync', 'lastErr', 'role', 'batch', 'admin', 'partYear', 'partPull', 'ddPull'].forEach(function (k) { delete x[k]; }); }); store.del('dd'); store.del('parts'); store.del('roles'); store.del('owners'); syncAdmin = null; toast(t('bt.sync.left')); route({ keepScroll: true }); })
        .catch(function (e) { busy(b, false); say(errText(e), true); });
    });
    if (u && u.admin && c.state === 'member' && c.code) {
      if (!syncAdmin) { loadAdmin(api, c.code); return; }
      on('sy-adm-reload', function () { syncAdmin = null; route({ keepScroll: true }); });
      var tf0 = document.getElementById('sy-tmdb'), tst = document.getElementById('sy-tmdb-st');
      function saveKey(k) { tst.textContent = t('bt.sync.checking'); api.setBatchInfo(c.code, { tmdbKey: k }).then(function () { cset(function (x) { x.tmdbKey = k; }); store.del('tmdb'); toast(t(k ? 'bt.sync.tmdbSaved' : 'bt.sync.tmdbRemoved')); route({ keepScroll: true }); }, function (e) { tst.textContent = errText(e); tst.classList.add('is-error'); }); }
      if (tf0) tf0.addEventListener('submit', function (e) { e.preventDefault(); var k = okTmdbKey(tf0.key.value); if (!k) { tst.textContent = t('bt.sync.tmdbBad'); tst.classList.add('is-error'); return; } saveKey(k); });
      on('sy-tmdb-rm', function () { if (window.confirm(t('bt.sync.tmdbConfirmRm'))) saveKey(''); });
      main.querySelectorAll('[data-approve]').forEach(function (b) { b.addEventListener('click', function () { var uid = b.getAttribute('data-approve'), r = syncAdmin.requests.filter(function (x) { return x.uid === uid; })[0]; if (!r) return; var rv = admRead(uid); r.role = rv.role; r.batch = rv.batch; b.disabled = true; api.approve(c.code, r).then(function () { toast(tf('bt.sync.approvedX', { name: r.name || r.email })); loadAdmin(api, c.code); }, function (e) { b.disabled = false; say(errText(e), true); }); }); });
      main.querySelectorAll('[data-decline]').forEach(function (b) { b.addEventListener('click', function () { var uid = b.getAttribute('data-decline'), r = syncAdmin.requests.filter(function (x) { return x.uid === uid; })[0]; if (!r || !window.confirm(tf('bt.sync.confirmDecline', { name: r.name || r.email }))) return; b.disabled = true; api.decline(c.code, uid).then(function () { loadAdmin(api, c.code); }, function (e) { b.disabled = false; say(errText(e), true); }); }); });
      main.querySelectorAll('[data-savem]').forEach(function (b) { b.addEventListener('click', function () { var uid = b.getAttribute('data-savem'), m = syncAdmin.members.filter(function (x) { return x.uid === uid; })[0]; if (!m) return; var v = admRead(uid); b.disabled = true; api.setMember(c.code, uid, { role: v.role, batch: v.batch }).then(function () { toast(tf('pt.adm.saved', { name: m.name || m.email })); if (uid === u.uid) cloudSync({ force: true }); loadAdmin(api, c.code); }, function (e) { b.disabled = false; say(errText(e), true); }); }); });
      main.querySelectorAll('[data-adminm]').forEach(function (b) { b.addEventListener('click', function () { var uid = b.getAttribute('data-adminm'), m = syncAdmin.members.filter(function (x) { return x.uid === uid; })[0]; if (!m) return; if (!window.confirm(tf(m.admin ? 'pt.adm.confirmUnmake' : 'pt.adm.confirmMake', { name: m.name || m.email }))) return; b.disabled = true; api.setMember(c.code, uid, { admin: !m.admin, role: m.role, batch: m.batch }).then(function () { loadAdmin(api, c.code); }, function (e) { b.disabled = false; say(errText(e), true); }); }); });
      main.querySelectorAll('[data-unmember]').forEach(function (b) { b.addEventListener('click', function () { var uid = b.getAttribute('data-unmember'), m = syncAdmin.members.filter(function (x) { return x.uid === uid; })[0]; if (!m || !window.confirm(tf('bt.sync.confirmRemove', { name: m.name || m.email }))) return; b.disabled = true; api.removeMember(c.code, uid, m.batch).then(function () { loadAdmin(api, c.code); }, function (e) { b.disabled = false; say(errText(e), true); }); }); });
    }
  };
  TITLES.sync = function () { return t('nav.sync'); };
  (function () {   // Home: nudge to join while this phone is not syncing
    var home0 = VIEWS.home;
    VIEWS.home = function () {
      var html = home0.apply(null, arguments), c = cst();
      if (isSynced()) return html;
      var strip = '<a class="card sync-strip" href="#/sync">' + icon('cloud', 'sync-strip__ico') + '<span class="em-strip__t"><strong>' + esc(t(c.state === 'pending' ? 'bt.sync.homePendingH' : 'bt.sync.homeH')) + '</strong><span>' + esc(t(c.state === 'pending' ? 'bt.sync.homePending' : 'bt.sync.home')) + '</span></span></a>';
      return html.indexOf('<div class="home__stats">') >= 0 ? html.replace('<div class="home__stats">', strip + '<div class="home__stats">') : html.replace(/(<\/header>)/, '$1' + strip);
    };
  })();

  /* ===================== 1.19.0: SPOTIFY PLAYER, SHOW INFO (TMDB), PETS =====================
     Spotify: open.spotify.com links play in an embedded Spotify player on the Home playlist card (online only;
     spotify.link short links can't be embedded and keep the Open button). Show of the day: blurb + still from TMDB
     (data/tmdb.js key; cached per title for 30 days under store key `tmdb`, filled in after the Home renders).
     Pets: card key `petList` [{id,name,kind,breed,note,photo}] ≤ PET_MAX, edited one pet at a time on #/pets. */
  ICONS.paw = '<circle cx="6.5" cy="10" r="1.7"/><circle cx="10" cy="6" r="1.7"/><circle cx="14.5" cy="6" r="1.7"/><circle cx="18" cy="10" r="1.7"/><path d="M8 17.6c0-2.7 1.9-5.1 4.2-5.1s4.2 2.4 4.2 5.1c0 1.7-1.4 2.4-2.6 2.1-1.1-.3-2.1-.3-3.2 0-1.2.3-2.6-.4-2.6-2.1z"/>';
  var PET_KINDS = ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'turtle', 'other'], PET_MAX = 8;
  (function () { for (var i = 0; i < NAV.length; i++) if (NAV[i].href === '#/picks') { NAV.splice(i + 1, 0, { label: 'Pets', tkey: 'nav.pets', href: '#/pets', icon: 'paw', group: 'Screens' }); return; } })();
  function cleanPets(arr) {
    var seen = {};
    return (Array.isArray(arr) ? arr : []).map(function (p, i) {
      if (!p || typeof p !== 'object') return null;
      var id = cleanText(p.id, 40).replace(/[^\w-]/g, '') || 'pet' + i; if (seen[id]) id += '-' + i; seen[id] = 1;
      var x = { id: id, name: cleanText(p.name, 40), kind: PET_KINDS.indexOf(p.kind) >= 0 ? p.kind : 'other', breed: cleanText(p.breed, 60), note: cleanText(p.note, 200) };
      if (okPhoto(p.photo)) x.photo = p.photo;
      return x.name ? x : null;
    }).filter(Boolean).slice(0, PET_MAX);
  }
  var sanitizeFun0 = sanitizeFun;
  sanitizeFun = function (c, out) { sanitizeFun0(c, out); var pl = cleanPets(c.petList); if (pl.length) out.petList = pl; };
  FUN_KEYS.push('petList');
  function petsOf(c) { return (c && c.petList) || []; }
  function petCard(p, owner, ctl) {
    return '<article class="card pet">' + (p.photo ? '<img class="pet__img" src="' + esc(p.photo) + '" alt="' + esc(p.name) + '">' : '<span class="pet__img pet__img--none">' + icon('paw', 'pet__ico') + '</span>') +
      '<div class="pet__body"><h3>' + esc(p.name) + '</h3><p class="pet__kind">' + esc([t('bt.pets.k.' + p.kind), p.breed].filter(Boolean).join(' · ')) + '</p>' +
      (p.note ? '<p class="pet__note">' + esc(p.note) + '</p>' : '') +
      (owner ? '<p class="pet__owner"><a href="#/person/' + encodeURIComponent(owner.id) + '">' + avatar(owner, 'avatar--xs') + esc(tf('bt.pets.of', { name: short(owner) })) + '</a></p>' : '') +
      (ctl ? '<p class="pet__acts"><button type="button" class="btn btn--sm" data-petedit="' + esc(p.id) + '">' + esc(t('bt.pets.editBtn')) + '</button>' + (ctl.i > 0 ? '<button type="button" class="btn btn--sm" data-petup="' + ctl.i + '">' + esc(t('bt.pets.up')) + '</button>' : '') + '<button type="button" class="link-btn" data-petrm="' + esc(p.id) + '">' + esc(t('bt.pets.remove')) + '</button></p>' : '') +
      '</div></article>';
  }
  var petEdit = '', petPhoto = null, petDraft = {};
  function petReset() { petEdit = ''; petPhoto = null; petDraft = {}; }
  VIEWS.pets = function () {
    var me = getMe(), html = pageHead('pets', 'nav.pets', 'bt.pets.intro');
    if (me) {
      var list = petsOf(me), ed = petEdit ? list.filter(function (p) { return p.id === petEdit; })[0] : null;
      if (petEdit && !ed) petReset();
      var d = petDraft, ph = petPhoto !== null ? petPhoto : (ed && ed.photo) || '';
      html += '<h2>' + esc(t('bt.pets.mine')) + '</h2>' +
        (list.length ? '<div class="pet-grid">' + list.map(function (p, i) { return petCard(p, null, { i: i }); }).join('') + '</div>' : '<p class="muted">' + esc(t('bt.pets.noneMine')) + '</p>');
      if (list.length >= PET_MAX && !ed) html += '<p class="muted">' + esc(tf('bt.pets.max', { n: PET_MAX })) + '</p>';
      else html += '<form class="card pet-form" id="pet-form" novalidate><h3>' + esc(t(ed ? 'bt.pets.edit' : list.length ? 'bt.pets.addAnother' : 'bt.pets.add')) + '</h3>' +
        '<div class="form__photo"><div>' + (ph ? '<img class="pet__thumb" src="' + esc(ph) + '" alt="">' : '<span class="pet__thumb pet__img--none">' + icon('paw', 'pet__ico') + '</span>') + '</div><div>' +
          '<input type="file" id="pet-photo" class="sr-only" accept="image/*"><label class="btn" for="pet-photo">' + icon('camera', 'btn__ico') + esc(t(ph ? 'bt.pets.photoChange' : 'bt.pets.photo')) + '</label> ' +
          (ph ? '<button type="button" class="link-btn" id="pet-photo-rm">' + esc(t('bt.me.removePhoto')) + '</button>' : '') + '</div></div>' +
        '<label class="field"><span class="field__l">' + esc(t('bt.pets.name')) + ' *</span><input type="text" name="name" maxlength="40" required value="' + esc(d.name != null ? d.name : ed ? ed.name : '') + '"></label>' +
        '<label class="field"><span class="field__l">' + esc(t('bt.pets.kind')) + '</span><select name="kind">' + PET_KINDS.map(function (k) { var cur = d.kind || (ed ? ed.kind : 'dog'); return '<option value="' + k + '"' + (cur === k ? ' selected' : '') + '>' + esc(t('bt.pets.k.' + k)) + '</option>'; }).join('') + '</select></label>' +
        '<label class="field"><span class="field__l">' + esc(t('bt.pets.breed')) + '</span><input type="text" name="breed" maxlength="60" placeholder="' + esc(t('bt.pets.breedPh')) + '" value="' + esc(d.breed != null ? d.breed : ed ? ed.breed : '') + '"></label>' +
        '<label class="field"><span class="field__l">' + esc(t('bt.pets.note')) + '</span><textarea name="note" maxlength="200" rows="2" placeholder="' + esc(t('bt.pets.notePh')) + '">' + esc(d.note != null ? d.note : ed ? ed.note : '') + '</textarea></label>' +
        '<p class="form__acts"><button type="submit" class="btn btn--solid">' + esc(t(ed ? 'bt.pets.saveEdit' : 'bt.pets.save')) + '</button>' + (ed || d.name || ph ? ' <button type="button" class="btn" id="pet-cancel">' + esc(t('bt.pets.cancel')) + '</button>' : '') + '</p>' +
        '<p class="form__status" id="pet-status" role="status" aria-live="polite"></p></form>';
    } else html += needCard();
    var owners = allCards().filter(function (c) { return !isMe(c) && petsOf(c).length; }), n = owners.reduce(function (s, c) { return s + petsOf(c).length; }, 0);
    html += '<h2>' + esc(t('bt.pets.batchH')) + '</h2>' + (n ? '<p class="muted">' + esc(tf(n === 1 ? 'bt.pets.count1' : 'bt.pets.countN', { n: n })) + '</p><div class="pet-grid">' + owners.map(function (c) { return petsOf(c).map(function (p) { return petCard(p, c); }).join(''); }).join('') + '</div>' : '<p class="muted">' + esc(t('bt.pets.none')) + '</p>');
    return html + '</div>';
  };
  AFTER.pets = function () {
    var f = document.getElementById('pet-form');
    if (f) {
      var st = document.getElementById('pet-status');
      var keep = function () { petDraft = { name: f.name.value, kind: f.kind.value, breed: f.breed.value, note: f.note.value }; };
      f.addEventListener('input', keep); f.addEventListener('change', keep);
      var fi = document.getElementById('pet-photo');
      fi.addEventListener('change', function () {
        var file = fi.files && fi.files[0]; fi.value = ''; if (!file) return;
        keep(); st.textContent = t('bt.pets.photoBusy');
        shrinkPhoto(file, function (data) { if (!data) { st.textContent = t('bt.me.photoTooBig'); return; } petPhoto = data; route({ keepScroll: true }); });
      });
      var rmp = document.getElementById('pet-photo-rm'); if (rmp) rmp.addEventListener('click', function () { keep(); petPhoto = ''; route({ keepScroll: true }); });
      var cn = document.getElementById('pet-cancel'); if (cn) cn.addEventListener('click', function () { petReset(); route({ keepScroll: true }); });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = cleanText(f.name.value, 40);
        if (!name) { st.textContent = t('bt.pets.needName'); st.classList.add('is-error'); f.name.focus(); return; }
        var list = petsOf(getMe()), ed = petEdit ? list.filter(function (p) { return p.id === petEdit; })[0] : null;
        var ph = petPhoto !== null ? petPhoto : (ed && ed.photo) || '';
        var pet = { id: ed ? ed.id : newId(), name: name, kind: f.kind.value, breed: cleanText(f.breed.value, 60), note: cleanText(f.note.value, 200) };
        if (ph) pet.photo = ph;
        saveMe(function (me) { var l = (me.petList || []).slice(); if (ed) l = l.map(function (p) { return p.id === ed.id ? pet : p; }); else l.push(pet); me.petList = l; });
        petReset(); route({ keepScroll: true }); toast(tf('bt.pets.saved', { name: name }));
      });
    }
    main.querySelectorAll('[data-petedit]').forEach(function (b) { b.addEventListener('click', function () {
      var p = petsOf(getMe()).filter(function (x) { return x.id === b.getAttribute('data-petedit'); })[0]; if (!p) return;
      petEdit = p.id; petPhoto = null; petDraft = {}; route({ keepScroll: true });
      var nf = document.getElementById('pet-form'); if (nf) { nf.scrollIntoView({ block: 'start', behavior: 'smooth' }); nf.name.focus({ preventScroll: true }); }
    }); });
    main.querySelectorAll('[data-petup]').forEach(function (b) { b.addEventListener('click', function () { var i = +b.getAttribute('data-petup'); saveMe(function (me) { var l = (me.petList || []).slice(); if (i > 0 && i < l.length) { var x = l[i]; l[i] = l[i - 1]; l[i - 1] = x; } me.petList = l; }); route({ keepScroll: true }); }); });
    main.querySelectorAll('[data-petrm]').forEach(function (b) { b.addEventListener('click', function () {
      var id = b.getAttribute('data-petrm'), p = petsOf(getMe()).filter(function (x) { return x.id === id; })[0]; if (!p || !window.confirm(tf('bt.pets.confirmRemove', { name: p.name }))) return;
      saveMe(function (me) { me.petList = (me.petList || []).filter(function (x) { return x.id !== id; }); }); if (petEdit === id) petReset(); route({ keepScroll: true });
    }); });
  };
  TITLES.pets = function () { return t('nav.pets'); };
  (function () {
    var person0 = VIEWS.person;
    VIEWS.person = function (id) {
      var html = person0.apply(null, arguments), c = findPerson(String(id || ''));
      if (!c || !petsOf(c).length) return html;
      var sec = '<h2>' + esc(t('bt.pets.personH')) + '</h2><div class="pet-grid">' + petsOf(c).map(function (p) { return petCard(p); }).join('') + '</div>' + (isMe(c) ? '<p><a class="btn" href="#/pets">' + icon('paw', 'btn__ico') + esc(t('bt.pets.manage')) + '</a></p>' : '');
      var em = html.indexOf('<h2>' + esc(groupLabel('emergency')) + '</h2>'), i = em >= 0 ? em : html.lastIndexOf('<p class="person__foot');
      return i < 0 ? html + sec : html.slice(0, i) + sec + html.slice(i);
    };
    var rb0 = rebuildIndex;
    rebuildIndex = function () {
      rb0();
      allCards().forEach(function (c) { petsOf(c).forEach(function (p) { SEARCH_INDEX.push({ title: p.name, text: [t('bt.pets.k.' + p.kind), p.breed, p.note, tf('bt.pets.of', { name: c.name })].filter(Boolean).join(' · '), href: '#/person/' + encodeURIComponent(c.id), kind: t('nav.pets') }); }); });
    };
    var about0 = VIEWS.about;
    VIEWS.about = function () { var html = about0.apply(null, arguments), k = '<h2>' + esc(t('about.settings')) + '</h2>'; return html.replace(k, '<p class="muted tmdb-note">' + esc(t('bt.tmdb.notice')) + '</p>' + k); };
    var home1 = AFTER.home;
    AFTER.home = function () { home1.apply(null, arguments); fillShowInfo(); };
  })();

  /* ---- Spotify player ---- */
  function spotifyEmbed(url) {
    var m = /^https:\/\/open\.spotify\.com\/(?:intl-[a-z]{2}(?:-[a-z]{2})?\/)?(playlist|album|track|artist|show|episode)\/([A-Za-z0-9]{10,40})/i.exec(String(url || ''));
    return m ? 'https://open.spotify.com/embed/' + m[1].toLowerCase() + '/' + m[2] + '?utm_source=generator' : '';
  }
  function spotifyPlayer(url, label) {
    var src = spotifyEmbed(url); if (!src || navigator.onLine === false) return '';
    return '<iframe class="today__embed" src="' + esc(src) + '" title="' + esc(tf('bt.pl.embedTitle', { name: label })) + '" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe>';
  }

  /* ---- Show info from TMDB ---- */
  var TMDB = window.TMDB_CONFIG || {}, TMDB_DAYS = 30, tmdbBusy = {};
  function okTmdbKey(k) { k = String(k || '').trim(); return /^[a-f0-9]{32}$/i.test(k) || /^[\w.-]{60,1200}$/.test(k) ? k : ''; }
  function tmdbKey() { return okTmdbKey(TMDB.key) || okTmdbKey(cst().tmdbKey); }   // file key (dev/tests) or the batch's key from Cloud sync
  function tmdbAll() { var c = store.get('tmdb', {}); return c && typeof c === 'object' ? c : {}; }
  function tmdbGet(title) { var c = tmdbAll()[String(title).toLowerCase()]; return c && Date.now() - (c.at || 0) < TMDB_DAYS * 864e5 ? c : null; }
  function tmdbPut(title, info) {
    var all = tmdbAll(); all[String(title).toLowerCase()] = info;
    var ks = Object.keys(all); if (ks.length > 80) ks.sort(function (a, b) { return (all[a].at || 0) - (all[b].at || 0); }).slice(0, ks.length - 80).forEach(function (k) { delete all[k]; });
    store.set('tmdb', all);
  }
  function tmdbFetch(title) {
    var key = tmdbKey(); if (!key || navigator.onLine === false || !window.fetch) return Promise.resolve(null);
    var bearer = key.length > 40, url = 'https://api.themoviedb.org/3/search/multi?include_adult=false&language=en-US&page=1&query=' + encodeURIComponent(title) + (bearer ? '' : '&api_key=' + encodeURIComponent(key));
    return fetch(url, bearer ? { headers: { Authorization: 'Bearer ' + key, accept: 'application/json' } } : undefined)
      .then(function (r) { if (!r.ok) throw new Error('tmdb ' + r.status); return r.json(); })
      .then(function (j) {
        var lo = String(title).toLowerCase(), hits = (j && j.results || []).filter(function (x) { return x.media_type === 'tv' || x.media_type === 'movie'; });
        var exact = hits.filter(function (x) { return String(x.name || x.title || '').toLowerCase() === lo; });
        var pool = exact.length ? exact : hits, h = pool.filter(function (x) { return x.media_type === 'tv'; })[0] || pool[0];
        var info = h ? { at: Date.now(), id: h.id, type: h.media_type, name: cleanText(h.name || h.title, 120), year: String(h.first_air_date || h.release_date || '').slice(0, 4), ov: clip(h.overview || '', 420), img: /^\/[\w.-]+$/.test(h.backdrop_path || '') ? h.backdrop_path : '', poster: /^\/[\w.-]+$/.test(h.poster_path || '') ? h.poster_path : '' } : { at: Date.now(), none: true };
        tmdbPut(title, info); return info;
      });
  }
  function showInfoHTML(info) {
    if (!info || info.none) return '';
    var img = info.img ? 'https://image.tmdb.org/t/p/w780' + info.img : info.poster ? 'https://image.tmdb.org/t/p/w342' + info.poster : '';
    return (img ? '<img class="today__still' + (info.img ? '' : ' today__still--poster') + '" src="' + esc(img) + '" alt="' + esc(tf('bt.tmdb.alt', { title: info.name })) + '" loading="lazy">' : '') +
      (info.ov ? '<p class="today__blurb">' + esc(info.ov) + '</p>' : '') +
      '<p class="today__credit">' + esc(info.name + (info.year ? ' (' + info.year + ')' : '')) + ' · ' + esc(t('bt.tmdb.credit')) + ' <a href="https://www.themoviedb.org/' + (info.type === 'movie' ? 'movie' : 'tv') + '/' + (+info.id || 0) + '" target="_blank" rel="noopener">TMDB</a></p>';
  }
  function fillShowInfo() {
    main.querySelectorAll('[data-tmdb]').forEach(function (box) {
      var title = box.getAttribute('data-tmdb');
      var wire = function () { var im = box.querySelector('img'); if (im) im.addEventListener('error', function () { im.remove(); }); };
      if (box.getAttribute('data-filled')) { wire(); return; }
      if (tmdbBusy[title]) return; tmdbBusy[title] = 1;
      tmdbFetch(title).then(function (info) {
        delete tmdbBusy[title];
        var cur = main.querySelector('[data-tmdb="' + (window.CSS && CSS.escape ? CSS.escape(title) : title) + '"]');
        if (cur && info) { cur.innerHTML = showInfoHTML(info); cur.setAttribute('data-filled', '1'); box = cur; wire(); }
      }).catch(function () { delete tmdbBusy[title]; });
    });
  }
  function showInfoBox(title) {
    var info = tmdbGet(title);
    return '<div class="today__media" data-tmdb="' + esc(title) + '"' + (info ? ' data-filled="1"' : '') + '>' + showInfoHTML(info) + '</div>';
  }

  /* ===================== 1.21.0: CHAT (stage 1) =====================
     Batch chat channels in Firestore (Spark plan): batches/{code}/channels/{id} {name, emoji, order, by, created, last, lastName}
     and …/channels/{id}/messages/{mid} {uid, cardId, name, text, links[], img{data,w,h}, sticker, replyTo{id,name,text}, created, react{key:[uid]}}.
     Only the OPEN channel has a realtime listener (newest CHAT_PAGE, "Load older" pages more); the channel list and the
     unread dots are a one-shot read on #/chat and after each cloud sync. Photos are shrunk in the browser and stored in the
     message (no Cloud Storage). Stickers ship with the app (data/stickers.js). Phone-only store keys: `chatSeen` {ch: ms},
     `chatCh` (last channel list, for the unread badge). Any member may open a channel; its creator or the admin renames or
     deletes it; authors, the channel's creator and the admin delete messages; Report flags a message to the admin. */
  ICONS.send = '<path d="M4 12l16-8-6 16-2.5-6.5z"/><path d="M11.5 13.5L20 4"/>';
  ICONS.smile = '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14.5c.9 1.3 2.1 2 3.5 2s2.6-.7 3.5-2"/><path d="M9 9.8v.2M15 9.8v.2"/>';
  ICONS.clip = '<path d="M20 11.5l-7.8 7.8a4.6 4.6 0 0 1-6.5-6.5l8.2-8.2a3 3 0 0 1 4.3 4.3l-8.2 8.2a1.5 1.5 0 0 1-2.1-2.1l7.5-7.5"/>';
  ICONS.x = '<path d="M6 6l12 12M18 6L6 18"/>';
  var CHAT_PAGE = 30, CHAT_TEXT = 2000, CHAT_IMG = CCFG.chatImgMax || 400000, CHAT_STALE = 60 * 1000;
  var CHAT_DEFAULTS = [['general', 'general', '💬'], ['memes', 'memes', '😂'], ['kain', 'kain', '🍜'], ['mariveles', 'Mariveles', '🌊'], ['psych', 'psych', '🧠'], ['nerd', 'nerd', '🤓'], ['daldal', 'daldal', '🗣️'], ['boardgames', 'boardgames', '🎲'], ['tv', 'TV', '📺'], ['anime', 'anime', '🍥'], ['movie', 'movie', '🎬'], ['music', 'music', '🎵'], ['news', 'news', '📰'], ['duty', 'duty', '🏥'], ['help', 'help', '🆘'], ['books', 'books', '📚'], ['announcements', 'announcements', '📣'], ['kudos', 'kudos', '🙌'], ['residents', 'residents', '🩺', 'res']];
  var CHAT_ADDED = [];   // 1.21.3: starting channels added after a batch already has its list; the admin's phone opens each once (store chatAddedDone), so a deleted one is not recreated by that phone
  var REACTS = [['like', '👍'], ['love', '❤️'], ['haha', '😂'], ['wow', '😮'], ['sad', '😢'], ['pray', '🙏']];
  var STICKER_SETS = Array.isArray(window.STICKERS) ? window.STICKERS : [];
  var chatList = null, chatListAt = 0, chatListErr = '', chatListBusy = false, chatReports = null;
  var chatOpen = null, chatReply = null, chatImg = null, chatStkSet = '', chatMakingDefaults = false;
  (function () { for (var i = 0; i < NAV.length; i++) if (NAV[i].href === '#/emergency') { NAV.splice(i + 1, 0, { label: 'Chat', tkey: 'nav.chat', href: '#/chat', icon: 'chat', group: 'Screens', badge: 'chat' }); return; } })();

  function chatSeen() { var s = store.get('chatSeen', null); return s && typeof s === 'object' ? s : {}; }
  function chatMarkSeen(ch, ms) { if (!ch || !ms) return; var s = chatSeen(); if ((s[ch] || 0) < ms) { s[ch] = ms; store.set('chatSeen', s); } }
  function cachedChannels() { var l = chatList || store.get('chatCh', null); return Array.isArray(l) ? l : []; }
  function isUnread(c) { return (c.last || 0) > (chatSeen()[c.id] || 0); }
  function unreadCount() { return isSynced() ? cachedChannels().filter(isUnread).length : 0; }
  var updateNavBadges0 = updateNavBadges;
  updateNavBadges = function () {
    updateNavBadges0();
    var n = unreadCount(), els = document.querySelectorAll('[data-badge="chat"]');
    for (var i = 0; i < els.length; i++) { els[i].textContent = n > 9 ? '9+' : n; els[i].hidden = !n; }
  };
  function chName(c) { return '#' + (c ? c.name : ''); }
  function chById(id) { var l = cachedChannels(); for (var i = 0; i < l.length; i++) if (l[i].id === id) return l[i]; return null; }
  function chSort(a, b) { return (b.id === 'announcements') - (a.id === 'announcements') || (a.order || 0) - (b.order || 0) || (a.created || 0) - (b.created || 0) || String(a.name).localeCompare(String(b.name)); }
  function slugCh(name) { return String(name || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 24); }
  function cleanChName(v) { return String(v || '').replace(/^#+/, '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 30); }

  var chatBatchTried = {};
  function myAuds() { var c = cst(), a = ['all']; if ((c.role || 'resident') !== 'consultant') { a.push('res'); if (+c.batch) a.push('b' + (+c.batch)); } return a; }
  function audName(a) { return a === 'res' ? t('pt.aud.res') : /^b\d{4}$/.test(a) ? tf('pt.aud.batchN', { year: a.slice(1) }) : t('pt.aud.all'); }
  function audTag(a) { return a && a !== 'all' ? ' <span class="badge aud-tag">' + icon('lock', 'aud-tag__ico') + esc(audName(a)) + '</span>' : ''; }
  ICONS.lock = '<rect x="5" y="10.5" width="14" height="9.5" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>';
  function chatRule() { return '<div class="callout callout--caution chat-rule"><p><strong>' + esc(t('pt.chat.ruleH')) + '</strong> ' + esc(t('pt.chat.rule')) + '</p></div>'; }
  function chatSweep(api, code, ch) {   // an admin's phone clears photos older than the keep period, at most once a day per channel
    var u = api.user(), days = CCFG.chatImgKeepDays || 90, done = store.get('chatSweep', {}) || {}, today = dayNum(new Date());
    if (!u || !u.admin || !api.chatOldPhotos || done[ch] === today) return;
    done[ch] = today; store.set('chatSweep', done);
    api.chatOldPhotos(code, ch, Date.now() - days * 86400000, 100).then(function (ids) { ids.forEach(function (mid) { api.chatDelete(code, ch, mid).catch(function () {}); }); }).catch(function () {});
  }
  function loadChannels(force) {   // one read of the channel list; the admin's phone opens the starting channels the first time
    var c = cst();
    if (!isSynced() || chatListBusy) return Promise.resolve(null);
    if (!force && chatList && Date.now() - chatListAt < CHAT_STALE) return Promise.resolve(chatList);
    chatListBusy = true;
    return cloud().then(function (api) {
      return api.chatChannels(c.code, myAuds()).then(function (list) {
        var u = api.user(), yr = (cst().role || 'resident') !== 'consultant' ? (+cst().batch || 0) : 0;
        // each batch gets its own private channel, opened by the first member of that batch who looks at Chat
        if (list.length && yr && !list.some(function (x) { return x.id === 'batch-' + yr; }) && !chatBatchTried[yr]) {
          chatBatchTried[yr] = 1;
          return api.chatCreateChannels(c.code, [{ id: 'batch-' + yr, name: 'batch-' + yr, emoji: '🎓', order: 90, aud: 'b' + yr }]).then(function () { return api.chatChannels(c.code, myAuds()); }, function () { return list; });
        }
        if (!list.length && u && u.admin && !chatMakingDefaults) {
          chatMakingDefaults = true;
          return api.chatCreateChannels(c.code, CHAT_DEFAULTS.map(function (d, i) { return { id: d[0], name: d[1], emoji: d[2], order: i + 1, aud: d[3] || 'all' }; }))
            .then(function () { return api.chatChannels(c.code, myAuds()); });
        }
        var done = store.get('chatAddedDone', []); if (!Array.isArray(done)) done = [];
        var have = list.map(function (x) { return x.id; }), add = CHAT_ADDED.filter(function (id) { return have.indexOf(id) < 0 && done.indexOf(id) < 0; });
        if (list.length && u && u.admin && add.length && !chatMakingDefaults) {
          chatMakingDefaults = true;
          var rows = CHAT_DEFAULTS.map(function (d, i) { return { id: d[0], name: d[1], emoji: d[2], order: i + 1, aud: d[3] || 'all' }; }).filter(function (r) { return add.indexOf(r.id) >= 0; });
          return api.chatCreateChannels(c.code, rows).then(function () {
            chatMakingDefaults = false; store.set('chatAddedDone', done.concat(add)); return api.chatChannels(c.code, myAuds());
          }, function () { chatMakingDefaults = false; return list; });
        }
        if (list.length && u && u.admin) { var d2 = done.concat(CHAT_ADDED.filter(function (id) { return have.indexOf(id) >= 0 && done.indexOf(id) < 0; })); if (d2.length !== done.length) store.set('chatAddedDone', d2); }
        return list;
      });
    }).then(function (list) {
      chatListBusy = false; chatListErr = '';
      chatList = list.map(function (x) { return { id: x.id, name: cleanChName(x.name) || x.id, emoji: String(x.emoji || '').slice(0, 16), order: x.order || 0, by: x.by || '', aud: /^(all|res|b\d{4})$/.test(x.aud) ? x.aud : 'all', created: x.created || 0, last: x.last || 0, lastName: String(x.lastName || '').slice(0, 80) }; }).sort(chSort);
      chatListAt = Date.now(); store.set('chatCh', chatList); updateNavBadges();
      return chatList;
    }).catch(function (e) { chatListBusy = false; chatListErr = errText(e); return null; });
  }
  var cloudSync0 = cloudSync;   // unread dots refresh with every full sync (no extra listeners)
  cloudSync = function (opts) {
    return cloudSync0(opts).then(function (r) {
      if (r && !(opts && opts.pushOnly)) loadChannels(true).then(function () { if ((currentKey() === 'chat' && !parts()[1]) || currentKey() === 'home') route({ keepScroll: true }); });
      return r;
    });
  };

  /* ---- message pieces ---- */
  var URL_RE = /https?:\/\/[^\s<>"']+[^\s<>"'.,;:!?)\]]/gi;
  function findLinks(text) { var m = String(text || '').match(URL_RE) || []; return m.filter(function (u, i) { return m.indexOf(u) === i && u.length <= 600; }).slice(0, 5); }
  function linkify(text) {
    var s = String(text || ''), out = '', last = 0, m; URL_RE.lastIndex = 0;
    while ((m = URL_RE.exec(s))) { out += esc(s.slice(last, m.index)) + '<a href="' + esc(m[0]) + '" target="_blank" rel="noopener noreferrer">' + esc(m[0].length > 60 ? m[0].slice(0, 57) + '…' : m[0]) + '</a>'; last = m.index + m[0].length; }
    return out + esc(s.slice(last));
  }
  function ytId(u) {
    var h = u.hostname.replace(/^(www|m|music)\./, '');
    if (h === 'youtu.be') return u.pathname.slice(1, 12);
    if (h !== 'youtube.com') return '';
    if (u.pathname === '/watch') return (u.searchParams.get('v') || '').slice(0, 11);
    var m = /^\/(shorts|embed|live)\/([\w-]{11})/.exec(u.pathname); return m ? m[2] : '';
  }
  function linkInfo(url) {   // our own preview card per service: no server, no page scraping
    var u; try { u = new URL(url); } catch (e) { return null; }
    if (!/^https?:$/.test(u.protocol)) return null;
    var h = u.hostname.replace(/^www\./, ''), p = u.pathname, short = (h + (p.length > 1 ? p : '')).slice(0, 48);
    var yt = ytId(u);
    if (/^[\w-]{11}$/.test(yt)) return { kind: 'youtube', ico: '▶️', name: 'YouTube', sub: short, thumb: 'https://i.ytimg.com/vi/' + yt + '/hqdefault.jpg', embed: 'https://www.youtube-nocookie.com/embed/' + yt };
    if (h === 'open.spotify.com') return { kind: 'spotify', ico: '🎧', name: 'Spotify', sub: short, embed: spotifyEmbed(url) };
    if (h === 'spotify.link') return { kind: 'spotify', ico: '🎧', name: 'Spotify', sub: short };
    if (/(^|\.)tiktok\.com$/.test(h)) return { kind: 'tiktok', ico: '🎵', name: 'TikTok', sub: short };
    if (h === 'drive.google.com') return { kind: 'drive', ico: '📁', name: 'Google Drive', sub: short };
    if (h === 'docs.google.com') { var k = (/^\/(document|spreadsheets|presentation|forms)\//.exec(p) || [])[1]; return { kind: 'drive', ico: '📄', name: { document: 'Google Docs', spreadsheets: 'Google Sheets', presentation: 'Google Slides', forms: 'Google Forms' }[k] || 'Google Docs', sub: short }; }
    if (/(^|\.)netflix\.com$/.test(h)) return { kind: 'netflix', ico: '🍿', name: 'Netflix', sub: short };
    if (h === 'maps.app.goo.gl' || (h === 'goo.gl' && /^\/maps/.test(p)) || (/^(maps\.)?google\.[a-z.]+$/.test(h) && (/^\/maps/.test(p) || /^maps\./.test(h)))) return { kind: 'maps', ico: '📍', name: 'Google Maps', sub: short };
    if (/(^|\.)(facebook\.com|fb\.watch)$/.test(h)) return { kind: 'fb', ico: '👥', name: 'Facebook', sub: short };
    if (/(^|\.)instagram\.com$/.test(h)) return { kind: 'ig', ico: '📷', name: 'Instagram', sub: short };
    if (/(^|\.)(x\.com|twitter\.com)$/.test(h)) return { kind: 'x', ico: '💬', name: 'X', sub: short };
    if (/(^|\.)shopee\.ph$|(^|\.)lazada\.com\.ph$/.test(h)) return { kind: 'shop', ico: '🛍️', name: /shopee/.test(h) ? 'Shopee' : 'Lazada', sub: short };
    return { kind: 'web', ico: '🔗', name: h, sub: (p.length > 1 ? p : '').slice(0, 48) || h };
  }
  function linkCard(url, mid, i) {
    var L = linkInfo(url); if (!L) return '';
    var play = L.embed && navigator.onLine !== false ? '<button type="button" class="btn btn--sm lcard__play" data-play="' + esc(mid + ':' + i) + '">' + esc(t('bt.chat.playHere')) + '</button>' : '';
    return '<div class="lcard lcard--' + L.kind + '" data-embed="' + esc(L.embed || '') + '">' +
      (L.thumb ? '<a class="lcard__thumb" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><img src="' + esc(L.thumb) + '" alt="" loading="lazy"></a>' : '') +
      '<a class="lcard__a" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer"><span class="lcard__ico" aria-hidden="true">' + L.ico + '</span><span class="lcard__t"><strong>' + esc(L.name) + '</strong><span>' + esc(L.sub) + '</span></span></a>' + play + '</div>';
  }
  function okChatImg(im) { return im && typeof im.data === 'string' && /^data:image\/(jpeg|png|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(im.data) && im.data.length < 960000; }   // display accepts what older builds sent; sending is capped by CHAT_IMG
  function stickerOf(id) {
    var m = /^([a-z]+)\/(\d\d-[a-z-]+)$/.exec(String(id || '')); if (!m) return null;
    for (var i = 0; i < STICKER_SETS.length; i++) if (STICKER_SETS[i].set === m[1]) for (var j = 0; j < STICKER_SETS[i].items.length; j++) if (STICKER_SETS[i].items[j].id === m[2]) return STICKER_SETS[i].items[j];
    return null;
  }
  function chatTime(ms) { return new Date(ms).toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' }); }
  function chatDay(ms) {
    var d = new Date(ms), now = new Date(), y = new Date(); y.setDate(now.getDate() - 1);
    if (d.toDateString() === now.toDateString()) return t('bt.chat.today');
    if (d.toDateString() === y.toDateString()) return t('bt.chat.yesterday');
    return d.toLocaleDateString(locale(), { weekday: 'short', month: 'short', day: 'numeric', year: d.getFullYear() === now.getFullYear() ? undefined : 'numeric' });
  }
  function whenShort(ms) { if (!ms) return ''; var d = new Date(ms); return d.toDateString() === new Date().toDateString() ? chatTime(ms) : d.toLocaleDateString(locale(), { month: 'short', day: 'numeric' }); }
  function chatMsgs() {
    if (!chatOpen) return [];
    var seen = {}, all = chatOpen.live.concat(chatOpen.older).filter(function (m) { if (!m || !m.id || seen[m.id]) return false; seen[m.id] = 1; return true; });
    return all.sort(function (a, b) { return (a.created || 0) - (b.created || 0) || String(a.id).localeCompare(String(b.id)); });
  }
  function canDelete(m, u, ch) { return !!u && (m.uid === u.uid || u.admin || (ch && ch.by === u.uid)); }
  function msgHTML(m, prev, u) {
    var mine = u && m.uid === u.uid, who = m.cardId ? findPerson(m.cardId) : null, name = String(m.name || '—').slice(0, 80);
    var head = !prev || prev.uid !== m.uid || (m.created - prev.created) > 5 * 60 * 1000 || new Date(prev.created).toDateString() !== new Date(m.created).toDateString();
    var day = !prev || new Date(prev.created).toDateString() !== new Date(m.created).toDateString() ? '<li class="chat-day"><span>' + esc(chatDay(m.created)) + '</span></li>' : '';
    var body = '';
    if (m.replyTo && typeof m.replyTo === 'object') body += '<span class="chat-quote"><strong>' + esc(String(m.replyTo.name || '').slice(0, 80)) + '</strong> ' + esc(String(m.replyTo.text || '').slice(0, 140)) + '</span>';
    var stk = stickerOf(m.sticker);
    if (stk) body += '<img class="chat-stk" src="' + esc(stk.src) + '" alt="' + esc(stk.label) + '" width="160" height="160" loading="lazy">';
    if (okChatImg(m.img)) body += '<button type="button" class="chat-imgbtn" data-zoom="' + esc(m.id) + '"><img class="chat-img" src="' + esc(m.img.data) + '" alt="' + esc(t('bt.chat.photo')) + '"' + (m.img.w && m.img.h ? ' width="' + (+m.img.w) + '" height="' + (+m.img.h) + '"' : '') + ' loading="lazy"></button>';
    if (m.text) body += '<span class="chat-text">' + linkify(String(m.text).slice(0, CHAT_TEXT)) + '</span>';
    var links = (Array.isArray(m.links) ? m.links : []).filter(function (l) { return typeof l === 'string'; }).slice(0, 5);
    if (links.length) body += '<span class="chat-links">' + links.map(function (l, i) { return linkCard(l, m.id, i); }).join('') + '</span>';
    var react = m.react && typeof m.react === 'object' ? m.react : {};
    var chips = REACTS.filter(function (r) { return Array.isArray(react[r[0]]) && react[r[0]].length; }).map(function (r) {
      var on = u && react[r[0]].indexOf(u.uid) >= 0;
      return '<button type="button" class="chat-react' + (on ? ' is-on' : '') + '" data-react="' + esc(m.id + ':' + r[0]) + '" aria-pressed="' + !!on + '" aria-label="' + esc(tf('bt.chat.reactN', { emoji: r[1], n: react[r[0]].length })) + '">' + r[1] + ' ' + react[r[0]].length + '</button>';
    }).join('');
    var onlyStk = stk && !m.text && !okChatImg(m.img) && !m.replyTo;
    return day + '<li class="chat-msg' + (mine ? ' is-me' : '') + (head ? ' has-head' : '') + '" id="m-' + esc(m.id) + '">' +
      (head && !mine ? '<span class="chat-msg__av">' + (who ? '<a href="#/person/' + encodeURIComponent(who.id) + '">' + avatar(who, 'avatar--xs') + '</a>' : '<span class="avatar avatar--txt avatar--xs" aria-hidden="true">' + esc(initials(name)) + '</span>') + '</span>' : '') +
      '<div class="chat-msg__col">' +
        (head ? '<p class="chat-msg__h">' + (mine ? '' : '<strong>' + (who ? '<a href="#/person/' + encodeURIComponent(who.id) + '">' + esc(name) + '</a>' : esc(name)) + '</strong> ') + '<time>' + esc(chatTime(m.created)) + '</time></p>' : '') +
        '<div class="chat-bubble' + (onlyStk ? ' is-stk' : '') + '" data-msg="' + esc(m.id) + '">' + body + '</div>' +
        '<button type="button" class="chat-more" data-msg="' + esc(m.id) + '" aria-label="' + esc(tf('bt.chat.msgActions', { name: name })) + '">⋯</button>' +
        (chips ? '<div class="chat-reacts">' + chips + '</div>' : '') +
      '</div></li>';
  }

  /* ---- photos: shrink to ≤1280 px, WebP when the browser can make it, else JPEG; small GIFs stay as they are ---- */
  function chatPhoto(file, cb) {
    if (!file || !/^image\//.test(file.type || 'image/')) { cb(null); return; }
    if (file.type === 'image/gif' && file.size < 280000) { var fr = new FileReader(); fr.onload = function () { var img0 = new Image(); img0.onload = function () { cb({ data: fr.result, w: img0.width, h: img0.height }); }; img0.onerror = function () { cb(null); }; img0.src = fr.result; }; fr.onerror = function () { cb(null); }; fr.readAsDataURL(file); return; }
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      try {
        var scale = Math.min(1, 1024 / Math.max(img.width, img.height)), q = 0.8, out = '', w = 0, h = 0;
        for (var tries = 0; tries < 8; tries++) {
          w = Math.max(1, Math.round(img.width * scale)); h = Math.max(1, Math.round(img.height * scale));
          var cv = document.createElement('canvas'); cv.width = w; cv.height = h;
          var cx = cv.getContext('2d'); cx.fillStyle = '#fff'; cx.fillRect(0, 0, w, h); cx.drawImage(img, 0, 0, w, h);
          out = cv.toDataURL('image/webp', q); if (out.indexOf('data:image/webp') !== 0) out = cv.toDataURL('image/jpeg', q);
          if (out.length <= CHAT_IMG) break;
          if (q > 0.55) q -= 0.12; else scale *= 0.8;
        }
        URL.revokeObjectURL(url);
        cb(out.length <= CHAT_IMG ? { data: out, w: w, h: h } : null);
      } catch (e) { URL.revokeObjectURL(url); cb(null); }
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }

  /* ---- #/chat (channel list) and #/chat/<id> (one channel) ---- */
  function notMember() {
    return '<div class="card chat-join">' + icon('chat', 'chat-join__ico') + '<h2>' + esc(t('bt.chat.joinH')) + '</h2><p>' + esc(t('bt.chat.joinText')) + '</p><p><a class="btn btn--solid" href="#/sync">' + esc(t('bt.chat.joinBtn')) + '</a></p></div>';
  }
  VIEWS.chat = function (id) {
    if (id) return chatRoomView(id);
    var html = pageHead('chat', 'nav.chat', 'bt.chat.intro');
    if (!isSynced()) return html + notMember() + '</div>';
    var list = cachedChannels(), u = cUser();
    html += chatRule();
    if (!list.length) html += '<p class="muted" id="chat-loading">' + esc(chatListErr || t('bt.chat.loading')) + '</p>';
    else html += '<ul class="ch-list">' + list.map(function (c) {
      var un = isUnread(c);
      return '<li><a class="ch-row' + (un ? ' is-unread' : '') + '" href="#/chat/' + encodeURIComponent(c.id) + '"><span class="ch-row__e" aria-hidden="true">' + esc(c.emoji || '#') + '</span>' +
        '<span class="ch-row__t"><strong>' + esc(chName(c)) + audTag(c.aud) + (c.id === 'announcements' ? ' <span class="badge">' + esc(t('pt.ann.pinned')) + '</span>' : '') + '</strong><span>' + esc(c.last ? tf('bt.chat.lastBy', { name: c.lastName || '—', when: whenShort(c.last) }) : t('bt.chat.empty')) + '</span></span>' +
        (un ? '<span class="ch-dot"><span class="sr-only">' + esc(t('bt.chat.unread')) + '</span></span>' : '') + '</a></li>';
    }).join('') + '</ul>';
    if (chatListErr && list.length) html += '<p class="is-error">' + esc(chatListErr) + '</p>';
    html += '<details class="card ch-new"><summary>' + esc(t('bt.chat.newH')) + '</summary><form id="ch-new" novalidate><p class="field__h">' + esc(t('bt.chat.newText')) + '</p>' +
      (myAuds().length > 1 ? '<label class="field"><span class="field__l">' + esc(t('pt.chat.who')) + '</span><select name="aud">' + myAuds().map(function (a) { return '<option value="' + a + '">' + esc(audName(a)) + '</option>'; }).join('') + '</select><span class="field__h">' + esc(t('pt.chat.whoHint')) + '</span></label>' : '') +
      '<div class="ch-new__row"><label class="field field--sm ch-new__emoji"><span class="field__l">' + esc(t('bt.chat.emoji')) + '</span><input type="text" name="emoji" maxlength="8" placeholder="🎉" autocomplete="off"></label>' +
      '<label class="field"><span class="field__l">' + esc(t('bt.chat.chName')) + '</span><input type="text" name="name" maxlength="30" placeholder="ootd" autocomplete="off" autocapitalize="off"></label></div>' +
      '<p class="form__acts"><button type="submit" class="btn btn--solid">' + esc(t('bt.chat.create')) + '</button></p><p class="form__status" id="ch-new-st" role="status"></p></form></details>';
    if (u && u.admin) html += '<section class="card ch-reports"><h2>' + esc(t('bt.chat.reportsH')) + '</h2><div id="ch-reports">' + reportsHTML() + '</div></section>';
    html += '<p class="muted chat-note">' + esc(t('bt.chat.note')) + '</p>';
    return html + '</div>';
  };
  function reportsHTML() {
    if (!chatReports) return '<p class="muted">' + esc(t('bt.chat.loading')) + '</p>';
    if (chatReports.err) return '<p class="is-error">' + esc(chatReports.err) + '</p>';
    if (!chatReports.list.length) return '<p class="muted">' + esc(t('bt.chat.noReports')) + '</p>';
    return '<ul class="sync__list">' + chatReports.list.map(function (r) {
      var ch = chById(r.ch);
      return '<li><span><strong>' + esc(String(r.author || '—')) + '</strong> <span class="muted">' + esc(chName(ch || { name: r.ch })) + ' · ' + esc(tf('bt.chat.reportedBy', { name: r.reporter || '—' })) + '</span><span>' + esc(String(r.text || '')) + '</span></span>' +
        '<span class="form__acts"><a class="btn btn--sm" href="#/chat/' + encodeURIComponent(r.ch) + '">' + esc(t('bt.chat.open')) + '</a><button type="button" class="btn btn--sm" data-rdel="' + esc(r.id) + '">' + esc(t('bt.chat.deleteMsg')) + '</button><button type="button" class="link-btn" data-rok="' + esc(r.id) + '">' + esc(t('bt.chat.dismiss')) + '</button></span></li>';
    }).join('') + '</ul>';
  }
  function chatRoomView(id) {
    var ch = chById(id), u = cUser();
    var html = '<div class="wrap page chat-room"><p class="crumb"><a href="#/chat">' + esc(t('bt.chat.channels')) + '</a></p>';
    if (!isSynced()) return html + notMember() + '</div>';
    var mayEdit = ch && u && (u.admin || ch.by === u.uid);
    html += '<header class="chat-room__head"><h1><span aria-hidden="true">' + esc(ch ? ch.emoji || '#' : '#') + '</span> ' + esc(ch ? chName(ch) : '#' + id) + (ch ? audTag(ch.aud) : '') + '</h1>' +
      (mayEdit ? '<span class="form__acts"><button type="button" class="btn btn--sm" id="ch-rename">' + esc(t('bt.chat.rename')) + '</button><button type="button" class="link-btn" id="ch-del">' + esc(t('bt.chat.deleteCh')) + '</button></span>' : '') + '</header>' + chatRule() + (id === 'announcements' ? annPinsHTML() : '') +
      '<div class="chat-log"><p class="chat-older"><button type="button" class="btn btn--sm" id="chat-older" hidden>' + esc(t('bt.chat.older')) + '</button></p>' +
      '<ul class="chat-list" id="chat-list" aria-live="polite" aria-relevant="additions"><li class="muted chat-wait">' + esc(t('bt.chat.loading')) + '</li></ul></div>' +
      '<button type="button" class="btn btn--sm chat-newpill" id="chat-newpill" hidden>' + esc(t('bt.chat.newMsgs')) + ' ↓</button>' +
      '<form class="chat-compose" id="chat-form" autocomplete="off">' +
        '<div class="chat-compose__extra" id="chat-extra" hidden></div>' +
        '<div class="chat-stickers" id="chat-stk" hidden></div>' +
        '<div class="chat-compose__row">' +
          '<input type="file" id="chat-file" class="sr-only" accept="image/*"><label class="icon-btn chat-ibtn" for="chat-file" title="' + esc(t('bt.chat.addPhoto')) + '">' + icon('clip', 'chat-ibtn__ico') + '<span class="sr-only">' + esc(t('bt.chat.addPhoto')) + '</span></label>' +
          '<button type="button" class="icon-btn chat-ibtn" id="chat-stkbtn" aria-expanded="false" aria-controls="chat-stk" title="' + esc(t('bt.chat.stickers')) + '">' + icon('smile', 'chat-ibtn__ico') + '<span class="sr-only">' + esc(t('bt.chat.stickers')) + '</span></button>' +
          '<label class="sr-only" for="chat-text">' + esc(t('bt.chat.message')) + '</label><textarea id="chat-text" name="text" rows="1" maxlength="' + CHAT_TEXT + '" placeholder="' + esc(tf('bt.chat.placeholder', { ch: ch ? chName(ch) : '#' + id })) + '" enterkeyhint="send"></textarea>' +
          '<button type="submit" class="icon-btn chat-send" id="chat-send" title="' + esc(t('bt.chat.send')) + '">' + icon('send', 'chat-ibtn__ico') + '<span class="sr-only">' + esc(t('bt.chat.send')) + '</span></button>' +
        '</div><p class="form__status" id="chat-st" role="status"></p></form>' +
      '<div class="chat-sheet" id="chat-sheet" hidden role="dialog" aria-modal="true" aria-label="' + esc(t('bt.chat.actions')) + '"></div>' +
      '<div class="chat-zoom" id="chat-zoom" hidden role="dialog" aria-modal="true" aria-label="' + esc(t('bt.chat.photo')) + '"></div>';
    return html + '</div>';
  }
  function closeRoom() {
    if (chatOpen && chatOpen.unsub) { try { chatOpen.unsub(); } catch (e) {} }
    chatOpen = null; chatReply = null; chatImg = null;
    document.body.classList.remove('is-chat-room');
  }
  window.addEventListener('hashchange', function () {   // leaving the open channel stops its listener (runs before the router's handler)
    if (chatOpen && location.hash !== '#/chat/' + encodeURIComponent(chatOpen.ch) && location.hash !== '#/chat/' + chatOpen.ch) closeRoom();
  });
  function roomEnd() {   // page y where the composer's bottom edge sits (the footer comes after it)
    var f = document.getElementById('chat-form'), log = document.querySelector('.chat-log');
    if (!f || !log) return document.documentElement.scrollHeight;
    return log.getBoundingClientRect().bottom + window.scrollY + f.offsetHeight;
  }
  function nearBottom() { return window.innerHeight + window.scrollY >= roomEnd() - 160; }
  function toBottom() { window.scrollTo(0, Math.max(0, roomEnd() - window.innerHeight)); }
  function paintRoom(opts) {
    opts = opts || {};
    var ul = document.getElementById('chat-list'); if (!ul || !chatOpen) return;
    var u = cUser(), ch = chById(chatOpen.ch), list = chatMsgs(), wasBottom = nearBottom(), h0 = document.documentElement.scrollHeight, y0 = window.scrollY;
    ul.innerHTML = list.length ? list.map(function (m, i) { return msgHTML(m, list[i - 1], u); }).join('') : '<li class="muted chat-wait">' + esc(chatOpen.err || (chatOpen.loaded ? t('bt.chat.first') : t('bt.chat.loading'))) + '</li>';
    var ob = document.getElementById('chat-older'); if (ob) ob.hidden = !(chatOpen.more && list.length >= CHAT_PAGE);
    var newest = list.length ? list[list.length - 1] : null;
    if (newest) chatMarkSeen(chatOpen.ch, newest.created);
    if (opts.keep) { window.scrollTo(0, y0 + (document.documentElement.scrollHeight - h0)); return; }
    var mineNew = newest && u && newest.uid === u.uid && newest.id !== chatOpen.lastId;
    var isNew = newest && chatOpen.lastId && newest.id !== chatOpen.lastId;
    chatOpen.lastId = newest ? newest.id : '';
    var pill = document.getElementById('chat-newpill');
    if (opts.first || wasBottom || mineNew) { toBottom(); if (pill) pill.hidden = true; }
    else if (isNew && pill) pill.hidden = false;
    updateNavBadges();
  }
  function openRoom(id) {
    var c = cst();
    if (chatOpen && chatOpen.ch === id && chatOpen.unsub) { paintRoom({ first: true }); return; }
    closeRoom();
    var room = chatOpen = { ch: id, live: [], older: [], more: true, loaded: false, lastId: '', err: '', unsub: null };
    document.body.classList.add('is-chat-room');
    cloud().then(function (api) {
      if (chatOpen !== room) return;
      var first = true;
      chatSweep(api, c.code, id);
      room.unsub = api.chatListen(c.code, id, CHAT_PAGE, function (list) {
        if (chatOpen !== room) return;
        room.live = list; room.loaded = true; room.err = '';
        if (list.length < CHAT_PAGE && !room.older.length) room.more = false;
        paintRoom({ first: first }); first = false;
      }, function (e) { if (chatOpen !== room) return; room.err = errText(e); room.loaded = true; paintRoom(); });
      if (chatOpen !== room && room.unsub) room.unsub();
    }).catch(function (e) { if (chatOpen !== room) return; room.err = errText(e); room.loaded = true; paintRoom(); });
  }
  function msgById(mid) { var l = chatMsgs(); for (var i = 0; i < l.length; i++) if (l[i].id === mid) return l[i]; return null; }
  function chatSnippet(m) { var s = m.text ? String(m.text) : m.sticker ? '[' + ((stickerOf(m.sticker) || {}).label || t('bt.chat.sticker')) + ']' : m.img ? '[' + t('bt.chat.photo') + ']' : ''; return s.replace(/\s+/g, ' ').slice(0, 140); }
  function paintExtra() {
    var ex = document.getElementById('chat-extra'); if (!ex) return;
    var bits = '';
    if (chatReply) bits += '<div class="chat-extra__row"><span class="chat-quote"><strong>' + esc(tf('bt.chat.replyingTo', { name: chatReply.name })) + '</strong> ' + esc(chatReply.text) + '</span><button type="button" class="icon-btn" data-xrm="reply" aria-label="' + esc(t('bt.chat.cancelReply')) + '">' + icon('x') + '</button></div>';
    if (chatImg) bits += '<div class="chat-extra__row"><img class="chat-extra__img" src="' + esc(chatImg.data) + '" alt=""><span class="muted">' + esc(tf('bt.chat.photoReady', { kb: Math.round(chatImg.data.length * 0.75 / 1024) })) + '</span><button type="button" class="icon-btn" data-xrm="img" aria-label="' + esc(t('bt.chat.removePhoto')) + '">' + icon('x') + '</button></div>';
    ex.innerHTML = bits; ex.hidden = !bits;
  }
  function stickerSheet() {
    var cur = chatStkSet || (STICKER_SETS[0] && STICKER_SETS[0].set), s = STICKER_SETS.filter(function (x) { return x.set === cur; })[0];
    if (!s) return '';
    return '<div class="filters chat-stk__tabs" role="group">' + STICKER_SETS.map(function (x) { return '<button type="button" class="filter" data-stkset="' + esc(x.set) + '" aria-pressed="' + (x.set === cur) + '">' + esc(t('bt.chat.set.' + x.set)) + '</button>'; }).join('') + '</div>' +
      '<div class="chat-stk__grid">' + s.items.map(function (it) { return '<button type="button" class="chat-stk__b" data-stk="' + esc(s.set + '/' + it.id) + '" title="' + esc(it.label) + '"><img src="' + esc(it.src) + '" alt="' + esc(it.label) + '" loading="lazy" width="96" height="96"></button>'; }).join('') + '</div>';
  }
  function sendMsg(extra) {
    var c = cst(), form = document.getElementById('chat-form'), ta = document.getElementById('chat-text'), st = document.getElementById('chat-st');
    if (!chatOpen || !form) return;
    var text = extra && extra.sticker ? '' : cleanText(ta.value, CHAT_TEXT), room = chatOpen, me = getMe(), u = cUser();
    if (!text && !(extra && extra.sticker) && !chatImg) return;
    var msg = { cardId: me ? me.id : '', name: (me && me.name) || (u && u.name) || t('bt.chat.someone'), created: Date.now() };
    if (text) { msg.text = text; var ls = findLinks(text); if (ls.length) msg.links = ls; }
    if (extra && extra.sticker) msg.sticker = extra.sticker;
    else if (chatImg) msg.img = { data: chatImg.data, w: chatImg.w, h: chatImg.h };
    if (chatReply) msg.replyTo = { id: chatReply.id, name: chatReply.name, text: chatReply.text };
    var btn = document.getElementById('chat-send'); if (btn) btn.disabled = true;
    st.textContent = msg.img ? t('bt.chat.sending') : ''; st.classList.remove('is-error');
    cloud().then(function (api) { return api.chatSend(c.code, room.ch, msg); }).then(function () {
      chatMarkSeen(room.ch, msg.created);
      var l = chatList || []; l.forEach(function (x) { if (x.id === room.ch) { x.last = msg.created; x.lastName = msg.name; } }); if (chatList) store.set('chatCh', chatList);
      if (chatOpen !== room) return;
      if (!(extra && extra.sticker)) { ta.value = ''; chatImg = null; autoGrow(ta); }
      chatReply = null; paintExtra(); st.textContent = '';
      award('chatter');
    }).catch(function (e) { st.textContent = errText(e); st.classList.add('is-error'); }).then(function () { var b = document.getElementById('chat-send'); if (b) b.disabled = false; });
  }
  function autoGrow(ta) { if (!ta) return; ta.style.height = 'auto'; ta.style.height = Math.min(160, ta.scrollHeight + 2) + 'px'; }
  function openSheet(m) {
    var sh = document.getElementById('chat-sheet'), u = cUser(), ch = chById(chatOpen.ch); if (!sh || !m) return;
    var react = m.react || {};
    sh.innerHTML = '<div class="chat-sheet__in"><p class="chat-sheet__q">' + esc(chatSnippet(m) || '—') + '</p><div class="chat-sheet__reacts">' + REACTS.map(function (r) { var on = u && Array.isArray(react[r[0]]) && react[r[0]].indexOf(u.uid) >= 0; return '<button type="button" class="chat-sheet__r' + (on ? ' is-on' : '') + '" data-sreact="' + esc(r[0]) + '" aria-pressed="' + !!on + '">' + r[1] + '</button>'; }).join('') + '</div>' +
      '<div class="chat-sheet__acts"><button type="button" class="btn" data-sact="reply">' + esc(t('bt.chat.reply')) + '</button>' +
      (m.text ? '<button type="button" class="btn" data-sact="copy">' + esc(t('bt.chat.copy')) + '</button>' : '') +
      (canDelete(m, u, ch) ? '<button type="button" class="btn btn--danger" data-sact="delete">' + esc(t('bt.chat.deleteMsg')) + '</button>' : '') +
      (u && m.uid !== u.uid ? '<button type="button" class="btn" data-sact="report">' + esc(t('bt.chat.report')) + '</button>' : '') +
      '<button type="button" class="btn btn--solid" data-sact="close">' + esc(t('bt.chat.close')) + '</button></div></div>';
    sh.hidden = false; sh.setAttribute('data-mid', m.id);
    var first = sh.querySelector('button'); if (first) first.focus();
  }
  function closeSheet() { var sh = document.getElementById('chat-sheet'); if (sh) { sh.hidden = true; sh.innerHTML = ''; } }
  function react(mid, key) {
    var m = msgById(mid), u = cUser(), c = cst(); if (!m || !u || !chatOpen) return;
    var r = m.react = m.react && typeof m.react === 'object' ? m.react : {}, l = r[key] = Array.isArray(r[key]) ? r[key] : [], on = l.indexOf(u.uid) < 0;
    if (on) l.push(u.uid); else l.splice(l.indexOf(u.uid), 1);   // show it at once; the listener confirms
    paintRoom({ keep: true });
    cloud().then(function (api) { return api.chatReact(c.code, chatOpen.ch, mid, key, on); }).catch(function (e) { toast(errText(e)); });
  }
  AFTER.chat = function (id) {
    var c = cst();
    if (!isSynced()) return;
    if (!id) {
      closeRoom();
      if (!chatList || Date.now() - chatListAt > CHAT_STALE) loadChannels(true).then(function (l) { if (currentKey() === 'chat' && !parts()[1] && (l || chatListErr)) route({ keepScroll: true }); });
      var f = document.getElementById('ch-new'), st = document.getElementById('ch-new-st');
      if (f) f.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = cleanChName(f.name.value), emoji = String(f.emoji.value || '').trim().slice(0, 8), sid = slugCh(name), btn = f.querySelector('button[type=submit]');
        if (!name || !sid) { st.textContent = t('bt.chat.needName'); st.classList.add('is-error'); return; }
        btn.disabled = true; st.textContent = t('bt.chat.creating'); st.classList.remove('is-error');
        cloud().then(function (api) {
          return api.chatChannelExists(c.code, sid).then(function (ex) {
            if (ex) throw { code: 'exists' };
            return api.chatCreateChannels(c.code, [{ id: sid, name: name, emoji: emoji, order: 100, aud: f.aud && myAuds().indexOf(f.aud.value) >= 0 ? f.aud.value : 'all' }]);
          });
        }).then(function () { toast(tf('bt.chat.created', { ch: '#' + name })); return loadChannels(true); }).then(function () { location.hash = '#/chat/' + encodeURIComponent(sid); })
          .catch(function (e2) { btn.disabled = false; st.textContent = e2 && e2.code === 'exists' ? t('bt.chat.exists') : errText(e2); st.classList.add('is-error'); });
      });
      var u = cUser();
      if (u && u.admin) {
        wireReports();   // what we had, then a fresh look (one read per report)
        cloud().then(function (api) { return api.chatReports(c.code); }).then(function (l) { chatReports = { list: l.sort(function (a, b) { return (b.created || 0) - (a.created || 0); }) }; }, function (e) { chatReports = { err: errText(e), list: [] }; })
          .then(function () { var box = document.getElementById('ch-reports'); if (box) { box.innerHTML = reportsHTML(); wireReports(); } });
      }
      return;
    }
    if (!chById(id) && !chatListBusy) loadChannels(true).then(function () { if (currentKey() === 'chat' && parts()[1] === id && chById(id)) route({ keepScroll: true }); });   // a channel this phone hadn't seen yet: redraw with its name and buttons
    openRoom(id);
    setTimeout(toBottom, 30);
    var form = document.getElementById('chat-form'), ta = document.getElementById('chat-text'), fi = document.getElementById('chat-file'), st = document.getElementById('chat-st');
    paintExtra();
    ta.addEventListener('input', function () { autoGrow(ta); });
    ta.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && window.matchMedia('(hover: hover)').matches) { e.preventDefault(); sendMsg(); } });
    form.addEventListener('submit', function (e) { e.preventDefault(); sendMsg(); });
    fi.addEventListener('change', function () {
      var file = fi.files && fi.files[0]; fi.value = ''; if (!file) return;
      st.textContent = t('bt.chat.shrinking'); st.classList.remove('is-error');
      chatPhoto(file, function (im) {
        if (!im) { st.textContent = t('bt.chat.photoBad'); st.classList.add('is-error'); return; }
        chatImg = im; st.textContent = ''; paintExtra();
      });
    });
    var sb = document.getElementById('chat-stkbtn'), sk = document.getElementById('chat-stk');
    sb.addEventListener('click', function () { var open = sk.hidden; sk.hidden = !open; sb.setAttribute('aria-expanded', String(open)); if (open) { sk.innerHTML = stickerSheet(); toBottom(); } });
    sk.addEventListener('click', function (e) {
      var tb = e.target.closest('[data-stkset]'); if (tb) { chatStkSet = tb.getAttribute('data-stkset'); sk.innerHTML = stickerSheet(); return; }
      var b = e.target.closest('[data-stk]'); if (!b) return;
      sk.hidden = true; sb.setAttribute('aria-expanded', 'false'); sendMsg({ sticker: b.getAttribute('data-stk') });
    });
    document.getElementById('chat-extra').addEventListener('click', function (e) {
      var b = e.target.closest('[data-xrm]'); if (!b) return;
      if (b.getAttribute('data-xrm') === 'reply') chatReply = null; else chatImg = null;
      paintExtra();
    });
    document.getElementById('chat-older').addEventListener('click', function () {
      var b = this, list = chatMsgs(), room = chatOpen; if (!list.length || !room) return;
      b.disabled = true;
      cloud().then(function (api) { return api.chatOlder(c.code, room.ch, list[0].created, CHAT_PAGE); }).then(function (older) {
        if (chatOpen !== room) return;
        room.older = room.older.concat(older); if (older.length < CHAT_PAGE) room.more = false;
        paintRoom({ keep: true });
      }).catch(function (e) { toast(errText(e)); }).then(function () { b.disabled = false; });
    });
    document.getElementById('chat-newpill').addEventListener('click', function () { this.hidden = true; toBottom(); });
    window.addEventListener('scroll', function onS() { if (!document.getElementById('chat-newpill')) { window.removeEventListener('scroll', onS); return; } if (nearBottom()) document.getElementById('chat-newpill').hidden = true; }, { passive: true });
    var ul = document.getElementById('chat-list');
    ul.addEventListener('click', function (e) {
      var r = e.target.closest('[data-react]'); if (r) { var p = r.getAttribute('data-react').split(':'); react(p[0], p[1]); return; }
      var pl = e.target.closest('[data-play]');
      if (pl) { var card = pl.closest('.lcard'), src = card && card.getAttribute('data-embed'); if (src) { var fr = document.createElement('iframe'); fr.className = 'lcard__embed' + (/spotify/.test(src) ? ' is-spotify' : ''); fr.src = src; fr.title = t('bt.chat.player'); fr.setAttribute('allow', 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture'); fr.setAttribute('allowfullscreen', ''); pl.replaceWith(fr); } return; }
      var z = e.target.closest('[data-zoom]');
      if (z) { var m0 = msgById(z.getAttribute('data-zoom')), zb = document.getElementById('chat-zoom'); if (m0 && okChatImg(m0.img)) { zb.innerHTML = '<button type="button" class="icon-btn chat-zoom__x" aria-label="' + esc(t('bt.chat.close')) + '">' + icon('x') + '</button><img src="' + esc(m0.img.data) + '" alt="' + esc(t('bt.chat.photo')) + '">'; zb.hidden = false; zb.querySelector('button').focus(); } return; }
      if (e.target.closest('a')) return;
      var b = e.target.closest('[data-msg]'); if (b) openSheet(msgById(b.getAttribute('data-msg')));
    });
    document.getElementById('chat-zoom').addEventListener('click', function () { this.hidden = true; this.innerHTML = ''; });
    var sh = document.getElementById('chat-sheet');
    sh.addEventListener('click', function (e) {
      if (e.target === sh) { closeSheet(); return; }
      var mid = sh.getAttribute('data-mid'), m = msgById(mid), u = cUser();
      var rb = e.target.closest('[data-sreact]'); if (rb) { closeSheet(); react(mid, rb.getAttribute('data-sreact')); return; }
      var a = e.target.closest('[data-sact]'); if (!a || !m) return;
      var act = a.getAttribute('data-sact'); closeSheet();
      if (act === 'reply') { chatReply = { id: m.id, name: String(m.name || '').slice(0, 80), text: chatSnippet(m) }; paintExtra(); ta.focus(); }
      else if (act === 'copy') { if (navigator.clipboard) navigator.clipboard.writeText(m.text || '').then(function () { toast(t('bt.chat.copied')); }, function () {}); }
      else if (act === 'delete') {
        if (!window.confirm(t('bt.chat.confirmDelete'))) return;
        var room = chatOpen;
        cloud().then(function (api) { return api.chatDelete(c.code, room.ch, mid); }).then(function () { if (chatOpen === room) { room.older = room.older.filter(function (x) { return x.id !== mid; }); room.live = room.live.filter(function (x) { return x.id !== mid; }); paintRoom({ keep: true }); } toast(t('bt.chat.deleted')); }, function (e2) { toast(errText(e2)); });
      } else if (act === 'report') {
        if (!window.confirm(t('bt.chat.confirmReport'))) return;
        cloud().then(function (api) { return api.chatReport(c.code, { ch: chatOpen.ch, mid: mid, author: String(m.name || '').slice(0, 80), text: chatSnippet(m).slice(0, 300), reporter: myName().slice(0, 80) }); })
          .then(function () { toast(t('bt.chat.reported')); }, function (e2) { toast(errText(e2)); });
      }
    });
    document.addEventListener('keydown', function onK(e) {
      if (!document.getElementById('chat-sheet')) { document.removeEventListener('keydown', onK); return; }
      if (e.key === 'Escape') { closeSheet(); var zb = document.getElementById('chat-zoom'); if (zb) { zb.hidden = true; zb.innerHTML = ''; } }
    });
    var rn = document.getElementById('ch-rename'), dl = document.getElementById('ch-del');
    if (rn) rn.addEventListener('click', function () {
      var ch = chById(id); if (!ch) return;
      var name = cleanChName(window.prompt(t('bt.chat.renamePrompt'), ch.name)); if (!name || name === ch.name) return;
      cloud().then(function (api) { return api.chatRenameChannel(c.code, id, name, ch.emoji); }).then(function () { return loadChannels(true); }).then(function () { route({ keepScroll: true }); }, function (e) { toast(errText(e)); });
    });
    if (dl) dl.addEventListener('click', function () {
      var ch = chById(id); if (!ch || !window.confirm(tf('bt.chat.confirmDeleteCh', { ch: chName(ch) }))) return;
      dl.disabled = true;
      cloud().then(function (api) { return api.chatDeleteChannel(c.code, id); }).then(function () { closeRoom(); return loadChannels(true); }).then(function () { toast(tf('bt.chat.chDeleted', { ch: chName(ch) })); location.hash = '#/chat'; }, function (e) { dl.disabled = false; toast(errText(e)); });
    });
  };
  function wireReports() {
    var c = cst(), box = document.getElementById('ch-reports'); if (!box) return;
    box.querySelectorAll('[data-rok]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-rok'); b.disabled = true; cloud().then(function (api) { return api.chatDismiss(c.code, id); }).then(function () { chatReports.list = chatReports.list.filter(function (r) { return r.id !== id; }); box.innerHTML = reportsHTML(); wireReports(); }, function (e) { b.disabled = false; toast(errText(e)); }); }); });
    box.querySelectorAll('[data-rdel]').forEach(function (b) { b.addEventListener('click', function () {
      var id = b.getAttribute('data-rdel'), r = chatReports.list.filter(function (x) { return x.id === id; })[0]; if (!r || !window.confirm(t('bt.chat.confirmDelete'))) return;
      b.disabled = true;
      cloud().then(function (api) { return api.chatDelete(c.code, r.ch, r.mid).then(function () { return api.chatDismiss(c.code, id); }); })
        .then(function () { chatReports.list = chatReports.list.filter(function (x) { return x.id !== id; }); box.innerHTML = reportsHTML(); wireReports(); toast(t('bt.chat.deleted')); }, function (e) { b.disabled = false; toast(errText(e)); });
    }); });
  }
  TITLES.chat = function () { var id = parts()[1], ch = id && chById(id); return ch ? chName(ch) : t('nav.chat'); };
  /* 1.21.1: Batch chat card at the top of Home (members only; not-yet-members keep the Cloud sync strip) */
  function homeChatHTML() {
    if (!isSynced()) return '';
    var list = cachedChannels(), un = list.filter(isUnread), latest = list.filter(function (c) { return c.last; }).sort(function (a, b) { return b.last - a.last; })[0];
    var sub = !list.length ? t('bt.chat.homeLoading')
      : un.length ? tf(un.length === 1 ? 'bt.chat.homeNew1' : 'bt.chat.homeNewN', { n: un.length, ch: chName(un.sort(function (a, b) { return b.last - a.last; })[0]), name: un[0].lastName || '—' })
      : latest ? tf('bt.chat.homeLatest', { ch: chName(latest), name: latest.lastName || '—', when: whenShort(latest.last) }) : t('bt.chat.homeQuiet');
    var picks = list.slice().sort(function (a, b) { return (isUnread(b) - isUnread(a)) || (b.last || 0) - (a.last || 0) || chSort(a, b); }).slice(0, 4);
    return '<section class="card home-chat' + (un.length ? ' has-unread' : '') + '"><a class="home-chat__main" href="#/chat">' +
      '<span class="home-chat__ico">' + icon('chat', 'home-chat__svg') + (un.length ? '<span class="badge home-chat__n">' + (un.length > 9 ? '9+' : un.length) + '</span>' : '') + '</span>' +
      '<span class="home-chat__t"><strong>' + esc(t('bt.chat.homeH')) + '</strong><span>' + esc(sub) + '</span></span><span class="home-chat__go" aria-hidden="true">›</span></a>' +
      (picks.length ? '<div class="home-chat__chips">' + picks.map(function (c) { return '<a class="home-chat__chip' + (isUnread(c) ? ' is-unread' : '') + '" href="#/chat/' + encodeURIComponent(c.id) + '"><span aria-hidden="true">' + esc(c.emoji || '#') + '</span> ' + esc(chName(c)) + (isUnread(c) ? '<span class="ch-dot"><span class="sr-only">' + esc(t('bt.chat.unread')) + '</span></span>' : '') + '</a>'; }).join('') + '</div>' : '') +
      '</section>';
  }
  (function () {
    var homeV = VIEWS.home;
    VIEWS.home = function () { var html = homeV.apply(null, arguments), card = homeChatHTML(); return card ? html.replace('<div class="wrap home">', '<div class="wrap home">' + card) : html; };
    var homeA = AFTER.home;
    AFTER.home = function () {
      homeA.apply(null, arguments);
      if (isSynced() && (!cachedChannels().length || Date.now() - chatListAt > 5 * 60 * 1000)) loadChannels(true).then(function (l) { if (l && currentKey() === 'home') route({ keepScroll: true }); });
    };
  })();
  if (BADGE_IDS.indexOf('chatter') < 0) { BADGES.push(['chatter', 'chat']); BADGE_IDS.push('chatter'); }


  /* ===================== 1.21.2: MY CARD DRAFT =====================
     Unsaved My card edits are kept on the phone (store `meDraft`) so they survive leaving the screen,
     a language/text-size re-render, or iOS closing the app in the background. Written 400 ms after typing,
     on every route change (route() calls meDraftFlush first), on pagehide and when the app is hidden.
     Draft = the form collected without validation + base (the saved card's `updated` when it was written),
     pp (pending photo: null unchanged, '' removed, data URL new), role (resident|partner), at (ms).
     It is used only while base still matches the saved card, so a Save, Clear my card or a newer card
     arriving from another device retires it. Discard button on the banner. */
  var meDirty = false, meDraftT = null;
  function meDraftCollect(form) {
    var old = getMe() || {}, c = { id: old.id || '', name: form.name.value, base: old.updated || '', at: Date.now(), pp: pendingPhoto };
    FIELDS.forEach(function (f) { if (form.elements[f.key]) c[f.key] = form.elements[f.key].value; });
    c.bmonth = form.bmonth.value; c.bday = form.bday.value; c.byear = form.byear.value;
    c.custom = []; c.playlists = []; c.netflix = []; c.lists = {};
    form.querySelectorAll('#custom-rows .custom-row').forEach(function (r) { c.custom.push({ label: r.querySelector('[name=customLabel]').value, value: r.querySelector('[name=customValue]').value }); });
    form.querySelectorAll('#pl-rows .custom-row').forEach(function (r) { c.playlists.push({ label: r.querySelector('[name=plLabel]').value, url: r.querySelector('[name=plUrl]').value.trim() }); });
    LISTS.forEach(function (L) {
      var arr = [];
      form.querySelectorAll('#rows-' + L.key + ' .custom-row').forEach(function (r) { var ti = r.querySelector('[name=lTitle]').value.trim(), u = r.querySelector('[name=lUrl]').value.trim(); if (ti || u) arr.push({ title: ti || u, url: u }); });
      if (L.key === 'netflix') c.netflix = arr; else c.lists[L.key] = arr;
    });
    var role = form.querySelector('input[name="cardRole"]:checked'); c.role = role ? role.value : 'resident';
    collectPT(form, c);
    c.partnerOf = form.elements.partnerOf ? form.elements.partnerOf.value : ''; c.partnerName = form.elements.partnerName ? form.elements.partnerName.value : '';
    return c;
  }
  function meDraftWrite() {
    clearTimeout(meDraftT); meDraftT = null;
    var form = document.getElementById('me-form'); if (!form || !meDirty) return;
    try { store.set('meDraft', meDraftCollect(form)); meDirty = false; var n = document.getElementById('me-draft-note'); if (n) n.hidden = false; } catch (e) {}
  }
  function meDraftFlush() { if (meDirty) meDraftWrite(); }
  function meDraftRaw() {
    var raw = store.get('meDraft', null), me = getMe();
    if (!raw || typeof raw !== 'object') return null;
    if ((raw.base || '') !== ((me && me.updated) || '')) { store.del('meDraft'); return null; }
    return raw;
  }
  function meDraftRead() {
    var raw = meDraftRaw(); if (!raw) return null;
    var old = getMe() || {}, x = {};
    Object.keys(raw).forEach(function (k) { x[k] = raw[k]; });
    x.id = raw.id || 'draft'; x.name = cleanText(raw.name, 80) || '~';
    x.photo = raw.pp === null || raw.pp === undefined ? (old.photo || '') : raw.pp;
    x.updated = old.updated;
    var c = sanitizeCard(x); if (!c) return null;
    c.id = raw.id || ''; c.name = cleanText(raw.name, 80);
    c.bmonth = toInt(raw.bmonth, 1, 12); c.bday = toInt(raw.bday, 1, 31); c.byear = toInt(raw.byear, 1900, 2100);
    c.custom = (raw.custom || []).filter(function (r) { return r && (r.label || r.value); }).slice(0, MAX_CUSTOM).map(function (r) { return { label: cleanText(r.label, 60), value: cleanText(r.value, MAX_TEXT) }; });
    c.playlists = (raw.playlists || []).filter(function (r) { return r && (r.label || r.url); }).slice(0, PLAYLIST_MAX).map(function (r) { return { label: cleanText(r.label, 60), url: cleanText(r.url, 300) }; });
    function rawList(a, L) { return (Array.isArray(a) ? a : []).slice(0, L.max).map(function (r) { return { title: cleanText(r && r.title, 80), url: cleanText(r && r.url, 300) }; }); }
    c.netflix = rawList(raw.netflix, LIST_BY.netflix); c.lists = {};
    LISTS.forEach(function (L) { if (L.key !== 'netflix' && raw.lists) c.lists[L.key] = rawList(raw.lists[L.key], L); });
    FUN_KEYS.forEach(function (k) { if (old[k] !== undefined) c[k] = old[k]; });
    return c;
  }
  window.addEventListener('pagehide', meDraftFlush);
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') meDraftFlush(); });
  (function () {
    var view0 = VIEWS.me, after0 = AFTER.me;
    VIEWS.me = function () {
      var raw = meDraftRaw(), html = view0.apply(null, arguments);
      html = html.replace('<button type="submit" class="btn btn--solid">', '<span class="me-draft-note muted" id="me-draft-note"' + (raw ? '' : ' hidden') + '>' + esc(t('bt.me.draftNote')) + '</span><button type="submit" class="btn btn--solid">');
      if (!raw) return html;
      var bar = '<div class="callout me-draft" id="me-draft"><p class="callout__title">' + esc(t('bt.me.draftH')) + '</p><p style="margin:0 0 10px">' + esc(tf('bt.me.draftText', { when: new Date(raw.at || Date.now()).toLocaleString(locale(), { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) })) + '</p><button type="button" class="link-btn" id="me-draft-discard">' + esc(t('bt.me.draftDiscard')) + '</button></div>';
      return html.replace('<form id="me-form"', bar + '<form id="me-form"');
    };
    AFTER.me = function () {
      var raw = meDraftRaw();
      after0.apply(null, arguments);
      meDirty = false;
      var form = document.getElementById('me-form'); if (!form) return;
      if (raw) {
        if (raw.pp !== null && raw.pp !== undefined) pendingPhoto = raw.pp;
        if (raw.role === 'partner') { var r = form.querySelector('input[name="cardRole"][value="partner"]'), who = form.querySelector('.pt-who'); if (r) r.checked = true; if (who) who.hidden = false; }
      }
      function dirty() { meDirty = true; clearTimeout(meDraftT); meDraftT = setTimeout(meDraftWrite, 400); }
      form.addEventListener('input', dirty); form.addEventListener('change', dirty);
      form.addEventListener('click', function (e) { if (e.target.closest('.custom-rm, .nf-up, #custom-add, #pl-add, [data-ladd], #me-photo-rm')) dirty(); });
      var fi = document.getElementById('me-photo'); if (fi) fi.addEventListener('change', function () { setTimeout(dirty, 800); });
      var before = (getMe() || {}).updated || '';
      form.addEventListener('submit', function () {
        if (((getMe() || {}).updated || '') !== before) { clearTimeout(meDraftT); meDirty = false; store.del('meDraft'); var n = document.getElementById('me-draft-note'); if (n) n.hidden = true; var b = document.getElementById('me-draft'); if (b) b.remove(); }
        else meDraftWrite();
      });
      var dis = document.getElementById('me-draft-discard');
      if (dis) dis.addEventListener('click', function () { if (!window.confirm(t('bt.me.draftConfirm'))) return; clearTimeout(meDraftT); meDirty = false; store.del('meDraft'); pendingPhoto = null; route({ keepScroll: false }); });
    };
  })();


  /* ===================== 1.22.0: PDF + BETTER PRINT =====================
     #/print gets a Make PDF main button (jsPDF 2.5.2 vendored in js/vendor/jspdf.umd.min.js, loaded on first tap,
     precached by sw) and keeps Print as a backup. Four layouts, the same in PDF and print: batch sheet (up to 8 chosen
     facts per card, store `printFacts`; order store `printSort` name|bday), name tags (8 per A4), full directory
     (everything EXCEPT the Emergency & medical group in the PDF), birthday calendar (12 months from this month,
     partners included). PDF text uses the built-in Helvetica, so characters outside Windows-1252 (emoji etc.) are
     dropped by pdfT(). Footer on every PDF page: batch name · title, page n of N, attribution. */
  var PRINT_FACTS_DEF = ['hometown', 'medSchool', 'askMe', 'hobbies', 'food', 'shows', 'music', 'funFact'], PRINT_FACTS_MAX = 8;
  var pdfBusy = false;
  function printFactKeys() {
    var ok = FIELDS.filter(function (f) { return f.print && f.key !== 'nickname'; }).map(function (f) { return f.key; });
    var v = store.get('printFacts', null);
    var keys = (Array.isArray(v) ? v : PRINT_FACTS_DEF).filter(function (k) { return ok.indexOf(k) >= 0; });
    return keys.slice(0, PRINT_FACTS_MAX);
  }
  function printSortKey() { return store.get('printSort', 'name') === 'bday' ? 'bday' : 'name'; }
  function printPeople() {
    var all = people().slice();
    if (printSortKey() === 'bday') all.sort(function (a, b) { return ((a.bmonth || 13) * 40 + (a.bday || 0)) - ((b.bmonth || 13) * 40 + (b.bday || 0)) || a.name.localeCompare(b.name, undefined, { numeric: true }); });
    else all.sort(function (a, b) { return a.name.localeCompare(b.name, undefined, { numeric: true }); });
    return all;
  }
  function printFactVal(c, k) { var v = String(c[k] || '').replace(/\s*\n\s*/g, ' · ').trim(); return v.length > 160 ? v.slice(0, 157).replace(/\s+\S*$/, '') + '…' : v; }
  function calMonths() { var d = new Date(), out = []; for (var i = 0; i < 12; i++) { var x = new Date(d.getFullYear(), d.getMonth() + i, 1); out.push({ y: x.getFullYear(), m: x.getMonth() + 1 }); } return out; }
  function calWho(m) {
    return allCards().filter(function (c) { return c.bmonth === m && c.bday; }).map(function (c) { return { c: c, day: c.bday, label: c.preferredName || c.nickname || c.name.split(/\s+/)[0], partner: isPartner(c) }; })
      .sort(function (a, b) { return a.day - b.day || a.label.localeCompare(b.label); });
  }
  function weekdayNames() { var out = []; for (var i = 0; i < 7; i++) { var d = new Date(2023, 0, 1 + i); try { out.push(d.toLocaleDateString(locale(), { weekday: 'short' })); } catch (e) { out.push(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][i]); } } return out; }
  function monthTitle(y, m) { return monthName(m) + ' ' + y; }
  function calCells(y, m) { var first = new Date(y, m - 1, 1).getDay(), n = new Date(y, m, 0).getDate(), cells = []; for (var i = 0; i < first; i++) cells.push(0); for (var d = 1; d <= n; d++) cells.push(d); while (cells.length % 7) cells.push(0); return cells; }

  /* ---- HTML (print backup) ---- */
  function printSheetHTML(all) {
    var keys = printFactKeys(), bn = batchName(), today = new Date();
    return '<div class="sheet"><header class="sheet__head"><h2>' + esc(bn ? bn + ' · ' + t('bt.print.title') : t('bt.print.title')) + '</h2><p>' + esc(tf('bt.print.subtitle', { program: HOSP.program || '', hospital: HOSP.name || '' })) + ' · ' + esc(today.toLocaleDateString(locale(), { year: 'numeric', month: 'long', day: 'numeric' })) + '</p></header>' +
      '<div class="sheet__grid">' + all.map(function (c) {
        return '<article class="sheet__card">' + avatar(c, 'avatar--print') + '<div class="sheet__body"><h3>' + esc(c.name) + (c.nickname ? ' <small>“' + esc(c.nickname) + '”</small>' : '') + '</h3>' +
          (c.bmonth ? '<p class="sheet__line"><strong>' + esc(t('bt.person.birthday')) + ':</strong> ' + esc(bdayText(c)) + '</p>' : '') +
          keys.filter(function (k) { return c[k]; }).map(function (k) { return '<p class="sheet__line"><strong>' + esc(fieldLabel(k)) + ':</strong> ' + esc(printFactVal(c, k)) + '</p>'; }).join('') +
          '</div></article>';
      }).join('') + '</div><p class="sheet__foot">' + esc(ATTRIBUTION) + '</p></div>';
  }
  function printCalHTML() {
    var wd = weekdayNames(), bn = batchName();
    return '<div class="sheet cal">' + calMonths().map(function (mm) {
      var who = calWho(mm.m);
      return '<section class="cal__month"><h2>' + esc(monthTitle(mm.y, mm.m)) + '</h2><p class="cal__sub">' + esc((bn ? bn + ' · ' : '') + t('bt.print.calTitle')) + '</p><table class="cal__grid"><thead><tr>' + wd.map(function (w) { return '<th>' + esc(w) + '</th>'; }).join('') + '</tr></thead><tbody>' +
        (function () { var cells = calCells(mm.y, mm.m), h = ''; for (var i = 0; i < cells.length; i += 7) { h += '<tr>' + cells.slice(i, i + 7).map(function (d) { if (!d) return '<td class="is-off"></td>'; var ws = who.filter(function (x) { return x.day === d; }); return '<td' + (ws.length ? ' class="has-bd"' : '') + '><span class="cal__d">' + d + '</span>' + ws.map(function (x) { return '<span class="cal__n">' + esc(x.label) + (x.partner ? ' <em>(' + esc(t('bt.pt.tag')) + ')</em>' : '') + '</span>'; }).join('') + '</td>'; }).join('') + '</tr>'; } return h; })() +
        '</tbody></table></section>';
    }).join('') + '<p class="sheet__foot">' + esc(ATTRIBUTION) + '</p></div>';
  }

  /* ---- PDF ---- */
  var CP1252 = '€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ';
  function pdfT(s) {
    s = String(s == null ? '' : s).normalize('NFC');
    var out = '';
    for (var i = 0; i < s.length; i++) { var ch = s.charAt(i), c = s.charCodeAt(i); if (c === 10 || (c >= 32 && c < 127) || (c >= 160 && c < 256) || CP1252.indexOf(ch) >= 0) out += ch; else if (c === 8203 || c === 65039) { } else if (c >= 0xD800 && c <= 0xDBFF) i++; }
    return out.replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.;:!?])/g, '$1').trim();
  }
  function loadJsPDF() {
    if (window.jspdf && window.jspdf.jsPDF) return Promise.resolve(window.jspdf.jsPDF);
    return new Promise(function (res, rej) {
      var s = document.createElement('script'); s.src = 'js/vendor/jspdf.umd.min.js';
      s.onload = function () { window.jspdf && window.jspdf.jsPDF ? res(window.jspdf.jsPDF) : rej(new Error('jsPDF missing')); };
      s.onerror = function () { rej(new Error('jsPDF failed to load')); };
      document.head.appendChild(s);
    });
  }
  function pdfPhoto(c, px) {   // round photo (or initials) on white, as JPEG for addImage
    return new Promise(function (res) {
      var cv = document.createElement('canvas'); cv.width = cv.height = px; var x = cv.getContext('2d');
      x.fillStyle = '#fff'; x.fillRect(0, 0, px, px);
      function ring() { x.beginPath(); x.arc(px / 2, px / 2, px / 2 - px * 0.02, 0, Math.PI * 2); x.lineWidth = px * 0.03; x.strokeStyle = '#c9cfd8'; x.stroke(); res(cv.toDataURL('image/jpeg', 0.88)); }
      function letters() { x.beginPath(); x.arc(px / 2, px / 2, px / 2, 0, Math.PI * 2); x.fillStyle = '#e8edf6'; x.fill(); x.fillStyle = '#1D4EAF'; x.font = '700 ' + Math.round(px * 0.36) + 'px Helvetica, Arial, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(initials(c.name || '?'), px / 2, px / 2 + px * 0.02); ring(); }
      if (!c.photo) return letters();
      var im = new Image();
      im.onload = function () { x.save(); x.beginPath(); x.arc(px / 2, px / 2, px / 2, 0, Math.PI * 2); x.clip(); var s = Math.min(im.width, im.height); x.drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, px, px); x.restore(); ring(); };
      im.onerror = letters; im.src = c.photo;
    });
  }
  function pdfMake(mode) {
    var all = printPeople(), bn = pdfT(batchName()), today = new Date();
    var titles = { sheet: t('bt.print.title'), tags: t('bt.print.modeTags'), full: t('bt.print.fullTitle'), cal: t('bt.print.calTitle') };
    var title = pdfT(titles[mode] || titles.sheet);
    var need = mode === 'cal' ? [] : all;
    return loadJsPDF().then(function (JsPDF) {
      return Promise.all(need.map(function (c) { return pdfPhoto(c, mode === 'tags' ? 300 : 200); })).then(function (photos) {
        var doc = new JsPDF({ unit: 'mm', format: 'a4', compress: true }), W = 210, H = 297, M = 12, CW = W - 2 * M, BOT = H - M - 8;
        var INK = [26, 28, 32], MUTED = [92, 99, 110], ACC = [29, 78, 175], RULE = [201, 207, 216];
        var LH = function (pt) { return pt * 0.3528 * 1.28; };
        doc.setProperties({ title: (bn ? bn + ' · ' : '') + title, author: 'Psych Tickler', creator: 'Psych Tickler' });
        function font(st, pt, col) { doc.setFont('helvetica', st); doc.setFontSize(pt); doc.setTextColor.apply(doc, col || INK); }
        function txt(s, x, y, o) { doc.text(s, x, y, Object.assign({ baseline: 'top' }, o || {})); }
        function wrap(s, w) { return doc.splitTextToSize(s, w); }
        function kv(label, value, x, y, w, pt, draw) {   // bold "Label:" then wrapped value; returns height
          label = pdfT(label) + ': '; value = pdfT(value);
          font('bold', pt); var lw = doc.getTextWidth(label) + 0.6, lh = LH(pt);
          font('normal', pt);
          var words = value.split(/\s+/).filter(Boolean), lines = [], cur = '', first = true;
          words.forEach(function (wd) {
            var lim = first ? w - lw : w, tryS = cur ? cur + ' ' + wd : wd;
            if (doc.getTextWidth(tryS) <= lim || !cur) { cur = tryS; while (doc.getTextWidth(cur) > lim && cur.length > 1) { var cut = Math.max(1, Math.floor(cur.length * lim / doc.getTextWidth(cur)) - 1); lines.push(cur.slice(0, cut)); cur = cur.slice(cut); first = false; lim = w; } }
            else { lines.push(cur); cur = wd; first = false; }
          });
          if (cur) lines.push(cur);
          if (!lines.length) lines.push('');
          if (draw) { font('bold', pt); txt(label, x, y); font('normal', pt, MUTED); lines.forEach(function (ln, i) { txt(ln, i ? x : x + lw, y + i * lh); }); }
          return lines.length * lh;
        }
        function head(y) {
          font('bold', 18); txt((bn ? bn + ' · ' : '') + title, M, y);
          font('normal', 9, MUTED); var sub = wrap(pdfT(tf('bt.print.subtitle', { program: HOSP.program || '', hospital: HOSP.name || '' }) + ' · ' + today.toLocaleDateString(locale(), { year: 'numeric', month: 'long', day: 'numeric' })), CW);
          sub.forEach(function (ln, i) { txt(ln, M, y + 8.5 + i * LH(9)); });
          var ly = y + 10 + sub.length * LH(9);
          doc.setDrawColor.apply(doc, ACC); doc.setLineWidth(0.6); doc.line(M, ly, W - M, ly);
          return ly + 5;
        }
        var y;
        if (mode === 'tags') {
          var tw = CW / 2, th = (H - 2 * M) / 4;
          all.forEach(function (c, i) {
            if (i && i % 8 === 0) doc.addPage();
            var col = i % 2, row = Math.floor((i % 8) / 2), x = M + col * tw, ty = M + row * th, cx = x + tw / 2;
            doc.setLineDashPattern([1.5, 1.2], 0); doc.setDrawColor(150, 150, 150); doc.setLineWidth(0.25); doc.rect(x, ty, tw, th, 'S'); doc.setLineDashPattern([], 0);
            var yy = ty + 5;
            if (bn) { font('bold', 7, MUTED); txt(bn.toUpperCase(), cx, yy, { align: 'center', charSpace: 0.3 }); }
            yy += 5; doc.addImage(photos[i], 'JPEG', cx - 12, yy, 24, 24); yy += 27;
            var big = pdfT(c.preferredName || c.nickname || c.name.split(/\s+/)[0]), pt = 24; font('bold', pt); while (doc.getTextWidth(big) > tw - 10 && pt > 12) { pt -= 1; font('bold', pt); }
            txt(big, cx, yy, { align: 'center' }); yy += LH(pt);
            font('normal', 10.5); txt(wrap(pdfT(c.name), tw - 10)[0], cx, yy, { align: 'center' }); yy += LH(10.5);
            if (c.hometown) { font('normal', 9, MUTED); txt(wrap(pdfT(c.hometown), tw - 10)[0], cx, yy, { align: 'center' }); }
            font('normal', 6.5, MUTED); txt(pdfT(HOSP.shortName || HOSP.name || ''), cx, ty + th - 6, { align: 'center' });
          });
        } else if (mode === 'sheet') {
          var keys = printFactKeys(), gap = 5, cw = (CW - gap) / 2, ph = 17, pad = 3.5, tx = pad + ph + 3.5, tw2 = cw - tx - pad;
          y = head(M);
          function cardH(c) { var h = LH(11) + 1; if (c.bmonth) h += kv(t('bt.person.birthday'), bdayText(c), 0, 0, tw2, 8.5, false); keys.forEach(function (k) { if (c[k]) h += kv(fieldLabel(k), printFactVal(c, k), 0, 0, tw2, 8.5, false); }); return Math.max(ph, h) + 2 * pad; }
          function drawCard(c, i, x, yy, hh) {
            doc.setDrawColor.apply(doc, RULE); doc.setLineWidth(0.3); doc.roundedRect(x, yy, cw, hh, 2.5, 2.5, 'S');
            doc.addImage(photos[i], 'JPEG', x + pad, yy + pad, ph, ph);
            var ty2 = yy + pad; font('bold', 11); var nm = pdfT(c.name); txt(nm, x + tx, ty2);
            if (c.nickname) { var nw = doc.getTextWidth(nm + ' '); font('italic', 9, MUTED); if (nw + doc.getTextWidth('“' + pdfT(c.nickname) + '”') < tw2) txt('“' + pdfT(c.nickname) + '”', x + tx + nw, ty2 + 0.6); }
            ty2 += LH(11) + 1;
            if (c.bmonth) ty2 += kv(t('bt.person.birthday'), bdayText(c), x + tx, ty2, tw2, 8.5, true);
            keys.forEach(function (k) { if (c[k]) ty2 += kv(fieldLabel(k), printFactVal(c, k), x + tx, ty2, tw2, 8.5, true); });
          }
          for (var i = 0; i < all.length; i += 2) {
            var hA = cardH(all[i]), hB = all[i + 1] ? cardH(all[i + 1]) : 0, rh = Math.max(hA, hB);
            if (y + rh > BOT) { doc.addPage(); y = M; }
            drawCard(all[i], i, M, y, rh); if (all[i + 1]) drawCard(all[i + 1], i + 1, M + cw + gap, y, rh);
            y += rh + gap;
          }
        } else if (mode === 'full') {
          var colW = (CW - 8) / 2, top = M;
          y = head(M);
          all.forEach(function (c, i) {
            if (i && y > BOT - 55) { doc.addPage(); y = M; }
            if (i) { doc.setDrawColor.apply(doc, INK); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 4; }
            doc.addImage(photos[i], 'JPEG', M, y, 18, 18);
            font('bold', 15); var nm = pdfT(c.name); txt(nm, M + 22, y + 1);
            if (c.nickname) { var nw = doc.getTextWidth(nm + ' '); font('italic', 10, MUTED); txt('“' + pdfT(c.nickname) + '”', M + 22 + nw, y + 2.2); }
            if (c.bmonth) { font('normal', 9, MUTED); txt(pdfT(t('bt.person.birthday') + ': ' + bdayText(c, true) + (c.byear ? ' · ' + tf('bt.person.turns', { n: ageOn(c, today.getFullYear()) }) : '') + ' · ' + zodiac(c) + (chineseZodiac(c) ? ' / ' + chineseZodiac(c) : '')), M + 22, y + 9); }
            if (isPartner(c)) { font('normal', 9, MUTED); txt(pdfT(t('bt.pt.tag')), M + 22, y + 13.5); }
            y += 22;
            var blocks = [];
            GROUPS.forEach(function (g) {
              if (g === 'emergency') return;
              var items = [];
              subChunks(g).forEach(function (ch) {
                var r = ch.fields.filter(function (f) { return c[f.key] && f.key !== 'nickname'; });
                if (!r.length) return;
                if (ch.sub) items.push({ sub: subLabel(ch.sub) });
                r.forEach(function (f) { var v = f.type === 'month' ? fmtMonth(c[f.key]) : f.type === 'url' ? linkHref(f, c[f.key]) : String(c[f.key]).replace(/\s*\n\s*/g, ' · '); items.push({ k: fieldLabel(f.key), v: v }); });
              });
              if (items.length) blocks.push({ h: groupLabel(g), items: items });
            });
            if (c.playlists && c.playlists.length) blocks.push({ h: t('bt.f.playlists'), items: c.playlists.map(function (p) { return { k: p.label || '—', v: p.url }; }) });
            LISTS.forEach(function (L) { var xs = listOf(c, L.key); if (xs.length) blocks.push({ h: listLabel(L.key), items: xs.map(function (x, n) { return { k: String(n + 1), v: x.title + (x.url ? ' — ' + x.url : '') }; }) }); });
            if (c.custom && c.custom.length) blocks.push({ h: t('bt.print.custom'), items: c.custom.map(function (x) { return { k: x.label, v: x.value }; }) });
            var hs = blocks.map(function (b) { var h = LH(8) + 0.8 + 2.5; b.items.forEach(function (it) { h += it.sub ? LH(7) + 1 : kv(it.k, it.v, 0, 0, colW, 8.5, false) + 0.4; }); return h; });
            var tot = hs.reduce(function (a, b) { return a + b; }, 0), acc = 0, split = blocks.length;
            for (var bi = 0; bi < blocks.length; bi++) { if (acc + hs[bi] / 2 > tot / 2 && bi > 0) { split = bi; break; } acc += hs[bi]; }
            if (y + Math.max(acc, tot - acc) <= BOT && blocks.length > 1) blocks.forEach(function (b, bi) { b.col = bi >= split ? 1 : 0; });
            var col = 0, colTop = y, leftEnd = y;
            function room(h) { if (y + h <= BOT) return; if (col === 0) { leftEnd = y; col = 1; y = colTop; if (y + h <= BOT) return; } doc.addPage(); col = 0; y = top; colTop = top; leftEnd = top; }
            function cx() { return M + col * (colW + 8); }
            blocks.forEach(function (b) {
              if (b.col === 1 && col === 0) { leftEnd = y; col = 1; y = colTop; }
              room(LH(8) + 6); font('bold', 8, ACC); txt(pdfT(b.h).toUpperCase(), cx(), y, { charSpace: 0.25 }); y += LH(8) + 0.8;
              b.items.forEach(function (it) {
                if (it.sub) { room(LH(7) + 5); font('bold', 7, MUTED); txt(pdfT(it.sub).toUpperCase(), cx(), y + 0.6, { charSpace: 0.2 }); y += LH(7) + 1; return; }
                var hh = kv(it.k, it.v, 0, 0, colW, 8.5, false); room(hh); kv(it.k, it.v, cx(), y, colW, 8.5, true); y += hh + 0.4;
              });
              y += 2.5;
            });
            if (col === 1) y = Math.max(leftEnd, y);
            y += 4;
          });
        } else if (mode === 'cal') {
          var wd = weekdayNames(), cellW = CW / 7;
          calMonths().forEach(function (mm, mi) {
            if (mi) doc.addPage();
            font('bold', 24); txt(pdfT(monthTitle(mm.y, mm.m)), M, M);
            font('normal', 9, MUTED); txt(pdfT((bn ? bn + ' · ' : '') + t('bt.print.calTitle')), M, M + 10.5);
            var gy = M + 18, cells = calCells(mm.y, mm.m), rows = cells.length / 7, cellH = (BOT - gy - 7) / rows, who = calWho(mm.m);
            font('bold', 8, MUTED); wd.forEach(function (w, i) { txt(pdfT(w).toUpperCase(), M + i * cellW + cellW / 2, gy, { align: 'center' }); });
            gy += 6;
            cells.forEach(function (d, i) {
              var x = M + (i % 7) * cellW, yy = gy + Math.floor(i / 7) * cellH, ws = who.filter(function (w) { return w.day === d; });
              if (ws.length) { doc.setFillColor(232, 237, 246); doc.rect(x, yy, cellW, cellH, 'F'); }
              doc.setDrawColor.apply(doc, RULE); doc.setLineWidth(0.25); doc.rect(x, yy, cellW, cellH, 'S');
              if (!d) return;
              font('bold', 10, ws.length ? ACC : MUTED); txt(String(d), x + 1.8, yy + 1.6);
              var ny = yy + 7;
              ws.forEach(function (w) {
                font('bold', 7.5); var ls = wrap(pdfT(w.label), cellW - 3);
                ls.slice(0, 2).forEach(function (ln) { if (ny + LH(7.5) < yy + cellH) { txt(ln, x + 1.5, ny); ny += LH(7.5); } });
                if (w.partner && ny + LH(6.5) < yy + cellH) { font('italic', 6.5, MUTED); txt(pdfT('(' + t('bt.pt.tag') + ')'), x + 1.5, ny); ny += LH(6.5); }
                ny += 0.6;
              });
            });
          });
        }
        var n = doc.getNumberOfPages();
        for (var p = 1; p <= n; p++) {
          doc.setPage(p); font('normal', 7, MUTED);
          if (mode !== 'tags') { txt(pdfT((bn ? bn + ' · ' : '') + title), M, H - M - 3); txt(pdfT(tf('bt.print.page', { n: p, total: n })), W - M, H - M - 3, { align: 'right' }); }
          font('normal', 6.5, MUTED); txt(pdfT(ATTRIBUTION), W / 2, H - (mode === 'tags' ? 6 : M), { align: 'center' });
        }
        return doc.output('blob');
      });
    });
  }
  function pdfName(mode) { var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; }; return 'Batch-Tickler-' + ({ sheet: 'batch-sheet', tags: 'name-tags', full: 'directory', cal: 'birthday-calendar' }[mode] || 'print') + '-' + d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate()) + '.pdf'; }
  function pdfDeliver(blob, name) {
    var file = null; try { file = new File([blob], name, { type: 'application/pdf' }); } catch (e) {}
    var touch = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (touch && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      return navigator.share({ files: [file], title: name }).then(function () { return 'shared'; }, function (e) { if (e && e.name === 'AbortError') return 'cancel'; return pdfDownload(blob, name); });
    }
    return Promise.resolve(pdfDownload(blob, name));
  }
  function pdfDownload(blob, name) {
    var url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
    window.__btLastPdf = { name: name, size: blob.size };
    return 'downloaded';
  }

  /* ---- the screen ---- */
  (function () {
    var view0 = VIEWS.print;
    VIEWS.print = function () {
      var all = printPeople(), modes = [['sheet', 'bt.print.modeSheet'], ['tags', 'bt.print.modeTags'], ['full', 'bt.print.modeFull'], ['cal', 'bt.print.modeCal']];
      var hint = printMode === 'tags' ? t('bt.print.tagsHint') : printMode === 'full' ? t('bt.print.fullHint') + ' ' + t('bt.pdf.noEm') : printMode === 'cal' ? t('bt.print.calHint') : '';
      var head = '<header class="page__head no-print"><h1>' + esc(t('nav.print')) + '</h1><p>' + esc(t('bt.pdf.intro')) + '</p>' +
        (all.length || allCards().length ? '<div class="filters" role="group">' + modes.map(function (m) { return '<button type="button" class="filter" data-pmode="' + m[0] + '" aria-pressed="' + (printMode === m[0]) + '">' + esc(t(m[1])) + '</button>'; }).join('') + '</div>' : '') +
        (hint ? '<p class="muted pr-hint">' + esc(hint) + '</p>' : '');
      if (printMode === 'sheet' && all.length) {
        var keys = printFactKeys(), sk = printSortKey();
        head += '<details class="card pr-opts"' + (store.get('printOptsOpen', false) ? ' open' : '') + '><summary>' + esc(t('bt.print.facts')) + ' <span class="muted">(' + keys.length + '/' + PRINT_FACTS_MAX + ')</span></summary>' +
          '<p class="muted">' + esc(t('bt.print.factsHint')) + '</p><div class="pr-facts">' +
          FIELDS.filter(function (f) { return f.print && f.key !== 'nickname'; }).map(function (f) { var on = keys.indexOf(f.key) >= 0; return '<label class="pr-fact"><input type="checkbox" data-pfact="' + f.key + '"' + (on ? ' checked' : '') + (!on && keys.length >= PRINT_FACTS_MAX ? ' disabled' : '') + '> ' + esc(fieldLabel(f.key)) + '</label>'; }).join('') +
          '</div><p><button type="button" class="link-btn" id="pr-reset">' + esc(t('bt.print.reset')) + '</button></p></details>' +
          '<div class="filters pr-sort" role="group" aria-label="' + esc(t('bt.print.sort')) + '"><span class="muted">' + esc(t('bt.print.sort')) + ':</span> <button type="button" class="filter" data-psort="name" aria-pressed="' + (sk === 'name') + '">' + esc(t('bt.print.sortName')) + '</button><button type="button" class="filter" data-psort="bday" aria-pressed="' + (sk === 'bday') + '">' + esc(t('bt.print.sortBday')) + '</button></div>';
      }
      var can = printMode === 'cal' ? allCards().length : all.length;
      if (can) head += '<p class="pr-acts"><button type="button" class="btn btn--solid" id="do-pdf">' + icon('print', 'btn__ico') + esc(t('bt.pdf.btn')) + '</button> <button type="button" class="btn" id="do-print">' + esc(t('bt.print.btn')) + '</button></p><p class="muted pr-status" id="pdf-status" role="status" aria-live="polite"></p>';
      head += '</header>';
      if (!can) return '<div class="wrap page print">' + crumb(t('nav.print')) + head + '<div class="empty"><p>' + esc(t('bt.print.empty')) + '</p></div></div>';
      var body;
      if (printMode === 'sheet') body = printSheetHTML(all);
      else if (printMode === 'cal') body = printCalHTML();
      else { var old = view0(), i = old.indexOf('<div class="sheet'); body = i >= 0 ? old.slice(i, old.lastIndexOf('</div>')) : ''; }
      return '<div class="wrap page print pr-' + printMode + '">' + crumb(t('nav.print')) + head + body + '</div>';
    };
    var after0 = AFTER.print;
    AFTER.print = function () {
      after0.apply(null, arguments);
      document.querySelectorAll('[data-pfact]').forEach(function (cb) {
        cb.addEventListener('change', function () {
          var keys = printFactKeys(), k = cb.getAttribute('data-pfact'), i = keys.indexOf(k);
          if (cb.checked && i < 0) { if (keys.length >= PRINT_FACTS_MAX) { cb.checked = false; toast(t('bt.print.factsMax')); return; } keys.push(k); }
          if (!cb.checked && i >= 0) keys.splice(i, 1);
          store.set('printFacts', keys); store.set('printOptsOpen', true); route({ keepScroll: true });
        });
      });
      var rs = document.getElementById('pr-reset'); if (rs) rs.addEventListener('click', function () { store.del('printFacts'); route({ keepScroll: true }); });
      var op = document.querySelector('.pr-opts'); if (op) op.addEventListener('toggle', function () { store.set('printOptsOpen', op.open); });
      document.querySelectorAll('[data-psort]').forEach(function (b) { b.addEventListener('click', function () { store.set('printSort', b.getAttribute('data-psort')); route({ keepScroll: true }); }); });
      var pb = document.getElementById('do-pdf');
      if (pb) pb.addEventListener('click', function () {
        if (pdfBusy) return; pdfBusy = true;
        var st = document.getElementById('pdf-status'), mode = printMode; pb.disabled = true; if (st) st.textContent = t('bt.pdf.making');
        pdfMake(mode).then(function (blob) { return pdfDeliver(blob, pdfName(mode)); }).then(function (r) {
          pdfBusy = false; pb.disabled = false; if (st) st.textContent = r === 'cancel' ? '' : t('bt.pdf.done');
        }).catch(function (e) { pdfBusy = false; pb.disabled = false; if (st) st.textContent = t('bt.pdf.fail'); window.__btPdfErr = String(e && e.message || e); });
      });
    };
  })();

  /* ===================== 1.23.0: EASIER TO FIND + EDIT MY CARD =====================
     Tab bar: Home, Chat, My card, Emergency, Menu (About lives in the menu and the footer). The My card tab shows your photo.
     Menu: Home, Chat, My card. Home: Department chat card first, then the "Your card" strip. Your own person page: an Edit link on every
     section (#/me/<group> opens My card with only that section open) + chips for the sections still empty.
     My card: jump chips with counts, "Next empty question", Save bar stays in view. Helpers are prefixed nv. */
  (function () {
    ['#/me', '#/chat'].forEach(function (h) {   // menu order: Home, Chat, My card
      for (var i = 0; i < NAV.length; i++) if (NAV[i].href === h) { var n = NAV.splice(i, 1)[0]; n.group = 'Start'; NAV.splice(1, 0, n); break; }
    });
  })();
  function nvTabPaint() {
    var tab = document.querySelector('.tabbar [data-tab="me"]'); if (!tab) return;
    var me = getMe(), p = parts(), on = p[0] === 'me' || (p[0] === 'person' && me && p[1] === me.id);
    tab.classList.toggle('is-active', !!on); if (on) tab.setAttribute('aria-current', 'page'); else tab.removeAttribute('aria-current');
    var slot = tab.querySelector('.tab-me__pic'), src = me && me.photo ? me.photo : '';
    if (slot && slot.getAttribute('data-src') !== src) { slot.setAttribute('data-src', src); slot.innerHTML = src ? '<img src="' + esc(src) + '" alt="">' : icon('card', 'tab-me__ico'); }
    tab.classList.toggle('tab-me--todo', !me);
  }
  var updateNavBadges1 = updateNavBadges;
  updateNavBadges = function () { updateNavBadges1(); nvTabPaint(); };
  function nvSections() {   // [{id, label}] every collapsible section of My card, in form order
    var nvPos = (getMe() || {}).pos || 'resident';   // Psych Tickler: the consultant section exists only for consultants
    var out = GROUPS.filter(function (g) { return g !== 'consultant' || nvPos === 'consultant'; }).map(function (g) { return { id: g, label: groupLabel(g) }; });
    out.push({ id: 'playlists', label: t('bt.f.playlists') });
    LISTS.forEach(function (L) { out.push({ id: 'list-' + L.key, label: listLabel(L.key) }); });
    out.push({ id: 'custom', label: t('bt.custom.title') });
    return out;
  }
  function nvHomeStrip() {
    var me = getMe();
    if (!me) return '<section class="card nv-me nv-me--none"><div class="nv-me__t"><strong>' + esc(t('bt.nv.homeNone')) + '</strong><span>' + esc(t('bt.nv.homeNoneT')) + '</span></div><p class="nv-me__acts"><a class="btn btn--solid" href="#/me">' + esc(t('bt.nv.make')) + '</a></p></section>';
    var comp = completeness(me), pct = Math.round(100 * comp.n / comp.total);
    return '<section class="card nv-me"><a class="nv-me__who" href="#/person/' + encodeURIComponent(me.id) + '">' + avatar(me, 'avatar--sm') + '<span class="nv-me__t"><span class="nv-me__k">' + esc(t('bt.nv.homeH')) + '</span><strong>' + esc(me.name) + '</strong>' +
      '<span class="meter__bar nv-me__bar"><span style="width:' + pct + '%"></span></span><span class="muted">' + esc(tf('bt.me.complete', comp)) + '</span></span></a>' +
      '<p class="nv-me__acts"><a class="btn btn--solid" href="#/me">' + icon('edit', 'btn__ico') + esc(t('bt.person.edit')) + '</a></p></section>';
  }
  (function () {
    var homeV = VIEWS.home;
    VIEWS.home = function () {   // Department chat card stays first (members), then Your card
      var html = homeV.apply(null, arguments), w = '<div class="wrap home">', chat = homeChatHTML();
      if (chat && html.indexOf(w + chat) >= 0) return html.replace(w + chat, w + chat + nvHomeStrip());
      return html.replace(w, w + nvHomeStrip());
    };
    var personV = VIEWS.person;
    VIEWS.person = function (id) {
      var html = personV.apply(null, arguments), c = findPerson(String(id || ''));
      if (!c || !isMe(c)) return html;
      function link(sec) { return ' <a class="nv-edit" href="#/me/' + sec.id + '" aria-label="' + esc(tf('bt.nv.secEditA', { section: sec.label })) + '">' + icon('edit', 'nv-edit__ico') + esc(t('bt.nv.secEdit')) + '</a>'; }
      var empty = [];
      nvSections().forEach(function (sec) {
        var a = '<h2>' + esc(sec.label) + '</h2>', b = '<h2 id="' + sec.id + '">' + esc(sec.label) + '</h2>', done = false;
        [a, b].forEach(function (h) { if (!done && html.indexOf(h) >= 0) { html = html.replace(h, h.replace('<h2', '<h2 class="nv-h"').replace('</h2>', link(sec) + '</h2>')); done = true; } });
        if (!done) empty.push(sec);
      });
      if (empty.length) {
        var box = '<section class="nv-empty"><h2>' + esc(t('bt.nv.emptyH')) + '</h2><p class="muted">' + esc(t('bt.nv.emptyT')) + '</p><p class="nv-chips">' + empty.map(function (sec) { return '<a class="nv-chip" href="#/me/' + sec.id + '">+ ' + esc(sec.label) + '</a>'; }).join('') + '</p></section>';
        var at = html.lastIndexOf('<p class="person__foot'); html = at < 0 ? html + box : html.slice(0, at) + box + html.slice(at);
      }
      return html;
    };
    var meV = VIEWS.me, meA = AFTER.me;
    VIEWS.me = function () {
      var html = meV.apply(null, arguments);
      var jump = '<nav class="nv-jump" aria-label="' + esc(t('bt.nv.jump')) + '"><p class="nv-jump__k">' + esc(t('bt.nv.jump')) + '</p><div class="nv-chips">' + [{ id: 'consultant', label: groupLabel('consultant'), pos: 1 }].filter(function () { return ((getMe() || {}).pos || 'resident') !== 'consultant'; }).concat(nvSections()).map(function (sec) { return '<button type="button" class="nv-chip" data-nvjump="' + sec.id + '"' + (sec.pos ? ' data-posgroup="consultant" hidden' : '') + '>' + esc(sec.label) + ' <span class="nv-chip__n" data-nvn="' + sec.id + '"></span></button>'; }).join('') + '</div>' +
        '<p class="nv-jump__next"><button type="button" class="btn" id="nv-next">' + esc(t('bt.nv.nextEmpty')) + ' →</button> <span class="muted" id="nv-next-status" role="status" aria-live="polite"></span></p></nav>';
      return html.replace('<details class="fgroup"', jump + '<details class="fgroup"').replace('<div class="form__acts">', '<div class="form__acts nv-save">');
    };
    function nvBox(form, id) { var n = form.querySelector('.fgroup__n[data-group="' + id + '"]'); return n ? n.closest('details') : null; }
    function nvOpen(form, id, only, focus) {
      var d = nvBox(form, id); if (!d) return;
      if (only) form.querySelectorAll('details.fgroup').forEach(function (x) { x.open = x === d; });
      d.open = true;
      setTimeout(function () {
        var top = document.querySelector('.topbar'), y = d.getBoundingClientRect().top + window.scrollY - (top ? top.offsetHeight : 0) - 10;
        window.scrollTo(0, Math.max(0, y));
        if (focus) { var f = d.querySelector('input,textarea,select'); if (f) f.focus({ preventScroll: true }); }
      }, 60);
    }
    AFTER.me = function (arg) {
      meA.apply(null, arguments);
      var form = document.getElementById('me-form'); if (!form) return;
      var clr = document.getElementById('me-clear'), bar = form.querySelector('.nv-save');
      if (clr && bar) { var cp = document.createElement('p'); cp.className = 'nv-clear'; bar.parentNode.insertBefore(cp, bar); cp.appendChild(clr); }
      function counts() { form.querySelectorAll('[data-nvn]').forEach(function (el) { var n = form.querySelector('.fgroup__n[data-group="' + el.getAttribute('data-nvn') + '"]'); el.textContent = n ? n.textContent : ''; }); }
      counts();
      form.addEventListener('input', function () { clearTimeout(form._nv); form._nv = setTimeout(counts, 320); });
      form.addEventListener('click', function (e) {
        var j = e.target.closest('[data-nvjump]');
        if (j) { nvOpen(form, j.getAttribute('data-nvjump'), false, false); return; }
        if (e.target.closest('.custom-rm, .nf-up, #custom-add, #pl-add, [data-ladd]')) setTimeout(counts, 50);
      });
      var next = document.getElementById('nv-next'), st = document.getElementById('nv-next-status');
      if (next) next.addEventListener('click', function () {
        var els = Array.prototype.filter.call(form.elements, function (el) { return el.name && has(FIELD_BY, el.name) && !el.value.trim() && !el.closest('[hidden]'); });   // form order: Quick card first
        if (!els.length) { st.textContent = t('bt.nv.allDone'); return; }
        var el = els[0], last = next._last;
        if (last && last.isConnected) for (var k = 0; k < els.length; k++) if (last.compareDocumentPosition(els[k]) & 4) { el = els[k]; break; }
        next._last = el; st.textContent = '';
        var d = el.closest('details'); if (d) d.open = true;
        setTimeout(function () {
          var top = document.querySelector('.topbar'), y = el.closest('.field').getBoundingClientRect().top + window.scrollY - (top ? top.offsetHeight : 0) - 14;
          window.scrollTo(0, Math.max(0, y)); el.focus({ preventScroll: true });
        }, 60);
      });
      if (arg && arg !== 'emergency') nvOpen(form, String(arg), true, false);
    };
  })();

  /* ===================== 1.24.0 LOOK REFRESH: search folds into a button on phones ===================== */
  (function () {
    var box = document.querySelector('.topbar .search'), q = document.getElementById('q'); if (!box || !q) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'icon-btn lk-search-btn'; b.id = 'lk-search-btn'; b.setAttribute('aria-expanded', 'false');
    b.setAttribute('aria-label', t('search.label'));
    b.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M13 13l4.5 4.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
    box.parentNode.insertBefore(b, box);
    function set(on) { document.body.classList.toggle('lk-search', on); b.setAttribute('aria-expanded', on ? 'true' : 'false'); if (on) q.focus(); }
    b.addEventListener('click', function () { set(!document.body.classList.contains('lk-search')); });
    q.addEventListener('blur', function () { setTimeout(function () { if (!q.value && document.activeElement !== q) set(false); }, 200); });
    window.addEventListener('hashchange', function () { if (!q.value) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === '/' && !/input|textarea|select/i.test((document.activeElement || {}).tagName || '')) document.body.classList.add('lk-search'); }, true);
  })();

  TITLES.person = function () { return t('nav.batch'); };
  rebuildIndex();

  /* ===================== PSYCH TICKLER 1.0.0: A DEPARTMENT, NOT ONE BATCH =====================
     New card keys (sanitizePT): pos ('resident' | 'consultant' | 'alumni'), startYear (year they entered residency = their
     batch; 0 for consultants), chief (bool), showYear (bool: birth year visible to others; off by default and then never
     uploaded), aud {fieldKey: 'res' | 'batch'} (who sees a field; missing = everyone in the department).
     The position an admin set in Cloud sync (store `roles`, by the card owner's uid from store `owners`) wins over what
     the card says, so alumni and corrected year levels show the same on every phone.
     Store `parts` {cardId: {res: {field: value}, batch: {…}}}: restricted fields this phone is allowed to read, laid over
     the cards when shown. Strings for everything in this section: data/strings-pt.js (keys pt.*). */
  function sanitizePT(c, out) {
    out.pos = POS.indexOf(c.pos) >= 0 ? c.pos : 'resident';
    out.startYear = out.pos === 'consultant' ? 0 : toInt(c.startYear, 1980, 2100);
    out.chief = !!c.chief && out.pos === 'resident';
    out.showYear = !!c.showYear;
    out.aud = {};
    var a = c.aud && typeof c.aud === 'object' ? c.aud : {};
    if (out.pos !== 'consultant') Object.keys(a).forEach(function (k) { var f = FIELD_BY[k]; if (f && PRIV_GROUPS.indexOf(f.group) < 0 && (a[k] === 'res' || a[k] === 'batch')) out.aud[k] = a[k]; });
  }
  function collectPT(form, c) {
    var E = form.elements;
    c.pos = E.pos ? E.pos.value : 'resident';
    c.startYear = E.startYear ? E.startYear.value : '';
    c.chief = !!(E.chief && E.chief.checked);
    c.showYear = !!(E.showYear && E.showYear.checked);
    c.aud = {};
    if (c.pos !== 'consultant') form.querySelectorAll('select.aud').forEach(function (el) { if (el.value !== 'all') c.aud[el.getAttribute('data-k')] = el.value; });
  }
  function defaultStartYear() { var m = /^(\d{4})/.exec((window.HOSPITAL || {}).residencyStart || ''); return m ? +m[1] : new Date().getFullYear(); }
  function posFieldset(me) {
    var pos = me.pos || 'resident';
    return '<fieldset class="field fieldset pos-set"><legend class="field__l">' + esc(t('pt.pos.label')) + '</legend><div class="field__row">' +
      '<label class="field field--sm"><span class="field__l">' + esc(t('pt.pos.iam')) + '</span><select name="pos">' + POS.map(function (p) { return '<option value="' + p + '"' + (pos === p ? ' selected' : '') + '>' + esc(t('pt.pos.' + p)) + '</option>'; }).join('') + '</select></label>' +
      '<label class="field field--sm pos-res"' + (pos === 'consultant' ? ' hidden' : '') + '><span class="field__l">' + esc(t('pt.pos.startYear')) + '</span><input name="startYear" type="number" inputmode="numeric" min="1980" max="2100" placeholder="' + defaultStartYear() + '" value="' + (me.startYear || '') + '"></label></div>' +
      '<span class="field__h pos-res"' + (pos === 'consultant' ? ' hidden' : '') + '>' + esc(t('pt.pos.startHint')) + '</span>' +
      '<label class="pt-tick pos-chief"' + (pos === 'resident' ? '' : ' hidden') + '><input type="checkbox" name="chief"' + (me.chief ? ' checked' : '') + '> <span>' + esc(t('pt.pos.chief')) + '</span></label></fieldset>';
  }
  function posAttr(g, me) { return g === 'consultant' ? ' data-posgroup="consultant"' + ((me.pos || 'resident') === 'consultant' ? '' : ' hidden') : ''; }
  function audSel(f, me) {
    if (PRIV_GROUPS.indexOf(f.group) >= 0 || f.group === 'consultant') return '';
    var cur = (me.aud && me.aud[f.key]) || 'all';
    return '<label class="aud-l' + (cur !== 'all' ? ' is-set' : '') + '"' + ((me.pos || 'resident') === 'consultant' ? ' hidden' : '') + '>' + icon('lock', 'aud-l__ico') + '<span class="sr-only">' + esc(tf('pt.aud.for', { field: fieldLabel(f.key) })) + '</span><select class="aud" data-k="' + f.key + '">' +
      [['all', 'pt.aud.all'], ['res', 'pt.aud.res'], ['batch', 'pt.aud.batch']].map(function (o) { return '<option value="' + o[0] + '"' + (cur === o[0] ? ' selected' : '') + '>' + esc(t(o[1])) + '</option>'; }).join('') + '</select></label>';
  }
  /* position as shown: what an admin recorded wins over what the card says */
  var roleCache = { at: 0, owners: {}, roles: {} };
  function roleMaps() { if (Date.now() - roleCache.at > 1500) roleCache = { at: Date.now(), owners: store.get('owners', {}) || {}, roles: store.get('roles', {}) || {} }; return roleCache; }
  function roleInfo(c) {
    var m = roleMaps(), r = m.owners[c.id] ? m.roles[m.owners[c.id]] : null;
    if (!r && isMe(c)) { var cs = cst(); if (cs.role) r = { role: cs.role, batch: +cs.batch || 0 }; }
    return r ? { pos: r.role, year: +r.batch || 0 } : { pos: c.pos || 'resident', year: +c.startYear || 0 };
  }
  function yearLevel(year) { return year ? new Date().getFullYear() - year + 1 : 0; }   // residency years start on 1 January
  function posKey(c) {
    var r = roleInfo(c); if (r.pos !== 'resident') return r.pos;
    var n = yearLevel(r.year); if (!r.year) return 'resident';
    return n <= 0 ? 'y0' : n === 1 ? 'y1' : n === 2 ? 'y2' : n === 3 ? 'y3' : 'alumni';
  }
  function posText(c) {
    var r = roleInfo(c), n = yearLevel(r.year), k = posKey(c), out;
    if (k === 'consultant') out = t('pt.pos.consultant');
    else if (k === 'alumni') out = t('pt.pos.alumni');
    else if (k === 'resident') out = t('pt.pos.resident');
    else out = t('pt.pos.' + k);
    if (c.chief && r.pos === 'resident') out = t('pt.pos.chiefShort') + ' · ' + out;
    return out;
  }
  function posChip(c) { return isPartner(c) ? '' : '<span class="pcard__meta pos-chip pos-chip--' + posKey(c) + '">' + esc(posText(c)) + '</span>'; }
  function posLine(c) { if (isPartner(c)) return ''; var r = roleInfo(c); return '<p class="person__pos"><span class="badge pos-badge">' + esc(posText(c)) + '</span>' + (r.pos !== 'consultant' && r.year ? ' <span class="muted">' + esc(tf('pt.pos.batchN', { year: r.year })) + '</span>' : '') + '</p>'; }
  function posFilters(all) {
    var n = {}; all.forEach(function (c) { var k = posKey(c); n[k] = (n[k] || 0) + 1; });
    return [['all', t('pt.pos.everyone'), all.length]].concat(['consultant', 'y3', 'y2', 'y1', 'y0', 'resident', 'alumni'].filter(function (k) { return n[k]; }).map(function (k) { return [k, t('pt.pos.' + k + 's'), n[k]]; }));
  }
  /* restricted fields I am allowed to read are laid over the cards */
  var getOthers0 = getOthers;
  getOthers = function () {
    var list = getOthers0(), parts = store.get('parts', null);
    if (!parts || typeof parts !== 'object') return list;
    list.forEach(function (c) { var p = parts[c.id]; if (!p) return; ['res', 'batch'].forEach(function (a) { var f = p[a]; if (f) Object.keys(f).forEach(function (k) { if (FIELD_BY[k] && f[k] && !c[k]) c[k] = f[k]; }); }); });
    return list;
  };
  /* My card: show/hide the pieces that depend on the position */
  (function () {
    var after0 = AFTER.me;
    AFTER.me = function () {
      after0.apply(null, arguments);
      var form = document.getElementById('me-form'); if (!form || !form.elements.pos) return;
      function paint() {
        var p = form.elements.pos.value;
        form.querySelectorAll('.pos-res').forEach(function (el) { el.hidden = p === 'consultant'; });
        form.querySelectorAll('.pos-chief').forEach(function (el) { el.hidden = p !== 'resident'; });
        form.querySelectorAll('[data-posgroup]').forEach(function (el) { el.hidden = el.getAttribute('data-posgroup') !== p; });
        form.querySelectorAll('.aud-l').forEach(function (el) { el.hidden = p === 'consultant'; });
      }
      form.elements.pos.addEventListener('change', paint);
      form.addEventListener('change', function (e) { var s = e.target.closest && e.target.closest('select.aud'); if (s) s.parentNode.classList.toggle('is-set', s.value !== 'all'); });
    };
    var view0 = VIEWS.me;
    VIEWS.me = function () {
      var html = view0.apply(null, arguments);
      if (!getMe()) html = html.replace('<form id="me-form"', bringStrip() + '<form id="me-form"');
      return html;
    };
  })();

  /* ---- Bring my card from Batch Tickler (#/bring). Both apps live on isaymotion.github.io, so this app can read the card
          Batch Tickler saved on this phone (key bt:v1:me). Nothing is read from the cloud and nothing changes in Batch Tickler. ---- */
  var BT_KEY = 'bt:v1:me';
  function btCheck(raw) { return raw && typeof raw === 'object' && !Array.isArray(raw) && cleanText(raw.name, 80) ? raw : null; }
  function btCard() { try { return btCheck(JSON.parse(window.localStorage.getItem(BT_KEY))); } catch (e) { return null; } }
  /* 1.1.2: installed Home Screen apps (iPhone, iPad, Safari "Add to Dock") each keep their own storage, so the card can
     also come from a Batch Tickler backup file (Batch Tickler ☰ › Backup › Export). Only data.me is read; it is held
     in memory until "Bring my card" is tapped. No other key is imported and nothing under bt:v1: is ever written. */
  var BRING_FILE_MAX = 15 * 1024 * 1024, bringFile = null;   // {card, name}
  function bringSrc() { if (bringFile) return { card: bringFile.card, file: bringFile.name }; var b = btCard(); return b ? { card: b, file: '' } : null; }
  function bringStrip() {
    var found = !!btCard();
    return '<a class="card sync-strip bring-strip" href="#/bring">' + icon('card', 'sync-strip__ico') + '<span class="em-strip__t"><strong>' + esc(t('pt.bring.stripH')) + '</strong><span>' + esc(t(found ? 'pt.bring.strip' : 'pt.bring.stripFile')) + '</span></span></a>';
  }
  function bringPicker(again) {
    return '<div class="bring-file"><p class="field__h">' + esc(t(again ? 'pt.bring.fileAgain' : 'pt.bring.fileH')) + '</p>' +
      '<p class="form__acts"><input type="file" id="bring-file" class="sr-only" accept=".json,application/json"><label class="btn' + (again ? '' : ' btn--solid') + '" for="bring-file">' + esc(t('pt.bring.fileBtn')) + '</label></p>' +
      '<p class="form__status" id="bring-file-status" role="status" aria-live="polite"></p></div>';
  }
  var BRING_ON = ['basics', 'background', 'favourites', 'life'], BRING_OFF = ['contact', 'emergency'];
  var BRING_EXTRA = [['photo', 'pt.bring.x.photo', function (b) { return !!b.photo; }], ['birthday', 'pt.bring.x.birthday', function (b) { return !!b.bmonth; }],
    ['lists', 'pt.bring.x.lists', function (b) { return (b.playlists || []).length || (b.netflix || []).length || Object.keys(b.lists || {}).length; }],
    ['custom', 'pt.bring.x.custom', function (b) { return (b.custom || []).length; }],
    ['fun', 'pt.bring.x.fun', function (b) { return b.truths || b.baby || b.anthem || Object.keys(b.tot || {}).length; }]];
  function realGroup(g) { return FIELDS.filter(function (f) { return f.group === g; }); }
  NAV.push({ label: 'Bring my card from Batch Tickler', tkey: 'nav.bring', href: '#/bring', icon: 'card', group: 'App', tile: false });
  VIEWS.bring = function () {
    var src = bringSrc(), b = src && src.card, me = getMe(), html = pageHead('bring', 'nav.bring', 'pt.bring.intro');
    if (!b) return html + '<div class="empty"><h2>' + esc(t('pt.bring.noneH')) + '</h2><p>' + esc(t('pt.bring.none')) + '</p>' + bringPicker(false) + '<p><a class="btn" href="#/me">' + esc(t('pt.bring.fresh')) + '</a></p></div></div>';
    var sb = sanitizeCard(Object.assign({}, b, { id: b.id || 'x' })) || {};
    function row(name, label, n, on, note) { return '<label class="sync__tick"><input type="checkbox" name="' + name + '"' + (on ? ' checked' : '') + (n ? '' : ' disabled') + '> <span><strong>' + esc(label) + '</strong><span class="field__h">' + esc(n ? note : t('pt.bring.empty')) + '</span></span></label>'; }
    function count(g) { return realGroup(g).filter(function (f) { return sb[f.key]; }).length; }
    return html + '<form class="card form" id="bring-form"><div class="bring-who">' + avatar(sb, 'avatar--lg') + '<div><h2>' + esc(sb.name || '') + '</h2><p class="muted">' + esc(src.file ? tf('pt.bring.foundFile', { name: src.file }) : t('pt.bring.found')) + '</p></div></div>' + bringPicker(true) +
      '<h3>' + esc(t('pt.bring.takeH')) + '</h3>' +
      BRING_ON.map(function (g) { var n = count(g); return row('g_' + g, groupLabel(g), n, true, tf('pt.bring.nFields', { n: n })); }).join('') +
      BRING_EXTRA.map(function (x) { var n = x[2](sb) ? 1 : 0; return row('x_' + x[0], t(x[1]), n, true, t(x[1] + '.h')); }).join('') +
      '<h3>' + esc(t('pt.bring.leaveH')) + '</h3><p class="field__h">' + esc(t('pt.bring.leave')) + '</p>' +
      '<details class="fgroup"><summary><span>' + esc(groupLabel('contact')) + '</span><span class="muted fgroup__n">' + tf('pt.bring.nFields', { n: count('contact') }) + '</span></summary><div class="fgroup__body">' +
        (realGroup('contact').filter(function (f) { return sb[f.key]; }).map(function (f) { return '<label class="sync__tick"><input type="checkbox" name="f_' + f.key + '"> <span><strong>' + esc(fieldLabel(f.key)) + '</strong><span class="field__h">' + esc(String(sb[f.key]).slice(0, 60)) + '</span></span></label>'; }).join('') || '<p class="muted">' + esc(t('pt.bring.empty')) + '</p>') + '</div></details>' +
      row('g_emergency', groupLabel('emergency'), count('emergency'), false, t('pt.bring.emergency')) +
      (me ? '<fieldset class="field fieldset"><legend class="field__l">' + esc(t('pt.bring.haveH')) + '</legend><label class="pt-radio"><input type="radio" name="mode" value="fill" checked> ' + esc(t('pt.bring.fill')) + '</label><label class="pt-radio"><input type="radio" name="mode" value="replace"> ' + esc(t('pt.bring.replace')) + '</label></fieldset>' : '') +
      '<p class="form__status" id="bring-status" role="status" aria-live="polite"></p>' +
      '<div class="form__acts"><button type="submit" class="btn btn--solid">' + esc(t('pt.bring.go')) + '</button> <a class="btn" href="#/me">' + esc(t('pt.bring.skip')) + '</a></div>' +
      '<p class="field__h">' + esc(t('pt.bring.foot')) + '</p></form></div>';
  };
  AFTER.bring = function () {
    var fi = document.getElementById('bring-file');
    if (fi) fi.addEventListener('change', function () {
      var file = fi.files && fi.files[0], st = document.getElementById('bring-file-status');
      function fail(k) { st.textContent = t(k); st.classList.add('is-error'); fi.value = ''; }
      if (!file) return;
      st.classList.remove('is-error'); st.textContent = '';
      if (file.size > BRING_FILE_MAX) return fail('pt.bring.fileBig');
      var reader = new FileReader();
      reader.onerror = function () { fail('pt.bring.fileBad'); };
      reader.onload = function () {
        var p, card = null;
        try { p = JSON.parse(reader.result); } catch (e) { return fail('pt.bring.fileBad'); }
        if (p && p.app === BK_APP) return fail('pt.bring.filePT');
        if (!p || p.app !== 'batchtickler' || !p.data || typeof p.data !== 'object') return fail('pt.bring.fileBad');
        if (typeof p.data.me !== 'string') return fail('pt.bring.fileNoCard');
        try { card = btCheck(JSON.parse(p.data.me)); } catch (e) { card = null; }
        if (!card) return fail('pt.bring.fileNoCard');
        bringFile = { card: card, name: String(file.name || '').slice(0, 80) };
        route({ keepScroll: true });
        toast(t('pt.bring.fileOk'));
      };
      reader.readAsText(file);
    });
    var form = document.getElementById('bring-form'); if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var s0 = bringSrc(), b = s0 && s0.card, old = getMe(), E = form.elements; if (!b) return;
      var src = sanitizeCard(Object.assign({}, b, { id: b.id || 'x' })); if (!src) return;
      var replace = !old || (E.mode && E.mode.value === 'replace');
      var c = old ? JSON.parse(JSON.stringify(old)) : { id: newId(), name: src.name, pos: 'resident', startYear: defaultStartYear(), custom: [], playlists: [], netflix: [], lists: {} };
      function put(k, v) { var has = Array.isArray(c[k]) ? c[k].length : c[k] && typeof c[k] === 'object' ? Object.keys(c[k]).length : c[k]; if (v !== undefined && v !== '' && v !== null && (replace || !has)) c[k] = v; }
      function on(n) { return !!(E[n] && E[n].checked); }
      if (replace || !c.name) c.name = src.name;
      BRING_ON.concat(['emergency']).forEach(function (g) { if (on('g_' + g)) realGroup(g).forEach(function (f) { put(f.key, src[f.key]); }); });
      realGroup('contact').forEach(function (f) { if (on('f_' + f.key)) put(f.key, src[f.key]); });
      if (on('x_photo')) put('photo', src.photo);
      if (on('x_birthday') && src.bmonth && (replace || !c.bmonth)) { c.bmonth = src.bmonth; c.bday = src.bday; c.byear = src.byear; }
      if (on('x_lists')) { put('playlists', src.playlists); put('netflix', src.netflix); put('lists', src.lists); }
      if (on('x_custom')) put('custom', src.custom);
      if (on('x_fun')) ['truths', 'baby', 'tot', 'anthem'].forEach(function (k) { put(k, src[k]); });
      c.updated = new Date().toISOString();
      var clean = sanitizeCard(c), st = document.getElementById('bring-status');
      if (!clean) { st.textContent = t('bt.me.needName'); st.classList.add('is-error'); return; }
      store.set('me', clean); store.del('meDraft'); store.set('broughtBT', clean.updated); bringFile = null; rebuildIndex();
      toast(t('pt.bring.done'));
      location.hash = '#/me';
    });
  };
  TITLES.bring = function () { return t('nav.bring'); };
  (function () {   // Home: offer the move to anyone with no card here yet (found on this phone, or from a backup file)
    var home0 = VIEWS.home;
    VIEWS.home = function () {
      var html = home0.apply(null, arguments);
      if (getMe()) return html;
      var strip = bringStrip();
      return html.indexOf('<div class="home__stats">') >= 0 ? html.replace('<div class="home__stats">', strip + '<div class="home__stats">') : html.replace(/(<\/header>)/, '$1' + strip);
    };
  })();


  /* ===================== PSYCH TICKLER 1.3.0: EVENT POSTERS AND PROGRAMMES =====================
     Built-in events (data/dept-events.js) may carry `poster` (a file under img/events/), `program` and `moderator`.
     Events members add may carry a poster too: the picture lives in the cloud only (programs/{code}/posters/{eventId},
     shrunk like a chat photo), the event keeps a number (`poster`, the upload time) and each phone fetches the picture
     when Department events is opened. #announcements is listed first in Chat and pins the built-in events. */
  var posterCache = {}, evPoster = null, evPosterRm = false;
  function evCode() { return cst().code || ''; }
  function posterBtn(src, title) {
    return '<button type="button" class="ev__poster" aria-label="' + esc(tf('pt.ev.posterOpen', { title: title })) + '"><img src="' + esc(src) + '" loading="lazy" alt="' + esc(tf('pt.ev.posterAlt', { title: title })) + '"></button>';
  }
  function evPosterHTML(e) {
    if (e.dept) return e.poster ? posterBtn(e.poster, e.title) : '';
    if (!e.poster || e.builtin) return '';
    var c = posterCache[e.id];
    if (c && c.stamp === e.poster) return posterBtn(c.data, e.title);
    return '<span class="muted ev__pwait" data-evposter="' + esc(e.id) + '">' + esc(t(isSynced() ? 'pt.ev.posterLoading' : 'pt.ev.posterNone')) + '</span>';
  }
  function evProgHTML(e) {
    if (!e.program || !e.program.length) return '';
    return '<details class="ev__list ev__prog"><summary>' + esc(t('pt.ev.program')) + ' <span class="muted">(' + e.program.length + ')</span></summary>' +
      (e.moderator ? '<p class="muted ev__mod">' + esc(tf('pt.ev.moderator', { name: e.moderator })) + '</p>' : '') +
      '<ul class="plain">' + e.program.map(function (p) { return '<li><span class="ev__pt">' + esc(p.time) + '</span><span class="ev__pb"><b>' + esc(p.title) + '</b>' + (p.by ? '<span class="muted">' + esc(p.by) + '</span>' : '') + '</span></li>'; }).join('') + '</ul></details>';
  }
  function loadPosters() {   // fetch the posters of the events on screen, once per poster per visit to the app
    var els = main.querySelectorAll('[data-evposter]'); if (!els.length || !isSynced()) return;
    var code = cst().code;
    cloud().then(function (api) {
      Array.prototype.forEach.call(els, function (el) {
        var id = el.getAttribute('data-evposter'), e = storedEvents().filter(function (x) { return x.id === id; })[0];
        function none() { el.textContent = t('pt.ev.posterNone'); }
        if (!e || !api.getPoster) { none(); return; }
        api.getPoster(code, id).then(function (p) {
          if (!p || !okChatImg(p)) { none(); return; }
          posterCache[id] = { stamp: e.poster, data: p.data };
          if (el.parentNode) el.outerHTML = posterBtn(p.data, e.title);
        }).catch(none);
      });
    }).catch(function () {});
  }
  function posterZoom(src, alt, from) {
    var z = document.createElement('div'); z.className = 'chat-zoom chat-zoom--poster'; z.setAttribute('role', 'dialog'); z.setAttribute('aria-modal', 'true'); z.setAttribute('aria-label', alt || t('pt.ev.poster'));
    z.innerHTML = '<button type="button" class="icon-btn chat-zoom__x" aria-label="' + esc(t('bt.chat.close')) + '">' + icon('x') + '</button><img src="' + esc(src) + '" alt="' + esc(alt || '') + '">';
    function close() { document.removeEventListener('keydown', key); if (z.parentNode) z.parentNode.removeChild(z); if (from && from.focus) from.focus(); }
    function key(e) { if (e.key === 'Escape') close(); }
    z.addEventListener('click', close); document.addEventListener('keydown', key);
    window.addEventListener('hashchange', close, { once: true });
    document.body.appendChild(z); z.querySelector('button').focus();
  }
  document.addEventListener('click', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.ev__poster') : null; if (!b) return;
    var im = b.querySelector('img'); if (im) posterZoom(im.getAttribute('src'), im.getAttribute('alt'), b);
  });
  function evPosterField(e) {
    var h = '<div class="field ev-poster" id="ev-poster"><span class="field__l">' + esc(t('pt.ev.poster')) + '</span><span class="field__h">' + esc(t('pt.ev.posterHint')) + '</span>';
    if (!isSynced()) return h + '<p class="muted">' + esc(t('pt.ev.posterNeedSync')) + '</p></div>';
    var has = !!(evPoster || (e && e.poster && !evPosterRm));
    return h + (evPoster ? '<img class="ev-poster__prev" src="' + esc(evPoster.data) + '" alt="">' : '') +
      '<p class="form__acts"><input type="file" id="ev-poster-file" class="sr-only" accept="image/*"><label class="btn" for="ev-poster-file">' + esc(t(has ? 'pt.ev.posterChange' : 'pt.ev.posterAdd')) + '</label>' +
      (has ? '<button type="button" class="link-btn" id="ev-poster-rm">' + esc(t('pt.ev.posterRemove')) + '</button>' : '') + '</p>' +
      '<p class="form__status" id="ev-poster-st" role="status">' + esc(evPoster ? tf('pt.ev.posterReady', { kb: Math.round(evPoster.data.length * 0.75 / 1024) }) : evPosterRm ? t('pt.ev.posterRemoved') : '') + '</p></div>';
  }
  function bindPosterField() {   // only this field is redrawn when a picture is chosen, so what was typed in the form stays
    var box = document.getElementById('ev-poster'), fi = document.getElementById('ev-poster-file'), rm = document.getElementById('ev-poster-rm'); if (!box) return;
    function redraw() { var cur = evEdit ? storedEvents().filter(function (x) { return x.id === evEdit; })[0] : null; box.outerHTML = evPosterField(cur); bindPosterField(); }
    if (fi) fi.addEventListener('change', function () {
      var file = fi.files && fi.files[0], st = document.getElementById('ev-poster-st'); fi.value = ''; if (!file) return;
      st.classList.remove('is-error'); st.textContent = t('bt.chat.shrinking');
      chatPhoto(file, function (im) {
        if (!im) { st.textContent = t('pt.ev.posterBad'); st.classList.add('is-error'); return; }
        evPoster = im; evPosterRm = false; redraw();
      });
    });
    if (rm) rm.addEventListener('click', function () { if (evPoster) evPoster = null; else evPosterRm = true; redraw(); });
  }
  function annPinsHTML() {
    var today = new Date(), up = deptEvents().filter(function (e) { return evLeft(e, today) >= 0; }).sort(function (a, b) { return (a.date + a.time).localeCompare(b.date + b.time); }).slice(0, 4);
    if (!up.length) return '';
    return '<details class="card chat-pins" id="chat-pins"><summary><span aria-hidden="true">📌</span> ' + esc(t('pt.ann.pins')) + ' <span class="muted">(' + up.length + ')</span></summary><div class="chat-pins__body"><ul class="plain ev-list">' +
      up.map(function (e) {
        return '<li class="ev"><div class="ev__body"><strong>' + esc(e.title) + '</strong><span class="muted">' + esc(evWhen(e, today)) + ' · ' + esc(evDate(e)) + (e.place ? ' · ' + esc(e.place) : '') + '</span>' + evPosterHTML(e) + evProgHTML(e) +
          (e.url ? '<span class="ev__acts"><a class="link-btn" href="' + esc(e.url) + '" target="_blank" rel="noopener">' + esc(t('pt.ev.register')) + '</a></span>' : '') + '</div></li>';
      }).join('') + '</ul><p><a class="link-btn" href="#/events">' + esc(t('pt.ann.open')) + '</a></p></div></details>';
  }

  /* ===================== PSYCH TICKLER 1.2.0: DIDACTICS DAY (EVERY THURSDAY) =====================
     A built-in weekly reminder, worked out on the phone (no cloud data): a Home card on Thursdays (and a heads-up
     on Wednesdays), a pinned row on Department events with the next date, and a weekly .ics (RRULE BYDAY=TH). */
  var DD_DOW = 4;   // 0 Sunday … 4 Thursday
  function ddNext(today) { var d = new Date(today.getFullYear(), today.getMonth(), today.getDate()); d.setDate(d.getDate() + ((DD_DOW - d.getDay() + 7) % 7)); return d; }
  function ddIso(d) { return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
  function ddHome(today) {
    var dow = today.getDay(), k = dow === DD_DOW ? 'today' : dow === (DD_DOW + 6) % 7 ? 'tomorrow' : '';
    if (!k) return '';
    var x = ddGet(ddIso(ddNext(today)));
    return '<section class="callout dd-home" aria-live="polite"><p class="callout__title">' + icon('school', 'dd-ico') + ' ' + esc(t('pt.dd.' + k + 'H')) + '</p>' + (x ? '<p class="dd-line">' + ddLine(x) + '</p>' : '') + '<p>' + esc(t('pt.dd.' + k)) + ' <a href="#/events">' + esc(t('nav.events')) + '</a></p></section>';
  }
  function ddIcs() {
    var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z'), n = ddNext(new Date()), nx = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1);
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//isaymotion//Psych Tickler//EN', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:' + icsEscape(t('pt.dd.title')),
      'BEGIN:VEVENT', 'UID:didactics-day@psychtickler.isaymotion.github.io', 'DTSTAMP:' + stamp,
      'DTSTART;VALUE=DATE:' + icsDate(n.getFullYear(), n.getMonth() + 1, n.getDate()), 'DTEND;VALUE=DATE:' + icsDate(nx.getFullYear(), nx.getMonth() + 1, nx.getDate()),
      'RRULE:FREQ=WEEKLY;BYDAY=TH', 'SUMMARY:' + icsEscape('📚 ' + t('pt.dd.title')), 'DESCRIPTION:' + icsEscape(t('pt.dd.note')), 'LOCATION:' + icsEscape(HOSP.name || ''), 'TRANSP:TRANSPARENT', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
  }
  function ddIcsOut(cb) {
    var ics = ddIcs(), name = 'didactics-day.ics', file = null;
    try { file = new File([ics], name, { type: 'text/calendar' }); } catch (e) {}
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) { navigator.share({ files: [file], title: t('pt.dd.title') }).then(function () { cb(tf('bt.cal.saved', { name: name })); }).catch(function () { cb(t('bt.share.cancelled')); }); return; }
    var url = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' })), a = document.createElement('a'); a.href = url; a.download = name; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(url); }, 4000); cb(tf('bt.cal.saved', { name: name }));
  }
  /* ---- PSYCH TICKLER 1.4.0: DIDACTICS SCHEDULE ----
     What each Thursday holds: topic, presenter, moderator and a short note. Admins write it (Department events ›
     Didactics day › Schedule), everyone in the department reads it. Cloud: programs/{code}/didactics/{YYYY-MM-DD}
     {topic, presenter, moderator, note, updated, by}; a cleared week stays as an empty row so other phones learn of it.
     Phone: store `dd` (date -> row, text only), filled by syncDD() so it also shows offline. No patient details. */
  var DD_WEEKS = 8, DD_KEEP_DAYS = 60, ddEdit = '', ddOpen = false, ddBusy = false;
  function ddAll() { var d = store.get('dd', null); return d && typeof d === 'object' && !Array.isArray(d) ? d : {}; }
  function ddClean(x) {
    function s(v, n) { return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, n); }
    x = x && typeof x === 'object' ? x : {};
    return { topic: s(x.topic, 160), presenter: s(x.presenter, 120), moderator: s(x.moderator, 120), note: s(x.note, 300), updated: +x.updated || 0 };
  }
  function ddHas(x) { return !!(x && (x.topic || x.presenter || x.moderator || x.note)); }
  function ddGet(iso) { var x = ddAll()[iso]; if (!x) return null; x = ddClean(x); return ddHas(x) ? x : null; }
  function ddOkDay(iso) { return /^\d{4}-\d{2}-\d{2}$/.test(String(iso)); }
  function ddWeeks(today, n) { var out = [], d = ddNext(today); for (var i = 0; i < n; i++) { out.push(ddIso(d)); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7); } return out; }
  function ddCanEdit() { return isSynced() && !!cst().admin; }
  function ddLine(x) {   // topic, then who
    var who = [x.presenter ? tf('pt.dd.by', { name: x.presenter }) : '', x.moderator ? tf('pt.ev.moderator', { name: x.moderator }) : ''].filter(Boolean).join(' · ');
    return (x.topic ? '<b class="dd-topic">' + esc(x.topic) + '</b>' : '') + (who ? '<span class="muted dd-who">' + esc(who) + '</span>' : '') + (x.note ? '<span class="ev__note">' + esc(x.note) + '</span>' : '');
  }
  function ddFormHTML(iso) {
    var x = ddGet(iso) || ddClean({});
    function f(name, key, max, v) { return '<label class="field"><span class="field__l">' + esc(t(key)) + '</span><input name="' + name + '" maxlength="' + max + '" value="' + esc(v) + '"></label>'; }
    return '<form id="dd-form" class="dd-form" data-day="' + esc(iso) + '">' + f('topic', 'pt.dd.fTopic', 160, x.topic) + f('presenter', 'pt.dd.fBy', 120, x.presenter) + f('moderator', 'pt.dd.fMod', 120, x.moderator) +
      '<label class="field"><span class="field__l">' + esc(t('pt.dd.fNote')) + '</span><textarea name="note" rows="2" maxlength="300">' + esc(x.note) + '</textarea><span class="field__h">' + esc(t('pt.dd.fHint')) + '</span></label>' +
      '<p class="guess__acts"><button type="submit" class="btn btn--solid">' + esc(t('pt.dd.save')) + '</button><button type="button" class="btn" id="dd-cancel">' + esc(t('bt.ev.cancel')) + '</button>' +
      (ddHas(x) ? '<button type="button" class="link-btn" id="dd-clear">' + esc(t('pt.dd.clear')) + '</button>' : '') + '</p><p class="form__status" id="dd-fst" role="status" aria-live="polite"></p></form>';
  }
  function ddSchedHTML(today) {
    if (!isSynced()) return '<p class="muted dd-need">' + esc(t('pt.dd.needSync')) + ' <a href="#/sync">' + esc(t('nav.sync')) + '</a></p>';
    var can = ddCanEdit(), weeks = ddWeeks(today, DD_WEEKS);
    return '<details class="ev__list dd-sched" id="dd-sched"' + (ddOpen || ddEdit ? ' open' : '') + '><summary>' + esc(t('pt.dd.sched')) + ' <span class="muted">(' + esc(tf('pt.dd.weeks', { n: DD_WEEKS })) + ')</span></summary>' +
      (can ? '<p class="field__h">' + esc(t('pt.dd.adminHint')) + '</p>' : '') + '<ul class="plain dd-list">' + weeks.map(function (iso) {
        var x = ddGet(iso), d = evDate({ date: iso, time: '' });
        if (ddEdit === iso && can) return '<li class="dd-wk dd-wk--edit"><span class="dd-wk__d">' + esc(d) + '</span>' + ddFormHTML(iso) + '</li>';
        return '<li class="dd-wk"><span class="dd-wk__d">' + esc(d) + '</span><span class="dd-wk__b">' + (x ? ddLine(x) : '<span class="muted">' + esc(t('pt.dd.none')) + '</span>') + '</span>' +
          (can ? '<button type="button" class="link-btn dd-wk__e" data-ddedit="' + esc(iso) + '" aria-label="' + esc(tf('pt.dd.editA', { date: d })) + '">' + esc(t(x ? 'pt.dd.edit' : 'pt.dd.add')) + '</button>' : '') + '</li>';
      }).join('') + '</ul></details>';
  }
  function ddStore(iso, x) {
    var all = ddAll(), cut = ddIso(new Date(Date.now() - DD_KEEP_DAYS * 864e5));
    all[iso] = ddClean(x);
    Object.keys(all).forEach(function (k) { if (!ddOkDay(k) || k < cut) delete all[k]; });
    store.set('dd', all);
  }
  function ddSave(iso, vals, st) {   // straight to the cloud (admins only, by the rules), then onto this phone
    if (ddBusy || !ddOkDay(iso)) return;
    var x = ddClean(vals); x.updated = Date.now(); ddBusy = true; st.classList.remove('is-error'); st.textContent = t('pt.dd.saving');
    cloud().then(function (api) {
      if (!api.user()) throw { code: 'signed-out' };
      if (!api.putDidactic) throw { code: 'unavailable' };
      return api.putDidactic(cst().code, iso, x);
    }).then(function () {
      ddBusy = false; ddStore(iso, x); ddEdit = ''; ddOpen = true; toast(t(ddHas(x) ? 'pt.dd.saved' : 'pt.dd.cleared'));
      if (currentKey() === 'events') route({ keepScroll: true });
    }).catch(function (e) { ddBusy = false; st.textContent = tf('pt.dd.failed', { why: errText(e) }); st.classList.add('is-error'); });
  }
  function syncDD(api, c, full) {   // pull the schedule; a full pull once a day also drops weeks that left the cloud
    if (!api.didacticsSince) return Promise.resolve(0);
    return api.didacticsSince(c.code, full ? 0 : (c.ddPull || 0)).then(function (list) {
      var all = full ? {} : ddAll(), old = ddAll(), maxU = full ? 0 : (c.ddPull || 0), n = 0, cut = ddIso(new Date(Date.now() - DD_KEEP_DAYS * 864e5));
      list.forEach(function (r) {
        if (r.updated > maxU) maxU = r.updated;
        if (!ddOkDay(r.id) || r.id < cut) return;
        var x = ddClean(r), was = old[r.id];
        if (!was || (+was.updated || 0) < x.updated) n++;
        if (!all[r.id] || (+all[r.id].updated || 0) <= x.updated) all[r.id] = x;
      });
      if (full) n += Object.keys(old).filter(function (k) { return !all[k] && ddHas(ddClean(old[k])); }).length;
      Object.keys(all).forEach(function (k) { if (!ddOkDay(k) || k < cut) delete all[k]; });
      store.set('dd', all); cset(function (x) { x.ddPull = maxU; });
      return n;
    }).catch(function () { return 0; });   // rules not published yet, or offline: the rest of the sync still counts
  }

  (function () {
    var home0 = VIEWS.home;
    VIEWS.home = function () {   // just under the chat card and Your card strip, above the birthday banner
      var html = home0.apply(null, arguments), card = ddHome(new Date()), w = '<div class="wrap home">';
      if (!card) return html;
      var at = html.indexOf('<section class="card nv-me');
      if (at >= 0) { var end = html.indexOf('</section>', at); if (end >= 0) { end += 10; return html.slice(0, end) + card + html.slice(end); } }
      return html.replace(w, w + card);
    };
    var ev0 = VIEWS.events, evA = AFTER.events;
    VIEWS.events = function () {
      var html = ev0.apply(null, arguments), today = new Date(), n = ddNext(today), when = evWhen({ date: ddIso(n) }, today), cur = ddGet(ddIso(n));
      var row = '<section class="card dd-ev"><div class="ev__when"><span class="ev__d">' + esc(when) + '</span></div><div class="ev__body"><strong>📚 ' + esc(t('pt.dd.title')) + '</strong><span class="muted">' + esc(t('pt.dd.every')) + ' · ' + esc(tf('pt.dd.next', { date: evDate({ date: ddIso(n), time: '' }) })) + '</span>' +
        (cur ? '<span class="dd-line dd-cur">' + ddLine(cur) + '</span>' : '') +
        '<span class="ev__acts"><button type="button" class="link-btn" id="dd-cal">' + esc(t('pt.dd.cal')) + '</button></span><span class="form__status" id="dd-status" role="status"></span></div>' + ddSchedHTML(today) + '</section>';
      return html.replace('<div class="ev-layout">', row + '<div class="ev-layout">');
    };
    AFTER.events = function () {
      if (evA) evA.apply(null, arguments);
      var b = document.getElementById('dd-cal'), st = document.getElementById('dd-status');
      if (b) b.addEventListener('click', function () { ddIcsOut(function (m) { st.textContent = m; }); });
      var sc = document.getElementById('dd-sched'), fm = document.getElementById('dd-form');
      if (sc) sc.addEventListener('toggle', function () { ddOpen = sc.open; });
      main.querySelectorAll('[data-ddedit]').forEach(function (e) { e.addEventListener('click', function () { ddEdit = e.getAttribute('data-ddedit'); ddOpen = true; route({ keepScroll: true }); var f = document.querySelector('#dd-form [name=topic]'); if (f) f.focus(); }); });
      if (fm) {
        var day = fm.getAttribute('data-day'), fst = document.getElementById('dd-fst'), cl = document.getElementById('dd-clear');
        fm.addEventListener('submit', function (ev) { ev.preventDefault(); ddSave(day, { topic: fm.topic.value, presenter: fm.presenter.value, moderator: fm.moderator.value, note: fm.note.value }, fst); });
        document.getElementById('dd-cancel').addEventListener('click', function () { ddEdit = ''; route({ keepScroll: true }); });
        if (cl) cl.addEventListener('click', function () { ddSave(day, {}, fst); });
      }
    };
  })();

  /* ===================== PSYCH TICKLER 1.0.0: FUN FOR A BIGGER GROUP =====================
     Year-level cup (#/cup), Buddies and coffee roulette (#/buddies), Kudos wall (#/kudos), Advice wall (#/advice),
     Polls and potluck (#/polls, cloud). The first four are worked out on the phone from the cards already synced. */
  ICONS.cup = '<path d="M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1.5A3.5 3.5 0 0 0 7.5 11M17 6h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 14v4M8.5 20h7"/>';
  ICONS.coffee = '<path d="M4.5 9h12v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5zM16.5 10.5H18a2.5 2.5 0 0 1 0 5h-1.6M8 3.5c0 1 1 1.3 1 2.5M12 3.5c0 1 1 1.3 1 2.5"/>';
  ICONS.poll = '<path d="M5 20V10M10 20V4M15 20v-7M20 20v-12"/>';
  (function () {
    var add = [
      { label: 'Kudos wall', tkey: 'nav.kudos', href: '#/kudos', icon: 'heart', group: 'Screens' },
      { label: 'Advice wall', tkey: 'nav.advice', href: '#/advice', icon: 'chat', group: 'Screens' },
      { label: 'Polls and potluck', tkey: 'nav.polls', href: '#/polls', icon: 'poll', group: 'Screens' },
      { label: 'Year-level cup', tkey: 'nav.cup', href: '#/cup', icon: 'cup', group: 'Play' },
      { label: 'Buddies and coffee roulette', tkey: 'nav.buddies', href: '#/buddies', icon: 'coffee', group: 'Play' }
    ];
    var at = NAV.length; for (var i = 0; i < NAV.length; i++) if (NAV[i].href === '#/stats') { at = i; break; }
    NAV.splice.apply(NAV, [at, 0].concat(add));
  })();
  function seededRnd(seed) { var a = strHash(seed) || 1; return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }
  function ptWhoLink(c) { return '<a class="who" href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c, 'avatar--sm') + '<span>' + esc(short(c)) + '</span></a>'; }

  /* ---- Year-level cup: teams by position; a team's score is the average number of badges per member (so a small team
          is not at a disadvantage), with total badges as the tie-break ---- */
  var TEAMS = ['y0', 'y1', 'y2', 'y3', 'consultant', 'alumni', 'resident'];
  function cupTable() {
    var by = {}; people().forEach(function (c) { var k = posKey(c); (by[k] = by[k] || []).push(c); });
    return TEAMS.filter(function (k) { return by[k]; }).map(function (k) {
      var m = by[k], total = m.reduce(function (s, c) { return s + (c.badges || []).length; }, 0);
      var top = m.slice().sort(function (a, b) { return (b.badges || []).length - (a.badges || []).length || byName(a, b); })[0];
      return { key: k, members: m, total: total, avg: total / m.length, top: (top.badges || []).length ? top : null };
    }).sort(function (a, b) { return b.avg - a.avg || b.total - a.total; });
  }
  VIEWS.cup = function () {
    var rows = cupTable(), me = getMe(), mine = me ? posKey(me) : '', html = pageHead('cup', 'nav.cup', 'pt.cup.intro');
    if (rows.length < 2) return html + '<div class="empty"><p>' + esc(t('pt.cup.need')) + '</p><p><a class="btn btn--solid" href="#/sync">' + esc(t('nav.sync')) + '</a></p></div></div>';
    var max = rows[0].avg || 1;
    return html + '<ol class="cup">' + rows.map(function (r, i) {
      return '<li class="card cup__row' + (r.key === mine ? ' is-mine' : '') + '"><span class="cup__n">' + (i === 0 && r.avg ? '🏆' : i + 1) + '</span><div class="cup__b"><strong>' + esc(t('pt.pos.' + r.key + 's')) + (r.key === mine ? ' <span class="badge">' + esc(t('pt.cup.yours')) + '</span>' : '') + '</strong>' +
        '<span class="meter__bar"><span style="width:' + Math.round(100 * r.avg / max) + '%"></span></span>' +
        '<span class="muted">' + esc(tf('pt.cup.line', { avg: r.avg.toFixed(1), total: r.total, n: r.members.length })) + (r.top ? ' · ' + esc(tf('pt.cup.top', { name: short(r.top), n: r.top.badges.length })) : '') + '</span></div></li>';
    }).join('') + '</ol><p class="muted">' + esc(t('pt.cup.how')) + '</p><p><a class="btn btn--solid" href="#/badges">' + esc(t('nav.badges')) + '</a> <a class="btn" href="#/guess">' + esc(t('nav.guess')) + '</a></p></div>';
  };
  TITLES.cup = function () { return t('nav.cup'); };

  /* ---- Buddies: the people outside my year level I share the most with; and coffee roulette, one pair a week,
          the same on every phone that has the same cards (seeded by the week number) ---- */
  function buddyMatches(me) {
    var mk = posKey(me);
    return others().filter(function (c) { return posKey(c) !== mk; }).map(function (c) { return { c: c, hits: inCommon(me, c) }; })
      .filter(function (x) { return x.hits.length; }).sort(function (a, b) { return b.hits.length - a.hits.length || byName(a.c, b.c); }).slice(0, 5);
  }
  function coffeePairs(week) {
    var list = people().filter(function (c) { return posKey(c) !== 'alumni'; }).sort(function (a, b) { return a.id < b.id ? -1 : a.id > b.id ? 1 : 0; });
    var a = shuffled(list, seededRnd('coffee|' + week)), out = [];
    for (var i = 0; i + 1 < a.length; i += 2) out.push([a[i], a[i + 1]]);
    if (a.length % 2 && out.length) out[out.length - 1].push(a[a.length - 1]);   // odd one out joins the last pair
    return out;
  }
  function coffeeIdea(week) { var n = 8, i = strHash('idea|' + week) % n; return t('pt.coffee.idea' + (i + 1)); }
  VIEWS.buddies = function () {
    var me = getMe(), html = pageHead('buddies', 'nav.buddies', 'pt.bud.intro');
    if (!me) return html + needCard() + '</div>';
    var wk = weekNum(new Date()), pairs = coffeePairs(wk), mine = pairs.filter(function (p) { return p.some(function (c) { return c.id === me.id; }); })[0];
    html += '<h2>' + esc(t('pt.coffee.h')) + '</h2>';
    if (!mine) html += '<div class="card"><p class="muted">' + esc(t('pt.coffee.need')) + '</p></div>';
    else html += '<div class="card coffee"><p class="coffee__k">' + esc(t('pt.coffee.yours')) + '</p><div class="who-row">' + mine.filter(function (c) { return c.id !== me.id; }).map(personLink).join('') + '</div><p>' + esc(coffeeIdea(wk)) + '</p><p class="muted">' + esc(t('pt.coffee.note')) + '</p></div>' +
      '<details class="fgroup"><summary><span>' + esc(t('pt.coffee.all')) + '</span><span class="muted fgroup__n">' + pairs.length + '</span></summary><div class="fgroup__body"><ul class="pairs">' + pairs.map(function (p) { return '<li>' + p.map(personLink).join('<span class="pairs__x" aria-hidden="true">☕</span>') + '</li>'; }).join('') + '</ul></div></details>';
    var ms = buddyMatches(me);
    html += '<h2>' + esc(t(/^y[01]$/.test(posKey(me)) ? 'pt.bud.hSenior' : 'pt.bud.h')) + '</h2>';
    html += ms.length ? '<div class="cards">' + ms.map(function (x) { return '<a class="card bud" href="#/person/' + encodeURIComponent(x.c.id) + '">' + avatar(x.c) + '<span class="bud__b"><strong>' + esc(x.c.name) + '</strong><span class="muted">' + esc(posText(x.c)) + '</span><span>' + esc(x.hits.slice(0, 3).join(' · ')) + '</span>' + (x.hits.length > 3 ? '<span class="muted">' + esc(tf('pt.bud.more', { n: x.hits.length - 3 })) + '</span>' : '') + '</span></a>'; }).join('') + '</div>'
      : '<div class="card"><p class="muted">' + esc(t('pt.bud.none')) + '</p></div>';
    return html + '</div>';
  };
  TITLES.buddies = function () { return t('nav.buddies'); };

  /* ---- Kudos wall: every shoutout in the department, newest first, and who was thanked most this month ---- */
  function allKudos() {
    var out = []; people().forEach(function (from) { (from.shoutouts || []).forEach(function (s) { var to = findPerson(s.to); out.push({ from: from, to: to, toName: to ? to.name : s.name, text: s.text, date: s.date }); }); });
    return out.sort(function (a, b) { return a.date < b.date ? 1 : a.date > b.date ? -1 : 0; });
  }
  VIEWS.kudos = function () {
    var list = allKudos(), html = pageHead('kudos', 'nav.kudos', 'pt.kudos.intro'), ym = new Date().toISOString().slice(0, 7), n = {}, who = {};
    list.forEach(function (k) { if (k.to && String(k.date).slice(0, 7) === ym) { n[k.to.id] = (n[k.to.id] || 0) + 1; who[k.to.id] = k.to; } });
    var top = Object.keys(n).sort(function (a, b) { return n[b] - n[a] || byName(who[a], who[b]); }).slice(0, 3);
    if (top.length) html += '<h2>' + esc(tf('pt.kudos.monthH', { month: monthName(new Date().getMonth() + 1) })) + '</h2><div class="card who-row who-row--top">' + top.map(function (id, i) { return '<span class="who-top">' + ptWhoLink(who[id]) + '<span class="muted">' + ['🥇', '🥈', '🥉'][i] + ' ' + n[id] + '</span></span>'; }).join('') + '</div>';
    html += '<h2>' + esc(t('pt.kudos.allH')) + '</h2>';
    html += list.length ? '<ul class="kudos">' + list.slice(0, 60).map(function (k) {
      return '<li class="card"><p class="kudos__t">' + esc(k.text) + '</p><p class="muted kudos__m">' + esc(tf('pt.kudos.line', { from: short(k.from), to: k.to ? short(k.to) : k.toName })) + (k.date ? ' · ' + esc(bkDate(k.date) || '') : '') + '</p></li>';
    }).join('') + '</ul>' : '<div class="empty"><p>' + esc(t('pt.kudos.none')) + '</p></div>';
    return html + '<p class="muted">' + esc(t('pt.kudos.how')) + '</p><p><a class="btn btn--solid" href="#/batch">' + esc(t('nav.batch')) + '</a></p></div>';
  };
  TITLES.kudos = function () { return t('nav.kudos'); };

  /* ---- Advice wall: "What I wish I knew in first year" (card field advice) and study tips (studyTip) ---- */
  VIEWS.advice = function () {
    var me = getMe(), html = pageHead('advice', 'nav.advice', 'pt.advice.intro');
    var order = { consultant: 0, alumni: 1, y3: 2, y2: 3, y1: 4, y0: 5, resident: 6 };
    function wall(key) {
      var xs = people().filter(function (c) { return c[key]; }).sort(function (a, b) { return order[posKey(a)] - order[posKey(b)] || byName(a, b); });
      return xs.length ? '<ul class="kudos">' + xs.map(function (c) { return '<li class="card"><p class="kudos__t">' + esc(c[key]).replace(/\n/g, '<br>') + '</p><p class="muted kudos__m"><a href="#/person/' + encodeURIComponent(c.id) + '">' + esc(short(c)) + '</a> · ' + esc(posText(c)) + '</p></li>'; }).join('') + '</ul>' : '<div class="card"><p class="muted">' + esc(t('pt.advice.none')) + '</p></div>';
    }
    html += (!me || !me.advice ? '<div class="callout"><p>' + esc(t('pt.advice.add')) + ' <a href="#/me">' + esc(t('nav.me')) + '</a></p></div>' : '');
    return html + '<h2>' + esc(fieldLabel('advice')) + '</h2>' + wall('advice') + '<h2>' + esc(fieldLabel('studyTip')) + '</h2>' + wall('studyTip') + '</div>';
  };
  TITLES.advice = function () { return t('nav.advice'); };

  /* ---- Polls and potluck (cloud): programs/{code}/polls. Read only when this screen is open (no listeners). ---- */
  var pollState = { list: null, votes: {}, err: '', busy: false, at: 0 };
  function pollLoad(force) {
    var c = cst(); if (!isSynced() || pollState.busy) return;
    if (!force && pollState.list && Date.now() - pollState.at < 60000) return;
    pollState.busy = true;
    cloud().then(function (api) {
      return api.polls(c.code).then(function (list) {
        pollState.list = list.map(function (p) { return { id: p.id, kind: p.kind === 'potluck' ? 'potluck' : 'poll', q: cleanText(p.q, 140), opts: (Array.isArray(p.opts) ? p.opts : []).slice(0, 12).map(function (o) { return cleanText(o, 60); }), by: p.by || '', name: cleanText(p.name, 80), created: p.created || 0, closed: !!p.closed }; });
        return Promise.all(pollState.list.slice(0, 8).map(function (p) { return api.pollVotes(c.code, p.id).then(function (v) { pollState.votes[p.id] = v; }, function () {}); }));
      });
    }).then(function () { pollState.err = ''; }, function (e) { pollState.err = errText(e); })
      .then(function () { pollState.busy = false; pollState.at = Date.now(); if (currentKey() === 'polls') route({ keepScroll: true }); });
  }
  function pollCard(p, u) {
    var votes = pollState.votes[p.id], mine = votes && u ? votes.filter(function (v) { return v.uid === u.uid; })[0] : null, mayEdit = u && (u.admin || p.by === u.uid);
    var body;
    if (!votes) body = '<p><button type="button" class="btn btn--sm" data-pshow="' + esc(p.id) + '">' + esc(t('pt.poll.show')) + '</button></p>';
    else if (p.kind === 'potluck') {
      body = (votes.length ? '<ul class="potluck">' + votes.map(function (v) { return '<li><strong>' + esc(cleanText(v.text, 80)) + '</strong> <span class="muted">' + esc(cleanText(v.name, 80)) + '</span></li>'; }).join('') + '</ul>' : '<p class="muted">' + esc(t('pt.poll.noDish')) + '</p>') +
        (p.closed ? '' : '<form class="potluck__f" data-pdish="' + esc(p.id) + '"><label class="field"><span class="field__l">' + esc(t(mine ? 'pt.poll.dishChange' : 'pt.poll.dish')) + '</span><input type="text" name="dish" maxlength="80" value="' + esc(mine ? mine.text : '') + '"></label><button type="submit" class="btn btn--sm btn--solid">' + esc(t('pt.poll.bring')) + '</button>' + (mine ? ' <button type="button" class="link-btn" data-punvote="' + esc(p.id) + '">' + esc(t('pt.poll.remove')) + '</button>' : '') + '</form>');
    } else {
      var total = votes.length || 1;
      body = '<ul class="poll__opts">' + p.opts.map(function (o, i) {
        var n = votes.filter(function (v) { return v.o === i; }).length, me = mine && mine.o === i;
        return '<li><button type="button" class="poll__opt' + (me ? ' is-mine' : '') + '" data-pvote="' + esc(p.id) + '" data-o="' + i + '"' + (p.closed ? ' disabled' : '') + ' aria-pressed="' + !!me + '"><span class="poll__bar" style="width:' + Math.round(100 * n / total) + '%"></span><span class="poll__l">' + esc(o) + '</span><span class="poll__n">' + n + '</span></button></li>';
      }).join('') + '</ul><p class="muted">' + esc(tf('pt.poll.nVotes', { n: votes.length })) + '</p>';
    }
    return '<li class="card poll"><p class="poll__k">' + esc(t(p.kind === 'potluck' ? 'pt.poll.kPot' : 'pt.poll.kPoll')) + (p.closed ? ' · ' + esc(t('pt.poll.closed')) : '') + '</p><h3>' + esc(p.q) + '</h3>' + body +
      '<p class="muted poll__m">' + esc(tf('pt.poll.by', { name: p.name || '—', when: whenShort(p.created) })) + (mayEdit ? ' · <button type="button" class="link-btn" data-pclose="' + esc(p.id) + '">' + esc(t(p.closed ? 'pt.poll.reopen' : 'pt.poll.close')) + '</button> · <button type="button" class="link-btn" data-pdel="' + esc(p.id) + '">' + esc(t('pt.poll.delete')) + '</button>' : '') + '</p></li>';
  }
  VIEWS.polls = function () {
    var html = pageHead('polls', 'nav.polls', 'pt.poll.intro'), u = cUser();
    if (!isSynced()) return html + '<div class="card chat-join">' + icon('poll', 'chat-join__ico') + '<h2>' + esc(t('pt.poll.joinH')) + '</h2><p>' + esc(t('pt.poll.join')) + '</p><p><a class="btn btn--solid" href="#/sync">' + esc(t('nav.sync')) + '</a></p></div></div>';
    html += '<details class="card ch-new"><summary>' + esc(t('pt.poll.newH')) + '</summary><form id="poll-new" novalidate>' +
      '<fieldset class="field fieldset"><legend class="field__l">' + esc(t('pt.poll.kind')) + '</legend><label class="pt-radio"><input type="radio" name="kind" value="poll" checked> ' + esc(t('pt.poll.kPoll')) + '</label><label class="pt-radio"><input type="radio" name="kind" value="potluck"> ' + esc(t('pt.poll.kPot')) + '</label></fieldset>' +
      '<label class="field"><span class="field__l">' + esc(t('pt.poll.q')) + '</span><input type="text" name="q" maxlength="140" placeholder="' + esc(t('pt.poll.qPh')) + '"></label>' +
      '<label class="field" id="poll-opts"><span class="field__l">' + esc(t('pt.poll.opts')) + '</span><textarea name="opts" rows="4" placeholder="' + esc(t('pt.poll.optsPh')) + '"></textarea><span class="field__h">' + esc(t('pt.poll.optsHint')) + '</span></label>' +
      '<p class="form__acts"><button type="submit" class="btn btn--solid">' + esc(t('pt.poll.start')) + '</button></p><p class="form__status" id="poll-st" role="status" aria-live="polite"></p></form></details>';
    if (pollState.err) html += '<p class="is-error">' + esc(pollState.err) + '</p>';
    if (!pollState.list) html += '<p class="muted">' + esc(t('bt.sync.loading')) + '</p>';
    else html += pollState.list.length ? '<ul class="polls">' + pollState.list.map(function (p) { return pollCard(p, u); }).join('') + '</ul>' : '<div class="empty"><p>' + esc(t('pt.poll.none')) + '</p></div>';
    return html + '<p><button type="button" class="link-btn" id="poll-reload">' + esc(t('bt.sync.reload')) + '</button></p></div>';
  };
  AFTER.polls = function () {
    if (!isSynced()) return;
    pollLoad(false);
    var c = cst(), st = document.getElementById('poll-st');
    function fail(e) { toast(errText(e)); }
    function refresh(id) { return cloud().then(function (api) { return api.pollVotes(c.code, id); }).then(function (v) { pollState.votes[id] = v; if (currentKey() === 'polls') route({ keepScroll: true }); }); }
    var rl = document.getElementById('poll-reload'); if (rl) rl.addEventListener('click', function () { pollState.votes = {}; pollLoad(true); });
    var f = document.getElementById('poll-new');
    if (f) {
      f.addEventListener('change', function () { document.getElementById('poll-opts').hidden = f.kind.value === 'potluck'; });
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var q = cleanText(f.q.value, 140), kind = f.kind.value === 'potluck' ? 'potluck' : 'poll';
        var opts = kind === 'poll' ? f.opts.value.split('\n').map(function (x) { return cleanText(x, 60); }).filter(Boolean).slice(0, 12) : [];
        if (!q) { st.textContent = t('pt.poll.needQ'); st.classList.add('is-error'); f.q.focus(); return; }
        if (kind === 'poll' && opts.length < 2) { st.textContent = t('pt.poll.needOpts'); st.classList.add('is-error'); f.opts.focus(); return; }
        var btn = f.querySelector('button[type=submit]'); btn.disabled = true;
        cloud().then(function (api) { return api.pollCreate(c.code, { kind: kind, q: q, opts: opts, name: myName() }); }).then(function () { toast(t('pt.poll.started')); pollLoad(true); }, function (e2) { btn.disabled = false; st.textContent = errText(e2); st.classList.add('is-error'); });
      });
    }
    main.querySelectorAll('[data-pshow]').forEach(function (b) { b.addEventListener('click', function () { b.disabled = true; refresh(b.getAttribute('data-pshow')).catch(fail); }); });
    main.querySelectorAll('[data-pvote]').forEach(function (b) { b.addEventListener('click', function () {
      var id = b.getAttribute('data-pvote'), o = +b.getAttribute('data-o'), mine = b.getAttribute('aria-pressed') === 'true';
      cloud().then(function (api) { return mine ? api.pollUnvote(c.code, id) : api.pollVote(c.code, id, { o: o, name: myName() }); }).then(function () { return refresh(id); }).catch(fail);
    }); });
    main.querySelectorAll('[data-pdish]').forEach(function (fm) { fm.addEventListener('submit', function (e) {
      e.preventDefault(); var id = fm.getAttribute('data-pdish'), dish = cleanText(fm.dish.value, 80); if (!dish) { fm.dish.focus(); return; }
      cloud().then(function (api) { return api.pollVote(c.code, id, { o: 0, name: myName(), text: dish }); }).then(function () { return refresh(id); }).catch(fail);
    }); });
    main.querySelectorAll('[data-punvote]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-punvote'); cloud().then(function (api) { return api.pollUnvote(c.code, id); }).then(function () { return refresh(id); }).catch(fail); }); });
    main.querySelectorAll('[data-pclose]').forEach(function (b) { b.addEventListener('click', function () { var id = b.getAttribute('data-pclose'), p = (pollState.list || []).filter(function (x) { return x.id === id; })[0]; if (!p) return; cloud().then(function (api) { return api.pollClose(c.code, id, !p.closed); }).then(function () { pollLoad(true); }).catch(fail); }); });
    main.querySelectorAll('[data-pdel]').forEach(function (b) { b.addEventListener('click', function () { if (!window.confirm(t('pt.poll.confirmDel'))) return; var id = b.getAttribute('data-pdel'); cloud().then(function (api) { return api.pollDelete(c.code, id); }).then(function () { delete pollState.votes[id]; pollLoad(true); }).catch(fail); }); });
  };
  TITLES.polls = function () { return t('nav.polls'); };

  /* ===================== PSYCH TICKLER 1.5.0: CONSULTANT QUICK FACTS =====================
     Clinic days, subspecialty or interests, and the preferred way to be reached. They are ordinary card fields in the
     'consultant' group (always public to the department, never restricted), so nothing new is stored in the cloud.
     CONS_QUICK (data/fields.js) names them. Shown in three places: a Quick facts box at the top of a consultant's
     page (the same answers are then left out of the "For consultants" section below it), two short lines on the
     consultant's card in the directory, and one screen, #/consultants, that lists every consultant with them. */
  var CONS_QUICK = (window.CONS_QUICK || ['cSpecialty', 'clinicDays', 'reachPref', 'contactHours']).filter(function (k) { return FIELD_BY[k]; });
  var consQ = '';
  ICONS.clinic = '<rect x="3.5" y="7.5" width="17" height="12" rx="2.5"/><path d="M9 7.5V5h6v2.5M12 10.5v6M9 13.5h6"/>';
  function isCons(c) { return !!c && !isPartner(c) && posKey(c) === 'consultant'; }
  function cqFilled(c) { return CONS_QUICK.filter(function (k) { return c[k]; }); }
  function cqShown(c) { return isCons(c) && cqFilled(c).length > 0; }
  function cqRows(c) { return cqFilled(c).map(function (k) { return factRow(FIELD_BY[k].icon, fieldLabel(k), c[k]); }).join(''); }
  function cqNudge() { return '<div class="callout cq-nudge"><p class="callout__title">' + esc(t('pt.cq.mineTitle')) + '</p><p>' + esc(t('pt.cq.mineText')) + '</p><p><a class="btn btn--solid" href="#/me">' + esc(t('pt.cq.add')) + '</a></p></div>'; }
  function consQuickHTML(c) {
    if (!isCons(c)) return '';
    var rows = cqRows(c);
    if (!rows) return isMe(c) ? cqNudge() : '';
    return '<h2>' + esc(t('pt.cq.title')) + '</h2><div class="card facts cq">' + rows + '</div>';
  }
  function consLine(c) {
    if (!isCons(c)) return '';
    return (c.cSpecialty ? '<span class="pcard__meta">' + icon('spark', 'pcard__ico') + '<span class="cq-clip">' + esc(clip(c.cSpecialty, 70)) + '</span></span>' : '') +
      (c.clinicDays ? '<span class="pcard__meta">' + icon('calendar', 'pcard__ico') + '<span class="cq-clip">' + esc(clip(c.clinicDays, 70)) + '</span></span>' : '');
  }
  (function () { for (var i = 0; i < NAV.length; i++) if (NAV[i].href === '#/batch') { NAV.splice(i + 1, 0, { label: 'Consultants at a glance', tkey: 'nav.consultants', href: '#/consultants', icon: 'clinic', group: 'Screens' }); return; } })();
  VIEWS.consultants = function () {
    var all = people().filter(isCons), me = getMe(), q = consQ.trim().toLowerCase(), html = pageHead('consultants', 'nav.consultants', 'pt.cq.intro');
    if (me && isCons(me) && cqFilled(me).length < 3) html += cqNudge();
    if (!all.length) return html + '<div class="empty"><p>' + esc(t('pt.cq.empty')) + '</p><p><a class="btn btn--solid" href="#/batch">' + esc(t('nav.batch')) + '</a> <a class="btn" href="#/sync">' + esc(t('nav.sync')) + '</a></p></div></div>';
    var shown = q ? all.filter(function (c) { return [c.name, c.nickname].concat(CONS_QUICK.map(function (k) { return c[k]; })).join(' ').toLowerCase().indexOf(q) >= 0; }) : all;
    return html + '<div class="toolbar"><label class="field field--inline"><span class="sr-only">' + esc(t('pt.cq.filter')) + '</span><input type="search" id="cons-q" placeholder="' + esc(t('pt.cq.filter')) + '" value="' + esc(consQ) + '" autocomplete="off"></label>' +
      '<span class="muted" id="cons-n">' + esc(shown.length === 1 ? t('pt.cq.count1') : tf('pt.cq.countN', { n: shown.length })) + '</span></div>' +
      (shown.length ? '<ul class="cons">' + shown.map(function (c) {
        var rows = cqRows(c);
        return '<li class="card cons__row" data-cons="' + esc(c.id) + '"><a class="who cons__who" href="#/person/' + encodeURIComponent(c.id) + '">' + avatar(c, 'avatar--sm') + '<span>' + esc(c.name) + (isMe(c) ? ' <span class="badge">' + esc(t('bt.batch.you')) + '</span>' : '') + '</span></a>' +
          (rows ? '<div class="facts cons__facts">' + rows + '</div>' : '<p class="muted cons__none">' + esc(t('pt.cq.none')) + '</p>') +
          (isMe(c) ? '<p><a class="btn" href="#/me">' + esc(t('bt.person.edit')) + '</a></p>' : '') + '</li>';
      }).join('') + '</ul>' : '<div class="empty"><p>' + esc(t('pt.cq.noMatch')) + '</p></div>') + '</div>';
  };
  AFTER.consultants = function () {
    var q = document.getElementById('cons-q'), timer; if (!q) return;
    q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { consQ = q.value; var pos = q.selectionStart; route({ keepScroll: true }); var nq = document.getElementById('cons-q'); if (nq) { nq.focus(); try { nq.setSelectionRange(pos, pos); } catch (e) {} } }, 160); });
  };
  TITLES.consultants = function () { return t('nav.consultants'); };
  (function () { var rb1 = rebuildIndex; rebuildIndex = function () { rb1(); SEARCH_INDEX.push({ title: t('nav.consultants'), text: t('pt.cq.intro'), href: '#/consultants', kind: t('nav.screens') }); }; })();

  /* ===== Router ===== */
  function parts() {
    var h = location.hash.replace(/^#\/?/, '');
    return h.split('/').filter(Boolean).map(function (p) { try { return decodeURIComponent(p); } catch (e) { return p; } });
  }
  function titleFor(key) {
    if (has(TITLES, key)) return typeof TITLES[key] === 'function' ? TITLES[key]() : TITLES[key];
    if (has(SHELL_TITLES, key)) return t(SHELL_TITLES[key]);
    for (var i = 0; i < NAV.length; i++) if (NAV[i].href === '#/' + key) return navLabel(NAV[i]);
    return key;
  }
  function setView(key, html, title) {
    main.innerHTML = html;
    document.title = title ? title + ' — ' + APP_NAME : APP_NAME;
    buildNav();
    updateNavBadges();
  }
  function route(opts) {
    opts = opts || {};
    try { meDraftFlush(); } catch (e) {}
    closeSuggest(); closeDrawer();
    var p = parts(), key = p.length ? p[0] : 'home', restoreY = null;
    if (!opts.keepScroll) {
      scrollMemo[scrollKey] = window.scrollY;                 // the page we are leaving
      scrollKey = location.hash || '#/';
      restoreY = fromHistory && scrollMemo.hasOwnProperty(scrollKey) ? scrollMemo[scrollKey] : null;
      fromHistory = false;
    }
    var html, title, args = p.slice(1);
    if (key !== 'missing' && Object.prototype.hasOwnProperty.call(VIEWS, key) && typeof VIEWS[key] === 'function') {
      html = VIEWS[key].apply(null, args); title = titleFor(key);
    } else {
      key = 'missing'; html = missingView(); title = t('notfound.title');
    }
    setView(key, html, title);
    if (AFTER[key]) AFTER[key].apply(null, args);
    if (typeof checkBadges === 'function') { try { checkBadges(); } catch (e) {} }
    try { cloudAfterRoute(); } catch (e) {}
    if (opts.focus) main.focus({ preventScroll: true });
    if (opts.keepScroll) return;
    if (restoreY !== null) { window.requestAnimationFrame(function () { window.scrollTo(0, restoreY); }); return; }
    window.scrollTo(0, 0);
  }
  window.addEventListener('hashchange', function () { syncHist(); route({ focus: true }); });
  main.addEventListener('change', function (e) {   // About > Settings
    var n = e.target && e.target.name, v = e.target && e.target.value;
    if (n === 'lang') { setLang(v); var again = main.querySelector('input[name="lang"]:checked'); if (again) again.focus(); }
    else if (n === 'theme') setTheme(v);
    else if (n === 'aboutTextSize') { store.set('textSize', v); applyTextSize(v); }
    else if (n === 'batchName') store.set('batchName', cleanText(v, 60));
    else if (n === 'startDate') { if (/^\d{4}-\d{2}-\d{2}$/.test(v)) store.set('startDate', v); else store.del('startDate'); }
  });
  main.addEventListener('click', function (e) {
    var f = e.target.closest ? e.target.closest('.search-page .filter[data-kind]') : null;
    if (f) { searchKind = f.getAttribute('data-kind'); route({ keepScroll: true }); }
  });

  /* ===== Mobile tab bar: hides on scroll down, shows on scroll up ===== */
  (function initTabbar() {
    var lastY = window.scrollY, hold = 0, ticking = false;
    // Guard both: classList.add/remove rewrite the attribute even when nothing changes,
    // which would re-fire the MutationObserver below forever.
    function show() { if (document.body.classList.contains('tabbar-hidden')) document.body.classList.remove('tabbar-hidden'); }
    function hide() { if (!document.body.classList.contains('tabbar-hidden')) document.body.classList.add('tabbar-hidden'); }
    function update() {
      ticking = false;
      var y = window.scrollY, dy = y - lastY, max = document.documentElement.scrollHeight - window.innerHeight;
      var a = document.activeElement;
      var typing = !!(a && a.matches && a.matches('input, textarea, select'));
      if (Date.now() < hold || document.body.classList.contains('drawer-open') || typing || y < 80 || y > max - 80) { show(); lastY = y; }
      else if (dy > 10) { hide(); lastY = y; }
      else if (dy < -6) { show(); lastY = y; }
    }
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('hashchange', function () { hold = Date.now() + 700; show(); });
    document.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('input, textarea, select')) show(); });
    new MutationObserver(function () { if (document.body.classList.contains('drawer-open')) show(); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  })();

  /* ===== Backup: export / import / undo (everything stored under PREFIX) ===== */
  var BK_APP = 'psychtickler', BK_UNDO = BK_APP + ':undo-import';
  function bkCollect() {
    var data = {};
    try {
      for (var i = 0; i < localStorage.length; i++) {
        var k = localStorage.key(i);
        if (k && k.indexOf(PREFIX) === 0) data[k.slice(PREFIX.length)] = localStorage.getItem(k);
      }
    } catch (e) {}
    return data;
  }
  function bkReplace(data) {
    var keys = [];
    for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); if (k && k.indexOf(PREFIX) === 0) keys.push(k); }
    keys.forEach(function (k) { localStorage.removeItem(k); });
    Object.keys(data).forEach(function (k) { localStorage.setItem(PREFIX + k, data[k]); });
  }
  function bkSummary(data) {
    var n = Object.keys(data || {}).filter(function (k) { return k !== 'lastBackup'; }).length;
    return n ? tf(n === 1 ? 'backup.item1' : 'backup.itemN', { n: n }) : t('backup.nothing');
  }
  function bkDate(iso) {
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(locale(), { year: 'numeric', month: 'short', day: 'numeric' }) + ', ' + d.toLocaleTimeString(locale(), { hour: 'numeric', minute: '2-digit' });
  }
  function bkStatus(msg, isErr) {
    var el = document.getElementById('bk-status');
    if (!el) return;
    el.textContent = msg || '';
    el.classList.toggle('is-error', !!isErr);
  }
  function bkPaint() {
    var meta = document.getElementById('bk-meta'), un = document.getElementById('bk-undo');
    var last = store.get('lastBackup', null);
    if (meta) meta.textContent = tf('backup.onDevice', { summary: bkSummary(bkCollect()) }) + ' ' + (last && bkDate(last) ? tf('backup.lastExported', { date: bkDate(last) }) : t('backup.notExported'));
    var has = false;
    try { has = !!localStorage.getItem(BK_UNDO); } catch (e) {}
    if (un) un.hidden = !has;
  }
  function bkExport() {
    /* 1.5.1 (Batch Tickler 1.24.1): Android refuses to share .json files, so the share sheet is used only on installed iPhone/iPad apps
       (which cannot download). Everywhere else, and whenever sharing fails for any reason except the person closing
       the sheet, the file is downloaded. "Last exported" is recorded only when a file really left the app. */
    var now = new Date();
    var data = bkCollect();
    var payload = { app: BK_APP, format: 1, exported: now.toISOString(), attribution: ATTRIBUTION, summary: bkSummary(data), data: data };
    var name = BK_APP + '-backup-' + now.getFullYear() + '-' + pad2(now.getMonth() + 1) + '-' + pad2(now.getDate()) + '.json';
    var json = JSON.stringify(payload, null, 1);
    var standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    var ios = /iPad|iPhone|iPod/.test(navigator.userAgent || '') || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    function done(key, arg) { store.set('lastBackup', now.toISOString()); bkStatus(arg ? tf(key, arg) : t(key)); bkPaint(); }
    function download() {
      var url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      var a = document.createElement('a');
      a.href = url; a.download = name; a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
      done('backup.saved', { name: name });
    }
    var file = null;
    try { file = new File([json], name, { type: 'application/json' }); } catch (e) {}
    if (standalone && ios && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: tf('backup.shareTitle', { app: APP_NAME }) }).then(function () { done('backup.shared'); },
        function (e) { if (e && e.name === 'AbortError') bkStatus(t('backup.exportCancelled')); else download(); });
      return;
    }
    download();
  }
  function bkImport(file) {
    if (!file) return;
    var reader = new FileReader();
    var bad = tf('backup.notBackup', { app: APP_NAME });
    reader.onerror = function () { bkStatus(t('backup.unreadable'), true); };
    reader.onload = function () {
      var p;
      try { p = JSON.parse(reader.result); } catch (e) { bkStatus(bad, true); return; }
      var ok = p && p.app === BK_APP && p.data && typeof p.data === 'object' &&
        Object.keys(p.data).every(function (k) { return typeof p.data[k] === 'string' && k.length < 80; });
      if (ok) Object.keys(p.data).forEach(function (k) { try { JSON.parse(p.data[k]); } catch (e) { ok = false; } });
      if (!ok) { bkStatus(bad, true); return; }
      var msg = tf('backup.confirmImport', { date: bkDate(p.exported) || t('backup.unknownDate'), backup: bkSummary(p.data), device: bkSummary(bkCollect()) });
      if (!window.confirm(msg)) { bkStatus(t('backup.importCancelled')); return; }
      try {
        localStorage.setItem(BK_UNDO, JSON.stringify({ saved: new Date().toISOString(), data: bkCollect() }));
        bkReplace(p.data);
      } catch (e) { bkStatus(t('backup.importFailed'), true); return; }
      bkStatus(t('backup.imported'));
      setTimeout(function () { location.reload(); }, 700);
    };
    reader.readAsText(file);
  }
  function bkUndo() {
    var snap; try { snap = JSON.parse(localStorage.getItem(BK_UNDO)); } catch (e) {}
    if (!snap || !snap.data) { bkPaint(); return; }
    if (!window.confirm(tf('backup.confirmUndo', { summary: bkSummary(snap.data) }))) return;
    try { bkReplace(snap.data); localStorage.removeItem(BK_UNDO); } catch (e) { bkStatus(t('backup.undoFailed'), true); return; }
    bkStatus(t('backup.restored'));
    setTimeout(function () { location.reload(); }, 700);
  }
  (function initBackup() {
    var ex = document.getElementById('bk-export'), fi = document.getElementById('bk-file'), un = document.getElementById('bk-undo');
    if (!ex || !fi) return;
    ex.addEventListener('click', bkExport);
    fi.addEventListener('change', function () { bkImport(fi.files && fi.files[0]); fi.value = ''; });
    if (un) un.addEventListener('click', bkUndo);
    bkPaint();
  })();

  /* ===== Language switching: static markup (data-i18n / data-i18n-attr in index.html), then re-render ===== */
  function applyStatic() {
    document.documentElement.setAttribute('lang', lang);
    var els = document.querySelectorAll('[data-i18n]'), i, v;
    for (i = 0; i < els.length; i++) { v = t(els[i].getAttribute('data-i18n')); if (v !== els[i].getAttribute('data-i18n')) els[i].textContent = v; }
    els = document.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < els.length; i++) {
      var pairs = els[i].getAttribute('data-i18n-attr').split(';');
      for (var j = 0; j < pairs.length; j++) {
        var at = pairs[j].indexOf(':'), key = pairs[j].slice(at + 1);
        if (at > 0 && t(key) !== key) els[i].setAttribute(pairs[j].slice(0, at), t(key));
      }
    }
    var brand = document.querySelector('.brand');
    if (brand) brand.setAttribute('aria-label', tf('brand.home', { name: APP_NAME }));
    var panel = document.getElementById('textSizePanel');
    if (panel) panel.setAttribute('aria-label', t('textsize.title'));
    labelCollapse();
    applyTheme(getTheme());
  }
  function setLang(l) {
    lang = l === 'tl' ? 'tl' : 'en';
    store.set('lang', lang);
    applyStatic();
    bkPaint();
    rebuildIndex();
    var panel = document.getElementById('textSizePanel');
    if (panel && !panel.hidden) { panel.hidden = true; var tb = document.getElementById('textSizeBtn'); if (tb) tb.setAttribute('aria-expanded', 'false'); }
    route({ keepScroll: true });   // re-render the current view and the menu in the new language
  }

  /* ===== Start ===== */
  applyStatic();
  route();

  /* ===== Service worker (https or localhost only) ===== */
  if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
    window.addEventListener('load', function () { navigator.serviceWorker.register('sw.js').catch(function () {}); });
  }
})();

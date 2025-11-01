// === LEAN GLOBAL CONTROLLER v3.2 ===
// Legacy PageStateManager deterministische Kette entfernt, alles andere beibehalten

// === 1) EVENT BUS LADEN ===
(async () => {
  const { Events }   = await import('./events.js');
  const { EventBus } = await import('./eventBus.js');

  window.Events   = Events;
  window.EventBus = EventBus;
  
  const EB = window.EventBus, E = window.Events || {};

/*   // Route-Key Guards für Events
  const needRK = new Set([
    E.DASHBOARD_CONFIGS_READY, E.DASHBOARD_RENDER_START,
    E.SECTION_BUILD_START, E.SECTION_DOM_READY,
    E.TABLE_BUILD_START, E.TABLE_BUILD_OK, E.TABLE_BUILD_FAILED,
    E.PANEL_SLIDE_CHANGED, E.PAGE_SCRIPT_LOADED
  ]);

  const _on = EB.on.bind(EB);
  EB.on = (ev, cb, opts) => _on(ev, needRK.has(ev)
    ? (p = {}) => { if (p.routeKey && p.routeKey !== window.__currentRoute?.routeKey) return; cb(p); }
    : cb, opts);
 */
  EventBus.off?.(Events.EVENT_BUS_READY, '__gcBoot');
  EventBus.on?.(Events.EVENT_BUS_READY, bootCoreComponents, { id:'__gcBoot', replay:true });
  
  // Ready sofort senden
  EventBus.emit(Events.EVENT_BUS_READY, {
    ready: true,
    ts: Date.now(),
    tabId: (window.tabId ||= Math.random().toString(36).slice(2))
  });

	
const show = () => {
  const root = document;
  root.querySelector('#gc-page-loader')?.classList.remove('gc-pl--hidden');
  // alle gängigen Bereiche markieren
  root.querySelectorAll('.dashboard-section, .swipe-panel, .swipe-section, [data-section]')
      .forEach(s => s.classList.add('gc-pl-sec--loading'));
};

const hide = () => {
  const root = document;
  root.querySelector('#gc-page-loader')?.classList.add('gc-pl--hidden');
  // robust: entferne Klasse überall
  root.querySelectorAll('.gc-pl-sec--loading')
      .forEach(s => s.classList.remove('gc-pl-sec--loading'));
};


// Rebind: Loader AN/AUS
window.EventBus.off?.(window.Events.PAGE_BEFORE_CHANGE, '__gcLoaderOn');
window.EventBus.on?.(window.Events.PAGE_BEFORE_CHANGE, () => show(), { id:'__gcLoaderOn', replay:false });

window.EventBus.off?.(window.Events.PAGE_VIEW_READY, '__gcLoaderOff');
window.EventBus.on?.(window.Events.PAGE_VIEW_READY,  () => hide(), { id:'__gcLoaderOff', replay:true });

// (optional) Loader AUS zusätzlich bei Fehler-Events
/* EventBus.off?.(Events.InitError, '__gcLoaderErr');
EventBus.on?. (Events.InitError, () => hide(), { id:'__gcLoaderErr', replay:true });
EventBus.off?.(Events.ModuleLoadError, '__gcLoaderErr2');
EventBus.on?. (Events.ModuleLoadError, () => hide(), { id:'__gcLoaderErr2', replay:true });
EventBus.off?.(Events.RefreshError, '__gcLoaderErr3');
EventBus.on?. (Events.RefreshError, () => hide(), { id:'__gcLoaderErr3', replay:true }); */


  // Filter-Sync zwischen Tabs
  wireFilterSync();

  if (window.__GC_EVT_READY) return;
  window.__GC_EVT_READY = true;

  window.tabId ||= Math.random().toString(36).slice(2);

  // === 2) UDT MAP MANAGEMENT ===
  const __UDT_MAPS = (window.__UDT_MAPS ||= new Map());

  function getUdtMap() {
    const id = window.tabId || 'default';
    if (!__UDT_MAPS.has(id)) __UDT_MAPS.set(id, new Map());
    return __UDT_MAPS.get(id);
  }

  window.getUdtMap = window.getUdtMap || getUdtMap;

  // === 3) CORE COMPONENTS BOOT ===
  function bootCoreComponents() {
    console.log('[bootCoreComponents] Starting core initialization');
    
    // SlideManager
    window.SlideStates = {};
    window.SlideManager = {
      booted: false,
      register(slideName, initFn, refreshFn) {
        if (!window.SlideStates[slideName]) {
          window.SlideStates[slideName] = {
            initialized: false,
            initFn: initFn || null,
            refreshFn: refreshFn || null
          };
        }
      },
      initSlide(slideName) {
        const state = window.SlideStates[slideName];
        if (state && !state.initialized && typeof state.initFn === 'function') {
          state.initFn();
          state.initialized = true;
        }
      },
      refreshSlide(slideName) {
        const state = window.SlideStates[slideName];
        if (state && typeof state.refreshFn === 'function') {
          state.refreshFn();
        }
      },
      changeSlide(slideName) {
        this.initSlide(slideName);
        this.refreshSlide(slideName);
      }
    };
  }

  // === 4) ESSENTIAL HELPERS ===
  window.getSectionEl = function(sectionName) {
    return (
      document.querySelector(`.dashboard-section[data-section="${sectionName}"]`) ||
      document.querySelector(`.swipe-panel[data-section="${sectionName}"]`)
    );
  };

  window.getVisibleDashboardSection = function () {
    const active = document.querySelector('.dashboard-section.active');
    return active?.dataset?.section || null;
  };

  // === 5) CONFIG SOT (Section of Truth) ===
  (function enforceConfigSoT(){
    const cfgMap = {
      'view': () => window.configView || null,
      'social-sales': () => window.configSocialSales || null,
      'engagement-hub': () => window.configEngagementHub || null,
      'profil-visitors': () => window.configProfilVisitor || null,
      'accounts': () => window.configAccounts || null, 
      'leads': () => window.configLeads || null,  
      'contacts': () => window.configContacts || null,  
      'messages': () => window.configMessages || null,
      'comments': () => window.configComments || null,
      'visitorsoverview': () => window.configVisitorsoverview || null,    
      'chrome-import-profiles': () => window.configChromeImportProfiles || null     
    };

    const getCfgFinal = function(section) {
      const key = String(section || '').trim();
      return cfgMap[key]?.() || null;
    };

    try {
      Object.defineProperty(window, 'getCfg', {
        value: getCfgFinal, writable: false, configurable: false, enumerable: false
      });
    } catch {
      window.getCfg = getCfgFinal;
    }
  })();

  // === 6) DATATABLES MANAGEMENT ===
  function destroyAllDataTables() {
    const $ = window.jQuery || window.$;
    const map = getUdtMap();
    for (const [key, inst] of map.entries()) {
      try {
        const node = inst?.dt?.table?.().node?.();
        if (inst?.dt && node && $?.fn?.DataTable?.isDataTable?.(node)) {
          inst.dt.destroy(true);
        }
      } catch {}
    }
    map.clear();
  }

  window.refreshSection = function refreshSection(section, { extraParams = null, reset = false, refreshOnly = true } = {}) {
    try {
      const map = getUdtMap();
      let inst = map.get(section);
      let dt = inst?.dt || inst?.dtInstance;
      
      if (!dt) {
        const root = window.getSectionEl(section);
        const tableEl = root?.querySelector('table.dataTable, table');
        
        if (tableEl && $.fn?.DataTable?.isDataTable?.(tableEl)) {
          dt = $(tableEl).DataTable();
          
          if (!inst) {
            inst = { dt, table: tableEl, section };
            map.set(section, inst);
          }
        }
      }
      
      if (!dt) return false;

      if (extraParams && typeof dt?.one === 'function') {
        dt.one('preXhr.dt', (e, settings, data) => {
          Object.assign(data, extraParams);
        });
      }

      if (reset && typeof inst?.resetAllFilters === 'function') {
        try { 
          inst.resetAllFilters({ clearState: true }); 
        } catch(e) {}
      }

      if (dt.ajax?.reload) {
        dt.ajax.reload(null, false);
      }

      requestAnimationFrame(() => {
        try { 
          dt.columns.adjust(); 
          dt.responsive?.recalc?.(); 
          dt.draw(false); 
        } catch(e) {}
      });

      return true;
      
    } catch (e) {
      console.error('[UDT] refreshSection error for', section, ':', e);
      return false;
    }
  };

  function refreshAllOnPage({ extraParams, reset = false } = {}) {
    const map = getUdtMap();
    for (const [section] of map.entries()) {
      refreshSection(section, { extraParams, reset });
    }
  }

  window.destroyAllDataTables = destroyAllDataTables;
  window.refreshAllOnPage = refreshAllOnPage;

  // === 7) PAGE LIFECYCLE EVENTS ===
  EventBus.on(Events.PAGE_BEFORE_CHANGE, ({ page }) => {
    destroyAllDataTables();
  });

  
// === 8) SWIPE SECTORS MANAGEMENT ===

// Panel-Events an Window schicken (für Kopfzeile etc.)
function emitSectionEvent(type, idx, panelEl, direction, root) {
  const $p = $(panelEl);
  const detail = {
    index: idx,
    key: $p.data('section') || $p.attr('id') || null,
    panel: panelEl,
    direction,
    root
  };
  window.dispatchEvent(new CustomEvent(type, { detail }));
}





// ——— GC: Slides nur auf Dashboard, nie auf Detail ———
function __hasDashboard()   { return !!document.querySelector('.dashboard-section[data-section]'); }
function __hasSwipePage()   { return !!document.querySelector('[data-page-root] .swipe-section'); }
window.__gcSlidesInit = window.__gcSlidesInit || false;
window.__gcSlides     = window.__gcSlides     || null;

EventBus.off?.(window.Events.PAGE_VIEW_READY, '__gcSlidesInit');
EventBus.on?.(window.Events.PAGE_VIEW_READY, (p = {}) => {
  const ctx = p.ctx || p;
  if (p.routeKey && p.routeKey !== window.__routeKey) return;

  // Detail (Swipe) hat Vorrang
  const swipeSel = '.swipe-panel[data-section]';
  const dashSel  = '.dashboard-section[data-section]';

  if (document.querySelector(swipeSel)) {
    console.info('[SLIDES][GC] init detail');
    try {
      window.bootSwipeSectors?.(ctx || {});
      window.SlideManager && (window.SlideManager.booted = true);
      // aktive Section sicherstellen
      const active = document.querySelector(`${swipeSel}.active`);
      if (!active) document.querySelector(swipeSel)?.classList.add('active');
    } catch (err) {
      console.warn('[SLIDES][GC] detail init failed:', err);
    }
    return;
  }

  // Fallback: Dashboard
  if (document.querySelector(dashSel)) {
    if (window.__gcSlidesInit) return;
    console.info('[SLIDES][GC] init dashboard');
    window.__gcSlidesInit = true;

    const root = document.querySelector(dashSel);
    if (!root) return;
    window.__gcSlides = createSwipeController(root);
    return;
  }

  console.debug('[SLIDES][GC] skip: no swipe root found');
}, { id: '__gcSlidesInit', replay: true });



EventBus.off?.(Events.PAGE_BEFORE_CHANGE, '__gcSlidesDispose');
EventBus.on?. (Events.PAGE_BEFORE_CHANGE, () => {
  if (window.__gcSlidesInit && window.__gcSlides?.dispose) {
    try { window.__gcSlides.dispose(); } catch (e) { console.warn('[SLIDES][GC] dispose warn', e); }
  }
  window.SlideManager.booted = false;
  window.__gcSlides     = null;
  window.__gcSlidesInit = false;

    for (const key in window.SlideStates || {}) {
    if (window.SlideStates[key]) {
      window.SlideStates[key].initialized = false;
    }
  }
}, { id:'__gcSlidesDispose', replay:false });


/* EventBus.off?.(window.Events.PAGE_BEFORE_CHANGE, '__gcSlidesReset');
EventBus.on?.(window.Events.PAGE_BEFORE_CHANGE, () => {
  try { window.__gcSlidesInit = false; } catch {}
  try { window.SlideManager && (window.SlideManager.booted = false); } catch {}
  try { window.__gcSlides?.dispose?.(); } catch {}
}, { id:'__gcSlidesReset', replay:false });
 */

/**
 * Route-aware Slide-Controller.
 * – Re-Init bei neuem routeKey.
 * – Handler namespaced ('.slides') + vorher .off, damit kein Doppel-Bind.
 * – Alles auf Root ('.swipe-section') gescoped.
 */
// Revert: immer neu binden, keine Dedup-Guards, kein Early-Return
function createSwipeController(root) {
  if (!root) return;

  const $root        = $(root);
  const panels       = $root.find('.swipe-panel').toArray().map(el => $(el));
  const $stack       = $('#iconStack');
  const $tabs        = $stack.find('.dashboard-tab-slide');          // <span class="dashboard-tab-slide">
  const $icons       = $tabs.find('i,svg');                          // optionales Icon im Span
  const $swipeWrap   = $root.find('.swipe-content-wrapper');
  const swipeContent = $swipeWrap[0];

  // Alte Handler lösen
  $tabs.off('.slides');
  $icons.off('.slides');
  $stack.off('.slides');
  $swipeWrap.off('.slides');

  let current = 0;
  let busy    = false;

  // Active-Helfer: NUR auf Tabs, nie auf i/svg
  function setActive(idx){
    $tabs.removeClass('active').eq(idx).addClass('active');
    $icons.removeClass('active');
  }

  // 1) Anfangszustand Panels
  if (panels.length) {
    const existing = panels.findIndex(p => p.hasClass('active'));
    current = existing >= 0 ? existing : 0;
    panels.forEach((p, i) => {
      p.removeClass('slide-in slide-out');
      p.css({
        transition: 'none',
        transform:  i === current ? 'translateX(0)' : 'translateX(100%)',
        display:    i === current ? '' : 'none'
      });
      p.toggleClass('active', i === current);
    });

    // Falls noch ein i/svg die active trägt → auf den Tab heben
    const $childActive = $tabs.find('i.active,svg.active').first();
    if ($childActive.length) {
      const idx = $tabs.index($childActive.closest('.dashboard-tab-slide'));
      setActive(idx >= 0 ? idx : current);
    } else {
      setActive(current);
    }
  }

  function showPanel(idx, direction = 'right') {
    if (!panels.length || busy || idx === current) return;
    if (idx < 0) idx = 0;
    if (idx >= panels.length) idx = panels.length - 1;

    busy = true;

    panels[idx].removeClass('active slide-in slide-out').css({
      transform: direction === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
      display:   ''
    });

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        panels[current].removeClass('active slide-in').addClass('slide-out')
          .css('transform', direction === 'right' ? 'translateX(-100%)' : 'translateX(100%)');
        panels[idx].removeClass('slide-in slide-out').addClass('active')
          .css('transform', 'translateX(0)');
      });
    });

    const prev = current;

    setTimeout(() => {
      panels.forEach((p, i2) => {
        if (i2 !== idx) p.removeClass('active slide-in slide-out').hide();
        else p.addClass('active').show();
      });

      setActive(idx);
      current = idx;
      busy = false;

      try { typeof updateAllScrollAreas === 'function' && updateAllScrollAreas(); } catch {}

      // Events wie gehabt
      try {
        const enterEl = panels[idx]?.[0];
        const leaveEl = panels[prev]?.[0];
        const keyIn   = enterEl?.dataset?.section || enterEl?.id || null;
        const keyOut  = leaveEl?.dataset?.section || leaveEl?.id || null;
        window.EventBus?.emit?.(window.Events?.PANEL_SLIDE_ENTER,   { index: idx, key: keyIn });
        window.EventBus?.emit?.(window.Events?.PANEL_SLIDE_LEAVE,   { index: prev, key: keyOut });
        window.EventBus?.emit?.(window.Events?.PANEL_SLIDE_CHANGED, { index: idx, key: keyIn });
      } catch {}
    }, 420);
  }

  // Mapping per data-target (am Tab ODER am Kind)
  const panelIndexByKey = {};
  panels.forEach((p, i) => {
    const key = (p.data('section') || p.attr('id') || '').toString().trim();
    if (key) panelIndexByKey[key] = i;
  });

  // Klick auf Tab ODER auf i/svg → immer zum .dashboard-tab-slide hochklappen
  $tabs.on('click.slides', function (e) {
    const $tab = $(e.target).closest('.dashboard-tab-slide');
    const key  =
      ($tab.data('target') ?? $tab.find('[data-target]').first().data('target') ?? '')
        .toString().trim();

    let targetIdx;
    if (Number.isInteger(panelIndexByKey[key])) {
      targetIdx = panelIndexByKey[key];
    } else {
      targetIdx = $tabs.index($tab);
    }

    if (panels.length) targetIdx = Math.max(0, Math.min(targetIdx, panels.length - 1));
    if (targetIdx === current || targetIdx < 0) return;

    showPanel(targetIdx, targetIdx > current ? 'right' : 'left');
  });

  // Touch-Swipe unverändert
  if (swipeContent) {
    let touchStartX = null;
    let touchEndX   = null;

    $swipeWrap.on('touchstart.slides', e => {
      try { touchStartX = e.originalEvent.changedTouches[0].screenX; } catch { touchStartX = null; }
    });

    $swipeWrap.on('touchend.slides', e => {
      try { touchEndX = e.originalEvent.changedTouches[0].screenX; } catch { touchEndX = null; }
      if (touchStartX == null || touchEndX == null) return;
      const dx = touchEndX - touchStartX;
      if (Math.abs(dx) >= 60) {
        if (dx < 0 && current < panels.length - 1) showPanel(current + 1, 'right');
        if (dx > 0 && current > 0)                 showPanel(current - 1, 'left');
      }
      touchStartX = touchEndX = null;
    });
  }
}





// (optional) Overlay-CSS/Helper
function showSectorOverlay(root){
  if (!root || root.querySelector('.swipe-boot-overlay')) return;
  const overlay = document.createElement('div');
  overlay.className = 'swipe-boot-overlay';
  overlay.innerHTML = '<div class="swipe-boot-spinner"></div>';
  root.appendChild(overlay);
}
function hideSectorOverlay(root){ root?.querySelector('.swipe-boot-overlay')?.remove(); }

if (!document.querySelector('[data-swipe-overlay]')) {
  const style = document.createElement('style');
  style.setAttribute('data-swipe-overlay', 'true');
  style.textContent = `
    .swipe-section{ position: relative; }
    .swipe-boot-overlay{ position:absolute; inset:0; background:#fff; opacity:.96;
      display:flex; align-items:center; justify-content:center; z-index: 9; }
    .swipe-boot-spinner{ width:36px; height:36px; border-radius:50%;
      border:4px solid rgba(0,0,0,.1); border-top-color: rgba(0,0,0,.55);
      animation: swipe-boot-spin 0.8s linear infinite; }
    @keyframes swipe-boot-spin { to { transform: rotate(360deg); } }
  `;
  document.head.appendChild(style);
}

// Boot für Detailseiten (vom Modul aus Event getriggert)
// Lean v3.2-konform: ohne Timer-Sequencing, routeKey-guard, idempotent
window.bootSwipeSectors = function bootSwipeSectors(ctx) {
  const rk = ctx?.routeKey;
  if (rk && rk !== window.__routeKey) return;

  const initRoot = (root) => {
    if (!root || root.dataset.swipeInited === 'true') return;
    root.classList.remove('ready');

    // Controller nur einmal pro Root
    try { createSwipeController(root); } catch(e){ console.warn('[SLIDES][MOD] init warn:', e); }

    const panels = root.querySelectorAll('.swipe-panel');
    if (panels.length) {
      const first = panels[0];
      // aktive Klasse sicherstellen
      if (!root.querySelector('.swipe-panel.active')) first.classList.add('active');

      try { emitSectionEvent('section:slideInit', 0, first, null, root); } catch {}
      first.dataset.__inited = 'true';

      try { emitSectionEvent('section:slideChange', 0, first, null, root); } catch {}
      root.classList.add('ready');
    }

    root.dataset.swipeInited = 'true';
  };

  const wrappers = document.querySelectorAll('.swipe-section .swipe-content-wrapper');
  if (wrappers.length > 0) {
    wrappers.forEach(w => initRoot(w.closest('.swipe-section')));
    if (window.SlideManager) window.SlideManager.booted = true;
    return;
  }

  // Fallback: MutationObserver statt setTimeout
  const mo = new MutationObserver(() => {
    const ws = document.querySelectorAll('.swipe-section .swipe-content-wrapper');
    if (!ws.length) return;
    ws.forEach(w => initRoot(w.closest('.swipe-section')));
    if (window.SlideManager) window.SlideManager.booted = true;
    mo.disconnect();
  });
  mo.observe(document.body, { childList: true, subtree: true });
};


window.GlobalSwipeBoot = window.bootSwipeSectors;



  // === 9) SLIDE MANAGER INIT EVENTS ===
  const fired = (window.__slideFired ||= new Set());
  
  window.EventBus?.on?.(window.Events?.SLIDE_MANAGER_INIT, (p = {}) => {
    if (window.SlideManager?.booted && !p.isDetailNavigation) return;

    if (p.isDetailNavigation && window.SlideManager) {
      window.SlideManager.booted = false;
    }

    const ctxRoute = p.ctxRoute || {};
    try {
      window.bootSwipeSectors?.({
        type: ctxRoute.type,
        entity: ctxRoute.entity,
        id: ctxRoute.id,
        isDetailNavigation: p.isDetailNavigation
      });
    } catch (err) {
      console.error('bootSwipeSectors error', err);
    }
  }, { id: '__gc_swipeBoot', replay: false });

  // === 10) NAVIGATION CLEANUP ===
  window.EventBus?.on?.(window.Events?.PAGE_BEFORE_CHANGE, (p = {}) => {
    window.SlideManager.booted = false;
    
    for (const key in window.SlideStates || {}) {
      if (window.SlideStates[key]) {
        window.SlideStates[key].initialized = false;
      }
    }
    
    const leavingPath = p.from || '';
    const leavingPage = leavingPath.split('/')[3]?.toLowerCase();
    if (leavingPage) {
      const map = window.getUdtMap?.();
      if (map) {
        for (const [key, inst] of map.entries()) {
          if (key.includes(leavingPage) || inst?.page === leavingPage) {
            try { inst?.dt?.destroy?.(true); } catch {}
            if (inst) inst.dt = null;
            map.delete(key);
          }
        }
      }
    }
    
    fired.clear();
  }, { id:'__gcSlideInitReset', replay: false });

  // === 11) FORM STATE MANAGEMENT ===
  window.FormState = {
    db: null,
    status: 'add',
    record: null,
    values: {},
    subTables: {}
  };


  
/**
 * Rekursiver Zugriff auf verschachtelte Werte nach db, parent, name, optional rowIndex
 * @param {object} dataObj - z.B. response
 * @param {string} targetDb - data-db des Feldes
 * @param {string|null} parentDb - data-parent des Feldes (null für Hauptobjekt)
 * @param {string} fieldName - name-Attribut des Feldes
 * @param {number|null} rowIndex - optional bei Arrays, z.B. erste Lead-Zeile = 0
 * @returns {any} Wert des Feldes oder ''
 */
  window.getNestedValue = function(dataObj, targetDb, parentDb, fieldName, rowIndex = null) {
    if (parentDb === null && targetDb === dataObj.db) {
      return dataObj.values?.[fieldName]?.oldValue ?? dataObj.values?.[fieldName] ?? '';
    }

    if (parentDb && dataObj.db === parentDb && dataObj.subTables?.[targetDb]) {
      const arr = dataObj.subTables[targetDb];
      let child = null;
      if (rowIndex !== null && typeof arr[rowIndex] !== 'undefined') {
        child = arr[rowIndex];
      } else {
        child = arr[0];
      }
      if (!child) return '';
      return child.values?.[fieldName]?.oldValue ?? child.values?.[fieldName] ?? '';
    }

    if (dataObj.subTables?.[targetDb]) {
      const arr = dataObj.subTables[targetDb];
      let child = null;
      if (rowIndex !== null && typeof arr[rowIndex] !== 'undefined') {
        child = arr[rowIndex];
      } else {
        child = arr[0];
      }
      if (!child) return '';
      return child.values?.[fieldName]?.oldValue ?? child.values?.[fieldName] ?? '';
    }

    if (dataObj.values?.[fieldName]) {
      return dataObj.values?.[fieldName]?.oldValue ?? dataObj.values?.[fieldName] ?? '';
    }

    return '';
  };

  /**
 * Holt Subtable-Knoten entlang eines Pfads.
 *
 * @param {object|null|undefined} root
 *   Optionaler Startknoten (Server-Response oder Teilbaum).
 *   Wenn leer (null/undefined/falsey): wird automatisch aus dem FormState gelesen
 *   (z.B. window.FormState.currentRecord || window.FormState.record || window.FormState).
 *
 * @param {string[]} pfad
 *   Pfad der Subtable-Schlüssel, z. B. ['Lead', 'Notizen'].
 *
 * @param {object} [opts]
 * @param {'first'|'all'} [opts.mode='first']
 *   'first'  = altes Verhalten: bei Array-Zwischenknoten nur das erste Element verfolgen.
 *   'all'    = Aggregation: bei Array-Zwischenknoten alle Elemente verfolgen (flatMap).
 *
 * @returns {Array<object>|object|[]}
 *   Bei mode:'all' immer ein Array (ggf. leer).
 *   Bei mode:'first' wie bisher: kann Array ODER einzelnes Objekt sein; bei Nichtexistenz [].
 *
 * @example
 * // wie früher (nur erster Lead):
 * const firstLeadNotes = getNestedArray(response, ['Lead','Notizen']); // mode: 'first'
 *
 * @example
 * // alle Notizen aller Leads (aus FormState):
 * const leadNotes = getNestedArray(undefined, ['Lead','Notizen'], { mode: 'all' });
 *
 * @example
 * // Account-Notizen (direkt am Account):
 * const accNotes = getNestedArray(undefined, ['Notizen'], { mode: 'all' });
 */



//   mode: 'first' | 'all'   ('first' = altes Verhalten; 'all' = über alle Array-Knoten aggregieren)
  window.getNestedArray = function (root, pfad, opts) {
    const options = Object.assign({ mode: 'first' }, opts || {});
    const modeAll = options.mode === 'all';

    if (!root || typeof root !== 'object') {
      root = (window.FormState && (window.FormState.currentRecord || window.FormState.record || window.FormState)) || {};
    }

    if (!Array.isArray(pfad) || pfad.length === 0) return modeAll ? [] : [];

    if (!modeAll) {
      let node = root;
      for (let i = 0; i < pfad.length; i++) {
        if (!node.subTables || !node.subTables[pfad[i]]) return [];
        node = node.subTables[pfad[i]];
        if (i === pfad.length - 1) return node;
        node = Array.isArray(node) ? (node[0] || {}) : node;
      }
      return [];
    }

    let current = [root];
    for (let i = 0; i < pfad.length; i++) {
      const key = pfad[i];
      const last = i === pfad.length - 1;
      const next = [];

      for (const node of current) {
        const sub = node && node.subTables ? node.subTables[key] : undefined;
        if (!sub) continue;

        if (last) {
          if (Array.isArray(sub)) {
            for (const item of sub) if (item) next.push(item);
          } else if (sub) {
            next.push(sub);
          }
        } else {
          if (Array.isArray(sub)) {
            for (const item of sub) if (item) next.push(item);
          } else if (sub) {
            next.push(sub);
          }
        }
      }

      if (next.length === 0) return [];
      current = next;
    }

    return current;
  };


  window.getNestedRefObjById = function (response, id, Obj, Ref, field) { 
  const list   = getNestedArray(response, [Obj], { mode: 'all' }) || [];
  const target = String(id ?? '');

  const readVal = (node, key) => {
    const v = node?.values?.[key];
    if (v == null) return null;
    if (typeof v === 'object') {
      if ('oldValue' in v) return v.oldValue;
      if ('newValue' in v) return v.newValue;
    }
    return v; // primitiver Wert
  };

  // Ref-Feld lesen; falls leer, auf Primär-ID (ID) bzw. record ausweichen
  const readRef = (node) => {
    const r = readVal(node, Ref);
    return r != null ? r : (Ref !== 'ID' ? (readVal(node, 'ID') ?? node?.record ?? null) : null);
  };

  const hit = list.find(n => String(readRef(n) ?? '') === target);
  const out = hit ? readVal(hit, field) : null;
  return out == null ? '' : out; // kein "null" im Input
}

  function buildFormStateRecursive($container, origState = window.FormState, parentDb = null) {
    const db = $container.data('db');
    const status = $container.data('status') || (origState?.status ?? 'add');
    const record = $container.data('record') || (origState?.record ?? null);
    const rowIndex = $container.data('row-index') || 0;

    const formState = { db, status, record, values: {}, subTables: {} };

   // $container.find('[data-id="values"]').each(function() {
   $container.find('[data-id="values"]').addBack('[data-id="values"]').each(function() {
      const $el = $(this);
      const elDb = String($el.data('db')).toLowerCase().trim();
      const refDb = String(db).toLowerCase().trim();
      if (elDb !== refDb) return;
      const name = $el.attr('name');
      if (!name) return;
      if (typeof window.__ghFilterFn === 'function' && window.__ghFilterFn(name) === false) return;
      if (typeof window.__ghTypeAllow === 'function') {
        const t = ($el.attr('data-type') || '').toLowerCase();
        if (!window.__ghTypeAllow(t)) return;
      }
      if (typeof window.__ghFilterFn === 'function' && window.__ghFilterFn(name) === false) return;

      let newValue;
      if ($el.data('type') === 'checkbox') {
        newValue = $el.prop('checked') ? 1 : 0;
      } 
      else if ($el.data('type') === 'quill') {
        const qid   = $el.attr('id') || $el.data('quillId') || $el[0]?.id;
        const qmap  = (window.quillInstances || window.__quillInstances || {});
        newValue    = qmap?.[qid]?.root?.innerHTML || '';

        // ▼ NEU: Quill-„leer“-HTML in echten Leerstring wandeln
        if (/^\s*(?:<p>\s*<br\s*\/?>\s*<\/p>|<p>\s*<\/p>|<br\s*\/?>|&nbsp;|\u00A0|\s)*$/i.test(newValue)) {
          newValue = '';
        }
      }
      else if ($el.data('type') === 'msr' || $el.data('type') === 'multi-select') {
        const elId = $el.attr('id');
        const inst = (window.__msrInstances || {})[elId];
        let payload = { registry: $el.attr('name') || 'Registry', selected: [], object: db, objectId: record };

        if (inst && typeof inst.getValue === 'function') {
          const v = inst.getValue(); // { registry, selected:[{id,label}], meta:{context,allowedFor} }
          payload = {
            registry: v.registry,
            selected: Array.isArray(v.selected) ? v.selected : [],
            object: (v.meta?.context?.object) || db,
            objectId: (v.meta?.context?.refId) || record
          };
        } else {
          // Fallback: evtl. Hidden-Input neben dem Feld mit JSON
          const hidden = $el.siblings('input[type="hidden"][name="' + ($el.attr('name')+'_payload') + '"]');
          if (hidden.length) {
            try { payload = JSON.parse(hidden.val() || '{}'); } catch {}
          }
        }
        newValue = JSON.stringify(payload);
      } 
      else {
        newValue = $el.val();
      }
      let oldValue = '';
      if (origState) {
        oldValue = window.getNestedValue(origState, db, parentDb, name, rowIndex);
      }
      formState.values[name] = { oldValue, newValue };
    });

    $container.find(`[data-db][data-parent="${db}"][data-row-index]`).each(function() {
      const $sub = $(this);
      const subDb = $sub.data('db');
      const idx = $sub.data('row-index') || 0;
      if (!formState.subTables[subDb]) formState.subTables[subDb] = [];
      formState.subTables[subDb][idx] = buildFormStateRecursive(
        $sub,
        origState?.subTables?.[subDb]?.[idx] || {},
        db
      );
    });

    return formState;
  }

  const navigationTargets = {
    Account: (id) => `/app/show/Account/${id}`,
    Lead: (id) => `/app/show/Lead/${id}`,
    Nachrichten: (id) => `/app/show/Nachrichten/${id}`,
    Kommentare: (id) => `/app/show/Kommentare/${id}`,
    Profilbesucher: (id) => `/app/show/Profilbesucher/${id}`,
  };

  async function handleSaveResponse(result, type) {
    const { navigateTo } = await import('./router.js');
    const { routes } = await import('./routes.js');
    let alertBox = '';
    
    if (result.success && navigationTargets[type]) {
      const url = navigationTargets[type](result.id);
      navigateTo(url, routes);

    }
    if (result.error) {

    }
    $('#alert-wrapper').html(alertBox);
    setTimeout(() => {
      $('#alert-wrapper').fadeOut(400, function () {
        $(this).empty().show();
      });
    }, 3000);
  }


// === Handle Generic Form Submit (vereinheitlicht) ===
// - Defaults: cleanForm=true, closeAfterSave=false
// - Immer DATA_SAVES_SUCCESSFUL emitten (Toast für 0 & 1)
// - routehandler=0: navigate; routehandler=1: stay (close/clean/restore)
// - Keine resetHidden-Option mehr; bei cleanForm=true: ID wird geleert, Account_id bleibt
window.handleGenericFormSubmit = function (config) {
  const {
    triggerSelector,
    formSelector,
    postUrl,
    defaultDb,
    routehandler,
    cleanForm = true,
    closeAfterSave = false
  } = config;

  // ---- lokale Helfer: Snapshot/Restore (nur wenn cleanForm:false) ----
  function snapshotForms($scope) {
    const $ = window.jQuery || window.$;
    const snap = { inputs: [], selects: [], checks: [], radios: [], hidden: [], quill: [], msr: [] };

    $scope.find('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="number"], input[type="search"], input[type="password"], textarea')
      .each(function(){ snap.inputs.push({ sel: this.id ? `#${this.id}` : `[name="${this.name}"]`, val: this.value }); });

    $scope.find('select').each(function(){
      const sel = this.id ? `#${this.id}` : `select[name="${this.name}"]`;
      if (this.multiple) snap.selects.push({ sel, vals: Array.from(this.options).filter(o=>o.selected).map(o=>o.value) });
      else snap.selects.push({ sel, idx: this.selectedIndex });
    });

    $scope.find('input[type="checkbox"]').each(function(){
      snap.checks.push({ sel: this.id ? `#${this.id}` : `input[type="checkbox"][name="${this.name}"]`, checked: this.checked });
    });

    const $radios = $scope.find('input[type="radio"]');
    Array.from(new Set($radios.map((_,el)=>el.name).get())).forEach(name=>{
      const $grp = $scope.find(`input[type="radio"][name="${name}"]`);
      const checked = $grp.filter((_,el)=>el.checked).val();
      snap.radios.push({ name, val: checked ?? null });
    });

    $scope.find('input[type="hidden"]').each(function(){
      snap.hidden.push({ sel: this.id ? `#${this.id}` : `input[type="hidden"][name="${this.name}"]`, val: this.value, name: this.name });
    });

    try {
      const qmap = (window.quillInstances || window.__quillInstances || {});
      $scope.find('[data-type="quill"]').each(function(){
        const qid = this.id || this.getAttribute('data-quill-id');
        snap.quill.push({ qid, html: qmap?.[qid]?.root?.innerHTML ?? '' });
      });
    } catch {}

    try {
      const msr = (window.__msrInstances || {});
      $scope.find('[data-type="msr"], [data-type="multi-select"]').each(function(){
        const id = this.id; const inst = msr?.[id];
        if (inst?.getValue) snap.msr.push({ id, vals: inst.getValue() });
      });
    } catch {}

    return snap;
  }

  function restoreForms($scope, snap) {
    const $ = window.jQuery || window.$;

    snap.inputs.forEach(({sel,val})=>{ const el = $scope.find(sel)[0]; if(el){ el.value = val ?? ''; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); }});
    snap.selects.forEach(({sel,idx,vals})=>{
      const el = $scope.find(sel)[0]; if(!el) return;
      if (Array.isArray(vals)) Array.from(el.options).forEach(o=>o.selected = vals.includes(o.value));
      else if (typeof idx==='number') el.selectedIndex = idx;
      el.dispatchEvent(new Event('change',{bubbles:true}));
    });
    snap.checks.forEach(({sel,checked})=>{ const el = $scope.find(sel)[0]; if(el){ el.checked=!!checked; el.dispatchEvent(new Event('change',{bubbles:true})); }});
    snap.radios.forEach(({name,val})=>{
      const $grp = $scope.find(`input[type="radio"][name="${name}"]`);
      if (val==null) $grp.prop('checked',false); else $grp.filter(`[value="${val}"]`).prop('checked',true);
      $grp.each(function(){ this.dispatchEvent(new Event('change',{bubbles:true})); });
    });
    snap.hidden.forEach(({sel,val})=>{ const el = $scope.find(sel)[0]; if(el){ el.value = val ?? ''; }});
    try {
      const qmap = (window.quillInstances || window.__quillInstances || {});
      snap.quill.forEach(({qid,html})=>{ const inst = qmap?.[qid]; if(inst?.root) inst.root.innerHTML = html ?? ''; });
    } catch {}
    try {
      const msr = (window.__msrInstances || {});
      snap.msr.forEach(({id,vals})=>{ const inst = msr?.[id]; if(inst?.setValue) inst.setValue(vals ?? []); });
    } catch {}
  }

  // ---- Hilfsleser für "lose" Felder (außerhalb eines data-db-Roots) ----
  function readElementValue($el) {
    let v = '';
    const type = ($el.data('type') || '').toString().toLowerCase();

    if (type === 'quill') {
      const qid  = $el.attr('id') || $el.data('quillId') || $el[0]?.id;
      const qmap = (window.quillInstances || window.__quillInstances || {});
      v = qmap?.[qid]?.root?.innerHTML || '';
      if (/^\s*(?:<p>\s*<br\s*\/?>\s*<\/p>|<p>\s*<\/p>|<br\s*\/?>|&nbsp;|\u00A0|\s)*$/i.test(v)) v = '';
      return v;
    }

    const tag = ($el.prop('tagName') || '').toLowerCase();
    const inputType = ($el.attr('type') || '').toLowerCase();

    if (tag === 'input' && inputType === 'checkbox') {
      return $el.prop('checked') ? ($el.val() ?? 'on') : '';
    }
    if (tag === 'input' && inputType === 'radio') {
      const name = $el.attr('name');
      const $checked = $(`input[type="radio"][name="${CSS.escape(name)}"]:checked`);
      return $checked.length ? ($checked.val() ?? '') : '';
    }
    if (tag === 'select' && $el.prop('multiple')) {
      return ($el.val() || []).slice();
    }
    return $el.val() ?? '';
  }

  $(triggerSelector).on('click', function (e) {
    e.preventDefault();

    const $ = window.jQuery || window.$;

    // Bevorzugt: Button-spezifischer Scope; wird nach Button-Attributen gesetzt


    // Per-Click Overrides via data-Attribute (optional)
    const $btn = $(e.currentTarget);
    let doClean = cleanForm;
    let doClose = closeAfterSave;

    // ---- Button-Scoped Save-Filter ----
    const btnScopeSel   = $btn.attr('data-scope') || null;      // z.B. "#miniBlock"
    const btnFieldsRaw  = $btn.attr('data-fields') || '';       // "Titel,Beschreibung,Tags"
    const btnExcludeRaw = $btn.attr('data-exclude') || '';      // "Foo,Bar"
    const btnTypesRaw   = $btn.attr('data-types') || '';        // "quill,msr,text"

    const onlyFields    = new Set(btnFieldsRaw.split(',').map(s=>s.trim()).filter(Boolean));
    const excludeFields = new Set(btnExcludeRaw.split(',').map(s=>s.trim()).filter(Boolean));
    const onlyTypes     = new Set(btnTypesRaw.split(',').map(s=>s.trim().toLowerCase()).filter(Boolean));

    // Globale Filter-Funktionen für nachfolgende Sammel-Logik (werden nach dem Click wieder überschrieben)
    window.__ghFilterFn = function(name){
      if (onlyFields.size && !onlyFields.has(name)) return false;
      if (excludeFields.size && excludeFields.has(name)) return false;
      return true;
    };
    window.__ghTypeAllow = function(type){
      if (!onlyTypes.size) return true;
      return onlyTypes.has(String(type || '').toLowerCase());
    };

    if ($btn.is('[data-clean-form]')) {
      const raw = String($btn.data('clean-form')).trim().toLowerCase();
      doClean = !(raw === '0' || raw === 'false');
    }
    if ($btn.is('[data-close-after-save]')) {
      const raw = String($btn.data('close-after-save')).trim().toLowerCase();
      doClose = (raw === '1' || raw === 'true');
    }

    // Bevorzugt: Button-spezifischer Scope; sonst alter formSelector-Fallback
    const $scopeOverride = btnScopeSel ? $(btnScopeSel) : $();
    const $all = $scopeOverride.length ? $scopeOverride : $(formSelector);

    // Snapshot nur, wenn NICHT geleert werden soll
    const snap = doClean ? null : snapshotForms($all);


    // === Root-Kandidaten sammeln (sichtbare zuerst), dann Collector laufen lassen ===
    const roots = [];
    const seen  = new Set();
    function pushRoot($c){ const el=$c&&$c[0]; if(!el||seen.has(el)) return; seen.add(el); roots.push($c); }

    $all.each(function(){ const $c=$(this); if ($c.is('[data-db]:visible')) pushRoot($c); });
    $all.each(function(){ const $p=$(this).closest('[data-db]'); if($p.length && $p.is(':visible')) pushRoot($p); });
    $all.each(function(){ const $c=$(this); if ($c.is('[data-db]')) pushRoot($c); });
    $all.each(function(){ const $p=$(this).closest('[data-db]'); if($p.length) pushRoot($p); });
    if (roots.length === 0 && $all.length) pushRoot($all.eq(0));

    let mergedState = null;

    for (const $root of roots) {
      // nutzt deine bestehende Rekursion
      const state = buildFormStateRecursive($root, window.FormState); // bleibt wie gehabt
      if (!state) continue;

      if (!mergedState) { mergedState = state; continue; }

      if (mergedState.db && state.db && mergedState.db === state.db) {
        mergedState.values ||= {};
        Object.assign(mergedState.values, state.values || {});
        mergedState.subTables ||= {};
        Object.assign(mergedState.subTables, state.subTables || {});
        if (!mergedState.status && state.status) mergedState.status = state.status;
        if (!mergedState.record && state.record) mergedState.record = state.record;
      } else {
        const key = state.db || ('db_' + Math.random().toString(36).slice(2));
        mergedState.subTables ||= {};
        if (mergedState.subTables[key]) {
          const tgt = mergedState.subTables[key];
          tgt.values ||= {}; Object.assign(tgt.values, state.values || {});
          tgt.subTables ||= {}; Object.assign(tgt.subTables, state.subTables || {});
          if (!tgt.status && state.status) tgt.status = state.status;
          if (!tgt.record && state.record) tgt.record = state.record;
        } else {
          mergedState.subTables[key] = state;
        }
      }
    }

    // „Lose“ values (data-id="values") außerhalb der Roots einsammeln
    (function sweepLooseElements(){
      if (!$all.length) return;
      mergedState ||= { db: defaultDb || null, status:'add', record:null, values:{}, subTables:{} };

      function ensureBucket(dbName){
        if (!dbName) dbName = defaultDb || mergedState.db || 'default';
        if (mergedState.db && dbName.toLowerCase() === String(mergedState.db).toLowerCase()) {
          return { target: 'root', obj: mergedState };
        }
        mergedState.subTables ||= {};
        if (!mergedState.subTables[dbName]) {
          mergedState.subTables[dbName] = { db: dbName, status: mergedState.status || 'add', record: mergedState.record || null, values:{}, subTables:{} };
        }
        return { target: 'sub', obj: mergedState.subTables[dbName] };
      }

      $all.each(function(){
        const $node = $(this);
        const $cands = $node.is('[data-id="values"][name]') ? $node : $node.find('[data-id="values"][name]');
        $cands.each(function(){
          const $el = $(this);
          const name = $el.attr('name');
          if (!name) return;
          if (typeof window.__ghFilterFn === 'function' && window.__ghFilterFn(name) === false) return;
          if (typeof window.__ghTypeAllow === 'function') {
            const t = String($el.attr('data-type') || '').toLowerCase();
            if (!window.__ghTypeAllow(t)) return;
          }


          const elDb = ($el.data('db') || defaultDb || mergedState.db || '').toString();
          const bucket = ensureBucket(elDb);
          const targetVals = (bucket.target === 'root') ? (mergedState.values ||= {}) : (bucket.obj.values ||= {});
          if (Object.prototype.hasOwnProperty.call(targetVals, name)) return;

          const val = readElementValue($el);
          const dbName = ($el.data('db') || defaultDb || mergedState.db || '').toString();
          const oldVal = (window.getNestedValue
            ? window.getNestedValue(window.FormState, dbName, null, name, null)
            : '') ?? '';

          if (targetVals[name] && typeof targetVals[name] === 'object') {
            targetVals[name].newValue = val;
            if (targetVals[name].oldValue == null) targetVals[name].oldValue = oldVal;
          } else {
            targetVals[name] = { oldValue: oldVal, newValue: val };
          }
        });
      });
    })();

    const newState = mergedState || { db: defaultDb || null, status:'add', record:null, values:{}, subTables:{} };

    // === Save
    $.ajax({
      url: postUrl,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(newState),
      dataType: 'json',
      success: function (response) {
        // Erfolg robust normalisieren (true/1/"1"/"true")
        const ok = !!(response && (
          response.success === true ||
          response.success === 1 ||
          response.success === '1' ||
          String(response.success).toLowerCase() === 'true'
        ));
        if (!ok) return;

        const evPayload = { response, source: defaultDb, routehandler };


        if (routehandler === 0) {
          // Navigation wie gehabt
          handleSaveResponse(response, defaultDb);

        // Toast-Event IMMER feuern (deine Listener hängen daran)
        window.EventBus?.emit?.(window.Events?.DATA_SAVES_SUCCESSFUL, evPayload);          
          return;
        }

        // === routehandler === 1 (stay) ===
        const $form = $(formSelector);

        if (doClose) {
          // Subview konsequent schließen (Event genügt i. d. R.)
          window.EventBus?.emit?.(window.Events?.SUBVIEW_CLOSE, { formSelector });
        } else if (doClean) {
          // Sichtbar leeren
          $form.find('input[type="text"], input[type="email"], input[type="tel"], input[type="url"], input[type="number"], input[type="search"], input[type="password"], textarea')
               .val('').trigger('input').trigger('change');
          $form.find('input[type="checkbox"]').prop('checked', false).trigger('change');
          const names = new Set($form.find('input[type="radio"]').map((_,e)=>e.name).get());
          names.forEach(n => $form.find(`input[type="radio"][name="${n}"]`).prop('checked', false).trigger('change'));
          $form.find('select').each(function(){ this.multiple ? (this.selectedIndex = -1) : (this.selectedIndex = 0); }).trigger('change');

          // Smart-Hidden: nur ID leeren; Account_id NICHT anfassen
          $form.find('input[type="hidden"][name="ID"]').val('');

          // Status auf Create
          $form.attr('data-status', 'create').attr('data-record', '0');

          // Quill/MSR optional mit leeren
          try {
            const qmap = (window.quillInstances || window.__quillInstances || {});
            $form.find('[data-type="quill"]').each(function(){
              const qid = this.id || this.getAttribute('data-quill-id');
              const inst = qmap?.[qid];
              if (inst?.root) inst.root.innerHTML = '';
            });
          } catch {}
          try {
            const msr = (window.__msrInstances || {});
            $form.find('[data-type="msr"], [data-type="multi-select"]').each(function(){
              const id=this.id; const inst=msr?.[id]; if (inst?.setValue) inst.setValue([]);
            });
          } catch {}
        } else if (snap) {
          // Werte stehen lassen – selbst wenn der DOM neu gerendert wurde
          setTimeout(()=> restoreForms($(formSelector), snap), 0);
        }

        // Zusatz-Event für lokale Refresh-Logik
        window.EventBus?.emit?.(window.Events?.HANDLE_GENERIC_SUBMIT, evPayload);
        window.__ghFilterFn = null;
        window.__ghTypeAllow = null;

      },
      error: function (xhr) {
        $('#alert-account-wrapper').html(`
          <div class="alert alert-danger alert-overlay" role="alert">
            Netzwerkfehler: ${xhr.statusText}
          </div>`);
        window.__ghFilterFn = null;
        window.__ghTypeAllow = null;
      }
    });
  });
};




  // === 12) UTILITY FUNCTIONS ===
  function stripHtml(html) {
    const div = document.createElement('div');
    div.innerHTML = html;
    let text = div.textContent || div.innerText || '';
    return text.normalize('NFKC').replace(/\uFFFD/g, '').trim();
  }

  window.generatePdfFromDatabase = function(selectedFilter, selectedObj, selectedRefObj, selectedRefId) {
    $.ajax({
      url: '/php_app/load_nachrichten_table.php',
      method: 'POST',
      dataType: 'json',
      data: {
        selectedFilter: selectedFilter,
        selectedObj: selectedObj,
        selectedRefObj: selectedRefObj,
        selectedRefId: selectedRefId
      },
      success: function (messages) {
        const doc = new jspdf.jsPDF('p', 'mm', 'a4');
        let y = 20;
        const lineHeight = 6;

        doc.setFont('helvetica', '');
        doc.setFontSize(11);

        messages.forEach(msg => {
          const funnel = msg.Funnel || '-';
          const datum = msg.Datum || '-';
          const type = msg.Type || '-';
          const nachrichtText = stripHtml(msg.Nachricht || '');
          const reaktionText = stripHtml(msg.Reaktion || '');

          if (nachrichtText) {
            const headerLines = [
              `Funnel: ${funnel}`,
              `Datum: ${datum}`,
              `Typ: ${type}`,
              `Art: Gesendet`
            ];
            headerLines.forEach(line => {
              doc.text(line, 15, y);
              y += lineHeight;
            });

            const nachrichtLines = doc.splitTextToSize(nachrichtText, 180);
            doc.text(nachrichtLines, 15, y);
            y += nachrichtLines.length * lineHeight + 5;
          }

          if (reaktionText.trim() !== '') {
            const headerLines = [
              `Funnel: ${funnel}`,
              `Datum: ${datum}`,
              `Typ: ${type}`,
              `Art: Antwort`
            ];
            headerLines.forEach(line => {
              doc.text(line, 15, y);
              y += lineHeight;
            });

            const reaktionLines = doc.splitTextToSize(reaktionText, 180);
            doc.text(reaktionLines, 15, y);
            y += reaktionLines.length * lineHeight + 10;
          }

          if (y > 260) {
            doc.addPage();
            y = 20;
          }
        });

        doc.save(`nachrichten_${window.FormState?.values.Unternehmen}.pdf`);
      },
      error: function (xhr, status, error) {
        alert('⚠ Fehler beim Laden der Nachrichten: ' + error);
      }
    });
  };

  window.renderToolbar = function(targetSelector, force = false) {
    const target = document.querySelector(targetSelector);
    if (!target) return;

    if (force) {
      target.removeAttribute('data-rendered');
    }
    if (target.dataset.rendered === 'true') return;

    target.innerHTML = '';

    const groups = [
      ['bold', 'italic', 'underline'],
      ['link', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['clean']
    ];

    groups.forEach(group => {
      const span = document.createElement('span');
      span.className = 'ql-formats';

      group.forEach(item => {
        if (typeof item === 'string') {
          const btn = document.createElement('button');
          btn.classList.add('ql-' + item);
          span.appendChild(btn);
        } else {
          const key = Object.keys(item)[0];
          const val = item[key];
          const btn = document.createElement('button');
          btn.classList.add('ql-list');
          btn.setAttribute('value', val);
          span.appendChild(btn);
        }
      });

      target.appendChild(span);
    });

    target.dataset.rendered = 'true';
  };

  window.activateNav = function(sectionName) {
    document.querySelectorAll('.icon-link').forEach(link => {
      const isActive = link.dataset.source === sectionName;
      link.classList.toggle('active', isActive);
    });
  };

  function levenshteinDistance(a, b) {
    const matrix = Array.from({ length: b.length + 1 }, (_, i) => [i]);
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j - 1] + 1
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  function similarityPercent(a, b) {
    const distance = levenshteinDistance(a, b);
    const maxLen = Math.max(a.length, b.length);
    return ((maxLen - distance) / maxLen) * 100;
  }

  window.checkSimilarity = function(url1, url2, threshold = 95) {
    const percent = similarityPercent(url1, url2);
    const isSimilar = percent >= threshold;
    return { percent: percent.toFixed(2), isSimilar };
  };

  window.initCheckSimilarity = function() {
    $('#checkSimilarity').on('click', function () {
      const origin = 'https://www.linkedin.com/posts/william-stampfli_worldstoughestrow-atlantx-atlantx-activity-7236406115507269632-EdYm?utm_source=share&utm_medium=member_desktop&rcm=ACoAABllqLEBtXxvqoD2fJoa2C8TzieSyBoKTCA';
      const source = $('#article_url').val();

      const result = window.checkSimilarity(origin, source);
      $('#result-validierung').html(
        `Ähnlichkeit: ${result.percent}% – ${result.isSimilar ? '✅ Sehr ähnlich' : '⚠ Unterschiedlich'}`
      );
    });
  };

  window.extractActivityURN = function(url) {
    if (!url || typeof url !== 'string') {
      console.warn('extractActivityURN: Ungültige URL übergeben:', url);
      return null;
    }

    const match = url.match(/activity-(\d+)/);
    return match ? `urn:li:activity:${match[1]}` : null;
  };

  // === 13) FILTER SYNC BETWEEN TABS ===
  function wireFilterSync() {
    const EB = window.EventBus, E = window.Events || {};
    if (!EB || !E) return;

    window.__filterChannel ||= new BroadcastChannel('filter-channel');

    EB.off?.(E.FILTER_CHANGED, '__gcFilterSync');
    EB.on?.(E.FILTER_CHANGED, ({ config }) => {
      const cfg = { ...(config || {}), senderTabId: window.tabId };
      handleFilterChanged(cfg);
      try { window.__filterChannel.postMessage({ type:'filter-change', config: cfg }); } catch {}
    }, { id: '__gcFilterSync', replay: true });

    window.__filterChannel.onmessage = (e) => {
      const { type, config } = e.data || {};
      if (type !== 'filter-change' || !config) return;
      if (config.senderTabId === window.tabId) return;
      handleFilterChanged(config);
    };
  }

  let __filterTick;
  function handleFilterChanged(config = {}) {
    clearTimeout(__filterTick);
    __filterTick = setTimeout(() => {
      try {
        const $dd = $('#userSelectDropdown');
        const $txt = $dd.find('.user-name-ellipsis');
        if ($dd.length && $txt.length && config.userName) {
          $dd.attr('data-id', config.userId)
             .attr('data-value', config.userName)
             .data('id', config.userId)
             .data('value', config.userName);
          window.setupUserDropdown?.();
          $txt.text(config.userName);
        }
      } catch {}

      try {
        const sec = document.querySelector('.dashboard-section.active')?.dataset.section;
        const inst = window.getUdtMap?.()?.get(sec);
        const dt = inst?.dt || inst?.dtInstance;
        if (dt?.ajax?.reload) {
          dt.ajax.reload(null, false);
          requestAnimationFrame(() => {
            try {
              dt.columns?.adjust?.();
              dt.responsive?.recalc?.();
            } catch {}
          });
        }
      } catch {}
    }, 50);
  }

// === 14) LOAD DEPS FUNCTION — automatisch mit ESModule kompatible, CSS Erkennung inklusive 
window.loadDeps = (deps, cb) => {
  const reg = (window._depRegistry ||= new Map());
  const sniffCache = (window._depSniffCache ||= new Map());

  const toDesc = (d) => {
    if (typeof d === 'string') return { url: d, essential: true };
    if (d && typeof d === 'object' && typeof d.url === 'string') {
      return { url: d.url, essential: d.essential !== false };
    }
    return null;
  };

  // Schnelles, robustes Sniffing, ob eine Datei ESM-Syntax hat (export/import)
  const isESModule = async (url) => {
    if (sniffCache.has(url)) return sniffCache.get(url);
    try {
      const res = await fetch(url, { credentials: 'same-origin', cache: 'force-cache' });
      const code = await res.text();

      // Kommentare entfernen (einfach/effizient genug für Sniffing)
      const stripped = code
        .replace(/\/\*[\s\S]*?\*\//g, '')      // Block-Kommentare
        .replace(/(^|[^:])\/\/.*$/gm, '$1');   // Line-Kommentare (kein http:// in Strings abschießen)

      const esm =
        /\bexport\s+(?:default|const|let|var|function|class)\b/.test(stripped) ||
        /\bimport\s*(?:\(|\{|\w)/.test(stripped);

      sniffCache.set(url, esm);
      return esm;
    } catch {
      // Wenn Sniffing fehlschlägt → konservativ klassisch
      sniffCache.set(url, false);
      return false;
    }
  };

  const ensure = (url) => {
    if (reg.has(url)) return reg.get(url);

    const isCSS = /\.css(?:\?|$)/i.test(url);

    const p = isCSS
      ? new Promise((res, rej) => {
          const l = document.createElement('link');
          l.rel = 'stylesheet';
          l.href = url;
          l.onload = () => res(url);
          l.onerror = () => rej(new Error('⚠ CSS Ladefehler: ' + url));
          document.head.appendChild(l);
        })
      : (async () => {
          // falls du meinen ESM-Sniffer nutzt – sonst s.type='text/javascript'
          const asModule = await isESModule(url);   // oder const asModule = false;
          return await new Promise((res, rej) => {
            const s = document.createElement('script');
            s.src = url;
            s.async = true;
            s.defer = true;
            if (asModule) s.type = 'module';
            s.onload = () => res(url);
            s.onerror = () => rej(new Error('⚠ JS Ladefehler: ' + url));
            document.head.appendChild(s);
          });
        })();

    reg.set(url, p);
    return p;
  };


  const list = (Array.isArray(deps) ? deps : []).map(toDesc).filter(Boolean);
  const essentials = list.filter(x => x.essential).map(x => x.url);
  const optionals  = list.filter(x => !x.essential).map(x => x.url);

  const gate = Promise.all(essentials.map(ensure))
    .then(() => { optionals.forEach(u => ensure(u).catch(()=>{})); })
    .then(() => true)
    .finally(() => { if (cb) { try { cb(); } catch {} } });

  return gate; // await-/then-fähig wie gehabt
};





  // === 15) APP ROUTE HELPER ===
  window.App ||= {};
  App.route ||= {};

  App.route.nameFromRoute = function __nameFromRoute() {
    const path = (location.pathname || '')
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '');

    const parts = path.split('/');

    const idx = parts.findIndex(p => /^(show|new)$/i.test(p));
    if (idx === -1) return { type: 'unknown', entity: '', id: null };

    const mode = (parts[idx] || '').toLowerCase();
    const entity = (parts[idx + 1] || '').toLowerCase();
    const idRaw = parts[idx + 2] || null;

    let type = 'unknown', id = null;

    if (mode === 'new') {
      type = 'new';
    } else if (mode === 'show') {
      if (idRaw && /^\d+$/.test(idRaw)) {
        type = 'show';
        id = parseInt(idRaw, 10);
      } else {
        type = 'overview';
      }
    }
    return { type, entity, id };
  };

  // === 16) DASHBOARD UI BOOTSTRAP ===
  EventBus.on(Events.GC_UI_BOOTSTRAP, () => {
    EventBus.off?.(Events.GC_UI_BOOTSTRAP, 'gc_bootstrap');
    EventBus.on?.(Events.GC_UI_BOOTSTRAP, (p = {}) => {

      const tabs = document.querySelectorAll('.dashboard-tab');
      const scrollContainer = document.getElementById('dashboardSectionContainer');
      let lastActive = 0;
      const page = 'dashboard';
      if (!scrollContainer) return;
      if (scrollContainer.dataset.gcWired === '1') return;
      scrollContainer.dataset.gcWired = '1';

      function fireSectionVisible(idx) {
        const allSections = document.querySelectorAll('.dashboard-section');
        const sectionEl = allSections[idx];
        if (!sectionEl) return;

        const section = sectionEl.dataset.section;
        const isAlreadyActive = sectionEl.classList.contains('active');

        if (isAlreadyActive) return;

        allSections.forEach(el => el.classList.remove('active'));
        sectionEl.classList.add('active');

        EventBus.emit(Events.DASHBOARD_SECTION_VISIBLE, {
          page,
          index: idx,
          section
        });
      }

      window.scrollToSection = function(idx) {
        if (idx === lastActive) {
          tabs.forEach((btn, i) => btn.classList.toggle('active', i === idx));
          return;
        }

        scrollContainer.scrollTo({ left: idx * window.innerWidth, behavior: 'smooth' });
        tabs.forEach((btn, i) => btn.classList.toggle('active', i === idx));
        lastActive = idx;
        fireSectionVisible(idx);
      };

      tabs.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          if (idx === lastActive) return;
          window.scrollToSection(idx);
        });
      });

      let ticking = false;
      const onScroll = () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          const idx = Math.round(scrollContainer.scrollLeft / window.innerWidth);
          if (idx !== lastActive) {
            tabs.forEach((btn, i) => btn.classList.toggle('active', i === idx));
            lastActive = idx;
            fireSectionVisible(idx);
          }
          ticking = false;
        });
      };
      scrollContainer.addEventListener('scroll', onScroll, { passive: true });

      if (window.__gcDashResize) window.removeEventListener('resize', window.__gcDashResize);
      window.__gcDashResize = () => window.scrollToSection(lastActive);
      window.addEventListener('resize', window.__gcDashResize);

      tabs.forEach((btn, i) => btn.classList.toggle('active', i === lastActive));
      fireSectionVisible(lastActive);

    }, { id: 'gc_bootstrap', replay: true });
  }, { id: '__wire_gc_bootstrap', replay: true });

  // === 17) PAGE DESCRIPTION MANAGEMENT ===
  (async () => {
    const descEl = document.getElementById('page-description');
    const cap = s => s ? s.charAt(0).toUpperCase() + s.slice(1) : '';

    const getRoot = () => document.querySelector('#spa-container [data-page-root]');
    const entityLabel = (root, ctx) =>
      root?.getAttribute('data-entity-label') || ctx.table || cap(ctx.entity);
    const readSectionLabel = (el) => {
      if (!el) return '';
      return el.getAttribute('data-section-label')
          || el.getAttribute('data-section-lable')
          || cap(el.getAttribute('data-section'));
    };

    const paint = (left, rightHtml) => {
      if (!descEl) return;
      descEl.innerHTML =
        `<span style="padding-left:15px;font-size:18px;">${left} | ${rightHtml}</span>`;
    };

    EB.on(E.PAGE_DOM_READY, (p = {}) => {
      const ctx = p.ctx || { entity: p.page, type: p.viewType, table: p.table };
      const root = getRoot();
      if (!root) return;

      const left = entityLabel(root, ctx);

      const activeDash = root.querySelector('.dashboard-section.active');
      if (activeDash) {
        const sec = readSectionLabel(activeDash);
        paint(left, `<span style="color:#fdd84d;">${sec}</span>`);
        return;
      }

      const activeSwipe = root.querySelector('.swipe-panel.active');

      if (!activeSwipe) {
        paint(left, `<span style="color:#fdd84d;">${left}</span>`);
        return;
      }

      const sec = readSectionLabel(activeSwipe);
      paint(
        left,
        `<span style="color:#fff;">${left}</span> 
         <i class="bi bi-sliders" style="color:#fdd84d;font-size:13px;"></i> 
         <span style="color:#fdd84d;">${sec}</span>`
      );
    }, { id: '__desc_ready', replay: true });

    EB.on(E.DASHBOARD_SECTION_VISIBLE, (p = {}) => {
      const root = getRoot();
      if (!root) return;
      const left = entityLabel(root, p.ctx || {});
      const target = p.section
        ? root.querySelector(`.dashboard-section[data-section="${String(p.section).toLowerCase()}"]`)
        : root.querySelector('.dashboard-section.active');
      const sec = readSectionLabel(target);
      if (sec) paint(left, `<span style="color:#fdd84d;">${sec}</span>`);
    }, { id: '__desc_section', replay: true });

    EB.on(E.PANEL_SLIDE_CHANGED, (p = {}) => {
      const root = getRoot();
      if (!root) return;

      const ctx = p.ctx || {};
      const left = entityLabel(root, ctx);

      const key = (p.section || p.panel || p.key || '').toString().toLowerCase();
      let panel = key ? root.querySelector(`.swipe-panel[data-section="${key}"]`) : null;
      if (!panel) panel = root.querySelector('.swipe-panel.active');

      const sec = readSectionLabel(panel) || cap(key) || left;

      paint(
        left,
        `<span style="color:#fff;">${left}</span> 
         <i class="bi bi-sliders" style="color:#fdd84d;font-size:13px;"></i> 
         <span style="color:#fdd84d;">${sec}</span>`
      );
    }, { id: '__desc_panel_changed', replay: true });
  })();

  // === 18) DEBUG HELPERS ===
  window.debugUDTMap = function() {
    const map = window.getUdtMap();
    console.log('=== UDT Map Debug ===');
    console.log('Map size:', map.size);
    for (const [key, inst] of map.entries()) {
      console.log(`${key}:`, {
        hasInst: !!inst,
        hasDT: !!(inst?.dt || inst?.dtInstance),
        hasTable: !!inst?.table,
        section: inst?.section
      });
    }
  };




(() => {
  const root = document;
  let done = false;

  const readyCheck = () => {
    if (done) return false;
    const hasActive = !!root.querySelector('.swipe-panel.active, .dashboard-section.active, [data-section].active');
    const hasContent = !!root.querySelector('[data-page-content], main, form, table, .content-ready');
    if (hasActive || hasContent) {
      hide();
      done = true;
      return true;
    }
    return false;
  };

  if (!readyCheck()) {
    const mo = new MutationObserver(() => { if (readyCheck()) mo.disconnect(); });
    mo.observe(document.body, { childList:true, subtree:true });
  }
})();


// ===== Overlay Framework (inline) =====
  const Overlay = (() => {

    
    const STATE = { mounted:false, root:null, toastRegion:null, styleEl:null, trapStack:[], toastQueue:[], activeToasts:new Set() };

    const CSS = `
    :root { --ov-backdrop: rgba(15,23,42,.55); --ov-panel-bg: #0b1220; --ov-panel-fg: #ffffff; --ov-border: rgba(255,255,255,.1); --ov-shadow: 0 20px 60px rgba(0,0,0,.4); --ov-radius: 16px; }
    #app-overlay-root { position: fixed; inset: 0; pointer-events: none; z-index: 9999; }
    .ov-toasts { position: fixed; inset-inline: 0; top: 12px; display: grid; place-items: center; gap: 8px; pointer-events: none; z-index: 10000; }
    .ov-toast { min-width: 280px; max-width: min(92vw, 680px); border: 1px solid var(--ov-border); background: var(--ov-panel-bg); color: var(--ov-panel-fg); border-radius: 12px; box-shadow: var(--ov-shadow); padding: 12px 14px; display: grid; grid-template-columns: 24px 1fr auto; gap: 10px; align-items: center; pointer-events: auto; opacity: 0; transform: translateY(-8px) scale(.98); transition: opacity .18s ease, transform .18s ease; }
    .ov-toast.show { opacity: 1; transform: translateY(0) scale(1); }
    .ov-toast__icon { font-size: 18px; line-height: 1; }
    .ov-toast__title { font-weight: 600; margin: 0; }
    .ov-toast__msg { margin: 0; opacity: .9; }
    .ov-toast__body { display: grid; gap: 2px; }
    .ov-toast__close { background: transparent; border: 0; color: inherit; opacity: .9; font-size: 16px; cursor: pointer; padding: 4px; border-radius: 8px; }
    .ov-toast__close:hover { opacity: 1; background: rgba(255,255,255,.06); }
    .ov-toast.success { outline: 2px solid rgba(34,197,94,.35); }
    .ov-toast.error   { outline: 2px solid rgba(239,68,68,.35); }
    .ov-toast.warn    { outline: 2px solid rgba(245,158,11,.35); }
    .ov-toast.info    { outline: 2px solid rgba(59,130,246,.35); }
    .ov-modal-wrap { position: fixed; inset: 0; display: grid; place-items: center; pointer-events: none; }
    .ov-backdrop { position: absolute; inset: 0; background: var(--ov-backdrop); backdrop-filter: saturate(1.2) blur(2px); opacity: 0; transition: opacity .18s ease; }
    .ov-panel { position: relative; width: min(92vw, 640px); max-height: 86vh; overflow: hidden auto; background: var(--ov-panel-bg); color: var(--ov-panel-fg); border: 1px solid var(--ov-border); border-radius: var(--ov-radius); box-shadow: var(--ov-shadow); transform: translateY(8px) scale(.98); opacity: 0; transition: transform .2s ease, opacity .2s ease; pointer-events: auto; }
    .ov-modal-wrap.show .ov-backdrop { opacity: 1; }
    .ov-modal-wrap.show .ov-panel { opacity: 1; transform: translateY(0) scale(1); }
    .ov-panel__hd { display:flex; align-items:center; gap:10px; padding:16px 18px; border-bottom: 1px solid var(--ov-border); }
    .ov-panel__title { font-size: 18px; font-weight: 600; margin: 0; }
    .ov-panel__bd { padding: 16px 18px; display:grid; gap:8px; }
    .ov-panel__ft { padding: 14px 18px; border-top: 1px solid var(--ov-border); display:flex; gap:10px; justify-content: flex-end; }
    .ov-btn { appearance: none; border: 1px solid var(--ov-border); background: rgba(255,255,255,.06); color: var(--ov-panel-fg); padding: 8px 12px; border-radius: 10px; cursor: pointer; }
    .ov-btn:hover { background: rgba(255,255,255,.12); }
    .ov-btn.primary { border-color: rgba(59,130,246,.5); background: rgba(59,130,246,.18); }
    .ov-icon { font-style: normal; }
    `;

    const el = (tag, opts={}) => Object.assign(document.createElement(tag), opts);
    const setAttrs = (node, attrs) => { for (const k in attrs) node.setAttribute(k, attrs[k]); };
    const svgIcon = (name) => { const map = { success:'✔', error:'✖', warn:'⚠', info:'ℹ' }; const i = el('span', { className:'ov-icon', textContent: map[name] || '•' }); i.setAttribute('aria-hidden','true'); return i; };

    const injectCSS = () => { if (STATE.styleEl) return; const style = el('style'); style.id='overlay-styles'; style.textContent=CSS; document.head.appendChild(style); STATE.styleEl = style; };

    const mountRoot = () => { if (STATE.mounted) return; const root = el('div', { id:'app-overlay-root' }); const toastRegion = el('div', { className:'ov-toasts' }); setAttrs(toastRegion, { role:'region', 'aria-live':'polite', 'aria-label':'Benachrichtigungen' }); root.appendChild(toastRegion); document.body.appendChild(root); STATE.root = root; STATE.toastRegion = toastRegion; STATE.mounted = true; window.addEventListener('keydown', (e) => { if (e.key === 'Escape' && STATE.trapStack.length) { const top = STATE.trapStack.at(-1); top?.onCancel?.(); } }); };

    const toast = (variant, title, opts={}) => { const { message='', timeout=2500, id='t'+Math.random().toString(36).slice(2) } = opts; const card = el('div', { className:`ov-toast ${variant}`, role:'status' }); card.dataset.id = id; const icon = el('div', { className:'ov-toast__icon' }); icon.appendChild(svgIcon(variant)); const body = el('div', { className:'ov-toast__body' }); const h = el('p', { className:'ov-toast__title', textContent: title || variant.toUpperCase() }); const p = el('p', { className:'ov-toast__msg', textContent: message }); body.appendChild(h); if (message) body.appendChild(p); const close = el('button', { className:'ov-toast__close', innerHTML:'×', title:'Schließen' }); close.addEventListener('click', () => dismiss()); card.append(icon, body, close);
      const dismiss = () => { if (!STATE.activeToasts.has(card)) return; STATE.activeToasts.delete(card); card.classList.remove('show'); setTimeout(() => card.remove(), 180); dequeue(); };
      const show = () => { STATE.toastRegion.appendChild(card); requestAnimationFrame(() => card.classList.add('show')); STATE.activeToasts.add(card); if (timeout > 0) setTimeout(dismiss, timeout); };
      const enqueue = () => { STATE.toastQueue.push({ show }); if (STATE.activeToasts.size < 3) dequeue(); };
      const dequeue = () => { if (STATE.activeToasts.size >= 3) return; const nxt = STATE.toastQueue.shift(); if (nxt) nxt.show(); };
      enqueue(); return { dismiss };
    };

    const toastAPI = { success:(t,o)=>toast('success',t,o), error:(t,o)=>toast('error',t,o), warn:(t,o)=>toast('warn',t,o), info:(t,o)=>toast('info',t,o) };

    const trapFocus = (container) => { const sel = 'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'; const focusables = Array.from(container.querySelectorAll(sel)).filter(el=>!el.hasAttribute('disabled')); const first = focusables[0] || container; const last = focusables.at(-1) || container; const onKey = (e) => { if (e.key !== 'Tab') return; if (focusables.length === 0) { e.preventDefault(); return; } if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } }; container.addEventListener('keydown', onKey); const release = () => container.removeEventListener('keydown', onKey); return { first, last, release }; };

    const openModal = ({ title='Hinweis', message='', actions=[], onCancel }) => new Promise((resolve) => { const wrap = el('div', { className:'ov-modal-wrap', role:'dialog', 'aria-modal':'true' }); const backdrop = el('div', { className:'ov-backdrop' }); const panel = el('div', { className:'ov-panel' }); const hd = el('div', { className:'ov-panel__hd' }); const ic = el('span', { className:'ov-icon', textContent:'✱', 'aria-hidden':'true' }); const h = el('h2', { className:'ov-panel__title', textContent:title }); const x = el('button', { className:'ov-btn', title:'Schließen', innerHTML:'×' }); x.addEventListener('click', () => finish(false)); hd.append(ic, h, x); const bd = el('div', { className:'ov-panel__bd' }); const msg = el('div'); msg.innerHTML = message; bd.append(msg); const ft = el('div', { className:'ov-panel__ft' }); actions.forEach(a=>{ const b = el('button', { className:'ov-btn'+(a.primary?' primary':''), textContent:a.label||'OK' }); b.addEventListener('click', () => finish(a.value)); ft.appendChild(b); }); panel.append(hd, bd, ft); wrap.append(backdrop, panel); STATE.root.appendChild(wrap); requestAnimationFrame(()=>wrap.classList.add('show')); const { first, release } = trapFocus(panel); const prevFocus = document.activeElement; setTimeout(()=>first.focus(),20); const cleanup = () => { release(); wrap.classList.remove('show'); setTimeout(()=>wrap.remove(), 180); }; const finish = (val) => { cleanup(); resolve(val); }; const cancelHandler = () => finish(false); STATE.trapStack.push({ onCancel: cancelHandler }); backdrop.addEventListener('click', cancelHandler); const popTrap = () => { STATE.trapStack.pop(); }; wrap.addEventListener('remove', popTrap, { once:true }); });

    const modalAPI = { alert:   ({ title='Hinweis', message='' }={}) => openModal({ title, message, actions:[{ label:'OK', value:true, primary:true }] }).then(()=>true),
      confirm: ({ title='Bestätigen', message='', okText='OK', cancelText='Abbrechen' }={}) => openModal({ title, message, actions:[ { label:cancelText, value:false }, { label:okText, value:true, primary:true } ] }),
      prompt:  ({ title='Eingabe', message='', okText='OK', cancelText='Abbrechen', placeholder='' }={}) => { const inputId = 'in_'+Math.random().toString(36).slice(2); const html = `${message}<label for="${inputId}" style="display:block;margin-top:8px">Eingabe</label><input id="${inputId}" class="ov-input" style="width:100%;padding:8px;border-radius:8px;border:1px solid var(--ov-border);background:rgba(255,255,255,.06);color:var(--ov-panel-fg)" placeholder="${placeholder}">`; return openModal({ title, message: html, actions:[ { label:cancelText, value:null }, { label:okText, value:'__ok__', primary:true } ] }).then(v=>{ const val = document.getElementById(inputId)?.value ?? null; return v === '__ok__' ? val : null; }); } };

    return { init(){ injectCSS(); mountRoot(); }, toast: toastAPI, modal: modalAPI };
  })();
  
  window.Overlay = window.Overlay || Overlay;
  window.EventBus.on?.(window.Events.DATA_SAVES_SUCCESSFUL, () => {
    Overlay.init?.();
    Overlay.toast?.success('Gespeichert!', { message: 'Änderungen wurden übernommen.' });
  }, { id: '__toastSaveOk', replay: true });

  window.EventBus.on?.(window.Events.HANDLE_GENERIC_SUBMIT, ({ response }) => {
    if (response?.success) {
      Overlay.init?.();
      Overlay.toast?.success('Gespeichert!', { message: 'Änderungen wurden übernommen.' });
    }
  }, { id: '__toastGenericOk', replay: true });


 window.EventBus.on?.(window.Events.PAGE_VIEW_READY, initTooltips, { id:'lm:tooltip', replay:true });


  window.EventBus.on?.(window.Events.DATA_DELETE_SUCCESSFUL, () => {
    Overlay.init?.();
    Overlay.toast?.success('Gelöscht!', { message: 'Änderungen wurden gelöscht. Und sind temporär +30 Tage im Papierkorb' });
  }, { id: '__toastDeleteOk', replay: true });

  window.EventBus.on?.(window.Events.HANDLE_GENERIC_DELETE, ({ response }) => {
    if (response?.success) {
      Overlay.init?.();
      Overlay.toast?.success('Gelöscht!', { message: 'Änderungen wurden gelöscht. Und sind temporär +30 Tage im Papierkorb.' });
    }
  }, { id: '__toastGenericDeleteOk', replay: true });


 window.EventBus.on?.(window.Events.PAGE_VIEW_READY, initTooltips, { id:'lm:tooltip', replay:true });

})();

// === REFRESH: Tabelle ungefiltert + Suchfelder leeren ===
window.__gcRefreshClick = function (e) {
  const btn = e.target.closest?.('.header-refresh,[data-dash-action="refresh"]');
  if (!btn) return;

  e.preventDefault(); e.stopPropagation();

  const $    = window.jQuery || window.$;
  const root = document.querySelector('#spa-container [data-page-root]') || document.querySelector('[data-page-root]');
  let section = (
    btn.dataset.section
    || btn.closest?.('[data-section]')?.dataset.section
    || root?.querySelector('.dashboard-section.active[data-section]')?.dataset.section
    || root?.querySelector('.dashboard-section[data-section]')?.dataset.section
    || ''
  ).toString().trim().toLowerCase();
  if (!section) return;

  const secRoot = (root && (root.querySelector(`.dashboard-section[data-section="${section}"]`)
                         ||  root.querySelector(`.swipe-panel[data-section="${section}"]`))) || null;

  // 1) Seite-weite Suchfelder/Toolbar leeren (oben rechts etc.)
  try {
    (root || document).querySelectorAll(
      '#AccountSearchInput, [data-page-filter], .page-toolbar input[type="search"], .page-toolbar input[type="text"]'
    ).forEach(el => { el.value = ''; el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); });
  } catch {}

  // 2) Section-lokale Filter-/Suchfelder leeren (links/unten am Grid etc.)
  try {
    secRoot?.querySelectorAll('.dataTables_filter input, input[type="search"][data-filter], input[type="text"][data-filter], select[data-filter]')
      .forEach(el => { if (el.tagName === 'SELECT') el.selectedIndex = 0; else el.value = '';
                       el.dispatchEvent(new Event('input',{bubbles:true})); el.dispatchEvent(new Event('change',{bubbles:true})); });
  } catch {}

  // 3) DataTable finden (Map → DOM-Fallback)
  const map = window.getUdtMap?.();
  if (!map) return;
  let inst = map.get(section);
  let dt   = inst?.dt || inst?.dtInstance;
  if (!dt) {
    const tableEl = secRoot?.querySelector('table.dataTable, table');
    if (tableEl && $?.fn?.DataTable?.isDataTable?.(tableEl)) {
      dt   = $(tableEl).DataTable();
      inst = inst || { section, table: tableEl }; inst.dt = inst.dtInstance = dt; map.set(section, inst);
    }
  }
  if (!dt) return;

  // Helper: das DT-eigene Suchfeld im Container leeren (vor & nach dem Draw)
  const clearDtUi = () => {
    try {
      const cont = dt.table && dt.table().container ? dt.table().container() : null;
      if (!cont) return;
      const inp = (cont.querySelector && cont.querySelector('.dataTables_filter input')) || null;
      if (!inp) return;
      inp.value = '';
      inp.dispatchEvent(new Event('input',  { bubbles:true }));
      inp.dispatchEvent(new Event('change', { bubbles:true }));
      inp.dispatchEvent(new KeyboardEvent('keyup', { bubbles:true }));
      if ($) $(inp).val('').trigger('keyup');
    } catch {}
  };

  // 4) DT-Filter/Order/State auf „ungefiltert“, dann neu laden
  try { dt.search(''); } catch {}
  try { dt.columns().every(function(){ try { this.search(''); } catch {} }); } catch {}
  try { dt.state && dt.state.clear && dt.state.clear(); } catch {}
  try { dt.order && dt.order([]); } catch {}

  clearDtUi();                 // falls UI jetzt schon befüllt
  dt.one('draw', clearDtUi);   // falls DT das Feld nach dem Draw wieder füllt

  if (dt.ajax?.reload) { dt.ajax.reload(null, false); } else { try { dt.draw(false); } catch {} }

  requestAnimationFrame(() => { try { dt.columns?.adjust?.(); dt.responsive?.recalc?.(); dt.draw(false); } catch {} });
};

document.addEventListener('click', window.__gcRefreshClick, true);


// Global Controller: generischer Mount (LIST + CREATE)
// Global Controller: generischer Mount (LIST + CREATE + Hydration)
// Global Controller: generischer Mount (LIST + CREATE + Hydration + Re-Mount-Safe)
window.msrMount = function ({ id, registry, object, refId, oldValue }) {
  const EP = {
    list:   '/mod_linkedinapp/php/registry_list.php',
    create: '/mod_linkedinapp/php/manage_multiselected_values.php'
  };

  let el = document.getElementById(id);
  if (!el) return null;

  // 0) Purge: bestehende Instanz + DOM-Anker säubern (idempotent)
  const map  = (window.__msrInstances ||= {});
  const prev = map[id];
  if (prev) {
    try { prev.destroy?.(); } catch {}
    delete map[id];
    try {
      const fresh = el.cloneNode(false);            // id/attrs bleiben, Inhalt & Listener weg
      if (el.parentNode) el.parentNode.replaceChild(fresh, el);
      el = fresh;
    } catch { el.innerHTML = ''; }
  } else {
    // Falls Wrapper/Alt-Inhalt noch da: auf Rohzustand bringen
    try { el.innerHTML = ''; } catch {}
  }

  // 1) Neu-Mount
  const ms = new MultiSelectRegistry(el, {
    registry,
    options: [],
    value:   [],
    context: { object, refId },
    onCreate: async (opt) => {
      try {
        const fieldIdAttr = el.getAttribute('data-field-id');
        const body = { label: opt.label, createdFrom: opt.createdFrom };
        if (fieldIdAttr) body.field_id = Number(fieldIdAttr);

        const r = await fetch(EP.create, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data  = await r.json().catch(()=>({}));
        const realId = data.id;
        const label  = data.label ?? opt.label;
        if (!realId) return;

        const i = ms.state.options.findIndex(o => String(o.id) === String(opt.id));
        if (i > -1) ms.state.options[i] = { id: realId, label }; else ms.state.options.push({ id: realId, label });
        ms.state.selected = ms.state.selected.map(x => String(x) === String(opt.id) ? realId : x);
        ms.setValue(ms.state.selected);
      } catch {}
    }
  });
  map[id] = ms;

  // 2) Hydration (optional übergebenes oldValue)
  if (oldValue) {
    if (typeof ms.hydrateFromOldValue === 'function') {
      ms.hydrateFromOldValue(oldValue);
    } else {
      try {
        const data = typeof oldValue === 'string' ? JSON.parse(oldValue) : oldValue;
        const sel  = Array.isArray(data?.selected) ? data.selected : [];
        sel.forEach(s => {
          const sid = String(s.id);
          if (!ms.state.options.some(o => String(o.id) === sid)) {
            ms.state.options.push({ id: s.id, label: s.label });
          }
        });
        ms.setValue(sel.map(s => s.id));
      } catch {}
    }
  }

  // 3) Vorschlagswerte laden (LIST), Optionen mergen (Hydration behalten)
  const fieldIdAttr = el.getAttribute('data-field-id');
  const payload = fieldIdAttr
    ? { field_id: Number(fieldIdAttr) }
    : { registry: (el.getAttribute('data-registry') || registry || ''), for: object };

  fetch(EP.list, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => r.ok ? r.json() : Promise.reject())
  .then(a => {
    const incoming = Array.isArray(a.items) ? a.items : [];
    const m = new Map(ms.state.options.map(o => [String(o.id), o]));
    for (const o of incoming) m.set(String(o.id), o);
    ms.state.options = Array.from(m.values());
    if (ms.state.selected && ms.state.selected.length) ms.setValue(ms.state.selected);
  })
  .catch(()=>{});

  return ms;
};

// Optional: öffentliche Unmount-API (falls Seiten sie doch mal nutzen wollen)
window.msrUnmount = function(id){
  const el  = document.getElementById(id);
  const map = (window.__msrInstances ||= {});
  const prev = map[id];
  try { prev?.destroy?.(); } catch {}
  delete map[id];
  if (el) {
    const fresh = el.cloneNode(false);
    el.parentNode && el.parentNode.replaceChild(fresh, el);
  }
};





// Betrag parsen (Zahl, "1'234,50", "CHF 1,234.50", etc.) und VERDOPPELN
window.doubleAmount = function(input, locale = 'de-CH', currency = 'CHF') {
  if (typeof input === 'number') {
    const doubled = input * 2;
    return { value: doubled, formatted: new Intl.NumberFormat(locale, { style:'currency', currency }).format(doubled) };
  }

  // String normalisieren: Währungszeichen, Leerzeichen, Tausendertrennungen raus
  let s = String(input).trim()
    .replace(/[^\d,.\-']/g, '')        // alles außer Ziffern, , . - ' entfernen
    .replace(/'/g, '');                // Tausendertrenner (Schweiz) entfernen

  // Dezimaltrenner erkennen: wenn Komma und Punkt vorkommen → letztes Vorkommen ist Dezimal
  if (/,/.test(s) && /\./.test(s)) {
    // typ. EU: "." Tausender, "," Dezimal → alle Punkte raus, Komma zu Punkt
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (/,/.test(s) && !/\./.test(s)) {
    // nur Komma vorhanden → als Dezimaltrenner behandeln
    s = s.replace(',', '.');
  }

  const num = Number(s);
  if (!Number.isFinite(num)) return { value: NaN, formatted: 'Ungültiger Betrag' };

  const doubled = num * 2;
  return {
    value: doubled,
    formatted: new Intl.NumberFormat(locale, { style:'currency', currency }).format(doubled)
  };
}






// ======= CONFIG =======
const DT_ENABLE_ROW_SELECT = false; // <— true = überall Single-Row-Select, false = komplett aus
const ELLIPSIS_SELECTOR = 'table.dataTable tbody td.dt-ellipsis';
const OVERLAY_MAX_WIDTH = '60vw';

// ======= SELECTION GLOBAL =======
if ($.fn.dataTable) {
  // Defaults setzen BEVOR Tabellen initialisiert werden
  $.extend(true, $.fn.dataTable.defaults, {
    select: DT_ENABLE_ROW_SELECT ? { style: 'single', items: 'row', selector: 'td' } : false
  });

  // CSS-Highlight NUR erlauben, wenn Tabelle die Klasse .dt-allow-select hat
  // -> so greift dein altes "tr.selected" nicht mehr global.
  (function scopeSelectedHighlight(){
    const css = `
      table.dataTable tbody tr.selected > * { background: inherit !important; }
      table.dataTable.dt-allow-select tbody tr.selected > * { background: #e6f0ff !important; }
    `;
    const s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);
  })();

  // Wenn Select aktiv ist, erlauben wir das Markieren überall (ganze Zelle)
  if (DT_ENABLE_ROW_SELECT) {
    // Optional: blockiere Selektion auf Opt-out-Elementen
    $(document).on('user-select.dt', 'table.dataTable', function (e, api, type, cell, originalEvent) {
      if (type !== 'row') return;
      const $t = $(originalEvent.target);
      if ($t.closest('.no-select, a, button, input, textarea, label, .ql-container').length) {
        e.preventDefault(); // kein Blau bei UI-Elementen
      }
    });
    // Optisch einschalten pro Tabelle (falls du das Blau willst)
    $(document).on('preInit.dt', function (e, settings) {
      const table = new $.fn.dataTable.Api(settings).table().node();
      table.classList.add('dt-allow-select');
    });
  }
}

// ======= OVERLAY (GLOBAL) für volle Länge bei Ellipsis =======
(function installEllipsisOverlay(){
  const $overlay = $('<div/>').css({
    position: 'fixed',
    zIndex: 99999,
    maxWidth: OVERLAY_MAX_WIDTH,
    background: '#111',
    color: '#fff',
    padding: '8px 12px',
    border: '1px solid rgba(255,255,255,.15)',
    borderRadius: '8px',
    boxShadow: '0 10px 30px rgba(0,0,0,.35)',
    lineHeight: 1.35,
    whiteSpace: 'normal',
    wordBreak: 'break-word',
    pointerEvents: 'none',
    display: 'none'
  }).appendTo(document.body);

  // Delegation: gilt für ALLE Tabellen, kein #id nötig
  $(document)
    .on('mouseenter', ELLIPSIS_SELECTOR, function () {
      if (this.scrollWidth <= this.clientWidth) return; // nur wenn wirklich abgeschnitten
      const r = this.getBoundingClientRect();
      $overlay.text(this.textContent.trim())
        .css({ left: r.left + window.scrollX + 6, top: r.top + window.scrollY + 6 })
        .show();
    })
    .on('mousemove', ELLIPSIS_SELECTOR, function () {
      if (!$overlay.is(':visible')) return;
      const r = this.getBoundingClientRect();
      $overlay.css({ left: r.left + window.scrollX + 6, top: r.top + window.scrollY + 6 });
    })
    .on('mouseleave', ELLIPSIS_SELECTOR, function () {
      $overlay.hide().text('');
    });

  $(window).on('scroll resize', () => $overlay.hide().text(''));
})();




// ——— Generic Delete (Soft/Scheduled) ———
window.handleGenericDelete = function (config) {
  const {
    triggerSelector,
    postUrl = '/mod_linkedinapp/php/delete_records.php',
    defaultDb = null,
    routehandler = 0,                 // 0 = route; 1 = Event & bleiben
    scheduleInputSelector = null,
    recordId = null
  } = config;

  // Entkoppelt neu binden (wie bei deinem Submit-Handler)
  $(document).off('click.handleGenericDelete', triggerSelector)
             .on('click.handleGenericDelete', triggerSelector, function (e) {
    e.preventDefault();
    const $btn  = $(e.currentTarget);

    // 1) Root/Container finden (Form oder Item-Container)
    const $root = $btn.closest('form[data-db], [data-db], [data-record], .notiz-entry, .list-row, .card').first();

    // 2) DB ermitteln: Config → FormState → DOM → Button
    const db =
      defaultDb ||
      (window.FormState && window.FormState.db) ||
      $root.data('db') ||
      $btn.data('db') ||
      null;

    if (!db) {
      Ersetzen
        window.Overlay?.toast?.error('Delete: keine DB gesetzt.');
      return;
    }

    // 3) ID ermitteln: Config → FormState → data-record → Hidden-ID → data-noteid → data-id
    const rec =
      recordId ??
      (window.FormState && window.FormState.record) ??
      ($root.attr('data-record') || $root.data('record')) ??
      ($root.find('input[name="ID"][data-id="values"]').first().val() || null) ??
      ($root.data('noteid') || $btn.data('noteid') || null) ??   // z.B. <div class="notiz-entry" data-noteid="36">
      ($btn.data('id') || $root.data('id') || null);

    if (!rec) {
      window.Overlay.toast?.error('Delete: keine ID gefunden.');
      return;
    }

    // 4) Optional geplantes Datum (Scheduler)
    const scheduleAt = scheduleInputSelector ? $(scheduleInputSelector).val() : null;

    // 5) Payload exakt wie beim Generic-Submit (nur Delete-Felder)
    const now = new Date().toISOString().slice(0,19).replace('T',' ');
    const payload = {
      db,
      status: 'update',
      record: rec,
      values: {
        delete_requested_at: { oldValue: '', newValue: now },
        delete_scheduled_at: { oldValue: '', newValue: scheduleAt }
      },
      subTables: {},
      mode: 'soft'
    };

    // 6) POST & Reaktion: Route oder Event (symmetrisch zu Generic Submit)
    $.ajax({
      url: postUrl,
      method: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(payload),
      success: function (response) {
        if (routehandler === 0) {
          // Variante A: auf Übersicht routen
          (async () => {
            try {
              const { navigateTo } = await import('./router.js');
              const { routes } = await import('./routes.js');
              navigateTo(`/app/show/${db}`, routes);
              window.EventBus?.emit?.(window.Events?.DATA_DELETE_SUCCESSFUL, { response });
            } catch (_) { /* still */ }
          })();
        } else {
          // Variante B: Seite bleiben → Event feuern (für DOM-Cleanup/Refresh)
          window.EventBus?.emit?.(window.Events?.HANDLE_GENERIC_DELETE, {
            response,
            source: db,
            id: rec,
            root: $root.get(0)
          });
        }
      },
      error: function () {
        window.Overlay.toast?.error('Löschen fehlgeschlagen.');
      }
    });
  });
};






console.log('✅ Lean Global Controller v3.2 initialized (Legacy PageStateManager removed)');


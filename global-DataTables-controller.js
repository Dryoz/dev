window.__DTC_BUILD = 'dtc-2025-09-05-lean';
console.info('[DTC loaded]', window.__DTC_BUILD);

(function injectGdtStyles(){
  try{
    if (document.getElementById('gdt-core-styles')) return;
const css = `
.gdt-col-resize{background-clip:content-box; cursor:col-resize; pointer-events:auto; user-select:none; touch-action:none; z-index:3;}
.gdt-col-resize:hover{background-color:rgba(0,0,0,.06);}
.gdt-col-resize:focus{outline:2px solid rgba(0,102,204,.7);outline-offset:-2px;}
table.dataTable th.select-checkbox{width:32px;}

/* Zellen dürfen schmaler als der Inhalt sein (Ellipsis/Hover + Resize) */
table.dataTable td, table.dataTable th{min-width:0; box-sizing:border-box;}
.gdt-ellipsis{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;}
table.dataTable td, table.dataTable th{min-width:0; box-sizing:border-box;}
thead tr.gdt-filter-row{display:table-row;}
thead tr.gdt-filter-row th{padding:4px 6px; cursor:default;}
thead tr.gdt-filter-row input, thead tr.gdt-filter-row select{width:100%;}

/* Hover-Anchor Rahmen über TD, ausgerichtet bis zur Nachbarzelle/Zeile */
.gdt-hover-anchor{position:absolute;pointer-events:none;border:3px solid rgba(0,102,204,.9);border-radius:10px;box-shadow:0 0 0 2px rgba(0,102,204,.25) inset;z-index:5;display:none;background:transparent;}

/* Hover-Karte unter der Row: weißer Hintergrund, feiner Rahmen, mehrzeilig */
.gdt-hover-card{position:absolute;pointer-events:none;display:none;z-index:6;background:#fff;border:1px solid rgba(0,0,0,.2);border-radius:10px;padding:8px 12px;box-shadow:0 4px 18px rgba(0,0,0,.08);white-space:normal;line-height:1.35;max-width:100%;}

/* Kein vertikaler Scroll in der DataTable: Höhe wird über Paging/AutoRows geregelt */
.dataTables_scrollBody{overflow-y:hidden !important;box-sizing:border-box;position:relative;z-index:2;}
/* Horizontales Scrollen innerhalb der Tabelle weiterhin zulassen */
.dataTables_scrollBody{overflow-x:auto;}

/* ScrollX: Wrapper auf volle Breite inkl. Container-Padding ausrichten */
.section-scrollable-overview .dataTables_scroll,
.section-scrollable-overview .dataTables_scrollHead,
.section-scrollable-overview .dataTables_scrollBody{width:100%;box-sizing:border-box;}
/* Header-Kompensation durch DT eliminieren, damit rechter Rand bündig ist */
.section-scrollable-overview .dataTables_scrollHeadInner{box-sizing:border-box;padding-right:0 !important;}
/* Body nicht nach links verengen (z. B. durch Scrollbar-Kompensation) */
.section-scrollable-overview .dataTables_scrollBody{padding-right:12px;margin-right:0 !important;}
/* Rechter Innenabstand direkt am Table (verhindert Ankleben an Container-Rand) */
.section-scrollable-overview table.dataTable{padding-right:24px !important; box-sizing:border-box;}

/* Column-Resize Hover-Feedback */
.gdt-col-resize{background:transparent;transition:background .15s ease;}
.gdt-col-resize:hover{background:rgba(0,0,0,.06);}
.gdt-col-resize:active{background:rgba(0,0,0,.10);}

/* Badges (Labels) – einzeilig, kompakt */

.gdt-badge{display:inline-block;vertical-align:middle;white-space:nowrap;line-height:1;border-radius:999px;padding:4px 8px;font-size:12px;font-weight:600}
.gdt-badge--info{background:#eef4ff;color:#0b5fff;border:1px solid #cddcff}
.gdt-badge--warning{background:#fff7e6;color:#a15c00;border:1px solid #ffe2b3}
.gdt-badge--success{background:#eaf7ec;color:#1b7a2d;border:1px solid #c9e9cf}
.gdt-badge--danger{background:#ffe9e9;color:#b3261e;border:1px solid #ffc9c9}

/* Einheitliche Darstellung aller internen Links (data-link) – bold, schwarz, 1-Zeile mit Ellipsis */
table.dataTable td a[data-link]{font-weight:700;color:#000;text-decoration:none;display:inline-block;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;vertical-align:middle;}
table.dataTable td a[data-link]>span{display:inline-block;margin-left:6px;vertical-align:middle;}
.dataTables_paginate{position:relative;z-index:1;}
/* H-Scroll-Layer zwischen Scroll- und Pagination-Section */
.section-hscroll-layer{
  overflow-x:auto;
  overflow-y:hidden;
  box-sizing:border-box;
  height:16px;
  position:relative;
  transition:opacity .15s ease, height .15s ease;
  margin:0;
  padding:0 15px;
  background-color:#fff;
  background-clip:padding-box;
  border-radius:inherit;
  width:calc(100% - 30px);
  margin-left:15px;
  overscroll-behavior-x: contain;     /* kein „Auslaufen“ des Scrolls */
  -webkit-overflow-scrolling: touch;  /* sanftes Scrollen Safari/iOS */
  scrollbar-gutter: stable both-edges;/* verhindert Layout-Jumps bei Overlays */
}


/* Edge-Fades links/rechts, bleiben immer im Container */
.section-hscroll-layer::before,
.section-hscroll-layer::after{
  content:"";
  position:absolute;
  top:0; bottom:0;
  width:24px;
  pointer-events:none;
}

/* Edge-Fades nur zeigen, wenn Overflow wirklich benötigt wird */
.section-hscroll-layer[data-gdt-need="0"]::before,
.section-hscroll-layer[data-gdt-need="0"]::after{
  display:none;
}
.section-hscroll-layer::before{
  left:0;
  background:linear-gradient(to right, rgba(0,0,0,.08), rgba(0,0,0,0));
}
.section-hscroll-layer::after{
  right:0;
  background:linear-gradient(to left, rgba(0,0,0,.08), rgba(0,0,0,0));
}

/* Thumb-/Track-Optik (nur für diesen Layer) */
.section-hscroll-layer{scrollbar-width:thin;scrollbar-color:rgba(0,0,0,.35) rgba(0,0,0,.08);}
.section-hscroll-layer::-webkit-scrollbar{height:12px}
.section-hscroll-layer::-webkit-scrollbar-track{background:rgba(0,0,0,.08)}
.section-hscroll-layer::-webkit-scrollbar-thumb{background:rgba(0,0,0,.35);border-radius:999px}
.section-hscroll-layer::-webkit-scrollbar-thumb:hover{background:rgba(0,0,0,.45)}

.section-hscroll-layer .gdt-hscroll-track{height:1px;margin:0 -15px;}

/* Reduced Motion: Transitions abschalten */
@media (prefers-reduced-motion: reduce){
  .section-hscroll-layer{transition:none}
  .gdt-col-resize{transition:none}
}


/* Density Presets (für Opt-In via Event/Defaults) */
.gdt-density--compact table.dataTable>tbody>tr>td,
.gdt-density--compact table.dataTable>thead>tr>th{padding:.25rem .5rem;}
.gdt-density--comfortable table.dataTable>tbody>tr>td,
.gdt-density--comfortable table.dataTable>thead>tr>th{padding:.75rem 1rem;}

/* Variante A: Externer Horizontal-Scroll am Container, kein Vertical-Scroll dort */
.section-scrollable-overview{overflow-x:hidden;overflow-y:hidden;box-sizing:border-box;}
/* DT-Wrapper sollen die Containerbreite nutzen (kein eigener H-Scroll nötig) */
.section-scrollable-overview .dataTables_scroll,
.section-scrollable-overview .dataTables_scrollHead,
.section-scrollable-overview .dataTables_scrollBody{width:100%;box-sizing:border-box;}
/* Optional: etwas rechter Innenabstand am Table, damit Inhalt nicht klebt */
.section-scrollable-overview table.dataTable{padding-right:24px;box-sizing:border-box;}

/* Scroll-Body unten polstern, damit der H-Scroll sichtbar über dem Pager sitzt */
.dataTables_scrollBody{padding-bottom:18px;box-sizing:border-box;}

/* Scroll erzwingen: H-Scroll auf dem DataTables-Body, kein Y-Scroll dort */
.section-scrollable-overview .dataTables_scrollBody{overflow-x:auto; overflow-y:hidden !important;}
/* Sicherheits-Innenabstand am Table, damit der Inhalt nicht am Rand „klebt“ */
.section-scrollable-overview table.dataTable{padding-right:24px !important; box-sizing:border-box;}
`;

    const style = document.createElement('style');
    style.id = 'gdt-core-styles';
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
    document.head.appendChild(style);
  } catch(e) { /* no-op */ }
})();


/*
 UNIVERSAL DATATABLE-CONTROLLER für SPA/Dashboards - LEAN EDITION
 - Behält ALLE UniversalDataTable Funktionalitäten
 - Neue Lean-kompatible Initialisierung
 - Unterstützt: DataTables + Extensions (Buttons, Select, StateRestore, ColReorder, FixedHeader, FixedColumns, SearchBuilder, SearchPanes)
 - Filter (Text, Select, Button), Suchfelder, Paging, ColumnConfig, StateRestore, etc. als Objekte übergeben
*/

// Back-Compat Shim: buildTableIfExists (Zero-Config via data-gdt-*)
if (!window.buildTableIfExists) window.buildTableIfExists = function(selector, config){
  try {
    if (!config || typeof config !== 'object') config = {};
    if (selector && !config.tableSelector) config.tableSelector = selector;
    return new UniversalDataTable(config);
  } catch(e) { console.warn('[GDT] buildTableIfExists shim failed:', e); return null; }
};

// === UNIVERSAL DATATABLE CLASS (KOMPLETT ÜBERNOMMEN) ===
class UniversalDataTable {
  constructor({
    tableSelector,
    columns,
    ajax = null,
    data = null,
    options = {},
    filters = [],
    searchInput = null,
    pageSelect = null,
    externalPaging = null,
    externalInfo = null,
    stateRestore = false,
    select = false,
    buttons = [],
    externalButtonFilters = [],
    extensions = {},
    onRowSelect = null,
    onInit = null,
    root = null,
    el = null,
    ...rest
  }) {
    
    // Root + Container-Resolve (VEREINFACHT für Lean)
    const sel = el || tableSelector;
    let rootEl = root;
    if (typeof rootEl === 'string') rootEl = document.querySelector(rootEl);

    let target = null;
    
    // VEREINFACHTE Target-Suche für Lean
    if (typeof sel === 'string') {
      target = document.querySelector(sel);
      if (!target && sel.startsWith('#')) {
        target = document.getElementById(sel.slice(1));
      }
    } else if (sel && sel.nodeType === 1) {
      target = sel;
    }

    if (!target) {
      console.warn('[UDT] Tabelle nicht gefunden:', sel);
      return null;
    }

    if (!target.matches('table')) {
      const t = target.querySelector('table');
      if (!t) throw new Error('[UDT] Erwartet ein <table> Element');
      target = t;
    }

    // Root für Lean setzen (einfacher)
    if (!rootEl) {
      rootEl = target.closest('.dashboard-section, .page, main') || document.body;
    }

    this._root = rootEl;
    this.selector = target;
    this.columns = columns;
    this.ajax = ajax;
    this.data = data;
    this.filters = Array.isArray(filters) ? filters : [];
    this.searchInput = searchInput;
    this.pageSelect = pageSelect;
    this.externalPaging = externalPaging;
    this.externalInfo = externalInfo;
    this.stateRestore = stateRestore;
    this.select = select;
    this.buttons = buttons;
    this.externalButtonFilters = externalButtonFilters;
    this.extensions = extensions;
    this.onRowSelect = onRowSelect;
    this.onInit = onInit;
    this.dtInstance = null;
    this.dtConfig = { ...options, ...rest, columns };
    // performance.deferRender aus Defaults übernehmen (Konzept §36)
    try {
      const P = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.performance) || {};
      if (P && P.deferRender === true && this.dtConfig.deferRender === undefined) {
        this.dtConfig.deferRender = true;
      }
    } catch(_){}
    if (ajax) this.dtConfig.ajax = ajax;
    if (data) this.dtConfig.data = data;
    
    this.init();
  }

  init() {
    // Extensions konfigurieren (KOMPLETT ÜBERNOMMEN)
    if (this.buttons && this.buttons.length) this.dtConfig.dom ??= 'Bfrtip';
    if (this.buttons) this.dtConfig.buttons = this.buttons;
    if (this.select) this.dtConfig.select = this.select;
    if (this.stateRestore) this.dtConfig.stateRestore = this.stateRestore;
    this.dtConfig.fixedHeader = false;
    if (this.extensions.fixedColumns) this.dtConfig.fixedColumns = this.extensions.fixedColumns;
    if (this.extensions.colReorder) this.dtConfig.colReorder = this.extensions.colReorder;
    if (this.extensions.searchBuilder) this.dtConfig.searchBuilder = this.extensions.searchBuilder;
    if (this.extensions.searchPanes) this.dtConfig.searchPanes = this.extensions.searchPanes;

    // Destroy existing (KOMPLETT ÜBERNOMMEN)
    const DTns = ($.fn.DataTable || $.fn.dataTable);
    if (DTns && typeof DTns.isDataTable === 'function' && DTns.isDataTable(this.selector)) {
      try { $(this.selector).DataTable().destroy(); } catch {}
      try { $(this.selector).empty(); } catch {}
    }

    // Sektor Loading (VEREINFACHT für Lean)
    const $preTable = $(this.selector);

    // Low-Code Layout-Flags: Horizontal-Scroll & Responsive-Details
    try {
      const attrScrollX = ($preTable.attr('data-gdt-scrollx') || '').trim();
      if (attrScrollX === '1' || attrScrollX.toLowerCase() === 'true') {
        this.dtConfig.scrollX = true;
        if (this.dtConfig.autoWidth === undefined) this.dtConfig.autoWidth = false;
      }

      // Vertical-Scroll (Opt-in): data-gdt-scrolly -> scrollY + scrollCollapse
      const attrScrollY = ($preTable.attr('data-gdt-scrolly') || '').trim();
      if (attrScrollY) {
        let sy = attrScrollY;
        if (sy === '1' || sy.toLowerCase() === 'true') {
          sy = 'auto';
        } else if (/^\d+$/.test(sy)) {
          sy = sy + 'px';
        }
        this.dtConfig.scrollY = sy;
        this.dtConfig.scrollCollapse = true;
      }

      const attrResp = ($preTable.attr('data-gdt-responsive') || '').trim();
      // Responsive wird global hart deaktiviert
      this.dtConfig.responsive = false;

      // Externe Controls & Debug per Data-Attribut
      const attrSearch = ($preTable.attr('data-gdt-search') || '').trim();
      if (attrSearch) { this.searchInput = attrSearch; }
      const attrPaging = ($preTable.attr('data-gdt-external-paging') || '').trim();
      if (attrPaging) { this.externalPaging = attrPaging; }
      const attrExtBtn = ($preTable.attr('data-gdt-extbtn') || '').trim();
      if (attrExtBtn) { this.externalButtonFilters = (attrExtBtn === '1' || attrExtBtn.toLowerCase() === 'true') ? true : attrExtBtn; }
      const attrDebug = ($preTable.attr('data-gdt-debug') || '').trim();
      if (attrDebug === '1' || attrDebug.toLowerCase() === 'true') { this.debug = true; }
    } catch(_) {}




    let $sectorNode = $preTable.closest('.dashboard-section-container, .dashboard-section');

    if ($sectorNode.length) {
      $sectorNode.addClass('dt-sector-loading');
    }

    // Header-Inputs im ERSTEN thead-TR vorbereiten (keine zweite Zeile)
    try {
      const F = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.filters) || null;
      const wantHeader = !!(F && F.enabled !== false && F.headerInputs);
      const hasExplicit = Array.isArray(this.filters) && this.filters.some(f => f && (f.type === 'text' || f.type === 'select'));
      const hasAttr = $preTable.find('thead tr:first-child th[data-gdt-filter]').length > 0;
      if (wantHeader || hasExplicit || hasAttr) {

        const $thead = $preTable.find('thead');
        if ($thead.length) {
          // alte Reste entfernen (Filterzeile löschen, Inline-Inputs leeren)
          $thead.find('tr.gdt-filter-row').remove();
          $thead.find('tr:first-child th .gdt-hfilter').remove();
        }
      }
    } catch(_) {}


    /* StateSave aktivieren + Key festlegen (kompatibel zu vorhandenen storeKey) */
    try {
      if (typeof this.dtConfig.stateSave === 'undefined') this.dtConfig.stateSave = true;
      this.dtConfig.stateDuration = 0;

      const tableEl = ($preTable && $preTable[0]) || null;
      const fallbackKey = (() => {
        try {
          const id   = (tableEl && (tableEl.getAttribute('id') || tableEl.dataset.gdtId)) || 'table';
          const hash = (tableEl && (tableEl.dataset.gdtSchema || tableEl.dataset.gdtSchemaHash)) || '';
          return 'GDT:state:' + id + (hash ? (':' + hash) : '');
        } catch(_) { return 'GDT:state:table'; }
      })();

      const stateKey = (typeof storeKey !== 'undefined' && storeKey) ? storeKey : fallbackKey;

      this.dtConfig.stateSaveCallback = (settings, data) => {
        try { localStorage.setItem(stateKey, JSON.stringify(data)); } catch(_){}
      };
      this.dtConfig.stateLoadCallback = (settings) => {
        try { const s = localStorage.getItem(stateKey); return s ? JSON.parse(s) : null; } catch(_) { return null; }
      };
    } catch(_) {}

    this.dtInstance = $preTable.DataTable(this.dtConfig);


    // ▼ State-Hooks (DataTables stateSaveParams/stateLoadParams)
    try {
      const dt = this.dtInstance;
      const tableEl = dt && dt.table ? dt.table().node() : null;
      const S = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.state) || {};
      const includeWidths = (S.includeWidths !== false);

      if (dt && tableEl) {
        dt.off('stateSaveParams.dt.gdt stateLoadParams.dt.gdt');

        // Beim Speichern: zusätzliche GDT-Infos anhängen
        dt.on('stateSaveParams.dt.gdt', function(_e, _settings, data) {
          try {
            data.gdt = data.gdt || {};
            // Sichtbarkeit explizit mitgeben (robust ggü. fehlender ColReorder/ColVis-Persistenz)
            const vis = [];
            for (let i = 0; i < dt.columns().count(); i++) vis.push(dt.column(i).visible());
            data.gdt.visibility = vis;

            // Spaltenbreiten aufnehmen (Header hat die verlässliche Breite)
            if (includeWidths) {
              const ths = (tableEl && tableEl.tHead && tableEl.tHead.querySelectorAll('th')) || [];
              const widths = Array.from(ths).map(th => (th && th.style && th.style.width) ? th.style.width : '');
              data.gdt.widths = widths;
            }

            // Event-Dispatch innerhalb des try-Blocks
            try {
              const tEl = dt && dt.table ? dt.table().node() : null;
              if (tEl) {
                tEl.dispatchEvent(new CustomEvent('GDT:StateSaved', {
                  detail:{ key: (typeof stateKey !== 'undefined' ? stateKey : undefined), when: Date.now(), phase:'params' },
                  bubbles:true
                }));
              }
            } catch(_){}
          } catch(_){}
        });




      // Beim Laden: zusätzliche GDT-Infos anwenden (sanft, ohne zu brechen)
      dt.on('stateLoadParams.dt.gdt', function(_e, _settings, data) {
        try {
          const g = data && data.gdt ? data.gdt : null;
          if (!g) return;
          if (Array.isArray(g.visibility)) g.visibility.forEach((v,i) => { try { dt.column(i).visible(!!v, false); } catch(_){} });
          // Breiten anwenden (nur wenn explizit vorhanden)
          if (Array.isArray(g.widths)) {
            const ths = (tableEl && tableEl.tHead && tableEl.tHead.querySelectorAll('th')) || [];
            g.widths.forEach((w,i) => { try { if (ths[i] && w) ths[i].style.width = w; } catch(_){} });
            try { dt.columns.adjust(); } catch(_){}
          }
          // Event-Dispatch innerhalb des try-Blocks
          try {
            const tEl = dt && dt.table ? dt.table().node() : null;
            if (tEl) {
              tEl.dispatchEvent(new CustomEvent('GDT:StateSaved', {
                detail:{ key: (typeof stateKey !== 'undefined' ? stateKey : undefined), when: Date.now(), phase:'load' },
                bubbles:true
              }));
            }
          } catch(_){}
        } catch(_){}
      });

      }
    } catch(_){}
    // Falls Responsive explizit aus: hart deaktivieren & Control-Klassen entfernen (Legacy-States)
    try {
      if (this.dtConfig.responsive === false) {
        this.dtInstance.responsive && this.dtInstance.responsive.disable && this.dtInstance.responsive.disable();
        $preTable.find('td.dtr-control, th.dtr-control').removeClass('dtr-control');
      }
    } catch(_) {}

    /* suppress adjust on init to prevent jump */

    this.dt = this.dtInstance;

    // Controller-Referenzen für externe Tools/Console ablegen
    try { $preTable.data('gdtController', this); } catch(_){}
    try { this.dtInstance.settings()[0]._gdt = this; } catch(_){}

    try { console.info('[GDT_DBG] dt ready:', { id: ($preTable[0] && $preTable[0].id) || null, columns: this.dtInstance.columns().count(), hasFiltersArray: Array.isArray(this.filters) && this.filters.length }); } catch(_) {}

    // Sicherer Erst-Retry nach erstem sichtbaren Draw (Header kann spät kommen)
    try {
      const again = () => { try { this.addColumnFilters(); } catch(_) {} };
      this.dtInstance.off('draw.dt.gdt_hdr_retry').one('draw.dt.gdt_hdr_retry', () => setTimeout(again, 50));
    } catch(_) {}




    // ⬅︎ NEU: Header-Filter sofort (deterministisch) aufbauen, falls per Config gewünscht
    try {
      const hasExplicitFilters = Array.isArray(this.filters) && this.filters.some(f => f && (f.type === 'text' || f.type === 'select'));
      try { console.info('[GDT_DBG] hasExplicitFilters:', hasExplicitFilters, this.filters); } catch(_) {}
      if (hasExplicitFilters) {
        try { console.info('[GDT_DBG] addColumnFilters() → initial'); } catch(_) {}
        // sofort versuchen …
        try { this.addColumnFilters(); } catch(e) { try { console.warn('[GDT_DBG] addColumnFilters initial failed', e); } catch(_) {} }
        // … und direkt nach dem ersten Draw ein zweites Mal, falls DOM gerade „in Bewegung“ ist
        this.dtInstance.off('draw.dt.gdt_hdr_boot').one('draw.dt.gdt_hdr_boot', () => {
          try { console.info('[GDT_DBG] addColumnFilters() → after first draw'); } catch(_) {}
          try { this.addColumnFilters(); } catch(e) { try { console.warn('[GDT_DBG] addColumnFilters after-draw failed', e); } catch(_) {} }
        });
      }
    } catch {}


    const adjustNow = () => { /* suppressed to prevent post-init jump */ };
    adjustNow();


    // Viewport-Resize → columns.adjust() (debounced)
    (function bindViewportAdjust(){
      try {
        let _t = null;
        const dt = this.dtInstance;
        window.addEventListener('resize', () => {
          clearTimeout(_t);
          _t = setTimeout(() => {
            /* suppress adjust on viewport resize to prevent jump */
          }, 120);
        });
      } catch(e) { /* no-op */ }
    }).call(this);


    // --- [AUTO PAGE LENGTH] optional per GDT_DEFAULTS.performance.autoPageLength

    (function autoPageLen(){
      try {
        const cfg = (this.dtConfig && this.dtConfig.performance && this.dtConfig.performance.autoPageLength)
          || (window.GDT_DEFAULTS && window.GDT_DEFAULTS.performance && window.GDT_DEFAULTS.performance.autoPageLength);
        if (!cfg || !cfg.enabled) return;

        const dt = this.dtInstance;
        const $table = $(this.selector);
        const $wrapper = $table.closest('.section-scrollable-overview, .dln-dashboard-overview, .dashboard-section-container, .dashboard-section, .page, ' + 'main');
        if (!$wrapper.length) return;

        const recompute = () => {
          try {
            const Hwrapper = $wrapper.innerHeight();
            const Hthead = $(dt.table().header()).outerHeight() || 0;
            const $firstRow = $(dt.table().body()).find('tr:visible:first');
            const Hrow = $firstRow.outerHeight() || 32;
            const rowsFit = Math.floor((Hwrapper - Hthead) / Hrow);
            const min = cfg.min ?? 1;
            const max = cfg.max ?? 200;
            const len = Math.max(min, Math.min(max, rowsFit));
            if (Number.isFinite(len) && len > 0) {
              dt.page.len(len).draw(false);
            }
          } catch(_) {}
        };

        dt.one('draw.dt.autolen', recompute);
        dt.on('column-visibility.dt.autolen column-reorder.dt.autolen', () => setTimeout(recompute, 50));
        let _t = null;
        window.addEventListener('resize', () => { clearTimeout(_t); _t = setTimeout(recompute, 120); });
      } catch(e) {
        console.warn('[GDT] autoPageLength skipped:', e);
      }
    }).call(this);


    // Events für Sektor (KOMPLETT ÜBERNOMMEN)
    if ($sectorNode.length) {
      this.dtInstance.on('init.dt.udt', () => {
        $sectorNode.removeClass('dt-sector-loading');
      });

      this.dtInstance.on('processing.dt.udt', (e, settings, processing) => {
        const wantsOverlay = (processing === true) && (!!settings.oFeatures.bServerSide || !!settings.ajax);
        $sectorNode.toggleClass('dt-sector-loading', wantsOverlay);
      });

      this.dtInstance.on('preDraw.dt.udt draw.dt.udt', () => {
        $sectorNode.removeClass('dt-sector-loading');
      });

      this.dtInstance.on('order.dt.udt search.dt.udt page.dt.udt column-visibility.dt.udt', () => {
        $sectorNode.removeClass('dt-sector-loading');
      });
    }

    // Externes Suchfeld (KOMPLETT ÜBERNOMMEN)
    if (this.searchInput) {
      $(this.searchInput).off('input').on('input', e => {
        this.dtInstance.search(e.target.value).draw();
      });
    }

    // Externes Paging (KOMPLETT ÜBERNOMMEN)
    if (this.pageSelect) {
      $(this.pageSelect).off('change').on('change', e => {
        this.dtInstance.page.len(parseInt(e.target.value, 10) || 10).draw(false);
      });
    }

    if (this.externalPaging) {
      const $paging = $(this.externalPaging);
      const table = this.dtInstance;

      function renderPaging() {
        const info = table.page.info();
        $paging.empty();

        const prevBtn = $('<button type="button" class="btn btn-outline-secondary btn-sm">&laquo;</button>')
          .prop('disabled', info.page === 0)
          .on('click', () => table.page('previous').draw('page'));
        $paging.append(prevBtn);

        for (let i = 0; i < info.pages; i++) {
          const btn = $('<button type="button" class="btn btn-outline-primary btn-sm"></button>')
            .text(i + 1)
            .toggleClass('active', i === info.page)
            .on('click', () => table.page(i).draw('page'));
          $paging.append(btn);
        }

        const nextBtn = $('<button type="button" class="btn btn-outline-secondary btn-sm">&raquo;</button>')
          .prop('disabled', info.page === info.pages - 1 || info.pages === 0)
          .on('click', () => table.page('next').draw('page'));
        $paging.append(nextBtn);
      }

      table.on('draw', renderPaging);
      renderPaging();
    }

    if (this.externalInfo) {
      const $info = $(this.externalInfo);
      const table = this.dtInstance;

      function updateInfo() {
        const info = table.page.info();
        $info.text(`${info.start + 1} bis ${info.end} von ${info.recordsDisplay} Einträgen`);
      }

      table.on('draw', updateInfo);
      updateInfo();
    }

    // Sichtbare UI: Ellipsis + Tooltip (gemäß GDT-Konzept)
    (function applyEllipsis(){
      try {
        const ui = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.ellipsis) || { enabled:false };
        if (!ui.enabled) return;
        const dt = this.dtInstance;

        // Globale Ellipsis-/No-wrap-Styles (ohne DOM-Wrapping) – erlauben kleinere Breite als Inhalt
        try {
          if (!document.getElementById('gdt-overflow-style')) {
            const st = document.createElement('style');
            st.id = 'gdt-overflow-style';
            st.textContent =
              '.gdt-nowrap td, .gdt-nowrap th{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box;min-width:0;}' +
              '.gdt-nowrap td > *, .gdt-nowrap th > *{max-width:100%;overflow:hidden;text-overflow:ellipsis;display:inline-block;vertical-align:top;min-width:0;}';
            document.head.appendChild(st);
          }
          const tbl = dt && dt.table && dt.table().node ? dt.table().node() : null;
          if (tbl && !tbl.classList.contains('gdt-nowrap')) {
            tbl.classList.add('gdt-nowrap');
            try { tbl.style.tableLayout = 'fixed'; } catch(_){}
          }
        } catch(_) {}
        // Kein DOM-Wrapping der Zellen – Hover/Tooltip wird weiter unten
        // über __gdtSetOverflowTitles() gesetzt.
      } catch(e) { console.warn('[GDT] ellipsis skipped:', e); }
    }).call(this);



    // Sichtbare UI: Smart-Widths (einmalig beim ersten Draw)
    (function applySmartWidths(){
      try {
        const ui = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.smartWidths) || { enabled:false };
        if (!ui.enabled) return;
        const dt = this.dtInstance;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        try {
          const cs = getComputedStyle(this.selector);
          ctx.font = `${cs.fontWeight || '400'} ${cs.fontSize || '14px'} ${cs.fontFamily || 'Arial, sans-serif'}`;
        } catch(_) {}
        const clamp = (v,min,max)=>Math.max(min, Math.min(max, v));

        const measureCol = (idx) => {
          const nodes = dt.rows({ search:'applied' }).nodes().toArray();
          const sample = nodes.slice(0, ui.sampleRows ?? 25);
          let w = 0;
          for (let i=0;i<sample.length;i++){
            const cell = sample[i].cells[idx];
            if (!cell) continue;
            const text = (cell.innerText || '').trim();
            const m = ctx.measureText(text);
            w = Math.max(w, m.width || 0);
          }
          const minPx = ui.minPx ?? 120, maxPx = ui.maxPx ?? 420;
          const px = clamp(Math.ceil(w) + 24, minPx, maxPx); // + Padding
          $(dt.column(idx).header()).css('width', px + 'px');
        };

        dt.one('draw.dt.gdt_sw', () => {
          const count = dt.columns().count();
          for (let i=0;i<count;i++) measureCol(i);
          // dt.columns.adjust().draw(false);
        });
        dt.on('column-visibility.dt.gdt_sw column-reorder.dt.gdt_sw', () => {
          // dt.columns.adjust().draw(false);
        });
      } catch(e) { console.warn('[GDT] smartWidths skipped:', e); }
    }).call(this);

    // Sichtbare UI: Column-Resize (Handles + Drag, nur wenn aktiviert)
    (function applyColumnResize(){
      try {
        const cfg = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.columnResize) || { enabled:false };
        if (!cfg.enabled) return;
        const dt = this.dtInstance;
        const table = dt.table();
        const header = table.header();
        const tableEl = table.node();
        if (!header) return;

        let minPx = cfg.minPx ?? 96;
        let maxPx = cfg.maxPx ?? 640;
        const snap   = cfg.snapStep ?? 1;
        const handleW = cfg.handleWidth ?? 8;
        /* Responsive-Guards: optionale Breakpoints (letzte passende gewinnt) */
        try {
          const bps = cfg.breakpoints || null;
          if (bps && typeof matchMedia === 'function') {
            const applyBP = (q, v) => {
              try {
                if (!q || !v) return;
                if (matchMedia(q).matches) {
                  if (typeof v.minPx === 'number') minPx = v.minPx;
                  if (typeof v.maxPx === 'number') maxPx = v.maxPx;
                }
              } catch(_) {}
            };
            applyBP(bps.sm?.query || '(max-width: 640px)',  bps.sm);
            applyBP(bps.md?.query || '(max-width: 768px)',  bps.md);
            applyBP(bps.lg?.query || '(max-width: 1024px)', bps.lg);
            applyBP(bps.xl?.query || '(max-width: 1280px)', bps.xl);
          }
        } catch(_){}


        const saveKey = () => {
          const node = table.node();
          return (window.GDT_DEFAULTS?.state?.keyPrefix || 'gdt:') + 'widths:' + (node && node.id ? node.id : '');
        };

        const saveWidths = () => {
          try {
            if (!cfg.persist) return;
            const headRow = header.querySelector('tr'); if (!headRow) return;
            const ths = headRow.querySelectorAll('th');
            const widths = Array.from(ths).map(th => th.style.width || (th.getBoundingClientRect().width + 'px'));
            localStorage.setItem(saveKey(), JSON.stringify(widths));
          } catch(_) {}
        };

        const loadWidths = () => {
          try {
            const raw = localStorage.getItem(saveKey());
            if (!raw) return;
            const widths = JSON.parse(raw);
            const headRow = header.querySelector('tr'); if (!headRow) return;
            const ths = headRow.querySelectorAll('th');
            widths.forEach((w,i)=>{ if(ths[i]) ths[i].style.width = w; });
          } catch(_) {}
        };

        // Persistierte Breiten übernehmen
        if (cfg.persist) loadWidths();

        const rebuild = () => {
          try {
            const headRow = header.querySelector('tr');
            if (!headRow) return;
            const ths = Array.from(headRow.querySelectorAll('th'));
            // Tabellenlayout fixieren + Zellen kleiner als Inhalt erlauben
            const tbl = (table.node && table.node()) ? table.node() : (tableEl || null);
            if (tbl) {
              try {
                tbl.style.tableLayout = 'fixed';
                tbl.querySelectorAll('th, td').forEach(cell => {
                  cell.style.minWidth = '0';
                  cell.style.boxSizing = cell.style.boxSizing || 'border-box';
                });
              } catch(_) {}
            }
            // vorhandene Griffe entfernen (Rebuild)
            headRow.querySelectorAll('span.gdt-col-resize').forEach(n => n.remove());


            ths.forEach((th, idx) => {
              th.style.position = th.style.position || 'relative';
              if (idx === ths.length - 1) return; // letzte Spalte ohne Handle

const grip = document.createElement('span');
              grip.className = 'gdt-col-resize';
              grip.style.cssText = 'position:absolute;top:0;right:0;height:100%;width:'+handleW+'px;cursor:col-resize;user-select:none;touch-action:none;pointer-events:auto;z-index:3;';
              /* A11y: Tastaturfokus + Rolle/Label */
              try { grip.setAttribute('role','separator'); } catch(_){}
              try { grip.setAttribute('aria-orientation','vertical'); } catch(_){}
              try { grip.setAttribute('aria-label','Spaltenbreite ändern'); } catch(_){}
              try { grip.setAttribute('tabindex','0'); } catch(_){}
              th.appendChild(grip);
              
              const _headCols = (function(){
                try {
                                    const scroller = (tableEl.closest('.swipe-panel')
                    ? (tableEl.closest('.swipe-panel').querySelector('.dataTables_scroll') || tableEl.closest('.swipe-panel'))
                    : tableEl.closest('.dataTables_scroll'));
                  if (scroller) {
                    const nodes = scroller.querySelectorAll('.dataTables_scrollHeadInner table colgroup col');
                    if (nodes && nodes.length) return nodes;
                  }
                  return (tableEl && tableEl.querySelectorAll('colgroup col')) || [];
                } catch(_) { return []; }
              })();
              const _bodyCols = (function(){
                try {
                                    const scroller = (tableEl.closest('.swipe-panel')
                    ? (tableEl.closest('.swipe-panel').querySelector('.dataTables_scroll') || tableEl.closest('.swipe-panel'))
                    : tableEl.closest('.dataTables_scroll'));
                  if (scroller) {
                    const nodes = scroller.querySelectorAll('.dataTables_scrollBody table colgroup col');
                    if (nodes && nodes.length) return nodes;
                  }
                  return (tableEl && tableEl.querySelectorAll('colgroup col')) || [];
                } catch(_) { return []; }
              })();

              let startX = 0, startW = 0, dragging = false, moved = false, lastW = 0, startEdge = 0, guide = null, rafPending = false, suppressClick = false;
              /* Scroll-Host robust ermitteln: nächster horizontal scrollbarer Vorfahre */
              let scrollHost = th.parentElement;
              try {
                while (scrollHost && scrollHost !== document.body) {
                  const cs = getComputedStyle(scrollHost);
                  if (cs && /auto|scroll/i.test(cs.overflowX)) break;
                  scrollHost = scrollHost.parentElement;
                }
              } catch(_) {}
              /* Wrap = gemeinsamer Bezugspunkt für Head/Body; fallback wie gehabt */
              const panel = th.closest('.swipe-panel');
              const wrap = (panel && (panel.querySelector('.dataTables_scroll') || panel.querySelector('.dataTables_scrollHead') || panel.querySelector('.dataTables_wrapper')))
                || scrollHost || th.closest('.dataTables_scroll') || th.closest('.dataTables_scrollHead') || th.closest('.dataTables_wrapper')
                || (table.container && table.container()) || table.node()?.parentNode || document.body;


              const makeGuide = (xPx) => {
                if (guide) return;
                guide = document.createElement('div');
                guide.className = 'gdt-resize-guide';
                guide.style.cssText =
                  'position:absolute;top:0;bottom:0;width:0;'+
                  'border-right:2px solid rgba(0,0,0,.45);'+
                  'pointer-events:none;z-index:9999;';
                // Container muss positioniert sein, sonst absolute nicht relativ
                const cs = getComputedStyle(wrap);
                if (cs.position === 'static') wrap.style.position = 'relative';
                wrap.appendChild(guide);
                guide.style.left = xPx + 'px';
              };

              const moveGuide = (xPx) => { if (guide) guide.style.left = xPx + 'px'; };

              const removeGuide = () => {
                if (guide && guide.parentNode) guide.parentNode.removeChild(guide);
                guide = null;
              };

              const onWinResize = () => {
                if (!guide) return;
                try {
                  const wr = wrap.getBoundingClientRect();
                  const tr = th.getBoundingClientRect();
                  moveGuide(tr.right - wr.left);
                } catch(_) {}
              };

              /* Scroll-Realign am echten horizontalen Scroll-Host (auch ohne DataTables-Wrapper) */
              const onHostScroll = () => {
                if (!guide) return;
                try {
                  const wr = wrap.getBoundingClientRect();
                  const tr = th.getBoundingClientRect();
                  moveGuide(tr.right - wr.left);
                } catch(_) {}
              };

              const onDown = (ev) => {
                dragging = true;
                moved = false;
                suppressClick = true;
                const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
                startX = clientX;
                const thRect0 = th.getBoundingClientRect();
                try { th.style.minWidth = '0px'; } catch(_){}
                startW = thRect0.width;
                startEdge = thRect0.right;

                // fixe Cursorführung
                document.body.style.cursor = 'col-resize';
                document.body.classList.add('gdt-resizing');

                // Startposition der vertikalen Linie (rechte TH-Kante)
                const wrapRect = wrap.getBoundingClientRect();
                makeGuide(startEdge - wrapRect.left);
                /* Sofortige Re-Justierung ein Frame später (fix für Padding/Transforms/Scrollbar-Gutter) */
                requestAnimationFrame(() => {
                  try {
                    const wr = wrap.getBoundingClientRect();
                    const tr = th.getBoundingClientRect();
                    moveGuide(tr.right - wr.left);
                  } catch(_) {}
                });
                requestAnimationFrame(() => { try { const wr = wrap.getBoundingClientRect(); const tr = th.getBoundingClientRect(); moveGuide(tr.right - wr.left); } catch(_) {} });
                requestAnimationFrame(() => { try { const wr = wrap.getBoundingClientRect(); moveGuide(th.getBoundingClientRect().right - wr.left); } catch(_) {} });

                // Click auf dem TH nach Resize unterdrücken (Sort verhindern)
                const clickBlock = function(e){
                  if (suppressClick) { e.stopImmediatePropagation?.(); e.stopPropagation(); e.preventDefault(); }
                };
                th.addEventListener('click', clickBlock, true);
                // Merker, damit wir ihn in onUp entfernen können
                th._gdtClickBlock = clickBlock;


                // Pointer/Capture (falls verfügbar)
                if (ev.target?.setPointerCapture && ev.pointerId != null) {
                  try { ev.target.setPointerCapture(ev.pointerId); } catch(_) {}
                }

                document.addEventListener('mousemove', onMove, true);
                document.addEventListener('mouseup', onUp, true);
                document.addEventListener('touchmove', onMove, { passive:false, capture:true });
                document.addEventListener('touchend', onUp, { capture:true });
                window.addEventListener('resize', onWinResize, true);
                try { if (wrap && wrap !== document.body) wrap.addEventListener('scroll', onHostScroll, { passive:true, capture:true }); } catch(_){}

                ev.preventDefault();
                ev.stopPropagation();
              };

              const onMove = (ev) => {
                if (!dragging) return;
                const clientX = ev.touches ? ev.touches[0].clientX : ev.clientX;
                const delta = clientX - startX;

                // erst ab 2 px Bewegung wirklich aktiv werden
                if (!moved && Math.abs(delta) < 2) {
                  ev.preventDefault?.();
                  ev.stopPropagation?.();
                  return;
                }
                moved = true;

                let w = startW + delta;
                {
                  const _min = Number(cfg && cfg.minPx) || 8;
                  const _max = Number(cfg && cfg.maxPx) || 4096;
                  w = Math.max(_min, Math.min(_max, w));
                }

                if (snap > 1) w = Math.round(w / snap) * snap;
                lastW = w;

                // Live-Resize flüssig mit rAF (kein „Davonlaufen“ des Cursors)
                if (!rafPending) {
                  rafPending = true;
                  requestAnimationFrame(() => {
                    th.style.width = lastW + 'px';
                    if (_headCols && _headCols[idx]) { _headCols[idx].style.width = lastW + 'px'; }
                    if (_bodyCols && _bodyCols[idx]) { _bodyCols[idx].style.width = lastW + 'px'; }
                    // Also live-sync body cells in scrolled tables to avoid header/body gaps in hidden panels
                    try {
                      const bodyTable = tableEl;
                      const tds = bodyTable && bodyTable.tBodies && bodyTable.tBodies[0]
                        ? bodyTable.tBodies[0].querySelectorAll('tr td:nth-child(' + (idx+1) + ')') : null;
                      if (tds && tds.length) { tds.forEach(td => { td.style.width = lastW + 'px'; td.style.minWidth = '0px'; }); }
                    } catch(_){/* no-op */}
                    // adjust() erst nach Mouseup – reduziert Layout-Sprünge
                    const wrapRect = wrap.getBoundingClientRect();
                    const thRect   = th.getBoundingClientRect();
                    moveGuide(thRect.right - wrapRect.left);
                    rafPending = false;
                  });
                }

                ev.preventDefault?.();
                ev.stopPropagation?.();
              };


              const onUp = (ev) => {
                if (!dragging) return;
                dragging = false;

                document.removeEventListener('mousemove', onMove, true);
                document.removeEventListener('mouseup', onUp, true);
                document.removeEventListener('touchmove', onMove, true);
                document.removeEventListener('touchend', onUp, true);
                window.removeEventListener('resize', onWinResize, true);
                try { if (wrap && wrap !== document.body) wrap.removeEventListener('scroll', onHostScroll, true); } catch(_){}

                // finale Breite sicherstellen
                if (moved && lastW > 0) {
                  th.style.width = lastW + 'px';
                  // Ellipsis-Fix + ColGroup-Sync: Tabellenlayout fixieren, Zellen kleiner als Inhalt erlauben
                  try {
                    const tbl = th.closest('table');
                    if (tbl) {
                      tbl.style.tableLayout = 'fixed';
                      tbl.querySelectorAll('th, td').forEach(cell => { cell.style.minWidth = '0'; });
                      // DataTables setzt oft Breiten über <colgroup><col> → synchronisieren
                      let cols = tbl.querySelectorAll('colgroup col');
                      try{
                        const wrap = tbl.closest('.dataTables_scroll') || tbl.closest('.dataTables_wrapper');
                        if (wrap){
                          const head = wrap.querySelectorAll('.dataTables_scrollHeadInner table colgroup col');
                          const body = wrap.querySelectorAll('.dataTables_scrollBody table colgroup col');
                          if (head && head.length && head[idx]) head[idx].style.width = lastW + 'px';
                          if (body && body.length && body[idx]) body[idx].style.width = lastW + 'px';
                          if (head && head.length) cols = head;
                        }
                      }catch(_){}
                      if (cols && cols[idx]) { cols[idx].style.width = lastW + 'px'; }

                      try { th.setAttribute('width', lastW); } catch(_) {}
                    }
                  } catch(_) {}
                  // Tooltip deaktiviert halten (keine Browser-Title-Bubbles)
                  try {
                    if (dt && typeof dt.cells === 'function') {
                      dt.cells({ page:'current' }).every(function(){
                        const node = this.node();
                        if (node && node.hasAttribute && node.hasAttribute('title')) node.removeAttribute('title');
                      });
                      const hdr = dt.table().header && dt.table().header();
                      if (hdr) hdr.querySelectorAll('th[title]').forEach(th => th.removeAttribute('title'));
                    }
                  } catch(_){}
                }


                removeGuide();
                document.body.style.cursor = '';
                document.body.classList.remove('gdt-resizing');

                // Sort-Click endgültig unterdrücken (ein Tick lang)
                suppressClick = moved;
                if (th._gdtClickBlock) {
                  // Handler nach dem Click-Bubble wieder lösen
                  setTimeout(() => {
                    suppressClick = false;
                    th.removeEventListener('click', th._gdtClickBlock, true);
                    delete th._gdtClickBlock;
                  }, 0);
                }


                if (cfg.persist) saveWidths();

                // Tooltip deaktiviert: nach Resize evtl. gesetzte title-Attribute entfernen
                try {
                  if (dt && typeof dt.cells === 'function') {
                    dt.cells({ page:'current' }).every(function(){
                      const node = this.node();
                      if (node && node.hasAttribute && node.hasAttribute('title')) node.removeAttribute('title');
                    });
                    const hdr = dt.table().header && dt.table().header();
                    if (hdr) hdr.querySelectorAll('th[title]').forEach(th => th.removeAttribute('title'));
                  }
                } catch(_){}

                // Notify: Column resized (für AutoPageLen/Listener)
                try { tableEl && tableEl.dispatchEvent(new CustomEvent('GDT:ColumnResized', { detail:{ dt, th, width:lastW } })); } catch(_){}

              };




grip.addEventListener('mousedown', onDown, true);
              if (cfg.touch !== false) grip.addEventListener('touchstart', onDown, { passive:false, capture:true });

              /* Keyboard-Resize (A11y): Pfeile ±snap, Shift = ×10 */
              grip.addEventListener('keydown', (ev) => {
                const k = ev.key;
                if (k !== 'ArrowLeft' && k !== 'ArrowRight' && k !== 'Home' && k !== 'End' && k !== 'Escape') return;
                ev.preventDefault();
                try {
                  const rect = th.getBoundingClientRect();
                  let cur = Math.max(minPx, Math.round(rect.width));
                  const step = (snap || 1) * (ev.shiftKey ? 10 : 1);
                  if (k === 'ArrowLeft')  cur -= step;
                  if (k === 'ArrowRight') cur += step;
                  if (k === 'Home')       cur  = minPx;
                  if (k === 'End')        cur  = maxPx;
                  if (k === 'Escape')     return;

                  const newW = Math.max(minPx, Math.min(maxPx, cur));
                  th.style.width = newW + 'px';
                  /* colgroup synchronisieren */
                  try {
                    const tbl = th.closest('table');
                    if (tbl) {
                      tbl.style.tableLayout = 'fixed';
                      let cols = tbl.querySelectorAll('colgroup col');
                      try{
                        const wrap = tbl.closest('.dataTables_scroll') || tbl.closest('.dataTables_wrapper');
                        if (wrap){
                          const head = wrap.querySelectorAll('.dataTables_scrollHeadInner table colgroup col');
                          const body = wrap.querySelectorAll('.dataTables_scrollBody table colgroup col');
                          if (head && head.length && head[idx]) head[idx].style.width = newW + 'px';
                          if (body && body.length && body[idx]) body[idx].style.width = newW + 'px';
                          if (head && head.length) cols = head;
                        }
                      }catch(_){}
                      if (cols && cols[idx]) { cols[idx].style.width = newW + 'px'; }

                      try { th.setAttribute('width', newW); } catch(_){}
                    }
                  } catch(_){}
                  if (cfg.persist) saveWidths();
                  /* Notify */
                  try { tableEl && tableEl.dispatchEvent(new CustomEvent('GDT:ColumnResized', { detail:{ dt, th, width:newW } })); } catch(_){}
                } catch(_) {}
              }, true);

              if (cfg.dblClick === 'autofit') {
                grip.addEventListener('dblclick', (e) => {
                  e.preventDefault();
                  th.style.width = '';
                  // dt.columns.adjust().draw(false);
                  if (cfg.persist) saveWidths();
                }, true);
              }
            });
          } catch(_) {}
        };

        // initial aufbauen
        try { if (tableEl) { tableEl.style.tableLayout = 'fixed'; } } catch(_){}
        rebuild();

        // auf Strukturevents neu aufbauen (ColVis/Reorder/Responsive) und danach justieren
        dt.on('column-visibility.dt.gdt_resize column-reorder.dt.gdt_resize responsive-resize.dt.gdt_resize draw.dt.gdt_hover search.dt.gdt_hover order.dt.gdt_hover length.dt.gdt_hover page.dt.gdt_hover', () => {
          requestAnimationFrame(() => {
            rebuild();
            /* suppress adjust on resize end to prevent jump */
          });
        });

        // NEU: Rebuild nachdem Header-Filter die THs geleert/ersetzt haben
        try {
          if (tableEl) {
            tableEl.addEventListener('GDT:FiltersBuilt', () => {
              requestAnimationFrame(() => {
                rebuild();
                /* suppress adjust on resize end to prevent jump */
              });
            }, true);
          }
        } catch(_) {}


      } catch(e) { console.warn('[GDT] columnResize skipped:', e); }
    }).call(this);

// Spaltenfilter & Filter-Buttons: nach init ODER erstem draw sicher aufbauen
    try {
      const dt = this.dtInstance;
      let built = false;
      
      const tryBuild = () => {
        if (built) return;
        try {
          const headerExists = dt.table().header() && $(dt.table().header()).find('th').length > 0;
          if (!headerExists) {
            console.warn('[GDT] Header not ready yet, waiting for draw...');
            return;
          }
          console.info('[GDT] Building column filters...');
          this.addColumnFilters();
          built = true;
          console.info('[GDT] ✅ Column filters built');
        } catch(e) {
          console.error('[GDT] Filter build failed:', e);
        }
      };

      // Versuch 1: Nach init
      dt.off('init.dt.gdt_hdr_once').one('init.dt.gdt_hdr_once', () => {
        console.info('[GDT] init event fired');
        setTimeout(tryBuild, 50); // Kleine Verzögerung für Header-Rendering
      });

      // Versuch 2: Nach erstem draw
      dt.off('draw.dt.gdt_hdr_first').one('draw.dt.gdt_hdr_first', () => {
        console.info('[GDT] first draw event fired');
        setTimeout(tryBuild, 50);
      });

      // Versuch 3: Fallback nach 150ms
      setTimeout(() => {
        console.info('[GDT] Fallback timeout triggered');
        tryBuild();
      }, 150);
      
      // Versuch 4: Final Fallback nach 600ms (für langsame Systeme)
      setTimeout(() => {
        if (!built) {
          console.warn('[GDT] Final fallback - forcing filter build');
          tryBuild();
        }
      }, 600);

      // Versuch 5: Safety Fallback nach 1200ms (Hidden Tabs/SSR/SPA)
      setTimeout(() => {
        if (!built) {
          console.warn('[GDT] Safety fallback - forcing filter build (1200ms)');
          tryBuild();
        }
      }, 1200);
    } catch(e) {
      console.error('[GDT] Filter init failed:', e);
    }






    // Header-Filter nach Strukturänderungen neu aufbauen (Visibility/Reorder) – unabhängig vom Aufrufer (Manager/Standardweg)
    try {
      const dt = this.dtInstance;

      // Einmaliges CSS für Ellipsis + No-Wrap (scoped)
      try {
        const tbl = dt.table().node();
        if (tbl && !tbl.classList.contains('gdt-nowrap')) {
          tbl.classList.add('gdt-nowrap');
        }
        if (!document.getElementById('gdt-overflow-style')) {
          const st = document.createElement('style');
          st.id = 'gdt-overflow-style';
          st.textContent = '.gdt-nowrap td, .gdt-nowrap th{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-sizing:border-box;min-width:0;} .gdt-nowrap td > *, .gdt-nowrap th > *{max-width:100%;overflow:hidden;text-overflow:ellipsis;display:inline-block;vertical-align:top;min-width:0;}';
          document.head.appendChild(st);
        }
        try { (dt.table().node()||{}).classList?.add('gdt-nowrap'); } catch(_) {}
      } catch(_) {}

      // Helfer: Standard-Tooltip vollständig deaktivieren (alle title-Attribute entfernen)
      const __gdtSetOverflowTitles = () => {
        try {
          dt.cells({ page: 'current' }).every(function () {
            const node = this.node();
            if (node && node.hasAttribute && node.hasAttribute('title')) node.removeAttribute('title');
          });
          const hdr = dt.table().header();
          if (hdr) {
            hdr.querySelectorAll('tr:first-child th[title]').forEach(th => th.removeAttribute('title'));
          }
        } catch (_) { }
      };

      dt.off('column-visibility.dt.gdt_hdr column-reorder.dt.gdt_hdr responsive-resize.dt.gdt_hdr xhr.dt.gdt_hdr')
        .on('column-visibility.dt.gdt_hdr column-reorder.dt.gdt_hdr responsive-resize.dt.gdt_hdr xhr.dt.gdt_hdr', () => {
          // leicht verzögert, damit DataTables Header/TH final ist
          setTimeout(() => { try { this.addColumnFilters(); } catch {} }, 50);
          setTimeout(() => { try { __gdtSetOverflowTitles(); } catch {} }, 60);
        });

      // Bei jedem Draw Titel aktualisieren (Paging, Suche, Sort etc.)
      dt.off('draw.dt.gdt_titles').on('draw.dt.gdt_titles', () => {
        setTimeout(() => { try { __gdtSetOverflowTitles(); } catch {} }, 0);
      });

      // Direkt nach Init einmalig setzen
      setTimeout(() => { try { __gdtSetOverflowTitles(); } catch {} }, 0);

      // Hover-Overlay initialisieren (Anchor + Card) und Events binden
      try {
        const tableEl = dt.table().node();
        const wrap = (tableEl && (tableEl.closest('.dataTables_wrapper') || tableEl.parentElement)) || null;
        if (wrap) {
          const cs = getComputedStyle(wrap);
          if (cs.position === 'static') { try { wrap.style.position = 'relative'; } catch(_) {} }
          let hover = wrap.querySelector('.gdt-hover-anchor');
          if (!hover) {
            hover = document.createElement('div');
            hover.className = 'gdt-hover-anchor';
            try { hover.setAttribute('aria-hidden','true'); } catch(_){}
            wrap.appendChild(hover);
          }
          let card = wrap.querySelector('.gdt-hover-card');
          if (!card) {
          card = document.createElement('div');
          card.className = 'gdt-hover-card';
          try { card.setAttribute('role','tooltip'); } catch(_){}
          try { card.setAttribute('aria-live','polite'); } catch(_){}
          try { card.setAttribute('tabindex','-1'); card.setAttribute('aria-hidden','true'); } catch(_){}
          wrap.appendChild(card);
          }

          const $tbl = $(tableEl);
          const $tbody = $tbl.find('tbody');

          // Variante A: äußerer Container scrollt horizontal, vertikal bleibt aus
          try {
            const sect = tableEl.closest('.section-scrollable-overview');
            if (sect) {
              sect.style.overflowX = 'auto';
              sect.style.overflowY = 'hidden';
              sect.style.boxSizing = 'border-box';

              // Dynamisch: unteren Innenabstand = echte Scrollbar-Höhe (damit Navbar nicht hochrückt)
              const applyContainerPaddingForScrollbar = () => {
                try {
                  const need = tableEl.scrollWidth > (sect.clientWidth + 1);
                  let sbH = 15;
                  try {
                    if (!window.__gdtSBH) {
                      const probe = document.createElement('div');
                      probe.style.cssText = 'position:absolute;visibility:hidden;overflow:scroll;width:100px;height:100px;';
                      document.body.appendChild(probe);
                      window.__gdtSBH = Math.max(15, probe.offsetHeight - probe.clientHeight);
                      document.body.removeChild(probe);
                    }
                    sbH = window.__gdtSBH;
                  } catch(_) {}
                  // Wenn externer H-Scroll-Layer existiert → hier KEIN Padding
                  const host = sect.parentElement;
                  const hasLayer = !!(host && host.querySelector('.section-hscroll-layer'));
                  const pad = (!hasLayer && need) ? (sbH + 'px') : '0px';
                  if (sect.style.paddingBottom !== pad) sect.style.paddingBottom = pad; // verhindert „Gap“ nach erstem Hide
                } catch(_) {}
              };




              // ► NEU: H-Scroll-Layer zwischen Overview & Pagination einziehen
              try {
                const host = sect.parentElement;
                const pag  = host && host.querySelector('.section-pagination-overview');
                let layer  = host && host.querySelector('.section-hscroll-layer');
                const scRef = (wrap && wrap.querySelector('.dataTables_scrollBody')) || wrap || tableEl.parentElement;

                if (host && !layer) {
                  layer = document.createElement('div');
                  layer.className = 'section-hscroll-layer';
                  try { layer.setAttribute('role','presentation'); layer.setAttribute('aria-hidden','true'); layer.setAttribute('tabindex','-1'); } catch(_){}
                  layer.style.overflowX = 'auto';
                  layer.style.overflowY = 'hidden';
                  layer.style.boxSizing  = 'border-box';
                  layer.style.margin     = '0';
                  layer.style.padding    = '0 15px';
                  layer.style.backgroundColor = '#fff';
                  layer.style.backgroundClip  = 'padding-box';
                  layer.style.width      = 'calc(100% - 30px)';
                  layer.style.marginLeft = '15px';
                  // Höhe dynamisch per echter Scrollbar-Höhe
                  let sbH = 15; try { sbH = window.__gdtSBH || sbH; } catch(_) {}
                  layer.style.height = sbH + 'px';
                  layer.style.display = 'none'; // initial hidden bis erste Messung
                  /* Need-Flag (steuert Edge-Fades via CSS) */
                  try {
                    const need = ((layer.scrollWidth||0) > (layer.clientWidth||0)) ? '1' : '0';
                    layer.dataset.gdtNeed = need;
                  } catch(_){}



                  const track = document.createElement('div');
                  track.className = 'gdt-hscroll-track';
                  track.style.height = '1px';
                  track.style.margin = '0 -15px';
                  layer.appendChild(track);


                  host.insertBefore(layer, pag || host.querySelector('.dataTables_paginate') || host.lastChild);
                  // Container darf nie horizontal scrollen (Owner ist der DT-Body)
                  try { if (sect) { sect.style.overflowX = 'hidden'; sect.style.overflowY = 'hidden'; } } catch(_) {}

                  // Container darf NIE horizontal scrollen → Owner ist der DT-Body/Wrapper
                  try { if (sect) { sect.style.overflowX = 'hidden'; sect.style.overflowY = 'hidden'; } } catch(_){}

                  // Scrollen synchronisieren (Layer ↔︎ DataTables-Body/Wrapper) + Sichtbarkeit steuern
                  const syncWidths = () => {
                    try {
                      // Breite aus dem Header-Table bevorzugen (verhindert Versatz der Resize-Handles)
                      const headTable = (wrap && wrap.querySelector('.dataTables_scrollHeadInner table')) || null;
                      const fullW = Math.max(headTable?.scrollWidth || 0, scRef?.scrollWidth || 0, tableEl.scrollWidth || 0);
                      // sichtbare Breite ausschließlich am ScrollBody messen
                      const visibleW = (scRef?.clientWidth || 0);

                      // Trackbreite nachziehen
                      if (track.style.width !== (fullW + 'px')) track.style.width = fullW + 'px';

                      // Hysterese + Zustands-Merkung gegen Flackern (robust gegen Off-by-1 / subpixel)
                      const fullR = Math.round(fullW);
                      const visR  = Math.round(visibleW);
                      const need  = fullR > (visR + 1);
                      const prev  = layer.dataset.gdtNeed === '1';
                      if (need !== prev) layer.dataset.gdtNeed = need ? '1' : '0';


                      // Spacer direkt vor der Pagination reservieren/entfernen (inkl. Cleanup)
                      const pag  = host && host.querySelector('.section-pagination-overview');
                      let spacers = Array.from(host.querySelectorAll('.gdt-scroll-spacer'));
                      if (spacers.length === 0) {
                        const s = document.createElement('div');
                        s.className = 'gdt-scroll-spacer';
                        if (pag && pag.parentElement) pag.parentElement.insertBefore(s, pag);
                        else host.insertBefore(s, layer);
                        spacers = [s];
                      }
                      spacers.forEach((sp, i) => {
                        if (need && i === 0) {
                          sp.style.height  = layer.clientHeight + 'px';
                          sp.style.display = 'block';
                        } else {
                          sp.style.display = 'none';
                          sp.style.height  = '0px';
                        }
                      });

                      // Layer anzeigen/verbergen + internen Body-Scroll nur dann verstecken, wenn Layer sichtbar ist
                      layer.style.display = need ? 'block' : 'none';
                      if (scRef) scRef.style.overflowX = need ? 'hidden' : 'auto';
                      try { applyContainerPaddingForScrollbar(); } catch(_) {}

                      // Scrollposition beim Umschalten synchron halten (kein „erst nach Klick“)
                      if (need && scRef) {
                        if (Math.abs(layer.scrollLeft - scRef.scrollLeft) > 1) layer.scrollLeft = scRef.scrollLeft;
                      } else {
                        if (layer.scrollLeft !== 0) layer.scrollLeft = 0;
                      }

                    } catch(_) {}
                  };



                  const syncToTable = () => {
                    try { if (scRef && Math.abs((scRef.scrollLeft||0) - layer.scrollLeft) > 1) scRef.scrollLeft = layer.scrollLeft; } catch(_) {}
                  };
                  const syncFromTable = () => {
                    try { if (Math.abs(layer.scrollLeft - (scRef?.scrollLeft||0)) > 1) layer.scrollLeft = (scRef?.scrollLeft||0); } catch(_) {}
                  };

                  /* H-Scroll Sync + Event-Emitter */
                  let __gdtEmitHScheduled = false;
                  const __gdtEmitHScroll = () => {
                    if (__gdtEmitHScheduled) return;
                    __gdtEmitHScheduled = true;
                    requestAnimationFrame(() => {
                      __gdtEmitHScheduled = false;
                      try {
                        const max  = Math.max(0, (layer.scrollWidth||0) - (layer.clientWidth||0));
                        const left = (layer.scrollLeft||0);
                        const need = (layer.dataset.gdtNeed==='1');

                        // Event am Layer (lokal)
                        try {
                          layer.dispatchEvent(new CustomEvent('GDT:HScrollChange', {
                            detail:{ scrollLeft:left, maxScrollLeft:max, need },
                            bubbles:true
                          }));
                        } catch(_) {}

                        // Event zusätzlich am zugehörigen TABLE (für Integrationen/Telemetry)
                        try {
                          const tableEl = (wrap && wrap.querySelector('table')) || null;
                          if (tableEl) {
                            tableEl.dispatchEvent(new CustomEvent('GDT:HScrollChange', {
                              detail:{ left, maxScrollLeft:max, need },
                              bubbles:true
                            }));
                          }
                        } catch(_) {}
                      } catch(_) {}
                    });
                  };



                  try { layer.addEventListener('scroll', (e) => {
                    try { syncToTable(e); } catch(_) {}
                    try { layer.dataset.gdtNeed = ((layer.scrollWidth||0) > (layer.clientWidth||0)) ? '1' : '0'; } catch(_){}
                      __gdtEmitHScroll();
                  }, { passive:true }); } catch(_){}
                  try { scRef && scRef.addEventListener('scroll', (e) => { try { syncFromTable(e); } catch(_) {} __gdtEmitHScroll(); }, { passive:true }); } catch(_){}


                  // Interner H-Scroll nur ausblenden, wenn der Layer sichtbar ist
                  try {
                    if (scRef) {
                      const vis = (getComputedStyle(layer).display !== 'none');
                      scRef.style.overflowX = vis ? 'hidden' : 'auto';
                    }
                  } catch(_){}
                  // Breiten nach Draw/Resize nachziehen
                  try {
                  $(dt.table().node())
                    .off('init.dt.gdt_hlayer draw.dt.gdt_hlayer order.dt.gdt_hlayer page.dt.gdt_hlayer responsive-resize.dt.gdt_hlayer column-sizing.dt.gdt_hlayer column-reorder.dt.gdt_hlayer')
                    .on('init.dt.gdt_hlayer draw.dt.gdt_hlayer order.dt.gdt_hlayer page.dt.gdt_hlayer responsive-resize.dt.gdt_hlayer column-sizing.dt.gdt_hlayer column-reorder.dt.gdt_hlayer', () => {
                      requestAnimationFrame(syncWidths);
                      setTimeout(syncWidths, 0);
                      setTimeout(syncWidths, 200);
                      setTimeout(syncWidths, 600);
                      setTimeout(syncWidths, 1000);
                      setTimeout(syncWidths, 1600);
                      syncFromTable();
                    });
                  window.addEventListener('resize', () => { syncWidths(); }, { passive:true });
                  requestAnimationFrame(syncWidths);
                  setTimeout(syncWidths, 0);
                  setTimeout(syncWidths, 200);
                  setTimeout(syncWidths, 600);


                    // === GDT H-Scroll: Erstmessung + Event-Wiring (stabil, idempotent) ===
                    (() => {
                      let scheduled = false;
                      const schedule = () => {
                        if (scheduled) return;
                        scheduled = true;
                        requestAnimationFrame(() => {
                          scheduled = false;
                          // Doppel-RAF + kurzer Timeout fängt späte DT-Reflows ab
                          requestAnimationFrame(syncWidths);
                          setTimeout(syncWidths, 0);
                          requestAnimationFrame(syncWidths);
                          setTimeout(syncWidths, 60);
                          setTimeout(syncWidths, 120);
                        });
                      };

                      // Window-Resize
                      window.addEventListener('resize', schedule, { passive: true });

                      // Nach Spalten-Resize (Loslassen) SOFORT neu messen – eliminiert „erst nach Klick“
                      try {
                        document.addEventListener('pointerup', schedule, { passive:true });
                        document.addEventListener('mouseup',    schedule, { passive:true });
                      } catch(_) {}


                      // Lokale Größenänderungen sicher erkennen (Body + Header/ScrollHeadInner)
                      try {
                        const roBody  = scRef || (wrap && wrap.querySelector('.dataTables_scrollBody'));
                        const roHeadI = wrap && wrap.querySelector('.dataTables_scrollHeadInner');
                        const roHeadT = wrap && wrap.querySelector('.dataTables_scrollHeadInner table');
                        if (typeof ResizeObserver !== 'undefined' && (roBody || roHeadI || roHeadT)) {
                          if (!window.__gdt_fix_ro__) {
                            window.__gdt_fix_ro__ = new ResizeObserver(() => schedule());
                          }
                          if (roBody)  window.__gdt_fix_ro__.observe(roBody);
                          if (roHeadI) window.__gdt_fix_ro__.observe(roHeadI);
                          if (roHeadT) window.__gdt_fix_ro__.observe(roHeadT);
                        }
                      } catch(_) {}

                      // MutationObserver: reagiert auf style-/colgroup-/thead-Änderungen noch vor Draw
                      try {
                        const moCtor = window.MutationObserver || window.WebKitMutationObserver;
                        if (moCtor) {
                          const __gdt_mo__ = new moCtor(() => { 
                            schedule();
                            setTimeout(schedule, 0);
                            setTimeout(schedule, 200);
                          });
                          if (roHeadI) __gdt_mo__.observe(roHeadI, { attributes:true, childList:true, subtree:true });
                          if (roHeadT) __gdt_mo__.observe(roHeadT, { attributes:true, childList:true, subtree:true });
                          const bodyTable = (scRef && scRef.querySelector && scRef.querySelector('table')) || null;
                          if (bodyTable) __gdt_mo__.observe(bodyTable, { attributes:true, childList:true, subtree:true });
                          window.__gdt_fix_mo__ = __gdt_mo__;
                        }
                      } catch(_) {}


                      // DataTables-Events (breiter gefasst, damit kein Header-Klick nötig ist)
                      try {
                        if (window.jQuery && wrap) {
                          const $wrap = jQuery(wrap).closest('.dataTables_wrapper').length
                            ? jQuery(wrap).closest('.dataTables_wrapper')
                            : jQuery(wrap);
                          $wrap.off('init.dt.__gdtfix xhr.dt.__gdtfix draw.dt.__gdtfix order.dt.__gdtfix page.dt.__gdtfix length.dt.__gdtfix search.dt.__gdtfix responsive-resize.dt.__gdtfix column-sizing.dt.__gdtfix column-reorder.dt.__gdtfix')
                               .on ('init.dt.__gdtfix xhr.dt.__gdtfix draw.dt.__gdtfix order.dt.__gdtfix page.dt.__gdtfix length.dt.__gdtfix search.dt.__gdtfix responsive-resize.dt.__gdtfix column-sizing.dt.__gdtfix column-reorder.dt.__gdtfix', () => {
                                  schedule();
                                  setTimeout(schedule, 0);
                                  setTimeout(schedule, 200);
                                  setTimeout(schedule, 600);
                               });
                        }
                      } catch(_) {}

                      // Owner-Policy (Container scrollt nie horizontal)
                      try { if (sect) { sect.style.overflowX = 'hidden'; sect.style.overflowY = 'hidden'; } } catch(_){}
                      try { if (scRef) { scRef.style.overflowY = 'hidden'; } } catch(_){}

                      // Erste verlässliche Synchronisation
                      schedule();
                    })();

                    requestAnimationFrame(syncWidths);
                  } catch(_){}
                }
              } catch(_){}

              // initial + bei Layout-Events nachziehen
              applyContainerPaddingForScrollbar();
              try {
                $(dt.table().node())
                  .off('init.dt.gdt_pb draw.dt.gdt_pb order.dt.gdt_pb page.dt.gdt_pb responsive-resize.dt.gdt_pb column-sizing.dt.gdt_pb column-reorder.dt.gdt_pb')
                  .on('init.dt.gdt_pb draw.dt.gdt_pb order.dt.gdt_pb page.dt.gdt_pb responsive-resize.dt.gdt_pb column-sizing.dt.gdt_pb column-reorder.dt.gdt_pb', () => { requestAnimationFrame(applyContainerPaddingForScrollbar); setTimeout(applyContainerPaddingForScrollbar, 0); });
              } catch(_) {}
            }
          } catch(_){}

          // Container darf KEINEN vertikalen Scroll anzeigen; horizontales Scrollen bleibt über DT erhalten
          try {
            const sect = tableEl.closest('.section-scrollable-overview');
            if (sect) { sect.style.overflowY = 'hidden'; sect.style.overscrollBehaviorY = 'contain'; }
          } catch(_){}


          // Auto-H-Scroll: internen DT-Body nur dann verstecken, wenn der externe Layer SICHTBAR ist
          const ensureXScroll = () => {
            try {
              const ref = (wrap && wrap.querySelector('.dataTables_scrollBody')) || wrap || tableEl.parentElement;
              if (!ref) return;
              const host  = (tableEl.closest('.section-scrollable-overview') || {}).parentElement || null;
              const layer = host && host.querySelector('.section-hscroll-layer');
              const layerVisible = !!(layer && getComputedStyle(layer).display !== 'none');

              if (layerVisible) { try { ref.style.overflowX = 'hidden'; } catch(_) {} return; }

              // gleiche Hysterese wie in syncWidths()
              const need = tableEl.scrollWidth > (ref.clientWidth + 2);
              const prev = ref.dataset.gdtXNeed === '1';
              if (need !== prev) ref.dataset.gdtXNeed = need ? '1' : '0';

              if (need) {
                try { ref.style.overflowX = 'auto'; } catch(_) {}
                try { ref.style.webkitOverflowScrolling = 'touch'; } catch(_) {}
              } else {
                try { ref.style.overflowX = 'hidden'; } catch(_) {}
              }
            } catch(_) {}
          };

          // initial prüfen …
          ensureXScroll();
          // … und bei Layoutänderungen erneut (Resizing/Reorder/Draw)
          try {
            $(dt.table().node())
              .off('column-sizing.dt.gdt_xscroll column-reorder.dt.gdt_xscroll draw.dt.gdt_xscroll')
              .on('column-sizing.dt.gdt_xscroll column-reorder.dt.gdt_xscroll draw.dt.gdt_xscroll', () => ensureXScroll());
          } catch(_){}


          // Wenn die DataTable vertikal scrollt, darf der äußere Container NICHT mitscrollen
          try {
            const scBody = (wrap && wrap.querySelector('.dataTables_scrollBody')) || null;
            if (scBody && scBody.scrollHeight > scBody.clientHeight) {
              const sect = tableEl.closest('.section-scrollable-overview');
              if (sect) sect.style.overflowY = 'hidden';
            }
          } catch(_){}
          const scBodyEl = (wrap && wrap.querySelector('.dataTables_scrollBody')) || null;
          const scrollContainer = scBodyEl || wrap;

// Normalisieren: Links & Badges (idempotent)
          const normalizeLinks = () => {
            try {
              $tbody.find('a[data-link]').each(function(){
                const a = this;
                try { a.style.fontWeight = '600'; } catch(_) {}
                try { a.style.color = 'black'; } catch(_) {}

                // bereits ein Icon-Span vorhanden?
                const hasIcon = !!a.querySelector('span > i.bi.bi-box-arrow-up-right');
                if (!hasIcon) {
                  const sp = document.createElement('span');
                  const i  = document.createElement('i');
                  i.className = 'bi bi-box-arrow-up-right';
                  try { sp.style.display = 'inline-block'; } catch(_){}
                  try { sp.style.marginLeft = '6px'; } catch(_){}
                  sp.appendChild(i);
                  a.appendChild(sp);
                }
              });
            } catch(_){}

            // DataLink-Endpoint: TH -> TD je Spalte
            try {
              const thead = tableEl.tHead;
              if (!thead) return;
              const ths = Array.from(thead.querySelectorAll('tr:first-child th'));
              if (!ths.length) return;

              // Schlüssel für Spalten bestimmen (data-col|data-name|Titel)
              const colKeys = ths.map(th =>
                (th.getAttribute && (th.getAttribute('data-col') || th.getAttribute('data-name'))) ||
                (th.textContent || '').trim()
              );

              // Endpoint-Call (POST JSON)
              const callEndpoint = async (url, payload) => {
                try {
                  const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload || {})
                  });
                  if (!res.ok) return null;
                  const data = await res.json();
                  if (!data || data.ok !== true) return null;
                  return data; // {ok:true, mode:'tab'|'route'|'subview', href:'...', view?, label?}
                } catch(_){ return null; }
              };

              const getCellLabel = (td) => {
                const a = td.querySelector('a');
                return a ? (a.textContent||'').trim() : (td.textContent||'').trim();
              };

              const buildRowObj = (tr) => {
                const obj = {};
                const tds = Array.from(tr.children);
                for (let i=0; i<tds.length; i++){
                  const key = colKeys[i] || String(i);
                  obj[key] = (tds[i].textContent || '').trim();
                }
                return obj;
              };

              ths.forEach((th, colIdx) => {
                const ep = th.getAttribute && (th.getAttribute('data-datalink-endpoint') || th.getAttribute('data-link-endpoint'));
                if (!ep) return;

                $tbody.find('tr').each(async function(){
                  const tr = this;
                  const td = tr.children[colIdx];
                  if (!td) return;
                  if (td.dataset.gdtLinked === '1') return;

                  const row = buildRowObj(tr);
                  const payload = { column: colKeys[colIdx] || null, row };

                  const info = await callEndpoint(ep, payload);
                  if (!info || !info.href || !info.mode) { td.dataset.gdtLinked = '1'; return; }

                  const label = info.label || getCellLabel(td);
                  td.textContent = '';

                  if (info.mode === 'subview') {
                    const btn = document.createElement('a');
                    btn.href = '#';
                    btn.setAttribute('data-link', 'subview');
                    btn.textContent = label || info.href;
                    btn.addEventListener('click', (e) => {
                      e.preventDefault();
                      try {
                        tableEl.dispatchEvent(new CustomEvent('GDT:OpenSubview', {
                          detail: {
                            column: colKeys[colIdx] || null,
                            view: (info.view || th.getAttribute('data-view') || 'right'),
                            href: info.href,
                            row
                          },
                          bubbles: true
                        }));
                      } catch(_){}
                    }, { passive:false });
                    td.appendChild(btn);
                  } else {
                    const a = document.createElement('a');
                    a.setAttribute('data-link', '1');
                    a.href = info.href;
                    a.textContent = label || info.href;
                    if (info.mode === 'tab') a.target = '_blank';
                    td.appendChild(a);
                  }

                  // Optik angleichen (Icon etc.)
                  try {
                    const a = td.querySelector('a[data-link]');
                    if (a) {
                      a.style.fontWeight = '600';
                      a.style.color = 'black';
                      if (!a.querySelector('span > i.bi.bi-box-arrow-up-right')) {
                        const sp = document.createElement('span');
                        const i  = document.createElement('i');
                        i.className = 'bi bi-box-arrow-up-right';
                        sp.style.display = 'inline-block';
                        sp.style.marginLeft = '6px';
                        sp.appendChild(i);
                        a.appendChild(sp);
                      }
                    }
                  } catch(_){}

                  td.dataset.gdtLinked = '1';
                });
              });
            } catch(_){}
          };

          // Badges: aus Datenwert + optionaler Map (am TH) erzeugen
          const normalizeBadges = () => {
            try {
              // pro Spalte ggf. Mapping aus dem zugehörigen TH lesen
              const ths = tableEl.querySelectorAll('thead th');
              const badgeMaps = Array.from(ths).map(th => {
                const raw = th.getAttribute && th.getAttribute('data-gdt-badge-map');
                if (!raw) return null;
                try { return JSON.parse(raw); } catch { return null; }
              });

              $tbody.find('tr').each(function(){
                const tds = this.children;
                for (let ci=0; ci<tds.length; ci++){
                  const td = tds[ci];
                  if (!td) continue;

                  // bereits als Badge gerendert?
                  if (td.firstElementChild && td.firstElementChild.classList && td.firstElementChild.classList.contains('gdt-badge')) continue;

                  const text = (td.textContent || '').trim();
                  if (!text) continue;

                  // nur umwandeln, wenn die Spalte als Badge vorgesehen ist ODER das TD ein data-badge trägt
                  const wantsBadge = td.hasAttribute('data-badge') || (!!badgeMaps[ci]);
                  if (!wantsBadge) continue;

                  const map = badgeMaps[ci] || {};
                  // Variante aus Map, sonst heuristisch
                  const variant = map[text] || (/\b(err|krit|fail|neg)/i.test(text) ? 'danger'
                                   : /\b(warn|pend|offen|todo)/i.test(text) ? 'warning'
                                   : /\b(ok|done|gruen|gewonnen|success)/i.test(text) ? 'success'
                                   : 'info');

                  // Badge-Span bauen
                  const span = document.createElement('span');
                  span.className = 'gdt-badge gdt-badge--' + variant;
                  span.textContent = text;

                  // gesamten TD-Inhalt ersetzen
                  td.textContent = '';
                  td.appendChild(span);
                }
              });
            } catch(_){}
          };

          // Icons & Flags: aus TH-Definition (data-gdt-icon / data-gdt-icon-map / data-gdt-flag) rendern
          const normalizeIcons = () => {
            try {
              const ths = tableEl.querySelectorAll('thead th');
              const iconMaps = Array.from(ths).map(th => {
                const raw = th.getAttribute && th.getAttribute('data-gdt-icon-map');
                if (!raw) return null;
                try { return JSON.parse(raw); } catch { return null; }
              });
              const flags = Array.from(ths).map(th => (th.getAttribute && th.getAttribute('data-gdt-flag')) || '');
              const defaults = Array.from(ths).map(th => (th.getAttribute && th.getAttribute('data-gdt-icon')) || '');

              const makeFlag = (cc) => {
                if (!cc || cc.length !== 2) return '';
                const code = cc.toUpperCase();
                const A = 0x1F1E6; // 'A'
                const base = 'A'.charCodeAt(0);
                return String.fromCodePoint(A + (code.charCodeAt(0) - base), A + (code.charCodeAt(1) - base));
              };

              $tbody.find('tr').each(function(){
                const tds = this.children;
                for (let ci=0; ci<tds.length; ci++){
                  const td = tds[ci];
                  if (!td) continue;

                  // schon als Icon gerendert?
                  if (td.firstElementChild && td.firstElementChild.classList && td.firstElementChild.classList.contains('gdt-iconwrap')) continue;

                  const text = (td.textContent || '').trim();
                  const map = iconMaps[ci] || null;
                  const defIcon = defaults[ci] || '';
                  const wantsFlag = (flags[ci] && flags[ci].toLowerCase() === 'iso');

                  let iconHTML = '';
                  if (wantsFlag && /^[a-z]{2}$/i.test(text)) {
                    const emoji = makeFlag(text);
                    if (emoji) iconHTML = `<span class="gdt-flag" aria-hidden="true">${emoji}</span>`;
                  } else if (map && Object.prototype.hasOwnProperty.call(map, text)) {
                    const val = map[text];
                    if (typeof val === 'string' && val.startsWith('emoji:')) {
                      iconHTML = `<span class="gdt-emoji" aria-hidden="true">${val.slice(6)}</span>`;
                    } else if (typeof val === 'string') {
                      iconHTML = `<i class="${val}" aria-hidden="true"></i>`;
                    } else if (val && typeof val === 'object' && val.class) {
                      iconHTML = `<i class="${val.class}" aria-hidden="true"></i>`;
                    }
                  } else if (defIcon) {
                    iconHTML = `<i class="${defIcon}" aria-hidden="true"></i>`;
                  } else {
                    continue; // keine Icon-Spezifikation für diese Spalte
                  }

                  const wrap = document.createElement('span');
                  wrap.className = 'gdt-iconwrap';
                  wrap.innerHTML = iconHTML + (text ? `<span class="gdt-icontext">${text}</span>` : '');
                  td.textContent = '';
                  td.appendChild(wrap);
                }
              });
            } catch(_){}
          };

          // Kombinierter Normalizer
          const normalizeAll = () => { normalizeLinks(); normalizeBadges(); normalizeIcons(); };

          // initial auf aktueller Seite anwenden
          normalizeAll();
          // bei jedem Draw/Search/Order/Page/Length erneut anwenden (neue/andere Rows)
          try {
            $(dt.table().node())
              .off('draw.dt.gdt_links search.dt.gdt_links order.dt.gdt_links page.dt.gdt_links length.dt.gdt_links')
              .on('draw.dt.gdt_links search.dt.gdt_links order.dt.gdt_links page.dt.gdt_links length.dt.gdt_links', () => normalizeAll());
          } catch(_){}


          const place = (td) => {
            try {
              if (!td) return;
              const tr = td.parentElement;
              const scBody = (wrap && wrap.querySelector('.dataTables_scrollBody')) || null;
              const tblRect = (scBody ? scBody.getBoundingClientRect() : tableEl.getBoundingClientRect());
              const tdRect  = td.getBoundingClientRect();
              const nextTd  = td.nextElementSibling;
              const nextTr  = tr.nextElementSibling;
              const rightEdge = nextTd ? nextTd.getBoundingClientRect().left : tblRect.right;
              const bottomEdge = nextTr ? nextTr.getBoundingClientRect().top : tblRect.bottom;

              const left   = tdRect.left - tblRect.left;
              const top    = tdRect.top  - tblRect.top;
              const width  = Math.max(0, rightEdge - tdRect.left);
              const height = Math.max(0, bottomEdge - tdRect.top);

              // Rahmen immer zeigen
              hover.style.left = left + 'px';
              hover.style.top = top + 'px';
              hover.style.width = width + 'px';
              hover.style.height = height + 'px';
              hover.style.display = 'block';

              // Card nur bei Trunkierung
              const contentEl = td.firstElementChild || td;
              const isTruncated = (contentEl.scrollWidth > contentEl.clientWidth);
              if (!isTruncated) { try { card.style.display = 'none'; } catch(_) {} return; }

              const fullText = (td.textContent || '').trim();
              if (!fullText) { try { card.style.display = 'none'; } catch(_) {} return; }
              try { card.setAttribute('aria-label', fullText); } catch(_){}
              card.textContent = fullText;

              let cardW = width;
              card.style.display = 'block';
              card.style.left = '-99999px';
              card.style.top = '-99999px';
              card.style.width = 'auto';
              const desired = card.getBoundingClientRect().width + 24; // Padding
              // harte Klammer: Karte bleibt innerhalb des sichtbaren Bereichs
              try { card.style.maxWidth = (tblRect.right - tblRect.left) + 'px'; } catch(_){}
              // wenn mehr Platz rechts vorhanden → auf volle Breite spannen, sonst nach links ausrichten
              const spaceRight = tblRect.right - tdRect.left;
              if (desired <= spaceRight) {
                cardW = Math.max(width, Math.min(desired, spaceRight));
                card.style.left = (tdRect.left - tblRect.left) + 'px';
              } else {
                cardW = Math.min(desired, tblRect.right - tblRect.left);
                const leftShift = Math.max(0, (tdRect.right - tblRect.left) - cardW);
                card.style.left = leftShift + 'px';
              }
              const cardTop = bottomEdge - tblRect.top + 2;
              card.style.top = cardTop + 'px';
              try { card.style.maxWidth = (tblRect.right - tblRect.left) + 'px'; } catch(_) {}
              card.style.width = cardW + 'px';
              card.style.display = 'block';
            } catch(_) {}
          };

          const clear = () => {
            try { hover.style.display = 'none'; } catch(_) {}
            try { card.style.display = 'none'; } catch(_) {}
          };

          // Delegation: bei jedem Draw neu binden
          $tbody.off('mouseenter.gdtHover mousemove.gdtHover mouseleave.gdtHover', 'td')
                .on('mouseenter.gdtHover', 'td', function(){ place(this); })
                .on('mousemove.gdtHover',  'td', function(){ place(this); })
                .on('mouseleave.gdtHover', 'td', function(){ clear(); });

          // zusätzliche Guards: Scroll/Resize/Scroll-Wrapper verbergen Overlays
          try {
            wrap.removeEventListener('scroll', clear);
            wrap.addEventListener('scroll', () => { try { clear(); } catch(_) {} }, { passive:true });
          } catch(_){}
          try {
            window.removeEventListener('scroll', clear, true);
            window.addEventListener('scroll', () => { try { clear(); } catch(_) {} }, { capture:true, passive:true });
          } catch(_){}
          try {
            window.removeEventListener('resize', clear);
            window.addEventListener('resize', () => { try { clear(); } catch(_) {} }, { passive:true });
          } catch(_){}

          // Scroll im Scroll-Body/Wrapper blendet Overlays aus (Ghosting verhindern)
          if (scBodyEl && !scBodyEl.dataset.gdtHoverScroll) {
            scBodyEl.addEventListener('scroll', () => { try { clear(); } catch(_) {} }, { passive:true });
            scBodyEl.dataset.gdtHoverScroll = '1';
          }
          try {
            wrap.removeEventListener('scroll', clear);
            wrap.addEventListener('scroll', () => { try { clear(); } catch(_) {} }, { passive:true });
          } catch(_){}
          try {
            window.removeEventListener('scroll', clear, true);
            window.addEventListener('scroll', () => { try { clear(); } catch(_) {} }, { capture:true, passive:true });
          } catch(_){}

          // Wenn der Mauszeiger den Wrapper verlässt → Overlay ausblenden
          try {
            wrap.removeEventListener('mouseleave', clear);
            wrap.addEventListener('mouseleave', () => { try { clear(); } catch(_) {} }, { passive:true });
          } catch(_){}

          // Scroll im Scroll-Body blendet Overlays aus (Ghosting verhindern)
          if (scBodyEl && !scBodyEl.dataset.gdtHoverScroll) {
            scBodyEl.addEventListener('scroll', () => { try { clear(); } catch(_) {} }, { passive:true });
            scBodyEl.dataset.gdtHoverScroll = '1';
          }
          // zusätzlicher Schutz: Wrapper- und Fenster-Scroll verbergen Overlay ebenfalls
          try {
            wrap.removeEventListener('scroll', clear);
            wrap.addEventListener('scroll', () => { try { clear(); } catch(_) {} }, { passive:true });
          } catch(_){}
          try {
            window.removeEventListener('scroll', clear, true);
            window.addEventListener('scroll', () => { try { clear(); } catch(_) {} }, { capture:true, passive:true });
          } catch(_){}


          // sofort nach Draw einmalig setzen, damit Overlay korrekt über Wrapper liegt
          setTimeout(() => { try { clear(); } catch(_) {} }, 0);

          // Auto-PageLength: sichtbare Höhe → optimale Zeilenzahl
          try {
            let _ap = null;
            const autoRows = () => {
              try {
                const sect   = tableEl.closest('.section-scrollable-overview') || wrap || document.body;
                const thead  = tableEl.tHead;
                const pager  = (wrap && wrap.querySelector('.dataTables_paginate')) || null;
                const first  = (tableEl.tBodies && tableEl.tBodies[0] && tableEl.tBodies[0].rows && tableEl.tBodies[0].rows[0]) ? tableEl.tBodies[0].rows[0] : null;

                const sectH  = sect ? sect.clientHeight : 0;
                const headH  = thead ? thead.getBoundingClientRect().height : 0;
                const pagerH = pager ? pager.getBoundingClientRect().height : 0;
                const rowH   = first ? Math.max(1, first.getBoundingClientRect().height) : 36;
                const gaps   = 24; // Sicherheitsabzug (Padding/Margins)

                // Dynamischer Scroll-Delta: reale Höhe des horizontalen Scrollbalkens ermitteln
                let SCROLL_DELTA = 15;
                try {
                  const probe = document.createElement('div');
                  probe.style.cssText = 'position:absolute;visibility:hidden;overflow:scroll;width:100px;height:100px;';
                  document.body.appendChild(probe);
                  SCROLL_DELTA = Math.max(15, probe.offsetHeight - probe.clientHeight);
                  document.body.removeChild(probe);
                } catch(_) {}

                const avail  = Math.max(0, sectH - headH - pagerH - gaps - SCROLL_DELTA);
                let rows   = Math.max(5, Math.floor(avail / rowH));
                try {
                  const sect = tableEl.closest('.section-scrollable-overview') || wrap || document.body;
                  const visibleW = sect ? sect.clientWidth : (wrap ? wrap.clientWidth : tableEl.parentElement?.clientWidth || 0);
                  const needHScroll = tableEl.scrollWidth > (visibleW + 1);
                  if (needHScroll && rows > 5) rows = rows - 1;
                } catch(_) {}


                // Spacer oberhalb des Pagers nur anzeigen, wenn wirklich H-Scroll benötigt wird
                try {
                  const visibleW = ( (tableEl.closest('.section-scrollable-overview') || wrap || document.body).clientWidth ) || 0;
                  const needH = tableEl.scrollWidth > (visibleW + 1);
                  const need = needH ? Math.max(0, rowH - SCROLL_DELTA) : 0;
                  let spacer = (wrap && wrap.querySelector('.gdt-scroll-spacer')) || null;
                  if (!spacer) {
                    spacer = document.createElement('div');
                    spacer.className = 'gdt-scroll-spacer';
                    if (pager && pager.parentElement) pager.parentElement.insertBefore(spacer, pager);
                    else if (wrap) wrap.appendChild(spacer);
                  }
                  spacer.style.height = need ? (need + 'px') : '0px';
                  spacer.style.display = need ? 'block' : 'none';
                } catch(_){}


                if (Number.isFinite(rows) && rows > 0) {
                  const cur = dt.page.len();
                  if (cur !== rows) { dt.page.len(rows).draw(false); }
                }
              } catch(_) {}
            };

            // initial + bei Redraw neu berechnen
            setTimeout(() => autoRows(), 0);
            try {
              $(dt.table().node())
                .off('draw.dt.gdt_autoRows column-sizing.dt.gdt_autoRows column-reorder.dt.gdt_autoRows')
                .on('draw.dt.gdt_autoRows column-sizing.dt.gdt_autoRows column-reorder.dt.gdt_autoRows', () => {
                  clearTimeout(_ap); _ap = setTimeout(autoRows, 50);
                });
            } catch(_){}

            // bei Fenster-Resize ebenfalls nachziehen
            window.removeEventListener('resize', window.__gdtAutoRowsRz, {capture:false});
            window.__gdtAutoRowsRz = () => { clearTimeout(_ap); _ap = setTimeout(autoRows, 120); };
            window.addEventListener('resize', window.__gdtAutoRowsRz, {passive:true});
          } catch(_){}

          // zusätzlich bei DataTables-Events (draw/search/order/page/length) Overlays ausblenden
          try {
            $(dt.table().node())
              .off('draw.dt.gdt_hover search.dt.gdt_hover order.dt.gdt_hover page.dt.gdt_hover length.dt.gdt_hover')
              .on('draw.dt.gdt_hover search.dt.gdt_hover order.dt.gdt_hover page.dt.gdt_hover length.dt.gdt_hover', () => { try { clear(); } catch(_) {} });
          } catch(_){}
          // zusätzlich bei DataTables-Events (draw/search/order/page/length) Overlays ausblenden
          try {
            $(dt.table().node())
              .off('draw.dt.gdt_hover search.dt.gdt_hover order.dt.gdt_hover page.dt.gdt_hover length.dt.gdt_hover')
              .on('draw.dt.gdt_hover search.dt.gdt_hover order.dt.gdt_hover page.dt.gdt_hover length.dt.gdt_hover', () => { try { clear(); } catch(_) {} });
          } catch(_){}
        }
      } catch(_) {}



      // Klicks in der Filter-Zeile dürfen weder sortieren noch reordern
      const $thead = $(dt.table().header());
      const _F = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.filters) || {};
      if (_F.stopSortOnButtons !== false) {
      $thead.off('click.gdt_hdr_block', 'tr.gdt-filter-row th')
            .on('click.gdt_hdr_block', 'tr.gdt-filter-row th', (ev) => {
              ev.stopPropagation();
              ev.preventDefault();
            })
            .off('mousedown.gdt_hdr_inline click.gdt_hdr_inline', '.gdt-hfilter, [data-gdt-filterbtn]')
            .on('mousedown.gdt_hdr_inline click.gdt_hdr_inline', '.gdt-hfilter, [data-gdt-filterbtn]', (ev) => {
              ev.stopPropagation();
            });
      }
    } catch {}



    this.addFilterButtons();

    // ▼▼ Saved Views + Auto-Page-Length (gem. Konzept)
    (function savedViewsAndAutoPageLen(){
      try {
        const dt = this.dtInstance;
        const tableEl = dt.table().node();
        if (!tableEl) return;

        // ----- Saved Views (Filter/Order/Visibility) -----
        (function savedViews(){
          try {
            const F = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.filters) || {};
            if (!F.savedViews) return;
            const wants = tableEl.hasAttribute('data-gdt-views');
            if (!wants) return;

            const keyPrefix = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.state && window.GDT_DEFAULTS.state.keyPrefix) || 'gdt:';

            const tableId = tableEl.id || ('dt-' + Math.random().toString(36).slice(2));
            if (!tableEl.id) tableEl.id = tableId;
            const storeKey = `${keyPrefix}${tableId}:views`;

            let views = {};
            try { views = JSON.parse(localStorage.getItem(storeKey) || '{}') || {}; } catch(_) {}

            // Toolbar vor die Tabelle setzen (einmalig) – nur bei Opt-In
            const $ = window.jQuery || window.$;
            let $bar = $(tableEl).prev('.gdt-viewbar');

            if (!$bar.length) {
              $bar = $('<div class="gdt-viewbar mb-2 d-flex align-items-center"></div>');
              $(tableEl).before($bar);
            } else {
              $bar.empty();
            }


            const $select = $('<select class="form-select form-select-sm me-2" style="width:auto;display:inline-block;"></select>');
            $select.append('<option value="">– Ansicht wählen –</option>');
            Object.keys(views).forEach(k => $select.append($('<option></option>').attr('value', k).text(k)));

            const $btnSave   = $('<button type="button" class="btn btn-outline-secondary btn-sm me-2">Speichern</button>');
            const $btnDelete = $('<button type="button" class="btn btn-outline-danger btn-sm">Löschen</button>');

            $bar.append($select).append($btnSave).append($btnDelete);

            const captureState = () => {
              try {
                const s = dt.state && dt.state() ? dt.state() : {};
                // zusätzlich sichtbare Spalten/Order und Spaltenbreiten aufnehmen
                const vis = [];
                for (let i = 0; i < dt.columns().count(); i++) vis.push(dt.column(i).visible());
                return { state: s, visibility: vis };
              } catch(_) { return {}; }
            };

            const applyView = (v) => {
              try {
                if (!v) return;
                if (v.state) dt.state.clear(); // wir setzen gleich gezielt
                // Sortierung
                if (v.state && v.state.order) dt.order(v.state.order);
                // Globale Suche
                if (v.state && typeof v.state.search === 'object') dt.search(v.state.search.search || '');
                // Spalten-Suche
                if (v.state && Array.isArray(v.state.columns)) {
                  v.state.columns.forEach((c,i) => { if (c && c.search) dt.column(i).search(c.search.search || ''); });
                }
                // Sichtbarkeit
                if (Array.isArray(v.visibility)) v.visibility.forEach((vis,i)=>dt.column(i).visible(!!vis));
                dt.draw(false);
              } catch(_) {}
            };

            $select.on('change', function(){
              const name = String($(this).val() || '');
              applyView(views[name]);
            });

            $btnSave.on('click', function(){
              const name = prompt('Ansicht speichern unter Name:');
              if (!name) return;
              views[name] = captureState();
              try { localStorage.setItem(storeKey, JSON.stringify(views)); } catch(_) {}
              try { tableEl.dispatchEvent(new CustomEvent('GDT:StateSaved', { detail:{ key: storeKey, action:'save', name }, bubbles:true })); } catch(_){}
              // Dropdown neu füllen
              $select.find('option[value="'+name+'"]').remove();
              $select.append($('<option></option>').attr('value', name).text(name));
              $select.val(name);
            });

            $btnDelete.on('click', function(){
              const name = String($select.val() || '');
              if (!name || !views[name]) return;
              if (!confirm('Ansicht „'+name+'“ löschen?')) return;
              delete views[name];
              try { localStorage.setItem(storeKey, JSON.stringify(views)); } catch(_) {}
              try { tableEl.dispatchEvent(new CustomEvent('GDT:StateSaved', { detail:{ key: storeKey, action:'delete', name }, bubbles:true })); } catch(_){}
              $select.find('option[value="'+name+'"]').remove();
              $select.val('');
            });
          } catch(_) {}
        })();

        // ----- Auto-Page-Length aus Wrapper-Höhe -----
        (function autoPageLen(){
          try {
            const perf = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.performance && window.GDT_DEFAULTS.performance.autoPageLength) || { enabled:false };
            if (!perf.enabled) return;

            const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
            const measure = () => {
              try {
                const wrap = (tableEl.closest && tableEl.closest('.section-scrollable-overview')) || tableEl.parentElement || tableEl;
                const thead = dt.table().header();
                const tbody = dt.table().body();
                if (!wrap || !thead || !tbody) return;
                const hWrap = wrap.getBoundingClientRect().height;
                const hHead = thead.getBoundingClientRect().height;
                const first = tbody.querySelector('tr');
                if (!first) return;
                const hRow  = first.getBoundingClientRect().height || 24;

                // reale Höhe des horizontalen Scrollbalkens (min 15px) einmalig messen/cachen
                let sbH = 15;
                try {
                  if (!window.__gdtSBH) {
                    const probe = document.createElement('div');
                    probe.style.cssText = 'position:absolute;visibility:hidden;overflow:scroll;width:100px;height:100px;';
                    document.body.appendChild(probe);
                    window.__gdtSBH = Math.max(15, probe.offsetHeight - probe.clientHeight);
                    document.body.removeChild(probe);
                  }
                  sbH = window.__gdtSBH;
                } catch(_){}

                // verfügbare Höhe: Container minus Header minus Scrollbar
                const avail = Math.max(0, hWrap - hHead - sbH);
                let fit = clamp(Math.floor((hWrap - hHead) / hRow), perf.min||1, perf.max||200);
                try {
                  const sect = tableEl.closest('.section-scrollable-overview') || wrap || document.body;
                  const visibleW = sect ? sect.clientWidth : (wrap ? wrap.clientWidth : tableEl.parentElement?.clientWidth || 0);
                  const needHScroll = tableEl.scrollWidth > (visibleW + 1);
                  if (needHScroll && fit > (perf.min||1)) fit = fit - 1;
                } catch(_) {}
                if (fit > 0 && dt.page.len() !== fit) dt.page.len(fit).draw(false);


                // Spacer direkt über dem Pager, damit Scrollbar bündig vor dem Pager sitzt
                try {
                  const pager  = wrap.querySelector('.dataTables_paginate');
                  let spacer   = wrap.querySelector('.gdt-scroll-spacer');
                  if (!spacer) {
                    spacer = document.createElement('div');
                    spacer.className = 'gdt-scroll-spacer';
                    if (pager && pager.parentElement) pager.parentElement.insertBefore(spacer, pager);
                    else wrap.appendChild(spacer);
                  }
                  const visibleW = ( (tableEl.closest('.section-scrollable-overview') || wrap || document.body).clientWidth ) || 0;
                  const needH    = tableEl.scrollWidth > (visibleW + 1);
                  const need     = needH ? Math.max(0, hRow - sbH) : 0;
                  spacer.style.height = need ? (need + 'px') : '0px';
                  spacer.style.display = need ? 'block' : 'none';
                } catch(_){}

                if (fit > 0 && dt.page.len() !== fit) dt.page.len(fit).draw(false);
              } catch(_) {}
            };

            dt.off('draw.dt.gdt_apl').on('draw.dt.gdt_apl', () => requestAnimationFrame(measure));
            window.addEventListener('resize', () => requestAnimationFrame(measure), { passive:true });
            try { tableEl.addEventListener('GDT:ColumnResized', () => requestAnimationFrame(measure), true); } catch(_){}

            setTimeout(measure, 0);
          } catch(_) {}
        })();

      } catch(_) {}
    }).call(this);


    // External Filter Buttons (KOMPLETT ÜBERNOMMEN)
    {
      const $jq = window.jQuery || window.$;
      const dt = this.dtInstance;
      const node = dt.table().node();
      if (!node.id) node.id = 'dt-' + Math.random().toString(36).slice(2);
      const tableId = node.id;

      const ns = `.udtBtns-${tableId}`;
      this._btnNs = ns;

      const escRe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const toIndex = (btn) => {
        const s = dt.settings()[0]; const cols = s?.aoColumns || [];
        const colAttr = btn.getAttribute('data-dt-col');
        if (colAttr !== null && colAttr !== '') {
          const idx = parseInt(colAttr, 10); if (!Number.isNaN(idx)) return idx;
        }
        const byName = btn.getAttribute('data-dt-col-name');
        if (byName) { for (let i=0;i<cols.length;i++) if (String(cols[i]?.sName) === String(byName)) return i; }
        const byData = btn.getAttribute('data-dt-col-data');
        if (byData) { for (let i=0;i<cols.length;i++) if (cols[i]?.mData === byData) return i; }
        return null;
      };

      $jq(document)
        .off(`click${ns}`, '[data-dt-filter]')
        .on(`click${ns}`, '[data-dt-filter]', (e) => {
          const btn = e.currentTarget;

          const target = btn.getAttribute('data-dt-target');
          if (target && target !== `#${tableId}`) return;

          const idx = toIndex(btn);
          const token = (btn.getAttribute('data-dt-filter') || '').trim().toLowerCase();
          const mode = (btn.getAttribute('data-dt-mode') || '').trim().toLowerCase();
          const caseIns = (btn.getAttribute('data-dt-case') || 'insensitive').toLowerCase() !== 'sensitive';

          const group = btn.getAttribute('data-dt-group');
          if (group) {
            $jq(`[data-dt-filter][data-dt-target="#${tableId}"][data-dt-group="${group}"]`).removeClass('active');
            $jq(btn).addClass('active');
          }

          if (['all','alle','clear','reset','*',''].includes(token)) {
            dt.search('');
            dt.columns().every(function(){ this.search(''); });

            try {
              const $thead = $jq(dt.table().header());
              $thead.find('tr.gdt-filter-row input, tr.gdt-filter-row select').each(function(){ this.value=''; $jq(this).trigger('change'); });
            } catch {}

            try {
              const si = typeof this.searchInput === 'string' ? document.querySelector(this.searchInput) : this.searchInput;
              if (si) { si.value=''; si.dispatchEvent(new Event('input', { bubbles:true })); }
            } catch {}

            dt.draw(false);
            return;
          }

          let expr = '', useRegex = false, smart = false;
          if (mode === 'contains') {
            expr = token; useRegex = false;
          } else if (mode === 'starts') {
            expr = `^${escRe(token)}`; useRegex = true;
          } else if (mode === 'ends') {
            expr = `${escRe(token)}$`; useRegex = true;
          } else if (mode === 'regex') {
            expr = token; useRegex = true;
          } else {
            expr = `^${escRe(token)}$`; useRegex = true;
          }

          if (idx != null) dt.column(idx).search(expr, useRegex, smart, caseIns).draw(false);
          else dt.search(expr, useRegex, smart, caseIns).draw(false);
        });
    }

    // Selection-Events & Header-SelectAll (NEU, gem. Konzept)
    (function wireSelection(){
      try {
        const selCfg = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.selection) || {};
        if (!selCfg.enabled) return;
        const dt = this.dtInstance;
        const tableNode = dt.table().node();
        const tableEl = tableNode && tableNode.nodeType ? tableNode : (typeof tableNode === 'string' ? document.querySelector(tableNode) : tableNode);

        const dispatch = () => {
          const count = dt.rows({ selected: true }).count();
          const all   = count > 0 && count === dt.rows({ search:'applied' }).count();
          if (tableEl) {
            tableEl.dispatchEvent(new CustomEvent('GDT:SelectionChanged', { detail: { dt, count, allSelected: all } }));
          }
        };

        dt.on('select.dt.gdt_sel deselect.dt.gdt_sel', dispatch);

        if (selCfg.headerSelectAll) {
          const header = dt.table().header();
          if (header) {
            const th = header.querySelector('th.select-checkbox');
            if (th && !th._gdtBound) {
              th._gdtBound = true;
              th.title = 'Alle auswählen/abwählen';
              th.addEventListener('click', (e) => {
                e.stopPropagation();
                const allSelected = dt.rows({ selected:true }).count() === dt.rows({ search:'applied' }).count();
                if (allSelected) dt.rows({ search:'applied' }).deselect();
                else dt.rows({ search:'applied' }).select();
              }, true);
            }
          }
        }
      } catch(e) { console.warn('[GDT] selection wiring skipped:', e); }
    }).call(this);

    // ReadyVisible (NEU, gem. Konzept)
    (function readyVisible(){
      try{
        const dt = this.dtInstance;
        const tableEl = dt.table().node();

        const fire = () => {
          try {
            const body = dt.table().body();
            if (!body) return;
            const rows = body.querySelectorAll('tr');
            if (!rows.length) return;
            const last = rows[rows.length - 1];
            const cont = (tableEl.closest && tableEl.closest('.dataTables_scrollBody')) || tableEl.parentElement || tableEl;
            const r = last.getBoundingClientRect();
            const c = cont.getBoundingClientRect();
            const visible = r.bottom <= c.bottom && r.top >= c.top;
            if (visible) {
              tableEl.dispatchEvent(new CustomEvent('GDT:ReadyVisible', { detail:{ dt } }));
            }
          } catch(_) {}
        };

        dt.on('draw.dt.gdt_ready', () => {
          requestAnimationFrame(() => requestAnimationFrame(fire));
        });
      } catch(e) { console.warn('[GDT] readyVisible skipped:', e); }
    }).call(this);

    // Keyboard Navigation (Opt-In via data-gdt-keynav)
    (function keyboardNav(){
      try{
        const dt = this.dtInstance;
        if (!dt) return;
        const table = dt.table();
        const body = table.body();
        const tableEl = table.node();
        if (!body || !tableEl || !tableEl.hasAttribute('data-gdt-keynav')) return;

        body.setAttribute('tabindex','0');

        const FOCUS = 'gdt-focus-cell';
        const getCells = () => {
          const all = Array.from(body.querySelectorAll('tr td'));
          return all.filter(el => el.offsetParent !== null);
        };
        const focusCell = (cell) => {
          if (!cell) return;
          body.querySelectorAll('.'+FOCUS).forEach(n => n.classList.remove(FOCUS));
          cell.classList.add(FOCUS);
          try { cell.scrollIntoView({ block:'nearest', inline:'nearest' }); } catch(_){}
        };

        // initial focus nur bei Opt-In
        requestAnimationFrame(()=>focusCell(getCells()[0]));

        body.addEventListener('keydown', (e) => {
          const cells = getCells(); if (!cells.length) return;
          const cur = body.querySelector('.'+FOCUS) || cells[0];
          const row = cur.parentElement;
          const rows = Array.from(body.querySelectorAll('tr')).filter(r=>r.offsetParent!==null);
          const tds  = Array.from(row.children).filter(n=>n.matches('td') && n.offsetParent!==null);
          let r = rows.indexOf(row);
          let c = tds.indexOf(cur);

          const next = (nr, nc) => {
            nr = Math.max(0, Math.min(rows.length-1, nr));
            const t2 = Array.from(rows[nr].children).filter(n=>n.matches('td') && n.offsetParent!==null);
            nc = Math.max(0, Math.min(t2.length-1, nc));
            focusCell(t2[nc]);
          };

          switch(e.key){
            case 'ArrowRight': e.preventDefault(); next(r, c+1); break;
            case 'ArrowLeft' : e.preventDefault(); next(r, c-1); break;
            case 'ArrowDown' : e.preventDefault(); next(r+1, c); break;
            case 'ArrowUp'   : e.preventDefault(); next(r-1, c); break;
            case 'Home'      : e.preventDefault(); next(r, 0); break;
            case 'End'       : e.preventDefault(); next(r, tds.length-1); break;
            case 'PageDown'  : e.preventDefault(); next(r+10, c); break;
            case 'PageUp'    : e.preventDefault(); next(r-10, c); break;
            case 'Enter': try { cur.dispatchEvent(new CustomEvent('GDT:CellEnter', { bubbles:true })); } catch(_){}
                          break;
            case 'Escape': try { cur.dispatchEvent(new CustomEvent('GDT:CellEscape', { bubbles:true })); } catch(_){}
                          break;
            default: return;
          }
        }, true);
      } catch(e){ console.warn('[GDT] keyboardNav skipped:', e); }
    }).call(this);

    // Density Switch (Opt-In via GDT_DEFAULTS.features.densitySwitch / Event)
    (function densitySwitch(){
      try{
        const dt = this.dtInstance;
        if (!dt) return;
        const tableEl = dt.table().node();
        const wrap = (tableEl.closest && tableEl.closest('.dataTables_wrapper')) || tableEl.parentElement || tableEl;
        if (!wrap) return;

        const ui = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.features && window.GDT_DEFAULTS.features.densitySwitch) || {};
        const apply = (mode) => {
          wrap.classList.toggle('gdt-density--compact', mode === 'compact');
          wrap.classList.toggle('gdt-density--comfortable', mode === 'comfortable');
        };

        if (ui.mode) apply(ui.mode);

        tableEl.addEventListener('GDT:Density', (ev) => {
          const mode = ev && ev.detail && ev.detail.mode;
          if (mode) apply(mode);
        }, true);
      } catch(e){ console.warn('[GDT] densitySwitch skipped:', e); }
    }).call(this);

    // Callback onInit (KOMPLETT ÜBERNOMMEN)

    if (typeof this.onInit === 'function') {
      this.onInit(this.dtInstance);
    }


    // Zeilenauswahl-Callback (KOMPLETT ÜBERNOMMEN)
    if (typeof this.onRowSelect === 'function' && this.select) {
      this.dtInstance.on('select', (e, dt, type, indexes) => {
        if (type === 'row') {
          this.onRowSelect(this.dtInstance.rows(indexes).data().toArray());
        }
      });
    }

    if (typeof this.customGlobalSearch === 'function') {
      this.customGlobalSearch(this.dtInstance);
    }
  }

  // ALLE UTILITY-METHODEN KOMPLETT ÜBERNOMMEN
  resetAllFilters({ clearState = true } = {}) {
    const table = this.dtInstance;
    if (!table) return;

    const tableNode = table.table().node();
    if (!tableNode.id) tableNode.id = 'dt-' + Math.random().toString(36).slice(2);
    const tableId = tableNode.id;

    table.search('');

    table.columns().every(function () {
      this.search('');
    });
    try {
      const $thead = $(table.table().header());
      $thead.find('tr.gdt-filter-row input, tr.gdt-filter-row select').val('').trigger('change');
    } catch(_) {}


    if (this.searchInput) {
      $(this.searchInput).val('');
      $(this.searchInput).trigger('input');
    }

    if (this.externalButtonFilters) {
      $(`[data-dt-filter][data-dt-target="#${tableId}"]`).removeClass('active');
      $.fn.dataTable.ext.search = $.fn.dataTable.ext.search.filter(fn => !fn.__dtKey || !fn.__dtKey.startsWith(`${tableId}:`));
    }

    if (table.searchPanes && typeof table.searchPanes.clearSelections === 'function') {
      try { table.searchPanes.clearSelections(); } catch(e) {}
    }
    if (table.searchBuilder && typeof table.searchBuilder.clearDetails === 'function') {
      try { table.searchBuilder.clearDetails(); } catch(e) {}
    }

    if (this.select && table.rows && typeof table.rows === 'function') {
      try { table.rows().deselect(); } catch(e) {}
    }

    if (this.externalPaging) $(this.externalPaging).find('button').removeClass('active');
    if (this.externalInfo) $(this.externalInfo).text('');

    if (clearState && table.state && table.state.clear) {
      table.state.clear();
    }

    table.draw();
  }

  resetToDefaults() {
    const table = this.dtInstance;
    if (!table) return;

    this.resetAllFilters({ clearState: true });

    if (table.ajax && table.settings()[0].ajax) {
      table.ajax.reload(null, true);
    } else {
      table.draw();
    }
  }

addColumnFilters() {
    const F = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.filters) || null;
    const table = this.dtInstance;
    const tableEl = table ? table.table().node() : null;
    const attrHeader = !!(tableEl && (tableEl.hasAttribute('data-gdt-headerinputs') || tableEl.getAttribute('data-gdt-filters') === 'header'));
    const wantHeader = !!(F && F.enabled !== false && (F.headerInputs || attrHeader));


    // WICHTIG: TH-Attribute SOFORT prüfen, nicht später!
    const $thead = $(table.table().header());
    let hasAttr = $thead.find('tr:first-child th[data-gdt-filter]').length > 0;
    const hasExplicit = Array.isArray(this.filters) && this.filters.some(f => f && (f.type === 'text' || f.type === 'select'));

    console.info('[GDT_DBG] addColumnFilters enter', {
        wantHeader,
        attrHeader,
        hasExplicit,
        hasAttr,
        explicitCount: Array.isArray(this.filters) ? this.filters.length : 0,
        cols: table ? table.columns().count() : null
    });

    // EARLY RETURN → einmalige Spätnachprüfung (Timing/Hidden Tabs)
    if (!wantHeader && !hasExplicit && !hasAttr) {
        try {
            if (!this._gdtHdrRetry) {
                this._gdtHdrRetry = true;
                setTimeout(() => {
                    try { this.addColumnFilters(); } catch(_) {}
                }, 50);
                setTimeout(() => {
                    try { this.addColumnFilters(); } catch(_) {}
                }, 300);
            }
        } catch(_) {}
        console.warn('[GDT] No filter config yet - deferred retry scheduled');
        return;
    }



    // --- Header-Inputs INLINE im ersten thead-TR vorbereiten (keine zweite Zeile)
    const $titleThs = $thead.find('tr:first-child th');

    // alte Inline-Filter-Controls entfernen (Neuaufbau)
    $titleThs.find('.gdt-hfilter').remove();


    // 1) Explizite Filter-Definitionen (Kompatibilität)
    if (hasExplicit) {
      try { console.info('[GDT_DBG] building explicit header filters:', this.filters); } catch(_) {}
      this.filters.forEach(f => {
        if (f && (f.type === 'text' || f.type === 'select')) {
          // gültigen Index & Titelzeile voraussetzen
          if (!$titleThs.length) return;
          const idx = Number(f.column);
          if (!Number.isInteger(idx)) return;
          if (idx < 0 || idx >= $titleThs.length) return;
          const headerCell = $($titleThs.get(idx));


          if (f.type === 'text') {
            $('<input type="text" class="form-control form-control-sm gdt-hfilter" placeholder="' + (f.placeholder || '') + '" />')
              .appendTo(headerCell.empty())
              .on('keyup change', function() {
                table.column(f.column).search(this.value).draw();
              });
          }
          if (f.type === 'select') {
            const select = $('<select class="form-select form-select-sm gdt-hfilter"><option value="">Alle</option></select>')
              .appendTo(headerCell.empty())
              .on('change', function() {
                table.column(f.column).search(this.value).draw();
              });
            if (f.options && Array.isArray(f.options)) {
              f.options.forEach(opt => select.append('<option value="' + opt + '">' + opt + '</option>'));
            } else {
              try {
                const unique = table.column(f.column).data().unique().toArray().filter(v => v != null && v !== '');
                Array.from(new Set(unique)).sort().forEach(val => {
                  select.append('<option value="' + val + '">' + val + '</option>');
                });
              } catch(_) {}
            }
            try {
              const cur = table.column(f.column).search();
              if (cur && cur.charAt(0) !== '^') select.val(cur);
            } catch(_) {}
          }
        }
      });
    }

// 2) No-Code Header-Inputs (gem. Defaults/TH-Attribute), wenn gewünscht
    // HINWEIS: hasAttr wurde bereits oben geprüft, kein erneuter Check nötig!

    console.info('[GDT] Processing TH attributes for filters...');
    const ths = $(table.table().header()).find('tr:first-child th');
    
    if (ths.length === 0) {
      console.warn('[GDT] No TH elements found in header!');
      try {
        if (!this._gdtHdrRetry2) {
          this._gdtHdrRetry2 = true;
          setTimeout(() => { try { this.addColumnFilters(); } catch(_) {} }, 100);
          setTimeout(() => { try { this.addColumnFilters(); } catch(_) {} }, 400);
        }
      } catch(_) {}
      return;
    }
    
    console.info('[GDT] Found', ths.length, 'TH elements');

    ths.each(function(i, th) {
      const $th = $(th);
      const typeAttr = ($th.attr('data-gdt-filter') || '').toLowerCase();
      
      console.log('[GDT] TH', i, 'data-gdt-filter:', typeAttr);
      
      if (!typeAttr) return;
      const isSelect = typeAttr === 'select';
      const isNumber = typeAttr === 'number';
      const isDate   = typeAttr === 'date-range';

      let headerCell;
      try {
        const hdr = table.column(i).header();
        if (!hdr) return;
        headerCell = $(hdr);
      } catch(_) { return; }



      // keine Checkbox-/Action-Spalte
      if ($th.hasClass('select-checkbox')) return;

      // bereits vorhanden? (Duplikate verhindern)
      if (headerCell.find('.gdt-hfilter').length) return;

          if (isSelect) {
            const title = ($(table.column(i).header()).text() || '').trim();
            const select = $('<select class="form-select form-select-sm gdt-hfilter" autocomplete="off"><option value="">' + (title ? ('Alle ' + title) : 'Alle') + '</option></select>')
              .appendTo(headerCell.empty())
              .on('change', function () {
                table.column(i).search(this.value).draw();
              })
              .on('mousedown click touchstart', function (ev) {
                ev.stopPropagation(); // verhindert ColReorder-Drag vom Filter
              })
              .on('keydown', function (ev) {
                ev.stopPropagation(); // keine Sort/Reorder-Key-Propagation
              });




        const raw = $th.attr('data-gdt-options');
        if (raw) {
          try {
            const opts = JSON.parse(raw);
            if (Array.isArray(opts)) opts.forEach(opt => select.append('<option value="' + opt + '">' + opt + '</option>'));
          } catch(_) {}
        } else {
          try {
            const unique = table.column(i).data().unique().toArray().filter(v => v != null && v !== '');
            Array.from(new Set(unique)).sort().forEach(val => {
              select.append('<option value="' + val + '">' + val + '</option>');
            });
          } catch(_) {}
        }

        // aktuellen Spalten-Searchwert in Select übernehmen
        try {
          const cur = table.column(i).search();
          if (cur && cur.charAt(0) !== '^') select.val(cur);
        } catch(_) {}
      } else if (!isDate) {
        const title = ($(table.column(i).header()).text() || '').trim();
        const ph = isNumber ? 'Zahl filtern…' : (title ? ('Filtern: ' + title) : 'Filtern…');
          const input = $('<input type="' + (isNumber ? 'number' : 'text') + '" class="form-control form-control-sm gdt-hfilter" placeholder="' + ph + '" autocomplete="off" />')
            .appendTo(headerCell.empty())
            .on('keyup change', function () {
              table.column(i).search(this.value).draw();
            })
            .on('mousedown click touchstart', function (ev) {
              ev.stopPropagation(); // verhindert ColReorder-Drag vom Filter
            })
            .on('keydown', function (ev) {
              ev.stopPropagation(); // keine Sort/Reorder-Key-Propagation
            })

        // aktuellen Spalten-Searchwert in Input übernehmen

        try {
          const cur = table.column(i).search();
          if (cur && cur.charAt(0) !== '^') input.val(cur);
        } catch(_) {}
      }

    });
    // Anzeige justieren (ohne Draw-Flicker)
    try { table.columns.adjust(); } catch(_){}

    // Notify: Header-Filter sind gebaut → Resize-Handles neu aufbauen
    try { (table.table().node()).dispatchEvent(new CustomEvent('GDT:FiltersBuilt', { bubbles: true })); } catch(_){}


    // ▼▼ Filter-Chips (gem. Konzept) – aktiv, wenn GDT_DEFAULTS.filters.chips === true
    (function buildFilterChips(){
      try {
        const F = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.filters) || {};
        if (!F.chips) return;

        const $tbl = $(table.table().node());
        const el = table.table().node();
        const wantsChips = el && el.hasAttribute('data-gdt-chips') && (el.getAttribute('data-gdt-chips') !== 'false');
        if (!wantsChips) return;
        let $chips = $tbl.prev('.gdt-chips');
        if (!$chips.length) {
          $chips = $('<div class="gdt-chips mb-2"></div>');
          $tbl.before($chips);
        }

        const render = () => {
          try {
            $chips.empty();
            const cols = table.columns().count();
            for (let i = 0; i < cols; i++) {
              const cur = table.column(i).search() || '';
              if (!cur) continue;

              const title = ($(table.column(i).header()).text() || '').trim();
              const $chip = $('<span class="badge rounded-pill bg-secondary me-2"></span>')
                .text((title ? (title + ': ') : '') + cur);

              const $x = $('<button type="button" class="btn btn-sm btn-light ms-2">×</button>')
                .on('click', (e) => {
                  e.preventDefault(); e.stopPropagation();
                  table.column(i).search('').draw(false);
                  try {
                    const $hf = $(table.column(i).header()).find('.gdt-hfilter');
                    if ($hf.length) { $hf.val(''); $hf.trigger('change'); }
                  } catch(_) {}
                });

              const $wrap = $('<span class="gdt-chip-item d-inline-flex align-items-center me-2 mb-1"></span>');
              $wrap.append($chip).append($x);
              $chips.append($wrap);
            }
            // „Alle löschen“-Chip, wenn mindestens ein Filter aktiv ist
            if ($chips.children().length) {
              const $clearAll = $('<button type="button" class="btn btn-outline-secondary btn-sm">Filter löschen</button>')
                .on('click', () => {
                  table.search('');
                  table.columns().every(function(){ this.search(''); });
                  try {
                    const $thead = $(table.table().header());
                    $thead.find('.gdt-hfilter').val('').trigger('change');
                  } catch(_) {}
                  table.draw(false);
                });
              $chips.append($('<span class="ms-1"></span>').append($clearAll));
            }
          } catch(_) {}
        };

        // initial + on draw aktualisieren
        table.off('draw.dt.gdt_chips').on('draw.dt.gdt_chips', render);
        render();
      } catch(_) {}
    })();

  }



  addFilterButtons() {
    if (!Array.isArray(this.filters) || !this.filters.length) return;
    const table = this.dtInstance;

    // pro Tabelle ein eigener Container
    const node = table.table().node();
    if (!node.id) node.id = 'dt-' + Math.random().toString(36).slice(2);
    const cid = 'datatable-filter-buttons-' + node.id;

    let $btnContainer = $('#'+cid);
    if (!$btnContainer.length) {
      $btnContainer = $('<div id="' + cid + '" class="mb-2"></div>');
      $(this.selector).before($btnContainer);
    }

    this.filters.forEach(f => {
      if (f.type === 'button') {
        const btn = $('<button>')
          .addClass(f.className || 'btn btn-outline-primary btn-sm me-2')
          .text(f.label || 'Filter')
          .on('click', () => f.action(table));
        $btnContainer.append(btn);
      }
    });
  }


  reload(extraParams = null, keepPaging = true) {
    if (!this.dtInstance) return;

    if (this.dtInstance.ajax && this.dtInstance.settings()[0].ajax) {
      if (extraParams) {
        const settings = this.dtInstance.settings()[0];
        const oldData = settings.ajax.data;
        settings.ajax.data = function(d) {
          if (typeof oldData === 'function') oldData(d);
          else if (oldData && typeof oldData === 'object') Object.assign(d, oldData);
          Object.assign(d, extraParams);
        };
      }
      this.dtInstance.ajax.reload(null, !keepPaging);
    } 
    else if (Array.isArray(extraParams)) {
      this.reloadData(extraParams, true);
    } 
    else {
      console.warn('Keine passende Datenquelle für Reload gefunden.');
    }
  }

  reloadData(rows, keepPaging = true) {
    if (!this.dtInstance || !Array.isArray(rows)) return;
    const page = this.dtInstance.page();
    this.dtInstance.clear();
    this.dtInstance.rows.add(rows);
    this.dtInstance.draw(false);
    if (keepPaging) this.dtInstance.page(page).draw('page');
  }

  destroy() {
    try {
      const $ = (window.jQuery||window.$);
      const t = $(this.selector).DataTable();
      // Events für Header-Rebuild lösen
      try { t.off('column-visibility.dt.gdt_hdr column-reorder.dt.gdt_hdr draw.dt.gdt_hdr'); } catch {}
      // Filterzeile entfernen
      try { $(t.table().header()).find('tr.gdt-filter-row').remove(); } catch {}
      // Zusatzleisten entfernen (Saved Views / Chips) – idempotent
      try { $(this.selector).prev('.gdt-viewbar').remove(); } catch {}
      try { $(this.selector).prev('.gdt-chipbar').remove(); } catch {}
      // DataTable zerstören
      try { t.destroy(); } catch {}

    } catch {}
    try {
      if (this._btnNs) (window.jQuery||window.$)(document).off(`click${this._btnNs}`, '[data-dt-filter]');
      this._btnNs = null;
    } catch {}
  }
}

window.UniversalDataTable = UniversalDataTable;


// === LEAN-KOMPATIBLE API FUNKTIONEN ===
window.refreshSection = function(selector) {
  try {
    const table = $(selector).DataTable();
    if (table && table.ajax) {
      table.ajax.reload(null, false);
    }
  } catch(e) {
    console.warn('[refreshSection] failed:', selector, e);
  }
};

window.destroyAllDataTables = function(selector = null) {
  try {
    if (selector) {
      const table = $(selector).DataTable();
      if (table) table.destroy();
    } else {
      $('.dataTable').each(function() {
        if ($.fn.dataTable.isDataTable(this)) {
          $(this).DataTable().destroy();
        }
      });
    }
} catch(e) {
    console.warn('[destroyAllDataTables] failed:', e);
  }
};

// Back-Compat Shim: erlaubt buildTableIfExists auch ohne Config (Zero-Config via data-gdt-*)
if (!window.buildTableIfExists) window.buildTableIfExists = function(selector, config){
  try {
    if (!config || typeof config !== 'object') config = {};
    if (selector && !config.tableSelector) config.tableSelector = selector;

    // data-gdt-* → uiDefaults mappen (nur falls nicht gesetzt)
    try {
      const el = (typeof selector === 'string') ? document.querySelector(selector) : selector;
      if (el) {
        config.uiDefaults = config.uiDefaults || {};
        for (const a of Array.from(el.attributes || [])) {
          if (a.name && a.name.indexOf('data-gdt-') === 0) {
            const key = a.name.slice(9).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
            let val = a.value; try { val = JSON.parse(val); } catch(_) {}
            if (config.uiDefaults[key] === undefined) config.uiDefaults[key] = val;
          }
        }
      }
    } catch(_) {}

    return (window.GlobalDataTableController && window.GlobalDataTableController.init)
      ? window.GlobalDataTableController.init(config)
      : null;
  } catch(e) {
    console.warn('[GDT] buildTableIfExists shim failed:', e);
    return null;
  }
};

// === NEUER LEAN-KOMPATIBLER GLOBAL DATA TABLE CONTROLLER ===

window.GlobalDataTableController = {

  // HAUPT-API: Lean-kompatible Initialisierung
  init: function(selectorOrConfig, contextOrConfig, maybeConfig) {
    console.log('[GDT] LEAN init called:', arguments.length, 'args');

    try {
      let finalConfig, selector, ctx = null;

      // Signatur-Erkennung für Lean-Kompatibilität
      if (typeof selectorOrConfig === 'string') {
        selector = selectorOrConfig;

        if (maybeConfig) {
          // Lean-Style: init(selector, ctx, config)
          ctx = contextOrConfig || null;
          finalConfig = { ...(maybeConfig || {}), tableSelector: selector };
          console.log('[GDT] Lean-Style mit Context:', ctx);
        } else {
          // Legacy-Style: init(selector, config)
          finalConfig = { ...(contextOrConfig || {}), tableSelector: selector };
          console.log('[GDT] Legacy-Style');
        }

      } else if (typeof selectorOrConfig === 'object' && selectorOrConfig) {
        // Config-Only: init(config)
        finalConfig = { ...(selectorOrConfig || {}) };
        selector = finalConfig.tableSelector || finalConfig.el || finalConfig.selector;
        console.log('[GDT] Config-Only Style');
      }

      if (!selector) throw new Error('[GDT] Kein tableSelector gefunden');

      // === Merge GDT_DEFAULTS (Zero-Break) ===
      if (window.GDT_DEFAULTS && typeof window.GDT_DEFAULTS === 'object') {
        (function applyDefaults(dst, src){
          for (const k in src) {
            const sv = src[k], dv = dst[k];
            if (sv && typeof sv === 'object' && !Array.isArray(sv)) {
              dst[k] = (dv && typeof dv === 'object' && !Array.isArray(dv)) ? dv : {};
              applyDefaults(dst[k], sv);
            } else if (dst[k] === undefined) {
              dst[k] = sv;
            }
          }
        })(finalConfig, window.GDT_DEFAULTS);
      }

      // Context-Parameter in AJAX einschleusen (falls Lean-Call)
      if (ctx && finalConfig.ajax) {
        const originalData = finalConfig.ajax.data;
        finalConfig.ajax.data = function(d) {
          let result = d || {};

          if (typeof originalData === 'function') {
            result = originalData.call(this, result) || result;
          } else if (originalData && typeof originalData === 'object') {
            Object.assign(result, originalData);
          }

          if (ctx.id)       result.entityId = ctx.id;
          if (ctx.parentId) result.parentId = ctx.parentId;
          if (ctx.entity)   result.entity   = ctx.entity;

          return result;
        };
      }

      console.log('[GDT] Erstelle UniversalDataTable:', selector);

      // --- Low-Code Hooks: Accordion-Unterstützung global aktivierbar ---
      // Aktiv, wenn features.accordion.enabled = true ODER detailPanel.mode === 'accordion'
      try {
        const wantAccordion =
          (finalConfig?.features?.accordion?.enabled === true) ||
          (finalConfig?.uiFeature?.accordion === true) ||
          (finalConfig?.detailPanel?.mode === 'accordion');

        if (wantAccordion) {
          const chain = (baseFn, addFn) =>
            (typeof baseFn === 'function')
              ? function(...args){ try { baseFn.apply(this, args); } catch(_) {} try { addFn.apply(this, args); } catch(_) {} }
              : addFn;

          // Accordion: vor jedem Redraw evtl. vorhandene Zusatz-Zeilen aufräumen + Handler re-binden
          finalConfig.drawCallback = chain(finalConfig.drawCallback, function(){
            try {
              // nur Accordion-Zeilen entfernen; defensiv (mehrere Tabellen)
              document.querySelectorAll('tr.accordion-row').forEach(r => r.remove());
            } catch(_) {}
            try {
              if (typeof window.attachRowHandlers === 'function') {
                window.attachRowHandlers();
              }
            } catch(_) {}
          });

          // Accordion: Zeilen optional markieren/attribuieren (hilft Handlern)
          finalConfig.rowCallback = chain(finalConfig.rowCallback, function(row, data){
            try {
              if (data && typeof data === 'object') {
                row.classList.add('task-row');
                if (data.id && !row.dataset.id) row.dataset.id = data.id;
              }
            } catch(_) {}
          });
        }
      } catch(_) {}

      // --- [GUARD 1] Columns entkoppeln + "Name" → "Contact_name" nur für leadsTable
      if (Array.isArray(finalConfig.columns)) {
        // neue Objekte, keine geteilten Referenzen
        finalConfig.columns = finalConfig.columns.map(col => ({ ...col }));
        if (typeof selector === 'string' && selector === '#leadsTable') {
          finalConfig.columns = finalConfig.columns.map(col => ({
            ...col,
            data: col.data === 'Name' ? 'Contact_name' : col.data
          }));
        }

        // --- [GUARD 1b] Header-Mapping: <th data-gdt-col="..."> ⇒ columns[i].data (Objektmodus aktivieren)
        try {
          let el = null;
          const sel = (typeof selector === 'string') ? document.querySelector(selector) : (finalConfig.el || finalConfig.tableSelector || null);
          el = (sel && sel.nodeType === 1) ? sel : (sel ? document.querySelector(sel) : null);
          if (el && !el.matches('table')) { const t = el.querySelector('table'); if (t) el = t; }

          if (el) {
            const ths = el.querySelectorAll('thead th');
            finalConfig.columns = finalConfig.columns.map((col, i) => {
              const th = ths[i];
              if (!th) return col;

              const gdtCol = th.getAttribute('data-gdt-col');
              const dtData = th.getAttribute('data-dt-col-data');
              const byName = th.getAttribute('data-dt-col-name');
              const dataKey = gdtCol || dtData || null;

              const next = { ...col };
              if ((next.data === undefined || next.data === null) && dataKey) next.data = dataKey;
              if ((next.name === undefined || next.name === null) && byName) next.name = byName;

              return next;
            });
          }
        } catch(_) {}
      }


      // --- [SELECTION INJECTION] sichtbar, wenn per Defaults aktiviert
      (function applySelection(){
        try {
          const selCfg = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.selection) || null;
          if (!selCfg || selCfg.enabled !== true) return;
          if (!Array.isArray(finalConfig.columns)) return;

          // Checkbox-Spalte einfügen (links), falls noch nicht vorhanden
          const hasSelectCheckbox = (finalConfig.columnDefs||[]).some(d => d && d.className === 'select-checkbox');
          if (!hasSelectCheckbox) {
            finalConfig.columns = [{ data: null, defaultContent: '' }].concat(finalConfig.columns || []);
            finalConfig.columnDefs = (finalConfig.columnDefs || []);
            finalConfig.columnDefs.unshift({ orderable: false, className: 'select-checkbox', targets: 0 });
            // Standard-Order nach der Checkbox auf die erste Datenspalte
            finalConfig.order = finalConfig.order || [[1, 'asc']];

            // ⚙️ Header-TH für die Checkbox-Spalte sicherstellen (DOM ↔ columns Count Match)
            try {
              const selNode = (typeof selector === 'string') ? document.querySelector(selector) : (finalConfig.el || finalConfig.tableSelector || null);
              let el = (selNode && selNode.nodeType === 1) ? selNode : (selNode ? document.querySelector(selNode) : null);
              if (el && !el.matches('table')) { const t = el.querySelector('table'); if (t) el = t; }
              const tr = el && el.querySelector('thead tr');
              if (tr && !tr.querySelector('th.select-checkbox')) {
                const th = document.createElement('th');
                th.className = 'select-checkbox';
                tr.insertBefore(th, tr.firstChild);
              }
            } catch(_) {}
          }

          // DataTables Select-Extension aktivieren (nur wenn nicht bereits gesetzt)
          if (!finalConfig.select) {
            if (selCfg.style === 'checkbox') {
              finalConfig.select = { style: (selCfg.mode === 'single' ? 'single' : 'multi'), selector: 'td.select-checkbox' };
            } else {
              finalConfig.select = { style: (selCfg.mode === 'single' ? 'single' : 'multi') };
            }
          }
        } catch(_) {}
      })();

      // --- [GUARD 2] Unknown-Parameter-Warnungen abfangen
      finalConfig.columnDefs = (finalConfig.columnDefs || []).concat([
        { targets: '_all', defaultContent: '' }
      ]);

      // --- [BUTTONS / GEAR] Quick-Export + ColVis automatisch injizieren (sichtbar in der UI)
      (function applyButtons(){
        try {
          // Nur wenn DataTables Buttons-Extension verfügbar ist
          if (!$.fn.dataTable || !$.fn.dataTable.Buttons) return;

          const ff = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.features) || {};
          const wantExport = ff.quickExport && ff.quickExport.enabled !== false;
          const wantColvis = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.columnMenu && window.GDT_DEFAULTS.columnMenu.enabled === true);

          // Buttons-Array initialisieren, falls nicht vorhanden
          finalConfig.buttons = finalConfig.buttons || [];

          // ColVis/Gear hinzufügen, wenn noch nicht vorhanden
          if (wantColvis && !finalConfig.buttons.some(b => (b === 'colvis') || (typeof b === 'object' && b.extend === 'colvis'))) {
            finalConfig.buttons.push('colvis');
          }

          // Export-Buttons hinzufügen, wenn noch nicht vorhanden
          if (wantExport) {
            const formats = (ff.quickExport.formats || ['csv','xlsx','pdf']);
            const map = { csv:'csv', xlsx:'excel', pdf:'pdf' };
            formats.forEach(f => {
              const ext = map[f];
              if (!ext) return;
              if (!finalConfig.buttons.some(b => (b === ext) || (typeof b === 'object' && b.extend === ext))) {
                finalConfig.buttons.push(ext);
              }
            });
          }

          // DOM-Layout nur setzen, wenn Buttons tatsächlich existieren
          if (finalConfig.buttons.length && !finalConfig.dom) {
            finalConfig.dom = 'Bfrtip';
          }
        } catch(_) {}
      })();


      // --- [GUARD 3] Ajax dataSrc robust + Alias 'Name' (nur leadsTable)
      if (finalConfig.ajax) {
        // Alias-Unterstützung: top-level dataSrc => ajax.dataSrc (falls nicht gesetzt)
        if (finalConfig.dataSrc !== undefined && finalConfig.ajax.dataSrc === undefined) {
          finalConfig.ajax.dataSrc = finalConfig.dataSrc;
        }

        // Hilfsfunktion: dot-path "a.b.c" sicher auflösen
        const __gdtGetByPath = (obj, path) => {
          if (!obj || typeof path !== 'string' || !path) return undefined;
          const parts = path.split('.');
          let cur = obj;
          for (let i = 0; i < parts.length; i++) {
            if (cur == null) return undefined;
            cur = cur[parts[i]];
          }
          return cur;
        };

        const origDataSrc = finalConfig.ajax.dataSrc;
        finalConfig.ajax.dataSrc = function(json) {
          // unterstützt: Array, {data:[...]}, custom dataSrc-Fn, string-key inkl. Dot-Notation und Auto-Array-Erkennung
          let rows;

          if (typeof origDataSrc === 'function') {
            rows = origDataSrc(json);
          } else if (origDataSrc === '' || origDataSrc == null) {
            // explizit nacktes Array ODER kein dataSrc angegeben
            rows = Array.isArray(json) ? json : (json?.data ?? []);
          } else if (typeof origDataSrc === 'string') {
            // z.B. 'items', 'rows' ODER 'result.items'
            rows = (__gdtGetByPath(json, origDataSrc) ?? json?.[origDataSrc]);
          } else {
            // Fallback: Auto-Detection → Array direkt, sonst {data:[...]}
            rows = Array.isArray(json) ? json : (json?.data);
          }

          if (!Array.isArray(rows)) rows = [];

          // Nur für leadsTable: 'Name' aliasen, falls irgendwo noch referenziert
          if (typeof selector === 'string' && selector === '#leadsTable') {
            rows = rows.map(r => ({ ...r, Name: r.Name ?? r.Contact_name ?? '' }));
          }
          return rows;
        };

      }


      // - No-Code data-gdt-* Merge (konservativ)
      (function mergeDataAttrs(){
        try {
          let el = null;
          const sel = (typeof selector === 'string') ? document.querySelector(selector) : (finalConfig.el || finalConfig.tableSelector || null);
          el = (sel && sel.nodeType === 1) ? sel : (sel ? document.querySelector(sel) : null);
          if (el && !el.matches('table')) { const t = el.querySelector('table'); if (t) el = t; }
          if (!el) return;

          const data = {};
          for (const a of Array.from(el.attributes)) {
            if (a.name && a.name.indexOf('data-gdt-') === 0) {
              const key = a.name.slice(9).replace(/-([a-z])/g, (_, g) => g.toUpperCase());
              let val = a.value;
              try { val = JSON.parse(val); } catch(_) {}
              data[key] = val;
            }
          }

          finalConfig.uiDefaults = finalConfig.uiDefaults || {};
          for (const k in data) { if (finalConfig.uiDefaults[k] === undefined) finalConfig.uiDefaults[k] = data[k]; }
        } catch(e) {
          console.warn('[GDT] data-gdt parser skipped:', e);
        }
      })();

      // data-gdt-* → aktivierende UI-Flags (No-Code Mapping, konservativ)
      (function applyUiDefaults(){
        try {
          const ui = finalConfig.uiDefaults || {};
          // Nur Keys übernehmen, die es in den Defaults gibt (Zero-Break)
          const D = (window.GDT_DEFAULTS || {});
          const set = (path, val) => {
            if (val === undefined) return;
            const parts = path.split('.');
            let cur = finalConfig;
            for (let i=0;i<parts.length-1;i++){
              const k = parts[i];
              cur[k] = (cur[k] && typeof cur[k] === 'object') ? cur[k] : {};
              cur = cur[k];
            }
            const last = parts[parts.length-1];
            if (cur[last] === undefined) cur[last] = val; else cur[last] = cur[last];
          };

          // Beispielhafte, sichere Mappings (nur wenn im Defaults-Tree vorhanden)
          if (D.selection)   set('selection.enabled',   ui.selection ?? ui.select ?? undefined);
          if (D.ellipsis)    set('ellipsis.enabled',    ui.ellipsis ?? undefined);
          if (D.smartWidths) set('smartWidths.enabled', ui.smartWidths ?? undefined);
          if (D.columnResize)set('columnResize.enabled',ui.columnResize ?? undefined);
          if (D.features?.quickExport) set('features.quickExport.enabled', ui.quickExport ?? ui.export ?? undefined);
          if (D.columnMenu)  set('columnMenu.enabled',  ui.columnMenu ?? ui.gear ?? undefined);
        } catch(e) {
          console.warn('[GDT] applyUiDefaults skipped:', e);
        }
      })();

      // UniversalDataTable erstellen
      const table = new UniversalDataTable(finalConfig);


      // Header-SelectAll für Checkbox-Selektion (sichtbar in der UI)
      (function bindHeaderSelectAll(){
        try {
          const selCfg = (window.GDT_DEFAULTS && window.GDT_DEFAULTS.selection) || null;
          if (!selCfg || selCfg.enabled !== true || selCfg.headerSelectAll !== true) return;
          const dt = table && table.dtInstance;
          if (!dt) return;

          const headerCell = $(dt.column(0).header());
          if (!headerCell.length || !headerCell.hasClass('select-checkbox')) return;

          // Toggle ALL rows when clicking header checkbox cell
          headerCell.off('click.gdtSelectAll').on('click.gdtSelectAll', function(){
            const allSelected = dt.rows({ selected:true }).count() === dt.rows().count();
            if (allSelected) dt.rows().deselect();
            else dt.rows().select();
          });
        } catch(_) {}
      })();

      try {
        document.dispatchEvent(new CustomEvent('GDT:ReadyVisible', {
          detail: {
            selector: (typeof selector === 'string' ? selector : (finalConfig.tableSelector || null)),
            table: table.dtInstance
          }
        }));
      } catch(e) {
        console.warn('[GDT] ReadyVisible event skipped:', e);
      }



      if (!table || !table.dtInstance) {
        throw new Error('[GDT] UniversalDataTable Erstellung fehlgeschlagen');
      }

      // ⬇︎ NEU: UDT-Map-Registration (für Refresh/Filter-Sync)
      try {
        const map = (window.getUdtMap && window.getUdtMap()) || null;

        const node = (
          (typeof selector === 'string') ? document.querySelector(selector) : selector
        );
        const tableEl = node && (node.matches?.('table') ? node : node.querySelector?.('table'));
        const sectionRoot = tableEl?.closest?.('.dashboard-section[data-section], .swipe-panel[data-section]');
        const sectionKey = sectionRoot?.dataset?.section || null;

        if (map && sectionKey) {
          const inst = {
            dt: table.dtInstance,
            dtInstance: table.dtInstance,
            table: tableEl,
            section: sectionKey
          };
          map.set(sectionKey, inst);
          // kleiner Komfort: zuletzt aktive Section merken
          window.__lastUDTSection = sectionKey;
          console.log('[GDT] UDT Map registered for section:', sectionKey);
        }
      } catch (e) {
        console.warn('[GDT] UDT Map registration skipped:', e);
      }

      console.log('[GDT] ✅ DataTable erfolgreich erstellt');

      // UDT-Instanz am DOM & in DT-Settings ablegen (für Console/QA)
      try {
        const node = (typeof selector === 'string')
          ? document.querySelector(selector)
          : selector;
        const $ = (window.jQuery || window.$);
        if (node && $) {
          $(node).data('gdt', table);
        }
        const dt = table && table.dtInstance;
        const s = dt && dt.settings && dt.settings()[0];
        if (s) s._gdt = table;
      } catch (_) {}

      return table;


    } catch (error) {
      console.error('[GDT] ❌ Fehler beim Erstellen:', error);
      throw error;
    }
  },

  // Reload-Funktionalität (belassen)
  reload: function(selector, extraParams = null) {
    try {
      if ($.fn.dataTable.isDataTable(selector)) {
        const table = $(selector).DataTable();
        if (table.ajax && table.settings()[0].ajax) {
          if (extraParams) {
            const settings = table.settings()[0];
            const oldData = settings.ajax.data;
            settings.ajax.data = function(d) {
              if (typeof oldData === 'function') oldData.call(this, d);
              else if (oldData && typeof oldData === 'object') Object.assign(d, oldData);
              Object.assign(d, extraParams);
              return d;
            };
          }
          table.ajax.reload(null, false);
        } else {
          table.draw(false);
        }
      }
    } catch (e) {
      console.error('[GDT] reload error:', e);
    }
  },

  destroy: function(selector) {
    try {
      if ($.fn.dataTable.isDataTable(selector)) {
        $(selector).DataTable().destroy(true);
      }
    } catch (e) {
      console.error('[GDT] destroy error:', e);
    }
  },

  isDataTable: function(selector) {
    return $.fn.dataTable.isDataTable(selector);
  },

  getInstance: function(selector) {
    return $.fn.dataTable.isDataTable(selector) ? $(selector).DataTable() : null;
  },

  // Öffentlicher Helper: TH-Filter (erneut) aufbauen
  buildFilters: function(selector) {
    try {
      const $ = (window.jQuery || window.$);
      const dt = this.getInstance(selector);
      if (!dt) return false;
      const udt =
        (dt.settings && dt.settings()[0] && dt.settings()[0]._gdt) ||
        ($ && $(selector).data('gdt')) ||
        null;
      if (udt && typeof udt.addColumnFilters === 'function') {
        udt.addColumnFilters();
        return true;
      }
      console.warn('[GDT] buildFilters: keine UDT-Instanz gefunden');
      return false;
    } catch (e) {
      console.error('[GDT] buildFilters error:', e);
      return false;
    }
  }
};
  
  window.GDT = window.GlobalDataTableController;
  
  window.GDT_QA = {
    ping: function() {
      return '[GDT_QA] ok';
    },
    isReady: function(selector) {
      try { return $.fn.dataTable.isDataTable(selector); } catch (e) { return false; }
    },
    info: function(selector) {
      try {
        const t = $(selector).DataTable();
        return t ? t.page.info() : null;
      } catch (e) {
        return null;
      }
    },
    diagnose: function(selector) {
      try {
        const t = $(selector).DataTable();
        if (!t) return { ok:false, issues:[{level:'error', code:'NO_TABLE', message:'Kein DataTable', hint:'Selector prüfen'}] };
        const exts = {
          Select: !!t.select, Buttons: !!t.buttons, ColReorder: !!(t.colReorder || (t.settings()[0].aoFeatures && t.settings()[0].aoFeatures.R))
        };
        const state = t.state && t.state() || {};
        const widths = [];
        try { $(t.table().header()).find('th').each(function(){ widths.push(this.style.width||''); }); } catch(_){}
        return {
          ok:true,
          env:{ dtVersion: $.fn.dataTable.version, extensions: exts },
          state:{ saved: !!state.time, order: state.order||[], visible: Array.from({length:t.columns().count()},(_,i)=>t.column(i).visible()), widths }
        };
      } catch(e) {
        return { ok:false, issues:[{level:'error', code:'EXC', message:String(e)}] };
      }
    },
    selfTest: function(selector) {
      try {
        const t = $(selector).DataTable();
        if (!t) return { ok:false, steps:[], error:'Kein DataTable' };
        const steps = [];
        steps.push({ step:'order', ok: !!t.order });
        steps.push({ step:'draw', ok: true });
        return { ok: steps.every(s=>s.ok), steps };
      } catch(e) {
        return { ok:false, steps:[], error:String(e) };
      }
    }
  };

/* ===== GDT Unified Mirror (1:1 wie das funktionierende Konsolen-Skript) ===== */
(() => {
  // --- originaler Kern: genau so lief es bei dir in der Konsole ---
  function GDT_unifiedMirror_run(panel) {
    const cont     = panel.querySelector('.dt-container');
    const headWrap = cont?.querySelector('.dt-scroll-head');
    const bodyWrap = cont?.querySelector('.dt-scroll-body');
    const headTbl  = headWrap?.querySelector('table');
    const bodyTbl  = bodyWrap?.querySelector('table');
    const ths      = [...(headTbl?.tHead?.rows?.[0]?.cells || [])];
    if (!headTbl || !bodyTbl || !ths.length) return () => {};

    const hasColgroup = () => !!bodyTbl.querySelector('colgroup col');

    const firstVisibleRow = () => {
      const vb = bodyWrap.getBoundingClientRect();
      const rows = bodyTbl.tBodies[0]?.rows || [];
      for (const tr of rows) {
        if (!tr.offsetParent) continue;
        const r = tr.getBoundingClientRect();
        if (r.height > 0 && r.bottom > vb.top + 1) return tr;
      }
      return rows[0] || null;
    };

    const ensureHeadCols = () => {
      let cg = headTbl.querySelector('colgroup');
      if (!cg) { cg = headTbl.ownerDocument.createElement('colgroup'); headTbl.insertBefore(cg, headTbl.tHead); }
      const bCols = bodyTbl.querySelectorAll('colgroup col');
      for (let i = cg.children.length; i < bCols.length; i++) cg.appendChild(headTbl.ownerDocument.createElement('col'));
      while (cg.children.length > bCols.length) cg.lastElementChild?.remove();
      return cg.querySelectorAll('col');
    };

    const setLayouts = () => {
      headTbl.style.tableLayout = 'fixed';
      bodyTbl.style.tableLayout = 'fixed';
      headTbl.style.width = bodyTbl.getBoundingClientRect().width + 'px';
      bodyWrap.style.overflowX = 'auto';
    };

    const lockHeaderToBody = () => {
      setLayouts();
      if (hasColgroup()) {
        const hCols = ensureHeadCols();
        const bCols = bodyTbl.querySelectorAll('colgroup col');
        const n = Math.min(hCols.length, bCols.length, ths.length);
        for (let i = 0; i < n; i++) {
          const w = getComputedStyle(bCols[i]).width;
          hCols[i].style.width = w;
          ths[i].style.width = w; ths[i].style.minWidth = w; ths[i].style.maxWidth = w;
        }
      } else {
        const row = firstVisibleRow(); if (!row) return;
        const tds = [...row.cells]; const n = Math.min(ths.length, tds.length);
        for (let i = 0; i < n; i++) {
          const w = tds[i].getBoundingClientRect().width;
          ths[i].style.width = w + 'px'; ths[i].style.minWidth = w + 'px'; ths[i].style.maxWidth = w + 'px';
        }
      }
    };

    const liveSyncActive = (idx) => {
      setLayouts();
      if (idx < 0) return;
      if (hasColgroup()) {
        const hCols = ensureHeadCols();
        const bCols = bodyTbl.querySelectorAll('colgroup col');
        if (!bCols[idx] || !hCols[idx] || !ths[idx]) return;
        const w = getComputedStyle(bCols[idx]).width;
        hCols[idx].style.width = w;
        ths[idx].style.width = w; ths[idx].style.minWidth = w; ths[idx].style.maxWidth = w;
      } else {
        const row = firstVisibleRow(); if (!row) return;
        const td = row.cells[idx]; if (!td || !ths[idx]) return;
        const w = td.getBoundingClientRect().width;
        ths[idx].style.width = w + 'px'; ths[idx].style.minWidth = w + 'px'; ths[idx].style.maxWidth = w + 'px';
      }
    };

    // — live nur aktive Spalte, finaler Sync nach Drop —
    let dragging = false, raf = 0, activeIdx = -1;
    const onDown = (e) => {
      const th = e.target.closest('thead th'); if (!th) return;
      activeIdx = th.cellIndex; if (activeIdx < 0) return;
      lockHeaderToBody();
      dragging = true;
      liveSyncActive(activeIdx);
    };
    const onMove = () => {
      if (!dragging) return;
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; liveSyncActive(activeIdx); });
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false; activeIdx = -1;
      setTimeout(() => lockHeaderToBody(), 30);
    };

    headWrap.addEventListener('pointerdown', onDown, true);
    window.addEventListener('pointermove', onMove, true);
    window.addEventListener('pointerup', onUp, true);

    const moHead = new MutationObserver(() => { if (!dragging) lockHeaderToBody(); });
    moHead.observe(headWrap, { childList: true, subtree: true });

    // ✚ Responsive-/Layout-Stabilität: Resize + Scroll + ResizeObserver mit sanftem Debounce
    let ro = null;
    const onWinOrScroll = () => {
      if (dragging) return;
      try { if (raf) cancelAnimationFrame(raf); } catch(_) {}
      requestAnimationFrame(lockHeaderToBody);
      setTimeout(lockHeaderToBody, 60);
    };
    try { window.addEventListener('resize', onWinOrScroll, true); } catch(_){}
    try { bodyWrap && bodyWrap.addEventListener('scroll', onWinOrScroll, true); } catch(_){}
    try {
      if ('ResizeObserver' in window) {
        ro = new ResizeObserver(() => {
          if (dragging) return;
          requestAnimationFrame(lockHeaderToBody);
          setTimeout(lockHeaderToBody, 50);
        });
        if (bodyWrap) ro.observe(bodyWrap);
        if (bodyTbl) ro.observe(bodyTbl);
      }
    } catch(_) {}

    // Initial ausrichten
    lockHeaderToBody();

    // Rückgabe: sauberer Detach (wird vom Starter genutzt)
    return () => {
      headWrap.removeEventListener('pointerdown', onDown, true);
      window.removeEventListener('pointermove', onMove, true);
      window.removeEventListener('pointerup', onUp, true);
      try { window.removeEventListener('resize', onWinOrScroll, true); } catch(_){}
      try { bodyWrap && bodyWrap.removeEventListener('scroll', onWinOrScroll, true); } catch(_){}
      try { ro && ro.disconnect(); } catch(_){}
      moHead.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }


  // --- Starter: Multi-DataTable pro aktivem Panel/Subview + Kill-Switch ---
  const activeMirrors = new Map(); // Map<Element table, Function detach>

  function stopAllMirrors() {
    for (const [, off] of activeMirrors) { try { off && off(); } catch(_){} }
    activeMirrors.clear();
  }

  function visibleContexts() {
    // sichtbare Panels UND aktive Subviews
    const roots = [
      ...document.querySelectorAll('.swipe-panel'),
      ...document.querySelectorAll('.subview.active')
    ];
    return roots.filter(r => r.offsetParent !== null);
  }

  // Sichtbarkeitsprüfung im Viewport (Micro-Optimization)
  function inViewport(el) {
    if (!el || !el.isConnected) return false;
    const r = el.getBoundingClientRect();
    const vw = window.innerWidth  || document.documentElement.clientWidth;
    const vh = window.innerHeight || document.documentElement.clientHeight;
    // mindestens etwas sichtbar
    return !(r.right < 0 || r.bottom < 0 || r.left > vw || r.top > vh) && (Math.min(r.width, r.height) >= 1);
  }

  function scanAndAttach() {
    // Kill-Switch
    if (window.GDT_MIRROR_ENABLED === false) { stopAllMirrors(); return; }

    const contexts = visibleContexts();
    const allTables = [];

    // alle DataTables in aktiven Panels/Subviews erfassen
    for (const ctx of contexts) {
      const tables = ctx.querySelectorAll('.dt-container .dt-scroll-body table');
      allTables.push(...tables);
    }

    // nur Tabellen im Viewport berücksichtigen
    const eligible = allTables.filter(inViewport);
    const current = new Set(eligible);

    // neue Mirrors starten
    for (const tbl of eligible) {
      if (!activeMirrors.has(tbl)) {
        try {
          const off = GDT_unifiedMirror_run(tbl.closest('.swipe-panel'));
          activeMirrors.set(tbl, off);
        } catch(_) {}
      }
    }

    // nicht mehr sichtbare/verbundene Mirrors stoppen
    for (const [tbl, off] of [...activeMirrors.entries()]) {
      if (!current.has(tbl) || !tbl.isConnected) {
        try { off && off(); } catch(_) {}
        activeMirrors.delete(tbl);
      }
    }
  }

  // DOM-Beobachtung (Panels/Subviews erscheinen/verschwinden)
  const mo = new MutationObserver(scanAndAttach);
  mo.observe(document.body, { childList: true, subtree: true });

  // Page-Visibility: im verborgenen Tab pausieren, bei Sichtbarkeit sofort neu scannen
  function onVisibility(){
    if (document.visibilityState === 'hidden') {
      try { stopAllMirrors(); } catch(_) {}
      armTicker(); // Ticker auf „langsam“ umstellen
      return;
    }
    // nach Rückkehr: Idle/RAF abwarten und dann sauber neu anhängen
    const resume = () => { try { scanAndAttach(); } catch(_) {} armTicker(); };
    if ('requestIdleCallback' in window) {
      requestIdleCallback(resume, { timeout: 300 });
    } else {
      requestAnimationFrame(resume);
      setTimeout(resume, 100);
    }
  }
  document.addEventListener('visibilitychange', onVisibility, true);

  // Adaptiver Fallback-Ticker (sichtbar: 250ms, verborgen: 1200ms)
  let iv = null;
  function armTicker(){
    if (iv) clearInterval(iv);
    const delay = (document.visibilityState === 'hidden') ? 1200 : 250;
    iv = setInterval(scanAndAttach, delay);
  }
  armTicker();

  // Cleanup
  window.addEventListener('beforeunload', () => {
    try { stopAllMirrors(); } catch(_) {}
    mo.disconnect();
    document.removeEventListener('visibilitychange', onVisibility, true);
    if (iv) clearInterval(iv);
  }, { once: true });

  // Initial
  scanAndAttach();
})();




  window.GDT_DEFAULTS = {
    compat: {
      keepLegacyCreatedRow: true,   // bestehende createdRow zuerst
      wrapOnlyPlainCells: true,     // Ellipsis nur ohne Custom-Renderer
      conservativeInitOrder: true   // UDT zuerst, Features danach
    },
    selection:   { enabled: false, mode: 'multi', style: 'checkbox', headerSelectAll: true },
    columnMenu:  { enabled: true,  position: 'right', include: 'all', persist: true, allowReorder: true, allowReset: true },
    ellipsis:    { enabled: false, tooltip: 'title' },
    smartWidths: { enabled: false, sampleRows: 25, pctl: 0.85, minPx: 120, maxPx: 420 },
    columnResize:{ enabled: true,  handleWidth: 8, minPx: 96, maxPx: 640, snapStep: 8, dblClick: 'autofit', persist: true, throttleMs: 16, touch: true },
    detailPanel: { enabled: false, trigger: 'icon', mode: 'accordion', persist: true, lazy: true, templateSelector: null, html: null, fn: null },
    jumpLinks:   { enabled: false, columns: [], actions: [], actionsPlacement: 'end', style: 'pills' },
    filters:     { enabled: true,  headerInputs: false, chips: true, savedViews: true },
    features:    { accordion:{enabled:false}, inlineEdit: {enabled:false}, bulkEdit:{enabled:false}, quickAdd:{enabled:false}, keyboardNav:{enabled:false}, multiSort:{enabled:false}, quickExport:{enabled:false,formats:['csv','xlsx','pdf']}, densitySwitch:{enabled:false} },
    state:       { enabled: true, keyPrefix: 'gdt:', saveOrder: true, saveSearch: true, savePage: true, includeWidths: true },
    theme:       { zebraStripes: true, compact: true, rowStateClasses: { enabled: true, fromField: 'Status', map: {} } },
    performance: { autoPageLength: { enabled: false, min: 1, max: 200 } }
  };












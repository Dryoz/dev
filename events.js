// events.js — ESM
// Struktur bleibt wie bei dir: CoreEvents, ExtraEvents, Events.
// Zusätzlich: EventAliases (Kanon → bestehende Strings + Legacy-Redirects).

export const CoreEvents = {
  // Global / Lifecycle
  EVENT_BUS_READY:            'event:busReady',
  PAGE_SHOW:                  'page:pageShow',
  PAGE_DOM_LOADING:		        'page:domLoading',
  PAGE_SCRIPT_LOADING:		    'page:scriptLoading',	
  PAGE_LOADER_ON:		          'page:loaderOn',	
  PAGE_HIDE:                  'page:pageHide',
  PAGE_LOADER_OFF:		        'page:loaderOff',	
  ROUTE_PARSED:            	  'page:beforeReady',
  PAGE_DOM_READY:             'page:domReady',
  PAGE_VIEW_READY:            'page:viewReady',
  PAGE_BEFORE_CHANGE:         'page:beforeChange',
  PAGE_STATE_MANAGER_READY:   'page:stateManagerReady',
  PAGE_DESTROYED:			        'page:destroyed',
  SUBVIEW_READY:              'page:subviewReady',

  // Dashboard & Sections
  DASHBOARD_CONFIGS_READY:    'dashboard:configsReady',
  DASHBOARD_RENDER_START:     'dashboard:renderStart',
  DASHBOARD_SECTION_MOUNTED:  'dashboard:sectionMounted',
  DASHBOARD_SECTION_RENDERED: 'dashboard:sectionRendered',
  DASHBOARD_TABLE_READY:      'dashboard:tableReady',      // Table im DOM
  DASHBOARD_TABLE_BUILT:      'dashboard:tableBuilt',      // DataTable initialisiert
  //DASHBOARD_TABLE_FAILED:   'dashboard:tableFailed',
  DASHBOARD_SECTIONS_REGISTER:'dashboard:sectionRegister', // Registry-Event
  DASHBOARD_SECTION_VISIBLE:  'dashboard:sectionVisible',
  GC_UI_BOOTSTRAP:            'GC_UI_BOOTSTRAP',

  // Panels (SlideManager)
  SECTION_BUILD_START:        'section:buildStart',
  SECTION_DOM_READY:          'section:domReady',  
  PANEL_SLIDE_CHANGED:        'panel:slideChanged',
  PANEL_SLIDE_ENTER:          'panel:slideEnter',
  PANEL_SLIDE_LEAVE:          'panel:slideLeave',

  // events.js
  INLINE_READY:               'INLINE_READY',
  INLINE_REFRESH:             'INLINE_REFRESH',
  INLINE_DISPOSE:             'INLINE_DISPOSE',

  TEMPLATE_OPENED:            'template:open',
  OPEN_EDITOR:                'PB:OPEN_EDITOR',
  BACK_OVERVIEW:              'PB:BACK_OVERVIEW',
  PUBLISH_PAGE:               'PB:PUBLISH_PAGE',
  DISPOSE_PAGE:               'PB:DISPOSE_PAGE',
  STATE_CHANGED:              'PB:STATE_CHANGED',

  // Tables
  TABLE_INIT:                 'table:init',
  TABLE_BUILD_START:          'table:buildStart',
  TABLE_REFRESH:              'table:refresh',
  TABLE_FILTER_CHANGED:       'table:filterChanged',

  // Data Loading
  DATA_LOAD_REQUESTED:        'data:loadRequested',
  DATA_LOADED:                'data:loaded',
  DATA_LOAD_FAILED:           'data:loadFailed',
  DATA_SAVES_SUCCESSFUL:      'data:saveSuccessful',
  DATA_SAVES_FAILED:          'data:saveFailed',
  DATA_DELETE_SUCCESSFUL:     'data:deleteSuccessful',
  DATA_DELETE_FAILED:         'data:deleteFailed',

  // Globaler Filter
  FILTER_CHANGED:             'filter:changed',

  // Session/Routing
  SESSION_USER_CHANGED:       'session:userChanged',
  ROUTE_CHANGED:              'route:changed',

  // UI Overlays & Modals
  OVERLAY_OPEN:               'overlay:open',
  OVERLAY_CLOSE:              'overlay:close',
  MODAL_OPEN:                 'modal:open',
  MODAL_CLOSE:                'modal:close',

  HANDLE_GENERIC_SUBMIT:      'event:handleGenericSubmit',
  HANDLE_GENERIC_DELETE:      'event:handleGenericDelete',
};

export const ExtraEvents = {
  // Tables (Qualität)
  TABLE_PAGE_CHANGED:         'table:pageChanged',
  TABLE_SELECTION_CHANGED:    'table:selectionChanged',
  TABLE_COLUMNS_CHANGED:      'table:columnsChanged',

  // UI
  TOAST_SHOW:                 'toast:show',
  SIDEBAR_TOGGLED:            'sidebar:toggled',

  // Netzwerk / API / Sync
  API_REQUEST_START:          'api:requestStart',
  API_REQUEST_END:            'api:requestEnd',
  API_ERROR:                  'api:error',
  SYNC_STATUS_CHANGED:        'sync:statusChanged',

  // WebSocket / Live
  WS_MESSAGE:                 'ws:message',

  // Extension
  EXT_CONTEXT_DETECTED:       'ext:contextDetected',
  EXT_SNAP_CAPTURED:          'ext:snapCaptured',
  EXT_SNAP_DELETED:           'ext:snapDeleted',
  EXT_STORAGE_CHANGED:        'ext:storageChanged',
  EXT_DOCK_MODE_CHANGED:      'ext:dockModeChanged',
  EXT_PDF_CREATED:            'ext:pdfCreated',

  // Domain
  LEAD_SCORE_UPDATED:         'lead:scoreUpdated',
  ENGAGEMENT_ACTION:          'engagement:actionPerformed',
  VISITOR_NEW_DETECTED:       'visitor:newDetected',

  // Diagnostics
  ERROR_UNHANDLED:            'error:unhandled',
  DEV_EVENT_LOG:              'dev:eventLog',
};



(function normalizeEvents(){
  const E = window.Events || window.CoreEvents || {};
  window.Events = E;
  window.CoreEvents = E; // Alias → beide Namensräume zeigen auf das Gleiche
})();

// Kombiniert wie gewohnt
export const Events = { ...CoreEvents, ...ExtraEvents };

// ===== Aliase & Legacy-Redirects =====
// Kanonische Namen (Event:/Dashboard:/Table:/Data:/Panel: …) → bestehende Strings.
// Zusätzlich: häufige Legacy-Strings → heutige Strings (z. B. Typo "Bulit").
export const EventAliases = {
  // Canon → aktuell genutzte Strings
  'Event:Ready':                 CoreEvents.EVENT_BUS_READY,
  'Event:PageViewReady':         CoreEvents.PAGE_VIEW_READY,
  'Event:PageStateManagerReady': CoreEvents.PAGE_STATE_MANAGER_READY,
  'Event:PageShow':              CoreEvents.PAGE_SHOW,
  'Event:PageHide':              CoreEvents.PAGE_HIDE,

  'Dashboard:RenderStart':       CoreEvents.DASHBOARD_RENDER_START,
  'Dashboard:SectionsRegister':  CoreEvents.DASHBOARD_SECTIONS_REGISTER,
  'Dashboard:SectionMounted':    CoreEvents.DASHBOARD_SECTION_MOUNTED,
  'Dashboard:SectionRendered':   CoreEvents.DASHBOARD_SECTION_RENDERED,
  'Dashboard:SectionVisible':    CoreEvents.DASHBOARD_SECTION_VISIBLE,
  'Dashboard:SectionRefresh':    CoreEvents.DASHBOARD_SECTION_REFRESH,
  'Dashboard:TableReady':        CoreEvents.DASHBOARD_TABLE_READY,
  'Dashboard:TableBuilt':        CoreEvents.DASHBOARD_TABLE_BUILT,

  'global:controller:slideInit': CoreEvents.SLIDE_MANAGER_INIT,
  'Panel:SlideChanged':          CoreEvents.PANEL_SLIDE_CHANGED,
  'Panel:SlideEnter':            CoreEvents.PANEL_SLIDE_ENTER,
  'Panel:SlideLeave':            CoreEvents.PANEL_SLIDE_LEAVE,

  'Table:Init':                  CoreEvents.TABLE_INIT,
  'Table:Refresh':               CoreEvents.TABLE_REFRESH,
  'Table:FilterChanged':         CoreEvents.TABLE_FILTER_CHANGED,
  'Table:PageChanged':           ExtraEvents.TABLE_PAGE_CHANGED,
  'Table:SelectionChanged':      ExtraEvents.TABLE_SELECTION_CHANGED,
  'Table:ColumnsChanged':        ExtraEvents.TABLE_COLUMNS_CHANGED,

  'Data:LoadRequested':          CoreEvents.DATA_LOAD_REQUESTED,
  'Data:Loaded':                 CoreEvents.DATA_LOADED,
  'Data:LoadFailed':             CoreEvents.DATA_LOAD_FAILED,

  'Filter:Changed':              CoreEvents.FILTER_CHANGED,
  'Session:UserChanged':         CoreEvents.SESSION_USER_CHANGED,
  'Route:Changed':               CoreEvents.ROUTE_CHANGED,

  'Overlay:Open':                CoreEvents.OVERLAY_OPEN,
  'Overlay:Close':               CoreEvents.OVERLAY_CLOSE,
  'Modal:Open':                  CoreEvents.MODAL_OPEN,
  'Modal:Close':                 CoreEvents.MODAL_CLOSE,

  // Legacy → heutige Strings (Abfangen alter/emittierter Namen)
  'event_pageViewReady':         CoreEvents.PAGE_VIEW_READY,
  'page:viewReady':              CoreEvents.PAGE_VIEW_READY,
  'page:stateManagerReady':      CoreEvents.PAGE_STATE_MANAGER_READY,
  'event:dashboardTableBulit':   CoreEvents.DASHBOARD_TABLE_BUILT,   // Typo
  'dashboard:tableBuilt':        CoreEvents.DASHBOARD_TABLE_BUILT,   // alt kleingeschrieben Namespace
  'event:dashboardSectionRegister': CoreEvents.DASHBOARD_SECTIONS_REGISTER,
  'dashboard:sectionsRegister':  CoreEvents.DASHBOARD_SECTIONS_REGISTER,
};
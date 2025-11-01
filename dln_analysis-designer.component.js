/**
 * ANALYSIS DESIGNER MODULE
 * Modular, sandbox-conform relational analysis tool
 * 
 * @version 1.0.0
 * @feature Analysis Designer
 * @key analysis-designer
 */

(function(window) {
  'use strict';
  
  const FEATURE_KEY = 'analysis-designer';
  const FEATURE_NAME = 'Analysis Designer';
  const EVENT_PREFIX = 'ADS';
  const ROOT_CLASS = '.ads-root';

// ============================================================================
// MODULE STATE & LIFECYCLE
// ============================================================================

let moduleState = {
  root: null,
  config: null,
  refs: {},
  handlers: {},
  abortController: null,
  debounceTimer: null,
  dataTableInstance: null,
  chartInstance: null,
  schema: null,
  mockData: null,
  selectedFields: [],
  filters: [],
  metrics: [],
  mainTable: null,
  tableJoins: [],
  joinFieldByTable: {},
  xAxis: null,
  yAxis: null,
  chartType: 'bar',
  searchSelectedIndex: 0,
  currentContextColumn: null,
  lastAnalysisData: null,
  columnAggregations: {},
  filterLogic: 'AND',
  isDisposed: false
};

/**
 * PUBLIC API: Mount module
 * @param {HTMLElement} root - Root container element
 * @param {Object} cfg - Configuration object
 */
function mount(root, cfg = {}) {
  if (!root) {
    throw new Error('[analysis-designer] mount: root element required');
  }
  
  if (moduleState.root && !moduleState.isDisposed) {
    console.warn('[analysis-designer] Already mounted. Call dispose() first or use refresh()');
    return;
  }
  
  console.log('[analysis-designer] Mounting...');
  
  // Reset state
  moduleState = {
    root,
    config: mergeConfig(cfg),
    refs: {},
    handlers: {},
    abortController: null,
    debounceTimer: null,
    dataTableInstance: null,
    chartInstance: null,
    schema: null,
    mockData: null,
    selectedFields: [],
    filters: [],
    metrics: [],
    mainTable: null,
    tableJoins: [],
    joinFieldByTable: {},
    xAxis: null,
    yAxis: null,
    chartType: 'bar',
    searchSelectedIndex: 0,
    currentContextColumn: null,
    lastAnalysisData: null,
    columnAggregations: {},
    filterLogic: 'AND',
    isDisposed: false
  };
  
  // Capture DOM references
  captureDOMRefs();
  
// Populate initial data
  initializeData();
  
  // Initial UI update
  populateTablesList();
  
  // Setup drop zones
  setupDropZones();

    
  // Bind all event handlers
  bindEvents();
  
  // Hide results initially, show builder
  const resultsCard = moduleState.root.querySelector('.ads-results-card');
  if (resultsCard) {
    resultsCard.style.display = 'none';
  }
  
  const builderCard = moduleState.root.querySelector('.ads-card:has(.ads-table-builder)');
  if (builderCard) {
    builderCard.style.display = 'block';
  }
  
  console.log('[analysis-designer] Mounted successfully');
}

/**
 * PUBLIC API: Refresh configuration
 * @param {Object} cfg - New configuration to merge
 */
function refresh(cfg = {}) {
  if (!moduleState.root || moduleState.isDisposed) {
    console.warn('[analysis-designer] Cannot refresh: not mounted or disposed');
    return;
  }
  
  console.log('[analysis-designer] Refreshing configuration...');
  
  moduleState.config = mergeConfig({
    ...moduleState.config,
    ...partialCfg
  });
  
  // Re-initialize data if adapter changed
  if (partialCfg.data) {
    initializeData();
  }
  
  console.log('[analysis-designer] Refreshed');
}

/**
 * PUBLIC API: Dispose module
 * Cleanup all resources and event listeners
 */
function dispose() {
  if (moduleState.isDisposed) {
    console.warn('[analysis-designer] Already disposed');
    return;
  }
  
  console.log('[analysis-designer] Disposing...');
  
  // Abort any pending requests
  if (moduleState.abortController) {
    moduleState.abortController.abort();
    moduleState.abortController = null;
  }
  
  // Clear timers
  if (moduleState.debounceTimer) {
    clearTimeout(moduleState.debounceTimer);
    moduleState.debounceTimer = null;
  }
  
  // Destroy DataTable
  if (moduleState.dataTableInstance) {
    try {
      moduleState.dataTableInstance.destroy();
    } catch (e) {
      console.warn('[analysis-designer] DataTable cleanup warning:', e);
    }
    moduleState.dataTableInstance = null;
  }
  
  // Destroy Chart
  if (moduleState.chartInstance) {
    try {
      moduleState.chartInstance.destroy();
    } catch (e) {
      console.warn('[analysis-designer] Chart cleanup warning:', e);
    }
    moduleState.chartInstance = null;
  }
  
  // Unbind all events
  unbindEvents();
  
  // Clear references
  moduleState.refs = {};
  moduleState.root = null;
  moduleState.isDisposed = true;
  
  console.log('[analysis-designer] Disposed');
}

// ============================================================================
// CONFIGURATION & DEFAULTS
// ============================================================================

function getDefaultConfig() {
  return {
    fetch: {
      debounceMs: 250,
      timeoutMs: 10000
    },
    endpoints: {
      schema: '/AnalyseDesigner/schema.php',
      executeAnalysis: '/AnalyseDesigner/execute_analysis.php',
      presets: '/AnalyseDesigner/presets.php',
      presetSave: '/AnalyseDesigner/preset_save.php',
      presetUpdate: '/AnalyseDesigner/preset_update.php',
      presetDelete: '/AnalyseDesigner/preset_delete.php',
      export: '/AnalyseDesigner/export.php',
      getJoinPath: '/AnalyseDesigner/get_join_path.php'
    },
    data: {
      adapter: 'real',
      demoEndpoint: null,
      demoData: null,
      headers: {
        'Content-Type': 'application/json'
      }
    },
    ui: {
      showLogs: true,
      locale: 'de-CH'
    }
  };
}

function mergeConfig(cfg) {
  const defaults = getDefaultConfig();
  return {
    fetch: { ...defaults.fetch, ...(cfg.fetch || {}) },
    endpoints: { ...defaults.endpoints, ...(cfg.endpoints || {}) },
    data: { ...defaults.data, ...(cfg.data || {}) },
    ui: { ...defaults.ui, ...(cfg.ui || {}) }
  };
}
// ============================================================================
// DOM REFERENCES
// ============================================================================

function captureDOMRefs() {
  const root = moduleState.root;
  
  moduleState.refs = {
    // Search
    searchTrigger: root.querySelector('.ads-search-trigger'),
    searchModal: root.querySelector('.ads-search-modal'),
    searchInput: root.querySelector('.ads-search-input'),
    searchResults: root.querySelector('.ads-search-results'),
    
    // Tables List (Left Sidebar)
    tablesList: root.querySelector('.ads-tables-list'),
    
    // Table Builder
    tableBuilder: root.querySelector('.ads-table-builder'),
    tableBuilderEmpty: root.querySelector('.ads-table-builder-empty'),
    selectedFieldsList: root.querySelector('.ads-selected-fields-list'),
    
    // Filters
    filtersList: root.querySelector('.ads-filters-list'),
    addFilterBtn: root.querySelector('.ads-add-filter-btn'),
    filterLogicSwitch: root.querySelector('.ads-filter-logic-switch'),
    
    // Metrics
    metricsList: root.querySelector('.ads-metrics-list'),
    addMetricBtn: root.querySelector('.ads-add-metric-btn'),
    
    // Charts
// Charts
    chartTypeSelect: root.querySelector('.ads-chart-type-select'),
    xAxisSelect: root.querySelector('.ads-x-axis-select'),
    yAxisSelect: root.querySelector('.ads-y-axis-select'),
    chartCanvas: root.querySelector('.ads-chart-canvas'),
    xAxisDropZone: root.querySelector('[data-ref="xAxisDropZone"]'),
    yAxisDropZone: root.querySelector('[data-ref="yAxisDropZone"]'),
    
    // Actions
    analyzeBtn: root.querySelector('.ads-analyze-btn'),
    exportCsvBtn: root.querySelector('.ads-export-csv-btn'),
    exportExcelBtn: root.querySelector('.ads-export-excel-btn'),
    
    // Results
    resultsTable: root.querySelector('.ads-results-table'),
    resultsCount: root.querySelector('.ads-results-count')
  };
  
  console.log('[analysis-designer] DOM refs captured');
}

// ============================================================================
// DATA INITIALIZATION (ADAPTER PATTERN)
// ============================================================================

async function initializeData() {
  if (moduleState.config.data.adapter === 'demo') {
    loadDemoData();
  } else {
    console.log('[analysis-designer] Real adapter mode - loading schema...');
    await loadSchemaFromServer();
  }
  
  populateTablesList();
}

async function loadSchemaFromServer() {
  try {
    const response = await fetch(moduleState.config.endpoints.schema, {
      method: 'GET',
      headers: moduleState.config.data.headers,
      signal: AbortSignal.timeout(moduleState.config.fetch.timeoutMs)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    // Convert tables array to object keyed by table name
    moduleState.schema = {};
    if (result.tables && Array.isArray(result.tables)) {
      result.tables.forEach(table => {
        moduleState.schema[table.name] = table;
      });
    }
    
    console.log('[analysis-designer] Schema loaded:', Object.keys(moduleState.schema).length, 'tables');
    
    dispatchEvent('schema-loaded', { 
      tableCount: Object.keys(moduleState.schema).length 
    });
    
    return moduleState.schema;
    
  } catch (error) {
    console.error('[analysis-designer] Schema load failed:', error);
    showNotification('❌ Schema konnte nicht geladen werden. Fallback auf Demo-Daten.', 'error');
    
    // Fallback
    loadDemoData();
  }
}

function loadDemoData() {
  const { demoData, demoEndpoint } = moduleState.config.data;
  
  // If embedded demo data provided
  if (demoData) {
    moduleState.schema = demoData.schema;
    moduleState.mockData = demoData.records;
    console.log('[analysis-designer] Demo data loaded from config');
    populateMainTableSelect();
    return;
  }
  
  // Otherwise use built-in demo data
  moduleState.schema = getDemoSchema();
  moduleState.mockData = getDemoMockData();
  console.log('[analysis-designer] Built-in demo data loaded');
  populateMainTableSelect();
}

function getDemoSchema() {
  return {
    Account: {
      label: 'Account',
      icon: '🏢',
      fields: {
        Id: { label: 'ID', type: 'id' },
        Name: { label: 'Name', type: 'text' },
        Industry: { label: 'Branche', type: 'text' },
        AnnualRevenue: { label: 'Jahresumsatz', type: 'currency' },
        NumberOfEmployees: { label: 'Mitarbeiterzahl', type: 'number' },
        Type: { label: 'Typ', type: 'picklist' },
        CreatedDate: { label: 'Erstellt am', type: 'date' }
      },
      relations: {
        Contacts: { target: 'Contact', via: 'AccountId' },
        Opportunities: { target: 'Opportunity', via: 'AccountId' }
      }
    },
    Contact: {
      label: 'Kontakt',
      icon: '👤',
      fields: {
        Id: { label: 'ID', type: 'id' },
        FirstName: { label: 'Vorname', type: 'text' },
        LastName: { label: 'Nachname', type: 'text' },
        Email: { label: 'E-Mail', type: 'email' },
        Phone: { label: 'Telefon', type: 'phone' },
        Title: { label: 'Position', type: 'text' },
        AccountId: { label: 'Account ID', type: 'lookup' },
        CreatedDate: { label: 'Erstellt am', type: 'date' }
      },
      relations: {
        Account: { target: 'Account', via: 'AccountId' }
      }
    },
    Opportunity: {
      label: 'Opportunity',
      icon: '💼',
      fields: {
        Id: { label: 'ID', type: 'id' },
        Name: { label: 'Name', type: 'text' },
        Amount: { label: 'Betrag', type: 'currency' },
        StageName: { label: 'Phase', type: 'picklist' },
        CloseDate: { label: 'Abschlussdatum', type: 'date' },
        Probability: { label: 'Wahrscheinlichkeit', type: 'percent' },
        AccountId: { label: 'Account ID', type: 'lookup' },
        CreatedDate: { label: 'Erstellt am', type: 'date' }
      },
      relations: {
        Account: { target: 'Account', via: 'AccountId' }
      }
    }
  };
}

function getDemoMockData() {
  return {
    Account: [
      {
        Id: 'ACC001',
        Name: 'Tech Solutions AG',
        Industry: 'Technologie',
        AnnualRevenue: 5000000,
        NumberOfEmployees: 250,
        Type: 'Enterprise',
        CreatedDate: '2023-01-15'
      },
      {
        Id: 'ACC002',
        Name: 'Global Consulting GmbH',
        Industry: 'Beratung',
        AnnualRevenue: 8000000,
        NumberOfEmployees: 400,
        Type: 'Enterprise',
        CreatedDate: '2023-02-20'
      },
      {
        Id: 'ACC003',
        Name: 'Innovation Labs',
        Industry: 'Forschung',
        AnnualRevenue: 3000000,
        NumberOfEmployees: 150,
        Type: 'SMB',
        CreatedDate: '2023-03-10'
      }
    ],
    Contact: [
      {
        Id: 'CON001',
        FirstName: 'Max',
        LastName: 'Müller',
        Email: 'max.mueller@techsolutions.ch',
        Phone: '+41 44 123 45 67',
        Title: 'CEO',
        AccountId: 'ACC001',
        CreatedDate: '2023-01-20'
      },
      {
        Id: 'CON002',
        FirstName: 'Anna',
        LastName: 'Schmidt',
        Email: 'anna.schmidt@globalconsulting.ch',
        Phone: '+41 44 234 56 78',
        Title: 'CTO',
        AccountId: 'ACC002',
        CreatedDate: '2023-02-25'
      },
      {
        Id: 'CON003',
        FirstName: 'Peter',
        LastName: 'Weber',
        Email: 'peter.weber@innovationlabs.ch',
        Phone: '+41 44 345 67 89',
        Title: 'Director',
        AccountId: 'ACC003',
        CreatedDate: '2023-03-15'
      }
    ],
    Opportunity: [
      {
        Id: 'OPP001',
        Name: 'Cloud Migration Project',
        Amount: 450000,
        StageName: 'Negotiation',
        CloseDate: '2024-06-30',
        Probability: 75,
        AccountId: 'ACC001',
        CreatedDate: '2023-04-01'
      },
      {
        Id: 'OPP002',
        Name: 'Digital Transformation',
        Amount: 850000,
        StageName: 'Proposal',
        CloseDate: '2024-09-15',
        Probability: 60,
        AccountId: 'ACC002',
        CreatedDate: '2023-05-10'
      },
      {
        Id: 'OPP003',
        Name: 'AI Research Partnership',
        Amount: 320000,
        StageName: 'Qualification',
        CloseDate: '2024-12-31',
        Probability: 40,
        AccountId: 'ACC003',
        CreatedDate: '2023-06-20'
      }
    ]
  };
}

// ============================================================================
// EVENT BINDING (SINGLE BIND PATTERN)
// ============================================================================

function bindEvents() {
  const { refs } = moduleState;
  
  // Search Modal
  if (refs.searchTrigger) {
    refs.searchTrigger.addEventListener('click', handleSearchTriggerClick);
    moduleState.handlers.searchTriggerClick = handleSearchTriggerClick;
  }
  
  if (refs.searchModal) {
    refs.searchModal.addEventListener('click', handleSearchModalBackdropClick);
    moduleState.handlers.searchModalBackdropClick = handleSearchModalBackdropClick;
  }
  
  if (refs.searchInput) {
    refs.searchInput.addEventListener('input', handleSearchInput);
    refs.searchInput.addEventListener('keydown', handleSearchKeydown);
    moduleState.handlers.searchInput = handleSearchInput;
    moduleState.handlers.searchKeydown = handleSearchKeydown;
  }
  
  // Main Table Selection
  // Tables list events bound in populateTablesList()
  
  // Filter Logic Switch
  if (refs.filterLogicSwitch) {
    refs.filterLogicSwitch.addEventListener('change', handleFilterLogicChange);
    moduleState.handlers.filterLogicChange = handleFilterLogicChange;
  }
  
  // Add Filter
  if (refs.addFilterBtn) {
    refs.addFilterBtn.addEventListener('click', handleAddFilter);
    moduleState.handlers.addFilter = handleAddFilter;
  }
  
  // Add Metric
  if (refs.addMetricBtn) {
    refs.addMetricBtn.addEventListener('click', handleAddMetric);
    moduleState.handlers.addMetric = handleAddMetric;
  }
  
  // Chart Controls
  if (refs.chartTypeSelect) {
    refs.chartTypeSelect.addEventListener('change', handleChartTypeChange);
    moduleState.handlers.chartTypeChange = handleChartTypeChange;
  }
  
  if (refs.xAxisSelect) {
    refs.xAxisSelect.addEventListener('change', handleXAxisChange);
    moduleState.handlers.xAxisChange = handleXAxisChange;
  }
  
  if (refs.yAxisSelect) {
    refs.yAxisSelect.addEventListener('change', handleYAxisChange);
    moduleState.handlers.yAxisChange = handleYAxisChange;
  }
  
  // Actions
  if (refs.analyzeBtn) {
    refs.analyzeBtn.addEventListener('click', handleAnalyze);
    moduleState.handlers.analyze = handleAnalyze;
  }
  
  if (refs.exportCsvBtn) {
    refs.exportCsvBtn.addEventListener('click', handleExportCsv);
    moduleState.handlers.exportCsv = handleExportCsv;
  }
  
  if (refs.exportExcelBtn) {
    refs.exportExcelBtn.addEventListener('click', handleExportExcel);
    moduleState.handlers.exportExcel = handleExportExcel;
  }
  
  // Back to Builder Button
  const backBtn = moduleState.root.querySelector('.ads-back-to-builder-btn');
  if (backBtn) {
    backBtn.addEventListener('click', handleBackToBuilder);
    moduleState.handlers.backToBuilder = handleBackToBuilder;
  }
  
  // Global keyboard shortcuts
  document.addEventListener('keydown', handleGlobalKeydown);
  moduleState.handlers.globalKeydown = handleGlobalKeydown;
  
  console.log('[analysis-designer] Events bound');
}

function unbindEvents() {
  const { refs, handlers } = moduleState;
  
  if (refs.searchTrigger && handlers.searchTriggerClick) {
    refs.searchTrigger.removeEventListener('click', handlers.searchTriggerClick);
  }
  
  if (refs.searchModal && handlers.searchModalBackdropClick) {
    refs.searchModal.removeEventListener('click', handlers.searchModalBackdropClick);
  }
  
  if (refs.searchInput) {
    if (handlers.searchInput) {
      refs.searchInput.removeEventListener('input', handlers.searchInput);
    }
    if (handlers.searchKeydown) {
      refs.searchInput.removeEventListener('keydown', handlers.searchKeydown);
    }
  }
  
  if (refs.mainTableSelect && handlers.mainTableChange) {
    refs.mainTableSelect.removeEventListener('change', handlers.mainTableChange);
  }
  
  if (refs.filterLogicSwitch && handlers.filterLogicChange) {
    refs.filterLogicSwitch.removeEventListener('change', handlers.filterLogicChange);
  }
  
  if (refs.addFilterBtn && handlers.addFilter) {
    refs.addFilterBtn.removeEventListener('click', handlers.addFilter);
  }
  
  if (refs.addMetricBtn && handlers.addMetric) {
    refs.addMetricBtn.removeEventListener('click', handlers.addMetric);
  }
  
  if (refs.chartTypeSelect && handlers.chartTypeChange) {
    refs.chartTypeSelect.removeEventListener('change', handlers.chartTypeChange);
  }
  
  if (refs.xAxisSelect && handlers.xAxisChange) {
    refs.xAxisSelect.removeEventListener('change', handlers.xAxisChange);
  }
  
  if (refs.yAxisSelect && handlers.yAxisChange) {
    refs.yAxisSelect.removeEventListener('change', handlers.yAxisChange);
  }
  
  if (refs.analyzeBtn && handlers.analyze) {
    refs.analyzeBtn.removeEventListener('click', handlers.analyze);
  }
  
  if (refs.exportCsvBtn && handlers.exportCsv) {
    refs.exportCsvBtn.removeEventListener('click', handlers.exportCsv);
  }
  
  if (refs.exportExcelBtn && handlers.exportExcel) {
    refs.exportExcelBtn.removeEventListener('click', handlers.exportExcel);
  }
  
  if (handlers.backToBuilder) {
    const backBtn = moduleState.root.querySelector('.ads-back-to-builder-btn');
    if (backBtn) {
      backBtn.removeEventListener('click', handlers.backToBuilder);
    }
  }
  
  if (handlers.globalKeydown) {
    document.removeEventListener('keydown', handlers.globalKeydown);
  }
  
  moduleState.handlers = {};
  console.log('[analysis-designer] Events unbound');
}

// ============================================================================
// EVENT HANDLERS
// ============================================================================

function handleGlobalKeydown(e) {
  // Ctrl+K or Cmd+K to open search
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    openSearchModal();
  }
  
  // Escape to close search
  if (e.key === 'Escape' && moduleState.refs.searchModal.classList.contains('active')) {
    closeSearchModal();
  }
}

function handleSearchTriggerClick() {
  openSearchModal();
}

function handleSearchModalBackdropClick(e) {
  if (e.target === moduleState.refs.searchModal) {
    closeSearchModal();
  }
}

function handleSearchInput(e) {
  const query = e.target.value.trim().toLowerCase();
  
  // Debounce search
  if (moduleState.debounceTimer) {
    clearTimeout(moduleState.debounceTimer);
  }
  
  moduleState.debounceTimer = setTimeout(() => {
    performSearch(query);
  }, moduleState.config.fetch.debounceMs);
}

function handleSearchKeydown(e) {
  const items = moduleState.refs.searchResults.querySelectorAll('.ads-search-item');
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    moduleState.searchSelectedIndex = Math.min(moduleState.searchSelectedIndex + 1, items.length - 1);
    updateSearchSelection(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    moduleState.searchSelectedIndex = Math.max(moduleState.searchSelectedIndex - 1, 0);
    updateSearchSelection(items);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    const selected = items[moduleState.searchSelectedIndex];
    if (selected) {
      selected.click();
    }
  }
}

function handleMainTableChange(e) {
  const tableName = e.target.value;
  
  if (!tableName) {
    moduleState.mainTable = null;
    moduleState.selectedFields = [];
    moduleState.tableJoins = [];
    moduleState.joinFieldByTable = {};
    updateTableBuilder();
    return;
  }
  
  moduleState.mainTable = tableName;
  
  // Update badge
  if (moduleState.refs.mainTableBadge) {
    const table = moduleState.schema[tableName];
    moduleState.refs.mainTableBadge.textContent = `${table.icon} ${table.label}`;
    moduleState.refs.mainTableBadge.style.display = 'inline-flex';
  }
  
  console.log('[analysis-designer] Main table selected:', tableName);
  dispatchEvent('table-selected', { table: tableName });
}

function handleFilterLogicChange(e) {
  moduleState.filterLogic = e.target.checked ? 'OR' : 'AND';
  console.log('[analysis-designer] Filter logic:', moduleState.filterLogic);
}

function handleAddFilter() {
  if (!moduleState.mainTable) {
    showNotification('Bitte wähle zuerst eine Haupttabelle', 'warning');
    return;
  }
  
  const filter = {
    id: Date.now(),
    field: null,
    operator: 'equals',
    value: ''
  };
  
  moduleState.filters.push(filter);
  renderFilters();
}

function handleAddMetric() {
  if (!moduleState.mainTable) {
    showNotification('Bitte wähle zuerst eine Haupttabelle', 'warning');
    return;
  }
  
  const metric = {
    id: Date.now(),
    field: null,
    aggregation: 'COUNT',
    label: ''
  };
  
  moduleState.metrics.push(metric);
  renderMetrics();
}

function handleChartTypeChange(e) {
  moduleState.chartType = e.target.value;
  if (moduleState.lastAnalysisData) {
    renderChart();
  }
}

function handleXAxisChange(e) {
  const [table, field] = e.target.value.split('.');
  moduleState.xAxis = { table, field };
  if (moduleState.lastAnalysisData && moduleState.yAxis) {
    renderChart();
  }
}

function handleYAxisChange(e) {
  const [table, field] = e.target.value.split('.');
  moduleState.yAxis = { table, field };
  if (moduleState.lastAnalysisData && moduleState.xAxis) {
    renderChart();
  }
}

function handleAnalyze() {
  if (!moduleState.mainTable) {
    showNotification('Bitte wähle zuerst eine Haupttabelle', 'warning');
    return;
  }
  
  if (moduleState.selectedFields.length === 0) {
    showNotification('Bitte füge mindestens ein Feld hinzu', 'warning');
    return;
  }
  
  runAnalysis();
}

function handleExportCsv() {
  exportToCSV();
}

function handleExportExcel() {
  exportToExcel();
}

function handleBackToBuilder() {
  // Hide results and show builder
  const resultsCard = moduleState.root.querySelector('.ads-results-card');
  const builderCard = moduleState.root.querySelector('.ads-card:has(.ads-table-builder)');
  
  if (resultsCard) {
    resultsCard.style.display = 'none';
  }
  
  if (builderCard) {
    builderCard.style.display = 'block';
  }
  
  showNotification('Zurück zum Builder', 'info');
}

function handleBackToBuilder() {
  // Hide results and show builder
  const resultsCard = moduleState.root.querySelector('.ads-results-card');
  const builderCard = moduleState.root.querySelector('.ads-card:has(.ads-table-builder)');
  
  if (resultsCard) {
    resultsCard.style.display = 'none';
  }
  
  if (builderCard) {
    builderCard.style.display = 'block';
  }
  
  showNotification('ZurÃ¼ck zum Builder', 'info');
}

// ============================================================================
// SEARCH FUNCTIONALITY
// ============================================================================

function openSearchModal() {
  moduleState.refs.searchModal.classList.add('active');
  moduleState.refs.searchInput.value = '';
  moduleState.refs.searchInput.focus();
  moduleState.searchSelectedIndex = 0;
  performSearch('');
}

function closeSearchModal() {
  moduleState.refs.searchModal.classList.remove('active');
}

function performSearch(query) {
  if (!moduleState.schema) return;
  
  const results = [];
  
  // Search through tables and fields
  Object.keys(moduleState.schema).forEach(tableName => {
    const table = moduleState.schema[tableName];
    
    // Table matches
    if (!query || table.label.toLowerCase().includes(query) || tableName.toLowerCase().includes(query)) {
      results.push({
        type: 'table',
        table: tableName,
        icon: table.icon,
        label: table.label,
        meta: `${Object.keys(table.fields).length} Felder`
      });
    }
    
    // Field matches
    Object.keys(table.fields).forEach(fieldName => {
      const field = table.fields[fieldName];
      if (!query || field.label.toLowerCase().includes(query) || fieldName.toLowerCase().includes(query)) {
        results.push({
          type: 'field',
          table: tableName,
          field: fieldName,
          icon: getFieldIcon(field.type),
          label: field.label,
          meta: `${table.label} • ${field.type}`
        });
      }
    });
  });
  
  renderSearchResults(results.slice(0, 20));
}

function renderSearchResults(results) {
  const container = moduleState.refs.searchResults;
  
  if (results.length === 0) {
    container.innerHTML = '<div class="ads-search-empty">Keine Ergebnisse</div>';
    return;
  }
  
  let html = '<div class="ads-search-category">Tabellen & Felder</div>';
  
  results.forEach((result, index) => {
    const isSelected = index === moduleState.searchSelectedIndex ? 'selected' : '';
    html += `
      <div class="ads-search-item ${isSelected}" data-type="${result.type}" data-table="${result.table}" data-field="${result.field || ''}">
        <div class="ads-search-item-icon">${result.icon}</div>
        <div class="ads-search-item-content">
          <div class="ads-search-item-title">${result.label}</div>
          <div class="ads-search-item-meta">${result.meta}</div>
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Bind click handlers
  container.querySelectorAll('.ads-search-item').forEach(item => {
    item.addEventListener('click', handleSearchItemClick);
  });
}

function handleSearchItemClick(e) {
  const item = e.currentTarget;
  const type = item.dataset.type;
  const table = item.dataset.table;
  const field = item.dataset.field;
  
  if (type === 'field') {
    addFieldToBuilder(table, field);
  }
  
  closeSearchModal();
}

function updateSearchSelection(items) {
  items.forEach((item, index) => {
    if (index === moduleState.searchSelectedIndex) {
      item.classList.add('selected');
      item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      item.classList.remove('selected');
    }
  });
}

// ============================================================================
// TABLE BUILDER
// ============================================================================

function populateMainTableSelect() {
  // DEPRECATED - wird ersetzt durch populateTablesList()
  populateTablesList();
}

function populateTablesList() {
  const container = moduleState.root.querySelector('.ads-tables-list');
  if (!container || !moduleState.schema) return;
  
  let html = '';
  
  Object.keys(moduleState.schema).forEach(tableName => {
    const table = moduleState.schema[tableName];
    
    const isMainTable = moduleState.mainTable === tableName;
    const hasSelectedFields = moduleState.selectedFields.some(f => f.table === tableName);
    
    html += `
      <div class="ads-table-item ${hasSelectedFields ? 'active' : ''}" data-table="${tableName}">
        <div class="ads-table-header">
          <div class="ads-table-info">
            <span class="ads-table-icon">${table.icon || '📊'}</span>
            <span class="ads-main-table-star" data-table="${tableName}" title="Als Haupttabelle markieren">
              ${isMainTable ? '⭐' : '☆'}
            </span>
            <div>
              <span class="ads-table-name">${table.label || tableName}</span>
              <div class="ads-table-count">${Array.isArray(table.fields) ? table.fields.length : Object.keys(table.fields).length} Felder</div>
            </div>
          </div>
          <i class="bi bi-chevron-down ads-table-toggle"></i>
        </div>
        <div class="ads-table-fields">
          ${(table.fields || []).map(field => {
            const isSelected = moduleState.selectedFields.some(f => f.table === tableName && f.field === field.name);
            const isJoinField = moduleState.joinFieldByTable[tableName] === field.name;
            const isForeignKey = field.foreign || field.type === 'lookup';
            
            return `
            <div class="ads-field-item ${isForeignKey ? 'foreign-key' : ''}">
              <input type="checkbox" 
                     data-table="${tableName}" 
                     data-field="${field.name}"
                     data-type="${field.type}"
                     id="field_${tableName}_${field.name}"
                     ${isSelected ? 'checked' : ''}>
              <label for="field_${tableName}_${field.name}" class="ads-field-label">
                ${field.label || field.name}
                ${field.type === 'id' ? '<span class="ads-field-key-icon">🔑</span>' : ''}
                ${isForeignKey ? '<span class="ads-field-key-icon">🔗</span>' : ''}
              </label>
              <span class="ads-field-type ${field.type}">${field.type}</span>
              ${tableName !== moduleState.mainTable ? `
                <span class="ads-link-toggle ${isJoinField ? 'active' : ''}"
                      title="Als Join-Feld verwenden"
                      data-table="${tableName}"
                      data-field="${field.name}">
                  <i class="bi bi-link-45deg"></i>
                </span>
              ` : ''}
            </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Bind events
  bindTablesListEvents();
}

function bindTablesListEvents() {
  const container = moduleState.root.querySelector('.ads-tables-list');
  if (!container) return;
  
  // Toggle table expand/collapse
  container.querySelectorAll('.ads-table-header').forEach(header => {
    header.addEventListener('click', (e) => {
      // Ignore clicks on star and checkbox
      if (e.target.closest('.ads-main-table-star')) return;
      if (e.target.classList.contains('ads-table-checkbox')) return;
      
      const item = header.closest('.ads-table-item');
      item.classList.toggle('expanded');
    });
  });
  
  // Main table star click
  container.querySelectorAll('.ads-main-table-star').forEach(star => {
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      const tableName = star.dataset.table;
      setMainTable(tableName);
    });
  });
  
  // Link toggle click (for join fields)
  container.querySelectorAll('.ads-link-toggle').forEach(toggle => {
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const tableName = toggle.dataset.table;
      const fieldName = toggle.dataset.field;
      toggleJoinField(tableName, fieldName);
    });
  });
  
  // Table checkbox - select all fields
  container.querySelectorAll('.ads-table-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const tableName = e.target.dataset.table;
      const item = e.target.closest('.ads-table-item');
      const fieldCheckboxes = item.querySelectorAll('.ads-field-item input[type="checkbox"]');
      
      fieldCheckboxes.forEach(cb => {
        cb.checked = e.target.checked;
        if (e.target.checked) {
          addFieldToBuilder(cb.dataset.table, cb.dataset.field);
        } else {
          removeFieldFromBuilder(cb.dataset.table, cb.dataset.field);
        }
      });
    });
  });
  
  // Field checkboxes
  container.querySelectorAll('.ads-field-item input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      const tableName = e.target.dataset.table;
      const fieldName = e.target.dataset.field;
      const fieldType = e.target.dataset.type;
      
      if (e.target.checked) {
        addFieldToBuilder(tableName, fieldName);
      } else {
        removeFieldFromBuilder(tableName, fieldName);
      }
      
      // Update table active state
      const item = e.target.closest('.ads-table-item');
      const hasFields = moduleState.selectedFields.some(f => f.table === tableName);
      if (hasFields) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
      
      // Re-render selected fields
      updateTableBuilder();
    });
  });
}

function setMainTable(tableName) {
  if (moduleState.mainTable === tableName) {
    // Already main table
    return;
  }
  
  moduleState.mainTable = tableName;
  
  // Clear existing joins
  moduleState.joinFieldByTable = {};
  moduleState.tableJoins = [];
  
  // Re-populate tables list to update stars
  populateTablesList();
  
  showNotification(`⭐ ${tableName} als Haupttabelle gesetzt`, 'success');
  
  dispatchEvent('main-table-changed', { tableName });
}

function toggleJoinField(tableName, fieldName) {
  if (!moduleState.mainTable) {
    showNotification('⚠️ Bitte wähle zuerst eine Haupttabelle', 'warning');
    return;
  }
  
  if (tableName === moduleState.mainTable) {
    showNotification('⚠️ Kann kein Join-Feld für die Haupttabelle setzen', 'warning');
    return;
  }
  
  // Toggle join field
  if (moduleState.joinFieldByTable[tableName] === fieldName) {
    // Remove join
    delete moduleState.joinFieldByTable[tableName];
    const joinIndex = moduleState.tableJoins.indexOf(tableName);
    if (joinIndex !== -1) {
      moduleState.tableJoins.splice(joinIndex, 1);
    }
    showNotification(`🔗 Join zu ${tableName} entfernt`, 'info');
  } else {
    // Set join
    moduleState.joinFieldByTable[tableName] = fieldName;
    if (!moduleState.tableJoins.includes(tableName)) {
      moduleState.tableJoins.push(tableName);
    }
    showNotification(`🔗 Join-Feld: ${tableName}.${fieldName}`, 'success');
  }
  
  // Re-populate to update UI
  populateTablesList();
  
  dispatchEvent('join-changed', { tableName, fieldName });
}

function addFieldToBuilder(tableName, fieldName) {
  if (!moduleState.mainTable) {
    showNotification('Bitte wähle zuerst eine Haupttabelle', 'warning');
    return;
  }
  
  // Check if field already added
  const exists = moduleState.selectedFields.some(
    f => f.table === tableName && f.field === fieldName
  );
  
  if (exists) {
    showNotification('Feld bereits hinzugefügt', 'info');
    return;
  }
  
  // Handle join if different table
  if (tableName !== moduleState.mainTable) {
    handleJoin(tableName);
  }
  
  const table = moduleState.schema[tableName];
  const fieldsArray = table.fields || [];
  const field = fieldsArray.find(f => f.name === fieldName);
  
  if (!field) {
    console.error('[analysis-designer] Field not found:', tableName, fieldName);
    return;
  }
  
  moduleState.selectedFields.push({
    table: tableName,
    field: fieldName,
    label: field.label || fieldName,
    type: field.type || 'text'
  });
  
  updateTableBuilder();
  updateChartAxisOptions();
  updateLivePreview();
  
  dispatchEvent('field-added', { table: tableName, field: fieldName });
}

function handleJoin(targetTable) {
  // Check if already joined
  if (moduleState.tableJoins.includes(targetTable)) {
    return;
  }
  
  // Find join path
  const mainSchema = moduleState.schema[moduleState.mainTable];
  const targetSchema = moduleState.schema[targetTable];
  
  let joinField = null;
  
  // Check if main table has relation to target
  if (mainSchema.relations && mainSchema.relations[targetTable]) {
    joinField = mainSchema.relations[targetTable].via;
  }
  // Check if target has relation to main
  else if (targetSchema.relations && targetSchema.relations[moduleState.mainTable]) {
    joinField = targetSchema.relations[moduleState.mainTable].via;
  }
  
  if (joinField) {
    moduleState.tableJoins.push(targetTable);
    moduleState.joinFieldByTable[targetTable] = joinField;
    console.log('[analysis-designer] Joined table:', targetTable, 'via', joinField);
  }
}

function updateTableBuilder() {
  if (!moduleState.refs.selectedFieldsList) return;
  
  if (moduleState.selectedFields.length === 0) {
    moduleState.refs.tableBuilderEmpty.style.display = 'flex';
    moduleState.refs.selectedFieldsList.innerHTML = '';
    return;
  }
  
  moduleState.refs.tableBuilderEmpty.style.display = 'none';
  
  // Build table HTML
  let html = '<table class="ads-builder-table"><thead><tr>';
  
  // Headers
  moduleState.selectedFields.forEach((field, index) => {
    const table = moduleState.schema[field.table];
    html += `
      <th data-index="${index}">
        <div class="ads-builder-column-header">
          <span class="ads-builder-column-icon">${table.icon || '📊'}</span>
          <div class="ads-builder-column-info">
            <div class="ads-builder-column-name">${field.label || field.field}</div>
            <div class="ads-builder-column-meta">${table.label || field.table}</div>
          </div>
          <button class="ads-builder-column-remove" data-index="${index}" title="Spalte entfernen">
            <i class="bi bi-x"></i>
          </button>
        </div>
      </th>
    `;
  });
  
  html += '</tr></thead><tbody><tr>';
  
  // Sample row (empty for now)
  moduleState.selectedFields.forEach(() => {
    html += '<td><span class="ads-builder-sample">—</span></td>';
  });
  
  html += '</tr></tbody></table>';
  
  moduleState.refs.selectedFieldsList.innerHTML = html;
  
  // Bind remove buttons
  moduleState.refs.selectedFieldsList.querySelectorAll('.ads-builder-column-remove').forEach(btn => {
    btn.addEventListener('click', handleRemoveField);
  });
}

function handleRemoveField(e) {
  const index = parseInt(e.currentTarget.dataset.index);
  const removed = moduleState.selectedFields.splice(index, 1)[0];
  
  updateTableBuilder();
  updateChartAxisOptions();
  updateLivePreview();
  
  dispatchEvent('field-removed', { table: removed.table, field: removed.field });
}

// ============================================================================
// FILTERS
// ============================================================================

function renderFilters() {
  if (!moduleState.refs.filtersList) return;
  
  if (moduleState.filters.length === 0) {
    moduleState.refs.filtersList.innerHTML = '<div class="ads-empty-state">Keine Filter hinzugefügt</div>';
    return;
  }
  
  let html = '';
  moduleState.filters.forEach((filter, index) => {
    html += `
      <div class="ads-filter-row" data-index="${index}">
        <select class="ads-filter-field" data-index="${index}">
          <option value="">Feld wählen...</option>
          ${getFieldOptions(filter.field)}
        </select>
        <select class="ads-filter-operator" data-index="${index}">
          <option value="equals" ${filter.operator === 'equals' ? 'selected' : ''}>Gleich</option>
          <option value="not_equals" ${filter.operator === 'not_equals' ? 'selected' : ''}>Ungleich</option>
          <option value="contains" ${filter.operator === 'contains' ? 'selected' : ''}>Enthält</option>
          <option value="greater" ${filter.operator === 'greater' ? 'selected' : ''}>Größer als</option>
          <option value="less" ${filter.operator === 'less' ? 'selected' : ''}>Kleiner als</option>
        </select>
        <input type="text" class="ads-filter-value" placeholder="Wert" value="${filter.value}" data-index="${index}">
        <button class="ads-filter-remove" data-index="${index}" aria-label="Filter entfernen">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
  });
  
  moduleState.refs.filtersList.innerHTML = html;
  
  // Bind handlers
  moduleState.refs.filtersList.querySelectorAll('.ads-filter-field').forEach(select => {
    select.addEventListener('change', handleFilterFieldChange);
  });
  
  moduleState.refs.filtersList.querySelectorAll('.ads-filter-operator').forEach(select => {
    select.addEventListener('change', handleFilterOperatorChange);
  });
  
  moduleState.refs.filtersList.querySelectorAll('.ads-filter-value').forEach(input => {
    input.addEventListener('input', handleFilterValueChange);
  });
  
  moduleState.refs.filtersList.querySelectorAll('.ads-filter-remove').forEach(btn => {
    btn.addEventListener('click', handleRemoveFilter);
  });
}

function handleFilterFieldChange(e) {
  const index = parseInt(e.target.dataset.index);
  moduleState.filters[index].field = e.target.value;
}

function handleFilterOperatorChange(e) {
  const index = parseInt(e.target.dataset.index);
  moduleState.filters[index].operator = e.target.value;
}

function handleFilterValueChange(e) {
  const index = parseInt(e.target.dataset.index);
  moduleState.filters[index].value = e.target.value;
}

function handleRemoveFilter(e) {
  const index = parseInt(e.currentTarget.dataset.index);
  moduleState.filters.splice(index, 1);
  renderFilters();
}

function getFieldOptions(selectedValue) {
  let html = '';
  
  if (!moduleState.mainTable) return html;
  
  // Main table fields
  const mainTable = moduleState.schema[moduleState.mainTable];
  Object.keys(mainTable.fields).forEach(fieldName => {
    const field = mainTable.fields[fieldName];
    const value = `${moduleState.mainTable}.${fieldName}`;
    const selected = value === selectedValue ? 'selected' : '';
    html += `<option value="${value}" ${selected}>${mainTable.label} - ${field.label}</option>`;
  });
  
  // Joined table fields
  moduleState.tableJoins.forEach(tableName => {
    const table = moduleState.schema[tableName];
    Object.keys(table.fields).forEach(fieldName => {
      const field = table.fields[fieldName];
      const value = `${tableName}.${fieldName}`;
      const selected = value === selectedValue ? 'selected' : '';
      html += `<option value="${value}" ${selected}>${table.label} - ${field.label}</option>`;
    });
  });
  
  return html;
}

// ============================================================================
// METRICS
// ============================================================================

function renderMetrics() {
  if (!moduleState.refs.metricsList) return;
  
  if (moduleState.metrics.length === 0) {
    moduleState.refs.metricsList.innerHTML = '<div class="ads-empty-state">Keine Metriken hinzugefügt</div>';
    return;
  }
  
  let html = '';
  moduleState.metrics.forEach((metric, index) => {
    html += `
      <div class="ads-metric-row" data-index="${index}">
        <select class="ads-metric-field" data-index="${index}">
          <option value="">Feld wählen...</option>
          ${getFieldOptions(metric.field)}
        </select>
        <select class="ads-metric-aggregation" data-index="${index}">
          <option value="COUNT" ${metric.aggregation === 'COUNT' ? 'selected' : ''}>Anzahl</option>
          <option value="SUM" ${metric.aggregation === 'SUM' ? 'selected' : ''}>Summe</option>
          <option value="AVG" ${metric.aggregation === 'AVG' ? 'selected' : ''}>Durchschnitt</option>
          <option value="MIN" ${metric.aggregation === 'MIN' ? 'selected' : ''}>Minimum</option>
          <option value="MAX" ${metric.aggregation === 'MAX' ? 'selected' : ''}>Maximum</option>
        </select>
        <input type="text" class="ads-metric-label" placeholder="Label (optional)" value="${metric.label}" data-index="${index}">
        <button class="ads-metric-remove" data-index="${index}" aria-label="Metrik entfernen">
          <i class="bi bi-trash"></i>
        </button>
      </div>
    `;
  });
  
  moduleState.refs.metricsList.innerHTML = html;
  
  // Bind handlers
  moduleState.refs.metricsList.querySelectorAll('.ads-metric-field').forEach(select => {
    select.addEventListener('change', handleMetricFieldChange);
  });
  
  moduleState.refs.metricsList.querySelectorAll('.ads-metric-aggregation').forEach(select => {
    select.addEventListener('change', handleMetricAggregationChange);
  });
  
  moduleState.refs.metricsList.querySelectorAll('.ads-metric-label').forEach(input => {
    input.addEventListener('input', handleMetricLabelChange);
  });
  
  moduleState.refs.metricsList.querySelectorAll('.ads-metric-remove').forEach(btn => {
    btn.addEventListener('click', handleRemoveMetric);
  });
}

function handleMetricFieldChange(e) {
  const index = parseInt(e.target.dataset.index);
  moduleState.metrics[index].field = e.target.value;
}

function handleMetricAggregationChange(e) {
  const index = parseInt(e.target.dataset.index);
  moduleState.metrics[index].aggregation = e.target.value;
}

function handleMetricLabelChange(e) {
  const index = parseInt(e.target.dataset.index);
  moduleState.metrics[index].label = e.target.value;
}

function handleRemoveMetric(e) {
  const index = parseInt(e.currentTarget.dataset.index);
  moduleState.metrics.splice(index, 1);
  renderMetrics();
}

// ============================================================================
// CHART CONTROLS
// ============================================================================

function updateLivePreview() {
  // Live Preview verstecken bis Analyse ausgeführt wird
  // Diese Funktion macht nichts - Preview wird nur nach runAnalysis() angezeigt
  console.log('[analysis-designer] Live preview disabled - results shown after analysis');
}

function updateChartAxisOptions() {
  if (!moduleState.refs.xAxisSelect || !moduleState.refs.yAxisSelect) return;
  
  if (moduleState.selectedFields.length === 0) {
    moduleState.refs.xAxisSelect.innerHTML = '<option value="">Keine Felder verfügbar</option>';
    moduleState.refs.yAxisSelect.innerHTML = '<option value="">Keine Felder verfügbar</option>';
    return;
  }
  
  let html = '<option value="">Wähle eine Achse...</option>';
  
  moduleState.selectedFields.forEach(field => {
    const table = moduleState.schema[field.table];
    const value = `${field.table}.${field.field}`;
    html += `<option value="${value}">${table.label} - ${field.label}</option>`;
  });
  
  moduleState.refs.xAxisSelect.innerHTML = html;
  moduleState.refs.yAxisSelect.innerHTML = html;
}

// ============================================================================
// ANALYSIS EXECUTION
// ============================================================================

function runAnalysis() {
  console.log('[analysis-designer] Running analysis...');
  
  // Show loading state
  setLoadingState(true);
  
  // Build query
  const query = {
    mainTable: moduleState.mainTable,
    fields: moduleState.selectedFields,
    filters: moduleState.filters,
    metrics: moduleState.metrics,
    joins: moduleState.tableJoins,
    joinFields: moduleState.joinFieldByTable
  };
  
  // Execute analysis based on adapter
  if (moduleState.config.data.adapter === 'demo') {
    executeDemoAnalysis(query);
  } else {
    executeRealAnalysis(query);
  }
}

function executeDemoAnalysis(query) {
  // Simulate analysis with mock data
  setTimeout(() => {
    const results = performMockAnalysis(query);
    moduleState.lastAnalysisData = results;
    
    renderResults(results);
    setLoadingState(false);
    
    showNotification('✅ Analyse erfolgreich durchgeführt', 'success');
    
    dispatchEvent('analysis-complete', { 
      rowCount: results.length,
      query 
    });
  }, 500);
}

async function executeRealAnalysis(query) {
  if (moduleState.abortController) {
    moduleState.abortController.abort();
  }
  
  moduleState.abortController = new AbortController();
  
  const endpoint = moduleState.config.endpoints.executeAnalysis;
  const headers = moduleState.config.data.headers;
  const timeout = moduleState.config.fetch.timeoutMs;
  
  const timeoutId = setTimeout(() => {
    moduleState.abortController.abort();
  }, timeout);
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        mainTable: query.mainTable,
        selectedFields: query.fields,
        filters: query.filters,
        joins: Object.keys(query.joinFields || {}).map(targetTable => ({
          from: query.mainTable,
          to: targetTable,
          via: query.joinFields[targetTable]
        })),
        metrics: query.metrics || [],
        columnAggregations: moduleState.columnAggregations || {},
        limit: 1000,
        offset: 0
      }),
      signal: moduleState.abortController.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Analyse fehlgeschlagen');
    }
    
    moduleState.lastAnalysisData = result.data;
    renderResults(result.data);
    setLoadingState(false);
    
    const execTime = result.metadata?.executionTime ? ` in ${result.metadata.executionTime}s` : '';
    showNotification(`✅ ${result.data.length} Ergebnisse${execTime}`, 'success');
    
    dispatchEvent('analysis-complete', { 
      rowCount: result.data.length,
      executionTime: result.metadata?.executionTime,
      query 
    });
    
    if (window.EventBus && window.Events) {
      window.EventBus.emit(window.Events.DATA_REFRESHED, {
        source: 'analysis-designer',
        rowCount: result.data.length
      });
    }
    
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.log('[analysis-designer] Request aborted');
    } else {
      console.error('[analysis-designer] Analysis failed:', error);
      showNotification('❌ Analyse fehlgeschlagen: ' + error.message, 'error');
      setLoadingState(false);
    }
  }
}

function performMockAnalysis(query) {
  const mainData = moduleState.mockData[query.mainTable];
  let results = [...mainData];
  
  // Apply joins
  query.joins.forEach(joinTable => {
    const joinField = query.joinFields[joinTable];
    const joinData = moduleState.mockData[joinTable];
    
    results = results.map(row => {
      const joined = joinData.find(j => j.Id === row[joinField]);
      if (joined) {
        return { ...row, ...joined };
      }
      return row;
    });
  });
  
  // Apply filters
  if (query.filters.length > 0) {
    results = results.filter(row => {
      const checks = query.filters.map(filter => {
        if (!filter.field) return true;
        
        const [table, field] = filter.field.split('.');
        const value = row[field];
        const filterValue = filter.value;
        
        switch (filter.operator) {
          case 'equals':
            return String(value) === String(filterValue);
          case 'not_equals':
            return String(value) !== String(filterValue);
          case 'contains':
            return String(value).toLowerCase().includes(String(filterValue).toLowerCase());
          case 'greater':
            return parseFloat(value) > parseFloat(filterValue);
          case 'less':
            return parseFloat(value) < parseFloat(filterValue);
          default:
            return true;
        }
      });
      
      if (moduleState.filterLogic === 'AND') {
        return checks.every(c => c);
      } else {
        return checks.some(c => c);
      }
    });
  }
  
  // Project selected fields
  results = results.map(row => {
    const projected = {};
    query.fields.forEach(field => {
      const key = `${field.table}.${field.field}`;
      projected[key] = row[field.field];
    });
    return projected;
  });
  
  return results;
}

// ============================================================================
// RESULTS RENDERING
// ============================================================================

function setLoadingState(loading) {
  if (moduleState.refs.analyzeBtn) {
    moduleState.refs.analyzeBtn.disabled = loading;
    moduleState.refs.analyzeBtn.innerHTML = loading
      ? '<i class="bi bi-arrow-repeat" style="animation: spin 1s linear infinite"></i> Analysiere...'
      : '<i class="bi bi-play-fill"></i> Analyse ausführen';
  }
}

function calculateMetricsValues(data) {
  const metricsValues = [];

  moduleState.metrics.forEach(metric => {
    if (!metric.field) return;

    const fieldKey = metric.field;
    const values = data.map(row => {
      const val = row[fieldKey];
      return parseFloat(val) || 0;
    }).filter(v => !isNaN(v));

    let result = 0;
    let label = metric.label || fieldKey;

    switch (metric.aggregation) {
      case 'COUNT':
        result = data.length;
        label = metric.label || `Anzahl ${fieldKey}`;
        break;
      case 'SUM':
        result = values.reduce((sum, v) => sum + v, 0);
        label = metric.label || `Summe ${fieldKey}`;
        break;
      case 'AVG':
        result = values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
        label = metric.label || `Durchschnitt ${fieldKey}`;
        break;
      case 'MIN':
        result = values.length > 0 ? Math.min(...values) : 0;
        label = metric.label || `Minimum ${fieldKey}`;
        break;
      case 'MAX':
        result = values.length > 0 ? Math.max(...values) : 0;
        label = metric.label || `Maximum ${fieldKey}`;
        break;
      default:
        result = 0;
    }

    metricsValues.push({
      label: label,
      value: result,
      aggregation: metric.aggregation,
      fieldKey: fieldKey
    });
  });

  return metricsValues;
}

function renderMetricsDisplay(metricsValues) {
  let metricsDisplay = moduleState.root.querySelector('.ads-metrics-display');

  // Create metrics display container if it doesn't exist
  if (!metricsDisplay) {
    const resultsWrapper = moduleState.root.querySelector('.ads-results-wrapper');
    if (!resultsWrapper) return;

    metricsDisplay = document.createElement('div');
    metricsDisplay.className = 'ads-metrics-display';
    resultsWrapper.parentElement.insertBefore(metricsDisplay, resultsWrapper);
  }

  if (metricsValues.length === 0) {
    metricsDisplay.style.display = 'none';
    return;
  }

  metricsDisplay.style.display = 'grid';

  let html = '';
  metricsValues.forEach(metric => {
    const formattedValue = new Intl.NumberFormat('de-CH', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(metric.value);

    html += `
      <div class="ads-metric-card">
        <div class="ads-metric-label">${metric.label}</div>
        <div class="ads-metric-value">${formattedValue}</div>
      </div>
    `;
  });

  metricsDisplay.innerHTML = html;
}

function renderResults(data) {
  if (!moduleState.refs.resultsTable) return;

  // Calculate and render metrics
  if (moduleState.metrics.length > 0) {
    const metricsValues = calculateMetricsValues(data);
    renderMetricsDisplay(metricsValues);
  } else {
    // Clear metrics display if no metrics
    const metricsDisplay = moduleState.root.querySelector('.ads-metrics-display');
    if (metricsDisplay) {
      metricsDisplay.style.display = 'none';
    }
  }

  // Update count
  if (moduleState.refs.resultsCount) {
    moduleState.refs.resultsCount.textContent = `${data.length} Ergebnisse`;
  }

  // Destroy existing DataTable
  if (moduleState.dataTableInstance) {
    moduleState.dataTableInstance.destroy();
    moduleState.dataTableInstance = null;
  }
  
  // Build columns
  const columns = moduleState.selectedFields.map(field => ({
    title: `${moduleState.schema[field.table].label} - ${field.label}`,
    data: `${field.table}.${field.field}`,
    render: (data, type, row) => {
      if (field.type === 'currency') {
        return new Intl.NumberFormat('de-CH', { 
          style: 'currency', 
          currency: 'CHF' 
        }).format(data || 0);
      } else if (field.type === 'number') {
        return new Intl.NumberFormat('de-CH').format(data || 0);
      } else if (field.type === 'date') {
        return new Date(data).toLocaleDateString('de-CH');
      } else if (field.type === 'percent') {
        return `${data || 0}%`;
      }
      return data || '';
    }
  }));
  
  // Destroy existing DataTable instance
  if (moduleState.dataTableInstance) {
    try {
      if (moduleState.dataTableInstance.dt) {
        moduleState.dataTableInstance.dt.destroy(true);
      } else {
        moduleState.dataTableInstance.destroy(true);
      }
    } catch (e) {
      console.warn('[analysis-designer] DataTable destroy failed:', e);
    }
    moduleState.dataTableInstance = null;
  }
  
// Initialize via UniversalDataTable Controller
  if (window.UniversalDataTable) {
    console.log('[analysis-designer] Using UniversalDataTable');
    moduleState.dataTableInstance = new window.UniversalDataTable('.ads-results-table', {
      data: data,
      columns: columns,
      
      options: {
        pageLength: 25,
        lengthMenu: [10, 25, 50, 100],
        order: [[0, 'asc']],
        scrollX: true,
        autoWidth: false,
        
        language: {
          search: 'Suchen:',
          lengthMenu: '_MENU_ Einträge pro Seite',
          info: '_START_ bis _END_ von _TOTAL_ Einträgen',
          infoEmpty: '0 Einträge',
          infoFiltered: '(gefiltert von _MAX_ Einträgen)',
          paginate: {
            first: 'Erste',
            last: 'Letzte',
            next: 'Nächste',
            previous: 'Vorherige'
          },
          emptyTable: 'Keine Daten verfügbar',
          zeroRecords: 'Keine passenden Einträge gefunden'
        }
      },
      
      onInit: (dt) => {
        console.log('[analysis-designer] DataTable initialized with', dt.rows().count(), 'rows');
        
        dispatchEvent('datatable-ready', {
          rowCount: dt.rows().count()
        });
        
        // Make headers draggable and add context menu
        makeHeadersDraggable();
        // Make table cells draggable
        makeTableCellsDraggable();
        // Setup double-click for quick filter
        setupTableDoubleClick();
        
        console.log('[analysis-designer] Drag and drop setup complete');
      }
    });
  } else if (typeof DataTable !== 'undefined') {
    // Fallback: Direct DataTable if UniversalDataTable not available
    console.warn('[analysis-designer] UniversalDataTable not found, using DataTable directly');
    moduleState.dataTableInstance = new DataTable(moduleState.refs.resultsTable, {
      data: data,
      columns: columns,
      pageLength: 25,
      lengthMenu: [10, 25, 50, 100],
      language: {
        url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/de-DE.json'
      }
    });
    
    // Make headers and cells draggable (even in fallback mode)
    setTimeout(() => {
      console.log('[analysis-designer] Initializing drag & drop (fallback mode)');
      makeHeadersDraggable();
      makeTableCellsDraggable();
      setupTableDoubleClick();
    }, 500);
  }
  
  // Update chart if axes selected
  if (moduleState.xAxis && moduleState.yAxis) {
    renderChart();
  }
  
  // Show results section after analysis
  const resultsCard = moduleState.root.querySelector('.ads-results-card');
  if (resultsCard) {
    resultsCard.style.display = 'block';
  }
  
  // Hide builder card
  const builderCard = moduleState.root.querySelector('.ads-card:has(.ads-table-builder)');
  if (builderCard) {
    builderCard.style.display = 'none';
  }
}

function makeHeadersDraggable() {
  setTimeout(() => {
    const table = moduleState.refs.resultsTable;
    if (!table) {
      console.warn('[drag] resultsTable not found');
      return;
    }

    const thead = table.querySelector('thead');
    if (!thead) {
      console.warn('[drag] thead not found');
      return;
    }

    const headers = Array.from(thead.querySelectorAll('th'));
    const selectedFields = moduleState.selectedFields;

    console.log(`[drag] Making ${headers.length} headers draggable`);

    headers.forEach((header, idx) => {
      header.draggable = true;

      if (selectedFields[idx]) {
        header.dataset.col = `${selectedFields[idx].table}.${selectedFields[idx].field}`;
      }

      header.style.position = 'relative';
      header.style.overflow = 'visible';
      header.style.paddingRight = '2.8rem';

      if (!header.dataset.behavior) header.dataset.behavior = 'none';
      if (!header.dataset.view) header.dataset.view = 'right';
      if (!header.dataset.linkTemplate) header.dataset.linkTemplate = '';

      const hint = document.createElement('span');
      hint.className = 'drag-hint';
      hint.textContent = '⋮⋮';
      hint.style.position = 'absolute';
      hint.style.top = '0.5rem';
      hint.style.right = '0.6rem';
      hint.style.lineHeight = '1';
      hint.style.userSelect = 'none';
      hint.style.pointerEvents = 'none';
      hint.style.opacity = '0.4';
      hint.style.transition = 'opacity 0.2s';
      header.appendChild(hint);

      header.addEventListener('dragstart', (e) => {
        console.log('[drag] Header drag start:', header.dataset.col);
        const columnKey = header.dataset.col;
        const field = columnKey ? selectedFields.find(f => `${f.table}.${f.field}` === columnKey) : null;
        if (!field) {
          console.warn('[drag] Invalid field for drag');
          showNotification('⚠️ Ungültiges Drag-&-Drop-Objekt.', 'warning');
          return;
        }
        e.dataTransfer.setData('application/json', JSON.stringify(field));
        e.dataTransfer.effectAllowed = 'copy';
        header.classList.add('dragging');
      });

      header.addEventListener('dragend', () => {
        header.classList.remove('dragging');
      });

      header.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const columnKey = header.dataset.col;
        const field = columnKey ? selectedFields.find(f => `${f.table}.${f.field}` === columnKey) : null;
        if (field) {
          showHeaderContextMenu(e.pageX, e.pageY, field, header);
        }
      });
    });

    thead.addEventListener('contextmenu', (ev) => {
      const header = ev.target.closest('th');
      if (!header) return;
      ev.preventDefault();
      const columnKey = header.dataset.col;
      const field = columnKey ? selectedFields.find(f => `${f.table}.${f.field}` === columnKey) : null;
      if (field) {
        showHeaderContextMenu(ev.pageX, ev.pageY, field, header);
      }
    });

    const tbody = table.querySelector('tbody');
    if (tbody) {
      tbody.addEventListener('click', (e) => {
        const cell = e.target.closest('td');
        if (!cell) return;
        const rowEl = cell.parentElement;
        const colIndex = cell.cellIndex;
        const header = headers[colIndex];
        if (!header) return;

        const behavior = header.dataset.behavior || 'none';
        if (behavior === 'none') return;

        const rowObj = {};
        [...rowEl.children].forEach((td, i) => {
          const key = headers[i]?.dataset?.col;
          if (key) rowObj[key] = td.textContent.trim();
        });

        if (behavior === 'datalink') {
          const tpl = header.dataset.linkTemplate || '';
          const url = tpl.replace(/\{([^}]+)\}/g, (_, k) => (rowObj[k] ?? ''));
          dispatchEvent('analyse:datalink', {
            url,
            column: header.dataset.col,
            view: header.dataset.view || 'right',
            row: rowObj
          });
        } else if (behavior === 'subview') {
          dispatchEvent('analyse:subview', {
            variant: header.dataset.view || 'right',
            column: header.dataset.col,
            row: rowObj
          });
        }
      });
    }

    console.log('[analysis-designer] Headers made draggable');
  }, 1000); // Increased timeout to 1 second
}

function makeTableCellsDraggable() {
  const table = moduleState.refs.resultsTable;
  if (!table) {
    console.warn('[drag] makeTableCellsDraggable: resultsTable not found');
    return;
  }

  const thead = table.querySelector('thead');
  const tbody = table.querySelector('tbody');
  if (!thead || !tbody) {
    console.warn('[drag] makeTableCellsDraggable: thead or tbody not found');
    return;
  }

  const headers = Array.from(thead.querySelectorAll('th'));
  const cells = tbody.querySelectorAll('td');

  console.log(`[drag] Making ${cells.length} cells draggable`);

  // Make all TD cells draggable
  cells.forEach(td => {
    td.setAttribute('draggable', 'true');

    td.addEventListener('dragstart', (e) => {
      const colIndex = td.cellIndex;
      const header = headers[colIndex];
      const key = header?.dataset?.col || '';
      const value = (td.textContent || '').trim();

      console.log('[drag] Cell drag start:', key, '=', value);

      if (!key || value === '') {
        console.warn('[drag] Cell drag cancelled: no key or empty value');
        return;
      }

      const [tableName, fieldName] = key.split('.');
      const payload = {
        table: tableName,
        field: fieldName,
        value: value,
        isCellDrag: true
      };

      e.dataTransfer.setData('application/json', JSON.stringify(payload));
      e.dataTransfer.effectAllowed = 'copy';
    });
  });

  console.log('[analysis-designer] Table cells made draggable');
}

function setupTableDoubleClick() {
  const table = moduleState.refs.resultsTable;
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  
  tbody.addEventListener('dblclick', (e) => {
    const cell = e.target.closest('td');
    if (!cell) return;
    
    const headers = Array.from(table.querySelectorAll('thead th'));
    const colIndex = cell.cellIndex;
    const header = headers[colIndex];
    if (!header || !header.dataset || !header.dataset.col) return;
    
    const [tableName, fieldName] = header.dataset.col.split('.');
    const rawValue = cell.textContent.trim();
    
    if (!rawValue) return;
    
    addQuickFilter(tableName, fieldName, rawValue);
  });
}


function setupAxisDropZone(zone, axis) {
  ['dragenter', 'dragover'].forEach(ev =>
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    })
  );
  
  ['dragleave', 'drop'].forEach(ev =>
    zone.addEventListener(ev, (e) => {
      e.stopPropagation();
      zone.classList.remove('drag-over');
    })
  );
  
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw || raw === 'undefined') return;
    
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    if (!data || !data.table || !data.field) return;
    
    // Set axis
    if (axis === 'x') {
      moduleState.xAxis = data;
    } else {
      moduleState.yAxis = data;
    }
    
    updateAxisDisplay(zone, data, axis);
    
    // Update chart if both axes are set
    if (moduleState.xAxis && moduleState.yAxis && moduleState.lastAnalysisData) {
      renderChart();
    }
    
    showNotification(`${axis.toUpperCase()}-Achse gesetzt: ${data.table}.${data.field}`, 'success');
  });
  
  // Initial display
  updateAxisDisplay(zone, axis === 'x' ? moduleState.xAxis : moduleState.yAxis, axis);
}

function updateAxisDisplay(zone, axisData, axis) {
  if (!zone) return;
  
  if (axisData && axisData.table && axisData.field) {
    const label = `${axisData.table}.${axisData.field}`;
    zone.innerHTML = `
      <div class="ads-axis-field">
        <span>${label}</span>
        <button type="button" title="Achse leeren" data-axis="${axis}">×</button>
      </div>
    `;
    
    const btn = zone.querySelector('button');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (axis === 'x') {
          moduleState.xAxis = null;
        } else {
          moduleState.yAxis = null;
        }
        updateAxisDisplay(zone, null, axis);
        showNotification(`${axis.toUpperCase()}-Achse entfernt`, 'success');
      });
    }
  } else {
    zone.innerHTML = '<span class="drop-zone-hint">Feld hier ablegen</span>';
  }
}

function showHeaderContextMenu(x, y, field, header) {
  const existing = document.getElementById('columnContextMenu');
  if (existing) existing.remove();
  
  const menu = document.createElement('div');
  menu.id = 'columnContextMenu';
  menu.className = 'context-menu';
  menu.style.position = 'absolute';
  menu.style.top = y + 'px';
  menu.style.left = x + 'px';
  menu.style.zIndex = '10000';
  menu.style.minWidth = '260px';
  menu.style.maxWidth = '320px';
  menu.style.background = '#fff';
  menu.style.border = '1px solid #e5e7eb';
  menu.style.borderRadius = '10px';
  menu.style.boxShadow = '0 12px 30px rgba(0,0,0,0.16)';
  menu.style.padding = '10px 12px';
  menu.style.fontSize = '13px';
  menu.style.lineHeight = '1.25';
  
  const curBehavior = header?.dataset?.behavior || 'none';
  const curView = header?.dataset?.view || 'right';
  const curTpl = header?.dataset?.linkTemplate || '';
  const curEp = header?.dataset?.datalinkEndpoint || '';
  
  menu.innerHTML = `
    <div style="font-weight:600;margin:4px 0 2px 0;">Sortierung</div>
    <div class="cm-row" style="padding:4px 0;cursor:pointer;" data-action="sort-asc">↑ Aufsteigend sortieren</div>
    <div class="cm-row" style="padding:4px 0;cursor:pointer;" data-action="sort-desc">↓ Absteigend sortieren</div>
    
    <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
    
    <div style="font-weight:600;margin:4px 0 2px 0;">Aggregation (Tabellen-Footer)</div>
    <div style="font-size:12px;color:#64748b;margin:0 0 8px 0;">Diese Optionen berechnen die Spalten-Aggregation im Tabellen-Footer.</div>
    <div class="cm-row"><label><input type="radio" name="agg" value="sum"> Spalten-Summe</label></div>
    <div class="cm-row"><label><input type="radio" name="agg" value="avg"> Spalten-Durchschnitt</label></div>
    <div class="cm-row"><label><input type="radio" name="agg" value="min"> Spalten-Minimum</label></div>
    <div class="cm-row"><label><input type="radio" name="agg" value="max"> Spalten-Maximum</label></div>
    <div class="cm-row"><label><input type="radio" name="agg" value="count"> Spalten-Anzahl</label></div>
    
    <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
    
    <div style="font-weight:600;margin:0 0 6px 0;">Verhalten (Spalte)</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
      <label><input type="radio" name="bhv" value="none" ${curBehavior==='none'?'checked':''}> Keins</label>
      <label><input type="radio" name="bhv" value="datalink" ${curBehavior==='datalink'?'checked':''}> DataLink</label>
      <label><input type="radio" name="bhv" value="subview" ${curBehavior==='subview'?'checked':''}> Subview</label>
    </div>
    <div data-conf="datalink" style="margin:6px 0;${curBehavior==='datalink'?'':'display:none;'}">
      <div style="font-size:12px;margin-bottom:4px;color:#374151;">Endpoint (POST)</div>
      <input id="cmEndpoint" type="text" value="${curEp.replace(/"/g,'&quot;')}" placeholder="/api/datalink/resolve" style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:6px;">
      <div style="font-size:12px;margin-bottom:4px;color:#374151;">Link-Template (optional)</div>
      <input id="cmTpl" type="text" value="${curTpl.replace(/"/g,'&quot;')}" placeholder="/app/account/{Account.Id}" style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;">
    </div>
    <div data-conf="subview" style="margin:6px 0;${curBehavior==='subview'?'':'display:none;'}">
      <div style="font-size:12px;margin-bottom:4px;color:#374151;">Subview-Ansicht</div>
      <label><input type="radio" name="view" value="left" ${curView==='left'?'checked':''}> Links</label>
      <label><input type="radio" name="view" value="right" ${curView==='right'?'checked':''}> Rechts</label>
      <label><input type="radio" name="view" value="full" ${curView==='full'?'checked':''}> Voll</label>
    </div>
    
    <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
    
    <div style="display:flex;gap:8px;justify-content:space-between;">
      <button id="cmSave" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;background:#111827;color:#fff;cursor:pointer;">Speichern</button>
      <button id="cmClear" style="padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;">Zurücksetzen</button>
      <button id="cmRemoveColumn" style="padding:6px 10px;border:1px solid #fca5a5;border-radius:6px;background:#fef2f2;color:#b91c1c;cursor:pointer;">Spalte löschen</button>
    </div>
  `;
  
  menu.querySelector('[data-action="sort-asc"]').addEventListener('click', () => {
    sortColumn(field, 'asc');
    menu.remove();
  });
  menu.querySelector('[data-action="sort-desc"]').addEventListener('click', () => {
    sortColumn(field, 'desc');
    menu.remove();
  });
  
  const aggRadios = menu.querySelectorAll('input[name="agg"]');
  aggRadios.forEach(r => {
    r.addEventListener('change', () => {
      const val = menu.querySelector('input[name="agg"]:checked')?.value || '';
      if (!header) return;
      header.dataset.aggregation = val;
      updateColumnAggregation(header, val || null);
      menu.remove();
    });
  });
  
  const radios = menu.querySelectorAll('input[name="bhv"]');
  const sectionLink = menu.querySelector('[data-conf="datalink"]');
  const sectionSubview = menu.querySelector('[data-conf="subview"]');
  radios.forEach(r => {
    r.addEventListener('change', () => {
      const val = menu.querySelector('input[name="bhv"]:checked')?.value || 'none';
      sectionLink.style.display = (val === 'datalink') ? '' : 'none';
      sectionSubview.style.display = (val === 'subview') ? '' : 'none';
    });
  });
  
  menu.querySelector('#cmSave').addEventListener('click', () => {
    const behavior = menu.querySelector('input[name="bhv"]:checked')?.value || 'none';
    const view = menu.querySelector('input[name="view"]:checked')?.value || 'right';
    const tpl = (menu.querySelector('#cmTpl')?.value || '').trim();
    const ep = (menu.querySelector('#cmEndpoint')?.value || '').trim();
    
    if (header) {
      header.dataset.behavior = behavior;
      header.dataset.view = view;
      header.dataset.linkTemplate = tpl;
      header.dataset.datalinkEndpoint = ep;
    }
    showNotification('Spalteneinstellungen gespeichert.', 'success');
    menu.remove();
  });
  
  menu.querySelector('#cmClear').addEventListener('click', () => {
    if (header) {
      header.dataset.behavior = 'none';
      header.dataset.view = 'right';
      header.dataset.linkTemplate = '';
      header.dataset.datalinkEndpoint = '';
    }
    showNotification('Spaltenverhalten zurückgesetzt.', 'info');
    menu.remove();
  });
  
  menu.querySelector('#cmRemoveColumn').addEventListener('click', () => {
    removeColumn(field);
    menu.remove();
  });
  
  document.body.appendChild(menu);
  menu.classList.add('active');
  
  const close = (e) => {
    if (!menu.contains(e.target)) {
      document.removeEventListener('click', close);
      menu.remove();
    }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

function sortColumn(field, direction) {
  if (!moduleState.dataTableInstance) return;
  
  const table = moduleState.refs.resultsTable;
  const headers = Array.from(table.querySelectorAll('thead th'));
  const colIndex = headers.findIndex(th => th.dataset.col === `${field.table}.${field.field}`);
  
  if (colIndex !== -1) {
    const dt = moduleState.dataTableInstance.dt || moduleState.dataTableInstance;
    dt.order([colIndex, direction]).draw();
    showNotification(`Sortiert nach ${field.label} (${direction === 'asc' ? 'aufsteigend' : 'absteigend'})`, 'success');
  }
}

function filterByValue(field) {
  // Open filter modal or add filter row
  const value = prompt(`Filter-Wert für ${field.label}:`);
  if (value !== null && value !== '') {
    addQuickFilter(field.table, field.field, value);
  }
}

function removeColumnFilter(field) {
  const fieldKey = `${field.table}.${field.field}`;
  moduleState.filters = moduleState.filters.filter(f => f.fieldKey !== fieldKey);
  renderFilters();
  showNotification(`Filter für ${field.label} entfernt`, 'success');
}

function removeColumn(field) {
  const index = moduleState.selectedFields.findIndex(
    f => f.table === field.table && f.field === field.field
  );
  
  if (index !== -1) {
    moduleState.selectedFields.splice(index, 1);
    updateTableBuilder();
    updateChartAxisOptions();
    updateLivePreview();
    showNotification(`Spalte ${field.label} entfernt`, 'success');
  }
}

function addQuickFilter(table, field, value) {
  const fieldKey = `${table}.${field}`;
  const existing = moduleState.filters.find(f => f.fieldKey === fieldKey);
  
  if (existing) {
    existing.conditions.push({ id: Date.now(), operator: '=', value: value });
  } else {
    moduleState.filters.push({
      id: Date.now(),
      fieldKey: fieldKey,
      table: table,
      field: field,
      type: 'text',
      localLogic: 'OR',
      conditions: [{ id: Date.now(), operator: '=', value: value }]
    });
  }
  
  renderFilters();
  showNotification(`Filter gesetzt: ${table}.${field} = "${value}"`, 'success');
}
function setupDropZones() {
  // Filter Drop Zone
  const filterZone = moduleState.root.querySelector('[data-ref="filtersDropZone"]');
  if (filterZone) {
    setupFilterDropZone(filterZone);
  }
  
  // Metrics Drop Zone
  const metricsZone = moduleState.root.querySelector('[data-ref="metricsDropZone"]');
  if (metricsZone) {
    setupMetricsDropZone(metricsZone);
  }
  
  // Chart Axis Drop Zones
  const xAxisZone = moduleState.refs.xAxisDropZone;
  const yAxisZone = moduleState.refs.yAxisDropZone;
  if (xAxisZone) setupAxisDropZone(xAxisZone, 'x');
  if (yAxisZone) setupAxisDropZone(yAxisZone, 'y');
}

function setupFilterDropZone(zone) {
  console.log('[dropzone] Setting up filter drop zone');

  ['dragenter', 'dragover'].forEach(ev =>
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    })
  );

  ['dragleave', 'drop'].forEach(ev =>
    zone.addEventListener(ev, (e) => {
      e.stopPropagation();
      zone.classList.remove('drag-over');
    })
  );

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    console.log('[dropzone] Drop on filter zone');
    const raw = e.dataTransfer.getData('application/json');
    console.log('[dropzone] Dropped data:', raw);

    if (!raw || raw === 'undefined') {
      console.warn('[dropzone] No data in drop');
      return;
    }

    let data;
    try {
      data = JSON.parse(raw);
      console.log('[dropzone] Parsed data:', data);
    } catch (err) {
      console.error('[dropzone] Failed to parse JSON:', err);
      return;
    }

    if (!data || !data.table || !data.field) {
      console.warn('[dropzone] Invalid data structure');
      return;
    }

    if (data.isCellDrag && data.value) {
      console.log('[dropzone] Adding filter with value:', data.value);
      addQuickFilter(data.table, data.field, data.value);
    } else {
      console.log('[dropzone] Adding empty filter');
      addQuickFilter(data.table, data.field, '');
    }
  });
}

function setupMetricsDropZone(zone) {
  console.log('[dropzone] Setting up metrics drop zone');

  ['dragenter', 'dragover'].forEach(ev =>
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    })
  );

  ['dragleave', 'drop'].forEach(ev =>
    zone.addEventListener(ev, (e) => {
      e.stopPropagation();
      zone.classList.remove('drag-over');
    })
  );

  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    console.log('[dropzone] Drop on metrics zone');
    const raw = e.dataTransfer.getData('application/json');
    console.log('[dropzone] Dropped data:', raw);

    if (!raw || raw === 'undefined') {
      console.warn('[dropzone] No data in drop');
      return;
    }

    let data;
    try {
      data = JSON.parse(raw);
      console.log('[dropzone] Parsed data:', data);
    } catch (err) {
      console.error('[dropzone] Failed to parse JSON:', err);
      return;
    }

    if (!data || !data.table || !data.field) {
      console.warn('[dropzone] Invalid data structure');
      return;
    }

    const table = moduleState.schema[data.table];
    if (!table || !table.fields) {
      console.warn('[dropzone] Table not found in schema');
      return;
    }

    const fieldDef = Array.isArray(table.fields)
      ? table.fields.find(f => f.name === data.field)
      : table.fields[data.field];

    if (!fieldDef) {
      console.warn('[dropzone] Field not found in schema');
      return;
    }

    const numericTypes = ['number', 'currency', 'percent'];
    if (!numericTypes.includes(fieldDef.type)) {
      console.log('[dropzone] Non-numeric field rejected:', fieldDef.type);
      showNotification('⚠️ Nur numerische Felder können als Metriken verwendet werden', 'warning');
      return;
    }

    console.log('[dropzone] Adding metric for field:', data.field);
    addQuickMetric(data.table, data.field);
  });
}

function addQuickMetric(table, field) {
  const fieldKey = `${table}.${field}`;
  const exists = moduleState.metrics.find(m => m.field === fieldKey);
  if (exists) {
    showNotification('Diese Metrik existiert bereits', 'warning');
    return;
  }
  
  moduleState.metrics.push({
    id: Date.now(),
    field: fieldKey,
    aggregation: 'SUM',
    label: ''
  });
  
  renderMetrics();
  showNotification(`Metrik hinzugefügt: ${table}.${field}`, 'success');
}

function setupAxisDropZone(zone, axis) {
  ['dragenter', 'dragover'].forEach(ev =>
    zone.addEventListener(ev, (e) => {
      e.preventDefault();
      e.stopPropagation();
      zone.classList.add('drag-over');
    })
  );
  
  ['dragleave', 'drop'].forEach(ev =>
    zone.addEventListener(ev, (e) => {
      e.stopPropagation();
      zone.classList.remove('drag-over');
    })
  );
  
  zone.addEventListener('drop', (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData('application/json');
    if (!raw || raw === 'undefined') return;
    
    let data;
    try { data = JSON.parse(raw); } catch { return; }
    if (!data || !data.table || !data.field) return;
    
    if (axis === 'x') {
      moduleState.xAxis = data;
    } else {
      moduleState.yAxis = data;
    }
    
    updateAxisDisplay(zone, data, axis);
    
    if (moduleState.xAxis && moduleState.yAxis && moduleState.lastAnalysisData) {
      renderChart();
    }
    
    showNotification(`${axis.toUpperCase()}-Achse gesetzt: ${data.table}.${data.field}`, 'success');
  });
  
  updateAxisDisplay(zone, axis === 'x' ? moduleState.xAxis : moduleState.yAxis, axis);
}

function updateAxisDisplay(zone, axisData, axis) {
  if (!zone) return;
  
  if (axisData && axisData.table && axisData.field) {
    const label = `${axisData.table}.${axisData.field}`;
    zone.innerHTML = `
      <div class="ads-axis-field">
        <span>${label}</span>
        <button type="button" title="Achse leeren" data-axis="${axis}">×</button>
      </div>
    `;
    
    const btn = zone.querySelector('button');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (axis === 'x') {
          moduleState.xAxis = null;
        } else {
          moduleState.yAxis = null;
        }
        updateAxisDisplay(zone, null, axis);
        showNotification(`${axis.toUpperCase()}-Achse entfernt`, 'success');
      });
    }
  } else {
    zone.innerHTML = '<span class="drop-zone-hint">Feld hier ablegen</span>';
  }
}

function makeTableCellsDraggable() {
  setTimeout(() => {
    const table = moduleState.refs.resultsTable;
    if (!table) return;
    
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    if (!thead || !tbody) return;
    
    const headers = Array.from(thead.querySelectorAll('th'));
    
    tbody.querySelectorAll('td').forEach(td => {
      td.setAttribute('draggable', 'true');
      
      td.addEventListener('dragstart', (e) => {
        const colIndex = td.cellIndex;
        const header = headers[colIndex];
        const key = header?.dataset?.col || '';
        const value = (td.textContent || '').trim();
        
        if (!key || value === '') return;
        
        const [tableName, fieldName] = key.split('.');
        const payload = {
          table: tableName,
          field: fieldName,
          value: value,
          isCellDrag: true
        };
        
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copy';
      });
    });
  }, 300);
}

function setupTableDoubleClick() {
  const table = moduleState.refs.resultsTable;
  if (!table) return;
  
  const tbody = table.querySelector('tbody');
  if (!tbody) return;
  
  tbody.addEventListener('dblclick', (e) => {
    const cell = e.target.closest('td');
    if (!cell) return;
    
    const headers = Array.from(table.querySelectorAll('thead th'));
    const colIndex = cell.cellIndex;
    const header = headers[colIndex];
    if (!header || !header.dataset || !header.dataset.col) return;
    
    const [tableName, fieldName] = header.dataset.col.split('.');
    const rawValue = cell.textContent.trim();
    
    if (!rawValue) return;
    
    addQuickFilter(tableName, fieldName, rawValue);
  });
}

function showHeaderContextMenu(x, y, field, header) {
  const existing = document.getElementById('columnContextMenu');
  if (existing) existing.remove();
  
  const menu = document.createElement('div');
  menu.id = 'columnContextMenu';
  menu.className = 'context-menu';
  menu.style.position = 'absolute';
  menu.style.top = y + 'px';
  menu.style.left = x + 'px';
  menu.style.zIndex = '10000';
  menu.style.minWidth = '260px';
  menu.style.maxWidth = '320px';
  menu.style.background = '#fff';
  menu.style.border = '1px solid #e5e7eb';
  menu.style.borderRadius = '10px';
  menu.style.boxShadow = '0 12px 30px rgba(0,0,0,0.16)';
  menu.style.padding = '10px 12px';
  menu.style.fontSize = '13px';
  menu.style.lineHeight = '1.25';
  
  const curBehavior = header?.dataset?.behavior || 'none';
  const curView = header?.dataset?.view || 'right';
  const curTpl = header?.dataset?.linkTemplate || '';
  const curEp = header?.dataset?.datalinkEndpoint || '';
  
  menu.innerHTML = `
    <div style="font-weight:600;margin:4px 0 2px 0;">Sortierung</div>
    <div class="cm-row" style="padding:4px 0;cursor:pointer;" data-action="sort-asc">↑ Aufsteigend sortieren</div>
    <div class="cm-row" style="padding:4px 0;cursor:pointer;" data-action="sort-desc">↓ Absteigend sortieren</div>
    
    <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
    
    <div style="font-weight:600;margin:4px 0 2px 0;">Aggregation (Tabellen-Footer)</div>
    <div style="font-size:12px;color:#64748b;margin:0 0 8px 0;">Diese Optionen berechnen die Spalten-Aggregation im Tabellen-Footer.</div>
    <div class="cm-row"><label><input type="radio" name="agg" value="sum"> Spalten-Summe</label></div>
    <div class="cm-row"><label><input type="radio" name="agg" value="avg"> Spalten-Durchschnitt</label></div>
    <div class="cm-row"><label><input type="radio" name="agg" value="min"> Spalten-Minimum</label></div>
    <div class="cm-row"><label><input type="radio" name="agg" value="max"> Spalten-Maximum</label></div>
    <div class="cm-row"><label><input type="radio" name="agg" value="count"> Spalten-Anzahl</label></div>
    
    <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
    
    <div style="font-weight:600;margin:0 0 6px 0;">Verhalten (Spalte)</div>
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:6px;">
      <label><input type="radio" name="bhv" value="none" ${curBehavior==='none'?'checked':''}> Keins</label>
      <label><input type="radio" name="bhv" value="datalink" ${curBehavior==='datalink'?'checked':''}> DataLink</label>
      <label><input type="radio" name="bhv" value="subview" ${curBehavior==='subview'?'checked':''}> Subview</label>
    </div>
    <div data-conf="datalink" style="margin:6px 0;${curBehavior==='datalink'?'':'display:none;'}">
      <div style="font-size:12px;margin-bottom:4px;color:#374151;">Endpoint (POST)</div>
      <input id="cmEndpoint" type="text" value="${curEp.replace(/"/g,'&quot;')}" placeholder="/api/datalink/resolve" style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;margin-bottom:6px;">
      <div style="font-size:12px;margin-bottom:4px;color:#374151;">Link-Template (optional)</div>
      <input id="cmTpl" type="text" value="${curTpl.replace(/"/g,'&quot;')}" placeholder="/app/account/{Account.Id}" style="width:100%;box-sizing:border-box;padding:6px 8px;border:1px solid #e5e7eb;border-radius:6px;">
    </div>
    <div data-conf="subview" style="margin:6px 0;${curBehavior==='subview'?'':'display:none;'}">
      <div style="font-size:12px;margin-bottom:4px;color:#374151;">Subview-Ansicht</div>
      <label><input type="radio" name="view" value="left" ${curView==='left'?'checked':''}> Links</label>
      <label><input type="radio" name="view" value="right" ${curView==='right'?'checked':''}> Rechts</label>
      <label><input type="radio" name="view" value="full" ${curView==='full'?'checked':''}> Voll</label>
    </div>
    
    <hr style="border:none;border-top:1px solid #eee;margin:10px 0;">
    
    <div style="display:flex;gap:8px;justify-content:space-between;">
      <button id="cmSave" style="padding:6px 10px;border:1px solid #d1d5db;border-radius:6px;background:#111827;color:#fff;cursor:pointer;">Speichern</button>
      <button id="cmClear" style="padding:6px 10px;border:1px solid #e5e7eb;border-radius:6px;background:#fff;cursor:pointer;">Zurücksetzen</button>
      <button id="cmRemoveColumn" style="padding:6px 10px;border:1px solid #fca5a5;border-radius:6px;background:#fef2f2;color:#b91c1c;cursor:pointer;">Spalte löschen</button>
    </div>
  `;
  
  menu.querySelector('[data-action="sort-asc"]').addEventListener('click', () => {
    sortColumn(field, 'asc');
    menu.remove();
  });
  menu.querySelector('[data-action="sort-desc"]').addEventListener('click', () => {
    sortColumn(field, 'desc');
    menu.remove();
  });
  
  const aggRadios = menu.querySelectorAll('input[name="agg"]');
  aggRadios.forEach(r => {
    r.addEventListener('change', () => {
      const val = menu.querySelector('input[name="agg"]:checked')?.value || '';
      if (!header) return;
      header.dataset.aggregation = val;
      updateColumnAggregation(header, val || null);
      menu.remove();
    });
  });
  
  const radios = menu.querySelectorAll('input[name="bhv"]');
  const sectionLink = menu.querySelector('[data-conf="datalink"]');
  const sectionSubview = menu.querySelector('[data-conf="subview"]');
  radios.forEach(r => {
    r.addEventListener('change', () => {
      const val = menu.querySelector('input[name="bhv"]:checked')?.value || 'none';
      sectionLink.style.display = (val === 'datalink') ? '' : 'none';
      sectionSubview.style.display = (val === 'subview') ? '' : 'none';
    });
  });
  
  menu.querySelector('#cmSave').addEventListener('click', () => {
    const behavior = menu.querySelector('input[name="bhv"]:checked')?.value || 'none';
    const view = menu.querySelector('input[name="view"]:checked')?.value || 'right';
    const tpl = (menu.querySelector('#cmTpl')?.value || '').trim();
    const ep = (menu.querySelector('#cmEndpoint')?.value || '').trim();
    
    if (header) {
      header.dataset.behavior = behavior;
      header.dataset.view = view;
      header.dataset.linkTemplate = tpl;
      header.dataset.datalinkEndpoint = ep;
    }
    showNotification('Spalteneinstellungen gespeichert.', 'success');
    menu.remove();
  });
  
  menu.querySelector('#cmClear').addEventListener('click', () => {
    if (header) {
      header.dataset.behavior = 'none';
      header.dataset.view = 'right';
      header.dataset.linkTemplate = '';
      header.dataset.datalinkEndpoint = '';
    }
    showNotification('Spaltenverhalten zurückgesetzt.', 'info');
    menu.remove();
  });
  
  menu.querySelector('#cmRemoveColumn').addEventListener('click', () => {
    removeColumn(field);
    menu.remove();
  });
  
  document.body.appendChild(menu);
  menu.classList.add('active');
  
  const close = (e) => {
    if (!menu.contains(e.target)) {
      document.removeEventListener('click', close);
      menu.remove();
    }
  };
  setTimeout(() => document.addEventListener('click', close), 0);
}

function sortColumn(field, direction) {
  if (!moduleState.dataTableInstance) return;
  
  const table = moduleState.refs.resultsTable;
  const headers = Array.from(table.querySelectorAll('thead th'));
  const colIndex = headers.findIndex(th => th.dataset.col === `${field.table}.${field.field}`);
  
  if (colIndex !== -1) {
    const dt = moduleState.dataTableInstance.dt || moduleState.dataTableInstance;
    dt.order([colIndex, direction]).draw();
    showNotification(`Sortiert nach ${field.label} (${direction === 'asc' ? 'aufsteigend' : 'absteigend'})`, 'success');
  }
}

function filterByValue(field) {
  const value = prompt(`Filter-Wert für ${field.label}:`);
  if (value !== null && value !== '') {
    addQuickFilter(field.table, field.field, value);
  }
}

function removeColumnFilter(field) {
  const fieldKey = `${field.table}.${field.field}`;
  moduleState.filters = moduleState.filters.filter(f => f.fieldKey !== fieldKey);
  renderFilters();
  showNotification(`Filter für ${field.label} entfernt`, 'success');
}

function addQuickFilter(table, field, value) {
  const fieldKey = `${table}.${field}`;
  const existing = moduleState.filters.find(f => f.fieldKey === fieldKey);
  
  if (existing) {
    existing.conditions.push({ id: Date.now(), operator: '=', value: value });
  } else {
    moduleState.filters.push({
      id: Date.now(),
      fieldKey: fieldKey,
      table: table,
      field: field,
      type: 'text',
      localLogic: 'OR',
      conditions: [{ id: Date.now(), operator: '=', value: value }]
    });
  }
  
  renderFilters();
  showNotification(`Filter gesetzt: ${table}.${field} = "${value}"`, 'success');
}

function renderChart() {
  if (!moduleState.refs.chartCanvas || !moduleState.lastAnalysisData) return;
  
  if (!moduleState.xAxis || !moduleState.yAxis) return;
  
  // Group data
  const grouped = {};
  moduleState.lastAnalysisData.forEach(row => {
    const xValue = row[`${moduleState.xAxis.table}.${moduleState.xAxis.field}`] || 'Unknown';
    const yValue = parseFloat(row[`${moduleState.yAxis.table}.${moduleState.yAxis.field}`]) || 0;
    
    if (!grouped[xValue]) {
      grouped[xValue] = { sum: 0, count: 0 };
    }
    
    grouped[xValue].sum += yValue;
    grouped[xValue].count += 1;
  });
  
  const labels = Object.keys(grouped);
  const values = labels.map(label => grouped[label].sum);
  
  // Destroy existing chart
  if (moduleState.chartInstance) {
    moduleState.chartInstance.destroy();
    moduleState.chartInstance = null;
  }
  
  // Create new chart
  if (typeof Chart !== 'undefined') {
    const ctx = moduleState.refs.chartCanvas.getContext('2d');
    
    moduleState.chartInstance = new Chart(ctx, {
      type: moduleState.chartType,
      data: {
        labels: labels,
        datasets: [{
          label: `${moduleState.yAxis.table}.${moduleState.yAxis.field}`,
          data: values,
          backgroundColor: 'rgba(37, 99, 235, 0.7)',
          borderColor: 'rgba(37, 99, 235, 1)',
          borderWidth: 2,
          borderRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: '#0f172a',
              font: { size: 14, weight: '600' }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: {
              color: '#64748b',
              callback: (value) => new Intl.NumberFormat('de-CH').format(value)
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#64748b' }
          }
        }
      }
    });
  }
}

// ============================================================================
// EXPORT FUNCTIONS
// ============================================================================

function exportToCSV() {
  if (!moduleState.lastAnalysisData || moduleState.lastAnalysisData.length === 0) {
    showNotification('❌ Keine Daten zum Exportieren', 'error');
    return;
  }
  
  try {
    const headers = moduleState.selectedFields.map(f => `${f.table}.${f.field}`);
    let csv = headers.join(',') + '\n';
    
    moduleState.lastAnalysisData.forEach(row => {
      const values = headers.map(header => {
        let value = row[header];
        
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      
      csv += values.join(',') + '\n';
    });
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, `analyse_${getDateStamp()}.csv`);
    
    showNotification('✅ CSV Export erfolgreich', 'success');
    dispatchEvent('export', { format: 'csv', rows: moduleState.lastAnalysisData.length });
    
  } catch (error) {
    console.error('[analysis-designer] CSV export failed:', error);
    showNotification('❌ CSV Export fehlgeschlagen', 'error');
  }
}

function exportToExcel() {
  if (!moduleState.lastAnalysisData || moduleState.lastAnalysisData.length === 0) {
    showNotification('❌ Keine Daten zum Exportieren', 'error');
    return;
  }
  
  try {
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">';
    html += '<head><meta charset="utf-8"></head><body>';
    html += '<table border="1">';
    
    // Headers
    html += '<thead><tr>';
    moduleState.selectedFields.forEach(f => {
      html += `<th style="background-color: #2563eb; color: white; font-weight: bold; padding: 8px;">${f.table}.${f.field}</th>`;
    });
    html += '</tr></thead>';
    
    // Data
    html += '<tbody>';
    moduleState.lastAnalysisData.forEach(row => {
      html += '<tr>';
      moduleState.selectedFields.forEach(f => {
        const key = `${f.table}.${f.field}`;
        let value = row[key];
        
        if (value === null || value === undefined) value = '';
        
        if (f.type === 'number' || f.type === 'currency') {
          html += `<td style="text-align: right; padding: 6px;">${new Intl.NumberFormat('de-CH').format(value)}</td>`;
        } else if (f.type === 'date') {
          html += `<td style="padding: 6px;">${new Date(value).toLocaleDateString('de-CH')}</td>`;
        } else {
          html += `<td style="padding: 6px;">${value}</td>`;
        }
      });
      html += '</tr>';
    });
    html += '</tbody></table></body></html>';
    
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    downloadBlob(blob, `analyse_${getDateStamp()}.xls`);
    
    showNotification('✅ Excel Export erfolgreich', 'success');
    dispatchEvent('export', { format: 'excel', rows: moduleState.lastAnalysisData.length });
    
  } catch (error) {
    console.error('[analysis-designer] Excel export failed:', error);
    showNotification('❌ Excel Export fehlgeschlagen', 'error');
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function getFieldIcon(type) {
  const icons = {
    id: '🔑',
    text: '📝',
    email: '📧',
    phone: '📞',
    number: '🔢',
    currency: '💰',
    date: '📅',
    picklist: '📋',
    lookup: '🔗',
    percent: '📊'
  };
  
  return icons[type] || '📄';
}

function showNotification(message, type = 'info') {
  console.log(`[analysis-designer] Notification (${type}):`, message);
  
  // You can enhance this with a toast UI component
  const colors = {
    success: '#059669',
    error: '#dc2626',
    warning: '#d97706',
    info: '#2563eb'
  };
  
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${colors[type]};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function downloadBlob(blob, filename) {
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

function getDateStamp() {
  return new Date().toISOString().split('T')[0];
}

function dispatchEvent(eventName, detail = {}) {
  const event = new CustomEvent(`${EVENT_PREFIX}:${eventName}`, {
    detail: {
      timestamp: Date.now(),
      ...detail
    },
    bubbles: true,
    cancelable: true
  });
  
  if (moduleState.root) {
    moduleState.root.dispatchEvent(event);
  }
  
  console.log(`[analysis-designer] Event dispatched: ${EVENT_PREFIX}:${eventName}`, detail);
}

// ============================================================================
// AUTO-INIT & GLOBAL REGISTRATION
// ============================================================================

// Global API registrieren
window.AnalysisDesigner = {
  FEATURE_KEY: FEATURE_KEY,
  FEATURE_NAME: FEATURE_NAME,
  mount: mount,
  refresh: refresh,
  dispose: dispose
};

// Auto-Init wenn DOM ready und .ads-root gefunden wird
document.addEventListener('DOMContentLoaded', function() {
  const root = document.querySelector('.ads-root');
  
  if (root) {
    console.log('[analysis-designer] Auto-mounting...');
    
    // Config aus Script-Tag lesen
    const configEl = document.getElementById('ads-config');
    const config = configEl ? JSON.parse(configEl.textContent) : {};
    
    try {
      mount(root, config);
      console.log('✅ Analysis Designer auto-mounted');
    } catch (error) {
      console.error('❌ Analysis Designer auto-mount failed:', error);
    }
  } else {
    console.log('[analysis-designer] No .ads-root found - waiting for manual mount()');
  }
});

console.log('📊 Analysis Designer loaded - available as window.AnalysisDesigner');

})(window);
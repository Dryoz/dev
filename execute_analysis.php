<?php
/**
 * ENDPOINT: Analyse ausführen
 * POST /mod_linkedinapp/php/analysis/execute_analysis.php
 * Führt die Datenanalyse aus und gibt Ergebnisse zurück
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS Request für CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Nur POST erlaubt
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Request Body lesen
    $input = file_get_contents('php://input');
    $request = json_decode($input, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid JSON',
            'message' => json_last_error_msg()
        ]);
        exit;
    }
    
    // Validierung
    if (empty($request['mainTable'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'mainTable ist erforderlich'
        ]);
        exit;
    }
    
    if (empty($request['selectedFields'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'selectedFields ist erforderlich'
        ]);
        exit;
    }
    
    // Request Parameter extrahieren
    $mainTable = $request['mainTable'];
    $selectedFields = $request['selectedFields'];
    $filters = $request['filters'] ?? [];
    $joins = $request['joins'] ?? [];
    $metrics = $request['metrics'] ?? [];
    $columnAggregations = $request['columnAggregations'] ?? [];
    $limit = $request['limit'] ?? 1000;
    $offset = $request['offset'] ?? 0;
    
    // Logging
    error_log('[Analysis] Executing: ' . $mainTable . ' with ' . count($selectedFields) . ' fields');
    
    // TODO: Echte SQL Query bauen und ausführen
    // Beispiel Mock-Response mit Demo-Daten
    $mockData = generateMockData($mainTable, $selectedFields, $filters, $limit);
    
    // Response
    $startTime = microtime(true);
    
    $response = [
        'success' => true,
        'data' => $mockData,
        'metadata' => [
            'totalRows' => count($mockData),
            'executionTime' => round(microtime(true) - $startTime, 3),
            'query' => buildQueryString($mainTable, $selectedFields, $joins, $filters)
        ],
        'aggregations' => calculateAggregations($mockData, $columnAggregations)
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}

// ============================================================================
// HELPER FUNCTIONS (Mock Implementation)
// ============================================================================

function generateMockData($mainTable, $selectedFields, $filters, $limit) {
    // Mock-Daten je nach Tabelle
    $mockDataSets = [
        'Account' => [
            ['Id' => 'ACC001', 'Name' => 'Tech Solutions AG', 'Industry' => 'Technologie', 'AnnualRevenue' => 5000000, 'NumberOfEmployees' => 250, 'Type' => 'Enterprise', 'CreatedDate' => '2023-01-15'],
            ['Id' => 'ACC002', 'Name' => 'Global Consulting GmbH', 'Industry' => 'Beratung', 'AnnualRevenue' => 8000000, 'NumberOfEmployees' => 400, 'Type' => 'Enterprise', 'CreatedDate' => '2023-02-20'],
            ['Id' => 'ACC003', 'Name' => 'Innovation Labs', 'Industry' => 'Forschung', 'AnnualRevenue' => 3000000, 'NumberOfEmployees' => 150, 'Type' => 'SMB', 'CreatedDate' => '2023-03-10']
        ],
        'Contact' => [
            ['Id' => 'CON001', 'FirstName' => 'Max', 'LastName' => 'Müller', 'Email' => 'max.mueller@techsolutions.ch', 'Phone' => '+41 44 123 45 67', 'Title' => 'CEO', 'AccountId' => 'ACC001', 'CreatedDate' => '2023-01-20'],
            ['Id' => 'CON002', 'FirstName' => 'Anna', 'LastName' => 'Schmidt', 'Email' => 'anna.schmidt@globalconsulting.ch', 'Phone' => '+41 44 234 56 78', 'Title' => 'CTO', 'AccountId' => 'ACC002', 'CreatedDate' => '2023-02-25'],
            ['Id' => 'CON003', 'FirstName' => 'Peter', 'LastName' => 'Weber', 'Email' => 'peter.weber@innovationlabs.ch', 'Phone' => '+41 44 345 67 89', 'Title' => 'Director', 'AccountId' => 'ACC003', 'CreatedDate' => '2023-03-15']
        ],
        'Opportunity' => [
            ['Id' => 'OPP001', 'Name' => 'Cloud Migration Project', 'Amount' => 450000, 'StageName' => 'Negotiation', 'CloseDate' => '2024-06-30', 'Probability' => 75, 'AccountId' => 'ACC001', 'CreatedDate' => '2023-04-01'],
            ['Id' => 'OPP002', 'Name' => 'Digital Transformation', 'Amount' => 850000, 'StageName' => 'Proposal', 'CloseDate' => '2024-09-15', 'Probability' => 60, 'AccountId' => 'ACC002', 'CreatedDate' => '2023-05-10'],
            ['Id' => 'OPP003', 'Name' => 'AI Research Partnership', 'Amount' => 320000, 'StageName' => 'Qualification', 'CloseDate' => '2024-12-31', 'Probability' => 40, 'AccountId' => 'ACC003', 'CreatedDate' => '2023-06-20']
        ]
    ];
    
    $data = $mockDataSets[$mainTable] ?? [];
    
    // Nur ausgewählte Felder projizieren
    $result = [];
    foreach ($data as $row) {
        $projected = [];
        foreach ($selectedFields as $field) {
            $key = $field['table'] . '.' . $field['field'];
            $projected[$key] = $row[$field['field']] ?? null;
        }
        $result[] = $projected;
    }
    
    return array_slice($result, 0, $limit);
}

function buildQueryString($mainTable, $selectedFields, $joins, $filters) {
    // Mock SQL Query für Metadata
    $fieldsList = implode(', ', array_map(function($f) {
        return $f['table'] . '.' . $f['field'];
    }, $selectedFields));
    
    $query = "SELECT $fieldsList FROM $mainTable";
    
    foreach ($joins as $join) {
        $query .= " LEFT JOIN {$join['to']} ON {$join['from']}.{$join['via']} = {$join['to']}.Id";
    }
    
    if (!empty($filters)) {
        $query .= " WHERE ...";
    }
    
    return $query;
}

function calculateAggregations($data, $columnAggregations) {
    $result = [];
    
    foreach ($columnAggregations as $column => $agg) {
        $values = array_column($data, $column);
        $values = array_map('floatval', array_filter($values, 'is_numeric'));
        
        if (empty($values)) continue;
        
        $result[$column] = [
            'sum' => array_sum($values),
            'avg' => count($values) > 0 ? array_sum($values) / count($values) : 0,
            'min' => min($values),
            'max' => max($values),
            'count' => count($values)
        ];
    }
    
    return $result;
}

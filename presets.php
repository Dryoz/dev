<?php
/**
 * ENDPOINT: Presets laden
 * GET /mod_linkedinapp/php/analysis/presets.php
 * Lädt alle gespeicherten Presets des Users
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS Request für CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Nur GET erlaubt
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // TODO: Aus Datenbank laden basierend auf User-ID
    // $userId = $_SESSION['user_id'] ?? null;
    
    // Mock-Response
    $presets = [
        [
            'id' => 1698765432000,
            'name' => 'Q4 Revenue Analysis',
            'description' => 'Quarterly revenue breakdown by region',
            'created' => '2024-10-31T14:30:45Z',
            'updated' => '2024-10-31T14:30:45Z',
            'config' => [
                'tables' => ['Account', 'Opportunity'],
                'fields' => [
                    ['table' => 'Account', 'field' => 'Name', 'label' => 'Name', 'type' => 'text'],
                    ['table' => 'Opportunity', 'field' => 'Amount', 'label' => 'Betrag', 'type' => 'currency']
                ],
                'filters' => [],
                'metrics' => [
                    ['table' => 'Opportunity', 'field' => 'Amount', 'aggregation' => 'SUM', 'label' => 'Total Revenue']
                ],
                'joins' => ['Opportunity'],
                'joinFieldByTable' => [
                    'Opportunity' => 'AccountId'
                ],
                'chartConfig' => [
                    'type' => 'bar',
                    'xAxis' => ['table' => 'Account', 'field' => 'Name'],
                    'yAxis' => ['table' => 'Opportunity', 'field' => 'Amount']
                ],
                'columnAggregations' => []
            ]
        ],
        [
            'id' => 1698765433000,
            'name' => 'Contact Overview',
            'description' => 'All contacts with account information',
            'created' => '2024-10-30T10:15:30Z',
            'updated' => '2024-10-30T10:15:30Z',
            'config' => [
                'tables' => ['Contact', 'Account'],
                'fields' => [
                    ['table' => 'Contact', 'field' => 'FirstName', 'label' => 'Vorname', 'type' => 'text'],
                    ['table' => 'Contact', 'field' => 'LastName', 'label' => 'Nachname', 'type' => 'text'],
                    ['table' => 'Account', 'field' => 'Name', 'label' => 'Account', 'type' => 'text']
                ],
                'filters' => [],
                'metrics' => [],
                'joins' => ['Account'],
                'joinFieldByTable' => [
                    'Account' => 'AccountId'
                ],
                'chartConfig' => [
                    'type' => 'bar',
                    'xAxis' => null,
                    'yAxis' => null
                ],
                'columnAggregations' => []
            ]
        ]
    ];
    
    $response = [
        'presets' => $presets
    ];
    
    echo json_encode($response, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}

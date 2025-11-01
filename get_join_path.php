<?php
/**
 * ENDPOINT: Join-Pfad ermitteln
 * POST /mod_linkedinapp/php/analysis/get_join_path.php
 * Ermittelt den optimalen Join-Pfad zwischen zwei Tabellen
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
    if (empty($request['from']) || empty($request['to'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'from und to sind erforderlich'
        ]);
        exit;
    }
    
    $from = $request['from'];
    $to = $request['to'];
    
    // TODO: Aus Schema/Metadata ermitteln
    // Beispiel Mock-Response
    $joinPaths = [
        'Account-Contact' => [
            ['from' => 'Account', 'to' => 'Contact', 'via' => 'AccountId', 'joinType' => 'LEFT JOIN']
        ],
        'Account-Opportunity' => [
            ['from' => 'Account', 'to' => 'Opportunity', 'via' => 'AccountId', 'joinType' => 'LEFT JOIN']
        ],
        'Contact-Account' => [
            ['from' => 'Contact', 'to' => 'Account', 'via' => 'AccountId', 'joinType' => 'LEFT JOIN']
        ],
        'Opportunity-Account' => [
            ['from' => 'Opportunity', 'to' => 'Account', 'via' => 'AccountId', 'joinType' => 'LEFT JOIN']
        ]
    ];
    
    $key = "{$from}-{$to}";
    $path = $joinPaths[$key] ?? null;
    
    if (!$path) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'message' => "Kein Join-Pfad gefunden zwischen {$from} und {$to}"
        ]);
        exit;
    }
    
    // Response
    $response = [
        'success' => true,
        'path' => $path
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

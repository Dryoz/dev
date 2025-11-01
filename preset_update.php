<?php
/**
 * ENDPOINT: Preset aktualisieren
 * PUT /mod_linkedinapp/php/analysis/preset_update.php
 * Aktualisiert ein bestehendes Preset
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: PUT, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// OPTIONS Request für CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// PUT oder POST erlaubt
if ($_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
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
    if (empty($request['id'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'ID ist erforderlich'
        ]);
        exit;
    }
    
    $presetId = $request['id'];
    $name = $request['name'] ?? null;
    $description = $request['description'] ?? null;
    $config = $request['config'] ?? null;
    
    // TODO: In Datenbank aktualisieren
    // $userId = $_SESSION['user_id'] ?? null;
    // $success = updatePresetInDatabase($userId, $presetId, $name, $description, $config);
    
    error_log("[Analysis] Preset updated: ID $presetId");
    
    // Response
    $response = [
        'success' => true,
        'message' => 'Preset erfolgreich aktualisiert'
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

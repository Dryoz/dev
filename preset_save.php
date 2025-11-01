<?php
/**
 * ENDPOINT: Preset speichern
 * POST /mod_linkedinapp/php/analysis/preset_save.php
 * Speichert ein neues Preset
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
    if (empty($request['name'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Name ist erforderlich'
        ]);
        exit;
    }
    
    if (empty($request['config'])) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Config ist erforderlich'
        ]);
        exit;
    }
    
    // Parameter extrahieren
    $name = $request['name'];
    $description = $request['description'] ?? '';
    $config = $request['config'];
    
    // TODO: In Datenbank speichern
    // $userId = $_SESSION['user_id'] ?? null;
    // $presetId = savePresetToDatabase($userId, $name, $description, $config);
    
    // Mock: Preset ID generieren
    $presetId = round(microtime(true) * 1000);
    
    error_log("[Analysis] Preset saved: $name (ID: $presetId)");
    
    // Response
    $response = [
        'success' => true,
        'presetId' => $presetId,
        'message' => 'Preset erfolgreich gespeichert'
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

<?php
/**
 * ENDPOINT: Daten exportieren
 * POST /mod_linkedinapp/php/analysis/export.php
 * Exportiert Analyseergebnisse als CSV oder Excel
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
    $format = $request['format'] ?? 'csv';
    $data = $request['data'] ?? [];
    $fields = $request['fields'] ?? [];
    
    if (empty($data)) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Keine Daten zum Exportieren'
        ]);
        exit;
    }
    
    // Dateinamen generieren
    $timestamp = date('Ymd_His');
    $filename = "analyse_{$timestamp}.{$format}";
    
    // TODO: Datei im tmp-Verzeichnis erstellen
    // $tmpDir = sys_get_temp_dir() . '/exports/';
    // if (!is_dir($tmpDir)) mkdir($tmpDir, 0755, true);
    // $filepath = $tmpDir . $filename;
    
    if ($format === 'csv') {
        // CSV erstellen (Mock)
        $downloadUrl = "/tmp/exports/{$filename}";
    } else if ($format === 'excel' || $format === 'xlsx') {
        // Excel erstellen (Mock)
        $downloadUrl = "/tmp/exports/{$filename}";
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Ungültiges Format: ' . $format
        ]);
        exit;
    }
    
    error_log("[Analysis] Export created: $filename (" . count($data) . " rows)");
    
    // Response
    $response = [
        'success' => true,
        'downloadUrl' => $downloadUrl,
        'filename' => $filename,
        'expiresAt' => date('c', strtotime('+1 hour'))
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

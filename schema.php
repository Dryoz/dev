<?php
/**
 * ENDPOINT: Schema laden
 * GET /mod_linkedinapp/php/analysis/schema.php
 * Liefert verfügbare Tabellen und deren Felder
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
    // TODO: Aus Datenbank laden
    // Beispiel Mock-Response
    $schema = [
        'tables' => [
            [
                'name' => 'Account',
                'label' => 'Account',
                'icon' => '🏢',
                'fields' => [
                    ['name' => 'Id', 'label' => 'ID', 'type' => 'id', 'foreign' => false],
                    ['name' => 'Name', 'label' => 'Name', 'type' => 'text', 'foreign' => false],
                    ['name' => 'Industry', 'label' => 'Branche', 'type' => 'text', 'foreign' => false],
                    ['name' => 'AnnualRevenue', 'label' => 'Jahresumsatz', 'type' => 'currency', 'foreign' => false],
                    ['name' => 'NumberOfEmployees', 'label' => 'Mitarbeiterzahl', 'type' => 'number', 'foreign' => false],
                    ['name' => 'Type', 'label' => 'Typ', 'type' => 'picklist', 'foreign' => false],
                    ['name' => 'CreatedDate', 'label' => 'Erstellt am', 'type' => 'date', 'foreign' => false]
                ],
                'relations' => [
                    ['target' => 'Contact', 'via' => 'AccountId', 'type' => 'hasMany'],
                    ['target' => 'Opportunity', 'via' => 'AccountId', 'type' => 'hasMany']
                ]
            ],
            [
                'name' => 'Contact',
                'label' => 'Kontakt',
                'icon' => '👤',
                'fields' => [
                    ['name' => 'Id', 'label' => 'ID', 'type' => 'id', 'foreign' => false],
                    ['name' => 'FirstName', 'label' => 'Vorname', 'type' => 'text', 'foreign' => false],
                    ['name' => 'LastName', 'label' => 'Nachname', 'type' => 'text', 'foreign' => false],
                    ['name' => 'Email', 'label' => 'E-Mail', 'type' => 'email', 'foreign' => false],
                    ['name' => 'Phone', 'label' => 'Telefon', 'type' => 'phone', 'foreign' => false],
                    ['name' => 'Title', 'label' => 'Position', 'type' => 'text', 'foreign' => false],
                    ['name' => 'AccountId', 'label' => 'Account ID', 'type' => 'lookup', 'foreign' => true],
                    ['name' => 'CreatedDate', 'label' => 'Erstellt am', 'type' => 'date', 'foreign' => false]
                ],
                'relations' => [
                    ['target' => 'Account', 'via' => 'AccountId', 'type' => 'belongsTo']
                ]
            ],
            [
                'name' => 'Opportunity',
                'label' => 'Opportunity',
                'icon' => '💼',
                'fields' => [
                    ['name' => 'Id', 'label' => 'ID', 'type' => 'id', 'foreign' => false],
                    ['name' => 'Name', 'label' => 'Name', 'type' => 'text', 'foreign' => false],
                    ['name' => 'Amount', 'label' => 'Betrag', 'type' => 'currency', 'foreign' => false],
                    ['name' => 'StageName', 'label' => 'Phase', 'type' => 'picklist', 'foreign' => false],
                    ['name' => 'CloseDate', 'label' => 'Abschlussdatum', 'type' => 'date', 'foreign' => false],
                    ['name' => 'Probability', 'label' => 'Wahrscheinlichkeit', 'type' => 'percent', 'foreign' => false],
                    ['name' => 'AccountId', 'label' => 'Account ID', 'type' => 'lookup', 'foreign' => true],
                    ['name' => 'CreatedDate', 'label' => 'Erstellt am', 'type' => 'date', 'foreign' => false]
                ],
                'relations' => [
                    ['target' => 'Account', 'via' => 'AccountId', 'type' => 'belongsTo']
                ]
            ]
        ]
    ];
    
    echo json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}

<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");

require 'db.php';

$action = $_GET['action'] ?? '';

try {
    switch ($action) {
        case 'login':
            handleLogin();
            break;
        case 'get_tournament':
            getTournamentData();
            break;
        case 'update_player':
            updatePlayer();
            break;
        case 'add_player':
            addPlayer();
            break;
        case 'assign_team':
            assignTeam();
            break;
        case 'start_tournament':
            startTournament();
            break;
        case 'update_match':
            updateMatch();
            break;
        case 'next_round':
            nextRound();
            break;
        case 'get_punishments':
            getPunishments();
            break;
        case 'add_punishment':
            addPunishment();
            break;
        case 'remove_punishment':
            removePunishment();
            break;
        default:
            echo json_encode(['error' => 'Invalid action']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

function handleLogin() {
    global $pdo;
    
    $data = json_decode(file_get_contents('php://input'), true);
    $username = $data['username'] ?? '';
    $password = $data['password'] ?? '';
    
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        echo json_encode([
            'success' => true,
            'is_admin' => (bool)$user['is_admin']
        ]);
    } else {
        echo json_encode(['error' => 'Invalid credentials']);
    }
}

function getTournamentData() {
    global $pdo;
    
    // Holt das aktive Turnier
    $stmt = $pdo->query("SELECT * FROM tournaments WHERE is_active = TRUE LIMIT 1");
    $tournament = $stmt->fetch();
    
    if (!$tournament) {
        echo json_encode(['error' => 'No active tournament']);
        return;
    }
    
    // Spieler holen
    $stmt = $pdo->prepare("SELECT * FROM players WHERE tournament_id = ?");
    $stmt->execute([$tournament['id']]);
    $players = $stmt->fetchAll();
    
    // Matches holen
    $stmt = $pdo->prepare("SELECT m.*, 
                                  p1.name as player1_name, p1.slot as player1_slot, p1.team as player1_team,
                                  p2.name as player2_name, p2.slot as player2_slot, p2.team as player2_team,
                                  pw.name as winner_name, pw.team as winner_team
                           FROM matches m
                           LEFT JOIN players p1 ON m.player1_id = p1.id
                           LEFT JOIN players p2 ON m.player2_id = p2.id
                           LEFT JOIN players pw ON m.winner_id = pw.id
                           WHERE m.tournament_id = ?
                           ORDER BY m.round, m.id");
    $stmt->execute([$tournament['id']]);
    $matches = $stmt->fetchAll();
    
    // Bestrafungen holen
    $stmt = $pdo->prepare("SELECT * FROM punishments WHERE tournament_id = ?");
    $stmt->execute([$tournament['id']]);
    $punishments = $stmt->fetchAll();
    
    echo json_encode([
        'tournament' => $tournament,
        'players' => $players,
        'matches' => $matches,
        'punishments' => $punishments,
        'current_round' => $matches ? max(array_column($matches, 'round')) : 0
    ]);
}

// Weitere Funktionen hier einfügen...

?>

const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');

// Express-App initialisieren
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'))); // Statische Dateien

// Datenbankverbindung
const db = new sqlite3.Database(process.env.DATABASE_URL || './battle.db');

// Datenbank-Setup
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS game_state (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phase TEXT,
      participants TEXT,
      drawn_players TEXT,
      teams TEXT,
      current_battle TEXT,
      current_slot TEXT,
      battle_history TEXT,
      eliminated TEXT,
      round INTEGER
    )
  `);
});

// API-Endpunkte
app.post('/save-state', (req, res) => {
  const state = req.body;
  const data = [
    state.phase,
    JSON.stringify(state.participants),
    JSON.stringify(state.drawnPlayers),
    JSON.stringify(state.teams),
    JSON.stringify(state.currentBattle),
    state.currentSlot,
    JSON.stringify(state.battleHistory),
    JSON.stringify(state.eliminated),
    state.round
  ];

  db.run(`DELETE FROM game_state`, (err) => {
    if (err) console.error('Fehler beim Löschen:', err);
    
    db.run(`
      INSERT INTO game_state 
      (phase, participants, drawn_players, teams, current_battle, current_slot, battle_history, eliminated, round)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, data, (err) => {
      if (err) return res.status(500).send(err.message);
      res.send('State saved');
    });
  });
});

app.get('/load-state', (req, res) => {
  db.get('SELECT * FROM game_state ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) return res.status(500).send(err.message);
    res.json(row ? {
      phase: row.phase,
      participants: JSON.parse(row.participants),
      drawnPlayers: JSON.parse(row.drawn_players),
      teams: JSON.parse(row.teams),
      currentBattle: JSON.parse(row.current_battle),
      currentSlot: row.current_slot,
      battleHistory: JSON.parse(row.battle_history),
      eliminated: JSON.parse(row.eliminated),
      round: row.round
    } : null);
  });
});

// Fallback für Frontend-Routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Server starten
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server läuft auf Port ${PORT}`);
});

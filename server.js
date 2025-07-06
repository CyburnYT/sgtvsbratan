const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = new sqlite3.Database('./battle.db');

// Initialisiere Datenbank
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

// Speichere Game State
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

  // Lösche alte Einträge, um die Tabelle klein zu halten
  db.run(`DELETE FROM game_state`, (err) => {
    if (err) console.error('Fehler beim Löschen alter Einträge:', err);
    
    // Füge neuen Eintrag hinzu
    db.run(`
      INSERT INTO game_state (phase, participants, drawn_players, teams, current_battle, current_slot, battle_history, eliminated, round)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, data, (err) => {
      if (err) return res.status(500).send(err.message);
      res.send('State saved');
    });
  });
});

// Lade Game State
app.get('/load-state', (req, res) => {
  db.get('SELECT * FROM game_state ORDER BY id DESC LIMIT 1', (err, row) => {
    if (err) return res.status(500).send(err.message);
    
    if (row) {
      res.json({
        phase: row.phase,
        participants: JSON.parse(row.participants),
        drawnPlayers: JSON.parse(row.drawn_players),
        teams: JSON.parse(row.teams),
        currentBattle: JSON.parse(row.current_battle),
        currentSlot: row.current_slot,
        battleHistory: JSON.parse(row.battle_history),
        eliminated: JSON.parse(row.eliminated),
        round: row.round
      });
    } else {
      res.json(null);
    }
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});

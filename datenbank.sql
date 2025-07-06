CREATE DATABASE gamblebratan;

USE gamblebratan;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE
);

CREATE TABLE tournaments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    team_size INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    slot VARCHAR(50) NOT NULL,
    team ENUM('bratan', 'sgt') NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

CREATE TABLE matches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    round INT NOT NULL,
    player1_id INT NULL,
    player2_id INT NULL,
    winner_id INT NULL,
    player1_cost DECIMAL(10,2) NULL,
    player1_win DECIMAL(10,2) NULL,
    player2_cost DECIMAL(10,2) NULL,
    player2_win DECIMAL(10,2) NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id),
    FOREIGN KEY (player1_id) REFERENCES players(id),
    FOREIGN KEY (player2_id) REFERENCES players(id),
    FOREIGN KEY (winner_id) REFERENCES players(id)
);

CREATE TABLE punishments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tournament_id INT NOT NULL,
    text VARCHAR(255) NOT NULL,
    FOREIGN KEY (tournament_id) REFERENCES tournaments(id)
);

-- Standard-Admin-Benutzer einfügen
INSERT INTO users (username, password, is_admin) VALUES ('Bratan', '$2y$10$N9qo8uLOickgx2ZMRZoMy.MrqK3X1ZQ6xP1c.Q6Z6Q5pT0P9w0JmW', TRUE);
-- Passwort: BratanPw

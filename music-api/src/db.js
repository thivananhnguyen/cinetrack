// SQLite database setup: connection, schema creation and initial seeding.
const path = require('path');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const dbPath = process.env.DB_PATH || path.join(__dirname, '..', 'data.db');
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

const SEED_TRACKS = [
  { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', genre: 'Synth-pop', durationSeconds: 200, year: 2019, rating: 9, favorite: 1, coverUrl: 'https://picsum.photos/seed/track1/300' },
  { title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", genre: 'Pop', durationSeconds: 167, year: 2022, rating: 8, favorite: 0, coverUrl: 'https://picsum.photos/seed/track2/300' },
  { title: 'good 4 u', artist: 'Olivia Rodrigo', album: 'SOUR', genre: 'Pop-punk', durationSeconds: 178, year: 2021, rating: 8, favorite: 1, coverUrl: 'https://picsum.photos/seed/track3/300' },
  { title: 'STAY', artist: 'The Kid LAROI', album: 'F*CK LOVE 3', genre: 'Pop', durationSeconds: 141, year: 2021, rating: 7, favorite: 0, coverUrl: 'https://picsum.photos/seed/track4/300' },
  { title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', genre: 'Indie pop', durationSeconds: 238, year: 2020, rating: 9, favorite: 1, coverUrl: 'https://picsum.photos/seed/track5/300' },
  { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', genre: 'Disco-pop', durationSeconds: 203, year: 2020, rating: 8, favorite: 0, coverUrl: 'https://picsum.photos/seed/track6/300' },
  { title: 'Bad Habit', artist: 'Steve Lacy', album: 'Gemini Rights', genre: 'R&B', durationSeconds: 232, year: 2022, rating: 8, favorite: 0, coverUrl: 'https://picsum.photos/seed/track7/300' },
  { title: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation', genre: 'Pop', durationSeconds: 200, year: 2023, rating: 7, favorite: 1, coverUrl: 'https://picsum.photos/seed/track8/300' },
  { title: 'Anti-Hero', artist: 'Taylor Swift', album: 'Midnights', genre: 'Synth-pop', durationSeconds: 200, year: 2022, rating: 9, favorite: 1, coverUrl: 'https://picsum.photos/seed/track9/300' },
  { title: 'Unholy', artist: 'Sam Smith', album: 'Gloria', genre: 'Dance-pop', durationSeconds: 156, year: 2022, rating: 7, favorite: 0, coverUrl: 'https://picsum.photos/seed/track10/300' },
  { title: 'Kill Bill', artist: 'SZA', album: 'SOS', genre: 'R&B', durationSeconds: 153, year: 2022, rating: 9, favorite: 1, coverUrl: 'https://picsum.photos/seed/track11/300' },
  { title: 'Calm Down', artist: 'Rema', album: 'Rave & Roses', genre: 'Afrobeats', durationSeconds: 239, year: 2022, rating: 8, favorite: 0, coverUrl: 'https://picsum.photos/seed/track12/300' },
];

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tracks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      artist TEXT NOT NULL,
      album TEXT,
      genre TEXT,
      durationSeconds INTEGER,
      year INTEGER,
      rating INTEGER,
      favorite INTEGER NOT NULL DEFAULT 0,
      coverUrl TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS playlists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      userId INTEGER NOT NULL,
      trackIds TEXT NOT NULL DEFAULT '[]',
      createdAt TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  seed();
}

function seed() {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count;
  if (userCount === 0) {
    const hash = bcrypt.hashSync('password123', 10);
    const userId = db
      .prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
      .run('demo@ipssi.fr', hash, 'Demo BD3').lastInsertRowid;

    const trackCount = db.prepare('SELECT COUNT(*) AS count FROM tracks').get().count;
    if (trackCount === 0) {
      const insertTrack = db.prepare(`
        INSERT INTO tracks (title, artist, album, genre, durationSeconds, year, rating, favorite, coverUrl)
        VALUES (@title, @artist, @album, @genre, @durationSeconds, @year, @rating, @favorite, @coverUrl)
      `);
      const insertMany = db.transaction((rows) => rows.forEach((row) => insertTrack.run(row)));
      insertMany(SEED_TRACKS);
    }

    db.prepare('INSERT INTO playlists (name, userId, trackIds) VALUES (?, ?, ?)')
      .run('Workout', userId, JSON.stringify([1, 3, 6, 9]));
    db.prepare('INSERT INTO playlists (name, userId, trackIds) VALUES (?, ?, ?)')
      .run('Chill', userId, JSON.stringify([5, 7, 11]));
  }
}

module.exports = { db, init };

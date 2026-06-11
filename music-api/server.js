// REST API for the Angular "music library" fil rouge project (IPSSI BD3).
// Stack: Express + better-sqlite3 (SQLite) + JWT authentication.
//
// Public  : GET /tracks, GET /tracks/:id
// Auth    : POST/PUT/PATCH/DELETE /tracks, all /playlists routes, GET /me
// Auth in : POST /register, POST /login
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const { db, init } = require('./src/db');
const { signToken, authRequired } = require('./src/auth');

init();

const app = express();
app.use(cors());
app.use(express.json());

// Optional artificial latency to practice "loading" states: API_DELAY=500 npm start
const delay = Number(process.env.API_DELAY || 0);
if (delay > 0) {
  app.use((req, res, next) => setTimeout(next, delay));
}

// --- Helpers ---------------------------------------------------------------
const publicUser = (user) => ({ id: user.id, email: user.email, name: user.name });
const mapTrack = (row) => (row ? { ...row, favorite: Boolean(row.favorite) } : row);
const mapPlaylist = (row) => (row ? { ...row, trackIds: JSON.parse(row.trackIds) } : row);

// --- Auth ------------------------------------------------------------------
app.post('/register', (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'email, password and name are required' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  const hash = bcrypt.hashSync(password, 10);
  const id = db
    .prepare('INSERT INTO users (email, password, name) VALUES (?, ?, ?)')
    .run(email, hash, name).lastInsertRowid;
  const user = { id, email, name };
  return res.status(201).json({ accessToken: signToken(user), user });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  return res.json({ accessToken: signToken(user), user: publicUser(user) });
});

app.get('/me', authRequired, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.sub);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(publicUser(user));
});

// --- Tracks (GET public, writes protected) ---------------------------------
app.get('/tracks', (req, res) => {
  const { q, genre, favorite, _sort, _order } = req.query;
  const where = [];
  const params = {};

  if (q) {
    where.push('(title LIKE @q OR artist LIKE @q OR album LIKE @q)');
    params.q = `%${q}%`;
  }
  if (genre) {
    where.push('genre = @genre');
    params.genre = genre;
  }
  if (favorite !== undefined) {
    where.push('favorite = @favorite');
    params.favorite = favorite === 'true' || favorite === '1' ? 1 : 0;
  }

  const sortable = ['title', 'artist', 'year', 'rating', 'durationSeconds', 'createdAt'];
  const sortColumn = sortable.includes(_sort) ? _sort : 'id';
  const sortOrder = String(_order).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

  const sql =
    'SELECT * FROM tracks' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ` ORDER BY ${sortColumn} ${sortOrder}`;

  const rows = db.prepare(sql).all(params);
  return res.json(rows.map(mapTrack));
});

app.get('/tracks/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Track not found' });
  return res.json(mapTrack(row));
});

app.post('/tracks', authRequired, (req, res) => {
  const { title, artist } = req.body || {};
  if (!title || !artist) {
    return res.status(400).json({ message: 'title and artist are required' });
  }
  const body = req.body;
  const id = db
    .prepare(`
      INSERT INTO tracks (title, artist, album, genre, durationSeconds, year, rating, favorite, coverUrl)
      VALUES (@title, @artist, @album, @genre, @durationSeconds, @year, @rating, @favorite, @coverUrl)
    `)
    .run({
      title: body.title,
      artist: body.artist,
      album: body.album ?? null,
      genre: body.genre ?? null,
      durationSeconds: body.durationSeconds ?? null,
      year: body.year ?? null,
      rating: body.rating ?? null,
      favorite: body.favorite ? 1 : 0,
      coverUrl: body.coverUrl ?? null,
    }).lastInsertRowid;
  const created = db.prepare('SELECT * FROM tracks WHERE id = ?').get(id);
  return res.status(201).json(mapTrack(created));
});

function updateTrack(req, res) {
  const existing = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Track not found' });

  // PUT replaces, PATCH merges: in both cases we fall back to the existing value.
  const body = req.body || {};
  const merged = {
    title: body.title ?? existing.title,
    artist: body.artist ?? existing.artist,
    album: body.album ?? existing.album,
    genre: body.genre ?? existing.genre,
    durationSeconds: body.durationSeconds ?? existing.durationSeconds,
    year: body.year ?? existing.year,
    rating: body.rating ?? existing.rating,
    favorite: (body.favorite ?? Boolean(existing.favorite)) ? 1 : 0,
    coverUrl: body.coverUrl ?? existing.coverUrl,
    id: existing.id,
  };

  db.prepare(`
    UPDATE tracks SET title=@title, artist=@artist, album=@album, genre=@genre,
      durationSeconds=@durationSeconds, year=@year, rating=@rating, favorite=@favorite, coverUrl=@coverUrl
    WHERE id=@id
  `).run(merged);

  const updated = db.prepare('SELECT * FROM tracks WHERE id = ?').get(existing.id);
  return res.json(mapTrack(updated));
}

app.put('/tracks/:id', authRequired, updateTrack);
app.patch('/tracks/:id', authRequired, updateTrack);

app.delete('/tracks/:id', authRequired, (req, res) => {
  const result = db.prepare('DELETE FROM tracks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ message: 'Track not found' });
  return res.status(204).send();
});

// --- Favorites (protected writes, simple track flag) -----------------------
app.get('/favorites', (req, res) => {
  const rows = db.prepare('SELECT * FROM tracks WHERE favorite = 1 ORDER BY id').all();
  return res.json(rows.map(mapTrack));
});

function setFavorite(req, res, favorite) {
  const existing = db.prepare('SELECT * FROM tracks WHERE id = ?').get(req.params.trackId);
  if (!existing) return res.status(404).json({ message: 'Track not found' });

  db.prepare('UPDATE tracks SET favorite = ? WHERE id = ?').run(favorite ? 1 : 0, existing.id);
  const updated = db.prepare('SELECT * FROM tracks WHERE id = ?').get(existing.id);
  return res.json(mapTrack(updated));
}

app.post('/favorites/:trackId', authRequired, (req, res) => setFavorite(req, res, true));
app.delete('/favorites/:trackId', authRequired, (req, res) => setFavorite(req, res, false));

// --- Playlists (all protected, scoped to the logged-in user) ---------------
app.get('/playlists', authRequired, (req, res) => {
  const rows = db.prepare('SELECT * FROM playlists WHERE userId = ? ORDER BY id').all(req.user.sub);
  return res.json(rows.map(mapPlaylist));
});

app.post('/playlists', authRequired, (req, res) => {
  const { name, trackIds } = req.body || {};
  if (!name) return res.status(400).json({ message: 'name is required' });
  const id = db
    .prepare('INSERT INTO playlists (name, userId, trackIds) VALUES (?, ?, ?)')
    .run(name, req.user.sub, JSON.stringify(Array.isArray(trackIds) ? trackIds : [])).lastInsertRowid;
  const created = db.prepare('SELECT * FROM playlists WHERE id = ?').get(id);
  return res.status(201).json(mapPlaylist(created));
});

app.put('/playlists/:id', authRequired, (req, res) => {
  const existing = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Playlist not found' });
  if (existing.userId !== req.user.sub) return res.status(403).json({ message: 'Forbidden' });

  const name = req.body?.name ?? existing.name;
  const trackIds = Array.isArray(req.body?.trackIds) ? req.body.trackIds : JSON.parse(existing.trackIds);
  db.prepare('UPDATE playlists SET name = ?, trackIds = ? WHERE id = ?')
    .run(name, JSON.stringify(trackIds), existing.id);
  const updated = db.prepare('SELECT * FROM playlists WHERE id = ?').get(existing.id);
  return res.json(mapPlaylist(updated));
});

app.delete('/playlists/:id', authRequired, (req, res) => {
  const existing = db.prepare('SELECT * FROM playlists WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Playlist not found' });
  if (existing.userId !== req.user.sub) return res.status(403).json({ message: 'Forbidden' });
  db.prepare('DELETE FROM playlists WHERE id = ?').run(existing.id);
  return res.status(204).send();
});

// --- Start -----------------------------------------------------------------
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Music API ready on http://localhost:${PORT}`);
  console.log('Resources : /tracks  /playlists  /me');
  console.log('Auth      : POST /register  POST /login');
  console.log('Demo user : demo@ipssi.fr / password123');
});

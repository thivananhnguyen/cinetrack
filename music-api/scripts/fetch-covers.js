// Enriches each track's coverUrl with the real album artwork from the iTunes Search API.
// The DB is created and seeded if needed, then every track's cover is updated in place.
//
// Usage (network required):  npm run covers
const { db, init } = require('../src/db');

init(); // ensure schema + seed exist

async function fetchCover(title, artist) {
  const term = encodeURIComponent(`${title} ${artist}`);
  const url = `https://itunes.apple.com/search?term=${term}&entity=song&limit=1`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const artwork = data.results?.[0]?.artworkUrl100;
  // iTunes returns a 100x100 URL; swap the size segment for a larger image.
  return artwork ? artwork.replace('100x100bb', '600x600bb') : null;
}

(async () => {
  const tracks = db.prepare('SELECT id, title, artist FROM tracks').all();
  const update = db.prepare('UPDATE tracks SET coverUrl = ? WHERE id = ?');
  let updated = 0;

  for (const track of tracks) {
    try {
      const cover = await fetchCover(track.title, track.artist);
      if (cover) {
        update.run(cover, track.id);
        updated += 1;
        console.log(`✓ ${track.title} — ${track.artist}`);
      } else {
        console.log(`… aucune pochette trouvée pour ${track.title}`);
      }
    } catch (err) {
      console.log(`✗ ${track.title} (${err.message})`);
    }
    await new Promise((resolve) => setTimeout(resolve, 300)); // be gentle with the API
  }

  console.log(`\nTerminé : ${updated}/${tracks.length} pochettes mises à jour.`);
  process.exit(0);
})();

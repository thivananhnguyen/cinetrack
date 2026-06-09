# 🎵 Music API — backend du projet fil rouge (IPSSI BD3)

API REST de gestion d'une bibliothèque musicale, support du projet fil rouge Angular.

**Stack :** Node.js · Express · SQLite ([better-sqlite3](https://github.com/WiseLibs/better-sqlite3)) · JWT ([jsonwebtoken](https://github.com/auth0/node-jsonwebtoken))

## 🚀 Démarrage

```bash
npm install
npm start          # http://localhost:3000
# ou en mode watch :
npm run dev
```

Au premier lancement, le fichier `data.db` (SQLite) est créé automatiquement, le schéma est appliqué et des données de démonstration sont insérées (1 utilisateur, 12 morceaux, 2 playlists).

> Pour repartir d'une base vierge : supprimer `data.db` (et `data.db-shm` / `data.db-wal`) puis relancer.

### 🖼️ Vraies pochettes d'albums (optionnel)

Par défaut, `coverUrl` pointe vers des images de remplissage (picsum.photos). Pour récupérer les **vraies pochettes** depuis l'API iTunes et les enregistrer dans la base :

```bash
npm run covers
```

Le script crée/seed la base si besoin, interroge iTunes pour chaque morceau et met à jour `coverUrl`. Nécessite un accès réseau.

### Variables d'environnement (optionnelles)

| Variable | Défaut | Rôle |
|----------|--------|------|
| `PORT` | `3000` | Port d'écoute |
| `JWT_SECRET` | `dev-secret-ipssi-bd3` | Clé de signature des tokens |
| `JWT_EXPIRES_IN` | `2h` | Durée de validité du token |
| `API_DELAY` | `0` | Latence artificielle en ms (pratiquer les états de chargement) |
| `DB_PATH` | `./data.db` | Chemin du fichier SQLite |

## 🔐 Compte de démonstration

```
email    : demo@ipssi.fr
password : password123
```

## 📚 Endpoints

### Authentification

| Méthode | Route | Auth | Corps | Réponse |
|---------|-------|------|-------|---------|
| `POST` | `/register` | — | `{ email, password, name }` | `{ accessToken, user }` |
| `POST` | `/login` | — | `{ email, password }` | `{ accessToken, user }` |
| `GET` | `/me` | ✅ | — | `{ id, email, name }` |

Le token est renvoyé dans `accessToken` ; il doit être envoyé dans l'en-tête :
`Authorization: Bearer <token>`.

### Tracks

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/tracks` | — | Liste. Filtres : `?q=`, `?genre=`, `?favorite=true`, tri `?_sort=year&_order=desc` |
| `GET` | `/tracks/:id` | — | Détail |
| `POST` | `/tracks` | ✅ | Création (`title` et `artist` requis) |
| `PUT` / `PATCH` | `/tracks/:id` | ✅ | Modification |
| `DELETE` | `/tracks/:id` | ✅ | Suppression |

### Playlists (limitées à l'utilisateur connecté)

| Méthode | Route | Auth | Description |
|---------|-------|------|-------------|
| `GET` | `/playlists` | ✅ | Playlists de l'utilisateur |
| `POST` | `/playlists` | ✅ | Création (`{ name, trackIds }`) |
| `PUT` | `/playlists/:id` | ✅ | Modification |
| `DELETE` | `/playlists/:id` | ✅ | Suppression |

## 🧬 Modèle de données

**Track** : `id`, `title`, `artist`, `album`, `genre`, `durationSeconds`, `year`, `rating` (0–10), `favorite` (boolean), `coverUrl`, `createdAt`
**Playlist** : `id`, `name`, `userId`, `trackIds` (number[]), `createdAt`
**User** : `id`, `email`, `password` (haché bcrypt), `name`, `createdAt`

## 🧪 Exemples (curl)

```bash
# Connexion -> récupérer le token
TOKEN=$(curl -s -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ipssi.fr","password":"password123"}' | jq -r .accessToken)

# Lister les morceaux (public)
curl http://localhost:3000/tracks

# Rechercher
curl "http://localhost:3000/tracks?q=weeknd"

# Créer un morceau (authentifié)
curl -X POST http://localhost:3000/tracks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Espresso","artist":"Sabrina Carpenter","genre":"Pop","durationSeconds":175,"year":2024,"rating":8}'
```

## 🔗 Connexion avec Angular

Côté Angular, cibler `http://localhost:3000` via une variable d'environnement
(`environment.apiUrl`). L'intercepteur d'authentification (J4) ajoute l'en-tête
`Authorization: Bearer <token>` aux requêtes mutantes.

const OMDB_KEY = import.meta.env.VITE_OMDB_KEY

const parseYear = (v) => {
  const m = String(v ?? '').match(/\d{4}/)
  return m ? Number(m[0]) : null
}
const na = (v) => (v && v !== 'N/A' ? v : null)
const toNumber = (v) => {
  const n = Number(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}

// Les items déjà vus : la page détail les retrouve sans refaire d'appel
const cache = new Map()
const remember = (items) => {
  items.forEach((i) => cache.set(i.id, i))
  return items
}

// ── Google Books ──
function normalizeBook(raw) {
  const info = raw.volumeInfo ?? {}
  const cover = info.imageLinks?.thumbnail ?? null
  return {
    id: raw.id,
    type: 'book',
    title: info.title ?? 'Titre inconnu',
    creator: (info.authors ?? []).join(', ') || 'Auteur inconnu',
    year: parseYear(info.publishedDate),
    cover: cover ? cover.replace('http://', 'https://') : null,
    description: info.description ?? '',
    rating: toNumber(info.averageRating),
    ratingCount: toNumber(info.ratingsCount),
    runtime: null,
    favorite: false,
    status: 'want',
  }
}

async function searchBooks(query) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`,
  )
  if (!res.ok) throw new Error(`Google Books : erreur ${res.status}`)
  const data = await res.json()
  return (data.items ?? []).map(normalizeBook)
}

async function fetchBook(id) {
  const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${id}`)
  if (!res.ok) throw new Error(`Google Books : erreur ${res.status}`)
  return normalizeBook(await res.json())
}

// ── OMDb ──
function normalizeMovie(d) {
  const imdb = toNumber(d.imdbRating)
  return {
    id: d.imdbID,
    type: 'movie',
    title: d.Title,
    creator: na(d.Director) ?? 'Réalisateur inconnu',
    year: parseYear(d.Year),
    cover: na(d.Poster),
    description: na(d.Plot) ?? '',
    rating: imdb ? Math.round((imdb / 2) * 10) / 10 : null, // IMDb /10 → /5
    ratingCount: toNumber(d.imdbVotes),
    runtime: na(d.Runtime),
    favorite: false,
    status: 'want',
  }
}

async function fetchMovie(imdbID) {
  const res = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${imdbID}&plot=short`)
  const data = await res.json()
  if (data.Response === 'False') throw new Error(data.Error ?? 'Film introuvable')
  return normalizeMovie(data)
}

async function searchMovies(query) {
  if (!OMDB_KEY) throw new Error('Clé OMDb manquante (VITE_OMDB_KEY dans .env)')
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${OMDB_KEY}&type=movie&s=${encodeURIComponent(query)}`,
  )
  const search = await res.json()
  if (search.Response === 'False') return []

  // La recherche ne donne ni réalisateur ni résumé : un appel détaillé par film
  const movies = await Promise.all(
    search.Search.slice(0, 8).map((m) => fetchMovie(m.imdbID).catch(() => null)),
  )
  return movies.filter(Boolean)
}

// ── Points d'entrée ──
export async function searchItems(query, type = 'movie') {
  const q = query.trim()
  if (!q) return []
  return remember(type === 'book' ? await searchBooks(q) : await searchMovies(q))
}

export async function getItem(id) {
  if (cache.has(id)) return cache.get(id)
  // Les identifiants IMDb commencent par « tt »
  const item = id.startsWith('tt') ? await fetchMovie(id) : await fetchBook(id)
  cache.set(id, item)
  return item
}
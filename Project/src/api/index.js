const OMDB_KEY = import.meta.env.VITE_OMDB_KEY
const BOOKS_KEY = import.meta.env.VITE_GOOGLE_BOOKS_KEY

const parseYear = (v) => {
  const m = String(v ?? '').match(/\d{4}/)
  return m ? Number(m[0]) : null
}
const na = (v) => (v && v !== 'N/A' ? v : null)
const toNumber = (v) => {
  const n = Number(String(v ?? '').replace(/,/g, ''))
  return Number.isFinite(n) && n > 0 ? n : null
}
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

// Les items déjà vus : la page détail les retrouve sans refaire d'appel
const cache = new Map()
const searchCache = new Map()
const remember = (items) => {
  items.forEach((i) => cache.set(i.id, i))
  return items
}

// ── Google Books ──
const booksUrl = (path, params = {}) => {
  const qs = new URLSearchParams(params)
  if (BOOKS_KEY) qs.set('key', BOOKS_KEY)
  return `https://www.googleapis.com/books/v1/${path}?${qs}`
}

const booksError = (status) =>
  new Error(
    status === 429 || status === 503
      ? 'Google Books est momentanément indisponible, réessaie dans un instant.'
      : `Google Books : erreur ${status}`,
  )

// Relance la requête si Google répond « trop de requêtes » ou « indisponible »
async function fetchBooks(url, retries = 2) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(url)
    const temporary = res.status === 429 || res.status === 503
    if (!temporary || attempt >= retries) return res
    await wait(800 * (attempt + 1))
  }
}

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

const BOOKS_PER_PAGE = 20

async function searchGoogleBooks(query, page = 1) {
  const startIndex = (page - 1) * BOOKS_PER_PAGE
  const res = await fetchBooks(
    booksUrl('volumes', { q: query, maxResults: BOOKS_PER_PAGE, startIndex }),
  )
  if (!res.ok) throw booksError(res.status)
  const data = await res.json()
  const items = (data.items ?? []).map(normalizeBook)
  return { items, hasMore: items.length > 0 && startIndex + items.length < (data.totalItems ?? 0) }
}

async function fetchGoogleBook(id) {
  const res = await fetchBooks(booksUrl(`volumes/${id}`))
  if (!res.ok) throw booksError(res.status)
  return normalizeBook(await res.json())
}

// ── Open Library (secours si Google Books ne répond pas, sans clé) ──
// Les identifiants Open Library sont préfixés par « ol- » : ol-OL45804W
const OL = 'https://openlibrary.org'
const olCover = (coverId) => (coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : null)
const olText = (v) => (typeof v === 'string' ? v : (v?.value ?? ''))

function normalizeOpenLibrary(doc) {
  return {
    id: `ol-${doc.key.replace('/works/', '')}`,
    type: 'book',
    title: doc.title ?? 'Titre inconnu',
    creator: (doc.author_name ?? []).join(', ') || 'Auteur inconnu',
    year: doc.first_publish_year ?? null,
    cover: olCover(doc.cover_i),
    description: olText(doc.first_sentence?.[0] ?? doc.first_sentence),
    rating: doc.ratings_average ? Math.round(doc.ratings_average * 10) / 10 : null,
    ratingCount: doc.ratings_count ?? null,
    runtime: null,
    favorite: false,
    status: 'want',
  }
}

const OL_FIELDS = 'key,title,author_name,first_publish_year,cover_i,ratings_average,ratings_count,first_sentence'

async function searchOpenLibrary(query, page = 1) {
  const params = new URLSearchParams({ q: query, page, limit: BOOKS_PER_PAGE, fields: OL_FIELDS })
  const res = await fetch(`${OL}/search.json?${params}`)
  if (!res.ok) throw new Error(`Open Library : erreur ${res.status}`)
  const data = await res.json()
  const items = (data.docs ?? []).filter((d) => d.key).map(normalizeOpenLibrary)
  return { items, hasMore: page * BOOKS_PER_PAGE < (data.numFound ?? 0) }
}

async function fetchOpenLibraryBook(id) {
  const res = await fetch(`${OL}/works/${id.replace('ol-', '')}.json`)
  if (!res.ok) throw new Error(`Open Library : erreur ${res.status}`)
  const work = await res.json()
  let creator = 'Auteur inconnu'
  const authorKey = work.authors?.[0]?.author?.key
  if (authorKey) {
    const author = await fetch(`${OL}${authorKey}.json`).then((r) => (r.ok ? r.json() : null)).catch(() => null)
    if (author?.name) creator = author.name
  }
  return {
    ...normalizeOpenLibrary({ key: work.key, title: work.title, cover_i: work.covers?.[0] }),
    creator,
    year: parseYear(work.first_publish_date),
    description: olText(work.description),
  }
}

// Google Books d'abord, Open Library si Google ne répond pas
async function searchBooks(query, page = 1) {
  try {
    return await searchGoogleBooks(query, page)
  } catch (e) {
    console.warn('Google Books indisponible, recherche sur Open Library', e)
    return searchOpenLibrary(query, page)
  }
}

const fetchBook = (id) => (id.startsWith('ol-') ? fetchOpenLibraryBook(id) : fetchGoogleBook(id))

// Livres tendance du jour (pour l'accueil)
export async function trendingBooks() {
  const res = await fetch(`${OL}/trending/daily.json?limit=12`)
  if (!res.ok) throw new Error(`Open Library : erreur ${res.status}`)
  const data = await res.json()
  return remember((data.works ?? []).filter((w) => w.key && w.cover_i).map(normalizeOpenLibrary))
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

const MOVIES_PER_PAGE = 10 // taille d'une page OMDb

async function searchMovies(query, page = 1) {
  if (!OMDB_KEY) throw new Error('Clé OMDb manquante (VITE_OMDB_KEY dans .env)')
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${OMDB_KEY}&type=movie&s=${encodeURIComponent(query)}&page=${page}`,
  )
  const search = await res.json()
  if (search.Response === 'False') {
    if (search.Error === 'Movie not found!') return { items: [], hasMore: false }
    throw new Error(`OMDb : ${search.Error}`)
  }

  // La recherche ne donne ni réalisateur ni résumé : un appel détaillé par film
  const movies = await Promise.all(
    search.Search.map((m) =>
      fetchMovie(m.imdbID).catch((e) => {
        console.error('Détail OMDb en échec', m.imdbID, e)
        return null
      }),
    ),
  )
  const total = Number(search.totalResults) || 0
  return { items: movies.filter(Boolean), hasMore: page * MOVIES_PER_PAGE < total }
}

// ── Points d'entrée ──
// Renvoie { items, hasMore } ; page commence à 1 (bouton « Load more »)
export async function searchItems(query, type = 'movie', page = 1) {
  const q = query.trim()
  if (!q) return { items: [], hasMore: false }
  const key = `${type}:${q.toLowerCase()}:${page}`
  if (searchCache.has(key)) return searchCache.get(key)
  const result = type === 'book' ? await searchBooks(q, page) : await searchMovies(q, page)
  remember(result.items)
  searchCache.set(key, result)
  return result
}

export async function getItem(id) {
  if (cache.has(id)) return cache.get(id)
  // Les identifiants IMDb commencent par « tt »
  const item = id.startsWith('tt') ? await fetchMovie(id) : await fetchBook(id)
  cache.set(id, item)
  return item
}
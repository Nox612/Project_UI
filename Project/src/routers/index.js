import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '../views/SearchView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [{ path: '/', name: 'search', component: SearchView }],
})

const OMDB_KEY = import.meta.env.VITE_OMDB_KEY

const parseYear = (v) => {
  const m = String(v ?? '').match(/\d{4}/)
  return m ? Number(m[0]) : null
}
const na = (v) => (v && v !== 'N/A' ? v : null)

async function searchBooks(query) {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=20`,
  )
  if (!res.ok) throw new Error(`Google Books : erreur ${res.status}`)
  const data = await res.json()
  return (data.items ?? []).map((raw) => {
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
      favorite: false,
      status: false,
    }
  })
}

async function searchMovies(query) {
  if (!OMDB_KEY) throw new Error('Clé OMDb manquante (VITE_OMDB_KEY dans .env)')
  const res = await fetch(
    `https://www.omdbapi.com/?apikey=${OMDB_KEY}&type=movie&s=${encodeURIComponent(query)}`,
  )
  const search = await res.json()
  if (search.Response === 'False') return []

  // La recherche ne donne ni réalisateur ni résumé : un appel détaillé par film
  const details = await Promise.all(
    search.Search.slice(0, 8).map(async (m) => {
      const r = await fetch(`https://www.omdbapi.com/?apikey=${OMDB_KEY}&i=${m.imdbID}&plot=short`)
      return r.json()
    }),
  )
  return details
    .filter((d) => d.Response !== 'False')
    .map((d) => ({
      id: d.imdbID,
      type: 'movie',
      title: d.Title,
      creator: na(d.Director) ?? 'Réalisateur inconnu',
      year: parseYear(d.Year),
      cover: na(d.Poster),
      description: na(d.Plot) ?? '',
      favorite: false,
      status: false,
    }))
}

export async function searchItems(query, type = 'movie') {
  const q = query.trim()
  if (!q) return []
  return type === 'book' ? searchBooks(q) : searchMovies(q)
}
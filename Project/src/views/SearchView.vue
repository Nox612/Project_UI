<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { searchItems } from '../api'
import { useToast } from '../composables/useToast'
import SearchBar from '../components/SearchBar.vue'
import ResultCard from '../components/ResultCard.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { showToast } = useToast()

const results = ref([])
const loading = ref(false)
const error = ref('')
const searched = ref(false)
const page = ref(1)
const hasMore = ref(false)
const loadingMore = ref(false)
const lastSearch = ref(null)

// La recherche peut venir de l'accueil : /search?q=dune&type=book
const initialQuery = String(route.query.q ?? '')
const initialType = ['all', 'movie', 'book'].includes(route.query.type) ? route.query.type : 'movie'

// « All » : on interroge les deux API et on mélange les résultats
async function fetchPage(query, type, pageNumber) {
  if (type !== 'all') return searchItems(query, type, pageNumber)
  const [movies, books] = await Promise.allSettled([
    searchItems(query, 'movie', pageNumber),
    searchItems(query, 'book', pageNumber),
  ])
  if (movies.status === 'rejected' && books.status === 'rejected') throw movies.reason
  const ok = (r) => (r.status === 'fulfilled' ? r.value : { items: [], hasMore: false })
  const m = ok(movies)
  const b = ok(books)
  const items = []
  for (let i = 0; i < Math.max(m.items.length, b.items.length); i++) {
    if (m.items[i]) items.push(m.items[i])
    if (b.items[i]) items.push(b.items[i])
  }
  return { items, hasMore: m.hasMore || b.hasMore }
}

async function onSearch({ query, type }) {
  loading.value = true
  error.value = ''
  router.replace({ query: { q: query, type } })
  lastSearch.value = { query, type }
  page.value = 1
  try {
    const result = await fetchPage(query, type, 1)
    results.value = result.items
    hasMore.value = result.hasMore
    searched.value = true
  } catch (e) {
    error.value = e.message
    results.value = []
    hasMore.value = false
  } finally {
    loading.value = false
  }
}

async function loadMore() {
  if (!lastSearch.value || loadingMore.value) return
  loadingMore.value = true
  try {
    const { query, type } = lastSearch.value
    const result = await fetchPage(query, type, page.value + 1)
    // évite les doublons si l'API renvoie deux fois le même élément
    const known = new Set(results.value.map((i) => i.id))
    results.value.push(...result.items.filter((i) => !known.has(i.id)))
    hasMore.value = result.hasMore
    page.value++
  } catch (e) {
    showToast(e.message)
  } finally {
    loadingMore.value = false
  }
}

const isInLibrary = (id) => store.getters['library/isInLibrary'](id)
const openItem = (item) => router.push({ name: 'item', params: { id: item.id } })

async function addItem(item) {
  const added = await store.dispatch('library/addItem', item)
  showToast(added ? `"${item.title}" added to your library` : 'Already in your library')
}

onMounted(() => {
  if (initialQuery) onSearch({ query: initialQuery, type: initialType })
})
</script>

<template>
  <main class="page">
    <SearchBar :loading="loading" :initial-query="initialQuery" :initial-type="initialType" @search="onSearch" />

    <div v-if="loading" class="state">Searching…</div>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-else-if="searched && !results.length" class="state">No results found.</p>
    <p v-else-if="!searched" class="state hint">Search for a movie or a book to add it to your library.</p>

    <ul v-if="!loading && results.length" class="results">
      <ResultCard
        v-for="item in results"
        :key="item.id"
        :item="item"
        :in-library="isInLibrary(item.id)"
        @select="openItem"
        @add="addItem"
      />
    </ul>

    <button v-if="!loading && hasMore" class="load-more" :disabled="loadingMore" @click="loadMore">
      {{ loadingMore ? 'Loading…' : 'Load more' }}
    </button>
  </main>
</template>

<style scoped>
.results {
  display: grid;
  gap: 12px;
  margin: 18px 0 0;
  padding: 0;
}

@media (min-width: 760px) {
  .results {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

.load-more {
  display: block;
  margin: 18px auto 0;
  padding: 10px 22px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--bg-soft);
  color: var(--accent);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

.load-more:disabled {
  opacity: 0.6;
}

.state {
  padding: 2.5rem 1rem;
  text-align: center;
  color: var(--muted);
}

.state.error {
  color: var(--danger);
}

.state.hint {
  color: var(--subtle);
  font-size: 0.9rem;
}
</style>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import ItemList from '@/components/ItemList.vue'

const store = useStore()
const items = computed(() => store.getters['library/allItems'])

// Filtres de la maquette : type (All / Movies / Books) et statut
const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'book', label: 'Books' },
]
const statusFilters = [
  { value: 'all', label: 'All' },
  { value: 'want', label: 'Want' },
  { value: 'in-progress', label: 'Watching' },
  { value: 'done', label: 'Completed' },
]
const sortOptions = [
  { value: 'added', label: 'Date added' },
  { value: 'title', label: 'Title' },
  { value: 'year', label: 'Year' },
]

const typeFilter = ref('all')
const statusFilter = ref('all')

// Options supplémentaires, rangées derrière le bouton filtre de la maquette
const showOptions = ref(false)
const favoritesOnly = ref(false)
const search = ref('')
const sortBy = ref('added')

const optionsActive = computed(() => favoritesOnly.value || search.value.trim() !== '' || sortBy.value !== 'added')

// Comme sur la maquette « Watching » ; devient « Reading » quand on filtre les livres
const inProgressLabel = computed(() => (typeFilter.value === 'book' ? 'Reading' : 'Watching'))

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()

  const result = items.value.filter((item) => {
    if (typeFilter.value !== 'all' && item.type !== typeFilter.value) return false
    if (statusFilter.value !== 'all' && item.status !== statusFilter.value) return false
    if (favoritesOnly.value && !item.favorite) return false
    if (query) {
      const text = `${item.title} ${item.creator}`.toLowerCase()
      if (!text.includes(query)) return false
    }
    return true
  })

  // copie avant de trier pour ne pas modifier le state Vuex
  return [...result].sort((a, b) => {
    if (sortBy.value === 'title') return a.title.localeCompare(b.title)
    if (sortBy.value === 'year') return (b.year || 0) - (a.year || 0)
    return (b.addedAt || 0) - (a.addedAt || 0) // plus récents d'abord
  })
})
</script>

<template>
  <main class="page">
    <header class="page-header">
      <h1>My Library</h1>
      <button
        class="square-btn"
        :class="{ active: showOptions || optionsActive }"
        :aria-expanded="showOptions"
        aria-label="Search, sort and filter"
        title="Search, sort and filter"
        @click="showOptions = !showOptions"
      >
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
          <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" />
        </svg>
      </button>
    </header>

    <div v-if="showOptions" class="options">
      <input v-model="search" class="field" type="search" placeholder="Search in my library…" aria-label="Search in my library" />
      <div class="options-row">
        <label class="sort">
          Sort by
          <select v-model="sortBy" class="field">
            <option v-for="o in sortOptions" :key="o.value" :value="o.value">{{ o.label }}</option>
          </select>
        </label>
        <label class="check">
          <input v-model="favoritesOnly" type="checkbox" />
          Favorites only
        </label>
      </div>
    </div>

    <div class="pills" role="group" aria-label="Type">
      <button
        v-for="f in typeFilters"
        :key="f.value"
        class="pill"
        :class="{ active: typeFilter === f.value }"
        :aria-pressed="typeFilter === f.value"
        @click="typeFilter = f.value"
      >
        {{ f.label }}
      </button>
    </div>

    <div class="tabs" role="group" aria-label="Status">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        class="tab"
        :class="{ active: statusFilter === f.value }"
        :aria-pressed="statusFilter === f.value"
        @click="statusFilter = f.value"
      >
        {{ f.value === 'in-progress' ? inProgressLabel : f.label }}
      </button>
    </div>

    <ItemList v-if="filteredItems.length" :items="filteredItems" />

    <div v-else-if="items.length" class="empty">
      <p class="empty-title">Nothing here</p>
      <p>No item matches these filters.</p>
    </div>

    <div v-else class="empty">
      <p class="empty-title">Your library is empty</p>
      <p>Search for a movie or a book and add it to your collection.</p>
      <RouterLink to="/search" class="btn-primary">Search</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  margin-bottom: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--bg-soft);
}

.options-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.field {
  height: 38px;
  padding: 0 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  font-size: 0.85rem;
}

.field:focus {
  outline: 2px solid var(--accent);
  outline-offset: -1px;
}

.sort,
.check {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--muted);
}

.check input {
  width: 16px;
  height: 16px;
  accent-color: var(--accent);
}

.tabs {
  display: flex;
  gap: 6px;
  margin: 14px 0 18px;
}

.tab {
  flex: 1;
  padding: 6px 0 8px;
  border: none;
  border-bottom: 2px solid var(--border-soft);
  background: none;
  color: var(--subtle);
  font-size: 0.8rem;
  white-space: nowrap;
  cursor: pointer;
}

.tab.active {
  border-bottom-color: var(--accent);
  color: var(--accent);
  font-weight: 600;
}
</style>

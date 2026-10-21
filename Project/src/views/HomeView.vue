<script setup>
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getItem, trendingBooks } from '../api'
import { statusLabel } from '../utils/status'
import ThemeToggle from '../components/ThemeToggle.vue'
import TypeIcon from '../components/TypeIcon.vue'

const router = useRouter()
const store = useStore()

const type = ref('movie')
const query = ref('')

// « Trending Now » : OMDb n'a pas de liste de tendances, on affiche une sélection
// de films populaires ; pour les livres, les tendances du jour d'Open Library.
const POPULAR_MOVIES = ['tt0816692', 'tt15239678', 'tt15398776', 'tt3659388', 'tt1375666', 'tt1454468']
const trending = ref([])
const trendingLoading = ref(false)
const trendingCache = {}

async function loadTrending() {
  const t = type.value
  if (trendingCache[t]) {
    trending.value = trendingCache[t]
    return
  }
  trendingLoading.value = true
  try {
    let items
    if (t === 'movie') {
      const results = await Promise.allSettled(POPULAR_MOVIES.map((id) => getItem(id)))
      items = results.filter((r) => r.status === 'fulfilled').map((r) => r.value)
    } else {
      items = (await trendingBooks()).slice(0, 8)
    }
    trendingCache[t] = items
    if (type.value === t) trending.value = items
  } catch {
    if (type.value === t) trending.value = []
  } finally {
    trendingLoading.value = false
  }
}

watch(type, loadTrending, { immediate: true })

// « Recently Added » : les derniers ajouts de la bibliothèque pour ce type
const recent = computed(() =>
  store.getters['library/allItems']
    .filter((i) => i.type === type.value)
    .sort((a, b) => (b.addedAt || 0) - (a.addedAt || 0))
    .slice(0, 3),
)

const progress = { want: 0, 'in-progress': 50, done: 100 }

// « Picked for You » : quelques éléments tirés au hasard dans la liste « Want »
const wantItems = computed(() =>
  store.getters['library/allItems'].filter((i) => i.type === type.value && i.status === 'want'),
)
const picks = ref([])

function shuffle() {
  const pool = [...wantItems.value]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  picks.value = pool.slice(0, 6)
}

// nouveau tirage quand on change de type ou quand la liste « Want » change
watch(() => `${type.value}:${wantItems.value.map((i) => i.id).join()}`, shuffle, { immediate: true })

function search() {
  router.push({ name: 'search', query: query.value.trim() ? { q: query.value.trim(), type: type.value } : { type: type.value } })
}

const open = (item) => router.push({ name: 'item', params: { id: item.id } })
</script>

<template>
  <div class="home">
    <main class="page">
      <header class="brand">
        <span class="logo" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z" /></svg>
        </span>
        <span class="name">Lettersquare</span>
        <ThemeToggle class="corner" />
      </header>

      <div class="segmented" role="group" aria-label="Type">
        <button :class="{ active: type === 'movie' }" :aria-pressed="type === 'movie'" @click="type = 'movie'">Movies</button>
        <button :class="{ active: type === 'book' }" :aria-pressed="type === 'book'" @click="type = 'book'">Books</button>
      </div>

      <form class="search" role="search" @submit.prevent="search">
        <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
        <input v-model="query" type="search" placeholder="Search movies, books…" aria-label="Search" enterkeyhint="search" />
        <button type="submit" class="filter" aria-label="Search">
          <svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 4v6M6 14v6M12 4v2M12 10v10M18 4v10M18 18v2M4 12h4M10 8h4M16 16h4" /></svg>
        </button>
      </form>

      <section v-if="picks.length">
        <div class="section-head">
          <h2>Picked for You</h2>
          <button v-if="wantItems.length > 1" class="shuffle" aria-label="Pick again" @click="shuffle">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
            Shuffle
          </button>
        </div>
        <p class="section-sub">From your {{ type === 'movie' ? 'Want to Watch' : 'Want to Read' }} list</p>

        <div class="trending">
          <button v-for="item in picks" :key="item.id" class="poster-card" @click="open(item)">
            <img v-if="item.cover" class="poster" :src="item.cover" :alt="item.title" loading="lazy" />
            <span v-else class="poster poster-fallback"><TypeIcon :type="item.type" :size="28" /></span>
            <span class="poster-title">{{ item.title }}</span>
            <span class="poster-year">{{ item.year }}</span>
          </button>
        </div>
      </section>

      <section>
        <div class="section-head">
          <h2>Trending Now</h2>
          <RouterLink :to="{ name: 'search', query: { type } }">See All</RouterLink>
        </div>

        <div class="trending">
          <template v-if="trendingLoading && !trending.length">
            <div v-for="n in 3" :key="n" class="poster-card"><div class="poster skeleton"></div></div>
          </template>
          <button v-for="item in trending" :key="item.id" class="poster-card" @click="open(item)">
            <img v-if="item.cover" class="poster" :src="item.cover" :alt="item.title" loading="lazy" />
            <span v-else class="poster poster-fallback"><TypeIcon :type="item.type" :size="28" /></span>
            <span class="poster-title">{{ item.title }}</span>
            <span class="poster-year">{{ item.year }}</span>
          </button>
          <p v-if="!trendingLoading && !trending.length" class="muted">Couldn't load trending titles.</p>
        </div>
      </section>

      <section>
        <div class="section-head">
          <h2>Recently Added {{ type === 'movie' ? 'Movies' : 'Books' }}</h2>
          <RouterLink to="/library">See All</RouterLink>
        </div>

        <div v-if="recent.length" class="recent">
          <button v-for="item in recent" :key="item.id" class="recent-card" @click="open(item)">
            <img v-if="item.cover" class="thumb" :src="item.cover" :alt="item.title" loading="lazy" />
            <span v-else class="thumb thumb-fallback"><TypeIcon :type="item.type" /></span>
            <span class="recent-info">
              <span class="recent-top">
                <span class="tag">{{ statusLabel(item.type, item.status) }}</span>
                <span v-if="item.rating" class="score">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z" /></svg>
                  {{ item.rating }}
                </span>
              </span>
              <span class="recent-title">{{ item.title }}</span>
              <span class="recent-creator">{{ item.creator }}</span>
              <span class="progress-row">
                <span class="track"><span class="bar" :style="{ width: progress[item.status] + '%' }"></span></span>
                <span class="percent">{{ progress[item.status] }}%</span>
              </span>
            </span>
          </button>
        </div>
        <div v-else class="empty">
          <p class="empty-title">Nothing here yet</p>
          <p>Search for a {{ type === 'movie' ? 'movie' : 'book' }} and add it to your library.</p>
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
.home {
  min-height: calc(100vh - 76px);
  background: var(--bg-soft);
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
}

.logo {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--accent);
  color: var(--on-accent);
}

.name {
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.corner {
  margin-left: auto;
}

.segmented {
  display: flex;
  padding: 4px;
  margin-bottom: 14px;
  border-radius: 12px;
  background: var(--surface-2);
}

.segmented button {
  flex: 1;
  padding: 8px 0;
  border: none;
  border-radius: 9px;
  background: none;
  color: var(--muted);
  font-size: 0.88rem;
  font-weight: 500;
  cursor: pointer;
}

.segmented button.active {
  background: var(--surface);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(17, 24, 39, 0.08);
}

.search {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 48px;
  padding: 0 12px 0 14px;
  margin-bottom: 26px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: var(--surface);
  color: var(--subtle);
}

.search input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  color: var(--text);
  font-size: 0.92rem;
}

.filter {
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  background: none;
  color: var(--muted);
  cursor: pointer;
}

.section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 12px;
}

.section-head h2 {
  margin: 0;
  font-size: 1.08rem;
  font-weight: 700;
}

.section-sub {
  margin: -6px 0 12px;
  font-size: 0.8rem;
  color: var(--muted);
}

.shuffle {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0;
  border: none;
  background: none;
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
}

.section-head a {
  color: var(--accent);
  font-size: 0.8rem;
  font-weight: 600;
  text-decoration: none;
}

/* Rangée horizontale d'affiches */
.trending {
  display: flex;
  gap: 14px;
  margin: 0 -20px 26px;
  padding: 0 20px 4px;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-padding-inline: 20px;
  scrollbar-width: none;
}

.trending::-webkit-scrollbar {
  display: none;
}

.poster-card {
  display: flex;
  flex: none;
  flex-direction: column;
  width: 122px;
  padding: 0;
  border: none;
  background: none;
  text-align: left;
  cursor: pointer;
  scroll-snap-align: start;
}

.poster {
  width: 122px;
  height: 176px;
  border-radius: 12px;
  object-fit: cover;
  background: var(--cover-bg);
}

.poster-fallback {
  display: grid;
  place-items: center;
  color: var(--subtle);
}

.skeleton {
  animation: pulse 1.2s ease-in-out infinite;
}

@keyframes pulse {
  50% {
    opacity: 0.5;
  }
}

.poster-title {
  margin-top: 8px;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.poster-year {
  font-size: 0.75rem;
  color: var(--muted);
}

.muted {
  color: var(--muted);
  font-size: 0.85rem;
}

/* Liste « Recently Added » */
.recent {
  display: grid;
  gap: 12px;
}

.recent-card {
  display: flex;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  background: var(--surface);
  text-align: left;
  cursor: pointer;
}

.thumb {
  flex: none;
  width: 56px;
  height: 80px;
  border-radius: 6px;
  object-fit: cover;
  background: var(--cover-bg);
}

.thumb-fallback {
  display: grid;
  place-items: center;
  color: var(--subtle);
}

.recent-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
}

.recent-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.tag {
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--accent-soft);
  color: var(--accent);
  font-size: 0.66rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.score {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.78rem;
  font-weight: 600;
}

.score svg {
  color: var(--star);
}

.recent-title {
  font-size: 0.9rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-creator {
  font-size: 0.78rem;
  color: var(--muted);
}

.progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
}

.track {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--surface-2);
  overflow: hidden;
}

.bar {
  display: block;
  height: 100%;
  border-radius: 2px;
  background: var(--accent);
}

.percent {
  font-size: 0.72rem;
  color: var(--muted);
}
</style>

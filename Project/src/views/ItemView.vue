<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'
import { getItem } from '../api'
import { STATUSES, statusLabel } from '../utils/status'
import { useToast } from '../composables/useToast'
import HeartIcon from '../components/HeartIcon.vue'
import StarRating from '../components/StarRating.vue'
import TypeIcon from '../components/TypeIcon.vue'

const route = useRoute()
const router = useRouter()
const store = useStore()
const { showToast } = useToast()

const fetched = ref(null)
const status = ref('want')
const error = ref('')

// Si l'item est déjà dans la bibliothèque, on affiche la version du store
const saved = computed(() => store.getters['library/getItem'](route.params.id))
const item = computed(() => saved.value ?? fetched.value)
const inLibrary = computed(() => Boolean(saved.value))
const currentStatus = computed(() => (inLibrary.value ? saved.value.status : status.value))

// « 169 min » (OMDb) → « 2h 49m » comme sur la maquette
const runtime = computed(() => {
  const minutes = parseInt(item.value?.runtime, 10)
  if (!minutes) return null
  const h = Math.floor(minutes / 60)
  return h ? `${h}h ${minutes % 60}m` : `${minutes}m`
})

onMounted(async () => {
  if (saved.value) return
  try {
    fetched.value = await getItem(route.params.id)
  } catch (e) {
    error.value = e.message
  }
})

function chooseStatus(s) {
  if (inLibrary.value) store.dispatch('library/setStatus', { id: item.value.id, status: s })
  else status.value = s
}

async function addToLibrary() {
  await store.dispatch('library/addItem', { ...item.value, status: status.value })
  showToast(`"${item.value.title}" added to your library`)
}

function removeFromLibrary() {
  const title = item.value.title
  if (!confirm(`Remove "${title}" from your library?`)) return
  // on garde l'item affiché après la suppression
  fetched.value = { ...saved.value, favorite: false }
  status.value = 'want'
  store.dispatch('library/removeItem', item.value.id)
  showToast(`"${title}" removed from your library`)
}

async function toggleFavorite() {
  if (!inLibrary.value) await store.dispatch('library/addItem', { ...item.value, status: status.value })
  const wasFavorite = saved.value.favorite
  store.dispatch('library/toggleFavorite', item.value.id)
  showToast(wasFavorite ? 'Removed from favorites' : 'Added to favorites')
}

async function share() {
  const url = window.location.href
  try {
    if (navigator.share) await navigator.share({ title: item.value.title, url })
    else {
      await navigator.clipboard.writeText(url)
      showToast('Link copied')
    }
  } catch {
    // partage annulé par l'utilisateur
  }
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/search')
}
</script>

<template>
  <main class="detail">
    <div class="hero">
      <img v-if="item?.cover" :src="item.cover" :alt="item.title" />
      <span v-else-if="item" class="hero-fallback"><TypeIcon :type="item.type" :size="48" /></span>

      <button class="round left" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </button>
      <button v-if="item" class="round right" aria-label="Share" @click="share">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" /><path d="m8.2 10.8 7.6-4.4M8.2 13.2l7.6 4.4" /></svg>
      </button>
    </div>

    <p v-if="error" class="state error">{{ error }}</p>
    <p v-else-if="!item" class="state">Loading…</p>

    <article v-else class="content">
      <h1>{{ item.title }}</h1>
      <p class="meta">
        <span>{{ item.creator }}</span>
        <template v-if="item.year"><span class="dot">·</span><span>{{ item.year }}</span></template>
        <template v-if="runtime"><span class="dot">·</span><span>{{ runtime }}</span></template>
      </p>

      <p v-if="item.rating" class="rating">
        <StarRating :value="item.rating" />
        <strong>{{ item.rating }}</strong>
        <span v-if="item.ratingCount" class="count">({{ item.ratingCount.toLocaleString('en-US') }} ratings)</span>
      </p>

      <h2>Synopsis</h2>
      <p class="synopsis">{{ item.description || 'No description available.' }}</p>

      <h2>My Status</h2>
      <div class="pills">
        <button
          v-for="s in STATUSES"
          :key="s"
          class="pill status"
          :class="{ active: currentStatus === s }"
          :aria-pressed="currentStatus === s"
          @click="chooseStatus(s)"
        >
          {{ statusLabel(item.type, s) }}
        </button>
      </div>

      <div class="actions">
        <button v-if="!inLibrary" class="btn-primary main" @click="addToLibrary">Add to My Library</button>
        <button v-else class="main remove" @click="removeFromLibrary">Remove from My Library</button>
        <button
          class="square-btn fav"
          :class="{ on: saved?.favorite }"
          :aria-pressed="Boolean(saved?.favorite)"
          :aria-label="saved?.favorite ? 'Remove from favorites' : 'Add to favorites'"
          @click="toggleFavorite"
        >
          <HeartIcon :active="Boolean(saved?.favorite)" :size="20" />
        </button>
      </div>
    </article>
  </main>
</template>

<style scoped>
.detail {
  max-width: 720px;
  margin: 0 auto;
}

.hero {
  position: relative;
  display: grid;
  place-items: center;
  aspect-ratio: 16 / 11;
  max-height: 360px;
  width: 100%;
  overflow: hidden;
  background: #0b0b10;
}

.hero img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center 30%;
}

.hero-fallback {
  color: #4b5563;
}

.round {
  position: absolute;
  top: 16px;
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(60, 60, 70, 0.55);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(4px);
}

.left {
  left: 16px;
}

.right {
  right: 16px;
}

.state {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--muted);
}

.state.error {
  color: var(--danger);
}

.content {
  padding: 22px 20px 24px;
}

h1 {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 6px 0 10px;
  font-size: 0.9rem;
  color: var(--muted);
}

.dot {
  color: var(--subtle);
}

.rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 0.9rem;
}

.count {
  color: var(--subtle);
}

h2 {
  margin: 20px 0 6px;
  font-size: 1rem;
  font-weight: 700;
}

.synopsis {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--muted);
}

.status {
  padding: 8px 16px;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.main {
  flex: 1;
  height: 50px;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 600;
}

.remove {
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--danger);
  cursor: pointer;
}

.fav {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  color: var(--text);
}

.fav.on {
  color: var(--danger);
}
</style>

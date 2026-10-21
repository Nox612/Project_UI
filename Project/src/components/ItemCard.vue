<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useToast } from '@/composables/useToast'
import StatusBadge from './StatusBadge.vue'
import HeartIcon from './HeartIcon.vue'
import TypeIcon from './TypeIcon.vue'

const props = defineProps({
  item: { type: Object, required: true },
})

const store = useStore()
const { showToast } = useToast()

const itemLink = computed(() => ({ name: 'item', params: { id: props.item.id } }))

function toggleFavorite() {
  const wasFavorite = props.item.favorite
  store.dispatch('library/toggleFavorite', props.item.id)
  showToast(wasFavorite ? 'Removed from favorites' : 'Added to favorites')
}

function nextStatus() {
  store.dispatch('library/nextStatus', props.item.id)
}

function remove() {
  const title = props.item.title
  if (confirm(`Remove "${title}" from your library?`)) {
    store.dispatch('library/removeItem', props.item.id)
    showToast(`"${title}" removed from your library`)
  }
}
</script>

<template>
  <article class="card">
    <div class="cover">
      <RouterLink :to="itemLink" class="cover-link" :aria-label="`Open ${item.title}`">
        <img v-if="item.cover" :src="item.cover" :alt="`Cover of ${item.title}`" loading="lazy" />
        <span v-else class="cover-fallback"><TypeIcon :type="item.type" :size="34" /></span>
      </RouterLink>

      <button
        class="fav"
        :class="{ active: item.favorite }"
        :aria-pressed="item.favorite"
        :title="item.favorite ? 'Remove from favorites' : 'Add to favorites'"
        :aria-label="item.favorite ? 'Remove from favorites' : 'Add to favorites'"
        @click="toggleFavorite"
      >
        <HeartIcon :active="item.favorite" :size="17" />
      </button>

      <button class="remove" title="Remove from library" aria-label="Remove from library" @click="remove">
        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
        </svg>
      </button>
    </div>

    <RouterLink :to="itemLink" class="title" :title="item.title">{{ item.title }}</RouterLink>
    <p class="meta">
      <TypeIcon :type="item.type" />
      {{ item.type === 'book' ? 'Book' : 'Movie' }}
    </p>

    <button class="status-btn" title="Change status" @click="nextStatus">
      <StatusBadge :type="item.type" :status="item.status" />
    </button>
  </article>
</template>

<style scoped>
.card {
  display: flex;
  flex-direction: column;
  padding: 7px;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04);
}

.cover {
  position: relative;
  aspect-ratio: 0.96;
  border-radius: 8px;
  overflow: hidden;
  background: var(--cover-bg);
}

.cover-link {
  display: block;
  height: 100%;
  text-decoration: none;
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.cover-fallback {
  display: grid;
  place-items: center;
  height: 100%;
  color: var(--subtle);
}

/* Cœur : rond blanc + cœur rouge si favori, rond gris + cœur barré sinon */
.fav {
  position: absolute;
  top: 6px;
  right: 6px;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  background: rgba(17, 24, 39, 0.35);
  color: #fff;
  cursor: pointer;
  backdrop-filter: blur(2px);
}

.fav.active {
  background: #fff;
  color: var(--danger);
}

/* Suppression : visible au survol sur ordinateur.
   Sur mobile, on supprime depuis la page de détail (bouton « Remove »). */
.remove {
  position: absolute;
  top: 6px;
  left: 6px;
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  color: var(--muted);
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s;
}

.card:hover .remove,
.remove:focus-visible {
  opacity: 1;
}

@media (hover: none) {
  .remove {
    display: none;
  }
}

.title {
  margin: 8px 3px 0;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 2px 3px 0;
  font-size: 0.72rem;
  color: var(--muted);
}

.status-btn {
  margin-top: 8px;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
}

.status-btn :deep(.badge) {
  display: block;
  width: 100%;
  text-align: center;
}
</style>

<script setup>
import { computed, ref } from 'vue'
import { useStore } from 'vuex'
import ItemList from '@/components/ItemList.vue'

const store = useStore()
const favorites = computed(() => store.getters['library/favorites'])

const typeFilters = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'book', label: 'Books' },
]
const typeFilter = ref('all')

const shown = computed(() =>
  typeFilter.value === 'all' ? favorites.value : favorites.value.filter((i) => i.type === typeFilter.value),
)
</script>

<template>
  <main class="page">
    <header class="page-header">
      <h1>Favorites</h1>
    </header>

    <template v-if="favorites.length">
      <div class="pills type-pills" role="group" aria-label="Type">
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

      <ItemList v-if="shown.length" :items="shown" />
      <div v-else class="empty">
        <p class="empty-title">Nothing here</p>
        <p>No favorite of this type yet.</p>
      </div>
    </template>

    <div v-else class="empty">
      <p class="empty-title">No favorites yet</p>
      <p>Tap the heart on an item to add it here.</p>
      <RouterLink to="/library" class="btn-primary">Go to my library</RouterLink>
    </div>
  </main>
</template>

<style scoped>
.type-pills {
  margin-bottom: 18px;
}
</style>

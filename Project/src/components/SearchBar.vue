<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  loading: Boolean,
  initialQuery: { type: String, default: '' },
  initialType: { type: String, default: 'movie' },
})
const emit = defineEmits(['search'])
const router = useRouter()

const query = ref(props.initialQuery)
const type = ref(props.initialType)

const types = [
  { value: 'all', label: 'All' },
  { value: 'movie', label: 'Movies' },
  { value: 'book', label: 'Books' },
]

function submit() {
  if (!query.value.trim()) return
  emit('search', { query: query.value, type: type.value })
}

// Changer de type relance la recherche en cours
watch(type, () => {
  if (query.value.trim()) submit()
})

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}
</script>

<template>
  <form class="search-bar" role="search" @submit.prevent="submit">
    <div class="row">
      <button type="button" class="back" aria-label="Back" @click="goBack">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6" /></svg>
      </button>

      <div class="field">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
        <input v-model="query" type="search" placeholder="Search movies, books…" aria-label="Search" enterkeyhint="search" />
        <span v-if="loading" class="spinner" aria-hidden="true"></span>
        <button v-else-if="query" type="button" class="clear" aria-label="Clear" @click="query = ''">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></svg>
        </button>
      </div>
    </div>

    <div class="pills" role="group" aria-label="Type">
      <button
        v-for="t in types"
        :key="t.value"
        type="button"
        class="pill"
        :class="{ active: type === t.value }"
        :aria-pressed="type === t.value"
        @click="type = t.value"
      >
        {{ t.label }}
      </button>
    </div>
  </form>
</template>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.back {
  display: grid;
  place-items: center;
  flex: none;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  background: none;
  color: var(--text);
  cursor: pointer;
}

.field {
  display: flex;
  flex: 1;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 12px;
  border: 1.5px solid var(--accent);
  border-radius: 12px;
  background: var(--bg-soft);
  color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-soft);
}

.field input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: none;
  color: var(--text);
  font-size: 0.95rem;
}

.field input::-webkit-search-cancel-button {
  display: none;
}

.clear {
  display: grid;
  place-items: center;
  padding: 0;
  border: none;
  background: none;
  color: var(--subtle);
  cursor: pointer;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>

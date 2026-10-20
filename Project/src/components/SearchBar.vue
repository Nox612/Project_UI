<script setup>
import { ref } from 'vue'

defineProps({ loading: Boolean })
const emit = defineEmits(['search'])

const query = ref('')
const type = ref('movie')

function submit() {
  if (!query.value.trim()) return
  emit('search', { query: query.value, type: type.value })
}
</script>

<template>
  <div class="search-bar">
    <select v-model="type">
      <option value="movie">Films</option>
      <option value="book">Livres</option>
    </select>
    <input v-model="query" placeholder="Interstellar…" @keyup.enter="submit" />
    <button :disabled="loading" @click="submit">Rechercher</button>
  </div>
</template>
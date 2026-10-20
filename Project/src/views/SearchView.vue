<script setup>
import { ref } from 'vue'
import { searchItems } from '../api'
import SearchBar from '../components/SearchBar.vue'
import ResultCard from '../components/ResultCard.vue'
import ItemDetail from '../components/ItemDetail.vue'

const results = ref([])
const selected = ref(null)
const loading = ref(false)
const error = ref('')
const searched = ref(false)

async function onSearch({ query, type }) {
  loading.value = true
  error.value = ''
  selected.value = null
  try {
    results.value = await searchItems(query, type)
    searched.value = true
  } catch (e) {
    error.value = e.message
    results.value = []
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main>
    <h1>Recherche</h1>

    <SearchBar :loading="loading" @search="onSearch" />

    <p v-if="loading">Recherche en cours…</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="searched && !results.length">Aucun résultat.</p>

    <ul>
      <ResultCard
        v-for="item in results"
        :key="item.id"
        :item="item"
        @select="selected = $event"
      />
    </ul>

    <ItemDetail v-if="selected" :item="selected" @close="selected = null" />
  </main>
</template>
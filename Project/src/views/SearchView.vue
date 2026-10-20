<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { searchItems } from '../api'
import SearchBar from '../components/SearchBar.vue'
import ResultCard from '../components/ResultCard.vue'

const router = useRouter()
const results = ref([])
const loading = ref(false)
const error = ref('')
const searched = ref(false)

async function onSearch({ query, type }) {
  loading.value = true
  error.value = ''
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

const openItem = (item) => router.push({ name: 'item', params: { id: item.id } })
</script>

<template>
  <main>
    <h1>Recherche</h1>
    <SearchBar :loading="loading" @search="onSearch" />

    <p v-if="loading">Recherche en cours…</p>
    <p v-else-if="error">{{ error }}</p>
    <p v-else-if="searched && !results.length">Aucun résultat.</p>

    <ul>
      <ResultCard v-for="item in results" :key="item.id" :item="item" @select="openItem" />
    </ul>
  </main>
</template>
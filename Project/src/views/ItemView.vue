<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getItem } from '../api'
import { STATUSES, statusLabel } from '../utils/status'

const route = useRoute()
const router = useRouter()

const item = ref(null)
const status = ref('want')
const error = ref('')

const stars = computed(() => {
  const full = Math.round(item.value?.rating ?? 0)
  return '★'.repeat(full) + '☆'.repeat(5 - full)
})

onMounted(async () => {
  try {
    item.value = await getItem(route.params.id)
  } catch (e) {
    error.value = e.message
  }
})

function addToLibrary() {
  // TODO (binôme) : store.dispatch('addItem', { ...item.value, status: status.value })
  console.log('Ajout :', { ...item.value, status: status.value })
}
</script>

<template>
  <main>
    <button @click="router.back()">← Retour</button>

    <p v-if="error">{{ error }}</p>
    <p v-else-if="!item">Chargement…</p>

    <article v-else>
      <img v-if="item.cover" :src="item.cover" :alt="item.title" width="160" />
      <h1>{{ item.title }}</h1>
      <p>
        {{ item.creator }} · {{ item.year }}
        <span v-if="item.runtime"> · {{ item.runtime }}</span>
      </p>
      <p v-if="item.rating">
        {{ stars }} {{ item.rating }}
        <small v-if="item.ratingCount">({{ item.ratingCount.toLocaleString('fr-FR') }} avis)</small>
      </p>

      <h2>Synopsis</h2>
      <p>{{ item.description || 'Aucune description disponible.' }}</p>

      <h2>My Status</h2>
      <div>
        <button
          v-for="s in STATUSES"
          :key="s"
          :aria-pressed="status === s"
          :style="{ fontWeight: status === s ? '700' : '400' }"
          @click="status = s"
        >
          {{ statusLabel(item.type, s) }}
        </button>
      </div>

      <button @click="addToLibrary">Add to My Library</button>
    </article>
  </main>
</template>
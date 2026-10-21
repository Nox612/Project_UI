<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: Number, required: true }, // note sur 5
})

// Pour chaque étoile : 'full', 'half' ou 'empty'
const stars = computed(() =>
  [0, 1, 2, 3, 4].map((i) => {
    const rest = props.value - i
    if (rest >= 0.75) return 'full'
    if (rest >= 0.25) return 'half'
    return 'empty'
  }),
)

// identifiant unique pour le clipPath de chaque composant
const uid = `star-${Math.random().toString(36).slice(2, 8)}`

const STAR ='m12 3.5 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z'
</script>

<template>
  <span class="stars" :aria-label="`${value} out of 5`">
    <svg v-for="(s, i) in stars" :key="i" viewBox="0 0 24 24" width="18" height="18" :class="`star-${s}`">
      <!-- étoile à moitié : on ne garde que la partie gauche -->
      <template v-if="s === 'half'">
        <defs>
          <clipPath :id="`${uid}-half`"><rect x="0" y="0" width="12.5" height="24" /></clipPath>
        </defs>
        <path :d="STAR" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none" :clip-path="`url(#${uid}-half)`" />
      </template>
      <path v-else :d="STAR" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" fill="none" />
    </svg>
  </span>
</template>

<style scoped>
.stars {
  display: inline-flex;
  gap: 2px;
  color: var(--star);
}

.star-empty {
  color: var(--border);
}
</style>

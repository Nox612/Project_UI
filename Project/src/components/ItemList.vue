<script setup>
import ItemCard from './ItemCard.vue'

defineProps({
  items: { type: Array, required: true },
})
</script>

<template>
  <div class="grid">
    <ItemCard v-for="item in items" :key="item.id" :item="item" />
  </div>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px 14px;
}

@media (min-width: 640px) {
  .grid {
    grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
    gap: 16px;
  }
}
</style>

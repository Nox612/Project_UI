<script setup>
defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits(['select'])
</script>

<template>
  <li class="result-card">
    <img v-if="item.cover" :src="item.cover" :alt="item.title" width="90" />
    <div>
      <h3>{{ item.title }}</h3>
      <p>{{ item.creator }} – {{ item.year }}</p>
      <button @click="emit('select', item)">Sélectionner</button>
    </div>
  </li>
</template>
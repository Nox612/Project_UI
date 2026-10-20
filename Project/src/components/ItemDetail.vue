<script setup>
defineProps({
  item: { type: Object, required: true },
})
const emit = defineEmits(['close'])
</script>

<template>
  <section class="item-detail">
    <h2>{{ item.title }}</h2>
    <p>{{ item.creator }} – {{ item.year }}</p>
    <p>{{ item.description }}</p>
    <button @click="emit('close')">Fermer</button>
  </section>
</template>
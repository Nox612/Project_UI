<script setup>
import TypeIcon from './TypeIcon.vue'

defineProps({
  item: { type: Object, required: true },
  inLibrary: Boolean,
})
const emit = defineEmits(['select', 'add'])
</script>

<template>
  <li class="result-card" @click="emit('select', item)">
    <div class="cover">
      <img v-if="item.cover" :src="item.cover" :alt="item.title" loading="lazy" />
      <TypeIcon v-else :type="item.type" :size="22" />
    </div>

    <div class="info">
      <h3>{{ item.title }}</h3>
      <p>{{ item.creator }}</p>
      <span v-if="item.year" class="year">{{ item.year }}</span>
    </div>

    <button
      class="add"
      :class="{ added: inLibrary }"
      :disabled="inLibrary"
      :aria-label="inLibrary ? 'Already in your library' : `Add ${item.title} to your library`"
      @click.stop="emit('add', item)"
    >
      {{ inLibrary ? '✓ Added' : '+ Add' }}
    </button>
  </li>
</template>

<style scoped>
.result-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 12px 10px 10px;
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  background: var(--surface);
  box-shadow: 0 1px 2px rgba(17, 24, 39, 0.04);
  list-style: none;
  cursor: pointer;
}

.result-card:hover {
  border-color: var(--border);
}

.cover {
  display: grid;
  place-items: center;
  flex: none;
  width: 56px;
  height: 84px;
  border-radius: 6px;
  overflow: hidden;
  background: var(--cover-bg);
  color: var(--subtle);
}

.cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  flex: 1;
  min-width: 0;
}

.info h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.info p {
  margin: 3px 0 7px;
  font-size: 0.8rem;
  color: var(--muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.year {
  padding: 2px 8px;
  border-radius: 5px;
  background: var(--bg-soft);
  font-size: 0.72rem;
  color: var(--subtle);
}

.add {
  flex: none;
  padding: 7px 13px;
  border: none;
  border-radius: 999px;
  background: var(--add-bg);
  color: var(--add-fg);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
}

.add.added {
  background: var(--surface-2);
  color: var(--muted);
  cursor: default;
}
</style>

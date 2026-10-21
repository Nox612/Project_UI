<script setup>
import { computed } from 'vue'
import { statusLabel } from '@/utils/status'

const props = defineProps({
  type: { type: String, required: true },
  status: { type: String, required: true },
})

const label = computed(() => statusLabel(props.type, props.status) ?? props.status)
</script>

<template>
  <span class="badge" :class="status">{{ label }}</span>
</template>

<style scoped>
.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--want-bg);
  color: var(--want-fg);
}

.badge.in-progress {
  background: var(--progress-bg);
  color: var(--progress-fg);
}

.badge.done {
  background: var(--done-bg);
  color: var(--done-fg);
}
</style>

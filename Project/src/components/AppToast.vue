<script setup>
import { useToast } from '@/composables/useToast'

const { message } = useToast()
</script>

<template>
  <Transition name="toast">
    <div v-if="message" class="toast" role="status">{{ message }}</div>
  </Transition>
</template>

<style scoped>
.toast {
  position: fixed;
  left: 50%;
  bottom: 84px;
  z-index: 100;
  transform: translateX(-50%);
  max-width: calc(100% - 32px);
  padding: 10px 18px;
  border-radius: 12px;
  background: var(--text);
  color: var(--surface);
  font-size: 0.85rem;
  box-shadow: var(--shadow);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>

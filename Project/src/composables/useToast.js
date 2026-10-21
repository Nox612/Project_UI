import { ref } from 'vue'

// Petite notification partagée par toute l'appli.
// Usage : const { showToast } = useToast(); showToast('Added to your library')
const message = ref('')
let timer = null

export function useToast() {
  function showToast(text, duration = 2500) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = ''), duration)
  }

  return { message, showToast }
}

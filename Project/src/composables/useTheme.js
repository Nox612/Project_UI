import { ref } from 'vue'

// Thème clair / sombre, mémorisé dans localStorage.
// Par défaut : clair, comme la maquette Figma.
const STORAGE_KEY = 'theme'

function readSaved() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

const theme = ref(readSaved() === 'dark' ? 'dark' : 'light')

export function applyTheme() {
  document.documentElement.dataset.theme = theme.value
}

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    applyTheme()
    try {
      localStorage.setItem(STORAGE_KEY, theme.value)
    } catch {
      // stockage indisponible : le thème ne sera juste pas mémorisé
    }
  }

  return { theme, toggleTheme }
}

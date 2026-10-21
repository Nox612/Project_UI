// Sauvegarde de la bibliothèque dans localStorage.
// Le plugin écoute chaque mutation du module "library" et enregistre
// la collection complète après le changement.

export const STORAGE_KEY = 'library'

export function readLibrary() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return Array.isArray(saved) ? saved.filter((item) => item && item.id) : []
  } catch {
    return []
  }
}

export function writeLibrary(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // stockage indisponible (navigation privée, quota plein) : on ignore
  }
}

export default function persistencePlugin(store) {
  store.subscribe((mutation, state) => {
    if (mutation.type.startsWith('library/')) {
      writeLibrary(state.library.items)
    }
  })
}

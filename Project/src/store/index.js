import { createStore } from 'vuex'
import library from './modules/library'
import persistencePlugin from './plugins/persistence'

const store = createStore({
  modules: {
    library,
  },
  plugins: [persistencePlugin],
})

// Recharge la collection sauvegardée au démarrage de l'application
store.dispatch('library/loadLibrary')

export default store

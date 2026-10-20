import { createStore } from 'vuex'
import library from './modules/library'

const store = createStore({
  modules: {
    library,
  },
})

export default store

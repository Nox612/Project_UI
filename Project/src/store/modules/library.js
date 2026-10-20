import { STATUSES } from '../../utils/status'

// Module Vuex "library" : la collection personnelle de l'utilisateur.
//
// Format d'un item (même format que celui renvoyé par src/api) :
// {
//   id: "tt0816692",              // id de l'API
//   type: "movie",                // "movie" ou "book"
//   title: "Interstellar",
//   creator: "Christopher Nolan", // auteur ou réalisateur
//   year: 2014,
//   cover: "https://...",
//   description: "...",
//   favorite: false,
//   status: "want",               // "want", "in-progress" ou "done"
//   addedAt: 1729450000000        // date d'ajout (ajoutée par le store)
// }

const state = () => ({
  items: [],
})

const getters = {
  allItems: (state) => state.items,
  favorites: (state) => state.items.filter((item) => item.favorite),
  isInLibrary: (state) => (id) => state.items.some((item) => item.id === id),
  getItem: (state) => (id) => state.items.find((item) => item.id === id),
}

const mutations = {
  ADD_ITEM(state, item) {
    state.items.push(item)
  },
  REMOVE_ITEM(state, id) {
    state.items = state.items.filter((item) => item.id !== id)
  },
  TOGGLE_FAVORITE(state, id) {
    const item = state.items.find((i) => i.id === id)
    if (item) item.favorite = !item.favorite
  },
  SET_STATUS(state, { id, status }) {
    const item = state.items.find((i) => i.id === id)
    if (item) item.status = status
  },
  SET_LIBRARY(state, items) {
    state.items = items
  },
}

const actions = {
  // Renvoie false si l'item est déjà dans la bibliothèque (pas de doublon)
  addItem({ commit, getters }, item) {
    if (getters.isInLibrary(item.id)) return false
    commit('ADD_ITEM', {
      ...item,
      favorite: Boolean(item.favorite),
      status: STATUSES.includes(item.status) ? item.status : 'want',
      addedAt: Date.now(),
    })
    return true
  },
  removeItem({ commit }, id) {
    commit('REMOVE_ITEM', id)
  },
  toggleFavorite({ commit }, id) {
    commit('TOGGLE_FAVORITE', id)
  },
  setStatus({ commit }, { id, status }) {
    if (STATUSES.includes(status)) commit('SET_STATUS', { id, status })
  },
  // Passe au statut suivant : want → in-progress → done → want
  nextStatus({ commit, getters }, id) {
    const item = getters.getItem(id)
    if (!item) return
    const next = STATUSES[(STATUSES.indexOf(item.status) + 1) % STATUSES.length]
    commit('SET_STATUS', { id, status: next })
  },
  loadLibrary({ commit }, items = []) {
    commit('SET_LIBRARY', items)
  },
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions,
}

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import SearchView from '../views/SearchView.vue'
import LibraryView from '../views/LibraryView.vue'
import FavoritesView from '../views/FavoritesView.vue'
import ProfileView from '../views/ProfileView.vue'
import ItemView from '../views/ItemView.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/search', name: 'search', component: SearchView },
    { path: '/library', name: 'library', component: LibraryView },
    { path: '/favorites', name: 'favorites', component: FavoritesView },
    { path: '/profile', name: 'profile', component: ProfileView },
    { path: '/item/:id', name: 'item', component: ItemView },
  ],
})
<script setup>
const tabs = [
  { to: '/', label: 'Home' },
  { to: '/search', label: 'Search' },
  { to: '/library', label: 'Library' },
  { to: '/favorites', label: 'Favorites' },
]
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to">{{ tab.label }}</RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed; left: 0; right: 0; bottom: 0;
  display: flex; justify-content: space-around;
  padding: 0.75rem 0; background: #fff; border-top: 1px solid #e2e2e6;
}
.bottom-nav a { color: #6b6b72; text-decoration: none; font-size: 0.85rem; }
.bottom-nav a.router-link-active { color: #4f46e5; font-weight: 600; }
</style>
<script setup>
// Icônes de la barre du bas de la maquette (écran d'accueil)
const tabs = [
  { to: '/', label: 'Home', icon: 'M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z' },
  { to: '/search', label: 'Search', icon: 'M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13zM20 20l-4.2-4.2' },
  { to: '/library', label: 'Library', icon: 'M3.5 6.5a1.5 1.5 0 0 1 1.5-1.5h4.2l2 2.2H19a1.5 1.5 0 0 1 1.5 1.5v9.3A1.5 1.5 0 0 1 19 19.5H5a1.5 1.5 0 0 1-1.5-1.5z' },
  { to: '/favorites', label: 'Favorites', icon: 'm12 3.8 2.5 5.1 5.6.8-4 3.9.9 5.6-5-2.6-5 2.6.9-5.6-4-3.9 5.6-.8z' },
]
</script>

<template>
  <nav class="bottom-nav">
    <RouterLink v-for="tab in tabs" :key="tab.to" :to="tab.to" class="tab">
      <svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path :d="tab.icon" />
      </svg>
      <span>{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  justify-content: space-around;
  padding: 10px 0 14px;
  background: var(--surface);
  border-top: 1px solid var(--border-soft);
}

.tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  min-width: 64px;
  color: var(--subtle);
  font-size: 0.7rem;
  text-decoration: none;
}

/* « Home » n'est actif que sur la page d'accueil exacte */
.tab.router-link-exact-active,
.tab:not([href='/']).router-link-active {
  color: var(--accent);
  font-weight: 600;
}
</style>

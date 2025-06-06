import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { useMainStore } from '@/stores/main.ts'
import { useDarkModeStore } from './stores/darkMode'
import { ToolTipDirective } from 'virtigia-tips'
import './css/main.css'
import 'virtigia-tips/style.css';
// Init Pinia
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

// Create Vue app
createApp(App)
  .use(router)
  .directive('tip', ToolTipDirective)
  .use(pinia)
  .mount('#app')

// Init main store
// const mainStore = useMainStore(pinia)

// Fetch sample data
// mainStore.fetchSampleClients()
// mainStore.fetchSampleHistory()

// Dark mode
// Uncomment, if you'd like to restore persisted darkMode setting, or use `prefers-color-scheme: dark`. Make sure to uncomment localStorage block in src/stores/darkMode.js


const darkModeStore = useDarkModeStore(pinia)

if(!localStorage['darkMode']) {
  localStorage.setItem('darkMode', '1');
}

if (
  (!localStorage['darkMode'] && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
  localStorage['darkMode'] === '1'
) {
  darkModeStore.set(true)
}

// Default title tag
const defaultDocumentTitle = 'Margatron'

// Set document title from route meta
router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle
})

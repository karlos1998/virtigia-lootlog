import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from './App.vue'
import router from './router'
import { useDarkModeStore } from './stores/darkMode'
import { ToolTipDirective } from 'virtigia-tips'
import './css/main.css'
import 'virtigia-tips/style.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
  .use(router)
  .directive('tip', ToolTipDirective)
  .use(pinia)
  .mount('#app')

const darkModeStore = useDarkModeStore(pinia)

if (!localStorage['darkMode']) {
  localStorage.setItem('darkMode', '1')
}

if (
  (!localStorage['darkMode'] && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
  localStorage['darkMode'] === '1'
) {
  darkModeStore.set(true)
}

const defaultDocumentTitle = 'Margatron'

router.afterEach((to) => {
  document.title = to.meta?.title
    ? `${to.meta.title} — ${defaultDocumentTitle}`
    : defaultDocumentTitle
})

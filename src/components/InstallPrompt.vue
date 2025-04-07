<template>
  <Transition name="fade">
    <div
      v-if="visible"
      class="fixed bottom-4 left-4 right-4 mx-auto max-w-md bg-zinc-900 text-white px-4 py-3 rounded-2xl shadow-lg z-50 flex items-start gap-4"
    >
      <div class="flex-1">
        <p class="font-semibold text-lg">Zainstaluj LootLog</p>
        <p class="text-sm opacity-80">
          {{ isIOS
          ? 'Kliknij Udostępnij w Safari, a potem "Dodaj do ekranu początkowego".'
          : 'Kliknij poniżej, aby zainstalować aplikację.' }}
        </p>
      </div>
      <div v-if="canInstall">
        <button
          @click="install"
          class="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-xl text-sm font-medium"
        >
          Zainstaluj
        </button>
      </div>
      <button
        class="ml-2 text-white opacity-60 hover:opacity-100"
        @click="visible = false"
      >
        ✕
      </button>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const visible = ref(false)
const deferredPrompt = ref(null)
const canInstall = ref(false)
const isIOS = ref(false)

onMounted(() => {
  const userAgent = window.navigator.userAgent.toLowerCase()
  isIOS.value =
    /iphone|ipad|ipod/.test(userAgent) && 'standalone' in window.navigator && !window.navigator.standalone

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt.value = e
    canInstall.value = true
    visible.value = true
  })

  // Pokaż też dla iOS jeśli spełnia warunki
  if (isIOS.value) {
    visible.value = true
  }
})

const install = async () => {
  if (deferredPrompt.value) {
    deferredPrompt.value.prompt()
    const { outcome } = await deferredPrompt.value.userChoice
    if (outcome === 'accepted') visible.value = false
    deferredPrompt.value = null
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>

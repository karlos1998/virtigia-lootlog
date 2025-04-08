<script setup>
import { computed } from 'vue'
import { useDarkModeStore } from '@/stores/darkMode.js'
import { gradientBgPurplePink, gradientBgDark, gradientBgPinkRed } from '@/colors.js'

const props = defineProps({
  bg: {
    type: String,
    required: true,
    validator: (value) => ['purplePink', 'pinkRed'].includes(value),
  },
})

const colorClass = computed(() => {
  if (useDarkModeStore().isEnabled) {
    return gradientBgDark
  }

  switch (props.bg) {
    case 'purplePink':
      return gradientBgPurplePink
    case 'pinkRed':
      return gradientBgPinkRed
  }

  return ''
})
</script>

<template>
  <section
    class="flex flex-col items-center md:flex-row md:justify-around md:px-6 min-h-screen transition-background-image duration-1000"
    :class="colorClass"
  >
    <div  class="space-y-12">

      <div class="text-center text-white py-12 md:py-0">
        <div class="flex items-center justify-center align-items-center ">
          <!-- logo here -->
        </div>
        <h1 class="text-5xl lg:text-5xl font-black italic">Margatron Lootlog</h1>
        <h2 class="text-2xl italic">Oficjalny dodatek</h2>
      </div>
      <div
        class="hidden md:block py-12 md:py-0 text-center text-white text-opacity-50 dark:text-opacity-80"
      >
        <p>
          Historia walk
        </p>
        <p>
          Zdobyte przedmioty
        </p>
        <p>
          Podział łupów
        </p>
      </div>
      <div class="hidden md:block text-white">
        <!-- logo 2 -->
      </div>
    </div>

    <slot />
  </section>
</template>

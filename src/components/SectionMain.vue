<script setup>
import { containerMaxW } from '@/config.js'
</script>

<template>
  <section class="lootlog-main p-4 md:p-6" :class="containerMaxW">
    <slot />
  </section>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    default: null,
  },
})

const username = computed(() => props.username)
</script>

<template>
  <div class="inline-block overflow-hidden w-[32px] h-[32px]">
    <img
      :src="avatar"
      :alt="username"
      class="w-auto h-[48px] object-none object-left-top"
    />
    <slot />
  </div>
</template>

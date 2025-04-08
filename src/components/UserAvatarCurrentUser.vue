<script setup>
import { useMainStore } from '@/stores/main.js'
import UserAvatar from '@/components/UserAvatar.vue'

const mainStore = useMainStore()
</script>

<template>
  <UserAvatar :username="mainStore.userName" :avatar="mainStore.userAvatar">
    <slot />
  </UserAvatar>
</template>

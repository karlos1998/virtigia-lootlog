<script setup lang="ts">
defineProps<{
  header: string
  name: string
}>()
</script>

<template>
  <slot name="body" v-bind="{ row, index }" />
</template>

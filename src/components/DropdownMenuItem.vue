<script setup lang="ts">
import BaseIcon from '@/components/BaseIcon.vue'

const props = defineProps<{
  icon?: string
  label: string
  value?: any
}>()

const emit = defineEmits<{
  (e: 'click', value: any): void
}>()

const handleClick = () => {
  emit('click', props.value || props.label)
}
</script>

<template>
  <div class="dropdown-item" @click="handleClick">
    <BaseIcon v-if="icon" :path="icon" class="mr-2 flex-shrink-0" size="18" />
    <span>{{ label }}</span>
  </div>
</template>

<style scoped>
.dropdown-item {
  display: flex;
  align-items: center;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #374151;
  cursor: pointer;
}

.dark .dropdown-item {
  color: #e5e7eb;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dark .dropdown-item:hover {
  background-color: #334155;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { mdiDotsVertical } from '@mdi/js'
import BaseIcon from '@/components/BaseIcon.vue'
import BaseButton from '@/components/BaseButton.vue'

const props = defineProps<{
  icon?: string
  color?: string
  label?: string
  small?: boolean
  outline?: boolean
}>()

const emit = defineEmits<{
  (e: 'click-item', item: any): void
}>()

const isDropdownActive = ref(false)
const root = ref<HTMLElement | null>(null)

const toggleDropdown = () => {
  isDropdownActive.value = !isDropdownActive.value
}

const handleItemClick = (item: any) => {
  emit('click-item', item)
  isDropdownActive.value = false
}

const forceClose = (event: MouseEvent) => {
  if (root.value && !root.value.contains(event.target as Node)) {
    isDropdownActive.value = false
  }
}

onMounted(() => {
  window.addEventListener('click', forceClose)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', forceClose)
})
</script>

<template>
  <div ref="root" class="relative inline-block">
    <BaseButton
      :icon="icon || mdiDotsVertical"
      :color="color || 'whiteDark'"
      :label="label"
      :small="small"
      :outline="outline"
      @click.stop="toggleDropdown"
    />
    <div
      v-if="isDropdownActive"
      class="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-md shadow-lg z-50 py-1 border border-gray-100 dark:border-slate-700"
    >
      <slot @click="handleItemClick" />
    </div>
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

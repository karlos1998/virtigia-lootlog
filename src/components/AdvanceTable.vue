<script setup lang="ts" generic="T">
import { ref, computed, useSlots } from 'vue'
import { PageableObject, SortObject } from '@/api/api'
import BaseLevel from '@/components/BaseLevel.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'

export interface PageDTO {
  totalPages?: number
  totalElements?: number
  first?: boolean
  last?: boolean
  size?: number
  content?: T[]
  number?: number
  sort?: SortObject
  pageable?: PageableObject
  numberOfElements?: number
  empty?: boolean
}

const props = defineProps<{
  data: PageDTO
}>()

const slots = useSlots()

const hasEmptySlot = computed(() => !!slots.empty)
const isEmpty = computed(() => !props.data.content || props.data.content.length === 0 || props.data.empty)

const columns = computed(() => {
  const slotNodes = slots.default?.() || []
  return slotNodes.map(slot => ({
    header: slot.props?.header,
    name: slot.props?.name,
    body: slot.children?.body,
  }))
})

const numPages = computed(() => props.data.totalPages ?? 1)
const currentPage = computed(() => props.data.number ?? 0)
const currentPageHuman = computed(() => currentPage.value + 1)

// Enhanced pagination algorithm
const pages = computed(() => {
  const total = numPages.value
  const current = currentPage.value
  const delta = 2
  const result = []

  // Always include first page
  if (total > 0) {
    result.push(0)
  }

  // Calculate range around current page
  let rangeStart = Math.max(1, current - delta)
  let rangeEnd = Math.min(total - 1, current + delta)

  // Adjust range to ensure we always show 2*delta+1 pages if possible
  if (rangeEnd - rangeStart < 2 * delta) {
    rangeStart = Math.max(1, rangeEnd - 2 * delta)
    rangeEnd = Math.min(total - 1, rangeStart + 2 * delta)
  }

  // Add ellipsis after first page if needed
  if (rangeStart > 1) {
    result.push('ellipsis1')
  }

  // Add pages around current page
  for (let i = rangeStart; i <= rangeEnd; i++) {
    result.push(i)
  }

  // Add significant jump points (multiples of 10)
  const jumpPoints = []
  for (let i = 10; i < total; i += 10) {
    // Only add if not already in range and not too close to last page
    if (i > rangeEnd + 1 && i < total - 1) {
      jumpPoints.push(i)
    }
  }

  // Add ellipsis and jump points if needed
  if (rangeEnd < total - 2) {
    if (jumpPoints.length > 0) {
      result.push('ellipsis2')

      // Add jump points with ellipsis between them
      let prevJump = rangeEnd
      for (const jump of jumpPoints) {
        if (jump - prevJump > 10) {
          result.push(jump)
          result.push(`ellipsis-${jump}`)
        }
        prevJump = jump
      }
    } else {
      result.push('ellipsis2')
    }
  }

  // Always include last page if not already included
  if (total > 1 && !result.includes(total - 1)) {
    result.push(total - 1)
  }

  return result
})


const emit = defineEmits<{
  (e: 'changePage', number: number): void
}>() // to, poniewaz tego nowszego nie ogarnia phpstorm :D
// const emit = defineEmits<{
//   changePage: [number: number]
// }>()
const changePage = (targetPage: number) => {
  emit('changePage', targetPage);
}
</script>

<template>
  <div v-if="isEmpty">
    <slot name="empty">
      <div class="p-6 text-center text-gray-500 dark:text-gray-400">
        Brak danych do wyświetlenia
      </div>
    </slot>
  </div>

  <template v-else>
    <table>
      <thead>
      <tr>
        <th v-for="column in columns" :key="column.name">
          {{ column.header }}
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(row, index) in data.content" :key="(row as any).id ?? index">
        <td v-for="column in columns" :key="column.name" :data-label="column.header">
          <component
            :is="column.body"
            v-if="column.body"
            :row="row"
            :index="index"
          />
          <template v-else>
            {{ row[column.name as keyof T] }}
          </template>
        </td>
      </tr>
      </tbody>
    </table>

    <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800" v-if="data.totalPages && data.totalPages > 1">
      <BaseLevel>
        <BaseButtons>
          <template v-for="(page, index) in pages" :key="index">
            <!-- Regular page button -->
            <BaseButton
              v-if="typeof page === 'number'"
              :active="page === currentPage"
              :label="page + 1"
              :color="page === currentPage ? 'lightDark' : 'whiteDark'"
              small
              @click="changePage(page)"
            />

            <!-- Ellipsis -->
            <span
              v-else-if="typeof page === 'string' && page.startsWith('ellipsis')"
              class="px-2 text-gray-500 dark:text-gray-400 flex items-center"
            >
              ...
            </span>
          </template>
        </BaseButtons>
        <small>Strona {{ currentPageHuman }} z {{ numPages }}</small>
      </BaseLevel>
    </div>
  </template>
</template>

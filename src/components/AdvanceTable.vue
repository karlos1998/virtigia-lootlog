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

const pages = computed(() => {
  const total = numPages.value
  const current = currentPage.value
  const delta = 2
  const range = []

  const start = Math.max(0, current - delta)
  const end = Math.min(total, current + delta + 1)

  for (let i = start; i < end; i++) {
    range.push(i)
  }

  return range
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
        <BaseButton
          v-for="page in pages"
          :key="page"
          :active="page === currentPage"
          :label="page + 1"
          :color="page === currentPage ? 'lightDark' : 'whiteDark'"
          small
          @click="changePage(page)"
        />
      </BaseButtons>
      <small>Strona {{ currentPageHuman }} z {{ numPages }}</small>
    </BaseLevel>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '@/services/api.service'
import { mdiAccountMultiple, mdiReload, mdiFilter } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BattleDatesTable from '@/pages/dashboard/partials/BattleDatesTable.vue'
import DropdownButton from '@/components/DropdownButton.vue'
import DropdownMenuItem from '@/components/DropdownMenuItem.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import FormControl from '@/components/FormControl.vue'

const route = useRoute()
const router = useRouter()
const isLoading = ref(false)
const isFilterModalActive = ref(false)

// Filter state
const minLvl = ref('')
const maxLvl = ref('')

// Reference to the BattleDatesTable component
const battleDatesTableRef = ref(null)

// Initialize filter values from route query params
if (route.query.minLvl) {
  minLvl.value = route.query.minLvl
}
if (route.query.maxLvl) {
  maxLvl.value = route.query.maxLvl
}

// Computed property for active filter count
const activeFilterCount = computed(() => {
  let count = 0
  if (minLvl.value) count++
  if (maxLvl.value) count++
  return count
})

// Open filter modal
const openFilterModal = () => {
  isFilterModalActive.value = true
}

// Apply level filters
const applyLevelFilter = () => {
  const query = { ...route.query }

  // Update query params
  if (minLvl.value) {
    query.minLvl = minLvl.value
  } else {
    delete query.minLvl
  }

  if (maxLvl.value) {
    query.maxLvl = maxLvl.value
  } else {
    delete query.maxLvl
  }

  // Update route
  router.push({ query })

  // Close modal
  isFilterModalActive.value = false
}

// Clear level filters
const clearLevelFilter = () => {
  minLvl.value = ''
  maxLvl.value = ''

  const query = { ...route.query }
  delete query.minLvl
  delete query.maxLvl

  router.push({ query })
  isFilterModalActive.value = false
}

const refreshBattleDatesTable = () => {
  // Set loading state
  isLoading.value = true

  // Use the API service to reload the data
  const apiService = new ApiService()

  // Get baseNpcRank from route query params
  const baseNpcRank = route.query.baseNpcRank

  // Build query params object
  const queryParams = {
    page: 0,
    size: 30,
    sort: 'createdAt,desc'
  }

  // Only add baseNpcRank if it exists
  if (baseNpcRank) {
    queryParams.baseNpcRank = baseNpcRank
  }

  apiService.withAuth().lootlog.getAll2(queryParams).then((data) => {
    if(!data.content) return
    // Update the table data directly
    if (battleDatesTableRef.value) {
      battleDatesTableRef.value.tableData = data
      battleDatesTableRef.value.lastUpdated = new Date()
    }
  }).catch((error) => {
    console.error('Failed to load battle dates data:', error)
  }).finally(() => {
    // Set loading state to false when done
    isLoading.value = false
  })
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiAccountMultiple" title="Daty Bitew">
        <DropdownButton>
          <DropdownMenuItem :icon="mdiReload" label="Odśwież" @click="refreshBattleDatesTable" />
        </DropdownButton>
      </SectionTitleLineWithButton>

      <!-- Level Filter Button -->
      <div class="mb-6 flex justify-end">
        <BaseButton
          :icon="mdiFilter"
          label="Filtruj poziomy"
          color="info"
          @click="openFilterModal"
        >
          <template v-if="activeFilterCount > 0" #badge>
            <span class="filter-badge">{{ activeFilterCount }}</span>
          </template>
        </BaseButton>
      </div>

      <CardBox has-table>
        <BattleDatesTable ref="battleDatesTableRef" />
      </CardBox>

      <!-- Level Filter Modal -->
      <CardBoxModal
        v-model="isFilterModalActive"
        title="Filtruj po poziomie"
        button="info"
        button-label="Zastosuj"
        has-cancel
        @confirm="applyLevelFilter"
      >
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-2">Minimalny poziom</label>
            <FormControl
              v-model="minLvl"
              type="number"
              placeholder="np. 1"
              inputmode="numeric"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-2">Maksymalny poziom</label>
            <FormControl
              v-model="maxLvl"
              type="number"
              placeholder="np. 100"
              inputmode="numeric"
            />
          </div>
          <div class="pt-2">
            <BaseButton
              label="Wyczyść filtry"
              color="danger"
              outline
              @click="clearLevelFilter"
            />
          </div>
        </div>
      </CardBoxModal>

    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.filter-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 8px;
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
  background-color: #ef4444;
  border-radius: 50%;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.flex {
  display: flex;
}

.justify-end {
  justify-content: flex-end;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.block {
  display: block;
}

.text-sm {
  font-size: 0.875rem;
}

.font-medium {
  font-weight: 500;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.pt-2 {
  padding-top: 0.5rem;
}
</style>

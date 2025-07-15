<script setup>
import { ref, onMounted } from 'vue'
import { useMainStore } from '@/stores/main.ts'
import { ApiService } from '@/services/api.service'
import { mdiAccountMultiple, mdiReload } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BattleLootsTable from '@/pages/dashboard/partials/BattleLootsTable.vue'
import DropdownButton from '@/components/DropdownButton.vue'
import DropdownMenuItem from '@/components/DropdownMenuItem.vue'

const mainStore = useMainStore()
const isLoading = ref(false)

// Reference to the BattleLootsTable component
const battleLootsTableRef = ref(null)

const refreshBattleLootsTable = () => {
  // Set loading state
  isLoading.value = true

  // Use the API service to reload the data
  const apiService = new ApiService()

  apiService.withAuth().lootlog.getAll1({
    page: 0,
    size: 30,
    sort: 'createdAt,desc'
  }).then((data) => {
    if(!data.content) return
    // Update the table data directly
    if (battleLootsTableRef.value) {
      battleLootsTableRef.value.tableData = data
      battleLootsTableRef.value.lastUpdated = new Date()
    }
  }).catch((error) => {
    console.error('Failed to load battle loots data:', error)
  }).finally(() => {
    // Set loading state to false when done
    isLoading.value = false
  })
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiAccountMultiple" title="Łupy Bitewne">
        <DropdownButton>
          <DropdownMenuItem :icon="mdiReload" label="Odśwież" @click="refreshBattleLootsTable" />
        </DropdownButton>
      </SectionTitleLineWithButton>

      <CardBox has-table>
        <BattleLootsTable ref="battleLootsTableRef" />
      </CardBox>

    </SectionMain>
  </LayoutAuthenticated>
</template>

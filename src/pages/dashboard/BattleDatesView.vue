<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { ApiService } from '@/services/api.service'
import { mdiAccountMultiple, mdiReload } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BattleDatesTable from '@/pages/dashboard/partials/BattleDatesTable.vue'
import DropdownButton from '@/components/DropdownButton.vue'
import DropdownMenuItem from '@/components/DropdownMenuItem.vue'

const route = useRoute()
const isLoading = ref(false)

// Reference to the BattleDatesTable component
const battleDatesTableRef = ref(null)

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

      <CardBox has-table>
        <BattleDatesTable ref="battleDatesTableRef" />
      </CardBox>

    </SectionMain>
  </LayoutAuthenticated>
</template>

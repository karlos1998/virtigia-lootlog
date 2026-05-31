<script setup>
import { ref } from 'vue'
import { mdiAccountMultiple, mdiReload } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BattleLootsTable from '@/pages/dashboard/partials/BattleLootsTable.vue'
import DropdownButton from '@/components/DropdownButton.vue'
import DropdownMenuItem from '@/components/DropdownMenuItem.vue'

// Reference to the BattleLootsTable component
const battleLootsTableRef = ref(null)

const refreshBattleLootsTable = () => {
  battleLootsTableRef.value?.refresh()
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

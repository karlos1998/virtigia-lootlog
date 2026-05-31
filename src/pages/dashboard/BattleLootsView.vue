<script setup>
import { ref } from 'vue'
import { mdiReload, mdiTreasureChest } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BattleLootsTable from '@/pages/dashboard/partials/BattleLootsTable.vue'
import BaseButton from '@/components/BaseButton.vue'

// Reference to the BattleLootsTable component
const battleLootsTableRef = ref(null)

const refreshBattleLootsTable = () => {
  battleLootsTableRef.value?.refresh()
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiTreasureChest" title="Łupy bitewne">
        <BaseButton :icon="mdiReload" label="Odśwież" color="info" @click="refreshBattleLootsTable" />
      </SectionTitleLineWithButton>

      <CardBox has-table>
        <BattleLootsTable ref="battleLootsTableRef" />
      </CardBox>

    </SectionMain>
  </LayoutAuthenticated>
</template>

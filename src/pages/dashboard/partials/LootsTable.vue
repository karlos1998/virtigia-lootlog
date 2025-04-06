<script setup lang="ts">

import { TableService } from '@/services/table.service'
import { computed, onMounted, ref } from 'vue'
import { LootlogBattleRecordDTO } from '@/api/api'
import AdvanceTable from '@/components/AdvanceTable.vue'
import Column from '@/components/Column.vue'

const tableService = new TableService();

const tableData = ref();

const loadTable = (page: number = 0) => {
  tableService.fetch({
    page,
    size: 30,
    sort: 'createdAt,desc',
  }).then((data) => {
    if(!data.content) return;
    tableData.value = data
  });
}

onMounted(() => {
  loadTable();
})


const changePage = (targetPage: number) => {
  loadTable(targetPage);
}

type SlotProps = {
  row: LootlogBattleRecordDTO
  index: number
}

</script>
<template>

  <AdvanceTable v-if="tableData" :data="tableData" @change-page="changePage">
    <Column header="Moby" name="npcs">
      <template #body="{ row }: SlotProps">
        {{ row.npcs.map(npc => `${npc.name} (${npc.lvl}${npc.profession})`).join(', ') }}
      </template>
    </Column>
    <Column header="Gracze" name="characters">
      <template #body="{ row }: SlotProps">
        {{ row.characters.map(character => `${character.name} (${character.lvl}${character.profession})`).join(', ') }}
      </template>
    </Column>
    <Column header="Data" name="createdAt">
      <template #body="{ row }: SlotProps">
        {{ new Date(row.createdAt).toLocaleString() }}
      </template>
    </Column>
  </AdvanceTable>


</template>

<script setup lang="ts">

import { TableService } from '@/services/table.service'
import { computed, onMounted, ref, watch } from 'vue'
import { LootlogBattleRecordDTO } from '@/api/api'
import AdvanceTable from '@/components/AdvanceTable.vue'
import Column from '@/components/Column.vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '@/services/api.service'

const router = useRouter();
const apiService = new ApiService();

apiService.instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 403 || error.response?.status === 401) {
      localStorage.removeItem('jwt')
      await router.push('/login')
    }
    return Promise.reject(error)
  }
)

const tableData = ref();

const route = useRoute();

const loadTable = (page: number = 0) => {
  apiService.withAuth().lootlog.getAll({
    page,
    size: 30,
    sort: 'createdAt,desc',
    npcRank: route.params.npcRank as 'NORMAL' | 'ELITE' | 'ELITE_II' | 'ELITE_III' | 'HERO' | 'TITAN'
  }).then((data) => {
    if(!data.content) return;
    tableData.value = data
  });
}

onMounted(() => {
  loadTable();
})

watch(() => route.params.npcRank, () => loadTable())

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
    <Column header="Zdobycze" name="characters">
      <template #body="{ row }: SlotProps">
        <div v-if="row.lootsAllocation">
          <div v-for="item in row.lootsAllocation.assignedItems">
            {{item.baseItemName}} - {{item.characterName}}
          </div>
        </div>
        <div v-else>-</div>
      </template>
    </Column>
    <Column header="Data" name="createdAt">
      <template #body="{ row }: SlotProps">
        {{ new Date(row.createdAt).toLocaleString() }}
      </template>
    </Column>
  </AdvanceTable>


</template>

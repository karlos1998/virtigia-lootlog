<script setup lang="ts">

import { TableService } from '@/services/table.service'
import { computed, onMounted, ref, watch } from 'vue'
import { LootlogBattleRecordDTO } from '@/api/api'
import AdvanceTable from '@/components/AdvanceTable.vue'
import Column from '@/components/Column.vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '@/services/api.service'
import { useMainStore } from '@/stores/main'

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

const mainStore = useMainStore();

</script>
<template>

  <AdvanceTable v-if="tableData" :data="tableData" @change-page="changePage">
    <Column header="Moby" name="npcs">
      <template #body="{ row }: SlotProps">
        <img
          v-for="npc in row.npcs"
          v-tip.npc="npc"
          class="npc"
          :src="`${mainStore.baseAssetsPath}/img/npc/${npc.src}`"
        />
      </template>
    </Column>
    <Column header="Gracze" name="characters">
      <template #body="{ row }: SlotProps">
        <div class="character-wrapper">
          <div
            v-for="character in row.characters"
            v-tip.other="{...character, level: character.lvl}"
            class="character"
            :style="{
          backgroundImage: `url(${mainStore.baseAssetsPath}/img/outfits/${character.src})`
        }"
          />
        </div>
      </template>
    </Column>

    <Column header="Zdobycze" name="characters">
      <template #body="{ row }: SlotProps">
        <div v-if="row.lootsAllocation" class="item-wrapper">
          <div
            v-for="item in row.lootsAllocation.items"
            v-tip.item="item.item"
            class="item"
            :style="{
          backgroundImage: `url(${mainStore.baseAssetsPath}/img/${item.item.src})`
        }"
          />
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

<style>
.item {
  width: 32px;
  height: 32px;
}

.character {
  width: 32px;
  height: 48px;
}

.npc {
  max-width: 64px;
}

.character-wrapper,
.item-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.character,
.item {
  margin: 2px;
}
</style>

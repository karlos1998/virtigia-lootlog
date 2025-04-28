<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue'
import { LootlogBattleRecordDTO } from '@/api/api'
import AdvanceTable from '@/components/AdvanceTable.vue'
import Column from '@/components/Column.vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '@/services/api.service'
import { useMainStore } from '@/stores/main'
import { useLootStore } from '@/stores/loot'

const router = useRouter();
const apiService = new ApiService();
const lootStore = useLootStore();

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

const route = useRoute();

// Use the store's tableData instead of a local ref
const tableData = computed(() => lootStore.tableData);
const isLoading = computed(() => lootStore.loading);
const lastUpdated = computed(() => lootStore.formattedLastUpdated);

const loadTable = (page: number = 0) => {
  // Safely access route.params.npcRank with a fallback to undefined
  const currentNpcRank = route.params?.npcRank as 'NORMAL' | 'ELITE' | 'ELITE_II' | 'ELITE_III' | 'HERO' | 'TITAN' | undefined;

  // Update the npcRank in the store
  lootStore.setNpcRank(currentNpcRank || null);

  // Set loading state
  lootStore.setLoading(true);

  apiService.withAuth().lootlog.getAll({
    page,
    size: 30,
    sort: 'createdAt,desc',
    npcRank: currentNpcRank
  }).then((data) => {
    if(!data.content) return;
    // Update the store with the new data
    lootStore.setTableData(data);
  }).catch((error) => {
    console.error('Failed to load data:', error);
  }).finally(() => {
    // Set loading state to false when done
    lootStore.setLoading(false);
  });
}

onMounted(() => {
  // If we have stored data for the current npcRank, use it immediately
  if (lootStore.tableData &&
      (lootStore.npcRank === (route.params.npcRank || null) ||
       (!lootStore.npcRank && !route.params.npcRank))) {
    // Data is already loaded from persistent storage
  } else {
    // Load fresh data
    loadTable();
  }
})

watch(() => route.params.npcRank, (newRank, oldRank) => {
  // Only trigger if both values are defined and different
  if (newRank !== undefined && oldRank !== undefined && newRank !== oldRank) {
    loadTable();
  }
})

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
  <!-- Loading indicator -->
  <div v-if="isLoading" class="loading-bar"></div>

  <!-- Last updated timestamp -->
  <div v-if="lastUpdated && !isLoading" class="last-updated">
    Dane z: {{ lastUpdated }}
  </div>

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

.loading-bar {
  height: 4px;
  background: linear-gradient(90deg, #4f46e5, #818cf8, #a78bfa, #818cf8, #4f46e5);
  background-size: 200% 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  animation: loading 2s infinite ease-in-out;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(79, 70, 229, 0.5);
  transform-origin: center;
  transition: all 0.3s ease;
}

@keyframes loading {
  0% {
    background-position: 0% 0;
    opacity: 0.8;
    transform: scaleY(0.9);
  }
  50% {
    background-position: 100% 0;
    opacity: 1;
    transform: scaleY(1);
  }
  100% {
    background-position: 0% 0;
    opacity: 0.8;
    transform: scaleY(0.9);
  }
}

.last-updated {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 10px;
  text-align: right;
  font-style: italic;
}
</style>

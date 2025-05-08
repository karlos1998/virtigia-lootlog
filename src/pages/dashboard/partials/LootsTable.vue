<script setup lang="ts">

import { computed, onMounted, ref, watch } from 'vue'
import { LootlogBattleRecordDTO } from '@/api/api'
import AdvanceTable from '@/components/AdvanceTable.vue'
import Column from '@/components/Column.vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '@/services/api.service'
import { useMainStore } from '@/stores/main'
import { useLootStore } from '@/stores/loot'

// Function to generate a unique color for each loot item
const generateUniqueColor = (id: string) => {
  // Simple hash function to convert string to a number
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert to a vibrant color (HSL with high saturation and lightness)
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 80%, 65%)`;
}

const router = useRouter();
const apiService = new ApiService();
const lootStore = useLootStore();

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

  // Set loading state if not already set
  if (!lootStore.loading) {
    lootStore.setLoading(true);
  }

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
    // We keep showing cached data if available
    // No need to update the store, as we're already showing cached data
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
    // No cached data available, set loading state
    lootStore.setLoading(true);
  }

  // Always try to load fresh data from backend
  loadTable();
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

// Function to get the color for a character based on character ID
const getCharacterColor = (row, characterId) => {
  if (!row.lootsAllocation || !row.lootsAllocation.assignedItems) return '';

  // Find the assigned item for this character
  const assignedItem = row.lootsAllocation.assignedItems.find(item => item.characterId === characterId);
  if (!assignedItem) return '';

  // Generate a color based on the character ID
  return generateUniqueColor(characterId);
};

// Function to get the color for a loot item based on the character who received it
const getLootItemColor = (row, lootItemId) => {
  if (!row.lootsAllocation || !row.lootsAllocation.assignedItems) return '';

  // Find the assigned item to determine which character received this loot
  const assignedItem = row.lootsAllocation.assignedItems.find(item => item.lootItemId === lootItemId);
  if (!assignedItem) return '';

  // Generate a color based on the character ID who received the item
  return generateUniqueColor(assignedItem.characterId);
};

// NPC highlighting is removed as per requirements

</script>
<template>
  <!-- Loading indicator -->
  <div v-if="isLoading" class="loading-bar"></div>

  <!-- Last updated timestamp -->
  <div v-if="lastUpdated" class="last-updated">
    <span v-if="isLoading"><span class="loading">⟳</span> Ładowanie nowych danych, pokazuję dane z: {{ lastUpdated }}</span>
    <span v-else-if="lootStore.isDataFresh"><span class="fresh">✓</span> Dane są aktualne</span>
    <span v-else><span class="cached">⏱</span> Dane z: {{ lastUpdated }}</span>
  </div>

  <AdvanceTable :data="tableData || { content: [] }" @change-page="changePage">
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
            :class="{ 'loot-highlight': getCharacterColor(row, character.id) }"
            :style="{
              backgroundImage: `url(${mainStore.baseAssetsPath}/img/outfits/${character.src})`,
              '--highlight-color': getCharacterColor(row, character.id),
              boxShadow: getCharacterColor(row, character.id) ? `0 0 0 2px ${getCharacterColor(row, character.id)}, 0 0 10px ${getCharacterColor(row, character.id)}` : ''
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
            :class="{ 'loot-highlight': true }"
            :style="{
              backgroundImage: `url(${mainStore.baseAssetsPath}/img/${item.item.src})`,
              '--highlight-color': getLootItemColor(row, item.id),
              boxShadow: `0 0 0 2px ${getLootItemColor(row, item.id)}, 0 0 10px ${getLootItemColor(row, item.id)}`
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

    <template #empty>
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">Brak danych do wyświetlenia</h3>
        <p class="empty-state-message">
          Nie znaleziono żadnych zapisów lootów dla wybranych kryteriów.
          Spróbuj zmienić filtry lub wróć później.
        </p>
      </div>
    </template>
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
  margin-bottom: 15px;
  text-align: center;
  padding: 8px 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid #e5e7eb;
}

.last-updated span {
  display: inline-block;
}

.dark .last-updated {
  background-color: #1f2937;
  border-color: #374151;
  color: #9ca3af;
}

.loading {
  color: #6366f1;
  margin-right: 4px;
}

.fresh {
  color: #10b981;
  margin-right: 4px;
}

.cached {
  color: #f59e0b;
  margin-right: 4px;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  border-radius: 0.5rem;
  margin: 1rem 0;
}

.empty-state-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.dark .empty-state-title {
  color: #f3f4f6;
}

.empty-state-message {
  color: #6b7280;
  max-width: 24rem;
  margin: 0 auto;
  line-height: 1.5;
}

/* Loot highlight styles */
.loot-highlight {
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;
}

.loot-highlight::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 6px;
  background: var(--highlight-color);
  opacity: 0.2;
  z-index: -1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.2;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.3;
  }
  100% {
    transform: scale(1);
    opacity: 0.2;
  }
}
</style>

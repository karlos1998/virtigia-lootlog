<script setup lang="ts">
import { computed, onMounted, ref, watch, onUnmounted } from 'vue'
import { LootlogBattleDateDTO, NpcDTO } from '@/api/api'
import AdvanceTable from '@/components/AdvanceTable.vue'
import Column from '@/components/Column.vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '@/services/api.service'
import { useMainStore } from '@/stores/main'

const router = useRouter();
const apiService = new ApiService();
const mainStore = useMainStore();

const route = useRoute();

// Table data state
const tableData = ref(null);
const isLoading = ref(false);
const lastUpdated = ref(null);
const currentTime = ref(new Date()); // Current time for respawn probability calculation

// Update current time every second
let timeInterval: number | null = null;

const loadTable = (page: number = 0) => {
  // Set loading state
  isLoading.value = true;

  // Get query params
  const baseNpcRank = route.query.baseNpcRank as string | undefined;
  const minLvl = route.query.minLvl as string | undefined
  const maxLvl = route.query.maxLvl as string | undefined

  // Build query params object
  const queryParams: any = {
    page,
    size: 30,
    sort: 'updatedAt,desc'
  }

  // Only add baseNpcRank if it exists
  if (baseNpcRank) {
    queryParams.baseNpcRank = baseNpcRank
  }

  // Add level filters if they exist
  if (minLvl) {
    queryParams.minLvl = parseInt(minLvl)
  }
  if (maxLvl) {
    queryParams.maxLvl = parseInt(maxLvl)
  }

  apiService.withAuth().lootlog.getAll2(queryParams).then((data) => {
    if(!data.content) return;
    // Update the table data
    tableData.value = data;
    // Update last updated timestamp
    lastUpdated.value = new Date();
  }).catch((error) => {
    console.error('Failed to load battle dates data:', error);
  }).finally(() => {
    // Set loading state to false when done
    isLoading.value = false;
  });
}

// Calculate respawn probability percentage
const calculateRespawnProbability = (minRespawnTime: Date, maxRespawnTime: Date): number => {
  const now = currentTime.value;

  // If current time is before min respawn time, probability is 0%
  if (now < minRespawnTime) {
    return 0;
  }

  // If current time is after max respawn time, probability is 100%
  if (now > maxRespawnTime) {
    return 100;
  }

  // Calculate percentage between min and max respawn times
  const totalTimeRange = maxRespawnTime.getTime() - minRespawnTime.getTime();
  const timeElapsed = now.getTime() - minRespawnTime.getTime();
  const percentage = (timeElapsed / totalTimeRange) * 100;

  return Math.round(percentage);
};

onMounted(() => {
  // Load data when component is mounted
  loadTable();

  // Set up interval to update current time every 5 seconds
  timeInterval = window.setInterval(() => {
    currentTime.value = new Date();
  }, 5000);
});

// Watch for changes in route query params and reload data
watch(() => [route.query.baseNpcRank, route.query.minLvl, route.query.maxLvl], () => {
  loadTable();
});

onUnmounted(() => {
  // Clear interval when component is unmounted
  if (timeInterval !== null) {
    clearInterval(timeInterval);
  }
});

const changePage = (targetPage: number) => {
  loadTable(targetPage);
}

type SlotProps = {
  row: LootlogBattleDateDTO
  index: number
}

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
}

// Find NPC with highest maxRespawnTime in a row
const findNpcWithHighestMaxRespawnTime = (row: LootlogBattleDateDTO): NpcDTO | null => {
  if (!row.npcs || row.npcs.length === 0) return null;

  return row.npcs.reduce((maxNpc, currentNpc) => {
    return currentNpc.maxRespawnTime > maxNpc.maxRespawnTime ? currentNpc : maxNpc;
  }, row.npcs[0]);
}

// Calculate minimum respawn time by adding minRespawnTime (in seconds) to updatedAt
const calculateMinRespawnTime = (updatedAt: string, minRespawnTime: number): Date => {
  const updatedAtDate = new Date(updatedAt);
  return new Date(updatedAtDate.getTime() + minRespawnTime * 1000); // Convert seconds to milliseconds
}

// Calculate maximum respawn time by adding maxRespawnTime (in seconds) to updatedAt
const calculateMaxRespawnTime = (updatedAt: string, maxRespawnTime: number): Date => {
  const updatedAtDate = new Date(updatedAt);
  return new Date(updatedAtDate.getTime() + maxRespawnTime * 1000); // Convert seconds to milliseconds
}
</script>

<template>
  <!-- Loading indicator -->
  <div v-if="isLoading" class="loading-bar"></div>

  <!-- Last updated timestamp -->
  <div v-if="lastUpdated" class="last-updated">
    <span v-if="isLoading"><span class="loading">⟳</span> Ładowanie nowych danych, pokazuję dane z: {{ formatDate(lastUpdated) }}</span>
    <span v-else><span class="fresh">✓</span> Dane z: {{ formatDate(lastUpdated) }}</span>
  </div>

  <AdvanceTable :data="tableData || { content: [] }" @change-page="changePage">
    <Column header="Moby" name="npcs">
      <template #body="{ row }: SlotProps">
        <img
          v-for="npc in row.npcs"
          v-tip.npc="npc"
          class="npc"
          :src="npc.src"
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
              backgroundImage: `url(${character.src})`
            }"
          />
        </div>
      </template>
    </Column>

    <Column header="Data" name="updatedAt">
      <template #body="{ row }: SlotProps">
        {{ formatDate(row.updatedAt) }}
      </template>
    </Column>

    <Column header="Odrodzenie" name="maxRespawnTime">
      <template #body="{ row }: SlotProps">
        <div v-if="findNpcWithHighestMaxRespawnTime(row)">
          <div>
            <strong>{{ findNpcWithHighestMaxRespawnTime(row)?.name }}</strong>
          </div>
          <div>
            Min: {{ formatDate(calculateMinRespawnTime(row.updatedAt, findNpcWithHighestMaxRespawnTime(row)?.minRespawnTime || 0)) }}
          </div>
          <div>
            Max: {{ formatDate(calculateMaxRespawnTime(row.updatedAt, findNpcWithHighestMaxRespawnTime(row)?.maxRespawnTime || 0)) }}
          </div>

          <!-- Respawn probability -->
          <div class="respawn-probability mt-2">
            <div class="flex items-center">
              <div class="respawn-probability-label">
                Szansa odrodzenia:
                <strong>{{ calculateRespawnProbability(
                  calculateMinRespawnTime(row.updatedAt, findNpcWithHighestMaxRespawnTime(row)?.minRespawnTime || 0),
                  calculateMaxRespawnTime(row.updatedAt, findNpcWithHighestMaxRespawnTime(row)?.maxRespawnTime || 0)
                ) }}%</strong>
              </div>
            </div>
            <div class="respawn-progress-container">
              <div
                class="respawn-progress-bar"
                :style="{
                  width: `${calculateRespawnProbability(
                    calculateMinRespawnTime(row.updatedAt, findNpcWithHighestMaxRespawnTime(row)?.minRespawnTime || 0),
                    calculateMaxRespawnTime(row.updatedAt, findNpcWithHighestMaxRespawnTime(row)?.maxRespawnTime || 0)
                  )}%`
                }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else>-</div>
      </template>
    </Column>

    <template #empty>
      <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">Brak danych do wyświetlenia</h3>
        <p class="empty-state-message">
          Nie znaleziono żadnych zapisów dat bitew.
          Spróbuj odświeżyć stronę lub wróć później.
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

/* Respawn probability styles */
.respawn-probability {
  margin-top: 10px;
}

.respawn-probability-label {
  font-size: 0.875rem;
  margin-bottom: 4px;
}

.respawn-progress-container {
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
}

.respawn-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.dark .respawn-progress-container {
  background-color: #374151;
}

/* Add utility class for margin-top */
.mt-2 {
  margin-top: 0.5rem;
}

/* Add utility class for flex items */
.flex {
  display: flex;
}

.items-center {
  align-items: center;
}
</style>

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

const tableData = ref(null);
const isLoading = ref(false);
const lastUpdated = ref(null);
const currentTime = ref(new Date());

let timeInterval: number | null = null;

const loadTable = (page: number = 0) => {
  isLoading.value = true;

  const baseNpcRank = route.query.baseNpcRank as string | undefined;
  const minLvl = route.query.minLvl as string | undefined
  const maxLvl = route.query.maxLvl as string | undefined

  const queryParams: any = {
    page,
    size: 30,
    sort: 'updatedAt,desc'
  }

  if (baseNpcRank) {
    queryParams.baseNpcRank = baseNpcRank
  }

  if (minLvl) {
    queryParams.minLvl = parseInt(minLvl)
  }
  if (maxLvl) {
    queryParams.maxLvl = parseInt(maxLvl)
  }

  apiService.withAuth().lootlog.getAll2(queryParams).then((data) => {
    if(!data.content) return;
    tableData.value = data;
    lastUpdated.value = new Date();
  }).catch((error) => {
    console.error('Failed to load battle dates data:', error);
  }).finally(() => {
    // Set loading state to false when done
    isLoading.value = false;
  });
}

const calculateRespawnProbability = (minRespawnTime: Date, maxRespawnTime: Date): number => {
  const now = currentTime.value;

  if (now < minRespawnTime) {
    return 0;
  }

  if (now > maxRespawnTime) {
    return 100;
  }

  const totalTimeRange = maxRespawnTime.getTime() - minRespawnTime.getTime();
  const timeElapsed = now.getTime() - minRespawnTime.getTime();
  const percentage = (timeElapsed / totalTimeRange) * 100;

  return Math.round(percentage);
};

onMounted(() => {
  loadTable();

  timeInterval = window.setInterval(() => {
    currentTime.value = new Date();
  }, 5000);
});

watch(() => [route.query.baseNpcRank, route.query.minLvl, route.query.maxLvl], () => {
  loadTable();
});

onUnmounted(() => {
  if (timeInterval !== null) {
    clearInterval(timeInterval);
  }
});

const changePage = (targetPage: number) => {
  loadTable(targetPage);
}

const refresh = () => {
  loadTable(tableData.value?.number ?? 0);
}

defineExpose({ refresh })

type SlotProps = {
  row: LootlogBattleDateDTO
  index: number
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
}

const findNpcWithHighestMaxRespawnTime = (row: LootlogBattleDateDTO): NpcDTO | null => {
  if (!row.npcs || row.npcs.length === 0) return null;

  return row.npcs.reduce((maxNpc, currentNpc) => {
    return currentNpc.maxRespawnTime > maxNpc.maxRespawnTime ? currentNpc : maxNpc;
  }, row.npcs[0]);
}

const calculateMinRespawnTime = (updatedAt: string, minRespawnTime: number): Date => {
  const updatedAtDate = new Date(updatedAt);
  return new Date(updatedAtDate.getTime() + minRespawnTime * 1000);
}

const calculateMaxRespawnTime = (updatedAt: string, maxRespawnTime: number): Date => {
  const updatedAtDate = new Date(updatedAt);
  return new Date(updatedAtDate.getTime() + maxRespawnTime * 1000);
}
</script>

<template>
  <div v-if="isLoading" class="loading-bar"></div>

  <div v-if="lastUpdated" class="last-updated">
    <span v-if="isLoading"><span class="loading">⟳</span> Ładowanie nowych danych, pokazuję dane z: {{ formatDate(lastUpdated) }}</span>
    <span v-else><span class="fresh">✓</span> Dane z: {{ formatDate(lastUpdated) }}</span>
  </div>

  <AdvanceTable :data="tableData || { content: [] }" @change-page="changePage">
    <Column header="Moby" name="npcs">
      <template #body="{ row }: SlotProps">
        <img
          v-for="npc in row.npcs"
          :key="npc.id"
          v-tip.npc="npc"
          class="battle-npc-sprite"
          :src="npc.src"
        />
      </template>
    </Column>
    <Column header="Gracze" name="characters">
      <template #body="{ row }: SlotProps">
        <div class="character-wrapper">
          <div
            v-for="character in row.characters"
            :key="character.id"
            v-tip.other="{...character, level: character.lvl}"
            class="battle-character-sprite"
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
            <strong class="respawn-name">{{ findNpcWithHighestMaxRespawnTime(row)?.name }}</strong>
          </div>
          <div>
            Min: {{ formatDate(calculateMinRespawnTime(row.updatedAt, findNpcWithHighestMaxRespawnTime(row)?.minRespawnTime || 0)) }}
          </div>
          <div>
            Max: {{ formatDate(calculateMaxRespawnTime(row.updatedAt, findNpcWithHighestMaxRespawnTime(row)?.maxRespawnTime || 0)) }}
          </div>

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
        <h3 class="empty-state-title">Brak danych do wyświetlenia</h3>
        <p class="empty-state-message">
          Nie znaleziono żadnych zapisów dat bitew.
          Spróbuj odświeżyć stronę lub wróć później.
        </p>
      </div>
    </template>
  </AdvanceTable>
</template>

<style scoped>
.battle-npc-sprite {
  max-width: 64px;
  max-height: 64px;
  object-fit: contain;
  padding: 2px;
  border: 1px solid rgba(214, 179, 92, 0.34);
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.28);
}

.battle-character-sprite {
  width: 32px;
  height: 48px;
  margin: 2px;
  border: 1px solid rgba(214, 179, 92, 0.26);
  border-radius: 4px;
  background-repeat: no-repeat;
  background-size: auto 192px;
  background-position: left top;
  background-color: rgba(0, 0, 0, 0.24);
}

.character-wrapper,
.item-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.loading-bar {
  height: 4px;
  background: linear-gradient(90deg, #5b3a17, #d6b35c, #2f7a2f, #d6b35c, #5b3a17);
  background-size: 200% 100%;
  width: 100%;
  position: relative;
  overflow: hidden;
  animation: loading 2s infinite ease-in-out;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(214, 179, 92, 0.36);
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
  background: linear-gradient(180deg, rgba(18, 55, 16, 0.82), rgba(5, 20, 7, 0.94));
  border-radius: 6px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--game-border-muted);
  color: var(--game-text-muted);
}

.loading {
  color: var(--game-gold-300);
  margin-right: 4px;
}

.fresh {
  color: #7ee787;
  margin-right: 4px;
}

.cached {
  color: var(--game-gold-300);
  margin-right: 4px;
}

.empty-state {
  padding: 2rem;
  text-align: center;
  border: 1px solid var(--game-border-muted);
  border-radius: 6px;
  margin: 1rem 0;
  background: rgba(0, 0, 0, 0.18);
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--game-gold-300);
  margin-bottom: 0.5rem;
}

.empty-state-message {
  color: var(--game-text-muted);
  max-width: 24rem;
  margin: 0 auto;
  line-height: 1.5;
}

.respawn-probability {
  margin-top: 10px;
}

.respawn-name {
  color: var(--game-gold-300);
}

.respawn-probability-label {
  font-size: 0.875rem;
  margin-bottom: 4px;
  color: var(--game-text-muted);
}

.respawn-progress-container {
  height: 8px;
  background-color: rgba(0, 0, 0, 0.38);
  border-radius: 4px;
  border: 1px solid rgba(214, 179, 92, 0.24);
  overflow: hidden;
  margin-top: 4px;
}

.respawn-progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #91651f, #e8c76b, #74b45e);
  border-radius: 4px;
  transition: width 0.5s ease;
}
</style>

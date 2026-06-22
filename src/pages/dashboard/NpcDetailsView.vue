<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiArrowLeft, mdiEyeOffOutline, mdiReload, mdiSkull } from '@mdi/js'
import { LootlogNpcDetailsDTO } from '@/api/api'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseIcon from '@/components/BaseIcon.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionMain from '@/components/SectionMain.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BattleLootsTable from '@/pages/dashboard/partials/BattleLootsTable.vue'
import { ApiService } from '@/services/api.service'

const route = useRoute()
const router = useRouter()
const apiService = new ApiService()

const npcDetails = ref<LootlogNpcDetailsDTO | null>(null)
const isLoading = ref(false)
const battleLootsTableRef = ref<InstanceType<typeof BattleLootsTable> | null>(null)

const npcId = computed(() => String(route.params.id || ''))
const killCounters = computed(() => npcDetails.value?.killCounters || [])
const totalKills = computed(() => killCounters.value.reduce((sum, counter) => sum + counter.totalKills, 0))
const title = computed(() => npcDetails.value?.npc.name || 'Mob')

const loadDetails = () => {
  if (!npcId.value) {
    return
  }

  isLoading.value = true
  apiService.withAuth().lootlog.getNpcDetails(npcId.value).then((data) => {
    npcDetails.value = data
  }).catch((error) => {
    console.error('Failed to load NPC details:', error)
  }).finally(() => {
    isLoading.value = false
  })
}

const refresh = () => {
  loadDetails()
  battleLootsTableRef.value?.refresh()
}

const goBack = () => {
  router.push('/battle-loots')
}

const formatRank = (rank?: string) => {
  const labels: Record<string, string> = {
    NORMAL: 'Normalny',
    ELITE: 'Elita',
    ELITE_II: 'Elita II',
    ELITE_III: 'Elita III',
    HERO: 'Heros',
    TITAN: 'Tytan',
  }

  return rank ? labels[rank] || rank : '-'
}

onMounted(loadDetails)
watch(npcId, loadDetails)
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiSkull" :title="title">
        <BaseButtons>
          <BaseButton :icon="mdiArrowLeft" label="Łupy" color="lightDark" @click="goBack" />
          <BaseButton :icon="mdiReload" label="Odśwież" color="info" @click="refresh" />
        </BaseButtons>
      </SectionTitleLineWithButton>

      <div v-if="isLoading" class="loading-bar"></div>

      <div v-if="npcDetails" class="npc-details-grid">
        <CardBox>
          <div class="npc-summary">
            <div class="npc-image-frame">
              <img :src="npcDetails.npc.src" :alt="npcDetails.npc.name" />
            </div>
            <div class="npc-summary-copy">
              <h2>{{ npcDetails.npc.name }}</h2>
              <div class="npc-meta-row">
                <span>Poziom {{ npcDetails.npc.lvl }}</span>
                <span>{{ formatRank(npcDetails.npc.rank) }}</span>
              </div>
            </div>
          </div>
        </CardBox>

        <CardBox>
          <div v-if="npcDetails.killCounterPublic" class="kill-counter-card">
            <div class="kill-counter-header">
              <div>
                <strong>Licznik ubić</strong>
                <span>{{ killCounters.length }} graczy w historii</span>
              </div>
              <b>{{ totalKills }}</b>
            </div>

            <div v-if="killCounters.length === 0" class="kill-counter-empty">
              Brak zapisanych ubić dla tego moba.
            </div>

            <div v-else class="kill-counter-list">
              <div
                v-for="(counter, index) in killCounters"
                :key="counter.characterId"
                class="kill-counter-row"
              >
                <span class="kill-counter-rank">{{ index + 1 }}</span>
                <div
                  v-if="counter.characterSrc"
                  class="kill-counter-avatar"
                  :style="{ backgroundImage: `url(${counter.characterSrc})` }"
                />
                <div class="kill-counter-player">
                  <strong>{{ counter.characterName }}</strong>
                  <span v-if="counter.characterLvl">Poziom {{ counter.characterLvl }}</span>
                </div>
                <b>{{ counter.totalKills }}</b>
              </div>
            </div>
          </div>

          <div v-else class="kill-counter-private">
            <BaseIcon :path="mdiEyeOffOutline" size="28" />
            <div>
              <strong>Licznik ubić nie jest publiczny</strong>
              <span>Dane o liczbie ubić są ukryte dla tego świata.</span>
            </div>
          </div>
        </CardBox>
      </div>

      <div class="npc-subtitle">
        <h2>Historia łupów</h2>
      </div>

      <CardBox has-table>
        <BattleLootsTable ref="battleLootsTableRef" :npc-id="npcId" compact />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.loading-bar {
  height: 4px;
  margin-bottom: 10px;
  border-radius: 4px;
  background: linear-gradient(90deg, #315718, var(--game-gold-500), #86a84d, var(--game-gold-500), #315718);
  background-size: 200% 100%;
  box-shadow: 0 0 10px rgba(214, 179, 92, 0.35);
  animation: loading 2s infinite ease-in-out;
}

@keyframes loading {
  0% {
    background-position: 0% 0;
  }

  50% {
    background-position: 100% 0;
  }

  100% {
    background-position: 0% 0;
  }
}

.npc-details-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(22rem, 1.1fr);
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.npc-subtitle {
  margin: 0 0 0.75rem;
  padding: 0.55rem 0;
}

.npc-subtitle h2 {
  color: #fff1be;
  font-size: 1.35rem;
  font-weight: 900;
}

.npc-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.npc-image-frame {
  width: 5.5rem;
  height: 5.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 5.5rem;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.26);
}

.npc-image-frame img {
  max-width: 4.8rem;
  max-height: 4.8rem;
  object-fit: contain;
}

.npc-summary-copy h2 {
  margin-bottom: 0.4rem;
  color: #fff2bd;
  font-size: 1.35rem;
  font-weight: 900;
}

.npc-meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.npc-meta-row span {
  padding: 0.18rem 0.45rem;
  border-radius: 4px;
  color: var(--game-gold-300);
  background: rgba(0, 0, 0, 0.22);
  font-size: 0.78rem;
  font-weight: 900;
}

.kill-counter-card,
.kill-counter-private {
  min-height: 5.5rem;
}

.kill-counter-header,
.kill-counter-row,
.kill-counter-private {
  display: flex;
  align-items: center;
}

.kill-counter-header {
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.kill-counter-header strong,
.kill-counter-private strong,
.kill-counter-player strong {
  display: block;
  color: #fff2bd;
  font-weight: 900;
}

.kill-counter-header span,
.kill-counter-private span,
.kill-counter-player span {
  display: block;
  color: var(--game-text-muted);
  font-size: 0.78rem;
}

.kill-counter-header b,
.kill-counter-row > b {
  color: var(--game-gold-300);
  font-size: 1.15rem;
}

.kill-counter-list {
  display: grid;
  gap: 0.45rem;
  max-height: 18rem;
  overflow: auto;
  padding-right: 0.25rem;
}

.kill-counter-row {
  gap: 0.6rem;
  padding: 0.45rem;
  border-radius: 5px;
  background: rgba(0, 0, 0, 0.18);
}

.kill-counter-rank {
  width: 1.6rem;
  color: var(--game-gold-400);
  font-size: 0.78rem;
  font-weight: 900;
  text-align: center;
}

.kill-counter-avatar {
  width: 32px;
  height: 48px;
  flex: 0 0 32px;
  border-radius: 4px;
  background-position: left top;
  background-repeat: no-repeat;
  background-size: auto 192px;
}

.kill-counter-player {
  min-width: 0;
  flex: 1;
}

.kill-counter-empty {
  padding: 1rem;
  border-radius: 6px;
  color: var(--game-text-muted);
  background: rgba(0, 0, 0, 0.18);
  text-align: center;
}

.kill-counter-private {
  gap: 0.75rem;
  color: var(--game-gold-300);
}

@media (max-width: 900px) {
  .npc-details-grid {
    grid-template-columns: 1fr;
  }
}
</style>

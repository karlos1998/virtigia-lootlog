<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiClose } from '@mdi/js'
import { LootItemDTO, LootlogBattleLootDTO, PageLootlogBattleLootDTO } from '@/api/api'
import AdvanceTable from '@/components/AdvanceTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import CardBoxModal from '@/components/CardBoxModal.vue'
import Column from '@/components/Column.vue'
import { ApiService } from '@/services/api.service'

const apiService = new ApiService()
const route = useRoute()
const router = useRouter()

const tableData = ref<PageLootlogBattleLootDTO | null>(null)
const isLoading = ref(false)
const lastUpdated = ref<Date | null>(null)
const isModalActive = ref(false)
const selectedItem = ref<LootItemDTO | null>(null)
const selectedRow = ref<LootlogBattleLootDTO | null>(null)
const legendaryOnly = ref(false)
const heroicOnly = ref(false)
const onlyMine = ref(false)
const characterName = ref('')
const npcName = ref('')
const suspendFilterWatch = ref(false)
let textFilterReloadTimeout: ReturnType<typeof setTimeout> | null = null

type BattleLootQuery = {
  page: number
  size: number
  sort: string
  legendaryOnly?: boolean
  heroicOnly?: boolean
  onlyMine?: boolean
  characterName?: string
  npcName?: string
}

type SlotProps = {
  row: LootlogBattleLootDTO
  index: number
}

const activeFiltersCount = computed(() => {
  return [
    legendaryOnly.value,
    heroicOnly.value,
    onlyMine.value,
    characterName.value.trim().length > 0,
    npcName.value.trim().length > 0,
  ].filter(Boolean).length
})

const generateUniqueColor = (id: string) => {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }

  const h = Math.abs(hash) % 360
  return `hsl(${h}, 76%, 62%)`
}

const hydrateFiltersFromRoute = () => {
  suspendFilterWatch.value = true
  legendaryOnly.value = route.query.legendaryOnly === 'true'
  heroicOnly.value = route.query.heroicOnly === 'true'
  onlyMine.value = route.query.onlyMine === 'true'
  characterName.value = typeof route.query.characterName === 'string' ? route.query.characterName : ''
  npcName.value = typeof route.query.npcName === 'string' ? route.query.npcName : ''

  nextTick(() => {
    suspendFilterWatch.value = false
  })
}

const syncFiltersToRoute = () => {
  if (suspendFilterWatch.value) {
    return
  }

  const query = { ...route.query }
  delete query.legendaryOnly
  delete query.heroicOnly
  delete query.onlyMine
  delete query.characterName
  delete query.npcName

  if (legendaryOnly.value) {
    query.legendaryOnly = 'true'
  }
  if (heroicOnly.value) {
    query.heroicOnly = 'true'
  }
  if (onlyMine.value) {
    query.onlyMine = 'true'
  }
  if (characterName.value.trim()) {
    query.characterName = characterName.value.trim()
  }
  if (npcName.value.trim()) {
    query.npcName = npcName.value.trim()
  }

  router.replace({ query })
}

const buildQuery = (page: number): BattleLootQuery => {
  const query: BattleLootQuery = {
    page,
    size: 30,
    sort: 'createdAt,desc',
  }

  if (legendaryOnly.value) {
    query.legendaryOnly = true
  }
  if (heroicOnly.value) {
    query.heroicOnly = true
  }
  if (onlyMine.value) {
    query.onlyMine = true
  }
  if (characterName.value.trim()) {
    query.characterName = characterName.value.trim()
  }
  if (npcName.value.trim()) {
    query.npcName = npcName.value.trim()
  }

  return query
}

const loadTable = (page: number = 0) => {
  isLoading.value = true

  apiService.withAuth().lootlog.getAll1(buildQuery(page) as any).then((data) => {
    if (!data.content) {
      return
    }
    tableData.value = data
    lastUpdated.value = new Date()
  }).catch((error) => {
    console.error('Failed to load battle loots data:', error)
  }).finally(() => {
    isLoading.value = false
  })
}

const refresh = () => {
  loadTable(tableData.value?.number ?? 0)
}

const clearFilters = () => {
  suspendFilterWatch.value = true
  legendaryOnly.value = false
  heroicOnly.value = false
  onlyMine.value = false
  characterName.value = ''
  npcName.value = ''

  nextTick(() => {
    suspendFilterWatch.value = false
    syncFiltersToRoute()
  })
}

const scheduleTextFilterReload = () => {
  if (suspendFilterWatch.value) {
    return
  }
  if (textFilterReloadTimeout) {
    clearTimeout(textFilterReloadTimeout)
  }
  textFilterReloadTimeout = setTimeout(syncFiltersToRoute, 350)
}

const changePage = (targetPage: number) => {
  loadTable(targetPage)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString()
}

const getCharacterColor = (row: LootlogBattleLootDTO, characterId: string) => {
  if (!row.assignedItems) {
    return ''
  }

  const assignedItem = row.assignedItems.find((item) => item.characterId === characterId)
  return assignedItem ? generateUniqueColor(characterId) : ''
}

const getLootItemColor = (row: LootlogBattleLootDTO, itemId: string) => {
  if (!row.assignedItems) {
    return ''
  }

  const assignedItem = row.assignedItems.find((item) => item.lootItemId === itemId)
  return assignedItem ? generateUniqueColor(assignedItem.characterId) : ''
}

const showItemDetails = (item: LootItemDTO, row: LootlogBattleLootDTO) => {
  selectedItem.value = item
  selectedRow.value = row
  isModalActive.value = true
}

const getCharacterNameById = (row: LootlogBattleLootDTO, characterId: string) => {
  const character = row.characters.find((char) => char.id === characterId)
  return character ? character.name : 'Nieznana postać'
}

const hasLegendaryItems = (row: LootlogBattleLootDTO) => {
  return row.items && row.items.some((item) => item.item.rarity === 'legendary')
}

const getRowClass = (row: LootlogBattleLootDTO) => {
  return hasLegendaryItems(row) ? 'legendary-row' : ''
}

onMounted(() => {
  hydrateFiltersFromRoute()
  loadTable()
})

onBeforeUnmount(() => {
  if (textFilterReloadTimeout) {
    clearTimeout(textFilterReloadTimeout)
  }
})

watch([characterName, npcName], scheduleTextFilterReload)
watch([legendaryOnly, heroicOnly, onlyMine], syncFiltersToRoute)
watch(() => route.query, () => {
  hydrateFiltersFromRoute()
  loadTable(0)
})

defineExpose({ refresh })
</script>

<template>
  <div v-if="isLoading" class="loading-bar"></div>

  <div v-if="lastUpdated" class="last-updated">
    <span v-if="isLoading">
      <span class="loading-mark">Odświeżanie</span>
      Dane z: {{ formatDate(lastUpdated) }}
    </span>
    <span v-else>
      <span class="fresh-mark">Aktualne</span>
      Dane z: {{ formatDate(lastUpdated) }}
    </span>
  </div>

  <div class="loot-filter-panel">
    <div class="loot-filter-grid">
      <label class="loot-filter-field">
        <span>Gracz</span>
        <input v-model.trim="characterName" type="search" placeholder="Nazwa gracza" />
      </label>

      <label class="loot-filter-field">
        <span>Mob</span>
        <input v-model.trim="npcName" type="search" placeholder="Nazwa moba" />
      </label>

      <div class="loot-filter-toggles">
        <label class="loot-filter-toggle">
          <input v-model="legendaryOnly" type="checkbox" />
          <span>Legendarny</span>
        </label>

        <label class="loot-filter-toggle">
          <input v-model="heroicOnly" type="checkbox" />
          <span>Heroiczny</span>
        </label>

        <label class="loot-filter-toggle">
          <input v-model="onlyMine" type="checkbox" />
          <span>Tylko moje</span>
        </label>
      </div>

      <div class="loot-filter-actions">
        <span v-if="activeFiltersCount" class="loot-filter-counter">{{ activeFiltersCount }} aktywne</span>
        <BaseButton
          v-if="activeFiltersCount"
          :icon="mdiClose"
          label="Wyczyść"
          color="lightDark"
          small
          @click="clearFilters"
        />
      </div>
    </div>
  </div>

  <AdvanceTable :data="tableData || { content: [] }" :row-class="getRowClass" @change-page="changePage">
    <Column header="Moby" name="npcs">
      <template #body="{ row }: SlotProps">
        <img
          v-for="npc in row.npcs"
          :key="npc.id"
          v-tip.npc="npc"
          class="battle-npc-sprite"
          :src="`${npc.src}`"
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
            :class="{ 'loot-highlight': getCharacterColor(row, character.id) }"
            :style="{
              backgroundImage: `url(${character.src})`,
              '--highlight-color': getCharacterColor(row, character.id),
              boxShadow: getCharacterColor(row, character.id) ? `0 0 0 2px ${getCharacterColor(row, character.id)}, 0 0 10px ${getCharacterColor(row, character.id)}` : '',
            }"
          />
        </div>
      </template>
    </Column>

    <Column header="Zdobycze" name="items">
      <template #body="{ row }: SlotProps">
        <div v-if="row.items && row.items.length > 0" class="item-wrapper">
          <div
            v-for="item in row.items"
            :key="item.id"
            v-tip.item="item.item"
            class="battle-item-sprite"
            :class="{ 'loot-highlight': !!getLootItemColor(row, item.id) }"
            :style="{
              backgroundImage: `url(${item.item.src})`,
              '--highlight-color': getLootItemColor(row, item.id),
              boxShadow: getLootItemColor(row, item.id) ? `0 0 0 2px ${getLootItemColor(row, item.id)}, 0 0 10px ${getLootItemColor(row, item.id)}` : '',
            }"
            @click="showItemDetails(item, row)"
          />
        </div>
        <div v-else>-</div>
      </template>
    </Column>

    <Column header="Data utworzenia" name="createdAt">
      <template #body="{ row }: SlotProps">
        {{ formatDate(row.createdAt) }}
      </template>
    </Column>

    <template #empty>
      <div class="empty-state">
        <h3 class="empty-state-title">Brak danych do wyświetlenia</h3>
        <p class="empty-state-message">
          Nie znaleziono żadnych zapisów łupów bitewnych.
          Spróbuj odświeżyć stronę lub wróć później.
        </p>
      </div>
    </template>
  </AdvanceTable>

  <CardBoxModal
    v-model="isModalActive"
    title="Szczegóły przedmiotu"
    button="info"
    has-cancel
  >
    <div v-if="selectedItem && selectedRow" class="item-details">
      <div class="item-header">
        <div
          class="item-image"
          :style="{ backgroundImage: `url(${selectedItem.item.src})` }"
        ></div>
        <div class="item-info">
          <h3 class="item-name">{{ selectedItem.item.name }}</h3>
          <p class="item-meta">Kategoria: {{ selectedItem.item.category }}</p>
          <p class="item-meta">Rzadkość: {{ selectedItem.item.rarity }}</p>
        </div>
      </div>

      <div class="item-section">
        <h4>Przypisanie przedmiotu</h4>
        <div v-if="selectedRow.assignedItems && selectedRow.assignedItems.length > 0">
          <div
            v-for="assignedItem in selectedRow.assignedItems.filter((item) => item.lootItemId === selectedItem.id)"
            :key="assignedItem.characterId"
            class="assigned-item"
          >
            <p>Zdobywca: <strong>{{ assignedItem.characterName }}</strong></p>
          </div>
        </div>
        <p v-else>Przedmiot nie został jeszcze przypisany.</p>
      </div>

      <div class="item-section">
        <h4>Zainteresowanie przedmiotem</h4>
        <div v-if="selectedItem.wantCharacterIds && selectedItem.wantCharacterIds.length > 0">
          <h5>Chcą:</h5>
          <ul>
            <li v-for="charId in selectedItem.wantCharacterIds" :key="`want-${charId}`">
              {{ getCharacterNameById(selectedRow, charId) }}
            </li>
          </ul>
        </div>
        <div v-if="selectedItem.needCharacterIds && selectedItem.needCharacterIds.length > 0">
          <h5>Potrzebują:</h5>
          <ul>
            <li v-for="charId in selectedItem.needCharacterIds" :key="`need-${charId}`">
              {{ getCharacterNameById(selectedRow, charId) }}
            </li>
          </ul>
        </div>
        <div v-if="selectedItem.dontCharacterIds && selectedItem.dontCharacterIds.length > 0">
          <h5>Nie chcą:</h5>
          <ul>
            <li v-for="charId in selectedItem.dontCharacterIds" :key="`dont-${charId}`">
              {{ getCharacterNameById(selectedRow, charId) }}
            </li>
          </ul>
        </div>
        <p v-if="!(selectedItem.wantCharacterIds?.length || 0) && !(selectedItem.needCharacterIds?.length || 0) && !(selectedItem.dontCharacterIds?.length || 0)">
          Brak informacji o zainteresowaniu przedmiotem.
        </p>
      </div>
    </div>
  </CardBoxModal>
</template>

<style scoped>
.battle-item-sprite {
  width: 32px;
  height: 32px;
  cursor: pointer;
  background-position: center;
  background-size: contain;
}

.battle-character-sprite {
  width: 32px;
  height: 48px;
  background-position: left top;
  background-size: auto 192px;
}

.battle-npc-sprite {
  max-width: 64px;
  max-height: 64px;
  object-fit: contain;
}

.character-wrapper,
.item-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.battle-character-sprite,
.battle-item-sprite,
.battle-npc-sprite {
  margin: 2px;
  padding: 2px;
  border: 1px solid rgba(214, 179, 92, 0.3);
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.28);
  background-repeat: no-repeat;
}

.battle-item-sprite:hover {
  border-color: var(--game-gold-300);
  transform: translateY(-1px);
}

.loot-filter-panel {
  margin: 0 0 16px;
  padding: 14px;
  border: 1px solid var(--game-border);
  border-radius: 6px;
  background:
    linear-gradient(180deg, rgba(12, 48, 15, 0.9), rgba(4, 18, 5, 0.92)),
    repeating-linear-gradient(135deg, rgba(255, 236, 178, 0.025) 0 1px, transparent 1px 12px);
  box-shadow: inset 0 1px 0 rgba(255, 236, 178, 0.08), 0 10px 20px rgba(0, 0, 0, 0.24);
}

.loot-filter-grid {
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr) auto auto;
  gap: 12px;
  align-items: end;
}

.loot-filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: var(--game-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.loot-filter-field input {
  height: 38px;
  border-radius: 4px;
  padding: 0 10px;
  font-size: 0.875rem;
  font-weight: 500;
  text-transform: none;
}

.loot-filter-toggles {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.loot-filter-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 38px;
  padding: 0 10px;
  border: 1px solid rgba(214, 179, 92, 0.38);
  border-radius: 4px;
  color: var(--game-text);
  background: rgba(4, 19, 6, 0.72);
  font-size: 0.875rem;
  font-weight: 800;
  white-space: nowrap;
  cursor: pointer;
}

.loot-filter-toggle:hover {
  border-color: var(--game-gold-400);
  background: rgba(20, 64, 22, 0.75);
}

.loot-filter-toggle input {
  width: 16px;
  height: 16px;
  accent-color: var(--game-gold-500);
}

.loot-filter-actions {
  min-height: 38px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
}

.loot-filter-counter {
  color: var(--game-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  white-space: nowrap;
}

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
  margin-bottom: 15px;
  padding: 8px 12px;
  border: 1px solid rgba(214, 179, 92, 0.22);
  border-radius: 6px;
  color: var(--game-text-muted);
  background-color: rgba(3, 19, 6, 0.68);
  font-size: 0.875rem;
  text-align: center;
}

.loading-mark,
.fresh-mark {
  display: inline-flex;
  margin-right: 8px;
  padding: 2px 7px;
  border: 1px solid rgba(214, 179, 92, 0.28);
  border-radius: 999px;
  color: #fff3bf;
  background: rgba(25, 79, 26, 0.62);
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.loading-mark {
  background: rgba(118, 59, 29, 0.72);
}

.fresh-mark {
  color: #d8ffd1;
  background: rgba(21, 93, 35, 0.72);
}

.empty-state {
  margin: 1rem 0;
  padding: 2rem;
  border: 1px solid rgba(214, 179, 92, 0.22);
  border-radius: 6px;
  color: var(--game-text-muted);
  background: rgba(3, 19, 6, 0.48);
  text-align: center;
}

.empty-state-title {
  margin-bottom: 0.5rem;
  color: #fff2bd;
  font-size: 1.25rem;
  font-weight: 900;
}

.empty-state-message {
  max-width: 24rem;
  margin: 0 auto;
  color: var(--game-text-muted);
  line-height: 1.5;
}

.loot-highlight {
  position: relative;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.loot-highlight::before {
  content: '';
  position: absolute;
  inset: -2px;
  z-index: -1;
  border-radius: 6px;
  background: var(--highlight-color);
  opacity: 0.18;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.16;
  }

  50% {
    transform: scale(1.05);
    opacity: 0.32;
  }

  100% {
    transform: scale(1);
    opacity: 0.16;
  }
}

:deep(.legendary-row) {
  background:
    linear-gradient(90deg, rgba(141, 95, 23, 0.42), rgba(82, 20, 82, 0.22)),
    rgba(17, 49, 18, 0.7) !important;
  box-shadow: inset 4px 0 0 #e2bd56;
}

.item-details {
  max-width: 100%;
  color: var(--game-text);
  overflow-x: hidden;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(214, 179, 92, 0.24);
}

.item-image {
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  margin-right: 1rem;
  border: 1px solid rgba(214, 179, 92, 0.42);
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.24);
  background-position: center;
  background-repeat: no-repeat;
  background-size: contain;
}

.item-info {
  flex: 1;
}

.item-name {
  margin-bottom: 0.35rem;
  color: #fff2bd;
  font-size: 1.25rem;
  font-weight: 900;
}

.item-meta {
  margin-right: 4px;
  color: var(--game-text-muted);
  font-size: 0.875rem;
}

.item-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(214, 179, 92, 0.18);
}

.item-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.item-section h4 {
  margin-bottom: 0.75rem;
  color: #fff2bd;
  font-size: 1rem;
  font-weight: 900;
}

.item-section h5 {
  margin-top: 0.75rem;
  margin-bottom: 0.5rem;
  color: var(--game-gold-400);
  font-size: 0.875rem;
  font-weight: 900;
}

.item-section ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.item-section li {
  margin-bottom: 0.25rem;
  color: var(--game-text);
  font-size: 0.875rem;
}

.assigned-item {
  padding: 0.5rem;
  border: 1px solid rgba(214, 179, 92, 0.22);
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background-color: rgba(0, 0, 0, 0.18);
}

@media (max-width: 1024px) {
  .loot-filter-grid {
    grid-template-columns: 1fr 1fr;
  }

  .loot-filter-actions {
    justify-content: flex-start;
  }
}

@media (max-width: 640px) {
  .loot-filter-grid {
    grid-template-columns: 1fr;
  }
}
</style>

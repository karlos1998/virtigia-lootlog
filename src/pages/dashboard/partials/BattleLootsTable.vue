<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { LootlogBattleLootDTO, NpcDTO, CharacterLiteDTO, AssignedItem, LootItemDTO } from '@/api/api'
import AdvanceTable from '@/components/AdvanceTable.vue'
import Column from '@/components/Column.vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiService } from '@/services/api.service'
import { useMainStore } from '@/stores/main'
import CardBoxModal from '@/components/CardBoxModal.vue'
import BaseButton from '@/components/BaseButton.vue'
import { mdiInformationOutline } from '@mdi/js'

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
const mainStore = useMainStore();

const route = useRoute();

// Table data state
const tableData = ref(null);
const isLoading = ref(false);
const lastUpdated = ref(null);
const isModalActive = ref(false);
const selectedItem = ref(null);
const selectedRow = ref(null);

const loadTable = (page: number = 0) => {
  // Set loading state
  isLoading.value = true;

  apiService.withAuth().lootlog.getAll1({
    page,
    size: 30,
    sort: 'createdAt,desc'
  }).then((data) => {
    if(!data.content) return;
    // Update the table data
    tableData.value = data;
    // Update last updated timestamp
    lastUpdated.value = new Date();
  }).catch((error) => {
    console.error('Failed to load battle loots data:', error);
  }).finally(() => {
    // Set loading state to false when done
    isLoading.value = false;
  });
}

onMounted(() => {
  // Load data when component is mounted
  loadTable();
});

const changePage = (targetPage: number) => {
  loadTable(targetPage);
}

type SlotProps = {
  row: LootlogBattleLootDTO
  index: number
}

// Format date for display
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString();
}

// Function to get the color for a character based on character ID
const getCharacterColor = (row: LootlogBattleLootDTO, characterId: string) => {
  if (!row.assignedItems) return '';

  // Find the assigned item for this character
  const assignedItem = row.assignedItems.find(item => item.characterId === characterId);
  if (!assignedItem) return '';

  // Generate a color based on the character ID
  return generateUniqueColor(characterId);
};

// Function to get the color for a loot item based on the character who received it
const getLootItemColor = (row: LootlogBattleLootDTO, itemId: string) => {
  if (!row.assignedItems) return '';

  // Find the assigned item to determine which character received this loot
  // We need to find an assigned item where itemIds includes the id of the item
  const assignedItem = row.assignedItems.find(item => item.itemIds.includes(itemId));
  if (!assignedItem) return '';

  // Generate a color based on the character ID who received the item
  return generateUniqueColor(assignedItem.characterId);
};

// Function to show item details in modal
const showItemDetails = (item: LootItemDTO, row: LootlogBattleLootDTO) => {
  selectedItem.value = item;
  selectedRow.value = row;
  isModalActive.value = true;
};

// Function to get character name by ID
const getCharacterNameById = (row: LootlogBattleLootDTO, characterId: string) => {
  const character = row.characters.find(char => char.id === characterId);
  return character ? character.name : 'Unknown';
};
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
          :src="`${npc.src}`"
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
              backgroundImage: `url(${character.src})`,
              '--highlight-color': getCharacterColor(row, character.id),
              boxShadow: getCharacterColor(row, character.id) ? `0 0 0 2px ${getCharacterColor(row, character.id)}, 0 0 10px ${getCharacterColor(row, character.id)}` : ''
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
            v-tip.item="item.item"
            class="item"
            :class="{ 'loot-highlight': !!getLootItemColor(row, item.id) }"
            :style="{
              backgroundImage: `url(${item.item.src})`,
              '--highlight-color': getLootItemColor(row, item.id),
              boxShadow: getLootItemColor(row, item.id) ? `0 0 0 2px ${getLootItemColor(row, item.id)}, 0 0 10px ${getLootItemColor(row, item.id)}` : ''
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
        <div class="empty-state-icon">📋</div>
        <h3 class="empty-state-title">Brak danych do wyświetlenia</h3>
        <p class="empty-state-message">
          Nie znaleziono żadnych zapisów łupów bitewnych.
          Spróbuj odświeżyć stronę lub wróć później.
        </p>
      </div>
    </template>
  </AdvanceTable>

  <!-- Item Details Modal -->
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
          <p class="item-category">Kategoria: {{ selectedItem.item.category }}</p>
          <p class="item-rarity">Rzadkość: {{ selectedItem.item.rarity }}</p>
        </div>
      </div>

      <div class="item-section">
        <h4>Przypisanie przedmiotu</h4>
        <div v-if="selectedRow.assignedItems && selectedRow.assignedItems.length > 0">
          <div v-for="assignedItem in selectedRow.assignedItems.filter(item => item.lootItemId === selectedItem.id)" class="assigned-item">
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
            <li v-for="charId in selectedItem.wantCharacterIds">
              {{ getCharacterNameById(selectedRow, charId) }}
            </li>
          </ul>
        </div>
        <div v-if="selectedItem.needCharacterIds && selectedItem.needCharacterIds.length > 0">
          <h5>Potrzebują:</h5>
          <ul>
            <li v-for="charId in selectedItem.needCharacterIds">
              {{ getCharacterNameById(selectedRow, charId) }}
            </li>
          </ul>
        </div>
        <div v-if="selectedItem.dontCharacterIds && selectedItem.dontCharacterIds.length > 0">
          <h5>Nie chcą:</h5>
          <ul>
            <li v-for="charId in selectedItem.dontCharacterIds">
              {{ getCharacterNameById(selectedRow, charId) }}
            </li>
          </ul>
        </div>
        <p v-if="!selectedItem.wantCharacterIds.length && !selectedItem.needCharacterIds.length && !selectedItem.dontCharacterIds.length">
          Brak informacji o zainteresowaniu przedmiotem.
        </p>
      </div>
    </div>
  </CardBoxModal>
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

/* Item details modal styles */
.item-details {
  max-width: 100%;
  overflow-x: hidden;
}

.item-header {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .item-header {
  border-color: #374151;
}

.item-image {
  width: 64px;
  height: 64px;
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  margin-right: 1rem;
  border-radius: 4px;
  border: 2px solid #e5e7eb;
}

.dark .item-image {
  border-color: #374151;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.25rem;
  color: #1f2937;
}

.dark .item-name {
  color: #f3f4f6;
}

.item-category, .item-rarity {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.dark .item-category, .dark .item-rarity {
  color: #9ca3af;
}

.item-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dark .item-section {
  border-color: #374151;
}

.item-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.item-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: #1f2937;
}

.dark .item-section h4 {
  color: #f3f4f6;
}

.item-section h5 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  margin-top: 0.75rem;
  color: #4b5563;
}

.dark .item-section h5 {
  color: #d1d5db;
}

.item-section ul {
  list-style-type: disc;
  padding-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.item-section li {
  font-size: 0.875rem;
  color: #4b5563;
  margin-bottom: 0.25rem;
}

.dark .item-section li {
  color: #d1d5db;
}

.assigned-item {
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.dark .assigned-item {
  background-color: #1f2937;
}
</style>

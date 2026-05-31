<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { mdiCalendarClock, mdiFilterVariant, mdiReload } from '@mdi/js'
import SectionMain from '@/components/SectionMain.vue'
import CardBox from '@/components/CardBox.vue'
import LayoutAuthenticated from '@/layouts/LayoutAuthenticated.vue'
import SectionTitleLineWithButton from '@/components/SectionTitleLineWithButton.vue'
import BattleDatesTable from '@/pages/dashboard/partials/BattleDatesTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseIcon from '@/components/BaseIcon.vue'

const route = useRoute()
const router = useRouter()
const minLvl = ref('')
const maxLvl = ref('')
const battleDatesTableRef = ref(null)

if (route.query.minLvl) {
  minLvl.value = route.query.minLvl
}
if (route.query.maxLvl) {
  maxLvl.value = route.query.maxLvl
}

// Computed property for active filter count
const activeFilterCount = computed(() => {
  let count = 0
  if (minLvl.value) count++
  if (maxLvl.value) count++
  return count
})

const applyLevelFilter = () => {
  const query = { ...route.query }

  if (minLvl.value) {
    query.minLvl = minLvl.value
  } else {
    delete query.minLvl
  }

  if (maxLvl.value) {
    query.maxLvl = maxLvl.value
  } else {
    delete query.maxLvl
  }

  router.push({ query })
}

const clearLevelFilter = () => {
  minLvl.value = ''
  maxLvl.value = ''

  const query = { ...route.query }
  delete query.minLvl
  delete query.maxLvl

  router.push({ query })
}

const refreshBattleDatesTable = () => {
  battleDatesTableRef.value?.refresh()
}
</script>

<template>
  <LayoutAuthenticated>
    <SectionMain>
      <SectionTitleLineWithButton :icon="mdiCalendarClock" title="Daty bitew">
        <BaseButton :icon="mdiReload" label="Odśwież" color="info" @click="refreshBattleDatesTable" />
      </SectionTitleLineWithButton>

      <div class="battle-filter-panel">
        <div class="battle-filter-title">
          <span class="battle-filter-icon"><BaseIcon :path="mdiFilterVariant" size="18" /></span>
          <div>
            <strong>Filtry poziomu</strong>
            <span>Zakres poziomu przeciwników w historii respawnów</span>
          </div>
        </div>
        <div class="battle-filter-fields">
          <label>
            <span>Min. poziom</span>
            <input v-model="minLvl" type="number" inputmode="numeric" placeholder="np. 1" />
          </label>
          <label>
            <span>Max. poziom</span>
            <input v-model="maxLvl" type="number" inputmode="numeric" placeholder="np. 100" />
          </label>
          <BaseButtons>
            <BaseButton label="Zastosuj" color="info" @click="applyLevelFilter" />
            <BaseButton v-if="activeFilterCount > 0" label="Wyczyść" color="danger" outline @click="clearLevelFilter" />
          </BaseButtons>
        </div>
      </div>

      <CardBox has-table>
        <BattleDatesTable ref="battleDatesTableRef" />
      </CardBox>
    </SectionMain>
  </LayoutAuthenticated>
</template>

<style scoped>
.battle-filter-panel {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.2rem;
  padding: 0.9rem;
  border: 1px solid var(--game-border);
  border-radius: 6px;
  background: linear-gradient(180deg, rgba(11, 42, 13, 0.94), rgba(4, 18, 6, 0.96));
  box-shadow: inset 0 1px 0 rgba(255, 238, 190, 0.08), 0 10px 20px rgba(0, 0, 0, 0.25);
}

.battle-filter-title {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.battle-filter-title strong,
.battle-filter-title span {
  display: block;
}

.battle-filter-title strong {
  color: var(--game-gold-300);
  font-weight: 900;
}

.battle-filter-title span {
  color: var(--game-text-muted);
  font-size: 0.78rem;
}

.battle-filter-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid rgba(214, 179, 92, 0.4);
  border-radius: 4px;
  color: var(--game-gold-300);
  background: rgba(0, 0, 0, 0.24);
}

.battle-filter-fields {
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  justify-content: flex-end;
  gap: 0.75rem;
}

.battle-filter-fields label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 8.5rem;
}

.battle-filter-fields label span {
  color: var(--game-text-muted);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.battle-filter-fields input {
  height: 2.3rem;
  border-radius: 4px;
  padding: 0 0.65rem;
}

@media (max-width: 900px) {
  .battle-filter-panel {
    align-items: stretch;
    flex-direction: column;
  }

  .battle-filter-fields {
    justify-content: flex-start;
  }
}
</style>

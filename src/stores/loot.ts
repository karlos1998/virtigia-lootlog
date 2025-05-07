import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { LootlogBattleRecordDTO } from '@/api/api'

export interface LootStoreState {
  tableData: any | null;
  loading: boolean;
  lastUpdated: Date | null;
  npcRank: 'NORMAL' | 'ELITE' | 'ELITE_II' | 'ELITE_III' | 'HERO' | 'TITAN' | null;
  dataFresh: boolean;
}

export const useLootStore = defineStore('loot', () => {
  const tableData = ref<any | null>(null);
  const loading = ref<boolean>(false);
  const lastUpdated = ref<Date | null>(null);
  const npcRank = ref<'NORMAL' | 'ELITE' | 'ELITE_II' | 'ELITE_III' | 'HERO' | 'TITAN' | null>(null);
  const dataFresh = ref<boolean>(false);

  function setTableData(data: any) {
    tableData.value = data;
    lastUpdated.value = new Date();
    dataFresh.value = true;
  }

  function setLoading(isLoading: boolean) {
    loading.value = isLoading;
  }

  function setNpcRank(rank: 'NORMAL' | 'ELITE' | 'ELITE_II' | 'ELITE_III' | 'HERO' | 'TITAN' | null) {
    npcRank.value = rank;
  }

  const formattedLastUpdated = computed(() => {
    if (!lastUpdated.value) return null;
    return lastUpdated.value.toLocaleString();
  });

  const isDataFresh = computed(() => {
    return dataFresh.value;
  });

  return {
    tableData,
    loading,
    lastUpdated,
    npcRank,
    dataFresh,
    formattedLastUpdated,
    isDataFresh,
    setTableData,
    setLoading,
    setNpcRank
  }
}, {
  persist: {
    key: 'loot-store',
    storage: localStorage,
    paths: ['tableData', 'lastUpdated', 'npcRank', 'dataFresh']
  }
})

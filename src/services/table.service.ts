import { ApiService } from '@/services/api.service' // ścieżka do wygenerowanego pliku api.ts

const apiService = new ApiService();

export class TableService {
  /**
   * Pobierz listę bitew z API
   * @param params Parametry zapytania (filtrowanie, paginacja itp)
   * @returns Promise z danymi odpowiedzi
   */
  async fetch(params?: {
    npcName?: string
    characterName?: string
    minNpcLvl?: number
    maxNpcLvl?: number
    minCharacterLvl?: number
    maxCharacterLvl?: number
    page?: number
    size?: number
    sort?: string[],
    npcRank?: 'NORMAL' | 'ELITE' | 'ELITE_II' | 'ELITE_III' | 'HERO' | 'TITAN'
  }) {
    return apiService.withAuth().lootlog.getAll(params)
  }
}

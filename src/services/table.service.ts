import { Api } from '@/api/api' // ścieżka do wygenerowanego pliku api.ts

const apiClient = new Api({
  baseURL: import.meta.env.VITE_API_BASE_URL,
})

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
    return apiClient.lootlog.getAll(params)
  }
}

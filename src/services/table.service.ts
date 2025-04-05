import { Api } from '@/api/api' // ścieżka do wygenerowanego pliku api.ts
import type { PageBattleRecordDTO } from '@/api/api' // import typów

// Utwórz instancję API
const apiClient = new Api({
  // baseUrl: 'https://engine-retro.margatron.ovh', // lub inny URL jeśli potrzebujesz
  baseUrl: 'https://mbp-karol-java.letscode.it', // lub inny URL jeśli potrzebujesz
  baseApiParams: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  },
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
    sort?: string[]
  }) {
    return apiClient.lootlog.getAll(params)
  }
}

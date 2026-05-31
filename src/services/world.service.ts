import { getWorldsEndpoint, WORLD_CACHE_KEY, WORLD_STORAGE_KEY } from '@/config/worlds'

export interface LootlogWorld {
  id: string
  label: string
  apiUrl: string
}

interface WorldsPayload {
  worlds?: unknown[]
}

const normalizeWorld = (world: unknown): LootlogWorld | null => {
  if (!world || typeof world !== 'object') {
    return null
  }

  const rawWorld = world as Record<string, unknown>
  const id = String(rawWorld.id || '')
  const apiUrl = String(rawWorld.apiUrl || '').trim()

  if (!id || !apiUrl) {
    return null
  }

  return {
    id,
    label: String(rawWorld.label || id),
    apiUrl: apiUrl.replace(/\/?$/, '/'),
  }
}

const readCachedWorlds = () => {
  try {
    const cachedWorlds = JSON.parse(localStorage.getItem(WORLD_CACHE_KEY) || '[]') as unknown
    if (!Array.isArray(cachedWorlds)) {
      return []
    }

    return cachedWorlds.map(normalizeWorld).filter((world): world is LootlogWorld => world !== null)
  } catch {
    return []
  }
}

let worlds = readCachedWorlds()

const WorldService = {
  getWorlds() {
    return worlds
  },

  getWorldById(worldId: string | null | undefined) {
    if (!worldId) {
      return null
    }

    return worlds.find((world) => world.id === worldId) || null
  },

  async loadWorlds({ force = false, code = null }: { force?: boolean; code?: string | null } = {}) {
    if (!force && !code && worlds.length > 0) {
      return worlds
    }

    const response = await fetch(getWorldsEndpoint(code), {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Nie udało się pobrać listy światów.')
    }

    const payload = (await response.json()) as WorldsPayload
    worlds = (payload.worlds || [])
      .map(normalizeWorld)
      .filter((world): world is LootlogWorld => world !== null)
    localStorage.setItem(WORLD_CACHE_KEY, JSON.stringify(worlds))

    const selectedWorldId = localStorage.getItem(WORLD_STORAGE_KEY)
    if (selectedWorldId && !this.getWorldById(selectedWorldId)) {
      localStorage.removeItem(WORLD_STORAGE_KEY)
    }

    return worlds
  },

  getSelectedWorld() {
    return this.getWorldById(localStorage.getItem(WORLD_STORAGE_KEY))
  },

  setSelectedWorld(worldId: string) {
    const world = this.getWorldById(worldId)
    if (!world) {
      throw new Error(`World "${worldId}" is not configured`)
    }

    localStorage.setItem(WORLD_STORAGE_KEY, world.id)
    return world
  },

  getSelectedWorldApiUrl() {
    return (
      this.getSelectedWorld()?.apiUrl ||
      import.meta.env.VITE_API_BASE_URL ||
      'https://mbp-karol-java-margatron.letscode.it'
    )
  },
}

export default WorldService

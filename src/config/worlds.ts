export const WORLD_STORAGE_KEY = 'lootlog_selected_world_id'
export const WORLD_CACHE_KEY = 'lootlog_worlds'

export const getMargatronBaseUrl = () => {
  if (import.meta.env.VITE_MARGATRON_APP_URL) {
    return import.meta.env.VITE_MARGATRON_APP_URL.replace(/\/$/, '')
  }

  const oauthUrl = import.meta.env.VITE_MARGATRON_OATH_APP_URL

  try {
    return new URL(oauthUrl).origin
  } catch {
    return ''
  }
}

export const getWorldsEndpoint = (code: string | null = null) => {
  const endpoint = `${getMargatronBaseUrl()}/api/lootlog/worlds`

  if (!code) {
    return endpoint
  }

  return `${endpoint}?code=${encodeURIComponent(code)}`
}

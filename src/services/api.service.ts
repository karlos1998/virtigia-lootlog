import { Api } from '@/api/api'
import router from '@/router'
import WorldService from '@/services/world.service'

const LEGACY_TOKEN_KEY = 'jwt'
const TOKEN_KEY_PREFIX = 'lootlog_jwt:'

const getTokenKeyForWorld = (worldId: string) => `${TOKEN_KEY_PREFIX}${worldId}`

export class ApiService extends Api<string> {
  constructor() {
    super({
      baseURL: WorldService.getSelectedWorldApiUrl(),
      securityWorker: (token) =>
        token
          ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
          : {},
      secure: true,
    })

    // Add response interceptor to handle authentication errors globally
    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 403 || error.response?.status === 401) {
          this.clearToken()
          await router.push('/login')
        }
        return Promise.reject(error)
      }
    )
  }

  refreshBaseUrl() {
    this.instance.defaults.baseURL = WorldService.getSelectedWorldApiUrl()
  }

  setToken(token: string) {
    const selectedWorld = WorldService.getSelectedWorld()
    if (!selectedWorld) {
      throw new Error('No world selected')
    }

    localStorage.setItem(getTokenKeyForWorld(selectedWorld.id), token)
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    this.setSecurityData(token)
    this.refreshBaseUrl()
  }

  getToken() {
    const selectedWorld = WorldService.getSelectedWorld()
    if (!selectedWorld) {
      return null
    }

    const tokenKey = getTokenKeyForWorld(selectedWorld.id)
    const token = localStorage.getItem(tokenKey)
    if (token) {
      return token
    }

    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY)
    if (legacyToken) {
      localStorage.setItem(tokenKey, legacyToken)
      localStorage.removeItem(LEGACY_TOKEN_KEY)
    }

    return legacyToken
  }

  clearToken() {
    const selectedWorld = WorldService.getSelectedWorld()
    if (selectedWorld) {
      localStorage.removeItem(getTokenKeyForWorld(selectedWorld.id))
    }
    localStorage.removeItem(LEGACY_TOKEN_KEY)
    this.setSecurityData(null)
  }

  withAuth() {
    this.refreshBaseUrl()
    this.setSecurityData(this.getToken())
    return this
  }

}

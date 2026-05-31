<script setup>
import SectionFullScreen from '@/components/SectionFullScreen.vue'
import CardBox from '@/components/CardBox.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseButtons from '@/components/BaseButtons.vue'
import LayoutGuest from '@/layouts/LayoutGuest.vue'
import { ApiService } from '@/services/api.service.js'
import WorldService from '@/services/world.service'
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter();
const apiService = new ApiService()
const loading = ref(true)
const authenticating = ref(false)
const error = ref(null)
const worlds = ref([])
const selectedWorldId = ref(null)
const oauthCode = ref(null)

const authenticateSelectedWorld = async () => {
  if (!oauthCode.value || !selectedWorldId.value) {
    error.value = 'Wybierz świat, aby kontynuować.'
    return
  }

  authenticating.value = true
  error.value = null

  try {
    WorldService.setSelectedWorld(selectedWorldId.value)
    apiService.refreshBaseUrl()
    const data = await apiService.lootlog.oauthCallback({ code: oauthCode.value })
    apiService.setToken(data.token)
    await router.push('/')
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      err.response?.data?.detail ||
      err.message ||
      'Nie udało się zalogować do lootloga.'
  } finally {
    authenticating.value = false
  }
}

onMounted(async () => {
  const code = route.query.code
  const state = route.query.state

  if (typeof code !== 'string' || !code) {
    error.value = 'Nie otrzymano kodu autoryzacyjnego.'
    loading.value = false
    return
  }

  oauthCode.value = code

  try {
    worlds.value = await WorldService.loadWorlds({ force: true, code })

    if (worlds.value.length === 0) {
      throw new Error('Nie masz postaci na żadnym świecie z aktywnym lootlogiem.')
    }

    const stateWorld = typeof state === 'string' ? WorldService.getWorldById(state) : null
    const storedWorld = WorldService.getSelectedWorld()
    selectedWorldId.value = stateWorld?.id || storedWorld?.id || worlds.value[0]?.id || null

    if (worlds.value.length === 1 || stateWorld) {
      await authenticateSelectedWorld()
    }
  } catch (err) {
    error.value = err.message || 'Nie udało się pobrać dostępnych światów.'
  } finally {
    loading.value = false
  }
})

</script>

<template>
  <LayoutGuest>
    <SectionFullScreen v-slot="{ cardClass }" bg="purplePink">
      <CardBox :class="cardClass" is-form>
        <div v-if="loading">
          Autoryzacja, proszę czekać....
        </div>

        <div v-else-if="error" class="space-y-4">
          <p class="text-red-600 dark:text-red-400">{{ error }}</p>
        </div>

        <div v-else class="space-y-4">
          <div>
            <label for="worldSelect" class="mb-2 block text-sm font-semibold">Świat</label>
            <select
              id="worldSelect"
              v-model="selectedWorldId"
              class="w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
            >
              <option v-for="world in worlds" :key="world.id" :value="world.id">
                {{ world.label }}
              </option>
            </select>
          </div>
          <p class="text-sm text-gray-500 dark:text-slate-400">
            Lootlog połączy się z silnikiem wybranego świata.
          </p>
        </div>

        <template #footer>
          <BaseButtons>
            <BaseButton
              v-if="loading"
              :disabled="true"
              color="info"
              label="Wczytywanie..."
            />
            <BaseButton
              v-else-if="error"
              color="info"
              label="Wróć do logowania"
              @click="router.push('/login')"
            />
            <BaseButton
              v-else
              :disabled="authenticating || !selectedWorldId"
              color="info"
              :label="authenticating ? 'Logowanie...' : 'Kontynuuj'"
              @click="authenticateSelectedWorld"
            />
          </BaseButtons>
        </template>
      </CardBox>
    </SectionFullScreen>
  </LayoutGuest>
</template>

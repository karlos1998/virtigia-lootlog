import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { LootlogUserDTO } from '@/api/api'

export const useMainStore = defineStore('main', () => {
  const userName = ref('John Doe')
  const userEmail = ref('doe.doe.doe@example.com')

  const userAvatar = computed(
    () =>
      `${baseAssetsPath.value}/${avatarSrc.value}`,
  )

  const avatarSrc = ref();
  const baseAssetsPath = ref();

  const isFieldFocusRegistered = ref(false)

  const clients = ref([])

  function setUser(payload: LootlogUserDTO) {
    if (payload.name) {
      userName.value = payload.name
    }
    if (payload.email) {
      userEmail.value = payload.email
    }
    if(payload.avatar) {
      avatarSrc.value = payload.avatar;
    }
    if(payload.baseAssetsPath) {
      baseAssetsPath.value = payload.baseAssetsPath;
    }
  }

  return {
    userName,
    userEmail,
    userAvatar,
    isFieldFocusRegistered,
    clients,
    history,
    setUser,
  }
})

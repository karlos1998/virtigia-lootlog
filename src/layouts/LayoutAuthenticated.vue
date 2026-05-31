<script setup>
import { mdiBackburger, mdiForwardburger, mdiLogout, mdiMenu, mdiShieldCrownOutline } from '@mdi/js'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import menuAside from '@/menuAside.js'
import BaseIcon from '@/components/BaseIcon.vue'
import NavBar from '@/components/NavBar.vue'
import NavBarItemPlain from '@/components/NavBarItemPlain.vue'
import AsideMenu from '@/components/AsideMenu.vue'
import { ApiService } from '@/services/api.service.js'
import { useMainStore } from '@/stores/main.ts'
import { RockTip } from 'virtigia-tips'
import WorldService from '@/services/world.service'

const layoutAsidePadding = 'xl:pl-60'

const router = useRouter()

const isAsideMobileExpanded = ref(false)
const isAsideLgActive = ref(false)
const apiService = new ApiService()
const mainStore = useMainStore()
const selectedWorldLabel = computed(() => WorldService.getSelectedWorld()?.label || 'Świat gry')

router.beforeEach(() => {
  isAsideMobileExpanded.value = false
  isAsideLgActive.value = false
})

const menuClick = (event, item) => {
  if (item.isLogout) {
    apiService.clearToken()
    router.push('/login')
  }
}

apiService.withAuth().lootlog.myProfile()
  .then((data) => {
    mainStore.setUser(data)
  })
  .catch(() => {})
</script>

<template>
  <RockTip />

  <div
    :class="{
      'overflow-hidden lg:overflow-visible': isAsideMobileExpanded,
    }"
  >
    <div
      :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
      class="lootlog-shell pt-14 min-h-screen w-screen transition-position lg:w-auto"
    >
      <NavBar
        :menu="[]"
        :class="[layoutAsidePadding, { 'ml-60 lg:ml-0': isAsideMobileExpanded }]"
        @menu-click="menuClick"
      >
        <NavBarItemPlain
          display="flex lg:hidden"
          @click.prevent="isAsideMobileExpanded = !isAsideMobileExpanded"
        >
          <BaseIcon :path="isAsideMobileExpanded ? mdiBackburger : mdiForwardburger" size="24" />
        </NavBarItemPlain>
        <NavBarItemPlain display="hidden lg:flex xl:hidden" @click.prevent="isAsideLgActive = true">
          <BaseIcon :path="mdiMenu" size="24" />
        </NavBarItemPlain>
        <div class="game-navbar-title">
          <BaseIcon :path="mdiShieldCrownOutline" size="22" />
          <div>
            <strong>Margatron Lootlog</strong>
            <span>{{ selectedWorldLabel }}</span>
          </div>
        </div>
        <div class="game-navbar-user">
          <span>{{ mainStore.userName }}</span>
          <button type="button" class="game-navbar-logout" @click="menuClick($event, { isLogout: true })">
            <BaseIcon :path="mdiLogout" size="18" />
            Wyloguj
          </button>
        </div>
      </NavBar>
      <AsideMenu
        :is-aside-mobile-expanded="isAsideMobileExpanded"
        :is-aside-lg-active="isAsideLgActive"
        :menu="menuAside"
        @menu-click="menuClick"
        @aside-lg-close-click="isAsideLgActive = false"
      />
      <slot />
    </div>
  </div>
</template>

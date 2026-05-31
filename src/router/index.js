import { createRouter, createWebHashHistory } from 'vue-router'
import BattleDates from '@/pages/dashboard/BattleDatesView.vue'
import BattleLoots from '@/pages/dashboard/BattleLootsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/battle-dates',
  },
  {
    meta: {
      title: 'Daty bitew',
    },
    path: '/battle-dates',
    name: 'battle-dates',
    component: BattleDates,
  },
  {
    meta: {
      title: 'Łupy bitewne',
    },
    path: '/battle-loots',
    name: 'battle-loots',
    component: BattleLoots,
  },
  {
    meta: {
      title: 'Logowanie',
    },
    path: '/login',
    name: 'login',
    component: () => import('@/pages/LoginView.vue'),
  },
  {
    meta: {
      title: 'Login Callback',
    },
    path: '/login/callback',
    name: 'login-callback',
    component: () => import('@/pages/LoginCallback.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

export default router

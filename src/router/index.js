import { createRouter, createWebHashHistory } from 'vue-router'
// import Style from '@/views/StyleView.vue'
import Home from '@/pages/dashboard/HomeView.vue'
import BattleDates from '@/pages/dashboard/BattleDatesView.vue'
import BattleLoots from '@/pages/dashboard/BattleLootsView.vue'

const routes = [
  // {
  //   meta: {
  //     title: 'Select style',
  //   },
  //   path: '/',
  //   name: 'style',
  //   component: Style,
  // },
  {
    path: '/',
    redirect: '/battle-dates',
  },
  {
    meta: {
      title: 'Battle Dates',
    },
    path: '/battle-dates',
    name: 'battle-dates',
    component: BattleDates,
  },
  {
    meta: {
      title: 'Battle Loots',
    },
    path: '/battle-loots',
    name: 'battle-loots',
    component: BattleLoots,
  },
  // {
  //   meta: {
  //     title: 'Tables',
  //   },
  //   path: '/tables',
  //   name: 'tables',
  //   component: () => import('@/views/TablesView.vue'),
  // },
  // {
  //   meta: {
  //     title: 'Forms',
  //   },
  //   path: '/forms',
  //   name: 'forms',
  //   component: () => import('@/views/FormsView.vue'),
  // },
  // {
  //   meta: {
  //     title: 'Profile',
  //   },
  //   path: '/profile',
  //   name: 'profile',
  //   component: () => import('@/views/ProfileView.vue'),
  // },
  // {
  //   meta: {
  //     title: 'Ui',
  //   },
  //   path: '/ui',
  //   name: 'ui',
  //   component: () => import('@/views/UiView.vue'),
  // },
  // {
  //   meta: {
  //     title: 'Responsive layout',
  //   },
  //   path: '/responsive',
  //   name: 'responsive',
  //   component: () => import('@/views/ResponsiveView.vue'),
  // },
  {
    meta: {
      title: 'Login',
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
  // {
  //   meta: {
  //     title: 'Error',
  //   },
  //   path: '/error',
  //   name: 'error',
  //   component: () => import('@/views/ErrorView.vue'),
  // },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return savedPosition || { top: 0 }
  },
})

export default router

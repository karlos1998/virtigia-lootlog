import {
  mdiAccountCircle,
  mdiMonitor,
  mdiGithub,
  mdiLock,
  mdiAlertCircle,
  mdiSquareEditOutline,
  mdiTable,
  mdiViewList,
  mdiTelevisionGuide,
  mdiResponsive,
  mdiPalette,
  mdiReact,
} from '@mdi/js'
import router from '@/router/index.js'

export default [
  // {
  //   to: '/',
  //   icon: mdiMonitor,
  //   label: 'Dashboard',
  // },
  {
    to: '/battle-dates',
    label: 'Daty Bitew',
    icon: mdiTable,
  },
  {
    to: '/battle-loots',
    label: 'Łupy Bitewne',
    icon: mdiTable,
  },
  // {
  //   to: '/tables',
  //   label: 'Tables',
  //   icon: mdiTable,
  // },
  // {
  //   to: '/forms',
  //   label: 'Forms',
  //   icon: mdiSquareEditOutline,
  // },
  // {
  //   to: '/ui',
  //   label: 'UI',
  //   icon: mdiTelevisionGuide,
  // },
  // {
  //   to: '/responsive',
  //   label: 'Responsive',
  //   icon: mdiResponsive,
  // },
  // {
  //   to: '/',
  //   label: 'Styles',
  //   icon: mdiPalette,
  // },
  // {
  //   to: '/profile',
  //   label: 'Profile',
  //   icon: mdiAccountCircle,
  // },
  // {
  //   to: '/login',
  //   label: 'Login',
  //   icon: mdiLock,
  // },
  // {
  //   to: '/error',
  //   label: 'Error',
  //   icon: mdiAlertCircle,
  // },
  // {
  //   label: 'Dropdown',
  //   icon: mdiViewList,
  //   menu: [
  //     {
  //       label: 'Item One',
  //     },
  //     {
  //       label: 'Item Two',
  //     },
  //   ],
  // },
  // {
  //   href: 'https://github.com/justboil/admin-one-vue-tailwind',
  //   label: 'GitHub',
  //   icon: mdiGithub,
  //   target: '_blank',
  // },
  // {
  //   href: 'https://margatron.ovh',
  //   label: 'Margatron',
  //   icon: mdiReact,
  //   target: '_blank',
  // },
]

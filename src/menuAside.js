import {
  mdiTable
} from '@mdi/js'

export default [
  // {
  //   to: '/',
  //   icon: mdiMonitor,
  //   label: 'Dashboard',
  // },
  {
    label: 'Daty Bitew',
    icon: mdiTable,
    menu: [
      {
        to: '/battle-dates',
        label: 'Wszystkie',
      },
      {
        to: '/battle-dates?baseNpcRank=ELITE',
        label: 'Elity',
      },
      {
        to: '/battle-dates?baseNpcRank=ELITE_II',
        label: 'Elity II',
      },
      {
        to: '/battle-dates?baseNpcRank=HERO',
        label: 'Herosi',
      },
      {
        to: '/battle-dates?baseNpcRank=TITAN',
        label: 'Tytani',
      },
    ],
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

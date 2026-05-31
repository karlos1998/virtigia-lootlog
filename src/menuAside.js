import {
  mdiCalendarClock,
  mdiCrown,
  mdiDiamondStone,
  mdiShieldCrownOutline,
  mdiSkull,
  mdiSwordCross,
  mdiTreasureChest,
} from '@mdi/js'

export default [
  {
    label: 'Respawny',
    icon: mdiCalendarClock,
    menu: [
      {
        to: '/battle-dates',
        label: 'Wszystkie',
      },
      {
        to: '/battle-dates?baseNpcRank=ELITE',
        label: 'Elity',
        icon: mdiSwordCross,
      },
      {
        to: '/battle-dates?baseNpcRank=ELITE_II',
        label: 'Elity II',
        icon: mdiShieldCrownOutline,
      },
      {
        to: '/battle-dates?baseNpcRank=HERO',
        label: 'Herosi',
        icon: mdiCrown,
      },
      {
        to: '/battle-dates?baseNpcRank=TITAN',
        label: 'Tytani',
        icon: mdiSkull,
      },
    ],
  },
  {
    to: '/battle-loots',
    label: 'Łupy bitewne',
    icon: mdiTreasureChest,
  },
  {
    to: '/battle-loots?legendaryOnly=true',
    label: 'Legendarne',
    icon: mdiDiamondStone,
  },
]

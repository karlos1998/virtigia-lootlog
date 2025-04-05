<script setup lang="ts">

import TableSampleClients from '@/components/TableSampleClients.vue'
import { TableService } from '@/services/table.service'
import { onMounted, ref } from 'vue'
import { mdiTrashCan } from '@mdi/js'
import BaseButtons from '@/components/BaseButtons.vue'
import BaseButton from '@/components/BaseButton.vue'
import { BattleRecordDTO } from '@/api/api'

const tableService = new TableService();

const items = ref<BattleRecordDTO[]>([]);

onMounted(() => {
  tableService.fetch().then((data) => {
    console.log(data)
    items.value = data.content
  });

})

</script>
<template>
<!--  <TableSampleClients :items />-->

  <table>
    <thead>
    <tr>
      <th />
      <th>Moby</th>
      <th>Gracze</th>
      <th>City</th>
      <th>Progress</th>
      <th>Created</th>
      <th />
    </tr>
    </thead>
    <tbody>
    <tr v-for="item in items" :key="item.id">
      <td class="border-b-0 lg:w-6 before:hidden">
        <!--          <UserAvatar :username="item.name" class="w-24 h-24 mx-auto lg:w-6 lg:h-6" />-->
      </td>
      <td data-label="Name">
        {{ item.npcs.map(npc => `${npc.name} (${npc.lvl}${npc.profession})`).join(', ') }}
      </td>
      <td data-label="Company">
        {{ item.characters.map(character => `${character.name} (${character.lvl}${character.profession})`).join(', ') }}
      </td>
      <td data-label="City">
        {{ item.city }}
      </td>
      <td data-label="Progress" class="lg:w-32">
        <progress class="flex w-2/5 self-center lg:w-full" max="100" :value="item.progress">
          {{ item.progress }}
        </progress>
      </td>
      <td data-label="Created" class="lg:w-1 whitespace-nowrap">
        <small class="text-gray-500 dark:text-slate-400" :title="item.created">{{
            item.created
          }}</small>
      </td>
      <td class="before:hidden lg:w-1 whitespace-nowrap">
        <BaseButtons type="justify-start lg:justify-end" no-wrap>
          <BaseButton
            color="danger"
            :icon="mdiTrashCan"
            small
          />
        </BaseButtons>
      </td>
    </tr>
    </tbody>
  </table>
  <div class="p-3 lg:px-6 border-t border-gray-100 dark:border-slate-800">
    <!--    <BaseLevel>-->
    <!--      <BaseButtons>-->
    <!--        <BaseButton-->
    <!--          v-for="page in pagesList"-->
    <!--          :key="page"-->
    <!--          :active="page === currentPage"-->
    <!--          :label="page + 1"-->
    <!--          :color="page === currentPage ? 'lightDark' : 'whiteDark'"-->
    <!--          small-->
    <!--          @click="currentPage = page"-->
    <!--        />-->
    <!--      </BaseButtons>-->
    <!--      <small>Page {{ currentPageHuman }} of {{ numPages }}</small>-->
    <!--    </BaseLevel>-->
  </div>

</template>

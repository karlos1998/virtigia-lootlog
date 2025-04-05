<script setup lang="ts">

import TableSampleClients from '@/components/TableSampleClients.vue'
import { TableService } from '@/services/table.service'
import { onMounted } from 'vue'

const tableService = new TableService();

onMounted(() => {
  tableService.fetch();
})

</script>
<template>
  <TableSampleClients />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { FILTER_FALLBACK, getDataCatalogCards, getDataCenterFilters, getDataCenterSources } from "@/lib/dataCenterApi";
import type { DataCatalogCard as DataCatalogCardType, DataFilterGroup, DataSourceCard } from "@/types";
import { dataCatalogCards as dataCatalogFallback, dataSources as dataSourceFallback } from "@/lib/dataCenterStaticData";
import DataCenterClient from "@/components/DataCenterClient.vue";

const sources = ref<DataSourceCard[]>(dataSourceFallback);
const filters = ref<DataFilterGroup[]>(FILTER_FALLBACK);
const cards = ref<DataCatalogCardType[]>(dataCatalogFallback);

onMounted(async () => {
  [sources.value, filters.value, cards.value] = await Promise.all([getDataCenterSources(), getDataCenterFilters(), getDataCatalogCards()]);
});
</script>

<template>
  <DataCenterClient
    :sources="sources"
    :filters="filters"
    :cards="cards"
  />
</template>

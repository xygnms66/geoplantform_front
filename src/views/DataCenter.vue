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
  <section class="section hero-card project-hero">
    <div class="eyebrow">Data Center</div>
    <h1>数据中心</h1>
    <p>统一管理遥感、多模态等领域的公开数据集与平台自建数据集，支持数据检索、来源筛选和模态分类，为模型训练、评测与应用提供可靠的数据支撑。</p>
  </section>
  <section class="section">
    <DataCenterClient
      :sources="sources"
      :filters="filters"
      :cards="cards"
    />
  </section>
</template>
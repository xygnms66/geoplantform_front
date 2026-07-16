<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import DataProductFormDialog from "@/components/studio/plugins/data/dialogs/DataProductFormDialog.vue";
import DatasetFormDialog from "@/components/studio/plugins/data/dialogs/DatasetFormDialog.vue";
import DataFilterAside from "@/components/studio/plugins/data/shared/DataFilterAside.vue";
import { dataPluginTabs } from "@/components/studio/plugins/data/tabs";
import { useStudioPluginTabs } from "@/components/studio/shell/useStudioPluginTabs";
import {
  FILTER_FALLBACK,
  fetchDataCatalogCards,
  getDataCenterFilters,
  getDataCenterSources,
} from "@/lib/dataCenterApi";
import { dataCatalogCards as dataCatalogFallback, dataSources as dataSourceFallback } from "@/lib/dataCenterStaticData";
import type {
  ActiveCatalogFilter,
  DataCatalogCard as DataCatalogCardType,
  DataCatalogFilter,
  DataFilterGroup,
  DataSourceCard,
  DataSourceKey,
  FilterOption,
} from "@/types";

const productFormDialogRef = ref<InstanceType<typeof DataProductFormDialog> | null>(null);
const datasetFormDialogRef = ref<InstanceType<typeof DatasetFormDialog> | null>(null);

function openProductModal() {
  productFormDialogRef.value?.openCreateDialog();
}

function openDatasetModal() {
  datasetFormDialogRef.value?.openCreateDialog();
}

async function handleProductSaved() {
  await loadCards();
}

async function handleDatasetSaved() {
  await loadCards();
}

const { tabs, activeTab, activeView, setActiveTab } = useStudioPluginTabs(dataPluginTabs, "assets");

const activeSource = ref<DataSourceKey | "all">("all");
const activeFilters = ref<ActiveCatalogFilter[]>([]);

const cards = ref<DataCatalogCardType[]>(dataCatalogFallback);
const sources = ref<DataSourceCard[]>(dataSourceFallback);
const filters = ref<DataFilterGroup[]>(FILTER_FALLBACK);

const showAssetFilters = computed(() => activeTab.value === "assets");

const activeViewProps = computed(() => {
  if (activeTab.value === "assets") {
    return { cards: cards.value };
  }
  return {};
});

function buildCatalogFilter(): DataCatalogFilter {
  const filter: DataCatalogFilter = {};

  if (activeSource.value !== "all") {
    filter.source = activeSource.value;
  }

  const scopes = activeFilters.value.filter((item) => item.groupKey === "scope").map((item) => item.item.name);
  const modalities = activeFilters.value
    .filter((item) => item.groupKey === "modality")
    .map((item) => item.item.name);
  const statuses = activeFilters.value
    .filter((item) => item.groupKey === "status")
    .map((item) => item.item.value);

  if (scopes.length > 0) filter.scopes = scopes;
  if (modalities.length > 0) filter.modalities = modalities;
  if (statuses.length > 0) filter.statuses = statuses;

  return filter;
}

async function loadCards() {
  cards.value = await fetchDataCatalogCards(buildCatalogFilter());
}

function toggleFilter(groupKey: string, item: FilterOption) {
  const idx = activeFilters.value.findIndex(
    (active) => active.groupKey === groupKey && active.item.name === item.name,
  );
  if (idx >= 0) activeFilters.value.splice(idx, 1);
  else activeFilters.value.push({ groupKey, item });
}

function clearFilters() {
  activeSource.value = "all";
  activeFilters.value = [];
}

onMounted(async () => {
  const [dataSources, filterGroups] = await Promise.all([
    getDataCenterSources(),
    getDataCenterFilters(),
  ]);
  sources.value = dataSources;
  filters.value = filterGroups;
  await loadCards();
});

watch([activeSource, activeFilters], loadCards, { deep: true });
</script>

<template>
  <main class="studio-page">
    <section class="page-title-row">
      <div>
        <div class="title-box">数据中心</div>
        <div class="page-subtitle">统一管理遥感数据资产、对象存储、入库审核和数据处理状态。</div>
      </div>
      <div class="action-row">
        <button class="primary-btn" type="button" @click="openProductModal">+ 新建数据产品</button>
        <button class="secondary-btn" type="button" @click="openDatasetModal">+ 新建数据集</button>
        <button class="secondary-btn" type="button">批量扫描</button>
      </div>
    </section>

    <section class="data-tabs panel">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="{ active: activeTab === tab.key }"
        type="button"
        @click="setActiveTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </section>

    <section :class="['data-layout', { 'no-aside': !showAssetFilters }]">
      <DataFilterAside
        v-if="showAssetFilters"
        :sources="sources"
        :filters="filters"
        :active-source="activeSource"
        :active-filters="activeFilters"
        @update:active-source="activeSource = $event"
        @toggle-filter="toggleFilter"
        @clear-filters="clearFilters"
      />

      <component :is="activeView" v-if="activeView" v-bind="activeViewProps" />
      <div v-else class="empty-view">当前 Tab 未配置页面组件</div>
    </section>

    <DataProductFormDialog ref="productFormDialogRef" @saved="handleProductSaved" />
    <DatasetFormDialog ref="datasetFormDialogRef" @saved="handleDatasetSaved" />
  </main>
</template>

<style scoped>
.studio-page {
  display: grid;
  gap: 20px;
}

.page-title-row {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-start;
}

.title-box {
  display: inline-flex;
  align-items: center;
  min-height: 58px;
  padding: 0 22px;
  border: 1px solid rgba(96, 165, 250, 0.34);
  border-radius: 18px;
  background: rgba(11, 22, 40, 0.72);
  color: #fff;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: 0.04em;
}

.page-subtitle {
  margin-top: 12px;
  color: var(--muted);
  line-height: 1.7;
}

.action-row {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.primary-btn,
.secondary-btn,
.data-tabs button {
  border: 0;
  cursor: pointer;
  transition: 0.18s ease;
}

.primary-btn {
  height: 42px;
  padding: 0 18px;
  border-radius: 12px;
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #0ea5e9, #2563eb);
  box-shadow: 0 14px 28px rgba(37, 99, 235, 0.28);
}

.secondary-btn {
  height: 42px;
  padding: 0 16px;
  border-radius: 12px;
  color: #d9edff;
  background: rgba(12, 28, 52, 0.72);
  border: 1px solid rgba(120, 165, 255, 0.2);
}

.panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.76));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.data-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  width: fit-content;
}

.data-tabs button {
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  color: var(--muted);
  background: transparent;
  font-weight: 850;
}

.data-tabs button.active {
  color: #fff;
  background: rgba(59, 130, 246, 0.72);
}

.data-layout {
  display: grid;
  grid-template-columns: 250px minmax(0, 1fr);
  gap: 20px;
}

.data-layout.no-aside {
  grid-template-columns: 1fr;
}

.empty-view {
  min-height: 240px;
  display: grid;
  place-items: center;
  color: var(--muted);
  border: 1px dashed rgba(148, 163, 184, 0.24);
  border-radius: 18px;
}

@media (max-width: 1280px) {
  .data-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .page-title-row {
    flex-direction: column;
  }

  .data-tabs {
    width: 100%;
    overflow-x: auto;
  }
}
</style>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { DataCatalogCard as DataCatalogCardType, DataFilterGroup, DataSourceCard, DataSourceKey } from "@/types";
import { useAuthStore } from "@/stores/auth";
import DataSourceRail from "./DataSourceRail.vue";
import DataCatalogCard from "./DataCatalogCard.vue";

const props = defineProps<{
  sources: DataSourceCard[];
  filters: DataFilterGroup[];
  cards: DataCatalogCardType[];
}>();

const auth = useAuthStore();
const activeSource = ref<DataSourceKey | "all">("all");
const activeFilters = ref<string[]>([]);

function cardMatchesFilter(card: DataCatalogCardType, filter: string) {
  return card.scope.includes(filter) || card.modality.includes(filter) || card.projects.includes(filter) || card.suitableModels.includes(filter) || card.domain === filter;
}

const visibleCards = computed(() => {
  return props.cards.filter((card) => {
    const sourceOk = activeSource.value === "all" || card.source === activeSource.value;
    const filterOk = activeFilters.value.length === 0 || activeFilters.value.every((item) => cardMatchesFilter(card, item));
    return sourceOk && filterOk;
  });
});

const activeSourceName = computed(() => activeSource.value === "all" ? "全部来源" : props.sources.find((item) => item.key === activeSource.value)?.name || "全部来源");

function toggleFilter(item: string) {
  const idx = activeFilters.value.indexOf(item);
  if (idx >= 0) activeFilters.value.splice(idx, 1);
  else activeFilters.value.push(item);
}

function clearFilters() {
  activeSource.value = "all";
  activeFilters.value = [];
}
</script>

<template>
  <div class="dc-shell">
    <div class="dc-hero-row">
      <DataSourceRail
        :sources="sources"
        :filters="filters"
        :activeSource="activeSource"
        :activeFilters="activeFilters"
        @update:activeSource="activeSource = $event"
        @update:activeFilters="activeFilters = $event"
        @toggle-filter="toggleFilter"
        @clear-filters="clearFilters"
      />
      <section class="dc-center-content">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h1 class="dc-page-title">数据总览</h1>
          <router-link v-if="auth.isAdmin()" to="/admin/datasets" class="button" style="background: #ef4444; color: white; padding: 0.5rem 1rem; border-radius: 0.375rem; text-decoration: none; display: flex; align-items: center; gap: 0.5rem;">
            <span>🔧</span><span>数据管理</span>
          </router-link>
        </div>
        <div class="dc-result-header">
          <p class="dc-count-line"><strong>{{ visibleCards.length }}</strong> 个数据集 · {{ activeSourceName }}</p>
          <button v-if="activeSource !== 'all' || activeFilters.length > 0" type="button" class="dc-clear-button" @click="clearFilters">清空筛选</button>
        </div>
        <div v-if="activeFilters.length > 0" class="dc-active-filter-row">
          <button v-for="item in activeFilters" :key="item" type="button" @click="toggleFilter(item)">{{ item }} ×</button>
        </div>
        <div v-if="visibleCards.length > 0" class="dc-dataset-grid">
          <DataCatalogCard v-for="item in visibleCards" :key="item.id" :item="item" />
        </div>
        <div v-else class="dc-empty-state">
          <strong>当前筛选条件下暂无数据集</strong>
          <p>可以切换左侧数据来源，或取消部分适用范围、模态、项目关联筛选。</p>
          <button type="button" @click="clearFilters">查看全部数据</button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.dc-shell { padding: 0 0 64px; }
.dc-hero-row { display: grid; grid-template-columns: 170px 1fr; gap: 24px; align-items: start; margin-top: 28px; }
.dc-center-content { min-width: 0; }
.dc-page-title { margin: 0 0 18px; font-size: 28px; font-weight: 700; color: var(--text); letter-spacing: -0.03em; }
.dc-result-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 14px; }
.dc-count-line { margin: 0; color: var(--muted); font-size: 14px; }
.dc-count-line strong { color: var(--brand); }
.dc-clear-button, .dc-active-filter-row button, .dc-empty-state button { border: 1px solid rgba(96, 165, 250, 0.25); background: rgba(96, 165, 250, 0.08); color: #93c5fd; border-radius: 999px; padding: 6px 12px; cursor: pointer; font: inherit; font-size: 13px; }
.dc-active-filter-row { display: flex; flex-wrap: wrap; gap: 8px; margin: -4px 0 14px; }
.dc-dataset-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.dc-empty-state { margin-top: 18px; padding: 34px; border: 1px dashed rgba(96, 165, 250, 0.2); background: rgba(96, 165, 250, 0.04); border-radius: 16px; text-align: center; color: var(--text); }
.dc-empty-state p { color: var(--muted); margin: 10px 0 18px; }
@media (max-width: 1100px) { .dc-hero-row { grid-template-columns: 1fr; } .dc-dataset-grid { grid-template-columns: 1fr; } }
</style>

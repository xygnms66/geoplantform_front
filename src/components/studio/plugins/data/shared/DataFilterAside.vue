<script setup lang="ts">
import type { ActiveCatalogFilter, DataFilterGroup, DataSourceCard, DataSourceKey, FilterOption } from "@/types";

defineProps<{
  sources: DataSourceCard[];
  filters: DataFilterGroup[];
  activeSource: DataSourceKey | "all";
  activeFilters: ActiveCatalogFilter[];
}>();

const emit = defineEmits<{
  "update:activeSource": [value: DataSourceKey | "all"];
  toggleFilter: [groupKey: string, item: FilterOption];
  clearFilters: [];
}>();

function isFilterActive(
  activeFilters: ActiveCatalogFilter[],
  groupKey: string,
  item: FilterOption,
) {
  return activeFilters.some((active) => active.groupKey === groupKey && active.item.name === item.name);
}
</script>

<template>
  <aside class="filter-panel panel">
    <div class="panel-inner">
      <h2 class="panel-title">数据筛选</h2>
      <div class="filter-group">
        <div class="filter-title">数据来源</div>
        <button
          type="button"
          :class="['filter-chip', { active: activeSource === 'all' }]"
          @click="emit('update:activeSource', 'all')"
        >
          全部数据
        </button>
        <button
          v-for="source in sources"
          :key="source.key"
          type="button"
          :class="['filter-chip', { active: activeSource === source.key }]"
          @click="emit('update:activeSource', source.key)"
        >
          {{ source.icon }} {{ source.name }}
        </button>
      </div>
      <div v-for="group in filters" :key="group.key" class="filter-group">
        <div class="filter-title">{{ group.title }}</div>
        <button
          v-for="item in group.items"
          :key="item.id"
          type="button"
          :class="['filter-chip', 'small', { active: isFilterActive(activeFilters, group.key, item) }]"
          @click="emit('toggleFilter', group.key, item)"
        >
          {{ item.name }}
        </button>
      </div>
      <button
        v-if="activeSource !== 'all' || activeFilters.length > 0"
        type="button"
        class="filter-clear-btn"
        @click="emit('clearFilters')"
      >
        清空筛选
      </button>
    </div>
  </aside>
</template>

<style scoped>
.panel {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.76));
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(14px);
}

.panel-inner {
  padding: 20px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.filter-panel {
  align-self: start;
  position: sticky;
  top: 78px;
}

.filter-group {
  margin-top: 24px;
}

.filter-title {
  margin-bottom: 10px;
  color: #c9d9eb;
  font-weight: 900;
}

.filter-chip {
  width: 100%;
  min-height: 46px;
  display: flex;
  align-items: center;
  padding: 0 14px;
  margin-bottom: 10px;
  border: 1px solid rgba(121, 167, 255, 0.15);
  border-radius: 14px;
  color: #d9edff;
  text-align: left;
  background: rgba(2, 8, 21, 0.28);
  cursor: pointer;
  transition: 0.18s ease;
  font: inherit;
}

.filter-chip.active {
  border-color: rgba(103, 232, 249, 0.42);
  color: #67e8f9;
  background: rgba(59, 130, 246, 0.2);
}

.filter-chip.small {
  width: auto;
  min-height: 34px;
  display: inline-flex;
  margin: 0 8px 8px 0;
  border-radius: 999px;
}

.filter-clear-btn {
  width: 100%;
  min-height: 38px;
  margin-top: 8px;
  border: 1px solid rgba(103, 232, 249, 0.28);
  border-radius: 12px;
  color: #67e8f9;
  background: rgba(59, 130, 246, 0.12);
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 1280px) {
  .filter-panel {
    position: static;
  }
}
</style>

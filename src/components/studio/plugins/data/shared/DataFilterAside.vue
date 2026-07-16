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
      <section class="rail-section">
        <h2>数据来源</h2>
        <div class="source-list">
          <button
            type="button"
            :class="['source-card', { 'source-active': activeSource === 'all' }]"
            @click="emit('update:activeSource', 'all')"
          >
            <span class="source-icon">📦</span>
            <span><strong>全部数据</strong><em>已有与候选数据</em></span>
          </button>
          <button
            v-for="source in sources"
            :key="source.key"
            type="button"
            :class="['source-card', { 'source-active': activeSource === source.key }]"
            @click="emit('update:activeSource', source.key)"
          >
            <span class="source-icon">{{ source.icon }}</span>
            <span><strong>{{ source.name }}</strong><em>{{ source.subtitle }}</em></span>
          </button>
        </div>
      </section>
      <section v-for="group in filters" :key="group.key" class="rail-section">
        <h2>{{ group.title }}</h2>
        <div class="filter-pills">
          <button
            v-for="item in group.items"
            :key="item.id"
            type="button"
            :class="['filter-pill', { 'pill-active': isFilterActive(activeFilters, group.key, item) }]"
            @click="emit('toggleFilter', group.key, item)"
          >
            {{ item.name }}
          </button>
        </div>
      </section>
      <button
        v-if="activeSource !== 'all' || activeFilters.length > 0"
        type="button"
        class="clear-btn"
        @click="emit('clearFilters')"
      >
        清除筛选
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
  display: grid;
  gap: 24px;
}

.filter-panel {
  align-self: start;
  position: sticky;
  top: 78px;
}

.rail-section h2 {
  position: relative;
  margin: 0 0 12px;
  padding-left: 16px;
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.rail-section h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 1px;
  width: 4px;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #38bdf8, #818cf8);
}

.source-list {
  display: grid;
  gap: 8px;
}

.source-card {
  display: grid;
  grid-template-columns: 30px 1fr;
  gap: 8px;
  align-items: center;
  min-height: 50px;
  padding: 8px 10px;
  border-radius: 14px;
  color: var(--text);
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  font: inherit;
  cursor: pointer;
  text-align: left;
  width: 100%;
  transition:
    border-color 0.18s,
    background 0.18s;
}

.source-card:hover,
.source-active {
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(96, 165, 250, 0.1);
}

.source-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  font-size: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.07);
}

.source-card strong {
  display: block;
  font-size: 12px;
  line-height: 1.2;
  color: var(--text);
}

.source-card em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  font-size: 11px;
  color: var(--muted);
}

.filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}

.filter-pill {
  border: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.04);
  color: var(--muted);
  font: inherit;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 10px;
  border-radius: 999px;
  transition:
    border-color 0.18s,
    color 0.18s,
    background 0.18s;
}

.filter-pill:hover,
.pill-active {
  color: #bfdbfe;
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(96, 165, 250, 0.1);
}

.clear-btn {
  color: var(--muted);
  background: transparent;
  border: 0;
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-align: left;
  transition: color 0.18s;
}

.clear-btn:hover {
  color: #bfdbfe;
}

@media (max-width: 1280px) {
  .filter-panel {
    position: static;
  }
}
</style>

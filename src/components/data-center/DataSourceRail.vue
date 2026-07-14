<script setup lang="ts">
import type { ActiveCatalogFilter, DataFilterGroup, DataSourceCard, DataSourceKey, FilterOption } from "@/types";

defineProps<{
  sources: DataSourceCard[];
  filters: DataFilterGroup[];
  activeSource: DataSourceKey | "all";
  activeFilters: ActiveCatalogFilter[];
}>();

const emit = defineEmits<{
  (e: "toggle-filter", groupKey: string, item: FilterOption): void;
  (e: "update:activeSource", source: DataSourceKey | "all"): void;
}>();

function onSourceChange(source: DataSourceKey | "all") {
  emit("update:activeSource", source);
}

function onFilterToggle(groupKey: string, item: FilterOption) {
  emit("toggle-filter", groupKey, item);
}

function isFilterActive(groupKey: string, item: FilterOption, activeFilters: ActiveCatalogFilter[]) {
  return activeFilters.some((active) => active.groupKey === groupKey && active.item.name === item.name);
}
</script>

<template>
  <aside class="dc-rail">
    <section class="dc-rail-section">
      <h2>数据来源</h2>
      <div class="dc-source-list">
        <button
          type="button"
          :class="['dc-source-card', { 'dc-source-active': activeSource === 'all' }]"
          @click="onSourceChange('all')"
        >
          <span class="dc-source-icon">📦</span>
          <span><strong>全部数据</strong><em>已有与候选数据</em></span>
        </button>
        <button
          v-for="source in sources"
          :key="source.key"
          type="button"
          :class="['dc-source-card', { 'dc-source-active': activeSource === source.key }]"
          @click="onSourceChange(source.key)"
        >
          <span class="dc-source-icon">{{ source.icon }}</span>
          <span
            ><strong>{{ source.name }}</strong
            ><em>{{ source.subtitle }}</em></span
          >
        </button>
      </div>
    </section>
    <section v-for="group in filters" :key="group.key" class="dc-rail-section">
      <h2>{{ group.title }}</h2>
      <div class="dc-filter-pills">
        <button
          v-for="item in group.items"
          :key="item.id"
          type="button"
          :class="['dc-filter-button', { 'dc-filter-button-active': isFilterActive(group.key, item, activeFilters) }]"
          @click="onFilterToggle(group.key, item)"
        >
          {{ item.name }}
        </button>
      </div>
    </section>
  </aside>
</template>

<style scoped>
.dc-rail {
  position: sticky;
  top: 92px;
  display: grid;
  gap: 24px;
}
.dc-rail-section h2 {
  position: relative;
  margin: 0 0 12px;
  padding-left: 16px;
  font-size: 12px;
  font-weight: 800;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
.dc-rail-section h2::before {
  content: "";
  position: absolute;
  left: 0;
  top: 1px;
  width: 4px;
  height: 14px;
  border-radius: 999px;
  background: linear-gradient(180deg, #38bdf8, #818cf8);
}
.dc-source-list {
  display: grid;
  gap: 8px;
}
.dc-source-card {
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
.dc-source-card:hover,
.dc-source-active {
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(96, 165, 250, 0.1);
}
.dc-source-icon {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  font-size: 16px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.07);
}
.dc-source-card strong {
  display: block;
  font-size: 12px;
  line-height: 1.2;
  color: var(--text);
}
.dc-source-card em {
  display: block;
  margin-top: 2px;
  font-style: normal;
  font-size: 11px;
  color: var(--muted);
}
.dc-filter-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.dc-filter-button {
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
.dc-filter-button:hover,
.dc-filter-button-active {
  color: #bfdbfe;
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(96, 165, 250, 0.1);
}
</style>

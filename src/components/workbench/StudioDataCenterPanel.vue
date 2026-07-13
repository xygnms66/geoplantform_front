<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import { ElTooltip } from "element-plus";
import DataProductFormDialog from "@/components/workbench/DataProductFormDialog.vue";
import DatasetFormDialog from "@/components/workbench/DatasetFormDialog.vue";
import { dataInbox, dataStats, dataStores, dataTabs } from "@/lib/workbenchStudioData";
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

const activeTab = ref("数据资产");
const activeSource = ref<DataSourceKey | "all">("all");
const activeFilters = ref<ActiveCatalogFilter[]>([]);

const cards = ref<DataCatalogCardType[]>(dataCatalogFallback);
const sources = ref<DataSourceCard[]>(dataSourceFallback);
const filters = ref<DataFilterGroup[]>(FILTER_FALLBACK);

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

function isFilterActive(groupKey: string, item: FilterOption) {
  return activeFilters.value.some((active) => active.groupKey === groupKey && active.item.name === item.name);
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

const statusText: Record<DataCatalogCardType["status"], string> = {
  candidate: "候选数据",
  planned: "计划接入",
  available: "已入库",
  processing: "处理中",
  imported: "已接入",
};

function statusClass(status: DataCatalogCardType["status"]) {
  if (status === "available" || status === "imported") return "status-success";
  if (status === "processing") return "status-running";
  if (status === "planned") return "status-warning";
  return "status-muted";
}

const copiedId = ref<number | null>(null);

async function handleCopyPath(item: DataCatalogCardType) {
  if (!item.storagePath) return;
  try {
    await navigator.clipboard.writeText(item.storagePath);
    copiedId.value = item.id;
    setTimeout(() => {
      copiedId.value = null;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

function handleDriveClick(item: DataCatalogCardType) {
  if (item.storagePath) {
    window.open(item.storagePath, "_blank");
  }
}
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
        <button class="secondary-btn">批量扫描</button>
      </div>
    </section>

    <section class="data-tabs panel">
      <button
        v-for="tab in dataTabs"
        :key="tab"
        :class="{ active: activeTab === tab }"
        type="button"
        @click="activeTab = tab"
      >
        {{ tab }}
      </button>
    </section>

    <section class="data-layout">
      <aside class="filter-panel panel">
        <div class="panel-inner">
          <h2 class="panel-title">数据筛选</h2>
          <div class="filter-group">
            <div class="filter-title">数据来源</div>
            <button
              type="button"
              :class="['filter-chip', { active: activeSource === 'all' }]"
              @click="activeSource = 'all'"
            >
              全部数据
            </button>
            <button
              v-for="source in sources"
              :key="source.key"
              type="button"
              :class="['filter-chip', { active: activeSource === source.key }]"
              @click="activeSource = source.key"
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
              :class="['filter-chip', 'small', { active: isFilterActive(group.key, item) }]"
              @click="toggleFilter(group.key, item)"
            >
              {{ item.name }}
            </button>
          </div>
          <button
            v-if="activeSource !== 'all' || activeFilters.length > 0"
            type="button"
            class="filter-clear-btn"
            @click="clearFilters"
          >
            清空筛选
          </button>
        </div>
      </aside>

      <section class="data-main">
        <section class="summary-grid">
          <article v-for="item in dataStats" :key="item.label" class="summary-card panel">
            <div class="summary-value">{{ item.value }}</div>
            <div class="summary-label">{{ item.label }}</div>
            <div class="summary-desc">{{ item.desc }}</div>
          </article>
        </section>

        <section class="panel asset-panel">
          <div class="panel-inner">
            <div class="panel-header">
              <div>
                <h2 class="panel-title">数据资产</h2>
                <p class="panel-desc">突出 Owner、标签、质量状态、存储路径和处理入口。</p>
              </div>
              <div class="asset-tools">
                <input class="asset-search" placeholder="搜索 Sentinel / Landsat / DEM / embedding" />
                <button class="secondary-btn compact">列表</button>
                <button class="secondary-btn compact">卡片</button>
              </div>
            </div>

            <div class="asset-grid">
              <article v-for="asset in cards" :key="asset.id" class="asset-card">
                <div class="asset-top">
                  <div class="asset-cube">🧊</div>
                  <div class="asset-title-block">
                    <div class="asset-title">{{ asset.title }}</div>
                    <div class="asset-subtitle">
                      {{ asset.sourceName }} / {{ asset.size ?? "未知" }} / {{ asset.samples ?? "未知" }}
                    </div>
                  </div>
                  <span class="status-pill" :class="statusClass(asset.status)">{{ statusText[asset.status] }}</span>
                </div>

                <el-tooltip
                  :content="asset.description"
                  placement="top"
                  :show-after="300"
                  :disabled="!asset.description"
                  popper-class="dc-desc-tooltip"
                >
                  <p class="asset-desc">{{ asset.description }}</p>
                </el-tooltip>

                <div class="meta-grid">
                  <div>
                    <span>空间范围</span><b>{{ asset.region ?? "未知" }}</b>
                  </div>
                  <div>
                    <span>时间范围</span>
                    <b v-if="asset.beginTime && asset.endTime">{{ asset.beginTime }} ~ {{ asset.endTime }}</b>
                    <b v-else-if="asset.beginTime">{{ asset.beginTime }} 起</b>
                    <b v-else-if="asset.endTime">至 {{ asset.endTime }}</b>
                    <b v-else>未知</b>
                  </div>
                  <div>
                    <span>分辨率</span><b>{{ asset.resolution ?? "未知" }}</b>
                  </div>
                  <div>
                    <span>许可</span><b>{{ asset.license ?? "未知" }}</b>
                  </div>
                </div>

                <div class="tag-line">
                  <span class="tag">{{ asset.domain }}</span>
                  <span v-if="asset.format" class="tag">{{ asset.format }}</span>
                  <span v-for="tag in asset.modality" :key="tag" class="tag">{{ tag }}</span>
                </div>

                <div v-if="asset.storagePath" class="storage-path">{{ asset.storagePath }}</div>

                <div class="asset-actions">
                  <button class="small-btn">详情</button>
                  <button
                    v-if="asset.storageStatus === 'local' && asset.storagePath"
                    class="small-btn"
                    type="button"
                    @click="handleCopyPath(asset)"
                  >
                    {{ copiedId === asset.id ? "✓ 已复制" : "📋 复制路径" }}
                  </button>
                  <button
                    v-else-if="asset.storageStatus === 'drive' && asset.storagePath"
                    class="small-btn"
                    type="button"
                    @click="handleDriveClick(asset)"
                  >
                    🌐 打开网页
                  </button>
                  <a
                    v-else-if="asset.url"
                    class="small-btn"
                    :href="asset.url"
                    target="_blank"
                    rel="noreferrer"
                  >
                    查看链接
                  </a>
                  <button class="small-btn">触发处理</button>
                  <button class="ghost-mini">血缘</button>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section class="bottom-grid">
          <section class="panel">
            <div class="panel-inner">
              <div class="panel-header">
                <div>
                  <h2 class="panel-title">对象存储</h2>
                  <p class="panel-desc">S3 / MinIO / NAS 接入资源，可继续扩展 Bucket 浏览。</p>
                </div>
                <button class="text-btn">全部存储</button>
              </div>
              <div class="storage-table">
                <div class="storage-row table-head">
                  <span>名称</span><span>类型</span><span>容量</span><span>状态</span><span>Endpoint</span
                  ><span>操作</span>
                </div>
                <div v-for="store in dataStores" :key="store.name" class="storage-row">
                  <span class="store-name">{{ store.name }}</span>
                  <span>{{ store.type }}</span>
                  <span>{{ store.capacity }}</span>
                  <span><i class="status-pill status-success">运行中</i></span>
                  <span class="endpoint">{{ store.endpoint }}</span>
                  <span><button class="small-btn">Bucket</button></span>
                </div>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-inner">
              <div class="panel-header compact">
                <div>
                  <h2 class="panel-title">待入库审核</h2>
                  <p class="panel-desc">论文、数据源和外部文件的入库队列。</p>
                </div>
              </div>
              <div class="inbox-list">
                <article v-for="item in dataInbox" :key="item.name" class="inbox-card">
                  <div>
                    <div class="inbox-title">{{ item.name }}</div>
                    <div class="inbox-meta">{{ item.source }} / 提交：{{ item.submitter }}</div>
                  </div>
                  <div class="inbox-actions">
                    <button class="small-btn">入库</button>
                    <button class="reject-btn">驳回</button>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </section>
      </section>
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
.small-btn,
.ghost-mini,
.reject-btn,
.filter-chip,
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

.secondary-btn.compact {
  height: 38px;
}

.small-btn,
.ghost-mini,
.reject-btn {
  height: 30px;
  padding: 0 10px;
  border-radius: 9px;
  color: #dff5ff;
  background: rgba(56, 189, 248, 0.14);
}

a.small-btn {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}

.ghost-mini {
  color: #cfe8ff;
  background: rgba(121, 167, 255, 0.14);
}

.reject-btn {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.14);
}

.text-btn {
  padding: 0;
  color: #67e8f9;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: 800;
}

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

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-header.compact {
  margin-bottom: 14px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.panel-desc,
.summary-desc,
.asset-subtitle,
.asset-desc,
.inbox-meta {
  color: var(--muted);
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

.data-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.summary-card {
  padding: 18px;
}

.summary-value {
  color: #67e8f9;
  font-size: 32px;
  font-weight: 950;
}

.summary-label {
  margin-top: 4px;
  font-weight: 900;
}

.summary-desc {
  margin-top: 4px;
  font-size: 12px;
}

.asset-tools {
  display: flex;
  gap: 10px;
  align-items: center;
  flex-wrap: wrap;
}

.asset-search {
  width: 320px;
  height: 38px;
  padding: 0 13px;
  border: 1px solid rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  color: var(--text);
  outline: 0;
  background: rgba(2, 8, 21, 0.34);
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.asset-card {
  padding: 18px;
  border: 1px solid rgba(121, 167, 255, 0.13);
  border-radius: 20px;
  background: rgba(2, 8, 21, 0.32);
}

.asset-top {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
}

.asset-cube {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: rgba(56, 189, 248, 0.16);
}

.asset-title {
  color: #fff;
  font-size: 18px;
  font-weight: 950;
}

.asset-subtitle {
  margin-top: 5px;
  font-size: 12px;
}

.asset-desc {
  min-height: 68px;
  margin: 16px 0;
  line-height: 1.7;
  font-size: 14px;
  cursor: default;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.meta-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
  padding: 12px;
  border-radius: 14px;
  background: rgba(15, 32, 56, 0.48);
}

.meta-grid span {
  display: block;
  margin-bottom: 4px;
  color: #94a8bf;
  font-size: 12px;
}

.meta-grid b {
  color: #dff5ff;
  font-size: 13px;
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.tag,
.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  white-space: nowrap;
}

.tag {
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  color: #c7e9ff;
  background: rgba(30, 64, 175, 0.2);
  font-size: 12px;
}

.status-pill {
  min-height: 26px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 800;
}

.status-success {
  color: #86efac;
  background: rgba(34, 197, 94, 0.16);
}

.status-running {
  color: #93c5fd;
  background: rgba(59, 130, 246, 0.16);
}

.status-warning {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.16);
}

.status-muted {
  color: #cbd5e1;
  background: rgba(100, 116, 139, 0.18);
}

.storage-path {
  margin-top: 14px;
  padding: 10px 12px;
  border: 1px dashed rgba(121, 167, 255, 0.18);
  border-radius: 12px;
  color: #95a9c0;
  font-family: Consolas, "SFMono-Regular", monospace;
  font-size: 12px;
  background: rgba(2, 8, 21, 0.35);
}

.asset-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.bottom-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(350px, 0.8fr);
  gap: 20px;
}

.storage-table {
  overflow: hidden;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
}

.storage-row {
  min-height: 54px;
  display: grid;
  grid-template-columns: 1fr 0.7fr 0.85fr 0.8fr 1.4fr 0.65fr;
  gap: 12px;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid rgba(121, 167, 255, 0.1);
  color: #c9d9eb;
  font-size: 13px;
}

.storage-row:last-child {
  border-bottom: 0;
}

.table-head {
  color: var(--muted);
  background: rgba(2, 8, 21, 0.44);
  font-weight: 900;
}

.store-name {
  color: #fff;
  font-weight: 900;
}

.endpoint {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.inbox-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.inbox-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 13px;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
  background: rgba(2, 8, 21, 0.32);
}

.inbox-title {
  color: #fff;
  font-weight: 900;
}

.inbox-meta {
  margin-top: 5px;
  font-size: 12px;
}

.inbox-actions {
  display: flex;
  gap: 8px;
}

@media (max-width: 1280px) {
  .data-layout {
    grid-template-columns: 1fr;
  }

  .filter-panel {
    position: static;
  }

  .summary-grid,
  .asset-grid,
  .bottom-grid {
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

  .asset-search {
    width: 100%;
  }

  .meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .inbox-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

<style>
.dc-desc-tooltip {
  max-width: 320px;
  line-height: 1.6;
}
</style>

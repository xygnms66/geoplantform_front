<script setup lang="ts">
import { ref } from "vue";
import { ElTooltip } from "element-plus";
import { dataStats } from "@/lib/workbenchStudioData";
import type { DataCatalogCard as DataCatalogCardType } from "@/types";

defineProps<{
  cards: DataCatalogCardType[];
}>();

const LOCAL_STORAGE_LABELS = new Set(["本地存储", "数据缺失"]);
const DRIVE_STORAGE_LABELS = new Set(["外部链接", "下载中"]);

function statusClass(status: string) {
  if (status === "可用") return "status-success";
  if (status === "处理中" || status === "等待验收") return "status-running";
  if (status === "已归档") return "status-muted";
  return "status-muted";
}

function isLocalStorage(status?: string | null) {
  return !!status && LOCAL_STORAGE_LABELS.has(status);
}

function isDriveStorage(status?: string | null) {
  return !!status && DRIVE_STORAGE_LABELS.has(status);
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
            <button class="secondary-btn compact" type="button">列表</button>
            <button class="secondary-btn compact" type="button">卡片</button>
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
              <span class="status-pill" :class="statusClass(asset.status)">{{ asset.status }}</span>
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
              <button class="small-btn" type="button">详情</button>
              <button
                v-if="isLocalStorage(asset.storageStatus) && asset.storagePath"
                class="small-btn"
                type="button"
                @click="handleCopyPath(asset)"
              >
                {{ copiedId === asset.id ? "✓ 已复制" : "📋 复制路径" }}
              </button>
              <button
                v-else-if="isDriveStorage(asset.storageStatus) && asset.storagePath"
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
              <button class="small-btn" type="button">触发处理</button>
              <button class="ghost-mini" type="button">血缘</button>
            </div>
          </article>
        </div>
      </div>
    </section>
  </section>
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

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.panel-desc,
.summary-desc,
.asset-subtitle,
.asset-desc {
  color: var(--muted);
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

.secondary-btn,
.small-btn,
.ghost-mini {
  border: 0;
  cursor: pointer;
  transition: 0.18s ease;
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
.ghost-mini {
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
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.asset-card {
  min-width: 0;
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
  min-width: 0;
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
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

@media (max-width: 1500px) {
  .asset-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 1280px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }

  .asset-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 760px) {
  .asset-grid {
    grid-template-columns: 1fr;
  }

  .asset-search {
    width: 100%;
  }

  .meta-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

<style>
.dc-desc-tooltip {
  max-width: 320px;
  line-height: 1.6;
}
</style>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { ElTooltip } from "element-plus";
import type { DataCatalogCard as DataCatalogCardType } from "@/types";

const props = defineProps<{ item: DataCatalogCardType }>();
const copySuccess = ref(false);
const descRef = ref<HTMLElement | null>(null);
const isTruncated = ref(false);
let resizeObserver: ResizeObserver | null = null;

const statusText: Record<DataCatalogCardType["status"], string> = {
  candidate: "候选数据",
  planned: "计划接入",
  available: "已入库",
  processing: "处理中",
  imported: "已接入",
};

function updateTruncation() {
  const el = descRef.value;
  if (!el) {
    isTruncated.value = false;
    return;
  }
  isTruncated.value = el.scrollHeight > el.clientHeight + 1;
}

onMounted(() => {
  nextTick(() => {
    updateTruncation();
    const el = descRef.value;
    if (!el) return;
    resizeObserver = new ResizeObserver(() => updateTruncation());
    resizeObserver.observe(el);
  });
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

watch(
  () => props.item.description,
  () => nextTick(updateTruncation),
);

async function handleCopyPath() {
  if (!props.item.storagePath) return;
  try {
    await navigator.clipboard.writeText(props.item.storagePath);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
  }
}

function handleDriveClick() {
  if (props.item.storagePath) {
    window.open(props.item.storagePath, "_blank");
  }
}
</script>

<template>
  <article class="dc-card">
    <div class="dc-card-header">
      <div>
        <h3>{{ item.title }}</h3>
      </div>
      <span class="dc-star">☆ {{ item.stars ?? 0 }}</span>
    </div>
    <div class="dc-card-body">
      <div class="dc-dataset-icon">🧊</div>
      <div class="dc-dataset-info">
        <div class="dc-meta-line">
          <span>▣ {{ item.size ?? "未知" }}</span>
          <span>▤ {{ item.samples ?? "未知" }}</span>
          <span v-if="item.resolution">🔍 {{ item.resolution }}</span>
        </div>
        <div class="dc-tag-row">
          <span v-if="item.license">{{ item.license }}</span>
          <span>{{ item.domain }}</span>
          <span v-if="item.format">{{ item.format }}</span>
        </div>
        <div v-if="item.region || item.beginTime || item.endTime" class="dc-spatial-temporal-info">
          <span v-if="item.region">📍 {{ item.region }}</span>
          <span v-if="item.beginTime && item.endTime">📅 {{ item.beginTime }} ~ {{ item.endTime }}</span>
          <span v-else-if="item.beginTime">📅 起始: {{ item.beginTime }}</span>
          <span v-else-if="item.endTime">📅 截止: {{ item.endTime }}</span>
        </div>
        <el-tooltip
          :content="item.description"
          placement="top"
          :show-after="300"
          :disabled="!isTruncated || !item.description"
          popper-class="dc-desc-tooltip"
        >
          <p ref="descRef" class="dc-description">{{ item.description }}</p>
        </el-tooltip>
      </div>
    </div>
    <div class="dc-card-footer">
      <div class="dc-source-name"><span class="dc-dot" />{{ item.sourceName }}</div>
      <div class="dc-status-group">
        <span :class="['dc-status', `dc-status-${item.status}`]">{{ statusText[item.status] }}</span>
        <template v-if="item.storageStatus">
          <button
            v-if="item.storageStatus === 'local' && item.storagePath"
            type="button"
            class="dc-action-button"
            @click="handleCopyPath"
            title="复制存储路径"
          >
            {{ copySuccess ? "✓ 已复制" : "📋 复制路径" }}
          </button>
          <button
            v-else-if="item.storageStatus === 'drive' && item.storagePath"
            type="button"
            class="dc-action-button"
            @click="handleDriveClick"
            title="打开网页"
          >
            🌐 打开网页
          </button>
        </template>
        <a v-if="item.url && !item.storageStatus" :href="item.url" target="_blank" rel="noreferrer">查看链接</a>
      </div>
    </div>
  </article>
</template>

<style scoped>
.dc-card {
  padding: 14px;
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.92), rgba(15, 23, 42, 0.74));
  border: 1px solid var(--line);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.22);
  transition:
    border-color 0.18s,
    transform 0.18s;
}
.dc-card:hover {
  transform: translateY(-2px);
  border-color: rgba(96, 165, 250, 0.35);
}
.dc-card-header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}
.dc-card-header h3 {
  margin: 0;
  font-size: 13px;
  line-height: 1.35;
  color: var(--text);
}
.dc-star {
  flex-shrink: 0;
  font-size: 13px;
  color: var(--muted);
}
.dc-card-body {
  display: grid;
  grid-template-columns: 42px 1fr;
  gap: 10px;
  margin-top: 10px;
}
.dc-dataset-icon {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(56, 189, 248, 0.18), rgba(129, 140, 248, 0.18));
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 22px;
}
.dc-dataset-info {
  min-width: 0;
}
.dc-meta-line {
  display: flex;
  gap: 10px;
  color: var(--subtle);
  font-size: 11px;
}
.dc-tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 7px;
}
.dc-tag-row span {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(96, 165, 250, 0.1);
  color: #bfdbfe;
  border: 1px solid rgba(96, 165, 250, 0.18);
  font-size: 11px;
}
.dc-spatial-temporal-info {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
  color: var(--subtle);
  font-size: 12px;
}
.dc-description {
  margin: 7px 0 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  cursor: default;
}
.dc-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--line);
  font-size: 12px;
}
.dc-source-name {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
}
.dc-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: var(--green);
}
.dc-status-group {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.dc-status-group a {
  color: var(--brand);
  text-decoration: none;
}
.dc-status {
  display: inline-flex;
  align-items: center;
  padding: 2px 9px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
}
.dc-status-available,
.dc-status-imported {
  color: #bbf7d0;
  background: rgba(52, 211, 153, 0.14);
  border: 1px solid rgba(52, 211, 153, 0.24);
}
.dc-status-processing,
.dc-status-planned {
  color: #fde68a;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.22);
}
.dc-status-candidate {
  color: var(--muted);
  background: rgba(148, 163, 184, 0.1);
  border: 1px solid var(--line);
}
.dc-action-button {
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(96, 165, 250, 0.3);
  background: rgba(96, 165, 250, 0.1);
  color: #93c5fd;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
}
.dc-action-button:hover {
  background: rgba(96, 165, 250, 0.18);
  border-color: rgba(96, 165, 250, 0.5);
}
</style>

<style>
.dc-desc-tooltip {
  max-width: 320px;
  line-height: 1.6;
}
</style>

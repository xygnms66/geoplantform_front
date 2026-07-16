<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

import { getStorageBuckets } from "@/lib/dataCenterApi";
import type { StorageBucket } from "@/types";

const buckets = ref<StorageBucket[]>([]);
const loading = ref(false);
const loadError = ref("");

const hasDbBuckets = computed(() => buckets.value.some((item) => item.id > 0));

async function loadBuckets() {
  loading.value = true;
  loadError.value = "";
  try {
    buckets.value = await getStorageBuckets();
  } catch (error) {
    loadError.value = error instanceof Error ? error.message : "加载 Bucket 列表失败";
    buckets.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadBuckets();
});
</script>

<template>
  <section class="panel">
    <div class="panel-inner">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">对象存储</h2>
          <p class="panel-desc">按 Bucket / 存储卷展示挂载与接入信息。</p>
        </div>
        <div class="header-actions">
          <button class="text-btn" type="button" :disabled="loading" @click="loadBuckets">
            {{ loading ? "刷新中…" : "刷新" }}
          </button>
          <button class="text-btn" type="button" @click="loadBuckets">全部 Bucket</button>
        </div>
      </div>

      <p v-if="loadError" class="hint error">{{ loadError }}</p>
      <p v-else-if="!loading && !hasDbBuckets" class="hint">
        当前展示为本地兜底数据；连接后端并完成 seed 后可查看数据库中的 Bucket。
      </p>

      <div class="storage-table">
        <div class="storage-row table-head">
          <span>Bucket</span>
          <span>类型</span>
          <span>挂载协议</span>
          <span>挂载路径</span>
          <span>状态</span>
          <span>Endpoint</span>
        </div>
        <div v-if="loading && buckets.length === 0" class="storage-row empty-row">加载中…</div>
        <div v-else-if="!loading && buckets.length === 0" class="storage-row empty-row">暂无 Bucket</div>
        <div v-for="bucket in buckets" :key="bucket.id" class="storage-row">
          <span class="store-name">
            {{ bucket.bucket_name }}
            <i v-if="bucket.is_default" class="default-tag">默认</i>
          </span>
          <span>{{ bucket.type_label || bucket.backend_type || "-" }}</span>
          <span>{{ bucket.mount_protocol || "-" }}</span>
          <span class="endpoint" :title="bucket.mount_path || ''">{{ bucket.mount_path || "-" }}</span>
          <span>
            <i class="status-pill" :class="bucket.is_active ? 'status-success' : 'status-muted'">
              {{ bucket.status }}
            </i>
          </span>
          <span class="endpoint" :title="bucket.endpoint_url || ''">{{ bucket.endpoint_url || "-" }}</span>
        </div>
      </div>
    </div>
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

.panel-desc {
  color: var(--muted);
}

.header-actions {
  display: flex;
  gap: 16px;
  align-items: center;
}

.text-btn {
  padding: 0;
  color: #67e8f9;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: 800;
}

.text-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hint {
  margin: 0 0 12px;
  color: #93c5fd;
  font-size: 13px;
}

.hint.error {
  color: #fca5a5;
}

.storage-table {
  overflow: hidden;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
}

.storage-row {
  min-height: 54px;
  display: grid;
  grid-template-columns: 1.15fr 0.65fr 0.75fr 1.45fr 0.75fr 1.25fr;
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

.empty-row {
  color: var(--muted);
}

.table-head {
  color: var(--muted);
  background: rgba(2, 8, 21, 0.44);
  font-weight: 900;
}

.store-name {
  color: #fff;
  font-weight: 900;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.default-tag {
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  font-size: 11px;
  font-style: normal;
  font-weight: 800;
  color: #fde68a;
  background: rgba(245, 158, 11, 0.18);
}

.endpoint {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  font-style: normal;
}

.status-success {
  color: #86efac;
  background: rgba(34, 197, 94, 0.16);
}

.status-muted {
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.16);
}

@media (max-width: 1100px) {
  .storage-row {
    grid-template-columns: 1fr;
    padding: 12px 14px;
    gap: 6px;
  }
}
</style>

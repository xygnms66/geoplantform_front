<script setup lang="ts">
import { dataStores } from "@/lib/workbenchStudioData";
</script>

<template>
  <section class="panel">
    <div class="panel-inner">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">对象存储</h2>
          <p class="panel-desc">S3 / MinIO / NAS 接入资源，可继续扩展 Bucket 浏览。</p>
        </div>
        <button class="text-btn" type="button">全部存储</button>
      </div>
      <div class="storage-table">
        <div class="storage-row table-head">
          <span>名称</span><span>类型</span><span>容量</span><span>状态</span><span>Endpoint</span><span>操作</span>
        </div>
        <div v-for="store in dataStores" :key="store.name" class="storage-row">
          <span class="store-name">{{ store.name }}</span>
          <span>{{ store.type }}</span>
          <span>{{ store.capacity }}</span>
          <span><i class="status-pill status-success">运行中</i></span>
          <span class="endpoint">{{ store.endpoint }}</span>
          <span><button class="small-btn" type="button">Bucket</button></span>
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

.text-btn {
  padding: 0;
  color: #67e8f9;
  background: transparent;
  border: 0;
  cursor: pointer;
  font-weight: 800;
}

.small-btn {
  height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  color: #dff5ff;
  background: rgba(56, 189, 248, 0.14);
  cursor: pointer;
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

@media (max-width: 960px) {
  .storage-row {
    grid-template-columns: 1fr;
    padding: 12px 14px;
    gap: 6px;
  }
}
</style>

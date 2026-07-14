<script setup lang="ts">
import { dataInbox } from "@/lib/workbenchStudioData";
</script>

<template>
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
            <button class="small-btn" type="button">入库</button>
            <button class="reject-btn" type="button">驳回</button>
          </div>
        </article>
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

.panel-header.compact {
  margin-bottom: 14px;
}

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.panel-desc,
.inbox-meta {
  color: var(--muted);
}

.small-btn,
.reject-btn {
  height: 30px;
  padding: 0 10px;
  border: 0;
  border-radius: 9px;
  cursor: pointer;
}

.small-btn {
  color: #dff5ff;
  background: rgba(56, 189, 248, 0.14);
}

.reject-btn {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.14);
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

@media (max-width: 760px) {
  .inbox-card {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>

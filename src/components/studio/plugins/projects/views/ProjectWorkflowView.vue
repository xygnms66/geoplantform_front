<script setup lang="ts">
import { workflowColumns } from "@/lib/workbenchStudioData";

function workflowCategoryText(category: string) {
  const map: Record<string, string> = {
    model: "模型",
    data: "数据",
    eval: "评测",
    ops: "协同",
  };
  return map[category] ?? category;
}

function workflowPriorityText(priority: string) {
  const map: Record<string, string> = {
    high: "高优先级",
    medium: "中优先级",
    low: "低优先级",
  };
  return map[priority] ?? priority;
}

function workflowPriorityClass(priority: string) {
  const map: Record<string, string> = {
    high: "pill-red",
    medium: "pill-amber",
    low: "pill-blue",
  };
  return map[priority] ?? "pill-blue";
}

function workflowAccentClass(accent: string) {
  const map: Record<string, string> = {
    slate: "wf-slate",
    blue: "wf-blue",
    amber: "wf-amber",
    green: "wf-green",
  };
  return map[accent] ?? "wf-slate";
}
</script>

<template>
  <section class="panel workflow-panel">
    <div class="panel-inner">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">工作流</h2>
          <p class="panel-desc">这里承接原来工作台首页的待规划、待执行、进行中、已完成四列状态看板。</p>
        </div>
      </div>

      <div class="workflow-board">
        <section
          v-for="column in workflowColumns"
          :key="column.id"
          :class="['workflow-column', workflowAccentClass(column.accent)]"
        >
          <div class="workflow-column-head">
            <div>
              <div class="workflow-column-title">{{ column.title }}</div>
              <div class="workflow-column-hint">{{ column.hint }}</div>
            </div>
            <span class="pill pill-muted">{{ column.items.length }}</span>
          </div>

          <div class="workflow-cards">
            <article v-for="item in column.items" :key="item.id" class="workflow-card">
              <div class="workflow-card-top">
                <span class="pill pill-blue">{{ workflowCategoryText(item.category) }}</span>
                <span class="pill" :class="workflowPriorityClass(item.priority)">{{
                  workflowPriorityText(item.priority)
                }}</span>
              </div>
              <div class="workflow-project">{{ item.project }}</div>
              <h3 class="workflow-card-title">{{ item.title }}</h3>
              <p class="workflow-summary">{{ item.summary }}</p>
              <div class="tag-line workflow-tags">
                <span v-for="tag in item.tags" :key="tag" class="pill pill-muted">{{ tag }}</span>
              </div>
              <div class="workflow-footer">
                <span>负责人：{{ item.owner }}</span>
                <span>节点 {{ item.due }}</span>
              </div>
            </article>
          </div>
        </section>
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

.panel-desc,
.workflow-column-hint,
.workflow-summary,
.workflow-footer {
  color: var(--muted);
  line-height: 1.6;
}

.workflow-column-head,
.workflow-card-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.workflow-column-title {
  color: #fff;
  font-weight: 950;
  font-size: 18px;
}

.workflow-column-hint {
  margin-top: 4px;
  font-size: 12px;
}

.workflow-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.workflow-column {
  min-height: 100%;
  padding: 16px;
  border-radius: 24px;
  background: linear-gradient(180deg, rgba(8, 15, 30, 0.72), rgba(15, 23, 42, 0.55));
  border: 1px solid rgba(148, 163, 184, 0.18);
}

.wf-slate {
  box-shadow: inset 0 3px 0 rgba(148, 163, 184, 0.42);
}

.wf-blue {
  box-shadow: inset 0 3px 0 rgba(59, 130, 246, 0.52);
}

.wf-amber {
  box-shadow: inset 0 3px 0 rgba(251, 191, 36, 0.52);
}

.wf-green {
  box-shadow: inset 0 3px 0 rgba(52, 211, 153, 0.52);
}

.workflow-cards {
  display: grid;
  gap: 12px;
}

.workflow-card {
  padding: 14px;
  border-radius: 20px;
  border: 1px solid rgba(148, 163, 184, 0.14);
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.07), rgba(255, 255, 255, 0.03));
}

.workflow-project {
  margin-top: 12px;
  color: #7dd3fc;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.workflow-card-title {
  margin: 12px 0 8px;
  color: #fff;
  font-size: 15px;
  line-height: 1.45;
}

.workflow-summary {
  margin: 10px 0 0;
  font-size: 13px;
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.workflow-tags {
  margin-top: 12px;
}

.workflow-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
  font-size: 12px;
}

.pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  white-space: nowrap;
  min-height: 28px;
  padding: 0 10px;
  font-size: 12px;
  font-weight: 700;
}

.pill-blue {
  color: #67e8f9;
  background: rgba(34, 211, 238, 0.1);
  border: 1px solid rgba(34, 211, 238, 0.22);
}

.pill-amber {
  color: #fde68a;
  background: rgba(251, 191, 36, 0.12);
  border: 1px solid rgba(251, 191, 36, 0.22);
}

.pill-red {
  color: #fca5a5;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.25);
}

.pill-muted {
  color: #cbd5e1;
  background: rgba(148, 163, 184, 0.12);
  border: 1px solid rgba(148, 163, 184, 0.2);
}

@media (max-width: 1280px) {
  .workflow-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .workflow-board {
    grid-template-columns: 1fr;
  }
}
</style>

<script setup lang="ts">
import { projectBoardColumns, projectCycles } from "@/lib/workbenchStudioData";

function statusClass(status: string) {
  const map: Record<string, string> = {
    进行中: "status-running",
    待开始: "status-muted",
    待审核: "status-warning",
    已完成: "status-success",
  };
  return map[status] ?? "status-muted";
}
</script>

<template>
  <section class="cycle-row">
    <article v-for="cycle in projectCycles" :key="cycle.name" class="cycle-card panel">
      <div class="cycle-top">
        <div>
          <div class="cycle-name">{{ cycle.name }}</div>
          <div class="cycle-time">{{ cycle.time }}</div>
        </div>
        <span class="status-pill" :class="statusClass(cycle.status)">{{ cycle.status }}</span>
      </div>
      <div class="cycle-progress">
        <div class="progress-track">
          <div class="progress-fill" :style="{ width: `${cycle.progress}%` }"></div>
        </div>
        <b>{{ cycle.progress }}%</b>
      </div>
      <div class="cycle-meta">{{ cycle.done }}/{{ cycle.total }} tasks / {{ cycle.focus }}</div>
    </article>
  </section>

  <section class="panel board-panel">
    <div class="panel-inner">
      <div class="panel-header">
        <div>
          <h2 class="panel-title">任务看板</h2>
          <p class="panel-desc">Work Item 以状态列、优先级、负责人、标签和交付节点组织。</p>
        </div>
        <div class="board-tools">
          <button class="secondary-btn compact" type="button">按状态</button>
          <button class="secondary-btn compact" type="button">按负责人</button>
          <button class="primary-btn compact" type="button">+ Work Item</button>
        </div>
      </div>

      <div class="kanban-board">
        <section v-for="column in projectBoardColumns" :key="column.name" class="kanban-column">
          <div class="column-header">
            <span>{{ column.name }}</span>
            <b>{{ column.items.length }}</b>
          </div>
          <article v-for="item in column.items" :key="item.id" class="work-card">
            <div class="work-top">
              <span class="work-id">{{ item.id }}</span>
              <span class="priority" :class="item.priorityClass">{{ item.priority }}</span>
            </div>
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
            <div class="tag-line compact-tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
            <div class="work-footer">
              <div class="assignees">
                <span v-for="avatar in item.assignees" :key="avatar">{{ avatar }}</span>
              </div>
              <div class="due-date">{{ item.due }}</div>
            </div>
          </article>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped>
.primary-btn,
.secondary-btn {
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

.primary-btn.compact,
.secondary-btn.compact {
  height: 38px;
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

.panel-title {
  margin: 0;
  font-size: 20px;
  font-weight: 900;
}

.panel-desc,
.cycle-time,
.cycle-meta {
  color: var(--muted);
  line-height: 1.6;
}

.cycle-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.cycle-card {
  padding: 16px;
}

.cycle-top,
.column-header,
.work-top {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.cycle-name,
.column-header {
  color: #fff;
  font-weight: 950;
}

.cycle-progress {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 10px;
  align-items: center;
  margin-top: 18px;
  color: #67e8f9;
}

.progress-track {
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(121, 167, 255, 0.15);
}

.progress-fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #67e8f9, #3b82f6);
}

.status-pill,
.priority,
.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  white-space: nowrap;
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

.board-tools {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.kanban-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(250px, 1fr));
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.kanban-column {
  min-width: 250px;
  padding: 12px;
  border: 1px solid rgba(121, 167, 255, 0.1);
  border-radius: 18px;
  background: rgba(2, 8, 21, 0.24);
}

.column-header b {
  width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #67e8f9;
  background: rgba(56, 189, 248, 0.12);
  font-size: 12px;
}

.work-card {
  padding: 14px;
  margin-bottom: 12px;
  border: 1px solid rgba(121, 167, 255, 0.12);
  border-radius: 16px;
  background: rgba(10, 24, 44, 0.76);
}

.work-id {
  color: var(--muted);
  font-size: 12px;
  font-weight: 900;
}

.priority {
  min-height: 24px;
  padding: 0 8px;
  font-size: 12px;
  font-weight: 950;
}

.priority-high {
  color: #fecaca;
  background: rgba(239, 68, 68, 0.18);
}

.priority-mid {
  color: #fde68a;
  background: rgba(245, 158, 11, 0.18);
}

.priority-low {
  color: #bfdbfe;
  background: rgba(59, 130, 246, 0.18);
}

.work-card h3 {
  margin: 12px 0 8px;
  color: #fff;
  font-size: 15px;
  line-height: 1.45;
}

.work-card p {
  margin: 0;
  color: var(--muted);
  font-size: 12px;
  line-height: 1.6;
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.compact-tags {
  margin-top: 12px;
}

.tag {
  min-height: 26px;
  padding: 0 10px;
  border: 1px solid rgba(125, 211, 252, 0.18);
  color: #c7e9ff;
  background: rgba(30, 64, 175, 0.2);
  font-size: 12px;
}

.work-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 14px;
}

.assignees {
  display: flex;
}

.assignees span {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  margin-right: -6px;
  border: 2px solid #0b1728;
  border-radius: 50%;
  color: #fff;
  background: linear-gradient(135deg, #38bdf8, #2563eb);
  font-size: 12px;
  font-weight: 900;
}

.due-date {
  color: var(--muted);
  font-size: 12px;
}

@media (max-width: 1280px) {
  .cycle-row {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .cycle-row {
    grid-template-columns: 1fr;
  }

  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>

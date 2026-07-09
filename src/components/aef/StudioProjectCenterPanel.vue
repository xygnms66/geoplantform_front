<script setup lang="ts">
import { computed, ref } from "vue";
import {
  projectBoardColumns,
  projectCycles,
  projectModules,
  projectProjects,
  projectSummary,
  projectViewTabs,
  workflowColumns,
} from "@/lib/aefStudioData";

const activeView = ref("看板");
const currentProject = ref(projectProjects[0]);
const showWorkflow = computed(() => activeView.value === "工作流");

function statusClass(status: string) {
  const map: Record<string, string> = {
    进行中: "status-running",
    待开始: "status-muted",
    待审核: "status-warning",
    已完成: "status-success",
  };
  return map[status] ?? "status-muted";
}

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
  <main class="studio-page">
    <section class="page-title-row">
      <div>
        <div class="title-box">项目中心</div>
        <div class="page-subtitle">
          参考 Plane 的 Project / Cycle / Module / Work Item 结构，支持任务拆解、分配、看板推进和交付物沉淀。
        </div>
      </div>
      <div class="action-row">
        <button class="primary-btn">+ 新建项目</button>
        <button class="secondary-btn">新建周期</button>
        <button class="secondary-btn">新建模块</button>
      </div>
    </section>

    <section class="project-summary-grid">
      <article v-for="item in projectSummary" :key="item.label" class="project-summary-card panel">
        <div class="summary-icon">{{ item.icon }}</div>
        <div>
          <div class="summary-number">{{ item.value }}</div>
          <div class="summary-label">{{ item.label }}</div>
          <div class="summary-desc">{{ item.desc }}</div>
        </div>
      </article>
    </section>

    <section class="project-tabs panel">
      <button
        v-for="tab in projectViewTabs"
        :key="tab"
        :class="{ active: activeView === tab }"
        type="button"
        @click="activeView = tab"
      >
        {{ tab }}
      </button>
    </section>

    <section class="project-layout">
      <aside class="project-sidebar panel">
        <div class="panel-inner">
          <div class="panel-header compact">
            <div>
              <h2 class="panel-title">项目列表</h2>
              <p class="panel-desc">Plane 风格 Workspace 项目入口</p>
            </div>
          </div>
          <div class="project-switch-list">
            <button
              v-for="project in projectProjects"
              :key="project.name"
              type="button"
              :class="['project-switch', { active: currentProject.name === project.name }]"
              @click="currentProject = project"
            >
              <div class="project-switch-top">
                <span class="project-dot" :style="{ background: project.color }"></span>
                <b>{{ project.name }}</b>
              </div>
              <span>{{ project.desc }}</span>
            </button>
          </div>

          <div class="module-section">
            <div class="module-title">模块 Modules</div>
            <div class="module-list">
              <div v-for="module in projectModules" :key="module.name" class="module-item">
                <div>
                  <b>{{ module.name }}</b>
                  <span>{{ module.count }} 个任务</span>
                </div>
                <i>{{ module.progress }}%</i>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <section class="project-main">
        <section class="panel project-hero-card">
          <div class="panel-inner project-hero-inner">
            <div>
              <div class="project-eyebrow">Current Project</div>
              <h2>{{ currentProject.name }}</h2>
              <p>{{ currentProject.longDesc }}</p>
              <div class="tag-line">
                <span v-for="tag in currentProject.tags" :key="tag" class="tag">{{ tag }}</span>
              </div>
            </div>
            <div class="project-health">
              <div class="health-card">
                <b>{{ currentProject.progress }}%</b><span>总体进度</span>
              </div>
              <div class="health-card">
                <b>{{ currentProject.done }}/{{ currentProject.total }}</b
                ><span>任务完成</span>
              </div>
              <div class="health-card">
                <b>{{ currentProject.risk }}</b
                ><span>风险等级</span>
              </div>
            </div>
          </div>
        </section>

        <template v-if="!showWorkflow">
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
                  <button class="secondary-btn compact">按状态</button>
                  <button class="secondary-btn compact">按负责人</button>
                  <button class="primary-btn compact">+ Work Item</button>
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

        <section v-else class="panel workflow-panel">
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
      </section>
    </section>
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
.project-switch,
.project-tabs button {
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
.cycle-time,
.cycle-meta,
.project-switch span:last-child,
.module-item span,
.project-hero-card p,
.workflow-column-hint,
.workflow-summary,
.workflow-footer {
  color: var(--muted);
  line-height: 1.6;
}

.project-summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.project-summary-card {
  min-height: 112px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px;
}

.summary-icon {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  color: #67e8f9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  background: rgba(56, 189, 248, 0.13);
}

.summary-number {
  color: #67e8f9;
  font-size: 32px;
  font-weight: 950;
}

.summary-label {
  font-weight: 900;
}

.summary-desc {
  margin-top: 4px;
  font-size: 12px;
}

.project-tabs {
  width: fit-content;
  display: flex;
  gap: 8px;
  padding: 8px;
}

.project-tabs button {
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  color: var(--muted);
  background: transparent;
  font-weight: 850;
}

.project-tabs button.active {
  color: #fff;
  background: rgba(59, 130, 246, 0.72);
}

.project-layout {
  display: grid;
  grid-template-columns: 285px minmax(0, 1fr);
  gap: 20px;
}

.project-sidebar {
  align-self: start;
  position: sticky;
  top: 78px;
}

.project-switch-list,
.module-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.project-switch {
  min-height: 78px;
  padding: 14px;
  border: 1px solid rgba(121, 167, 255, 0.13);
  border-radius: 16px;
  color: var(--text);
  text-align: left;
  background: rgba(2, 8, 21, 0.3);
}

.project-switch.active {
  border-color: rgba(103, 232, 249, 0.42);
  background: rgba(59, 130, 246, 0.18);
}

.project-switch-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.project-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  box-shadow: 0 0 14px currentColor;
}

.module-section {
  margin-top: 28px;
}

.module-title {
  margin-bottom: 12px;
  color: #c9d9eb;
  font-weight: 900;
}

.module-item {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 14px;
  background: rgba(2, 8, 21, 0.3);
}

.module-item b {
  display: block;
  color: #fff;
}

.module-item span {
  display: block;
  margin-top: 4px;
  font-size: 12px;
}

.module-item i {
  color: #67e8f9;
  font-style: normal;
  font-weight: 900;
}

.project-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.project-hero-inner {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 24px;
  align-items: center;
}

.project-eyebrow {
  color: #67e8f9;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.project-hero-card h2 {
  margin: 8px 0;
  font-size: 32px;
}

.tag-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 14px;
}

.tag,
.pill,
.status-pill,
.priority {
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

.project-health {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.health-card {
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  border: 1px solid rgba(121, 167, 255, 0.13);
  border-radius: 18px;
  background: rgba(2, 8, 21, 0.32);
}

.health-card b {
  color: #67e8f9;
  font-size: 28px;
}

.health-card span {
  margin-top: 6px;
  color: var(--muted);
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
.work-top,
.workflow-card-top,
.workflow-column-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.cycle-name,
.workflow-column-title,
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

.work-card h3,
.workflow-card-title {
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

.compact-tags {
  margin-top: 12px;
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

.workflow-column-title {
  font-size: 18px;
}

.workflow-column-hint {
  margin-top: 4px;
  font-size: 12px;
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

.workflow-summary {
  margin: 10px 0 0;
  font-size: 13px;
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
  .project-layout,
  .project-hero-inner {
    grid-template-columns: 1fr;
  }

  .project-sidebar {
    position: static;
  }

  .project-summary-grid,
  .cycle-row,
  .workflow-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-title-row {
    flex-direction: column;
  }

  .project-summary-grid,
  .cycle-row,
  .project-health,
  .workflow-board {
    grid-template-columns: 1fr;
  }

  .kanban-board {
    grid-template-columns: 1fr;
  }
}
</style>

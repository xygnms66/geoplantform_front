<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from "vue";
import { projectsPluginTabs } from "@/components/studio/plugins/projects/tabs";
import { useStudioPluginTabs } from "@/components/studio/shell/useStudioPluginTabs";
import { projectModules, projectProjects, projectSummary } from "@/lib/workbenchStudioData";

const { tabs, activeTab, activeView, setActiveTab } = useStudioPluginTabs(projectsPluginTabs, "board");
const currentProject = ref(projectProjects[0]);

const tabBarRef = ref<HTMLElement | null>(null);
const tabRefs = ref<HTMLElement[]>([]);
const indicatorStyle = ref({ width: "0px", transform: "translateX(0px)" });

function updateIndicator() {
  const idx = tabs.findIndex((t) => t.key === activeTab.value);
  const el = tabRefs.value[idx];
  if (!el || !tabBarRef.value) return;
  indicatorStyle.value = {
    width: `${el.offsetWidth}px`,
    transform: `translateX(${el.offsetLeft}px) translateY(-50%)`,
  };
}

watch(activeTab, () => nextTick(updateIndicator));
onMounted(() => nextTick(updateIndicator));
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
        <button class="primary-btn" type="button">+ 新建项目</button>
        <button class="secondary-btn" type="button">新建周期</button>
        <button class="secondary-btn" type="button">新建模块</button>
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

    <section class="project-tabs panel" ref="tabBarRef">
      <div
        class="tab-indicator"
        :style="indicatorStyle"
      />
      <button
        v-for="tab in tabs"
        :key="tab.key"
        ref="tabRefs"
        :class="{ active: activeTab === tab.key }"
        type="button"
        @click="setActiveTab(tab.key)"
      >
        {{ tab.label }}
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

        <component :is="activeView" v-if="activeView" />
        <div v-else class="empty-view">当前 Tab 未配置页面组件</div>
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
.project-switch span:last-child,
.module-item span,
.project-hero-card p {
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
  position: relative;
  width: fit-content;
  display: flex;
  gap: 2px;
  padding: 8px;
  isolation: isolate;
}

.tab-indicator {
  position: absolute;
  left: 0;
  top: 50%;
  height: 32px;
  border-radius: 20px;
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.35), rgba(37, 99, 235, 0.25));
  border: 1px solid rgba(14, 165, 233, 0.15);
  box-shadow:
    0 0 24px rgba(14, 165, 233, 0.10),
    inset 0 1px 0 rgba(255, 255, 255, 0.10);
  backdrop-filter: blur(8px);
  transition: all 0.38s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 0;
  pointer-events: none;
}

.project-tabs button {
  position: relative;
  z-index: 1;
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  color: var(--muted);
  background: transparent;
  font-weight: 850;
  transition: color 0.25s ease;
  animation: tabFadeIn 0.4s ease backwards;
}

.project-tabs button:nth-child(2) { animation-delay: 0.03s; }
.project-tabs button:nth-child(3) { animation-delay: 0.06s; }
.project-tabs button:nth-child(4) { animation-delay: 0.09s; }
.project-tabs button:nth-child(5) { animation-delay: 0.12s; }
.project-tabs button:nth-child(6) { animation-delay: 0.15s; }

.project-tabs button:hover {
  color: #bfd9ff;
}

.project-tabs button.active {
  color: #fff;
}

@keyframes tabFadeIn {
  from {
    opacity: 0;
    transform: translateY(-6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
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

.empty-view {
  min-height: 240px;
  display: grid;
  place-items: center;
  color: var(--muted);
  border: 1px dashed rgba(148, 163, 184, 0.24);
  border-radius: 18px;
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

.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  white-space: nowrap;
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

@media (max-width: 1280px) {
  .project-layout,
  .project-hero-inner {
    grid-template-columns: 1fr;
  }

  .project-sidebar {
    position: static;
  }

  .project-summary-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .page-title-row {
    flex-direction: column;
  }

  .project-summary-grid,
  .project-health {
    grid-template-columns: 1fr;
  }
}
</style>

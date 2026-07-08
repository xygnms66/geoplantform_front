<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { getAchievements, getProject, getProjects } from "@/lib/api";
import type { Achievement, Project } from "@/types";
import AchievementCard from "@/components/AchievementCard.vue";

const route = useRoute();
const project = ref<Project>();
const allProjects = ref<Project[]>([]);
const achievements = ref<Achievement[]>([]);

const metricEntries = computed(() =>
  Object.entries(project.value?.metrics ?? {}).map(([label, value]) => ({
    label,
    value: String(value),
  })),
);

const projectAchievements = computed(() =>
  achievements.value.filter((item) => item.project_id === project.value?.id),
);

onMounted(async () => {
  const slug = route.params.slug as string;
  const [projectDetail, projectList, achievementList] = await Promise.all([
    getProject(slug),
    getProjects(),
    getAchievements(),
  ]);

  project.value = projectDetail;
  allProjects.value = projectList;
  achievements.value = achievementList;
});
</script>

<template>
  <div v-if="project" class="project-detail-layout">
    <nav class="project-sidenav">
      <div class="project-sidenav-track">
        <div v-for="item in allProjects" :key="item.slug" class="project-sidenav-entry">
          <router-link :to="`/projects/${item.slug}`" :class="['project-sidenav-dot-wrap', { active: item.slug === project.slug }]">
            <div class="project-sidenav-dot" />
            <span class="project-sidenav-slug">{{ item.slug }}</span>
          </router-link>
        </div>
      </div>
    </nav>

    <div class="project-detail-content">
      <section class="section hero-card project-hero">
        <div class="eyebrow">Project / {{ project.slug }}</div>
        <h1>{{ project.name }}</h1>
        <p>{{ project.description }}</p>
        <div class="badges">
          <span v-for="tag in project.tags" :key="tag" class="badge">{{ tag }}</span>
        </div>
      </section>

      <section v-if="metricEntries.length > 0" class="section">
        <div class="section-head">
          <div>
            <h2>核心指标</h2>
            <p class="lead">保留原项目页的关键信息密度，用统一卡片展示当前项目的基础指标。</p>
          </div>
        </div>
        <div class="kv">
          <div v-for="item in metricEntries" :key="item.label">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
          </div>
        </div>
      </section>

      <section class="section grid-2">
        <div class="panel">
          <h2>当前进度</h2>
          <p class="lead">{{ project.achieve || project.stage || "当前项目正在稳步推进，相关阶段信息会持续同步到平台。" }}</p>
          <div class="badges">
            <span class="badge green">{{ project.status }}</span>
            <span v-if="project.owner" class="badge">{{ project.owner }}</span>
          </div>
        </div>
        <div class="panel">
          <h2>下一阶段</h2>
          <p class="lead">{{ project.next_stage || "后续阶段规划将在项目推进过程中持续补充。" }}</p>
        </div>
      </section>

      <section class="section">
        <div class="content-block">
          <h2>项目说明</h2>
          <p>{{ project.subtitle || project.description }}</p>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div>
            <h2>项目成果</h2>
            <p class="lead">展示该项目已经沉淀的报告、模型、数据说明与 Demo。</p>
          </div>
          <router-link class="button" to="/achievements">全部成果</router-link>
        </div>
        <div v-if="projectAchievements.length > 0" class="grid-3">
          <AchievementCard v-for="item in projectAchievements" :key="item.id" :item="item" :project="project" />
        </div>
        <div v-else class="panel">
          <h3>暂无关联成果</h3>
          <p>当前项目的成果条目还在整理中，后续会同步到这里。</p>
        </div>
      </section>

      <div class="footer-note">{{ project.name }} · 静态详情页</div>
    </div>
  </div>
</template>
